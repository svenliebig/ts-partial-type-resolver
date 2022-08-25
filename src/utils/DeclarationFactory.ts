import {
	EnumDeclaration,
	EnumMember,
	Identifier,
	isArrayTypeNode,
	isIdentifier,
	isIntersectionTypeNode,
	isLiteralTypeNode,
	isStringLiteral,
	isTypeLiteralNode,
	isTypeReferenceNode,
	isUnionTypeNode,
	PropertyName,
	TypeAliasDeclaration,
} from "typescript"
import { ArrayTypeDeclaration } from "../models/ArrayTypeDeclaration"
import { EnumMembers } from "../models/EnumType"
import { EnumTypeDeclaration } from "../models/EnumTypeDeclaration"
import { IntersectionTypeDeclaration } from "../models/IntersectionTypeDeclaration"
import { LiteralTypeDeclaration } from "../models/LiteralTypeDeclaration"
import { NumberTypeDeclaration } from "../models/NumberTypeDeclaration"
import { StringTypeDeclaration } from "../models/StringTypeDeclaration"
import { TypeLiteralDeclaration } from "../models/TypeLiteralDeclaration"
import { TypeReferenceDeclaration } from "../models/TypeReferenceDeclaration"
import { UnionTypeDeclaration } from "../models/UnionTypeDeclaration"
import { isDefaultModifier } from "./isDefaultModifier"
import { isExportModifier } from "./isExportModifier"
import { isNumberKeywordTypeNode } from "./isNumberKeywordTypeNode"
import { isStringKeywordTypeNode } from "./isStringKeywordTypeNode"
import { L } from "./logger"
import { DeclarationMeta } from "../parser"

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

	public static createTypeDeclaration(statement: TypeAliasDeclaration) {
		L.d(`<TypeAliasDeclarationFactory.create>`, statement.kind, statement.type.kind)

		const meta: DeclarationMeta = DeclarationFactory.createMeta(statement)

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

		throw new Error(`Unknown TypeNode kind: ${statement.type.kind}`)
	}

	public static createMeta(statement: TypeAliasDeclaration | EnumDeclaration): DeclarationMeta {
		return {
			identifier: statement.name.escapedText as string,
			exported: statement.modifiers?.some(isExportModifier) ?? false,
			default: statement.modifiers?.some(isDefaultModifier) ?? false,
		}
	}
}
