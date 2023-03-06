"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("@bdsx/rank-perms/src/command");
const command_2 = require("bdsx/bds/command");
const nativetype_1 = require("bdsx/nativetype");
const src_1 = require("@bdsx/rank-perms/src");
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
command_1.commandPerm.register("replay", "Send message to last player who chatted with you.", "rank-chat.command.replay")
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
command_1.commandPerm.register("r", "Send message to last player who chatted with you.", "rank-chat.command.replay")
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
    const send = new message_1.sendMessage(actor);
    if (!src_1.Ranks.has(p.rank)) {
        send.error(`Rank not found!`);
        return;
    }
    send.success(`Success to set ${p.rank} chat`);
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
    const send = new message_1.sendMessage(actor);
    send.success(`Success to set default chat`);
    __1.RankChatMain.setDefaultChat(p.chat);
}, {
    isrank: command_3.command.enum("RankChat_default", "default"),
    chat: nativetype_1.CxxString,
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDBEQUEyRDtBQUMzRCw4Q0FBaUY7QUFDakYsZ0RBQTRDO0FBQzVDLDhDQUF5RDtBQUN6RCw2Q0FBb0Q7QUFDcEQsMEJBQWtDO0FBQ2xDLDBDQUF1QztBQUV2QyxxQkFBVyxDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUUsOEJBQThCLEVBQUUsd0JBQXdCLENBQUM7S0FDckYsUUFBUSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFO0lBQ2YsS0FBSyxNQUFNLE1BQU0sSUFBSSxDQUFDLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsRUFBRTtRQUN6QyxJQUFJLE1BQU0sQ0FBQyxRQUFRLEVBQUUsRUFBRTtZQUNuQixNQUFNLEtBQUssR0FBRyxDQUFDLENBQUMsU0FBUyxFQUFFLENBQUM7WUFDNUIsSUFBSSxDQUFDLEtBQUssRUFBRTtnQkFDUixnQkFBWSxDQUFDLFVBQVUsQ0FBQyxTQUFTLEVBQUUsTUFBTSxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQztnQkFDdEQsT0FBTzthQUNWO1lBQ0QsTUFBTSxNQUFNLEdBQUcsS0FBSyxDQUFDLG9CQUFvQixFQUFFLENBQUMsUUFBUSxFQUFFLENBQUM7WUFDdkQsSUFBSSxDQUFDLE1BQU07Z0JBQUUsT0FBTztZQUNwQixnQkFBWSxDQUFDLFVBQVUsQ0FBQyxNQUFNLEVBQUUsTUFBTSxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQztTQUN0RDtLQUNKO0FBQ0wsQ0FBQyxFQUFFO0lBQ0MsTUFBTSxFQUFFLCtCQUFxQjtJQUM3QixPQUFPLEVBQUUsc0JBQVM7Q0FDckIsQ0FBQyxDQUFDO0FBRUgscUJBQVcsQ0FBQyxRQUFRLENBQUMsUUFBUSxFQUFFLG1EQUFtRCxFQUFFLDBCQUEwQixDQUFDO0tBQzlHLFFBQVEsQ0FBQyxDQUFDLENBQUMsRUFB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