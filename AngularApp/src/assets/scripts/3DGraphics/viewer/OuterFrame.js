class DesignerOuterFrame {

    constructor(settings) {

        this.system = settings.system;
        this.articleName = settings.articleName;
        this.width = settings.width;
        this.height = settings.height;
        this.isDoorModel = settings.isDoorModel;
        this.bottomArticleName = settings.bottomArticleName; //for sliding door systems
        this.trackArticleName = null; //for sliding door systems
        this.insulatingProfileTopName = null; //for sliding door systems
        this.insulatingProfileBottomName = null; //for sliding door systems
        this.dripBarName = null; //for sliding door systems
        this.guideTrackName = null; //for sliding door systems
        this.thresholdName = null; //for sliding door systems
        this.VentOperableType = settings.VentOperableType; //for sliding door systems
        
        this.articleJSFilePath = `https://vcl-design-com.s3.amazonaws.com/StaticFiles/scripts/3DGraphics/content/articles/${this.articleName}.js`
        this.articleNames = [];
        this.articleTypes = [];
        this.articleWidth = 0;
        this.bottomArticleWidth = 0;
        this.articleDepth = 0;

        // for cut planes
        this.planeVerticalTop = null;
        this.planeVerticalBottom = null;
        this.planeHorizontalLeft = null;
        this.planeHorizontalRight = null;
        this.extrudePath = null;

        // Points of the extrusion path
        this.extrudePoints = [
            new THREE.Vector2(0, 0),
            new THREE.Vector2(0, this.height),
            new THREE.Vector2(this.width, this.height),
            new THREE.Vector2(this.width, 0)
        ];

        this.init();
    }

    init() {
        this.readSystemProperties();
    }

    // read article data from article_articleNumber.js file in content/articles folder
    readSystemProperties() {
        this.system[Designer.ArticleTypes.OUTER_FRAME].articles = [this.articleName];
        let articleData = null;
        let article = null;
        for (var i in this.system) {
            for (var j in this.system[i].articles) {
                //have to check these for sliding systems, have to be extruded in a special way
                if(i == "Track"){
                    this.trackArticleName = this.system[i].articles[0];
                    continue;
                }
                else if (i == "Insulating Profile Top"){
                    this.insulatingProfileTopName = this.system[i].articles[0];
                    continue;
                }
                else if (i == "Insulating Profile Bottom"){
                    this.insulatingProfileBottomName = this.system[i].articles[0];
                    continue;
                }
                else if (i == "Drip Bar"){
                    this.dripBarName = this.system[i].articles[0];
                    continue;
                }
                else if (i == "Guide Track"){
                    this.guideTrackName = this.system[i].articles[0];
                    continue;
                }
                else if (i == "Threshold"){ //don't need threshold if configuration doesnt have one 
                    if(!this.VentOperableType.includes("SlidingDoor-Type-2A-") && !this.VentOperableType.includes("SlidingDoor-Type-3E-")){
                        this.thresholdName = this.system[i].articles[0];
                    }
                    continue;
                }
                else if(i == "Side Cover"){
                    continue;
                }
                articleData = this.system[i];
                article = window[this.system[i].articles[j]]();   // read from article_articleNumber.js
                articleData.depth = article.depth !== "null" ? parseInt(article.depth) : 0;
                articleData.offset = article.offsetReferance !== "null" ? article.offsetReferance : false;
                articleData.offsetInner = article.insideWidth !== "null" ? parseInt(article.insideWidth) : 0;
                articleData.offsetOuter = article.outsideWidth !== "null" ? parseInt(article.outsideWidth) : 0;
                articleData.articleType = article.type;
                this.articleWidth = Math.max(this.articleWidth, article.outsideWidth, article.insideWidth);
                this.articleDepth = Math.max(this.articleDepth, article.depth);
            }
        }
        if(this.bottomArticleName != null){
            this.system[Designer.ArticleTypes.OUTER_FRAME].bottomArticles = [
                this.bottomArticleName, 
                this.trackArticleName, 
                this.insulatingProfileBottomName, 
                this.insulatingProfileTopName,
                this.dripBarName, 
                this.guideTrackName
            ];
            if(this.thresholdName != null) this.system[Designer.ArticleTypes.OUTER_FRAME].bottomArticles.push(this.thresholdName);
            let articleData = null;
            let article = null;
            for (var i in this.system) {
                for (var j in this.system[i].bottomArticles) {
                    articleData = this.system[i];
                    article = window[this.system[i].bottomArticles[j]]();   // read from article_articleNumber.js
                    articleData.depth = article.depth !== "null" ? parseInt(article.depth) : 0;
                    articleData.offset = article.offsetReferance !== "null" ? article.offsetReferance : false;
                    articleData.offsetInner = article.insideWidth !== "null" ? parseInt(article.insideWidth) : 0;
                    articleData.offsetOuter = article.outsideWidth !== "null" ? parseInt(article.outsideWidth) : 0;
                    articleData.articleType = article.type;
                    this.bottomArticleWidth = Math.max(this.bottomArticleWidth, article.outsideWidth, article.insideWidth);
                }
            }
            
        }
    }

    createCutPlane() {
        this.planeVerticalTop = new THREE.Mesh(new THREE.BoxGeometry(200, 750, 500), new THREE.MeshBasicMaterial({ color: 0xffffff, side: 2 }));
        this.planeVerticalBottom = new THREE.Mesh(new THREE.BoxGeometry(200, 750, 500), new THREE.MeshBasicMaterial({ color: 0xffffff, side: 2 }));
        this.planeHorizontalLeft = new THREE.Mesh(new THREE.BoxGeometry(200, 750, 500), new THREE.MeshBasicMaterial({ color: 0xffffff, side: 2 }));
        this.planeHorizontalRight = new THREE.Mesh(new THREE.BoxGeometry(200, 750, 500), new THREE.MeshBasicMaterial({ color: 0xffffff, side: 2 }));

        let width = this.getWidth();
        let height = this.getHeight();
        let offset = 141.4;

        this.planeVerticalTop.position.set(0, height + offset, 0);
        this.planeVerticalBottom.position.set(0, -offset, 0);
        this.planeHorizontalLeft.position.set(-offset, 0, 0);
        this.planeHorizontalRight.position.set(width + offset, 0, 0);

        this.planeVerticalTop.rotateZ(Math.PI / 4);
        this.planeVerticalBottom.rotateZ((7 * Math.PI) / 4);
        this.planeHorizontalLeft.rotateZ((3 * Math.PI) / 4);
        this.planeHorizontalRight.rotateZ((Math.PI) / 4);

        this.planeVerticalTop = new ThreeBSP(this.planeVerticalTop);
        this.planeVerticalBottom = new ThreeBSP(this.planeVerticalBottom);
        this.planeHorizontalLeft = new ThreeBSP(this.planeHorizontalLeft);
        this.planeHorizontalRight = new ThreeBSP(this.planeHorizontalRight);
    }

    // main function in class DesignerOuterFrame, to generate extrusion for outer frame.
    generateOuterFrameExtrusion() {
        const mainModel = new THREE.Group();

        this.createCutPlane();

        let oppositeSide = null;
        let dimensions = null;
        const subtypes = new DesignerSubType();
        const frameNames = new DesignerFrameNames();

        this.articleNames = [];
        this.articleTypes = [];

        const articles = this.processArticles();
        const vertical = articles.vertical;
        const horizontal = articles.horizontal;

        this.setOuterFrameSubType(vertical);
        this.setOuterFrameSubType(horizontal);

        vertical.name = frameNames.leftJamb;
        vertical.subtype = subtypes.outerInnerFrame;
        mainModel.add(vertical);

        oppositeSide = vertical.clone();
        dimensions = Designer.Utils.getDimensions(oppositeSide);
        const scaleFlipX = new THREE.Vector3(-1, 1, 1);
        oppositeSide.scale.multiply(scaleFlipX);
        oppositeSide.position.x = this.getWidth();
        oppositeSide.name = frameNames.rightJamb;
        oppositeSide.subtype = subtypes.outerInnerFrame;
        this.setOuterFrameSubType(oppositeSide);
        mainModel.add(oppositeSide);

        horizontal.name = frameNames.sill;
        horizontal.subtype = subtypes.outerInnerFrame;
        if (!this.isDoorModel) mainModel.add(horizontal);
        else if (this.bottomArticleName != null){
            //sliding doors have a different article for the bottom of the unit
            //sliding doors also have insulating profiles and tracks that appear only on top, bottom, or both (not on sides)
            
            const bottomArticlesGroup = this.processBottomFrameArticles();
            //grab each article
            const bottomArticle = bottomArticlesGroup.bottomArticle;
            const bottomTrack = bottomArticlesGroup.track;
            const bottomInsulatingTop = bottomArticlesGroup.insulatingTop;
            const bottomInsulatingBottom = bottomArticlesGroup.insulatingBottom;
            const dripBar = bottomArticlesGroup.dripBar;
            const guideTrack = bottomArticlesGroup.guideTrack;
            const threshold = bottomArticlesGroup.threshold;
            this.setOuterFrameSubType(bottomArticle);
            this.setOuterFrameSubType(bottomTrack);
            this.setOuterFrameSubType(bottomInsulatingBottom);
            this.setOuterFrameSubType(bottomInsulatingTop);
            this.setOuterFrameSubType(dripBar);
            this.setOuterFrameSubType(guideTrack);
            this.setOuterFrameSubType(threshold);
            bottomArticle.name = frameNames.sill;
            bottomTrack.name = frameNames.sill;
            bottomInsulatingBottom.name = frameNames.sill;
            bottomInsulatingTop.name = frameNames.sill;
            dripBar.name = frameNames.sill;
            guideTrack.name = frameNames.sill;
            threshold.name = frameNames.sill;
            bottomArticle.subtype = subtypes.outerInnerFrame;
            bottomTrack.subtype = subtypes.outerInnerFrame;
            bottomInsulatingBottom.subtype = subtypes.outerInnerFrame;
            bottomInsulatingTop.subtype = subtypes.outerInnerFrame;
            dripBar.subtype = subtypes.outerInnerFrame;
            guideTrack.subtype = subtypes.outerInnerFrame;
            threshold.subtype = subtypes.outerInnerFrame;
            mainModel.add(bottomArticle);
            mainModel.add(bottomInsulatingBottom);
            mainModel.add(bottomInsulatingTop);
            mainModel.add(dripBar);
            mainModel.add(guideTrack);
            //transform bottom tracks (two or three on bottom and top)
            bottomTrack.rotation.x = Math.PI/2;
            bottomTrack.position.y = 45.89;
            bottomTrack.position.z = -32.41;
            if(this.VentOperableType.includes("2A1") || this.VentOperableType.includes("2D") || this.VentOperableType.includes("3E1") || this.VentOperableType.includes("3F")){
                threshold.rotation.x = Math.PI/2;
                threshold.position.y = 32;
                threshold.position.z = -60;
                mainModel.add(threshold);

            }
            else{
                mainModel.add(bottomTrack);
            }
            let bottomTrack2 = bottomTrack.clone();
            bottomTrack2.position.z = -112.41;
            mainModel.add(bottomTrack2);
            
            //transform bottom insulating profile (one or two on bottom and top)
            bottomInsulatingBottom.position.y = 32;
            bottomInsulatingBottom.position.z = -37.70;
            bottomInsulatingTop.position.y = this.height - 44;
            bottomInsulatingTop.position.z = -37.70;
            
            //transform drip bar
            dripBar.position.y = this.height -32;
            dripBar.scale.y = -1;
            let dripBar2 = dripBar.clone();
            let bbox = new THREE.Box3().setFromObject(mainModel);
            dripBar2.position.z = -this.articleDepth;
            dripBar2.scale.z = -1;
            mainModel.add(dripBar2);

            //transform guide track
            guideTrack.position.y = this.height - 48;
            guideTrack.rotation.x = Math.PI/2;
            guideTrack.position.z = -117.41;
            let guideTrack2 = guideTrack.clone();
            guideTrack2.position.z = -37.70;
            mainModel.add(guideTrack2);
            
            //transform threshold
            


            if(this.VentOperableType.includes("3")){
                let bottomTrack3 = bottomTrack.clone();
                bottomTrack3.position.z = -192.41;
                mainModel.add(bottomTrack3);
                let bottomInsulatingBottom2 = bottomInsulatingBottom.clone();
                bottomInsulatingBottom2.position.z = -117.70;
                mainModel.add(bottomInsulatingBottom2);
                let bottomInsulatingTop2 = bottomInsulatingTop.clone();
                bottomInsulatingTop2.position.z = -117.70;
                mainModel.add(bottomInsulatingTop2);
                let guidetrack3 = guideTrack2.clone();
                guidetrack3.position.z = -197.70;
                mainModel.add(guidetrack3);
            }
            

        }
        

        oppositeSide = horizontal.clone();
        dimensions = Designer.Utils.getDimensions(oppositeSide);
        const scaleFlipY = new THREE.Vector3(1, -1, 1);
        oppositeSide.scale.multiply(scaleFlipY);
        oppositeSide.position.y = this.getHeight();
        oppositeSide.name = frameNames.head;
        oppositeSide.subtype = subtypes.outerInnerFrame;
        this.setOuterFrameSubType(oppositeSide);
        mainModel.add(oppositeSide);
        mainModel.name = Designer.UnifiedModel.getModelName();
        return mainModel;
    }

    processArticles() {
        let offsetZ = 0;
        let article = null;
        let extrudeArticleVertical = null;
        let extrudeArticleHorizontal = null;
        let updatedPoints = [];
        const extrudeMeshVertical = new THREE.Group();
        const extrudeMeshHorizontal = new THREE.Group();
        const startPoints = this.clonePoints();
        const stepVal = 2;
        const steps = stepVal;
        const curveSegments = stepVal;
        for (var i in this.system) {
            for (var j in this.system[i].articles) {
                if(i == "Track" || i =="Insulating Profile Top" || i == "Insulating Profile Bottom" || 
                    i == "Drip Bar" || i == "Guide Track" || i == "Threshold" || i == "Side Cover"){
                    continue;
                }
                // Basic setup
                article = window[this.system[i].articles[j]]();

                extrudeArticleVertical = new THREE.Group();
                extrudeArticleVertical.name = article.name;
                extrudeArticleVertical.articleType = article.type || null;

                extrudeArticleHorizontal = new THREE.Group();
                extrudeArticleHorizontal.name = article.name;
                extrudeArticleHorizontal.articleType = article.type || null;

                // Some articles will have the offset
                // initialize points here and we'll update it later
                updatedPoints = this.clonePoints();

                // Keep track of the type and name of each article - used externally by other classes
                this.articleTypes.push(article.type);
                this.articleNames.push(article.name);

                // Update (x, y) points based on offset - returns z point to be applied after extrusion
                offsetZ = this.offsetPoints(updatedPoints, article);
                let verticalExtrudePath = new THREE.CatmullRomCurve3([
                    new THREE.Vector3(startPoints[0].y, 0, 0),
                    new THREE.Vector3(startPoints[1].y, 0, 0),
                ], false, "centripetal", 0.5);

                let horizontalExtrudePath = new THREE.CatmullRomCurve3([
                    new THREE.Vector3(startPoints[0].x, 0, 0),
                    new THREE.Vector3(startPoints[3].x, 0, 0),
                ], false, "centripetal", 0.5);

                for (var k in article.shapes) {
                    let shape = article.shapes[k];
                    let geometryVertical = new THREE.ExtrudeGeometry(shape, {
                        steps: steps,
                        curveSegments: curveSegments,
                        bevelEnabled: false,
                        extrudePath: verticalExtrudePath
                    });

                    let material = Designer.Materials.setMaterial(shape);
                    let shapeMeshVertical = new THREE.Mesh(geometryVertical, material);
                    
                    shapeMeshVertical.rotateY(-Math.PI/2);
                    
                    shapeMeshVertical.rotateZ(Math.PI/2);

                    shapeMeshVertical.position.z += offsetZ;
                    shapeMeshVertical.position.x += updatedPoints[0].x;
                    let cube = shapeMeshVertical;
                    let clone = cube.clone();
                    clone = new ThreeBSP(clone);
                    clone = clone.subtract(this.planeVerticalTop);
                    if (!this.isDoorModel || this.bottomArticleName != null) clone = clone.subtract(this.planeVerticalBottom);
                    clone = clone.toMesh(material);
                    shapeMeshVertical = clone;
                    shapeMeshVertical.userData.originalMaterial = material;
                    extrudeArticleVertical.add(shapeMeshVertical);
                    shapeMeshVertical.geometry.verticesNeedUpdate = true;
                    shapeMeshVertical.geometry.normalsNeedUpdate = true;
                    shapeMeshVertical.geometry.computeBoundingSphere();
                    shapeMeshVertical.geometry.computeFaceNormals();
                    //shapeMeshVertical.geometry.computeVertexNormals();
                    let geometryHorizontal = new THREE.ExtrudeGeometry(shape, {
                        steps: steps,
                        curveSegments: curveSegments,
                        bevelEnabled: false,
                        extrudePath: horizontalExtrudePath
                    });
                    let shapeMeshHorizontal = new THREE.Mesh(geometryHorizontal, material);
                    shapeMeshHorizontal.translateX(this.getWidth());
                    shapeMeshHorizontal.rotateY(Math.PI);
                    shapeMeshHorizontal.rotateX((Math.PI) / 2);
                    shapeMeshHorizontal.position.z += offsetZ;
                    shapeMeshHorizontal.position.y += updatedPoints[0].y;
                    cube = shapeMeshHorizontal;
                    clone = cube.clone();
                    clone = new ThreeBSP(clone);
                    clone = clone.subtract(this.planeHorizontalLeft);
                    clone = clone.subtract(this.planeHorizontalRight);
                    clone = clone.toMesh(material);
                    shapeMeshHorizontal = clone;
                    shapeMeshHorizontal.userData.originalMaterial = material;
                    extrudeArticleHorizontal.add(shapeMeshHorizontal);
                    shapeMeshHorizontal.geometry.verticesNeedUpdate = true;
                    shapeMeshHorizontal.geometry.normalsNeedUpdate = true;
                    shapeMeshHorizontal.geometry.computeBoundingSphere();
                    shapeMeshHorizontal.geometry.computeFaceNormals();
                    //shapeMeshHorizontal.geometry.computeVertexNormals();
                }
                extrudeMeshVertical.add(extrudeArticleVertical);
                //Designer.Scene.gui.add(extrudeMeshVertical.rotation, 'x').min(0).max(7).step(0.001);
                //Designer.Scene.gui.add(extrudeMeshVertical.rotation, 'y').min(0).max(7).step(0.001);
                //Designer.Scene.gui.add(extrudeMeshVertical.rotation, 'z').min(0).max(7).step(0.001);
                extrudeMeshHorizontal.add(extrudeArticleHorizontal);
            }
        }

        return {
            vertical: extrudeMeshVertical,
            horizontal: extrudeMeshHorizontal
        };
    }
    processBottomFrameArticles(){
        let offsetZ = 0;
        let article = null;
        let extrudeArticleHorizontal = null;
        let updatedPoints = [];
        const extrudeMeshBottomArticle = new THREE.Group();
        const extrudeMeshTrackArticle = new THREE.Group();
        const extrudeMeshInsulatingProfileBottomArticle = new THREE.Group();
        const extrudeMeshInsulatingProfileTopArticle = new THREE.Group();
        const extrudeMeshDripBarArticle = new THREE.Group();
        const extrudeMeshGuideTrackArticle = new THREE.Group();
        const extrudeMeshThresholdArticle = new THREE.Group();
        const startPoints = this.clonePoints();
        const stepVal = 2;
        const steps = stepVal;
        const curveSegments = stepVal;
        for (var i in this.system) {
            for (var j in this.system[i].bottomArticles) {
                // Basic setup
                article = window[this.system[i].bottomArticles[j]]();

                extrudeArticleHorizontal = new THREE.Group();
                extrudeArticleHorizontal.name = article.name;
                extrudeArticleHorizontal.articleType = article.type || null;

                // Some articles will have the offset
                // initialize points here and we'll update it later
                updatedPoints = this.clonePoints();

                // Keep track of the type and name of each article - used externally by other classes
                this.articleTypes.push(article.type);
                this.articleNames.push(article.name);

                // Update (x, y) points based on offset - returns z point to be applied after extrusion
                offsetZ = this.offsetPoints(updatedPoints, article);
            
                let horizontalExtrudePath = null
                if(article.name == this.trackArticleName){
                    horizontalExtrudePath = new THREE.CatmullRomCurve3([
                            new THREE.Vector3(startPoints[0].x + 52, 0, 0),
                            new THREE.Vector3(startPoints[3].x - 52, 0, 0),
                        ], false, "centripetal", 0.5);
                }
                else if (article.name == this.insulatingProfileBottomName ){
                    horizontalExtrudePath = new THREE.CatmullRomCurve3([
                        new THREE.Vector3(startPoints[0].x + 21, 0, 0),
                        new THREE.Vector3(startPoints[3].x - 21, 0, 0),
                    ], false, "centripetal", 0.5);
                }
                else if(article.name == this.insulatingProfileTopName || 
                        article.name == this.dripBarName){
                    horizontalExtrudePath = new THREE.CatmullRomCurve3([
                        new THREE.Vector3(startPoints[0].x + 32, 0, 0),
                        new THREE.Vector3(startPoints[3].x - 32, 0, 0),
                    ], false, "centripetal", 0.5);
                }
                else if(article.name == this.guideTrackName){
                    horizontalExtrudePath = new THREE.CatmullRomCurve3([
                        new THREE.Vector3(startPoints[0].x + 48, 0, 0),
                        new THREE.Vector3(startPoints[3].x - 48, 0, 0),
                    ], false, "centripetal", 0.5);
                }
                else if(article.name == this.thresholdName){
                    let length = 0; 
                    switch(this.VentOperableType){
                        case "SlidingDoor-Type-3F":
                            length = (this.width - 282)/3 * 2;
                            let remainingLength = this.width - length;
                            horizontalExtrudePath = new THREE.CatmullRomCurve3([
                                new THREE.Vector3(startPoints[0].x + remainingLength/2, 0, 0),
                                new THREE.Vector3(startPoints[0].x + remainingLength/2 + length, 0, 0),
                            ], false, "centripetal", 0.5); 
                            break;
                        case "SlidingDoor-Type-2D1.i":
                            length = this.width/2 -149;
                            let remainingLength2D = this.width - length;
                            horizontalExtrudePath = new THREE.CatmullRomCurve3([
                                new THREE.Vector3(startPoints[0].x + remainingLength2D/2, 0, 0),
                                new THREE.Vector3(startPoints[0].x + remainingLength2D/2 + length, 0, 0),
                            ], false, "centripetal", 0.5);
                            break;
                        case "SlidingDoor-Type-2A1.i-Left":
                            length = this.width/2 - 89;
                            horizontalExtrudePath = new THREE.CatmullRomCurve3([
                                new THREE.Vector3(40, 0, 0),
                                new THREE.Vector3(40+length, 0, 0),
                            ], false, "centripetal", 0.5);                        
                            break;
                        case "SlidingDoor-Type-2A1.i-Right":
                            length = this.width/2 - 89;
                            horizontalExtrudePath = new THREE.CatmullRomCurve3([
                                new THREE.Vector3(this.width - length - 40, 0, 0),
                                new THREE.Vector3(this.width - 40, 0, 0),
                            ], false, "centripetal", 0.5);                        
                            break;
                        case "SlidingDoor-Type-3E1-Right":
                            length = (this.width - 172)/3 * 2;
                            horizontalExtrudePath = new THREE.CatmullRomCurve3([
                                new THREE.Vector3(this.width - length - 40, 0, 0),
                                new THREE.Vector3(this.width - 40, 0, 0),
                            ], false, "centripetal", 0.5); 
                            break;
                        case "SlidingDoor-Type-3E1-Left":
                            length = (this.width - 172)/3 * 2;
                            horizontalExtrudePath = new THREE.CatmullRomCurve3([
                                new THREE.Vector3(40, 0, 0),
                                new THREE.Vector3(40+length, 0, 0),
                            ], false, "centripetal", 0.5); 
                            break;
                    }
                    
                }
                else{
                    horizontalExtrudePath = new THREE.CatmullRomCurve3([
                        new THREE.Vector3(startPoints[0].x, 0, 0),
                        new THREE.Vector3(startPoints[3].x, 0, 0),
                    ], false, "centripetal", 0.5);
                }
                for (var k in article.shapes) {
                    let shape = article.shapes[k];
                    let geometryHorizontal = new THREE.ExtrudeGeometry(shape, {
                        steps: steps,
                        curveSegments: curveSegments,
                        bevelEnabled: false,
                        extrudePath: horizontalExtrudePath
                    });
                    let material = Designer.Materials.setMaterial(shape);

                    let shapeMeshHorizontal = new THREE.Mesh(geometryHorizontal, material);
                    shapeMeshHorizontal.translateX(this.getWidth());
                    shapeMeshHorizontal.rotateY(Math.PI);
                    shapeMeshHorizontal.rotateX((Math.PI) / 2);
                    shapeMeshHorizontal.position.z += offsetZ;
                    shapeMeshHorizontal.position.y += updatedPoints[0].y;
                    if(!(article.name == this.trackArticleName || article.name == this.insulatingProfileBottomName ||
                        article.name == this.insulatingProfileTopName || article.name == this.dripBarName || 
                        article.name == this.guideTrackName || article.name == this.thresholdName)){
                            let cube = shapeMeshHorizontal;
                            let clone = cube.clone();
                            clone = new ThreeBSP(clone);
                            clone = clone.subtract(this.planeHorizontalLeft);
                            clone = clone.subtract(this.planeHorizontalRight);
                            clone = clone.toMesh(material);
                            shapeMeshHorizontal = clone;
                            
                    }
                    shapeMeshHorizontal.userData.originalMaterial = material;
                    extrudeArticleHorizontal.add(shapeMeshHorizontal);
                    shapeMeshHorizontal.geometry.verticesNeedUpdate = true;
                    shapeMeshHorizontal.geometry.normalsNeedUpdate = true;
                    shapeMeshHorizontal.geometry.computeBoundingSphere();
                    shapeMeshHorizontal.geometry.computeFaceNormals();
                    //shapeMeshHorizontal.geometry.computeVertexNormals();
                }
                if(article.name == this.trackArticleName){
                    extrudeMeshTrackArticle.add(extrudeArticleHorizontal);
                }
                else if (article.name == this.insulatingProfileBottomName){
                    extrudeMeshInsulatingProfileBottomArticle.add(extrudeArticleHorizontal);
                }
                else if (article.name == this.insulatingProfileTopName){
                    extrudeMeshInsulatingProfileTopArticle.add(extrudeArticleHorizontal);
                }
                else if (article.name == this.dripBarName){
                    extrudeMeshDripBarArticle.add(extrudeArticleHorizontal);
                }
                else if (article.name == this.guideTrackName){
                    extrudeMeshGuideTrackArticle.add(extrudeArticleHorizontal);
                }
                else if (article.name == this.thresholdName){
                    extrudeMeshThresholdArticle.add(extrudeArticleHorizontal);
                }
                else{
                    extrudeMeshBottomArticle.add(extrudeArticleHorizontal);
                }
            }
        }

        return {
            bottomArticle: extrudeMeshBottomArticle,
            track: extrudeMeshTrackArticle,
            insulatingTop: extrudeMeshInsulatingProfileTopArticle,
            insulatingBottom: extrudeMeshInsulatingProfileBottomArticle,
            dripBar: extrudeMeshDripBarArticle,
            guideTrack: extrudeMeshGuideTrackArticle,
            threshold: extrudeMeshThresholdArticle
        };
    }
    offsetPoints(updatedPoints, article) {
        let offset = 0;
        let offsetZ = 0;
        let offsetReference = article.offsetReferance;
        const OUTER = "Outer";
        const INNER = "Inner";
        let outerFrame = this.system[Designer.ArticleTypes.OUTER_FRAME];
        let frameFoam = this.system[Designer.ArticleTypes.FRAME_FOAM];
        let ventFrame = this.system[Designer.ArticleTypes.VENT_FRAME];
        let glazingBead = this.system[Designer.ArticleTypes.GLAZING_BEAD];

        let offsets = {
            outer: {
                outer: outerFrame.offsetOuter,
                outerVent: outerFrame.offsetOuter + ventFrame.offsetOuter,
                outerVentBead: outerFrame.offsetOuter + ventFrame.offsetOuter + glazingBead.offsetOuter
            },
            inner: {
                outer: outerFrame.offsetInner,
                outerVent: outerFrame.offsetInner + ventFrame.offsetInner,
                outerVentBead: outerFrame.offsetInner + ventFrame.offsetInner + glazingBead.offsetInner
            }
        }

        if (offsetReference !== "null") {
            let isOutter = offsetReference === OUTER;
            let hasVentFrame = ventFrame.articles.length > 0;
            switch (article.type) {
                case Designer.ArticleTypes.VENT_FRAME:
                    offset = isOutter ? offsets.outer.outer : offsets.inner.outer;
                    offsetZ = !isOutter ? outerFrame.depth : 0;
                    break;
                case Designer.ArticleTypes.GLAZING_BEAD:
                    offset = isOutter ? offsets.outer.outerVent : offsets.inner.outerVent;
                    offset = hasVentFrame ? offset - 5 : offset;
                    offsetZ = !isOutter ? outerFrame.depth + ventFrame.depth : 0;
                    break;
                case Designer.ArticleTypes.GLAZING_GASKET:
                    offset = isOutter ? offsets.outer.outerVentBead : offsets.inner.outerVentBead;
                    offset = hasVentFrame ? offset - 5 : offset;
                    offsetZ = !isOutter ? outerFrame.depth + ventFrame.depth + glazingBead.depth : 0;
                    break;
                case Designer.ArticleTypes.VENT_FRAME_GASKET:
                    offset = isOutter ? offsets.outer.outer : offsets.inner.outer;
                    offsetZ = !isOutter ? outerFrame.depth + ventFrame.depth : 0;
                    break;
                case Designer.ArticleTypes.GLAZING_REBATE_GASKET:
                    offset = isOutter ? offsets.outer.outerVent : offsets.inner.outerVent;
                    offsetZ = !isOutter ? outerFrame.depth + ventFrame.depth : 0;
                    offset = hasVentFrame ? offset + 7 : offset;
                    break;
                case Designer.ArticleTypes.VENT_FOAM:
                    offset = isOutter ? offsets.outer.outerVent : offsets.inner.outerVent;
                    offsetZ = !isOutter ? outerFrame.depth + ventFrame.depth : 0;
                    break;
                case Designer.ArticleTypes.CENTER_GASKET:
                    offset = isOutter ? offsets.outer.outer : offsets.inner.outer;
                    offsetZ = !isOutter ? outerFrame.depth + ventFrame.depth : 0;
                    break;
                case Designer.ArticleTypes.FRAME_FOAM:
                    offset = isOutter ? offsets.outer.outer : offsets.inner.outer;
                    offsetZ = !isOutter ? outerFrame.depth + ventFrame.depth : 0;
                    break;
            }
        }

        let property = null;

        for (var z in updatedPoints) {
            property = updatedPoints[z];
            switch (parseInt(z)) {
                case 0:
                    property.x += offset;
                    property.y += offset;
                    break;
                case 1:
                    property.x += offset;
                    property.y -= offset;
                    break;
                case 2:
                    property.x -= offset;
                    property.y -= offset;
                    break;
                case 3:
                    property.x -= offset;
                    property.y += offset;
                    break;
            }
        }

        return offsetZ;
    }

    clonePoints(points) {
        points = typeof points === "undefined" || points === null ? this.extrudePoints : points;
        let clone = Designer.Utils.clonePoints(points);
        return clone;
    }

    /**
     * Sets the mesh and its immediate children with the outer frame subtype
     * @param {any} mesh
     */
    setOuterFrameSubType(mesh) {
        const subtypes = new DesignerSubType();
        mesh.subtype = subtypes.outerInnerFrame;
        for (var i in mesh.children) {
            mesh.children[i].subtype = subtypes.outerInnerFrame;
        }
    }

    getWidth() {
        return this.width;
    }
    getHeight() {
        return this.height;
    }
    getArticleWidth() {
        return this.articleWidth;
    }

}