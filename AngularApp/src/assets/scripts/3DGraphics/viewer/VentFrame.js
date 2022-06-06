
/**
 * This class Generates a Vent Frame on a pane of glass
 * */

class DesignerVentFrame {

    constructor(settings) {
        this.dimensions = settings.dimensions;
        this.articleName = settings.articleName;
        this.glassID = settings.glassID;
        this.operabilitySystemsID = settings.operabilitySystemsID;
        this.VentOpeningDirection = settings.VentOpeningDirection;
        this.VentOperableType = settings.VentOperableType;
        this.articleWidth = 0;
        this.weight = 0; //kg/mm, from js file, including accessory weight (=plastic part weight x 0.2)

        this.name = `glass_${this.glassID}__vent_frame`;

        // Points of the extrusion path
        const dimensions = this.dimensions;
        this.extrudePoints = [
            new THREE.Vector2(dimensions.xmin, dimensions.ymin),
            new THREE.Vector2(dimensions.xmin, dimensions.ymax),
            new THREE.Vector2(dimensions.xmax, dimensions.ymax),
            new THREE.Vector2(dimensions.xmax, dimensions.ymin)
        ];

        this.ventFrameGroup = new THREE.Group();

        this.ventInfo = null;

        this.handle = null;
        this.handlePosition = settings.HandlePosition === undefined ? -1 : settings.HandlePosition;
        this.handleColor = settings.HandleColor;
        //this.useDefaultHandlePosition = true;
        this.init();
    }

    init() {
        this.readArticleProperties();
    }

    // read article data from article_articleNumber.js file in content/articles folder
    readArticleProperties() {
        if (this.articleName.indexOf("null") > - 1) { }
        else {
            // get intermediate article from article__articleNumber.js
            const articleNameStart = this.articleName.substring(0, 9);
            let ventFrameArticle = null;
            if (articleNameStart == "article__" && this.articleName !== "article__-1") {
                ventFrameArticle = window[this.articleName]();
            }
            else {
                const customArticle = {};
                this.articleName = "article__CustomArticle";
                ventFrameArticle = window[this.articleName](customArticle);
            }
            this.articleWidth = Math.min(ventFrameArticle.outsideWidth, ventFrameArticle.insideWidth);
            this.outsideWidth = ventFrameArticle.outsideWidth;
            this.insideWidth = ventFrameArticle.insideWidth;
            this.weight = ventFrameArticle.weight;
            this.ventFrameArticle = ventFrameArticle;
        }
    }

    updateGlassDimensions() {
        let dimensions = {
            xmin: 0,
            ymin: 0,
            xmax: 0,
            ymax: 0
        };
        dimensions.xmin = this.dimensions.xmin + this.articleWidth + 7;
        dimensions.ymin = this.dimensions.ymin + this.articleWidth + 7;
        dimensions.xmax = this.dimensions.xmax - this.articleWidth - 7;
        dimensions.ymax = this.dimensions.ymax - this.articleWidth - 7;

        return dimensions;
    }

    generateVentFrameExtrusion() {
        const ventFrameGroup = new THREE.Group();

        const ventFrameArticle = this.ventFrameArticle;
        for (var j in ventFrameArticle.shapes) {
            let shape = ventFrameArticle.shapes[j];
            if(shape.useMaterial == "ProfileAluminium")
                shape.useMaterial = "VentFrameAluminium";

            // no uvs with this method, but everything else works
            let shapeGeometry = new THREE.ProfiledContourGeometry({
                shape: shape,
                points: this.extrudePoints,
                closed: true,
                capped: false
            });
            let shapeMaterial = Designer.Materials.setMaterial(shape);
            let shapeMesh = new THREE.Mesh(shapeGeometry, shapeMaterial);
            shapeMesh.userData.originalMaterial = shapeMaterial;
            //Designer.Scene.gui.add(shapeMesh.position, 'z').min(-1000).max(1000)
            ventFrameGroup.add(shapeMesh);

            //attempt to box UV the object, works mostly but some uvs are messed up
            // shapeMesh.geometry.computeBoundingBox();
            // let bboxSize = shapeMesh.geometry.boundingBox.getSize();
            // let uvMapSize = Math.min(bboxSize.x, bboxSize.y, bboxSize.z);
            // let cube1 = new THREE.Mesh(new THREE.BoxBufferGeometry(uvMapSize, uvMapSize, uvMapSize), new THREE.MeshBasicMaterial());
            // Designer.Utils.applyBoxUV(shapeMesh.geometry, new THREE.Matrix4().getInverse(cube1.matrix), uvMapSize);


            //attempt at using UV method of profiled contour geometry. so far,
            //the normals dont look right and the mesh is offset. but the uving works!

            // let extrude2DArray =[];
            // for(let i = 0; i < this.extrudePoints.length; i++)
            // {
            //     extrude2DArray.push(this.extrudePoints[i].x);
            //     extrude2DArray.push(this.extrudePoints[i].y);
            // }
            // let shapeMaterial = Designer.Materials.setMaterial(shape);
            // let shapeGeometry = new THREE.ProfiledContourUVGeometry({
            //     shape: shape,
            //     points: extrude2DArray,
            //     closed: true,
            //     matPerSquare: false,
            //     materials: [shapeMaterial]
            // });
            // shapeGeometry.userData.originalMaterial = shapeMaterial;
            // ventFrameGroup.add(shapeGeometry);



        }
        const subtypes = new DesignerSubType();
        ventFrameGroup.subtype = subtypes.ventFrame;
        ventFrameGroup.name = this.name;

        this.handlePosition = parseInt(this.handlePosition);

        //update handle position OBJ
        if (this.handlePosition < 9 || this.handlePosition + this.dimensions.ymin > this.dimensions.ymax) {
            this.handlePosition = Math.round((this.dimensions.ymax - this.dimensions.ymin) / 2);
        }
        Designer.UnifiedModelOperator.updateHandlePosition(this.glassID, this.handlePosition);


        //Handle OBJ
        let objLoaderHandle = new THREE.OBJLoader();
        objLoaderHandle.setPath("https://vcl-design-com.s3.amazonaws.com/StaticFiles/scripts/3DGraphics/content/object/");
        this.setHandleColor();
        objLoaderHandle.load('ADS Standard Handle.obj', (obj) => {
            this.handle = obj;

            obj.traverse((child) => {
                child.material = this.handleMaterial;
                child.userData.originalMaterial = this.handleMaterial;
            })
            this.handle.ventFrame = this;
            const handleSubTypes = new DesignerSubType();
            this.handle.subtype = handleSubTypes.insideHandle;
            this.onAddHandle(ventFrameGroup);
            ventFrameGroup.add(obj);

        });
        ventFrameGroup.userData.clickable = true;
        ventFrameGroup.userData.dimensions = {
            xmin: this.dimensions.xmin -30,
            ymin: this.dimensions.ymin -30,
            xmax: this.dimensions.xmax +30,
            ymax: this.dimensions.ymax +30
        };

        this.ventFrameGroup = ventFrameGroup;
        return ventFrameGroup;
    }
    // changeHandleHeight(height) {
    //     if (this.handle) {
    //         console.log("tallest this can be is ");
    //         console.log(this.dimensions.ymax - 200 + this.articleWidth * 2);
    //         if (height >= 200 && height <= (this.dimensions.ymax - 200 + this.articleWidth * 2)) {
    //             this.handle.position.y = height;
    //         }
    //         else {
    //             if (height >= 200) {
    //                 console.log("too tall");
    //                 dataExchange.sendParentMessage('snapHandleHeightInputField', 200);
    //             }
    //             else {
    //                 console.log("too short");
    //                 dataExchange.sendParentMessage('snapHandleHeightInputField', this.dimensions.ymax - 200 + this.articleWidth * 2);
    //             }
    //         }
    //     }
    // }

    onAddHandle(ventFrameGroup) {
        let bbox = new THREE.Box3().setFromObject(ventFrameGroup);
        let handleBoundingBox = new THREE.Box3().setFromObject(this.handle);
        let handleHeight = new THREE.Vector3();
        handleBoundingBox.getSize(handleHeight);
        this.handle.position.z = bbox.min.z;
        const xmin = this.dimensions.xmin;
        const xmax = this.dimensions.xmax;
        const xmid = (this.dimensions.xmax + this.dimensions.xmin) / 2;
        const ymid = (this.dimensions.ymax + this.dimensions.ymin) / 2;

        switch (this.VentOperableType) {
            case "Tilt-Turn-Left":
            case "Turn-Tilt-Left":
            case 1:
            case "Tilt-Turn":
                this.handle.position.x = this.dimensions.xmin;
                this.handle.position.y = this.handlePosition + this.dimensions.ymin - handleHeight.y / 2;
                this.handle.scale.x = -1;


                break;
            case "Tilt-Turn-Right":
            case "Turn-Tilt-Right":
                this.handle.position.x = this.dimensions.xmax;
                this.handle.position.y = this.handlePosition + this.dimensions.ymin - handleHeight.y / 2;
                break;

            case "Side-Hung-Left":
            case 2:
            case "Side-Hung":
                this.handle.position.x = this.dimensions.xmin;
                this.handle.position.y = this.handlePosition + this.dimensions.ymin - handleHeight.y / 2;
                this.handle.scale.x = -1;



                break;
            case "Side-Hung-Right":
                this.handle.position.x = this.dimensions.xmax + this.articleWidth;
                this.handle.position.y = this.handlePosition + this.dimensions.ymin - handleHeight.y / 2;


                break;
            case "Bottom-Hung":
            case 3:

                this.handle.position.x = xmid;
                this.handle.position.y = this.dimensions.ymax - this.articleWidth;
                break;
            case "Top-Hung":

                this.handle.position.x = xmid;
                this.handle.position.y = this.dimensions.ymin - 2 * this.articleWidth;

                break;
            case "Parallel-Opening":

                this.handle.position.x = this.dimensions.xmax + this.articleWidth;
                this.handle.position.y = this.handlePosition + this.dimensions.ymin - handleHeight.y / 2;
    
                break;
            default:
                this.handle.position.x = this.dimensions.xmax + this.articleWidth;
                this.handle.position.y = this.handlePosition + this.dimensions.ymin - handleHeight.y / 2;
    
                break;
        }
    }

    setHandleColor() {
        if(this.handleColor != null){
            if(this.failedQuickCheck !== undefined && this.failedQuickCheck == true){
                this.handleMaterial = Designer.Materials.setHandleFinishColor("#FF0000");
            }
            else{
                const ralNumber = this.handleColor.toLowerCase().trim().substr(this.handleColor.toLowerCase().trim().length - 4);
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
                    default:
                        color = "#f1f0ea";
                        break;
                }
                this.handleMaterial = Designer.Materials.setHandleFinishColor(color);
            }
            
        }
        else{
            this.handleMaterial = Designer.Materials.setHandleFinishColor("#f1f0ea");

        }   
    }


    showVentInfo() {
        let material;
        if(this.ventFrameGroup != null){
            this.ventFrameGroup.remove(this.ventInfo);
            this.ventInfo = null;
        }

        switch (this.VentOpeningDirection) {
            case "Inward":
            case 1:
                if (Designer.Camera.outside) {
                    material = new THREE.LineDashedMaterial({
                        name: "dashed",
                        color: 0xBFBFBF,
                        linewidth: 1,
                        scale: 1,
                        dashSize: 20,
                        gapSize: 20,
                    });
                }
                else {
                    material = new THREE.LineBasicMaterial({
                        name: "solid",
                        color: 0xBFBFBF
                    });
                }



                break;
            case "Outward":
            case 2:
                if (Designer.Camera.outside) {
                    material = new THREE.LineBasicMaterial({
                        name: "solid",
                        color: 0xBFBFBF
                    });
                }
                else {
                    material = new THREE.LineDashedMaterial({
                        name: "dashed",
                        color: 0xBFBFBF,
                        linewidth: 1,
                        scale: 1,
                        dashSize: 20,
                        gapSize: 20,
                    });
                }
                break;
        }

        const lineGeometry = new THREE.Geometry();
        const width = Math.max(this.outsideWidth, this.insideWidth);
        const xmin = this.dimensions.xmin + width;
        const xmax = this.dimensions.xmax - width;
        const xmid = (this.dimensions.xmax + this.dimensions.xmin) / 2;
        const ymin = this.dimensions.ymin + width;
        const ymax = this.dimensions.ymax - width;
        const ymid = (this.dimensions.ymax + this.dimensions.ymin) / 2;

        switch (this.VentOperableType) {
            case "Turn-Tilt-Left":
            case 1:
            case "Tilt-Turn":
                lineGeometry.vertices.push(
                    new THREE.Vector3(xmax, ymax, 0),
                    new THREE.Vector3(xmin, ymid, 0),
                    new THREE.Vector3(xmax, ymin, 0),
                    new THREE.Vector3(xmid, ymax, 0),
                    new THREE.Vector3(xmin, ymin, 0),
                );
                break;
            case "Turn-Tilt-Right":
                lineGeometry.vertices.push(
                    new THREE.Vector3(xmin, ymax, 0),
                    new THREE.Vector3(xmax, ymid, 0),
                    new THREE.Vector3(xmin, ymin, 0),
                    new THREE.Vector3(xmid, ymax, 0),
                    new THREE.Vector3(xmax, ymin, 0),
                );
                break;

            case "Side-Hung-Left":
            case 2:
            case "Side-Hung":
                lineGeometry.vertices.push(
                    new THREE.Vector3(xmax, ymax, 0),
                    new THREE.Vector3(xmin, ymid, 0),
                    new THREE.Vector3(xmax, ymin, 0),
                );
                break;
            case "Side-Hung-Right":
                lineGeometry.vertices.push(
                    new THREE.Vector3(xmin, ymax, 0),
                    new THREE.Vector3(xmax, ymid, 0),
                    new THREE.Vector3(xmin, ymin, 0),
                );
                break;
            case "Bottom-Hung":
            case 3:
                lineGeometry.vertices.push(
                    new THREE.Vector3(xmax, ymin, 0),
                    new THREE.Vector3(xmid, ymax, 0),
                    new THREE.Vector3(xmin, ymin, 0),
                );
                break;
            case "Top-Hung":
                lineGeometry.vertices.push(
                    new THREE.Vector3(xmax, ymax, 0),
                    new THREE.Vector3(xmid, ymin, 0),
                    new THREE.Vector3(xmin, ymax, 0),
                );
                break;
            case "Parallel-Opening":
                const y1 = ymin + (ymax - ymin) * 1 / 4;
                const y2 = ymin + (ymax - ymin) * 3 / 4;
                lineGeometry.vertices.push(
                    new THREE.Vector3(xmin, ymin, 0),
                    new THREE.Vector3(xmid, y1, 0),
                    new THREE.Vector3(xmax, ymin, 0),
                    new THREE.Vector3(xmid, y1, 0),
                    new THREE.Vector3(xmid, y2, 0),
                    new THREE.Vector3(xmin, ymax, 0),
                    new THREE.Vector3(xmid, y2, 0),
                    new THREE.Vector3(xmax, ymax, 0),
                );
                break;
        }


        this.ventInfo = new THREE.Line(lineGeometry, material);
        this.ventInfo.computeLineDistances();
        this.ventInfo.position.set(0, 0, 40);
        //this.ventInfo = lineMesh;
        this.ventFrameGroup.add(this.ventInfo);
    }

    hideVentInfo() {
        // this.ventFrameGroup.remove(this.ventInfo);
        // this.ventInfo = null;
        if(this.ventInfo !== null){
             this.ventInfo.visible = false;
        }
    }
}