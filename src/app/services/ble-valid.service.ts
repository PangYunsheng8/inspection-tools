import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class BleValidService {
  public readonly VOLTAGE_VALID = 3700
  public readonly VERSION_VALID = "2.1.11"
}
