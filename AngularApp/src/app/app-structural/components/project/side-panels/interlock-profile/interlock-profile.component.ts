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

@Component({
  selector: 'app-interlock-profile',
  templateUrl: './interlock-profile.component.html',
  styleUrls: ['./interlock-profile.component.css']
})

export class InterlockProfileComponent implements OnInit, OnDestroy, AfterViewInit {
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
    /**
     * Whenever the UM is changed somewhere, this observable updates the UM of this table.
     */
    this.umService.obsUnifiedModel.pipe(takeUntil(this.destroy$)).subscribe(
      response => {
        if (response) {
          this.unified3DModel = response;
        }
      });
    /**
     * Whenever the system is changed, this observable updates the system of this table.
     */
    this.cpService.obsSystem.pipe(takeUntil(this.destroy$)).subscribe(
      response => {
        this.systemSelected = response.data;
      });
    /**
     * This observable handles the display of the table.
     * If the table is opened, the table properties are set and parsed to the bps component with the getConfigGrid() function.
     */
    this.cpService.obsPopout.pipe(takeUntil(this.destroy$)).subscribe(
      response => {
        if (this.unified3DModel !== undefined && response.panelsModule === PanelsModule.InterlockSliding) {
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
  /**
   * Set the properties of the bps table component for the HTML code
   */
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

  /**
   * This function is to restrict the execution of Code for multiple times click of the button
   * @param $event
   */
   preventDefault($event: Event) {
    $event.preventDefault();
    $event.stopImmediatePropagation();
  }

  onHover(index, value) {
    this.listOfDisplayData[index].outside.context.arrowHovered = value;
  }

  log($event) {
  }

  /**
   * Sorting by sortName with the method (ascend or descend) sortValue
   * @param sort Properties of the sorting
   */
   sort(sort: { sortName: string; sortValue: string }): void {
    this.sortName = sort.sortName;
    this.sortValue = sort.sortValue;
    this.search();
  }

  /**
   * The function stores the search text in the searchValue variable, and then calls the search function to make the filtering.
   * @param {string} value Text entered by the user to filter the articles 
   */
   filter(value: string): void {
    this.searchValue = value;
    this.search();
  }

  /**
   * Rearrange the order of the articles displayed in the table.
   * 1. The articles are filtered according to the search text entered by the user
   * 2. If there are sort properties, the selected articles are sorted depending of the sort properties and then displayed in the table
   * 3. If there are no sort properties, the selected articles are directly displayed in the table.   * 
   */
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
  /**
   * Makes sure the table knows the system selected before collecting the articles related to the system.
   */
  onPopoutOpened() {
    if (!this.systemSelected) {
      this.systemSelected = this.cpService.currentSystem;
    }
    if (this.unified3DModel.ProblemSetting.ProductType == "SlidingDoor") {
      this.collectData(this.systemSelected.Images);
    }
  }

  /**
   * Collect the articles linked to the system from the local storage or the server and rearrange the data in the fillData function.
   * @param system system selected in the framing section
   */
   collectData(system: string) {
    this.showSection = false;
    if (system.includes("ase")) {
      if (localStorage.getItem('interlock_' + system)) {
        this.fillData(localStorage.getItem('interlock_' + system));
      } else {
        this.fService.getASEArticlesList(system).pipe(takeUntil(this.destroy$)).subscribe(data => {
          localStorage.setItem('interlock_' + system, data);
          this.fillData(data);
        });
      }
    }
  }

  /**
   * The table is displayed only when we have the data.
   * The articles information is mapped in the getTableData before getting displayed in the table component.
   * 
   * Once the table is displayed (have to wait first with a setTimeout() ), only then we make one row selectioned and the search text empty with no filtering in the data.
   * @param dataList List of all the articles collected
   */
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

  /**
   * Map the data to fit the properties of the table and its columns.
   * And then store the mapped data in the variable listOfDisplayData, which is parsed in the HTML code of the table component.
   * Calls the function getSelectedIndex() to know the index of which row should be selectioned by default.
   * @param data 
   */
   getTableData(data: any[]) {
    this.data = [];
    let maxDepth = this.fService.getMaxDepth(this.unified3DModel);
    data.filter(article => article.System == this.systemSelected.Value && article.ProfileType == "Vent Frame").forEach((article, index) => {
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
    this.listOfDisplayData = [...this.data];
    this.getSelectedIndex();
  }

  /**
   * After searching and filtering the articles, we need to reselect the row which was selected before these events
   * So we first try to get the index of the selected row, and if the selected row is still in the filtered rows (selectedIndex > -1)
   * Then we make the table selecting the row
   */
   getSelectedIndexAfterSearch() {
    let savedData = this.umService.obj_InterlockSliding();
    if (savedData) {
      this.selectedIndex = this.listOfDisplayData.map(article => article.description).indexOf(savedData.ArticleName);
    }
    setTimeout(() => {
      if (this.selectedIndex > -1 && this.tableComponent) this.tableComponent.selectRow(this.listOfDisplayData[this.selectedIndex]);
    }, 100);
  }

  /**
   * To know the index of which row of the table should be selectioned by default.
   */
   getSelectedIndex() {
    // TO DO
    let savedData = this.umService.obj_InterlockSliding();
    this.selectedIndex = 0;
    if (savedData) {
      this.selectedIndex = this.listOfDisplayData.map(article => article.description).indexOf(savedData.ArticleName);
    }
    if (this.selectedIndex < 0) {
      this.selectedIndex = 0;
    }
    // let os = this.unified3DModel.ModelInput.Geometry.OperabilitySystems;
    // if (os && os.filter(glass => (glass.InsertOuterFrameArticleName === null || glass.InsertOuterFrameArticleName == undefined) && glass.InsertOuterFrameArticleName !== '-1').length > 0) {
    //   this.onConfirm();
    // }
  }
  //#endregion
  
  //#region events
  selectionChange($event) { }

  /**
   * Before closing the table, the search text is cleared for when the user reopens the table all the articles are displayed.
   */
   onClose(): void {
    if (this.tableComponent) { this.tableComponent.inputElement.nativeElement.value = ''; }
    this.searchValue = '';
    this.search();
    if (this.isPopoutOpened) this.cpService.setPopout(false, PanelsModule.InterlockSliding);
  }

  /**
   * When the user clicks on a row of the table
   * @param event Information stored in the row of the table
   */
   onclickRow(event) { //onSelectInterlockArticle
    this.selectedIndex = parseInt(event.id);
    if (this.selectedIndex < 0)
      this.selectedIndex = 0;
  }

  /**
   * When the user double clicks on a row of the table, the row is selected and confirmed
   * @param event Information stored in the row of the table
   */
   ondblclickRow(event) { //onDblClickRow
    this.tableComponent.selectRow(event);
    this.onConfirm();
  }

  /**
   * When the user clicks on the confirm button or double clicks on a row, the information of the row selected is sent to the unified model service to update the douvle vent frame property.
   * The table is also closed.
   */
   onConfirm() {
    this.umService.set_InterlockFrame(this.listOfDisplayData[this.selectedIndex]);
    this.onClose();
  }
  //#endregion
}
