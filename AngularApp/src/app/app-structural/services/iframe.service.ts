import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { BpsUnifiedModel } from 'src/app/app-common/models/bps-unified-model';
import { IFrameEvent } from '../models/iframe-exchange-data';
import { ConfigureService } from './configure.service';
import { UnifiedModelService } from './unified-model.service';

@Injectable({
  providedIn: 'root'
})
export class IframeService {

  constructor(private configureService: ConfigureService,
    private umService: UnifiedModelService) { }

  //#region IFrame Event
  intervalCounter: number;
  intervalID: any;
  public iframeEvent: Subject<IFrameEvent> = new Subject<IFrameEvent>();
  sendIFrameEventObs = this.iframeEvent.asObservable();
  /**
   * Handles actions on the iframe display
   * @param iframeEvent 
   * @param jsonAction 
   * @param jsonData 
   */
  setIFrameEvent(iframeEvent: any, jsonAction: string, jsonData: any = undefined) {
    if (jsonAction !== '') {
      if (jsonData) {
        if (jsonData.Unified3DModel) {
          this.umService.current_UnifiedModel = jsonData.Unified3DModel;
        }
          iframeEvent.next(new IFrameEvent(jsonAction, jsonData));
      }
      else {
        iframeEvent.next(new IFrameEvent(jsonAction));
      }
    }
  }
  
  lazyLoadJSON(iframeEvent: any, jsonAction: string = '', jsonData: any = undefined) {
    this.intervalCounter = 25;
    this.intervalID = setInterval(() => {
      --this.intervalCounter;
      if (this.intervalCounter === 0) {
        this.setIFrameEvent(iframeEvent, jsonAction, jsonData);
        clearInterval(this.intervalID);
      }
    }, 0);      
  }
  /**
   * Change the unified model
   * @param iframeEvent 
   * @param jsonAction 
   * @param jsonData 
   */
  loadJSON(iframeEvent: any, jsonAction: string = '', jsonData: any = undefined) {
    setTimeout(() => {
      this.setIFrameEvent(iframeEvent, jsonAction, jsonData);      
    }, 100);
  }
  //#endregion
  
  //#region Show Loader
  private sendShowLoaderSubject: Subject<boolean> = new Subject<boolean>();
  sendShowLoaderObs = this.sendShowLoaderSubject.asObservable();
  setShowLoader(show: boolean = false) {
    this.sendShowLoaderSubject.next(show);
  }
  //#endregion

  //#region Child Events
  sendChildEventSubject: Subject<any> = new Subject<any>();
  sendChildEventObs = this.sendChildEventSubject.asObservable();
  setChildEvent(event: any) {
    this.sendChildEventSubject.next(event);
  }
  //#endregion

  //#region Calculate
  /**
   * Calculate the cost of the window system of the unified model
   * @param unified3DModel 
   * @returns 
   */
  CalculateSubTotalCost(unified3DModel: BpsUnifiedModel) {
    let subTotal = 0;
    let geometry = unified3DModel.ModelInput.Geometry;
    let productType = "";
    for (let infill of geometry.Infills) {
      if (infill.OperabilitySystemID != null && infill.OperabilitySystemID != -1) {
        let op = geometry.OperabilitySystems.find(item => item.OperabilitySystemID == infill.OperabilitySystemID);
        let ventOperableType = op.VentOperableType;
        if (ventOperableType == "Single-Door-Left" || ventOperableType == "Single-Door-Right"
          || ventOperableType == "Double-Door-Active-Left" || ventOperableType == "Double-Door-Active-Right") {
          productType = "Door";
          break;
        }
      }
    }

    if (unified3DModel.ProblemSetting.ProductType == "Window") {
      if (productType == "Door") { subTotal = this.CalculateDoorSubTotalCost(unified3DModel); }
      else { subTotal = this.CalculateWindowSubTotalCost(unified3DModel); }
    }
    if (unified3DModel.ProblemSetting.ProductType == "Facade") {
      subTotal = this.CalculateFacadeSubTotalCost();
    }

    if (unified3DModel.ProblemSetting.ProductType == "SlidingDoor" && unified3DModel.ProblemSetting.SlidingDoorType) {
      subTotal = this.CalculateSlidingDoorSubTotalCost(unified3DModel);
    }

    subTotal = subTotal ? Math.round(subTotal) : subTotal;
    return subTotal;
  }

  /**
   * Calculate the sub total cost of the window system of the unified model
   * @param unified3DModel 
   * @returns 
   */
  CalculateWindowSubTotalCost(unified3DModel: BpsUnifiedModel): number {
    let subTotal = 0;
    if (unified3DModel) {
      let markup = 0.8;
      let markupnew = 0.75;
      let geometry = unified3DModel.ModelInput.Geometry;
      let gminX = Number.MAX_SAFE_INTEGER, gminY = Number.MAX_SAFE_INTEGER; // global vertices
      let gmaxX = Number.MIN_SAFE_INTEGER, gmaxY = Number.MIN_SAFE_INTEGER; // global vertices
      // Glass Cost 
      //  Glass
      let glassCost = this.CalculateGlassCost(unified3DModel);
      subTotal += glassCost;

      // Vent Cost
      let hasVent = false;
      for (let glass of geometry.Infills) {
        let left = geometry.Members.find(item => item.MemberID == glass.BoundingMembers[0]);
        let minX = geometry.Points.find(x => x.PointID == left.PointA).X;
        gminX = Math.min(gminX, minX);
        let right = geometry.Members.find(item => item.MemberID == glass.BoundingMembers[2]);
        let maxX = geometry.Points.find(x => x.PointID == right.PointA).X;
        gmaxX = Math.max(gmaxX, maxX);

        let top = geometry.Members.find(item => item.MemberID == glass.BoundingMembers[1]);
        let maxY = geometry.Points.find(x => x.PointID == top.PointA).Y;
        gmaxY = Math.max(gmaxY, maxY);
        let bottom = geometry.Members.find(item => item.MemberID == glass.BoundingMembers[3]);
        let minY = geometry.Points.find(x => x.PointID == bottom.PointA).Y;
        gminY = Math.min(gminY, minY);
        // Vent Cost
        let ventCost = 0.0;
        //operable opening
        if (glass.OperabilitySystemID != null && glass.OperabilitySystemID != -1) {
          let op = geometry.OperabilitySystems.find(item => item.OperabilitySystemID == glass.OperabilitySystemID)
          if (op.VentOperableType == "Turn-Tilt-Left" || op.VentOperableType == "Turn-Tilt-Right") {
            ventCost = 406.17 / markup / markupnew;
            hasVent = true;
          }
          else {
            ventCost = 406.17 / markup / markupnew;
            hasVent = true;
          }
        }
        subTotal += ventCost;
      }

      // Define finshes price
      let paint = unified3DModel.ModelInput.FrameSystem.AluminumColor ?? "Traffic White";
      let fixedpaint = 0.0;
      let tiltturnpaint = 0.0;
      if (paint == "Jet black - RAL 9005") { fixedpaint = 25.00; tiltturnpaint = 40.9091; }
      else if (paint == "Black-brown - RAL 8022") { fixedpaint = 48.6364; tiltturnpaint = 79.2773; }
      else if (paint == "Anthracite grey - RAL 7016") { fixedpaint = 46.8182; tiltturnpaint = 76.8182; }
      else if (paint == "Silver grey - RAL 7001") { fixedpaint = 23.6364; tiltturnpaint = 38.1818; }
      else { fixedpaint = 41.3636; tiltturnpaint = 79.2773; } // Traffic white - RAL 9016

      // Outerframe - finishes, material, joints/cleats,others and fabrication cost      
      let outerFrameW = (gmaxX - gminX) / 1000; //m
      let outerFrameH = (gmaxY - gminY) / 1000; //m
      let material = (outerFrameH + outerFrameW) * 2.0 * 28.50 / markup / markupnew;
      let jointcleat = 3.55 * 4.0 / markup / markupnew;
      let others = 25.33 / markup / markupnew;
      let fab = 270.0 / markup;
      let outerPaintCost = 0;
      if (hasVent == false) {
        outerPaintCost = 2 * (outerFrameH + outerFrameW) * fixedpaint / markup / markupnew;
      }else {
        outerPaintCost = 2 * (outerFrameH + outerFrameW) * tiltturnpaint / markup / markupnew;
      }
      let outFrameCost = material + jointcleat + others + fab + outerPaintCost;
      subTotal += outFrameCost;

      // Transom/Mullion - finishes, material, joints/cleats,others and fabrication cost     
      for (let member of geometry.Members) {
        if (member.MemberType == 1) { continue; }
        let length = 0.0;
        let x1 = geometry.Points.find(x => x.PointID == member.PointA).X;
        let x2 = geometry.Points.find(x => x.PointID == member.PointB).X;
        let y1 = geometry.Points.find(x => x.PointID == member.PointA).Y;
        let y2 = geometry.Points.find(x => x.PointID == member.PointB).Y;
        if (x1 == x2) { length = Math.abs(y1 - y2) / 1000; } //m
        else { length = Math.abs(x1 - x2) / 1000; } //m

        if (member.MemberType == 2) { others = 28.98 / markup / markupnew; }
        if (member.MemberType == 3) { others = 21.92 / markup / markupnew; }

        material = 48.5 * length / markup / markupnew;
        jointcleat = 2.64 * 2 / markup / markupnew;
        fab = 30.0 / markup;
        let tranmullPaintCost = length * fixedpaint / markup / markupnew
        let transommullionCost = material + jointcleat + others + fab + tranmullPaintCost;
        subTotal += transommullionCost;
      }
    }
    return subTotal;
  }

  /**
   * Calculate the glass cost
   * @param unified3DModel 
   * @returns 
   */
  CalculateGlassCost(unified3DModel: BpsUnifiedModel): number {
    let subTotal = 0;
    let markup = 0.8;
    let markupnew = 0.75;
    let geometry = unified3DModel.ModelInput.Geometry;
    let gminX = Number.MAX_SAFE_INTEGER, gminY = Number.MAX_SAFE_INTEGER; // global vertices
    let gmaxX = Number.MIN_SAFE_INTEGER, gmaxY = Number.MIN_SAFE_INTEGER; // global vertices
    for (let glass of geometry.Infills) {
      let left = geometry.Members.find(item => item.MemberID == glass.BoundingMembers[0]);
      let minX = geometry.Points.find(x => x.PointID == left.PointA).X;
      gminX = Math.min(gminX, minX);
      let right = geometry.Members.find(item => item.MemberID == glass.BoundingMembers[2]);
      let maxX = geometry.Points.find(x => x.PointID == right.PointA).X;
      gmaxX = Math.max(gmaxX, maxX);

      let top = geometry.Members.find(item => item.MemberID == glass.BoundingMembers[1]);
      let maxY = geometry.Points.find(x => x.PointID == top.PointA).Y;
      gmaxY = Math.max(gmaxY, maxY);
      let bottom = geometry.Members.find(item => item.MemberID == glass.BoundingMembers[3]);
      let minY = geometry.Points.find(x => x.PointID == bottom.PointA).Y;
      gminY = Math.min(gminY, minY);

      let width = (maxX - minX) / 1000 //m
      let height = (maxY - minY) / 1000 //m

      let area = height * width; //sqm

      //  Glass
      let glassDiscrip = geometry.GlazingSystems.find(x => x.GlazingSystemID == glass.GlazingSystemID).Description;
      let glassCost = 0.0;
      if (glassDiscrip == "1/4 Clear SB 60+1/2 ARGON+1/4 Clear (1 in)") {
        glassCost = area * 139.9;
      }
      else if (glassDiscrip == "1/4 Grey+1/2 AIR+1/4 Clear (1 in)") {
        glassCost = area * 161.5;
      }
      else if (glassDiscrip == "1/4 Clear SB 70+1/2 AIR+1/4 Clear (1 in)") {
        glassCost = area * 172.2;
      }
      else if (glassDiscrip == "1/4 Grey SB 70+1/2 AIR+1/4 Clear (1 in)") {
        glassCost = area * 215.3;
      }
      else if (glassDiscrip == "1/4 Bronze SB 70+1/2 AIR+1/4 Clear (1 in)") {
        glassCost = area * 226.0;
      }
      else // triple layer glass
      {
        glassCost = area * 304.4;
      }
      subTotal += glassCost / markup / markupnew;
    }
    return subTotal;
  }

  /**
   * Calculate the sub total cost of the door system of the unified model
   * @param unified3DModel 
   * @returns 
   */
  CalculateDoorSubTotalCost(unified3DModel: BpsUnifiedModel): number {
    let subTotal = 0;
    let markup = 0.8;
    let markupnew = 0.75;
    let geometry = unified3DModel.ModelInput.Geometry;
    let productType = "";

    // Calculate Door Fitting Cost
    let gminX = Number.MAX_SAFE_INTEGER, gminY = Number.MAX_SAFE_INTEGER; // global vertices
    let gmaxX = Number.MIN_SAFE_INTEGER, gmaxY = Number.MIN_SAFE_INTEGER; // global vertices
    for (let infill of geometry.Infills) {
      let doorFittingCost = 0;
      let left = geometry.Members.find(item => item.MemberID == infill.BoundingMembers[0]);
      let minX = geometry.Points.find(x => x.PointID == left.PointA).X;
      gminX = Math.min(gminX, minX);
      let right = geometry.Members.find(item => item.MemberID == infill.BoundingMembers[2]);
      let maxX = geometry.Points.find(x => x.PointID == right.PointA).X;
      gmaxX = Math.max(gmaxX, maxX);

      let top = geometry.Members.find(item => item.MemberID == infill.BoundingMembers[1]);
      let maxY = geometry.Points.find(x => x.PointID == top.PointA).Y;
      gmaxY = Math.max(gmaxY, maxY);
      let bottom = geometry.Members.find(item => item.MemberID == infill.BoundingMembers[3]);
      let minY = geometry.Points.find(x => x.PointID == bottom.PointA).Y;
      gminY = Math.min(gminY, minY);

      if (infill.OperabilitySystemID != null && infill.OperabilitySystemID != -1) {
        let op = geometry.OperabilitySystems.find(item => item.OperabilitySystemID == infill.OperabilitySystemID);
        let ventOperableType = op.VentOperableType;
        if (ventOperableType == "Single-Door-Left" || ventOperableType == "Single-Door-Right") {
          productType = "SingleDoor";
          if (geometry.Infills.length == 1) { doorFittingCost += 194.66; }
          else { doorFittingCost += 1456.92; }
        }
        if (ventOperableType == "Double-Door-Active-Left" || ventOperableType == "Double-Door-Active-Right") {
          productType = "DoubleDoor";
          if (geometry.Infills.length == 1) { doorFittingCost += 924.90; }
          else { doorFittingCost += 2789.46; }
        }
      }
      let doorFittingC = doorFittingCost / markup / markupnew
      subTotal += doorFittingC;
    }

   
    // Calcualte the transom/mullion cost
    // Define variables
    let material = 0;
    let jointcleat = 0;;
    let others = 0;
    let fab = 0;
    let periTotal = 0.0;
    for (let member of geometry.Members) {
      let transommullionCost = 0;
      if (member.MemberType == 1 || member.MemberType == 31 || member.MemberType == 33) { continue; }
      let length = 0.0;
      let x1 = geometry.Points.find(x => x.PointID == member.PointA).X;
      let x2 = geometry.Points.find(x => x.PointID == member.PointB).X;
      let y1 = geometry.Points.find(x => x.PointID == member.PointA).Y;
      let y2 = geometry.Points.find(x => x.PointID == member.PointB).Y;
      if (x1 == x2) { length = Math.abs(y1 - y2) / 1000; } //in meter
      else { length = Math.abs(x1 - x2) / 1000; } //in meter

      periTotal += length;
      material = 19.95 * length / markup / markupnew;
      jointcleat = 2.68 * 2 / markup / markupnew;
      fab = 30.0 / markup;
      transommullionCost = material + jointcleat + fab;
      subTotal += transommullionCost;
    }

    // Calculate Outer Frame Cost 
    // Four category: Single, Double, Single with mullion/transom, double with mullion/transom
    let outerFrameW = (gmaxX - gminX) / 1000; //m
    let outerFrameH = (gmaxY - gminY) / 1000; //m
    // Single, Double
    if (geometry.Infills.length == 1) {
      if (productType == "SingleDoor") {
        material = (outerFrameH + outerFrameW) * 2.0 * 79.3253 / markup / markupnew;
        jointcleat = 16.4506 * 4.0 / markup / markupnew;
        others = 65.9909 / markup / markupnew;
        fab = 480.0 / markup;
      }
      if (productType == "DoubleDoor") {
        material = (outerFrameH + outerFrameW) * 2.0 * 95.0467 / markup / markupnew;
        jointcleat = 17.8556 * 4.0 / markup / markupnew;
        others = 103.6614 / markup / markupnew;
        fab = 720.0 / markup;
      }
    }
    // Single with mullion/transom, double with mullion/transom
    else {
      material = (outerFrameH + outerFrameW) * 2.0 * 43.6728 / markup / markupnew;
      jointcleat = 6.93182 * 4.0 / markup / markupnew;
      others = 35.84693 / markup / markupnew;
      fab = 30.0 / markup;
    }
    let outerFrameCost = material + jointcleat + fab + others;
    subTotal += outerFrameCost;

    // Calculate Finishes Cost
    let paintCost = 0;;
    let paint = unified3DModel.ModelInput.FrameSystem.AluminumColor ?? "Traffic White";
    periTotal += (outerFrameH + outerFrameW) * 2.0;
    if (productType == "SingleDoor") {
      if (paint == "Jet black - RAL 9005") { paintCost = periTotal * 39.5545; }
      else if (paint == "Black-brown - RAL 8022") { paintCost = periTotal * 76.3591; }
      else if (paint == "Anthracite grey - RAL 7016") { paintCost = periTotal * 73.6364; }
      else if (paint == "Silver grey - RAL 7001") { paintCost = periTotal * 36.8182; }
      else { paintCost = periTotal * 64.9409; } // Traffic white - RAL 9016
    } else {
      if (paint == "Jet black - RAL 9005") { paintCost = periTotal * 52.2727; }
      else if (paint == "Black-brown - RAL 8022") { paintCost = periTotal * 100.6773; }
      else if (paint == "Anthracite grey - RAL 7016") { paintCost = periTotal * 97.2727; }
      else if (paint == "Silver grey - RAL 7001") { paintCost = periTotal * 48.6364; }
      else { paintCost = periTotal * 85.6227; } // Traffic white - RAL 9016
    }
    let paintC = paintCost / markup / markupnew
    subTotal += paintC;

    // Calcualte Glass Cost
    let glassCost = this.CalculateGlassCost(unified3DModel);
    subTotal += glassCost;

    return subTotal;
  }

  /**
   * Calculate the sub total cost of the sliding door system of the unified model
   * @param unified3DModel 
   * @returns 
   */
  CalculateSlidingDoorSubTotalCost(unified3DModel: BpsUnifiedModel): number {
    // define general mark up 
    let markup = 0.8;
    // material markup 
    let matimarkup = 0.75;
    // calculate glass cost
    let glassCost = this.CalculateGlassCost(unified3DModel);
    // calculate the sliding door width and height
    let gminX = Number.MAX_SAFE_INTEGER, gminY = Number.MAX_SAFE_INTEGER; // global vertices
    let gmaxX = Number.MIN_SAFE_INTEGER, gmaxY = Number.MIN_SAFE_INTEGER; // global vertices
    let width = 0.0, height = 0.0;
    let geometry = unified3DModel.ModelInput.Geometry;
    let slidingDoorType = geometry.OperabilitySystems[0].VentOperableType;
    for (let glass of geometry.Infills) {
      let left = geometry.Members.find(item => item.MemberID == glass.BoundingMembers[0]);
      let minX = geometry.Points.find(x => x.PointID == left.PointA).X;
      gminX = Math.min(gminX, minX);
      let right = geometry.Members.find(item => item.MemberID == glass.BoundingMembers[2]);
      let maxX = geometry.Points.find(x => x.PointID == right.PointA).X;
      gmaxX = Math.max(gmaxX, maxX);

      let top = geometry.Members.find(item => item.MemberID == glass.BoundingMembers[1]);
      let maxY = geometry.Points.find(x => x.PointID == top.PointA).Y;
      gmaxY = Math.max(gmaxY, maxY);
      let bottom = geometry.Members.find(item => item.MemberID == glass.BoundingMembers[3]);
      let minY = geometry.Points.find(x => x.PointID == bottom.PointA).Y;
      gminY = Math.min(gminY, minY);

      width = (maxX - minX) / 1000 //m
      height = (maxY - minY) / 1000 //m
      let area = height * width; //sqm
    }

    // Options (continued): DOUBLE TRACK: "SlidingDoor-Type-2A-Left"; "SlidingDoor-Type-2A-Right"; "SlidingDoor-Type-2A1.i-Left"; "SlidingDoor-Type-2A1.i-Right"; "SlidingDoor-Type-2D1.i"; 
    // Options (continued): TRIPLE TEACK: "SlidingDoor-Type-3E-Left"; "SlidingDoor-Type-3E-Right"; "SlidingDoor-Type-3E1-Left"; "SlidingDoor-Type-3E1-Right";"SlidingDoor-Type-3F";
    let outFrameCost;
    let ventFrameCost;
    let fittingCost;
    let jointcleatCost;
    let othersCost;
    let fabricationCost;
    if (slidingDoorType == "SlidingDoor-Type-2A1.i-Left" || slidingDoorType == "SlidingDoor-Type-2A1.i-Right") {
        outFrameCost = (height + width) * 2 * 93.46 / markup / matimarkup;
        ventFrameCost = (width * 2 + height * 4) * 23.42 / markup / matimarkup;
        fittingCost = 433.21 / markup / matimarkup;
        jointcleatCost = 15.51 * 4 / markup / matimarkup;
        othersCost = 225.42 / markup / matimarkup;
        fabricationCost = 660 / markup;
    }
    if (slidingDoorType == "SlidingDoor-Type-2A-Left" || slidingDoorType == "SlidingDoor-Type-2A-Right") {
      outFrameCost = (height + width) * 2 * 93.46 / markup / matimarkup;
      ventFrameCost = (width * 2 + height * 4) * 23.42 / markup / matimarkup;
      fittingCost = 763.78 / markup / matimarkup;
      jointcleatCost = 15.51 * 4 / markup / matimarkup;
      othersCost = 171.32 / markup / matimarkup;
      fabricationCost = 780 / markup;
    }
    if (slidingDoorType == "SlidingDoor-Type-2D1.i") {
      outFrameCost = (height + width) * 2 * 103.93 / markup / matimarkup;
      ventFrameCost = (width * 2 + height * 8) * 23.29 / markup / matimarkup;
      fittingCost = 990.66 / markup / matimarkup;
      jointcleatCost = 15.20 * 4 / markup / matimarkup;
      othersCost = 444.04 / markup / matimarkup;
      fabricationCost = 1200 / markup;
    }
    if (slidingDoorType == "SlidingDoor-Type-3E-Left" || slidingDoorType == "SlidingDoor-Type-3E-Right") {
      outFrameCost = (height + width) * 2 * 104.36 / markup / matimarkup;
      ventFrameCost = (width * 2 + height * 6) * 23.42 / markup / matimarkup;
      fittingCost = 884.13 / markup / matimarkup;
      jointcleatCost = 16.94 * 4 / markup / matimarkup;
      othersCost = 300.70 / markup / matimarkup;
      fabricationCost = 900 / markup;
    }
    if (slidingDoorType == "SlidingDoor-Type-3E1-Left" || slidingDoorType == "SlidingDoor-Type-3E1-Right") {
      outFrameCost = (height + width) * 2 * 109.75 / markup / matimarkup;
      ventFrameCost = (width * 2 + height * 6) * 23.42 / markup / matimarkup;
      fittingCost = 589.61 / markup / matimarkup;
      jointcleatCost = 16.94 * 4 / markup / matimarkup;
      othersCost = 347.18 / markup / matimarkup;
      fabricationCost = 840 / markup;
    }
    if (slidingDoorType == "SlidingDoor-Type-3F"){
      outFrameCost = (height + width) * 2 * 121.57 / markup / matimarkup;
      ventFrameCost = (width * 2 + height * 4) * 23.42 / markup / matimarkup;
      fittingCost = 1933.96 / markup / matimarkup;
      jointcleatCost = 16.94 * 4 / markup / matimarkup;
      othersCost = 827.32 / markup / matimarkup;
      fabricationCost = 1380 / markup;
    }

    //calculate finishes cost
    let finishesCost = 0;
    let periTotal = 2 * (height + width);
    let paint = unified3DModel.ModelInput.FrameSystem.AluminumColor ?? "Traffic White";
    if (slidingDoorType == "SlidingDoor-Type-2A1.i-Left" || slidingDoorType == "SlidingDoor-Type-2A1.i-Right"
    || slidingDoorType == "SlidingDoor-Type-2A-Left" || slidingDoorType == "SlidingDoor-Type-2A-Right" ) {
      if (paint == "Jet black - RAL 9005") { finishesCost = periTotal * 61.3636; }
      else if (paint == "Black-brown - RAL 8022") { finishesCost = periTotal * 118.19; }
      else if (paint == "Anthracite grey - RAL 7016") { finishesCost = periTotal * 114.5455; }
      else if (paint == "Silver grey - RAL 7001") { finishesCost = periTotal * 57.2727; }
      else { finishesCost = periTotal * 100.51; } // Traffic white - RAL 9016
    }
    // 2D and triple track 
    else if (slidingDoorType == "SlidingDoor-Type-3E-Left" || slidingDoorType == "SlidingDoor-Type-3E-Right"
    || slidingDoorType == "SlidingDoor-Type-3E1-Left" || slidingDoorType == "SlidingDoor-Type-3E1-Right" 
    ||slidingDoorType == "SlidingDoor-Type-2D1.i"){
      if (paint == "Jet black - RAL 9005") { finishesCost = periTotal * 81.3636; }
      else if (paint == "Black-brown - RAL 8022") { finishesCost = periTotal * 157.0955; }
      else if (paint == "Anthracite grey - RAL 7016") { finishesCost = periTotal * 151.8182; }
      else if (paint == "Silver grey - RAL 7001") { finishesCost = periTotal * 75.9091; }
      else { finishesCost = periTotal * 275.2818; } // Traffic white - RAL 9016
    }
    else { // SlidingDoor-Type-3F
      if (paint == "Jet black - RAL 9005") { finishesCost = periTotal * 142.7273; }
      else if (paint == "Black-brown - RAL 8022") { finishesCost = periTotal * 275.2818; }
      else if (paint == "Anthracite grey - RAL 7016") { finishesCost = periTotal * 266.3636; }
      else if (paint == "Silver grey - RAL 7001") { finishesCost = periTotal * 133.1818; }
      else { finishesCost = periTotal * 234.1182; } // Traffic white - RAL 9016
    }
    finishesCost = finishesCost / markup / matimarkup;
    let totalWithFinishes = outFrameCost + ventFrameCost + fittingCost + jointcleatCost + othersCost + fabricationCost + finishesCost;
    let totalwithFinishesandGlass = totalWithFinishes + glassCost;
    
    return totalwithFinishesandGlass;
  }

  CalculateFacadeSubTotalCost(): number {
    return 0.0;
  }
  //#endregion

  /**
   * Last modifed date of the unified model to display
   * @param ModifiedOn 
   * @returns 
   */
  getLastModifiedDate(ModifiedOn: Date): string {
    let date = new Date(ModifiedOn);
    let language = this.configureService.getLanguage();
    const ye = new Intl.DateTimeFormat('en-US', { year: 'numeric' }).format(date);
    const mo = new Intl.DateTimeFormat('en-US', { month: 'short' }).format(date);
    const da = new Intl.DateTimeFormat('en-US', { day: '2-digit' }).format(date);
    const hour = new Intl.DateTimeFormat('en-US', { hour: 'numeric', hour12: true }).format(date);
    let hour12: any = parseInt(hour.substr(0, 2));
    if (hour12.toString().length == 1) { hour12 = '0' + hour12; }
    let amOrPm = hour.substr(-2, 2);
    let min = new Intl.DateTimeFormat('en-US', { minute: '2-digit' }).format(date);
    if (min.toString().length == 1) { min = '0' + min; }
    if (language === 'de-DE')
      return da + "-" + mo + "-" + ye + " - " + hour12 + ":" + min + " " + amOrPm;
    else
      return mo + "-" + da + "-" + ye + " - " + hour12 + ":" + min + " " + amOrPm;
  }
  getMaxModelHeight(unified3DModel: BpsUnifiedModel): number {
    return unified3DModel.ModelInput.Geometry.Points.map(({ Y }) => Y).sort((a, b) => { return b - a })[0];
  }
  isAllowedToDelete(unified3DModel: BpsUnifiedModel, memberIds: any[]) {
    if (memberIds && memberIds.length > 0) {
      const members = unified3DModel.ModelInput.Geometry.SlabAnchors.filter(f => memberIds.includes(f.SlabAnchorID) && ((f.AnchorType === "Fixed" && f.Y === 0) || (f.AnchorType === "Sliding" && f.Y === this.getMaxModelHeight(unified3DModel))));
      if (members.length > 0)
        return false;
      else
        return true;
    }
    else
      return true;
  }

  //#region DisplaySettings
  /**
   * 
   * @returns Default settings of the iframe buttons
   */
  getDisplaySettings_Default() {
    return {
      showThreeDView: false,
      showAxes: false,
      showGlassID: false, // new
      showVentInfo: false, // new
      showGrid: true,
      showGlazingTypeColor: false, // new
      showControls: true,
      enableOrbitControls: true,
      showThermalResultLabel: false,
      showQuickCheckSymbols: true
    };
  }
  /**
   * 
   * @param unified3DModel
   * @returns Settings of the iframe buttons when operability is opened
   */
  getDisplaySettings_Operability(unified3DModel: BpsUnifiedModel) {
    const showBoundaryCondition = unified3DModel.ModelInput.Structural ? unified3DModel.ModelInput.Structural.ShowBoundaryCondition : false;
    return {
      showBCSymbols: showBoundaryCondition,
      showThreeDView: false,
      showAxes: false,
      showGlassID: true, // new
      showVentInfo: true, // new
      showGrid: true,
      showGlazingTypeColor: false, // new
      showControls: true,
      enableOrbitControls: true,
      showThermalResultLabel: false,
      showQuickCheckSymbols: true
    };
  }

  /**
   * 
   * @param unified3DModel 
   * @returns Settings of the iframe buttons when sliding unit is opened
   */
  getDisplaySettings_SlidingUnit(unified3DModel: BpsUnifiedModel) {
    const showBoundaryCondition = unified3DModel.ModelInput.Structural ? unified3DModel.ModelInput.Structural.ShowBoundaryCondition : false;
    return {
      showBCSymbols: showBoundaryCondition,
      showThreeDView: false,
      showAxes: false,
      showGlassID: true, // new
      showVentInfo: true, // new
      showGrid: true,
      showGlazingTypeColor: false, // new
      showControls: true,
      enableOrbitControls: true,
      showThermalResultLabel: false,
      showQuickCheckSymbols: true
    };
  }

  /**
   * 
   * @param unified3DModel 
   * @param activePanel 
   * @returns Settings of the iframe buttons when glass & panel is opened
   */
  getDisplaySettings_GlassPanel(unified3DModel: BpsUnifiedModel, activePanel: any) {
    const showBoundaryCondition = unified3DModel.ModelInput.Structural ? unified3DModel.ModelInput.Structural.ShowBoundaryCondition : false;
    let displaySettings: any;
    displaySettings = {
      showBCSymbols: showBoundaryCondition,
      showThreeDView: false,
      showAxes: false,
      showGlassID: true, // new
      showVentInfo: false, // new
      showGrid: true,
      showGlazingTypeColor: true, // new
      showControls: true,
      enableOrbitControls: true,
      showThermalResultLabel: false,
      showQuickCheckSymbols: true
    };
    if (activePanel && activePanel.operabilityIsOneGlassApplied) {
      displaySettings.showVentInfo = true;
    }
    return displaySettings;
  }

  // getDisplaySettings_Accordian(onAccrodianClick: boolean = false) {
  //   const showBoundaryCondition = this.umService.current_UnifiedModel.ModelInput.Structural ? this.umService.current_UnifiedModel.ModelInput.Structural.ShowBoundaryCondition : false;
  //   let accordian = this.umService.current_UnifiedModel.CollapsedPanels;
  //   if (accordian.Panel_Operability) {
  //     let displaySettings: any;
  //     displaySettings = {
  //       showBCSymbols: showBoundaryCondition,
  //       showThreeDView: onAccrodianClick ? false : null,
  //       //showThreeDView: this.umService.current_UnifiedModel.ProblemSetting.ProductType === 'Window' ? false : onAccrodianClick ? false : null,
  //       showAxes: false,
  //       showGlassID: true, // new
  //       showVentInfo: true, // new
  //       showGrid: true,
  //       showGlazingTypeColor: false, // new
  //       showControls: true,
  //       enableOrbitControls: true,
  //       showThermalResultLabel: false,
  //       showQuickCheckSymbols: true
  //     };
  //     this.iframeEvent.next(new IFrameEvent('loadDisplaySetting', { settings: displaySettings }));
  //   }
  //   else if (accordian.Panel_Glass) {
  //     let displaySettings: any;
  //     displaySettings = {
  //       showBCSymbols: showBoundaryCondition,
  //       showThreeDView: false,
  //       showAxes: false,
  //       showGlassID: true, // new
  //       showVentInfo: false, // new
  //       showGrid: true,
  //       showGlazingTypeColor: true, // new
  //       showControls: true,
  //       enableOrbitControls: true,
  //       showThermalResultLabel: false,
  //       showQuickCheckSymbols: true
  //     };
  //     if (this.umService.current_UnifiedModel.ModelInput.Geometry.Infills.length > 0) {
  //       displaySettings.showVentInfo = true;
  //     }
  //     this.iframeEvent.next(new IFrameEvent('loadDisplaySetting', { settings: displaySettings }));
  //   }
  //   else if (accordian.Panel_Structural) {
  //     if (this.umService.current_UnifiedModel.ModelInput && this.umService.current_UnifiedModel.ModelInput.Structural)
  //       this.umService.current_UnifiedModel.ModelInput.Structural.ShowBoundaryCondition = true;
  //     let displaySettings: any;
  //     displaySettings = {
  //       enableOrbitControls: true,
  //       showAxes: false,
  //       showBCSymbols: true,
  //       showControls: true,
  //       showGlassID: false,
  //       showGlazingTypeColor: false,
  //       showGrid: true,
  //       showThermalResultLabel: false,
  //       showThreeDView: false,
  //       showVentInfo: false,
  //       showQuickCheckSymbols: true
  //     }
  //     this.iframeEvent.next(new IFrameEvent('loadDisplaySetting', { settings: displaySettings }));
  //   }
  //   else if (accordian.Panel_Framing) {
  //     let displaySettings: any;
  //     displaySettings = {
  //       showBCSymbols: false,
  //       showThreeDView: onAccrodianClick ? false : null,
  //       showAxes: false,
  //       showGlassID: false, // new
  //       showVentInfo: false, // new
  //       showGrid: true,
  //       showGlazingTypeColor: false, // new
  //       showControls: true,
  //       enableOrbitControls: true,
  //       showThermalResultLabel: false,
  //       showQuickCheckSymbols: true
  //     };
  //     this.iframeEvent.next(new IFrameEvent('loadDisplaySetting', { settings: displaySettings }));
  //   }
  //   else if (accordian.Panel_Load) {
  //     if (this.umService.current_UnifiedModel.ModelInput && this.umService.current_UnifiedModel.ModelInput.Structural)
  //       this.umService.current_UnifiedModel.ModelInput.Structural.ShowBoundaryCondition = true;
  //     let displaySettings: any;
  //     displaySettings = {
  //       enableOrbitControls: true,
  //       showAxes: false,
  //       showBCSymbols: true,
  //       showControls: true,
  //       showGlassID: false,
  //       showGlazingTypeColor: false,
  //       showGrid: true,
  //       showThermalResultLabel: false,
  //       showThreeDView: false,
  //       showVentInfo: false,
  //       showQuickCheckSymbols: true
  //     }
  //     this.iframeEvent.next(new IFrameEvent('loadDisplaySetting', { settings: displaySettings }));
  //   }
  //   else if (!accordian.Panel_Glass && !accordian.Panel_Operability) {
  //     //if(!this.isStructuralActive) switchBoundary = false;
  //     let displaySettings: any;
  //     displaySettings = {
  //       showBCSymbols: false,
  //       showThreeDView: false,
  //       showAxes: false,
  //       showGlassID: false, // new
  //       showVentInfo: false, // new
  //       showGrid: true,
  //       showGlazingTypeColor: false, // new
  //       showControls: true,
  //       enableOrbitControls: true,
  //       showThermalResultLabel: false,
  //       showQuickCheckSymbols: true
  //     };
  //     this.iframeEvent.next(new IFrameEvent('loadDisplaySetting', { settings: displaySettings }));
  //   }
  //   // if (accordian.Panel_Acoustic) {
  //   // } if (accordian.Panel_Thermal) {
  //   // }  
  // }

  //#endregion DisplaySettings
}
