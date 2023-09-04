import { isIdentifier, isIndexSignatureDeclaration, isMethodSignature, isPropertySignature, TypeElement, TypeLiteralNode } from "typescript"
import { TypeFactory } from "../utils/TypeFactory"
import { Type } from "./Type"
import { printSyntaxKind } from "../utils/printSyntaxKind"

export class TypeLiteral extends Type {
	public properties: Map<string, Type> = new Map()

	constructor(type: TypeLiteralNode) {
		super()

		type.members.forEach((member) => {
			if (isPropertySignature(member)) {
				if (isIdentifier(member.name)) {
					if (member.type) {
						this.properties.set(member.name.text, TypeFactory.create(member.type, member.name.text))
					} else {
						throw new Error(`Member has no type node: ${member.name.text}`)
					}
				} else {
					throw new Error(`Unknown identifier in TypeLiteralNode member kind: ${member.name.kind}`)
				}
				return
			}

			if (isMethodSignature(member)) {
				if (isIdentifier(member.name)) {
					if (member.type) {
						this.properties.set(member.name.text, TypeFactory.create(member.type, member.name.text))
					} else {
						throw new Error(`Member has no type node: ${member.name.text}`)
					}
				} else {
					throw new Error(`Unknown identifier in TypeLiteralNode member kind: ${printSyntaxKind(member.name.kind)}`)
				}
				return
			}

			if (isIndexSignatureDeclaration(member)) {
				// TODO we ignore that for now, it has no `name` and I don't know why
				return
			}

			throw new UnhandledMemberSignatureError(member)
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

class UnhandledMemberSignatureError extends Error {
	constructor(node: TypeElement) {
		super()
		this.message = this.createMessage(node)
	}

	private createMessage(node: TypeElement): string {
		return [
			`Unhandled member in TypeLiteralNode`,
			`  kind: ${printSyntaxKind(node.kind)}`,
			`  name: ${JSON.stringify(node.name)}`,
			`  all: ${JSON.stringify(node, null, 2)}`,
		].join("\n")
	}
}
