/**
 * class for visualizing 3D model of unified model in "sps-designer-viewer"
**/
class DesignerUnifiedModel {
    constructor() {
        this.system = null;
        this.Geometry = null;
        this.FrameSystem = null;
        this.Points = null;
        this.Members = null;
        this.GlassList = null;
        this.OperabilitySystems = null;

        this.ThermalFrames = null;
        this.GlassGeometricInfo = null;
        this.MemberResults = null;

        this.width = 0;
        this.height = 0;

        this.modelName = "__MainModel";
        this.mainModel = null;
        this.intermediates = [];

        // for windows
        this.outerFrameArticleName = null;
        this.outerFrameBottomArticleName = null;
        this.glassPanes = [];
        this.ventFrames = [];
        this.doorFrames = [];
        this.thermalResultLabels = null;

        //for facades
        this.facadeMajorMullions = [];
        this.insertOuterFrames = [];
        this.facadeSlabAnchors = [];
        this.facadeReinforcements = [];
        this.facadeSpliceJoints = [];
        this.facadeMullionSlabFixedAnchorMesh = null;
        this.facadeMullionSlabSlidingAnchorMesh = null;

        //for UDC
        this.udcFrameArticleName = null;
        this.udcBottomFrameArticleName = null;
        this.udcFrame = null;

        this.UnifiedModelJSON = null;
        this.ProductType = null;
        this.FacadeType = null;
        
        //for quickcheck
        this.quickCheck = null;

        this.isOrderPlaced = false;
        this.isDoorModel = false;
        this.wasDoorModel = false;
        this.prevDoorSystems = null;
        this.prevFrameSystems = null;
        this.prevPoints = null;
        this.prevVentOperableType = null;
    }

    // draw new unified modela
    drawModel(UnifiedModelJSON = this.UnifiedModelJSON) {
        this.UnifiedModelJSON = UnifiedModelJSON;
        // load new unified model
        const ModelInput = UnifiedModelJSON.ModelInput;
        const ProductType = UnifiedModelJSON.ProblemSetting.ProductType;
        const FacadeType = UnifiedModelJSON.ProblemSetting.FacadeType;
        this.ProductType = ProductType;
        this.FacadeType = FacadeType;
        this.Geometry = ModelInput.Geometry;
        this.FrameSystem = ModelInput.FrameSystem;
        this.DoorSystem = ModelInput.DoorSystem;
        this.Points = this.Geometry.Points;
        this.Members = this.Geometry.Members;
        this.GlassList = this.Geometry.Infills;
        this.OperabilitySystems = ModelInput.Geometry.OperabilitySystems;
        if(UnifiedModelJSON.SRSProblemSetting !== null && UnifiedModelJSON.SRSProblemSetting !== undefined){
            this.isOrderPlaced = UnifiedModelJSON.SRSProblemSetting.isOrderPlaced;
        } else {
            this.isOrderPlaced = false;
        }
        if (ProductType == "Window") {
            this.Sections = this.Geometry.Sections;
            this.isDoorModel = this.CheckIsDoorModel(this.Geometry);
            if (this.isDoorModel) {         // if it is a door model
                this.drawDoorModel(UnifiedModelJSON);
                this.prevDoorSystems = ModelInput.Geometry.DoorSystems;
            } else {                    // if it is not a door model
                this.drawWindowModel(UnifiedModelJSON);
            }
        }
        else if (ProductType == "Facade" && FacadeType == "mullion-transom") {
            this.Sections = this.Geometry.FacadeSections;
            this.SlabAnchors = this.Geometry.SlabAnchors;
            this.Reinforcements = this.Geometry.Reinforcements;
            this.SpliceJoints = this.Geometry.SpliceJoints;
            this.loadOBJs();
            this.drawFacadeModel(UnifiedModelJSON);
        }
        else if (ProductType == "Facade" && FacadeType == "UDC") {
            this.Sections = this.Geometry.FacadeSections;
            this.drawUDCModel(UnifiedModelJSON);
        }
        else if(ProductType == "SlidingDoor"){
            this.Sections = this.Geometry.Sections;
            this.drawSlidingDoorModel(UnifiedModelJSON);
            this.prevVentOperableType = this.OperabilitySystems[0].VentOperableType;
        }
        else{
            this.removeModel();
        }
        
        this.runQuickCheck(Designer.DisplaySettings.currentDisplaySetting.showQuickCheckSymbols);
        this.wasDoorModel = this.isDoorModel;
        this.prevPoints = JSON.parse(JSON.stringify(this.Points)); //deep clone
        this.prevFrameSystem = ModelInput.FrameSystem;
        Designer.Scene.PointLights(this.mainModel);
    }



    loadOBJs() {
        if (this.FrameSystem.SystemType.indexOf("35") > 0) {
            this.facadeMullionSlabFixedAnchorMesh = Designer.Materials.Slab_Anchor_35_Fixed;
            this.facadeMullionSlabSlidingAnchorMesh = Designer.Materials.Slab_Anchor_35_Sliding;
        }
        else if (this.FrameSystem.SystemType.indexOf("50") > 0) {
            this.facadeMullionSlabFixedAnchorMesh = Designer.Materials.Slab_Anchor_50_Fixed;
            this.facadeMullionSlabSlidingAnchorMesh = Designer.Materials.Slab_Anchor_50_Sliding;
        }
        else if (this.FrameSystem.SystemType.indexOf("60") > 0) {
            this.facadeMullionSlabFixedAnchorMesh = Designer.Materials.Slab_Anchor_60_Fixed;
            this.facadeMullionSlabSlidingAnchorMesh = Designer.Materials.Slab_Anchor_60_Sliding;
        }
    }

    // remove threejs model from Scene
    removeModel() {
        Designer.Scene.remove(this.mainModel);
        this.UnifiedModelJSON = null;
        this.Points = null;
        this.Members = null;
        this.GlassList = null;
        this.Sections = null;
        this.width = 0;
        this.height = 0;
        this.minSpace = 200;  // minimum space between two memebers
        this.facadeXSpans = [];
        this.facadeXSpansEdited = [];
        this.facadeYSpans = [];
        this.facadeYSpansEdited = [];
        this.quickCheck = null;
        this.initialized = false
    }


    // ************************************
    // Quick Check Module start here
    // ************************************
    runQuickCheck(showQuickCheckSymbols = false) {
        //grab features of current user, check if preference table allows quick check
        let features = JSON.parse(localStorage.getItem("current_User"));
        features = JSON.parse(features).Features;
        if(this.UnifiedModelJSON != null && features.find(f=>f.Feature == "QuickCheck")){
            if (!showQuickCheckSymbols) return;
            if (this.ProductType == "Window") {
                const isDoorModel = this.CheckIsDoorModel(this.Geometry);
                if (isDoorModel) {         // if it is a door model
                    this.runDoorQuickCheck(Designer.DisplaySettings.currentDisplaySetting.showQuickCheckSymbols);
                } else {                    // if it is not a door model
                    this.runWindowQuickCheck(Designer.DisplaySettings.currentDisplaySetting.showQuickCheckSymbols);
                }
            }
            else if (this.ProductType == "SlidingDoor")
            {
                this.runSlidingDoorQuickCheck(Designer.DisplaySettings.currentDisplaySetting.showQuickCheckSymbols);
            }
        }
    }

    runSlidingDoorQuickCheck(){
        if (this.quickCheck) this.mainModel.remove(this.quickCheck.WarningSymbolGroup);
        this.quickCheck = new DesignerQuickCheck(this.Geometry, false, this.ProductType);
        if(!Designer.Camera.outside && this.quickCheck.WarningSymbolGroup){
            Designer.UnifiedModel.quickCheck.WarningSymbolGroup.position.z = -275;
        }
    }

    runWindowQuickCheck() {
        if (this.quickCheck) this.mainModel.remove(this.quickCheck.WarningSymbolGroup);
        this.quickCheck = new DesignerQuickCheck(this.Geometry, false, this.ProductType);
        if(!Designer.Camera.outside && this.quickCheck.WarningSymbolGroup){
            Designer.UnifiedModel.quickCheck.WarningSymbolGroup.position.z = -275;
        }
    }

    runDoorQuickCheck() {
        if (this.quickCheck) this.mainModel.remove(this.quickCheck.WarningSymbolGroup);
        this.quickCheck = new DesignerQuickCheck(this.Geometry, true, this.ProductType);
        if(!Designer.Camera.outside && this.quickCheck.WarningSymbolGroup){
            Designer.UnifiedModel.quickCheck.WarningSymbolGroup.position.z = -275;
        }
    }


    // ************************************
    // Window Module start here
    // ************************************
    drawWindowModel(UnifiedModelJSON) {
        if (UnifiedModelJSON.AnalysisResult && UnifiedModelJSON.AnalysisResult.ThermalResult) {
            this.ThermalFrames = UnifiedModelJSON.AnalysisResult.ThermalResult.ThermalUIResult.ThermalFrames;

        }

        if (UnifiedModelJSON.AnalysisResult && UnifiedModelJSON.AnalysisResult.StructuralResult) {
            this.MemberResults = UnifiedModelJSON.AnalysisResult.StructuralResult.MemberResults;
        }

        // check if the new unified model loaded has the same outer frame as existing model in 3D viewer. If so, skip regenerate outer frame since it is the most expensive.
        let dimensions = this.getOuterFrameDimensions();
        let outerFrameArticleName = this.getOuterFrameArticleName();
        let isOuterFrameSame = false;   // if the new unified model loaded has the same outer frame as existing model in 3D viewer
        if (this.width == dimensions.width && this.height == dimensions.height && this.outerFrameArticleName == outerFrameArticleName && this.isDoorModel == this.wasDoorModel) {
            isOuterFrameSame = true;
        }
        else {
            isOuterFrameSame = false;
            this.width = dimensions.width;
            this.height = dimensions.height;
            this.outerFrameArticleName = outerFrameArticleName;
        }


        // initialize mainModel
        let mainModel = this.mainModel;
        if (!isOuterFrameSame) {
            if (mainModel) {
                Designer.Scene.remove(mainModel);;  //remove whole model
            }
            // initialize mainModel with outer frame
            mainModel = this.InitializeOuterFrame();
            Designer.Scene.add(mainModel);
        }
        else {
            // remove existing intermediates, Glass Panes and Vent Frames
            this.removeIntermediateGlassVentFrame(mainModel);
        }


        this.intermediates = [];
        this.glassPanes = [];
        this.ventFrames = [];
        this.doorFrames = [];
        this.thermalResultLabels = [];
        // redraw new transom/mullion.
        this.addIntermediates(mainModel);
        // redraw new glass and vent frame
        this.addGlassAndVentFrame(mainModel);
        // redraw thermal result label
        if (this.ThermalFrames) this.addThermalResultLabel(mainModel);
        if(this.UnifiedModelJSON.ModelInput.FrameSystem.AluminumColor !== null && this.height <= 4000 && this.width <= 4000 && this.height >= 500 && this.width >= 500){
            const ralNumber = this.UnifiedModelJSON.ModelInput.FrameSystem.AluminumColor.toLowerCase().trim().substr(this.UnifiedModelJSON.ModelInput.FrameSystem.AluminumColor.toLowerCase().trim().length - 4);
            let color = '#FF0000';
            switch (ralNumber) {
              case '7001':
                color = "#8c969d";
                break;
              case '9016':
                 color = "#f1f0ea";
                  break;
              case '9005':
                 color = "#0e0e10";
                 break;
              case '7016':
                 color = "#383e42";
                 break;
              case '8022':
                 color = "#1a1718";
                 break;
              default:
                color = "#f1f0ea";
                break;
            }
            Designer.Materials.setProfilesColor(color)
        }
        
        Designer.DisplaySettings.restoreDispalySetting();
    }

    // initialize mainModel with outer frame
    InitializeOuterFrame() {
        const outerFrameSetting = {
            system: this.getSystem(),
            articleName: this.getOuterFrameArticleName(),
            width: this.getWidth(),
            height: this.getHeight(),
        }
        this.outerFrame = new DesignerOuterFrame(outerFrameSetting);
        let mainModel = this.outerFrame.generateOuterFrameExtrusion();
        this.mainModel = mainModel;
        return mainModel;
    }

    // add intermediates to mainModel
    addIntermediates(mainModel) {
        let intermediateMembers = this.Members.filter(x => x.MemberType == 2 || x.MemberType == 3);

        let intermediate = null;
        let cutBack = 0;
        for (let member of intermediateMembers) {
            let isRed = false;
            if (this.MemberResults && Designer.DisplaySettings.currentDisplaySetting.showStructuralResultColor) {
                const memberResult = this.MemberResults.find(x => x.memberID === member.MemberID);
                isRed = (memberResult.deflectionRatio > 1) || (memberResult.verticalDeflectionRatio > 1) || (memberResult.stressRatio > 1) || (memberResult.shearRatio > 1)
            }
            cutBack = this.GetIntermediateCutBack(member.MemberType);

            let section = this.Sections.find(x => x.SectionID == member.SectionID);

            let intermediateSetting = {
                memberType: member.MemberType,
                articleName: section.ArticleName,
                memberID: member.MemberID,
                PointA: this.Points.find(x => x.PointID == member.PointA),
                PointB: this.Points.find(x => x.PointID == member.PointB),
                isRed: isRed,
                cutBack: cutBack,
                isCustomProfile: section.isCustomProfile,
                d: section.d,
                Zoo: section.Zoo,
                Zou: section.Zou,
                Zuo: section.Zuo,
                Zuu: section.Zuu,
                Zol: section.Zol,
                Zor: section.Zor,
                Zul: section.Zul,
                Zur: section.Zur,
                Ao: section.Ao,
                Au: section.Au,
            }
            intermediate = new DesignerIntermediate(intermediateSetting);
            this.intermediates.push(intermediate);
            let intermediateGroup = intermediate.generateIntermediateExtrusion();
            mainModel.add(intermediateGroup);
        }
    }

    // add vent frame and glass to mainModel
    addGlassAndVentFrame(mainModel) {
        let glassPane = null;
        let ventFrame = null;

        for (let glass of this.GlassList) {
            let glassDimensions = this.getGlassDimensions(glass.BoundingMembers);
            let op = null;
            if (this.OperabilitySystems) op = this.OperabilitySystems.find(x => x.OperabilitySystemID == glass.OperabilitySystemID);
            
            // draw vent if exist
            if (op && (op.VentArticleName > 0 || (this.FacadeType == "UDC" && op.VentArticleName && op.VentArticleName !== "-1"))) {
                let ventFrameSetting = {
                    dimensions: glassDimensions,
                    articleName: this.getVentFrameArticleName(op.VentArticleName),
                    glassID: glass.InfillID,
                    VentOpeningDirection: op.VentOpeningDirection,
                    VentOperableType: op.VentOperableType,
                    HandlePosition: glass.HandlePosition,
                    HandleColor: op.InsideHandleColor,
                }
                ventFrame = new DesignerVentFrame(ventFrameSetting);
                this.ventFrames.push(ventFrame);
                let ventFrameGroup = ventFrame.generateVentFrameExtrusion();
                mainModel.add(ventFrameGroup);

                glassDimensions = ventFrame.updateGlassDimensions();  // update glass dimensions to allow room for vent
            }

            // draw glass pane
            if (glass.GlazingSystemID >= 0) {
                let glassPaneSetting = {
                    dimensions: glassDimensions,
                    glazingSystemID: glass.GlazingSystemID,
                    glassID: glass.InfillID,
                    isDoubleDoor: null
                }
                glassPane = new DesignerGlass(glassPaneSetting);
                this.glassPanes.push(glassPane);
                let glassGroup = glassPane.generateGlass();
                // glassPane.setTransparentColor();
                mainModel.add(glassGroup);
            }
            else if (glass.PanelSystemID > 0) {
                const panelSystem = this.Geometry.PanelSystems.find(x => x.PanelSystemID = glass.PanelSystemID);
                const panelThickness = panelSystem.Thickness;
                const panelFrontMaterial = panelSystem.Plates[0].Material;
                let glassPaneSetting = {
                    dimensions: glassDimensions,
                    panelSystemID: glass.PanelSystemID,
                    panelThickness: panelThickness,
                    panelFrontMaterial: panelFrontMaterial,
                    glassID: glass.InfillID,
                    isDoubleDoor: null
                };
                glassPane = new DesignerGlass(glassPaneSetting);
                this.glassPanes.push(glassPane);
                let glassGroup = glassPane.generateGlass();
                mainModel.add(glassGroup);
            }
        }
    }

    // remove intermediates, vent frames and glass panes
    removeIntermediateGlassVentFrame(mainModel) {
        for (let intermediate of this.intermediates) {
            mainModel.remove(intermediate.intermediateGroup);
        }
        for (let ventFrame of this.ventFrames) {
            mainModel.remove(ventFrame.ventFrameGroup);
        }
        for (let insertFrame of this.insertOuterFrames){
            mainModel.remove(insertFrame.insertOuterFrameGroup);
        }
        for (let glassPane of this.glassPanes) {
            mainModel.remove(glassPane.glassGroup);
        }
        for (let doorFrame of this.doorFrames) {
            for(let sills of doorFrame.sideLightSills){
                mainModel.remove(sills);
            }
            mainModel.remove(doorFrame.doorFrameGroup);
        }
    }

    // add intermediates to mainModel
    addThermalResultLabel(mainModel) {
        const oldLabels = mainModel.getObjectByName("thermalResult_Labels");
        mainModel.remove(oldLabels);
        let labelDivs = document.querySelectorAll(".sps-result-thermal-profile-icon,.sps-result-thermal-profile-icon-line-hor,.sps-result-thermal-profile-icon-line-ver");
        if (labelDivs.length > 0) {
            for (const labelDiv of labelDivs) {
                labelDiv.parentNode.removeChild(labelDiv);
            }
        }
        const thermalResultLabels = new DesignerThermalResultLabels(this.ThermalFrames, this.GlassGeometricInfo);
        this.thermalResultLabels = thermalResultLabels;
        let thermalResultLabelsGroup = thermalResultLabels.generateLabels();
        mainModel.add(thermalResultLabelsGroup);
    }

    // get outer frame dimension, for rectangular outer frame aligned with XY axes
    getOuterFrameDimensions() {
        let outFrameMembers = null;
        let Lx = 0;
        let Ly = 0;
        let dimensions = null;
        if(this.ProductType == "SlidingDoor"){
            outFrameMembers = this.Members.filter(x => x.MemberType == 41);
            Lx = 0;   // outer frame dimension in X direction
            Ly = 0;   // outer frame dimension in Y direction
            for (let member of outFrameMembers) {
                let PA = this.Points.find(x => x.PointID == member.PointA);
                let PB = this.Points.find(x => x.PointID == member.PointB);
                let mLx = Math.abs(PA.X - PB.X);    // member Length in X direction
                let mLy = Math.abs(PA.Y - PB.Y);    // member Length in Y direction
                Lx = Math.max(Lx, mLx);
                Ly = Math.max(Ly, mLy);
            }
    
            dimensions = {
                width: Lx,
                height: Ly,
            }
        }
        else{
            outFrameMembers = this.Members.filter(x => x.MemberType == 1);
            Lx = 0;   // outer frame dimension in X direction
            Ly = 0;   // outer frame dimension in Y direction
            for (let member of outFrameMembers) {
                let PA = this.Points.find(x => x.PointID == member.PointA);
                let PB = this.Points.find(x => x.PointID == member.PointB);
                let mLx = Math.abs(PA.X - PB.X);    // member Length in X direction
                let mLy = Math.abs(PA.Y - PB.Y);    // member Length in Y direction
                Lx = Math.max(Lx, mLx);
                Ly = Math.max(Ly, mLy);
            }
    
            dimensions = {
                width: Lx,
                height: Ly,
            }
        }
        

        return dimensions;
    }

    // get glass dimension, for rectangular glass aligned with XY axes
    getGlassDimensions(boundingMembers) {
        const leftMember = this.Members.find(x => x.MemberID == boundingMembers[0]);
        const leftCutback = this.GetGlassCutBack(leftMember.MemberType);
        const topMember = this.Members.find(x => x.MemberID == boundingMembers[1]);
        const topCutback = this.GetGlassCutBack(topMember.MemberType);
        const rightMember = this.Members.find(x => x.MemberID == boundingMembers[2]);
        const rightCutback = this.GetGlassCutBack(rightMember.MemberType);
        const bottomMember = this.Members.find(x => x.MemberID == boundingMembers[3]);
        const bottomCutback = this.GetGlassCutBack(bottomMember.MemberType);

        let dimension = {
            xmin: this.Points.find(x => x.PointID == leftMember.PointA).X + leftCutback,
            ymax: this.Points.find(x => x.PointID == topMember.PointA).Y - topCutback,
            xmax: this.Points.find(x => x.PointID == rightMember.PointA).X - rightCutback,
            ymin: this.Points.find(x => x.PointID == bottomMember.PointA).Y + bottomCutback,
        }

        return dimension;
    }

    GetGlassCutBack(memberType) {
        let cutBack = 0;
        switch (memberType) {
            case 1:
                if(this.outerFrame)
                    cutBack = this.outerFrame.articleWidth;
                break;
            case 2:
                const mullion = this.intermediates.find(x => x.memberType == memberType);
                cutBack = mullion.articleWidth / 2;
                break
            case 3:
                const transom = this.intermediates.find(x => x.memberType == memberType);
                cutBack = transom.articleWidth / 2;
                break;
            case 4:
                const facadeMajorMullion = this.facadeMajorMullions.find(x => x.memberType == memberType);
                cutBack = facadeMajorMullion.articleWidth / 2;
                break;
            case 5:
                const facadeTransom = this.intermediates.find(x => x.memberType == memberType);
                cutBack = facadeTransom.articleWidth / 2;
                break
            case 6:
                const facadeMinorMullion = this.intermediates.find(x => x.memberType == memberType);
                cutBack = facadeMinorMullion.articleWidth / 2;
                break;
            case 21:
                cutBack = this.udcFrame.articleWidth_top;
                break;
            case 22:
                cutBack = this.udcFrame.articleWidth_vertical;
                break;
            case 23:
                cutBack = this.udcFrame.articleWidth_bottom;
                break;
            case 24:
                const udcVerticalGlazingBar = this.intermediates.find(x => x.memberType == memberType);
                cutBack = udcVerticalGlazingBar.articleWidth / 2;
                break;
            case 25:
                const udcHorizontalGlazingBar = this.intermediates.find(x => x.memberType == memberType);
                cutBack = udcHorizontalGlazingBar.articleWidth / 2;
                break;
            case 41:
                if(this.outerFrame)
                cutBack = this.outerFrame.articleWidth;
                break;
            case 45:
                if(this.outerFrame)
                cutBack = this.outerFrame.bottomArticleWidth;
                break;
        }
        return cutBack;
    }

    GetIntermediateCutBack(memberType) {
        let cutBack = 0;
        switch (memberType) {
            case 2:
                const intersectingTransom = this.intermediates.find(x => x.memberType == 3);
                if (intersectingTransom) cutBack = intersectingTransom.articleWidth / 2;
                break
            case 3:
                const intersectingMullion = this.intermediates.find(x => x.memberType == 2);
                if (intersectingMullion) cutBack = intersectingMullion.articleWidth / 2;
                break;
        }
        return cutBack;
    }

    getWidth() {
        return this.width;
    }

    getHeight() {
        return this.height;
    }

    getSystem() {
        const systemName = this.FrameSystem.SystemType;
        let system = null;
        switch (systemName) {
            case "AWS 75.SI+":
                system = new AWS__75_SI_Plus();
                break;
            case "AWS 75 BS.SI+":
                system = new AWS__75__BS_SI_Plus();
                break;
            case "AWS 75 BS.HI+":
                system = new AWS__75__BS_HI_Plus();
                break;
            case "AWS 90.SI+":
                system = new AWS__90_SI_Plus();
                break;
            case "AWS 90 BS.SI+":
                system = new AWS__90__BS_SI_Plus();
                break;
            case "UDC 80":
                system = new UDC__80();
                break;
            case "ADS 75":
                system = new ADS__75();
                break;
            case "ASE 60":
                system = new ASE__60();
                break;
            default:
            // add warning here, cannot find given systemName in FrameSystem
        }

        this.system = system;
        return system;
    }

    // get article name for outer frame
    getOuterFrameArticleName() {
        let sectionID = null;
        if(this.ProductType == "SlidingDoor"){
            sectionID = this.Members.find(x => x.MemberType == 41).SectionID;  // find first outerframe member's section id
        }
        else{
            sectionID = this.Members.find(x => x.MemberType == 1).SectionID;  // find first outerframe member's section id
        }
        const articleName = "article__" + this.Sections.find(x => x.SectionID == sectionID).ArticleName;
        return articleName;
    }

    // get article name for outer frame
    getOuterFrameBottomArticleName() {
        const articleName = "article__" + this.Sections.find(x => x.SectionID == 45).ArticleName;
        return articleName;
    }

    // get article name for intermediate
    getIntermediateArticleName(sectionID) {
        let articleName = '';
        if ('ArticleName' in this.Sections.find(x => x.SectionID == sectionID)) {
            articleName = "article__" + this.Sections.find(x => x.SectionID == sectionID).ArticleName;
        }
        return articleName;
    }

    getVentFrameArticleName(ventArticleName) {
        const articleName = "article__" + ventArticleName;
        return articleName;
    }

    getModelName() {
        return this.modelName;
    }

    getMainModel() {
        return this.mainModel;
    }

    // turn on/off glazing type color
    updateGlazingTypeColor(showGlazingTypeColor) {
        if (showGlazingTypeColor) {
            this.glassPanes.forEach(x => x.setGlazingTypeColor());
        }
        else {
            this.glassPanes.forEach(x => x.setNativeColor());
        }
    }

    // turn on/off glazing type color
    updateGlassIdDisplay(showGlassID) {
        if (showGlassID) {
            this.glassPanes.forEach(x => x.showGlassID());
            // document.getElementById("controls-glass-id").classList.add("selected");
            dataExchange.sendParentMessage('selectGlassInfo', true);
        }
        else {
            this.glassPanes.forEach(x => x.hideGlassID());
            // document.getElementById("controls-glass-id").classList.remove("selected");
            dataExchange.sendParentMessage('selectGlassInfo', false);
        }
    }

    // turn on/off BCs symbol
    updateBCDisplay(showBCSymbols) {
        if (showBCSymbols) {
            this.facadeSlabAnchors.forEach(x => x.showSymbol());
            this.facadeSpliceJoints.forEach(x => x.showSymbol());
        }
        else {
            this.facadeSlabAnchors.forEach(x => x.hideSymbol());
            this.facadeSpliceJoints.forEach(x => x.hideSymbol());
        }
    }

    // turn on/off vent info
    updateVentInfoDisplay(showVentInfo) {
        if ((!this.ventFrames || (this.ventFrames && this.ventFrames.length == 0)) && (!this.doorFrames || (this.doorFrames && this.doorFrames.length == 0))) return false;
        else {
            if (showVentInfo) {
                this.ventFrames.forEach(x => x.showVentInfo());
                this.doorFrames.forEach(x => x.showVentInfo());
                // document.getElementById("controls-glass-id").classList.add("selected");
                dataExchange.sendParentMessage('selectGlassInfo', true);
            }
            else {
                this.ventFrames.forEach(x => x.hideVentInfo());
                this.doorFrames.forEach(x => x.hideVentInfo());
                // document.getElementById("controls-glass-id").classList.remove("selected");
                dataExchange.sendParentMessage('selectGlassInfo', false);

            }
            return true;
        }

    }

    // turn on/off thermal result label
    updateThermalResultLabel(showThermalResultLabel) {
        Designer.EventListener.clearSelectedMeshes();
        if (Designer.DimensionLines) Designer.DimensionLines.clear();
        if (!(this.ThermalFrames)) return;
        if (showThermalResultLabel) {
            this.thermalResultLabels.showLabels();
        }
        else {
            this.thermalResultLabels.hideLabels();
        }
    }

    checkisRed(memberID) {
        if (this.intermediates && this.intermediates.find(x => x.memberID == memberID))
            return this.intermediates.find(x => x.memberID == memberID).isRed;
        if (this.ProductType == "Facade" && this.FacadeType == "mullion-transom" && this.facadeMajorMullions && this.facadeMajorMullions.find(x => x.memberID == memberID))
            return this.facadeMajorMullions.find(x => x.memberID == memberID).isRed;
        if (this.ProductType == "Facade" && this.FacadeType == "UDC" && this.udcFrame && memberID <= 4) {
            let position = [1, 4, 2, 3]; //left, top, right, bottom
            let index = position.findIndex(x => x == memberID);
            if (index > 0) return this.udcFrame.isRed[index];
        }
        return false;
    }

    // ************************************
    // Door Module start here
    // ************************************
    CheckIsDoorModel(geometry) {
        if (geometry.OperabilitySystems && geometry.DoorSystems && geometry.OperabilitySystems.length > 0 && geometry.DoorSystems.length > 0) {
            const ops = geometry.OperabilitySystems.filter(op => geometry.Infills.some(inf => inf.OperabilitySystemID == op.OperabilitySystemID));
            if (ops.length > 0) {
                const isDoorModel = ops.some(op => geometry.DoorSystems.some(ds => ds.DoorSystemID == op.DoorSystemID));
                return isDoorModel;
            }
        }
        return false;
    }
    isObject(object) {
        return object != null && typeof object === 'object';
      }
    checkDoorsEqual(door1, door2){
        const keys1 = Object.keys(door1);
        const keys2 = Object.keys(door2);
        if (keys1.length !== keys2.length) {
          return false;
        }
        for (const key of keys1) {
          const val1 = door1[key];
          const val2 = door2[key];
          const areObjects = this.isObject(val1) && this.isObject(val2);
          if (
            areObjects && !this.checkDoorsEqual(val1, val2) ||
            !areObjects && val1 !== val2
          ) {
            return false;
          }
        }
        return true;
    }
    drawDoorModel(UnifiedModelJSON) {
        
        if (UnifiedModelJSON.AnalysisResult && UnifiedModelJSON.AnalysisResult.ThermalResult) {
            this.ThermalFrames = UnifiedModelJSON.AnalysisResult.ThermalResult.ThermalUIResult.ThermalFrames;
        }

        if (UnifiedModelJSON.AnalysisResult && UnifiedModelJSON.AnalysisResult.StructuralResult) {
            this.MemberResults = UnifiedModelJSON.AnalysisResult.StructuralResult.MemberResults;
        }

        // check if the new unified model loaded has the same outer frame as existing model in 3D viewer. If so, skip regenerate outer frame since it is the most expensive.
        let dimensions = this.getOuterFrameDimensions();
        let doorOuterFrameArticleName = this.getOuterFrameArticleName();
        let isOuterFrameSame = false;   // if the new unified model loaded has the same outer frame as existing model in 3D viewer
        if (this.width == dimensions.width && this.height == dimensions.height && this.outerFrameArticleName == doorOuterFrameArticleName) {
            isOuterFrameSame = true;
        }
        else {
            isOuterFrameSame = false;
            this.width = dimensions.width;
            this.height = dimensions.height;
            this.outerFrameArticleName = doorOuterFrameArticleName;
        }

        // initialize mainModel
        let mainModel = this.mainModel;
        if (!isOuterFrameSame || !this.wasDoorModel) {
            if (mainModel) {
                Designer.Scene.remove(mainModel);;  //remove whole model
            }
            // initialize mainModel with outer frame
            mainModel = this.InitializeDoorOuterFrame();
            Designer.Scene.add(mainModel);
        }
        else {
             if(this.prevDoorSystems !== null && 
             this.prevFrameSystem == this.FrameSystem && 
             this.checkDoorsEqual(this.prevDoorSystems[0], this.Geometry.DoorSystems[0]) && 
             this.checkDoorsEqual(this.prevPoints, this.Points)){
                 return;
             }
             else{
             }
            // remove existing intermediates, Glass Panes and Vent Frames
            this.removeIntermediateGlassVentFrame(mainModel);
        }

        this.intermediates = [];
        this.glassPanes = [];
        this.ventFrames = [];
        this.doorFrames = [];
        this.thermalResultLabels = [];
        // redraw new transom/mullion.
        this.addIntermediates(mainModel);
        // redraw new glass and vent frame
        this.addGlassVentAndDoorFrame(mainModel);
        // redraw thermal result label
        if (this.ThermalFrames) this.addThermalResultLabel(mainModel);

        if(this.UnifiedModelJSON.ModelInput.FrameSystem.AluminumColor !== null && this.height <= 4000 && this.width <= 4000){
            const ralNumber = this.UnifiedModelJSON.ModelInput.FrameSystem.AluminumColor.toLowerCase().trim().substr(this.UnifiedModelJSON.ModelInput.FrameSystem.AluminumColor.toLowerCase().trim().length - 4);
            let color = '#FF0000';
            switch (ralNumber) {
              case '7001':
                color = "#8c969d";
                break;
              case '9016':
                 color = "#f1f0ea";
                  break;
              case '9005':
                 color = "#0e0e10";
                 break;
              case '7016':
                 color = "#383e42";
                 break;
              case '8022':
                 color = "#1a1718";
                 break;
              default:
                color = "#f1f0ea";
                break;
            }
            Designer.Materials.setProfilesColor(color)
        }

        Designer.DisplaySettings.restoreDispalySetting();
    }

    InitializeDoorOuterFrame() { 
        let extraArticles = [];

        const outerFrameSetting = {
            system: this.getSystem(),
            articleName: this.getOuterFrameArticleName(),
            width: this.getWidth(),
            height: this.getHeight(),
            isDoorModel: true,
            bottomArticleName: this.ProductType == "SlidingDoor"? this.getOuterFrameBottomArticleName() : null,
            VentOperableType: this.ProductType == "SlidingDoor"? this.OperabilitySystems[0].VentOperableType : null
        }
        this.outerFrame = new DesignerOuterFrame(outerFrameSetting);
        let mainModel = this.outerFrame.generateOuterFrameExtrusion();
        this.mainModel = mainModel;
        return mainModel;
    }

    addGlassVentAndDoorFrame(mainModel) {
        const isDoorModel = this.CheckIsDoorModel(this.Geometry);
        let glassPane = null;
        let ventFrame = null;
        let doorFrame = null;
        for (let glass of this.GlassList) {

            let glassDimensions = this.getGlassDimensions(glass.BoundingMembers);
            let op = null;
            if (this.OperabilitySystems) op = this.OperabilitySystems.find(x => x.OperabilitySystemID == glass.OperabilitySystemID);
            // draw vent if exist
            // if (op && (op.VentArticleName > 0 || (this.FacadeType == "UDC" && op.VentArticleName && op.VentArticleName !== "-1"))) {
            //     let ventFrameSetting = {
            //         dimensions: glassDimensions,
            //         articleName: this.getVentFrameArticleName(op.VentArticleName),
            //         glassID: glass.InfillID,
            //         VentOpeningDirection: op.VentOpeningDirection,
            //         VentOperableType: op.VentOperableType,
            //     }
            //     ventFrame = new DesignerVentFrame(ventFrameSetting);
            //     this.ventFrames.push(ventFrame);
            //     let ventFrameGroup = ventFrame.generateVentFrameExtrusion();
            //     mainModel.add(ventFrameGroup);

            //     glassDimensions = ventFrame.updateGlassDimensions();  // update glass dimensions to allow room for vent
            // }

            // draw door if exist
            if (op && op.DoorSystemID > 0) {
                const doorSystem = this.Geometry.DoorSystems.find(ds => ds.DoorSystemID == op.DoorSystemID);
                glassDimensions.ymin = 0;
                let doorFrameSetting = {
                    dimensions: glassDimensions,
                    doorSystem: doorSystem,
                    glassID: glass.InfillID,
                    DoorOperableType: op.VentOperableType,
                    DoorOpeningDirection: op.VentOpeningDirection
                }
                doorFrame = new DesignerDoorFrame(doorFrameSetting);
                this.doorFrames.push(doorFrame);
                let doorFrameGroup = doorFrame.generateDoorFrameExtrusion();
                let sillGroup = doorFrame.generateSideLightSills(); 
                while(sillGroup.children.length > 0) {
                    doorFrame.sideLightSills.push(sillGroup.children[0]);
                    mainModel.add(sillGroup.children[0]);
                }
                mainModel.add(doorFrameGroup);

                glassDimensions = doorFrame.updateGlassDimensions();  // update glass dimensions to allow room for door
            }

            // draw glass pane
            if (glass.GlazingSystemID >= 0) {
                let glassPaneSetting = {
                    dimensions: glassDimensions,
                    glazingSystemID: glass.GlazingSystemID,
                    glassID: glass.InfillID,
                    isDoubleDoor: (op !== undefined && op.VentOperableType !== null)? op.VentOperableType : null
                }
                glassPane = new DesignerGlass(glassPaneSetting);
                this.glassPanes.push(glassPane);
                let glassGroup = glassPane.generateGlass();
                // glassPane.setTransparentColor();
                mainModel.add(glassGroup);
            }
        }
    }

    // ************************************
    // Facade Module start here
    // ************************************
    drawFacadeModel(UnifiedModelJSON) {
        if(this.FrameSystem.xNumberOfPanels==0 && this.FrameSystem.yNumberOfPanels==0){
            return;
        }      
        if (UnifiedModelJSON.AnalysisResult && UnifiedModelJSON.AnalysisResult.ThermalResult) {
            this.ThermalFrames = UnifiedModelJSON.AnalysisResult.ThermalResult.ThermalUIResult.ThermalFacadeMembers;
            this.GlassGeometricInfo = UnifiedModelJSON.AnalysisResult.ThermalResult.ThermalUIResult.GlassGeometricInfos;
        }

        if (UnifiedModelJSON.AnalysisResult && UnifiedModelJSON.AnalysisResult.FacadeStructuralResult) {
            this.MemberResults = UnifiedModelJSON.AnalysisResult.FacadeStructuralResult.MemberResults;
        }

        let mainModel = this.mainModel;
        if (mainModel) {
            Designer.Scene.remove(mainModel);;  //remove whole model
        }

        let dimensions = this.getModelDimensions();
        this.width = dimensions.width;
        this.height = dimensions.height;

        this.facadeMajorMullions = [];
        mainModel = this.initializeFacadeMajorMullions();
        this.mainModel = mainModel;
        Designer.Scene.add(mainModel);

        this.intermediates = [];
        this.glassPanes = [];
        this.insertOuterFrames = [];
        this.ventFrames = [];
        this.facadeSlabAnchors = [];
        this.facadeReinforcements = [];
        this.thermalResultLabels = [];

        // draw new transom/mullion.
        this.addFacadeIntermediates(mainModel);
        // // redraw new glass and vent frame
        this.addFacadeGlassWindowVentFrame(mainModel);

        // draw slab
        this.addFacadeSlabAnchors(mainModel);
        // draw reinforcement
        this.addFacadeReinfocement(mainModel);
        // draw splice joint
        this.addFacadeSpliceJoint(mainModel);

        if (this.ThermalFrames) this.addThermalResultLabel(mainModel);

        mainModel.position.set(0, 0, -30);

        Designer.DisplaySettings.restoreDispalySetting();
    }

    initializeFacadeMajorMullions() {
        const mainModel = new THREE.Group();
        let facadeMajorMullionMembers = this.Members.filter(x => x.MemberType == 4);

        let facadeMajorMullion = null;
        for (let member of facadeMajorMullionMembers) {
            let isRed = false;
            if (this.MemberResults && Designer.DisplaySettings.currentDisplaySetting.showStructuralResultColor) {
                const memberResult = this.MemberResults.find(x => x.memberID === member.MemberID);
                isRed = (memberResult.outofplaneBendingCapacityRatio > 1) || (memberResult.outofplaneReinfBendingCapacityRatio > 1) || (memberResult.inplaneBendingCapacityRatio > 1) || (memberResult.outofplaneDeflectionCapacityRatio > 1) || (memberResult.inplaneDeflectionCapacityRatio > 1);
            }
            let spliceJointYs = this.SpliceJoints.filter(x => x.MemberID == member.MemberID).map(x => x.Y).sort((a, b) => { return a - b });
            let facadeMajorMullionSetting = {
                memberType: member.MemberType,
                articleName: this.getFacadeMajorMullionArticleName(),
                memberID: member.MemberID,
                PointA: this.Points.find(x => x.PointID == member.PointA),
                PointB: this.Points.find(x => x.PointID == member.PointB),
                isRed: isRed,
                spliceJointYs: spliceJointYs,
                topRecess: this.FrameSystem.MajorMullionTopRecess,
                bottomRecess: this.FrameSystem.MajorMullionBottomRecess
            }
            facadeMajorMullion = new DesignerFacadeMajorMullion(facadeMajorMullionSetting);
            this.facadeMajorMullions.push(facadeMajorMullion);
            let facadeMajorMullionGroup = facadeMajorMullion.generateFacadeMajorMullionExtrusion();
            mainModel.add(facadeMajorMullionGroup);
        }

        return mainModel;
    }

    addFacadeIntermediates(mainModel) {
        let intermediateMembers = this.Members.filter(x => x.MemberType == 5 || x.MemberType == 6);

        let intermediate = null;
        let cutBack = 0;
        for (let member of intermediateMembers) {
            let isRed = false;
            if (this.MemberResults && Designer.DisplaySettings.currentDisplaySetting.showStructuralResultColor) {
                const memberResult = this.MemberResults.find(x => x.memberID === member.MemberID);
                isRed = (memberResult.outofplaneBendingCapacityRatio > 1) || (memberResult.outofplaneReinfBendingCapacityRatio > 1) || (memberResult.inplaneBendingCapacityRatio > 1) || (memberResult.outofplaneDeflectionCapacityRatio > 1) || (memberResult.inplaneDeflectionCapacityRatio > 1);
            }
            let intermediateSetting = {
                memberType: member.MemberType,
                articleName: this.getIntermediateArticleName(member.SectionID),
                memberID: member.MemberID,
                PointA: this.Points.find(x => x.PointID == member.PointA),
                PointB: this.Points.find(x => x.PointID == member.PointB),
                isRed: isRed,
                cutBack: this.GetFacadeIntermediateCutBack(member.MemberType),
            }
            intermediate = new DesignerFacadeIntermediate(intermediateSetting);
            this.intermediates.push(intermediate);
            let intermediateGroup = intermediate.generateIntermediateExtrusion();
            mainModel.add(intermediateGroup);
        }
    }

    GetFacadeIntermediateCutBack(memberType) {
        let cutBack = 0;
        switch (memberType) {
            case 5:
                const intersectingMajorMullion = this.facadeMajorMullions.find(x => x.memberType == 4);
                if (intersectingMajorMullion) cutBack = intersectingMajorMullion.articleWidth / 2;
                break
            case 6:
                const intersectingTransom = this.intermediates.find(x => x.memberType == 5);
                if (intersectingTransom) cutBack = intersectingTransom.articleWidth / 2;
                break;
        }
        return cutBack;
    }

    getModelDimensions() {
        let Lx = 0;   // Facade Overall dimension in X direction
        let Ly = 0;   // Facade Overall dimension in Y direction
        let maxX = -1e6, minX = 1e6, maxY = -1e6, minY = 1e6;
        for (let Point of this.Points) {
            maxX = Math.max(Point.X, maxX);
            maxY = Math.max(Point.Y, maxY);
            minX = Math.min(Point.X, minX);
            minY = Math.min(Point.Y, minY);
            Lx = maxX - minX;
            Ly = maxY - minY;
        }

        let dimensions = {
            width: Lx,
            height: Ly,
        }

        return dimensions;
    }

    getFacadeMajorMullionArticleName() {
        const sectionID = this.Members.find(x => x.MemberType == 4).SectionID;  // find first outerframe member's section id
        const articleName = "article__" + this.Sections.find(x => x.SectionID == sectionID).ArticleName;
        return articleName;
    }

    addFacadeGlassWindowVentFrame(mainModel) {
        let glassPane = null;
        let ventFrame = null;
        let insertOuterFrame = null;
        for (let glass of this.GlassList) {
            let glassDimensions = this.getGlassDimensions(glass.BoundingMembers);
            let op = null;
            if (this.OperabilitySystems) {
                op = this.OperabilitySystems.find(x => x.OperabilitySystemID == glass.OperabilitySystemID);
            }
            // draw window outerframe if exist
            if (op && op.InsertOuterFrameArticleName && open.InsertOuterFrameArticleName !== "-1") {
                let insertOuterFrameSetting = {
                    dimensions: glassDimensions,
                    articleName: this.getInsertOuterFrameArticleName(op.InsertOuterFrameArticleName),
                    glassID: glass.InfillID,
                }
                insertOuterFrame = new DesignerInsertOuterFrame(insertOuterFrameSetting);
                this.insertOuterFrames.push(insertOuterFrame);
                let outerFrameGroup = insertOuterFrame.generateInsertOuterFrameExtrusion();
                mainModel.add(outerFrameGroup);

                glassDimensions = insertOuterFrame.updateGlassDimensions();   // update glass dimensions to allow room for vent
            }

            // draw vent if exist
            let ventExist = false;
            if (op && op.VentArticleName && op.VentArticleName !== "-1") {
                let ventFrameSetting = {
                    dimensions: glassDimensions,
                    articleName: this.getVentFrameArticleName(op.VentArticleName),
                    glassID: glass.InfillID,
                    VentOpeningDirection: op.VentOpeningDirection,
                    VentOperableType: op.VentOperableType,
                    HandlePosition: glass.HandlePosition > 0? glass.HandlePosition : -1
                }
                ventFrame = new DesignerVentFrame(ventFrameSetting);
                this.ventFrames.push(ventFrame);
                let ventFrameGroup = ventFrame.generateVentFrameExtrusion();
                mainModel.add(ventFrameGroup);

                glassDimensions = ventFrame.updateGlassDimensions();  // update glass dimensions to allow room for vent
                ventExist = true; 
            }

            // draw glass pane
            if (glass.GlazingSystemID >= 0) {
                let glassPaneSetting = {
                    dimensions: glassDimensions,
                    glazingSystemID: glass.GlazingSystemID,
                    glassID: glass.InfillID,
                    isVentGlass: ventExist,
                    isDoubleDoor: null
                }
                glassPane = new DesignerGlass(glassPaneSetting);
                this.glassPanes.push(glassPane);
                let glassGroup = glassPane.generateGlass();
                //glassPane.setTransparentColor();
                mainModel.add(glassGroup);
            }
            else if (glass.PanelSystemID > 0) {
                const panelSystem = this.Geometry.PanelSystems.find(x => x.PanelSystemID = glass.PanelSystemID);
                const panelThickness = panelSystem.Thickness;
                const panelFrontMaterial = panelSystem.Plates[0].Material;
                let glassPaneSetting = {
                    dimensions: glassDimensions,
                    panelSystemID: glass.PanelSystemID,
                    panelThickness: panelThickness,
                    panelFrontMaterial: panelFrontMaterial,
                    glassID: glass.InfillID,
                    isDoubleDoor: null
                };
                glassPane = new DesignerGlass(glassPaneSetting);
                this.glassPanes.push(glassPane);
                let glassGroup = glassPane.generateGlass();
                //glassPane.setTransparentColor();
                mainModel.add(glassGroup);
            }
        }
    }

    getInsertOuterFrameArticleName(ArticleName) {
        const articleName = "article__" + ArticleName;
        return articleName;
    }

    addFacadeSlabAnchors(mainModel) {
        if (this.SlabAnchors) {
            for (let slabAnchor of this.SlabAnchors) {
                const mullion = this.Members.find(x => x.MemberID == slabAnchor.MemberID && x.MemberType == 4);
                if (!mullion) continue;

                const anchorOffset = parseFloat(this.facadeMajorMullions.find(x => x.memberID == slabAnchor.MemberID).anchorOffset) + 25;
                const x = this.Points.find(x => x.PointID == mullion.PointA).X;
                let y = slabAnchor.Y;
                const z = -anchorOffset;
                const clickable = (y != this.height) && (y != 0);
                
                let slabAnchorSetting = {
                    memberID: mullion.MemberID,
                    slabAnchorID: slabAnchor.SlabAnchorID,
                    X: x,
                    Y: y,
                    Z: z,
                    clickable: clickable,
                    AnchorType: slabAnchor.AnchorType,
                }
                let facadeSlabAnchor = new DesignerFacadeSlabAnchor(slabAnchorSetting);
                this.facadeSlabAnchors.push(facadeSlabAnchor);
                let AnchorMesh = null;
                if (slabAnchor.AnchorType == "Fixed") {
                    AnchorMesh = this.facadeMullionSlabFixedAnchorMesh;
                }
                else if (slabAnchor.AnchorType == "Sliding") {
                    AnchorMesh = this.facadeMullionSlabSlidingAnchorMesh;
                }
                if (AnchorMesh !== undefined) {
                    let facadeSlabAnchorGroup = facadeSlabAnchor.generateSlabAnchor(AnchorMesh);
                    mainModel.add(facadeSlabAnchorGroup);
                }
            }
        }
    }

    addFacadeReinfocement(mainModel) {
        if (this.Reinforcements) {
            for (let reinforcement of this.Reinforcements) {
                const mullion = this.Members.find(x => x.MemberID == reinforcement.MemberID && x.MemberType == 4);
                if (!mullion) continue;
                const x = this.Points.find(x => x.PointID == mullion.PointA).X;
                const y = Math.max(this.Points.find(x => x.PointID == mullion.PointA).Y, this.Points.find(x => x.PointID == mullion.PointB).Y);
                //draw window outerframe if exist
                let reinforcementSetting = {
                    memberID: reinforcement.MemberID,
                    reinforcementID: reinforcement.ReinforcementID,
                    reinforcementType: reinforcement.ReinforcementType,
                    X: x,
                    Y: y,
                }
                let facadeReinforcement = new DesignerFacadeReinforcement(reinforcementSetting);
                this.facadeReinforcements.push(facadeReinforcement);

                let facadeReinforcementMesh = facadeReinforcement.generateReinforcement();
                mainModel.add(facadeReinforcementMesh);
            }
        }
    }


    addFacadeSpliceJoint(mainModel) {
        if (this.SpliceJoints) {
            for (let spliceJoint of this.SpliceJoints) {
                const mullion = this.Members.find(x => x.MemberID == spliceJoint.MemberID && x.MemberType == 4);
                if (!mullion) continue;
                const articleName = this.getMullionInsertArticleName(mullion.SectionID);
                const x = this.Points.find(x => x.PointID == mullion.PointA).X;
                const y = spliceJoint.Y;;
                // draw window outerframe if exist
                let Setting = {
                    memberID: spliceJoint.MemberID,
                    articleName: articleName,
                    spliceJointID: spliceJoint.SpliceJointID,
                    jointType: spliceJoint.JointType,
                    X: x,
                    Y: y,
                }
                let facadeSpliceJoint = new DesignerFacadeSpliceJoint(Setting);
                this.facadeSpliceJoints.push(facadeSpliceJoint);

                let facadeSpliceJointGroup = facadeSpliceJoint.generateSpliceJoint();
                mainModel.add(facadeSpliceJointGroup);
            }
        }
    }

    getMullionInsertArticleName(secitonID) {
        const section = this.Sections.find(x => x.SectionID == secitonID);
        const articleName = "article__" + section.ArticleName + "_insert";
        return articleName;
    }

    // ************************************
    // UDC Module start here
    // ************************************
    drawUDCModel(UnifiedModelJSON) {
        if (UnifiedModelJSON.AnalysisResult && UnifiedModelJSON.AnalysisResult.ThermalResult) {
            this.ThermalFrames = UnifiedModelJSON.AnalysisResult.ThermalResult.ThermalUIResult.ThermalFacadeMembers;
            this.GlassGeometricInfo = UnifiedModelJSON.AnalysisResult.ThermalResult.ThermalUIResult.GlassGeometricInfos;
        }

        if (UnifiedModelJSON.AnalysisResult && UnifiedModelJSON.AnalysisResult.UDCStructuralResult) {
            this.MemberResults = UnifiedModelJSON.AnalysisResult.UDCStructuralResult.MemberResults;
        }

        // check if the new unified model loaded has the same outer frame as existing model in 3D viewer. If so, skip regenerate outer frame since it is the most expensive.
        let dimensions = this.getModelDimensions();
        let udcVerticalFrameArticleName = this.getUDCFrameArticleName("Vertical");
        let udcTopFrameArticleName = this.getUDCFrameArticleName("Top");
        let udcBottomFrameArticleName = this.getUDCFrameArticleName("Bottom");
        let isFrameSame = false;   // if the new unified model loaded has the same frame as existing model in 3D viewer
        if (this.width == dimensions.width && this.height == dimensions.height && this.udcVerticalFrameArticleName == udcVerticalFrameArticleName
            && this.udcTopFrameArticleName == udcTopFrameArticleName && this.udcBottomFrameArticleName == udcBottomFrameArticleName
            && Designer.DisplaySettings.currentDisplaySetting.showStructuralResultColor !== true
            && Designer.DisplaySettings.currentDisplaySetting.showThermalResultLabel !== true) {
            isFrameSame = true;
        }
        else {
            isFrameSame = false;
            this.width = dimensions.width;
            this.height = dimensions.height;
            this.udcTopFrameArticleName = udcTopFrameArticleName;
            this.udcBottomFrameArticleName = udcBottomFrameArticleName;
            this.udcVerticalFrameArticleName = udcVerticalFrameArticleName;
        }

        // initialize mainModel
        let mainModel = this.mainModel;
        if (!isFrameSame) {
            if (mainModel) {
                Designer.Scene.remove(mainModel);;  //remove whole model
            }
            // initialize mainModel with UDC frame
            mainModel = this.InitializeUDCFrame();
            Designer.Scene.add(mainModel);
        }
        else {
            // remove existing intermediates, Glass Panes and Vent Frames
            this.removeIntermediateGlassVentFrame(mainModel);
        }
        //this.removeIntermediateGlassVentFrame(mainModel);

        this.intermediates = [];
        this.glassPanes = [];
        this.ventFrames = [];
        this.thermalResultLabels = [];
        // redraw new transom/mullion.
        this.addGlazingBars(mainModel);
        // redraw new glass and vent frame
        // this.addGlassAndVentFrame(mainModel);
        this.addFacadeGlassWindowVentFrame(mainModel);
        // redraw thermal result label
        if (this.ThermalFrames) this.addThermalResultLabel(mainModel);

        Designer.DisplaySettings.restoreDispalySetting();
    }

    getUDCFrameArticleName(frameType) {
        let sectionID = 1;
        switch (frameType) {
            case "Top":
                sectionID = this.Members.find(x => x.MemberType == 21).SectionID;
                break
            case "Vertical":
                sectionID = this.Members.find(x => x.MemberType == 22).SectionID;
                break;
            case "Bottom":
                sectionID = this.Members.find(x => x.MemberType == 23).SectionID;
                break;
        }
        const articleName = "article__" + this.Sections.find(x => x.SectionID == sectionID).ArticleName;
        return articleName;
    }

    //remove glazing bars, vent frames and glass panes
    // removeIntermediateGlassVentFrame(mainModel) {
    //     for (let intermediate of this.intermediates) {
    //         mainModel.remove(intermediate.intermediateGroup);
    //     }
    //     for (let insertOuterFrame of this.insertOuterFrames) {
    //         mainModel.remove(insertOuterFrame.insertOuterFrameGroup);
    //     }
    //     for (let ventFrame of this.ventFrames) {
    //         mainModel.remove(ventFrame.ventFrameGroup);
    //     }
    //     for (let glassPane of this.glassPanes) {
    //         mainModel.remove(glassPane.glassGroup);
    //     }
    // }

    addGlazingBars(mainModel) {
        let intermediateMembers = this.Members.filter(x => x.MemberType == 24 || x.MemberType == 25);
        let glazingBar = null;
        let cutBack = 0;
        for (let member of intermediateMembers) {
            let isRed = false;
            if (this.MemberResults && Designer.DisplaySettings.currentDisplaySetting.showStructuralResultColor) {
                const memberResult = this.MemberResults.find(x => x.memberID === member.MemberID);
                isRed = (memberResult.outofplaneBendingCapacityRatio > 1) || (memberResult.outofplaneReinfBendingCapacityRatio > 1) || (memberResult.inplaneBendingCapacityRatio > 1) || (memberResult.outofplaneDeflectionCapacityRatio > 1) || (memberResult.inplaneDeflectionCapacityRatio > 1);
            }
            cutBack = this.GetGlazingBarCutBack(member.MemberType);

            let section = this.Sections.find(x => x.SectionID == member.SectionID);

            let glazingBarSetting = {
                memberType: member.MemberType,
                articleName: section.ArticleName,
                memberID: member.MemberID,
                PointA: this.Points.find(x => x.PointID == member.PointA),
                PointB: this.Points.find(x => x.PointID == member.PointB),
                isRed: isRed,
                cutBack: cutBack,
                isCustomProfile: section.isCustomProfile ? section.isCustomProfile : false,
                d: section.BTDepth,
            }
            glazingBar = new DesignerUDCGlazingBar(glazingBarSetting);
            this.intermediates.push(glazingBar);
            let intermediateGroup = glazingBar.generateIntermediateExtrusion();
            mainModel.add(intermediateGroup); 
        }
    }

    GetGlazingBarCutBack(memberType) {
        let cutBack = 0;
        switch (memberType) {
            case 24:
                const intersectingHorizontalGlazingBar = this.intermediates.find(x => x.memberType == 25);
                if (intersectingHorizontalGlazingBar) cutBack = intersectingHorizontalGlazingBar.articleWidth / 2;
                break
            case 25:
                const intersectingVerticalGlazingBar = this.intermediates.find(x => x.memberType == 24);
                if (intersectingVerticalGlazingBar) cutBack = intersectingVerticalGlazingBar.articleWidth / 2;
                break;
        }
        return cutBack;
    }

    // initialize mainModel with outer frame
    InitializeUDCFrame() {
        let isRed = [false, false, false, false];
        if (this.MemberResults && Designer.DisplaySettings.currentDisplaySetting.showStructuralResultColor) {
            // find left frame
            const verticalMembers = this.Members.filter(x => x.MemberType == 22);
            const vm0x = this.Points.find(p => p.PointID == verticalMembers[0].PointA).X;
            const vm1x = this.Points.find(p => p.PointID == verticalMembers[1].PointA).X;
            let leftMemberID = verticalMembers[0].MemberID;
            let rightMemberID = verticalMembers[1].MemberID;
            if (vm0x > vm1x) {
                leftMemberID = verticalMembers[1].MemberID;
                rightMemberID = verticalMembers[0].MemberID;
            }
            let topMemberID = this.Members.find(x => x.MemberType == 21).MemberID;
            let bottomMemberID = this.Members.find(x => x.MemberType == 23).MemberID;
            let frameMemberIDs = [leftMemberID, topMemberID, rightMemberID, bottomMemberID];
            for (let i in frameMemberIDs) {
                const memberResult = this.MemberResults.find(x => x.memberID === frameMemberIDs[i]);
                isRed[i] = (memberResult.outofplaneBendingCapacityRatio > 1) || (memberResult.outofplaneReinfBendingCapacityRatio > 1) || (memberResult.inplaneBendingCapacityRatio > 1) || (memberResult.outofplaneDeflectionCapacityRatio > 1) || (memberResult.inplaneDeflectionCapacityRatio > 1);
            }
        }
        const UDCFrameSetting = {
            articleName_top: this.getUDCFrameArticleName("Top"),
            articleName_vertical: this.getUDCFrameArticleName("Vertical"),
            articleName_bottomFrame: this.getUDCFrameArticleName("Bottom"),
            width: this.getWidth(),
            height: this.getHeight(),
            isRed: isRed
        }
        this.udcFrame = new DesignerUDCFrame(UDCFrameSetting);
        let mainModel = this.udcFrame.generateUDCFrameExtrusion();
        this.mainModel = mainModel;
        return mainModel;
    }
    // ************************************
    // Sliding Door Module start here
    // ************************************
    drawSlidingDoorModel(UnifiedModelJSON){
        if (UnifiedModelJSON.AnalysisResult && UnifiedModelJSON.AnalysisResult.ThermalResult) {
            this.ThermalFrames = UnifiedModelJSON.AnalysisResult.ThermalResult.ThermalUIResult.ThermalFrames;
        }

        if (UnifiedModelJSON.AnalysisResult && UnifiedModelJSON.AnalysisResult.StructuralResult) {
            this.MemberResults = UnifiedModelJSON.AnalysisResult.StructuralResult.MemberResults;
        }

        // check if the new unified model loaded has the same outer frame as existing model in 3D viewer. If so, skip regenerate outer frame since it is the most expensive.
        let dimensions = this.getOuterFrameDimensions();
        let doorOuterFrameArticleName = this.getOuterFrameArticleName();
        let doorOuterFrameBottomArticleName = this.getOuterFrameBottomArticleName();
        let isOuterFrameSame = false;   // if the new unified model loaded has the same outer frame as existing model in 3D viewer
        if (this.width == dimensions.width && this.height == dimensions.height && 
            this.outerFrameArticleName == doorOuterFrameArticleName && 
            this.outerFrameBottomArticleName == doorOuterFrameBottomArticleName && 
            this.OperabilitySystems[0].VentOperableType == this.prevVentOperableType) {
            isOuterFrameSame = true;
        }
        else {
            isOuterFrameSame = false;
            this.width = dimensions.width;
            this.height = dimensions.height;
            this.outerFrameArticleName = doorOuterFrameArticleName;
            this.outerFrameBottomArticleName = doorOuterFrameBottomArticleName;
        }

        // initialize mainModel
        let mainModel = this.mainModel;
        if (!isOuterFrameSame) {
            if (mainModel) {
                Designer.Scene.remove(mainModel);;  //remove whole model
            }
            // initialize mainModel with outer frame
            mainModel = this.InitializeDoorOuterFrame();
            Designer.Scene.add(mainModel);
        }
        else {
            // remove existing intermediates, Glass Panes and Vent Frames
            this.removeIntermediateGlassVentFrame(mainModel);
        }

        this.intermediates = [];
        this.glassPanes = [];
        this.ventFrames = [];
        this.doorFrames = [];
        this.thermalResultLabels = [];
        // redraw new glass and vent frame
        this.addGlassVentAndSlidingDoorFrame(mainModel);
        // redraw thermal result label
        if (this.ThermalFrames) this.addThermalResultLabel(mainModel);
        const limitDimensions = Designer.Utils.getMaxSlidingDoorDimensions(Designer.UnifiedModel.doorFrames[0].ventFrames);
        const maxWidth = limitDimensions.max;
        const minWidth = limitDimensions.min;
        if(this.UnifiedModelJSON.ModelInput.FrameSystem.AluminumColor !== null && 
            this.height >= 1935+99 && this.width <= maxWidth &&
            this.height <= 3000+99 && this.width >= minWidth){
            const ralNumber = this.UnifiedModelJSON.ModelInput.FrameSystem.AluminumColor.toLowerCase().trim().substr(this.UnifiedModelJSON.ModelInput.FrameSystem.AluminumColor.toLowerCase().trim().length - 4);
            let color = '#FF0000';
            switch (ralNumber) {
              case '7001':
                color = "#8c969d";
                break;
              case '9016':
                 color = "#f1f0ea";
                  break;
              case '9005':
                 color = "#0e0e10";
                 break;
              case '7016':
                 color = "#383e42";
                 break;
              case '8022':
                 color = "#1a1718";
                 break;
              default:
                color = "#f1f0ea";
                break;
            }
            Designer.Materials.setProfilesColor(color)
        }

        Designer.DisplaySettings.restoreDispalySetting();
    }

    addGlassVentAndSlidingDoorFrame(mainModel) {
        const isDoorModel = this.CheckIsDoorModel(this.Geometry);
        let glassPane = null;
        let ventFrame = null;
        let doorFrame = null;
        for (let glass of this.GlassList) { //should only have one glass
            let glassDimensions = this.getGlassDimensions(glass.BoundingMembers);
            let op = null;
            if (this.OperabilitySystems) op = this.OperabilitySystems.find(x => x.OperabilitySystemID == glass.OperabilitySystemID);
            // draw door if exist
            if (op && op.SlidingDoorSystemID > 0) {
                const doorSystem = this.Geometry.SlidingDoorSystems.find(ds => ds.SlidingDoorSystemID == op.SlidingDoorSystemID);
                let doorFrameSetting = {
                    dimensions: glassDimensions,
                    doorSystem: doorSystem,
                    glassID: glass.InfillID,
                    DoorOperableType: op.VentOperableType,
                    DoorOpeningDirection: op.VentOpeningDirection,
                    ventArticleName: "article__" + this.Sections.find(x => x.SectionID == 43).ArticleName
                }
                doorFrame = new DesignerSlidingDoorFrame(doorFrameSetting);
                this.doorFrames.push(doorFrame);
                let doorFrameGroup = doorFrame.generateDoorFrameExtrusion();
                mainModel.add(doorFrameGroup);

                glassDimensions = doorFrame.updateGlassDimensions();  // update glass dimensions to allow room for door
            }
            // draw glass pane
            if (glass.GlazingSystemID >= 0) {
                const doorSystem = this.Geometry.SlidingDoorSystems.find(ds => ds.SlidingDoorSystemID == op.SlidingDoorSystemID);
                let glassPaneSetting = {
                    dimensions: glassDimensions,
                    glazingSystemID: glass.GlazingSystemID,
                    glassID: glass.InfillID,
                    isDoubleDoor: false,
                    slidingDoorSystem: doorSystem,
                    slidingDoorVentArticleWidth: parseInt(this.doorFrames[0].doorVentArticle.insideWidth),
                    slidingDoorVentFramePoints: this.doorFrames[0].ventFramePoints
                }
                glassPane = new DesignerGlass(glassPaneSetting);
                this.glassPanes.push(glassPane);
                let glassGroup = glassPane.generateGlass();
                // glassPane.setTransparentColor();
                mainModel.add(glassGroup);
            }
        }
    }
}
