import { KeywordTypeNode, SyntaxKind, TypeNode } from "typescript";

export function isNumberKeywordTypeNode(
	node: TypeNode): node is KeywordTypeNode<SyntaxKind.NumberKeyword> {
	return node.kind === SyntaxKind.NumberKeyword;
}
