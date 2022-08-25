import { existsSync, readFileSync } from "fs";
import { parse, resolve } from "path";
import {
	createSourceFile,
	EnumDeclaration,
	EnumMember,
	Identifier,
	isArrayTypeNode,
	isEnumDeclaration,
	isIdentifier,
	isImportDeclaration,
	isIntersectionTypeNode,
	isLiteralTypeNode,
	isStringLiteral,
	isTypeAliasDeclaration,
	isTypeLiteralNode,
	isTypeReferenceNode,
	isUnionTypeNode,
	Node,
	PropertyName,
	ScriptTarget,
	TypeAliasDeclaration,
	TypeNode,
} from "typescript";
import { ArrayType } from "./models/ArrayType";
import { ArrayTypeDeclaration } from "./models/ArrayTypeDeclaration";
import { BooleanType } from "./models/BooleanType";
import { EnumMembers } from "./models/EnumType";
import { EnumTypeDeclaration } from "./models/EnumTypeDeclaration";
import { Import } from "./models/Import";
import { IntersectionType } from "./models/IntersectionType";
import { IntersectionTypeDeclaration } from "./models/IntersectionTypeDeclaration";
import { LiteralType } from "./models/LiteralType";
import { LiteralTypeDeclaration } from "./models/LiteralTypeDeclaration";
import { NumberType } from "./models/NumberType";
import { NumberTypeDeclaration } from "./models/NumberTypeDeclaration";
import { StringType } from "./models/StringType";
import { StringTypeDeclaration } from "./models/StringTypeDeclaration";
import { TypeDeclaration } from "./models/TypeDeclaration";
import { TypeLiteral } from "./models/TypeLiteral";
import { TypeLiteralDeclaration } from "./models/TypeLiteralDeclaration";
import { TypeReference } from "./models/TypeReference";
import { TypeReferenceDeclaration } from "./models/TypeReferenceDeclaration";
import { UnionType } from "./models/UnionType";
import { UnionTypeDeclaration } from "./models/UnionTypeDeclaration";
import { UnknownType } from "./models/UnknownType";
import { importFactory } from "./utils/importFactory";
import { isBooleanKeywordTypeNode } from "./utils/isBooleanKeywordTypeNode";
import { isDefaultModifier } from "./utils/isDefaultModifier";
import { isExportModifier } from "./utils/isExportModifier";
import { isNumberKeywordTypeNode } from "./utils/isNumberKeywordTypeNode";
import { isStringKeywordTypeNode } from "./utils/isStringKeywordTypeNode";
import { L } from "./utils/logger";

// TODO allow custom fileResolver for things like VS Code extensions
export class Parser {
	private imports: Array<Import> = [];
	private types: Array<TypeDeclaration> = [];
	private config = {
		breakOnUnresolvedImports: false,
		unknownTypeForUnresolved: false,
	};

	constructor(path: string) {
		this.parseFile(path);
	}

	private parseFile(path: string) {
		const content = readFileSync(path, "utf-8");
		const file = createSourceFile("e", content, ScriptTarget.ESNext);
		L.d(`<parseFile>`, `statements.length: ${file.statements.length}`);

		file.statements.forEach((statement) => {
			L.d(`<parseFile>`, `statement: ${statement.kind}`);
			if (isImportDeclaration(statement)) {
				this.imports.push(importFactory(statement, path));
			}

			if (isLiteralTypeNode(statement)) {
			}

			if (isEnumDeclaration(statement)) {
				const declaration = DeclarationFactory.createEnumDeclaration(statement);
				// TODO refactor probably...
				L.d(`<parserFile>`, "push declaration", declaration.toString());
				return this.types.push(declaration);
			}
			
			if (isTypeAliasDeclaration(statement)) {
				const declaration = DeclarationFactory.createTypeDeclaration(statement);
				// TODO refactor probably...
				L.d(`<parserFile>`, "push declaration", declaration.toString());
				return this.types.push(declaration);
			}
		});
	}

	getTypeDeclaration(name: string) {
		return this.types.find((type) => type.identifier === name);
	}

	getImport(name: string) {
		return this.imports.find(
			(imported) => imported.default === name || imported.named.includes(name)
		);
	}

	// TODO split this up into:
	// - resolve import return string path
	// - remove import
	// - parse
	private resolveImport(imported: Import) {
		L.d(`<resolveImport>`, imported.named, imported.source, imported.from);

		const { dir } = parse(imported.source);
		const pathToFile = resolve(dir, imported.from);
		const tsPath = `${pathToFile}.ts`;
		const tsxPath = `${pathToFile}.tsx`;

		L.d(`<resolveImport>`, `trying if exists: ${tsPath}`);

		if (existsSync(tsPath)) {
			L.d(`<resolveImport>`, `path exists: ${tsPath}`);
			this.parseFile(tsPath);
			this.imports.splice(this.imports.indexOf(imported), 1);
			return;
		}

		if (existsSync(tsxPath)) {
			this.parseFile(tsxPath);
			this.imports.splice(this.imports.indexOf(imported), 1);
			return;
		}

		// TODO node_modules
		// TODO @types

		throw new Error(`Could not resolve import: ${imported.from}`);
	}

	/**
	 * Checks if a the requested type exists and is resolved.
	 */
	public isResolved(identifier: string): boolean {
		const declaration = this.getTypeDeclaration(identifier);

		if (declaration) {
			return this.isTypeResolved(declaration.type);
		}

		return false;
	}

	private isTypeResolved(type: Types): type is ResolvedType {
		L.d(`<isTypeResolved>`, type.toString());

		if (type instanceof TypeReference && !type.isPrimitive()) {
			L.d(
				`<isTypeResolved>`,
				"it's a type reference and not primitive, return false"
			);
			return false;
		}

		if (type instanceof TypeLiteral) {
			L.d(`<isTypeResolved>`, "it's a type literal, checking all properties");
			return !Array.from(type.properties.values()).some(
				(property) => !this.isTypeResolved(property)
			);
		}

		if (type instanceof UnionType) {
			L.d(`<isTypeResolved>`, "it's a union type, checking all types");
			return !type.types.some((type) => !this.isTypeResolved(type));
		}

		if (type instanceof IntersectionType) {
			L.d(`<isTypeResolved>`, "it's an intersection type, checking all types");
			return !type.types.some((type) => !this.isTypeResolved(type));
		}

		if (type instanceof ArrayType) {
			L.d(`<isTypeResolved>`, "it's an array type, checking type of the Array");
			return this.isTypeResolved(type.arrayType);
		}

		// TODO maybe explicitly use the instaceof of other types here, to prevent
		// false positive fallthroughs here

		return true;
	}

	public resolve(name: string) {
		L.d(`<resolve>`, name);

		const declaration = this.types.find((type) => type.identifier === name);

		if (!declaration) {
			throw new Error(
				`Could not find any type declaration with the name: ${name}. Available type declarations are: ${this.types
					.map((type) => type.identifier)
					.join(" ,")}.`
			);
		}

		if (isInstanceOfUnresolvedClass(declaration)) {
			return createResolvedTypeDeclaration(
				declaration,
				this.resolveType(declaration.type)
			);
		}

		throw new Error(
			`Could not resolve declaration for: ${declaration.identifier}.`
		);
	}

	private resolveType(
		type: TypeReference | UnionType | TypeLiteral | ArrayType | IntersectionType
	): ResolvedType {
		L.d(`<resolveType> ${type.toString()}`);
		if (type instanceof TypeReference) {
			return this.resolveTypeReference(type);
		} else if (type instanceof UnionType) {
			return this.resolveUnionType(type);
		} else if (type instanceof IntersectionType) {
			return this.resolveUnionType(type);
		} else if (type instanceof TypeLiteral) {
			return this.resolveTypeLiteral(type);
		} else if (type instanceof ArrayType) {
			return this.resolveArrayType(type);
		} else {
			throw new Error(`Type resolving for type ${type} is not implemented.`);
		}
	}

	private resolveTypeReference(type: TypeReference): ResolvedType {
		const lp = [`<resolveTypeReference>`, type.toString()];
		L.d(...lp);

		if (type.isPrimitive()) {
			L.d(...lp, "it's a primitive");
			return type;
		}

		const possibleLocalResolvedType = this.getTypeDeclaration(type.identifier);

		if (possibleLocalResolvedType) {
			L.d(...lp, "it's already in the types");
			if (this.isTypeResolved(possibleLocalResolvedType.type)) {
				L.d(...lp, "it's resolved");
				return possibleLocalResolvedType.type;
			} else {
				L.d(...lp, "it's not resolved");
				return this.resolveType(possibleLocalResolvedType.type);
			}
		}

		const possibleImport = this.getImport(type.identifier);

		if (possibleImport) {
			try {
				L.d(...lp, "it's a possible import");
				this.resolveImport(possibleImport);
			} catch (e) {
				if (this.config.breakOnUnresolvedImports) {
					throw e;
				} else {
					L.d(
						...lp,
						`was not possible to resolve the import ${possibleImport.from}. Returning UnknownType because the config options breakOnUnresolvedImports is false.`,
						e
					);
					return new UnknownType();
				}
			}

			return this.resolveTypeReference(type);
		}

		throw new Error(`Could not resolve type: ${type.identifier}`);
	}

	private resolveUnionType<T extends UnionType | IntersectionType>(type: T): T {
		L.d(`<resolveUnionType>`, type.toString());
		const types = type.types;

		type.types = types.map((type) => {
			if (this.isTypeResolved(type)) {
				return type;
			}

			return this.resolveType(type);
		});

		return type;
	}

	private resolveTypeLiteral(type: TypeLiteral): TypeLiteral {
		L.d(`<resolveTypeLiteral>`, type.toString());
		const keys = type.properties.keys();

		for (const key of keys) {
			const propertyTyp: Types = type.properties.get(key) as Types;

			if (!this.isTypeResolved(propertyTyp)) {
				L.d(
					`<resolveTypeLiteral>`,
					`property: ${propertyTyp} is not resolved.`
				);
				const resolvedType = this.resolveType(propertyTyp);
				type.properties.set(key, resolvedType);
			}
		}

		return type;
	}

	private resolveArrayType(type: ArrayType): ArrayType {
		L.d(`<resolveArrayType>`, type.toString());
		if (this.isTypeResolved(type.arrayType)) {
			return type;
		} else {
			const resolvedType = this.resolveType(type.arrayType);
			// TODO would be better to involve a new ArrayType here
			type.arrayType = resolvedType;
			return type;
		}
	}
}

function createResolvedTypeDeclaration(
	declaration: TypeDeclaration,
	resolvedType: ResolvedType
) {
	if (resolvedType instanceof StringType) {
		return new StringTypeDeclaration(declaration.getMeta());
	}

	if (resolvedType instanceof ArrayType) {
		// TODO ...
		declaration.type = resolvedType;
		return declaration;
	}

	if (resolvedType instanceof TypeLiteral) {
		// TODO remove the typescript node from the TypeLiteral class to prevent this
		declaration.type = resolvedType;
		return declaration;
	}

	if (resolvedType instanceof UnionType) {
		// TODO remove the typescript node from the TypeLiteral class to prevent this
		declaration.type = resolvedType;
		return declaration;
	}

	if (resolvedType instanceof IntersectionType) {
		// TODO remove the typescript node from the TypeLiteral class to prevent this
		declaration.type = resolvedType;
		return declaration;
	}

	throw new Error(`Missing implementation for ${resolvedType}`);
}

export type DeclarationMeta = {
	identifier: string;
	exported: boolean;
	default: boolean;
};

// TODO move out
class DeclarationFactory {
	public static createEnumDeclaration(statement: EnumDeclaration) {

		function getName(node: { name: Identifier | PropertyName }) {
			if (isIdentifier(node.name)) {
				return node.name.text
			}
			return ""
		}

		const members: EnumMembers = new Map()

		statement.members.forEach((member: EnumMember) => {
			const name = getName(member)

			if (member.initializer && isStringLiteral(member.initializer)) {
				members.set(name, member.initializer.text)
				return
			}

			throw new Error(`Could not resolve the values of the member ${name} in enum ${statement.name.escapedText as string}.`)
		})

		return new EnumTypeDeclaration(DeclarationFactory.createMeta(statement), members)
	}

	public static createTypeDeclaration(statement: TypeAliasDeclaration) {
		L.d(
			`<TypeAliasDeclarationFactory.create>`,
			statement.kind,
			statement.type.kind
		);

		const meta: DeclarationMeta =
			DeclarationFactory.createMeta(statement);

		if (isLiteralTypeNode(statement.type)) {
			return new LiteralTypeDeclaration(meta, statement.type);
		}

		if (isUnionTypeNode(statement.type)) {
			return new UnionTypeDeclaration(meta, statement.type);
		}

		if (isIntersectionTypeNode(statement.type)) {
			return new IntersectionTypeDeclaration(meta, statement.type);
		}

		if (isStringKeywordTypeNode(statement.type)) {
			return new StringTypeDeclaration(meta);
		}

		if (isNumberKeywordTypeNode(statement.type)) {
			return new NumberTypeDeclaration(meta);
		}

		if (isArrayTypeNode(statement.type)) {
			return new ArrayTypeDeclaration(meta, statement.type);
		}

		if (isTypeReferenceNode(statement.type)) {
			if (
				isIdentifier(statement.type.typeName) &&
				statement.type.typeName.text === "Array"
			) {
				return new ArrayTypeDeclaration(meta, statement.type);
			}

			return new TypeReferenceDeclaration(meta, statement.type);
		}

		if (isTypeLiteralNode(statement.type)) {
			return new TypeLiteralDeclaration(meta, statement.type);
		}

		throw new Error(`Unknown TypeNode kind: ${statement.type.kind}`);
	}

	public static createMeta(
		statement: TypeAliasDeclaration | EnumDeclaration
	): DeclarationMeta {
		return {
			identifier: statement.name.escapedText as string,
			exported: statement.modifiers?.some(isExportModifier) ?? false,
			default: statement.modifiers?.some(isDefaultModifier) ?? false,
		};
	}
}

export function typeFactory(node: TypeNode) {
	L.d(`<typeFactory>`, node.kind);

	if (isArrayTypeNode(node)) {
		return new ArrayType(node);
	}

	if (isLiteralTypeNode(node)) {
		return new LiteralType(node);
	}

	if (isUnionTypeNode(node)) {
		return new UnionType(node);
	}

	if (isIntersectionTypeNode(node)) {
		return new IntersectionType(node);
	}

	if (isStringKeywordTypeNode(node)) {
		return new StringType();
	}

	if (isNumberKeywordTypeNode(node)) {
		return new NumberType();
	}

	if (isTypeReferenceNode(node)) {
		if (isIdentifier(node.typeName) && node.typeName.text === "Array") {
			return new ArrayType(node);
		}

		return new TypeReference(node);
	}

	if (isTypeLiteralNode(node)) {
		return new TypeLiteral(node);
	}

	if (isBooleanKeywordTypeNode(node)) {
		return new BooleanType()
	}

	throw new Error(`Unknown TypeNode kind: ${node.kind}`);
}

export type Types =
	| LiteralType
	| UnionType
	| IntersectionType
	| ArrayType
	| StringType
	| TypeReference
	| TypeLiteral;

const POSSIBLY_URESOLVED_CLASS = [
	TypeReferenceDeclaration,
	UnionTypeDeclaration,
	TypeLiteralDeclaration,
	ArrayTypeDeclaration,
	IntersectionTypeDeclaration,
];

function isInstanceOfUnresolvedClass(
	value: unknown
): value is PossiblyUnresolvedDeclaration {
	return POSSIBLY_URESOLVED_CLASS.some((clazz) => value instanceof clazz);
}

type PossiblyUnresolvedDeclaration =
	| TypeReferenceDeclaration
	| UnionTypeDeclaration
	| TypeLiteralDeclaration
	| ArrayTypeDeclaration
	| IntersectionTypeDeclaration;

type ResolvedType = Exclude<Types, TypeReference>;
