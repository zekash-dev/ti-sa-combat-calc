import moment from "moment";
import preval from "preval.macro";

const buildTimestamp = preval`module.exports = new Date().getTime();`;

export function BuildTimeDisplay() {
    const mom = moment(buildTimestamp);
    const str = mom.format("YYYY-MM-DD");
    return <>{str}</>;
}
