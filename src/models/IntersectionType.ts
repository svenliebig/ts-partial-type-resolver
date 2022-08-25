import { IntersectionTypeNode } from "typescript"
import { Types } from "../parser"
import { TypeFactory } from "../utils/TypeFactory"

export class IntersectionType {
	public types: Array<Types>

	constructor(node: IntersectionTypeNode) {
		this.types = node.types.map(TypeFactory.create)
	}

	toString(): string {
		return this.types.map((type) => type.toString()).join(" & ")
	}
}
