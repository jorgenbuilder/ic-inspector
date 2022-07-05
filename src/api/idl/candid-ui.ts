import { IDL } from '@dfinity/candid'
export const idlFactory: IDL.InterfaceFactory = ({ IDL }) => {
  return IDL.Service({
    did_to_js: IDL.Func([IDL.Text], [IDL.Opt(IDL.Text)], ['query']),
  })
}
