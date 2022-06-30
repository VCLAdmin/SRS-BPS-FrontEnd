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
    
   /**
   * This is observable of Unified Model which will calls when the unified model has changed anywhere in the application
   * and will set the values for the input fields 
   */ 
    this.umService.obsUnifiedModel.pipe(takeUntil(this.destroy$)).subscribe(
      response => {
        if (response) {
          this.unified3DModel = response;
          this.loadThermal(); 
        }
      });
    
  }

 /**
 * This function is to set the thermal input values to the unified model 
 * and also will get the value from unified model and assign to the input fields on page refresh
 *
 */
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

 /**
 * This function is called when user Checks and unchecks the DewPoint checkbox 
 * and it will validate the form and accordingly will set to the unified model
 *
 */
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

 /**
 * This function is called when user changes the Humidity value 
 * and it will validate the form and will set to the unified model
 *
 */
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

 /**
 * This function is used to validate a given value is a number or not 
 * @param {any} value is the input value will check whether it is a number or not
 *
 * @returns {boolean}  returns true if it is a number else will return as false 
 */
  isValidNumber(value: any): boolean {
    if (!value)
      return false;
    if (isNaN(value))
      return false;
    if (value <= 0)
      return false;
    return true;
  }

 /**
 * This function is used to check whether the thermal form is valid or not 
 *
 * @returns {boolean}  returns true if the form is valid else will return as false 
 */
  isFormValid(): boolean {
    return this.validateForm.valid;
  }
}
