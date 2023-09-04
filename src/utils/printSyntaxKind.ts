import { SyntaxKind, TypeNode } from "typescript"

export function printSyntaxKind(kind: SyntaxKind) {
	let result = "<unknown>"

	Object.entries(SyntaxKind).forEach(([key, value]) => {
		if (kind === value) {
			result = `${key} (${value})`
		}
	})

	return result
}
