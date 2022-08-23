import { DeclarationMeta } from "../parser";
import { TypeDeclaration } from "./TypeDeclaration";
import { StringType } from "./StringType";


export class StringTypeDeclaration extends TypeDeclaration {
	public type: StringType = new StringType();

	constructor(meta: DeclarationMeta) {
		super(meta);
	}

	typeToString(): string {
		return "string";
	}
}
