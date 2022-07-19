import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { NavLayoutService } from '../../services/nav-layout.service';
import { Router, NavigationEnd } from '@angular/router';
//import { BpsProblem } from 'src/app/app-common/models/bps-problem';
import { ConfigureService } from 'src/app/app-structural/services/configure.service';
import { CookieService } from 'ngx-cookie-service';
import { BpsUnifiedProblem } from 'src/app/app-common/models/bps-unified-problem';
import { HomeService } from 'src/app/app-common/services/home.service';
import { Subject, Subscription } from 'rxjs';
import { BpsUnifiedModel } from 'src/app/app-common/models/bps-unified-model';
import { Location } from '@angular/common';
import { Observable, fromEvent, merge, of } from 'rxjs';
import { mapTo, takeUntil } from 'rxjs/operators';
import { AuthService } from 'src/app/app-core/services/auth.service';
import { LocalStorageService } from 'src/app/app-core/services/local-storage.service';
import { AppconstantsService } from 'src/app/app-common/services/appconstants.service';
import { saveAs } from 'file-saver';
import { DownloadService } from '../../services/download.service';
import { DomSanitizer } from '@angular/platform-browser';
import { CommonService } from 'src/app/app-common/services/common.service';
import { Feature } from 'src/app/app-core/models/feature';
import { TranslateService } from '@ngx-translate/core';
import { LoginService } from 'src/app/app-common/services/login.service';
import { UnifiedModelService } from 'src/app/app-structural/services/unified-model.service';

@Component({
  selector: 'app-nav-layout',
  templateUrl: './nav-layout.component.html',
  styleUrls: ['./nav-layout.component.css']
})
export class NavLayoutComponent implements OnInit, OnDestroy, AfterViewInit {
  online$: Observable<boolean>;
  eventURL$: any;
  showDownload: boolean = false;
  isNavBarButtonAndTitleVisible: boolean = true;
  problem: BpsUnifiedProblem = new BpsUnifiedProblem();
  userFullName: string = '';
  isConfigureClicked: boolean = false;
  isResultClicked: boolean = false;
  isReportClicked: boolean = false;
  isComputeClicked: boolean = false;
  previousRoute: string;
  showCrossButton: boolean = false;
  computeSubjectSubscription: Subscription;
  routerSubscription: Subscription;
  problemSubscription: Subscription;
  navBarSubscription: Subscription;
  deletePreviousArrowSubscription: Subscription;
  showBlueSaveButton: boolean = false;
  language: string = '';
  feature=Feature;
  private destroy$ = new Subject<void>();
  constructor(private downloads: DownloadService, private sanitizer: DomSanitizer, private location: Location, private appConstantService: AppconstantsService, private commonService: CommonService,
    private configureService: ConfigureService, private localStorageService: LocalStorageService, private navLayoutService: NavLayoutService, private router: Router, private cookieService: CookieService, private homeService: HomeService, 
    private auth: AuthService, private translate: TranslateService, private loginService: LoginService,
    private umService: UnifiedModelService) {
    this.online$ = merge(
      of(navigator.onLine),
      fromEvent(window, 'online').pipe(mapTo(true)),
      fromEvent(window, 'offline').pipe(mapTo(false))
    )
    this.networkStatus();

    this.eventURL$ = location.onUrlChange((val) => {
      if (val.split("/")[1] == "orders")
        this.MyOrderSelected = true;
      else this.MyOrderSelected = false;
    })
  }

/**
 * Download report button
 */
  public showDownloadButton() {
    if (this.appConstantService.APP_DOMAIN === 'http://localhost:58119/'
      || this.appConstantService.APP_DOMAIN === 'https://apiwebtest.vcldesign.com/'
      || this.appConstantService.APP_DOMAIN === 'https://srsapitest.vcldesign.com/') {
      this.showDownload = true;
    }
  }

  public networkStatus() {
    this.online$.subscribe(value => {
    })
  }
  MyOrderSelected = false;
  OrderPlaced = false;
  applicationType: string = '';
  /**
   * Set the display of the language, download button, cross button and save button
   * if the myorder is selected, make its button blue (selected)
   */
  ngOnInit(): void {
    this.applicationType = this.commonService.getApplicationType();
    if (this.applicationType === 'BPS') { 
      this.language = (this.localStorageService.getValue('culture')) ? this.localStorageService.getValue('culture') : 'de-DE';
      if (!this.localStorageService.hasKey('culture')) {
        this.localStorageService.setValue<string>('culture', this.language);
      }
      this.translate.use(this.language);
    }
    

    this.showDownloadButton();
  
    this.userFullName = this.commonService.getUserName();
    this.navLayoutService.isNavBarButtonAndTitleShownSubject.pipe(takeUntil(this.destroy$)).subscribe(isVisible => {
     if (isVisible !== undefined) {
        setTimeout(() => {
         this.isNavBarButtonAndTitleVisible = isVisible;
         if (this.isNavBarButtonAndTitleVisible) {
           this.previousRoute = null;
           this.showCrossButton = false;
         }
        });
     }
   });
    this.navLayoutService.setNavBarButtonAndTitleVisibility();
    this.configureService.isProblemSavedFromNavBar.subscribe((isProblemSaved) => {
      if (isProblemSaved) {
        this.showBlueSaveButton = false;
      }
    });

    this.umService.obsSaveUnifiedModel.subscribe((res) => {
      if (res) {
        this.onSaveButtonClick()
      }
    });
    if (location.pathname.includes("orders"))
      this.MyOrderSelected = true;
    else this.MyOrderSelected = false;
  }

  /**
   * After the rooting is done, make one button blue (selected) depending on the url
   */
  ngAfterViewInit(): void {
    this.routeEvent(this.router);
   
    // this.navBarSubscription = this.navLayoutService.isNavBarButtonAndTitleShownSubject.subscribe(isVisible => {
     

    //this.problemSubscription = this.configureService.problemSubject.subscribe(problem => {
      this.configureService.problemSubject.pipe(takeUntil(this.destroy$)).subscribe(problem => {
      this.problem = problem;
      this.OrderPlaced = problem.OrderPlaced;
      let url1 = 'problemconfigure/' + this.problem.ProblemGuid;
      this.isConfigureClicked = this.router.isActive(url1, true);
      let url2 = 'result/' + this.problem.ProblemGuid;
      this.isResultClicked = this.router.isActive(url2, true);
      let url3 = 'report/' + this.problem.ProblemGuid;
      this.isReportClicked = this.router.isActive(url3, true);
      let unifiedModel: BpsUnifiedModel = JSON.parse(this.problem.UnifiedModel);
      if (unifiedModel && unifiedModel.AnalysisResult)
        this.configureService.sendMessage(true);
    });

   // this.deletePreviousArrowSubscription = this.navLayoutService.deletePreviousArrowSubject.subscribe(bool => {
    this.navLayoutService.deletePreviousArrowSubject.pipe(takeUntil(this.destroy$)).subscribe(bool => {
      this.previousRoute = null;
      this.showCrossButton = false;
    });

    // this.computeSubjectSubscription = this.configureService.computeClickedSubject.subscribe((isClicked) => {
    this.configureService.computeClickedSubject.pipe(takeUntil(this.destroy$)).subscribe((isClicked) => {
      setTimeout(() => {
        this.isComputeClicked = isClicked;
        //if(!this.isComputeClicked){ }
        //this.configureService.isComputeEnabled = this.isComputeClicked;
      });
    }); 

  
  }

  /**
   * Rooting events
   * @param router 
   */
  routeEvent(router: Router) {
    // this.routerSubscription = router.events.subscribe(e => {
    router.events.pipe(takeUntil(this.destroy$)).subscribe(e => {
      
      if (e instanceof NavigationEnd) {
        setTimeout(() => {
          let url1 = 'problemconfigure/' + this.problem.ProblemGuid;
          this.isConfigureClicked = this.router.isActive(url1, true);
          let url2 = 'result/' + this.problem.ProblemGuid;
          this.isResultClicked = this.router.isActive(url2, true);
          let url3 = 'report/' + this.problem.ProblemGuid;
          this.isReportClicked = this.router.isActive(url3, true);
        });
      }
    });
  }
  logOut(): void {
    this.auth.logOut();
  }
  /**
   * Save the previous route (if the user wants to come back by clicking the cross button)
   * Set the home nav bar settings
   */
  onNavigateToHome(): void {
    if (this.router.url.substr(1, 6) == "proble" || this.router.url.substr(1, 6) == "result" || this.router.url.substr(1, 6) == "report" || this.router.url.substr(1, 6) == "orders") {
      this.previousRoute = this.router.url;
      this.showCrossButton = true;
    }
    this.router.navigate(['home']);
    this.navLayoutService.changeNavBarButtonAndTitleVisibility(false);
  }

  /**
   * Save the unified model in the service
   * Navigate to the configuration
   */
  onNavigateToConfigure() {
    this.navLayoutService.changeNavBarButtonAndTitleVisibility(true);
    this.configureService.configureCall = false;
    this.configureService.setProblemShow(this.problem.ProblemGuid);
    let unifiedModel: BpsUnifiedModel = JSON.parse(this.problem.UnifiedModel);
    if (unifiedModel && !unifiedModel.AnalysisResult)
      this.configureService.sendMessage(false);
    this.router.navigate(['/problemconfigure/', this.problem.ProblemGuid]);
  }

  /**
   * Rooting to the result page
   */
  onNavigateToResult() {
    this.router.navigate(['/result/', this.problem.ProblemGuid]);
  }

  /**
   * Rooting to the report page
   */
  onNavigateToReport() {
    this.router.navigate(['/report/', this.problem.ProblemGuid]);
  }

  /**
   * Rooting to the order page
   */
  onNavigateToOrders() {
    this.onSaveButtonClick();
    setTimeout(() => {
      this.router.navigate(['/orders/', this.problem.ProblemGuid]);
    }, 1000);
  }
  onSelectLoginOption(option: string): void {

  }

  ngOnDestroy() {
    // if (this.problemSubscription)
    //   this.problemSubscription.unsubscribe();
    // if (this.computeSubjectSubscription) {
    //   this.computeSubjectSubscription.unsubscribe();
    // }
    // if (this.routerSubscription) {
    //   this.routerSubscription.unsubscribe();
    // }
    // if (this.navBarSubscription)
    //   this.navBarSubscription.unsubscribe();
    // if (this.deletePreviousArrowSubscription)
    //   this.deletePreviousArrowSubscription.unsubscribe();

    if (this.eventURL$)
      this.eventURL$.unsubscribe()

      this.destroy$.next();
      this.destroy$.complete();
  }

  /**
   * Save the unified model
   */
  onSaveButtonClick() {
    this.configureService.areRightPanelButtonsDisabled = true;
    this.showBlueSaveButton = true;
    this.configureService.saveProblemSubject.next(true);
    setTimeout(() => {this.configureService.areRightPanelButtonsDisabled = false;}, 2000);
  }

  onOpenFeedback() {
    let url = 'https://forms.monday.com/forms/44887157c1b129fb8576775045c141c6?r=use1'
    window.open(url, '_blank');
  }

  /**
   * Download report request to the back-end
   */
  onDownloadButtonClick() {
    this.downloads
      .download(this.configureService.currentUnifiedModel.changingThisBreaksApplicationSecurity)
      .subscribe(blob => saveAs(blob, 'download.json'))
  }

  /**
   * When the user clicks on the cross button on the home page
   * Navigate to the previous problem displayed
   */
  onComePreviousPage() {
    if (this.previousRoute) {
      let problemGuid = this.previousRoute.split(/[/ ]+/).pop();
      if (problemGuid) {
        this.configureService.configureCall = false;
        this.configureService.setProblemShow(problemGuid);
        this.configureService.sendMessage(false);
        this.previousRoute = null;
        this.showCrossButton = false;
        //this.router.navigate(['/problemconfigure/', problemGuid]);
        this.location.back();
      }
      this.previousRoute = null;
      this.showCrossButton = false;
    }
  }

  /**
   * Change the language to display
   * @param language
   */
  onChangeLanguage(language: string) {
    this.language = language;
    this.homeService.setCurrentUserLanguage(this.language).subscribe((lan) => {
      this.localStorageService.setValue<string>('culture', lan);
      this.translate.use(lan);
    });
    
  }
}
