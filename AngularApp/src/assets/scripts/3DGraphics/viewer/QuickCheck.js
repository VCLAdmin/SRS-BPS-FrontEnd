
class DesignerQuickCheck {
  constructor(Geometry, isDoor, productType) {
    if (!Geometry) return null;
    this.productType = productType;
    this.Geometry = Geometry;
    this.Points = Geometry.Points;
    this.Members = Geometry.Members;
    this.Infills = Geometry.Infills;
    this.Sections = Geometry.Sections;
    this.FacadeSections = Geometry.FacadeSections;
    const structural = Designer.UnifiedModel.UnifiedModelJSON.ModelInput.Structural;
    this.WindLoad = (structural && structural.WindLoad) ? structural.WindLoad : 0;
    this.slidingDoor = null;
    this.Warnings = [];
    this.WarningSymbolGroup = [];

    this.material = null;
    this.material_hl = null;
    this.isDoorModel  = isDoor;
    this.StructuralQuickCheckCoefficients = [
      { articleName: "382280", k1: 0.3115, k0: -1.6654, c1: -0.636, c0: 4.1034 },   // AWS/ADS transom
      { articleName: "368650", k1: 0.2815, k0: -1.761, c1: -0.761, c0: 4.9542 },    // Struc. mullion Extnl 34/A25, For AWS under 6' tall
      { articleName: "368660", k1: 0.2912, k0: -2.0718, c1: -1.045, c0: 6.4400 },   // Struc. mullion Extnl 34/A25, For AWS over 6' tall and for ADS
      { articleName: "382360", k1: 0.1889, k0: -1.6645, c1: -1.036, c0: 6.5048 },
    ]
    this.slidingDoorStructuralQuickCheckCoefficients = [
      { InterlockType: "interlock", type: "snap", windLoad: "1.2", a1: 0.0527, b1: -0.5199, c1: 1.9223, d1: -3.1569, e1: 3.9111},
      { InterlockType: "interlock", type: "snap", windLoad: "1.68", a1: 0.0592, b1: -0.5595, c1: 1.9634, d1: -3.0361, e1: 2.5391},
      { InterlockType: "interlock", type: "snap", windLoad: "2.16", a1: 0.0654, b1: -0.5953, c1: 2.0034, d1: -2.9525, e1: 3.283},
      { InterlockType: "interlock", type: "snap", windLoad: "2.63", a1: 0.0699, b1: -0.6192, c1: 2.0195, d1: -2.8711, e1: 3.0851},

      { InterlockType: "interlockReinforced",  type: "snap", windLoad: "1.2", a1: 0.0527, b1: -0.5167, c1: 1.9617, d1: -3.4291, e1: 4.6431},
      { InterlockType: "interlockReinforced",  type: "snap", windLoad: "1.68", a1: 0.0501, b1: -0.4983, c1: 1.8814, d1: -3.1981, e1: 4.1887},
      { InterlockType: "interlockReinforced",  type: "snap", windLoad: "2.16", a1: 0.0505, b1: -0.4985, c1: 1.8474, d1: -3.0466, e1: 3.8769},
      { InterlockType: "interlockReinforced",  type: "snap", windLoad: "2.63", a1: 0.053, b1: -0.5125, c1: 1.8505, d1: -2.9556, e1: 3.651},

      { InterlockType: "midpoint",  type: "snap", windLoad: "1.2", a1: 0.0833, b1: -0.6758, c1: 2.0335, d1: -2.6892, e1: 2.8257},
      { InterlockType: "midpoint",  type: "snap", windLoad: "1.68", a1: 0.0975, b1: -0.7457, c1: 2.1064, d1: -2.6022, e1: 2.567},
      { InterlockType: "midpoint",  type: "snap", windLoad: "2.16", a1: 0.105, b1: -0.7762, c1: 2.1093, d1: -2.4949, e1: 2.3763},
      { InterlockType: "midpoint",  type: "snap", windLoad: "2.63", a1: 0.108, b1: -0.7808, c1: 2.0683, d1: -2.3748, e1: 2.2229},

      { InterlockType: "midpointReinforced",  type: "snap", windLoad: "1.2", a1: 0.0762, b1: -0.6331, c1: 2.1385, d1: -3.5326, e1: 4.8112},
      { InterlockType: "midpointReinforced",  type: "snap", windLoad: "1.68", a1: 0.1028, b1: -0.8053, c1: 2.5093, d1: -3.7557, e1: 4.5112},
      { InterlockType: "midpointReinforced",  type: "snap", windLoad: "2.16", a1: 0.0846, b1: -0.6917, c1: 2.2335, d1: -3.395, e1: 4.133},
      { InterlockType: "midpointReinforced",  type: "snap", windLoad: "2.63", a1: 0.0727, b1: -0.6195, c1: 2.0569, d1: -3.1516, e1: 3.8597},

      { InterlockType: "interlock", type: "rolling", articleNum: "504010", windLoad: "1.2", a1: 0.0443, b1: -0.4464, c1: 1.7578, d1: -3.2122, e1: 4.7004},
      { InterlockType: "interlock", type: "rolling", articleNum: "504010", windLoad: "1.68", a1: 0.0504, b1: -0.4951, c1: 1.8662, d1: -3.2032, e1: 4.3315},
      { InterlockType: "interlock", type: "rolling", articleNum: "504010", windLoad: "2.16", a1: 0.0479, b1: -0.4753, c1: 1.785, d1: -3.0073, e1: 4.0026},
      { InterlockType: "interlock", type: "rolling", articleNum: "504010", windLoad: "2.63", a1: 0.0483, b1: -0.4754, c1: 1.7569, d1: -2.8886, e1: 3.7663},

      { InterlockType: "interlock", type: "rolling", articleNum: "504020", windLoad: "1.2", a1: 0.0403, b1: -0.4146, c1: 1.6721, d1: -3.129, e1: 4.7153},
      { InterlockType: "interlock", type: "rolling", articleNum: "504020", windLoad: "1.68", a1: 0.0511, b1: -0.5011, c1: 1.8861, d1: -3.2427, e1: 4.3914},
      { InterlockType: "interlock", type: "rolling", articleNum: "504020", windLoad: "2.16", a1: 0.048, b1: -0.4769, c1: 1.7948, d1: -3.0365, e1: 4.0556},
      { InterlockType: "interlock", type: "rolling", articleNum: "504020", windLoad: "2.63", a1: 0.048, b1: -0.4744, c1: 1.7606, d1: -2.9166, e1: 3.8148},

      { InterlockType: "interlockReinforced",  type: "rolling", articleNum: "504010", windLoad: "1.2", a1: 0.0558, b1: -0.4724, c1: 1.6429, d1: -2.9782, e1: 5.3251},
      { InterlockType: "interlockReinforced",  type: "rolling", articleNum: "504010", windLoad: "1.68", a1: 0.0151, b1: -0.1955, c1: 1.0146, d1: -2.4049, e1: 4.8338},
      { InterlockType: "interlockReinforced",  type: "rolling", articleNum: "504010", windLoad: "2.16", a1: 0.0264, b1: -0.3029, c1: 1.3626, d1: -2.8125, e1: 4.7458},
      { InterlockType: "interlockReinforced",  type: "rolling", articleNum: "504010", windLoad: "2.63", a1: 0.0457, b1: -0.4568, c1: 1.7854, d1: -3.237, e1: 4.6909},

      { InterlockType: "interlockReinforced",  type: "rolling", articleNum: "504020", windLoad: "1.2", a1: 0.0593, b1: -0.4958, c1: 1.7039, d1: -3.0467, e1: 5.367},
      { InterlockType: "interlockReinforced",  type: "rolling", articleNum: "504020", windLoad: "1.68", a1: 0.0157, b1: -0.1977, c1: 1.0135, d1: -2.3981, e1: 4.8487},
      { InterlockType: "interlockReinforced",  type: "rolling", articleNum: "504020", windLoad: "2.16", a1: 0.0246, b1: -0.2877, c1: 1.319, d1: -2.766, e1: 4.7488},
      { InterlockType: "interlockReinforced",  type: "rolling", articleNum: "504020", windLoad: "2.63", a1: 0.0441, b1: -0.4446, c1: 1.7532, d1: -3.208, e1: 4.702},

      { InterlockType: "midpoint",  type: "rolling", articleNum: "504010",windLoad: "1.2", a1: 0.0501, b1: -0.4931, c1: 1.8591, d1: -3.1887, e1: 4.309},
      { InterlockType: "midpoint",  type: "rolling", articleNum: "504010",windLoad: "1.68", a1: 0.0478, b1: -0.4738, c1: 1.7674, d1: -2.9439, e1: 3.8806},
      { InterlockType: "midpoint",  type: "rolling", articleNum: "504010",windLoad: "2.16", a1: 0.0495, b1: -0.4823, c1: 1.7505, d1: -2.814, e1: 3.6001},
      { InterlockType: "midpoint",  type: "rolling", articleNum: "504010",windLoad: "2.63", a1: 0.0524, b1: -0.4968, c1: 1.7531, d1: -2.7271, e1: 3.3943},

      { InterlockType: "midpoint",  type: "rolling", articleNum: "504020",windLoad: "1.2", a1: 0.0512, b1: -0.5013, c1: 1.8867, d1: -3.2439, e1: 4.3932},
      { InterlockType: "midpoint",  type: "rolling", articleNum: "504020",windLoad: "1.68", a1: 0.0478, b1: -0.4743, c1: 1.7769, d1: -2.9806, e1: 3.9523},
      { InterlockType: "midpoint",  type: "rolling", articleNum: "504020",windLoad: "2.16", a1: 0.049, b1: -0.479, c1: 1.7519, d1: -2.8423, e1: 3.6647},
      { InterlockType: "midpoint",  type: "rolling", articleNum: "504020",windLoad: "2.63", a1: 0.0515, b1: -0.492, c1: 1.7516, d1: -2.7523, e1: 3.4546},

      { InterlockType: "midpointReinforced",  type: "rolling", articleNum: "504010", windLoad: "1.2", a1: 0.0311, b1: -0.2958, c1: 1.2133, d1: -2.5564, e1: 5.048},
      { InterlockType: "midpointReinforced",  type: "rolling", articleNum: "504010", windLoad: "1.68", a1: 0.0181, b1: -0.2327, c1: 1.1567, d1: -2.5872, e1: 4.7653},
      { InterlockType: "midpointReinforced",  type: "rolling", articleNum: "504010", windLoad: "2.16", a1: 0.0410, b1: -0.4199, c1: 1.6865, d1: -3.1431, e1: 4.7131},
      { InterlockType: "midpointReinforced",  type: "rolling", articleNum: "504010", windLoad: "2.63", a1: 0.0537, b1: -0.52, c1: 1.9476, d1: -3.363, e1: 4.576},

      { InterlockType: "midpointReinforced",  type: "rolling", articleNum: "504020", windLoad: "1.2", a1: 0.0346, b1: -0.319, c1: 1.2696, d1: -2.6093, e1: 5.0862},
      { InterlockType: "midpointReinforced",  type: "rolling", articleNum: "504020", windLoad: "1.68", a1: 0.017, b1: -0.2224, c1: 1.1233, d1: -2.548, e1: 4.7726},
      { InterlockType: "midpointReinforced",  type: "rolling", articleNum: "504020", windLoad: "2.16", a1: 0.0387, b1: -0.4021, c1: 1.6382, d1: -3.0957, e1: 4.7203},
      { InterlockType: "midpointReinforced",  type: "rolling", articleNum: "504020", windLoad: "2.63", a1: 0.0528, b1: -0.5131, c1: 1.9304, d1: -3.3529, e1: 4.5974},
      
    ]

    this.init();
  }

  init() {
    this.loadMaterial();
    if(this.productType == "SlidingDoor"){
      this.slidingDoor = Designer.UnifiedModel.doorFrames[0];
      const SlidingDoorStructuralQuickCheckPassed = this.slidingDoorStructuralCheck();
      const quickCheckPassed = SlidingDoorStructuralQuickCheckPassed && (
        Designer.UnifiedModel.getWidth() >= this.slidingDoor.ventFrames.length * 774 && 
        Designer.UnifiedModel.getWidth() <= this.slidingDoor.ventFrames.length * 3200 &&
        Designer.UnifiedModel.getHeight() >= 1935 && 
        Designer.UnifiedModel.getHeight() <= 3500
      );
      this.createWarningSymbols();
      const data = {
        quickCheckPassed: quickCheckPassed,
        structuralQuickCheckPassed: SlidingDoorStructuralQuickCheckPassed,
      }
      dataExchange.sendParentMessage('runQuickCheck', data);
    }
    else{
      const structuralQuickCheckPassed = this.structuralCheck();
      const ventQuickCheckPassed = this.ventCheck();
      const quickCheckPassed = structuralQuickCheckPassed && ventQuickCheckPassed && (
        Designer.UnifiedModel.getWidth() >= 500 && 
        Designer.UnifiedModel.getWidth() <= 4000 &&
        Designer.UnifiedModel.getHeight() >= 500 && 
        Designer.UnifiedModel.getHeight() <= 4000
      );
      this.createWarningSymbols();
      const data = {
        quickCheckPassed: quickCheckPassed,
        structuralQuickCheckPassed: structuralQuickCheckPassed,
        ventQuickCheckPassed: ventQuickCheckPassed,
      }
      dataExchange.sendParentMessage('runQuickCheck', data);
    }
    
  }

  loadMaterial() {
    const loader = new THREE.TextureLoader();
    let texture = loader.load(
      'https://vcl-design-com.s3.amazonaws.com/StaticFiles/scripts/3DGraphics/content/images/bps_quickcheck_warningsymbol.svg'
    );
    this.material = new THREE.SpriteMaterial({ map: texture, depthTest:false });

    let texture_hl = loader.load(
      'https://vcl-design-com.s3.amazonaws.com/StaticFiles/scripts/3DGraphics/content/images/bps_quickcheck_warningsymbol_highlight.svg'
    );
    this.material_hl = new THREE.SpriteMaterial({ map: texture_hl });
  }

  structuralCheck() {
    for (let member of this.Members) {
      // Check if pass
      if(member.MemberType == 31 || member.MemberType === 33) continue;
      let warning = this.structuralCheckSimplifiedCriteria(member);
      if (warning) this.Warnings.push(warning);
    }
    if (this.Warnings.length > 0) return false;
    return true;
  }

  structuralCheckSimplifiedCriteria(member) {
    // find coefficients
    const articleName = this.Sections.find(s => s.SectionID == member.SectionID).ArticleName;
    const coef = this.StructuralQuickCheckCoefficients.find(c => c.articleName == articleName);
    const w = this.WindLoad * 20.89;
    const PA = this.Points.find(p => p.PointID == member.PointA);
    const PB = this.Points.find(p => p.PointID == member.PointB);
    const dX = PB.X - PA.X;
    const dY = PB.Y - PA.Y;
    const length = Math.sqrt(dY * dY + dX * dX);

    let B = 0;
    let warning = null;
    if (member.MemberType == 2)  // mullion
    {
      //calc spacing B
      const gR = this.Infills.filter(g => g.BoundingMembers[0] == member.MemberID);  //right glass: glass right to member
      const gL = this.Infills.filter(g => g.BoundingMembers[2] == member.MemberID);  //left glass
      let x1 = PA.X;

      let x2 = x1;
      for (let g of gR) {
        let m2 = this.Members.find(m => m.MemberID == g.BoundingMembers[2]);
        let x2temp = this.Points.find(p => p.PointID == m2.PointA).X;
        x2 = Math.max(x2temp, x2);
      }
      let gR_dx = Math.abs(x2 - x1);

      x2 = x1;
      for (let g of gL) {
        let m2 = this.Members.find(m => m.MemberID == g.BoundingMembers[0]);
        let x2temp = this.Points.find(p => p.PointID == m2.PointA).X;
        x2 = Math.min(x2temp, x2);
      }
      let gL_dx = Math.abs(x1 - x2);
      B = Math.min(gR_dx, length) / 2 + Math.min(gL_dx, length) / 2;
      B = B / 1000;  // convert B from mm to m

      // derive L, check criteria
      let msg = "";
      if (coef) {
        const kw = coef.k1 * Math.log(w) + coef.k0;
        const cw = coef.c1 * Math.log(w) + coef.c0;
        const L = kw * Math.log(B) + cw;  // L in m
        if (length > L * 1000) {
          msg = "This member failed the structural quick check! Please reduce configuration dimensions, reduce wind load, or change to a profile with more capacity.";
        }
        else {
          return null;
        }
      }
      else {
        msg = "Unknown article!  The article number doesn't exist in structural quick check database!";
      }

      // warning symbol LOCATION
      let X = (PA.X + PB.X) / 2;
      let Y = (PA.Y + PB.Y) / 2;
      let intersectP = this.Points.find(p => Math.abs(p.X - X) < 0.0001 && Math.abs(p.Y - Y) < 30);
      if (intersectP) Y = intersectP.Y + 70;
      warning = {
        X: X,
        Y: Y,
        memberID: member.MemberID,
        type: "structural check warning",
        warningMessage: msg
      }
    }
    else if (member.MemberType == 3) {
      const gB = this.Infills.filter(g => g.BoundingMembers[1] == member.MemberID);  //bottom glass
      const gT = this.Infills.filter(g => g.BoundingMembers[3] == member.MemberID);  //Top glass
      let y1 = PA.Y;
      let y2 = y1;
      for (let g of gB) {
        let m2 = this.Members.find(m => m.MemberID == g.BoundingMembers[3]);
        let y2temp = this.Points.find(p => p.PointID == m2.PointA).Y;
        y2 = Math.min(y2temp, y2);
      }
      let gB_dy = Math.abs(y1 - y2);

      y2 = y1;
      for (let g of gT) {
        let m2 = this.Members.find(m => m.MemberID == g.BoundingMembers[1]);
        let y2temp = this.Points.find(p => p.PointID == m2.PointA).Y;
        y2 = Math.min(y2temp, y2);
      }
      let gT_dy = Math.abs(y2 - y1);
      B = Math.min(gB_dy, length) / 2 + Math.min(gT_dy, length) / 2;
      B = B / 1000;  // convert B from mm to m

      // derive L, check criteria
      let msg = "";
      if (coef) {
        const kw = coef.k1 * Math.log(w) + coef.k0;
        const cw = coef.c1 * Math.log(w) + coef.c0;
        const L = kw * Math.log(B) + cw;  // L in m
        if (length > L * 1000) {
          msg = "This member failed the structural quick check! Please reduce configuration dimensions, reduce wind load, or change to a profile with more capacity.";
        }
        else {
          return null;
        }
      }
      else {
        msg = "Unknown profile! This profile's article number was not found in the SRS database. Please select another option from the available list.";
      }

      // warning symbol LOCATION
      let X = (PA.X + PB.X) / 2;
      let Y = (PA.Y + PB.Y) / 2;
      let intersectP = this.Points.find(p => Math.abs(p.Y - Y) < 0.0001 && Math.abs(p.X - X) < 30);
      if (intersectP) X = intersectP.X + 70;
      warning = {
        X: X,
        Y: Y,
        memberID: member.MemberID,
        type: "structural check warning",
        warningMessage: msg
      }
    }
    return warning;
  }

  ventCheck() {
    let ventQuickCheckPassed = true;
    for (let infill of this.Infills) {
      // Check if pass
      const opID = infill.OperabilitySystemID;
      if (!this.Geometry.OperabilitySystems) return ventQuickCheckPassed;
      const op = this.Geometry.OperabilitySystems.find(o => o.OperabilitySystemID == opID);
      if (op && ((op.VentArticleName && op.VentArticleName !== "-1") || (op.DoorSystemID !== -1))) {
        let ventFrame = null;
        if(op.DoorSystemID !== -1) {
          ventFrame = Designer.UnifiedModel.doorFrames.find(d => d.doorSystemID == op.DoorSystemID);
        }
        else{
          ventFrame = Designer.UnifiedModel.ventFrames.find(v => v.glassID == infill.InfillID);

        }
        let ventOutDims = null;
        
        if(op.DoorSystemID !== -1){
          ventOutDims = {
            xmax: ventFrame.dimensions.xmax,
            xmin: ventFrame.dimensions.xmin,
            ymax: ventFrame.dimensions.ymax,
            ymin: ventFrame.dimensions.ymin
          }
          if( Designer.UnifiedModel.doorFrames.find(d => d.doorSystemID == op.DoorSystemID).doorOperableType.includes("Double")){
            ventOutDims.xmax = (ventOutDims.xmax + ventOutDims.xmin) / 2;
          }
        }
        else{
          ventOutDims = {
            xmax: ventFrame.dimensions.xmax + 30,
            xmin: ventFrame.dimensions.xmin - 30,
            ymax: ventFrame.dimensions.ymax + 30,
            ymin: ventFrame.dimensions.ymin - 30
          }
        }
        let glassDims = null;
        if(op.DoorSystemID !== -1){
          
          glassDims = {
            xmax: ventOutDims.xmax - 37 - parseFloat(ventFrame.doorLeafArticleOutsideWidth) + 14,
            xmin: ventOutDims.xmin + 37 + parseFloat(ventFrame.doorLeafArticleOutsideWidth) - 14,
            ymax: ventOutDims.ymax - 37 - parseFloat(ventFrame.doorLeafArticleOutsideWidth) + 14,
            ymin: ventOutDims.ymin + 37 + parseFloat(ventFrame.doorLeafArticleOutsideWidth) - 14
          }
        }
        else{
          glassDims = {
            xmax: ventOutDims.xmax - 37 - parseFloat(ventFrame.outsideWidth) + 14,
            xmin: ventOutDims.xmin + 37 + parseFloat(ventFrame.outsideWidth) - 14,
            ymax: ventOutDims.ymax - 37 - parseFloat(ventFrame.outsideWidth) + 14,
            ymin: ventOutDims.ymin + 37 + parseFloat(ventFrame.outsideWidth) - 14
          }
        }

        const glazingSystem = this.Geometry.GlazingSystems.find(x => x.GlazingSystemID == infill.GlazingSystemID);
        const glassThickness = glazingSystem.Plates.map(x => x.H).reduce((a, b) => a + b, 0);
        const data = this.ventCheckCriteria(ventOutDims, glassThickness, glassDims);
        const LockingPointOption = data.LockingPointOption == null? 0: data.LockingPointOption;
        const ventWeight = data.weight;
        const ventCheckMsg = data.msg;
        if(op.DoorSystemID !== -1) {
          let door = Designer.UnifiedModel.doorFrames.find(d => d.doorSystemID == op.DoorSystemID);
          
          const X = (ventFrame.dimensions.xmax + ventFrame.dimensions.xmin) / 2;
          const Y = (ventFrame.dimensions.ymax + ventFrame.dimensions.ymin) / 2;
          let topCutBack = Designer.UnifiedModel.GetGlassCutBack(Designer.UnifiedModel.Members.find(m=> m.MemberID == infill.BoundingMembers[1]).MemberType);
          let leftCutBack = Designer.UnifiedModel.GetGlassCutBack(Designer.UnifiedModel.Members.find(m=> m.MemberID == infill.BoundingMembers[0]).MemberType);
          let rightCutBack = Designer.UnifiedModel.GetGlassCutBack(Designer.UnifiedModel.Members.find(m=> m.MemberID == infill.BoundingMembers[2]).MemberType);
          let count = this.determineHingeCount(ventOutDims.xmax - ventOutDims.xmin, ventOutDims.ymax - ventOutDims.ymin, ventWeight, op.DoorSystemID, X, Y, infill.InfillID, topCutBack, leftCutBack + rightCutBack);
          // if(count == 0){
            
          // }
          if(!count.ventQuickCheckPassed) ventQuickCheckPassed = false;
          door.HingeCondition = count.hingeCount;
          door.generateHinges();
          let TopMember = this.Members.find(m => m.MemberID == infill.BoundingMembers[1])
          if(TopMember.MemberType == 6 || TopMember.MemberType == 3){
            let adjacentGlass = this.Infills.find(i=> i.BoundingMembers[3] == TopMember.MemberID);
            let TopAdjacentMember = this.Members.find(m=>m.MemberID == adjacentGlass.BoundingMembers[1]);
            if(TopAdjacentMember.MemberType == 6 || TopAdjacentMember.MemberType == 3){
              const X = (ventFrame.dimensions.xmax + ventFrame.dimensions.xmin) / 2;
              const Y = (ventFrame.dimensions.ymax + ventFrame.dimensions.ymin) / 2;
              const warning = {
                X: X,
                Y: Y,
                infillID: infill.InfillID,
                type: "vent check warning",
                warningMessage: "There is only maximum 1 toplight allowed. Please remove necessary intermediates."
              }
              this.Warnings.push(warning);
              ventQuickCheckPassed = false;
            }
          }
          let BottomPoints = Designer.UnifiedModel.Points.filter(p => Math.abs(p.Y) < 1e-4);
          let BottomMember = Designer.UnifiedModel.Members.find(m=>m.MemberType == 31);
          BottomPoints = BottomPoints.sort((a, b) => (a.X < b.X) ? 1 : -1);
          if(BottomPoints.length >= 4 && BottomPoints.find(m=> m.PointID == BottomMember.PointA).X > BottomPoints.find(m => m.PointID == BottomMember.PointB).X){
            let RightSideLight = BottomPoints.indexOf(BottomPoints.find(m=> m.PointID == BottomMember.PointB));
            let LeftSideLight = BottomPoints.indexOf(BottomPoints.find(m=> m.PointID == BottomMember.PointA));
            if(RightSideLight < (BottomPoints.length - 2) || LeftSideLight > 1){
                const X = (ventFrame.dimensions.xmax + ventFrame.dimensions.xmin) / 2;
                const Y = (ventFrame.dimensions.ymax + ventFrame.dimensions.ymin) / 2;
                const warning = {
                  X: X,
                  Y: Y,
                  infillID: infill.InfillID,
                  type: "vent check warning",
                  warningMessage: "There is only maximum 1 sidelight allowed on each side of the door vent. please remove an intermediate or move the door to a different location."
                }
                this.Warnings.push(warning);
                ventQuickCheckPassed = false;
            }
          }
          else if(BottomPoints.length >= 4){
            let RightSideLight = BottomPoints.indexOf(BottomPoints.find(m=> m.PointID == BottomMember.PointA));
            let LeftSideLight = BottomPoints.indexOf(BottomPoints.find(m=> m.PointID == BottomMember.PointB));
            if(RightSideLight < (BottomPoints.length - 2) || LeftSideLight > 1){
              
              const X = (ventFrame.dimensions.xmax + ventFrame.dimensions.xmin) / 2;
              const Y = (ventFrame.dimensions.ymax + ventFrame.dimensions.ymin) / 2;
              const warning = {
                X: X,
                Y: Y,
                infillID: infill.InfillID,
                type: "vent check warning",
                warningMessage: "There is only maximum 1 sidelight allowed on each side of the door vent. please remove an intermediate or move the door to a different glass."
              }
              this.Warnings.push(warning);
              ventQuickCheckPassed = false;
            }
          }
        }
        Designer.UnifiedModelOperator.updateVentCheckResult(infill.InfillID, ventWeight, LockingPointOption);

        if(op.DoorSystemID == -1 && !LockingPointOption) {
          const X = (ventFrame.dimensions.xmax + ventFrame.dimensions.xmin) / 2;
          const Y = (ventFrame.dimensions.ymax + ventFrame.dimensions.ymin) / 2;
          const msg = ventCheckMsg == null? " This vent frame failed quick check! ": " This vent frame failed quick check! " + ventCheckMsg;
          const warning = {
            X: X,
            Y: Y,
            infillID: infill.InfillID,
            type: "vent check warning",
            warningMessage: msg
          }
          this.Warnings.push(warning);
          ventQuickCheckPassed = false;
        }
        if(op.DoorSystemID == -1){
          const handlePosition = infill.HandlePosition;
          const handleCheckMsg = this.handleCheckCriteria(ventOutDims, handlePosition);
          if (handleCheckMsg && op.DoorSystemID == -1) {
            const X = (ventFrame.dimensions.xmax + ventFrame.dimensions.xmin) / 2;
            const Y = (ventFrame.dimensions.ymax + ventFrame.dimensions.ymin) / 2;
            const msg = " This vent handle is out of bounds! " + handleCheckMsg;
            const warning = {
              X: X,
              Y: Y,
              infillID: infill.InfillID,
              type: "vent check warning",
              warningMessage: msg
            }
            this.Warnings.push(warning);
            ventQuickCheckPassed = false;
            ventFrame.failedQuickCheck = true;
            ventFrame.setHandleColor();
            //ventFrame.handle.material = ventFrame.handleMaterial;
          }
          else{
            ventFrame.failedQuickCheck = false;
            ventFrame.setHandleColor();
          }
        }
      }
    }
    return ventQuickCheckPassed;
  }
  determineHingeCount(w, h, kg, DoorSystemID, X, Y, i, cb, scb){
    let hingeCount = 0;
    let ventQuickCheckPassed = true;
    if(w > 800 && w < 975){
        if (h <= 2100 && h >= 1800 && kg <= 120){
          hingeCount = 1;
        }
        else if (h <= 2100 && h >= 1800 && kg > 120 && kg <= 150){
          hingeCount = 3;
        }
        else if (h <= 2500 && h > 2100 && kg <= 120){
          hingeCount = 2;
        }
        else if (h <= 2500 && h > 2100 && kg > 120 && kg <= 150){
          hingeCount = 4;
        }
        else{
          hingeCount = 0; //any height or weight outside this range should be an error
          if(h < 1800){
            const warning = {
              X: X,
              Y: Y,
              infillID: i,
              type: "vent check warning",
              warningMessage: "Door is too short, minimum door vent height is 1800 mm. Please increase height by " + (1800 - h).toString() + " mm."
            }
            this.Warnings.push(warning);
            ventQuickCheckPassed = false;
          }
          else if (h > 2500){
            const warning = {
              X: X,
              Y: Y,
              infillID: i,
              type: "vent check warning",
              warningMessage: "Door is too tall, maximum door vent height is 2500 mm. Please decrease height by " + (h - 2500).toString() + " mm."
            }
            this.Warnings.push(warning);
            ventQuickCheckPassed = false;
          }
          else{
            const warning = {
              X: X,
              Y: Y,
              infillID: i,
              type: "vent check warning",
              warningMessage: "Door is incorrect weight"
            }
            this.Warnings.push(warning);
            ventQuickCheckPassed = false;
          }
        }
    }
    else if (w > 975 && w < 1200){
        let y = (2 * (w - 975)) + 1800; //y is point on line and h must be above or below this point
        if (h <= y){ //height is on or below sloped line
        
            if (h <= 2100 && h >= 1800){
              hingeCount = 3;
            }
            else if (h > 2100 && h <= 2500){
              hingeCount = 4;
            }
            else{
              hingeCount = 0; //any height outside range is error
              if(h < 1800){
                const warning = {
                  X: X,
                  Y: Y,
                  infillID: i,
                  type: "vent check warning",
                  warningMessage: "Door is too short, minimum door vent height is 1800 mm. Please increase height by " + (1800 - h).toString() + " mm."
                }
                this.Warnings.push(warning);
                ventQuickCheckPassed = false;
              }
              else if (h > 2500){
                const warning = {
                  X: X,
                  Y: Y,
                  infillID: i,
                  type: "vent check warning",
                  warningMessage: "Door is too tall, maximum door vent height is 2500 mm. Please decrease height by " + (h - 2500).toString() + " mm."
                }
                this.Warnings.push(warning);
                ventQuickCheckPassed = false;
              }
            }
        }
        else if (h > y){ //height is above sloped line
            if (h >= 1800 && h <= 2100 && kg <= 120){
              hingeCount = 1;
            }
            else if (h >= 1800 && h <= 2100 && kg > 120 && kg <= 150){
              hingeCount = 3;
            }
            else if (h > 2100 && h <= 2500 && kg <= 120){
              hingeCount = 2;
            }
            else if (h > 2100 && h <= 2500 && kg > 120 && kg <= 150){
              hingeCount = 4;
            }
            else{
              hingeCount = 0; //any height outside range or weight outside range is error
              if(h < 1800){
                const warning = {
                  X: X,
                  Y: Y,
                  infillID: i,
                  type: "vent check warning",
                  warningMessage: "Door is too short, minimum door vent height is 1800 mm. Please increase height by " + (1800 - h).toString() + " mm."
                }
                this.Warnings.push(warning);
                ventQuickCheckPassed = false;
              }
              else if (h > 2500){
                const warning = {
                  X: X,
                  Y: Y,
                  infillID: i,
                  warningMessage: "Door is too tall, maximum door vent height is 2500 mm. Please decrease height by " + (h - 2500).toString() + " mm."
                }
                this.Warnings.push(warning);
                ventQuickCheckPassed = false;
              }
              else{
                const warning = {
                  X: X,
                  Y: Y,
                  infillID: i,
                  type: "vent check warning",
                  warningMessage: "Door is incorrect weight"
                }
                this.Warnings.push(warning);
                ventQuickCheckPassed = false;
              }
            }
        }
    }
    else if (w > 1200 && w < 1250) //red zone
    {
      let z = (2 * (w - 1200)) + 1800; //for width range 1200 - 1250, any height below slope is error
      if (h < z) //height is below slope, so it is an error
      {
        hingeCount = 0;
        const warning = {
          X: X,
          Y: Y,
          infillID: i,
          type: "vent check warning",
          warningMessage: "Door is too short for given width. Either increase height or decrease width"
        }
        this.Warnings.push(warning);
        ventQuickCheckPassed = false;
      }
      else if (h >= z) //height is on or above second sloped line
      {
        if (h >= 1800 && h <= 2100){
          hingeCount = 3;
        }
        else if (h > 2100 && h <= 2500){
          //in this height range, need to check height against first slope
          let y = (2 * (w - 975)) + 1800;
          if (h <= y) {
          //on or below first slope
            hingeCount = 3;
          }
          else if (h > y) {
          //above first slope
            if (kg <= 120){
              hingeCount = 2;
            }
            else if (kg > 120 && kg <= 150){
              hingeCount = 4;
            }
            else{
              hingeCount = 0; //any weight outside range is error
              const warning = {
                X: X,
                Y: Y,
                infillID: i,
                type: "vent check warning",
                warningMessage: "Door is incorrect weight."
              }
              this.Warnings.push(warning);
              ventQuickCheckPassed = false;
            }
          }
        }
        else{
          hingeCount = 0; //any height outside range or weight outside range is error
          if(h < 1800){
            const warning = {
              X: X,
              Y: Y,
              infillID: i,
              type: "vent check warning",
              warningMessage: "Door is too short, minimum door vent height is 1800 mm. Please increase height by " + (1800 - h).toString() + " mm."
            }
            this.Warnings.push(warning);
            ventQuickCheckPassed = false;
          }
          else if (h > 2500){
            const warning = {
              X: X,
              Y: Y,
              infillID: i,
              type: "vent check warning",
              warningMessage: "Door is too tall, maximum door vent height is 2500 mm. Please decrease height by " + (h - 2500).toString() + " mm."
            }
            this.Warnings.push(warning);
            ventQuickCheckPassed = false;
          }
          else{
            const warning = {
              X: X,
              Y: Y,
              infillID: i,
              type: "vent check warning",
              warningMessage: "Door is incorrect weight."
            }
            this.Warnings.push(warning);
            ventQuickCheckPassed = false;
          }
        }
      }
    }
    else{
      if(w < 800){
        const warning = {
          X: X,
          Y: Y,
          infillID: i,
          type: "vent check warning",
          warningMessage: "Door is too narrow, minimum door vent width is 800 mm per door vent. Please increase width by " + (800 - w).toString() + " mm for single door vent and  " +(2*(800 - w)).toString() + " mm for double door vent."
        }
        this.Warnings.push(warning);
        ventQuickCheckPassed = false;
      }
      else if (w > 1250){
        const warning = {
          X: X,
          Y: Y,
          infillID: i,
          type: "vent check warning",
          warningMessage: "Door is too wide, maximum door vent width is 1250 mm per door vent. Please decrease width by " + (w - 1250).toString() + " mm for single door vent and  " + (2*(w - 1250)).toString() + " mm for double door vent."
        }
        this.Warnings.push(warning);
        ventQuickCheckPassed = false;
      }
      if(h < 1800){
        const warning = {
          X: X,
          Y: Y,
          infillID: i,
          type: "vent check warning",
          warningMessage: "Door is too short, minimum door vent height is 1800 mm. Please increase height by " + (1800 - h).toString() + " mm."
        }
        this.Warnings.push(warning);
        ventQuickCheckPassed = false;
      }
      else if (h > 2500){
        const warning = {
          X: X,
          Y: Y,
          infillID: i,
          type: "vent check warning",
          warningMessage: "Door is too tall, maximum door vent height is 2500 mm. Please decrease height by " + (h - 2500).toString() + " mm."
        }
        this.Warnings.push(warning);
        ventQuickCheckPassed = false;
      }
    }
    Designer.UnifiedModelOperator.updateHingeCount(DoorSystemID, hingeCount);
    return {hingeCount, ventQuickCheckPassed};
  }

  ventCheckCriteria(ventOutDims, glassThickness, glassDims) {
    const width = ventOutDims.xmax - ventOutDims.xmin;
    const height = ventOutDims.ymax - ventOutDims.ymin;
    const length = 2 * width + 2 * height;
    const ventArticleWeight = length * 0.0025 + 0.1121;  //kg. Emperical equation from 28 vent cases.
    const glassWidth = glassDims.xmax - glassDims.xmin;
    const glassHeight = glassDims.ymax - glassDims.ymin;
    const glassArea = glassWidth * glassHeight;
    const glassWeight = glassArea * glassThickness * 2.5E-6;  //kg
    const weight = ventArticleWeight + glassWeight;
    let LockingPointOptions = [];

    if (width >= 570 && width <= 1400 && height >= 780 && height <= 1550 && weight <= 130) LockingPointOptions.push(1);
    if (width >= 570 && width <= 1400 && height >= 1550 && height <= 2000 && weight <= 160) LockingPointOptions.push(2);
    if (width >= 1400 && width <= 1500 && height >= 780 && height <= 1550 && weight <= 130) LockingPointOptions.push(3);
    if (width >= 1400 && width <= 1500 && height >= 1550 && height <= 2000 && weight <= 160) LockingPointOptions.push(4);
    if (width >= 570 && width <= 1400 && height >= 1500 && height <= 1550 && weight >= 130 && weight <= 160) LockingPointOptions.push(1);
    if (width >= 1400 && width <= 1500 && height >= 1500 && height <= 1550 && weight >= 130 && weight <= 160) LockingPointOptions.push(3);
    if (width >= 570 && width <= 1000 && height >= 2000 && height <= 2200 && weight <= 160) LockingPointOptions.push(2);

    let LockingPointOption = null;
    if (LockingPointOptions.length > 0) {
      LockingPointOption = Math.min(...LockingPointOptions);
    }

    let msg = "";
    if (width < 570) msg = ` Vent is too narrow, minimum allowed width is 570 mm. Please increase the width by ${570 - width} mm; `;
    if (width > 1500) msg = ` Vent is too wide, maxiumum allowed width is 1500 mm. Please decrease the width by ${width - 1500} mm; `;
    if (height < 780) msg += ` Vent is too short, minimum allowed height is 780 mm. Please increase the height by ${780 - height} mm; `;
    if (width <= 1000 && height > 2200) msg += ` Vent is too tall, maximum allowed height is 2200 mm if width is under 1000 mm. Please decrease the height by ${height - 2200} mm to be within these ranges; `;
    if (width > 1000 && height > 2000) msg += ` Vent is too tall, maximum allowed height is 2000 mm if width is over 1000 mm. Please decrease the height by ${height - 2000} mm and/or decrease the width by ${width - 1000} mm to be within these ranges; `;
    if (weight > 160) msg += ` Vent is too heavy, maximum allowed weight is 160 kg. To reduce weight, please select a different glass option or make the vent dimensions smaller; `;

    const data = { weight: weight, LockingPointOption: LockingPointOption, msg: msg };

    return data;
  }

  handleCheckCriteria(ventOutDims, handlePosition) {
    let handleCheckPassed = true;
    const hgr = handlePosition;
    const vHeight = ventOutDims.ymax - ventOutDims.ymin;
    const isBS = Designer.UnifiedModel.FrameSystem.SystemType.includes("BS");
    let msg = null;
    if (vHeight <= 1000) {
      if (isBS) {
        if (vHeight < 430) msg = " Vent is too short, minimum allowed height is 430 mm. Please increase the height; ; ";
        if (hgr < 215 || vHeight - hgr < 215) msg = ` Please adjust handle position so that it is greater than 215 mm and less than ${vHeight - 215} mm; `;
      }
      else {
        if (vHeight < 540) msg = " Vent is too short, minimum allowed height is 540 mm. Please increase the height; ; ";
        if (hgr < 270 || vHeight - hgr < 270) msg = ` Please adjust handle position so that it is greater than 270 mm and less than ${vHeight - 270} mm; `;
      }
    }
    else if (vHeight <= 1500) {
      if (hgr < 500 || vHeight - hgr < 500) msg = ` Please adjust handle position so that it is greater than 500 mm and less than ${vHeight - 500} mm; `;
    }
    else if (vHeight <= 2000) {
      if (hgr < 750 || vHeight - hgr < 750) msg = ` Please adjust handle position so that it is greater than 750 mm and less than ${vHeight - 750} mm; `;
    }
    else {
      if (hgr < 1000 || vHeight - hgr < 1000) msg = ` Please adjust handle position so that it is greater than 1000 mm and less than ${vHeight - 1000} mm; `;
    }
    return msg;
  }

  slidingDoorStructuralCheck(){
    for (let Vent of this.slidingDoor.ventFrames) {
      if(this.slidingDoor.ventFrames.indexOf(Vent) == this.slidingDoor.ventFrames.length -1 ) continue;
      let warning = this.structuralSlidingDoorCheckCriteria(Vent, this.slidingDoor.ventFrames.indexOf(Vent), this.slidingDoor.interlockReinforcement, this.slidingDoor.ventArticleName.toString().substring(9));
      if (warning) {
        this.Warnings.push(warning);
        break;
      }
    }
    if (this.Warnings.length > 0) return false;
    return true;
  }

  structuralSlidingDoorCheckCriteria(Vent, index, isReinforced, articleNum){
    // find coefficients
    const w = this.WindLoad;  
    let coef = null;
    let interlockOffset = (-20 + ((parseInt(Designer.UnifiedModel.doorFrames[0].doorVentArticle.outsideWidth) + 20) / 2))
    let outerFrameWidth = (Designer.UnifiedModel.outerFrame.articleWidth - 8);
    let width = Designer.UnifiedModel.getWidth();       
    //calculate total width considering all vent widths non-overlapping
    //take value, subtract (outer frame width -8) * 2
    width -=  outerFrameWidth * 2;

    //calculate number of interlocks
    let numInterlocks = 0;
    if(Designer.UnifiedModel.OperabilitySystems[0].VentOperableType == "SlidingDoor-Type-3F" || 
    Designer.UnifiedModel.OperabilitySystems[0].VentOperableType == "SlidingDoor-Type-2D1.i" ){
        //subtract 8 if has two vents on same track 
        width -= 8;
        numInterlocks = this.slidingDoor.ventFrames.length - 2;
    }
    else{
        numInterlocks = this.slidingDoor.ventFrames.length - 1;
    }

    //add number of interlocks * interlock offset (31)
    width += (numInterlocks * interlockOffset*2);
    
    //divide by number of vents
    const B = (width / this.slidingDoor.ventFrames.length) / 1000;

    let type = null;
    if(articleNum == "504020" || articleNum == "504010"){
      type = "rolling";
    }
    else{
      type = "snap";
    }
  
    if (index != this.slidingDoor.ventFrames.length - 1 && this.slidingDoor.ventFrames[index].Track == this.slidingDoor.ventFrames[index+1].Track){
      if(isReinforced){
        if(type == "rolling"){
          coef = this.slidingDoorStructuralQuickCheckCoefficients.find(c => c.InterlockType == "midpointReinforced" && c.windLoad == w.toString() && c.type == "rolling" && c.articleNum == articleNum);
        }
        else{
          coef = this.slidingDoorStructuralQuickCheckCoefficients.find(c => c.InterlockType == "midpointReinforced" && c.windLoad == w.toString() );
        }
      }
      else{
        if(type == "rolling"){
          coef = this.slidingDoorStructuralQuickCheckCoefficients.find(c => c.InterlockType == "midpoint"&& c.windLoad == w.toString() && c.type == "rolling" && c.articleNum == articleNum);
        }
        else{
          coef = this.slidingDoorStructuralQuickCheckCoefficients.find(c => c.InterlockType == "midpoint"&& c.windLoad == w.toString() && c.type == "snap");
        }
      }
    }
    else{
      if(isReinforced){
        if(type == "rolling"){
          coef = this.slidingDoorStructuralQuickCheckCoefficients.find(c => c.InterlockType == "interlockReinforced"&& c.windLoad == w.toString() && c.type == "rolling" && c.articleNum == articleNum);
        }
        else{
          coef = this.slidingDoorStructuralQuickCheckCoefficients.find(c => c.InterlockType == "interlockReinforced"&& c.windLoad == w.toString() && c.type == "snap");
        }
      }
      else{
        if(type == "rolling"){
          coef = this.slidingDoorStructuralQuickCheckCoefficients.find(c => c.InterlockType == "interlock"&& c.windLoad == w.toString() && c.type == "rolling" && c.articleNum == articleNum);
        }
        else{
          coef = this.slidingDoorStructuralQuickCheckCoefficients.find(c => c.InterlockType == "interlock"&& c.windLoad == w.toString() && c.type == "snap");
        }
      }
    }   
    const length = Designer.UnifiedModel.getHeight();


    // derive L, check criteria
    let msg = "";
    if(coef != null)
    {
      const L = coef.a1 * Math.pow(B, 4) + coef.b1 * Math.pow(B, 3) + coef.c1 *Math.pow(B,2) + coef.d1 * B + coef.e1;
      if (length > L * 1000) {
        msg = "This member failed the sliding door structural quick check! Please reduce configuration dimensions, reduce wind load, add reinforcement, or change to a profile with more capacity.";
      }
      else {
        return null;
      }
    }
    else{
      msg = "Unable to retrieve wind load";
    }
    
    
  
    // warning symbol LOCATION
    let X = Designer.UnifiedModel.getWidth() / 2;
    let Y = Designer.UnifiedModel.getHeight() / 2;
    let intersectP = this.Points.find(p => Math.abs(p.Y - Y) < 0.0001 && Math.abs(p.X - X) < 30);
    if (intersectP) X = intersectP.X + 70;
    let warning = {
      X: X,
      Y: Y,
      memberID: 1,
      type: "structural check warning",
      warningMessage: msg
    }
    
    return warning;
  }


  createWarningSymbols() {
    this.WarningSymbolGroup = new THREE.Group();
    this.WarningSymbolGroup.name = "WarningSymbolGroup_mainModel";
    for (let warning of this.Warnings) {
      const sprite = new THREE.Sprite(this.material);
      if (warning.type == "structural check warning") {
        sprite.name = "Member ID " + warning.memberID + " " + warning.type;
      }
      else if (warning.type == "vent check warning") {
        sprite.name = "Infill ID " + warning.infillID + " " + warning.type;
      }

      sprite.position.set(warning.X, warning.Y, 100);
      if(this.productType == "SlidingDoor"){
        sprite.scale.set(120, 120, 1);

      }
      else{
        sprite.scale.set(80, 80, 1);
      }
      sprite.userData.memberID = warning.memberID;
      sprite.userData.infillID = warning.infillID;
      sprite.userData.clickable = true;
      sprite.userData.type = "quickcheck_warningsymbol";
      this.WarningSymbolGroup.add(sprite);
    }
    Designer.UnifiedModel.mainModel.add(this.WarningSymbolGroup);
  }

  highlightWarningSymbol(mesh) {
    mesh.material = this.material_hl;
  }

  clearhighlightedWarningSymbol(mesh) {
    mesh.material = this.material;
  }

  clickWarningSymbol(mesh) {
    let warnings;
    if (mesh.userData.memberID > 0) {
      warnings = this.Warnings.filter(w => w.memberID == mesh.userData.memberID).map(w => w.warningMessage);
    }
    else if (mesh.userData.infillID > 0) {
      warnings = this.Warnings.filter(w => w.infillID == mesh.userData.infillID).map(w => w.warningMessage);
    }
    let data = { warningMessage: warnings };
    dataExchange.sendParentMessage('selectWarningSymbol', data);   // pass an array of warning messages in data
  }
}
