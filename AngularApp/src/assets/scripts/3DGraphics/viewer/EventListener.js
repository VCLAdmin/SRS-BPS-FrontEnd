class DesignerEventListener {

    constructor() {

        this.subtypes = new DesignerSubType();

        this.selectedMeshes = [];
        this.highlightedMeshes = [];

        this.mouse = {
            down: false,
            x: 0,
            delta: 0
        };

        this.init();
    }

    init() {
        this.handleBtnClick();
        this.handleDomListeners();
    }

    handleBtnClick() {
        // lower left control btns
        // document.getElementById("controls-axes-helper").addEventListener('click', (event) => {
        //     const isSelected = event.target.classList.contains("selected");
        //     Designer.DisplaySettings.updateDisplaySetting({ showAxes: !isSelected });
        // });

        // document.getElementById("controls-glass-id").addEventListener('click', (event) => {
        //     const isSelected = event.target.classList.contains("selected");
        //     Designer.DisplaySettings.updateDisplaySetting({ showGlassID: !isSelected, showGlazingTypeColor: !isSelected, showVentInfo: !isSelected });
        // });

        // document.getElementById("controls-grid").addEventListener('click', (event) => {
        //     const isSelected = event.target.classList.contains("selected");
        //     Designer.DisplaySettings.updateDisplaySetting({ showGrid: !isSelected });
        // });

        // top control btns
        // document.getElementById("controls-edit").addEventListener('click', (event) => {
        //     Designer.DisplaySettings.updateDisplaySetting({ showThreeDView: false });
        // });

        // document.getElementById("controls-add-transom").addEventListener('click', (event) => {
        //     const selectedGlassIDs = this.selectedMeshes.filter(x => x.subtype == "pane").map(x => x.userData.glassID);
        //     for (let glassID of selectedGlassIDs) {
        //         Designer.UnifiedModelOperator.addTransom(glassID);
        //     }
        // });
        // document.getElementById("controls-add-mullion").addEventListener('click', (event) => {
        //     const selectedGlassIDs = this.selectedMeshes.filter(x => x.subtype == "pane").map(x => x.userData.glassID);
        //     for (let glassID of selectedGlassIDs) {
        //         Designer.UnifiedModelOperator.addMullion(glassID);
        //     }
        // });
        // document.getElementById("controls-delete").addEventListener('click', (event) => {
        //     let selectedIntermediateIDs = this.selectedMeshes.filter(x => x.subtype == "transom" || x.subtype == "mullion").map(x => x.userData.memberID);
        //     selectedIntermediateIDs.sort((a, b) => { return b - a });
        //     for (let id of selectedIntermediateIDs) {
        //         Designer.UnifiedModelOperator.deleteIntermediate(id);
        //     }
        // })
    }

    handleDomListeners() {
        Designer.Renderer.renderer.domElement.addEventListener('mousemove', (event) => {
            this.handleMouseMove(event);
        });

        Designer.Renderer.renderer.domElement.addEventListener('mouseup', (event) => {
            this.handleMouseUp(event);
        });

        Designer.Renderer.renderer.domElement.addEventListener('mousedown', (event) => {
            this.handleMouseDown(event);
        });

        Designer.Renderer.renderer.domElement.addEventListener('wheel', (event) => {
            this.handleMouseWheel(event);
        });
    }

    handleMouseWheel(event) {
        Designer.DimensionLines.hideInputs();
    }

    handleMouseUp(event) {
        this.mouse.down = false;
        this.mouse.delta = 0;

        if (this.mouse.delta > 5) {
            return;
        }

        let mesh = this.castRay(event);
        if (event.button === 0 && !event.ctrlKey && !event.shiftKey) {
            if (!mesh || mesh.type !== "Sprite") {
                this.clearSelectedMeshes();
            }
        }

        Designer.DimensionLines.hideInputs();

        if (event.button === 0) {
            if (mesh) {
                if (mesh.type === "Sprite" && !Designer.DisplaySettings.currentDisplaySetting.showStructuralResultColor
                    && !Designer.DisplaySettings.currentDisplaySetting.showThermalResultLabel) {
                    if (mesh.userData.clickable) {
                        if (mesh.userData.type == "quickcheck_warningsymbol") {
                            Designer.UnifiedModel.quickCheck.clickWarningSymbol(mesh);
                        }
                        else {
                            Designer.DimensionLines.handleInput(mesh);
                        }
                    }
                }
                else {
                    if (!mesh.selected && !(mesh.userData.clickable == false)) {
                        this.selectMesh(mesh);
                    } else {
                        this.deselectMesh(mesh);
                    }
                }
            }
            else if (!Designer.DisplaySettings.isThreeDMode()) {
                Designer.DimensionLines.generate();   // generate width height diemsnionlines
            }
        }
    }

    handleMouseMove(event) {
        this.clearHighlightedMeshes();
        // this.clearHighlightedWarningSymbol();
        if(!this.mouse.down){
            const mesh = this.castRay(event);
            if (mesh && event.buttons === 0 && !Designer.Renderer.takingScreenshot) {
                document.body.style.cursor = "pointer";
                if (mesh.userData.clickable == false) document.body.style.cursor = "initial";
                this.highlightMesh(mesh);
                if (mesh.userData.type == "quickcheck_warningsymbol") Designer.UnifiedModel.quickCheck.highlightWarningSymbol(mesh);
            } else {
                document.body.style.cursor = "initial";
            }
        }
        

        if (this.mouse.down) {
            this.mouse.delta = Math.abs(event.clientX - this.mouse.x);
        }

        if (this.mouse.down && this.mouse.delta > 5 && this.mouse.which !== 3) {
            Designer.DisplaySettings.setThreeDMode();
        }
    }

    handleMouseDown(event) {
        this.mouse = {
            down: true,
            x: event.clientX,
            delta: 0,
            which: event.which,
        }

        if (!Designer.DisplaySettings.isThreeDMode()) {
            Designer.DimensionLines.hideInputs();
        }

    }

    // select/deselect mesh for mouse up event
    selectMesh(mesh) {
        if (this.selectedMeshes.indexOf(mesh) > -1) {
            return;
        }

        const setMaterial = (child) => {
            if (child instanceof THREE.Mesh) {
                const isRed = Designer.UnifiedModel.checkisRed(child.parent.userData.memberID);
                const selectedMaterialColor = isRed ? 0xFA3C3C : 0x30F23C;
                child.material = new THREE.MeshBasicMaterial({
                    color: selectedMaterialColor,
                    side: THREE.DoubleSide
                });
            }
        };

        for (var i in mesh.children) {
            let child = mesh.children[i];
            if (child.subtype === this.subtypes.outerInnerFrame) {
                for (var j in child.children) {
                    setMaterial(child.children[j]);
                }
            }
            else {
                setMaterial(child);
            }
        }

        mesh.selected = true;
        this.selectedMeshes.push(mesh);
        if (mesh.subtype === this.subtypes.insideHandle || mesh.subtype === this.subtypes.outsideHandle){
            Designer.DisplaySettings.updateDisplaySetting({ showThreeDView: false });
            if(mesh.subtype === this.subtypes.outsideHandle)
            Designer.Camera.centerCamera()
            else
            Designer.Camera.centerCameraInside();
            Designer.DimensionLines.generate(mesh);
        }
        else if (!Designer.DisplaySettings.isThreeDMode()) {
            Designer.DimensionLines.clear();
            Designer.DimensionLines.generate(mesh);
        }

        this.sendSelectEvent();
    }

    deselectMesh(mesh) {
        for (var i in mesh.children) {
            let child = mesh.children[i];
            if (child instanceof THREE.Mesh) {
                child.material = child.userData.originalMaterial;
            }
        }
        const index = this.selectedMeshes.indexOf(mesh);
        this.selectedMeshes.splice(index, 1)
        mesh.selected = false;
        this.sendSelectEvent();
    }

    clearSelectedMeshes() {
        const setMaterial = (child) => {
            if (child instanceof THREE.Mesh) {
                child.material = child.userData.originalMaterial;
            }
        };

        for (var j in this.selectedMeshes) {
            for (var i in this.selectedMeshes[j].children) {
                let child = this.selectedMeshes[j].children[i];

                if (child.subtype === this.subtypes.outerInnerFrame) {
                    for (var k in child.children) {
                        setMaterial(child.children[k]);
                    }
                }
                else {
                    setMaterial(child);
                }
            }
            this.selectedMeshes[j].selected = false;
        }
        this.selectedMeshes = [];

        this.sendSelectEvent();

    }

    sendSelectEvent() {
        this.selectGlass();
        this.selectSlabAnchor();
        this.selectReinforcement();
        this.selectSpliceJoint();
        this.selectMajorMullion();
        if (Designer.UnifiedModel.ProductType == "Window") {
            this.selectIntermediate();
        }
        else if (Designer.UnifiedModel.ProductType == "Facade") {
            this.selectFacadeMember();
        }
    }


    getSelectedMeshes() {
        return this.selectedMeshes;
    }

    resetSelectedMeshArrayIndicies() {
        this.selectedMeshes = this.selectedMeshes.filter(function () { return true; });
    }


    // add/clear hightlight for mouse move event
    highlightMesh(mesh, color = 0xA2D892) {
        if (this.highlightedMeshes.indexOf(mesh) > -1 || mesh.selected) {
            return;
        }

        if (mesh.userData.clickable !== undefined && mesh.userData.clickable == false) {
            color = 0x999999;
        }

        const setMaterial = (child) => {
            if (child instanceof THREE.Mesh) {
                child.material = new THREE.MeshBasicMaterial({
                    color: color,
                    side: THREE.DoubleSide,
                });
            }
        }

        for (var i in mesh.children) {
            let child = mesh.children[i];
            if (child.subtype === this.subtypes.outerInnerFrame) {
                for (var j in child.children) {
                    setMaterial(child.children[j], true);
                }
            }
            else {
                setMaterial(child);
            }
        }

        this.highlightedMeshes.push(mesh);
    }

    clearHighlightedMeshes() {
        const setMaterial = (child) => {
            if (child instanceof THREE.Mesh && !this.highlightedMeshes[j].selected) {
                child.material = child.userData.originalMaterial;
            }
        }

        for (var j in this.highlightedMeshes) {
            let mesh = this.highlightedMeshes[j];
            if (mesh.userData.type == "quickcheck_warningsymbol") Designer.UnifiedModel.quickCheck.clearhighlightedWarningSymbol(mesh);
            for (var i in mesh.children) {
                let child = this.highlightedMeshes[j].children[i];
                if (child.subtype === this.subtypes.outerInnerFrame) {
                    for (var k in child.children) {
                        setMaterial(child.children[k]);
                    }
                } else {
                    setMaterial(child);
                }
            }
        }
        this.highlightedMeshes = [];
    }

    // castRay mouse picking (working out what objects in the 3d space the mouse is over) amongst other things
    castRay(event) {
        if (!Designer.UnifiedModel.getMainModel()) {
            return;
        }

        const raycaster = new THREE.Raycaster();
        let mouse = new THREE.Vector2();
        raycaster.intersectHidden = true;
        mouse.x = (event.offsetX / Designer.Renderer.renderer.domElement.clientWidth) * 2 - 1;
        mouse.y = -((event.offsetY) / Designer.Renderer.renderer.domElement.clientHeight) * 2 + 1;

        raycaster.setFromCamera(mouse, Designer.Camera.camera);
        let intersects = raycaster.intersectObjects(Designer.UnifiedModel.getMainModel().children, true);

        if (intersects.length <= 0) {
            return null;
        } else {
            let intersected = null;

            if (intersects[0].object.type === "Sprite") {
                intersected = intersects[0].object;
            }
            else if (intersects.length > 1 && intersects[1].object.parent.subtype === "facade__slab_anchor") {
                intersected = intersects[1].object.parent;
            }
            else {
                intersected = intersects[0].object.parent;
                if (intersected.subtype === this.subtypes.outerInnerFrame) {
                    intersected = intersected.parent;
                }
            }

            return intersected;
        }
    }

    //
    selectIntermediateById(id) {
        this.clearSelectedMeshes();
        const mainModel = Designer.UnifiedModel.getMainModel();
        const mesh = mainModel.children.find(x => x.userData && x.userData.memberID == id);
        if (mesh) this.selectMesh(mesh);
    }

    selectSlabAnchorById(id) {
        this.clearSelectedMeshes();
        const mainModel = Designer.UnifiedModel.getMainModel();
        const mesh = mainModel.children.find(x => x.userData && x.userData.slabAnchorID == id);
        if (mesh) this.selectMesh(mesh);
    }

    selectReinforcementById(id) {
        this.clearSelectedMeshes();
        const mainModel = Designer.UnifiedModel.getMainModel();
        const mesh = mainModel.children.find(x => x.userData && x.userData.reinforcementID == id);
        if (mesh) this.selectMesh(mesh);
    }

    selectSpliceJointById(id) {
        this.clearSelectedMeshes();
        const mainModel = Designer.UnifiedModel.getMainModel();
        const mesh = mainModel.children.find(x => x.userData && x.userData.spliceJointID == id);
        if (mesh) this.selectMesh(mesh);
    }

    highlightGlassById(id, colorCode) {
        this.clearHighlightedMeshes();
        const mainModel = Designer.UnifiedModel.getMainModel();
        const mesh = mainModel.children.find(x => x.userData && x.userData.glassID == id);
        if (colorCode) {
            const hexcolorCode = parseInt(colorCode, 16);
            if (mesh){
                if(mesh.userData.glassID){
                    if(Designer.UnifiedModel.ProductType == "Window"){
                        if(Designer.UnifiedModel.isDoorModel){
                            const vents = Designer.UnifiedModel.doorFrames.filter(d=>d.infillID == mesh.userData.glassID);
                            for(var i in vents){
                                this.highlightMesh(vents[i].doorFrameGroup, hexcolorCode);
                            }
                        }
                        else{
                            const vents = Designer.UnifiedModel.ventFrames.filter(v=>v.glassID == mesh.userData.glassID);
                            for(var i in vents){
                                this.highlightMesh(vents[i].ventFrameGroup, hexcolorCode);
                            }
                        }
                        
                    }
                    else{
                        this.highlightMesh(mesh, hexcolorCode);
                    }
                    
                }
            }
        }
        else {
            if (mesh) {
                if(mesh.userData.glassID){
                    if(Designer.UnifiedModel.ProductType == "Window"){
                        if(Designer.UnifiedModel.isDoorModel){
                            const vents = Designer.UnifiedModel.doorFrames.filter(d=>d.infillID == mesh.userData.glassID);
                            for(var i in vents){
                                this.highlightMesh(vents[i].doorFrameGroup);
                            }
                        }
                        else{
                            const vents = Designer.UnifiedModel.ventFrames.filter(v=>v.glassID == mesh.userData.glassID);
                            for(var i in vents){
                                this.highlightMesh(vents[i].ventFrameGroup);
                            }
                        }
                        
                    }
                    else{
                        this.highlightMesh(mesh);
                    }
                }
            }
        }

    }

    highlightIntermediateById(id, colorCode) {
        this.clearHighlightedMeshes();
        const mainModel = Designer.UnifiedModel.getMainModel();
        const mesh = mainModel.children.find(x => x.userData && x.userData.memberID == id);
        if (mesh) this.highlightMesh(mesh, colorCode);
    }

    // dataExchange with Angular, trigger Angular iframe event "selectGlass"
    selectGlass() {
        let selectedGlassIDs = this.selectedMeshes.filter(x => x.subtype == "pane").map(x => x.userData.glassID);
        // if (selectedGlassIDs.length > 0) {
        let data = { selectedGlassIDs: [...selectedGlassIDs] };
        dataExchange.sendParentMessage('selectGlass', data);   // pass an array of selected glassIDs in data
        if(selectedGlassIDs.length > 1){
            dataExchange.sendParentMessage('SelectedMultipleGlass', true);
        }
        else{
            dataExchange.sendParentMessage('SelectedMultipleGlass', false);
        }

        if(selectedGlassIDs.length > 0){
            let glassMeshes = Designer.UnifiedModel.GlassList.filter(g => selectedGlassIDs.some(s=> s== g.InfillID));
            let bottomMemberIDs= glassMeshes.map(x=>x.BoundingMembers[3]);
            let bottomMembers = Designer.UnifiedModel.Members.filter(m=>bottomMemberIDs.some(id=>id == m.MemberID));
            if(bottomMembers.some(bm=>bm.MemberType == 3) || bottomMembers.some(bm=>bm.MemberType == 6)){
                dataExchange.sendParentMessage('SelectedTransomGlass', true);
            }
            else{
                dataExchange.sendParentMessage('SelectedTransomGlass', false);
            }
        }
        
        
        if(selectedGlassIDs.length > 0 && Designer.UnifiedModel.OperabilitySystems != null && Designer.UnifiedModel.OperabilitySystems.length > 0){
            let glassMeshes = Designer.UnifiedModel.GlassList.filter(g => selectedGlassIDs.some(s=> s== g.InfillID));
            let OperabilitySystems = Designer.UnifiedModel.OperabilitySystems.filter(op => glassMeshes.some(g=>g.OperabilitySystemID == op.OperabilitySystemID));
            let HasDoor = OperabilitySystems.some(op => op.DoorSystemID !== -1);
            if(HasDoor){
                dataExchange.sendParentMessage('SelectedDoorGlass', true);
                return;
            }
        }
        dataExchange.sendParentMessage('SelectedDoorGlass', false);
        // }
    }

    // dataExchange with Angular, trigger Angular iframe event "selectIntermediate"
    selectIntermediate() {
        let selectedIntermediateIDs = this.selectedMeshes.filter(x => x.subtype == "transom" || x.subtype == "mullion").map(x => x.userData.memberID);
        // if (selectedIntermediateIDs.length > 0) {
        let data = { selectedIntermediateIDs: [...selectedIntermediateIDs] };
        dataExchange.sendParentMessage('selectIntermediate', data);    // pass an array of memberIDs of selected intermediates  in data
        //  }
    }

    selectMajorMullion() {
        let selectedMajorMullionIDs = this.selectedMeshes.filter(x => x.subtype == "facade__major__mullion").map(x => x.userData.memberID);
        // if (selectedIntermediateIDs.length > 0) {
        let data = { selectedMajorMullionIDs: [...selectedMajorMullionIDs] };
        dataExchange.sendParentMessage('selectMajorMullion', data);    // pass an array of memberIDs of selected intermediates  in data
        //  }
    }

    selectFacadeMember() {
        let selectedFacadeMemebers = this.selectedMeshes.filter(x => x.subtype == "facade__major__mullion" || x.subtype == "facade__minor__mullion" || x.subtype == "facade__transom"
            || x.subtype == "udc__vertical__sashbar" || x.subtype == "udc__horizontal__sashbar"
            || x.subtype == "udc__vertical__frame" || x.subtype == "udc__bottom__frame" || x.subtype == "udc__top__frame");
        let selectedFacadeMemeberIDs = selectedFacadeMemebers.map(x => x.userData.memberID);
        // if (selectedIntermediateIDs.length > 0) {
        let data = { selectedFacadeMemeberIDs: [...selectedFacadeMemeberIDs] };
        dataExchange.sendParentMessage('selectFacadeMemeber', data);    // pass an array of memberIDs of selected intermediates  in data
        //  }
    }

    // dataExchange with Angular, trigger Angular iframe event "selectSlabAnchor"
    selectSlabAnchor() {
        let selectedSlabAnchorIDs = this.selectedMeshes.filter(x => x.subtype == this.subtypes.facadeSlabAnchor).map(x => x.userData.slabAnchorID);
        let data = { selectedSlabAnchorIDs: [...selectedSlabAnchorIDs] };
        dataExchange.sendParentMessage('selectSlabAnchor', data);    // pass an array of IDs of selected slab anchors in data
    }

    // dataExchange with Angular, trigger Angular iframe event "selectReinforcement"
    selectReinforcement() {
        let selectedReinforcementIDs = this.selectedMeshes.filter(x => x.subtype == this.subtypes.facadeReinforcement).map(x => x.userData.reinforcementID);
        let data = { selectedReinforcementIDs: [...selectedReinforcementIDs] };
        dataExchange.sendParentMessage('selectReinforcement', data);    // pass an array of IDs of selected slab anchors in data
    }

    // dataExchange with Angular, trigger Angular iframe event "selectSpliceJoint"
    selectSpliceJoint() {
        let selectedSpliceJointIDs = this.selectedMeshes.filter(x => x.subtype == this.subtypes.facadeSpliceJoint).map(x => x.userData.spliceJointID);
        let data = { selectedSpliceJointIDs: [...selectedSpliceJointIDs] };
        dataExchange.sendParentMessage('selectSpliceJoint', data);    // pass an array of IDs of selected slab anchors in data
    }

    // dataExchange with Angular
    clickAddTransom() {
        const selectedGlassIDs = this.selectedMeshes.filter(x => x.subtype == "pane").map(x => x.userData.glassID);
        for (let glassID of selectedGlassIDs) {
            Designer.UnifiedModelOperator.addTransom(glassID);
        }
    }

    // dataExchange with Angular
    clickAddMullion() {
        const selectedGlassIDs = this.selectedMeshes.filter(x => x.subtype == "pane").map(x => x.userData.glassID);
        for (let glassID of selectedGlassIDs) {
            Designer.UnifiedModelOperator.addMullion(glassID);
        }
    }

    // dataExchange with Angular
    clickDelete() {
        const subtypes = new DesignerSubType();
        let selectedIntermediateIDs = this.selectedMeshes.filter(x => x.subtype == "transom" || x.subtype == "mullion" ||
            x.subtype == "facade__transom" || x.subtype == "facade__minor__mullion" || x.subtype == subtypes.udcHorizontalSashBar || x.subtype == subtypes.udcVerticalSashBar)
            .map(x => x.userData.memberID);
        selectedIntermediateIDs.sort((a, b) => { return b - a });
        for (let id of selectedIntermediateIDs) {
            Designer.UnifiedModelOperator.deleteIntermediate(id);
        }
        let selectedSlabAnchorIDs = this.selectedMeshes.filter(x => x.subtype == this.subtypes.facadeSlabAnchor).map(x => x.userData.slabAnchorID);
        for (let id of selectedSlabAnchorIDs) {
            Designer.UnifiedModelOperator.deleteSlabAnchor(id);
        }
        let selectedReinforcementIDs = this.selectedMeshes.filter(x => x.subtype == this.subtypes.facadeReinforcement).map(x => x.userData.reinforcementID);
        for (let id of selectedReinforcementIDs) {
            Designer.UnifiedModelOperator.deleteReinforcement(id);
        }
        let selectedSpliceJointIDs = this.selectedMeshes.filter(x => x.subtype == this.subtypes.facadeSpliceJoint).map(x => x.userData.spliceJointID);
        for (let id of selectedSpliceJointIDs) {
            Designer.UnifiedModelOperator.deleteSpliceJoint(id);
        }
    }

    // dataExchange with Angular
    clickCopyToRight() {
        Designer.UnifiedModelOperator.copyFacadeRightMostColumn()
        // Designer.UnifiedModelOperator.deleteFacadeRightMostColumn(); //for test only
    }

    clickDeleteFacadeRightMostColumn() {
        Designer.UnifiedModelOperator.deleteFacadeRightMostColumn();
    }

    // dataExchange with Angular
    clickCopyToTop() {
        Designer.UnifiedModelOperator.copyFacadeTopMostRow();
        // Designer.UnifiedModelOperator.deleteFacadeTopMostRow();  //for test only
    }

    clickDeleteFacadeTopMostRow() {
        Designer.UnifiedModelOperator.deleteFacadeTopMostRow();
    }

    clickDistributeFacadeMajorMullionsEqually() {
        if(this.selectedMeshes[0].subtype == "facade__major__mullion"){
            let selectedMajorMullionIDs = this.selectedMeshes.filter(x => x.subtype == "facade__major__mullion").map(x => x.userData.memberID);
            selectedMajorMullionIDs.sort((a, b) => { return b - a });
            Designer.UnifiedModelOperator.distributeFacadeMajorMullionsEqually(selectedMajorMullionIDs);
        }
        else if(this.selectedMeshes[0].subtype == "facade__transom"){
            let selectedTransomIDs = this.selectedMeshes.filter(x => x.subtype == "facade__transom").map(x => x.userData.memberID);
            selectedTransomIDs.sort((a, b) => { return b - a });
            Designer.UnifiedModelOperator.distributeFacadeTransomsEqually(selectedTransomIDs);
        }
        
    }

    getModelHeight() {
        let height = Designer.UnifiedModel.getHeight();
        return height;
    }

    clickAddSlabAnchors(anchorType) {
        let selectedMajorMullionIDs = this.selectedMeshes.filter(x => x.subtype == "facade__major__mullion").map(x => x.userData.memberID);
        selectedMajorMullionIDs.sort((a, b) => { return b - a });
        Designer.UnifiedModelOperator.addSlabAnchors(anchorType, selectedMajorMullionIDs);
    }

    clickAddSpliceJoints(jointType) {
        let selectedMajorMullionIDs = this.selectedMeshes.filter(x => x.subtype == "facade__major__mullion").map(x => x.userData.memberID);
        selectedMajorMullionIDs.sort((a, b) => { return b - a });
        Designer.UnifiedModelOperator.addSpliceJoints(jointType, selectedMajorMullionIDs);
    }
}
