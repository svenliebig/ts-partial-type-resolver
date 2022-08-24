import { Targaryen } from "./westeros/houses/targaryen"
import { Jon } from "./westeros/people/jon"

type Hello = "string"
type Num = 1
type OneOrString = 1 | "string" | string | number | Date

type RealDate = Date
type DateString = string
export type NumType = number

type Possible = Jon

type City = {
	name: string
}

type Westeros = {
	people: Targaryen
	capital: City
	population: number
	party: {
		date: string
	}
}

type BigUnion = Westeros | string