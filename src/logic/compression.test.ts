import { CombatType } from "model/calculation";
import { Faction, FactionUpgrade, Technology, UnitTag } from "model/combatTags";
import { UnitType } from "model/unit";
import { ParticipantSliceState } from "redux/participant/participantSlice";
import { decodeParticipantsState, encodeParticipantsState } from "./compression";

describe("encodeParticipantsState", () => {
    it("can compress a default state", () => {
        const input: ParticipantSliceState = {
            combatType: CombatType.SpaceBattle,
            participants: {
                attacker: {
                    faction: Faction.XXCHA_KINGDOM,
                    units: [],
                    tags: {},
                },
                defender: {
                    faction: Faction.MENTAK_COALITION,
                    units: [],
                    tags: {
                        [Technology.HYLAR_V_LASER]: true,
                    },
                },
            },
        };
        const expectedResult = "sx+~m+UJ";

        const result: string = encodeParticipantsState(input);
        expect(result).toEqual(expectedResult);

        const decoded = decodeParticipantsState(result);
        expect(decoded).toEqual(input);
    });

    it("can compress a unit", () => {
        const input: ParticipantSliceState = {
            combatType: CombatType.SpaceBattle,
            participants: {
                attacker: {
                    faction: Faction.XXCHA_KINGDOM,
                    units: [
                        {
                            type: UnitType.Fighter,
                            sustainedHits: 0,
                        },
                    ],
                    tags: {},
                },
                defender: {
                    faction: Faction.MENTAK_COALITION,
                    units: [
                        {
                            type: UnitType.Cruiser,
                            sustainedHits: 0,
                        },
                    ],
                    tags: {
                        [Technology.HYLAR_V_LASER]: true,
                    },
                },
            },
        };
        const expectedResult = "sxf+~mu+UJ";

        const result: string = encodeParticipantsState(input);
        expect(result).toEqual(expectedResult);

        const decoded = decodeParticipantsState(result);
        expect(decoded).toEqual(input);
    });

    it("can compress a unit with empty tags", () => {
        const input: ParticipantSliceState = {
            combatType: CombatType.SpaceBattle,
            participants: {
                attacker: {
                    faction: Faction.XXCHA_KINGDOM,
                    units: [
                        {
                            type: UnitType.Fighter,
                            sustainedHits: 0,
                            tags: {},
                        },
                    ],
                    tags: {},
                },
                defender: {
                    faction: Faction.MENTAK_COALITION,
                    units: [],
                    tags: {
                        [Technology.HYLAR_V_LASER]: true,
                    },
                },
            },
        };
        const expectedResult = "sxf+~m+UJ";
        const expectedDecoded: ParticipantSliceState = {
            ...input,
            participants: {
                ...input.participants,
                attacker: {
                    ...input.participants.attacker,
                    units: [
                        {
                            type: UnitType.Fighter,
                            sustainedHits: 0,
                            // no tags object
                        },
                    ],
                },
            },
        };

        const result: string = encodeParticipantsState(input);
        expect(result).toEqual(expectedResult);

        const decoded = decodeParticipantsState(result);
        expect(decoded).toEqual(expectedDecoded);
    });

    it("can compress a unit with sustained hit", () => {
        const input: ParticipantSliceState = {
            combatType: CombatType.SpaceBattle,
            participants: {
                attacker: {
                    faction: Faction.XXCHA_KINGDOM,
                    units: [
                        {
                            type: UnitType.Dreadnought,
                            sustainedHits: 1,
                        },
                    ],
                    tags: {},
                },
                defender: {
                    faction: Faction.MENTAK_COALITION,
                    units: [],
                    tags: {
                        [Technology.HYLAR_V_LASER]: true,
                    },
                },
            },
        };
        const expectedResult = "sxn1+~m+UJ";

        const result: string = encodeParticipantsState(input);
        expect(result).toEqual(expectedResult);

        const decoded = decodeParticipantsState(result);
        expect(decoded).toEqual(input);
    });

    it("can compress a unit with admiral tag", () => {
        const input: ParticipantSliceState = {
            combatType: CombatType.SpaceBattle,
            participants: {
                attacker: {
                    faction: Faction.XXCHA_KINGDOM,
                    units: [
                        {
                            type: UnitType.Dreadnought,
                            sustainedHits: 0,
                            tags: {
                                [UnitTag.ADMIRAL]: true,
                            },
                        },
                    ],
                    tags: {},
                },
                defender: {
                    faction: Faction.MENTAK_COALITION,
                    units: [],
                    tags: {
                        [Technology.HYLAR_V_LASER]: true,
                    },
                },
            },
        };
        const expectedResult = "sxn.rV+~m+UJ";

        const result: string = encodeParticipantsState(input);
        expect(result).toEqual(expectedResult);

        const decoded = decodeParticipantsState(result);
        expect(decoded).toEqual(input);
    });

    it("can compress several identical units", () => {
        const input: ParticipantSliceState = {
            combatType: CombatType.SpaceBattle,
            participants: {
                attacker: {
                    faction: Faction.XXCHA_KINGDOM,
                    units: [
                        {
                            type: UnitType.Fighter,
                            sustainedHits: 0,
                        },
                        {
                            type: UnitType.Fighter,
                            sustainedHits: 0,
                        },
                        {
                            type: UnitType.Fighter,
                            sustainedHits: 0,
                        },
                        {
                            type: UnitType.Fighter,
                            sustainedHits: 0,
                        },
                        {
                            type: UnitType.Fighter,
                            sustainedHits: 0,
                        },
                    ],
                    tags: {},
                },
                defender: {
                    faction: Faction.MENTAK_COALITION,
                    units: [],
                    tags: {
                        [Technology.HYLAR_V_LASER]: true,
                    },
                },
            },
        };
        const expectedResult = "sxf-5+~m+UJ";

        const result: string = encodeParticipantsState(input);
        expect(result).toEqual(expectedResult);

        const decoded = decodeParticipantsState(result);
        expect(decoded).toEqual(input);
    });

    it("can compress mix of units with sustain and tags", () => {
        const input: ParticipantSliceState = {
            combatType: CombatType.SpaceBattle,
            participants: {
                attacker: {
                    faction: Faction.XXCHA_KINGDOM,
                    units: [
                        {
                            type: UnitType.Dreadnought,
                            sustainedHits: 1,
                            tags: {
                                [UnitTag.ADMIRAL]: true,
                            },
                        },
                        {
                            type: UnitType.Dreadnought,
                            sustainedHits: 1,
                        },
                        {
                            type: UnitType.Dreadnought,
                            sustainedHits: 1,
                        },
                        {
                            type: UnitType.Dreadnought,
                            sustainedHits: 0,
                        },
                        {
                            type: UnitType.Dreadnought,
                            sustainedHits: 0,
                        },
                        {
                            type: UnitType.Dreadnought,
                            sustainedHits: 0,
                        },
                    ],
                    tags: {},
                },
                defender: {
                    faction: Faction.MENTAK_COALITION,
                    units: [],
                    tags: {
                        [Technology.HYLAR_V_LASER]: true,
                    },
                },
            },
        };
        const expectedResult = "sxn1.rV,n1-2,n-3+~m+UJ";

        const result: string = encodeParticipantsState(input);
        expect(result).toEqual(expectedResult);

        const decoded = decodeParticipantsState(result);
        expect(decoded).toEqual(input);
    });

    it("can compress a tag with custom value", () => {
        const input: ParticipantSliceState = {
            combatType: CombatType.SpaceBattle,
            participants: {
                attacker: {
                    faction: Faction.GHOSTS_OF_CREUSS,
                    units: [],
                    tags: {
                        [FactionUpgrade.CREUSS_DIMENSIONAL_SPLICER]: {
                            wormholePresent: true,
                        },
                    },
                },
                defender: {
                    faction: Faction.MENTAK_COALITION,
                    units: [],
                    tags: {
                        [Technology.HYLAR_V_LASER]: true,
                    },
                },
            },
        };
        const expectedResult = "sc+cG=1~m+UJ";

        const result: string = encodeParticipantsState(input);
        expect(result).toEqual(expectedResult);

        const decoded = decodeParticipantsState(result);
        expect(decoded).toEqual(input);
    });
});
