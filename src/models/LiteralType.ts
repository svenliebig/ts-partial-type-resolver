import { isNumericLiteral, isStringLiteral, LiteralTypeNode, Node, NullLiteral, SyntaxKind } from "typescript"
import { Type } from "./Type"

// TODO why do I have to implement this
function isNullerLiteral(node: Node): node is NullLiteral {
	return node.kind === SyntaxKind.NullKeyword
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
		} else {
			throw new Error(`Unknown LiteralType kind: ${type.literal.kind}`)
		}
	}

	toString() {
		return `${this.value}`
	}
}
