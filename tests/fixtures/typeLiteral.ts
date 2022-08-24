import { ExportedBasicNumber } from "./numberType"
import { ExportedBasicString } from "./stringType"

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

type NestedTypeLiteral = {
	str: string
	nested: {
		num: number
	}
}