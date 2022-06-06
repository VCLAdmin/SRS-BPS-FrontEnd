import { AfterViewInit, Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { _ } from '@biesbjerg/ngx-translate-extract/dist/utils/utils';
import { TranslateService } from '@ngx-translate/core';
import { BpsTableComponent, CeldType } from 'bps-components-lib';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { BpsUnifiedModel } from 'src/app/app-common/models/bps-unified-model';
import { PanelsModule } from 'src/app/app-structural/models/panels/panels.module';
import { ConfigPanelsService } from 'src/app/app-structural/services/config-panels.service';
import { ConfigureService } from 'src/app/app-structural/services/configure.service';
import { FramingService } from 'src/app/app-structural/services/framing.service';
import { UnifiedModelService } from 'src/app/app-structural/services/unified-model.service';

@Component({
  selector: 'app-double-vent-table',
  templateUrl: './double-vent-table.component.html',
  styleUrls: ['./double-vent-table.component.css']
})
export class DoubleVentTableComponent implements OnInit, OnDestroy, AfterViewInit {
  unified3DModel: BpsUnifiedModel;

  systemSelected: any;

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
        if (this.unified3DModel !== undefined && response.panelsModule === PanelsModule.DoubleVentSliding) {
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
    if (this.unified3DModel.ProblemSetting.ProductType == "SlidingDoor") {
      this.collectData(this.systemSelected.Images);
    }
  }

  collectData(system: string) {
    this.showSection = false;
    if (system.includes("ase")) {
      if (localStorage.getItem('reinforcement_' + system)) {
        this.fillData(localStorage.getItem('reinforcement_' + system));
      } else {
        this.fService.getASEArticlesList(system).pipe(takeUntil(this.destroy$)).subscribe(data => {
          localStorage.setItem('reinforcement_' + system, data);
          this.fillData(data);
        });
      }
    }
  }

  fillData(dataList: any) {
    let data = JSON.parse(dataList);
    this.showSection = true;
    // if (this.configService.applicationType == "SRS") {
    //   if (this.adsSystemType) {
    //     data = data.filter(x => x.Type == "VentFrame");
    //   }
    //   else if (this.aseSystemType){

    //   } 
    //   else {
    //     data = data.filter(x => x.Name == "article__466470"); // filtering out articles meant only for SRS aws.
    //   }
    // }
    
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
    data.filter(article => article.System == this.systemSelected.Value && article.SRS == 1 && article.ProfileType == "Double-Vent Profile").forEach((article, index) => {
      this.data.push({
        id: '' + index,
        description: article.ArticleName,
        inside: article.InsideW.toString(),
        outside: article.OutsideW.toString(),
        disabled: false,
        bpsTable4CustomRow: false
      });
    });
    this.listOfDisplayData = [...this.data];
    this.getSelectedIndex();
  }

  getSelectedIndexAfterSearch() {
    let savedData: any;
    if (this.unified3DModel.ModelInput.Geometry.SlidingDoorSystems) {
      savedData = this.unified3DModel.ModelInput.Geometry.SlidingDoorSystems[0];
    }
    if (savedData) {
      this.selectedIndex = this.listOfDisplayData.map(article => article.description).indexOf(savedData.DoubleVentArticleName);
    }
    setTimeout(() => {
      if (this.selectedIndex > -1 && this.tableComponent) this.tableComponent.selectRow(this.listOfDisplayData[this.selectedIndex]);
    }, 100);
  }

  getSelectedIndex() {
    let savedData: any;
    this.selectedIndex = 0;
    if (this.unified3DModel.ModelInput.Geometry.SlidingDoorSystems) {
      savedData = this.unified3DModel.ModelInput.Geometry.SlidingDoorSystems[0];
    }
    if (savedData) {
      this.selectedIndex = this.listOfDisplayData.map(article => article.description).indexOf(savedData.DoubleVentArticleName);
    }
    if (this.selectedIndex < 0)
      this.selectedIndex = 0;
  }
  //#endregion
  
  //#region events
  selectionChange($event) { }

  onClose(): void {
    if (this.tableComponent) { this.tableComponent.inputElement.nativeElement.value = ''; }
    this.searchValue = '';
    this.search();
    if (this.isPopoutOpened) this.cpService.setPopout(false, PanelsModule.DoubleVentSliding);
  }

  onclickRow(event) { //onSelectInterlockArticle
    this.selectedIndex = parseInt(event.id);
    if (this.selectedIndex < 0)
      this.selectedIndex = 0;
  }

  ondblclickRow(event) { //onDblClickRow
    this.tableComponent.selectRow(event);
    this.onConfirm();
  }

  onConfirm() {
    this.umService.set_DoubleVentFrame(this.listOfDisplayData[this.selectedIndex]);
    this.onClose();
  }
  //#endregion
}
