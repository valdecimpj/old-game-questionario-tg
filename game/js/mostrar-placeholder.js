import GraphicEngine from './graphic-engine/graphic-engine.js';
import Processor from './game-engine/processor.js';
import GameObject from './library/game-object.js';
import MousePicker from './game-engine/mouse-picker.js';

let canvas3D=document.querySelector('#canvas3d',{alpha:false});
let canvaspicker=document.querySelector('#canvaspicker');

var graphicEngine = new GraphicEngine(canvas3D);
var processor = new Processor(graphicEngine);
var mousePicker = new MousePicker(canvas3D,canvaspicker)

var placeholder=new GameObject();
placeholder.imageName='placeholder/img/placeholder.png'
placeholder.z=3;
placeholder.click=()=>{alert('asd')};
mousePicker.objectList['0']=placeholder;
console.log(placeholder)

processor.map['0x0x0']=placeholder;
processor.start();