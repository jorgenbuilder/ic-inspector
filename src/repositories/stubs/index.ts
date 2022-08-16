import { readStub } from '../../services/common';
import { MessageEntry } from '../logs';

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
    return readStub(JSON.stringify(log));
}
