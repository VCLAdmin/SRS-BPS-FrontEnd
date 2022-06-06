class DesignerDimensionLines {

    constructor() {
        this.visible = false;
        this.subtypes = new DesignerSubType();
        this.name = "DimensionLines";
        this.side = new DesignerSide();
        this.settingsSprite = "";

        this.dimensionLabels = [
            "dimension-label-x",
            "dimension-label-y"
        ];

        this.xInput = document.getElementById("dimension-label-x");
        this.yInput = document.getElementById("dimension-label-y");

        this.init();
    }

    getSettingSprite() {
        return this.settingsSprite;
    }

    init() {
        document.querySelectorAll(".dimension-input").forEach((input) => {
            input.addEventListener("change", (event) => {
                const value = parseFloat(event.currentTarget.value.replace(',', '.'));
                if (!value || value < 0){
                this.hideInputs();
                return;
                } 

                const selectedMeshes = Designer.EventListener.getSelectedMeshes();
                let selectedMesh = null;
                if (Designer.UnifiedModel.ProductType == "Window" && Designer.UnifiedModel.isDoorModel == false) {
                    if (selectedMeshes.length == 0) {
                        const isxInput = event.currentTarget.id == Designer.DimensionLines.dimensionLabels[0];
                        if(value <= 4000 && value >= 500 &&
                            ((isxInput && Designer.UnifiedModel.getHeight() <= 4000 && Designer.UnifiedModel.getHeight() >= 500)||
                            (!isxInput && Designer.UnifiedModel.getWidth() <= 4000 && Designer.UnifiedModel.getWidth() >= 500))){
                                if(Designer.Materials.previousColor != null){
                                    Designer.Materials.revertPreviousColor();
                                     dataExchange.sendParentMessage('IncorrectSmallDimension', {active: false, width: 500, height: 500});
                                     dataExchange.sendParentMessage('IncorrectLargeDimension', {active: false, width: 4000, height: 4000});
                                }
                                Designer.UnifiedModelOperator.changeOuterFrameDimension(isxInput, value);

                        }
                        else{
                            if(value > 4000 || (Designer.UnifiedModel.getHeight() > 4000 && isxInput) || (Designer.UnifiedModel.getWidth() > 4000 && !isxInput )){
                                dataExchange.sendParentMessage('IncorrectLargeDimension', {active: true, width: 4000, height: 4000});
                            }
                            if(value < 500  || (Designer.UnifiedModel.getHeight() < 500  && isxInput)|| (Designer.UnifiedModel.getWidth() < 500 && !isxInput)){
                                dataExchange.sendParentMessage('IncorrectSmallDimension', {active: true, width: 500, height: 500});
                            }
                            Designer.Materials.setProfilesColor('#FF0000');
                            Designer.UnifiedModelOperator.changeOuterFrameDimension(isxInput, value);
                        }
                    }
                    else {
                        selectedMesh = selectedMeshes[selectedMeshes.length - 1];
                        if (selectedMesh.subtype == this.subtypes.transom || selectedMesh.subtype == this.subtypes.mullion) {
                            const selectedtransoms = selectedMeshes.filter(x => x.subtype == selectedMesh.subtype);
                            for (let mesh of selectedtransoms) {
                                const memberID = mesh.userData.memberID;
                                Designer.UnifiedModelOperator.changeIntermediatePosition(memberID, value);
                            }
                        }
                        else if (selectedMesh.subtype == this.subtypes.insideHandle){
                            for(var h in selectedMeshes){
                                if (selectedMeshes[h].subtype == this.subtypes.insideHandle && 
                                    selectedMeshes[h].ventFrame.handlePosition == selectedMesh.ventFrame.handlePosition && 
                                    selectedMeshes[h].ventFrame.dimensions.ymin == selectedMesh.ventFrame.dimensions.ymin){
                                    const memberID = selectedMeshes[h].ventFrame.glassID;
                                    Designer.UnifiedModelOperator.changeHandlePosition(memberID, value, selectedMeshes[h].id);
                                }
                            }
                            
                        }
                        else {
                            const memberID = selectedMesh.userData.memberID;
                            Designer.UnifiedModelOperator.changeIntermediatePosition(memberID, value);
                        }
                    };
                }
                else if (Designer.UnifiedModel.ProductType == "Facade" && Designer.UnifiedModel.FacadeType == "UDC") {
                    if (selectedMeshes.length == 0) {
                        const isxInput = event.currentTarget.id == Designer.DimensionLines.dimensionLabels[0];
                        Designer.UnifiedModelOperator.changeUDCFrameDimension(isxInput, value);
                    }
                    else {
                        selectedMesh = selectedMeshes[selectedMeshes.length - 1];
                        if (selectedMesh.subtype == this.subtypes.udcVerticalSashBar || selectedMesh.subtype == this.subtypes.udcHorizontalSashBar) {
                            const selectedtransoms = selectedMeshes.filter(x => x.subtype == selectedMesh.subtype);
                            for (let mesh of selectedtransoms) {
                                const memberID = mesh.userData.memberID;
                                Designer.UnifiedModelOperator.changeIntermediatePosition(memberID, value);
                            }
                        }
                        else if (selectedMesh.subtype == this.subtypes.insideHandle){
                            const memberID = selectedMesh.ventFrame.glassID;
                            Designer.UnifiedModelOperator.changeHandlePosition(memberID, value, selectedMesh.id);
                        }
                        else {
                            const memberID = selectedMesh.userData.memberID;
                            Designer.UnifiedModelOperator.changeIntermediatePosition(memberID, value);
                        }
                    };
                }
                else if (Designer.UnifiedModel.ProductType == "Facade" && Designer.UnifiedModel.FacadeType == "mullion-transom") {
                    if (selectedMeshes.length == 0) {
                        const currentInput = event.currentTarget;
                        const isxInput = currentInput.id == Designer.DimensionLines.dimensionLabels[0];
                        if (currentInput.index == -1) {
                            Designer.UnifiedModelOperator.changeFacadeDimension(isxInput, value);
                        }
                        else {
                            Designer.UnifiedModelOperator.changeFacadeSpans(isxInput, currentInput.index, value);
                        }
                    }
                    else {
                        selectedMesh = selectedMeshes[selectedMeshes.length - 1];
                        if (selectedMesh.subtype == this.subtypes.facadeSlabAnchor) {
                            const slabAnchorID = selectedMesh.userData.slabAnchorID;
                            Designer.UnifiedModelOperator.changeFacadeSlabAnchorPosition(slabAnchorID, value);
                        }
                        else if (selectedMesh.subtype == this.subtypes.insideHandle){
                            const memberID = selectedMesh.ventFrame.glassID;
                            Designer.UnifiedModelOperator.changeHandlePosition(memberID, value, selectedMesh.id);
                        }
                        else if (selectedMesh.subtype == this.subtypes.facadeSpliceJoint) {
                            const spliceJointID = selectedMesh.userData.spliceJointID;
                            Designer.UnifiedModelOperator.changeFacadeSpliceJointPosition(spliceJointID, value);
                        }
                        else if (selectedMesh.subtype == this.subtypes.facadeTransom || selectedMesh.subtype == this.subtypes.facadeMinorMullion) {
                            const selectedFacadeTransoms = selectedMeshes.filter(x => x.subtype == selectedMesh.subtype);
                            for (let mesh of selectedFacadeTransoms) {
                                const memberID = mesh.userData.memberID;
                                Designer.UnifiedModelOperator.changeFacadeIntermediatePosition(memberID, value);
                            }
                        }
                        else {
                            const memberID = selectedMesh.userData.memberID;
                            Designer.UnifiedModelOperator.changeFacadeIntermediatePosition(memberID, value);
                        }
                    };
                }
                else if (Designer.UnifiedModel.ProductType == "Window" && Designer.UnifiedModel.isDoorModel == true){
                    if (selectedMeshes.length == 0) {
                        const isxInput = event.currentTarget.id == Designer.DimensionLines.dimensionLabels[0];
                        if(value <= 4000 && value >= 500 &&
                            ((isxInput && Designer.UnifiedModel.getHeight() <= 4000 && Designer.UnifiedModel.getHeight() >= 500)||
                            (!isxInput && Designer.UnifiedModel.getWidth() <= 4000 && Designer.UnifiedModel.getWidth() >= 500))){
                                if(Designer.Materials.previousColor != null){
                                    Designer.Materials.revertPreviousColor();
                                     dataExchange.sendParentMessage('IncorrectSmallDimension', {active: false, width: 500, height: 500});
                                     dataExchange.sendParentMessage('IncorrectLargeDimension', {active: false, width: 4000, height: 4000});
                                }
                                Designer.UnifiedModelOperator.changeOuterFrameDimension(isxInput, value);

                        }
                        else{
                            if(value > 4000 || (Designer.UnifiedModel.getHeight() > 4000 && isxInput) || (Designer.UnifiedModel.getWidth() > 4000 && !isxInput )){
                                dataExchange.sendParentMessage('IncorrectLargeDimension', {active: true, width: 4000, height: 4000});
                            }
                            if(value < 500  || (Designer.UnifiedModel.getHeight() < 500  && isxInput)|| (Designer.UnifiedModel.getWidth() < 500 && !isxInput)){
                                dataExchange.sendParentMessage('IncorrectSmallDimension', {active: true, width: 500, height: 500});
                            }
                            Designer.Materials.setProfilesColor('#FF0000');
                            Designer.UnifiedModelOperator.changeOuterFrameDimension(isxInput, value);
                        }
                    }
                    else {
                        selectedMesh = selectedMeshes[selectedMeshes.length - 1];
                        if (selectedMesh.subtype == this.subtypes.transom || selectedMesh.subtype == this.subtypes.mullion) {
                            const selectedtransoms = selectedMeshes.filter(x => x.subtype == selectedMesh.subtype);
                            for (let mesh of selectedtransoms) {
                                const memberID = mesh.userData.memberID;
                                Designer.UnifiedModelOperator.changeIntermediatePosition(memberID, value);
                            }
                        }
                        else if (selectedMesh.subtype == this.subtypes.insideHandle){
                            const memberID = selectedMesh.ventFrame.glassID;
                            Designer.UnifiedModelOperator.changeHandlePosition(memberID, value, selectedMesh.id);
                        }
                        else {
                            const memberID = selectedMesh.userData.memberID;
                            Designer.UnifiedModelOperator.changeIntermediatePosition(memberID, value);
                        }
                    };
                }
                else if(Designer.UnifiedModel.ProductType == "SlidingDoor"){
                    if (selectedMeshes.length == 0) {
                        const currentInput = event.currentTarget;
                        const isxInput = event.currentTarget.id == Designer.DimensionLines.dimensionLabels[0];
                        const maxHeight = 3000 + 99;
                        const minHeight = 1935 + 99;
                        const limitDimensions = Designer.Utils.getMaxSlidingDoorDimensions(Designer.UnifiedModel.doorFrames[0].ventFrames);
                        const maxWidth = limitDimensions.max;
                        const minWidth = limitDimensions.min;
                        if(((value <= maxHeight && value >= minHeight && !isxInput) || (value <= maxWidth && value >= minWidth && isxInput)) &&
                            ((isxInput && Designer.UnifiedModel.getHeight() <= maxHeight && Designer.UnifiedModel.getHeight() >= minHeight)||
                            (!isxInput && Designer.UnifiedModel.getWidth() <= maxWidth && Designer.UnifiedModel.getWidth() >= minWidth))){
                                if(Designer.Materials.previousColor != null){
                                    Designer.Materials.revertPreviousColor();
                                     dataExchange.sendParentMessage('IncorrectSmallDimension', {active: false, width: minWidth, height: minHeight});
                                     dataExchange.sendParentMessage('IncorrectLargeDimension', {active: false, width: maxWidth, height: maxHeight});
                                }
                                Designer.UnifiedModelOperator.changeOuterFrameDimension(isxInput, value);

                        }
                        else{
                            if((value > maxHeight && !isxInput) || (value > maxWidth && isxInput) ||(Designer.UnifiedModel.getHeight() > maxHeight && isxInput) || (Designer.UnifiedModel.getWidth() > maxWidth && !isxInput )){
                                dataExchange.sendParentMessage('IncorrectLargeDimension', {active: true, width: maxWidth, height: maxHeight});
                            }
                            if((value < minHeight && !isxInput) || (value < minWidth && isxInput)  || (Designer.UnifiedModel.getHeight() < minHeight  && isxInput)|| (Designer.UnifiedModel.getWidth() < minWidth && !isxInput)){
                                dataExchange.sendParentMessage('IncorrectSmallDimension', {active: true, width: minWidth, height: minHeight});
                            }
                            Designer.Materials.setProfilesColor('#FF0000');
                            Designer.UnifiedModelOperator.changeOuterFrameDimension(isxInput, value);
                        }
                        if (currentInput.index == -1) {
                            Designer.UnifiedModelOperator.changeSlidingDoorDimension(isxInput, value);
                        }
                        else if(isxInput) {
                            Designer.UnifiedModelOperator.changeSlidingDoorSpans(currentInput.index, value);
                        }
                    }
                }


                this.hideInputs();
            });

            input.addEventListener("blur", (event) => {
                this.hideInputs();
            });

        });
    }

    generate(mesh = null) {
        let dimensionLines = null;
        const productType = Designer.UnifiedModel.ProductType;
        if (!mesh && !productType) {
            return null;

        }
        if(!mesh && Designer.UnifiedModel.ProductType == "SlidingDoor")
        {
            dimensionLines = this.initSlidingDoorDimensionLines(mesh);
        }
        else if (!mesh && Designer.UnifiedModel.ProductType == "Facade" && Designer.UnifiedModel.FacadeType == "mullion-transom") {
            if(Designer.UnifiedModel.Sections == null){
                return null;
            }
            dimensionLines = this.initFacadeDimensionLines(mesh);
        }
        else if (Designer.UnifiedModel.ProductType == "Facade" && Designer.UnifiedModel.FacadeType == "UDC") {
            if (!mesh || mesh.subtype === this.subtypes.udcVerticalSashBar || mesh.subtype === this.subtypes.udcHorizontalSashBar) {
                dimensionLines = this.initUDCDimensionLines(mesh);
            }
            else if (mesh.subtype === this.subtypes.udcVerticalFrame || mesh.subtype === this.subtypes.udcTopFrame || mesh.subtype === this.subtypes.udcBottomFrame) {
                dimensionLines = this.initUDCFrameDimensionLines(mesh);
            }
            else if (mesh.subtype === this.subtypes.insideHandle || mesh.subtype === this.subtypes.outsideHandle){
                dimensionLines = this.initHandleDimensionLine(mesh);
            }
            else {
                return null;
            }
        }
        else if (Designer.UnifiedModel.ProductType == "Facade" && !Designer.UnifiedModel.FacadeType){
            return null;
        }
        else if ((!mesh && productType === "Window") || (!mesh && productType === "SlidingDoor") || mesh.subtype === this.subtypes.ventFrame || mesh.subtype === this.subtypes.doorFrame || mesh.subtype === this.subtypes.mullion || mesh.subtype === this.subtypes.transom || mesh.subtype === this.subtypes.facadeMajorMullion
            || mesh.subtype === this.subtypes.facadeMinorMullion || mesh.subtype === this.subtypes.facadeTransom) {
            dimensionLines = this.initStandardDimensionLines(mesh);
        }
        else if (mesh.subtype === this.subtypes.outerInnerFrame) {
            dimensionLines = this.initOuterFrameMemberDimensionLines(mesh);
        }

        else if (mesh.subtype === this.subtypes.facadeSlabAnchor || mesh.subtype === this.subtypes.facadeSpliceJoint) {
            if(mesh.userData.Y < 0 || mesh.userData.Y > Designer.UnifiedModel.getHeight()){
                dimensionLines = this.initFacadeDimensionLines(mesh);
            }
            else{
                dimensionLines = this.initYDimensionLine(mesh);
            }
        }
        else if (mesh.subtype === this.subtypes.insideHandle || mesh.subtype === this.subtypes.outsideHandle){
            dimensionLines = this.initHandleDimensionLine(mesh);
        }
        else {
            return null;
        }
        dimensionLines.name = this.name;

        // Remove old dimension line
        this.clear();

        // Add new dimension lines
        if (Designer.UnifiedModel.getMainModel()) {
            Designer.UnifiedModel.getMainModel().add(dimensionLines);
        }

        // set dimension line visible flag to true
        this.visible = true;
    }

    initOuterFrameMemberDimensionLines(mesh) {
        const frameNames = new DesignerFrameNames();
        let side = frameNames.leftJamb;
        switch (mesh.name) {
            case frameNames.leftJamb:
                side = this.side.left;
                break;
            case frameNames.head:
                side = this.side.top;
                break;
            case frameNames.rightJamb:
                side = this.side.right;
                break;
            case frameNames.sill:
                side = this.side.bottom;
                break;
        }

        let dimensionLines = new THREE.Group();
        const points = Designer.UnifiedModel.Points;
        if (mesh.name == frameNames.sill || mesh.name == frameNames.head) {
            const xs = [...new Set(points.map(x => x.X))].sort((a, b) => { return a - b });
            for (let i in xs) {
                if (i == 0 || xs[i] - xs[i - 1] < 1) continue;
                dimensionLines.add(this.generateDimensionLines(xs[i - 1], xs[i], "horizontal", side, false));
            }
        }
        else {
            const ys = [...new Set(points.map(x => x.Y))].sort((a, b) => { return a - b });;
            for (let i in ys) {
                if (i == 0 || ys[i] - ys[i - 1] < 1e-4) continue;
                dimensionLines.add(this.generateDimensionLines(ys[i - 1], ys[i], "vertical", side, false));
            }
        }
        return dimensionLines;
    }
    initSlidingDoorDimensionLines(mesh){
        let dimensionLines = new THREE.Group();
        
        //commented lines are calculating dimensions for the actual vent widths
        //let VentPoints = Designer.UnifiedModel.doorFrames[0].ventFramePoints;
        // for(let x in VentPoints){
        //     dimensionLines.add(this.generateDimensionLines(VentPoints[x].x1, VentPoints[x].x2,"horizontal", this.side.bottom, true, x));
        // }

        //calculate dimension lines for nominal widths 
        let Spans = Designer.UnifiedModel.Geometry.SlidingDoorSystems[0].VentFrames.map(x => x.Width);
        let xOffset = 0;
        for (let s in Spans) {
            dimensionLines.add(this.generateDimensionLines(xOffset, xOffset + parseInt(Spans[s]), "horizontal", this.side.bottom, false, s));
            xOffset += parseInt(Spans[s]);
        }
        
        let xmin = 0;
        let ymin = 0;
        let xmax = Designer.UnifiedModel.getWidth();
        let ymax = Designer.UnifiedModel.getHeight();

        const xDimensionLines = this.generateDimensionLines(xmin, xmax, "horizontal", this.side.bottomL2)
        dimensionLines.add(xDimensionLines);
        const yDimensionLines = this.generateDimensionLines(ymin, ymax, "vertical", this.side.leftL2)
        dimensionLines.add(yDimensionLines);

        return dimensionLines;
    }
    initFacadeDimensionLines(mesh) {
        let dimensionLines = new THREE.Group();
        let pointIDs = Designer.UnifiedModel.Geometry.Members.filter(x => x.MemberType == 4).map(x => x.PointA);
        let points = Designer.UnifiedModel.Geometry.Points.filter(x => pointIDs.includes(x.PointID));
        const xs = [...new Set(points.map(x => x.X))].sort((a, b) => { return a - b });
        for (let i in xs) {
            if (i == 0 || xs[i] - xs[i - 1] < 1) continue;
            dimensionLines.add(this.generateDimensionLines(xs[i - 1], xs[i], "horizontal", this.side.bottom, true, i - 1));   // set clickable to true in future to enable dimension change
        }
        pointIDs = Designer.UnifiedModel.Geometry.Members.filter(x => x.MemberType == 5).map(x => x.PointA);
        points = Designer.UnifiedModel.Geometry.Points.filter(x => pointIDs.includes(x.PointID));
        const ys = [...new Set(points.map(x => x.Y))].sort((a, b) => { return a - b });
        for (let i in ys) {
            if (i == 0 || ys[i] - ys[i - 1] < 1) continue;
            dimensionLines.add(this.generateDimensionLines(ys[i - 1], ys[i], "vertical", this.side.left, true, i - 1));   // set clickable to true in future to enable dimension change
        }

        let xmin = 0;
        let ymin = 0;
        let xmax = Designer.UnifiedModel.getWidth();
        let ymax = Designer.UnifiedModel.getHeight();

        const xDimensionLines = this.generateDimensionLines(xmin, xmax, "horizontal", this.side.bottomL2)
        dimensionLines.add(xDimensionLines);
        const yDimensionLines = this.generateDimensionLines(ymin, ymax, "vertical", this.side.leftL2)
        dimensionLines.add(yDimensionLines);

        return dimensionLines;
    }

    initUDCDimensionLines(mesh = null) {
        // If a mesh has been passed, the dimension lines are for an intermediate.
        // else the dimension lines are for the whole model.
        let xmin = 0;
        let ymin = 0;
        let xmax = Designer.UnifiedModel.getWidth();
        let ymax = Designer.UnifiedModel.getHeight();

        if (mesh) {
            xmin = mesh.userData.dimensions.xmin;
            xmax = mesh.userData.dimensions.xmax;
            ymin = mesh.userData.dimensions.ymin;
            ymax = mesh.userData.dimensions.ymax;
            if (mesh.subtype === this.subtypes.udcVerticalSashBar) {
                xmin = 0;
            } else if (mesh.subtype === this.subtypes.udcHorizontalSashBar) {
                ymin = 0;
            }
        }

        let dimensionLines = new THREE.Group();
        if (xmax > xmin) {
            const xDimensionLines = this.generateDimensionLines(xmin, xmax, "horizontal", this.side.bottom)
            dimensionLines.add(xDimensionLines);
        }
        if (ymax > ymin) {
            const yDimensionLines = this.generateDimensionLines(ymin, ymax, "vertical", this.side.left)
            dimensionLines.add(yDimensionLines);
        }
        return dimensionLines;
    }

    initUDCFrameDimensionLines(mesh = null) {
        const frameNames = new DesignerFrameNames();
        let side = this.side.left;
        let name = mesh.name;
        switch (name) {
            case frameNames.UDCLeftJamb:
                side = this.side.left;
                break;
            case frameNames.UDCHead:
                side = this.side.top;
                break;
            case frameNames.UDCRightJamb:
                side = this.side.right;
                break;
            case frameNames.UDCSill:
                side = this.side.bottom;
                break;
        }

        let dimensionLines = new THREE.Group();
        const points = Designer.UnifiedModel.Points;
        if (name == frameNames.UDCSill || name == frameNames.UDCHead) {
            const xs = [...new Set(points.map(x => x.X))].sort((a, b) => { return a - b });
            for (let i in xs) {
                if (i == 0 || xs[i] - xs[i - 1] < 1) continue;
                dimensionLines.add(this.generateDimensionLines(xs[i - 1], xs[i], "horizontal", side, false));
            }
        }
        else {
            const ys = [...new Set(points.map(x => x.Y))].sort((a, b) => { return a - b });;
            for (let i in ys) {
                if (i == 0 || ys[i] - ys[i - 1] < 1e-4) continue;
                dimensionLines.add(this.generateDimensionLines(ys[i - 1], ys[i], "vertical", side, false));
            }
        }
        return dimensionLines;
    }

    initStandardDimensionLines(mesh = null) {
        // If a mesh has been passed, the dimension lines are for an intermediate.
        // else the dimension lines are for the whole model.
        let xmin = 0;
        let ymin = 0;
        let xmax = Designer.UnifiedModel.getWidth();
        let ymax = Designer.UnifiedModel.getHeight();

        if (mesh) {
            xmin = mesh.userData.dimensions.xmin;
            xmax = mesh.userData.dimensions.xmax;
            ymin = mesh.userData.dimensions.ymin;
            ymax = mesh.userData.dimensions.ymax;
            if (mesh.subtype === this.subtypes.mullion || mesh.subtype === this.subtypes.facadeMajorMullion || mesh.subtype === this.subtypes.facadeMinorMullion) {
                xmin = 0;
            } else if (mesh.subtype === this.subtypes.transom || mesh.subtype === this.subtypes.facadeTransom) {
                ymin = 0;
            }
        }

        let dimensionLines = new THREE.Group();
        if (xmax > xmin) {
            const xDimensionLines = this.generateDimensionLines(xmin, xmax, "horizontal", this.side.bottom)
            dimensionLines.add(xDimensionLines);
        }
        if (ymax > ymin) {
            const yDimensionLines = this.generateDimensionLines(ymin, ymax, "vertical", this.side.left)
            dimensionLines.add(yDimensionLines);
        }
        return dimensionLines;
    }


    initYDimensionLine(mesh = null) {
        const xmin = 0;
        const ymin = 0;
        const xmax = mesh.userData.X;
        const ymax = mesh.userData.Y;

        let dimensionLines = new THREE.Group();
        const xDimensionLines = this.generateDimensionLines(xmin, xmax, "horizontal", this.side.bottom)
        dimensionLines.add(xDimensionLines);
        const yDimensionLines = this.generateDimensionLines(ymin, ymax, "vertical", this.side.left)
        dimensionLines.add(yDimensionLines);

        return dimensionLines;
    }
    
    initHandleDimensionLine(mesh = null){
        const xmin = 0;
        const ymin = mesh.ventFrame.dimensions.ymin;
        const xmax = mesh.userData.X;
        const ymax = mesh.ventFrame.handlePosition + mesh.ventFrame.dimensions.ymin;

        let dimensionLines = new THREE.Group();
        let yDimensionLines = null;
        
        if(Math.abs(Designer.UnifiedModel.getWidth() - mesh.position.x) > mesh.position.x){
            if(Designer.UnifiedModel.isDoorModel || Designer.UnifiedModel.ProductType == "SlidingDoor") yDimensionLines = this.generateDimensionLines(ymin, ymax, "vertical", this.side.left, false)
            else  yDimensionLines = this.generateDimensionLines(ymin, ymax, "vertical", this.side.left)
        }
        else{
            if(Designer.UnifiedModel.isDoorModel|| Designer.UnifiedModel.ProductType == "SlidingDoor") yDimensionLines = this.generateDimensionLines(ymin, ymax, "vertical", this.side.right, false)
            else  yDimensionLines = this.generateDimensionLines(ymin, ymax, "vertical", this.side.right)

        }
        dimensionLines.add(yDimensionLines);

        return dimensionLines;
    }
    /**
     * Generates Dimension line between two given points and puts ticks at each end and input in the middle
     * @param {THREE.Vector3} startVector The start position
     * @param {THREE.Vector3} stopVector The stop position
     * @param {string} direction Horizontal or vertical
     * @param {DesignerSide} side Left, right, top, or botton
     * @returns {THREE.Group} The Dimension Line
     */
    generateDimensionLines(vmin, vmax, direction, side, clickable = true, index = -1) {
        const w = Designer.UnifiedModel.getWidth();
        const h = Designer.UnifiedModel.getHeight();
        const wh = (w + h) / 2
        // const fontsize = Designer.UnifiedModel.ProductType == "Facade" && Designer.UnifiedModel.FacadeType == "mullion-transom" ? wh / 40 : wh / 25;
        let fontsize = 0;
        if (Designer.UnifiedModel.ProductType == "Window") {
            fontsize = wh / 25;
        }
        else if (Designer.UnifiedModel.ProductType == "Facade" && Designer.UnifiedModel.FacadeType == "mullion-transom") {
            fontsize = wh / 40;
        }
        else if (Designer.UnifiedModel.ProductType == "Facade" && Designer.UnifiedModel.FacadeType == "UDC") {
            fontsize = wh / 25;
        }
        else if (Designer.UnifiedModel.ProductType == "SlidingDoor") {
            fontsize = wh / 30;
        }


        const isHorizontal = direction === "horizontal";
        let rotation = 0;
        let sizeOffset = 0;
        let DLOffset = -1.3 * fontsize;

        switch (side) {
            case this.side.right:
                rotation = Math.PI / 2;
                sizeOffset = Designer.UnifiedModel.getWidth() + 3 * fontsize;
                break;
            case this.side.top:
                sizeOffset = Designer.UnifiedModel.getHeight() + 3 * fontsize;
                break;
            case this.side.left:
                rotation = Math.PI / 2;
                break;
            case this.side.bottom:
                break;
            case this.side.leftL2:
                rotation = Math.PI / 2;
                DLOffset = -3 * fontsize;
                break;
            case this.side.bottomL2:
                DLOffset = -3 * fontsize;
                break;
        }

        // Dimension line material
        const material = new THREE.MeshBasicMaterial({
            color: 0xffffff
        });

        // Dimension label settings
        const fontcolor = { r: 255, g: 255, b: 255, a: 1.0 };
        const borderColor = { r: 120, g: 185, b: 40, a: 1.0 };
        const backgroundColor = { r: 38, g: 38, b: 38, a: 1.0 };


        // Dimension line for the width (x)
        const lineGeometry = new THREE.Geometry();
        if (isHorizontal) {
            lineGeometry.vertices.push(
                new THREE.Vector3(vmin, DLOffset, 0),
                new THREE.Vector3(vmax, DLOffset, 0)
            );
        }
        else {
            lineGeometry.vertices.push(
                new THREE.Vector3(DLOffset, vmin, 0),
                new THREE.Vector3(DLOffset, vmax, 0)
            );
        }

        const lineMesh = new THREE.Line(lineGeometry, material);
        lineMesh.renderOrder = -11;
        // tick triangle material
        const triangleMaterial = new THREE.MeshBasicMaterial({
            color: 0x00a2d1,
            side: THREE.DoubleSide
        });
        const triL = fontsize / 4;  // triangle size
        // Left tick for dimension x line
        const tickGeometryA = new THREE.Geometry();
        let shapeA = new THREE.Shape();     // triangle shape
        if (isHorizontal) {
            tickGeometryA.vertices.push(
                new THREE.Vector3(vmin, DLOffset - triL, 0),
                new THREE.Vector3(vmin, DLOffset + triL, 0)
            );
            shapeA.moveTo(vmin, DLOffset);
            shapeA.lineTo(vmin + 4 * triL, DLOffset - triL);
            shapeA.lineTo(vmin + 4 * triL, DLOffset + triL);
            shapeA.lineTo(vmin, DLOffset);
        }
        else {
            tickGeometryA.vertices.push(
                new THREE.Vector3(DLOffset - triL, vmin, 0),
                new THREE.Vector3(DLOffset + triL, vmin, 0)
            );
            shapeA.moveTo(DLOffset, vmin);
            shapeA.lineTo(DLOffset - triL, vmin + 4 * triL);
            shapeA.lineTo(DLOffset + triL, vmin + 4 * triL);
            shapeA.lineTo(DLOffset, vmin);
        }
        const tickMeshA = new THREE.Line(tickGeometryA, material);
        const triangleGeomA = new THREE.ShapeGeometry(shapeA);
        triangleGeomA.translate(0, 0, 1);
        const triangleMeshA = new THREE.Mesh(triangleGeomA, triangleMaterial);
        triangleMeshA.userData.originalMaterial = triangleMaterial;

        // Right tick for dimension x line
        const tickGeometryB = new THREE.Geometry();
        let shapeB = new THREE.Shape();     // triangle shape
        if (isHorizontal) {
            tickGeometryB.vertices.push(
                new THREE.Vector3(vmax, DLOffset - triL, 0),
                new THREE.Vector3(vmax, DLOffset + triL, 0)
            );
            shapeB.moveTo(vmax, DLOffset);
            shapeB.lineTo(vmax - 4 * triL, DLOffset - triL);
            shapeB.lineTo(vmax - 4 * triL, DLOffset + triL);
            shapeB.lineTo(vmax, DLOffset);
        }
        else {
            tickGeometryB.vertices.push(
                new THREE.Vector3(DLOffset - triL, vmax, 0),
                new THREE.Vector3(DLOffset + triL, vmax, 0)
            );
            shapeB.moveTo(DLOffset, vmax);
            shapeB.lineTo(DLOffset - triL, vmax - 4 * triL);
            shapeB.lineTo(DLOffset + triL, vmax - 4 * triL);
            shapeB.lineTo(DLOffset, vmax);
        }
        const tickMeshB = new THREE.Line(tickGeometryB, material);
        const triangleGeomB = new THREE.ShapeGeometry(shapeB);
        triangleGeomB.translate(0, 0, 1);
        const triangleMeshB = new THREE.Mesh(triangleGeomB, triangleMaterial);
        triangleMeshB.userData.originalMaterial = triangleMaterial;

        const distance = vmax - vmin;

        //Create the dimension x label
        const label = new DesignerSprite({
            message: ` ${distance.toFixed(0)} `,
            fontcolor: fontcolor,
            fontsize: fontsize,
            borderColor: borderColor,
            backgroundColor: backgroundColor,
            rotation: rotation,
            clickable: clickable,
            index: index,
        });
        if (isHorizontal) {
            label.position.set((vmin + vmax) / 2, DLOffset - 0.7 * fontsize, 0);
            label.name = this.dimensionLabels[0];
        } else {
            label.position.set(DLOffset - 0.7 * fontsize, (vmin + vmax) / 2, 0);
            label.name = this.dimensionLabels[1];
        }

        // Group dimension x line, label and ticks
        const lineXGroup = new THREE.Group();
        lineXGroup.add(tickMeshA);
        lineXGroup.add(tickMeshB);
        lineXGroup.add(triangleMeshA);
        lineXGroup.add(triangleMeshB);
        lineXGroup.add(lineMesh);
        lineXGroup.add(label);

        switch (side) {
            case this.side.right:
                lineXGroup.position.x = sizeOffset;
                break;
            case this.side.top:
                lineXGroup.position.y = sizeOffset;
                break;
        }
        lineXGroup.renderOrder = 11;
        return lineXGroup;
    }

    clear() {
        const dimensionLines = Designer.Scene.scene.getObjectByName(this.name);
        if (dimensionLines) {
            Designer.UnifiedModel.getMainModel().remove(dimensionLines);
        }
    }

    /**
     * Positions an input[type=number] over the sprite label
     * NOTE: input id and sprite name must be the same
     * @param {THREE.Sprite} sprite the sprite
     */
    positionInput(sprite) {
        const widthHalf = Designer.Settings.getClientWidth() / 2;
        const heightHalf = Designer.Settings.getClientHeight() / 2;
        let input = null;
        let pos = null;
        pos = new THREE.Vector3();
        pos = pos.setFromMatrixPosition(sprite.matrixWorld);
        pos.project(Designer.Camera.getCamera());

        let offsets = document.getElementById("sps-designer-viewer").getBoundingClientRect();

        pos.x = (pos.x * widthHalf) + widthHalf + offsets.left;
        pos.y = - (pos.y * heightHalf) + heightHalf + offsets.top;
        pos.z = 0;

        input = document.getElementById(sprite.name);

        if (input) {
            input.style.position = "fixed";
            input.style.left = `${pos.x}px`;
            input.style.top = `${pos.y}px`;
            input.value = parseFloat(sprite.dimension).toFixed(0);
            input.index = parseInt(sprite.userData.index);
        }
    }

    /**
     * Shows the input[type=number] for a specific sprite label
     * NOTE: input id and sprite name must be the same
     * @param {THREE.Sprite} sprite the sprite
     */
    showInput(sprite) {
        const input = document.getElementById(sprite.name);
        if (!input) return;
        const isxInput = sprite.name == Designer.DimensionLines.dimensionLabels[0];
        const selectedMeshes = Designer.EventListener.getSelectedMeshes();
        // if (selectedMeshes.length > 1) {
        //     return;
        // };
        const selectedMesh = selectedMeshes[selectedMeshes.length - 1];
        if (isxInput) {
            if (selectedMeshes.length === 0 || selectedMesh.subtype == this.subtypes.mullion ||
                selectedMesh.subtype == this.subtypes.facadeMajorMullion || selectedMesh.subtype == this.subtypes.facadeMinorMullion
                || selectedMesh.subtype == this.subtypes.udcVerticalSashBar) {
                input.classList.remove("hidden");
                input.focus();
                input.setSelectionRange(0, 100);
            }
        }
        else {
            if (selectedMeshes.length === 0 || selectedMesh.subtype == this.subtypes.transom ||
                selectedMesh.subtype == this.subtypes.facadeTransom || selectedMesh.subtype == this.subtypes.facadeSlabAnchor
                || selectedMesh.subtype == this.subtypes.facadeSpliceJoint || selectedMesh.subtype == this.subtypes.udcHorizontalSashBar || 
                selectedMesh.subtype === this.subtypes.insideHandle || selectedMesh.subtype == this.subtypes.outsideHandle) {
                input.classList.remove("hidden");
                input.focus();
                input.setSelectionRange(0, 100);
            }
        }
    }

    hideInputs() {
        for (var i = 0; i < this.dimensionLabels.length; i++) {
            document.getElementById(this.dimensionLabels[i]).classList.add("hidden");
        }
    }

    // handle Input
    handleInput(sprite) {
        if(!Designer.UnifiedModel.isOrderPlaced)
        {
            this.settingsSprite = sprite;
            this.positionInput(sprite);
            this.showInput(sprite);
        }
        
    }
}