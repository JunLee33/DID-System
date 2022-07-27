from flask_jwt_extended import jwt_required
from flask_restful import Resource, reqparse, request
# from werkzeug.datastructures import FileStorage
import werkzeug

from models.contents    import  ContentsModel
from models.device      import  DeviceModel
from models.organic     import  ScheduleModel
from models.user     import  UserModel

# from models.layer_dtl import LayerDtlModel
from utils.jsonutil import AlchemyEncoder as jsonEncoder
from config.properties import *
from utils.fileutil import FileUtils
from datetime import datetime
from flask_login import current_user
import json
import logging
import time


# 콘텐츠 메인 리스트 조회
class Dashboard(Resource):
    parse = reqparse.RequestParser()

    def get(self):
        
        user_id =               current_user.user_id
        user_disk =             current_user.user_disk
        user_settop =           current_user.user_settop
        now_user =              current_user.now_user
        now_disk =              current_user.now_disk
        now_settop =            current_user.now_settop
        user_reg_user_cnt =     current_user.user_reg_user_cnt
        create_user_id  =       current_user.create_user_id
        sum_user_settop = 0

        # sum_now_settop = str([dict(r) for r in UserModel.get_sum_now_settop(user_id)][0]['sum_now_settop'])

        user_detail = str(user_disk)+","+str(user_settop)+","+str(user_reg_user_cnt)+","+str(create_user_id)
        now_user_detail = str(now_disk)+","+str(now_settop)+","+str(now_user)

        contents_list = [dict(r) for r in ContentsModel.get_count_list_by_user_id(user_id)]
        
        settopStatus_list = [dict(r) for r in DeviceModel.get_device_list_user_id(user_id)]

        schedule_list = [dict(r) for r in ScheduleModel.find_by_user_id(user_id)] 
            
        return {
                   "resultCode": '0',
                   "resultString": "SUCCESS",
                   "userDetail": user_detail,
                   "nowuserDetail": now_user_detail,
                   "contents": contents_list,
                   "settopStatus" : settopStatus_list,
                   "scheduleList" : schedule_list,
                   "sum_now_settop" : now_settop
                #    "sum_now_settop" : sum_now_settop if current_user.user_gr == "0102" else now_settop
               }, 200


