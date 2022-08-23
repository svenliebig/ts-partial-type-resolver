import { isIdentifier, TypeReferenceNode } from "typescript";


export class TypeReference {
	public identifier: string;

	constructor(type: TypeReferenceNode) {
		this.identifier = isIdentifier(type.typeName) ? type.typeName.text : "";
	}
}
