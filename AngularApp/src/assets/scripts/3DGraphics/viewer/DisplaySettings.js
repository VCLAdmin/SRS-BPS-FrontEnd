class DesignerDisplaySettings {
    constructor() {
        this.currentDisplaySetting = {
            showThreeDView: null,
            showAxes: null,
            showGlassID: null,
            showVentInfo: null,
            showGrid: null,
            showGlazingTypeColor: null,
            showControls: null,
            enableOrbitControls: true,
            showThermalResultLabel: null,
            showStructuralResultColor: null,
            showBCSymbols: null,
            showQuickCheckSymbols: null,
            showGroundPlane: null

        };

        this.defaultDisplaySetting = {
            showThreeDView: false,
            showAxes: false,
            showGlassID: false, //true on click of glass and panel pane
            showVentInfo: false,
            showGrid: true,
            showGlazingTypeColor: false, //true
            showControls: true,
            enableOrbitControls: true,
            showThermalResultLabel: false,
            showStructuralResultColor: false,
            showQuickCheckSymbols: true,
            showGroundPlane: true

        };

        this.structuralResultDisplaySetting = {
            showThreeDView: false,
            showAxes: false,
            showGlassID: false,
            showVentInfo: false,
            showGrid: true,
            showGlazingTypeColor: false,
            showControls: false,
            enableOrbitControls: false,
            showThermalResultLabel: false,
            showStructuralResultColor: true,
            showBCSymbols: true,
            showQuickCheckSymbols: false,
            showGroundPlane: true
        };

        this.thermalResultDispalySetting = {
            showThreeDView: false,
            showAxes: false,
            showGlassID: true,
            showVentInfo: false,
            showGrid: true,
            showGlazingTypeColor: true,
            showControls: false,
            enableOrbitControls: false,
            showThermalResultLabel: true,
            showStructuralResultColor: false,
            showBCSymbols: false,
            showQuickCheckSymbols: false,
            showGroundPlane: true
        };

        this.screenShotSetting = {
            showThreeDView: false,
            showAxes: false,
            showGlassID: true,
            showVentInfo: true,
            showGrid: false,
            showGlazingTypeColor: true,
            showControls: false,
            enableOrbitControls: false,
            showThermalResultLabel: false,
            showStructuralResultColor: false,
            showBCSymbols: true,
            showQuickCheckSymbols: true,
            showGroundPlane: false
        };

        this.initialized = false;
        this.init();
    }

    init() {
        this.setDefaultDispaly();
    }

    // DisplaySetting
    updateDisplaySetting(settings) {
        // update only when setting exists and is changed
        if (typeof (settings.showThreeDView) != 'undefined' && settings.showThreeDView != null && this.currentDisplaySetting.showThreeDView != settings.showThreeDView) {
            this.updateShowThreeDView(settings.showThreeDView);
            this.currentDisplaySetting.showThreeDView = settings.showThreeDView;
        }
        if (typeof (settings.showAxes) != 'undefined' && this.currentDisplaySetting.showAxes != settings.showAxes) {
            Designer.Scene.axesHelper.updateAxes(settings.showAxes)
            this.currentDisplaySetting.showAxes = settings.showAxes;
        }
        if (typeof (settings.showGrid) != 'undefined' && this.currentDisplaySetting.showGrid != settings.showGrid) {
            Designer.Scene.updateGrid(settings.showGrid);
            this.currentDisplaySetting.showGrid = settings.showGrid;
        }
        if (typeof (settings.showGroundPlane) != 'undefined' && this.currentDisplaySetting.showGroundPlane != settings.showGroundPlane) {
            Designer.Scene.updateGroundPlane(settings.showGroundPlane);
            this.currentDisplaySetting.showGroundPlane = settings.showGroundPlane;
        }
        if (typeof (settings.showGlassID) != 'undefined') {
            Designer.UnifiedModel.updateGlassIdDisplay(settings.showGlassID);
            this.currentDisplaySetting.showGlassID = settings.showGlassID;
        }
        if (typeof (settings.showVentInfo) != 'undefined') {
            let isVentUpdated = Designer.UnifiedModel.updateVentInfoDisplay(settings.showVentInfo);
            if (isVentUpdated) this.currentDisplaySetting.showVentInfo = settings.showVentInfo;
        }
        if (typeof (settings.showGlazingTypeColor) != 'undefined') {
            Designer.UnifiedModel.updateGlazingTypeColor(settings.showGlazingTypeColor);
            this.currentDisplaySetting.showGlazingTypeColor = settings.showGlazingTypeColor;
        }
        if (typeof (settings.enableOrbitControls) != 'undefined' && this.currentDisplaySetting.enableOrbitControls != settings.enableOrbitControls) {
            Designer.Controls.controls.enabled = settings.enableOrbitControls;
            this.currentDisplaySetting.enableOrbitControls = settings.enableOrbitControls;
        }
        if (typeof (settings.showControls) != 'undefined' && this.currentDisplaySetting.showControls != settings.showControls) {
            this.updateControlsDisplay(settings.showControls);
            this.currentDisplaySetting.showControls = settings.showControls;
        }
        if (typeof (settings.showThermalResultLabel) != 'undefined' && this.currentDisplaySetting.showThermalResultLabel != settings.showThermalResultLabel) {
            Designer.UnifiedModel.updateThermalResultLabel(settings.showThermalResultLabel);
            this.currentDisplaySetting.showThermalResultLabel = settings.showThermalResultLabel;
        }
        if (typeof (settings.showStructuralResultColor) != 'undefined' && this.currentDisplaySetting.showStructuralResultColor != settings.showStructuralResultColor) {
            this.currentDisplaySetting.showStructuralResultColor = settings.showStructuralResultColor;
            if (Designer.UnifiedModel.UnifiedModelJSON) Designer.UnifiedModel.drawModel();
        }
        if (typeof (settings.showBCSymbols) != 'undefined' && this.currentDisplaySetting.showBCSymbols != settings.showBCSymbols) {
            this.currentDisplaySetting.showBCSymbols = settings.showBCSymbols;
            Designer.UnifiedModel.updateBCDisplay(settings.showBCSymbols);
        }
        if (typeof (settings.showQuickCheckSymbols) != 'undefined' && this.currentDisplaySetting.showQuickCheckSymbols != settings.showQuickCheckSymbols) {
            this.currentDisplaySetting.showQuickCheckSymbols = settings.showQuickCheckSymbols;
            Designer.UnifiedModel.runQuickCheck(settings.showQuickCheckSymbols);
        }
    }

    restoreDispalySetting() {
        this.updateDisplaySetting(this.currentDisplaySetting);
    }

    setDefaultDispaly() {
        this.updateDisplaySetting(this.defaultDisplaySetting);
    }


    setStructuralResultDispaly() {
        this.updateDisplaySetting(this.structuralResultDisplaySetting);
    }

    setScreenShotDispaly() {
        this.updateDisplaySetting(this.screenShotSetting);
    }

    setThermalResultDispaly() {
        this.updateDisplaySetting(this.thermalResultDisplaySetting);
    }

    updateShowThreeDView(showThreeDView) {
        if (showThreeDView) {
            dataExchange.sendParentMessage('showControlEdit', true);
            // document.getElementById("controls-edit").classList.remove("hidden");
            // document.getElementById("controls-add-transom").classList.add("hidden");
            // document.getElementById("controls-add-mullion").classList.add("hidden");
            // document.getElementById("controls-delete").classList.add("hidden");
            if (Designer.DimensionLines) Designer.DimensionLines.clear();
            Designer.Scene.showGroundPlaneEditMode();
        }
        else {
            dataExchange.sendParentMessage('showControlEdit', false);
            // document.getElementById("controls-edit").classList.add("hidden");
            // document.getElementById("controls-add-transom").classList.remove("hidden");
            // document.getElementById("controls-add-mullion").classList.remove("hidden");
            // document.getElementById("controls-delete").classList.remove("hidden");
            Designer.Camera.centerCamera();
            if (Designer.DimensionLines) Designer.DimensionLines.generate(); //As per my discussion with Wei, he suggested this change
            Designer.Scene.hideGroundPlaneEditMode();
        }
    }

    isThreeDMode() {
        return this.currentDisplaySetting.showThreeDView;
    }

    setThreeDMode() {
        const threeDSetting = {
            showThreeDView: true,
            showGlassID: false,
            showGlazingTypeColor: false,
            showVentInfo: false,
            showBCSymbols: false,
        }
        this.updateDisplaySetting(threeDSetting);
    }

    updateControlsDisplay(showControls) {
        if (showControls) {
            dataExchange.sendParentMessage('showControls', true);
            // document.getElementById("model-controls").classList.remove("hidden");
            // document.getElementById("display-controls").classList.remove("hidden");
        }
        else {
            dataExchange.sendParentMessage('showControls', false);
            // document.getElementById("model-controls").classList.add("hidden");
            // document.getElementById("display-controls").classList.add("hidden");
            if (Designer.DimensionLines) Designer.DimensionLines.clear()
        }
    }
}
