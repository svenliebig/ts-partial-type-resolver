import { ExecutionContext } from "ava"

export function assertInstance<E>(t: ExecutionContext<unknown>, value: any, expected: E): value is E {
	return t.assert(value instanceof (expected as any), `expected value to be instance of '${(expected as any).name}', but was '${value.constructor.name}'`)
}
