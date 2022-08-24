import { TypeReferenceNode } from "typescript";
import { DeclarationMeta } from "../parser";
import { TypeDeclaration } from "./TypeDeclaration";
import { TypeReference } from "./TypeReference";

export class TypeReferenceDeclaration extends TypeDeclaration {
	public type: TypeReference;
	constructor(meta: DeclarationMeta, node: TypeReferenceNode) {
		super(meta);
		this.type = new TypeReference(node);
	}

	typeToString(): string {
		return this.type.identifier;
	}
}
