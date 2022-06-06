class DesignerCamera {

    constructor(settings) {
        let clientWidth = Designer.Settings.getClientWidth();
        let clientHeight = Designer.Settings.getClientHeight();
        let aspectRatio = clientWidth / clientHeight;

        this.camera = new THREE.PerspectiveCamera(45, aspectRatio, 1, 50000);
        this.camera.layers.enable(3);
        this.currentPosition = this.camera.position.clone();
        this.targetPosition = this.currentPosition.clone();
        this.prevPosition = new THREE.Vector3();
        this.moveTimer = -1;
        this.moveTimerLength = 0.75;
        this.delta = 0;
        this.time = Date.now();
        this.camera.position.set(0, 1260, 4000);
        this.outside = true;
        this.animate(this);
    }

    cameraSetInitialPosition() {
        this.centerCamera();
    }

    animate() {
        requestAnimationFrame(e => this.animate());
        const currentTime = Date.now();
        const deltaTime = currentTime - this.time;
        this.time = currentTime;
        if(this.moveTimer >= 0 && this.moveTimer <= this.moveTimerLength){
            this.moveTimer += deltaTime/1000;
            this.camera.position.lerpVectors(this.prevPosition, this.targetPosition,this.moveTimer/this.moveTimerLength);
            Designer.Controls.targetMainModel();

            if(this.moveTimer >= this.moveTimerLength){
                Designer.Controls.enableControls();
                //Designer.Controls.targetMainModel();
            }
        }
        else{
            this.moveTimer = -1;
        }
    }

    centerCamera() {
        if(!this.outside) {
            this.setOutside(true);
        }

        const mainModel = Designer.UnifiedModel.getMainModel();
        if (mainModel) {
            const mainModelCentroid = Designer.Utils.getCentroid(mainModel);
            const fov = (this.camera.fov - 15) * (Math.PI / 180);
            const width = Designer.UnifiedModel.getWidth();
            const height = Designer.UnifiedModel.getHeight();

            var aspect = this.camera.aspect;
            if (!aspect) {
                aspect = document.getElementById("sps-designer-viewer").clientWidth / document.getElementById("sps-designer-viewer").clientHeight;
            }
            const CameraZ_w = width / 2 / Math.tan(fov / 2) / aspect;
            const CameraZ_h = height / 2 / Math.tan(fov / 2);
            const CameraZ = Math.max(CameraZ_w, CameraZ_h);

            // this.prevPosition = this.camera.position.clone();
            // this.targetPosition = new THREE.Vector3(mainModelCentroid.x, mainModelCentroid.y, -mainModelCentroid.z + CameraZ);
            // this.moveTimer = 0;
            // this.moveTimerLength = this.prevPosition.distanceTo(this.targetPosition) / 4500;
            // Designer.Controls.disableControls();

            this.camera.position.set(mainModelCentroid.x, mainModelCentroid.y, mainModelCentroid.z + CameraZ);

            Designer.Scene.scene.fog.near = mainModelCentroid.z + CameraZ + 10000;
            Designer.Scene.scene.fog.far = mainModelCentroid.z + CameraZ + 18000;
            Designer.Controls.controls.update();
            Designer.Controls.targetMainModel();
        }
        // try to solve TJ's Camera center issue
        else {
            setTimeout(() => {
                this.centerCamera();
            }, 500);
        }
    }

    centerCameraInside(){
        const mainModel = Designer.UnifiedModel.getMainModel();
        if(this.outside) this.setOutside(false);
        if (mainModel) {
            const mainModelCentroid = Designer.Utils.getCentroid(mainModel);
            const fov = (this.camera.fov - 15) * (Math.PI / 180);
            const width = Designer.UnifiedModel.getWidth();
            const height = Designer.UnifiedModel.getHeight();
            var aspect = this.camera.aspect;
            if (!aspect) {
                aspect = document.getElementById("sps-designer-viewer").clientWidth / document.getElementById("sps-designer-viewer").clientHeight;
            }
            const CameraZ_w = width / 2 / Math.tan(fov / 2) / aspect;
            const CameraZ_h = height / 2 / Math.tan(fov / 2);
            const CameraZ = Math.max(CameraZ_w, CameraZ_h);

            // this.prevPosition = this.camera.position.clone();
            // this.targetPosition = new THREE.Vector3(mainModelCentroid.x, mainModelCentroid.y, -1*(mainModelCentroid.z + CameraZ));
            // this.moveTimer = 0;
            // this.moveTimerLength = this.prevPosition.distanceTo(this.targetPosition) / 4500;

            // Designer.Controls.disableControls();

            this.camera.position.set(mainModelCentroid.x, mainModelCentroid.y, -1*(mainModelCentroid.z + CameraZ));
            Designer.Controls.controls.update();
            Designer.Controls.targetMainModel();
        }
        // try to solve TJ's Camera center issue
        else {
            setTimeout(() => {
                this.moveCameraInside();
            }, 500);
        }
    }

    centerCameraForScreenshot() {
        const mainModel = Designer.UnifiedModel.getMainModel();
        if (mainModel) {
            const mainModelCentroid = Designer.Utils.getCentroid(mainModel);
            const width = Designer.UnifiedModel.getWidth();
            const height = Designer.UnifiedModel.getHeight();
            let fov = 0;
            if(width > 3000 && (width / height) > 1.33 )
            fov = (this.camera.fov - 30) * (Math.PI / 180);
            else
            fov = (this.camera.fov - 15) * (Math.PI / 180);

            var aspect = this.camera.aspect;
            if (!aspect) {
                aspect = document.getElementById("sps-designer-viewer").clientWidth / document.getElementById("sps-designer-viewer").clientHeight;
            }
            const CameraZ_w = width / 2 / Math.tan(fov / 2) / aspect;
            const CameraZ_h = height / 2 / Math.tan(fov / 2);
            const CameraZ = Math.max(CameraZ_w, CameraZ_h);

            this.camera.position.set(mainModelCentroid.x, mainModelCentroid.y, mainModelCentroid.z + CameraZ);
            Designer.Scene.scene.fog.near = mainModelCentroid.z + CameraZ + 10000;
            Designer.Scene.scene.fog.far = mainModelCentroid.z + CameraZ + 18000;
            Designer.Controls.controls.update();
            Designer.Controls.targetMainModel();
        }
        // try to solve TJ's Camera center issue
        else {
            setTimeout(() => {
                this.centerCamera();
            }, 500);
        }
    }

    getCamera() {
        return this.camera;
    }

    getOutside(){
        return this.outside;
    }

    setOutside(isOutside){
        this.outside = isOutside;
        for(let i = 0; i < Designer.UnifiedModel.ventFrames.length; i++){
            //let newVentInfo = new THREE.Line(Designer.UnifiedModel.ventFrames[i].ventInfo.geometry)
            if(Designer.UnifiedModel.ventFrames[i].ventInfo != null)
            {
                if(Designer.UnifiedModel.ventFrames[i].ventInfo.material.name == "solid"){
                    Designer.UnifiedModel.ventFrames[i].ventInfo.material = new THREE.LineDashedMaterial({
                        name: "dashed",
                        color: 0xBFBFBF,
                        linewidth: 1,
                        scale: 1,
                        dashSize: 20,
                        gapSize: 20,
                    });
                }
                else{
                    Designer.UnifiedModel.ventFrames[i].ventInfo.material = new THREE.LineBasicMaterial({
                        name: "solid",
                        color: 0xBFBFBF
                    });
                }
                Designer.UnifiedModel.ventFrames[i].ventInfo.position.z *= -1;
                Designer.UnifiedModel.ventFrames[i].ventInfo.material.needsUpdate = true;
                Designer.UnifiedModel.ventFrames[i].ventInfo.needsUpdate = true;
            }
            
            

        }
        for(let i = 0; i < Designer.UnifiedModel.doorFrames.length; i++){
            //let newVentInfo = new THREE.Line(Designer.UnifiedModel.ventFrames[i].ventInfo.geometry)
            if(Designer.UnifiedModel.ProductType != "SlidingDoor"){
                if(Designer.UnifiedModel.doorFrames[i].ventInfo != null)
                {
                    Designer.UnifiedModel.doorFrames[i].ventInfo.position.z *= -1;
                    Designer.UnifiedModel.doorFrames[i].ventInfo.material.needsUpdate = true;
                    Designer.UnifiedModel.doorFrames[i].ventInfo.needsUpdate = true;
                }
            }
            
        }
        if(Designer.UnifiedModel.quickCheck && Designer.UnifiedModel.quickCheck.WarningSymbolGroup){
           if(Designer.UnifiedModel.quickCheck.WarningSymbolGroup.position.z == 0){
            Designer.UnifiedModel.quickCheck.WarningSymbolGroup.position.z = -275;
           }
           else{
            Designer.UnifiedModel.quickCheck.WarningSymbolGroup.position.z = 0;
           }
        }
        dataExchange.sendParentMessage('changeOutside', this.outside);
    }
}