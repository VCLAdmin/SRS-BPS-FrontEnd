import { Component, OnInit, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { IFrameEvent } from 'src/app/app-structural/models/iframe-exchange-data';
import { BpsUnifiedModel } from 'src/app/app-common/models/bps-unified-model';
import { CookieService } from 'ngx-cookie-service';
import { NavLayoutService } from 'src/app/app-layout/services/nav-layout.service';
import { ConfigureService } from 'src/app/app-structural/services/configure.service';
import { BpsUnifiedProblem } from 'src/app/app-common/models/bps-unified-problem';
import { ResultService } from 'src/app/app-structural/services/result.service';
import { ResizeEvent } from 'angular-resizable-element';
import { ProblemSetting } from '../../../../app-common/models/bps-unified-model';
import { IframeService } from 'src/app/app-structural/services/iframe.service';
import { takeUntil } from 'rxjs/operators';
@Component({
  selector: 'app-result-general',
  templateUrl: './result-general.component.html',
  styleUrls: ['./result-general.component.css']
})
export class ResultGeneralComponent implements OnInit, AfterViewInit, OnDestroy {
  private destroy$ = new Subject<void>();
  constructor(private cookieService: CookieService,
    private navLayoutService: NavLayoutService,
    private iframeService: IframeService,
    private configureService: ConfigureService,
    private resultService: ResultService) { }
  URL: string = '/assets/static-pages/ThreeDCanvas.html';
  public iframeEvent: Subject<IFrameEvent> = new Subject<IFrameEvent>();
  unified3DModel: BpsUnifiedModel;
  selectedThermalResultLabel: number;

  rightPanelOpened: boolean;
  problem: BpsUnifiedProblem
  physicsType: string;

  selectedStructuralIntermediate: number[];
  selectedStructuralIntermediateFacade: number[];

  isThermalResult = false;
  public style: object = {};

  isResizingRightPanel: boolean = false;
  showLoader: boolean = false;
  @ViewChild("acousticPerforamnce") acousticPerforamnceComponent: any;
  /**
   * Initialisation of the result page : get the unified model with its results
   */
  ngOnInit(): void {
    // this.resultService.structuralAnalysis = null;
    // this.resultService.thermalAnalysis = null;
    // this.resultService.acousticAnalysis = null;
    //this.navLayoutService.changeNavBarVisibility(true);
    // this.navLayoutService.isEmptyPage.next(false);
    // this.navLayoutService.changeNavBarVisibility(true);
    // this.navLayoutService.changeNavBarButtonAndTitleVisibility(true);
     ////isEmpty: boolean, navBarVisibility: boolean, navBarAndTitleVisibility: boolean
   this.navLayoutService.changeNavBarSettings(false,true,true)
    if (this.resultService.physicsTypeSelected) {
      setTimeout(() => {
        this.physicsType = this.resultService.physicsTypeSelected;
      });
    }
    
    let problemGuid = this.navLayoutService.getRouteParam('problemGuid');
    this.configureService.GetProblemByGuid(problemGuid);
    this.configureService.problemSubject.pipe(takeUntil(this.destroy$)).subscribe((response) => {
      if (response && response.UnifiedModel)
        this.unified3DModel = JSON.parse(response.UnifiedModel);
    });
    this.rightPanelOpened = this.configureService.rightPanelOpened;
    this.configureService.rightPanelOpenedSubject.pipe(takeUntil(this.destroy$)).subscribe(isDisplay =>
      this.rightPanelOpened = isDisplay);

    this.configureService.runLoadJsonSelectForResult.pipe(takeUntil(this.destroy$)).subscribe((val) => {
      if (val) {
        this.onChildEvents({ eventType: "readyState", value: true });
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
  ngAfterViewInit() {

  }

  onLoaded(loaded: boolean) {
    if (this.unified3DModel) {
      if (this.unified3DModel.AnalysisResult && this.unified3DModel.AnalysisResult.ThermalResult)
        this.isThermalResult = true;
      //  this.loadJSONService({ Unified3DModel: this.unified3DModel, canBeDrawn: true });
      // this.LoadDisplaySettings();
    }
  }
  /**
   * Listen to the child component events to execute some actions
   * @param event child component event
   */
  onChildEvents(event: any) {
    switch (event.eventType) {
      case 'readyState':
        if (event.value && this.unified3DModel) {
          setTimeout(() => { this.showLoader = true; }, 1);
           this.loadJSONService({ Unified3DModel: this.unified3DModel, canBeDrawn: true });
        }
        break;
      case 'loadJSONFinished':
        setTimeout(() => {
          this.LoadDisplaySettings();
          this.showLoader = false;
        }, 200);
        break;
      case 'selectThermalResultLabel':
        this.selectedThermalResultLabel = event.value.selectedLabel;
        break;
      case 'selectIntermediate': //for Structural Result: Mulliom, Transom
        this.selectedStructuralIntermediate = event.value.selectedIntermediateIDs;
        break;
      case 'selectFacadeMemeber': //REMOVE ONCE ALL EVENTS ARE ADDED --//\\--
        this.selectedStructuralIntermediateFacade = event.value.selectedFacadeMemeberIDs;
        break;
    }
  }
  /**
   * Display the window if the physicstype is selected on structural or thermal
   */
  LoadDisplaySettings() {
    let displaySettings = {};
    if (this.physicsType == 'B' || this.physicsType == 'C') {
      if (this.physicsType == 'C') {
        displaySettings = {
          showThreeDView: false,
          showAxes: false,
          showGlassID: true,
          showVentInfo: false,
          showGrid: true,
          showGlazingTypeColor: true,
          showControls: false,
          enableOrbitControls: false,
          showThermalResultLabel: true,
          showStructuralResultColor: false
        }
      } else {
        displaySettings = {
          showThreeDView: false,
          showAxes: false,
          showGlassID: false,
          showVentInfo: false,
          showGrid: true,
          showGlazingTypeColor: false,
          showControls: false,
          enableOrbitControls: true,
          showThermalResultLabel: false,
          showStructuralResultColor: true,
          showQuickCheckSymbols: true
        }
      }
      this.iframeEvent.next(new IFrameEvent('loadDisplaySetting',
        {
          settings: displaySettings
        }));
    }

  }

  onOpenCloseRightPanel(): void {
    this.configureService.changeRightPanelDisplay();
  }

  /**
   * New problem selected from the right panel
   * @param problem New problem to load
   */
  listenForRightPanel(problem: BpsUnifiedProblem) {
    this.problem = problem;
    this.unified3DModel = JSON.parse(problem.UnifiedModel);
    setTimeout(() => { this.showLoader = true; }, 1);
     this.loadJSONService({ Unified3DModel: this.unified3DModel, canBeDrawn: true });
  }

  /**
   * If a new physics type is selected, the new settings are displayed
   * If acoustic is not selected, the audio performance is stopped
   * @param physicsType 
   */
  onReceivePhysicsType(physicsType): void {
    setTimeout(() => {
      this.physicsType = physicsType; // A for acoustic, B for structural C for thermal
      if (this.physicsType) {
        this.LoadDisplaySettings();
        switch (this.physicsType) {
          case "B":
            if (this.acousticPerforamnceComponent) {
              this.acousticPerforamnceComponent.stopAudio();
            }
            break;
          case "C":
            if (this.acousticPerforamnceComponent) {
              this.acousticPerforamnceComponent.stopAudio();
            }
            break;
        }
      }
    });
  }

  /**
   * Select intermediate event from left panel
   * @param intermediateId 
   */
  onReceiveSelectedIntermediate(intermediateId: number) {
    this.iframeEvent.next(new IFrameEvent('selectIntermediateById',
      {
        id: intermediateId
      }));
  }

  /**
   * Load a new unified model
   * @param val
   */
  onReceiveUnifiedModel(val: BpsUnifiedModel) {
    this.unified3DModel = val;
    if (!this.isThermalResult) {
      this.onLoaded(true);
    }
  }

  /**
   * Highlight intermediate by id event from the left panel
   * @param val 
   */
  onReceiveIntermediateRedColorGeneral(val: any[]) {
    if (val && val.length > 0) {
      val.forEach(member => {
        if (member.id && member.color) {
          this.iframeEvent.next(new IFrameEvent('highlightIntermediateById', {
            id: member.id,
            color: member.color
          }));
        }
      });
    }
  }

  /**
   * Validation of the expansion of the right panel
   * @param event 
   * @returns 
   */
  validate(event: ResizeEvent): boolean {
    const MIN_DIMENSIONS_PX: number = 235;
    const MAX_DIMENSIONS_PX: number = 800;
    if (
      event.rectangle.width && ((event.rectangle.width < MIN_DIMENSIONS_PX) || (event.rectangle.width > MAX_DIMENSIONS_PX))
    ) {
      return false;
    }
    return true;
  }

  /**
   * Right panel expansion event
   * @param event
   */
  onResizeEnd(event: ResizeEvent): void {
    this.style = {
      position: 'absolute',
      left: `${event.rectangle.left}px`,
      width: `${event.rectangle.width}px`,
    };
    this.isResizingRightPanel = false;
  }

  
  /**
   * Right panel expansion event
   * @param event
   */
  onResizeStart(event: ResizeEvent): void {
    this.isResizingRightPanel = true;
  }


  changeProblemSetting(problemSetting: ProblemSetting) {
    this.unified3DModel.ProblemSetting = problemSetting;
  }
  loadJSONService(data: any) {
    this.iframeService.loadJSON(this.iframeEvent, 'loadJSON', data);
  }
}
