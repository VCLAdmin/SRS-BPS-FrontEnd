
/**
 * This class Generates a Door Frame on an infill
 * */

 class DesignerDoorFrame {

    constructor(settings) {


        this.dimensions = settings.dimensions;
        this.doorSillArticleName = "article__" + settings.doorSystem.DoorSillArticleName;
        this.doorLeafArticleName = "article__" + settings.doorSystem.DoorLeafArticleName;
        this.doorPassiveJambArticleName = "article__" + settings.doorSystem.DoorPassiveJambArticleName;
        this.doorThresholdArticleName = "article__" + settings.doorSystem.DoorThresholdArticleName;
        this.doorSideLightSillArticleName = "article__" + settings.doorSystem.DoorSidelightSillArticleName;

        this.infillID = settings.glassID;
        this.doorSystemID = settings.doorSystem.DoorSystemID;
        this.doorOpeningDirection = settings.DoorOpeningDirection;
        this.doorOperableType = settings.DoorOperableType;

        this.InsideHandleColor = settings.doorSystem.InsideHandleColor;
        this.InsideHandleArticleName = settings.doorSystem.InsideHandleArticleName;
        this.insidehandleMaterial = null;

        this.OutsideHandleColor = settings.doorSystem.OutsideHandleColor;
        this.OutsideHandleArticleName = settings.doorSystem.OutsideHandleArticleName;
        this.outsidehandleMaterial = null;


        this.HingeCondition = settings.doorSystem.HingeCondition;
        this.HingeArticleName = settings.doorSystem.HingeArticleName;
        this.HingeColor = settings.doorSystem.HingeColor;
        this.HingeMaterial = null;

        this.sideLightSills = [];
        this.doorSillArticle = null;
        this.doorLeafArticle = null;
        this.doubleVentSecondaryJambArticle = null;
        this.doorThresholdArticle = null;
        this.doorSideLightSillArticle = null;
        this.doorLeafArticleInsideWidth = 0;
        this.doorLeafArticleOutsideWidth = 0;
        this.doorSillArticleInsideWidth = 0;
        this.doorSillArticleOutsideWidth = 0;
        this.doorPassiveJambArticleOutsideWidth = 0;
        this.doorPassiveJambArticleInsideWidth = 0;

        this.name = `infill_${this.infillID}__door_frame`;

        this.handlePosition = 1050;
        this.doorFrameGroup = new THREE.Group();
        
        this.insideHandle = null;
        this.outsideHandle = null;
        this.keyLock = null;
        this.hinges = null;
        this.doorInfo = null;

        // for cut planes
        this.planeVerticalTop = null;
        this.planeVerticalTopPassive = null;
        this.planeVerticalBottom = null;
        this.planeHorizontalLeft = null;
        this.planeHorizontalRight = null;
        this.extrudePath = null;
        this.subtypes = new DesignerSubType();
        this.init();
    }

    init() {
        this.doorSillArticle = this.readArticleProperties(this.doorSillArticleName);
        this.doorLeafArticle = this.readArticleProperties(this.doorLeafArticleName);
        this.doorPassiveJambArticle = this.readArticleProperties(this.doorPassiveJambArticleName);
        //this.doorThresholdArticle = this.readArticleProperties(this.doorThresholdArticleName);
        this.doorSideLightSillArticle = this.readArticleProperties(this.doorSideLightSillArticleName);
        this.doorLeafArticleInsideWidth = parseInt(this.doorLeafArticle.insideWidth, 10);
        this.doorLeafArticleOutsideWidth = parseInt(this.doorLeafArticle.outsideWidth, 10);
        this.doorSillArticleInsideWidth = parseInt(this.doorSillArticle.insideWidth, 10);
        this.doorSillArticleOutsideWidth = parseInt(this.doorSillArticle.outsideWidth, 10);
        this.doorPassiveJambArticleInsideWidth = parseInt(this.doorPassiveJambArticle.insideWidth, 10);
        this.doorPassiveJambArticleOutsideWidth = parseInt(this.doorPassiveJambArticle.outsideWidth, 10);
    }

    // read article data from article_articleNumber.js file in content/articles folder
    readArticleProperties(articleName) {
        if (articleName.indexOf("null") > - 1) { return null }
        else {
            // get intermediate article from article__articleNumber.js
            const articleNameStart = articleName.substring(0, 9);
            let article = null;
            if (articleNameStart == "article__" && this.articleName !== "article__-1") {
                article = window[articleName]();
            }
            else {
                const customArticle = {};
                articleName = "article__CustomArticle";
                article = window[articleName](customArticle);
            }
            return article;
        }
    }

    getArticleWidth(article) {
        return parseInt(article.width,10);
    }

    updateGlassDimensions() {
        let dimensions = this.dimensions;
        
        //dimensions.xmin += this.doorLeafArticleInsideWidth;
        //dimensions.ymin += this.doorSillArticleInsideWidth;
        //dimensions.xmax -= this.doorLeafArticleInsideWidth;
        //dimensions.ymax -= this.doorLeafArticleInsideWidth;

        return dimensions;
    }

    createCutPlane() {
        this.planeVerticalTop = new THREE.Mesh(new THREE.BoxGeometry(200, 750, 500), new THREE.MeshBasicMaterial({ wireframe: true, color: 0xffffff, side: 2 }));
        this.planeVerticalTopPassive = new THREE.Mesh(new THREE.BoxGeometry(200, 750, 500), new THREE.MeshBasicMaterial({ color: 0xffffff, side: 2 }));
        this.planeVerticalBottom = new THREE.Mesh(new THREE.BoxGeometry(200, 750, 500), new THREE.MeshBasicMaterial({ color: 0xffffff, side: 2 }));
        this.planeHorizontalLeft = new THREE.Mesh(new THREE.BoxGeometry(200, 750, 500), new THREE.MeshBasicMaterial({ color: 0xffffff, side: 2 }));
        this.planeHorizontalRight = new THREE.Mesh(new THREE.BoxGeometry(200, 750, 500), new THREE.MeshBasicMaterial({ color: 0xffffff, side: 2 }));

        let offset = 141.4;


        //passive jamb is on the right door
        if(this.doorOperableType.includes("Double")){
            this.planeVerticalTop.position.set(0, this.dimensions.ymax + offset, 0);
            this.planeVerticalTopPassive.position.set(0, this.dimensions.ymax - (this.dimensions.ymin) + offset + (this.doorLeafArticleInsideWidth - this.doorPassiveJambArticleInsideWidth), 0);
            this.planeVerticalBottom.position.set(0, -offset, 0);
            this.planeHorizontalLeft.position.set(-offset, 0, 0);
            this.planeHorizontalRight.position.set(((this.dimensions.xmax - this.dimensions.xmin)/2) - (this.doorLeafArticleInsideWidth - this.doorPassiveJambArticleInsideWidth)+ offset, 0, 0);
        }

        this.planeVerticalTop.rotateZ(Math.PI / 4);
        this.planeVerticalTopPassive.rotateZ(Math.PI / 4);
        this.planeVerticalBottom.rotateZ((7 * Math.PI) / 4);
        this.planeHorizontalLeft.rotateZ((3 * Math.PI) / 4);
        this.planeHorizontalRight.rotateZ((Math.PI) / 4);
        //Designer.Scene.scene.add(this.planeVerticalTop);
        this.planeVerticalTop = new ThreeBSP(this.planeVerticalTop);
        this.planeVerticalTopPassive = new ThreeBSP(this.planeVerticalTopPassive);
        this.planeVerticalBottom = new ThreeBSP(this.planeVerticalBottom);
        this.planeHorizontalLeft = new ThreeBSP(this.planeHorizontalLeft);
        this.planeHorizontalRight = new ThreeBSP(this.planeHorizontalRight);
    }

    generateDoorFrameExtrusion() {
        let dimensions = this.dimensions;
        this.doorFrameGroup = new THREE.Group();

        this.createCutPlane();
        
        //draw door leaf
        const doorLeafArticle = this.doorLeafArticle;
        const doorPassiveJambArticle = this.doorPassiveJambArticle;
        let doorLeafPoints = null;
        let doorLeafPointsDouble = null;
        if(this.doorOperableType.includes("Single")){
            doorLeafPoints = [                
                new THREE.Vector2(dimensions.xmin, dimensions.ymin),
                new THREE.Vector2(dimensions.xmin, dimensions.ymax),
                new THREE.Vector2(dimensions.xmax, dimensions.ymax),
                new THREE.Vector2(dimensions.xmax, dimensions.ymin),
            ];
        }
        else{

            if(this.doorOperableType.includes("Right")){

                doorLeafPoints = [
                    new THREE.Vector2(dimensions.xmin, dimensions.ymin),
                    new THREE.Vector2(dimensions.xmin, dimensions.ymax),
                    new THREE.Vector2(((dimensions.xmax + dimensions.xmin) / 2) , dimensions.ymax),
                    new THREE.Vector2(((dimensions.xmax + dimensions.xmin) / 2) , dimensions.ymin),
                ];
            }
            else{

                doorLeafPoints = [
                    new THREE.Vector2(((dimensions.xmax + dimensions.xmin) / 2) , dimensions.ymin),
                    new THREE.Vector2(((dimensions.xmax + dimensions.xmin) / 2) , dimensions.ymax), 
                    new THREE.Vector2(dimensions.xmax, dimensions.ymax),
                    new THREE.Vector2(dimensions.xmax, dimensions.ymin),
                ];
            }
        }
        let verticalExtrudePath = new THREE.CatmullRomCurve3([
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(this.dimensions.ymax + this.doorSillArticleInsideWidth, 0, 0),
        ], false, "centripetal", 0.5);
       
        let horizontalExtrudePath = new THREE.CatmullRomCurve3([
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(((this.dimensions.xmax - this.dimensions.xmin)/2)  - (this.doorLeafArticleInsideWidth - this.doorPassiveJambArticleInsideWidth)+ this.doorSillArticleInsideWidth, 0, 0)
        ], false, "centripetal", 0.5);

        if(this.doorOperableType.includes("Double")){
            //passive jamb article
            for(var k in doorPassiveJambArticle.shapes){
                let passiveShape = doorPassiveJambArticle.shapes[k];
                let passiveShapeGeometry = new THREE.ExtrudeGeometry(passiveShape, {
                    steps: 2, 
                    curveSegments: 2, 
                    bevelEnabled: false, 
                    extrudePath: new THREE.CatmullRomCurve3([
                        new THREE.Vector3(0, 0, 0),
                        new THREE.Vector3((this.dimensions.ymax - (this.dimensions.ymin)), 0, 0),
                    ], false, "centripetal", 0.5)
                });


                let shapeMaterial = Designer.Materials.setMaterial(passiveShape);
                let passiveShapeMesh = new THREE.Mesh(passiveShapeGeometry, shapeMaterial);
                passiveShapeMesh.rotateY(-Math.PI/2);
                passiveShapeMesh.rotateZ(Math.PI/2);

                //miter cut
                let cube = passiveShapeMesh;
                let clone = cube.clone();
                clone = new ThreeBSP(clone);
                clone = clone.subtract(this.planeVerticalTopPassive);
                let PassiveBox1 = new THREE.Mesh(new THREE.BoxGeometry(50,250,500), new THREE.MeshBasicMaterial({wireframe: true}));
                PassiveBox1.position.set(25,(this.dimensions.ymax - (this.dimensions.ymin)) +120,0);
                PassiveBox1 = new ThreeBSP(PassiveBox1);
                clone = clone.subtract(PassiveBox1);
                clone = clone.toMesh(shapeMaterial);
                passiveShapeMesh = clone; 


                passiveShapeMesh.geometry.verticesNeedUpdate = true;
                passiveShapeMesh.geometry.normalsNeedUpdate = true;
                passiveShapeMesh.geometry.computeBoundingSphere();
                passiveShapeMesh.geometry.computeFaceNormals();

                //transform to correct side depending on active door leaf
                passiveShapeMesh.scale.z = this.doorOperableType.includes("Right") ? 1: -1;
                passiveShapeMesh.position.x = this.doorOperableType.includes("Right")?
                ((this.dimensions.xmax + this.dimensions.xmin)/2):
                ((this.dimensions.xmax + this.dimensions.xmin)/2);
                passiveShapeMesh.position.y = this.dimensions.ymin;
                passiveShapeMesh.position.z -= 5;
                passiveShapeMesh.userData.originalMaterial = shapeMaterial;
                passiveShapeMesh.subtype = this.subtypes.doorFrame;
                this.doorFrameGroup.add(passiveShapeMesh);

            }
        }
        
        for (var j in doorLeafArticle.shapes) {
            //extrude active leaf profiles  
            let shape = doorLeafArticle.shapes[j];
            shape.useMaterial = "VentFrameAluminium";
            let shapeGeometry = new THREE.ProfiledContourGeometry({
                shape: shape,
                points: doorLeafPoints,
                closed: false,
                capped: false
            });
            
            let shapeMaterial = Designer.Materials.setMaterial(shape);
            let shapeMesh = new THREE.Mesh(shapeGeometry, shapeMaterial);
            shapeMesh.position.z -= 5;
            shapeMesh.userData.originalMaterial = shapeMaterial;
            shapeMesh.subtype = this.subtypes.doorFrame;
            this.doorFrameGroup.add(shapeMesh);
            
            //if double, also need to extrude leaf passive profiles
            if(this.doorOperableType.includes("Double")){

                //vertical profile next to side light
                let shapeGeometryDoubleVertical = new THREE.ExtrudeGeometry(shape, {
                    steps: 2,
                    curveSegments: 2,
                    bevelEnabled: false,
                    extrudePath: verticalExtrudePath
                });

                let shapeMeshDouble = new THREE.Mesh(shapeGeometryDoubleVertical, shapeMaterial);
                shapeMeshDouble.rotateY(-Math.PI/2);
                shapeMeshDouble.rotateZ(Math.PI/2);

                // //miter cut
                let cube = shapeMeshDouble;
                let clone = cube.clone();
                clone = new ThreeBSP(clone);
                clone = clone.subtract(this.planeVerticalTop);
                
                clone = clone.toMesh(shapeMaterial);
                shapeMeshDouble = clone; 

                shapeMeshDouble.geometry.verticesNeedUpdate = true;
                shapeMeshDouble.geometry.normalsNeedUpdate = true;
                shapeMeshDouble.geometry.computeBoundingSphere();
                shapeMeshDouble.geometry.computeFaceNormals();

                //transforms profile into place, according to active side location
                shapeMeshDouble.position.x = this.doorOperableType.includes("Right") ? this.dimensions.xmax : this.dimensions.xmin;
                shapeMeshDouble.position.y =  this.dimensions.ymin;
                shapeMeshDouble.position.z -=  5;
                shapeMeshDouble.userData.originalMaterial = shapeMaterial;
                shapeMeshDouble.scale.z = this.doorOperableType.includes("Right") ? -1 : 1;
                shapeMeshDouble.subtype = this.subtypes.doorFrame;
                this.doorFrameGroup.add(shapeMeshDouble);

                //top door leaf profile
                let geometryHorizontal = new THREE.ExtrudeGeometry(shape, {
                    steps: 2,
                    curveSegments: 2,
                    bevelEnabled: false,
                    extrudePath: horizontalExtrudePath
                });
                let shapeMeshHorizontal = new THREE.Mesh(geometryHorizontal, shapeMaterial);
                shapeMeshHorizontal.translateX(((this.dimensions.xmax - this.dimensions.xmin)/2) - (this.doorLeafArticleInsideWidth - this.doorPassiveJambArticleInsideWidth) + this.doorLeafArticleInsideWidth);
                shapeMeshHorizontal.rotateY(Math.PI);
                shapeMeshHorizontal.rotateX(Math.PI / 2);
            
                //miter cut
                cube = shapeMeshHorizontal;
                clone = cube.clone();
                clone = new ThreeBSP(clone);
                clone = clone.subtract(this.planeHorizontalRight);
                let PassiveBox = new THREE.Mesh(new THREE.BoxGeometry(50,250,500), new THREE.MeshBasicMaterial({wireframe: true}));
                PassiveBox.position.set(((this.dimensions.xmax - this.dimensions.xmin)/2) - (this.doorLeafArticleInsideWidth - this.doorPassiveJambArticleInsideWidth) + this.doorLeafArticleInsideWidth - 50,0,0);
                PassiveBox = new ThreeBSP(PassiveBox);
                clone = clone.subtract(PassiveBox);
                clone = clone.subtract(this.planeHorizontalLeft);
                clone = clone.toMesh(shapeMaterial);
                shapeMeshHorizontal = clone;
                shapeMeshHorizontal.userData.originalMaterial = shapeMaterial;
                shapeMeshHorizontal.geometry.verticesNeedUpdate = true;
                shapeMeshHorizontal.geometry.normalsNeedUpdate = true;
                shapeMeshHorizontal.geometry.computeBoundingSphere();
                shapeMeshHorizontal.geometry.computeFaceNormals();

                //transforms profile into place depending on active side
                shapeMeshHorizontal.scale.x =  this.doorOperableType.includes("Right") ?  -1:1;
                shapeMeshHorizontal.scale.z = -1;
                shapeMeshHorizontal.position.x =  this.doorOperableType.includes("Right") ? 
                this.dimensions.xmax - ((this.dimensions.xmax - this.dimensions.xmin)/2) + (this.doorLeafArticleInsideWidth - this.doorPassiveJambArticleInsideWidth) - this.doorLeafArticleInsideWidth:
                this.dimensions.xmin + ((this.dimensions.xmax - this.dimensions.xmin)/2) - (this.doorLeafArticleInsideWidth - this.doorPassiveJambArticleInsideWidth) + this.doorLeafArticleInsideWidth;
                shapeMeshHorizontal.position.y = this.dimensions.ymax;
                shapeMeshHorizontal.position.z -= 5;
                shapeMeshHorizontal.subtype = this.subtypes.doorFrame;
                this.doorFrameGroup.add(shapeMeshHorizontal);

            }
            
        }

        //draw door sill
        const doorSillArticle = this.doorSillArticle;
        let doorSillPoints = null;
        let doorSillPointsDouble = null;
        if(this.doorOperableType.includes("Single")){
            doorSillPoints = [
                new THREE.Vector2(dimensions.xmax, dimensions.ymin),
                new THREE.Vector2(dimensions.xmin, dimensions.ymin)
                
            ];
        }
        else{
            if(this.doorOperableType.includes("Right"))
            {
                doorSillPoints = [
                    new THREE.Vector2((dimensions.xmin + (dimensions.xmax - dimensions.xmin)/2) - this.doorLeafArticleInsideWidth/2, this.dimensions.ymin),
                    new THREE.Vector2(dimensions.xmin + this.doorLeafArticleInsideWidth, this.dimensions.ymin)
                   
                ];
                doorSillPointsDouble = [
                    new THREE.Vector2(dimensions.xmax - this.doorLeafArticleInsideWidth, this.dimensions.ymin),
                    new THREE.Vector2((dimensions.xmin + (dimensions.xmax - dimensions.xmin)/2) + this.doorPassiveJambArticleOutsideWidth/2, this.dimensions.ymin)
                    
                ];
            }
            else{
                doorSillPoints = [
                    new THREE.Vector2(dimensions.xmax, this.dimensions.ymin),
                    new THREE.Vector2((dimensions.xmin + (dimensions.xmax - dimensions.xmin)/2) + this.doorLeafArticleInsideWidth/2, this.dimensions.ymin)


                ];
                doorSillPointsDouble = [
                    new THREE.Vector2((dimensions.xmin + (dimensions.xmax - dimensions.xmin)/2) - this.doorPassiveJambArticleInsideWidth/2, this.dimensions.ymin),
                    new THREE.Vector2(dimensions.xmin, this.dimensions.ymin)
                ];
            }
            
        }
        
        for (var j in doorSillArticle.shapes) {
            let shape = doorSillArticle.shapes[j];
            shape.useMaterial = "VentFrameAluminium";
            let shapeGeometry = new THREE.ProfiledContourGeometry({
                shape: shape,
                points: doorSillPoints,
                closed: false,
                capped: false
            });
            let shapeMaterial = Designer.Materials.setMaterial(shape);
            let shapeMesh = new THREE.Mesh(shapeGeometry, shapeMaterial);
            shapeMesh.position.z -= 5;
            shapeMesh.userData.originalMaterial = shapeMaterial;
            this.doorFrameGroup.add(shapeMesh);

            if(this.doorOperableType.includes("Double")){
                let shapeGeometryDouble = new THREE.ProfiledContourGeometry({
                    shape: shape,
                    points: doorSillPointsDouble,
                    closed: false,
                    capped: false
                });
                let shapeMeshDouble = new THREE.Mesh(shapeGeometryDouble, shapeMaterial);
                shapeMeshDouble.userData.originalMaterial = shapeMaterial;
                shapeMeshDouble.position.z -= 5;

                this.doorFrameGroup.add(shapeMeshDouble);
            }
        }

        //draw door handle
        if (this.handlePosition < 9 || this.handlePosition + this.dimensions.ymin > this.dimensions.ymax) {
            this.handlePosition = Math.round((this.dimensions.ymax - this.dimensions.ymin) / 2);
            //Designer.UnifiedModelOperator.updateHandlePosition(this.glassID, this.handlePosition);
        }
        //Handle OBJ
        //let objLoader = new THREE.OBJLoader();
        //objLoader.setPath("https://vcl-design-com.s3.amazonaws.com/StaticFiles/scripts/3DGraphics/content/object/");
        if(this.OutsideHandleColor != null){
            this.outsidehandleMaterial = this.setHandleColor(this.OutsideHandleColor.toLowerCase().trim().substr(this.OutsideHandleColor.toLowerCase().trim().length - 4));
        }
        else{
            this.outsidehandleMaterial = this.setHandleColor(this.OutsideHandleColor);
        }
        if(this.InsideHandleColor != null){
            this.insidehandleMaterial = this.setHandleColor(this.InsideHandleColor.toLowerCase().trim().substr(this.InsideHandleColor.toLowerCase().trim().length - 4));
        }
        else{
            this.insidehandleMaterial = this.setHandleColor(this.InsideHandleColor);
        }
        if(this.HingeColor != null){
            this.HingeMaterial = this.setHandleColor(this.HingeColor.toLowerCase().trim().substr(this.HingeColor.toLowerCase().trim().length - 4));
        }
        else{
            this.HingeMaterial = this.setHandleColor(this.HingeColor);
        }
        if(this.dimensions.ymax >= 1200){
            //inside handle            
            let handleOBJ = Designer.Materials.handleOBJ.clone();
            this.insideHandle = handleOBJ;

            handleOBJ.traverse((child) => {
                child.material = this.insidehandleMaterial;
                child.userData.originalMaterial = this.insidehandleMaterial;
            });
            this.insideHandle.ventFrame = this;
            this.insideHandle.subtype = this.subtypes.insideHandle;
            this.onAddHandle(this.doorFrameGroup, true);
            this.doorFrameGroup.add(handleOBJ);

            //outside handle
            let outsideHandleOBJ = this.OutsideHandleArticleName == "240099" ? Designer.Materials.doorPullOBJ : Designer.Materials.handleOBJ.clone();
            this.outsideHandle = outsideHandleOBJ;

            outsideHandleOBJ.traverse((child) => {
                child.material = this.outsidehandleMaterial;
                child.userData.originalMaterial = this.outsidehandleMaterial;
            });
            this.outsideHandle.ventFrame = this;
            this.outsideHandle.subtype =  this.subtypes.outsideHandle;
            this.onAddHandle(this.doorFrameGroup, false);
            this.doorFrameGroup.add(outsideHandleOBJ);

            //key lock
            if(this.OutsideHandleArticleName == null || this.OutsideHandleArticleName != "240099")
            {
                let keyLockOBJ = Designer.Materials.keyLockOBJ.clone();
                this.keyLock = keyLockOBJ;
                keyLockOBJ.traverse((child) => {
                    child.material = this.outsidehandleMaterial;
                    child.userData.originalMaterial = this.outsidehandleMaterial;
                })
                this.keyLock.ventFrame = this;
                this.keyLock.subtype = this.subtypes.doorFrame;
                this.onAddKeyLock(this.doorFrameGroup);
                this.doorFrameGroup.add(keyLockOBJ);
            }
        }

        this.doorFrameGroup.subtype = this.subtypes.doorFrame;
        this.doorFrameGroup.name = this.name;
        this.doorFrameGroup.userData.clickable = true;
        this.doorFrameGroup.userData.dimensions = this.dimensions;
        //this.doorFrameGroup = doorFrameGroup;
        return this.doorFrameGroup;
    }
    generateHinges(){
        //draw door hinges
        if(this.dimensions.ymax >= 1200){
            let hingOBJ = Designer.Materials.hingeOBJ.clone();
            this.hinges = new THREE.Group();
            hingOBJ.traverse((child) => {
                child.material = this.HingeMaterial;
                child.userData.originalMaterial = this.HingeMaterial;
            })
            this.hinges.ventFrame = this;
            this.onAddHinges(this.doorFrameGroup, hingOBJ);
            this.doorFrameGroup.add(this.hinges);
        }

    }
    generateSideLightSills(){
        //draw side light sills
        let SillGroup = new THREE.Group();
        let Points = Designer.UnifiedModel.Points;
        let Members = Designer.UnifiedModel.Members;
        let NewMembers = Members.filter( member=> member.MemberType == 33);
        let PointAs = Points.filter(element => NewMembers.some(e => e.PointA == element.PointID));
        let PointBs = Points.filter(element => NewMembers.some(e => e.PointB == element.PointID));
        let newShapes = [];
        for(let i = 0; i < NewMembers.length; i++) newShapes.push(new THREE.Group());
        for(var k in this.doorSideLightSillArticle.shapes){
            let shape = this.doorSideLightSillArticle.shapes[k];
            shape.useMaterial = "VentFrameAluminium";
            for(var m in NewMembers){
                let member = NewMembers[m];
                let PointAX = PointAs.find(x => x.PointID == member.PointA).X;
                let PointBX = PointBs.find(x => x.PointID == member.PointB).X;
                let points = null;
                if(PointAX < PointBX) points = [ new THREE.Vector2(PointBX,0), new THREE.Vector2(PointAX, 0),]
                else points = [ new THREE.Vector2(PointAX,0), new THREE.Vector2(PointBX, 0),]
                let shapeGeometry = new THREE.ProfiledContourGeometry({
                    shape: shape,
                    points: points,
                    closed: false,
                    capped: false
                });
                let shapeMaterial = Designer.Materials.setMaterial(shape);
                let shapeMesh = new THREE.Mesh(shapeGeometry, shapeMaterial);
                shapeMesh.position.z -= 5;
                shapeMesh.userData.originalMaterial = shapeMaterial;
                newShapes[parseInt(m)].add(shapeMesh);
            }

        }
        for(var s in newShapes) SillGroup.add(newShapes[s]);
        return SillGroup;
    }
    onAddHandle(ventFrameGroup, isInside) {
        let bbox = new THREE.Box3().setFromObject(ventFrameGroup);
        let handle = isInside? this.insideHandle : this.outsideHandle;
        let handleBoundingBox = new THREE.Box3().setFromObject(handle);
        let handleHeight = new THREE.Vector3();
        handleBoundingBox.getSize(handleHeight);
        if(isInside){
            handle.position.z = bbox.min.z;
        }
        else{
            handle.position.z = bbox.max.z;
            handle.scale.z = -1;
        }
        let xmin = 0; 
        let xmax = 0;
        if(this.doorOperableType.includes("Single")){
            xmin = -20 + this.dimensions.xmin + this.doorLeafArticleOutsideWidth/2;
            xmax = 20 + this.dimensions.xmax - this.doorLeafArticleOutsideWidth/2;
        }
        else{
            if(this.doorOperableType.includes("Active-Right")){
                xmin = 20 + -this.doorLeafArticleOutsideWidth/2 + (this.dimensions.xmin + (this.dimensions.xmax - this.dimensions.xmin) /2 );
                xmax = this.dimensions.xmin;
            }
            else{
                xmin =  this.dimensions.xmax;
                xmax = -20 + (this.dimensions.xmin + (this.dimensions.xmax - this.dimensions.xmin) /2 ) + this.doorLeafArticleOutsideWidth/2; 
            }
        }
        if(this.doorOperableType.includes("Left") && this.doorOperableType.includes("Single")){
            handle.position.x = xmin;
            handle.scale.x = -1;
        }
        else if (this.doorOperableType.includes("Right") && this.doorOperableType.includes("Single")) {
            handle.position.x = xmax;
            if (!this.doorOperableType.includes("Single")) handle.scale.x = -1;
        }
        else if (this.doorOperableType.includes("Right") && this.doorOperableType.includes("Double")) {
            handle.position.x = xmin;
        }
        else if (this.doorOperableType.includes("Left") && this.doorOperableType.includes("Double")) {
            handle.position.x = xmax;
            handle.scale.x = -1;
        }
        handle.position.y = 1050;
        if(this.OutsideHandleArticleName == "240099" && !isInside) {
            handle.scale.z *= -1;
            handle.position.z -= 74;
        }
    }

    onAddKeyLock() {
        this.keyLock.position.set(this.outsideHandle.position.x, this.outsideHandle.position.y, this.outsideHandle.position.z);
        this.keyLock.scale.z = -0.9;
    }

    onAddHinges(ventFrameGroup, obj){
        let bbox = new THREE.Box3().setFromObject(ventFrameGroup);
        let hingeBoundingBox = new THREE.Box3().setFromObject(obj);
        let insideHandleBoundingBox = new THREE.Box3().setFromObject(this.insideHandle);
        let insideHandleHeight = new THREE.Vector3();
        let hingeHeight = new THREE.Vector3();
        hingeBoundingBox.getSize(hingeHeight);
        insideHandleBoundingBox.getSize(insideHandleHeight);
        let ySize = hingeBoundingBox.max.y;
        let hingePlacements = [this.dimensions.ymin + 130, this.dimensions.ymax - 130 - ySize];
        switch (this.HingeCondition)
        {
            case 0: 
            hingePlacements = [];
            break;

            case 1: 
            break;

            case 2:
            hingePlacements.push(((this.dimensions.ymin + this.dimensions.ymax)/2) -ySize/2);
            break;

            case 3: 
            hingePlacements.push(this.dimensions.ymax - 300 - ySize);
            break;

            case 4: 
            hingePlacements.push(((this.dimensions.ymin + this.dimensions.ymax)/2) -ySize/2);
            hingePlacements.push(this.dimensions.ymax - 300 - ySize);
            break;

        }


        for(let y of hingePlacements){
            
            
            if(this.doorOperableType.includes("Double")){

                let newHinge1 = obj.clone();
                newHinge1.position.x = this.dimensions.xmin - this.doorLeafArticleInsideWidth/2 -18;// + this.doorLeafArticleInsideWidth;
                newHinge1.scale.x = 1;
                newHinge1.position.y = y;
                newHinge1.position.z = -80;
                newHinge1.scale.z = 1;
                this.hinges.add(newHinge1);

                let newHinge2 = obj.clone();
                newHinge2.position.x = this.dimensions.xmax +  this.doorLeafArticleInsideWidth/2 + 18;// - this.doorLeafArticleInsideWidth;
                newHinge2.scale.x = -1;
                newHinge2.position.y = y;
                newHinge2.position.z = -80;
                newHinge2.scale.z = 1;
                this.hinges.add(newHinge2);
            }
            else{
                let newHinge1 = obj.clone();
                newHinge1.position.x = this.dimensions.xmin - this.doorLeafArticleInsideWidth/2 - 28;// + this.doorLeafArticleInsideWidth;
                newHinge1.scale.x = 1;
                newHinge1.position.y = y;
                newHinge1.position.z = -80;
                newHinge1.scale.z = 1;
                this.hinges.add(newHinge1);
                if(this.doorOperableType.includes("Left")){
                    newHinge1.position.x = this.dimensions.xmax + this.doorLeafArticleInsideWidth/2 + 18;// - this.doorLeafArticleInsideWidth;
                    newHinge1.scale.x = -1;
                }
            }

        }
    }
    
    setHandleColor(ralNumber) {
        if(this.InsideHandleColor != null && this.OutsideHandleColor != null && this.HingeColor != null){
            if(this.failedQuickCheck !== undefined && this.failedQuickCheck == true){
                return Designer.Materials.setHandleFinishColor("#FF0000");
            }
            else{
                //const ralNumber = this.handleColor.toLowerCase().trim().substr(this.handleColor.toLowerCase().trim().length - 4);
                let color = null;
                switch (ralNumber) {
                    case '9016':
                        color = "#f1f0ea";
                        break;
                    case '9005':
                        color = "#0e0e10";
                        break;
                    case '7001':
                        color = "#8c969d";
                        break;
                    case 'inox':
                        color = "#AAAAAA";
                        break;
                    default:
                        color = "#f1f0ea";
                        break;
                }
                return Designer.Materials.setHandleFinishColor(color);
            }
            
        }
        else{
            return Designer.Materials.setHandleFinishColor("#f1f0ea");

        }   
    }


    showVentInfo() {
        this.doorFrameGroup.remove(this.ventInfo);
        this.ventInfo = null;
        let material= new THREE.LineDashedMaterial({
            color: 0xBFBFBF,
            linewidth: 1,
            scale: 1,
            dashSize: 20,
            gapSize: 20,
            name: "dashed",
        });
        switch (this.doorOpeningDirection) {
            case "Inward":
            case 1:
                if(Designer.Renderer.camera.position.z > 0){
                    material = new THREE.LineDashedMaterial({
                        color: 0xBFBFBF,
                        linewidth: 1,
                        scale: 10,
                        dashSize: 100,
                        gapSize: 100,
                        name: "dashed",
                    });
                }
                else{
                    material = new THREE.LineBasicMaterial({
                        name: "solid",
                        color: 0xBFBFBF
                    });
                }
                
                break;
            case "Outward":
            case 2:
                if(Designer.Renderer.camera.position.z > 0){
                    material = new THREE.LineBasicMaterial({
                        name: "solid",
                        color: 0xBFBFBF
                    });
                }
                else{
                    material = new THREE.LineDashedMaterial({
                        color: 0xBFBFBF,
                        linewidth: 1,
                        scale: 10,
                        dashSize: 100,
                        gapSize: 100,
                        name: "dashed",
                    });
                }
                
                break;
        }

        const lineGeometry = new THREE.Geometry();
        const xmin = this.dimensions.xmin + this.doorLeafArticleOutsideWidth;
        const xmax = this.dimensions.xmax - this.doorLeafArticleOutsideWidth;
        const xmid = (this.dimensions.xmax + this.dimensions.xmin) / 2;
        const ymin = this.dimensions.ymin + this.doorSillArticleOutsideWidth;
        const ymax = this.dimensions.ymax - this.doorLeafArticleOutsideWidth;
        const ymid = (this.dimensions.ymax + this.dimensions.ymin) / 2;
        switch (this.doorOperableType) {
            case "Single-Door-Left":
                lineGeometry.vertices.push(
                    new THREE.Vector3(xmax, ymax, 0),
                    new THREE.Vector3(xmin, ymid, 0),
                    new THREE.Vector3(xmin, ymid, 0),
                    new THREE.Vector3(xmax, ymin, 0)
                );
                break;
            case "Single-Door-Right":
                lineGeometry.vertices.push(
                    new THREE.Vector3(xmin, ymax, 0),
                    new THREE.Vector3(xmax, ymid, 0),
                    new THREE.Vector3(xmax, ymid, 0),
                    new THREE.Vector3(xmin, ymin, 0)
                );
                break;
            
            case "Double-Door-Active-Right":
                lineGeometry.vertices.push(

                    new THREE.Vector3(xmin, ymin, 0),
                    new THREE.Vector3(xmid - this.doorLeafArticleOutsideWidth + 20, ymid, 0),
                    new THREE.Vector3(xmid - this.doorLeafArticleOutsideWidth + 20, ymid, 0),
                    new THREE.Vector3(xmin, ymax, 0),

                    new THREE.Vector3(xmax, ymax, 0),
                    new THREE.Vector3(xmid + this.doorPassiveJambArticleOutsideWidth , ymid, 0),
                    new THREE.Vector3(xmid + this.doorPassiveJambArticleOutsideWidth , ymid, 0),
                    new THREE.Vector3(xmax, ymin, 0),

                );
                break;
            case "Double-Door-Active-Left":
                lineGeometry.vertices.push(
                    new THREE.Vector3(xmin, ymin, 0),
                    new THREE.Vector3(xmid - this.doorPassiveJambArticleOutsideWidth, ymid, 0),
                    new THREE.Vector3(xmid - this.doorPassiveJambArticleOutsideWidth, ymid, 0),
                    new THREE.Vector3(xmin, ymax, 0),

                    new THREE.Vector3(xmax, ymax, 0),
                    new THREE.Vector3(xmid + this.doorLeafArticleOutsideWidth- 20, ymid, 0),
                    new THREE.Vector3(xmid + this.doorLeafArticleOutsideWidth- 20, ymid, 0),
                    new THREE.Vector3(xmax, ymin, 0),
                );
                break;

            
        }

        //lineGeometry.computeLineDistances();
        const lineMesh = new THREE.LineSegments(lineGeometry, material);
        lineMesh.computeLineDistances();
        lineMesh.position.z = Designer.Renderer.camera.position.z > 0? 40 : -40; 
        this.ventInfo = lineMesh;
        this.doorFrameGroup.add(this.ventInfo);
    }

    hideVentInfo() {
        this.doorFrameGroup.remove(this.ventInfo);
        this.ventInfo = null;
    }
}