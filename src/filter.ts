import * as path from "path";
import * as fs from "fs";

let raw = "";

const filterPath = path.join(__dirname, "..", "filters.txt");

try {
    raw = fs.readFileSync(filterPath, "utf8");
} catch(err) {}

export namespace FiltersChat {

    export function filter(text: string): string {
        const filters = fs.readFileSync(filterPath, "utf8");
        for (const [i, fltr] of filters.split("\n").map((v) => v.replace(RegExp("\r", "g"), "")).entries()) {
            if (fltr !== "") {
                let censor = "";
                for (let i = 0; i < fltr.length; i++) {
                    censor+="*";
                }
                text=text.replace(RegExp(fltr, "g"), censor);
            }
        }
        return text;
    }

    export function reload() {
        try {
            if (raw !== fs.readFileSync(filterPath, "utf8")) {
                raw = fs.readFileSync(filterPath, "utf8");
            }
        } catch(err) {}
    }
}