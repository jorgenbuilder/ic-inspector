// A global singleton for our internet computer actors.
import * as Agent from '@dfinity/agent'
import { InterfaceFactory } from '@dfinity/candid/lib/cjs/idl'

import type { All } from './idl/all.d'
import { idlFactory as allIDL } from './idl/all'
import type { CandidUI } from './idl/candid-ui.d'
import { idlFactory as candidIDL } from './idl/candid-ui'

/////////////
// Config //
///////////

const canisters: { [key: string]: string } = {
  candidUI: 'a4gq6-oaaaa-aaaab-qaa4q-cai',
}

const host = 'https://ic0.app'
const hostLocal = 'http://localhost:8000'

////////////
// Agent //
//////////

export const agent = new Agent.HttpAgent({ host })
const agentLocal = new Agent.HttpAgent({ host: hostLocal })
agentLocal.fetchRootKey()

/////////////
// Actors //
///////////

export const candidUI = actor<CandidUI>(canisters.candidUI, candidIDL)
export const canister = generic<All>(allIDL)

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
    Agent.Actor.createActor<T>(idl, { canisterId, agent, ...config })
  const local =
    // (actors[canisterId].local as Agent.ActorSubclass<T>) ||
    Agent.Actor.createActor<T>(idl, {
      canisterId,
      agent: agentLocal,
      ...config,
    })
  // actors[canisterId] = { actor, idl, local }
  return isLocal ? local : actor
}

// Create a function that creates an actor using a generic IDL.
function generic<T>(idl: InterfaceFactory, local = false) {
  return function (canisterId: string): Agent.ActorSubclass<T> {
    return actor<T>(canisterId, idl, local)
  }
}
