from flask_jwt_extended import jwt_required
from flask_restful import Resource, reqparse, request
# from werkzeug.datastructures import FileStorage
import werkzeug

from models.contents    import  ContentsModel
from models.device      import  DeviceModel
from models.organic     import  ScheduleModel

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
class Deploy(Resource):
    parse = reqparse.RequestParser()

    parse.add_argument('start', type=int)
    parse.add_argument('length', type=int)

    def get(self):
        
        user_id =    current_user.user_id
       

        deploy_list = [dict(r) for r in ScheduleModel.deploy_by_user_id(user_id,9999,0)] 

        return {
                   "resultCode": '0',
                   "resultString": "SUCCESS",
                   "data" : deploy_list
               },  200

    def post(self):

        params = Deploy.parse.parse_args()

        start = params['start']
        length = params['length']

        user_id =    current_user.user_id

        tot_list = [dict(r) for r in ScheduleModel.deploy_by_user_id_cnt(user_id)]

        deploy_list = [dict(r) for r in ScheduleModel.deploy_by_user_id(user_id, length, start)] 

        return {
                "recordsTotal": tot_list[0]['tot_cnt'],
                "recordsFiltered": tot_list[0]['tot_cnt'],
                "resultCode": '0',
                "resultString": "SUCCESS",
                "data" : deploy_list
               },  200



