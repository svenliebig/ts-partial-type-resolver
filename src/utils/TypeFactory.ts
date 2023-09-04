import {
	isArrayTypeNode,
	isConditionalTypeNode,
	isFunctionTypeNode,
	isIdentifier,
	isIndexedAccessTypeNode,
	isIntersectionTypeNode,
	isLiteralTypeNode,
	isMappedTypeNode,
	isParenthesizedTypeNode,
	isTupleTypeNode,
	isTypeLiteralNode,
	isTypeReferenceNode,
	isUnionTypeNode,
	SyntaxKind,
	TypeNode,
} from "typescript"
import { ArrayType } from "../models/ArrayType"
import { BooleanType } from "../models/BooleanType"
import { IntersectionType } from "../models/IntersectionType"
import { LiteralType } from "../models/LiteralType"
import { NumberType } from "../models/NumberType"
import { StringType } from "../models/StringType"
import { TypeLiteral } from "../models/TypeLiteral"
import { TypeReference } from "../models/TypeReference"
import { UnionType } from "../models/UnionType"
import { isBooleanKeywordTypeNode } from "./isBooleanKeywordTypeNode"
import { isNumberKeywordTypeNode } from "./isNumberKeywordTypeNode"
import { isStringKeywordTypeNode } from "./isStringKeywordTypeNode"
import { L } from "./logger"
import { isUndefinedKeywordTypeNode } from "./isUndefinedKeywordTypeNode"
import { UndefinedType } from "../models/UndefinedType"
import { printSyntaxKind } from "./printSyntaxKind"
import { UnknownType } from "../models"
import { isVoidKeywordTypeNode } from "./isVoidKeywordTypeNode"
import { FunctionType } from "../models/FunctionType"
import { VoidType } from "../models/VoidType"
import { isUnknownKeywordTypeNode } from "./isUnknownKeywordTypeNode"

export class TypeFactory {
	static create(node: TypeNode, identifier: string) {
		L.enter(`TypeFactory.create(${printSyntaxKind(node.kind)}, "${identifier}")`)
		L.d("call")

		function execute() {
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

			if (isFunctionTypeNode(node)) {
				return new FunctionType(identifier, [], new UnknownType())
			}

			if (isBooleanKeywordTypeNode(node)) {
				return new BooleanType()
			}

			if (isUndefinedKeywordTypeNode(node)) {
				return new UndefinedType()
			}

			if (isUnknownKeywordTypeNode(node)) {
				return new UnknownType()
			}

			if (isVoidKeywordTypeNode(node)) {
				return new VoidType(identifier)
			}

			if (isParenthesizedTypeNode(node)) {
				// TODO
				return new UnknownType()
			}

			// [A as keyof T]: ...
			if (isIndexedAccessTypeNode(node)) {
				// TODO
				return new UnknownType()
			}

			// bla extends T ? X : Y
			if (isConditionalTypeNode(node)) {
				// TODO
				return new UnknownType()
			}

			// untyped arrays: []
			if (isTupleTypeNode(node)) {
				// TODO
				return new UnknownType()
			}

			// occured here:
			// export declare type Rejected<Entity extends ReviewableEntity> = {
			//    dayta: Omit<A, "b"> & {
			//    status: A.B;
			// 	};
			//  freigabedaten: RequireKeys<S, "a" | "b" | "c">;
			// } & {
			//  [T in keyof Omit<Entity, "status">]: Entity[T];
			// };
			if (isMappedTypeNode(node)) {
				// TODO
				return new UnknownType()
			}

			// return new UnknownType()
			throw new UnhandledTypeNodeError(node.kind)
		}

		const result = execute()
		L.exit()
		return result
	}
}

export class UnhandledTypeNodeError extends Error {
	constructor(kind: SyntaxKind) {
		super()
		this.message = this.createMessage(kind)
	}

	private createMessage(kind: SyntaxKind): string {
		return `TypeFactory: Unhandled TypeNode kind '${printSyntaxKind(kind)}'`
	}
}
