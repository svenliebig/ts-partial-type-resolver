import { existsSync, readFileSync } from "fs";
import { parse, resolve } from "path";
import {
	createSourceFile,
	DefaultKeyword,
	ExportKeyword,
	ImportDeclaration,
	isImportClause,
	isImportDeclaration,
	isImportSpecifier,
	isLiteralTypeNode,
	isNamedImports,
	isStringLiteralLike,
	isTypeAliasDeclaration,
	isTypeLiteralNode,
	isTypeReferenceNode,
	isUnionTypeNode,
	KeywordTypeNode,
	Modifier,
	ScriptTarget,
	SyntaxKind,
	TypeAliasDeclaration,
	TypeNode,
} from "typescript";
import { LiteralType } from "./models/LiteralType";
import { LiteralTypeDeclaration } from "./models/LiteralTypeDeclaration";
import { UnionType } from "./models/UnionType";
import { UnionTypeDeclaration } from "./models/UnionTypeDeclaration";
import { NumberType } from "./models/NumberType";
import { NumberTypeDeclaration } from "./models/NumberTypeDeclaration";
import { StringType } from "./models/StringType";
import { StringTypeDeclaration } from "./models/StringTypeDeclaration";
import { TypeReference } from "./models/TypeReference";
import { TypeReferenceDeclaration } from "./models/TypeReferenceDeclaration";
import { L } from "./utils/logger";
import { TypeDeclaration } from "./models/TypeDeclaration";
import { TypeLiteralDeclaration } from "./models/TypeLiteralDeclaration";
import { TypeLiteral } from "./models/TypeLiteral";

function createImport(statement: ImportDeclaration, source: string): Import {
	const named: Array<string> = [];
	const defau: string | null = null;

	if (statement.importClause && isImportClause(statement.importClause)) {
		if (
			statement.importClause.namedBindings &&
			isNamedImports(statement.importClause.namedBindings)
		) {
			statement.importClause.namedBindings.elements.forEach((element) => {
				if (isImportSpecifier(element)) {
					return named.push(element.name.text);
				}

				throw new Error(`Unknown NamedImport element: ${element}`);
			});
		}
	}

	if (isStringLiteralLike(statement.moduleSpecifier)) {
		return {
			source,
			from: statement.moduleSpecifier.text,
			named,
			default: defau,
		};
	}

	throw new Error(
		`Unknown ModulesSpecifier kind: ${statement.moduleSpecifier.kind}`
	);
}
type Import = {
	/** the path of the file that contains the import declaration. */
	source: string;
	/** the relative path to the target file of the import. */
	from: string;
	named: Array<string>;
	default: string | null;
};

// TODO allow custom fileResolver for things like VS Code extensions
export class Parser {
	private imports: Array<Import> = [];
	private types: Array<TypeDeclaration> = [];

	constructor(path: string) {
		this.parseFile(path);
	}

	private parseFile(path: string) {
		const content = readFileSync(path, "utf-8");
		const file = createSourceFile("e", content, ScriptTarget.ESNext);

		file.statements.forEach((statement) => {
			if (isImportDeclaration(statement)) {
				this.imports.push(createImport(statement, path));
			}

			if (isLiteralTypeNode(statement)) {
			}

			if (isTypeAliasDeclaration(statement)) {
				const declaration = TypeAliasDeclarationFactory.create(statement);
				L.d(`parser > push declaration > ${declaration.toString()}`);
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

	resolveImport(imported: Import) {
		const { dir } = parse(imported.source);
		const pathToFile = resolve(dir, imported.from);
		const tsPath = `${pathToFile}.ts`;
		const tsxPath = `${pathToFile}.tsx`;

		if (existsSync(tsPath)) {
			this.parseFile(tsPath);
			this.imports.splice(this.imports.indexOf(imported), 1);
			return;
		}

		throw new Error(`Could not resolve import: ${imported.from}`);
	}

	resolve(name: string) {
		const declaration = this.types.find((type) => type.identifier === name);

		if (!declaration) {
			throw new Error(
				`Could not find any type declaration with the name: ${name}. Available type declarations are: ${this.types
					.map((type) => type.identifier)
					.join(" ,")}.`
			);
		}

		if (declaration instanceof TypeReferenceDeclaration) {
			return createResolvedTypeDeclaration(
				declaration,
				this.resolveTypeReference(declaration.type)
			);
		} else if (declaration instanceof UnionTypeDeclaration) {
			return createResolvedTypeDeclaration(
				declaration,
				this.resolveType(declaration.type)
			);
		} else if (declaration instanceof TypeLiteralDeclaration) {
			return createResolvedTypeDeclaration(
				declaration,
				this.resolveTypeLiteral(declaration.type)
			);
		}

		throw new Error(
			`Could not resolve declaration for: ${declaration.identifier}.`
		);
	}

	public isResolved(identifier: string): boolean {
		const declaration = this.getTypeDeclaration(identifier);

		if (declaration) {
			return this.isTypeResolved(declaration.type);
		}

		return false;
	}

	private isTypeResolved(type: Types): type is ResolvedType {
		L.d(`isTypeResolved: ${type.toString()}`);

		if (type instanceof TypeReference && !type.isPrimitive()) {
			return false;
		}

		if (type instanceof TypeLiteral) {
			return !Array.from(type.properties.values()).some(
				(property) => !this.isTypeResolved(property)
			);
		}

		if (type instanceof UnionType) {
			return !type.types.some((type) => !this.isTypeResolved(type));
		}

		return true;
	}

	private resolveType(
		type: TypeReference | UnionType | TypeLiteral
	): ResolvedType {
		L.d(`<resolveType> ${type.toString()}`);
		if (type instanceof TypeReference) {
			return this.resolveTypeReference(type);
		} else if (type instanceof UnionType) {
			return this.resolveUnionType(type);
		} else if (type instanceof TypeLiteral) {
			return this.resolveTypeLiteral(type);
		} else {
			throw new Error(`Type resolving for type ${type} is not implemented.`);
		}
	}

	private resolveTypeReference(type: TypeReference): ResolvedType {
		L.d(`<resolveTypeReference>`, type.toString());
		if (type.isPrimitive()) {
			L.d(`<resolveTypeReference>`, "it's a primitive");
			return type;
		}

		const possibleLocalResolvedType = this.getTypeDeclaration(type.identifier);

		if (possibleLocalResolvedType) {
			L.d(`<resolveTypeReference>`, "it's already in the types");
			if (this.isTypeResolved(possibleLocalResolvedType.type)) {
				L.d(`<resolveTypeReference>`, "it's resolved");
				return possibleLocalResolvedType.type;
			} else {
				L.d(`<resolveTypeReference>`, "it's not resolved");
				return this.resolveType(possibleLocalResolvedType.type);
			}
		}

		const possibleImport = this.getImport(type.identifier);
		
		if (possibleImport) {
			L.d(`<resolveTypeReference>`, "it's a possible import");
			this.resolveImport(possibleImport);
			return this.resolveTypeReference(type);
		}
		
		throw new Error(`Could not resolve type: ${type.identifier}`);
	}
	
	private resolveUnionType(type: UnionType): UnionType {
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
		const keys = type.properties.keys();

		for (const key of keys) {
			const propertyTyp: Types = type.properties.get(key) as Types;

			if (!this.isTypeResolved(propertyTyp)) {
				const resolvedType = this.resolveTypeReference(propertyTyp);
				type.properties.set(key, resolvedType);
			}
		}

		return type;
	}
}

function createResolvedTypeDeclaration(
	declaration: TypeDeclaration,
	resolvedType: ResolvedType
) {
	if (resolvedType instanceof StringType) {
		return new StringTypeDeclaration(declaration.getMeta());
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

	throw new Error(`Missing implementation for ${resolvedType}`);
}

export type DeclarationMeta = {
	identifier: string;
	exported: boolean;
	default: boolean;
};

class TypeAliasDeclarationFactory {
	public static create(statement: TypeAliasDeclaration) {
		const meta: DeclarationMeta = {
			identifier: statement.name.escapedText as string,
			exported: statement.modifiers?.some(isExportModifier) ?? false,
			default: statement.modifiers?.some(isDefaultModifier) ?? false,
		};

		if (isLiteralTypeNode(statement.type)) {
			return new LiteralTypeDeclaration(meta, statement.type);
		}

		if (isUnionTypeNode(statement.type)) {
			return new UnionTypeDeclaration(meta, statement.type);
		}

		if (isStringKeywordTypeNode(statement.type)) {
			return new StringTypeDeclaration(meta);
		}

		if (isNumberKeywordTypeNode(statement.type)) {
			return new NumberTypeDeclaration(meta);
		}

		if (isTypeReferenceNode(statement.type)) {
			return new TypeReferenceDeclaration(meta, statement.type);
		}

		if (isTypeLiteralNode(statement.type)) {
			return new TypeLiteralDeclaration(meta, statement.type);
		}

		throw new Error(`Unknown TypeNode kind: ${statement.type.kind}`);
	}
}

function isStringKeywordTypeNode(
	node: TypeNode
): node is KeywordTypeNode<SyntaxKind.StringKeyword> {
	return node.kind === SyntaxKind.StringKeyword;
}

function isNumberKeywordTypeNode(
	node: TypeNode
): node is KeywordTypeNode<SyntaxKind.NumberKeyword> {
	return node.kind === SyntaxKind.NumberKeyword;
}

function isExportModifier(modifier: Modifier): modifier is ExportKeyword {
	return modifier.kind === SyntaxKind.ExportKeyword;
}

function isDefaultModifier(modifier: Modifier): modifier is DefaultKeyword {
	return modifier.kind === SyntaxKind.DefaultKeyword;
}

export function typeFactory(node: TypeNode) {
	L.d(`typeFactory: ${node.kind}`);
	if (isLiteralTypeNode(node)) {
		return new LiteralType(node);
	}

	if (isUnionTypeNode(node)) {
		return new UnionType(node);
	}

	if (isStringKeywordTypeNode(node)) {
		return new StringType();
	}

	if (isNumberKeywordTypeNode(node)) {
		return new NumberType();
	}

	if (isTypeReferenceNode(node)) {
		return new TypeReference(node);
	}

	if (isTypeLiteralNode(node)) {
		return new TypeLiteral(node);
	}

	throw new Error(`Unknown TypeNode kind: ${node.kind}`);
}

export type Types =
	| LiteralType
	| UnionType
	| StringType
	| TypeReference
	| TypeLiteral;
type ResolvedType = Exclude<Types, TypeReference>;
