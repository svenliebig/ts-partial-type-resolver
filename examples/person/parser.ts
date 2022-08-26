import { resolve } from "path"
import { Parser } from "../../src/parser"
import { rewrite } from "../../src/rewrite"
import { prettify } from "../../src/utils/prettify"

const path = resolve(__dirname, "person.ts")
const parser = new Parser(path)
const person = parser.resolve("Person")

console.log(prettify(person.toString()))

const rewrittenPerson = rewrite(person.type, {
	boolean(type) {
		return "faker.boolean()"
	},
	string(type) {
		return "faker.string()"
	},
	enum(type) {
		// take the first one
		return `${type.name}.${type.members.keys().next().value}`
	},
	number(type) {
		return "faker.number()"
	},
	reference(type) {
		return type.toString()
	},
})

console.log(`const mock = ${prettify(rewrittenPerson)}`)
