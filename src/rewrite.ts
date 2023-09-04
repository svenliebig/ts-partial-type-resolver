import { BooleanType, EnumType, ArrayType } from "./models"
import { IntersectionType } from "./models/IntersectionType"
import { LiteralType } from "./models/LiteralType"
import { NumberType } from "./models/NumberType"
import { StringType } from "./models/StringType"
import { Type } from "./models/Type"
import { TypeLiteral } from "./models/TypeLiteral"
import { TypeReference } from "./models/TypeReference"
import { UndefinedType } from "./models/UndefinedType"
import { UnionType } from "./models/UnionType"
import { UnknownType } from "./models/UnknownType"

function filterUnknown(type: Type) {
	return !(type instanceof UnknownType)
}

export type TypeTransformers = {
	boolean?(type: BooleanType): string
	unknown?(type: UnknownType): string
	enum?(type: EnumType): string
	string?(type: StringType): string
	number?(type: NumberType): string
	reference?(type: TypeReference): string
	undefined?(type: UndefinedType): string
}

export function rewrite(type: Type, transformers: TypeTransformers): string {
	if (type instanceof StringType) {
		return transformers.string?.(type) ?? type.toString()
	}

	if (type instanceof NumberType) {
		return transformers.number?.(type) ?? type.toString()
	}

	if (type instanceof EnumType) {
		return transformers.enum?.(type) ?? type.toString()
	}

	if (type instanceof BooleanType) {
		return transformers.boolean?.(type) ?? type.toString()
	}

	if (type instanceof UnknownType) {
		return transformers.unknown?.(type) ?? type.toString()
	}

	if (type instanceof TypeReference) {
		return transformers.reference?.(type) ?? type.toString()
	}

	if (type instanceof UndefinedType) {
		return transformers.undefined?.(type) ?? type.toString()
	}

	if (type instanceof IntersectionType) {
		return type.types
			.filter(filterUnknown)
			.map((val) => rewrite(val, transformers))
			.join(" & ")
	}

	if (type instanceof ArrayType) {
		return `[${rewrite(type.arrayType, transformers)}]`
	}

	if (type instanceof UnionType) {
		if (isOnlyBasicTypes(type.types)) {
			return rewrite(type.types[0], transformers)
		}

		return rewrite(type.types[0], transformers) // + " | " + rewrite(type.types[1], transformers)
	}

	if (type instanceof TypeLiteral) {
		return [
			"{ ",
			Array.from(type.properties.entries())
				.map(([key, value]) => `${key}: ${rewrite(value, transformers)}`)
				.join(", "),
			" }",
		].join("")
	}

	return type.toString()
}

function isOnlyBasicTypes(types: Array<Type>) {
	return types.every((type) => [BooleanType, StringType, UnknownType, NumberType, LiteralType, UndefinedType].some((basic) => type instanceof basic))
}
