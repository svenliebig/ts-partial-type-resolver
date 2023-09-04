import { ArrayTypeNode, isTypeReferenceNode, TypeReferenceNode } from "typescript"
import { TypeFactory } from "../utils/TypeFactory"
import { StringType } from "./StringType"
import { Type } from "./Type"

/**
 * Examples:
 *
 * ```ts
 * Array<string>
 * string[]
 * ```
 */
export class ArrayType extends Type {
	public arrayType: Type

	// TODO these type do not belong here
	constructor(node: TypeReferenceNode | ArrayTypeNode) {
		super()

		// TODO this should not be necessary
		// TODO add declarion to this later
		this.arrayType = new StringType(undefined as any)

		if (isTypeReferenceNode(node)) {
			if (node.typeArguments) {
				for (const argument of node.typeArguments) {
					this.arrayType = TypeFactory.create(argument, "") // TODO
				}
			}
		} else {
			this.arrayType = TypeFactory.create(node.elementType, "") // TODO
		}
	}

	public toString(): string {
		return `Array<${this.arrayType.toString()}>`
	}
}
