import { Component, Input, OnInit, Output, EventEmitter, OnChanges, SimpleChanges, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { BpsUnifiedModel, Structural } from 'src/app/app-common/models/bps-unified-model';
import { PanelsModule } from 'src/app/app-structural/models/panels/panels.module';
import { ConfigureService } from 'src/app/app-structural/services/configure.service';
import { UnifiedModelService } from 'src/app/app-structural/services/unified-model.service';

@Component({
  selector: 'app-load',
  templateUrl: './load.component.html',
  styleUrls: ['./load.component.css']
})
export class LoadComponent implements OnInit, OnChanges, AfterViewInit {

  //@Input() unified3DModel: BpsUnifiedModel;
  unified3DModel: BpsUnifiedModel;
  @Input() windPressureEvent: EventEmitter<number> = new EventEmitter<number>();
  default_windPressure_SRS = 1.68;
  windPressure: string;
  validateForm: FormGroup;
  @Input() orderPlaced: boolean;
  private destroy$ = new Subject<void>();
  constructor(private umService: UnifiedModelService, private fb: FormBuilder, private configureService: ConfigureService) {
    this.validateForm = this.fb.group({
      windPressure: [this.windPressure, [Validators.required]]
  }); 
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
          this.loadData();
        }
      });

 /**
 * This is observable of to load the load side panel values of WindLoad 
 * in the left configure 
 *
 */      
    this.umService.obsLoadSidePanel.pipe(takeUntil(this.destroy$)).subscribe(
      response => {
        if (response && response.panelsModule > -1 && response.finishedLoading) {
          if(response.panelsModule === PanelsModule.Load) this.windPressure = this.umService.get_WindLoad();
        }
      }
    );
  }

  ngOnChanges(Changes: SimpleChanges) {
    // if(Changes) {
    //   if (Changes.unified3DModel && Changes.unified3DModel.currentValue) {
    //     if (Changes.unified3DModel.previousValue) {
    //       if (Changes.unified3DModel.currentValue.ProblemSetting.ProblemGuid !== Changes.unified3DModel.previousValue.ProblemSetting.ProblemGuid) {
    //         this.loadData();
    //       }
    //     }
    //   }
    // }
  }

 /**
 * This function is to set the Windload value to the unified model 
 * and also will get the value from unified model and assign to the input fiels on page refresh
 *
 */
  loadData(){
    if(this.unified3DModel.ModelInput.Structural === null) {
      this.unified3DModel.ModelInput.Structural = new Structural();
      this.unified3DModel.ModelInput.Structural.WindLoad = this.default_windPressure_SRS;
    }
    if(this.unified3DModel && this.unified3DModel.ModelInput && this.unified3DModel.ModelInput.Structural){
      this.windPressure = this.unified3DModel.ModelInput.Structural.WindLoad ? this.unified3DModel.ModelInput.Structural.WindLoad.toFixed(2): "1.68";
    } 
   
    for (const key in this.validateForm.controls) {
      this.validateForm.controls[key].markAsDirty();
      this.validateForm.controls[key].markAsTouched();
      this.validateForm.controls[key].updateValueAndValidity();
    }
  }

 /**
 * This function is called when user changes the windload input 
 * and also will set load value to the unified model.
 *
 */
  onWindLoadChange(){
    if(this.unified3DModel && this.unified3DModel.ModelInput && this.unified3DModel.ModelInput.Structural){
      setTimeout(() => {
        if (!this.windPressure && this.unified3DModel.ModelInput.Structural.WindLoad) {
          this.windPressure = this.umService.get_WindLoad();
        }
        this.configureService.computeClickedSubject.next(false);
        this.umService.set_WindLoad(this.windPressure);
      });
    }
  }
}
