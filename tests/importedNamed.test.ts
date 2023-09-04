import test from "ava"
import { resolve } from "path"
import { StringType } from "../src"
import { StringTypeDeclaration } from "../src/models/StringTypeDeclaration"
import { Parser } from "../src/parser"
import { L } from "../src/utils/logger"

let parser: Parser
test.before(() => (parser = new Parser(resolve(__dirname, "fixtures", "importedNamed.ts"))))
L.on()

test("should parse the ImportedNamed as StringTypeDeclaration", (t) => {
	const declaration = parser.resolve("ImportedNamed")
	t.is(declaration?.identifier, "ImportedNamed")
	t.is(declaration?.exported, false)
	t.is(declaration?.default, false)
	t.assert(declaration instanceof StringTypeDeclaration)
	t.assert(declaration?.type instanceof StringType)
})
