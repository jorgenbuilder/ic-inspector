import { IDL } from '@dfinity/candid'
export const idlFactory: IDL.InterfaceFactory = ({ IDL }) => {
  return IDL.Service({
    __get_candid_interface_tmp_hack: IDL.Func([], [IDL.Text], ['query']),
  })
}
