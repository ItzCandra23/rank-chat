"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FiltersChat = void 0;
const path = require("path");
const fs = require("fs");
let raw = "";
const filterPath = path.join(__dirname, "..", "filters.txt");
try {
    raw = fs.readFileSync(filterPath, "utf8");
}
catch (err) { }
var FiltersChat;
(function (FiltersChat) {
    function filter(text) {
        const filters = fs.readFileSync(filterPath, "utf8");
        for (const [i, fltr] of filters.split("\n").map((v) => v.replace(RegExp("\r", "g"), "")).entries()) {
            if (fltr !== "") {
                let censor = "";
                for (let i = 0; i < fltr.length; i++) {
                    censor += "*";
                }
                text = text.replace(RegExp(fltr, "g"), censor);
            }
        }
        return text;
    }
    FiltersChat.filter = filter;
    function reload() {
        try {
            if (raw !== fs.readFileSync(filterPath, "utf8")) {
                raw = fs.readFileSync(filterPath, "utf8");
            }
        }
        catch (err) { }
    }
    FiltersChat.reload = reload;
})(FiltersChat = exports.FiltersChat || (exports.FiltersChat = {}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsdGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZmlsdGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLDZCQUE2QjtBQUM3Qix5QkFBeUI7QUFFekIsSUFBSSxHQUFHLEdBQUcsRUFBRSxDQUFDO0FBRWIsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsSUFBSSxFQUFFLGFBQWEsQ0FBQyxDQUFDO0FBRTdELElBQUk7SUFDQSxHQUFHLEdBQUcsRUFBRSxDQUFDLFlBQVksQ0FBQyxVQUFVLEVBQUUsTUFBTSxDQUFDLENBQUM7Q0FDN0M7QUFBQyxPQUFNLEdBQUcsRUFBRSxHQUFFO0FBRWYsSUFBaUIsV0FBVyxDQXVCM0I7QUF2QkQsV0FBaUIsV0FBVztJQUV4QixTQUFnQixNQUFNLENBQUMsSUFBWTtRQUMvQixNQUFNLE9BQU8sR0FBRyxFQUFFLENBQUMsWUFBWSxDQUFDLFVBQVUsRUFBRSxNQUFNLENBQUMsQ0FBQztRQUNwRCxLQUFLLE1BQU0sQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLElBQUksT0FBTyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxHQUFHLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLE9BQU8sRUFBRSxFQUFFO1lBQ2hHLElBQUksSUFBSSxLQUFLLEVBQUUsRUFBRTtnQkFDYixJQUFJLE1BQU0sR0FBRyxFQUFFLENBQUM7Z0JBQ2hCLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO29CQUNsQyxNQUFNLElBQUUsR0FBRyxDQUFDO2lCQUNmO2dCQUNELElBQUksR0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUM7YUFDaEQ7U0FDSjtRQUNELE9BQU8sSUFBSSxDQUFDO0lBQ2hCLENBQUM7SUFaZSxrQkFBTSxTQVlyQixDQUFBO0lBRUQsU0FBZ0IsTUFBTTtRQUNsQixJQUFJO1lBQ0EsSUFBSSxHQUFHLEtBQUssRUFBRSxDQUFDLFlBQVksQ0FBQyxVQUFVLEVBQUUsTUFBTSxDQUFDLEVBQUU7Z0JBQzdDLEdBQUcsR0FBRyxFQUFFLENBQUMsWUFBWSxDQUFDLFVBQVUsRUFBRSxNQUFNLENBQUMsQ0FBQzthQUM3QztTQUNKO1FBQUMsT0FBTSxHQUFHLEVBQUUsR0FBRTtJQUNuQixDQUFDO0lBTmUsa0JBQU0sU0FNckIsQ0FBQTtBQUNMLENBQUMsRUF2QmdCLFdBQVcsR0FBWCxtQkFBVyxLQUFYLG1CQUFXLFFBdUIzQiJ9