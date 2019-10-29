import { Buffer } from 'buffer'

const MTU = 20 // 单位为字节
const HEADER_LENGTH = 2
const PAYLOAD_PRE_SUBPACKAGE = MTU - HEADER_LENGTH
const MAX_PACKAGE_COUNT = 256
const MAX_SUBPACKAGE_COUNT = 16

// PTP 为 Packet Transmission Protocol 简写，实现分包组包协议
export class PTPV2 {
  private sendCount: number
  private receiveCount: number
  private inputCache: Array<Buffer>

  private outputQueue: Array<Buffer>
  private receiveQueue: Array<Buffer>

  constructor() {
    this.reset()
  }
  public reset() {
    this.sendCount = 0
    this.receiveCount = 0
    this.inputCache = null
    this.outputQueue = new Array<Buffer>()
    this.receiveQueue = new Array<Buffer>()
  }

  public send(buff: Buffer): void {
    if (!(buff instanceof Buffer)) {
      throw new Error('send() 参数 buff 必须为 Buffer 类型')
    }
    const subpackageTotal = Math.ceil(buff.length / PAYLOAD_PRE_SUBPACKAGE)
    if (subpackageTotal > MAX_SUBPACKAGE_COUNT) {
      throw new Error(`分包数 ${subpackageTotal} 大于最大支持的分包数 ${MAX_SUBPACKAGE_COUNT}`);
    }

    for (let i = 0; i < subpackageTotal; i++) {
      const tmp = Buffer.alloc(MTU)
      tmp[0] = this.sendCount
      tmp[1] = i | (subpackageTotal << 4)
      buff.copy(tmp, HEADER_LENGTH, i * PAYLOAD_PRE_SUBPACKAGE)
      this.outputQueue.push(tmp)
    }
    this.sendCount++
    this.sendCount %= MAX_PACKAGE_COUNT
  }

  public output(): Buffer {
    return this.outputQueue.shift()
  }

  public input(buff: Buffer): void {
    const packageCount = buff[0]
    const subpackageCount = buff[1] & 0x0f
    const subpackageTotal = (buff[1] >> 4) & 0x0f
    const payload = buff.slice(2)

    if (this.receiveCount !== packageCount || this.inputCache === null) {
      this.receiveCount = packageCount
      this.inputCache = new Array<Buffer>(subpackageTotal)
    }
    this.inputCache[subpackageCount] = payload
    if (!this.inputCache.includes(undefined)) {
      this.receiveQueue.push(Buffer.concat(this.inputCache))
    }
  }

  public receive(): Buffer {
    return this.receiveQueue.shift()
  }
}


function test() {
  const ptpV2 = new PTPV2()
  const len = 40
  const buff = new Buffer(len)
  for (let i = 0; i < len; i++) {
    buff[i] = i
  }
  ptpV2.send(buff)
  const outputs = []
  let output
  while (output = ptpV2.output()) {
    outputs.push(output)
  }
  console.log(outputs)
  for (const i of outputs.reverse()) {
    i[0] = 10
    ptpV2.input(i)
  }
  console.log(ptpV2.receive())

}
// test()
