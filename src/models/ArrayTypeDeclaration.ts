import { ArrayTypeNode, TypeReferenceNode } from "typescript";
import { DeclarationMeta } from "../parser";
import { ArrayType } from "./ArrayType";
import { TypeDeclaration } from "./TypeDeclaration";

export class ArrayTypeDeclaration extends TypeDeclaration {
	public type: ArrayType;

	constructor(meta: DeclarationMeta, node: TypeReferenceNode | ArrayTypeNode) {
		super(meta);
		this.type = new ArrayType(node);
	}

	typeToString(): string {
		return this.type.toString();
	}
}
