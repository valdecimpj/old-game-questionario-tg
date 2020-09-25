import GraphicEngine from "../graphic-engine/graphic-engine.js";

export default class MousePicker{
    
    constructor(canvas,canvaspicker){
        
        this.canvas3d=canvas;
        this.pickerCanvas=canvaspicker
        this.pickergl=new GraphicEngine(this.pickerCanvas);
        this.objectList={};
        canvas.onclick=(e)=>{
            let pos = this.getPosition(canvas);
            this.mousePick(e.pageX,e.pageY,pos);
        };
    }

    mousePick(mx,my,pos){
        let id=0;
        this.pickergl.clear();
        for(let i in this.objectList){
            let obj=this.objectList[i];
            obj.colorId=this.hexToRgb('#'+this.decToHex(id,6));
            id++;
            this.pickergl.drawPickable(obj)
        }

        const pixelX = mx * this.canvas3d.width / this.canvas3d.clientWidth;
        const pixelY = this.canvas3d.height - my * this.canvas3d.height / this.canvas3d.clientHeight - 1;
        const data = new Uint8Array(4);
        let gl=this.pickergl.gl;
        gl.readPixels(
            pixelX,            // x
            pixelY,            // y
            1,                 // width
            1,                 // height
            gl.RGBA,           // format
            gl.UNSIGNED_BYTE,  // type
            data);             // typed array to hold result
        for(let i in this.objectList){
            let obj=this.objectList[i];
            let id=obj.colorId;
            if(id.r==data[0]&&id.g==data[1]&&id.b==data[2])
                obj.click();
        }
    }

    decToHex(d,padding){
        var hex = Number(d).toString(16);
        padding = typeof (padding) === "undefined" || padding === null ? padding = 2 : padding;
        while (hex.length < padding) {
            hex = "0" + hex;
        }
        return hex;
    }

    hexToRgb(hex) {
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16)
        } : null;
    }

    getPosition(obj) {
        var curleft = 0, curtop = 0;
        if (obj.offsetParent) {
            do {
                curleft += obj.offsetLeft;
                curtop += obj.offsetTop;
            } while (obj = obj.offsetParent);
            return { x: curleft, y: curtop };
        }
        return undefined;
    }

}