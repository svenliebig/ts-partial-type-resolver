import { DeclarationMeta } from "../parser"
import { EnumMembers, EnumType } from "./EnumType"
import { TypeDeclaration } from "./TypeDeclaration"

export class EnumTypeDeclaration extends TypeDeclaration {
	public type: EnumType

	constructor(meta: DeclarationMeta, members: EnumMembers) {
		super(meta)
		this.type = new EnumType(meta.identifier, members)
	}

	override toString(): string {
		return `${this.exported ? "export " : ""}enum ${this.identifier} ${this.typeToString()}`
	}

	typeToString(): string {
		return `{ ${Array.from(this.type.members.entries())
			.map((entry) => `${entry[0]} = "${entry[1]}"`)
			.join(", ")} }`
	}
}
