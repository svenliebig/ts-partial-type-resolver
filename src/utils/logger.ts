let mode: "on" | "off" = 'off'

export class L {
	static off() {
		mode = "off"
	}	
	static on() {
		mode = "on"
	}

	static d(...args: Array<any>) {
		if (mode === "on") {
			console.log(...args)
		}
	}
}