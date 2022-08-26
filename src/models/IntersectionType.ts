import { IntersectionTypeNode } from "typescript"
import { TypeFactory } from "../utils/TypeFactory"
import { Type } from "./Type"

export class IntersectionType extends Type {
	public types: Array<Type>

	constructor(node: IntersectionTypeNode) {
		super()
		this.types = node.types.map(TypeFactory.create)
	}

	toString(): string {
		return this.types.map((type) => type.toString()).join(" & ")
	}
}
