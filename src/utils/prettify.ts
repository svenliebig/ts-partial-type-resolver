export type PrettifyOptions = {
	separator: "  " | "    " | "\t"
}

const defaultOptions: PrettifyOptions = { separator: "  " }

export function prettify(str: string, { separator = "  " }: PrettifyOptions = defaultOptions) {
	let deep = 0

	function sep() {
		return separator.repeat(deep)
	}

	return str.replace(/(\{\s|\,\s|\s\})/g, (substring: string, ...args: any[]) => {
		if (substring.includes("{")) {
			deep++;
			return `{\n${sep()}`
		}
		
		if (substring.includes(",")) {
			return `,\n${sep()}`
		}

		if (substring.includes("}")) {
			deep--;
			return `\n${sep()}}`
		}

		return substring
	})
}