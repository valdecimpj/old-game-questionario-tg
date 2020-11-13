import GameObject from '../../library/game-object.js';
export default class ObjectPlaceholder extends GameObject{
    constructor(){
        super();
        this.imageName='placeholder/img/placeholder.png'
    }
    run(){
        this.ry+=1;
    }
    click(){
        alert("asd");
    }
}