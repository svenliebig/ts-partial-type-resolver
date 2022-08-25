import { DeclarationMeta } from "../parser";
import { EnumMembers, EnumType } from "./EnumType";
import { TypeDeclaration } from "./TypeDeclaration";

export class EnumTypeDeclaration extends TypeDeclaration {
	public type: EnumType;

	constructor(meta: DeclarationMeta, members: EnumMembers) {
		super(meta);
		this.type = new EnumType(members);
	}

	typeToString(): string {
		return this.type.toString();
	}
}
