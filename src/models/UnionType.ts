import { UnionTypeNode } from "typescript";
import { Types, typeFactory } from "../parser";


export class UnionType {
	public types: Array<Types>;

	constructor(type: UnionTypeNode) {
		this.types = type.types.map(typeFactory);
	}

	toString(): string {
		return this.types.map(type => type.toString()).join(" | ");
	}
}
