import ClassLibrary from './class-library.js';
export default class Processor{
    constructor(graphEngine){
        this.map={}
        this.pause=false;
        this.delayMs=1000;
        this.previousTime=0;
        this.graphEngine=graphEngine
        this.classLibrary=new ClassLibrary();
    }

    start(){
        if(this.graphEngine == undefined){
            alert('missing graphic engine');
            return 1;
        }
        this.loop();
    }

    loop(){
        var d = new Date().getTime()
        this.graphEngine.clear();
        for(var i in this.map){
            this.graphEngine.draw(this.map[i])
            if(!this.pause){
                this.map[i].run();
            }
        }
        var dif=d-new Date().getTime();
		dif=dif>=-this.delayMs?dif:1;
		setTimeout(()=>{this.loop.call(this)},this.delayMs+dif);
    }
}