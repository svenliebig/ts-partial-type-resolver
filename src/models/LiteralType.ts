import {
	isNumericLiteral,
	isStringLiteral, LiteralTypeNode
} from "typescript";


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
		return `${this.value}`;
	}
}
