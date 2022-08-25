let mode: "on" | "off" = "off"
let filter: null | string = null
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
}

Object.defineProperty(L, "d", {
	get: () => {
		if (mode === "on") {
			if (filter) {
				return (...args: Array<any>) => console.log.apply(console, args)
			}
			return console.log.bind(console)
		}
		return function () {}
	},
})
