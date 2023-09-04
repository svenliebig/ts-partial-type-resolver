import { KeywordTypeNode, SyntaxKind, TypeNode } from "typescript"

export function isVoidKeywordTypeNode(node: TypeNode): node is KeywordTypeNode<SyntaxKind.VoidKeyword> {
	return node.kind === SyntaxKind.VoidKeyword
}
