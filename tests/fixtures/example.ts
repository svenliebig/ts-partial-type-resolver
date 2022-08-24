type Obj = {
	type: Array<string>
	union: Array<string> | Obj
}
type Arr4 = Array<Obj>