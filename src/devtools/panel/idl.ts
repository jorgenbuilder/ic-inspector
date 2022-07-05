// import { InterfaceFactory } from '@dfinity/candid/lib/cjs/idl'
import { candidUI, canister } from '../../api/actors'

const interfaces: { [key: string]: string } = {}

export async function getInterface(canister: string): Promise<string> {
  if (!(canister in interfaces)) {
    interfaces[canister] = await importCandid(canister)
  }
  return interfaces[canister]
}

export async function importCandid(
  canisterId: string,
  local = false,
): Promise<string> {
  const did = await canister(canisterId).__get_candid_interface_tmp_hack()
  const js = (await candidUI.did_to_js(did)) as string
  //   const asJs = await import(`data:text/javascript;base64,${btoa(js)}`)
  console.log(js)
  return js
}
