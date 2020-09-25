export default class ImageManager{
    constructor(graphicEngine){
		this.imageList={};
		this.graphicEngine=graphicEngine;
	}
	getImage(link){
		if(this.imageList[link]==undefined){
			let img=new Image();
			let txtObj={};
			this.imageList[link]=txtObj;
			txtObj.isLoaded=false;
			let gE=this.graphicEngine;
            img.onload=()=>{
				txtObj.isLoaded=true
				txtObj.texture=gE.createNewTexture(img);
			}
			img.src='js/object/'+link
			img.onerror=function(){this.src="img/placeholder.png"}
        }
		return this.imageList[link];
	}
	forceGetImage(link){
        this.imageList[link]=new Image()
        this.imageList[link].isLoaded=false;
        this.imageList[link].onload=function(){this.isLoaded=true}
		this.imageList[link].src='js/object/'+link
		this.imageList[link].onerror=function(){this.src="img/placeholder.png"}
	}
}