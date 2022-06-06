import { Component, OnInit, Output, EventEmitter, Input, OnChanges, SimpleChanges, AfterViewInit } from '@angular/core';
import { Thermal, BpsUnifiedModel } from 'src/app/app-common/models/bps-unified-model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ConfigureService } from 'src/app/app-structural/services/configure.service';
import { formatNumber } from '@angular/common';
import { LocalStorageService } from 'src/app/app-core/services/local-storage.service';
import { ValidatePanelsService } from 'src/app/app-structural/services/validate-panels.service';
import { UnifiedModelService } from 'src/app/app-structural/services/unified-model.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-thermal',
  templateUrl: './thermal.component.html',
  styleUrls: ['./thermal.component.css']
})
export class ThermalComponent implements OnInit, OnChanges, AfterViewInit {

  @Output() thermalChildEvent: EventEmitter<any> = new EventEmitter();
  dewPointChecked: boolean = false;
  realtiveHumidityString: string;
  realtiveHumidityNumber: number;
  unified3DModel: BpsUnifiedModel;
  private destroy$ = new Subject<void>();

  // isRHvalid: boolean = true; 
  isValid: boolean = true;
  validateForm: FormGroup;
  language: string;
  patternLanguage: string;

  constructor(private fb: FormBuilder,
    private umService: UnifiedModelService,
    private configService: ConfigureService) {
    this.language = this.configService.getLanguage();
    this.patternLanguage = this.configService.getNumberPattern();
    this.validateForm = this.fb.group({ realtiveHumidity: ["", [Validators.required, Validators.pattern(this.patternLanguage)],], });
  }

  ngOnInit(): void {
    this.unified3DModel = this.umService.current_UnifiedModel;
  }

  ngAfterViewInit(): void {
    this.umService.obsUnifiedModel.pipe(takeUntil(this.destroy$)).subscribe(
      response => {
        if (response) {
          this.unified3DModel = response;
          this.loadThermal(); 
        }
      });
    
  }

  loadThermal() {
    if (this.unified3DModel && this.unified3DModel.ModelInput && this.unified3DModel.ModelInput.Thermal && this.unified3DModel.ModelInput.Thermal.RelativeHumidity > 0) {
      this.dewPointChecked = true;
      this.validateForm.enable();
      this.realtiveHumidityNumber = this.unified3DModel.ModelInput.Thermal.RelativeHumidity * 100;
      if (this.realtiveHumidityNumber < 1 || this.realtiveHumidityNumber > 100) {
        this.validateForm.controls["realtiveHumidity"].setErrors({ incorrect: true });
      }
    } else {
      this.dewPointChecked = false;
      this.validateForm.disable();
      this.realtiveHumidityNumber = null;
    }
    let thermal = null;
    if (this.realtiveHumidityNumber) {
      thermal = new Thermal();
      thermal.RelativeHumidity = this.realtiveHumidityNumber / 100;
    }
    this.thermalChildEvent.emit(thermal);
    this.umService.set_Thermal(thermal);
    for (const key in this.validateForm.controls) {
      this.validateForm.controls[key].markAsDirty();
      this.validateForm.controls[key].updateValueAndValidity();
    }
    if (this.realtiveHumidityNumber) {
      this.realtiveHumidityString = this.realtiveHumidityNumber.toString();
      if (this.language == "de-DE") {
        this.realtiveHumidityString = this.realtiveHumidityString.replace(".", ",");
      }
    }
  }

  ngOnChanges(Changes: SimpleChanges) {
    if (Changes) {
      if (Changes.unified3DModel && Changes.unified3DModel.currentValue) {
        this.unified3DModel = Changes.unified3DModel.currentValue;
        if (Changes.unified3DModel.previousValue) {
          if (Changes.unified3DModel.currentValue.ProblemSetting.ProblemGuid !== Changes.unified3DModel.previousValue.ProblemSetting.ProblemGuid) {
            this.dewPointChecked = false;
            this.validateForm.disable();
            this.realtiveHumidityString = '';
            this.realtiveHumidityNumber = null;
          }
          this.loadThermal();
        }
      }
    }
  }

  onDewPointSelected() {
    let isValueChanged = false;
    if (!this.dewPointChecked && this.realtiveHumidityNumber)
      isValueChanged = true;
    else if (this.dewPointChecked && !this.realtiveHumidityNumber)
      isValueChanged = true;
    if (isValueChanged) this.configService.computeClickedSubject.next(false);
    if (this.dewPointChecked) {
      this.validateForm.enable();
      this.onRealativeHumidityChange();
    }
    else {
      this.validateForm.disable();
      this.isValid = true;
      let thermal = null;
      // thermal.RelativeHumidity = null;
      this.thermalChildEvent.emit(thermal);
      this.umService.set_Thermal(thermal);
    }
  }
  onRealativeHumidityChange() {
    if (this.realtiveHumidityString) {
      this.realtiveHumidityNumber = parseFloat(this.realtiveHumidityString.replace(',', '.'));
      if (this.realtiveHumidityNumber < 1 || this.realtiveHumidityNumber > 100) {
        this.validateForm.controls["realtiveHumidity"].setErrors({ incorrect: true });
      }
    }
    else {
      this.realtiveHumidityNumber = null;
    }
    let isValueChanged = false;
    if ((!this.unified3DModel.ModelInput.Thermal && this.realtiveHumidityNumber)
      || (!this.realtiveHumidityNumber && this.unified3DModel.ModelInput.Thermal && this.unified3DModel.ModelInput.Thermal.RelativeHumidity > 0)
      || (this.unified3DModel.ModelInput.Thermal && this.realtiveHumidityNumber && (this.realtiveHumidityNumber / 100) != this.unified3DModel.ModelInput.Thermal.RelativeHumidity))
      isValueChanged = true;
    //let isValueChanged = this.realtiveHumidityNumber != this.unified3DModel.ModelInput.Thermal.RelativeHumidity;
    if (isValueChanged) this.configService.computeClickedSubject.next(false);
    this.isValid = this.isValidNumber(this.realtiveHumidityNumber);
    if (!this.isValid) {
      this.validateForm.controls['realtiveHumidity'].setErrors({ 'incorrect': true });
    }
    let thermalModel = new Thermal();
    if (this.realtiveHumidityNumber) {
      //thermalModel = new Thermal();
      thermalModel.RelativeHumidity = this.realtiveHumidityNumber / 100;

    } else
      thermalModel.RelativeHumidity = null;
    if (this.dewPointChecked) {
      this.thermalChildEvent.emit(thermalModel);
    }
    this.umService.set_Thermal(thermalModel);
  }

  isValidNumber(value: any): boolean {
    if (!value)
      return false;
    if (isNaN(value))
      return false;
    if (value <= 0)
      return false;
    return true;
  }

  isFormValid(): boolean {
    return this.validateForm.valid;
  }
}
