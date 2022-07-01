import { Component, OnInit, OnDestroy, Input, ViewChild, SimpleChanges, OnChanges } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { ReportService } from 'src/app/app-structural/services/report.service';
import { BpsUnifiedProblem } from 'src/app/app-common/models/bps-unified-problem';
import { BpsUnifiedModel } from 'src/app/app-common/models/bps-unified-model';
import { AppconstantsService } from 'src/app/app-common/services/appconstants.service';
import { DomSanitizer } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { _ } from '@biesbjerg/ngx-translate-extract/dist/utils/utils';
import { takeUntil } from 'rxjs/operators';
import { ResultService } from 'src/app/app-structural/services/result.service';
import { IframeService } from 'src/app/app-structural/services/iframe.service';

@Component({
  selector: 'app-right-report',
  templateUrl: './right-report.component.html',
  styleUrls: ['./right-report.component.css']
})
export class RightReportComponent implements OnInit, OnDestroy, OnChanges {

  constructor(private reportService: ReportService, private resultService: ResultService, private iframeService: IframeService,
    private appConstantService: AppconstantsService, private sanitizer: DomSanitizer, private translate: TranslateService) { }

  @Input() currentProblem: BpsUnifiedProblem;
  @Input() listOfProblems: BpsUnifiedProblem[] = [];
  selectedProblemName: string = "";
  selectedProblemGuid: string = "";

  currentDisplayedData: BpsUnifiedProblem;

  physicsType: string = "";
  physicsTypeName: string = "";
  unifiedModel: BpsUnifiedModel = null;
  reportUrl: any = this.sanitizer.bypassSecurityTrustResourceUrl("/assets/Images/sps/sps_spsolver_white_logo.svg");
  reportFinishedLoading = false;
  private destroy$ = new Subject<void>();
  //new code
  radioValue: string
  data = [];
  listOfDisplayData = [];
  //new code
  /**
   * Gte the problem selected in the table of the left report component.
   * Enable/Disable the radio button according to the Analysis Result in the unified model
   * Load the first report enabled by default
   */
  ngOnInit(): void {
    // this.allDataSubscription = this.reportService.allConfigurationTableDataSubject.subscribe((data)=>{
    //   this.data = data;
    //   this.listOfDisplayData = [
    //     ...this.data
    //   ];
    // });

    //this.setToCurrentProblem();
    this.reportService.selectedProblemSubject.pipe(takeUntil(this.destroy$)).subscribe((rowData: any) => {
      this.currentDisplayedData = rowData;
      let problems = this.listOfProblems.filter(x => x.ProblemGuid == rowData.problemGuid);
      if (problems && problems.length == 1) {
        let problem = problems[0];
        this.selectedProblemName = problem.ProblemName;
        this.selectedProblemGuid = problem.ProblemGuid;
        this.unifiedModel = JSON.parse(problem.UnifiedModel);
        if (this.unifiedModel && this.unifiedModel.AnalysisResult) {
          this.radioValueADisabled = this.unifiedModel.AnalysisResult.AcousticResult ? false : true;
          this.radioValueBDisabled = this.unifiedModel.AnalysisResult.StructuralResult || this.unifiedModel.AnalysisResult.FacadeStructuralResult || this.unifiedModel.AnalysisResult.UDCStructuralResult  ? false : true;
          this.radioValueCDisabled = this.unifiedModel.AnalysisResult.ThermalResult ? false : true;
          if (this.unifiedModel.AnalysisResult.AcousticResult) {
            this.radioValue = 'Acoustic';
            this.physicsTypeName = this.translate.instant(_('report.acoustic-report'));
            // "Acoustic Report"
            this.loadReport(this.unifiedModel.AnalysisResult.AcousticResult.reportFileUrl);
          } else if (this.unifiedModel.AnalysisResult.StructuralResult) {
            this.radioValue = 'SummaryStructural';
            this.physicsTypeName = this.translate.instant(_('report.structural-report'));
            this.loadReport(this.unifiedModel.AnalysisResult.StructuralResult.reportFileUrl);
          } else if (this.unifiedModel.AnalysisResult.FacadeStructuralResult) { 
            this.radioValue = 'SummaryStructural';
            this.physicsTypeName = this.translate.instant(_('report.structural-report'));
            this.loadReport(this.unifiedModel.AnalysisResult.FacadeStructuralResult.reportFileUrl);
          } else if (this.unifiedModel.AnalysisResult.UDCStructuralResult) { 
            this.radioValue = 'SummaryStructural';
            this.physicsTypeName = this.translate.instant(_('report.structural-report'));
            this.loadReport(this.unifiedModel.AnalysisResult.UDCStructuralResult.reportFileUrl);
          } else if (this.unifiedModel.AnalysisResult.ThermalResult) {
            this.radioValue = 'Thermal';
            this.physicsTypeName = this.translate.instant(_('report.thermal-report'));
            this.loadReport(this.unifiedModel.AnalysisResult.ThermalResult.reportFileUrl);
          }
        } else {
          this.radioValueADisabled = true;
          this.radioValueBDisabled = true;
          this.radioValueCDisabled = true;
          this.FinishedLoadingReport();
        }
      } else {
        this.setToCurrentProblem();
        this.FinishedLoadingReport();
      }
    });

    this.reportService.refreshCurrentreport.pipe(takeUntil(this.destroy$)).subscribe((val) => {
      this.buildListOfDisplayData();
      if (val) {
        let currentPT = this.radioValue;
        this.radioValue = "0";
        this.onPhysicsTypeClicked(this.radioValue);

        setTimeout(() => {
          this.radioValue = currentPT;
          this.onPhysicsTypeClicked(this.radioValue);
        }, 1000);

      }
    });
  }

  ngOnChanges(Changes:SimpleChanges){
    if(Changes){
      
    }
  }
  
  ngAfterViewInit() {
    this.selectedProblemGuid = this.currentProblem.ProblemGuid;
    this.buildListOfDisplayData();
  }
  /**
   * Hides the animtion for the loading report
   */
  FinishedLoadingReport() {
    setTimeout(() => {
      this.reportFinishedLoading = true;
    }, 100);
  }
  /**
   * Load a report according to the param fetched from the back-end
   * @param param 
   */
  loadReport(param: any) { 
    param = param.split('/');
    this.resultService.GetReportURL(param[0], param[1], param[2].replace('.pdf', '')).subscribe((val) => {
      if (val)
        this.reportUrl = this.sanitizer.bypassSecurityTrustResourceUrl(val + "#toolbar=0&navpanes=0?v=" + new Date().getTime());
      else
        this.reportUrl = "";
      this.FinishedLoadingReport();
    });
  }

  /**
   * Strucutral regular tooltip text
   * @returns 
   */
  getStructuralRegularReportTooltip() {
    return this.translate.instant(_('report.structural-regular-report'));
  }

  /**
   * Strucutral full tooltip text
   * @returns 
   */
   getStructuralFullReportTooltip() {
    return this.translate.instant(_('report.structural-full-report'));
  }

  /**
   * Acoustic tooltip text
   * @returns 
   */
   getAcousticRegularReportTooltip() {
    return this.translate.instant(_('report.acoustic-regular-report'));
  }

  /**
   * thermal tooltip text
   * @returns 
   */
   getThermalRegularReportTooltip() {
    return this.translate.instant(_('report.thermal-regular-report'));
  }


/**
 * Create the list of all the problems
 */
  buildListOfDisplayData() {
    this.reportService.allConfigurationTableDataSubject.pipe(takeUntil(this.destroy$)).subscribe((data) => {
      setTimeout(() => {
        this.data = data.filter(x => !x.disabled);
        this.listOfDisplayData = [...this.data];
        if (this.listOfDisplayData && this.selectedProblemGuid) {
          let currentRowList = this.listOfDisplayData.filter(x => x.problemGuid == this.selectedProblemGuid);
          if (currentRowList && currentRowList.length == 1) {
            setTimeout(() => {
              this.selectTableRow(currentRowList[0]);
            }, 10);
          }
        }
      });
    });
  }

  setToCurrentProblem() {
    this.selectedProblemName = this.currentProblem && this.currentProblem.ProblemName ? this.currentProblem.ProblemName : null;
    this.selectedProblemGuid = this.currentProblem && this.currentProblem.ProblemGuid ? this.currentProblem.ProblemGuid : null;
    this.unifiedModel = JSON.parse(this.currentProblem.UnifiedModel);
    if (this.unifiedModel && this.unifiedModel.AnalysisResult) {
      this.radioValueADisabled = this.unifiedModel.AnalysisResult.AcousticResult ? false : true;
      this.radioValueBDisabled = this.unifiedModel.AnalysisResult.StructuralResult || this.unifiedModel.AnalysisResult.FacadeStructuralResult || this.unifiedModel.AnalysisResult.UDCStructuralResult ? false : true;
      this.radioValueCDisabled = this.unifiedModel.AnalysisResult.ThermalResult ? false : true;
      if (this.unifiedModel.AnalysisResult.AcousticResult) {
        this.radioValue = 'Acoustic';
        this.physicsTypeName = this.translate.instant(_('report.acoustic-report'));
        this.reportUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.appConstantService.APP_DOMAIN + this.unifiedModel.AnalysisResult.AcousticResult.reportFileUrl + "#toolbar=0&navpanes=0?v=" + new Date().getTime());
      } else if (this.unifiedModel.AnalysisResult.StructuralResult) {
        this.radioValue = 'SummaryStructural';
        this.physicsTypeName = this.translate.instant(_('report.structural-report'));
        this.reportUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.appConstantService.APP_DOMAIN + this.unifiedModel.AnalysisResult.StructuralResult.reportFileUrl + "#toolbar=0&navpanes=0?v=" + new Date().getTime());
      } else if (this.unifiedModel.AnalysisResult.FacadeStructuralResult) { 
        this.radioValue = 'SummaryStructural';
        this.physicsTypeName = this.translate.instant(_('report.structural-report'));
        this.reportUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.appConstantService.APP_DOMAIN + this.unifiedModel.AnalysisResult.FacadeStructuralResult.reportFileUrl + "#toolbar=0&navpanes=0?v=" + new Date().getTime());
      } else if (this.unifiedModel.AnalysisResult.UDCStructuralResult) { 
        this.radioValue = 'SummaryStructural';
        this.physicsTypeName = this.translate.instant(_('report.structural-report'));
        this.reportUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.appConstantService.APP_DOMAIN + this.unifiedModel.AnalysisResult.UDCStructuralResult.reportFileUrl + "#toolbar=0&navpanes=0?v=" + new Date().getTime());
      } else if (this.unifiedModel.AnalysisResult.ThermalResult) {
        this.radioValue = 'Thermal';
        this.physicsTypeName = this.translate.instant(_('report.thermal-report'));
        this.reportUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.appConstantService.APP_DOMAIN + this.unifiedModel.AnalysisResult.ThermalResult.reportFileUrl + "#toolbar=0&navpanes=0?v=" + new Date().getTime());
      }

    } else {
      this.radioValueADisabled = true;
      this.radioValueBDisabled = true;
      this.radioValueCDisabled = true;
    }
  }

  selectTableRow(data) {
    this.reportService.selectTableRowSubject.next(data);
    // if (this.gridComponent) {
    //   this.gridComponent.selectRow(data, true);
    // }
  }

  ngOnDestroy() {
      this.destroy$.next();
      this.destroy$.complete();
  }
  //#region temp code: will be replaced with new radio physics type options
  // valueA: boolean;
  // valueB: boolean;
  // valueC: boolean;
  radioValueADisabled = false;
  radioValueBDisabled = false;
  radioValueCDisabled = false;

  /**
   * Load the report of the related radio button
   * @param event radio button selected
   */
  onPhysicsTypeClicked(event: any) {
    this.reportFinishedLoading = false;
    if (event) {
      switch (this.radioValue) {
        case "Acoustic":
          this.loadReport(this.unifiedModel.AnalysisResult.AcousticResult.reportFileUrl);
          this.physicsTypeName = this.translate.instant(_('report.acoustic-report'));
          break;
        case "SummaryStructural":
          if (this.unifiedModel.AnalysisResult.StructuralResult) {
            this.loadReport(this.unifiedModel.AnalysisResult.StructuralResult.summaryFileUrl);
            this.physicsTypeName = this.translate.instant(_('report.structural-report'));
          } else if (this.unifiedModel.AnalysisResult.FacadeStructuralResult) {
            this.loadReport(this.unifiedModel.AnalysisResult.FacadeStructuralResult.summaryFileUrl);
            this.physicsTypeName = this.translate.instant(_('report.structural-report'));
          } else if (this.unifiedModel.AnalysisResult.UDCStructuralResult) {
            this.loadReport(this.unifiedModel.AnalysisResult.UDCStructuralResult.summaryFileUrl);
            this.physicsTypeName = this.translate.instant(_('report.structural-report'));
          }
          break;
        case "FullStrucural":
          if (this.unifiedModel.AnalysisResult.StructuralResult) {
            this.loadReport(this.unifiedModel.AnalysisResult.StructuralResult.reportFileUrl);
            this.physicsTypeName = this.translate.instant(_('report.structural-report'));
          } else if (this.unifiedModel.AnalysisResult.FacadeStructuralResult) {
            this.loadReport(this.unifiedModel.AnalysisResult.FacadeStructuralResult.reportFileUrl);
            this.physicsTypeName = this.translate.instant(_('report.structural-report'));
          } else if (this.unifiedModel.AnalysisResult.UDCStructuralResult) {
            this.loadReport(this.unifiedModel.AnalysisResult.UDCStructuralResult.reportFileUrl);
            this.physicsTypeName = this.translate.instant(_('report.structural-report'));
          }
          break;
        case "Thermal":
          this.loadReport(this.unifiedModel.AnalysisResult.ThermalResult.reportFileUrl);
          this.physicsTypeName = this.translate.instant(_('report.thermal-report'));
          break;
        case "0":
          this.reportUrl = this.sanitizer.bypassSecurityTrustResourceUrl("/assets/Images/sps/sps_spsolver_white_logo.svg");
          this.physicsTypeName = "";
          break;
      }

    }

  }
  // onPhysicsTypeAClicked(event: any) {
  //   if (event) {
  //     this.reportUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.appConstantService.APP_DOMAIN + this.unifiedModel.AnalysisResult.AcousticResult.reportFileUrl + "#toolbar=0&navpanes=0");
  //     this.physicsTypeName = this.translate.instant(_('report.acoustic-report'));
  //     this.valueB = false;
  //     this.valueC = false;
  //   }

  // }
  // onPhysicsTypeBClicked(event: any) {
  //   if (event) {
  //     this.reportUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.appConstantService.APP_DOMAIN + this.unifiedModel.AnalysisResult.StructuralResult.reportFileUrl + "#toolbar=0&navpanes=0");
  //     this.physicsTypeName = this.translate.instant(_('report.structural-report'));
  //     this.valueA = false;
  //     this.valueC = false;
  //   }

  // }
  // onPhysicsTypeCClicked(event: any) {
  //   if (event) {
  //     this.reportUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.appConstantService.APP_DOMAIN + this.unifiedModel.AnalysisResult.ThermalResult.reportFileUrl + "#toolbar=0&navpanes=0");
  //     this.physicsTypeName = this.translate.instant(_('report.thermal-report'));
  //     this.valueA = false;
  //     this.valueB = false;
  //   }

  // }
  //#endregion

}
