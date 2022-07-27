from models.user import UserModel
from flask import request, render_template, redirect, url_for
from flask_restful import Resource, reqparse
from utils.jsonutil import AlchemyEncoder as jsonEncoder
from flask_login import login_user, logout_user, current_user, login_required
from resource.log import LogMessage
# from resource.group import GroupModel
from flask import g
import json
import logging
from datetime import datetime


# 사용자 로그인
class UserLogin(Resource):

    print("LOGIN FUNCTION ENTERRED !!!!! ")
    parse = reqparse.RequestParser()

    

    parse.add_argument('user_id', type=str)
    parse.add_argument('user_pwd', type=str)
    parse.add_argument('next', type=str)

    def post(self):

        print("LOGIN FUNCTION post ENTERRED !!!!! ")

        params = UserLogin.parse.parse_args()

        user_id = params['user_id']
        user_pwd = params['user_pwd']
        next_url = params['next']

        # print(next_url + " : " + str(request.arg.get("next")))

        user_obj = UserModel.find_by_id(user_id)
        print(user_id)
        print(user_pwd)

        # if(user_id == 'admin'):
        #     #create user password
            # print("admin phase !!!------------")
            # user_obj.set_password('admin123!@#')
        #     user_obj.set_password('master') <== ds.fvn.co.kr 

        if user_obj is None:

            # default user applying
            # System init function for the first time executed !!
            if(user_id == 'admin' and user_pwd == 'gstechWkd!'):
                print("First time entering and admin should setting mode !!")

                #                   user_id,   user_pwd,    user_nm, user_gr, user_dept_nm, create_user_id, user_disk, user_settop, user_reg_user_cnt, rgt_dt, mdfy_dt
                user_obj = UserModel(user_id, 'admin123!@#', '어드민','0101','ADMIN GROUP','admin', 1000, 100, 1000, datetime.now(), datetime.now())

                user_obj.save_to_db()

                if(user_obj):
                    return {'resultCode': '100', "resultString": "INIT SYSTEM SUCCESS !!"}, 200  # 사용자 등록 성공
            else :
                print("Login Failed")
                return {'resultCode': '100', "resultString": "등록된 사용자가 아닙니다."}, 200  # 인증실패
            
            return {'resultCode': '100', "resultString": "등록된 사용자가 아닙니다."}, 200  # 인증실패
        else:
            print(user_obj.user_yn)
            if user_obj.user_yn == "N":
                return {'resultCode': '100', "resultString": "현재 미사용으로 등록된 사용자입니다. 상위 관리자에게 문의해주세요."}, 200  
            # 패스워드 비교
            # print(user_pwd)
            if user_obj.check_password(user_pwd):

                # Arnold added. 최초생성 패스워드와 아이디가 동일하면 패스워드 수정하게 만든다. 무조건 !!!!
                if user_obj.check_id_pwd(user_id):
                    return {'resultCode': '101', "resultString": "패스워드와 아이디가 같습니다. 패스워드를 수정해주십시오."}, 200  # 인증실패

                conn_time = [dict(r) for r in user_obj.check_time()]

                # 유저가 휴면 계정 해지 후 혹은 계정 작성후 첫 접속시
                if conn_time[0]['DiffDo'] == None:
                    user_obj.user_conn_date = datetime.now()

                # 유저 접속후 90일 이상 경과한경우
                elif conn_time[0]['DiffDo'] >= 90:
                    user_obj.user_dor_acc = "Y"
                    user_obj.user_conn_date = datetime.now()
                    user_obj.save_to_db()
                    return {'resultCode': '100', "resultString": "해당 계정은 휴면 계정입니다. 관리자 문의를 통해 휴면을 해제해 주십시오."}, 200  # 인증실패

                if conn_time[0]['DiffPw'] >= 90:
                    return {'resultCode': '101', "resultString": "패스워드 수정후 90일 이상 경과하였습니다 패스워드를 수정해주십시오."}, 200  # 인증실패

                user_obj.user_auth = True
                user_obj.user_conn_date = datetime.now()
                login_user(user_obj, remember=True)

                # 현재 로그인 사용자 업데이트
                user_obj.save_to_db()

                # 정상 로그인 로그 남기기
                LogMessage.set_message("msg_login", str(datetime.now().strftime('%Y-%m-%d %H:%M:%S')), "0501")

            else:
                # 로그인 실패 로그 남기기
                LogMessage.set_login_fail_message("msg_login_fail",
                                                 str(datetime.now().strftime('%Y-%m-%d %H:%M:%S')),
                                                 user_id, "0501")
                return {'resultCode': '100', "resultString": "사용자 인증 실패"}, 200  # 인증실패

        # 슈퍼어드민 또는 어드민 또는 설치팀인 경우
        # if user_obj.user_gr == "0101" or user_obj.user_gr == "0102" or user_obj.user_gr == "0106":
        #     next_url = "/dashboard"
        # elif user_obj.user_gr == "0103":
        #     # 사용자 로그인시에 그룹장일 경우 사용자의 user 정보에 group_no 를 세팅 해 줍니다. 
        #     group_no = GroupModel.find_group_no_by_id(user_obj.user_id)

        #     if(group_no != None):
        #         # group_seq update every login Time !!!!
        #         user_obj.group_seq = group_no.group_seq
        #         user_obj.save_to_db()
        #         # print("User group_no updated !!!")
        #         next_url = "/dashboard"
        #     else:
        #         print("아직 그룹이 만들어 지지 않았습니다.")
        #         next_url = "/group"
            
        if user_obj.user_gr == "0101":
            next_url = "/user"
        else:
            next_url = "/dashboard"

        return {'resultCode': '0', "resultString": "SUCCESS", "next_url": next_url}, 200


# 사용자 로그아웃 처리
class UserLogout(Resource):

    @login_required
    def post(self):

        user = current_user

        user_obj = UserModel.find_by_id(user.user_id)
        user_obj.user_auth = False
        user_obj.save_to_db()

        # print("로그아웃 USER >> " + user.user_id + " : " + user.user_gr + ":" + str(user.user_auth))

        # 로그 남기기
        LogMessage.set_message("msg_logout", str(datetime.now().strftime('%Y-%m-%d %H:%M:%S')), "0501")

        logout_user()
        return {'resultCode': '0', "resultString": "로그아웃 되었습니다."}, 200


# 사용자 비밀번호 찾기
class UserPwFind(Resource):
    parse = reqparse.RequestParser()

    parse.add_argument('user_id', type=str)
    parse.add_argument('user_nm', type=str)
    parse.add_argument('user_dept_nm', type=str)
    parse.add_argument('user_new_pwd', type=str)

    def post(self):
        # Searching Password with ID, name, department
        print("***PW FIND POST****")

        params = User.parse.parse_args()

        user_id = params['user_id']
        user_nm = params['user_nm']
        user_dept_nm = params['user_dept_nm']             
        found_password = UserModel.get_password(user_id, user_nm, user_dept_nm)
        final_list = [{
            'user_pwd': row[0],

        } for row in found_password]

        found_password = json.dumps(final_list, cls=jsonEncoder)
        print(type(final_list[0]))
        print(final_list[0]['user_pwd'])

    def put(self, user_id_verify):
        params = UserPwFind.parse.parse_args()
        user_pwd = params['user_new_pwd']

        try:
            user_obj = UserModel.find_by_id(user_id_verify)
            user_obj.set_password(user_pwd)
            user_obj.user_pwd_change_dt = datetime.now()
            user_obj.mdfy_dt = datetime.now()
            user_obj.save_to_db()
        except Exception as e:
            logging.fatal(e, exc_info=True)
            return {'resultCode': '100', "resultString": "FAIL"}, 500

        return {'resultCode': '0', "resultString": user_id_verify + " 사용자 정보가 수정 되었습니다."}, 200



# 사용자 (조회/등록/수정/삭제)
class User(Resource):

    parse = reqparse.RequestParser()

    parse.add_argument('user_id', type=str)
    parse.add_argument('user_pwd', type=str)
    parse.add_argument('user_nm', type=str)
    parse.add_argument('user_gr', type=str)
    parse.add_argument('user_dept_nm', type=str)
    parse.add_argument('user_ip', type=str)
    parse.add_argument('user_mac', type=str)
    parse.add_argument('iParking_seq', type=str)
    parse.add_argument('create_user_id', type=str)          
    parse.add_argument('user_disk', type=str)               
    parse.add_argument('user_settop', type=str)             
    parse.add_argument('user_count', type=str)
    parse.add_argument('userM', type=str)                
    parse.add_argument('userI', type=str)
    parse.add_argument('userT', type=str)
    parse.add_argument('userW', type=str)
    parse.add_argument('userL', type=str)
    parse.add_argument('userG', type=str)

    

    def get(self):
        # User configuration register !!

        print("USER GET INSERT ENTERED !!!")
        params = User.parse.parse_args()

        userM = params['userM']
        userI = params['userI']
        userT = params['userT']
        userW = params['userW']
        userL = params['userL']
        userG = params['userG']

        user_id = current_user.user_id
        print(user_id)
        print("userM:["+userM+"] userI:["+userI+"] userT:"+userT+"] userW:["+userW+"] userL:["+userL+"] userG:["+userG+"]")

        try:
            userObj = UserModel.find_by_id(user_id)
            print(userObj)

            userObj.user_M = userM
            userObj.user_I = userI
            userObj.user_T = userT
            userObj.user_W = userW
            userObj.user_L = userL
            userObj.user_G = userG
            userObj.mdfy_dt =   datetime.now()
            userObj.save_to_db()

        except Exception as e:

            logging.fatal(e, exc_info=True)
            return {'resultCode': '100', "resultString": "FAIL"}, 500

        return {'resultCode': '0', "resultString": " 사용자 설정정보가 설정 되었습니다."}, 200

    def post(self):
        print("등록 화면으로 들어옴")
        params = User.parse.parse_args()

        user_id = params['user_id']
        user_pwd = params['user_pwd']
        user_nm = params['user_nm']
        user_gr = params['user_gr']
        user_dept_nm = params['user_dept_nm']
        user_disk = params['user_disk']                     
        user_settop = params['user_settop']                 
        user_reg_user_cnt = params['user_count']     
        create_user_id = params['create_user_id']           
        parking_seq_str = params['iParking_seq']
        
        print("얼마나 할당하는가?(user_disk)")
        print(user_disk)

        if(parking_seq_str == 'all' or parking_seq_str == None):
            parking_seq = 0
        else:
            parking_seq = int(parking_seq_str)

        # Admin이 아닌 지역장이 등록 했을 경우는 지역장의 아이디 및 그룹 sequence 를 입력 함 (arnold)
        if(current_user.user_gr == '0103'): #담당자인 경우
            group_seq = int(current_user.group_seq)
            create_user_id = current_user.user_id
        else:
            group_seq = 0 #어드민인 경우
            create_user_id = current_user.user_id

        print("CURRENT USER : ["+current_user.user_id+"]")
        print("CREATE USER : ["+create_user_id+"]")

        user_obj = UserModel.find_by_id(user_id)

        if user_obj:
            return {'resultCode': '100', "resultString": "이미 등록된 아이디 입니다."}, 200

        rgt_dt =    datetime.now()
        mdfy_dt =   datetime.now()

        try:
            # user_id, user_pwd, user_nm, user_gr, user_dept_nm, create_user_id, user_disk, user_settop, user_reg_user_cnt, rgt_dt, mdfy_dt
            user_obj = UserModel(user_id, user_pwd, user_nm, user_gr, user_dept_nm, create_user_id, user_disk, user_settop, user_reg_user_cnt,
                                rgt_dt, mdfy_dt)
            # now_user를 업데이트 하는 구문(6/22 김동수)
            user_obj.update_now_user(current_user.user_id)
            user_obj.save_to_db()

        except Exception as e:

            logging.fatal(e, exc_info=True)
            return {'resultCode': '100', "resultString": "FAIL"}, 500

        return {'resultCode': '0', "resultString": user_nm + " 사용자가 등록 되었습니다."}, 200

    def  put(self, user_id):
        params = User.parse.parse_args()
        user_pwd = params['user_pwd']
        user_nm = params['user_nm']
        user_gr = params['user_gr']
        user_dept_nm = params['user_dept_nm']
        parking_seq_str = params['iParking_seq']
        user_disk = params['user_disk']                     
        user_settop = params['user_settop']                 
        user_reg_user_cnt = params['user_count'] 

        if(parking_seq_str == 'all' or parking_seq_str == None):
            parking_seq = 0
        else:
            parking_seq = int(parking_seq_str)

        # Admin이 아닌 지역장이 등록 했을 경우는 지역장의 아이디 및 그룹 sequence 를 입력 함 (arnold)
        if(current_user.user_gr == '0103'):
            group_seq = int(current_user.group_id)
            create_user_id = current_user.user_id
        else:
            group_seq = 0
            create_user_id = current_user.user_id

        # print(user_pwd)

        try:
            user_obj = UserModel.find_by_id(user_id)
            user_obj.set_password(user_pwd)
            user_obj.user_nm = user_nm
            user_obj.user_gr = user_gr
            user_obj.user_dept_nm = user_dept_nm
            user_obj.parking_seq = parking_seq
            user_obj.group_seq = group_seq
            user_obj.user_disk = user_disk
            user_obj.user_settop = user_settop
            user_obj.user_reg_user_cnt = user_reg_user_cnt
            user_obj.create_user_id = create_user_id
            user_obj.user_pwd_change_dt = datetime.now()
            user_obj.save_to_db()

        except Exception as e:
            logging.fatal(e, exc_info=True)
            return {'resultCode': '100', "resultString": "FAIL"}, 500

        return {'resultCode': '0', "resultString": user_nm + " 사용자 정보가 수정 되었습니다."}, 200

    def  delete(self, user_id):

        try:
            user_obj = UserModel.find_by_id(user_id)
            if user_obj.user_yn == 'Y':
                user_obj.user_yn = 'N'
            else:
                user_obj.user_yn = 'Y'

            user_obj.save_to_db()
        except Exception as e:
            logging.fatal(e, exc_info=True)
            return {'resultCode': '100', "resultString": "사용유무 변경 시 에러가 발생했습니다."}, 500

        return {'resultCode': '0', "resultString": "사용유무가 변경 되었습니다."}, 200


# 사용자 메인 및 검색 조회
class UserSearch(Resource):

    parse = reqparse.RequestParser()

    parse.add_argument('user_id', type=str)
    parse.add_argument('user_pwd', type=str)
    parse.add_argument('user_nm', type=str)
    parse.add_argument('user_gr', type=str)
    parse.add_argument('group_seq', type=str)
    parse.add_argument('start', type=str)
    parse.add_argument('length', type=str)

    def get(self):

        params = UserSearch.parse.parse_args()

        user_gr = params['user_gr'].split(",")
        # user_gr.split에서 tuple을 제대로 인식못해서 잠시 롤백
        # user_list = json.dumps([dict(r) for r in UserModel.get_user_code(user_gr)], default=jsonEncoder)
        try:
            guser = current_user.user_id
            if current_user.is_authenticated():
                guser = current_user.user_id
        except Exception as e:
            return 200

        

        user_list = UserModel.get_user_code(user_gr)
        sum_user_settop = 0
        sum_user_disk = 0

        if current_user.user_gr == "0102":
            sum_user_disk = [dict(r) for r in UserModel.get_sum_user_disk(guser)][0]['sum_disk']
            sum_user_settop = str([dict(r) for r in UserModel.get_sum_user_settop(guser)][0]['sum_settop'])

        final_list = [{
            'user_id': row[0],
            'user_nm': row[1],
            'user_gr_nm': row[2],
        } for row in user_list]

        user_list = json.dumps(final_list, cls=jsonEncoder)
        
        ret_value = {
                     "resultCode": "0",
                     "resultString": "SUCCESS",
                     "resultUserid":  guser,
                     "resultUserGroup": current_user.user_gr,
                     "resultUser_reg_user_cnt": current_user.user_reg_user_cnt,
                     "now_user":current_user.now_user,
                     "now_disk":current_user.now_disk,
                     "user_disk":current_user.user_disk,
                     "now_settop":current_user.now_settop,
                     "user_settop":current_user.user_settop,
                     "sum_user_disk":sum_user_disk,
                     "sum_user_settop":sum_user_settop,
                     "data": user_list
        }

        return ret_value, 200

    def post(self):
        res_data = {}

        params = UserSearch.parse.parse_args()
        user_id = params['user_id']
        user_nm = params['user_nm']
        user_gr = params['user_gr']
        group_seq = params['group_seq']
        start = params['start']
        length = params['length']

        print(params)
        # if(current_user.user_gr == '0103'): #담당자인 경우
        #     group_seq = int(current_user.group_seq)
        #     create_user_id = current_user.user_id
        # else:
        #     group_seq = 0 #어드민인 경우
        #     create_user_id = current_user.user_id
        
        # 사용자 Total Count
        param = (user_id, user_nm, user_gr, group_seq)
        tot_list = [dict(r) for r in UserModel.find_all_user_count(param)]

        res_data['recordsTotal'] = tot_list[0]['tot_cnt']
        res_data['recordsFiltered'] = tot_list[0]['tot_cnt']

        ###################################################################

        # 페이징 데이터 조회 처리
        if(length == None):
            length = "0" 
        param = (user_id, user_nm, user_gr, group_seq, start, length)

        res_data['data'] = [dict(r) for r in UserModel.find_all_user(param)]

        # 응답 결과
        res_data['resultCode'] = "0"
        res_data['resultString'] = "SUCCESS"


        return res_data, 200


class UserLocalSearch(Resource):
    parse = reqparse.RequestParser()

    parse.add_argument('user_id', type=str)
    parse.add_argument('user_nm', type=str)
    parse.add_argument('start', type=int)
    parse.add_argument('length', type=int)

    def get(self):
        user_id = current_user.user_id

        user_list = UserModel.get_config_by_user_id(user_id)

        final_list = [{
            'user_M': row[0],
            'user_I': row[1],
            'user_T': row[2],
            'user_W': row[3],
            'user_L': row[4],
            'user_G': row[5],
        } for row in user_list]

        user_list = json.dumps(final_list, cls=jsonEncoder)

        ret_value = {
                     "resultCode": "0",
                     "resultString": "SUCCESS",
                     "resultUserid":  user_id,
                     "data": user_list
        }
        return ret_value, 200

    def post(self):

        res_data = {}

        params = UserSearch.parse.parse_args()
        user_id = params['user_id']
        user_nm = params['user_nm']
        start = params['start']
        length = params['length']

        # 사용자 Total Count
        param = (user_id, user_nm)
        tot_list = [dict(r) for r in UserModel.find_local_user_cnt(param)]

        res_data['recordsTotal'] = tot_list[0]['tot_cnt']
        res_data['recordsFiltered'] = tot_list[0]['tot_cnt']

        ###################################################################

        # 페이징 데이터 조회 처리
        param = (user_id, user_nm, start, length)
        res_data['data'] = [dict(r) for r in UserModel.find_local_user_all(param)]

        # 응답 결과
        res_data['resultCode'] = "0"
        res_data['resultString'] = "SUCCESS"

        return res_data, 200


class UserDormancy(Resource):
    parse = reqparse.RequestParser()

    # print("Request comes here..")


    def put(self, user_id):
        # print(user_id)
        try:
            user_obj = UserModel.find_by_id(user_id)

            # 휴면 해지 코드 삽입 예정 (ARNOLD UPDATE)
            user_obj.user_dor_acc = 'N'
            user_obj.mdfy_dt = datetime.now()

            user_obj.save_to_db()

        except Exception as e:
            logging.fatal(e, exc_info=True)
            return {'resultCode': '100', "resultString": user_id + " 계정의 휴면 상태 해지에 실패하였습니다."}, 500

        return {'resultCode': '0', "resultString": user_id + " 계정의 휴면 상태가 해제되었습니다."}, 200


class UserPassword(Resource):
    parse = reqparse.RequestParser()
    parse.add_argument('user_pwd', type=str)

    def put(self, user_id):

        params = UserPassword.parse.parse_args()
        user_pwd = params['user_pwd']

        # print("ID:"+user_id+" PWD:"+user_pwd)


        try:
            user_obj = UserModel.find_by_id(user_id)
            user_obj.set_password(user_pwd)
            print("!@#$user_obj")
            print(user_obj)
            user_obj.user_pwd_change_dt = datetime.now()
            user_obj.mdfy_dt = datetime.now()
            print("!@#$user_obj")
            print(user_obj)
            user_obj.save_to_db()

        except Exception as e:
            logging.fatal(e, exc_info=True)
            return {'resultCode': '100', "resultString": user_id + " 계정의 패스워드 변경이 실패하였습니다."}, 500

        return {'resultCode': '0', "resultString": user_id + " 계정의 패스워드 변경이 성공하였습니다."}, 200

class UserDuplicate(Resource):
    parse = reqparse.RequestParser()
    print('들어옴')

    def get(self, user_id):
        user_obj = UserModel.find_by_id(user_id)
        if user_obj:
            return {'result': True}
        else:
            return {'result': False}