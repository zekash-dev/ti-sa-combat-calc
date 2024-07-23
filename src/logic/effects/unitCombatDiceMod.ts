import { combatRoundStages } from "model/calculation";
import { UnitTag } from "model/combatTags";
import { UnitOnComputeSnapshotInput, UnitTagImplementation } from "model/effects";

export const unitCombatDiceMod: UnitTagImplementation<number> = {
    onComputeUnitSnapshot: ({ stage, unit }: UnitOnComputeSnapshotInput) => {
        const value = Number(unit.base.tags?.[UnitTag.COMBAT_DICE_MOD] ?? 0);
        if (combatRoundStages.includes(stage) && !isNaN(value) && value !== 0) {
            unit.rolls += value;
            if (unit.rolls < 0) {
                unit.rolls = 0;
            }
        }
    },
    settings: {
        default: 0,
        encode: (val: number): string => {
            if (val < 0) {
                return `n${val * -1}`;
            }
            return String(val);
        },
        decode: (strVal: string): number => {
            if (strVal.startsWith("n")) {
                return tryDecode(strVal.substring(1)) * -1;
            }
            return tryDecode(strVal);

            function tryDecode(str: string): number {
                const numVal = Number(str);
                return isNaN(numVal) ? 0 : numVal;
            }
        },
    },
};
