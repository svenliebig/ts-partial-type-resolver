export type Import = {
	/** the path of the file that contains the import declaration. */
	source: string;
	/** the relative path to the target file of the import. */
	from: string;
	named: Array<string>;
	default: string | null;
};
