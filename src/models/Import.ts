import { existsSync } from "fs"
import { parse, resolve } from "path"
import { L } from "../utils/logger"

// TODO not sure if this should be in some kind of utils/import package
export class Import {
	constructor(
		/** the path of the file that contains the import declaration. */
		private source: string,
		/** the relative path to the target file of the import. */
		public from: string,
		/** the named exports (`import { named } from "./from"`). */
		private named: Array<string>,
		/** the default exports (`import default from "./from"`). */
		private default_: string | null
	) {}

	public resolve() {
		L.d(`<resolve>`, this.toString())

		const { dir } = parse(this.source)
		const pathToFile = resolve(dir, this.from)
		const tsPath = `${pathToFile}.ts`
		const tsxPath = `${pathToFile}.tsx`

		L.d(`<resolve>`, `trying if exists: ${tsPath}`)

		if (existsSync(tsPath)) {
			L.d(`<resolve>`, `"${tsPath}" path exists`)
			return tsPath
		}

		if (existsSync(tsxPath)) {
			L.d(`<resolve>`, `"${tsPath}" path exists`)
			return tsxPath
		}

		// TODO node_modules
		// TODO @types

		throw new UnresolvedImportError(this)
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

export class UnresolvedImportError extends Error {
	constructor(imp: Import) {
		super()
		this.message = this.createMessage(imp)
	}

	private createMessage(imp: Import): string {
		return [
			`Could not resolve ${imp.toString()} from "${imp.from}".`,
			"",
			"It is possible to suppress this error when the 'breakOnUnresolvedImport' options is set to 'false'.",
			"The type will resolve to unknown then.",
		].join("\n")
	}
}
