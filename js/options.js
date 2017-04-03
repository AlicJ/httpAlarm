var STORAGE = {};
STORAGE.local = {};
STORAGE.set = function(item, location = 'local', successCallback, errorCallback) {
	chrome.storage[location].set(item, function(){
		storageHelper(null, successCallback, errorCallback);
	});
};
STORAGE.get = function(key, location = 'local', successCallback, errorCallback) {
	chrome.storage[location].get(key, function(item){
		storageHelper(item, successCallback, errorCallback);
	});
};
STORAGE.remove = function(key, location = 'local', successCallback, errorCallback) {
	chrome.storage[location].remove(key, function(){
		storageHelper(null, successCallback, errorCallback);
	});
};
STORAGE.clear = function(location = 'local', successCallback, errorCallback) {
	chrome.storage[location].clear(function(){
		storageHelper(null, successCallback, errorCallback);
	});
};

function storageHelper(item, successCallback, errorCallback) {
	if (chrome.runtime.lastError) {
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
	resetForm('#urlForm');

	var data = {};
	$(this).serializeArray().map(function(x){data[x.name] = x.value;});
	var newItem = {};
	newItem[data.name] = data
	var toSave = {messages: {}};

	if (!isValidUrl(data.url)){
		$('#urlForm').addClass('has-error');
		$('#urlForm .help-block').html('Invalid URL');
		return;
	}

	STORAGE.get('urls', 'local', function(item){
		toSave.urls = Object.assign({}, item.urls, newItem);
		STORAGE.set(toSave, 'local', function(){
			updateUrlListing();
			$('#urlForm')[0].reset();
		});
	}, function(error){
		$('#urlForm .form-group').addClass('has-error');
		$('#urlForm .help-block').html('Error saving url: ' + error);
	});

});

$(document).on('click', '#deleteAllUrl', function(event) {
	event.preventDefault();
	cleanUpMsg();
	STORAGE.clear('local', updateUrl);
});

$(document).on('change', '#urlOptions', function(event) {
	event.preventDefault();
	cleanUpMsg();
	var urlName = $(this).val();
	$.ajax({
		url: savedUrls[urlName].url,
		type: savedUrls[urlName].method
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
		STORAGE.get('urls', 'local', function(item){
			if (item.urls[urlName].message !== undefined) {
				$('#urlMsg').val(item.urls[urlName].message);
			}
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
		$('#urlMsgPreview').html(event.data.html);
	}
});

$(document).on('click', '#saveMsgBtn', function(event) {
	event.preventDefault();
	resetForm('#urlMsgForm');

	var urlName = $('#urlOptions').val();
	var urlMessage = $('#urlMsg').val();

	if (urlMessage.length < 1){
		$('#urlMsgForm').addClass('has-error');
		$('#urlMsgForm .help-block').html('Message cannot be empty');
		return;
	}else if (urlName == null) {
		$('#urlMsgForm').addClass('has-error');
		$('#urlMsgForm .help-block').html('Please select a URL');
		return;
	}

	STORAGE.get('urls', 'local', function(item){
		item.urls[urlName].message = urlMessage;
		STORAGE.set(item, 'local', function(){
			$('#urlMsgForm').addClass('has-success');
			$('#urlMsgForm .help-block').html('Message saved');
			updateUrlListing();
		});
	}, function(error){
		$('#urlMsgForm').addClass('has-error');
		$('#urlMsgForm .help-block').html('Error saving message: ' + error);
	});
});

$(document).on('click', '.deleteUrl', function(event) {
	event.preventDefault();
	deleteUrl($(this).attr('name'));
});

$(document).on('submit', '#popupForm', function(event) {
	event.preventDefault();
	resetForm('#popupForm');

	var data = [];
	$(this).serializeArray().map(function(x){data.push(x.value);});

	STORAGE.get('urls', 'local', function(item){
		$.each(item.urls, function(key, val) {
			console.log(key, item.urls)
			item.urls[key].popup = data.includes(key);
		});
		STORAGE.set(item, 'local', function(){
			$('#popupForm').addClass('has-success');
			$('#popupForm').find('.help-block').html('saved');
			updateUrlListing();
		});
	});
});

function updateUrlListing(){
	STORAGE.get('urls', 'local', function(item){
		var listing = '';
		var options = '<option selected disabled>select url</option>';
		var msgListing = '';
		$.each(item.urls, function(key, val) {
			savedUrls[val.name] = val;
			listing += `
				<tr>
					<td>${val.name}</td>
					<td>${val.url}</td>
					<td>${val.method}</td>
					<td>${val.comment}</td>
					<td class="text-primary"><span class="pointer editUrl" name=${val.name}>Edit</span></td>
					<td class="text-danger"><span class="pointer deleteUrl" name=${val.name}>Delete</span></td>
				</tr>
				`;
			options += `
				<option value="${val.name}">${val.name}</option>
				`;
			msgListing += '<div class="checkbox"><label>';
			if (val.popup) {
				msgListing += `<input type="checkbox" name=${key} value=${key} checked>${key}`;
			}else {
				msgListing += `<input type="checkbox" name=${key} value=${key}>${key}`;
			}
			msgListing += '</label></div>';
		});
		$('#urlListing').html(listing);
		$('#urlOptions').html(options);
		$('#msgListing').html(msgListing);
	});
}

function deleteUrl(name) {
	STORAGE.get('urls', 'local', function(item){
		if(delete item.urls[name]) {
			STORAGE.set(item, 'local', function(){
				updateUrlListing();
			});
		}
	});
}

function cleanUpMsg(){
	$('#urlMsg').html('');
	$('#urlData').html('');
	$('#urlMsgPreview').html('');
	$('#urlMsgForm .help-block').html('');
	resetForm('#urlMsgForm');
}

function resetForm(formId) {
	$(formId).removeClass('has-error');
	$(formId).removeClass('has-success');
	$(formId).find('.help-block').html('');
}

$(document).ready(function() {
	updateUrlListing();
});