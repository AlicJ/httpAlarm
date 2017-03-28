const STORAGE = chrome.storage.local;
var savedUrls = {};

function isValidUrl(url) {
	var expression = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi;
	var regex = new RegExp(expression);
	return url.match(regex);
}

$(document).on('submit', '#urlForm', function(event) {
	event.preventDefault();
	var data = {};
	$(this).serializeArray().map(function(x){data[x.name] = x.value;}); 

	if (!isValidUrl(data.url)){
		$('#urlForm .form-group').addClass('has-error');
		$('#urlForm .help-block').text('Invalid URL');
		return;
	}

	STORAGE.get('urls', function(item){
		if (item.urls === undefined) {
			item.urls = [data];
		} else {
			var duplicate = false;
			$.each(item.urls, function(index, val) {
				if (val.name == data.name) {
					duplicate = true;
					item.urls[index] = data;
				}
			});
			if (!duplicate) {
				item.urls.push(data);
			}
		}
		STORAGE.set(item, function(){
			updateUrl();
			$('#urlForm')[0].reset();
		});
	});

});

$(document).on('click', '#deleteAllUrl', function(event) {
	event.preventDefault();
	STORAGE.remove('urls', updateUrl);
});

$(document).on('change', '#urlOptions', function(event) {
	event.preventDefault();
	var name = $(this).val();
	console.log('url selected', name);
	$.ajax({
		url: savedUrls[name].url,
		type: savedUrls[name].method
		// dataType: 'default: Intelligent Guess (Other values: xml, json, script, or html)',
		// data: {param1: 'value1'},
	})
	.done(function(response) {
		var data = typeof response == 'string' ? response : JSON.stringify(response, undefined, 4);
		$('#urlData').html(data);
	})
	.fail(function(response) {
		var data = typeof response == 'string' ? response : JSON.stringify(response, undefined, 4);
		$('#urlData').html(data);
	})
	.always(function(response) {
		console.log("complete", response);
	});
});

function updateUrl(){
	STORAGE.get('urls', function(item){
		console.log('update urls', item)
		var listing = '';
		var options = '<option selected disabled>select url</option>';
		$.each(item.urls, function(index, val) {
			savedUrls[val.name] = val;
			listing += `
				<tr>
					<td>${val.name}</td>
					<td>${val.url}</td>
					<td>${val.method}</td>
					<td>${val.comment}</td>
				</tr>
				`;
			options += `
				<option value="${val.name}">${val.name}</option>
				`;
		});
		$('#urlListing').html(listing);
		$('#urlOptions').html(options);
	});
}

function appendToStorage(key, item, callback) {
	STORAGE.get(key, function(item){
		if (item.key === undefined) {
			item.key = item;
		}
		console.log('get callback')
		console.log(item)
	});
}

function addUrl(url) {
	if (isValidUrl) {

	}else {

	}
}

$(document).ready(function() {
	updateUrl();
});