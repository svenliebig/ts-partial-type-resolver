import { isIdentifier, isPropertySignature, TypeLiteralNode } from "typescript"
import { TypeFactory } from "../utils/TypeFactory"
import { Type } from "./Type"

export class TypeLiteral extends Type {
	public properties: Map<string, Type> = new Map()

	constructor(type: TypeLiteralNode) {
		super()

		type.members.forEach((member) => {
			if (isPropertySignature(member)) {
				if (isIdentifier(member.name)) {
					if (member.type) {
						this.properties.set(member.name.text, TypeFactory.create(member.type))
					} else {
						throw new Error(`Member has no type node: ${member.name.text}`)
					}
				} else {
					throw new Error(`Unknown identifier in TypeLiteralNode member kind: ${member.name.kind}`)
				}
				return
			}

			throw new Error(`Unknown member in TypeLiteralNode kind: ${member.kind}`)
		})
	}

	toString(): string {
		return [
			"{",
			Array.from(this.properties.keys())
				.map((key) => `${key}: ${this.properties.get(key)?.toString()}`)
				.join(", "),
			"}",
		].join(" ")
	}
}
