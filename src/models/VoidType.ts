import { Type } from "./Type"

export class VoidType extends Type {
	constructor(public identifier: string) {
		super()
	}

	toString() {
		return "void"
	}
}
