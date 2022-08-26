import { isIdentifier, TypeReferenceNode } from "typescript"
import { Type } from "./Type"

export class TypeReference extends Type {
	public identifier: string

	constructor(node: TypeReferenceNode) {
		super()
		this.identifier = isIdentifier(node.typeName) ? node.typeName.text : ""
	}

	public isPrimitive(): boolean {
		return this.identifier === "Date"
	}

	public toString() {
		return this.identifier
	}
}
