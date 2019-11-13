import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FilterInspectionService {

  constructor() { }

  public inspectFilter(){
    let result = true
    let description = "合格，已初始化滤波参数"
    return ({result, description})
  }
}
