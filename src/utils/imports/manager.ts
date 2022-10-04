import { Import } from "../../models/Import"

export class ImportManager {
	private imports: Array<Import> = []

	public add(i: Import) {
		this.imports.push(i)
	}

	/**
	 * @param s an identifier of a declaration
	 */
	public get(s: string): Import | undefined {
		return this.imports.find((imp) => imp.containsIdentifier(s))
	}

	public remove(i: Import) {
		this.imports.splice(this.imports.indexOf(i), 1)
	}
}
