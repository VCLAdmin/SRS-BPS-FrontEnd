import { Component, OnInit, Input, OnChanges, SimpleChanges, Output, EventEmitter, OnDestroy, ViewChild } from '@angular/core';
import { BpsUnifiedModel, FrameSystem, OperabilitySystem, DoorSystem } from 'src/app/app-common/models/bps-unified-model';
import { Subject, Subscription } from 'rxjs';
import { IFrameEvent } from 'src/app/app-structural/models/iframe-exchange-data';
import { ConfigureService } from 'src/app/app-structural/services/configure.service';
import { TranslateService } from '@ngx-translate/core';
import { _ } from '@biesbjerg/ngx-translate-extract/dist/utils/utils';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LeftConfigureComponent } from '../left-configure/left-configure.component';
import { NzModalService } from 'ng-zorro-antd';
import { UnifiedModelService } from 'src/app/app-structural/services/unified-model.service';
import { ConfigPanelsService } from 'src/app/app-structural/services/config-panels.service';
import { PanelsModule } from 'src/app/app-structural/models/panels/panels.module';
import { IframeService } from 'src/app/app-structural/services/iframe.service';
import { Feature } from 'src/app/app-core/models/feature';
import { PermissionService } from 'src/app/app-core/services/permission.service';
import { takeUntil } from 'rxjs/operators';
import { RightResultComponent } from '../../result/right-result/right-result.component';
import { NotificationCustomComponent } from '../notification/notification-custom/notification-custom.component';

@Component({
  selector: 'app-operability',
  templateUrl: './operability.component.html',
  styleUrls: ['./operability.component.css']
})
export class OperabilityComponent implements OnInit, OnChanges, OnDestroy {
  // @ViewChild(NotificationCustomComponent) notifCustomTemplate: NotificationCustomComponent;

  // ngNotificaionShow(event: any) {
  //   this.notifCustomTemplate.notificationShow(event.title, event.message, event.logoToShow);
  // }
  private destroy$ = new Subject<void>();
  @Output() unified3DModelFromOperabilityEvent: EventEmitter<BpsUnifiedModel> = new EventEmitter<BpsUnifiedModel>();
  @Input() iframeEvent: Subject<IFrameEvent>;
  @Input() unified3DModel: BpsUnifiedModel;
  @Input() onOpenCloseFrameCombinationPopoutEvent: EventEmitter<any>;
  @Input() unified3DModelEvent: EventEmitter<BpsUnifiedModel>;
  @Input() event3D: any;
  @Input() canBeDrawnBool: boolean;
  @Input() systemFacadeSelectedEvent: EventEmitter<any>;
  @Input() onCloseFramingPopoutsEvent: EventEmitter<any>;
  @Output() ngNotificaionShow: EventEmitter<any> = new EventEmitter<any>();
  //isSystemFacadeChanged: number = 0;   // skip two calls of Changes.unifiedModel when system changes (no call when equals to 1 or 2)
  isOuterOpened: boolean = false;
  isVentOpened: boolean = false;
  isDoorLeafActiveOpened: boolean = false;
  isDoorLeafPassiveOpened: boolean = false;
  isSillProfileFixedOpened: boolean = false;
  isSillProfileBottomOpened: boolean = false;
  isFrameCombinationOpened: boolean = false;
  isHandleColorOpened: boolean = false;
  isHingeTypeOpened: boolean = false;
  isInsideHandleOpened: boolean = false;
  isOutsideHandleOpened: boolean = false;
  isApplyBtnDisable: boolean = false;
  isTransomGlassExists: boolean = false;
  //@Input() handlePositionEvent: EventEmitter<any>;
  @Input() handleColorEvent: EventEmitter<any>;
  isSystemSelectionChanged: boolean = false;
  systemFacadeSelected: number = 0;
  systemAWS114FacadeSelected: number;
  validateForm: FormGroup;
  validateFormForFacade: FormGroup;
  validateFormSRS: FormGroup;

  aws114SystemValue = ['aws_114', 'aws_114_si', 'aws_114_sg', 'aws_114_sg_si'];
  aws114SystemDesc = ['AWS 114', 'AWS 114.SI', 'AWS 114 SG', 'AWS 114 SG.SI'];
  aws114SystemDesc2 = ['AWS 114', 'AWS 114.SI', 'AWS 114 SG', 'AWS 114 SG.SI'];

  adsSystemValue = ['ads__75'];
  adsSystemDesc = ['ADS 75'];

  awsSystemValue = ['aws__75_si_plus', 'aws__75__bs_si_plus', 'aws__75__bs_hi_plus', 'aws__90_si_plus', 'aws__90__bs_si_plus'];
  awsSystemDesc = ['AWS 75.SI+', 'AWS 75 BS.SI+', 'AWS 75 BS.HI+', 'AWS 90.SI+', 'AWS 90 BS.SI+'];

  outerFrameInputValue: string;
  ventFrameInputValue: string;
  doorLeafActiveInputValue: string;
  doorLeafPassiveInputValue: string;
  sillProfileFixedInputValue: string;
  sillProfileBottomInputValue: string;
  frameCombinationInputValue: string = 'Combination 1';

  mullionInputValue: string;
  transomInputValue: string;
  pickers: any[];
  disabledApplyBtn: boolean = true;
  glassConfig: any;
  fixedOpening_index = { 'Inward': 'Inward', 'Outward': 'Outward' };
  operationType_index = { 'Manual': 'Manual', 'TipTronic': 'TipTronic' };
  operableType_index = { 'tiltTurn-right': "Turn-Tilt-Right", 'tiltTurn-left': "Turn-Tilt-Left", 'sideHung-right': "Side-Hung-Right", 'sideHung-left': "Side-Hung-Left", 'bottomHung': "Bottom-Hung", 'topHung': "Top-Hung", 'parallelOpening': "Parallel-Opening", 'doubleVentSH': 4, 'doubleVentST': 5, 'singleDoor-left': "Single-Door-Left", 'singleDoor-right': "Single-Door-Right", 'doubleDoor-left': "Double-Door-Active-Left", 'doubleDoor-right': "Double-Door-Active-Right" };
  selectedPicker: number = -1;
  selectedPickerString: string = '-1';
  selectedGlassIDs: number[] = [];
  glassIDsAlreadyApplied: object = {};
  glassAppliedArray = [[], [], [], [], []];
  language: string = '';
  inwardText: string = this.translate.instant(_('configure.inward'));
  outwardText: string = this.translate.instant(_('configure.outward'));
  doubleVentShShText: string = this.translate.instant(_('configure.double-vent-sh-sh'));
  doubleVentShTtText: string = this.translate.instant(_('configure.double-vent-sh-tt'));

  tiltOrTurnRightText: string = this.translate.instant(_('configure.tilt-or-turn-right-handed')); //tiltTurn-right
  tiltOrTurnLeftText: string = this.translate.instant(_('configure.tilt-or-turn-left-handed')); //tiltTurn-left
  sideHungRightText: string = this.translate.instant(_('configure.side-hung-right-handed')); //sideHung-right
  sideHungLeftText: string = this.translate.instant(_('configure.side-hung-left-handed')); //sideHung-left
  bottomHungText: string = this.translate.instant(_('configure.bottom-hung')); //bottomHung
  topHungText: string = this.translate.instant(_('configure.top-hung')); //topHung
  parallelOpeningText: string = this.translate.instant(_('configure.parallel-opening')); //parallelOpening
  singleDoorLeftText: string = 'Single Door - Left';
  singleDoorRightText: string = 'Single Door - Right';
  doubleDoorLeftText: string = 'Double Door - Left Active';
  doubleDoorRightText: string = 'Double Door - Right Active';
  singleDoorLeftSystemTypeText: string = "Single-Door-Left";
  singleDoorRightSystemTypeText: string = "Single-Door-Right";
  doubleDoorLeftSystemTypeText: string = "Double-Door-Active-Left";
  doubleDoorRightSystemTypeText: string = "Double-Door-Active-Right";
  isTurnTiltLeftSelected: boolean = false;
  isTurnTiltRightSelected: boolean = false;
  isSingleDoorLeftSelected: boolean = false;
  isSingleDoorRightSelected: boolean = false;
  isDoubleDoorLeftSelected: boolean = false;
  isDoubleDoorRightSelected: boolean = false;

  handleColor: string = '';
  hingeType: string = '';
  insideHandle: string = '';
  outsideHandle: string = '';
  insideHandleArticleName: string;
  outsideHandleArticleName: string;
  hingeTypeArticleName: string;
  // handlePositioning: number ;

  windowHeight: number;
  applicationType: string;
  @Input() orderPlaced: boolean;
  //@Input() handlePosition:number;
  // addPickerDisabled: boolean = false;
  isDoorOperableTypeSelected: boolean = false;
  isWindowOperableTypeSelected: boolean = false;
  isDoorType: boolean = false;
  isDoorArticlesDisplay: boolean = false;
  isWindowArticlesDisplay: boolean = false;
  feature = Feature;
  isDoorOperableDisable: boolean = false;
  isWindowOperableDisable: boolean = false;
  isAddBtnDisable: boolean = false;
  isOperablilityPanelActive: boolean = false;
  isTurnTiltDirectionChanged: boolean = false;
  isOpDirectionChangeForCameraReset: boolean = false;
  constructor(private umService: UnifiedModelService, private cpService: ConfigPanelsService,
    private configureService: ConfigureService, private modalService: NzModalService,
    private iframeService: IframeService,
    private translate: TranslateService, private fb: FormBuilder, private lc: LeftConfigureComponent,
    private permissionService: PermissionService) {
    this.applicationType = this.configureService.applicationType;
    this.validateForm = this.fb.group({
      Insulating: ['', [Validators.required]]
    });
    this.validateFormForFacade = this.fb.group({
      Insulating: ['', [Validators.required]],
      Glazing: ['', [Validators.required]]
    });
  }
  EnableAcoustic: boolean;

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngAfterViewInit() {

 /**
 * This is observable of Unified Model which will calls when the unified model has changed anywhere in the application
 * and will set the values for the input fields 
 */
    this.umService.obsUnifiedModel.pipe(takeUntil(this.destroy$)).subscribe(
      response => {
        if (response) {
          this.unified3DModel = response;
          this.addPickerDisable();
        }
      });

/**
 * This is observable of Unified Problem which will calls when the unified Problem  has changed anywhere in the application 
 * and will set the values for the input fields
 */    
    this.umService.obsUnifiedProblem.pipe(takeUntil(this.destroy$)).subscribe(
      response => {
        if (response) {
          this.glassAppliedArray = [[], [], [], [], []];
          this.selectedPicker = -1;
          this.selectedPickerString = this.selectedPicker.toString();
          this.unified3DModel = this.umService.current_UnifiedModel;
          this.loadOperability();
          //this.UpdateUnfiedModel();
          setTimeout(() => {
            this.reloadInputValues();
            this.loadInputValues();
            this.addPickerDisable();
            if(this.unified3DModel.ModelInput.Geometry.OperabilitySystems)
             this.selectedPickerString = this.unified3DModel.ModelInput.Geometry.OperabilitySystems.sort(function (a, b) { return a.PickerIndex - b.PickerIndex })[0].PickerIndex.toString();
            this.onSelectPicker();
          }, 100);
        }
      });

/**
 * This is observable of Pop outs of all the child components is set to the variable which is used to open and close the pop out
 *
 */
    this.cpService.obsPopout.pipe(takeUntil(this.destroy$)).subscribe(
      response => {
        if (response.panelsModule === PanelsModule.FrameCombination) this.isFrameCombinationOpened = response.isOpened;
        else if (response.panelsModule === PanelsModule.OuterFrame) this.isOuterOpened = response.isOpened;
        else if (response.panelsModule === PanelsModule.VentFrame) this.isVentOpened = response.isOpened;
        else if (response.panelsModule === PanelsModule.DoorLeafActive) this.isDoorLeafActiveOpened = response.isOpened;
        else if (response.panelsModule === PanelsModule.DoorLeafPassive) this.isDoorLeafPassiveOpened = response.isOpened;
        else if (response.panelsModule === PanelsModule.SillProfileFixed) this.isSillProfileFixedOpened = response.isOpened;
        else if (response.panelsModule === PanelsModule.SillProfileBottom) this.isSillProfileBottomOpened = response.isOpened;
        else if (response.panelsModule === PanelsModule.HandleColor) this.isHandleColorOpened = response.isOpened;
        else if (response.panelsModule === PanelsModule.HingeType) this.isHingeTypeOpened = response.isOpened;
        else if (response.panelsModule === PanelsModule.InsideHandle) this.isInsideHandleOpened = response.isOpened;
        else if (response.panelsModule === PanelsModule.OutsideHandle) this.isOutsideHandleOpened = response.isOpened;
      });

 /**
 * This is observable of Operability panel to set the value of isOperabilityPanelactive when the panel is collapse or expanded from the left configure
 *
 */
    this.cpService.obsOperabilityPanelActive.pipe(takeUntil(this.destroy$)).subscribe(
      response => {
        this.isOperablilityPanelActive = response;
      });

 /**
 * This is observable of to load the operability side panel values such as Inside Handle, Outside Handle, Hinge type 
 * in the left configure 
 *
 */
    this.umService.obsLoadSidePanel.pipe(takeUntil(this.destroy$)).subscribe(
      response => {
        if (response && response.panelsModule > -1 && response.finishedLoading) {
          if (response.panelsModule === PanelsModule.InsideHandle) this.insideHandle = this.umService.get_InsideHandle(this.selectedPicker);
          else if (response.panelsModule === PanelsModule.HingeType) this.hingeType = this.umService.get_HingeType(this.selectedPicker);
          else if (response.panelsModule === PanelsModule.OutsideHandle) this.outsideHandle = this.umService.get_OutsideHandle(this.selectedPicker);
          else if (response.panelsModule === PanelsModule.OuterFrame) this.getOuterFrameInputValue();
          else if (response.panelsModule === PanelsModule.VentFrame) this.getVentFrameInputValue();
        }
      }
    );
  }

 /**
 * This function will get the Outerframe value and assigns to the input value
 *  
 *
 */
  getOuterFrameInputValue() {
    this.outerFrameInputValue = this.umService.get_OuterFrame();
  }

 /**
 * This function will get the Vent Frame value and assigns to the input value
 *  
 *
 */
  getVentFrameInputValue() {
    this.ventFrameInputValue = this.umService.get_VentFrame();
  }

 /**
 * This function will disable the add picker when the Door operable type is selected
 *  
 *
 */
  private addPickerDisable() {
    if (this.unified3DModel.ModelInput.Geometry.OperabilitySystems && this.unified3DModel.ModelInput.Geometry.OperabilitySystems[0].DoorSystemID > 0) {
      this.isDoorOperableTypeSelected = true;
      this.isWindowOperableTypeSelected = false;
      this.isWindowArticlesDisplay = false;
      this.isDoorArticlesDisplay = true;
      this.isAddBtnDisable = true;
    } else {
      this.isWindowOperableTypeSelected = true;
      this.isWindowArticlesDisplay = true;
      this.isDoorOperableTypeSelected = false;
      this.isDoorArticlesDisplay = false;
      this.isAddBtnDisable = false;
    }
  }

 /**
 * This function is to get the Inside Handle, Hinge Type and Outside Handle to the input values respectively
 *  
 *
 */
  private loadInputValues() {
    setTimeout(() => {
      this.insideHandle = this.umService.get_InsideHandle(this.selectedPicker);
      this.hingeType = this.umService.get_HingeType(this.selectedPicker);
      this.outsideHandle = this.umService.get_OutsideHandle(this.selectedPicker);
    }, 100);
  }

 /**
 * This function is to set all the values of Operability side panel values and populate them in the respective feilds
 *  
 *
 */
  reloadInputValues() {
    this.umService.doLoadJSON = false;
    let ds = this.unified3DModel.ModelInput.Geometry.DoorSystems;
    if (ds) {
      if (ds.filter(glass => glass.OutsideHandleArticleName === null || glass.OutsideHandleArticleName === undefined).length > 0) {
        this.cpService.setPopout(true, PanelsModule.OutsideHandle);
        this.cpService.setPopout(false, PanelsModule.OutsideHandle);
      }
      if (ds.filter(glass => glass.HingeArticleName === null || glass.HingeArticleName === undefined).length > 0) {
        this.cpService.setPopout(true, PanelsModule.HingeType);
        this.cpService.setPopout(false, PanelsModule.HingeType);
      }
      if (ds.filter(glass => glass.InsideHandleArticleName === null || glass.InsideHandleArticleName === undefined).length > 0) {
        this.cpService.setPopout(true, PanelsModule.InsideHandle);
        this.cpService.setPopout(false, PanelsModule.InsideHandle);
      }
      if (ds.filter(glass => glass.DoorLeafArticleName === null || glass.DoorLeafArticleName === undefined).length > 0) {
        this.cpService.setPopout(true, PanelsModule.DoorLeafActive);
        this.cpService.setPopout(false, PanelsModule.DoorLeafActive);
      }
      if (ds.filter(glass => glass.DoorPassiveJambArticleName === null || glass.DoorPassiveJambArticleName === undefined).length > 0) {
        this.cpService.setPopout(true, PanelsModule.DoorLeafPassive);
        this.cpService.setPopout(false, PanelsModule.DoorLeafPassive);
      }
      if (ds.filter(glass => glass.DoorSillArticleName === null || glass.DoorSillArticleName === undefined).length > 0) {
        this.cpService.setPopout(true, PanelsModule.SillProfileBottom);
        this.cpService.setPopout(false, PanelsModule.SillProfileBottom);
      }
      if (ds.filter(glass => glass.DoorSidelightSillArticleName === null || glass.DoorSidelightSillArticleName === undefined).length > 0) {
        this.cpService.setPopout(true, PanelsModule.SillProfileFixed);
        this.cpService.setPopout(false, PanelsModule.SillProfileFixed);
      }
    }
    let os = this.unified3DModel.ModelInput.Geometry.OperabilitySystems;
    if (os) {
      if (os.filter(glass => glass.VentArticleName == undefined && glass.VentArticleName !== '-1').length > 0) {
        this.cpService.setPopout(true, PanelsModule.VentFrame);
        this.cpService.setPopout(false, PanelsModule.VentFrame);
      }
      if (os.filter(glass => glass.InsertOuterFrameArticleName === null || glass.InsertOuterFrameArticleName === undefined).length > 0) {
        this.cpService.setPopout(true, PanelsModule.OuterFrame);
        this.cpService.setPopout(false, PanelsModule.OuterFrame);
      }
      if (os.filter(glass => glass.InsideHandleArticleName === null || glass.InsideHandleArticleName === undefined).length > 0) {
        this.cpService.setPopout(true, PanelsModule.InsideHandle);
        this.cpService.setPopout(false, PanelsModule.InsideHandle);
      }
      if (os.filter(glass => glass.InsideHandleColor === null || glass.InsideHandleColor === undefined).length > 0) {
        this.cpService.setPopout(true, PanelsModule.HandleColor);
        this.cpService.setPopout(false, PanelsModule.HandleColor);
      }
    }
    let sec = this.unified3DModel.ModelInput.Geometry.Sections;
    if (sec) {
      if (sec.filter(glass => glass.SectionID == 2 && glass.Depth == '0').length > 0) {
        this.cpService.setPopout(true, PanelsModule.Mullion);
        this.cpService.setPopout(false, PanelsModule.Mullion);
      }
      if (sec.filter(glass => glass.SectionID == 3 && glass.Depth == '0').length > 0) {
        this.cpService.setPopout(true, PanelsModule.Transom);
        this.cpService.setPopout(false, PanelsModule.Transom);
      }
    }
    setTimeout(() => {
      this.umService.doLoadJSON = true;
      this.umService.callLoadJSON(this.canBeDrawnBool);
    }, 500);
  }

  ngOnInit(): void {
    this.language = this.configureService.getLanguage();
    this.applicationType = this.configureService.applicationType;
    setTimeout(() => {
      this.reloadInputValues();
      this.loadInputValues();
      if(this.unified3DModel.ModelInput.Geometry.OperabilitySystems)
        this.selectedPickerString = this.unified3DModel.ModelInput.Geometry.OperabilitySystems.sort(function (a, b) { return a.PickerIndex - b.PickerIndex })[0].PickerIndex.toString();
      this.onSelectPicker();
    }, 500);
  }

 /**
 * This function will load the operability fields with the default values on the initial page load
 *  
 *
 */
  loadOperability() {
    this.cpService.setSelectedPicker_Operability(this.selectedPicker);
    this.pickers = [
      { status: 'unpopulated', fixedOpening: '', operableType: '', operationType: '', windowSystem: '', handleColor: '', insideHandle: '', outsideHandle: '', hingeType: '' },
      { status: 'unpopulated', fixedOpening: '', operableType: '', operationType: '', windowSystem: '', handleColor: '', insideHandle: '', outsideHandle: '', hingeType: '' },
      { status: 'unpopulated', fixedOpening: '', operableType: '', operationType: '', windowSystem: '', handleColor: '', insideHandle: '', outsideHandle: '', hingeType: '' },
      { status: 'unpopulated', fixedOpening: '', operableType: '', operationType: '', windowSystem: '', handleColor: '', insideHandle: '', outsideHandle: '', hingeType: '' },
      { status: 'unpopulated', fixedOpening: '', operableType: '', operationType: '', windowSystem: '', handleColor: '', insideHandle: '', outsideHandle: '', hingeType: '' },
    ];            //  for dots
    this.glassIDsAlreadyApplied = {};   // list of glass added. Ex: {1:2} : glassId 1 applied in picker 2
    this.glassAppliedArray = [[], [], [], [], []];
    if (this.unified3DModel.ProblemSetting.ProductType === 'Window') {
      this.unified3DModel.ModelInput.Geometry.Infills.forEach(glass => {
        let operableId = this.unified3DModel.ModelInput.Geometry.Infills.filter(g => g.InfillID == glass.InfillID)[0].OperabilitySystemID;
        if (operableId > 0 && this.unified3DModel.ModelInput.Geometry.OperabilitySystems) {
          this.unified3DModel.ModelInput.Geometry.OperabilitySystems.filter(glass => glass.OperabilitySystemID == operableId)[0].InsertOuterFrameArticleName = null;
          this.unified3DModel.ModelInput.Geometry.OperabilitySystems.filter(glass => glass.OperabilitySystemID == operableId)[0].InsertOuterFrameDistBetweenIsoBars = 0;
          this.unified3DModel.ModelInput.Geometry.OperabilitySystems.filter(glass => glass.OperabilitySystemID == operableId)[0].InsertOuterFrameInsideW = 0;
          this.unified3DModel.ModelInput.Geometry.OperabilitySystems.filter(glass => glass.OperabilitySystemID == operableId)[0].InsertOuterFrameOutsideW = 0;
          this.unified3DModel.ModelInput.Geometry.Infills.filter(glass => glass.InfillID == glass.InfillID)[0].InsertOuterFrameDepth = 0;
          this.handleColor = this.unified3DModel.ModelInput.Geometry.OperabilitySystems.filter(glass => glass.OperabilitySystemID == operableId)[0].InsideHandleColor;
          if (this.unified3DModel.ModelInput.Geometry.OperabilitySystems.filter(glass => glass.OperabilitySystemID == operableId)[0].DoorSystemID > 0) {
            this.isDoorOperableTypeSelected = true;
            this.isWindowOperableTypeSelected = false;
            this.isWindowArticlesDisplay = false;
            this.isDoorArticlesDisplay = true;
          } else {
            this.isWindowOperableTypeSelected = true;
            this.isWindowArticlesDisplay = true;
            this.isDoorOperableTypeSelected = false;
            this.isDoorArticlesDisplay = false;
          }
          //this.cpService.setPopout(this.isDoorOperableTypeSelected, PanelsModule.DoorOperableType);
          //this.handlePositioning = this.unified3DModel.ModelInput.Geometry.OperabilitySystems.filter(glass => glass.OperabilitySystemID === operableId)[0].HandlePosition === null ? null : this.unified3DModel.ModelInput.Geometry.OperabilitySystems.filter(glass => glass.OperabilitySystemID === operableId)[0].HandlePosition;
          //this.validateFormSRS.controls['handlePosition'].setValue(this.unified3DModel.ModelInput.Geometry.OperabilitySystems.filter(glass => glass.OperabilitySystemID === operableId)[0].HandlePosition === null ? '1/2' : this.unified3DModel.ModelInput.Geometry.OperabilitySystems.filter(glass => glass.OperabilitySystemID === operableId)[0].HandlePosition.toString());
        }

      });
    }
    // if (this.permissionService.checkPermission(this.feature.HandleColor)) {
    //   this.cpService.setCurrent(this.handleColor, PanelsModule.HandleColor);
    //   // this.GetHeight();
    // }

    for (const key in this.validateForm.controls) {
      this.validateForm.controls[key].markAsDirty();
      this.validateForm.controls[key].updateValueAndValidity();
    }
    for (const key in this.validateFormForFacade.controls) {
      this.validateFormForFacade.controls[key].markAsDirty();
      this.validateFormForFacade.controls[key].updateValueAndValidity();
    }

  }

  // GetHeight(){
  //   let yDimensions = this.unified3DModel.ModelInput.Geometry.Points.map(x => x.Y);
  //   this.windowHeight = yDimensions && yDimensions.length > 0? yDimensions.reduce((a, b) => Math.max(a, b)): 0;
  //   this.windowHeight = this.windowHeight-200 >=0 ? this.windowHeight-200:this.windowHeight;
  //   if (this.handlePositioning >= 200 && this.handlePositioning <= this.windowHeight) {
  //     this.validateFormSRS.controls['handlePosition'].markAsDirty();
  //     this.validateFormSRS.controls['handlePosition'].updateValueAndValidity();
  //   } else{
  //     this.validateFormSRS.controls['handlePosition'].setErrors({ 'incorrect': true });
  //   }
  // }

  ngOnChanges(Changes: SimpleChanges): void {
    // if(this.orderPlaced) {
    //   this.validateFormSRS.controls['handlePosition'].disable();
    // } else if(this.validateFormSRS.controls['handlePosition'].disabled){
    //   this.validateFormSRS.controls['handlePosition'].enable();
    // }
    this.applicationType = this.configureService.applicationType;
    if (Changes && this.unified3DModel) {

      if (this.permissionService.checkPermission(this.feature.ADS_75) && Changes.HingeTypeFromChild && !Changes.HingeTypeFromChild.firstChange && Changes.HingeTypeFromChild.currentValue && Changes.HingeTypeFromChild.currentValue.Description) {
        if (this.hingeTypeArticleName !== Changes.HingeTypeFromChild.currentValue.ArticleName)
          this.configureService.computeClickedSubject.next(false);
      }


      if (Changes.unified3DModel) {
        if (Changes.unified3DModel.currentValue &&
          (Changes.unified3DModel.previousValue
            && (Changes.unified3DModel.currentValue.ProblemSetting.ProblemGuid != Changes.unified3DModel.previousValue.ProblemSetting.ProblemGuid))
          || (!Changes.unified3DModel.previousValue && Changes.unified3DModel.firstChange)) { // called when reload the page and change problem from right panel
          this.unified3DModel = Changes.unified3DModel.currentValue;
          this.loadOperability();
        }
        this.UpdateUnfiedModel();
      }
      if (Changes.event3D && Changes.event3D.currentValue && Changes.event3D.currentValue.eventType === 'selectGlass') {     
        // when user selects glass from 3D viewer
        var panels = this.unified3DModel.ModelInput.Geometry.Infills.filter(f => f.GlazingSystemID != -1).map(f => f.InfillID);
        this.selectedGlassIDs = Changes.event3D.currentValue.value.selectedGlassIDs.filter(f => panels.includes(f))
        // if (this.lc.isOperabilityActive && this.selectedGlassIDs.length !== Changes.event3D.currentValue.value.selectedGlassIDs.length) {
        //   this.ngNotificaionShow.next({ title: this.translate.instant(_('notification.acoustic-disabled')), message: this.translate.instant(_('notification.acoustic-solver-does-not-support-Top-Hung-openings')), logoToShow: 'Acoustic' });
        //   this.ngNotificaionShow.next({ title: this.translate.instant(_('notification.acoustic-disabled')), message: this.translate.instant(_('notification.acoustic-solver-does-not-support-Parallel-openings')), logoToShow: 'Acoustic' });
        // }  
      }

      if (Changes.event3D && Changes.event3D.currentValue && Changes.event3D.currentValue.eventType === 'SelectedMultipleGlass') {
        if (Changes.event3D.currentValue.value && this.isDoorOperableTypeSelected && Changes.event3D.currentValue.eventType === 'SelectedMultipleGlass') {
          if(this.selectedGlassIDs.length > 1) {
            setTimeout(() => {
              this.isApplyBtnDisable = true;
            },10);
          } else {
            this.isApplyBtnDisable = false;
            if (this.pickers.filter(f => f.operableType == 'tiltTurn-left' || f.operableType == 'tiltTurn-right').length > 0){
              this.isApplyBtnDisable = true;}
          }
        } else {
          this.isApplyBtnDisable = false;
        // Check whether the door operable is already applied to any infill
        // Get the infillIds to which Door OperableType is already applied
          this.disableApplyButton();
        }
        this.setDoorOperableTypeDisabled();
      }

      if(Changes.event3D && Changes.event3D.currentValue && Changes.event3D.currentValue.eventType === 'SelectedTransomGlass') {
        if(this.isOperablilityPanelActive){
          if(Changes.event3D.currentValue.value) {
            this.isTransomGlassExists = true;
          } else {
            this.isTransomGlassExists = false;
          }
         // this.isTransomGlassExists = true;
          if((this.isDoorOperableTypeSelected || ( this.selectedPicker > -1 && this.pickers[this.selectedPicker].operableType.includes('Door'))) && Changes.event3D.currentValue.value){
            this.isApplyBtnDisable = true;
            this.ngNotificaionShow.next({ title: 'Configuration not supported', message: 'You can\'t apply a door above a transom.', logoToShow: 'Warning' });
          }else{
            this.isApplyBtnDisable = false;
            this.disableApplyButton();
          }
        }
        
      }

      // if(Changes.event3D && Changes.event3D.currentValue && Changes.event3D.currentValue.eventType === 'SelectedTransomGlass') {
      //   this.isTransomGlassExists = true;
      //   if(this.isDoorOperableTypeSelected){
      //     this.isApplyBtnDisable = true;
      //   }else{
      //     this.isApplyBtnDisable = false;
      //   }        
      // }
      if (Changes.event3D && Changes.event3D.currentValue && Changes.event3D.currentValue.eventType === 'changeUnifiedModel') {  // when user adds mullion, tramsom, removes mullion/transom
        //disableresult

        this.configureService.computeClickedSubject.next(false);
        this.glassAppliedArray = [[], [], [], [], []];
        this.glassIDsAlreadyApplied = {};
        if (this.selectedPicker > -1 && this.unified3DModel.ModelInput.Geometry.OperabilitySystems) {
          this.unified3DModel.ModelInput.Geometry.OperabilitySystems.forEach(os => {

            this.unified3DModel.ModelInput.Geometry.Infills.forEach(glass => {
              let opType = '';
              switch (os.VentOperableType) {
                case 'Turn-Tilt-Right':
                  opType = this.tiltOrTurnRightText;
                  break
                case 'Turn-Tilt-Left':
                  opType = this.tiltOrTurnLeftText;
                  break
                case 'Side-Hung-Right':
                  opType = this.sideHungRightText;
                  break
                case 'Side-Hung-Left':
                  opType = this.sideHungLeftText;
                  break
                case 'Bottom-Hung':
                  opType = this.bottomHungText;
                  break
                case 'Top-Hung':
                  opType = this.topHungText;
                  break
                case 'Parallel-Opening':
                  opType = this.parallelOpeningText;
                  break
                case 'Single-Door-Left':
                  opType = this.singleDoorLeftText;
                  break
                case 'Single-Door-Right':
                  opType = this.singleDoorRightText;
                  break
                case 'Double-Door-Active-Left':
                  opType = this.doubleDoorLeftText;
                  break
                case 'Double-Door-Active-Right':
                  opType = this.doubleDoorRightText;
                  break
                default:
                  opType = '';
                  break
              }

              let fixopenText = '';
              switch (os.VentOpeningDirection) {
                case 'Inward':
                  fixopenText = this.inwardText;
                  break
                case 'Outward':
                  fixopenText = this.outwardText;
                  break
                default:
                  fixopenText = this.inwardText;
                  break
              }
              if (os.OperabilitySystemID == glass.OperabilitySystemID && os.VentOpeningDirection !== null) {
                this.glassAppliedArray[glass.OperabilitySystemID - 1].push({ glassID: glass.InfillID, fixedOpening: fixopenText, operableType: opType });
                this.glassIDsAlreadyApplied[glass.InfillID] = this.selectedPicker + 1;
                this.selectedGlassIDs = [];
              }
            });
          });
        }
        this.setDoorOperableTypeDisabled();
      }
      // if(Changes.handlePosition && Changes.handlePosition.currentValue){
      //   this.handlePositioning = Changes.handlePosition.currentValue;
      //   this.updateHandlePosition(Changes.handlePosition.currentValue)
      // }
    }
    if (this.selectedPicker > -1 && this.pickers[this.selectedPicker].fixedOpening == 'Outward' && this.insertInsulationTypeName !== "") {
      this.insertInsulationTypeName = "PA";
      this.frameCombinationInputValue = 'Combination 1';
    }
    else if (this.selectedPicker > -1 && this.pickers[this.selectedPicker].fixedOpening == 'Inward' && this.insertInsulationTypeName !== "") {
      this.insertInsulationTypeName = "Polyamide Anodized After";
    }
  }

 /**
 * This function is to update the unified model after applying the operability
 *  
 *
 */
  private UpdateUnfiedModel() {
    this.glassAppliedArray = [[], [], [], [], []];
    this.glassIDsAlreadyApplied = {};
    if (this.unified3DModel.ModelInput.Geometry.OperabilitySystems && this.unified3DModel.ModelInput.Geometry.OperabilitySystems.filter(f => f.VentOpeningDirection === null).length !== this.unified3DModel.ModelInput.Geometry.Infills.length) {
      this.selectedPicker = this.selectedPicker === -1 ? 0 : this.selectedPicker;
      this.cpService.setSelectedPicker_Operability(this.selectedPicker);
    }
    if (this.selectedPicker !== -1) {
      if (this.unified3DModel.ProblemSetting.ProductType === 'Window') {
        if (this.unified3DModel.ModelInput.Geometry.OperabilitySystems)
          this.unified3DModel.ModelInput.Geometry.OperabilitySystems.forEach(os => {
            this.unified3DModel.ModelInput.Geometry.Infills.filter(glass => glass.OperabilitySystemID > -1 && glass.OperabilitySystemID === os.OperabilitySystemID).forEach(glass => {
              if ((os.VentArticleName && os.VentArticleName !== '-1') || (os.DoorSystemID !== -1)) {
                glass.OperabilitySystemID = glass.OperabilitySystemID === undefined ? 0 : glass.OperabilitySystemID;
                if (!(this.glassIDsAlreadyApplied.hasOwnProperty(glass.InfillID - 1))) {
                  if (this.unified3DModel.ModelInput.Geometry.OperabilitySystems && this.unified3DModel.ModelInput.Geometry.OperabilitySystems.filter(section => section.VentOperableType !== null)[0]) {
                    this.selectedPicker = this.selectedPicker === -1 ? 0 : this.selectedPicker;
                    this.selectedPickerString = this.selectedPicker.toString();
                    this.cpService.setSelectedPicker_Operability(this.selectedPicker);
                    this.pickers[os.PickerIndex].status = 'populated';
                   //this.pickers[this.selectedPicker].status = 'populated';
                    this.glassIDsAlreadyApplied[glass.InfillID - 1] = os.PickerIndex;

                    if (this.isDoorOperableTypeSelected) {
                      this.systemFacadeSelected = this.adsSystemValue.indexOf(this.pickers[this.selectedPicker].windowSystem);
                    } else {
                      this.systemFacadeSelected = this.aws114SystemDesc.indexOf(this.pickers[this.selectedPicker].windowSystem);
                    }
                  }
                  if (os.VentOpeningDirection !== null && os.VentOperableType !== null) {
                    let opType = '';
                    switch (os.VentOperableType) {
                      case 'Turn-Tilt-Right':
                        opType = this.tiltOrTurnRightText;
                        this.isTurnTiltRightSelected = true;
                        break;
                      case 'Turn-Tilt-Left':
                        opType = this.tiltOrTurnLeftText;
                        this.isTurnTiltLeftSelected = true;
                        break;
                      case 'Side-Hung-Right':
                        opType = this.sideHungRightText;
                        break;
                      case 'Side-Hung-Left':
                        opType = this.sideHungLeftText;
                        break;
                      case 'Bottom-Hung':
                        opType = this.bottomHungText;
                        break;
                      case 'Top-Hung':
                        opType = this.topHungText;
                        break;
                      case 'Parallel-Opening':
                        opType = this.parallelOpeningText;
                        break;
                      case 'Single-Door-Left':
                        opType = this.singleDoorLeftText;
                        this.isSingleDoorLeftSelected = true;
                        break;
                      case 'Single-Door-Right':
                        opType = this.singleDoorRightText;
                        this.isSingleDoorRightSelected = true;
                        break;
                      case 'Double-Door-Active-Left':
                        opType = this.doubleDoorLeftText;
                        this.isDoubleDoorLeftSelected = true;
                        break;
                      case 'Double-Door-Active-Right':
                        opType = this.doubleDoorRightText;
                        this.isDoubleDoorRightSelected = true;
                        break;
                      default:
                        opType = '';
                        break;
                    }

                    let fixopenText = '';
                    switch (os.VentOpeningDirection) {
                      case 'Inward':
                        fixopenText = this.inwardText;
                        break;
                      case 'Outward':
                        fixopenText = this.outwardText;
                        break;
                      default:
                        fixopenText = this.inwardText;
                        break;
                    }
                    this.glassAppliedArray[os.PickerIndex].push({ glassID: glass.InfillID, fixedOpening: fixopenText, operableType: opType });
                    //this.glassAppliedArray[glass.OperabilitySystemID - 1].push({ glassID: glass.InfillID, fixedOpening: fixopenText, operableType: opType });
                  // this.glassAppliedArray[this.selectedPicker].push({ glassID: glass.InfillID, fixedOpening: fixopenText, operableType: opType });
                  }


                  if (glass.InsertWindowSystemType !== null && glass.InsertWindowSystemType !== undefined && glass.InsertWindowSystemType.indexOf('TipTronic') > -1) {
                    this.pickers[os.PickerIndex].operationType = Object.keys(this.operationType_index).filter(key => this.operationType_index[key] == 'TipTronic')[0];
                    // this.pickers[this.selectedPicker].operationType = Object.keys(this.operationType_index).filter(key => this.operationType_index[key] == 'TipTronic')[0];
                  } else {
                    this.pickers[os.PickerIndex].operationType = Object.keys(this.operationType_index).filter(key => this.operationType_index[key] == 'Manual')[0];
                   // this.pickers[this.selectedPicker].operationType = Object.keys(this.operationType_index).filter(key => this.operationType_index[key] == 'Manual')[0];
                  }
                   this.pickers[os.PickerIndex].windowSystem = glass.InsertWindowSystem;
                   this.pickers[os.PickerIndex].fixedOpening = Object.keys(this.fixedOpening_index).filter(key => this.fixedOpening_index[key] == os.VentOpeningDirection)[0];
                   this.pickers[os.PickerIndex].operableType = Object.keys(this.operableType_index).filter(key => this.operableType_index[key] == os.VentOperableType)[0];
                  // this.pickers[this.selectedPicker].windowSystem = glass.InsertWindowSystem;
                  // this.pickers[this.selectedPicker].fixedOpening = Object.keys(this.fixedOpening_index).filter(key => this.fixedOpening_index[key] == os.VentOpeningDirection)[0];
                  // this.pickers[this.selectedPicker].operableType = Object.keys(this.operableType_index).filter(key => this.operableType_index[key] == os.VentOperableType)[0];
                }
              }
            });
          });
      } else {
        if (this.unified3DModel.ModelInput.Geometry.OperabilitySystems)
          this.unified3DModel.ModelInput.Geometry.OperabilitySystems.forEach(os => {
            this.unified3DModel.ModelInput.Geometry.Infills.forEach(glass => {
              glass.OperabilitySystemID = glass.OperabilitySystemID === undefined ? 0 : glass.OperabilitySystemID;
              if (glass.OperabilitySystemID != -1 && glass.OperabilitySystemID == os.OperabilitySystemID && !(this.glassIDsAlreadyApplied.hasOwnProperty(glass.InfillID - 1))) {
                if (this.unified3DModel.ModelInput.Geometry.OperabilitySystems && this.unified3DModel.ModelInput.Geometry.OperabilitySystems.filter(section => section.VentOperableType !== null)[0]) {
                  this.selectedPicker = this.selectedPicker === -1 ? 0 : this.selectedPicker;
                  this.selectedPickerString = this.selectedPicker.toString();
                  this.cpService.setSelectedPicker_Operability(this.selectedPicker);
                  this.pickers[os.PickerIndex].status = 'populated';
                  this.glassIDsAlreadyApplied[os.PickerIndex] = os.PickerIndex;
                }
                if (os.VentOpeningDirection !== null && os.VentOperableType !== null) {
                  this.pickers[os.PickerIndex].windowSystem = glass.InsertWindowSystem;
                  this.pickers[os.PickerIndex].fixedOpening = Object.keys(this.fixedOpening_index).filter(key => this.fixedOpening_index[key] == os.VentOpeningDirection)[0];
                  this.pickers[os.PickerIndex].operableType = Object.keys(this.operableType_index).filter(key => this.operableType_index[key] == os.VentOperableType)[0];

                  let opType = '';
                  switch (os.VentOperableType) {
                    case 'Turn-Tilt-Right':
                      opType = this.tiltOrTurnRightText;
                      break;
                    case 'Turn-Tilt-Left':
                      opType = this.tiltOrTurnLeftText;
                      break;
                    case 'Side-Hung-Right':
                      opType = this.sideHungRightText;
                      break;
                    case 'Side-Hung-Left':
                      opType = this.sideHungLeftText;
                      break;
                    case 'Bottom-Hung':
                      opType = this.bottomHungText;
                      break;
                    case 'Top-Hung':
                      opType = this.topHungText;
                      break;
                    case 'Parallel-Opening':
                      opType = this.parallelOpeningText;
                      break;
                    case 'Single-Door-Left':
                      opType = this.singleDoorLeftText;
                      break;
                    case 'Single-Door-Right':
                      opType = this.singleDoorRightText;
                      break;
                    case 'Double-Door-Active-Left':
                      opType = this.doubleDoorLeftText;
                      break;
                    case 'Double-Door-Active-Right':
                      opType = this.doubleDoorRightText;
                      break;
                    default:
                      opType = '';
                      break;
                  }

                  let fixopenText = '';
                  switch (os.VentOpeningDirection) {
                    case 'Inward':
                      fixopenText = this.inwardText;
                      break;
                    case 'Outward':
                      fixopenText = this.outwardText;
                      break;
                    default:
                      fixopenText = this.inwardText;
                      break;
                  }
                  this.glassAppliedArray[os.PickerIndex].push({ glassID: glass.InfillID, fixedOpening: fixopenText, operableType: opType });
                  //this.glassAppliedArray[os.PickerIndex].push({ glassID: glass.InfillID, fixedOpening: fixopenText, operableType: opType });                  
                }
                if (glass.InsertWindowSystemType !== null && glass.InsertWindowSystemType !== undefined && glass.InsertWindowSystemType.indexOf('TipTronic') > -1) {
                  this.pickers[os.PickerIndex].operationType = Object.keys(this.operationType_index).filter(key => this.operationType_index[key] == 'TipTronic')[0];
                } else {
                  this.pickers[os.PickerIndex].operationType = Object.keys(this.operationType_index).filter(key => this.operationType_index[key] == 'Manual')[0];
                }

                if (os.DoorSystemID > 0) {
                  if (this.unified3DModel.ModelInput.Geometry.DoorSystems && this.unified3DModel.ModelInput.Geometry.DoorSystems.length > 0) {
                    let dr = this.unified3DModel.ModelInput.Geometry.DoorSystems[glass.OperabilitySystemID - 1];
                    this.pickers[os.PickerIndex].insideHandle = dr.InsideHandleColor.length > 4 ? dr.InsideHandleArticleDescription + ' - ' + dr.InsideHandleColor.substring(0, dr.InsideHandleColor.length - 10) : dr.InsideHandleArticleDescription + ' - ' + dr.InsideHandleColor;
                    this.insideHandleArticleName = dr ? dr.InsideHandleArticleName : null;
                    setTimeout(() => {
                      this.cpService.setCurrent(this.insideHandleArticleName, PanelsModule.InsideHandle);
                    });
                  }
                } 
                // else {
                //   let op = this.unified3DModel.ModelInput.Geometry.OperabilitySystems[glass.OperabilitySystemID - 1];
                //   this.pickers[os.PickerIndex].insideHandle = op.InsideHandleColor.length > 4 ? op.InsideHandleArticleDescription + ' - ' + op.InsideHandleColor.substring(0, op.InsideHandleColor.length - 10) : op.InsideHandleArticleDescription + ' - ' + op.InsideHandleColor;
                //   this.insideHandleArticleName = op ? op.InsideHandleArticleName : null;
                //   setTimeout(() => {
                //     this.cpService.setCurrent(this.insideHandleArticleName, PanelsModule.InsideHandle);
                //   });
                // }
              }
            });
          });
        if (this.selectedPicker > -1) {
          this.glassAppliedArray[this.selectedPicker].forEach(glassObject => {
            let operableId = this.unified3DModel.ModelInput.Geometry.Infills.filter(glass => glass.InfillID == glassObject.glassID)[0].OperabilitySystemID;
            if (this.unified3DModel.ModelInput.Geometry.Infills.filter(glass => glass.InfillID == glassObject.glassID)[0] && this.unified3DModel.ModelInput.Geometry.OperabilitySystems) {
              let operabalitySystem = this.unified3DModel.ModelInput.Geometry.OperabilitySystems.filter(glass => glass.OperabilitySystemID == operableId)[0];
              this.insulatingSelection = operabalitySystem.InsertInsulationType;
              this.insertInsulationTypeName = operabalitySystem.InsertInsulationTypeName;
              this.gasketSelection = operabalitySystem.InsertUvalueType;
            }
          });
          if (this.pickers[this.selectedPicker].operableType === "parallelOpening" || this.pickers[this.selectedPicker].operableType === "topHung") {
            this.systemAWS114FacadeSelected = this.aws114SystemDesc2.indexOf(this.pickers[this.selectedPicker].windowSystem);
            setTimeout(() => {
              // if (this.unified3DModel.ModelInput.Geometry.Infills.filter(section => section.OperabilitySystemID == (this.selectedPicker + 1))[0] && this.unified3DModel.ModelInput.Geometry.OperabilitySystems) {
              //   this.sendCurrentArticleToFrameCombinationTable.emit({ ArticleID: this.unified3DModel.ModelInput.Geometry.OperabilitySystems.filter(section => section.OperabilitySystemID == (this.selectedPicker + 1))[0].VentArticleName, SystemID: this.aws114SystemValue[this.aws114SystemDesc2.indexOf(this.pickers[this.selectedPicker].windowSystem)], OperationType: this.pickers[this.selectedPicker].operationType });
              // }
              if (this.selectedPicker > -1) {
                this.systemFacadeSelectedEvent.emit(this.pickers[this.selectedPicker].windowSystem);
                this.cpService.setSystem(this.cpService.SystemData("AWS114")[this.systemAWS114FacadeSelected], "OPERABILITY");
              }
            }, 0);
          } else {
            this.systemFacadeSelected = this.awsSystemValue.indexOf(this.pickers[this.selectedPicker].windowSystem);
            setTimeout(() => {
              // if (this.unified3DModel.ModelInput.Geometry.Infills.filter(section => section.OperabilitySystemID == (this.selectedPicker + 1))[0] && this.unified3DModel.ModelInput.Geometry.OperabilitySystems && this.unified3DModel.ModelInput.Geometry.OperabilitySystems) {
              //   this.cpService.setCurrent({ VentArticleID: parseInt(this.unified3DModel.ModelInput.Geometry.OperabilitySystems.filter(section => section.OperabilitySystemID == (this.selectedPicker + 1))[0].VentArticleName) }, PanelsModule.VentFrame);
              //   this.sendCurrentArticleToOuterTable.emit({ ArticleID: this.unified3DModel.ModelInput.Geometry.OperabilitySystems.filter(section => section.OperabilitySystemID == (this.selectedPicker + 1))[0].InsertOuterFrameArticleName });
              // }
              if (this.selectedPicker > -1) {
                this.systemFacadeSelectedEvent.emit(this.pickers[this.selectedPicker].windowSystem);
                this.cpService.setSystem(this.cpService.SystemData("AWS")[this.systemFacadeSelected], "OPERABILITY");
              }
            }, 0);
          }
        }
      }
      if (this.pickers[this.selectedPicker].windowSystem) {
        if (this.pickers[this.selectedPicker].windowSystem.includes('90'))
          this.systemType = '90';
        else if (this.pickers[this.selectedPicker].windowSystem.includes('75'))
          this.systemType = '75';
        else if (this.pickers[this.selectedPicker].windowSystem.includes('114'))
          this.systemType = '114';
      }
    }
    this.defaultOperableTypeSelection();
  }

 /**
 * This function is to disable apply button when the door operable type is selected and multiple glasses are selected
 * 
 *
 */
  private disableApplyButton() {
    if (this.unified3DModel.ModelInput.Geometry.OperabilitySystems) {
      if (this.unified3DModel.ModelInput.Geometry.DoorSystems && this.unified3DModel.ModelInput.Geometry.DoorSystems.length > 0) {
        let op = this.unified3DModel.ModelInput.Geometry.OperabilitySystems.filter(f => f.DoorSystemID === 1)[0];
        if(op){
          var vOT = []; 
          if(this.unified3DModel.ModelInput.Geometry.Infills.filter(glass => glass.OperabilitySystemID === op.OperabilitySystemID)[0]){
            vOT.push(this.unified3DModel.ModelInput.Geometry.Infills.filter(glass => glass.OperabilitySystemID === op.OperabilitySystemID)[0].InfillID);
            if (vOT.every(elem => this.selectedGlassIDs.indexOf(elem) > -1)) {
              this.isApplyBtnDisable = false;
            } else {
              this.isApplyBtnDisable = true;
            }
          } else {
            this.isApplyBtnDisable = false;
          }
        }
      } else {
        if(this.pickers.filter( (picker,index) => picker.operableType.includes('Door') && this.glassAppliedArray[index].length > 0).length > 0 && this.pickers.filter( (picker,index) => picker.operableType.includes('tiltTurn') && this.glassAppliedArray[index].length > 0).length > 0) {
          this.isApplyBtnDisable = true;
        }
        else{
          this.isApplyBtnDisable = false;}
      }
    } else {
      this.isApplyBtnDisable = false;
    }
  }

 /**
 * This function is to add pickers when click on add button 
 *  
 *
 */
  onAddPicker(): void {
    if (this.pickers[this.pickers.length - 1].status === 'unpopulated') {
      let firstUnpopulatedIndex: number = this.pickers.findIndex(this.checkUnpopulatedStatus);
      this.pickers[firstUnpopulatedIndex].status = 'populated';
      this.selectedPicker = firstUnpopulatedIndex;
      this.selectedPickerString = this.selectedPicker.toString();
      this.cpService.setSelectedPicker_Operability(this.selectedPicker);
      if((this.pickers[0].operableType === 'tiltTurn-left' || this.pickers[0].operableType === 'tiltTurn-right') && (this.pickers[1].status === 'populated' && this.pickers[1].operableType === '')) {
        this.isDoorOperableDisable = true;
      } else {
        this.isDoorOperableDisable = false;
      }
      this.insertInsulationTypeName = "Polyamide Anodized After";
      if (this.permissionService.checkPermission(this.feature.HandleColor)) {
        //  this.handlePositioning = 200;
        this.handleColor = 'Silver grey - RAL 7001';
        this.umService.set_HandleColor(this.handleColor);
        // setTimeout(() => {
        //   this.cpService.setCurrent(this.handleColor, PanelsModule.HandleColor);
        // });
      }
    }
    //this.cpService.setPopout(this.isDoorOperableTypeSelected, PanelsModule.DoorOperableType);
  }


  isTiltTurnLeft = true;
  isSideHungLeft = true;
  isBottomHung = true;
  isSingleDoorLeft = true;
  isDoubleDoorLeft = true;

 /**
 * This function is to change the direction of TiltTurn 
 *  
 *
 */
  onChangeTiltTurn(): void {
    //if (this.unified3DModel.ProblemSetting.ProductType === 'Facade')
    this.isTurnTiltDirectionChanged = true;
    this.isOpDirectionChangeForCameraReset = true;
    this.isTiltTurnLeft = !this.isTiltTurnLeft;
    if (this.isTiltTurnLeft == false) this.pickers[this.selectedPicker].operableType = 'tiltTurn-right';
    else if (this.isTiltTurnLeft == true) this.pickers[this.selectedPicker].operableType = 'tiltTurn-left';
    this.onOperableTypeChange(this.pickers[this.selectedPicker].operableType);
  }

 /**
 * This function is to change the direction of SideHung 
 *  
 *
 */
  onChangeSideHung(): void {
    //if (this.unified3DModel.ProblemSetting.ProductType === 'Facade')
    if (this.permissionService.checkPermission(this.feature.SideHung)) {
      this.isSideHungLeft = !this.isSideHungLeft;
      if (this.isSideHungLeft == false) this.pickers[this.selectedPicker].operableType = 'sideHung-right';
      else if (this.isSideHungLeft == true) this.pickers[this.selectedPicker].operableType = 'sideHung-left';
      this.onOperableTypeChange(this.pickers[this.selectedPicker].operableType);
    }

  }

 /**
 * This function is to change the direction of SingleDoor 
 *  
 *
 */
  onChangeSingleDoor(): void {
    this.isSingleDoorLeft = !this.isSingleDoorLeft;
    if (this.isSingleDoorLeft == false) this.pickers[this.selectedPicker].operableType = 'singleDoor-right';
    else if (this.isSingleDoorLeft == true) this.pickers[this.selectedPicker].operableType = 'singleDoor-left';
    this.onOperableTypeChange(this.pickers[this.selectedPicker].operableType);
  }

 /**
 * This function is to change the direction of DoubleDoor 
 *  
 *
 */
  onChangeDoubleDoor(): void {
    this.isDoubleDoorLeft = !this.isDoubleDoorLeft;
    if (this.isDoubleDoorLeft == false) this.pickers[this.selectedPicker].operableType = 'doubleDoor-right';
    else if (this.isDoubleDoorLeft == true) this.pickers[this.selectedPicker].operableType = 'doubleDoor-left';
    this.onOperableTypeChange(this.pickers[this.selectedPicker].operableType);
  }

 /**
 * This function is to change the direction of BottomHung 
 *  
 *
 */
  onChangeBottomHung(): void {
    //if (this.unified3DModel.ProblemSetting.ProductType === 'Facade')
    //this.isBottomHung = !this.isBottomHung; // No top Hung for either Inward-Window or Inward-Facade
    if (this.isBottomHung == true) this.pickers[this.selectedPicker].operableType = 'bottomHung';
    else if (this.isBottomHung == false) this.pickers[this.selectedPicker].operableType = 'topHung';
    this.onOperableTypeChange(this.pickers[this.selectedPicker].operableType);
  }


 /**
 * This function is to set the default direction of all operable types on Page load
 *  
 *
 */
  defaultOperableTypeSelection(): void {
    if (this.pickers[this.selectedPicker]) {
      if (this.pickers[this.selectedPicker].operableType === 'tiltTurn-right') this.isTiltTurnLeft = false;
      else if (this.pickers[this.selectedPicker].operableType === 'tiltTurn-left') this.isTiltTurnLeft = true;
      else if (this.pickers[this.selectedPicker].operableType === 'sideHung-right') this.isSideHungLeft = false;
      else if (this.pickers[this.selectedPicker].operableType === 'sideHung-left') this.isSideHungLeft = true;
      else if (this.pickers[this.selectedPicker].operableType === 'bottomHung') this.isBottomHung = true;
      else if (this.pickers[this.selectedPicker].operableType === 'topHung') this.isBottomHung = false;
      else if (this.pickers[this.selectedPicker].operableType === 'singleDoor-right') this.isSingleDoorLeft = false;
      else if (this.pickers[this.selectedPicker].operableType === 'singleDoor-left') this.isSingleDoorLeft = true;
      else if (this.pickers[this.selectedPicker].operableType === 'doubleDoor-right') this.isDoubleDoorLeft = false;
      else if (this.pickers[this.selectedPicker].operableType === 'doubleDoor-left') this.isDoubleDoorLeft = true;
    }
  }

  // updateHandlePosition(value){
  //   if(value && this.unified3DModel.ModelInput.Geometry.OperabilitySystems.filter( f => f.OperabilitySystemID == (this.selectedPicker + 1))[0] && this.unified3DModel.ModelInput.Geometry.OperabilitySystems.filter( f => f.OperabilitySystemID == (this.selectedPicker + 1))[0].HandlePosition != value){
  //     this.unified3DModel.ModelInput.Geometry.OperabilitySystems.filter( f => f.OperabilitySystemID == (this.selectedPicker + 1))[0].HandlePosition = value;
  //     this.configureService.computeClickedSubject.next(false);
  //     //this.handlePositionEvent.emit({value: this.handlePositioning, index: this.selectedPicker});
  //     this.loadJSONService({ Unified3DModel: this.unified3DModel, canBeDrawn: this.canBeDrawnBool });
  //   }
  // }

  // onHandlePositionChange(event) {
  //   if (this.selectedPicker > -1 ) {
  //     if (this.handlePositioning < 200 || this.handlePositioning > this.windowHeight) {
  //       this.validateFormSRS.controls['handlePosition'].setErrors({ 'incorrect': true });
  //     }
  //     if(this.unified3DModel.ModelInput.Geometry.OperabilitySystems !== null && this.unified3DModel.ModelInput.Geometry.OperabilitySystems !== undefined){
  //       this.updateHandlePosition(event);
  //     }
  //   }

  // }

  checkUnpopulatedStatus(picker) {
    return picker.status === 'unpopulated';
  }

 /**
 * This function is to set all the operable panel values based on the picker selected
 *  
 *
 */
  reloadDate = false;
  onSelectPicker(): void {
    this.cpService.closeAllPopouts();
    this.reloadDate = false;
    this.selectedPicker = parseInt(this.selectedPickerString);
    this.cpService.setSelectedPicker_Operability(this.selectedPicker);
    if (this.unified3DModel.ModelInput.Geometry.Infills.filter(section => section.OperabilitySystemID == (this.selectedPicker + 1))[0]) {
      let hasOperability = this.unified3DModel.ModelInput.Geometry.OperabilitySystems ? true : false;
      if (hasOperability) {
        // if (this.pickers[this.selectedPicker].operableType === "parallelOpening" || this.pickers[this.selectedPicker].operableType === "topHung") {
        //   this.sendCurrentArticleToFrameCombinationTable.emit({ ArticleID: this.unified3DModel.ModelInput.Geometry.OperabilitySystems.filter(section => section.OperabilitySystemID == (this.selectedPicker + 1))[0].VentArticleName, SystemID: this.aws114SystemValue[this.aws114SystemDesc2.indexOf(this.pickers[this.selectedPicker].windowSystem)], OperationType: this.pickers[this.selectedPicker].operationType });
        // } else {
        //     this.sendCurrentArticleToOuterTable.emit({ ArticleID: this.unified3DModel.ModelInput.Geometry.OperabilitySystems.filter(section => section.OperabilitySystemID == (this.selectedPicker + 1))[0].InsertOuterFrameArticleName });
        //     this.cpService.setCurrent({ VentArticleID: parseInt(this.unified3DModel.ModelInput.Geometry.OperabilitySystems.filter(section => section.OperabilitySystemID == (this.selectedPicker + 1))[0].VentArticleName) }, PanelsModule.VentFrame);
        // }
        this.insulatingSelection = this.unified3DModel.ModelInput.Geometry.OperabilitySystems.filter(section => section.OperabilitySystemID == (this.selectedPicker + 1))[0].InsertInsulationType;
        this.insertInsulationTypeName = this.unified3DModel.ModelInput.Geometry.OperabilitySystems.filter(section => section.OperabilitySystemID == (this.selectedPicker + 1))[0].InsertInsulationTypeName;
        this.gasketSelection = this.unified3DModel.ModelInput.Geometry.OperabilitySystems.filter(section => section.OperabilitySystemID == (this.selectedPicker + 1))[0].InsertUvalueType;
      }
    }
    if (this.selectedPicker > -1) {
      this.systemFacadeSelectedEvent.emit(this.pickers[this.selectedPicker].windowSystem);      
    }
    this.defaultOperableTypeSelection();
    if (this.selectedPicker > -1) {
      if (this.pickers[this.selectedPicker].fixedOpening === "Inward") {
        this.systemFacadeSelected = this.awsSystemValue.indexOf(this.pickers[this.selectedPicker].windowSystem);
        this.cpService.setSystem(this.cpService.SystemData("AWS")[this.systemFacadeSelected], "OPERABILITY");
      }
      else if (this.pickers[this.selectedPicker].fixedOpening === "Outward") {
        this.systemAWS114FacadeSelected = this.aws114SystemDesc2.indexOf(this.pickers[this.selectedPicker].windowSystem);
        this.cpService.setSystem(this.cpService.SystemData("AWS114")[this.systemAWS114FacadeSelected], "OPERABILITY");
      }
      // this.unified3DModel.ModelInput.Geometry.Infills.filter(section => section.OperabilitySystemID == this.selectedPicker).forEach(element => {
      //   element.VentArticleName = 'AWS114VA';
      //   element.InsertOuterFrameArticleName = 'AWS114OF';
      // });
      if (this.pickers[this.selectedPicker].windowSystem) {
        if (this.pickers[this.selectedPicker].windowSystem.includes('90')) this.systemType = '90';
        else if (this.pickers[this.selectedPicker].windowSystem.includes('75')) this.systemType = '75';
        else if (this.pickers[this.selectedPicker].windowSystem.includes('114')) this.systemType = '114';
      }
      if (this.permissionService.checkPermission(this.feature.HandleColor)) {
        // this.handlePositioning = this.unified3DModel.ModelInput.Geometry.OperabilitySystems.filter( f => f.OperabilitySystemID == (this.selectedPicker + 1))[0].HandlePosition;
        this.handleColor = this.unified3DModel.ModelInput.Geometry.OperabilitySystems && this.unified3DModel.ModelInput.Geometry.OperabilitySystems.filter( f => f.OperabilitySystemID == (this.selectedPicker + 1))[0] ?
          this.unified3DModel.ModelInput.Geometry.OperabilitySystems.filter( f => f.OperabilitySystemID == (this.selectedPicker + 1))[0].InsideHandleColor : this.pickers[this.selectedPicker].handleColor;
        this.umService.set_HandleColor(this.handleColor);
        // this.cpService.setCurrent('', PanelsModule.HandleColor);
        // setTimeout(() => {
        //   this.cpService.setCurrent(this.handleColor, PanelsModule.HandleColor);
        // });
      }
      if (this.permissionService.checkPermission(this.feature.ADS_75)) {
        if (this.unified3DModel.ModelInput.Geometry.DoorSystems && this.unified3DModel.ModelInput.Geometry.DoorSystems.length > 0) {
          let ds = this.unified3DModel.ModelInput.Geometry.DoorSystems[this.selectedPicker];
          if (ds != undefined) {
            let HandleList = this.cpService.buildInsideHandleList().filter(handle => handle.ArticleName === ds.InsideHandleArticleName);
            let handleDescription = HandleList[0].Description;
            this.insideHandle = '' + ds.InsideHandleArticleName + ' - ' + ds.InsideHandleColor.split("-")[0].trim();
            this.pickers[this.selectedPicker].insideHandle = ds.InsideHandleColor.length > 4 ? (handleDescription + ' - ' + ds.InsideHandleColor.substring(0, ds.InsideHandleColor.length - 10)) : handleDescription + ' - ' + ds.InsideHandleColor;
          }
        } else {
          if(this.unified3DModel.ModelInput.Geometry.OperabilitySystems && this.unified3DModel.ModelInput.Geometry.OperabilitySystems.length >= this.selectedPicker + 1) {
            let os = this.unified3DModel.ModelInput.Geometry.OperabilitySystems[this.selectedPicker];
            if (os != undefined) {
              let WinHandleList = this.cpService.buildWindowHandleList().filter(handle => handle.ArticleName === os.InsideHandleArticleName);
              if (WinHandleList[0] != undefined) {
                let winHandleDescription = WinHandleList[0].Description;
                this.insideHandle = '' + os.InsideHandleArticleName + ' - ' + os.InsideHandleColor.split("-")[0].trim();
                this.pickers[this.selectedPicker].insideHandle = os.InsideHandleColor.length > 4 ? (winHandleDescription + ' - ' + os.InsideHandleColor.substring(0, os.InsideHandleColor.length - 10)) : winHandleDescription + ' - ' + os.InsideHandleColor;          
              }
            }
          }
        }

      }

      if (this.insertInsulationTypeName !== "") {
        if (this.pickers[this.selectedPicker].fixedOpening == 'Outward') {
          this.insertInsulationTypeName = "PA";
          this.frameCombinationInputValue = 'Combination 1';
        }
        else if (this.pickers[this.selectedPicker].fixedOpening == 'Inward') {
          this.insertInsulationTypeName = "Polyamide Anodized After";
        }
      }

    }
 
    if (this.selectedPicker > 0 || this.pickers.filter(f => f.operableType.includes('Door')).length > 0){
        this.isApplyBtnDisable = true;
      }
    else {
      this.isApplyBtnDisable = false;
    }
  
    this.setDoorOperableTypeDisabled();
  }

 /**
 * This function is to set the operable values and saved to teh unified model  
 * and also calls the 3D Modeler event to see the operable type applied to the glass in the 3D Viewer
 *
 */
  onApply(event = null): void {
    if (this.pickers[this.selectedPicker].operableType.includes('Door')) {
       this.isDoorOperableTypeSelected = true;
       this.isWindowOperableTypeSelected = false;
      this.isWindowArticlesDisplay = false;
      this.isDoorArticlesDisplay = true;
      this.isDoorOperableDisable = false;
      this.isWindowOperableDisable = true;
      
    } else {
       this.isDoorOperableTypeSelected = false;
       this.isWindowOperableTypeSelected = true;
      this.isWindowArticlesDisplay = true;
      this.isDoorArticlesDisplay = false;
      this.isDoorOperableDisable = true;
      this.isWindowOperableDisable = false;
    }

    // if (this.isDoorOperableTypeSelected) {
    //   this.insideHandle = '';
    //   //this.doorOperableTypeChangeEvent.emit(this.isDoorOperableTypeSelected);
    // } else {
    //   this.insideHandle = '';
    //   //this.doorOperableTypeChangeEvent.emit(this.isDoorOperableTypeSelected);
    // }
    //this.cpService.setPopout(this.isDoorOperableTypeSelected, PanelsModule.DoorOperableType);
    if (!(this.selectedPicker === -1 || !this.pickers[this.selectedPicker].operableType || !this.pickers[this.selectedPicker].fixedOpening)) {
      this.selectedGlassIDs.forEach((id: number) => {
        if (id in this.glassIDsAlreadyApplied) {  // check if glassId is already applied
          this.glassAppliedArray[this.glassIDsAlreadyApplied[id]] = this.glassAppliedArray[this.glassIDsAlreadyApplied[id]].filter(glass => glass.glassID !== id);  // remove information
        }
        // apply new glass information
        this.glassIDsAlreadyApplied[id] = this.selectedPicker + 1;
        if (this.isDoorOperableTypeSelected) {
          this.pickers[this.selectedPicker].windowSystem = 'ads__75';
        } else {
          this.pickers[this.selectedPicker].windowSystem = 'aws__75_si_plus';
        }
        let opType = '';
        switch (this.operableType_index[this.pickers[this.selectedPicker].operableType]) {
          case 'Turn-Tilt-Right': opType = this.tiltOrTurnRightText; break
          case 'Turn-Tilt-Left': opType = this.tiltOrTurnLeftText; break
          case 'Side-Hung-Right': opType = this.sideHungRightText; break
          case 'Side-Hung-Left': opType = this.sideHungLeftText; break
          case 'Bottom-Hung': opType = this.bottomHungText; break
          case 'Top-Hung': opType = this.topHungText; break
          case 'Parallel-Opening': opType = this.parallelOpeningText; break
          case 'Single-Door-Left': opType = this.singleDoorLeftText; break
          case 'Single-Door-Right': opType = this.singleDoorRightText; break
          case 'Double-Door-Active-Left': opType = this.doubleDoorLeftText; break
          case 'Double-Door-Active-Right': opType = this.doubleDoorRightText; break
          default: opType = ''; break
        }

        let fixopenText = '';
        switch (this.fixedOpening_index[this.pickers[this.selectedPicker].fixedOpening]) {
          case 'Inward': fixopenText = this.inwardText; break
          case 'Outward': fixopenText = this.outwardText; break
          default: fixopenText = this.inwardText; break
        }
        this.glassAppliedArray[this.selectedPicker].push({ glassID: id, fixedOpening: fixopenText, operableType: opType });
        // let operableId = this.unified3DModel.ModelInput.Geometry.Infills[id] === undefined ? -1 : this.unified3DModel.ModelInput.Geometry.Infills[id].OperabilitySystemID;
        let operableId = this.unified3DModel.ModelInput.Geometry.Infills.filter(glass => glass.InfillID == id)[0].OperabilitySystemID === undefined ? -1 : this.unified3DModel.ModelInput.Geometry.Infills.filter(glass => glass.InfillID == id)[0].OperabilitySystemID;
        let operabilityExists = this.unified3DModel.ModelInput.Geometry.OperabilitySystems !== null ? (this.unified3DModel.ModelInput.Geometry.OperabilitySystems.filter( f => f.OperabilitySystemID == (this.selectedPicker + 1))[0] === undefined ? false : true) : false;

        let doorsystemId = operableId > 0 ? this.unified3DModel.ModelInput.Geometry.OperabilitySystems.filter(glass => glass.OperabilitySystemID === operableId)[0].DoorSystemID : -1;
        let hasdoorSystems = this.unified3DModel.ModelInput.Geometry.DoorSystems ? true : false;
        let hasOperability = this.unified3DModel.ModelInput.Geometry.OperabilitySystems ? true : false;

        let operabilitysystem = new OperabilitySystem();
        let doorsystem = new DoorSystem();
        operabilitysystem.VentOpeningDirection = this.fixedOpening_index[this.pickers[this.selectedPicker].fixedOpening];
        operabilitysystem.VentOperableType = this.operableType_index[this.pickers[this.selectedPicker].operableType];
        operabilitysystem.InsertInsulationType = this.insulatingSelection;
        operabilitysystem.InsertUvalueType = this.gasketSelection;
        operabilitysystem.InsertInsulationTypeName = this.insertInsulationTypeName;
        operabilitysystem.OperabilitySystemID = this.selectedPicker + 1;
        operabilitysystem.PickerIndex = this.selectedPicker;
       // operabilitysystem.InsideHandleColor = this.handleColor;

        this.unified3DModel.ModelInput.Geometry.Infills.filter(glass => glass.InfillID == id)[0].OperabilitySystemID = operabilitysystem.OperabilitySystemID;
        var os = this.umService.obj_OperabilitySystem(this.selectedPicker);
        // if(this.selectedPicker - 1 !== -1 && this.pickers[this.selectedPicker - 1].operableType === '') {
        //   var os = this.umService.obj_OperabilitySystem(this.selectedPicker - 1);
        // } else {
        //   var os = this.umService.obj_OperabilitySystem(this.selectedPicker);
        // }
        
        if (os) {
          operabilitysystem.VentArticleName = os.VentArticleName;
          operabilitysystem.VentInsideW = os.VentInsideW;
          operabilitysystem.VentOutsideW = os.VentOutsideW;
          operabilitysystem.VentDistBetweenIsoBars = os.VentDistBetweenIsoBars;

          operabilitysystem.InsertOuterFrameArticleName = os.InsertOuterFrameArticleName;
          operabilitysystem.InsertOuterFrameInsideW = os.InsertOuterFrameInsideW;
          operabilitysystem.InsertOuterFrameOutsideW = os.InsertOuterFrameOutsideW;
          operabilitysystem.InsertOuterFrameDistBetweenIsoBars = os.InsertOuterFrameDistBetweenIsoBars;

          operabilitysystem.InsideHandleArticleName = os.InsideHandleArticleName;
          operabilitysystem.InsideHandleColor = os.InsideHandleColor;
          operabilitysystem.InsideHandleArticleDescription = os.InsideHandleArticleDescription;
        }
        if (!this.isDoorOperableTypeSelected) {
          operabilitysystem.DoorSystemID = -1;
          //operabilitysystem.HandlePosition = this.handlePositioning;
          this.unified3DModel.ModelInput.Geometry.Infills[id - 1].HandlePosition = -1; // negative number sets the handle position in center of vent
        } else {
          if (this.isDoorOperableTypeSelected) {
            operabilitysystem.VentArticleName = '-1';
            operabilitysystem.VentInsideW = null;
            operabilitysystem.VentOutsideW = null;
          }
          this.unified3DModel.ModelInput.Geometry.Infills[id - 1].HandlePosition = 1050; // sets the handle position if it is doorsystem
          var ds = this.umService.obj_Door(1);
          if (ds) {
            doorsystem.DoorLeafArticleName = ds.DoorLeafArticleName;
            doorsystem.DoorLeafInsideW = ds.DoorLeafInsideW;
            doorsystem.DoorLeafOutsideW = ds.DoorLeafOutsideW;
            doorsystem.DoorPassiveJambArticleName = ds.DoorPassiveJambArticleName;
            doorsystem.DoorPassiveJambInsideW = ds.DoorPassiveJambInsideW;
            doorsystem.DoorPassiveJambOutsideW = ds.DoorPassiveJambOutsideW;
            doorsystem.DoorSillArticleName = ds.DoorSillArticleName;
            doorsystem.DoorSillInsideW = ds.DoorSillInsideW;
            doorsystem.DoorSillOutsideW = ds.DoorSillOutsideW;
            doorsystem.DoorSidelightSillArticleName = ds.DoorSidelightSillArticleName;
            doorsystem.HingeCondition = 0;
            doorsystem.OutsideHandleArticleName = ds.OutsideHandleArticleName;
            doorsystem.OutsideHandleColor = ds.OutsideHandleColor;
            doorsystem.OutsideHandleArticleDescription = ds.OutsideHandleArticleDescription;
            doorsystem.InsideHandleArticleName = ds.InsideHandleArticleName;
            doorsystem.InsideHandleColor = ds.InsideHandleColor;
            doorsystem.InsideHandleArticleDescription = ds.InsideHandleArticleDescription;
            doorsystem.HingeArticleName = ds.HingeArticleName;
            doorsystem.HingeColor = ds.HingeColor;
          }
          // doorsystem.HingeArticleDescription = this.HingeTypeFromChild === undefined ? null : this.HingeTypeFromChild.Description;
        //  doorsystem.DoorSystemType = opType.toLowerCase().includes('single') ? 'Single' : 'Double';
          switch (opType) {
            case "Double Door - Right Active": doorsystem.DoorSystemType = this.doubleDoorRightSystemTypeText; break;
            case "Double Door - Left Active": doorsystem.DoorSystemType = this.doubleDoorLeftSystemTypeText; break;
            case "Single Door - Left": doorsystem.DoorSystemType = this.singleDoorLeftSystemTypeText; break;
            case "Single Door - Right": doorsystem.DoorSystemType = this.singleDoorRightSystemTypeText; break;
            default: doorsystem.DoorSystemType = ''; break;
          }

          doorsystem.DoorSystemID = this.selectedPicker + 1;
          // doorsystem.InsideHandleArticleName = "1";
          // doorsystem.OutsideHandleArticleName = "1";
          operabilitysystem.DoorSystemID = doorsystem.DoorSystemID;
          if (!hasdoorSystems) {
            this.unified3DModel.ModelInput.Geometry.DoorSystems = [];
            this.unified3DModel.ModelInput.Geometry.DoorSystems.push(doorsystem);
          }
        }

         operableId = this.unified3DModel.ModelInput.Geometry.Infills.filter(glass => glass.InfillID == id)[0].OperabilitySystemID === undefined ? -1 : this.unified3DModel.ModelInput.Geometry.Infills.filter(glass => glass.InfillID == id)[0].OperabilitySystemID;
        if (!hasOperability) {
          this.unified3DModel.ModelInput.Geometry.OperabilitySystems = [];
          this.unified3DModel.ModelInput.Geometry.OperabilitySystems.push(operabilitysystem);
        } else {
          if (operabilityExists && operableId > 0) {
            let umOperabilitySystems = this.unified3DModel.ModelInput.Geometry.OperabilitySystems.filter(glass => glass.OperabilitySystemID == operableId)[0];
            umOperabilitySystems.VentOpeningDirection = this.fixedOpening_index[this.pickers[this.selectedPicker].fixedOpening];
            umOperabilitySystems.VentOperableType = this.operableType_index[this.pickers[this.selectedPicker].operableType];
            umOperabilitySystems.InsertInsulationType = this.insulatingSelection;
            umOperabilitySystems.InsertUvalueType = this.gasketSelection;
            umOperabilitySystems.InsertInsulationTypeName = this.insertInsulationTypeName;
            //umOperabilitySystems.InsideHandleColor = this.handleColor;
            var os = this.umService.obj_OperabilitySystem(0);
            if (os) {
              umOperabilitySystems.VentArticleName = os.VentArticleName;
              umOperabilitySystems.VentInsideW = os.VentInsideW;
              umOperabilitySystems.VentOutsideW = os.VentOutsideW;
              umOperabilitySystems.VentDistBetweenIsoBars = os.VentDistBetweenIsoBars;
              umOperabilitySystems.InsertOuterFrameArticleName = os.InsertOuterFrameArticleName;
              umOperabilitySystems.InsertOuterFrameInsideW = os.InsertOuterFrameInsideW;
              umOperabilitySystems.InsertOuterFrameOutsideW = os.InsertOuterFrameOutsideW;
              umOperabilitySystems.InsertOuterFrameDistBetweenIsoBars = os.InsertOuterFrameDistBetweenIsoBars;
              umOperabilitySystems.InsideHandleArticleName = os.InsideHandleArticleName;
              umOperabilitySystems.InsideHandleColor = os.InsideHandleColor;
              umOperabilitySystems.InsideHandleArticleDescription = os.InsideHandleArticleDescription;
            }
            if(this.isDoorOperableTypeSelected) {
              umOperabilitySystems.DoorSystemID = 1;
              doorsystemId = 1;
            } else {
              umOperabilitySystems.DoorSystemID = -1;
                doorsystemId = -1;
                if(this.unified3DModel.ModelInput.Geometry.OperabilitySystems && this.unified3DModel.ModelInput.Geometry.OperabilitySystems.filter(o => o.DoorSystemID === 1).length > 0) {
                  this.unified3DModel.ModelInput.Geometry.OperabilitySystems.forEach(item => {
                    if(item.DoorSystemID === 1) {
                      item.DoorSystemID = -1;
                    }
                  });
                }
                this.unified3DModel.ModelInput.Geometry.DoorSystems = null;
                if(this.unified3DModel.ModelInput.Geometry.OperabilitySystems.filter(o => o.OperabilitySystemID === operableId)[0].VentArticleName === '-1') 
                this.unified3DModel.ModelInput.Geometry.OperabilitySystems.filter(o => o.OperabilitySystemID === operableId)[0].VentArticleName = undefined;
            }
            let hasdoorSystems = this.unified3DModel.ModelInput.Geometry.DoorSystems ? true : false;
            if (hasdoorSystems && doorsystemId > 0) {
              let umDoorSystems = this.unified3DModel.ModelInput.Geometry.DoorSystems.filter(glass => glass.DoorSystemID === doorsystemId)[0];
              var ds = this.umService.obj_Door(1);
              if (ds) {
                umDoorSystems.DoorLeafArticleName = ds.DoorLeafArticleName;
                umDoorSystems.DoorLeafInsideW = ds.DoorLeafInsideW;
                umDoorSystems.DoorLeafOutsideW = ds.DoorLeafOutsideW;
                umDoorSystems.DoorPassiveJambArticleName = ds.DoorPassiveJambArticleName;
                umDoorSystems.DoorPassiveJambInsideW = ds.DoorPassiveJambInsideW;
                umDoorSystems.DoorPassiveJambOutsideW = ds.DoorPassiveJambOutsideW;
                umDoorSystems.DoorSillArticleName = ds.DoorSillArticleName;
                umDoorSystems.DoorSillInsideW = ds.DoorSillInsideW;
                umDoorSystems.DoorSillOutsideW = ds.DoorSillOutsideW;
                umDoorSystems.DoorSidelightSillArticleName = ds.DoorSidelightSillArticleName;
                umDoorSystems.OutsideHandleArticleName = ds.OutsideHandleArticleName;
                umDoorSystems.OutsideHandleColor = ds.OutsideHandleColor;
                umDoorSystems.OutsideHandleArticleDescription = ds.OutsideHandleArticleDescription;
                umDoorSystems.InsideHandleArticleName = ds.InsideHandleArticleName;
                umDoorSystems.InsideHandleColor = ds.InsideHandleColor;
                umDoorSystems.InsideHandleArticleDescription = ds.InsideHandleArticleDescription
                umDoorSystems.HingeArticleName = ds.HingeArticleName;
                umDoorSystems.HingeColor = ds.HingeColor;
                umDoorSystems.HingeArticleDescription = ds.HingeArticleDescription;
              }
              umDoorSystems.HingeCondition = 0;
              this.unified3DModel.ModelInput.Geometry.OperabilitySystems.filter(glass => glass.OperabilitySystemID === operableId)[0].VentArticleName = '-1';
              this.unified3DModel.ModelInput.Geometry.OperabilitySystems.filter(glass => glass.OperabilitySystemID === operableId)[0].VentInsideW = null;
              this.unified3DModel.ModelInput.Geometry.OperabilitySystems.filter(glass => glass.OperabilitySystemID === operableId)[0].VentOutsideW = null;
              // umDoorSystems.DoorSystemType = opType.toLowerCase().includes('single') ? 'Single' : 'Double';
              switch (opType) {
                case "Double Door - Right Active": umDoorSystems.DoorSystemType = this.doubleDoorRightSystemTypeText; break;
                case "Double Door - Left Active": umDoorSystems.DoorSystemType = this.doubleDoorLeftSystemTypeText; break;
                case "Single Door - Left": umDoorSystems.DoorSystemType = this.singleDoorLeftSystemTypeText; break;
                case "Single Door - Right": umDoorSystems.DoorSystemType = this.singleDoorRightSystemTypeText; break;
                default: umDoorSystems.DoorSystemType = ''; break;
              }

            }
          } else {
            if (operabilityExists && (operableId == -1 || operableId == 0)) {
              this.unified3DModel.ModelInput.Geometry.OperabilitySystems.splice(this.selectedPicker, 1);
              // this.unified3DModel.ModelInput.Geometry.OperabilitySystems.filter( f => f.OperabilitySystemID == (this.selectedPicker + 1))[0] = operabilitysystem;
              this.unified3DModel.ModelInput.Geometry.OperabilitySystems.splice(this.selectedPicker, 0, operabilitysystem);
            } else {
              this.unified3DModel.ModelInput.Geometry.OperabilitySystems.push(operabilitysystem);
            }
          }
        }
        let umInfills = this.unified3DModel.ModelInput.Geometry.Infills.filter(glass => glass.InfillID == id)[0];
        umInfills.InsertWindowSystemType = this.pickers[this.selectedPicker].operationType; //​Window System
        //umInfills.InsertOuterFrameDepth = this.OuterFrameInputArticle === undefined ? null : this.OuterFrameInputArticle.Depth;
        //umInfills.HandlePosition = this.handlePositioning;
        umInfills.OperabilitySystemID = operabilitysystem.OperabilitySystemID;

        this.frameCombinationInputValue = undefined;
        if (event === "parallelOpening" || event === "topHung" || this.operableType_index[this.pickers[this.selectedPicker].operableType] === "Parallel-Opening" || this.operableType_index[this.pickers[this.selectedPicker].operableType] == "Top-Hung")
          this.frameCombinationInputValue = 'Combination 1';
        // let operableId = this.unified3DModel.ModelInput.Geometry.Infills.filter(glass => glass.InfillID ==id)[0].OperabilitySystemID;
        if (this.operableType_index[this.pickers[this.selectedPicker].operableType] === "Parallel-Opening" || this.operableType_index[this.pickers[this.selectedPicker].operableType] === "Top-Hung") {
          if (!hasOperability) {
            this.unified3DModel.ModelInput.Geometry.OperabilitySystems = [];
            operabilitysystem.InsertOuterFrameArticleName = '1';
            this.unified3DModel.ModelInput.Geometry.OperabilitySystems.push(operabilitysystem);
          } else {
            if (operableId > 0) {
              this.unified3DModel.ModelInput.Geometry.OperabilitySystems.filter(glass => glass.OperabilitySystemID == operableId)[0].InsertOuterFrameArticleName = '1';
            }
            else {
              operabilitysystem.InsertOuterFrameArticleName = '1';
              this.unified3DModel.ModelInput.Geometry.OperabilitySystems.push(operabilitysystem);
            }

          }
          this.frameCombinationInputValue = 'Combination 1';
          if (this.unified3DModel.ProblemSetting.ProductType !== 'Window') {
            let operabilityExists = this.unified3DModel.ModelInput.Geometry.OperabilitySystems !== null ? (this.unified3DModel.ModelInput.Geometry.OperabilitySystems.filter( f => f.OperabilitySystemID == (this.selectedPicker + 1))[0] === undefined ? false : true) : false;
            umInfills.InsertWindowSystem = this.pickers[this.selectedPicker].windowSystem === '' ? 'AWS 114' : this.pickers[this.selectedPicker].windowSystem; //​Window System
            if (!hasOperability) {
              this.unified3DModel.ModelInput.Geometry.OperabilitySystems = [];
              operabilitysystem.InsertedWindowType = this.pickers[this.selectedPicker].windowSystem === '' ? 'AWS 114' : this.pickers[this.selectedPicker].windowSystem;
              operabilitysystem.VentArticleName = 'AWS114VA';
              operabilitysystem.InsertOuterFrameArticleName = 'AWS114OF';
              this.unified3DModel.ModelInput.Geometry.OperabilitySystems.push(operabilitysystem);
            } else {
              if (operabilityExists && operableId > 0) {
                this.unified3DModel.ModelInput.Geometry.OperabilitySystems.filter(glass => glass.OperabilitySystemID == operableId)[0].InsertedWindowType = this.pickers[this.selectedPicker].windowSystem === '' ? 'AWS 114' : this.pickers[this.selectedPicker].windowSystem;
                this.unified3DModel.ModelInput.Geometry.OperabilitySystems.filter(glass => glass.OperabilitySystemID == operableId)[0].VentArticleName = 'AWS114VA';
                this.unified3DModel.ModelInput.Geometry.OperabilitySystems.filter(glass => glass.OperabilitySystemID == operableId)[0].InsertOuterFrameArticleName = 'AWS114OF';
              } else {
                operabilitysystem.InsertedWindowType = this.pickers[this.selectedPicker].windowSystem === '' ? 'AWS 114' : this.pickers[this.selectedPicker].windowSystem;
                operabilitysystem.VentArticleName = 'AWS114VA';
                operabilitysystem.InsertOuterFrameArticleName = 'AWS114OF';
                if (operabilityExists && (operableId == -1 || operableId == 0)) {
                  this.unified3DModel.ModelInput.Geometry.OperabilitySystems.splice(this.selectedPicker, 1);
                  this.unified3DModel.ModelInput.Geometry.OperabilitySystems.splice(this.selectedPicker, 0, operabilitysystem);
                } else {
                  this.unified3DModel.ModelInput.Geometry.OperabilitySystems.push(operabilitysystem);
                }
              }

            }

          }
        } else if (this.unified3DModel.ProblemSetting.ProductType !== 'Window') {
          let operabilityExists = this.unified3DModel.ModelInput.Geometry.OperabilitySystems !== null ? (this.unified3DModel.ModelInput.Geometry.OperabilitySystems.filter( f => f.OperabilitySystemID == (this.selectedPicker + 1))[0] === undefined ? false : true) : false;
          umInfills.InsertWindowSystem = this.pickers[this.selectedPicker].windowSystem === '' ? 'aws__75_si_plus' : this.pickers[this.selectedPicker].windowSystem; //​Window System
          this.pickers[this.selectedPicker].windowSystem = this.pickers[this.selectedPicker].windowSystem === '' ? 'aws__75_si_plus' : this.pickers[this.selectedPicker].windowSystem;
          if (!hasOperability) {
            this.unified3DModel.ModelInput.Geometry.OperabilitySystems = [];
            operabilitysystem.InsertedWindowType = this.awsSystemDesc[this.awsSystemValue.indexOf(this.pickers[this.selectedPicker].windowSystem)];
            this.unified3DModel.ModelInput.Geometry.OperabilitySystems.push(operabilitysystem);
          } else {
            if (operabilityExists && operableId > 0) {
              this.unified3DModel.ModelInput.Geometry.OperabilitySystems.filter(glass => glass.OperabilitySystemID == operableId)[0].InsertedWindowType = this.awsSystemDesc[this.awsSystemValue.indexOf(this.pickers[this.selectedPicker].windowSystem)];
            } else {
              operabilitysystem.InsertedWindowType = this.awsSystemDesc[this.awsSystemValue.indexOf(this.pickers[this.selectedPicker].windowSystem)];
              if (operabilityExists && (operableId == -1 || operableId == 0)) {
                this.unified3DModel.ModelInput.Geometry.OperabilitySystems.splice(this.selectedPicker, 1);
                this.unified3DModel.ModelInput.Geometry.OperabilitySystems.splice(this.selectedPicker, 0, operabilitysystem);
              } else {
                this.unified3DModel.ModelInput.Geometry.OperabilitySystems.push(operabilitysystem);
              }
            }

          }
        }
        this.setDoorOperableTypeDisabled();
        // let color: any;
        // let ralNumber: any;
        // ralNumber = operabilitysystem.HandleColor.toLowerCase().trim().substr(operabilitysystem.HandleColor.toLowerCase().trim().length - 4);
        // switch (ralNumber) {
        //   case '9016':
        //     color = "#F3F0EB";
        //     break;
        //   case '9005':
        //      color = "#0E0D12";
        //      break;
        //   case '7001':
        //      color = "#8C959C";
        //       break;
        //   default:
        //     color = "#F3F0EB";
        //     break;
        // }
        //this.iframeEvent.next(new IFrameEvent('setHandleFinishColor', color));
        //this.iframeEvent.next(new IFrameEvent('setHandlePosition', { height:this.handlePositioning, index: id}));
      });
      
      //disableresult
      // this.configureService.computeClickedSubject.next(false);
      // this.unified3DModelFromOperabilityEvent.emit(this.unified3DModel);
      this.selectedGlassIDs = [];
      if (this.pickers[this.selectedPicker].operableType && this.pickers[this.max(this.selectedPicker, 0)].fixedOpening) {
        if (this.pickers[this.max(this.selectedPicker, 0)].fixedOpening == 'Outward' &&
          (this.pickers[this.selectedPicker].operableType == 'parallelOpening' || this.pickers[this.selectedPicker].operableType == 'topHung') || this.applicationType == "SRS") {
          this.onSelectAWSWindowSystem(0);
        } else
          this.onSelectFWSWindowSystem(0);
      }
      if (this.isDoorOperableTypeSelected) {
        let systemADSSelected = this.adsSystemValue.indexOf(this.pickers[this.selectedPicker].windowSystem);
        this.isAddBtnDisable = true;
        this.unified3DModel.ModelInput.FrameSystem.SystemType = this.cpService.SystemData("ADS")[this.selectedPicker].Description;
        this.cpService.setSystem(this.cpService.SystemData("ADS")[systemADSSelected], "FRAMING");
      }
      else if (this.unified3DModel.ProblemSetting.ProductType === 'Window') {
        let systemFacadeSelected = this.awsSystemValue.indexOf(this.pickers[this.selectedPicker].windowSystem);
        this.isAddBtnDisable = false;
        this.unified3DModel.ModelInput.FrameSystem.SystemType = this.cpService.SystemData("AWS")[systemFacadeSelected].Description;
        this.cpService.setSystem(this.cpService.SystemData("AWS")[systemFacadeSelected], "FRAMING");
      }

      this.umService.setUnifiedModel(this.unified3DModel);      
      setTimeout(() => {
        this.reloadInputValues();
        setTimeout(() => {
          this.iframeService.setShowLoader(true);
          this.loadJSONService({ Unified3DModel: this.unified3DModel, canBeDrawn: this.canBeDrawnBool });
          this.lc.loadDisplaySetting_ActivePanel();    
        }, 25);
      }, 10);
    }
  }

 /**
 * This function is to disable the door operable type when the Window operable type is selected
 *
 *
 */
  private setDoorOperableTypeDisabled() {
     var vOT = [];
    this.unified3DModel.ModelInput.Geometry.Infills.forEach(element => {
      if (element.OperabilitySystemID != -1) {
        let ot = this.unified3DModel.ModelInput.Geometry.OperabilitySystems.filter(f => f.OperabilitySystemID === element.OperabilitySystemID)[0];
        if(ot)
          vOT.push(ot.VentOperableType);
      }
    });
    if (vOT.filter(f => f === 'Turn-Tilt-Left' || f === 'Turn-Tilt-Right').length > 0) {
        this.isDoorOperableDisable = true;
        this.isWindowOperableDisable = false;
      } else
      {
        if(vOT.filter(f => f === 'Single-Door-Left' || f === 'Single-Door-Right' || f === 'Double-Door-Active-Left' || f === 'Double-Door-Active-Right').length > 0) {
          this.isDoorOperableDisable = false;
          this.isWindowOperableDisable = true;
        } else {
          this.isDoorOperableDisable = false;
          this.isWindowOperableDisable = false;
        }
       
       }
   
    // var vOT = [];
    // this.unified3DModel.ModelInput.Geometry.Infills.forEach(element => {
    //   if (element.OperabilitySystemID != -1) {
    //     let ot = this.unified3DModel.ModelInput.Geometry.OperabilitySystems.filter(f => f.OperabilitySystemID === element.OperabilitySystemID)[0];
    //     if(ot)
    //       vOT.push(ot.VentOperableType);
    //   }
    // });
    // if (vOT.filter(f => f === 'Turn-Tilt-Left' || f === 'Turn-Tilt-Right').length > 1 || (vOT.length > 1 || this.selectedPicker > 0)) {
    //   this.isDoorOperableDisable = true;
    // } else
    // {
    //   if(this.selectedPicker !== -1 && (this.pickers[this.selectedPicker].operableType === 'tiltTurn-left' || this.pickers[this.selectedPicker].operableType === 'tiltTurn-right')) {
    //     this.isDoorOperableDisable = true;
    //   } else {
    //     this.isDoorOperableDisable = false;
    //   }
      
    // } 
  }

 /**
 * This function is to get the operable type 
 * @param {string} value  which is the text from the unified model
 * @returns the text which will display in the operable type applied list
 */
  private getOperableType(value: string): string {
    let opType = '';
    switch (value) {
      case 'Turn-Tilt-Right': opType = this.tiltOrTurnRightText; break;
      case 'Turn-Tilt-Left': opType = this.tiltOrTurnLeftText; break;
      case 'Side-Hung-Right': opType = this.sideHungRightText; break;
      case 'Side-Hung-Left': opType = this.sideHungLeftText; break;
      case 'Bottom-Hung': opType = this.bottomHungText; break;
      case 'Top-Hung': opType = this.topHungText; break;
      case 'Parallel-Opening': opType = this.parallelOpeningText; break;
      case 'Single-Door-Left': opType = this.singleDoorLeftText; break;
      case 'Single-Door-Right': opType = this.singleDoorRightText; break;
      case 'Double-Door-Active-Left': opType = this.doubleDoorLeftText; break;
      case 'Double-Door-Active-Right': opType = this.doubleDoorRightText; break;
      default: opType = ''; break;
    }
    return opType;
  }

 /**
 * This function is to update the already applied operable values with the latest selected ones.
 *
 *
 */
  //Rama - Need to modify this in next release
  updateSelected(event = null): void {
    if (!(this.selectedPicker === -1 || !this.pickers[this.selectedPicker].operableType || !this.pickers[this.selectedPicker].fixedOpening)) {
      if (this.glassAppliedArray[this.selectedPicker].length > 0) {
        this.selectedGlassIDs = [];
        this.glassAppliedArray[this.selectedPicker].forEach(glass => {
          this.selectedGlassIDs.push(glass.glassID);
        })
        this.selectedGlassIDs.forEach((id: number) => {
          if (id in this.glassIDsAlreadyApplied) {  // check if glassId is already applied
            this.glassAppliedArray[this.glassIDsAlreadyApplied[id]] = this.glassAppliedArray[this.glassIDsAlreadyApplied[id]].filter(glass => glass.glassID !== id);  // remove information
          }
          // apply new glass information
          this.glassIDsAlreadyApplied[id] = this.selectedPicker + 1;
          let opType = '';
          switch (this.operableType_index[this.pickers[this.selectedPicker].operableType]) {
            case 'Turn-Tilt-Right': opType = this.tiltOrTurnRightText; break
            case 'Turn-Tilt-Left': opType = this.tiltOrTurnLeftText; break
            case 'Side-Hung-Right': opType = this.sideHungRightText; break
            case 'Side-Hung-Left': opType = this.sideHungLeftText; break
            case 'Bottom-Hung': opType = this.bottomHungText; break
            case 'Top-Hung': opType = this.topHungText; break
            case 'Parallel-Opening': opType = this.parallelOpeningText; break
            case 'Single-Door-Left': opType = this.singleDoorLeftText; break
            case 'Single-Door-Right': opType = this.singleDoorRightText; break
            case 'Double-Door-Active-Left': opType = this.doubleDoorLeftText; break
            case 'Double-Door-Active-Right': opType = this.doubleDoorRightText; break
            default: opType = ''; break
          }

          let fixopenText = '';
          switch (this.fixedOpening_index[this.pickers[this.selectedPicker].fixedOpening]) {
            case 'Inward': fixopenText = this.inwardText; break
            case 'Outward': fixopenText = this.outwardText; break
            default: fixopenText = this.inwardText; break
          }

          if (this.isDoorOperableTypeSelected) {
            //this.glassAppliedArray.splice(this.selectedPicker, 1);
            if(this.glassAppliedArray[this.selectedPicker][0] && this.glassAppliedArray[this.selectedPicker][0].operableType !== opType && this.glassAppliedArray[this.selectedPicker][0].glassID === id) {
              this.glassAppliedArray[this.selectedPicker][0].operableType = opType;
            } else {
              this.glassAppliedArray[this.selectedPicker].push({ glassID: id, fixedOpening: fixopenText, operableType: opType });
            }
            
          } else {
            if(this.glassAppliedArray[this.selectedPicker][0] && this.glassAppliedArray[this.selectedPicker][0].operableType !== opType && this.glassAppliedArray[this.selectedPicker][0].glassID === id) {
              this.glassAppliedArray[this.selectedPicker][0].operableType = opType;
            } else {
              this.glassAppliedArray[this.selectedPicker].push({ glassID: id, fixedOpening: fixopenText, operableType: opType });
            }
            
          }

          let hasOperability = this.unified3DModel.ModelInput.Geometry.OperabilitySystems ? true : false;
          let operabilitysystem = new OperabilitySystem();
          let doorsystem = new DoorSystem();
          let hasdoorSystems = this.unified3DModel.ModelInput.Geometry.DoorSystems ? true : false;


          operabilitysystem.VentOpeningDirection = this.fixedOpening_index[this.pickers[this.selectedPicker].fixedOpening];
          operabilitysystem.VentOperableType = this.operableType_index[this.pickers[this.selectedPicker].operableType];

          var os = this.umService.obj_OperabilitySystem(this.selectedPicker);
          if (os) {
            operabilitysystem.VentArticleName = os.VentArticleName;
            operabilitysystem.VentInsideW = os.VentInsideW;
            operabilitysystem.VentOutsideW = os.VentOutsideW;
            operabilitysystem.VentDistBetweenIsoBars = os.VentDistBetweenIsoBars;
            operabilitysystem.InsertOuterFrameArticleName = os.InsertOuterFrameArticleName;
            operabilitysystem.InsertOuterFrameInsideW = os.InsertOuterFrameInsideW;
            operabilitysystem.InsertOuterFrameOutsideW = os.InsertOuterFrameOutsideW;
            operabilitysystem.InsertOuterFrameDistBetweenIsoBars = os.InsertOuterFrameDistBetweenIsoBars;
            operabilitysystem.InsideHandleArticleName = os.InsideHandleArticleName;
            operabilitysystem.InsideHandleColor = os.InsideHandleColor;
            operabilitysystem.InsideHandleArticleDescription = os.InsideHandleArticleDescription;
          }
          operabilitysystem.InsertInsulationType = this.insulatingSelection;
          operabilitysystem.InsertUvalueType = this.gasketSelection;
          operabilitysystem.InsertInsulationTypeName = this.insertInsulationTypeName;
          operabilitysystem.OperabilitySystemID = this.selectedPicker + 1;
          operabilitysystem.PickerIndex = this.selectedPicker;
          if (!this.isDoorOperableTypeSelected) {
            operabilitysystem.DoorSystemID = -1;
            if(!this.isTurnTiltDirectionChanged) {
              this.unified3DModel.ModelInput.Geometry.Infills[id - 1].HandlePosition = -1; // negative number sets the handle position in center of vent
            } else {
              this.isTurnTiltDirectionChanged = false;
            }
           // this.unified3DModel.ModelInput.Geometry.Infills[id - 1].HandlePosition = -1; // negative number sets the handle position in center of vent
          } else {
            this.unified3DModel.ModelInput.Geometry.Infills[id - 1].HandlePosition = 1050; //  sets the handle position to 1050 for the door system
            if (this.isDoorOperableTypeSelected) {
              operabilitysystem.VentArticleName = '-1';
              operabilitysystem.VentInsideW = null;
              operabilitysystem.VentOutsideW = null;
            }
            let ds = this.umService.obj_Door(1);
            if (ds) {
              doorsystem.DoorLeafArticleName = ds.DoorLeafArticleName;
              doorsystem.DoorLeafInsideW = ds.DoorLeafInsideW;
              doorsystem.DoorLeafOutsideW = ds.DoorLeafOutsideW;
              doorsystem.DoorPassiveJambArticleName = ds.DoorPassiveJambArticleName;
              doorsystem.DoorPassiveJambInsideW = ds.DoorPassiveJambInsideW;
              doorsystem.DoorPassiveJambOutsideW = ds.DoorPassiveJambOutsideW;
              doorsystem.DoorSillArticleName = ds.DoorSillArticleName;
              doorsystem.DoorSillInsideW = ds.DoorSillInsideW;
              doorsystem.DoorSillOutsideW = ds.DoorSillOutsideW;
              doorsystem.DoorSidelightSillArticleName = ds.DoorSidelightSillArticleName;
              doorsystem.HingeCondition = ds.HingeCondition;
              doorsystem.OutsideHandleArticleName = ds.OutsideHandleArticleName;
              doorsystem.OutsideHandleColor = ds.OutsideHandleColor;
              doorsystem.OutsideHandleArticleDescription = ds.OutsideHandleArticleDescription;
              doorsystem.InsideHandleArticleName = ds.InsideHandleArticleName;
              doorsystem.InsideHandleColor = ds.InsideHandleColor;
              doorsystem.InsideHandleArticleDescription = ds.InsideHandleArticleDescription;
              doorsystem.HingeArticleName = ds.HingeArticleName;
              doorsystem.HingeColor = ds.HingeColor;
              doorsystem.HingeArticleDescription = ds.HingeArticleDescription;
            }
            // doorsystem.DoorSystemType = opType.toLowerCase().includes('single') ? 'Single' : 'Double';
            // doorsystem.DoorSystemType = opType;
            switch (opType) {
              case "Double Door - Right Active": doorsystem.DoorSystemType = this.doubleDoorRightSystemTypeText; break;
              case "Double Door - Left Active": doorsystem.DoorSystemType = this.doubleDoorLeftSystemTypeText; break;
              case "Single Door - Left": doorsystem.DoorSystemType = this.singleDoorLeftSystemTypeText; break;
              case "Single Door - Right": doorsystem.DoorSystemType = this.singleDoorRightSystemTypeText; break;
              default: doorsystem.DoorSystemType = ''; break;
            }
            doorsystem.DoorSystemID = this.selectedPicker + 1;
            //  doorsystem.InsideHandleArticleName = "1";
            // doorsystem.OutsideHandleArticleName = "1";
            operabilitysystem.DoorSystemID = doorsystem.DoorSystemID;

            if (!hasdoorSystems) {
              this.unified3DModel.ModelInput.Geometry.DoorSystems = [];
              this.unified3DModel.ModelInput.Geometry.DoorSystems.push(doorsystem);
            }
          }
          let operableId = this.unified3DModel.ModelInput.Geometry.Infills.filter(glass => glass.InfillID == id)[0].OperabilitySystemID;
          let doorsystemId = operableId > 0 ? this.unified3DModel.ModelInput.Geometry.OperabilitySystems.filter(glass => glass.OperabilitySystemID === operableId)[0].DoorSystemID : -1;

          if (!hasOperability) {
            this.unified3DModel.ModelInput.Geometry.OperabilitySystems = [];
            this.unified3DModel.ModelInput.Geometry.OperabilitySystems.push(operabilitysystem);
          } else {
            if (operableId > 0) {
              let umOperabilitySystems = this.unified3DModel.ModelInput.Geometry.OperabilitySystems.filter(glass => glass.OperabilitySystemID == operableId)[0];
              umOperabilitySystems.VentOpeningDirection = this.fixedOpening_index[this.pickers[this.selectedPicker].fixedOpening];
              umOperabilitySystems.VentOperableType = this.operableType_index[this.pickers[this.selectedPicker].operableType];
              var os = this.umService.obj_OperabilitySystem(0);
              if (os) {
                umOperabilitySystems.VentArticleName = os.VentArticleName;
                umOperabilitySystems.VentInsideW = os.VentInsideW;
                umOperabilitySystems.VentOutsideW = os.VentOutsideW;
                umOperabilitySystems.VentDistBetweenIsoBars = os.VentDistBetweenIsoBars;
                umOperabilitySystems.InsertOuterFrameArticleName = os.InsertOuterFrameArticleName;
                umOperabilitySystems.InsertOuterFrameInsideW = os.InsertOuterFrameInsideW;
                umOperabilitySystems.InsertOuterFrameOutsideW = os.InsertOuterFrameOutsideW;
                umOperabilitySystems.InsertOuterFrameDistBetweenIsoBars = os.InsertOuterFrameDistBetweenIsoBars;
              }
              
              if (!this.isDoorOperableTypeSelected) {
                umOperabilitySystems.DoorSystemID = -1;
                doorsystemId = -1;
                this.unified3DModel.ModelInput.Geometry.DoorSystems = null;
                if(this.unified3DModel.ModelInput.Geometry.OperabilitySystems[0].VentArticleName === '-1')
                this.unified3DModel.ModelInput.Geometry.OperabilitySystems[0].VentArticleName = undefined;
              } else {
                umOperabilitySystems.DoorSystemID = 1;
                doorsystemId = 1;
              }
              this.unified3DModel.ModelInput.Geometry.OperabilitySystems.filter(glass => glass.OperabilitySystemID == operableId)[0].InsertInsulationType = this.insulatingSelection;
              this.unified3DModel.ModelInput.Geometry.OperabilitySystems.filter(glass => glass.OperabilitySystemID == operableId)[0].InsertUvalueType = this.gasketSelection;
              this.unified3DModel.ModelInput.Geometry.OperabilitySystems.filter(glass => glass.OperabilitySystemID == operableId)[0].InsertInsulationTypeName = this.insertInsulationTypeName;
              // this.unified3DModel.ModelInput.Geometry.OperabilitySystems.filter(glass => glass.OperabilitySystemID === operableId)[0].InsideHandleArticleName = this.InsideHandleFromChild === undefined ? null : this.InsideHandleFromChild.ArticleName;
              // this.unified3DModel.ModelInput.Geometry.OperabilitySystems.filter(glass => glass.OperabilitySystemID === operableId)[0].InsideHandleColor = this.InsideHandleFromChild === undefined ? null : this.InsideHandleFromChild.Color;
              let hasdoorSystems = this.unified3DModel.ModelInput.Geometry.DoorSystems ? true : false;
              if (hasdoorSystems && doorsystemId > 0) {
                let umDoorSystem = this.unified3DModel.ModelInput.Geometry.DoorSystems.filter(glass => glass.DoorSystemID === doorsystemId)[0];
                let ds = this.umService.obj_Door(1);
                if (ds) {
                  umDoorSystem.DoorLeafArticleName = ds.DoorLeafArticleName;
                  umDoorSystem.DoorLeafInsideW = ds.DoorLeafInsideW;
                  umDoorSystem.DoorLeafOutsideW = ds.DoorLeafOutsideW;
                  umDoorSystem.DoorPassiveJambArticleName = ds.DoorPassiveJambArticleName;
                  umDoorSystem.DoorPassiveJambInsideW = ds.DoorPassiveJambInsideW;
                  umDoorSystem.DoorPassiveJambOutsideW = ds.DoorPassiveJambOutsideW;
                  umDoorSystem.DoorSillArticleName = ds.DoorSillArticleName;
                  umDoorSystem.DoorSillInsideW = ds.DoorSillInsideW;
                  umDoorSystem.DoorSillOutsideW = ds.DoorSillOutsideW;
                  umDoorSystem.DoorSidelightSillArticleName = ds.DoorSidelightSillArticleName;
                  umDoorSystem.OutsideHandleArticleName = ds.OutsideHandleArticleName;
                  umDoorSystem.OutsideHandleColor = ds.OutsideHandleColor;
                  umDoorSystem.OutsideHandleArticleDescription = ds.OutsideHandleArticleDescription;
                  umDoorSystem.InsideHandleArticleName = ds.InsideHandleArticleName;
                  umDoorSystem.InsideHandleColor = ds.InsideHandleColor;
                  umDoorSystem.InsideHandleArticleDescription = ds.InsideHandleArticleDescription;
                  umDoorSystem.HingeArticleName = ds.HingeArticleName;
                  umDoorSystem.HingeColor = ds.HingeColor;
                  umDoorSystem.HingeArticleDescription = ds.HingeArticleDescription;
                }
                this.unified3DModel.ModelInput.Geometry.OperabilitySystems.filter(glass => glass.OperabilitySystemID === operableId)[0].VentArticleName = '-1';
                this.unified3DModel.ModelInput.Geometry.OperabilitySystems.filter(glass => glass.OperabilitySystemID === operableId)[0].VentInsideW = null;
                this.unified3DModel.ModelInput.Geometry.OperabilitySystems.filter(glass => glass.OperabilitySystemID === operableId)[0].VentOutsideW = null;
                // umDoorSystem.DoorSystemType = opType.toLowerCase().includes('single') ? 'Single' : 'Double';
                switch (opType) {
                  case "Double Door - Right Active": this.unified3DModel.ModelInput.Geometry.DoorSystems.filter(glass => glass.DoorSystemID === doorsystemId)[0].DoorSystemType = this.doubleDoorRightSystemTypeText; break;
                  case "Double Door - Left Active": this.unified3DModel.ModelInput.Geometry.DoorSystems.filter(glass => glass.DoorSystemID === doorsystemId)[0].DoorSystemType = this.doubleDoorLeftSystemTypeText; break;
                  case "Single Door - Left": this.unified3DModel.ModelInput.Geometry.DoorSystems.filter(glass => glass.DoorSystemID === doorsystemId)[0].DoorSystemType = this.singleDoorLeftSystemTypeText; break;
                  case "Single Door - Right": this.unified3DModel.ModelInput.Geometry.DoorSystems.filter(glass => glass.DoorSystemID === doorsystemId)[0].DoorSystemType = this.singleDoorRightSystemTypeText; break;
                  default: this.unified3DModel.ModelInput.Geometry.DoorSystems.filter(glass => glass.DoorSystemID === doorsystemId)[0].DoorSystemType = ''; break;
                }
              }
            } else {
              this.unified3DModel.ModelInput.Geometry.OperabilitySystems.push(operabilitysystem);
            }
          }

          this.unified3DModel.ModelInput.Geometry.Infills.filter(glass => glass.InfillID == id)[0].InsertWindowSystemType = this.pickers[this.selectedPicker].operationType; //​Window System
          //this.unified3DModel.ModelInput.Geometry.Infills.filter(glass => glass.InfillID == id)[0].InsertOuterFrameDepth = this.OuterFrameInputArticle === undefined ? null : this.OuterFrameInputArticle.Depth;
          this.unified3DModel.ModelInput.Geometry.Infills.filter(glass => glass.InfillID == id)[0].OperabilitySystemID = operabilitysystem.OperabilitySystemID;

          this.frameCombinationInputValue = undefined;
          if (event === "parallelOpening" || event === "topHung" || this.operableType_index[this.pickers[this.selectedPicker].operableType] === "Parallel-Opening" || this.operableType_index[this.pickers[this.selectedPicker].operableType] == "Top-Hung") this.frameCombinationInputValue = 'Combination 1';
          if (this.operableType_index[this.pickers[this.selectedPicker].operableType] === "Parallel-Opening" || this.operableType_index[this.pickers[this.selectedPicker].operableType] === "Top-Hung") {
            if (!hasOperability) {
              this.unified3DModel.ModelInput.Geometry.OperabilitySystems = [];
              operabilitysystem.InsertOuterFrameArticleName = '1';
              this.unified3DModel.ModelInput.Geometry.OperabilitySystems.push(operabilitysystem);
            } else {
              if (operableId > 0) {
                this.unified3DModel.ModelInput.Geometry.OperabilitySystems.filter(glass => glass.OperabilitySystemID == operableId)[0].InsertOuterFrameArticleName = '1';
              } else {
                operabilitysystem.InsertOuterFrameArticleName = '1';
                this.unified3DModel.ModelInput.Geometry.OperabilitySystems.push(operabilitysystem);
              }
            }
            if (this.unified3DModel.ProblemSetting.ProductType !== 'Window') {
              this.unified3DModel.ModelInput.Geometry.Infills.filter(glass => glass.InfillID == id)[0].InsertWindowSystem = this.pickers[this.selectedPicker].windowSystem === '' ? 'AWS 114' : this.pickers[this.selectedPicker].windowSystem; //​Window System
              if (!hasOperability) {
                this.unified3DModel.ModelInput.Geometry.OperabilitySystems = [];
                operabilitysystem.InsertedWindowType = this.pickers[this.selectedPicker].windowSystem === '' ? 'AWS 114' : this.pickers[this.selectedPicker].windowSystem;
                operabilitysystem.VentArticleName = 'AWS114VA';
                operabilitysystem.InsertOuterFrameArticleName = 'AWS114OF';
                this.unified3DModel.ModelInput.Geometry.OperabilitySystems.push(operabilitysystem);
              } else {
                if (operableId > 0) {
                  this.unified3DModel.ModelInput.Geometry.OperabilitySystems.filter(glass => glass.OperabilitySystemID == operableId)[0].InsertedWindowType = this.pickers[this.selectedPicker].windowSystem === '' ? 'AWS 114' : this.pickers[this.selectedPicker].windowSystem;
                  this.unified3DModel.ModelInput.Geometry.OperabilitySystems.filter(glass => glass.OperabilitySystemID == operableId)[0].VentArticleName = 'AWS114VA';
                  this.unified3DModel.ModelInput.Geometry.OperabilitySystems.filter(glass => glass.OperabilitySystemID == operableId)[0].InsertOuterFrameArticleName = 'AWS114OF';
                } else {
                  operabilitysystem.InsertedWindowType = this.pickers[this.selectedPicker].windowSystem === '' ? 'AWS 114' : this.pickers[this.selectedPicker].windowSystem;
                  operabilitysystem.VentArticleName = 'AWS114VA';
                  operabilitysystem.InsertOuterFrameArticleName = 'AWS114OF';
                  this.unified3DModel.ModelInput.Geometry.OperabilitySystems.push(operabilitysystem);
                }
              }
            }
          } else if (this.unified3DModel.ProblemSetting.ProductType !== 'Window') {
            this.unified3DModel.ModelInput.Geometry.Infills.filter(glass => glass.InfillID == id)[0].InsertWindowSystem = this.pickers[this.selectedPicker].windowSystem === '' ? 'aws__75_si_plus' : this.pickers[this.selectedPicker].windowSystem; //​Window System
            this.pickers[this.selectedPicker].windowSystem = this.pickers[this.selectedPicker].windowSystem === '' ? 'aws__75_si_plus' : this.pickers[this.selectedPicker].windowSystem;
            if (!hasOperability) {
              this.unified3DModel.ModelInput.Geometry.OperabilitySystems = [];
              operabilitysystem.InsertedWindowType = this.awsSystemDesc[this.awsSystemValue.indexOf(this.pickers[this.selectedPicker].windowSystem)];
              this.unified3DModel.ModelInput.Geometry.OperabilitySystems.push(operabilitysystem);
            } else {
              if (operableId > 0) {
                this.unified3DModel.ModelInput.Geometry.OperabilitySystems.filter(glass => glass.OperabilitySystemID == operableId)[0].InsertedWindowType = this.awsSystemDesc[this.awsSystemValue.indexOf(this.pickers[this.selectedPicker].windowSystem)];
              } else {
                operabilitysystem.InsertedWindowType = this.awsSystemDesc[this.awsSystemValue.indexOf(this.pickers[this.selectedPicker].windowSystem)];
                this.unified3DModel.ModelInput.Geometry.OperabilitySystems.push(operabilitysystem);
              }
            }
          }
        });

        //disableresult
        // this.configureService.computeClickedSubject.next(false);
        // this.unified3DModelFromOperabilityEvent.emit(this.unified3DModel);
        this.selectedGlassIDs = [];
        if (event) {
          if (event === 'parallelOpening' || event === 'topHung' || this.applicationType == "SRS")
            this.onSelectAWSWindowSystem(0);
          else
            this.onSelectFWSWindowSystem(0);
        }
        if (this.isDoorOperableTypeSelected) {
          let systemADSSelected = this.adsSystemValue.indexOf(this.pickers[this.selectedPicker].windowSystem);
          this.isAddBtnDisable = true;
          this.unified3DModel.ModelInput.FrameSystem.SystemType = this.cpService.SystemData("ADS")[systemADSSelected].Description;
          this.cpService.setSystem(this.cpService.SystemData("ADS")[systemADSSelected], "FRAMING");
        }
        else if (this.unified3DModel.ProblemSetting.ProductType === 'Window'){
          let systemFacadeSelected = this.awsSystemValue.indexOf(this.pickers[this.selectedPicker].windowSystem);
          this.isAddBtnDisable = false;
          this.unified3DModel.ModelInput.FrameSystem.SystemType = this.cpService.SystemData("AWS")[systemFacadeSelected].Description;
          this.cpService.setSystem(this.cpService.SystemData("AWS")[systemFacadeSelected], "FRAMING");
        }
        this.umService.setUnifiedModel(this.unified3DModel);
        setTimeout(() => {
          this.umService.get_InsideHandle();
        }, 1000);  
        setTimeout(() => {
          this.reloadInputValues();
          setTimeout(() => {
            this.iframeService.setShowLoader(true);
            if(this.isOpDirectionChangeForCameraReset){
              this.loadJSONService({ Unified3DModel: this.unified3DModel, canBeDrawn: false });
              this.isOpDirectionChangeForCameraReset = false;
            } else {
              this.loadJSONService({ Unified3DModel: this.unified3DModel, canBeDrawn: this.canBeDrawnBool });
            }           
            this.lc.loadDisplaySetting_ActivePanel();    
          }, 25);
        }, 10);

      }
    }
  }

 /**
 * This function is to set the door system Info 
 * @param {string} opType  which is the text from the unified model to set the door system Info
 * @param {number} doorsystemId  which is the door system Id from the unified model to set the door system Info
 * sets the door system type of Unified Model
 */
  private setDoorSystemInfo(opType: string, doorsystemId: number) {
    if (this.unified3DModel.ModelInput.Geometry.DoorSystems) {
      switch (opType) {
        case "Double Door - Right Active": this.unified3DModel.ModelInput.Geometry.DoorSystems.filter(glass => glass.DoorSystemID === doorsystemId)[0].DoorSystemType = this.doubleDoorRightSystemTypeText; break;
        case "Double Door - Left Active": this.unified3DModel.ModelInput.Geometry.DoorSystems.filter(glass => glass.DoorSystemID === doorsystemId)[0].DoorSystemType = this.doubleDoorLeftSystemTypeText; break;
        case "Single Door - Left": this.unified3DModel.ModelInput.Geometry.DoorSystems.filter(glass => glass.DoorSystemID === doorsystemId)[0].DoorSystemType = this.singleDoorLeftSystemTypeText; break;
        case "Single Door - Right": this.unified3DModel.ModelInput.Geometry.DoorSystems.filter(glass => glass.DoorSystemID === doorsystemId)[0].DoorSystemType = this.singleDoorRightSystemTypeText; break;
        default: this.unified3DModel.ModelInput.Geometry.DoorSystems.filter(glass => glass.DoorSystemID === doorsystemId)[0].DoorSystemType = ''; break;
      }
    }
  }

  //Rama - Need to modify this in next release
  // updateUnifiedModel() {
  //   if (!(this.selectedPicker === -1 || !this.pickers[this.selectedPicker].operableType || !this.pickers[this.selectedPicker].fixedOpening)) {
  //     this.glassAppliedArray[this.selectedPicker].forEach(glassObject => {
  //       let operableId = this.unified3DModel.ModelInput.Geometry.Infills.filter(glass => glass.InfillID == glassObject.glassID)[0] !== undefined ? this.unified3DModel.ModelInput.Geometry.Infills.filter(glass => glass.InfillID == glassObject.glassID)[0].OperabilitySystemID !== -1 ? this.unified3DModel.ModelInput.Geometry.Infills.filter(glass => glass.InfillID == glassObject.glassID)[0].OperabilitySystemID : 0 : 0;
  //       let doorSystemId = operableId !== undefined ? this.unified3DModel.ModelInput.Geometry.OperabilitySystems.filter(glass => glass.OperabilitySystemID == operableId)[0].DoorSystemID : 0;
  //       if (this.pickers[this.selectedPicker].operableType !== 'parallelOpening' || this.pickers[this.selectedPicker].operableType !== 'topHung') {
  //         //if(this.pickers[this.selectedPicker].operableType !== 'topHung') this.frameCombinationInputValue = 'Combination 1';
  //         if (operableId > 0 && this.unified3DModel.ModelInput.Geometry.OperabilitySystems) {
  //           this.unified3DModel.ModelInput.Geometry.OperabilitySystems.filter(glass => glass.OperabilitySystemID == operableId)[0].VentOpeningDirection = this.fixedOpening_index[this.pickers[this.selectedPicker].fixedOpening];
  //           this.unified3DModel.ModelInput.Geometry.OperabilitySystems.filter(glass => glass.OperabilitySystemID == operableId)[0].VentOperableType = this.operableType_index[this.pickers[this.selectedPicker].operableType];
  //           this.unified3DModel.ModelInput.Geometry.OperabilitySystems.filter(glass => glass.OperabilitySystemID == operableId)[0].InsertInsulationType = this.insulatingSelection;
  //           this.unified3DModel.ModelInput.Geometry.OperabilitySystems.filter(glass => glass.OperabilitySystemID == operableId)[0].InsertInsulationTypeName = this.insertInsulationTypeName;
  //           this.unified3DModel.ModelInput.Geometry.OperabilitySystems.filter(glass => glass.OperabilitySystemID == operableId)[0].InsertUvalueType = this.gasketSelection;
  //         }
  //         if (this.VentFrameInputArticle) {
  //           if (operableId > 0 && this.unified3DModel.ModelInput.Geometry.OperabilitySystems) {
  //             if (this.unified3DModel.ModelInput.Geometry.DoorSystems && this.unified3DModel.ModelInput.Geometry.DoorSystems.length > 0) {
  //               this.unified3DModel.ModelInput.Geometry.OperabilitySystems.filter(glass => glass.OperabilitySystemID == operableId)[0].VentArticleName = this.VentFrameInputArticle.ArticleName;
  //               this.unified3DModel.ModelInput.Geometry.OperabilitySystems.filter(glass => glass.OperabilitySystemID == operableId)[0].VentInsideW = this.VentFrameInputArticle.InsideW;
  //               this.unified3DModel.ModelInput.Geometry.OperabilitySystems.filter(glass => glass.OperabilitySystemID == operableId)[0].VentOutsideW = this.VentFrameInputArticle.OutsideW;
  //               // this.unified3DModel.ModelInput.Geometry.OperabilitySystems.filter(glass => glass.OperabilitySystemID == operableId)[0].VentDistBetweenIsoBars = this.VentFrameInputArticle.DistBetweenIsoBars;
  //             } else {
  //               this.unified3DModel.ModelInput.Geometry.OperabilitySystems.filter(glass => glass.OperabilitySystemID == operableId)[0].VentArticleName = this.VentFrameInputArticle.Name.substr(9);
  //               this.unified3DModel.ModelInput.Geometry.OperabilitySystems.filter(glass => glass.OperabilitySystemID == operableId)[0].VentInsideW = this.VentFrameInputArticle.InsideDimension;
  //               this.unified3DModel.ModelInput.Geometry.OperabilitySystems.filter(glass => glass.OperabilitySystemID == operableId)[0].VentOutsideW = this.VentFrameInputArticle.OutsideDimension;
  //               this.unified3DModel.ModelInput.Geometry.OperabilitySystems.filter(glass => glass.OperabilitySystemID == operableId)[0].VentDistBetweenIsoBars = this.VentFrameInputArticle.DistBetweenIsoBars;
  //             }

  //           }
  //         }
  //         if (this.DoorLeafActiveInputArticle) {
  //           if (doorSystemId > 0 && this.unified3DModel.ModelInput.Geometry.DoorSystems) {
  //             this.unified3DModel.ModelInput.Geometry.DoorSystems.filter(glass => glass.DoorSystemID == doorSystemId)[0].DoorLeafArticleName = this.DoorLeafActiveInputArticle.ArticleName;
  //             this.unified3DModel.ModelInput.Geometry.DoorSystems.filter(glass => glass.DoorSystemID == doorSystemId)[0].DoorLeafInsideW = this.DoorLeafActiveInputArticle.InsideW;
  //             this.unified3DModel.ModelInput.Geometry.DoorSystems.filter(glass => glass.DoorSystemID == doorSystemId)[0].DoorLeafOutsideW = this.DoorLeafActiveInputArticle.OutsideW;
  //           }
  //         }
  //         if (this.DoorLeafPassiveInputArticle) {
  //           if (doorSystemId > 0 && this.unified3DModel.ModelInput.Geometry.DoorSystems) {
  //             this.unified3DModel.ModelInput.Geometry.DoorSystems.filter(glass => glass.DoorSystemID == doorSystemId)[0].DoorPassiveJambArticleName = this.DoorLeafPassiveInputArticle.ArticleName;
  //             this.unified3DModel.ModelInput.Geometry.DoorSystems.filter(glass => glass.DoorSystemID == doorSystemId)[0].DoorPassiveJambInsideW = this.DoorLeafPassiveInputArticle.InsideW;
  //             this.unified3DModel.ModelInput.Geometry.DoorSystems.filter(glass => glass.DoorSystemID == doorSystemId)[0].DoorPassiveJambOutsideW = this.DoorLeafPassiveInputArticle.OutsideW;
  //           }
  //         }
  //         if (this.SillProfileBottomInputArticle) {
  //           if (doorSystemId > 0 && this.unified3DModel.ModelInput.Geometry.DoorSystems) {
  //             this.unified3DModel.ModelInput.Geometry.DoorSystems.filter(glass => glass.DoorSystemID == doorSystemId)[0].DoorSillArticleName = this.SillProfileBottomInputArticle.ArticleName;
  //             this.unified3DModel.ModelInput.Geometry.DoorSystems.filter(glass => glass.DoorSystemID == doorSystemId)[0].DoorSillInsideW = this.SillProfileBottomInputArticle.InsideW;
  //             this.unified3DModel.ModelInput.Geometry.DoorSystems.filter(glass => glass.DoorSystemID == doorSystemId)[0].DoorSillOutsideW = this.SillProfileBottomInputArticle.OutsideW;
  //           }
  //         }
  //         if (this.SillProfileFixedInputArticle) {
  //           if (doorSystemId > 0 && this.unified3DModel.ModelInput.Geometry.DoorSystems) {
  //             this.unified3DModel.ModelInput.Geometry.DoorSystems.filter(glass => glass.DoorSystemID == doorSystemId)[0].DoorSidelightSillArticleName = this.SillProfileFixedInputArticle.ArticleName;
  //           }
  //         }
  //         if (this.unified3DModel.ProblemSetting.ProductType !== 'Window') {
  //           this.unified3DModel.ModelInput.Geometry.Infills.filter(glass => glass.InfillID == glassObject.glassID)[0].InsertWindowSystem = this.pickers[this.selectedPicker].windowSystem; //​Window System
  //           if (operableId > 0 && this.unified3DModel.ModelInput.Geometry.OperabilitySystems) {
  //             this.unified3DModel.ModelInput.Geometry.OperabilitySystems.filter(glass => glass.OperabilitySystemID == operableId)[0].InsertedWindowType = this.awsSystemDesc[this.awsSystemValue.indexOf(this.pickers[this.selectedPicker].windowSystem)];
  //           }
  //         }
  //         //this.unified3DModel.ModelInput.Geometry.Infills.filter(glass => glass.InfillID == glassObject.glassID)[0].PanelSystemID =  -1; 
  //         //this.unified3DModel.ModelInput.Geometry.Infills.filter(glass => glass.InfillID == glassObject.glassID)[0].GlazingSystemID = -1; 
  //         this.unified3DModel.ModelInput.Geometry.Infills.filter(glass => glass.InfillID == glassObject.glassID)[0].InsertWindowSystemType = null; //​Window System
  //         if (this.OuterFrameInputArticle) {
  //           if (operableId > 0 && this.unified3DModel.ModelInput.Geometry.OperabilitySystems) {
  //             if (this.unified3DModel.ModelInput.Geometry.DoorSystems && this.unified3DModel.ModelInput.Geometry.DoorSystems.length > 0) {
  //               this.unified3DModel.ModelInput.Geometry.OperabilitySystems.filter(glass => glass.OperabilitySystemID == operableId)[0].InsertOuterFrameArticleName = this.OuterFrameInputArticle.ArticleName;//Outer Frame​
  //               this.unified3DModel.ModelInput.Geometry.OperabilitySystems.filter(glass => glass.OperabilitySystemID == operableId)[0].InsertOuterFrameInsideW = parseInt(this.OuterFrameInputArticle.InsideW);
  //               this.unified3DModel.ModelInput.Geometry.OperabilitySystems.filter(glass => glass.OperabilitySystemID == operableId)[0].InsertOuterFrameOutsideW = parseInt(this.OuterFrameInputArticle.OutsideW);
  //               // this.unified3DModel.ModelInput.Geometry.OperabilitySystems.filter(glass => glass.OperabilitySystemID == operableId)[0].InsertOuterFrameDistBetweenIsoBars = this.OuterFrameInputArticle.DistBetweenIsoBars;
  //             } else {
  //               this.unified3DModel.ModelInput.Geometry.OperabilitySystems.filter(glass => glass.OperabilitySystemID == operableId)[0].InsertOuterFrameArticleName = this.OuterFrameInputArticle.Name.substr(9);//Outer Frame​
  //               this.unified3DModel.ModelInput.Geometry.OperabilitySystems.filter(glass => glass.OperabilitySystemID == operableId)[0].InsertOuterFrameInsideW = parseInt(this.OuterFrameInputArticle.InsideDimension);
  //               this.unified3DModel.ModelInput.Geometry.OperabilitySystems.filter(glass => glass.OperabilitySystemID == operableId)[0].InsertOuterFrameOutsideW = parseInt(this.OuterFrameInputArticle.OutsideDimension);
  //               this.unified3DModel.ModelInput.Geometry.OperabilitySystems.filter(glass => glass.OperabilitySystemID == operableId)[0].InsertOuterFrameDistBetweenIsoBars = this.OuterFrameInputArticle.DistBetweenIsoBars;
  //             }

  //           }
  //           this.unified3DModel.ModelInput.Geometry.Infills.filter(glass => glass.InfillID == glassObject.glassID)[0].InsertOuterFrameDepth = this.OuterFrameInputArticle.Depth;
  //         }

  //       } else if (this.pickers[this.selectedPicker].operableType === 'parallelOpening' || this.pickers[this.selectedPicker].operableType === 'topHung') {
  //         // let operableId = this.unified3DModel.ModelInput.Geometry.Infills.filter(glass => glass.InfillID == glassObject.glassID)[0].OperabilitySystemID;
  //         if (operableId > 0 && this.unified3DModel.ModelInput.Geometry.OperabilitySystems) {
  //           this.unified3DModel.ModelInput.Geometry.OperabilitySystems.filter(glass => glass.OperabilitySystemID == operableId)[0].VentArticleName = 'AWS114VA';
  //           this.unified3DModel.ModelInput.Geometry.OperabilitySystems.filter(glass => glass.OperabilitySystemID == operableId)[0].VentInsideW = -1;
  //           this.unified3DModel.ModelInput.Geometry.OperabilitySystems.filter(glass => glass.OperabilitySystemID == operableId)[0].VentOutsideW = -1;
  //           this.unified3DModel.ModelInput.Geometry.OperabilitySystems.filter(glass => glass.OperabilitySystemID == operableId)[0].VentDistBetweenIsoBars = -1;
  //           this.unified3DModel.ModelInput.Geometry.OperabilitySystems.filter(glass => glass.OperabilitySystemID == operableId)[0].VentOpeningDirection = this.fixedOpening_index[this.pickers[this.selectedPicker].fixedOpening];
  //           this.unified3DModel.ModelInput.Geometry.OperabilitySystems.filter(glass => glass.OperabilitySystemID == operableId)[0].VentOperableType = this.operableType_index[this.pickers[this.selectedPicker].operableType];
  //           this.unified3DModel.ModelInput.Geometry.OperabilitySystems.filter(glass => glass.OperabilitySystemID == operableId)[0].InsertOuterFrameArticleName = 'AWS114OF';//Outer Frame​
  //           this.unified3DModel.ModelInput.Geometry.OperabilitySystems.filter(glass => glass.OperabilitySystemID == operableId)[0].InsertOuterFrameInsideW = -1;
  //           this.unified3DModel.ModelInput.Geometry.OperabilitySystems.filter(glass => glass.OperabilitySystemID == operableId)[0].InsertOuterFrameOutsideW = -1;
  //           this.unified3DModel.ModelInput.Geometry.OperabilitySystems.filter(glass => glass.OperabilitySystemID == operableId)[0].InsertOuterFrameDistBetweenIsoBars = -1;
  //           this.unified3DModel.ModelInput.Geometry.OperabilitySystems.filter(glass => glass.OperabilitySystemID == operableId)[0].InsertInsulationType = this.insulatingSelection;
  //           this.unified3DModel.ModelInput.Geometry.OperabilitySystems.filter(glass => glass.OperabilitySystemID == operableId)[0].InsertInsulationTypeName = this.insertInsulationTypeName;
  //           this.unified3DModel.ModelInput.Geometry.OperabilitySystems.filter(glass => glass.OperabilitySystemID == operableId)[0].InsertUvalueType = this.gasketSelection;
  //         }
  //         this.frameCombinationInputValue = 'Combination 1';
  //         if (this.unified3DModel.ProblemSetting.ProductType !== 'Window') {
  //           this.unified3DModel.ModelInput.Geometry.Infills.filter(glass => glass.InfillID == glassObject.glassID)[0].InsertWindowSystem = this.pickers[this.selectedPicker].windowSystem; //​Window System
  //           if (this.unified3DModel.ModelInput.Geometry.OperabilitySystems) this.unified3DModel.ModelInput.Geometry.OperabilitySystems.filter(glass => glass.OperabilitySystemID == operableId)[0].InsertedWindowType = this.pickers[this.selectedPicker].windowSystem;
  //         }
  //         //this.unified3DModel.ModelInput.Geometry.Infills.filter(glass => glass.InfillID == glassObject.glassID)[0].PanelSystemID =  -1; 
  //         //this.unified3DModel.ModelInput.Geometry.Infills.filter(glass => glass.InfillID == glassObject.glassID)[0].GlazingSystemID = -1; 
  //         this.unified3DModel.ModelInput.Geometry.Infills.filter(glass => glass.InfillID == glassObject.glassID)[0].InsertWindowSystemType = this.pickers[this.selectedPicker].operationType;
  //         this.unified3DModel.ModelInput.Geometry.Infills.filter(glass => glass.InfillID == glassObject.glassID)[0].InsertOuterFrameDepth = 0;
  //       }
  //     });
  //     this.loadJSONService({ resetCamera: false, Unified3DModel: this.unified3DModel, canBeDrawn: this.canBeDrawnBool });
  //     this.lc.loadDisplaySetting_ActivePanel();
  //     //disableresult
  //     //this.configureService.computeClickedSubject.next(false);
  //     this.unified3DModelFromOperabilityEvent.emit(this.unified3DModel);
  //     this.selectedGlassIDs = [];
  //   }
  // }

 /**
 * This function is to remove the applied operable type 
 * @param {number} id  which is the glass Id to get the information and remove the applied the operable type
 * sets the unified model and will drawn in the 3D Viewer with the updated operable types.
 */
  onRemoveItem(id: number): void {
    this.glassAppliedArray[this.selectedPicker] = this.glassAppliedArray[this.selectedPicker].filter(glass => glass.glassID !== id);
    if (this.unified3DModel.ModelInput.Geometry.Infills.filter(glass => glass.InfillID == id)[0] &&
      this.unified3DModel.ModelInput.Geometry.OperabilitySystems) {
      let OperableId = this.unified3DModel.ModelInput.Geometry.Infills.filter(glass => glass.InfillID == id)[0].OperabilitySystemID;
      let infills = this.unified3DModel.ModelInput.Geometry.Infills.filter(glass => glass.OperabilitySystemID == OperableId);
      if (infills.length > 0 && infills.length == 1) {
        this.unified3DModel.ModelInput.Geometry.Infills.filter(glass => glass.InfillID == id)[0].GlazingSystemID = 1;
        this.unified3DModel.ModelInput.Geometry.Infills.filter(glass => glass.InfillID == id)[0].OperabilitySystemID = -1
        if (this.unified3DModel.ModelInput.Geometry.OperabilitySystems.length > 0 && this.unified3DModel.ModelInput.Geometry.OperabilitySystems.length == 1 && infills.length === 1) {
          this.unified3DModel.ModelInput.Geometry.OperabilitySystems = null;
          if (this.isDoorArticlesDisplay) {
            this.isDoorArticlesDisplay = false;
          }
          if (this.isWindowArticlesDisplay) {
            this.isWindowArticlesDisplay = false;
          }
          if (this.isWindowOperableTypeSelected) {
            this.isWindowOperableTypeSelected = false;
            this.pickers[this.selectedPicker].operableType = '';
          }
          if (this.isDoorOperableTypeSelected) {
            this.unified3DModel.ModelInput.Geometry.DoorSystems = null;
            this.isDoorOperableTypeSelected = false;

            // this.pickers[this.selectedPicker].status = 'unpopulated';
            // this.pickers[this.selectedPicker].fixedOpening = '';
            this.pickers[this.selectedPicker].operableType = '';
            // this.pickers[this.selectedPicker].operationType = '';
            // this.pickers[this.selectedPicker].insideHandle = 'Window Handle';
            // this.pickers[this.selectedPicker].windowSystem = '';
            this.cpService.setPopout(this.isDoorOperableTypeSelected, PanelsModule.DoorOperableType)
            // if(this.pickers[this.selectedPicker].operableType.includes('Door')) {
            //   this.cpService.setPopout(true, PanelsModule.DoorOperableType);
            // } else {

            //   this.cpService.setPopout(false, PanelsModule.DoorOperableType);
            // }

            if (this.unified3DModel.ModelInput.Geometry && this.unified3DModel.ModelInput.Geometry.Sections) {
              if (this.unified3DModel.ProblemSetting.ProductType === "Window") {

                //this.sectionClassArray.splice(3,2)
                let index = this.unified3DModel.ModelInput.Geometry.Sections.findIndex(x => x.SectionType === 33)
                if (index !== -1) {
                  this.unified3DModel.ModelInput.Geometry.Sections.splice(index, 1)
                }
                let index1 = this.unified3DModel.ModelInput.Geometry.Sections.findIndex(x => x.SectionType === 31)
                if (index !== -1) {
                  this.unified3DModel.ModelInput.Geometry.Sections.splice(index, 1)
                }
              }
            }

          }
        } else {
          if (this.unified3DModel.ModelInput.Geometry.OperabilitySystems.length > 1 && infills.length === 1) {
            let index = this.unified3DModel.ModelInput.Geometry.OperabilitySystems.findIndex(x => x.OperabilitySystemID === OperableId);
            if(this.unified3DModel.ModelInput.Geometry.OperabilitySystems[index].DoorSystemID === 1)
            this.unified3DModel.ModelInput.Geometry.DoorSystems = null
          }
        }
      } else {
        this.unified3DModel.ModelInput.Geometry.Infills.filter(glass => glass.InfillID == id)[0].OperabilitySystemID = -1;
        if (this.unified3DModel.ModelInput.Geometry.OperabilitySystems.length > 0 && this.unified3DModel.ModelInput.Geometry.OperabilitySystems.length == 1 && infills.length === 1) {
          this.unified3DModel.ModelInput.Geometry.OperabilitySystems = null;
          if (this.isWindowOperableTypeSelected) {
            this.isWindowOperableTypeSelected = false;
            this.pickers[this.selectedPicker].operableType = '';
          }
          if (this.isDoorArticlesDisplay) {
            this.isDoorArticlesDisplay = false;
          }
          if (this.isWindowArticlesDisplay) {
            this.isWindowArticlesDisplay = false;
          }
          if (this.isDoorOperableTypeSelected) {
            this.unified3DModel.ModelInput.Geometry.DoorSystems = null;
            this.isDoorOperableTypeSelected = false;
            // this.pickers[this.selectedPicker].status = 'unpopulated';
            // this.pickers[this.selectedPicker].fixedOpening = '';
            this.pickers[this.selectedPicker].operableType = '';
            // this.pickers[this.selectedPicker].operationType = '';
            // this.pickers[this.selectedPicker].insideHandle = 'Window Handle';
            // this.pickers[this.selectedPicker].windowSystem = '';
            this.cpService.setPopout(this.isDoorOperableTypeSelected, PanelsModule.DoorOperableType)
            // if(this.pickers[this.selectedPicker].operableType.includes('Door')) {
            //   this.cpService.setPopout(true, PanelsModule.DoorOperableType);
            // } else {
            //   this.cpService.setPopout(false, PanelsModule.DoorOperableType);
            // }
            if (this.unified3DModel.ModelInput.Geometry && this.unified3DModel.ModelInput.Geometry.Sections) {
              if (this.unified3DModel.ProblemSetting.ProductType === "Window") {
                //this.sectionClassArray.splice(3,2)
                let index = this.unified3DModel.ModelInput.Geometry.Sections.findIndex(x => x.SectionType === 33)
                if (index !== -1) {
                  this.unified3DModel.ModelInput.Geometry.Sections.splice(index, 1)
                }
                let index1 = this.unified3DModel.ModelInput.Geometry.Sections.findIndex(x => x.SectionType === 31)
                if (index !== -1) {
                  this.unified3DModel.ModelInput.Geometry.Sections.splice(index, 1)
                }
              }
            }
          }
        }
      }

    }
    delete this.glassIDsAlreadyApplied[id];
    if(this.isDoorOperableTypeSelected)
    this.isAddBtnDisable = true;
    else
    this.isAddBtnDisable = false;
    this.loadJSONService({ Unified3DModel: this.unified3DModel, canBeDrawn: this.canBeDrawnBool });
    this.lc.loadDisplaySetting_ActivePanel();
    //disableresult
    this.configureService.computeClickedSubject.next(false);
    this.umService.setUnifiedModel(this.unified3DModel);
    this.selectedGlassIDs = [];
    setTimeout(() => {
      this.setDoorOperableTypeDisabled();
    }, 100);
  }

  isOneGlassApplied(): boolean {
    return Object.keys(this.glassIDsAlreadyApplied).length > 0;
  }

  max(a, b) {
    return Math.max(a, b);
  }

  onFocusGreen(glassId) {
    this.iframeEvent.next(new IFrameEvent('highlightGlassById', { id: glassId }));
  }

  onFocusOutItem() {
    this.iframeEvent.next(new IFrameEvent('clearHighlightedMeshes'));
  }

  onFocusRed(glassId, event) {  // event = true if mouse In, event = false if mouse out
    if (event) {
      let obj = { id: glassId, colorCode: "0xbc0000" };
      this.iframeEvent.next(new IFrameEvent('highlightGlassById', obj));
    }
    else {
      this.onFocusGreen(glassId);
    }
  }
 
 /**
 * This function is to select the System type for product type Windows/Door such as AWS ADS ASE 
 * @param {number} index  based up on this index will fetch system type information
 * 
 */  
  systemType: string = "";
  onSelectAWSWindowSystem(index: number): void {
    this.systemType = "114";
    if (!this.insertInsulationTypeName || (this.insertInsulationTypeName && this.insertInsulationTypeName != 'PA' && this.insertInsulationTypeName != 'PT')) {
      this.insertInsulationTypeName = 'PA';
    }
    let isValueChanged = false;
    if (this.systemAWS114FacadeSelected && this.systemAWS114FacadeSelected != index) {
      isValueChanged = true;
      this.isSystemSelectionChanged = true;

      if (this.isDoorOperableTypeSelected) {
        this.pickers[this.selectedPicker].windowSystem = this.adsSystemValue[index];
      } else {
        this.pickers[this.selectedPicker].windowSystem = this.aws114SystemDesc[index];
      }

      this.configureService.computeClickedSubject.next(false);
      this.glassAppliedArray[this.selectedPicker].forEach(glassObject => {
        let operableId = this.unified3DModel.ModelInput.Geometry.Infills.filter(glass => glass.InfillID == glassObject.glassID)[0].OperabilitySystemID;
        if ((this.pickers[this.selectedPicker].operableType === 'parallelOpening' || this.pickers[this.selectedPicker].operableType === 'topHung') && this.unified3DModel.ModelInput.Geometry.OperabilitySystems) {

          this.unified3DModel.ModelInput.Geometry.OperabilitySystems.filter(glass => glass.OperabilitySystemID == operableId)[0].VentArticleName = 'AWS114VA';
          this.unified3DModel.ModelInput.Geometry.OperabilitySystems.filter(glass => glass.OperabilitySystemID == operableId)[0].InsertOuterFrameArticleName = 'AWS114OF';
          this.unified3DModel.ModelInput.Geometry.Infills.filter(glass => glass.InfillID == glassObject.glassID)[0].InsertWindowSystemType = this.pickers[this.selectedPicker].operationType;
          //this.unified3DModel.ModelInput.Geometry.Infills.filter(glass => glass.InfillID == glassObject.glassID)[0].VentArticleName = '-1';
          this.unified3DModel.ModelInput.Geometry.OperabilitySystems.filter(glass => glass.OperabilitySystemID == operableId)[0].VentInsideW = -1;
          this.unified3DModel.ModelInput.Geometry.OperabilitySystems.filter(glass => glass.OperabilitySystemID == operableId)[0].VentOutsideW = -1;
          this.unified3DModel.ModelInput.Geometry.OperabilitySystems.filter(glass => glass.OperabilitySystemID == operableId)[0].VentDistBetweenIsoBars = -1;
        }
        this.unified3DModel.ModelInput.Geometry.Infills.filter(glass => glass.InfillID == glassObject.glassID)[0].InsertWindowSystem = this.pickers[this.selectedPicker].windowSystem; //​Window System
        if (this.unified3DModel.ModelInput.Geometry.OperabilitySystems) this.unified3DModel.ModelInput.Geometry.OperabilitySystems.filter(glass => glass.OperabilitySystemID == operableId)[0].InsertedWindowType = this.pickers[this.selectedPicker].windowSystem;
        //this.unified3DModel.ModelInput.Geometry.Infills.filter(glass => glass.InfillID == glassObject.glassID)[0].PanelSystemID =  -1; 
        //this.unified3DModel.ModelInput.Geometry.Infills.filter(glass => glass.InfillID == glassObject.glassID)[0].GlazingSystemID = -1; 
      });

      // if (this.unified3DModel.ModelInput.Geometry.Infills.filter(section => section.OperabilitySystemID == (this.selectedPicker + 1))[0] && this.unified3DModel.ModelInput.Geometry.OperabilitySystems) {
      //   this.sendCurrentArticleToFrameCombinationTable.emit({ ArticleID: this.unified3DModel.ModelInput.Geometry.OperabilitySystems.filter(section => section.OperabilitySystemID == (this.selectedPicker + 1))[0].VentArticleName, SystemID: this.aws114SystemValue[this.aws114SystemDesc2.indexOf(this.pickers[this.selectedPicker].windowSystem)], OperationType: this.pickers[this.selectedPicker].operationType });
      // }
      this.unified3DModelFromOperabilityEvent.emit(this.unified3DModel);
      this.umService.setUnifiedModel(this.unified3DModel);
      this.onCloseFramingPopoutsEvent.emit();   // send event framing > left-configure > configure >  iFrame > tables. It closes all framing tables
    }
    this.systemAWS114FacadeSelected = index;
  }

 /**
 * This function is to select the System type for Product type Facade such as AWS ADS ASE 
 * @param {number} index  based up on this index will fetch system type information
 * 
 */
  onSelectFWSWindowSystem(index: number): void {
    //this.isSystemFacadeChanged = 2;
    if (this.systemFacadeSelected !== undefined) {
      this.pickers[this.selectedPicker].windowSystem = this.awsSystemValue[index];
      this.systemType = this.awsSystemValue[index].includes('90') ? '90' : '75';
      if (!this.insertInsulationTypeName)
        this.insertInsulationTypeName = 'Polyamide Anodized After';
      else if ((this.systemType == '90' && (this.insertInsulationTypeName != 'Polyamide Coated After' && this.insertInsulationTypeName != 'Polyamide Anodized After'))
        || (this.systemType == '75' && (this.insertInsulationTypeName == 'PA' || this.insertInsulationTypeName == 'PT')))
        this.insertInsulationTypeName = 'Polyamide Anodized After';
      this.glassAppliedArray[this.selectedPicker].forEach(glassObject => {
        let operableId = this.unified3DModel.ModelInput.Geometry.Infills.filter(glass => glass.InfillID == glassObject.glassID)[0].OperabilitySystemID;
        this.unified3DModel.ModelInput.Geometry.Infills.filter(glass => glass.InfillID == glassObject.glassID)[0].InsertWindowSystem = this.awsSystemValue[index]; //​Window System
        if (operableId > 0 && this.unified3DModel.ModelInput.Geometry.OperabilitySystems) {
          this.unified3DModel.ModelInput.Geometry.OperabilitySystems.filter(glass => glass.OperabilitySystemID == operableId)[0].InsertedWindowType = this.awsSystemDesc[this.awsSystemValue.indexOf(this.awsSystemValue[index])];
        }

        //this.unified3DModel.ModelInput.Geometry.Infills.filter(glass => glass.InfillID == glassObject.glassID)[0].PanelSystemID =  -1; 
        //this.unified3DModel.ModelInput.Geometry.Infills.filter(glass => glass.InfillID == glassObject.glassID)[0].GlazingSystemID = -1; 
      });
      this.configureService.computeClickedSubject.next(false);
      this.onCloseFramingPopoutsEvent.emit();
      this.unified3DModelFromOperabilityEvent.emit(this.unified3DModel);
      this.umService.setUnifiedModel(this.unified3DModel);
      // if (this.unified3DModel.ModelInput.Geometry.Infills.filter(section => section.OperabilitySystemID == (this.selectedPicker + 1))[0] && this.unified3DModel.ModelInput.Geometry.OperabilitySystems) {
      //   this.sendCurrentArticleToOuterTable.emit({ ArticleID: this.unified3DModel.ModelInput.Geometry.OperabilitySystems.filter(section => section.OperabilitySystemID == (this.selectedPicker + 1))[0] !== undefined ? this.unified3DModel.ModelInput.Geometry.OperabilitySystems.filter(section => section.OperabilitySystemID == (this.selectedPicker + 1))[0].InsertOuterFrameArticleName : null });
      //   this.cpService.setCurrent({ VentArticleID: parseInt(this.unified3DModel.ModelInput.Geometry.OperabilitySystems.filter(section => section.OperabilitySystemID == (this.selectedPicker + 1))[0] !== undefined ? this.unified3DModel.ModelInput.Geometry.OperabilitySystems.filter(section => section.OperabilitySystemID == (this.selectedPicker + 1))[0].VentArticleName : null) }, PanelsModule.VentFrame);
      // }

      this.systemFacadeSelectedEvent.emit(this.awsSystemValue[index]);
      this.cpService.setSystem(this.cpService.SystemData("AWS")[index], "OPERABILITY");
    }
    this.systemFacadeSelected = index;
  }

 /**
 * This function is to select the System type for Product type Facade such as AWS ADS ASE 
 * @param {string} popup  based up on this popup value the respective side panels will open 
 * 
 */
  onOpenIFramePopout(popup: string): void {
    if (popup === 'FrameCombination') this.cpService.setPopout(true, PanelsModule.FrameCombination);
    else if (popup === 'OuterFrame') this.cpService.setPopout(true, PanelsModule.OuterFrame);
    else if (popup === 'VentFrame') this.cpService.setPopout(true, PanelsModule.VentFrame);
    else if (popup === 'DoorLeafActive') this.cpService.setPopout(true, PanelsModule.DoorLeafActive);
    else if (popup === 'HandleColor') this.cpService.setPopout(true, PanelsModule.HandleColor);
    else if (popup === 'HingeType') this.cpService.setPopout(true, PanelsModule.HingeType);
    else if (popup === 'InsideHandle') this.cpService.setPopout(true, PanelsModule.InsideHandle);
    else if (popup === 'OutsideHandle') this.cpService.setPopout(true, PanelsModule.OutsideHandle);
  }

 /**
 * This function is called when user change the operable type 
 * @param {string} event  this will have the operable type value and will set to the Unified Model and will load accordingly 
 * in the 3D Viewer
 */
  onOperableTypeChange(event: any) {
    if (event.includes('Door')) {
      //this.cpService.setPopout(true, PanelsModule.DoorOperableType);
      this.isDoorOperableTypeSelected = true;
      this.isDoorArticlesDisplay = true;
      this.isWindowArticlesDisplay = false;
      this.isWindowOperableTypeSelected = false;
      if(this.selectedGlassIDs.length>1) {
        this.isApplyBtnDisable = true;
      } else {
        this.isApplyBtnDisable = false;
        if (this.pickers.filter((picker,index) => (picker.operableType == 'tiltTurn-left' || picker.operableType == 'tiltTurn-right') && this.glassAppliedArray[index].length > 0).length > 0) {
          this.isApplyBtnDisable = true;
        } else if(this.isTransomGlassExists && this.selectedGlassIDs.length > 0) {
          this.isApplyBtnDisable = true;
          this.ngNotificaionShow.next({ title: 'Configuration not supported', message: 'You can\'t apply a door above a transom.', logoToShow: 'Warning' });
        }
      }
    } else {
      this.isApplyBtnDisable = false;
      this.isDoorOperableTypeSelected = false;
      this.isDoorArticlesDisplay = false;
      this.isWindowOperableTypeSelected = true;
      this.isWindowArticlesDisplay = true;      
    }
    if (event === 'parallelOpening' || event === 'topHung') {
      if (this.unified3DModel.ProblemSetting.EnableAcoustic) {
        var errorMessage = this.translate.instant(_('notification.acoustic-solver-does-not-support-Top-Hung-openings-continue-without-Acoustic'));
        if (event === 'parallelOpening')
          errorMessage = this.translate.instant(_('notification.acoustic-solver-does-not-support-Parallel-openings-continue-without-Acoustic'));
        this.modalService.confirm({
          nzWrapClassName: "vertical-center-modal",
          nzWidth: '490px',
          nzTitle: '',
          nzContent: errorMessage,
          nzCancelText: this.translate.instant(_('notification.no')),
          nzOnCancel: () => this.pickers[this.selectedPicker].operableType = '',
          nzOkText: this.translate.instant(_('notification.yes')),
          nzOnOk: () => {
            this.unified3DModel.ProblemSetting.EnableAcoustic = false;
            this.frameCombinationInputValue = 'Combination 1';
            if (this.unified3DModel.ProblemSetting.ProductType !== 'Window') {
              this.pickers[this.selectedPicker].windowSystem = 'AWS 114';
              this.pickers[this.selectedPicker].operationType = 'Manual';
            }
            this.updateSelected(event);
            setTimeout(() => {
              if (event === 'topHung')
                this.ngNotificaionShow.next({ title: this.translate.instant(_('notification.acoustic-disabled')), message: this.translate.instant(_('notification.acoustic-solver-does-not-support-Top-Hung-openings')), logoToShow: 'Acoustic' });
              else
                this.ngNotificaionShow.next({ title: this.translate.instant(_('notification.acoustic-disabled')), message: this.translate.instant(_('notification.acoustic-solver-does-not-support-Parallel-openings')), logoToShow: 'Acoustic' });
            }, 200);
          },
        });
      } else {
        this.unified3DModel.ProblemSetting.EnableAcoustic = false;
        this.frameCombinationInputValue = 'Combination 1';
        if (this.unified3DModel.ProblemSetting.ProductType !== 'Window') {
          this.pickers[this.selectedPicker].windowSystem = 'AWS 114';
          this.pickers[this.selectedPicker].operationType = 'Manual';
        }
        this.updateSelected(event);
      }
    } else if (event !== '') {
      this.doEnableAcoustic();
      if(this.isDoorOperableTypeSelected) {
        this.pickers[this.selectedPicker].windowSystem = 'ads__75';
      } else {
        this.pickers[this.selectedPicker].windowSystem = 'aws__75_si_plus';
      }      
      this.pickers[this.selectedPicker].operationType = '';
      if(this.isDoorOperableTypeSelected )
      {
       if(!this.isTransomGlassExists) {
         if(this.glassAppliedArray[this.selectedPicker].length > 0) {
          this.isDoorArticlesDisplay = true;
         } else {
           this.isDoorArticlesDisplay = false;
           this.isWindowArticlesDisplay = true;
         }
         this.updateSelected(event);
        
       } else {
         this.isDoorArticlesDisplay = false;
         this.isWindowOperableTypeSelected = true;
         this.isWindowArticlesDisplay = true;   
         this.ngNotificaionShow.next({ title: 'Configuration not supported', message: 'You can\'t apply a door above a transom.', logoToShow: 'Warning' });
         this.pickers[this.selectedPicker].windowSystem = 'aws__75_si_plus';
         if(this.glassAppliedArray[0][0].operableType === 'Turn/Tilt - Left Handed'){
           event = 'tiltTurn-left';
          this.pickers[this.selectedPicker].operableType = 'tiltTurn-left';
        }
        if(this.glassAppliedArray[0][0].operableType === 'Turn/Tilt - Right Handed'){
          event = 'tiltTurn-right';
          this.pickers[this.selectedPicker].operableType = 'tiltTurn-right';
        }        
       
       }
      } else {
        this.updateSelected(event);
      }
    }
  }

 /**
 * This function is to enable acoustic
 */
  doEnableAcoustic() {
    setTimeout(() => {
      if (!this.unified3DModel.ProblemSetting.EnableAcoustic && this.unified3DModel.ProblemSetting.isAcousticEnabled) {
        var AWS114Data = this.unified3DModel.ModelInput.Geometry.Infills.filter(g =>
          g.InsertWindowSystem !== null &&
          g.InsertWindowSystem !== undefined &&
          g.InsertWindowSystem.indexOf("AWS 114") > -1);

        var CustomTripleData = this.unified3DModel.ModelInput.Geometry.GlazingSystems.filter(g =>
          (g.Category === "custom" || g.Category === "custom-triple") &&
          g.Plates.length === 3);

        if (AWS114Data.length === 0 && CustomTripleData.length === 0) {
          this.unified3DModel.ProblemSetting.EnableAcoustic = true;
          this.ngNotificaionShow.next({ title: this.translate.instant(_('notification.acoustic-enabled')), message: this.translate.instant(_('notification.acoustic-is-now-enabled')), logoToShow: 'Acoustic' });
        }
      }
    }, 200);
  }
  onOperationTypeChange(event: any) {
    // if (this.unified3DModel.ModelInput.Geometry.Infills.filter(section => section.OperabilitySystemID == (this.selectedPicker + 1))[0] && this.unified3DModel.ModelInput.Geometry.OperabilitySystems)
    //   this.sendCurrentArticleToFrameCombinationTable.emit({ ArticleID: this.unified3DModel.ModelInput.Geometry.OperabilitySystems.filter(section => section.OperabilitySystemID == (this.selectedPicker + 1))[0].VentArticleName, SystemID: this.aws114SystemValue[this.aws114SystemDesc2.indexOf(this.pickers[this.selectedPicker].windowSystem)], OperationType: this.pickers[this.selectedPicker].operationType });
  }

 /**
 * This function is called when user changes the Vent Opening direction Inward or Outward 
 * @param {string} event  this will have the Vent opening direction value and will set to the Unified Model and will load accordingly 
 * in the 3D Viewer
 */
  onVentOpeningDirectionChange(event: any) {
    // this.pickers[this.selectedPicker].operableType = '';
    // this.onOperableTypeChange('')
    if (event == 'Outward') {
      this.insertInsulationTypeName = "PA";
      //this.pickers[this.selectedPicker].operableType = 'topHung';
      //this.onOperableTypeChange('topHung');
    }
    else if (event == 'Inward' && (!this.insertInsulationTypeName ||
      (this.insertInsulationTypeName == 'PA' || this.insertInsulationTypeName == 'PT'))) {
      if (this.systemFacadeSelected == 0)
        this.systemType = "75";
      this.insertInsulationTypeName = "Polyamide Anodized After";
      //this.pickers[this.selectedPicker].operableType = 'tiltTurn-left';
      //this.onOperableTypeChange('tiltTurn-left');
    }
    if (event == 'Outward') {
      //this.onOperableTypeChange('topHung');
    }
    else if (this.unified3DModel.ModelInput.Geometry.OperabilitySystems !== null && this.unified3DModel.ModelInput.Geometry.OperabilitySystems[0].VentOpeningDirection !== this.fixedOpening_index[this.pickers[this.selectedPicker].fixedOpening]) {
      this.onApply(event);
    }
    // this.glassAppliedArray[this.selectedPicker].forEach(glassObject => {
    //   this.unified3DModel.ModelInput.Geometry.Infills.filter(glass => glass.GlassID == glassObject.glassID)[0].VentOpeningDirection = event;
    // });
    // this.unified3DModelFromOperabilityEvent.emit(this.unified3DModel);
  }


  gasketSelection: string = "AIF";
  insulatingSelection: string = "PA";
  insertInsulationTypeName: string;
  onSelectGasket(event: any): void {
    if (!this.unified3DModel.ModelInput.FrameSystem) { this.unified3DModel.ModelInput.FrameSystem = new FrameSystem(); }
    // this.glassAppliedArray[this.selectedPicker].forEach(glassObject => {
    //   this.unified3DModel.ModelInput.Geometry.Infills.filter(glass => glass.GlassID == glassObject.glassID)[0].InsertInsulationType = this.insulatingSelection;
    //   this.unified3DModel.ModelInput.Geometry.Infills.filter(glass => glass.GlassID == glassObject.glassID)[0].InsertUvalueType = this.gasketSelection;
    // });
    // this.unified3DModel.ModelInput.Geometry.Infills.forEach(glass => {
    //   glass.InsertInsulationType = this.insulatingSelection;
    //   glass.InsertUvalueType = this.gasketSelection;
    // });
    this.loadJSONService({ Unified3DModel: this.unified3DModel, canBeDrawn: this.canBeDrawnBool, resetCamera: false });
    this.unified3DModelEvent.emit(this.unified3DModel);
    // //disableresul
    // this.configureService.computeClickedSubject.next(false);
    // this.unified3DModelEvent.emit(this.unified3DModel);
  }

 /**
 * This function is to set the Insulation Type and Insert UValue type 
 * @param {any} event  
 */
  onSelectInsulating(_event: any): void {
    if (!this.unified3DModel.ModelInput.FrameSystem) { this.unified3DModel.ModelInput.FrameSystem = new FrameSystem(); }
    //this.insertInsulationTypeName = this.insulatingSelection;
    if (this.insertInsulationTypeName && (this.insertInsulationTypeName.includes('Polythermid') || this.insertInsulationTypeName == 'PT'))
      this.insulatingSelection = 'PT';
    else
      this.insulatingSelection = 'PA';
    let isValueChanged: Boolean = false;
    this.glassAppliedArray[this.selectedPicker].forEach(glassObject => {
      let operableId = this.unified3DModel.ModelInput.Geometry.Infills.filter(glass => glass.InfillID == glassObject.glassID)[0].OperabilitySystemID;
      if (this.unified3DModel.ModelInput.Geometry.OperabilitySystems && this.unified3DModel.ModelInput.Geometry.OperabilitySystems.filter(glass => glass.OperabilitySystemID == operableId)[0].InsertInsulationType != this.insulatingSelection)
        isValueChanged = true;
      if (this.unified3DModel.ModelInput.Geometry.OperabilitySystems) {
        this.unified3DModel.ModelInput.Geometry.OperabilitySystems.filter(glass => glass.OperabilitySystemID == operableId)[0].InsertInsulationTypeName = this.insertInsulationTypeName;
        this.unified3DModel.ModelInput.Geometry.OperabilitySystems.filter(glass => glass.OperabilitySystemID == operableId)[0].InsertInsulationType = this.insulatingSelection;
        this.unified3DModel.ModelInput.Geometry.OperabilitySystems.filter(glass => glass.OperabilitySystemID == operableId)[0].InsertUvalueType = this.gasketSelection;

      }
    });
    // this.unified3DModel.ModelInput.Geometry.Infills.forEach(glass => {
    //   glass.InsertInsulationType = this.insulatingSelection;
    //   glass.InsertUvalueType = this.gasketSelection;
    // });
    if (isValueChanged) {
      this.loadJSONService({ Unified3DModel: this.unified3DModel, canBeDrawn: this.canBeDrawnBool });
      //disableresul     
      this.configureService.computeClickedSubject.next(false);
      this.unified3DModelEvent.emit(this.unified3DModel);
    }
  }

 /**
 * This function is called to load JSON for the 3D Viewer to display the model 
 * @param {any} data is the unified model which will pass to teh 3D Modeler to display the model in the viewer.  
 */
  loadJSONService(data: any) {
    this.iframeService.loadJSON(this.iframeEvent, 'loadJSON', data);
  }
}
