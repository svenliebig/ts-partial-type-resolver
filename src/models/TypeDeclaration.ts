import { DeclarationMeta } from "../parser"
import { Type } from "./Type"

export abstract class TypeDeclaration {
	public abstract type: Type
	public identifier: string
	public exported: boolean
	public default: boolean

	constructor(meta: DeclarationMeta) {
		this.identifier = meta.identifier
		this.exported = meta.exported
		this.default = meta.default
	}

	getMeta(): DeclarationMeta {
		return {
			default: this.default,
			exported: this.exported,
			identifier: this.identifier,
		}
	}

	abstract typeToString(): string

	toString(): string {
		return `${this.exported ? "export " : ""}type ${this.identifier} = ${this.type.toString()}`
	}
}
