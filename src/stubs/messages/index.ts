import { MessageEntry } from '../../services/logging';

import { default as metascore_getGames } from './metascore.getGames.json';
import { default as metascore_getPlayerCount } from './metascore.getPlayerCount.json';
import { default as metascore_getScoreCount } from './metascore.getScoreCount.json';
import { default as distrikt_getFollowCounts } from './distrikt.getFollowCounts.json';
import { default as distrikt_getLatestUsers } from './distrikt.getLatestUsers.json';
import { default as distrikt_getSelf } from './distrikt.getSelf.json';
import { default as distrikt_getSelfUserId } from './distrikt.getSelfUserId.json';
import { default as distrikt_isFollowing } from './distrikt.isFollowing.json';
import { default as distrikt_isUserTrusted } from './distrikt.isUserTrusted.json';
import { default as dscvr_getNotification } from './dscvr.get_notifications.json';
import { default as dscvr_getSelf } from './dscvr.get_self.json';
import { default as dscvr_listContent } from './dscvr.list_content.json';
import { default as dscvr_listHighlightedPortals } from './dscvr.list_highlighted_portals.json';
import { default as dscvr_tipsOfContentIDs } from './dscvr.tipsOfContentIDs.json';
import { default as ghost_transfer_err } from './ghost.transfer.err.json';
import { default as ghost_transfer_ok } from './ghost.transfer.ok.json';
import { default as legends_listings } from './legends.listings.json';
import { default as likes_count } from './likes.count.json';
import { readStub } from '..';

export const Stubs = {
    metascore_getGames,
    metascore_getPlayerCount,
    metascore_getScoreCount,
    dscvr_getNotification,
    dscvr_getSelf,
    dscvr_listContent,
    dscvr_listHighlightedPortals,
    dscvr_tipsOfContentIDs,
    distrikt_getFollowCounts,
    distrikt_getLatestUsers,
    distrikt_getSelf,
    distrikt_getSelfUserId,
    distrikt_isFollowing,
    distrikt_isUserTrusted,
    ghost_transfer_err,
    ghost_transfer_ok,
    legends_listings,
    likes_count,
};

export function randomMessage(): MessageEntry {
    const all = Object.values(Stubs);
    const log = all[Math.floor(all.length * Math.random())];
    return parseStub(log);
}

export function parseStub(stub: any) {
    return replaceRequestIds(readStub(JSON.stringify(stub)));
}

function replaceRequestIds(stub: any) {
    function findIds(stub: any, ids: string[] = []) {
        for (const key in stub) {
            if (['originalRequestId', 'requestId', 'message'].includes(key)) {
                ids.push(stub[key]);
            } else if (typeof stub[key] === 'object') {
                findIds(stub[key], ids);
            }
        }
        return new Set(ids);
    }
    function replaceIds(
        stub: any,
        ids: Set<string>,
        map: { [key: string]: string } = {},
    ) {
        for (const key in stub) {
            let [k, v] = [key, stub[key]];
            if (ids.has(v)) {
                if (!(v in map)) {
                    map[v] = mockRequestId();
                }
                stub[key] = map[v];
            }
            if (ids.has(k)) {
                if (!(k in map)) {
                    map[k] = mockRequestId();
                }
                stub[map[k]] = stub[k];
                delete stub[k];
                k = map[k];
            }
            if (typeof v === 'object') {
                replaceIds(stub[k], ids, map);
            }
        }
        return stub;
    }
    return replaceIds(stub, findIds(stub));
}

export function mockRequestId() {
    return Array(64)
        .fill(null)
        .map((x) => Math.floor(Math.random() * 16).toString(16))
        .join('');
}
