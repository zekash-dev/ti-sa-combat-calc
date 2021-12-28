export function getAllEnumValues<T>(enumType: object): T[] {
    return Object.values(enumType).filter((v): v is T => typeof v === "number");
}

export function uniqueFilter<T>(value: T, index: number, array: T[]): boolean {
    return array.indexOf(value) === index;
}

/**
 * Equality comparison with tolerance 1E-9
 * @param value
 * @returns
 */
export function equalsZero(value: number): boolean {
    return Math.abs(value) < 0.000000001;
}
