build:
	docker build -t assistant-bot .

run:
	docker run -d -p 3000:3000 --name assistant-bot --rm assistant-bot