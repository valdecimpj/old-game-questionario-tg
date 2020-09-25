export default class FileTools{

    readFileAsText(file,callback){
        var fr=new FileReader();
        fr.onloadend=callback;
        fr.readAsText(file);
    }
}
