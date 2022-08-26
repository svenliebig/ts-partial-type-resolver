# TypeScript Partial Type Resolver

[![Coverage Status](https://coveralls.io/repos/github/svenliebig/ts-partial-type-resolver/badge.svg?branch=master)](https://coveralls.io/github/svenliebig/ts-partial-type-resolver?branch=master)

Under Construction 🏗

But feel free to look around!

---

This project has it's motiviation from creating mock data. I want to resolve types without compiling the whole project, and just load these types that I need. The goal is to resolve types like this:

```ts
type Person = {
	address: Address
	name: string
}
```

Into types like this:

```ts
type Person = {
	address: {
		street: string
		state: string
		city: string
		postalcode: number
	}
	name: string
}
```

## Usage

Let's assume the following structure (You can also see the sources of that example [here](https://github.com/svenliebig/ts-partial-type-resolver/tree/master/examples/person).

```ts
// state.ts
export enum State {
	ALABAMA = "AL",
	CALIFORNIA = "CA",
	NEVADA = "NV",
}

// language.ts
export enum Language {
	ENGLISH = "EN",
	GERMAN = "DE",
}

// address.ts
import { State } from "./state"

export type Address = {
	street: string
	state: State
	city: string
	postalcode: number
}

// person.ts
import { Language } from "./language"
import { Address } from "./address"

type Person = {
	name: string
	surname: string
	address: Address
	languages: Array<Language>
	employed: boolean
}
```

You can execute the parser like that:

```ts
import { Parser, prettify } from "ts-partial-type-parser"

const path = resolve(__dirname, "person.ts")
const parser = new Parser(path)
const person = parser.resolve("Person")

console.log(prettify(person.toString()))
```

that will log:

```ts
type Person = {
	name: string
	surname: string
	address: {
		street: string
		state: State
		city: string
		postalcode: number
	}
	languages: Array<Language>
	employed: boolean
}
```

it resolves the type. So you can also rewrite the type, with `rewrite`:

```ts
import { Parser, prettify, rewrite } from "ts-partial-type-parser"

const path = resolve(__dirname, "person.ts")
const parser = new Parser(path)
const person = parser.resolve("Person")

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
```

this will output:

```ts
const mock = {
	name: faker.string(),
	surname: faker.string(),
	address: {
		street: faker.string(),
		state: State.ALABAMA,
		city: faker.string(),
		postalcode: faker.number(),
	},
	languages: [Language.ENGLISH],
	employed: faker.boolean(),
}
```

That way you can create mocking types or rewriting types!

## Supported

- [x] - `string`
- [x] - `number`
- [x] - `Date`
- [x] - `string & number literal`
- [x] - `objects (type literal)`
- [x] - `union types`
- [x] - `type reference inside the same file`
- [x] - `type reference from an import`
- [x] - `Array<TYPE>`
- [x] - `TYPE[] - Array`
- [x] - `Intersection`
- [x] - `Enums`
- [x] - `null`
- [x] - Configuration to define types that should not be resolved

## TODO

- [ ] - `Parenthesiszed Types`
- [ ] - `Boolean`
- [ ] - `import * as Type`
- [ ] - `export * from`
- [ ] - `Interface`
- [ ] - `Extends`
- [ ] - `Pick`
- [ ] - `void`
- [ ] - `library imports`
- [ ] - `undefined`
- [ ] - `function`
- [ ] - `? optional properties`
- [ ] - `Omit`
- [ ] - `[string, number]`
- [ ] - Looped types create a loop in the code

```

```
