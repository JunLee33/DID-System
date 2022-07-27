#-*- coding:utf-8 -*-

from core.db import db
from flask_restful import Api
from flask import Flask, session, render_template, jsonify
from flask_jwt_extended import JWTManager
from config.configuration import Configuration
from dateutil.relativedelta import *
import datetime

from datetime           import timedelta
from apscheduler.schedulers.background import BackgroundScheduler

from flask_login        import LoginManager, login_required

from resource.user      import * #UserLogin, UserLogout
# from resource.auth      import * #Auth, AppAuth       0824 code delete
from resource.signage   import GsSchedule, GsDeviceSchedule, GsDeviceAuth, GsStatistics, GsDeviceStatus, gsScreen, gsLog, gsCapture, gsAppVersion
from resource.code      import Code, CodeSearch, CodeApplySearch
from resource.device    import *
from resource.contents  import ContentsSearch, Contents, Subtitle, ConcatSubtitle
from resource.organic   import Organic, OrganicSearch, Schedule
from resource.control   import Control, ControlSearch, ContContents
from resource.dashboard import Dashboard
from resource.deploy    import Deploy
from resource.app       import AppSearch , App

# Flask Init App
app = Flask(__name__)


# SQLITE and secret Config
app.config.from_object(Configuration)
# app.config["PERMANENT_SESSION_LIFETIME"] = timedelta(minutes=30)
# app.config["REMEMBER_COOKIE_DURATION"] = timedelta(minutes=30)
# app.config['SQLALCHEMY_POOL_RECYCLE'] = <db_wait_timeout> - 1
app.config['SQLALCHEMY_POOL_RECYCLE'] = 499
app.config['SQLALCHEMY_POOL_TIMEOUT'] = 20


# JWT Set
jwt = JWTManager(app)

# APP Set
api = Api(app)

# DataBase Init
db.init_app(app)

# DB Table creation test.
with app.app_context():
    db.create_all()
    # print("NEW DB Tables created (Not exist only created !!)")

# Login
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = "/"
login_manager.needs_refresh_message = (u"Session timedout, please re-login")
login_manager.needs_refresh_message_category = "info"

@app.before_request
def before_request():
    session.permanent = True
    app.permanent_session_lifetime = timedelta(minutes=300)
    app.config["REMEMBER_COOKIE_DURATION"] = timedelta(minutes=300)

@login_manager.user_loader
def user_loader(user_id):
    return UserModel.find_by_id(user_id)


# ######################################################################################################################
# INTRO PAGE and LOGIN API 모음
# ######################################################################################################################
@app.route('/')
def main():
    try:
        if(current_user.user_id != ""):
            return render_template('/did/dashboard.html')
        else:
            return render_template('/did/Login.html')
    except Exception as e:
        return  render_template('/did/Login.html')


api.add_resource(UserLogin,     '/web/login', endpoint='web/login')                                 # CMS 로그인   method:post
api.add_resource(UserLogout,    '/web/logout', endpoint='web/logout')                               # CMS 로그아웃  method:post
api.add_resource(UserPwFind,    '/user/find', endpoint='user/find')                                 # 비밀번호 검증 method:post
api.add_resource(UserPwFind,    '/user/resetPw/<string:user_id_verify>', endpoint='user/resetPw')

# ######################################################################################################################
# DASHBOARD 및 API 모음
# ######################################################################################################################

# 페이지
@app.route('/dashboard')
@login_required
def dashboard_main():

    return render_template('/did/dashboard.html')

# API
api.add_resource(Dashboard, '/dashboard/search', endpoint='dashboard/search')                             # dashboard 초기화면


# ######################################################################################################################
# ORGANIC 및 API 모음
# ######################################################################################################################

# 페이지
@app.route('/organic')
@login_required
def organic_main():

    return render_template('/did/organic.html')

# ######################################################################################################################
# SETTOP
# ######################################################################################################################

# 페이지
@app.route('/settop')
@login_required
def settop_main():
    return render_template('/did/settop.html')


# API
api.add_resource(SettopSearch,          '/settop/search', endpoint='settop/search')                                         
api.add_resource(Settop,                '/settop/detail/search/<string:dev_id>', endpoint='/settop/detail/search')          
api.add_resource(Settop,                '/settop/insert', endpoint="settop/insert")                                     
api.add_resource(Settop,                '/settop/delete/<string:dev_id>', endpoint='/settop/delete')                 # SETTOP DELETE
api.add_resource(Settop,                '/settop/update/<string:dev_id>', endpoint="settop/update")                     
api.add_resource(SettopCommSearch,      '/settop/common/search', endpoint='/settop/common/search')                      
api.add_resource(Settopallcnt,          '/settop/common/graph', endpoint='/settop/common/graph')                        
api.add_resource(SettopSimpleSearch,    '/settop/simple/search', endpoint='/settop/simple/search')                      
api.add_resource(SettopPush,            '/settop/push', endpoint='/settop/push')                                    
api.add_resource(ScreenShotSearch,      '/settop/screenshot', endpoint='/settop/screenshot')                    
api.add_resource(DeviceLogSearch,       '/settop/devicelog', endpoint='/settop/devicelog')                      
api.add_resource(DeviceCurrentCount,    '/settop/current', endpoint='/settop/current')  
api.add_resource(SettopOrgan,           '/settop/organ/<string:dev_id>', endpoint='/settop/organ/<string:dev_id>')              # 장치수정수정
api.add_resource(SettopMulti,           '/settop/multi/insert', endpoint="settop/multi/insert")                                 # 장치멀티등록 
api.add_resource(ExcelDown,             '/settop/download', endpoint="/settop/download")                                          # 장치엑셀백업 

# SETTOP GROUP
api.add_resource(SettopTree, '/device/group/insert', endpoint='/device/group/insert')                   # SETTOP INSERT
api.add_resource(SettopTree, '/device/group/delete/<string:tID>', endpoint='/device/group/delete')      # SETTOP DELETE
api.add_resource(SettopTree, '/device/group', endpoint='/device/group/')                                # SETTOP GET
api.add_resource(DeviceDuplicate, '/settop/duplicate_check/<string:dev_id>', endpoint='settop/DeviceDuplicate')         # 중복체크 처리)



# ######################################################################################################################
# 콘텐츠관리(콘텐츠, 템플릿, 레이어) 및 API 모음
# ######################################################################################################################

# # 페이지
@app.route('/contents')
@login_required
def contents_main():
    return render_template('/did/contents.html')


# # API
api.add_resource(ContentsSearch,    '/contents/search', endpoint='contents/search')                                     # 콘텐츠전체조회
api.add_resource(Subtitle,          '/contents/subtitle', endpoint='contents/subtitle')                                 # subtitle 처리를 위한
api.add_resource(ConcatSubtitle,    '/contents/concatSubtitle', endpoint='contents/concatSubtitle')                     # subtitle 처리를 위한
api.add_resource(Subtitle,          '/contents/subtitle/update/<int:cont_seq>', endpoint='contents/subtitle/update')    # subtitle 처리를 위한
api.add_resource(Contents,          '/contents/insert', endpoint="contents/insert")                                     # 콘텐츠등록
api.add_resource(Contents,          '/contents/update/<int:cont_seq>', endpoint="contents/update")                      # 콘텐츠수정
api.add_resource(Contents,          '/contents/delete/<int:cont_seq>', endpoint="contents/delete")                      # 콘텐츠삭제

# ######################################################################################################################
# SCREEN DESIGN
# ######################################################################################################################
# 페이지
@app.route('/design')
@login_required
def template_main():
    return render_template('/did/design.html')

# # API
api.add_resource(Control,       '/control/insert', endpoint='control/insert')                                       # Control 등록
api.add_resource(ControlSearch, '/control/search', endpoint='/control/search')                                      # Control 조회
api.add_resource(Control,       '/control/update/<int:control_id>', endpoint="control/update")                      # Control 수정
api.add_resource(Control,       '/control/delete/<int:control_id>', endpoint='/control/delete')                     # Control 삭제
api.add_resource(ContContents,  '/control/contents/insert', endpoint='control/contents/insert')                     # ContContents 등록

# ######################################################################################################################
# PREVIEW
# ######################################################################################################################

#preview
@app.route('/preview')
@login_required
def preview_main():
    return render_template('/did/preview.html')

# ######################################################################################################################
# 스케줄관리 및 API 모음
# ######################################################################################################################

@app.route('/schedule')
@login_required
def schedule_main():
    return render_template('/did/schedule.html')


# 편성정보 리스트 조회 및 CRUD

# 조회 / 등록 / 수정 / 삭제
api.add_resource(OrganicSearch, '/schedule/organ/search', endpoint='schedule/organ/search')
api.add_resource(Organic,       '/schedule/organ/insert', endpoint='schedule/organ/insert')
api.add_resource(Organic,       '/schedule/organ/update', endpoint='schedule/organ/update')
api.add_resource(Organic,       '/schedule/organ/delete', endpoint='schedule/organ/delete')
api.add_resource(Schedule,      '/schedule/insert', endpoint='schedule/insert')
api.add_resource(Schedule,      '/schedule/delete/<int:schedule_id>', endpoint='schedule/delete')


# ######################################################################################################################
# 사용자 화면 및 API 모음
# ######################################################################################################################

# 페이지
@app.route('/user')
@login_required
def user_main():
    return render_template('/did/user.html')

#  API
api.add_resource(UserSearch,    '/user/select/search', endpoint='/user/select/search')                  # 사용자 select box 조회
api.add_resource(UserSearch,    '/user/search', endpoint='/user/search')                                # 사용자 리스트 조회
api.add_resource(User,          '/user/insert', endpoint='/user/insert')                                # 사용자 등록
api.add_resource(User,          '/user/update/<string:user_id>', endpoint='user/update')                # 사용자 수정
api.add_resource(User,          '/user/delete/<string:user_id>', endpoint='user/delete')                # 사용자 사용유무 변경 처리)
api.add_resource(UserDormancy, '/user/dormancy/<string:user_id>', endpoint='user/UserDormancy')         # 휴면해제 처리)
api.add_resource(UserPassword, '/user/password/<string:user_id>', endpoint='user/UserPassword')         # 패스워드 수정 처리)
api.add_resource(UserDuplicate, '/user/duplicate_check/<string:user_id>', endpoint='user/UserDuplicate')         # 중복체크 처리)


# ######################################################################################################################
# 공통코드 화면 및 API 모음
# ######################################################################################################################

# 페이지
@app.route('/code')
@login_required
def code_main():
    return render_template('/code/code.html')


# API
api.add_resource(CodeSearch,        '/code/search', endpoint='code/search')
api.add_resource(CodeSearch,        '/code/level/search', endpoint='code/level/search')
api.add_resource(Code,              '/code/detail/search/<string:comm_cd>', endpoint='code/detail/search')
api.add_resource(Code,              '/code/insert', endpoint='code/insert')
api.add_resource(Code,              '/code/update/<string:comm_cd>', endpoint='code/update')
api.add_resource(Code,              '/code/delete/<string:comm_cd>', endpoint='code/delete')
api.add_resource(CodeApplySearch,   '/code/applySearch', endpoint='code/applySearch')

# ######################################################################################################################
# APP 업로드 화면 및 API 모음
# ######################################################################################################################

# 페이지
@app.route('/app')
@login_required
def app_main():
    return render_template('/did/app.html')

# API
api.add_resource(AppSearch, '/app/search', endpoint='app/search')
api.add_resource(App,       '/app/insert', endpoint='app/insert')


# ######################################################################################################################
# 가맹점 배포 관리
# ######################################################################################################################

# 페이지
@app.route('/deploy')
@login_required
def deploy_main():

    return render_template('/did/deploy.html')

# API
api.add_resource(Deploy, '/deploy/search', endpoint='deploy/search')   

# ######################################################################################################################
# SETUP
# ######################################################################################################################

# 페이지
@app.route('/setting')
@login_required
def setting_main():
    return render_template('/did/setting.html')


# API
api.add_resource(UserLocalSearch, '/user/Local/search', endpoint='/user/Local/search')                  # 사용자 콘텐츠 대상 관리


# # ######################################################################################################################
# # SET-TOP API 처리
# # ######################################################################################################################

# GSTECH Schedule 배포 (STATIC)
api.add_resource(GsSchedule,        '/api/gsschedule', endpoint='api/gsschedule')
api.add_resource(GsDeviceSchedule,  '/api/gsdeviceschedule', endpoint='api/gsdeviceschedule')
api.add_resource(GsDeviceAuth,      '/api/gsdeviceauth', endpoint='api/gsdeviceauth')
api.add_resource(GsStatistics,      '/api/gsstatistics', endpoint='api/gsstatistics')
api.add_resource(GsDeviceStatus,    '/api/gsdevicestatus', endpoint='api/gsdevicestatus')
api.add_resource(gsScreen,          '/api/gsscreen', endpoint='api/gsscreen')
api.add_resource(gsLog,             '/api/gslog', endpoint='api/gslog')
api.add_resource(gsCapture,         '/api/gscapture', endpoint='api/gscapture')
api.add_resource(gsAppVersion,      '/api/gsappversion', endpoint='api/gsappversion')


# ######################################################################################################################
# APP RUN
# ######################################################################################################################
if __name__ == '__main__':

    app.run(host='0.0.0.0', port=7000)