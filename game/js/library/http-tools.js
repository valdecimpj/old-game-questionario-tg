export default class HttpTools{
	static getFileSync(url){
		var http=new XMLHttpRequest();
		http.open("GET",url,false)
		return http.responseText;
	}

	static getFileAsync(url,callback){
		var http=new XMLHttpRequest();
		http.open("GET",url,true)
		http.onload=callback;
		http.send();
	}

	static getJsonAt(url,callback){
		var http=new XMLHttpRequest();
		http.onreadystatechange = function() {
			if (this.readyState == 4 && this.status == 200) {
			   callback(JSON.parse(http.responseText));
			}
		};
		http.open("GET",url,true)
		http.send();
	}

	static downloadFile(data, filename, type) {
		var file = new Blob([data], {type: type});
		if (window.navigator.msSaveOrOpenBlob) // IE10+
			window.navigator.msSaveOrOpenBlob(file, filename);
		else { 
			var a = document.createElement("a"),
					url = URL.createObjectURL(file);
			a.href = url;
			a.download = filename;
			document.body.appendChild(a);
			a.click();
			setTimeout(function() {
				document.body.removeChild(a);
				window.URL.revokeObjectURL(url);  
			}, 0); 
		}
	}

}