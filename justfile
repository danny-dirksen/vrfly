questhost := "192.168.1.150:5555"

dev:
	serve

a:
	adb tcpip 5555

b:
	adb connect {{questhost}}
# google-chrome "chrome://inspect/#devices"

c:
	serve public

d:
	ngrok http 5000

f:
	ngrok http file:///Users/daniel/Github/vrfly/public/