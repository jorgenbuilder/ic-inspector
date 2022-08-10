import { IDL } from '@dfinity/candid'

function decodeReturnValue(types: IDL.Type[], msg: ArrayBuffer) {
  const returnValues = IDL.decode(types, msg)
  switch (returnValues.length) {
    case 0:
      return undefined
    case 1:
      return returnValues[0]
    default:
      return returnValues
  }
}

window.addEventListener('message', async function (event) {
  //   const asJs = await import(`data:text/javascript;base64,${btoa(event.data)}`)
  if (event.data.type === 'get-interface') {
    const js = event.data.data
      .replace('export const init = ({ IDL }) => { return []; };', '')
      .replace('export const idlFactory = ({ IDL }) =>', 'return (IDL) =>')
    event.source?.window?.postMessage(js, event.origin)
  } else if (event.data.type === 'decode') {
    console.log(event.data.id)
    const service = Object.fromEntries(
      Function(event.data.data.js)()(IDL)._fields,
    )
    if (event.data.data.type === 'response') {
      event.source?.window?.postMessage(
        {
          id: event.data.id,
          data: decodeReturnValue(
            service[event.data.data.method].retTypes,
            event.data.data.data,
          ),
        },
        '*',
      )
    } else {
      // event.source?.window?.postMessage(
      //   decodeReturnValue(service[event.data.data.method].argTypes, event.data.data.data),
      //   '*',
      // )
    }
  }
})
