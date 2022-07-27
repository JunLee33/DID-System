FROM tiangolo/uwsgi-nginx-flask:python3.8

ENV STATIC_URL /static

COPY requirements.txt /tmp/
RUN pip install -r /tmp/requirements.txt && \
	rm /tmp/requirements.txt
	
RUN apt-get update
RUN apt-get -y install libgl1-mesa-glx

COPY ./ /app
