import { Component, OnInit, EventEmitter, Output, Input, OnDestroy } from '@angular/core';
import { BpsUnifiedProblem } from 'src/app/app-common/models/bps-unified-problem';
import { ConfigureService } from 'src/app/app-structural/services/configure.service';
import { BpsSimplifiedProblem } from 'src/app/app-common/models/bps-simplified-problem';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';
import { NavLayoutService } from 'src/app/app-layout/services/nav-layout.service';
import { BpsUnifiedModel, ProblemSetting } from 'src/app/app-common/models/bps-unified-model';
import { ResultService } from 'src/app/app-structural/services/result.service';
import { AnalysisResult } from 'src/app/app-common/models/analysis-result';
import { Subject, Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { _ } from '@biesbjerg/ngx-translate-extract/dist/utils/utils';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-right-result',
  templateUrl: './right-result.component.html',
  styleUrls: ['./right-result.component.css']
})
export class RightResultComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  @Output() eventEmitter: EventEmitter<BpsUnifiedProblem> = new EventEmitter();
  problem: BpsUnifiedProblem;
  projectGuid: string;
  problemList: BpsUnifiedProblem[];
  currentIndex: number;
  @Input() physicsType: string;
  @Output() changeProblemSettingEvent: EventEmitter<ProblemSetting> = new EventEmitter<ProblemSetting>();
  rightPanelOpened: boolean;
  bpsAnalysisResult: boolean[] = [];
  currentProblemGuid: string;
  notComputedText: string = this.translate.instant(_('report.not-computed'));
  constructor(private router: Router, private cookieService: CookieService,
    private configureService: ConfigureService, private navLayoutService: NavLayoutService,
    private resultService: ResultService, private translate: TranslateService
  ) { }

  /**
   * Observable to get the selected problem
   */
  ngOnInit(): void {
    this.configureService.problemSubject.pipe(takeUntil(this.destroy$)).subscribe(problem => {
      if (this.configureService.isSelectedFromRightResultPanel) {
        this.configureService.isSelectedFromRightResultPanel = false;
        this.configureService.runLoadJsonSelectForResult.next(true);
        this.router.navigate(['/result/', problem.ProblemGuid]);
      }
      this.problem = problem;
      this.currentProblemGuid = problem.ProblemGuid;
      let unifiedModel: BpsUnifiedModel = JSON.parse(this.problem.UnifiedModel);
      this.projectGuid = unifiedModel && unifiedModel.ProblemSetting
        ? unifiedModel.ProblemSetting.ProjectGuid : null;
      this.updateList();
    }
    );
    this.configureService.rightPanelOpenedSubject.pipe(takeUntil(this.destroy$)).subscribe(isDisplay => {
      this.rightPanelOpened = isDisplay;
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
  /**
   * Update the list of problems from the back-end
   */
  updateList() {
    this.configureService.GetProblemsForProject(this.projectGuid).subscribe(problems => {
      this.problemList = problems;
      for (let i = 0; i < this.problemList.length; i++) {
        let unifiedModel = JSON.parse(this.problemList[i].UnifiedModel);
        this.bpsAnalysisResult[i] = false;
        if (unifiedModel && unifiedModel.AnalysisResult)
          this.bpsAnalysisResult[i] = true;
        if (this.problem.ProblemGuid === this.problemList[i].ProblemGuid) {
          this.currentIndex = i;
        }
      }
    });
  }

  /**
   * Select a problem : update the unified model of the problem everywhere
   * @param i index of the problem in the problem list
   */
  onClick(i: number) {
    this.problem = this.problemList[i];
    this.currentIndex = i;

    if (this.problem) {
      this.resultService.physicsTypeSelected = this.physicsType;
      this.configureService.rightPanelOpenedSubject.next(true);
      let unifiedModel: BpsUnifiedModel = JSON.parse(this.problem.UnifiedModel);
      if (unifiedModel) {
        if (unifiedModel.ProblemSetting) {
          this.changeProblemSettingEvent.emit(unifiedModel.ProblemSetting);
        }
        if (unifiedModel.AnalysisResult) {
          // let event= {acoustic: false, structural: false, thermal: false, product: null};
          // let event = new ProblemSetting();
          // if (unifiedModel.BpsAnalysisResult.AcousticResult)
          //   event.EnableAcoustic = true;
          // if (unifiedModel.BpsAnalysisResult.StructuralResult)
          //   event.EnableStructural = true;
          // if (unifiedModel.BpsAnalysisResult.ThermalResult)
          //   event.EnableThermal = true;
          // event.ProductType = "Window";
          // this.changeProblemSettingEvent.emit(event);
          // this.configureService.changePhysicsNProductStatus(event);
        } else {
          this.configureService.sendMessage(false);
        }
      }
      this.configureService.configureCall = true;
      this.configureService.setProblemShow(this.problem.ProblemGuid);
      this.configureService.isSelectedFromRightResultPanel = true;
      // this.router.navigate(['']);
      // setTimeout (() => {
      //   this.router.navigate(['/result/', this.problem.ProblemGuid]);
      // }, 100);


    }

    // this.configureService.GetProblemByGuid(this.problem.ProblemGuid)
    // this.configureService.problemSubject.subscribe(problem => {
    //   this.eventEmitter.emit(problem);
    // });
    //this.router.navigate(['/result/', this.problem.ProblemGuid]);
    //this.updateList();
  }
}

