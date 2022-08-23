import test from 'ava';
import { resolve } from 'path';
import { Parser, StringType } from '../src/parser';

test('StringTypeDeclaration', t => {
	const parser = new Parser(resolve(__dirname, "fixtures", "stringType.ts"));
	const declaration = parser.getTypeDeclaration("type")
	t.is(declaration?.identifier, "type")
	t.assert(declaration?.type instanceof StringType)
});
