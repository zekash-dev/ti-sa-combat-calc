import { useSelector } from "react-redux";

import { CalculationOutput, ParticipantInput, ParticipantRole } from "model/calculation";
import { KeyedDictionary } from "model/common";
import { selectparticipants } from "redux/participant/participantSlice";
import { selectOutput } from "redux/result/resultSlice";
import { CombatStageResultView } from "./CombatStageResultView";
import { ResultPercentageBars } from "./ResultPercentageBars";
import { ResultPercentageLabels } from "./ResultPercentageLabels";

export function ResultView() {
    const output: CalculationOutput | null = useSelector(selectOutput);
    const participants: KeyedDictionary<ParticipantRole, ParticipantInput> = useSelector(selectparticipants);

    if (!output) return null;

    return (
        <>
            <ResultPercentageLabels victorProbabilities={output.victorProbabilities} />
            <ResultPercentageBars victorProbabilities={output.victorProbabilities} participants={participants} />
            <CombatStageResultView output={output} participants={participants} />
        </>
    );
}
