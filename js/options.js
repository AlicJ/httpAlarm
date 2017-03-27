const STORAGE = chrome.storage.local;

function isValidUrl(url) {
	var expression = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi;
	var regex = new RegExp(expression);
	return url.match(regex);
}

$(document).on('click', '#urlForm .submit', function(event) {
	event.preventDefault();
	var name = $('#urlForm #name').val();
	var url = $('#urlForm #url').val();

	if (!isValidUrl(url)){
		$('#urlForm .form-group').addClass('has-error');
		$('#urlForm .help-block').text('Invalid URL');
		return;
	}

	var newUrl = {
		name: name,
		url: url
	};

	STORAGE.get('urls', function(item){
		if (item.urls === undefined) {
			item.urls = [newUrl];
		} else {
			var duplicate = false;
			$.each(item.urls, function(index, val) {
				if (val.name == newUrl.name) {
					duplicate = true;
					item.urls[index] = newUrl;
				}
			});
			if (!duplicate) {
				item.urls.push(newUrl);
			}
		}
		STORAGE.set(item, function(){
			updateUrl();
		});
	});

});

$(document).on('click', '#deleteAllUrl', function(event) {
	event.preventDefault();
	STORAGE.remove('urls', updateUrl);
});

function updateUrl(){
	STORAGE.get('urls', function(item){
					console.log('update urls', item)
		var listing = '';
		$.each(item.urls, function(index, val) {
			listing += '<tr><td>'+ val.name +'</td><td>' + val.url + '</td></tr>';
		});
		$('#urlList').html(listing);
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