import GraphicEngine from './graphic-engine/graphic-engine.js';
import Processor from './game-engine/processor.js';
import Editor from './game-engine/editor';
import InputManager from './game-engine/input-manager';

var graphicEngine = new GraphicEngine(document.querySelector('#canvas3d',{alpha:false}));
var processor = new Processor(graphicEngine);
window.editor = new Editor(processor);
var inputManager = new InputManager(editor);

processor.start();