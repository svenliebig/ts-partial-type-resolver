import {
	isNumericLiteral,
	isStringLiteral, LiteralTypeNode, Node, NullLiteral, SyntaxKind
} from "typescript";

// TODO why do I have to implement this
function isNullerLiteral(node: Node): node is NullLiteral {
	return node.kind === SyntaxKind.NullKeyword
}

export class LiteralType {
	public value: string | number;

	constructor(type: LiteralTypeNode) {
		if (isStringLiteral(type.literal)) {
			this.value = `"${type.literal.text}"`;
		} else if (isNumericLiteral(type.literal)) {
			this.value = parseFloat(type.literal.text);
		} else if (isNullerLiteral(type.literal)) {
			this.value = "null";
		} else {
			throw new Error(`Unknown LiteralType kind: ${type.literal.kind}`);
		}
	}

	toString() {
		return `${this.value}`;
	}
}
