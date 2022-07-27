#-*- coding:utf-8 -*-
import pika
import json


class Publisher:
    def __init__(self):
        self.url = 'gstech.iptime.org'
        self.port = 5672
        self.vhost = 'did'
        self.cred = pika.PlainCredentials('cms', '12345')
        self.exchange_name = 'EXC_COMMAND'
        return

    def main(self):
        conn = pika.BlockingConnection(pika.ConnectionParameters(self.url, self.port, self.vhost, self.cred))
        channel = conn.channel()

        channel.exchange_declare(exchange=self.exchange_name, exchange_type='topic')

        with open('command.json', encoding='UTF-8') as f:
            command_object = json.load(f)

        routing_key = 'A-1.stb01.stb02.stb03'   # 전송할 셋탑박스 아이디를 dot(.)으로 구분하여 연결(최대 255byte)
        #routing_key = 'DEVICE_STATUS'   # 전송할 셋탑박스 아이디를 dot(.)으로 구분하여 연결(최대 255byte)

        channel.basic_publish(
            exchange=self.exchange_name,
            routing_key=routing_key,
            body=json.dumps(command_object)
        )

        conn.close()
        return


publisher = Publisher()
publisher.main()
