import { readFileSync } from "fs"
import { resolve } from "path"
import { createSourceFile, DefaultKeyword, ExportKeyword, isIdentifier, isLiteralTypeNode, isNumericLiteral, isStringLiteral, isTypeAliasDeclaration, isTypeReferenceNode, isUnionTypeNode, KeywordTypeNode, LiteralTypeNode, Modifier, ScriptTarget, SyntaxKind, TypeAliasDeclaration, TypeNode, TypeReferenceNode, UnionTypeNode } from "typescript"

export class Parser {
	private types: Array<TypeDeclaration> = []

	constructor(path: string) {
		const content = readFileSync(path, "utf-8")
		const file = createSourceFile("e", content, ScriptTarget.ESNext);

		file.statements.forEach(statement => {
			if (isLiteralTypeNode(statement)) {
				console.log("literal")
			}

			if (isTypeAliasDeclaration(statement)) {
				return this.types.push(TypeAliasDeclarationFactory.create(statement))
			}
		})
	}

	getTypeDeclaration(name: string) {
		return this.types.find(type => type.identifier === name)
	}

	resolve(name: string) {
		const declaration = this.types.find(type => type.identifier === name)

		if (!declaration) {
			throw new Error(`Could not find any type declaration with the name: ${name}. Available type declarations are: ${this.types.map(type => type.identifier).join(" ,")}.`)
		}

		if (declaration instanceof TypeReferenceDeclaration) {
			const possiblyResolveType = this.getTypeDeclaration(declaration.type.identifier)
			
			if (possiblyResolveType) {
				if (isResolved(possiblyResolveType.type)) {
					return createResolvedTypeDeclaration(declaration, possiblyResolveType.type)
				}
			}
		}
	}
}

function createResolvedTypeDeclaration(declaration: TypeDeclaration, resolvedType: ResolvedType) {
	if (resolvedType instanceof StringType) {
		return new StringTypeDeclaration(declaration.getMeta())
	}

	throw new Error(`Missing implementation for ${resolvedType}`)
}

function isResolved(type: Types): type is ResolvedType {
	if (type instanceof TypeReference) {
		return false
	}
	return true
}

type DeclarationMeta = {
	identifier: string
	exported: boolean
	default: boolean
}

class TypeAliasDeclarationFactory {
	public static create(statement: TypeAliasDeclaration) {

		const meta: DeclarationMeta = {
			identifier: statement.name.escapedText as string,
			exported: statement.modifiers?.some(isExportModifier) ?? false,
			default: statement.modifiers?.some(isDefaultModifier) ?? false
		}

		if (isLiteralTypeNode(statement.type)) {
			return new LiteralTypeDeclaration(meta, statement.type)
		}

		if (isUnionTypeNode(statement.type)) {
			return new UnionTypeDeclaration(meta, statement.type)
		}

		if (isStringKeywordTypeNode(statement.type)) {
			return new StringTypeDeclaration(meta)
		}

		if (isNumberKeywordTypeNode(statement.type)) {
			return new NumberTypeDeclaration(meta)
		}

		if (isTypeReferenceNode(statement.type)) {
			return new TypeReferenceDeclaration(meta, statement.type)
		}

		throw new Error(`Unknown TypeNode kind: ${statement.type.kind}`)
	}
}

function isStringKeywordTypeNode(node: TypeNode): node is KeywordTypeNode<SyntaxKind.StringKeyword> {
	return node.kind === SyntaxKind.StringKeyword
}

function isNumberKeywordTypeNode(node: TypeNode): node is KeywordTypeNode<SyntaxKind.NumberKeyword> {
	return node.kind === SyntaxKind.NumberKeyword
}

function isExportModifier(modifier: Modifier): modifier is ExportKeyword {
	return modifier.kind === SyntaxKind.ExportKeyword
}

function isDefaultModifier(modifier: Modifier): modifier is DefaultKeyword {
	return modifier.kind === SyntaxKind.DefaultKeyword
}

function typeFactory(node: TypeNode) {
	if (isLiteralTypeNode(node)) {
		return new LiteralType(node)
	}

	if (isUnionTypeNode(node)) {
		return new UnionType(node)
	}

	if (isStringKeywordTypeNode(node)) {
		return new StringType()
	}

	if (isNumberKeywordTypeNode(node)) {
		return new NumberType()
	}

	throw new Error(`Unknown TypeNode kind: ${node.kind}`)
}

type Types = LiteralType | UnionType | StringType | TypeReference
type ResolvedType = Exclude<Types, TypeReference>

abstract class TypeDeclaration {
	public abstract type: Types
	public identifier: string
	public exported: boolean
	public default: boolean

	constructor(meta: DeclarationMeta) {
		this.identifier = meta.identifier
		this.exported = meta.exported
		this.default = meta.default
	}

	getMeta(): DeclarationMeta {
		return {
			default: this.default,
			exported: this.exported,
			identifier: this.identifier
		}
	}
}

class TypeReference {
	public identifier: string

	constructor(type: TypeReferenceNode) {
		console.log(type)
		this.identifier = isIdentifier(type.typeName) ? type.typeName.text : ""
	}
}

class TypeReferenceDeclaration extends TypeDeclaration {
	public type: TypeReference
	constructor(meta: DeclarationMeta, type: TypeReferenceNode) {
		super(meta)
		this.type = new TypeReference(type)
	}
}

export class StringType {
}

class StringTypeDeclaration extends TypeDeclaration {
	public type: StringType = new StringType()

	constructor(meta: DeclarationMeta) {
		super(meta)
	}
}

class NumberType {
}

class NumberTypeDeclaration extends TypeDeclaration {
	public type: NumberType = new NumberType()

	constructor(meta: DeclarationMeta) {
		super(meta)
	}
}


class LiteralType {
	public value: string | number

	constructor(type: LiteralTypeNode) {
		if (isStringLiteral(type.literal)) {
			this.value = type.literal.text
		} else if (isNumericLiteral(type.literal)) {
			this.value = parseFloat(type.literal.text)
		} else {
			throw new Error(`Unknown LiteralType kind: ${type.literal.kind}`)
		}
	}
}

class LiteralTypeDeclaration extends TypeDeclaration {
	public type: LiteralType

	constructor(meta: DeclarationMeta, type: LiteralTypeNode) {
		super(meta)
		this.type = new LiteralType(type)
	}
}

class UnionType {
	public types: Array<Types>

	constructor(type: UnionTypeNode) {
		this.types = type.types.map(typeFactory)
	}
}

class UnionTypeDeclaration extends TypeDeclaration {
	public type: UnionType

	constructor(meta: DeclarationMeta, type: UnionTypeNode) {
		super(meta)
		this.type = new UnionType(type)
	}
}

