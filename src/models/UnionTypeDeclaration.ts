import { UnionTypeNode } from "typescript";
import { UnionType } from "./UnionType";
import { DeclarationMeta } from "../parser";
import { TypeDeclaration } from "./TypeDeclaration";


export class UnionTypeDeclaration extends TypeDeclaration {
	public type: UnionType;

	constructor(meta: DeclarationMeta, type: UnionTypeNode) {
		super(meta);
		this.type = new UnionType(type);
	}

	typeToString(): string {
		return this.type.toString();
	}
}
