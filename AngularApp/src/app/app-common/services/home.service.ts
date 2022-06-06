import { Injectable } from '@angular/core';
import { AppconstantsService } from './appconstants.service';
import { HttpClient } from '@angular/common/http';
import { HttpObject } from 'src/app/app-core/models/http-objects';
import { BpsProject } from '../models/bps-project';
import { Observable } from 'rxjs';
import { BpsSimplifiedProblem } from '../models/bps-simplified-problem';
import { BpsUnifiedProblem } from '../models/bps-unified-problem';
import { LocalStorageService } from 'src/app/app-core/services/local-storage.service';
import { Contact } from '../models/contact';
import { DealerModel } from 'src/app/app-structural/models/dealer-model';
@Injectable({
  providedIn: 'root'
})
export class HomeService {

  constructor(private appConstantService: AppconstantsService, private http: HttpClient, private localStorageService: LocalStorageService) { }
  private httpObject: HttpObject;

  setCurrentUserLanguage(language: string): Observable<string> {
    let url: string = this.appConstantService.APP_DOMAIN + "api/Account/SetCurrentUserLanguage/" + language;
    return this.http.get<string>(url);
  }

  getCurrentUserLanguage(): Observable<string> {
    let url: string = this.appConstantService.APP_DOMAIN + "api/Account/GetCurrentUserLanguage";
    return this.http.get<string>(url);
  }
  
  GetContacts(): Observable<Contact[]> {
    let url: string = this.appConstantService.APP_DOMAIN + "api/Account/GetContactList";
    return this.http.get<Contact[]>(url);
  }
  GetContact(): Observable<Contact> {
    let url: string = this.appConstantService.APP_DOMAIN + "api/Account/GetContact";
    return this.http.get<Contact>(url);
  }
  UpdateContact(account: Contact): Observable<Contact> {
    let url: string = this.appConstantService.APP_DOMAIN + "api/Account/UpdateContact";
    return this.http.post<Contact>(url, account);
  }
  CreateContact(account: Contact): Observable<Contact> {
    let url: string = this.appConstantService.APP_DOMAIN + "api/Account/CreateContact";
    return this.http.post<Contact>(url, account);
  }

  canRemoveItem(userGuid: any) {
    let url: string = this.appConstantService.APP_DOMAIN + "api/SRSUsers/CanDelete/" + userGuid;
    return this.http.get<boolean>(url);
  }
  removeItem(userGuid: any) {
    let url: string = this.appConstantService.APP_DOMAIN + "api/SRSUsers/Delete/" + userGuid;
    return this.http.delete<any[]>(url);
  }
  GetProjects(): Observable<BpsProject[]> {
    let url: string = this.appConstantService.APP_DOMAIN + "api/BpsProject/GetProjectsForCurrentUser";
    return this.http.get<BpsProject[]>(url);
  }

  GetStateTax(zipcode: string): Observable<any> {
    let url: string = this.appConstantService.APP_DOMAIN + "api/BpsProject/GetStateTax/" + zipcode;
    return this.http.get<any>(url);
  }

  MigrateUnifiedModelToV2(): Observable<any[]> {
    let url: string = this.appConstantService.APP_DOMAIN + "api/BpsProject/MigrateUnifiedModelToV2";
    return this.http.get<any[]>(url);
  }
  GetSRSProjects(status: string, date: string): Observable<BpsProject[]> {
    status = status === "" || status === null || status === undefined ? "ALL" : status;
    date = date === "" || date === null || date === undefined ? "ALL" : date;

    let url: string = this.appConstantService.APP_DOMAIN + "api/BpsProject/GetSRSProjectsForCurrentUser/" + status + "/" + date;
    return this.http.get<BpsProject[]>(url);
  }

  CancelAllOrders(ProjectGuid: string): Observable<number> {
    let url: string = this.appConstantService.APP_DOMAIN + "api/BpsProject/CancelAllOrders/" + ProjectGuid;
    return this.http.get<number>(url);
  }
  DeleteProject(ProjectGuid: string): Observable<number> {
    let url: string = this.appConstantService.APP_DOMAIN + "api/BpsProject/DeleteProject/" + ProjectGuid;
    return this.http.get<number>(url);
  }
  GetProjectByGuid(ProjectGuid: string): Observable<BpsProject> {
    let url: string = this.appConstantService.APP_DOMAIN + "api/BpsProject/GetProjectByGuid/" + ProjectGuid;
    return this.http.get<BpsProject>(url);
  }

  // RenameProblem(unifiedModel : BpsUnifiedModel): Observable<BpsSimplifiedProblem> {
  //   let url: string = this.appConstantService.APP_DOMAIN+"api/BpsProject/RenameProblem/";
  //   return this.http.post<BpsSimplifiedProblem>(url,unifiedModel);
  // }

  CreateProject(newProject: BpsProject): Observable<BpsProject> {
    let url: string = this.appConstantService.APP_DOMAIN + "api/BpsProject/CreateProject/";
    return this.http.post<BpsProject>(url, newProject);
  }

  CreateDefaultProblemForProject(projectGuid: string, applicationType): Observable<BpsUnifiedProblem> {
    let url: string = this.appConstantService.APP_DOMAIN + "api/BpsProject/CreateDefaultProblemForProject/" + projectGuid + "/" + applicationType;
    return this.http.get<BpsUnifiedProblem>(url);
  }
  //By default we are only creating windows and not facade. Once user selects Facade we are updating the unifiedModel with facade info.
  CreateDefaultProblemForFacadeProject(projectGuid: string, data: any): Observable<BpsUnifiedProblem> {
    let url: string = this.appConstantService.APP_DOMAIN + "api/BpsProject/CreateDefaultProblemForFacadeProject/" + projectGuid;
    return this.http.post<BpsUnifiedProblem>(url, data);
  }

  CreateDefaultProblemForFacadeUDCProject(projectGuid: string): Observable<BpsUnifiedProblem> {
    let url: string = this.appConstantService.APP_DOMAIN + "api/BpsProject/CreateDefaultProblemForFacadeUDCProject/" + projectGuid;
    return this.http.get<BpsUnifiedProblem>(url);
  }

  // CloneProblemForProject(projectGuid : string, problemGuid: string): Observable<BpsUnifiedProblem> {
  //   let url: string = this.appConstantService.APP_DOMAIN+"api/BpsProject/CloneProblemForProject/"+projectGuid + "/" + problemGuid;
  //   return this.http.get<BpsUnifiedProblem>(url);
  // }
  // //By default we are only creating windows and not facade. Once user selects Facade we are updating the unifiedModel with facade info.
  // CloneProblemForFacadeProject(projectGuid: string, problemGuid: string): Observable<BpsUnifiedProblem> {
  //   let url: string = this.appConstantService.APP_DOMAIN+"api/BpsProject/CloneProblemForFacadeProject/" + projectGuid + "/" + problemGuid;
  //   return this.http.get<BpsUnifiedProblem>(url);
  // }

  // GetProblemsForProject(projectGuid : string): Observable<BpsUnifiedProblem[]> {
  //   let url: string = this.appConstantService.APP_DOMAIN+"api/BpsProject/GetProblemsForProject/"+projectGuid;
  //   return this.http.get<BpsUnifiedProblem[]>(url);
  // }

  //Used when switching between facade and window 
  GetDefaultProblemForProject(projectGuid: string, ProblemId: string, applicationType = "BPS"): Observable<BpsUnifiedProblem> {
    let url: string = this.appConstantService.APP_DOMAIN + "api/BpsProject/GetDefaultWindowProblem/" + projectGuid + "/" + ProblemId + "/" + applicationType;
    return this.http.get<BpsUnifiedProblem>(url);
  }
  //Used when switching between window and facade
  GetDefaultProblemForFacadeProject(projectGuid: string, ProblemId: string, data: any): Observable<BpsUnifiedProblem> {
    let url: string = this.appConstantService.APP_DOMAIN + "api/BpsProject/GetDefaultFacadeProblem/" + projectGuid + "/" + ProblemId;
    return this.http.post<BpsUnifiedProblem>(url, data);
  }
  GetDefaultProblemForFacadeUDCProject(projectGuid: string, ProblemId: string): Observable<BpsUnifiedProblem> {
    let url: string = this.appConstantService.APP_DOMAIN + "api/BpsProject/GetDefaultFacadeUDCProblem/" + projectGuid + "/" + ProblemId;
    return this.http.get<BpsUnifiedProblem>(url);
  }
  DeleteProblemByGuid(ProblemGuid: string): Observable<string> {
    let url: string = this.appConstantService.APP_DOMAIN + "api/BpsProject/DeleteProblemByGuid/" + ProblemGuid;
    return this.http.get<string>(url);
  }

  DeleteOrderByGuid(ProblemGuid: string): Observable<string> {
    let url: string = this.appConstantService.APP_DOMAIN + "api/BpsProject/DeleteOrderByGuid/" + ProblemGuid;
    return this.http.get<string>(url);
  }
  CopyProblemByGuid(ProblemGuid: string): Observable<string> {
    let url: string = this.appConstantService.APP_DOMAIN + "api/BpsProject/CopyProblemByGuid/" + ProblemGuid;
    return this.http.get<string>(url);
  }

  UpdateProjectInfo(projectInfo: ProjectInfo): Observable<BpsSimplifiedProblem> {
    let url: string = this.appConstantService.APP_DOMAIN + "api/BpsProject/UpdateProjectInfo/";
    return this.http.post<BpsSimplifiedProblem>(url, projectInfo);
  }

  setUserID(val: string) {
    this.localStorageService.setValue<string>("userid", val);
  }
  getUserID(): string {
    return this.localStorageService.getValue("userid");
  }
  deleteUserID() {
    this.localStorageService.removeValue('userid');
  }


  // SRS
  GetDealerInformation(): Observable<DealerModel> {
    let url: string = this.appConstantService.APP_DOMAIN + "api/Dealer/GetUserDealer";
    return this.http.get<DealerModel>(url);
  }
  // GenerateProposal(problemGuid: string, proposalOrBOM: string): Observable<any> {
  //   let url: string = this.appConstantService.APP_DOMAIN + "api/Order/GenerateProposal/" + problemGuid + "/" + proposalOrBOM;
  //   return this.http.get<any>(url);
  // }
  GenerateProposalZipFile(projectGuid: string, proposalOrBOM: string): Observable<any> {
    return this.http
      .get(this.appConstantService.APP_DOMAIN + "api/Order/GenerateProposalZipFile/" + projectGuid + "/" + proposalOrBOM, {
        responseType: 'blob'
      });
  }
  GetProposalFile(problemGuid: string, proposalOrBOM: string): Observable<any> {
    return this.http
      .get(this.appConstantService.APP_DOMAIN + "api/Order/GenerateProposalFile/" + problemGuid + "/" + proposalOrBOM, {
        responseType: 'blob'
      });
  }
  GenerateProposal_FromJsonFile(proposalOrBOM: string): Observable<any> {
    let url: string = this.appConstantService.APP_DOMAIN + "api/Order/GenerateProposal_FromJsonFile" + "/" + proposalOrBOM;
    return this.http.get<any>(url);
  }

  getItemsForOrderDashboard(status: string, date: string): Observable<number[]> {
    status = status === "" || status === null || status === undefined ? "ALL" : status;
    date = date === "" || date === null || date === undefined ? "ALL" : date;
    let url: string = this.appConstantService.APP_DOMAIN + "api/Order/GetUserOrderDashboard/" + status + "/" + date + "/Count";
    return this.http.get<number[]>(url);
  }
  getAllOrders(status: string, date: string): Observable<any[]> {
    status = status === "" || status === null || status === undefined ? "ALL" : status;
    date = date === "" || date === null || date === undefined ? "ALL" : date;
    let url: string = this.appConstantService.APP_DOMAIN + "api/Order/GetUserOrderByDealer/" + status + "/" + date + "/Count";
    return this.http.get<any[]>(url);
  }
}
class ProjectInfo {
  ProjectGuid: string;
  ProjectName: string;
  Location: string;
}
