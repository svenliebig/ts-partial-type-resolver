import { TypeLiteral } from "./TypeLiteral";
import { DeclarationMeta } from "../parser";
import { TypeDeclaration } from "./TypeDeclaration";
import { TypeLiteralNode } from "typescript";


export class TypeLiteralDeclaration extends TypeDeclaration {
	public type: TypeLiteral;

	constructor(meta: DeclarationMeta, node: TypeLiteralNode) {
		super(meta);
		this.type = new TypeLiteral(node);
	}

	typeToString(): string {
		return this.type.toString();
	}
}
