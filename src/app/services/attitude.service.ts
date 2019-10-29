import { Injectable } from '@angular/core'
import { Observable, Subject, Subscription } from 'rxjs'
import { Quaternion } from 'three';
import { ahrs } from 'src/libs/ahrs';
import { Buffer } from 'buffer'
import { map } from 'rxjs/operators';
import { SkProtocolV2, AttitudeData, AttitudeRawData } from 'src/libs/sk-protocol-v2';

@Injectable({
  providedIn: 'root'
})
export class AttitudeService {
  private skProtocalV2 = SkProtocolV2.getInstance()
  private attitudeData$Subscription: Subscription = null
  private attitudeRawData$Subscription: Subscription = null
  private _attitude$: Subject<AttitudeData> = new Subject<AttitudeData>()
  private _attitudeRaw$: Subject<AttitudeRawData> = new Subject<AttitudeRawData>()

  public get attitude$(): Observable<AttitudeData> {
    return this._attitude$
  }
  public get attitudeRaw$(): Observable<AttitudeRawData> {
    return this._attitudeRaw$
  }

  constructor() { }

  public connectAttitudeData($: Observable<Buffer>) {
    this.disconnectAll()

    this.attitudeData$Subscription = $.pipe(
      map(i => this.skProtocalV2.resolveAttitudeData(i))
    ).subscribe(i => {
      // !! 由于蓝牙板和 three.js 坐标系不一样，需要此处的旋转操作
      this._attitude$.next({
        x: i.x,
        y: i.z,
        z: -i.y,
        w: i.w,
        second: i.second,
        counter: i.counter
      })
    }, err => {
      console.log(`attitude$ err: ${err}`)
      this.disconnectAll()
    }, () => {
      console.log(`attitude$ finish!`)
    })
  }

  public disconnectAttitudeData() {
    if (this.attitudeData$Subscription) {
      this.attitudeData$Subscription.unsubscribe()
      this.attitudeData$Subscription = null
    }
  }
  public connectAttitudeRawData($: Observable<Buffer>) {
    this.disconnectAll()

    this.attitudeRawData$Subscription = $.pipe(
      map(i => this.skProtocalV2.resolveAttitudeRawData(i))
    ).subscribe(i => {
      this._attitudeRaw$.next(i)
    }, err => {
      console.log(`attitudeRaw$ err: ${err}`)
      this.disconnectAll()
    }, () => {
      console.log(`attitudeRaw$ finish!`)
    })
  }
  public disconnectAttitudeRawData() {
    if (this.attitudeRawData$Subscription) {
      this.attitudeRawData$Subscription.unsubscribe()
      this.attitudeRawData$Subscription = null
    }
  }
  public disconnectAll() {
    this.disconnectAttitudeData()
    this.disconnectAttitudeRawData()
  }
}
