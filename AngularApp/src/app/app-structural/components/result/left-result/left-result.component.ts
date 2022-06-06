import { Component, OnInit, Input, EventEmitter, Output, OnChanges, SimpleChanges } from '@angular/core';
import { ConfigureService } from 'src/app/app-structural/services/configure.service';
import { BpsUnifiedModel } from 'src/app/app-common/models/bps-unified-model';
import { ResultService } from 'src/app/app-structural/services/result.service';
import { forkJoin } from 'rxjs';
import { AnalysisResult } from 'src/app/app-common/models/analysis-result';
import { AppconstantsService } from 'src/app/app-common/services/appconstants.service';
import { TranslateService } from '@ngx-translate/core';
import { _ } from '@biesbjerg/ngx-translate-extract/dist/utils/utils';
import { PermissionService } from 'src/app/app-core/services/permission.service';
import { Feature } from 'src/app/app-core/models/feature';

@Component({
  selector: 'app-left-result',
  templateUrl: './left-result.component.html',
  styleUrls: ['./left-result.component.css']
})
export class LeftResultComponent implements OnInit, OnChanges {

  constructor(private configureService: ConfigureService, private resultService: ResultService, private appConstantService: AppconstantsService, private translate: TranslateService,
    private permissionService:PermissionService) { }
  @Input() selectedThermalResultLabel: number;
  @Input() unified3DModel: BpsUnifiedModel;
  @Input() selectedStructuralIntermediate: number[];
  @Input() selectedStructuralIntermediateFacade: number[];
  @Output() sendPhysicsTypeEvent: EventEmitter<string> = new EventEmitter<string>();
  @Output() sendSelectedIntermediateGeneral: EventEmitter<number> = new EventEmitter();
  @Output() sendIntermediateRedColorGeneral: EventEmitter<any[]> = new EventEmitter();

  @Output() sendParentUnifiedModel: EventEmitter<BpsUnifiedModel> = new EventEmitter();
  isAcousticSelected: boolean = false;
  isStructuralSelected: boolean = false;
  isThermalSelected: boolean = false;

  isAcousticDisabled: boolean = false;
  isStructuralDisabled: boolean = false;
  isThermalDisabled: boolean = false;

  problemGuid: string;
  @Input() physicsType: string;

  isProductInfoVisible: boolean = false;
  path: string;
  productType: string;
  systemType: string;

  dimensions: string;
  acousticResultText: string = this.translate.instant(_('result.acoustic-result'));
  structuralResultText: string = this.translate.instant(_('result.structural-result'));
  thermalResultText: string = this.translate.instant(_('result.thermal-result'));

  ngOnInit(): void {
    this.refreshPanel();
  }
  GeometryGlassList = [];
  refreshPanel() {
    this.GeometryGlassList = [];
    // let physicsTypes: string[] = this.configureService.getPhysicsTypesSelected();
    this.problemGuid = this.unified3DModel && this.unified3DModel.ProblemSetting ? this.unified3DModel.ProblemSetting.ProblemGuid : null;
    if (this.unified3DModel) {
      if (this.unified3DModel.ModelInput) {
        if (this.unified3DModel.ModelInput.FrameSystem)
          this.systemType = this.unified3DModel.ModelInput.FrameSystem.SystemType;
        if (this.unified3DModel.ModelInput.Geometry && this.unified3DModel.ModelInput.Geometry.Points) {
          let max_X_Dimension: number = 0, max_Y_Dimension: number = 0;
          let xDimensions = this.unified3DModel.ModelInput.Geometry.Points.map(x => x.X);
          let yDimensions = this.unified3DModel.ModelInput.Geometry.Points.map(x => x.Y);
          if (xDimensions && xDimensions.length > 0)
            max_X_Dimension = xDimensions.reduce((a, b) => Math.max(a, b));
          if (yDimensions && yDimensions.length > 0)
            max_Y_Dimension = yDimensions.reduce((a, b) => Math.max(a, b));
          this.dimensions = (max_X_Dimension) + ' mm x ' + (max_Y_Dimension) + ' mm';
        }

        var arr = [];
        if(this.unified3DModel.ModelInput.Geometry.OperabilitySystems)
          this.unified3DModel.ModelInput.Geometry.OperabilitySystems.filter(f => f.VentOperableType !== null && f.InsertedWindowType !== null && f.VentArticleName !== '-1');
        this.GeometryGlassList = arr.filter((arr, index, self) =>
          index === self.findIndex((t) => (t.VentOperableType === arr.VentOperableType && t.InsertedWindowType === arr.InsertedWindowType && t.VentOpeningDirection === arr.VentOpeningDirection)))
        this.GeometryGlassList.forEach(element => {
          switch (element.VentOperableType) {
            case 'Side-Hung-Left':
              element.VentOperableType = this.translate.instant(_('result.side-hung-left'));
              break;
            case 'Side-Hung-Right':
              element.VentOperableType = this.translate.instant(_('result.side-hung-right'));
              break;
            case 'Bottom-Hung':
              element.VentOperableType = this.translate.instant(_('result.bottom-hung'));
              break;
            case 'Top-Hung':
              element.VentOperableType = this.translate.instant(_('result.top-hung'));
              break;
            case 'Parallel-Opening':
              element.VentOperableType = this.translate.instant(_('result.parallel-opening'));
              break;
            case 'Tilt-Turn-Left':
              element.VentOperableType = this.translate.instant(_('result.tilt-turn-left'));
              break;
            case 'Tilt-Turn-Right':
              element.VentOperableType = this.translate.instant(_('result.tilt-turn-right'));
              break;
          }
          switch (element.VentOpeningDirection) {
            case 'Inward':
              element.VentOpeningDirection = this.translate.instant(_('result.inward'));
              break;
            case 'Outward':
              element.VentOpeningDirection = this.translate.instant(_('result.outward'));
              break;
          }
        });
      }

      if (this.unified3DModel.ProblemSetting) {
        let problemSetting = this.unified3DModel.ProblemSetting;

        if (this.unified3DModel.AnalysisResult) {
          if ((this.physicsType == 'A' && !this.unified3DModel.AnalysisResult.AcousticResult)
            || (this.physicsType == 'B' && !(this.unified3DModel.AnalysisResult.StructuralResult || this.unified3DModel.AnalysisResult.FacadeStructuralResult))
            || (this.physicsType == 'C' && !this.unified3DModel.AnalysisResult.ThermalResult))
            this.physicsType = null;
        } else
          this.physicsType = null;
        if (problemSetting) {
          if (problemSetting.ProductType) {
            if (problemSetting.ProductType == 'Window')
              this.productType = this.translate.instant(_('result.window'));
            else if (problemSetting.ProductType == 'Facade')
              this.productType = this.translate.instant(_('result.facade'));
          }
          if (!this.physicsType) {
            if (problemSetting.EnableAcoustic) {
              this.physicsType = 'A';

            } else if (problemSetting.EnableStructural) {
              this.physicsType = 'B';

            } else if (problemSetting.EnableThermal) {
              this.physicsType = 'C';

            }
          }
        }

        // this.selectPhysicsType();
        // let problemSetting = this.unified3DModel.ProblemSetting;
        this.isAcousticDisabled = !problemSetting.EnableAcoustic;
        this.isStructuralDisabled = !problemSetting.EnableStructural;
        this.isThermalDisabled = !problemSetting.EnableThermal;


        //this.getResults(physicsTypes);
        this.sendPhysicsTypeToParent();
      }
    }
  }

  ngOnChanges(Changes: SimpleChanges) {
    if (Changes.unified3DModel && !Changes.unified3DModel.firstChange) {
      this.refreshPanel();
    }
  }

  selectPhysicsType() {
    switch (this.physicsType) {
      case 'A':
        this.isAcousticSelected = true;
        this.isStructuralSelected = false;
        this.isThermalSelected = false;
        break;
      case 'B':
        this.isStructuralSelected = true;
        this.isAcousticSelected = false;
        this.isThermalSelected = false;
        break;
      case 'C':
        this.isThermalSelected = true;
        this.isStructuralSelected = false;
        this.isAcousticSelected = false;
        break;
    }
  }

  sendPhysicsTypeToParent(): void {
    this.selectPhysicsType();
    this.sendPhysicsTypeEvent.emit(this.physicsType);
  }
  onReceiveSelectedIntermediateGeneral(val: number) {
    this.sendSelectedIntermediateGeneral.emit(val);
  }

  onReceiveIntermediateRedColor(val: any[]) {
    this.sendIntermediateRedColorGeneral.emit(val);
  }
  // getResults(physicsTypes: string[]) {

  //   if (this.unified3DModel) {
  //     if (this.configureService.isNavigatedFromRightresult) {
  //       this.configureService.isNavigatedFromRightresult = false;
  //       if (this.unified3DModel.BpsAnalysisResult.AcousticResult)
  //         this.resultService.isAcousticComputed = true;
  //       if (this.unified3DModel.BpsAnalysisResult.StructuralResult)
  //         this.resultService.isStructuralComputed = true;
  //       if (this.unified3DModel.BpsAnalysisResult.ThermalResult)
  //         this.resultService.isThermalComputed = true;
  //     } else {
  //       let calls = [];
  //       if (physicsTypes.includes("Acoustic")) {
  //         calls.push(this.resultService.runAcousticAnalysis(this.unified3DModel));
  //       }
  //       if (physicsTypes.includes("Structural")) {
  //         calls.push(this.resultService.runStructuralAnalysis(this.unified3DModel));
  //       }
  //       if (physicsTypes.includes("Thermal")) {
  //         calls.push(this.resultService.runThermalAnalysis(this.unified3DModel));
  //       }

  //       forkJoin(...calls)
  //         .subscribe((response) => {
  //           let acousticResponse = response.filter((x: BpsUnifiedModel) => x.BpsAnalysisResult && x.BpsAnalysisResult.AcousticResult);
  //           if (acousticResponse && acousticResponse.length > 0) {
  //             this.resultService.acousticResultSubject.next(acousticResponse[0]);
  //             if (acousticResponse[0] && acousticResponse[0].BpsAnalysisResult && acousticResponse[0].BpsAnalysisResult.AcousticResult) {
  //               if (!this.unified3DModel.BpsAnalysisResult)
  //                 this.unified3DModel.BpsAnalysisResult = new BpsAnalysisResult();
  //               this.unified3DModel.BpsAnalysisResult.AcousticResult = acousticResponse[0].BpsAnalysisResult.AcousticResult;
  //             }
  //           }
  //           let structuralResponse = response.filter((x: BpsUnifiedModel) => x.BpsAnalysisResult && x.BpsAnalysisResult.StructuralResult);
  //           if (structuralResponse && structuralResponse.length > 0) {
  //             this.resultService.structuralResultSubject.next(structuralResponse[0]);
  //             if (structuralResponse[0] && structuralResponse[0].BpsAnalysisResult && structuralResponse[0].BpsAnalysisResult.StructuralResult) {
  //               if (!this.unified3DModel.BpsAnalysisResult)
  //                 this.unified3DModel.BpsAnalysisResult = new BpsAnalysisResult();
  //               this.unified3DModel.BpsAnalysisResult.StructuralResult = structuralResponse[0].BpsAnalysisResult.StructuralResult;
  //             }
  //           }
  //           let thermalResponse = response.filter((x: BpsUnifiedModel) => x.BpsAnalysisResult && x.BpsAnalysisResult.ThermalResult);
  //           if (thermalResponse && thermalResponse.length > 0) {
  //             this.resultService.thermalResultSubject.next(thermalResponse[0]);
  //             if (thermalResponse[0] && thermalResponse[0].BpsAnalysisResult && thermalResponse[0].BpsAnalysisResult.ThermalResult) {
  //               if (!this.unified3DModel.BpsAnalysisResult)
  //                 this.unified3DModel.BpsAnalysisResult = new BpsAnalysisResult();
  //               this.unified3DModel.BpsAnalysisResult.ThermalResult = thermalResponse[0].BpsAnalysisResult.ThermalResult;
  //             }
  //           }
  //           if (this.unified3DModel && this.unified3DModel.BpsAnalysisResult
  //             && (this.unified3DModel.BpsAnalysisResult.AcousticResult
  //               || this.unified3DModel.BpsAnalysisResult.StructuralResult
  //               || this.unified3DModel.BpsAnalysisResult.ThermalResult)) {
  //             this.sendParentUnifiedModel.emit(this.unified3DModel);
  //           }
  //         });
  //     }
  //   }
  // }

  showProductInfoModal() {
    this.configureService.GetScreenshotURL(this.problemGuid).subscribe(imageURL => {
      if (imageURL) {
        this.path = imageURL;
        this.isProductInfoVisible = true;
      }
    }, (error) => {
      this.path = this.permissionService.checkPermission(Feature.WindowDefaultImageV2) ? '/assets/Images/window_default_SRS.png' : '/assets/Images/window__default.png';
    });
  }
  setDefaultImage() {
    this.path = this.permissionService.checkPermission(Feature.WindowDefaultImageV2)?'/assets/Images/window_default_SRS.png':'/assets/Images/window__default.png';
    //this.path = '/assets/Images/window__default.png';
  }
  handleCancel() {
    this.isProductInfoVisible = false;
  }
}
