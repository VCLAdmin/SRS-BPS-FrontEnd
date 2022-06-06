class DesignerGlass {

    constructor(settings) {
        this.dimensions = settings.dimensions;  //[xmin, ymin, xmax, ymax]
        this.glazingSystemID = settings.glazingSystemID;
        this.panelSystemID = settings.panelSystemID;
        this.panelThickness = settings.panelThickness;
        this.panelFrontMaterial = settings.panelFrontMaterial;
        this.glassID = settings.glassID;
        this.isVentGlass = settings.isVentGlass;
        this.isDoubleDoor = settings.isDoubleDoor;
        this.slidingDoorSystem = settings.slidingDoorSystem;
        this.slidingDoorVentArticleWidth = settings.slidingDoorVentArticleWidth;
        this.slidingDoorVentFramePoints = settings.slidingDoorVentFramePoints;
        //this.glazingColors = ["#00a2d1", "#005068", "#00a2d1", "#005681", "#06809F", "#445C67"];  // this.glazingColors[0] is for GlazingSystemID=0, transparent glazing color;
        this.glazingColors = ["#00a2d1", "#03151e", "#014691", "#00162a", "#002e3e", "#0f1518"];  // this.glazingColors[0] is for GlazingSystemID=0, transparent glazing color;
        // this.glazingColors = ["0x00a2d1","#00a2d1","#005681","#06809F"];  // this.glazingColors[0] is for GlazingSystemID=0, white glazing color;
        this.color = this.glazingSystemID > 0 ? this.glazingColors[this.glazingSystemID] : this.glazingColors[this.panelSystemID];

        this.name = `glass_${this.glassID}__MainModel`;

        this.glassMesh = null;
        this.glassGroup = null;

        this.panelFrontMesh = null;
        this.panelBackMesh = null;

        this.glassIDLabel = null;


    }

    // main function in class DesignerGlass, to generate glassGroup.
    generateGlass() {
        // create glass/panel group
        const glassGroup = new THREE.Group();
        const subtypes = new DesignerSubType();
        glassGroup.subtype = subtypes.pane;
        glassGroup.name = this.name;
        glassGroup.subtype = subtypes.pane;
        glassGroup.userData.glassID = this.glassID;

        if (this.glazingSystemID >= 0) {
            let shape = new THREE.Shape();
            const dimensions = this.dimensions;
            const extra = 5;  // additional extension to avoid visual gap between glass and members/vent frame

            const material = new THREE.MeshBasicMaterial({
                color: 0x00a2d1,
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.2
            });

            if(this.slidingDoorSystem != null){
                let sum = 0;
                let glassGeometries = [];
                let glassMeshes = new THREE.Group();
                for(let i = 0; i < this.slidingDoorSystem.VentFrames.length; i++){
                    let shape = new THREE.Shape();
                    shape.moveTo(this.slidingDoorVentFramePoints[i].x1 + this.slidingDoorVentArticleWidth + 15, dimensions.ymin - extra);
                    shape.lineTo(this.slidingDoorVentFramePoints[i].x1 + this.slidingDoorVentArticleWidth + 15, dimensions.ymax + extra);
                    shape.lineTo(this.slidingDoorVentFramePoints[i].x2 - this.slidingDoorVentArticleWidth - 15, dimensions.ymax + extra);
                    shape.lineTo(this.slidingDoorVentFramePoints[i].x2 - this.slidingDoorVentArticleWidth - 15, dimensions.ymin - extra);
                    sum += parseInt(this.slidingDoorSystem.VentFrames[i].Width);
                    let geometry = new THREE.ShapeGeometry(shape)
                    let mesh = new THREE.Mesh(geometry, material);
                    let zoffset = (Designer.UnifiedModel.ProductType == "Window") ? (-(Designer.UnifiedModel.outerFrame.getArticleWidth() / 2)) : 15;
                    zoffset = -this.slidingDoorVentFramePoints[i].z -5;
                    mesh.position.set(0, 0, zoffset);
                    mesh.userData.originalMaterial = material;
                    mesh.userData.glassID = this.glassID;
                    glassMeshes.add(mesh);
                }
                glassMeshes.userData.glassID = this.glassID;
                glassMeshes.subtype = subtypes.pane;
                glassMeshes.name = this.name;
                this.glassMesh = glassMeshes;
                glassGroup.add(glassMeshes);
            }
            else if(this.isDoubleDoor != null && this.isDoubleDoor.includes("Double")){
                let shape2 = new THREE.Shape();

                shape.moveTo(dimensions.xmin - extra, dimensions.ymin - extra);
                shape.lineTo(dimensions.xmin - extra, dimensions.ymax + extra);
                shape.lineTo(((dimensions.xmin + dimensions.xmax)/2) - 40, dimensions.ymax + extra);
                shape.lineTo(((dimensions.xmin + dimensions.xmax)/2) - 40, dimensions.ymin - extra);

                shape2.moveTo(((dimensions.xmin + dimensions.xmax)/2) + 40, dimensions.ymin - extra);
                shape2.lineTo(((dimensions.xmin + dimensions.xmax)/2) + 40, dimensions.ymax + extra);
                shape2.lineTo(dimensions.xmax + extra, dimensions.ymax + extra);
                shape2.lineTo(dimensions.xmax + extra, dimensions.ymin - extra);

                let glassMeshes = new THREE.Group();
                const geometry1 = new THREE.ShapeGeometry(shape);
                const geometry2 = new THREE.ShapeGeometry(shape2);
                let glassMesh1 = new THREE.Mesh(geometry1, material);
                let glassMesh2 = new THREE.Mesh(geometry2, material);

                let zoffset = (Designer.UnifiedModel.ProductType == "Window") ? (-(Designer.UnifiedModel.outerFrame.getArticleWidth() / 2)) : 15;
                zoffset = this.isVentGlass ? -5 : zoffset;
                glassMesh1.position.set(0, 0, zoffset);
                glassMesh2.position.set(0, 0, zoffset);
                glassMesh1.userData.originalMaterial = material;
                glassMesh1.userData.glassID = this.glassID;
                glassMesh2.userData.originalMaterial = material;
                glassMesh2.userData.glassID = this.glassID;
                glassMeshes.userData.glassID = this.glassID;
                glassMeshes.subtype = subtypes.pane;
                glassMeshes.name = this.name;
                glassMeshes.add(glassMesh1);
                glassMeshes.add(glassMesh2);
                this.glassMesh = glassMeshes;
                glassGroup.add(glassMeshes);
            }
            else{
                shape.moveTo(dimensions.xmin - extra, dimensions.ymin - extra);
                shape.lineTo(dimensions.xmin - extra, dimensions.ymax + extra);
                shape.lineTo(dimensions.xmax + extra, dimensions.ymax + extra);
                shape.lineTo(dimensions.xmax + extra, dimensions.ymin - extra);

                const geometry = new THREE.ShapeGeometry(shape);
            
                let glassMesh = new THREE.Mesh(geometry, material);
                let zoffset = (Designer.UnifiedModel.ProductType == "Window") ? (-(Designer.UnifiedModel.outerFrame.getArticleWidth() / 2)) : 15;
                zoffset = this.isVentGlass ? -5 : zoffset;
                glassMesh.position.set(0, 0, zoffset)
                glassMesh.userData.originalMaterial = material;
                this.glassMesh = glassMesh;
                glassGroup.add(glassMesh); 
            }


            
        }
        else if (this.panelSystemID > 0) {
            let shape = new THREE.Shape();
            const dimensions = this.dimensions;
            const extra = 5;  // additional extension to avoid visual gap between glass and members/vent frame
            
            shape.moveTo(dimensions.xmin - extra, dimensions.ymin - extra);
            shape.lineTo(dimensions.xmin - extra, dimensions.ymax + extra);
            shape.lineTo(dimensions.xmax + extra, dimensions.ymax + extra);
            shape.lineTo(dimensions.xmax + extra, dimensions.ymin - extra);
            


            const geometry = new THREE.ShapeGeometry(shape);
            let material = new THREE.MeshBasicMaterial({
                color: 0x606060,
                side: THREE.DoubleSide
            });

            let panelBackMesh = new THREE.Mesh(geometry, material);
            let zoffset = 0;
            if (Designer.UnifiedModel.ProductType == "Window") {
                zoffset = -(Designer.UnifiedModel.outerFrame.getArticleWidth() / 2) - this.panelThickness;
            }
            else if (Designer.UnifiedModel.ProductType == "Facade" && Designer.UnifiedModel.FacadeType == "mullion-transom") {
                zoffset = 15 - this.panelThickness
            }
            else if (Designer.UnifiedModel.ProductType == "Facade" && Designer.UnifiedModel.FacadeType == "UDC") {
                zoffset = -(Designer.UnifiedModel.udcFrame.getArticleWidth_bottom() / 2) - this.panelThickness;
            }

            panelBackMesh.position.set(0, 0, zoffset)
            panelBackMesh.userData.originalMaterial = material;

            if (this.panelFrontMaterial == "glass" || this.panelFrontMaterial == "Glass") {
                material = new THREE.MeshBasicMaterial({
                    color: 0x00a2d1,
                    side: THREE.DoubleSide,
                    transparent: true,
                    opacity: 0.2
                });
            }
            else {
                material = new THREE.MeshBasicMaterial({
                    color: 0x606060,
                    side: THREE.DoubleSide
                });
            }

            let panelFrontMesh = new THREE.Mesh(geometry, material);
            if (Designer.UnifiedModel.ProductType == "Window") {
                zoffset = -(Designer.UnifiedModel.outerFrame.getArticleWidth() / 2);
            }
            else if (Designer.UnifiedModel.ProductType == "Facade" && Designer.UnifiedModel.FacadeType == "mullion-transom") {
                zoffset = 15;
            }
            else if (Designer.UnifiedModel.ProductType == "Facade" && Designer.UnifiedModel.FacadeType == "UDC") {
                zoffset = -(Designer.UnifiedModel.udcFrame.getArticleWidth_bottom() / 2);
            }

            panelFrontMesh.position.set(0, 0, zoffset);
            panelFrontMesh.userData.originalMaterial = material;

            this.panelFrontMesh = panelFrontMesh;
            this.panelBackMesh = panelBackMesh;
            glassGroup.add(panelFrontMesh);
            glassGroup.add(panelBackMesh);
        }

        this.glassGroup = glassGroup;

        return glassGroup;
    }

    setGlazingTypeColor() {
        if (this.glazingSystemID == 0) {
            this.setNativeColor();
            return;
        }
        const material = new THREE.MeshBasicMaterial({
            color: this.color,
            side: THREE.DoubleSide,
        });

        if (this.glassMesh) {

            this.glassMesh.material = material;
            this.glassMesh.userData.originalMaterial = material;
            if(this.glassMesh.children.length > 0){
                for(let g of this.glassMesh.children){
                    g.material = material;
                    g.userData.originalMaterial = material;
                }       
            }
        }
        if (this.panelFrontMesh) {

            this.panelFrontMesh.material = material;
            this.panelFrontMesh.userData.originalMaterial = material;
            this.panelBackMesh.material = material;
            this.panelBackMesh.userData.originalMaterial = material;
        }

    }

    setNativeColor() {
        if (this.glassMesh) {

            const material = new THREE.MeshStandardMaterial({
                color: 0x35AA84,
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.20,
                envMap: Designer.Materials.environmentTextureForReflections,
                roughness: 0.0,
                metalness: 1.0
            });
            this.glassMesh.material = material;
            this.glassMesh.userData.originalMaterial = material;
            if(this.glassMesh.children.length > 0){
                for(let g of this.glassMesh.children){
                    g.material = material;
                    g.userData.originalMaterial = material;
                }       
            }
        }
        if (this.panelFrontMesh) {
            let material = new THREE.MeshBasicMaterial({
                color: 0x606060,
                side: THREE.DoubleSide
            });
            this.panelBackMesh.material = material;
            this.panelBackMesh.userData.originalMaterial = material;
            if (this.panelFrontMaterial == "glass" || this.panelFrontMaterial == "Glass") {
                material = new THREE.MeshBasicMaterial({
                    color: 0x00a2d1,
                    side: THREE.DoubleSide,
                    transparent: true,
                    opacity: 0.2
                });
            }
            else {
                material = new THREE.MeshBasicMaterial({
                    color: 0x606060,
                    side: THREE.DoubleSide
                });
            }
            this.panelFrontMesh.material = material;
            this.panelFrontMesh.userData.originalMaterial = material;
        }
    }

    showGlassID() {
        if (this.glassIDLabel) {
            this.glassGroup.remove(this.glassIDLabel);
        }
        const w = Designer.UnifiedModel.getWidth();
        const h = Designer.UnifiedModel.getHeight();
        const wh = (w + h) / 2
        //const fontsize = Designer.UnifiedModel.ProductType == "Facade" ? wh / 30 : wh / 15;

        let fontsize = 0;
        if (Designer.UnifiedModel.ProductType == "Window") {
            fontsize = wh / 15;
        }
        else if (Designer.UnifiedModel.ProductType == "Facade" && Designer.UnifiedModel.FacadeType == "mullion-transom") {
            fontsize = wh / 30;
        }
        else if (Designer.UnifiedModel.ProductType == "Facade" && Designer.UnifiedModel.FacadeType == "UDC") {
            fontsize = wh / 15;
        }
        else if (Designer.UnifiedModel.ProductType == "SlidingDoor") {
            fontsize = wh / 15;
        }

        const fontcolor = { r: 255, g: 255, b: 255, a: 1.0 };
        const fontcolorGreen = { r: 0, g: 200, b: 0, a: 1.0 };
        if(this.slidingDoorSystem != null){
            let doubleLabelGroup = new THREE.Group();
            for(let i = 0; i < this.slidingDoorSystem.VentFrames.length; i++){
                const label = new DesignerSprite({
                    message:`${this.glassID + '.' + (i+1).toString()}`, 
                    fontcolor: fontcolor, 
                    fontsize: fontsize,
                    clickable: false
                });
                const yPos = (this.dimensions.ymin + this.dimensions.ymax) / 2;
                const xPos = this.slidingDoorVentFramePoints[i].x1+ (this.slidingDoorVentFramePoints[i].x2 - this.slidingDoorVentFramePoints[i].x1) / 2;
                label.position.set(xPos, yPos , 75);
                doubleLabelGroup.add(label);            
                this.glassIDLabel = doubleLabelGroup;
            }
            this.glassGroup.add(doubleLabelGroup);

        }
        else if(this.isDoubleDoor != null && this.isDoubleDoor.includes("Double")){
            let doubleLabelGroup = new THREE.Group();
            const label1 = new DesignerSprite({
                message:`${this.glassID + '.1'}`, 
                fontcolor: fontcolor, 
                fontsize: fontsize,
                clickable: false
            });
            const label1Text = new DesignerSprite({
                message: this.isDoubleDoor.includes("Right") ? '(active)' : '(passive)',
                fontcolor: this.isDoubleDoor.includes("Right") ? fontcolorGreen : fontcolor,
                fontsize: fontsize * 0.5,
                clickable: false
            })
            
            const label2 = new DesignerSprite({
                message:`${this.glassID + '.2'}`, 
                fontcolor: fontcolor, 
                fontsize: fontsize,
                clickable: false
            });
            const label2Text = new DesignerSprite({
                message: this.isDoubleDoor.includes("Right") ? '(passive)' : '(active)',
                fontcolor: this.isDoubleDoor.includes("Right") ? fontcolor : fontcolorGreen,
                fontsize: fontsize* 0.5,
                clickable: false
            })
            
            const yPos = (this.dimensions.ymin + this.dimensions.ymax) / 2;
            const xPos1 = this.dimensions.xmin + (this.dimensions.xmax - this.dimensions.xmin) / 4;
            const xPos2 = this.dimensions.xmin + 3*(this.dimensions.xmax -  this.dimensions.xmin) / 4;
            label1.position.set(xPos1, yPos , 75);
            label1Text.position.set(xPos1, yPos- fontsize - 50, 75);
            label2.position.set(xPos2, yPos, 75);
            label2Text.position.set(xPos2, yPos- fontsize - 50, 75);
            doubleLabelGroup.add(label1);            
            doubleLabelGroup.add(label1Text);            
            doubleLabelGroup.add(label2);            
            doubleLabelGroup.add(label2Text);            
            this.glassIDLabel = doubleLabelGroup;

            this.glassGroup.add(doubleLabelGroup);

        }
        else{
            const label = new DesignerSprite({
                message: `${this.glassID}`,
                fontcolor: fontcolor,
                fontsize: fontsize,
                clickable: false
            });
    
            const xPos = (this.dimensions.xmin + this.dimensions.xmax) / 2;
            const yPos = (this.dimensions.ymin + this.dimensions.ymax) / 2;
            label.position.set(xPos, yPos, 75);
            this.glassIDLabel = label;
            this.glassGroup.add(label);
        }
        
    }

    hideGlassID() {
        this.glassGroup.remove(this.glassIDLabel);
        this.glassIDLabel = null;
    }

}