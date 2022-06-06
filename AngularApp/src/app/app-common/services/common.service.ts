import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { User } from 'src/app/app-core/models/user.model';
import { LocalStorageService } from 'src/app/app-core/services/local-storage.service';
import { BpsUnifiedModel } from '../models/bps-unified-model';
import { BpsUnifiedProblem } from '../models/bps-unified-problem';
import * as THREE from 'three';

@Injectable({
  providedIn: 'root'
})
export class CommonService {
  renderer: any
  constructor(private localStorageService: LocalStorageService) { console.log("initializing");this.renderer = new THREE.WebGLRenderer({ antialias: true });}

  /* ------------Subject------------- */
  // loading = false;
  // private sendLoadingData = new Subject<boolean>();
  // sendLoadingObs = this.sendLoadingData.asObservable();
  // setLoadingData(loading: boolean): void { this.loading = loading; this.sendLoadingData.next(this.loading); }

  // private problemGuid_Subject = new Subject<boolean>();
  // problemGuid_Observable = this.problemGuid_Subject.asObservable();
  // setProblemGuid(value: boolean): void { this.problemGuid_Subject.next(value); }

  // private unifiedProblem_Subject: Subject<BpsUnifiedProblem> = new Subject<BpsUnifiedProblem>();
  // unifiedProblem_Observable = this.unifiedProblem_Subject.asObservable();
  // public setUnifiedProblem(value: BpsUnifiedProblem): void { this.unifiedProblem_Subject.next(value); }

  // private unifiedModel_Subject: Subject<BpsUnifiedModel> = new Subject<BpsUnifiedModel>();
  // unifiedModel_Observable = this.unifiedModel_Subject.asObservable();
  // public setUnifiedModel(value: BpsUnifiedModel): void { this.unifiedModel_Subject.next(value); }

  // /* ------------BehaviorSubject------------- */
  // private problemSaved_BehaviorSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  // public getIsProblemSaved(): BehaviorSubject<boolean> { return this.problemSaved_BehaviorSubject; }
  // public setIsProblemSaved(value: boolean): void { this.problemSaved_BehaviorSubject.next(value); }

  // private showLoader_BehaviorSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  // public getIsLoader(): BehaviorSubject<boolean> { return this.showLoader_BehaviorSubject; }
  // public setIsLoader(value: boolean): void { this.showLoader_BehaviorSubject.next(value); }

  setUser(value: string) { this.localStorageService.setValue<any>("current_User", value); }
  getUser(): User { return JSON.parse(this.localStorageService.getValue("current_User")); }
  getUserValue(): string { return this.localStorageService.getValue("current_User"); }
  resetUser(value: string) { if (this.getUserValue()) { this.deleteUser(); } this.setUser(value); }
  deleteUser() { this.localStorageService.removeValue('current_User'); }
  getUserEmail() { return this.getUserValue() ? this.getUser().Email : ''; }
  getUserName() { return this.getUserValue() ? this.getUser().UserName : ''; }
  getRenderer() {return this.renderer}
  setUserGuid(value: any) { this.localStorageService.setValue<any>("current_UserGuid", value); }
  getUserGuid(): any { return this.localStorageService.getValue("current_UserGuid"); }

  getApplicationType() { return (this.getUserValue() && (this.getUser().AccessRoles[0] === "Dealer-Full" || this.getUser().AccessRoles[0] === "Dealer-Restricted")) ? "SRS" : 'BPS'; }
  getUserRole() { return this.getUser().AccessRoles[0]; }

  setProject(value: string) { this.localStorageService.setValue<any>("current_Project", value); }
  getProject(): any { return JSON.parse(this.localStorageService.getValue("current_Project")); }

  getDealerCreditBalance(dealer: any): any { return ((dealer.CreditUsed / dealer.CreditLine) * 100); }
  getUserAccessibleFeatureList(){
    return this.getUser().Features;
  }
}
