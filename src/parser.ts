import { readFileSync } from "fs"
import { createSourceFile, isEnumDeclaration, isImportDeclaration, isLiteralTypeNode, isTypeAliasDeclaration, ScriptTarget } from "typescript"
import { FileManager } from "./utils/FileManager"
import { ArrayType } from "./models/ArrayType"
import { ArrayTypeDeclaration } from "./models/ArrayTypeDeclaration"
import { Import } from "./models/Import"
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
		const lp = [`<parseFile>`, path]
		const content = readFileSync(path, "utf-8")
		const file = createSourceFile("e", content, ScriptTarget.ESNext)
		L.d(...lp, `statements.length: ${file.statements.length}`)

		file.statements.forEach((statement) => {
			L.d(...lp, `statement: ${statement.kind}`)
			if (isImportDeclaration(statement)) {
				this.importManager.add(importFactory(statement, path))
			}

			if (isLiteralTypeNode(statement)) {
			}

			if (isEnumDeclaration(statement)) {
				const declaration = DeclarationFactory.createEnumDeclaration(statement)
				// TODO refactor probably...
				L.d(...lp, "enum", "push declaration", declaration.toString())
				this.fileManager.addTypeDeclarationToFile(path, declaration)
				return this.declarations.push(declaration)
			}

			if (isTypeAliasDeclaration(statement)) {
				const declaration = DeclarationFactory.createTypeDeclaration(statement)
				// TODO refactor probably...
				L.d(...lp, "typeAliasDeclaration", "push declaration", declaration.toString())
				return this.declarations.push(declaration)
			}
		})
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
		const path = imported.resolve()
		this.parseFile(path)
		this.importManager.remove(imported)
	}

	private isTypeResolved(type: Type): type is Type {
		const lp = [`<isTypeResolved>`, type.toString()]
		L.d(...lp)

		if (type instanceof TypeReference && !type.isPrimitive() && !this.config.doNotResolve.includes(type.identifier)) {
			L.d(...lp, "it's a type reference and not primitive, return false")
			return false
		}

		if (type instanceof TypeLiteral) {
			L.d(...lp, "it's a type literal, checking all properties")
			return !Array.from(type.properties.values()).some((property) => !this.isTypeResolved(property))
		}

		if (type instanceof UnionType) {
			L.d(...lp, "it's a union type, checking all types")
			return !type.types.some((type) => !this.isTypeResolved(type))
		}

		if (type instanceof IntersectionType) {
			L.d(...lp, "it's an intersection type, checking all types")
			return !type.types.some((type) => !this.isTypeResolved(type))
		}

		if (type instanceof ArrayType) {
			L.d(...lp, "it's an array type, checking type of the Array")
			return this.isTypeResolved(type.arrayType)
		}

		// TODO maybe explicitly use the instaceof of other types here, to prevent
		// false positive fallthroughs here

		return true
	}

	public resolve(name: string) {
		L.d(`<resolve>`, name)

		const declaration = this.declarations.find((type) => type.identifier === name)

		if (!declaration) {
			throw new Error(
				`Could not find any type declaration with the name: ${name}. Available type declarations are: ${this.declarations
					.map((type) => type.identifier)
					.join(" ,")}.`
			)
		}

		if (isInstanceOfUnresolvedClass(declaration)) {
			return this.createResolvedTypeDeclaration(declaration, this.resolveType(declaration.type))
		}

		throw new Error(`Could not resolve declaration for: ${declaration.identifier}.`)
	}

	private resolveType(type: TypeReference | UnionType | TypeLiteral | ArrayType | IntersectionType): Type {
		L.d(`<resolveType> ${type.toString()}`)
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

	private resolveTypeReference(type: TypeReference): Type {
		const lp = [`<resolveTypeReference>`, type.toString()]
		L.d(...lp)

		if (type.isPrimitive()) {
			L.d(...lp, "it's a primitive")
			return type
		}

		if (this.config.doNotResolve.includes(type.identifier)) {
			L.d(...lp, "the identifier is part of the doNotResolve configuration")
			return type
		}

		const possibleLocalResolvedType = this.getDeclaration(type.identifier)

		if (possibleLocalResolvedType) {
			L.d(...lp, "it's already in the types")
			if (this.isTypeResolved(possibleLocalResolvedType.type)) {
				L.d(...lp, "it's resolved")
				return possibleLocalResolvedType.type
			} else {
				L.d(...lp, "it's not resolved")
				return this.resolveType(possibleLocalResolvedType.type)
			}
		}

		const possibleImport = this.importManager.get(type.identifier)

		if (possibleImport) {
			try {
				L.d(...lp, "it's a possible import")
				this.resolveImport(possibleImport)
			} catch (e) {
				if (this.config.breakOnUnresolvedImports) {
					throw e
				} else {
					L.d(
						...lp,
						`was not possible to resolve the import ${possibleImport.toString()}. Returning UnknownType because the config options breakOnUnresolvedImports is false.`,
						e
					)
					return new UnknownType()
				}
			}

			return this.resolveTypeReference(type)
		}

		throw new Error(`Could not resolve type: ${type.identifier}`)
	}

	private resolveUnionType<T extends UnionType | IntersectionType>(type: T): T {
		L.d(`<resolveUnionType>`, type.toString())
		const types = type.types

		type.types = types.map((type) => {
			if (this.isTypeResolved(type)) {
				return type
			}

			return this.resolveType(type)
		})

		return type
	}

	private resolveTypeLiteral(type: TypeLiteral): TypeLiteral {
		L.d(`<resolveTypeLiteral>`, type.toString())
		const keys = type.properties.keys()

		for (const key of keys) {
			const propertyTyp: Type = type.properties.get(key) as Type

			if (!this.isTypeResolved(propertyTyp)) {
				L.d(`<resolveTypeLiteral>`, `property: ${propertyTyp} is not resolved.`)
				const resolvedType = this.resolveType(propertyTyp)
				type.properties.set(key, resolvedType)
			}
		}

		return type
	}

	private resolveArrayType(type: ArrayType): ArrayType {
		L.d(`<resolveArrayType>`, type.toString())
		if (this.isTypeResolved(type.arrayType)) {
			return type
		} else {
			const resolvedType = this.resolveType(type.arrayType)
			// TODO would be better to involve a new ArrayType here
			type.arrayType = resolvedType
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
