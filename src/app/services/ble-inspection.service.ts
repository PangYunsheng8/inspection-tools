import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BleInspectionService {

  constructor() { }

  private _dynamicInspectItem$: Subject<number> = new Subject<number>()

  public inspectVoltage(currentState: any, validState: any): {result: boolean, description: string} {
    let result
    let description
    if (currentState >= validState) {
      result = true
      description = "合格"
    } else {
      result = false
      description = `不合格，低于合法电压值${validState}V`
    }
    return {result, description}
  }

  public get dynamicInspectItem$() {
    return this._dynamicInspectItem$
  }
}
