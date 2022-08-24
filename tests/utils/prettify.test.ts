import test from "ava";
import { prettify } from "../../src/utils/prettify";

test('prettify', t => {
	const type = "const type = { union: string | number, nested: { object: { str: string, num: number } } }"
	const pretty = [
		"const type = {",
		"  union: string | number,",
		"  nested: {",
		"    object: {",
		"      str: string,",
		"      num: number",
	  "    }",
	  "  }",
	  "}"
	].join("\n")
	const result = prettify(type);

	t.is(result, pretty)
})






