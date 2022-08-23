import test from 'ava';
import { resolve } from 'path';
import { Parser, StringType, StringTypeDeclaration } from '../src/parser';

test('should parse a complete StringTypeDeclaration', t => {
	const parser = new Parser(resolve(__dirname, "fixtures", "stringType.ts"));
	const declaration = parser.getTypeDeclaration("type")

	t.is(declaration?.identifier, "type")
	t.is(declaration?.exported, false)
	t.is(declaration?.default, false)
	t.assert(declaration instanceof StringTypeDeclaration)
	t.assert(declaration?.type instanceof StringType)
});
