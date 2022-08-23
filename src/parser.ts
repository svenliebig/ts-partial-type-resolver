import { existsSync, readFileSync } from "fs";
import { parse, resolve } from "path";
import {
	createSourceFile,
	DefaultKeyword,
	ExportKeyword,
	ImportDeclaration,
	isIdentifier,
	isImportClause,
	isImportDeclaration,
	isImportSpecifier,
	isLiteralTypeNode,
	isNamedImports,
	isNumericLiteral,
	isStringLiteral,
	isStringLiteralLike,
	isTypeAliasDeclaration,
	isTypeReferenceNode,
	isUnionTypeNode,
	KeywordTypeNode,
	LiteralTypeNode,
	Modifier,
	ScriptTarget,
	SyntaxKind,
	TypeAliasDeclaration,
	TypeNode,
	TypeReferenceNode,
	UnionTypeNode
} from "typescript";
import { L } from "./utils/logger";

function createImport(statement: ImportDeclaration, source: string): Import {
	const named: Array<string> = []
	const defau: string | null = null

	if (statement.importClause && isImportClause(statement.importClause)) {
		if (
			statement.importClause.namedBindings &&
			isNamedImports(statement.importClause.namedBindings)
		) {
			statement.importClause.namedBindings.elements.forEach(element => {
				if (isImportSpecifier(element)) {
					return named.push(element.name.text)
				}

				throw new Error(`Unknown NamedImport element: ${element}`)
			})
		}
	}
	
	if (isStringLiteralLike(statement.moduleSpecifier)) {
		return {
			source,
			from: statement.moduleSpecifier.text,
			named,
			default: defau
		};
	}

	throw new Error(`Unknown ModulesSpecifier kind: ${statement.moduleSpecifier.kind}`)
}
type Import = {
	/** the path of the file that contains the import declaration. */
	source: string
	/** the relative path to the target file of the import. */
	from: string
	named: Array<string>
	default: string | null
}

// TODO allow custom fileResolver for things like VS Code extensions
export class Parser {
	private imports: Array<Import> = [];
	private types: Array<TypeDeclaration> = [];

	constructor(private path: string) {
		this.parseFile(path)
	}

	private parseFile(path: string) {
		const content = readFileSync(path, "utf-8");
		const file = createSourceFile("e", content, ScriptTarget.ESNext);

		file.statements.forEach((statement) => {
			if (isImportDeclaration(statement)) {
				this.imports.push(createImport(statement, path))
			}

			if (isLiteralTypeNode(statement)) {
				console.log("literal");
			}

			if (isTypeAliasDeclaration(statement)) {
				const declaration = TypeAliasDeclarationFactory.create(statement);
				L.d(`parser > push declaration > ${declaration.toString()}`)
				return this.types.push(declaration);
			}
		});
	}

	getTypeDeclaration(name: string) {
		return this.types.find((type) => type.identifier === name);
	}

	getImport(name: string) {
		return this.imports.find((imported) => imported.default === name || imported.named.includes(name));
	}

	resolveImport(imported: Import) {
		const { dir } = parse(imported.source)
		const pathToFile = resolve(dir, imported.from);
		console.log(pathToFile)
		const tsPath = `${pathToFile}.ts`;
		const tsxPath = `${pathToFile}.tsx`;

		if (existsSync(tsPath)) {
			this.parseFile(tsPath)
			this.imports.splice(this.imports.indexOf(imported), 1)
			return
		}

		throw new Error(`Could not resolve import: ${imported.from}`)
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
				this.resolveType(declaration.type)
			);
		}

		throw new Error(
			`Could not resolve declaration for: ${declaration.identifier}.`
		);
	}

	resolveType(type: TypeReference): ResolvedType {
			L.d(`resolveType: ${type.identifier}`)

			const possibleLocalResolvedType = this.getTypeDeclaration(
				type.identifier
			);
				
			if (possibleLocalResolvedType) {
				if (isResolved(possibleLocalResolvedType.type)) {
					return possibleLocalResolvedType.type
				} else if (isTypeReference(possibleLocalResolvedType.type)) {
					return this.resolveType(possibleLocalResolvedType.type)
				}
			}

			const possibleImport = this.getImport(type.identifier)

			if (possibleImport) {
				this.resolveImport(possibleImport)
				return this.resolveType(type)
			}

			throw new Error(`Could not resolve type: ${type.identifier}`)
	}
}

function createResolvedTypeDeclaration(
	declaration: TypeDeclaration,
	resolvedType: ResolvedType
) {
	if (resolvedType instanceof StringType) {
		return new StringTypeDeclaration(declaration.getMeta());
	}

	throw new Error(`Missing implementation for ${resolvedType}`);
}

function isResolved(type: Types): type is ResolvedType {
	if (type instanceof TypeReference) {
		return false;
	}
	return true;
}

function isTypeReference(type: Types): type is TypeReference {
	if (type instanceof TypeReference) {
		return true;
	}
	return false;
}

type DeclarationMeta = {
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

function typeFactory(node: TypeNode) {
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

	throw new Error(`Unknown TypeNode kind: ${node.kind}`);
}

type Types = LiteralType | UnionType | StringType | TypeReference;
type ResolvedType = Exclude<Types, TypeReference>;

abstract class TypeDeclaration {
	public abstract type: Types;
	public identifier: string;
	public exported: boolean;
	public default: boolean;

	constructor(meta: DeclarationMeta) {
		this.identifier = meta.identifier;
		this.exported = meta.exported;
		this.default = meta.default;
	}

	getMeta(): DeclarationMeta {
		return {
			default: this.default,
			exported: this.exported,
			identifier: this.identifier,
		};
	}

	abstract typeToString(): string

	toString(): string {
		return `${this.exported ? "export " : ""}type ${this.identifier} = ${this.typeToString()}`
	}
}

class TypeReference {
	public identifier: string;

	constructor(type: TypeReferenceNode) {
		console.log(type);
		this.identifier = isIdentifier(type.typeName) ? type.typeName.text : "";
	}
}

class TypeReferenceDeclaration extends TypeDeclaration {
	public type: TypeReference;
	constructor(meta: DeclarationMeta, type: TypeReferenceNode) {
		super(meta);
		this.type = new TypeReference(type);
	}

	typeToString(): string {
		return this.type.identifier
	}
}

export class StringType {
		toString() { return "string" }
}

export class StringTypeDeclaration extends TypeDeclaration {
	public type: StringType = new StringType();
	
	constructor(meta: DeclarationMeta) {
		super(meta);
	}

	typeToString(): string {
		return "string"
	}
}

export class NumberType {
	toString() { return "number" }
}

export class NumberTypeDeclaration extends TypeDeclaration {
	public type: NumberType = new NumberType();
	
	constructor(meta: DeclarationMeta) {
		super(meta);
	}

	typeToString(): string {
		return this.type.toString()
	}
}

export class LiteralType {
	public value: string | number;

	constructor(type: LiteralTypeNode) {
		if (isStringLiteral(type.literal)) {
			this.value = `"${type.literal.text}"`;
		} else if (isNumericLiteral(type.literal)) {
			this.value = parseFloat(type.literal.text);
		} else {
			throw new Error(`Unknown LiteralType kind: ${type.literal.kind}`);
		}
	}

	toString() {
		return `${this.value}`
	}
}

export class LiteralTypeDeclaration extends TypeDeclaration {
	public type: LiteralType;
	
	constructor(meta: DeclarationMeta, type: LiteralTypeNode) {
		super(meta);
		this.type = new LiteralType(type);
	}

	typeToString(): string {
		return `${this.type.toString()}`
	}
}

export class UnionType {
	public types: Array<Types>;

	constructor(type: UnionTypeNode) {
		this.types = type.types.map(typeFactory);
	}

	toString(): string {
		return this.types.map(type => type.toString()).join(" | ")
	}
}

export class UnionTypeDeclaration extends TypeDeclaration {
	public type: UnionType;

	constructor(meta: DeclarationMeta, type: UnionTypeNode) {
		super(meta);
		this.type = new UnionType(type);
	}

	typeToString(): string {
		return this.type.toString()
	}
}
