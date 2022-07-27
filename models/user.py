from datetime import datetime
from core.db import db
from werkzeug.security import generate_password_hash, check_password_hash
from models.code import CodeModel
from sqlalchemy.sql import text
from flask_login import current_user

# +--------------------+--------------+------+-----+---------+-------+
# | Field              | Type         | Null | Key | Default | Extra |
# +--------------------+--------------+------+-----+---------+-------+
# | user_id            | varchar(20)  | NO   | PRI | NULL    |       |
# | user_pwd           | varchar(128) | NO   |     | NULL    |       |
# | user_nm            | varchar(20)  | NO   |     | NULL    |       |
# | user_gr            | varchar(4)   | NO   |     | NULL    |       |
# | user_dept_nm       | varchar(30)  | NO   |     | NULL    |       |
# | user_conn_date     | datetime     | YES  |     | NULL    |       |
# | user_dor_acc       | varchar(1)   | NO   |     | NULL    |       |
# | user_pwd_change_dt | datetime     | YES  |     | NULL    |       |
# | user_ip            | varchar(15)  | YES  |     | NULL    |       |
# | user_mac           | varchar(12)  | YES  |     | NULL    |       |
# | user_yn            | varchar(1)   | NO   |     | NULL    |       |
# | user_auth          | tinyint(1)   | NO   |     | NULL    |       |
# | group_id           | int          | YES  |     | 0       |       |
# | parking_id         | int          | YES  |     | 0       |       |
# | create_user_id     | varchar(20)  | YES  |     | NULL    |       |
# | user_disk          | varchar(20)  | NO   |     | NULL    |       |
# | user_settop        | int          | NO   |     | NULL    |       |
# | user_reg_user_cnt  | int          | NO   |     | NULL    |       |
# | user_M             | varchar(1)   | YES  |     | NULL    |       |
# | user_I             | varchar(1)   | YES  |     | NULL    |       |
# | user_T             | varchar(1)   | YES  |     | NULL    |       |
# | user_W             | varchar(1)   | YES  |     | NULL    |       |
# | user_L             | varchar(1)   | YES  |     | NULL    |       |
# | user_G             | varchar(1)   | YES  |     | NULL    |       |
# | rgt_dt             | datetime     | NO   |     | NULL    |       |
# | mdfy_dt            | datetime     | NO   |     | NULL    |       |
# +--------------------+--------------+------+-----+---------+-------+

class UserModel(db.Model):
    __tablename__ = 'tbl_user'

    user_id = db.Column(db.String(20), primary_key=True)                    # 사용자 아이디
    user_pwd = db.Column(db.String(128), nullable=False)                    # 사용자 패스워드(hash 양방향 암호)
    user_nm = db.Column(db.String(20), nullable=False)                      # 사용자명
    user_gr = db.Column(db.String(4), nullable=False)                       # 사용자 등급(TBL_COMMON)
    user_dept_nm = db.Column(db.String(30), nullable=False)                 # 사용자 부서명
    user_conn_date = db.Column(db.DateTime, default=datetime.now())         # 사용자 로그인한 시간(90일 미접속 시 휴면계정 전환 체크)
    user_dor_acc = db.Column(db.String(1), nullable=False, default="N")     # 사용자 휴먼계정여부
    user_pwd_change_dt = db.Column(db.DateTime, default=datetime.now())     # 사용자 비밀번호 변경 일자
    user_ip = db.Column(db.String(15), nullable=True)                       # 사용자 IP
    user_mac = db.Column(db.String(12), nullable=True)                      # 사용자 MAC
    user_yn = db.Column(db.String(1), nullable=False, default="Y")          # 사용자 활성화/비활성화(default:Y)
    user_auth = db.Column(db.Boolean, nullable=False, default=False)        # 사용자 접속 현황
    group_id = db.Column(db.Integer, nullable=True, default=0)              # 사용자 소속 group_id (arnold)
    parking_id = db.Column(db.Integer, nullable=True, default=0)            # 사용자 소속 site (arnold)
    create_user_id =    db.Column(db.String(20),nullable=True)              # 생성자 아이디(나를 생성한 아이디)
    user_disk =         db.Column(db.Integer, nullable=True, default=0)     # 사용자 디스크 용량
    user_settop =       db.Column(db.Integer, nullable=True, default=0)     # 사용자 등록 셋탑 수
    user_reg_user_cnt = db.Column(db.Integer, nullable=True, default=0)     # 사용자 등록 생성 유저 수
    now_user =          db.Column(db.Integer, nullable=True, default=0)     # 현재 등록 유저수
    now_disk =          db.Column(db.Integer, nullable=True, default=0)     # 현재 사용 디스크
    now_settop =        db.Column(db.Integer, nullable=True, default=0)     # 현재 등록 세탑수
    user_M = db.Column(db.String(1), nullable=True, default="Y")            # User contents Movie
    user_I = db.Column(db.String(1), nullable=True, default="Y")            # User contents Image
    user_T = db.Column(db.String(1), nullable=True, default="Y")            # User contents subTitle
    user_W = db.Column(db.String(1), nullable=True, default="Y")            # User contents WEB
    user_L = db.Column(db.String(1), nullable=True, default="Y")            # User contents LIVE
    user_G = db.Column(db.String(1), nullable=True, default="Y")            # User contents GROUP
    rgt_dt = db.Column(db.DateTime, default=datetime.now())
    mdfy_dt = db.Column(db.DateTime, default=datetime.now())

    def __init__(self, user_id, user_pwd, user_nm, user_gr, user_dept_nm, create_user_id, user_disk, user_settop, user_reg_user_cnt, rgt_dt, mdfy_dt):

        self.user_id = user_id
        self.set_password(user_pwd)
        self.user_nm = user_nm
        self.user_gr = user_gr
        self.user_dept_nm = user_dept_nm
        self.create_user_id = create_user_id
        self.user_disk = user_disk
        self.user_settop = user_settop
        self.user_reg_user_cnt = user_reg_user_cnt
        self.rgt_dt = rgt_dt
        self.mdfy_dt = mdfy_dt

    def set_password(self, password):
        self.user_pwd = generate_password_hash(password)

    def set_dor_acc(self):
        self.user_dor_acc = "N"
        self.user_conn_date = None

    def check_id_pwd(self, user_id):
        return check_password_hash(self.user_pwd, user_id)

    def check_password(self, password):
        return check_password_hash(self.user_pwd, password)

    def check_time(self):
        sql = """
        select DATEDIFF( NOW(), user_conn_date ) AS DiffDo,  DATEDIFF( NOW(), user_pwd_change_dt ) AS DiffPw  
        from tbl_user 

        """
        sql += "where user_id = '" + self.user_id + "'"

        return db.engine.execute(text(sql))


    @classmethod
    def update_user_settop_usage(cls, user_id, settop_cnt):
        sql = """
            UPDATE tbl_user 
            SET now_settop = now_settop + :settop_cnt
            WHERE user_id = :user_id
        """
        return db.engine.execute(text(sql), {'user_id':user_id, 'settop_cnt':settop_cnt})

    @classmethod
    def get_password(cls, user_id, user_nm, user_dept_nm):
        sql = """
            select user_pwd 
            from tbl_user
            where user_nm = :user_nm and user_dept_nm = :user_dept_nm and user_id = :user_id
        """
        return db.engine.execute(text(sql), {'user_nm':user_nm, 'user_dept_nm':user_dept_nm, 'user_id':user_id})

    @classmethod
    def find_by_id(cls, user_id):
        return cls.query.filter_by(user_id=user_id).first()

    @classmethod
    def get_user_gr(cls, user_id):
        sql = """
            select user_gr
            from tbl_user
            where user_id = :user_id
        """
        return db.engine.execute(text(sql), {'user_id' :user_id})

    @classmethod
    def get_create_user_id(cls, user_id):
        sql = """
            select create_user_id
            from tbl_user
            where user_id = :user_id
        """
        return db.engine.execute(text(sql), {'user_id' :user_id})

    @classmethod
    def get_sum_user_disk(cls, user_id):
        sql = """
            select sum(user_disk) sum_disk
            from tbl_user 
            where create_user_id = :user_id and user_id != :user_id
        
        """
        return db.engine.execute(text(sql), {'user_id' :user_id})
        
    @classmethod
    def get_sum_user_settop(cls, user_id):
        sql = """
            select sum(user_settop) sum_settop
            from tbl_user 
            where create_user_id = :user_id and user_id != :user_id
        
        """
        return db.engine.execute(text(sql), {'user_id' :user_id})

    # @classmethod
    # def get_sum_now_settop(cls, user_id):
    #     sql = """
    #         select sum(now_settop) sum_now_settop
    #         from tbl_user 
    #         where create_user_id = :user_id or user_id = :user_id
        
    #     """
    #     return db.engine.execute(text(sql), {'user_id' :user_id})

    @classmethod
    def get_config_by_user_id(cls, user_id):
        sql = """
            select user_M, user_I, user_T, user_W, user_L, user_G  
            from tbl_user 
            WHERE user_id = :user_id
        """
        return db.engine.execute(text(sql), {'user_id':user_id})

    @classmethod
    def find_all_user_count(cls, params):
        user_id, user_nm, user_gr, group_id = params

        sql = """
            select count(*) tot_cnt
            from tbl_user a
            where a.user_gr != "0101"
            """

        if user_id:
            sql += "and a.user_id like '%" + user_id + "%'"
        elif user_nm:
            sql += " and a.user_nm like '%" + user_nm + "%'"
        elif user_gr:
            sql += " and a.user_gr like '%" + user_gr + "%'"
        elif group_id:
            sql += " and a.group_id = '" + group_id + "'"
        
        if current_user.user_gr != "0101":
            sql += " and (a.user_id = '"+current_user.user_id+"' or a.create_user_id = '"+current_user.user_id+"')"

        print("find_all_user_count list sql >>" + sql)

        return db.engine.execute(text(sql))

    @classmethod
    def find_all_user(cls, params):
        user_id, user_nm, user_gr, group_id, start, length = params

        sql = """
             select row_number() OVER(order by a.user_gr, a.user_id) row_cnt,
                    a.user_id,a.user_nm,case when a.user_yn = 'Y' then '사용' else '미사용' end user_yn, a.user_pwd,a.parking_id, 
                    a.user_reg_user_cnt, a.create_user_id, a.user_settop, a.user_disk,
                    a.user_gr,a.user_dept_nm,a.user_ip,a.user_mac,date_format(a.rgt_dt, '%Y-%m-%d') rgt_dt,
                    a.now_disk, a.now_settop, a.now_user,
                    date_format(a.user_conn_date, '%Y-%m-%d') user_conn_date, a.user_dor_acc
             from tbl_user a
             where a.user_gr != "0101"
               
        """
        if user_id:
            sql += "and a.user_id like '%"+user_id+"%'"
        elif user_nm:
            sql += " and a.user_nm like '%"+user_nm+"%'"
        elif user_gr:
            sql += " and a.user_gr like '%"+user_gr+"%'"
        elif group_id:
            sql += " and a.group_id = '" + group_id + "'"

        if current_user.user_gr == "0103":
            sql += " and a.user_id = '"+current_user.user_id+"' "

        if current_user.user_gr == "0102":
            sql += " and (a.user_id = '"+current_user.user_id+"' or  a.create_user_id = '"+current_user.user_id+"')"

        if int(length) > 0:
            sql += " order by a.user_gr, a.user_id limit " + str(length) + " offset " + str(start)

        print("find_all_user list sql >>" + sql)

        return db.engine.execute(text(sql))

    def is_active(self):
        return True

    def get_id(self):
        return self.user_id

    def is_authenticated(self):
        return self.user_auth

    # save
    def save_to_db(self):
        db.session.add(self)
        db.session.commit()

    # delete
    def delete_to_db(self):
        db.session.delete(self)
        db.session.commit()

    @classmethod
    def get_user_code(cls, user_gr):

        return db.session.query(cls.user_id, cls.user_nm, CodeModel.comm_nm)\
                         .join(CodeModel, cls.user_gr == CodeModel.comm_cd) \
                         .filter(cls.user_gr.in_(user_gr))\
                         .filter(CodeModel.comm_up_cd == '0100').all()

    # 가앰점 매핑 유저 조회
    @classmethod
    def find_local_user_all(cls, params):
        user_id, user_nm, start, length = params

        sql = """
             select row_number() OVER(order by a.user_id) row_cnt,
              a.user_nm, a.user_id, ifnull(b.parking_cnt,0)parking_cnt, ifnull(b.dev_cnt,0)dev_cnt
            from tbl_user a left outer join (
                    select a.user_id, count(*) parking_cnt,max(b.dev_cnt)dev_cnt
                    from tbl_parking a left outer join (
                        select parking_id, count(*) dev_cnt 
                        from tbl_device
                        where use_yn = "Y"
                        group by parking_id
                )b on a.parking_id = b.parking_id
                group by a.user_id
            )b on a.user_id = b.user_id
            where a.user_gr = '0103'
            """
        if user_id:
            sql += "and a.user_id like '%" + user_id + "%'"
        elif user_nm:
            sql += " and a.user_nm like '%" + user_nm + "%'"

        if int(length) > 0:
            sql += " order by a.user_gr, a.user_id limit " + str(length) + " offset " + str(start)
        return db.engine.execute(text(sql))


    # 가앰점 매핑 유저 개수 조회
    @classmethod
    def find_local_user_cnt(cls, params):
        user_id, user_nm = params

        sql = """
                 select count(*) tot_cnt
                   from tbl_user a left outer join (
                           select a.user_id, count(*) parking_cnt,max(b.dev_cnt)dev_cnt
                           from tbl_parking a left outer join (
                               select parking_id, count(*) dev_cnt 
                               from tbl_device
                               where use_yn = "Y"
                               group by parking_id
                       )b on a.parking_id = b.parking_id
                       group by a.user_id
                   )b on a.user_id = b.user_id
                   where a.user_gr = '0103'
            """
        if user_id:
            sql += "and a.user_id like '%" + user_id + "%'"
        elif user_nm:
            sql += " and a.user_nm like '%" + user_nm + "%'"

        return db.engine.execute(text(sql))

    # 데이터 사용량(now_disk) 갱신 (6/21 김동수 추가)
    @classmethod
    def update_now_disk(cls, user_id, user_gr):
        sql = """
                update
                    tbl_user
                set
            """
        sql2 = """
                where
                    user_id = :user_id
             """
             
        # 관리자가 아닌 경우     
        if user_gr != '0102':
            sql += ("now_disk = (select sum(cont_size) from tbl_contents where user_id = :user_id and cont_yn='Y')" + sql2)
        # 관리자인 경우
        else:
            sql += ("now_disk = ifnull((select sum from (select sum(c.cont_size) as sum from tbl_user u, tbl_contents c where u.user_id = c.user_id and (u.create_user_id=:user_id  or u.user_id=:user_id) and c.cont_yn='Y') tmp),0)" + sql2)
                
        db.engine.execute(text(sql), {'user_id':user_id, 'user_gr':user_gr}) 
        print(sql)
        return 'update_now_disk success'

    # 하위 사용자 수(now_user) 갱신 (6/22 김동수 추가)
    @classmethod
    def update_now_user(cls, user_id):
        if current_user.create_user_id == user_id:
            sql = """
                update
                    tbl_user
                set
                    now_user = (select count from (select count(*) as count from tbl_user where create_user_id = :user_id) tmp)
                where
                    user_id = :user_id
            """  
        else:
            sql = """
                    update
                        tbl_user
                    set
                        now_user = (select count+1 from (select count(*) as count from tbl_user where create_user_id = :user_id) tmp)
                    where
                        user_id = :user_id
                """
        print(sql)
        db.engine.execute(text(sql), {'user_id':user_id}) 
        return 'update_now_user success'

    # 셋톱 갯수(now_settop) 갱신 (6/22 김동수 추가)
    def update_now_settop(cls, user_id, user_gr):
        sql = """
                update
                    tbl_user
                set
            """
        sql2 = """
                where
                    user_id = :user_id
             """
             
        # 관리자가 아닌 경우     
        if user_gr != '0102':
            sql += ("now_settop = (select count(*) from tbl_device where use_yn = 'Y' and user_id = :user_id)" + sql2)
        # 관리자인 경우
        else:
            sql += ("now_settop = (select count from (select count(*) as count from tbl_user u, tbl_device d where d.use_yn = 'Y' and u.user_id = d.user_id and (u.create_user_id=:user_id  or u.user_id=:user_id)) tmp)" + sql2)
                
        db.engine.execute(text(sql), {'user_id':user_id, 'user_gr':user_gr}) 
        return 'update_now_settop success'