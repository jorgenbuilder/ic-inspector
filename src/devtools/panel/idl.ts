import { candidUI, canister } from '../../api/actors'
import { v4 as uuid } from 'uuid'

const interfaces: { [key: string]: string } = {}

export async function getInterface(canister: string): Promise<string> {
  if (!(canister in interfaces)) {
    interfaces[canister] = await importCandid(canister)
  }
  return interfaces[canister]
}

const iframe = document.getElementById('sandbox') as HTMLIFrameElement

export async function importCandid(
  canisterId: string,
  local = false,
): Promise<string> {
  const id = uuid()
  const did = await canister(canisterId).__get_candid_interface_tmp_hack()
  const js = (await candidUI.did_to_js(did))[0] as string
  const response = new Promise<string>((res) => {
    const callback = (event: MessageEvent) => {
      res(event.data)
      window.removeEventListener('message', callback)
    }
    window.addEventListener('message', callback)
  })
  iframe.contentWindow?.postMessage(
    { type: 'get-interface', data: js, id },
    '*',
  )
  return response
}

export async function decodeCandid(
  candid: string,
  data: any,
  method: string,
  type: 'request' | 'response',
): Promise<{ [key: string]: any }> {
  const id = uuid()
  const response = new Promise<{ [key: string]: any }>((res) => {
    const callback = (event: MessageEvent) => {
      console.log(event.data, id)
      if (event.data.id === id) {
        res(event.data.data)
        window.removeEventListener('message', callback)
      }
    }
    window.addEventListener('message', callback)
  })
  iframe.contentWindow?.postMessage(
    { type: 'decode', data: { js: candid, data, method, type, id } },
    '*',
  )
  return response
}
