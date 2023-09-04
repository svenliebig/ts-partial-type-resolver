import { DeclarationMeta } from "../parser"
import { TypeDeclaration } from "./TypeDeclaration"
import { FunctionType } from "./FunctionType"
import { Type } from "./Type"

export class FunctionTypeDeclaration extends TypeDeclaration {
	public type: FunctionType

	constructor(meta: DeclarationMeta, returnType: Type) {
		super(meta)
		this.type = new FunctionType(this.identifier, returnType)
	}

	typeToString(): string {
		return ""
	}
}
