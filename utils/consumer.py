#-*- coding:utf-8 -*-
import pika
import json
import mysql.connector
import chardet
from mysql.connector import pooling

mydb = mysql.connector.connect(
    host = "218.38.232.231",
    user = "gstechdb", 
    password = "gstechWkd!",
    database = "GSTECH",
    auth_plugin='mysql_native_password'
)

mycursor = mydb.cursor()


# dbconfig = {
#     "host" : "218.38.232.231",
#     "user" : "gstechdb", 
#     "password" : "gstechWkd!",
#     "database" : "GSTECH",
#     "auth_plugin" :'mysql_native_password'
# }

# pool = mysql.connector.connect(
#     pool_name = "myPool",
#     pool_size = 3,
#     **dbconfig)

class Consumer:

    def __init__(self):
        self.url = 'gstech.iptime.org'
        self.port = 5672
        self.vhost = 'did'
        self.cred = pika.PlainCredentials('cms', '12345')
        self.exchange = 'DEVICE_STATUS'
        return

    def on_message(channel, method_frame, header_frame, body):
	
        print("ON MESSAGE RECEIVED.......... by arnold")

        jsonObject = json.loads(body.decode(chardet.detect(body)["encoding"]))

        #print(body.json())
        #print(json.loads(body).decode('utf-16'))
        #print "------- parsing json data ---------"
        
        #jsonObject = json.loads(body)


        device_id = jsonObject.get("device_id")
        rdate = jsonObject.get("date")
        cpu = jsonObject.get("cpu")
        memory = jsonObject.get("memory")
        storage = jsonObject.get("storage")
        version = jsonObject.get("version")

        print("DEVICE_ID = 	["+device_id +"]")
        print("DATE = 		["+rdate +"]")
        print("CPU = 		["+str(cpu) +"]")
        print("MEMORY = 	["+memory +"]")
        print("STORAGE = 	["+storage +"]")
        print("version = 	["+version +"]")

        memory_obj = memory.split('/')
        memory_total = memory_obj[1]

        disk_obj = storage.split('/')
        disk_total = disk_obj[1]

        # device_sw_ver
        # device_cpu
        # device_disk_total
        # device_disk_used
        # device_mem_total
        # device_mem_used
        # device_conn
        # device_conn_dt
        # mdfy_dt

        # sql = '''
        #     INSERT INTO tbl_device (dev_id, device_sw_ver, device_cpu, device_disk_total, device_disk_used, 
        #                 device_mem_total, device_mem_used, mdfy_dt)
        #     VALUES (
        #     '''
        # sql += "'"+version+"','"+str(cpu)+"','"+disk_total+"','"+storage+"','"+memory_total+"','"+memory+"','"+rdate+"')"

        sql = "UPDATE tbl_device SET device_sw_ver = '"+version+"', device_cpu ='"+str(cpu)+"', device_disk_total = '"+disk_total+"'"
        sql += ", device_disk_used = '"+storage+"', device_mem_total = '"+memory_total+"', device_mem_used = '"+memory+"', mdfy_dt = '"+rdate+"'"
        sql += " WHERE dev_id = '"+device_id+"'"

        print(sql)
	

        # con = pool._get_connection()

        # connection = con.cursor()
        # connection.execute(sql)
        # connection.commit()
        # res = connection.fetchall()
        # connection.close()
        # con.close()


        try:
            
            if(mycursor):
                print("DB Already connected skip connection")

            else:
                mycursor = mydb.cursor()

            # mycursor.execute(sql)
            mycursor.execute(sql)
            mydb.commit()

            print(mycursor.rowcount, "record inserted")
            
        except Exception as e:

            print("DB Connection Error Occurred !!. Now reconnect DB session")

            mydb = mysql.connector.connect(
                host = "218.38.232.231",
                user = "gstechdb", 
                password = "gstechWkd!",
                database = "GSTECH",
                auth_plugin='mysql_native_password'
            )
	
            mycursor = mydb.cursor()
            mycursor.execute(sql)
            mydb.commit()

        return

    def main(self):
        conn = pika.BlockingConnection(pika.ConnectionParameters(self.url, self.port, self.vhost, self.cred))
        channel = conn.channel()
        channel.exchange_declare(exchange=self.exchange, exchange_type='topic')

        result = channel.queue_declare('', exclusive=True)
        queue_name = result.method.queue

        #routing_key = '#.A-3.#'   # 수신 셋탑박스 아이디
        routing_key = 'DEVICE_STATUS'   # 수신 셋탑박스 아이디
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
        print('Consumer is starting...')
        channel.start_consuming()
        return


consumer = Consumer()
consumer.main()
