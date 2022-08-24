import { isIdentifier, ArrayTypeNode, TypeReferenceNode, createUnparsedSourceFile } from "typescript";
import { typeFactory, Types } from "../parser";
import { L } from "../utils/logger";
import { StringType } from "./StringType";


export class ArrayType {
	public arrayType: Types;

	constructor(node: TypeReferenceNode) {
		// TODO
		this.arrayType = new StringType()

		if (node.typeArguments) {
			for (const argument of node.typeArguments) {
				this.arrayType = typeFactory(argument)
			}
		}
	}

	public toString() {
		return `Array<${this.arrayType.toString()}>`
	}
}
