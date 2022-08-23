import { resolve } from "path"
import { Parser } from "./src/parser"

const parser = new Parser(resolve(__dirname, "tests", "fixtures", "example.ts"))
console.log(parser.getTypeDeclaration("Snow"))
console.log(parser.resolve("Snow"))
console.log()