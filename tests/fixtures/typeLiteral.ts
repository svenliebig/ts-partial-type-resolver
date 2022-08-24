import { ExportedBasicNumber } from "./numberType"
import { ExportedBasicString } from "./stringType"
import { ExportedUnionWithImportedTypes } from "./unionType"

type BasicTypeLiteral = {
	str: string
	num: number
}

type ImportedBasicTypeLiteral = {
	str: ExportedBasicString
	num: ExportedBasicNumber
}

type ImportedTypeLiteralWithUnion = {
	union: ExportedBasicString | ExportedBasicNumber
}

type ImportedNestedTypeLiteralWithUnion = {
	nested: {
		union: ExportedBasicString | ExportedBasicNumber
	}
}

type NestedTypeLiteral = {
	str: string
	nested: {
		num: number
	}
}

type ComplexNestedTypeLiteralWithImports = {
	union: ExportedUnionWithImportedTypes
	nested: {
		object: BasicTypeLiteral
	}
}