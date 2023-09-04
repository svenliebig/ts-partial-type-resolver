let mode: "on" | "off" = "off"
let filter: null | string = null

const layers: Array<string> = []

export const L = {
	off() {
		mode = "off"
	},

	on() {
		mode = "on"
	},

	/**
	 * Only display messages that `String.includes` that `value`.
	 * If you use a filter, you will lose the file and line numbers associated to the log.
	 */
	filter(value: string | null) {
		filter = value
	},

	d: console.log.bind(console),

	/** a successful check */
	s: console.log.bind(console, "✅"),

	/** a failed check */
	f: console.log.bind(console, "❌"),

	enter(identifier: string) {
		layers.push(identifier)
	},

	exit() {
		layers.pop()
	},
}

Object.defineProperty(L, "d", {
	get: () => {
		if (mode === "on") {
			if (filter) {
				return (...args: Array<any>) => console.log.apply(console, [...args, printLayers(layers)])
			}
			return (...args: Array<any>) => console.log.apply(console, [...args, printLayers(layers)])
		}
		return function () {}
	},
})

Object.defineProperty(L, "f", {
	get: () => {
		if (mode === "on") {
			if (filter) {
				return (...args: Array<any>) => console.log.apply(console, ["❌", ...args, printLayers(layers)])
			}

			return (...args: Array<any>) => console.log.apply(console, ["❌", ...args, printLayers(layers)])
		}
		return function () {}
	},
})

Object.defineProperty(L, "s", {
	get: () => {
		if (mode === "on") {
			if (filter) {
				return (...args: Array<any>) => console.log.apply(console, ["✅", ...args, printLayers(layers)])
			}

			return (...args: Array<any>) => console.log.apply(console, ["✅", ...args, printLayers(layers)])
		}
		return function () {}
	},
})

function printLayers(layers: Array<string>) {
	if (layers.length === 0) {
		return ""
	}

	const rev = [...layers].reverse()
	return "\n" + rev.map(printLayer).join("\n")
}

function printLayer(layer: string) {
	return `    from ${layer.substring(0, 220)}`
}
