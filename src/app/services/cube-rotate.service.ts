import { Injectable } from '@angular/core';
import { Subject, Observable, Subscription } from 'rxjs';
import { CoderFilter, CoderState, RotateCommand, mapPinsStateToCoderState } from 'src/libs/coder-filter';
import { Buffer } from 'buffer'
import { SkProtocolV2, MoveData, GPIOData } from 'src/libs/sk-protocol-v2';
import { flatMap, map, filter } from 'rxjs/operators';
import { Debug } from 'src/libs/debug';

@Injectable({
  providedIn: 'root'
})
export class CubeRotateService {
  private _rotate$: Subject<MoveData> = new Subject<MoveData>()

  private cubeRotateDetector: CoderFilter = null
  private skProtocalV2 = SkProtocolV2.getInstance()

  private moveDataSubscription: Subscription = null
  private gpioDataSubscription: Subscription = null

  public get rotate$(): Observable<MoveData> {
    return this._rotate$
  }

  constructor() {
  }

  public connectMoveData($: Observable<Buffer>) {
    this.disconnectAll()

    this.moveDataSubscription = $.pipe(
      flatMap(i => this.skProtocalV2.resovleMoveData(i))
    ).subscribe(i => {
      this._rotate$.next(i)
    }, err => {
      console.log(`rotate$ err: ${err}`)
      this.disconnectAll()
    }, () => {
      console.log(`rotate$ finish!`)
    })
  }

  public disconnectMoveData() {
    if (this.moveDataSubscription) {
      this.moveDataSubscription.unsubscribe()
      this.moveDataSubscription = null
    }
  }
  public conectGPIOData($: Observable<Buffer>) {
    this.disconnectAll();
    (window as any).GPIOData = []
    this.moveDataSubscription = $.pipe(
      flatMap(i => this.skProtocalV2.resolveGPIOData(i)),
      filter(i => i.second !== 0 && i.counter !== 0)
    ).subscribe(i => {
      Debug.gpioData(JSON.stringify(i));
      (window as any).GPIOData.push(i)
    }, err => {
      console.log(`rotate$ err: ${err}`)
      this.disconnectAll()
    }, () => {
      console.log(`rotate$ finish!`)
    })

    // throw new Error('还未实现')
    // this.disconnectAll()

    // this.cubeRotateDetector = new CoderFilter()
    // this.gpioDataSubscription = $.pipe(
    //   map(i => this.skProtocalV2.resolveGPIOData(i))
    // ).subscribe(i => {
    //   this._gpioData$.next(i)
    // }, err => {
    //   this.disconnectAll()
    // })

  }
  public disconnectGPIOData() {
    if (this.gpioDataSubscription) {
      this.gpioDataSubscription.unsubscribe()
      this.gpioDataSubscription = null
      this.cubeRotateDetector = null
    }
  }
  public disconnectAll() {
    this.disconnectMoveData()
    this.disconnectGPIOData()
  }
}
