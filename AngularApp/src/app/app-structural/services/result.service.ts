import { Injectable } from '@angular/core';
import { BpsUnifiedModel } from 'src/app/app-common/models/bps-unified-model';
import { Observable, Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { AppconstantsService } from 'src/app/app-common/services/appconstants.service';
import { BpsUnifiedProblem } from 'src/app/app-common/models/bps-unified-problem';
import { first, map } from 'rxjs/operators';
import { AuthService } from 'src/app/app-core/services/auth.service';
import { ProjectInfoInputModule, RenameProblemInputModule, UserNotesInputModule } from '../models/report-section';
@Injectable({
  providedIn: 'root'
})
export class ResultService {

  constructor(private appConstantService: AppconstantsService, private http: HttpClient, private authService: AuthService) {
    // Old PC Login
    // this.authService.setPCToken().pipe(first()).subscribe((result: any) => {
    // });
  }

  physicsTypeSelected: string;
  acousticResultSubject: Subject<BpsUnifiedModel> = new Subject<BpsUnifiedModel>();
  structuralResultSubject: Subject<BpsUnifiedModel> = new Subject<BpsUnifiedModel>();
  thermalResultSubject: Subject<BpsUnifiedModel> = new Subject<BpsUnifiedModel>();
  selectedIntermediatesStructural: number;

  /**
   * Run the analysis of the structural 
   * @param unified3DModel 
   * @param applicationType 
   * @returns 
   */
  runStructuralAnalysis(unified3DModel: BpsUnifiedModel, applicationType: string): Observable<any> {
    let url: string = this.appConstantService.PHYSICS_CORE_DOMAIN + "api/Structural/RunStructuralAnalysis/" + applicationType;
    let response = this.http.post<BpsUnifiedModel>(url, unified3DModel).pipe(map(res => {
      return {
        data: res,
        type: "structural"
      }
    }));
    return response;
  }

  /**
   * Run the analysis of the thermal
   * @param unified3DModel 
   * @param applicationType 
   * @returns 
   */
  runThermalAnalysis(unified3DModel: BpsUnifiedModel, applicationType: string): Observable<any> {
    let url: string = this.appConstantService.PHYSICS_CORE_DOMAIN + "api/Thermal/RunThermalAnalysis/" + applicationType;
    let response = this.http.post<BpsUnifiedModel>(url, unified3DModel).pipe(map(res => {
      return {
        data: res,
        type: "thermal"
      }
    }));
    return response;
  }

  /**
   * Run the analysis of the acoustic
   * @param unified3DModel 
   * @param applicationType 
   * @returns 
   */
  runAcousticAnalysis(unified3DModel: BpsUnifiedModel, applicationType: string): Observable<any> {
    let url: string = this.appConstantService.PHYSICS_CORE_DOMAIN + "api/Acoustic/RunAcousticAnalysis/" + applicationType;
    return this.http.post<BpsUnifiedModel>(url, unified3DModel).pipe(map(res => {
      return {
        data: res,
        type: "acoustic"
      }
    }));
  }

  /**
   * Get the report saved in physicscore
   * @param ProjectGuid 
   * @param ProblemGuid Related problem of the report
   * @param reportName Type of the report to get
   * @returns 
   */
  GetReportURL(ProjectGuid: string, ProblemGuid: string, reportName: string): Observable<string> {
    let url: string = this.appConstantService.PHYSICS_CORE_DOMAIN + "api/Report/GetReportURL/" + ProjectGuid + '/' + ProblemGuid + '/' + reportName;
    return this.http.get<string>(url);
  }
  /**
   * Rename the problem on the reports
   * @param data urls of the reports to change the name
   * @returns 
   */
  RenameProblem(data: RenameProblemInputModule): Observable<boolean> {
    let url: string = this.appConstantService.PHYSICS_CORE_DOMAIN + "api/Report/RenameProblem/";
    return this.http.post<boolean>(url, data);
  }

  /**
   * Update the notes on the reports
   * @param data urls of the report to change the notes
   * @returns 
   */
  UpdateUserNotes(data: UserNotesInputModule): Observable<boolean> {
    let url: string = this.appConstantService.PHYSICS_CORE_DOMAIN + "api/Report/UpdateUserNotes/";
    return this.http.post<boolean>(url, data);
  }

  /**
   * Update project info
   * @param data urls of the report to change the project info
   * @returns 
   */
  UpdateProjectInfo(data: ProjectInfoInputModule): Observable<boolean> {
    let url: string = this.appConstantService.PHYSICS_CORE_DOMAIN + "api/Report/UpdateProjectInfo/";
    return this.http.post<boolean>(url, data);
  }

  /**
   * Delete reports of  problem
   * @param ProjectGuid 
   * @param ProblemGuid 
   * @returns 
   */
  DeleteReport(ProjectGuid: string, ProblemGuid: string): Observable<boolean> {
    let url: string = this.appConstantService.PHYSICS_CORE_DOMAIN + "api/Report/DeleteReport/" + ProjectGuid + '/' + ProblemGuid;
    return this.http.post<boolean>(url, '');
  }

  /**
   * Delete reports of a problem
   * @param ProjectGuid 
   * @param ProblemGuid 
   * @returns 
   */
  DeleteProblemReport(ProjectGuid: string, ProblemGuid: string): Observable<boolean> {
    let url: string = this.appConstantService.PHYSICS_CORE_DOMAIN + "api/Report/DeleteReport/" + ProjectGuid + '/' + ProblemGuid;
    return this.http.post<boolean>(url, '');
  }

  /**
   * Delete reports of a project
   * @param ProjectGuid 
   * @returns 
   */
  DeleteProjectReports(ProjectGuid: string): Observable<boolean> {
    let url: string = this.appConstantService.PHYSICS_CORE_DOMAIN + "api/Report/DeleteProjectReports/" + ProjectGuid;
    return this.http.post<boolean>(url, '');
  }
}