import test from 'ava';
import { resolve } from 'path';
import { Parser } from '../src/parser';
import { ArrayType } from "../src/models/ArrayType";
import { ArrayTypeDeclaration } from "../src/models/ArrayTypeDeclaration";


let parser: Parser
test.before(() => parser = new Parser(resolve(__dirname, "fixtures", "arrayType.ts")))

test('should parse the BasicArray ArrayTypeDeclaration', t => {
	const declaration = parser.getTypeDeclaration("BasicArray")
	t.is(declaration?.identifier, "BasicArray")
	t.is(declaration?.exported, false)
	t.is(declaration?.default, false)
	t.assert(declaration instanceof ArrayTypeDeclaration)
	t.assert(declaration?.type instanceof ArrayType)
});

// toString

test('toString for BasicArray', t => {
	const str = parser.getTypeDeclaration("BasicArray")?.toString();
	t.is(str, "type BasicArray = Array<string>")
})

test('toString for BasicArrayVersion', t => {
	const str = parser.getTypeDeclaration("BasicArrayVersion")?.toString();
	t.is(str, "type BasicArrayVersion = Array<string>")
})

test('toString for UnionArray', t => {
	const str = parser.getTypeDeclaration("UnionArray")?.toString();
	t.is(str, "type UnionArray = Array<string | number>")
})

test('toString for ObjectArray', t => {
	const str = parser.getTypeDeclaration("ObjectArray")?.toString();
	t.is(str, "type ObjectArray = Array<{ str: string }>")
})

test('toString for ArrayObjectArray', t => {
	const str = parser.getTypeDeclaration("ArrayObjectArray")?.toString();
	t.is(str, "type ArrayObjectArray = Array<{ str: Array<string | number> }>")
})

test('toString for ImportedBasicArrayType after resolve', t => {
	const str = parser.resolve("ImportedBasicArrayType")?.toString();
	t.is(str, "type ImportedBasicArrayType = Array<string>")
})