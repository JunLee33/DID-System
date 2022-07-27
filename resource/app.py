import time

import werkzeug
from flask_jwt_extended import jwt_required
from flask_login import login_required
from flask_restful import Resource, reqparse, request
from config.properties import *
from werkzeug.datastructures import FileStorage

from models.device import DeviceModel
from utils.jsonutil import AlchemyEncoder as jsonEncoder
from utils.fileutil import FileUtils
import json
from models.app import AppModel
from datetime import datetime
import logging


# 지역(조회/등록/수정/삭제)
class App(Resource):
    parse = reqparse.RequestParser()
    parse.add_argument('app_nm',        type=str)
    parse.add_argument('app_tm',        type=str)  # date-time picker 로 날짜시간 모두 올라옴. (arnold)
    parse.add_argument('app_horizon',   type=str)  # 가로형 'Y', 세로형 'N'
    parse.add_argument('app_stat',      type=str)
    parse.add_argument('app_size',      type=str)
    parse.add_argument('app_version',   type=str)
    parse.add_argument('file',          type=werkzeug.datastructures.FileStorage, location='files')

    @login_required
    def post(self):
        params = App.parse.parse_args()

        app_nm = params['app_nm']
        dev_horizon = params['app_horizon']

        rgt_dt =                datetime.now()
        mdfy_dt =               datetime.now()

        app_date = params['app_tm']
        app_date_array = app_date.split(' ')
        app_dsp = app_date_array[0]                 # 날짜만 입력

        app_stat = params['app_stat']
        app_version = params['app_version']
        app_size = params['app_size']
        app_file = None
        app_file_name = ""
        app_url = apk_url
        app_path = apk_file

        try:
            # 파일 , 파일명 추출
            app_file = request.files.get("files")
            app_file_name = app_file.filename
            app_url += app_file_name

        except Exception as e:
            print(e)

        app_obj = AppModel(app_nm, app_file_name, app_url, app_date, app_dsp, app_stat, rgt_dt, mdfy_dt, app_size, app_version)

        try:
            if not FileUtils.save_file(app_file, app_path, app_file_name):
                raise Exception('not save device %s' %app_path + app_file_name)
            # DB 저장
            app_obj.save_to_db()


        except Exception as e:
            logging.fatal(e, exc_info=True)
            return {'resultCode': '100', "resultString": "FAIL"}, 500

        return {'resultCode': '0', "resultString": "앱 업로드가 완료되었습니다."}, 200


class AppSearch(Resource):
    parse = reqparse.RequestParser()

    parse.add_argument('start', type=int)
    parse.add_argument('length', type=int)

    def post(self):
        res_data = {}

        print("포스트로 들어왔습니다.")

        params = AppSearch.parse.parse_args()
        start = params['start']
        length = params['length']
        print(params)

        # 사용자 Total Count
        
        tot_list = [dict(r) for r in AppModel.get_row_count()]

        res_data['recordsTotal'] = tot_list[0]['tot_cnt']
        res_data['recordsFiltered'] = tot_list[0]['tot_cnt']

        ###################################################################

        # 페이징 데이터 조회 처리
        res_data['data'] = [dict(r) for r in AppModel.get_app_list(start,length)]

        # 응답 결과
        res_data['resultCode'] = "0"
        res_data['resultString'] = "SUCCESS"


        return res_data, 200