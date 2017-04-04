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

function addUrl(event) {
	event.preventDefault();
	resetForm('#urlForm');

	var data = {};
	console.log(this);
	$(this).serializeArray().map(function(x){data[x.name] = x.value;});
	var newItem = {};
	newItem[data.name] = data
	var toSave = {};

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
}

function deleteAll(event){
	event.preventDefault();
	cleanUpMsg();
	STORAGE.clear('local', updateUrlListing);
}

function loadUrlData(event) {
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
			previewData.context.data = JSON.parse(data);
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
}

function previewMsg(event) {
	event.preventDefault();
	previewData.source = $('#urlMsg').val();
	if (previewData.source.length > 0 && Object.getOwnPropertyNames(previewData.context.data).length > 0) {
		var iframe = document.getElementById('sandboxFrame');
		var message = {
			name: $('#urlOptions').val(),
			command: 'new',
			context: previewData.context,
			source: previewData.source
		};
		iframe.contentWindow.postMessage(message, '*');
	}
}

function saveMsg(event) {
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
			updatePopupListing();
		});
	}, function(error){
		$('#urlMsgForm').addClass('has-error');
		$('#urlMsgForm .help-block').html('Error saving message: ' + error);
	});
}

function savePopupConfig(event) {
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
}

function updateUrlListing(){
	STORAGE.get('urls', 'local', function(item){
		if ($.isEmptyObject(item.urls)) {
			$('#urlListing').html('<tr><td colspan="5" class="text-center">Use the form below to add Urls</td></tr>');
			return;
		}
		savedUrls = item.urls;
		var listing = '';
		var options = '<option selected disabled>select url</option>';
		var msgListing = '';
		$.each(item.urls, function(key, val) {
			listing += `
			<tr>
			<td>${val.name}</td>
			<td>${val.url}</td>
			<td>${val.method}</td>
			<td>${val.comment}</td>
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

function updatePopupListing(){
	STORAGE.get('urls', 'local', function(item){
		savedUrls = item.urls;
		var msgListing = '';
		$.each(item.urls, function(key, val) {
			msgListing += '<div class="checkbox"><label>';
			if (val.popup) {
				msgListing += `<input type="checkbox" name=${key} value=${key} checked>${key}`;
			}else {
				msgListing += `<input type="checkbox" name=${key} value=${key}>${key}`;
			}
			msgListing += '</label></div>';
		});
		$('#msgListing').html(msgListing);
	});
}

function deleteUrl(event) {
	var name = $(this).attr('name');
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
	$('#urlMsg').val('');
	$('#urlMsgPreview').html('');
	$('#urlMsgForm .help-block').html('');
	resetForm('#urlMsgForm');
}

function resetForm(formId) {
	$(formId).removeClass('has-error');
	$(formId).removeClass('has-success');
	$(formId).find('.help-block').html('');
}

window.addEventListener('message', function(event) {
	console.log('main event from sandbox', event)
	if (event.data.html) {
		$('#urlMsgPreview').html(event.data.html);
	}else{
		$('#urlMsgPreview').html('');
	}
});

$(document).on('submit', '#urlForm', addUrl);

$(document).on('click', '#deleteAllUrl', deleteAll);

$(document).on('change', '#urlOptions', loadUrlData);

$(document).on('click', '#previewMsgBtn', previewMsg);

$(document).on('click', '#saveMsgBtn', saveMsg);

$(document).on('click', '.deleteUrl', deleteUrl);

$(document).on('submit', '#popupForm', savePopupConfig);

$(document).ready(function() {
	updateUrlListing();
	updatePopupListing();
});

