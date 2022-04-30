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

export function getSignificantBitCount(n: number): number {
    let count = 0;

    while (n > 0) {
        n >>= 1;
        count++;
    }
    return count;
}

export function leftShiftWithMask(n: number, mask: number): number {
    return (n <<= getSignificantBitCount(mask));
}

export function rightShiftWithMask(n: number, mask: number): number {
    return (n >>= getSignificantBitCount(mask));
}
