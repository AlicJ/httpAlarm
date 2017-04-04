var counter = 0;
var totalSize = 0;
var noShow = 0;

document.addEventListener('DOMContentLoaded', function() {
	$('#noData').hide();
	$('#status').hide();


	var iframe = document.getElementById('sandboxFrame');
	STORAGE.get('urls', 'local', function(items){
		$.each(items.urls, function(key, item) {
			totalSize++;
			if (!item.popup) {
				noShow++;
				if (noShow == totalSize) {
					$('#loading').hide();
					$('#noData').show();
				}
				return;
			}
			$.ajax({
				url: item.url,
				type: item.method
			})
			.done(function(response){
				var obj = {}
				try{
					obj.data = typeof response == 'string' ? JSON.parse(response) : response;
				}
				catch(exception) {
					console.log(exception)
				}
				var message = {
					name: item.name,
					command: 'new',
					context: obj,
					source: item.message,
					counter : counter++
				};
				iframe.contentWindow.postMessage(message, '*');
			});
		});
	});
});

window.addEventListener('message', function(event) {
	console.log('main event from sandbox', event);
	if (event.data.html) {
		$('#loading').hide();
		$('#status').show();
		$('#dataTable tbody').append(`
			<tr>
			<td>${event.data.name}</td>
			<td>${event.data.html}</td>
			</tr>
			`);
	}
});
/*
{{#if bustime-response.prd}}
  Next bus in {{#each bustime-response.prd}} {{prdctdn}} {{/each}} minutes.
{{else}}
  No schedule found
{{/if}}
*/