import { Type } from "./Type"
import { TypeDeclaration } from "./TypeDeclaration"

export class FunctionType extends Type {
	constructor(public identifier: string, public parameters: Array<TypeDeclaration>, public returnType: Type) {
		super()
	}

	toString() {
		return `(${this.parameters.map((t) => `${t.identifier}: ${t.typeToString()}`).join(", ")}) => ${this.returnType.toString()}`
	}
}
