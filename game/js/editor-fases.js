import GraphicEngine from './graphic-engine/graphic-engine.js';
import Processor from './game-engine/processor.js';
import MousePicker from './game-engine/mouse-picker.js';
import InputManager from './game-engine/input-manager.js';

import HttpTools from './library/http-tools.js';


let canvas3D=document.querySelector('#canvas3d',{alpha:false});
let canvaspicker=document.querySelector('#canvaspicker');

var graphicEngine = new GraphicEngine(canvas3D);
var processor = new Processor(graphicEngine);
var mousePicker = new MousePicker(canvas3D,canvaspicker)
mousePicker.editing=true;
mousePicker.editingCallback=pickerObjectClick;
var inputManager = new InputManager();

processor.pause=true;
processor.start();

let idCounter=0;
let selectedObjects=[];
let backupMap='';
let backupPickerMap='';

let btnAdicionar = get("#btnAdicionar");
let btnCancelarAdicionar = get("#btnCancelarAdicionar");
let btnPlay = get('#btnPlay');
let btnReset = get('#btnReset');

let divFerramentas = get ("#divFerramentas");
let divListaSelecao = get("#divListaSelecao");
let lstAdicionarObjeto = get("#lstAdicionarObjeto");
let lstObjetosCena = get("#lstObjetosCena");

btnPlay.onclick=()=>{
    btnPlay.disabled=true;
    btnReset.disabled=false;
    let replacer = (key,value)=>{
        if (typeof value == "undefined") {
            return undefined;
        }
        if(typeof value == 'function'){
            return value.toString()
        }
        return value;
    }
    console.log(processor.map)
    backupMap=JSON.stringify(processor.map,replacer);
    backupPickerMap=JSON.stringify(mousePicker.objectList,replacer)
    console.log(processor.map);
    processor.pause=false;
    mousePicker.editing=false;
}

btnReset.onclick=()=>{
    btnPlay.disabled=false;
    btnReset.disabled=true;
    processor.pause=true;
    mousePicker.editing=true;
    processor.map=JSON.parse(backupMap);
    mousePicker.objectList=JSON.parse(backupPickerMap);
    console.log(processor.map);
    selectedObjects=[]
    updateObjectScene();
}

btnAdicionar.onclick=()=>{
    loadObjectList();
    divListaSelecao.style.display="block";
    divFerramentas.style.display="none";
    lstAdicionarObjeto.innerHTML="Carregando...";
}

btnCancelarAdicionar.onclick=()=>{
    resetEditorLayout();
}

lstObjetosCena.onclick=()=>{
    console.log('aff')
    selectedObjects=[];
    clearHighlightScene();
}

function resetEditorLayout(){
    divListaSelecao.style.display="none";
    divFerramentas.style.display="block";
}

function loadObjectList(){
    HttpTools.getJsonAt('./php/list-object.php', loadObjectListCallback);
}
function loadObjectListCallback(listaObj){
    lstAdicionarObjeto.innerHTML='';
    for(let i in listaObj){
        let list = document.createElement("li");
        list.innerHTML=listaObj[i];
        list.onclick=()=>{
            addObject(listaObj[i]);
        }
        lstAdicionarObjeto.appendChild(list)
    }
}

function selectObject(id,obj){
    let shift=inputManager.keys['ShiftLeft']||inputManager.keys['ShiftRight']
    if(!shift){
        selectedObjects=[];
        clearHighlightScene();
    }
    selectedObjects.push(obj);
    highlightObjectScene(id);
}

function highlightObjectScene(id){
    let lstLi=lstObjetosCena.querySelectorAll('li');
    for(let i=0; i<lstLi.length; i++){
        let li=lstLi[i];
        if(li.innerHTML.includes(id+"#"))
            li.classList.add("selectedListItem");
    }
}

function clearHighlightScene(){
    let lstLi=lstObjetosCena.querySelectorAll('li');
    for(let i=0; i<lstLi.length; i++){
        lstLi[i].classList.remove('selectedListItem');
    }
}

function pickerObjectClick(id,obj){
    selectObject(id,obj);
}

function addObject(name){
    resetEditorLayout();
    import('./object/'+name+"/"+name+'.js').then((module)=>{
        let obj=new module.default();
        obj.z=3;
        let id=idCounter.toString();
        processor.map[id]=obj;
        mousePicker.objectList[id]=obj;
        idCounter++;
        updateObjectScene();
        selectObject(id,obj);
    });
}

function updateObjectScene(){
    lstObjetosCena.innerHTML='';
    for(let i in processor.map){
        let li = document.createElement("li");
        let btnremove = document.createElement("button")
        btnremove.innerHTML="X";
        btnremove.onclick=(e)=>{
            e.cancelBubble=true;
            delete processor.map[i];
            delete mousePicker.objectList[i]
            updateObjectScene();
        }
        let obj=processor.map[i];
        li.innerHTML=i+"#"+obj.constructor.name;
        li.appendChild(btnremove);
        li.onclick=(e)=>{
            e.cancelBubble=true;
            selectObject(i,obj)
        }
        lstObjetosCena.appendChild(li);
    }
}