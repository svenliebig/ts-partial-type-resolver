import { Targaryen } from "../houses/targaryen";
import { Person } from "./person";

export type Jon = Person & {
	house: Targaryen
}