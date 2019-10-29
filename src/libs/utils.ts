import { Buffer } from 'buffer'

export async function sleep(ms: number): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    setTimeout(() => {
      resolve()
    }, ms)
  })
}
export function hexToBuffer(str: string): Buffer {
  return Buffer.from(str.trim().split(' ').map(i => parseInt(i, 16)))
}

export function bufferToHex(buff: Buffer): string {
  return Array.from(buff).map(i => i.toString(16)).map(i => i.length === 1 ? '0' + i : i).join(' ')
}
