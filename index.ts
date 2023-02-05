import { events } from "bdsx/event";
import { MinecraftPacketIds } from "bdsx/bds/packetids";
import { ServerPlayer } from "bdsx/bds/player";
import { TextPacket } from "bdsx/bds/packets";
import { Permissions } from "@bdsx/rank-perms";
import { Ranks } from "@bdsx/rank-perms/src";
import { send } from "./src/utils/message";
import * as path from "path";
import * as fs from "fs";

const replay = new Map<ServerPlayer, ServerPlayer>();

const configPath = path.join(__dirname, "chat.json");
let config: {
    default: string;
    toPlayer: {
        console: string;
        player: string;
        target: string;
    };
    ranks: Record<string, string>;
    autopermissions: boolean;
    sendToConsole: boolean;
} = {
    default: "§8[%rank%§8] §f%name%: §a%msg%",
    toPlayer: {
        console: "<[%rank1%] You >> [%rank2%] %name%>: %msg%",
        player: "§8<§7[%rank1%§7] §fYou §ato §7[%rank2%§7] §f%name2%§8>§c: §6%msg%",
        target: "§8<§7[%rank1%§7] §f%name1% §ato §7[%rank2%§7] §fYou§8>§c: §6%msg%",
    },
    ranks: {},
    autopermissions: true,
    sendToConsole: true,
};

try { config = require(configPath) } catch(err) {}

export namespace RankChatMain {
    /**
     * Customize config rank chat.
     * @description example: "[%rank%] %name%: %msg%"
     * @description output: "[Guest] Steve: Hi!"
     */
    export function setRankChat(rank: string, chat: string): boolean {
        if (!Ranks.has(rank)) return false;
        config.ranks[rank]=chat;
        return true;
    }

    /**Get config rank chat */
    export function getRankChat(rank: string): string {
        if (!config.ranks.hasOwnProperty(rank)) return config.default.replace(/&/g, "§");
        return config.ranks[rank].replace(/&/g, "§");
    }

    /**
     * Customize config chat.
     * @description example: "[%rank%] %name%: %msg%"
     * @description output: "[Guest] Steve: Hi!"
     */
    export function setDefaultChat(chat: string): boolean {
        if (!chat.includes("%name%")&&!chat.includes("%msg%")) return false;
        config.default=chat;
        return true;
    }

    /**Get config chat */
    export function getDefaultChat(): string {
        return config.default.replace(/&/g, "§");
    }

    export function getPlayerChat(player: ServerPlayer, chat: string): string {
        const rank = Ranks.getDisplay(Permissions.getRank(player))+"§r" ?? Permissions.getRank(player);
        const username = player.getNameTag();
        const message = chat.replace(/§/g, "");
        let msg = getRankChat(Permissions.getRank(player));
        return msg.replace(/%rank%/g, rank).replace(/%name%/g, username).replace(/%msg%/g, msg);
    }

    export function getMsg() {
        return config.toPlayer;
    }

    export function isAutoPerms(): boolean {
        return config.autopermissions;
    }

    export function ChatPlayer(player: ServerPlayer|undefined, target: ServerPlayer, message: string): void {
        if (player) {
            if (player.getNameTag() === target.getNameTag()) {
                player.sendMessage(`§cYou cant send message to yourself`);
                return;
            }
            const rank1 = Ranks.getDisplay(Permissions.getRank(player))+"§r" ?? Permissions.getRank(player);
            const rank2 = Ranks.getDisplay(Permissions.getRank(target))+"§r" ?? Permissions.getRank(target);
            const msg1 = getMsg().player.replace("%rank1%", rank1).replace("%rank2%", rank2).replace("%name1%", player.getNameTag()).replace("%name2%", target.getNameTag()).replace("%msg%", message);
            const msg2 = getMsg().target.replace("%rank1%", rank1).replace("%rank2%", rank2).replace("%name1%", player.getNameTag()).replace("%name2%", target.getNameTag()).replace("%msg%", message);
            player.sendMessage(msg1);
            target.sendMessage(msg2);
            replay.set(target, player);
        }
        else {
            const rank1 = Ranks.getRanks()[0];
            const rank2 = Permissions.getRank(target);
            const display1 = Ranks.getDisplay(rank1)+"§r" ?? rank1;
            const display2 = Ranks.getDisplay(rank2)+"§r" ?? rank2;
            const msg1 = getMsg().console.replace("%rank1%", display1).replace("%rank2%", display2).replace("%name1%", "Server").replace("%name2%", target.getNameTag()).replace("%msg%", message);
            const msg2 = getMsg().target.replace("%rank1%", display1).replace("%rank2%", display2).replace("%name1%", "Server").replace("%name2%", target.getNameTag()).replace("%msg%", message);
            send.msg(msg1);
            target.sendMessage(msg2);
        }
    }

    export function ChatReplay(player: ServerPlayer, message: string): boolean {
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

    export let sendToConsole = config.sendToConsole;

    /**Save. */
    export function save(message: boolean = false): void {
        fs.writeFile(configPath, JSON.stringify(config, null, 2), "utf8", (err) => {
            if (message) {
                if (err) {
                    send.error(`config.json ${err}`);
                    throw err;
                }
                else send.success(`config.json Saved!`);
            }
        });
    }
}

events.packetBefore(MinecraftPacketIds.Text).on((pkt, ni) => {
    const player = ni.getActor();
    if (!player) return;

    pkt.type=TextPacket.Types.Chat;
    pkt.name="";
    pkt.message = RankChatMain.getPlayerChat(player, pkt.message);
    if (config.sendToConsole) send.msg(`<${Permissions.getRank(player)}> ${player.getNameTag()}: ${pkt.message}`);
});

events.serverOpen.on(() => {
    require("./src/commands");
    send.success("Started!");
});

events.serverClose.on(() => { RankChatMain.save(true) });