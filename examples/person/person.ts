import { Language } from "./language"
import { Address } from "./address"

type Person = {
	name: string
	surname: string
	address: Address
	languages: Array<Language>
	employed: boolean
}
