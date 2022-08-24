import { IntersectionTypeNode } from "typescript";
import { IntersectionType } from "./IntersectionType";
import { DeclarationMeta } from "../parser";
import { TypeDeclaration } from "./TypeDeclaration";


export class IntersectionTypeDeclaration extends TypeDeclaration {
	public type: IntersectionType;

	constructor(meta: DeclarationMeta, node: IntersectionTypeNode) {
		super(meta);
		this.type = new IntersectionType(node);
	}

	typeToString(): string {
		return this.type.toString();
	}
}
