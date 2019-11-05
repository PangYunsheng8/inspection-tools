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
import JSZip from 'jszip/dist/jszip';

import DfuOperation from './DfuOperation';
import { DfuTransportAnyBle } from './DfuTransportAnyBle';
import { DfuError, ErrorCode } from './DfuError';
import { Buffer } from 'buffer'

const debug = Debug('dfu:updates');

export interface NrfDfuManifest {
    manifest: {
        [key: string]: {
            bin_file: string
            dat_file: string
        }
    }
}

export enum DfuStage {
    PREPARE = 1,
    DOWNLOADING = 2
}
export interface DfuProgress {
    stage: DfuStage
    sendBytes: number
    totalBytes: number
}
export async function getUpdatesFromZipFileBytes(zipBytes: Buffer) {
    const zippedFiles = await (new JSZip()).loadAsync(zipBytes)
    const manifestString = await zippedFiles.file('manifest.json').async('text')
    const manifestJson = (JSON.parse(manifestString) as NrfDfuManifest).manifest;
    debug('Parsed manifest:', manifestJson);

    const res = new Array<{ initPacket: Buffer, firmwareImage: Buffer }>()
    for (let updateJson of Object.values(manifestJson)) {
        const initPacketBytes = await zippedFiles.file(updateJson.dat_file).async('uint8array');
        const firmwareImageBytes = await zippedFiles.file(updateJson.bin_file).async('uint8array');
        res.push({
            initPacket: Buffer.from(initPacketBytes),
            firmwareImage: Buffer.from(firmwareImageBytes),
        })
    }
    return res
}

export {
    DfuOperation,
    DfuTransportAnyBle,
    DfuError,
    ErrorCode,
};
