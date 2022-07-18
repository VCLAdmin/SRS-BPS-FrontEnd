import { Injectable } from '@angular/core';
import { Subject, BehaviorSubject, Observable } from 'rxjs';
import { BpsUnifiedProblem } from 'src/app/app-common/models/bps-unified-problem';
import { AppconstantsService } from 'src/app/app-common/services/appconstants.service';
import { BpsUnifiedModel } from 'src/app/app-common/models/bps-unified-model';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  selectedProblemSubject: Subject<BpsUnifiedProblem> = new Subject<BpsUnifiedProblem>();
  selectTableRowSubject: Subject<any> = new Subject<any>();
  refreshCurrentreport: Subject<boolean> = new Subject<boolean>();
  allConfigurationTableDataSubject: BehaviorSubject<any> = new BehaviorSubject<any>('');

  constructor(private appConstantService: AppconstantsService, private http: HttpClient) { }

  sendAllData(data: any){
    this.allConfigurationTableDataSubject.next(data);
  }

  /**
   * Update notes from the user on the reports
   * @param unifiedModel 
   * @returns 
   */
  updateUserNotes(unifiedModel: BpsUnifiedModel): Observable<boolean>{
    let url: string = this.appConstantService.APP_DOMAIN + "api/BpsProject/UpdateUserNotes/";
    return this.http.post<boolean>(url, unifiedModel);
  }
}
