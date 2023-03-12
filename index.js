"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RankChatMain = void 0;
const event_1 = require("bdsx/event");
const packetids_1 = require("bdsx/bds/packetids");
const packets_1 = require("bdsx/bds/packets");
const rank_perms_1 = require("@bdsx/rank-perms");
const src_1 = require("@bdsx/rank-perms/src");
const message_1 = require("./src/utils/message");
const common_1 = require("bdsx/common");
const path = require("path");
const fs = require("fs");
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
event_1.events.packetSend(packetids_1.MinecraftPacketIds.Text).on((pkt, netId) => {
    if (pkt.type !== packets_1.TextPacket.Types.Chat)
        return;
    pkt.type = packets_1.TextPacket.Types.Raw;
    const player = netId.getActor();
    if (!player)
        return common_1.CANCEL;
    RankChatMain.sendChatToConsole(player, pkt.message);
    pkt.message = RankChatMain.getPlayerChat(player, pkt.message);
});
event_1.events.serverOpen.on(() => {
    require("./src");
    message_1.send.success("Started!");
});
event_1.events.serverClose.on(() => { RankChatMain.save(true); });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxzQ0FBb0M7QUFDcEMsa0RBQXdEO0FBRXhELDhDQUE4QztBQUM5QyxpREFBK0M7QUFDL0MsOENBQTZDO0FBQzdDLGlEQUEyQztBQUMzQyx3Q0FBcUM7QUFDckMsNkJBQTZCO0FBQzdCLHlCQUF5QjtBQUV6QixNQUFNLE1BQU0sR0FBRyxJQUFJLEdBQUcsRUFBOEIsQ0FBQztBQUVyRCxNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxXQUFXLENBQUMsQ0FBQztBQUNyRCxJQUFJLE1BQU0sR0FTTjtJQUNBLE9BQU8sRUFBRSxrQ0FBa0M7SUFDM0MsUUFBUSxFQUFFO1FBQ04sTUFBTSxFQUFFLHVFQUF1RTtRQUMvRSxNQUFNLEVBQUUsdUVBQXVFO1FBQy9FLE9BQU8sRUFBRSw0Q0FBNEM7S0FDeEQ7SUFDRCxLQUFLLEVBQUU7UUFDSCxLQUFLLEVBQUUsa0NBQWtDO1FBQ3pDLEtBQUssRUFBRSxrQ0FBa0M7UUFDekMsS0FBSyxFQUFFLGtDQUFrQztLQUM1QztJQUNELE9BQU8sRUFBRSx3QkFBd0I7Q0FDcEMsQ0FBQztBQUVGLElBQUk7SUFBRSxNQUFNLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFBO0NBQUU7QUFBQyxPQUFNLEdBQUcsRUFBRSxHQUFFO0FBRWxELElBQWlCLFlBQVksQ0E4RzVCO0FBOUdELFdBQWlCLFlBQVk7SUFDekI7Ozs7T0FJRztJQUNILFNBQWdCLFdBQVcsQ0FBQyxJQUFZLEVBQUUsSUFBWTtRQUNsRCxJQUFJLENBQUMsV0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUM7WUFBRSxPQUFPLEtBQUssQ0FBQztRQUNuQyxNQUFNLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFDLElBQUksQ0FBQztRQUN4QixPQUFPLElBQUksQ0FBQztJQUNoQixDQUFDO0lBSmUs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
