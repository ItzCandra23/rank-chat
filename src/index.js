"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("@bdsx/rank-perms/src/command");
const command_2 = require("bdsx/bds/command");
const nativetype_1 = require("bdsx/nativetype");
const rank_perms_1 = require("@bdsx/rank-perms");
const message_1 = require("./utils/message");
const __1 = require("..");
const command_3 = require("bdsx/command");
command_1.commandPerm.register("chat", "Send message to other player", "rank-chat.command.chat")
    .overload((p, o) => {
    for (const target of p.target.newResults(o)) {
        if (target.isPlayer()) {
            const actor = o.getEntity();
            if (!actor) {
                __1.RankChatMain.ChatPlayer(undefined, target, p.message);
                return;
            }
            const player = actor.getNetworkIdentifier().getActor();
            if (!player)
                return;
            __1.RankChatMain.ChatPlayer(player, target, p.message);
        }
    }
}, {
    target: command_2.PlayerCommandSelector,
    message: nativetype_1.CxxString,
});
command_1.commandPerm.register("replay", "Send message to last player who chatted with you.", "rank-chat.command.replay", command_2.CommandPermissionLevel.Normal)
    .overload((p, o) => {
    var _a;
    const actor = (_a = o.getEntity()) === null || _a === void 0 ? void 0 : _a.getNetworkIdentifier().getActor();
    if (actor === null)
        return;
    if (actor === undefined) {
        message_1.send.error(`You are console.`);
        return;
    }
    __1.RankChatMain.ChatReplay(actor, p.message);
}, {
    message: nativetype_1.CxxString,
});
command_1.commandPerm.register("r", "Send message to last player who chatted with you.", "rank-chat.command.replay", command_2.CommandPermissionLevel.Normal)
    .overload((p, o) => {
    var _a;
    const actor = (_a = o.getEntity()) === null || _a === void 0 ? void 0 : _a.getNetworkIdentifier().getActor();
    if (actor === null)
        return;
    if (actor === undefined) {
        message_1.send.error(`You are console.`);
        return;
    }
    __1.RankChatMain.ChatReplay(actor, p.message);
}, {
    message: nativetype_1.CxxString,
});
command_1.commandPerm.register("setchat", "Customize rank chat.", "rank-chat.command.setchat", command_2.CommandPermissionLevel.Operator)
    .overload((p, o) => {
    var _a;
    const actor = (_a = o.getEntity()) === null || _a === void 0 ? void 0 : _a.getNetworkIdentifier().getActor();
    if (actor === null)
        return;
    if (!rank_perms_1.RankPerms.hasRank(p.rank)) {
        message_1.send.error(`Rank not found!`, actor);
        return;
    }
    message_1.send.success(`Success to set ${p.rank} chat`, actor);
    __1.RankChatMain.setRankChat(p.rank, p.chat);
}, {
    isrank: command_3.command.enum("RankChat_rank", "rank"),
    rank: nativetype_1.CxxString,
    chat: nativetype_1.CxxString,
})
    .overload((p, o) => {
    var _a;
    const actor = (_a = o.getEntity()) === null || _a === void 0 ? void 0 : _a.getNetworkIdentifier().getActor();
    if (actor === null)
        return;
    message_1.send.success(`Success to set default chat`, actor);
    __1.RankChatMain.setDefaultChat(p.chat);
}, {
    isrank: command_3.command.enum("RankChat_default", "default"),
    chat: nativetype_1.CxxString,
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDBEQUEyRDtBQUMzRCw4Q0FBaUY7QUFDakYsZ0RBQTRDO0FBQzVDLGlEQUE2QztBQUM3Qyw2Q0FBdUM7QUFDdkMsMEJBQWtDO0FBQ2xDLDBDQUF1QztBQUV2QyxxQkFBVyxDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUUsOEJBQThCLEVBQUUsd0JBQXdCLENBQUM7S0FDckYsUUFBUSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFO0lBQ2YsS0FBSyxNQUFNLE1BQU0sSUFBSSxDQUFDLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsRUFBRTtRQUN6QyxJQUFJLE1BQU0sQ0FBQyxRQUFRLEVBQUUsRUFBRTtZQUNuQixNQUFNLEtBQUssR0FBRyxDQUFDLENBQUMsU0FBUyxFQUFFLENBQUM7WUFDNUIsSUFBSSxDQUFDLEtBQUssRUFBRTtnQkFDUixnQkFBWSxDQUFDLFVBQVUsQ0FBQyxTQUFTLEVBQUUsTUFBTSxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQztnQkFDdEQsT0FBTzthQUNWO1lBQ0QsTUFBTSxNQUFNLEdBQUcsS0FBSyxDQUFDLG9CQUFvQixFQUFFLENBQUMsUUFBUSxFQUFFLENBQUM7WUFDdkQsSUFBSSxDQUFDLE1BQU07Z0JBQUUsT0FBTztZQUNwQixnQkFBWSxDQUFDLFVBQVUsQ0FBQyxNQUFNLEVBQUUsTUFBTSxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQztTQUN0RDtLQUNKO0FBQ0wsQ0FBQyxFQUFFO0lBQ0MsTUFBTSxFQUFFLCtCQUFxQjtJQUM3QixPQUFPLEVBQUUsc0JBQVM7Q0FDckIsQ0FBQyxDQUFDO0FBRUgscUJBQVcsQ0FBQyxRQUFRLENBQUMsUUFBUSxFQUFFLG1EQUFtRCxFQUFFLDBCQUEwQixFQUFFLGdDQUFzQixDQUFDLE1BQU0sQ0FBQztLQUM3SSxR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