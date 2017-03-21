chrome.alarms.onAlarm.addListener(function(alarm) {
	var url = 'http://busfinder.oakvilletransit.ca/bustimemobile/proxy?op=getpredictions&stpid=2988';
	httpGetAsync(url, notifySchedule);
});

var date = new Date();
date.setHours(17, 30, 0, 0);

chrome.alarms.clearAll();

chrome.alarms.create("initialAlarm", {
	when: date.getTime()
});