import { Component, OnInit, ViewChild, AfterViewInit, OnDestroy, HostListener } from '@angular/core';
import { forkJoin, Subject, zip } from 'rxjs';
import { Router } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { NzModalService } from 'ng-zorro-antd';
import { ResizeEvent } from 'angular-resizable-element';
import { _ } from '@biesbjerg/ngx-translate-extract/dist/utils/utils';
import { BpsUnifiedModel, ProblemSetting, UserSetting, Thermal } from 'src/app/app-common/models/bps-unified-model';
import { BpsUnifiedProblem } from 'src/app/app-common/models/bps-unified-problem';
import { AnalysisResult } from 'src/app/app-common/models/analysis-result';
import { Feature } from 'src/app/app-core/models/feature';
import { NavLayoutService } from 'src/app/app-layout/services/nav-layout.service';
import { ConfigureService } from 'src/app/app-structural/services/configure.service';
import { ResultService } from 'src/app/app-structural/services/result.service';
import { PermissionService } from 'src/app/app-core/services/permission.service';
import { UnifiedModelService } from 'src/app/app-structural/services/unified-model.service';
import { LeftConfigureComponent } from '../left-configure/left-configure.component';
import { NotificationCustomComponent } from '../notification/notification-custom/notification-custom.component';
import { ModelCustomComponent } from '../notification/model-custom/model-custom.component';
import { NotificationService } from 'src/app/app-common/services/notification.service';
import { IFrameEvent } from 'src/app/app-structural/models/iframe-exchange-data';
import { IframeWrapperComponent } from '../iframe-wrapper/iframe-wrapper.component';
import { IframeService } from 'src/app/app-structural/services/iframe.service';
import { ConfigPanelsService } from 'src/app/app-structural/services/config-panels.service';
import { CommonService } from 'src/app/app-common/services/common.service';
import { LocalStorageService } from 'src/app/app-core/services/local-storage.service';
import { timeStamp } from 'console';
//import { saveAs } from 'file-saver';
@Component({
  selector: 'app-configure',
  templateUrl: './configure.component.html',
  styleUrls: ['./configure.component.css']
})
export class ConfigureComponent implements OnInit, AfterViewInit, OnDestroy {
  private destroy$ = new Subject<void>();
  @ViewChild(NotificationCustomComponent) notifCustomTemplate: NotificationCustomComponent;
  @ViewChild(ModelCustomComponent) modelCustomTemplate: ModelCustomComponent;

  URL: string = '/assets/static-pages/ThreeDCanvas.html';
  problem: BpsUnifiedProblem;
  rightPanelOpened: boolean;
  public iframeEvent: Subject<IFrameEvent> = new Subject<IFrameEvent>();
  isLoaded: boolean = false;
  PresignedURL: string | undefined;
  DisabledApplyBtnForGlass: boolean = false;
  disabledApplyBtnForOperability: boolean = false;
  showViewer: boolean = false;
  problemGuid: string;
  @ViewChild('iframeWrapper') iFrameComponent: IframeWrapperComponent;
  @ViewChild('LeftConfigure') leftConfigureComponent: LeftConfigureComponent;
  public unified3DModel: BpsUnifiedModel = null;
  selectedGlassIds = [];
  event3D: any;
  // physicNproductStatus: any;
  isGlassPanelActive: boolean = false;
  isFramingActive: boolean = false;
  isOperabilityActive: boolean = false;
  canBeDrawnBool: boolean = false;
  pressureValues: any;
  showLoader: boolean = false;
  public style: object = {};
  LibraryFrameInputArticle: any;
  activePanel: any = { operabilityIsOneGlassApplied: false, operability: false, glassNpanel: false, framing: false, structural: false };
  systemSelected: string;
  systemFacadeSelected: string;
  systemFacadeSelectedFromFraming: string;
  dinWindLoad: any;
  spacerTypeArticle: any;
  isSavedClicked: boolean = false;
  previousProblemSetting: ProblemSetting;
  previousUnifiedProblem: BpsUnifiedModel;
  noSaveFlow: boolean = false;
  isResizingRightPanel: boolean = false;
  closeNdisableRightPanelBool: boolean;
  showDimensions: boolean = false;
  structuralTableFormData: any;

  isAccordianOpen: boolean = false;
  // quickCheckPassed: boolean;
  disableCheckout: boolean;

  //order placed check
  isOrderPlaced: boolean = false;
  handlePosition: number;
  projectGuid: string;
  problemList: BpsUnifiedProblem[]; 
  constructor(private navLayoutService: NavLayoutService,
    private configureService: ConfigureService,
    private umService: UnifiedModelService,
    private iframeService: IframeService,
    private router: Router,
    private localStorageService: LocalStorageService,
    private notification: NotificationService,
    private resultService: ResultService,
    private modalService: NzModalService,
    private commonService: CommonService,
    private permissionService: PermissionService,
    private cpService: ConfigPanelsService) { }

  ngOnInit(): void {
    //#region Load JSON
    this.umService.obsLoadJSON.pipe(takeUntil(this.destroy$)).subscribe(
      response => {
        if (response) {
          this.iframeService.loadJSON(this.iframeEvent, 'loadJSON', response);
        }
      });
    //#endregion
    //#region Load JSON
    this.umService.obsTakeScreenShot.pipe(takeUntil(this.destroy$)).subscribe(
      response => {
        if (response) {
          setTimeout(() => {
            this.iframeEvent.next(new IFrameEvent('takeScreenShot', {}));
             this.showLoader = false;
          }, 100);
        }
      });
    //#endregion
   
    //#region Loader
    this.iframeService.sendShowLoaderObs.pipe(takeUntil(this.destroy$)).subscribe(
      response => {
        setTimeout(() => { this.showLoader = response; }, 1);
      });
    //#endregion
    //#region nav Layout
    //isEmpty: boolean, navBarVisibility: boolean, navBarAndTitleVisibility: boolean
    this.navLayoutService.changeNavBarSettings(false,true,true)
    //#endregion
    //#region right Panel
    this.rightPanelOpened = this.configureService.rightPanelOpened;
    this.configureService.rightPanelOpenedSubject.pipe(takeUntil(this.destroy$)).subscribe(isDisplay => {
      this.rightPanelOpened = isDisplay;
    });
    //#endregion
    //#region set application type & user access role
    this.configureService.applicationType = this.commonService.getApplicationType();
    this.configureService.userAccessRole = this.configureService.applicationType == "SRS" ? this.commonService.getUser().AccessRoles[0] : "";
    //#endregion

    //#region to save the current unified model whenever unified model changes
    this.unified3DModel = this.umService.current_UnifiedModel;
    this.umService.obsUnifiedModel.subscribe(
      response => {
        if (response) {
          this.unified3DModel = response;
          this.configureService.updateProblem(this.unified3DModel);
        }
      });
    //#endregion


    this.configureService.GetProblemByGuid(this.navLayoutService.getRouteParam('problemGuid'));
    this.configureService.problemSubject.pipe(takeUntil(this.destroy$)).subscribe(problem => {
      this.configureService.lastModifiedDateForUM = null;
      this.problem = problem;
      this.problemGuid = problem.ProblemGuid;
      this.showViewer = true;
      this.isOrderPlaced = problem.OrderPlaced;
      this.unified3DModel = JSON.parse(problem.UnifiedModel);
      if (!this.unified3DModel.UserSetting)
        this.unified3DModel.UserSetting = new UserSetting();
      this.unified3DModel.UserSetting.ApplicationType = this.configureService.applicationType;
      if (this.permissionService.checkPermission(Feature.OrderingApp))
        this.unified3DModel.SRSProblemSetting.isOrderPlaced = problem.OrderPlaced;
      //this.unified3DModel = dummyUnifiedModel;
      this.isAccordianOpen = this.unified3DModel && this.unified3DModel.CollapsedPanels &&
        (this.unified3DModel.CollapsedPanels.Panel_Acoustic || this.unified3DModel.CollapsedPanels.Panel_Configure || this.unified3DModel.CollapsedPanels.Panel_Framing
          || this.unified3DModel.CollapsedPanels.Panel_Glass || this.unified3DModel.CollapsedPanels.Panel_Operability || this.unified3DModel.CollapsedPanels.Panel_SlidingUnit|| this.unified3DModel.CollapsedPanels.Panel_Structural
          || this.unified3DModel.CollapsedPanels.Panel_Thermal);
      

      if (this.unified3DModel) {
        if (!this.unified3DModel.UserSetting)
          this.unified3DModel.UserSetting = new UserSetting();
        if (!this.isSavedClicked && this.noSaveFlow) {
          this.noSaveFlow = false;
          if (this.previousUnifiedProblem) this.previousUnifiedProblem = null;
          this.configureService.isProblemSavedForRightPanel.next(true);
        }
        this.unified3DModel.UserSetting.Language = this.configureService.getLanguage();
        if (!this.unified3DModel.ProblemSetting) {
          this.unified3DModel.ProblemSetting = new ProblemSetting();
          this.unified3DModel.ProblemSetting.EnableAcoustic = false;
          this.unified3DModel.ProblemSetting.EnableStructural = false;
          this.unified3DModel.ProblemSetting.EnableThermal = false;
          this.unified3DModel.ProblemSetting.ProductType = '';
        }
        if (this.unified3DModel.AnalysisResult) {
          this.configureService.sendMessage(true);
        }
        if (this.unified3DModel.ProblemSetting.ProductType == "SlidingDoor" && !this.unified3DModel.ProblemSetting.SlidingDoorType) {
          setTimeout(() => { this.showLoader = false; }, 2000);
        }
        else {
          this.canBeDrawnBool = true;
          setTimeout(() => { this.showLoader = true; }, 1);
          this.loadJSONService({ Unified3DModel: this.unified3DModel, canBeDrawn: this.canBeDrawnBool });
        }
      }
    });
   

    this.configureService.saveProblemSubject.pipe(takeUntil(this.destroy$)).subscribe((isSaveClicked) => {
      if (isSaveClicked && !this.isSavedClicked) {
        this.isSavedClicked = isSaveClicked;
        this.iframeEvent.next(new IFrameEvent('takeScreenShot', {}));
      }
    });

    
    this.configureService.saveProblemFromRightPanelSubject.pipe(takeUntil(this.destroy$)).subscribe((isSaveClicked) => {
      if (isSaveClicked && !this.isSavedClicked) {
        this.previousUnifiedProblem = this.unified3DModel;
        this.previousProblemSetting = this.previousUnifiedProblem.ProblemSetting;
        this.isSavedClicked = isSaveClicked;
        this.configureService.isSaved = true;
        if (this.configureService.lastModifiedDateForUM &&
          this.configureService.lastModifiedDateForUM.getTime() != new Date(this.problem.ModifiedOn).getTime()) {
          this.configureService.lastModifiedDateForUM = null;
          this.iframeEvent.next(new IFrameEvent('takeScreenShot', {}));
        }
        else {
          this.isSavedClicked = false;
          this.noSaveFlow = false;
          if (this.previousUnifiedProblem) {
            this.previousUnifiedProblem = null;
          }
          this.configureService.isProblemSavedForRightPanel.next(true);
        }
      } else {
        // this.previousUnifiedProblem = null;
      }
    });
    this.configureService.runLoadJson.pipe(takeUntil(this.destroy$)).subscribe((val) => {
      if (val) {
        if (this.previousProblemSetting) {
          this.unified3DModel.ProblemSetting = this.previousProblemSetting;
        }
        this.showDimensions = true;
        this.onChildEvents({ eventType: "readyState", value: true });
        this.showDimensions = false;
      }
    });
    this.configureService.runLoadJsonSelect.pipe(takeUntil(this.destroy$)).subscribe((val) => {
      if (val) {
        this.showDimensions = true;
        this.onChildEvents({ eventType: "readyState", value: true });
        this.showDimensions = false;
      }
    });
    this.configureService.editConfigurationName.pipe(takeUntil(this.destroy$)).subscribe((editedName) => {
      this.unified3DModel.ProblemSetting.ConfigurationName = editedName;
      this.problem.ProblemName = editedName;
    });
    this.umService.obsNotificaionShow.subscribe((event) => {
      this.ngNotificaionShow(event);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  ngAfterViewInit() { }

  ngNotificaionShow(event: any) {
    this.notifCustomTemplate.notificationShow(event.title, event.message, event.logoToShow);
  }
  ngModelShow(event: any) {
    this.modelCustomTemplate.modelShow('', event.message);
  }
  @HostListener('document:click')
  clickout() {
    // this.notifCustomTemplate.notificationRemove();
  }

  onLoaded(loaded: boolean) {
    setTimeout(() => { this.showLoader = loaded; }, 1);
  }

  onChildEvents(event: any) {
    this.event3D = event;
    switch (event.eventType) {
      case 'screeshotImage':
        if (this.umService.takeScreenShot) this.saveScreenShot(event.value);
        else this.runAnalysisResults(event.value);
        break;
      case 'readyState':
        if (event.value && this.unified3DModel) {
          if (this.canBeDrawnBool) setTimeout(() => { this.showLoader = true; }, 1);
          if (this.unified3DModel.ProblemSetting.ProductType == "Facade") {

          }
          if (this.configureService.isDefaultProblemCreatedFromRightPanel) {
            this.configureService.isDefaultProblemCreatedFromRightPanel = false;
            this.iframeEvent.next(new IFrameEvent('removeModel'));

          }
          //this.canBeDrawnBool = true;
          setTimeout(() => {
            this.loadJSONService({ Unified3DModel: this.unified3DModel, canBeDrawn: this.canBeDrawnBool, resetCamera: !this.isAccordianOpen });
            if (this.showDimensions && this.canBeDrawnBool)
              this.iframeEvent.next(new IFrameEvent('clickControlEdit'));
          }, 100);

        }
        break;
      case 'changeUnifiedModel':
        this.umService.setUnifiedModel(this.event3D.value);
        this.unified3DModel = this.event3D.value;
        break;
      case 'addClass':
        if (event.value && event.value.name == "disableGlassApplyBtn")
          switch (event.value.name) {
            case 'disableGlassApplyBtn':
              this.DisabledApplyBtnForGlass = true;
              break;
            case 'disableOperabilityApplyBtn':
              this.disabledApplyBtnForOperability = true;
              break;
          }
        break;
      case 'removeClass':
        if (event.value && event.value.name == "enableApplyBtn")
          this.DisabledApplyBtnForGlass = false;
        break;
      case 'loadJSONFinished':
        setTimeout(() => {
          if (this.isAccordianOpen) this.leftConfigureComponent.displaySettingPerAccordian();
          this.showLoader = false;
        }, 10);
        break;
      case 'selectWarningSymbol':
        const warningMsg = this.event3D.value.warningMessage;
        this.modalService.confirm({
          nzWrapClassName: "vertical-center-modal",
          nzWidth: '490px',
          nzTitle: '',
          nzContent: warningMsg.join("\r\n"),
          nzCancelText: null,
          nzOnCancel: () => null,
          nzOkText: 'Ok',
        });
        break;
      case 'runQuickCheck':
        if (this.unified3DModel.SRSProblemSetting && event.value) {
          this.unified3DModel.SRSProblemSetting.QuickCheckPassed = event.value.quickCheckPassed;
          this.configureService.quickCheckPassed.next(event.value.quickCheckPassed);
        }
        break;
      case 'snapHandleHeightInputField':
        this.handlePosition = event.value;
        break;
    }
    

  }

  updateProblem() {
    this.iframeEvent.next(new IFrameEvent('takeScreenShot', {}));
    //Notes: code moved to onChildEvents -> screeshotImage
    // this.configureService.updateProblem(this.unified3DModel).pipe(takeUntil(this.destroy$)).subscribe((response) => {
    //   if(response){
    //     this.configureService.sendMessage(true);
    //     this.runAnalysisResults();
    //   } else{
    //     this.configureService.sendMessage(false);
    //   }
    // }); // Notes: Need updated api

  }
  saveAndScrennshotCalls(unifiedModel: BpsUnifiedModel, imageData: string) {
    this.unified3DModel.UserSetting.Language = this.localStorageService.getValue("culture") ? this.localStorageService.getValue("culture") : "en-US";
    if (!unifiedModel.ModelInput.Thermal) { unifiedModel.ModelInput.Thermal = new Thermal(); }
    unifiedModel.ModelInput.Thermal.InsulationZone = unifiedModel.ModelInput.FrameSystem.InsulationZone;
    let calls = [];
    calls.push(this.configureService.updateProblem(unifiedModel));
    calls.push(this.configureService.saveProblemScreenShot({ problemGuid: unifiedModel.ProblemSetting ? unifiedModel.ProblemSetting.ProblemGuid : null, imageData: imageData }));
    zip(...calls).pipe(takeUntil(this.destroy$)).subscribe((responses) => {
      setTimeout(() => {
        this.configureService.areRightPanelButtonsClicked = false;
        this.configureService.areRightPanelButtonsDisabled = false;
      },2000);
      if (this.isSavedClicked) this.configureService.isProblemSavedFromNavBar.next(true);
      this.isSavedClicked = false;
      if (this.previousUnifiedProblem) {
        this.previousUnifiedProblem = null;
        this.configureService.isProblemSavedForRightPanel.next(true);
      }
    }, (error) => {
      this.isSavedClicked = false;
    });
  }

 
  saveScreenShot(imageData: string) { 
    if (this.previousUnifiedProblem) {
      this.saveAndScrennshotCalls(this.previousUnifiedProblem, imageData);
    } else {
      this.saveAndScrennshotCalls(this.unified3DModel, imageData);
    }
    this.umService.takeScreenShot = false;
  }
  runAnalysisResults(imageData: string) {
    if (this.isSavedClicked) {
      if (this.previousUnifiedProblem) {
        this.saveAndScrennshotCalls(this.previousUnifiedProblem, imageData);
      } else {
        this.saveAndScrennshotCalls(this.unified3DModel, imageData);
      }
    } else if (this.configureService.areRightPanelButtonsClicked) {
      this.showLoader = true;
      this.configureService.areRightPanelButtonsDisabled = true;
      setTimeout(() => {
        this.showLoader = false;
        this.configureService.areRightPanelButtonsClicked = false;
        this.configureService.areRightPanelButtonsDisabled = false;
      },4000);
    } else {
      setTimeout(() => { this.showLoader = true; }, 1);
      this.unified3DModel.UserSetting.Language = this.localStorageService.getValue("culture") ? this.localStorageService.getValue("culture") : "en-US";
      //call ReadSectional Properties if Structural is selected
      if (this.unified3DModel.ProblemSetting.EnableStructural || this.unified3DModel.ProblemSetting.EnableAcoustic || this.unified3DModel.ProblemSetting.EnableThermal) {
        //Remove this later in next release
        if (!this.unified3DModel.ModelInput.Thermal) { this.unified3DModel.ModelInput.Thermal = new Thermal(); }
        this.unified3DModel.ModelInput.Thermal.InsulationZone = this.unified3DModel.ModelInput.FrameSystem.InsulationZone;
        if (this.unified3DModel.ProblemSetting.ProductType === "Window") {
          this.configureService.ReadSectionProperties(this.unified3DModel).pipe(takeUntil(this.destroy$)).subscribe((unifiedModel) => {
            this.ComputeModules(unifiedModel, imageData);
          });
        }
        else {
          this.configureService.ReadSectionProperties(this.unified3DModel).pipe(takeUntil(this.destroy$)).subscribe((unifiedModel) => {
            this.ComputeModules(unifiedModel, imageData);
          });
        }
      } else if (this.permissionService.checkPermission(Feature.ReadSectionMultiCall)) {
        //send ReadSection call for all the orders
        let unified3DModel = JSON.parse(this.problemList[0].UnifiedModel);
        let counter = this.problemList.length; //5 problems
        this.ReadSectionSRS(counter, imageData);
        setTimeout(() => { this.showLoader = true; }, 1);
      }
    }
  }
  ReadSectionSRS(counter: number, imageData) {
    if (counter > 0) {
      let unified3DModel: BpsUnifiedModel = JSON.parse(this.problemList[this.problemList.length - counter].UnifiedModel);
      if (this.problemGuid == unified3DModel.ProblemSetting.ProblemGuid)
        unified3DModel = this.unified3DModel;
      this.configureService.ReadSectionProperties(unified3DModel).pipe(takeUntil(this.destroy$)).subscribe((unifiedModel) => {
        this.problemList[this.problemList.length - counter].UnifiedModel = JSON.stringify(unifiedModel);
        if (counter == 1) {
          this.ComputeModulesSRS(imageData);
        }
        counter--;

        this.ReadSectionSRS(counter, imageData);

      });
    }

  }
  timerId: any;
  onProblemListUpdateFromRight(problems) {
    if (problems) {
      this.problemList = problems;
    }
  }

  //Call run Analysis for all the Orders
  ComputeModulesSRS(imageData: string) {
    //if (unified3DModel) {
    this.timerId = setInterval(() => { this.showLoader = true; }, 200);
    //this.unified3DModel = unifiedModel;
    this.resultService.physicsTypeSelected = "";
    let calls = [];
    let isScreenshotFirstTime: Boolean = true;
    if (this.permissionService.checkPermission(Feature.RunAnalysisMultiCall) && this.problemList) {
      let uploadResultCalls = [];
      let isAnalysisFailed: boolean = false;
      this.problemList.forEach(problem => {
        let calls = [];
        let unified3DModel = JSON.parse(problem.UnifiedModel);
        if (!(unified3DModel.ProblemSetting.ProductType === "Window" && unified3DModel.ModelInput.Geometry.PanelSystems.length > 0)) {
          if (unified3DModel.ModelInput.FrameSystem.SystemType !== 'ADS 75') {
            if(unified3DModel.ModelInput.FrameSystem.SystemType !== 'ASE 60') {
              calls.push(this.resultService.runAcousticAnalysis(unified3DModel, this.configureService.applicationType));
              calls.push(this.resultService.runThermalAnalysis(unified3DModel, this.configureService.applicationType));
            } else {
              calls.push(this.resultService.runThermalAnalysis(unified3DModel, this.configureService.applicationType));
            }           
          }
          else if (unified3DModel.ModelInput.FrameSystem.SystemType === 'ADS 75') {
            calls.push(this.resultService.runThermalAnalysis(unified3DModel, this.configureService.applicationType));
          }
        }
        if (unified3DModel.ModelInput.FrameSystem.SystemType !== 'ASE 60') {
          calls.push(this.resultService.runStructuralAnalysis(unified3DModel, this.configureService.applicationType));
        }
        

        if (imageData && isScreenshotFirstTime) { //save screenshot
          isScreenshotFirstTime = false;
          calls.push(this.configureService.saveProblemScreenShot({ problemGuid: this.problem.ProblemGuid, imageData: imageData }));
        }
        let isAnalysisFailed: boolean = false;
        zip(...calls).pipe(takeUntil(this.destroy$))
          .subscribe((responses) => {
            responses.forEach((response: any) => {
              if (response) {
                switch (response.type) {
                  case "acoustic":
                    if (response.data && response.data.AnalysisResult && response.data.AnalysisResult.AcousticResult) {
                      if (!unified3DModel.AnalysisResult)
                        unified3DModel.AnalysisResult = new AnalysisResult();
                      unified3DModel.AnalysisResult.AcousticResult = response.data.AnalysisResult.AcousticResult;
                      let postCodeValue = unified3DModel.ModelInput.Structural && unified3DModel.ModelInput.Structural.dinWindLoadInput ?
                        unified3DModel.ModelInput.Structural.dinWindLoadInput.PostCodeValue : "";
                      unified3DModel.ModelInput.Structural = response.data.ModelInput.Structural;
                      if (postCodeValue && postCodeValue !== "") {
                        unified3DModel.ModelInput.Structural.dinWindLoadInput.PostCodeValue = postCodeValue;
                      }
                    }
                    break;
                  case "structural":
                    if (response.data && response.data.AnalysisResult && response.data.AnalysisResult.StructuralResult) {
                      if (!unified3DModel.AnalysisResult)
                        unified3DModel.AnalysisResult = new AnalysisResult();
                      let postCodeValue = unified3DModel.ModelInput.Structural && unified3DModel.ModelInput.Structural.dinWindLoadInput ?
                        unified3DModel.ModelInput.Structural.dinWindLoadInput.PostCodeValue : "";
                      unified3DModel.AnalysisResult.StructuralResult = response.data.AnalysisResult.StructuralResult;
                      unified3DModel.ModelInput.Structural = response.data.ModelInput.Structural;
                      if (postCodeValue && postCodeValue !== "") {
                        unified3DModel.ModelInput.Structural.dinWindLoadInput.PostCodeValue = postCodeValue;
                      }
                    }
                    else if (response.data && response.data.AnalysisResult && response.data.AnalysisResult.FacadeStructuralResult) {
                      if (!unified3DModel.AnalysisResult)
                        unified3DModel.AnalysisResult = new AnalysisResult();
                      unified3DModel.AnalysisResult.FacadeStructuralResult = response.data.AnalysisResult.FacadeStructuralResult;
                      let postCodeValue = unified3DModel.ModelInput.Structural && unified3DModel.ModelInput.Structural.dinWindLoadInput ?
                        unified3DModel.ModelInput.Structural.dinWindLoadInput.PostCodeValue : "";
                      unified3DModel.ModelInput.Structural = response.data.ModelInput.Structural;
                      if (postCodeValue && postCodeValue !== "") {
                        unified3DModel.ModelInput.Structural.dinWindLoadInput.PostCodeValue = postCodeValue;
                      }
                    }
                    else if (response.data && response.data.AnalysisResult && response.data.AnalysisResult.UDCStructuralResult) {
                      if (!unified3DModel.AnalysisResult)
                        unified3DModel.AnalysisResult = new AnalysisResult();
                      unified3DModel.AnalysisResult.UDCStructuralResult = response.data.AnalysisResult.UDCStructuralResult;
                      unified3DModel.ModelInput.Structural = response.data.ModelInput.Structural;
                    }
                    break;
                  case "thermal":
                    if (response.data && response.data.AnalysisResult && response.data.AnalysisResult.ThermalResult) {
                      if (!unified3DModel.AnalysisResult)
                        unified3DModel.AnalysisResult = new AnalysisResult();
                      unified3DModel.AnalysisResult.ThermalResult = response.data.AnalysisResult.ThermalResult;
                      let postCodeValue = unified3DModel.ModelInput.Structural && unified3DModel.ModelInput.Structural.dinWindLoadInput ?
                        unified3DModel.ModelInput.Structural.dinWindLoadInput.PostCodeValue : "";
                      unified3DModel.ModelInput.Structural = response.data.ModelInput.Structural;
                      if (postCodeValue && postCodeValue !== "") {
                        unified3DModel.ModelInput.Structural.dinWindLoadInput.PostCodeValue = postCodeValue;
                      }
                    }
                    break;
                }
              }
            });
            this.onChildEvents({ eventType: "loadJSONFinished", value: true });
            uploadResultCalls.push(this.configureService.updateProblem(unified3DModel));
            //Upload/save the files & the unified model to BPS-backend in db.
            if (uploadResultCalls.length == this.problemList.length)
              this.RedirectOrders(uploadResultCalls, isAnalysisFailed);
          }, error => {
            //Upload/save the files & the unified model to BPS-backend in db.
            isAnalysisFailed = true;
            uploadResultCalls.push(this.configureService.updateProblem(unified3DModel));
            //Upload/save the files & the unified model to BPS-backend in db.
            if (uploadResultCalls.length == this.problemList.length)
              this.RedirectOrders(uploadResultCalls, isAnalysisFailed);
          });
      });
      setTimeout(() => { this.showLoader = true; }, 1);
    }

    // }
  }
  ComputeModules(unifiedModel: any, imageData: string) {
    if (unifiedModel) {
      this.timerId = setInterval(() => { this.showLoader = true; }, 200);
      this.unified3DModel = unifiedModel;
      this.resultService.physicsTypeSelected = "";
      let calls = [];
      if (this.permissionService.checkPermission(Feature.RunAnalysisMultiCall) && this.problemList) {
        this.problemList.forEach(problem => {
          let calls = [];
          let unified3DModel = JSON.parse(problem.UnifiedModel);
          if (!(unified3DModel.ProblemSetting.ProductType === "Window" && unified3DModel.ModelInput.Geometry.PanelSystems.length > 0)) {
            calls.push(this.resultService.runAcousticAnalysis(unified3DModel, this.configureService.applicationType));
            calls.push(this.resultService.runThermalAnalysis(unified3DModel, this.configureService.applicationType));
          }
          calls.push(this.resultService.runStructuralAnalysis(unified3DModel, this.configureService.applicationType));

          if (imageData) { //save screenshot
            calls.push(this.configureService.saveProblemScreenShot({ problemGuid: this.problem.ProblemGuid, imageData: imageData }));
          }
          zip(...calls).pipe(takeUntil(this.destroy$))
            .subscribe((responses) => {
              responses.forEach((response: any) => {
                if (response) {
                  switch (response.type) {
                    case "acoustic":
                      if (response.data && response.data.AnalysisResult && response.data.AnalysisResult.AcousticResult) {
                        if (!unified3DModel.AnalysisResult)
                          unified3DModel.AnalysisResult = new AnalysisResult();
                        unified3DModel.AnalysisResult.AcousticResult = response.data.AnalysisResult.AcousticResult;
                        let postCodeValue = unified3DModel.ModelInput.Structural && unified3DModel.ModelInput.Structural.dinWindLoadInput ?
                          unified3DModel.ModelInput.Structural.dinWindLoadInput.PostCodeValue : "";
                        unified3DModel.ModelInput.Structural = response.data.ModelInput.Structural;
                        if (postCodeValue && postCodeValue !== "") {
                          unified3DModel.ModelInput.Structural.dinWindLoadInput.PostCodeValue = postCodeValue;
                        }
                      }
                      break;
                    case "structural":
                      if (response.data && response.data.AnalysisResult && response.data.AnalysisResult.StructuralResult) {
                        if (!unified3DModel.AnalysisResult)
                          unified3DModel.AnalysisResult = new AnalysisResult();
                        let postCodeValue = unified3DModel.ModelInput.Structural && unified3DModel.ModelInput.Structural.dinWindLoadInput ?
                          unified3DModel.ModelInput.Structural.dinWindLoadInput.PostCodeValue : "";
                        unified3DModel.AnalysisResult.StructuralResult = response.data.AnalysisResult.StructuralResult;
                        unified3DModel.ModelInput.Structural = response.data.ModelInput.Structural;
                        if (postCodeValue && postCodeValue !== "") {
                          unified3DModel.ModelInput.Structural.dinWindLoadInput.PostCodeValue = postCodeValue;
                        }
                      }
                      else if (response.data && response.data.AnalysisResult && response.data.AnalysisResult.FacadeStructuralResult) {
                        if (!unified3DModel.AnalysisResult)
                          unified3DModel.AnalysisResult = new AnalysisResult();
                        unified3DModel.AnalysisResult.FacadeStructuralResult = response.data.AnalysisResult.FacadeStructuralResult;
                        let postCodeValue = unified3DModel.ModelInput.Structural && unified3DModel.ModelInput.Structural.dinWindLoadInput ?
                          unified3DModel.ModelInput.Structural.dinWindLoadInput.PostCodeValue : "";
                        unified3DModel.ModelInput.Structural = response.data.ModelInput.Structural;
                        if (postCodeValue && postCodeValue !== "") {
                          unified3DModel.ModelInput.Structural.dinWindLoadInput.PostCodeValue = postCodeValue;
                        }
                      }
                      else if (response.data && response.data.AnalysisResult && response.data.AnalysisResult.UDCStructuralResult) {
                        if (!unified3DModel.AnalysisResult)
                          unified3DModel.AnalysisResult = new AnalysisResult();
                        unified3DModel.AnalysisResult.UDCStructuralResult = response.data.AnalysisResult.UDCStructuralResult;
                        unified3DModel.ModelInput.Structural = response.data.ModelInput.Structural;
                      }
                      break;
                    case "thermal":
                      if (response.data && response.data.AnalysisResult && response.data.AnalysisResult.ThermalResult) {
                        if (!unified3DModel.AnalysisResult)
                          unified3DModel.AnalysisResult = new AnalysisResult();
                        unified3DModel.AnalysisResult.ThermalResult = response.data.AnalysisResult.ThermalResult;
                        let postCodeValue = unified3DModel.ModelInput.Structural && unified3DModel.ModelInput.Structural.dinWindLoadInput ?
                          unified3DModel.ModelInput.Structural.dinWindLoadInput.PostCodeValue : "";
                        unified3DModel.ModelInput.Structural = response.data.ModelInput.Structural;
                        if (postCodeValue && postCodeValue !== "") {
                          unified3DModel.ModelInput.Structural.dinWindLoadInput.PostCodeValue = postCodeValue;
                        }
                      }
                      break;
                  }
                }
              });


              let formData: FormData = new FormData();
              let unifiedmodelString = JSON.stringify(unified3DModel);
              formData.append('unifiedModel', unifiedmodelString);
              this.onChildEvents({ eventType: "loadJSONFinished", value: true });
              //Upload/save the files & the unified model to BPS-backend in db.
              this.UploadResults(formData, true);

            }, error => {
              //Upload/save the files & the unified model to BPS-backend in db.
              let formData: FormData = new FormData();
              let unifiedmodelString = JSON.stringify(unified3DModel);
              formData.append('unifiedModel', unifiedmodelString);
              this.UploadResults(formData, false);
            });
        });
        setTimeout(() => { this.showLoader = true; }, 1);
      } else { //BPS Analysis calls
        if (this.unified3DModel.ProblemSetting.EnableAcoustic) {
          if (!(this.unified3DModel.ProblemSetting.ProductType === "Window" && this.unified3DModel.ModelInput.Geometry.PanelSystems.length > 0))
            calls.push(this.resultService.runAcousticAnalysis(this.unified3DModel, this.configureService.applicationType));
        }
        if (this.unified3DModel.ProblemSetting.EnableStructural) {
          calls.push(this.resultService.runStructuralAnalysis(this.unified3DModel, this.configureService.applicationType));
        }
        if (this.unified3DModel.ProblemSetting.EnableThermal) {
          if (!(this.unified3DModel.ProblemSetting.ProductType === "Window" && this.unified3DModel.ModelInput.Geometry.PanelSystems.length > 0))
            calls.push(this.resultService.runThermalAnalysis(this.unified3DModel, this.configureService.applicationType));
        }
        if (imageData) { //save screenshot
          calls.push(this.configureService.saveProblemScreenShot({ problemGuid: this.problem.ProblemGuid, imageData: imageData }));
        }
        zip(...calls).pipe(takeUntil(this.destroy$))
          .subscribe((responses) => {
            responses.forEach((response: any) => {
              if (response) {
                switch (response.type) {
                  case "acoustic":
                    if (response.data && response.data.AnalysisResult && response.data.AnalysisResult.AcousticResult) {
                      if (!this.unified3DModel.AnalysisResult)
                        this.unified3DModel.AnalysisResult = new AnalysisResult();
                      this.unified3DModel.AnalysisResult.AcousticResult = response.data.AnalysisResult.AcousticResult;
                      let postCodeValue = this.unified3DModel.ModelInput.Structural && this.unified3DModel.ModelInput.Structural.dinWindLoadInput ?
                        this.unified3DModel.ModelInput.Structural.dinWindLoadInput.PostCodeValue : "";
                      this.unified3DModel.ModelInput.Structural = response.data.ModelInput.Structural;
                      if (postCodeValue && postCodeValue !== "") {
                        this.unified3DModel.ModelInput.Structural.dinWindLoadInput.PostCodeValue = postCodeValue;
                      }
                    }
                    break;
                  case "structural":
                    if (response.data && response.data.AnalysisResult && response.data.AnalysisResult.StructuralResult) {
                      if (!this.unified3DModel.AnalysisResult)
                        this.unified3DModel.AnalysisResult = new AnalysisResult();
                      let postCodeValue = this.unified3DModel.ModelInput.Structural && this.unified3DModel.ModelInput.Structural.dinWindLoadInput ?
                        this.unified3DModel.ModelInput.Structural.dinWindLoadInput.PostCodeValue : "";
                      this.unified3DModel.AnalysisResult.StructuralResult = response.data.AnalysisResult.StructuralResult;
                      this.unified3DModel.ModelInput.Structural = response.data.ModelInput.Structural;
                      if (postCodeValue && postCodeValue !== "") {
                        this.unified3DModel.ModelInput.Structural.dinWindLoadInput.PostCodeValue = postCodeValue;
                      }
                    }
                    else if (response.data && response.data.AnalysisResult && response.data.AnalysisResult.FacadeStructuralResult) {
                      if (!this.unified3DModel.AnalysisResult)
                        this.unified3DModel.AnalysisResult = new AnalysisResult();
                      this.unified3DModel.AnalysisResult.FacadeStructuralResult = response.data.AnalysisResult.FacadeStructuralResult;
                      let postCodeValue = this.unified3DModel.ModelInput.Structural && this.unified3DModel.ModelInput.Structural.dinWindLoadInput ?
                        this.unified3DModel.ModelInput.Structural.dinWindLoadInput.PostCodeValue : "";
                      this.unified3DModel.ModelInput.Structural = response.data.ModelInput.Structural;
                      if (postCodeValue && postCodeValue !== "") {
                        this.unified3DModel.ModelInput.Structural.dinWindLoadInput.PostCodeValue = postCodeValue;
                      }
                    }
                    else if (response.data && response.data.AnalysisResult && response.data.AnalysisResult.UDCStructuralResult) {
                      if (!this.unified3DModel.AnalysisResult)
                        this.unified3DModel.AnalysisResult = new AnalysisResult();
                      this.unified3DModel.AnalysisResult.UDCStructuralResult = response.data.AnalysisResult.UDCStructuralResult;
                      this.unified3DModel.ModelInput.Structural = response.data.ModelInput.Structural;
                    }
                    break;
                  case "thermal":
                    if (response.data && response.data.AnalysisResult && response.data.AnalysisResult.ThermalResult) {
                      if (!this.unified3DModel.AnalysisResult)
                        this.unified3DModel.AnalysisResult = new AnalysisResult();
                      this.unified3DModel.AnalysisResult.ThermalResult = response.data.AnalysisResult.ThermalResult;
                      let postCodeValue = this.unified3DModel.ModelInput.Structural && this.unified3DModel.ModelInput.Structural.dinWindLoadInput ?
                        this.unified3DModel.ModelInput.Structural.dinWindLoadInput.PostCodeValue : "";
                      this.unified3DModel.ModelInput.Structural = response.data.ModelInput.Structural;
                      if (postCodeValue && postCodeValue !== "") {
                        this.unified3DModel.ModelInput.Structural.dinWindLoadInput.PostCodeValue = postCodeValue;
                      }
                    }
                    break;
                }
              }
            });
          }, error => {
            //Upload/save the files & the unified model to BPS-backend in db.
            let formData: FormData = new FormData();
            let unifiedmodelString = JSON.stringify(this.unified3DModel);
            formData.append('unifiedModel', unifiedmodelString);
            this.UploadResults(formData, false);
          }, () => {
            let formData: FormData = new FormData();
            let unifiedmodelString = JSON.stringify(this.unified3DModel);
            formData.append('unifiedModel', unifiedmodelString);
            this.onChildEvents({ eventType: "loadJSONFinished", value: true });
            //Upload/save the files & the unified model to BPS-backend in db.
            this.UploadResults(formData, true);
          });
      }

    }
  }

  RedirectOrders(uploadResultCalls, isAnalysisFailed: boolean = false) {
    forkJoin(...uploadResultCalls).pipe(takeUntil(this.destroy$)).subscribe(
      response => {
        if (response) {
          if (!isAnalysisFailed) {
            this.configureService.sendMessage(true);
            this.router.navigate(['/orders/', this.problem.ProblemGuid]);
            this.onClearInterval();
          } else {
            this.configureService.sendMessage(false);
            this.onClearInterval();
            this.notification.ErrorNotification('Compute Error', 'Failed to compute the problem because one of the module failed.')

          }
        }
      }, err => {
        this.configureService.sendMessage(false);
        this.onClearInterval();
        this.notification.ErrorNotification('Compute Error', 'Failed to compute the problem because one of the module failed.')

      },
      () => console.log('Ok ')
    );
  }
  UploadProblemsSRS(unifiedModel: BpsUnifiedModel, isSuccess: boolean = true) {
    setTimeout(() => { this.showLoader = true; }, 1);
    this.configureService.updateProblem(unifiedModel).pipe(takeUntil(this.destroy$)).subscribe((response) => {
      if (response) {
        if (isSuccess) {
          this.configureService.sendMessage(true);
          this.router.navigate(['/orders/', this.problem.ProblemGuid]);
          this.onClearInterval();
        } else {
          this.configureService.sendMessage(false);
          this.onClearInterval();
          this.notification.ErrorNotification('Compute Error', 'Failed to compute the problem because one of the module failed.')
        }

      } else {
        this.configureService.sendMessage(false);
        this.onClearInterval();
      }
    }, error => {
      this.onClearInterval();
    });
  }

  UploadResults(formData: FormData, isSuccess: boolean) {
    setTimeout(() => { this.showLoader = true; }, 1);
    this.configureService.uploadResults(formData).pipe(takeUntil(this.destroy$)).subscribe((response) => {
      if (response) {
        this.unified3DModel = response;
        if (isSuccess) {
          this.configureService.sendMessage(true);
          if (this.permissionService.checkPermission(Feature.MyOrder))
            this.router.navigate(['/orders/', this.problem.ProblemGuid]);
          else if (this.permissionService.checkPermission(Feature.Result))
            this.router.navigate(['/result/', this.problem.ProblemGuid]);
          this.onClearInterval();
        } else {
          this.configureService.sendMessage(false);
          this.onClearInterval();
          this.notification.ErrorNotification('Compute Error', 'Failed to compute the problem because one of the module failed.')
        }

      } else {
        this.configureService.sendMessage(false);
        this.onClearInterval();
      }
    }, error => {
      this.onClearInterval();
    });
  }
  onClearInterval() {
    this.configureService.sendMessage(false);
    if (this.timerId)
      clearInterval(this.timerId);
    this.showLoader = false;
  }
  ErrorMessage() {

  }
  onComputeClicked(event: BpsUnifiedModel) {
    this.unified3DModel = event;
    this.updateProblem();

  }
  onCheckoutClicked(event: boolean) { //for SRS
    if (event) {
      this.updateProblem();

    }


  }
  onOpenCloseRightPanel(): void {
    if (!this.closeNdisableRightPanelBool) {
      this.iframeEvent.next(new IFrameEvent('centerForRightPanel'));
      this.configureService.changeRightPanelDisplay();
    }
  }

  changePhysicsNProductStatus(unified3DModel_fromLeftConfigure: any): void {
    this.unified3DModel = unified3DModel_fromLeftConfigure;
    if (Boolean(this.unified3DModel.ProblemSetting.ProductType)
      && (!this.permissionService.checkPermission(Feature.PhysicsTypes) || this.unified3DModel.ProblemSetting.EnableAcoustic || this.unified3DModel.ProblemSetting.EnableStructural || this.unified3DModel.ProblemSetting.EnableThermal)) {

      if (!this.canBeDrawnBool && (!this.permissionService.checkPermission(Feature.PhysicsTypes) || ((this.unified3DModel.ProblemSetting.EnableAcoustic && !this.unified3DModel.ProblemSetting.EnableStructural && !this.unified3DModel.ProblemSetting.EnableThermal)
        || (!this.unified3DModel.ProblemSetting.EnableAcoustic && this.unified3DModel.ProblemSetting.EnableStructural && !this.unified3DModel.ProblemSetting.EnableThermal)
        || (!this.unified3DModel.ProblemSetting.EnableAcoustic && !this.unified3DModel.ProblemSetting.EnableStructural && this.unified3DModel.ProblemSetting.EnableThermal))))
        setTimeout(() => { this.showLoader = true; }, 1);
      this.canBeDrawnBool = true;
      this.loadJSONService({ Unified3DModel: this.unified3DModel, canBeDrawn: this.canBeDrawnBool });
      if (this.canBeDrawnBool) this.iframeEvent.next(new IFrameEvent('clickControlEdit'));
      //disableresult
      this.configureService.computeClickedSubject.next(false);
    }
  }

  onChangeProductType() {
    if (this.iFrameComponent) {
      this.iFrameComponent.collectDataAfterProductChange();
    }
  }

  listenForRightPanel(problem: BpsUnifiedProblem) {
    this.problem = problem;
    this.unified3DModel = JSON.parse(problem.UnifiedModel);
    setTimeout(() => { this.showLoader = true; }, 1);
    this.loadJSONService({ Unified3DModel: this.unified3DModel, canBeDrawn: this.canBeDrawnBool });
  }

  onOpenCloseGlassPanelTableFromLeftPanel(article: any) {
    if (this.iFrameComponent) {
      this.iFrameComponent.selectRowInGlassNPanel(article);
    }
    setTimeout(() => {
      this.onCloseSpacerTypePopout();
    }, 10);
  }

  getActivePanelValue(ActivePanel) {
    if (ActivePanel.operabilitypanel ||
      ActivePanel.acousticpanel ||
      ActivePanel.thermalpanel ||
      ActivePanel.loadpanel ||
      ActivePanel.glassNpanel ||
      ActivePanel.framing ||
      ActivePanel.structural) { this.isAccordianOpen = true; }

    this.activePanel = ActivePanel;
    this.isGlassPanelActive = ActivePanel.glassNpanel;
    this.isFramingActive = ActivePanel.framing;
    this.isOperabilityActive = ActivePanel.operability;
    this.cpService.setOperabilityPanelActive(this.isOperabilityActive);
    if (!this.isFramingActive && this.iFrameComponent) {
      this.iFrameComponent.closeFramingPopouts();
    }
  }

  onOpenLeftStructuralTable() {
    if (this.iFrameComponent) {
      this.iFrameComponent.onOpenStructuralTable();
    }
  }

  sendPressureValue(event) {
    this.pressureValues = event;
  }

  onCloseFramingPopouts() {
    if (this.iFrameComponent) {
      this.iFrameComponent.closeFramingPopouts();
    }
  }

  onCloseSpacerTypePopout() {
    if (this.iFrameComponent) {
      this.iFrameComponent.onCloseSpacerTypePopout();
    }
  }

  validate(event: ResizeEvent): boolean {
    const MIN_DIMENSIONS_PX: number = 235;
    const MAX_DIMENSIONS_PX: number = 520;
    if (
      event.rectangle.width && ((event.rectangle.width < MIN_DIMENSIONS_PX) || (event.rectangle.width > MAX_DIMENSIONS_PX))
    ) {
      return false;
    }
    return true;
  }

  onResizeEnd(event: ResizeEvent): void {
    this.style = {
      left: `${event.rectangle.left}px`,
      width: `${event.rectangle.width}px`,
    };
    this.isResizingRightPanel = false;
  }

  onResizeStart(event: ResizeEvent): void {
    this.isResizingRightPanel = true;
  }

  
  changeLibraryInputValue(article) {
    setTimeout(() => {
      this.LibraryFrameInputArticle = article;
    }, 10);
  }

  onSystemSelected(system) {
    setTimeout(() => {
      this.systemSelected = system;
    }, 10);
  }

  onSystemFacadeSelected(system) {
    setTimeout(() => {
      this.systemFacadeSelected = system;
    }, 10);
  }

  onSystemFacadeSelectedFromFraming(system) {
    setTimeout(() => {
      this.systemFacadeSelectedFromFraming = system;
    }, 10);
  }

  onClosePopouts() {
    this.closeAllTables();
  }
  closeAllTables() {
    this.onCloseFramingPopouts();
    this.onCloseSpacerTypePopout();
    this.onCloseStructuralTable();
  }


  sendDinWindLoadToTable(dinWindLoad) {
    this.dinWindLoad = dinWindLoad;
  }

  closeSolverButton() {
    if (this.leftConfigureComponent) {
      this.leftConfigureComponent.onCloseSolverContent();
    }
  }

  confirmSpacerType(event) {
    this.spacerTypeArticle = event;
  }

  getSpacerTypeByKey(event) {
    if (this.iFrameComponent) {
      this.iFrameComponent.getSpacerTypeByKey(event);
    }
  }

  onCloseStructuralTable() {
    if (this.iFrameComponent) {
      this.iFrameComponent.onCloseStructuralTable();
    }
  }

  clearStructuralTable() {
    if (this.iFrameComponent) {
      this.iFrameComponent.clearStructuralTable();
    }
  }

  closeNdisableRightPanel(bool: boolean) {
    this.closeNdisableRightPanelBool = bool;
    if (bool) {
      if (this.rightPanelOpened) {
        this.configureService.changeRightPanelDisplay();
      }
    }
  }
  isOrderValid(val) {
    this.disableCheckout = val;
  }
  onwindPressureChangeFromChildren(value: number) {
    if (value) {
      this.unified3DModel.ModelInput.Structural.WindLoad = value;
      let displaySettings: any;
      displaySettings = {
        enableOrbitControls: true,
        showAxes: false,
        showBCSymbols: true,
        showControls: true,
        showGlassID: false,
        showGlazingTypeColor: false,
        showGrid: true,
        showThermalResultLabel: false,
        showThreeDView: false,
        showVentInfo: false,
        showQuickCheckSymbols: true
      };
      this.iframeEvent.next(new IFrameEvent('loadDisplaySetting', { settings: displaySettings }));
    }
  }

  onProfileColorChangeFromChildren(obj: any) {
    this.unified3DModel.ModelInput.FrameSystem.AluminumColor = obj.value;
  }
  setSubTotalFromChild(subTotal: number) {
    if (subTotal) {
      if (this.unified3DModel.SRSProblemSetting !== undefined && this.unified3DModel.SRSProblemSetting !== null)
        this.unified3DModel.SRSProblemSetting.SubTotal = subTotal;
    }
  }

  onGetUnified3DModelFromChildren(child_unified3DModel: any): void {
    this.unified3DModel = child_unified3DModel;
    this.umService.setUnifiedModel(child_unified3DModel);
  }

  sendFormData(data) {
    this.structuralTableFormData = data;
  }

  loadJSONService(data: any) {
    this.iframeService.loadJSON(this.iframeEvent, 'loadJSON', data);
  }
}
