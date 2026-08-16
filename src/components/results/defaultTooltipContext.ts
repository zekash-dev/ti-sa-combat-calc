import { PopoverPosition } from "@mui/material";

export interface TooltipContext {
    open: boolean;
    position: PopoverPosition;
    dataIndex: number;
}

export const defaultTooltipContext: TooltipContext = {
    open: false,
    position: { left: 0, top: 0 },
    dataIndex: -1,
};
