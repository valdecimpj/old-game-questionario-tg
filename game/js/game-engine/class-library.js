export default class ClassLibrary{
    constructor(){
        this.classList={}
    }

    run(object){
        if(this.classList[object.class]==undefined){
            //import * as importedClass from object.class;
            this.classList[object.class]=new importedClass();
        }
        this.classList[object.class].loop.call(object)
    }
}