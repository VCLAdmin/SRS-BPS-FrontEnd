
/**
 * This class Generates a Door Frame on an infill
 * */

class DesignerSlidingDoorFrame {

    constructor(settings) {

        this.dimensions = settings.dimensions;
        this.ventFrames = settings.doorSystem.VentFrames;
        this.ventArticleName = settings.ventArticleName;
        this.infillID = settings.infillID;
        this.doorSystemID = settings.doorSystem.DoorSystemID;
        this.doorOpeningDirection = settings.DoorOpeningDirection;
        this.doorOperableType = settings.DoorOperableType;

        this.InsideHandleColor = settings.doorSystem.InsideHandleColor;
        this.InsideHandleArticleName = settings.doorSystem.InsideHandleArticleName;
        this.insidehandleMaterial = null;

        this.OutsideHandleColor = settings.doorSystem.OutsideHandleColor;
        this.OutsideHandleArticleName = settings.doorSystem.OutsideHandleArticleName;
        this.interlockReinforcement = settings.doorSystem.InterlockReinforcement;
        this.outsidehandleMaterial = null;

        this.sideLightSills = [];
        this.doorLeafArticle = null;
        this.doorThresholdArticle = null;
        this.doorLeafArticleInsideWidth = 0;
        this.doorLeafArticleOutsideWidth = 0;
        this.ventFramePoints = [];

        this.name = `infill_${this.infillID}__door_frame`;

        this.handlePosition = 1050;
        this.doorFrameGroup = new THREE.Group();
        
        this.insideHandle = null;
        this.outsideHandle = null;
        this.keyLock = null;
        this.doorInfo = null;

        this.subtypes = new DesignerSubType();
        this.init();
    }

    init() {
        this.doorVentArticle = this.readArticleProperties(this.ventArticleName);
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
        
        // dimensions.xmin += parseInt(this.doorVentArticle.insideWidth);
        // dimensions.ymin += parseInt(this.doorVentArticle.insideWidth);
        // dimensions.xmax -= parseInt(this.doorVentArticle.insideWidth);
        // dimensions.ymax -= parseInt(this.doorVentArticle.insideWidth);
        return {
            xmin: dimensions.xmin +  parseInt(this.doorVentArticle.insideWidth), 
            xmax: dimensions.xmax -  parseInt(this.doorVentArticle.insideWidth),
            ymin: dimensions.ymin +  parseInt(this.doorVentArticle.insideWidth),
            ymax: dimensions.ymax -  parseInt(this.doorVentArticle.insideWidth)
        };
    }

    generateDoorFrameExtrusion(){
        let dimensions = this.dimensions;
        this.doorFrameGroup = new THREE.Group();
        let CoverCap = new THREE.BoxGeometry(20,(dimensions.ymax - dimensions.ymin), this.doorVentArticle.depth);
        //draw door leaf
        let doorVentArticle = this.doorVentArticle;
        let xOffset = 0; 
        // let bbb = new THREE.Mesh(new THREE.BoxGeometry(1500,250,250), new THREE.MeshBasicMaterial({color:0xFF00FF}));
        // let bbb4 = new THREE.Mesh(new THREE.BoxGeometry(1500,250,250), new THREE.MeshBasicMaterial({color:0x0000FF}));
        // let bbb6 = new THREE.Mesh(new THREE.BoxGeometry(1500,250,250), new THREE.MeshBasicMaterial({color:0xFF00FF}));
        // let bbb2 = new THREE.Mesh(new THREE.BoxGeometry(1500,250,250), new THREE.MeshBasicMaterial({color:0x0000FF}));
        // let bbb3 = new THREE.Mesh(new THREE.BoxGeometry(1500,250,250), new THREE.MeshBasicMaterial({color:0xFF00FF}));
        // let bbb5 = new THREE.Mesh(new THREE.BoxGeometry(1500,250,250), new THREE.MeshBasicMaterial({color:0x0000FF}));
        let passedMidPoint = false;
        // bbb.position.x += 750;
        // bbb2.position.x += 1500+750;
        // bbb3.position.x += 3000+750;
        // bbb4.position.x += 4500+750;
        // bbb5.position.x += 6000+750;
        // bbb6.position.x += 7500+750;
        // bbb.position.z += 250;
        // bbb2.position.z += 250;
        // bbb3.position.z += 250;
        // bbb4.position.z += 250;
        // bbb5.position.z += 250;
        // bbb6.position.z += 250;
        // Designer.Scene.scene.add(bbb);
        // Designer.Scene.scene.add(bbb2);
        // Designer.Scene.scene.add(bbb3);
        // Designer.Scene.scene.add(bbb4);
        // Designer.Scene.scene.add(bbb5);
        // Designer.Scene.scene.add(bbb6);
        for(let i = 0; i < this.ventFrames.length; i++)
        {
            let points = null;
            if(i == 0){
                points = [
                    new THREE.Vector2(0 + this.ventFrames[i].Width -20 + ((parseInt(this.doorVentArticle.outsideWidth) + 20) / 2), dimensions.ymax), 
                    new THREE.Vector2(0 + this.ventFrames[i].Width -20 + ((parseInt(this.doorVentArticle.outsideWidth) + 20) / 2), dimensions.ymin),
                    new THREE.Vector2(dimensions.xmin - 8, dimensions.ymin),
                    new THREE.Vector2(dimensions.xmin - 8, dimensions.ymax)
                ];
                let CapMaterial = Designer.Materials.materials["DetailsAluminium"];
                let CoverCapMesh = new THREE.Mesh(CoverCap,CapMaterial );
                CoverCapMesh.position.set(this.ventFrames[i].Width - 10 + ((parseInt(this.doorVentArticle.outsideWidth) + 20) / 2), 
                                        dimensions.ymin + (dimensions.ymax - dimensions.ymin)/2, 
                                        -(parseInt(this.doorVentArticle.depth)/2 + (parseInt(this.ventFrames[i].Track) -1) * (parseInt(this.doorVentArticle.depth) + 20)));
                CoverCapMesh.userData.originalMaterial = CapMaterial;
                CoverCapMesh.subtype = this.subtypes.doorFrame;
                this.doorFrameGroup.add(CoverCapMesh);
                this.ventFramePoints.push({x1: points[2].x, x2: points[0].x, z: (parseInt(this.ventFrames[i].Track) -1) * (parseInt(this.doorVentArticle.depth) + 20)});
            }
            else if (i != this.ventFrames.length - 1 && this.ventFrames[i].Track == this.ventFrames[i+1].Track){
                passedMidPoint = true;
                points = [
                    new THREE.Vector2(xOffset + this.ventFrames[i].Width -4, dimensions.ymax), 
                    new THREE.Vector2(xOffset + this.ventFrames[i].Width -4, dimensions.ymin),
                    new THREE.Vector2(xOffset +20 - ((parseInt(this.doorVentArticle.outsideWidth) + 20) / 2), dimensions.ymin),
                    new THREE.Vector2(xOffset +20 - ((parseInt(this.doorVentArticle.outsideWidth) + 20) / 2), dimensions.ymax)
                ]
                let CapMaterial = Designer.Materials.materials["DetailsAluminium"];
                let CoverCapMesh2 = new THREE.Mesh(CoverCap,CapMaterial);
                CoverCapMesh2.position.set(xOffset + 10 - ((parseInt(this.doorVentArticle.outsideWidth) + 20) / 2), 
                                        dimensions.ymin + (dimensions.ymax - dimensions.ymin)/2, 
                                        -(parseInt(this.doorVentArticle.depth)/2 + (parseInt(this.ventFrames[i].Track) -1) * (parseInt(this.doorVentArticle.depth) + 20)));
                CoverCapMesh2.userData.originalMaterial = CapMaterial;
                CoverCapMesh2.subtype = this.subtypes.doorFrame;
                this.doorFrameGroup.add(CoverCapMesh2);
                this.ventFramePoints.push({x1: points[2].x, x2: points[0].x, z: (parseInt(this.ventFrames[i].Track) -1) * (parseInt(this.doorVentArticle.depth) + 20)});

            }
            else if (i == (this.ventFrames.length -1)){
                points = [
                    new THREE.Vector2(this.dimensions.xmax + 8, dimensions.ymax), 
                    new THREE.Vector2(this.dimensions.xmax + 8, dimensions.ymin),
                    new THREE.Vector2(xOffset +20 - ((parseInt(this.doorVentArticle.outsideWidth) + 20) / 2), dimensions.ymin),
                    new THREE.Vector2(xOffset +20 - ((parseInt(this.doorVentArticle.outsideWidth) + 20) / 2), dimensions.ymax)
                ]
                let CapMaterial = Designer.Materials.materials["DetailsAluminium"];
                let CoverCapMesh2 = new THREE.Mesh(CoverCap,CapMaterial);
                CoverCapMesh2.position.set(xOffset + 10 - ((parseInt(this.doorVentArticle.outsideWidth) + 20) / 2), 
                                        dimensions.ymin + (dimensions.ymax - dimensions.ymin)/2,
                                        -(parseInt(this.doorVentArticle.depth)/2 + (parseInt(this.ventFrames[i].Track) -1) * (parseInt(this.doorVentArticle.depth) + 20)));
                CoverCapMesh2.userData.originalMaterial = CapMaterial;
                CoverCapMesh2.subtype = this.subtypes.doorFrame;
                this.doorFrameGroup.add(CoverCapMesh2);
                this.ventFramePoints.push({x1: points[2].x, x2: points[0].x, z: (parseInt(this.ventFrames[i].Track) -1) * (parseInt(this.doorVentArticle.depth) + 20)});

            }
            else if (passedMidPoint){
                passedMidPoint = false;
                points = [
                    new THREE.Vector2(xOffset + this.ventFrames[i].Width -20 + ((parseInt(this.doorVentArticle.outsideWidth) + 20) / 2), dimensions.ymax), 
                    new THREE.Vector2(xOffset + this.ventFrames[i].Width -20 + ((parseInt(this.doorVentArticle.outsideWidth) + 20) / 2), dimensions.ymin),
                    new THREE.Vector2(xOffset +4, dimensions.ymin),
                    new THREE.Vector2(xOffset +4, dimensions.ymax)
                ]
                let CapMaterial = Designer.Materials.materials["DetailsAluminium"];
                let CoverCapMesh = new THREE.Mesh(CoverCap,CapMaterial );
                CoverCapMesh.position.set(xOffset +this.ventFrames[i].Width - 10 + ((parseInt(this.doorVentArticle.outsideWidth) + 20) / 2), 
                                        dimensions.ymin + (dimensions.ymax - dimensions.ymin)/2,
                                        -(parseInt(this.doorVentArticle.depth)/2 + (parseInt(this.ventFrames[i].Track) -1) * (parseInt(this.doorVentArticle.depth) + 20)));
                CoverCapMesh.userData.originalMaterial = CapMaterial;
                CoverCapMesh.subtype = this.subtypes.doorFrame;
                
                let MiddlePiece = new THREE.BoxGeometry(16,(dimensions.ymax - dimensions.ymin), this.doorVentArticle.depth - 21);
                let MiddlePieceMesh = new THREE.Mesh(MiddlePiece,CapMaterial );
                MiddlePieceMesh.position.set(xOffset +4, 
                                        dimensions.ymin + (dimensions.ymax - dimensions.ymin)/2,
                                        -(parseInt(this.ventFrames[i].Track) -1) * (parseInt(this.doorVentArticle.depth) + 20) - 30);
                MiddlePieceMesh.userData.originalMaterial = CapMaterial;
                MiddlePieceMesh.subtype = this.subtypes.doorFrame;
                
                this.doorFrameGroup.add(CoverCapMesh);
                this.doorFrameGroup.add(MiddlePieceMesh);
                this.ventFramePoints.push({x1: points[2].x, x2: points[0].x, z: (parseInt(this.ventFrames[i].Track) -1) * (parseInt(this.doorVentArticle.depth) + 20)});

            }
            else{
                points = [
                    new THREE.Vector2(xOffset + this.ventFrames[i].Width -20 + ((parseInt(this.doorVentArticle.outsideWidth) + 20) / 2), dimensions.ymax), 
                    new THREE.Vector2(xOffset + this.ventFrames[i].Width -20 + ((parseInt(this.doorVentArticle.outsideWidth) + 20) / 2), dimensions.ymin),
                    new THREE.Vector2(xOffset +20 - ((parseInt(this.doorVentArticle.outsideWidth) + 20) / 2), dimensions.ymin),
                    new THREE.Vector2(xOffset +20 - ((parseInt(this.doorVentArticle.outsideWidth) + 20) / 2), dimensions.ymax)
                ]
                let CapMaterial = Designer.Materials.materials["DetailsAluminium"];
                let CoverCapMesh = new THREE.Mesh(CoverCap,CapMaterial );
                CoverCapMesh.position.set(xOffset +this.ventFrames[i].Width - 10 + ((parseInt(this.doorVentArticle.outsideWidth) + 20) / 2), 
                                        dimensions.ymin + (dimensions.ymax - dimensions.ymin)/2,
                                        -(parseInt(this.doorVentArticle.depth)/2 + (parseInt(this.ventFrames[i].Track) -1) * (parseInt(this.doorVentArticle.depth) + 20)));
                CoverCapMesh.userData.originalMaterial = CapMaterial;
                CoverCapMesh.subtype = this.subtypes.doorFrame;
                this.doorFrameGroup.add(CoverCapMesh);

                let CoverCapMesh2 = new THREE.Mesh(CoverCap,CapMaterial);
                CoverCapMesh2.position.set(xOffset + 10 - ((parseInt(this.doorVentArticle.outsideWidth) + 20) / 2), 
                                        dimensions.ymin + (dimensions.ymax - dimensions.ymin)/2,
                                        -(parseInt(this.doorVentArticle.depth)/2 + (parseInt(this.ventFrames[i].Track) -1) * (parseInt(this.doorVentArticle.depth) + 20)));
                CoverCapMesh2.userData.originalMaterial = CapMaterial;
                CoverCapMesh2.subtype = this.subtypes.doorFrame;
                this.doorFrameGroup.add(CoverCapMesh2);
                this.ventFramePoints.push({x1: points[2].x, x2: points[0].x, z: (parseInt(this.ventFrames[i].Track) -1) * (parseInt(this.doorVentArticle.depth) + 20)});

            }
            for (var j in doorVentArticle.shapes) {
                //extrude active leaf profiles  
                let shape = doorVentArticle.shapes[j];
                shape.useMaterial = "VentFrameAluminium";
                

                let shapeGeometry = new THREE.ProfiledContourGeometry({
                    shape: shape,
                    points: points,
                    closed: true,
                    capped: false
                });
                
                let shapeMaterial = Designer.Materials.setMaterial(shape);
                let shapeMesh = new THREE.Mesh(shapeGeometry, shapeMaterial);
                shapeMesh.position.z -= (parseInt(this.ventFrames[i].Track) -1) * (parseInt(this.doorVentArticle.depth) + 20);
                shapeMesh.userData.originalMaterial = shapeMaterial;
                shapeMesh.subtype = this.subtypes.doorFrame;
                this.doorFrameGroup.add(shapeMesh);
                
            }
            
            xOffset +=(this.ventFrames[i].Width);
                    
        }
        if(this.InsideHandleColor != null){
            this.insidehandleMaterial = this.setHandleColor(this.InsideHandleColor.toLowerCase().trim().substr(this.InsideHandleColor.toLowerCase().trim().length - 4));
        }
        else{
            this.insidehandleMaterial = this.setHandleColor(this.InsideHandleColor);
        }
        if(this.OutsideHandleColor != null){
            this.outsidehandleMaterial = this.setHandleColor(this.OutsideHandleColor.toLowerCase().trim().substr(this.OutsideHandleColor.toLowerCase().trim().length - 4));
        }
        else{
            this.outsidehandleMaterial = this.setHandleColor(this.OutsideHandleColor);
        }

        if(this.dimensions.ymax >= 1200){
            this.onAddHandle(this.doorFrameGroup);
            this.onAddHandleRecess(this.doorFrameGroup);
        }
        if(this.interlockReinforcement)
        {
            let ReinforcementBlock = new THREE.BoxGeometry(
                    this.doorVentArticle.insideWidth/2,(dimensions.ymax - dimensions.ymin) - 40 , this.doorVentArticle.depth 
            );
            let shapeMaterial = Designer.Materials.materials["DetailsAluminium"];
            shapeMaterial.roughnessMap = null;
            let sum = 0;
            for (let i = 0; i < this.ventFrames.length; i++){
                sum += this.ventFrames[i].Width;
                if(i != this.ventFrames.length -1){
                    if(this.ventFrames[i].Track != this.ventFrames[i+1].Track){
                        if( this.ventFrames[i].Track < this.ventFrames[i+1].Track){
                            let ReinforcementBlockMesh = new THREE.Mesh(ReinforcementBlock, shapeMaterial);
                            ReinforcementBlockMesh.position.x = sum;
                            ReinforcementBlockMesh.position.y =  dimensions.ymin + (dimensions.ymax - dimensions.ymin)/2;
                            ReinforcementBlockMesh.position.z -= (parseInt(this.ventFrames[i].Track) -1) * (parseInt(this.doorVentArticle.depth) + 20);
                            ReinforcementBlockMesh.userData.originalMaterial = shapeMaterial;
                            ReinforcementBlockMesh.subtype = this.subtypes.doorFrame;
                            this.doorFrameGroup.add(ReinforcementBlockMesh);
        
                            let ReinforcementBlockMesh2 = new THREE.Mesh(ReinforcementBlock, shapeMaterial);
                            ReinforcementBlockMesh2.position.x = sum;
                            ReinforcementBlockMesh2.position.y =  dimensions.ymin + (dimensions.ymax - dimensions.ymin)/2;
                            ReinforcementBlockMesh2.position.z -= (parseInt(this.ventFrames[i].Track) +1) * (parseInt(this.doorVentArticle.depth) + 10);
                            ReinforcementBlockMesh2.userData.originalMaterial = shapeMaterial;
                            ReinforcementBlockMesh2.subtype = this.subtypes.doorFrame;
                            this.doorFrameGroup.add(ReinforcementBlockMesh2);
                        }
                        else{
                            let ReinforcementBlockMesh = new THREE.Mesh(ReinforcementBlock, shapeMaterial);
                            ReinforcementBlockMesh.position.x = sum;
                            ReinforcementBlockMesh.position.y =  dimensions.ymin + (dimensions.ymax - dimensions.ymin)/2;
                            ReinforcementBlockMesh.position.z -= (parseInt(this.ventFrames[i].Track)) * (parseInt(this.doorVentArticle.depth) + 10);
                            ReinforcementBlockMesh.userData.originalMaterial = shapeMaterial;
                            ReinforcementBlockMesh.subtype = this.subtypes.doorFrame;
                            this.doorFrameGroup.add(ReinforcementBlockMesh);
                            
                            let ReinforcementBlockMesh2 = new THREE.Mesh(ReinforcementBlock, shapeMaterial);
                            ReinforcementBlockMesh2.position.x = sum;
                            ReinforcementBlockMesh2.position.y =  dimensions.ymin + (dimensions.ymax - dimensions.ymin)/2;
                            ReinforcementBlockMesh2.position.z -= (parseInt(this.ventFrames[i].Track) -2) * (parseInt(this.doorVentArticle.depth) + 20);
                            ReinforcementBlockMesh2.userData.originalMaterial = shapeMaterial;
                            ReinforcementBlockMesh2.subtype = this.subtypes.doorFrame;
                            this.doorFrameGroup.add(ReinforcementBlockMesh2);
                        }
                    }
                    else{
                        let ReinforcementBlockMesh = new THREE.Mesh(ReinforcementBlock, shapeMaterial);
                        ReinforcementBlockMesh.position.x = sum - 39;
                        ReinforcementBlockMesh.position.y =  dimensions.ymin + (dimensions.ymax - dimensions.ymin)/2;
                        ReinforcementBlockMesh.position.z -= (parseInt(this.ventFrames[i].Track - 1)) * (parseInt(this.doorVentArticle.depth) + 20);
                        ReinforcementBlockMesh.userData.originalMaterial = shapeMaterial;
                        ReinforcementBlockMesh.subtype = this.subtypes.doorFrame;
                        this.doorFrameGroup.add(ReinforcementBlockMesh);
        
                        let ReinforcementBlockMesh2 = new THREE.Mesh(ReinforcementBlock, shapeMaterial);
                        ReinforcementBlockMesh2.position.x = sum + 39;
                        ReinforcementBlockMesh2.position.y =  dimensions.ymin + (dimensions.ymax - dimensions.ymin)/2;
                        ReinforcementBlockMesh2.position.z -= (parseInt(this.ventFrames[i].Track - 1)) * (parseInt(this.doorVentArticle.depth) + 20);
                        ReinforcementBlockMesh2.userData.originalMaterial = shapeMaterial;
                        ReinforcementBlockMesh2.subtype = this.subtypes.doorFrame;
                        this.doorFrameGroup.add(ReinforcementBlockMesh2);
                    }
                    
                    
                }
                
            }
        }
        this.doorFrameGroup.subtype = this.subtypes.slidingDoorFrame;
        this.doorFrameGroup.name = this.name;
        return this.doorFrameGroup;
    }
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    onAddHandle = async(doorFrameGroup) =>{
        //inside handle 
        while(Designer.Materials.ASEhandleOBJ == null){
            await new Promise(r => setTimeout(r, 500));
        }           
        let handleOBJ = Designer.Materials.ASEhandleOBJ.clone();
        let handleOBJ2 = null;
        this.insideHandle = handleOBJ;
        if(this.doorOperableType == "SlidingDoor-Type-2A-Left" || this.doorOperableType == "SlidingDoor-Type-2A-Right" || 
            this.doorOperableType == "SlidingDoor-Type-3E-Left" || this.doorOperableType == "SlidingDoor-Type-3E-Right" || 
            this.doorOperableType == "SlidingDoor-Type-3F" || this.doorOperableType == "SlidingDoor-Type-2D1.i"){
            handleOBJ2 = Designer.Materials.ASEhandleOBJ.clone();
            this.insideHandle2 = handleOBJ2;
            handleOBJ2.traverse((child) => {
                child.material = this.insidehandleMaterial;
                child.userData.originalMaterial = this.insidehandleMaterial;
                this.insideHandle.ventFrame = this;
                this.insideHandle.subtype = this.subtypes.insideHandle;
            });
        }
        handleOBJ.traverse((child) => {
            child.material = this.insidehandleMaterial;
            child.userData.originalMaterial = this.insidehandleMaterial;
        });
        this.insideHandle.ventFrame = this;
        this.insideHandle.subtype = this.subtypes.insideHandle;
        let bbox = new THREE.Box3().setFromObject(doorFrameGroup);
        let handleBoundingBox = new THREE.Box3().setFromObject(handleOBJ);
        let handleHeight = new THREE.Vector3();
        handleBoundingBox.getSize(handleHeight);
        handleOBJ.position.z = bbox.min.z;
        if(handleOBJ2 != null) handleOBJ2.position.z = bbox.min.z;
        switch(this.doorOperableType)
        {
            case "SlidingDoor-Type-3F":
            case "SlidingDoor-Type-2D1.i":    
                let sum = 0;
                for(let i = 0; i < this.ventFrames.length; i++){
                    sum += this.ventFrames[i].Width;
                    if(i+1 < this.ventFrames.length && 
                        this.ventFrames[i].Track == this.ventFrames[i+1].Track){
                        handleOBJ.position.x = sum - 4 - this.doorVentArticle.insideWidth/2;
                        handleOBJ2.position.x = sum +4 + this.doorVentArticle.insideWidth/2;
                    }
                }
                break;

            case "SlidingDoor-Type-2A-Left":
                handleOBJ.position.x = this.dimensions.xmax - this.doorVentArticle.insideWidth/2;
                handleOBJ2.position.x = this.dimensions.xmin + this.doorVentArticle.insideWidth/2;
                handleOBJ2.position.z = 20 + (parseInt(this.ventFrames[0].Track) -2) * (parseInt(this.doorVentArticle.depth) + 20)
                break;

            case "SlidingDoor-Type-2A1.i-Left":
        
                handleOBJ.position.x = this.dimensions.xmax - this.doorVentArticle.insideWidth/2;
                break;

            case "SlidingDoor-Type-2A-Right":
                handleOBJ.position.x = this.dimensions.xmin + this.doorVentArticle.insideWidth/2;
                handleOBJ2.position.x = this.dimensions.xmax - this.doorVentArticle.insideWidth/2;
                handleOBJ2.position.z = 20 + (parseInt(this.ventFrames[0].Track) -3) * (parseInt(this.doorVentArticle.depth) + 20)
                break;

            case "SlidingDoor-Type-2A1.i-Right":
                handleOBJ.position.x = this.dimensions.xmin + this.doorVentArticle.insideWidth/2;
                break;

            case "SlidingDoor-Type-3E-Left":
                handleOBJ.position.x = this.dimensions.xmax - this.doorVentArticle.insideWidth/2;
                handleOBJ2.position.x = this.dimensions.xmin + this.doorVentArticle.insideWidth/2;
                handleOBJ2.position.z = 20 + (parseInt(this.ventFrames[0].Track) -2) * (parseInt(this.doorVentArticle.depth) + 20)
                break;

            case "SlidingDoor-Type-3E-Right":
                handleOBJ.position.x = this.dimensions.xmin + this.doorVentArticle.insideWidth/2;
                handleOBJ2.position.x = this.dimensions.xmax - this.doorVentArticle.insideWidth/2;
                handleOBJ2.position.z = 20 +(parseInt(this.ventFrames[0].Track) -2) * (parseInt(this.doorVentArticle.depth) + 20)
                break;

            case "SlidingDoor-Type-3E1-Right":
                handleOBJ.position.x = this.dimensions.xmin + this.doorVentArticle.insideWidth/2;

                break;
            case "SlidingDoor-Type-3E1-Left":
                handleOBJ.position.x = this.dimensions.xmax - this.doorVentArticle.insideWidth/2;

                break;
            
            
        }
        
        handleOBJ.position.y = 1007;
        doorFrameGroup.add(handleOBJ);
        if(handleOBJ2 != null){
            handleOBJ2.position.y = 1007;
            doorFrameGroup.add(handleOBJ2);
        }

        
    }
    onAddHandleRecess = async(doorFrameGroup) =>{
        
        if((!this.doorOperableType.includes("Left") && !this.doorOperableType.includes("Right") && this.interlockReinforcement)) return;
        //inside handle            
        while(Designer.Materials.ASEhandleRecessOBJ == null){
            await new Promise(r => setTimeout(r, 500));
        }  
        let handleRecessOBJ = Designer.Materials.ASEhandleRecessOBJ.clone();
        let handleRecessOBJ2 = null;
        this.handleRecess = handleRecessOBJ;
        if(this.doorOperableType == "SlidingDoor-Type-2A-Left" || this.doorOperableType == "SlidingDoor-Type-2A-Right" || 
            this.doorOperableType == "SlidingDoor-Type-3E-Left" || this.doorOperableType == "SlidingDoor-Type-3E-Right" || 
            this.doorOperableType == "SlidingDoor-Type-3F" || this.doorOperableType == "SlidingDoor-Type-2D1.i"){
            handleRecessOBJ2 = Designer.Materials.ASEhandleRecessOBJ.clone();
            this.handleRecess2 = handleRecessOBJ2;
            handleRecessOBJ2.traverse((child) => {
                child.material = this.outsidehandleMaterial;
                child.userData.originalMaterial = this.outsidehandleMaterial;
                this.handleRecess2.ventFrame = this;
                this.handleRecess2.subtype = this.subtypes.outsideHandle;
            });
        }
        handleRecessOBJ.traverse((child) => {
            child.material = this.outsidehandleMaterial;
            child.userData.originalMaterial = this.outsidehandleMaterial;
        });
        this.handleRecess.ventFrame = this;
        this.handleRecess.subtype = this.subtypes.outsideHandle;
        let bbox = new THREE.Box3().setFromObject(doorFrameGroup);
        let handleBoundingBox = new THREE.Box3().setFromObject(handleRecessOBJ);
        let handleHeight = new THREE.Vector3();
        handleBoundingBox.getSize(handleHeight);
       
        if(handleRecessOBJ2 != null) handleRecessOBJ2.position.z = bbox.max.z;
        switch(this.doorOperableType)
        {
            case "SlidingDoor-Type-3F":
            case "SlidingDoor-Type-2D1.i":    
                let sum = 0;
                for(let i = 0; i < this.ventFrames.length; i++){
                    sum += this.ventFrames[i].Width;
                    if(i+1 < this.ventFrames.length && 
                        this.ventFrames[i].Track == this.ventFrames[i+1].Track){
                        handleRecessOBJ.position.x = sum - 4 - this.doorVentArticle.insideWidth/2;
                        handleRecessOBJ2.position.x = sum +4 + this.doorVentArticle.insideWidth/2;
                        handleRecessOBJ.position.z = (parseInt(this.doorVentArticle.depth)) - ( parseInt(this.ventFrames[i].Track) * (parseInt(this.doorVentArticle.depth) + 20)) + 20;
                        handleRecessOBJ2.position.z = (parseInt(this.doorVentArticle.depth)) - (parseInt(this.ventFrames[i].Track) * (parseInt(this.doorVentArticle.depth) + 20)) + 20;
                    }
                }
                break;
            case "SlidingDoor-Type-2A-Left":
                handleRecessOBJ.position.z = (parseInt(this.doorVentArticle.depth)) - ( 2 * (parseInt(this.doorVentArticle.depth) + 20)) + 20;
                handleRecessOBJ.position.x = this.dimensions.xmax - this.doorVentArticle.insideWidth/2;
                handleRecessOBJ2.position.x = this.dimensions.xmin + this.doorVentArticle.insideWidth/2;
                handleRecessOBJ2.position.z = 0;
                break;
            case "SlidingDoor-Type-2A1.i-Left":
                handleRecessOBJ.position.z = (parseInt(this.doorVentArticle.depth)) - ( 2 * (parseInt(this.doorVentArticle.depth) + 20)) + 20;
                handleRecessOBJ.position.x = this.dimensions.xmax - this.doorVentArticle.insideWidth/2;
                break;
            case "SlidingDoor-Type-2A-Right":
                handleRecessOBJ.position.x = this.dimensions.xmin + this.doorVentArticle.insideWidth/2;
                handleRecessOBJ.position.z = (parseInt(this.doorVentArticle.depth)) - ( 2 * (parseInt(this.doorVentArticle.depth) + 20)) + 20;
                handleRecessOBJ2.position.x = this.dimensions.xmax - this.doorVentArticle.insideWidth/2;
                handleRecessOBJ2.position.z = 0;
                break;
            case "SlidingDoor-Type-2A1.i-Right":
                handleRecessOBJ.position.x = this.dimensions.xmin + this.doorVentArticle.insideWidth/2;
                handleRecessOBJ.position.z = (parseInt(this.doorVentArticle.depth)) - ( 2 * (parseInt(this.doorVentArticle.depth) + 20)) + 20;
                break;

            case "SlidingDoor-Type-3E-Left":
                handleRecessOBJ.position.z = (parseInt(this.doorVentArticle.depth)) - ( 3 * (parseInt(this.doorVentArticle.depth) + 20)) + 20;
                handleRecessOBJ.position.x = this.dimensions.xmax - this.doorVentArticle.insideWidth/2;

                handleRecessOBJ2.position.x = this.dimensions.xmin + this.doorVentArticle.insideWidth/2;
                handleRecessOBJ2.position.z = 0;
                break;
            case "SlidingDoor-Type-3E-Right":
                handleRecessOBJ.position.x = this.dimensions.xmin + this.doorVentArticle.insideWidth/2;
                handleRecessOBJ.position.z = (parseInt(this.doorVentArticle.depth)) - ( 3 * (parseInt(this.doorVentArticle.depth) + 20)) + 20;

                handleRecessOBJ2.position.x = this.dimensions.xmax - this.doorVentArticle.insideWidth/2;
                handleRecessOBJ2.position.z = 0;
                break;
            case "SlidingDoor-Type-3E1-Right":
                handleRecessOBJ.position.x = this.dimensions.xmin + this.doorVentArticle.insideWidth/2;
                handleRecessOBJ.position.z = (parseInt(this.doorVentArticle.depth)) - ( 3 * (parseInt(this.doorVentArticle.depth) + 20)) + 20;

                break;
            case "SlidingDoor-Type-3E1-Left":
                handleRecessOBJ.position.x = this.dimensions.xmax - this.doorVentArticle.insideWidth/2;
                handleRecessOBJ.position.z = (parseInt(this.doorVentArticle.depth)) - ( 3 * (parseInt(this.doorVentArticle.depth) + 20)) + 20;

                break;
            
            
        }
        handleRecessOBJ.position.y = 1007;
        doorFrameGroup.add(handleRecessOBJ);
        if(handleRecessOBJ2 != null){
            handleRecessOBJ2.position.y = 1007;
            doorFrameGroup.add(handleRecessOBJ2);
        }
    }

    onAddKeyLock() {
        this.keyLock.position.set(this.outsideHandle.position.x, this.outsideHandle.position.y, this.outsideHandle.position.z);
        this.keyLock.scale.z = -0.9;
    }
    
    setHandleColor(ralNumber) {
        if(this.InsideHandleColor != null){
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
                    case '9010':
                        color = "#ffffcc";
                        break;
                    case 'inox':
                        color = "#AAAAAA";
                        break;
                    default:
                        color = "#F3F0EB";
                        break;
                }
                return Designer.Materials.setHandleFinishColor(color);
            }
            
        }
        else{
            return Designer.Materials.setHandleFinishColor("#F3F0EB");

        }   
    }

    showVentInfo() {
        this.doorFrameGroup.remove(this.ventInfo);
        this.ventInfo = null;
        let materialGreen = new THREE.LineBasicMaterial({
            name: "solid",
            color: 0x00FF00,
            linewidth: 100, 
            side: THREE.DoubleSide
        });
        let materialRed = new THREE.LineBasicMaterial({
            name: "solid",
            color: 0xFF0000,
            linewidth: 100,
            side: THREE.DoubleSide
        });
        const lineGeometries = new THREE.Group();
        const ymin = this.dimensions.ymin + this.doorSillArticleOutsideWidth;
        const ymax = this.dimensions.ymax - this.doorLeafArticleOutsideWidth;
        const ymid = this.dimensions.ymax < 1000? -100 + (this.dimensions.ymax + this.dimensions.ymin) / 2 : 200+ (this.dimensions.ymax + this.dimensions.ymin) / 2;
        let bbox = new THREE.Box3().setFromObject(this.doorFrameGroup);
        for(let i = 0; i < this.ventFramePoints.length; i++)
        {
            if(this.ventFrames[i].Type == "Sliding"){
                let shapeGeo = new THREE.Shape();
                let isRight = true;
                if((i == 0 ) || 
                    (this.doorOperableType == "SlidingDoor-Type-3E-Right" && i ==1) || 
                    (this.doorOperableType == "SlidingDoor-Type-2D1.i" && i == 2) || 
                    (this.doorOperableType == "SlidingDoor-Type-3F" && (i == 3 || i ==4)) || 
                    (this.doorOperableType == "SlidingDoor-Type-3E1-Right")){
                        isRight = false
                }
                if(!isRight){
                    shapeGeo.moveTo(-10 + this.ventFramePoints[i].x1 + ((this.ventFramePoints[i].x2 - this.ventFramePoints[i].x1)/2), ymid);
                    shapeGeo.lineTo(-10 + this.ventFramePoints[i].x1 + ((this.ventFramePoints[i].x2 - this.ventFramePoints[i].x1)/2), ymid + 250);
                    shapeGeo.lineTo(200 + this.ventFramePoints[i].x1 + ((this.ventFramePoints[i].x2 - this.ventFramePoints[i].x1)/2), ymid + 250);
                    shapeGeo.lineTo(200 + this.ventFramePoints[i].x1 + ((this.ventFramePoints[i].x2 - this.ventFramePoints[i].x1)/2), ymid + 290);
                    shapeGeo.lineTo(286 + this.ventFramePoints[i].x1 + ((this.ventFramePoints[i].x2 - this.ventFramePoints[i].x1)/2), ymid + 240);
                    shapeGeo.lineTo(200 + this.ventFramePoints[i].x1 + ((this.ventFramePoints[i].x2 - this.ventFramePoints[i].x1)/2), ymid + 200);
                    shapeGeo.lineTo(200 + this.ventFramePoints[i].x1 + ((this.ventFramePoints[i].x2 - this.ventFramePoints[i].x1)/2), ymid + 230);
                    shapeGeo.lineTo(10 + this.ventFramePoints[i].x1 + ((this.ventFramePoints[i].x2 - this.ventFramePoints[i].x1)/2), ymid + 230);
                    shapeGeo.lineTo(10 + this.ventFramePoints[i].x1 + ((this.ventFramePoints[i].x2 - this.ventFramePoints[i].x1)/2), ymid);
                }
                else{
                    shapeGeo.moveTo(30 + this.ventFramePoints[i].x1 + ((this.ventFramePoints[i].x2 - this.ventFramePoints[i].x1)/2), ymid);
                    shapeGeo.lineTo(30 + this.ventFramePoints[i].x1 + ((this.ventFramePoints[i].x2 - this.ventFramePoints[i].x1)/2), ymid + 250);
                    shapeGeo.lineTo(-200 + this.ventFramePoints[i].x1 + ((this.ventFramePoints[i].x2 - this.ventFramePoints[i].x1)/2), ymid + 250);
                    shapeGeo.lineTo(-200 + this.ventFramePoints[i].x1 + ((this.ventFramePoints[i].x2 - this.ventFramePoints[i].x1)/2), ymid + 290);
                    shapeGeo.lineTo(-286 + this.ventFramePoints[i].x1 + ((this.ventFramePoints[i].x2 - this.ventFramePoints[i].x1)/2), ymid + 240);
                    shapeGeo.lineTo(-200 + this.ventFramePoints[i].x1 + ((this.ventFramePoints[i].x2 - this.ventFramePoints[i].x1)/2), ymid + 200);
                    shapeGeo.lineTo(-200 + this.ventFramePoints[i].x1 + ((this.ventFramePoints[i].x2 - this.ventFramePoints[i].x1)/2), ymid + 230);
                    shapeGeo.lineTo(10 + this.ventFramePoints[i].x1 + ((this.ventFramePoints[i].x2 - this.ventFramePoints[i].x1)/2), ymid + 230);
                    shapeGeo.lineTo(10 + this.ventFramePoints[i].x1 + ((this.ventFramePoints[i].x2 - this.ventFramePoints[i].x1)/2), ymid);
                }
                const ShapeGeometry = new THREE.ShapeGeometry(shapeGeo);
                if(Designer.Camera.outside){
                    ShapeGeometry.translate(0,0,1); 
                }else {
                    ShapeGeometry.translate(0,0,bbox.min.z - 20);
                }
                const ShapeMesh = new THREE.Mesh(ShapeGeometry, materialGreen);
                ShapeMesh.userData.clickable = false;
                ShapeMesh.layers.set(3);
                lineGeometries.add(ShapeMesh);

            }
            else{
                let shapeGeo = new THREE.Shape();
                shapeGeo.moveTo(-10 + this.ventFramePoints[i].x1 + ((this.ventFramePoints[i].x2 - this.ventFramePoints[i].x1)/2), ymid);
                shapeGeo.lineTo(-10 + this.ventFramePoints[i].x1 + ((this.ventFramePoints[i].x2 - this.ventFramePoints[i].x1)/2), ymid + 170);
                shapeGeo.lineTo(-180 + this.ventFramePoints[i].x1 + ((this.ventFramePoints[i].x2 - this.ventFramePoints[i].x1)/2), ymid + 170);
                shapeGeo.lineTo(-180 + this.ventFramePoints[i].x1 + ((this.ventFramePoints[i].x2 - this.ventFramePoints[i].x1)/2), ymid + 190);
                shapeGeo.lineTo(-10 + this.ventFramePoints[i].x1 + ((this.ventFramePoints[i].x2 - this.ventFramePoints[i].x1)/2), ymid + 190);
                shapeGeo.lineTo(-10 + this.ventFramePoints[i].x1 + ((this.ventFramePoints[i].x2 - this.ventFramePoints[i].x1)/2), ymid + 360);
                shapeGeo.lineTo(10 + this.ventFramePoints[i].x1 + ((this.ventFramePoints[i].x2 - this.ventFramePoints[i].x1)/2), ymid + 360);
                shapeGeo.lineTo(10 + this.ventFramePoints[i].x1 + ((this.ventFramePoints[i].x2 - this.ventFramePoints[i].x1)/2), ymid + 190);
                shapeGeo.lineTo(180 + this.ventFramePoints[i].x1 + ((this.ventFramePoints[i].x2 - this.ventFramePoints[i].x1)/2), ymid + 190);
                shapeGeo.lineTo(180 + this.ventFramePoints[i].x1 + ((this.ventFramePoints[i].x2 - this.ventFramePoints[i].x1)/2), ymid + 170);
                shapeGeo.lineTo(10 + this.ventFramePoints[i].x1 + ((this.ventFramePoints[i].x2 - this.ventFramePoints[i].x1)/2), ymid + 170);
                shapeGeo.lineTo(10 + this.ventFramePoints[i].x1 + ((this.ventFramePoints[i].x2 - this.ventFramePoints[i].x1)/2), ymid);

                const ShapeGeometry = new THREE.ShapeGeometry(shapeGeo);
                if(Designer.Camera.outside){
                    ShapeGeometry.translate(0,0,1); 
                }else {
                    ShapeGeometry.translate(0,0,bbox.min.z - 20);
                }
                const ShapeMesh = new THREE.Mesh(ShapeGeometry, materialRed);
                ShapeMesh.userData.clickable = false;
                ShapeMesh.layers.set(3);
                lineGeometries.add(ShapeMesh);
            }
        }
        this.ventInfo = lineGeometries;
        lineGeometries.userData.clickable = false;
        this.ventInfo.layers.set(3);

        this.doorFrameGroup.add(this.ventInfo);
    }

    hideVentInfo() {
        this.doorFrameGroup.remove(this.ventInfo);
        this.ventInfo = null;
    }
}