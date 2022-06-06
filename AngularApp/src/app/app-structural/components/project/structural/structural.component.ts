import { Component, OnInit, Output, EventEmitter, Input, OnChanges, SimpleChanges, OnDestroy, AfterViewInit } from '@angular/core';
import { ConfigureService } from 'src/app/app-structural/services/configure.service';
//import { DINWindLoadInput } from 'src/app/app-structural/models/dinwind-load-input';
import { Structural, DinWindLoadInput, BpsUnifiedModel, FrameSystem } from 'src/app/app-common/models/bps-unified-model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LocalStorageService } from 'src/app/app-core/services/local-storage.service';
import { IFrameEvent } from 'src/app/app-structural/models/iframe-exchange-data';
import { Subject, Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { _ } from '@biesbjerg/ngx-translate-extract/dist/utils/utils';
import { ConfigPanelsService } from 'src/app/app-structural/services/config-panels.service';
import { PanelsModule } from 'src/app/app-structural/models/panels/panels.module';
import { UnifiedModelService } from 'src/app/app-structural/services/unified-model.service';
import { IframeService } from 'src/app/app-structural/services/iframe.service';
import { takeUntil } from 'rxjs/operators';
@Component({
  selector: 'app-structural',
  templateUrl: './structural.component.html',
  styleUrls: ['./structural.component.css']
})
export class StructuralComponent implements OnInit, OnChanges, OnDestroy, AfterViewInit {

  //Updated Changes
  isWindLoadOpened: boolean = false;

  validateForm: FormGroup;

 // @Input() unified3DModel: BpsUnifiedModel = null;
 unified3DModel: BpsUnifiedModel = null;
  unified3DModelcopy: BpsUnifiedModel = null;
  @Input() pressureValues: any;
  @Input() clearStructuralTableEvent: EventEmitter<void>;
  @Input() structuralTableFormData: any;
  @Output() validStructuralEvent: EventEmitter<any> = new EventEmitter();
  isValid: boolean = false;

  pemissableDeflectionInput: string = "4";  // keep
  windLoadString: string;
  windLoadNumber: number = 0.96;
  cpn: number = null;
  cpp: number = null;
  windLoadInputType: number = null;
  boundaryCondition: boolean;
  wind_horizontalLiveLoad: number = null;
  wind_horizontalLiveLoadHeight: number = null;
  // horizontalIndexString: string;
  //verticalIndexString: string;
  horizontalIndex: number = 175;
  verticalIndex: number = 360;
  positiveWindPressure: string;
  negativeWindPressure: string;
  maxAbsoluteValue: string;
  isUserDefinedSelected: boolean = false;
  structuralModel: Structural;

  isWLValid: boolean = true;
  isHValid: boolean = true;
  isVerIValid: boolean = true;

  calculateWindLoadSelection: string = "User Defined";
  switchLiveLoad: boolean = false;
  switchSeismic: boolean;
  switchBoundary: boolean;
  switchSlab: boolean;
  @Input() openLeftStructuralTableTableEvent: EventEmitter<void>;;
  @Input() sendDinWindLoadToTableEvent: EventEmitter<any>;
  language: string;
  patternLanguage: string;

  @Input() iframeEvent: Subject<IFrameEvent>;
  alloysSelection: string = "6060-T66 (150MPa)";
  @Input() canBeDrawnBool: boolean;
  @Input() unified3DModelEvent: EventEmitter<BpsUnifiedModel>;


  horizontalLiveLoad: string;
  height: string;
  @Input() problemGuid: string;
  isSameProblem: boolean = true;

  // facade
  floorAttachment: string;
  mullionJoints: string;
  @Input() event3D: any;
  @Output() loadDisplaySettingEvent: EventEmitter<boolean> = new EventEmitter();

  topRecess: number = 150;
  bottomRecess: number = 100;
  private destroy$ = new Subject<void>();

  constructor(private umService: UnifiedModelService, private cpService: ConfigPanelsService,
    private configureService: ConfigureService,
    private iframeService: IframeService,
    private fb: FormBuilder,
    private translate: TranslateService) {
    this.language = this.configureService.getLanguage();
    this.patternLanguage = this.configureService.getNumberPattern();
    this.alloysSelection = "6060-T66 (150MPa)";
    this.validateForm = this.fb.group({
      pemissableDeflectionInput: ['', [Validators.required]],
      horizontalIndex: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
      verticalIndex: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
      windLoadSelectedText: ['User Defined', [Validators.required]],
      windLoad: ['User Defined', [Validators.required]],
      switchLiveLoad: ['', [Validators.required]],
      switchSeismic: ['', [Validators.required]],
    //  switchBoundary: ['', [Validators.required]],
      switchSlab: ['', [Validators.required]],
      horizontalLiveLoad: ['', [Validators.required]],
      height: ['', [Validators.required, Validators.pattern(this.patternLanguage)]],
      Alloys: [this.alloysSelection, [Validators.required]],
      topRecess: [this.topRecess, [Validators.required, Validators.pattern('^[0-9]+$')]],
      bottomRecess: [this.bottomRecess, [Validators.required, Validators.pattern('^[0-9]+$')]],
    });
  }



  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngAfterViewInit(): void {
    this.umService.obsUnifiedModel.pipe(takeUntil(this.destroy$)).subscribe(
      response => {
        if (response) {
          this.unified3DModel = response;
          this.loadStructural();
        }
      });
  }
  ngOnInit(): void {
    this.unified3DModel = this.umService.current_UnifiedModel;
    
    this.cpService.obsPopout.pipe(takeUntil(this.destroy$)).subscribe(
      response => {
        if (response.panelsModule === PanelsModule.WindLoad) {
          this.isWindLoadOpened = response.isOpened;
        }
      });
    this.loadStructural();
  }
  // onUnifiedModelUpdated() {
  //   if (this.umService.isProblemChanged) {
  //       this.loadStructural();
  //   }
  // }
  loadStructural() {
    // if (this.horizontalIndex){
    //   this.horizontalIndexString = this.horizontalIndex.toString();
    // } else {
    //   this.horizontalIndexString = null;
    // }
    // if (this.verticalIndex){
    //   this.verticalIndexString = this.verticalIndex.toString();  
    // } else {
    //   this.verticalIndexString = null;
    // }
    this.calculateWindLoadSelection = this.translate.instant(_('configure.user-defined'));
    this.windLoadString = this.windLoadNumber.toString();   
    if (this.language == "de-DE") {
      this.windLoadString = this.windLoadString.replace(".", ",");
      //this.horizontalIndexString = this.horizontalIndexString.replace(".",",");
      //this.verticalIndexString = this.verticalIndexString.replace(".",",");
    }
    if (this.unified3DModel && this.unified3DModel.ModelInput && this.unified3DModel.ModelInput.Geometry) {
      if (this.unified3DModel.ModelInput.Geometry.SlabAnchors && this.unified3DModel.ModelInput.Geometry.SlabAnchors.length > 0) {
        //this.floorAttachment = this.unified3DModel.ModelInput.Geometry.SlabAnchors[0].AnchorType;
      }
      if (this.unified3DModel.ModelInput.Geometry.SpliceJoints && this.unified3DModel.ModelInput.Geometry.SpliceJoints.length > 0) {
        //this.mullionJoints = this.unified3DModel.ModelInput.Geometry.SpliceJoints[0].JointType;
      }
    }
    this.structuralModel = new Structural();
    if (this.unified3DModel && this.unified3DModel.ModelInput && this.unified3DModel.ModelInput.Structural) {
      if (this.unified3DModel.ModelInput.Structural.DispIndexType > 0) {
        this.pemissableDeflectionInput = this.unified3DModel.ModelInput.Structural.DispIndexType.toString();
        if (this.unified3DModel.ModelInput.Structural.DispIndexType == 1 && this.unified3DModel.ModelInput.Structural.DispHorizontalIndex && this.unified3DModel.ModelInput.Structural.DispVerticalIndex) { // User-defined
          this.horizontalIndex = this.unified3DModel.ModelInput.Structural.DispHorizontalIndex;
          this.verticalIndex = this.unified3DModel.ModelInput.Structural.DispVerticalIndex;
        }
      }

      if (this.unified3DModel.ProblemSetting.EnableStructural) {
        if (!this.unified3DModel.ModelInput.FrameSystem) {
          this.unified3DModel.ModelInput.FrameSystem = new FrameSystem();
        }
        if (this.unified3DModel.ModelInput.FrameSystem.Alloys) {
          this.alloysSelection = this.umService.get_alloy();
        }
        this.unified3DModel.ModelInput.FrameSystem.Alloys = this.alloysSelection;

        this.topRecess = this.unified3DModel.ModelInput.FrameSystem.MajorMullionTopRecess;
        this.bottomRecess = this.unified3DModel.ModelInput.FrameSystem.MajorMullionBottomRecess;
      }

      //this.switchBoundary = this.unified3DModel.ModelInput.Structural.ShowBoundaryCondition;

      if (Boolean(this.unified3DModel.ModelInput.Structural.dinWindLoadInput)) {
        this.calculateWindLoadSelection = "DIN EN 1991-1-4";
        this.sendDinWindLoadToTableEvent.emit(this.unified3DModel.ModelInput.Structural.dinWindLoadInput);
      }
      else {
        this.calculateWindLoadSelection = this.translate.instant(_('configure.user-defined'));
        // this.clearStructuralTableEvent.emit();
        this.positiveWindPressure = this.unified3DModel.ModelInput.Structural.PositiveWindPressure;
        this.negativeWindPressure = this.unified3DModel.ModelInput.Structural.NegativeWindPressure;
        if (this.unified3DModel.ModelInput.Structural.WindLoad) {
          this.windLoadNumber = this.unified3DModel.ModelInput.Structural.WindLoad;
          this.cpn = this.unified3DModel.ModelInput.Structural.Cpn;
          this.cpp = this.unified3DModel.ModelInput.Structural.Cpp;
          this.positiveWindPressure = (this.cpp * this.unified3DModel.ModelInput.Structural.WindLoad).toString();
          this.negativeWindPressure = (this.cpn * this.unified3DModel.ModelInput.Structural.WindLoad).toString();
          this.boundaryCondition = this.unified3DModel.ModelInput.Structural.ShowBoundaryCondition;
          this.windLoadInputType = this.unified3DModel.ModelInput.Structural.WindLoadInputType;
          this.wind_horizontalLiveLoad = this.unified3DModel.ModelInput.Structural.HorizontalLiveLoad;
          this.wind_horizontalLiveLoadHeight = this.unified3DModel.ModelInput.Structural.HorizontalLiveLoadHeight;
        
          // if(this.wind_horizontalLiveLoad === 0 && this.wind_horizontalLiveLoadHeight === 0 && this.horizontalLiveLoad == undefined && this.height == undefined && this.unified3DModel.AnalysisResult == null){
          //   this.switchLiveLoad = true;
          //   this.height = "900";
          //   this.horizontalLiveLoad = "0.5";
          //   this.wind_horizontalLiveLoad = 0.5; 
          //   this.wind_horizontalLiveLoadHeight = 900;
          // } else {
          //   if(this.wind_horizontalLiveLoad === 0 && this.wind_horizontalLiveLoadHeight === 0) {
          //     this.switchLiveLoad = false
          //   } else {
          //     this.switchLiveLoad = true
          //   }
          // }
          // this.dispIndexType = this.unified3DModel.ModelInput.Structural.DispIndexType;
          // this.dispHorizontalIndex = this.unified3DModel.ModelInput.Structural.DispHorizontalIndex;
          // this.dispVerticalIndex = this.unified3DModel.ModelInput.Structural.DispVerticalIndex;
          // this.dinWindLoadInput = this.unified3DModel.ModelInput.Structural.dinWindLoadInput;
          // this.loadFactor = this.unified3DModel.ModelInput.Structural.LoadFactor;
          // this.seasonFactor = this.unified3DModel.ModelInput.Structural.SeasonFactor;
          // this.temperatureChange = this.unified3DModel.ModelInput.Structural.TemperatureChange;

          if (this.windLoadNumber < 0 || this.windLoadNumber > 10) {
            this.validateForm.controls["windLoad"].setErrors({ incorrect: true });
          }
          this.windLoadString = this.windLoadNumber.toString();
          if (this.language == "de-DE") {
            this.windLoadString = this.windLoadString.replace(".", ",");
          }
        }      
        this.structuralModel.WindLoad = this.windLoadNumber;
        this.structuralModel.Cpn = this.cpn;
        this.structuralModel.Cpp = this.cpp;
        this.structuralModel.ShowBoundaryCondition = this.boundaryCondition;
        this.structuralModel.WindLoadInputType = this.windLoadInputType;
        this.unified3DModel.ModelInput.Structural.HorizontalLiveLoad = this.wind_horizontalLiveLoad;
        this.unified3DModel.ModelInput.Structural.HorizontalLiveLoadHeight = this.wind_horizontalLiveLoadHeight;
        setTimeout(() => {
          if (this.unified3DModel.ModelInput.Structural.HorizontalLiveLoad && this.unified3DModel.ModelInput.Structural.HorizontalLiveLoadHeight) {
            this.switchLiveLoad = true;
          }
          this.validateForm.controls['horizontalLiveLoad'].setValue(this.wind_horizontalLiveLoad);
          this.validateForm.controls['height'].setValue(this.wind_horizontalLiveLoadHeight);
        }, 100);

        this.validStructuralEvent.emit(this.structuralModel);
        this.umService.set_Structural(this.structuralModel);
      }

      if (this.unified3DModel.ModelInput.Structural.HorizontalLiveLoad && this.unified3DModel.ModelInput.Structural.HorizontalLiveLoadHeight) {
        this.switchLiveLoad = true;
        this.horizontalLiveLoad = (this.unified3DModel.ModelInput.Structural.HorizontalLiveLoad).toString();
        this.height = this.language == "de-DE" ? this.unified3DModel.ModelInput.Structural.HorizontalLiveLoadHeight.toString().replace('.', ',')
          : this.unified3DModel.ModelInput.Structural.HorizontalLiveLoadHeight.toString();
      } else {
          this.switchLiveLoad = false;
          this.horizontalLiveLoad = null;
          this.height = null;      
      }
    }
    for (const key in this.validateForm.controls) {
      this.validateForm.controls[key].markAsDirty();
      this.validateForm.controls[key].updateValueAndValidity();
    }
  }
  ngOnChanges(Changes: SimpleChanges) {
    if (Changes && Changes.problemGuid &&
      ((Changes.problemGuid.currentValue && Changes.problemGuid.previousValue && Changes.problemGuid.previousValue != Changes.problemGuid.currentValue))) {
      this.isSameProblem = false;
    }
    if (Changes) {
      if (Changes.unified3DModel && Changes.unified3DModel.currentValue) {
        this.unified3DModel = Changes.unified3DModel.currentValue;
        if (Changes.unified3DModel.previousValue && Changes.unified3DModel.currentValue.ProblemSetting.ProblemGuid !== Changes.unified3DModel.previousValue.ProblemSetting.ProblemGuid) {
          this.loadStructural();
        }
      }
      if (Changes.pressureValues && !Changes.pressureValues.firstChange) {
        if (Boolean(Changes.pressureValues.previousValue) && Boolean(Changes.pressureValues.currentValue) &&
          (JSON.stringify(Changes.pressureValues.previousValue.structuralModel) !== JSON.stringify(Changes.pressureValues.currentValue.structuralModel) ||
            Changes.pressureValues.previousValue.maxAbsoluteValue !== Changes.pressureValues.currentValue.maxAbsoluteValue ||
            ((Changes.pressureValues.currentValue.negativeWindPressure > 0 && Changes.pressureValues.previousValue.negativeWindPressure !== -1 * Changes.pressureValues.currentValue.negativeWindPressure)
              || (Changes.pressureValues.currentValue.negativeWindPressure < 0 && Changes.pressureValues.previousValue.negativeWindPressure !== Changes.pressureValues.currentValue.negativeWindPressure)) ||
            Changes.pressureValues.previousValue.positiveWindPressure !== Changes.pressureValues.currentValue.positiveWindPressure)) {
          if (this.isSameProblem) this.configureService.computeClickedSubject.next(false);
        }
        this.positiveWindPressure = this.pressureValues.positiveWindPressure;
        if (this.pressureValues.negativeWindPressure > 0)
          this.pressureValues.negativeWindPressure = -1 * this.pressureValues.negativeWindPressure;
        this.negativeWindPressure = this.pressureValues.negativeWindPressure;
        this.unified3DModel.ModelInput.Structural.PositiveWindPressure = this.positiveWindPressure;
        this.unified3DModel.ModelInput.Structural.NegativeWindPressure = this.negativeWindPressure;
        if (Changes.pressureValues.currentValue.structuralModel) {
          this.unified3DModel.ModelInput.Structural.Cpp = Changes.pressureValues.currentValue.structuralModel.Cpp;
          this.unified3DModel.ModelInput.Structural.Cpn = Changes.pressureValues.currentValue.structuralModel.Cpn;
          this.pressureValues.structuralModel = Changes.pressureValues.currentValue.structuralModel;
        }
        this.maxAbsoluteValue = this.pressureValues.maxAbsoluteValue;
        this.windLoadNumber = parseFloat(this.maxAbsoluteValue);
        if (this.windLoadNumber < 0 || this.windLoadNumber > 10) {
          this.validateForm.controls["windLoad"].setErrors({ incorrect: true });
        }
        this.windLoadString = this.windLoadNumber.toString();
        if (this.language == "de-DE") {
          this.windLoadString = this.windLoadString.replace(".", ",");
        }
        this.structuralModel = this.pressureValues.structuralModel;
        this.validStructuralEvent.emit(this.structuralModel);
        this.umService.set_Structural(this.structuralModel);
         this.loadJSONService({ Unified3DModel: this.unified3DModel, canBeDrawn: this.canBeDrawnBool });
        this.unified3DModelEvent.emit(this.unified3DModel);
      }
      if (Changes.structuralTableFormData && !Changes.structuralTableFormData.firstChange) {
        if (this.structuralTableFormData.windLoadSelectedText == 'User Defined') {
          this.unified3DModel.ModelInput.Structural.dinWindLoadInput = undefined;
          this.calculateWindLoadSelection = this.translate.instant(_('configure.user-defined'));
          this.unified3DModel.ModelInput.Structural.Cpn = parseInt(this.structuralTableFormData.suctionString);
          this.unified3DModel.ModelInput.Structural.Cpp = parseInt(this.structuralTableFormData.pressureString);
          this.unified3DModel.ModelInput.Structural.WindLoad = parseFloat(this.structuralTableFormData.packVelocityPressureString);
          this.unified3DModel.ModelInput.Structural.WindLoadInputType = 1;
        }
        else if (this.structuralTableFormData.windLoadSelectedText == 'DIN EN 1991-1-4') {
          this.calculateWindLoadSelection = this.structuralTableFormData.windLoadSelectedText;
          this.unified3DModel.ModelInput.Structural.WindLoadInputType = 2;
          if (!this.unified3DModel.ModelInput.Structural.dinWindLoadInput) {
            this.unified3DModel.ModelInput.Structural.dinWindLoadInput = new DinWindLoadInput();
          }
          this.unified3DModel.ModelInput.Structural.dinWindLoadInput.IncludeCpi = this.structuralTableFormData.internalPressure;
          if(this.structuralTableFormData.internalPressure){
            this.unified3DModel.ModelInput.Structural.dinWindLoadInput.pCpi = parseFloat(this.structuralTableFormData.positiveInternalPressure);
            this.unified3DModel.ModelInput.Structural.dinWindLoadInput.nCpi = parseFloat(this.structuralTableFormData.negativeInternalPressure);
          } else{
            this.unified3DModel.ModelInput.Structural.dinWindLoadInput.pCpi = null;
            this.unified3DModel.ModelInput.Structural.dinWindLoadInput.nCpi = null;
          
          }
          if (this.structuralTableFormData.siteInformation == 'zipeCode') {
            this.unified3DModel.ModelInput.Structural.dinWindLoadInput.PostCodeValue = this.structuralTableFormData.postcodeValue;
            this.unified3DModel.ModelInput.Structural.dinWindLoadInput.WindZone = parseInt(this.structuralTableFormData.windZoneValue);
            this.unified3DModel.ModelInput.Structural.dinWindLoadInput.RequestDescription = true // this.structuralTableFormData.postcodeValue;
          }
          else if (this.structuralTableFormData.siteInformation == 'windZone') {
            this.unified3DModel.ModelInput.Structural.dinWindLoadInput.WindZone = parseInt(this.structuralTableFormData.windZone);
            this.unified3DModel.ModelInput.Structural.dinWindLoadInput.RequestDescription = false;
          }
          this.unified3DModel.ModelInput.Structural.WindLoadInputType = 2;
          this.unified3DModel.ModelInput.Structural.dinWindLoadInput.TerrainCategory = parseInt(this.structuralTableFormData.terrainCategory);
          this.unified3DModel.ModelInput.Structural.dinWindLoadInput.L0 = parseInt(this.structuralTableFormData.buildingWidthString);
          this.unified3DModel.ModelInput.Structural.dinWindLoadInput.B0 = parseInt(this.structuralTableFormData.buildingDepthString);
          this.unified3DModel.ModelInput.Structural.dinWindLoadInput.h = parseInt(this.structuralTableFormData.buildingHeightString);
          this.unified3DModel.ModelInput.Structural.dinWindLoadInput.ElvW = parseInt(this.structuralTableFormData.windowElevationString);
          this.unified3DModel.ModelInput.Structural.dinWindLoadInput.WindowZone = parseInt(this.structuralTableFormData.windowZone);

        }
        this.structuralModel.DispIndexType = parseInt(this.pemissableDeflectionInput);
        if (this.pemissableDeflectionInput == "1") {
          this.structuralModel.DispHorizontalIndex = this.horizontalIndex;
          this.structuralModel.DispVerticalIndex = this.verticalIndex;
        } else {
          this.structuralModel.DispHorizontalIndex = 0;
          this.structuralModel.DispVerticalIndex = 0;
        }
        // this.unified3DModel.ModelInput.Structural.windLoadSelectedText = this.structuralTableFormData.windLoadSelectedText ;
         this.loadJSONService({ Unified3DModel: this.unified3DModel, canBeDrawn: this.canBeDrawnBool });
        this.loadDisplaySettingEvent.emit(null);
        this.unified3DModelEvent.emit(this.unified3DModel);
      }
    }
    if (Changes.event3D && !Changes.event3D.firstChange) {
      switch (Changes.event3D.currentValue.eventType) {
        case "selectMajorMullion":
          this.selectedMajorMullionIDs = this.event3D.value.selectedMajorMullionIDs;
          break;
      }
    }
  }

  onOpenLeftTable() {
    if (!this.positiveWindPressure || !this.negativeWindPressure) {
      this.structuralModel = new Structural();
      this.validStructuralEvent.emit(this.structuralModel);
      this.umService.set_Structural(this.structuralModel);
    }
    this.cpService.setPopout(true, PanelsModule.WindLoad);
    //this.openLeftStructuralTableTableEvent.emit();
  }

  onPermissableChange() {  // keep
    let isValueChanged: boolean = false;
    isValueChanged = this.unified3DModel.ModelInput.Structural && this.unified3DModel.ModelInput.Structural.DispIndexType != parseInt(this.pemissableDeflectionInput);

    this.structuralModel.DispIndexType = parseInt(this.pemissableDeflectionInput);
    if (this.pemissableDeflectionInput == "1") {
      this.structuralModel.DispHorizontalIndex = this.horizontalIndex;
      this.structuralModel.DispVerticalIndex = this.verticalIndex;
    } else {
      this.structuralModel.DispHorizontalIndex = 0;
      this.structuralModel.DispVerticalIndex = 0;
    }

    if (isValueChanged) {
      if (this.unified3DModel.ModelInput.Structural.DispIndexType > 0) {
        this.configureService.computeClickedSubject.next(false);
      }
       this.loadJSONService({ Unified3DModel: this.unified3DModel, canBeDrawn: this.canBeDrawnBool });
      this.unified3DModelEvent.emit(this.unified3DModel);
    }
  }

  onTopRecessChange(value){
    if(value !== null && value !== 0) {
      this.topRecess = value;
    }
    let isValueChanged: boolean = false;
    isValueChanged = this.unified3DModel.ModelInput.FrameSystem && this.unified3DModel.ModelInput.FrameSystem.MajorMullionTopRecess != this.topRecess;
    if(this.unified3DModel.ModelInput.FrameSystem){
      this.unified3DModel.ModelInput.FrameSystem.MajorMullionTopRecess = this.topRecess;
    }
    if (isValueChanged) {
      let max_Y_Dimension: number = 0;
      let yDimensions = this.unified3DModel.ModelInput.Geometry.Points.map(x => x.Y);
      if (yDimensions && yDimensions.length > 0)
        max_Y_Dimension = yDimensions.reduce((a, b) => Math.max(a, b));

      for(let SlabAnchor of this.unified3DModel.ModelInput.Geometry.SlabAnchors){
        if(SlabAnchor.Y > max_Y_Dimension)
          SlabAnchor.Y = max_Y_Dimension + this.topRecess;
      }
      this.configureService.computeClickedSubject.next(false);
       this.loadJSONService({ Unified3DModel: this.unified3DModel, canBeDrawn: this.canBeDrawnBool });
    this.unified3DModelEvent.emit(this.unified3DModel);
    }
  }
  onBottomRecessChange(value){
    if(value !== null && value !== 0) {
      this.bottomRecess = value;
    }
    let isValueChanged: boolean = false;
    isValueChanged = this.unified3DModel.ModelInput.FrameSystem && this.unified3DModel.ModelInput.FrameSystem.MajorMullionBottomRecess != this.bottomRecess;
    if(this.unified3DModel.ModelInput.FrameSystem){
      this.unified3DModel.ModelInput.FrameSystem.MajorMullionBottomRecess = this.bottomRecess;
    }
    if (isValueChanged) {
      for(let SlabAnchor of this.unified3DModel.ModelInput.Geometry.SlabAnchors){
        if(SlabAnchor.Y < 0){
          SlabAnchor.Y = 0 - this.bottomRecess;
        }
      }
      this.configureService.computeClickedSubject.next(false);
       this.loadJSONService({ Unified3DModel: this.unified3DModel, canBeDrawn: this.canBeDrawnBool });
    this.unified3DModelEvent.emit(this.unified3DModel);
    }
  }
  onSwitchLiveLoad() {
    if (this.unified3DModel.ModelInput.Structural && ((this.switchLiveLoad && this.unified3DModel.ModelInput.Structural.HorizontalLiveLoad == 0) || (!this.switchLiveLoad && this.unified3DModel.ModelInput.Structural.HorizontalLiveLoad > 0)))
      this.configureService.computeClickedSubject.next(false);
    if (this.switchLiveLoad && !this.height && !this.horizontalLiveLoad) {
      this.height = "900";
      this.horizontalLiveLoad = "0.5";
      this.structuralModel.HorizontalLiveLoad = 1; //1st option is 0.5
      this.structuralModel.HorizontalLiveLoadHeight = 900;
      // this.validateForm.controls.height.markAsPristine();
      // this.validateForm.controls.horizontalLiveLoad.markAsPristine();
      // this.validateForm.controls.horizontalLiveLoad.markAsDirty();
      // this.validateForm.controls.height.markAsDirty();
      // this.validateForm.controls.height.updateValueAndValidity();
      // this.validateForm.controls.horizontalLiveLoad.updateValueAndValidity();
      // for (const key in this.validateForm.controls) {
      //   this.validateForm.controls[key].markAsDirty();
      //   this.validateForm.controls[key].updateValueAndValidity();
      // }  
    }

    if (!this.switchLiveLoad) {
      this.structuralModel.HorizontalLiveLoad = 0;
      this.horizontalLiveLoad = null;
      //this.structuralModel.HorizontalLiveLoadFactor = 0;
      this.structuralModel.HorizontalLiveLoadHeight = 0;
      this.height = "";
    }
    this.validStructuralEvent.emit(this.structuralModel);
    this.umService.set_Structural(this.structuralModel);
  }
  onHorizontalLiveLoadChange() {
    if (this.horizontalLiveLoad) {
      this.structuralModel.HorizontalLiveLoad = parseFloat(this.horizontalLiveLoad);
      // switch(this.horizontalLiveLoad){
      //   case "0.5":
      //     this.structuralModel.HorizontalLiveLoadFactor = 0.7;
      //   break;
      //   case "1":
      //     this.structuralModel.HorizontalLiveLoadFactor = 0.7;
      //   break;
      //   case "2":
      //     this.structuralModel.HorizontalLiveLoadFactor = 1.0;
      //   break;
      //   case "3":
      //     this.structuralModel.HorizontalLiveLoadFactor = 0.7;
      //   break;
      //}
      this.validStructuralEvent.emit(this.structuralModel);
      this.umService.set_Structural(this.structuralModel);
    }
  }

  onHeightChange() {
    if (this.height) {
      var modelHeight = this.getMaxModelHeight();
      let height = parseFloat(this.height.toString().replace(',', '.'));
      if (modelHeight < height)
        this.validateForm.controls["height"].setErrors({ incorrect: true });
      this.structuralModel.HorizontalLiveLoadHeight = height;
    }
    else
      this.structuralModel.HorizontalLiveLoadHeight = 0;
    this.validStructuralEvent.emit(this.structuralModel);
    this.umService.set_Structural(this.structuralModel);

  }
  onHorizontalIndexChange() {  // keep
    // if (this.horizontalIndexString){
    //   this.horizontalIndex = parseFloat(this.horizontalIndexString.replace(",","."));
    // }
    // else {
    //   this.horizontalIndex = null;
    // }
    this.isHValid = this.isValidNumber(this.horizontalIndex);
    if (this.isHValid) {
      this.structuralModel.DispHorizontalIndex = this.horizontalIndex;
      if (this.isVerIValid && (this.structuralModel.WindLoad || this.structuralModel.dinWindLoadInput))
        this.isValid = true;
      if (this.isValid) {
        this.validStructuralEvent.emit(this.structuralModel);
        this.umService.set_Structural(this.structuralModel);
      }
    }
    else {
      this.validateForm.controls['horizontalIndex'].setErrors({ 'incorrect': true });
      this.isValid = false;
      this.validStructuralEvent.emit(null);
      this.umService.set_Structural(null);
    }
  }

  onVerticalIndexChange() {  // keep
    // if (this.verticalIndexString){
    //   this.verticalIndex = parseFloat(this.verticalIndexString.replace(",","."));
    // }
    // else {
    //   this.verticalIndex = null;
    // }
    this.isVerIValid = this.isValidNumber(this.verticalIndex);
    if (this.isVerIValid) {
      this.structuralModel.DispVerticalIndex = this.verticalIndex;
      if (this.isHValid && (this.structuralModel.WindLoad || this.structuralModel.dinWindLoadInput))
        this.isValid = true;
      if (this.isValid) {
        this.validStructuralEvent.emit(this.structuralModel);
        this.umService.set_Structural(this.structuralModel);
      }
    }
    else {
      this.validateForm.controls['verticalIndex'].setErrors({ 'incorrect': true });
      this.isValid = false;
      this.validStructuralEvent.emit(null);
      this.umService.set_Structural(null);
    }
  }

  onWindLoadChange() {  // keep
    if (this.structuralTableFormData && this.structuralTableFormData.windLoadSelectedText == 'DIN EN 1991-1-4') {
      let isValueChanged = false;
      if (this.windLoadString) {
        this.windLoadNumber = parseFloat(this.windLoadString.replace(',', '.'));
        if (this.windLoadNumber < 0 || this.windLoadNumber > 10) {
          this.validateForm.controls["windLoad"].setErrors({ incorrect: true });
        }
      }
      else {
        this.windLoadNumber = null;
      }
      if (this.windLoadNumber && this.unified3DModel.ModelInput.Structural && this.unified3DModel.ModelInput.Structural.WindLoad &&
        this.windLoadNumber != this.unified3DModel.ModelInput.Structural.WindLoad)
        isValueChanged = true;
      if (isValueChanged) this.configureService.computeClickedSubject.next(false);
      this.isWLValid = this.isValidNumber(this.windLoadNumber);
      if (!this.isWLValid) {
        this.validateForm.controls['windLoad'].setErrors({ 'incorrect': true });
      }
      if (this.isWLValid) {
        this.isValid = true;
        // this.createUnified3DModelForUserDefine();
        this.structuralModel.WindLoad = this.windLoadNumber;
        this.validStructuralEvent.emit(this.structuralModel); //send to parent User defined.
        this.umService.set_Structural(this.structuralModel);
      } else {
        this.updateParentForInvalid();
      }
    }
  }

  updateParentForInvalid() {  // keep
    this.isValid = false;
    this.structuralModel = new Structural();
    this.validStructuralEvent.emit(this.structuralModel);
    this.umService.set_Structural(this.structuralModel);
  }

  isValidNumber(value: any): boolean {   // keep
    if (!value)
      return false;
    if (isNaN(value))
      return false;
    if (value <= 0)
      return false;
    return true;
  }

  onClickManual() {
    this.structuralModel = new Structural();
    this.structuralModel.WindLoad = this.windLoadNumber;
    this.validStructuralEvent.emit(this.structuralModel);
    this.umService.set_Structural(this.structuralModel);
  }

  isFormValid(): boolean {
    var modelHeight = this.getMaxModelHeight();
    if (this.structuralModel && modelHeight < this.structuralModel.HorizontalLiveLoadHeight) {
      return false;
    }

    switch (this.calculateWindLoadSelection) {
      case "User Defined":
      case this.translate.instant(_('configure.user-defined')):
        switch (this.pemissableDeflectionInput) {
          case "2": // DIN EN 14351-1-2016 Class B (L/200)
          case "3": // DIN EN 14351-1-2016 Class C (L/300)
          case "4": // DIN EN 13830:2003
          case "5": // DIN EN 13830:2015/2020
          case "6": // us-standard
            if (this.switchLiveLoad) {
              return (this.validateForm.controls["pemissableDeflectionInput"].valid && this.validateForm.controls["windLoadSelectedText"].valid && this.validateForm.controls["windLoad"].valid
                && this.validateForm.controls["horizontalLiveLoad"].valid && this.validateForm.controls["height"].valid);
            }
            else
              return (this.validateForm.controls["pemissableDeflectionInput"].valid && this.validateForm.controls["windLoadSelectedText"].valid && this.validateForm.controls["windLoad"].valid);
          case "1":  // user defined
            if (this.switchLiveLoad) {
              return (this.validateForm.controls["pemissableDeflectionInput"].valid && this.validateForm.controls["horizontalIndex"].valid && this.validateForm.controls["verticalIndex"].valid && this.validateForm.controls["windLoadSelectedText"].valid && this.validateForm.controls["windLoad"].valid
                && this.validateForm.controls["horizontalLiveLoad"].valid && this.validateForm.controls["height"].valid);
            } else
              return (this.validateForm.controls["pemissableDeflectionInput"].valid && this.validateForm.controls["horizontalIndex"].valid && this.validateForm.controls["verticalIndex"].valid && this.validateForm.controls["windLoadSelectedText"].valid && this.validateForm.controls["windLoad"].valid);
        }
        break;
      case "DIN EN 1991-1-4":
        return true;
        break;
      case "calculate":
        return this.validateForm.controls["pemissableDeflectionInput"].valid && this.validateForm.controls["windLoadSelectedText"].valid && Boolean(this.positiveWindPressure && this.negativeWindPressure);
    }
  }

  GetMajorMullionMemberIds(): any[] {
    if (this.selectedMajorMullionIDs.length > 0) {
      return this.selectedMajorMullionIDs;
    } else {
      return this.unified3DModel.ModelInput.Geometry.Members.filter(
        f => f.SectionID === 1 && f.MemberType === 4
      ).map(({ MemberID }) => MemberID);
    }
  }

  //Facade
  // onSwitchBoundaryCondition() {
  //   if (this.switchBoundary) {
  //     this.unified3DModel.ModelInput.Structural.ShowBoundaryCondition = this.switchBoundary;
  //     // var SlabAnchorLength = this.unified3DModel.ModelInput.Geometry.SlabAnchors.length;
  //     // this.GetMajorMullionMemberIds().forEach(member => {
  //     //   this.unified3DModel.ModelInput.Geometry.SlabAnchors.push({
  //     //     SlabAnchorID: SlabAnchorLength++,
  //     //     MemberID: member,
  //     //     AnchorType: "Fixed",
  //     //     Y: 1
  //     //   });
  //     // });
  //   } else if (this.switchBoundary === false && this.unified3DModel.ModelInput.Geometry.SlabAnchors) {
  //     this.unified3DModel.ModelInput.Structural.ShowBoundaryCondition = this.switchBoundary;
  //     // this.unified3DModel.ModelInput.Geometry.SlabAnchors = this.unified3DModel.ModelInput.Geometry.SlabAnchors.filter(f => (f.AnchorType === "Fixed" && f.Y === 0) || (f.AnchorType === "Sliding" && f.Y === this.getMaxModelHeight()));;
  //     // this.unified3DModel.ModelInput.Geometry.SpliceJoints = [];
  //   }

  //   this.iframeEvent.next(new IFrameEvent('loadDisplaySetting', { settings: { showBCSymbols: this.switchBoundary } }));
  //    this.loadJSONService({ Unified3DModel: this.unified3DModel, canBeDrawn: this.canBeDrawnBool });
  //   //this.configureService.computeClickedSubject.next(false);
  // this.unified3DModelEvent.emit(this.unified3DModel);
  // }
  sortByAttribue(arr) {
    return arr.sort((a, b) => a["Y"] > b["Y"] ? 1 : -1);
  }

  selectedMajorMullionIDs: [] = []; // for mullion reinforcement
  onAddBoudaryCondition_floorAttachment() {
    // var SlabAnchorLength = this.unified3DModel.ModelInput.Geometry.SlabAnchors.length + 1;
    // var yNew = this.getNewHeight();
    // switch (this.floorAttachment) {
    //   case "Fixed":
    //     this.GetMajorMullionMemberIds().forEach(member => {
    //       this.unified3DModel.ModelInput.Geometry.SlabAnchors.push({
    //         SlabAnchorID: SlabAnchorLength++,
    //         MemberID: member,
    //         AnchorType: "Fixed",
    //         Y: yNew
    //       });
    //     });
    //     break;
    //   case "Sliding":
    //     this.GetMajorMullionMemberIds().forEach(member => {
    //       this.unified3DModel.ModelInput.Geometry.SlabAnchors.push({
    //         SlabAnchorID: SlabAnchorLength++,
    //         MemberID: member,
    //         AnchorType: "Sliding",
    //         Y: yNew
    //       });
    //     });
    //     break;
    // }
    this.iframeEvent.next(new IFrameEvent('clickAddSlabAnchors', { anchorType: this.floorAttachment }));
    // this.loadJSONService({ Unified3DModel: this.unified3DModel, canBeDrawn: this.canBeDrawnBool });
    //this.configureService.computeClickedSubject.next(false);
    //this.umService.setUnifiedModel(this.unified3DModel);
  }
  onAddBoudaryCondition_mullionJoints() {
    this.iframeEvent.next(new IFrameEvent('clickAddSpliceJoints', { jointType: this.mullionJoints }));

    // var SpliceJointLength = this.unified3DModel.ModelInput.Geometry.SpliceJoints.length + 1;
    // var yNew = this.getNewHeight();
    // switch (this.mullionJoints) {
    //   case "Hinged":
    //     this.GetMajorMullionMemberIds().forEach(member => {
    //       this.unified3DModel.ModelInput.Geometry.SpliceJoints.push({
    //         SpliceJointID: SpliceJointLength++,
    //         MemberID: member,
    //         JointType: "Hinged",
    //         Y: yNew
    //       });
    //     });
    //     break;
    //   case "Rigid":
    //     this.GetMajorMullionMemberIds().forEach(member => {
    //       this.unified3DModel.ModelInput.Geometry.SpliceJoints.push({
    //         SpliceJointID: SpliceJointLength++,
    //         MemberID: member,
    //         JointType: "Rigid",
    //         Y: yNew
    //       });
    //     });
    //     break;
    // }

    //  this.loadJSONService({ Unified3DModel: this.unified3DModel, canBeDrawn: this.canBeDrawnBool });
    // this.configureService.computeClickedSubject.next(false);
    // this.umService.setUnifiedModel(this.unified3DModel);
  }
  onAlloyChange(event: any) {
    if (!this.unified3DModel.ModelInput.FrameSystem) {
      this.unified3DModel.ModelInput.FrameSystem = new FrameSystem();
    }
    let isValueChanged = this.unified3DModel.ModelInput.FrameSystem.Alloys != this.alloysSelection;
    this.umService.set_Alloy(this.alloysSelection);
    // this.unified3DModel.ModelInput.FrameSystem.Alloys = this.alloysSelection;
    //  this.loadJSONService({ Unified3DModel: this.unified3DModel, canBeDrawn: this.canBeDrawnBool });
    if (isValueChanged) this.configureService.computeClickedSubject.next(false);
 // this.unified3DModelEvent.emit(this.unified3DModel);
  
  }

  getMaxModelHeight(): number {
    return this.unified3DModel ? this.unified3DModel.ModelInput.Geometry.Points.map(({ Y }) => Y).sort((a, b) => { return b - a })[0] : 0;
  }
  getMaxModelWidth(): number {
    return this.unified3DModel ? this.unified3DModel.ModelInput.Geometry.Points.map(({ X }) => X).sort((a, b) => { return b - a })[0] : 0;
  }
  getNewHeight(): number {
    var sjValue = this.sortByAttribue(this.unified3DModel.ModelInput.Geometry.SpliceJoints.filter(e => e.Y !== 0 && e.Y !== this.getMaxModelHeight()))[0];
    //var SpliceJointLength = this.unified3DModel.ModelInput.Geometry.SpliceJoints.length;
    var sjNew = sjValue == undefined ? this.getMaxModelHeight() : sjValue.Y - 300;
    sjNew = sjNew > this.getMaxModelHeight() || sjNew <= 0 ? 2 : sjNew;

    var saValue = this.sortByAttribue(this.unified3DModel.ModelInput.Geometry.SlabAnchors.filter(e => e.Y !== 0 && e.Y !== this.getMaxModelHeight()))[0];
    //var SlabAnchorLength = this.unified3DModel.ModelInput.Geometry.SlabAnchors.length;
    var saNew = saValue == undefined ? this.getMaxModelHeight() : saValue.Y - 300;
    saNew = saNew > this.getMaxModelHeight() || saNew <= 0 ? 2 : saNew;

    if (sjNew == saNew)
      return sjNew - 300;
    if (sjNew < saNew)
      return sjNew;
    else
      return saNew;

  }

  loadJSONService(data: any) {
    this.iframeService.loadJSON(this.iframeEvent, 'loadJSON', data);
  }
}
