import { HIT_TYPE_AND_FLAGS_BITMASK } from "model/calculation";
import { getSignificantBitCount, leftShiftWithMask, rightShiftWithMask } from "./common";

describe("getSignificantBitCount", () => {
    it("returns correct bit count", () => {
        expect(getSignificantBitCount(256)).toEqual(9);
        expect(getSignificantBitCount(255)).toEqual(8);
        expect(getSignificantBitCount(230)).toEqual(8);
        expect(getSignificantBitCount(128)).toEqual(8);
        expect(getSignificantBitCount(127)).toEqual(7);
        expect(getSignificantBitCount(31)).toEqual(5);
        expect(getSignificantBitCount(1)).toEqual(1);
        expect(getSignificantBitCount(0)).toEqual(0);
    });
});

describe("leftShiftWithMask", () => {
    it("shifts correctly", () => {
        expect(leftShiftWithMask(1, HIT_TYPE_AND_FLAGS_BITMASK)).toEqual(0b0100000000);
        expect(leftShiftWithMask(2, HIT_TYPE_AND_FLAGS_BITMASK)).toEqual(0b1000000000);
        expect(leftShiftWithMask(10, HIT_TYPE_AND_FLAGS_BITMASK)).toEqual(0b101000000000);
    });
});

describe("rightShiftWithMask", () => {
    it("shifts correctly", () => {
        expect(rightShiftWithMask(0b0100000000, HIT_TYPE_AND_FLAGS_BITMASK)).toEqual(1);
        expect(rightShiftWithMask(0b1000000000, HIT_TYPE_AND_FLAGS_BITMASK)).toEqual(2);
        expect(rightShiftWithMask(0b101000000000, HIT_TYPE_AND_FLAGS_BITMASK)).toEqual(10);
    });
});
