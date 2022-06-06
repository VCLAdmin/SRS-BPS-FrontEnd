import { Component, OnInit, Input, Output, EventEmitter, OnDestroy, OnChanges, SimpleChanges, ElementRef, ViewChild } from '@angular/core';
import { ThermalResult, ThermalOutput, ThermalFrame, FrameSeg, ThermalInsertUnitFrame, ThermalGlass, ThermalGlassEdge, ThermalPanel, ThermalPanelEdge} from 'src/app/app-common/models/bps-thermal-result';
import { BpsUnifiedModel } from 'src/app/app-common/models/bps-unified-model';
import { ResultService } from 'src/app/app-structural/services/result.service';
import { Subject, Subscription } from 'rxjs';
import { LocalStorageService } from 'src/app/app-core/services/local-storage.service';
import { ConfigureService } from 'src/app/app-structural/services/configure.service';

@Component({
  selector: 'app-left-thermal-panel',
  templateUrl: './left-thermal-panel.component.html',
  styleUrls: ['./left-thermal-panel.component.css']
})
export class LeftThermalPanelComponent implements OnInit, OnDestroy, OnChanges {
  private destroy$ = new Subject<void>();
  constructor(
    private configureService: ConfigureService, private resultService: ResultService, private localStorageService: LocalStorageService, private elRef: ElementRef) { }
  onWheel(event: WheelEvent, aClass: string) {
    //create a new HTMLElement from nativeElement
    var hElement: HTMLElement = this.elRef.nativeElement;
    //now you can simply get your elements with their class name
    var allDivs = hElement.getElementsByClassName(aClass);
    //do something with selected elements
     allDivs[0].scrollLeft += event.deltaY; 
  }
  
  @Input() selectedThermalResultLabel: number;
  @Input() unified3DModel: BpsUnifiedModel;
  thermalResult: ThermalResult;

  bpsThermalResult: ThermalResult;

  glassGlazingSystemIds: number[] = [];
  language: string;
  insertedUnitsPerSystemList: InsertedUnitPerSystem[]= [];
  alphabetCounter = [ 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z' ];
  ngOnInit(): void {
    this.GetThermalResults();
  }
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
  ngOnChanges(Changes: SimpleChanges) {
    if (Changes.unified3DModel && !Changes.unified3DModel.firstChange) {
      this.GetThermalResults();
    }
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

  GetThermalResults() {
    this.language = this.configureService.getLanguage();
    if (this.unified3DModel && this.unified3DModel.AnalysisResult && this.unified3DModel.AnalysisResult.ThermalResult) {
      this.bpsThermalResult = this.unified3DModel.AnalysisResult.ThermalResult;
      if (this.bpsThermalResult && this.bpsThermalResult.ThermalUIResult) {
        if (this.bpsThermalResult.ThermalUIResult.ThermalFrames)
          this.bpsThermalResult.ThermalUIResult.ThermalFrames.forEach(frame => {
            let val = frame.Uf.toString().split('.');
            if (val[0] && val[1] && parseInt(val[0]) > 0 && val[1].length > 1) {
              if(val[1].length == 2) {
               frame.Uf = val[1] === '65' ? 1.6503 : frame.Uf;
                frame.Uf = parseFloat(frame.Uf.toFixed(1));
              } else {
                frame.Uf = parseFloat(frame.Uf.toFixed(1));
              }
             
            }
          });
        if (this.bpsThermalResult.ThermalUIResult.ThermalUIGlasses)
          this.bpsThermalResult.ThermalUIResult.ThermalUIGlasses.forEach(glass => {
            let val = glass.Ug.toString().split('.');
            if (val[0] && val[1] && parseInt(val[0]) > 0 && val[1].length > 1) {
              glass.Ug = parseFloat(glass.Ug.toFixed(1));
            }
          });
        if (this.bpsThermalResult.ThermalUIResult.ThermalUIGlassEdges)
          this.bpsThermalResult.ThermalUIResult.ThermalUIGlassEdges.forEach(glassEdge => {
            let val = glassEdge.Psi.toString().split('.');
            if (val[0] && val[1] && parseInt(val[0]) > 0 && val[1].length > 1) {
              glassEdge.Psi = parseFloat(glassEdge.Psi.toFixed(1));
            }
          });

        if (this.bpsThermalResult.ThermalUIResult.ThermalFacadeMembers)
          this.bpsThermalResult.ThermalUIResult.ThermalFacadeMembers.forEach(frame => {
            let val = frame.Uf.toString().split('.');
            if (val[0] && val[1] && parseInt(val[0]) > 0 && val[1].length > 1) {
              frame.Uf = parseFloat(frame.Uf.toFixed(1));
            }
          });
        if (this.bpsThermalResult.ThermalUIResult.ThermalUIFacadeGlassEdges)
          this.bpsThermalResult.ThermalUIResult.ThermalUIFacadeGlassEdges.forEach(glass => {
            let val = glass.PsiH.toString().split('.');
            if (val[0] && val[1] && parseInt(val[0]) > 0 && val[1].length > 1) {
              glass.PsiH = parseFloat(glass.PsiH.toFixed(1));
              glass.PsiV = parseFloat(glass.PsiH.toFixed(1));
            }
            val = glass.PsiV.toString().split('.');
            if (val[0] && val[1] && parseInt(val[0]) > 0 && val[1].length > 1) {
              glass.PsiV = parseFloat(glass.PsiV.toFixed(1));
            }
          });
        if (this.bpsThermalResult.ThermalUIResult.ThermalUIPanels)
          this.bpsThermalResult.ThermalUIResult.ThermalUIPanels.forEach(panel => {
            let val = panel.Up.toString().split('.');
            if (val[0] && val[1] && parseInt(val[0]) > 0 && val[1].length > 1) {
              panel.Up = parseFloat(panel.Up.toFixed(1));
            }
          });
        if (this.bpsThermalResult.ThermalUIResult.ThermalUIPanelEdges)
          this.bpsThermalResult.ThermalUIResult.ThermalUIPanelEdges.forEach(panelEdge => {
            let val = panelEdge.Psi.toString().split('.');
            if (val[0] && val[1] && parseInt(val[0]) > 0 && val[1].length > 1) {
              panelEdge.Psi = parseFloat(panelEdge.Psi.toFixed(1));
            }
          });
        if (this.bpsThermalResult.ThermalUIResult.ThermalUIInsertUnitGlassEdges)
          this.bpsThermalResult.ThermalUIResult.ThermalUIInsertUnitGlassEdges.forEach(glassEdge => {
            let val = glassEdge.Psi.toString().split('.');
            if (val[0] && val[1] && parseInt(val[0]) > 0 && val[1].length > 1) {
              glassEdge.Psi = parseFloat(glassEdge.Psi.toFixed(1));
            }
          });

         //Inserted Unit System type Changes 
         let counter = 0;
        if(this.bpsThermalResult.ThermalUIResult.ThermalUIInsertUnitFrames){
          this.bpsThermalResult.ThermalUIResult.ThermalUIInsertUnitFrames.forEach(insertUnitFrame => {
            let insertedUnitPerSystem = new InsertedUnitPerSystem();
            insertedUnitPerSystem.ThermalUIInsertUnitFrames = [];
            insertedUnitPerSystem.ThermalUIInsertUnitFrames.push(insertUnitFrame);
            insertedUnitPerSystem.Counter = this.alphabetCounter[counter];
            if(this.unified3DModel && this.unified3DModel.ModelInput && this.unified3DModel.ModelInput.Geometry && this.unified3DModel.ModelInput.Geometry.Infills){
              let glass = this.unified3DModel.ModelInput.Geometry.Infills.filter(glass=> glass.InfillID == insertUnitFrame.GlassID);
              
              if(glass && glass.length>0){
                let operable = this.unified3DModel.ModelInput.Geometry.OperabilitySystems.filter(os => os.OperabilitySystemID == glass[0].OperabilitySystemID)
                insertedUnitPerSystem.SystemType = operable[0].InsertedWindowType;
                if(glass[0].GlazingSystemID > 0){ // it's a glass
                //ThermalUIInsertUnitGlasses
                  if(this.bpsThermalResult.ThermalUIResult.ThermalUIInsertUnitGlasses){
                    let thermalUIInsertUnitGlass = this.bpsThermalResult.ThermalUIResult.ThermalUIInsertUnitGlasses.filter(insertedUnitGlass=> insertedUnitGlass.GlassID == glass[0].InfillID);
                    if(thermalUIInsertUnitGlass && thermalUIInsertUnitGlass.length>0){
                      insertedUnitPerSystem.ThermalUIInsertUnitGlasses = [];
                      insertedUnitPerSystem.ThermalUIInsertUnitGlasses.push(thermalUIInsertUnitGlass[0]);
                    }
                  }
                  //ThermalUIInsertUnitGlassEdges
                  if(this.bpsThermalResult.ThermalUIResult.ThermalUIInsertUnitGlassEdges){
                    let thermalUIInsertUnitGlassEdge = this.bpsThermalResult.ThermalUIResult.ThermalUIInsertUnitGlassEdges.filter(insertedUnitGlass=> insertedUnitGlass.GlassID == glass[0].InfillID);
                    if(thermalUIInsertUnitGlassEdge && thermalUIInsertUnitGlassEdge.length>0){
                      insertedUnitPerSystem.ThermalUIInsertUnitGlassEdges = [];
                      insertedUnitPerSystem.ThermalUIInsertUnitGlassEdges.push(thermalUIInsertUnitGlassEdge[0]);
                    }
                  }
                } else if(glass[0].GlazingSystemID ==-1){ //it's a panel
                  if(this.bpsThermalResult.ThermalUIResult.ThermalUIInsertUnitPanels){
                    let thermalUIInsertUnitPanel = this.bpsThermalResult.ThermalUIResult.ThermalUIInsertUnitPanels.filter(insertedUnitGlass=> insertedUnitGlass.GlassID == glass[0].InfillID);
                    if(thermalUIInsertUnitPanel && thermalUIInsertUnitPanel.length>0){
                      insertedUnitPerSystem.ThermalUIInsertUnitPanels = [];
                      insertedUnitPerSystem.ThermalUIInsertUnitPanels.push(thermalUIInsertUnitPanel[0]);
                    }
                  }
                  //ThermalUIInsertUnitPanelEdges
                  if(this.bpsThermalResult.ThermalUIResult.ThermalUIInsertUnitPanelEdges){
                    let thermalUIInsertUnitPanelEdge = this.bpsThermalResult.ThermalUIResult.ThermalUIInsertUnitPanelEdges.filter(insertedUnitGlass=> insertedUnitGlass.GlassID == glass[0].InfillID);
                    if(thermalUIInsertUnitPanelEdge && thermalUIInsertUnitPanelEdge.length>0){
                      insertedUnitPerSystem.ThermalUIInsertUnitPanelEdges = [];
                      insertedUnitPerSystem.ThermalUIInsertUnitPanelEdges.push(thermalUIInsertUnitPanelEdge[0]);
                    }
                  }
                }
              }
            }
            this.insertedUnitsPerSystemList.push(insertedUnitPerSystem);
            counter++;
          });
        }

        let val = this.bpsThermalResult.ThermalUIResult.TotalUw.toString().split('.');
        if (val[0] && val[1] && parseInt(val[0]) > 0 && val[1].length > 1) {
          this.bpsThermalResult.ThermalUIResult.TotalUw = parseFloat(this.bpsThermalResult.ThermalUIResult.TotalUw.toFixed(1));
        }
      }
      if (this.unified3DModel.ModelInput && this.unified3DModel.ModelInput.Geometry && this.unified3DModel.ModelInput.Geometry.Infills) {
        this.unified3DModel.ModelInput.Geometry.Infills.forEach(glass => {
          if (!this.glassGlazingSystemIds.includes(glass.GlazingSystemID) && glass.GlazingSystemID !== -1) {
            this.glassGlazingSystemIds.push(glass.GlazingSystemID);
          }
        });
      }
    }


    // this.thermalResultSubscription = this.resultService.thermalResultSubject.subscribe((response)=>{
    //   this.unified3DModel = response;
    //   if (this.unified3DModel && this.unified3DModel.BpsAnalysisResult && this.unified3DModel.BpsAnalysisResult.ThermalResult) {
    //     this.bpsThermalResult = this.unified3DModel.BpsAnalysisResult.ThermalResult;
    //     if(this.unified3DModel.ModelInput && this.unified3DModel.ModelInput.Geometry && this.unified3DModel.ModelInput.Geometry.Infills){
    //       this.unified3DModel.ModelInput.Geometry.Infills.forEach(glass=> {
    //         this.glassGlazingSystemIds.push(glass.GlazingSystemID);
    //       });
    //     }
    //   }
    // });

  }

}
class InsertedUnitPerSystem{
  Counter: string;
  SystemType: string;
  ThermalUIInsertUnitFrames: ThermalInsertUnitFrame[];
  ThermalUIInsertUnitGlasses: ThermalGlass[];
  ThermalUIInsertUnitGlassEdges: ThermalGlassEdge[];
  ThermalUIInsertUnitPanels: ThermalPanel[];
  ThermalUIInsertUnitPanelEdges: ThermalPanelEdge[];
}
