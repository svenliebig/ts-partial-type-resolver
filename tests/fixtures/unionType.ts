import { ExportedBasicNumber } from "./numberType"
import { ExportedBasicString } from "./stringType"

type BasicUnion = string | number
export type ExportedBasicUnion = string | number

type ImportedBasicUnion = ExportedBasicString | ExportedBasicNumber

export type ExportedUnionWithImportedTypes = ExportedBasicString | ExportedBasicNumber