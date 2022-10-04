import { ImportDeclaration, isImportClause, isImportSpecifier, isNamedImports, isStringLiteralLike } from "typescript"
import { Import } from "./model"

/**
 * For translating `typescript` AST nodes into our own model type.
 */
export function importFactory(statement: ImportDeclaration, source: string): Import {
	const named: Array<string> = []
	const defau: string | null = null

	if (statement.importClause && isImportClause(statement.importClause)) {
		if (statement.importClause.namedBindings && isNamedImports(statement.importClause.namedBindings)) {
			statement.importClause.namedBindings.elements.forEach((element) => {
				if (isImportSpecifier(element)) {
					return named.push(element.name.text)
				}

				throw new Error(`Unknown NamedImport element: ${element}`)
			})
		}
	}

	if (isStringLiteralLike(statement.moduleSpecifier)) {
		return new Import(source, statement.moduleSpecifier.text, named, defau)
	}

	throw new Error(`Unknown ModulesSpecifier kind: ${statement.moduleSpecifier.kind}`)
}
