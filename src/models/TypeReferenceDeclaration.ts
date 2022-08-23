import { TypeReferenceNode } from "typescript";
import { DeclarationMeta } from "../parser";
import { TypeDeclaration } from "./TypeDeclaration";
import { TypeReference } from "./TypeReference";

export class TypeReferenceDeclaration extends TypeDeclaration {
	public type: TypeReference;
	constructor(meta: DeclarationMeta, type: TypeReferenceNode) {
		super(meta);
		this.type = new TypeReference(type);
	}

	typeToString(): string {
		return this.type.identifier;
	}
}
