# organic.py
# organic, organic_rep table management (CRUD, QUERY)
# Created by waview.co.kr (2021)

from datetime import datetime
from core.db import db
from sqlalchemy.sql import text
from sqlalchemy import func
from flask_login import current_user

# desc tbl_organic
# +----------------+-------------+------+-----+---------+----------------+
# | Field          | Type        | Null | Key | Default | Extra          |
# +----------------+-------------+------+-----+---------+----------------+
# | organ_id       | int         | NO   | PRI | NULL    | auto_increment |
# | screen_id      | varchar(10) | NO   |     | NULL    |                |
# | organ_nm       | varchar(50) | NO   |     | NULL    |                |
# | organ_st_dt    | varchar(10) | YES  |     | NULL    |                |
# | organ_ed_dt    | varchar(10) | YES  |     | NULL    |                |
# | organ_week1    | varchar(1)  | YES  |     | NULL    |                |
# | organ_week2    | varchar(1)  | YES  |     | NULL    |                |
# | organ_week3    | varchar(1)  | YES  |     | NULL    |                |
# | organ_week4    | varchar(1)  | YES  |     | NULL    |                |
# | organ_week5    | varchar(1)  | YES  |     | NULL    |                |
# | organ_week6    | varchar(1)  | YES  |     | NULL    |                |
# | organ_week7    | varchar(1)  | YES  |     | NULL    |                |
# | organ_dep_stat | varchar(4)  | YES  |     | NULL    |                |
# | sch_id         | bigint      | NO   |     | NULL    |                |
# | control_id     | int         | NO   | MUL | NULL    |                |
# | rgt_dt         | datetime    | YES  |     | NULL    |                |
# | mdfy_dt        | datetime    | YES  |     | NULL    |                |
# +----------------+-------------+------+-----+---------+----------------+

class OrganicModel(db.Model):
    __tablename__ = 'tbl_organic'

    organ_id = db.Column(db.Integer, primary_key=True, autoincrement=True)  # 편성 순번(Auto)
    screen_id = db.Column(db.String(10), nullable=False)                    # 스크린 id (width X height)
    organ_nm = db.Column(db.String(50), nullable=False)                     # 편성이름 (현재는 수정하지 않고 스크린명 그대로 이용)
    organ_st_dt =  db.Column(db.String(10), nullable=True, default=0)       # 시작시간 (07:00)
    organ_ed_dt = db.Column(db.String(10), nullable=True)                   # 종료시간 (07:00)
    organ_week1 = db.Column(db.String(1), nullable=True)                    # 월요일 적용 유무 
    organ_week2 = db.Column(db.String(1), nullable=True)                    # 화요일 적용 유무 
    organ_week3 = db.Column(db.String(1), nullable=True)                    # 수요일 적용 유무 
    organ_week4 = db.Column(db.String(1), nullable=True)                    # 목요일 적용 유무 
    organ_week5 = db.Column(db.String(1), nullable=True)                    # 금요일 적용 유무 
    organ_week6 = db.Column(db.String(1), nullable=True)                    # 토요일 적용 유무 
    organ_week7 = db.Column(db.String(1), nullable=True)                    # 일요일 적용 유무 
    organ_dep_stat = db.Column(db.String(4), nullable=True)                 # 배포 상태 코드 
    organ_img = db.Column(db.String(45), nullable=False)                    # img URL
    sch_id = db.Column(db.Integer, nullable=True)                           # Schedule ID ( 지금은 나올수 없음 / schedule dep 에서 나를 포함 함.) ==> 로직변경 & 업무 변경으로 여기에 넣을 수 있음. 2021.05.13
    control_id = db.Column(db.Integer, nullable=False)                      # Foreign key for control_id (화면 아이디가 기본)
    user_id = db.Column(db.String(20), nullable=False)                      # User ID.
    rgt_dt = db.Column(db.DateTime, default=datetime.now())
    mdfy_dt = db.Column(db.DateTime, default=datetime.now())

    def __init__(self, screen_id, organ_nm, organ_st_dt, organ_ed_dt, organ_week1, organ_week2, organ_week3, organ_week4, organ_week5, organ_week6, organ_week7,
                organ_dep_stat , sch_id , control_id, organ_img, user_id, rgt_dt, mdfy_dt):

        self.screen_id = screen_id
        self.organ_nm = organ_nm
        self.organ_st_dt = organ_st_dt
        self.organ_ed_dt = organ_ed_dt
        self.organ_week1 = organ_week1
        self.organ_week2 = organ_week2
        self.organ_week3 = organ_week3
        self.organ_week4 = organ_week4
        self.organ_week5 = organ_week5
        self.organ_week6 = organ_week6
        self.organ_week7 = organ_week7
        self.organ_dep_stat = organ_dep_stat
        self.sch_id = sch_id
        self.control_id = control_id
        self.organ_img = organ_img
        self.user_id = user_id
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
    def find_by_id(cls, organ_id):
        return cls.query.filter_by(organ_id=organ_id).first()

    @classmethod
    def find_by_user_id(cls, user_id):
        return cls.query.filter_by(user_id=user_id).all()

    # DELETE ALL MYOWN ############################################
    @classmethod
    def find_by_user_id_list(cls, user_id):
       

        sql = """   
               SELECT organ_id 
               FROM tbl_organic
               WHERE user_id = :user_id
               """

        # print("delete_all_organ sql ==> "+sql)

        return db.engine.execute(text(sql),{"user_id":user_id})


    # DELETE ALL MYOWN ############################################
    @classmethod
    def del_by_organ_id(cls, organ_id):
       

        sql = """   
               DELETE 
               FROM tbl_organic
               WHERE organ_id = :organ_id
               """

        # print("delete_all_organ sql ==> "+sql)

        return db.engine.execute(text(sql),{"organ_id":organ_id})

    # List 구성을 위한 COUNT ############################################
    @classmethod
    def get_organic_all_cnt(cls, params):
        organ_nm, user_id  = params

        sql = """   
               select count(*) tot_cnt 
               from tbl_organic
               """

        if organ_nm:
            sql += " where organ_nm like concat('%','" + organ_nm + "','%') \n"
        if user_id and current_user.user_gr != "0101":
            sql += " where user_id = '" + user_id + "' \n"

        # print("get_organic_all_cnt sql ==> "+sql)

        return db.engine.execute(text(sql))

    # List 구성을 위한  상세내역 ############################################
    # - 조건없이 무조건 전체 검색 (stage 1)
    @classmethod
    def get_organic_all_list(cls, params):
        organ_nm, user_id, start, length = params

        sql = """   
            SELECT row_number() OVER(order by organ_id desc) row_cnt , organ_id, screen_id, organ_nm, 
                    organ_st_dt, organ_ed_dt, organ_week1, organ_week2, organ_week3, organ_week4, organ_week5, organ_week6, organ_week7,
                    organ_dep_stat, organ_img, control_id
            FROM tbl_organic                
        """

        if organ_nm:
            sql += " where organ_nm like concat('%','" + organ_nm + "','%') \n"
        if user_id and current_user.user_gr != "0101":
            sql += " where  user_id  = '" + user_id + "' \n"
       
        if int(length) > 0:
            sql += " limit " + str(length) + " offset " + str(start)

        # print("get_organic_all_list sql ==> "+sql)

        return db.engine.execute(text(sql))


# mysql> desc tbl_schedule;
# +--------------+-------------+------+-----+---------+----------------+
# | Field        | Type        | Null | Key | Default | Extra          |
# +--------------+-------------+------+-----+---------+----------------+
# | sch_id       | bigint      | NO   | PRI | NULL    | auto_increment |
# | sch_st_date  | datetime    | NO   |     | NULL    |                |
# | sch_ed_date  | datetime    | NO   |     | NULL    |                |
# | sch_loop_yn  | varchar(1)  | NO   |     | NULL    |                |
# | sch_dep_stat | varchar(4)  | NO   |     | NULL    |                |
# | user_id      | varchar(20) | NO   | MUL | NULL    |                |
# | group_id     | int         | YES  |     | NULL    |                |
# | parking_id   | int         | NO   |     | NULL    |                |
# | rgt_dt       | datetime    | YES  |     | NULL    |                |
# | mdfy_dt      | datetime    | YES  |     | NULL    |                |
# +--------------+-------------+------+-----+---------+----------------+
class ScheduleModel(db.Model):
    __tablename__ = 'tbl_schedule'

    sch_id =        db.Column(db.Integer,   primary_key=True, autoincrement=True)       # Schedule 순번(Auto)
    sch_st_date =   db.Column(db.DateTime,  nullable=False)                             # 시작시간 (2021-05-31)
    sch_ed_date =   db.Column(db.DateTime,  nullable=False)                             # 종료시간 (2021-05-31)
    sch_loop_yn =   db.Column(db.String(1), nullable=True)                              # 반복 Y / N
    sch_dep_stat =  db.Column(db.String(4), nullable=True)                              # 배포상태코드
    user_id =       db.Column(db.String(20),nullable=False)                             # User ID.
    group_id =      db.Column(db.Integer,   nullable=True)                              # 그룹 ID
    parking_id =    db.Column(db.Integer,   nullable=True)                              # 사이트 ID
    rgt_dt =        db.Column(db.DateTime, default=datetime.now())
    mdfy_dt =       db.Column(db.DateTime, default=datetime.now())

    def __init__(self, sch_st_date, sch_ed_date, sch_loop_yn, sch_dep_stat, user_id, group_id, parking_id, rgt_dt, mdfy_dt):

        self.sch_st_date = sch_st_date
        self.sch_ed_date = sch_ed_date
        self.sch_loop_yn = sch_loop_yn
        self.sch_dep_stat = sch_dep_stat
        self.user_id = user_id
        self.group_id = group_id
        self.parking_id = parking_id
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
    def find_by_id(cls, sch_id):
        return cls.query.filter_by(sch_id=sch_id).first()

    #  0823 use_yn 수정 JUN
    @classmethod
    def find_by_user_id(cls, user_id):
        sql = '''
            SELECT a.organ_nm, a.organ_week1, a.organ_week2, a.organ_week3, a.organ_week4, a.organ_week5, a.organ_week6, a.organ_week7 ,
                date_format(b.sch_st_date,'%Y-%m-%d') start_dt,
                date_format(b.sch_ed_date,'%Y-%m-%d') end_dt,
                a.organ_st_dt, a.organ_ed_dt, a.sch_id
            FROM tbl_organic a, tbl_schedule b, tbl_user c, tbl_schedule_dep d
            WHERE  a.sch_id = b.sch_id and b.sch_id = d.sch_id and a.user_id = c.user_id and d.use_yn = "Y" 
        '''
        if current_user.user_gr == '0102':
            sql += "and (a.user_id = :user_id  or create_user_id = :user_id)"
        if current_user.user_gr == '0103':
            sql += "and a.user_id = :user_id"

        # print(sql)
        return db.engine.execute(text(sql),{'user_id':user_id})

    # @classmethod
    # def find_by_admin(cls, user_id):
    #     sql = """
    #         select a.organ_id, a.screen_id, a.organ_nm, a.organ_st_dt, a.organ_ed_dt, a.organ_week1, a.organ_week2, a.organ_week3, a.organ_week3, a.organ_week3, a.organ_week3, a.organ_week3, a.organ_dep_stat, a.organ_img, a.sch_id, a.control_id, a.user_id, a.rgt_dt, a.mdfy_dt from tbl_organic a, tbl_user b where a.user_id = b.user_id and (a.user_id = :user_id or b.create_user_id = :user_id)
    #         """
    #     print(sql)

    #     return db.engine.execute(text(sql),{"user_id":user_id})

    # List 구성을 위한 COUNT ############################################   0823 use_id 수정 JUN
    @classmethod
    def deploy_by_user_id_cnt(cls, user_id):

        sql = """   
            select count(*) tot_cnt
            FROM (
                SELECT row_number() OVER(order by a.rgt_dt desc) row_cnt,
                    a.sch_id, group_concat(DISTINCT a.organ_nm) organ_nm,
                    group_concat(DISTINCT date_format(b.sch_st_date,'%Y-%m-%d')) sch_st_date,
                    group_concat(DISTINCT date_format(b.sch_ed_date,'%Y-%m-%d')) sch_ed_date,
                    group_concat(DISTINCT date_format(a.rgt_dt,'%Y-%m-%d')) rgt_dt, 
                    group_concat(DISTINCT a.organ_st_dt) organ_st_dt, group_concat(DISTINCT a.organ_ed_dt) organ_ed_dt, 
                    group_concat(DISTINCT a.user_id) user_id, group_concat(DISTINCT c.dev_id) dev_id, count(DISTINCT dev_id) dev_cnt
                FROM tbl_organic a, tbl_schedule b, tbl_schedule_dep c
                WHERE  a.sch_id = b.sch_id and a.user_id = :user_id and c.sch_id = b.sch_id and c.use_yn = "Y" 
                GROUP BY a.sch_id, a.rgt_dt
            )e
            WHERE 1=1
            """
        # print("get_organic_all_cnt sql ==> "+sql)

        return db.engine.execute(text(sql),{'user_id':user_id})

    @classmethod
    def deploy_by_user_id(cls, user_id, length, start):
        sql = '''
            SELECT row_number() OVER(order by a.rgt_dt desc) row_cnt,
                a.sch_id, group_concat(DISTINCT a.organ_nm) organ_nm,
                group_concat(DISTINCT date_format(b.sch_st_date,'%Y-%m-%d')) sch_st_date,
                group_concat(DISTINCT date_format(b.sch_ed_date,'%Y-%m-%d')) sch_ed_date,
                group_concat(DISTINCT date_format(a.rgt_dt,'%Y-%m-%d')) rgt_dt, 
                group_concat(DISTINCT a.organ_st_dt) organ_st_dt, group_concat(DISTINCT a.organ_ed_dt) organ_ed_dt, 
                group_concat(DISTINCT a.user_id) user_id, group_concat(DISTINCT c.dev_id) dev_id, count(DISTINCT dev_id) dev_cnt
            FROM tbl_organic a, tbl_schedule b, tbl_schedule_dep c
            WHERE  a.sch_id = b.sch_id and a.user_id = :user_id and c.sch_id = b.sch_id and c.use_yn = "Y" 
            GROUP BY a.sch_id, a.rgt_dt
        '''
        if int(length) > 0:
            sql += "limit " + str(length) + " offset " + str(start)

        return db.engine.execute(text(sql),{'user_id':user_id})


# mysql> desc tbl_schedule_dep;
# +---------+-------------+------+-----+---------+-------+
# | Field   | Type        | Null | Key | Default | Extra |
# +---------+-------------+------+-----+---------+-------+
# | sch_id  | bigint      | NO   | PRI | NULL    |       |
# | dev_id  | varchar(40) | NO   | PRI | NULL    |       |
# | dep_yn  | varchar(1)  | NO   |     | N       |       |
# | use_yn  | varchar(1)  | NO   |     | N       |       |
# | rgt_dt  | datetime    | YES  |     | NULL    |       |
# | mdfy_dt | datetime    | YES  |     | NULL    |       |
# +---------+-------------+------+-----+---------+-------+
class ScheduleDepModel(db.Model):
    __tablename__ = 'tbl_schedule_dep'

    sch_id =    db.Column(db.Integer,       primary_key=True)                           # Schedule 순번(Auto)
    dev_id =    db.Column(db.String(40),    primary_key=True)                           # dev_id
    dep_yn =    db.Column(db.String(1),     nullable=False)                             # deploy Y / N
    use_yn =    db.Column(db.String(1),     nullable=True)                              # use Y / N
    rgt_dt =    db.Column(db.DateTime, default=datetime.now())
    mdfy_dt =   db.Column(db.DateTime, default=datetime.now())

    def __init__(self, sch_id, dev_id, dep_yn, use_yn, rgt_dt, mdfy_dt):

        self.sch_id = sch_id
        self.dev_id = dev_id
        self.dep_yn = dep_yn
        self.use_yn = use_yn
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
    def find_by_id(cls, sch_id):
        return cls.query.filter_by(sch_id=sch_id).first()

    @classmethod
    def find_by_device_id(cls, dev_id):
        sql = '''
            SELECT a.sch_id as schedule_id, 
                date_format(a.sch_st_date,'%Y-%m-%d') schedule_start,
                date_format(a.sch_ed_date,'%Y-%m-%d') schedule_end,
                date_format(a.mdfy_dt,'%Y-%m-%d %H:%i') schedule_update
            FROM tbl_schedule a, tbl_schedule_dep b
            WHERE a.sch_id = b.sch_id
                and b.use_yn = "Y" 
                and a.sch_ed_date >= now()
                and b.dev_id = :dev_id
        '''
        
        print(sql)
        return db.engine.execute(text(sql),{'dev_id':dev_id})

     # UPDATE SCHEDULE_DEP use_yn ############################################  0823 스케줄 삭제입니다 // JUN
    @classmethod
    def update_schedule_use(cls, schedule_id):

        sql = '''
            UPDATE tbl_schedule_dep as b, 
                (select sch_id from tbl_schedule ) as a  
            SET b.use_yn = "N"
            WHERE b.sch_id = a.sch_id and a.sch_id = :schedule_id
            '''

        return db.engine.execute(text(sql),{"schedule_id" : schedule_id})


# mysql> desc tbl_schedule_organ;
# +----------+------------+------+-----+---------+-------+
# | Field    | Type       | Null | Key | Default | Extra |
# +----------+------------+------+-----+---------+-------+
# | sch_id   | int        | NO   | PRI | NULL    |       |
# | organ_id | int        | NO   | PRI | NULL    |       |
# | dep_yn   | varchar(1) | NO   |     | NULL    |       |
# | use_yn   | varchar(1) | NO   |     | NULL    |       |
# | rgt_dt   | datetime   | YES  |     | NULL    |       |
# | mdfy_dt  | datetime   | YES  |     | NULL    |       |
# +----------+------------+------+-----+---------+-------+
class ScheduleOrganModel(db.Model):
    __tablename__ = 'tbl_schedule_organ'

    sch_id =    db.Column(db.Integer,       primary_key=True)                           # Schedule 순번(Auto)
    organ_id =  db.Column(db.Integer,       primary_key=True)                           # dev_id
    dep_yn =    db.Column(db.String(1),     nullable=False)                             # deploy Y / N
    use_yn =    db.Column(db.String(1),     nullable=True)                              # use Y / N
    rgt_dt =    db.Column(db.DateTime, default=datetime.now())
    mdfy_dt =   db.Column(db.DateTime, default=datetime.now())

    def __init__(self, sch_id, organ_id, dep_yn, use_yn, rgt_dt, mdfy_dt):

        self.sch_id = sch_id
        self.organ_id = organ_id
        self.dep_yn = dep_yn
        self.use_yn = use_yn
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
    def find_by_id(cls, sch_id):
        return cls.query.filter_by(sch_id=sch_id).first()


