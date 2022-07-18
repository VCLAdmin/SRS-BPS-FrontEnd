import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { BpsUnifiedModel, DoorSystem, FacadeSection, FrameSystem, Geometry, ModelInput, OperabilitySystem, Section, SlidingDoorSystem, Structural, Thermal } from 'src/app/app-common/models/bps-unified-model';
import { BpsUnifiedProblem } from 'src/app/app-common/models/bps-unified-problem';
import { Feature } from 'src/app/app-core/models/feature';
import { PermissionService } from 'src/app/app-core/services/permission.service';
import { PanelsModule } from '../models/panels/panels.module';
import { ConfigureService } from './configure.service';
import { FramingService } from './framing.service';
import { _ } from '@biesbjerg/ngx-translate-extract/dist/utils/utils';
import { TranslateService } from '@ngx-translate/core';
import { LocalStorageService } from 'src/app/app-core/services/local-storage.service';

@Injectable({
  providedIn: 'root'
})

export class UnifiedModelService {
  constructor(
    //private cService: ConfigureService,
    private translate: TranslateService,
    private fService: FramingService,
    private pService: PermissionService,
    private localStorageService: LocalStorageService) {
  }
  handleDataList: any[];
  adsArticlesList: any[];
  slidingDoorsHandlesList: any[];
  feature = Feature;

  //#region Side Tables Updated
  doLoadJSON: boolean = true;
 /**
 * This function is to update the side table. 
 * 
 * @param {PanelsModule} panelsModule  which is the panel moule name that is the name of the side table which has to be updated.
 * 
 */
  public sideTableUpdated(panelsModule: PanelsModule) {
    this.setUnifiedModel(this.current_UnifiedModel);
    this.sujLoadSidePanel.next({ panelsModule: panelsModule, finishedLoading: true });
    setTimeout(() => {
      if (this.doLoadJSON) {
        setTimeout(() => {          
          this.callLoadJSON(this.doLoadJSON);
        }, 10);
      }
    }, 0);
  }
  //#endregion

  //#region Unified Model
  current_UnifiedModel!: BpsUnifiedModel;
  previous_UnifiedModel: string;
  private sujUnifiedModel = new Subject<BpsUnifiedModel>();
  obsUnifiedModel = this.sujUnifiedModel.asObservable();

 /**
 * This function is set the unified model across the application. 
 * 
 * @param {BpsUnifiedModel} unifiedModel  this is the current unified model which has to be set across the application.
 * 
 */
  public setUnifiedModel(unifiedModel: BpsUnifiedModel) {
    //this.cService.computeClickedSubject.next(false);
    //if (!unifiedModel.ModelInput.Thermal) { unifiedModel.ModelInput.Thermal = new Thermal(); }
    if (!unifiedModel.ModelInput.Geometry) { unifiedModel.ModelInput.Geometry = new Geometry(); }
    if (!unifiedModel.ModelInput.Geometry.Sections) { unifiedModel.ModelInput.Geometry.Sections = new Array<Section>(); }
    //if (!unifiedModel.ModelInput.Geometry.FacadeSections) { unifiedModel.ModelInput.Geometry.FacadeSections = new Array<FacadeSection>(); }
    if (!unifiedModel.ModelInput.Geometry.PanelSystems) { unifiedModel.ModelInput.Geometry.PanelSystems = []; }
    this.current_UnifiedModel = {...unifiedModel};    
    setTimeout(() => {
      this.sujUnifiedModel.next(unifiedModel);
    }, 10);
  }
  //#endregion

  //#region Project Guid
  current_ProjectGuid: string;
  previous_ProjectGuid: string;
  private sujPrjectGuid: Subject<string> = new Subject<string>();
  obsProjectGuid = this.sujPrjectGuid.asObservable();
 /**
 * This function is set the current Project Guid and Problem Guid across the application. 
 * 
 * @param {string} problemGuid  this is the current problem guid which has to be set across the application.
 * 
 */
  setProblemGuid(problemGuid: string) {
    if (this.current_ProjectGuid !== problemGuid)
      this.previous_ProjectGuid = problemGuid;
    this.current_ProjectGuid = problemGuid;
    this.sujPrjectGuid.next(problemGuid)
  }
  //#endregion

  //#region Unified Problem
  current_UnifiedProblem: BpsUnifiedProblem;
  previous_UnifiedProblem: BpsUnifiedProblem;
  private sujUnifiedProblem: Subject<BpsUnifiedProblem> = new Subject<BpsUnifiedProblem>();
  obsUnifiedProblem = this.sujUnifiedProblem.asObservable();
 /**
 * This function is set the unified problem across the application. 
 * 
 * @param {BpsUnifiedProblem} unifiedProblem  this is the current unified problem which has to be set across the application.
 * 
 */
  setUnifiedProblem(unifiedProblem: BpsUnifiedProblem) {
    if (!this.handleDataList)
      this.GetDoorHandleArticles();
    if (!this.adsArticlesList)
      this.GetADSArticlesList();
    if(!this.slidingDoorsHandlesList)
    this.GetSlidingDoorHandleArticles();
    if (this.current_UnifiedProblem !== unifiedProblem)
      this.previous_UnifiedProblem = unifiedProblem;
    this.current_UnifiedProblem = unifiedProblem;
    this.sujUnifiedProblem.next(unifiedProblem);
    this.setUnifiedModel(JSON.parse(unifiedProblem.UnifiedModel));
  }
  //#endregion

  //#region SaveUnifiedModel
  private sujSaveUnifiedModel: Subject<any> = new Subject<any>();
  obsSaveUnifiedModel = this.sujSaveUnifiedModel.asObservable();
 /**
 * This function is to save the unified Problem. 
 * 
 */
  callSaveUnifiedModel() {
    this.sujSaveUnifiedModel.next(true);
  }
  //#endregion

  //#region LoadSidePanels
  private sujLoadSidePanel: Subject<any> = new Subject<any>();
  obsLoadSidePanel = this.sujLoadSidePanel.asObservable();
  //#endregion
  
  //#region Load Display Setting
  private sujLoadDisplaySetting: Subject<any> = new Subject<any>();
  obsLoadDisplaySetting = this.sujLoadDisplaySetting.asObservable();
 /**
 * This function is to set the display settings. 
 * 
 */
  setLoadDisplaySetting() {
    this.sujLoadDisplaySetting.next();
  }
  //#endregion

  //#region Load JSON
  private sujLoadJSON: Subject<any> = new Subject<any>();
  obsLoadJSON = this.sujLoadJSON.asObservable();
 /**
 * This function is used to fire 3D viewer event to load the unified model and display the model in the viewer. 
 * 
 * @param {boolean} canBeDrawnBool it is the boolean value true or false to draw the model in 3D viewer.
 * 
 */
  callLoadJSON(canBeDrawnBool: boolean) {
    this.sujLoadJSON.next({ resetCamera: false, Unified3DModel: this.current_UnifiedModel, canBeDrawn: canBeDrawnBool });
  }
  //#endregion
  
  //#region Take Screen Shot
  takeScreenShot: boolean = false;
  private sujTakeScreenShot: Subject<any> = new Subject<any>();
  obsTakeScreenShot = this.sujTakeScreenShot.asObservable();
 /**
 * This function is used to take screenshot of the existing model in teh 3D Viewer. 
 * 
 * @param {boolean} takeScreenShot it is the boolean value true or false to take the screenshot of the model in 3D Viewer.
 * 
 */
  callTakeScreenShot(takeScreenShot: boolean) {
    this.takeScreenShot = takeScreenShot;
    this.sujTakeScreenShot.next(takeScreenShot);
  }
  //#endregion

  //#region Show Notificaion
  private sujNotificaionShow: Subject<any> = new Subject<any>();
  obsNotificaionShow = this.sujNotificaionShow.asObservable();
 /**
 * This function is used to set the notification to display. 
 * 
 * @param {any} event it is the object contains the notification title, message and the icon to display.
 * 
 */
  setNotificaionShow(event: any) {
    this.sujNotificaionShow.next(event);
  }
  //#endregion

  //#region just for referance
 /**
 * This function is used to update the unified model. 
 *  
 */
  updateUM() {
    let mi = this.current_UnifiedModel.ModelInput;
    let ge = mi.Geometry;
    let inf = ge.Infills;
    let os = ge.OperabilitySystems;
    let ds = ge.DoorSystems;
    let se = ge.Sections;
    let fs = ge.FacadeSections;
    let re = ge.Reinforcements;
    let ac = mi.FrameSystem.AluminumColor;
    let st = mi.FrameSystem.SystemType;

    //Operability Section:
    //1. Fixed/Opening
    os = os.map(x => { x.VentOpeningDirection = ''; return x });
    //2. OperableType
    os = os.map(x => { x.VentOperableType = ''; return x });

    //3. InsideHandle(Article Number).If Door Operable Type
    ds = ds.map(x => { x.InsideHandleArticleName = ''; return x });
    //4. InsideHandle(Color).If Door Operable Type
    ds = ds.map(x => { x.InsideHandleColor = ''; return x });
    //5. InsideHandle(Article Number).If Windows Operable Type
    os = os.map(x => { x.InsideHandleArticleName = ''; return x });
    //6. InsideHandle(Color).If Windows Operable Type
    os = os.map(x => { x.InsideHandleColor = ''; return x });
    //7. OutsideHandle(Article Number)
    ds = ds.map(x => { x.OutsideHandleArticleName = ''; return x });
    //8. OutsideHandle(Color)
    ds = ds.map(x => { x.OutsideHandleColor = ''; return x });

    //9. Hinge Type(Article Number)
    ds = ds.map(x => { x.HingeArticleName = ''; return x });
    //9.1. Hinge Type(Color)
    ds = ds.map(x => { x.HingeColor = ''; return x });

    //Outer Frame/Table
    se.filter(f => f.SectionID == 1 && f.SectionType == 1)[0].ArticleName;
    se.filter(f => f.SectionID == 1 && f.SectionType == 1)[0].DistBetweenIsoBars;
    se.filter(f => f.SectionID == 1 && f.SectionType == 1)[0].InsideDimension;
    se.filter(f => f.SectionID == 1 && f.SectionType == 1)[0].OutsideDimension;
    se.filter(f => f.SectionID == 1 && f.SectionType == 1)[0].InsideW;
    se.filter(f => f.SectionID == 1 && f.SectionType == 1)[0].OutsideW;


    //Framing Section:
    //----------------------------------------------------------------------------------------------
    //1. System Type
    st = '';


    //2. Outer Frame.Article Number will saved to
    os = os.map(x => { x.InsertOuterFrameArticleName = ''; return x });
    //2.1. Inside Dimension is saved to
    os = os.map(x => { x.InsertOuterFrameInsideW = 0; return x });
    //2.2. Outside Dimension is saved to
    os = os.map(x => { x.InsertOuterFrameOutsideW = 0; return x });
    //2.3. InsertOuterFrameDistBetweenIsoBars is saved to
    os = os.map(x => { x.InsertOuterFrameDistBetweenIsoBars = 0; return x });


    //3. Vent Frame.It is applicable only when the Windows operable type is selected and its article number is saved to
    os = os.map(x => { x.VentArticleName = ''; return x });
    //3.1. VentInsideDimension is saved to
    os = os.map(x => { x.VentInsideW = 0; return x });
    //3.2. VentOutsideDimension is saved to
    os = os.map(x => { x.VentOutsideW = 0; return x });
    //3.3. VentDistBetweenIsoBars is saved to
    os = os.map(x => { x.VentDistBetweenIsoBars = 0; return x });


    //4. Sill Profile Bottom.It Is applicable when the Door Operable Type is selected and Its article Number is saved to
    ds = ds.map(x => { x.DoorSillArticleName = ''; return x });
    //4.1. Sill Profile Bottom inside dimension is saved to
    ds = ds.map(x => { x.DoorSillInsideW = 0; return x });
    //4.2. Sill Profile Bottom outside dimension is saved to
    ds = ds.map(x => { x.DoorSillOutsideW = 0; return x });


    //5. Sill Profile Fixed Panel.It is applicable when the Mullion is added to the Door Operable Type and its article number is saved to
    ds = ds.map(x => { x.DoorSidelightSillArticleName = ''; return x });


    //6. Door Leaf Active Vent.It is applicable when the Door Operable type is applied and its article number is saved to
    ds = ds.map(x => { x.DoorLeafArticleName = ''; return x });
    //6.1. Inside Dimension is saved to
    ds = ds.map(x => { x.DoorLeafInsideW = 0; return x });
    //6.2. Outside Dimension is saved to
    ds = ds.map(x => { x.DoorLeafOutsideW = 0; return x });


    //7. Door Leaf Passive Jamb.It is applicable when the double door is applied and its articlenumber is saved to 
    ds = ds.map(x => { x.DoorPassiveJambArticleName = ''; return x });
    //7.1. InsideDimension is saved to
    ds = ds.map(x => { x.DoorPassiveJambInsideW = 0; return x });
    //7.2. OutsideDimension is saved to
    ds = ds.map(x => { x.DoorPassiveJambOutsideW = 0; return x });


    //8. Profile Color Is saved to
    ac = '';


    //9. Mullion.It is applicable when the Mullion is added and its article number, inside dimension, Outside dimension is saved to
    se.filter(f => f.SectionID == 2)[0].ArticleName = '';
    se.filter(f => f.SectionID == 2)[0].InsideDimension = '';
    se.filter(f => f.SectionID == 2)[0].InsideW = '';
    se.filter(f => f.SectionID == 2)[0].OutsideDimension = '';
    se.filter(f => f.SectionID == 2)[0].OutsideW = '';


    //10. Transom.It is applicable when the transom is added and its article number, Inside dimension, Outside Dimension is saved to 
    se.filter(f => f.SectionID == 3)[0].ArticleName = '';
    se.filter(f => f.SectionID == 3)[0].InsideDimension = '';
    se.filter(f => f.SectionID == 3)[0].InsideW = '';
    se.filter(f => f.SectionID == 3)[0].OutsideDimension = '';
    se.filter(f => f.SectionID == 3)[0].OutsideW = '';


    //11. Mullion Depth.It is saved to
    fs.filter(f => f.SectionType == 2)[0].ArticleName = '';
    fs.filter(f => f.SectionType == 2)[0].OutsideW = 0;
    fs.filter(f => f.SectionType == 2)[0].Depth = '';


    //12. Transom Depth.It is saved to
    fs.filter(f => f.SectionType == 3)[0].ArticleName = '';
    fs.filter(f => f.SectionType == 3)[0].OutsideW = 0;
    fs.filter(f => f.SectionType == 3)[0].Depth = '';


    //13. Intermediate Mullion Depth.It s saved to
    fs.filter(f => f.SectionType == 6)[0].ArticleName = '';
    fs.filter(f => f.SectionType == 6)[0].OutsideW = 0;
    fs.filter(f => f.SectionType == 6)[0].Depth = '';


    //14. Reinforcement is saved to
    re;

    //Glass and Panel:
    //----------------------------------------------------------------------------------------------
    //All the Panel and Glazing system is saved to
    inf = inf.map(x => { x.GlazingSystemID = 0; return x });
    inf = inf.map(x => { x.OperabilitySystemID = 0; return x });

    //this.sideTableUpdated();
  }
  //#endregion

  //#region FRAMING

  //#region Outer Frame

 /**
 * This function is used to get the Selected Outerframe Object. 
 * 
 * @returns {Section}  it returns the outerFrame object which is in the current unified model with the SectionId 1.
 * 
 */
  obj_OuterFrame(): Section {
      if (this.current_UnifiedModel.ModelInput.Geometry.Sections && this.current_UnifiedModel.ModelInput.Geometry.Sections.length > 0) {
        if (this.current_UnifiedModel.ProblemSetting.ProductType == "SlidingDoor") {
        return this.current_UnifiedModel.ModelInput.Geometry.Sections.filter(f => f.SectionID == 41 && f.SectionType == 41)[0];
      }
      else {
        return this.current_UnifiedModel.ModelInput.Geometry.Sections.filter(f => f.SectionID == 1 && f.SectionType == 1)[0];
      }
    }
  }

 /**
 * This function is used to get the OPerability system for the Selected Outerframe Object. 
 * 
 * @returns {OperabilitySystem}  it returns the operability system of the Current unified Model.
 * 
 */
  obj_OuterFrameOperabilitySystems(): OperabilitySystem {
    let os = this.current_UnifiedModel.ModelInput.Geometry.OperabilitySystems;
    if (os && os.length > 0)
      return os[0];
  }

 /**
 * This function is used to get the Selected Outerframe Article Name with the Inside width and Outside Width to display in the lef Panel under operability section. 
 * 
 * @returns {string}  it returns the Selected Outerframe Article Name with the Inside width and Outside Width to display in the lef Panel under operability section.
 * 
 */
  get_OuterFrame(): string {
    let sec = this.obj_OuterFrame();
    if (sec)
      return sec.ArticleName + ' - ' + sec.InsideW.toString() + ' / ' + sec.OutsideW.toString();
    else
    {
      let sec = this.obj_OuterFrameOperabilitySystems();
      if (sec)
        return sec.InsertOuterFrameArticleName + ' - ' + sec.InsertOuterFrameInsideW.toString() + ' / ' + sec.InsertOuterFrameOutsideW.toString();
    }
  }

 /**
 * This function is used to set the Selected Outerframe Article to the unified model. 
 * 
 * @param {any}  inputData which is the selected outerframe object which has to set to the unified model outer frame section.
 * 
 */
  set_OuterFrame(inputData: any) {
    if (inputData && this.current_UnifiedModel.ProblemSetting.ProductType == "Window") {
      let sectionClass = this.obj_OuterFrame();
      if (!sectionClass) sectionClass = new Section();
      // create section class for outer frame, mullion and transom information
      sectionClass.SectionID = 1;  // 1 for Outer Frame, 2 For Mullion, 3 For Transom
      sectionClass.SectionType = 1;  // same as sectionId
      sectionClass.ArticleName = inputData.description;
      sectionClass.InsideW = parseInt(inputData.inside);
      sectionClass.OutsideW = parseInt(inputData.outside);
      sectionClass.DistBetweenIsoBars = inputData.distBetweenIsoBars;
      sectionClass.Depth = inputData.depth;

      let os = this.current_UnifiedModel.ModelInput.Geometry.OperabilitySystems;
      if (os) {
        //2. Outer Frame.Article Number will saved to
        os = os.map(x => { x.InsertOuterFrameArticleName = sectionClass.ArticleName; return x });
        //2.1. Inside Dimension is saved to
        os = os.map(x => { x.InsertOuterFrameInsideW = sectionClass.InsideW; return x });
        //2.2. Outside Dimension is saved to
        os = os.map(x => { x.InsertOuterFrameOutsideW = sectionClass.OutsideW; return x });
        //2.3. InsertOuterFrameDistBetweenIsoBars is saved to
        os = os.map(x => { x.InsertOuterFrameDistBetweenIsoBars = sectionClass.DistBetweenIsoBars; return x });
        //2.4. Inside Depth is saved to
        //os = os.map(x => { x.InsertOuterFrameDepth = sectionClass.Depth; return x });
      }

      var inf = this.current_UnifiedModel.ModelInput.Geometry.Infills;
      if (inf) {
        inf = inf.map(x => { x.InsertOuterFrameDepth = sectionClass.Depth; return x });
      }
      this.sideTableUpdated(PanelsModule.OuterFrame);
    }
    else if (inputData && this.current_UnifiedModel.ProblemSetting.ProductType == "SlidingDoor") {
      let sectionClass = this.obj_OuterFrame();
      if (!sectionClass) sectionClass = new Section();
      // create section class for outer frame, mullion and transom information
      sectionClass.SectionID = 41;  // 41 for Outer Frame sliding door, 45 for bottom outer frame sliding door
      sectionClass.SectionType = 41;  // same as sectionId
      sectionClass.ArticleName = inputData.description;
      sectionClass.InsideW = parseInt(inputData.inside);
      sectionClass.OutsideW = parseInt(inputData.outside);
      sectionClass.Depth = inputData.depth;
      this.sideTableUpdated(PanelsModule.OuterFrame);
    }
  }

 /**
 * This function is used to get the Selected Bottom Outerframe Object for Sliding Doors. 
 * 
 * @returns {Section}  it returns the bottom outerFrame object which is in the current unified model with the SectionId 45.
 * 
 */
  obj_BottomOuterFrameSliding(): Section {
    if (this.current_UnifiedModel.ModelInput.Geometry.Sections) {
      return this.current_UnifiedModel.ModelInput.Geometry.Sections.filter(f => f.SectionID == 45 && f.SectionType == 45)[0];
    }
  }

 /**
 * This function is used to get the Selected Bottom Outerframe article name along with Inside width and Outside width for Sliding Doors. 
 * 
 * @returns {string}  it returns the Selected Bottom Outerframe article name along with Inside width and Outside width for Sliding Doors.
 * 
 */
  get_BottomOuterFrame() {
    let sec = this.obj_BottomOuterFrameSliding();
    if (sec) return sec.ArticleName + ' - ' + sec.InsideW.toString() + ' / ' + sec.OutsideW.toString();
    else return '';
  }

 /**
 * This function is used to set the Selected Bottom Outerframe Article to the unified model. 
 * 
 * @param {any}  inputData which is the selected bottom outerframe object which has to set to the unified model  bottom outer frame section.
 * 
 */
  set_BottomOuterFrame(inputData: any) {
    if (inputData && this.current_UnifiedModel.ProblemSetting.ProductType == "SlidingDoor") {
      let sectionClass = this.obj_BottomOuterFrameSliding();
      if (!sectionClass) sectionClass = new Section();
      // create section class for outer frame, mullion and transom information
      sectionClass.SectionID = 45;  // 41 for Outer Frame sliding door, 45 for Bottom Outer Frame sliding door
      sectionClass.SectionType = 45;  // same as sectionId
      sectionClass.ArticleName = inputData.description;
      sectionClass.InsideW = parseInt(inputData.inside);
      sectionClass.OutsideW = parseInt(inputData.outside);
      sectionClass.Depth = inputData.depth;

      this.sideTableUpdated(PanelsModule.BottomOuterFrameSliding);
    }
  }
  //#endregion

  //#region Vent Frame
 /**
 * This function is used to get the Selected VentFrame Article Name with the Inside width and Outside Width to display in the lef Panel under operability section. 
 * 
 * @returns {string}  it returns the Selected VentFrame Article Name with the Inside width and Outside Width to display in the lef Panel under operability section.
 * 
 */
  get_VentFrame(): string {
    if (this.current_UnifiedModel.ProblemSetting.ProductType == "SlidingDoor") {
      if (this.current_UnifiedModel.ModelInput.Geometry.Sections) {
        let os = this.current_UnifiedModel.ModelInput.Geometry.Sections.filter(f => f.SectionID == 43 && f.SectionType == 43)[0];
        if (os) return os.ArticleName + ' - ' + os.InsideW.toString() + ' / ' + os.OutsideW.toString();
        else return '';
      }  
    }
    else {
      if (this.current_UnifiedModel.ModelInput.Geometry.OperabilitySystems) {
        let os = this.current_UnifiedModel.ModelInput.Geometry.OperabilitySystems[0];
        if (os.VentArticleName && os.VentArticleName != '-1') {
          return os.VentArticleName + ' - ' + os.VentInsideW.toString() + ' / ' + os.VentOutsideW.toString();
        }
      }  
    }
  }

 /**
 * This function is used to set the Selected Vent frame Article to the unified model. 
 * 
 * @param {any}  inputData which is the selected Vent frame object which has to set to the unified model  Vent frame section.
 * 
 */
  set_VentFrame(inputData: any) {
    if (inputData) {
      if (this.current_UnifiedModel.ProblemSetting.ProductType == "SlidingDoor") {
        let sectionClass = this.current_UnifiedModel.ModelInput.Geometry.Sections.filter(f => f.SectionID == 43 && f.SectionType == 43)[0];
        if (!sectionClass) sectionClass = new Section();
        sectionClass.SectionID = 43;  // 43 for Vent Frame sliding door
        sectionClass.SectionType = 43;  // same as sectionId
        sectionClass.ArticleName = inputData.description;
        sectionClass.InsideW = parseInt(inputData.inside);
        sectionClass.OutsideW = parseInt(inputData.outside);
        sectionClass.Depth = inputData.depth;
      }
      else {
        let os = this.current_UnifiedModel.ModelInput.Geometry.OperabilitySystems;
        if (os) {
          //3. Vent Frame.It is applicable only when the Windows operable type is selected and its article number is saved to
          os = os.map(x => { x.VentArticleName = inputData.description; return x });
          //3.1. VentInsideDimension is saved to
          os = os.map(x => { x.VentInsideW = parseInt(inputData.inside); return x });
          //3.2. VentOutsideDimension is saved to
          os = os.map(x => { x.VentOutsideW = parseInt(inputData.outside); return x });
          //3.3. VentDistBetweenIsoBars is saved to
          os = os.map(x => { x.VentDistBetweenIsoBars = inputData.distBetweenIsoBars; return x });
        }  
      }
      this.sideTableUpdated(PanelsModule.VentFrame);
    }
  }
  //#endregion

  //#region Interlock Profile

 /**
 * This function is used to get the Selected Interlock Object for Sliding Doors. 
 * 
 * @returns {Section}  it returns the Interlock object which is in the current unified model with the SectionId 42.
 * 
 */
  obj_InterlockSliding(): Section {
    if (this.current_UnifiedModel.ModelInput.Geometry.Sections) {
      return this.current_UnifiedModel.ModelInput.Geometry.Sections.filter(f => f.SectionID == 42 && f.SectionType == 42)[0];
    }
  }

 /**
 * This function is used to get the Selected Interlock article name along with Inside width and Outside width for Sliding Doors. 
 * 
 * @returns {string}  it returns the Selected Interlock article name along with Inside width and Outside width for Sliding Doors.
 * 
 */
  get_Interlock(): string {
    let os = this.obj_InterlockSliding();
    if (os) return os.ArticleName + ' - ' + os.InsideW.toString() + ' / ' + os.OutsideW.toString();
    else return '';
  }

 /**
 * This function is used to set the Selected Interlock Frame Article to the unified model. 
 * 
 * @param {any}  inputData which is the selected Interlock frame object which has to set to the unified model  Interlock frame section.
 * 
 */
  set_InterlockFrame(inputData: any) {
    if (inputData) {
      let sectionClass = this.obj_InterlockSliding();
      if (!sectionClass) sectionClass = new Section();
      // create section class for outer frame, mullion and transom information
      sectionClass.SectionID = 42;  // 41 for Interlock sliding door
      sectionClass.SectionType = 42;  // same as sectionId
      sectionClass.ArticleName = inputData.description;
      sectionClass.InsideW = parseInt(inputData.inside);
      sectionClass.OutsideW = parseInt(inputData.outside);
      sectionClass.Depth = inputData.depth;

      this.sideTableUpdated(PanelsModule.InterlockSliding);
    }
  }
  //#endregion

  //#region double vent frame

 /**
 * This function is used to get the Selected Double Vent Frame article name along with Inside width and Outside width for Sliding Doors. 
 * 
 * @returns {string}  it returns the Selected Double Vent Frame article name along with Inside width and Outside width for Sliding Doors.
 * 
 */ 
  get_DoubleVentFrame() {
    if (this.current_UnifiedModel.ModelInput.Geometry.SlidingDoorSystems) {
      return this.current_UnifiedModel.ModelInput.Geometry.SlidingDoorSystems[0].DoubleVentArticleName;
    }
  }

 /**
 * This function is used to set the Selected DoubleVent Frame Article to the unified model. 
 * 
 * @param {any}  inputData which is the selected DoubleVent frame object which has to set to the unified model  DoubleVent frame section.
 * 
 */
  set_DoubleVentFrame(inputData : any) {
    if (inputData) {
      let os = this.current_UnifiedModel.ModelInput.Geometry.SlidingDoorSystems;
      if (os) {
        os = os.map(x => { x.DoubleVentArticleName = inputData.description; return x });
      }
      this.sideTableUpdated(PanelsModule.DoubleVentSliding);
    }
  }
  //#endregion

  //#region structural profile

 /**
 * This function is used to get the Selected Structural article name. 
 * 
 * @returns {string}  it returns the Selected Structural article name.
 * 
 */ 
  get_StucturalProfile() {
    if (this.current_UnifiedModel.ModelInput.Geometry.SlidingDoorSystems) {
      return this.current_UnifiedModel.ModelInput.Geometry.SlidingDoorSystems[0].StructuralProfileArticleName;
    }
  }

 /**
 * This function is used to set the Selected Structural Profile article to the unified model. 
 * 
 * @param {any}  inputData which is the selected Structural Profile object which has to set to the unified model Structural Profile section.
 * 
 */
  set_structuralProfile(inputData : any) {
    if (inputData) {
      let os = this.current_UnifiedModel.ModelInput.Geometry.SlidingDoorSystems;
      if (os) {
        os = os.map(x => { x.StructuralProfileArticleName = inputData.description; return x });
      }
      this.sideTableUpdated(PanelsModule.StrucuralSliding);
    }
  }
  //#endregion

  //#region Reinforcement Profile
 
 /**
 * This function is used to get the Selected Reinforcement Object for Sliding Doors. 
 * 
 * @returns {any}  it returns the Selected Reinforcement Object for Sliding Doors.
 * 
 */
  get_Reinforcement(): any {
    if (this.current_UnifiedModel.ModelInput.Geometry.SlidingDoorSystems) {
      let os = this.current_UnifiedModel.ModelInput.Geometry.SlidingDoorSystems[0];
      return {bool: os.InterlockReinforcement, SteelTube: os.SteelTubeArticleName};
    }
  }

 /**
 * This function is used to set the Selected Reinforcement object to the unified model. 
 * 
 * @param {any}  inputData which is the selected Reinforcement object which has to set to the unified model Reinforcement section.
 * 
 */
  set_ReinforcementFrame(inputData : any) {
    if (inputData) {
      let os = this.current_UnifiedModel.ModelInput.Geometry.SlidingDoorSystems;
      if (os) {
        os = os.map(x => { x.SteelTubeArticleName = inputData.description; return x });
      }
      this.sideTableUpdated(PanelsModule.ReinforcementSliding);
    }
  }
 
 /**
 * This function is used to set the Selected Reinforcement bool frame object to the unified model. 
 * 
 * @param {any}  inputData which is the selected Reinforcement bool frame object which has to set to the unified model Reinforcement section.
 * 
 */
  set_ReinforcementBoolFrame(reinforcementBool: any) {
    let os = this.current_UnifiedModel.ModelInput.Geometry.SlidingDoorSystems;
    if (os) {
      os = os.map(x => { x.InterlockReinforcement = reinforcementBool; return x });
      if (reinforcementBool) {
        os = os.map(x => { x.SteelTubeArticleName = "201056"; return x });
      }
      else {
        os = os.map(x => { x.SteelTubeArticleName = null; return x });
      }
      this.sideTableUpdated(PanelsModule.ReinforcementSliding);
    }
  }
  //#endregion

  //#region Mullion

 /**
 * This function is used to get the Selected Mullion Object. 
 * 
 * @returns {Section}  it returns the Mullion object which is in the current unified model with the SectionId 2.
 * 
 */
  obj_Mullion(): Section {
      if (this.current_UnifiedModel.ModelInput.Geometry.Sections && this.current_UnifiedModel.ModelInput.Geometry.Sections.length > 0) {
      return this.current_UnifiedModel.ModelInput.Geometry.Sections.filter(f => f.SectionID == 2 && f.SectionType == 2)[0];
    }
  }

 /**
 * This function is used to get the Selected Mullion article name along with Inside width and Outside width. 
 * 
 * @returns {string}  it returns the Selected Mullion article name along with Inside width and Outside width.
 * 
 */
  get_Mullion(): string {
    if (this.current_UnifiedModel.ModelInput.Geometry.Sections && this.current_UnifiedModel.ModelInput.Geometry.Sections.filter(f => f.SectionID == 2 && f.SectionType == 2).length > 0) {
      let sec = this.obj_Mullion();
      if (sec)
      return sec.ArticleName + ' - ' + sec.InsideW.toString() + ' / ' + sec.OutsideW.toString();
    } else {
      return '';
    }
  }

 /**
 * This function is used to set the Selected Mullion object to the unified model. 
 * 
 * @param {any}  inputData which is the selected mullion object which has to set to the unified model mullion section.
 * 
 */
  set_Mullion(inputData: any) {
    if (inputData && this.current_UnifiedModel.ProblemSetting.ProductType == "Window") {
      let sectionClass = this.obj_Mullion();
      let isSectionEmpty = false;
      if (!sectionClass) {
        isSectionEmpty = true;
        sectionClass = new Section();
      }
      sectionClass.SectionID = 2;
      sectionClass.SectionType = 2;
      let article = inputData.article;
      let isCustomed = inputData.isCustomed;
      if (isCustomed && article) {
        sectionClass.Ao = article.Ao;
        sectionClass.ArticleName = article.ArticleName;
        sectionClass.Au = article.Au;
        sectionClass.Cn20 = article.Cn20;
        sectionClass.Cp20 = article.Cp20;
        sectionClass.Cp80 = article.Cp80;
        sectionClass.InsideW = article.InsideW;
        sectionClass.Io = article.Io;
        sectionClass.Ioyy = article.Ioyy;
        sectionClass.Iu = article.Iu;
        sectionClass.Iuyy = article.Iuyy;
        sectionClass.OutsideW = article.OutsideW;
        sectionClass.RSn20 = article.RSn20;
        sectionClass.RSp80 = article.RSp80;
        sectionClass.RTn20 = article.RTn20;
        sectionClass.RTp80 = article.RTp80;
        sectionClass.SectionID = article.SectionID;
        sectionClass.SectionType = article.SectionType;
        sectionClass.Weight = article.Weight;
        sectionClass.Zol = article.Zol;
        sectionClass.Zoo = article.Zoo;
        sectionClass.Zor = article.Zor;
        sectionClass.Zou = article.Zou;
        sectionClass.Zul = article.Zul;
        sectionClass.Zuo = article.Zuo;
        sectionClass.Zur = article.Zur;
        sectionClass.Zuu = article.Zuu;
        sectionClass.d = article.d;
        sectionClass.isCustomProfile = article.isCustomProfile;
        sectionClass.Depth = article.Depth;
      }
      else {
        if (article) {
          sectionClass.ArticleName = article.description;
          sectionClass.InsideW = parseInt(article.inside);
          sectionClass.OutsideW = parseInt(article.outside.context.value);
          sectionClass.DistBetweenIsoBars = article.data.DistBetweenIsoBars;
          sectionClass.Depth = article.data.Depth;
        }
      }
      if (isSectionEmpty && this.current_UnifiedModel.ModelInput.Geometry.Sections.filter(f => f.SectionID == 2).length == 0) {
        this.current_UnifiedModel.ModelInput.Geometry.Sections.push(sectionClass);
      }
      this.sideTableUpdated(PanelsModule.Mullion);
    }
  }
  //#endregion

  //#region Transom

 /**
 * This function is used to get the Selected Transom Object. 
 * 
 * @returns {Section}  it returns the Transom object which is in the current unified model with the SectionId 3.
 * 
 */
  obj_Transom(): Section {
    if (this.current_UnifiedModel.ModelInput.Geometry.Sections.length > 0) {
      return this.current_UnifiedModel.ModelInput.Geometry.Sections.filter(f => f.SectionID == 3 && f.SectionType == 3)[0];
    }
  }

 /**
 * This function is used to get the Selected Transom article name along with Inside width and Outside width. 
 * 
 * @returns {string}  it returns the Selected Transom article name along with Inside width and Outside width.
 * 
 */
  get_Transom(): string {
    if (this.current_UnifiedModel.ModelInput.Geometry.Sections && this.current_UnifiedModel.ModelInput.Geometry.Sections.filter(f => f.SectionID == 3 && f.SectionType == 3).length > 0) {
      let sec = this.obj_Transom();
      if (sec)
      return sec.ArticleName + ' - ' + sec.InsideW.toString() + ' / ' + sec.OutsideW.toString();
    }
    else {
      return '';
    }
  }

 /**
 * This function is used to set the Selected Transom object to the unified model. 
 * 
 * @param {any}  inputData which is the selected Transom object which has to set to the unified model Transom section.
 * 
 */
  set_Transom(inputData: any) {
    if (inputData && this.current_UnifiedModel.ProblemSetting.ProductType == "Window") {
      let sectionClass = this.obj_Transom();
      if (!sectionClass) sectionClass = new Section();
      let article = inputData.article;
      let isCustomed = inputData.isCustomed;
      sectionClass.SectionID = 3;
      sectionClass.SectionType = 3;
      if (isCustomed && article) {
        sectionClass.Ao = article.Ao;
        sectionClass.ArticleName = article.ArticleName;
        sectionClass.Au = article.Au;
        sectionClass.Cn20 = article.Cn20;
        sectionClass.Cp20 = article.Cp20;
        sectionClass.Cp80 = article.Cp80;
        sectionClass.InsideW = article.InsideW;
        sectionClass.Io = article.Io;
        sectionClass.Ioyy = article.Ioyy;
        sectionClass.Iu = article.Iu;
        sectionClass.Iuyy = article.Iuyy;
        sectionClass.OutsideW = article.OutsideW;
        sectionClass.RSn20 = article.RSn20;
        sectionClass.RSp80 = article.RSp80;
        sectionClass.RTn20 = article.RTn20;
        sectionClass.RTp80 = article.RTp80;
        sectionClass.SectionID = article.SectionID;
        sectionClass.SectionType = article.SectionType;
        sectionClass.Weight = article.Weight;
        sectionClass.Zol = article.Zol;
        sectionClass.Zoo = article.Zoo;
        sectionClass.Zor = article.Zor;
        sectionClass.Zou = article.Zou;
        sectionClass.Zul = article.Zul;
        sectionClass.Zuo = article.Zuo;
        sectionClass.Zur = article.Zur;
        sectionClass.Zuu = article.Zuu;
        sectionClass.d = article.d;
        sectionClass.isCustomProfile = article.isCustomProfile;
        sectionClass.Depth = article.Depth;
      }
      else {
        if (article) {
          sectionClass.ArticleName = article.description;
          sectionClass.InsideW = parseInt(article.inside);
          sectionClass.OutsideW = parseInt(article.outside.context.value);
          sectionClass.DistBetweenIsoBars = article.data.DistBetweenIsoBars;
          sectionClass.Depth = article.data.Depth;
        }
      }
      this.sideTableUpdated(PanelsModule.Transom);
      // if (this.current_UnifiedModel.ModelInput.Geometry.DoorSystems === null) {
      //   this.sectionClassArray.splice(3, 2);
      // }
    }
  }
  //#endregion

  //#region Reinforcement
  // obj_Reinforcement(): any {
  //   if (this.current_UnifiedModel.ModelInput.Geometry.Sections.length > 0) {
  //     return this.current_UnifiedModel.ModelInput.Geometry.Sections.filter(f => f.SectionID == 3 && f.SectionType == 3)[0];
  //   }
  // }
  // get_Reinforcement(): string {
  //   if (this.current_UnifiedModel.ModelInput.Geometry.Sections.length > 0) {
  //     let sec = this.obj_Reinforcement();
  //     if(sec)
  //     return sec.ArticleName + ' - ' + sec.InsideW.toString() + ' / ' + sec.OutsideW.toString();
  //   }
  // }
  // set_Reinforcement(inputData: any) {
  // }
  //#endregion

  //#region Mullion Depth

 /**
 * This function is used to get the Selected Mullion Depth Object. 
 * 
 * @returns {Section}  it returns the Mullion Depth object which is in the current unified model with the Facade SectionId 1.
 * 
 */
  obj_MullionDepth(): FacadeSection {
    if (this.current_UnifiedModel.ModelInput.Geometry.FacadeSections) {
      return this.current_UnifiedModel.ModelInput.Geometry.FacadeSections.filter(section => section.SectionID == 1)[0];
    }
  }

 /**
 * This function is used to get the Selected Mullion depth article name along with depth. 
 * 
 * @returns {string}  it returns the Selected Mullion depth article name along with depth.
 * 
 */
  get_MullionDepth(): string {
    if (this.current_UnifiedModel.ModelInput.Geometry.FacadeSections) {
      let sec = this.obj_MullionDepth();
      if (sec)
      return sec.ArticleName + ' - ' + sec.Depth.toString();
    }
  }

 /**
 * This function is used to set the Selected mullion depth object to the unified model. 
 * 
 * @param {any}  inputData which is the selected mullion depth object which has to set to the unified model Mullion depth facade section.
 * 
 */
  set_MullionDepth(inputData: any) {
    if (inputData &&
      this.current_UnifiedModel.ProblemSetting.ProductType == "Facade" &&
      this.current_UnifiedModel.ProblemSetting.FacadeType == 'mullion-transom') {
      let sectionClass = this.obj_MullionDepth(); //  && f.SectionType == 1 ???
      if (!sectionClass) sectionClass = new FacadeSection();
      let article = inputData.article;
      let isCustomed = inputData.isCustomed;
      if (isCustomed && article) {
      }
      else {
        if (article && this.current_UnifiedModel.ModelInput.Geometry.FacadeSections) {
          if (!this.current_UnifiedModel.ModelInput.Thermal) { this.current_UnifiedModel.ModelInput.Thermal = new Thermal(); }
          this.current_UnifiedModel.ModelInput.Thermal.InsulationZone = this.current_UnifiedModel.ModelInput.FrameSystem.InsulationZone;
          sectionClass.ArticleName = article.mullionArticleId.toString();
          sectionClass.Depth = article.mullionDepth;
          this.setLoadDisplaySetting();
        }
      }
    }
  }
  //#endregion

  //#region Transom Depth

 /**
 * This function is used to get the Selected Transom Depth Object. 
 * 
 * @returns {Section}  it returns the Transom Depth object which is in the current unified model with the Facade SectionId 2.
 * 
 */
  obj_TransomDepth(): FacadeSection {
    if (this.current_UnifiedModel.ModelInput.Geometry.FacadeSections) {
      //  && f.SectionType == 2 ???
      return this.current_UnifiedModel.ModelInput.Geometry.FacadeSections.filter(section => section.SectionID == 2)[0];
    }
  }

 /**
 * This function is used to get the Selected Transom depth article name along with depth. 
 * 
 * @returns {string}  it returns the Selected Transom depth article name along with depth.
 * 
 */
  get_TransomDepth(): string {
    if (this.current_UnifiedModel.ModelInput.Geometry.FacadeSections) {
      let sec = this.obj_TransomDepth();
      if (sec)
      return sec.ArticleName + ' - ' + sec.Depth.toString();
    }
  }

 /**
 * This function is used to set the Selected Transom depth object to the unified model. 
 * 
 * @param {any}  inputData which is the selected Transom depth object which has to set to the unified model Transom depth facade section.
 * 
 */
  set_TransomDepth(inputData: any) {
    if (inputData &&
      this.current_UnifiedModel.ProblemSetting.ProductType == "Facade" &&
      this.current_UnifiedModel.ProblemSetting.FacadeType == 'mullion-transom') {
      let sectionClass = this.obj_TransomDepth();
      if (!sectionClass) sectionClass = new FacadeSection();
      let article = inputData.article;
      let isCustomed = inputData.isCustomed;
      if (isCustomed && article) {
      }
      else {
        if (article && this.current_UnifiedModel.ModelInput.Geometry.FacadeSections) {
          if (!this.current_UnifiedModel.ModelInput.Thermal) { this.current_UnifiedModel.ModelInput.Thermal = new Thermal(); }
          this.current_UnifiedModel.ModelInput.Thermal.InsulationZone = this.current_UnifiedModel.ModelInput.FrameSystem.InsulationZone;
          sectionClass.ArticleName = article.transomArticleId.toString();
          sectionClass.Depth = article.transomDepth;
          this.setLoadDisplaySetting();
        }
      }
    }
  }
  //#endregion

  //#region Intermediate Transom Depth

 /**
 * This function is used to get the Selected Intermediate Transom Depth Object. 
 * 
 * @returns {Section}  it returns the Intermediate Transom Depth object which is in the current unified model with the Facade SectionId 5.
 * 
 */
  obj_IntermediateTransomDepth(): FacadeSection {
    if (this.current_UnifiedModel.ModelInput.Geometry.FacadeSections) {
      // && section.SectionType == 24
      return this.current_UnifiedModel.ModelInput.Geometry.FacadeSections.filter(section => section.SectionID == 5)[0];
    }
  }

 /**
 * This function is used to get the Selected Intermediate Transom depth article name along with depth. 
 * 
 * @returns {string}  it returns the Selected Intermediate Transom depth article name along with depth.
 * 
 */
  get_IntermediateTransomDepth(): string {
    let sec = this.obj_IntermediateTransomDepth();
    if (sec)
    return sec.ArticleName + ' - ' + sec.Depth.toString();
  }

 /**
 * This function is used to set the Selected Intermediate Transom depth object to the unified model. 
 * 
 * @param {any}  inputData which is the selected Intermediate Transom depth object which has to set to the unified model Intermediate Transom depth facade section.
 * 
 */
  set_IntermediateTransomDepth(inputData: any) {
    if (inputData) {
      var fsections = this.obj_IntermediateTransomDepth();
      this.buildFramingSection(inputData, fsections);
    }
  }
  //#endregion

  //#region Intermediate Mullion Depth

 /**
 * This function is used to get the Selected Intermediate Mullion Depth Object. 
 * 
 * @returns {FacadeSection}  it returns the Intermediate Mullion Depth object which is in the current unified model with the Facade SectionId 3.
 * 
 */
  obj_IntermediateMullionDepth(): FacadeSection {
    if (this.current_UnifiedModel.ProblemSetting.ProductType == "Facade" && this.current_UnifiedModel.ModelInput.Geometry.FacadeSections) {
      if (this.current_UnifiedModel.ProblemSetting.FacadeType == 'mullion-transom') {
        return this.current_UnifiedModel.ModelInput.Geometry.FacadeSections.filter(section => section.SectionID == 3)[0];
      }
      else if (this.current_UnifiedModel.ProblemSetting.FacadeType == 'UDC') {
        return this.current_UnifiedModel.ModelInput.Geometry.FacadeSections.filter(section => section.SectionID == 4)[0]; // && section.SectionType == 25
      }
    }
  }

 /**
 * This function is used to get the Selected Intermediate Mullion depth article name along with depth. 
 * 
 * @returns {string}  it returns the Selected Intermediate Mullion depth article name along with depth.
 * 
 */
  get_IntermediateMullionDepth(): string {
    let sec = this.obj_IntermediateMullionDepth();
    if (sec)
    return sec.ArticleName + ' - ' + sec.Depth.toString();
  }

 /**
 * This function is used to set the Selected Intermediate Mullion depth object to the unified model. 
 * 
 * @param {any}  inputData which is the selected Intermediate Mullion depth object which has to set to the unified model Intermediate Mullion depth facade section.
 * 
 */
  set_IntermediateMullionDepth(inputData: any) {
    if (inputData && this.current_UnifiedModel.ProblemSetting.ProductType == "Facade") {
      let article = inputData.article;
      let isCustomed = inputData.isCustomed;
      if (this.current_UnifiedModel.ProblemSetting.FacadeType == 'mullion-transom') {
        if (isCustomed && article) {
        }
        else {
          if (article && this.current_UnifiedModel.ModelInput.Geometry.FacadeSections) {
            if (!this.current_UnifiedModel.ModelInput.Thermal) { this.current_UnifiedModel.ModelInput.Thermal = new Thermal(); }
            this.current_UnifiedModel.ModelInput.Thermal.InsulationZone = this.current_UnifiedModel.ModelInput.FrameSystem.InsulationZone;
            var fsections = this.obj_IntermediateMullionDepth();
            fsections.ArticleName = article.transomArticleId.toString();
            fsections.Depth = article.transomDepth;
            this.setLoadDisplaySetting();
          } else {
            // var fsections = this.current_UnifiedModel.ModelInput.Geometry.FacadeSections.filter(section => section.SectionID == 3)[0];
            // fsections.ArticleName = undefined;
            // fsections.Depth = 0;
            if (this.current_UnifiedModel.ModelInput.Geometry.Members.filter(f => f.SectionID === 3 && f.MemberType == 6).length > 0)
              this.setNotificaionShow({ title: "Warning", message: "Selected Mullion depth is too small to accommodate an Intermediate Mullion. Before computing, please choose a deeper Mullion depth or remove Intermediate Mullions from your configuration.", logoToShow: "Warning" });
          }
        }
      }
      //add intermediate mullion depth only for unitized
      else if (this.current_UnifiedModel.ProblemSetting.FacadeType == 'UDC') {
        var sections = this.obj_IntermediateMullionDepth();
        //add intermediate transom depth only for unitized
        this.buildFramingSection(inputData, sections);
      }
    }
  }
  //#endregion

  //#region Frame Sections

 /**
 * This function is used to get the Selected top frame section Object. 
 * 
 * @returns {FacadeSection}  it returns the top frame section object which is in the current unified model with the Facade SectionId 1 and Section Type 21.
 * 
 */
  obj_topFrameSection(): FacadeSection {
    if (this.current_UnifiedModel.ModelInput.Geometry.FacadeSections) {
      return this.current_UnifiedModel.ModelInput.Geometry.FacadeSections.filter(section => section.SectionID == 1)[0]; // && section.SectionType == 21
    }
  }

 /**
 * This function is used to get the Selected Vertical frame section Object. 
 * 
 * @returns {FacadeSection}  it returns the Vertical frame section object which is in the current unified model with the Facade SectionId 2 and Section Type 22.
 * 
 */
  obj_verticleFrameSection(): FacadeSection {
    if (this.current_UnifiedModel.ModelInput.Geometry.FacadeSections) {
      return this.current_UnifiedModel.ModelInput.Geometry.FacadeSections.filter(section => section.SectionID == 2)[0]; // && section.SectionType == 22
    }
  }

 /**
 * This function is used to get the Selected bottom frame section Object. 
 * 
 * @returns {FacadeSection}  it returns the bottom frame section object which is in the current unified model with the Facade SectionId 3 and Section Type 23.
 * 
 */
  obj_bottomFrameSection(): FacadeSection {
    if (this.current_UnifiedModel.ModelInput.Geometry.FacadeSections) {
      return this.current_UnifiedModel.ModelInput.Geometry.FacadeSections.filter(section => section.SectionID == 3)[0]; // && section.SectionType == 23
    }
  }
  //#endregion

  //#region UDC Framing Depth

 /**
 * This function is used to get the Selected UDC Framing depth article name along with depth. 
 * 
 * @returns {string}  it returns the Selected UDC Framing depth article name along with depth.
 * 
 */
  get_UDCFramingDepth(): string {
    if (this.current_UnifiedModel.ProblemSetting.ProductType == "Facade" && this.current_UnifiedModel.ModelInput.Geometry.FacadeSections) {
      let tfsections = this.obj_topFrameSection();
      return tfsections.ArticleName + ' - ' + tfsections.Depth.toString();

      // let vfsections = this.obj_verticleFrameSection();
      // return vfsections.ArticleName + ' - ' + vfsections.Depth.toString();

      // if (this.current_UnifiedModel.ModelInput.FrameSystem.HorizontalJointWidth < 20) {
      //   var bfsections = this.obj_bottomFrameSection();
      //   return bfsections.ArticleName + ' - ' + bfsections.Depth.toString();
      // }
    }
  }
  //#endregion

  //#region UDC Framing

 /**
 * This function is used to set the Selected UDC Framing depth object to the unified model. 
 * 
 * @param {any}  inputData which is the selected UDC Framing depth object which has to set to the unified model UDC Framing depth facade section.
 * 
 */
  set_UDCFraming(inputData: any) {
    if (inputData) {
      var tfsections = this.obj_topFrameSection();
      var vfsections = this.obj_verticleFrameSection();
      this.buildFramingSection(inputData, tfsections, true);
      this.buildFramingSection(inputData, vfsections, true);
      this.setBottomFraming();
      if (this.current_UnifiedModel.ModelInput.FrameSystem.HorizontalJointWidth < 20) {
        var bfsections = this.obj_bottomFrameSection();
        if (bfsections) {
          this.buildFramingSection(inputData, bfsections, true);
        }
      }
      if (inputData && this.current_UnifiedModel.ModelInput.Geometry.FacadeSections) {
        if (!this.current_UnifiedModel.ModelInput.Thermal) { this.current_UnifiedModel.ModelInput.Thermal = new Thermal(); }
        this.current_UnifiedModel.ModelInput.Thermal.InsulationZone = this.current_UnifiedModel.ModelInput.FrameSystem.InsulationZone;
        this.setLoadDisplaySetting();
      }
    }
  }
  //#endregion

  //#region Profile Color

 /**
 * This function is used to get the Selected Profile Color. 
 * 
 * @returns {string}  it returns the selected profile Color from the current unified model.
 * 
 */
  obj_ProfileColor(): string {
    return this.current_UnifiedModel.ModelInput.FrameSystem.AluminumColor;
  }

 /**
 * This function is used to get the Selected Profile Color. 
 * 
 * @returns {string}  it returns the selected profile Color from the current unified model.
 * 
 */
  get_ProfileColor(): string {
    return this.obj_ProfileColor();
  }

 /**
 * This function is used to set the Profile color to the unified model. 
 * 
 * @param {any}  inputData which is the selected Profile color which has to set to the unified model.
 * 
 */
  set_ProfileColor(inputData: any) {
    if (this.pService.checkPermission(Feature.ProfileColor)) {
      if (inputData) {
        this.current_UnifiedModel.ModelInput.FrameSystem.AluminumColor = inputData.description;
        this.sideTableUpdated(PanelsModule.ProfileColor);
      }
    }
  }
  //#endregion

  //#region Door Leaf Active

 /**
 * This function is used to get the Selected Door Leaf Active Object. 
 * 
 * @returns {DoorSystem}  it returns the selected Door Leaf Active Object from the current unified model.
 * 
 */
  obj_DoorLeafActive(): DoorSystem {
    if (this.current_UnifiedModel.ModelInput.Geometry.DoorSystems) {
      return this.current_UnifiedModel.ModelInput.Geometry.DoorSystems[0];
    }
  }

 /**
 * This function is used to get the Selected Door Leaf active Article Name with Inside and Outside Depths. 
 * 
 * @returns {string}  it returns the selected door leaf active article name with inside and outside depths from the current unified model.
 * 
 */
  get_DoorLeafActive(): string {
    let ds = this.obj_DoorLeafActive();
    if (ds)
      return ds.DoorLeafArticleName + ' - ' + ds.DoorLeafInsideW + ' / ' + ds.DoorLeafOutsideW;
  }

 /**
 * This function is used to set the Door leaf active object to the unified model. 
 * 
 * @param {any}  inputData which is the selected door leaf active object which has to set to the unified model.
 * 
 */
  set_DoorLeafActive(inputData: any) {
    if (inputData) {
      let ds = this.current_UnifiedModel.ModelInput.Geometry.DoorSystems;
      if (ds) {
        //6. Door Leaf Active Vent.It is applicable when the Door Operable type is applied and its article number is saved to
        ds = ds.map(x => { x.DoorLeafArticleName = inputData.description; return x });
        //6.1. Inside Dimension is saved to
        ds = ds.map(x => { x.DoorLeafInsideW = inputData.inside; return x });
        //6.2. Outside Dimension is saved to
        ds = ds.map(x => { x.DoorLeafOutsideW = inputData.outside; return x });
        this.sideTableUpdated(PanelsModule.DoorLeafActive);
      }
    }
  }
  //#endregion

  //#region Door Leaf Passive

 /**
 * This function is used to get the Selected Door Leaf Passive Object. 
 * 
 * @returns {DoorSystem}  it returns the selected Door Leaf Passive Object from the current unified model.
 * 
 */
  obj_DoorLeafPassive(): DoorSystem {
    if (this.current_UnifiedModel.ModelInput.Geometry.DoorSystems) {
      return this.current_UnifiedModel.ModelInput.Geometry.DoorSystems[0];
    }
  }

 /**
 * This function is used to get the Selected Door Leaf passive Article Name with Inside and Outside Depths. 
 * 
 * @returns {string}  it returns the selected door leaf passive article name with inside and outside depths from the current unified model.
 * 
 */
  get_DoorLeafPassive(): string {
    let ds = this.obj_DoorLeafPassive();
    if (ds)
      return ds.DoorPassiveJambArticleName + ' - ' + ds.DoorPassiveJambInsideW + ' / ' + ds.DoorPassiveJambOutsideW;
  }

 /**
 * This function is used to set the Door leaf passive object to the unified model. 
 * 
 * @param {any}  inputData which is the selected door leaf passive object which has to set to the unified model.
 * 
 */
  set_DoorLeafPassive(inputData: any) {
    if (inputData) {
      let ds = this.current_UnifiedModel.ModelInput.Geometry.DoorSystems;
      if (ds) {
        //7. Door Leaf Passive Jamb.It is applicable when the double door is applied and its articlenumber is saved to 
        ds = ds.map(x => { x.DoorPassiveJambArticleName = inputData.description; return x });
        //7.1. InsideDimension is saved to
        ds = ds.map(x => { x.DoorPassiveJambInsideW = inputData.inside; return x });
        //7.2. OutsideDimension is saved to
        ds = ds.map(x => { x.DoorPassiveJambOutsideW = inputData.outside; return x });

        this.sideTableUpdated(PanelsModule.DoorLeafPassive);
      }
    }
  }
  //#endregion

  //#region Sill Profile Bottom

 /**
 * This function is used to get the Selected sill profile bottom Object. 
 * 
 * @returns {DoorSystem}  it returns the selected sill profile bottom Object from the current unified model.
 * 
 */
  obj_SillProfileBottom(): DoorSystem {
    if (this.current_UnifiedModel.ModelInput.Geometry.DoorSystems) {
      return this.current_UnifiedModel.ModelInput.Geometry.DoorSystems[0];
    }
  }

 /**
 * This function is used to get the Selected Sill profile bottom Article Name with Inside and Outside Depths. 
 * 
 * @returns {string}  it returns the selected Sill profile bottom article name with inside and outside depths from the current unified model.
 * 
 */
  get_SillProfileBottom(): string {
    let ds = this.obj_SillProfileBottom();
    if (ds) {
      return ds.DoorSillArticleName + ' - ' + ds.DoorSillInsideW + ' / ' + ds.DoorSillOutsideW;
    }
  }

 /**
 * This function is used to set the Sill Profile bottom object to the unified model. 
 * 
 * @param {any}  inputData which is the selected sill profile bottom object which has to set to the unified model.
 * 
 */
  set_SillProfileBottom(inputData: any) {
    if (inputData) {
      let ds = this.current_UnifiedModel.ModelInput.Geometry.DoorSystems;
      if (ds) {
        //4. Sill Profile Bottom.It Is applicable when the Door Operable Type is selected and Its article Number is saved to
        ds = ds.map(x => { x.DoorSillArticleName = inputData.description; return x });
        //4.1. Sill Profile Bottom inside dimension is saved to
        ds = ds.map(x => { x.DoorSillInsideW = inputData.inside; return x });
        //4.2. Sill Profile Bottom outside dimension is saved to
        ds = ds.map(x => { x.DoorSillOutsideW = inputData.outside; return x });

        this.sideTableUpdated(PanelsModule.SillProfileBottom);
      }
    }
  }
  //#endregion

  //#region Sill Profile Fixed

 /**
 * This function is used to get the Selected sill profile fixed Object. 
 * 
 * @returns {DoorSystem}  it returns the selected sill profile fixed Object from the current unified model.
 * 
 */
  obj_SillProfileFixed(): DoorSystem {
    if (this.current_UnifiedModel.ModelInput.Geometry.DoorSystems) {
      return this.current_UnifiedModel.ModelInput.Geometry.DoorSystems[0];
    }
  }

 /**
 * This function is used to get the Selected sill profile fixed sections Object. 
 * 
 * @returns {Section}  it returns the selected sill profile fixed sections Object from the current unified model.
 * 
 */
  obj_SillProfileFixedSections(): Section {
    let sillProfileFixedSection = this.current_UnifiedModel.ModelInput.Geometry.Sections.filter(f => f.SectionID == 33 && f.SectionType == 33)[0];
    if (sillProfileFixedSection) {
      return sillProfileFixedSection;
    }
  }

 /**
 * This function is used to get the Selected sill profile default section Object. 
 * 
 * @returns {Section}  it returns the selected sill profile default section Object from the current unified model.
 * 
 */
  obj_SillProfileDefaultSection(): Section {
    let sillProfileDefaultSection = this.current_UnifiedModel.ModelInput.Geometry.Sections.filter(f => f.SectionID == 31 && f.SectionType == 31)[0];
    if (sillProfileDefaultSection) {
      return sillProfileDefaultSection;
    }
  }

 /**
 * This function is used to remove the  sill profile fixed section Object. 
 * 
 * @returns {Section}  it removes the selected sill profile fixed section Object from the current unified model.
 * 
 */
  remove_SillProfileFixedSections(): void {
    let sillProfileSectionIndex = this.current_UnifiedModel.ModelInput.Geometry.Sections.findIndex(f => f.SectionID == 33 && f.SectionType == 33)
    if (sillProfileSectionIndex !== -1) {
      this.current_UnifiedModel.ModelInput.Geometry.Sections.splice(sillProfileSectionIndex, 1);
    }
    let sillProfileDefaultSectionIndex = this.current_UnifiedModel.ModelInput.Geometry.Sections.findIndex(f => f.SectionID == 31 && f.SectionType == 31)
    if (sillProfileDefaultSectionIndex !== -1) {
      this.current_UnifiedModel.ModelInput.Geometry.Sections.splice(sillProfileDefaultSectionIndex, 1);
    }
    this.setUnifiedModel(this.current_UnifiedModel);
  }

 /**
 * This function is used to get the Selected Sill profile fixed Article Name with Inside and Outside Widths. 
 * 
 * @returns {string}  it returns the selected Sill profile fixed article name with inside and outside widths from the current unified model.
 * 
 */
  get_SillProfileFixed(): string {
    let ds = this.obj_SillProfileFixed();
    if (ds) {
      return ds.DoorSidelightSillArticleName + ' - ' + ds.DoorSillInsideW + ' / ' + ds.DoorSillOutsideW;;
    }
  }

 /**
 * This function is used to set the Sill Profile fixed object to the unified model. 
 * 
 * @param {any}  inputData which is the selected sill profile fixed object which has to set to the unified model.
 * 
 */
  set_SillProfileFixed(inputData: any) {
    if (inputData) {
      let ds = this.current_UnifiedModel.ModelInput.Geometry.DoorSystems;
      if (ds) {
        //5. Sill Profile Fixed Panel.It is applicable when the Mullion is added to the Door Operable Type and its article number is saved to
        ds = ds.map(x => { x.DoorSidelightSillArticleName = inputData.description; return x });
        let sectionClass = this.obj_SillProfileFixedSections();
        if (!sectionClass) sectionClass = new Section();
        sectionClass.SectionID = 33;
        sectionClass.SectionType = 33;
        sectionClass.ArticleName = inputData.description;
        sectionClass.InsideW = inputData.inside;
        sectionClass.OutsideW = inputData.outside;
        sectionClass.DistBetweenIsoBars = 16;
        sectionClass.Depth = -75;

        let sectionClass1 = this.obj_SillProfileDefaultSection();
        if (!sectionClass1) sectionClass1 = new Section();
        sectionClass1.SectionID = 31;
        sectionClass1.SectionType = 31;
        sectionClass1.ArticleName = "100000";
        sectionClass1.InsideW = 0;
        sectionClass1.OutsideW = 0;
        sectionClass1.DistBetweenIsoBars = 0;
        sectionClass1.Depth = 0;

        if(this.current_UnifiedModel.ModelInput.Geometry.Sections.filter(sec => sec.SectionID === 33).length === 0) {
          this.current_UnifiedModel.ModelInput.Geometry.Sections.push(sectionClass);
          this.current_UnifiedModel.ModelInput.Geometry.Sections.push(sectionClass1);
        }
        
      } else {
        if (this.current_UnifiedModel.ModelInput.Geometry.Sections.filter(s => s.SectionID == 33 && s.SectionType == 33))
          this.remove_SillProfileFixedSections();
      }

      this.sideTableUpdated(PanelsModule.SillProfileFixed);
    }
  }
  //#endregion


  //#endregion FRAMING

  //#region OPERABILITY

  //#region FrameCombination

 /**
 * This function is used to get the Selected Frame Combination. 
 * 
 * @param {any} data which is the selected frame Combination object
 * 
 * @returns {string}  it returns the selected Frame combination name.
 * 
 */
  get_FrameCombination(inputData: any) {
    if (inputData) {
      return 'Combination 1';
    }
  }
  //#endregion

  //#region Operability System

 /**
 * This function is used to get the Operability System Object. 
 * 
 * @param {any} OperableId which is the Operable SystemId by which operable system object is returned
 * 
 * @returns {OperabilitySystem}  it returns the Operable System Object by Operable System Id given.
 * 
 */
  obj_OperabilitySystemById(OperableId: any): OperabilitySystem {
    return this.current_UnifiedModel.ModelInput.Geometry.OperabilitySystems.filter(glass => glass.OperabilitySystemID === OperableId)[0];
  }

 /**
 * This function is used to get the Operability System Object with the given picker. 
 * 
 * @param {number} selectedPicker which is the PickerId by which operable system object is returned
 * 
 * @returns {OperabilitySystem}  it returns the Operable System Object by Selected Picker given.
 * 
 */
  obj_OperabilitySystem(selectedPicker: number = -1): OperabilitySystem {
    if (this.current_UnifiedModel.ProblemSetting.ProductType == "SlidingDoor") { 
      return this.current_UnifiedModel.ModelInput.Geometry.OperabilitySystems[0];
    }
    else if (selectedPicker > -1) {
      if (this.current_UnifiedModel.ModelInput.Geometry.OperabilitySystems && this.current_UnifiedModel.ModelInput.Geometry.OperabilitySystems.length > 0) {
        return this.current_UnifiedModel.ModelInput.Geometry.OperabilitySystems.filter(f => f.PickerIndex == selectedPicker)[0];
        //return this.current_UnifiedModel.ModelInput.Geometry.OperabilitySystems.filter(f => f.OperabilitySystemID == (selectedPicker + 1))[0];
      }
    }
  }
  //#endregion

  //#region Handle Color

 /**
 * This function is used to get the Handle Color. 
 * 
 * @param {number} selectedPicker which is the selected Picker by which obtain the operability system and its associated Handle Color
 * 
 * @returns {string}  it returns Handle Color applied from the operability system based on the selected picker.
 * 
 */
  get_HandleColor(selectedPicker: number = -1): string {
    if (selectedPicker > -1) {
      if (this.obj_OperabilitySystem(selectedPicker))
        return this.obj_OperabilitySystem(selectedPicker).InsideHandleColor;
    }
  }

 /**
 * This function is used to set the Handle color to the unified model. 
 * 
 * @param {any}  inputData which is the selected Handle Color object which has to set to the unified model.
 * 
 * @param {number} selectedPicker Handle color is set to the operabilitysystem object of the selected picker
 */
  set_HandleColor(inputData: any, selectedPicker: number = -1) {
    if (this.pService.checkPermission(this.feature.HandleColor) && inputData) {
      if (selectedPicker > -1) {
        //   if (this.pickers[selectedPicker])
        //     this.pickers[selectedPicker].handleColor = inputData.Description;
        if (this.current_UnifiedModel.ModelInput.Geometry.OperabilitySystems !== null
          && this.current_UnifiedModel.ModelInput.Geometry.OperabilitySystems !== undefined) {
          if (this.obj_OperabilitySystem(selectedPicker)) {
            this.obj_OperabilitySystem(selectedPicker).InsideHandleColor = inputData.Description;
            //this.obj_OperabilitySystem(selectedPicker).HandleColor = inputData.Description;

            this.sideTableUpdated(PanelsModule.HandleColor);
          }
        }
      }
    }
  }
  //#endregion

  //#region HingeType

 /**
 * This function is used to get the Door Object with the given Door SystemId. 
 * 
 * @param {any} doorsystemId which is the door systemId by which Door System Object is returned from the current unified model.
 * 
 * @returns {DoorSystem}  it returns the Door System Object by the given door systemId.
 * 
 */
  obj_Door(doorsystemId: any): DoorSystem {
    if (this.current_UnifiedModel.ModelInput.Geometry.DoorSystems)
      return this.current_UnifiedModel.ModelInput.Geometry.DoorSystems.filter(glass => glass.DoorSystemID === doorsystemId)[0];
  }

 /**
 * This function is used to get the Hinge Type. 
 * 
 * @param {number} selectedPicker which is the selected Picker by which the operability system is obtained from which Hinge type is extracted
 * 
 * @returns {string}  it returns Hinge Type article name along with the associated color applied from the operability system based on the selected picker.
 * 
 */
  get_HingeType(selectedPicker: number = -1): string {
    if (selectedPicker > -1 && this.handleDataList) {
      if (this.current_UnifiedModel.ModelInput.Geometry.OperabilitySystems && this.current_UnifiedModel.ModelInput.Geometry.OperabilitySystems.length > 0) {
        if (this.obj_OperabilitySystem(selectedPicker)) {
          let doorsystemId = this.obj_OperabilitySystem(selectedPicker).DoorSystemID;
          if (this.current_UnifiedModel.ModelInput.Geometry.DoorSystems && this.current_UnifiedModel.ModelInput.Geometry.DoorSystems.length > 0) {
            var doorOH = this.obj_Door(doorsystemId);
            if (doorOH && doorOH.HingeArticleName) {
              let dataDesc = this.handleDataList.filter(f => f.ArticleName == doorOH.HingeArticleName)[0].Description;
              if (doorOH.HingeColor)
              return doorOH.HingeArticleName + ' - ' + doorOH.HingeColor.split("-")[0].trim();
            }
          }
        }
      }
    }
  }

 /**
 * This function is used to set the HInge Type to the unified model. 
 * 
 * @param {any}  inputData which is the selected Hinge tYpe object which has to set to the unified model.
 * 
 * @param {number} selectedPicker Hinge Type is set to the operabilitysystem object of the selected picker
 */
  set_HingeType(inputData: any, selectedPicker: number = -1) {
    if (this.pService.checkPermission(this.feature.ADS_75) && inputData) {
      if (selectedPicker > -1) {
        // if (this.pickers[selectedPicker]) {
        //   this.pickers[selectedPicker].hingeType = inputData.Color.length > 4 ? (inputData.Description + ' - ' + inputData.Color.substring(0, inputData.Color.length - 10)) : inputData.Description + ' - ' + inputData.Color;
        // }
        if (this.current_UnifiedModel.ModelInput.Geometry.OperabilitySystems &&
          this.current_UnifiedModel.ModelInput.Geometry.OperabilitySystems.length > 0) {
          if (this.obj_OperabilitySystem(selectedPicker)) {
            let doorsystemId = this.obj_OperabilitySystem(selectedPicker).DoorSystemID;
            if (this.current_UnifiedModel.ModelInput.Geometry.DoorSystems && this.current_UnifiedModel.ModelInput.Geometry.DoorSystems.length > 0) {
              if (doorsystemId > 0) {
                this.obj_Door(doorsystemId).HingeArticleName = inputData.ArticleNumber;
                this.obj_Door(doorsystemId).HingeColor = inputData.Color;
              }
            }
          }
        }

        this.sideTableUpdated(PanelsModule.HingeType);
      }
    }
  }
  //#endregion

  //#region Inside Handle

 /**
 * This function is used to get the Inside Handle. 
 * 
 * @param {number} selectedPicker which is the selected Picker by which the operability system is obtained from which Inside Handle is extracted
 * 
 * @returns {string}  it returns Inside Handle article name along with the associated color applied from the operability system based on the selected picker.
 * 
 */
  get_InsideHandle(selectedPicker: number = -1): string {
    if (selectedPicker > -1 && this.handleDataList) {
      if (this.current_UnifiedModel.ModelInput.Geometry.OperabilitySystems && this.current_UnifiedModel.ModelInput.Geometry.OperabilitySystems.length > 0) {
        let dsl = this.current_UnifiedModel.ModelInput.Geometry.DoorSystems;
        if (dsl && dsl.length > 0 && dsl.filter(f => f.DoorSystemID != -1).length > 0) {
          if (this.obj_OperabilitySystem(selectedPicker)) {
            let doorsystemId = this.obj_OperabilitySystem(selectedPicker).DoorSystemID;
            var doorOH = this.obj_Door(doorsystemId);
            if (doorOH && doorOH.InsideHandleArticleName) {
              if (doorOH.InsideHandleColor) {
                return '' + doorOH.InsideHandleArticleName + ' - ' + doorOH.InsideHandleColor.split("-")[0].trim();
              }
            }
          }
        } else {
          if (this.obj_OperabilitySystem(selectedPicker)) {
            let OperableId = this.obj_OperabilitySystem(selectedPicker).OperabilitySystemID;
            let windowOH = this.obj_OperabilitySystemById(OperableId);
            if (windowOH.InsideHandleArticleName) {
              if (windowOH.InsideHandleColor) {
                return '' + windowOH.InsideHandleArticleName + ' - ' + windowOH.InsideHandleColor.split("-")[0].trim();
              }
            }
          }  
          // if(this.current_UnifiedModel.ModelInput.Geometry.OperabilitySystems.filter(f => f.OperabilitySystemID == (selectedPicker + 1)).length > 0) {
          //   if (this.obj_OperabilitySystem(selectedPicker)) {
          //     let OperableId = this.obj_OperabilitySystem(selectedPicker).OperabilitySystemID;
          //     let windowOH = this.obj_OperabilitySystemById(OperableId);
          //     if (windowOH.InsideHandleArticleName) {
          //       if (windowOH.InsideHandleColor) {
          //         return '' + windowOH.InsideHandleArticleName + ' - ' + windowOH.InsideHandleColor.split("-")[0].trim();
          //       }
          //     }
          //   }  
          // } else {
          //   if (this.obj_OperabilitySystem(selectedPicker - 1)) {
          //     let OperableId = this.obj_OperabilitySystem(selectedPicker - 1).OperabilitySystemID;
          //     let windowOH = this.obj_OperabilitySystemById(OperableId);
          //     if (windowOH.InsideHandleArticleName) {
          //       if (windowOH.InsideHandleColor) {
          //         return '' + windowOH.InsideHandleArticleName + ' - ' + windowOH.InsideHandleColor.split("-")[0].trim();
          //       }
          //     }
          //   }
          // }
         
        }
      }
    }
  }

 /**
 * This function is used to set the Inside Handle to the unified model. 
 * 
 * @param {any}  inputData which is the selected Inside Handle object which has to set to the unified model.
 * 
 * @param {number} selectedPicker Inside Handle is set to the operabilitysystem object of the selected picker
 */
  set_InsideHandle(inputData: any, selectedPicker: number = -1) {
    // the below code is to retain the selected value of Inside handle from the child component
    if (this.pService.checkPermission(this.feature.InsideHandle) && inputData) {
      if (selectedPicker > -1) {
        // if (this.pickers[selectedPicker]) {
        //   this.pickers[selectedPicker].insideHandle = this.insideHandle = inputData.Color.length > 4 ? (inputData.Description + ' - ' + inputData.Color.substring(0, inputData.Color.length - 10)) : inputData.Description + ' - ' + inputData.Color;
        // }
        if (this.current_UnifiedModel.ModelInput.Geometry.OperabilitySystems && this.current_UnifiedModel.ModelInput.Geometry.OperabilitySystems.length > 0) {
          if (this.current_UnifiedModel.ModelInput.Geometry.DoorSystems && this.current_UnifiedModel.ModelInput.Geometry.DoorSystems.length > 0) {
            if (this.obj_OperabilitySystem(selectedPicker)) {
              let doorsystemId = this.obj_OperabilitySystem(selectedPicker).DoorSystemID;
              if (doorsystemId > 0) {
                this.obj_Door(doorsystemId).InsideHandleArticleName = inputData.ArticleNumber;
                this.obj_Door(doorsystemId).InsideHandleColor = inputData.Color;
                this.obj_Door(doorsystemId).InsideHandleArticleDescription = inputData.Color.length > 4 ? (inputData.description + ' - ' + inputData.Color.substring(0, inputData.Color.length - 10)) : inputData.description + ' - ' + inputData.Color;
                this.current_UnifiedModel.ModelInput.Geometry.OperabilitySystems = this.current_UnifiedModel.ModelInput.Geometry.OperabilitySystems.map(x => { x.InsideHandleArticleName = null; return x });
                this.current_UnifiedModel.ModelInput.Geometry.OperabilitySystems = this.current_UnifiedModel.ModelInput.Geometry.OperabilitySystems.map(x => { x.InsideHandleColor = null; return x });
              }
            }
          } else {
            if (this.obj_OperabilitySystem(selectedPicker)) {
              let OperableId = this.obj_OperabilitySystem(selectedPicker).OperabilitySystemID;
              this.obj_OperabilitySystemById(OperableId).InsideHandleArticleName = inputData.ArticleNumber;
              this.obj_OperabilitySystemById(OperableId).InsideHandleColor = inputData.Color;
              this.obj_OperabilitySystemById(OperableId).InsideHandleArticleDescription = inputData.Color.length > 4 ? (inputData.description + ' - ' + inputData.Color.substring(0, inputData.Color.length - 10)) : inputData.description + ' - ' + inputData.Color;
              //this.obj_OperabilitySystemById(OperableId).HandleColor = inputData.Color;
            }
          }
        }
        this.sideTableUpdated(PanelsModule.InsideHandle);
      }
    }
  }
  //#endregion

  //#region Outside Handle
  
 /**
 * This function is used to get the Outside Handle. 
 * 
 * @param {number} selectedPicker which is the selected Picker by which the operability system is obtained from which Outside Handle is extracted
 * 
 * @returns {string}  it returns Outside Handle article name along with the associated color applied from the operability system based on the selected picker.
 * 
 */
  get_OutsideHandle(selectedPicker: number = -1): string {
    if (selectedPicker > -1 && this.handleDataList) {
      if (this.current_UnifiedModel.ModelInput.Geometry.OperabilitySystems && this.current_UnifiedModel.ModelInput.Geometry.OperabilitySystems.length > 0) {
        if (this.obj_OperabilitySystem(selectedPicker)) {
          let doorsystemId = this.obj_OperabilitySystem(selectedPicker).DoorSystemID;
          if (this.current_UnifiedModel.ModelInput.Geometry.DoorSystems && this.current_UnifiedModel.ModelInput.Geometry.DoorSystems.length > 0) {
            var doorOH = this.obj_Door(doorsystemId);
            if (doorOH && doorOH.OutsideHandleArticleName) {
              if (doorOH.OutsideHandleColor) {
                return '' + doorOH.OutsideHandleArticleName + ' - ' + doorOH.OutsideHandleColor.split("-")[0].trim();
              }
            }
          }
        }
      }
    }
  }

 /**
 * This function is used to set the Outside Handle to the unified model. 
 * 
 * @param {any}  inputData which is the selected Outside Handle object which has to set to the unified model.
 * 
 * @param {number} selectedPicker Outside Handle is set to the operabilitysystem object of the selected picker
 */
  set_OutsideHandle(inputData: any, selectedPicker: number = -1) {
    // the below code is to retain the selected value of Inside handle from the child component
    if (this.pService.checkPermission(this.feature.ADS_75) && inputData) {
      if (selectedPicker > -1) {
        // if (this.pickers[selectedPicker])
        //   this.pickers[selectedPicker].outsideHandle = this.outsideHandle = inputData.Color.length > 4 ? (inputData.Description + ' - ' + inputData.Color.substring(0, inputData.Color.length - 10)) : inputData.Description + ' - ' + inputData.Color;
        if (this.current_UnifiedModel.ModelInput.Geometry.OperabilitySystems && this.current_UnifiedModel.ModelInput.Geometry.OperabilitySystems.length > 0) {
          if (this.obj_OperabilitySystem(selectedPicker)) {
            let doorsystemId = this.obj_OperabilitySystem(selectedPicker).DoorSystemID;
            if (this.current_UnifiedModel.ModelInput.Geometry.DoorSystems && this.current_UnifiedModel.ModelInput.Geometry.DoorSystems.length > 0) {
              if (doorsystemId > 0) {
                this.obj_Door(doorsystemId).OutsideHandleArticleName = inputData.ArticleNumber;
                this.obj_Door(doorsystemId).OutsideHandleColor = inputData.Color;
              }
            }
          }
        }

        this.sideTableUpdated(PanelsModule.OutsideHandle);
      }
    }
  }
  //#endregion

  //#endregion OPERABILITY
  //#region GLASSPANEL

 /**
 * This function is used to set the acoustic enabled and disabled by displaying a notification. 
 * 
 * @param {any}  selectedArticle which is the selected Glass and Panel article based on its category will disable and enable acoustic acoustic which has to set to the unified model.
 *
 */
  set_GlassPanel(selectedArticle: any) { 
    if (selectedArticle.composition.split("-").length === 5 && selectedArticle.category === "custom") {
      if (this.current_UnifiedModel.ProblemSetting.EnableAcoustic) {
        this.current_UnifiedModel.ProblemSetting.EnableAcoustic = false;
        this.setNotificaionShow({
          title: this.translate.instant(_("notification.acoustic-disabled")),
          message: this.translate.instant(_("notification.acoustic-solver-does-not-support-custom-triple-layer-glass")),
          logoToShow: "Acoustic"
        });
      }
    } else {
      this.DoEnableAcoustic();
    }
  }

 /**
 * This function is used to enable the acoustic icon and will display a notification. 
 *
 */
  DoEnableAcoustic() {
    if (!this.current_UnifiedModel.ProblemSetting.EnableAcoustic && this.current_UnifiedModel.ProblemSetting.isAcousticEnabled) {
      var AWS114Data = this.current_UnifiedModel.ModelInput.Geometry.Infills.filter((g) => g.InsertWindowSystem !== null && g.InsertWindowSystem !== undefined && g.InsertWindowSystem.indexOf("AWS 114") > -1);
      var CustomTripleData = this.current_UnifiedModel.ModelInput.Geometry.GlazingSystems.filter((g) => (g.Category === "custom" || g.Category === "custom-triple") && g.Plates.length === 3);
      if (AWS114Data.length === 0 && CustomTripleData.length === 0) {
        this.current_UnifiedModel.ProblemSetting.EnableAcoustic = true;
        this.setNotificaionShow({ title: this.translate.instant(_("notification.acoustic-enabled")), message: this.translate.instant(_("notification.acoustic-is-now-enabled")), logoToShow: "Acoustic", });
      }
    }
  }

 /**
 * This function is used to convert the custom glass data to display. 
 *
 * @returns {any} customGlassData which is the custom glass data in the format with the existing double and triple glass data.
 */
  ConvertCustomGlassData(): any[] {
    var customGlassData = [];
    var customGlassId = 0;
    if (this.current_UnifiedModel && this.current_UnifiedModel.ModelInput.Geometry.CustomGlass !== undefined && this.current_UnifiedModel.ModelInput.Geometry.CustomGlass !== null) {
      this.current_UnifiedModel.ModelInput.Geometry.CustomGlass.forEach((glass, index) => {
        glass.customGlassID = customGlassId++;
        let es1 = glass.element_size_1; let es2 = glass.element_size_2; let es3 = glass.element_size_3;
        // if (glass.element_type_1 === 'lamiAcousticPVB') es1 = glass.element_size_1.indexOf('[') === -1 ? glass.element_size_1 : glass.element_size_1.substring(0, glass.element_size_1.indexOf('[')) + '(' + glass.element_size_1.split('[')[1].split(']')[0] + 'mm Acoustic PVB)';
        // if (glass.element_type_2 === 'lamiAcousticPVB') es2 = glass.element_size_2.indexOf('[') === -1 ? glass.element_size_2 : glass.element_size_2.substring(0, glass.element_size_2.indexOf('[')) + '(' + glass.element_size_2.split('[')[1].split(']')[0] + 'mm Acoustic PVB)';
        // if (glass.element_type_3 === 'lamiAcousticPVB') es3 = glass.element_size_3.indexOf('[') === -1 ? glass.element_size_3 : glass.element_size_3.substring(0, glass.element_size_3.indexOf('[')) + '(' + glass.element_size_3.split('[')[1].split(']')[0] + 'mm Acoustic PVB)';

        if (glass.element_type_1 === 'lamiAcousticPVB') es1 = glass.element_size_1.substring(0, glass.element_size_1.indexOf('[')) + '(' + glass.element_size_1.split('[')[1].split(']')[0] + 'mm Acoustic PVB)';
        if (glass.element_type_2 === 'lamiAcousticPVB') es2 = glass.element_size_2.substring(0, glass.element_size_2.indexOf('[')) + '(' + glass.element_size_2.split('[')[1].split(']')[0] + 'mm Acoustic PVB)';
        if (glass.element_type_3 === 'lamiAcousticPVB') es3 = glass.element_size_3.substring(0, glass.element_size_3.indexOf('[')) + '(' + glass.element_size_3.split('[')[1].split(']')[0] + 'mm Acoustic PVB)';
        const element_type_1 = glass.element_type_1 === 'lamiAcousticPVB' ? 'Glass' : glass.element_type_1;
        const element_type_2 = glass.element_type_2 === 'lamiAcousticPVB' ? 'Glass' : glass.element_type_2;
        const element_type_3 = glass.element_type_3 === 'lamiAcousticPVB' ? 'Glass' : glass.element_type_3;
        var language = this.localStorageService.getValue("culture") ? this.localStorageService.getValue("culture") : "en-US";
        let thickness = parseInt(glass.element_size_1) + parseInt(glass.element_ins_size_1) + parseInt(glass.element_size_2);
        let composition = es1 + "-" + glass.element_ins_size_1 + "-" + es2;
        let type = element_type_1 + "-" + glass.element_ins_type_1 + "-" + element_type_2;
        let description = glass.element_size_1 + "/" + glass.element_ins_size_1 + "/" + glass.element_size_2;
        if (glass.selectedType == 'custom-triple') {
          thickness = thickness + parseInt(glass.element_ins_size_2) + parseInt(glass.element_size_3);
          composition += "-" + glass.element_ins_size_2 + "-" + es3;
          type += "-" + glass.element_ins_type_2 + "-" + element_type_3;
          description += "/" + glass.element_ins_size_2 + "/" + glass.element_size_3
        }
        customGlassData.push({
          composition: composition,
          type: type,
          totalThickness: thickness,
          totalThicknessUnit: "mm",
          uvalue: (language === "DE" || language === "de-DE" ? glass.uValue.replace('.', ',') : glass.uValue),
          rw: glass.glassrw,
          spacer: [""],
          category: 'custom',
          // rw: {
          //   ref: this.outsideTemplate,
          //   context: {
          //     value: glass.glassrw,
          //     disabled: true,
          //     arrowHovered: true,
          //     index: index
          //   }
          // },
        });
      });
    }
    return customGlassData;
  }
  
  //#endregion GLASSPANEL

  //#region Support functions

 /**
 * This function is used to build the article properties under framing section. 
 *
 * @param {any} inputArticle which is the selected article under framing option.
 * 
 * @param {FacadeSection} section which is the setion to which all the properties has to be set
 * 
 * @param {boolean} isUDCFramingUpdate which is the boolean value which tells us whether it is the UDC Framing Update or other Framing Update.
 */
  buildFramingSection(inputArticle: any, section: FacadeSection, isUDCFramingUpdate = false) {
    let article = inputArticle.article;
    let isCustomed = inputArticle.isCustomed;
    if (this.current_UnifiedModel.ProblemSetting.ProductType == "Facade" &&
      this.current_UnifiedModel.ProblemSetting.FacadeType == 'UDC') {
      if (isCustomed && article) {
        if (section) {
          section.isCustomProfile = article.isCustomProfile;
          section.ArticleName = article.ArticleName.toString();
          section.OutsideW = article.OutsideW;
          section.Depth = article.Depth;
          section.Width = article.Width;
          section.BTDepth = article.BTDepth;
          section.Weight = article.Weight;

          section.A = article.A;
          section.Iyy = article.Iyy;
          section.Izz = article.Izz;
          section.Asy = article.Asy;
          section.Asz = article.Asz;
          section.J = article.J;
          section.E = article.E;
          section.G = article.G;
          section.EA = article.EA;
          section.GAsy = article.GAsy;
          section.GAsz = article.GAsz;
          section.EIy = article.EIy;
          section.EIz = article.EIz;
          section.GJ = article.GJ;
          section.Zo = article.Zo;
          section.Zu = article.Zu;
          section.Zl = article.Zl;
          section.Zr = article.Zr;
          section.Material = article.Material;
          section.beta = article.beta;
          section.Wyy = article.Wyy;
          section.Wzz = article.Wzz;
        }
      }
      else if (article) {
        section.ArticleName = article.transomArticleId.toString();
        section.Depth = article.transomDepth;
        section.transomArticleId = article.ArticleName;
        section.Name = article.ArticleName;
        section.Description = article.ArticleName;
        section.isCustomProfile = isCustomed;
        if (section.SectionID === 1) { }
      }
      if (article && this.current_UnifiedModel.ModelInput.Geometry.FacadeSections && !isUDCFramingUpdate) {
        if (!this.current_UnifiedModel.ModelInput.Thermal) { this.current_UnifiedModel.ModelInput.Thermal = new Thermal(); }
        this.current_UnifiedModel.ModelInput.Thermal.InsulationZone = this.current_UnifiedModel.ModelInput.FrameSystem.InsulationZone;
        this.setLoadDisplaySetting();
      }
    }
  }

 /**
 * This function is used to set the bottom framing section to the unified model. 
 * 
 */
  setBottomFraming() {
    if (this.current_UnifiedModel.ModelInput.FrameSystem.HorizontalJointWidth === 20) {
      var tfsections = this.obj_topFrameSection();
      if (tfsections && tfsections.isCustomProfile) {
        var bfsections = this.obj_bottomFrameSection();
        if (bfsections) {
          // bfsections.ArticleName = null;
          // bfsections.Depth = null;
          // this.sujLoadSidePanel.next({ PanelsModule: PanelsModule...., finishedLoading: true });
        }
      }
      else {
        var bFraming = this.fService.getBottomFrameList(tfsections.ArticleName.toString());
        if (bFraming) {
          var bfsections = this.obj_bottomFrameSection();
          if (bfsections) {
            bfsections.ArticleName = bFraming.transomArticleId.toString();
            bfsections.Depth = bFraming.transomDepth;
            this.sideTableUpdated(PanelsModule.FrameCombination);
          }
        }
      }
    } else {
      var bfsections = this.obj_bottomFrameSection();
      if (bfsections) {
        // bfsections.ArticleName = null;
        // bfsections.Depth = null;
        // this.sujLoadSidePanel.next({ PanelsModule: PanelsModule....., finishedLoading: true });
      }
    }
  }

 /**
 * This function is used to check whether the Mullion exists in UDC Product Type. 
 * 
 * @return {boolean} isMullion returns as true if the mullion exists else returns false
 * 
 */
  isMullionExistUDC() {
    let isMullion = false;
    if (this.current_UnifiedModel && this.current_UnifiedModel.ModelInput && this.current_UnifiedModel.ModelInput.Geometry && this.current_UnifiedModel.ModelInput.Geometry.Members) {
      let mullion = this.current_UnifiedModel.ModelInput.Geometry.Members.filter(x => x.MemberType == 24);
      isMullion = mullion && mullion.length > 0;
    }
    return isMullion;
  }

 /**
 * This function is used to check whether the Transom exists in UDC Product Type. 
 * 
 * @return {boolean} isTransom returns as true if the transom exists else returns false
 * 
 */
  isTransomExistUDC() {
    let isTransom = false;
    if (this.current_UnifiedModel && this.current_UnifiedModel.ModelInput && this.current_UnifiedModel.ModelInput.Geometry && this.current_UnifiedModel.ModelInput.Geometry.Members) {
      let transom = this.current_UnifiedModel.ModelInput.Geometry.Members.filter(x => x.MemberType == 25);
      isTransom = transom && transom.length > 0;
    }
    return isTransom;
  }

 /**
 * This function is used to get the Door Handle Articles list from the api call if the list is already not there in local storage. 
 * 
 * If exists from the local storage the will return from the local storage.
 * 
 */
  GetDoorHandleArticles() {
    if (localStorage.getItem('DoorHandleArticles_')) {
      this.handleDataList = JSON.parse(localStorage.getItem('DoorHandleArticles_'));
    } else {
      this.fService.GetDoorHandleArticles().subscribe(data => {
        localStorage.setItem('DoorHandleArticles_', data);
        this.handleDataList = JSON.parse(data);
      });
    }
  }

 /**
 * This function is used to get the sliding Door Handle Articles list from the api call if the list is already not there in local storage. 
 * 
 * If exists from the local storage the will return from the local storage.
 * 
 */
  GetSlidingDoorHandleArticles() {
    if (localStorage.getItem('SlidingDoor')) {
      this.slidingDoorsHandlesList = JSON.parse(localStorage.getItem('SlidingDoorArticles_'));
    } else {
      this.fService.getSlidingDoorArticles().subscribe(data => {
        localStorage.setItem('SlidingDoorArticles_', data);
        this.slidingDoorsHandlesList = JSON.parse(data);
      });
    }
  }

 /**
 * This function is used to get the  Articles list related to ADS System Type from the api call if the list is already not there in local storage. 
 * 
 * If exists from the local storage the will return from the local storage.
 * 
 */
  GetADSArticlesList() {
    if (localStorage.getItem('ADSArticlesList_')) {
      this.adsArticlesList = JSON.parse(localStorage.getItem('ADSArticlesList_'));
    } else {
      this.fService.getADSArticlesList("ADS").subscribe(data => {
        localStorage.setItem('ADSArticlesList_', data);
        this.adsArticlesList = JSON.parse(data);
      });
    }

  }
  //#endregion

  //#region Load

 /**
 * This function is used to set the Wind Load to the unified model. 
 * 
 * @param {any} loadData which is the Windload has to set to the unified model.
 */
  set_WindLoad(loadData: any) {
    if(this.current_UnifiedModel && this.current_UnifiedModel.ModelInput && this.current_UnifiedModel.ModelInput.Structural) {
      this.current_UnifiedModel.ModelInput.Structural.WindLoad = parseFloat(loadData)
    }
    this.sideTableUpdated(PanelsModule.Load);
  }  

 /**
 * This function is used to get the Wind Load. 
 *  
 * @returns {string}  it returns Windload from the current Unified model.
 * 
 */
  get_WindLoad(): string {
    if (this.current_UnifiedModel && this.current_UnifiedModel.ModelInput && this.current_UnifiedModel.ModelInput.Structural) {
      return this.current_UnifiedModel.ModelInput.Structural.WindLoad ? this.current_UnifiedModel.ModelInput.Structural.WindLoad.toFixed(2) : "1.68";
    }
  }
  //#endregion

 // #region Thermal

 /**
 * This function is used to set the thermal values to the unified model. 
 * 
 * @param {Thermal} thermal which is the thermal object has to set to the current unified model.
 */
 set_Thermal(thermal: Thermal) {
  if (!this.current_UnifiedModel.ModelInput) {
    this.current_UnifiedModel.ModelInput = new ModelInput();
  }
  this.current_UnifiedModel.ModelInput.Thermal = thermal;
 }

 //#endregion

 // #region Structural

 /**
 * This function is used to set the structural values to the unified model. 
 * 
 * @param {Structural} structural which is the structural object has to set to the current unified model.
 */
 set_Structural(structural: Structural) {
  if (!this.current_UnifiedModel.ModelInput) {
    this.current_UnifiedModel.ModelInput = new ModelInput();
  }
  this.current_UnifiedModel.ModelInput.Structural = structural;
 }

 /**
 * This function is used to set the alloy data to the unified model. 
 * 
 * @param {any} alloyData which is the alloy object has to set to the current unified model.
 */
  set_Alloy(alloyData: any) {
    if (!this.current_UnifiedModel.ModelInput.FrameSystem) {
      this.current_UnifiedModel.ModelInput.FrameSystem = new FrameSystem();
    }
    this.current_UnifiedModel.ModelInput.FrameSystem.Alloys = alloyData;
    this.sideTableUpdated;
  }

 /**
 * This function is used to get the alloy data. 
 *  
 * @returns {string}  it returns alloy data from the current Unified model.
 * 
 */
  get_alloy(): string {
    return this.current_UnifiedModel.ModelInput.FrameSystem.Alloys;
  }
  //#endregion

    //#region Outside Handle for Sliding Doors
    
 /**
 * This function is used to get the Sliding Door Object from teh Current Unified Model based on the given Sliding Door SystemId. 
 *  
 * @param {any} slidingdoorsystemId is the input to get the Sliding Door System Object from the current unified Model 
 * 
 * @returns {string}  it returns Sliding Soor System Object based on the sliding Door SystemId from the Current unified model.
 * 
 */
    obj_SlidingDoor(slidingdoorsystemId: any): SlidingDoorSystem {
      if (this.current_UnifiedModel.ModelInput.Geometry.SlidingDoorSystems)
        return this.current_UnifiedModel.ModelInput.Geometry.SlidingDoorSystems.filter(glass => glass.SlidingDoorSystemID === slidingdoorsystemId)[0];
    }

 /**
 * This function is used to get the Outside Handle data from the current Unified Model. 
 *  
 * @returns {string}  it returns Outside Handle Article Name along with the color from the current Unified model.
 * 
 */
    get_OutsideHandleForSlidingDoors(): string {
      if (this.slidingDoorsHandlesList) {
        if (this.current_UnifiedModel.ModelInput.Geometry.OperabilitySystems && this.current_UnifiedModel.ModelInput.Geometry.OperabilitySystems.length > 0) {
          if (this.obj_OperabilitySystem(1)) {
            let slidingdoorsystemId = this.obj_OperabilitySystem(1).SlidingDoorSystemID;
            if (this.current_UnifiedModel.ModelInput.Geometry.SlidingDoorSystems && this.current_UnifiedModel.ModelInput.Geometry.SlidingDoorSystems.length > 0) {
              var slidingdoorOH = this.obj_SlidingDoor(slidingdoorsystemId);
              if (slidingdoorOH && slidingdoorOH.OutsideHandleArticleName) {
                let dataDesc = this.slidingDoorsHandlesList.filter(f => f.ArticleName == slidingdoorOH.OutsideHandleArticleName)[0].Description;
                if (slidingdoorOH.OutsideHandleColor) {
                  return slidingdoorOH.OutsideHandleArticleName + ' - ' + slidingdoorOH.OutsideHandleColor.split("-")[0].trim();
                }
              }
            }
          }
        }
      }
    }

 /**
 * This function is used to set the OutSide Handle Data to the current unified model. 
 * 
 * @param {any} inputData which is the Outside Handle for Sliding Doors has to set to the current unified model.
 */
    set_OutsideHandleForSlidingDoors(inputData: any) {
      // the below code is to retain the selected value of Inside handle from the child component
      // if (this.pService.checkPermission(this.feature.SlidingUnit) && inputData) {
        if(inputData) {
          if (this.current_UnifiedModel.ModelInput.Geometry.OperabilitySystems && this.current_UnifiedModel.ModelInput.Geometry.OperabilitySystems.length > 0) {
            if (this.obj_OperabilitySystem(1)) {
              let slidingdoorsystemId = this.obj_OperabilitySystem(1).SlidingDoorSystemID;
              if (this.current_UnifiedModel.ModelInput.Geometry.SlidingDoorSystems && this.current_UnifiedModel.ModelInput.Geometry.SlidingDoorSystems.length > 0) {
                if (slidingdoorsystemId > 0) {
                  this.obj_SlidingDoor(slidingdoorsystemId).OutsideHandleArticleName = inputData.ArticleNumber;
                  this.obj_SlidingDoor(slidingdoorsystemId).OutsideHandleColor = inputData.Color;
                }
              }
            }
          }
  
          this.sideTableUpdated(PanelsModule.OutsideHandle);
        //}
      }
    }
    //#endregion

    //#region Inside Handle for Sliding Doors 

 /**
 * This function is used to get the Inside Handle data for Sliding Doors from the current Unified Model. 
 *  
 * @returns {string}  it returns Inside Handle Article Name along with the color from the current Unified model.
 * 
 */
    get_InsideHandleForSlidingDoors(): string {
      if (this.slidingDoorsHandlesList) {
        if (this.current_UnifiedModel.ModelInput.Geometry.OperabilitySystems && this.current_UnifiedModel.ModelInput.Geometry.OperabilitySystems.length > 0) {
          let dsl = this.current_UnifiedModel.ModelInput.Geometry.SlidingDoorSystems;
          if (dsl && dsl.length > 0 && dsl.filter(f => f.SlidingDoorSystemID != -1).length > 0) {
            if (this.obj_OperabilitySystem(1)) {
              let slidingdoorsystemId = this.obj_OperabilitySystem(1).SlidingDoorSystemID;
              var slidingdoorOH = this.obj_SlidingDoor(slidingdoorsystemId);
              if (slidingdoorOH && slidingdoorOH.InsideHandleArticleName) {
                let dataDesc = this.slidingDoorsHandlesList.filter(f => f.ArticleName == slidingdoorOH.InsideHandleArticleName)[0].Description;
                if (slidingdoorOH.InsideHandleColor) {
                  return slidingdoorOH.InsideHandleArticleName + ' - ' + slidingdoorOH.InsideHandleColor.split("-")[0].trim();
                }
              }
            }
          } 
        }
      }
    }

 /**
 * This function is used to set the Inside Handle Data to the current unified model. 
 * 
 * @param {any} inputData which is the Inside Handle for Sliding Doors has to set to the current unified model.
 */
    set_InsideHandleForSlidingDoors(inputData: any) {
      // the below code is to retain the selected value of Inside handle from the child component
      if ( inputData) {
          if (this.current_UnifiedModel.ModelInput.Geometry.OperabilitySystems && this.current_UnifiedModel.ModelInput.Geometry.OperabilitySystems.length > 0) {
            if (this.current_UnifiedModel.ModelInput.Geometry.SlidingDoorSystems && this.current_UnifiedModel.ModelInput.Geometry.SlidingDoorSystems.length > 0) {
              if (this.obj_OperabilitySystem(1)) {
                let slidingdoorsystemId = this.obj_OperabilitySystem(1).SlidingDoorSystemID;
                if (slidingdoorsystemId > 0) {
                  this.obj_SlidingDoor(slidingdoorsystemId).InsideHandleArticleName = inputData.ArticleNumber;
                  this.obj_SlidingDoor(slidingdoorsystemId).InsideHandleColor = inputData.Color;
                  this.current_UnifiedModel.ModelInput.Geometry.OperabilitySystems = this.current_UnifiedModel.ModelInput.Geometry.OperabilitySystems.map(x => { x.InsideHandleArticleName = null; return x });
                  this.current_UnifiedModel.ModelInput.Geometry.OperabilitySystems = this.current_UnifiedModel.ModelInput.Geometry.OperabilitySystems.map(x => { x.InsideHandleColor = null; return x });
                }
              }
            } 
          }
          this.sideTableUpdated(PanelsModule.InsideHandle);
        //}
      }
    }
    //#endregion 

    //#region Track Type

 /**
 * This function is used to get the Track Type data for Sliding Doors from the current Unified Model. 
 *  
 * @returns {string}  it returns the track type applied  from the current Unified model.
 * 
 */
  get_TrackType(): string {
    if (this.current_UnifiedModel.ModelInput.Geometry.OperabilitySystems && this.current_UnifiedModel.ModelInput.Geometry.OperabilitySystems.length > 0) {
      let operabilitySystem = this.obj_OperabilitySystem(0);
      if (operabilitySystem) {
        return operabilitySystem.VentOperableType;
      }
    }
  }
    //#endregion

    //#region slideoption

 /**
 * This function is used to get the Slide option data for Sliding Doors from the current Unified Model. 
 *  
 * @returns {string}  it returns the slide option applied  from the current Unified model.
 * 
 */
    get_SlideOption(): string {
      if (this.current_UnifiedModel.ModelInput.Geometry.OperabilitySystems && this.current_UnifiedModel.ModelInput.Geometry.OperabilitySystems.length > 0) {
        if (this.obj_OperabilitySystem(1)) {
          let slidingdoorsystemId = this.obj_OperabilitySystem(1).SlidingDoorSystemID;
          if (this.current_UnifiedModel.ModelInput.Geometry.SlidingDoorSystems && this.current_UnifiedModel.ModelInput.Geometry.SlidingDoorSystems.length > 0) {
            var slidingdoorOH = this.obj_SlidingDoor(slidingdoorsystemId);
            if (slidingdoorOH && slidingdoorOH.SlidingOperabilityType) {  
                return slidingdoorOH.SlidingOperabilityType;
            }
          }
        }
      }
    }
    //endregion

    //#region Moving vent

 /**
 * This function is used to get the moving vent data for Sliding Doors from the current Unified Model. 
 *  
 * @returns {string}  it returns the moving vent option applied  from the current Unified model.
 * 
 */
    get_MovingVent(): string {
      let vent: string;
      if (this.current_UnifiedModel.ModelInput.Geometry.OperabilitySystems && this.current_UnifiedModel.ModelInput.Geometry.OperabilitySystems.length > 0) {
        if (this.obj_OperabilitySystem(1)) {
          let slidingdoorsystemId = this.obj_OperabilitySystem(1).SlidingDoorSystemID;
          if (this.current_UnifiedModel.ModelInput.Geometry.SlidingDoorSystems && this.current_UnifiedModel.ModelInput.Geometry.SlidingDoorSystems.length > 0) {
            var slidingdoorOH = this.obj_SlidingDoor(slidingdoorsystemId);
            if (slidingdoorOH && slidingdoorOH.MovingVent) { 
              switch (slidingdoorOH.MovingVent) {
                case 'Inside and Outside':
                  vent = 'InsideAndOutside';
                  break;
                case 'Inside':
                  vent = 'Inside';
                  break;
                case 'Outside':
                  vent = 'Outside';
                  break;

                default:
                  break;
              } 
                return vent;
            }
          }
        }
      }
    }
    //endregion
}