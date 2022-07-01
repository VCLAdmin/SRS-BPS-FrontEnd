import { Component, OnInit, Input, Output, ViewChild, TemplateRef, ChangeDetectorRef, OnDestroy, AfterViewInit, EventEmitter } from '@angular/core';
import { ConfigureService } from 'src/app/app-structural/services/configure.service';
import { BpsUnifiedProblem } from 'src/app/app-common/models/bps-unified-problem';
import { CeldType, BpsTableComponent } from 'bps-components-lib';
import { BpsUnifiedModel } from 'src/app/app-common/models/bps-unified-model';
import { ReportService } from 'src/app/app-structural/services/report.service';
import * as JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { Observable, Subject, Subscription, zip } from 'rxjs';
import { HttpResponse } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { _ } from '@biesbjerg/ngx-translate-extract/dist/utils/utils';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { takeUntil } from 'rxjs/operators';
import { ResultService } from 'src/app/app-structural/services/result.service';
import { IframeService } from 'src/app/app-structural/services/iframe.service';
import { DomSanitizer } from '@angular/platform-browser';
import { DownloadService } from 'src/app/app-layout/services/download.service';

declare var tinymce: any;
@Component({
  selector: 'app-left-report',
  templateUrl: './left-report.component.html',
  styleUrls: ['./left-report.component.css']
})
export class LeftReportComponent implements OnInit, OnDestroy, AfterViewInit  {
  @ViewChild('fullReportCellTemplate', { read: TemplateRef, static: true }) fullReportCellTemplate: TemplateRef<{}>;
  @ViewChild('configColTemplate', { read: TemplateRef, static: true }) configColTemplate: TemplateRef<{}>;
  @ViewChild('noteColTemplate', { read: TemplateRef, static: true }) noteColTemplate: TemplateRef<{}>;
  @ViewChild('regReportColTemplate', { read: TemplateRef, static: true }) regReportColTemplate: TemplateRef<{}>;
  @ViewChild('fullReportColTemplate', { read: TemplateRef, static: true }) fullReportColTemplate: TemplateRef<{}>;
  @ViewChild('noteTemplate', { read: TemplateRef, static: true }) noteTemplate: TemplateRef<{}>;
  @ViewChild('cellTemplate', { read: TemplateRef, static: true }) cellTemplate: TemplateRef<{}>;
  @ViewChild('bpsExampleTable', { read: BpsTableComponent, static: false }) gridComponent: BpsTableComponent;

  private destroy$ = new Subject<void>();

  constructor(private fb: FormBuilder,
    private configureService: ConfigureService,
    private sanitizer: DomSanitizer,
    private downloadService: DownloadService,
    private cdr: ChangeDetectorRef,
    private resultService: ResultService,
    private iframeService: IframeService,
    private reportService: ReportService,
    private translate: TranslateService) {
    this.validateForm = this.fb.group({
      comment: ['', [Validators.required]]
    });
    }

  @Input() projectName: string;

  @Input() projectLocation: string;
  @Input() problemGuid: string;

  @Input() projectGuid: string; //ProjectGuid to get all the problems
  @Input() listOfProblems: BpsUnifiedProblem[] = [];

  @Input() currentProblem: BpsUnifiedProblem;

  @Output() ngNotificaionShow: EventEmitter<any> = new EventEmitter<any>();
  //#region new code

  configurationCustomGrid: any;
  listOfDisplayData = [];
  data = [];
  valueA = true;
  valueB = false;
  isOperating = false;
  isAllDisplayDataCheckedAcoustic = false;
  isAllDisplayDataCheckedStructural = false;
  isAllDisplayDataCheckedThermal = false;
  isAllDisplayDataCheckedFullReport = false;
  isAllDisplayDataDisabledAcoustic = false;
  isAllDisplayDataDisabledStructural = false;
  isAllDisplayDataDisabledThermal = false;

  mapOfCheckedIdAcoustic: { [key: string]: boolean } = {};
  mapOfCheckedIdStructural: { [key: string]: boolean } = {};
  mapOfCheckedIdThermal: { [key: string]: boolean } = {};
  mapOfCheckedIdFullStructural: { [key: string]: boolean } = {};
  numberOfCheckedAcoustic = 0;
  numberOfCheckedStructuralSummary = 0;
  numberOfCheckedStructuralFull = 0;
  numberOfCheckedThermal = 0;

  //popup change starts
  isNotesModalVisible: boolean = false;
  disabled: boolean = true;
  comment: string;
  // hideEditor : boolean = true;
  //editorIsValid : boolean = false;
  validateForm: FormGroup;
  //popup change ends

  currentProblemGuidMoreOption: string;
  selectedNotesProblemGuid: string;

  enableDownload: boolean = false;
  selectedProblem: any;

  areAllReportsReady: boolean = false;

  notComputedText: string = this.translate.instant(_('report.not-computed'));
  noteAdded: string = this.translate.instant(_('report.note-added'));
  addNotes: string = this.translate.instant(_('report.add-notes'));
  // reportNotReadyModal_title: string = this.translate.instant(_('report.report-not-ready'));
  reportNotReadyModal_title: string = '"Structural Full report" is not ready!';
  reportNotReadyModal_text: string = 'The report will be available shortly for download.';

  reportNotReadyModal_isVisible = false;

  /**
   * Show a notification that the report is not ready
   */
  reportNotReadyModal_handleOk(): void {
    this.reportNotReadyModal_isVisible = false;
  }

  /**
   * Hide the notification that the report is not ready
   */
  reportNotReadyModal_handleCancel(): void {
    this.reportNotReadyModal_isVisible = false;
  }

  /**
   * Strutural has two columns (summary and full reports) so the columns are disabled by default 
   * Enable a column only if has related AnalysisResult in the unified model
   * Set the table properties for the HTML code.
   * Fetch the problems to populate the table
   */
  ngAfterViewInit() {
    let disabledAcousticColumn: boolean = true, disabledStructuralColumn: boolean = true, disabledThermalColumn: boolean = true;
    this.listOfProblems.forEach((problem) => {
      if (disabledAcousticColumn || disabledStructuralColumn || disabledThermalColumn) {
        let unifiedModel: BpsUnifiedModel = JSON.parse(problem.UnifiedModel);
        if (unifiedModel && unifiedModel.AnalysisResult) {
          if (disabledAcousticColumn && unifiedModel.AnalysisResult.AcousticResult)
            disabledAcousticColumn = false;
          if (disabledStructuralColumn && (unifiedModel.AnalysisResult.StructuralResult || unifiedModel.AnalysisResult.FacadeStructuralResult || unifiedModel.AnalysisResult.UDCStructuralResult))
            disabledStructuralColumn = false;
          if (disabledThermalColumn && unifiedModel.AnalysisResult.ThermalResult)
            disabledThermalColumn = false;
        }
      }
    });
    this.configurationCustomGrid = {
      fields: [
        {
          celdType: CeldType.Default,
          property: 'configuration',
          width: '210px',
          template: {
            ref: this.configColTemplate,
            context: {}
          }
        },
        {
          celdType: CeldType.TemplateRef,
          property: 'note',
          width: '55px',
          template: {
            ref: this.noteColTemplate,
            context: {}
          },
          ngClass: {
            [`bps-centered`]: true,
            [`bps-no-padding`]: true
          }
        },
        {
          celdType: CeldType.TemplateRef,
          property: 'status',
          width: '110px',
          template: {
            ref: this.regReportColTemplate,
            context: {
              disabledAcoustic: disabledAcousticColumn,
              disabledStructural: disabledStructuralColumn,
              disabledThermal: disabledThermalColumn
            }
          },
          ngClass: {
            [`bps-no-padding`]: true,
          }
        },
        {
          celdType: CeldType.TemplateRef,
          property: 'options',
          width: '80px',
          template: {
            ref: this.fullReportColTemplate,
            context: {}
          },
          ngClass: {
            [`bps-centered`]: true,
            [`bps-no-padding`]: true,
          }
        },
      ],
      fieldId: 'id'
    };
    this.getAllProblems();
  }

  /**
   * Whenever the user changes the configuration to display on right panel, the table selects the new row selected
   */
  ngOnInit(): void {
    this.reportService.selectTableRowSubject.pipe(takeUntil(this.destroy$)).subscribe(data => {
      if (this.gridComponent && data) {
        this.gridComponent.selectRow(data, true);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Display and hide the loading display of the table while the status are refreshed
   */
  operateData(): void {
    this.isOperating = true;
    setTimeout(() => {
      this.refreshStatusAcoustic();
      this.refreshStatusStructural();
      this.refreshStatusThermal();
      this.refreshFullStatusReport();
      this.isOperating = false;
    }, 1000);
  }

  /**
   * Map the configurations data to parse in the table component
   */
  loadData(): void {
    this.data = [];
    for (let i = 0; i < this.listOfProblems.length; i++) {
      let problemCell: BpsUnifiedProblem = this.listOfProblems[i];
      let unifiedModelPerCell: BpsUnifiedModel = JSON.parse(problemCell.UnifiedModel);
      let isComputed = unifiedModelPerCell && unifiedModelPerCell.AnalysisResult ? false : true;
      let item = {
        id: '' + i,
        configuration: problemCell.ProblemName,
        note: {
          ref: this.noteTemplate,
          context: {
            index: i,
            id: problemCell.ProblemGuid,
            disabled: isComputed,
            disabledNote: unifiedModelPerCell && unifiedModelPerCell.ProblemSetting && unifiedModelPerCell.ProblemSetting.UserNotes ? false : true

          }
        },
        status: {
          ref: this.cellTemplate,
          context: {
            id: '' + i,
            disabled: isComputed,
            disabledAcoustic: !(unifiedModelPerCell && unifiedModelPerCell.AnalysisResult && unifiedModelPerCell.AnalysisResult.AcousticResult),
            disabledStructural: !(unifiedModelPerCell && unifiedModelPerCell.AnalysisResult && (unifiedModelPerCell.AnalysisResult.StructuralResult || unifiedModelPerCell.AnalysisResult.FacadeStructuralResult || unifiedModelPerCell.AnalysisResult.UDCStructuralResult)),
            disabledThermal: !(unifiedModelPerCell && unifiedModelPerCell.AnalysisResult && unifiedModelPerCell.AnalysisResult.ThermalResult)
          }
        },
        options: {
          ref: this.fullReportCellTemplate,
          context: {
            index: i,
            id: '' + i,
            disabled: !(unifiedModelPerCell && unifiedModelPerCell.AnalysisResult
              && (unifiedModelPerCell.AnalysisResult.StructuralResult && unifiedModelPerCell.AnalysisResult.StructuralResult.summaryFileUrl ||
                unifiedModelPerCell.AnalysisResult.FacadeStructuralResult && unifiedModelPerCell.AnalysisResult.FacadeStructuralResult.summaryFileUrl ||
                unifiedModelPerCell.AnalysisResult.UDCStructuralResult && unifiedModelPerCell.AnalysisResult.UDCStructuralResult.summaryFileUrl))
          }
        },
        disabled: isComputed,
        disabledAcoustic: !(unifiedModelPerCell && unifiedModelPerCell.AnalysisResult && unifiedModelPerCell.AnalysisResult.AcousticResult),
        disabledStructural: !(unifiedModelPerCell && unifiedModelPerCell.AnalysisResult && (unifiedModelPerCell.AnalysisResult.StructuralResult || unifiedModelPerCell.AnalysisResult.FacadeStructuralResult || unifiedModelPerCell.AnalysisResult.UDCStructuralResult)),
        disabledThermal: !(unifiedModelPerCell && unifiedModelPerCell.AnalysisResult && unifiedModelPerCell.AnalysisResult.ThermalResult),
        problemGuid: problemCell.ProblemGuid
      };

      this.data.push(item);
    }
    this.reportService.sendAllData(this.data);
  }

  /**
   * Select or Unselect the cells of the Acoustic column
   * The download button is enable when at least one report is selected
   * @param $event
   * @param id 
   */
  refreshStatusAcoustic($event = false, id = null): void {
    if (id !== null && id !== undefined) {
      this.mapOfCheckedIdAcoustic[id] = $event;
    }
    this.isAllDisplayDataCheckedAcoustic = this.listOfDisplayData.filter(item => !item.disabledAcoustic).length > 0 && this.listOfDisplayData
      .filter(item => !item.disabledAcoustic)
      .every(item => this.mapOfCheckedIdAcoustic[item.id]);
    this.isAllDisplayDataDisabledAcoustic = this.listOfDisplayData.filter(item => !item.disabledAcoustic).length == 0;
    this.numberOfCheckedAcoustic = this.data.filter(item => this.mapOfCheckedIdAcoustic[item.id]).length;
    let totalEnabledChecks = this.numberOfCheckedAcoustic + this.numberOfCheckedStructuralSummary + this.numberOfCheckedThermal + this.numberOfCheckedStructuralFull;
    if (totalEnabledChecks > 0) {
      this.enableDownload = true;
    } else
      this.enableDownload = false;
  }

  /**
   * Select or Unselect the cells of the structural summary column
   * The download button is enable when at least one report is selected
   * @param $event
   * @param id 
   */
  refreshStatusStructural($event = false, id = null): void {
    if (id !== null && id !== undefined) {
      this.mapOfCheckedIdStructural[id] = $event;
    }
    this.isAllDisplayDataCheckedStructural = this.listOfDisplayData
    .filter(item => !item.disabledStructural).length > 0 && this.listOfDisplayData
      .filter(item => !item.disabledStructural)
      .every(item => this.mapOfCheckedIdStructural[item.id]);
    this.isAllDisplayDataDisabledStructural = this.listOfDisplayData.filter(item => !item.disabledStructural).length == 0;
    this.numberOfCheckedStructuralSummary = this.data.filter(item => this.mapOfCheckedIdStructural[item.id]).length;
    let totalEnabledChecks = this.numberOfCheckedAcoustic + this.numberOfCheckedStructuralSummary + this.numberOfCheckedThermal + this.numberOfCheckedStructuralFull;
    if (totalEnabledChecks > 0) {
      this.enableDownload = true;
    } else
      this.enableDownload = false;
  }

  /**
   * Select or Unselect the cells of the structural full column
   * The download button is enable when at least one report is selected
   * @param $event
   * @param id 
   */
   refreshFullStatusReport($event = false, id = null): void {
    if (id !== null && id !== undefined) {
      this.mapOfCheckedIdFullStructural[id] = $event;
    }
    this.isAllDisplayDataCheckedFullReport = this.listOfDisplayData
      .filter(item => !item.disabledStructural).length > 0
      &&
      this.listOfDisplayData
        .filter(item => !item.disabledStructural)
        .every(item => this.mapOfCheckedIdFullStructural[item.id]);

    this.numberOfCheckedStructuralFull = this.data.filter(item => this.mapOfCheckedIdFullStructural[item.id]).length;
    let totalEnabledChecks = this.numberOfCheckedAcoustic + this.numberOfCheckedStructuralSummary + this.numberOfCheckedThermal + this.numberOfCheckedStructuralFull;
    if (totalEnabledChecks > 0) {
      this.enableDownload = true;
    } else
      this.enableDownload = false;
  }

  /**
   * Select or Unselect the cells of the thermal column
   * The download button is enable when at least one report is selected
   * @param $event
   * @param id 
   */
   refreshStatusThermal($event = false, id = null): void {
    if (id !== null && id !== undefined) {
      this.mapOfCheckedIdThermal[id] = $event;
    }
    this.isAllDisplayDataCheckedThermal = this.listOfDisplayData
    .filter(item => !item.disabledThermal).length > 0 && this.listOfDisplayData
      .filter(item => !item.disabledThermal)
      .every(item => this.mapOfCheckedIdThermal[item.id]);
    this.isAllDisplayDataDisabledThermal = this.listOfDisplayData.filter(item => !item.disabledThermal).length == 0;
    this.numberOfCheckedThermal = this.data.filter(item => this.mapOfCheckedIdThermal[item.id]).length;
    let totalEnabledChecks = this.numberOfCheckedAcoustic + this.numberOfCheckedStructuralSummary + this.numberOfCheckedThermal + this.numberOfCheckedStructuralFull;
    if (totalEnabledChecks > 0) {
      this.enableDownload = true;
    } else
      this.enableDownload = false;
  }

  /**
   * Select or Unselect all the acoustic cells
   * @param value Boolean for the selection or unselection
   */
  checkAllAcoustic(value: boolean): void {
    this.listOfDisplayData.filter(item => !item.disabled).forEach(item => (this.mapOfCheckedIdAcoustic[item.id] = value));
    this.refreshStatusAcoustic();
  }

  /**
   * Select or Unselect all the structural summary cells
   * @param value Boolean for the selection or unselection
   */
   checkAllStructural(value: boolean): void {
    this.listOfDisplayData.filter(item => !item.disabled).forEach(item => (this.mapOfCheckedIdStructural[item.id] = value));
    this.refreshStatusStructural();
  }

  /**
   * Select or Unselect all the thermal cells
   * @param value Boolean for the selection or unselection
   */
   checkAllThermal(value: boolean): void {
    this.listOfDisplayData.filter(item => !item.disabled).forEach(item => (this.mapOfCheckedIdThermal[item.id] = value));
    this.refreshStatusThermal();
  }

  stopPropagation($event: Event) {
    $event.stopImmediatePropagation();
    $event.stopPropagation();
  }

  log($event) {

  }

  /**
   * @param disabledAcoustic If disabled : Not computed
   * @returns Text to display in the tooltip when hover an acoustic cell
   */
  getAcousticTooltip(disabledAcoustic) {
    return disabledAcoustic ? this.translate.instant(_('report.not-computed')):this.translate.instant(_('configure.acoustic'));
  }

  /**
   * @param disabledAcoustic If disabled : Not computed
   * @returns Text to display in the tooltip when hover a structural cell
   */
  getStructuralTooltip(disabledStructural) {
    return disabledStructural ? this.translate.instant(_('report.not-computed')):this.translate.instant(_('configure.structural'));
  }

  /**
   * @param disabledAcoustic If disabled : Not computed
   * @returns Text to display in the tooltip when hover a thermal cell
   */
  getThermalTooltip(disabledThermal) {
    return disabledThermal ? this.translate.instant(_('report.not-computed')):this.translate.instant(_('configure.thermal'));
  }

  //#endregion new code ends
  //technical code below

/**
 * Get the file name from the response headers of the download request.
 * Needed to know which report category (acoustic, summary structural, ...) it is
 * @param resp 
 * @returns 
 */
  getFileName(resp: HttpResponse<Blob>): string {
    let fileName = "Report.pdf";
    if (resp.headers && resp.headers.get('content-disposition')) {
      if (resp.headers.get('content-disposition').split('filename=') && resp.headers.get('content-disposition').split('filename=').length > 0)
        if (resp.headers.get('content-disposition').split('filename=')[1].split(" ") && resp.headers.get('content-disposition').split('filename=')[1].split(".pdf").length > 0) {
          if (resp.headers.get('content-disposition').split('filename=')[1].split(".pdf")[0]) {
            // fileName = resp.headers.get('content-disposition').split('filename=')[1].split(" ")[1].replace(/"/g, '').replace(';', '').replace('.pdf', '');
            let str = resp.headers.get('content-disposition').split('filename=')[1].split(".pdf")[0];
            fileName = str.substring(str.lastIndexOf(" ") + 1, str.length);
          }

        }
    }
    return fileName;
  }

/**
 * Get the configuration name from the response headers of the download request.
 * Needed to know which report category (acoustic, summary structural, ...) it is
 * @param resp 
 * @returns 
 */
 getConfigurationName(resp: HttpResponse<Blob>): string {
    let configurationName = "Configuration";
    if (resp.headers && resp.headers.get('content-disposition')
    && resp.headers.get('content-disposition').split('filename=').length > 1
    && resp.headers.get('content-disposition').split('filename=')[1].split('.pdf').length > 0) {
      
      let filename = resp.headers.get('content-disposition').split('filename=')[1].replace(/"/g, '').split(';')[0];
      configurationName = filename.replace('_acoustic_report.pdf','')
                                  .replace('_structural_summary_report.pdf','')
                                  .replace('_structural_report.pdf','')
                                  .replace('_thermal_report.pdf','');
    }
    return configurationName;
  }

  /**
   * 
   * @param reportFileUrl 
   * @returns the parameters of the report file url
   */
  getBuildParam(reportFileUrl: string) {
    return reportFileUrl.split('/');
  }

  /**
   * For each type of report, get the configurations to download report
   * For each configuration, build the url for the call to the back-end (1 call for each report to download)
   * Send all the calls and wait for their responses
   * For each response, get the problemGuid and the report type from the response headers to rename it
   * Zip all the files
   * 
   * If one response fails (report not ready!), the download stops and a notification is displayed
   */
  onDownloadClick() {
    let totalCount = 0;
    let language;
    //let reportArr : any[] = [];
    let ids: number[] = [];
    let selectedIconsAcoutic = [];
    let selectedIconsStructural = [];
    let selectedIconsStructuralFull = [];
    let selectedIconsThermal = [];
    if (this.data.filter(item => this.mapOfCheckedIdAcoustic[item.id]).length > 0)
      selectedIconsAcoutic = this.data.filter(item => this.mapOfCheckedIdAcoustic[item.id]);
    if (this.data.filter(item => this.mapOfCheckedIdStructural[item.id]).length > 0)
      selectedIconsStructural = this.data.filter(item => this.mapOfCheckedIdStructural[item.id]);
    if (this.data.filter(item => this.mapOfCheckedIdFullStructural[item.id]).length > 0)
      selectedIconsStructuralFull = this.data.filter(item => this.mapOfCheckedIdFullStructural[item.id]);
    if (this.data.filter(item => this.mapOfCheckedIdThermal[item.id]).length > 0)
      selectedIconsThermal = this.data.filter(item => this.mapOfCheckedIdThermal[item.id]);
    let calls = [];
    if (selectedIconsAcoutic.length > 0 || selectedIconsStructural.length > 0 || selectedIconsThermal.length > 0 || selectedIconsStructuralFull.length > 0) {
      // totalCount += selectedIconsAcoutic.length;
      this.listOfProblems.forEach((problem) => {
        let unifiedModel: BpsUnifiedModel;
        let reportFileUrl = null;
        if (selectedIconsAcoutic.some(x => x.problemGuid == problem.ProblemGuid)) {
          unifiedModel = JSON.parse(problem.UnifiedModel);
          if (!language)
            language = unifiedModel.UserSetting.Language;
          if (unifiedModel && unifiedModel.AnalysisResult && unifiedModel.AnalysisResult.AcousticResult) {
            var param = this.getBuildParam(unifiedModel.AnalysisResult.AcousticResult.reportFileUrl);
            calls.push(this.configureService.GetPCReport(param[0], param[1], param[2].replace('.pdf', ''), problem.ProblemName.replace(' ', '_')));
          }
        }
        if (selectedIconsStructuralFull.some(x => x.problemGuid == problem.ProblemGuid)) {
          unifiedModel = unifiedModel ? unifiedModel : JSON.parse(problem.UnifiedModel);
          if (!language)
            language = unifiedModel.UserSetting.Language;
          if (unifiedModel && unifiedModel.AnalysisResult && (unifiedModel.AnalysisResult.StructuralResult || unifiedModel.AnalysisResult.FacadeStructuralResult || unifiedModel.AnalysisResult.UDCStructuralResult)) {
            if (unifiedModel.AnalysisResult.StructuralResult && unifiedModel.AnalysisResult.StructuralResult.reportFileUrl)
              reportFileUrl = unifiedModel.AnalysisResult.StructuralResult.reportFileUrl;
            else if (unifiedModel.AnalysisResult.FacadeStructuralResult && unifiedModel.AnalysisResult.FacadeStructuralResult.reportFileUrl)
              reportFileUrl = unifiedModel.AnalysisResult.FacadeStructuralResult.reportFileUrl;
            else if (unifiedModel.AnalysisResult.UDCStructuralResult && unifiedModel.AnalysisResult.UDCStructuralResult.reportFileUrl)
              reportFileUrl = unifiedModel.AnalysisResult.UDCStructuralResult.reportFileUrl;
            if (reportFileUrl) {
              var param = this.getBuildParam(reportFileUrl);
              calls.push(this.configureService.GetPCReport(param[0], param[1], param[2].replace('.pdf', ''), problem.ProblemName.replace(' ', '_')));
            }
          }
        }
        if (selectedIconsStructural.some(x => x.problemGuid == problem.ProblemGuid)) {
          unifiedModel = unifiedModel ? unifiedModel : JSON.parse(problem.UnifiedModel);
          if (!language)
            language = unifiedModel.UserSetting.Language;
          if (unifiedModel && unifiedModel.AnalysisResult && (unifiedModel.AnalysisResult.StructuralResult || unifiedModel.AnalysisResult.FacadeStructuralResult || unifiedModel.AnalysisResult.UDCStructuralResult)) {
            if(unifiedModel.AnalysisResult.StructuralResult && unifiedModel.AnalysisResult.StructuralResult.summaryFileUrl  )
              reportFileUrl = unifiedModel.AnalysisResult.StructuralResult.summaryFileUrl;
            else if(unifiedModel.AnalysisResult.FacadeStructuralResult && unifiedModel.AnalysisResult.FacadeStructuralResult.summaryFileUrl)
              reportFileUrl = unifiedModel.AnalysisResult.FacadeStructuralResult.summaryFileUrl;
            else if(unifiedModel.AnalysisResult.UDCStructuralResult && unifiedModel.AnalysisResult.UDCStructuralResult.summaryFileUrl)
              reportFileUrl = unifiedModel.AnalysisResult.UDCStructuralResult.summaryFileUrl;
            if (reportFileUrl) {
              var param = this.getBuildParam(reportFileUrl);
              calls.push(this.configureService.GetPCReport(param[0], param[1], param[2].replace('.pdf', ''), problem.ProblemName.replace(' ', '_')));
            }
          }
        }
        if (selectedIconsThermal.some(x => x.problemGuid == problem.ProblemGuid)) {
          unifiedModel = unifiedModel ? unifiedModel : JSON.parse(problem.UnifiedModel);
          if (!language)
            language = unifiedModel.UserSetting.Language;
          if (unifiedModel && unifiedModel.AnalysisResult && unifiedModel.AnalysisResult.ThermalResult) {
            var param = this.getBuildParam(unifiedModel.AnalysisResult.ThermalResult.reportFileUrl);
            calls.push(this.configureService.GetPCReport(param[0], param[1], param[2].replace('.pdf', ''), problem.ProblemName.replace(' ', '_')));
          }
        }
      });
      language = language && language == 'de-DE' ? 'en-DE' : 'en-US';
      let dateFormat = language && language == 'de-DE' ? 'dd_MMM_yyyy' : 'MMM_dd_yyyy';
      let pipe = new DatePipe(language);
      zip(...calls).pipe(takeUntil(this.destroy$)).subscribe(
        responses => {
          if (responses) {
            this.areAllReportsReady = true;
            const zip = new JSZip();
            const name = this.projectName + '_' + this.projectLocation + '_' + pipe.transform(Date.now(), dateFormat) + '.zip';
            //responses.forEach((response: any) => {
            for(let index in responses) {
              var response: any = responses[index];
              if (response && this.areAllReportsReady) {
                let configurationName = this.getConfigurationName(response);
                let fileName = this.getFileName(response);
                let acoustic_folder, structural_folder, thermal_folder;
                if (fileName.toLowerCase().includes('acoustic') || fileName.toLowerCase().includes('akustik')) {
                  let fullFileName = configurationName + '_' + this.translate.instant(_('report.acoustic-regular-report')) + '_' + pipe.transform(Date.now(), dateFormat) + '.pdf';
                  let folderName = fileName.split('_')[0];
                  acoustic_folder = acoustic_folder ? acoustic_folder : zip.folder(folderName);
                  acoustic_folder.file(fullFileName, response.body);
                } else if (fileName.toLowerCase().includes('structural') || fileName.toLowerCase().includes('statik')) {
                  let fullFileName = '';
                  if (fileName.toLowerCase().includes('summary') || fileName.toLowerCase().includes('zusammenfassung')) {
                    fullFileName = configurationName + '_' + this.translate.instant(_('report.structural-regular-report')) + '_' + pipe.transform(Date.now(), dateFormat) + '.pdf';
                  }
                  else {
                    fullFileName = configurationName + '_' + this.translate.instant(_('report.structural-full-report')) + '_' + pipe.transform(Date.now(), dateFormat) + '.pdf';
                  }
                  let folderName = fileName.split('_')[0];
                  structural_folder = structural_folder ? structural_folder : zip.folder(folderName);
                  structural_folder.file(fullFileName, response.body);
                } else if (fileName.toLowerCase().includes('thermal') || fileName.toLowerCase().includes('thermisch')) {
                  let fullFileName = configurationName + '_' + this.translate.instant(_('report.thermal-regular-report')) + '_' + pipe.transform(Date.now(), dateFormat) + '.pdf';
                  let folderName = fileName.split('_')[0];
                  thermal_folder = thermal_folder ? thermal_folder : zip.folder(folderName);
                  thermal_folder.file(fullFileName, response.body);
                } else {
                  let fullFileName = fileName + '_' + pipe.transform(Date.now(), dateFormat) + '.pdf';
                  zip.file(fullFileName, response.body);
                }
              }
              else {
                this.areAllReportsReady = false;
                //this.reportNotReadyModal_isVisible = true;
                break;
              }
            };
            if (this.areAllReportsReady) {
              zip.generateAsync({ type: 'blob' }).then((content) => {
                if (content) {
                  saveAs(content, name);
                }
              });  
            }
            else {
              setTimeout(() => {
              if (this.areAllReportsReady == false)
                  this.ngNotificaionShow.next({ title: this.reportNotReadyModal_title, message: this.reportNotReadyModal_text, logoToShow: 'WarningReport' });
              }, 1);
            }
          }
        }, err => console.log('error ' + err),
        () => console.log('Ok ')
      );

      // if (calls.length == 1) {
      //   let reportRequest = {
      //     "FolderPath": "/Content/acoustic-result/3fb4e6aa-e27a-42c6-b8d4-3541b64f29b8/7b76407a-5876-47a7-b29a-c472a89ece20/7e0dab4f-8059-4680-acc4-704181101a78/",
      //     "ReportFileName": "u Acoustic_Report.pdf"
      //   };
      //   this.configureService.GetReport(reportRequest).pipe(takeUntil(this.destroy$)).subscribe(
      //     (resp: HttpResponse<Blob>) => {
      //       if (resp) {
      //         let fileName = "Report.pdf";
      //         if (resp.headers && resp.headers.get('content-disposition')) {
      //           if (resp.headers.get('content-disposition').split('=') && resp.headers.get('content-disposition').split('=').length > 0)
      //             if (resp.headers.get('content-disposition').split('=')[1].split(" ") && resp.headers.get('content-disposition').split('=')[1].split(" ").length > 0) {
      //               if (resp.headers.get('content-disposition').split('=')[1].split(" ")[1])
      //                 fileName = resp.headers.get('content-disposition').split('=')[1].split(" ")[1].replace('"', '');
      //             }
      //         }

      //         saveAs(resp.body, fileName);
      //       }
      //     });
      // } else if (calls.length > 1)
      //   zip (...calls).pipe(takeUntil(this.destroy$)).subscribe(
      //     fileDataList => {
      //       const zip = new JSZip();
      //       const name = 'BPS Reports' + '.zip';
      //       for (let counter = 0; counter < fileDataList.length; counter++) {
      //         zip.file('Acoustic' + counter + '.pdf', fileDataList[counter]);
      //       }
      //       zip.generateAsync({ type: 'blob' }).then((content) => {
      //         if (content) {
      //           saveAs(content, name);
      //         }
      //       });
      //     }, err => console.log('error ' + err),
      //     () => console.log('Ok ')
      //   );
    }
  }

  /**
   * Inform the right panel that a new configuration has been selected
   * @param event new row selected
   */
  onRowSelected(event: any) {
    if (event && event.data) {
      if (event.selected) {
        let selectedProblem = this.listOfDisplayData.filter(x => event.data.problemGuid && x.problemGuid == event.data.problemGuid);
        if (selectedProblem && selectedProblem.length > 0) {
          this.selectedProblem = selectedProblem[0];
          this.reportService.selectedProblemSubject.next(selectedProblem[0]);
        }
      } else {
        this.reportService.selectedProblemSubject.next(null);
      }
    }

  }

  /**
   * Select or Unselect all the structural full cells
   * @param value Boolean for the selection or unselection
   */
   checkAllFullReport(value: boolean): void {
    this.listOfDisplayData.filter(item => !item.disabled).forEach(item => (this.mapOfCheckedIdFullStructural[item.id] = value));
    this.refreshFullStatusReport();
  }

/**
 * When the user changes the name of a problem,
 * it creates a url for the renaming in the back-end (configureService.RenameProblem)
 * it creates urls for the report renaming in the back-end
 * all the urls are sent at the same time
 * @param event 
 */
  onProblemNameEdit(event: any) {
    if (event && event.length > 0 && event[0].problemGuid) {
      let selectedProblemList = this.listOfProblems.filter(x => x.ProblemGuid == event[0].problemGuid);
      if (selectedProblemList && selectedProblemList[0]) {
        selectedProblemList[0].ProblemName = event[0].configuration;
        let selectedProblem = selectedProblemList[0];
        let unifiedModel: BpsUnifiedModel = JSON.parse(selectedProblem.UnifiedModel);
        if (unifiedModel && unifiedModel.ProblemSetting) {
          unifiedModel.ProblemSetting.ConfigurationName = event[0].configuration;
          this.iframeService.setShowLoader(true);
          let calls = [];

          let reportURLs = [];
          let newProblemName = event[0].configuration;
          if (unifiedModel.AnalysisResult.AcousticResult !== null) {
            reportURLs.push(unifiedModel.AnalysisResult.AcousticResult.reportFileUrl);
          }
          if (unifiedModel.AnalysisResult.FacadeStructuralResult !== null) {
            reportURLs.push(unifiedModel.AnalysisResult.FacadeStructuralResult.reportFileUrl);
          }
          if (unifiedModel.AnalysisResult.StructuralResult !== null) {
            reportURLs.push(unifiedModel.AnalysisResult.StructuralResult.reportFileUrl);
          }
          if (unifiedModel.AnalysisResult.ThermalResult !== null) {
            reportURLs.push(unifiedModel.AnalysisResult.ThermalResult.reportFileUrl);
          }
          if (unifiedModel.AnalysisResult.UDCStructuralResult !== null) {
            reportURLs.push(unifiedModel.AnalysisResult.UDCStructuralResult.reportFileUrl);
          }
          calls.push(this.resultService.RenameProblem({ reportURLs, newProblemName }));
          calls.push(this.configureService.RenameProblem(unifiedModel));
          zip(...calls).pipe(takeUntil(this.destroy$)).subscribe(
            response => {
              if (response) {
                this.cdr.detectChanges();
                this.handleCancel();
                this.selectedRowForNotes = null;
                if (this.selectedProblem.problemGuid == event[0].problemGuid)
                  this.reportService.refreshCurrentreport.next(true);
                this.iframeService.setShowLoader(false);
              }
            }, err => console.log('error ' + err),
            () => console.log('Ok ')
          );
        }
      }

    }
  }

  /**
   * Fetch all the problems to display in the table
   */
  getAllProblems() {

    this.loadData();
    this.listOfDisplayData = [
      ...this.data
    ];
    this.operateData();
    this.cdr.detectChanges();
  }

  //popup change starts
  unifiedModelForNotes: BpsUnifiedModel;
  selectedRowForNotes: any;
  currentUserNotes: string = "";
  showNotesModal($event: any, selectedRowProblemGuid: string) {
    this.currentUserNotes = null;
    this.unifiedModelForNotes = null;
    this.selectedRowForNotes = null;
    this.selectedNotesProblemGuid = selectedRowProblemGuid;
    $event.stopImmediatePropagation();
    $event.stopPropagation();
    this.isNotesModalVisible = true;
    if (this.selectedNotesProblemGuid) {
      let selectedProblemList = this.listOfProblems.filter(x => x.ProblemGuid == this.selectedNotesProblemGuid);
      this.selectedRowForNotes = this.listOfDisplayData.filter(x => x.problemGuid == this.selectedNotesProblemGuid);
      if (selectedProblemList && selectedProblemList.length == 1) {
        let selectedProblem = selectedProblemList[0]
        let unifiedModel: BpsUnifiedModel = JSON.parse(selectedProblem.UnifiedModel);
        this.unifiedModelForNotes = unifiedModel;
        if (unifiedModel && unifiedModel.ProblemSetting && unifiedModel.ProblemSetting.UserNotes) {
          this.comment = unifiedModel.ProblemSetting.UserNotes;
          this.currentUserNotes = this.comment;
        }
      }
    }
    //this.hideEditor = false;
  }

  /**
   * Hides the note pop up
   */
  handleCancel() {

    this.isNotesModalVisible = false;
    this.resetForm();
  }

  /**
   * Build all the urls to edit the reports with the new note.
   * Send all the urls at the same time
   * 
   * @param value Notes written by the user
   */
  submitForm(value: any): void {
    for (const key in this.validateForm.controls) {
      this.validateForm.controls[key].markAsDirty();
      this.validateForm.controls[key].updateValueAndValidity();
    }
    if (this.unifiedModelForNotes) {
      this.unifiedModelForNotes.ProblemSetting.UserNotes = this.comment;
      this.iframeService.setShowLoader(true);
      let calls = [];

      let reportURLs = [];
      let userNotes = this.comment;
      if (this.unifiedModelForNotes.AnalysisResult.AcousticResult !== null) {
        reportURLs.push(this.unifiedModelForNotes.AnalysisResult.AcousticResult.reportFileUrl);
      }
      if (this.unifiedModelForNotes.AnalysisResult.FacadeStructuralResult !== null) {
        reportURLs.push(this.unifiedModelForNotes.AnalysisResult.FacadeStructuralResult.reportFileUrl);
      }
      if (this.unifiedModelForNotes.AnalysisResult.StructuralResult !== null) {
        reportURLs.push(this.unifiedModelForNotes.AnalysisResult.StructuralResult.reportFileUrl);
      }
      if (this.unifiedModelForNotes.AnalysisResult.ThermalResult !== null) {
        reportURLs.push(this.unifiedModelForNotes.AnalysisResult.ThermalResult.reportFileUrl);
      }
      if (this.unifiedModelForNotes.AnalysisResult.UDCStructuralResult !== null) {
        reportURLs.push(this.unifiedModelForNotes.AnalysisResult.UDCStructuralResult.reportFileUrl);
      }
      calls.push(this.resultService.UpdateUserNotes({ reportURLs, userNotes }));
      calls.push(this.reportService.updateUserNotes(this.unifiedModelForNotes));

      zip(...calls).pipe(takeUntil(this.destroy$)).subscribe(
        response => {
          if (response) {
            let selectedProblemList = this.listOfProblems.filter(x => x.ProblemGuid == this.selectedNotesProblemGuid);
            if (selectedProblemList && selectedProblemList[0]) {
              let unifiedModelString = JSON.stringify(this.unifiedModelForNotes);
              selectedProblemList[0].UnifiedModel = unifiedModelString;
            }
            this.unifiedModelForNotes = null;
            if (this.selectedRowForNotes && this.selectedRowForNotes.length == 1 && this.selectedRowForNotes[0].note && this.selectedRowForNotes[0].note.context) {
              this.selectedRowForNotes[0].note.context.disabledNote = this.comment ? false : true;
              this.listOfDisplayData = [...this.listOfDisplayData];
              let data = this.listOfDisplayData;
              this.listOfDisplayData = [];
              this.listOfDisplayData = [...data];
              this.cdr.detectChanges();
            }

            this.handleCancel();
            this.selectedRowForNotes = null;
            if (this.selectedProblem.problemGuid == this.selectedNotesProblemGuid)
              this.reportService.refreshCurrentreport.next(true);
            this.iframeService.setShowLoader(false);
          }
        }, err => console.log('error ' + err),
        () => console.log('Ok ')
      );
    }
  }

  resetForm(): void {
    this.validateForm.reset();
    // tslint:disable-next-line:forin
    for (const key in this.validateForm.controls) {
      this.validateForm.controls[key].markAsPristine();
      this.validateForm.controls[key].updateValueAndValidity();
    }
  }

  isValid() {
    if (this.comment)
      return true;
    else if (this.currentUserNotes && !this.comment) {
      return true;
    }
  }
  //popup change ends

}
