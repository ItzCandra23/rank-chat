"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RankChatMain = void 0;
const event_1 = require("bdsx/event");
const packetids_1 = require("bdsx/bds/packetids");
const packets_1 = require("bdsx/bds/packets");
const rank_perms_1 = require("@bdsx/rank-perms");
const src_1 = require("@bdsx/rank-perms/src");
const message_1 = require("./src/utils/message");
const path = require("path");
const fs = require("fs");
const filter_1 = require("./src/filter");
const launcher_1 = require("bdsx/launcher");
const replay = new Map();
const configPath = path.join(__dirname, "chat.json");
let config = {
    default: "§8[§a%rank%§8] §f%name%: §a%msg%",
    toPlayer: {
        player: "§8<§7[§a%rank1%§7] §fYou §ato §7[§a%rank2%§7] §f%name2%§8>§c: §6%msg%",
        target: "§8<§7[§a%rank1%§7] §f%name1% §ato §7[§a%rank2%§7] §fYou§8>§c: §6%msg%",
        console: "<[%rank1%] You >> [%rank2%] %name%>: %msg%",
    },
    ranks: {
        Guest: "§8[§r%rank%§8] §f%name%: §a%msg%",
        Admin: "§8[§r%rank%§8] §f%name%: §d%msg%",
        Owner: "§8[§r%rank%§8] §f%name%: §c%msg%",
    },
    console: "[%rank%] %name%: %msg%",
};
try {
    config = require(configPath);
}
catch (err) { }
var RankChatMain;
(function (RankChatMain) {
    /**
     * Customize config rank chat.
     * @description example: "[%rank%] %name%: %msg%"
     * @description output: "[Guest] Steve: Hi!"
     */
    function setRankChat(rank, chat) {
        if (!src_1.Ranks.has(rank))
            return false;
        config.ranks[rank] = chat;
        return true;
    }
    RankChatMain.setRankChat = setRankChat;
    /**
     * Customize config chat.
     * @description example: "[%rank%] %name%: %msg%"
     * @description output: "[Guest] Steve: Hi!"
     */
    function setDefaultChat(chat) {
        if (!chat.includes("%name%") && !chat.includes("%msg%"))
            return false;
        config.default = chat;
        return true;
    }
    RankChatMain.setDefaultChat = setDefaultChat;
    /**Get config rank chat */
    function getRankChat(rank) {
        if (!config.ranks.hasOwnProperty(rank))
            return config.default.replace(/&/g, "§");
        return config.ranks[rank].replace(/&/g, "§");
    }
    RankChatMain.getRankChat = getRankChat;
    /**Get config chat */
    function getDefaultChat() {
        return config.default.replace(/&/g, "§");
    }
    RankChatMain.getDefaultChat = getDefaultChat;
    function getPlayerChat(player, chat) {
        var _a;
        const rank = (_a = src_1.Ranks.getDisplay(rank_perms_1.Permissions.getRank(player)) + "§r") !== null && _a !== void 0 ? _a : rank_perms_1.Permissions.getRank(player);
        const username = player.getName();
        const message = chat.replace(/§/g, "");
        let msg = getRankChat(rank_perms_1.Permissions.getRank(player));
        return msg.replace(/%rank%/g, rank).replace(/%name%/g, username).replace(/%msg%/g, message);
    }
    RankChatMain.getPlayerChat = getPlayerChat;
    function sendChatToConsole(player, chat) {
        const rank = rank_perms_1.Permissions.getRank(player);
        const username = player.getName();
        const message = chat.replace(/§/g, "");
        const msg = config.console;
        if (!msg)
            return;
        message_1.send.msg(msg.replace(/%rank%/g, rank).replace(/%name%/g, username).replace(/%msg%/g, message));
    }
    RankChatMain.sendChatToConsole = sendChatToConsole;
    function getMsg() {
        return config.toPlayer;
    }
    RankChatMain.getMsg = getMsg;
    function ChatPlayer(player, target, message) {
        var _a, _b, _c, _d;
        if (player) {
            if (player.getName() === target.getName()) {
                player.sendMessage(`§cYou cant send message to yourself`);
                return;
            }
            const rank1 = (_a = src_1.Ranks.getDisplay(rank_perms_1.Permissions.getRank(player)) + "§r") !== null && _a !== void 0 ? _a : rank_perms_1.Permissions.getRank(player);
            const rank2 = (_b = src_1.Ranks.getDisplay(rank_perms_1.Permissions.getRank(target)) + "§r") !== null && _b !== void 0 ? _b : rank_perms_1.Permissions.getRank(target);
            const msg1 = getMsg().player.replace("%rank1%", rank1).replace("%rank2%", rank2).replace("%name1%", player.getName()).replace("%name2%", target.getName()).replace("%msg%", message);
            const msg2 = getMsg().target.replace("%rank1%", rank1).replace("%rank2%", rank2).replace("%name1%", player.getName()).replace("%name2%", target.getName()).replace("%msg%", message);
            player.sendMessage(msg1);
            target.sendMessage(msg2);
            replay.set(target, player);
        }
        else {
            const rank1 = src_1.Ranks.getRanks()[0];
            const rank2 = rank_perms_1.Permissions.getRank(target);
            const display1 = (_c = src_1.Ranks.getDisplay(rank1) + "§r") !== null && _c !== void 0 ? _c : rank1;
            const display2 = (_d = src_1.Ranks.getDisplay(rank2) + "§r") !== null && _d !== void 0 ? _d : rank2;
            const console = getMsg().console;
            if (!console)
                return;
            const msg1 = console.replace("%rank1%", rank1).replace("%rank2%", rank2).replace("%name1%", "Server").replace("%name2%", target.getName()).replace("%msg%", message);
            const msg2 = getMsg().target.replace("%rank1%", display1).replace("%rank2%", display2).replace("%name1%", "Server").replace("%name2%", target.getName()).replace("%msg%", message);
            message_1.send.msg(msg1);
            target.sendMessage(msg2);
        }
    }
    RankChatMain.ChatPlayer = ChatPlayer;
    function ChatReplay(player, message) {
        const target = replay.get(player);
        if (!target) {
            player.sendMessage(`§cPlayer not found!`);
            return false;
        }
        else {
            ChatPlayer(player, target, message);
            return true;
        }
    }
    RankChatMain.ChatReplay = ChatReplay;
    /**Save. */
    function save(message = false) {
        fs.writeFile(configPath, JSON.stringify(config, null, 2), "utf8", (err) => {
            if (message) {
                if (err) {
                    message_1.send.error(`config.json ${err}`);
                    throw err;
                }
                else
                    message_1.send.success(`config.json Saved!`);
            }
        });
    }
    RankChatMain.save = save;
})(RankChatMain = exports.RankChatMain || (exports.RankChatMain = {}));
function PlayerByName(name) {
    const players = launcher_1.bedrockServer.serverInstance.getPlayers();
    for (const [i, player] of players.entries()) {
        if (player.getName().toLowerCase() !== name.toLowerCase())
            return undefined;
        else
            return player;
    }
}
function PlayerByXuid(xuid) {
    return launcher_1.bedrockServer.level.getPlayerByXuid(xuid);
}
event_1.events.packetSend(packetids_1.MinecraftPacketIds.Text).on((pkt, netId) => {
    const player = netId.getActor();
    if (!player)
        return;
    if (config.console) {
        const rank = rank_perms_1.Permissions.getRank(player);
        message_1.send.msg(config.console.replace(/%rank%/g, rank).replace(/%name%/g, pkt.name).replace(/%msg%/g, pkt.message));
    }
});
event_1.events.packetSend(packetids_1.MinecraftPacketIds.Text).on((pkt, netId) => {
    var _a;
    if (pkt.type !== packets_1.TextPacket.Types.Chat)
        return;
    pkt.type = packets_1.TextPacket.Types.Raw;
    const player = PlayerByName(pkt.name);
    if (!player)
        return;
    const rank = (_a = src_1.Ranks.getDisplay(rank_perms_1.Permissions.getRank(player)) + "§r") !== null && _a !== void 0 ? _a : rank_perms_1.Permissions.getRank(player);
    let msg = RankChatMain.getRankChat(rank_perms_1.Permissions.getRank(player));
    pkt.message = msg.replace(/%rank%/g, rank).replace(/%name%/g, pkt.name).replace(/%msg%/g, filter_1.FiltersChat.filter(pkt.message));
});
event_1.events.serverOpen.on(() => {
    require("./src");
    message_1.send.success("Started!");
});
event_1.events.serverClose.on(() => { RankChatMain.save(true); });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxzQ0FBb0M7QUFDcEMsa0RBQXdEO0FBRXhELDhDQUE4QztBQUM5QyxpREFBK0M7QUFDL0MsOENBQTZDO0FBQzdDLGlEQUEyQztBQUUzQyw2QkFBNkI7QUFDN0IseUJBQXlCO0FBQ3pCLHlDQUEyQztBQUMzQyw0Q0FBOEM7QUFFOUMsTUFBTSxNQUFNLEdBQUcsSUFBSSxHQUFHLEVBQThCLENBQUM7QUFFckQsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsV0FBVyxDQUFDLENBQUM7QUFDckQsSUFBSSxNQUFNLEdBU047SUFDQSxPQUFPLEVBQUUsa0NBQWtDO0lBQzNDLFFBQVEsRUFBRTtRQUNOLE1BQU0sRUFBRSx1RUFBdUU7UUFDL0UsTUFBTSxFQUFFLHVFQUF1RTtRQUMvRSxPQUFPLEVBQUUsNENBQTRDO0tBQ3hEO0lBQ0QsS0FBSyxFQUFFO1FBQ0gsS0FBSyxFQUFFLGtDQUFrQztRQUN6QyxLQUFLLEVBQUUsa0NBQWtDO1FBQ3pDLEtBQUssRUFBRSxrQ0FBa0M7S0FDNUM7SUFDRCxPQUFPLEVBQUUsd0JBQXdCO0NBQ3BDLENBQUM7QUFFRixJQUFJO0lBQUUsTUFBTSxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQTtDQUFFO0FBQUMsT0FBTSxHQUFHLEVBQUUsR0FBRTtBQUVsRCxJQUFpQixZQUFZLENBOEc1QjtBQTlHRCxXQUFpQixZQUFZO0lBQ3pCOzs7O09BSUc7SUFDSCxTQUFnQixXQUFXLENBQUMsSUFBWSxFQUFFLElBQVk7UUFDbEQsSUFBSSxDQUFDLFdBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDO1lBQUUsT0FBTyxLQUFLLENBQUM7UUFDbkMsTUFBTSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBQyxJQUFJLENBQUM7UUFDeEIsT0FBTyxJQUFJLENBQUM7SUFD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