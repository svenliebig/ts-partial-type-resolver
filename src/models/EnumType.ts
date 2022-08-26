import { Type } from "./Type"

export type EnumMembers = Map<string, string | number>

export class EnumType extends Type {
	public name: string
	public members: EnumMembers

	constructor(name: string, members: EnumMembers) {
		super()

		this.name = name
		this.members = members
	}

	public toString(): string {
		return this.name
	}
}
