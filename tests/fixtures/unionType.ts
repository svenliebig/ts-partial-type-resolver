import { ExportedBasicNumber } from "./numberType"
import { ExportedBasicString } from "./stringType"
import { ExportedComplexNestedTypeLiteralWithImports } from "./typeLiteral"

type BasicUnion = string | number
export type ExportedBasicUnion = string | number

type ImportedBasicUnion = ExportedBasicString | ExportedBasicNumber

export type ExportedUnionWithImportedTypes = ExportedBasicString | ExportedBasicNumber

type ImportedComplexUnion = ExportedComplexNestedTypeLiteralWithImports | BasicUnion 

type ImportedArrayUnion = Array<string> | { arr: Array<ImportedBasicUnion> }

type ImportedArrayVersionUnion = Array<string> | { arr: ImportedBasicUnion[] }