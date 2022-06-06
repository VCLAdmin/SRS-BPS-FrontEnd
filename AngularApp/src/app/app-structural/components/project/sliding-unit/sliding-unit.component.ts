import { Component, OnInit, Input, OnChanges, SimpleChanges, Output, EventEmitter, OnDestroy } from '@angular/core';
import { BpsUnifiedModel, FrameSystem, OperabilitySystem, DoorSystem, Structural } from 'src/app/app-common/models/bps-unified-model';
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

@Component({
  selector: 'app-sliding-unit',
  templateUrl: './sliding-unit.component.html',
  styleUrls: ['./sliding-unit.component.css']
})
export class SlidingUnitComponent implements OnInit, OnChanges, OnDestroy {
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
  isSlideDoorArticlesDisplay: boolean = false;
  isWindowArticlesDisplay: boolean = false;
  feature = Feature;
  isDoorOperableDisable: boolean = false;
  isAddBtnDisable: boolean = false;


  //Sliding Unit
  slideOption: string = 'Lift_And_Slide';
  isMovingVentInsideOptionDisabled: boolean = true;
  isMovingVentOutsideOptionDisabled: boolean = true;
  isMovingVentInOutOptionDisabled: boolean = false;
  isMovingVentOptionDisabled: boolean = true;
  trackType: string = 'SlidingDoor-Type-2A-Left';
  movingVent: string;
  OperationType: string = 'Manual';
  Fittings: string = 'Manual';
  is2ALeftSelected: boolean = false;
  is2ARightSelected: boolean = false;
  is2A1iLeftSelected: boolean = false;
  is2A1iRightSelected: boolean = false;
  is2D1iSelected: boolean = false;
  is3ELeftSelected: boolean = false;
  is3ERightSelected: boolean = false;
  is3E1LeftSelected: boolean = false;
  is3E1RightSelected: boolean = false;
  is3FSelected: boolean = false;
  isMovingVentInsideSelected: boolean = false;
  isMovingVentOutsideSelected: boolean = false;
  isMovingVentInOutSelected: boolean = false; 
 
  constructor(private umService: UnifiedModelService, private cpService: ConfigPanelsService,
    private configureService: ConfigureService, private modalService: NzModalService,
    private iframeService: IframeService,
    private translate: TranslateService, private fb: FormBuilder, private lc: LeftConfigureComponent,
    private permissionService: PermissionService) {
    this.applicationType = this.configureService.applicationType;
    //SD
    this.validateForm = this.fb.group({
      OperationType: [this.OperationType, [Validators.required]],
      Fittings:[this.Fittings,[Validators.required]]
    });
  }
  EnableAcoustic: boolean;

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngAfterViewInit() {
    this.umService.obsUnifiedModel.pipe(takeUntil(this.destroy$)).subscribe(
      response => {
        if (response) {
          this.cpService.setSystem(this.cpService.SystemData("ASE")[0], "OPERABILITY");
          this.unified3DModel = response;
          this.configureService.setMullionBarDisplay(false);
          if(this.unified3DModel.ModelInput.Geometry.SlidingDoorSystems && this.unified3DModel.ModelInput.Geometry.SlidingDoorSystems.length > 0) {
            setTimeout(() => {
              this.cpService.setPopout(true, PanelsModule.OutsideHandle);
              this.cpService.setPopout(false, PanelsModule.OutsideHandle);
              this.cpService.setPopout(true, PanelsModule.InsideHandle);
              this.cpService.setPopout(false, PanelsModule.InsideHandle);
            }, 15);
           
          }  
        }
      });
    this.umService.obsUnifiedProblem.pipe(takeUntil(this.destroy$)).subscribe(
      response => {
        if (response) {
          this.unified3DModel = this.umService.current_UnifiedModel;
          this.loadSlidingUnit();
          setTimeout(() => {
            this.reloadInputValues();
            this.loadInputValues();
          }, 100);
        }
      });
    this.cpService.obsPopout.pipe(takeUntil(this.destroy$)).subscribe(
      response => {
        if (response.panelsModule === PanelsModule.FrameCombination) this.isFrameCombinationOpened = response.isOpened;
        else if (response.panelsModule === PanelsModule.OuterFrame) this.isOuterOpened = response.isOpened;
        else if (response.panelsModule === PanelsModule.VentFrame) this.isVentOpened = response.isOpened;
        else if (response.panelsModule === PanelsModule.InsideHandle) this.isInsideHandleOpened = response.isOpened;
        else if (response.panelsModule === PanelsModule.OutsideHandle) this.isOutsideHandleOpened = response.isOpened;
      });

    this.umService.obsLoadSidePanel.pipe(takeUntil(this.destroy$)).subscribe(
      response => {
        if (response && response.panelsModule > -1 && response.finishedLoading) {
          if (response.panelsModule === PanelsModule.InsideHandle) this.insideHandle = this.umService.get_InsideHandleForSlidingDoors();
          else if (response.panelsModule === PanelsModule.OutsideHandle) this.outsideHandle = this.umService.get_OutsideHandleForSlidingDoors();
        }
      }
    );

    this.iframeService.sendChildEventObs.pipe(takeUntil(this.destroy$)).subscribe((response) => {
             if(response) {
               switch (response.eventType) {
                 case 'loadJSONFinished':
                   this.iframeService.setShowLoader(false);
                   break;
               
                 default:
                   break;
               }
             }
    });
  }


  private loadInputValues() {
    setTimeout(() => {
      this.insideHandle = this.umService.get_InsideHandleForSlidingDoors();
      this.outsideHandle = this.umService.get_OutsideHandleForSlidingDoors();
      if(this.unified3DModel.ModelInput.Geometry.SlidingDoorSystems && this.unified3DModel.ModelInput.Geometry.SlidingDoorSystems.length > 0) {
        this.slideOption = this.umService.get_SlideOption();
        this.trackType = this.umService.get_TrackType();
        this.movingVent = this.umService.get_MovingVent();
        switch (this.movingVent) {
          case 'Inside':
            this.movingVent = 'Inside';
            this.isMovingVentInsideOptionDisabled = false;
            this.isMovingVentInOutOptionDisabled = true;
            this.isMovingVentInOutOptionDisabled = true;
            break;
            case 'Outside':
            this.movingVent = 'Outside';
            this.isMovingVentInsideOptionDisabled = true;
            this.isMovingVentInOutOptionDisabled = false;
            this.isMovingVentInOutOptionDisabled = true;
            break;
            case 'InsideAndOutside':
              this.movingVent = 'InsideAndOutside';
              this.isMovingVentInsideOptionDisabled = true;
              this.isMovingVentInOutOptionDisabled = true;
              this.isMovingVentInOutOptionDisabled = false;
              break;
        
          default:
            break;
        }
      } else {
        this.slideOption = 'Lift_And_Slide';
      }
      if(this.unified3DModel.SRSProblemSetting.isOrderPlaced) {
        switch (this.trackType) {
          case 'SlidingDoor-Type-2A-Left':
            this.is2ALeftSelected = true;
            this.is2ARightSelected = false;
            this.is2A1iLeftSelected = false;
            this.is2A1iRightSelected = false;
            this.is2D1iSelected = false;
            this.is3ELeftSelected = false;
            this.is3ERightSelected = false;
            this.is3E1LeftSelected = false;
            this.is3E1RightSelected = false;
            this.is3FSelected = false;
            break;
          case 'SlidingDoor-Type-2A-Right':
            this.is2ALeftSelected = false;
            this.is2ARightSelected = true;
            this.is2A1iLeftSelected = false;
            this.is2A1iRightSelected = false;
            this.is2D1iSelected = false;
            this.is3ELeftSelected = false;
            this.is3ERightSelected = false;
            this.is3E1LeftSelected = false;
            this.is3E1RightSelected = false;
            this.is3FSelected = false;
            break;
          case 'SlidingDoor-Type-2A1.i-Left':
            this.is2ALeftSelected = false;
            this.is2ARightSelected = false;
            this.is2A1iLeftSelected = true;
            this.is2A1iRightSelected = false;
            this.is2D1iSelected = false;
            this.is3ELeftSelected = false;
            this.is3ERightSelected = false;
            this.is3E1LeftSelected = false;
            this.is3E1RightSelected = false;
            this.is3FSelected = false;
            break;
          case 'SlidingDoor-Type-2A1.i-Right':
            this.is2ALeftSelected = false;
            this.is2ARightSelected = false;
            this.is2A1iLeftSelected = false;
            this.is2A1iRightSelected = true;
            this.is2D1iSelected = false;
            this.is3ELeftSelected = false;
            this.is3ERightSelected = false;
            this.is3E1LeftSelected = false;
            this.is3E1RightSelected = false;
            this.is3FSelected = false;
            break;
          case 'SlidingDoor-Type-2D1.i':
            this.is2ALeftSelected = false;
            this.is2ARightSelected = false;
            this.is2A1iLeftSelected = false;
            this.is2A1iRightSelected = false;
            this.is2D1iSelected = true;
            this.is3ELeftSelected = false;
            this.is3ERightSelected = false;
            this.is3E1LeftSelected = false;
            this.is3E1RightSelected = false;
            this.is3FSelected = false;
            break;
          case 'SlidingDoor-Type-3E-Left':
            this.is2ALeftSelected = false;
            this.is2ARightSelected = false;
            this.is2A1iLeftSelected = false;
            this.is2A1iRightSelected = false;
            this.is2D1iSelected = false;
            this.is3ELeftSelected = true;
            this.is3ERightSelected = false;
            this.is3E1LeftSelected = false;
            this.is3E1RightSelected = false;
            this.is3FSelected = false;
            break;
          case 'SlidingDoor-Type-3E-Right':
            this.is2ALeftSelected = false;
            this.is2ARightSelected = false;
            this.is2A1iLeftSelected = false;
            this.is2A1iRightSelected = false;
            this.is2D1iSelected = false;
            this.is3ELeftSelected = false;
            this.is3ERightSelected = true;
            this.is3E1LeftSelected = false;
            this.is3E1RightSelected = false;
            this.is3FSelected = false;
            break;
          case 'SlidingDoor-Type-3E1-Left':
            this.is2ALeftSelected = false;
            this.is2ARightSelected = false;
            this.is2A1iLeftSelected = false;
            this.is2A1iRightSelected = false;
            this.is2D1iSelected = false;
            this.is3ELeftSelected = false;
            this.is3ERightSelected = false;
            this.is3E1LeftSelected = true;
            this.is3E1RightSelected = false;
            this.is3FSelected = false;
            break;
          case 'SlidingDoor-Type-3E1-Right':
            this.is2ALeftSelected = false;
            this.is2ARightSelected = false;
            this.is2A1iLeftSelected = false;
            this.is2A1iRightSelected = false;
            this.is2D1iSelected = false;
            this.is3ELeftSelected = false;
            this.is3ERightSelected = false;
            this.is3E1LeftSelected = false;
            this.is3E1RightSelected = true;
            this.is3FSelected = false;
            break;
          case 'SlidingDoor-Type-3F':
            this.is2ALeftSelected = false;
            this.is2ARightSelected = false;
            this.is2A1iLeftSelected = false;
            this.is2A1iRightSelected = false;
            this.is2D1iSelected = false;
            this.is3ELeftSelected = false;
            this.is3ERightSelected = false;
            this.is3E1LeftSelected = false;
            this.is3E1RightSelected = false;
            this.is3FSelected = true;
            break;
        }
  
        switch (this.movingVent) {
          case 'Inside':
            this.isMovingVentInsideSelected = true;
            this.isMovingVentOutsideSelected = false;
            this.isMovingVentInOutSelected = false;
            break;
          case 'Outside':
            this.isMovingVentInsideSelected = false;
            this.isMovingVentOutsideSelected = true;
            this.isMovingVentInOutSelected = false;
            break;
          case 'InsideAndOutside':
            this.isMovingVentInsideSelected = false;
            this.isMovingVentOutsideSelected = false;
            this.isMovingVentInOutSelected = true;
            break;
        }
      }
    }, 100);
  }

  reloadInputValues() {
    this.umService.doLoadJSON = false;
    let ds = this.unified3DModel.ModelInput.Geometry.SlidingDoorSystems;
    if (ds) {
      if (ds.filter(glass => glass.OutsideHandleArticleName === null || glass.OutsideHandleArticleName === undefined).length > 0) {
        this.cpService.setPopout(true, PanelsModule.OutsideHandle);
        this.cpService.setPopout(false, PanelsModule.OutsideHandle);
      }
     
      if (ds.filter(glass => glass.InsideHandleArticleName === null || glass.InsideHandleArticleName === undefined).length > 0) {
        this.cpService.setPopout(true, PanelsModule.InsideHandle);
        this.cpService.setPopout(false, PanelsModule.InsideHandle);
      } 
    }
    if(this.unified3DModel.SRSProblemSetting.isOrderPlaced) {
      switch (this.trackType) {
        case 'SlidingDoor-Type-2A-Left':
          this.is2ALeftSelected = true;
          this.is2ARightSelected = false;
          this.is2A1iLeftSelected = false;
          this.is2A1iRightSelected = false;
          this.is2D1iSelected = false;
          this.is3ELeftSelected = false;
          this.is3ERightSelected = false;
          this.is3E1LeftSelected = false;
          this.is3E1RightSelected = false;
          this.is3FSelected = false;
          break;
        case 'SlidingDoor-Type-2A-Right':
          this.is2ALeftSelected = false;
          this.is2ARightSelected = true;
          this.is2A1iLeftSelected = false;
          this.is2A1iRightSelected = false;
          this.is2D1iSelected = false;
          this.is3ELeftSelected = false;
          this.is3ERightSelected = false;
          this.is3E1LeftSelected = false;
          this.is3E1RightSelected = false;
          this.is3FSelected = false;
          break;
        case 'SlidingDoor-Type-2A1.i-Left':
          this.is2ALeftSelected = false;
          this.is2ARightSelected = false;
          this.is2A1iLeftSelected = true;
          this.is2A1iRightSelected = false;
          this.is2D1iSelected = false;
          this.is3ELeftSelected = false;
          this.is3ERightSelected = false;
          this.is3E1LeftSelected = false;
          this.is3E1RightSelected = false;
          this.is3FSelected = false;
          break;
        case 'SlidingDoor-Type-2A1.i-Right':
          this.is2ALeftSelected = false;
          this.is2ARightSelected = false;
          this.is2A1iLeftSelected = false;
          this.is2A1iRightSelected = true;
          this.is2D1iSelected = false;
          this.is3ELeftSelected = false;
          this.is3ERightSelected = false;
          this.is3E1LeftSelected = false;
          this.is3E1RightSelected = false;
          this.is3FSelected = false;
          break;
        case 'SlidingDoor-Type-2D1.i':
          this.is2ALeftSelected = false;
          this.is2ARightSelected = false;
          this.is2A1iLeftSelected = false;
          this.is2A1iRightSelected = false;
          this.is2D1iSelected = true;
          this.is3ELeftSelected = false;
          this.is3ERightSelected = false;
          this.is3E1LeftSelected = false;
          this.is3E1RightSelected = false;
          this.is3FSelected = false;
          break;
        case 'SlidingDoor-Type-3E-Left':
          this.is2ALeftSelected = false;
          this.is2ARightSelected = false;
          this.is2A1iLeftSelected = false;
          this.is2A1iRightSelected = false;
          this.is2D1iSelected = false;
          this.is3ELeftSelected = true;
          this.is3ERightSelected = false;
          this.is3E1LeftSelected = false;
          this.is3E1RightSelected = false;
          this.is3FSelected = false;
          break;
        case 'SlidingDoor-Type-3E-Right':
          this.is2ALeftSelected = false;
          this.is2ARightSelected = false;
          this.is2A1iLeftSelected = false;
          this.is2A1iRightSelected = false;
          this.is2D1iSelected = false;
          this.is3ELeftSelected = false;
          this.is3ERightSelected = true;
          this.is3E1LeftSelected = false;
          this.is3E1RightSelected = false;
          this.is3FSelected = false;
          break;
        case 'SlidingDoor-Type-3E1-Left':
          this.is2ALeftSelected = false;
          this.is2ARightSelected = false;
          this.is2A1iLeftSelected = false;
          this.is2A1iRightSelected = false;
          this.is2D1iSelected = false;
          this.is3ELeftSelected = false;
          this.is3ERightSelected = false;
          this.is3E1LeftSelected = true;
          this.is3E1RightSelected = false;
          this.is3FSelected = false;
          break;
        case 'SlidingDoor-Type-3E1-Right':
          this.is2ALeftSelected = false;
          this.is2ARightSelected = false;
          this.is2A1iLeftSelected = false;
          this.is2A1iRightSelected = false;
          this.is2D1iSelected = false;
          this.is3ELeftSelected = false;
          this.is3ERightSelected = false;
          this.is3E1LeftSelected = false;
          this.is3E1RightSelected = true;
          this.is3FSelected = false;
          break;
        case 'SlidingDoor-Type-3F':
          this.is2ALeftSelected = false;
          this.is2ARightSelected = false;
          this.is2A1iLeftSelected = false;
          this.is2A1iRightSelected = false;
          this.is2D1iSelected = false;
          this.is3ELeftSelected = false;
          this.is3ERightSelected = false;
          this.is3E1LeftSelected = false;
          this.is3E1RightSelected = false;
          this.is3FSelected = true;
          break;
      }

      switch (this.movingVent) {
        case 'Inside':
          this.isMovingVentInsideSelected = true;
          this.isMovingVentOutsideSelected = false;
          this.isMovingVentInOutSelected = false;
          break;
        case 'Outside':
          this.isMovingVentInsideSelected = false;
          this.isMovingVentOutsideSelected = true;
          this.isMovingVentInOutSelected = false;
          break;
        case 'InsideAndOutside':
          this.isMovingVentInsideSelected = false;
          this.isMovingVentOutsideSelected = false;
          this.isMovingVentInOutSelected = true;
          break;
      }
    }
    setTimeout(() => {
      this.umService.doLoadJSON = true;
      this.umService.callLoadJSON(this.canBeDrawnBool);
    }, 10);
  }

  ngOnInit(): void {
    this.language = this.configureService.getLanguage();
    this.applicationType = this.configureService.applicationType;
    setTimeout(() => {
      this.reloadInputValues();
      this.loadInputValues();
    }, 10);
  }

  loadSlidingUnit() {
    for (const key in this.validateForm.controls) {
      this.validateForm.controls[key].markAsDirty();
      this.validateForm.controls[key].updateValueAndValidity();
    }

  }

  ngOnChanges(Changes: SimpleChanges): void {
    this.applicationType = this.configureService.applicationType;
    if (Changes && this.unified3DModel) {
      if (Changes.unified3DModel) {
        if (Changes.unified3DModel.currentValue &&
          (Changes.unified3DModel.previousValue
            && (Changes.unified3DModel.currentValue.ProblemSetting.ProblemGuid != Changes.unified3DModel.previousValue.ProblemSetting.ProblemGuid))
          || (!Changes.unified3DModel.previousValue && Changes.unified3DModel.firstChange)) { // called when reload the page and change problem from right panel
          this.unified3DModel = Changes.unified3DModel.currentValue;
          this.loadSlidingUnit();
        }
      }

      // if (Changes.event3D && Changes.event3D.currentValue && Changes.event3D.currentValue.eventType === 'changeUnifiedModel') {  // when user adds mullion, tramsom, removes mullion/transom
        
      // }
    }
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

  onMovingVentChange(event: any) {
    this.movingVent = event;
  }

  onTrackTypeChange(event: any) {
    this.trackType = event;
    if(this.trackType !== null && this.trackType !== undefined) {
      let aseType: any;
      switch (this.trackType) {
        case 'SlidingDoor-Type-2A-Left':
          aseType = '2A_Left';
          break;
        case 'SlidingDoor-Type-2A-Right':
          aseType = '2A_Right';
          break;
        case 'SlidingDoor-Type-2A1.i-Left':
          aseType = '2A1i_Left';
          break;
        case 'SlidingDoor-Type-2A1.i-Right':
          aseType = '2A1i_Right';
          break;
        case 'SlidingDoor-Type-2D1.i':
          aseType = '2D1i';
          break;
        case 'SlidingDoor-Type-3E-Left':
          aseType = '3E_Left';
          break;
        case 'SlidingDoor-Type-3E-Right':
          aseType = '3E_Right';
          break;
        case 'SlidingDoor-Type-3E1-Left':
          aseType = '3E1_Left';
          break;
        case 'SlidingDoor-Type-3E1-Right':
          aseType = '3E1_Right';
          break;
        case 'SlidingDoor-Type-3F':
          aseType = '3F';
          break;
        default:
          break;
      }
      const projName = this.umService.current_UnifiedModel.ProblemSetting.ProjectName;
      const configName = this.umService.current_UnifiedModel.ProblemSetting.ConfigurationName;
      const projLoc = this.umService.current_UnifiedModel.ProblemSetting.Location;
      const userName = this.umService.current_UnifiedModel.UserSetting.UserName;
      this.configureService.GetProblemForSlidingDoorProject(this.unified3DModel.ProblemSetting.ProjectGuid, this.unified3DModel.ProblemSetting.ProblemGuid, aseType).subscribe((problem) => {
        this.unified3DModel = JSON.parse(problem.UnifiedModel);
        // this.unified3DModel.ProblemSetting.Location = this.configureService.projectLocation;
        // this.unified3DModel.ProblemSetting.ProjectName = this.configureService.projectName;
        this.unified3DModel.ProblemSetting.ProjectName = projName;
        this.unified3DModel.ProblemSetting.ConfigurationName = configName;
        this.unified3DModel.ProblemSetting.Location = projLoc;
        this.unified3DModel.UserSetting.UserName = userName;
        //this.unified3DModel.ProblemSetting.Location = this.configureService.projectLocation;
        //this.unified3DModel.ProblemSetting.ProjectName = this.configureService.projectName;
        if (this.permissionService.checkPermission(Feature.OrderingApp)){
          if(this.unified3DModel.ModelInput.Structural === null) {
            this.unified3DModel.ModelInput.Structural = new Structural();
            this.unified3DModel.ModelInput.Structural.WindLoad = 1.68;
          } else if(this.unified3DModel.ModelInput.Structural && !this.unified3DModel.ModelInput.Structural.WindLoad){
            this.unified3DModel.ModelInput.Structural.WindLoad = 1.68;
          }
        }
        this.umService.setUnifiedModel(this.unified3DModel);
        this.cpService.setCheckoutDisable_InvalidSmallDimension(false);
        this.cpService.setCheckoutDisable_InvalidLargeDimension(false);
        switch (this.unified3DModel.ModelInput.Geometry.SlidingDoorSystems[0].MovingVent) {
          case 'Inside':
            this.movingVent = 'Inside';
            this.isMovingVentInsideOptionDisabled = false;
            this.isMovingVentInOutOptionDisabled = true;
            this.isMovingVentInOutOptionDisabled = true;
            break;
            case 'Outside':
            this.movingVent = 'Outside';
            this.isMovingVentInsideOptionDisabled = true;
            this.isMovingVentInOutOptionDisabled = false;
            this.isMovingVentInOutOptionDisabled = true;
            break;
            case 'Inside and Outside':
              this.movingVent = 'InsideAndOutside';
              this.isMovingVentInsideOptionDisabled = true;
              this.isMovingVentInOutOptionDisabled = true;
              this.isMovingVentInOutOptionDisabled = false;
              break;
        
          default:
            break;
        }
        this.insideHandle = this.umService.get_InsideHandleForSlidingDoors();
        this.outsideHandle = this.umService.get_OutsideHandleForSlidingDoors();
        this.iframeService.setShowLoader(true);
        this.loadJSONService({ Unified3DModel: this.unified3DModel, canBeDrawn: this.canBeDrawnBool });
        this.lc.loadDisplaySetting_ActivePanel(); 
      });      
    }
  }

  onSelectFittings(event: any) {
  }



  onSlideOptionChange(event: any) { 
   this.slideOption = event;

  }

  onSelectOperationType(event: any){;
  }
  
  loadJSONService(data: any) {
    this.iframeService.loadJSON(this.iframeEvent, 'loadJSON', data);
  }
  isMissingHandleRecees(){
    let result: boolean = false;
    if(this.unified3DModel && this.unified3DModel.ModelInput && this.unified3DModel.ModelInput.Geometry 
      && this.unified3DModel.ModelInput.Geometry.OperabilitySystems && this.unified3DModel.ModelInput.Geometry.OperabilitySystems.length > 0 ) {
        if(this.unified3DModel.ModelInput.Geometry.OperabilitySystems[0].VentOperableType.includes('2D') || this.unified3DModel.ModelInput.Geometry.OperabilitySystems[0].VentOperableType.includes('3F')){
          if(this.unified3DModel.ModelInput.Geometry.SlidingDoorSystems 
            && this.unified3DModel.ModelInput.Geometry.SlidingDoorSystems.length>0
            && this.unified3DModel.ModelInput.Geometry.SlidingDoorSystems[0].InterlockReinforcement)
            result = true;
          else result = false;
        }
      }
     return result; 
  }
}
