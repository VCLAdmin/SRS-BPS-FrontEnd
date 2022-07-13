import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppconstantsService } from 'src/app/app-common/services/appconstants.service';
import { CommonService } from 'src/app/app-common/services/common.service';
import { HomeService } from 'src/app/app-common/services/home.service';
import { ConfigureService } from 'src/app/app-structural/services/configure.service';
import { NavLayoutService } from '../../services/nav-layout.service';

@Component({
  selector: 'app-main-layout',
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.css']
})
export class MainLayoutComponent implements OnInit, AfterViewInit, OnDestroy {
  private destroy$ = new Subject<void>();
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  isNavBarVisible: boolean = true;
  isEmptyPage: boolean = false;
  height = window.innerHeight - 44;
  width = window.innerWidth;
  dataVersionInformation: any;

  constructor(private router: Router, private homeService: HomeService, private navLayoutService: NavLayoutService, private commonService: CommonService, private appConstantsService: AppconstantsService) { }

  landingImageURL: string; landingSrcSet: string;
  applicationNameImageURL: string; applicationNameSrcSet: string; applicationType: string = '';
  ngOnInit(): void {
    if (this.appConstantsService.APP_DOMAIN == 'https://api.srs.vcldesign.com/' || this.appConstantsService.APP_DOMAIN == 'https://srsapitest.vcldesign.com/') {
      this.landingImageURL = '/assets/Images/sps/srs_img_landingpage_1.0.png';
      this.applicationNameImageURL = '/assets/Images/sps/srs_srsolution_betaversion_1.0.png';
      this.landingSrcSet = '/assets/Images/sps/srs_img_landingpage_1.0@2x.png 2x, assets/Images/sps/srs_srsolution_betaversion_1.0@3x.png 3x';
      this.applicationNameSrcSet = '/assets/Images/sps/srs_srsolution_betaversion_1.0@2x.png 2x, /assets/Images/sps/srs_srsolution_betaversion_1.0@3x.png 3x';
      this.applicationType = 'SRS';
    } else {
      this.landingImageURL = '/assets/Images/sps/IMG_landing_2.png';
      this.applicationNameImageURL = '/assets/Images/sps/sps_bpssolver_betaversion_3.7.png';
      this.landingSrcSet = '/assets/Images/sps/IMG_landing_2@2x.png 2x, /assets/Images/sps/IMG_landing_2@3x.png 3x';
      this.applicationNameSrcSet = '/assets/Images/sps/sps_bpssolver_betaversion_3.7@2x.png 2x, /assets/Images/sps/sps_bpssolver_betaversion_3.7@3x.png 3x';
      this.applicationType = 'BPS';
    }
    if (this.commonService.getUserGuid() === null || this.commonService.getUserGuid() === undefined) {
      this.navLayoutService.GetVersionInformation().pipe(takeUntil(this.destroy$)).subscribe((versionInformation: any) => {
        if (versionInformation) {
          this.dataVersionInformation = versionInformation;
        }
      }, error => {
        console.log(error);
      }); 
    }
    this.navLayoutService.isEmptyPage.subscribe((val) => {
      setTimeout(() => {
        this.isEmptyPage = val
      });
    });
    this.navLayoutService.isEmptyPage.next(true);
    this.navLayoutService.onChangeNavBarVisibility().pipe(takeUntil(this.destroy$)).subscribe(isVisible => {
      setTimeout(() => {
        this.isNavBarVisible = isVisible;
      });
    });
    this.navLayoutService.changeNavBarVisibility(false);
  }

  ngAfterViewInit() {
    if (this.commonService.getUserGuid() !== null && this.commonService.getUserGuid() !== undefined) {
      if (location.pathname == '/' || location.pathname == '/login')
        this.router.navigate(['/home']);
      this.isEmptyPage = false;
      this.isNavBarVisible = true;
    } else {
      this.isEmptyPage = location.pathname == '/' ? true : false;
      this.isNavBarVisible = location.pathname == '/Account/LogOut' || location.pathname == '/login' || location.pathname == '/' ? false : true;
      if (location.pathname == '/') {
        this.isEmptyPage = true;
        this.isNavBarVisible = false;
      } else if (location.pathname == '/login') {
        this.isEmptyPage = false;
        this.isNavBarVisible = true;
      } else if (location.pathname == '/home') {
        this.isEmptyPage = false;
        this.isNavBarVisible = true;
      }
    }
  }
}
