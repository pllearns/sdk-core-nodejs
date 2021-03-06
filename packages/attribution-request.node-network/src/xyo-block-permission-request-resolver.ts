/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Tuesday, 5th February 2019 11:56:51 am
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-block-permission-request-resolver.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Tuesday, 19th February 2019 6:23:36 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

/** Tries to resolve permission for a block by requesting it from the node-network */

import { IBlockPermissionRequestResolver, IRequestPermissionForBlockResult } from '@xyo-network/attribution-request'
import { IXyoHash } from '@xyo-network/hashing'
import { IXyoNodeNetwork } from '@xyo-network/node-network'
import { XyoBase } from '@xyo-network/base'

export class XyoBlockPermissionRequestResolver extends XyoBase implements IBlockPermissionRequestResolver {

  constructor (private readonly nodeNetwork: IXyoNodeNetwork) {
    super()
  }

  public async requestPermissionForBlock(
    hash: IXyoHash,
    timeout: number
  ): Promise<IRequestPermissionForBlockResult | undefined> {
    let resolved = false
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (!resolved) {
          resolved = true
          resolve(undefined)
          unsubscribeFn()
        }
      }, timeout)

      const unsubscribeFn = this.nodeNetwork.requestPermissionForBlock(hash, (pk, permission) => {
        if (resolved) {
          return
        }

        resolved = true
        resolve(permission)
        unsubscribeFn()
      })
    }) as Promise<IRequestPermissionForBlockResult | undefined>
  }
}
