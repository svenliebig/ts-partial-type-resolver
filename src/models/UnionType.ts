import { UnionTypeNode } from "typescript";
import { Types, typeFactory } from "../parser";


export class UnionType {
	public types: Array<Types>;

	constructor(node: UnionTypeNode) {
		this.types = node.types.map(typeFactory);
	}

	toString(): string {
		return this.types.map(type => type.toString()).join(" | ");
	}
}
