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
    var _a;
    if (pkt.type !== packets_1.TextPacket.Types.Chat)
        return;
    pkt.type = packets_1.TextPacket.Types.Raw;
    const player = PlayerByXuid(pkt.xboxUserId);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxzQ0FBb0M7QUFDcEMsa0RBQXdEO0FBRXhELDhDQUE4QztBQUM5QyxpREFBK0M7QUFDL0MsOENBQTZDO0FBQzdDLGlEQUEyQztBQUUzQyw2QkFBNkI7QUFDN0IseUJBQXlCO0FBQ3pCLHlDQUEyQztBQUMzQyw0Q0FBOEM7QUFFOUMsTUFBTSxNQUFNLEdBQUcsSUFBSSxHQUFHLEVBQThCLENBQUM7QUFFckQsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsV0FBVyxDQUFDLENBQUM7QUFDckQsSUFBSSxNQUFNLEdBU047SUFDQSxPQUFPLEVBQUUsa0NBQWtDO0lBQzNDLFFBQVEsRUFBRTtRQUNOLE1BQU0sRUFBRSx1RUFBdUU7UUFDL0UsTUFBTSxFQUFFLHVFQUF1RTtRQUMvRSxPQUFPLEVBQUUsNENBQTRDO0tBQ3hEO0lBQ0QsS0FBSyxFQUFFO1FBQ0gsS0FBSyxFQUFFLGtDQUFrQztRQUN6QyxLQUFLLEVBQUUsa0NBQWtDO1FBQ3pDLEtBQUssRUFBRSxrQ0FBa0M7S0FDNUM7Q0FDSixDQUFDO0FBRUYsSUFBSTtJQUFFLE1BQU0sR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUE7Q0FBRTtBQUFDLE9BQU0sR0FBRyxFQUFFLEdBQUU7QUFFbEQsSUFBaUIsWUFBWSxDQThHNUI7QUE5R0QsV0FBaUIsWUFBWTtJQUN6Qjs7OztPQUlHO0lBQ0gsU0FBZ0IsV0FBVyxDQUFDLElBQVksRUFBRSxJQUFZO1FBQ2xELElBQUksQ0FBQyxXQUFLLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQztZQUFFLE9BQU8sS0FBSyxDQUFDO1FBQ25DLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUMsSUFBSSxDQUFDO1FBQ3hCLE9BQU8sSUFBSSxDQUFDO0lBQ2hCLENBQUM7SUFKZSx3QkFBVyxjQUkx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