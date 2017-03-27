function httpGetAsync(theUrl, successCallback, errorCallback=function(){}) {
	var xmlHttp = new XMLHttpRequest();
	xmlHttp.onreadystatechange = function() {
		if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
			successCallback(xmlHttp.responseText);
		}
		else if (xmlHttp.readyState == 4){
			errorCallback(xmlHttp);
		}
	}
	xmlHttp.open("GET", theUrl, true); // true for asynchronous
	xmlHttp.send(null);
}

function renderStatus(statusText) {
	document.getElementById('status').textContent = statusText;
}

function generateText(obj) {
	var text = 'Next bus in ';
	var first = false;
	if (obj.prd) {
		for (p of obj.prd) {
			if (!first) {
				text += (p.prdctdn == 'DUE') ? '0' : p.prdctdn;
				first = true;
			} else {
				text += ' or ' + p.prdctdn;
			}
		}
		text += ' minutes';
	} else {
		text = 'Schedule not found';
	}
	return text;
}

function setNextAlarm(obj) {
	var interval = 0; // in minutes
	var date = new Date();

	if (obj.prd) {
		interval = parseInt(obj.prd[0].prdctdn);

		if (isNaN(interval)) {
			if (obj.prd[1] != undefined) {
				interval = parseInt(obj.prd[1].prdctdn);
			} else {
				interval = 10;
			}
		}

		date.setTime(date.getTime() + interval * 60 * 1000);
		chrome.alarms.create("nextAlarm", {
			when: date.getTime()
		});
	}
}

function notifySchedule(response, setAlarm = true) {
	var obj = JSON.parse(response)['bustime-response'];
	var header = generateText(obj);

	new Notification(header, {
		icon: 'images/icon64.png'
	});

	if (setAlarm) {
		setNextAlarm(obj);
	}
}