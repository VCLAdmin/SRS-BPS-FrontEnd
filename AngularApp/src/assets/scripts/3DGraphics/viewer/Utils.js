class DesignerUtils {

    constructor() {    
    }

    /**
     * Clones and array of THREE.Vector2 points
     * @param {any} points
     */
    clonePoints(points) {
        let clone = [];

        for (var i in points) {
            clone.push(points[i].clone());
        }
        return clone;
    }

    loadSystemCrossSection(systemName, callback = null) {
        Designer.Database.getCrossSectionForSystem(systemName, (crossSectionSrc) => {
            //document.getElementById("system-cross-section-img").src = crossSectionSrc;
            //document.getElementById("system-cross-section-img").classList.remove("invisible");
            document.getElementById("system-cross-section-img-container").style.background = "url('/Content/Images/system-jpeg/" + systemName + ".jpg'";
            document.getElementById("system-cross-section-img-container").style.backgroundSize = "contain";
            document.getElementById("system-cross-section-img-container").style.backgroundRepeat = "no-repeat";
            if (callback) {
                callback(crossSectionSrc);
            }
        });
    }

    /**
     * Takes a string and replaces all actual spaces with symbols (e.g. 1_5_2 -> 1.5.2).
     * @param {string} rawString
     * @returns {string} A string with space symbols replaced with actual spaces.
     */
    replaceSpaceSymbol(rawString) {
        rawString = rawString.toString();
        return rawString.replace(/ /g, Designer.Settings.SYMBOLS.SPACE);
    }
    
    assignUVs(geometry) {

        geometry.faceVertexUvs[0] = [];
    
        geometry.faces.forEach(function(face) {
    
            var components = ['x', 'y', 'z'].sort(function(a, b) {
                return Math.abs(face.normal[a]) > Math.abs(face.normal[b]);
            });
    
            var v1 = geometry.vertices[face.a];
            var v2 = geometry.vertices[face.b];
            var v3 = geometry.vertices[face.c];
    
            geometry.faceVertexUvs[0].push([
                new THREE.Vector2(v1[components[0]], v1[components[1]]),
                new THREE.Vector2(v2[components[0]], v2[components[1]]),
                new THREE.Vector2(v3[components[0]], v3[components[1]])
            ]);
    
        });
    
        geometry.uvsNeedUpdate = true;
    }
    _applyBoxUV(geom, transformMatrix, bbox, bbox_max_size) {

        let coords = [];
        coords.length = 2 * geom.attributes.position.array.length / 3;
    
        // geom.removeAttribute('uv');
        if (geom.attributes.uv === undefined) {
            geom.addAttribute('uv', new THREE.Float32BufferAttribute(coords, 2));
        }
    
        //maps 3 verts of 1 face on the better side of the cube
        //side of the cube can be XY, XZ or YZ
        let makeUVs = function(v0, v1, v2) {
    
            //pre-rotate the model so that cube sides match world axis
            v0.applyMatrix4(transformMatrix);
            v1.applyMatrix4(transformMatrix);
            v2.applyMatrix4(transformMatrix);
    
            //get normal of the face, to know into which cube side it maps better
            let n = new THREE.Vector3();
            n.crossVectors(v1.clone().sub(v0), v1.clone().sub(v2)).normalize();
    
            n.x = Math.abs(n.x);
            n.y = Math.abs(n.y);
            n.z = Math.abs(n.z);
    
            let uv0 = new THREE.Vector2();
            let uv1 = new THREE.Vector2();
            let uv2 = new THREE.Vector2();
            // xz mapping
            if (n.y > n.x && n.y > n.z) {
                uv0.x = (v0.x - bbox.min.x) / bbox_max_size;
                uv0.y = (bbox.max.z - v0.z) / bbox_max_size;
    
                uv1.x = (v1.x - bbox.min.x) / bbox_max_size;
                uv1.y = (bbox.max.z - v1.z) / bbox_max_size;
    
                uv2.x = (v2.x - bbox.min.x) / bbox_max_size;
                uv2.y = (bbox.max.z - v2.z) / bbox_max_size;
            } else
            if (n.x > n.y && n.x > n.z) {
                uv0.x = (v0.z - bbox.min.z) / bbox_max_size;
                uv0.y = (v0.y - bbox.min.y) / bbox_max_size;
    
                uv1.x = (v1.z - bbox.min.z) / bbox_max_size;
                uv1.y = (v1.y - bbox.min.y) / bbox_max_size;
    
                uv2.x = (v2.z - bbox.min.z) / bbox_max_size;
                uv2.y = (v2.y - bbox.min.y) / bbox_max_size;
            } else
            if (n.z > n.y && n.z > n.x) {
                uv0.x = (v0.x - bbox.min.x) / bbox_max_size;
                uv0.y = (v0.y - bbox.min.y) / bbox_max_size;
    
                uv1.x = (v1.x - bbox.min.x) / bbox_max_size;
                uv1.y = (v1.y - bbox.min.y) / bbox_max_size;
    
                uv2.x = (v2.x - bbox.min.x) / bbox_max_size;
                uv2.y = (v2.y - bbox.min.y) / bbox_max_size;
            }
    
            return {
                uv0: uv0,
                uv1: uv1,
                uv2: uv2
            };
        };
    
        if (geom.index) { // is it indexed buffer geometry?
            for (let vi = 0; vi < geom.index.array.length; vi += 3) {
                let idx0 = geom.index.array[vi];
                let idx1 = geom.index.array[vi + 1];
                let idx2 = geom.index.array[vi + 2];
    
                let vx0 = geom.attributes.position.array[3 * idx0];
                let vy0 = geom.attributes.position.array[3 * idx0 + 1];
                let vz0 = geom.attributes.position.array[3 * idx0 + 2];
    
                let vx1 = geom.attributes.position.array[3 * idx1];
                let vy1 = geom.attributes.position.array[3 * idx1 + 1];
                let vz1 = geom.attributes.position.array[3 * idx1 + 2];
    
                let vx2 = geom.attributes.position.array[3 * idx2];
                let vy2 = geom.attributes.position.array[3 * idx2 + 1];
                let vz2 = geom.attributes.position.array[3 * idx2 + 2];
    
                let v0 = new THREE.Vector3(vx0, vy0, vz0);
                let v1 = new THREE.Vector3(vx1, vy1, vz1);
                let v2 = new THREE.Vector3(vx2, vy2, vz2);
    
                let uvs = makeUVs(v0, v1, v2, coords);
    
                coords[2 * idx0] = uvs.uv0.x;
                coords[2 * idx0 + 1] = uvs.uv0.y;
    
                coords[2 * idx1] = uvs.uv1.x;
                coords[2 * idx1 + 1] = uvs.uv1.y;
    
                coords[2 * idx2] = uvs.uv2.x;
                coords[2 * idx2 + 1] = uvs.uv2.y;
            }
        } else {
            for (let vi = 0; vi < geom.attributes.position.array.length; vi += 9) {
                let vx0 = geom.attributes.position.array[vi];
                let vy0 = geom.attributes.position.array[vi + 1];
                let vz0 = geom.attributes.position.array[vi + 2];
    
                let vx1 = geom.attributes.position.array[vi + 3];
                let vy1 = geom.attributes.position.array[vi + 4];
                let vz1 = geom.attributes.position.array[vi + 5];
    
                let vx2 = geom.attributes.position.array[vi + 6];
                let vy2 = geom.attributes.position.array[vi + 7];
                let vz2 = geom.attributes.position.array[vi + 8];
    
                let v0 = new THREE.Vector3(vx0, vy0, vz0);
                let v1 = new THREE.Vector3(vx1, vy1, vz1);
                let v2 = new THREE.Vector3(vx2, vy2, vz2);
    
                let uvs = makeUVs(v0, v1, v2, coords);
    
                let idx0 = vi / 3;
                let idx1 = idx0 + 1;
                let idx2 = idx0 + 2;
    
                coords[2 * idx0] = uvs.uv0.x;
                coords[2 * idx0 + 1] = uvs.uv0.y;
    
                coords[2 * idx1] = uvs.uv1.x;
                coords[2 * idx1 + 1] = uvs.uv1.y;
    
                coords[2 * idx2] = uvs.uv2.x;
                coords[2 * idx2 + 1] = uvs.uv2.y;
            }
        }
    
        geom.attributes.uv.array = new Float32Array(coords);
    }
    applyBoxUV(bufferGeometry, transformMatrix, boxSize) {

        if (transformMatrix === undefined) {
            transformMatrix = new THREE.Matrix4();
        }
    
        if (boxSize === undefined) {
            let geom = bufferGeometry;
            geom.computeBoundingBox();
            let bbox = geom.boundingBox;
    
            let bbox_size_x = bbox.max.x - bbox.min.x;
            let bbox_size_z = bbox.max.z - bbox.min.z;
            let bbox_size_y = bbox.max.y - bbox.min.y;
    
            boxSize = Math.max(bbox_size_x, bbox_size_y, bbox_size_z);
        }
    
        let uvBbox = new THREE.Box3(new THREE.Vector3(-boxSize / 2, -boxSize / 2, -boxSize / 2), new THREE.Vector3(boxSize / 2, boxSize / 2, boxSize / 2));
    
        this._applyBoxUV(bufferGeometry, transformMatrix, uvBbox, boxSize);
    
    }

    /**
     * Takes a string and replaces all actual periods with symbols (e.g. 1_5_2 -> 1.5.2).
     * @param {string} rawString
     * @returns {string} A string with period symbols replaced with actual periods.
     */
    replacePeriodSymbol(rawString) {
        rawString = rawString.toString();
        return rawString.replace(/\./g, Designer.Settings.SYMBOLS.PERIOD);
    }

    /**
     * Takes a string and replaces all space symbols with actual spaces (e.g. 1_5_2 -> 1.5.2).
     * @param {string} rawString
     * @returns {string} A string with space symbols replaced with actual spaces.
     */
    replaceSymbolSpace(rawString) {
        var re = new RegExp(Designer.Settings.SYMBOLS.SPACE, 'g');
        return rawString.replace(re, " ");
    }

    /**
     * Takes a string and replaces all period symbols with actual periods (e.g. 1_5_2 -> 1.5.2).
     * @param {string} rawString
     * @returns {string} A string with period symbols replaced with actual periods.
     */
    replaceSymbolPeriod(rawString) {
        var re = new RegExp(Designer.Settings.SYMBOLS.PERIOD, 'g');
        return rawString.replace(re, ".");
    }
    
    /**
     * Takes an internal article name and makes it human readable
     * @param {any} name
     */
    prettifyArticleName(name) {
        name = name.split("_");
        name = name.join(" ");
        name = this.capitalizeAll(name);

        return name;
    }

    /**
     * Finds the bounding box, centroid and size of any given THREE.Object3D
     * @param {THREE.Object3D} mesh
     * @returns An object or THREE.Vector3z of the given object's bounding box, centroid and size
     */
    getDimensions(mesh) {
        const box = this.getBoundingBox(mesh);

        //box.min.x = parseFloat(box.min.x);

        const dimensions = {
            min: box.min,
            max: box.max,
            centroid: this.getCentroid(mesh),
            size: new THREE.Vector3()
        }
        box.getSize(dimensions.size)
        //console.log(dimensions);
        return dimensions;
    }

    /**
     * Finds the centroid of any given THREE.Object3D
     * @param {THREE.Object3D} mesh
     * @returns A THREE.Vector3 of the given object's centroid
     */
    getCentroid(mesh) {
        const BBhelper = new THREE.BoxHelper(mesh);
        if (!BBhelper.geometry.boundingSphere) {
            BBhelper.geometry.computeBoundingSphere();
        }
        const BSphere = BBhelper.geometry.boundingSphere;
        return BSphere.center.clone();
    }

    /**
     * Finds the bounding box of any given THREE.Object3D
     * @param {THREE.Object3D} mesh
     * @returns A THREE.Box3 of the given object's bounding box
     */
    getBoundingBox(mesh) {
        const box = new THREE.Box3().setFromObject(mesh);
        return box;
    }

    getVentNameFromPane(panename) {
        panename = panename.split(Designer.Model.separator);
        panename = panename[0]
        panename += `${Designer.Model.separator}vent_frame`;
        return panename;
    }

    isObjectProperyUndefinedNull(object, property) {
        let response = typeof object[property] === "undefined" || object[property] === null;
        return response;
    }

    getMaxSlidingDoorDimensions(ventFrames){
        let interlockOffset = (-20 + ((parseInt(Designer.UnifiedModel.doorFrames[0].doorVentArticle.outsideWidth) + 20) / 2))
        let outerFrameWidth = (Designer.UnifiedModel.outerFrame.articleWidth - 8);
              
        //min
        let min = 774  * ventFrames.length;
        let numInterlocks = 0;
        if(Designer.UnifiedModel.OperabilitySystems[0].VentOperableType == "SlidingDoor-Type-3F" || 
        Designer.UnifiedModel.OperabilitySystems[0].VentOperableType == "SlidingDoor-Type-2D1.i" ){
            //subtract 8 if has two vents on same track 
            min += 8;
            numInterlocks = ventFrames.length - 2;
        }
        else{
            numInterlocks = ventFrames.length - 1;
        }
        min -= (numInterlocks * interlockOffset*2)
        min += outerFrameWidth * 2;

        //max 
        let max = 2200 * ventFrames.length;
        numInterlocks = 0;
        if(Designer.UnifiedModel.OperabilitySystems[0].VentOperableType == "SlidingDoor-Type-3F" || 
        Designer.UnifiedModel.OperabilitySystems[0].VentOperableType == "SlidingDoor-Type-2D1.i" ){
            //subtract 8 if has two vents on same track 
            max += 8;
            numInterlocks = ventFrames.length - 2;
        }
        else{
            numInterlocks = ventFrames.length - 1;
        }
        max -= (numInterlocks * interlockOffset*2)
        max += outerFrameWidth * 2;

        return {
            max: max, 
            min: min
        }
        
    }
}