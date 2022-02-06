import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";

import { decodeParticipantsState } from "logic/compression";
import { selectOptions } from "redux/options/optionsSlice";
import { importParticipantsState, selectEncodedState } from "redux/participant/participantSlice";

export function UrlParamsTrigger() {
    const dispatch = useDispatch();
    const encodedState: string = useSelector(selectEncodedState);
    const { useSearchParam } = useSelector(selectOptions);
    const [params, setParams] = useSearchParams();
    const [initiated, setInitiated] = useState<boolean>(false);
    const q = params.get("q");

    // On first render, decode the URL parameter and import the state
    useEffect(() => {
        if (q) {
            try {
                const state = decodeParticipantsState(q.trim());
                dispatch(importParticipantsState(state));
            } catch (e) {
                console.error(`Error importing state from string: ${q}`);
                console.error(e);
            }
        }
        setInitiated(true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // On query string changes after initation (e.g. history navigation), decode the URL parameter and import the state
    // todo: this causes refresh loops in dev -- look into it before enabling.
    // useEffect(() => {
    //     if (q && initiated) {
    //         try {
    //             const state = decodeParticipantsState(q.trim());
    //             dispatch(importParticipantsState(state));
    //         } catch (e) {
    //             console.error(`Error importing state from string: ${q}`);
    //             console.error(e);
    //         }
    //     }
    //     setInitiated(true);
    //     // eslint-disable-next-line react-hooks/exhaustive-deps
    // }, [q, initiated]);

    useEffect(() => {
        // Prevent "flicker" to base state URL when initiating
        if (initiated) {
            if (useSearchParam) {
                if (encodedState !== q) setParams({ q: encodedState });
            } else {
                setParams({}, { replace: true });
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [encodedState, useSearchParam]);
    return null;
}
