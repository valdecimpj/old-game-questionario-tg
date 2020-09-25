export default class InputManager{
    constructor(editor){
        this.editor=editor;
        this.keys={}
        this.buttons={}
        this.mousepos={}
        window.onkeydown=(e)=>{
            this.keys[e.code]=true;
        }
        window.onkeydown=(e)=>{
            this.keys[e.code]=undefined;
        }
        window.onmouseup=(e)=>{
            
        }
        window.onmousemove=(e)=>{
            this.mousepos.x=e.pageX;
            this.mousepos.y=e.pageY;
        }
        var canvas = this.editor.game.graphEngine.canvas;
        canvas.onmouseup=(e,t)=>{
            if(e.button==0){
                var mouse=this.getNoPaddingNoBorderCanvasRelativeMousePosition(e,t);
                this.editor.click(mouse);
            }
        }
        canvas.onmousemove=(e,t)=>{
            var mouse=this.getNoPaddingNoBorderCanvasRelativeMousePosition(e,t);
            this.editor.moverCursor(mouse);
        }
    }
    getRelativeMousePosition(event, target) {
        target = target || event.target;
        var rect = target.getBoundingClientRect();
      
        return {
          x: event.clientX - rect.left,
          y: rect.bottom-event.clientY ,
        }
    }

    getNoPaddingNoBorderCanvasRelativeMousePosition(event, target) {
        target = target || event.target;
        var pos = this.getRelativeMousePosition(event, target);
      
        pos.x = pos.x * target.width  / target.clientWidth;
        pos.y = pos.y * target.height / target.clientHeight;
      
        return pos;  
    }
      
}