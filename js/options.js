const STORAGE = chrome.storage.local;

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

function updateUrl(){
	STORAGE.get('urls', function(item){
		console.log('update urls', item)
		var listing = '';
		$.each(item.urls, function(index, val) {
			listing += `
			<tr>
				<td>${val.name}</td>
				<td>${val.url}</td>
				<td>${val.method}</td>
				<td>${val.comment}</td>
			</tr>
			`;
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