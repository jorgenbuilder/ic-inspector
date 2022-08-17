import { MessageEntry } from '../services/logging';

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
import { Principal } from '@dfinity/principal';

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

/**
 * Output an object as a stub string, to be reimported for testing.
 */
export function dumpStub(object: any): string {
    function replacer(this: any, key: string, value: any) {
        if (typeof value === 'bigint') {
            return {
                _stub: true,
                _bigint: true,
                val: value.toString(),
            };
        } else if (value?._isPrincipal) {
            return {
                _stub: true,
                _principal: true,
                val: Principal.fromUint8Array(value._arr).toString(),
            };
        } else if (this[key] instanceof URL) {
            return {
                _stub: true,
                _url: true,
                val: value.toString(),
            };
        } else if (this[key] instanceof Date) {
            return {
                _stub: true,
                _date: true,
                value: value,
            }
        }
        return value;
    }
    return JSON.stringify(object, replacer, 2);
}

/**
 * Read a stub string into js object.
 */
export function readStub(stub: string): any {
    function reviver(key: string, value: any) {
        if (value?._stub) {
            if (value._bigint) {
                return BigInt(value.val);
            }
            if (value._principal) {
                return Principal.fromText(value.val);
            }
            if (value._url) {
                return new URL(value.val);
            }
            if (value._date) {
                return new Date(value.val);
            }
        }
        return value;
    }
    return JSON.parse(stub, reviver);
}
