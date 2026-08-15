import moment from "moment";

const buildTimestamp = Number(import.meta.env.VITE_BUILD_TIMESTAMP);

export function BuildTimeDisplay() {
    const mom = moment(buildTimestamp);
    const str = mom.format("YYYY-MM-DD");
    return <>{str}</>;
}
