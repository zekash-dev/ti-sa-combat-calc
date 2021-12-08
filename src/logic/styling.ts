import { max, min, round } from "lodash";

export function toDarkerHue(color: string, intensity: number): string {
    const rgb = hexToRgb(color);
    if (!rgb) {
        console.warn(`Unable to darken color ${color}`);
        return color;
    }
    rgb.r = round(max([rgb.r * (1.0 - intensity), 0])!);
    rgb.g = round(max([rgb.g * (1.0 - intensity), 0])!);
    rgb.b = round(max([rgb.b * (1.0 - intensity), 0])!);
    return rgbToHex(rgb);
}

export function toBrighterHue(color: string, intensity: number): string {
    const rgb = hexToRgb(color);
    if (!rgb) {
        console.warn(`Unable to brighten color ${color}`);
        return color;
    }
    rgb.r = round(min([rgb.r * (1.0 + intensity), 255])!);
    rgb.g = round(min([rgb.g * (1.0 + intensity), 255])!);
    rgb.b = round(min([rgb.b * (1.0 + intensity), 255])!);
    return rgbToHex(rgb);
}

interface RGB {
    r: number;
    g: number;
    b: number;
}

function hexToRgb(hex: string): RGB | null {
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function (m, r, g, b) {
        return r + r + g + g + b + b;
    });

    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
        ? {
              r: parseInt(result[1], 16),
              g: parseInt(result[2], 16),
              b: parseInt(result[3], 16),
          }
        : null;
}

function rgbToHex({ r, g, b }: RGB): string {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}
