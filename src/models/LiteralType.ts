import { FalseLiteral, isNumericLiteral, isStringLiteral, LiteralTypeNode, Node, NullLiteral, SyntaxKind, TrueLiteral } from "typescript"
import { Type } from "./Type"

// TODO why do I have to implement this
function isNullerLiteral(node: Node): node is NullLiteral {
	return node.kind === SyntaxKind.NullKeyword
}

function isTrueLiteral(node: Node): node is TrueLiteral {
	return node.kind === SyntaxKind.TrueKeyword
}

function isFalseLiteral(node: Node): node is FalseLiteral {
	return node.kind === SyntaxKind.TrueKeyword
}

export class LiteralType extends Type {
	public value: string | number

	constructor(type: LiteralTypeNode) {
		super()

		if (isStringLiteral(type.literal)) {
			this.value = `"${type.literal.text}"`
		} else if (isNumericLiteral(type.literal)) {
			this.value = parseFloat(type.literal.text)
		} else if (isNullerLiteral(type.literal)) {
			this.value = "null"
		} else if (isTrueLiteral(type.literal)) {
			this.value = "true"
		} else if (isFalseLiteral(type.literal)) {
			this.value = "false"
		} else {
			throw new Error(`Unknown LiteralType kind: ${type.literal.kind}`)
		}
	}

	toString() {
		return `${this.value}`
	}
}
