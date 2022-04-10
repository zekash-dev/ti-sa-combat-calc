import { useEffect, useState } from "react";

export function useDebounce<T>(value: T, delay: number) {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(
        () => {
            const timeout = setTimeout(() => {
                setDebouncedValue(value);
            }, delay);
            return () => {
                clearTimeout(timeout);
            };
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [value]
    );

    return debouncedValue;
}
