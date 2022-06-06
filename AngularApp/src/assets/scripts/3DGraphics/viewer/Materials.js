class DesignerMaterials {

    constructor() {
        this.FILE_PATH = "https://vcl-design-com.s3.amazonaws.com/StaticFiles/scripts/3DGraphics/content/materials/"
        this.materials = [];
        this.textureLoader = null;
        this.exrLoader = null;
        this.roughnessTexture = null;
        this.environmentTexture = null;
        this.environmentTextureForReflections = null;
        this.loadMaterials();
        this.previousColor = null;
        this.handleOBJ = null;
        this.ASEhandleOBJ = null;
        this.ASEhandleRecessOBJ = null;
        this.doorPullOBJ = null;
        this.pullHandleOBJ = null;
        this.keyLockOBJ = null;
        this.hingeOBJ = null;
        this.parameters = {
            metalness: 0.9,
            roughness: 0.85
        };
    }

    loadMaterials() {
        let that = this; 
        this.parameters = {
            metalness: 0.9,
            roughness: 0.85
        };
        // const materialFolder = Designer.Scene.gui.addFolder("Material");

        this.textureLoader = new THREE.TextureLoader();
        this.roughnessTexture = this.textureLoader.load("https://vcl-design-com.s3.amazonaws.com/StaticFiles/scripts/3DGraphics/content/textures/T_Brushed_R.png");
        this.roughnessTexture.wrapS = THREE.RepeatWrapping;
        this.roughnessTexture.wrapT = THREE.RepeatWrapping;
        this.roughnessTexture.repeat = new THREE.Vector2(0.075, 0.075);
        this.exrLoader = new THREE.EXRLoader();
        //this.exrLoader.setDataType(THREE.UnsignedByteType);
        this.exrLoader.load(
            "../scripts/3DGraphics/content/environments/over_the_clouds.exr",
            (texture) => {
                this.environmentTexture = Designer.Renderer.pmremGenerator.fromEquirectangular(texture).texture;
                let environmentCubeMap = new THREE.WebGLCubeRenderTarget(2048, {generateMipmaps: false, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter})
                this.environmentTextureForReflections = environmentCubeMap.fromEquirectangularTexture(Designer.Renderer.renderer, texture).texture;
                // this.environmentTexture.magFilter = THREE.NearestFilter;
                // this.environmentTexture.minFilter = THREE.NearestFilter;
                
                Designer.Scene.scene.environment = this.environmentTexture;
                
                //Designer.Scene.scene.background = this.environmentTexture;
                texture.dispose();
            }
        );

        this.materials["ProfileAluminium"] = new THREE.MeshStandardMaterial({
            name: "ProfileAluminium",
            color: 0x8c969d,
            metalness: this.parameters.metalness,
            roughness: this.parameters.roughness,
            roughnessMap: this.roughnessTexture,
            environmentMap: this.environmentTexture,
            side: THREE.DoubleSide,
        });
        this.materials["DetailsAluminium"] = new THREE.MeshStandardMaterial({
            name: "DetailsAluminium",
            color: 0x8c969d,
            metalness: this.parameters.metalness,
            roughness: this.parameters.roughness,
            roughnessMap: null,
            environmentMap: this.environmentTexture,
            side: THREE.DoubleSide,
        });
        this.materials["HandleFinishAluminium"] = new THREE.MeshStandardMaterial({
            name: "HandleFinishAluminium",
            color: 0x8c969d,
            metalness: this.parameters.metalness,
            roughness: this.parameters.roughness,
            roughnessMap: null,
            environmentMap: this.environmentTexture,

        });
        this.materials["VentFrameAluminium"] = new THREE.MeshStandardMaterial({
            name: "VentFrameAluminium",
            color: new THREE.Color(
                this.materials["ProfileAluminium"].color.r - 0.01,
                this.materials["ProfileAluminium"].color.g - 0.01,
                this.materials["ProfileAluminium"].color.b - 0.01),
            metalness: this.materials["ProfileAluminium"].metalness,
            roughness: this.materials["ProfileAluminium"].roughness,
            environmentMap: this.environmentTexture,
            roughnessMap: null,

            side: THREE.DoubleSide

        });
        
        // materialFolder.add(this.parameters, "metalness").min(0.75).max(1).name("material metalness");
        // materialFolder.add(this.parameters, "roughness").min(0).max(1).name("material roughness");


        let mtlLoader = new THREE.MTLLoader();
        let objLoader = new THREE.OBJLoader();
        let modelName = "ball";

        let model = {
            mtl: modelName + ".mtl",
            obj: modelName + ".obj"
        };

        mtlLoader.setCrossOrigin("anonymous");
        mtlLoader.setPath(this.FILE_PATH);
        objLoader.setPath(this.FILE_PATH);

        mtlLoader.load(model.mtl, (materials) => {
            objLoader.setMaterials(materials);
            objLoader.load(model.obj, (model) => {
                this._updateMaterials();
            });
        });

        // load slab anchor obj
        let mtlLoader2 = new THREE.MTLLoader();
        let objLoader2 = new THREE.OBJLoader();
        let objLoader3 = new THREE.OBJLoader();
        mtlLoader2.setPath("https://vcl-design-com.s3.amazonaws.com/StaticFiles/scripts/3DGraphics/content/object/");
        objLoader2.setPath("https://vcl-design-com.s3.amazonaws.com/StaticFiles/scripts/3DGraphics/content/object/");
        mtlLoader2.load('ball.mtl', (materials) => {
            objLoader2.setMaterials(materials);
            objLoader2.load('Slab_Anchor_35_Fixed.obj', function (obj) {
                Designer.Materials.Slab_Anchor_35_Fixed = obj.children[0];
            });
            objLoader2.load('Slab_Anchor_35_Sliding.obj', function (obj) {
                Designer.Materials.Slab_Anchor_35_Sliding = obj.children[0];
            });
            objLoader2.load('Slab_Anchor_50_Fixed.obj', function (obj) {
                Designer.Materials.Slab_Anchor_50_Fixed = obj.children[0];
            });
            objLoader2.load('Slab_Anchor_50_Sliding.obj', function (obj) {
                Designer.Materials.Slab_Anchor_50_Sliding = obj.children[0];
            });
            objLoader2.load('Slab_Anchor_60_Fixed.obj', function (obj) {
                Designer.Materials.Slab_Anchor_60_Fixed = obj.children[0];
            });
            objLoader2.load('Slab_Anchor_60_Sliding.obj', function (obj) {
                Designer.Materials.Slab_Anchor_60_Sliding = obj.children[0];
            });
        });
        objLoader2.setPath("https://vcl-design-com.s3.amazonaws.com/StaticFiles/scripts/3DGraphics/content/object/");
        //Handle OBJ
        objLoader2.load('ADS Standard Handle.obj', (obj) => {
            this.handleOBJ = obj;
        }, (progress)=>{}, (error)=>{console.log(error );});

        //Pull Handle OBJ
        objLoader2.load('ADS Standard Handle.obj', (obj) => {
            this.pullHandleOBJ = obj
        }, (progress)=>{}, (error)=>{console.log(error );});

        //Key Lock OBJ
        objLoader2.load('ADS Key Lock.obj', (obj) => {
            this.keyLockOBJ = obj;
        }, (progress)=>{}, (error)=>{console.log(error );});

        //draw door hinges
        objLoader2.load('ADS Surface Mounted Hinge.obj', (obj) => {
            this.hingeOBJ = obj;
        }, (progress)=>{}, (error)=>{console.log(error );});
        this.materials["NewPlastic"] = new THREE.MeshStandardMaterial({
            name: "Plastic",
            color: new THREE.Color(
                0.01,
                0.01,
                0.01),
            metalness: 0.0,
            roughness: 0.4,
            environmentMap: this.environmentTexture,
            roughnessMap: this.roughnessTexture,
            side: THREE.DoubleSide

        });

        objLoader3.setPath("../scripts/3DGraphics/content/object/");
        objLoader3.load('ASE Standard Handle.obj', (obj) => {
            this.ASEhandleOBJ = obj;
        }, (progress)=>{}, (error)=>{console.log(error );});
        objLoader3.load('ASEHandleRecess.obj', (obj) => {
            this.ASEhandleRecessOBJ = obj;
        }, (progress)=>{}, (error)=>{console.log(error );});
        objLoader3.load('ADS Outside Pull Handle.obj', (obj) => {
            this.doorPullOBJ = obj;
        }, (progress)=>{}, (error)=>{console.log(error );});


    }

    _updateMaterials() {
        let material = null;
        for (var i in this.materials) {
            material = this.materials[i]
            if (material.shininess === 0) {
                material.shininess = 1.0
            }
        }
    }

    setProfilesColor(color) {
        
        switch (color) {
            case '#0e0e10':
                this.materials["ProfileAluminum"] = new THREE.MeshStandardMaterial();

                this.materials["ProfileAluminium"].metalness = this.parameters.metalness;
                this.materials["ProfileAluminium"].roughness = this.parameters.roughness;
                this.materials["ProfileAluminium"].roughnessMap = this.roughnessTexture;
                this.materials["ProfileAluminium"].envMapIntensity = 0.5;
                this.materials["ProfileAluminium"].emissive = new THREE.Color(0x000000);

                this.materials["VentFrameAluminium"].metalness = this.parameters.metalness;
                this.materials["VentFrameAluminium"].roughness = this.parameters.roughness;
                this.materials["VentFrameAluminium"].roughnessMap = this.roughnessTexture;
                this.materials["VentFrameAluminium"].envMapIntensity = 0.5;
                this.materials["VentFrameAluminium"].emissive = new THREE.Color(0x000000);


                this.materials["DetailsAluminium"].metalness = this.parameters.metalness;
                this.materials["DetailsAluminium"].roughness = this.parameters.roughness;
                this.materials["DetailsAluminium"].envMapIntensity = 0.5;
                this.materials["DetailsAluminium"].emissive = new THREE.Color(0x000000);


                this.previousColor = null;
                break;
            case '#8c969d':
                this.materials["ProfileAluminum"] = new THREE.MeshStandardMaterial();

                this.materials["ProfileAluminium"].metalness = this.parameters.metalness;
                this.materials["ProfileAluminium"].roughness = this.parameters.roughness;
                this.materials["ProfileAluminium"].roughnessMap = this.roughnessTexture;
                this.materials["ProfileAluminium"].envMapIntensity = 0.5;
                this.materials["ProfileAluminium"].emissive = new THREE.Color(0x000000);

                this.materials["VentFrameAluminium"].metalness = this.parameters.metalness;
                this.materials["VentFrameAluminium"].roughness = this.parameters.roughness;
                this.materials["VentFrameAluminium"].roughnessMap = this.roughnessTexture;
                this.materials["VentFrameAluminium"].envMapIntensity = 0.5;
                this.materials["VentFrameAluminium"].emissive = new THREE.Color(0x000000);

                this.materials["DetailsAluminium"].metalness = this.parameters.metalness;
                this.materials["DetailsAluminium"].roughness = this.parameters.roughness;
                this.materials["DetailsAluminium"].envMapIntensity = 0.5;
                this.materials["DetailsAluminium"].emissive = new THREE.Color(0x000000);
                this.previousColor = null;
                break;
            case '#383e42':
                this.materials["ProfileAluminum"] = new THREE.MeshStandardMaterial();

                this.materials["ProfileAluminium"].metalness = this.parameters.metalness;
                this.materials["ProfileAluminium"].roughness = this.parameters.roughness;
                this.materials["ProfileAluminium"].roughnessMap = this.roughnessTexture;
                this.materials["ProfileAluminium"].envMapIntensity = 0.5;
                this.materials["ProfileAluminium"].emissive = new THREE.Color(0x000000);

                this.materials["VentFrameAluminium"].metalness = this.parameters.metalness;
                this.materials["VentFrameAluminium"].roughness = this.parameters.roughness;
                this.materials["VentFrameAluminium"].roughnessMap = this.roughnessTexture;
                this.materials["VentFrameAluminium"].envMapIntensity = 0.5;
                this.materials["VentFrameAluminium"].emissive = new THREE.Color(0x000000);

                this.materials["DetailsAluminium"].metalness = this.parameters.metalness;
                this.materials["DetailsAluminium"].roughness = this.parameters.roughness;
                this.materials["DetailsAluminium"].envMapIntensity = 0.5;
                this.materials["DetailsAluminium"].emissive = new THREE.Color(0x000000);

                this.previousColor = null;

                break;
            case '#1a1718':
                this.materials["ProfileAluminum"] = new THREE.MeshStandardMaterial();

                this.materials["ProfileAluminium"].metalness = this.parameters.metalness;
                this.materials["ProfileAluminium"].roughness = this.parameters.roughness;
                this.materials["ProfileAluminium"].roughnessMap = this.roughnessTexture;
                this.materials["ProfileAluminium"].envMapIntensity = 0.5;
                this.materials["ProfileAluminium"].emissive = new THREE.Color(0x000000);

                this.materials["VentFrameAluminium"].metalness = this.parameters.metalness;
                this.materials["VentFrameAluminium"].roughness = this.parameters.roughness;
                this.materials["VentFrameAluminium"].roughnessMap = this.roughnessTexture;
                this.materials["VentFrameAluminium"].envMapIntensity = 0.5;
                this.materials["VentFrameAluminium"].emissive = new THREE.Color(0x000000);

                this.materials["DetailsAluminium"].metalness = this.parameters.metalness;
                this.materials["DetailsAluminium"].roughness = this.parameters.roughness;
                this.materials["DetailsAluminium"].envMapIntensity = 0.5;
                this.materials["DetailsAluminium"].emissive = new THREE.Color(0x000000);
                this.previousColor = null;

                break;
            case '#f1f0ea':
                this.materials["ProfileAluminum"] = new THREE.MeshStandardMaterial();
                this.materials["ProfileAluminium"].metalness = this.parameters.metalness;
                this.materials["ProfileAluminium"].roughness = this.parameters.roughness;
                this.materials["ProfileAluminium"].roughnessMap = this.roughnessTexture;
                this.materials["ProfileAluminium"].envMapIntensity = 0.5;
                this.materials["ProfileAluminium"].emissive = new THREE.Color(0x000000);

                this.materials["VentFrameAluminium"].metalness = this.parameters.metalness;
                this.materials["VentFrameAluminium"].roughness = this.parameters.roughness;
                this.materials["VentFrameAluminium"].roughnessMap = this.roughnessTexture;
                this.materials["VentFrameAluminium"].envMapIntensity = 0.5;
                this.materials["VentFrameAluminium"].emissive = new THREE.Color(0x000000);

                this.materials["DetailsAluminium"].metalness = this.parameters.metalness;
                this.materials["DetailsAluminium"].roughness = this.parameters.roughness;
                this.materials["DetailsAluminium"].envMapIntensity = 0.5;
                this.materials["DetailsAluminium"].emissive = new THREE.Color(0x000000);
                this.previousColor = null;

                break;
            case '#FF0000':
                this.materials["ProfileAluminum"] = new THREE.MeshBasicMaterial({color:0xFF0000});
                this.previousColor = this.materials["ProfileAluminium"].color;

            break;
        }
        this.materials["ProfileAluminium"].color = new THREE.Color(color).convertSRGBToLinear();
        this.materials["VentFrameAluminium"].color = new THREE.Color(
            this.materials["ProfileAluminium"].color.r - 0.01,
            this.materials["ProfileAluminium"].color.g - 0.01,
            this.materials["ProfileAluminium"].color.b - 0.01
        ).convertSRGBToLinear();
        this.materials["VentFrameAluminium"].color = new THREE.Color(color).convertSRGBToLinear();
        this.materials["DetailsAluminium"].color = new THREE.Color(color).convertSRGBToLinear();
        this.materials["ProfileAluminium"].needsUpdate = true;
        this.materials["VentFrameAluminium"].needsUpdate = true;
        this.materials["DetailsAluminium"].needsUpdate = true;
    }
    revertPreviousColor(){
        if(this.previousColor != null){

            this.setProfilesColor(this.previousColor);

        }
    }
    setHandleFinishColor(color) {
        this.materials["HandleFinishAluminium"].color = new THREE.Color(color);
        switch (color) {
            case '#ffffcc':
                this.materials["HandleFinishAluminium"] = new THREE.MeshStandardMaterial();

                this.materials["HandleFinishAluminium"].metalness = this.parameters.metalness;
                this.materials["HandleFinishAluminium"].roughness = this.parameters.roughness;
                this.materials["HandleFinishAluminium"].roughnessMap = null;
                this.materials["HandleFinishAluminium"].envMapIntensity = 0.5;
                break;
           
            case '#0e0e10':
                this.materials["HandleFinishAluminium"] = new THREE.MeshStandardMaterial();

                this.materials["HandleFinishAluminium"].metalness = this.parameters.metalness;
                this.materials["HandleFinishAluminium"].roughness = this.parameters.roughness;
                this.materials["HandleFinishAluminium"].roughnessMap = null;
                this.materials["HandleFinishAluminium"].envMapIntensity = 0.5;
                break;
            case '#8c969d':
                this.materials["HandleFinishAluminium"] = new THREE.MeshStandardMaterial();

                this.materials["HandleFinishAluminium"].metalness = this.parameters.metalness;
                this.materials["HandleFinishAluminium"].roughness = this.parameters.roughness;
                this.materials["HandleFinishAluminium"].roughnessMap = null;
                this.materials["HandleFinishAluminium"].envMapIntensity = 0.5;

                break;
            case '#383e42':
                this.materials["HandleFinishAluminium"] = new THREE.MeshStandardMaterial();

                this.materials["HandleFinishAluminium"].metalness = this.parameters.metalness;
                this.materials["HandleFinishAluminium"].roughness = this.parameters.roughness;
                this.materials["HandleFinishAluminium"].roughnessMap = null;
                this.materials["HandleFinishAluminium"].envMapIntensity = 0.5;

                break;
            case '#1a1718':
                this.materials["HandleFinishAluminium"] = new THREE.MeshStandardMaterial();

                this.materials["HandleFinishAluminium"].metalness = this.parameters.metalness;
                this.materials["HandleFinishAluminium"].roughness = this.parameters.roughness;
                this.materials["HandleFinishAluminium"].roughnessMap = null;
                this.materials["HandleFinishAluminium"].envMapIntensity = 0.5;

                break;
            case '#f1f0ea':
                this.materials["HandleFinishAluminium"] = new THREE.MeshStandardMaterial();

                this.materials["HandleFinishAluminium"].metalness = this.parameters.metalness;
                this.materials["HandleFinishAluminium"].roughness = this.parameters.roughness;
                this.materials["HandleFinishAluminium"].roughnessMap = null;
                this.materials["HandleFinishAluminium"].envMapIntensity = 0.5;

                break;

            case '#FF0000':
                this.materials["HandleFinishAluminium"] = new THREE.MeshBasicMaterial({color:0xFF0000});
                this.previousColor = this.materials["ProfileAluminium"].color;
                break;
            case '#AAAAAA':
                this.materials["HandleFinishAluminium"] = new THREE.MeshStandardMaterial();
                this.materials["HandleFinishAluminium"].metalness = 1.0;
                this.materials["HandleFinishAluminium"].roughness = 0.2;
                this.materials["HandleFinishAluminium"].roughnessMap = null;
                this.materials["HandleFinishAluminium"].envMapIntensity = 0.5;
                break;
        }
        this.materials["HandleFinishAluminium"].color = new THREE.Color(color).convertSRGBToLinear();

        this.materials["HandleFinishAluminium"].needsUpdate = true;

        const material = this.materials["HandleFinishAluminium"].clone();

        return material;

    }

    setMaterial(shape) {
        let material = this.materials["Painted Gray Aluminum"];
        if (!Designer.Utils.isObjectProperyUndefinedNull(shape, "useMaterial")) {
            switch (shape.useMaterial) {
                case "AL":
                case "ProfileAluminium":
                    material = this.materials["ProfileAluminium"];
                    break;
                case "ProfileDarkAluminum":
                    material = this.materials["Painted Dark Gray Aluminum"];
                    break;
                case "ProfilePVCU":
                case "ProfileIsolator":
                case "PL":
                    material = this.materials["NewPlastic"];   // dark to black material
                    break;
                case "KS":
                case "ProfilePEFoam":
                    material = this.materials["Foam"];   // dark grey
                    break;
                case "EPDM":
                case "GA":
                    material = this.materials["Gasket"];
                    break;
                case "VentFrameAluminium":
                    material = this.materials["VentFrameAluminium"];
                    break;
            }
        }
        return material;
    }
}