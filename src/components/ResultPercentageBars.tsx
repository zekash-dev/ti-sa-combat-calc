import { Theme } from "@mui/material";
import { grey } from "@mui/material/colors";
import { makeStyles } from "@mui/styles";
import classNames from "classnames";
import { sum } from "lodash";

import { factionResources } from "logic/participant";
import { CombatVictor, ParticipantInput, ParticipantRole } from "model/calculation";
import { FactionResources } from "model/combatTags";
import { KeyedDictionary } from "model/common";

interface ResultPercentageBarsProps {
    victorProbabilities: KeyedDictionary<CombatVictor, number>;
    participants: KeyedDictionary<ParticipantRole, ParticipantInput>;
    small?: boolean;
}

export function ResultPercentageBars({ victorProbabilities, participants, small }: ResultPercentageBarsProps) {
    const styles = useStyles();
    const { attacker, defender, draw } = victorProbabilities;
    const undetermined: number = 1.0 - sum(Object.values(victorProbabilities));
    const attackerResources: FactionResources = factionResources[participants.attacker.faction];
    const defenderResources: FactionResources = factionResources[participants.defender.faction];
    const slanted = attacker > 0.01 && defender > 0.01;

    return (
        <div className={styles.bars}>
            <VictorBar probability={attacker} color={attackerResources.color} slanted={slanted} small={small} />
            <VictorBar probability={draw} color={grey[900]} slanted={slanted} small={small} />
            <VictorBar probability={undetermined} color={grey[400]} slanted={slanted} small={small} />
            <VictorBar probability={defender} color={defenderResources.color} slanted={slanted} small={small} />
        </div>
    );
}
interface VictorBarProps {
    probability: number;
    color: string;
    slanted: boolean;
    small?: boolean;
}

function VictorBar({ probability, color, slanted, small }: VictorBarProps) {
    const styles = useStyles();
    if (probability < 0.001) return null;

    return (
        <div
            className={classNames(styles.victorBar, { [styles.slantedBar]: slanted, [styles.smallVictorBar]: small })}
            style={{
                width: `${probability * 100}%`,
                backgroundColor: color,
            }}
        />
    );
}

const useStyles = makeStyles((theme: Theme) => ({
    bars: {
        display: "flex",
        overflow: "hidden",
    },
    victorBar: {
        height: 80,
        display: "inline-block",
        position: "relative",
        transition: "width 0.5s",
    },
    smallVictorBar: {
        height: 40,
    },
    slantedBar: {
        "&:after": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 30,
            width: "100%",
            height: "100%",
            background: "inherit",
            transformOrigin: "0% 0",
            transform: "skewX(-22.5deg)",
            zIndex: 1,
        },
    },
}));
