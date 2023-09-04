import { Type } from "./Type"

export class FunctionType extends Type {
	constructor(public identifier: string, public returnType: Type) {
		super()
	}

	toString() {
		return `() => ${this.returnType.toString()}`
	}
}
