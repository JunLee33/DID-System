# control.py
# control, control_contents table management (CRUD, QUERY)
# Created by waview.co.kr (2021)

from datetime import datetime
from email.policy import default
from core.db import db
from sqlalchemy.sql import text
from sqlalchemy import func
from flask_login import current_user

# mysql> desc tbl_control;
# +-------------+--------------+------+-----+---------+----------------+
# | Field       | Type         | Null | Key | Default | Extra          |
# +-------------+--------------+------+-----+---------+----------------+
# | control_id  | int          | NO   | PRI | NULL    | auto_increment |
# | control_nm  | varchar(50)  | YES  |     | NULL    |                |
# | control_cmt | varchar(100) | YES  |     | NULL    |                |
# | control_img | varchar(100) | YES  |     | NULL    |                |
# | user_id     | varchar(20)  | YES  |     | NULL    |                |
# | screen_id   | varchar(10)  | YES  |     | NULL    |                |
# | rgt_dt      | datetime     | YES  |     | NULL    |                |
# | mdfy_dt     | datetime     | YES  |     | NULL    |                |
# +-------------+--------------+------+-----+---------+----------------+

class ControlModel(db.Model):
    __tablename__ = 'tbl_control'

    control_id =    db.Column(db.Integer, primary_key=True, autoincrement=True)     # 편성 순번(Auto)
    control_nm =    db.Column(db.String(50), nullable=False)                        # 편성이름 (현재는 수정하지 않고 스크린명 그대로 이용)
    control_cmt =   db.Column(db.String(100), nullable=True)                        # 시작시간 (07:00)
    control_img =   db.Column(db.String(100), nullable=False)                       # img URL
    user_id =       db.Column(db.String(20), nullable=False)                        # User ID.
    screen_id =     db.Column(db.String(10), nullable=False)                        # 스크린 id (width X height) 0823
    use_yn =        db.Column(db.String(1), nullable=False, default='Y')            # 사용여부
    rgt_dt =        db.Column(db.DateTime, default=datetime.now())
    mdfy_dt =       db.Column(db.DateTime, default=datetime.now())

    def __init__(self, control_nm, control_cmt, control_img, user_id, screen_id, rgt_dt, mdfy_dt):

        self.control_nm = control_nm
        self.control_cmt = control_cmt
        self.control_img = control_img
        self.user_id = user_id
        self.screen_id = screen_id
        self.rgt_dt = rgt_dt
        self.mdfy_dt = mdfy_dt
    
    # save
    def save_to_db(self):
        db.session.add(self)
        db.session.commit()

    # delete
    def delete_to_db(self):
        db.session.delete(self)
        db.session.commit()

    @classmethod
    def find_by_id(cls, organ_id):
        return cls.query.filter_by(organ_id=organ_id).first()

    @classmethod
    def find_by_user_id(cls, user_id):
        return cls.query.filter_by(user_id=user_id).all()

    # UPDATE SCHEDULE DATE WHEN CONTROL UPDATED ############################################
    @classmethod
    def update_schedule_date(cls, control_id):

        sql = '''
            UPDATE tbl_schedule as b, 
                (select sch_id, control_id from tbl_organic ) as a  
            SET b.mdfy_dt = NOW()
            WHERE b.sch_id = a.sch_id and a.control_id = :control_id
            '''

        return db.engine.execute(text(sql),{"control_id":control_id})


    # DELETE ALL MYOWN ############################################
    @classmethod
    def del_all_control(cls, user_id):
       

        sql = """   
               DELETE 
               FROM tbl_control
               WHERE user_id = :user_id
               """

        # print("delete_all_organ sql ==> "+sql)

        return db.engine.execute(text(sql),{"user_id":user_id})

    # List 구성을 위한 COUNT ############################################
    @classmethod
    def get_control_all_cnt(cls, params):
        cont_nm, user_id  = params

        sql = """   
               select count(*) tot_cnt 
               from tbl_control a, tbl_user b
               where a.user_id = b.user_id 
               and a.use_yn = "Y"
               """

        if cont_nm:
            sql += " and control_nm like concat('%','" + cont_nm + "','%') \n"
        # if user_id:
        #     sql += " and user_id = '" + user_id + "' \n"
        if current_user.user_gr == "0102":
            sql += " and (b.create_user_id = '" + current_user.user_id + "' or a.user_id='" + current_user.user_id + "')"
        if current_user.user_gr == "0103":
            sql += " and a.user_id = '" + user_id + "' \n"
        # print(sql)
        # print("get_organic_all_cnt sql ==> "+sql)

        return db.engine.execute(text(sql))

    # List 구성을 위한  상세내역 ############################################
    # - 조건없이 무조건 전체 검색 (stage 1)
    @classmethod
    def get_control_all_list(cls, params):
        control_nm, user_id, start, length = params

        sql = """   
            SELECT row_number() OVER(order by control_id desc) row_cnt , control_id, control_nm, 
                    control_cmt, control_img, a.user_id, screen_id
            FROM tbl_control a, tbl_user b 
            WHERE a.user_id = b.user_id
            and a.use_yn = "Y"
        """

        if control_nm:
            sql += " and control_nm like concat('%','" + control_nm + "','%') \n"
        # if user_id:
        #     sql += " and user_id  = '" + user_id + "' \n"
        if current_user.user_gr == "0102":
            sql += " and (b.create_user_id = '" + current_user.user_id + "' or a.user_id='" + current_user.user_id + "')"
        if current_user.user_gr == "0103":
            sql += " and a.user_id = '" + user_id + "' \n"

        if int(length) > 0:
            sql += " limit " + str(length) + " offset " + str(start)
        # print(sql)
        # print("get_organic_all_list sql ==> "+sql)

        return db.engine.execute(text(sql))


    # Control ID 이용해서 control, control_detail, cont_contents 정보 가져오기  -- // 0823 screen_id 관련 수정 (by.jun)
    @classmethod
    def get_control_all_list_byID(cls, cont_id, user_id):
        sql_old = """   
            SELECT b.control_type,b.control_x, b.control_y, b.control_w, b.control_h,
                    c.contcon_effect, c.contcon_tm,  c.cont_id, c.cont_nm, d.screen_width, d.screen_height, e.cont_url
            FROM tbl_control a, tbl_control_detail b, tbl_cont_contents c, tbl_screen d, tbl_contents e
            WHERE a.control_id = b.control_id
                and b.control_detail_id = c.control_detail_id
                and a.screen_id = d.screen_id
                and a.use_yn = "Y"
                and a.control_id = :control_id
                and a.user_id = :user_id
            ORDER by b.control_type DESC , b.control_order ASC
        """

        sql = """
            SELECT b.control_type,b.control_x, b.control_y, b.control_w, b.control_h,
                    c.contcon_effect, c.contcon_tm,  c.cont_id, c.cont_nm, a.screen_id, e.cont_url, e.cont_tp, e.cont_thu_url, b.control_idx
            FROM tbl_control a, tbl_control_detail b, tbl_cont_contents c, tbl_contents e
            WHERE a.control_id = b.control_id
                and b.control_detail_id = c.control_detail_id
                and e.cont_id = c.cont_id
                and a.use_yn = "Y"
                and a.control_id = :control_id
            """
        if current_user.user_gr == "0103":
            sql +=" and a.user_id = :user_id \n"
        else:
            sql +="and a.user_id = (select user_id from tbl_control where control_id = :control_id) \n"
        sql += "ORDER by b.control_idx ASC"
        
        # print('등급',current_user.user_gr)
        # print(sql)


        # print("get_control_all_list sql ==> "+sql)

        return db.engine.execute(text(sql),{'control_id':cont_id, 'user_id':user_id})


    @classmethod
    def delete_control_all_list_byID(cls, control_id):

        sql = """
                DELETE d
                FROM tbl_control a 
                INNER JOIN tbl_control_detail b ON a.control_id = b.control_id 
                INNER JOIN tbl_cont_contents c ON b.control_detail_id = c.control_detail_id
                INNER JOIN tbl_cont_subtitle d ON b.control_detail_id = d.control_detail_id
                WHERE a.control_id = :control_id
            """
        db.engine.execute(text(sql),{'control_id':control_id})

        sql = """
                DELETE c
                FROM tbl_control a 
                INNER JOIN tbl_control_detail b ON a.control_id = b.control_id 
                INNER JOIN tbl_cont_contents c ON b.control_detail_id = c.control_detail_id
                WHERE a.control_id = :control_id
            """
        db.engine.execute(text(sql),{'control_id':control_id})

        sql = """
                DELETE b
                FROM tbl_control a 
                INNER JOIN tbl_control_detail b ON a.control_id = b.control_id 
                WHERE a.control_id = :control_id   
            """
        db.engine.execute(text(sql),{'control_id':control_id})

        sql = """
                UPDATE tbl_control
                SET use_yn = "N"
                WHERE control_id = :control_id
            """
        
        db.engine.execute(text(sql),{'control_id':control_id})
        result_string = "SUCCESS"
        return result_string

    @classmethod
    def delete_control_detail_list_byID(cls, control_id):

        sql = """
                DELETE d
                FROM tbl_control a 
                INNER JOIN tbl_control_detail b ON a.control_id = b.control_id 
                INNER JOIN tbl_cont_contents c ON b.control_detail_id = c.control_detail_id
                INNER JOIN tbl_cont_subtitle d ON b.control_detail_id = d.control_detail_id
                WHERE a.control_id = :control_id
            """
        db.engine.execute(text(sql),{'control_id':control_id})

        sql = """
                DELETE c
                FROM tbl_control a 
                INNER JOIN tbl_control_detail b ON a.control_id = b.control_id 
                INNER JOIN tbl_cont_contents c ON b.control_detail_id = c.control_detail_id
                WHERE a.control_id = :control_id
            """
        db.engine.execute(text(sql),{'control_id':control_id})

        sql = """
                DELETE b
                FROM tbl_control a 
                INNER JOIN tbl_control_detail b ON a.control_id = b.control_id 
                WHERE a.control_id = :control_id   
            """
        db.engine.execute(text(sql),{'control_id':control_id})

        result_string = "SUCCESS"
        return result_string

    # screen_id 관련 수정!! (0823 JUN)
    @classmethod        
    def update_control_rgt_byID(cls, control_id, control_url, screen_id, mdfy_dt):

        sql = """
                UPDATE tbl_control 
                SET mdfy_dt = :mdfy_dt, control_img = :control_url, screen_id = :screen_id
                WHERE control_id = :control_id ;
            """
        db.engine.execute(text(sql),{'control_id':control_id, 'control_url':control_url, 'screen_id':screen_id,  'mdfy_dt' : mdfy_dt})
        result_string = "SUCCESS"

        return result_string

    # @classmethod
    # def update_control_rgt_byID(cls, control_id, control_url, mdfy_dt):

    #     sql = """
    #             UPDATE tbl_control 
    #             SET mdfy_dt = :mdfy_dt, control_img = :control_url
    #             WHERE control_id = :control_id ;
    #         """
    #     db.engine.execute(text(sql),{'control_id':control_id, 'control_url':control_url,  'mdfy_dt' : mdfy_dt})
    #     result_string = "SUCCESS"

    #     return result_string


    @classmethod
    def find_by_control_id(cls, control_id):
        sql = '''
            SELECT count(*) cnt
            FROM tbl_organic a, tbl_control b, tbl_schedule_dep c
            WHERE  a.control_id = b.control_id and b.control_id = :control_id
            and a.sch_id = c.sch_id and c.use_yn = "Y"
        '''
        
        return db.engine.execute(text(sql),{'control_id':control_id})




# mysql> desc tbl_control_detail;
# +-------------------+------------+------+-----+---------+----------------+
# | Field             | Type       | Null | Key | Default | Extra          |
# +-------------------+------------+------+-----+---------+----------------+
# | control_detail_id | int        | NO   | PRI | NULL    | auto_increment |
# | control_type      | varchar(1) | YES  |     | NULL    |                |
# | control_x         | int        | YES  |     | NULL    |                |
# | control_y         | int        | YES  |     | NULL    |                |
# | control_w         | int        | YES  |     | NULL    |                |
# | control_h         | int        | YES  |     | NULL    |                |
# | control_order     | int        | YES  |     | NULL    |                |
# | control_id        | int        | YES  |     | NULL    |                |
# | control_idx       | int        | YES  |     | NULL    |                |
# | rgt_dt            | datetime   | YES  |     | NULL    |                |
# | mdfy_dt           | datetime   | YES  |     | NULL    |                |
# +-------------------+------------+------+-----+---------+----------------+
class ControlDetailModel(db.Model):
    __tablename__ = 'tbl_control_detail'

    control_detail_id =     db.Column(db.Integer, primary_key=True, autoincrement=True)     # 편성 순번(Auto)
    control_type =          db.Column(db.String(1), nullable=False)                         # control Type = media type 과 동일 (M,I,S,L,W,G)
    control_x =             db.Column(db.Integer, nullable=False)                           # X 좌표
    control_y =             db.Column(db.Integer, nullable=False)                           # Y 좌표
    control_w =             db.Column(db.Integer, nullable=False)                           # Width
    control_h =             db.Column(db.Integer, nullable=False)                           # Height
    control_order =         db.Column(db.Integer, nullable=True)                            # Ordering idex 넣어줌
    control_id =            db.Column(db.Integer, nullable=False)                           # control_id
    control_idx =           db.Column(db.Integer, nullable=False)                           # Z-index
    rgt_dt =                db.Column(db.DateTime, default=datetime.now())
    mdfy_dt =               db.Column(db.DateTime, default=datetime.now())

    def __init__(self, control_type, control_x, control_y, control_w, control_h, control_order, control_id, control_idx, rgt_dt, mdfy_dt):

        self.control_type = control_type
        self.control_x = control_x
        self.control_y = control_y
        self.control_w = control_w
        self.control_h = control_h
        self.control_order = control_order
        self.control_id = control_id
        self.control_idx = control_idx
        self.rgt_dt = rgt_dt
        self.mdfy_dt = mdfy_dt
    
    # save
    def save_to_db(self):
        db.session.add(self)
        db.session.commit()

    # delete
    def delete_to_db(self):
        db.session.delete(self)
        db.session.commit()

    # rollback
    def session_rollback(self):
        db.session.rollback()

    @classmethod
    def find_by_id(cls, control_detail_id):
        return cls.query.filter_by(control_detail_id=control_detail_id).first()





# mysql> desc tbl_cont_contents;
# +----------------+------------+------+-----+---------+----------------+
# | Field          | Type       | Null | Key | Default | Extra          |
# +----------------+------------+------+-----+---------+----------------+
# | contcon_id     | int        | NO   | PRI | NULL    | auto_increment |
# | contcon_tm     | int        | YES  |     | NULL    |                |
# | contcon_effect | varchar(4) | YES  |     | NULL    |                |
# | control_id     | int        | NO   | MUL | NULL    |                |
# | cont_id        | int        | NO   | MUL | NULL    |                |
# | cont_order     | int        | YES  |     | NULL    |                |
# | rgt_dt         | datetime   | YES  |     | NULL    |                |
# | mdfy_dt        | datetime   | YES  |     | NULL    |                |
# +----------------+------------+------+-----+---------+----------------+
class ContContentsModel(db.Model):
    __tablename__ = 'tbl_cont_contents'

    contcon_id =            db.Column(db.Integer, primary_key=True, autoincrement=True)     # control-contents detail id / index, autoincrement.
    contcon_tm =            db.Column(db.Integer, nullable=False)                           # Play time (default values exist)
    contcon_effect =        db.Column(db.String(4), nullable=False)                         # control Type = media type 과 동일 (M,I,S,L,W,G)
    control_detail_id =     db.Column(db.Integer, nullable=False)                           # Y 좌표
    cont_id =               db.Column(db.Integer, nullable=False)                           # Width
    cont_nm =               db.Column(db.String(50), nullable=False)                        # contents name (화명디자인에서 한번에 처리를 위한 필드)
    cont_order =               db.Column(db.Integer, nullable=False)                           # contents ordering
    rgt_dt =                db.Column(db.DateTime, default=datetime.now())
    mdfy_dt =               db.Column(db.DateTime, default=datetime.now())

    def __init__(self, contcon_tm, contcon_effect, control_detail_id, cont_id, cont_nm, cont_order, rgt_dt, mdfy_dt):

        self.contcon_tm = contcon_tm
        self.contcon_effect = contcon_effect
        self.control_detail_id = control_detail_id
        self.cont_id = cont_id
        self.cont_nm = cont_nm
        self.cont_order = cont_order
        self.rgt_dt = rgt_dt
        self.mdfy_dt = mdfy_dt
    
    # save
    def save_to_db(self):
        db.session.add(self)
        db.session.commit()

    # delete
    def delete_to_db(self):
        db.session.delete(self)
        db.session.commit()

    # rollback
    def session_rollback(self):
        db.session.rollback()
