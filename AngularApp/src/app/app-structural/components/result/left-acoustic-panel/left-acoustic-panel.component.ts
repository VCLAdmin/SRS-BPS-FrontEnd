import { Component, OnInit, Input, OnChanges, SimpleChanges, OnDestroy, HostListener, ElementRef, ViewChild } from '@angular/core';
import { BpsUnifiedModel } from 'src/app/app-common/models/bps-unified-model';
import { ResultService } from 'src/app/app-structural/services/result.service';
import { Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { _ } from '@biesbjerg/ngx-translate-extract/dist/utils/utils';
import { LocalStorageService } from 'src/app/app-core/services/local-storage.service';
import { ConfigureService } from 'src/app/app-structural/services/configure.service';

@Component({
  selector: 'app-left-acoustic-panel',
  templateUrl: './left-acoustic-panel.component.html',
  styleUrls: ['./left-acoustic-panel.component.css']
})
export class LeftAcousticPanelComponent implements OnInit, OnChanges, OnDestroy {

  @Input() unified3DModel: any;
  constructor(
    private configureService: ConfigureService,
    private localStorageService: LocalStorageService, private resultService: ResultService, private translate: TranslateService, private elRef: ElementRef) { }
  onWheel(event: WheelEvent, aClass: string) {
    //create a new HTMLElement from nativeElement
    var hElement: HTMLElement = this.elRef.nativeElement;
    //now you can simply get your elements with their class name
    var allDivs = hElement.getElementsByClassName(aClass);
    //do something with selected elements
     allDivs[0].scrollLeft += event.deltaY; 
  }

  language: string = '';
  ngOnInit(): void {
    this.language = this.configureService.getLanguage();
    //this.GetAcousticResult();
  }

  ngOnDestroy() {

  }

  GetAcousticResult() {
    // this.acousticResultSubscription = this.resultService.acousticResultSubject.subscribe((response)=>{
    //   this.unified3DModel = response;
    // });

  }
  ngOnChanges(Changes: SimpleChanges): void {

  }

  getGlassList(glazingSystemId: number): string {
    //return this.unified3DModel.ModelInput.Geometry.GlassList.filter(glass => glass.GlazingSystemID === glazingSystemId).map(glass => " " + glass.GlassID).toString().trim();
    return this.getGroupedGlasses(this.unified3DModel.ModelInput.Geometry.Infills.filter(glass => glass.GlazingSystemID === glazingSystemId).map(glass => glass.InfillID));
  }

  getGroupedGlasses(array: any[]) {
    array = array.sort(function (a, b) { return a - b });
    array = [...new Set(array)];
    const arraySize = array.length;
    const arr = [];
    let i = 0;
    let j = array[0];
    let jSize = array[arraySize - 1];
    let res = '';
    while (j < jSize) {
      if (array[i] === j) {
        res += array[i] + '-';
        i += 1;
      }
      else {
        arr.push(j);
        if (res.substring(res.length - 1) === '-')
          res = res.substring(0, res.length - 1);
        res += ',';
      }
      j++;
    }
    let unFilteredResult = (res + array[array.length - 1]).split(',');
    let finalResult = [];
    unFilteredResult.forEach(group => {
      group = group.trim();
      let groupList = group.split('-');
      if (groupList.length > 1)
        group = groupList[0] + '-' + groupList[groupList.length - 1];
      finalResult.push(group);
    });
    unFilteredResult = finalResult.filter(f => f !== "").map(glass => glass.trim());
    // if(unFilteredResult.length = 2)
    //   return unFilteredResult.filter(f => f !== "").join('-');
    // else 
    return unFilteredResult.filter(f => f !== "").join(', ');
  }
  hasGlazingSystem(glazingSystemId: number): boolean {
    return this.unified3DModel.ModelInput.Geometry.Infills.filter(glass => glass.GlazingSystemID === glazingSystemId).length > 0

  }

  getGlassRw(glazingSystemId: number): number {
    return this.unified3DModel.ModelInput.Geometry.GlazingSystems.filter(GlazingSystem => GlazingSystem.GlazingSystemID === glazingSystemId)[0].Rw
  }

  getPlatesValue(glazingSystemId: number, index: number) {
    if (this.unified3DModel.ModelInput.Geometry.GlazingSystems.filter(GlazingSystem => GlazingSystem.GlazingSystemID === glazingSystemId).map(GlazingSystem => GlazingSystem.Plates)[0][index]) {
      return this.unified3DModel.ModelInput.Geometry.GlazingSystems.filter(GlazingSystem => GlazingSystem.GlazingSystemID === glazingSystemId).map(GlazingSystem => GlazingSystem.Plates)[0][index].H;
    } else {
      return false;
    }
  }

  getCavitiesValue(glazingSystemId: number, index: number) {
    if (this.unified3DModel.ModelInput.Geometry.GlazingSystems.filter(GlazingSystem => GlazingSystem.GlazingSystemID === glazingSystemId).map(GlazingSystem => GlazingSystem.Cavities)[0][index]) {
      return this.unified3DModel.ModelInput.Geometry.GlazingSystems.filter(GlazingSystem => GlazingSystem.GlazingSystemID === glazingSystemId).map(GlazingSystem => GlazingSystem.Cavities)[0][index].Lz;
    } else {
      return false;
    }
  }

  getPlatesDescription(glazingSystemId: number, index: number) {
    if (this.unified3DModel.ModelInput.Geometry.GlazingSystems.filter(GlazingSystem => GlazingSystem.GlazingSystemID === glazingSystemId).map(GlazingSystem => GlazingSystem.Plates)[0][index]) {
      let glazingSystemPlate = this.unified3DModel.ModelInput.Geometry.GlazingSystems.filter(GlazingSystem => GlazingSystem.GlazingSystemID === glazingSystemId).map(GlazingSystem => GlazingSystem.Plates)[0][index];
      let pvbValue = glazingSystemPlate.InterH && glazingSystemPlate.InterH > 0 ? glazingSystemPlate.InterH : "";
      let pvbValByCulture = pvbValue ? (this.language === "DE" || this.language === "de-DE" ? pvbValue.toString().replace('.', ',') : pvbValue) : pvbValue;
      if (glazingSystemPlate.Material.toLowerCase() == "glass" || glazingSystemPlate.Material.toLowerCase() == "lamiacousticpvb") {
        if (pvbValByCulture)
          return this.translate.instant(_('result.glass')) + " (" + pvbValByCulture + "mm " + this.translate.instant(_('configure.acoustic')) + " PVB)";
        return this.translate.instant(_('result.glass'));
      }
      // return this.unified3DModel.ModelInput.Geometry.GlazingSystems.filter(GlazingSystem => GlazingSystem.GlazingSystemID === glazingSystemId).map(GlazingSystem => GlazingSystem.Plates)[0][index].Material
    } else {
      return false;
    }
  }

  getCavitiesDescription(glazingSystemId: number, index: number) {
    if (this.unified3DModel.ModelInput.Geometry.GlazingSystems.filter(GlazingSystem => GlazingSystem.GlazingSystemID === glazingSystemId).map(GlazingSystem => GlazingSystem.Cavities)[0][index]) {
      // if (this.unified3DModel.ModelInput.Geometry.GlazingSystems.filter(GlazingSystem => GlazingSystem.GlazingSystemID === glazingSystemId).map(GlazingSystem => GlazingSystem.Cavities)[0][index].CavityType.toLowerCase() == "air") {
      //   return this.translate.instant(_('result.air'));
      if (this.unified3DModel.ModelInput.Geometry.GlazingSystems.filter(GlazingSystem => GlazingSystem.GlazingSystemID === glazingSystemId).map(GlazingSystem => GlazingSystem.Cavities)[0][index].CavityType) {
        return "Argon";
      }
      // return this.unified3DModel.ModelInput.Geometry.GlazingSystems.filter(GlazingSystem => GlazingSystem.GlazingSystemID === glazingSystemId).map(GlazingSystem => GlazingSystem.Cavities)[0][index].CavityType
    } else {
      return false;
    }
  }

}
