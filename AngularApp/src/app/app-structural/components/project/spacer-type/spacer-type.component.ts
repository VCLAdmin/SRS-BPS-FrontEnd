import { Component, OnInit, ViewChild, AfterViewInit, EventEmitter, Input, OnDestroy } from '@angular/core';
import { NzTreeNodeOptions, NzFormatEmitEvent } from 'ng-zorro-antd';
import { BpsTreeComponent } from 'bps-components-lib';
import { TranslateService } from '@ngx-translate/core';
import { _ } from '@biesbjerg/ngx-translate-extract/dist/utils/utils';
import { ConfigureService } from 'src/app/app-structural/services/configure.service';
import { LocalStorageService } from 'src/app/app-core/services/local-storage.service';
import { ConfigPanelsService } from 'src/app/app-structural/services/config-panels.service';
import { PanelsModule } from 'src/app/app-structural/models/panels/panels.module';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-spacer-type',
  templateUrl: './spacer-type.component.html',
  styleUrls: ['./spacer-type.component.css']
})
export class SpacerTypeComponent implements OnInit, AfterViewInit, OnDestroy {
  private destroy$ = new Subject<void>();

  isPopoutOpened: boolean = false;
  articleSelected: any;
  disableConfirmBtn: boolean = false;
  @ViewChild('bpsTreeComponent', { static: false }) bpsTreeComponent: BpsTreeComponent;
  @Input() confirmSpacerTypeEvent: EventEmitter<any>;
  defaultSelectedKeys = ['1.1'];
  defaultExpandedKeys = ['100'];

  nodes: NzTreeNodeOptions[];
  language: string = 'en-US';

  constructor(
    private cpService: ConfigPanelsService,
    private translate: TranslateService,
    private configureService: ConfigureService,
    private localStorageService: LocalStorageService) { }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
  ngOnInit(): void {
    this.language = (this.localStorageService.getValue('culture')) ? this.localStorageService.getValue('culture') : 'en-US';

   /**
   * This is observable of Pop outs of all the child components is set to the variable which is used to open and close the pop out
   *
   */
    this.cpService.obsPopout.pipe(takeUntil(this.destroy$)).subscribe(
      response => {
        if (response.panelsModule === PanelsModule.SpacerType) {
          this.isPopoutOpened = response.isOpened;
          if (response.isOpened)
            this.onOpenCloseSpacerTypePopout();
          else if (!this.isPopoutOpened) 
            this.onClose(); }
      });
    
    this.nodes = [
      {
        title: this.language && this.language=='de-DE'?'/assets/Images/spacer-type/generalspacers_de_enabled.svg':'/assets/Images/spacer-type/generalspacers_enabled.svg',
        key: '100',
        children: [
          { title: this.translate.instant(_('configure.spacer-general-aluminium-spacer')), key: '1', isLeaf: true },  // no translation required
          { title: this.translate.instant(_('configure.spacer-general-steel-spacer')), key: '2', isLeaf: true },
          { title: this.translate.instant(_('configure.spacer-general-thermally-spacer')), key: '3', isLeaf: true, disabled: false }
        ]
      },
      {
        title: '/assets/Images/spacer-type/allmetal_enabled.svg',
        key: '200',
        children: [
          { title: "GTS", key: '11', isLeaf: true }
        ]
      },
      {
        title: '/assets/Images/spacer-type/edgetech_enabled.svg',
        key: '300',
        children: [
          { title: "Super Spacer TriSeal / T-Spacer Premium", key: '21', isLeaf: true },
          { title: "Super Spacer TriSeal / T-Spacer Premium Plus", key: '22', isLeaf: true },
          { title: "Super Spacer TruPlas", key: '23', isLeaf: true }
        ]
      },
      {
        title: '/assets/Images/spacer-type/ensinger_enabled.svg',
        key: '400',
        children: [
          { title: 'Thermix TX.N plus', key: '31', isLeaf: true }
        ]
      },
      {
        title: '/assets/Images/spacer-type/fenzi_enabled.svg',
        key: '500',
        children: [
          { title: 'Butylver TPS', key: '41', isLeaf: true }
        ]
      },
      {
        title: '/assets/Images/spacer-type/helima_enabled.svg',
        key: '600',
        children: [
          { title: 'Nirotec 017', key: '51', isLeaf: true },
          { title: 'Nirotec EVO', key: '52', isLeaf: true }
        ]
      },
      {
        title: '/assets/Images/spacer-type/igk_enabled.svg',
        key: '700',
        children: [
          { title: 'IGK 611', key: '61', isLeaf: true }
        ]
      },
      {
        title: '/assets/Images/spacer-type/kommerling_enabled.svg',
        key: '800',
        children: [
          { title: 'Ködispace', key: '71', isLeaf: true },
          { title: 'Ködispace 4SG', key: '72', isLeaf: true }
        ]
      },
      {
        title: '/assets/Images/spacer-type/rolltech_enabled.svg',
        key: '900',
        children: [
          { title: 'Multitech', key: '81', isLeaf: true },
          { title: 'Multitech G', key: '82', isLeaf: true },
          { title: 'Chromatech', key: '83', isLeaf: true },
          { title: 'Chromatech Plus', key: '84', isLeaf: true },
          { title: 'Chromatech ultra F', key: '85', isLeaf: true }
        ]
      },
      {
        title: '/assets/Images/spacer-type/swisspacer_enabled.svg',
        key: '10000',
        children: [
          { title: 'Swisspacer', key: '91', isLeaf: true },
          { title: 'Swisspacer Ultimate', key: '92', isLeaf: true },
          { title: 'Swisspacer Advance', key: '93', isLeaf: true }
        ]
      },
      {
        title: '/assets/Images/spacer-type/technoform_enabled.svg',
        key: '11000',
        children: [
          { title: 'TGI-Spacer M', key: '101', isLeaf: true }
        ]
      },
      {
        title: '/assets/Images/spacer-type/thermoseal_enabled.svg',
        key: '12000',
        children: [
          { title: 'Thermobar', key: '111', isLeaf: true }
        ]
      }
    ];
  }

 /**
 * This function is called when we open and close the spacer type and it is used to set the default value
 *
 */
  onOpenCloseSpacerTypePopout() {
    this.defaultExpandedKeys = [];
    this.defaultSelectedKeys.forEach(key => {
      this.defaultExpandedKeys.push(this.nodes.filter(node => node.children.map(child => child.key).includes(key))[0].key);
    });
  }

 /**
 * This function will close the spacer type pop out
 *
 */
  onClose() {
    if (this.isPopoutOpened) this.cpService.setPopout(false, PanelsModule.SpacerType);
  }

 /**
 * This function is called when we click on the node
 *
 */
  bpsClick(event: NzFormatEmitEvent): void {
    this.articleSelected = event.selectedKeys;
    this.defaultSelectedKeys = event.keys;
    this.disableConfirmBtn = this.articleSelected[0].level == 0;

  }

  bpsCheckBoxChange(event: NzFormatEmitEvent): void {

  }

 /**
 * This function is called when we expand the nodes in the spacer component
 *
 */
  bpsExpandChange(event: NzFormatEmitEvent): void {
    if (event.keys.length == 2) {
      this.defaultExpandedKeys = [event.node.key];
    }

  }

  bpsSelect(keys: string[]): void {

  }

  ngAfterViewInit(): void {
    // console.log(
    //   this.bpsTreeComponent.getTreeNodes(),
    //   this.bpsTreeComponent.getSelectedNodeList(),
    //   this.bpsTreeComponent.getExpandedNodeList()
    // );
  }

  /**
   * This function will send the information of the row selected  to the parent component service to update the Spacer type info.
   * The table is also closed.
   */
  onConfirmSpacerType() {
    this.confirmSpacerTypeEvent.emit(this.articleSelected);
    this.onClose();
  }

  /**
   * This function is used to get the article selected based on the given key and sends the selected article to parent component
   * @param {string} key it has the key value 
   */
  getSpacerTypeByKey(key: string) {
    this.defaultSelectedKeys = [key];
    this.defaultExpandedKeys = [this.nodes.filter(node => node.children.map(child => child.key).includes(key))[0].key];
    this.articleSelected = [{ key: key, origin: { title: this.nodes.filter(node => node.children.map(child => child.key).includes(key))[0].children.filter(child => child.key == key)[0].title } }];
    this.onConfirmSpacerType();
  }

  /**
   * When the user double clicks on a row of the table, the row is selected and sent to the parent component
   * @param event Information stored in the row of the table
   */
  onDblClickRow(event) {
    if(event.node.level > 0){
      this.bpsClick(event);
      this.confirmSpacerTypeEvent.emit(this.articleSelected);
      this.onConfirmSpacerType();
    }
  }

  /**
   * When the user clicks on the confirm button or double clicks on a row, the information of the row selected is sent to the configure service to update the Spacer type info.
   */
  onConfirm() {
    this.configureService.computeClickedSubject.next(false);
    this.onConfirmSpacerType();
  }
}
