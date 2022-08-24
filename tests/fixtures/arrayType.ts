import { ExportedBasicString } from "./stringType"

type BasicArray = Array<string>
type BasicArrayVersion = string[]
type UnionArray = Array<string | number>
type ObjectArray = Array<{ str: string }>
type ArrayObjectArray = Array<{ str: Array<string | number> }>
type ImportedBasicArrayType = Array<ExportedBasicString>