import test from "ava"
import { resolve } from "path"
import { NumberType, StringType, UnionType } from "../src"
import { FunctionType } from "../src/models/FunctionType"
import { FunctionTypeDeclaration } from "../src/models/FunctionTypeDeclaration"
import { VoidType } from "../src/models/VoidType"
import { Parser } from "../src/parser"
import { assertInstance } from "./utils/assertInstance"

let parser: Parser
test.before(() => (parser = new Parser(resolve(__dirname, "fixtures", "functionType.ts"))))

test("should parse the StringFunction", (t) => {
	const declaration = parser.getDeclaration("StringFunction")

	t.is(declaration?.identifier, "StringFunction")
	t.is(declaration?.exported, false)
	t.is(declaration?.default, false)
	assertInstance(t, declaration, FunctionTypeDeclaration)

	const { type } = declaration as FunctionTypeDeclaration
	assertInstance(t, type, FunctionType)
	assertInstance(t, type.returnType, StringType)
	t.is((type as FunctionType).identifier, "StringFunction")

	t.is(declaration?.toString(), "type StringFunction = () => string")
})

test("should parse the NumberFunction", (t) => {
	const declaration = parser.getDeclaration("NumberFunction")

	t.is(declaration?.identifier, "NumberFunction")
	t.is(declaration?.exported, false)
	t.is(declaration?.default, false)
	assertInstance(t, declaration, FunctionTypeDeclaration)

	const { type } = declaration as FunctionTypeDeclaration
	assertInstance(t, type, FunctionType)
	assertInstance(t, type.returnType, NumberType)
	t.is((type as FunctionType).identifier, "NumberFunction")

	t.is(declaration?.toString(), "type NumberFunction = () => number")
})

test("should parse the UnionFunction", (t) => {
	const declaration = parser.getDeclaration("UnionFunction")

	t.is(declaration?.identifier, "UnionFunction")
	t.is(declaration?.exported, false)
	t.is(declaration?.default, false)
	assertInstance(t, declaration, FunctionTypeDeclaration)

	const { type } = declaration as FunctionTypeDeclaration
	assertInstance(t, type, FunctionType)
	assertInstance(t, type.returnType, UnionType)
	assertInstance(t, (type.returnType as UnionType).types[0], NumberType)
	assertInstance(t, (type.returnType as UnionType).types[1], StringType)
	t.is((type as FunctionType).identifier, "UnionFunction")

	t.is(declaration?.toString(), "type UnionFunction = () => number | string")
})

test("should parse the VoidFunction", (t) => {
	const declaration = parser.getDeclaration("VoidFunction")

	t.is(declaration?.identifier, "VoidFunction")
	t.is(declaration?.exported, false)
	t.is(declaration?.default, false)
	assertInstance(t, declaration, FunctionTypeDeclaration)

	const { type } = declaration as FunctionTypeDeclaration
	assertInstance(t, type, FunctionType)
	assertInstance(t, type.returnType, VoidType)
	t.is((type as FunctionType).identifier, "VoidFunction")

	t.is(declaration?.toString(), "type VoidFunction = () => void")
})

test("should parse the VoidFunctionWithParameter", (t) => {
	const declaration = parser.getDeclaration("VoidFunctionWithParameter")

	t.is(declaration?.identifier, "VoidFunctionWithParameter")
	t.is(declaration?.exported, false)
	t.is(declaration?.default, false)
	assertInstance(t, declaration, FunctionTypeDeclaration)

	const { type } = declaration as FunctionTypeDeclaration
	assertInstance(t, type, FunctionType)
	assertInstance(t, type.returnType, VoidType)
	t.is((type as FunctionType).identifier, "VoidFunctionWithParameter")

	t.is(declaration?.toString(), "type VoidFunctionWithParameter = (p: string) => void")
})

test("should parse the VoidFunctionWithParameters", (t) => {
	const declaration = parser.getDeclaration("VoidFunctionWithParameters")

	t.is(declaration?.identifier, "VoidFunctionWithParameters")
	t.is(declaration?.exported, false)
	t.is(declaration?.default, false)
	assertInstance(t, declaration, FunctionTypeDeclaration)

	const { type } = declaration as FunctionTypeDeclaration
	assertInstance(t, type, FunctionType)
	assertInstance(t, type.returnType, VoidType)
	t.is((type as FunctionType).identifier, "VoidFunctionWithParameters")

	t.is(declaration?.toString(), "type VoidFunctionWithParameters = (p: string, n: number) => void")
})

test("should parse the FunctionWithFunctionParameter", (t) => {
	const declaration = parser.getDeclaration("FunctionWithFunctionParameter")

	t.is(declaration?.identifier, "FunctionWithFunctionParameter")
	t.is(declaration?.exported, false)
	t.is(declaration?.default, false)
	assertInstance(t, declaration, FunctionTypeDeclaration)

	const { type } = declaration as FunctionTypeDeclaration
	assertInstance(t, type, FunctionType)
	assertInstance(t, type.returnType, VoidType)
	t.is((type as FunctionType).identifier, "FunctionWithFunctionParameter")

	t.is(declaration?.toString(), "type FunctionWithFunctionParameter = (f: NumberFunction) => void")
})
