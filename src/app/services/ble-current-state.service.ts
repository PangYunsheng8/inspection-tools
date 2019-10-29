import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class BleCurrentStateService {

    //设备硬件信息
    public pid: string
    public serial: string
    public major: number
    public minor: number
    public patch: number
    public bootCount: number
  
    //设备电池信息
    public percentage: number
    public voltage: number

    //编码器参数
    public coderErrorCount: number
    public axisInterfereCount: number

    //工作状态
    public workState: number
}
