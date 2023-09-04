type StringFunction = () => string
export type ExportedStringFunction = () => string

type NumberFunction = () => number
export type ExportedNumberFunction = () => number

type UnionFunction = () => number | string

type VoidFunction = () => void

type VoidFunctionWithParameter = (p: string) => void
type VoidFunctionWithParameters = (p: string, n: number) => void

type FunctionWithFunctionParameter = (f: NumberFunction) => void
