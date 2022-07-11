import { Component, OnInit, Renderer2, ViewChild, TemplateRef, ElementRef, Input, Output, EventEmitter, OnDestroy, SimpleChanges } from '@angular/core';
import { FramingService } from 'src/app/app-structural/services/framing.service';
import { TranslateService } from '@ngx-translate/core';
import { LocalStorageService } from 'src/app/app-core/services/local-storage.service';
import { BpsTableComponent, CeldType } from 'bps-components-lib';
import { BpsUnifiedModel } from 'src/app/app-common/models/bps-unified-model';
import { _ } from '@biesbjerg/ngx-translate-extract/dist/utils/utils';
import { Subject, Subscription } from 'rxjs';
import { NzModalService } from 'ng-zorro-antd';
import { ConfigPanelsService } from 'src/app/app-structural/services/config-panels.service';
import { PanelsModule } from 'src/app/app-structural/models/panels/panels.module';
import { ConfigureService } from 'src/app/app-structural/services/configure.service';
import { UnifiedModelService } from 'src/app/app-structural/services/unified-model.service';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-mullion-depth-table',
  templateUrl: './mullion-depth-table.component.html',
  styleUrls: ['./mullion-depth-table.component.css']
})
export class MullionDepthTableComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  isMullionPopoutOpened: boolean = false;
  isTransomPopoutOpened: boolean = false;
  isIntermediateMullionPopoutOpened: boolean = false;
  isIntermediateTransomPopoutOpened: boolean = false;
  isUDCFramingPopoutOpened: boolean = false;
  isReinforcementPopoutOpened: boolean = false;

  initialLengthMullion: number;
  initialLengthTransom: number;
  initialLengthIntermediateMullion: number;
  initialLengthIntermediateTransom: number;
  initialLengthUDCFraming: number;


  mullionData = [];
  reinforcementData = [];
  transomData = [];
  intermediateMullionData = [];
  intermediateTransomData = [];
  UDCFramingData = [];

  selectedMullionArticle: number = 0;
  selectedReinforcementMullionArticle: number = 0;
  selectedTransomArticle: number = 0;
  selectedIntermediateMullionArticle: number = 0;
  selectedIntermediateTransomArticle: number = 0;
  selectedUDCFramingArticle: number = 0;

  articleTitle: string;
  marginTopTable: string = '2px';
  currentArticleToMullionDepthTable: any;
  currentArticleToTransomDepthTable: any;
  currentArticleToIntermediateMullionDepthTable: any;
  currentArticleToIntermediateTransomDepthTable: any;
  currentArticleToUDCFramingDepthTable: any;
  currentArticleToReinforcementMullionTable: any;
  
  @Input() unified3DModel: BpsUnifiedModel;
  @Input() event3D: any;
  @Input() systemFacadeSelectedFromFraming: string;
  

  @Output() openNewCustomEvent: EventEmitter<void> = new EventEmitter<void>();
  @Output() editCustomArticleEvent: EventEmitter<any> = new EventEmitter<any>();

  configurationCustomGrid: any;

  listOfDisplayDataInTable = [];
  listOfDisplayDataInTable_mullionDepth = [];
  listOfDisplayDataInTable_transomDepth = [];
  listOfDisplayDataInTable_intermediateMullionDepth = [];
  listOfDisplayDataInTable_intermediateTransomDepth = [];
  listOfDisplayDataInTable_UDCFramingDepth = [];
  listOfDisplayDataInTable_reinforcement = [];

  dataToShowInTable = [];
  sortDataToShowInTable = [];
  sortName: string | null = null;
  sortValue: string | null = null;
  searchValue = '';
  arrow_hovered = false;
  searchByDimensionText: string = '';
  @ViewChild('column2Template', { read: TemplateRef, static: true }) column2Template: TemplateRef<{}>;
  @ViewChild('uValueTemplate', { read: TemplateRef, static: true }) uValueTemplate: TemplateRef<{}>;
  @ViewChild('column2ArrowTemplate', { read: TemplateRef, static: true }) column2ArrowTemplate: TemplateRef<{}>;
  @ViewChild('divtable') divOftable: ElementRef;
  tableComponent: BpsTableComponent;
  language: string;

  @ViewChild('bpsMullionTransomTable', { read: BpsTableComponent, static: false }) set content(content: BpsTableComponent) {
    if (content) {
      this.tableComponent = content;
      this.buildTableComponentDataList();
    }
  }
  constructor(private umService: UnifiedModelService, private configureService: ConfigureService, private cpService: ConfigPanelsService, private render: Renderer2, private framingService: FramingService, private translate: TranslateService, private localStorageService: LocalStorageService, private modalService: NzModalService) { }

  preventDefault($event: Event, index) {
    $event.preventDefault();
    $event.stopImmediatePropagation();
    this.onEditCustom(index);
  }


  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  
  }

  ngOnInit(): void {
    this.language = this.configureService.getLanguage();
    /*this.unified3DModel = this.umService.current_UnifiedModel;*/
    /*this.onUnifiedModelUpdated();*/
    
    /*this.umService.obsUnifiedModel.subscribe(
      response => {
        if (response) {
          this.unified3DModel = response;
          this.onUnifiedModelUpdated();
        }
      });*/
    this.cpService.obsPopout.pipe(takeUntil(this.destroy$)).subscribe(
      response => {
        if (response.panelsModule === PanelsModule.MullionFacade) {
          this.isMullionPopoutOpened = response.isOpened;
          if (response.isOpened) this.onOpenCloseMullionDepthPopout();
          else if (!this.isMullionPopoutOpened) this.onCloseLeftPopout();
        }
        else if (response.panelsModule === PanelsModule.TransomFacade) {
          this.isTransomPopoutOpened = response.isOpened;
          if (response.isOpened) this.onOpenCloseTransomDepthPopout();
          else if (!this.isTransomPopoutOpened)  this.onCloseLeftPopout();
        }
        else if (response.panelsModule === PanelsModule.ReinforcementFacade) {
          this.isReinforcementPopoutOpened = response.isOpened;
          if (response.isOpened) this.onOpenCloseReinforcementFacadesPopout();
          else if (!this.isReinforcementPopoutOpened)  this.onCloseLeftPopout();
        }
        else if (response.panelsModule === PanelsModule.IntermediateMullionFacade) {
          this.isIntermediateMullionPopoutOpened = response.isOpened;
          if (response.isOpened) this.onOpenCloseIntermediateMullionDepthPopout();
          else if (!this.isIntermediateMullionPopoutOpened)  this.onCloseLeftPopout();
        }
        else if (response.panelsModule === PanelsModule.IntermediateTransomFacade) {
          this.isIntermediateTransomPopoutOpened = response.isOpened;
          if (response.isOpened) this.onOpenCloseIntermediateTransomDepthPopout();
          else if (!this.isIntermediateTransomPopoutOpened)  this.onCloseLeftPopout();
        }
        else if (response.panelsModule === PanelsModule.UDCFraming) {
          this.isUDCFramingPopoutOpened = response.isOpened;
          if (response.isOpened) this.onOpenCloseUDCFramingPopout();
          else if (!this.isUDCFramingPopoutOpened)  this.onCloseLeftPopout();
        }
      });

    this.cpService.obsCurrent.pipe(takeUntil(this.destroy$)).subscribe(
      response => {
        if (response.panelsModule === PanelsModule.MullionFacade) { this.updateCurrentValue_MullionFacade(response.data); }
        if (response.panelsModule === PanelsModule.TransomFacade) { this.updateCurrentValue_TransomFacade(response.data); }
        if (response.panelsModule === PanelsModule.IntermediateMullionFacade) { this.updateCurrentValue_IntermediateMullionFacade(response.data); }
        if (response.panelsModule === PanelsModule.IntermediateTransomFacade) { this.updateCurrentValue_IntermediateTransomFacade(response.data); }
        if (response.panelsModule === PanelsModule.UDCFramingFacade) { this.updateCurrentValue_UDCFramingFacade(response.data); }
        if (response.panelsModule === PanelsModule.ReinforcementFacade) { this.updateCurrentValue_ReinforcementFacade(response.data); }
      });
    this.cpService.obsSystem.pipe(takeUntil(this.destroy$)).subscribe(
      response => {
        if (this.unified3DModel && this.unified3DModel.ProblemSetting.FacadeType == 'mullion-transom') {
          this.collectMullionDepthData(response.data.Images);
        }
        else if (this.unified3DModel && this.unified3DModel.ProblemSetting.FacadeType == 'UDC') {
          this.collectUDCFramingFacadData(response.data.Images, null);
        }
      });
    
    this.searchByDimensionText = this.translate.instant(_('configure.mullion-depth-search-by-article'));
    if (this.unified3DModel && this.unified3DModel.ProblemSetting.FacadeType === 'UDC')
      this.setConfigurationCustomGrid(true);
    else
      this.setConfigurationCustomGrid(false);
  }

  updateCurrentValue_MullionFacade(data: any) { this.currentArticleToMullionDepthTable = data;}
  updateCurrentValue_TransomFacade(data: any) { this.currentArticleToTransomDepthTable = data;}
  updateCurrentValue_IntermediateMullionFacade(data: any) { this.currentArticleToIntermediateMullionDepthTable = data;}
  updateCurrentValue_IntermediateTransomFacade(data: any) { this.currentArticleToIntermediateTransomDepthTable = data;}
  updateCurrentValue_UDCFramingFacade(data: any) { this.currentArticleToUDCFramingDepthTable = data; }
  updateCurrentValue_ReinforcementFacade(data: any) { this.currentArticleToReinforcementMullionTable = data; }
  
  // onUnifiedModelUpdated() { }
  onHover(index, value) {
    if (this.listOfDisplayDataInTable[index].outside)
      this.listOfDisplayDataInTable[index].outside.context.arrowHovered = value;
    else
      this.listOfDisplayDataInTable[index].column2.context.arrowHovered = value;
  }

  log(event) {
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
      return item.description.toLowerCase().indexOf(this.searchValue.toLowerCase()) !== -1;
    };
    this.sortDataToShowInTable = [];
    if (this.isMullionPopoutOpened) {
      this.sortDataToShowInTable = this.listOfDisplayDataInTable_mullionDepth.filter((item: { description: string; uValue: string; rw: string }) => filterFunc(item));
    }
    if (this.isTransomPopoutOpened) {
      this.sortDataToShowInTable = this.listOfDisplayDataInTable_transomDepth.filter((item: { description: string; uValue: string; rw: string }) => filterFunc(item));
    }
    if (this.isIntermediateMullionPopoutOpened) {
      this.sortDataToShowInTable = this.listOfDisplayDataInTable_intermediateMullionDepth.filter((item: { description: string; uValue: string; rw: string }) => filterFunc(item));
    }
    if (this.isIntermediateTransomPopoutOpened) {
      this.sortDataToShowInTable = this.listOfDisplayDataInTable_intermediateTransomDepth.filter((item: { description: string; uValue: string; rw: string }) => filterFunc(item));
    }
    if (this.isUDCFramingPopoutOpened) {
      this.sortDataToShowInTable = this.listOfDisplayDataInTable_UDCFramingDepth.filter((item: { description: string; uValue: string; rw: string }) => filterFunc(item));
    }
    if (this.isReinforcementPopoutOpened) {
      this.sortDataToShowInTable = this.listOfDisplayDataInTable_reinforcement.filter((item: { description: string; uValue: string; rw: string }) => filterFunc(item));
    }
    if (this.sortDataToShowInTable && this.sortDataToShowInTable.length == 1 && this.tableComponent) {
      this.tableComponent.selectRow(this.sortDataToShowInTable[0]);
    }
    if (this.sortName && this.sortValue) {
      this.listOfDisplayDataInTable = this.sortDataToShowInTable.sort((a, b) =>
        this.sortValue === 'ascend'
          ? a[this.sortName!] > b[this.sortName!]
            ? 1
            : -1
          : b[this.sortName!] > a[this.sortName!]
            ? 1
            : -1
      );
      this.listOfDisplayDataInTable = [...this.listOfDisplayDataInTable];
    } else {
      this.listOfDisplayDataInTable = this.sortDataToShowInTable;
    }
  }

  onCloseLeftPopout(): void {
    if (this.tableComponent) {
      this.tableComponent.inputElement.nativeElement.value = '';
    }
    this.searchValue = '';
    // this.search();
    if (this.isMullionPopoutOpened) this.cpService.setPopout(false, PanelsModule.MullionFacade);
    if (this.isTransomPopoutOpened) this.cpService.setPopout(false, PanelsModule.TransomFacade);
    if (this.isIntermediateMullionPopoutOpened) this.cpService.setPopout(false, PanelsModule.IntermediateMullionFacade);
    if (this.isIntermediateTransomPopoutOpened) this.cpService.setPopout(false, PanelsModule.IntermediateTransomFacade);
    if (this.isUDCFramingPopoutOpened) this.cpService.setPopout(false, PanelsModule.UDCFraming);
    if (this.isReinforcementPopoutOpened) this.cpService.setPopout(false, PanelsModule.ReinforcementFacade);
  }

  onSelectArticle(event: any): void {
    if (this.isMullionPopoutOpened) {
      this.selectedMullionArticle = parseInt(event.id);
      if (this.selectedMullionArticle < 0) {
        this.selectedMullionArticle = 0;
      }
      this.articleTitle = this.selectedMullionArticle < this.initialLengthMullion ? this.mullionData[this.selectedMullionArticle].mullionArticleId : this.mullionData[this.selectedMullionArticle].CustomArticleName;
    }
    else if (this.isTransomPopoutOpened) {
      this.selectedTransomArticle = parseInt(event.id);
      if (this.selectedTransomArticle < 0) {
        this.selectedTransomArticle = 0;
      }
      this.articleTitle = this.selectedTransomArticle < this.initialLengthTransom ? this.transomData[this.selectedTransomArticle].transomArticleId : this.transomData[this.selectedTransomArticle].CustomArticleName;
    }
    else if (this.isIntermediateMullionPopoutOpened) {
      this.selectedIntermediateMullionArticle = parseInt(event.id);
      if (this.selectedIntermediateMullionArticle < 0) {
        this.selectedIntermediateMullionArticle = 0;
      }
      this.articleTitle = this.selectedIntermediateMullionArticle < this.initialLengthIntermediateMullion ? this.intermediateMullionData[this.selectedIntermediateMullionArticle].transomArticleId : this.intermediateMullionData[this.selectedIntermediateMullionArticle].CustomArticleName;
    }
    else if (this.isIntermediateTransomPopoutOpened) {
      this.selectedIntermediateTransomArticle = parseInt(event.id);
      if (this.selectedIntermediateTransomArticle < 0) {
        this.selectedIntermediateTransomArticle = 0;
      }
      this.articleTitle = this.selectedIntermediateTransomArticle < this.initialLengthIntermediateTransom ? this.intermediateTransomData[this.selectedIntermediateTransomArticle].transomArticleId : this.intermediateTransomData[this.selectedIntermediateTransomArticle].CustomArticleName;
    }
    else if (this.isUDCFramingPopoutOpened) {
      this.selectedUDCFramingArticle = parseInt(event.id);
      if (this.selectedUDCFramingArticle < 0) {
        this.selectedUDCFramingArticle = 0;
      }
      this.articleTitle = this.selectedUDCFramingArticle < this.initialLengthUDCFraming ? this.UDCFramingData[this.selectedUDCFramingArticle].transomArticleId : this.UDCFramingData[this.selectedUDCFramingArticle].CustomArticleName;
    }
    else if (this.isReinforcementPopoutOpened) {
      this.selectedReinforcementMullionArticle = parseInt(event.id);
      if (this.selectedReinforcementMullionArticle < 0) {
        this.selectedReinforcementMullionArticle = 0;
      }
      this.articleTitle = this.selectedReinforcementMullionArticle >= 0 ? this.reinforcementData[this.selectedReinforcementMullionArticle].value : this.reinforcementData[this.selectedReinforcementMullionArticle].value;
    }
  }

  CheckDepth() {
    let mullionDepth = this.intermediateMullionData[this.selectedIntermediateMullionArticle].transomDepth;
    let transomDepth = this.intermediateTransomData[this.selectedIntermediateTransomArticle].transomDepth;
    if (transomDepth != mullionDepth) {
      this.modalService.confirm({
        nzWrapClassName: "vertical-center-modal",
        nzWidth: '490px',
        nzTitle: '',
        nzContent: 'Vertical and Horizontal Glazing Bars are of different depths!',
        nzCancelText: null,
        nzOnCancel: () => null,
        nzOkText: 'Ok',
      });
    }
  }

  onConfirmMullionArticle(): void {
    if (this.isMullionPopoutOpened) {
      this.collectTransomDepthData(this.systemFacadeSelectedFromFraming, this.mullionData[this.selectedMullionArticle].mullionArticleId.toString());
      this.collectMullionReinforcementData(this.mullionData[this.selectedMullionArticle].mullionArticleId.toString());
      setTimeout(() => {
        this.collectIntermediateMullionDepthData(this.systemFacadeSelectedFromFraming, this.mullionData[this.selectedMullionArticle].mullionArticleId.toString(), this.transomData[this.selectedTransomArticle].transomDepth.toString());
      }, 500);
      this.cpService.setConfirm({ article: this.mullionData[this.selectedMullionArticle], isCustomed: false }, PanelsModule.MullionFacade);
      this.onCloseLeftPopout();
    }
    else if (this.isTransomPopoutOpened) {
      this.cpService.setConfirm({ article: this.transomData[this.selectedTransomArticle], isCustomed: false }, PanelsModule.TransomFacade);
      this.collectIntermediateMullionDepthData(this.systemFacadeSelectedFromFraming, this.mullionData[this.selectedMullionArticle].mullionArticleId.toString(), this.transomData[this.selectedTransomArticle].transomDepth.toString());
      //this.collectIntermediateTransomDepthData(this.systemFacadeSelectedFromFraming, this.transomData[this.selectedTransomArticle].transomArticleId.toString());
      this.onCloseLeftPopout();
    }
    else if (this.isIntermediateMullionPopoutOpened) {
      if (this.unified3DModel.ProblemSetting.FacadeType == 'UDC') {
        this.CheckDepth();
        this.currentArticleToIntermediateMullionDepthTable = { ArticleID: this.intermediateMullionData[this.selectedIntermediateMullionArticle].transomArticleId.toString() };
        if (!this.intermediateMullionData[this.selectedIntermediateMullionArticle].isCustomProfile) {
          this.cpService.setConfirm({ article: this.intermediateMullionData[this.selectedIntermediateMullionArticle], isCustomed: false }, PanelsModule.IntermediateMullionFacade);
          //if (this.intermediateMullionData[this.selectedIntermediateMullionArticle].transomDepth < this.intermediateTransomData[this.selectedIntermediateTransomArticle].transomDepth)
          setTimeout(() => {
            this.collectIntermediateTransomDepthData(this.systemFacadeSelectedFromFraming, this.UDCFramingData[this.selectedUDCFramingArticle].transomArticleId.toString());
          }, 100);
        }
        else
          this.cpService.setConfirm({ article: this.intermediateMullionData[this.selectedIntermediateMullionArticle], isCustomed: this.intermediateMullionData[this.selectedIntermediateMullionArticle].isCustomProfile }, PanelsModule.IntermediateMullionFacade);
      }
      else {
        this.cpService.setConfirm({ article: this.intermediateMullionData[this.selectedIntermediateMullionArticle], isCustomed: false }, PanelsModule.IntermediateMullionFacade);
      }
      this.onCloseLeftPopout();
    }
    else if (this.isIntermediateTransomPopoutOpened) {
      if (this.unified3DModel.ProblemSetting.FacadeType == 'UDC') this.CheckDepth();
      this.currentArticleToIntermediateTransomDepthTable = { ArticleID: this.intermediateTransomData[this.selectedIntermediateTransomArticle].transomArticleId.toString() };
      if (!this.intermediateTransomData[this.selectedIntermediateTransomArticle].isCustomProfile)
      this.cpService.setConfirm({ article: this.intermediateTransomData[this.selectedIntermediateTransomArticle], isCustomed: false }, PanelsModule.IntermediateTransomFacade);
      else
      this.cpService.setConfirm({ article: this.intermediateTransomData[this.selectedIntermediateTransomArticle], isCustomed: this.intermediateTransomData[this.selectedIntermediateTransomArticle].isCustomProfile }, PanelsModule.IntermediateTransomFacade);
      this.onCloseLeftPopout();
    }
    else if (this.isUDCFramingPopoutOpened) {
      if (!this.UDCFramingData[this.selectedUDCFramingArticle].isCustomProfile)
        this.cpService.setConfirm({ article: this.UDCFramingData[this.selectedUDCFramingArticle], isCustomed: false }, PanelsModule.UDCFraming);
      else
        this.cpService.setConfirm({ article: this.UDCFramingData[this.selectedUDCFramingArticle], isCustomed: this.UDCFramingData[this.selectedUDCFramingArticle].isCustomProfile }, PanelsModule.UDCFraming);

      //if (this.UDCFramingData[this.selectedUDCFramingArticle].transomDepth < this.intermediateTransomData[this.selectedIntermediateTransomArticle].transomDepth)
      //if (this.UDCFramingData[this.selectedUDCFramingArticle].transomDepth < this.intermediateMullionData[this.selectedIntermediateMullionArticle].transomDepth)
      this.collectIntermediateMullionDepthData(this.systemFacadeSelectedFromFraming, this.UDCFramingData[this.selectedUDCFramingArticle].transomArticleId.toString());
      setTimeout(() => {
        this.collectIntermediateTransomDepthData(this.systemFacadeSelectedFromFraming, this.UDCFramingData[this.selectedUDCFramingArticle].transomArticleId.toString());
      }, 100);
      this.onCloseLeftPopout();
    }
    else if (this.isReinforcementPopoutOpened) {
      this.cpService.setConfirm({ article: this.reinforcementData[this.selectedReinforcementMullionArticle] }, PanelsModule.ReinforcementFacade);
      this.onCloseLeftPopout();
    }
  }

  onOpenCustom(): void {
    this.openNewCustomEvent.emit();
  }

  onEditCustom(index: number): void {
    if (this.isIntermediateMullionPopoutOpened)
      this.editCustomArticleEvent.emit({ article: this.intermediateMullionData[index], index: index });
    if (this.isIntermediateTransomPopoutOpened)
      this.editCustomArticleEvent.emit({ article: this.intermediateTransomData[index], index: index });
    if (this.isUDCFramingPopoutOpened)
      this.editCustomArticleEvent.emit({ article: this.UDCFramingData[index], index: index });
    else
      this.editCustomArticleEvent.emit({ article: this.mullionData[index], index: index });
  }

  buildTableComponentDataList() {
    if (this.tableComponent) { // && this.searchValue == ''
      if (this.isMullionPopoutOpened) {
        this.listOfDisplayDataInTable = this.listOfDisplayDataInTable_mullionDepth;
        this.tableComponent.selectRow(this.listOfDisplayDataInTable_mullionDepth[this.selectedMullionArticle], true);
        this.articleTitle = this.selectedMullionArticle < this.initialLengthMullion ? this.mullionData[this.selectedMullionArticle].mullionArticleId : this.mullionData[this.selectedMullionArticle].CustomArticleName;
      }
      if (this.isTransomPopoutOpened) {
        this.listOfDisplayDataInTable = this.listOfDisplayDataInTable_transomDepth;
        this.tableComponent.selectRow(this.listOfDisplayDataInTable_transomDepth[this.selectedTransomArticle], true);
        this.articleTitle = this.selectedTransomArticle < this.initialLengthTransom ? this.transomData[this.selectedTransomArticle].transomArticleId : this.transomData[this.selectedTransomArticle].CustomArticleName;
      }
      if (this.isIntermediateMullionPopoutOpened) {
        if (this.selectedIntermediateMullionArticle > -1) {
          this.listOfDisplayDataInTable = this.listOfDisplayDataInTable_intermediateMullionDepth;
          this.tableComponent.selectRow(this.listOfDisplayDataInTable_intermediateMullionDepth[this.selectedIntermediateMullionArticle], true);
          this.articleTitle = this.selectedIntermediateMullionArticle < this.initialLengthIntermediateMullion ? this.intermediateMullionData[this.selectedIntermediateMullionArticle].transomArticleId : this.intermediateMullionData[this.selectedIntermediateMullionArticle].CustomArticleName;
        }
      }
      if (this.isIntermediateTransomPopoutOpened) {
        if (this.selectedIntermediateTransomArticle > -1) {
          this.listOfDisplayDataInTable = this.listOfDisplayDataInTable_intermediateTransomDepth;
          this.tableComponent.selectRow(this.listOfDisplayDataInTable_intermediateTransomDepth[this.selectedIntermediateTransomArticle], true);
          this.articleTitle = this.selectedIntermediateTransomArticle < this.initialLengthIntermediateTransom ? this.intermediateTransomData[this.selectedIntermediateTransomArticle].transomArticleId : this.intermediateTransomData[this.selectedIntermediateTransomArticle].CustomArticleName;
        }
      }
      if (this.isUDCFramingPopoutOpened) {
        if (this.selectedUDCFramingArticle > -1) {
          this.listOfDisplayDataInTable = this.listOfDisplayDataInTable_UDCFramingDepth;
          this.tableComponent.selectRow(this.listOfDisplayDataInTable_UDCFramingDepth[this.selectedUDCFramingArticle], true);
          this.articleTitle = this.selectedUDCFramingArticle < this.initialLengthUDCFraming ? this.UDCFramingData[this.selectedUDCFramingArticle].transomArticleId : this.UDCFramingData[this.selectedUDCFramingArticle].CustomArticleName;
        }
      }
      if (this.isReinforcementPopoutOpened) {
        if (this.reinforcementData.length > 0) {
          this.listOfDisplayDataInTable = this.listOfDisplayDataInTable_reinforcement;
          this.tableComponent.selectRow(this.listOfDisplayDataInTable_reinforcement[this.selectedReinforcementMullionArticle], true);
          this.articleTitle = this.selectedReinforcementMullionArticle >= 0 ? this.reinforcementData[this.selectedReinforcementMullionArticle].value : this.reinforcementData[this.selectedReinforcementMullionArticle].value;
        }
      }
    }
  }
  onOpenCloseMullionDepthPopout() {
    this.checkMarginTopOfMullionTransomTable();
    if (this.tableComponent) {
      if (this.isMullionPopoutOpened) {
        this.buildTableComponentDataList();
        this.tableComponent.selectRow(this.listOfDisplayDataInTable[this.selectedMullionArticle], true);
      }
      this.tableComponent.inputElement.nativeElement.value = '';
      this.searchValue = '';
      this.search();
    }
    this.articleTitle = this.selectedMullionArticle < this.initialLengthMullion ? this.mullionData[this.selectedMullionArticle].mullionArticleId : this.mullionData[this.selectedMullionArticle].CustomArticleName;
  }
  onOpenCloseIntermediateMullionDepthPopout() {
    this.checkMarginTopOfMullionTransomTable();
    if (this.selectedIntermediateMullionArticle > -1) {
      if (this.tableComponent) {
        if (this.isIntermediateMullionPopoutOpened) {
          this.buildTableComponentDataList();
          this.tableComponent.selectRow(this.listOfDisplayDataInTable[this.selectedIntermediateMullionArticle], true);
        }
        this.tableComponent.inputElement.nativeElement.value = '';
        this.searchValue = '';
        this.search();
      }
      this.articleTitle = this.selectedIntermediateMullionArticle < this.initialLengthIntermediateMullion ? this.intermediateMullionData[this.selectedIntermediateMullionArticle].transomArticleId : this.intermediateMullionData[this.selectedIntermediateMullionArticle].CustomArticleName;
    }
  }
  onOpenCloseIntermediateTransomDepthPopout() {
    this.checkMarginTopOfMullionTransomTable();
    if (this.selectedIntermediateTransomArticle > -1) {
      if (this.tableComponent) {
        if (this.isIntermediateTransomPopoutOpened) {
          this.buildTableComponentDataList();
          this.tableComponent.selectRow(this.listOfDisplayDataInTable[this.selectedIntermediateTransomArticle], true);
        }
        this.tableComponent.inputElement.nativeElement.value = '';
        this.searchValue = '';
        this.search();
      }
      this.articleTitle = this.selectedIntermediateTransomArticle < this.initialLengthIntermediateTransom ? this.intermediateTransomData[this.selectedIntermediateTransomArticle].transomArticleId : this.intermediateTransomData[this.selectedIntermediateTransomArticle].CustomArticleName;
    }
  }
  onOpenCloseUDCFramingPopout() {
    this.checkMarginTopOfMullionTransomTable();
    
    if (this.selectedUDCFramingArticle > -1) {
      this.tableComponent.selectRow(this.listOfDisplayDataInTable_UDCFramingDepth[this.selectedUDCFramingArticle], true);
      if (this.tableComponent) {
        if (this.isUDCFramingPopoutOpened) {
          this.buildTableComponentDataList();
          this.tableComponent.selectRow(this.listOfDisplayDataInTable[this.selectedUDCFramingArticle], true);
        }
        this.tableComponent.inputElement.nativeElement.value = '';
        this.searchValue = '';
        this.search();
      }
      this.articleTitle = this.selectedUDCFramingArticle < this.initialLengthUDCFraming ? this.UDCFramingData[this.selectedUDCFramingArticle].transomArticleId : this.UDCFramingData[this.selectedUDCFramingArticle].CustomArticleName;
    }
  }
  onOpenCloseTransomDepthPopout() {
    this.checkMarginTopOfMullionTransomTable();
    if (this.tableComponent) {
      if (this.isTransomPopoutOpened) {
        this.buildTableComponentDataList();
        this.tableComponent.selectRow(this.listOfDisplayDataInTable[this.selectedTransomArticle], true);
      }
      this.tableComponent.inputElement.nativeElement.value = '';
      this.searchValue = '';
      this.search();
    }
    this.articleTitle = this.selectedTransomArticle < this.initialLengthTransom ? this.transomData[this.selectedTransomArticle].transomArticleId : this.transomData[this.selectedTransomArticle].CustomArticleName;
  }
  onOpenCloseReinforcementFacadesPopout() {
    if (this.listOfDisplayDataInTable_reinforcement[this.selectedReinforcementMullionArticle] !== undefined) {
      if (this.tableComponent) {
        if (this.isReinforcementPopoutOpened) {
          this.buildTableComponentDataList();
          this.tableComponent.selectRow(this.listOfDisplayDataInTable[this.selectedReinforcementMullionArticle], true);
        }
      }
    }
    this.tableComponent.inputElement.nativeElement.value = '';
    this.searchValue = '';
    this.search();
    this.articleTitle = this.selectedReinforcementMullionArticle >= 0 ? this.reinforcementData[this.selectedReinforcementMullionArticle].value : this.reinforcementData[this.selectedReinforcementMullionArticle].value;
  }

  getMaxPanelThickness(): number {
    if (this.unified3DModel.ModelInput.Geometry.PanelSystems) {
      return undefined;
    } else {
      var arr = this.unified3DModel.ModelInput.Geometry.PanelSystems;
      if (arr && arr.length > 0) {
        return arr.sort(
          function (a: any, b: any) {
            return parseFloat(b.Thickness) - parseFloat(a.Thickness);
          }
        )[0].Thickness;
      }
      else
        return undefined;
    }
  }
  setConfigurationCustomGrid(showWidth: boolean) {
    if (showWidth) {
      this.configurationCustomGrid = {
        fields: [
          {
            celdType: CeldType.Default,
            display: this.translate.instant(_('configure.description')),
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
            celdType: CeldType.TemplateRef,
            property: 'column2',
            width: '65px',
            template: {
              ref: this.column2Template,
              context: {}
            },
            showSort: true
          }
        ],
        fieldId: 'id'
      };
    } else {
      this.configurationCustomGrid = {
        fields: [
          {
            celdType: CeldType.Default,
            display: this.translate.instant(_('configure.description')),
            property: 'description',
            width: '180px',
            showSort: true
          },
          {
            celdType: CeldType.TemplateRef,
            property: 'column2',
            width: '130px',
            template: {
              ref: this.column2Template,
              context: {}
            },
            showSort: true
          }
        ],
        fieldId: 'id'
      };
    }
  }
  collectMullionDepthData(system: string) {
    this.framingService.getFacade_MullionList(system).pipe(takeUntil(this.destroy$)).subscribe(data => {
      setTimeout(() => {
        const panelThickness = this.getMaxPanelThickness();
        this.mullionData = data;
        let defaultMullionArticle = this.mullionData.length - 1;
        this.initialLengthMullion = this.mullionData.length;
        this.dataToShowInTable = [];
        this.mullionData.forEach((article, index) => {
          this.dataToShowInTable.push({
            id: '' + index,
            description: this.translate.instant(_('configure.mullion-depth-mullion-description')) + " - " + article.mullionArticleId,
            column2: {
              ref: this.column2ArrowTemplate,
              context: {
                value: article.mullionDepth + article.moreInfo,
                disabled: true,
                arrowHovered: true,
                index: index
              }
            },
            disabled: panelThickness === undefined || panelThickness < article.mullionDepth ? false : true,
            bpsTable4CustomRow: false,
            article: article
          });
        });
        this.listOfDisplayDataInTable_mullionDepth = [...this.dataToShowInTable];
        if (this.currentArticleToMullionDepthTable && this.currentArticleToMullionDepthTable.ArticleID) {
          this.currentArticleToMullionDepthTable.ArticleID = this.framingService.oldToNewFraming(this.currentArticleToMullionDepthTable.ArticleID);
          this.selectedMullionArticle = this.mullionData.map(article => article.mullionArticleId.toString()).indexOf(this.currentArticleToMullionDepthTable.ArticleID.toString());
          if (this.selectedMullionArticle < 0)
            this.selectedMullionArticle = defaultMullionArticle;
        }
        else {
          this.selectedMullionArticle = defaultMullionArticle;
        }
        this.tableComponent.selectRow(this.listOfDisplayDataInTable_mullionDepth[this.selectedMullionArticle], true);
        this.cpService.setConfirm({ article: this.mullionData[this.selectedMullionArticle], isCustomed: false }, PanelsModule.MullionFacade);
        if (this.unified3DModel.ProblemSetting.ProductType == "Facade") {
          if (this.unified3DModel.ProblemSetting.FacadeType == "mullion-transom") {
            this.collectTransomDepthData(system, this.mullionData[this.selectedMullionArticle].mullionArticleId.toString());
            if (this.unified3DModel.ModelInput && this.unified3DModel.ModelInput.Geometry && this.unified3DModel.ModelInput.Geometry.Members) {
              if (this.unified3DModel.ModelInput.Geometry.Members.findIndex(x => x.MemberType == 5) != -1)
                setTimeout(() => {
                  this.collectIntermediateMullionDepthData(system, this.mullionData[this.selectedMullionArticle].mullionArticleId.toString(), this.transomData[this.selectedTransomArticle].transomDepth.toString());
                }, 100);
              if (this.unified3DModel.ModelInput.Geometry.Members.findIndex(x => x.MemberType == 6) != -1)
                this.collectIntermediateTransomDepthData(system, this.mullionData[this.selectedMullionArticle].mullionArticleId.toString());
            }
            this.collectMullionReinforcementData(this.mullionData[this.selectedMullionArticle].mullionArticleId.toString());
          } else if (this.unified3DModel.ProblemSetting.FacadeType == "UDC") {
            this.collectUDCFramingFacadData(system, this.mullionData[this.selectedMullionArticle].mullionArticleId.toString());
            this.collectIntermediateMullionDepthData(system, this.mullionData[this.selectedMullionArticle].mullionArticleId.toString());
            setTimeout(() => {
              this.collectIntermediateTransomDepthData(system, this.mullionData[this.selectedMullionArticle].mullionArticleId.toString());
            }, 100);
            //this.collectIntermediateTransomDepthData(system, this.intermediateMullionData[this.selectedIntermediateMullionArticle].transomArticleId.toString());
          }
        }
      }, 100);
    });
  }

  collectMullionReinforcementData(mullionId: string) {
    this.framingService.getFacade_Mullion_ReinforcementList(mullionId).pipe(takeUntil(this.destroy$)).subscribe(data => {
      setTimeout(() => {
        this.reinforcementData = data;
        let defaultReinforcementArticle = 0;
        this.dataToShowInTable = [];
        this.reinforcementData.forEach((article, index) => {
          let translatedMaterial = '';
          if (article.material === 'Aluminium') {
            translatedMaterial = this.translate.instant(_('configure.mullion-depth-reinforcement-aluminium'));
          }
          if (article.material === 'Steel') {
            translatedMaterial = this.translate.instant(_('configure.mullion-depth-reinforcement-steel'));
          }
          this.dataToShowInTable.push({
            id: '' + index,
            description: this.translate.instant(_('configure.mullion-depth-reinforcement')) + " - " + article.value,
            column2: {
              ref: this.column2ArrowTemplate,
              context: {
                value: translatedMaterial,
                disabled: false,
                arrowHovered: false,
                index: index
              }
            },
            disabled: false,
            bpsTable4CustomRow: false,
            article: article
          });
        });

        this.listOfDisplayDataInTable_reinforcement = [...this.dataToShowInTable];
        if (this.currentArticleToReinforcementMullionTable && this.currentArticleToReinforcementMullionTable.ArticleID) {
          this.currentArticleToReinforcementMullionTable.ArticleID = this.currentArticleToReinforcementMullionTable.ArticleID;
          this.selectedReinforcementMullionArticle = this.reinforcementData.map(article => article.value.toString()).indexOf(this.currentArticleToReinforcementMullionTable.ArticleID.toString());
          if (this.selectedReinforcementMullionArticle < 0)
            this.selectedReinforcementMullionArticle = defaultReinforcementArticle;
        }
        else {
          this.selectedReinforcementMullionArticle = defaultReinforcementArticle;
        }
        //this.selectedReinforcementMullionArticle = defaultReinforcementArticle;
       // this.tableComponent.selectRow(this.listOfDisplayDataInTable_reinforcement[this.selectedReinforcementMullionArticle], true);
        //this.changeReinforcementMullionInputValueEvent.emit({ article: this.reinforcementData[this.selectedReinforcementMullionArticle], isCustomed: false });
        if (this.reinforcementData.length > 0) {
          this.cpService.setConfirm({ article: this.reinforcementData[this.selectedReinforcementMullionArticle] }, PanelsModule.ReinforcementFacade);
        }
        else {
          this.cpService.setConfirm({ article: null }, PanelsModule.ReinforcementFacade);
        }
        // if (this.reinforcementData.length > 0) {
        //   if (this.currentReinforcementToMullionDepthTable && this.currentReinforcementToMullionDepthTable.ArticleID) {
        //     this.selectedReinforcementMullionArticle = this.reinforcementData.map(article => article.mullionArticleId.toString()).indexOf(this.currentArticleToMullionDepthTable.ArticleID);
        //     if(this.selectedReinforcementMullionArticle < 0)
        //       this.selectedReinforcementMullionArticle = defaultReinforcementArticle;
        //       this.cpService.setConfirm({article: this.reinforcementData[this.selectedReinforcementMullionArticle]}, PanelsModule.ReinforcementFacade);
        //   }
        //   else {
        //     this.cpService.setConfirm({article: null}, PanelsModule.ReinforcementFacade);
        //   }
        // }
        // else {
        //   this.cpService.setConfirm({article: null}, PanelsModule.ReinforcementFacade);
        // }
      }, 0);
    });
  }

  collectTransomDepthData(system: string, mullionId: string) {
    this.framingService.getFacade_TransomList(system, mullionId).pipe(takeUntil(this.destroy$)).subscribe(data => {
      setTimeout(() => {
        const panelThickness = this.getMaxPanelThickness();
        this.transomData = data;
        let defaultTransomArticle = this.transomData.length - 1;
        this.initialLengthTransom = this.transomData.length;
        this.dataToShowInTable = [];
        this.transomData.forEach((article, index) => {
          this.dataToShowInTable.push({
            id: '' + index,
            description: this.translate.instant(_('configure.transom')) + " - " + article.transomArticleId,
            column2: {
              ref: this.column2ArrowTemplate,
              context: {
                value: article.transomDepth,
                disabled: true,
                arrowHovered: true,
                index: index
              }
            },
            disabled: panelThickness === undefined || panelThickness < article.transomDepth ? false : true,
            bpsTable4CustomRow: false,
            article: article
          });
        });
        this.listOfDisplayDataInTable_transomDepth = [...this.dataToShowInTable];
        if (this.currentArticleToTransomDepthTable && this.currentArticleToTransomDepthTable.ArticleID) {
          this.currentArticleToTransomDepthTable.ArticleID = this.framingService.oldToNewFraming(this.currentArticleToTransomDepthTable.ArticleID);
          this.selectedTransomArticle = this.transomData.map(article => article.transomArticleId.toString()).indexOf(this.currentArticleToTransomDepthTable.ArticleID.toString());
          if (this.selectedTransomArticle < 0)
            this.selectedTransomArticle = defaultTransomArticle;
        }
        else {
          this.selectedTransomArticle = defaultTransomArticle;
        }
        this.tableComponent.selectRow(this.listOfDisplayDataInTable_transomDepth[this.selectedTransomArticle], true);
        this.cpService.setConfirm({ article: this.transomData[this.selectedTransomArticle], isCustomed: false }, PanelsModule.TransomFacade);
      }, 0);
    });
  }

  collectIntermediateMullionDepthData(system: string, mullionId: string, transomDepth: string = "") {
    if (this.unified3DModel.ProblemSetting.FacadeType == 'mullion-transom') {
      let descriptionPrefix = this.translate.instant(_('configure.structural-mullion-depth-table-intermediate-mullion'));
      this.framingService.getFacade_Intermediate_MullionList(system, mullionId).pipe(takeUntil(this.destroy$)).subscribe(data => {
        setTimeout(() => {
          if (transomDepth === "")
            this.intermediateMullionData = data;
          else
            this.intermediateMullionData = data.filter(f => f.transomDepth <= parseInt(transomDepth));

          let defaultIntermediateMullionArticle = this.intermediateMullionData.length - 1;
          this.initialLengthIntermediateMullion = this.intermediateMullionData.length;
          this.dataToShowInTable = [];
          this.intermediateMullionData.forEach((article, index) => {
            this.dataToShowInTable.push({
              id: '' + index,
              description: descriptionPrefix + " - " + article.transomArticleId,
              column2: {
                ref: this.column2ArrowTemplate,
                context: {
                  value: article.transomDepth,
                  disabled: true,
                  arrowHovered: true,
                  index: index
                }
              },
              disabled: false,
              bpsTable4CustomRow: false,
              article: article
            });
          });
          this.listOfDisplayDataInTable_intermediateMullionDepth = [...this.dataToShowInTable];
          if (this.currentArticleToIntermediateMullionDepthTable && this.currentArticleToIntermediateMullionDepthTable.ArticleID) {
            this.selectedIntermediateMullionArticle = this.intermediateMullionData.map(article => article.transomArticleId.toString()).indexOf(this.currentArticleToIntermediateMullionDepthTable.ArticleID);
            if (this.selectedIntermediateMullionArticle < 0)
              this.selectedIntermediateMullionArticle = defaultIntermediateMullionArticle;
          }
          else {
            this.selectedIntermediateMullionArticle = defaultIntermediateMullionArticle;
          }
          if (this.selectedIntermediateMullionArticle > -1 && this.listOfDisplayDataInTable_intermediateMullionDepth.length > 0) {
            this.tableComponent.selectRow(this.listOfDisplayDataInTable_intermediateMullionDepth[this.selectedIntermediateMullionArticle], true);
            this.cpService.setConfirm({ article: this.intermediateMullionData[this.selectedIntermediateMullionArticle], isCustomed: false }, PanelsModule.IntermediateMullionFacade);
          } else {
            this.cpService.setConfirm({ article: undefined, isCustomed: false }, PanelsModule.IntermediateMullionFacade);
          }
        }, 0);
      });
    }
    else if (this.unified3DModel.ProblemSetting.FacadeType == 'UDC') {
      let descriptionPrefix = this.translate.instant(_('configure.Vertical-Glazing-Bar'));
      this.framingService.getUDCFramingList(system, mullionId, 'IntermediateMullion').pipe(takeUntil(this.destroy$)).subscribe(data => {
        setTimeout(() => {
          this.intermediateMullionData = data;
          var secOne = this.unified3DModel.ModelInput.Geometry.FacadeSections.filter(section => section.SectionID == 4)[0];
          if (secOne && secOne.isCustomProfile) {
            secOne.transomArticleId = secOne.ArticleName;
            secOne.Name = "" + secOne.ArticleName;
            secOne.Description = secOne.ArticleName;
            this.intermediateMullionData.push(secOne);
          }

          this.initialLengthIntermediateMullion = this.intermediateMullionData.length;
          this.dataToShowInTable = [];
          this.intermediateMullionData.forEach((article, index) => {
            this.dataToShowInTable.push({
              id: '' + index,
              description: article.isCustomProfile ? descriptionPrefix + " - " + article.Description : descriptionPrefix + " - " + article.transomArticleId,
              inside: article.isCustomProfile ? '- -' : (article.transomWidth ? article.transomWidth : "N/D"),
              column2: {
                ref: this.column2ArrowTemplate,
                context: {
                  value: article.isCustomProfile ? '- -' : (article.transomDepth ? article.transomDepth : "N/D"),
                  disabled: false,
                  arrowHovered: true,
                  index: index
                }
              },
              disabled: article.disabled,
              bpsTable4CustomRow: article.isCustomProfile ? article.isCustomProfile : false,
              article: article
            });
          });
          this.listOfDisplayDataInTable_intermediateMullionDepth = [...this.dataToShowInTable];
          if (this.currentArticleToIntermediateMullionDepthTable && this.currentArticleToIntermediateMullionDepthTable.ArticleID) {
            this.selectedIntermediateMullionArticle = this.intermediateMullionData.map(article => article.transomArticleId + "").indexOf(this.currentArticleToIntermediateMullionDepthTable.ArticleID);
            if (this.selectedIntermediateMullionArticle < 0)
              this.selectedIntermediateMullionArticle = this.intermediateMullionData.map(article => article.Description).indexOf(this.currentArticleToIntermediateMullionDepthTable.ArticleID);
            if (this.selectedIntermediateMullionArticle < 0) { this.selectedIntermediateMullionArticle = 0; }
            else {
              if (this.UDCFramingData[this.selectedUDCFramingArticle] && this.intermediateMullionData[this.selectedIntermediateMullionArticle] &&
                this.UDCFramingData[this.selectedUDCFramingArticle].transomDepth < this.intermediateMullionData[this.selectedIntermediateMullionArticle].transomDepth) {
                // if framing Depth 180 and Mullion Depth = 204, change Mullion Depth to 179
                this.selectedIntermediateMullionArticle = this.intermediateMullionData.map(article => article.transomDepth).indexOf(this.UDCFramingData[this.selectedUDCFramingArticle].transomDepth - 1);;
                this.currentArticleToIntermediateMullionDepthTable.ArticleID = this.intermediateMullionData[this.selectedIntermediateMullionArticle].transomArticleId.toString();
              }
            }
          }
          else {
            this.selectedIntermediateMullionArticle = 0;
          }
          if (!this.intermediateMullionData[this.selectedIntermediateMullionArticle].isCustomProfile) {
            this.cpService.setConfirm({ article: this.intermediateMullionData[this.selectedIntermediateMullionArticle], isCustomed: false }, PanelsModule.IntermediateMullionFacade);
          } else {
            this.cpService.setConfirm({ article: this.intermediateMullionData[this.selectedIntermediateMullionArticle], isCustomed: this.intermediateMullionData[this.selectedIntermediateMullionArticle].isCustomProfile }, PanelsModule.IntermediateMullionFacade);
          }
        }, 0);
      });
    }
  }
  collectIntermediateTransomDepthData(system: string, mullionId: string) {
    this.framingService.getUDCFramingList(system, mullionId, 'IntermediateTransom').pipe(takeUntil(this.destroy$)).subscribe(data => {
      let descriptionPrefix = this.translate.instant(_('configure.Horizontal-Glazing-Bar'));
      setTimeout(() => {
        this.intermediateTransomData = data;
        var secOne = this.unified3DModel.ModelInput.Geometry.FacadeSections.filter(section => section.SectionID == 5)[0];
        if (secOne && secOne.isCustomProfile) {
          secOne.transomArticleId = secOne.ArticleName;
          secOne.Name = "" + secOne.ArticleName;
          secOne.Description = secOne.ArticleName;
          this.intermediateTransomData.push(secOne);
        }

        this.initialLengthIntermediateTransom = this.intermediateTransomData.length;
        this.dataToShowInTable = [];
        this.intermediateTransomData.forEach((article, index) => {
          this.dataToShowInTable.push({
            id: '' + index,
            description: article.isCustomProfile ? descriptionPrefix + " - " + article.Description : descriptionPrefix + " - " + article.transomArticleId,
            inside: article.isCustomProfile ? '- -' : (article.transomWidth ? article.transomWidth : "N/D"),
            column2: {
              ref: this.column2ArrowTemplate,
              context: {
                value: article.isCustomProfile ? '- -' : (article.transomDepth ? article.transomDepth : "N/D"),
                disabled: false,
                arrowHovered: true,
                index: index
              }
            },
            disabled: article.disabled,
            bpsTable4CustomRow: article.isCustomProfile ? article.isCustomProfile : false,
            article: article
          });
        });
        this.listOfDisplayDataInTable_intermediateTransomDepth = [...this.dataToShowInTable];
        if (this.currentArticleToIntermediateTransomDepthTable && this.currentArticleToIntermediateTransomDepthTable.ArticleID) {
          ////if (this.intermediateTransomData.map(article => article.transomArticleId + "").indexOf(this.selectedIntermediateTransomArticle.toString()))
          this.selectedIntermediateTransomArticle = this.intermediateTransomData.map(article => article.transomArticleId + "").indexOf(this.currentArticleToIntermediateTransomDepthTable.ArticleID);
          if (this.selectedIntermediateTransomArticle < 0)
            this.selectedIntermediateTransomArticle = this.intermediateTransomData.map(article => article.Description).indexOf(this.currentArticleToIntermediateTransomDepthTable.ArticleID);
          if (this.selectedIntermediateTransomArticle < 0) { this.selectedIntermediateTransomArticle = 0; }
          else if (this.unified3DModel.ProblemSetting.FacadeType == 'UDC') {
            if (this.UDCFramingData[this.selectedUDCFramingArticle] && this.intermediateTransomData[this.selectedIntermediateTransomArticle] &&
              this.UDCFramingData[this.selectedUDCFramingArticle].transomDepth < this.intermediateTransomData[this.selectedIntermediateTransomArticle].transomDepth) {
              // if framing Depth 180 and Mullion Depth = 204, change Mullion Depth to 179
              this.selectedIntermediateTransomArticle = this.intermediateTransomData.map(article => article.transomDepth).indexOf(this.UDCFramingData[this.selectedUDCFramingArticle].transomDepth - 1);;
              this.currentArticleToIntermediateTransomDepthTable.ArticleID = this.intermediateTransomData[this.selectedIntermediateTransomArticle].transomArticleId.toString();
            }
          }
        }
        else {
          this.selectedIntermediateTransomArticle = 0;
        }
        if (this.intermediateTransomData.length > 0 && !this.intermediateTransomData[this.selectedIntermediateTransomArticle].isCustomProfile) {
          this.cpService.setConfirm({ article: this.intermediateTransomData[this.selectedIntermediateTransomArticle], isCustomed: false }, PanelsModule.IntermediateTransomFacade);
        } else if (this.intermediateTransomData.length > 0) {
          this.cpService.setConfirm({ article: this.intermediateTransomData[this.selectedIntermediateTransomArticle], isCustomed: this.intermediateTransomData[this.selectedIntermediateTransomArticle].isCustomProfile }, PanelsModule.IntermediateTransomFacade);
        }
      }, 0);
    });
  }

  collectUDCFramingFacadData(system: string, mullionId: string) {
    this.setConfigurationCustomGrid(true);
    this.framingService.getUDCFramingList(system, null, 'Framing').pipe(takeUntil(this.destroy$)).subscribe(data => {
      setTimeout(() => {
        this.UDCFramingData = data;
        var secOne = this.unified3DModel.ModelInput.Geometry.FacadeSections.filter(section => section.SectionID == 1)[0];
        if (secOne.isCustomProfile) {
          secOne.transomArticleId = secOne.ArticleName;
          secOne.Name = "" + secOne.ArticleName;
          secOne.Description = secOne.ArticleName;
          this.UDCFramingData.push(secOne);
        }
        this.initialLengthUDCFraming = this.UDCFramingData.length;
        this.dataToShowInTable = [];
        this.UDCFramingData.forEach((article, index) => {
          this.dataToShowInTable.push({
            id: '' + index,
            description: article.isCustomProfile ? "" + article.Description : "" + article.transomArticleId,
            inside: article.isCustomProfile ? '- -' : (article.transomWidth ? article.transomWidth : "N/D"),
            column2: {
              ref: this.column2ArrowTemplate,
              context: {
                value: article.isCustomProfile ? '- -' : (article.transomDepth ? article.transomDepth : "N/D"),
                disabled: false,
                arrowHovered: true,
                index: index
              }
            },
            disabled: false,
            bpsTable4CustomRow: article.isCustomProfile ? article.isCustomProfile : false,
            article: article
          });
        });
        this.listOfDisplayDataInTable_UDCFramingDepth = [...this.dataToShowInTable];
        if (this.currentArticleToUDCFramingDepthTable && this.currentArticleToUDCFramingDepthTable.ArticleID) {
          this.selectedUDCFramingArticle = this.UDCFramingData.map(article => article.transomArticleId + "").indexOf(this.currentArticleToUDCFramingDepthTable.ArticleID);
          if (this.selectedUDCFramingArticle < 0) {
            this.selectedUDCFramingArticle = this.UDCFramingData.map(article => article.Description).indexOf(this.currentArticleToUDCFramingDepthTable.ArticleID);
            if (this.selectedUDCFramingArticle < 0) { this.selectedUDCFramingArticle = 0; }
          }
        }
        else {
          this.selectedUDCFramingArticle = 0;
        }
        if (this.UDCFramingData.length > 0) // && !this.UDCFramingData[this.selectedUDCFramingArticle].isCustomProfile
        {
          this.cpService.setConfirm({ article: this.UDCFramingData[this.selectedUDCFramingArticle], isCustomed: false }, PanelsModule.UDCFraming);
          //// this.collectUDCFramingFacadData(system, this.mullionData[this.selectedMullionArticle].mullionArticleId.toString());
          this.collectIntermediateMullionDepthData(system, this.UDCFramingData[this.selectedUDCFramingArticle].transomArticleId.toString());
          this.collectIntermediateTransomDepthData(system, this.UDCFramingData[this.selectedUDCFramingArticle].transomArticleId.toString());
          // setTimeout(() => {
          //   this.collectIntermediateTransomDepthData(system, this.UDCFramingData[this.selectedUDCFramingArticle].transomArticleId.toString());
          // }, 100);
        }
        // else if (this.UDCFramingData.length > 0) {
        //   this.cpService.setConfirm({ article: this.UDCFramingData[this.selectedUDCFramingArticle], isCustomed: this.UDCFramingData[this.selectedUDCFramingArticle].isCustomProfile }, PanelsModule.UDCFraming);
        // }
        // if (this.selectedUDCFramingArticle > -1 && this.listOfDisplayDataInTable_UDCFramingDepth.length > 0) {
        //   this.tableComponent.selectRow(this.listOfDisplayDataInTable_UDCFramingDepth[this.selectedUDCFramingArticle], true);
        //   this.cpService.setConfirm({ article: this.UDCFramingData[this.selectedUDCFramingArticle], isCustomed: false }, PanelsModule.UDCFraming);
        // }
      }, 0);
    });
  }
  deleteArticle(articleIndex) {
    this.mullionData.splice(articleIndex, 1);
    this.selectedMullionArticle = Math.min(this.selectedMullionArticle, this.mullionData.length - 1);
    if (this.selectedMullionArticle < 0) {
      this.selectedMullionArticle = 0;
      this.mullionData.splice(articleIndex, 1);
    }
    this.selectedTransomArticle = Math.min(this.selectedTransomArticle, this.transomData.length - 1);
    if (this.selectedTransomArticle < 0) {
      this.selectedTransomArticle = 0;
    }
    this.transomData.splice(articleIndex, 1);
    this.selectedIntermediateMullionArticle = Math.min(this.selectedIntermediateMullionArticle, this.intermediateMullionData.length - 1);
    if (this.selectedIntermediateMullionArticle < 0) {
      this.selectedIntermediateMullionArticle = 0;
      this.intermediateMullionData.splice(articleIndex, 1);
    }
    this.dataToShowInTable.splice(articleIndex, 1);
    this.listOfDisplayDataInTable = [...this.dataToShowInTable];
  }
  deleteUDCFramingArticle(articleIndex) {
    this.dataToShowInTable = this.listOfDisplayDataInTable_UDCFramingDepth;
    this.UDCFramingData.splice(articleIndex, 1);
    this.selectedUDCFramingArticle = Math.min(this.selectedUDCFramingArticle, this.UDCFramingData.length - 1);
    if (this.selectedUDCFramingArticle < 0) {
      this.selectedUDCFramingArticle = 0;
      this.UDCFramingData.splice(articleIndex, 1);
    }
    this.dataToShowInTable.splice(articleIndex, 1);
    this.listOfDisplayDataInTable = [...this.dataToShowInTable];

  }
  deleteIntermediateTransomArticle(articleIndex) {
    this.dataToShowInTable = this.listOfDisplayDataInTable_intermediateTransomDepth;
    this.intermediateTransomData.splice(articleIndex, 1);
    this.selectedIntermediateTransomArticle = Math.min(this.selectedIntermediateTransomArticle, this.intermediateTransomData.length - 1);
    if (this.selectedIntermediateTransomArticle < 0) {
      this.selectedIntermediateTransomArticle = 0;
      this.intermediateTransomData.splice(articleIndex, 1);
    }
    this.dataToShowInTable.splice(articleIndex, 1);
    this.listOfDisplayDataInTable = [...this.dataToShowInTable];
  }
  deleteIntermediateMullionArticle(articleIndex) {
    this.dataToShowInTable = this.listOfDisplayDataInTable_intermediateMullionDepth;
    this.intermediateMullionData.splice(articleIndex, 1);
    this.selectedIntermediateMullionArticle = Math.min(this.selectedIntermediateMullionArticle, this.intermediateMullionData.length - 1);
    if (this.selectedIntermediateMullionArticle < 0) {
      this.selectedIntermediateMullionArticle = 0;
      this.intermediateMullionData.splice(articleIndex, 1);
    }
    this.dataToShowInTable.splice(articleIndex, 1);
    this.listOfDisplayDataInTable = [...this.dataToShowInTable];
  }
  addMullionTransomArticle(sectionElement) {
    this.mullionData.push(sectionElement);
    let index = this.dataToShowInTable.length;
    this.dataToShowInTable.push({
      id: '' + index,
      description: sectionElement.ArticleName,
      inside: sectionElement.InsideW,
      outside: {
        ref: this.column2Template,
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
    this.listOfDisplayDataInTable = [...this.dataToShowInTable];
    setTimeout(() => {
      this.tableComponent.selectRow(this.listOfDisplayDataInTable[index]);
    });
  }

  updateMullionTransomArticle(data) {
    let index = data.index;
    let property = data.sectionElement;
    this.mullionData[index] = property;
    this.transomData[index] = property;
  }

  onDblClickRow(event) {
    this.tableComponent.selectRow(event);
    this.onConfirmMullionArticle();
  }

  checkMarginTopOfMullionTransomTable() {
    this.marginTopTable = this.unified3DModel.ProblemSetting.EnableStructural ? '-10px' : '2px';
    if (this.divOftable) {
      this.render.setStyle(this.divOftable.nativeElement, 'margin-top', this.marginTopTable);
    }
  }

  addUDCFramingArticle(sectionElement) {
    this.dataToShowInTable = this.listOfDisplayDataInTable_UDCFramingDepth;
    this.UDCFramingData.push(sectionElement);
    let index = this.dataToShowInTable.length;
    this.dataToShowInTable.push({
      id: '' + index,
      description: sectionElement.ArticleName,
      inside: sectionElement.InsideW,
      outside: {
        ref: this.column2Template,
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
    this.listOfDisplayDataInTable = [...this.dataToShowInTable];
    this.listOfDisplayDataInTable_UDCFramingDepth = [...this.dataToShowInTable];

    setTimeout(() => {
      this.tableComponent.selectRow(this.listOfDisplayDataInTable[index]);
    });
  }

  updateUDCFramingArticle(data) {
    let index = data.index;
    let property = data.sectionElement;
    this.UDCFramingData[index] = property;
  }


  addIntermediateTransomArticle(sectionElement) {
    this.dataToShowInTable = this.listOfDisplayDataInTable_intermediateTransomDepth;
    this.intermediateTransomData.push(sectionElement);
    let index = this.dataToShowInTable.length;
    this.dataToShowInTable.push({
      id: '' + index,
      description: "Intermediate Transom - " + sectionElement.ArticleName,
      inside: sectionElement.InsideW,
      outside: {
        ref: this.column2Template,
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
    this.listOfDisplayDataInTable = [...this.dataToShowInTable];
    this.listOfDisplayDataInTable_intermediateTransomDepth = [...this.dataToShowInTable];

    setTimeout(() => {
      this.tableComponent.selectRow(this.listOfDisplayDataInTable[index]);
    });
  }

  updateIntermediateTransomArticle(data) {
    let index = data.index;
    let property = data.sectionElement;
    this.intermediateTransomData[index] = property;
  }

  addIntermediateMullionArticle(sectionElement) {
    this.dataToShowInTable = this.listOfDisplayDataInTable_intermediateMullionDepth;
    this.intermediateMullionData.push(sectionElement);
    let index = this.dataToShowInTable.length;
    this.dataToShowInTable.push({
      id: '' + index,
      description: "Intermediate Mullion - " + sectionElement.ArticleName,
      inside: sectionElement.InsideW,
      outside: {
        ref: this.column2Template,
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
    this.listOfDisplayDataInTable = [...this.dataToShowInTable];
    this.listOfDisplayDataInTable_intermediateMullionDepth = [...this.dataToShowInTable];

    setTimeout(() => {
      this.tableComponent.selectRow(this.listOfDisplayDataInTable[index]);
    });
  }

  updateIntermediateMullionArticle(data) {
    let index = data.index;
    let property = data.sectionElement;
    this.intermediateMullionData[index] = property;
  }


}
