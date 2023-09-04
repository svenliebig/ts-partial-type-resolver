import { existsSync, readFileSync } from "fs"
import { platform } from "os"
import { resolve, sep } from "path"
import { L } from "../logger"
import { UnresolvedImportError } from "./errors"
import { Import } from "./model"
import { getTsFilePath } from "../getTsFilePath"

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
		L.enter(`ImportManager.resolve(${JSON.stringify(i)}))`)

		if (isRelativePath(i.from)) {
			const pathToFile = resolve(i.sourceDir, i.from)

			const path = getTsFilePath(pathToFile)

			if (path !== null) {
				L.exit()
				return path
			}

			L.exit()
			throw new UnresolvedImportError(i)
		} else {
			L.d(`it's a library path or an alias path`)

			// this should get the Import and find the package json with the source
			const packageJsonPath = findClosestPackageJson(i.sourceDir)

			if (packageJsonPath === null) {
				L.f(`no package.json found`)
				L.exit()
				throw new UnresolvedImportError(i)
			}

			L.s(`found package.json: ${packageJsonPath}`)

			const { dependencies, devDependencies } = JSON.parse(readFileSync(packageJsonPath, "utf-8"))
			const allDependencies = { ...dependencies, ...devDependencies }

			const [modulePath, hasModule] = isIn(i.from, allDependencies)
			if (hasModule) {
				const module = resolve(packageJsonPath, "..", "node_modules", modulePath)
				L.s(`found dependency '${modulePath}' in package.json, resolving node_modules...`)

				if (existsSync(module)) {
					L.s(`module exists in ${module}`)
					const modulepkg = JSON.parse(readFileSync(resolve(module, "package.json"), "utf-8"))

					if ("types" in modulepkg) {
						L.s(`found types in ${modulepkg.types}`)
						L.exit()
						return resolve(module, modulepkg.types)
					} else {
						L.f(`no types found in ${modulepkg.types}`)
					}
				} else {
					L.f(`module does not exist in ${module}`)
				}
			} else {
				L.f(`dependency '${i.from}' not found in package.json`)
			}

			// -- resolve node_modules

			// -- -- resolve package name
			// -- -- resolve @types

			// -- -- -- parse package.json and find `types` property
			// -- -- -- find relative file path to that file
			L.exit()
			throw new UnresolvedImportError(i)
		}
	}
}

function isRelativePath(s: string) {
	return s.startsWith("../") || s.startsWith("./")
}

const root = platform() == "win32" ? process.cwd().split(sep)[0] : "/"

function findClosestPackageJson(source: string): string | null {
	if (source === root) {
		return null
	}

	const p = resolve(source, "..", "package.json")

	if (existsSync(p)) {
		return p
	}

	return findClosestPackageJson(resolve(source, ".."))
}

function isIn(module: string, deps: Record<string, string>): [string, boolean] {
	if (module in deps) {
		return [module, true]
	}

	const parts = module.split("/")

	if (parts.length == 1) {
		return ["", false]
	}

	parts.pop()

	if (parts.length === 1) {
		return ["", false]
	}

	return isIn(parts.join("/"), deps)
}
