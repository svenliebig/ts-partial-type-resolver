import test from "ava"
import { resolve } from "path"
import { UnknownType } from "../src/models/UnknownType"
import { Parser } from "../src/parser"
import { UnresolvedImportError } from "../src/utils/imports/errors"

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
