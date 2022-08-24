import { isIdentifier, TypeReferenceNode } from "typescript";


export class TypeReference {
	public identifier: string;

	constructor(node: TypeReferenceNode) {
		this.identifier = isIdentifier(node.typeName) ? node.typeName.text : "";
	}

	public isPrimitive(): boolean {
		return this.identifier === "Date"
	}

	public toString() {
		return this.identifier
	}
}
