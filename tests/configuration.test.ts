import test from "ava"
import { resolve } from "path"
import { UnresolvedImportError } from "../src/models/Import"
import { UnknownType } from "../src/models/UnknownType"
import { Parser } from "../src/parser"

test("breakOnUnresolvedImports: true", (t) => {
	const parser = new Parser(resolve(__dirname, "fixtures", "configurationTestTypes.ts"), { breakOnUnresolvedImports: true })
	t.throws(
		() => {
			parser.resolve("UnresolvedImport")
		},
		{ instanceOf: UnresolvedImportError }
	)
})

test("breakOnUnresolvedImports: false, should resolve to unknown", (t) => {
	const parser = new Parser(resolve(__dirname, "fixtures", "configurationTestTypes.ts"), { breakOnUnresolvedImports: false })
	const declaration = parser.resolve("UnresolvedImport")
	t.assert(declaration.type instanceof UnknownType)
})
