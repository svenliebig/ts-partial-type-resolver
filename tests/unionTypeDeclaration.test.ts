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

test('toString for BasicUnion', t => {
	const str = parser.getTypeDeclaration("BasicUnion")?.toString();
	t.is(str, "type BasicUnion = string | number")
})

test('should parse the ExportedBasicUnion UnionTypeDeclaration', t => {
	const declaration = parser.getTypeDeclaration("ExportedBasicUnion")

	t.is(declaration?.identifier, "ExportedBasicUnion")
	t.is(declaration?.exported, true)
	t.is(declaration?.default, false)
	t.assert(declaration instanceof UnionTypeDeclaration)
	t.assert(declaration?.type instanceof UnionType)
});
