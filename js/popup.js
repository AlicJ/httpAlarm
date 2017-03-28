document.addEventListener('DOMContentLoaded', function() {
	var url = 'http://busfinder.oakvilletransit.ca/bustimemobile/proxy?op=getpredictions&stpid=2988';
	$.ajax({
		url: url,
		type: 'GET'
	})
	.done(function(response){
		var obj = JSON.parse(response)['bustime-response'];
		var text = generateText(obj);
		renderStatus(text);
	})
	.fail(function(error){
		renderStatus('Uh oh, something went wrong...');
	});
});