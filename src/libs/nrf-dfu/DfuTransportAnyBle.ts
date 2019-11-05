/**
 * copyright (c) 2015 - 2018, Nordic Semiconductor ASA
 *
 * all rights reserved.
 *
 * redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 *
 * 1. redistributions of source code must retain the above copyright notice, this
 *    list of conditions and the following disclaimer.
 *
 * 2. redistributions in binary form, except as embedded into a nordic
 *    semiconductor asa integrated circuit in a product or a software update for
 *    such product, must reproduce the above copyright notice, this list of
 *    conditions and the following disclaimer in the documentation and/or other
 *    materials provided with the distribution.
 *
 * 3. neither the name of Nordic Semiconductor ASA nor the names of its
 *    contributors may be used to endorse or promote products derived from this
 *    software without specific prior written permission.
 *
 * 4. this software, with or without modification, must only be used with a
 *    Nordic Semiconductor ASA integrated circuit.
 *
 * 5. any software provided in binary form under this license must not be reverse
 *    engineered, decompiled, modified and/or disassembled.
 *
 * this software is provided by Nordic Semiconductor ASA "as is" and any express
 * or implied warranties, including, but not limited to, the implied warranties
 * of merchantability, noninfringement, and fitness for a particular purpose are
 * disclaimed. in no event shall Nordic Semiconductor ASA or contributors be
 * liable for any direct, indirect, incidental, special, exemplary, or
 * consequential damages (including, but not limited to, procurement of substitute
 * goods or services; loss of use, data, or profits; or business interruption)
 * however caused and on any theory of liability, whether in contract, strict
 * liability, or tort (including negligence or otherwise) arising in any way out
 * of the use of this software, even if advised of the possibility of such damage.
 *
 */

import Debug from 'debug';
import DfuTransportPrn from './DfuTransportPrn';
import { DfuError, ErrorCode } from './DfuError';
import { Observable, Subscription } from 'rxjs';
import { Buffer } from 'buffer'

const debug = Debug('dfu:bleany');

export class DfuTransportAnyBle extends DfuTransportPrn {
    public mtu: number
    private receiveData$Subscription: Subscription
    private readyPromise: Promise<void>

    constructor(
        private prepareBle: () => Promise<void>,
        private writeCommandImpl: (buff: Buffer) => Promise<void>,
        private writeDataImpl: (buff: Buffer) => Promise<void>,
        receiveData$: Observable<Buffer>,
        mtu = 20,
        onProgress = (type: number, sendBytes: number, totalBytes: number) => { }
    ) {
        // TODO: 暂时设置每 256k 校验一次 crc
        super(Math.floor((1 << 18) / mtu), onProgress);
        this.mtu = mtu
        this.receiveData$Subscription = receiveData$.subscribe(i => {
            debug(' recv <-- ', i);
            this.onData(i)
        })
    }


    // Given a command (including opcode), perform SLIP encoding and send it
    // through the wire.
    async writeCommand(bytes: Uint8Array) {
        // Cast the Uint8Array info a Buffer so it works on nodejs v6
        const bytesBuf = Buffer.from(bytes as Buffer);
        debug(' ctrl --> ', bytesBuf);

        await this.writeCommandImpl(bytesBuf)
    }

    // Given some payload bytes, pack them into a 0x08 command.
    // The length of the bytes is guaranteed to be under this.mtu thanks
    // to the DfuTransportPrn functionality.
    async writeData(bytes: Uint8Array) {
        // Cast the Uint8Array info a Buffer so it works on nodejs v6
        const bytesBuf = Buffer.from(bytes as Buffer);
        console.log(bytesBuf)
        console.log(bytesBuf)
        console.log(bytesBuf)
        debug(' data --> ', bytesBuf);

        await this.writeDataImpl(bytesBuf)
    }

    // Opens the port, sets the PRN, requests the MTU.
    // Returns a Promise when initialization is done.
    ready() {
        const initDfuConnection = async () => {
            await this.prepareBle()
            const buff = Buffer.alloc(3)
            // "Set PRN" opcode
            buff[0] = 0x02
            buff.writeUInt16LE(this.prn, 1)
            await this.writeCommand(buff)
            const ret = await this.read()
            this.assertPacket(0x02, 0)(ret)
        }
        if (!this.readyPromise) {
            this.readyPromise = initDfuConnection()
        }
        return this.readyPromise
    }

    dispose() {
        this.receiveData$Subscription.unsubscribe()
        this.receiveData$Subscription = null
    }
}
