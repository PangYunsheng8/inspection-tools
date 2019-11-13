import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ConfigService } from './config.service';
import { BleCurrentStateService } from './ble-current-state.service';
import { resolve } from 'path';

interface CheckResult {
  checkResult: boolean;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class IdentityInspectionService {

  constructor(
    private http: HttpClient,
    private config: ConfigService,
    private bleCurrentStateService: BleCurrentStateService,
  ) { }

  private readonly mgcSerialCheckPrefix = '/api/mgc/check'

  public inspectIdentity(mgcId: string, currSerial: string) {
    return new Promise<CheckResult>(async (resolve, reject) => {
      let { checkResult, message } = await this.http.get<CheckResult>(this.config.path + this.mgcSerialCheckPrefix + `?mgcId=${mgcId}&serial=${currSerial}`).toPromise()
      resolve({ checkResult, message })
    })
  }
}
