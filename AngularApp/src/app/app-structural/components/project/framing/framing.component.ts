import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges, OnDestroy, AfterViewInit } from '@angular/core';
import { FrameSystem, BpsUnifiedModel, Geometry, Section, Infill, Structural, Reinforcement, Thermal, FacadeSection } from 'src/app/app-common/models/bps-unified-model';
import { IFrameEvent } from 'src/app/app-structural/models/iframe-exchange-data';
import { Subject } from 'rxjs';
import { ConfigureService } from 'src/app/app-structural/services/configure.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LeftConfigureComponent } from '../left-configure/left-configure.component';
import { LocalStorageService } from 'src/app/app-core/services/local-storage.service';
import { FramingService } from 'src/app/app-structural/services/framing.service';
import { UnifiedModelService } from 'src/app/app-structural/services/unified-model.service';
import { ConfigPanelsService } from 'src/app/app-structural/services/config-panels.service';
import { PanelsModule } from 'src/app/app-structural/models/panels/panels.module';
import { IframeService } from 'src/app/app-structural/services/iframe.service';
import { Feature } from 'src/app/app-core/models/feature';
import { PermissionService } from 'src/app/app-core/services/permission.service';
import { takeUntil } from 'rxjs/operators';
import { debugOutputAstAsTypeScript } from '@angular/compiler';

@Component({
  selector: 'app-framing',
  templateUrl: './framing.component.html',
  styleUrls: ['./framing.component.css']
})
export class FramingComponent implements OnInit, OnChanges, OnDestroy, AfterViewInit {
  private destroy$ = new Subject<void>();
  ProfileColorFromChild: any;
  DoorLeafActiveInputArticle: any;
  DoorLeafPassiveInputArticle: any;
  SillProfileFixedInputArticle: any;
  SillProfileBottomInputArticle: any;

  OuterFrameInputArticle: any;
  VentFrameInputArticle: any;
  MullionFrameInputArticle: any;
  TransomFrameInputArticle: any;
  outerFrameInputValue: string;
  ventFrameInputValue: string;
  doubleVentInputValue: string;
  structuralProfileInputValue: string;
  mullionInputValue: string;
  transomInputValue: string;

  // Sliding door input value
  interlockInputValue: string;
  bottomOuterFrameInputValue: string;
  reinforcementInputValue: string;

  ReinforcementMullionInputArticle: any;
  MullionDepthInputArticle: any;
  TransomDepthInputArticle: any;
  IntermediateMullionDepthInputArticle: any;
  IntermediateTransomDepthInputArticle: any;
  UDCFramingDepthInputArticle: any;

  systemSelected: number = 0;
  validateForm: FormGroup;

  //doorLeafActiveValue: string = "476230 - 73 / 73";
  doorLeafActiveValue: string;
  doorLeafPassiveValue: string;
  sillProfileFixedValue: string;
  sillProfileBottomValue: string;
  showMullion: boolean = false;
  showTransom: boolean = false;
  showVent: boolean = false;
  showDoorArticles: boolean = false;
  isSingleDoor: boolean = false;
  isDoubleDoor: boolean = false;
  @Input() iframeEvent: Subject<IFrameEvent>;
  @Input() unified3DModel: BpsUnifiedModel = null;
  @Input() event3D: any;
  @Input() canBeDrawnBool: boolean;
  @Input() onCloseFramingPopoutsEvent: EventEmitter<any>;
  @Input() systemSelectedEvent: EventEmitter<any>;
  @Input() systemFacadeSelectedFromFramingEvent: EventEmitter<any>;

  isOuterOpened: boolean = false;
  isVentOpened: boolean = false;
  isMullionOpened: boolean = false;
  isTransomOpened: boolean = false;
  isMullionFacadeOpened: boolean = false;
  isTransomFacadeOpened: boolean = false;
  isReinforcementFacadeOpened: boolean = false;
  isIntermediateMullionFacadeOpened: boolean = false;
  isIntermediateTransomFacadeOpened: boolean = false;
  isUDCFramingOpened: boolean = false;
  isProfileColorOpened: boolean = false;
  isDoorLeafActiveOpened: boolean = false;
  isDoorLeafPassiveOpened: boolean = false;
  isSillProfileFixedOpened: boolean = false;
  isSillProfileBottomOpened: boolean = false;

  isBottomOuterOpened: boolean = false;
  isInterlockOpened: boolean = false;
  isReinforcementOpened: boolean = false;
  isDoubleVentOpened: boolean = false;
  isStructuralOpened: boolean = false;
  isProfileColorSlidingOpened: boolean = false;
  addReinforcementBool: boolean = false;
  isBottomOuterFrameDisplay: boolean = true;

  @Input() isFramingActive: boolean;
  @Input() problemGuid: string;
  @Input() unified3DModelEvent: EventEmitter<BpsUnifiedModel>;

  //#region profileColorInputValue
  profileColorInputValue: string = undefined;
  @Input() profileColorEvent: EventEmitter<any>;
  @Output() ngNotificaionShow: EventEmitter<any> = new EventEmitter<any>();

  //#endregion profileColorInputValue
  showIntermediateMullionDepth: boolean = false;
  showIntermediateTransomDepth: boolean = false;

  initialLengthMullion: number;

  insulatingSelection: string = "Polyamide Anodized After";
  //alloysSelection: string = "6060-T66 (150MPa)";
  gasketSelection: string = "AIF";
  verticalJointWidth: string = "10";
  horizontalJointWidth: string = "10";
  sectionClassArray: Array<Section> = [new Section(), new Section(), new Section(), new Section(), new Section()];
  sectionClassArrayFilledBool: Array<Boolean> = [false, false, false, false, false];
  isSameProblem: boolean = true;
  isMullionChanged: boolean = false;
  isTransomChanged: boolean = false;
  isOuterFrameChanged: boolean = false;

  awsSystemValue = ['aws__75_si_plus', 'aws__75__bs_si_plus', 'aws__75__bs_hi_plus', 'aws__90_si_plus', 'aws__90__bs_si_plus'];
  awsSystemDesc = ['AWS 75.SI+', 'AWS 75 BS.SI+', 'AWS 75 BS.HI+', 'AWS 90.SI+', 'AWS 90 BS.SI+'];

  adsSystemValue = ['ads__75'];
  adsSystemDesc = ['ADS 75'];

  //Facades
  fwsSystemDesc2 = ['FWS 35 PD', 'FWS 35 PD', 'FWS 50', 'FWS 50', 'FWS 50', 'FWS 50', 'FWS 60', 'FWS 60', 'FWS 60', 'FWS 60'];
  fwsSystemValue_temp = ['fws_35_pd_si', 'fws_35_pd_si', 'fws_50_si', 'fws_50_si', 'fws_50_si', 'fws_50_si', 'fws_60_hi', 'fws_60_hi', 'fws_60_hi', 'fws_60_hi'];
  fwsSystemValue = ['fws_35_pd_si', 'fws_35_pd_hi', 'fws_50_si', 'fws_50_si_green', 'fws_50_hi', 'fws_50', 'fws_60_si', 'fws_60_si_green', 'fws_60_hi', 'fws_60'];
  fwsSystemDesc = ['FWS 35 PD.SI', 'FWS 35 PD.HI', 'FWS 50.SI', 'FWS 50.SI GREEN', 'FWS 50.HI', 'FWS 50', 'FWS 60.SI', 'FWS 60.SI GREEN', 'FWS 60.HI', 'FWS 60'];
  fwsSystemZone = ['SI', 'HI', 'SI', 'SI GREEN', 'HI', '', 'SI', 'SI GREEN', 'HI', ''];


  udcSystemDesc2 = ['UDC 80', 'UDC 80', 'UDC 80', 'UDC 80'];
  udcSystemValue = ['udc_80', 'udc_80_hi', 'udc_80_si', 'udc_80_si_xps'];
  udcSystemValue_temp = ['udc_80', 'udc_80_hi', 'udc_80_si', 'udc_80_si_xps'];
  udcSystemDesc = ['UDC 80', 'UDC 80.HI', 'UDC 80.SI', 'UDC 80.SI with XPS Filling'];
  udcSystemZone = ['', 'HI', 'SI', 'SI with XPS Filling'];

  //Sliding Door
  aseSystemValue = ['ase__60', 'ase__80_hi'];
  aseSystemDesc = ['ASE 60', 'ASE 80.HI'];

  validateFormForFacade: FormGroup;
  validateFormForFacadeUDC: FormGroup;
  mullionDepthInputValue: string;
  transomDepthInputValue: string;
  intermediateMullionDepthInputValue: string;
  intermediateTransomDepthInputValue: string;
  UDCFramingInputValue: string;
  UDCBottomFramingInputValue: string;
  switchReinforcement: boolean = false;
  mullionReinforcementTypeHeading: string;
  appliedMullionReinforcement: any = [];
  selectedReinforcementIds: [] = []; // for mullion reinforcement
  selectedMajorMullionIDs: [] = []; // for mullion reinforcement
  //isSystemFacadeChanged: number = 0;   // skip two calls of Changes.unifiedModel when system changes (no call when equals to 1 or 2)
  applicationType: string;
  @Input() orderPlaced: boolean;
  feature = Feature;
  reinforcementArticleData: any;
  doubleVentArticleData: any;
  structuralProfileArticleData: any;

  constructor(private fService: FramingService, private cpService: ConfigPanelsService, private umService: UnifiedModelService, private configureService: ConfigureService, private localStorageService: LocalStorageService,
    private framingService: FramingService, private fb: FormBuilder, private lc: LeftConfigureComponent,
    private permissionService: PermissionService, private iframeService: IframeService) {
    this.applicationType = this.configureService.applicationType;
    this.insulatingSelection = "Polyamide Anodized After";
    this.gasketSelection = "AIF";
    this.validateForm = this.fb.group({
      Insulating: [this.insulatingSelection, [Validators.required]],
      Glazing: [this.gasketSelection, [Validators.required]],
      //Alloys: ['', [Validators.required]]
    });
    this.validateFormForFacade = this.fb.group({
      InsulationZone: ['', [Validators.required]],
      mullionDepthInputValue: ['', [Validators.required]],
      transomDepthInputValue: ['', [Validators.required]],
      intermediateMullionDepthInputValue: [''],
      SwitchReinforcement: ['', [Validators.required]],
      mullionReinforcementTypeControl: ['', [Validators.required]],
    });

    this.validateFormForFacadeUDC = this.fb.group({
      UDCFramingInputValue: ['', [Validators.required]],
      UDCBottomFramingInputValue: ['', [Validators.required]],
      intermediateMullionDepthInputValue: [''],
      intermediateTransomDepthInputValue: [''],
      verticalJointWidth: [this.verticalJointWidth, [Validators.required]],
      horizontalJointWidth: [this.horizontalJointWidth, [Validators.required]],
    });
  }

  ngAfterViewInit() {
    this.umService.obsUnifiedModel.pipe(takeUntil(this.destroy$)).subscribe(
      response => {
        if (response) {
          this.unified3DModel = response;
          this.loadInputValues();
        }
      });

    this.umService.obsUnifiedProblem.pipe(takeUntil(this.destroy$)).subscribe(
      response => {
        if (response) {
          this.loadFraming();
          this.loadInputValues();
        }
      });
    this.umService.obsLoadSidePanel.pipe(takeUntil(this.destroy$)).subscribe(
      response => {
        if (response && response.panelsModule > -1 && response.finishedLoading) {
          if (response.panelsModule === PanelsModule.OuterFrame) this.getOuterFrameInputValue();
          else if (response.panelsModule === PanelsModule.BottomOuterFrameSliding) this.getBottomOuterFrameInputValue();
          else if (response.panelsModule === PanelsModule.VentFrame) this.getVentFrameInputValue();
          else if (response.panelsModule === PanelsModule.Mullion) this.getMullionFrameInputValue();
          else if (response.panelsModule === PanelsModule.Transom) this.getTransomFrameInputValue();
          else if (response.panelsModule === PanelsModule.MullionFacade) this.getMullionFacadeInputValue();
          else if (response.panelsModule === PanelsModule.TransomFacade) this.getTransomFacadeInputValue();
          else if (response.panelsModule === PanelsModule.ReinforcementFacade) this.getReinforcementFacadeInputValue();
          else if (response.panelsModule === PanelsModule.IntermediateMullionFacade) this.getIntermediateTransomFacadeInputValue();
          else if (response.panelsModule === PanelsModule.IntermediateTransomFacade) this.getIntermediateMullionFacadeInputValue();
          else if (response.panelsModule === PanelsModule.UDCFraming) this.getUDCFramingDepthInputValue();
          else if(response.panelsModule === PanelsModule.ProfileColor) this.getProfileColorInputValue();
          else if (response.panelsModule === PanelsModule.DoorLeafActive) this.getDoorLeafActiveInputValue();
          else if (response.panelsModule === PanelsModule.DoorLeafPassive) this.getDoorLeafPassiveInputValue();
          else if (response.panelsModule === PanelsModule.SillProfileFixed) this.getSillProfileFixedInputValue();
          else if (response.panelsModule === PanelsModule.SillProfileBottom) this.getSillProfileBottomInputValue();
          else if (response.panelsModule === PanelsModule.InterlockSliding) this.getInterlockInputValue();
          else if (response.panelsModule === PanelsModule.ReinforcementSliding) this.getReinforcementSliding();
        }
      }
    );

    this.cpService.obsPopout.pipe(takeUntil(this.destroy$)).subscribe(
      response => {
        if (response.panelsModule === PanelsModule.OuterFrame) this.isOuterOpened = response.isOpened;
        else if (response.panelsModule === PanelsModule.VentFrame) this.isVentOpened = response.isOpened;
        else if (response.panelsModule === PanelsModule.Mullion) this.isMullionOpened = response.isOpened;
        else if (response.panelsModule === PanelsModule.Transom) this.isTransomOpened = response.isOpened;
        else if (response.panelsModule === PanelsModule.MullionFacade) this.isMullionFacadeOpened = response.isOpened;
        else if (response.panelsModule === PanelsModule.TransomFacade) this.isTransomFacadeOpened = response.isOpened;
        else if (response.panelsModule === PanelsModule.ReinforcementFacade) this.isReinforcementFacadeOpened = response.isOpened;
        else if (response.panelsModule === PanelsModule.IntermediateMullionFacade) this.isIntermediateMullionFacadeOpened = response.isOpened;
        else if (response.panelsModule === PanelsModule.IntermediateTransomFacade) this.isIntermediateTransomFacadeOpened = response.isOpened;
        else if (response.panelsModule === PanelsModule.UDCFraming) this.isUDCFramingOpened = response.isOpened;
        else if (response.panelsModule === PanelsModule.ProfileColor) this.isProfileColorOpened = response.isOpened;
        else if (response.panelsModule === PanelsModule.DoorLeafActive) this.isDoorLeafActiveOpened = response.isOpened;
        else if (response.panelsModule === PanelsModule.DoorLeafPassive) this.isDoorLeafPassiveOpened = response.isOpened;
        else if (response.panelsModule === PanelsModule.SillProfileFixed) this.isSillProfileFixedOpened = response.isOpened;
        else if (response.panelsModule === PanelsModule.SillProfileBottom) this.isSillProfileBottomOpened = response.isOpened;
        else if (response.panelsModule === PanelsModule.BottomOuterFrameSliding) this.isBottomOuterOpened = response.isOpened;
        else if (response.panelsModule === PanelsModule.InterlockSliding) this.isInterlockOpened = response.isOpened;
        else if (response.panelsModule === PanelsModule.ReinforcementSliding) this.isReinforcementOpened = response.isOpened;
        else if (response.panelsModule === PanelsModule.DoubleVentSliding) this.isDoubleVentOpened = response.isOpened;
        else if (response.panelsModule === PanelsModule.StrucuralSliding) this.isStructuralOpened = response.isOpened;
      });

    this.loadInputValues();
  }
  private loadInputValues() {
    setTimeout(() => {
      if(this.unified3DModel.ProblemSetting.ProductType!=='Facade'){
        this.getOuterFrameInputValue();
      }
     
      this.getBottomOuterFrameInputValue();
      this.getVentFrameInputValue();
      this.getMullionFrameInputValue();
      this.getTransomFrameInputValue();
      this.getProfileColorInputValue();
      this.getMullionFacadeInputValue();
      this.getTransomFacadeInputValue();
      this.getReinforcementFacadeInputValue();
      this.getIntermediateTransomFacadeInputValue();
      this.getIntermediateMullionFacadeInputValue();
      this.getUDCFramingDepthInputValue();
      this.ProfileColorInputValue();
      this.getDoorLeafActiveInputValue();
      this.getDoorLeafPassiveInputValue();
      this.getSillProfileFixedInputValue();
      this.getSillProfileBottomInputValue();
      this.getInterlockInputValue();
      this.getReinforcementSliding();
      this.getDoubleVentInputValue();
      this.getStructuralProfileInpuValue();
    }, 100);
  }

  ngOnInit(): void {
    //this is used to load data in leftPanel and call all child components to load data
    this.loadFraming();
    if(this.unified3DModel.ProblemSetting.ProductType!=='Facade'){
      this.getOuterFrameInputValue();
    }
  }


  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  loadFraming() {
    this.language = this.configureService.getLanguage();
    if (!this.unified3DModel.ModelInput.FrameSystem) {
      this.unified3DModel.ModelInput.FrameSystem = new FrameSystem();
      this.unified3DModel.ModelInput.FrameSystem.SystemType = this.fwsSystemDesc2[this.systemSelected];  // Pending wei answer
      this.unified3DModel.ModelInput.FrameSystem.InsulationZone = this.fwsSystemZone[this.systemSelected];  // Pending wei answer
      this.unified3DModel.ModelInput.FrameSystem.UvalueType = this.gasketSelection;
      this.unified3DModel.ModelInput.FrameSystem.InsulationType = this.insulatingSelection;
    }
    else {
      if (this.unified3DModel.ProblemSetting.ProductType == "Window") {
        if (this.showDoorArticles) {
          this.unified3DModel.ModelInput.FrameSystem.SystemType = "ADS 75"
          this.systemSelected = Math.max(0, this.adsSystemDesc.indexOf(this.unified3DModel.ModelInput.FrameSystem.SystemType));
          this.systemType = this.adsSystemValue[this.systemSelected] && this.adsSystemValue[this.systemSelected].includes('90') ? '90' : '75';
        } else {
          this.systemSelected = Math.max(0, this.awsSystemDesc.indexOf(this.unified3DModel.ModelInput.FrameSystem.SystemType));
          this.systemType = this.awsSystemValue[this.systemSelected] && this.awsSystemValue[this.systemSelected].includes('90') ? '90' : '75';
        }
      }
      else if (this.unified3DModel.ProblemSetting.ProductType == "Facade" && this.unified3DModel.ProblemSetting.FacadeType == 'mullion-transom') {
        this.systemSelected = this.unified3DModel.ModelInput.FrameSystem.InsulationZone === "" ? Math.max(0, this.fwsSystemDesc.indexOf(this.unified3DModel.ModelInput.FrameSystem.SystemType)) : Math.max(0, this.fwsSystemDesc.indexOf(this.unified3DModel.ModelInput.FrameSystem.SystemType + '.' + this.unified3DModel.ModelInput.FrameSystem.InsulationZone));
      }
      else if (this.unified3DModel.ProblemSetting.ProductType == "Facade" && this.unified3DModel.ProblemSetting.FacadeType == 'UDC') {
        //TODO-RAMA: Check if we need this
        this.systemSelected = this.unified3DModel.ModelInput.FrameSystem.InsulationZone === "" ? Math.max(0, this.udcSystemDesc.indexOf(this.unified3DModel.ModelInput.FrameSystem.SystemType)) : Math.max(0, this.udcSystemDesc.indexOf(this.unified3DModel.ModelInput.FrameSystem.SystemType + '.' + this.unified3DModel.ModelInput.FrameSystem.InsulationZone));
        this.verticalJointWidth = this.unified3DModel.ModelInput.FrameSystem.VerticalJointWidth.toString();
        this.horizontalJointWidth = this.unified3DModel.ModelInput.FrameSystem.HorizontalJointWidth.toString();
      }
      else if (this.unified3DModel.ProblemSetting.ProductType == "SlidingDoor") {
        this.systemSelected = Math.max(0, this.aseSystemDesc.indexOf(this.unified3DModel.ModelInput.FrameSystem.SystemType));
        this.systemType = this.aseSystemValue[this.systemSelected]
      }
      this.gasketSelection = this.unified3DModel.ModelInput.FrameSystem.UvalueType;
      this.insulatingSelection = this.unified3DModel.ModelInput.FrameSystem.InsulationType;
      if (this.unified3DModel.ProblemSetting.ProductType == "Window") {
        this.cpService.setCurrent({ ArticleID: this.unified3DModel.ModelInput.Geometry.Sections.filter(section => section.SectionID == 1)[0].ArticleName }, PanelsModule.OuterFrame);
        this.cpService.setCurrent({ ArticleID: this.unified3DModel.ModelInput.Geometry.Sections.filter(section => section.SectionID == 2)[0].ArticleName }, PanelsModule.Mullion);
        this.cpService.setCurrent({ ArticleID: this.unified3DModel.ModelInput.Geometry.Sections.filter(section => section.SectionID == 3)[0].ArticleName }, PanelsModule.Transom);

      }
      else if (this.unified3DModel.ProblemSetting.ProductType == "Facade" && this.unified3DModel.ProblemSetting.FacadeType == 'mullion-transom') {
        if (this.unified3DModel.ModelInput.Geometry.FacadeSections) {
          this.cpService.setCurrent({ ArticleID: this.unified3DModel.ModelInput.Geometry.FacadeSections.filter(section => section.SectionID == 1)[0].ArticleName }, PanelsModule.MullionFacade);
          this.cpService.setCurrent({ ArticleID: this.unified3DModel.ModelInput.Geometry.FacadeSections.filter(section => section.SectionID == 2)[0].ArticleName }, PanelsModule.TransomFacade);
          this.cpService.setCurrent({ ArticleID: this.unified3DModel.ModelInput.Geometry.FacadeSections.filter(section => section.SectionID == 3)[0].ArticleName }, PanelsModule.IntermediateMullionFacade);
        }
      }
      else if (this.unified3DModel.ProblemSetting.ProductType == "Facade" && this.unified3DModel.ProblemSetting.FacadeType == 'UDC') {
        if (this.unified3DModel.ModelInput.Geometry.FacadeSections) {
          if (this.unified3DModel.ModelInput.Geometry.FacadeSections.filter(section => section.SectionID == 4) && this.unified3DModel.ModelInput.Geometry.FacadeSections.filter(section => section.SectionID == 4).length > 0)
            this.cpService.setCurrent({ ArticleID: this.unified3DModel.ModelInput.Geometry.FacadeSections.filter(section => section.SectionID == 4)[0].ArticleName }, PanelsModule.IntermediateMullionFacade);
          if (this.unified3DModel.ModelInput.Geometry.FacadeSections.filter(section => section.SectionID == 5) && this.unified3DModel.ModelInput.Geometry.FacadeSections.filter(section => section.SectionID == 5).length > 0)
            this.cpService.setCurrent({ ArticleID: this.unified3DModel.ModelInput.Geometry.FacadeSections.filter(section => section.SectionID == 5)[0].ArticleName }, PanelsModule.IntermediateTransomFacade);
          if (this.unified3DModel.ModelInput.Geometry.FacadeSections.filter(section => section.SectionID == 1) && this.unified3DModel.ModelInput.Geometry.FacadeSections.filter(section => section.SectionID == 1).length > 0)
            this.cpService.setCurrent({ ArticleID: this.unified3DModel.ModelInput.Geometry.FacadeSections.filter(section => section.SectionID == 1)[0].ArticleName }, PanelsModule.UDCFramingFacade);
        }
      }
    }

    if (this.unified3DModel.ProblemSetting.ProductType == "Window") {
      if (this.showDoorArticles) {
        this.systemSelectedEvent.emit(this.adsSystemValue[this.systemSelected]);
        this.cpService.setSystem(this.cpService.SystemData("ADS")[this.systemSelected], "FRAMING");
      } else {
        this.systemSelectedEvent.emit(this.awsSystemValue[this.systemSelected]);
        this.cpService.setSystem(this.cpService.SystemData("AWS")[this.systemSelected], "FRAMING");
      }
    }
    if (this.systemFacadeSelectedFromFramingEvent && this.unified3DModel.ProblemSetting.ProductType == "Facade" && this.unified3DModel.ProblemSetting.FacadeType == 'mullion-transom') {
      this.systemFacadeSelectedFromFramingEvent.emit(this.fwsSystemDesc2[this.systemSelected]);
      this.cpService.setSystem(this.cpService.SystemData("FWS")[this.systemSelected], "FRAMING");
      this.appliedMullionReinforcement = [];
      if (this.unified3DModel.ModelInput.Geometry.Reinforcements) {
        this.unified3DModel.ModelInput.Geometry.Reinforcements.forEach(element => {
          if (element) {
            this.appliedMullionReinforcement.push(element.MemberID);
          }
        });
      }
      if (this.appliedMullionReinforcement.length > 0)
        this.switchReinforcement = true;
    }
    if (this.systemFacadeSelectedFromFramingEvent && this.unified3DModel.ProblemSetting.ProductType == "Facade" && this.unified3DModel.ProblemSetting.FacadeType == 'UDC') {
      this.systemFacadeSelectedFromFramingEvent.emit(this.udcSystemDesc2[this.systemSelected]);
      this.cpService.setSystem(this.cpService.SystemData("UDC")[this.systemSelected], "FRAMING");
    }

    if (this.unified3DModel.ModelInput.Geometry.OperabilitySystems)
      this.unified3DModel.ModelInput.Geometry.OperabilitySystems.map(glass => glass.VentArticleName).forEach(VentArticleName => {
        if (VentArticleName) {
          this.cpService.setCurrent({ VentArticleName: VentArticleName }, PanelsModule.VentFrame)
        }
      });

    if (this.unified3DModel.ModelInput.Geometry.DoorSystems) {
      this.unified3DModel.ModelInput.Geometry.DoorSystems.map(glass => glass.DoorLeafArticleName).forEach(DoorLeafArticleName => {
        if (DoorLeafArticleName) {
          this.cpService.setCurrent({ DoorLeafArticleName: DoorLeafArticleName }, PanelsModule.DoorLeafActive);
        }
      });

      this.unified3DModel.ModelInput.Geometry.DoorSystems.map(glass => glass.DoorPassiveJambArticleName).forEach(DoorPassiveJambArticleName => {
        if (DoorPassiveJambArticleName) {
          this.cpService.setCurrent({ DoorPassiveJambArticleName: DoorPassiveJambArticleName }, PanelsModule.DoorLeafPassive);
        }
      });

      this.unified3DModel.ModelInput.Geometry.DoorSystems.map(glass => glass.DoorSillArticleName).forEach(DoorSillArticleName => {
        if (DoorSillArticleName) {
          this.cpService.setCurrent({ DoorSillArticleName: DoorSillArticleName }, PanelsModule.SillProfileBottom);
        }
      });

      this.unified3DModel.ModelInput.Geometry.DoorSystems.map(glass => glass.DoorSidelightSillArticleName).forEach(DoorSidelightSillArticleName => {
        if (DoorSidelightSillArticleName) {
          this.cpService.setCurrent({ DoorSidelightSillArticleName: DoorSidelightSillArticleName }, PanelsModule.SillProfileFixed);
        }
      });

    }


    if (this.unified3DModel.ProblemSetting.EnableStructural) {
      if (!this.unified3DModel.ModelInput.FrameSystem) {
        this.unified3DModel.ModelInput.FrameSystem = new FrameSystem();
      }
    }
    if (this.isFramingActive) {
      this.loadJSONService({ resetCamera: false, Unified3DModel: this.unified3DModel, canBeDrawn: this.canBeDrawnBool });
      this.unified3DModelEvent.emit(this.unified3DModel);
    }
    for (const key in this.validateForm.controls) {
      this.validateForm.controls[key].markAsDirty();
      this.validateForm.controls[key].markAsTouched();
      this.validateForm.controls[key].updateValueAndValidity();
    }
    for (const key in this.validateFormForFacadeUDC.controls) {
      this.validateFormForFacadeUDC.controls[key].markAsDirty();
      this.validateFormForFacadeUDC.controls[key].markAsTouched();
      this.validateFormForFacadeUDC.controls[key].updateValueAndValidity();
    }
  }

  getOuterFrameInputValue() {
    this.outerFrameInputValue = this.umService.get_OuterFrame();
  }

  getBottomOuterFrameInputValue() {
    this.bottomOuterFrameInputValue = this.umService.get_BottomOuterFrame();
  }

  getDoubleVentInputValue() {
    let doubleVentArticleName = this.umService.get_DoubleVentFrame();
    if (doubleVentArticleName) {
      this.collect_ASE_ArticlesData(this.aseSystemValue[this.systemSelected]);
      if (this.doubleVentArticleData.length > 0) {
        let articleIndex = this.doubleVentArticleData.map(article => article.ArticleName).indexOf(doubleVentArticleName);
        if (articleIndex == -1) articleIndex = 0;
        this.doubleVentInputValue = doubleVentArticleName + ' - ' + this.doubleVentArticleData[articleIndex].InsideW.toString() + ' / ' + this.doubleVentArticleData[articleIndex].OutsideW.toString();
      } else {
        this.doubleVentInputValue = '';
      }
    }
  }

  getStructuralProfileInpuValue() {
    let structuralProfileArticleName = this.umService.get_StucturalProfile();
    if (structuralProfileArticleName) {
      this.collect_ASE_ArticlesData(this.aseSystemValue[this.systemSelected]);
      if (this.structuralProfileArticleData && this.structuralProfileArticleData.length > 0) {
        let articleIndex = this.structuralProfileArticleData.map(article => article.ArticleName).indexOf(structuralProfileArticleName);
        if (articleIndex == -1) articleIndex = 0;
        this.structuralProfileInputValue = structuralProfileArticleName + ' - ' + this.structuralProfileArticleData[articleIndex].InsideW.toString() + ' / ' + this.structuralProfileArticleData[articleIndex].OutsideW.toString();
      } else {
        this.structuralProfileInputValue = '';
      }
    }
  }

  getVentFrameInputValue() {
    this.ventFrameInputValue = this.umService.get_VentFrame();
  }

  getInterlockInputValue() {
    this.interlockInputValue = this.umService.get_Interlock();
  }

  getReinforcementSliding() {
    let dataReinforcementSliding;  // article from the unified model & boolean is there reinforcement ?
    dataReinforcementSliding = this.umService.get_Reinforcement();
    if (dataReinforcementSliding) {
      this.addReinforcementBool = dataReinforcementSliding.bool;
      this.collect_ASE_ArticlesData(this.aseSystemValue[this.systemSelected]);
      if (dataReinforcementSliding.bool && this.reinforcementArticleData && this.reinforcementArticleData.length > 0) {
        let articleIndex = this.reinforcementArticleData.map(article => article.ArticleName).indexOf(dataReinforcementSliding.SteelTube);
        if (articleIndex == -1) articleIndex = 0;
        this.reinforcementInputValue = dataReinforcementSliding.SteelTube + ' - ' + this.reinforcementArticleData[articleIndex].InsideW.toString() + ' / ' + this.reinforcementArticleData[articleIndex].OutsideW.toString();
      } else {
        this.reinforcementInputValue = '';
      }
    }
  }

  collect_ASE_ArticlesData(system: string) {
    if (system.includes("ase")) {
      if (localStorage.getItem('reinforcement_' + system)) {
        this.reinforcementArticleData = JSON.parse(localStorage.getItem('reinforcement_' + system)).filter(article => article.System == this.aseSystemDesc[this.systemSelected] && article.SRS == 1 && article.ProfileType == "Steel Tube");
        this.doubleVentArticleData = JSON.parse(localStorage.getItem('reinforcement_' + system)).filter(article => article.System == this.aseSystemDesc[this.systemSelected] && article.SRS == 1 && article.ProfileType == "Double-Vent Profile");
        this.structuralProfileArticleData = JSON.parse(localStorage.getItem('reinforcement_' + system)).filter(article => article.System == this.aseSystemDesc[this.systemSelected] && article.SRS == 1 && article.ProfileType == "Structural Profile");
      } else {
        this.fService.getASEArticlesList(system).pipe(takeUntil(this.destroy$)).subscribe(data => {
          localStorage.setItem('reinforcement_' + system, data);
          this.reinforcementArticleData = JSON.parse(data).filter(article => article.System == this.aseSystemDesc[this.systemSelected] && article.SRS == 1 && article.ProfileType == "Steel Tube");
          this.doubleVentArticleData = JSON.parse(data).filter(article => article.System == this.aseSystemDesc[this.systemSelected] && article.SRS == 1 && article.ProfileType == "Double-Vent Profile");
          this.structuralProfileArticleData = JSON.parse(data).filter(article => article.System == this.aseSystemDesc[this.systemSelected] && article.SRS == 1 && article.ProfileType == "Structural Profile");
        });
      }
    }
  }


  getMullionFrameInputValue() {
    this.mullionInputValue = this.umService.get_Mullion();
  }

  getTransomFrameInputValue() {
    this.transomInputValue = this.umService.get_Transom();
  }

  getProfileColorInputValue() {
    this.profileColorInputValue = this.umService.get_ProfileColor();
  }

  getReinforcementFacadeInputValue() {
    // if (this.unified3DModel.ModelInput.Geometry.Sections) {
    //   let sec = this.unified3DModel.ModelInput.Geometry.Sections.filter(f => f.SectionID == 3 && f.SectionType == 3)[0];
    //   if (sec)
    //   this.mullionInputValue = sec.ArticleName + ' - ' + sec.InsideW.toString() + ' / ' + sec.OutsideW.toString();
    // }
  }
  ReinforcementFacadeUpdated(data: any) {
    if (data) {
      if (JSON.stringify(this.ReinforcementMullionInputArticle) !== JSON.stringify(data)) {
        if (this.isSameProblem) this.configureService.computeClickedSubject.next(false);
      }
      this.ReinforcementMullionInputArticle = data;
      let article = this.ReinforcementMullionInputArticle.article;
      if (article) {
        if (this.mullionReinforcementTypeHeading !== article.value.toString()) {
          this.mullionReinforcementTypeHeading = article.value.toString();
          setTimeout(() => {
            this.onApplyReinforcement();
          }, 100);
        }
      }
      else {
        this.switchReinforcement = false;
        this.mullionReinforcementTypeHeading = null;
        this.appliedMullionReinforcement.forEach(reinforcementId => {
          this.onDeleteReinforcement(reinforcementId);
        });
        this.appliedMullionReinforcement = [];
      }
    }
  }

  getMullionFacadeInputValue() {
    if (this.unified3DModel.ModelInput.Geometry.FacadeSections) {
      let sec = this.unified3DModel.ModelInput.Geometry.FacadeSections.filter(section => section.SectionID == 1)[0];
      if (sec)
        this.mullionDepthInputValue = sec.ArticleName + ' - ' + sec.Depth.toString();
    }
  }

  getTransomFacadeInputValue() {
    if (this.unified3DModel.ModelInput.Geometry.FacadeSections) {
      let sec = this.unified3DModel.ModelInput.Geometry.FacadeSections.filter(section => section.SectionID == 2)[0];
      if (sec)
        this.transomDepthInputValue = sec.ArticleName + ' - ' + sec.Depth.toString();
    }
  }

  getIntermediateTransomFacadeInputValue() {
    if (this.unified3DModel.ModelInput.Geometry.FacadeSections) {
      let sec = this.unified3DModel.ModelInput.Geometry.FacadeSections.filter(section => section.SectionID == 5)[0];
      if (sec)
        this.intermediateTransomDepthInputValue = sec.ArticleName + ' - ' + sec.Depth.toString();
    }
  }

  getIntermediateMullionFacadeInputValue() {
    if (this.unified3DModel.ProblemSetting.ProductType == "Facade" && this.unified3DModel.ModelInput.Geometry.FacadeSections) {
      if (this.unified3DModel.ProblemSetting.FacadeType == 'mullion-transom') {
        let sec = this.unified3DModel.ModelInput.Geometry.FacadeSections.filter(section => section.SectionID == 3)[0];
        if (sec)
          this.intermediateMullionDepthInputValue = sec.ArticleName + ' - ' + sec.Depth.toString();
      }
      else if (this.unified3DModel.ProblemSetting.FacadeType == 'UDC') {
        let sec = this.unified3DModel.ModelInput.Geometry.FacadeSections.filter(section => section.SectionID == 4)[0];
        if (sec)
          this.intermediateMullionDepthInputValue = sec.ArticleName + ' - ' + sec.Depth.toString();
      }
    }
  }

  getUDCFramingDepthInputValue() {
    if (this.unified3DModel.ProblemSetting.ProductType == "Facade" && this.unified3DModel.ModelInput.Geometry.FacadeSections) {
      let sec1 = this.unified3DModel.ModelInput.Geometry.FacadeSections.filter(section => section.SectionID == 1)[0];
      this.UDCFramingDepthInputArticle = sec1.ArticleName + ' - ' + sec1.Depth.toString();

      let sec2 = this.unified3DModel.ModelInput.Geometry.FacadeSections.filter(section => section.SectionID == 2)[0];
      this.UDCFramingDepthInputArticle = sec2.ArticleName + ' - ' + sec2.Depth.toString();

      if (this.unified3DModel.ModelInput.FrameSystem.HorizontalJointWidth < 20) {
        var sec3 = this.unified3DModel.ModelInput.Geometry.FacadeSections.filter(section => section.SectionID == 3)[0];
        this.UDCFramingInputValue = sec3.ArticleName + ' - ' + sec3.Depth.toString();
      }
    }
  }

  getDoorLeafActiveInputValue() {
    this.doorLeafActiveValue = this.umService.get_DoorLeafActive();
  }
  getDoorLeafPassiveInputValue() {
    this.doorLeafPassiveValue = this.umService.get_DoorLeafPassive();
  }
  getSillProfileFixedInputValue() {
    this.sillProfileFixedValue = this.umService.get_SillProfileFixed();
  }
  getSillProfileBottomInputValue() {
    this.sillProfileBottomValue = this.umService.get_SillProfileBottom();
  }

  ProfileColorInputValue() {
    //....
  }
  ProfileColorUpdated(data: any) {
    if (this.permissionService.checkPermission(Feature.ProfileColor)) {
      this.ProfileColorFromChild = data;
      if (this.ProfileColorFromChild && this.ProfileColorFromChild.Description) {
        if (this.profileColorInputValue != this.ProfileColorFromChild.Description)
          this.configureService.computeClickedSubject.next(false);
        this.profileColorInputValue = this.ProfileColorFromChild.Description;
        let color: any;
        let ralNumber: any;
        ralNumber = this.profileColorInputValue.toLowerCase().trim().substr(this.profileColorInputValue.toLowerCase().trim().length - 4);
        switch (ralNumber) {
          case '7001':
            color = "#8c969d";
            break;
          case '9016':
            color = "#f1f0ea";
            break;
          case '9005':
            color = "#0e0e10";
            break;
          case '7016':
            color = "#383e42";
            break;
          case '8022':
            color = "#1a1718";
            break;
          default:
            color = "#f1f0ea";
            break;
        }
        this.onProfileColorChange(true);
      }
    }
  }

  ngOnChanges(Changes: SimpleChanges) {
    if (Changes && this.unified3DModel) {
      if (Changes.problemGuid &&
        ((Changes.problemGuid.currentValue && Changes.problemGuid.previousValue && Changes.problemGuid.previousValue != Changes.problemGuid.currentValue))) {
        this.isSameProblem = false;
      }
      
      this.showVent = this.unified3DModel.ModelInput.Geometry.OperabilitySystems && this.unified3DModel.ModelInput.Geometry.OperabilitySystems.length > 0 && this.unified3DModel.ModelInput.Geometry.DoorSystems === null;
      this.showDoorArticles = this.unified3DModel.ModelInput.Geometry.DoorSystems && this.unified3DModel.ModelInput.Geometry.DoorSystems.filter(glass => glass.DoorSystemID > 0 && glass.DoorLeafArticleName !== "-1").length > 0;
      if (this.unified3DModel.ModelInput.Geometry.DoorSystems && this.unified3DModel.ModelInput.Geometry.DoorSystems.length > 0) {
        if (this.unified3DModel.ModelInput.Geometry.DoorSystems[0].DoorSystemType.includes('Single')) {
          this.isSingleDoor = true;
        } else {
          this.isSingleDoor = false;
        }
        if (this.unified3DModel.ModelInput.Geometry.DoorSystems[0].DoorSystemType.includes('Double')) {
          this.isDoubleDoor = true;
        } else {
          this.isDoubleDoor = false;
        }

      }

      if (Changes.unified3DModel) {
        if (Changes.unified3DModel.currentValue &&
          (Changes.unified3DModel.previousValue
            && (Changes.unified3DModel.currentValue.ProblemSetting.ProblemGuid != Changes.unified3DModel.previousValue.ProblemSetting.ProblemGuid))
          || (!Changes.unified3DModel.previousValue && Changes.unified3DModel.firstChange)) { // called when reload the page and change problem from right panel
          this.unified3DModel = Changes.unified3DModel.currentValue;
        }

        if (Changes.unified3DModel.currentValue) {
          var refresh3DModel = false;
          this.showIntermediateMullionDepth = this.unified3DModel.ModelInput.Geometry.Members.filter(f => f.SectionID === 3 && f.MemberType == 6).length > 0;
          this.showIntermediateTransomDepth = this.unified3DModel.ModelInput.Geometry.Members.filter(f => f.SectionID === 3 && f.MemberType == 6).length > 0;
          this.showDoorArticles = this.showDoorArticles = this.unified3DModel.ModelInput.Geometry.DoorSystems && this.unified3DModel.ModelInput.Geometry.DoorSystems.filter(glass => glass.DoorSystemID > 0 && glass.DoorLeafArticleName !== "-1").length > 0;
          if (this.showDoorArticles) {
            let sectionClass: Section = new Section();


            sectionClass.SectionID = 33;
            sectionClass.SectionType = 33;
            if (this.SillProfileFixedInputArticle) {
              sectionClass.ArticleName = this.SillProfileFixedInputArticle.ArticleName;
              sectionClass.InsideW = this.SillProfileFixedInputArticle.InsideW;
              sectionClass.OutsideW = this.SillProfileFixedInputArticle.OutsideW;
            }
            sectionClass.DistBetweenIsoBars = 16;
            sectionClass.Depth = -75;

            
            if (this.unified3DModel.ModelInput.Geometry.Sections && this.unified3DModel.ModelInput.Geometry.Sections.filter(x => x.SectionID === 33).length === 0) refresh3DModel = true;
            this.sectionClassArray[3] = sectionClass;
            this.sectionClassArrayFilledBool[3] = true;

            let sectionClass1: Section = new Section();
            sectionClass1.SectionID = 31;
            sectionClass1.SectionType = 31;
            sectionClass1.ArticleName = "100000";
            sectionClass1.InsideW = 0;
            sectionClass1.OutsideW = 0;
            sectionClass1.DistBetweenIsoBars = 0;
            sectionClass1.Depth = 0;

            if (this.unified3DModel.ModelInput.Geometry.Sections && this.unified3DModel.ModelInput.Geometry.Sections.filter(x => x.SectionID === 31).length === 0) refresh3DModel = true;
            this.sectionClassArray[4] = sectionClass1;
            this.sectionClassArrayFilledBool[4] = true;

            if (this.sectionClassArrayFilledBool[0] && this.sectionClassArrayFilledBool[1] && this.sectionClassArrayFilledBool[2] && this.sectionClassArrayFilledBool[3] && this.sectionClassArrayFilledBool[4]) {
              if (!this.unified3DModel.ModelInput.Geometry) { this.unified3DModel.ModelInput.Geometry = new Geometry(); }
              if (!this.unified3DModel.ModelInput.Geometry.Sections) { this.unified3DModel.ModelInput.Geometry.Sections = new Array<Section>(); }
              if (this.unified3DModel.ProblemSetting.ProductType == "Window") {
                this.unified3DModel.ModelInput.Geometry.Sections = this.sectionClassArray;
                this.unified3DModel.ModelInput.FrameSystem.SystemType = this.adsSystemDesc[this.systemSelected];
                this.systemSelected = Math.max(0, this.adsSystemDesc.indexOf(this.unified3DModel.ModelInput.FrameSystem.SystemType));
                this.systemType = this.adsSystemValue[this.systemSelected] && this.adsSystemValue[this.systemSelected].includes('90') ? '90' : '75';
                this.systemSelectedEvent.emit(this.adsSystemValue[this.systemSelected])
                this.cpService.setSystem(this.cpService.SystemData("ADS")[this.systemSelected], "FRAMING");
                if (refresh3DModel) {
                  this.loadJSONService({ resetCamera: false, Unified3DModel: this.unified3DModel, canBeDrawn: this.canBeDrawnBool });
                  this.unified3DModelEvent.emit(this.unified3DModel);
                }
              }
            }
          } else if (this.unified3DModel.ProblemSetting.ProductType == "SlidingDoor") {
            this.systemSelected = Math.max(0, this.aseSystemDesc.indexOf(this.unified3DModel.ModelInput.FrameSystem.SystemType));
            this.systemType = this.aseSystemValue[this.systemSelected] && this.aseSystemValue[this.systemSelected].includes('60') ? '60' : '80';
            this.systemSelectedEvent.emit(this.aseSystemValue[this.systemSelected]);
            this.cpService.setSystem(this.cpService.SystemData("ASE")[this.systemSelected], "FRAMING");
          }
          else {
            if (this.unified3DModel.ModelInput.Geometry.Sections && this.unified3DModel.ModelInput.Geometry.Sections[3] && (this.unified3DModel.ModelInput.Geometry.Sections[3].ArticleName === undefined || this.unified3DModel.ModelInput.Geometry.Sections[3].ArticleName === null)) {
              this.unified3DModel.ModelInput.Geometry.Sections.splice(3, 2);
            }
            this.systemSelected = Math.max(0, this.awsSystemDesc.indexOf(this.unified3DModel.ModelInput.FrameSystem.SystemType));
            this.systemType = this.awsSystemValue[this.systemSelected] && this.awsSystemValue[this.systemSelected].includes('90') ? '90' : '75';
            this.systemSelectedEvent.emit(this.awsSystemValue[this.systemSelected]);
            this.cpService.setSystem(this.cpService.SystemData("AWS")[this.systemSelected], "FRAMING");
          }

          if (Changes.unified3DModel.previousValue) {
            if (Changes.unified3DModel.currentValue.ProblemSetting.ProblemGuid !== Changes.unified3DModel.previousValue.ProblemSetting.ProblemGuid)
              this.loadFraming();
            else if (this.applicationType == 'BPS') {
              this.loadFraming();
            }
          }
        }

        if (Changes.unified3DModel.currentValue &&
          (Changes.unified3DModel.previousValue
            && (Changes.unified3DModel.currentValue.ProblemSetting.ProblemGuid != Changes.unified3DModel.previousValue.ProblemSetting.ProblemGuid))
          || (!Changes.unified3DModel.previousValue && Changes.unified3DModel.firstChange)) { // called when reload the page and change problem from right panel
          // added the below lines to update the Profile Color whenever changes in the child component
          if (this.unified3DModel.ProblemSetting.ProductType == "Window") {
            if (this.unified3DModel.ModelInput.FrameSystem.AluminumColor)
              this.profileColorInputValue = this.unified3DModel.ModelInput.FrameSystem.AluminumColor;
            if (this.permissionService.checkPermission(Feature.ProfileColor))
              this.cpService.setCurrent(this.profileColorInputValue, PanelsModule.ProfileColor);
          }

        }

        this.showIntermediateMullionDepth = this.unified3DModel.ModelInput.Geometry.Members.filter(f => f.SectionID === 3 && f.MemberType == 6).length > 0;
        this.showIntermediateTransomDepth = this.unified3DModel.ModelInput.Geometry.Members.filter(f => f.SectionID === 3 && f.MemberType == 6).length > 0;
        this.showMullion = this.unified3DModel.ModelInput.Geometry.Members.map(members => members.MemberType).includes(2);
        this.showTransom = this.unified3DModel.ModelInput.Geometry.Members.map(members => members.MemberType).includes(3);
      }
      if (Changes.event3D && !Changes.event3D.firstChange) {
        switch (Changes.event3D.currentValue.eventType) {
          case "selectMajorMullion":
            this.selectedMajorMullionIDs = this.event3D.value.selectedMajorMullionIDs;
            break;
          case "selectReinforcement":
            this.selectedReinforcementIds = this.event3D.value.selectedReinforcementIDs;
            break;
        }
      }
    }
  }
  buildFramingSection(inputArticle: any, tfsections: any, isUDCFramingUpdate = false): string {
    var inputString = '';
    let article = inputArticle.article;
    let isCustomed = inputArticle.isCustomed;
    if (this.unified3DModel.ProblemSetting.ProductType == "Facade" && this.unified3DModel.ProblemSetting.FacadeType == 'UDC') {
      if (isCustomed && article) {
        inputString = article.ArticleName + ' - ' + article.Depth; // + ' / ' + article.Width.toString();
        if (tfsections) {
          tfsections.isCustomProfile = article.isCustomProfile;
          tfsections.ArticleName = article.ArticleName.toString();

          tfsections.OutsideW = article.OutsideW;

          tfsections.Depth = article.Depth;
          tfsections.Width = article.Width;
          tfsections.BTDepth = article.BTDepth;

          tfsections.Weight = article.Weight;
          tfsections.A = article.A;
          tfsections.Iyy = article.Iyy;
          tfsections.Izz = article.Izz;
          tfsections.Asy = article.Asy;
          tfsections.Asz = article.Asz;
          tfsections.J = article.J;
          tfsections.E = article.E;
          tfsections.G = article.G;
          tfsections.EA = article.EA;
          tfsections.GAsy = article.GAsy;
          tfsections.GAsz = article.GAsz;
          tfsections.EIy = article.EIy;
          tfsections.EIz = article.EIz;
          tfsections.GJ = article.GJ;
          tfsections.Zo = article.Zo;
          tfsections.Zu = article.Zu;
          tfsections.Zl = article.Zl;
          tfsections.Zr = article.Zr;
          tfsections.Material = article.Material;
          tfsections.beta = article.beta;
          tfsections.Wyy = article.Wyy;
          tfsections.Wzz = article.Wzz;
        }
      }
      else if (article) {
        inputString = article.transomArticleId + ' - ' + article.transomDepth; // + ' / ' + article.OutsideDimension.toString();
        tfsections.ArticleName = article.transomArticleId.toString();
        tfsections.Depth = article.transomDepth;

        tfsections.transomArticleId = article.ArticleName;
        tfsections.Name = article.ArticleName;
        tfsections.Description = article.ArticleName;
        tfsections.isCustomProfile = isCustomed;
        if (tfsections.SectionId === 1) {

        }
      }
      if (article && this.unified3DModel.ModelInput.Geometry.FacadeSections && !isUDCFramingUpdate) {
        if (!this.unified3DModel.ModelInput.Thermal) { this.unified3DModel.ModelInput.Thermal = new Thermal(); }
        this.unified3DModel.ModelInput.Thermal.InsulationZone = this.unified3DModel.ModelInput.FrameSystem.InsulationZone;
        this.lc.loadDisplaySetting_ActivePanel();
      }
    }
    return inputString;
  }
  isSystemSelectionChanged: boolean = false;
  systemType: string = "75";
  language: string = '';
  onSelectSystemWindow(index: number): void {
    let isValueChanged = false;
    if (this.systemSelected != index) {
      this.systemType = this.awsSystemValue[index].includes('90') ? '90' : '75';
      if (!this.insulatingSelection)
        this.insulatingSelection = 'Polyamide Anodized After';
      else if ((this.awsSystemValue[index].includes('90') && (this.insulatingSelection != 'Polyamide Coated After' && this.insulatingSelection != 'Polyamide Anodized After')))
        this.insulatingSelection = 'Polyamide Anodized After';
      isValueChanged = true;
      this.isSystemSelectionChanged = true;
      this.configureService.computeClickedSubject.next(false);
      this.cpService.setCurrent(undefined, PanelsModule.OuterFrame);
      this.cpService.setCurrent(undefined, PanelsModule.Transom);
      this.cpService.setCurrent(undefined, PanelsModule.Mullion);

      this.systemSelectedEvent.emit(this.awsSystemValue[index]);  // send event framing > left-configure > configure >  iFrame > tables
      this.cpService.setSystem(this.cpService.SystemData("AWS")[index], "FRAMING");
    }
    this.systemSelected = index;
    this.onCloseFramingPopoutsEvent.emit();   // send event framing > left-configure > configure >  iFrame > tables. It closes all framing tables
    if (!this.unified3DModel.ModelInput.FrameSystem) { this.unified3DModel.ModelInput.FrameSystem = new FrameSystem(); }
    this.unified3DModel.ModelInput.FrameSystem.SystemType = this.awsSystemDesc[this.systemSelected];
    this.unified3DModel.ModelInput.Geometry.Infills.forEach(glass => {
      if (this.unified3DModel.ModelInput.Geometry.OperabilitySystems)
        this.unified3DModel.ModelInput.Geometry.OperabilitySystems.forEach(os => {
          if (glass.OperabilitySystemID === os.OperabilitySystemID && os.VentArticleName && os.VentArticleName !== '-1') {
            glass.InsertWindowSystem = this.awsSystemValue[this.systemSelected];
            os.InsertedWindowType = this.awsSystemDesc[this.systemSelected];
          }
        });

    });
    this.unified3DModelEvent.emit(this.unified3DModel);
    this.loadJSONService({ resetCamera: false, Unified3DModel: this.unified3DModel, canBeDrawn: this.canBeDrawnBool });
  }

  onSelectSystemFacade(index: number): void {
    //this.isSystemFacadeChanged = 2;
    if (this.systemSelected != index) {
      this.configureService.computeClickedSubject.next(false);
      this.cpService.setCurrent(undefined, PanelsModule.MullionFacade);
      this.cpService.setCurrent(undefined, PanelsModule.TransomFacade);
      this.cpService.setCurrent(undefined, PanelsModule.IntermediateMullionFacade);
      if (this.systemFacadeSelectedFromFramingEvent && this.unified3DModel.ProblemSetting.ProductType == "Facade" && this.unified3DModel.ProblemSetting.FacadeType == 'mullion-transom') {
        this.systemFacadeSelectedFromFramingEvent.emit(this.fwsSystemDesc2[index]);
        this.cpService.setSystem(this.cpService.SystemData("FWS")[index], "FRAMING");
      }
      else if (this.systemFacadeSelectedFromFramingEvent && this.unified3DModel.ProblemSetting.ProductType == "Facade" && this.unified3DModel.ProblemSetting.FacadeType == 'UDC') {
        this.systemFacadeSelectedFromFramingEvent.emit(this.udcSystemDesc2[index]);
        this.cpService.setSystem(this.cpService.SystemData("UDC")[index], "FRAMING");
      }
      this.onCloseFramingPopoutsEvent.emit();
    }
    this.systemSelected = index;
    if (!this.unified3DModel.ModelInput.FrameSystem) { this.unified3DModel.ModelInput.FrameSystem = new FrameSystem(); }
    if (this.unified3DModel.ProblemSetting.ProductType == "Facade" && this.unified3DModel.ProblemSetting.FacadeType == 'mullion-transom') {
      this.unified3DModel.ModelInput.FrameSystem.SystemType = this.fwsSystemDesc2[this.systemSelected];  // Pending wei answer
      this.unified3DModel.ModelInput.FrameSystem.InsulationZone = this.fwsSystemZone[this.systemSelected];  // Pending wei answer
    }
    else if (this.unified3DModel.ProblemSetting.ProductType == "Facade" && this.unified3DModel.ProblemSetting.FacadeType == 'UDC') {
      this.unified3DModel.ModelInput.FrameSystem.SystemType = this.udcSystemDesc2[this.systemSelected];  // Pending wei answer
      this.unified3DModel.ModelInput.FrameSystem.InsulationZone = this.udcSystemZone[this.systemSelected];  // Pending wei answer
    }
    this.unified3DModelEvent.emit(this.unified3DModel);
    this.loadJSONService({ resetCamera: false, Unified3DModel: this.unified3DModel, canBeDrawn: this.canBeDrawnBool });
  }
  onSelectSystemFacadeUDC(index: number): void {
    //this.isSystemFacadeChanged = 2;
    if (this.systemSelected != index) {
      this.configureService.computeClickedSubject.next(false);
      this.cpService.setCurrent(undefined, PanelsModule.MullionFacade);
      this.cpService.setCurrent(undefined, PanelsModule.TransomFacade);
      this.cpService.setCurrent(undefined, PanelsModule.IntermediateMullionFacade);
      this.cpService.setCurrent(undefined, PanelsModule.IntermediateTransomFacade);
      this.cpService.setCurrent(undefined, PanelsModule.UDCFramingFacade);
      this.systemFacadeSelectedFromFramingEvent.emit(this.udcSystemDesc2[index]);
      this.cpService.setSystem(this.cpService.SystemData("UDC")[index], "FRAMING");
      this.onCloseFramingPopoutsEvent.emit();
    }
    this.systemSelected = index;
    if (!this.unified3DModel.ModelInput.FrameSystem) { this.unified3DModel.ModelInput.FrameSystem = new FrameSystem(); }
    this.unified3DModel.ModelInput.FrameSystem.SystemType = this.udcSystemDesc2[this.systemSelected];  // Pending wei answer
    this.unified3DModel.ModelInput.FrameSystem.InsulationZone = this.udcSystemZone[this.systemSelected];  // Pending wei answer

    this.unified3DModelEvent.emit(this.unified3DModel);
    this.loadJSONService({ resetCamera: false, Unified3DModel: this.unified3DModel, canBeDrawn: this.canBeDrawnBool });
  }

  onSelectGasket(event: any): void {
    this.gasketSelection = event;
    if (!this.unified3DModel.ModelInput.FrameSystem) { this.unified3DModel.ModelInput.FrameSystem = new FrameSystem(); }
    let isValueChanged = this.unified3DModel.ModelInput.FrameSystem.UvalueType != this.gasketSelection;
    this.unified3DModel.ModelInput.FrameSystem.UvalueType = this.gasketSelection;

    if (isValueChanged) {
      this.configureService.computeClickedSubject.next(false);
      this.unified3DModelEvent.emit(this.unified3DModel);
      this.loadJSONService({ resetCamera: true, Unified3DModel: this.unified3DModel, canBeDrawn: this.canBeDrawnBool });
    }
  }

  onSelectInsulating(_event: any): void {
    if (!this.unified3DModel.ModelInput.FrameSystem) { this.unified3DModel.ModelInput.FrameSystem = new FrameSystem(); }
    let isValueChanged = this.unified3DModel.ModelInput.FrameSystem.InsulationType != this.insulatingSelection;
    if (isValueChanged) {
      this.unified3DModel.ModelInput.FrameSystem.InsulationType = this.insulatingSelection;
      this.configureService.computeClickedSubject.next(false);
      this.unified3DModelEvent.emit(this.unified3DModel);
      this.loadJSONService({ Unified3DModel: this.unified3DModel, canBeDrawn: this.canBeDrawnBool });
    }
  }

  onOpenIFramePopout(popup: string): void {
    if (popup === 'OuterFrame') this.cpService.setPopout(true, PanelsModule.OuterFrame);
    else if (popup === 'VentFrame') this.cpService.setPopout(true, PanelsModule.VentFrame);
    else if (popup === 'FrameCombination') this.cpService.setPopout(true, PanelsModule.FrameCombination);
    else if (popup === 'Mullion') this.cpService.setPopout(true, PanelsModule.Mullion);
    else if (popup === 'Transom') this.cpService.setPopout(true, PanelsModule.Transom);
    else if (popup === 'ProfileColor') this.cpService.setPopout(true, PanelsModule.ProfileColor);
    else if (popup === 'DoorLeafActive') this.cpService.setPopout(true, PanelsModule.DoorLeafActive);
    else if (popup === 'DoorLeafPassive') this.cpService.setPopout(true, PanelsModule.DoorLeafPassive);
    else if (popup === 'SillProfileFixed') this.cpService.setPopout(true, PanelsModule.SillProfileFixed);
    else if (popup === 'SillProfileBottom') this.cpService.setPopout(true, PanelsModule.SillProfileBottom);
    else if (popup === 'MullionFacade') this.cpService.setPopout(true, PanelsModule.MullionFacade); //Mullion-Depth
    else if (popup === 'ReinforcementFacade') this.cpService.setPopout(true, PanelsModule.ReinforcementFacade);
    else if (popup === 'TransomFacade') this.cpService.setPopout(true, PanelsModule.TransomFacade);
    else if (popup === 'IntermediateMullionFacade') this.cpService.setPopout(true, PanelsModule.IntermediateMullionFacade);
    else if (popup === 'IntermediateTransomFacade') this.cpService.setPopout(true, PanelsModule.IntermediateTransomFacade);
    else if (popup === 'UDCFraming') this.cpService.setPopout(true, PanelsModule.UDCFraming);
    else if (popup === 'UDCBottomFraming') this.cpService.setPopout(true, PanelsModule.UDCBottomFraming);
    else if (popup === 'BottomOuterFrameSliding') this.cpService.setPopout(true, PanelsModule.BottomOuterFrameSliding);
    else if (popup === 'InterlockSliding') this.cpService.setPopout(true, PanelsModule.InterlockSliding);
    else if (popup === 'ReinforcementSliding') this.cpService.setPopout(true, PanelsModule.ReinforcementSliding);
    else if (popup === 'DoubleVentSliding') this.cpService.setPopout(true, PanelsModule.DoubleVentSliding);
    else if (popup === 'StrucutralProfileSliding') this.cpService.setPopout(true, PanelsModule.StrucuralSliding);
  }

  onSelectInsulationZone(event: any) {

  }
  onSwitchReinforcement() {
    this.loadJSONService({ Unified3DModel: this.unified3DModel, canBeDrawn: this.canBeDrawnBool });
    this.unified3DModelEvent.emit(this.unified3DModel);
  }

  onApplyReinforcement() {
    this.selectedReinforcementIds;
    this.ReinforcementMullionInputArticle;
    this.unified3DModel;
    if (this.unified3DModel.ModelInput.Geometry.FacadeSections.filter(facadeSection => facadeSection.SectionID == 4)[0].ArticleName != this.ReinforcementMullionInputArticle.article.value.toString())
      this.configureService.computeClickedSubject.next(false);
    if (this.selectedMajorMullionIDs.length == 0) {
      this.unified3DModel.ModelInput.Geometry.FacadeSections.filter(facadeSection => facadeSection.SectionID == 4)[0].ArticleName = this.ReinforcementMullionInputArticle.article.value.toString();   // issue with mockData. uncomment it when no more mockData
    }
    this.selectedMajorMullionIDs.forEach(reinforcementId => {
      this.unified3DModel.ModelInput.Geometry.FacadeSections.filter(facadeSection => facadeSection.SectionID == 4)[0].ArticleName = this.ReinforcementMullionInputArticle.article.value.toString();   // issue with mockData. uncomment it when no more mockData
      this.onDeleteReinforcement(reinforcementId);
      let reinforcement: Reinforcement = new Reinforcement();
      let newId: number = 1;
      if (this.unified3DModel.ModelInput.Geometry.Reinforcements && this.unified3DModel.ModelInput.Geometry.Reinforcements.length > 0) {
        newId = Math.max(...this.unified3DModel.ModelInput.Geometry.Reinforcements.map(reinforcementElement => reinforcementElement.ReinforcementID)) + 1;
      }
      else {
        this.unified3DModel.ModelInput.Geometry.Reinforcements = [];
      }
      reinforcement.ReinforcementID = newId;
      reinforcement.MemberID = reinforcementId;
      reinforcement.SectionID = 4;   // mullion
      this.unified3DModel.ModelInput.Geometry.Reinforcements.push(reinforcement);
      this.appliedMullionReinforcement.push(reinforcementId);
    });

    this.unified3DModelEvent.emit(this.unified3DModel);
    this.loadJSONService({ Unified3DModel: this.unified3DModel, canBeDrawn: this.canBeDrawnBool });
  }

  onDeleteReinforcement(memberID: number) {
    if (this.unified3DModel.ModelInput.Geometry.Reinforcements) {
      this.unified3DModel.ModelInput.Geometry.Reinforcements = this.unified3DModel.ModelInput.Geometry.Reinforcements.filter(reinforcement => reinforcement.MemberID !== memberID);
    }
    this.configureService.computeClickedSubject.next(false);
    this.appliedMullionReinforcement = this.appliedMullionReinforcement.filter(id => id !== memberID);
    this.unified3DModelEvent.emit(this.unified3DModel);
    this.loadJSONService({ Unified3DModel: this.unified3DModel, canBeDrawn: this.canBeDrawnBool });
  }
  onVerticalJointChange(event: any): void {
    for (const key in this.validateFormForFacadeUDC.controls) {
      this.validateFormForFacadeUDC.controls[key].markAsDirty();
      this.validateFormForFacadeUDC.controls[key].updateValueAndValidity();
    }

    if (event !== undefined) {
      this.verticalJointWidth = event;
      if (!this.unified3DModel.ModelInput.FrameSystem) { this.unified3DModel.ModelInput.FrameSystem = new FrameSystem(); }
      let isValueChanged = this.unified3DModel.ModelInput.FrameSystem.VerticalJointWidth.toString() != this.verticalJointWidth;
      this.unified3DModel.ModelInput.FrameSystem.VerticalJointWidth = parseInt(this.verticalJointWidth);

      //disableresul
      if (isValueChanged) this.configureService.computeClickedSubject.next(false);
      this.unified3DModelEvent.emit(this.unified3DModel);
      this.loadJSONService({ resetCamera: true, Unified3DModel: this.unified3DModel, canBeDrawn: this.canBeDrawnBool });
    }
  }
  onProfileColorChange(event: any) {
    if (event) {
      if (this.unified3DModel.ModelInput.FrameSystem.AluminumColor != this.profileColorInputValue) {
        this.configureService.computeClickedSubject.next(false);
        this.unified3DModel.ModelInput.FrameSystem.AluminumColor = this.profileColorInputValue;

        this.profileColorEvent.emit({ value: this.profileColorInputValue });
        this.loadJSONService({ Unified3DModel: this.unified3DModel, canBeDrawn: this.canBeDrawnBool });

      }
    }
  }
  onHorizontalJointChange(event: any): void {
    if (event !== undefined) {
      this.horizontalJointWidth = event;
      if (!this.unified3DModel.ModelInput.FrameSystem) { this.unified3DModel.ModelInput.FrameSystem = new FrameSystem(); }
      let isValueChanged = this.unified3DModel.ModelInput.FrameSystem.HorizontalJointWidth.toString() != this.horizontalJointWidth;
      this.unified3DModel.ModelInput.FrameSystem.HorizontalJointWidth = parseInt(this.horizontalJointWidth);
      this.setBottomFraming();

      //disableresul
      if (isValueChanged) this.configureService.computeClickedSubject.next(false);
      this.unified3DModelEvent.emit(this.unified3DModel);
      this.loadJSONService({ resetCamera: true, Unified3DModel: this.unified3DModel, canBeDrawn: this.canBeDrawnBool });
    }
  }
  setBottomFraming() {
    setTimeout(() => {
      if (this.unified3DModel.ModelInput.FrameSystem.HorizontalJointWidth === 20) {
        var tfsections = this.unified3DModel.ModelInput.Geometry.FacadeSections.filter(section => section.SectionID == 1)[0]; // && section.SectionType == 21
        if (tfsections && tfsections.isCustomProfile) {
          this.UDCBottomFramingInputValue = '';
          var bfsections = this.unified3DModel.ModelInput.Geometry.FacadeSections.filter(section => section.SectionID == 3)[0]; // && section.SectionType == 23
          if (bfsections) {
            // bfsections.ArticleName = null;
            // bfsections.Depth = null;
          }
        }
        else {
          var bFraming = this.framingService.getBottomFrameList(tfsections.ArticleName.toString());
          if (bFraming) {
            this.UDCBottomFramingInputValue = bFraming.transomArticleId + ' - ' + bFraming.transomDepth;
            var bfsections = this.unified3DModel.ModelInput.Geometry.FacadeSections.filter(section => section.SectionID == 3)[0]; // && section.SectionType == 23
            if (bfsections) {
              bfsections.ArticleName = bFraming.transomArticleId.toString();
              bfsections.Depth = bFraming.transomDepth;
            }
          } else {
            this.UDCBottomFramingInputValue = '';
          }
        }
      } else {
        this.UDCBottomFramingInputValue = '';
        var bfsections = this.unified3DModel.ModelInput.Geometry.FacadeSections.filter(section => section.SectionID == 3)[0]; // && section.SectionType == 23
        if (bfsections) {
          // bfsections.ArticleName = null;
          // bfsections.Depth = null;
        }
      }
    }, 10);
  }
  isMullionExistUDC() {
    let isMullion = false;
    if (this.unified3DModel && this.unified3DModel.ModelInput && this.unified3DModel.ModelInput.Geometry && this.unified3DModel.ModelInput.Geometry.Members) {
      let mullion = this.unified3DModel.ModelInput.Geometry.Members.filter(x => x.MemberType == 24);
      isMullion = mullion && mullion.length > 0;
    }
    return isMullion;
  }
  isTransomExistUDC() {
    let isTransom = false;
    if (this.unified3DModel && this.unified3DModel.ModelInput && this.unified3DModel.ModelInput.Geometry && this.unified3DModel.ModelInput.Geometry.Members) {
      let transom = this.unified3DModel.ModelInput.Geometry.Members.filter(x => x.MemberType == 25);
      isTransom = transom && transom.length > 0;
    }
    return isTransom;
  }

  loadJSONService(data: any) {
    this.iframeService.loadJSON(this.iframeEvent, 'loadJSON', data);
  }

  onSelectSystemSliding(index: number): void {
    if (this.systemSelected != index) {
      this.systemSelected = index;

      // this.configureService.computeClickedSubject.next(false);
      // this.onCloseFramingPopoutsEvent.emit();
      // this.cpService.setSystem(this.cpService.SystemData("ASE")[index], "FRAMING");
      // this.unified3DModelEvent.emit(this.unified3DModel);
      // this.loadJSONService({ resetCamera: false, Unified3DModel: this.unified3DModel, canBeDrawn: this.canBeDrawnBool });
      // this.aseSystemValue;
      // this.aseSystemDesc;
    }
  }

  onSwitchReinforcementBool() {
    this.umService.set_ReinforcementBoolFrame(this.addReinforcementBool);
  }
}