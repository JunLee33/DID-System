#-*- coding:utf-8 -*-
import pika
import json
import mysql.connector
import chardet

mydb = mysql.connector.connect(
    host = "218.38.232.231",
    user = "gstechdb", 
    password = "gstechWkd!",
    database = "GSTECH",
    auth_plugin='mysql_native_password'
)

mycursor = mydb.cursor()

class Consumer:
    def __init__(self):
        self.url = 'gstech.iptime.org'
        self.port = 5672
        self.vhost = 'did'
        self.cred = pika.PlainCredentials('cms', '12345')
        self.exchange = 'RES_SCREENSHOT'
        return

    def on_message(channel, method_frame, header_frame, body):
	
        print("ON MESSAGE RECEIVED.......... by arnold")

        jsonObject = json.loads(body.decode(chardet.detect(body)["encoding"]))

        #print(body.json())
        #print(json.loads(body).decode('utf-16'))
        #print "------- parsing json data ---------"
        
        #jsonObject = json.loads(body)


        device_id = jsonObject.get("device_id")
        uploaded = jsonObject.get("uploaded")

        if(uploaded == 'true'):
            result = "SUCCESS"
        else:
            result = "FAILED"

        print("DEVICE_ID = 	["+ device_id +"]")
        print("RESULT = 	["+ result +"]")

        # device_sw_ver
        # device_cpu
        # device_disk_total
        # device_disk_used
        # device_mem_total
        # device_mem_used
        # device_conn
        # device_conn_dt
        # mdfy_dt

	# IN THIS TIME JUST RECEIVE AND PRINT cause db data was updated by client when upload file.

        # sql = '''
        #     INSERT INTO tbl_device (dev_id, device_sw_ver, device_cpu, device_disk_total, device_disk_used, 
        #                 device_mem_total, device_mem_used, mdfy_dt)
        #     VALUES (
        #     '''
        # sql += "'"+version+"','"+str(cpu)+"','"+disk_total+"','"+storage+"','"+memory_total+"','"+memory+"','"+rdate+"')"

        sql = "UPDATE tbl_device_shot SET upload_yn = 'Y', is_view = 'N'"
        sql += " WHERE dev_id = '"+device_id+"' and upload_yn = 'N' and is_view = 'Y' ORDER BY create_dt DESC limit 1"

        print(sql)

        mycursor.execute(sql)
        mydb.commit()

        print(mycursor.rowcount, "record updated")

        return

    def main(self):
        conn = pika.BlockingConnection(pika.ConnectionParameters(self.url, self.port, self.vhost, self.cred))
        channel = conn.channel()
        channel.exchange_declare(exchange=self.exchange, exchange_type='topic')

        result = channel.queue_declare('', exclusive=True)
        queue_name = result.method.queue

        #routing_key = '#.A-3.#'   # 수신 셋탑박스 아이디
        routing_key = 'RES_SCREENSHOT'   # 수신 셋탑박스 아이디
        channel.queue_bind(
            exchange=self.exchange,
            queue=queue_name,
            routing_key=routing_key
        )

        channel.basic_consume(
            queue=queue_name,
            on_message_callback=Consumer.on_message,
            auto_ack=True
        )
        print('Screen Shot is starting...')
        channel.start_consuming()
        return


consumer = Consumer()
consumer.main()
