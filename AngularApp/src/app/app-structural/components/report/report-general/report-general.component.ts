import { Component, OnInit, OnDestroy, AfterViewInit, ViewChild } from '@angular/core';
import { NavLayoutService } from 'src/app/app-layout/services/nav-layout.service';
import { ConfigureService } from 'src/app/app-structural/services/configure.service';
import { BpsUnifiedModel } from 'src/app/app-common/models/bps-unified-model';
import { Subject, Subscription } from 'rxjs';
import { BpsUnifiedProblem } from 'src/app/app-common/models/bps-unified-problem';
import { takeUntil } from 'rxjs/operators';
import { IframeService } from 'src/app/app-structural/services/iframe.service';
import { NotificationService } from 'src/app/app-common/services/notification.service';
import { NotificationCustomComponent } from "src/app/app-structural/components/project/notification/notification-custom/notification-custom.component";

@Component({
  selector: 'app-report-general',
  templateUrl: './report-general.component.html',
  styleUrls: ['./report-general.component.css']
})
export class ReportGeneralComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild(NotificationCustomComponent) notifCustomTemplate: NotificationCustomComponent;
  private destroy$ = new Subject<void>();

  constructor(private navLayoutService: NavLayoutService, private configureService: ConfigureService,
    private iframeService: IframeService) { }
  projectName: string; // Name of the Project for all problems

  projectLocation: string;
  projectGuid: string;
  currentProblem: BpsUnifiedProblem;

  listOfProblems: BpsUnifiedProblem[];
  ngOnInit(): void {
    // this.navLayoutService.isEmptyPage.next(false);
    // this.navLayoutService.changeNavBarVisibility(true);
    // this.navLayoutService.changeNavBarButtonAndTitleVisibility(true);
     ////isEmpty: boolean, navBarVisibility: boolean, navBarAndTitleVisibility: boolean
   this.navLayoutService.changeNavBarSettings(false,true,true);
    let problemGuid = this.navLayoutService.getRouteParam('problemGuid');
    this.configureService.GetProblemByGuid(problemGuid);
    this.configureService.problemSubject.pipe(takeUntil(this.destroy$)).subscribe((response) => {
      this.projectName = this.configureService.projectName;
      this.currentProblem = response;
      let unifiedModel: BpsUnifiedModel = JSON.parse(response.UnifiedModel);
      if (unifiedModel && unifiedModel.ProblemSetting) {
        this.projectGuid = unifiedModel.ProblemSetting.ProjectGuid;
        this.projectLocation = unifiedModel.ProblemSetting.Location;
      }
      if (this.projectGuid) {
        this.configureService.GetProblemsForProject(this.projectGuid).pipe(takeUntil(this.destroy$)).subscribe((listOfProblems) => {
          this.listOfProblems = listOfProblems;
        });
      }
    });
    this.obsNotificaionShow.subscribe((event) => {
      this.ngNotificaionShow(event);
    });
  }


  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  showLoader = false;
  ngAfterViewInit() {
    //#region Loader
    this.iframeService.sendShowLoaderObs.pipe(takeUntil(this.destroy$)).subscribe(
      response => {
        setTimeout(() => { this.showLoader = response; }, 100);
      });
    //#endregion
  }

  ngNotificaionShow(event: any) {
    this.notifCustomTemplate.notificationShow(event.title, event.message, event.logoToShow);
  }

  private sujNotificaionShow: Subject<any> = new Subject<any>();
  obsNotificaionShow = this.sujNotificaionShow.asObservable();
  setNotificaionShow(event: any) {
    this.sujNotificaionShow.next(event);
  };

  

}
