import { readFileSync } from "fs"
import {
	createSourceFile,
	isEnumDeclaration,
	isExportDeclaration,
	isImportDeclaration,
	isLiteralTypeNode,
	isNamedExports,
	isStringLiteralLike,
	isTypeAliasDeclaration,
	ScriptTarget,
} from "typescript"
import { FileManager } from "./utils/FileManager"
import { ArrayType } from "./models/ArrayType"
import { ArrayTypeDeclaration } from "./models/ArrayTypeDeclaration"
import { Import } from "./utils/imports/model"
import { IntersectionType } from "./models/IntersectionType"
import { IntersectionTypeDeclaration } from "./models/IntersectionTypeDeclaration"
import { StringType } from "./models/StringType"
import { StringTypeDeclaration } from "./models/StringTypeDeclaration"
import { Type } from "./models/Type"
import { TypeDeclaration } from "./models/TypeDeclaration"
import { TypeLiteral } from "./models/TypeLiteral"
import { TypeLiteralDeclaration } from "./models/TypeLiteralDeclaration"
import { TypeReference } from "./models/TypeReference"
import { TypeReferenceDeclaration } from "./models/TypeReferenceDeclaration"
import { UnionType } from "./models/UnionType"
import { UnionTypeDeclaration } from "./models/UnionTypeDeclaration"
import { UnknownType } from "./models/UnknownType"
import { DeclarationFactory } from "./utils/DeclarationFactory"
import { importFactory } from "./utils/imports/factory"
import { L } from "./utils/logger"
import { ImportManager } from "./utils/imports/manager"
import { printSyntaxKind } from "./utils/printSyntaxKind"
import { resolve } from "path"
import { getTsFilePath } from "./utils/getTsFilePath"

type ParserConfig = {
	breakOnUnresolvedImports?: boolean
	unknownTypeForUnresolved?: boolean

	/**
	 * Defines if imports from libraries, that are located in the node_modules directory, should be resolved.
	 */
	resolveLibraries?: boolean

	/**
	 * Identifier that should not be resolved.
	 *
	 * Example:
	 *
	 * ```ts
	 * type DateString = string
	 * type ListOfDates = Array<DateString>
	 * ```
	 *
	 * would normally:
	 *
	 * ```ts
	 * resolve("ListOfDates") // into type ListOfDates = Array<string>
	 * ```
	 *
	 * However, if `"DateString"` is added to this property, it will:
	 *
	 * ```ts
	 * resolve("ListOfDates") // into type ListOfDates = Array<DateString>
	 * ```
	 */
	doNotResolve?: Array<string>
}

const DEFAULT_CONFIG: Required<ParserConfig> = {
	breakOnUnresolvedImports: true,
	unknownTypeForUnresolved: false,
	resolveLibraries: false,
	doNotResolve: [],
}

// TODO allow custom fileResolver for things like VS Code extensions
export class Parser {
	private declarations: Array<TypeDeclaration> = []
	private config: Required<ParserConfig>

	private fileManager = new FileManager()
	private importManager = new ImportManager()

	constructor(path: string, config: ParserConfig = {}) {
		this.config = {
			...DEFAULT_CONFIG,
			...config,
		}

		this.parseFile(path)
	}

	private parseFile(path: string) {
		L.enter(`parseFile(path: ${path})`)

		const content = readFileSync(path, "utf-8")
		const file = createSourceFile("e", content, ScriptTarget.ESNext)
		L.d(`statements.length: ${file.statements.length}`)

		file.statements.forEach((statement) => {
			L.d(`statement: ${printSyntaxKind(statement.kind)}`)

			if (isImportDeclaration(statement)) {
				this.importManager.add(importFactory(statement, path))
			}

			if (isExportDeclaration(statement)) {
				// maybe an export manager
				// that checks named exports first and later does * exports

				// means export * from ...
				if (!statement.exportClause) {
					if (statement.moduleSpecifier && isStringLiteralLike(statement.moduleSpecifier)) {
						const p = getTsFilePath(resolve(path, "..", statement.moduleSpecifier.text))
						if (p !== null) {
							L.d("found file that has * export", p)
							this.parseFile(p)
						} else {
							L.d("could not find file that was used in * export in: ", p)
						}
					}
				} else if (isNamedExports(statement.exportClause)) {
					if (statement.moduleSpecifier && isStringLiteralLike(statement.moduleSpecifier)) {
						const ms = statement.moduleSpecifier.text
						statement.exportClause.elements.forEach((element) => {
							const i = new Import(path, ms, [element.name.text], null)
							this.importManager.add(i)
						})
					}
				}
			}

			if (isLiteralTypeNode(statement)) {
			}

			if (isEnumDeclaration(statement)) {
				const declaration = DeclarationFactory.createEnumDeclaration(statement)
				// TODO refactor probably...
				L.d("enum", "push declaration", declaration.toString())
				this.fileManager.addTypeDeclarationToFile(path, declaration)
				return this.declarations.push(declaration)
			}

			if (isTypeAliasDeclaration(statement)) {
				const declaration = DeclarationFactory.createTypeDeclaration(statement)
				// TODO refactor probably...
				L.d("typeAliasDeclaration", "push declaration", declaration.toString())
				return this.declarations.push(declaration)
			}
		})

		L.exit()
	}

	public getDeclarations(): Array<TypeDeclaration> {
		return this.declarations
	}

	public getSourcePathOf(declaration: TypeDeclaration) {
		return this.fileManager.getFilePathOf(declaration)
	}

	public getDeclaration(name: string) {
		return this.declarations.find((type) => type.identifier === name)
	}

	/**
	 * Checks if a the requested type exists and is resolved.
	 */
	public isResolved(identifier: string): boolean {
		const declaration = this.getDeclaration(identifier)

		if (declaration) {
			return this.isTypeResolved(declaration.type)
		}

		return false
	}

	// TODO split this up into:
	// - resolve import return string path
	// - remove import
	// - parse
	private resolveImport(imported: Import) {
		const path = this.importManager.resolve(imported)
		this.parseFile(path)
		this.importManager.remove(imported)
	}

	private isTypeResolved(type: Type): type is Type {
		L.enter(`Parser.isTypeResolved(${type.toString()})`)

		if (type instanceof TypeReference && !type.isPrimitive() && !this.config.doNotResolve.includes(type.identifier)) {
			L.d("it's a type reference and not primitive, return false")
			L.exit()
			return false
		}

		if (type instanceof TypeLiteral) {
			L.d("it's a type literal, checking all properties")
			L.exit()
			return !Array.from(type.properties.values()).some((property) => !this.isTypeResolved(property))
		}

		if (type instanceof UnionType) {
			L.d("it's a union type, checking all types")
			L.exit()
			return !type.types.some((type) => !this.isTypeResolved(type))
		}

		if (type instanceof IntersectionType) {
			L.d("it's an intersection type, checking all types")
			L.exit()
			return !type.types.some((type) => !this.isTypeResolved(type))
		}

		if (type instanceof ArrayType) {
			L.d("it's an array type, checking type of the Array")
			L.exit()
			return this.isTypeResolved(type.arrayType)
		}

		// TODO maybe explicitly use the instaceof of other types here, to prevent
		// false positive fallthroughs here

		L.exit()
		return true
	}

	public resolve(name: string) {
		L.enter(`${Parser.name}.resolve("${name}")`)

		const declaration = this.declarations.find((type) => type.identifier === name)

		if (!declaration) {
			L.exit()
			throw new Error(
				`Could not find any type declaration with the name: ${name}. Available type declarations are: ${this.declarations
					.map((type) => type.identifier)
					.join(" ,")}.`
			)
		}

		if (isInstanceOfUnresolvedClass(declaration)) {
			L.exit()
			return this.createResolvedTypeDeclaration(declaration, this.resolveType(declaration.type))
		}

		L.exit()
		throw new Error(`Could not resolve declaration for: ${declaration.identifier}.`)
	}

	private resolveType(type: TypeReference | UnionType | TypeLiteral | ArrayType | IntersectionType): Type {
		L.enter(`Parser.resolveType(${type.toString()})`)

		const execute = () => {
			if (type instanceof TypeReference) {
				return this.resolveTypeReference(type)
			} else if (type instanceof UnionType) {
				return this.resolveUnionType(type)
			} else if (type instanceof IntersectionType) {
				return this.resolveUnionType(type)
			} else if (type instanceof TypeLiteral) {
				return this.resolveTypeLiteral(type)
			} else if (type instanceof ArrayType) {
				return this.resolveArrayType(type)
			} else {
				throw new Error(`Type resolving for type ${type} is not implemented.`)
			}
		}

		const result = execute()
		L.exit()
		return result
	}

	private resolveTypeReference(type: TypeReference): Type {
		L.enter(`${Parser.name}.resolveTypeReference(${type.toString()})`)

		if (type.isPrimitive()) {
			L.d("it's a primitive")
			L.exit()
			return type
		}

		if (this.config.doNotResolve.includes(type.identifier)) {
			L.d("the identifier is part of the doNotResolve configuration")
			L.exit()
			return type
		}

		const possibleLocalResolvedType = this.getDeclaration(type.identifier)

		if (possibleLocalResolvedType) {
			L.d("it's already in the types")
			if (this.isTypeResolved(possibleLocalResolvedType.type)) {
				L.d("it's resolved")
				L.exit()
				return possibleLocalResolvedType.type
			} else {
				L.d("it's not resolved")
				L.exit()
				return this.resolveType(possibleLocalResolvedType.type)
			}
		}

		const possibleImport = this.importManager.get(type.identifier)

		if (possibleImport) {
			try {
				L.d("it's a possible import")
				this.resolveImport(possibleImport)
			} catch (e) {
				if (this.config.breakOnUnresolvedImports) {
					L.exit()
					throw e
				} else {
					L.d(e)
					L.exit()
					return new UnknownType()
				}
			}

			L.exit()
			return this.resolveTypeReference(type)
		}

		throw new Error(`Could not resolve type: ${type.identifier}`)
	}

	private resolveUnionType<T extends UnionType | IntersectionType>(type: T): T {
		L.enter(`resolveUnionType(${type.toString()})`)
		const types = type.types

		type.types = types.map((type) => {
			if (this.isTypeResolved(type)) {
				L.exit()
				return type
			}

			L.exit()
			return this.resolveType(type)
		})

		L.exit()
		return type
	}

	private resolveTypeLiteral(type: TypeLiteral): TypeLiteral {
		L.enter(`resolveTypeLiteral(${type.toString()})`)
		const keys = type.properties.keys()

		for (const key of keys) {
			const propertyTyp: Type = type.properties.get(key) as Type

			if (!this.isTypeResolved(propertyTyp)) {
				L.d(`property: ${propertyTyp} is not resolved.`)
				const resolvedType = this.resolveType(propertyTyp)
				type.properties.set(key, resolvedType)
			}
		}

		L.exit()
		return type
	}

	private resolveArrayType(type: ArrayType): ArrayType {
		L.enter(`resolveArrayType(${type.toString()})`)

		if (this.isTypeResolved(type.arrayType)) {
			L.exit()
			return type
		} else {
			const resolvedType = this.resolveType(type.arrayType)
			// TODO would be better to involve a new ArrayType here
			type.arrayType = resolvedType

			L.exit()
			return type
		}
	}

	private createResolvedTypeDeclaration(declaration: TypeDeclaration, resolvedType: Type) {
		if (resolvedType instanceof StringType) {
			return new StringTypeDeclaration(declaration.getMeta())
		}

		if (resolvedType instanceof ArrayType) {
			// TODO ...
			declaration.type = resolvedType
			return declaration
		}

		if (resolvedType instanceof TypeLiteral) {
			// TODO remove the typescript node from the TypeLiteral class to prevent this
			declaration.type = resolvedType
			return declaration
		}

		if (resolvedType instanceof TypeReference && this.config.doNotResolve.includes(resolvedType.identifier)) {
			declaration.type = resolvedType
			return declaration
		}

		if (resolvedType instanceof UnionType) {
			// TODO remove the typescript node from the TypeLiteral class to prevent this
			declaration.type = resolvedType
			return declaration
		}

		if (resolvedType instanceof IntersectionType) {
			// TODO remove the typescript node from the TypeLiteral class to prevent this
			declaration.type = resolvedType
			return declaration
		}

		if (resolvedType instanceof UnknownType) {
			// TODO remove the typescript node from the TypeLiteral class to prevent this
			declaration.type = resolvedType
			return declaration
		}

		throw new Error(`Missing implementation for ${resolvedType}`)
	}
}

// refactor with intellij into DeclarationFactory
export type DeclarationMeta = {
	identifier: string
	exported: boolean
	default: boolean
}

const POSSIBLY_URESOLVED_DECLARATION = [
	TypeReferenceDeclaration,
	UnionTypeDeclaration,
	TypeLiteralDeclaration,
	ArrayTypeDeclaration,
	IntersectionTypeDeclaration,
]

type PossiblyUnresolvedDeclaration =
	| TypeReferenceDeclaration
	| UnionTypeDeclaration
	| TypeLiteralDeclaration
	| ArrayTypeDeclaration
	| IntersectionTypeDeclaration

function isInstanceOfUnresolvedClass(value: unknown): value is PossiblyUnresolvedDeclaration {
	return POSSIBLY_URESOLVED_DECLARATION.some((clazz) => value instanceof clazz)
}
