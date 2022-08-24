import { DefaultKeyword, Modifier, SyntaxKind } from "typescript";

export function isDefaultModifier(modifier: Modifier): modifier is DefaultKeyword {
	return modifier.kind === SyntaxKind.DefaultKeyword;
}
