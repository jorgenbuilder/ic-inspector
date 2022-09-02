// A global singleton for our internet computer actors.
import * as Agent from '@dfinity/agent';
import { InterfaceFactory } from '@dfinity/candid/lib/cjs/idl';

import type { All } from './idl/all.d';
import { idlFactory as allIDL } from './idl/all';
import type { CandidUI } from './idl/candid-ui.d';
import { idlFactory as candidIDL } from './idl/candid-ui';
import DABCanisters from './idl/dab-canisters.did.d';
import { idlFactory as dabCanistersIDL } from './idl/dab-canisters.did';
import DABTokens from './idl/dab-tokens.did.d';
import { idlFactory as dabTokensIDL } from './idl/dab-tokens.did';
import DABNFTs from './idl/dab-nfts.did.d';
import { idlFactory as dabNFTsIDL } from './idl/dab-nfts.did';

/////////////
// Config //
///////////

const canisters: { [key: string]: string } = {
    candidUI: 'a4gq6-oaaaa-aaaab-qaa4q-cai',
    dabCanisters: 'curr3-vaaaa-aaaah-abbdq-cai',
    dabTokens: 'qwt65-nyaaa-aaaah-qcl4q-cai',
    dabNFTs: 'aipdg-waaaa-aaaah-aaq5q-cai',
};

const host = 'https://ic0.app';
const hostLocal = 'http://localhost:8000';

////////////
// Agent //
//////////

export const agent = new Agent.HttpAgent({ host });
const agentLocal = new Agent.HttpAgent({ host: hostLocal });
agentLocal.fetchRootKey();

/////////////
// Actors //
///////////

export const candidUI = actor<CandidUI>(canisters.candidUI, candidIDL);
export const dabCanisters = actor<DABCanisters>(
    canisters.dabCanisters,
    dabCanistersIDL,
);
export const dabTokens = actor<DABTokens>(canisters.dabTokens, dabTokensIDL);
export const dabNFTs = actor<DABNFTs>(canisters.dabNFTs, dabNFTsIDL);
export const canister = generic<All>(allIDL);

//////////
// Lib //
////////

// Map of existing actors
// const actors: {
//   [key: string]: {
//     actor: Agent.ActorSubclass<unknown>
//     local: Agent.ActorSubclass<unknown>
//     idl: InterfaceFactory
//   }
// } = {}

// Create an actor.
export function actor<T>(
    canisterId: string,
    idl: InterfaceFactory,
    isLocal = false,
    config?: Agent.ActorConfig,
): Agent.ActorSubclass<T> {
    const actor =
        // (actors[canisterId].actor as Agent.ActorSubclass<T>) ||
        Agent.Actor.createActor<T>(idl, { canisterId, agent, ...config });
    const local =
        // (actors[canisterId].local as Agent.ActorSubclass<T>) ||
        Agent.Actor.createActor<T>(idl, {
            canisterId,
            agent: agentLocal,
            ...config,
        });
    // actors[canisterId] = { actor, idl, local }
    return isLocal ? local : actor;
}

// Create a function that creates an actor using a generic IDL.
function generic<T>(idl: InterfaceFactory, local = false) {
    return function (canisterId: string): Agent.ActorSubclass<T> {
        return actor<T>(canisterId, idl, local);
    };
}
