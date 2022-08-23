import test from 'ava';
import { resolve } from 'path';
import { Parser, StringType, StringTypeDeclaration } from '../src/parser';

test('should parse the basic StringTypeDeclaration', t => {
	const parser = new Parser(resolve(__dirname, "fixtures", "stringType.ts"));
	const declaration = parser.getTypeDeclaration("basic")

	t.is(declaration?.identifier, "basic")
	t.is(declaration?.exported, false)
	t.is(declaration?.default, false)
	t.assert(declaration instanceof StringTypeDeclaration)
	t.assert(declaration?.type instanceof StringType)
});

test('should parse the exportedBasic StringTypeDeclaration', t => {
	const parser = new Parser(resolve(__dirname, "fixtures", "stringType.ts"));
	const declaration = parser.getTypeDeclaration("exportedBasic")

	t.is(declaration?.identifier, "exportedBasic")
	t.is(declaration?.exported, true)
	t.is(declaration?.default, false)
	t.assert(declaration instanceof StringTypeDeclaration)
	t.assert(declaration?.type instanceof StringType)
});
