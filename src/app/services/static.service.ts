import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ConfigService } from './config.service';
import { Apollo } from 'apollo-angular';
import { GET_OAD_BY_VERSION, GET_OADS, GET_LOWEST_AVL_OAD, GET_LATEST_AVL_OAD } from '../api-graphQL/oad.gql';

export interface CheckIdRes {
  checkResult: boolean;
  message: string;
}

export interface OadVersion {
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
  isAvailable: boolean;  //是否可用
  lowestAvailable: boolean;  //是否为最低可用版本
  latestAvailable: boolean;  //是否为最新可用版本
  hashCode: string;  //SHA256编码
}

@Injectable({
  providedIn: 'root'
})
export class StaticService {

  constructor(
    private http: HttpClient,
    private config: ConfigService,
    private apollo: Apollo
  ) { }

  private readonly checkIdPrefix = '/api/mgc/checkId'
  private readonly oadByVersionPrefix = '/api/oad/version'
  private readonly lowestAvailableOadPrefix = '/api/oad/lowestOad'
  private readonly latestAvailableOadPrefix = '/api/oad/latestOad'

  public async getOadByVersionGQL(currentVersion: OadVersion){
    let res = await this.apollo.query({
      query: GET_OAD_BY_VERSION,
      variables: {
        type: currentVersion.type,
        major: currentVersion.major,
        minor: currentVersion.minor,
        patch: currentVersion.patch,
      }
    }).toPromise()
    let { oad, result } = res.data["getOadByVersion"]
    return oad
  }

  public async getLowestAvlOadGQL(type: string) {
    let res = await this.apollo.query({
      query: GET_LOWEST_AVL_OAD,
      variables: {
        type: type
      }
    }).toPromise()
    let { oad, result } = res.data["getLowestAvlOad"]
    return oad
  }

  public async getLatestAvlOadGQL(type: string) {
    let res = await this.apollo.query({
      query: GET_LATEST_AVL_OAD,
      variables: {
        type: type
      }
    }).toPromise()
    let { oad, result } = res.data["getLatestAvlOad"]
    return oad
  }

  //获取ID与序列号是否合法的检查结果
  public async checkIdSerial(mgcId: string, currSerial: string) {
    return await this.http.post<CheckIdRes>(this.config.path + this.checkIdPrefix, {mgcId: mgcId, serial: currSerial}).toPromise()
  }

  //根据当前OAD版本号获取固件信息
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
  
}
