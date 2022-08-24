import { resolve } from "path"
import { Parser } from "./src/parser"
import { L } from "./src/utils/logger"

const parser = new Parser(resolve(__dirname, "tests", "fixtures", "example.ts"))
// console.log(parser.getTypeDeclaration("City")?.toString())

console.log("is real date resolved:", parser.isResolved("RealDate"))
console.log("is big union resolved:", parser.isResolved("BigUnion"))

L.on()
console.log(parser.resolve("BigUnion").toString())