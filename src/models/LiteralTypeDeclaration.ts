import { LiteralTypeNode } from "typescript";
import { DeclarationMeta } from "../parser";
import { TypeDeclaration } from "./TypeDeclaration";
import { LiteralType } from "./LiteralType";


export class LiteralTypeDeclaration extends TypeDeclaration {
	public type: LiteralType;

	constructor(meta: DeclarationMeta, type: LiteralTypeNode) {
		super(meta);
		this.type = new LiteralType(type);
	}

	typeToString(): string {
		return `${this.type.toString()}`;
	}
}
