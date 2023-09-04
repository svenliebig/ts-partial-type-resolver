import { normalize } from "path"
import { TypeDeclaration } from "../models/TypeDeclaration"
import { L } from "./logger"

export class FileManager {
	private files: Map<string, Array<string>> = new Map()

	public addTypeDeclarationToFile(file: string, declaration: TypeDeclaration) {
		L.enter(`${FileManager.name}.addTypeDeclarationToFile(${file}, ${declaration.identifier})`)

		const path = normalize(file)
		if (!this.files.has(path)) {
			L.d("!hasPath", "we add an empty array on that entry")
			this.files.set(path, [])
		}

		const declarations = this.files.get(path)! // we know this because of the previous !has
		if (!declarations.includes(declaration.identifier)) {
			L.d("the identifier is not included", "added the identifier to the array")
			declarations?.push(declaration.identifier)
		} else {
			L.d("the identifier is already")
		}

		L.exit()
	}

	public getFilePathOf(declaration: TypeDeclaration) {
		for (const entry of this.files) {
			const declarations = entry[1]
			if (declarations.includes(declaration.identifier)) {
				return entry[0]
			}
		}

		return null
	}
}
