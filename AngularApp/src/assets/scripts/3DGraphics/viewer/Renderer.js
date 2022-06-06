class DesignerRenderer {
    constructor(settings) {

        this.container = Designer.Settings.container;
        this.scene = Designer.Scene.scene;
        this.camera = Designer.Camera.camera;

        this.renderer = null;
        this.premGenerator = null;

        this.init();
        this.animate(this);
        this.listenBrowserResize();
        this.takingScreenshot = false;
    }

    listenBrowserResize() {

        window.addEventListener('resize', () => {

            const container = this.container;

            Designer.Camera.getCamera().aspect = container.clientWidth / container.clientHeight;
            Designer.Camera.getCamera().updateProjectionMatrix();

            this.renderer.setSize(container.clientWidth, container.clientHeight);

        }, false);

    }

    init() {
        console.log("initializing renderer in threeJS code");
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            preserveDrawingBuffer: true,
            alpha: true,
        });
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(this.getClientWidth(), this.getClientHeight());
        //this.renderer.setClearColor(0x474747);
        this.renderer.setClearColor(0x142227);
        //this.renderer.gammaOutput = true;
        //this.renderer.gammaFactor = 2.2;
        //this.renderer.gammaOutput = true;

        this.addRenderToContainer();
        this.pmremGenerator = new THREE.PMREMGenerator( this.renderer );
        //this.pmremGenerator.compileEquirectangularShader();
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.getContext().canvas.addEventListener("webglcontextlost", function(event){
            console.log("context lost. restarting context");
            event.preventDefault();
            this.init();
            this.animate(this);
            this.listenBrowserResize();
        }, false);
    }

    addRenderToContainer() {
        this.container.append(this.renderer.domElement);
    }


    animate() {
        requestAnimationFrame(e => this.animate());
        this.render();
        if(this.camera.position.z < 0)
        {
            //camera went from outside to inside
            if(Designer.Camera.outside == true)
            {
                //console.log("now inside");
                Designer.Camera.setOutside(false);
            }
        }
        else
        {
            //if went from outside to inside
            if(Designer.Camera.outside == false)
            {
                //console.log("now outside");
                Designer.Camera.setOutside(true);
            }
        }
        if (inputManager) {
            inputManager.requestAnimationFrame();
        }
    }

    render() {
        this.renderer.render(this.scene, this.camera);
    }

    getRenderer() {
        return this.renderer;
    }

    getClientWidth() {
        const container = this.container;
        return container.clientWidth;
        //return this.container.clientWidth;
    }

    getClientHeight() {
        const container = this.container;
        return container.clientHeight;
        //return this.container.clientHeight;
    }

    takeScreenShot() {
        const strMime = "image/png";
        const saveSetting = { ...Designer.DisplaySettings.currentDisplaySetting };
        if(Designer.Materials.materials["ProfileAluminium"].color.equals(new THREE.Color('#0E0D12')) || 
            Designer.Materials.materials["ProfileAluminium"].color.equals(new THREE.Color('#1B1718'))){
                Designer.Scene.turnOffLight();
            }
        Designer.EventListener.clearSelectedMeshes();
        Designer.EventListener.clearHighlightedMeshes();
        Designer.DisplaySettings.setScreenShotDispaly();
        Designer.Camera.centerCameraForScreenshot();
        this.takingScreenshot = true;
        this.renderer.setClearColor(0xffffff, 0);
        const AfterTakeShot = () => {
            const screenShotWait = async()=> {
                const imgData = await this.renderer.domElement.toDataURL(strMime);
                this.renderer.setClearColor(0x142227);

                Designer.DisplaySettings.updateDisplaySetting(saveSetting);    
                Designer.Scene.turnOnLight();

                dataExchange.sendParentMessage('screeshotImage', imgData);
                console.log('1. event in Renderer.js');
                this.takingScreenshot = false;
            }
            screenShotWait();
            
        }
        setTimeout(AfterTakeShot, 1000);
    }
}
