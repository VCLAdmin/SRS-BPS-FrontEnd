import { Component, OnInit, Input, EventEmitter, Output, ViewChild, TemplateRef, ChangeDetectionStrategy, SimpleChanges, ElementRef, Renderer2, OnChanges, OnDestroy } from '@angular/core';
import { FramingService } from 'src/app/app-structural/services/framing.service';
import { BpsUnifiedModel } from 'src/app/app-common/models/bps-unified-model';
import { CeldType, BpsTableComponent } from 'bps-components-lib';
import { TranslateService } from '@ngx-translate/core';
import { _ } from '@biesbjerg/ngx-translate-extract/dist/utils/utils';
import { LocalStorageService } from 'src/app/app-core/services/local-storage.service';
import { UnifiedModelService } from 'src/app/app-structural/services/unified-model.service';
import { ConfigPanelsService } from 'src/app/app-structural/services/config-panels.service';
import { PanelsModule } from 'src/app/app-structural/models/panels/panels.module';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ConfigureService } from 'src/app/app-structural/services/configure.service';

@Component({
  selector: 'app-mullion-table',
  templateUrl: './mullion-table.component.html',
  styleUrls: ['./mullion-table.component.css']
})

export class MullionTableComponent implements OnInit, OnDestroy {
  unified3DModel: BpsUnifiedModel;
  @Output() openNewCustomEvent: EventEmitter<void> = new EventEmitter<void>();
  @Output() editCustomArticleEvent: EventEmitter<any> = new EventEmitter<any>();

  systemSelected: any;
  adsSystemType: boolean = false;

  //#region bpstable
  articleTitle: string;

  language: string;
  isMullionPopoutOpened: boolean = false;
  isTransomPopoutOpened: boolean = false;
  initialLength: number;
  selectedIndex: any;
  baseImageSrc = 'https://vcl-design-com.s3.amazonaws.com/StaticFiles/Images/article-jpeg/cross-section/';
  //defaultImageSrc = 'https://vcl-design-com.s3.amazonaws.com/StaticFiles/Images/article-jpeg/customArticle.svg';
  private destroy$ = new Subject<void>();
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
    private umService: UnifiedModelService,
    private configService: ConfigureService,
    private cpService: ConfigPanelsService,
    private framingService: FramingService,
    private translate: TranslateService) {
  }

  ngAfterViewInit() {
    this.getConfigGrid();
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
        if (response.panelsModule === PanelsModule.Mullion) { 
          this.isMullionPopoutOpened = response.isOpened;
          if (response.isOpened) {
            this.onPopoutOpened();
            this.getConfigGrid();
          }
        }
        else if (response.panelsModule === PanelsModule.Transom) {
          this.isTransomPopoutOpened = response.isOpened;
          if (response.isOpened) {
            this.onPopoutOpened();
            this.getConfigGrid();
          }         
        }
      });
  }

  ngOnInit(): void {
    this.language = this.configService.getLanguage();
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
          celdType: CeldType.TemplateRef,//CeldType.Default,
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
    } else {
      this.listOfDisplayData = data;
    }
  }
  //#endregion

  //#region build data
  onPopoutOpened() {
    if (!this.systemSelected) {
      this.systemSelected = this.cpService.currentSystem;
    }
    this.selectedIndex = 0;
    this.listOfDisplayData = [];
    this.data = [];
    this.collectData(this.systemSelected.Images);
  }
  collectData(system: string) {
    this.showSection = false;
    if (localStorage.getItem(system)) {
      if (system.includes("ads")) {
        this.adsSystemType = true;
      } else {
        this.adsSystemType = false;
      }
      this.fillData(localStorage.getItem(system));
    } else {
      if (system.includes("aws")) {
        this.framingService.getMullionFramesForSystem(system).pipe(takeUntil(this.destroy$)).subscribe(data => {
          this.adsSystemType = false;
          localStorage.setItem(system, data);
          this.fillData(data)
        });
      } else {
        this.framingService.getADSArticlesList("ADS").pipe(takeUntil(this.destroy$)).subscribe(data => {
          this.adsSystemType = true;
          localStorage.setItem(system, data);
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
        data = data.filter(x => x.Type === 'MullionTransom')
      } else {
        let arr = ["article__368650", "article__368660", "article__382280"]
        data = data.filter(x => arr.includes(x.Name)); // filtering out articles meant only for SRS aws.
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
    if (this.unified3DModel.ModelInput.Geometry.Sections) {
      var secOne = this.unified3DModel.ModelInput.Geometry.Sections[1];
      var secTwo = this.unified3DModel.ModelInput.Geometry.Sections[2];
      if (secOne.isCustomProfile) {
        secOne.Name = "Transom " + secOne.ArticleName;
        secOne.Description = secOne.ArticleName;
        secOne.InsideDimension = secOne.InsideW;
        secOne.OutsideDimension = secOne.OutsideW;
        secOne.Depth = secOne.Depth;
        data.push(secOne);
      }
      if (secTwo.isCustomProfile) {
        if (!(secOne.A2 === secTwo.A2 && secOne.Ao === secTwo.Ao && secOne.ArticleName === secTwo.ArticleName && secOne.Au === secTwo.Au && secOne.Cn20 === secTwo.Cn20 && secOne.Cp20 === secTwo.Cp20 &&
          secOne.Cp80 === secTwo.Cp80 && secOne.DistBetweenIsoBars === secTwo.DistBetweenIsoBars && secOne.E === secTwo.E && secOne.InsideW === secTwo.InsideW && secOne.Io === secTwo.Io &&
          secOne.Ioyy === secTwo.Ioyy && secOne.Iu === secTwo.Iu && secOne.Iuyy === secTwo.Iuyy && secOne.LeftRebate === secTwo.LeftRebate && secOne.OutsideW === secTwo.OutsideW && secOne.RSn20 === secTwo.RSn20 &&
          secOne.RSp80 === secTwo.RSp80 && secOne.RTn20 === secTwo.RTn20 && secOne.RTp80 === secTwo.RTp80 && secOne.RightRebate === secTwo.RightRebate &&
          secOne.Weight === secTwo.Weight && secOne.Zol === secTwo.Zol && secOne.Zoo === secTwo.Zoo && secOne.Zor === secTwo.Zor && secOne.Zou === secTwo.Zou && secOne.Zul === secTwo.Zul && secOne.Zuo === secTwo.Zuo &&
          secOne.Zur === secTwo.Zur && secOne.Zuu === secTwo.Zuu && secOne.alpha === secTwo.alpha && secOne.beta === secTwo.beta && secOne.d === secTwo.d)) {
          secTwo.Name = "Transom " + secTwo.ArticleName;
          secTwo.Description = secTwo.ArticleName;
          secTwo.InsideDimension = secTwo.InsideW;
          secTwo.OutsideDimension = secTwo.OutsideW;
          secTwo.Depth = secTwo.Depth;
          data.push(secTwo);
        }
      }
    }
    this.initialLength = data.length;
    this.data = [];
    
    if (this.adsSystemType) {
      data.forEach((article, index) => {
        this.data.push({
          id: '' + index,
          description: article.isCustomProfile ? article.Description : article.ArticleName,
          inside: article.InsideW.toString(),
          outside: {
            ref: this.outsideTemplate,
            context: {
              value: article.OutsideW.toString(),
              disabled: true,
              arrowHovered: true,
              index: index
            }
          },
          data: article,
          disabled: false,
          bpsTable4CustomRow: article.isCustomProfile ? false : article.isCustomProfile
        });
      });
    } else {
      data.forEach((article, index) => {
        this.data.push({
          id: '' + index,
          description: article.isCustomProfile ? article.Description : article.Description.substr(8),
          inside: article.InsideDimension.toString(),
          outside: {
            ref: this.outsideTemplate,
            context: {
              value: article.OutsideDimension.toString(),
              disabled: true,
              arrowHovered: true,
              index: index
            }
          },
          data: article,
          disabled: false,
          bpsTable4CustomRow: article.isCustomProfile ? false : article.isCustomProfile
        });
      });
    }
    this.listOfDisplayData = [...this.data];
    this.getSelectedIndex();
  }

  getSelectedIndex() {
    let savedData;
    if (this.isMullionPopoutOpened) savedData = this.umService.obj_Mullion();
    if (this.isTransomPopoutOpened) savedData = this.umService.obj_Transom();
    this.selectedIndex = 0;
    if (savedData) {
      this.selectedIndex = this.listOfDisplayData.map(article => article.description).indexOf(savedData.ArticleName);
    }
    if (this.selectedIndex < 0)
      this.selectedIndex = 0;
    let sec = this.unified3DModel.ModelInput.Geometry.Sections;
    if (this.isMullionPopoutOpened && sec && sec.filter(glass => glass.SectionID == 2 && glass.Depth == '0').length > 0) {
      this.onConfirm();
    }
    if (this.isTransomPopoutOpened && sec && sec.filter(glass => glass.SectionID == 3 && glass.Depth == '0').length > 0) {
      this.onConfirm();
    }
  }
  //#endregion

  //#region events
  selectionChange($event) { }

  onClose(): void {
    if (this.tableComponent) { this.tableComponent.inputElement.nativeElement.value = ''; }
    this.searchValue = '';
    this.search();
    if (this.isMullionPopoutOpened) this.cpService.setPopout(false, PanelsModule.Mullion);
    if (this.isTransomPopoutOpened) this.cpService.setPopout(false, PanelsModule.Transom);
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
    if (this.isMullionPopoutOpened && this.listOfDisplayData.length > 0) {
      if (!this.listOfDisplayData[this.selectedIndex].isCustomProfile)
        this.umService.set_Mullion({ article: this.listOfDisplayData[this.selectedIndex], isCustomed: false });
      else
        this.umService.set_Mullion({ article: this.listOfDisplayData[this.selectedIndex], isCustomed: this.listOfDisplayData[this.selectedIndex].isCustomProfile });
    }
    else if (this.listOfDisplayData.length > 0){
      if (!this.listOfDisplayData[this.selectedIndex].isCustomProfile)
        this.umService.set_Transom({ article: this.listOfDisplayData[this.selectedIndex], isCustomed: false });
      else
        this.umService.set_Transom({ article: this.listOfDisplayData[this.selectedIndex], isCustomed: this.listOfDisplayData[this.selectedIndex].isCustomProfile });
    }
    this.onClose();
  }
  //#endregion

  onOpenCustom(): void {
    this.openNewCustomEvent.emit();
  }

  onEditCustom(index: number): void {
    this.editCustomArticleEvent.emit({ article: this.listOfDisplayData[index], index: index });
  }

  deleteArticle(articleIndex) {
    this.listOfDisplayData.splice(articleIndex, 1);
    this.selectedIndex = Math.min(this.selectedIndex, this.listOfDisplayData.length - 1);
    if (this.selectedIndex < 0) {
      this.selectedIndex = 0;
    }
    this.selectedIndex = Math.min(this.selectedIndex, this.listOfDisplayData.length - 1);
    if (this.selectedIndex < 0) {
      this.selectedIndex = 0;
    }
    this.listOfDisplayData.splice(articleIndex, 1);
    this.data.splice(articleIndex, 1);
    this.listOfDisplayData = [...this.data];
  }

  addMullionTransomArticle(sectionElement) {
    this.listOfDisplayData.push(sectionElement);
    let index = this.data.length;
    this.data.push({
      id: '' + index,
      description: sectionElement.ArticleName,
      inside: sectionElement.InsideW,
      outside: {
        ref: this.outsideTemplate,
        context: {
          value: sectionElement.OutsideW,
          disabled: false,
          arrowHovered: true,
          index: index
        }
      },
      disabled: false,
      bpsTable4CustomRow: sectionElement.isCustomProfile
    });
    this.listOfDisplayData = [...this.data];
    setTimeout(() => {
      this.tableComponent.selectRow(this.listOfDisplayData[index]);
    });
  }

  updateMullionTransomArticle(data) {
    let index = data.index;
    let property = data.sectionElement;
    this.listOfDisplayData[index] = property;
  }
}
