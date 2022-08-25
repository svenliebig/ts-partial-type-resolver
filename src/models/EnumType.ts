
export type EnumMembers = Map<string, string | number>

export class EnumType {
	public name: string
	public members: EnumMembers

	constructor(name: string, members: EnumMembers) {
		this.name = name
		this.members = members
	}

	public toString(): string {
		return this.name
	}
}
