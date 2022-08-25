import test from "ava"
import { resolve } from "path"
import { Parser } from "../src/parser"
import { TypeReference } from "../src/models/TypeReference"
import { TypeReferenceDeclaration } from "../src/models/TypeReferenceDeclaration"

let parser: Parser
test.before(() => (parser = new Parser(resolve(__dirname, "fixtures", "typeReference.ts"))))

test("should parse the BasicTypeReference TypeReferenceDeclaration", (t) => {
	const declaration = parser.getDeclaration("BasicTypeReference")

	t.is(declaration?.identifier, "BasicTypeReference")
	t.is(declaration?.exported, false)
	t.is(declaration?.default, false)
	t.assert(declaration instanceof TypeReferenceDeclaration)
	t.assert(declaration?.type instanceof TypeReference)
})

// isResolved

test("isResolved for BasicTypeReference", (t) => {
	const isResolved = parser.isResolved("BasicTypeReference")
	t.is(isResolved, false)
})

test("isResolved for DateTypeReference should be fine because of primitive", (t) => {
	const isResolved = parser.isResolved("DateTypeReference")
	t.is(isResolved, true)
})

test("isResolved for BasicTypeReference as part of doNotResolve", (t) => {
	const parser = new Parser(resolve(__dirname, "fixtures", "typeReference.ts"), { doNotResolve: ["ExportedBasicString"] })
	const isResolved = parser.isResolved("BasicTypeReference")
	t.is(isResolved, true)
})

// toString

test("toString for DateTypeReference without resolve", (t) => {
	const str = parser.getDeclaration("DateTypeReference")?.toString()
	t.is(str, "type DateTypeReference = Date")
})

test("toString for BasicTypeReference without resolve", (t) => {
	const str = parser.getDeclaration("BasicTypeReference")?.toString()
	t.is(str, "type BasicTypeReference = ExportedBasicString")
})

test("toString for BasicTypeReference with resolve", (t) => {
	const str = parser.resolve("BasicTypeReference")?.toString()
	t.is(str, "type BasicTypeReference = string")
})

test("toString for BasicTypeReference as part of doNotResolve", (t) => {
	const parser = new Parser(resolve(__dirname, "fixtures", "typeReference.ts"), { doNotResolve: ["ExportedBasicString"] })
	const declaration = parser.resolve("BasicTypeReference")
	t.is(declaration.toString(), "type BasicTypeReference = ExportedBasicString")
})
