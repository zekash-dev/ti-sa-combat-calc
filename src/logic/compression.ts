import { Dictionary, floor, trim } from "lodash";

import { CombatType, ParticipantInput, ParticipantInputTags, UnitInput, UnitInputTags } from "model/calculation";
import { Faction, ParticipantTag, UnitTag } from "model/combatTags";
import { unitDefinitions, UnitType } from "model/unit";
import { ParticipantSliceState } from "redux/participant/participantSlice";
import { factionResources, participantTagResources, unitTagResources } from "./participant";

// Notes on encoding:
// The goal is to create a unique compressed string composed of characters that are valid as URL search parameters.
// Format: {combatType}{attacker}~{defender}~{tags}
// combatType: "s" | "i"
// attacker: {factionLetter}{units}_{tags}
// defender: {factionLetter}{units}_{tags}
// units: {unitLetter}{sustainedHits}y{tags}-{count} joined by "x"
// tags: {tagString}y{tagValue} joined by "."
// tagValue is serialized uniquely for tags that require custom settings. "z" is reserved as an internal separator.

// Separator declaration:
//   "~" separates attacker and defender
//   "_" separates unit and tag section for each participant
//   "-" separates unit definition from unit count
//   "." separates tags
//   "x" separates units
//   "y" separates tag string from tag value
//   "z" is reserved as an internal separator in tag values

export function encodeParticipantsState(state: ParticipantSliceState): string {
    let str = encodeCombatType(state.combatType);
    str += encodeParticipant(state.participants.attacker);
    str += "~";
    str += encodeParticipant(state.participants.defender);
    if (Object.keys(state.tags).length > 0) {
        str += "~";
        str += encodeTags(state.tags);
    }
    return str;
}

export function decodeParticipantsState(str: string): ParticipantSliceState {
    const combatType = decodeCombatType(str[0]);
    str = str.substring(1);
    const split: string[] = str.split("~");
    if (split.length < 2) throw new Error("Unable to split by ~");
    const attacker: ParticipantInput = decodeParticipant(split[0]);
    const defender: ParticipantInput = decodeParticipant(split[1]);
    let tags: ParticipantInputTags = {};
    if (split.length > 2) {
        tags = decodeTags(split[2]);
    }

    return {
        combatType,
        participants: {
            attacker,
            defender,
        },
        tags,
    };
}

function encodeCombatType(combatType: CombatType): string {
    switch (combatType) {
        case CombatType.InvasionCombat:
            return "i";
        case CombatType.SpaceBattle:
            return "s";
    }
}

function decodeCombatType(str: string): CombatType {
    switch (str) {
        case "i":
            return CombatType.InvasionCombat;
        case "s":
            return CombatType.SpaceBattle;
        default:
            throw new Error("Unexpected combat type: " + str);
    }
}

function encodeParticipant(participant: ParticipantInput): string {
    let str = factionResources[participant.faction].letter;
    str += encodeUnits(participant.units);
    str += "_";
    str += encodeTags(participant.tags);
    return str;
}

function decodeParticipant(str: string): ParticipantInput {
    const faction: Faction = decodeFaction(str[0]);
    str = str.substring(1);
    const split: string[] = str.split("_");
    if (split.length !== 2) throw new Error("Unable to split by _");
    const units: UnitInput[] = decodeUnits(split[0]);
    const tags: ParticipantInputTags = decodeTags(split[1]);
    return {
        faction,
        units,
        tags,
    };
}

function decodeFaction(letter: string): Faction {
    for (let key of Object.keys(factionResources)) {
        const faction: Faction = Number(key);
        if (factionResources[faction].letter === letter) {
            return faction;
        }
    }
    throw new Error("Unexpected faction: " + letter);
}

function encodeUnits(units: UnitInput[]): string {
    const dict: Dictionary<number> = {};
    for (let unit of units) {
        const str = encodeUnit(unit);
        dict[str] = (dict[str] ?? 0) + 1;
    }
    const unitStrings: string[] = [];
    for (let str of Object.keys(dict)) {
        const count = dict[str] ?? 1;
        let unitStr = str;
        if (count > 1) {
            unitStr += "-" + count;
        }
        unitStrings.push(unitStr);
    }
    return unitStrings.join("x");
}

function decodeUnits(str: string): UnitInput[] {
    const units: UnitInput[] = [];
    const splits: string[] = str.split("x");
    for (let splitStr of splits) {
        if (splitStr.length === 0) continue;
        let unitStr = splitStr;
        let count = 1;
        if (splitStr.indexOf("-") > -1) {
            const countSplit = splitStr.split("-");
            unitStr = countSplit[0];
            count = Number(countSplit[1]);
        }
        const unit: UnitInput = decodeUnit(unitStr);
        for (let i = 0; i < count; i++) {
            units.push(unit);
        }
    }
    return units;
}

function encodeUnit(unit: UnitInput): string {
    let str = unitDefinitions[unit.type].letter;
    if (unit.sustainedHits > 0) {
        str += unit.sustainedHits;
    }
    if (unit.tags) {
        const tagStrings: string[] = [];
        for (let key of Object.keys(unit.tags)) {
            const tag: UnitTag = Number(key);
            let tagStr = encodeInteger(tag);
            if (unit.tags[tag] !== true) {
                const tagResources = unitTagResources[tag];
                if (tagResources.implementation && tagResources.implementation.settings) {
                    const encodedSettings = tagResources.implementation.settings.encode(unit.tags[tag]);
                    tagStr += "y" + encodedSettings;
                }
            }
            tagStrings.push(tagStr);
        }
        if (tagStrings.length > 0) {
            str += "." + tagStrings.join(".");
        }
    }
    return str;
}

function decodeUnit(str: string): UnitInput {
    const type: UnitType = decodeUnitType(str[0]);
    let sustainedHits: number = 0;
    str = str.substring(1);
    if (str.length === 0) {
        return { type, sustainedHits };
    }
    if (!isNaN(Number(str[0]))) {
        sustainedHits = Number(str[0]);
        str = str.substring(1);
    }
    if (str.length === 0) {
        return { type, sustainedHits };
    }
    const tags: UnitInputTags = {};
    str = trim(str, ".");
    const splits: string[] = str.split(".");
    for (let splitStr of splits) {
        if (splitStr.length === 0) continue;
        let tagStr: string = splitStr;
        let tagValue: any = true;
        if (splitStr.indexOf("y") > -1) {
            const valueSplit = splitStr.split("y");
            tagStr = valueSplit[0];
            const tag: UnitTag = decodeInteger(tagStr);
            const encodedTagValue = valueSplit[1];
            const tagResources = unitTagResources[tag];
            if (tagResources.implementation && tagResources.implementation.settings) {
                const decodedSettings: any = tagResources.implementation.settings.decode(encodedTagValue);
                tagValue = decodedSettings;
            }
        }

        const tag: UnitTag = decodeInteger(tagStr);
        tags[tag] = tagValue;
    }
    return { type, sustainedHits, tags };
}

function decodeUnitType(letter: string): UnitType {
    for (let key of Object.keys(unitDefinitions)) {
        const unitType: UnitType = Number(key);
        if (unitDefinitions[unitType].letter === letter) {
            return unitType;
        }
    }
    throw new Error("Unexpected unit type: " + letter);
}

function encodeTags(tags: ParticipantInputTags): string {
    const tagStrings: string[] = [];
    for (let key of Object.keys(tags)) {
        const tag: ParticipantTag = Number(key);
        let tagStr = encodeInteger(tag);
        if (tags[tag] !== true) {
            const tagResources = participantTagResources[tag];
            if (tagResources.implementation && tagResources.implementation.settings) {
                const encodedSettings = tagResources.implementation.settings.encode(tags[tag]);
                tagStr += "y" + encodedSettings;
            }
        }
        tagStrings.push(tagStr);
    }
    return tagStrings.join(".");
}

function decodeTags(str: string): ParticipantInputTags {
    const tags: ParticipantInputTags = {};
    const splits: string[] = str.split(".");
    for (let splitStr of splits) {
        if (splitStr.length === 0) continue;
        let tagStr: string = splitStr;
        let tagValue: any = true;
        if (splitStr.indexOf("y") > -1) {
            const valueSplit = splitStr.split("y");
            tagStr = valueSplit[0];
            const tag: ParticipantTag = decodeInteger(tagStr);
            const encodedTagValue = valueSplit[1];
            const tagResources = participantTagResources[tag];
            if (tagResources.implementation && tagResources.implementation.settings) {
                const decodedSettings: any = tagResources.implementation.settings.decode(encodedTagValue);
                tagValue = decodedSettings;
            }
        }
        const tag: ParticipantTag = decodeInteger(tagStr);
        tags[tag] = tagValue;
    }
    return tags;
}

const intCharMap = [
    "A",
    "B",
    "C",
    "D",
    "E",
    "F",
    "G",
    "H",
    "J",
    "K",
    "M",
    "N",
    "P",
    "Q",
    "R",
    "S",
    "T",
    "U",
    "V",
    "W",
    "X",
    "Y",
    "Z",
    "a",
    "b",
    "c",
    "d",
    "e",
    "f",
    "g",
    "h",
    "j",
    "k",
    "m",
    "n",
    "p",
    "q",
    "r",
    "s",
    "t",
    "u",
    "v",
    // x, y and z are reserved as separator characters.
    "2",
    "3",
    "4",
];
const toChar = Object.fromEntries(intCharMap.map((v, i) => [i, v]));
const toInteger = Object.fromEntries(intCharMap.map((v, i) => [v, i]));

function encodeInteger(value: number) {
    let res = "";
    if (value === 0) {
        return "" + toChar[0];
    }
    while (value > 0) {
        var val = value % intCharMap.length;
        value = floor(value / intCharMap.length);
        res += toChar[val];
    }
    return res;
}

function decodeInteger(encoded: string) {
    let res: number = 0;
    for (var i = encoded.length - 1; i >= 0; i--) {
        var ch = encoded[i];
        var val = toInteger[ch];
        res = res * intCharMap.length + val;
    }
    return res;
}
