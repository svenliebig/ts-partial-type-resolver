import { IntersectionTypeNode } from "typescript"
import { TypeFactory } from "../utils/TypeFactory"
import { Type } from "./Type"

export class IntersectionType extends Type {
	public types: Array<Type>

	constructor(node: IntersectionTypeNode, public identifier: string) {
		super()
		this.types = node.types.map((t) => TypeFactory.create(t, identifier))
	}

	toString(): string {
		return this.types.map((type) => type.toString()).join(" & ")
	}
}
