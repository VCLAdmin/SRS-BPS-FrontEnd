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
  selector: 'app-profile-color',
  templateUrl: './profile-color.component.html',
  styleUrls: ['./profile-color.component.css']
})
export class ProfileColorComponent implements OnInit, OnDestroy, AfterViewInit {
  unified3DModel: BpsUnifiedModel;

  systemSelected: any;
  adsSystemType: boolean = false;
  profileColorData: any[];
  //#region bpstable
  isPopoutOpened: boolean = false;
  baseImageSrc = 'https://vcl-design-com.s3.amazonaws.com/StaticFiles/Images/colors/';
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
    this.profileColorData = this.cpService.buildProfileColorList();
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
        if (this.unified3DModel !== undefined && response.panelsModule === PanelsModule.ProfileColor) {
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
          width: '195px',
          showSort: true
        },
        {
          celdType: CeldType.Default,
          property: 'inside',
          width: '1px',
          showSort: false
        },
        {
          celdType: CeldType.Default,//CeldType.TemplateRef,
          property: 'outside',
          width: '1px',
          showSort: false
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
    this.collectData();
  }

  collectData() {
    this.showSection = false;
    this.fillData(this.profileColorData);    
  }

  fillData(data: any) {    
    this.getTableData(data);
    this.showSection = true;
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
    data.forEach((article, index) => {
      this.data.push({
        id: '' + index,
        description: article.Description,
        // inside: article.InsideW.toString(),
        // outside: article.OutsideW.toString(),
        // distBetweenIsoBars: article.DistBetweenIsoBars,

        image: article.Image,
        value: article.Value.toString(),
        depth: article.Depth,
        disabled: false,
        bpsTable4CustomRow: false
      });
    });
    this.listOfDisplayData = [...this.data];
    this.getSelectedIndex();
  }

  getSelectedIndexAfterSearch() {
    let savedData = this.umService.obj_ProfileColor();
    if (savedData) {
      this.selectedIndex = this.listOfDisplayData.map(article => article.description).indexOf(savedData);
    }
    setTimeout(() => {
      if (this.selectedIndex > -1 && this.tableComponent) this.tableComponent.selectRow(this.listOfDisplayData[this.selectedIndex]);
    }, 100);
  }

  getSelectedIndex() {
    let savedData = this.umService.obj_ProfileColor();
    this.selectedIndex = 0;
    if (savedData) {
      this.selectedIndex = this.listOfDisplayData.map(article => article.description).indexOf(savedData);
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
    if (this.isPopoutOpened) this.cpService.setPopout(false, PanelsModule.ProfileColor);
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
    this.umService.set_ProfileColor(this.listOfDisplayData[this.selectedIndex]);
    this.onClose();
  }
  //#endregion
}