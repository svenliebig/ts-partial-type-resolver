import { existsSync } from "fs"
import { L } from "./logger"

/**
 * Checks a path with the endings .ts and .tsx and returns the path if a file exists.
 * @param p the path to the file without extension
 */
export function getTsFilePath(p: string): string | null {
	if (existsSync(p)) {
		L.d(`"${p}" path exists, it could be a directory`)

		return getTsFilePath(`${p}/index`)
	}

	const ts = `${p}.ts`
	const tsx = `${p}.tsx`
	const dts = `${p}.d.ts`

	if (existsSync(ts)) {
		L.d(`"${ts}" path exists`)
		return ts
	}

	if (existsSync(tsx)) {
		L.d(`"${tsx}" path exists`)
		return tsx
	}

	if (existsSync(dts)) {
		L.d(`"${dts}" path exists`)
		return dts
	}

	L.d(`the following pathes do not exist:\n - ${[ts, tsx, dts].join("\n - ")}`)
	return null
}
