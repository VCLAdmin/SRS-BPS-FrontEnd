THREE.SpriteAlignment = {
    topLeft: {
        x: 1,
        y: -1
    }
}

class DesignerSprite {
    constructor(settings) {
        this.settings = settings;
        return this.makeTextSprite();
    }

    makeTextSprite() {
        if (this.settings === undefined) this.settings = {};

        const fontface = this.settings.hasOwnProperty("fontface") ?
            this.settings["fontface"] : "Arial";

        const fontsize = this.settings.hasOwnProperty("fontsize") ?
            this.settings["fontsize"] : 18;

        const fontcolor = this.settings.hasOwnProperty("fontcolor") ?
            this.settings["fontcolor"] : { r: 0, g: 0, b: 0, a: 1.0 };

        const borderThickness = this.settings.hasOwnProperty("borderThickness") ?
            this.settings["borderThickness"] : 1;

        const borderColor = this.settings.hasOwnProperty("borderColor") ?
            this.settings["borderColor"] : { r: 0, g: 0, b: 0, a: 1.0 };

        const backgroundColor = this.settings.hasOwnProperty("backgroundColor") ?
            this.settings["backgroundColor"] : { r: 255, g: 255, b: 255, a: 1.0 };

        const rotation = this.settings.hasOwnProperty("rotation") ?
            this.settings["rotation"] : 0;

        const spriteAlignment = THREE.SpriteAlignment.topLeft;

        const canvas = document.createElement('canvas');
        canvas.width = fontsize * 4;
        canvas.height = fontsize * 1.2;
        const context = canvas.getContext('2d');
        context.font = fontsize + "px " + fontface;

        // get size data (height depends only on font size)
        const metrics = context.measureText(this.settings.message);
        const textWidth = metrics.width;

        // background color
        context.fillStyle = "rgba(" + backgroundColor.r + "," + backgroundColor.g + ","
            + backgroundColor.b + "," + backgroundColor.a + ")";
        // border color
        context.strokeStyle = "rgba(" + borderColor.r + "," + borderColor.g + ","
            + borderColor.b + "," + borderColor.a + ")";

        context.lineWidth = borderThickness;

        // text color
        context.fillStyle = "rgba(" + fontcolor.r + "," + fontcolor.g + ","
            + fontcolor.b + "," + fontcolor.a + ")";

        // text align
        context.textAlign = "center";

        context.fillText(this.settings.message, canvas.width / 2, fontsize + borderThickness);

        // canvas contents will be used for a texture
        const texture = new THREE.Texture(canvas);
        texture.needsUpdate = true;

        const spriteMaterial = new THREE.SpriteMaterial({
            map: texture,
            rotation: rotation,
            depthWrite: false,
            depthTest:false
        });
        const sprite = new THREE.Sprite(spriteMaterial);
        sprite.dimension = parseFloat(this.settings.message).toFixed(0);
        sprite.scale.set(canvas.width, canvas.height, 1);
        sprite.userData.clickable = this.settings.clickable;
        if(sprite.userData.clickable == false){
            sprite.layers.set(3);
        }
        sprite.userData.index = this.settings.index;
        return sprite;
    }
}