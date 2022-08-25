# TypeScript Partial Type Resolver

[![Coverage Status](https://coveralls.io/repos/github/svenliebig/ts-partial-type-resolver/badge.svg?branch=master)](https://coveralls.io/github/svenliebig/ts-partial-type-resolver?branch=master)

Under Construction 🏗

But feel free to look around!

---

This project has it's motiviation from creating mock data. I want to resolve types without compiling the whole project, and just load these types that I need. The goal is to resolve types like this:

```ts
type Person = {
	address: Address;
	name: string;
};
```

Into types like this:

```ts
type Person = {
	address: {
		street: string;
		state: string;
		city: string;
		postalcode: number;
	};
	name: string;
};
```

## Usage

TODO

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

## TODO

- [ ] - `Parenthesiszed Types`
- [ ] - `Boolean`
- [ ] - `Interface`
- [ ] - `Enums`
- [ ] - `Extends`
- [ ] - `Pick`
- [ ] - `void`
- [ ] - `library imports`
- [ ] - `null`
- [ ] - `undefined`
- [ ] - `? optional properties`
- [ ] - `Omit`
- [ ] - `[string, number]`
- [ ] - Looped types create a loop in the code
