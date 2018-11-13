/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Tuesday, 18th September 2018 10:28:05 am
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-sha512-hash.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Thursday, 8th November 2018 12:56:39 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoHash } from '../xyo-hash';
import { IXyoHashProvider } from '../../@types/xyo-hashing';

/**
 * An sha512 hash data object
 */

export class XyoSha512Hash extends XyoHash {

  public static major = 0x03;
  public static minor = 0x06;

  /**
   * Creates a new instance of a XyoSha512Hash
   * @param sha512HashProvider A hash provider for sha512
   * @param sha512Hash The binary representation of the hash itself
   */

  constructor(sha512HashProvider: IXyoHashProvider | undefined, sha512Hash: Buffer) {
    super(sha512HashProvider, sha512Hash, XyoSha512Hash.major, XyoSha512Hash.minor);
  }

  public getReadableName(): string {
    return 'sha512-hash';
  }

  public getReadableValue() {
    return this.hash;
  }
}
