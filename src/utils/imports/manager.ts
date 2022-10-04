import { existsSync } from "fs"
import { resolve } from "path"
import { Import } from "./model"
import { L } from "../logger"
import { UnresolvedImportError } from "./errors"

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

	public resolve(i: Import) {
		const lp = [`<ImportManager.resolve>`, i.toString()]
		L.d(...lp)

		if (isRelativePath(i.from)) {
			const pathToFile = resolve(i.sourceDir, i.from)

			const tsPath = `${pathToFile}.ts`
			const tsxPath = `${pathToFile}.tsx`

			L.d(...lp, `trying if exists: ${tsPath}`)

			if (existsSync(tsPath)) {
				L.d(...lp, `"${tsPath}" path exists`)
				return tsPath
			}

			if (existsSync(tsxPath)) {
				L.d(...lp, `"${tsPath}" path exists`)
				return tsxPath
			}

			throw new UnresolvedImportError(i)
		} else {
			// this is a library
			// TODO node_modules
			// TODO @types
			throw new UnresolvedImportError(i)
		}
	}
}

function isRelativePath(s: string) {
	return s.startsWith("../") || s.startsWith("./")
}
