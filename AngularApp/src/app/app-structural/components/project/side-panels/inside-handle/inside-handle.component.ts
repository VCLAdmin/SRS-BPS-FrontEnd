import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, SimpleChanges, TemplateRef, ViewChild } from '@angular/core';
import { BpsTableComponent, CeldType } from 'bps-components-lib';
import { BpsUnifiedModel } from 'src/app/app-common/models/bps-unified-model';
import { UnifiedModelService } from 'src/app/app-structural/services/unified-model.service';
import { ConfigPanelsService } from 'src/app/app-structural/services/config-panels.service';
import { PanelsModule } from 'src/app/app-structural/models/panels/panels.module';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FramingService } from 'src/app/app-structural/services/framing.service';
import { TranslateService } from '@ngx-translate/core';
import { ConfigureService } from 'src/app/app-structural/services/configure.service';
import { _ } from '@biesbjerg/ngx-translate-extract/dist/utils/utils';

@Component({
  selector: 'app-inside-handle',
  templateUrl: './inside-handle.component.html',
  styleUrls: ['./inside-handle.component.css']
})
export class InsideHandleComponent implements OnInit, OnDestroy, AfterViewInit {
  unified3DModel: BpsUnifiedModel;

  systemSelected: any;
  adsSystemType: boolean = false;

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
  @ViewChild('uValueTemplate', { read: TemplateRef, static: true }) uValueTemplate: TemplateRef<{}>;
  @ViewChild('rwTemplate', { read: TemplateRef, static: true }) rwTemplate: TemplateRef<{}>;
  @ViewChild('bpsTable', { read: BpsTableComponent, static: false }) tableComponent: BpsTableComponent<{}>;
  showSection: boolean = false;
  count: number = 0;
  //#endregion

  constructor(
    private translate: TranslateService,
    public fService: FramingService,
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
        if (this.unified3DModel !== undefined && response.panelsModule === PanelsModule.InsideHandle) {
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
          display: 'Description',
          property: 'descriptionDisplay',
          width: '215px',
          showSort: true
        },
        {
          celdType: CeldType.Default,
          display: 'Color',
          property: 'ColorDisplay',
          width: '85px',
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
      return item.ArticleNumber.indexOf(this.searchValue) !== -1;
    };
    const data = this.data.filter((item: { description: string; ArticleNumber: string; Color: string }) => filterFunc(item));
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
    this.count += 1;
    if (!this.systemSelected) {
      this.systemSelected = this.cpService.currentSystem;
    }
    if (this.unified3DModel.ProblemSetting.ProductType == "Window" || this.unified3DModel.ProblemSetting.ProductType == "SlidingDoor") {
      this.collectData(this.systemSelected.Images);
    }
  }

  collectData(system: string) {
    this.showSection = false;
    if(this.systemSelected.Description.includes('ADS')) {
      if (localStorage.getItem('DoorHandleArticles_')) {
        this.fillData(localStorage.getItem('DoorHandleArticles_'), system);
      } else {
        this.fService.GetDoorHandleArticles().pipe(takeUntil(this.destroy$)).subscribe(data => {
          localStorage.setItem('DoorHandleArticles_', JSON.stringify(data));
          this.fillData(JSON.stringify(data), system);
        });
      }
    } else if(this.systemSelected.Description.includes('AWS')) {
      if (localStorage.getItem('DoorHandleArticles_')) {
        this.fillData(localStorage.getItem('DoorHandleArticles_'), system);
      } else {
        this.fService.GetDoorHandleArticles().pipe(takeUntil(this.destroy$)).subscribe(data => {
          localStorage.setItem('DoorHandleArticles_', JSON.stringify(data));
          this.fillData(JSON.stringify(data), system);
        });
      }

    } else {
      if (localStorage.getItem('SlidingDoorArticles_')) {
        this.fillData(localStorage.getItem('SlidingDoorArticles_'), system);
      } else {
        this.fService.GetDoorHandleArticles().pipe(takeUntil(this.destroy$)).subscribe(data => {
          localStorage.setItem('SlidingDoorArticles_', JSON.stringify(data));
          this.fillData(JSON.stringify(data), system);
        });
      }
    } 
  }

  fillData(dataList: any, system: string) {
    let data = JSON.parse(dataList);
    if (system.includes("ads")) {
      data = data.filter(x => (x.Type === 'Door Handle' && x.Description === 'Door Handle'));
    }
    else if (system.includes("aws")) {
      data = data.filter(x => x.Type === 'Window Handle');
    }
    else if (system.includes("ase")) {
      data = data.filter(x => x.Description === "Crank Handle")
    }
    this.showSection = true;

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
    data.forEach((article, index) => {
      this.data.push({
        id: '' + index,
        description: article.Description,
        descriptionDisplay: article.Description + ' - ' + article.ArticleName,
        Color: article.Color,
        ColorDisplay: article.Color.split("-")[0].trim(),
        ArticleNumber: article.ArticleName,
        disabled: false,
        bpsTable4CustomRow: false,
        imageSRC: (article.Description + '_' + article.ColorCode + '_' + article.ArticleName + '.png').split(' ').join('_')
      });
    });
    this.listOfDisplayData = [...this.data];
    this.getSelectedIndex();
  }

  getSelectedIndexAfterSearch() {
    let savedData;
    let objOperabilitySystem;
    if(this.systemSelected.Description.includes('ADS') || this.systemSelected.Description.includes('AWS')) 
    objOperabilitySystem = this.umService.obj_OperabilitySystem(this.cpService.selectedPicker);
    else
    objOperabilitySystem = this.umService.obj_OperabilitySystem(1);
    if (objOperabilitySystem.DoorSystemID == -1) {
      savedData = objOperabilitySystem;
    }
    else if (objOperabilitySystem.SlidingDoorSystemID !== -1)
      savedData = this.umService.obj_SlidingDoor(objOperabilitySystem.SlidingDoorSystemID);
    else
      savedData = this.umService.obj_Door(objOperabilitySystem.DoorSystemID);
    if (savedData) {
      this.selectedIndex =  this.listOfDisplayData.map(article => article.ArticleNumber).indexOf(savedData.InsideHandleArticleName);
    }
    setTimeout(() => {
      if (this.selectedIndex > -1 && this.tableComponent) this.tableComponent.selectRow(this.listOfDisplayData[this.selectedIndex]);
    },100);
  }


  getSelectedIndex() {
    let savedData;
    let objOperabilitySystem;
    if (this.systemSelected.Description.includes('ADS') || this.systemSelected.Description.includes('AWS')) {
      console.log('picker', this.cpService.selectedPicker);
      objOperabilitySystem = this.umService.obj_OperabilitySystem(this.cpService.selectedPicker);
    }
    else
      objOperabilitySystem = this.umService.obj_OperabilitySystem(this.cpService.selectedPicker);
    if (objOperabilitySystem.DoorSystemID == -1)
      savedData = objOperabilitySystem;
    else if (objOperabilitySystem.SlidingDoorSystemID && objOperabilitySystem.SlidingDoorSystemID !== -1)
      savedData = this.umService.obj_SlidingDoor(objOperabilitySystem.SlidingDoorSystemID);
    else
      savedData = this.umService.obj_Door(objOperabilitySystem.DoorSystemID);
    this.selectedIndex = 0;
    if (savedData) {
      this.selectedIndex =  this.listOfDisplayData.map(article => article.ArticleNumber).indexOf(savedData.InsideHandleArticleName);
    }
    if (this.selectedIndex < 0)
      this.selectedIndex = 0;

    let ds: any;
    if (this.systemSelected.Description.includes('ADS')) {
      ds = this.unified3DModel.ModelInput.Geometry.DoorSystems;
      if (ds && ds.filter(glass => glass.InsideHandleArticleName === null || glass.InsideHandleArticleName === undefined).length > 0) {
        this.onConfirm();
      }
    } else if(this.systemSelected.Description.includes('AWS')) {
      ds = this.unified3DModel.ModelInput.Geometry.OperabilitySystems;
      if (ds && ds.filter(glass => glass.InsideHandleArticleName === null || glass.InsideHandleArticleName === undefined).length > 0) {
        this.onConfirm();
      }
    } else {
      ds = this.unified3DModel.ModelInput.Geometry.SlidingDoorSystems;
      if(this.count === 1)
        this.onConfirm();
      // if (ds && ds.filter(glass => glass.InsideHandleArticleName === null || glass.InsideHandleArticleName === undefined).length > 0) {
      //   this.onConfirm();
      // }
    }
   
  }
  //#endregion

  //#region events
  selectionChange($event) { }

  onClose(): void {
    if (this.tableComponent) { this.tableComponent.inputElement.nativeElement.value = ''; }
    this.searchValue = '';
    if (this.isPopoutOpened) this.cpService.setPopout(false, PanelsModule.InsideHandle);
  }

  onclickRow(event) {
    this.selectedIndex = parseInt(event.id);
    if (this.selectedIndex < 0)
      this.selectedIndex = 0;
  }

  ondblclickRow(event) { //onDblClickRow
    this.tableComponent.selectRow(event);
    this.onConfirm();
  }

  onConfirm() {
    if(this.systemSelected.Description.includes('ADS') ||  this.systemSelected.Description.includes('AWS')) {
      this.umService.set_InsideHandle(this.listOfDisplayData[this.selectedIndex], this.cpService.selectedPicker);
      // if(this.unified3DModel.ModelInput.Geometry.OperabilitySystems.filter( o => o.OperabilitySystemID === this.cpService.selectedPicker + 1). length > 0){
      //   this.umService.set_InsideHandle(this.listOfDisplayData[this.selectedIndex], this.cpService.selectedPicker);
      // } else {
      //   this.umService.set_InsideHandle(this.listOfDisplayData[this.selectedIndex], this.cpService.selectedPicker - 1);
      // }
      
     } else {
       this.umService.set_InsideHandleForSlidingDoors(this.listOfDisplayData[this.selectedIndex]);
     }
     this.onClose();
  }
  //#endregion

}
