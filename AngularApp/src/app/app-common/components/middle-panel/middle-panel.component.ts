import { Inject, NgZone, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, formatDate } from '@angular/common';
import { Component, OnInit, ViewChildren, QueryList, AfterViewInit, ElementRef, Input, ViewChild, TemplateRef, ChangeDetectorRef, ChangeDetectionStrategy, ViewEncapsulation, OnDestroy } from '@angular/core';
import { HomeService } from '../../services/home.service';
import { BpsProject } from '../../models/bps-project';
import { NavLayoutService } from 'src/app/app-layout/services/nav-layout.service';
import { Router } from '@angular/router';
import { ConfigureService } from 'src/app/app-structural/services/configure.service';
import { BpsUnifiedProblem } from '../../models/bps-unified-problem';
import { BpsUnifiedModel } from '../../models/bps-unified-model';
import { CeldType, BpsTableComponent } from 'bps-components-lib';
import { TranslateService } from '@ngx-translate/core';
import { _ } from '@biesbjerg/ngx-translate-extract/dist/utils/utils';
import { Subject, Subscription } from 'rxjs';
import { LocalStorageService } from 'src/app/app-core/services/local-storage.service';
import { CommonService } from '../../services/common.service';
import { NzModalService } from 'ng-zorro-antd';
import am4themes_animated from '@amcharts/amcharts4/themes/animated';
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import { Feature } from 'src/app/app-core/models/feature';
import { PermissionService } from 'src/app/app-core/services/permission.service';
import { takeUntil } from 'rxjs/operators';
import { ResultService } from 'src/app/app-structural/services/result.service';

@Component({
  selector: 'app-middle-panel',
  templateUrl: './middle-panel.component.html',
  styleUrls: ['./middle-panel.component.css']
})
export class MiddlePanelComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  feature= Feature;
  selectedDateValue: any;
  selectedStatusValue: any;
  private chart: am4charts.XYChart;
  dealerInfo: any;
  // Run the function only in the browser
  browserOnly(f: () => void) {
    if (isPlatformBrowser(this.platformId)) {
      this.zone.runOutsideAngular(() => {
        f();
      });
    }
  }
  build_chart1() {
    let chart1 = am4core.create("chartdiv2", am4charts.XYChart);
    var title = chart1.titles.push(new am4core.Label());
    title.text = "PRODUCTS BY DATE";
    title.fontSize = 12;
    title.fontWeight = "400";
    title.marginBottom = 15;
    title.marginLeft = 50;
    title.align = "left";

    chart1.paddingRight = 20;
    // Add data
    const dealerOrderData = this.orderByMonthsData;
    const order = dealerOrderData.length > 0 ? dealerOrderData[0].MonthOrders : null;

    chart1.data = [
      { "year": "Jan", "Orders": order != null ? order[0] : 0 },
      { "year": "Feb", "Orders": order != null ? order[1] : 0 },
      { "year": "Mar", "Orders": order != null ? order[2] : 0 },
      { "year": "Apr", "Orders": order != null ? order[3] : 0 },
      { "year": "May", "Orders": order != null ? order[4] : 0 },
      { "year": "Jun", "Orders": order != null ? order[5] : 0 },
      { "year": "Jul", "Orders": order != null ? order[6] : 0 },
      { "year": "Aug", "Orders": order != null ? order[7] : 0 },
      { "year": "Sep", "Orders": order != null ? order[8] : 0 },
      { "year": "Oct", "Orders": order != null ? order[9] : 0 },
      { "year": "Nov", "Orders": order != null ? order[10] : 0 },
      { "year": "Dec", "Orders": order != null ? order[11] : 0 },];

    // Create axes
    let categoryAxis2 = chart1.xAxes.push(new am4charts.CategoryAxis());
    categoryAxis2.dataFields.category = "year";
    categoryAxis2.title.text = "Months";
    categoryAxis2.title.fontSize = 12;
    categoryAxis2.title.fontWeight = "400";
    categoryAxis2.title.marginTop = 15;

    categoryAxis2.renderer.grid.template.location = 0;
    categoryAxis2.renderer.minGridDistance = 20;
    categoryAxis2.renderer.cellStartLocation = 0.1;
    categoryAxis2.renderer.cellEndLocation = 0.9;

    categoryAxis2.renderer.inside = true;
    categoryAxis2.renderer.grid.template.disabled = true;
    let labelTemplate = categoryAxis2.renderer.labels.template;
    labelTemplate.rotation = -90;
    labelTemplate.horizontalCenter = "left";
    labelTemplate.verticalCenter = "middle";
    labelTemplate.dy = -5; // moves it a bit down;
    labelTemplate.inside = false; // this is done to avoid settings which are not suitable when label is rotated


    let valueAxis2 = chart1.yAxes.push(new am4charts.ValueAxis());
    valueAxis2.min = 0;
    valueAxis2.title.text = "Quantity";
    valueAxis2.title.fontSize = 12;
    valueAxis2.title.fontWeight = "400";

    this.createSeries(chart1, "Orders", "Orders", true);
    // this.createSeries(chart1, "Bernice", "Bernice", true);
    // this.createSeries(chart1, "Smith", "Smith", true);
    // this.createSeries(chart1, "Jonny", "Jonny", true);
    // this.createSeries(chart1, "Jonny1", "Jonny1", true);
    // this.createSeries(chart1, "Jonny2", "Jonny2", true);
    // this.createSeries(chart1, "Jonny3", "Jonny3", true);
    // this.createSeries(chart1, "May", "May", true);
    // this.createSeries(chart1, "Jun", "Jun", true);
    // this.createSeries(chart1, "Jul", "Jul", true);
    // this.createSeries(chart1, "Aug", "Aug", true);
    // this.createSeries(chart1, "Sep", "Sep", true);
    // this.createSeries(chart1, "Oct", "Oct", true);
    // this.createSeries(chart1, "Nov", "Nov", true);
    // this.createSeries(chart1, "Dec", "Dec", true);
    // Add legend
    // chart1.legend = new am4charts.Legend();
    // chart1.legend.position = "right";
    // chart1.legend.scrollable = true;

    setTimeout(function () {
      this.amChartLogo = document.querySelectorAll('title[id*="id-"]');
      this.amChartLogo.forEach(element => {
        if (element.innerHTML === "Chart created using amCharts library") {
          this.amChartLogoParent = element.parentNode;
          this.amChartLogoParent.style.display = "none";
        }
      });
    }, 500);
  }
  build_chart0() {

    let chart = am4core.create("chartdiv", am4charts.XYChart);
    var title = chart.titles.push(new am4core.Label());
    title.text = "PRODUCTS BY STATUS";
    title.fontSize = 12;
    title.fontWeight = "400";
    title.marginBottom = 15;
    title.marginLeft = 50;
    title.align = "left";

    chart.paddingRight = 20;

    chart.data = [
      { "country": this.orderByStatusData[0]>1 ? 'Products Ordered' : 'Product Ordered', "visits": this.orderByStatusData[0] },
      { "country": this.orderByStatusData[1]>1 ?'Products In Pre-production': 'Product In Pre-production', "visits": this.orderByStatusData[1] },
      { "country": this.orderByStatusData[2]>1 ?'Products In Fabrication' : 'Product In Fabrication', "visits": this.orderByStatusData[2] },
      { "country": this.orderByStatusData[3]>1 ?'Products In Assembly' : 'Product In Assembly', "visits": this.orderByStatusData[3] },
      { "country": this.orderByStatusData[4]>1 ?'Products Shipped' : 'Product Shipped', "visits": this.orderByStatusData[4] },
      { "country": this.orderByStatusData[5]>1 ?'Products Delivered' : 'Product Delivered', "visits": this.orderByStatusData[5] }];
    // Create axes
    let categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
    categoryAxis.dataFields.category = "country";
    categoryAxis.title.text = "Status";
    categoryAxis.title.fontSize = 12;
    categoryAxis.title.fontWeight = "400";
    categoryAxis.title.marginTop = 15;
    categoryAxis.renderer.grid.template.location = 0;
    categoryAxis.renderer.minGridDistance = 30;
    categoryAxis.renderer.inside = true;
    categoryAxis.renderer.grid.template.disabled = true;

    let labelTemplate = categoryAxis.renderer.labels.template;
    labelTemplate.rotation = -90;
    labelTemplate.horizontalCenter = "left";
    labelTemplate.verticalCenter = "middle";
    labelTemplate.dy = -5; // moves it a bit down;
    labelTemplate.inside = false; // this is done to avoid settings which are not suitable when label is rotated
    // labelTemplate.wrap = true;
    // labelTemplate.maxWidth = 80;
    let valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
    valueAxis.title.text = "Quantity";
    valueAxis.title.fontWeight = "400";
    valueAxis.title.fontSize = 12;
    valueAxis.min = 0;

    // Create series
    let series = chart.series.push(new am4charts.ColumnSeries());
    series.dataFields.valueY = "visits";
    series.dataFields.categoryX = "country";
    series.name = "Visits";
    series.columns.template.tooltipText = "{categoryX}: [bold]{valueY}[/]";
    series.columns.template.fillOpacity = 1;

    let columnTemplate = series.columns.template;
    columnTemplate.strokeWidth = 1;
    columnTemplate.strokeOpacity = 1;

    setTimeout(function () {
      this.amChartLogo = document.querySelectorAll('title[id*="id-"]');
      this.amChartLogo.forEach(element => {
        if (element.innerHTML === "Chart created using amCharts library") {
          this.amChartLogoParent = element.parentNode;
          this.amChartLogoParent.style.display = "none";
        }
      });
    }, 500);
  }

  // build_chart2() {
  //   let chart2 = am4core.create("chartdiv2", am4charts.XYChart);

  //   // Create axes
  //   var dateAxis = chart2.xAxes.push(new am4charts.DateAxis());
  //   dateAxis.renderer.grid.template.location = 0;
  //   dateAxis.minZoomCount = 5;
  //   // this makes the data to be grouped
  //   dateAxis.groupData = true;
  //   dateAxis.groupCount = 500;

  //   var valueAxis = chart2.yAxes.push(new am4charts.ValueAxis());

  //   for (var i = 0; i < 20; i++) {
  //     this.createSeries2(chart2, "value" + i, "Series #" + i);
  //   }

  //   var scrollbarX = new am4core.Scrollbar();
  //   scrollbarX.marginBottom = 20;
  //   chart2.scrollbarX = scrollbarX;

  //   chart2.cursor = new am4charts.XYCursor();
  //   chart2.cursor.xAxis = dateAxis;

  //   chart2.legend = new am4charts.Legend();
  //   chart2.legend.position = "right";
  //   chart2.legend.scrollable = true;

  //   // setTimeout(function() {
  //   //   chart.legend.markers.getIndex(0).opacity = 0.3;
  //   // }, 3000)
  //   chart2.legend.markers.template.states.create("dimmed").properties.opacity = 0.3;
  //   chart2.legend.labels.template.states.create("dimmed").properties.opacity = 0.3;

  //   // // const that = this;
  //   // // chart2.legend.itemContainers.template.events.on("over", function (event) {
  //   // //   that.processOver(chart2, event.target.dataItem.dataContext);
  //   // // })

  //   // // chart2.legend.itemContainers.template.events.on("out", function (event) {
  //   // //   that.processOut(chart2); //, event.target.dataItem.dataContext
  //   // // })
  // }
  createSeries2(chart2, s, name) {
    var series = chart2.series.push(new am4charts.LineSeries());
    series.dataFields.valueY = "value" + s;
    series.dataFields.dateX = "date";
    series.tooltipText = "{valueY}";
    series.tooltip.pointerOrientation = "vertical";
    series.tooltip.background.fillOpacity = 0.5;
    series.name = name;

    var segment = series.segments.template;
    segment.interactionsEnabled = true;

    var hoverState = segment.states.create("hover");
    hoverState.properties.strokeWidth = 3;

    var dimmed = segment.states.create("dimmed");
    dimmed.properties.stroke = am4core.color("#dadada");

    segment.events.on("over", function (event) {
      this.processOver(chart2, event.target.parent.parent.parent);
    });

    segment.events.on("out", function (event) {
      this.processOut(chart2, event.target.parent.parent.parent);
    });

    var data = [];
    var value = Math.round(Math.random() * 100) + 100;
    for (var i = 1; i < 100; i++) {
      value += Math.round((Math.random() < 0.5 ? 1 : -1) * Math.random() * 30 + i / 5);
      var dataItem = { date: new Date(2018, 0, i) };
      dataItem["value" + s] = value;
      data.push(dataItem);
    }

    series.data = data;
    return series;
  }
  processOver(chart2, hoveredSeries) {
    hoveredSeries.toFront();

    hoveredSeries.segments.each(function (segment) {
      segment.setState("hover");
    })

    hoveredSeries.legendDataItem.marker.setState("default");
    hoveredSeries.legendDataItem.label.setState("default");

    chart2.series.each(function (series) {
      if (series != hoveredSeries) {
        series.segments.each(function (segment) {
          segment.setState("dimmed");
        })
        series.bulletsContainer.setState("dimmed");
        series.legendDataItem.marker.setState("dimmed");
        series.legendDataItem.label.setState("dimmed");
      }
    });
  }
  processOut(chart2) {
    chart2.series.each(function (series) {
      series.segments.each(function (segment) {
        segment.setState("default");
      })
      series.bulletsContainer.setState("default");
      series.legendDataItem.marker.setState("default");
      series.legendDataItem.label.setState("default");
    });
  }
  ngAfterViewInit() {
    // Chart code goes in here
    this.browserOnly(() => {
      am4core.useTheme(am4themes_animated);
      //this.build_chart0();
      //this.build_chart1();
      //this.build_chart2();
    });

    setTimeout(function () {
      this.amChartLogo = document.querySelectorAll('title[id*="id-"]');
      this.amChartLogo.forEach(element => {
        if (element.innerHTML === "Chart created using amCharts library") {
          this.amChartLogoParent = element.parentNode;
          this.amChartLogoParent.style.display = "none";
        }
      });
    }, 500);
  }

  // Create series
  createSeries(chart1, field, name, stacked) {
    let series = chart1.series.push(new am4charts.ColumnSeries());
    series.dataFields.valueY = field;
    series.dataFields.categoryX = "year";
    series.name = name;
    series.columns.template.tooltipText = "{name}: [bold]{valueY}[/]";
    series.stacked = stacked;
    series.columns.template.width = am4core.percent(95);
  }
  @ViewChildren('newNameProblemInput') newNameProblemInputList: QueryList<ElementRef>;
  @Input() isReload: boolean = false
  @Input() projects: BpsProject[] = [];
  projectGuidToDisplay: string = '-1';
  projectGuidToHighlight: string = '-1';
  projectGuidToDisplayBin: string = '-1';
  problemGuidToDisplayRenameProblemInput: string = '-1';
  problemGuidToHighlight: string = '-1';
  problemGuidToDisplayEditButton: string = '-1';
  clickedOnRemoveProjectButtons: boolean = false;
  isProjectSelected: boolean = false;
  problemHover: string = '-1';
  problemRenameActiveInputElement: ElementRef;

  configurationCustomGridProjects: any; //project
  listOfDisplayDataProjects = []; //project
  dataProjects = []; //project
  sortName: string | null = null; //project
  sortValue: string | null = null; //project
  searchValue = ''; //project
  projectToDelete_projectGuid: string; //project
  // problemToRun_projectGuid: string; //project
  projectClicked_projectGuid: string; //project
  isOperating = false;//project

  language: string;
  activeRow = null;
  editProperty = "";
  currentProductOrderPlaced = false;

  isOperatingExpandableTable: boolean = false;
  isrowClicked: boolean = false;

  hasFullAccess: boolean = false;
  //applicationType = 'BPS';
  problemsOfSelectedProject: BpsUnifiedProblem[];
  @ViewChild('tableComponent', { read: BpsTableComponent, static: true }) tableComponent: BpsTableComponent; //project
  @ViewChild('cellTemplate', { read: TemplateRef, static: false }) cellTemplate: TemplateRef<{}>;
  @ViewChild('orderPlacedTemplate', { read: TemplateRef, static: true }) orderPlacedTemplate: TemplateRef<{}>;

  public getItemSub: Subscription;
  orderByStatusData: any;

  public getItem1Sub: Subscription;
  orderByMonthsData: any;

  constructor(
    @Inject(PLATFORM_ID) private platformId, private zone: NgZone,
    private cdr: ChangeDetectorRef, private router: Router, private commonService: CommonService,
    private homeService: HomeService, private navLayoutService: NavLayoutService,
    private configureService: ConfigureService, private translate: TranslateService,
    private localStorageService: LocalStorageService, private modalService: NzModalService,
    private resultService: ResultService,
    private permissionService:PermissionService) { }

  getItemsForOrder() {
    this.getItemSub = this.homeService.getItemsForOrderDashboard(this.selectedStatusValue, this.selectedDateValue)
      .subscribe(data => {
        this.orderByStatusData = data;
        this.build_chart0();
      })
  }
  getOrderForMonth() {
    this.getItem1Sub = this.homeService.getAllOrders(this.selectedStatusValue, this.selectedDateValue)
      .subscribe(data => {
        this.orderByMonthsData = data;
        this.build_chart1();
      })
  }
  ngOnInit(): void {
    this.loadDataProjects(); //project
    this.hasFullAccess = this.commonService.getUserRole() === "Dealer-Full" ? true : false;
    //this.applicationType = this.commonService.getApplicationType();
    this.configurationCustomGridProjects = { //projects
      fields: [
        {
          celdType: CeldType.Default,
          // display: this.projectsDisplay,
            display: this.permissionService.checkPermission(Feature.GetProjects) ? this.translate.instant(_('home.projects')).toUpperCase() : 
                   this.permissionService.checkPermission(Feature.GetSRSProjects) ? 'ORDERS' : null,
          property: 'projects',
          width: '300px',
          expandable: true,
          showSort: true,
          showCustomFilter: true
        },
        {
          celdType: CeldType.Default,
          display: this.translate.instant(_('home.date')),
          property: 'day',
          width: '90px',
          showSort: true
        },
        {
          celdType: CeldType.Default,
          display: this.translate.instant(_('home.location')),
          property: 'location',
          width: '340px',
          showSort: true
        },
        {
          celdType: CeldType.TemplateRef,
          property: 'outside',
          width: '65px',
          showSort: false
        }
      ],
      fieldId: 'id'
    };
    // this.path_default = this.appConstantService.APP_DOMAIN + "Content/screenshots/default.png";
    //this.path_default = this.appConstantService.APP_DOMAIN + "Content/screenshots/a0fbed4d-21c9-4399-81ea-00e1e485f6d1.jpg";
    this.language = (this.localStorageService.getValue('culture')) ? this.localStorageService.getValue('culture') : 'en-US';
    if (this.permissionService.checkPermission(Feature.GetDealerInfo)) {
      this.homeService.GetDealerInformation().pipe(takeUntil(this.destroy$)).subscribe(dealer => {
        this.dealerInfo = dealer;
        this.getItemsForOrder();
        this.getOrderForMonth();
      });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();


    // Clean up chart when the component is removed
    this.browserOnly(() => {
      if (this.chart) {
        this.chart.dispose();
      }
    });
    if (this.getItemSub) {
      this.getItemSub.unsubscribe();
    }
    if (this.getItem1Sub) {
      this.getItem1Sub.unsubscribe();
    }
  }

  //project
  loadDataProjects(): void {
    this.dataProjects = [];
    let number_of_project = this.projects.length;
    for (let i = 0; i < number_of_project; i++) {
      let date = new Date(this.projects[i].ModifiedOn);
      const ye = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(date);
      const mo = new Intl.DateTimeFormat('en', { month: 'short' }).format(date);
      const da = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(date);

      this.dataProjects.push({
        id: '' + i,
        createdOn: this.projects[i].CreatedOn,
        projects: this.projects[i].ProjectName,
        day: mo + " " + da + " " + ye,
        location: this.projects[i].ProjectLocation,
        expand: true,
        projectGuid: this.projects[i].ProjectGuid,
        orderPlaced: this.projects[i].OrderPlaced,
        orderStatus: this.projects[i].OrderStatus,
        ProjectId: this.projects[i].ProjectId,
        // outside: {
        //   ref: this.orderPlacedTemplate,
        //   context: {
        //     value: this.projects[i].OrderPlaced,
        //     index: i
        //   }
        // }
      });
    }

    this.listOfDisplayDataProjects = [...this.dataProjects];
  }

  //project
  sort(sort: { sortName: string; sortValue: string }): void {
    this.sortName = sort.sortName;
    this.sortValue = sort.sortValue;
    this.search();
  }

  //project
  filter(value: string): void {
    this.searchValue = value;
    this.search();
  }

  //project
  search(): void {
    const filterFunc = (item: any) => {
      return item.projects.toLowerCase().indexOf(this.searchValue.toLowerCase()) !== -1;
    };
    const data = this.dataProjects.filter((item: { name: string; age: number; address: string }) => filterFunc(item));
    if (data && data.length == 1 && this.tableComponent) {
      this.tableComponent.selectRow(data[0]);
    }
    if (this.sortName && this.sortValue) {
      this.listOfDisplayDataProjects = data.sort((a, b) =>
        this.sortValue === 'ascend' ? 
          this.sortName === 'day' ?
            new Date(a[this.sortName!]) > new Date(b[this.sortName!]) ? 1 : -1
            :
            a[this.sortName!] > b[this.sortName!] ? 1 : -1
          :
          this.sortName === 'day' ?
            new Date(b[this.sortName!]) > new Date(a[this.sortName!]) ? 1 : -1
            :
            b[this.sortName!] > a[this.sortName!] ? 1 : -1
      );
      this.listOfDisplayDataProjects = [...this.listOfDisplayDataProjects];
    } else {
      this.listOfDisplayDataProjects = data;
    }
  }

  //project
  log($event, type = null) {
  }

  onRegisterProjectGuidToDelete(event: any) {
    this.activeRow = event;
    this.currentProductOrderPlaced = event.orderPlaced;
    this.projectToDelete_projectGuid = event.projectGuid;
  }

  onExpandableArrowClicked(event: any, isOpened: any) {
    this.currentProductOrderPlaced = event.orderPlaced;
    if (this.isrowClicked)
      this.isrowClicked = false;
    else {
      if (Object.values(event)[0]) {
        let selectedProject = this.listOfDisplayDataProjects.filter(x => x.id == Object.keys(event)[0]);
        if (selectedProject && selectedProject[0]) {
          this.projectClicked_projectGuid = selectedProject[0].projectGuid;
          this.isOperatingExpandableTable = true;
          this.configureService.GetProblemsForProjectLite(selectedProject[0].projectGuid).pipe(takeUntil(this.destroy$)).subscribe((response) => {
            if (response)
              this.problemsOfSelectedProject = response;
          }, (error) => this.isOperatingExpandableTable = false);
        }
      }
    }
  }

  onRowClicked(event: any) {
    this.currentProductOrderPlaced = event.orderPlaced;
    this.isOperatingExpandableTable = true;
    this.projectClicked_projectGuid = event.projectGuid;
    this.configureService.GetProblemsForProjectLite(event.projectGuid).pipe(takeUntil(this.destroy$)).subscribe((response) => {
      if (response) {
        this.problemsOfSelectedProject = response;
      }
    }, (error) => this.isOperatingExpandableTable = false);
  }

  onDblClickProject(event) {
    this.configureService.GetProblemsForProject(event.projectGuid).pipe(takeUntil(this.destroy$)).subscribe((response) => {
      this.onRunningProblem(response[0]);
    });
  }

  ngOnChanges(value: boolean) {
    if (this.isReload)
      this.GetProjects();
  }

  GetProjectsForCurrentCustomer() {
    this.GetProjects();
  }

  GetProjects(): void {
    if (this.permissionService.checkPermission(this.feature.GetProjects)) {
      this.homeService.GetProjects().pipe(takeUntil(this.destroy$)).subscribe(bpsProject => {
        this.projects = bpsProject.sort((a, b) => (a.ProjectId > b.ProjectId ? -1 : 1));
        this.loadDataProjects();
      });
    }
    else if(this.permissionService.checkPermission(this.feature.GetSRSProjects)){
      this.homeService.GetSRSProjects(this.selectedStatusValue, this.selectedDateValue).pipe(takeUntil(this.destroy$)).subscribe(bpsProject => {
        this.projects = bpsProject.sort((a, b) => (a.ProjectId > b.ProjectId ? -1 : 1));
        this.loadDataProjects();
      });
    }
  }

  calculateDiff(sentDate: Date) {
    var date1: any = new Date(sentDate);
    var date2: any = new Date();
    var diffDays: any = Math.floor((date2 - date1) / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  onDeleteProject(): void {  // keep
    if (this.calculateDiff(this.activeRow.OrderPlacedCreatedOn) > 1) {
      this.modalService.error({
        nzWrapClassName: "vertical-center-modal",
        nzWidth: '410px',
        nzTitle: '',
        nzContent: "Order submitted! You can't delete the order at this time! If you have any questions, please contact our Schuco representative at this email: dealers @schuco-usa.com.",
        nzOkText: "Ok",
        nzOnOk: () => {
        }
      });
    }
    else if (this.activeRow.orderPlaced) {
      this.modalService.error({
        nzWrapClassName: "vertical-center-modal",
        nzWidth: '410px',
        nzTitle: '',
        nzContent: "Order is placed and Schüco USA is reviewing it. if you wish to delete the project, you can cancel the order first and then delete project, before 24h.",
        nzOkText: "Ok",
        nzOnOk: () => {
        }
      });
    }
    else {
      this.modalService.error({
        nzWrapClassName: "vertical-center-modal",
        nzWidth: '410px',
        nzTitle: '',
        nzContent: this.permissionService.checkPermission(Feature.GetSRSProjects) ? "Are you sure you want to delete this order?" : "Are you sure you want to delete this project?",
        nzOkText: "Yes",
        nzOnOk: () => {
          this.clickedOnRemoveProjectButtons = true;
          this.homeService.DeleteProject(this.projectToDelete_projectGuid).pipe(takeUntil(this.destroy$)).subscribe(_response => {
            if (this.configureService.previousProblem_ProjectGuid) {
              if (this.projectToDelete_projectGuid == this.configureService.previousProblem_ProjectGuid) {
                this.navLayoutService.deletePreviousArrow();
              }
            }
            let index = this.listOfDisplayDataProjects.map(project => project.projectGuid).indexOf(this.projectToDelete_projectGuid);
            let data = this.listOfDisplayDataProjects;
            data.splice(index, 1);
            this.listOfDisplayDataProjects = [];
            this.listOfDisplayDataProjects = [...data];
            setTimeout(() => {
              this.navLayoutService.resetDealerInfo(true);
            }, 100);
          });
        },
        nzCancelText: 'No',
        nzOnCancel: () => {
        }
      });
    }
  }

  //project
  onRunningProblem(problem: BpsUnifiedProblem): void {  // keep
    this.navLayoutService.changeNavBarButtonAndTitleVisibility(true);
    this.configureService.configureCall = false;
    this.configureService.setProblemShow(problem.ProblemGuid);
    let unifiedModel: BpsUnifiedModel = JSON.parse(problem.UnifiedModel);
    if (unifiedModel && !unifiedModel.AnalysisResult)
      this.configureService.sendMessage(false);
    if (problem.OrderPlaced)
      this.router.navigate(['/orders/', problem.ProblemGuid]);
    else
      this.router.navigate(['/problemconfigure/', problem.ProblemGuid]);
  }
  log1(event: any) {

  }

  //project
  setActiveRow($event) {
    this.currentProductOrderPlaced = $event.orderPlaced;
    this.activeRow = $event;
  }

  //project
  editRow(property) {
    if (this.activeRow && !this.activeRow.orderPlaced) {
      this.tableComponent.editRow(this.activeRow, property);
      this.editProperty = property;
    }
  }

  //project
  onProjectEdit(event: any) {
    if (this.activeRow && !this.activeRow.orderPlaced) {
      this.currentProductOrderPlaced = event.orderPlaced;
      if (event && event.length > 0 && this.editProperty) {
        let selectedProject = event[0];
        let productInfo = {
          ProjectGuid: selectedProject.projectGuid,
          ProjectName: selectedProject.projects,
          Location: selectedProject.location
        };
        this.homeService.UpdateProjectInfo(productInfo).pipe(takeUntil(this.destroy$)).subscribe((response) => {
          this.configureService.GetProblemsForProject(productInfo.ProjectGuid).pipe(takeUntil(this.destroy$)).subscribe((problems) => {
            let reportURLs = [];
            problems.forEach(problem => {
              let unifiedModel: BpsUnifiedModel = JSON.parse(problem.UnifiedModel);
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
            });
            let projectName = productInfo.ProjectName;
            let location = productInfo.Location;
            this.resultService.UpdateProjectInfo({ reportURLs, projectName, location }).pipe(takeUntil(this.destroy$)).subscribe((response) => {
            });
          });
        });
      }
    }
  }

  filteredData: any[];
  onDateFilter_Change() {
    this.listOfDisplayDataProjects = [];
    if ((this.selectedDateValue == null || this.selectedDateValue == undefined) && (this.selectedStatusValue == null || this.selectedStatusValue == undefined))
      this.listOfDisplayDataProjects = [...this.dataProjects];
    else {
      this.filteredData = [];
      if (this.selectedDateValue == "Year") {
        this.filteredData = this.dataProjects.filter(f => new Date(f.createdOn).getFullYear() == new Date().getFullYear());
      }
      else if (this.selectedDateValue == "Month") {
        var date = new Date();
        var firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
        var lastDay = new Date(date.getFullYear(), date.getMonth(), this.daysInMonth(date.getMonth() + 1, date.getFullYear()));
        this.filteredData = this.dataProjects.filter(f => new Date(f.createdOn) > firstDay && new Date(f.createdOn) < lastDay);
      }
      else if (this.selectedDateValue == "Week") {
        var curr = new Date;
        var startOfWeek = new Date(curr.setDate(curr.getDate() - curr.getDay()));
        var endOfWeek = new Date(curr.setDate(curr.getDate() - curr.getDay() + 6));

        this.filteredData = this.dataProjects.filter(f => new Date(f.createdOn) > startOfWeek && new Date(f.createdOn) < endOfWeek);
      }
      else if (this.selectedDateValue == "Today") {
        this.filteredData = this.dataProjects.filter(f =>
          new Date(f.createdOn).getDay() == new Date().getDay() &&
          new Date(f.createdOn).getMonth() == new Date().getMonth() &&
          new Date(f.createdOn).getFullYear() == new Date().getFullYear());
      } else if (this.selectedDateValue != null || this.selectedDateValue != undefined) {
        this.filteredData = this.dataProjects.filter(f => f.day.indexOf(this.selectedDateValue) > -1);
      } else {
        this.filteredData = this.dataProjects;
      }
      this.listOfDisplayDataProjects = [...this.filteredData.filter(f => this.selectedStatusValue == null || f.orderStatus == this.selectedStatusValue)];
    }
  }
  daysInMonth(month, year): number {
    return new Date(year, month, 0).getDate();
  }
  onFilterChanged(event: any, type: string) {
    if (type === "Date")
      this.selectedDateValue = event;
    if (type === "Status")
      this.selectedStatusValue = event;
    //this.onDateFilter_Change();
    this.GetProjects();
    this.getOrderForMonth();
    this.getItemsForOrder();
  }
}
