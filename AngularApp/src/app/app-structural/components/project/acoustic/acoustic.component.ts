import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { IFrameEvent } from 'src/app/app-structural/models/iframe-exchange-data';
import { BpsUnifiedModel, Acoustic } from 'src/app/app-common/models/bps-unified-model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ConfigureService } from 'src/app/app-structural/services/configure.service';
import { LocalStorageService } from 'src/app/app-core/services/local-storage.service';
import { UnifiedModelService } from 'src/app/app-structural/services/unified-model.service';
import { IframeService } from 'src/app/app-structural/services/iframe.service';

@Component({
  selector: 'app-acoustic',
  templateUrl: './acoustic.component.html',
  styleUrls: ['./acoustic.component.css']
})
export class AcousticComponent implements OnInit, OnChanges {

  @Input() wallType: string;
  height: number;
  width: number;
  roomArea: number;
  heightString: string;
  widthString: string;
  roomAreaString: string;
  @Input() unified3DModel: BpsUnifiedModel;
  @Input() iframeEvent: any;
  // @Input() displayContentAcoustic: boolean;
  @Input() canBeDrawnBool: boolean;
  @Output() unified3DModelFromAcousticEvent: EventEmitter<BpsUnifiedModel> = new EventEmitter<BpsUnifiedModel>();
  wallPerimeterEffectChecked: boolean = false;
  validateForm: FormGroup;
  language: string;
  patternLanguage: string;
  wallTypeNumberClicks: number = 0;

  constructor(
    private umService: UnifiedModelService,
    private fb: FormBuilder,
    private configureService: ConfigureService,
    private iframeService: IframeService) {
    this.language = this.configureService.getLanguage()
    this.patternLanguage = this.configureService.getNumberPattern();
    this.validateForm = this.fb.group({
      wallType: ['', [Validators.required]],
      height: ['', [Validators.required, Validators.pattern(this.patternLanguage)]],
      width: ['', [Validators.required, Validators.pattern(this.patternLanguage)]],
      roomArea: ['', [Validators.required, Validators.pattern(this.patternLanguage)]]
    });
  }

  ngOnInit(): void {
    /*this.unified3DModel = this.umService.current_UnifiedModel;*/
    this.loadAcoustic();
    /*this.umService.obsUnifiedModel.subscribe(
      response => {
        if (response) {
          this.unified3DModel = response;
          this.onUnifiedModelUpdated();
        }
      });*/
  }

  // onUnifiedModelUpdated() {
  //   if (this.umService.isProblemChanged) {
  //     this.loadAcoustic();
  //   }
  // }
  loadAcoustic() {
    this.validateForm.disable();
    if (this.unified3DModel && this.unified3DModel.ModelInput && this.unified3DModel.ModelInput.Acoustic &&
      this.unified3DModel.ModelInput.Acoustic.Height &&
      this.unified3DModel.ModelInput.Acoustic.RoomArea &&
      this.unified3DModel.ModelInput.Acoustic.WallType &&
      this.unified3DModel.ModelInput.Acoustic.Width) {
       this.validateForm.enable();
      for (const key in this.validateForm.controls) {
      this.validateForm.controls[key].markAsDirty();
      this.validateForm.controls[key].updateValueAndValidity();
    }
      this.wallPerimeterEffectChecked = true;
      this.height = this.unified3DModel.ModelInput.Acoustic.Height;
      this.roomArea = this.unified3DModel.ModelInput.Acoustic.RoomArea;
      this.wallType = this.unified3DModel.ModelInput.Acoustic.WallType ?
        this.unified3DModel.ModelInput.Acoustic.WallType.toString() : null;
      if (this.wallType) {
        this.wallTypeNumberClicks = 2;
      }
      this.width = this.unified3DModel.ModelInput.Acoustic.Width;

    } else {
      this.wallPerimeterEffectChecked = false;
      this.height = null;
      this.roomArea = null;
      this.wallType = null;
      this.wallTypeNumberClicks = 0;
      this.width = null;
    }
    // for (const key in this.validateForm.controls) {
    //   this.validateForm.controls[key].markAsDirty();
    //   this.validateForm.controls[key].updateValueAndValidity();
    // }
    if (this.height) {
      this.heightString = this.height.toString();
      if (this.language == "de-DE") {
        this.heightString = this.heightString.replace(".", ",");
      }
    } else {
      this.heightString = null;
    }
    if (this.width) {
      this.widthString = this.width.toString();
      if (this.language == "de-DE") {
        this.widthString = this.widthString.replace(".", ",");
      }
    } else {
      this.widthString = null;
    }
    if (this.roomArea) {
      this.roomAreaString = this.roomArea.toString();
      if (this.language == "de-DE") {
        this.roomAreaString = this.roomAreaString.replace(".", ",");
      }
    } else {
      this.roomAreaString = null;
    }
  }

  ngOnChanges(Changes: SimpleChanges) {
    if (Changes) {
      if (Changes.unified3DModel && Changes.unified3DModel.currentValue) {
        this.unified3DModel = Changes.unified3DModel.currentValue;
        if (Changes.unified3DModel.previousValue && Changes.unified3DModel.currentValue.ProblemSetting.ProblemGuid !== Changes.unified3DModel.previousValue.ProblemSetting.ProblemGuid) {
          this.loadAcoustic();
        }
      }
    }
  }

  onWallPerimeterChecked() {
    this.configureService.computeClickedSubject.next(false);
    if (this.wallPerimeterEffectChecked) {
      this.validateForm.enable();
      this.writeNsendUnified3DModel();
    } else {
      this.validateForm.disable();
      this.unified3DModel.ModelInput.Acoustic = null;
      this.loadJSONService({ Unified3DModel: this.unified3DModel, canBeDrawn: this.canBeDrawnBool });
      //disableresult
      this.unified3DModelFromAcousticEvent.emit(this.unified3DModel);
    }
    if (this.wallTypeNumberClicks < 2) {
      this.validateForm.controls.wallType.markAsUntouched();
    }
  }

  onWallTypeChange() {
    this.wallTypeNumberClicks++;
    this.writeNsendUnified3DModel();
  }

  writeNsendUnified3DModel() {
    if (this.heightString) {
      this.height = parseFloat(this.heightString.replace(',', '.'));
      if (this.height < 1) {
        this.validateForm.controls['height'].setErrors({ 'incorrect': true });
      }
    }
    else {
      this.height = null;
    }
    if (this.widthString) {
      this.width = parseFloat(this.widthString.replace(',', '.'));
      if (this.width < 1) {
        this.validateForm.controls['width'].setErrors({ 'incorrect': true });
      }
    }
    else {
      this.width = null;
    }
    if (this.roomAreaString) {
      this.roomArea = parseFloat(this.roomAreaString.replace(',', '.'));
    }
    else {
      this.roomArea = null;
    }
    if (this.unified3DModel.ModelInput.Acoustic && ((!this.unified3DModel.ModelInput.Acoustic.WallType && this.wallType)
      || (this.unified3DModel.ModelInput.Acoustic.WallType && !this.wallType)
      || this.unified3DModel.ModelInput.Acoustic.WallType && this.wallType && (this.unified3DModel.ModelInput.Acoustic.WallType != parseInt(this.wallType))
      || this.unified3DModel.ModelInput.Acoustic.Height != this.height
      || this.unified3DModel.ModelInput.Acoustic.Width != this.width
      || this.unified3DModel.ModelInput.Acoustic.RoomArea != this.roomArea)) {
      this.configureService.computeClickedSubject.next(false);
    }
    if (this.wallPerimeterEffectChecked) {
      if (!this.unified3DModel.ModelInput.Acoustic) {
        this.unified3DModel.ModelInput.Acoustic = new Acoustic();
      }
      this.unified3DModel.ModelInput.Acoustic.WallType = parseInt(this.wallType);
      this.unified3DModel.ModelInput.Acoustic.Height = this.height;
      this.unified3DModel.ModelInput.Acoustic.Width = this.width;
      this.unified3DModel.ModelInput.Acoustic.RoomArea = this.roomArea;
      if (!(this.unified3DModel.ProblemSetting.ProductType == '')) {
        this.loadJSONService({ Unified3DModel: this.unified3DModel, canBeDrawn: this.canBeDrawnBool });
        //this.configureService.computeClickedSubject.next(false);
      }
      if (this.roomArea == 0) {
        this.validateForm.controls['roomArea'].setErrors({ 'incorrect': true });
      }
    }
    this.unified3DModelFromAcousticEvent.emit(this.unified3DModel);
  }

  isFormValid() {
    if (!this.wallPerimeterEffectChecked) { return true; }
    else
      return this.validateForm.valid;
  }

  loadJSONService(data: any) {
    this.iframeService.loadJSON(this.iframeEvent, 'loadJSON', data);
  }
}
