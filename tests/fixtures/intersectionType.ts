type BasicIntersection = string & number
type ObjectIntersection = { name: string } & { id: number }
type BasicArrayIntersection = { name: string } & Array<string>
type ArrayIntersection = Array<ObjectIntersection>
type IntersectionAndUnion = { name: string } | { id: string } & { age: number }