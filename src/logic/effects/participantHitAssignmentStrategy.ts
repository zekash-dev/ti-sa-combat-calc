import { HitAssignmentStrategy } from "model/combatTags";
import { ParticipantTagImplementation } from "model/effects";

const defaultStrategy: HitAssignmentStrategy = HitAssignmentStrategy.SustainFirst;

export const participantHitAssignmentStrategy: ParticipantTagImplementation<HitAssignmentStrategy> = {
    settings: {
        default: defaultStrategy,
        encode: (strategy: HitAssignmentStrategy) => strategy.toString(),
        decode: (str: string) => (isNaN(Number(str)) ? defaultStrategy : Number(str)),
    },
};
