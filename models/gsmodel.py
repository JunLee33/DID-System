
# GS Model for rapid schedule handling

from datetime import datetime
from core.db import db
from werkzeug.security import generate_password_hash, check_password_hash
from models.code import CodeModel
from sqlalchemy.sql import text
from flask_login import current_user


class GsModel(db.Model):
    __tablename__ = 'tbl_user_new'

    user_id = db.Column(db.String(20), primary_key=True)                 # 사용자 아이디
    user_pwd = db.Column(db.String(128), nullable=False)                 # 사용자 패스워드(hash 양방향 암호)
    user_nm = db.Column(db.String(20), nullable=False)                   # 사용자명
    user_gr = db.Column(db.String(4), nullable=False)                    # 사용자 등급(TBL_COMMON)
    user_dept_nm = db.Column(db.String(30), nullable=False)              # 사용자 부서명
    user_conn_date = db.Column(db.DateTime, default=datetime.now())      # 사용자 로그인한 시간(90일 미접속 시 휴면계정 전환 체크)
    user_dor_acc = db.Column(db.String(1), nullable=False, default="N")  # 사용자 휴먼계정여부
    user_pwd_change_dt = db.Column(db.DateTime, default=datetime.now())  # 사용자 비밀번호 변경 일자
    user_ip = db.Column(db.String(15), nullable=True)                    # 사용자 IP
    user_mac = db.Column(db.String(12), nullable=True)                   # 사용자 MAC
    user_yn = db.Column(db.String(1), nullable=False, default="Y")       # 사용자 활성화/비활성화(default:Y)
    user_auth = db.Column(db.Boolean, nullable=False, default=False)     # 사용자 접속 현황
    # group_seq = db.Column(db.Integer, nullable=True, default=0)          # 사용자 소속 group_seq (arnold)
    # parking_seq = db.Column(db.Integer, nullable=True, default=0)        # 사용자 소속 site (arnold)
    create_user_id =    db.Column(db.String(20),nullable=True)                  # 생성자 아이디
    user_disk =         db.Column(db.Integer, nullable=True, default=0)         # 사용자 디스크 용량
    user_settop =       db.Column(db.Integer, nullable=True, default=0)         # 사용자 등록 셋탑 수
    user_reg_user_cnt = db.Column(db.Integer, nullable=True, default=0)         # 사용자 등록 생성 유저 수
    rgt_dt = db.Column(db.DateTime, default=datetime.now())
    mdfy_dt = db.Column(db.DateTime, default=datetime.now())

    def __init__(self, user_id, user_pwd, user_nm, user_gr, user_dept_nm, create_user_id, rgt_dt, mdfy_dt):

        self.user_id = user_id
        self.set_password(user_pwd)
        self.user_nm = user_nm
        self.user_gr = user_gr
        self.user_dept_nm = user_dept_nm
        self.create_user_id = create_user_id
        self.rgt_dt = rgt_dt
        self.mdfy_dt = mdfy_dt


    @classmethod
    def find_all_user_count(self):

        sql = """
                select count(*) tot_cnt
                from tbl_user a, tbl_common b 
                where a.user_gr = b.comm_cd 
            """

        # print("find_all_user_count list sql >>" + sql)

        return db.engine.execute(text(sql))

    # 0823 use_yn 수정 JUN
    @classmethod
    def find_schedule_list(self, sch_id):
        old= """
                SELECT sch_id,
                    case    when sch_loop_yn = 'Y' then 'true' else 'false' end sch_loop_yn,
                    date_format(sch_st_date, '%Y-%m-%d') sch_st_date, 
                    date_format(sch_ed_date, '%Y-%m-%d') sch_ed_date , 
                    date_format(mdfy_dt, '%Y-%m-%d %H:%i') mdfy_dt 
                FROM tbl_schedule
                WHERE 
                    sch_dep_stat = '0201'
                    and sch_id = :sch_id limit 1
            """ 

        sql = """
                SELECT a.sch_id,
                    case    when a.sch_loop_yn = 'Y' then 'true' else 'false' end sch_loop_yn,
                    date_format(a.sch_st_date, '%Y-%m-%d') sch_st_date, 
                    date_format(a.sch_ed_date, '%Y-%m-%d') sch_ed_date , 
                    date_format(a.mdfy_dt, '%Y-%m-%d %H:%i') mdfy_dt 
                FROM tbl_schedule a, tbl_schedule_dep b
                WHERE 
                    a.sch_id = b.sch_id 
                    and b.use_yn = "Y"
                    and a.sch_dep_stat = '0201'
                    and a.sch_id = :sch_id limit 1
            """
        # print("find_schedule_list sql >>" + sql)

        return db.engine.execute(text(sql),{'sch_id': sch_id})

    # find_project_list     0823 screen_id 관련수정
    @classmethod    
    def find_project_list(self, schedule_id):

        sql = """
                SELECT a.organ_id, a.organ_nm, a.organ_st_dt, a.organ_ed_dt, a.screen_id, a.control_id,
                        date_format(a.mdfy_dt, '%Y-%m-%d %H:%i') mdfy_dt,
                        case    when a.organ_week1 = 'Y' then '월' else '' end organ_week1,
                        case    when a.organ_week2 = 'Y' then '화' else '' end organ_week2,
                        case    when a.organ_week3 = 'Y' then '수' else '' end organ_week3,
                        case    when a.organ_week4 = 'Y' then '목' else '' end organ_week4,
                        case    when a.organ_week5 = 'Y' then '금' else '' end organ_week5,
                        case    when a.organ_week6 = 'Y' then '토' else '' end organ_week6,
                        case    when a.organ_week7 = 'Y' then '일' else '' end organ_week7
                FROM tbl_organic a
                WHERE a.sch_id = :schedule_id
                ORDER BY a.organ_id ASC
            """
        # print("find_project_list sql >>" + sql)
        # print(schedule_id)

        return db.engine.execute(text(sql), {'schedule_id': schedule_id})

    # find_control_list
    @classmethod
    def find_control_list(self,organ_id):
        
        sql = """
              SELECT b.control_detail_id, 
                case    
                    when b.control_type = 'I' then 'image'
                    when b.control_type = 'M' then 'movie'
                    when b.control_type = 'T' then 'text'
                    when b.control_type = 'W' then 'web'
                    when b.control_type = 'L' then 'live'
                    when b.control_type = 'G' then 'group'
                end control_type,
                b.control_x, b.control_y, b.control_w, b.control_h, b.control_order
            FROM tbl_control a, tbl_control_detail b, tbl_organic c
            WHERE c.organ_id = :organ_id 
				and a.control_id = b.control_id
				and c.control_id = a.control_id
            ORDER by control_order ASC
            """

        # print("find_project_list sql >>" + sql)
        # print(organ_id)

        return db.engine.execute(text(sql), {'organ_id': organ_id})

    # contents_list
    @classmethod
    def find_contents_list(self,control_id):

        sql = """
            SELECT b.cont_id, 
                date_format(b.cont_ed_dt, '%Y-%m-%d') cont_ed_dt,
                case    
                    when b.cont_tp = 'I' then 'image'
                    when b.cont_tp = 'M' then 'movie'
                    when b.cont_tp = 'T' then 'text'
                    when b.cont_tp = 'W' then 'web'
                    when b.cont_tp = 'L' then 'live'
                end cont_tp, b.cont_nm, cont_size, a.contcon_tm, b.cont_url, c.comm_nm as effect
            FROM tbl_cont_contents a, tbl_contents b, tbl_common c
            WHERE a.cont_id = b.cont_id and a.contcon_effect = c.comm_cd
            and a.control_detail_id = :control_id
            order by a.cont_order
            """
        # print("find_contents_list sql >>" + sql)
        # print(control_id)

        return db.engine.execute(text(sql), {'control_id': control_id})

    # contents_list
    @classmethod
    def find_txt_contents_list(self,control_id):

        sql = """
            SELECT b.contcon_id, 
                date_format(b.subt_ed_dt, '%Y-%m-%d') cont_ed_dt,
                case when b.cont_type = 'T' then 'text' end cont_tp, 
                b.subt_nm, a.contcon_tm, c.comm_nm, b.subt_font, b.subt_font_size,
                b.subt_font_color, b.subt_font_bcolor, b.subt_text1, b.subt_text2, b.subt_text3, b.subt_text4, b.subt_text5
            FROM tbl_cont_contents a, tbl_cont_subtitle b, tbl_common c
            WHERE a.cont_id = b.cont_id and a.contcon_effect = c.comm_cd
            and b.control_detail_id = :control_id limit 1
            """
        # print("find_contents_list sql >>" + sql)
        # print(control_id)

        return db.engine.execute(text(sql), {'control_id': control_id})
    
