import { Box, Typography } from "@mui/material";

import { CombatRollImage } from "components/graphics";
import { UnitStageStats } from "model/calculation";

interface Props {
    label: string;
    stats: UnitStageStats;
}

export function UnitStageStatsView({ label, stats }: Props) {
    return (
        <Box>
            <Typography variant="body2" sx={{ display: "inline", marginRight: 1 }}>
                {label}
            </Typography>
            {stats.rolls.map((combatValue, idx) => (
                <CombatRollImage
                    key={`${combatValue}-${idx}`}
                    combatValue={combatValue}
                    style={{ width: 20, height: 20, margin: 2, verticalAlign: "middle" }}
                />
            ))}
        </Box>
    );
}
