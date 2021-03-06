/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Wednesday, 21st November 2018 10:33:46 am
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-bound-witness-take-origin-chain-server-interactions.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 21st November 2018 10:34:01 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoBoundWitnessServerInteraction } from "./xyo-bound-witness-server-interaction"
import { CatalogueItem } from "@xyo-network/network"

export class XyoBoundWitnessTakeOriginChainServerInteraction extends XyoBoundWitnessServerInteraction {

  get catalogueItem(): CatalogueItem  {
    return CatalogueItem.TAKE_ORIGIN_CHAIN
  }
}
