from flask_jwt_extended import jwt_required
from flask_restful import Resource, reqparse
from utils.jsonutil import AlchemyEncoder as jsonEncoder
import json
from models.code import CodeModel


# 공통(상세조회/등록/수정/삭제)
class Code(Resource):

    parse = reqparse.RequestParser()

    def get(self):
        params = Code.parse.parse_args()

        return {'resultCode': '0', "resultString": "SUCCESS"}, 200

    def post(self):

        return {'resultCode': '0', "resultString": "SUCCESS"}, 200

    def put(self):
        return {'resultCode': '0', "resultString": "SUCCESS"}, 200

    def delete(self):
        return {'resultCode': '0', "resultString": "SUCCESS"}, 200


# 공통(레벨1, 레벨2) 조회
class CodeSearch(Resource):

    parse = reqparse.RequestParser()

    parse.add_argument('comm_cd', type=str)
    parse.add_argument('comm_level', type=str)

    # 셀렉트 박스 조회
    def get(self):

        params = CodeSearch.parse.parse_args()

        comm_cd = params['comm_cd']
        comm_level = params['comm_level']

        if comm_cd == "1":
            comm_list = json.dumps(CodeModel.get_comm_level1(comm_cd), cls=jsonEncoder)
        else:

            comm_list = json.dumps(CodeModel.get_comm_level2(comm_level), cls=jsonEncoder)

        return {'resultCode': '0', "resultString": "SUCCESS", "resultValue": comm_list}, 200

    # 페이지 조회
    def post(self):

        params = CodeSearch.parse.parse_args()

        return {'resultCode': '0', "resultString": "SUCCESS", "resultValue": []}, 200


class CodeApplySearch(Resource):
    parse = reqparse.RequestParser()

    parse.add_argument('comm_up_cd', type=str)

    def get(self):
        params = CodeApplySearch.parse.parse_args()

        comm_up_cd = params['comm_up_cd']

        apply_list = json.dumps(CodeModel.get_apply_code(comm_up_cd), cls=jsonEncoder)

        # print(apply_list)

        return {'resultCode': '0', "resultString": "SUCCESS", "data": apply_list}, 200
