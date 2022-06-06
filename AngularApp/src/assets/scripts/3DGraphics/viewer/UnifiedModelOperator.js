/**
 * class for change unified model
**/
class DesignerUnifiedModelOperator {
    constructor() {
        this.UnifiedModelJSON = null;
        this.Geometry = null;
        this.Points = null;
        this.Members = null;
        this.GlassList = null;
        this.Sections = null;
        this.OperabilitySystems = null;
        this.SlidingDoorSystems = null;
        this.width = 0;
        this.height = 0;

        this.minSpace = 200;  // minimum space between two memebers

        this.facadeXSpans = [];
        this.facadeXSpansEdited = [];
        this.facadeXSpansOriginalEdited = [];
        this.facadeYSpans = [];
        this.facadeYSpansEdited = [];
        this.facadeYSpansOriginalEdited = [];
        this.slidingDoorSpans = [];
        this.slidingDoorSpansEdited = [];
        this.slidingDoorSpansOriginalEdited = [];

        this.initialized = false
    }

    loadJSON(UnifiedModelJSON, resetCamera = true) {
        const materialsExist = () => {
            if (Object.keys(Designer.Materials.materials).length >= 8) {
                for (var i in Designer.Materials.materials) {
                    return true;
                }
            }
            return false;
        }

        if (!materialsExist()) {
            setTimeout(() => {
                this.loadJSON(UnifiedModelJSON);
            }, 200);
        } else {
            this.loadModel(UnifiedModelJSON);
            if (resetCamera) Designer.Camera.centerCamera();
            this.initialized = true;
            if (Designer.DisplaySettings.currentDisplaySetting.showThreeDView == false)
                Designer.DimensionLines.generate(null);
        }
    }

    // load Unified Model JSON object, populate UnifiedModelOperator and UnifiedModel object;
    loadModel(UnifiedModelJSON) {
        this.UnifiedModelJSON = UnifiedModelJSON;
        const Geometry = this.UnifiedModelJSON.ModelInput.Geometry;
        this.Geometry = Geometry;
        this.Points = Geometry.Points;
        this.Members = Geometry.Members;
        this.GlassList = Geometry.Infills;
        this.Sections = Geometry.Sections;
        this.OperabilitySystems = Geometry.OperabilitySystems;
        this.SlidingDoorSystems = Geometry.SlidingDoorSystems;
        const ProductType = UnifiedModelJSON.ProblemSetting.ProductType;
        const FacadeType = UnifiedModelJSON.ProblemSetting.FacadeType;
        this.ProductType = ProductType;
        this.FacadeType = FacadeType;
        if (this.ProductType === "Facade" || this.ProductType === "UDC") {
            this.Sections = Geometry.FacadeSections;
        }
        this.SlabAnchors = Geometry.SlabAnchors;
        this.Reinforcements = Geometry.Reinforcements;
        this.SpliceJoints = Geometry.SpliceJoints;

        if(this.CheckIfDoorExists(this.Geometry)){
            if(!this.Members.find(x=>x.MemberType == 31))
            {
                const ops = this.Geometry.OperabilitySystems.filter(op => this.Geometry.Infills.some(inf => inf.OperabilitySystemID == op.OperabilitySystemID));
                if (ops.length > 0) {
                    let doorInfillID = ops.find(op => this.Geometry.DoorSystems.some(ds => ds.DoorSystemID == op.DoorSystemID));
                    let infillID = this.Geometry.Infills.find(inf => inf.OperabilitySystemID == doorInfillID.OperabilitySystemID).InfillID;
                    this.addDoor(infillID);
                }
            }
            
        }
        else
        {
            if(this.Members.find(x=>x.MemberType == 31)){
                this.removeDoor();
            }
        }

        Designer.UnifiedModel.drawModel(this.UnifiedModelJSON);
        this.width = Designer.UnifiedModel.getWidth();
        this.height = Designer.UnifiedModel.getHeight();
        

        if (this.ProductType === "Facade" && this.initialized == false) {
            this.initFacadeSpans();
        }
        else if (this.ProductType == "SlidingDoor"){
            this.initSlidingDoorSpans();
        }
    }

    // function to be called when change outer frame dimension
    changeOuterFrameDimension(isxInput, value) {
        for (let glass of Designer.UnifiedModel.GlassList) {
            let glassDimensions = Designer.UnifiedModel.getGlassDimensions(glass.BoundingMembers);
            if(glass.HandlePosition == Math.round((glassDimensions.ymax - glassDimensions.ymin) / 2)){
                glass.HandlePosition = -1;
            }
        }
        if (isxInput) {
            const mullions = this.Members.filter(x => x.MemberType == 2);
            const xs = mullions.map(m => this.Points.find(x => x.PointID == m.PointA).X);
            const xMax = Math.max(...xs);
            value = Math.max(value, xMax + this.minSpace);
            for (let point of this.Points) {
                if (Math.abs(point.X - this.width) < 1e-4) {
                    point.X = value;
                }
            }
        }
        else {
            const transoms = this.Members.filter(x => x.MemberType == 3);
            const ys = transoms.map(m => this.Points.find(x => x.PointID == m.PointA).Y);
            const yMax = Math.max(...ys);
            value = Math.max(value, yMax + this.minSpace);
            for (let point of this.Points) {
                if (Math.abs(point.Y - this.height) < 1e-4) {
                    point.Y = value;
                }
            }
        }
        
        Designer.UnifiedModel.drawModel(this.UnifiedModelJSON);
        this.width = Designer.UnifiedModel.getWidth();
        this.height = Designer.UnifiedModel.getHeight();

        Designer.DimensionLines.generate();

        // dataExchange, trigger changeUnifiedModel events in iframe
        Designer.Camera.centerCamera();
        this.changeUnifiedModel();
    }

    // function to be called when change outer frame dimension
    changeUDCFrameDimension(isxInput, value) {
        if (isxInput) {
            const mullions = this.Members.filter(x => x.MemberType == 24);
            const xs = mullions.map(m => this.Points.find(x => x.PointID == m.PointA).X);
            const xMax = Math.max(...xs);
            value = Math.max(value, xMax + this.minSpace);
            for (let point of this.Points) {
                if (Math.abs(point.X - this.width) < 1e-4) {
                    point.X = value;
                }
            }
        }
        else {
            const transoms = this.Members.filter(x => x.MemberType == 25);
            const ys = transoms.map(m => this.Points.find(x => x.PointID == m.PointA).Y);
            const yMax = Math.max(...ys);
            value = Math.max(value, yMax + this.minSpace);
            for (let point of this.Points) {
                if (Math.abs(point.Y - this.height) < 1e-4) {
                    point.Y = value;
                }
            }

            for (let sa of this.SlabAnchors) {
                if (Math.abs(sa.Y - this.height) < 1e-4) {
                    sa.Y = value;
                }
            }
        }

        Designer.UnifiedModel.drawModel(this.UnifiedModelJSON);
        this.width = Designer.UnifiedModel.getWidth();
        this.height = Designer.UnifiedModel.getHeight();

        Designer.DimensionLines.generate();

        // dataExchange, trigger changeUnifiedModel events in iframe
        Designer.Camera.centerCamera();
        this.changeUnifiedModel();
    }

    changeHandlePosition(glassID, value, selectedHandleID){
        const glass = this.GlassList.find(x => x.InfillID == glassID);
        glass.HandlePosition = value;
        Designer.UnifiedModel.drawModel(this.UnifiedModelJSON);
        
        const newMesh = Designer.UnifiedModel.ventFrames.find(x => x.glassID == glassID);
        Designer.EventListener.clearSelectedMeshes();
        
        setTimeout(() => {
            Designer.EventListener.selectMesh(newMesh.handle);
            Designer.Camera.centerCameraInside();
            this.changeUnifiedModel();
        }, 500);
        
    }

    // function to be called when shift intermediate
    changeIntermediatePosition(memberID, value) {
        const selectedMember = this.Members.find(x => x.MemberID == memberID);
        const isMullion = selectedMember.MemberType == 2 || selectedMember.MemberType == 24;
        if (isMullion) {
            // left side limit
            let glassList = this.GlassList.filter(x => x.BoundingMembers[2] == memberID);
            let memberIDs = glassList.map(x => x.BoundingMembers[0]);
            let members = memberIDs.map(id => this.Members.find(x => x.MemberID == id));
            let xs = members.map(m => this.Points.find(x => x.PointID == m.PointA).X);
            let xMin = Math.max(...xs) + this.minSpace;
            if (xMin < 0) xMin = 0;
            // right side limit
            glassList = this.GlassList.filter(x => x.BoundingMembers[0] == memberID);
            memberIDs = glassList.map(x => x.BoundingMembers[2]);
            members = memberIDs.map(id => this.Members.find(x => x.MemberID == id));
            xs = members.map(m => this.Points.find(x => x.PointID == m.PointA).X);
            let xMax = Math.min(...xs) - this.minSpace;
            if (xMax > this.width) xMax = this.width;

            value = Math.max(value, xMin);
            value = Math.min(value, xMax);

            const movePoints = this.Points.filter(x => x.PointID == selectedMember.PointA || x.PointID == selectedMember.PointB);
            const originalX = movePoints[0].X;
            const originalYs = movePoints.map(x => x.Y).sort((a, b) => { return a - b });
            const allMullions = this.Members.filter(x => (x.MemberType == 2 || x.MemberType == 24) && x.MemberID !== memberID);
            for (let point of this.Points) {
                let mullions = allMullions.filter(x => x.PointA == point.PointID || x.PointB == point.PointID);  // if this point is in another mullion
                if (mullions.length >= 1) continue;
                if (Math.abs(point.X - originalX) < 1e-4 && point.Y - originalYs[0] > -1e-4 && point.Y - originalYs[1] < 1e-4) { // if the point falls in the selected memeber
                    point.X = value;
                }
            }
        }
        else {
            // top side limit
            let adjacentGlasses = this.GlassList.filter(x=>x.BoundingMembers.includes(memberID));
            for (let glass of adjacentGlasses) {
                let glassDimensions = Designer.UnifiedModel.getGlassDimensions(glass.BoundingMembers);
                if(glass.HandlePosition == Math.round((glassDimensions.ymax - glassDimensions.ymin) / 2)){
                    glass.HandlePosition = -1;
                }
            }
            let glassList = this.GlassList.filter(x => x.BoundingMembers[3] == memberID);  //glass whose bottom member is the selected member
            let memberIDs = glassList.map(x => x.BoundingMembers[1]);
            let members = memberIDs.map(id => this.Members.find(x => x.MemberID == id));
            let ys = members.map(m => this.Points.find(x => x.PointID == m.PointA).Y);
            let yMax = Math.min(...ys) - this.minSpace;
            if (yMax > this.height) yMax = this.height;
            // bottom side limit
            glassList = this.GlassList.filter(x => x.BoundingMembers[1] == memberID);  //glass whose top member is the selected member
            memberIDs = glassList.map(x => x.BoundingMembers[3]);
            members = memberIDs.map(id => this.Members.find(x => x.MemberID == id));
            ys = members.map(m => this.Points.find(x => x.PointID == m.PointA).Y);
            let yMin = Math.max(...ys) + this.minSpace;
            if (yMin < 0) yMin = 0;

            value = Math.max(value, yMin);
            value = Math.min(value, yMax);

            const movePoints = this.Points.filter(x => x.PointID == selectedMember.PointA || x.PointID == selectedMember.PointB);
            const originalY = movePoints[0].Y;
            const originalXs = movePoints.map(x => x.X).sort((a, b) => { return a - b });
            const allTransoms = this.Members.filter(x => (x.MemberType == 3 || x.MemberType == 25) && x.MemberID !== memberID)
            for (let point of this.Points) {
                let transoms = allTransoms.filter(x => x.PointA == point.PointID || x.PointB == point.PointID);  // if this point is in another transom
                if (transoms.length >= 1) continue;
                if (Math.abs(point.Y - originalY) < 1e-4 && point.X - originalXs[0] > -1e-4 && point.X - originalXs[1] < 1e-4) { // if the point falls in the selected memeber
                    point.Y = value;
                }
            }
        }

        Designer.UnifiedModel.drawModel(this.UnifiedModelJSON);
        Designer.DimensionLines.hideInputs();

        const newSelectedMesh = Designer.UnifiedModel.getMainModel().children.find(x => x.userData.memberID == memberID);
        Designer.EventListener.clearSelectedMeshes();
        Designer.EventListener.selectMesh(newSelectedMesh);

        // dataExchange, trigger changeUnifiedModel events in iframe
        this.changeUnifiedModel();
    }


    // function to be called when change outer frame dimension
    changeFacadeDimension(isxInput, value) {
        if (isxInput) {
            const mullions = this.Members.filter(x => x.MemberType == 4 || x.MemberType == 6);
            const temp = mullions.map(m => this.Points.find(x => x.PointID == m.PointA).X);
            const xs = temp.filter(x => x != this.width);
            let xMax = Math.max(...xs);
            if(this.facadeXSpansOriginalEdited.includes(true)){
                value = Math.max(value, xMax + this.minSpace);
                for (let point of this.Points) {
                    if (Math.abs(point.X - this.width) < 1e-4) {
                        point.X = value;
                    }
                }
            }
            
            else{
                this.distributeFacadeMajorMullionsEqually(mullions.map(x=>x.MemberID), value);
            } 

        }
        else {
            const transoms = this.Members.filter(x => x.MemberType == 5);
            const temp = transoms.map(m => this.Points.find(x => x.PointID == m.PointA).Y);
            const ys = temp.filter(y => y != this.height);
            const yMax = Math.max(...ys);
            if(this.facadeYSpansOriginalEdited.includes(true)){
                value = Math.max(value, yMax + this.minSpace);
                for (let point of this.Points) {
                    if (Math.abs(point.Y - this.height) < 1e-4) {
                        point.Y = value;
                    }
                }
            }
            else{
                this.distributeFacadeTransomsEqually(transoms.map(x => x.MemberID), value);

            }
            for (let sa of this.SlabAnchors) {
                if (Math.abs(sa.Y - (this.height + Designer.UnifiedModel.FrameSystem.MajorMullionTopRecess)) < 1e-4) {
                    sa.Y = value + Designer.UnifiedModel.FrameSystem.MajorMullionTopRecess;
                }
            }
        }
        Designer.UnifiedModel.drawModel(this.UnifiedModelJSON);
        this.width = Designer.UnifiedModel.getWidth();
        this.height = Designer.UnifiedModel.getHeight();

        Designer.DimensionLines.generate(); 

        // dataExchange, trigger changeUnifiedModel events in iframe
        if (this.ProductType == "Facade" && this.FacadeType == "mullion-transom") this.updateFacadeSpans();
        
        Designer.Camera.centerCamera();
        this.changeUnifiedModel();
    }

    // function to be called when shift facade intermediate
    changeFacadeIntermediatePosition(memberID, value) {
        const selectedMember = this.Members.find(x => x.MemberID == memberID);
        const isMullion = selectedMember.MemberType == 4 || selectedMember.MemberType == 6;
        if (isMullion) {
            // left side limit
            let glassList = this.GlassList.filter(x => x.BoundingMembers[2] == memberID);
            let memberIDs = glassList.map(x => x.BoundingMembers[0]);
            let members = memberIDs.map(id => this.Members.find(x => x.MemberID == id));
            let xs = members.map(m => this.Points.find(x => x.PointID == m.PointA).X);
            let xMin = Math.max(...xs) + this.minSpace;
            if (xs.length == 0) xMin = 0;
            // right side limit
            glassList = this.GlassList.filter(x => x.BoundingMembers[0] == memberID);
            memberIDs = glassList.map(x => x.BoundingMembers[2]);
            members = memberIDs.map(id => this.Members.find(x => x.MemberID == id));
            xs = members.map(m => this.Points.find(x => x.PointID == m.PointA).X);
            let xMax = Math.min(...xs) - this.minSpace;
            if (xs.length == 0) xMax = Number.POSITIVE_INFINITY;

            value = Math.max(value, xMin);
            value = Math.min(value, xMax);

            const movePoints = this.Points.filter(x => x.PointID == selectedMember.PointA || x.PointID == selectedMember.PointB);
            const originalX = movePoints[0].X;
            const originalYs = movePoints.map(x => x.Y).sort((a, b) => { return a - b });
            const allMullions = this.Members.filter(x => (x.MemberType == 4 || x.MemberType == 6) && x.MemberID !== memberID);
            for (let point of this.Points) {
                let mullions = allMullions.filter(x => x.PointA == point.PointID || x.PointB == point.PointID);  // if this point is in another mullion
                if (mullions.length >= 1) continue;
                if (Math.abs(point.X - originalX) < 1e-4 && point.Y - originalYs[0] > -1e-4 && point.Y - originalYs[1] < 1e-4) { // if the point falls in the selected memeber
                    point.X = value;
                }
            }
        }
        else {
            // top side limit
            let glassList = this.GlassList.filter(x => x.BoundingMembers[3] == memberID);  //glass whose bottom member is the selected member
            let memberIDs = glassList.map(x => x.BoundingMembers[1]);
            let members = memberIDs.map(id => this.Members.find(x => x.MemberID == id));
            let ys = members.map(m => this.Points.find(x => x.PointID == m.PointA).Y);
            let yMax = Math.max(...ys) - this.minSpace;
            if (yMax > this.height || ys.length == 0) yMax = this.height;
            // bottom side limit
            glassList = this.GlassList.filter(x => x.BoundingMembers[1] == memberID);  //glass whose top member is the selected member
            memberIDs = glassList.map(x => x.BoundingMembers[3]);
            members = memberIDs.map(id => this.Members.find(x => x.MemberID == id));
            ys = members.map(m => this.Points.find(x => x.PointID == m.PointA).Y);
            let yMin = Math.min(...ys) + this.minSpace;
            if (yMin < 0 || ys.length == 0) yMin = 0;

            value = Math.max(value, yMin);
            value = Math.min(value, yMax);

            const movePoints = this.Points.filter(x => x.PointID == selectedMember.PointA || x.PointID == selectedMember.PointB);
            const originalY = movePoints[0].Y;
            const originalXs = movePoints.map(x => x.X).sort((a, b) => { return a - b });
            const allTransoms = this.Members.filter(x => x.MemberType == 5 && x.MemberID !== memberID)
            for (let point of this.Points) {
                let transoms = allTransoms.filter(x => x.PointA == point.PointID || x.PointB == point.PointID);  // if this point is in another transom
                if (transoms.length >= 1) continue;
                if (Math.abs(point.Y - originalY) < 1e-4 && point.X - originalXs[0] > -1e-4 && point.X - originalXs[1] < 1e-4) { // if the point falls in the selected memeber
                    point.Y = value;
                }
            }
        }

        Designer.UnifiedModel.drawModel(this.UnifiedModelJSON);
        Designer.DimensionLines.hideInputs();

        const newSelectedMesh = Designer.UnifiedModel.getMainModel().children.find(x => x.userData.memberID == memberID);
        Designer.EventListener.clearSelectedMeshes();
        Designer.EventListener.selectMesh(newSelectedMesh);

        // dataExchange, trigger changeUnifiedModel events in iframe
        if (this.ProductType == "Facade") this.updateFacadeSpans();
        Designer.Camera.centerCamera();
        this.changeUnifiedModel();
    }

    changeFacadeSlabAnchorPosition(slabAnchorID, value) {
        const selectedAnchor = this.SlabAnchors.find(x => x.SlabAnchorID == slabAnchorID);
        const selectedAnchorY = selectedAnchor.Y;
        const selectedAnchorX = this.Points.find(x=> x.PointID == this.Members.find(x=> x.MemberID == selectedAnchor.MemberID).PointA).X;
        const anchors = this.SlabAnchors.filter(x => x.Y == selectedAnchorY);

        const yMin = 0;
        const yMax = this.height;

        value = Math.max(value, yMin);
        value = Math.min(value, yMax);

        // avoid sitting on other slab anchors
        const ys = [...new Set(this.SlabAnchors.map(x => x.Y))];
        const yConflict = ys.find(x => Math.abs(x - value) < 500 && x != selectedAnchorY);
        if(yConflict){
            let yConflictSlabAnchors = this.SlabAnchors.filter(x => x.Y == yConflict);
            let xValues = [];
            for(let anchor of yConflictSlabAnchors){
                xValues.push(this.Points.find(x=> x.PointID == this.Members.find(x=> x.MemberID == anchor.MemberID).PointA).X);
            }
            
            if (xValues.find(x=>x==selectedAnchorX)) {
                value = selectedAnchorY - yConflict >= 0 ? yConflict + 500 : yConflict - 500;
            }
        }
        
        

        for (let anchor of anchors) {
            anchor.Y = value;
            this.removeUnstableJoints(anchor.MemberID);
        }

        Designer.UnifiedModel.drawModel(this.UnifiedModelJSON);
        Designer.DimensionLines.hideInputs();

        const newSelectedMesh = Designer.UnifiedModel.getMainModel().children.find(x => x.userData.slabAnchorID == slabAnchorID);
        Designer.EventListener.clearSelectedMeshes();
        Designer.EventListener.selectMesh(newSelectedMesh);

        // dataExchange, trigger changeUnifiedModel events in iframe
        this.changeUnifiedModel();

    }

    changeFacadeSpliceJointPosition(spliceJointID, value) {
        const selectedJoint = this.SpliceJoints.find(x => x.SpliceJointID == spliceJointID);
        const selectedJointY = selectedJoint.Y
        const joints = this.SpliceJoints.filter(x => x.Y == selectedJointY);

        const yMin = 0;
        const yMax = this.height;

        value = Math.max(value, yMin);
        value = Math.min(value, yMax);

        // avoid sitting on other slab anchors
        const ys = [...new Set(this.SpliceJoints.map(x => x.Y))].sort((a, b) => { return a - b });
        const yConflict = ys.find(x => Math.abs(x - value) < 10 && x != selectedJointY);
        if (yConflict) {
            value = selectedJointY - yConflict >= 0 ? yConflict + 10 : yConflict - 10;
        }

        for (let joint of joints) {
            joint.Y = value;
            this.removeUnstableJoints(joint.MemberID);
        }

        Designer.UnifiedModel.drawModel(this.UnifiedModelJSON);
        Designer.DimensionLines.hideInputs();

        const newSelectedMesh = Designer.UnifiedModel.getMainModel().children.find(x => x.userData.spliceJointID == spliceJointID);
        Designer.EventListener.clearSelectedMeshes();
        if (newSelectedMesh) {
            Designer.EventListener.selectMesh(newSelectedMesh);
        }

        // dataExchange, trigger changeUnifiedModel events in iframe
        if (this.ProductType == "Facade") this.updateFacadeSpans();
        this.changeUnifiedModel();
    }

    // function to be called when click add mullion buttom
    addMullion(glassID) {
        const memberID = Math.max(...this.Members.map(x => x.MemberID)) + 1;
        const pointAID = Math.max(...this.Points.map(x => x.PointID)) + 1;
        const pointBID = pointAID + 1;
        let sectionType = 2;
        switch (this.ProductType) {
            case "Window":
                sectionType = 2;
                break;
            case "Facade":
                if (this.FacadeType == "mullion-transom") sectionType = 6;
                if (this.FacadeType == "UDC") sectionType = 24;
                break;
        }
        const sectionID = this.Sections.find(x => x.SectionType == sectionType).SectionID;  // section type 2 -- mullion, 6 - facadeMinorMullion
        const glass = this.GlassList.find(x => x.InfillID == glassID);
        if(this.OperabilitySystems != null && this.OperabilitySystems.length > 0 && 
            this.OperabilitySystems.find(x => x.OperabilitySystemID == glass.OperabilitySystemID) != null && 
            this.OperabilitySystems.find(x => x.OperabilitySystemID == glass.OperabilitySystemID).DoorSystemID > 0) return;

        const x1 = this.Points.find(x => x.PointID == this.Members.find(y => y.MemberID == glass.BoundingMembers[0]).PointA).X; // glass left member x
        const x2 = this.Points.find(x => x.PointID == this.Members.find(y => y.MemberID == glass.BoundingMembers[2]).PointA).X; // glass right member x
        const x = (x1 + x2) / 2;
        const y1 = this.Points.find(x => x.PointID == this.Members.find(y => y.MemberID == glass.BoundingMembers[3]).PointA).Y; // glass bottom member y
        const y2 = this.Points.find(x => x.PointID == this.Members.find(y => y.MemberID == glass.BoundingMembers[1]).PointA).Y; // glass top member y
        const newPointA = {
            PointID: pointAID,
            X: x,
            Y: y1,  // new Point A at bottom
        }
        const newPointB = {
            PointID: pointBID,
            X: x,
            Y: y2,  // new Point B at top
        }
        this.Points.push(newPointA);
        this.Points.push(newPointB);
        const newMember = {
            MemberID: memberID,
            PointA: pointAID,
            PointB: pointBID,
            SectionID: sectionID,
            MemberType: sectionType,
        }
        this.Geometry.Members.push(newMember);
        // add new glass and change glass bounding member
        const newGlassID = this.GlassList.length + 1;
        const newGlass = { ...glass };
        newGlass.BoundingMembers = [
            memberID,
            glass.BoundingMembers[1],
            glass.BoundingMembers[2],
            glass.BoundingMembers[3],
        ]
        newGlass.InfillID = newGlassID;
        this.GlassList.push(newGlass);
        glass.BoundingMembers[2] = memberID;

        Designer.EventListener.clearSelectedMeshes();
        Designer.UnifiedModel.drawModel(this.UnifiedModelJSON);

        // dataExchange, trigger changeUnifiedModel events in iframe
        if (this.ProductType == "Facade") this.updateFacadeSpans();
        this.Members = this.Geometry.Members;
        this.changeUnifiedModel();
    }

    // function to be called when click add transom buttom
    addTransom(glassID) {
        const memberID = Math.max(...this.Members.map(x => x.MemberID)) + 1;
        const pointAID = Math.max(...this.Points.map(x => x.PointID)) + 1;
        const pointBID = pointAID + 1;
        let sectionType = 3;
        switch (this.ProductType) {
            case "Window":
                sectionType = 3;
                break;
            case "Facade":
                if (this.FacadeType == "mullion-transom") sectionType = 5;
                if (this.FacadeType == "UDC") sectionType = 25;
                break;
        }
        const sectionID = this.Sections.find(x => x.SectionType == sectionType).SectionID;  // section type 3 -- transom, 5 - facadeTransom
        const glass = this.GlassList.find(x => x.InfillID == glassID);
        if(this.OperabilitySystems != null && this.OperabilitySystems.length > 0 && 
            this.OperabilitySystems.find(x => x.OperabilitySystemID == glass.OperabilitySystemID) != null && 
            this.OperabilitySystems.find(x => x.OperabilitySystemID == glass.OperabilitySystemID).DoorSystemID > 0) return;        // prevent add transom attached to intermediateMullion
        if (this.ProductType == "Facade" && this.FacadeType == "mullion-transom") {
            for (let memberID of glass.BoundingMembers) {
                if (!(this.Members.find(x => x.MemberID == memberID).MemberType == 4 || this.Members.find(x => x.MemberID == memberID).MemberType == 5))
                    return;
            }
        }
        const x1 = this.Points.find(x => x.PointID == this.Members.find(y => y.MemberID == glass.BoundingMembers[0]).PointA).X; // glass left member x
        const x2 = this.Points.find(x => x.PointID == this.Members.find(y => y.MemberID == glass.BoundingMembers[2]).PointA).X; // glass right member x
        const y1 = this.Points.find(x => x.PointID == this.Members.find(y => y.MemberID == glass.BoundingMembers[3]).PointA).Y; // glass bottom member y
        const y2 = this.Points.find(x => x.PointID == this.Members.find(y => y.MemberID == glass.BoundingMembers[1]).PointA).Y; // glass top member y
        const y = (y1 + y2) / 2;
        const newPointA = {
            PointID: pointAID,
            X: x1,      // new Point A at left
            Y: y,
        }
        const newPointB = {
            PointID: pointBID,
            X: x2,       // new Point B at right
            Y: y,
        }
        this.Points.push(newPointA);
        this.Points.push(newPointB);
        const newMember = {
            MemberID: memberID,
            PointA: pointAID,
            PointB: pointBID,
            SectionID: sectionID,
            MemberType: sectionType,
        }
        this.Geometry.Members.push(newMember);
        // add new glass and change glass bounding member
        const newGlassID = this.GlassList.length + 1;
        const newGlass = { ...glass };
        newGlass.BoundingMembers = [
            glass.BoundingMembers[0],
            glass.BoundingMembers[1],
            glass.BoundingMembers[2],
            memberID,
        ];
        newGlass.InfillID = newGlassID;
        this.GlassList.push(newGlass);
        glass.BoundingMembers[1] = memberID;

        Designer.EventListener.clearSelectedMeshes();
        Designer.UnifiedModel.drawModel(this.UnifiedModelJSON);
        this.Members = this.Geometry.Members;
        // dataExchange, trigger changeUnifiedModel events in iframe
        if (this.ProductType == "Facade") this.updateFacadeSpans();
        this.changeUnifiedModel();
    }

    // function to be called when click deleteIntermediate
    deleteIntermediate(memberID) {
        const adjacentGlassList = this.GlassList.filter(x => x.BoundingMembers.includes(memberID));
        if (adjacentGlassList.length != 2) return;
        let restoreDoor = false;
        const member = this.Members.find(x => x.MemberID == memberID);
        const memberType = member.MemberType;
        const pointA = member.PointA;
        const pointB = member.PointB;

        let side1 = (memberType == 2 || memberType == 6 || memberType == 24) ? 0 : 3;          // if the member is on side 1 of a glass, this glass will be deleted   (0 - left, 1- top, 2-right, 3-bottom)
        let side2 = (memberType == 2 || memberType == 6 || memberType == 24) ? 2 : 1;          // if the member is on side 2 of a glass, this glass will be retained and expanded.
        let opposideSide = false;
        // delete / change adjacent glass
        let  deleteGlass = adjacentGlassList.find(x => x.BoundingMembers[side1] == memberID);        // delete glass if the glass is on the right of the member
        let retainGlass = adjacentGlassList.find(x => x.BoundingMembers[side2] == memberID);        // change glass if the glass is on the left of the member
        if(retainGlass.OperabilitySystemID < 0 && deleteGlass.OperabilitySystemID > 0){
            
            retainGlass = adjacentGlassList.find(x => x.BoundingMembers[side1] == memberID);        // delete glass if the glass is on the right of the member
            deleteGlass = adjacentGlassList.find(x => x.BoundingMembers[side2] == memberID);
            let temp = side1;
            side1 = side2;
            side2 = temp;
            opposideSide = true;
        }
        if(this.Geometry.OperabilitySystems != null && (this.Geometry.OperabilitySystems.length > 0 && (this.Geometry.DoorSystems != null && (this.Geometry.DoorSystems.length > 0)))){
            if(this.Geometry.OperabilitySystems.some(op => op.OperabilitySystemID == deleteGlass.OperabilitySystemID)){
                this.removeDoor();
            }
        }
        
        const newBoundingMemberID = deleteGlass.BoundingMembers[side2];                               // the right side member of the right glass, to replace the removed member in the bounding members of left glass.
        retainGlass.BoundingMembers[side2] = newBoundingMemberID;       
        
        let DeleteGlassBottomMember = this.Members.find(m=> m.MemberID == deleteGlass.BoundingMembers[3]);
        if(DeleteGlassBottomMember.MemberType == 33 && retainGlass.BoundingMembers[3] !== DeleteGlassBottomMember.MemberID){
            
            let OldSideLightSillPoints = [this.Points.find(p=>p.PointID == DeleteGlassBottomMember.PointA), this.Points.find(p=>p.PointID == DeleteGlassBottomMember.PointB)];
            OldSideLightSillPoints.sort((a, b) => (a.X < b.X) ? -1 : 1);
            let bottomPoints = this.Points.filter(p => Math.abs(p.Y) < 1e-4);
            bottomPoints = bottomPoints.sort((a, b) => (a.X < b.X) ? -1 : 1);
            let newMember = null;
            if(opposideSide){
                newMember = {
                    MemberID: DeleteGlassBottomMember.MemberID,
                    PointA: OldSideLightSillPoints[0].PointID,
                    PointB:bottomPoints[bottomPoints.indexOf(bottomPoints.find(p=>p.PointID == OldSideLightSillPoints[1].PointID))-1].PointID,
                    SectionID: 33,
                    MemberType: 33
                }
            }
            else{
                newMember = {
                    MemberID: DeleteGlassBottomMember.MemberID,
                    PointA: bottomPoints[bottomPoints.indexOf(bottomPoints.find(p=>p.PointID == OldSideLightSillPoints[0].PointID))+1].PointID,
                    PointB: OldSideLightSillPoints[1].PointID,
                    SectionID: 33,
                    MemberType: 33
                }
            }
            
            this.Members = this.Members.filter(x => x.MemberID != deleteGlass.BoundingMembers[3]);
            this.Members.forEach(x => { if (x.MemberID > deleteGlass.BoundingMembers[3]) x.MemberID -= 1; });     // update MemberID

            if(opposideSide){
                let retainGlassBottomMember = this.Members.find(m=>m.MemberID == retainGlass.BoundingMembers[3]);
                let BottomMemberPointA = this.Points.find(p => p.PointID == retainGlassBottomMember.PointA);
                let BottomMemberPointB = this.Points.find(p=> p.PointID == retainGlassBottomMember.PointB);
                if(!(OldSideLightSillPoints[0].X < 1e-4 && 
                    (BottomMemberPointA.X == OldSideLightSillPoints[1].X 
                        || BottomMemberPointB.X == OldSideLightSillPoints[1].X)&& bottomPoints[bottomPoints.indexOf(OldSideLightSillPoints[0]) + 1] == OldSideLightSillPoints[1]))
                {
                    this.Members.push(newMember);
                }
                else{
                    for (let glass of this.GlassList) {
                        for (let i in glass.BoundingMembers) {
                            let x = parseInt(glass.BoundingMembers[i]);
                            if (x > deleteGlass.BoundingMembers[3]) glass.BoundingMembers[i] = x - 1;
                        }
                    }
                }
            }
            else{
                let retainGlassBottomMember = this.Members.find(m=>m.MemberID == retainGlass.BoundingMembers[3]);
                let BottomMemberPointA = this.Points.find(p => p.PointID == retainGlassBottomMember.PointA);
                let BottomMemberPointB = this.Points.find(p=> p.PointID == retainGlassBottomMember.PointB);
                let width = Designer.UnifiedModel.getWidth();
                if(!(OldSideLightSillPoints[1].X >= width && 
                    (BottomMemberPointA.X == OldSideLightSillPoints[0].X 
                        || BottomMemberPointB.X == OldSideLightSillPoints[0].X) && bottomPoints[bottomPoints.indexOf(OldSideLightSillPoints[0]) + 1] == OldSideLightSillPoints[1]))
                {
                    this.Members.push(newMember);
                }
                else{
                    for (let glass of this.GlassList) {
                        for (let i in glass.BoundingMembers) {
                            let x = parseInt(glass.BoundingMembers[i]);
                            if (x > deleteGlass.BoundingMembers[3]) glass.BoundingMembers[i] = x - 1;
                        }
                    }
                }
            }
        }

        // replace memberID with newBoundingMemberID;
        this.GlassList = this.GlassList.filter(x => x.InfillID != deleteGlass.InfillID);           // remove right glass
        this.GlassList.forEach(x => { if (x.InfillID > deleteGlass.InfillID) x.InfillID -= 1; });   // update InfillID

        // delete member
        this.Members = this.Members.filter(x => x.MemberID != memberID);                                 // remove member
        this.Members.forEach(x => { if (x.MemberID > memberID) x.MemberID -= 1; });     // update MemberID
        for (let glass of this.GlassList) {
            for (let i in glass.BoundingMembers) {
                let x = parseInt(glass.BoundingMembers[i]);
                if (x > memberID) glass.BoundingMembers[i] = x - 1;
            }
        }
        // delete points
        const pID1 = Math.min(pointA, pointB);  // smaller ID
        const pID2 = Math.max(pointA, pointB);  // larger ID
        let bottomPoints = this.Points.filter(p => p.Y < 1e-4);
        bottomPoints.sort((a, b) => (a.X < b.X) ? 1 : -1);
        this.Points = this.Points.filter(x => x.PointID != pID2);                                     // remove member with larger ID
        this.Points.forEach(x => { if (x.PointID > pID2) x.PointID -= 1; });
        let originalSillPointAX, originalSillPointBX;
        if(this.Members.find(m=>m.MemberType ==31) != null)
        {
            originalSillPointAX = this.Points.find(p => p.PointID == this.Members.find(m=>m.MemberType ==31).PointA).X;
            originalSillPointBX = this.Points.find(p => p.PointID == this.Members.find(m=>m.MemberType ==31).PointB).X;
        }
        
        // update PointID in Points
        for (let m of this.Members) {                                                   // update PointID in Members
            if(m.MemberType == 31 && (m.PointA == pID2 || m.PointB == pID2)){
                if(m.PointA == pID2) {
                    m.PointA = opposideSide? bottomPoints[bottomPoints.indexOf(bottomPoints.slice().reverse().find(x=> x.PointID == pID2 && x.X == originalSillPointAX)) + 1].PointID :
                    bottomPoints[bottomPoints.indexOf(bottomPoints.slice().reverse().find(x=> x.PointID == pID2 && x.X == originalSillPointAX)) - 1].PointID ;
                    if (m.PointB > pID2) m.PointB -= 1;

                    continue;
                }
                else {
                    m.PointB = opposideSide? bottomPoints[bottomPoints.indexOf(bottomPoints.slice().reverse().find(x=> x.PointID == pID2 && x.X == originalSillPointBX)) + 1].PointID : 
                    bottomPoints[bottomPoints.indexOf(bottomPoints.slice().reverse().find(x=> x.PointID == pID2 && x.X == originalSillPointBX)) - 1].PointID;
                    if (m.PointA > pID2) m.PointA -= 1;

                    continue;
                }
            }
            if (m.PointA > pID2) m.PointA -= 1;
            if (m.PointB > pID2) m.PointB -= 1;
        }
        this.Points = this.Points.filter(x => x.PointID != pID1);                                     // remove member with smaller ID
        this.Points.forEach(x => { if (x.PointID > pID1) x.PointID -= 1; });            // update PointID in Points
        for (let m of this.Members) {                                                   // update PointID in Members
            if(m.MemberType == 31 && (m.PointA == pID1 || m.PointB == pID1)){
                if(m.PointA == pID1) {
                    m.PointA = opposideSide? bottomPoints[bottomPoints.indexOf(bottomPoints.slice().reverse().find(x=> x.PointID == pID1 && x.X == originalSillPointAX)) + 1].PointID :
                    bottomPoints[bottomPoints.indexOf(bottomPoints.slice().reverse().find(x=> x.PointID == pID1 && x.X == originalSillPointAX)) - 1].PointID ;
                    if (m.PointB > pID1) m.PointB -= 1;

                    continue;
                }
                else {
                    m.PointB = opposideSide? bottomPoints[bottomPoints.indexOf(bottomPoints.slice().reverse().find(x=> x.PointID == pID1 && x.X == originalSillPointBX)) + 1].PointID : 
                    bottomPoints[bottomPoints.indexOf(bottomPoints.slice().reverse().find(x=> x.PointID == pID1 && x.X == originalSillPointBX)) - 1].PointID;
                    if (m.PointA > pID1) m.PointA -= 1;

                    continue;
                }
            }
            if (m.PointA > pID1) m.PointA -= 1;
            if (m.PointB > pID1) m.PointB -= 1;
        }

        // assign geometry back to UnifiedModelJSON
        this.UnifiedModelJSON.ModelInput.Geometry.Points = this.Points;
        this.UnifiedModelJSON.ModelInput.Geometry.Members = this.Members;
        this.UnifiedModelJSON.ModelInput.Geometry.Infills = this.GlassList;

        Designer.EventListener.clearSelectedMeshes();
        Designer.UnifiedModel.drawModel(this.UnifiedModelJSON);

        // dataExchange, trigger changeUnifiedModel events in iframe
        if (this.ProductType == "Facade" && this.FacadeType == "mullion-transom") this.updateFacadeSpans();
        this.changeUnifiedModel();
        Designer.DimensionLines.generate();
    }

    // copy right most column
    getMemberDimensions(memberID) {
        const member = this.Members.find(m => m.MemberID == memberID);
        const pa = this.Points.find(x => x.PointID == member.PointA);
        const pb = this.Points.find(x => x.PointID == member.PointB);
        const dimensions = {
            xmin: Math.min(pa.X, pb.X),
            ymin: Math.min(pa.Y, pb.Y),
            xmax: Math.max(pa.X, pb.X),
            ymax: Math.max(pa.Y, pb.Y),
        }
        return dimensions;
    }


    // copy to right
    copyFacadeRightMostColumn() {
        if (this.Members) {
            this.UnifiedModelJSON.ModelInput.FrameSystem.xNumberOfPanels++;
            const majorMullions = this.Members.filter(x => x.MemberType == 4);
            let xs = majorMullions.map(m => this.Points.find(x => x.PointID == m.PointA).X);
            const x2 = Math.max(...xs);
            xs = xs.filter(x => x != x2);
            const x1 = Math.max(...xs);
            const rightMostMullion = majorMullions.find(m => this.Points.find(p => p.PointID == m.PointA).X == x2);

            const allTransomsInColumn = this.Members.filter(m =>
                m.MemberType == 5 && this.getMemberDimensions(m.MemberID).xmin == x1 && this.getMemberDimensions(m.MemberID).xmax == x2
            );
            const ys = allTransomsInColumn.map(m => this.Points.find(y => y.PointID == m.PointA).Y).sort((a, b) => a - b);

            // add majorMullion
            const memberID = Math.max(...this.Members.map(x => x.MemberID)) + 1;
            const newMajorMullionID = memberID;
            const pointAID = Math.max(...this.Points.map(x => x.PointID)) + 1;
            const pointBID = pointAID + 1;
            const y1 = Math.min(...ys);
            const y2 = Math.max(...ys);
            const newPointA = {
                PointID: pointAID,
                X: x2 + 2000,      // new Point A at left
                Y: y1,
            }
            const newPointB = {
                PointID: pointBID,
                X: x2 + 2000,       // new Point B at right
                Y: y2,
            }
            this.Points.push(newPointA);
            this.Points.push(newPointB);
            const newMember = {
                MemberID: memberID,
                PointA: pointAID,
                PointB: pointBID,
                SectionID: 1,
                MemberType: 4,  // add majorMullion
            }
            this.Members.push(newMember);

            // add slab anchors to added mullion
            if (this.SlabAnchors.length > 0) {
                const sas = this.SlabAnchors.filter(x => x.MemberID == rightMostMullion.MemberID);
                const maxSlabAnchorID = Math.max(...this.SlabAnchors.map(x => x.SlabAnchorID))
                for (let i in sas) {
                    const sa = sas[i];
                    const newSA = {
                        SlabAnchorID: maxSlabAnchorID + i + 1,
                        MemberID: newMember.MemberID,
                        AnchorType: sas[i].AnchorType,
                        Y: sas[i].Y,
                    }
                    this.SlabAnchors.push(newSA);
                }
            }

            // add splice joint if exist
            if (this.SpliceJoints.length > 0) {
                const sjs = this.SpliceJoints.filter(x => x.MemberID == rightMostMullion.MemberID);
                const maxSpliceJointID = Math.max(...this.SpliceJoints.map(x => x.SpliceJointID))
                for (let i in sjs) {
                    const sj = sjs[i];
                    const newSJ = {
                        SpliceJointID: maxSpliceJointID + i + 1,
                        MemberID: newMember.MemberID,
                        JointType: sjs[i].JointType,
                        Y: sjs[i].Y,
                    }
                    this.SpliceJoints.push(newSJ);
                }
            }

            // add reinforcement
            if (this.Reinforcements.length > 0) {
                const rf = this.Reinforcements.find(x => x.MemberID == rightMostMullion.MemberID);
                const maxReinforcementID = Math.max(...this.Reinforcements.map(x => x.ReinforcementID))
                const newRF = {
                    ReinforcementID: maxReinforcementID + 1,
                    MemberID: newMember.MemberID,
                    SectionID: rf.SectionID,
                }
                this.Reinforcements.push(newRF);
            }

            // add transoms and glass
            for (let i in ys) {
                const memberID = Math.max(...this.Members.map(x => x.MemberID)) + 1;
                const pointAID = Math.max(...this.Points.map(x => x.PointID)) + 1;
                const pointBID = pointAID + 1;
                const y = ys[i];

                // add Points
                const newPointA = {
                    PointID: pointAID,
                    X: x2,      // new Point A at left
                    Y: y,
                }
                const newPointB = {
                    PointID: pointBID,
                    X: x2 + 2000,       // new Point B at right
                    Y: y,
                }
                this.Points.push(newPointA);
                this.Points.push(newPointB);

                // add Member
                const newMember = {
                    MemberID: memberID,
                    PointA: pointAID,
                    PointB: pointBID,
                    SectionID: 2,
                    MemberType: 5,  // add transom
                }
                this.Members.push(newMember);

                // add Glass
                if (i == 0) continue;
                const transom = allTransomsInColumn.find(m => this.Points.find(x => x.PointID == m.PointA).Y == y);
                const glass = this.GlassList.find(g => (g.BoundingMembers[2] == rightMostMullion.MemberID) && (g.BoundingMembers[1] == transom.MemberID));
                const newGlassID = Math.max(...this.GlassList.map(x => x.InfillID)) + 1;
                const newGlass = { ...glass };
                newGlass.BoundingMembers = [
                    rightMostMullion.MemberID,
                    memberID,
                    newMajorMullionID,
                    memberID - 1,
                ];
                newGlass.InfillID = newGlassID;
                this.GlassList.push(newGlass);
            }

            Designer.UnifiedModel.drawModel(this.UnifiedModelJSON);
            this.width = Designer.UnifiedModel.getWidth();
            this.height = Designer.UnifiedModel.getHeight();

            Designer.EventListener.clearSelectedMeshes();
            Designer.DimensionLines.generate();

            // dataExchange, trigger changeUnifiedModel events in iframe
            this.updateFacadeSpans();
            Designer.Camera.centerCamera();
            this.changeUnifiedModel();

        }
    }

    deleteFacadeRightMostColumn() {
        if (this.Members) {
            this.UnifiedModelJSON.ModelInput.FrameSystem.xNumberOfPanels--;
            const majorMullions = this.Members.filter(x => x.MemberType == 4);
            if (majorMullions.length <= 2) return;
            let xs = majorMullions.map(m => this.Points.find(x => x.PointID == m.PointA).X);
            const x2 = Math.max(...xs);
            xs = xs.filter(x => x != x2);
            const x1 = Math.max(...xs);
            const rightMostMullion = majorMullions.find(m => this.Points.find(p => p.PointID == m.PointA).X == x2);

            let allMinorMullionsInColumn = this.Members.filter(m => m.MemberType == 6 && this.Points.find(p => p.PointID == m.PointA).X > x1);
            if (allMinorMullionsInColumn) {
                allMinorMullionsInColumn = allMinorMullionsInColumn.map(x => x.MemberID);
            }
            else {
                allMinorMullionsInColumn = [];
            }

            let allTransomsInColumn = this.Members.filter(m =>
                m.MemberType == 5 && this.getMemberDimensions(m.MemberID).xmin == x1 && this.getMemberDimensions(m.MemberID).xmax == x2
            );
            if (allTransomsInColumn) {
                allTransomsInColumn = allTransomsInColumn.map(x => x.MemberID);
            }
            else {
                allTransomsInColumn = [];
            }

            let removedMemberIDs = [rightMostMullion.MemberID, ...allMinorMullionsInColumn, ...allTransomsInColumn];
            for (let id of removedMemberIDs) {
                let i = this.Members.findIndex(x => x.MemberID == id);
                this.Members.splice(i, 1);
            }

            let removedPoints = this.Points.filter(p => this.Members.filter(m => m.PointA == p.PointID || m.PointB == p.PointID).length == 0);
            for (let p of removedPoints) {
                let i = this.Points.findIndex(x => x.PointID == p.PointID);
                this.Points.splice(i, 1);
            }


            // remove glass
            let removedGlass = this.GlassList.filter(g => g.BoundingMembers.some(i => removedMemberIDs.includes(i)));
            for (let g of removedGlass) {
                let i = this.GlassList.findIndex(x => x.InfillID == g.InfillID);
                this.GlassList.splice(i, 1);
            }

            // remove slab anchors on removed mullion
            let removedSAs = this.SlabAnchors.filter(x => x.MemberID == rightMostMullion.MemberID);
            for (let sa of removedSAs) {
                let i = this.SlabAnchors.findIndex(x => x.SlabAnchorID == sa.SlabAnchorID);
                this.SlabAnchors.splice(i, 1);
            }

            // remove splice joint on removed mullion
            let removedSJs = this.SpliceJoints.filter(x => x.MemberID == rightMostMullion.MemberID);
            for (let sj of removedSJs) {
                let i = this.SpliceJoints.findIndex(x => x.SpliceJointID == sj.SpliceJointID);
                this.SpliceJoints.splice(i, 1);
            }

            // remove reinforcement on removed mullion
            let removedReinfs = this.Reinforcements.filter(x => x.MemberID == rightMostMullion.MemberID);
            for (let reinfs of removedReinfs) {
                let i = this.Reinforcements.findIndex(x => x.ReinforcementID == reinfs.ReinforcementID);
                this.Reinforcements.splice(i, 1);
            }

            // remove member with length = 0, and associated points
            const mIDs = this.Members.map(m => m.MemberID);
            for (let mID of mIDs) {
                let m = this.Members.find(m => m.MemberID == mID);
                const PA = this.Points.find(x => x.PointID == m.PointA);
                const PAX = PA.X;
                const PAY = PA.Y;
                const PB = this.Points.find(x => x.PointID == m.PointB);
                const PBX = PB.X;
                const PBY = PB.Y;
                const Length = (PAX - PBX) * (PAX - PBX) + (PAY - PBY) * (PAY - PBY);
                if (Length < 0.1) {
                    const mIndex = this.Members.findIndex(x => x.MemberID == mID);
                    this.Members.splice(mIndex, 1);
                }
            }

            removedPoints = this.Points.filter(p => this.Members.filter(m => m.PointA == p.PointID || m.PointB == p.PointID).length == 0);
            for (let p of removedPoints) {
                let i = this.Points.findIndex(x => x.PointID == p.PointID);
                this.Points.splice(i, 1);
            }

            Designer.UnifiedModel.drawModel(this.UnifiedModelJSON);
            this.width = Designer.UnifiedModel.getWidth();
            this.height = Designer.UnifiedModel.getHeight();

            Designer.EventListener.clearSelectedMeshes();
            Designer.DimensionLines.generate();

            // dataExchange, trigger changeUnifiedModel events in iframe
            this.updateFacadeSpans();
            Designer.Camera.centerCamera();
            this.changeUnifiedModel();
        }
    }

    // copy to top
    copyFacadeTopMostRow() {
        if (this.Members) {
            this.UnifiedModelJSON.ModelInput.FrameSystem.yNumberOfPanels++;
            const majorMullions = this.Members.filter(x => x.MemberType == 4);
            let xs = majorMullions.map(m => this.Points.find(x => x.PointID == m.PointA).X).sort((a, b) => a - b);
            const y = Math.max(...this.Points.map(p => p.Y));

            for (let i in xs) {
                if (i == 0) continue;
                const memberID = Math.max(...this.Members.map(x => x.MemberID)) + 1;
                const pointAID = Math.max(...this.Points.map(x => x.PointID)) + 1;
                const pointBID = pointAID + 1;
                const x1 = xs[i - 1];
                const x2 = xs[i];
                const newPointA = {
                    PointID: pointAID,
                    X: x1,      // new Point A left
                    Y: y + 2000,
                }
                const newPointB = {
                    PointID: pointBID,
                    X: x2,       // new Point B right
                    Y: y + 2000,
                }
                this.Points.push(newPointA);
                this.Points.push(newPointB);

                // add transom
                const newMember = {
                    MemberID: memberID,
                    PointA: pointAID,
                    PointB: pointBID,
                    SectionID: 2,
                    MemberType: 5,  // add transom
                }
                this.Members.push(newMember);

                // update mullion
                const mullion1 = this.Members.find(m => this.Points.find(x => x.PointID == m.PointA).X == x1);
                const m1pA = this.Points.find(x => x.PointID == mullion1.PointA);
                const m1pB = this.Points.find(x => x.PointID == mullion1.PointB);
                if (m1pA.Y == y) {
                    m1pA.Y = y + 2000;
                }
                else if (m1pB.Y == y) {
                    m1pB.Y = y + 2000;
                }

                const mullion2 = this.Members.find(m => this.Points.find(x => x.PointID == m.PointA).X == x2);
                const m2pA = this.Points.find(x => x.PointID == mullion2.PointA);
                const m2pB = this.Points.find(x => x.PointID == mullion2.PointB);
                if (m2pA.Y == y) {
                    m2pA.Y = y + 2000;
                }
                else if (m2pB.Y == y) {
                    m2pB.Y = y + 2000;
                }

                // add Glass
                const newBotTransomID = this.Members.find(m =>
                    m.MemberType == 5 && this.getMemberDimensions(m.MemberID).xmin == x1 && this.getMemberDimensions(m.MemberID).xmax == x2
                    && this.getMemberDimensions(m.MemberID).ymin == y
                ).MemberID;

                const glass = this.GlassList.find(g => (g.BoundingMembers[0] == mullion1.MemberID) && (g.BoundingMembers[1] == newBotTransomID));
                const newGlassID = Math.max(...this.GlassList.map(x => x.InfillID)) + 1;
                const newGlass = { ...glass };
                newGlass.BoundingMembers = [
                    mullion1.MemberID,
                    newMember.MemberID,
                    mullion2.MemberID,
                    newBotTransomID,
                ];
                newGlass.InfillID = newGlassID;
                this.GlassList.push(newGlass);
            }

            // move slab anchor to top
            if (this.SlabAnchors) {
                const sas = this.SlabAnchors.filter(sa => sa.Y >= y);
                for (let i in sas) {
                    sas[i].Y = y + 2000 + Designer.UnifiedModel.FrameSystem.MajorMullionTopRecess;
                }
            }

            Designer.UnifiedModel.drawModel(this.UnifiedModelJSON);
            this.width = Designer.UnifiedModel.getWidth();
            this.height = Designer.UnifiedModel.getHeight();

            Designer.EventListener.clearSelectedMeshes();
            Designer.DimensionLines.generate();

            // dataExchange, trigger changeUnifiedModel events in iframe
            this.updateFacadeSpans();
            Designer.Camera.centerCamera();
            this.changeUnifiedModel();
        }
    }

    // delete facade top most row
    deleteFacadeTopMostRow() {  
        if (this.Members) {
            this.UnifiedModelJSON.ModelInput.FrameSystem.yNumberOfPanels--;
            const transoms = this.Members.filter(x => x.MemberType == 5);
            let ys = transoms.map(m => this.Points.find(x => x.PointID == m.PointA).Y).sort((a, b) => a - b);
            ys = ys.filter((item, index) => ys.indexOf(item) == index);
            if (ys.length <= 2) return;
            const y1 = ys[ys.length - 1];
            const y2 = ys[ys.length - 2];

            const topTransoms = transoms.filter(m => this.Points.find(x => x.PointID == m.PointA).Y == y1);
            const topTransomIDs = topTransoms.map(x => x.MemberID);
            const topGlass = this.GlassList.filter(g => topTransomIDs.includes(g.BoundingMembers[1]));

            for (let g of topGlass) {
                let gIndex = this.GlassList.findIndex(x => x.InfillID == g.InfillID);
                let topTransomID = g.BoundingMembers[1];
                let botTransomID = g.BoundingMembers[3];
                let botTransomY = this.Points.find(x => x.PointID == this.Members.find(m => m.MemberID == botTransomID).PointA).Y;
                if (botTransomY == y2) {
                    // remove top transom
                    let mIndex = this.Members.findIndex(x => x.MemberID == topTransomID);
                    if (mIndex >= 0) this.Members.splice(mIndex, 1);
                    this.GlassList.splice(gIndex, 1);
                    // remove points
                    let removedPoints = this.Points.filter(p => this.Members.filter(m => m.PointA == p.PointID || m.PointB == p.PointID).length == 0);
                    for (let p of removedPoints) {
                        let i = this.Points.findIndex(x => x.PointID == p.PointID);
                        this.Points.splice(i, 1);
                    }
                }
                else {
                    // move top transom
                    let topTransom = this.Members.find(x => x.MemberID == g.BoundingMembers[1]);
                    this.Points.find(p => p.PointID == topTransom.PointA).Y = y2;
                    this.Points.find(p => p.PointID == topTransom.PointB).Y = y2;
                }
            }

            // move top points
            for (let p of this.Points) {
                if (p.Y == y1) p.Y = y2;
            }

            // move top slab anchor
            if (this.SlabAnchors) {
                for (let sa of this.SlabAnchors) {
                    if (sa.Y == y1) sa.Y = y2;
                }
            }

            // remove slab anchor / splice joint > y2
            if (this.SlabAnchors) {
                const sas = this.SlabAnchors.filter(sa => sa.Y > y2 + 0.0001 && sa.Y <y1);
                for (let sa of sas) {
                    let i = this.SlabAnchors.findIndex(x => x.SlabAnchorID == sa.SlabAnchorID);
                    this.SlabAnchors.splice(i, 1);
                }
                const sasTop = this.SlabAnchors.filter(sa => sa.Y >=y1);
                for (let sa of sasTop) {
                    sa.Y = y2 + Designer.UnifiedModel.FrameSystem.MajorMullionTopRecess;
                }
            }

            if (this.SpliceJoints) {
                const sjs = this.SpliceJoints.filter(sj => sj.Y > y2 + 0.0001);
                for (let sj of sjs) {
                    let i = this.SpliceJoints.findIndex(x => x.SpliceJointID == sj.SpliceJointID);
                    this.SpliceJoints.splice(i, 1);
                }
            }

            // remove member with length = 0, and associated points
            const mIDs = this.Members.map(m => m.MemberID);
            for (let mID of mIDs) {
                let m = this.Members.find(m => m.MemberID == mID);
                const PA = this.Points.find(x => x.PointID == m.PointA);
                const PAX = PA.X;
                const PAY = PA.Y;
                const PB = this.Points.find(x => x.PointID == m.PointB);
                const PBX = PB.X;
                const PBY = PB.Y;
                const Length = (PAX - PBX) * (PAX - PBX) + (PAY - PBY) * (PAY - PBY);
                if (Length < 0.1) {
                    const mIndex = this.Members.findIndex(x => x.MemberID == mID);
                    this.Members.splice(mIndex, 1);
                }
            }

            let removedPoints = this.Points.filter(p => this.Members.filter(m => m.PointA == p.PointID || m.PointB == p.PointID).length == 0);
            for (let p of removedPoints) {
                let i = this.Points.findIndex(x => x.PointID == p.PointID);
                this.Points.splice(i, 1);
            }

            Designer.UnifiedModel.drawModel(this.UnifiedModelJSON);
            this.width = Designer.UnifiedModel.getWidth();
            this.height = Designer.UnifiedModel.getHeight();

            Designer.EventListener.clearSelectedMeshes();
            Designer.DimensionLines.generate();

            // dataExchange, trigger changeUnifiedModel events in iframe
            this.updateFacadeSpans();
            Designer.Camera.centerCamera();
            this.changeUnifiedModel();
        }
    }

    distributeFacadeMajorMullionsEqually(mullionIDs, value) {
        let selectedxs = mullionIDs.map(id => {
            const pAID = this.Members.find(m => m.MemberID == id).PointA;
            const x = this.Points.find(p => p.PointID == pAID).X;
            return x;
        });
        selectedxs.sort((a, b) => { return a - b });
        
        
        const majorMullions = this.Members.filter(x => x.MemberType == 4);
        let xs = majorMullions.map(m => this.Points.find(x => x.PointID == m.PointA).X);
        //xs = xs.filter(x => x >= xmin && x <= xmax);
        xs.sort((a, b) => { return a - b });
        const xmin = selectedxs[0];
        const xmax = value == -1?  selectedxs[selectedxs.length - 1] : value;
        
        const newxs = selectedxs.map((value, index) => xmin + (xmax - xmin) / (selectedxs.length - 1) * index);
        for (let p of this.Points) {
            const px = p.X;
            const index = selectedxs.findIndex(x => x >= px);
            if (index > 0) {
                const x1 = selectedxs[index - 1];
                const x2 = selectedxs[index];
                const scale = (px - x1) / (x2 - x1);
                const newx1 = newxs[index - 1];
                const newx2 = newxs[index];
                const newpx = newx1 + scale * (newx2 - newx1);
                p.X = Math.round(newpx);
            }
            else{
                //p.X = Math.round(xmax);
            }
        }

        Designer.UnifiedModel.drawModel(this.UnifiedModelJSON);
        this.width = Designer.UnifiedModel.getWidth();
        this.height = Designer.UnifiedModel.getHeight();

        Designer.EventListener.clearSelectedMeshes();
        Designer.DimensionLines.generate();

        // dataExchange, trigger changeUnifiedModel events in iframe
        this.updateFacadeSpans();
        this.changeUnifiedModel();
    }

    distributeFacadeTransomsEqually(transomIDs, value = -1) {       
        this.height = Designer.UnifiedModel.getHeight();

        let selectedys = transomIDs.map(id => {
            const pAID = this.Members.find(m => m.MemberID == id).PointA;
            const y = this.Points.find(p => p.PointID == pAID).Y;
            return y;
        });
        selectedys.sort((a, b) => { return a - b });
        selectedys = [...new Set(selectedys)];
        const transoms = this.Members.filter(x => x.MemberType == 5);
        
        let ys = transoms.map(m => this.Points.find(x => x.PointID == m.PointA).Y);
        ys.sort((a, b) => { return a - b });
        ys = [... new Set(ys)];
        if(ys.length == selectedys.length){
            this.facadeYSpansOriginalEdited =  new Array(this.facadeYSpans.length).fill(false);
        }
        const ymin = selectedys[0];
        const ymax = value == -1?  selectedys[selectedys.length - 1] : value;
        
        const newys = selectedys.map((value, index) => ymin + (ymax - ymin) / (selectedys.length - 1) * index);
        for (let p of this.Points) {
            const py = p.Y;
            const index = selectedys.findIndex(y => y == py);
            if (index > 0) {
                const y1 = selectedys[index - 1];
                const y2 = selectedys[index];
                const scale = (py - y1) / (y2 - y1);
                const newy1 = newys[index - 1];
                const newy2 = newys[index];
                const newpy = newy1 + scale * (newy2 - newy1);
                p.Y = newpy;
            }
            else{
                //p.Y = Math.round(ymax);
            }
        }
        
        Designer.UnifiedModel.drawModel(this.UnifiedModelJSON);
        this.width = Designer.UnifiedModel.getWidth();

        Designer.EventListener.clearSelectedMeshes();
        Designer.DimensionLines.generate();

        // dataExchange, trigger changeUnifiedModel events in iframe
        this.updateFacadeSpans();
        this.changeUnifiedModel();
    }

    deleteSlabAnchor(slabAnchorID) {
        let memberId = this.SlabAnchors.find(x => x.SlabAnchorID == slabAnchorID).MemberID;
        this.SlabAnchors = this.SlabAnchors.filter(x => x.SlabAnchorID != slabAnchorID);
        this.removeUnstableJoints(memberId);

        this.UnifiedModelJSON.ModelInput.Geometry.SlabAnchors = this.SlabAnchors;

        Designer.EventListener.clearSelectedMeshes();
        Designer.UnifiedModel.drawModel(this.UnifiedModelJSON);

        // dataExchange, trigger changeUnifiedModel events in iframe
        this.changeUnifiedModel();
    }

    deleteReinforcement(reinforcementID) {
        this.Reinforcements = this.Reinforcements.filter(x => x.ReinforcementID != reinforcementID);
        this.UnifiedModelJSON.ModelInput.Geometry.Reinforcements = this.Reinforcements;

        Designer.EventListener.clearSelectedMeshes();
        Designer.UnifiedModel.drawModel(this.UnifiedModelJSON);

        // dataExchange, trigger changeUnifiedModel events in iframe
        this.changeUnifiedModel();
    }

    deleteSpliceJoint(spliceJointID) {
        this.SpliceJoints = this.SpliceJoints.filter(x => x.SpliceJointID != spliceJointID);
        this.UnifiedModelJSON.ModelInput.Geometry.SpliceJoints = this.SpliceJoints;

        Designer.EventListener.clearSelectedMeshes();
        Designer.UnifiedModel.drawModel(this.UnifiedModelJSON);

        // dataExchange, trigger changeUnifiedModel events in iframe
        this.changeUnifiedModel();
    }

    // Auxiliary Funcitons
    // get outer frame dimension, for rectangular outer frame aligned with XY axes
    getOuterFrameDimensions() {
        const outFrameMembers = this.Members.filter(x => x.MemberType == 1);
        let Lx = 0;   // outer frame dimension in X direction
        let Ly = 0;   // outer frame dimension in Y direction
        for (let member of outFrameMembers) {
            let PA = this.Points.find(x => x.PointID == member.PointA);
            let PB = this.Points.find(x => x.PointID == member.PointB);
            let mLx = Math.abs(PA.X - PB.X);    // member Length in X direction
            let mLy = Math.abs(PA.Y - PB.Y);    // member Length in Y direction
            Lx = Math.max(Lx, mLx);
            Ly = Math.max(Ly, mLy);
        }

        let dimensions = {
            width: Lx,
            height: Ly,
        }

        return dimensions;
    }

    getUnifiedModelJSON() {
        return this.UnifiedModelJSON;
    }

    // dataExchange with Angular, trigger Angular iframe event "changeUnifiedModel"
    changeUnifiedModel() {
        dataExchange.sendParentMessage('changeUnifiedModel', this.UnifiedModelJSON);   // pass the current UnifiedModel in data
    }

    initFacadeSpans() {
        // get X spans for major mullions
        let pointIDs = Designer.UnifiedModel.Geometry.Members.filter(x => x.MemberType == 4).map(x => x.PointA);
        let points = Designer.UnifiedModel.Geometry.Points.filter(x => pointIDs.includes(x.PointID));
        const xs = [...new Set(points.map(x => x.X))].sort((a, b) => { return a - b });
        this.facadeXSpans = xs.slice(1).map((x, i) => x - xs[i]);
        this.facadeXSpansEdited = new Array(this.facadeXSpans.length).fill(false);
        this.facadeXSpansOriginalEdited = new Array(this.facadeXSpans.length).fill(false);

        // get Y spans for transoms
        pointIDs = Designer.UnifiedModel.Geometry.Members.filter(x => x.MemberType == 5).map(x => x.PointA);
        points = Designer.UnifiedModel.Geometry.Points.filter(x => pointIDs.includes(x.PointID));
        const ys = [...new Set(points.map(x => x.Y))].sort((a, b) => { return a - b });
        this.facadeYSpans = ys.slice(1).map((x, i) => x - ys[i]);
        this.facadeYSpansEdited = new Array(this.facadeYSpans.length).fill(false);
        this.facadeYSpansOriginalEdited = new Array(this.facadeYSpans.length).fill(false);
    }

    updateFacadeSpans() {           
        //updateFacadeSpans when change dimensions by moving intermedites
        // get X spans for major mullions
        let pointIDs = Designer.UnifiedModel.Geometry.Members.filter(x => x.MemberType == 4).map(x => x.PointA);
        let points = Designer.UnifiedModel.Geometry.Points.filter(x => pointIDs.includes(x.PointID));
        const newxs = [...new Set(points.map(x => x.X))].sort((a, b) => { return a - b });
        const newFacadeXSpans = newxs.slice(1).map((x, i) => x - newxs[i]);
        let newFacadeXSpansEdited = new Array(newFacadeXSpans.length).fill(false);
        // let xs = this.facadeXSpans.map((elem, index) => this.facadeXSpans.slice(0, index + 1).reduce((a, b) => a + b)).unshift(newxs[0]);
        let sum = 0;
        let xs = this.facadeXSpans.map(x => sum = sum + x);
        xs.unshift(0);
        for (let i in this.facadeXSpansEdited) {
            if (this.facadeXSpansEdited[i]) {
                let x1 = xs[i];
                let x2 = xs[(parseInt(i, 10) + 1).toString()];
                let newx1index = newxs.findIndex(x => x == x1);
                if (newx1index >= 0) {
                    newFacadeXSpansEdited[i] = x2 === newxs[newx1index + 1] ? true : false;
                }
            }
        }
        this.facadeXSpans = newFacadeXSpans;
        this.facadeXSpansEdited = newFacadeXSpansEdited;

        // get Y spans for transoms
        pointIDs = Designer.UnifiedModel.Geometry.Members.filter(x => x.MemberType == 5).map(x => x.PointA);
        points = Designer.UnifiedModel.Geometry.Points.filter(x => pointIDs.includes(x.PointID));
        const newys = [...new Set(points.map(x => x.Y))].sort((a, b) => { return a - b });
        const newFacadeYSpans = newys.slice(1).map((x, i) => x - newys[i]);
        let newFacadeYSpansEdited = new Array(newFacadeYSpans.length).fill(false);
        // let ys = this.facadeYSpans.map((elem, index) => this.facadeYSpans.slice(0, index + 1).reduce((a, b) => a + b));
        sum = 0;
        let ys = this.facadeYSpans.map(x => sum = sum + x);
        ys.unshift(0);
        for (let i in this.facadeYSpansEdited) {
            if (this.facadeYSpansEdited[i]) {
                let y1 = ys[i];
                let y2 = ys[(parseInt(i, 10) + 1).toString()];
                let newy1index = newys.findIndex(x => x == y1);
                if (newy1index >= 0) {
                    newFacadeYSpansEdited[i] = y2 === newys[newy1index + 1] ? true : false;
                }
            }
        }
        this.facadeYSpans = newFacadeYSpans;
        this.facadeYSpansEdited = newFacadeYSpansEdited;
    }

    changeFacadeSpans(isXspan, index, value) {
        if ((isXspan && index > this.facadeXSpans.length -1) || (!isXspan && index > this.facadeYSpans.length -1)) return;
        // get X spans for major mullions
        let sum;
        if (isXspan) {
            sum = 0
            let xs = this.facadeXSpans.map(x => sum = sum + x);
            xs.unshift(0);
            const totalXLength = xs[xs.length - 1];
            let editedXs = this.facadeXSpans.filter((x, i) => i != index && this.facadeXSpansEdited[i]);  //  edited sections (excluding the current one)
            let editedTotalLength = editedXs.length > 0 ? editedXs.reduce((a, b) => a + b) : 0;
            let variableSectionNo = this.facadeXSpans.length - editedXs.length - 1;  // no. of unedited sections
            if (variableSectionNo <= 0) return;
            let maxAllowableValue = totalXLength - editedTotalLength - variableSectionNo * 200;
            let minAllowableValue = 200;
            value = value < maxAllowableValue ? value : maxAllowableValue;
            value = value > minAllowableValue ? value : minAllowableValue;
            let variableLength = totalXLength - editedTotalLength - value;
            this.facadeXSpans[index] = value;
            this.facadeXSpansEdited[index] = true;
            this.facadeXSpansOriginalEdited[index] = true;
            for (let i in this.facadeXSpans) {
                if (!this.facadeXSpansEdited[i]) {
                    this.facadeXSpans[i] = variableLength / variableSectionNo;
                }
            }
            sum = 0;
            const newxs = this.facadeXSpans.map(x => sum = sum + x);
            newxs.unshift(0);
            for (let p of this.Points) {
                let i = xs.findIndex((x, i) => (xs[i] <= p.X && (i == xs.length - 2 || xs[i + 1] > p.X)));
                if (i >= 0) {
                    let newX = newxs[i] + (p.X - xs[i]) / (xs[i + 1] - xs[i]) * (newxs[i + 1] - newxs[i]);
                    p.X = newX;
                }
            }
        }
        else {          // get Y spans for transoms
            sum = 0
            let ys = this.facadeYSpans.map(x => sum = sum + x);
            ys.unshift(0);
            const totalYLength = ys[ys.length - 1];
            let editedYs = this.facadeYSpans.filter((x, i) => i != index && this.facadeYSpansEdited[i]);
            let editedTotalLength = editedYs.length > 0 ? editedYs.reduce((a, b) => a + b) : 0;
            let variableSectionNo = this.facadeYSpans.length - editedYs.length - 1;  // no. of unedited sections
            if (variableSectionNo <= 0) return;
            let maxAllowableValue = totalYLength - editedTotalLength - variableSectionNo * 200;
            let minAllowableValue = 200;
            value = value < maxAllowableValue ? value : maxAllowableValue;
            value = value > minAllowableValue ? value : minAllowableValue;
            let variableLength = totalYLength - editedTotalLength - value;
            this.facadeYSpans[index] = value;
            this.facadeYSpansEdited[index] = true;
            this.facadeYSpansOriginalEdited[index] = true;
            for (let i in this.facadeYSpans) {
                if (!this.facadeYSpansEdited[i]) {
                    this.facadeYSpans[i] = variableLength / variableSectionNo;
                }
            }
            sum = 0;
            const newys = this.facadeYSpans.map(x => sum = sum + x);
            newys.unshift(0);
            for (let p of this.Points) {
                let i = ys.findIndex((x, i) => (ys[i] <= p.Y && (i == ys.length - 2 || ys[i + 1] > p.Y)));
                if (i >= 0) {
                    let newY = newys[i] + (p.Y - ys[i]) / (ys[i + 1] - ys[i]) * (newys[i + 1] - newys[i]);
                    p.Y = newY;
                }
            }
        }

        Designer.EventListener.clearSelectedMeshes();
        Designer.UnifiedModel.drawModel(this.UnifiedModelJSON);
        Designer.Camera.centerCamera();
        this.changeUnifiedModel();
        Designer.DimensionLines.generate(null);
    }


    addSlabAnchors(anchorType, selectedMajorMullionIDs) {
        if (anchorType != "Fixed" && anchorType != "Sliding") return;
        if (selectedMajorMullionIDs.length == 0) {
            selectedMajorMullionIDs = this.Members.filter(x => x.MemberType == 4).map(x => x.MemberID);
        }

        for (let id of selectedMajorMullionIDs) {
            let SlabAnchorYs = this.SlabAnchors.filter(x => x.MemberID == id).map(x => x.Y);
            let SpliceJointYs = this.SpliceJoints.filter(x => x.MemberID == id).map(x => x.Y);
            let Ys = SlabAnchorYs.concat(SpliceJointYs);
            Ys.sort((a, b) => { return a - b });
            let newy = Ys[1] / 2;
            let maxID = Math.max(...this.SlabAnchors.map(x => x.SlabAnchorID)) + 1;
            let slabAnchor = {
                SlabAnchorID: maxID,
                MemberID: id,
                AnchorType: anchorType,
                Y: newy,
            }
            this.SlabAnchors.push(slabAnchor);
        }
        this.UnifiedModelJSON.ModelInput.Geometry.SlabAnchors = this.SlabAnchors;

        Designer.EventListener.clearSelectedMeshes();
        Designer.UnifiedModel.drawModel(this.UnifiedModelJSON);
        Designer.Camera.centerCamera();
        this.changeUnifiedModel();
        Designer.DimensionLines.generate(null);
    }

    addSpliceJoints(jointType, selectedMajorMullionIDs) {
        if (jointType != "Hinged" && jointType != "Rigid") return;
        if (selectedMajorMullionIDs.length == 0) {
            selectedMajorMullionIDs = this.Members.filter(x => x.MemberType == 4).map(x => x.MemberID);
        }

        for (let id of selectedMajorMullionIDs) {
            let SlabAnchorYs = this.SlabAnchors.filter(x => x.MemberID == id).map(x => x.Y);
            SlabAnchorYs.sort((a, b) => { return a - b });
            let SpliceJointYs = this.SpliceJoints.filter(x => x.MemberID == id).map(x => x.Y);
            let Ys = SlabAnchorYs.concat(SpliceJointYs);
            Ys.sort((a, b) => { return a - b });
            let newy = Ys[1] > 400 ? Ys[1] - 200 : Ys[1] / 2;
            for (let i = 0; i < SlabAnchorYs.length - 1; i++) {
                if (!this.SpliceJoints.filter(x => x.MemberID == id).some(x => x.Y >= SlabAnchorYs[i] && x.Y <= SlabAnchorYs[i + 1])) {
                    let newy = (SlabAnchorYs[i + 1] - SlabAnchorYs[i]) > 400 ? SlabAnchorYs[i + 1] - 200 : (SlabAnchorYs[i + 1] + SlabAnchorYs[i]) / 2;
                    let maxID = this.SpliceJoints.length > 0 ? Math.max(...this.SpliceJoints.map(x => x.SpliceJointID)) + 1 : 1;
                    let spliceJoint = {
                        SpliceJointID: maxID,
                        MemberID: id,
                        JointType: jointType,
                        Y: newy,
                    }
                    this.SpliceJoints.push(spliceJoint);
                    break;
                }
            }
            this.removeUnstableJoints(id);
        }

        this.UnifiedModelJSON.ModelInput.Geometry.SpliceJoints = this.SpliceJoints;

        Designer.EventListener.clearSelectedMeshes();
        Designer.UnifiedModel.drawModel(this.UnifiedModelJSON);
        Designer.Camera.centerCamera();
        this.changeUnifiedModel();
        Designer.DimensionLines.generate(null);
    }

    removeUnstableJoints(memberId) {
        let SlabAnchorYs = this.SlabAnchors.filter(x => x.MemberID == memberId).map(x => x.Y);
        SlabAnchorYs.sort((a, b) => { return a - b });
        let spliceJoints = this.SpliceJoints.filter(x => x.MemberID == memberId);
        for (let i = 0; i < SlabAnchorYs.length - 1; i++) {
            let spliceJointsInSpan = spliceJoints.filter(x => x.Y >= SlabAnchorYs[i] && x.Y <= SlabAnchorYs[i + 1]);
            if (spliceJointsInSpan.length > 1) {
                spliceJointsInSpan.sort((a, b) => { return b.Y - a.Y });
                let sjIDsToRemove = spliceJointsInSpan.map(x => x.SpliceJointID);
                sjIDsToRemove.shift();
                this.SpliceJoints = this.SpliceJoints.filter(x => !sjIDsToRemove.includes(x.SpliceJointID));
            }
        }
        this.UnifiedModelJSON.ModelInput.Geometry.SpliceJoints = this.SpliceJoints;
    }

    CheckIfDoorExists(geometry) {
        if (geometry.OperabilitySystems != null && geometry.OperabilitySystems.length > 0 && geometry.DoorSystems != null && geometry.DoorSystems.length > 0) {
            const ops = geometry.OperabilitySystems.filter(op => geometry.Infills.some(inf => inf.OperabilitySystemID == op.OperabilitySystemID));
            if (ops.length > 0) {
                const isDoorModel = ops.some(op => geometry.DoorSystems.some(ds => ds.DoorSystemID == op.DoorSystemID));
                return isDoorModel;
            }
        }
        return false;
    }

    // update door bottom outerframe to door threshold and sidelite sill for door projects
    addDoor(infillID) {
        // check if door exists, if yes, return
        const geometry = this.Geometry;
        //const doorExists = this.CheckIfDoorExists(geometry);
        //if (doorExists) return;

        // find door bottom points
        const infill = geometry.Infills.find(i => i.InfillID == infillID);
        const leftmember = this.Members.find(m => m.MemberID == infill.BoundingMembers[0]);
        const lm_pA = this.Points.find(p => p.PointID == leftmember.PointA);
        const lm_pB = this.Points.find(p => p.PointID == leftmember.PointB);
        const leftBottomP = lm_pA.Y < lm_pB.Y ? lm_pA : lm_pB;
        if (Math.abs(leftBottomP.Y) > 1e-4) return;
        const rightmember = this.Members.find(m => m.MemberID == infill.BoundingMembers[2]);
        const rm_pA = this.Points.find(p => p.PointID == rightmember.PointA);
        const rm_pB = this.Points.find(p => p.PointID == rightmember.PointB);
        const rightBottomP = rm_pA.Y < rm_pB.Y ? rm_pA : rm_pB;
        if (Math.abs(rightBottomP.Y) > 1e-4) return;

        // split bottom members
        let bottomPoints = this.Points.filter(p => Math.abs(p.Y) < 1e-4);
        bottomPoints = bottomPoints.sort((a, b) => (a.X < b.X) ? -1 : 1);
        const p1ID = bottomPoints[0].PointID;
        
        //const p2ID = p1ID == leftBottomP.PointID ? bottomPoints[2].PointID: bottomPoints[bottomPoints.length - 1].PointID;
        const p2ID = bottomPoints[bottomPoints.length - 1].PointID;
        const bottomMemeber = this.Members.find(m => bottomPoints.some(p => p.PointID == m.PointA) && bottomPoints.some(p => p.PointID == m.PointB));
        if ((p1ID == leftBottomP.PointID && p2ID == rightBottomP.PointID) || (p1ID == rightBottomP.PointID && p2ID == leftBottomP.PointID)) {
            bottomMemeber.SectionID = 31;
            bottomMemeber.MemberType = 31;
        }
        else if (p1ID == leftBottomP.PointID && p2ID != rightBottomP.PointID) {
            if (bottomMemeber.PointA == leftBottomP.PointID) {
                bottomMemeber.PointB = rightBottomP.PointID;
            } else {
                bottomMemeber.PointA = rightBottomP.PointID;
            }
            bottomMemeber.SectionID = 31;
            bottomMemeber.MemberType = 31;


            const newMember = {
                MemberID: Math.max(...this.Members.map(m => m.MemberID)) + 1,
                PointA: rightBottomP.PointID,
                PointB: p2ID,
                SectionID: 33,
                MemberType: 33
            }
            this.Members.push(newMember);

            const sideInfills = geometry.Infills.filter(i => i.BoundingMembers[3] == bottomMemeber.MemberID && i.InfillID !== infillID);
            for (let i of sideInfills) {
                i.BoundingMembers[3] = newMember.MemberID;
            }
        }
        else if (p1ID != leftBottomP.PointID && p2ID == rightBottomP.PointID) {
            if (bottomMemeber.PointA == rightBottomP.PointID) {
                bottomMemeber.PointB = leftBottomP.PointID;
            } else {
                bottomMemeber.PointA = leftBottomP.PointID;
            }
            bottomMemeber.SectionID = 31;
            bottomMemeber.MemberType = 31;

            const newMember = {
                MemberID: Math.max(...this.Members.map(m => m.MemberID)) + 1,
                PointA: p1ID,
                PointB: leftBottomP.PointID,
                SectionID: 33,
                MemberType: 33
            }
            this.Members.push(newMember);

            const sideInfills = geometry.Infills.filter(i => i.BoundingMembers[3] == bottomMemeber.MemberID && i.InfillID !== infillID);
            for (let i of sideInfills) {
                i.BoundingMembers[3] = newMember.MemberID;
            }
        }
        else if (p1ID != leftBottomP.PointID && p2ID != rightBottomP.PointID) {
            bottomMemeber.PointA = leftBottomP.PointID;
            bottomMemeber.PointB = rightBottomP.PointID;
            bottomMemeber.SectionID = 31;
            bottomMemeber.MemberType = 31;

            const newMemberLeft = {
                MemberID: Math.max(...this.Members.map(m => m.MemberID)) + 1,
                PointA: p1ID,
                PointB: leftBottomP.PointID,
                SectionID: 33,
                MemberType: 33
            }
            this.Members.push(newMemberLeft);

            const newMemberRight = {
                MemberID: Math.max(...this.Members.map(m => m.MemberID)) + 1,
                PointA: rightBottomP.PointID,
                PointB: p2ID,
                SectionID: 33,
                MemberType: 33
            }
            this.Members.push(newMemberRight);

            const sideInfills = geometry.Infills.filter(i => i.BoundingMembers[3] == bottomMemeber.MemberID && i.InfillID !== infillID);
            for (let i of sideInfills) {
                const Plx = this.Points.find(p => p.PointID == this.Members.find(m => m.MemberID == i.BoundingMembers[0]).PointA).X;
                const Prx = this.Points.find(p => p.PointID == this.Members.find(m => m.MemberID == i.BoundingMembers[2]).PointA).X;
                if (Plx < leftBottomP.X) {
                    i.BoundingMembers[3] = newMemberLeft.MemberID;
                }
                else if (Prx > rightBottomP.X)
                    i.BoundingMembers[3] = newMemberRight.MemberID;
            }
        }
        this.changeUnifiedModel();
    }


    removeDoor() {
        // check if door exists, if no, return
        // const doorExists = CheckIsDoorModel(geometry);
        // if (!doorExists) return;
        // merge bottom members
        let bottomPoints = this.Points.filter(p => Math.abs(p.Y) < 1e-4);
        bottomPoints = bottomPoints.sort((a, b) => (a.X < b.X) ? 1 : -1);
        const p1ID = bottomPoints[0];
        const p2ID = bottomPoints[bottomPoints.length - 1];
        let bottomMemebers = this.Members.filter(m => (bottomPoints.some(p => p.PointID == m.PointA) && bottomPoints.some(p => p.PointID == m.PointB)) || 
                                                      (bottomPoints.some(p => p.PointID == m.PointB) && bottomPoints.some(p => p.PointID == m.PointA)));
        const minMemberID = Math.min(...bottomMemebers.map(m => m.MemberID));
        bottomMemebers = bottomMemebers.filter(m => m.MemberID !== minMemberID);
        this.Geometry.Members = this.Members.filter(m => !bottomMemebers.some(bm => bm.MemberID == m.MemberID));
        const newbottomMember = this.Members.find(m => m.MemberID == minMemberID);
        newbottomMember.PointA = p1ID.PointID;
        newbottomMember.PointB = p2ID.PointID;
        newbottomMember.SectionID = 1;
        newbottomMember.MemberType = 1;
        //go through infills, find out which do not contain the new bottom member in their bounding members
        //set the fourth member in their bounding members to that new member
        //THIS WILL NEED TO BE EDITED IF WE SUPPORT MORE GLASS PANELS PER CONFIGURATION
        let infills = this.Geometry.Infills.filter(i => i.BoundingMembers[3] != newbottomMember.MemberID);
        for(var i in infills){
            let MemberAdjacent = this.Geometry.Members.find(x=> x.MemberID == infills[i].BoundingMembers[3]);
            if(MemberAdjacent === undefined) infills[i].BoundingMembers[3] = newbottomMember.MemberID;
        }
        this.Members = this.Geometry.Members;
        this.changeUnifiedModel();
    }

    // Update vent weight and LockingPositionNumber to Infill
    updateVentCheckResult(infillID, ventWeight, LockingPointOption) {
        const infill = this.Geometry.Infills.find(i => i.InfillID == infillID);

        if(!(infill.VentWeight == ventWeight && infill.LockingPointOption == LockingPointOption))
        {
            infill.VentWeight = ventWeight;
            infill.LockingPointOption = LockingPointOption;
    
            this.changeUnifiedModel();
        }
        
    }

    updateHandlePosition(infillID, handlePosition){
        if(!(Designer.UnifiedModel.Geometry.Infills.find(i=> i.InfillID == infillID).HandlePosition == handlePosition))
        {
            Designer.UnifiedModel.Geometry.Infills.find(i=> i.InfillID == infillID).HandlePosition = handlePosition;
            this.changeUnifiedModel();
        }
    }

    updateHingeCount(doorSystemID, hingeCount)
    {
        if(!(Designer.UnifiedModel.Geometry.DoorSystems.find(ds => ds.DoorSystemID == doorSystemID).HingeCondition == hingeCount))
        {
            Designer.UnifiedModel.Geometry.DoorSystems.find(ds => ds.DoorSystemID).HingeCondition = hingeCount;
            this.changeUnifiedModel();
        }
    }

    initSlidingDoorSpans(){
        this.slidingDoorSpans = this.SlidingDoorSystems[0].VentFrames.filter(x=>x = x.Width);
        this.slidingDoorSpansEdited = new Array(this.facadeXSpans.length).fill(false);
        this.slidingDoorSpansOriginalEdited = new Array(this.facadeXSpans.length).fill(false);
    }

    // function to be called when change outer frame dimension
    changeSlidingDoorDimension(isxInput, value) {
        if (isxInput) {
            let interlockOffset = (-20 + ((parseInt(Designer.UnifiedModel.doorFrames[0].doorVentArticle.outsideWidth) + 20) / 2))
            let outerFrameWidth = (Designer.UnifiedModel.outerFrame.articleWidth - 8);
            
            //calculate total width considering all vent widths non-overlapping
            let newValue = value;
            //take value, subtract (outer frame width -8) * 2
            newValue -=  outerFrameWidth * 2;

            //calculate number of interlocks
            let numInterlocks = 0;
            if(Designer.UnifiedModel.OperabilitySystems[0].VentOperableType == "SlidingDoor-Type-3F" || 
            Designer.UnifiedModel.OperabilitySystems[0].VentOperableType == "SlidingDoor-Type-2D1.i" ){
                //subtract 8 if has two vents on same track 
                newValue -= 8;
                numInterlocks = this.slidingDoorSpans.length - 2;
            }
            else{
                numInterlocks = this.slidingDoorSpans.length - 1;
            }

            //add number of interlocks * interlock offset (31)
            newValue += (numInterlocks * interlockOffset*2);
            
            //divide by number of vents
            let TrueVentWidth = newValue / this.slidingDoorSpans.length;

            //iterate through each vent, if outer subtract outer frame width, if middle subtract 
            let passedMidPoint = false;
            for(let i = 0; i < this.slidingDoorSpans.length;i++){
                if(i == 0 || i == (this.slidingDoorSpans.length -1)){
                    this.slidingDoorSpans[i].Width = TrueVentWidth + 9;
                }
                else if (i != this.slidingDoorSpans.length - 1 && this.slidingDoorSpans[i].Track == this.slidingDoorSpans[i+1].Track){
                    passedMidPoint = true;
                    this.slidingDoorSpans[i].Width = TrueVentWidth - interlockOffset + 4;
                }
                else if (passedMidPoint){
                    passedMidPoint = false;
                    this.slidingDoorSpans[i].Width = TrueVentWidth - interlockOffset + 4;
                }
                else{
                    this.slidingDoorSpans[i].Width = TrueVentWidth - interlockOffset*2;
                }   
                this.UnifiedModelJSON.ModelInput.Geometry.SlidingDoorSystems[0].VentFrames[i].Width = this.slidingDoorSpans[i].Width;
            }
            for (let point of this.Points) {
                if (Math.abs(point.X - this.width) < 1e-4) {
                    point.X = value;
                }
            }
        }
        else{
            for (let point of this.Points) {
                if (Math.abs(point.Y - this.height) < 1e-4) {
                    point.Y = value;
                }
            }
        }
        
        Designer.UnifiedModel.drawModel(this.UnifiedModelJSON);
        this.width = Designer.UnifiedModel.getWidth();
        this.height = Designer.UnifiedModel.getHeight();

        Designer.DimensionLines.generate(); 

        Designer.Camera.centerCamera();
        this.changeUnifiedModel();
    }
    
    changeSlidingDoorSpans(index, value) {
        
        //need these values for calculations
        let interlockOffset = (-20 + ((parseInt(Designer.UnifiedModel.doorFrames[0].doorVentArticle.outsideWidth) + 20) / 2))
        let outerFrameWidth = (Designer.UnifiedModel.outerFrame.articleWidth - 8);

        //calculate actual width given index of vent 
        if(index == 0 || index == this.slidingDoorSpans.length-1){
            value -= 9;
        }
        else if(index != this.slidingDoorSpans.length - 1 && ((this.slidingDoorSpans[index].Track == this.slidingDoorSpans[index+1].Track) || 
        (this.slidingDoorSpans[index].Track == this.slidingDoorSpans[index-1].Track))){
            value += (interlockOffset - 4);
        }
        else{
            value += (interlockOffset*2);
        }
        
        //calculate total width considering all vent widths non-overlapping
        let newValue = value * this.slidingDoorSpans.length;
        //take value, subtract (outer frame width -8) * 2
        newValue +=  outerFrameWidth * 2;

        //calculate number of interlocks
        let numInterlocks = 0;
        if(Designer.UnifiedModel.OperabilitySystems[0].VentOperableType == "SlidingDoor-Type-3F" || 
        Designer.UnifiedModel.OperabilitySystems[0].VentOperableType == "SlidingDoor-Type-2D1.i" ){
            //subtract 8 if has two vents on same track 
            newValue += 8;
            numInterlocks = this.slidingDoorSpans.length - 2;
        }
        else{
            numInterlocks = this.slidingDoorSpans.length - 1;
        }

        //add number of interlocks * interlock offset (31)
        newValue -= (numInterlocks * interlockOffset*2);
        
        //divide by number of vents
        let TrueVentWidth = value;

        //iterate through each vent, if outer subtract outer frame width, if middle subtract 
        let passedMidPoint = false;
        for(let i = 0; i < this.slidingDoorSpans.length;i++){
            if(i == 0 || i == (this.slidingDoorSpans.length -1)){
                this.slidingDoorSpans[i].Width = TrueVentWidth + 9;
            }
            else if (i != this.slidingDoorSpans.length - 1 && this.slidingDoorSpans[i].Track == this.slidingDoorSpans[i+1].Track){
                passedMidPoint = true;
                this.slidingDoorSpans[i].Width = TrueVentWidth - interlockOffset + 4;
            }
            else if (passedMidPoint){
                passedMidPoint = false;
                this.slidingDoorSpans[i].Width = TrueVentWidth - interlockOffset + 4;
            }
            else{
                this.slidingDoorSpans[i].Width = TrueVentWidth - interlockOffset*2;
            }   
            this.UnifiedModelJSON.ModelInput.Geometry.SlidingDoorSystems[0].VentFrames[i].Width = this.slidingDoorSpans[i].Width;
        }
        for (let point of this.Points) {
            if (Math.abs(point.X - this.width) < 1e-4) {
                point.X = newValue;
            }
        }
        

        Designer.EventListener.clearSelectedMeshes();
        Designer.UnifiedModel.drawModel(this.UnifiedModelJSON);
        this.width = Designer.UnifiedModel.getWidth();
        this.height = Designer.UnifiedModel.getHeight();
        Designer.Camera.centerCamera();
        this.changeUnifiedModel();
        Designer.DimensionLines.generate(null);
    }

}