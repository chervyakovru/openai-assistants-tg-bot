build:
	docker build -t fire-bot .

run:
	docker run -d -p 3000:3000 --name fire-bot --rm fire-bot