export function getAllEnumValues<T>(enumType: object): T[] {
    return Object.values(enumType).filter((v): v is T => typeof v === "number");
}

export function uniqueFilter<T>(value: T, index: number, array: T[]): boolean {
    return array.indexOf(value) === index;
}
