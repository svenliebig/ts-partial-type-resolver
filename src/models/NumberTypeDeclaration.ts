import { DeclarationMeta } from "../parser";
import { TypeDeclaration } from "./TypeDeclaration";
import { NumberType } from "./NumberType";


export class NumberTypeDeclaration extends TypeDeclaration {
	public type: NumberType = new NumberType();

	constructor(meta: DeclarationMeta) {
		super(meta);
	}

	typeToString(): string {
		return this.type.toString();
	}
}
