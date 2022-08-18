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
import { readStub } from '..';

export const Stubs = {
    metascore_getGames,
    metascore_getPlayerCount,
    metascore_getScoreCount,
    dscvr_getNotification,
    dscvr_getSelf,
    dscvr_listContent,
    dscvr_listHighlightedPortals,
    distrikt_getFollowCounts,
    distrikt_getLatestUsers,
    distrikt_getSelf,
    distrikt_getSelfUserId,
    distrikt_isFollowing,
    distrikt_isUserTrusted,
};

export function randomMessage(): MessageEntry {
    const all = Object.values(Stubs);
    const log = all[Math.floor(all.length * Math.random())];
    return replaceRequestIds(readStub(JSON.stringify(log)));
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
