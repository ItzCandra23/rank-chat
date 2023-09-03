"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RankChatMain = void 0;
const event_1 = require("bdsx/event");
const packetids_1 = require("bdsx/bds/packetids");
const packets_1 = require("bdsx/bds/packets");
const rank_perms_1 = require("@bdsx/rank-perms");
const message_1 = require("./src/utils/message");
const path = require("path");
const fs = require("fs");
const filter_1 = require("./src/filter");
const launcher_1 = require("bdsx/launcher");
const src_1 = require("@bdsx/rank-perms/src");
const replay = new Map();
const configPath = path.join(__dirname, "chat.json");
let config = {
    default: "§8[§a{rank}§8] §f{name}: §a{msg}",
    toPlayer: {
        player: "§8<§7[§a{rank1}§7] §fYou §ato §7[§a{rank2}§7] §f{name2}§8>§c: §6{msg}",
        target: "§8<§7[§a{rank1}§7] §f{name1} §ato §7[§a{rank2}§7] §fYou§8>§c: §6{msg}",
        console: "<[{rank1}] You >> [{rank2}] {name}>: {msg}",
    },
    ranks: {
        Guest: "§8[§r{rank}§8] §f{name}: §a{msg}",
        Admin: "§8[§r{rank}§8] §f{name}: §d{msg}",
        Owner: "§8[§r{rank}§8] §f{name}: §c{msg}",
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
     * @description example: "[{rank}] {name}: {msg}"
     * @description output: "[Guest] Steve: Hi!"
     */
    function setRankChat(rank, chat) {
        if (!rank_perms_1.RankPerms.hasRank(rank))
            return false;
        config.ranks[rank] = chat;
        return true;
    }
    RankChatMain.setRankChat = setRankChat;
    /**
     * Customize config chat.
     * @description example: "[{rank}] {name}: {msg}"
     * @description output: "[Guest] Steve: Hi!"
     */
    function setDefaultChat(chat) {
        if (!chat.includes("{name}") && !chat.includes("{msg}"))
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
        const rank = (_a = rank_perms_1.RankPerms.getDisplay(src_1.PlayerRank.getRank(player)) + "§r") !== null && _a !== void 0 ? _a : src_1.PlayerRank.getRank(player);
        const username = player.getName();
        const message = chat.replace(/§/g, "");
        let msg = getRankChat(src_1.PlayerRank.getRank(player));
        return msg.replace(/{rank}/g, rank).replace(/{name}/g, username).replace(/{msg}/g, message);
    }
    RankChatMain.getPlayerChat = getPlayerChat;
    function sendChatToConsole(player, chat) {
        const rank = src_1.PlayerRank.getRank(player);
        const username = player.getName();
        const message = chat.replace(/§/g, "");
        const msg = config.console;
        if (!msg)
            return;
        message_1.send.msg(msg.replace(/{rank}/g, rank).replace(/{name}/g, username).replace(/{msg}/g, message));
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
            const rank1 = (_a = rank_perms_1.RankPerms.getDisplay(src_1.PlayerRank.getRank(player)) + "§r") !== null && _a !== void 0 ? _a : src_1.PlayerRank.getRank(player);
            const rank2 = (_b = rank_perms_1.RankPerms.getDisplay(src_1.PlayerRank.getRank(target)) + "§r") !== null && _b !== void 0 ? _b : src_1.PlayerRank.getRank(target);
            const msg1 = getMsg().player.replace("{rank1}", rank1).replace("{rank2}", rank2).replace("{name1}", player.getName()).replace("{name2}", target.getName()).replace("{msg}", message);
            const msg2 = getMsg().target.replace("{rank1}", rank1).replace("{rank2}", rank2).replace("{name1}", player.getName()).replace("{name2}", target.getName()).replace("{msg}", message);
            player.sendMessage(msg1);
            target.sendMessage(msg2);
            replay.set(target, player);
        }
        else {
            const rank1 = rank_perms_1.RankPerms.getRanks()[0];
            const rank2 = src_1.PlayerRank.getRank(target);
            const display1 = (_c = rank_perms_1.RankPerms.getDisplay(rank1) + "§r") !== null && _c !== void 0 ? _c : rank1;
            const display2 = (_d = rank_perms_1.RankPerms.getDisplay(rank2) + "§r") !== null && _d !== void 0 ? _d : rank2;
            const console = getMsg().console;
            if (!console)
                return;
            const msg1 = console.replace("{rank1}", rank1).replace("{rank2}", rank2).replace("{name1}", "Server").replace("{name2}", target.getName()).replace("{msg}", message);
            const msg2 = getMsg().target.replace("{rank1}", display1).replace("{rank2}", display2).replace("{name1}", "Server").replace("{name2}", target.getName()).replace("{msg}", message);
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
    const rank = (_a = rank_perms_1.RankPerms.getDisplay(src_1.PlayerRank.getRank(player)) + "§r") !== null && _a !== void 0 ? _a : src_1.PlayerRank.getRank(player);
    let msg = RankChatMain.getRankChat(src_1.PlayerRank.getRank(player));
    pkt.message = msg.replace(/{rank}/g, rank).replace(/{name}/g, pkt.name).replace(/{msg}/g, filter_1.FiltersChat.filter(pkt.message));
});
event_1.events.serverOpen.on(() => {
    require("./src");
    message_1.send.success("Started!");
});
event_1.events.serverClose.on(() => { RankChatMain.save(true); });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxzQ0FBb0M7QUFDcEMsa0RBQXdEO0FBRXhELDhDQUE4QztBQUU5QyxpREFBNkM7QUFDN0MsaURBQTJDO0FBRTNDLDZCQUE2QjtBQUM3Qix5QkFBeUI7QUFDekIseUNBQTJDO0FBQzNDLDRDQUE4QztBQUM5Qyw4Q0FBa0Q7QUFFbEQsTUFBTSxNQUFNLEdBQUcsSUFBSSxHQUFHLEVBQThCLENBQUM7QUFFckQsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsV0FBVyxDQUFDLENBQUM7QUFDckQsSUFBSSxNQUFNLEdBU047SUFDQSxPQUFPLEVBQUUsa0NBQWtDO0lBQzNDLFFBQVEsRUFBRTtRQUNOLE1BQU0sRUFBRSx1RUFBdUU7UUFDL0UsTUFBTSxFQUFFLHVFQUF1RTtRQUMvRSxPQUFPLEVBQUUsNENBQTRDO0tBQ3hEO0lBQ0QsS0FBSyxFQUFFO1FBQ0gsS0FBSyxFQUFFLGtDQUFrQztRQUN6QyxLQUFLLEVBQUUsa0NBQWtDO1FBQ3pDLEtBQUssRUFBRSxrQ0FBa0M7S0FDNUM7Q0FDSixDQUFDO0FBRUYsSUFBSTtJQUFFLE1BQU0sR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUE7Q0FBRTtBQUFDLE9BQU0sR0FBRyxFQUFFLEdBQUU7QUFFbEQsSUFBaUIsWUFBWSxDQThHNUI7QUE5R0QsV0FBaUIsWUFBWTtJQUN6Qjs7OztPQUlHO0lBQ0gsU0FBZ0IsV0FBVyxDQUFDLElBQVksRUFBRSxJQUFZO1FBQ2xELElBQUksQ0FBQyxzQkFBUyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUM7WUFBRSxPQUFPLEtBQUssQ0FBQztRQUMzQyxNQUFNLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFDLElBQUksQ0FBQztRQUN4QixPQUFPLElBQUksQ0FBQztJQUNoQixDQUFDO0lBSmUsd0JBQVcsY0FJ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