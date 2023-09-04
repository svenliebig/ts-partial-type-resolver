import { KeywordTypeNode, SyntaxKind, TypeNode } from "typescript"

export function isUndefinedKeywordTypeNode(node: TypeNode): node is KeywordTypeNode<SyntaxKind.UndefinedKeyword> {
	return node.kind === SyntaxKind.UndefinedKeyword
}
