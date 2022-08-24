import { KeywordTypeNode, SyntaxKind, TypeNode } from "typescript";

export function isStringKeywordTypeNode(
	node: TypeNode): node is KeywordTypeNode<SyntaxKind.StringKeyword> {
	return node.kind === SyntaxKind.StringKeyword;
}
