import { StringTypeDeclaration } from "./StringTypeDeclaration"
import { Type } from "./Type"
import { TypeDeclaration } from "./TypeDeclaration"

export class StringType extends Type {
	constructor(public identifier: string) {
		super()
	}

	toString() {
		return "string"
	}
}
