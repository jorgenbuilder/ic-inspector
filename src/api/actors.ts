// A global singleton for our internet computer actors.
import * as Agent from '@dfinity/agent';
import { InterfaceFactory } from '@dfinity/candid/lib/cjs/idl';
import type { CandidUI } from './idl/candid-ui.d';
import { idlFactory as candidIDL } from './idl/candid-ui';
import { sandboxEvalInterface } from '../services/sandbox';
import { mapOptional } from '../services/common';
import type { All } from './idl/all.d';
import { idlFactory as allIDL } from './idl/all';
import DABCanisters from './idl/dab-canisters.did.d';
import { idlFactory as dabCanistersIDL } from './idl/dab-canisters.did';
import DABTokens from './idl/dab-tokens.did.d';
import { idlFactory as dabTokensIDL } from './idl/dab-tokens.did';
import DABNFTs from './idl/dab-nfts.did.d';
import { idlFactory as dabNFTsIDL } from './idl/dab-nfts.did';

// TODO: Clean up these error classes. We only user the parent, because introspecting error classes between sandbox and origin would require de/serialization that I don't feel like dealing with.
class CandidInterfaceError extends Error { }

class CanisterExposesNoInterfaceError extends CandidInterfaceError { }


export class ActorHelper {
    boundryUrl: URL;
    isLocal: boolean;
    interfaces: { [key: string]: 'ok' };
    constructor(url: URL) {
        this.boundryUrl = new URL(url.origin);
        this.isLocal = this.boundryUrl.toString().includes('localhost') || this.boundryUrl.toString().includes('127.0.0.1');
        this.interfaces = {};
    }

    createActor<T>(
        canisterId: string,
        idl: InterfaceFactory,
        config?: Agent.ActorConfig,
    ): Agent.ActorSubclass<T> {
        const agent = new Agent.HttpAgent({ host: this.boundryUrl.toString() });
        return Agent.Actor.createActor<T>(idl, { canisterId, agent, ...config });
    }

    createCandidUIActor(): Agent.ActorSubclass<CandidUI> {
        let canisterId = this.isLocal ? 'b77ix-eeaaa-aaaaa-qaada-cai' : 'a4gq6-oaaaa-aaaab-qaa4q-cai';
        return this.createActor<CandidUI>(canisterId, candidIDL);
    }

    createDABCansitersActor(): Agent.ActorSubclass<DABCanisters> | undefined {
        if (this.isLocal) {
            return undefined;
        }
        let canisterId = 'curr3-vaaaa-aaaah-abbdq-cai';
        return this.createActor<DABCanisters>(canisterId, dabCanistersIDL);
    }

    createDABTokensActor(): Agent.ActorSubclass<DABTokens> | undefined {
        if (this.isLocal) {
            return undefined;
        }
        let canister = 'qwt65-nyaaa-aaaah-qcl4q-cai';
        return this.createActor<DABTokens>(canister, dabTokensIDL);
    }

    createDABNFTsActor(): Agent.ActorSubclass<DABNFTs> | undefined {
        if (this.isLocal) {
            return undefined;
        }
        let canister = 'aipdg-waaaa-aaaah-aaq5q-cai';
        return this.createActor<DABNFTs>(canister, dabNFTsIDL);
    }

    /**
     * Get interface factory from memory, or attempt to import it. Throws an error if an interface factory can't be imported.
     * @deprecated We can't transmit IDLs to and from the sandbox
     */
    async getCanisterIDL(
        canisterId: string,
    ): Promise<'ok'> {
        if (!(canisterId in this.interfaces)) {
            const i = await this.importCandidInterface(canisterId);
            if (!i) {
                throw new CanisterExposesNoInterfaceError(
                    `Could not retrieve IDL for canister ${canisterId}`,
                );
            }
            this.interfaces[canisterId] = i;
        }
        return this.interfaces[canisterId];
    }

    /**
     * Attempts to import the interface bindings for a given canister, which can be used for effective candid decoding. Currently will not work for Rust canisters (will return undefined).
     */
    async importCandidInterface(
        canisterId: string,
    ): Promise<'ok' | undefined> {
        const candid = await this.fetchCandidInterface(canisterId);
        if (!candid) return undefined;
        const js = await this.convertCandidToJavascript(candid);
        if (!js) return undefined;
        return sandboxEvalInterface(canisterId, this.boundryUrl, js);
    }

    /**
     * Attempts to retrieve the candid interface for a given canister. Relies on `canister.__get_candid_interface_tmp_hack`, which works for Motoko canisters, but not Rust canisters.
     * @returns Candid interface in text format
     */
    async fetchCandidInterface(
        canisterId: string,
    ): Promise<string | undefined> {
        try {
            const canister = this.createActor<All>(canisterId, allIDL);
            return await canister.__get_candid_interface_tmp_hack();
        } catch (e) {
            return undefined;
        }
    }

    /**
     * Attempts to convert a candid interface definition into a javascript interface definition, using the dfinity Candid UI canister.
     * @param candid Candid interface in text format
     * @returns Javascript interface in text format
     */
    async convertCandidToJavascript(
        candid: string,
    ): Promise<string | undefined> {
        const candidUI = this.createCandidUIActor();
        return mapOptional(await candidUI.did_to_js(candid));
    }

}