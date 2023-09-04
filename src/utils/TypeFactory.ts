import {
	isArrayTypeNode,
	isIdentifier,
	isIntersectionTypeNode,
	isLiteralTypeNode,
	isTypeLiteralNode,
	isTypeReferenceNode,
	isUnionTypeNode,
	TypeNode,
} from "typescript"
import { ArrayType } from "../models/ArrayType"
import { BooleanType } from "../models/BooleanType"
import { IntersectionType } from "../models/IntersectionType"
import { LiteralType } from "../models/LiteralType"
import { NumberType } from "../models/NumberType"
import { StringType } from "../models/StringType"
import { TypeDeclaration } from "../models/TypeDeclaration"
import { TypeLiteral } from "../models/TypeLiteral"
import { TypeReference } from "../models/TypeReference"
import { UnionType } from "../models/UnionType"
import { isBooleanKeywordTypeNode } from "./isBooleanKeywordTypeNode"
import { isNumberKeywordTypeNode } from "./isNumberKeywordTypeNode"
import { isStringKeywordTypeNode } from "./isStringKeywordTypeNode"
import { L } from "./logger"
import { isUndefinedKeywordTypeNode } from "./isUndefinedKeywordTypeNode"
import { UndefinedType } from "../models/UndefinedType"

export class TypeFactory {
	static create(node: TypeNode, identifier: string) {
		L.d(`<TypeFactory.create>`, node.kind)

		if (isArrayTypeNode(node)) {
			return new ArrayType(node)
		}

		if (isLiteralTypeNode(node)) {
			return new LiteralType(node)
		}

		if (isUnionTypeNode(node)) {
			// TODO identifier is not resolved yet
			return new UnionType(node, identifier)
		}

		if (isIntersectionTypeNode(node)) {
			return new IntersectionType(node, identifier)
		}

		if (isStringKeywordTypeNode(node)) {
			return new StringType(identifier)
		}

		if (isNumberKeywordTypeNode(node)) {
			return new NumberType()
		}

		if (isTypeReferenceNode(node)) {
			if (isIdentifier(node.typeName) && node.typeName.text === "Array") {
				return new ArrayType(node)
			}

			return new TypeReference(node)
		}

		if (isTypeLiteralNode(node)) {
			return new TypeLiteral(node)
		}

		if (isBooleanKeywordTypeNode(node)) {
			return new BooleanType()
		}

		if (isUndefinedKeywordTypeNode(node)) {
			return new UndefinedType()
		}

		throw new Error(`TypeFactory: Unknown TypeNode kind '${node.kind}'`)
	}
}
