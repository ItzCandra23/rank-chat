import { events } from "bdsx/event";
import { MinecraftPacketIds } from "bdsx/bds/packetids";
import { ServerPlayer } from "bdsx/bds/player";
import { TextPacket } from "bdsx/bds/packets";
import { Permissions } from "@bdsx/rank-perms";
import { Ranks } from "@bdsx/rank-perms/src";
import { send } from "./src/utils/message";
import { CANCEL } from "bdsx/common";
import * as path from "path";
import * as fs from "fs";
import { FiltersChat } from "./src/filter";
import { bedrockServer } from "bdsx/launcher";

const replay = new Map<ServerPlayer, ServerPlayer>();

const configPath = path.join(__dirname, "chat.json");
let config: {
    default: string;
    toPlayer: {
        console?: string;
        player: string;
        target: string;
    };
    ranks: Record<string, string>;
    console?: string;
} = {
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

    /**Get config rank chat */
    export function getRankChat(rank: string): string {
        if (!config.ranks.hasOwnProperty(rank)) return config.default.replace(/&/g, "§");
        return config.ranks[rank].replace(/&/g, "§");
    }

    /**Get config chat */
    export function getDefaultChat(): string {
        return config.default.replace(/&/g, "§");
    }

    export function getPlayerChat(player: ServerPlayer, chat: string): string {
        const rank = Ranks.getDisplay(Permissions.getRank(player))+"§r" ?? Permissions.getRank(player);
        const username = player.getName();
        const message = chat.replace(/§/g, "");
        let msg = getRankChat(Permissions.getRank(player));
        return msg.replace(/%rank%/g, rank).replace(/%name%/g, username).replace(/%msg%/g, message);
    }

    export function sendChatToConsole(player: ServerPlayer, chat: string): void {
        const rank = Permissions.getRank(player);
        const username = player.getName();
        const message = chat.replace(/§/g, "");
        const msg = config.console;
        if (!msg) return;
        send.msg(msg.replace(/%rank%/g, rank).replace(/%name%/g, username).replace(/%msg%/g, message));
    }

    export function getMsg() {
        return config.toPlayer;
    }

    export function ChatPlayer(player: ServerPlayer|undefined, target: ServerPlayer, message: string): void {
        if (player) {
            if (player.getName() === target.getName()) {
                player.sendMessage(`§cYou cant send message to yourself`);
                return;
            }
            const rank1 = Ranks.getDisplay(Permissions.getRank(player))+"§r" ?? Permissions.getRank(player);
            const rank2 = Ranks.getDisplay(Permissions.getRank(target))+"§r" ?? Permissions.getRank(target);
            const msg1 = getMsg().player.replace("%rank1%", rank1).replace("%rank2%", rank2).replace("%name1%", player.getName()).replace("%name2%", target.getName()).replace("%msg%", message);
            const msg2 = getMsg().target.replace("%rank1%", rank1).replace("%rank2%", rank2).replace("%name1%", player.getName()).replace("%name2%", target.getName()).replace("%msg%", message);
            player.sendMessage(msg1);
            target.sendMessage(msg2);
            replay.set(target, player);
        }
        else {
            const rank1 = Ranks.getRanks()[0];
            const rank2 = Permissions.getRank(target);
            const display1 = Ranks.getDisplay(rank1)+"§r" ?? rank1;
            const display2 = Ranks.getDisplay(rank2)+"§r" ?? rank2;

            const console = getMsg().console;
            if (!console) return;

            const msg1 = console.replace("%rank1%", rank1).replace("%rank2%", rank2).replace("%name1%", "Server").replace("%name2%", target.getName()).replace("%msg%", message);
            const msg2 = getMsg().target.replace("%rank1%", display1).replace("%rank2%", display2).replace("%name1%", "Server").replace("%name2%", target.getName()).replace("%msg%", message);

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

function PlayerByName(name: string): ServerPlayer|undefined {
    const players = bedrockServer.serverInstance.getPlayers();

    for (const [i, player] of players.entries()) {
        if (player.getName().toLowerCase() !== name.toLowerCase()) return undefined;
        else return player;
    }
}

function PlayerByXuid(xuid: string): ServerPlayer|null {
    return bedrockServer.level.getPlayerByXuid(xuid);
}

events.packetSend(MinecraftPacketIds.Text).on((pkt, netId) => {
    if (pkt.type !== TextPacket.Types.Chat) return;

    pkt.type = TextPacket.Types.Raw;

    const player = PlayerByXuid(pkt.xboxUserId);
    if (!player) return;

    const rank = Ranks.getDisplay(Permissions.getRank(player))+"§r" ?? Permissions.getRank(player);
    let msg = RankChatMain.getRankChat(Permissions.getRank(player));

    pkt.message = msg.replace(/%rank%/g, rank).replace(/%name%/g, pkt.name).replace(/%msg%/g, FiltersChat.filter(pkt.message));
});

events.serverOpen.on(() => {
    require("./src");
    send.success("Started!");
});

events.serverClose.on(() => { RankChatMain.save(true) });
