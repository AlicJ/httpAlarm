document.addEventListener('DOMContentLoaded', function() {
	var url = 'http://busfinder.oakvilletransit.ca/bustimemobile/proxy?op=getpredictions&stpid=2988';
	httpGetAsync(url, function(response){
		var obj = JSON.parse(response)['bustime-response'];
		var text = generateText(obj);
		renderStatus(text);
	});
});