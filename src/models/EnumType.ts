
export type EnumMembers = Map<string, string | number>

export class EnumType {
	public members: EnumMembers

	constructor(members: EnumMembers) {
		// TODO
		this.members = new Map()
	}

	public toString(): string {
		return ""
	}
}
