import { Import } from "./model"

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
