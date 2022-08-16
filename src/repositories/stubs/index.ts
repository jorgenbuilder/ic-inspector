import { readStub } from '../../services/common';
import { MessageEntry } from '../logs';

import { default as metascore_getGames } from './metascore.getGames.json';
import { default as metascore_getPlayerCount } from './metascore.getPlayerCount.json';
import { default as metascore_getScoreCount } from './metascore.getScoreCount.json';

export const Stubs = {
    metascore_getGames,
    metascore_getPlayerCount,
    metascore_getScoreCount,
};

export function randomMessage(): MessageEntry {
    const all = Object.values(Stubs);
    const log = all[Math.floor(all.length * Math.random())];
    return readStub(JSON.stringify(log));
}
