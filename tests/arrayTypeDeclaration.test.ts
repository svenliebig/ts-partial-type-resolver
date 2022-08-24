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