import { ArrayType, EnumType, IntersectionType, TypeLiteral, UnionType } from "../../models"
import { Type } from "../../models/Type"
import { L } from "../../utils/logger"

export function getAllEnumsInside(type: Type): Set<EnumType> {
	const s = new Set<EnumType>()

	function append(set: Set<EnumType>) {
		set.forEach((e) => s.add(e))
	}

	L.d("<getAllEnumsInside>")
	if (type instanceof UnionType) {
		L.d("isUnionType")
		type.types.map(getAllEnumsInside).forEach(append)
	} else if (type instanceof IntersectionType) {
		L.d("isIntersection")
		type.types.map(getAllEnumsInside).forEach(append)
	} else if (type instanceof ArrayType) {
		L.d("isArray")
		append(getAllEnumsInside(type.arrayType))
	} else if (type instanceof TypeLiteral) {
		L.d("isTypeLiteral")
		Array.from(type.properties.values()).map(getAllEnumsInside).forEach(append)
	} else if (type instanceof EnumType) {
		s.add(type)
	}

	return s
}
