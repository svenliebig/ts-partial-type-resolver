import { KeywordTypeNode, SyntaxKind, TypeNode } from "typescript"

export function isUnknownKeywordTypeNode(node: TypeNode): node is KeywordTypeNode<SyntaxKind.UnknownKeyword> {
	return node.kind === SyntaxKind.UnknownKeyword
}
