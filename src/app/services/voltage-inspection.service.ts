import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class VoltageInspectionService {

  constructor() { }

  public inspectVoltage(currentVoltage: number, validVoltage: number){
    let result 
    let description
    if (currentVoltage >= validVoltage) {
      result = true
      description = "合格，电池电压高于合法值"
    } else {
      result = false
      description = `不合格，低于合法电压值${validVoltage}V`
    }
    return { result, description }
  }
}
