import { KeywordTypeNode, SyntaxKind, TypeNode } from "typescript";

export function isBooleanKeywordTypeNode(
	node: TypeNode): node is KeywordTypeNode<SyntaxKind.BooleanKeyword> {
	return node.kind === SyntaxKind.BooleanKeyword;
}
