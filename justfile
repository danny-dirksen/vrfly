questhost := "192.168.1.150:5555"

dev:
	miniserve

a:
	adb tcpip 5555

b:
	adb connect {{questhost}}
# google-chrome "chrome://inspect/#devices"

c:
	miniserve public

d:
	ngrok http 8080

f:
	ngrok http file:///Users/daniel/Github/vrfly/public/