build:
	docker build -t tg_gpt .
run: 
	docker run -d -p 3000:3000 --name tg_gpt --rm tg_gpt