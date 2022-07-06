import { Component, OnInit, Input, EventEmitter, Output, OnChanges, SimpleChanges, ViewChild, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Structural, BpsUnifiedModel, DinWindLoadInput } from 'src/app/app-common/models/bps-unified-model';
import { ConfigureService } from 'src/app/app-structural/services/configure.service';
import { TranslateService } from '@ngx-translate/core';
import { _ } from '@biesbjerg/ngx-translate-extract/dist/utils/utils';
import { LocalStorageService } from 'src/app/app-core/services/local-storage.service';
import { ConfigPanelsService } from 'src/app/app-structural/services/config-panels.service';
import { ValidatePanelsService } from 'src/app/app-structural/services/validate-panels.service';
import { PanelsModule } from 'src/app/app-structural/models/panels/panels.module';
import { UnifiedModelService } from 'src/app/app-structural/services/unified-model.service';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-structural-table',
  templateUrl: './structural-table.component.html',
  styleUrls: ['./structural-table.component.css']
})
export class StructuralTableComponent implements OnInit, OnChanges, OnDestroy {
  private destroy$ = new Subject<void>();
  //Rama: V3
  isStructuralTableOpened: boolean;

  validateForm: FormGroup;
  @Input() unified3DModel: BpsUnifiedModel = null;
  @Input() sendFormDataEvent: EventEmitter<any>;
  @Input() dinWindLoad: any;
  @Output() validStructuralEvent: EventEmitter<any> = new EventEmitter();
  @Output() sendPressureValueEvent: EventEmitter<any> = new EventEmitter<any>();
  @Output() openLeftTableEvent: EventEmitter<void> = new EventEmitter<void>();

  isValid: boolean = false;
  windLoadOption: string;
  windowZone: string;
  pemissableDeflectionInput: string = "1";  // keep
  terrainCategory: string;
  windLoad: number = 0.96;
  // horizontalIndex: number = 175;
  // verticalIndex: number = 360;
  postcodeValue: string;
  buildingWidth: number;
  buildingDepth: number;
  buildingHeight: number;
  windowElevation: number;
  windLoadSelectedText: string = 'User Defined';
  packVelocityPressureString: string = "0.96";
  suctionString: string = "-1";
  pressureString: string = "1";

  //Need to remove this approach in next release
  dispIndexType_obs: number;
  windLoadSelectedText_obs: string = 'User Defined';
  packVelocityPressureString_obs: string = "0.96";
  suctionString_obs: string = "-1";
  pressureString_obs: string = "1";
  siteInformation_obs: string;
  windZone_obs: string;
  terrainCategory_obs: string;
  buildingWidthString_obs: string;
  buildingDepthString_obs: string;
  buildingHeightString_obs: string;
  windowElevationString_obs: string;
  windowZone_obs: string;
  windZoneValue_obs: number;
  postcodeValue_obs: number;


  buildingWidthString: string;
  buildingDepthString: string;
  buildingHeightString: string;
  windowElevationString: string;
  positiveWindPressure: string;
  negativeWindPressure: string;
  maxAbsoluteValue: string;
  isUserDefinedSelected: boolean = false;
  structuralModel: Structural;
  isWEValid: boolean = true;
  isWLValid: boolean = true;
  isBWValid: boolean = true;
  isBHValid: boolean = true;
  isBDValid: boolean = true;
  isHValid: boolean = true;
  isVerIValid: boolean = true;

  calculateWindLoadSelection: string;
  maxWindPressure: number;
  switchConcentrated: boolean;
  switchSeismic: boolean;
  switchBoundary: boolean;
  switchSlab: boolean;

  windZoneBWSMperS: number;
  windZoneBWSMpH: number;

  windZoneValue: number;
  place: string;
  district: string;
  state: string;
  locationDescription: string;
  siteInformation: string;
  speedMperS: number;
  speedMperH: number;
  language: string;

  windZone: string;
  dualValues = [{ title: this.translate.instant(_('configure.zip-code')), checked: true }, { title: this.translate.instant(_('configure.wind-zone')), checked: false }];
  // 'Zip Code' | 'Wind Zone'
  patternLanguage: string;
  dinWinLoad: DinWindLoadInput;
  disableBtnBool: boolean = false;

  edgeZoneLength: number;
  internalPressure: boolean = true;
  positiveInternalPressure: number;
  negativeInternalPressure: number;
  horizontalLiveLoad: number;
  horizontalLiveLoadHeight: number;
  constructor(private umService: UnifiedModelService, private cpService: ConfigPanelsService, private vpService: ValidatePanelsService, private localStorageService: LocalStorageService, private fb: FormBuilder,
    private configureService: ConfigureService, private translate: TranslateService) {
    this.language = this.configureService.getLanguage();
    this.patternLanguage = this.configureService.getNumberPattern();
  }




  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  ngOnInit(): void {
    this.validateForm = this.fb.group({
      codeSelection: [this.windLoadSelectedText, []],
      postCode: ['', [Validators.pattern("[0-9]{5}")]],
      windZone: ['', []],
      terrainCategory: ['', []],
      buildingWidth: ['', [Validators.pattern(this.patternLanguage)]],
      buildingDepth: ['', [Validators.pattern(this.patternLanguage)]],
      buildingHeight: ['', [Validators.pattern(this.patternLanguage)]],
      windowElevation: ['', [Validators.pattern(this.patternLanguage)]],
      windowZone: ['', []],
      pressure: ['1', []],
      packVelocityPressure: ['0.96', []],
      suction: ['-1', []],
      internalPressure: [true],
      positiveInternalPressure: [this.positiveInternalPressure],
      negativeInternalPressure: [this.negativeInternalPressure]
    });

    /*this.unified3DModel = this.umService.current_UnifiedModel;*/
    this.loadStructuralTable();

    this.umService.obsUnifiedModel.pipe(takeUntil(this.destroy$)).subscribe(
      response => {
        if (response) {
          this.unified3DModel = response;
          this.loadStructuralTable();
        }
      });
    this.cpService.obsPopout.pipe(takeUntil(this.destroy$)).subscribe(
      response => {        
        if (response.panelsModule === PanelsModule.WindLoad) {
          this.isStructuralTableOpened = response.isOpened;
          setTimeout(() => {
            this.loadStructuralTable();
          }, 1000);
        }
      });
    
  }

  loadStructuralTable() {
    this.structuralModel = new Structural();
    if (this.unified3DModel && this.unified3DModel.ModelInput && this.unified3DModel.ModelInput.Structural && this.unified3DModel.ModelInput.Structural.WindLoadInputType) {
      this.horizontalLiveLoad = this.structuralModel.HorizontalLiveLoad = this.unified3DModel.ModelInput.Structural.HorizontalLiveLoad;
      this.horizontalLiveLoadHeight = this.structuralModel.HorizontalLiveLoadHeight = this.unified3DModel.ModelInput.Structural.HorizontalLiveLoadHeight;
      switch (this.unified3DModel.ModelInput.Structural.WindLoadInputType) {
        case 1: //User-Defined
          if (this.unified3DModel.ModelInput.Structural.Cpn && this.unified3DModel.ModelInput.Structural.Cpp && this.unified3DModel.ModelInput.Structural.WindLoad) {     //add velocity in condition
            this.suctionString = this.unified3DModel.ModelInput.Structural.Cpn.toString();
            this.pressureString = this.unified3DModel.ModelInput.Structural.Cpp.toString();
            this.packVelocityPressureString = this.unified3DModel.ModelInput.Structural.WindLoad.toString();
            this.windLoadSelectedText = 'User Defined';
            this.dispIndexType_obs = this.unified3DModel.ModelInput.Structural.DispIndexType;
            this.windLoadSelectedText_obs = this.windLoadSelectedText;
            this.suctionString_obs = this.suctionString;
            this.pressureString_obs = this.pressureString;
            this.packVelocityPressureString_obs = this.packVelocityPressureString;
            this.positiveWindPressure = (parseInt(this.pressureString) * parseInt(this.packVelocityPressureString)).toString();
            this.negativeWindPressure = (parseInt(this.suctionString) * parseInt(this.packVelocityPressureString)).toString();
          }
          break;
        case 2: //Din
          if (this.unified3DModel.ModelInput.Structural.dinWindLoadInput) {
            this.internalPressure = this.unified3DModel.ModelInput.Structural.dinWindLoadInput.IncludeCpi;
           // if(this.internalPressure){
              this.positiveInternalPressure = this.unified3DModel.ModelInput.Structural.dinWindLoadInput.pCpi;
              this.negativeInternalPressure = this.unified3DModel.ModelInput.Structural.dinWindLoadInput.nCpi;
              this.validateForm.controls['positiveInternalPressure'].setValue(this.unified3DModel.ModelInput.Structural.dinWindLoadInput.pCpi);
              this.validateForm.controls['negativeInternalPressure'].setValue(this.unified3DModel.ModelInput.Structural.dinWindLoadInput.nCpi);
           // } 
            this.windLoadSelectedText = 'DIN EN 1991-1-4';
            this.windLoadSelectedText_obs = this.windLoadSelectedText;
            this.dispIndexType_obs = this.unified3DModel.ModelInput.Structural.DispIndexType;
            this.terrainCategory = this.unified3DModel.ModelInput.Structural.dinWindLoadInput.TerrainCategory.toString();
            this.buildingWidthString = this.unified3DModel.ModelInput.Structural.dinWindLoadInput.L0.toString();
            this.buildingDepthString = this.unified3DModel.ModelInput.Structural.dinWindLoadInput.B0.toString();
            this.buildingHeightString = this.unified3DModel.ModelInput.Structural.dinWindLoadInput.h.toString();
            this.windowElevationString = this.unified3DModel.ModelInput.Structural.dinWindLoadInput.ElvW.toString();
            this.windowZone = this.unified3DModel.ModelInput.Structural.dinWindLoadInput.WindowZone.toString();

            if (this.unified3DModel && this.unified3DModel.ModelInput && this.unified3DModel.ModelInput.Structural && this.unified3DModel.ModelInput.Structural.dinWindLoadInput) {
              if (this.unified3DModel.ModelInput.Structural.dinWindLoadInput.PostCodeValue) {
                this.siteInformation = 'zipeCode';
                this.siteInformation_obs = this.siteInformation;
                this.dualValues[0].checked = true;
                this.dualValues[1].checked = false;
                // this.postcodeValue = this.unified3DModel.ModelInput.Structural.dinWindLoadInput.WindZone;
                this.postcodeValue = this.unified3DModel.ModelInput.Structural.dinWindLoadInput.PostCodeValue;
              }
              else {
                this.siteInformation = 'windZone';
                this.siteInformation_obs = this.siteInformation;
                this.dualValues[0].checked = false;
                this.dualValues[1].checked = true;
                this.windZone = this.unified3DModel.ModelInput.Structural.dinWindLoadInput.WindZone ? this.unified3DModel.ModelInput.Structural.dinWindLoadInput.WindZone.toString() : null;
                this.windZoneValue = this.unified3DModel.ModelInput.Structural.dinWindLoadInput.WindZone ? this.unified3DModel.ModelInput.Structural.dinWindLoadInput.WindZone : null;

                // this.windZone_obs = this.windZone;
              }
            }

          }
          break;
      }
    }

    this.validateForm.controls['codeSelection'].setValue(this.windLoadSelectedText);
    this.validateForm.controls['postCode'].setValue(this.postcodeValue);
    this.validateForm.controls['windZone'].setValue(this.windZoneValue);
    this.validateForm.controls['terrainCategory'].setValue(this.terrainCategory);
    this.validateForm.controls['buildingWidth'].setValue(this.buildingWidthString);
    this.validateForm.controls['buildingDepth'].setValue(this.buildingDepthString);
    this.validateForm.controls['buildingHeight'].setValue(this.buildingHeightString);
    this.validateForm.controls['windowElevation'].setValue(this.windowElevationString);
    this.validateForm.controls['windowZone'].setValue(this.windowZone);
    this.validateForm.controls['pressure'].setValue(this.pressureString);
    this.validateForm.controls['packVelocityPressure'].setValue(this.packVelocityPressureString);
    this.validateForm.controls['suction'].setValue(this.suctionString);
    this.validateForm.controls['internalPressure'].setValue(this.internalPressure);
    this.validateForm.controls['positiveInternalPressure'].setValue(this.positiveInternalPressure);
    this.validateForm.controls['negativeInternalPressure'].setValue(this.negativeInternalPressure);

    for (const key in this.validateForm.controls) {
      if(key !== 'positiveInternalPressure' && key !== 'negativeInternalPressure') {
        this.validateForm.controls[key].setValidators([Validators.required]);
        if (this.validateForm.controls[key].value) {
          this.validateForm.controls[key].markAsDirty();
          this.validateForm.controls[key].updateValueAndValidity();
        }
      }
      
     
    }
    //this.onChangeSiteInformation();
    if (this.dualValues[0].checked) {
      this.siteInformation = "zipeCode";
    }
    else {
      this.siteInformation = "windZone";
    }
  }
  ngOnChanges(Changes: SimpleChanges) {
    setTimeout(() => {
      if (Changes.dinWindLoad && Boolean(Changes.dinWindLoad.currentValue)) {

        this.windLoadSelectedText = "DIN EN 1991-1-4";
        // this.validateForm = this.fb.group({
        //   codeSelection: [this.windLoadSelectedText, [Validators.required]],
        //   postCode: ['', [Validators.pattern("[0-9]{5}")]],
        //   windZone: ['', []],
        //   terrainCategory: ['', []],
        //   buildingWidth: ['', [Validators.pattern(this.patternLanguage)]],
        //   buildingDepth: ['', [Validators.pattern(this.patternLanguage)]],
        //   buildingHeight: ['', [Validators.pattern(this.patternLanguage)]],
        //   windowElevation: ['', [Validators.pattern(this.patternLanguage)]],
        //   windowZone: ['', []],
        //   pressure: ['1', []],
        //   packVelocityPressure: ['0.96', []],
        //   suction: ['-1', []]
        // });
        this.windLoadSelectedText_obs = this.windLoadSelectedText;
        this.onWindLoadCalculationTypeSelected("DIN EN 1991-1-4");
        this.windZone = this.dinWindLoad.WindZone;
        this.windZoneValue = this.dinWindLoad.WindZone.toString();
        this.windowZone = this.dinWindLoad.WindowZone.toString();
        this.buildingHeight = this.dinWindLoad.h;
        this.buildingWidth = this.dinWindLoad.L0;
        this.buildingDepth = this.dinWindLoad.B0;
        this.windowElevation = this.dinWindLoad.ElvW;
        this.windowElevationString_obs = this.dinWindLoad.ElvW;
        this.internalPressure = this.dinWindLoad.IncludeCpi;
        this.positiveInternalPressure = this.dinWindLoad.pCpi;
        this.negativeInternalPressure = this.dinWindLoad.nCpi;

        if (this.buildingHeight) {
          this.buildingWidthString = this.buildingWidth.toString();
          if (this.language == "de-DE") {
            this.buildingWidthString = this.buildingWidthString.replace(".", ",")
          }
        } else {
          this.buildingWidthString = null;
        }
        if (this.buildingDepth) {
          this.buildingDepthString = this.buildingDepth.toString();
          if (this.language == "de-DE") {
            this.buildingDepthString = this.buildingDepthString.replace(".", ",")
          }
        } else {
          this.buildingDepthString = null;
        }
        if (this.buildingHeight) {
          this.buildingHeightString = this.buildingHeight.toString();
          if (this.language == "de-DE") {
            this.buildingHeightString = this.buildingHeightString.replace(".", ",")
          }
        } else {
          this.buildingHeightString = null;
        }
        if (this.windowElevation) {
          this.windowElevationString = this.windowElevation.toString();
          if (this.language == "de-DE") {
            this.windowElevationString = this.windowElevationString.replace(".", ",")
          }
        } else {
          this.windowElevationString = null;
        }
        this.terrainCategory = this.dinWindLoad.TerrainCategory.toString();
        this.windLoadSelectedText = 'DIN EN 1991-1-4';
        this.windLoadSelectedText_obs = this.windLoadSelectedText;
        if (this.dinWindLoad && this.dinWindLoad.PostCodeValue) {
          this.siteInformation = 'zipeCode';
          // this.postcodeValue = this.windZoneValue;
          this.postcodeValue = this.dinWindLoad.PostCodeValue;
          this.postcodeValue_obs = this.dinWindLoad.PostCodeValue;
          this.siteInformation_obs = this.siteInformation;
          this.dualValues[0].checked = true;
          this.dualValues[1].checked = false;
        } else {
          this.siteInformation = 'windZone';
          this.postcodeValue = this.windZoneValue.toString();
          this.postcodeValue_obs = this.windZoneValue;
          this.siteInformation_obs = this.siteInformation;
          this.dualValues[0].checked = false;
          this.dualValues[1].checked = true;
        }
        this.windowElevationString_obs = this.windowElevationString;
        this.buildingHeightString_obs = this.buildingHeightString;
        this.buildingDepthString_obs = this.buildingDepthString;
        this.buildingWidthString_obs = this.buildingWidthString;
        this.terrainCategory_obs = this.terrainCategory;
        this.windZone_obs = this.windZone;
        this.windZoneValue_obs = this.windZoneValue;
        this.windowZone_obs = this.windowZone;
        this.windLoadSelectedText_obs = this.windLoadSelectedText;
        if (this.dualValues[0].checked) {
          this.siteInformation = "zipeCode";
        }
        else {
          this.siteInformation = "windZone";
        }
        this.calculatedWindLoadDIN(false);
      } else {
        this.windLoadSelectedText = 'User Defined'
        if (this.windLoadSelectedText === 'User Defined') {
          // this.validateForm = this.fb.group({
          //   codeSelection: [this.windLoadSelectedText, [Validators.required]],
          //   postCode: ['', [Validators.pattern("[0-9]{5}")]],
          //   windZone: ['', []],
          //   terrainCategory: ['', []],
          //   buildingWidth: ['', [Validators.pattern(this.patternLanguage)]],
          //   buildingDepth: ['', [Validators.pattern(this.patternLanguage)]],
          //   buildingHeight: ['', [Validators.pattern(this.patternLanguage)]],
          //   windowElevation: ['', [Validators.pattern(this.patternLanguage), Validators.min(0.5)]],
          //   windowZone: ['', []],
          //   pressure: ['1', []],
          //   packVelocityPressure: ['0.96', []],
          //   suction: ['-1', []]
          // });
          this.windLoadSelectedText_obs = this.windLoadSelectedText;
          this.positiveWindPressure = (parseFloat(this.pressureString) * parseFloat(this.packVelocityPressureString)).toString();
          this.negativeWindPressure = (parseFloat(this.suctionString) * parseFloat(this.packVelocityPressureString)).toString();
          if (this.dualValues[0].checked) {
            this.siteInformation = "zipeCode";
          }
          else {
            this.siteInformation = "windZone";
          }
        }
      }
    }, 1000);
   
  }

  clearTable() {
    this.windLoadSelectedText = null;
    this.windZoneValue = null;
    this.windowZone = null;
    this.buildingHeight = null;
    this.buildingWidth = null;
    this.buildingDepth = null;
    this.windowElevation = null;
    this.terrainCategory = null;
    this.buildingWidthString = null;
    this.buildingDepthString = null;
    this.buildingHeightString = null;
    this.windowElevationString = null;

  }

  onChangeSiteInformation(dualValues = this.dualValues) {
    if (dualValues[0].checked) {
      this.siteInformation = "zipeCode";
    }
    else {
      this.siteInformation = "windZone";
    }
  }

  onCloseTable(): void {
    this.showHidePopUp(false);
  }

  onOpenTable(): void {
    this.showHidePopUp(true);
    this.loadStructuralTable();
    // the below lines are commented as to restrict the validation when the structural table is opened by default
    // and it should happen when the control is touched and not entered any value then it should get validate
    for (const key in this.validateForm.controls) {
      if (this.validateForm.controls[key].value) {
        this.validateForm.controls[key].markAsDirty();
        this.validateForm.controls[key].updateValueAndValidity();
      }
      //  else {
      //   if(this.validateForm.controls[key].value !== null && this.validateForm.controls[key].value !== '') {
      //     this.validateForm.controls[key].markAsDirty();
      //   this.validateForm.controls[key].updateValueAndValidity();
      //   }
      // }

    }
  }

  onWindLoadCalculationTypeSelected(optionSelected: string) {  // keep
    this.windLoadSelectedText = optionSelected;
    if (this.windLoadSelectedText) {
      if (this.windLoadSelectedText == 'User Defined') {
        this.windLoadOption = 'USER';
        this.isUserDefinedSelected = true;
        this.createUnified3DModelForUserDefine();
        this.isValid = this.windLoad ? true : false;
        if (this.isValid)
          this.validStructuralEvent.emit(this.structuralModel); //send to parent 1st time.  
      }
      else if (this.windLoadSelectedText.includes('DIN')) {
        this.isUserDefinedSelected = false;
        this.windLoadOption = 'DIN';

        // this.validateForm.get('postCode').setValidators([Validators.required,Validators.pattern("[0-9]{5}")]);
        // this.validateForm.get('windZone').setValidators([Validators.required]);
        // this.validateForm.get('terrainCategory').setValidators([Validators.required]);
        // this.validateForm.get('buildingWidth').setValidators([Validators.required,Validators.pattern(this.patternLanguage)]);
        // this.validateForm.get('buildingDepth').setValidators([Validators.required,Validators.pattern(this.patternLanguage)]);
        // this.validateForm.get('buildingHeight').setValidators([Validators.required,Validators.pattern(this.patternLanguage)]);
        // this.validateForm.get('windowElevation').setValidators([Validators.required,Validators.pattern(this.patternLanguage), Validators.min(0.5)]);
        // this.validateForm.get('windowZone').setValidators([Validators.required]);
        // this.validateForm.get('pressure').setValidators([Validators.required]);
        // this.validateForm.get('packVelocityPressure').setValidators([Validators.required]);
        // this.validateForm.get('suction').setValidators([Validators.required]);

        if (this.isDinWindLoadValid()) {
          this.isValid = true;
          this.validStructuralEvent.emit(this.structuralModel);
        } else {
          this.windLoad = null;
          // this.updateParentForInvalid();
        }
      }
    }

  }

  onChangePostCode() {
    if (this.postcodeValue && this.postcodeValue.toString().length == 5) {
      this.configureService.GetWindZone(this.postcodeValue.toString()).pipe(takeUntil(this.destroy$)).subscribe(data => {
        this.windZoneValue = data.WindZone;
        this.windZone = data.WindZone ? data.WindZone.toString() : null;
        this.place = data.Place;
        this.district = data.District;
        this.state = data.State;
        this.locationDescription = this.place + ", " + this.state;
        this.speedMperS = data.vb0;
        this.speedMperH = Math.round(this.speedMperS * 2.237);
        if (this.place == "") {
          this.validateForm.controls['postCode'].setErrors({ 'incorrect': true });
          this.locationDescription = null;
          this.windZone = this.windZoneValue = null;
        }
      });
    }
    else if (this.postcodeValue && this.postcodeValue.toString().length !== 5) {
      this.validateForm.controls['postCode'].setErrors({ 'incorrect': true });
      this.place = "";
      this.district = "";
      this.state = "";
      this.windZone = this.windZoneValue = null;
      this.locationDescription = null;
      this.speedMperS = null;
      this.speedMperH = null;
    }
  }

  calculateWindLoad() { //called from each DIN input // keep
    if (this.isDinWindLoadValid()) { //1.a
      this.calculatedWindLoadDIN();//1.b 

    }
  }
  calculatedWindLoadDIN(andThenConfirm: boolean = false) {  // keep
    this.dinWinLoad = new DinWindLoadInput();
    this.dinWinLoad.WindZone = this.windZoneValue; //Notes: needs to be replaced by zipcode -> Basic Wind Speed
    this.dinWinLoad.TerrainCategory = parseFloat(this.terrainCategory);
    this.dinWinLoad.L0 = this.buildingWidth;
    this.dinWinLoad.B0 = this.buildingDepth;
    this.dinWinLoad.h = this.buildingHeight;
    this.dinWinLoad.ElvW = this.windowElevation;
    this.dinWinLoad.WindowZone = parseFloat(this.windowZone);
    if (andThenConfirm)
      this.onConfirm();
  }
  isDinWindLoadValid(): boolean {  //keep
    if(this.unified3DModel.ProblemSetting.ProductType == "Window"){
      if (this.terrainCategory && this.buildingWidth && this.buildingDepth && this.buildingHeight && this.windowElevation && this.windowZone) {
        return true;
      }
    } else{
      if (this.terrainCategory && this.buildingWidth && this.buildingDepth && this.buildingHeight && this.windowZone) {
        return true;
      }
    }
    return false;
  }
  onSuctionChange() {
    // if (this.suctionString){
    //   const suction = parseFloat(this.suctionString.replace(",","."));
    //   if (suction < 1 || suction > 100) {
    //     this.validateForm.controls['suction'].setErrors({'incorrect': true});
    //   } else 
    //   this.validateForm.controls['suction'].setErrors({'incorrect': false});
    // }
    if (!this.vpService.isValidNumber_Negative(this.suctionString))
      this.validateForm.controls['suction'].setErrors({ 'incorrect': false });
  }
  onPositiveInternalPressureChange(){
    if (!this.vpService.isValidNumber_Positive(this.positiveInternalPressure)){
      this.validateForm.controls['positiveInternalPressure'].setErrors({ 'incorrect': false });
    }
    }

  onNegativeInternalPressureChange(){
    if (!this.vpService.isValidNumber_Negative(this.negativeInternalPressure))
      this.validateForm.controls['negativeInternalPressure'].setErrors({ 'incorrect': false });
 }
  onPressureChange() {
    // if (this.pressureString){
    //   const pressure = parseFloat(this.pressureString.replace(",","."));
    //   if (pressure < 1 || pressure > 100) {
    //     this.validateForm.controls['pressure'].setErrors({'incorrect': true});
    //   } else 
    //   this.validateForm.controls['pressure'].setErrors({'incorrect': false});
    // }
    if (!this.vpService.isValidNumber_Positive(this.pressureString))
      this.validateForm.controls['pressure'].setErrors({ 'incorrect': false });
  }

  onVelocityPressureChange() {
    // if (this.packVelocityPressureString){
    //   const pressure = parseFloat(this.packVelocityPressureString.replace(",","."));
    //   if (pressure < 1 || pressure > 100) {
    //     this.validateForm.controls['packVelocityPressure'].setErrors({'incorrect': true});
    //   } else 
    //   this.validateForm.controls['packVelocityPressure'].setErrors({'incorrect': false});
    // }
    if (!this.vpService.isValidNumber_Positive(this.packVelocityPressureString))
      this.validateForm.controls['packVelocityPressure'].setErrors({ 'incorrect': false });
  }
  calculateEdgeZoneLength() {
    //Min(building width /5 , 2 * building height /5, building depth)
    if (this.buildingHeight && this.buildingWidth && this.buildingDepth) {
      return Math.min(this.buildingWidth / 5, 2 * this.buildingHeight / 5, this.buildingDepth);
    } else
      return null;
  }
  onBuildingWidthChange() {  // keep
    if (this.buildingWidthString) {
      this.buildingWidth = parseFloat(this.buildingWidthString.replace(",", "."));
      if (this.buildingWidth < 1 || this.buildingWidth > 1000) {
        this.validateForm.controls['buildingWidth'].setErrors({ 'incorrect': true });
      }
    }
    else {
      this.buildingWidth = null;
    }
    this.edgeZoneLength = this.calculateEdgeZoneLength();
    this.isBWValid = this.vpService.isValidNumber_Positive(this.buildingWidth);
    if (this.isBWValid)
      this.calculateWindLoad();
    // if(this.isValid) this.updateParentForInvalid();
  }

  onBuildingHeightChange() {  // keep
    if (this.buildingHeightString) {
      this.buildingHeight = parseFloat(this.buildingHeightString.replace(",", "."));
      if (this.buildingHeight < 1 || this.buildingHeight > 1000) {
        this.validateForm.controls['buildingHeight'].setErrors({ 'incorrect': true });
      }
    }
    else {
      this.buildingHeight = null;
    }
    this.edgeZoneLength = this.calculateEdgeZoneLength();
    this.isBHValid = this.vpService.isValidNumber_Positive(this.buildingHeight);
    if (this.isBHValid)
      this.calculateWindLoad();
    // if(this.isValid) this.updateParentForInvalid();
  }

  onBuildingDepthChange() {  // keep
    if (this.buildingDepthString) {
      this.buildingDepth = parseFloat(this.buildingDepthString.replace(",", "."));
      if (this.buildingDepth < 1 || this.buildingDepth > 1000) {
        this.validateForm.controls['buildingDepth'].setErrors({ 'incorrect': true });
      }
    }
    else {
      this.buildingDepth = null;
    }
    this.edgeZoneLength = this.calculateEdgeZoneLength();
    this.isBDValid = this.vpService.isValidNumber_Positive(this.buildingDepth);
    if (this.isBDValid)
      this.calculateWindLoad();
    // if(this.isValid) this.updateParentForInvalid();
  }

  onWindowElevationChange() {  // keep
    if (this.windowElevationString) {
      this.windowElevation = parseFloat(this.windowElevationString.replace(",", "."));
      // if (this.windowElevation < 0.5 || this.windowElevation > 1000) {
      //   this.validateForm.controls['windowElevation'].setErrors({ 'incorrect': true });
      // }
    }
    else {
      this.windowElevation = null;
    }
    this.isWEValid = this.vpService.isValidNumber_Positive(this.windowElevation);
    if (this.isWEValid)
      this.calculateWindLoad();
    // if(this.isValid) this.updateParentForInvalid();
  }

  onWindZoneChange(event: string) { 
    if (event) {
      switch (event) {
        case "1":
          this.windZoneBWSMperS = 22.5;
          this.windZoneBWSMpH = this.windZoneBWSMperS * 2.237;
          this.windZoneBWSMpH = parseFloat(this.windZoneBWSMpH.toFixed(0));
          this.windZone = event;
          break;
        case "2":
          this.windZoneBWSMperS = 25.0;
          this.windZoneBWSMpH = this.windZoneBWSMperS * 2.237;
          this.windZoneBWSMpH = parseFloat(this.windZoneBWSMpH.toFixed(0));
          this.windZone = event;
          break;
        case "3":
          this.windZoneBWSMperS = 27.5;
          this.windZoneBWSMpH = this.windZoneBWSMperS * 2.237;
          this.windZoneBWSMpH = parseFloat(this.windZoneBWSMpH.toFixed(0));
          this.windZone = event;
          break;
        case "4":
          this.windZoneBWSMperS = 30.0;
          this.windZoneBWSMpH = this.windZoneBWSMperS * 2.237;
          this.windZoneBWSMpH = parseFloat(this.windZoneBWSMpH.toFixed(0));
          this.windZone = event;
          break;

      }
    }
  }

  createUnified3DModelForUserDefine() {
    if (this.windLoadOption == 'USER' && this.windLoad) {
      this.structuralModel.WindLoad = this.windLoad;
      this.structuralModel.WindLoadInputType = 1;
      this.structuralModel.DispIndexType = this.dispIndexType_obs;
    }
  }
  createUnified3DModelDIN() {
    if (this.windLoadOption == 'DIN') {
      if (!this.structuralModel) this.structuralModel = new Structural();
      this.structuralModel.WindLoad = this.windLoad;
      if (!this.structuralModel.dinWindLoadInput) this.structuralModel.dinWindLoadInput = new DinWindLoadInput();
      this.structuralModel.dinWindLoadInput.WindZone = this.dinWinLoad.WindZone; //Notes: needs to be replaced by zipcode -> Basic Wind Speed
      this.structuralModel.dinWindLoadInput.TerrainCategory = parseFloat(this.terrainCategory);
      this.structuralModel.dinWindLoadInput.L0 = this.buildingWidth;
      this.structuralModel.dinWindLoadInput.B0 = this.buildingDepth;
      this.structuralModel.dinWindLoadInput.h = this.buildingHeight;
      this.structuralModel.dinWindLoadInput.ElvW = this.windowElevation;
      this.structuralModel.dinWindLoadInput.WindowZone = parseFloat(this.windowZone);
      this.structuralModel.dinWindLoadInput.IncludeCpi = this.internalPressure;
      if(this.internalPressure){
        this.structuralModel.dinWindLoadInput.pCpi = this.positiveInternalPressure;
        this.structuralModel.dinWindLoadInput.nCpi = this.negativeInternalPressure
      } else {
        this.structuralModel.dinWindLoadInput.pCpi = null;
        this.structuralModel.dinWindLoadInput.nCpi = null;
      }
      this.structuralModel.WindLoadInputType = 2;
      this.structuralModel.DispIndexType = this.dispIndexType_obs;
      this.structuralModel.dinWindLoadInput.PostCodeValue = this.postcodeValue;
    }
  }

  onConfirm() {
    if (this.windLoadSelectedText == 'DIN EN 1991-1-4') {
      if (this.structuralModel !== undefined) {
        this.structuralModel.WindLoadInputType = 2;
        if (this.structuralModel.dinWindLoadInput !== undefined) {
          this.structuralModel.dinWindLoadInput.PostCodeValue = this.postcodeValue;
        }

      }
      if (this.siteInformation == "zipeCode") {
        this.dinWinLoad.WindZone = this.windZoneValue;
        this.dinWinLoad.PostCodeValue = this.postcodeValue;
      } else {
        this.postcodeValue = null;
        this.dinWinLoad.WindZone = parseInt(this.windZone);
      }

      this.dinWinLoad.IncludeCpi = this.internalPressure;
      if(this.internalPressure){
        this.dinWinLoad.pCpi = this.positiveInternalPressure;
        this.dinWinLoad.nCpi = this.negativeInternalPressure
      } else {
        this.dinWinLoad.pCpi = null;
        this.dinWinLoad.nCpi = null;
      }

      // if(this.structuralModel && this.structuralModel.dinWindLoadInput)
      //   this.structuralModel.dinWindLoadInput.WindZone = this.dinWinLoad.WindZone;
      this.configureService.calculatedWindLoadDIN(this.dinWinLoad).pipe(takeUntil(this.destroy$)).subscribe((windLoadResult) => {
        //let isGerman = (CurrentCulture === "DE" || CurrentCulture === "de-DE") ? true : false;
        let isGerman = false;
        let maxAbsWP = windLoadResult.MaxAbsWindPressure.toFixed(2);
        let maxPositiveWP = windLoadResult.MaxPositiveWindPressure.toFixed(2);
        let minNegativeWP = windLoadResult.MinNegtiveWindPressure.toFixed(2);
        this.maxAbsoluteValue = maxAbsWP ? (isGerman ? maxAbsWP.toString().replace('.', ',') : maxAbsWP) : maxAbsWP;
        this.positiveWindPressure = maxPositiveWP ? (isGerman ? maxPositiveWP.toString().replace('.', ',') : maxPositiveWP) : maxPositiveWP;
        this.negativeWindPressure = minNegativeWP ? (isGerman ? minNegativeWP.toString().replace('.', ',') : minNegativeWP) : minNegativeWP;

        //1.c
        if (this.maxAbsoluteValue) {
          this.windLoad = parseFloat(this.maxAbsoluteValue);
          this.isValid = true;
        }
        //2 send event to parent to enable Compute button which will enable Result, Report after click of Compute
        if (this.isValid) {
          this.createUnified3DModelDIN();//2
          // this.validStructuralEvent.emit(this.structuralModel); //send to -> parent will enable Compute button
        }
        // if (andThenConfirm) {
        //   this.onConfirm();
        // }
        this.structuralModel.WindLoadInputType = 2; //2 for DIN
        this.structuralModel.WindLoad = parseFloat(this.packVelocityPressureString);
        // this.positiveWindPressure = (parseFloat(this.pressureString) * parseFloat(this.packVelocityPressureString)).toString();
        //   this.negativeWindPressure = (parseFloat(this.suctionString) * parseFloat(this.packVelocityPressureString)).toString();
        this.structuralModel.Cpp = parseFloat(this.pressureString);
        this.structuralModel.Cpn = parseFloat(this.suctionString);
        this.sendPressureValueEvent.emit({ positiveWindPressure: this.positiveWindPressure, negativeWindPressure: this.negativeWindPressure, maxAbsoluteValue: this.maxAbsoluteValue, structuralModel: this.structuralModel });
      });
      if (this.siteInformation == 'zipeCode') {
        setTimeout(() => {
          this.sendFormDataEvent.emit({ positiveWindPressure: this.positiveWindPressure, negativeWindPressure: this.negativeWindPressure, windLoadSelectedText: this.windLoadSelectedText, siteInformation: this.siteInformation, postcodeValue: this.postcodeValue, terrainCategory: this.terrainCategory, buildingWidthString: this.buildingWidthString, buildingDepthString: this.buildingDepthString, buildingHeightString: this.buildingHeightString, windowElevationString: this.windowElevationString, windowZone: this.windowZone, windZoneValue: this.windZoneValue, 
            internalPressure: this.internalPressure, positiveInternalPressure: this.positiveInternalPressure, negativeInternalPressure: this.negativeInternalPressure });
        }, 0);
      }
      else if (this.siteInformation == 'windZone') {
        setTimeout(() => {
          this.sendFormDataEvent.emit({ positiveWindPressure: this.positiveWindPressure, negativeWindPressure: this.negativeWindPressure, windLoadSelectedText: this.windLoadSelectedText, siteInformation: this.siteInformation, windZone: this.windZone, terrainCategory: this.terrainCategory, buildingWidthString: this.buildingWidthString, buildingDepthString: this.buildingDepthString, buildingHeightString: this.buildingHeightString, windowElevationString: this.windowElevationString, windowZone: this.windowZone,
             internalPressure: this.internalPressure, positiveInternalPressure: this.positiveInternalPressure, negativeInternalPressure: this.negativeInternalPressure });
        }, 0);
      }
    }
    else if (this.windLoadSelectedText == 'User Defined') {
      setTimeout(() => {
        this.structuralModel.WindLoadInputType = 1;
        this.structuralModel.WindLoad = parseFloat(this.packVelocityPressureString);
        this.positiveWindPressure = (parseFloat(this.pressureString) * parseFloat(this.packVelocityPressureString)).toString();
        this.negativeWindPressure = (parseFloat(this.suctionString) * parseFloat(this.packVelocityPressureString)).toString();
        this.structuralModel.Cpp = parseFloat(this.pressureString);
        this.structuralModel.Cpn = parseFloat(this.suctionString);
        this.sendPressureValueEvent.emit({ positiveWindPressure: this.positiveWindPressure, negativeWindPressure: this.negativeWindPressure, maxAbsoluteValue: this.maxAbsoluteValue, structuralModel: this.structuralModel });
        // this.isStructuralTableOpened = false;
        this.sendFormDataEvent.emit({ positiveWindPressure: this.positiveWindPressure, negativeWindPressure: this.negativeWindPressure, windLoadSelectedText: this.windLoadSelectedText, packVelocityPressureString: this.packVelocityPressureString, pressureString: this.pressureString, suctionString: this.suctionString });
      }, 0);
    }
    if (this.isStructuralTableOpened) {
      this.configureService.computeClickedSubject.next(false);
      this.showHidePopUp(false);
    }

  }
  getDisableBtnBool(): void {
    if (this.windLoadSelectedText == 'DIN EN 1991-1-4') {
      if(this.unified3DModel.ProblemSetting.ProductType == "Window")
        this.disableBtnBool = !(this.validateForm.controls['terrainCategory'].valid && this.validateForm.controls['buildingWidth'].valid && this.validateForm.controls['buildingDepth'].valid && this.validateForm.controls['buildingHeight'].valid && this.validateForm.controls['windowElevation'].valid && this.validateForm.controls['windowZone'].valid && ((this.siteInformation == 'zipeCode' && this.validateForm.controls['postCode'].valid) || (this.siteInformation == 'windZone' && this.validateForm.controls['windZone'].valid)));
      else
        this.disableBtnBool = !(this.validateForm.controls['terrainCategory'].valid && this.validateForm.controls['buildingWidth'].valid && this.validateForm.controls['buildingDepth'].valid && this.validateForm.controls['buildingHeight'].valid && this.validateForm.controls['windowZone'].valid && ((this.siteInformation == 'zipeCode' && this.validateForm.controls['postCode'].valid) || (this.siteInformation == 'windZone' && this.validateForm.controls['windZone'].valid)));
      if(this.internalPressure)
        this.disableBtnBool = !(this.validateForm.controls['terrainCategory'].valid && this.validateForm.controls['buildingWidth'].valid && this.validateForm.controls['buildingDepth'].valid && this.validateForm.controls['buildingHeight'].valid && this.validateForm.controls['windowZone'].valid && ((this.siteInformation == 'zipeCode' && this.validateForm.controls['postCode'].valid) || (this.siteInformation == 'windZone' && this.validateForm.controls['windZone'].valid)) && this.validateForm.controls['positiveInternalPressure'].valid && this.validateForm.controls['negativeInternalPressure'].valid);
    }
    else if (this.windLoadSelectedText == 'User Defined') {
      this.disableBtnBool = !(this.validateForm.controls['pressure'].valid && this.validateForm.controls['suction'].valid && this.validateForm.controls['packVelocityPressure'].valid);
    }
    else {
      this.disableBtnBool = false;
    }
  }

  onInternalPressureChange() {
    if(this.internalPressure) {
      this.positiveInternalPressure = 0.2;
      this.negativeInternalPressure = -0.3;
      if (this.vpService.isValidNumber_Negative(this.negativeInternalPressure)){
        this.validateForm.controls['negativeInternalPressure'].setErrors({ 'correct': true });
      }
      if (this.vpService.isValidNumber_Positive(this.positiveInternalPressure)) {
        this.validateForm.controls['positiveInternalPressure'].setErrors({ 'correct': true });
      }
    } else {
      this.positiveInternalPressure = null;
      this.negativeInternalPressure = null;
    }
  }

  //Rama: V3
  showHidePopUp(isOpened: boolean): void {
    this.isStructuralTableOpened = isOpened;
    this.cpService.setPopout(this.isStructuralTableOpened, PanelsModule.WindLoad);
  }
}
