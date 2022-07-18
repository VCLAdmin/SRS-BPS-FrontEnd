import { Injectable } from '@angular/core';
import { AppconstantsService } from 'src/app/app-common/services/appconstants.service';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';
import { NavLayoutService } from 'src/app/app-layout/services/nav-layout.service';
import { WindLoadOutput } from '../models/wind-load-output';
import { BpsUnifiedModel, DinWindLoadInput } from 'src/app/app-common/models/bps-unified-model';
import { LocalStorageService } from 'src/app/app-core/services/local-storage.service';
import { BpsUnifiedProblem } from 'src/app/app-common/models/bps-unified-problem';
import { BpsSimplifiedProblem } from 'src/app/app-common/models/bps-simplified-problem';
import { TranslateService } from '@ngx-translate/core';
import { _ } from '@biesbjerg/ngx-translate-extract/dist/utils/utils';
import { OrderApiModel, OrderModel } from '../models/order-model';
import { CommonService } from 'src/app/app-common/services/common.service';
import { ConfigPanelsService } from './config-panels.service';
import { UnifiedModelService } from './unified-model.service';
import { GlassSRS } from '../models/glass-srs.model';
import { GlassBPS } from '../models/glass-bps.model';

@Injectable({
  providedIn: 'root'
})
export class ConfigureService {

  problemSubject: Subject<BpsUnifiedProblem> = new Subject<BpsUnifiedProblem>();
  problemGuid: string = null;
  problem: BpsUnifiedProblem = new BpsUnifiedProblem();
  projectName: string;
  projectLocation: string;
  currentUnifiedModel: any;

  //static physicsTypeSelected: Array<string> = ["Acoustic", "Structural", "Thermal"];
  // isNavigatedFromRightresult:boolean = false;
  computeClickedSubject: Subject<boolean> = new Subject<boolean>();
  checkoutButtonEnabled: Subject<boolean> = new Subject<boolean>();

  isComputeEnabled: boolean = false;
  saveProblemSubject: Subject<boolean> = new Subject<boolean>();
  isProblemSavedFromNavBar: Subject<boolean> = new Subject<boolean>();

  saveProblemFromRightPanelSubject: Subject<boolean> = new Subject<boolean>();
  runLoadJson: Subject<boolean> = new Subject<boolean>();
  runLoadJsonSelect: Subject<boolean> = new Subject<boolean>();
  runLoadJsonSelectForResult: Subject<boolean> = new Subject<boolean>();
  isProblemSavedForRightPanel: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  editConfigurationName: Subject<string> = new Subject<string>();

  isSaved: boolean = true;
  lastModifiedDateForUM: Date = null;
  isCopyCall: boolean = false;
  isSelectedFromRightPanel: boolean = false;
  isNewProblemCreated: boolean = false;
  isSelectedFromRightResultPanel: boolean = false;
  isDefaultProblemCreatedFromRightPanel: boolean = false;
  configureCall: boolean = false;
  public newProblemBool: boolean = false;
  public previousProblem_ProjectGuid: string;

  applicationType: string = '';
  userAccessRole: string = '';
  subTotalFromIframeSubject: Subject<number> = new Subject<number>();
  quickCheckPassed: Subject<boolean> = new Subject<boolean>();

  areRightPanelButtonsDisabled: boolean = false;
  areRightPanelButtonsClicked: boolean = false;

  orderModel_shipping_Address: any;
  orderModel_show_ShipToAddress: string;

  constructor(private cpService: ConfigPanelsService, private appConstantService: AppconstantsService,
    private umService: UnifiedModelService, private http: HttpClient, private cookieService: CookieService, private commonService: CommonService,
    private navLayoutService: NavLayoutService, private localStorageService: LocalStorageService, private translate: TranslateService) {
    //this.problemGuid = this.cookieService.get('problemGuid') ? this.cookieService.get('problemGuid') : this.navLayoutService.getRouteParam('problemGuid') ? this.navLayoutService.getRouteParam('problemGuid') : '';
    this.problemGuid = this.getCurrentProblemGuid();
    this.applicationType = this.commonService.getApplicationType();
    this.glassBPSInformation = [];
    this.glassSRSInformation = [];
    if (this.problemGuid) {
      //this.GetProblemByGuid(this.problemGuid);
      setTimeout(() => {
        this.getGlassInfo(this.applicationType).subscribe(glassList => {
          if (this.applicationType === 'BPS')
            this.glassBPSInformation = JSON.parse(glassList);
          else
            this.glassSRSInformation = JSON.parse(glassList);
        });
      }, 1000);
    };
  }

  /**
   * Get the problem of a project by its problem guid from he back-end
   * Update the unified model in the unified model service
   * @param problemGuid 
   */
  GetProblemByGuid(problemGuid: string): void {
    this.umService.setProblemGuid(problemGuid);
    let url: string = this.appConstantService.APP_DOMAIN + "api/BpsProject/GetProblemByGuid/" + problemGuid;
    this.http.get<BpsUnifiedProblem>(url).subscribe(problem => {
      if (problem) {
        this.problem = problem;
        let unifiedModel: BpsUnifiedModel = JSON.parse(this.problem.UnifiedModel);
        if (unifiedModel.ProblemSetting.ProductType === 'SlidingDoor') {
          this.setMullionBarDisplay(false);
        } else {
          this.setMullionBarDisplay(true);
        }
        this.cpService.closeAllPopouts();
        this.problem.ModifiedOn = this.convertUTCDateToLocalDate(new Date(problem.ModifiedOn));
        if (unifiedModel && unifiedModel.ProblemSetting) {
          this.projectName = unifiedModel.ProblemSetting.ProjectName;
          this.projectLocation = unifiedModel.ProblemSetting.Location;
        }
        this.umService.setUnifiedProblem(problem);
        this.problemSubject.next(this.problem);
        this.previousProblem_ProjectGuid = unifiedModel.ProblemSetting ? unifiedModel.ProblemSetting.ProjectGuid : null;
      }
    });
  }

  /**
   * @returns the problem guid saved in the cookie service
   */
  getCurrentProblemGuid() {
    if (!this.problemGuid)
      this.problemGuid = this.cookieService.get('problemGuid') ? this.cookieService.get('problemGuid') : this.navLayoutService.getRouteParam('problemGuid') ? this.navLayoutService.getRouteParam('problemGuid') : '';
    return this.problemGuid;
  }

  // GetProblemScreenShot(problemGuid: string): Observable<string> {
  //   let url: string = this.appConstantService.APP_DOMAIN + "api/BpsProject/GetProblemScreenShot/" + problemGuid;
  //   return this.http.get<string>(url);
  // }

  /**
   * Emit the current problem
   */
  emitProblemByGuid(): void {
    this.problemSubject.next(this.problem);
  }

  /**
   * Save the problem guid in the cookie service
   * @param problemGuid 
   */
  setProblemShow(problemGuid: string): void {
    if (this.cookieService.get('problemGuid')) {
      this.cookieService.delete('problemGuid');
    }
    this.cookieService.set('problemGuid', problemGuid, 0, '/');
    // if (this.cookieService.check('projectGuid')) {
    //   this.cookieService.delete('projectGuid');    }
    //this.cookieService.set('projectGuid', projectGuid,0,'/');
    if (this.configureCall) {
      this.configureCall = false;
      this.GetProblemByGuid(problemGuid);
    }
  }

  //#region rightPanelOpened
  rightPanelOpened: boolean = false;
  rightPanelOpenedSubject: Subject<boolean> = new Subject<boolean>();
  /**
   * Open or Close the right panel
   */
  changeRightPanelDisplay(): void {
    this.rightPanelOpened = !this.rightPanelOpened;
    this.rightPanelOpenedSubject.next(this.rightPanelOpened);
  }
  //#endregion
  //#region ASE Type Change
  aseTypeChange: boolean = false;
  aseTypeChangeSubject: Subject<BpsUnifiedModel> = new Subject<BpsUnifiedModel>();
  obsASETypeChange = this.aseTypeChangeSubject.asObservable();
  // CallASETypeChange(aseType: string): void {
  //   this.GetProblemForSlidingDoorProject(this.umService.current_UnifiedModel.ProblemSetting.ProjectGuid, this.umService.current_UnifiedModel.ProblemSetting.ProblemGuid, aseType).subscribe((problem) => {
  //     this.umService.setUnifiedModel(JSON.parse(problem.UnifiedModel));
  //   //  this.aseTypeChangeSubject.next(JSON.parse(problem.UnifiedModel));
  //   });
  // }
  //#endregion

   //#region Mullion, Transom, Delete Bar display
   isMullionBarDisplay: boolean = true;
   sujMullionButtonsBar: Subject<boolean> = new Subject<boolean>();
   obsMullionButtonsBar = this.sujMullionButtonsBar.asObservable();
   /**
    * Set the display or not of the mullion bar
    * @param isDisplay 
    */
   setMullionBarDisplay(isDisplay: boolean): void {
     this.isMullionBarDisplay = isDisplay;
     this.sujMullionButtonsBar.next(this.isMullionBarDisplay);
   }
   //#endregion

   //#region info bar selection display
   isInfoBtnSelected: boolean = false;
   sujInfoBtn: Subject<boolean> = new Subject<boolean>();
   obsInfoBtn = this.sujInfoBtn.asObservable();
   /**
    * Activate or Deactivate the display of information from the info button
    * @param isDisplay 
    */
   setInfoButtonDisplay(isDisplay: boolean): void {
     this.isInfoBtnSelected = isDisplay;
     this.sujInfoBtn.next(this.isInfoBtnSelected);
   }
   //#endregion

   /**
    * 
    * @param projectGuid 
    * @returns List of problems of a project
    */
  GetProblemsForProject(projectGuid: string): Observable<BpsUnifiedProblem[]> {
    let url: string = this.appConstantService.APP_DOMAIN + "api/BpsProject/GetProblemsForProject/" + projectGuid;
    return this.http.get<BpsUnifiedProblem[]>(url);
  }

  /**
   * 
   * @param projectGuid 
   * @returns List of problems of a project
   */
  GetProblemsForProjectLite(projectGuid: string): Observable<BpsUnifiedProblem[]> {
    let url: string = this.appConstantService.APP_DOMAIN + "api/BpsProject/GetProblemsForProjectLite/" + projectGuid;
    return this.http.get<BpsUnifiedProblem[]>(url);
  }

  /**
   * Create a problem of a project in the back-end and get back the new list of problem of the project
   * @param projectGuid 
   * @returns 
   */
  CreateProblemForProject(projectGuid: string): Observable<BpsUnifiedProblem> {
    let url: string = this.appConstantService.APP_DOMAIN + "api/BpsProject/CreateDefaultProblemForProject/" + projectGuid + "/" + this.applicationType;
    return this.http.get<BpsUnifiedProblem>(url);
  }

  
  /**
   * Create a problem of a project in the back-end and get back the new list of problem of the project
   * @param projectGuid 
   * @returns 
   */
  CreateProblemFacadeForProject(projectGuid: string, navLayout: any): Observable<BpsUnifiedProblem> {
    let url: string = this.appConstantService.APP_DOMAIN + "api/BpsProject/CreateDefaultProblemForFacadeProject/" + projectGuid;
    return this.http.post<BpsUnifiedProblem>(url, navLayout);
  }

  /**
   * 
   * @param PostCode 
   * @returns Windzone depending on the postal code
   */
  GetWindZone(PostCode: string): Observable<any> {
    let url: string = this.appConstantService.APP_DOMAIN + "api/Structural/GetWindZone/" + PostCode;
    return this.http.get<any>(url);
  }

  /**
   * Generate a pdf in the back-end
   * @param fileName 
   * @returns 
   */
  generatePDF(fileName: string) {
    let url = this.appConstantService.APP_DOMAIN + fileName;
    const headers = new HttpHeaders()
      .set('Accept', 'text/html')
      .set('Access-Control-Allow-Origin', '*')
    const options = {
      'headers': headers,
    };
    return this.http.get(url);
  }
  //   GetReport(reportRequest: any): Observable<any>  {
  //     let url = this.appConstantService.APP_DOMAIN + 'api/BpsProject/GetReport';
  //     return this.http.post<any>(url, reportRequest, {observe: 'response'
  // ,responseType: 'blob' as 'json'
  //     });
  //   }
  /**
   * Pull report from back-end
   * @param reportRequest 
   * @returns 
   */
  GetReport(reportRequest: any): Observable<HttpResponse<Blob>> {
    let url = this.appConstantService.APP_DOMAIN + 'api/BpsProject/GetReport';
    return this.http.post<Blob>(url, reportRequest, {
      observe: 'response',
      responseType: 'blob' as 'json'
    });
  }

  /**
   * Pull report from physics core
   * @param ProjectGuid
   * @param ProblemGuid 
   * @param reportName 
   * @param problemName 
   * @returns 
   */
  GetPCReport(ProjectGuid: string, ProblemGuid: string, reportName: string, problemName: string): Observable<HttpResponse<Blob>> {
    let url = this.appConstantService.PHYSICS_CORE_DOMAIN + 'api/Report/DownloadReport/' + ProjectGuid + '/' + ProblemGuid + '/' + reportName + '/' + problemName;
    return this.http.get<Blob>(url, {
      observe: 'response',
      responseType: 'blob' as 'json'
    });
  }

  /**
   * Pull report from physics core
   * @param reportURL 
   * @returns 
   */
  GetReportFromPhysicsCore(reportURL: string): Observable<HttpResponse<Blob>> {
    let url = this.appConstantService.PHYSICS_CORE_DOMAIN + 'api/Report/GetReport?reportURL=' + reportURL;
    return this.http.get<Blob>(url, {
      observe: 'response',
      responseType: 'blob' as 'json'
    });
  }

  /**
   * calulate in the back-end the wind load din from the DinWindLoadInput 
   * @param input 
   * @returns 
   */
  calculatedWindLoadDIN(input: DinWindLoadInput): Observable<WindLoadOutput> {
    let url: string = this.appConstantService.APP_DOMAIN + "api/Structural/CalculateWindLoadDIN/";
    return this.http.post<WindLoadOutput>(url, input);
  }

  /**
   * Read section properties in the back-end
   * @param unified3DModel 
   * @returns 
   */
  ReadSectionProperties(unified3DModel: BpsUnifiedModel): Observable<BpsUnifiedModel> {
    let url: string = this.appConstantService.APP_DOMAIN + "api/Structural/ReadSectionProperties/";
    return this.http.post<BpsUnifiedModel>(url, unified3DModel);
  }

  /**
   * Read facade section properties in the back-end
   * @param unified3DModel 
   * @returns 
   */
  ReadFacadeSectionProperties(unified3DModel: BpsUnifiedModel): Observable<BpsUnifiedModel> {
    let url: string = this.appConstantService.APP_DOMAIN + "api/Structural/ReadFacadeSectionProperties/";
    return this.http.post<BpsUnifiedModel>(url, unified3DModel);
  }

  // placeOrder(projectGuid: string) {
  //   let url: string = this.appConstantService.APP_DOMAIN + "api/BpsProject/PlaceOrder/" + projectGuid;
  //   return this.http.get(url);
  // }

  /**
   * Get the order info of a project
   * @param projectGuid
   * @returns 
   */
  GetProjectOrders(projectGuid: string): Observable<OrderApiModel> {
    let url: string = this.appConstantService.APP_DOMAIN + "api/Order/GetProjectOrders/" + projectGuid;
    return this.http.get<OrderApiModel>(url);
  }

  /**
   * Place a new order
   * @param newOrders 
   * @returns 
   */
  CreateOrders(newOrders: OrderApiModel) {
    let url: string = this.appConstantService.APP_DOMAIN + "api/Order/PostOrders/";
    return this.http.post<BpsUnifiedModel>(url, newOrders);
  }

  /**
   * update a problem in the back-end
   * @param unified3DModel 
   * @returns 
   */
  updateProblem(unified3DModel: BpsUnifiedModel) {
    unified3DModel = this.updateOperabilitySystemsIds(unified3DModel);
    let url: string = this.appConstantService.APP_DOMAIN + "api/BpsProject/UpdateProblem/";
    return this.http.post<number>(url, unified3DModel);
  }

  /**
   * Update the operability system id of a unified model
   * @param unified3DModel 
   * @returns 
   */
  updateOperabilitySystemsIds(unified3DModel: BpsUnifiedModel): BpsUnifiedModel {
    if (unified3DModel && unified3DModel.ModelInput.Geometry.OperabilitySystems) {
      let id = 1;
      unified3DModel.ModelInput.Geometry.OperabilitySystems.forEach(element => {
        let os = unified3DModel.ModelInput.Geometry.OperabilitySystems;
        let inf = unified3DModel.ModelInput.Geometry.Infills;
        let currentId = element.OperabilitySystemID;
        os = os.filter(f => f.OperabilitySystemID == currentId).map(x => { x.OperabilitySystemID = id; return x });
        inf = inf.filter(f => f.OperabilitySystemID == currentId).map(x => { x.OperabilitySystemID = id; return x });
        id++;
      });
    }
    return unified3DModel;
  }

  /**
   * 
   * @param formData 
   * @returns the results of a BPS project
   */
  uploadResults(formData: FormData) {
    // let headers = new Headers();
    // headers.append('Content-Type', 'multipart/form-data');
    // headers.append('Accept', 'application/json');
    let url: string = this.appConstantService.APP_DOMAIN + "api/BpsProject/UploadResults/";
    return this.http.post<any>(url, formData);
  }

  /**
   * Save screenshot of window of a problem
   * @param saveScreenShotRequest 
   * @returns 
   */
  saveProblemScreenShot(saveScreenShotRequest: any): Observable<string> {
    let url: string = this.appConstantService.APP_DOMAIN + "api/BpsProject/SaveProblemScreenShotS3/";
    return this.http.post<string>(url, saveScreenShotRequest);
  }

  /**
   * Get the screenshot of window of a problem
   * @param id 
   * @returns 
   */
  GetScreenshotURL(id: string): Observable<string> {
    let url: string = this.appConstantService.APP_DOMAIN + "api/Order/GetPresignedScreenshotURL/" + id;
    return this.http.get<string>(url);
  }

  glassSRSInformation: GlassSRS[];
  glassBPSInformation: GlassBPS[];
  getGlassInfo(applicationName: string): Observable<string> {
    let url: string = this.appConstantService.APP_DOMAIN + "api/Glass/GetGlassInfo/" + applicationName;
    return this.http.get<string>(url);
  }

  /**
   * Hardcoded list of articles for glassNpanel
   * @param selectedType 
   * @returns 
   */
  getArticleListByType(selectedType: string): any[] {
    var language = this.getLanguage();
    let value = "1.1";
    let uvalueByCulture = value ? (language === "DE" || language === "de-DE" ? value.replace('.', ',') : value) : value;
    let pvb_1_byCulture = (language === "DE" || language === "de-DE") ? "0.38".replace('.', ',') : "0.38";
    let pvb_2_byCulture = (language === "DE" || language === "de-DE") ? "0.76".replace('.', ',') : "0.76";
    switch (selectedType) {
      case 'double_BPS':
        var doubleData = [
          { id: 1, composition: "4-16-4", type: "glass-argon-glass", totalThickness: 24, totalThicknessUnit: "mm", uvalue: uvalueByCulture, rw: 31, spacer: 0, category: 'double' },
          { id: 2, composition: "6-16-6", type: "glass-argon-glass", totalThickness: 28, totalThicknessUnit: "mm", uvalue: uvalueByCulture, rw: 33, spacer: 0, category: 'double' },
          { id: 3, composition: "6-16-4", type: "glass-argon-glass", totalThickness: 28, totalThicknessUnit: "mm", uvalue: uvalueByCulture, rw: 35, spacer: 0, category: 'double' },
          { id: 4, composition: "8-16-4", type: "glass-argon-glass", totalThickness: 28, totalThicknessUnit: "mm", uvalue: uvalueByCulture, rw: 37, spacer: 0, category: 'double' },
          { id: 5, composition: "10-16-6", type: "glass-argon-glass", totalThickness: 32, totalThicknessUnit: "mm", uvalue: uvalueByCulture, rw: 39, spacer: 0, category: 'double' },
          { id: 6, composition: "6-20-8(" + pvb_1_byCulture + "mm " + this.translate.instant(_('configure.acoustic')) + " PVB)", type: "glass-argon-glass", totalThickness: 34, totalThicknessUnit: "mm", uvalue: uvalueByCulture, rw: 43, spacer: 0, category: 'double' },
          { id: 7, composition: "8(" + pvb_1_byCulture + "mm " + this.translate.instant(_('configure.acoustic')) + " PVB)-16-12", type: "glass-argon-glass", totalThickness: 36, totalThicknessUnit: "mm", uvalue: uvalueByCulture, rw: 46, spacer: 0, category: 'double' },
          { id: 8, composition: "12(" + pvb_2_byCulture + "mm " + this.translate.instant(_('configure.acoustic')) + " PVB)-20-8(" + pvb_2_byCulture + "mm " + this.translate.instant(_('configure.acoustic')) + " PVB)", type: "glass-argon-glass", totalThickness: 40, totalThicknessUnit: "mm", uvalue: uvalueByCulture, rw: 49, spacer: 0, category: 'double' },
          { id: 9, composition: "8(" + pvb_1_byCulture + "mm " + this.translate.instant(_('configure.acoustic')) + " PVB)-24-10", type: "glass-argon-glass", totalThickness: 42, totalThicknessUnit: "mm", uvalue: uvalueByCulture, rw: 47, spacer: 0, category: 'double' },
          { id: 10, composition: "12(" + pvb_2_byCulture + "mm " + this.translate.instant(_('configure.acoustic')) + " PVB)-24-8(" + pvb_2_byCulture + "mm " + this.translate.instant(_('configure.acoustic')) + " PVB)", type: "glass-argon-glass", totalThickness: 44, totalThicknessUnit: "mm", uvalue: uvalueByCulture, rw: 50, spacer: 0, category: 'double' }
        ];
        return doubleData;
      case 'triple_BPS':
        let value1 = "0.7";
        let uvalueByCulture1 = value1 ? (language === "DE" || language === "de-DE" ? value1.replace('.', ',') : value1) : value1;
        var tripleData = [
          { id: 1, composition: "10-12-6-12-8(" + pvb_1_byCulture + "mm " + this.translate.instant(_('configure.acoustic')) + " PVB)", type: "glass-argon-glass-argon-glass", totalThickness: 48, totalThicknessUnit: "mm", uvalue: uvalueByCulture1, rw: 49, spacer: 0, category: 'triple' },
          { id: 2, composition: "4-12-4-12-4", type: "glass-argon-glass-argon-glass", totalThickness: 36, totalThicknessUnit: "mm", uvalue: uvalueByCulture1, rw: 32, spacer: 0, category: 'triple' },
          { id: 3, composition: "6-12-4-12-4", type: "glass-argon-glass-argon-glass", totalThickness: 38, totalThicknessUnit: "mm", uvalue: uvalueByCulture1, rw: 36, spacer: 0, category: 'triple' },
          { id: 4, composition: "8-12-4-12-6", type: "glass-argon-glass-argon-glass", totalThickness: 42, totalThicknessUnit: "mm", uvalue: uvalueByCulture1, rw: 39, spacer: 0, category: 'triple' }
        ];
        return tripleData;
      case 'panel_BPS':
        var panelLibraryData = [
          { id: 1, composition: "2-20-2", type: "aluminium-insulation-aluminium", totalThickness: 24, totalThicknessUnit: "mm", uvalue: (language === "DE" || language === "de-DE" ? "1.17".replace('.', ',') : "1.17"), rw: 33, spacer: [""], category: 'panel' },
          { id: 2, composition: "6-20-2", type: "glass-insulation-aluminium", totalThickness: 28, totalThicknessUnit: "mm", uvalue: (language === "DE" || language === "de-DE" ? "1.34".replace('.', ',') : "1.34"), rw: 40, spacer: [""], category: 'panel' },
          { id: 3, composition: "2-40-2", type: "aluminium-insulation-aluminium", totalThickness: 44, totalThicknessUnit: "mm", uvalue: (language === "DE" || language === "de-DE" ? "0.76".replace('.', ',') : "0.76"), rw: 35, spacer: [""], category: 'panel' },
          { id: 4, composition: "6-40-2", type: "glass-insulation-aluminium", totalThickness: 48, totalThicknessUnit: "mm", uvalue: (language === "DE" || language === "de-DE" ? "0.76".replace('.', ',') : "0.76"), rw: 42, spacer: [""], category: 'panel' },
          { id: 5, composition: "2-100-2", type: "aluminium-insulation-aluminium", totalThickness: 104, totalThicknessUnit: "mm", uvalue: (language === "DE" || language === "de-DE" ? "0.33".replace('.', ',') : "0.33"), rw: 40, spacer: [""], category: 'panel' },
          { id: 6, composition: "6-100-2", type: "glass-insulation-aluminium", totalThickness: 108, totalThicknessUnit: "mm", uvalue: (language === "DE" || language === "de-DE" ? "0.33".replace('.', ',') : "0.33"), rw: 49, spacer: [""], category: 'panel' },
          { id: 7, composition: "2-26-120-2", type: "aluminium-air-insulation-aluminium", totalThickness: 150, totalThicknessUnit: "mm", uvalue: (language === "DE" || language === "de-DE" ? "0.26".replace('.', ',') : "0.26"), rw: 44, spacer: [""], category: 'panel' },
          { id: 8, composition: "6-22-120-2", type: "glass-air-insulation-aluminium", totalThickness: 150, totalThicknessUnit: "mm", uvalue: (language === "DE" || language === "de-DE" ? "0.27".replace('.', ',') : "0.27"), rw: 53, spacer: [""], category: 'panel' },
          { id: 9, composition: "2-220-2", type: "aluminium-insulation-aluminium", totalThickness: 224, totalThicknessUnit: "mm", uvalue: (language === "DE" || language === "de-DE" ? "0.15".replace('.', ',') : "0.15"), rw: 53, spacer: [""], category: 'panel' },
          { id: 10, composition: "6-220-2", type: "aluminium-insulation-aluminium", totalThickness: 228, totalThicknessUnit: "mm", uvalue: (language === "DE" || language === "de-DE" ? "0.15".replace('.', ',') : "0.15"), rw: 62, spacer: [""], category: 'panel' }
        ];
        return panelLibraryData;
      case 'double_SRS':
        var doubleDataSRS = [
          { id: 1, composition: "1/4 Clear SB 60-1/2 ARGON-1/4 Clear", compositionShort: "1/4-1/2-1/4", type: "clear glass SB 60-argon-clear glass", totalThickness: 1, totalThicknessUnit: "in", uvalue: "1.358", shgc: 0.39, vt: 0.7023, rw: 35, rwc: -1, rwctr: -4, spacer: 0, category: 'double', stc: 35, oitc: 30 },
          { id: 2, composition: "1/4 Grey-1/2 AIR-1/4 Clear", compositionShort: "1/4-1/2-1/4", type: "grey glass-air-clear glass", totalThickness: 1, totalThicknessUnit: "in", uvalue: "2.688", shgc: 0.466, vt: 0.383, rw: 35, rwc: -1, rwctr: -4, spacer: 0, category: 'double', stc: 35, oitc: 30 },
          { id: 3, composition: "1/4 Clear SB 70-1/2 AIR-1/4 Clear", compositionShort: "1/4-1/2-1/4", type: "clear glass SB 70-air-clear glass", totalThickness: 1, totalThicknessUnit: "in", uvalue: "1.618", shgc: 0.273, vt: 0.637, rw: 35, rwc: -1, rwctr: -4, spacer: 0, category: 'double', stc: 35, oitc: 30 },
          { id: 4, composition: "1/4 Grey SB 70-1/2 AIR-1/4 Clear", compositionShort: "1/4-1/2-1/4", type: "grey glass SB 70-air-clear glass", totalThickness: 1, totalThicknessUnit: "in", uvalue: "1.618", shgc: 0.225, vt: 0.45, rw: 35, rwc: -1, rwctr: -4, spacer: 0, category: 'double', stc: 35, oitc: 30 },
          { id: 5, composition: "1/4 Bronze SB 70-1/2 AIR-1/4 Clear", compositionShort: "1/4-1/2-1/4", type: "bronze glass SB 70-air-clear glass", totalThickness: 1, totalThicknessUnit: "in", uvalue: "1.618", shgc: 0.202, vt: 0.38, rw: 35, rwc: -1, rwctr: -4, spacer: 0, category: 'double', stc: 35, oitc: 30 }
        ];
        return doubleDataSRS;
      case 'triple_SRS':
        var tripleDataSRS = [
          { id: 1, composition: "1/4-1/2 ARGON-1/4-1/2 ARGON-1/4", compositionShort: "1/4-1/2-1/4-1/2-1/4", type: "Optigray Glass-argon-Starphire Glass-argon-Clear glass", totalThickness: 1, thicknessFraction: "3/4", totalThicknessUnit: "in", uvalue: "0.648", shgc: 0.162, vt: 0.34, rw: 39, rwc: -2, rwctr: -5, spacer: 0, category: 'triple', stc: 39, oitc: 31 },
          //{ id: 1, composition: "1/4-1/2 ARGON-1/4-1/2 ARGON-1/4", compositionShort: "1/4-1/2-1/4-1/2-1/4", type: "Glass-argon-Glass-argon-Glass", totalThickness: 1, thicknessFraction: "3/4", totalThicknessUnit: "in", uvalue: "0.648", shgc: 0.114, vt: 0.162, rw: 39, rwc: -2, rwctr: -5, spacer: 0, category: 'triple', stc: 39, oitc: 31 },
        ];
        return tripleDataSRS;
    }
  }

  sendMessage(isClicked: boolean) {
    this.computeClickedSubject.next(isClicked);
  }

  //v3
  public getLanguage(): string {
    return this.localStorageService.getValue("culture") ? this.localStorageService.getValue("culture") : "en-US";
  }
  public getNumberPattern(): string {
    var language = this.getLanguage();
    var numberPattern = language == "en-US" ? "[0-9]*[.]?[0-9]*" : "[0-9]*[,]?[0-9]*";
    return numberPattern;
  }

  /**
   * Change the name of a problem API
   * @param unifiedModel 
   * @returns 
   */
  RenameProblem(unifiedModel: BpsUnifiedModel): Observable<BpsSimplifiedProblem> {
    let url: string = this.appConstantService.APP_DOMAIN + "api/BpsProject/RenameProblem/";
    return this.http.post<BpsSimplifiedProblem>(url, unifiedModel);
  }

  /**
   * Display date format depending on the user culture
   * @param date 
   * @returns 
   */
  convertUTCDateToLocalDate(date) {
    var newDate = new Date(date.getTime() - date.getTimezoneOffset() * 60 * 1000);
    var offset = date.getTimezoneOffset() / 60;
    var hours = date.getHours();
    newDate.setHours(hours - offset);
    return newDate;
  } 

  //Create default Problem for sliding Doors based on the TrackType Selection
  /**
   * Create a problem for sliding door API
   * @param projectGuid 
   * @param aseType 
   * @returns 
   */
  CreateProblemForSlidingDoorProject(projectGuid: string, aseType: string): Observable<BpsUnifiedProblem> {
    let url: string = this.appConstantService.APP_DOMAIN + "api/BpsProject/CreateDefaultProblemForASEProject/" + projectGuid;
    return this.http.post<BpsUnifiedProblem>(url, aseType);
  }

  //Get Default Problem for Sliding Doors based on the TrackType Selection
  /**
   * Get the list of problems of sliding door project API
   * @param projectGuid 
   * @param problemGuid 
   * @param aseType 
   * @returns 
   */
  GetProblemForSlidingDoorProject(projectGuid: string, problemGuid: string, aseType: string): Observable<BpsUnifiedProblem> {
    let url: string = this.appConstantService.APP_DOMAIN + "api/BpsProject/GetDefaultASEProblem/" + projectGuid + "/" + problemGuid + "/" + aseType;
    return this.http.post<any>(url, '');
  }

}
 