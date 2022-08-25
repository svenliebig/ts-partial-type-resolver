import { UnionTypeNode } from "typescript"
import { Types } from "../parser"
import { TypeFactory } from "../utils/TypeFactory"

export class UnionType {
	public types: Array<Types>

	constructor(node: UnionTypeNode) {
		this.types = node.types.map(TypeFactory.create)
	}

	toString(): string {
		return this.types.map((type) => type.toString()).join(" | ")
	}
}
