import { Component, OnInit, TemplateRef, Output, EventEmitter, Input, ViewChild, AfterViewInit, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import { CeldType, BpsTableComponent } from 'bps-components-lib';
import { LocalStorageService } from 'src/app/app-core/services/local-storage.service';
import { TranslateService } from '@ngx-translate/core';
import { _ } from '@biesbjerg/ngx-translate-extract/dist/utils/utils';
import { ConfigureService } from 'src/app/app-structural/services/configure.service';
import { BpsUnifiedModel } from 'src/app/app-common/models/bps-unified-model';
import { FramingService } from 'src/app/app-structural/services/framing.service';
import { NzFormatEmitEvent, NzTreeNodeOptions } from 'ng-zorro-antd';
import { ConfigPanelsService } from 'src/app/app-structural/services/config-panels.service';
import { PanelsModule } from 'src/app/app-structural/models/panels/panels.module';
import { UnifiedModelService } from 'src/app/app-structural/services/unified-model.service';
import { Subject, Subscription } from 'rxjs';
import { Feature } from 'src/app/app-core/models/feature';
import { PermissionService } from 'src/app/app-core/services/permission.service';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-glass-panel-table',
  templateUrl: './glass-panel-table.component.html',
  styleUrls: ['./glass-panel-table.component.css']
})
export class GlassPanelTableComponent implements OnInit, OnChanges, OnDestroy, AfterViewInit {
  private destroy$ = new Subject<void>();
  isPopoutOpened: boolean;

  selectedType: string;
  isDoubleBtnDisabled: boolean = false;
  isTripleBtnDisabled: boolean = false;
  isPanelBtnDisabled: boolean = false;
  isNewBtnDisabled: boolean = false;
  // searchValue: string = '';
  ArticlesForSystem = [];
  selectedArticle: any;
  isSidePanel = false;
  maxAllowedThickness: number;
  unified3DModel: BpsUnifiedModel;
  @Output() openNewCustomEvent: EventEmitter<any> = new EventEmitter<any>();
  @Output() editCustomArticleEvent: EventEmitter<any> = new EventEmitter<any>();
  @Output() ngNotificaionShow: EventEmitter<any> = new EventEmitter<any>();

  configurationCustomGrid: any;
  listOfDisplayData: any = [];
  data = [];
  sortName: string | null = null;
  sortValue: string | null = null;
  searchValue = '';
  language: string = '';
  searchByDimensionText: string;
  doubleData: any;
  tripleData: any;
  panelLibraryData: any;
  customLibraryData: any;
  isConfirmBtnDisabled: boolean = true;
  isEditCustomDisabled: boolean = true;
  numberOfClicks: number = 0;
  @ViewChild('outsideTemplate', { read: TemplateRef, static: true }) outsideTemplate: TemplateRef<{}>;
  @ViewChild('uValueTemplate', { read: TemplateRef, static: true }) uValueTemplate: TemplateRef<{}>;
  @ViewChild('idTemplate', { read: TemplateRef, static: true }) idTemplate: TemplateRef<{}>;
  @ViewChild('rwTemplate', { read: TemplateRef, static: true }) rwTemplate: TemplateRef<{}>;
  @ViewChild('bpsTable', { read: BpsTableComponent, static: false }) tableComponent: BpsTableComponent<{}>;
  currentArticle: any;
  nodes: NzTreeNodeOptions[];
  defaultSelectedKeys = ['1'];
  disableConfirmBtn: boolean = false;
  defaultExpandedKeys = ['100'];
  applicationType: string;
  selectedChildNodeKey: number = 1;
  selectedHeader: boolean = true;
  headerSelected: boolean = false;
  feature = Feature;

  constructor(
    private cpService: ConfigPanelsService,
    private umService: UnifiedModelService,
    private localStorageService: LocalStorageService,
    private translate: TranslateService,
    private configureService: ConfigureService,
    private framingService: FramingService,
    private permissionService: PermissionService
  ) {
    this.applicationType = this.configureService.applicationType;
  }

  ngAfterViewInit() {}

  ngOnInit(): void {
    this.language = this.configureService.getLanguage();

    this.unified3DModel = this.umService.current_UnifiedModel;
    this.umService.obsUnifiedModel.pipe(takeUntil(this.destroy$)).subscribe(
      response => {
        if (response) {
          this.unified3DModel = response;
          if(this.unified3DModel.ModelInput.Geometry.SlidingDoorSystems && this.unified3DModel.ModelInput.Geometry.SlidingDoorSystems.length > 0) {
            this.isTripleBtnDisabled = true;
          } else {
            this.isTripleBtnDisabled = false;
          }
        }
      });
    
    if (this.permissionService.checkPermission(this.feature.GlassPanelSideTableShort)) {
      this.doubleData = this.configureService.getArticleListByType("double_SRS");
      this.tripleData = this.configureService.getArticleListByType("triple_SRS");
    } else if (this.permissionService.checkPermission(this.feature.GlassPanelSideTableFull)) {
      this.doubleData = this.configureService.getArticleListByType("double_BPS");
      this.tripleData = this.configureService.getArticleListByType("triple_BPS");
      this.panelLibraryData = this.configureService.getArticleListByType("panel_BPS");
    }
    this.customLibraryData = this.umService.ConvertCustomGlassData();
    this.searchByDimensionText = this.translate.instant(_('configure.search-by-dimension'))
    this.getConfigGrid();

    this.cpService.obsPopout.pipe(takeUntil(this.destroy$)).subscribe(
      response => {
        if (response.panelsModule === PanelsModule.GlassPanel)
          this.isPopoutOpened = response.isOpened;

        if (this.unified3DModel.ProblemSetting.ProductType === 'Window')
          this.isPanelBtnDisabled = true;
        else if (this.unified3DModel.ProblemSetting.ProductType === 'Facade')
          this.isPanelBtnDisabled = false;

        if (!this.isPopoutOpened) {
          this.numberOfClicks = 0;
        }
        else {
          if (this.tableComponent) {
            this.tableComponent.inputElement.nativeElement.value = '';
          }
          this.searchValue = '';
          this.search();
          this.onUnifiedModelUpdated();
        }
      });
  }

  getConfigGrid(action: string = "") {
    if (action == "") {
      this.configurationCustomGrid = {
        fields: [
          {
            celdType: CeldType.Default,
            display: this.translate.instant(_('configure.glass-description')),
            property: 'description',
            width: '195px',
            showSort: true
          },
          {
            celdType: CeldType.Default,
            property: 'uValue',
            template: {
              ref: this.uValueTemplate,
              context: {}
            },
            width: '50px',
            showSort: true
          },
          {
            celdType: CeldType.TemplateRef,
            property: 'rw',
            width: '50px',
            template: {
              ref: this.rwTemplate,
              context: {}
            },
            showSort: true,
            disabled: false
          }
        ],
        fieldId: 'id'
      };
    }
    if (action == "NEW") {

      this.configurationCustomGrid = {
        fields: [
          {
            celdType: CeldType.Default,
            property: 'dataId',
            template: {
              ref: this.idTemplate,
              context: {}
            },
            width: '0px',
            showSort: false,
          },
          {
            celdType: CeldType.Default,
            display: this.translate.instant(_('configure.glass-description')),
            property: 'description',
            width: '180px',
            showSort: true
          },
          {
            celdType: CeldType.Default,
            property: 'uValue',
            template: {
              ref: this.uValueTemplate,
              context: {}
            },
            width: '50px',
            showSort: true
          },
          {
            celdType: CeldType.TemplateRef,
            property: 'rw',
            width: '50px',
            template: {
              ref: this.rwTemplate,
              context: {}
            },
            showSort: true,
            disabled: false
          }
        ],
        fieldId: 'id'
      };
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  preventDefault($event: Event, index) {
    $event.preventDefault();
    $event.stopImmediatePropagation();
    if (this.unified3DModel.ModelInput.Geometry.CustomGlass !== undefined && this.unified3DModel.ModelInput.Geometry.CustomGlass !== null) {
      this.SelectedCustomRow = this.unified3DModel.ModelInput.Geometry.CustomGlass[index];
      this.openNewCustomEvent.emit(this.SelectedCustomRow);
    }
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
    const data = this.data.filter((item: { description: string; inside: string; outside: string }) =>
        filterFunc(item)
    );
    if (this.sortName && this.sortValue) {
      this.listOfDisplayData = data.sort((a, b) => this.sortValue === "ascend" ? a[this.sortName!] > b[this.sortName!] ? 1 : -1 : b[this.sortName!] > a[this.sortName!] ? 1 : -1 );
      this.listOfDisplayData = [...this.listOfDisplayData];
    } else {
      this.listOfDisplayData = data;
    }
  }

  //#region events
  selectionChange(event) {
    if (event !== undefined && event.data !== undefined && this.unified3DModel.ModelInput.Geometry.CustomGlass !== undefined && this.unified3DModel.ModelInput.Geometry.CustomGlass !== null) {
      this.SelectedCustomRow = this.unified3DModel.ModelInput.Geometry.CustomGlass[event.data.id]; this.isEditCustomDisabled = false;
    }
  }

  onClose(): void {
    if (this.tableComponent) {
      this.tableComponent.inputElement.nativeElement.value = "";
    }
    this.searchValue = "";
    this.search();
    if (this.isPopoutOpened)
      this.cpService.setPopout(false, PanelsModule.GlassPanel);
  }

  onclickRow(event: any): void {
    this.selectedArticle = event.article;
    this.selectedArticle.idArticle = this.glazingSystemsId;
    if (
      this.selectedArticle && this.currentArticle && this.currentArticle.id && this.currentArticle.id == this.selectedArticle.id && this.currentArticle.category == this.selectedArticle.category )
      this.isConfirmBtnDisabled = true;
    else this.isConfirmBtnDisabled = false;
  }

  ondblclickRow(event) {
    this.tableComponent.selectRow(event);
    this.onConfirm();
  }

  onConfirm() {
    this.umService.set_GlassPanel(this.selectedArticle);
    this.fromOldTable = null;
    this.cpService.setConfirm(this.selectedArticle, PanelsModule.GlassPanel);
    this.cpService.setPopout(false, PanelsModule.GlassPanel);
    this.customLibraryData = this.umService.ConvertCustomGlassData();
    this.onClose();
    this.headerSelected = false;
  }
  //#endregion

  onUnifiedModelUpdated() {
    if (this.unified3DModel && this.unified3DModel.ModelInput.Geometry.FacadeSections && this.unified3DModel.ModelInput.Geometry.FacadeSections.filter(f => f.SectionID === 5 && f.SectionType === 5)) {
      const mullion = this.unified3DModel.ModelInput.Geometry.FacadeSections.filter(f => f.SectionID === 1 && f.SectionType === 4)[0];
      const transom = this.unified3DModel.ModelInput.Geometry.FacadeSections.filter(f => f.SectionID === 2 && f.SectionType === 5)[0];
      if (mullion) {
        this.framingService.getFacade_TransomList(this.unified3DModel.ModelInput.FrameSystem.SystemType, mullion.ArticleName, this.configureService.applicationType).pipe(takeUntil(this.destroy$)).subscribe((data: any[]) => {
          if (transom) {
            var aSelected = data.filter(f => f.transomArticleId.toString() === transom.ArticleName)[0];
            if (aSelected)
              this.maxAllowedThickness = data.filter(f => f.transomArticleId.toString() === transom.ArticleName)[0].transomDepth;
            else
              this.maxAllowedThickness = data[data.length - 1].transomDepth;
            if (this.selectedArticle)
              switch (this.selectedType) {
                case "double":
                  this.onSetDoubleGlassTypesForSystem();
                  break;
                case "triple":
                  this.onSetTripleGlassTypesForSystem();
                  break;
                case "panel":
                  this.onSetPanelLibraryGlassTypesForSystem();
                  break;
                case "new":
                  this.onClickNew();
                  break;
              }
          }
        });
      }
    }
  }
  
  isCustomRowValid(uvalue: string, rw: string, index: number, selectedRow: any): boolean {
    if (selectedRow && index.toString() === selectedRow.id && (uvalue === "N/D" || rw === "N/D" || uvalue === "" || rw === ""))
      return false;
    else
      return true;
  }

  loadData(): void {
    this.data = [];
    if (this.ArticlesForSystem !== undefined) {
      //let selectedRow = this.getSelectedRow();
      if (this.permissionService.checkPermission(this.feature.GlassPanelSideTableShort)) {
        let nodeRow = {
          title: '/assets/Images/spacer-type/vitroarchitecturalglass_enabled.svg',
          key: '100',
          children: [
          ]
        };

        this.ArticlesForSystem.forEach((article, index) => {
          article.rw = article.rw ? article.rw : "N/D";
          let compositions = article.composition.split('-');
          for (let i = 0; i < compositions.length; i++) {
            if (compositions[i].includes('PVB')) {
              let compositionParts = compositions[i].split('(');
              if (compositionParts && compositionParts.length > 0 && compositionParts[1]) {
                compositions[i] = compositionParts[0] + '[' + compositionParts[1].match(/\d.\d+/g) + ']';
              }
            }
          }
          compositions = compositions.join('-');
          let desc: string;
          if (article.thicknessFraction) {
            desc = article.totalThickness.toString() + ' ' + article.thicknessFraction + ' ' + article.totalThicknessUnit + '    &nbsp; &nbsp;&nbsp;&nbsp;&nbsp; &nbsp;&nbsp;(' + compositions + ')';
          } else
            desc = article.totalThickness.toString() + ' ' + article.totalThicknessUnit + '    &nbsp; &nbsp;&nbsp;&nbsp;&nbsp; &nbsp;&nbsp;(' + compositions + ')';

          this.data.push({
            id: '' + index,
            dataId: '' + (index + 1),
            description: desc,
            uValue: article.uvalue ? article.uvalue : "N/D",
            disabled: (this.unified3DModel.ProblemSetting.ProductType == 'Facade' && this.unified3DModel.ProblemSetting.FacadeType == 'mullion-transom') ? (this.maxAllowedThickness > article.totalThickness) ? false : true : false,
            article: article,
            rw: {
              ref: this.outsideTemplate,
              context: {
                value: article.rw,
                disabled: false,
                arrowHovered: false,
                index: index,
                validData: true
              }
            },
            bpsTable4CustomRow: this.selectedType === "new" ? true : false
          });
          nodeRow.children.push({ 'title': desc, 'key': article.id, 'isLeaf': true });

        });
        this.nodes = [
          nodeRow
        ];
        this.defaultExpandedKeys = [];
        let selectedChild;
        this.defaultSelectedKeys.forEach(key => {
          selectedChild = this.nodes.filter(node => node.children.map(child => parseInt(child.key)).includes(parseInt(key)));
          if (selectedChild && selectedChild.length == 1)
            this.defaultExpandedKeys.push(this.nodes.filter(node => node.children.map(child => parseInt(child.key)).includes(parseInt(key)))[0].key);
        });
        if (!selectedChild || selectedChild == 0) {
          this.defaultSelectedKeys = ['1'];
          this.defaultSelectedKeys.forEach(key => {
            selectedChild = this.nodes.filter(node => node.children.map(child => parseInt(child.key)).includes(parseInt(key)));
            if (selectedChild && selectedChild.length == 1)
              this.defaultExpandedKeys.push(this.nodes.filter(node => node.children.map(child => parseInt(child.key)).includes(parseInt(key)))[0].key);
          });
        }
      } else if (this.permissionService.checkPermission(this.feature.GlassPanelSideTableFull)) {
        this.ArticlesForSystem.forEach((article, index) => {
          article.rw = article.rw ? article.rw : "N/D";
          let compositions = article.composition.split('-');
          for (let i = 0; i < compositions.length; i++) {
            // if(compositions[i].includes('PVB'))
            //   compositions[i] = compositions[i].split('(')[0]+' PVB';
            //
            if (compositions[i].includes('PVB')) {
              let compositionParts = compositions[i].split('(');
              if (compositionParts && compositionParts.length > 0 && compositionParts[1]) {
                compositions[i] = compositionParts[0] + '[' + compositionParts[1].match(/\d.\d+/g) + ']';
              }
            }
            //
          }

          compositions = compositions.join('-');
          // let suffix = article.composition.includes('PVB')? 'PVB':'';
          // let composition = article.composition;
          // if(suffix==='PVB'){
          //   composition = article.composition.split('(')[0];
          // }

          this.data.push({
            id: '' + index,
            dataId: '' + (index + 1),
            description: article.totalThickness.toString() + ' ' + article.totalThicknessUnit + '    (' + compositions + ')',
            uValue: article.uvalue ? article.uvalue : "N/D",
            //rw: article.rw,
            disabled: (this.unified3DModel.ProblemSetting.ProductType == 'Facade' && this.unified3DModel.ProblemSetting.FacadeType == 'mullion-transom') ? (this.maxAllowedThickness > article.totalThickness) ? false : true : false,
            article: article,
            rw: {
              ref: this.outsideTemplate,
              context: {
                value: article.rw,
                disabled: false,
                arrowHovered: false,
                index: index,
                validData: true //this.isCustomRowValid(article.uvalue, article.rw, index, selectedRow)
              }
            },
            bpsTable4CustomRow: this.selectedType === "new" ? true : false
          });
        });
      }
    }
  }

  getSelectedRow(): any {
    let selectedRow;
    if (this.fromOldTable) {
      selectedRow = this.listOfDisplayData.filter(row => row.article.composition == this.fromOldTable.composition)[0];
    } else{
      selectedRow = this.listOfDisplayData.filter(row => row.article.composition == this.selectedArticle.composition
        && row.article.rw == this.selectedArticle.rw && row.article.uValue == this.selectedArticle.uValue)[0];
      }

    if (!selectedRow && this.isCustomArticleUpdated && this.SelectedCustomRow) {
      selectedRow = this.listOfDisplayData[0];
      this.isCustomArticleUpdated = false;
    }
    this.fromOldTable = null;
    if (selectedRow) {
      setTimeout(() => {
        this.selectedChildNodeKey = selectedRow.article.id;
        this.Click(this.nodes[this.selectedChildNodeKey-1]);
      });      
    } else {
      setTimeout(() => { this.selectedChildNodeKey = -1; });      
    }
  }

  glazingSystemsId = undefined;
  ngOnChanges(Changes: SimpleChanges) {
    //this.onUnifiedModelUpdated();
  }

  fromOldTable: any;
  //Double Glass
  onSetDoubleGlassTypesForSystem(): void {
    this.numberOfClicks = 0;
    this.isConfirmBtnDisabled = true;
    this.ArticlesForSystem = this.doubleData;
    this.loadData();
    this.listOfDisplayData = [...this.data];
    let selectedRow;
    if (this.fromOldTable) {
      selectedRow = this.listOfDisplayData.filter(row => row.article.composition == this.fromOldTable.composition)[0];
    } else
      selectedRow = this.listOfDisplayData.filter(row => row.article.composition == this.selectedArticle.composition)[0];
    this.fromOldTable = null;
    setTimeout(() => {
      if (this.configureService.applicationType == "SRS") {
        if (!selectedRow)
          selectedRow = this.listOfDisplayData[0];
        if (selectedRow && selectedRow.article)
          this.defaultSelectedKeys = [selectedRow.article.id];
          this.selectedChildNodeKey = selectedRow.article.id;
      } else {
        if (selectedRow && this.tableComponent) {
          this.tableComponent.selectRow(selectedRow);
        }
        else if (this.tableComponent) {
          this.tableComponent.checkboxCache.forEach(article => {
            article.selected = false;
          });
          this.listOfDisplayData = [];
          setTimeout(() => {
            this.listOfDisplayData = [...this.data];
            if (!selectedRow) {
              this.fromOldTable = this.selectedArticle;
              setTimeout(() => {
                this.tableComponent.selectRow(this.listOfDisplayData[0]);
              });
            }
          });
        }
      }
    });
  }

  //Triple Glass
  onSetTripleGlassTypesForSystem(): void {
    this.numberOfClicks = 0;
    this.isConfirmBtnDisabled = true;
    this.ArticlesForSystem = this.tripleData;
    this.loadData();
    this.listOfDisplayData = [...this.data];
    let selectedRow;
    if (this.fromOldTable) {
      selectedRow = this.listOfDisplayData.filter(row => row.article.composition == this.fromOldTable.composition)[0];
    } else
      selectedRow = this.listOfDisplayData.filter(row => row.article.composition == this.selectedArticle.composition)[0];
    this.fromOldTable = null;
    setTimeout(() => {
      if (this.configureService.applicationType == "SRS") {
        if (!selectedRow)
          selectedRow = this.listOfDisplayData[0];
        if (selectedRow && selectedRow.article)
          this.defaultSelectedKeys = [selectedRow.article.id];
        this.selectedChildNodeKey = selectedRow.article.id;
      } else {
        if (selectedRow && this.tableComponent) {
          this.tableComponent.selectRow(selectedRow);
        }
        else if (this.tableComponent) {
          this.tableComponent.checkboxCache.forEach(article => {
            article.selected = false;
          });
          this.listOfDisplayData = [];
          setTimeout(() => {
            this.listOfDisplayData = [...this.data];
            if (!selectedRow) {
              this.fromOldTable = this.selectedArticle;
              setTimeout(() => {
                this.tableComponent.selectRow(this.listOfDisplayData[0]);
              });
            }
          });
        }
      }

    });
  }

  //Panel Library Glass
  onSetPanelLibraryGlassTypesForSystem(): void {
    this.numberOfClicks = 0;
    this.isConfirmBtnDisabled = true;
    this.ArticlesForSystem = this.panelLibraryData;
    this.loadData();
    this.listOfDisplayData = [...this.data];

    let selectedRow;
    if (this.fromOldTable) {
      selectedRow = this.listOfDisplayData.filter(row => row.article.composition == this.fromOldTable.composition)[0];
    } else
      selectedRow = this.listOfDisplayData.filter(row => row.article.composition == this.selectedArticle.composition)[0];
    this.fromOldTable = null;

    setTimeout(() => {
      if (selectedRow && this.tableComponent) {
        this.tableComponent.selectRow(selectedRow);
      }
      else if (this.tableComponent) {
        this.tableComponent.checkboxCache.forEach(article => {
          article.selected = false;
        });
        this.listOfDisplayData = [];
        setTimeout(() => {
          this.listOfDisplayData = [...this.data];
          if (!selectedRow) {
            this.fromOldTable = this.selectedArticle;
            setTimeout(() => {
              this.tableComponent.selectRow(this.listOfDisplayData[0]);
            });
          }
        });
      }
    });
  }

  onOpenCustom(): void {
    this.openNewCustomEvent.emit(this.selectedArticle);
  }
  onOpenEditCustom(): void {
    this.openNewCustomEvent.emit(this.SelectedCustomRow);
  }

  onEditCustom(index: number): void {
    this.editCustomArticleEvent.emit({ article: this.listOfDisplayData[index], index: index });
  }
  SelectedCustomRow: any;
  onClickNew() {
    this.getConfigGrid("NEW");
    this.numberOfClicks = 0;
    this.isConfirmBtnDisabled = true;
    this.ArticlesForSystem = this.customLibraryData;
    this.loadData();
    this.listOfDisplayData = [...this.data];

    let selectedRow;
    if (this.fromOldTable) {
      selectedRow = this.listOfDisplayData.filter(row => row.article.composition == this.fromOldTable.composition)[0];
    } else
      selectedRow = this.listOfDisplayData.filter(row => row.article.composition == this.selectedArticle.composition
        && row.article.rw == this.selectedArticle.rw && row.article.uValue == this.selectedArticle.uValue)[0];
    if (!selectedRow && this.isCustomArticleUpdated && this.SelectedCustomRow) {
      selectedRow = this.listOfDisplayData[this.SelectedCustomRow.customGlassID];
      this.isCustomArticleUpdated = false;
    }

    this.fromOldTable = null;
    if (selectedRow) {
      if (this.unified3DModel.ModelInput.Geometry.CustomGlass !== undefined && this.unified3DModel.ModelInput.Geometry.CustomGlass !== null) {
        this.isEditCustomDisabled = false;
        this.SelectedCustomRow = this.unified3DModel.ModelInput.Geometry.CustomGlass[selectedRow.id];
      }
    }
    setTimeout(() => {
      if (selectedRow && this.tableComponent && this.listOfDisplayData.length > 0) {
        this.tableComponent.selectRow(selectedRow);
      }
      else if (this.tableComponent && this.listOfDisplayData.length > 0) {
        this.tableComponent.checkboxCache.forEach(article => {
          article.selected = false;
        });
        this.listOfDisplayData = [];
        setTimeout(() => {
          this.listOfDisplayData = [...this.data];
          if (!selectedRow) {
            this.fromOldTable = this.selectedArticle;
            setTimeout(() => {
              this.tableComponent.selectRow(this.listOfDisplayData[0]);
            });
          }
        });
      }
    });
  }

  onNewTypeSelection(type: string) {
    this.getConfigGrid();
    if (this.selectedType !== type) {
      this.selectedType = type;
      switch (this.selectedType) {
        case "double":
          this.onSetDoubleGlassTypesForSystem();
          break;
        case "triple":
          this.onSetTripleGlassTypesForSystem();
          break;
        case "panel":
          this.onSetPanelLibraryGlassTypesForSystem();
          break;
        case "new":
          this.onClickNew();
          break;
      }
      this.getSelectedRow();
      this.search();
    }
  }

  selectRow(article: any) {
    if (this.configureService.applicationType == "SRS") {
      let articleData = this.doubleData.filter(f => f.composition == article.article.composition);
      if (articleData.length === 0)
        articleData = this.tripleData.filter(f => f.composition == article.article.composition);
      this.selectedArticle = articleData[0];
    } else { 
      this.selectedArticle = article.article;
    }
    this.glazingSystemsId = this.selectedArticle.idArticle;
    if ((article.article.category == undefined || article.article.category === 'double') && this.doubleData.map(article => article.composition).includes(article.article.composition)) {
      this.selectedType = "double";
      this.onSetDoubleGlassTypesForSystem();
    }
    else if ((article.article.category == undefined || article.article.category === 'triple') && this.tripleData.map(article => article.composition).includes(article.article.composition)) {
      this.selectedType = "triple";
      this.onSetTripleGlassTypesForSystem();
    }
    else if ((article.article.category == undefined || article.article.category === 'panel') && this.panelLibraryData.map(article => article.composition).includes(article.article.composition)) {
      this.selectedType = "panel";
      this.onSetPanelLibraryGlassTypesForSystem();
    }
    else {
      this.customLibraryData = this.umService.ConvertCustomGlassData();
      this.selectedType = "new";
      if (this.customLibraryData === undefined) this.customLibraryData = [];
      this.customLibraryData = this.umService.ConvertCustomGlassData();
      //this.customLibraryData.push(article.article);
      setTimeout(() => {
        this.onNewTypeSelection('new');
        this.onClickNew();
      });
      //this.onSetCustomLibraryGlassTypesForSystem();
    }
  }

  bpsClick(event: NzFormatEmitEvent): void {
    if (event && event.node && event.node.isLeaf) {
      let articles = this.selectedType == 'double' ? this.doubleData.filter(x => x.id == event.node.key) :
        (this.selectedType == 'triple' ? this.tripleData.filter(x => x.id == event.node.key) : null);
      if (articles && articles.length == 1) {
        this.selectedArticle = articles[0];
        this.defaultSelectedKeys = event.keys;
        // this.disableConfirmBtn = this.selectedArticle[0].level == 0;
        this.isConfirmBtnDisabled = false;
      }
    } else this.isConfirmBtnDisabled = true;
  }

  onDblClickSRS(node: any, level: number) {
    if (level > 0) {
      this.bpsClick(node);
      this.onConfirm();
    }
  }

  Click(node: any): void {
    this.headerSelected = false;
    if (node && node.isLeaf) {
      let articles = this.selectedType == 'double' ? this.doubleData.filter(x => x.id == node.key) :
        (this.selectedType == 'triple' ? this.tripleData.filter(x => x.id == node.key) : null);
      this.selectedChildNodeKey = node.key;
      if (articles && articles.length == 1) {
        this.selectedArticle = articles[0];
        // this.defaultSelectedKeys = node.keys;
        if (this.defaultSelectedKeys === undefined || this.defaultSelectedKeys === null || this.defaultSelectedKeys === []) {
          this.defaultSelectedKeys = [];
          this.defaultSelectedKeys.push(node.key)
        }
        this.isConfirmBtnDisabled = false;
      }
    } else this.isConfirmBtnDisabled = true;
  }

  activeChange(event) {
    if (event === false) {
      this.selectedHeader = true;
    } else {
      this.selectedHeader = false;
    }
    this.headerSelected = true;
    if (event) {
      this.getSelectedRow();
    }
  }

  deleteLibraryCustomArticle(articleIndex) {
    this.unified3DModel.ModelInput.Geometry.CustomGlass.splice(this.SelectedCustomRow.customGlassID, 1);
    //this.unified3DModel.ModelInput.Geometry.CustomGlass.splice(articleIndex, 1);
    this.customLibraryData = this.umService.ConvertCustomGlassData();
    this.isEditCustomDisabled = false;
    this.onClickNew();
  }

  addLibraryCustomArticle(sectionElement) {
    if (this.customLibraryData === undefined) this.customLibraryData = [];
    this.customLibraryData = this.umService.ConvertCustomGlassData();
    this.onClickNew();
  }

  isCustomArticleUpdated = false;
  updateLibraryCustomArticle(data) {
    this.customLibraryData = this.umService.ConvertCustomGlassData();
    this.isEditCustomDisabled = false;
    this.isCustomArticleUpdated = true;
    this.onClickNew();
  }

}
