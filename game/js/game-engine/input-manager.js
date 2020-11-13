export default class InputManager{
    constructor(){
        this.keys={}
        this.buttons={}
        this.mousepos={}
        window.onkeydown=(e)=>{
            this.keys[e.code]=true;
        }
        window.onkeyup=(e)=>{
            this.keys[e.code]=undefined;
        }
        window.onmouseup=(e)=>{
            
        }
        window.onmousemove=(e)=>{
            this.mousepos.x=e.pageX;
            this.mousepos.y=e.pageY;
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