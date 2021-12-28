import { CombatStage, ParticipantRole } from "model/calculation";
import { ParticipantTagImplementation, PreAssignHitsInput, PreAssignHitsOutput } from "model/effects";

export const agent: ParticipantTagImplementation = {
    preAssignHits: ({ combatState, role }: PreAssignHitsInput): PreAssignHitsOutput => {
        // Note: The rules definition says that units don't get to use "Invasion defence".
        // This implementation is slightly different in that it simply negates all hits from "Invasion defence".
        // The for that is to prevent any other effect tag (such as scientist) from granting more rolls after this tag has removed all rolls.
        if (role === ParticipantRole.Attacker && combatState.stage === CombatStage.InvasionDefence) {
            return { newHits: {} };
        }
        return {};
    },
};
