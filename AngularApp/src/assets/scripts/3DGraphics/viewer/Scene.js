class DesignerScene {

    constructor() {
        this.scene = new THREE.Scene();
        this.axesHelper = new DesignerAxesHelper();
        this.gridHelper = null;
        this.groundPlane = null;
        this.vaporwaveBG = null;
        this.gui = null;
        this.directLight = null;

        this.directLight2 = null;
        this.directLight3 = null;
        this.directLight4 = null;
        this.target = new THREE.Object3D();
        this.init();
    }

    init() {
        // this.gui = new dat.GUI();
        this.setLighting();
        this.addGrid();
        this.addAxesHelper();
        this.hideAxesHelper(); 
        this.initGroundPlane();
        const fogColorParams = {
            color:0x000000
        }
        this.scene.fog = new THREE.Fog(0x142227,8000,10000);
        //this.gui.addColor(fogColorParams, 'color').onChange(()=>{this.scene.fog.color = new THREE.Color(fogColorParams.color);Designer.Renderer.renderer.setClearColor(fogColorParams.color);});
    }

    addAxesHelper() {
        this.axesHelper.add(this.scene);
    }

    isAxesHelperVisible() {
        return this.axesHelper.visible;
    }

    hideAxesHelper() {
        this.axesHelper.hide();
    }

    showAxesHelper() {
        this.axesHelper.show();
    }
    turnOffLight(){
        this.directLight.visible = false;
        this.directLight2.visible = false;
        this.directLight3.visible = false;
        this.directLight4.visible = false;
    }
    turnOnLight(){
        this.directLight.visible = true;
        this.directLight2.visible = true;
        this.directLight3.visible = true;
        this.directLight4.visible = true;
    }
    addGrid() {
        var size = 150000;
        var divisions = 100;
        this.gridHelper = new THREE.GridHelper(size, divisions, 0x666666, 0x666666);
        this.scene.add(this.gridHelper);
    }

    isGridVisible() {
        return this.gridHelper.visible;
    }

    showGrid() {
        this.gridHelper.visible = true;
        this.groundPlane.visible = true;
    }

    hideGrid() {
        this.gridHelper.visible = false;
        this.groundPlane.visible = false;
    }

    updateGrid(showGrid) {
        if (showGrid) {
            this.showGrid();
            // document.getElementById("controls-grid").classList.add("selected");
            dataExchange.sendParentMessage('selectGrid', true);
        }
        else {
            this.hideGrid();
            // document.getElementById("controls-grid").classList.remove("selected");
            dataExchange.sendParentMessage('selectGrid', false);
        }
    }

    updateGroundPlane(showGroundPlane) {
        if (showGroundPlane) {
            this.showGroundPlane();
        }
        else {
            this.hideGroundPlane();
        }
    }

    setLighting() {
        // const lightingFolder = this.gui.addFolder("Lights");
        // Init Lighting
        this.directLight = new THREE.DirectionalLight(0xebebeb, 1.5);

        this.directLight2 = new THREE.DirectionalLight(0xebebeb, 1.5);
        this.directLight3 = new THREE.DirectionalLight(0xebebeb, 2.2);
        this.directLight4 = new THREE.DirectionalLight(0xebebeb, 2.2);
        let ambilight = new THREE.AmbientLight(0xebebeb, 0.5);
        let hemiLight = new THREE.HemisphereLight(0xebebeb, 0xf5f5f0, 0.8);
        let position = 5000;
        // Move lights forward
        this.directLight.position.z = 5000;
        this.directLight2.position.z = 2207;
        this.directLight3.position.z = -5000;
        this.directLight4.position.z = -2207;
        ambilight.position.z = position;
        hemiLight.position.z = position;

        // Move Light left
        this.directLight.position.x = -1333;
        // this.directLight.castShadow = false;
        // this.directLight2.castShadow = false;
        // this.directLight3.castShadow = false;
        this.directLight2.position.x = 1162;
        this.directLight3.position.x = -1802;
        this.directLight3.position.x = -1250;


        // Move lights up
        this.directLight.position.y = 1499;
        // lightingFolder.add(this.directLight, 'intensity').min(0).max(10).name("Directional Light 1 intensity");
        // lightingFolder.add(this.directLight.position, 'x').min(-5000).max(5000).name("Directional Light 1 x");
        // lightingFolder.add(this.directLight.position, 'y').min(-5000).max(5000).name("Directional Light 1 y");
        // lightingFolder.add(this.directLight.position, 'z').min(-5000).max(5000).name("Directional Light 1 z");
        
        this.directLight2.position.y = 1814;
        // lightingFolder.add( this.directLight2, 'intensity').min(0).max(10).name("Directional Light 2 intensity");
        // lightingFolder.add( this.directLight2.position, 'x').min(-5000).max(5000).name("Directional Light 2 x");
        // lightingFolder.add( this.directLight2.position, 'y').min(-5000).max(5000).name("Directional Light 2 y");
        // lightingFolder.add( this.directLight2.position, 'z').min(-5000).max(5000).name("Directional Light 2 z");

        this.directLight3.position.y = 1489;
        // lightingFolder.add( this.directLight3, 'intensity').min(0).max(10).name("Directional Light 3 intensity");
        // lightingFolder.add( this.directLight3.position, 'x').min(-5000).max(5000).name("Directional Light 3 x");
        // lightingFolder.add( this.directLight3.position, 'y').min(-5000).max(5000).name("Directional Light 3 y");
        // lightingFolder.add( this.directLight3.position, 'z').min(-5000).max(5000).name("Directional Light 3 z");

        this.directLight4.position.y = 1889;
        // lightingFolder.add( this.directLight4, 'intensity').min(0).max(10).name("Directional Light 3 intensity");
        // lightingFolder.add( this.directLight4.position, 'x').min(-5000).max(5000).name("Directional Light 3 x");
        // lightingFolder.add( this.directLight4.position, 'y').min(-5000).max(5000).name("Directional Light 3 y");
        // lightingFolder.add( this.directLight4.position, 'z').min(-5000).max(5000).name("Directional Light 3 z");
        
        ambilight.position.y = position;
        // lightingFolder.add( ambilight, 'intensity').min(0).max(1000).name("Ambient Light intensity");
        // lightingFolder.add( ambilight.position, 'x').min(-5000).max(5000).name("Ambient Light  x");
        // lightingFolder.add( ambilight.position, 'y').min(-5000).max(5000).name("Ambient Light  y");
        // lightingFolder.add( ambilight.position, 'z').min(-5000).max(5000).name("Ambient Light  z");
        
        hemiLight.position.y = position;
        // lightingFolder.add( hemiLight, 'intensity').min(0).max(100).name("HemiLight Light intensity");
        // lightingFolder.add( hemiLight.position, 'x').min(-5000).max(5000).name("HemiLight Light  x");
        // lightingFolder.add( hemiLight.position, 'y').min(-5000).max(5000).name("HemiLight Light  y");
        // lightingFolder.add( hemiLight.position, 'z').min(-5000).max(5000).name("HemiLight Light  z");

        
        // Keep Light centered
        ambilight.position.x = 0;

        // Move Light right
        hemiLight.position.x = position;

        // Add lights to scene
        this.scene.add(this.directLight);
        this.scene.add(this.directLight2);
        this.scene.add(this.directLight3);
        this.scene.add(this.directLight4);
        this.directLight4.layers.set(1);
        this.scene.add(this.target);
        this.directLight.target = this.target;
        this.directLight2.target = this.target;
        this.directLight3.target = this.target;
        this.directLight4.target = this.target;
        this.scene.add(ambilight);
        this.scene.add(hemiLight);
    }
    initGroundPlane(){
        const textureLoader = new THREE.TextureLoader();
        const floorColorMap = textureLoader.load("https://vcl-design-com.s3.amazonaws.com/StaticFiles/scripts/3DGraphics/content/textures/NewFloorDiffuse.jpg");
        floorColorMap.wrapS = THREE.RepeatWrapping;
        floorColorMap.wrapT = THREE.RepeatWrapping;
        floorColorMap.repeat = new THREE.Vector2(20,20);
        floorColorMap.encoding = THREE.sRGBEncoding;
        const floorAOMap = textureLoader.load("https://vcl-design-com.s3.amazonaws.com/StaticFiles/scripts/3DGraphics/content/textures/FloorAO.jpg");
        floorAOMap.wrapS = THREE.RepeatWrapping;
        floorAOMap.wrapT = THREE.RepeatWrapping;
        floorAOMap.repeat = new THREE.Vector2(20,20);
        floorAOMap.encoding = THREE.sRGBEncoding;
        const floorHeightMap = textureLoader.load("https://vcl-design-com.s3.amazonaws.com/StaticFiles/scripts/3DGraphics/content/textures/NewFloorDisplacement.jpg");
        floorHeightMap.wrapS = THREE.RepeatWrapping;
        floorHeightMap.wrapT = THREE.RepeatWrapping;
        floorHeightMap.repeat = new THREE.Vector2(20,20);
        floorHeightMap.encoding = THREE.sRGBEncoding;
        const floorNormalMap = textureLoader.load("https://vcl-design-com.s3.amazonaws.com/StaticFiles/scripts/3DGraphics/content/textures/NewFloorNormal.jpg");
        floorNormalMap.wrapS = THREE.RepeatWrapping;
        floorNormalMap.wrapT = THREE.RepeatWrapping;
        floorNormalMap.repeat = new THREE.Vector2(20,20);
        floorNormalMap.encoding = THREE.sRGBEncoding;
        const floorRoughnessMap = textureLoader.load("https://vcl-design-com.s3.amazonaws.com/StaticFiles/scripts/3DGraphics/content/textures/NewFloorRoughness.jpg");
        floorRoughnessMap.wrapS = THREE.RepeatWrapping;
        floorRoughnessMap.wrapT = THREE.RepeatWrapping;
        floorRoughnessMap.repeat = new THREE.Vector2(20,20);
        floorRoughnessMap.encoding = THREE.sRGBEncoding;

        const floorMetalnessMap = textureLoader.load("https://vcl-design-com.s3.amazonaws.com/StaticFiles/scripts/3DGraphics/content/textures/NewFloorMetalness.jpg");
        floorMetalnessMap.wrapS = THREE.RepeatWrapping;
        floorMetalnessMap.wrapT = THREE.RepeatWrapping;
        floorMetalnessMap.repeat = new THREE.Vector2(20,20);
        floorMetalnessMap.encoding = THREE.sRGBEncoding;
        
        this.groundPlane = new THREE.Mesh(
            new THREE.PlaneBufferGeometry(25,25,25), 
            new THREE.MeshStandardMaterial({
                color:0x040404,
                map: floorColorMap,
                displacementMap: floorHeightMap, 
                normalMap: floorNormalMap, 
                normalScale: new THREE.Vector2(2.5,2.5),
                roughnessMap: floorRoughnessMap,
                roughness:3.0,
                displacementScale:0.1,
                metalnessMap:floorMetalnessMap,
                metalness: 0.01,
                envMapIntensity:0.0,
                transparent: true, 
                opacity: 1.0,
                envMap: null, 
                aoMap: floorAOMap
        }));
        // this.gui.add( this.groundPlane.material, 'roughness').min(0).max(3).step(0.01).name("HemiLight Light intensity");
        // this.gui.add( this.groundPlane.material, 'metalness').min(0).max(3).step(0.01).name("HemiLight Light  x");
        this.groundPlane.renderOrder = -10;
        this.groundPlane.geometry.setAttribute(
            'uv2',
            new THREE.Float32BufferAttribute(this.groundPlane.geometry.attributes.uv.array, 2)
        )
        this.groundPlane.position.y = -800;

        this.groundPlane.rotation.x = -Math.PI/2;
        this.groundPlane.scale.set(10000,10000,10000);
        this.groundPlane.layers.set(3);
        this.scene.add(this.groundPlane);
    }
    PointLights(t){
        this.target.position.set(Designer.UnifiedModel.getWidth()/2, Designer.UnifiedModel.getHeight()/2, 0);
    }
    hideGroundPlaneEditMode(){

        this.groundPlane.material.opacity = 0.675;
        this.groundPlane.material.needsUpdate = true;
    }
    showGroundPlaneEditMode(){
        this.groundPlane.material.opacity = 1.0;
        this.groundPlane.material.needsUpdate = true;

    }
    hideGroundPlane()
    {
        this.groundPlane.visible = false;
    }
    showGroundPlane()
    {
        this.groundPlane.visible = true;
    }
    add(mesh) {
        this.scene.add(mesh);
    }

    remove(mesh) {
        this.scene.remove(mesh);
    }

    getScene() {
        return this.scene;
    }

    initVaporwaveAudio() {
        this.audio = new Audio("/Scripts/Designer/audio/resonance.mp3");
        this.audio.loop = true;
        this.audio.play();
    }

    initVaporwaveBG() {
        let path = [
            '/Scripts/Designer/skysphere/vaporwave.jpg',
        ];
        this.vaporwaveBG = new THREE.TextureLoader().load(path[0]);
        this.scene.background = this.vaporwaveBG;
    }

    vaporwave() {

        if (!this.vaporwaveBG) {
            this.initVaporwaveBG();
            this.initVaporwaveAudio();
            this.handleVaporwaveToggleCheckbox();
        } else {
            this.scene.background = this.vaporwaveBG;
            this.audio.play();
        }

        this.hideGrid();
        document.getElementById("designer-vaporwave-container").classList.remove("hidden");
        document.getElementById("designer-vaporwave-checkbox").checked = true;
        document.getElementById("designer-grid-checkbox").checked = false;
    }

    handleVaporwaveToggleCheckbox() {
        document.getElementById("designer-vaporwave-checkbox").addEventListener("click", (event) => {
            const checked = event.target.checked;
            if (checked) {
                Designer.Scene.vaporwave();
            } else {
                Designer.Scene.unvaporwave();
            }
        });
    }

    unvaporwave() {
        this.scene.background = null;
        this.audio.pause();
        document.getElementById("designer-vaporwave-container").classList.add("hidden");
        document.getElementById("designer-vaporwave-checkbox").checked = false;
    }
}
