import { resolve } from "path"
import { Parser } from "./src/parser"
import { L } from "./src/utils/logger"

L.on()
const parser = new Parser(resolve(__dirname, "tests", "fixtures", "example.ts"))
console.log(parser.getTypeDeclaration("Arr")?.toString())