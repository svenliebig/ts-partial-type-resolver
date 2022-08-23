import test from 'ava';
import { resolve } from 'path';
import { Parser } from '../src/parser';
import { StringType } from "../src/models/StringType";
import { StringTypeDeclaration } from "../src/models/StringTypeDeclaration";

test('should parse the BasicString StringTypeDeclaration', t => {
	const parser = new Parser(resolve(__dirname, "fixtures", "stringType.ts"));
	const declaration = parser.getTypeDeclaration("BasicString")

	t.is(declaration?.identifier, "BasicString")
	t.is(declaration?.exported, false)
	t.is(declaration?.default, false)
	t.assert(declaration instanceof StringTypeDeclaration)
	t.assert(declaration?.type instanceof StringType)
});

test('should parse the ExportedBasicString StringTypeDeclaration', t => {
	const parser = new Parser(resolve(__dirname, "fixtures", "stringType.ts"));
	const declaration = parser.getTypeDeclaration("ExportedBasicString")

	t.is(declaration?.identifier, "ExportedBasicString")
	t.is(declaration?.exported, true)
	t.is(declaration?.default, false)
	t.assert(declaration instanceof StringTypeDeclaration)
	t.assert(declaration?.type instanceof StringType)
});
