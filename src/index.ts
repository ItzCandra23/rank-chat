import { commandPerm } from "@bdsx/rank-perms/src/command";
import { CommandPermissionLevel, PlayerCommandSelector } from "bdsx/bds/command";
import { CxxString } from "bdsx/nativetype";
import { Permission, Ranks } from "@bdsx/rank-perms/src";
import { send, sendMessage } from "./utils/message";
import { RankChatMain } from "..";
import { command } from "bdsx/command";

commandPerm.register("chat", "Send message to other player", "rank-chat.command.chat")
.overload((p, o) => {
    for (const target of p.target.newResults(o)) {
        if (target.isPlayer()) {
            const actor = o.getEntity();
            if (!actor) {
                RankChatMain.ChatPlayer(undefined, target, p.message);
                return;
            }
            const player = actor.getNetworkIdentifier().getActor();
            if (!player) return;
            RankChatMain.ChatPlayer(player, target, p.message);
        }
    }
}, {
    target: PlayerCommandSelector,
    message: CxxString,
});

commandPerm.register("replay", "Send message to last player who chatted with you.", "rank-chat.command.replay")
.overload((p, o) => {
    const actor = o.getEntity()?.getNetworkIdentifier().getActor();
    if (actor === null) return;

    if (actor === undefined) {
        send.error(`You are console.`);
        return;
    }
    RankChatMain.ChatReplay(actor, p.message);
}, {
    message: CxxString,
});

commandPerm.register("r", "Send message to last player who chatted with you.", "rank-chat.command.replay")
.overload((p, o) => {
    const actor = o.getEntity()?.getNetworkIdentifier().getActor();
    if (actor === null) return;

    if (actor === undefined) {
        send.error(`You are console.`);
        return;
    }
    RankChatMain.ChatReplay(actor, p.message);
}, {
    message: CxxString,
});

commandPerm.register("setchat", "Customize rank chat.", "rank-chat.command.setchat", CommandPermissionLevel.Operator)
.overload((p, o) => {
    const actor = o.getEntity()?.getNetworkIdentifier().getActor();
    if (actor === null) return;
    const send = new sendMessage(actor);
    if (!Ranks.has(p.rank)) {
        send.error(`Rank not found!`);
        return;
    }
    send.success(`Success to set ${p.rank} chat`);
    RankChatMain.setRankChat(p.rank, p.chat);
}, {
    isrank: command.enum("RankChat_rank", "rank"),
    rank: CxxString,
    chat: CxxString,
})
.overload((p, o) => {
    const actor = o.getEntity()?.getNetworkIdentifier().getActor();
    if (actor === null) return;
    const send = new sendMessage(actor);
    send.success(`Success to set default chat`);
    RankChatMain.setDefaultChat(p.chat);
}, {
    isrank: command.enum("RankChat_default", "default"),
    chat: CxxString,
});