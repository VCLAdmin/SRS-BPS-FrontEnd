import { Component, OnInit, Input, EventEmitter, ViewChild, TemplateRef, SimpleChanges, OnChanges, OnDestroy, AfterViewInit } from '@angular/core';
import { FramingService } from 'src/app/app-structural/services/framing.service';
import { CeldType, BpsTableComponent } from 'bps-components-lib';
import { TranslateService } from '@ngx-translate/core';
import { _ } from '@biesbjerg/ngx-translate-extract/dist/utils/utils';
import { BpsUnifiedModel } from 'src/app/app-common/models/bps-unified-model';
import { ConfigureService } from 'src/app/app-structural/services/configure.service';
import { UnifiedModelService } from 'src/app/app-structural/services/unified-model.service';
import { ConfigPanelsService } from 'src/app/app-structural/services/config-panels.service';
import { PanelsModule } from 'src/app/app-structural/models/panels/panels.module';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { debugOutputAstAsTypeScript } from '@angular/compiler';

@Component({
  selector: 'app-vent-table',
  templateUrl: './vent-table.component.html',
  styleUrls: ['./vent-table.component.css']
})

export class VentTableComponent implements OnInit, OnDestroy, AfterViewInit {
  unified3DModel: BpsUnifiedModel;

  systemSelected: any;
  adsSystemType: boolean = false;
  aseSystemType: boolean = false;


  //#region bpstable
  isPopoutOpened: boolean = false;
  baseImageSrc = 'https://vcl-design-com.s3.amazonaws.com/StaticFiles/Images/article-jpeg/cross-section/';
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
        if (this.unified3DModel !== undefined && response.panelsModule === PanelsModule.VentFrame) {
          if (response.isOpened) {
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
      if (localStorage.getItem('vent_' + system)) {
        this.fillData(localStorage.getItem('vent_' + system));
      } else {
        this.fService.getVentFramesForSystem(system).pipe(takeUntil(this.destroy$)).subscribe(data => {
          localStorage.setItem('vent_' + system, data);
          this.fillData(data);
        });
      }
    }
    else if (system.includes("ads")) {
      this.adsSystemType = true;
      this.aseSystemType = false;
      if (localStorage.getItem('vent_' + system)) {
        this.fillData(localStorage.getItem('vent_' + system));
      } else {
        this.fService.getADSArticlesList(system).pipe(takeUntil(this.destroy$)).subscribe(data => {
          localStorage.setItem('vent_' + system, data);
          this.fillData(data);
        });
      }
    }
    else if (system.includes("ase")) {
      this.adsSystemType = false;
      this.aseSystemType = true;
      if (localStorage.getItem('vent_' + system)) {
        this.fillData(localStorage.getItem('vent_' + system));
      } else {
        this.fService.getASEArticlesList(system).pipe(takeUntil(this.destroy$)).subscribe(data => {
          localStorage.setItem('vent_' + system, data);
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
        data = data.filter(x => x.Type == "VentFrame");
      }
      else if (this.aseSystemType){

      } 
      else {
        data = data.filter(x => x.Name == "article__466470"); // filtering out articles meant only for SRS aws.
      }
    }
    
    this.getTableData(data);
    setTimeout(() => {
      if (this.tableComponent && this.listOfDisplayData[this.selectedIndex] !== undefined) {
        this.tableComponent.selectRow(this.listOfDisplayData[this.selectedIndex]);
        this.tableComponent.inputElement.nativeElement.value = '';
        this.searchValue = '';
        this.search();
      }
    }, 1);
  }

  getTableData(data: any[]) {
    this.data = [];
    let maxDepth = this.fService.getMaxDepth(this.unified3DModel);
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
    } 
    else if (this.aseSystemType) {
      data.filter(article => article.System == this.systemSelected.Value && article.SRS == 1 && article.ProfileType == "Vent Frame").forEach((article, index) => {
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
    let savedData: any;
    if (this.unified3DModel.ProblemSetting.ProductType=='SlidingDoor'){
      if (this.unified3DModel.ModelInput.Geometry.Sections && this.unified3DModel.ModelInput.Geometry.Sections.length > 0) {
        savedData = this.unified3DModel.ModelInput.Geometry.Sections.filter(f => f.SectionID == 43 && f.SectionType == 43)[0];
      }
      if (savedData) {
        this.selectedIndex = this.listOfDisplayData.map(article => article.description).indexOf(savedData.ArticleName);
      }
    }
    else {
      if (this.unified3DModel.ModelInput.Geometry.OperabilitySystems) {
        savedData = this.unified3DModel.ModelInput.Geometry.OperabilitySystems.filter(f => f.VentArticleName)[0];
      }
      if (savedData) {
        this.selectedIndex = this.listOfDisplayData.map(article => article.description).indexOf(savedData.VentArticleName);
      }
    }
    setTimeout(() => {
      if (this.selectedIndex > -1 && this.tableComponent) this.tableComponent.selectRow(this.listOfDisplayData[this.selectedIndex]);
    }, 100);
  }

  getSelectedIndex() {
    let savedData: any;
    this.selectedIndex = 0;
    if (this.unified3DModel.ProblemSetting.ProductType=='SlidingDoor'){
      if (this.unified3DModel.ModelInput.Geometry.Sections && this.unified3DModel.ModelInput.Geometry.Sections.length > 0) {
        savedData = this.unified3DModel.ModelInput.Geometry.Sections.filter(f => f.SectionID == 43 && f.SectionType == 43)[0];
      }
      if (savedData) {
        this.selectedIndex = this.listOfDisplayData.map(article => article.description).indexOf(savedData.ArticleName);
      }
      if (this.selectedIndex < 0)
        this.selectedIndex = 0;
    }
    else {
      if (this.unified3DModel.ModelInput.Geometry.OperabilitySystems) {
        savedData = this.unified3DModel.ModelInput.Geometry.OperabilitySystems.filter(f => f.VentArticleName)[0];
      }
      if (savedData) {
        this.selectedIndex = this.listOfDisplayData.map(article => article.description).indexOf(savedData.VentArticleName);
      }
      if (this.selectedIndex < 0)
        this.selectedIndex = 0;
      let os = this.unified3DModel.ModelInput.Geometry.OperabilitySystems;
      if (os && os.filter(glass => glass.VentArticleName == undefined && glass.VentArticleName !== '-1').length > 0) {
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
    if (this.isPopoutOpened) this.cpService.setPopout(false, PanelsModule.VentFrame);
  }

  onclickRow(event) { //onSelectVentFrameArticle
    this.selectedIndex = parseInt(event.id);
    if (this.selectedIndex < 0)
      this.selectedIndex = 0;
  }

  ondblclickRow(event) { //onDblClickRow
    this.tableComponent.selectRow(event);
    this.onConfirm();
  }

  onConfirm() {
    this.umService.set_VentFrame(this.listOfDisplayData[this.selectedIndex]);
    if (this.unified3DModel.ProblemSetting.ProductType=='SlidingDoor') {
      this.umService.set_InterlockFrame(this.listOfDisplayData[this.selectedIndex]);
    }
    this.onClose();
  }
  //#endregion
}