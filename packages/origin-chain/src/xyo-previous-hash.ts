/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Friday, 7th December 2018 1:16:16 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-previous-hash.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Friday, 7th December 2018 1:18:09 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoBaseSerializable, IXyoDeserializer, IXyoSerializationService, parse, IXyoSerializableObject } from "@xyo-network/serialization"
import { schema } from '@xyo-network/serialization-schema'
import { IXyoHash } from "@xyo-network/hashing"

export class XyoPreviousHash extends XyoBaseSerializable {

  public static deserializer: IXyoDeserializer<XyoPreviousHash>
  public readonly schemaObjectId = schema.previousHash.id

  constructor (public readonly hash: IXyoHash) {
    super()
  }

  public getData(): IXyoSerializableObject {
    return this.hash
  }
}

// tslint:disable-next-line:max-classes-per-file
class XyoNextPublicKeyDeserializer implements IXyoDeserializer<XyoPreviousHash> {
  public readonly schemaObjectId = schema.previousHash.id

  public deserialize(data: Buffer, serializationService: IXyoSerializationService): XyoPreviousHash {
    const parseResult = parse(data)
    return new XyoPreviousHash(serializationService.deserialize(parseResult.dataBytes).hydrate<IXyoHash>())
  }
}

XyoPreviousHash.deserializer = new XyoNextPublicKeyDeserializer()
