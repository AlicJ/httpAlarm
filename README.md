# httpAlarm
A chrome extension that acts as a reminder service, with the ability to pull data from specified URL to enrich reminder content

## Changelog
### v0.1
Proof of concept prototype for personal needs. It is able to make a `GET` request to Oakville transit's real time bus tracking website to pull upcoming schedules of specified bus top, and then send a browser notification of the arrival time of the next bus at 5:30PM. It will then keep sending notification about new arrival times after the next bus arrives.