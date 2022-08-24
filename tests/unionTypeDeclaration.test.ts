import test from 'ava';
import { resolve } from 'path';
import { Parser } from '../src/parser';
import { UnionType } from "../src/models/UnionType";
import { UnionTypeDeclaration } from "../src/models/UnionTypeDeclaration";

let parser: Parser
test.before(() => parser = new Parser(resolve(__dirname, "fixtures", "unionType.ts")))

test('should parse the BasicUnion UnionTypeDeclaration', t => {
	const declaration = parser.getTypeDeclaration("BasicUnion")

	t.is(declaration?.identifier, "BasicUnion")
	t.is(declaration?.exported, false)
	t.is(declaration?.default, false)
	t.assert(declaration instanceof UnionTypeDeclaration)
	t.assert(declaration?.type instanceof UnionType)
});

test('should parse the ExportedBasicUnion UnionTypeDeclaration', t => {
	const declaration = parser.getTypeDeclaration("ExportedBasicUnion")
	
	t.is(declaration?.identifier, "ExportedBasicUnion")
	t.is(declaration?.exported, true)
	t.is(declaration?.default, false)
	t.assert(declaration instanceof UnionTypeDeclaration)
	t.assert(declaration?.type instanceof UnionType)
});

// isResolved

test('should return false for isResolved for ImportedBasicUnion', t => {
	const isResolved = parser.isResolved("ImportedBasicUnion");
	t.is(isResolved, false)
})

test('should return true for isResolved for BasicUnion', t => {
	const isResolved = parser.isResolved("BasicUnion");
	t.is(isResolved, true)
})

// toString

test('toString for BasicUnion', t => {
	const str = parser.getTypeDeclaration("BasicUnion")?.toString();
	t.is(str, "type BasicUnion = string | number")
})

test('toString for ImportedBasicUnion before resolving', t => {
	const str = parser.getTypeDeclaration("ImportedBasicUnion")?.toString();
	t.is(str, "type ImportedBasicUnion = ExportedBasicString | ExportedBasicNumber")
})

test('toString for ImportedBasicUnion after resolving', t => {
	const str = parser.resolve("ImportedBasicUnion")?.toString();
	t.is(str, "type ImportedBasicUnion = string | number")
})

test('toString for ImportedComplexUnion after resolving', t => {
	const str = parser.resolve("ImportedComplexUnion")?.toString();
	t.is(str, "type ImportedComplexUnion = { union: string | number, nested: { object: { str: string, num: number } } } | string | number")
})

test('toString for ImportedArrayUnion after resolving', t => {
	const str = parser.resolve("ImportedArrayUnion")?.toString();
	t.is(str, "type ImportedArrayUnion = Array<string> | { arr: Array<string | number> }")
})

test('toString for ImportedArrayVersionUnion after resolving', t => {
	const str = parser.resolve("ImportedArrayVersionUnion")?.toString();
	t.is(str, "type ImportedArrayVersionUnion = Array<string> | { arr: Array<string | number> }")
})
