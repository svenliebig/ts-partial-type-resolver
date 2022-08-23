import test from 'ava';
import { resolve } from 'path';
import { LiteralType } from '../src/models/LiteralType';
import { LiteralTypeDeclaration } from '../src/models/LiteralTypeDeclaration';
import { Parser } from '../src/parser';

test('should parse the BasicLiteral LiteralTypeDeclaration', t => {
	const parser = new Parser(resolve(__dirname, "fixtures", "literalType.ts"));
	const declaration = parser.getTypeDeclaration("BasicLiteral")

	t.is(declaration?.identifier, "BasicLiteral")
	t.is(declaration?.exported, false)
	t.is(declaration?.default, false)
	t.assert(declaration instanceof LiteralTypeDeclaration)
	t.assert(declaration?.type instanceof LiteralType)
	t.is(declaration?.toString(), "type BasicLiteral = \"string\"")
});

test('should parse the ExportedBasicLiteral LiteralTypeDeclaration', t => {
	const parser = new Parser(resolve(__dirname, "fixtures", "literalType.ts"));
	const declaration = parser.getTypeDeclaration("ExportedBasicLiteral")
	
	t.is(declaration?.identifier, "ExportedBasicLiteral")
	t.is(declaration?.exported, true)
	t.is(declaration?.default, false)
	t.assert(declaration instanceof LiteralTypeDeclaration)
	t.assert(declaration?.type instanceof LiteralType)
	t.is(declaration?.toString(), "export type ExportedBasicLiteral = 1")
});
