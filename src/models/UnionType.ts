import { UnionTypeNode } from "typescript"
import { TypeFactory } from "../utils/TypeFactory"
import { Type } from "./Type"

export class UnionType extends Type {
	public types: Array<Type>

	// TODO these `types` should be a parameter instead of creating a dependency to the `typescript` lib here
	constructor(node: UnionTypeNode) {
		super()
		this.types = node.types.map(TypeFactory.create)
	}

	toString(): string {
		return this.types.map((type) => type.toString()).join(" | ")
	}
}
