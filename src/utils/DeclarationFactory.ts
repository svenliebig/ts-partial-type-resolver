import {
	EnumDeclaration,
	EnumMember,
	Identifier,
	isArrayTypeNode,
	isConditionalTypeNode,
	isFunctionTypeNode,
	isIdentifier,
	isIntersectionTypeNode,
	isLiteralTypeNode,
	isStringLiteral,
	isTupleTypeNode,
	isTypeLiteralNode,
	isTypeNode,
	isTypeQueryNode,
	isTypeReferenceNode,
	isUnionTypeNode,
	ParameterDeclaration,
	PropertyName,
	TypeAliasDeclaration,
} from "typescript"
import { ArrayTypeDeclaration } from "../models/ArrayTypeDeclaration"
import { EnumMembers } from "../models/EnumType"
import { EnumTypeDeclaration } from "../models/EnumTypeDeclaration"
import { FunctionTypeDeclaration } from "../models/FunctionTypeDeclaration"
import { IntersectionTypeDeclaration } from "../models/IntersectionTypeDeclaration"
import { LiteralTypeDeclaration } from "../models/LiteralTypeDeclaration"
import { NumberTypeDeclaration } from "../models/NumberTypeDeclaration"
import { StringTypeDeclaration } from "../models/StringTypeDeclaration"
import { TypeLiteralDeclaration } from "../models/TypeLiteralDeclaration"
import { TypeReferenceDeclaration } from "../models/TypeReferenceDeclaration"
import { UnionTypeDeclaration } from "../models/UnionTypeDeclaration"
import { DeclarationMeta } from "../parser"
import { isDefaultModifier } from "./isDefaultModifier"
import { isExportModifier } from "./isExportModifier"
import { isNumberKeywordTypeNode } from "./isNumberKeywordTypeNode"
import { isStringKeywordTypeNode } from "./isStringKeywordTypeNode"
import { printSyntaxKind } from "./printSyntaxKind"
import { TypeFactory } from "./TypeFactory"
import { UnknownType } from "../models"
import { Type } from "../models/Type"
import { TypeDeclaration } from "../models/TypeDeclaration"

export class DeclarationFactory {
	public static createEnumDeclaration(statement: EnumDeclaration) {
		function getName(node: { name: Identifier | PropertyName }) {
			if (isIdentifier(node.name)) {
				return node.name.text
			}
			return ""
		}

		const members: EnumMembers = new Map()

		statement.members.forEach((member: EnumMember, index: number) => {
			const name = getName(member)

			if (member.initializer && isStringLiteral(member.initializer)) {
				members.set(name, member.initializer.text)
				return
			} else {
				members.set(name, index)
				return
			}
		})

		return new EnumTypeDeclaration(DeclarationFactory.createMeta(statement), members)
	}

	public static createTypeDeclaration(statement: TypeAliasDeclaration | ParameterDeclaration) {
		const meta: DeclarationMeta = DeclarationFactory.createMeta(statement)

		if (!statement.type) {
			throw new Error("statemetn.type has no type, p[robably an ParameterDecl that is empty, should be filtered, past sven was to lazy")
		}

		if (isLiteralTypeNode(statement.type)) {
			return new LiteralTypeDeclaration(meta, statement.type)
		}

		if (isUnionTypeNode(statement.type)) {
			return new UnionTypeDeclaration(meta, statement.type)
		}

		if (isIntersectionTypeNode(statement.type)) {
			return new IntersectionTypeDeclaration(meta, statement.type)
		}

		if (isStringKeywordTypeNode(statement.type)) {
			return new StringTypeDeclaration(meta)
		}

		if (isNumberKeywordTypeNode(statement.type)) {
			return new NumberTypeDeclaration(meta)
		}

		if (isArrayTypeNode(statement.type)) {
			return new ArrayTypeDeclaration(meta, statement.type)
		}

		if (isTypeReferenceNode(statement.type)) {
			if (isIdentifier(statement.type.typeName) && statement.type.typeName.text === "Array") {
				return new ArrayTypeDeclaration(meta, statement.type)
			}

			return new TypeReferenceDeclaration(meta, statement.type)
		}

		if (isTypeLiteralNode(statement.type)) {
			return new TypeLiteralDeclaration(meta, statement.type)
		}

		if (isFunctionTypeNode(statement.type)) {
			const parameters: Array<TypeDeclaration> = statement.type.parameters
				.filter((p) => !!p.kind)
				.map((p) => {
					return DeclarationFactory.createTypeDeclaration(p)
				})

			return new FunctionTypeDeclaration(meta, parameters, TypeFactory.create(statement.type.type, meta.identifier))
		}

		if (isTupleTypeNode(statement.type)) {
			// TODO use a correct type
			return new StringTypeDeclaration(meta)
		}

		if (isConditionalTypeNode(statement.type)) {
			// TODO use a correct type
			return new StringTypeDeclaration(meta)
		}

		if (isTypeQueryNode(statement.type)) {
			// TODO use a correct type
			return new StringTypeDeclaration(meta)
		}

		// keyof
		if (isTypeNode(statement.type)) {
			// TODO use a correct type
			return new StringTypeDeclaration(meta)
		}

		throw new UnhandledTypeNodeError(statement)
	}

	public static createMeta(statement: TypeAliasDeclaration | EnumDeclaration | ParameterDeclaration): DeclarationMeta {
		return {
			identifier: isIdentifier(statement.name) ? (statement.name.escapedText as string) : "",
			exported: statement.modifiers?.some(isExportModifier) ?? false,
			default: statement.modifiers?.some(isDefaultModifier) ?? false,
		}
	}
}

class UnhandledTypeNodeError extends Error {
	constructor(type: TypeAliasDeclaration | ParameterDeclaration) {
		super()
		this.message = this.createMessage(type)
	}

	private createMessage(node: TypeAliasDeclaration | ParameterDeclaration): string {
		return [
			`DeclarationFactory: Unhandled TypeNode`,
			`  kind: ${printSyntaxKind(node.kind)}`,
			`  name: ${JSON.stringify(node.name)}`,
			`  all: ${JSON.stringify(node, null, 2)}`,
		].join("\n")
	}
}
