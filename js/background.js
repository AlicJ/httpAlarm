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