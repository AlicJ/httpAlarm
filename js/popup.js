var counter = 0;

document.addEventListener('DOMContentLoaded', function() {
	var iframe = document.getElementById('sandboxFrame');
	STORAGE.get('urls', 'local', function(items){
		$.each(items.urls, function(key, item) {
			if (!item.popup) {
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
	console.log('main event from sandbox', event)
	if (event.data.html) {
		$('#loading').hide();
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