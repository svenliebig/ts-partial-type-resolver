enum BasicEnum {
	VALUE = "VALUE",
	ANOTHER = "ANOTHER",
}

enum BasicEnumWithoutValue {
	VALUE,
	ANOTHER,
}

type ArrayOfEnums = Array<BasicEnum>
