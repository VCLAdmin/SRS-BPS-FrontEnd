class DesignerIntermediate {

    constructor(settings) {
        this.memberType = settings.memberType;
        this.articleName = "article__" + settings.articleName;
        this.memberID = settings.memberID;
        this.PointA = settings.PointA;
        this.PointB = settings.PointB;
        this.isRed = settings.isRed;
        this.cutBack = settings.cutBack;

        // for custom profile
        this.isCustomProfile = settings.isCustomProfile;
        this.d = settings.d;
        this.Zoo = settings.Zoo;
        this.Zou = settings.Zou;
        this.Zuo = settings.Zuo;
        this.Zuu = settings.Zuu;
        this.Zol = settings.Zol;
        this.Zor = settings.Zor;
        this.Zul = settings.Zul;
        this.Zur = settings.Zur;
        this.Ao = settings.Ao;
        this.Au = settings.Au;

        this.intermediateArticle = null;
        this.articleWidth = 0;
        this.IntersectIntermediateArticleWidth = null;

        this.intermediateGroup = null;

        this.name = (this.memberType == 3) ? `transom_${this.memberID}__MainModel` : `mullion_${this.memberID}__MainModel`;

        this.init();
    }

    init() {
        this.readArticleProperties();
        this.getExtudePoints();
    }

    // read article data from article_articleNumber.js file in content/articles folder
    readArticleProperties() {
        let intermediateArticle = null;

        if (!this.isCustomProfile) {
            intermediateArticle = window[this.articleName]();
        }
        else {
            const customArticle = {
                d: this.d,
                Zoo: this.Zoo,
                Zou: this.Zou,
                Zuo: this.Zuo,
                Zuu: this.Zuu,
                Zol: this.Zol,
                Zor: this.Zor,
                Zul: this.Zul,
                Zur: this.Zur,
                Ao: this.Ao,
                Au: this.Au,
                system: "Custom Profile"
            };
            this.articleName = "article__CustomArticle";
            intermediateArticle = window[this.articleName](customArticle);
        }

        this.articleWidth = Math.max(intermediateArticle.outsideWidth, intermediateArticle.insideWidth);
        this.intermediateArticle = intermediateArticle;
    }

    getExtudePoints() {
        let PACutBack = this.getCutBack(this.PointA);
        let PBCutBack = this.getCutBack(this.PointB);       
        
        if (this.memberType == 3) {  //if member is transom
            if (this.PointA.X < this.PointB.X) {
                this.extrudePoints = [
                    new THREE.Vector2(this.PointA.X + PACutBack, this.PointA.Y + this.articleWidth / 2),
                    new THREE.Vector2(this.PointB.X - PBCutBack, this.PointB.Y + this.articleWidth / 2),
                ];
            } else {
                this.extrudePoints = [
                    new THREE.Vector2(this.PointA.X - PACutBack, this.PointA.Y - this.articleWidth / 2),
                    new THREE.Vector2(this.PointB.X + PBCutBack, this.PointB.Y - this.articleWidth / 2),
                ];
            }
        } else {  //if member is mullion
            if (this.PointA.Y < this.PointB.Y) {
                if(Designer.UnifiedModel.isDoorModel){
                    if(this.PointA.Y < 1e-4){
                        PACutBack = 0;
                    }
                    else if (this.PointB.Y < 1e-4){
                        PBCutBack = 0;
                    }
                }
                this.extrudePoints = [
                    new THREE.Vector2(this.PointA.X - this.articleWidth / 2, this.PointA.Y + PACutBack),
                    new THREE.Vector2(this.PointB.X - this.articleWidth / 2, this.PointB.Y - PBCutBack),
                ];
            } else {
                this.extrudePoints = [
                    new THREE.Vector2(this.PointA.X + this.articleWidth / 2, this.PointA.Y - PACutBack),
                    new THREE.Vector2(this.PointB.X + this.articleWidth / 2, this.PointB.Y + PBCutBack),
                ];
            }
        }
    }

    getCutBack(point) {
        let cutBack = 0;
        if (Math.abs(point.X) < 1e-4 || Math.abs(point.X - Designer.UnifiedModel.outerFrame.getWidth()) < 1e-4 ||
            Math.abs(point.Y) < 1e-4 || Math.abs(point.Y - Designer.UnifiedModel.outerFrame.getHeight()) < 1e-4) {
            cutBack = Designer.UnifiedModel.outerFrame.getArticleWidth();
        }
        else {
            cutBack = this.cutBack;
        }
        return cutBack;
    }

    // main function in class DesignerIntermediate, to generate extrusion for intermediate.
    generateIntermediateExtrusion() {
        const intermediateGroup = new THREE.Group();

        const intermediateArticle = this.intermediateArticle;

        for (var j in intermediateArticle.shapes) {
            let shape = intermediateArticle.shapes[j];
            let shapeGeometry = new THREE.ProfiledContourGeometry({
                shape: shape,
                points: this.extrudePoints,
                closed: false,
                capped: true
            });
            let shapeMaterial = Designer.Materials.setMaterial(shape);
            if (Designer.DisplaySettings && Designer.DisplaySettings.currentDisplaySetting.showStructuralResultColor) {
                const structuralResultColor = this.isRed ? 0xFF0000 : 0x00FF00;
                shapeMaterial = new THREE.MeshBasicMaterial({ color: structuralResultColor });
            }
            let shapeMesh = new THREE.Mesh(shapeGeometry, shapeMaterial);
            shapeMesh.userData.originalMaterial = shapeMaterial;

            intermediateGroup.add(shapeMesh);
        }
        intermediateGroup.name = this.name;
        intermediateGroup.userData.memberID = this.memberID;
        // add dimension box for dimension lines
        const xmin = Math.min(this.PointA.X, this.PointB.X);
        const xmax = Math.max(this.PointA.X, this.PointB.X);
        const ymin = Math.min(this.PointA.Y, this.PointB.Y);
        const ymax = Math.max(this.PointA.Y, this.PointB.Y);
        intermediateGroup.userData.dimensions = {
            xmin: xmin,
            xmax: xmax,
            ymin: ymin,
            ymax: ymax
        }
        const subtypes = new DesignerSubType();
        intermediateGroup.subtype = this.memberType == 3 ? subtypes.transom : subtypes.mullion;
        this.intermediateGroup = intermediateGroup;

        return intermediateGroup;
    }


}