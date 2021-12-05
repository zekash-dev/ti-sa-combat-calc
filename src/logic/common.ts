export function getAllEnumValues<T>(enumType: object): T[] {
    return Object.values(enumType).filter((v): v is T => typeof v === "number");
}
