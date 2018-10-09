/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Monday, 10th September 2018 4:29:55 pm
 * @Email:  developer@xyfindables.com
 * @Filename: origin-chain-manager.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Tuesday, 9th October 2018 3:12:34 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoStoragePriority } from '../xyo-storage/xyo-storage-priority';
import { XYOStorageProvider } from '../@types/xyo-storage';
import { XyoBoundWitness } from '../xyo-bound-witness/xyo-bound-witness';
import { XyoOriginBlock } from './xyo-origin-block';
import { XyoPacker } from '../xyo-serialization/xyo-packer';
import { XyoOriginBlockRepository } from '../@types/xyo-origin-chain';
import { XyoHash } from '../xyo-hashing/xyo-hash';

/**
 * An XyoOriginChainNavigator exposes an api for managing
 * an origin chain
 */
export class XyoOriginBlockLocalStorageRepository implements XyoOriginBlockRepository {

  /**
   * Creates an instance of a XyoOriginChainNavigator
   *
   * @param xyoPacker a packer for serializing / deserializing values
   * @param originBlocksStorageProvider A storage provider for storage management
   */

  constructor(
    private readonly xyoPacker: XyoPacker,
    private readonly originBlocksStorageProvider: XYOStorageProvider,
    private readonly originBlockNextHashStorageProvider: XYOStorageProvider
  ) {}

  /**
   * Removes an origin block from storage if it exists
   *
   * @param originBlockHash The hash of the origin block to remove
   */

  public async removeOriginBlock(originBlockHash: Buffer) {
    return this.originBlocksStorageProvider.delete(originBlockHash);
  }

  /**
   * Returns true if the block exists in storage corresponding to the hash, false otherwise
   * @param originBlockHash The hash of the block to query
   */

  public async containsOriginBlock (originBlockHash: Buffer) {
    return this.originBlocksStorageProvider.containsKey(originBlockHash);
  }

  /**
   * Returns a list of all of origin blocks in the system
   */
  public async getAllOriginBlockHashes() {
    return this.originBlocksStorageProvider.getAllKeys();
  }

  /**
   * Adds a bound-witness, which is an origin block, to storage. Additionally it updates
   * any indexes that need to be updated
   */

  public async addOriginBlock(blockHash: XyoHash, originBlock: XyoBoundWitness): Promise<void> {
    const blockDataValue = this.xyoPacker.serialize(originBlock, false);
    const blockHashValue = this.xyoPacker.serialize(blockHash, true);

    const previousHashes = await new XyoOriginBlock(this.xyoPacker, originBlock).findPreviousBlocks();
    const promises = previousHashes.map((hash) => {
      if (!hash) {
        return;
      }

      return this.originBlockNextHashStorageProvider.write(
        hash,
        blockHashValue,
        XyoStoragePriority.PRIORITY_MED,
        true,
        60000
      );
    });

    await Promise.all(promises);

    await this.originBlocksStorageProvider.write(
      blockHashValue,
      blockDataValue,
      XyoStoragePriority.PRIORITY_MED,
      true,
      60000
    );
  }

  public async getOriginBlockByHash(hash: Buffer): Promise<XyoBoundWitness | undefined> {
    try {
      const result = await this.originBlocksStorageProvider.read(hash, 60000);
      if (!result) {
        return undefined;
      }

      const serializer = this.xyoPacker.getSerializerByDescriptor(XyoBoundWitness);
      const boundWitness = serializer.deserialize(result, this.xyoPacker);
      return boundWitness;
    } catch (err) {
      return undefined;
    }
  }
}