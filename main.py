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
# INTRO PAGE and LOGIN API ??????
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


api.add_resource(UserLogin,     '/web/login', endpoint='web/login')                                 # CMS ?????????   method:post
api.add_resource(UserLogout,    '/web/logout', endpoint='web/logout')                               # CMS ????????????  method:post
api.add_resource(UserPwFind,    '/user/find', endpoint='user/find')                                 # ???????????? ?????? method:post
api.add_resource(UserPwFind,    '/user/resetPw/<string:user_id_verify>', endpoint='user/resetPw')

# ######################################################################################################################
# DASHBOARD ??? API ??????
# ######################################################################################################################

# ?????????
@app.route('/dashboard')
@login_required
def dashboard_main():

    return render_template('/did/dashboard.html')

# API
api.add_resource(Dashboard, '/dashboard/search', endpoint='dashboard/search')                             # dashboard ????????????


# ######################################################################################################################
# ORGANIC ??? API ??????
# ######################################################################################################################

# ?????????
@app.route('/organic')
@login_required
def organic_main():

    return render_template('/did/organic.html')

# ######################################################################################################################
# SETTOP
# ######################################################################################################################

# ?????????
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
api.add_resource(SettopOrgan,           '/settop/organ/<string:dev_id>', endpoint='/settop/organ/<string:dev_id>')              # ??????????????????
api.add_resource(SettopMulti,           '/settop/multi/insert', endpoint="settop/multi/insert")                                 # ?????????????????? 
api.add_resource(ExcelDown,             '/settop/download', endpoint="/settop/download")                                          # ?????????????????? 

# SETTOP GROUP
api.add_resource(SettopTree, '/device/group/insert', endpoint='/device/group/insert')                   # SETTOP INSERT
api.add_resource(SettopTree, '/device/group/delete/<string:tID>', endpoint='/device/group/delete')      # SETTOP DELETE
api.add_resource(SettopTree, '/device/group', endpoint='/device/group/')                                # SETTOP GET
api.add_resource(DeviceDuplicate, '/settop/duplicate_check/<string:dev_id>', endpoint='settop/DeviceDuplicate')         # ???????????? ??????)



# ######################################################################################################################
# ???????????????(?????????, ?????????, ?????????) ??? API ??????
# ######################################################################################################################

# # ?????????
@app.route('/contents')
@login_required
def contents_main():
    return render_template('/did/contents.html')


# # API
api.add_resource(ContentsSearch,    '/contents/search', endpoint='contents/search')                                     # ?????????????????????
api.add_resource(Subtitle,          '/contents/subtitle', endpoint='contents/subtitle')                                 # subtitle ????????? ??????
api.add_resource(ConcatSubtitle,    '/contents/concatSubtitle', endpoint='contents/concatSubtitle')                     # subtitle ????????? ??????
api.add_resource(Subtitle,          '/contents/subtitle/update/<int:cont_seq>', endpoint='contents/subtitle/update')    # subtitle ????????? ??????
api.add_resource(Contents,          '/contents/insert', endpoint="contents/insert")                                     # ???????????????
api.add_resource(Contents,          '/contents/update/<int:cont_seq>', endpoint="contents/update")                      # ???????????????
api.add_resource(Contents,          '/contents/delete/<int:cont_seq>', endpoint="contents/delete")                      # ???????????????

# ######################################################################################################################
# SCREEN DESIGN
# ######################################################################################################################
# ?????????
@app.route('/design')
@login_required
def template_main():
    return render_template('/did/design.html')

# # API
api.add_resource(Control,       '/control/insert', endpoint='control/insert')                                       # Control ??????
api.add_resource(ControlSearch, '/control/search', endpoint='/control/search')                                      # Control ??????
api.add_resource(Control,       '/control/update/<int:control_id>', endpoint="control/update")                      # Control ??????
api.add_resource(Control,       '/control/delete/<int:control_id>', endpoint='/control/delete')                     # Control ??????
api.add_resource(ContContents,  '/control/contents/insert', endpoint='control/contents/insert')                     # ContContents ??????

# ######################################################################################################################
# PREVIEW
# ######################################################################################################################

#preview
@app.route('/preview')
@login_required
def preview_main():
    return render_template('/did/preview.html')

# ######################################################################################################################
# ??????????????? ??? API ??????
# ######################################################################################################################

@app.route('/schedule')
@login_required
def schedule_main():
    return render_template('/did/schedule.html')


# ???????????? ????????? ?????? ??? CRUD

# ?????? / ?????? / ?????? / ??????
api.add_resource(OrganicSearch, '/schedule/organ/search', endpoint='schedule/organ/search')
api.add_resource(Organic,       '/schedule/organ/insert', endpoint='schedule/organ/insert')
api.add_resource(Organic,       '/schedule/organ/update', endpoint='schedule/organ/update')
api.add_resource(Organic,       '/schedule/organ/delete', endpoint='schedule/organ/delete')
api.add_resource(Schedule,      '/schedule/insert', endpoint='schedule/insert')
api.add_resource(Schedule,      '/schedule/delete/<int:schedule_id>', endpoint='schedule/delete')


# ######################################################################################################################
# ????????? ?????? ??? API ??????
# ######################################################################################################################

# ?????????
@app.route('/user')
@login_required
def user_main():
    return render_template('/did/user.html')

#  API
api.add_resource(UserSearch,    '/user/select/search', endpoint='/user/select/search')                  # ????????? select box ??????
api.add_resource(UserSearch,    '/user/search', endpoint='/user/search')                                # ????????? ????????? ??????
api.add_resource(User,          '/user/insert', endpoint='/user/insert')                                # ????????? ??????
api.add_resource(User,          '/user/update/<string:user_id>', endpoint='user/update')                # ????????? ??????
api.add_resource(User,          '/user/delete/<string:user_id>', endpoint='user/delete')                # ????????? ???????????? ?????? ??????)
api.add_resource(UserDormancy, '/user/dormancy/<string:user_id>', endpoint='user/UserDormancy')         # ???????????? ??????)
api.add_resource(UserPassword, '/user/password/<string:user_id>', endpoint='user/UserPassword')         # ???????????? ?????? ??????)
api.add_resource(UserDuplicate, '/user/duplicate_check/<string:user_id>', endpoint='user/UserDuplicate')         # ???????????? ??????)


# ######################################################################################################################
# ???????????? ?????? ??? API ??????
# ######################################################################################################################

# ?????????
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
# APP ????????? ?????? ??? API ??????
# ######################################################################################################################

# ?????????
@app.route('/app')
@login_required
def app_main():
    return render_template('/did/app.html')

# API
api.add_resource(AppSearch, '/app/search', endpoint='app/search')
api.add_resource(App,       '/app/insert', endpoint='app/insert')


# ######################################################################################################################
# ????????? ?????? ??????
# ######################################################################################################################

# ?????????
@app.route('/deploy')
@login_required
def deploy_main():

    return render_template('/did/deploy.html')

# API
api.add_resource(Deploy, '/deploy/search', endpoint='deploy/search')   

# ######################################################################################################################
# SETUP
# ######################################################################################################################

# ?????????
@app.route('/setting')
@login_required
def setting_main():
    return render_template('/did/setting.html')


# API
api.add_resource(UserLocalSearch, '/user/Local/search', endpoint='/user/Local/search')                  # ????????? ????????? ?????? ??????


# # ######################################################################################################################
# # SET-TOP API ??????
# # ######################################################################################################################

# GSTECH Schedule ?????? (STATIC)
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