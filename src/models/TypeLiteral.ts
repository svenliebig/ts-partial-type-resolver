import { isIdentifier, isPropertySignature, TypeLiteralNode } from "typescript"
import { Types } from "../parser"
import { TypeFactory } from "../utils/TypeFactory"

export class TypeLiteral {
	public properties: Map<string, Types> = new Map()

	constructor(type: TypeLiteralNode) {
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
