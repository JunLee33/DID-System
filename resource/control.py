from sqlalchemy.sql.expression import insert
import werkzeug
from flask_jwt_extended import jwt_required
from flask_restful import Resource, reqparse, request
from config.properties import *
from models.control import ControlModel, ControlDetailModel, ContContentsModel
from models.contents import ContentsModel, SubtitleModel, ContSubtitleModel
from models.gsmodel import GsModel
# from models.statistics_01 import Statistics01Model   0824 code delete
from werkzeug.datastructures import FileStorage
from utils.jsonutil import AlchemyEncoder as jsonEncoder
from utils.fileutil import FileUtils
from flask_login import current_user
from datetime import date, datetime
import json
import logging
import random
import string


# 컨트롤 정보 (조회/등록/수정/삭제)
class Control(Resource):
    parse = reqparse.RequestParser()

    # Control 기본정보 입력을 위한 필드
    parse.add_argument('control_name',      type=str)
    parse.add_argument('control_desc',      type=str)
    parse.add_argument('control_url',       type=str)
    parse.add_argument('screen_id',         type=str)

    # Control Detail 정보 입력을 위한 필드

    parse.add_argument('control',       type=str, action='append')
    parse.add_argument('rect_X',        type=str, action='append')
    parse.add_argument('rect_Y',        type=str, action='append')
    parse.add_argument('rect_W',        type=str, action='append')
    parse.add_argument('rect_H',        type=str, action='append')
    parse.add_argument('rect_idx',      type=str, action='append')
    
    # 화면디자인 상세 조회
    def get(self):

        print("ENTERED GET Control")

        

        cont_id = request.args.get("cont_id")
        user_id = current_user.user_id

        # ControlModel.get_control_all_list_byID(cont_id)
        

        # print(control_list)


# +--------------+-----------+-----------+-----------+-----------+----------------+------------+---------+-------------+--------------+---------------+
# | control_type | control_x | control_y | control_w | control_h | contcon_effect | contcon_tm | cont_id | cont_nm     | screen_width | screen_height |
# +--------------+-----------+-----------+-----------+-----------+----------------+------------+---------+-------------+--------------+---------------+
# | M            |         0 |         0 |      1060 |      1080 | all            |         50 |      15 | ???-fred    | 1920         | 1080          |
# | M            |         0 |         0 |      1060 |      1080 | all            |         17 |      14 |  ????-2     | 1920         | 1080          |
# | M            |         0 |         0 |      1060 |      1080 | all            |         50 |      11 | ???-NEW     | 1920         | 1080          |
# | I            |      1060 |         0 |       860 |      1080 | all            |         15 |      16 | ????-???    | 1920         | 1080          |
# | I            |      1060 |         0 |       860 |      1080 | all            |         15 |      13 | COW-2       | 1920         | 1080          |
# | I            |      1060 |         0 |       860 |      1080 | all            |         15 |       6 | GSTech-LOGO | 1920         | 1080          |
# +--------------+-----------+-----------+-----------+-----------+----------------+------------+---------+-------------+--------------+---------------+


        result_string = ControlModel.get_control_all_list_byID(cont_id, user_id)

        # 0823 screen_id 관련 수정 JUN
        final_list = [{
            'control_type': row[0],
            'control_x': row[1],
            'control_y': row[2],
            'control_w': row[3],
            'control_h': row[4],
            'contcon_effect': row[5],
            'contcon_tm': row[6],
            'cont_id': row[7],
            'cont_nm': row[8],
            'screen_id': row[9],
            'cont_url': row[10],
            'cont_tp' : row[11],
            'cont_thu_url' : row[12],
            'control_idx': row[13]
        } for row in result_string]

        user_list = json.dumps(final_list, cls=jsonEncoder)

        ret_value = {
                     "resultCode": "0",
                     "resultString": "SUCCESS",
                     "data": user_list
        }

        return ret_value, 200

    # NULL 값 처리를 위한 함수
    def is_empty_string(value):
        return str(value) == ''

    # 화면디자인 정보 등록
    def post(self):
        params = Control.parse.parse_args()
        print("ENTERED Control POST")

        # print(params)

        control_name =          params['control_name']
        control_desc =          params['control_desc']
        control_url =           params['control_url']
        screen_id =             params['screen_id']
        control =               params['control']
        rect_X =                params['rect_X']
        rect_Y =                params['rect_Y']
        rect_W =                params['rect_W']
        rect_H =                params['rect_H']
        user_id =               current_user.user_id
        rect_idx =              params['rect_idx']
        rgt_dt =                datetime.now()
        mdfy_dt =               datetime.now()

        # control 대표 아이디 생성 & 저장
        control_obj = ControlModel(control_name, control_desc, control_url, user_id, screen_id, rgt_dt, mdfy_dt)
        control_obj.save_to_db()

        # 저장된 control_id Obtain
        control_id = control_obj.control_id

        resultString = []

        if(control != None):

            control_detail_string = ""
            for idx in range(len(control)):

                # 콘텐츠타입( M: 동영상, I: 이미지, T:자막, W: WEB, L:Live, G:Group)
                # print(idx)

                if (Control.is_empty_string(rect_W[idx]) == False):
                    # print("NOW PROCESSING IDEX ["+str(idx)+"] control ID ["+control[idx]+"]")

                    if(control[idx][0] == 'm'):
                        control_type = 'M'
                    elif(control[idx][0] == 'i'):
                        control_type = 'I'
                    elif(control[idx][0] == 't'):
                        control_type = 'T'
                    elif(control[idx][0] == 'w'):
                        control_type = 'W'
                    elif(control[idx][0] == 'l'):
                        control_type = 'L'
                    elif(control[idx][0] == 'g'):
                        control_type = 'G'
                    
                    # Z-order 관련수정!! 0823
                    # controlDetail_obj = ControlDetailModel(control_type, rect_X[idx], rect_Y[idx], rect_W[idx], rect_H[idx], (idx+1), control_id, rect_idx[idx], rgt_dt, mdfy_dt)
                    controlDetail_obj = ControlDetailModel(control_type, rect_X[idx], rect_Y[idx], rect_W[idx], rect_H[idx], (int(rect_idx[idx])/2), control_id, rect_idx[idx], rgt_dt, mdfy_dt)
                    

                    try:
                        # DB 저장
                        controlDetail_obj.save_to_db()

                        control_detail_string = control[idx]+":"+ str(controlDetail_obj.control_detail_id)
                        resultString.append(control_detail_string)

                    except Exception as e:

                        controlDetail_obj.session_rollback()
                        logging.fatal(e, exc_info=True)
                        return {'resultCode': '100', "resultString": "FAIL"}, 500
            # print(resultString)
            return {'resultCode': '0', "resultString": control_name + " 콘트롤 / 콘트롤 세부정보가 저장 되었습니다.", "cotrol_id": str(control_id), "detail_id_list":resultString}, 200
        else:
            return {'resultCode': '0', "resultString": " Control 세부 정보가 존재하지 않습니다."}, 200

    # 화면디자인 정보 등록
    def put(self, control_id):
        params = Control.parse.parse_args()
        print("ENTERED Control UPDATE")
        result_string = ControlModel.delete_control_detail_list_byID(control_id)

        # print(params)

        control_name =          params['control_name']
        control_desc =          params['control_desc']
        control_url =           params['control_url']
        screen_id =             params['screen_id']
        control =               params['control']
        rect_X =                params['rect_X']
        rect_Y =                params['rect_Y']
        rect_W =                params['rect_W']
        rect_H =                params['rect_H']
        user_id =               current_user.user_id
        rect_idx =              params['rect_idx']
        rgt_dt =                datetime.now()
        mdfy_dt =               datetime.now()

        # control 대표 아이디 생성 & 저장

        ControlModel.update_control_rgt_byID(control_id, control_url, screen_id, mdfy_dt)
        ControlModel.update_schedule_date(control_id)

        # 저장된 control_id Obtain
        resultString = []
        if(control != None):

            control_detail_string = ""
            for idx in range(len(control)):

                # 콘텐츠타입( M: 동영상, I: 이미지, T:자막, W: WEB, L:Live, G:Group)
                # rect2 ~ 7번에 강제 할당 함. (추가시 추가 될 예정)
                # print(idx)

                if (Control.is_empty_string(rect_W[idx]) == False):
                    # print("NOW PROCESSING IDEX ["+str(idx)+"] control ID ["+control[idx]+"]")

                    if(control[idx][0] == 'm'):
                        control_type = 'M'
                    elif(control[idx][0] == 'i'):
                        control_type = 'I'
                    elif(control[idx][0] == 't'):
                        control_type = 'T'
                    elif(control[idx][0] == 'w'):
                        control_type = 'W'
                    elif(control[idx][0] == 'l'):
                        control_type = 'L'
                    elif(control[idx][0] == 'g'):
                        control_type = 'G'

                    controlDetail_obj = ControlDetailModel(control_type, rect_X[idx], rect_Y[idx], rect_W[idx], rect_H[idx], (idx+1), control_id, rect_idx[idx], rgt_dt, mdfy_dt)

                    try:
                        # DB 저장
                        controlDetail_obj.save_to_db()

                        control_detail_string = control[idx]+":"+ str(controlDetail_obj.control_detail_id)
                        resultString.append(control_detail_string)

                    except Exception as e:

                        controlDetail_obj.session_rollback()
                        logging.fatal(e, exc_info=True)
                        return {'resultCode': '100', "resultString": "FAIL"}, 500
            # print(resultString)
            return {'resultCode': '0', "resultString": control_name + " 화면디자인 세부정보가 수정 되었습니다.", "cotrol_id": str(control_id), "detail_id_list":resultString}, 200
        else:
            return {'resultCode': '0', "resultString": " Control 세부 정보가 존재하지 않습니다."}, 200


    def delete(self, control_id):

        print("ENTERED DELETE Control")

        # control_id = request.args.get("control_id")
        # print(control_id)
        organ_control_Obj = [dict(r) for r in ControlModel.find_by_control_id(control_id)]

        

        for idx in organ_control_Obj:                  
            # print(idx['cnt'])
            print(str(idx))


        if(idx['cnt'] != 0) :
            # print("배포내역 존재!!!!!")
            result_string = 100
        else :
            # print("컨트롤 삭제!!!!!")
            result_string = ControlModel.delete_control_all_list_byID(control_id)

        # delete whole related data

        return {'resultCode': '0', "resultString": result_string}, 200

# control 정보 (조회/등록/수정/삭제)
class ControlSearch(Resource):
    parse = reqparse.RequestParser()

    def get(self):

        # Parameter 없이 조회시 전체 조회

        res_data = {}

        print("ENTERED GET ControlSearch")

        cont_nm = request.args.get("cont_nm")

        user_id = current_user.user_id

        if current_user.is_authenticated():
            guser = current_user.user_id
        
        # organ_nm, user_id, start, length

        # control_nm = ""
        start    = 1 
        length   = 0

        # 편성 Total Count
        param = (cont_nm, user_id)
        tot_list = [dict(r) for r in ControlModel.get_control_all_cnt(param)]

        res_data['recordsTotal'] = tot_list[0]['tot_cnt']
        res_data['recordsFiltered'] = tot_list[0]['tot_cnt']

        ###################################################################

        # 편성 전체 데이터 조회 처리
        # organ_nm, user_id, start, length = params
        param = (cont_nm, user_id, start, length)
        res_data['data'] = [dict(r) for r in ControlModel.get_control_all_list(param)]

        # 응답 결과
        res_data['resultCode'] = "0"
        res_data['resultString'] = "SUCCESS"

        # print(res_data)

        return res_data, 200


# 컨트롤 정보 (조회/등록/수정/삭제)
class ContContents(Resource):
    parse = reqparse.RequestParser()

    # Control 기본정보 입력을 위한 필드
    parse.add_argument('contID',      type=str)

    # Control Detail 정보 입력을 위한 필드
    
    parse.add_argument('controlName',       type=str, action='append')
    parse.add_argument('playTime',          type=str, action='append')
    parse.add_argument('playEffect',        type=str, action='append')
    parse.add_argument('cont_id',           type=str, action='append')
    parse.add_argument('cont_nm',           type=str, action='append')
    parse.add_argument('cont_med_tm',       type=str, action='append')
    
    # 편성정보 상세 조회
    def get(self, dev_id):

        return {'resultCode': '0', "resultString": "SUCCESS"}, 200

    def is_empty_string(value):
        return str(value) == ''

    
    # 화면디자인 정보 등록
    def post(self):

        params = ContContents.parse.parse_args()
        print("ENTERED ContContents POST")

        # print(params)

        contID =            params['contID']
        concontrolNametID = params['controlName']
        playTime =          params['playTime']
        playEffect =        params['playEffect']
        cont_id =           params['cont_id']
        cont_nm =           params['cont_nm']
        
        user_id =           current_user.user_id
        rgt_dt =            datetime.now()
        mdfy_dt =           datetime.now()

        # contID 이용한 각 control_detail ID mapping.
        contIdList = contID
        # print("contID LIST .. " + contIdList)

        list_string = contIdList.split(',')
        # print(list_string[0])
        # print(len(list_string))
        
        cont_dic = {}
        # ID settings
        for member in list_string:

            # print(member)
            memberArray = member.split(':')
            cont_dic[memberArray[0]] = memberArray[1]

        # print(cont_dic)
            
        
        resultString = []

        if(concontrolNametID != None):
            ordering = 1
            ex_id = ""
            for idx in range(len(concontrolNametID)):
                # print(idx)

                if(concontrolNametID[idx][0] == 'm'):
                    control_id = cont_dic[concontrolNametID[idx]]
                elif(concontrolNametID[idx][0] == 'i'):
                    control_id = cont_dic[concontrolNametID[idx]]
                elif(concontrolNametID[idx][0] == 't'):
                    # print("자막세부정보 처리를 시작 합니다. --------------------- >")
                    control_id = cont_dic[concontrolNametID[idx]]

                    # 자막 데이타 처리 
                    # tbl_subtitle 정보를 tbl_cont_subtitle 테이블로 Insert 해 줌. 이후 subtitle 은 연동해서 적용
                    # contents 세부 내용 가져오기

                    sut_cont_id = cont_id[idx]
                    # print("SUB CONT ID : ["+sut_cont_id+"]")
                    subt_obj = SubtitleModel.find_by_id_all(sut_cont_id)

                    if(subt_obj):
                        subt_id =               subt_obj.subt_id
                        subt_font_name =        subt_obj.font_name
                        subt_font_size =        subt_obj.font_size
                        subt_font_color =       subt_obj.font_color
                        subt_font_bg_color =    subt_obj.font_bg_color
                        subt_cont_effect =      subt_obj.cont_effect
                        subt_cont_duration =    subt_obj.cont_duration
                        subt_subt_st_dt =       subt_obj.subt_st_dt
                        subt_subt_ed_dt =       subt_obj.subt_ed_dt
                        subt_subt_text1 =       subt_obj.subt_text1
                        subt_subt_text2 =       subt_obj.subt_text2
                        subt_subt_text3 =       subt_obj.subt_text3
                        subt_subt_text4 =       subt_obj.subt_text4
                        subt_subt_text5 =       subt_obj.subt_text5

                        rgt_dt = datetime.now()
                        mdfy_dt = datetime.now()

                        # Insert to cont_subtitle
                        # cont_type, subt_nm, subt_effect, contcon_tm, subt_st_dt, subt_ed_dt, subt_font, subt_font_size, subt_font_color, subt_font_bcolor, 
                        # subt_text1, subt_text2, subt_text3, subt_text4, subt_text5, control_detail_id, subt_id, cont_id, rgt_dt, mdfy_dt

                        if(playEffect[idx] == "all"):
                            # 선택 안했을 경우
                            play_effect = "0704"
                        else :
                            play_effect = playEffect[idx]

                        # control_detail_id 로 control ID 찾아오기

                        # tmp_control_obj = ControlDetailModel.find_by_id(control_id)
                        # tmp_control_id = tmp_control_obj.control_id

                        # print(tmp_control_id)

                        insert_subtitle_obj = ContSubtitleModel('T', cont_nm[idx], play_effect, playTime[idx], subt_subt_st_dt, subt_subt_ed_dt, subt_font_name, str(subt_font_size), subt_font_color,subt_font_bg_color,
                                                            subt_subt_text1, subt_subt_text2, subt_subt_text3, subt_subt_text4, subt_subt_text5, control_id, str(subt_id), cont_id[idx], rgt_dt, mdfy_dt)
                        
                        try: 
                            # DB 저장
                            insert_subtitle_obj.save_to_db()
                            # print("tbl_cont_subtitle 저장완료 !!!!")

                        except Exception as e:

                            contContentObj.session_rollback()
                            logging.fatal(e, exc_info=True)
                            # print("tbl_cont_subtitle 저장실패 !!!!")

                        # print("자막세부정보 처리를 완료 했습니다. --------------------- >")

                elif(concontrolNametID[idx][0] == 'w'):
                    control_id = cont_dic[concontrolNametID[idx]]
                elif(concontrolNametID[idx][0] == 'l'):
                    control_id = cont_dic[concontrolNametID[idx]]
                elif(concontrolNametID[idx][0] == 'g'):
                    control_id = cont_dic[concontrolNametID[idx]]

                if(ex_id == control_id) :
                    ordering += 1
                else :
                    ordering = 0
                # print("CONTROL DETAIL ID : ["+control_id+"]")
                ex_id = control_id
                contContentObj = ContContentsModel(playTime[idx], playEffect[idx], control_id, cont_id[idx], cont_nm[idx], (ordering+1), rgt_dt, mdfy_dt)

                try:
                    # DB 저장
                    contContentObj.save_to_db()

                except Exception as e:

                    contContentObj.session_rollback()
                    logging.fatal(e, exc_info=True)
                    return {'resultCode': '100', "resultString": "FAIL"}, 500

            # print(resultString)
            return {'resultCode': '0', "resultString": " 콘트롤 콘텐츠 정보가 저장 되었습니다."}, 200
        else:
            return {'resultCode': '0', "resultString": " Control 세부 정보가 존재하지 않습니다."}, 200
    
    

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


        # print(params)
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




