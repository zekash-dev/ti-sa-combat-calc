// Type definitions for ol-contextmenu
// Project: https://github.com/jonataswalker/ol-contextmenu

declare module "react-svgmt" {
    import { SVGAttributes } from "react";

    export interface SvgLoaderProps {
        /**
         * The URL of the svg file (optional)
         */
        path?: string;
        /**
         * Contents of the svg file (optional)
         */
        svgXML?: string;
        /**
         * Function called when the SVG element has been loaded. The svg DOM node is passed as parameter
         */
        onSVGReady?: (node: SVGElement) => void;
        children: any;
    }
    export type SvgProxyProps = SVGAttributes<SVGElement> & {
        /**
         * CSS selector for the element(s)
         */
        selector?: string;
        /**
         * Callback that receives the SVG DOM element (or list if more than one) matched by the selector.
         */
        onElementSelected?: (node: SVGElement) => void;
    };
    export const SvgLoader: (props: SvgLoaderProps) => JSX.Element;
    export const SvgProxy: (props: SvgProxyProps) => JSX.Element;
}
