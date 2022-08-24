
import test from 'ava';
import { resolve } from 'path';
import { Parser } from '../src/parser';
import { TypeLiteral } from "../src/models/TypeLiteral";
import { TypeLiteralDeclaration } from "../src/models/TypeLiteralDeclaration";

let parser: Parser
test.before(() => parser = new Parser(resolve(__dirname, "fixtures", "typeLiteral.ts")))

test('should parse the BasicTypeLiteral TypeLiteralDeclaration', t => {
	const declaration = parser.getTypeDeclaration("BasicTypeLiteral")

	t.is(declaration?.identifier, "BasicTypeLiteral")
	t.is(declaration?.exported, false)
	t.is(declaration?.default, false)
	t.assert(declaration instanceof TypeLiteralDeclaration)
	t.assert(declaration?.type instanceof TypeLiteral)
});

test('toString for BasicTypeLiteral', t => {
	const str = parser.getTypeDeclaration("BasicTypeLiteral")?.toString();
	t.is(str, "type BasicTypeLiteral = {\n\tstr: string\n\tnum: number\n}")
})

test('toString for NestedTypeLiteral', t => {
	const str = parser.getTypeDeclaration("NestedTypeLiteral")?.toString();
	t.is(str, "type NestedTypeLiteral = {\n\tstr: string\n\tnested: {\n\tnum: number\n}\n}")
})
