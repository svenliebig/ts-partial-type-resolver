import { parse } from "path"

export class Import {
	private _sourceDir: string | null = null

	constructor(
		/** the path of the file that contains the import declaration. */
		public source: string,
		/** the relative path to the target file of the import. */
		public from: string,
		/** the named exports (`import { named } from "./from"`). */
		private named: Array<string>,
		/** the default exports (`import default from "./from"`). */
		private default_: string | null
	) {}

	public get sourceDir(): string {
		if (!this._sourceDir) {
			this._sourceDir = parse(this.source).dir
		}
		return this._sourceDir
	}

	/**
	 * Checks if the {@link Import} contains a specific identifier.
	 *
	 * For example: `import Jon, { Doe } from "./helloworld"`
	 *
	 * Would result in:
	 *
	 * ```ts
	 * containsIdentifier("Jon") // true
	 * containsIdentifier("Doe") // true
	 * containsIdentifier("helloworld") // false
	 * ```
	 */
	public containsIdentifier(name: string) {
		return this.default_ === name || this.named.includes(name)
	}

	public toString() {
		return `import ${this.default_ ? `${this.default_} ` : ""}${this.named.length > 0 ? `{ ${this.named.join(", ")} }` : ""} from "${this.from}"`
	}
}
