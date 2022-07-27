import werkzeug
from flask_jwt_extended import jwt_required
from flask_restful import Resource, reqparse, request
from config.properties import *
from models.organic import OrganicModel, ScheduleModel, ScheduleDepModel, ScheduleOrganModel
# from models.statistics_01 import Statistics01Model   0824 code delete
from werkzeug.datastructures import FileStorage
from utils.jsonutil import AlchemyEncoder as jsonEncoder
from utils.fileutil import FileUtils
from flask_login import current_user
from datetime import datetime
import json
import logging
import random
import string


# 편성정보 (조회/등록/수정/삭제)
class Organic(Resource):
    parse = reqparse.RequestParser()
    
    parse.add_argument('schedule_id',   type=str)

    parse.add_argument('organ_id',      type=str, action='append')
    parse.add_argument('screen_id',     type=str, action='append')
    parse.add_argument('action_code',   type=str, action='append')
    parse.add_argument('organ_nm',      type=str, action='append')
    parse.add_argument('organ_st_dt',   type=str, action='append')
    parse.add_argument('organ_ed_dt',   type=str, action='append')
    parse.add_argument('organ_week1',   type=str, action='append')
    parse.add_argument('organ_week2',   type=str, action='append')
    parse.add_argument('organ_week3',   type=str, action='append')
    parse.add_argument('organ_week4',   type=str, action='append')
    parse.add_argument('organ_week5',   type=str, action='append')
    parse.add_argument('organ_week6',   type=str, action='append')
    parse.add_argument('organ_week7',   type=str, action='append')
    parse.add_argument('organ_img',     type=str, action='append')
    parse.add_argument('control_id',    type=str, action='append')
    


    # 편성정보 상세 조회
    def get(self, dev_id):

        return {'resultCode': '0', "resultString": "SUCCESS"}, 200

    
    # 편성정보 등록
    def post(self):

        params = Organic.parse.parse_args()
        print("ENTERED Organic")


        print(params)

        sch_id =                params['schedule_id']

        organ_id =              params['organ_id']
        screen_id =             params['screen_id']
        action_code =           params['action_code']
        organ_nm =              params['organ_nm']
        organ_st_dt =           params['organ_st_dt']
        organ_ed_dt =           params['organ_ed_dt']
        organ_week1 =           params['organ_week1']
        organ_week2 =           params['organ_week2']
        organ_week3 =           params['organ_week3']
        organ_week4 =           params['organ_week4']
        organ_week5 =           params['organ_week5']
        organ_week6 =           params['organ_week6']
        organ_week7 =           params['organ_week7']
        organ_dep_stat =        '0201'
        control_id =            params['control_id']
        organ_img =             params['organ_img']
        user_id =               current_user.user_id
        rgt_dt =                datetime.now()
        mdfy_dt =               datetime.now()

        
        # Logic 변경 , organic id 존재하면 SKIP 없으면 INSERT. 2021.05.12
        # Delete whole my own contents
        # del_result = OrganicModel.del_all_organ(user_id)
        # print(del_result)

        

        if(control_id != None):
            for idx in range(len(control_id)):

                # 아이디 존재 (기존 편성 SKIP)
                if(organ_id[idx] == 'NEW'):

                    print("NEW ENTRY INPUT"+str(idx))

                    device_obj = OrganicModel(screen_id[idx], organ_nm[idx], organ_st_dt[idx], organ_ed_dt[idx], 
                                            organ_week1[idx], organ_week2[idx], organ_week3[idx], organ_week4[idx], organ_week5[idx], organ_week6[idx], organ_week7[idx],
                                            organ_dep_stat, int(sch_id), int(control_id[idx]), organ_img[idx], user_id, rgt_dt, mdfy_dt)

                    try:
                        # DB 저장
                        device_obj.save_to_db()

                    except Exception as e:

                        device_obj.session_rollback()
                        logging.fatal(e, exc_info=True)
                        return {'resultCode': '100', "resultString": "FAIL"}, 500

                    print(organ_nm[idx])
                
                if(action_code[idx] == 'DEL'):
                    print("DELETE ORGANIC LOGIC OPEND !!!")

                    try:
                        # DB 저장
                        delorgan_obj = OrganicModel.del_by_organ_id(organ_id[idx])

                    except Exception as e:

                        delorgan_obj.session_rollback()
                        logging.fatal(e, exc_info=True)
                        return {'resultCode': '100', "resultString": "DELETE FAIL"}, 500
                        
            return {'resultCode': '0', "resultString": str(organ_nm) + " 편성정보를 "+str(sch_id)+"번 스케쥴로 배포 하였습니다."}, 200
        else:
            return {'resultCode': '0', "resultString": " 편성정보가 삭제 되었습니다."}, 200


    def put(self, dev_id):

        params = Settop.parse.parse_args()

        dev_nm =                params['dev_nm']
        dev_cmt =               params['dev_cmt']
        device_type =           params['device_type']
        device_location =       params['device_location']
        device_longitude =      params['device_longitude']
        device_latitude =       params['device_latitude']
        device_disk_total =     params['device_disk_total']
        device_mem_total =      params['device_mem_total']
        device_ncps =           params['device_ncps']
        device_group_id =       params['device_group_id']


        print(params)
        # print(set_horizon)

        try:
            set_top_obj = DeviceModel.find_by_id(dev_id)

            set_top_obj.dev_nm =            dev_nm
            set_top_obj.dev_cmt =           dev_cmt
            set_top_obj.device_type =       device_type
            set_top_obj.device_location =   device_location
            set_top_obj.device_longitude =  device_longitude
            set_top_obj.device_latitude =   device_latitude
            set_top_obj.device_disk_total = device_disk_total
            set_top_obj.device_mem_total =  device_mem_total
            set_top_obj.device_ncps =       device_ncps
            set_top_obj.device_group_id =   device_group_id
            set_top_obj.mdfy_dt = datetime.now()

            set_top_obj.save_to_db()

        except Exception as e:
            logging.fatal(e, exc_info=True)
            return {'resultCode': '100', "resultString": "셋탑 데이터 수정에 실패하였습니다."}, 500

        return {'resultCode': '0', "resultString": dev_nm + " 데이터가 수정되었습니다."}, 200

    def delete(self):
        return {'resultCode': '0', "resultString": "SUCCESS"}, 200

    @staticmethod
    def random_set_top_id(length=40):

        letters = string.ascii_letters

        set_top_id = ''.join(random.choice(letters) for i in range(length))

        if DeviceModel.find_by_id(set_top_id):
            Settop.random_set_top_id()

        return set_top_id

# 편성정보 (조회/등록/수정/삭제)
class OrganicSearch(Resource):
    parse = reqparse.RequestParser()

    def get(self):

        # Parameter 없이 조회시 전체 조회

        res_data = {}

        print("ENTERED GET OrganicSearch")

        params = OrganicSearch.parse.parse_args()

        user_id = current_user.user_id

        if current_user.is_authenticated():
            guser = current_user.user_id
        
        # organ_nm, user_id, start, length

        organ_nm = ""
        start    = 1 
        length   = 0

        # 편성 Total Count
        param = (organ_nm, user_id)
        tot_list = [dict(r) for r in OrganicModel.get_organic_all_cnt(param)]

        res_data['recordsTotal'] = tot_list[0]['tot_cnt']
        res_data['recordsFiltered'] = tot_list[0]['tot_cnt']

        ###################################################################

        # 편성 전체 데이터 조회 처리
        # organ_nm, user_id, start, length = params
        param = (organ_nm, user_id, start, length)
        res_data['data'] = [dict(r) for r in OrganicModel.get_organic_all_list(param)]

        # 응답 결과
        res_data['resultCode'] = "0"
        res_data['resultString'] = "SUCCESS"

        # print(res_data)

        return res_data, 200

    def post(self):

        print("ENTERED OrganicSearch")


        return "SUCCESS", 200
    
    def delete(self):

        print("ENTERED OrganicSearch")


        return "SUCCESS", 200



# 스케쥴 정보 (등록)
class Schedule(Resource):

    parse = reqparse.RequestParser()

    parse.add_argument('org_id',        type=str, action='append')
    parse.add_argument('dev_id',        type=str, action='append')
    parse.add_argument('start_dt',      type=str)
    parse.add_argument('end_dt',        type=str)

    def post(self):
        # Insert Schedule information
        params = Schedule.parse.parse_args()

        print("ENTERED Schedule")

        print(params)

        org_id =            params['org_id']
        dev_id =            params['dev_id']
        start_dt =          params['start_dt']
        end_dt =            params['end_dt']

        sch_loop_yn = 'Y'
        sch_dep_stat = '0201'
        user_id = current_user.user_id
        group_id = 0
        parking_id = 0
        rgt_dt = datetime.now()
        mdfy_dt = datetime.now()


        # Schedule data save
        schedule_obj = ScheduleModel(start_dt, end_dt, sch_loop_yn, sch_dep_stat, user_id, group_id, parking_id, rgt_dt, mdfy_dt)

        try:
            # DB 저장
            schedule_obj.save_to_db()

        except Exception as e:

            schedule_obj.session_rollback()
            logging.fatal(e, exc_info=True)
            return {'resultCode': '100', "resultString": "FAIL"}, 500

        schedule_id = schedule_obj.sch_id

        print("Schedule ID = ["+str(schedule_id)+"]")


        # 대상단말 저장
        dep_yn = 'N'
        use_yn = 'Y'
        rgt_dt = datetime.now()
        mdfy_dt = datetime.now()

        for idx in range(len(dev_id)):

            device_obj = ScheduleDepModel(schedule_id, dev_id[idx], dep_yn, use_yn, rgt_dt, mdfy_dt)
            try:
                # DB 저장
                device_obj.save_to_db()
            except Exception as e:

                device_obj.session_rollback()
                logging.fatal(e, exc_info=True)
                return {'resultCode': '100', "resultString": "FAIL"}, 500

            print("DEVICE_ID = ["+dev_id[idx]+"]")

        # 편성정보 저장 / 별도 저장 없음. 전체 넣어줌.
        dep_yn = 'N'
        use_yn = 'Y'
        rgt_dt = datetime.now()
        mdfy_dt = datetime.now()

        """
        # organ_list = OrganicModelfind_by_user_id(user_id)
        organ_list = [dict(r) for r in OrganicModel.find_by_user_id_list(user_id)]

        print(organ_list)

        # res_data['recordsTotal'] = tot_list[0]['tot_cnt']
        # res_data['recordsFiltered'] = tot_list[0]['tot_cnt']


        for idx in range(len(organ_list)):
            organ_obj = ScheduleOrganModel(schedule_id, organ_list[idx]['organ_id'], dep_yn, use_yn, rgt_dt, mdfy_dt)
            try:
                # DB 저장
                organ_obj.save_to_db()
            except Exception as e:

                organ_obj.session_rollback()
                logging.fatal(e, exc_info=True)
                return {'resultCode': '100', "resultString": "FAIL"}, 500

            print("ORGAN_ID = ["+str(organ_list[idx]['organ_id'])+"]")
        """

        return {'resultCode': '0', "schedule_id":str(schedule_id), "resultString": "스케쥴아이디 ["+str(schedule_id)+"] 번이 배포 되었습니다."}, 200

    def delete(self, schedule_id):

        print("ENTERED Schedule DELETE")
        print("SCHEDULE ID : ["+str(schedule_id)+"]")

     

        try:

            ScheduleDepModel.update_schedule_use(schedule_id)

        except Exception as e:

            logging.fatal(e, exc_info=True)
            return {'resultCode': '100', "resultString": "FAIL"}, 500

        return {'resultCode': '0', "resultString": str(schedule_id) + "번 스케쥴이 삭제 되었습니다."}, 200



