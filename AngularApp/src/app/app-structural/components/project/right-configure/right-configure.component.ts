import { Component, OnInit, EventEmitter, Output, Input, OnDestroy, OnChanges, SimpleChanges, AfterViewInit, ViewChild, HostListener } from '@angular/core';
import { BpsUnifiedProblem } from 'src/app/app-common/models/bps-unified-problem';
import { HomeService } from 'src/app/app-common/services/home.service';
import { ConfigureService } from 'src/app/app-structural/services/configure.service';
import { Router } from '@angular/router';
import { BpsUnifiedModel, ProblemSetting } from 'src/app/app-common/models/bps-unified-model';
import { Subject, Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { _ } from '@biesbjerg/ngx-translate-extract/dist/utils/utils';
import { NotificationService } from 'src/app/app-common/services/notification.service';
import { UnifiedModelService } from 'src/app/app-structural/services/unified-model.service';
import { PermissionService } from 'src/app/app-core/services/permission.service';
import { Feature } from 'src/app/app-core/models/feature';
import { takeUntil } from 'rxjs/operators';
import { ConfigPanelsService } from 'src/app/app-structural/services/config-panels.service';
import { ResultService } from 'src/app/app-structural/services/result.service';
import { NotificationCustomComponent } from '../notification/notification-custom/notification-custom.component';

@Component({
  selector: 'app-right-configure',
  templateUrl: './right-configure.component.html',
  styleUrls: ['./right-configure.component.css']
})
export class RightConfigureComponent implements OnInit, OnDestroy, OnChanges, AfterViewInit {
  private destroy$ = new Subject<void>();
  @Input() unified3DModel: BpsUnifiedModel;
  @Input() currentProblemSetting: ProblemSetting;
  @Input() quickCheckPassed: boolean;
  @Input() orderPlaced: boolean = false;

  @Output() eventEmitter: EventEmitter<BpsUnifiedProblem> = new EventEmitter();
  @Output() closeSolverButtonEvent: EventEmitter<void> = new EventEmitter<void>();
  @Output() Loaded: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() isCheckoutClicked: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() problemListEvent: EventEmitter<BpsUnifiedProblem[]> = new EventEmitter<BpsUnifiedProblem[]>();
  @Output() updateUnified3DModelEvent: EventEmitter<BpsUnifiedModel> = new EventEmitter<BpsUnifiedModel>();
  @Output() closeAllTablesEvent: EventEmitter<void> = new EventEmitter<void>();
  @Output() invalidProjectEvent: EventEmitter<any> = new EventEmitter<any>();
  @ViewChild(NotificationCustomComponent) notifCustomTemplate: NotificationCustomComponent;


  selectedFrameCombinationArticle: string = '';
  problem: BpsUnifiedProblem;
  projectGuid: string;
  problemList: BpsUnifiedProblem[];
  bpsAnalysisResult: boolean[] = [];
  currentIndex: number;
  selectedIndex: number;
  currentProblemGuid: string;
  timer: any;
  preventSimpleClick: boolean = false;
  isUpdatePreviousProblemFinishedSubsciption: Subscription;
  rightPanelOpenSubscription: Subscription;
  callType: string;
  newProblemGuid: string;
  problemSubscription: Subscription;
  computeSubjectSubscription: Subscription;
  subTotalSubjectSubscription: Subscription;
  quickCheckPassedSubscription: Subscription

  enableAllButtons: boolean = true;

  isInvalidProduct: boolean = false;
  isCopyCall: boolean = false;
  showCheckout: boolean = false;
  calculatedSubTotal: number;

  addToolTip: string;
  copyToolTip: string;
  computeToolTip: string;
  notComputeTooltip: string;
  selectedGlassIDs: number[] = [];
  feature= Feature;
  isCheckoutDisableInvalLargeDim: boolean = false;
  isCheckoutDisableInvalSmallDim: boolean = false;

  
  ngNotificaionShow(event: any) {
    this.notifCustomTemplate.notificationShow(event.title, event.message, event.logoToShow);
  }

  @HostListener('document:click')
  clickout() {
    // this.notifCustomTemplate.notificationRemove();
  }

  constructor(
    private umService: UnifiedModelService, private router: Router,
    public configureService: ConfigureService,
    private homeService: HomeService, private translate: TranslateService,
      private notification: NotificationService, private resultService: ResultService,
    private permissionService: PermissionService,
    private cpService: ConfigPanelsService) {
  }
  ngAfterViewInit(): void {

 /**
 * This is observable Subscription to set the Check out button disable whenever the model dimensions are changed to Invalid large Dimensions
 * 
 */
    this.cpService.obsCheckoutDisable_InvalidLargeDimension.pipe(takeUntil(this.destroy$)).subscribe(
      response => {
        this.isCheckoutDisableInvalLargeDim = response;
      });

 /**
 * This is observable Subscription to set the Check out button disable whenever the model dimensions are changed to Invalid small Dimensions
 * 
 */
    this.cpService.obsCheckoutDisable_InvalidSmallDimension.pipe(takeUntil(this.destroy$)).subscribe(
      response => {
        this.isCheckoutDisableInvalSmallDim = response;
      });


 /**
 * This is observable of Unified Problem which will calls when the unified Problem  has changed anywhere in the application 
 * and will set the values to false for Invalid Dimension variables
 */
    this.umService.obsUnifiedProblem.subscribe(response => {
      if (response) {
        this.isCheckoutDisableInvalLargeDim = false;
        this.isCheckoutDisableInvalSmallDim = false;
      }
    });

 /**
 * This is observable of Unified Model which will calls when the unified model has changed anywhere in the application
 * and will set the unified model and set to the current probem Unified Model 
 */
    this.umService.obsUnifiedModel.subscribe(
      response => {
        if (response) {
          this.unified3DModel = response;
          if(this.problemList && this.problemList[this.currentIndex])
          this.problemList[this.currentIndex].UnifiedModel = JSON.stringify(response);
        }
      });
  }

  ngOnInit(): void {
    if (this.permissionService.checkPermission(this.feature.OrderingApp)) {
      this.addToolTip = 'New Product';
      this.copyToolTip = 'Copy Product';
      this.computeToolTip = 'Edit';
      this.notComputeTooltip = 'Edit';
    } else if(this.permissionService.checkPermission(this.feature.AnalysisApp)){
      this.addToolTip = this.translate.instant(_('configure.new-configuration'));
      this.copyToolTip = this.translate.instant(_('configure.copy'));
      this.computeToolTip = 'Edit';
      this.notComputeTooltip = 'Edit';
    }
    this.configureService.isProblemSavedFromNavBar.subscribe((isProblemSaved) => {
      if (isProblemSaved) {
        //if (this.actionType === 'Copy') { }
        this.actionType = '';
      }
    });
    this.problemSubscription = this.configureService.problemSubject.subscribe(problem => {
      if (this.configureService.isSelectedFromRightPanel) {
        this.configureService.isSelectedFromRightPanel = false;
        if (this.configureService.isNewProblemCreated) {
          this.configureService.isNewProblemCreated = false;
          this.configureService.computeClickedSubject.next(false);
        }

        if (this.callType && this.callType == "Select") {
          let unifiedModel: BpsUnifiedModel = JSON.parse(this.problem.UnifiedModel);
          if (unifiedModel) {
            if (unifiedModel.AnalysisResult) {
              //this.umService.setUnifiedModel(unifiedModel);
            } else {
              let lastModified = this.configureService.lastModifiedDateForUM;
              this.configureService.sendMessage(false);
              if (!lastModified) this.configureService.lastModifiedDateForUM = null;
            }
          }
          this.configureService.runLoadJsonSelect.next(true);
          this.callType = null;
        }

        else
          this.configureService.runLoadJson.next(true);
        this.router.navigate(['/problemconfigure/', this.newProblemGuid]);
      }
      //#region 
      /* if(this.configureService.isSelectedFromRightPanel){
        this.configureService.isSelectedFromRightPanel = false;
        if(this.configureService.isCopyCall){
          this.configureService.isCopyCall = false;
          this.homeService.CopyProblemByGuid(this.problem.ProblemGuid).subscribe((newProblemGuid) => {
            this.configureService.setProblemShow(newProblemGuid);
            this.configureService.computeClickedSubject.next(false);
            this.router.navigate(['/problemconfigure/', newProblemGuid]);
            this.configureService.runLoadJson.next(true);
          });
        } else{
          this.router.navigate(['/problemconfigure/', this.newProblemGuid]);
          if(this.callType && this.callType == "Select"){
            this.configureService.runLoadJsonSelect.next(true);
            this.callType = null;
          }
          else
            this.configureService.runLoadJson.next(true);
        }
      }
      */
      //#endregion

      this.problem = problem;
      this.currentProblemGuid = problem.ProblemGuid;
      let unifiedModel: BpsUnifiedModel = JSON.parse(this.problem.UnifiedModel);
      this.calculatedSubTotal = unifiedModel && unifiedModel.SRSProblemSetting && unifiedModel.SRSProblemSetting.SubTotal ?
        unifiedModel.SRSProblemSetting.SubTotal : 0;
      this.projectGuid = unifiedModel && unifiedModel.ProblemSetting
        ? unifiedModel.ProblemSetting.ProjectGuid : null;
      
      let infills = unifiedModel.ModelInput.Geometry.Infills.filter(g => g.OperabilitySystemID > 0);
      if ((infills.length > 4)) {
        this.bpsAnalysisResult[this.currentIndex] = false;
        setTimeout(() => {
          this.notification.WarningNotification('Maximum 4 Vents per Product', 'The model support only 4 vents, please adjust the model accordingly before \"go to checkout\".', 0, 'topLeft', '0px');
        }, 200);
      }
      this.updateList();
    });
    this.computeSubjectSubscription = this.configureService.computeClickedSubject.subscribe((isComputeEnabled) => {
      if (this.permissionService.checkPermission(this.feature.Compute) && (isComputeEnabled == false || isComputeEnabled == true)) {
        this.bpsAnalysisResult[this.currentIndex] = this.configureService.isComputeEnabled;
      }
    });
    this.subTotalSubjectSubscription = this.configureService.subTotalFromIframeSubject.subscribe((subTotal) => {
      if(subTotal)
        this.calculatedSubTotal = subTotal? subTotal:0;
    });
    this.quickCheckPassedSubscription = this.configureService.quickCheckPassed.subscribe((isQuickCheckPassed) => {
      let infills = this.unified3DModel.ModelInput.Geometry.Infills.filter(g => g.OperabilitySystemID > 0);
      if ((infills.length > 4))
        isQuickCheckPassed = false;
      this.unified3DModel.SRSProblemSetting.QuickCheckPassed = this.bpsAnalysisResult[this.currentIndex] = isQuickCheckPassed;      
      this.CheckProductValidity();
    })
  }


  ngOnDestroy(): void {
    this.notifCustomTemplate.notificationRemove();
    this.destroy$.next();
    this.destroy$.complete();
  
    if (this.isUpdatePreviousProblemFinishedSubsciption)
      this.isUpdatePreviousProblemFinishedSubsciption.unsubscribe();
    if (this.problemSubscription)
      this.problemSubscription.unsubscribe();
    if (this.computeSubjectSubscription)
      this.computeSubjectSubscription.unsubscribe();
    if (this.rightPanelOpenSubscription)
      this.rightPanelOpenSubscription.unsubscribe();
    if (this.subTotalSubjectSubscription)
      this.subTotalSubjectSubscription.unsubscribe();
    if (this.quickCheckPassedSubscription)
      this.quickCheckPassedSubscription.unsubscribe();
  }

  ngOnChanges(Changes: SimpleChanges) {
    if (this.permissionService.checkPermission(this.feature.OrderingApp)) {
      this.addToolTip = 'New Product';
      this.copyToolTip = 'Copy Product';
      this.computeToolTip = 'Edit';
      this.notComputeTooltip = 'Edit';
    } else if(this.permissionService.checkPermission(this.feature.AnalysisApp)){
      this.addToolTip = this.translate.instant(_('configure.new-configuration'));
      this.copyToolTip = this.translate.instant(_('configure.copy'));
      this.computeToolTip = 'Edit';
      this.notComputeTooltip = 'Edit';
    }
    if (Changes) {
      if (Changes.unified3DModel && Changes.unified3DModel.currentValue) {
        setTimeout(() => {
          this.unified3DModel = Changes.unified3DModel.currentValue;
          if (this.unified3DModel && this.unified3DModel.ProblemSetting)
            this.showCheckout = this.unified3DModel.ProblemSetting.ProductType ? true : false;
        });
      }
      //  setTimeout(()=>{
      //  if(Changes.quickCheckPassed && !Changes.quickCheckPassed.firstChange){
      //   this.unified3DModel.SRSProblemSetting.QuickCheckPassed = Changes.quickCheckPassed.currentValue;
      //   this.bpsAnalysisResult[this.currentIndex]  = Changes.quickCheckPassed.currentValue;
      //  } 
      // },100);
      if (Changes.event3D && Changes.event3D.currentValue && Changes.event3D.currentValue.eventType === 'selectGlass') {  // when user selects glass from 3D viewer
        var panels = this.unified3DModel.ModelInput.Geometry.Infills.filter(f => f.GlazingSystemID != -1).map(f => f.InfillID);
        this.selectedGlassIDs = Changes.event3D.currentValue.value.selectedGlassIDs.filter(f => panels.includes(f))
      }
    }
  }

 /**
 * This function will update all the values of the problems and also set the current unified model with the unified model of selected problem.
 * 
 * And also will set the value of quick check and based on boolean value Checkout button will be enable and disable.
 */
  updateList() {
    this.configureService.GetProblemsForProject(this.projectGuid).subscribe(problems => {
      this.problemList = problems;
      this.problemListEvent.emit(this.problemList);
      this.enableAllButtons = true;
      for (let i = 0; i < this.problemList.length; i++) {
        let unifiedModel: BpsUnifiedModel = JSON.parse(this.problemList[i].UnifiedModel);
        if(!this.isConfirRenamed)
          this.bpsAnalysisResult[i] = false;
        if (unifiedModel) {
          if (this.permissionService.checkPermission(this.feature.QuickCheck)) {
            if (unifiedModel.SRSProblemSetting) {
              if (unifiedModel.SRSProblemSetting.QuickCheckPassed == undefined) {
                unifiedModel.SRSProblemSetting.QuickCheckPassed = false;
                this.bpsAnalysisResult[i] = unifiedModel.ProblemSetting.ProductType ? true : false;
              } else {
                if (!this.isConfirRenamed)
                  this.bpsAnalysisResult[i] = unifiedModel.SRSProblemSetting.QuickCheckPassed ? true : false;
              }
            }
          } else {
            if (unifiedModel.AnalysisResult)
              this.bpsAnalysisResult[i] = true;
          }
          let infills = unifiedModel.ModelInput.Geometry.Infills.filter(g => g.OperabilitySystemID > 0);
          if (this.permissionService.checkPermission(this.feature.Max4VentsAllowed) && (infills.length > 4)) {
            this.bpsAnalysisResult[i] = false;
          }
        }
        if (this.problem.ProblemGuid === this.problemList[i].ProblemGuid) {
          this.currentIndex = i;
        }
      }
      this.CheckProductValidity();
    }, (error) => this.enableAllButtons = true);
  }

 /**
 * This function will check whether  created product is valid or not in order to enable and disable the Checkout button.
 * If the product is disabled then the checkout button will be disabled and if the product is valid then the checkout button is enabled.
 */
  CheckProductValidity() {
    if (this.bpsAnalysisResult && this.bpsAnalysisResult.length > 0) {
      if (this.permissionService.checkPermission(this.feature.Checkout) && this.bpsAnalysisResult && this.bpsAnalysisResult.length > 0) {
        let invalidConfigurations = this.bpsAnalysisResult.filter(x => x == false); 
        this.isInvalidProduct = invalidConfigurations && invalidConfigurations.length > 0 ? true : false;
        // if(this.unified3DModel.ProblemSetting.ProductType !== 'SlidingDoor') {
        //   this.isInvalidProduct = invalidConfigurations && invalidConfigurations.length > 0 ? true : false;
        // } else {
        //   this.isInvalidProduct = false;
        // }
        
        this.invalidProjectEvent.emit(this.isInvalidProduct);
      }
    } 
  }

 /**
 * This function will update the Problems list with the details and selection in the right configure .
 * 
 */
  updateListAndRedirect() {
    this.configureService.GetProblemsForProject(this.projectGuid).subscribe(problems => {
      this.problemList = problems;
      this.enableAllButtons = true;
      this.populate_bpsAnalysisResult();
      setTimeout(() => {
        this.onMove(this.problemList.length - 1);
      }, 200);
    }, (error) => this.enableAllButtons = true);
  }

 /**
 * This function will set the bpsAnalysisResult value to true and false for all the problems created .
 * 
 */
  populate_bpsAnalysisResult() {
    for (let i = 0; i < this.problemList.length; i++) {

      let unifiedModel: BpsUnifiedModel = JSON.parse(this.problemList[i].UnifiedModel);

      this.bpsAnalysisResult[i] = false;
      if (unifiedModel) {
        if (this.permissionService.checkPermission(this.feature.QuickCheck)) {
          if (unifiedModel.SRSProblemSetting) {
            if (unifiedModel.SRSProblemSetting.QuickCheckPassed == undefined) {
              unifiedModel.SRSProblemSetting.QuickCheckPassed = false;
              this.bpsAnalysisResult[i] = unifiedModel.ProblemSetting.ProductType ? true : false;
            } else {
              this.bpsAnalysisResult[i] = unifiedModel.SRSProblemSetting.QuickCheckPassed ? true : false;
            }
          }
        } else {
          if (unifiedModel.AnalysisResult)
            this.bpsAnalysisResult[i] = true;
        }
      }
      if (this.problem.ProblemGuid === this.problemList[i].ProblemGuid) {
        this.currentIndex = i;
      }
    }
  }

  // onClickOnCreateBtn() {
  //   this.enableAllButtons = false;
  //   if(this.isUpdatePreviousProblemFinishedSubsciption) {this.isUpdatePreviousProblemFinishedSubsciption.unsubscribe();}
  //   this.saveProblemFromRightPanel();
  //   this.homeService.CreateDefaultProblemForProject(this.projectGuid).subscribe((newProblem) => {
  //     this.problem = newProblem;
  //     this.configureService.isNewProblemCreated = true;
  //     this.redirectToNewProblem(newProblem.ProblemGuid);
  //   }, (error)=> this.enableAllButtons = true);
  // }

 /**
 * This function will call when user clicks on the create button in the right configure.
 * 
 * It will create a new problem with default model
 */
  actionType = '';
  onClickOnCreateBtn() {
    // this.configureService.areRightPanelButtonsDisabled = true;
    // this.configureService.areRightPanelButtonsClicked = true;
    this.actionType = 'Create';
    const that = this;
    if(this.unified3DModel.SRSProblemSetting !== null){
      this.unified3DModel.SRSProblemSetting.QuickCheckPassed = this.bpsAnalysisResult[this.currentIndex];
    }
    this.Loaded.emit(true);
    this.enableAllButtons = false;
    const currentProblem: BpsUnifiedModel = that.unified3DModel;
    if (this.isUpdatePreviousProblemFinishedSubsciption) { this.isUpdatePreviousProblemFinishedSubsciption.unsubscribe(); }
    this.configureService.lastModifiedDateForUM = new Date();
    this.saveProblemFromRightPanel();
    this.configureService.updateProblem(that.unified3DModel).subscribe(data => {
      var createAfterSave = function () {
        if (that.configureService.isSaved === true) {
          that.homeService.CreateDefaultProblemForProject(that.projectGuid, that.configureService.applicationType).subscribe((newProblem) => {
            // only creae deafult problem and redirect. exclude the physics and product type assignment from last problem
            if (newProblem) {
              that.configureService.isNewProblemCreated = true;
              that.configureService.isDefaultProblemCreatedFromRightPanel = true;
              setTimeout(() => {
                that.updateListAndRedirect();
              }, 200);
            } else {
              that.configureService.sendMessage(false);
            }
          }, (error) => that.enableAllButtons = true);
        }
        else setTimeout(createAfterSave, 50);
      };
      createAfterSave();
    });
  }

 /**
 * This function will call when user clicks on the copy button in the right configure.
 * 
 * It will copy the selected problem
 */
  onClickOnCopyBtn() {
    this.configureService.areRightPanelButtonsDisabled = true;
    this.configureService.areRightPanelButtonsClicked = true;
    this.actionType = 'Copy';
    if(this.unified3DModel.SRSProblemSetting !== null){
      this.unified3DModel.SRSProblemSetting.QuickCheckPassed = this.bpsAnalysisResult[this.currentIndex];
    }
    this.Loaded.emit(true);
    this.enableAllButtons = false;
    const that = this;
    if (this.isUpdatePreviousProblemFinishedSubsciption) { this.isUpdatePreviousProblemFinishedSubsciption.unsubscribe(); }
    this.configureService.lastModifiedDateForUM = new Date();
    this.saveProblemFromRightPanel();
    this.configureService.updateProblem(that.unified3DModel).subscribe(data => {
      setTimeout(() => {
        var createAfterSave = function () {
          if (that.configureService.isSaved === true) {
            that.homeService.CopyProblemByGuid(that.problem.ProblemGuid).subscribe((newProblemGuid) => {
              that.configureService.isNewProblemCreated = true;
              setTimeout(() => {
                that.updateListAndRedirect();
                setTimeout(() => {
                  that.umService.callTakeScreenShot(true);
                }, 1000);
              }, 200);
            });
          }
          else setTimeout(createAfterSave, 50);
        };
        createAfterSave();
      }, 10);
    });
  }

  DeleteProblemReport(ProjectGuid: string, ProblemGuid: string) {
    this.resultService.DeleteProblemReport(ProjectGuid, ProblemGuid).subscribe((val) => {});
  }


 /**
 * This function will call when user clicks on the delete button in the right configure.
 * 
 * It will delete the selected problem
 */
  onClickOnDeleteBtn() {
    // this.modalService.confirm({
    //   nzWrapClassName: "vertical-center-modal",
    //   nzWidth: '490px',
    //   nzTitle: '',
    //   nzContent: 'Are you sure you want to delete the configuration? All information associated with the configuration will be deleted.',
    //   nzCancelText: 'No',
    //   nzOnCancel: () => console.log('Canceled'),
    //   nzOkText: 'Delete',
    //   nzOkType: 'danger',
    //   nzOnOk: () => {
    // this.configureService.areRightPanelButtonsDisabled = true;
    // this.configureService.areRightPanelButtonsClicked = true;
    this.Loaded.emit(true);
    this.bpsAnalysisResult.splice(this.currentIndex, 1);
    this.homeService.DeleteProblemByGuid(this.problem.ProblemGuid).subscribe((deletedProblemGuid) => {
      this.DeleteProblemReport(this.projectGuid, this.problem.ProblemGuid);
      //this.configureService.GetProblemByGuid(newProblemGuid);
      // this.configureService.problemSubject.subscribe(problem => {
      //   this.eventEmitter.emit(problem);
      // });
      //this.configureService.setProblemShow(this.problem.ProblemGuid);
      this.configureService.GetProblemsForProject(this.projectGuid).subscribe(problems => {
        this.problemList = problems;
        let currentProblem = this.problemList[this.problemList.length - 1];
        if (currentProblem) {
          let unifiedModel: BpsUnifiedModel = JSON.parse(currentProblem.UnifiedModel);
          if (unifiedModel && !unifiedModel.AnalysisResult) {
            let lastModified = this.configureService.lastModifiedDateForUM;
            this.configureService.sendMessage(false);
            if (!lastModified) this.configureService.lastModifiedDateForUM = null;
            else this.configureService.lastModifiedDateForUM = new Date(currentProblem.ModifiedOn);
          }
          this.configureService.configureCall = true;
          this.configureService.setProblemShow(currentProblem.ProblemGuid);
          this.router.navigate(['/problemconfigure/', currentProblem.ProblemGuid]);
          this.Loaded.emit(false);
        } else {
          this.Loaded.emit(false);
        }
      });
      this.CheckProductValidity();
      // this.router.navigate(['/problemconfigure/', newProblemGuid]);
    });
    //   },
    // });
  }

 /**
 * This function will call to rename the Problem name.
 * @param {number} index  this is the index of the current problem of which user wants to rename the problem
 * 
 */
  isConfirRenamed = false;
  onRename(index: any): void {
    let currentProblem = this.problemList[index];
    if (currentProblem) {
      let unifiedModel = JSON.parse(currentProblem.UnifiedModel);
      if (unifiedModel) {
        let oldProblemName = unifiedModel.ProblemSetting.ConfigurationName;
        let newProblemName = currentProblem.ProblemName;
        let listOfAllOtherProblemNames = this.problemList.map((problem, i) => i !=index ? problem.ProblemName:'').filter(String);
        let does_newProblemName_alreadyExist: Boolean = listOfAllOtherProblemNames.includes(newProblemName);
        if (does_newProblemName_alreadyExist) {
          this.ngNotificaionShow({ title: "Product name already exists", message: "Two products cannot have the same name, please use a different one.", logoToShow: 'WarningOrderLeft' });
          this.problemList[index].ProblemName = oldProblemName;
          this.orderPlaced = !this.orderPlaced;
          setTimeout(() => {
            this.orderPlaced = !this.orderPlaced;
          },100);
        }
        else {
          // let areAllProblemNamesDifferent: Boolean = JSON.stringify(this.problemList.map(problem => problem.ProblemName)) == JSON.stringify([...new Set(this.problemList.map(problem => problem.ProblemName))])
          // if (areAllProblemNamesDifferent) {
          //   this.notifCustomTemplate.notificationRemove();
          // }
          unifiedModel.ProblemSetting.ConfigurationName = newProblemName;
          this.configureService.editConfigurationName.next(currentProblem.ProblemName);
          this.configureService.RenameProblem(unifiedModel).subscribe(response => {
            if(unifiedModel.SRSProblemSetting !== null){
              unifiedModel.SRSProblemSetting.QuickCheckPassed = this.bpsAnalysisResult[this.currentIndex];
            }
            unifiedModel.ProblemSetting.ConfigurationName = response.ProblemName;
            currentProblem.ProblemName = response.ProblemName;
            this.umService.setUnifiedModel(unifiedModel);
            this.isConfirRenamed = true;
            this.updateList();
            this.populate_bpsAnalysisResult();
            // this.checkIfDisplaySameProblemNamesNotification();
          });          
        }         
      }
    }
  }

 /**
 * This function will call after create or copy problem as to focus on the newly created or copied problem.
 * @param {number} i  this is the index of the current problem when user clicks on the problem from right configure
 * 
 */
  rightPanelDisable = false;
  onClick(i: number) {
    if (!this.configureService.areRightPanelButtonsDisabled){
      this.actionType = 'Click';
      this.rightPanelDisable = true;
      if(this.unified3DModel.SRSProblemSetting !== null){
        this.unified3DModel.SRSProblemSetting.QuickCheckPassed = this.bpsAnalysisResult[this.currentIndex];
      }
      this.timer = 0;
      this.preventSimpleClick = false;
      let delay = 200;
      this.timer = setTimeout(() => {
        if (!this.preventSimpleClick) {
          this.problem = this.problemList[i];
          this.currentIndex = i;
          if (this.problem) {
            this.newProblemGuid = this.problem.ProblemGuid;
            this.callType = "Select";
            this.Loaded.emit(true);
            this.configureService.lastModifiedDateForUM = new Date();
            this.saveProblemFromRightPanel();
            this.configureService.updateProblem(this.unified3DModel).subscribe(data => {
              this.redirectToNewProblem(this.problem.ProblemGuid);
            });
          }
        }
      }, delay);
    }
  }

 /**
 * This function will call after create or copy problem as to focus on the newly created or copied problem.
 * @param {number} i  this is the index of the current problem 
 * 
 */
  onMove(i: number) {
    this.actionType = 'Move';
    this.rightPanelDisable = true;
    if(this.unified3DModel.SRSProblemSetting !== null){
      this.unified3DModel.SRSProblemSetting.QuickCheckPassed = this.bpsAnalysisResult[this.currentIndex];
    }
    this.problem = this.problemList[i];
    this.currentIndex = i;
    if (this.problem) {
      this.newProblemGuid = this.problem.ProblemGuid;
      this.callType = "Select";
      setTimeout(() => {
        this.redirectToNewProblem(this.problem.ProblemGuid);
      }, 100);
    }
  }

 /**
 * This function is to redirect to new Problem 
 * @param {number} newProblemGuid  this is the max limit to enable create button on the right configure. 
 * 
 */
  redirectToNewProblem(newProblemGuid) {
    this.newProblemGuid = newProblemGuid;
    if (this.isUpdatePreviousProblemFinishedSubsciption) { this.isUpdatePreviousProblemFinishedSubsciption.unsubscribe(); }
    this.isUpdatePreviousProblemFinishedSubsciption = this.configureService.isProblemSavedForRightPanel.subscribe((val) => {
      if (val) {
        this.configureService.isSelectedFromRightPanel = true;
        this.configureService.configureCall = true;
        if (newProblemGuid) this.configureService.setProblemShow(this.newProblemGuid);
        this.configureService.isProblemSavedForRightPanel.next(false);
        setTimeout(() => {
          this.rightPanelDisable = false;
        }, 2000);
      }
    });
  }

 /**
 * This function is to save problem from right panel  
 * 
 */
  saveProblemFromRightPanel() {
    this.configureService.isSaved = false;
    this.configureService.saveProblemFromRightPanelSubject.next(true);
  }
  log(event: any) {
  }

 /**
 * This will apply the css class for the last current Problem in the right configure
 * 
 */
  getCurrentProblemClass(problem: any, isLast: any) {
    return { 'bps-button-editable-selected': this.currentProblemGuid === problem.ProblemGuid, 'last': isLast }
  }

 /**
 * This will disable the current problem in the right configure
 * 
 */
  getCurrentProblemDisabled(problem: any) {
    return this.currentProblemGuid === problem.ProblemGuid;
  }

 /**
 * This function calls when checkout button is clicked from the right configure
 * 
 * It will redirect to the orders page where user can place the order
 */
  onCheckout() {
    let infills = this.unified3DModel.ModelInput.Geometry.Infills.filter(g => g.OperabilitySystemID > 0);
    if (this.permissionService.checkPermission(this.feature.Max4VentsAllowed) && (this.selectedGlassIDs.length > 4 || infills.length > 4)) {
      setTimeout(() => {
        this.notification.WarningNotification('Maximum 4 Vents per Product', 'The model support only 4 vents, please adjust the model accordingly before \"go to checkout\".', 0, 'topLeft', '0px');
        this.bpsAnalysisResult[this.currentIndex] = false;
      }, 200);

    } else {
      this.isCheckoutClicked.emit(true);
    }

  }

 /**
 * This function is to enable create button up to certain limit
 * @param {number} limit  this is the max limit to enable create button on the right configure. 
 * 
 */
  enableCreateButton(limit:number){
    return (this.permissionService.checkPermission(Feature.CreateNewProject) ||
       (this.permissionService.checkPermission(Feature.CreateNewOrder) && this.problemList && this.problemList.length < limit && this.orderPlaced == false));
  }
}

