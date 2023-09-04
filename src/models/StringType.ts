import { Type } from "./Type"

export class StringType extends Type {
	constructor(public identifier: string) {
		super()
	}

	toString() {
		return "string"
	}
}
