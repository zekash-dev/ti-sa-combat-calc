import { Edit } from "@mui/icons-material";
import { omit } from "lodash";
import React from "react";

interface Props {
    modType: "positive" | "negative";
    style?: React.CSSProperties | undefined;
}

export const UnitCustomModImage = React.forwardRef<SVGSVGElement, Props>(function UnitCustomModImageFW(props, ref) {
    const spreadProps = omit(props, "modType");
    //  Spread the props to the underlying DOM element to let this component exist in a tooltip.
    return (
        <Edit
            ref={ref}
            {...spreadProps}
            fontSize="small"
            sx={{
                borderRadius: "30%",
                backgroundColor: props.modType === "positive" ? "#31B32B" : "#F4641D",
            }}
        />
    );
});
