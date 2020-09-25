import HttpTools from '../library/http_tools';
import GameObject from '../library/game-object.js';
export default class Editor{
    constructor(processor){
        this.tempMap={};
        this.state='reset'
        this.game=processor;
        this.cursor=new GameObject();
        this.clickmode='place';
        this.editing=window.location.search.includes('editing=true');
        this.game.pause=this.editing;
        this.selectedClass=undefined;
        this.classList={};
        if(this.editing){
            this.addCursor()
            this.show();
        }
        this.actuallevel='';
        if(window.location.search.includes('level=')){
            var splitequal=window.location.search.split('=')
            var level = splitequal[splitequal.indexOf('level')+1].split('&')[0]
            this.carregarMapaByName(level);
        }
    }
    show(){
        document.getElementById('editorMenu').style.display='block';
    }
    removeCursor(){
        delete this.tempMap['cursor'];
    }
    addCursor(){
        this.game.map['cursor']=this.cursor;
    }
    run(){
        this.tempMap=this.game.map;
        this.game.pause=false;
        this.state='run'
        this.removeCursor();
    }
    stop(){
        this.game.pause=true;
        this.state='stop'
    }
    reset(){
        this.stop();
        this.game.map=this.tempMap;
        this.state='reset'
        this.addCursor();
    }
    click(mouse){
        if(this.game.pause){
            var layer = document.getElementById("layer").value;
            mouse.x=2*mouse.x/640-1
            mouse.y=2*mouse.y/480-1
            mouse.layer=layer;
            switch(this.clickmode){
                case 'place':
                    this.colocarObjeto(mouse);
                    break;
                case 'delete':
                    this.apagarObjeto(mouse);
                    break;
            }
        }
    }
    adicionarObjeto(file){
        /*import * as classe from ('../object/'+file.name.replace('.js','')+'/'+file.name)*/
        this.importObjectClass(file.name)
    }
    importObjectClass(name){
        import('../object/'+name.replace('.js','')+'/'+name).then(
            (module)=>{
                console.log(module.default)
                this.classList[module.default.name]={'className':module.default.name,'fileName':name}
                this.selectedClass=module.default;
                this.refreshObjectList()
                console.log(this.classList)
            }
        )
    }
    refreshObjectList(){
        var objList = document.getElementById('objList')
        objList.innerHTML='';
        for(var i in this.classList){
            objList.innerHTML+='<div onclick="editor.importObjectClass(\''+this.classList[i].fileName+'\')">'+this.classList[i].className+'</div>'
        }
    }
    colocarObjeto(mouse){
        if(this.selectedClass){
            var go=new this.selectedClass();
            var info=this.game.graphEngine.getMousePos(mouse)
            go.z=mouse.layer;
            go.x=parseInt(info[0]/2)*2;
            go.y=parseInt(info[1]/2)*2;
            this.game.map[go.x+'x'+go.y+'x'+go.z]=go;
        }
    }
    moverCursor(mouse){
        var layer = document.getElementById("layer").value;
        mouse.x=2*mouse.x/640-1
        mouse.y=2*mouse.y/480-1
        mouse.layer=layer;
        var info=this.game.graphEngine.getMousePos(mouse)
        this.cursor.z=mouse.layer;
        this.cursor.x=parseInt(info[0]/2)*2;
        this.cursor.y=parseInt(info[1]/2)*2;
    }
    apagarObjeto(mouse){
        var go=new GameObject();
        var info=this.game.graphEngine.getMousePos(mouse)
        go.z=mouse.layer;
        go.x=parseInt(info[0]/2)*2;
        go.y=parseInt(info[1]/2)*2;
        delete this.game.map[go.x+'x'+go.y+'x'+go.z];
    }
    salvarMapa(){
        if(this.state=='reset')
            this.tempMap=this.game.map;
		this.removeCursor();
        var json = JSON.stringify(this.tempMap,this.replacer);
        HttpTools.downloadFile(json,this.actuallevel!=''?(this.actuallevel):'level.txt','txt');
    }
    replacer(key,value){
        if (typeof value == "undefined") {
            return undefined;
        }
        return value;
    }
    carregarMapaByName(nome){
        this.actuallevel=nome
        this.game.pause=true;
        this.tempMap=JSON.parse(HttpTools.getFileSync('/mapa/'+nome));
        this.game.map=this.tempMap
        if(this.editing)
            this.addCursor();
    }
    carregarMapaByFile(file){
        this.actuallevel=file.name;
        var reader = new FileReader();
        reader.onloadend=()=>{
            this.game.pause=true;
            this.tempMap=JSON.parse(reader.result);
            this.game.map=this.tempMap;
            this.addCursor();
        }
        reader.readAsText(file);
    }
    selectMode(radio){
        if(radio.checked)
            this.clickmode=radio.value;
    }
    


}