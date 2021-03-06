/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Thursday, 13th September 2018 11:40:42 am
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-tcp-network-pipe.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Friday, 7th December 2018 11:42:41 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoTcpConnectionResult } from './xyo-tcp-connection-result'
import { XyoError, XyoErrors } from '@xyo-network/errors'
import { CatalogueItem, IXyoNetworkPipe } from '@xyo-network/network'
import { XyoBase } from '@xyo-network/base'

/**
 * A communication pipe using tcp/ip stack
 */
export class XyoTcpNetworkPipe extends XyoBase implements IXyoNetworkPipe {

  /**
   * Creates an instance of a XyoTcpNetworkPipe
   *
   * @param connectionResult The resulting connection from the initial tcp/ip exchange
   */

  constructor (private readonly connectionResult: XyoTcpConnectionResult) {
    super()
  }

  /**
   * Returns the peer from the other end of the pipe
   */

  get peer () {
    return {
      getTemporaryPeerId: () => {
        return this.connectionResult.socketId
      }
    }
  }

  /**
   * The peers catalogue
   */

  get otherCatalogue (): CatalogueItem[] {
    return this.connectionResult.catalogueItems
  }

  /**
   * Any initiationData that may have been passed with the first part of the connection
   */

  get initiationData () {
    return this.connectionResult.data
  }

  /**
   * This allows a consumer to register a listener when a peer disconnects
   *
   * @param callback Will be called with `hasError` equal to true if an error occurred
   */

  public onPeerDisconnect(callback: (hasError: boolean) => void): () => void {
    this.connectionResult.socket.on('close', callback)
    return () => {
      this.connectionResult.socket.removeListener('close', callback)
    }
  }

  /**
   * Sends a message to a peer
   * @param message The message to send
   * @param awaitResponse If true, the promised being returned by this function will only resolve
   *                      once the other party sends a message back.
   * @returns Returns the message back from the other party wrapped in a promise. Will return `undefined`
   *          if no response is available
   */

  public send(message: Buffer, awaitResponse?: boolean | undefined): Promise<Buffer | undefined> {
    const networkMessage = this.padBufferWithSize(message)
    this.connectionResult.socket.write(networkMessage)

    if (typeof awaitResponse === 'boolean' && !awaitResponse) {
      return Promise.resolve(undefined)
    }

    return new Promise((resolve, reject) => {
      let timeout: NodeJS.Timeout
      const listener = this.onSendOnDataFn((data) => {
        if (timeout) clearTimeout(timeout)

        return resolve(data)
      }, (err: any) => {
        if (timeout) clearTimeout(timeout)
        reject(err)
      })

      timeout = setTimeout(async () => {
        this.connectionResult.socket.removeListener('data', listener)
        await this.close()
        reject(new XyoError('Connection timed out after sending message', XyoErrors.CRITICAL))
      }, 3000)

      this.connectionResult.socket.on('data', listener)
    }) as Promise<Buffer>
  }

  /**
   * Closes the connection to the peer
   */

  public close(): Promise<void> {
    this.connectionResult.socket.end()
    this.connectionResult.socket.destroy()
    return Promise.resolve(undefined)
  }

  /**
   * A helper function to add a size header to the buffer
   */

  private padBufferWithSize(b: Buffer) {
    const sizeBuffer = Buffer.alloc(4)
    sizeBuffer.writeUInt32BE(b.length + 4, 0)

    return Buffer.concat([sizeBuffer, b])
  }

  /**
   * Returns a function that chunks data and resolves once a tcp message is chunked according
   * to the size provided in the tcp message header
   *
   * @param resolve A resolve function to be called once finished. Will resolve with the message as the first parameter.
   * @param reject A reject function if an error occurs
   */

  private onSendOnDataFn(
    resolve: (value?: Buffer | PromiseLike<Buffer> | undefined) => void,
    reject: (reason?: any) => void
  ) {
    let data: Buffer | undefined
    let sizeOfPayload: number | undefined

    const onSendOnData = (chunk: Buffer) => {
      if (data === undefined) {
        if (chunk.length < 4) {
          this.connectionResult.socket.end()
          return reject(new XyoError(`Corrupt payload`, XyoErrors.CRITICAL))
        }

        sizeOfPayload = chunk.readUInt32BE(0)
      }

      data = Buffer.concat([
        data || Buffer.alloc(0),
        chunk
      ])

      if (sizeOfPayload === data.length) {
        this.connectionResult.socket.removeListener('data', onSendOnData)
        return resolve(data.slice(4))
      }
    }

    return onSendOnData
  }
}
