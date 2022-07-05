import { lebDecode, safeRead, slebDecode } from '@dfinity/candid'
import { PipeArrayBuffer as Pipe } from '@dfinity/candid/lib/cjs/utils/buffer'
import { JsonValue } from '@dfinity/candid/lib/cjs/types'
import {
  Bool,
  Empty,
  Float32,
  Float64,
  Func,
  Int,
  Int16,
  Int32,
  Int64,
  Int8,
  Nat,
  Nat16,
  Nat32,
  Nat64,
  Nat8,
  Null,
  Opt,
  Principal,
  Rec,
  RecClass,
  Record,
  Reserved,
  Service,
  Text,
  Tuple,
  Type,
  Variant,
  Vec,
} from '@dfinity/candid/lib/cjs/idl'

const magicNumber = 'DIDL'

const enum IDLTypeIds {
  Null = -1,
  Bool = -2,
  Nat = -3,
  Int = -4,
  Float32 = -13,
  Float64 = -14,
  Text = -15,
  Reserved = -16,
  Empty = -17,
  Opt = -18,
  Vector = -19,
  Record = -20,
  Variant = -21,
  Func = -22,
  Service = -23,
  Principal = -24,
}

export function decode(bytes: ArrayBuffer): JsonValue[] {
  const b = new Pipe(bytes)

  if (bytes.byteLength < magicNumber.length) {
    throw new Error('Message length smaller than magic number')
  }
  const magicBuffer = safeRead(b, magicNumber.length)
  const magic = new TextDecoder().decode(magicBuffer)
  if (magic !== magicNumber) {
    throw new Error('Wrong magic number: ' + JSON.stringify(magic))
  }

  function readTypeTable(pipe: Pipe): [Array<[IDLTypeIds, any]>, number[]] {
    const typeTable: Array<[IDLTypeIds, any]> = []
    const len = Number(lebDecode(pipe))

    for (let i = 0; i < len; i++) {
      const ty = Number(slebDecode(pipe))
      switch (ty) {
        case IDLTypeIds.Opt:
        case IDLTypeIds.Vector: {
          const t = Number(slebDecode(pipe))
          typeTable.push([ty, t])
          break
        }
        case IDLTypeIds.Record:
        case IDLTypeIds.Variant: {
          const fields = []
          let objectLength = Number(lebDecode(pipe))
          let prevHash
          while (objectLength--) {
            const hash = Number(lebDecode(pipe))
            if (hash >= Math.pow(2, 32)) {
              throw new Error('field id out of 32-bit range')
            }
            if (typeof prevHash === 'number' && prevHash >= hash) {
              throw new Error('field id collision or not sorted')
            }
            prevHash = hash
            const t = Number(slebDecode(pipe))
            fields.push([hash, t])
          }
          typeTable.push([ty, fields])
          break
        }
        case IDLTypeIds.Func: {
          for (let k = 0; k < 2; k++) {
            let funcLength = Number(lebDecode(pipe))
            while (funcLength--) {
              slebDecode(pipe)
            }
          }
          const annLen = Number(lebDecode(pipe))
          safeRead(pipe, annLen)
          typeTable.push([ty, undefined])
          break
        }
        case IDLTypeIds.Service: {
          let servLength = Number(lebDecode(pipe))
          while (servLength--) {
            const l = Number(lebDecode(pipe))
            safeRead(pipe, l)
            slebDecode(pipe)
          }
          typeTable.push([ty, undefined])
          break
        }
        default:
          throw new Error('Illegal op_code: ' + ty)
      }
    }

    const rawList: number[] = []
    const length = Number(lebDecode(pipe))
    for (let i = 0; i < length; i++) {
      rawList.push(Number(slebDecode(pipe)))
    }
    return [typeTable, rawList]
  }
  const [rawTable, rawTypes] = readTypeTable(b)

  const table: RecClass[] = rawTable.map((_) => Rec())
  function getType(t: number): Type {
    if (t < -24) {
      throw new Error('future value not supported')
    }
    if (t < 0) {
      switch (t) {
        case -1:
          return Null
        case -2:
          return Bool
        case -3:
          return Nat
        case -4:
          return Int
        case -5:
          return Nat8
        case -6:
          return Nat16
        case -7:
          return Nat32
        case -8:
          return Nat64
        case -9:
          return Int8
        case -10:
          return Int16
        case -11:
          return Int32
        case -12:
          return Int64
        case -13:
          return Float32
        case -14:
          return Float64
        case -15:
          return Text
        case -16:
          return Reserved
        case -17:
          return Empty
        case -24:
          return Principal
        default:
          throw new Error('Illegal op_code: ' + t)
      }
    }
    if (t >= rawTable.length) {
      throw new Error('type index out of range')
    }
    return table[t]
  }
  function buildType(entry: [IDLTypeIds, any]): Type {
    switch (entry[0]) {
      case IDLTypeIds.Vector: {
        const ty = getType(entry[1])
        return Vec(ty)
      }
      case IDLTypeIds.Opt: {
        const ty = getType(entry[1])
        return Opt(ty)
      }
      case IDLTypeIds.Record: {
        const fields: Record<string, Type> = {}
        for (const [hash, ty] of entry[1]) {
          const name = `_${hash}_`
          fields[name] = getType(ty)
        }
        const record = Record(fields)
        const tuple = record.tryAsTuple()
        if (Array.isArray(tuple)) {
          return Tuple(...tuple)
        } else {
          return record
        }
      }
      case IDLTypeIds.Variant: {
        const fields: Record<string, Type> = {}
        for (const [hash, ty] of entry[1]) {
          const name = `_${hash}_`
          fields[name] = getType(ty)
        }
        return Variant(fields)
      }
      case IDLTypeIds.Func: {
        return Func([], [], [])
      }
      case IDLTypeIds.Service: {
        return Service({})
      }
      default:
        throw new Error('Illegal op_code: ' + entry[0])
    }
  }
  rawTable.forEach((entry, i) => {
    const t = buildType(entry)
    table[i].fill(t)
  })

  const types = rawTypes.map((t) => getType(t))
  const output = types.map((t, i) => {
    return t.decodeValue(b, types[i])
  })

  // skip unused values
  // for (let ind = retTypes.length; ind < types.length; ind++) {
  //   types[ind].decodeValue(b, types[ind]);
  // }

  if (b.byteLength > 0) {
    throw new Error('decode: Left-over bytes')
  }

  return output
}
