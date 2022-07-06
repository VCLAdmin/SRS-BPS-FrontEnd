import { Component, OnInit, ViewChild, TemplateRef, ChangeDetectorRef, ElementRef, Input, AfterViewInit, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { BpsTableExpandablePanelComponent, CeldType } from 'bps-components-lib';
import { ConfigureService } from 'src/app/app-structural/services/configure.service';
import { BpsUnifiedProblem } from '../../models/bps-unified-problem';
import { AppconstantsService } from '../../services/appconstants.service';
import { HomeService } from '../../services/home.service';
import { BpsUnifiedModel } from '../../models/bps-unified-model';
import { NavLayoutService } from 'src/app/app-layout/services/nav-layout.service';
import { Router } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { CommonService } from '../../services/common.service';
import { OrderApiModel } from 'src/app/app-structural/models/order-model';
import { takeUntil } from 'rxjs/operators';
import { ResultService } from 'src/app/app-structural/services/result.service';
import { Feature } from 'src/app/app-core/models/feature';
import { PermissionService } from 'src/app/app-core/services/permission.service';
import { TranslateService } from '@ngx-translate/core';
import { _ } from '@biesbjerg/ngx-translate-extract/dist/utils/utils';

@Component({
  selector: 'app-home-expandable-panel',
  templateUrl: './home-expandable-panel.component.html',
  styleUrls: ['./home-expandable-panel.component.css']
})
export class HomeExpandablePanelComponent implements OnInit, OnChanges, AfterViewInit, OnDestroy {
  private destroy$ = new Subject<void>();

  constructor(private appConstantService: AppconstantsService,
    private cdr: ChangeDetectorRef,
    private configureService: ConfigureService,
    private homeService: HomeService,
    private resultService: ResultService,
    private navLayoutService: NavLayoutService,
    private commonService: CommonService,
    private translate: TranslateService,
    private router: Router, private permissionService:PermissionService) { }

    feature=Feature;
  configurationCustomGridProblems: any;
  listOfDisplayDataProblems = [];
  dataProblems = [];
  valueA = true;
  valueB = false;
  //isOperating = false;
  isAllDisplayDataCheckedA = false;
  isAllDisplayDataCheckedB = false;
  mapOfCheckedIdAcoustic: { [key: string]: boolean } = {};
  mapOfCheckedIdStructural: { [key: string]: boolean } = {};
  mapOfCheckedIdThermal: { [key: string]: boolean } = {};
  mapOfDisabledIdAcoustic: { [key: string]: boolean } = {};
  mapOfDisabledIdStructural: { [key: string]: boolean } = {};
  mapOfDisabledIdThermal: { [key: string]: boolean } = {};
  selectedItem = null;
  path: string;
  path_default: string;
  allProducts: BpsUnifiedProblem[];
  problemToRun_problemGuid: string;
  orderPlaced: any = false;
  orderProgressList = [
    // { Index: 0, Progress: "Pending", Status: "Ordered", Description: "" },
    { Index: 0, Progress: "Order Placed", Status: "In Process", Description: "" },
    { Index: 1, Progress: "In Pre Production", Status: "In Process", Description: "" },
    { Index: 2, Progress: "In Fabrication", Status: "In Process", Description: "" },
    { Index: 3, Progress: "In Assembly", Status: "In Process", Description: "" },
    { Index: 4, Progress: "Shipped", Status: "In Process", Description: "" },
    { Index: 5, Progress: "Delivered", Status: "Finished", Description: "" }];

  orderCancelledProgressList = [
    // { Index: 0, Progress: "Pending", Status: "Ordered", Description: "" },
    { Index: 0, Progress: "Order Placed", Status: "In Process", Description: "" },
    { Index: 1, Progress: "Cancelled", Status: "Finished", Description: "" }];

  ////from project
  @Input() projectToDelete_projectGuid: string;
  @Input() projectClicked_projectGuid: string;
  @Input() problemsOfSelectedProject: BpsUnifiedProblem[];
  @Input() isOperatingExpandableTable: boolean;
  //from project ends
  //applicationType ;
  hasFullAccess: boolean = false;
  @ViewChild('selectedItemImage') selectedItemImage: ElementRef;
  @ViewChild('cellTemplate', { read: TemplateRef, static: false }) cellTemplate: TemplateRef<{}>;
  @ViewChild('panelComponent', { read: BpsTableExpandablePanelComponent, static: false }) panelComponent: BpsTableExpandablePanelComponent;

  current = 1;
  ngOnInit(): void {
    //this.current = Math.floor(Math.random() * 6) + 1;
    //this.applicationType = this.commonService.getApplicationType();
    this.hasFullAccess = this.commonService.getUserRole() === "Dealer-Full" ? true : false;
    // this.loadProblemSubscription = this.homeService.loadProblemsInExpandableTable.subscribe((val)=>{
    //   if(val && val.projectGuid){
    //     this.loadDataProblems(val);
    //   }
    // });
  }
  ngOnChanges(Changes: SimpleChanges) {
    //this.current = Math.floor(Math.random() * 6) + 1;
    //this.applicationType = this.commonService.getApplicationType();
    if (Changes && Changes.problemsOfSelectedProject && Changes.problemsOfSelectedProject.currentValue) {
      this.isOperatingExpandableTable = true;
      this.listOfDisplayDataProblems = [];
      this.cdr.detectChanges();
      this.problemToRun_problemGuid = null;
      this.selectedItem = null;
      // this.projectClicked_projectGuid = event.projectGuid;

      this.allProducts = Changes.problemsOfSelectedProject.currentValue;
      this.loadProblems();
    }
  }

  loadProblems(): void {
    this.dataProblems = [];
    let problem_length = this.allProducts.length;
    if (this.permissionService.checkPermission(Feature.OrderList)) {
      this.orderPlaced = false;
      var ordersListModel: OrderApiModel;
      this.configureService.GetProjectOrders(this.projectClicked_projectGuid).pipe(takeUntil(this.destroy$)).pipe(takeUntil(this.destroy$)).subscribe((ordersList) => {
        ordersListModel = ordersList;
        for (let j = 0; j < problem_length; j++) {
          let Status = '';
          let Process = '';
          let ModifiedOn;
          let StatusId = 0;
          let OrderDetails;

          if (ordersListModel.Current_Status) {
            this.orderPlaced = true;
            if (ordersListModel.SubOrder && ordersListModel.SubOrder.length > 0) {
              OrderDetails = ordersListModel.SubOrder.filter(f => f.OrderDetails[0].ProductId === this.allProducts[j].ProblemId)[0];
              if (OrderDetails) {
                let currentOrder = this.orderProgressList.filter(f => OrderDetails.Current_Status === "" || f.Progress === OrderDetails.Current_Status)[0];
                Status = currentOrder.Status;
                Process = currentOrder.Progress;
                ModifiedOn = OrderDetails.ModifiedOn;
                StatusId = currentOrder.Index;
              }
            } else {
              OrderDetails = ordersListModel;
              let currentOrder = this.orderProgressList.filter(f => OrderDetails.Current_Status === "" || f.Progress === OrderDetails.Current_Status)[0];
              Status = currentOrder.Status;
              Process = currentOrder.Progress;
              ModifiedOn = OrderDetails.ModifiedOn;
              StatusId = currentOrder.Index;
            }
          }
          this.dataProblems.push({
            index: j,
            id: '' + j,
            configuration: this.allProducts[j].ProblemName,
            orderStatus: Status,
            orderProgress: Process,
            orderIndex: StatusId,
            status: {
              ref: this.cellTemplate,
              context: {
                id: '' + j,
                disabled: false
              }
            },
            disabled: false,
            problemGuid: this.allProducts[j].ProblemGuid,
            problem: this.allProducts[j]
          });
        }
        this.listOfDisplayDataProblems = [];
        this.listOfDisplayDataProblems = [...this.dataProblems];
        this.cdr.detectChanges();
        setTimeout(() => {
          this.isOperatingExpandableTable = false;
          if (this.dataProblems[0]) {
            this.onClickProblem(this.dataProblems[0]);
            this.getSelectedItem(
              {
                data: this.dataProblems[0],
                selection: true
              });
            this.panelComponent.selectRow(this.dataProblems[0]);
          }
        }, 0);
      });
    }
    else if(this.permissionService.checkPermission(Feature.ProblemList)){
      for (let j = 0; j < problem_length; j++) {
        let allProduct = this.allProducts[j];
        this.dataProblems.push({
          index: j,
          id: '' + j,
          configuration: allProduct.ProblemName,
          status: {
            ref: this.cellTemplate,
            context: {
              id: '' + j,
              disabled: false
            }
          },
          disabled: false,
          problemGuid: allProduct.ProblemGuid,
          problem: allProduct
        });

        this.mapOfCheckedIdAcoustic[j] = Boolean(allProduct.AcousticResult);
        this.mapOfCheckedIdStructural[j] = Boolean(allProduct.StructuralResult);
        this.mapOfCheckedIdThermal[j] = Boolean(allProduct.ThermalResult);

        this.mapOfDisabledIdAcoustic[j] = !Boolean(allProduct.EnableAcoustic);
        this.mapOfDisabledIdStructural[j] = !Boolean(allProduct.EnableStructural);
        this.mapOfDisabledIdThermal[j] = !Boolean(allProduct.EnableThermal);
      }
      this.listOfDisplayDataProblems = [];
      this.listOfDisplayDataProblems = [...this.dataProblems];
      this.cdr.detectChanges();
      setTimeout(() => {
        this.isOperatingExpandableTable = false;
        if (this.dataProblems[0]) {
          this.onClickProblem(this.dataProblems[0]);
          this.getSelectedItem(
            {
              data: this.dataProblems[0],
              selection: true
            });
          this.panelComponent.selectRow(this.dataProblems[0]);
        }
      }, 0);

    }
  }
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  ngAfterViewInit() {
    if (Boolean(this.path)) {
      this.selectedItemImage.nativeElement.src = this.path;
    }
    this.configurationCustomGridProblems = {
      fields: [
        {
          celdType: CeldType.Default,
          property: 'configuration'
        },
        {
          celdType: CeldType.TemplateRef,
          property: 'status',
          width: this.permissionService.checkPermission(this.feature.ProblemList) ? '80px' : '200px',
          ngClass: {
            [`bps-centered`]: true,
            [`bps-no-padding`]: true
          }
        },
      ],
      fieldId: 'id'
    };
    this.cdr.detectChanges();
  }

  loadDataProblems(event: any): void {
    event.isLoaded = true;
    this.problemToRun_problemGuid = null;
    this.isOperatingExpandableTable = true;
    this.selectedItem = null;
    this.projectClicked_projectGuid = event.projectGuid;
    this.listOfDisplayDataProblems = [];
    this.configureService.GetProblemsForProjectLite(event.projectGuid).pipe(takeUntil(this.destroy$)).subscribe((response) => {
      this.dataProblems = [];
      this.allProducts = response;
      let problem_length = this.allProducts.length;
      for (let j = 0; j < problem_length; j++) {
        let allProduct = this.allProducts[j];
        this.dataProblems.push({
          index: j,
          id: '' + j,
          configuration: allProduct.ProblemName,
          status: {
            ref: this.cellTemplate,
            context: {
              id: '' + j,
              disabled: false
            }
          },
          disabled: false,
          problemGuid: allProduct.ProblemGuid,
          problem: allProduct
        });

        this.mapOfCheckedIdAcoustic[j] = Boolean(allProduct.AcousticResult);
        this.mapOfCheckedIdStructural[j] = Boolean(allProduct.StructuralResult);
        this.mapOfCheckedIdThermal[j] = Boolean(allProduct.ThermalResult);
        
        this.mapOfDisabledIdAcoustic[j] = !Boolean(allProduct.EnableAcoustic);
        this.mapOfDisabledIdStructural[j] = !Boolean(allProduct.EnableStructural);
        this.mapOfDisabledIdThermal[j] = !Boolean(allProduct.EnableThermal);
      }
      this.listOfDisplayDataProblems = [...this.dataProblems];
      this.isOperatingExpandableTable = false;
    });
  }
  log($event, type = null) {
  }
  getSelectedItem(event) {
    this.selectedItem = event;
    this.configureService.GetScreenshotURL(event.data.problemGuid).subscribe(imageURL => {
      if (imageURL) {
        this.path = imageURL;
      }
    }, (error) => {
      this.path = this.appConstantService.APP_DOMAIN + "Content/screenshots/default.jpg"
    });
  }

  addRow($event) {
    this.isOperatingExpandableTable = true;
   //this.configureService.applicationType = this.applicationType;
    this.configureService.CreateProblemForProject(this.projectClicked_projectGuid).pipe(takeUntil(this.destroy$)).subscribe(problem => {
      if (problem) {
        if (this.permissionService.checkPermission(Feature.OrderList)) {
          const index = this.listOfDisplayDataProblems.length;
          const newRow = {
            index: index,
            id: '' + index,
            configuration: problem.ProblemName,
            orderStatus: 'Order Placed',
            orderProgress: 'Order Placed',
            status: {
              ref: this.cellTemplate,
              context: {
                id: '' + index,
                disabled: false
              }
            },
            disabled: false,
            problemGuid: problem.ProblemGuid,
            problem: problem
          };
          this.listOfDisplayDataProblems = [...this.listOfDisplayDataProblems, newRow];
          this.cdr.detectChanges();
          this.panelComponent.startEdit(newRow, $event);
          const panel = this.panelComponent.panel.nativeElement as HTMLElement;
          const table = panel.getElementsByClassName('ant-table-body')[0];
          table.scrollTop = table.scrollHeight;
        } else if(this.permissionService.checkPermission(Feature.ProblemList)){
          const newRowID = Date.now().toString();
          const index = this.listOfDisplayDataProblems.length;
          const newRow = {
            index: index,
            id: '' + newRowID,
            configuration: problem.ProblemName,
            status: {
              ref: this.cellTemplate,
              context: {
                id: '' + newRowID,
                disabled: false
              }
            },
            disabled: false,
            problemGuid: problem.ProblemGuid,
            problem: problem
          };
          this.listOfDisplayDataProblems = [...this.listOfDisplayDataProblems, newRow];
          this.mapOfDisabledIdAcoustic[newRowID] = true;
          this.mapOfDisabledIdStructural[newRowID] = true;
          this.mapOfDisabledIdThermal[newRowID] = true;
          this.mapOfCheckedIdAcoustic[newRowID] = false;
          this.mapOfCheckedIdStructural[newRowID] = false;
          this.mapOfCheckedIdThermal[newRowID] = false;
          //this.loadDataProblems({projectGuid: JSON.parse(problem.UnifiedModel).ProjectGuid}); 

          this.cdr.detectChanges();
          this.panelComponent.startEdit(newRow, $event);
          const panel = this.panelComponent.panel.nativeElement as HTMLElement;
          const table = panel.getElementsByClassName('ant-table-body')[0];
          table.scrollTop = table.scrollHeight;
        }
      }

      this.isOperatingExpandableTable = false;
    }, (error) => this.isOperatingExpandableTable = false);
  }
  DeleteProblemReport(ProjectGuid: string, ProblemGuid: string) {
    this.resultService.DeleteProblemReport(ProjectGuid, ProblemGuid).subscribe((val) => { });
  }
  deleteRow($event) {
    if (this.problemToRun_problemGuid) {
      let index = this.listOfDisplayDataProblems.map(project => project.problemGuid).indexOf(this.problemToRun_problemGuid);
      if (index != -1) {
        this.homeService.DeleteProblemByGuid(this.projectClicked_projectGuid).pipe(takeUntil(this.destroy$)).subscribe((response) => {
              this.DeleteProblemReport(this.projectClicked_projectGuid, this.problemToRun_problemGuid);
              this.path = "";
              //this.listOfDisplayDataProblems.splice(index,1);
              let data = this.listOfDisplayDataProblems;
              data.splice(index, 1);
              this.listOfDisplayDataProblems = [];
              this.listOfDisplayDataProblems = [...data];
              this.cdr.detectChanges();
              this.problemToRun_problemGuid = null;
        });
      }
    }
  }
  onClickProblem(event) {
    this.problemToRun_problemGuid = event.problemGuid;
  }
  onRunProblem(event: any) {
    this.onRunningProblem(event.problem);
  }
  onRunningProblem(problem: BpsUnifiedProblem): void {  // keep
    this.navLayoutService.changeNavBarButtonAndTitleVisibility(true);
    this.configureService.configureCall = false;
    this.configureService.setProblemShow(problem.ProblemGuid);
    let unifiedModel: BpsUnifiedModel = JSON.parse(problem.UnifiedModel);
    if (unifiedModel && !unifiedModel.AnalysisResult)
      this.configureService.sendMessage(false);
    if (problem.OrderPlaced && this.progressClicked)
      this.router.navigate(['/orders/', problem.ProblemGuid]);
    else
      this.router.navigate(['/problemconfigure/', problem.ProblemGuid]);
  }
  onSubmitNewProblemName(event: any): void {   // keep
    // let problemSimplified = new BpsSimplifiedProblem;
    // problemSimplified.ProblemGuid = event[0].problemGuid;
    // problemSimplified.ProblemName = event[0].configuration;
    if (event && event.length > 0 && event[0].problem && event[0].problem.UnifiedModel) {
      let unifiedModel: BpsUnifiedModel = JSON.parse(event[0].problem.UnifiedModel);
      if (unifiedModel && unifiedModel.ProblemSetting) {
        unifiedModel.ProblemSetting.ConfigurationName = event[0].configuration;
        this.configureService.RenameProblem(unifiedModel).pipe(takeUntil(this.destroy$)).subscribe(_response => {
          unifiedModel.ProblemSetting.ConfigurationName = _response.ProblemName;
          this.loadDataProblems({ projectGuid: unifiedModel.ProblemSetting.ProjectGuid });
        });
      }
    }
  }

  setDefaultImage() {
    this.path = this.permissionService.checkPermission(Feature.WindowDefaultImageV2) ? '/assets/Images/window_default_SRS.png' : '/assets/Images/window__default.png';
    // this.path = '/assets/Images/window__default.png';
    if (this.problemToRun_problemGuid) {
      let selectedProblem = this.allProducts.filter(x => x.ProblemGuid == this.problemToRun_problemGuid);
      if (selectedProblem && selectedProblem.length == 1 && selectedProblem[0].UnifiedModel) {
        let unified3DModel: BpsUnifiedModel = JSON.parse(selectedProblem[0].UnifiedModel);
        if (unified3DModel && unified3DModel.ProblemSetting) {
          if (unified3DModel.ProblemSetting.ProductType == "Facade") {
            if (unified3DModel.ProblemSetting.FacadeType == "mullion-transom")
              this.path = '/assets/Images/facade_default.png';
            else if (unified3DModel.ProblemSetting.FacadeType == "UDC")
              this.path = '/assets/Images/facade_UDC_default.png';
          }
        }
      }
    }
  }

  progressClicked = false;
  onIndexChange(): void {
    this.progressClicked = true;
    setTimeout(() => {
      this.progressClicked = false;
    }, 500);
  }

  // getRandomInt(min, max) : number{
  //   min = Math.ceil(min);
  //   max = Math.floor(max);
  //   return Math.floor(Math.random() * (max - min + 1)) + min; 
  // }

  /**
   * Text to display in the tooltip displayed when the user hovers the acoustic cell of the problem
   * @param id row number of the problem
   * @returns 
   */
  getAcousticCellTooltip(id: number) {
    if (this.mapOfCheckedIdAcoustic[id] && !this.mapOfDisabledIdAcoustic[id])
      return this.translate.instant(_('home.acoustic-computed'));
    else if (!this.mapOfCheckedIdAcoustic[id] && !this.mapOfDisabledIdAcoustic[id])
      return this.translate.instant(_('home.acoustic-not-computed'));
    else if (this.mapOfDisabledIdAcoustic[id])
      return this.translate.instant(_('home.acoustic-not-selected'));
  }

  /**
   * Text to display in the tooltip displayed when the user hovers the structural cell of the problem
   * @param id row number of the problem
   * @returns 
   */
  getStructuralCellTooltip(id: number) {
    if (this.mapOfCheckedIdStructural[id] && !this.mapOfDisabledIdStructural[id])
      return this.translate.instant(_('home.structural-computed'));
    else if (!this.mapOfCheckedIdStructural[id] && !this.mapOfDisabledIdStructural[id])
      return this.translate.instant(_('home.structural-not-computed'));
    else if (this.mapOfDisabledIdStructural[id])
      return this.translate.instant(_('home.structural-not-selected'));
  }

  /**
   * Text to display in the tooltip displayed when the user hovers the thermal cell of the problem
   * @param id row number of the problem
   * @returns 
   */
  getThermalCellTooltip(id: number) {
    if (this.mapOfCheckedIdThermal[id] && !this.mapOfDisabledIdThermal[id])
      return this.translate.instant(_('home.thermal-computed'));
    else if (!this.mapOfCheckedIdThermal[id] && !this.mapOfDisabledIdThermal[id])
      return this.translate.instant(_('home.thermal-not-computed'));
    else if (this.mapOfDisabledIdThermal[id])
      return this.translate.instant(_('home.thermal-not-selected'));
  }
  
}
