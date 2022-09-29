import test from "ava"
import { resolve } from "path"
import { tmpdir } from "os"
import { FileManager } from "../../src/utils/FileManager"
import { StringTypeDeclaration } from "../../src/models/StringTypeDeclaration"

const dir = tmpdir()

test("fileManager should add a declaration to a file a path", (t) => {
	const manager = new FileManager()
	const declaration = new StringTypeDeclaration({ default: false, exported: true, identifier: "Hello" })
	manager.addTypeDeclarationToFile(resolve(dir, "a.ts"), declaration)
	t.is(manager.getFilePathOf(declaration), resolve(dir, "a.ts"))
})

test("fileManager should add two declarations to the same file", (t) => {
	const manager = new FileManager()
	const declaration1 = new StringTypeDeclaration({ default: false, exported: true, identifier: "Hello1" })
	const declaration2 = new StringTypeDeclaration({ default: false, exported: true, identifier: "Hello2" })
	manager.addTypeDeclarationToFile(resolve(dir, "a.ts"), declaration1)
	manager.addTypeDeclarationToFile(resolve(dir, "a.ts"), declaration2)
	t.is(manager.getFilePathOf(declaration1), resolve(dir, "a.ts"))
	t.is(manager.getFilePathOf(declaration2), resolve(dir, "a.ts"))
})
