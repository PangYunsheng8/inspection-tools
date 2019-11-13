import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders  } from '@angular/common/http';
var hash = require('hash.js')

import { ConfigService } from './config.service';

interface OadVersion {
  major: number;  //主版本号
  minor: number;  //次版本号
  patch: number;  //每次小升级加1
  type: string;   //固件类型
}

export interface Oad {
  id: number;  //id
  major: number;  //主版本号
  minor: number;  //次版本号
  patch: number;  //每次小升级加1
  type: string;  //固件类型
  path: string;  //固件路径
  is_available: boolean;  //是否可用
  lowest_available: boolean;  //是否为最低可用版本
  latest_available: boolean;  //是否为最新可用版本
  hash_code: string;  //SHA256编码
}

@Injectable({
  providedIn: 'root'
})
export class OadInspectionService {

  constructor(
    private http: HttpClient,
    private config: ConfigService,
  ) { }

  private readonly oadByVersionPrefix = '/api/oad/version'
  private readonly lowestAvailableOadPrefix = '/api/oad/lowest'
  private readonly latestAvailableOadPrefix = '/api/oad/latest'

  public inspectOad(currOad: Oad, lowestAvailableOad: Oad) {
    let result, description
    if (this.isHigerThanLowest(currOad, lowestAvailableOad)) {
      if (currOad.is_available === true) {
        result = true
        description = "当前OAD版本合法且可用！"
        return { result, description }
      } else {
        description = "当前版本不可用！"
      }
    } else {
      description = "当前版本过低！"
    }
    result = false
    return { result, description }
  }

  //获得当前版本的OAD固件信息
  public async getOadByVersion(currentVersion: OadVersion) {
    return await this.http.get<Oad>(
      this.config.path + 
      this.oadByVersionPrefix + 
      `?type=${currentVersion.type}&major=${currentVersion.major}&minor=${currentVersion.minor}&patch=${currentVersion.patch}`).toPromise()
  }

  //获得最低可用版本的OAD固件信息
  public async getLowestAvailableOad(type: string) {
    return await this.http.get<Oad>(this.config.path + this.lowestAvailableOadPrefix + `?type=${type}`).toPromise()
  }

  //获得最新可用版本的OAD固件信息
  public async getLatestAvailableOad(type: string) {
    return await this.http.get<Oad>(this.config.path + this.latestAvailableOadPrefix + `?type=${type}`).toPromise()
  }

  //检查当前版本是否高于最低可用版本
  public isHigerThanLowest(currOad: Oad, lowestAvailableOad: Oad): boolean {
    if (currOad.major >= lowestAvailableOad.major) {
      if (currOad.minor >= lowestAvailableOad.minor) {
        if (currOad.patch >= lowestAvailableOad.patch) return true
        else return false
      } else return false
    }
    else return false
  }

  //检查OAD固件的哈希编码与数据库是否一致
  public checkHashCode(fileBuff: ArrayBuffer, hashCode: string): boolean {
    var currhashCode = hash.sha256().update(fileBuff).digest('hex')
    if (currhashCode == hashCode) return true
    else return false
  }
  
}
