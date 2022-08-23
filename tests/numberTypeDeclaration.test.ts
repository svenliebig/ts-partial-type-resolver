import test from 'ava';
import { resolve } from 'path';
import { NumberType } from '../src/models/NumberType';
import { NumberTypeDeclaration } from '../src/models/NumberTypeDeclaration';
import { Parser } from '../src/parser';

test('should parse the BasicNumber NumberTypeDeclaration', t => {
	const parser = new Parser(resolve(__dirname, "fixtures", "numberType.ts"));
	const declaration = parser.getTypeDeclaration("BasicNumber")

	t.is(declaration?.identifier, "BasicNumber")
	t.is(declaration?.exported, false)
	t.is(declaration?.default, false)
	t.assert(declaration instanceof NumberTypeDeclaration)
	t.assert(declaration?.type instanceof NumberType)
	t.is(declaration?.toString(), "type BasicNumber = number")
});

test('should parse the ExportedBasicNumber NumberTypeDeclaration', t => {
	const parser = new Parser(resolve(__dirname, "fixtures", "numberType.ts"));
	const declaration = parser.getTypeDeclaration("ExportedBasicNumber")
	
	t.is(declaration?.identifier, "ExportedBasicNumber")
	t.is(declaration?.exported, true)
	t.is(declaration?.default, false)
	t.assert(declaration instanceof NumberTypeDeclaration)
	t.assert(declaration?.type instanceof NumberType)
	t.is(declaration?.toString(), "export type ExportedBasicNumber = number")
});
