import test from 'ava';
import { resolve } from 'path';
import { Parser } from '../src/parser';
import { IntersectionType } from "../src/models/IntersectionType";
import { IntersectionTypeDeclaration } from "../src/models/IntersectionTypeDeclaration";

let parser: Parser
test.before(() => parser = new Parser(resolve(__dirname, "fixtures", "intersectionType.ts")))

test('should parse the BasicIntersection IntersectionTypeDeclaration', t => {
	const declaration = parser.getTypeDeclaration("BasicIntersection")

	t.is(declaration?.identifier, "BasicIntersection")
	t.is(declaration?.exported, false)
	t.is(declaration?.default, false)
	t.assert(declaration instanceof IntersectionTypeDeclaration)
	t.assert(declaration?.type instanceof IntersectionType)
});

// toString

test('toString for BasicIntersection', t => {
	const str = parser.getTypeDeclaration("BasicIntersection")?.toString();
	t.is(str, "type BasicIntersection = string & number")
})

test('toString for ObjectIntersection', t => {
	const str = parser.getTypeDeclaration("ObjectIntersection")?.toString();
	t.is(str, "type ObjectIntersection = { name: string } & { id: number }")
})

test('toString for BasicArrayIntersection', t => {
	const str = parser.getTypeDeclaration("BasicArrayIntersection")?.toString();
	t.is(str, "type BasicArrayIntersection = { name: string } & Array<string>")
})

test('toString for ArrayIntersection', t => {
	const str = parser.resolve("ArrayIntersection")?.toString();
	t.is(str, "type ArrayIntersection = Array<{ name: string } & { id: number }>")
})
