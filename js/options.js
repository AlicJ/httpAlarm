var STORAGE = {};
STORAGE.local = {};
STORAGE.set = function(item, location = 'local', successCallback, errorCallback) {
	chrome.storage[location].set(item, function(){
		storageHelper(null, successCallback, errorCallback);
	});
};
STORAGE.get = function(item, location = 'local', successCallback, errorCallback) {
	console.log(location)
	chrome.storage[location].get(item, function(item){
		storageHelper(item, successCallback, errorCallback);
	});
}

function storageHelper(item, successCallback, errorCallback) {
	if (chrome.runtime.lastError) {
		console.log(chrome.runtime.lastError);
		errorCallback(chrome.runtime.lastError);
		return;
	}
	successCallback(item);
}

var savedUrls = {};
var previewData = {
	context: {},
	source: ''
}

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

	STORAGE.get('urls', 'local', function(item){
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
		STORAGE.set(item, 'local', function(){
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
	$.ajax({
		url: savedUrls[name].url,
		type: savedUrls[name].method
		// dataType: 'default: Intelligent Guess (Other values: xml, json, script, or html)',
		// data: {param1: 'value1'},
	})
	.done(function(response) {
		try{
			var data = typeof response == 'string' ? response : JSON.stringify(response, undefined, 4);
			previewData.context = JSON.parse(data);
		}catch(exception){
			$('#urlData').text('Error parsing data');
			return;
		}

		$('#urlData').html(data);
		STORAGE.get('messages', 'local', function(item){
			console.log(item)
			console.log(name)
			$('#urlMsg').val(item.messages[name]);
		});
	})
	.fail(function(response) {
		$('#urlData').html('Error loading data.');
	});
});

$(document).on('click', '#previewMsgBtn', function(event) {
	event.preventDefault();
	previewData.source = $('#urlMsg').val();
	if (previewData.source.length > 0 && Object.getOwnPropertyNames(previewData.context).length > 0) {
		var iframe = document.getElementById('sandboxFrame');
		var message = {
			name: $('#urlOptions').val(),
			command: 'new',
			context: previewData.context,
			source: previewData.source
		};
		iframe.contentWindow.postMessage(message, '*');
	}
});

window.addEventListener('message', function(event) {
  	console.log('main event from sandbox', event)
	if (event.data.html) {
		$('#preview').html(event.data.html);
	}
});

$(document).on('click', '#saveMsgBtn', function(event) {
	event.preventDefault();
	var urlName = $('#urlOptions').val();
	var item = {
		messages: {}
	};
	item['messages'][urlName] = $('#urlMsg').val();

	STORAGE.set(item, 'local', function(){
		console.log('message saved');
		$('#msgForm').addClass('has-success');
		$('#msgForm .help-block').text('Message saved');
	});

	// STORAGE.get('messages', function(item){
	// 	if (item['messages'] === undefined) {
	// 		item['messages'] = [data];
	// 	} else {
	// 		var duplicate = false;
	// 		$.each(item['messages'], function(index, val) {
	// 			if (val.name == data.name) {
	// 				duplicate = true;
	// 				item['messages'][index] = data;
	// 			}
	// 		});
	// 		if (!duplicate) {
	// 			item['messages'].push(data);
	// 		}
	// 	}
	// 	STORAGE.set(item, function(){
	// 		updateUrl();
	// 		$('#urlForm')[0].reset();
	// 	});
	// });
});

function updateUrl(){
	STORAGE.get('urls', 'local', function(item){
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

$(document).ready(function() {
	updateUrl();
});