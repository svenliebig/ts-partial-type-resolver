let mode: "on" | "off" = 'off'
let filter: null | string = null
export class L {
	static off() {
		mode = "off"
	}

	static on() {
		mode = "on"
	}

	static filter(value: string | null) {
		filter = value
	}

	static d(...args: Array<any>) {
		if (mode === "on" && (filter === null || args.join("").toLocaleLowerCase().includes(filter.toLocaleLowerCase()))) {
			console.log(...args)
		}
	}
}