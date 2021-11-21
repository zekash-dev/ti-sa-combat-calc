import { calculateCombatOutcome } from "./logic/calculator";

/* eslint-disable no-restricted-globals */
self.onmessage = ({ data: { attacker, defender } }) => {
    const outcomes = calculateCombatOutcome(attacker, defender);
    self.postMessage({ outcomes });
};
