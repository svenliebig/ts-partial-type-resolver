import { ExportKeyword, Modifier, SyntaxKind } from "typescript";

export function isExportModifier(modifier: Modifier): modifier is ExportKeyword {
	return modifier.kind === SyntaxKind.ExportKeyword;
}
