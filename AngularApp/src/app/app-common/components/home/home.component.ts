import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavLayoutService } from 'src/app/app-layout/services/nav-layout.service';
import { HomeService } from '../../services/home.service';
import { BpsProject } from '../../models/bps-project';
import { CommonService } from '../../services/common.service';
import { PermissionService } from 'src/app/app-core/services/permission.service';
import { Feature } from 'src/app/app-core/models/feature';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  constructor(private navLayoutService: NavLayoutService, private homeService: HomeService, private commonService: CommonService, private permissionService: PermissionService) { }
  updateProjectList: boolean = false;
  projects: BpsProject[];
  isOperating = false;
  ngOnInit(): void {
    // this.navLayoutService.isEmptyPage.next(false);
    // this.navLayoutService.changeNavBarVisibility(true);
    // this.navLayoutService.changeNavBarButtonAndTitleVisibility(false);
    ////isEmpty: boolean, navBarVisibility: boolean, navBarAndTitleVisibility: boolean
   this.navLayoutService.changeNavBarSettings(false,true,false)
    this.isOperating = false;
    if (this.permissionService.checkPermission(Feature.GetProjects)) {
      this.homeService.GetProjects().pipe(takeUntil(this.destroy$)).subscribe(bpsProject => {
        this.projects = bpsProject.sort((a, b) => (a.ProjectId > b.ProjectId ? -1 : 1));
        this.isOperating = true;
      });
    }
    else if(this.permissionService.checkPermission(Feature.GetSRSProjects)){
      this.homeService.GetSRSProjects(null, null).pipe(takeUntil(this.destroy$)).subscribe(bpsProject => {
        this.projects = bpsProject.sort((a, b) => (a.ProjectId > b.ProjectId ? -1 : 1));
        this.isOperating = true;
      });
    }
  }

  refreshHome() {
    this.updateProjectList = true;
  }
}
