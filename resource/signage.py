

from models.statistics_summ import StatisticsSummaryModel
from models.device import DeviceModel, DeviceShotModel, DeviceLogModel
from models.organic import ScheduleDepModel
from models.contents  import ContentsModel
from models.gsmodel import GsModel
from models.app import AppModel

from flask_restful import Resource, reqparse, request
from flask import Flask, jsonify
from datetime import datetime
from flask_login import current_user
import json
import cv2
from config.properties import *
from utils.jsonutil import AlchemyEncoder as jsonEncoder
from utils.fileutil import FileUtils
import logging
import time
import base64


class GsSchedule (Resource):
    parse = reqparse.RequestParser()

    def get(self):

        # 무조건 지금의 Schedule Data Json 만들어서 내려 줌.
        # Project 단위 배포 (schedule 내에서)

        schedule_list = {
            'schedule_id': 0,
            'schedule_repeat':True,
            'schedule_start':'',
            'schedule_end':'',
            'schedule_update':'',
            'projects':[]
        }

        params = GsSchedule.parse.parse_args()
        # device_id = params['device_id']

        # 다수의 parameter 받기
        # params = request.args.getlist('status') or request.form.getlist('status')

        # 1개의 parameter get
        Schedule_ID = request.args.get("schedule_id")

        # get parameter
        print("Schedule ID : ["+Schedule_ID+"]")

        schedule_obj = [dict(r) for r in GsModel.find_schedule_list(Schedule_ID)]

        print(schedule_obj)

        for idx in range(len(schedule_obj)):

            schedule_list['schedule_id'] = schedule_obj[idx]["sch_id"]
            if(schedule_obj[idx]["sch_loop_yn"] == 'true'):
                schedule_list['schedule_repeat'] = True
            else:
                schedule_list['schedule_repeat'] = False
                
            schedule_list['schedule_start'] = schedule_obj[idx]["sch_st_date"]
            schedule_list['schedule_end'] = schedule_obj[idx]["sch_ed_date"]
            schedule_list['schedule_update'] = schedule_obj[idx]["mdfy_dt"]


            schedule_id = schedule_obj[idx]["sch_id"]

            print("schedule_id = ["+str(schedule_id)+"]")
            # print(str(schedule_list))

            # project processing
            project_list = {
                'project_id': 0,
                'project_name': '',
                'project_start_time': '',
                'project_end_time': '',
                'week': '',
                'width': 0,
                'height': 0,
                'orientation': 0,
                'controls':[]
            }
            project_obj = [dict(r) for r in GsModel.find_project_list(schedule_id)]

            for project_idx in range(len(project_obj)):
                
                project_list['project_id'] = project_obj[project_idx]["organ_id"]
                project_list['project_name'] = project_obj[project_idx]["organ_nm"]
                project_list['project_start_time'] = project_obj[project_idx]["organ_st_dt"]
                project_list['project_end_time'] = project_obj[project_idx]["organ_ed_dt"]
                project_list['week'] = project_obj[project_idx]["organ_week1"]+project_obj[project_idx]["organ_week2"]+project_obj[project_idx]["organ_week3"]+project_obj[project_idx]["organ_week4"]+project_obj[project_idx]["organ_week5"]+project_obj[project_idx]["organ_week6"]+ project_obj[project_idx]["organ_week7"]
                
                # 0823 screen_id 관련 수정
                project_list['width'] = int(project_obj[project_idx]["screen_id"].split("X")[0])
                project_list['height'] = int(project_obj[project_idx]["screen_id"].split("X")[1])

                if project_list['width'] > project_list['height'] :
                    project_list['orientation'] = int(1)
                else : project_list['orientation'] = int(2)
                # project_list['orientation'] = int(project_obj[project_idx]["screen_direction"])
                

                organ_id = project_obj[project_idx]["organ_id"]
                control_id = project_obj[project_idx]["control_id"]

                print("organ_id = ["+str(organ_id)+"]")
                print("control_id = ["+str(control_id)+"]")

                # control list
                control_list = {
                    'control_id': 0,
                    'type': '',
                    'x': 0,
                    'y': 0,
                    'width': 0,
                    'height': 0,
                    'z_order': 0,
                    'contents':[]
                }

                control_obj = [dict(r) for r in GsModel.find_control_list(organ_id)]

                for control_idx in range(len(control_obj)):
                    control_list['control_id'] = control_obj[control_idx]["control_detail_id"]
                    control_list['type'] = control_obj[control_idx]["control_type"]
                    control_list['x'] = control_obj[control_idx]["control_x"]
                    control_list['y'] = control_obj[control_idx]["control_y"]
                    control_list['width'] = control_obj[control_idx]["control_w"]
                    control_list['height'] = control_obj[control_idx]["control_h"]
                    control_list['z_order'] = control_obj[control_idx]["control_order"]

                    # print(control_list)
                    project_list['controls'].append(control_list)

                    # contents 분기 태워서 TEXT 분리 하기
                    contents_type = control_obj[control_idx]["control_type"]
                    control_id = control_obj[control_idx]["control_detail_id"]

                    # print("control_detail_id = ["+str(control_detail_id)+"]")

                    if(contents_type == 'text'):
                        # print("text mode")

                        text_contents_list = {
                            'content_id':0,
                            'expiration':0,
                            'type':0,
                            'cont_name':0,
                            'cont_duration':0,
                            'cont_effect_type':0,
                            'font_name':0,
                            'font_size':0,
                            'font_color':0,
                            'font_bg_color':0,
                            "texts":[]
                        }

                        contents_obj = [dict(r) for r in GsModel.find_txt_contents_list(control_id)]

                        for contents_idx in range(len(contents_obj)):
                            text_contents_list['content_id'] = contents_obj[contents_idx]["contcon_id"]
                            text_contents_list['expiration'] = contents_obj[contents_idx]["cont_ed_dt"]
                            text_contents_list['type'] = contents_obj[contents_idx]["cont_tp"]
                            text_contents_list['cont_name'] = contents_obj[contents_idx]["subt_nm"]
                            text_contents_list['cont_duration'] = contents_obj[contents_idx]["contcon_tm"]
                            text_contents_list['cont_effect_type'] = contents_obj[contents_idx]["comm_nm"]
                            text_contents_list['font_name'] = contents_obj[contents_idx]["subt_font"]
                            text_contents_list['font_size'] = contents_obj[contents_idx]["subt_font_size"]
                            text_contents_list['font_color'] = contents_obj[contents_idx]["subt_font_color"]
                            text_contents_list['font_bg_color'] = contents_obj[contents_idx]["subt_font_bcolor"]

                            #  요구사항 변경 2021.04.23 
                            # text_contents = { 'text': contents_obj[contents_idx]["subt_text1"]}
                            # text_contents_list['texts'].append(text_contents)
                            # text_contents = { 'text': contents_obj[contents_idx]["subt_text2"]}
                            # text_contents_list['texts'].append(text_contents)
                            # text_contents = { 'text': contents_obj[contents_idx]["subt_text3"]}
                            # text_contents_list['texts'].append(text_contents)

                            if(contents_obj[contents_idx]["subt_text1"] != ""): 
                                text_contents_list['texts'].append(contents_obj[contents_idx]["subt_text1"])
                            if(contents_obj[contents_idx]["subt_text2"] != ""):
                                text_contents_list['texts'].append(contents_obj[contents_idx]["subt_text2"])
                            if(contents_obj[contents_idx]["subt_text3"] != ""):
                                text_contents_list['texts'].append(contents_obj[contents_idx]["subt_text3"])
                            if(contents_obj[contents_idx]["subt_text4"] != ""):
                                text_contents_list['texts'].append(contents_obj[contents_idx]["subt_text4"])
                            if(contents_obj[contents_idx]["subt_text5"] != ""):
                                text_contents_list['texts'].append(contents_obj[contents_idx]["subt_text5"])


                            # print(text_contents_list)
                            control_list['contents'].append(text_contents_list)

                            text_contents_list = {
                                'content_id':0,
                                'expiration':0,
                                'type':0,
                                'cont_name':0,
                                'cont_duration':0,
                                'cont_effect_type':0,
                                'font_name':0,
                                'font_size':0,
                                'font_color':0,
                                'font_bg_color':0,
                                "texts":[]
                            }
                    else:
                        # print("contents  mode")

                        contents_list_movie = {
                            'content_id': 0,
                            'expiration': '',
                            'type': '',
                            'cont_name': '',
                            'cont_size': 0,
                            'cont_duration': 0,
                            'url': '',
                        }

                        contents_list_image = {
                            'content_id': 0,
                            'expiration': '',
                            'type': '',
                            'cont_name': '',
                            'cont_size': 0,
                            'cont_duration': 0,
                            'url': '',
                            'cont_effect_type':'',
                        }

                        contents_list_web = {
                            'content_id': 0,
                            'expiration': '',
                            'type': '',
                            'cont_name': '',
                            'cont_duration': 0,
                            'url': '',
                        }

                        contents_list_live = {
                            'content_id': 0,
                            'expiration': '',
                            'type': '',
                            'cont_name': '',
                            'cont_duration': 0,
                            'url': '',
                        }

                        contents_obj = [dict(r) for r in GsModel.find_contents_list(control_id)]

                        for contents_idx in range(len(contents_obj)):

                            # contents type 별로 별도 구성 (2021.08.05)
                            if(contents_obj[contents_idx]["cont_tp"] == 'movie'):
                                contents_list_movie['content_id'] = contents_obj[contents_idx]["cont_id"]
                                contents_list_movie['expiration'] = contents_obj[contents_idx]["cont_ed_dt"]
                                contents_list_movie['type'] = contents_obj[contents_idx]["cont_tp"]
                                contents_list_movie['cont_name'] = contents_obj[contents_idx]["cont_nm"]
                                contents_list_movie['cont_size'] = contents_obj[contents_idx]["cont_size"]
                                contents_list_movie['cont_duration'] = contents_obj[contents_idx]["contcon_tm"]
                                contents_list_movie['url'] = contents_obj[contents_idx]["cont_url"]

                                control_list['contents'].append(contents_list_movie)

                                contents_list_movie = {
                                    'content_id': 0,
                                    'expiration': '',
                                    'type': '',
                                    'cont_name': '',
                                    'cont_size': 0,
                                    'cont_duration': 0,
                                    'url': '',
                                }

                            if(contents_obj[contents_idx]["cont_tp"] == 'image'):
                                contents_list_image['content_id'] = contents_obj[contents_idx]["cont_id"]
                                contents_list_image['expiration'] = contents_obj[contents_idx]["cont_ed_dt"]
                                contents_list_image['type'] = contents_obj[contents_idx]["cont_tp"]
                                contents_list_image['cont_name'] = contents_obj[contents_idx]["cont_nm"]
                                contents_list_image['cont_size'] = contents_obj[contents_idx]["cont_size"]
                                contents_list_image['cont_duration'] = contents_obj[contents_idx]["contcon_tm"]
                                contents_list_image['url'] = contents_obj[contents_idx]["cont_url"]
                                contents_list_image['cont_effect_type'] = contents_obj[contents_idx]["effect"]

                                control_list['contents'].append(contents_list_image)

                                contents_list_image = {
                                    'content_id': 0,
                                    'expiration': '',
                                    'type': '',
                                    'cont_name': '',
                                    'cont_size': 0,
                                    'cont_duration': 0,
                                    'url': '',
                                    'cont_effect_type':'',
                                }

                            if(contents_obj[contents_idx]["cont_tp"] == 'web'):
                                contents_list_web['content_id'] = contents_obj[contents_idx]["cont_id"]
                                contents_list_web['expiration'] = contents_obj[contents_idx]["cont_ed_dt"]
                                contents_list_web['type'] = contents_obj[contents_idx]["cont_tp"]
                                contents_list_web['cont_name'] = contents_obj[contents_idx]["cont_nm"]
                                contents_list_web['cont_duration'] = contents_obj[contents_idx]["contcon_tm"]
                                contents_list_web['url'] = contents_obj[contents_idx]["cont_url"]

                                control_list['contents'].append(contents_list_web)

                                contents_list_web = {
                                    'content_id': 0,
                                    'expiration': '',
                                    'type': '',
                                    'cont_name': '',
                                    'cont_duration': 0,
                                    'url': '',
                                }

                            if(contents_obj[contents_idx]["cont_tp"] == 'live'):
                                contents_list_live['content_id'] = contents_obj[contents_idx]["cont_id"]
                                contents_list_live['expiration'] = contents_obj[contents_idx]["cont_ed_dt"]
                                contents_list_live['type'] = contents_obj[contents_idx]["cont_tp"]
                                contents_list_live['cont_name'] = contents_obj[contents_idx]["cont_nm"]
                                contents_list_live['cont_duration'] = contents_obj[contents_idx]["contcon_tm"]
                                contents_list_live['url'] = contents_obj[contents_idx]["cont_url"]

                                control_list['contents'].append(contents_list_live)

                                contents_list_live = {
                                    'content_id': 0,
                                    'expiration': '',
                                    'type': '',
                                    'cont_name': '',
                                    'cont_duration': 0,
                                    'url': '',
                                }
                    # control list
                    control_list = {
                        'control_id': 0,
                        'type': '',
                        'x': 0,
                        'y': 0,
                        'width': 0,
                        'height': 0,
                        'z_order': 0,
                        'contents':[]
                    }
                # print(project_list)
                schedule_list['projects'].append(project_list)

                # project_list init
                project_list = {
                    'project_id': 0,
                    'project_name': '',
                    'project_start_time': '',
                    'project_end_time': '',
                    'week': '',
                    'width': 0,
                    'height': 0,
                    'orientation': 0,
                    'controls':[]
                }
        print("FINALIZED RESULT : ["+ str(schedule_list) +"]")
                
        # Schedule 최종 값을 정리해서 Return. 
        return {
            "schedule_id": schedule_list['schedule_id'],
            "schedule_repeat": schedule_list['schedule_repeat'],
            "schedule_start": schedule_list['schedule_start'],
            "schedule_end": schedule_list['schedule_end'],
            "schedule_update": schedule_list['schedule_update'],
            "projects": schedule_list['projects']
        }, 200

# device ID 에 배포된 Schedule list 내려줌.
class GsDeviceSchedule (Resource):
    
    parse = reqparse.RequestParser()

    def get(self):

        # 1개의 parameter get
        device_id = request.args.get("device_id")

        print(device_id)

        schedule_list = [dict(r) for r in ScheduleDepModel.find_by_device_id(device_id)]

        return {
            "device_id":device_id,
            "schedules" : schedule_list
        }, 200


# device ID 인증 (최초 적용 & Enabling).
class GsDeviceAuth (Resource):
    

    def get(self):

        # 1개의 parameter get
        device_id = request.args.get("device_id")

        print("GET ENTERED GsDeviceAuth device_id : ["+device_id+"]")

        deviceObj = DeviceModel.find_by_id(device_id)

        print(deviceObj)

        if(deviceObj):

            deviceObj = DeviceModel.device_authentication(device_id)

            print(str(deviceObj))

            if(deviceObj):
                resultString = "디바이스 인증이 완료 되었습니다"
                resultCode = '0'
            else:
                resultString = "등록되지 않은 디바이스 입니다"
                resultCode = '100'
        else:
            resultString = "등록되지 않은 디바이스 입니다"
            resultCode = '100'

        return {
                "resultCode":resultCode,
                "resultString" : resultString
        }, 200


# 장치별 cpu - memory - disk 사용량 저장
class GsDeviceStatus(Resource):

    parse = reqparse.RequestParser()

    parse.add_argument('device_id', type=str)
    parse.add_argument('device_cpu', type=str)
    parse.add_argument('device_mem', type=str)
    parse.add_argument('device_disk', type=str)

    def post(self):

        params = GsDeviceStatus.parse.parse_args()

        dev_id = params['device_id']
        dev_cpu = params['device_cpu']
        dev_mem = params['device_mem']
        dev_disk = params['device_disk']
        usage_date = datetime.now()

        # DB 저장 해 줌. (서버 연동은 iParking model) 여기서는 그냥 데이타만 저장하고 끝냄. 
        # deviceOBJ = DeviceUsageModel( dev_id, usage_date, dev_cpu, dev_mem, dev_disk)
        # deviceOBJ.save_to_db

        # tbl_device 데이타 업데이트
        deviceObj = DeviceModel.find_by_id(dev_id)

        if(deviceObj):
            deviceObj.device_cpu        = dev_cpu
            deviceObj.device_mem_used   = dev_mem
            deviceObj.device_disk_used  = dev_disk

            deviceObj.save_to_db()
            resultCode = '0'
            resultString = '단말기 정보 저장 완료되었습니다'
        else:
            resultCode = '100'
            resultString = '등록되지 않은 단말기 입니다'

        return {'resultCode': resultCode, "resultString": resultString}, 200



class GsStatistics(Resource):
    parse = reqparse.RequestParser()

    parse.add_argument('device_id', type=str)
    parse.add_argument('schedule_id', type=str)
    parse.add_argument('contents_id', type=str)
    parse.add_argument('duration', type=int)

    print("ENTERED GsStatistics .. ")


    def post(self):

        print("ENTERED GsStatistics .. POST")

        params = GsStatistics.parse.parse_args()

        dev_id = params['device_id']
        sch_id = params['schedule_id']
        cont_id = params['contents_id']
        duration = params['duration']

        # 통계 요약 테이블에 등록 처리

        # stat_id = db.Column(db.BigInteger, primary_key=True, autoincrement=True)                    # 통계 순번(Auto)
        # stat_date = db.Column(db.DateTime, nullable=False)                                          # 통계 일자 (시간단위 처리)
        # stat_time = db.Column(db.Integer, nullable=False)                                           # 총 플레이 시간(초)
        # stat_cnt = db.Column(db.BigInteger, nullable=False)                                         # 통계 플레이 카운트
        # sch_id = db.Column(db.BigInteger, nullable=False)                                           # 스케줄순번(TBL_SCHEDULE)
        # cont_id = db.Column(db.Integer,nullable=False)                                              # 레이아웃(TBL_LAYER)
        # dev_id = db.Column(db.String(40),nullable=False)                                            # 장치(TBL_DEVICE)
        
        # 날짜 시간 찾기
        now = datetime.now()
        now_date_hour = now.strftime('%Y-%m-%d %H:00:00')

        if(dev_id != None):
        
            stat_obj = StatisticsSummaryModel.find_by_key(sch_id, cont_id, dev_id, now_date_hour)

            # contents ID로 contents 이름 가져오기. 
            cont_obj = ContentsModel.find_by_id(cont_id)

            try:
                device_obj = DeviceModel.find_by_id(dev_id)

                if(device_obj):
                    # device 접속 시간 update
                    device_obj.device_play_status = cont_obj.cont_nm
                    device_obj.device_conn_dt = datetime.now()
                    device_obj.save_to_db()

                if stat_obj is None:
                    # create new row
                    obj = StatisticsSummaryModel( now_date_hour, 0, 1, sch_id, cont_id, dev_id, now)
                    obj.save_to_db()
                    resultCode = "0"
                    resultString = "INSERT"
                else:
                    # update row
                    stat_obj.stat_cnt = stat_obj.stat_cnt + 1
                    stat_obj.stat_time = stat_obj.stat_time + int(duration)
                    stat_obj.save_to_db()

                    resultCode = "0"
                    resultString = "UPDATE"

                return {'resultCode': resultCode, "resultString": "데이타 저장이 완료 되었습니다"}, 200
            except Exception as e:
                print(str(e))
                resultCode = "100"
                resultString = "에러가 발생 하였습니다"

                return {'resultCode': resultCode, "resultString": resultString}, 200
        else:
            return {'resultCode': '100', "resultString": 'Access Denied'}, 200

# mysql> desc tbl_device_shot;
# +--------------+-------------+------+-----+-------------------+-------------------+
# | Field        | Type        | Null | Key | Default           | Extra             |
# +--------------+-------------+------+-----+-------------------+-------------------+
# | shot_no      | int         | NO   | PRI | NULL              | auto_increment    |
# | dev_id       | varchar(45) | NO   | PRI | NULL              |                   |
# | shot_nm      | varchar(45) | YES  |     | NULL              |                   |
# | shot_url     | varchar(45) | YES  |     | NULL              |                   |
# | shot_thu_url | varchar(45) | YES  |     | NULL              |                   |
# | is_view      | varchar(1)  | NO   |     | N                 |                   |
# | create_dt    | datetime    | YES  |     | CURRENT_TIMESTAMP | DEFAULT_GENERATED |
# | modify_dt    | datetime    | YES  |     | CURRENT_TIMESTAMP | DEFAULT_GENERATED |
# +--------------+-------------+------+-----+-------------------+-------------------+
# Device screen shot management table

# 장치별 스크린 샷 저장
class gsScreen(Resource):

    parse = reqparse.RequestParser()
    parse.add_argument('dev_id', type=str)

    def post(self):

        print("ENTERED gsScreen post")

        params = gsScreen.parse.parse_args()

        cont_file = request.files['files']
        dev_id = params['dev_id']

        print(params)

        # unique value settings.
        nowStamp = int(time.time())

        if cont_file:

            # DB 저장 필드
            shot_nm = str(nowStamp)+cont_file.filename
            cont_url = shot_url + shot_nm
            cont_thu_url = shot_url_thumb + shot_nm

            # 파일 업로드 디렉토리 세팅
            cont_path = shot_file
            cont_thu_path = shot_file_thumb

            # Inert 가 아니라 UPDATE

            shot_obj = [dict(r) for r in DeviceShotModel.find_by_id(dev_id)]

            print(shot_obj)

            for r in shot_obj:
                shot_no = r["shot_no"]

            params = shot_nm, cont_url, cont_thu_url, shot_no

            try:

                if not FileUtils.save_file(cont_file, cont_path, shot_nm):
                    raise Exception('not save image %s' % cont_path + shot_nm)

                # img = cv2.imread(cont_path +"_"+ shot_nm, cv2.IMREAD_COLOR)
                # image = cv2.resize(img, None, fx=0.3, fy=0.3, interpolation=cv2.INTER_AREA)
                # cv2.imwrite(cont_thu_path + shot_nm, image)

                # DB 저장
                result = DeviceShotModel.update_by_id(params)
                print(result)
                print("Screenshot SUCCESS")

                # shot_obj.save_to_db()

            except Exception as e:

                logging.fatal(e, exc_info=True)
                print("Screenshot FAIL")

                return {'resultCode': '100', "resultString": "Screen Shot 파일 업로드에 실패하였습니다."}, 500
        else:
            print("파일이 존재하지 않습니다.")

        return {'resultCode': '0', "resultString": "Screen Shot 파일이 저장 되었습니다"}, 200


# mysql> desc tbl_device_log;
# +-------------+-------------+------+-----+-------------------+-------------------+
# | Field       | Type        | Null | Key | Default           | Extra             |
# +-------------+-------------+------+-----+-------------------+-------------------+
# | log_no      | int         | NO   | PRI | NULL              | auto_increment    |
# | dev_id      | varchar(45) | NO   | PRI | NULL              |                   |
# | log_nm      | varchar(45) | YES  |     | NULL              |                   |
# | log_url     | varchar(45) | YES  |     | NULL              |                   |
# | log_thu_url | varchar(45) | YES  |     | NULL              |                   |
# | is_view     | varchar(1)  | NO   |     | Y                 |                   |
# | upload_yn   | varchar(1)  | NO   |     | N                 |                   |
# | create_dt   | datetime    | YES  |     | CURRENT_TIMESTAMP | DEFAULT_GENERATED |
# | modify_dt   | datetime    | YES  |     | CURRENT_TIMESTAMP | DEFAULT_GENERATED |
# +-------------+-------------+------+-----+-------------------+-------------------+

# 장치별 로그 저장
class gsLog(Resource):

    parse = reqparse.RequestParser()
    parse.add_argument('dev_id', type=str)

    def post(self):

        params = gsScreen.parse.parse_args()

        cont_file = request.files['files']
        dev_id = params['dev_id']

        # unique value settings.
        nowStamp = int(time.time())

        if cont_file:

            # DB 저장 필드
            log_nm = str(nowStamp)+"_"+cont_file.filename
            cont_url = log_url + log_nm
            # cont_thu_url = shot_url_thumb + log_nm
            cont_thu_url = ""


            # 파일 업로드 디렉토리 세팅
            cont_path = log_file
            cont_thu_path = log_file

            # Inert 가 아니라 UPDATE

            shot_obj = [dict(r) for r in DeviceLogModel.find_by_id(dev_id)]

            print(shot_obj)

            for r in shot_obj:
                log_no = r["log_no"]

            params = log_nm, cont_url, cont_thu_url, log_no

            try:

                if not FileUtils.save_file(cont_file, cont_path, log_nm):
                    raise Exception('not save image %s' % cont_path + log_nm)

                # DB 저장
                result = DeviceLogModel.update_by_id(params)
                print(result)
                print("Logfile SUCCESS")

                # shot_obj.save_to_db()

            except Exception as e:

                logging.fatal(e, exc_info=True)
                print("Logfile FAIL")

                return {'resultCode': '100', "resultString": "로그파일 업로드에 실패하였습니다."}, 500
        else:
            print("파일이 존재하지 않습니다.")

        return {'resultCode': '0', "resultString": "로그 파일이 저장 되었습니다"}, 200

# 화면디자인 캡쳐저장
class gsCapture(Resource):

    parse = reqparse.RequestParser()
    parse.add_argument('capture', type=str)

    def post(self):

        params = gsCapture.parse.parse_args()

        # cont_file = request.files['capture']
        cont_file_txt = params['capture']

        # unique value settings.
        nowStamp = int(time.time())

        if cont_file_txt:
            # String 으로 받은 파일 내용을 binary file 로 저장. 

            # 파일명
            capture_nm = current_user.user_id+"_"+str(nowStamp)+".png"

            cont_file = log_file + capture_nm
            cont_url = log_url + capture_nm

            print(cont_file)
            print(cont_url)


            try:
                # 특정 위치에 파일 write
                f = open(cont_file, 'wb')
                f.write(base64.b64decode(cont_file_txt))
                f.close()

                # file 생성 이후에 DB 저장은 cont_url 로 저장



            except Exception as e:

                logging.fatal(e, exc_info=True)
                print("Capture file  FAIL")

                return {'resultCode': '100', "resultString": "Capture 업로드에 실패하였습니다."}, 500

        else:
            print("파일이 존재하지 않습니다.")
            return {'resultCode': '100', "resultString": "Capture 업로드에 실패하였습니다."}, 500

        return {'resultCode': '0', "resultString": "Capture 파일이 저장 되었습니다", "cont_url":cont_url}, 200


# 화면디자인 캡쳐저장
class gsAppVersion(Resource):
    # GSTECH App Version check. Without any parameters just return version number
    def get(self):

        appObj = AppModel.get_final_app()

        if(appObj):

            return {'resultCode': '0', "app_version":appObj.app_version, "app_url":appObj.app_url }, 200
        else:
            print("등록된 앱이 존재하지 않습니다.")
            return {'resultCode': '100', "resultString": "등록된 앱이 존재하지 않습니다."}, 200
