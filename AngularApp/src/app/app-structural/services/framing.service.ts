import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { AppconstantsService } from 'src/app/app-common/services/appconstants.service';
import { HttpClient } from '@angular/common/http';
import { LocalStorageService } from 'src/app/app-core/services/local-storage.service';

@Injectable({
  providedIn: 'root'
})
export class FramingService {
  constructor(private localStorageService: LocalStorageService, private appConstantService: AppconstantsService, private http: HttpClient) { }
  language = (this.localStorageService.getValue('culture')) ? this.localStorageService.getValue('culture') : 'en-US';

  //#region API Calls
  getOuterFramesForSystem(systemName: string): Observable<string> {
    let url: string = this.appConstantService.APP_DOMAIN + "api/Article/GetOuterFramesForSystem/" + systemName;
    return this.http.get<string>(url);
  }
  getVentFramesForSystem(systemName: string): Observable<string> {
    let url: string = this.appConstantService.APP_DOMAIN + "api/Article/GetVentFramesForSystem/" + systemName;
    return this.http.get<string>(url);
  }
  getMullionFramesForSystem(systemName: string): Observable<string> {
    let url: string = this.appConstantService.APP_DOMAIN + "api/Article/GetMullionTransomForSystem/" + systemName;
    return this.http.get<string>(url);
  }
  getFacadeInsertUnit(systemName: string): Observable<string> {
    let url: string = this.appConstantService.APP_DOMAIN + "api/Article/GetFacadeInsertUnit";
    return this.http.get<string>(url);
  }
  getFacadeProfile(): Observable<string> {
    let url: string = this.appConstantService.APP_DOMAIN + "api/Article/GetFacadeProfile";
    return this.http.get<string>(url);
  }
  getFacadeSpacer(): Observable<string> {
    let url: string = this.appConstantService.APP_DOMAIN + "api/Article/GetFacadeSpacer";
    return this.http.get<string>(url);
  }
  getADSArticlesList(systemName: string): Observable<any> {
    let url: string = this.appConstantService.APP_DOMAIN + "api/Article/GetArticlesForSystem/" + systemName;
    return this.http.get<any>(url);
  }
  getASEArticlesList(systemName: string): Observable<string> { 
    let url: string = this.appConstantService.APP_DOMAIN + "api/Article/GetArticlesForSystem/" + systemName;   // sliding data not in the db
    return this.http.get<string>(url);
  }
  GetDoorHandleArticles(): Observable<any> {
    let url: string = this.appConstantService.APP_DOMAIN + "api/Article/GetDoorHandleHingeForSystem/";
    return this.http.get<any>(url);
  }

  getSlidingDoorArticles(): Observable<any> {
    let slidingDoorArticlesList: any = [];
    slidingDoorArticlesList.push({'ArticleSetID': 1, 'ArticleName':'269400', 'Color': 'Silver Grey - RAL 7001',   'ColorCode':'RAL 7001', 'Type': 'Lift-and-Slide Fittings', 'Description': 'Handle Recess'});
    slidingDoorArticlesList.push({'ArticleSetID': 2, 'ArticleName':'269401', 'Color': 'Jet Black - RAL 9005',     'ColorCode':'RAL 9005', 'Type': 'Lift-and-Slide Fittings', 'Description': 'Handle Recess'});
    slidingDoorArticlesList.push({'ArticleSetID': 3, 'ArticleName':'269402', 'Color': 'Pure White - RAL 9010',    'ColorCode':'RAL 9010', 'Type': 'Lift-and-Slide Fittings', 'Description': 'Handle Recess'});
    slidingDoorArticlesList.push({'ArticleSetID': 4, 'ArticleName':'269403', 'Color': 'Traffic White - RAL 9016', 'ColorCode':'RAL 9016', 'Type': 'Lift-and-Slide Fittings', 'Description': 'Handle Recess'});
    slidingDoorArticlesList.push({'ArticleSetID': 5, 'ArticleName':'269404', 'Color': 'INOX',                     'ColorCode':'INOX',     'Type': 'Lift-and-Slide Fittings', 'Description': 'Handle Recess'}); 
    slidingDoorArticlesList.push({'ArticleSetID': 6, 'ArticleName':'269411', 'Color': 'Silver Grey - RAL 7001',   'ColorCode':'RAL 7001', 'Type': 'Lift-and-Slide Fittings', 'Description': 'Crank Handle'});
    slidingDoorArticlesList.push({'ArticleSetID': 7, 'ArticleName':'269412', 'Color': 'Jet Black - RAL 9005',     'ColorCode':'RAL 9005', 'Type': 'Lift-and-Slide Fittings', 'Description': 'Crank Handle'});
    slidingDoorArticlesList.push({'ArticleSetID': 8, 'ArticleName':'269413', 'Color': 'Pure White - RAL 9010',    'ColorCode':'RAL 9010', 'Type': 'Lift-and-Slide Fittings', 'Description': 'Crank Handle'});
    slidingDoorArticlesList.push({'ArticleSetID': 9, 'ArticleName':'269414', 'Color': 'Traffic White - RAL 9016', 'ColorCode':'RAL 9016', 'Type': 'Lift-and-Slide Fittings', 'Description': 'Crank Handle'});
    slidingDoorArticlesList.push({'ArticleSetID': 10, 'ArticleName':'269415', 'Color': 'INOX',                     'ColorCode':'INOX',     'Type': 'Lift-and-Slide Fittings', 'Description': 'Crank Handle'});    
       
        return of(JSON.stringify(slidingDoorArticlesList));
  }
  //#endregion
  
  //#region Static Data
  getMaxDepth(unified3DModel: any): number {
    if (unified3DModel.ProblemSetting.ProductType === "Window" && unified3DModel.ModelInput.Geometry.Sections.length > 0) {
      var oDepth = unified3DModel.ModelInput.Geometry.Sections[0].Depth;
      var mDepth = unified3DModel.ModelInput.Geometry.Sections[1].Depth;
      var tDepth = unified3DModel.ModelInput.Geometry.Sections[2].Depth;
      oDepth = oDepth == undefined ? 0 : oDepth;
      mDepth = mDepth == undefined ? 0 : mDepth;
      tDepth = tDepth == undefined ? 0 : tDepth;
      return [oDepth, mDepth, tDepth].sort(function (a, b) { return b - a })[0];
    }
    else if (unified3DModel.ProblemSetting.ProductType === "Facade" && unified3DModel.ModelInput.Geometry.FacadeSections.length > 0) {
      var oDepth = unified3DModel.ModelInput.Geometry.FacadeSections[0].Depth;
      var mDepth = unified3DModel.ModelInput.Geometry.FacadeSections[1].Depth;
      var tDepth = unified3DModel.ModelInput.Geometry.FacadeSections[2].Depth;
      oDepth = oDepth == undefined ? 0 : oDepth;
      mDepth = mDepth == undefined ? 0 : mDepth;
      tDepth = tDepth == undefined ? 0 : tDepth;
      return [oDepth, mDepth, tDepth].sort(function (a, b) { return b - a })[0];
    }
  }

  getFacade_MullionList(system: string): Observable<any> {
    let facacdeMullionList: FacadeMullion[] = [];
    system = this.getFWSSystemType(system);
    switch (system) {
      case 'FWS 35':
        facacdeMullionList.push(new FacadeMullion(477750, 65));
        facacdeMullionList.push(new FacadeMullion(477760, 85));
        facacdeMullionList.push(new FacadeMullion(477770, 105));
        facacdeMullionList.push(new FacadeMullion(477780, 125));
        facacdeMullionList.push(new FacadeMullion(477790, 150));
        return of(facacdeMullionList);
      case 'FWS 50':
        // ------------- Obsolete -------------------------------
        // facacdeMullionList.push(new FacadeMullion(322250, 50));
        // facacdeMullionList.push(new FacadeMullion(322260, 65));
        // facacdeMullionList.push(new FacadeMullion(322270, 85));
        // facacdeMullionList.push(new FacadeMullion(322280, 105));
        // facacdeMullionList.push(new FacadeMullion(322290, 125));
        // facacdeMullionList.push(new FacadeMullion(322300, 150));
        // facacdeMullionList.push(new FacadeMullion(322310, 175));
        // facacdeMullionList.push(new FacadeMullion(326030, 200));
        // facacdeMullionList.push(new FacadeMullion(336230, 225));
        // facacdeMullionList.push(new FacadeMullion(336240, 250));
        facacdeMullionList.push(new FacadeMullion(536800, 50));
        facacdeMullionList.push(new FacadeMullion(536810, 65));
        facacdeMullionList.push(new FacadeMullion(536820, 85));
        facacdeMullionList.push(new FacadeMullion(536830, 105));
        facacdeMullionList.push(new FacadeMullion(536720, 115));  // javascript file missing
        facacdeMullionList.push(new FacadeMullion(536840, 125));
        facacdeMullionList.push(new FacadeMullion(536850, 150));
        facacdeMullionList.push(new FacadeMullion(536270, 175, this.language == 'en-US' ? '(2.1mm)' : '(2,1mm)'));
        facacdeMullionList.push(new FacadeMullion(536320, 175, this.language == 'en-US' ? '(3.1mm)' : '(3,1mm)'));
        facacdeMullionList.push(new FacadeMullion(536380, 200));
        facacdeMullionList.push(new FacadeMullion(536470, 225));
        facacdeMullionList.push(new FacadeMullion(536180, 250));
        return of(facacdeMullionList);
      case 'FWS 60':
        // ------------- Obsolete -------------------------------
        // facacdeMullionList.push(new FacadeMullion(324010, 50));
        // facacdeMullionList.push(new FacadeMullion(324020, 65));
        // facacdeMullionList.push(new FacadeMullion(324030, 85));
        // facacdeMullionList.push(new FacadeMullion(324040, 105));
        // facacdeMullionList.push(new FacadeMullion(324050, 125));
        // facacdeMullionList.push(new FacadeMullion(324060, 150));
        // facacdeMullionList.push(new FacadeMullion(324070, 175));
        // facacdeMullionList.push(new FacadeMullion(324080, 200));
        // facacdeMullionList.push(new FacadeMullion(324090, 225));
        // facacdeMullionList.push(new FacadeMullion(336270, 250));

        facacdeMullionList.push(new FacadeMullion(543000, 50));
        facacdeMullionList.push(new FacadeMullion(543010, 65));
        facacdeMullionList.push(new FacadeMullion(543020, 85));
        facacdeMullionList.push(new FacadeMullion(543030, 105));
        facacdeMullionList.push(new FacadeMullion(543040, 125));
        facacdeMullionList.push(new FacadeMullion(543050, 150));
        facacdeMullionList.push(new FacadeMullion(536540, 175));
        facacdeMullionList.push(new FacadeMullion(536580, 200));
        facacdeMullionList.push(new FacadeMullion(536620, 225));
        facacdeMullionList.push(new FacadeMullion(536660, 250));
        return of(facacdeMullionList);
      case 'UDC 80':
        facacdeMullionList.push(new FacadeMullion(505200, 130));
        facacdeMullionList.push(new FacadeMullion(505210, 155));
        facacdeMullionList.push(new FacadeMullion(505220, 180));
        facacdeMullionList.push(new FacadeMullion(505230, 205));
        facacdeMullionList.push(new FacadeMullion(505240, 230));
        facacdeMullionList.push(new FacadeMullion(505250, 255));
        return of(facacdeMullionList);
      default:
        facacdeMullionList.push(new FacadeMullion(477750, 65));
        facacdeMullionList.push(new FacadeMullion(477760, 85));
        facacdeMullionList.push(new FacadeMullion(477770, 105));
        facacdeMullionList.push(new FacadeMullion(477780, 125));
        facacdeMullionList.push(new FacadeMullion(477790, 150));
        return of(facacdeMullionList);
    }
  }

  getFacade_TransomList(system: string, mullionId: string, applicationType = 'BPS'): Observable<any> {
    let facadeTransomList: FacadeTransom[] = [];
    system = this.getFWSSystemType(system);
    switch (system) {
      case "FWS 35":
        switch (mullionId) {
          case "477750":
            facadeTransomList.push(new FacadeTransom(477800, 70));
            return of(facadeTransomList);
          case "477760":
            facadeTransomList.push(new FacadeTransom(477800, 70));
            facadeTransomList.push(new FacadeTransom(477810, 90));
            return of(facadeTransomList);
          case "477770":
            facadeTransomList.push(new FacadeTransom(477800, 70));
            facadeTransomList.push(new FacadeTransom(477810, 90));
            facadeTransomList.push(new FacadeTransom(477820, 110));
            return of(facadeTransomList);
          case "477780":
            facadeTransomList.push(new FacadeTransom(477800, 70));
            facadeTransomList.push(new FacadeTransom(477810, 90));
            facadeTransomList.push(new FacadeTransom(477820, 110));
            facadeTransomList.push(new FacadeTransom(477830, 130));
            return of(facadeTransomList);
          case "477790":
            facadeTransomList.push(new FacadeTransom(477800, 70));
            facadeTransomList.push(new FacadeTransom(477810, 90));
            facadeTransomList.push(new FacadeTransom(477820, 110));
            facadeTransomList.push(new FacadeTransom(477830, 130));
            facadeTransomList.push(new FacadeTransom(477840, 155));
            return of(facadeTransomList);
        }
      case "FWS 50":
        switch (mullionId) {
          case "322250": // OLD
          case "536800":
            facadeTransomList.push(new FacadeTransom(322370, 6));
            facadeTransomList.push(new FacadeTransom(322380, 21));
            facadeTransomList.push(new FacadeTransom(322460, 27));
            facadeTransomList.push(new FacadeTransom(323840, 45));
            facadeTransomList.push(new FacadeTransom(322390, 55));
            return of(facadeTransomList);
          case "322260": // OLD
          case "536810":
            facadeTransomList.push(new FacadeTransom(322370, 6));
            facadeTransomList.push(new FacadeTransom(322380, 21));
            facadeTransomList.push(new FacadeTransom(322460, 27));
            facadeTransomList.push(new FacadeTransom(323840, 45));
            facadeTransomList.push(new FacadeTransom(322390, 55));
            facadeTransomList.push(new FacadeTransom(322400, 70));
            return of(facadeTransomList);
          case "322270": // OLD
          case "536820":
            facadeTransomList.push(new FacadeTransom(322370, 6));
            facadeTransomList.push(new FacadeTransom(322380, 21));
            facadeTransomList.push(new FacadeTransom(322460, 27));
            facadeTransomList.push(new FacadeTransom(323840, 45));
            facadeTransomList.push(new FacadeTransom(322390, 55));
            facadeTransomList.push(new FacadeTransom(322400, 70));
            facadeTransomList.push(new FacadeTransom(322410, 90));
            return of(facadeTransomList);
          case "322280": // OLD
          case "536830":
            facadeTransomList.push(new FacadeTransom(322370, 6));
            facadeTransomList.push(new FacadeTransom(322380, 21));
            facadeTransomList.push(new FacadeTransom(322460, 27));
            facadeTransomList.push(new FacadeTransom(323840, 45));
            facadeTransomList.push(new FacadeTransom(322390, 55));
            facadeTransomList.push(new FacadeTransom(322400, 70));
            facadeTransomList.push(new FacadeTransom(322410, 90));
            facadeTransomList.push(new FacadeTransom(322420, 110));
            return of(facadeTransomList);
          case "536720": //new data..........
            facadeTransomList.push(new FacadeTransom(322370, 6));
            facadeTransomList.push(new FacadeTransom(322380, 21));
            facadeTransomList.push(new FacadeTransom(322460, 27));
            facadeTransomList.push(new FacadeTransom(323840, 45));
            facadeTransomList.push(new FacadeTransom(322390, 55));
            facadeTransomList.push(new FacadeTransom(322400, 70));
            facadeTransomList.push(new FacadeTransom(322410, 90));
            facadeTransomList.push(new FacadeTransom(322420, 110));
            facadeTransomList.push(new FacadeTransom(536750, 120));
            return of(facadeTransomList);
          case "322290": // OLD
          case "536840":
            facadeTransomList.push(new FacadeTransom(322370, 6));
            facadeTransomList.push(new FacadeTransom(322380, 21));
            facadeTransomList.push(new FacadeTransom(322460, 27));
            facadeTransomList.push(new FacadeTransom(323840, 45));
            facadeTransomList.push(new FacadeTransom(322390, 55));
            facadeTransomList.push(new FacadeTransom(322400, 70));
            facadeTransomList.push(new FacadeTransom(322410, 90));
            facadeTransomList.push(new FacadeTransom(322420, 110));
            facadeTransomList.push(new FacadeTransom(536750, 120));
            facadeTransomList.push(new FacadeTransom(322430, 130));
            return of(facadeTransomList);
          case "322300": // OLD
          case "536850":
            facadeTransomList.push(new FacadeTransom(322370, 6));
            facadeTransomList.push(new FacadeTransom(322380, 21));
            facadeTransomList.push(new FacadeTransom(322460, 27));
            facadeTransomList.push(new FacadeTransom(323840, 45));
            facadeTransomList.push(new FacadeTransom(322390, 55));
            facadeTransomList.push(new FacadeTransom(322400, 70));
            facadeTransomList.push(new FacadeTransom(322410, 90));
            facadeTransomList.push(new FacadeTransom(322420, 110));
            facadeTransomList.push(new FacadeTransom(536750, 120));
            facadeTransomList.push(new FacadeTransom(322430, 130));
            facadeTransomList.push(new FacadeTransom(322440, 155));
            return of(facadeTransomList);
          case "322310": // OLD
          case "536270": // NEW
          case "536320": // NEW
            facadeTransomList.push(new FacadeTransom(322370, 6));
            facadeTransomList.push(new FacadeTransom(322380, 21));
            facadeTransomList.push(new FacadeTransom(322460, 27));
            facadeTransomList.push(new FacadeTransom(323840, 45));
            facadeTransomList.push(new FacadeTransom(322390, 55));
            facadeTransomList.push(new FacadeTransom(322400, 70));
            facadeTransomList.push(new FacadeTransom(322410, 90));
            facadeTransomList.push(new FacadeTransom(322420, 110));
            facadeTransomList.push(new FacadeTransom(536750, 120));
            facadeTransomList.push(new FacadeTransom(322430, 130));
            facadeTransomList.push(new FacadeTransom(322440, 155));
            facadeTransomList.push(new FacadeTransom(322450, 180));
            return of(facadeTransomList);
          // ------------- Obsolete -------------------------------
          // case "326050":
          //   facadeTransomList.push(new FacadeTransom(322370, 6));
          //   facadeTransomList.push(new FacadeTransom(322380, 21));
          //   facadeTransomList.push(new FacadeTransom(322460, 27));
          //   facadeTransomList.push(new FacadeTransom(323840, 45));
          //   facadeTransomList.push(new FacadeTransom(322390, 55));
          //   facadeTransomList.push(new FacadeTransom(322400, 70));
          //   facadeTransomList.push(new FacadeTransom(322410, 90));
          //   facadeTransomList.push(new FacadeTransom(322420, 110));
          //   facadeTransomList.push(new FacadeTransom(536750, 120));
          //   facadeTransomList.push(new FacadeTransom(322430, 130));
          //   facadeTransomList.push(new FacadeTransom(322440, 155));
          //   facadeTransomList.push(new FacadeTransom(322450, 180));
          //   return of(facadeTransomList);
          case "326030": // OLD
          case "536380":
            facadeTransomList.push(new FacadeTransom(322370, 6));
            facadeTransomList.push(new FacadeTransom(322380, 21));
            facadeTransomList.push(new FacadeTransom(322460, 27));
            facadeTransomList.push(new FacadeTransom(323840, 45));
            facadeTransomList.push(new FacadeTransom(322390, 55));
            facadeTransomList.push(new FacadeTransom(322400, 70));
            facadeTransomList.push(new FacadeTransom(322410, 90));
            facadeTransomList.push(new FacadeTransom(322420, 110));
            facadeTransomList.push(new FacadeTransom(536750, 120));
            facadeTransomList.push(new FacadeTransom(322430, 130));
            facadeTransomList.push(new FacadeTransom(322440, 155));
            facadeTransomList.push(new FacadeTransom(322450, 180));
            facadeTransomList.push(new FacadeTransom(449590, 205));
            return of(facadeTransomList);
          case "336230": // OLD
          case "536470": // NEW
          case "536480": // REMOVE //225 depth
            facadeTransomList.push(new FacadeTransom(322370, 6));
            facadeTransomList.push(new FacadeTransom(322380, 21));
            facadeTransomList.push(new FacadeTransom(322460, 27));
            facadeTransomList.push(new FacadeTransom(323840, 45));
            facadeTransomList.push(new FacadeTransom(322390, 55));
            facadeTransomList.push(new FacadeTransom(322400, 70));
            facadeTransomList.push(new FacadeTransom(322410, 90));
            facadeTransomList.push(new FacadeTransom(322420, 110));
            facadeTransomList.push(new FacadeTransom(536750, 120));
            facadeTransomList.push(new FacadeTransom(322430, 130));
            facadeTransomList.push(new FacadeTransom(322440, 155));
            facadeTransomList.push(new FacadeTransom(322450, 180));
            facadeTransomList.push(new FacadeTransom(449590, 205));
            facadeTransomList.push(new FacadeTransom(449600, 230));
            //facadeTransomList.push(new FacadeTransom(505020, 230));//NEW
            return of(facadeTransomList);
          case "336240": // OLD
          case "536180": // NEW
          case "536510": // REMOVE //250 depth
            facadeTransomList.push(new FacadeTransom(322370, 6));
            facadeTransomList.push(new FacadeTransom(322380, 21));
            facadeTransomList.push(new FacadeTransom(322460, 27));
            facadeTransomList.push(new FacadeTransom(323840, 45));
            facadeTransomList.push(new FacadeTransom(322390, 55));
            facadeTransomList.push(new FacadeTransom(322400, 70));
            facadeTransomList.push(new FacadeTransom(322410, 90));
            facadeTransomList.push(new FacadeTransom(322420, 110));
            facadeTransomList.push(new FacadeTransom(536750, 120));
            facadeTransomList.push(new FacadeTransom(322430, 130));
            facadeTransomList.push(new FacadeTransom(322440, 155));
            facadeTransomList.push(new FacadeTransom(322450, 180));
            facadeTransomList.push(new FacadeTransom(449590, 205));
            facadeTransomList.push(new FacadeTransom(449600, 230));
            //facadeTransomList.push(new FacadeTransom(505020, 230));//NEW
            facadeTransomList.push(new FacadeTransom(449610, 255));
            //facadeTransomList.push(new FacadeTransom(505030, 255));
            return of(facadeTransomList);
        }
      case "FWS 60":
        switch (mullionId) {
          case "324010": // OLD
          case "543000": //50
            facadeTransomList.push(new FacadeTransom(324400, 6));
            facadeTransomList.push(new FacadeTransom(324410, 21));
            facadeTransomList.push(new FacadeTransom(324420, 27));
            facadeTransomList.push(new FacadeTransom(324430, 45));
            facadeTransomList.push(new FacadeTransom(324440, 55));
            return of(facadeTransomList);
          case "324020": // OLD
          case "543010": //65
            facadeTransomList.push(new FacadeTransom(324400, 6));
            facadeTransomList.push(new FacadeTransom(324410, 21));
            facadeTransomList.push(new FacadeTransom(324420, 27));
            facadeTransomList.push(new FacadeTransom(324430, 45));
            facadeTransomList.push(new FacadeTransom(324440, 55));
            facadeTransomList.push(new FacadeTransom(324450, 70));
            return of(facadeTransomList);
          case "324030": // OLD
          case "543020": //85
            facadeTransomList.push(new FacadeTransom(324400, 6));
            facadeTransomList.push(new FacadeTransom(324410, 21));
            facadeTransomList.push(new FacadeTransom(324420, 27));
            facadeTransomList.push(new FacadeTransom(324430, 45));
            facadeTransomList.push(new FacadeTransom(324440, 55));
            facadeTransomList.push(new FacadeTransom(324450, 70));
            facadeTransomList.push(new FacadeTransom(324460, 90));
            return of(facadeTransomList);
          case "324040": // OLD
          case "543030": //105
            facadeTransomList.push(new FacadeTransom(324400, 6));
            facadeTransomList.push(new FacadeTransom(324410, 21));
            facadeTransomList.push(new FacadeTransom(324420, 27));
            facadeTransomList.push(new FacadeTransom(324430, 45));
            facadeTransomList.push(new FacadeTransom(324440, 55));
            facadeTransomList.push(new FacadeTransom(324450, 70));
            facadeTransomList.push(new FacadeTransom(324460, 90));
            facadeTransomList.push(new FacadeTransom(324470, 110));
            return of(facadeTransomList);
          case "324050": // OLD
          case "543040": //125
            facadeTransomList.push(new FacadeTransom(324400, 6));
            facadeTransomList.push(new FacadeTransom(324410, 21));
            facadeTransomList.push(new FacadeTransom(324420, 27));
            facadeTransomList.push(new FacadeTransom(324430, 45));
            facadeTransomList.push(new FacadeTransom(324440, 55));
            facadeTransomList.push(new FacadeTransom(324450, 70));
            facadeTransomList.push(new FacadeTransom(324460, 90));
            facadeTransomList.push(new FacadeTransom(324470, 110));
            facadeTransomList.push(new FacadeTransom(324480, 130));
            return of(facadeTransomList);
          case "324060": // OLD
          case "543050": // NEW //150
            facadeTransomList.push(new FacadeTransom(324400, 6));
            facadeTransomList.push(new FacadeTransom(324410, 21));
            facadeTransomList.push(new FacadeTransom(324420, 27));
            facadeTransomList.push(new FacadeTransom(324430, 45));
            facadeTransomList.push(new FacadeTransom(324440, 55));
            facadeTransomList.push(new FacadeTransom(324450, 70));
            facadeTransomList.push(new FacadeTransom(324460, 90));
            facadeTransomList.push(new FacadeTransom(324470, 110));
            facadeTransomList.push(new FacadeTransom(324480, 130));
            facadeTransomList.push(new FacadeTransom(324490, 155));
            return of(facadeTransomList);
          case "324070": // OLD
          case "536540": // NEW //175
            facadeTransomList.push(new FacadeTransom(324400, 6));
            facadeTransomList.push(new FacadeTransom(324410, 21));
            facadeTransomList.push(new FacadeTransom(324420, 27));
            facadeTransomList.push(new FacadeTransom(324430, 45));
            facadeTransomList.push(new FacadeTransom(324440, 55));
            facadeTransomList.push(new FacadeTransom(324450, 70));
            facadeTransomList.push(new FacadeTransom(324460, 90));
            facadeTransomList.push(new FacadeTransom(324470, 110));
            facadeTransomList.push(new FacadeTransom(324480, 130));
            facadeTransomList.push(new FacadeTransom(324490, 155));
            facadeTransomList.push(new FacadeTransom(324500, 180));
            return of(facadeTransomList);
          case "324080": // OLD
          case "536580": // NEW //200
            facadeTransomList.push(new FacadeTransom(324400, 6));
            facadeTransomList.push(new FacadeTransom(324410, 21));
            facadeTransomList.push(new FacadeTransom(324420, 27));
            facadeTransomList.push(new FacadeTransom(324430, 45));
            facadeTransomList.push(new FacadeTransom(324440, 55));
            facadeTransomList.push(new FacadeTransom(324450, 70));
            facadeTransomList.push(new FacadeTransom(324460, 90));
            facadeTransomList.push(new FacadeTransom(324470, 110));
            facadeTransomList.push(new FacadeTransom(324480, 130));
            facadeTransomList.push(new FacadeTransom(324490, 155));
            facadeTransomList.push(new FacadeTransom(324500, 180));
            facadeTransomList.push(new FacadeTransom(326940, 205));
            return of(facadeTransomList);
          case "324090": // OLD
          case "536620": // NEW
          case "536630": // REMOVE //225
            facadeTransomList.push(new FacadeTransom(324400, 6));
            facadeTransomList.push(new FacadeTransom(324410, 21));
            facadeTransomList.push(new FacadeTransom(324420, 27));
            facadeTransomList.push(new FacadeTransom(324430, 45));
            facadeTransomList.push(new FacadeTransom(324440, 55));
            facadeTransomList.push(new FacadeTransom(324450, 70));
            facadeTransomList.push(new FacadeTransom(324460, 90));
            facadeTransomList.push(new FacadeTransom(324470, 110));
            facadeTransomList.push(new FacadeTransom(324480, 130));
            facadeTransomList.push(new FacadeTransom(324490, 155));
            facadeTransomList.push(new FacadeTransom(324500, 180));
            facadeTransomList.push(new FacadeTransom(326940, 205));//NEW
            facadeTransomList.push(new FacadeTransom(493680, 230));
            return of(facadeTransomList);
          case "336270": // OLD
          case "536660": // NEW
          case "536670": // REMOVE
            facadeTransomList.push(new FacadeTransom(324400, 6));
            facadeTransomList.push(new FacadeTransom(324410, 21));
            facadeTransomList.push(new FacadeTransom(324420, 27));
            facadeTransomList.push(new FacadeTransom(324430, 45));
            facadeTransomList.push(new FacadeTransom(324440, 55));
            facadeTransomList.push(new FacadeTransom(324450, 70));
            facadeTransomList.push(new FacadeTransom(324460, 90));
            facadeTransomList.push(new FacadeTransom(324470, 110));
            facadeTransomList.push(new FacadeTransom(324480, 130));
            facadeTransomList.push(new FacadeTransom(324490, 155));
            facadeTransomList.push(new FacadeTransom(324500, 180));
            facadeTransomList.push(new FacadeTransom(326940, 205));//NEW
            facadeTransomList.push(new FacadeTransom(493680, 230));
            facadeTransomList.push(new FacadeTransom(493690, 255));
            return of(facadeTransomList);
        }
      default:
        if (applicationType == 'SRS') {
          facadeTransomList.push(new FacadeTransom(382280, 59));
          return of(facadeTransomList);
        } else {
          facadeTransomList.push(new FacadeTransom(477750, 65));
          facadeTransomList.push(new FacadeTransom(477760, 85));
          facadeTransomList.push(new FacadeTransom(477770, 105));
          facadeTransomList.push(new FacadeTransom(477780, 125));
          facadeTransomList.push(new FacadeTransom(477790, 150));
          return of(facadeTransomList);
        }
    }
  }

  getFacade_Level2_Intermediate_MullionList(system: string, mullionId: string): Observable<any> {
    let facadeTransomList: FacadeTransom[] = [];
    system = this.getFWSSystemType(system);
    switch (system) {
      case "FWS 35":
        switch (mullionId) {
          case "477750": //65
            return of(facadeTransomList);
          case "477760": //85
            facadeTransomList.push(new FacadeTransom(434200, 84));
            return of(facadeTransomList);
          case "477770": //105
            facadeTransomList.push(new FacadeTransom(434200, 84));
            facadeTransomList.push(new FacadeTransom(434180, 104));
            return of(facadeTransomList);
          case "477780": //125
            facadeTransomList.push(new FacadeTransom(434200, 84));
            facadeTransomList.push(new FacadeTransom(434180, 104));//NEW
            facadeTransomList.push(new FacadeTransom(434210, 124));
            return of(facadeTransomList);
          case "477790": //150
            facadeTransomList.push(new FacadeTransom(434200, 84));
            facadeTransomList.push(new FacadeTransom(434180, 104));//NEW
            facadeTransomList.push(new FacadeTransom(434210, 124)); //NEW
            facadeTransomList.push(new FacadeTransom(434220, 149));
            return of(facadeTransomList);
        }
      case "FWS 50":
        switch (mullionId) {
          case "322250": // OLD
          case "536800":
            return of(facadeTransomList);
          case "322260": // OLD
          case "536810":
            return of(facadeTransomList);
          case "322270": // OLD
          case "536820":
            facadeTransomList.push(new FacadeTransom(322330, 84));
            return of(facadeTransomList);
          case "322280": // OLD
          case "536830":
            facadeTransomList.push(new FacadeTransom(322330, 84));
            facadeTransomList.push(new FacadeTransom(322340, 104));
            return of(facadeTransomList);
          case "536720":
            facadeTransomList.push(new FacadeTransom(322330, 84));
            facadeTransomList.push(new FacadeTransom(322340, 104));
            facadeTransomList.push(new FacadeTransom(536790, 114));//NEW
            return of(facadeTransomList);
          case "322290": // OLD
          case "536840":
            facadeTransomList.push(new FacadeTransom(322330, 84));
            facadeTransomList.push(new FacadeTransom(322340, 104));
            facadeTransomList.push(new FacadeTransom(536790, 114));//NEW
            facadeTransomList.push(new FacadeTransom(322350, 124));
            return of(facadeTransomList);
          case "322300": // OLD
          case "536850":
            facadeTransomList.push(new FacadeTransom(322330, 84));
            facadeTransomList.push(new FacadeTransom(322340, 104));
            facadeTransomList.push(new FacadeTransom(536790, 114));//NEW
            facadeTransomList.push(new FacadeTransom(322350, 124));
            facadeTransomList.push(new FacadeTransom(322360, 149));
            return of(facadeTransomList);
          case "322310": // OLD
          case "536270":
          case "536320": // NEW
            facadeTransomList.push(new FacadeTransom(322330, 84));
            facadeTransomList.push(new FacadeTransom(322340, 104));
            facadeTransomList.push(new FacadeTransom(536790, 114));//NEW
            facadeTransomList.push(new FacadeTransom(322350, 124));
            facadeTransomList.push(new FacadeTransom(322360, 149));
            facadeTransomList.push(new FacadeTransom(493110, 174));
            return of(facadeTransomList);
          // ------------- Obsolete -------------------------------
          // case "326050":
          //   facadeTransomList.push(new FacadeTransom(322330, 84));
          //   facadeTransomList.push(new FacadeTransom(322340, 104));
          //   facadeTransomList.push(new FacadeTransom(536790, 114));
          //   facadeTransomList.push(new FacadeTransom(322350, 124));
          //   facadeTransomList.push(new FacadeTransom(322360, 149));
          //   facadeTransomList.push(new FacadeTransom(493110, 174));
          //   return of(facadeTransomList);
          case "326030": // OLD
          case "536380":
            facadeTransomList.push(new FacadeTransom(322330, 84));
            facadeTransomList.push(new FacadeTransom(322340, 104));
            facadeTransomList.push(new FacadeTransom(536790, 114));
            facadeTransomList.push(new FacadeTransom(322350, 124));
            facadeTransomList.push(new FacadeTransom(322360, 149));
            facadeTransomList.push(new FacadeTransom(493110, 174));
            facadeTransomList.push(new FacadeTransom(493120, 199));
            return of(facadeTransomList);
          case "336230": // OLD
          case "536470": // NEW
          case "536480": // REMOVE
            facadeTransomList.push(new FacadeTransom(322330, 84));
            facadeTransomList.push(new FacadeTransom(322340, 104));
            facadeTransomList.push(new FacadeTransom(536790, 114));
            facadeTransomList.push(new FacadeTransom(322350, 124));
            facadeTransomList.push(new FacadeTransom(322360, 149));
            facadeTransomList.push(new FacadeTransom(493110, 174));
            facadeTransomList.push(new FacadeTransom(493120, 199));
            return of(facadeTransomList);
          case "336240": // OLD
          case "536180": // NEW
          case "536510": // REMOVE
            facadeTransomList.push(new FacadeTransom(322330, 84));
            facadeTransomList.push(new FacadeTransom(322340, 104));
            facadeTransomList.push(new FacadeTransom(536790, 114));
            facadeTransomList.push(new FacadeTransom(322350, 124));
            facadeTransomList.push(new FacadeTransom(322360, 149));
            facadeTransomList.push(new FacadeTransom(493110, 174));
            facadeTransomList.push(new FacadeTransom(493120, 199));
            return of(facadeTransomList);
        }
      case "FWS 60":
        switch (mullionId) {
          case "324010": case "543000":
            return of(facadeTransomList);
          case "324020": case "543010":
            return of(facadeTransomList);
          case "324030": case "543020":
            facadeTransomList.push(new FacadeTransom(324510, 84));
            return of(facadeTransomList);
          case "324040": case "543030":
            facadeTransomList.push(new FacadeTransom(324510, 84));
            facadeTransomList.push(new FacadeTransom(324520, 104));
            return of(facadeTransomList);
          case "324050": case "543040":
            facadeTransomList.push(new FacadeTransom(324510, 84));
            facadeTransomList.push(new FacadeTransom(324520, 104));
            facadeTransomList.push(new FacadeTransom(324530, 124));
            return of(facadeTransomList);
          case "324060": case "543050":
            facadeTransomList.push(new FacadeTransom(324510, 84));
            facadeTransomList.push(new FacadeTransom(324520, 104));
            facadeTransomList.push(new FacadeTransom(324530, 124));
            facadeTransomList.push(new FacadeTransom(324540, 149));
            return of(facadeTransomList);
          case "324070": case "536540":
            facadeTransomList.push(new FacadeTransom(324510, 84));
            facadeTransomList.push(new FacadeTransom(324520, 104));
            facadeTransomList.push(new FacadeTransom(324530, 124));
            facadeTransomList.push(new FacadeTransom(324540, 149));
            return of(facadeTransomList);
          case "324080": case "536580":
            facadeTransomList.push(new FacadeTransom(324510, 84));
            facadeTransomList.push(new FacadeTransom(324520, 104));
            facadeTransomList.push(new FacadeTransom(324530, 124));
            facadeTransomList.push(new FacadeTransom(324540, 149));
            return of(facadeTransomList);
          case "324090": // OLD
          case "536620": // NEW
          case "536630": // REMOVE
            facadeTransomList.push(new FacadeTransom(324510, 84));
            facadeTransomList.push(new FacadeTransom(324520, 104));
            facadeTransomList.push(new FacadeTransom(324530, 124));
            facadeTransomList.push(new FacadeTransom(324540, 149));
            return of(facadeTransomList);
          case "336270": // OLD
          case "536660": // NEW
          case "536670": // REMOVE
            facadeTransomList.push(new FacadeTransom(324510, 84));
            facadeTransomList.push(new FacadeTransom(324520, 104));
            facadeTransomList.push(new FacadeTransom(324530, 124));
            facadeTransomList.push(new FacadeTransom(324540, 149));
            return of(facadeTransomList);
        }
      default:
        facadeTransomList.push(new FacadeTransom(477750, 65));
        facadeTransomList.push(new FacadeTransom(477760, 85));
        facadeTransomList.push(new FacadeTransom(477770, 105));
        facadeTransomList.push(new FacadeTransom(477780, 125));
        facadeTransomList.push(new FacadeTransom(477790, 150));
        return of(facadeTransomList);
    }
  }

  getFacade_Intermediate_MullionList(system: string, mullionId: string): Observable<any> {
    let facacdeMullionList: FacadeTransom[] = [];
    system = this.getFWSSystemType(system);
    switch (system) {
      case "FWS 35":
        switch (mullionId) {
          case "477750":
            //facacdeMullionList.push(new FacadeTransom(477800, 70));
            return of(facacdeMullionList);
          case "477760":
            facacdeMullionList.push(new FacadeTransom(477800, 70));
            facacdeMullionList.push(new FacadeTransom(477810, 90));
            return of(facacdeMullionList);
          case "477770":
            facacdeMullionList.push(new FacadeTransom(477800, 70));
            facacdeMullionList.push(new FacadeTransom(477810, 90));
            facacdeMullionList.push(new FacadeTransom(477820, 110));
            return of(facacdeMullionList);
          case "477780":
            facacdeMullionList.push(new FacadeTransom(477800, 70));
            facacdeMullionList.push(new FacadeTransom(477810, 90));
            facacdeMullionList.push(new FacadeTransom(477820, 110));
            facacdeMullionList.push(new FacadeTransom(477830, 130));
            return of(facacdeMullionList);
          case "477790":
            facacdeMullionList.push(new FacadeTransom(477800, 70));
            facacdeMullionList.push(new FacadeTransom(477810, 90));
            facacdeMullionList.push(new FacadeTransom(477820, 110));
            facacdeMullionList.push(new FacadeTransom(477830, 130));
            facacdeMullionList.push(new FacadeTransom(477840, 155));
            return of(facacdeMullionList);
        }
      case "FWS 50":
        switch (mullionId) {
          case "322250": case "536800":
            // facacdeMullionList.push(new FacadeTransom(322370, 6));
            // facacdeMullionList.push(new FacadeTransom(322380, 21));
            // facacdeMullionList.push(new FacadeTransom(322460, 27));
            // facacdeMullionList.push(new FacadeTransom(323840, 45));
            //facacdeMullionList.push(new FacadeTransom(322390, 55));
            return of(facacdeMullionList);
          case "322260": case "536810":
            // facacdeMullionList.push(new FacadeTransom(322370, 6));
            // facacdeMullionList.push(new FacadeTransom(322380, 21));
            // facacdeMullionList.push(new FacadeTransom(322460, 27));
            // facacdeMullionList.push(new FacadeTransom(323840, 45));
            // facacdeMullionList.push(new FacadeTransom(322390, 55));
            //facacdeMullionList.push(new FacadeTransom(322400, 70));
            return of(facacdeMullionList);
          case "322270": case "536820":
            facacdeMullionList.push(new FacadeTransom(322370, 6));
            facacdeMullionList.push(new FacadeTransom(322380, 21));
            facacdeMullionList.push(new FacadeTransom(322460, 27));
            facacdeMullionList.push(new FacadeTransom(323840, 45));
            facacdeMullionList.push(new FacadeTransom(322390, 55));
            facacdeMullionList.push(new FacadeTransom(322400, 70));
            facacdeMullionList.push(new FacadeTransom(322410, 90));
            return of(facacdeMullionList);
          case "322280": case "536830":
            facacdeMullionList.push(new FacadeTransom(322370, 6));
            facacdeMullionList.push(new FacadeTransom(322380, 21));
            facacdeMullionList.push(new FacadeTransom(322460, 27));
            facacdeMullionList.push(new FacadeTransom(323840, 45));
            facacdeMullionList.push(new FacadeTransom(322390, 55));
            facacdeMullionList.push(new FacadeTransom(322400, 70));
            facacdeMullionList.push(new FacadeTransom(322410, 90));
            facacdeMullionList.push(new FacadeTransom(322420, 110));
            return of(facacdeMullionList);
          case "536720": //new data..........
            facacdeMullionList.push(new FacadeTransom(322370, 6));
            facacdeMullionList.push(new FacadeTransom(322380, 21));
            facacdeMullionList.push(new FacadeTransom(322460, 27));
            facacdeMullionList.push(new FacadeTransom(323840, 45));
            facacdeMullionList.push(new FacadeTransom(322390, 55));
            facacdeMullionList.push(new FacadeTransom(322400, 70));
            facacdeMullionList.push(new FacadeTransom(322410, 90));
            facacdeMullionList.push(new FacadeTransom(322420, 110));
            facacdeMullionList.push(new FacadeTransom(536750, 120));
          case "322290": case "536840":
            facacdeMullionList.push(new FacadeTransom(322370, 6));
            facacdeMullionList.push(new FacadeTransom(322380, 21));
            facacdeMullionList.push(new FacadeTransom(322460, 27));
            facacdeMullionList.push(new FacadeTransom(323840, 45));
            facacdeMullionList.push(new FacadeTransom(322390, 55));
            facacdeMullionList.push(new FacadeTransom(322400, 70));
            facacdeMullionList.push(new FacadeTransom(322410, 90));
            facacdeMullionList.push(new FacadeTransom(322420, 110));
            facacdeMullionList.push(new FacadeTransom(536750, 120));
            facacdeMullionList.push(new FacadeTransom(322430, 130));
            return of(facacdeMullionList);
          case "322300": case "536850":
            facacdeMullionList.push(new FacadeTransom(322370, 6));
            facacdeMullionList.push(new FacadeTransom(322380, 21));
            facacdeMullionList.push(new FacadeTransom(322460, 27));
            facacdeMullionList.push(new FacadeTransom(323840, 45));
            facacdeMullionList.push(new FacadeTransom(322390, 55));
            facacdeMullionList.push(new FacadeTransom(322400, 70));
            facacdeMullionList.push(new FacadeTransom(322410, 90));
            facacdeMullionList.push(new FacadeTransom(322420, 110));
            facacdeMullionList.push(new FacadeTransom(536750, 120));
            facacdeMullionList.push(new FacadeTransom(322430, 130));
            facacdeMullionList.push(new FacadeTransom(322440, 155));
            return of(facacdeMullionList);
          case "322310": // OLD
          case "536270": // NEW
          case "536320": // NEW
            facacdeMullionList.push(new FacadeTransom(322370, 6));
            facacdeMullionList.push(new FacadeTransom(322380, 21));
            facacdeMullionList.push(new FacadeTransom(322460, 27));
            facacdeMullionList.push(new FacadeTransom(323840, 45));
            facacdeMullionList.push(new FacadeTransom(322390, 55));
            facacdeMullionList.push(new FacadeTransom(322400, 70));
            facacdeMullionList.push(new FacadeTransom(322410, 90));
            facacdeMullionList.push(new FacadeTransom(322420, 110));
            facacdeMullionList.push(new FacadeTransom(536750, 120));
            facacdeMullionList.push(new FacadeTransom(322430, 130));
            facacdeMullionList.push(new FacadeTransom(322440, 155));
            facacdeMullionList.push(new FacadeTransom(322450, 180));
            return of(facacdeMullionList);
          // ------------- Obsolete -------------------------------
          // case "326050":
          //   facacdeMullionList.push(new FacadeTransom(322370, 6));
          //   facacdeMullionList.push(new FacadeTransom(322380, 21));
          //   facacdeMullionList.push(new FacadeTransom(322460, 27));
          //   facacdeMullionList.push(new FacadeTransom(323840, 45));
          //   facacdeMullionList.push(new FacadeTransom(322390, 55));
          //   facacdeMullionList.push(new FacadeTransom(322400, 70));
          //   facacdeMullionList.push(new FacadeTransom(322410, 90));
          //   facacdeMullionList.push(new FacadeTransom(322420, 110));
          //   facacdeMullionList.push(new FacadeTransom(536750, 120));
          //   facacdeMullionList.push(new FacadeTransom(322430, 130));
          //   facacdeMullionList.push(new FacadeTransom(322440, 155));
          //   facacdeMullionList.push(new FacadeTransom(322450, 180));
          //   return of(facacdeMullionList);
          case "326030": case "536380":
            facacdeMullionList.push(new FacadeTransom(322370, 6));
            facacdeMullionList.push(new FacadeTransom(322380, 21));
            facacdeMullionList.push(new FacadeTransom(322460, 27));
            facacdeMullionList.push(new FacadeTransom(323840, 45));
            facacdeMullionList.push(new FacadeTransom(322390, 55));
            facacdeMullionList.push(new FacadeTransom(322400, 70));
            facacdeMullionList.push(new FacadeTransom(322410, 90));
            facacdeMullionList.push(new FacadeTransom(322420, 110));
            facacdeMullionList.push(new FacadeTransom(536750, 120));
            facacdeMullionList.push(new FacadeTransom(322430, 130));
            facacdeMullionList.push(new FacadeTransom(322440, 155));
            facacdeMullionList.push(new FacadeTransom(322450, 180));
            facacdeMullionList.push(new FacadeTransom(449590, 205));
            return of(facacdeMullionList);
          case "336230": // OLD
          case "536470": // NEW
          case "536480": // REMOVE //225 depth
            facacdeMullionList.push(new FacadeTransom(322370, 6));
            facacdeMullionList.push(new FacadeTransom(322380, 21));
            facacdeMullionList.push(new FacadeTransom(322460, 27));
            facacdeMullionList.push(new FacadeTransom(323840, 45));
            facacdeMullionList.push(new FacadeTransom(322390, 55));
            facacdeMullionList.push(new FacadeTransom(322400, 70));
            facacdeMullionList.push(new FacadeTransom(322410, 90));
            facacdeMullionList.push(new FacadeTransom(322420, 110));
            facacdeMullionList.push(new FacadeTransom(536750, 120));
            facacdeMullionList.push(new FacadeTransom(322430, 130));
            facacdeMullionList.push(new FacadeTransom(322440, 155));
            facacdeMullionList.push(new FacadeTransom(322450, 180));
            facacdeMullionList.push(new FacadeTransom(449590, 205));
            // facacdeMullionList.push(new FacadeTransom(449600, 230));
            // facacdeMullionList.push(new FacadeTransom(505020, 230));
            return of(facacdeMullionList);
          case "336240": // OLD
          case "536180": // NEW
          case "536510": // REMOVE //250 depth
            facacdeMullionList.push(new FacadeTransom(322370, 6));
            facacdeMullionList.push(new FacadeTransom(322380, 21));
            facacdeMullionList.push(new FacadeTransom(322460, 27));
            facacdeMullionList.push(new FacadeTransom(323840, 45));
            facacdeMullionList.push(new FacadeTransom(322390, 55));
            facacdeMullionList.push(new FacadeTransom(322400, 70));
            facacdeMullionList.push(new FacadeTransom(322410, 90));
            facacdeMullionList.push(new FacadeTransom(322420, 110));
            facacdeMullionList.push(new FacadeTransom(536750, 120));
            facacdeMullionList.push(new FacadeTransom(322430, 130));
            facacdeMullionList.push(new FacadeTransom(322440, 155));
            facacdeMullionList.push(new FacadeTransom(322450, 180));
            facacdeMullionList.push(new FacadeTransom(449590, 205));
            // facacdeMullionList.push(new FacadeTransom(449600, 230));
            // facacdeMullionList.push(new FacadeTransom(505020, 230));
            // facacdeMullionList.push(new FacadeTransom(449610, 255));
            // facacdeMullionList.push(new FacadeTransom(505030, 255));
            return of(facacdeMullionList);
        }
      case "FWS 60":
        switch (mullionId) {
          case "324010": case "543000": //50 depth
            // facacdeMullionList.push(new FacadeTransom(324400, 6));
            // facacdeMullionList.push(new FacadeTransom(324410, 21));
            // facacdeMullionList.push(new FacadeTransom(324420, 27));
            // facacdeMullionList.push(new FacadeTransom(324430, 45));
            //facacdeMullionList.push(new FacadeTransom(324440, 55));
            return of(facacdeMullionList);
          case "324020": case "543010": //65 depth
            // facacdeMullionList.push(new FacadeTransom(324400, 6));
            // facacdeMullionList.push(new FacadeTransom(324410, 21));
            // facacdeMullionList.push(new FacadeTransom(324420, 27));
            // facacdeMullionList.push(new FacadeTransom(324430, 45));
            // facacdeMullionList.push(new FacadeTransom(324440, 55));
            //facacdeMullionList.push(new FacadeTransom(324450, 70));
            return of(facacdeMullionList);
          case "324030": case "543020":
            facacdeMullionList.push(new FacadeTransom(324400, 6));
            facacdeMullionList.push(new FacadeTransom(324410, 21));
            facacdeMullionList.push(new FacadeTransom(324420, 27));
            facacdeMullionList.push(new FacadeTransom(324430, 45));
            facacdeMullionList.push(new FacadeTransom(324440, 55));
            facacdeMullionList.push(new FacadeTransom(324450, 70));
            facacdeMullionList.push(new FacadeTransom(324460, 90));
            return of(facacdeMullionList);
          case "324040": case "543030":
            facacdeMullionList.push(new FacadeTransom(324400, 6));
            facacdeMullionList.push(new FacadeTransom(324410, 21));
            facacdeMullionList.push(new FacadeTransom(324420, 27));
            facacdeMullionList.push(new FacadeTransom(324430, 45));
            facacdeMullionList.push(new FacadeTransom(324440, 55));
            facacdeMullionList.push(new FacadeTransom(324450, 70));
            facacdeMullionList.push(new FacadeTransom(324460, 90));
            facacdeMullionList.push(new FacadeTransom(324470, 110));
            return of(facacdeMullionList);
          case "324050": case "543040":
            facacdeMullionList.push(new FacadeTransom(324400, 6));
            facacdeMullionList.push(new FacadeTransom(324410, 21));
            facacdeMullionList.push(new FacadeTransom(324420, 27));
            facacdeMullionList.push(new FacadeTransom(324430, 45));
            facacdeMullionList.push(new FacadeTransom(324440, 55));
            facacdeMullionList.push(new FacadeTransom(324450, 70));
            facacdeMullionList.push(new FacadeTransom(324460, 90));
            facacdeMullionList.push(new FacadeTransom(324470, 110));
            facacdeMullionList.push(new FacadeTransom(324480, 130));
            return of(facacdeMullionList);
          case "324060": case "543050":
            facacdeMullionList.push(new FacadeTransom(324400, 6));
            facacdeMullionList.push(new FacadeTransom(324410, 21));
            facacdeMullionList.push(new FacadeTransom(324420, 27));
            facacdeMullionList.push(new FacadeTransom(324430, 45));
            facacdeMullionList.push(new FacadeTransom(324440, 55));
            facacdeMullionList.push(new FacadeTransom(324450, 70));
            facacdeMullionList.push(new FacadeTransom(324460, 90));
            facacdeMullionList.push(new FacadeTransom(324470, 110));
            facacdeMullionList.push(new FacadeTransom(324480, 130));
            facacdeMullionList.push(new FacadeTransom(324490, 155));
            return of(facacdeMullionList);
          case "324070": case "536540":
            facacdeMullionList.push(new FacadeTransom(324400, 6));
            facacdeMullionList.push(new FacadeTransom(324410, 21));
            facacdeMullionList.push(new FacadeTransom(324420, 27));
            facacdeMullionList.push(new FacadeTransom(324430, 45));
            facacdeMullionList.push(new FacadeTransom(324440, 55));
            facacdeMullionList.push(new FacadeTransom(324450, 70));
            facacdeMullionList.push(new FacadeTransom(324460, 90));
            facacdeMullionList.push(new FacadeTransom(324470, 110));
            facacdeMullionList.push(new FacadeTransom(324480, 130));
            facacdeMullionList.push(new FacadeTransom(324490, 155));
            //facacdeMullionList.push(new FacadeTransom(324500, 180));
            return of(facacdeMullionList);
          case "324080": case "536580":
            facacdeMullionList.push(new FacadeTransom(324400, 6));
            facacdeMullionList.push(new FacadeTransom(324410, 21));
            facacdeMullionList.push(new FacadeTransom(324420, 27));
            facacdeMullionList.push(new FacadeTransom(324430, 45));
            facacdeMullionList.push(new FacadeTransom(324440, 55));
            facacdeMullionList.push(new FacadeTransom(324450, 70));
            facacdeMullionList.push(new FacadeTransom(324460, 90));
            facacdeMullionList.push(new FacadeTransom(324470, 110));
            facacdeMullionList.push(new FacadeTransom(324480, 130));
            facacdeMullionList.push(new FacadeTransom(324490, 155));
            //------facacdeMullionList.push(new FacadeTransom(324500, 180));
            //facacdeMullionList.push(new FacadeTransom(326940, 205));
            return of(facacdeMullionList);
          case "324090": // OLD
          case "536620": // NEW
          case "536630": // REMOVE
            facacdeMullionList.push(new FacadeTransom(324400, 6));
            facacdeMullionList.push(new FacadeTransom(324410, 21));
            facacdeMullionList.push(new FacadeTransom(324420, 27));
            facacdeMullionList.push(new FacadeTransom(324430, 45));
            facacdeMullionList.push(new FacadeTransom(324440, 55));
            facacdeMullionList.push(new FacadeTransom(324450, 70));
            facacdeMullionList.push(new FacadeTransom(324460, 90));
            facacdeMullionList.push(new FacadeTransom(324470, 110));
            facacdeMullionList.push(new FacadeTransom(324480, 130));
            facacdeMullionList.push(new FacadeTransom(324490, 155));
            //------facacdeMullionList.push(new FacadeTransom(324500, 180));
            //------facacdeMullionList.push(new FacadeTransom(326940, 205));
            //facacdeMullionList.push(new FacadeTransom(493680, 230));
            return of(facacdeMullionList);
          case "336270": // OLD
          case "536660": // NEW
          case "536670": // REMOVE
            facacdeMullionList.push(new FacadeTransom(324400, 6));
            facacdeMullionList.push(new FacadeTransom(324410, 21));
            facacdeMullionList.push(new FacadeTransom(324420, 27));
            facacdeMullionList.push(new FacadeTransom(324430, 45));
            facacdeMullionList.push(new FacadeTransom(324440, 55));
            facacdeMullionList.push(new FacadeTransom(324450, 70));
            facacdeMullionList.push(new FacadeTransom(324460, 90));
            facacdeMullionList.push(new FacadeTransom(324470, 110));
            facacdeMullionList.push(new FacadeTransom(324480, 130));
            facacdeMullionList.push(new FacadeTransom(324490, 155));
            //------ facacdeMullionList.push(new FacadeTransom(324500, 180));
            //------ facacdeMullionList.push(new FacadeTransom(326940, 205));
            //------ facacdeMullionList.push(new FacadeTransom(493680, 230));
            //facacdeMullionList.push(new FacadeTransom(493690, 255));
            return of(facacdeMullionList);
        }
      default:
        facacdeMullionList.push(new FacadeTransom(477750, 65));
        facacdeMullionList.push(new FacadeTransom(477760, 85));
        facacdeMullionList.push(new FacadeTransom(477770, 105));
        facacdeMullionList.push(new FacadeTransom(477780, 125));
        facacdeMullionList.push(new FacadeTransom(477790, 150));
        return of(facacdeMullionList.filter(f => f.transomArticleId < parseInt(mullionId)));
    }
  }

  getFacade_Mullion_ReinforcementList(mullionId: string): Observable<any> {
    let reinforcementList: FacadeMullionReinforcement[] = [];
    switch (mullionId) {
      // FWS 35
      case "477770": reinforcementList.push(new FacadeMullionReinforcement(477870, "Aluminium")); reinforcementList.push(new FacadeMullionReinforcement(201310, "Steel")); return of(reinforcementList);
      case "477780": reinforcementList.push(new FacadeMullionReinforcement(477880, "Aluminium")); reinforcementList.push(new FacadeMullionReinforcement(201311, "Steel")); return of(reinforcementList);
      case "477790": reinforcementList.push(new FacadeMullionReinforcement(477890, "Aluminium")); return of(reinforcementList);

      //Facade New FWS 50 article data
      case "536800": return of(reinforcementList);
      case "536810": return of(reinforcementList);
      case "536820": reinforcementList.push(new FacadeMullionReinforcement(536890, "Aluminium")); return of(reinforcementList);
      case "536830": reinforcementList.push(new FacadeMullionReinforcement(536900, "Aluminium")); reinforcementList.push(new FacadeMullionReinforcement(201216, "Steel")); return of(reinforcementList);
      case "536720": reinforcementList.push(new FacadeMullionReinforcement(536740, "Aluminium")); return of(reinforcementList);
      case "536840": reinforcementList.push(new FacadeMullionReinforcement(536910, "Aluminium")); reinforcementList.push(new FacadeMullionReinforcement(201217, "Steel")); return of(reinforcementList);
      case "536850": reinforcementList.push(new FacadeMullionReinforcement(536920, "Aluminium")); return of(reinforcementList);
      case "536270": reinforcementList.push(new FacadeMullionReinforcement(536290, "Aluminium")); return of(reinforcementList);
      case "536320": reinforcementList.push(new FacadeMullionReinforcement(536370, "Aluminium")); return of(reinforcementList);
      case "536380": reinforcementList.push(new FacadeMullionReinforcement(536460, "Aluminium")); return of(reinforcementList);
      case "536470": reinforcementList.push(new FacadeMullionReinforcement(536500, "Aluminium")); return of(reinforcementList);
      case "536480": reinforcementList.push(new FacadeMullionReinforcement(536500, "Aluminium")); return of(reinforcementList);
      case "536180":
      case "536510": reinforcementList.push(new FacadeMullionReinforcement(536530, "Aluminium")); reinforcementList.push(new FacadeMullionReinforcement(484010, "Aluminium")); return of(reinforcementList);
      // OLD FWS 50 --------------------------------
      case "322270": reinforcementList.push(new FacadeMullionReinforcement(322720, "Aluminium")); return of(reinforcementList);
      case "322280": reinforcementList.push(new FacadeMullionReinforcement(322730, "Aluminium")); reinforcementList.push(new FacadeMullionReinforcement(201216, "Steel")); return of(reinforcementList);
      case "322290": reinforcementList.push(new FacadeMullionReinforcement(322740, "Aluminium")); reinforcementList.push(new FacadeMullionReinforcement(201217, "Steel")); return of(reinforcementList);
      case "322300": reinforcementList.push(new FacadeMullionReinforcement(322750, "Aluminium")); return of(reinforcementList);
      case "322310": reinforcementList.push(new FacadeMullionReinforcement(322760, "Aluminium")); return of(reinforcementList);
      case "326250": reinforcementList.push(new FacadeMullionReinforcement(322760, "Aluminium")); return of(reinforcementList);
      case "326030": reinforcementList.push(new FacadeMullionReinforcement(326050, "Aluminium")); return of(reinforcementList);
      case "336230": reinforcementList.push(new FacadeMullionReinforcement(336250, "Aluminium")); return of(reinforcementList);
      case "336240": reinforcementList.push(new FacadeMullionReinforcement(336260, "Aluminium")); return of(reinforcementList);

      //Facade New FWS 60 article data
      case "543000": return of(reinforcementList);
      case "543010": return of(reinforcementList);
      case "543020": reinforcementList.push(new FacadeMullionReinforcement(543060, "Aluminium")); return of(reinforcementList);
      case "543030": reinforcementList.push(new FacadeMullionReinforcement(543070, "Aluminium")); return of(reinforcementList);
      case "543040": reinforcementList.push(new FacadeMullionReinforcement(543080, "Aluminium")); return of(reinforcementList);
      case "543050": reinforcementList.push(new FacadeMullionReinforcement(543090, "Aluminium")); return of(reinforcementList);
      case "536540": reinforcementList.push(new FacadeMullionReinforcement(536570, "Aluminium")); return of(reinforcementList);
      case "536580": reinforcementList.push(new FacadeMullionReinforcement(536610, "Aluminium")); return of(reinforcementList);
      case "536620": reinforcementList.push(new FacadeMullionReinforcement(536650, "Aluminium")); return of(reinforcementList);
      case "536630": reinforcementList.push(new FacadeMullionReinforcement(536650, "Aluminium")); return of(reinforcementList);
      case "536660": reinforcementList.push(new FacadeMullionReinforcement(536690, "Aluminium"));reinforcementList.push(new FacadeMullionReinforcement(477570, "Aluminium")); return of(reinforcementList);
      case "536670": reinforcementList.push(new FacadeMullionReinforcement(536690, "Aluminium")); reinforcementList.push(new FacadeMullionReinforcement(477570, "Aluminium")); return of(reinforcementList);
      // OLD FWS 60 --------------------------------
      case "324030": reinforcementList.push(new FacadeMullionReinforcement(324300, "Aluminium")); return of(reinforcementList)
      case "324040": reinforcementList.push(new FacadeMullionReinforcement(324310, "Aluminium")); reinforcementList.push(new FacadeMullionReinforcement(201216, "Steel")); return of(reinforcementList)
      case "324050": reinforcementList.push(new FacadeMullionReinforcement(324310, "Aluminium")); reinforcementList.push(new FacadeMullionReinforcement(301217, "Steel")); return of(reinforcementList)
      case "324060": reinforcementList.push(new FacadeMullionReinforcement(324330, "Aluminium")); return of(reinforcementList)
      case "324070": reinforcementList.push(new FacadeMullionReinforcement(324340, "Aluminium")); return of(reinforcementList)
      case "324080": reinforcementList.push(new FacadeMullionReinforcement(324350, "Aluminium")); return of(reinforcementList)
      case "324090": reinforcementList.push(new FacadeMullionReinforcement(324360, "Aluminium")); return of(reinforcementList)
      case "336270": reinforcementList.push(new FacadeMullionReinforcement(477570, "Aluminium")); return of(reinforcementList)
      default: return of(reinforcementList)
    }
  }

  getFacade_Transom_ReinforcementList(system: string): Observable<any> {
    let reinforcementList: FacadeMullionReinforcement[] = [];
    system = this.getFWSSystemType(system);
    switch (system) {
      case "FWS 35": reinforcementList.push(new FacadeMullionReinforcement(477900, "Aluminium")); return of(reinforcementList);
      case "FWS 50": reinforcementList.push(new FacadeMullionReinforcement(351980, "Aluminium")); return of(reinforcementList);
      case "FWS 60": reinforcementList.push(new FacadeMullionReinforcement(336090, "Aluminium")); return of(reinforcementList);
    }
  }

  getBottomFrameList(framingId: string): FacadeUDC {
    switch (framingId) {
      case "505200": return new FacadeUDC(505300, 0, 130);
      case "505210": return new FacadeUDC(505310, 0, 155);
      case "505720": return new FacadeUDC(527820, 0, 180);
      case "505220": return new FacadeUDC(505320, 0, 180);
      case "505230": return new FacadeUDC(505330, 0, 205);
      //case "527230": return new FacadeUDC(527330, 0, 205);
      case "505240": return new FacadeUDC(505340, 0, 230);
      //case "527240": return new FacadeUDC(527340, 0, 230);
      case "505250": return new FacadeUDC(505350, 0, 255);
      //case "527250": return new FacadeUDC(527350, 0, 255);
      default:
        return null;
    }
  }

  getUDCFramingList(system: string, mullionId: string, type: string): Observable<any> {
    let facadeUDC80List: FacadeUDC[] = [];
    facadeUDC80List.push(new FacadeUDC(505200, 35, 130));
    facadeUDC80List.push(new FacadeUDC(505210, 35, 155));
    facadeUDC80List.push(new FacadeUDC(505220, 35, 180));
    facadeUDC80List.push(new FacadeUDC(505230, 35, 205));
    facadeUDC80List.push(new FacadeUDC(505240, 35, 230));
    facadeUDC80List.push(new FacadeUDC(505250, 35, 255));

    let facadeUDCList: FacadeUDC[] = [];
    system = this.getUDCSystemType(system);
    switch (system) {
      case 'UDC 80':
        if (type === 'Framing') {
          facadeUDCList = facadeUDC80List;
        }
        else if (type === 'IntermediateMullion' || type === 'IntermediateTransom') {
          let selectedFrame = facadeUDC80List.filter(f => f.transomArticleId.toString() === mullionId);
          facadeUDCList.push(new FacadeUDC(505500, 60, 54, this.disabledTransomOrMullion(selectedFrame, 54)));
          facadeUDCList.push(new FacadeUDC(505510, 60, 79, this.disabledTransomOrMullion(selectedFrame, 79)));
          facadeUDCList.push(new FacadeUDC(505520, 60, 129, this.disabledTransomOrMullion(selectedFrame, 129)));
          facadeUDCList.push(new FacadeUDC(505530, 60, 154, this.disabledTransomOrMullion(selectedFrame, 154)));
          facadeUDCList.push(new FacadeUDC(505540, 60, 179, this.disabledTransomOrMullion(selectedFrame, 179)));
          facadeUDCList.push(new FacadeUDC(505550, 60, 204, this.disabledTransomOrMullion(selectedFrame, 204)));
          //facadeUDCList.push(new FacadeUDC(527550, 60, 204));
          facadeUDCList.push(new FacadeUDC(505560, 60, 229, this.disabledTransomOrMullion(selectedFrame, 229)));
          //facadeUDCList.push(new FacadeUDC(527560, 60));
          facadeUDCList.push(new FacadeUDC(505570, 60, 254, this.disabledTransomOrMullion(selectedFrame, 254)));
          //facadeUDCList.push(new FacadeUDC(527570, 60));

          facadeUDCList.push(new FacadeUDC(505400, 80, 54, this.disabledTransomOrMullion(selectedFrame, 54)));
          facadeUDCList.push(new FacadeUDC(505410, 80, 79, this.disabledTransomOrMullion(selectedFrame, 79)));
          facadeUDCList.push(new FacadeUDC(505420, 80, 129, this.disabledTransomOrMullion(selectedFrame, 129)));
          facadeUDCList.push(new FacadeUDC(505430, 80, 154, this.disabledTransomOrMullion(selectedFrame, 154)));
          facadeUDCList.push(new FacadeUDC(505440, 80, 179, this.disabledTransomOrMullion(selectedFrame, 179)));
          facadeUDCList.push(new FacadeUDC(505450, 80, 204, this.disabledTransomOrMullion(selectedFrame, 204)));
          //facadeUDCList.push(new FacadeUDC(527450, 80, 204));
          facadeUDCList.push(new FacadeUDC(505460, 80, 229, this.disabledTransomOrMullion(selectedFrame, 229)));
          //facadeUDCList.push(new FacadeUDC(527460, 80, 229));
          facadeUDCList.push(new FacadeUDC(505470, 80, 254, this.disabledTransomOrMullion(selectedFrame, 254)));
          //facadeUDCList.push(new FacadeUDC(527470, 80, 254));
        }
    }
    // if (mullionId !== null && type === 'IntermediateMullion') {
    //   let depth = facadeUDC80List.filter(f => f.transomArticleId.toString() === mullionId);
    //   if (depth.length > 0)
    //     facadeUDCList = facadeUDCList.filter(f => f.transomDepth <= depth[0].transomDepth);
    // }
    // else if (mullionId !== null && type === 'IntermediateTransom') {
    //   let depth = facadeUDCList.filter(f => f.transomArticleId.toString() === mullionId);
    //   if (depth.length > 0)
    //     facadeUDCList = facadeUDCList.filter(f => f.transomDepth <= depth[0].transomDepth);
    // }
    return of(facadeUDCList);
  }

  disabledTransomOrMullion(selectedFrame, depthGlazingBar): boolean {
    let isDisabled: boolean = false;
    if (selectedFrame && selectedFrame.length > 0 && depthGlazingBar > selectedFrame[0].transomDepth) {
      return true;
    }
    return isDisabled;
  }

  oldToNewFraming(oldArticle: number) {
    if (oldArticle == 322250) return 536800;
    else if (oldArticle == 322260) return 536810;
    else if (oldArticle == 322270) return 536820;
    else if (oldArticle == 322280) return 536830;
    else if (oldArticle == 322280) return 536720;
    else if (oldArticle == 322290) return 536840;
    else if (oldArticle == 322300) return 536850;
    else if (oldArticle == 322310) return 536270;
    else if (oldArticle == 322310) return 536320;
    else if (oldArticle == 326030) return 536380;
    else if (oldArticle == 336230) return 536470;
    else if (oldArticle == 336240) return 536180;
    else if (oldArticle == 324010) return 543000;
    else if (oldArticle == 324020) return 543010;
    else if (oldArticle == 324030) return 543020;
    else if (oldArticle == 324040) return 543030;
    else if (oldArticle == 324050) return 543040;
    else if (oldArticle == 324060) return 543050;
    else if (oldArticle == 324070) return 536540;
    else if (oldArticle == 324080) return 536580;
    else if (oldArticle == 324090) return 536620;
    else if (oldArticle == 336270) return 536660;
    //Facade Mullion Reinforcement
    else if (oldArticle == 336280) return 536690;
    else if (oldArticle == 324360) return 536650;
    else if (oldArticle == 324350) return 536610;
    else if (oldArticle == 324340) return 536570;

    else return oldArticle;
  }

  getFWSSystemType(systemType): string {
    var fwsSystemDesc = ['FWS 35', 'FWS 35', 'FWS 50', 'FWS 50', 'FWS 50', 'FWS 50', 'FWS 60', 'FWS 60', 'FWS 60', 'FWS 60'];
    var fwsSystemDesc2 = ['FWS 35 PD', 'FWS 35 PD', 'FWS 50', 'FWS 50', 'FWS 50', 'FWS 50', 'FWS 60', 'FWS 60', 'FWS 60', 'FWS 60'];
    var systemIndex = fwsSystemDesc2.indexOf(systemType);
    if (systemIndex != -1)
      return fwsSystemDesc[systemIndex];
    else
      return systemType;
  }

  getUDCSystemType(systemType): string {
    var systemData_FacadeUDC = ['UDC 80', 'UDC 80', 'UDC 80', 'UDC 80'];
    var systemDataUpper_FacadeUDC = ['UDC 80', 'UDC 80', 'UDC 80', 'UDC 80'];
    var systemIndex = systemDataUpper_FacadeUDC.indexOf(systemType);
    if (systemIndex != -1)
      return systemData_FacadeUDC[systemIndex];
    else
      return systemType;
  }

  getADSDoorLeafList(system: string): Observable<any> {
    let doorleafArticle= [{ "ArticleId":0,
      "ArticleGuid":null,
      "Name":"ads__476230",
      "Unit":"mm",
      "ArticleTypeId":1,
      "CrossSectionUrl":null,
      "Description":"Door Leaf 476230",
      "InsideDimension":73.0,
      "OutsideDimension":73.0,
      "Dimension":-1.0,
      "LeftRebate":-1.0,
      "RightRebate":-1.0,
      "DistBetweenIsoBars":-1.0,
      "Depth":-1.0}]
    return of(doorleafArticle);
  }
  //#endregion
}
//#region Article Models
class DoorLeafArticle {
  ArticleId: number;
  ArticleGuid: string;
  Name: string;
  Unit: string;
  ArticleTypeId: number;
  CrossSectionUrl: string;
  Description: string;
  InsideDimension: number;
  OutsideDimension: number;
  Dimension: number;
  LeftRebate: number;
  RightRebate: number;
  DistBetweenIsoBars: number;
  Depth: number;
  // "ArticleId":12,
  // "ArticleGuid":"0eb57216-c19c-46f4-934e-b986f7c56f45",
  // "Name":"article__382200",
  // "Unit":"mm",
  // "ArticleTypeId":1,
  // "CrossSectionUrl":null,
  // "Description":"Outer Frame 382200",
  // "InsideDimension":125.0,
  // "OutsideDimension":150.0,
  // "Dimension":-1.0,
  // "LeftRebate":-1.0,
  // "RightRebate":-1.0,
  // "DistBetweenIsoBars":119.8,
  // "Depth":-75.0
}
class FacadeMullion {
  mullionArticleId: number;
  mullionDepth: number;
  moreInfo: string = '';
  constructor(articleId_mullion = null, depth_mullion = null, moreInfo = '') {
    this.mullionArticleId = articleId_mullion;
    this.mullionDepth = depth_mullion;
    this.moreInfo = moreInfo;
  }
}
class FacadeTransom {
  transomArticleId: number;
  transomDepth: number;
  moreInfo: string = '';
  constructor(articleId_transom = null, depth_transom = null, moreInfo = '') {
    this.transomArticleId = articleId_transom;
    this.transomDepth = depth_transom;
    this.moreInfo = moreInfo;
  }
}
class FacadeMullionReinforcement {
  value: number;
  material: string;
  moreInfo: string = '';
  constructor(val = null, mat = null, moreInfo = '') {
    this.value = val;
    this.material = mat;
    this.moreInfo = moreInfo;
  }
}
class FacadeUDC {
  transomArticleId: number;
  transomDepth: number;
  transomWidth: number;
  moreInfo: string = '';
  disabled: boolean
  constructor(articleId_transom = null, width_transom = null, depth_transom = null, disabled = false, moreInfo = '') {
    this.transomArticleId = articleId_transom;
    this.transomWidth = width_transom;
    this.transomDepth = depth_transom;
    this.disabled = disabled;
    this.moreInfo = moreInfo;
  }
}
//#endregion
