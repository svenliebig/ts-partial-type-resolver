import { ArrayTypeNode, isTypeReferenceNode, TypeReferenceNode } from "typescript";
import { typeFactory, Types } from "../parser";
import { StringType } from "./StringType";


export class ArrayType {
	public arrayType: Types;

	// TODO these type do not belong here
	constructor(node: TypeReferenceNode | ArrayTypeNode) {
		// TODO this should not be necessary
		this.arrayType = new StringType()

		if (isTypeReferenceNode(node)) {
			if (node.typeArguments) {
				for (const argument of node.typeArguments) {
					this.arrayType = typeFactory(argument)
				}
			}
		} else {
			this.arrayType = typeFactory(node.elementType)
		}
	}

	public toString() {
		return `Array<${this.arrayType.toString()}>`
	}
}
