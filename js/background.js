function httpGetAsync(theUrl, callback) {
	var xmlHttp = new XMLHttpRequest();
	xmlHttp.onreadystatechange = function() {
		if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
			callback(xmlHttp.responseText);
	}
	xmlHttp.open("GET", theUrl, true); // true for asynchronous
	xmlHttp.send(null);
}

function renderStatus(statusText) {
	document.getElementById('status').textContent = statusText;
}

function notifySchedule(response) {
	var obj = JSON.parse(response)['bustime-response'];
	console.log(obj);
	var header = 'Next bus in ';
	var first = false;

	if (obj.prd) {
		//generate header for current notification
		for (p of obj.prd) {
			if (!first) {
				header += p.prdctdn;
				first = true;
			} else {
				header += ' or ' + p.prdctdn;
			}
		}
		header += ' minutes';
		// set new alarm for after the next bus
		var date = new Date();
		date.setTime(date.getTime() + obj.prd[0].prdctdn * 60 * 1000);
		chrome.alarms.create("alarmTest", {
			when: date.getTime()
		});
	}
	else{
		header = 'Schedule not found';
	}

	new Notification(header, {
		icon: 'images/icon64.png'
	});
}
