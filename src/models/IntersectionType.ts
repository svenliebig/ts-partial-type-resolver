import { IntersectionTypeNode } from "typescript";
import { Types, typeFactory } from "../parser";

export class IntersectionType {
	public types: Array<Types>;

	constructor(node: IntersectionTypeNode) {
		this.types = node.types.map(typeFactory);
	}

	toString(): string {
		return this.types.map(type => type.toString()).join(" & ");
	}
}
