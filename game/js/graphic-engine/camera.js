import GameObject from '../library/game-object.js';
export default class Camera extends GameObject{
    constructor(){
        super();
        this.fov=80;
		this.zoom=0;
    }
}