import test from "ava"
import { resolve } from "path"
import { Parser } from "../src/parser"
import { TypeLiteral } from "../src/models/TypeLiteral"
import { TypeLiteralDeclaration } from "../src/models/TypeLiteralDeclaration"

let parser: Parser
test.before(() => (parser = new Parser(resolve(__dirname, "fixtures", "typeLiteral.ts"))))

test("should parse the BasicTypeLiteral TypeLiteralDeclaration", (t) => {
	const declaration = parser.getDeclaration("BasicTypeLiteral")

	t.is(declaration?.identifier, "BasicTypeLiteral")
	t.is(declaration?.exported, false)
	t.is(declaration?.default, false)
	t.assert(declaration instanceof TypeLiteralDeclaration)
	t.assert(declaration?.type instanceof TypeLiteral)
})

// toString

test("toString for BasicTypeLiteral", (t) => {
	const str = parser.getDeclaration("BasicTypeLiteral")?.toString()
	t.is(str, "type BasicTypeLiteral = { str: string, num: number }")
})

test("toString for NestedTypeLiteral", (t) => {
	const str = parser.getDeclaration("NestedTypeLiteral")?.toString()
	t.is(str, "type NestedTypeLiteral = { str: string, nested: { num: number } }")
})

test("toString for ImportedBasicTypeLiteral before resolve", (t) => {
	const str = parser.getDeclaration("ImportedBasicTypeLiteral")?.toString()
	t.is(str, "type ImportedBasicTypeLiteral = { str: ExportedBasicString, num: ExportedBasicNumber }")
})

test("toString for ImportedBasicTypeLiteral after resolve", (t) => {
	const str = parser.resolve("ImportedBasicTypeLiteral")?.toString()
	t.is(str, "type ImportedBasicTypeLiteral = { str: string, num: number }")
})

test("toString for ImportedTypeLiteralWithUnion without resolve", (t) => {
	const str = parser.getDeclaration("ImportedTypeLiteralWithUnion")?.toString()
	t.is(str, "type ImportedTypeLiteralWithUnion = { union: ExportedBasicString | ExportedBasicNumber }")
})

test("toString for ImportedTypeLiteralWithUnion after resolve", (t) => {
	const str = parser.resolve("ImportedTypeLiteralWithUnion")?.toString()
	t.is(str, "type ImportedTypeLiteralWithUnion = { union: string | number }")
})

test("toString for ImportedNestedTypeLiteralWithUnion after resolve", (t) => {
	const str = parser.resolve("ImportedNestedTypeLiteralWithUnion")?.toString()
	const type = ["{", "nested: {", "union: string | number", "}", "}"].join(" ")
	t.is(str, `type ImportedNestedTypeLiteralWithUnion = ${type}`)
})

test("toString for ComplexNestedTypeLiteralWithImports after resolve", (t) => {
	const str = parser.resolve("ComplexNestedTypeLiteralWithImports")?.toString()
	const type = "{ union: string | number, nested: { object: { str: string, num: number } } }"
	t.is(str, `type ComplexNestedTypeLiteralWithImports = ${type}`)
})

test("toString for WithNull after resolve", (t) => {
	const str = parser.resolve("WithNull")?.toString()
	const type = "{ null: null }"
	t.is(str, `type WithNull = ${type}`)
})

test("toString for WithUndefined after resolve", (t) => {
	const str = parser.resolve("WithUndefined")?.toString()
	const type = "{ undefined: undefined }"
	t.is(str, `type WithUndefined = ${type}`)
})

test("toString for WithUnionUndefinedAndString after resolve", (t) => {
	const str = parser.resolve("WithUnionUndefinedAndString")?.toString()
	const type = "{ union: undefined | string }"
	t.is(str, `type WithUnionUndefinedAndString = ${type}`)
})
