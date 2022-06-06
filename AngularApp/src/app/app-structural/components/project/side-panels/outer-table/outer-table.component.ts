import { Component, OnInit, EventEmitter, Input, ViewChild, TemplateRef, OnDestroy, AfterViewInit } from '@angular/core';
import { FramingService } from 'src/app/app-structural/services/framing.service';
import { CeldType, BpsTableComponent } from 'bps-components-lib';
import { TranslateService } from '@ngx-translate/core';
import { _ } from '@biesbjerg/ngx-translate-extract/dist/utils/utils';
import { ConfigureService } from 'src/app/app-structural/services/configure.service';
import { UnifiedModelService } from 'src/app/app-structural/services/unified-model.service';
import { BpsUnifiedModel } from 'src/app/app-common/models/bps-unified-model';
import { PanelsModule } from 'src/app/app-structural/models/panels/panels.module';
import { ConfigPanelsService } from 'src/app/app-structural/services/config-panels.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-outer-table',
  templateUrl: './outer-table.component.html',
  styleUrls: ['./outer-table.component.css']
})
export class OuterTableComponent implements OnInit, OnDestroy, AfterViewInit {
  unified3DModel: BpsUnifiedModel;

  systemSelected: any;
  adsSystemType: boolean = false;
  aseSystemType: boolean = false;

  //#region bpstable
  isPopoutOpened: boolean = false;
  isPopoutOpenedForBottomOuterFrame: boolean = false;
  baseImageSrc = 'https://vcl-design-com.s3.amazonaws.com/StaticFiles/Images/article-jpeg/cross-section/';
  //defaultImageSrc = 'https://vcl-design-com.s3.amazonaws.com/StaticFiles/Images/article-jpeg/customArticle.svg';
  private destroy$ = new Subject<void>();
  selectedIndex: any;
  configurationCustomGrid: any;
  listOfDisplayData = [];
  data = [];
  sortName: string | null = null;
  sortValue: string | null = null;
  searchValue = '';
  arrow_hovered = false;
  searchByDimensionText: string = this.translate.instant(_('configure.mullion-depth-search-by-article'));
  @ViewChild('uValueTemplate', { read: TemplateRef, static: true }) uValueTemplate: TemplateRef<{}>;
  @ViewChild('rwTemplate', { read: TemplateRef, static: true }) rwTemplate: TemplateRef<{}>;
  @ViewChild('outsideTemplate', { read: TemplateRef, static: true }) outsideTemplate: TemplateRef<{}>;
  @ViewChild('bpsTable', { read: BpsTableComponent, static: false }) tableComponent: BpsTableComponent<{}>;
  showSection: boolean = false;
  //#endregion

  constructor(
    private translate: TranslateService,
    private fService: FramingService,
    private umService: UnifiedModelService,
    private cpService: ConfigPanelsService,
    private configService: ConfigureService
  ) {
  }

  ngAfterViewInit() {
    this.umService.obsUnifiedModel.pipe(takeUntil(this.destroy$)).subscribe(
      response => {
        if (response) {
          this.unified3DModel = response;
        }
      });
    
    this.cpService.obsSystem.pipe(takeUntil(this.destroy$)).subscribe(
      response => {
        this.systemSelected = response.data;
      });
    
    this.cpService.obsPopout.pipe(takeUntil(this.destroy$)).subscribe(
      response => {
        if (this.unified3DModel !== undefined && (response.panelsModule === PanelsModule.OuterFrame || response.panelsModule === PanelsModule.BottomOuterFrameSliding)) {
          if (response.isOpened) {
            this.isPopoutOpenedForBottomOuterFrame = response.panelsModule === PanelsModule.BottomOuterFrameSliding;
            this.onPopoutOpened();
            this.getConfigGrid();
          }
          this.isPopoutOpened = response.isOpened;
        }
      });
  }
  
  ngOnInit(): void {
    this.unified3DModel = this.umService.current_UnifiedModel;
  }

  //#region bpstable
  getConfigGrid() {
    this.configurationCustomGrid = {
      fields: [
        {
          celdType: CeldType.Default,
          display: this.translate.instant(_('configure.profile-description')),
          property: 'description',
          width: '180px',
          showSort: true
        },
        {
          celdType: CeldType.Default,
          property: 'inside',
          template: {
            ref: this.uValueTemplate,
            context: {}
          },
          width: '65px',
          showSort: true
        },
        {
          celdType: CeldType.Default,//CeldType.TemplateRef,
          property: 'outside',
          width: '65px',
          template: {
            ref: this.rwTemplate,
            context: {}
          },
          showSort: true
        }
      ],
      fieldId: 'id'
    };
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  preventDefault($event: Event) {
    $event.preventDefault();
    $event.stopImmediatePropagation();
  }

  onHover(index, value) {
    this.listOfDisplayData[index].outside.context.arrowHovered = value;
  }

  log($event) {
  }

  sort(sort: { sortName: string; sortValue: string }): void {
    this.sortName = sort.sortName;
    this.sortValue = sort.sortValue;
    this.search();
  }

  filter(value: string): void {
    this.searchValue = value;
    this.search();
  }

  search(): void {
    const filterFunc = (item: any) => {
      return item.description.indexOf(this.searchValue) !== -1;
    };
    const data = this.data.filter((item: { description: string; inside: string; outside: string }) => filterFunc(item));
    if (this.sortName && this.sortValue) {
      this.listOfDisplayData = data.sort((a, b) =>
        this.sortValue === 'ascend'
          ? a[this.sortName!] > b[this.sortName!]
            ? 1
            : -1
          : b[this.sortName!] > a[this.sortName!]
            ? 1
            : -1
      );
      this.listOfDisplayData = [...this.listOfDisplayData];
      this.getSelectedIndexAfterSearch();
    } else {
      this.listOfDisplayData = data;
      this.getSelectedIndexAfterSearch();
    }
  }
  //#endregion
  
  //#region build data
  onPopoutOpened() {
    if (!this.systemSelected) {
      this.systemSelected = this.cpService.currentSystem;
    }
    if (this.unified3DModel.ProblemSetting.ProductType == "Window") {
      this.collectData(this.systemSelected.Images);
    }
    else if (this.unified3DModel.ProblemSetting.ProductType == "Facade") {
      if (this.systemSelected.Images.toLowerCase().indexOf('fws') > -1)
        this.systemSelected.Images = 'aws__75_si_plus';
      this.collectData(this.systemSelected.Images);
    }
    else if (this.unified3DModel.ProblemSetting.ProductType == "SlidingDoor") {
      this.collectData(this.systemSelected.Images);
    }
  }

  collectData(system: string) {
    this.showSection = false;
    if (system.includes("aws")) {
      this.adsSystemType = false;
      this.aseSystemType = false;
      if (localStorage.getItem('outer_' + system)) {
        this.fillData(localStorage.getItem('outer_' + system));
      } else {
        this.fService.getOuterFramesForSystem(system).pipe(takeUntil(this.destroy$)).subscribe(data => {
          localStorage.setItem('outer_' + system, data);
          this.fillData(data);
        });
      }
    }
    else if (system.includes("ads")) {
      this.adsSystemType = true;
      this.aseSystemType = false;
      if (localStorage.getItem('outer_' + system)) {
        this.fillData(localStorage.getItem('outer_' + system));
      } else {
        this.fService.getADSArticlesList(system).pipe(takeUntil(this.destroy$)).subscribe(data => {
          localStorage.setItem('outer_' + system, data);
          this.fillData(data);
        });
      }
    }
    else if (system.includes("ase")) {
      this.adsSystemType = false;
      this.aseSystemType = true;
      if (localStorage.getItem('outer_' + system)) {
        this.fillData(localStorage.getItem('outer_' + system));
      } else {
        this.fService.getASEArticlesList(system).pipe(takeUntil(this.destroy$)).subscribe(data => {
          localStorage.setItem('outer_' + system, data);
          this.fillData(data);
        });
      }
    }
  }

  fillData(dataList: any) {
    let data = JSON.parse(dataList);
    this.showSection = true;
    if (this.configService.applicationType == "SRS") {
      if (this.adsSystemType) {
        data = data.filter(x => x.Type == "Frame");
      } else if (this.aseSystemType) {

      }
      else {
        data = data.filter(x => x.Name == "article__486890"); // filtering out articles meant only for SRS aws.
      }
    }
    
    this.getTableData(data);
    setTimeout(() => {
      if (this.tableComponent && this.listOfDisplayData[this.selectedIndex] !== undefined) {
        this.tableComponent.selectRow(this.listOfDisplayData[this.selectedIndex]);
        this.tableComponent.inputElement.nativeElement.value = '';
        this.searchValue = '';
        this.sortName = 'description';
        this.sortValue = 'ascend';
        this.search();
      }
    }, 1);
  }
  
  getTableData(data: any[]) {
    this.data = [];
    if (this.adsSystemType) {
      data.forEach((article, index) => {
        this.data.push({
          id: '' + index,
          description: article.ArticleName,
          inside: article.InsideW.toString(),
          outside: article.OutsideW.toString(),
          distBetweenIsoBars: article.DistBetweenIsoBars,
          depth: article.Depth,
          disabled: false,
          bpsTable4CustomRow: false
        });
      });
    } else if (this.aseSystemType) {
      if(this.isPopoutOpenedForBottomOuterFrame) {
        data.filter(article => article.System == this.systemSelected.Value && article.SRS == 1 && article.ProfileType.includes("Outer Frame") && (article.ArticleName === '487850' || article.ArticleName === '487860') ).forEach((article, index) => {
          this.data.push({
            id: '' + index,
            description: article.ArticleName,
            inside: article.InsideW.toString(),
            outside: article.OutsideW.toString(),
            distBetweenIsoBars: article.DistBetweenIsoBars,
            depth: article.Depth,
            disabled: false,
            bpsTable4CustomRow: false
          });
        });

      } else {
        data.filter(article => article.System == this.systemSelected.Value && article.SRS == 1 && article.ProfileType.includes("Outer Frame")&& article.ArticleName === '487850').forEach((article, index) => {
          this.data.push({
            id: '' + index,
            description: article.ArticleName,
            inside: article.InsideW.toString(),
            outside: article.OutsideW.toString(),
            distBetweenIsoBars: article.DistBetweenIsoBars,
            depth: article.Depth,
            disabled: false,
            bpsTable4CustomRow: false
          });
        });
        
      }
     
    }
    else {
      data.forEach((article, index) => {
        this.data.push({
          id: '' + index,
          description: article.Name.substr(9),
          inside: article.InsideDimension.toString(),
          outside: article.OutsideDimension.toString(),
          distBetweenIsoBars: article.DistBetweenIsoBars,
          depth: article.Depth,
          disabled: false,
          bpsTable4CustomRow: false
        });
      });
    }
    this.listOfDisplayData = [...this.data];
    this.getSelectedIndex();
  }

  getSelectedIndexAfterSearch() {
    let savedData = this.isPopoutOpenedForBottomOuterFrame ? this.umService.obj_BottomOuterFrameSliding():this.umService.obj_OuterFrame();
    if (savedData) {
      this.selectedIndex = this.listOfDisplayData.map(article => article.description).indexOf(savedData.ArticleName);
    }
    setTimeout(() => {
      if (this.selectedIndex > -1 && this.tableComponent) this.tableComponent.selectRow(this.listOfDisplayData[this.selectedIndex]);
    }, 100);
  }

  getSelectedIndex() {
    let savedData = this.isPopoutOpenedForBottomOuterFrame ? this.umService.obj_BottomOuterFrameSliding():this.umService.obj_OuterFrame();
    this.selectedIndex = 0;
    if (savedData) {
      this.selectedIndex = this.listOfDisplayData.map(article => article.description).indexOf(savedData.ArticleName);
    }
    if (this.selectedIndex < 0)
      this.selectedIndex = 0;

    if (this.unified3DModel.ProblemSetting.ProductType != "SlidingDoor") {
      let os = this.unified3DModel.ModelInput.Geometry.OperabilitySystems;
      if (os && os.filter(glass => (glass.InsertOuterFrameArticleName === null || glass.InsertOuterFrameArticleName == undefined) && glass.InsertOuterFrameArticleName !== '-1').length > 0) {
        this.onConfirm();
      }
    }
  }
  //#endregion
  
  //#region events
  selectionChange($event) { }

  onClose(): void {
    if (this.tableComponent) { this.tableComponent.inputElement.nativeElement.value = ''; }
    this.searchValue = '';
    // this.search();
    if (this.isPopoutOpened) {
      if (this.isPopoutOpenedForBottomOuterFrame) {
        this.cpService.setPopout(false, PanelsModule.BottomOuterFrameSliding);
      }
      else {
        this.cpService.setPopout(false, PanelsModule.OuterFrame);
      }
    }
  }

  onclickRow(event) { //onSelectOuterFrameArticle
    this.selectedIndex = parseInt(event.id);
    if (this.selectedIndex < 0)
      this.selectedIndex = 0;
  }

  ondblclickRow(event) { //onDblClickRow
    this.tableComponent.selectRow(event);
    this.onConfirm();
  }

  onConfirm() {
    if (this.isPopoutOpenedForBottomOuterFrame) {   // Bottom Outer Frame for Sliding Door
      this.umService.set_BottomOuterFrame(this.listOfDisplayData[this.selectedIndex]);
    }
    else {
      this.cpService.closeAllPopouts();
      setTimeout(() => {
        this.umService.set_OuterFrame(this.listOfDisplayData[this.selectedIndex]);
      }, 200);
    }
    this.onClose();
  }
  //#endregion
}