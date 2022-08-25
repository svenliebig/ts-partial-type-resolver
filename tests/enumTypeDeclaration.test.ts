import test from "ava"
import { resolve } from "path"
import { Parser } from "../src/parser"
import { EnumType } from "../src/models/EnumType"
import { EnumTypeDeclaration } from "../src/models/EnumTypeDeclaration"

let parser: Parser
test.before(() => (parser = new Parser(resolve(__dirname, "fixtures", "enumType.ts"))))

test("should parse the BasicEnum EnumTypeDeclaration", (t) => {
	const declaration = parser.getTypeDeclaration("BasicEnum")
	t.is(declaration?.identifier, "BasicEnum")
	t.is(declaration?.exported, false)
	t.is(declaration?.default, false)
	t.assert(declaration instanceof EnumTypeDeclaration)
	t.assert(declaration?.type instanceof EnumType)
})

// member

test("should return the correct members for BasicEnum", (t) => {
	const declaration = parser.getTypeDeclaration("BasicEnum") as EnumTypeDeclaration
	t.is(declaration.type.members.get("VALUE"), "VALUE")
	t.is(declaration.type.members.get("ANOTHER"), "ANOTHER")
})

test("should return the correct members for BasicEnumWithoutValue", (t) => {
	const declaration = parser.getTypeDeclaration("BasicEnumWithoutValue") as EnumTypeDeclaration
	t.is(declaration.type.members.get("VALUE"), 0)
	t.is(declaration.type.members.get("ANOTHER"), 1)
})

// toString

test("toString for BasicEnum", (t) => {
	const str = parser.getTypeDeclaration("BasicEnum")?.toString()
	t.is(str, `enum BasicEnum { VALUE = "VALUE", ANOTHER = "ANOTHER" }`)
})

test("toString for ArrayOfEnums", (t) => {
	const declaration = parser.getTypeDeclaration("ArrayOfEnums") as EnumTypeDeclaration
	t.is(declaration.toString(), `type ArrayOfEnums = Array<BasicEnum>`)
})
