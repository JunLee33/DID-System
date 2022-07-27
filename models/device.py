from datetime import datetime
from email.policy import default
from re import split
from core.db import db
from sqlalchemy.sql import text
from sqlalchemy import func
from flask_login import current_user

# +--------------------+-------------+------+-----+---------+-------+
# | Field              | Type        | Null | Key | Default | Extra |
# +--------------------+-------------+------+-----+---------+-------+
# | dev_id             | varchar(40) | NO   | PRI | NULL    |       |
# | dev_nm             | varchar(20) | YES  |     | NULL    |       |
# | dev_cmt            | varchar(50) | YES  |     | NULL    |       |
# | device_group_id    | int         | YES  | MUL | 0       |       |
# | device_type        | varchar(4)  | YES  |     | NULL    |       |
# | device_location    | varchar(50) | YES  |     | NULL    |       |
# | device_longitude   | varchar(13) | YES  |     | NULL    |       |
# | device_latitude    | varchar(13) | YES  |     | NULL    |       |
# | device_ncps        | varchar(20) | YES  |     | NULL    |       |
# | device_sw_ver      | varchar(4)  | YES  |     | NULL    |       |
# | device_cpu         | varchar(20) | YES  |     | NULL    |       |
# | device_disk_total  | varchar(20) | YES  |     | NULL    |       |
# | device_disk_used   | varchar(20) | YES  |     | NULL    |       |
# | device_mem_total   | varchar(20) | YES  |     | NULL    |       |
# | device_mem_used    | varchar(20) | YES  |     | NULL    |       |
# | device_play_status | varchar(4)  | YES  |     | NULL    |       |
# | device_conn        | datetime    | YES  |     | NULL    |       |
# | user_id            | varchar(20) | YES  | MUL | NULL    |       |
# | parking_id         | int         | YES  |     | 0       |       |
# | rgt_dt             | datetime    | YES  |     | NULL    |       |
# | mdfy_dt            | datetime    | YES  |     | NULL    |       |
# +--------------------+-------------+------+-----+---------+-------+

class DeviceModel(db.Model):
    __tablename__ = 'tbl_device'

    dev_id = db.Column(db.String(40), primary_key=True)                         # 장치아이디(램덤키 발급)
    dev_nm = db.Column(db.String(20), nullable=True)                            # 장치명
    dev_cmt = db.Column(db.String(50), nullable=True)                           # 장치코멘트
    device_group_id =  db.Column(db.Integer, nullable=True, default=0)          # ** group id ==> d1 depth, just management.
    device_type = db.Column(db.String(4), nullable=True)                        # 장치 타입 0601, HD 가로형, 0602, HD 세로형 , 0603, CUSTOM
    device_location = db.Column(db.String(100), nullable=True)                  # 주소정보 
    device_longitude = db.Column(db.String(13), nullable=True)                  # 경도 
    device_latitude = db.Column(db.String(13), nullable=True)                   # 위도
    device_ncps = db.Column(db.String(20), nullable=True)                       # 전원장치명
    device_sw_ver = db.Column(db.String(20), nullable=True)                     # 소프트웨어 버젼
    device_cpu = db.Column(db.String(20), nullable=True)                        # version
    device_disk_total =db.Column(db.String(20), nullable=True)                  # disk total
    device_disk_used = db.Column(db.String(20), nullable=True)                  # disk used
    device_mem_total = db.Column(db.String(20), nullable=True)                  # mem total
    device_mem_used = db.Column(db.String(20), nullable=True)                   # mem used
    device_play_status =db.Column(db.String(4), nullable=True, default='NON')   # 장치상태 'OPR'-정상 , 'ERR', 'NON'
    device_conn = db.Column(db.String(1), nullable=True)                        # connection status Y / N  ==> 등록 후 인증시에만 Y FLAG
    device_conn_dt = db.Column(db.DateTime, nullable=True)                      # connection 최종 날짜 
    user_id = db.Column(db.String(50), nullable=True)                           # ** 사용자 아이디 (foreign key)
    organ_id = db.Column(db.Integer, nullable=True, default=0)                  # organ 정보 입력. (not foreign key)
    device_control = db.Column(db.String(20), nullable=True)                    # device control 내역 (최종)
    parking_id =  db.Column(db.Integer, nullable=True, default=0)               # group depth 1 을 주차장으로 정의해서 사이트로 정리.  (일단 사이트 정보)
    use_yn = db.Column(db.String(1), nullable=True, default='Y')                # device use.Y/N
    rgt_dt = db.Column(db.DateTime, default=datetime.now())
    mdfy_dt = db.Column(db.DateTime, default=datetime.now())

    def __init__(self, dev_id, dev_nm, dev_cmt, device_group_id, device_type, device_location,
                device_longitude , device_latitude , device_disk_total, device_mem_total, device_ncps, user_id, rgt_dt, mdfy_dt):

        self.dev_id = dev_id
        self.dev_nm = dev_nm
        self.dev_cmt = dev_cmt
        self.device_group_id = device_group_id
        self.device_type = device_type
        self.device_location = device_location
        self.device_longitude = device_longitude
        self.device_latitude = device_latitude
        self.device_disk_total = device_disk_total
        self.device_mem_total = device_mem_total
        self.device_ncps = device_ncps
        self.user_id = user_id
        self.rgt_dt = rgt_dt
        self.mdfy_dt = mdfy_dt

    # 기존 모든 단말 무조건 검색에서 dev_horizon 적용 (arnold)
    @classmethod
    def get_device_list(cls,dev_horizon):
        return cls.query.filter_by(dev_horizon=dev_horizon).all()

    # device_list by user_id 
    @classmethod
    def get_settop_list_by_id(cls, user_id):
        sql = '''
            SELECT dev_id
            FROM tbl_device a, tbl_user b
            WHERE a.use_yn = "Y"
            and a.user_id = b.user_id
        '''
        if current_user.user_gr == '0102':
            sql += " and (b.create_user_id = '" + user_id + "' or a.user_id = '" + user_id + "')"
        if current_user.user_gr == '0103':
            sql += "and a.user_id = '" + user_id + "'"
        
        # print("get_group_list_user_id --> "+sql)

        return db.engine.execute(text(sql))

    # NOW DEVICE ACTIVE (API RESPONSED)DEVICE COUNT
    @classmethod
    def get_current_device_cnt(cls):
        sql = '''
            SELECT count(a.dev_id) cnt
            FROM tbl_device a, tbl_user b
            WHERE a.use_yn = "Y"
                and DATE_SUB(NOW(), INTERVAL 10 MINUTE) < a.device_conn_dt
                and a.user_id = b.user_id and device_conn =  'Y'
        '''
        if current_user.user_gr == '0102':
            sql += " and (b.create_user_id = '" + current_user.user_id + "' or a.user_id = '" + current_user.user_id + "')"
        if current_user.user_gr == '0103':
            sql += "and a.user_id = '" + current_user.user_id + "'"
        
        sql += " group by a.dev_id "

        return db.engine.execute(text(sql))

    # NOW DEVICE FAULT (API RESPONSED)DEVICE COUNT
    @classmethod
    def get_current_fault_device_cnt(cls):
        sql = '''
            SELECT count(dev_id) cnt
            FROM tbl_device a, tbl_user b
            WHERE a.use_yn = "Y"
                and DATE_SUB(NOW(), INTERVAL 24 HOUR) > device_conn_dt
                and a.user_id = b.user_id and device_conn = 'Y' 
        '''
        if current_user.user_gr == '0102':
            sql += " and (b.create_user_id = '" + current_user.user_id + "' or a.user_id = '" + current_user.user_id + "')"
        if current_user.user_gr == '0103':
            sql += "and a.user_id = '" + current_user.user_id + "'"
        
        sql += " group by dev_id "

        return db.engine.execute(text(sql))

    # NOW DEVICE ACTIVE (API RESPONSED)DEVICE COUNT
    @classmethod
    def get_current_device_total(cls):
        sql = '''
            SELECT count(a.dev_id) cnt
            FROM tbl_device a, tbl_user b
            WHERE a.use_yn = "Y"
                and a.user_id = b.user_id and device_conn = 'Y'
        '''
        if current_user.user_gr == '0102':
            sql += " and (b.create_user_id = '" + current_user.user_id + "' or a.user_id = '" + current_user.user_id + "')"
        if current_user.user_gr == '0103':
            sql += "and a.user_id = '" + current_user.user_id + "'"


        return db.engine.execute(text(sql))

        
    @classmethod
    def get_device_list_user_id(cls,user_id):
        sql = '''
            SELECT dev_id, dev_nm
            FROM tbl_device
            WHERE use_yn = "Y"
                and user_id = :user_id
        '''
        return db.engine.execute(text(sql),{'user_id':user_id})
    
    # 최초 Device ID로 등록된 단말 접속 / 상태 update & 접속 날짜 입력
    @classmethod
    def device_authentication(cls,device_id):
        sql = '''
            UPDATE tbl_device
            SET device_conn = 'Y', device_conn_dt = NOW(), mdfy_dt = NOW()
            WHERE dev_id = :device_id
        '''
        return db.engine.execute(text(sql),{'device_id':device_id})

    @classmethod
    def find_by_USE_id(cls, dev_id):
        sql = '''
            SELECT * FROM tbl_device
            WHERE dev_id = :device_id
            and use_yn = "Y"
        '''
        return db.engine.execute(text(sql),{'device_id':dev_id})

    @classmethod
    def find_by_id(cls, dev_id):
        return cls.query.filter_by(dev_id=dev_id).first()

    @classmethod
    def find_by_serial(cls, serial):
        return cls.query.filter_by(dev_seri=serial).first()

    @classmethod
    def find_by_ethe_mac(cls, dev_ethe_mac):
        return cls.query.filter_by(dev_ethe_mac=dev_ethe_mac).first()
    

    # List 구성을 위한 organ COUNT ############################################  0823
    @classmethod
    def organ_by_dev_id_cnt(cls, dev_id):

        sql = """   
            select count(*) tot_cnt
            FROM (
                SELECT row_number() OVER(order by a.rgt_dt desc) row_cnt,
                    a.sch_id, group_concat(DISTINCT a.organ_nm) organ_nm,
                    group_concat(DISTINCT date_format(b.sch_st_date,'%Y-%m-%d')) sch_st_date,
                    group_concat(DISTINCT date_format(b.sch_ed_date,'%Y-%m-%d')) sch_ed_date,
                    group_concat(DISTINCT date_format(a.rgt_dt,'%Y-%m-%d')) rgt_dt, 
                    group_concat(DISTINCT a.organ_st_dt) organ_st_dt, group_concat(DISTINCT a.organ_ed_dt) organ_ed_dt, 
                    group_concat(DISTINCT a.user_id) user_id, count(DISTINCT dev_id) dev_cnt
                FROM tbl_organic a, tbl_schedule b, tbl_schedule_dep c
                WHERE  a.sch_id = b.sch_id and c.sch_id = b.sch_id and c.dev_id = :dev_id and c.sch_id = b.sch_id and c.use_yn = "Y" AND sch_ed_date > now()
                GROUP BY a.sch_id, a.rgt_dt
            )e
            WHERE 1=1
            """
        # print("get_organic_all_cnt sql ==> "+sql)

        return db.engine.execute(text(sql),{'dev_id':dev_id})

    @classmethod
    def organ_by_dev_id(cls, dev_id, length, start):
        sql = '''
            SELECT row_number() OVER(order by a.rgt_dt desc) row_cnt,
                a.sch_id, group_concat(DISTINCT a.organ_nm) organ_nm,
                group_concat(DISTINCT date_format(b.sch_st_date,'%Y-%m-%d')) sch_st_date,
                group_concat(DISTINCT date_format(b.sch_ed_date,'%Y-%m-%d')) sch_ed_date,
                group_concat(DISTINCT date_format(a.rgt_dt,'%Y-%m-%d')) rgt_dt, 
                group_concat(DISTINCT a.organ_st_dt) organ_st_dt, group_concat(DISTINCT a.organ_ed_dt) organ_ed_dt, 
                group_concat(DISTINCT a.user_id) user_id, count(DISTINCT dev_id) dev_cnt
            FROM tbl_organic a, tbl_schedule b, tbl_schedule_dep c
            WHERE  a.sch_id = b.sch_id and c.sch_id = b.sch_id and c.dev_id = :dev_id and c.sch_id = b.sch_id and c.use_yn = "Y" AND sch_ed_date > now()
            GROUP BY a.sch_id, a.rgt_dt
        '''

        if int(length) > 0:
            sql += "limit " + str(length) + " offset " + str(start)

        return db.engine.execute(text(sql),{'dev_id':dev_id})


    #셋탑 전체 조회 갯수 카운트
    @classmethod
    def get_set_top_count(cls, params):
        device_group_id, dev_nm, dev_id, dev_cmt, dev_ethe_mac, user_gr = params

        sql_old = '''
            select count(*) tot_cnt
                from (
                        select  row_number() OVER(order by c.parking_nm desc) row_cnt,
                                a.dev_id, a.dev_nm, a.dev_cmt,
                                case when a.device_conn = 'N' and a.parking_id is null then '5'       /*입고*/ 
                                    when a.device_conn = 'Y' and a.parking_id is null then '4'       /*접속*/
                                    when TIMESTAMPDIFF(minute, a.device_conn_dt , now()) > 30 then '3'        /*장애*/
                                    when TIMESTAMPDIFF(minute, a.device_conn_dt , now()) <= 30 then '2' /*정상*/                                                                                                           
                                end device_conn,
                            date_format(a.device_conn_dt,'%%Y-%%m-%%d %%H:%%i') device_conn_dt, c.parking_id,
                            c.parking_nm, b.user_id, b.user_nm
                        from tbl_device a left outer join tbl_parking c on a.parking_id = c.parking_id
                                                    left outer join tbl_user b on b.user_id = c.user_id 
                    )a                                              
                where 1=1 
        '''

        # Total count 
        sql = '''
            SELECT count(*) tot_cnt
            FROM tbl_device a, tbl_user b
            WHERE a.use_yn = "Y"
                and a.user_id = b.user_id
        '''
        # if tab_gbn != "1":
        #     # 전체 조회 탭이 아닌경우
        #     sql += " and a.device_conn = '"+str(tab_gbn)+"' \n"
        if device_group_id:
            sql += " and a.device_group_id ='" + device_group_id + "' \n"
        if dev_nm:
            sql += " and a.dev_nm like '%" + dev_nm + "%' \n"
        if dev_id:
            sql += " and a.dev_id like '%" + dev_id + "%' \n"
        if dev_cmt:
            sql += " and a.dev_cmt like '%" + dev_cmt + "%' \n"
        if dev_ethe_mac:
            sql += " and a.dev_ethe_mac like '%" + dev_ethe_mac + "%' \n"
        if current_user.user_gr == '0102':
            sql += " and (b.create_user_id = '" + current_user.user_id + "' or a.user_id = '" + current_user.user_id + "')"
        if current_user.user_gr == '0103':
            sql += "and a.user_id = '" + current_user.user_id + "'"

        # print(sql)
        return db.engine.execute(text(sql))

    # 셋탑 전체 조회
    @classmethod
    def get_set_top_list(cls, params):
        device_group_id, dev_nm, dev_id, dev_cmt, dev_ethe_mac, start, length, user_gr = params

        
        sql = '''
             SELECT  row_number() OVER(order by a.device_conn_dt DESC) row_cnt,
                    a.dev_nm, a.dev_id, a.dev_cmt, ifnull(a.device_location,""), a.device_longitude, a.device_latitude,
                    a.device_disk_used as device_disk, a.device_cpu, a.device_mem_used, a.device_sw_ver, a.device_play_status, 
                    case when TIMESTAMPDIFF(minute, a.device_conn_dt , now()) > 1440 then '3'     /*장애*/
						 when TIMESTAMPDIFF(minute, a.device_conn_dt , now()) between 10 and 1440 then '4'    /*오프라인*/
                         when TIMESTAMPDIFF(minute, a.device_conn_dt , now()) <= 10 then '2'    /*정상*/
                         when  a.device_conn_dt IS NULL then '5'
                    end device_conn, a.organ_id, a.device_control,
                    a.parking_id,a.user_id, b.create_user_id, a.device_type
            FROM tbl_device a, tbl_user b
            WHERE a.use_yn = "Y"
            AND a.user_id = b.user_id
            '''
        # if tab_gbn != "1":
        #     # 전체 조회 탭이 아닌경우
        #     sql += " and a.device_conn = '"+str(tab_gbn)+"' \n"
        
        if device_group_id:
            checkd = device_group_id.split("|")
            if len(checkd) > 2 :
                for i in range(len(checkd)):
                    if i == 0 :
                        sql += " AND (a.device_group_id = '" + checkd[i] + "' \n"
                    elif i == len(checkd)-2:
                        sql += " OR a.device_group_id = '" + checkd[i] + "') \n"
                    elif i == len(checkd) -1:
                        print(sql)
                    else :
                        sql += " OR a.device_group_id = '" + checkd[i] + "' \n"
            else :
                print(checkd[0])
                sql += " and a.device_group_id ='" + checkd[0] + "' \n"
        if dev_nm:
            sql += " and a.dev_nm like '%" + dev_nm + "%' \n"
        if dev_id:
            sql += " and a.dev_id like '%" + dev_id + "%' \n"
        if dev_cmt:
            sql += " and a.dev_cmt like '%" + dev_cmt + "%' \n"
        if dev_ethe_mac:
            sql += " and a.dev_ethe_mac like '%" + dev_ethe_mac + "%' \n"

        if start is not None:
            if int(length) > 0:
                sql += " limit " + str(length) + " offset " + str(start)
        if current_user.user_gr == '0102':
            sql += " and (b.create_user_id = '" + current_user.user_id + "' or a.user_id = '" + current_user.user_id + "')"
        if current_user.user_gr == '0103':
            sql += "and a.user_id = '" + current_user.user_id + "'"
        sql += "order by row_cnt ASC"

        return db.engine.execute(text(sql))

    # 셋탑 excel back up 용
    # 셋탑 전체 조회
    @classmethod
    def excel_set_top_list(cls, user_id):
        sql = '''
             SELECT  a.dev_id, a.dev_nm, a.dev_cmt, ifnull(a.device_location,"") device_location, a.device_longitude, a.device_latitude,
                    a.device_type,  a.device_group_id
            FROM tbl_device a, tbl_user b
            WHERE a.use_yn = "Y"
                and a.user_id = b.user_id
            '''
        if current_user.user_gr == '0102':
            sql += " and (b.create_user_id = :user_id or a.user_id = :user_id )"
        if current_user.user_gr == '0103':
            sql += "and a.user_id = :user_id "

        return db.engine.execute(text(sql), {"user_id": user_id})

    # 그룹트리 갯수 넣기용 카운트
    @classmethod
    def group_device_cnt(cls):
        sql = '''
            select count(a.dev_id) cnt, a.device_group_id 
            from tbl_device a, tbl_user b
            where a.use_yn = "Y"
                and a.user_id = b.user_id
            '''
        if current_user.user_gr == '0102':
            sql += "and (b.create_user_id = '" + current_user.user_id + "' or a.user_id = '" + current_user.user_id + "')"
        if current_user.user_gr == '0103':
            sql += "and a.user_id = '" + current_user.user_id + "'"
        
        sql += "group by a.device_group_id"
        
        return db.engine.execute(text(sql))

    # 그래프 그리기용 갯수 파악
    @classmethod
    def cnt_device_status(cls):
        sql = ''' 
            select date_format(c.stat_date,'%Y-%m-%d %H:%i') stat_date, count(DISTINCT c.dev_id) 
            from GSTECH.tbl_statistics_summary_gs c, tbl_device a, tbl_user b
            WHERE a.use_yn = "Y"
            and date(c.stat_date) = date(now())
            and a.user_id = b.user_id

        '''
        if current_user.user_gr == '0102':
            sql += " and (b.create_user_id = '" + current_user.user_id + "' or a.user_id = '" + current_user.user_id + "')"
            sql += " and a.dev_id = c.dev_id"
        if current_user.user_gr == '0103':
            sql += "and a.user_id = '" + current_user.user_id + "'"
            sql += "and a.dev_id = c.dev_id"
        
        sql += " group by stat_date"

        return db.engine.execute(text(sql))

    # 셋탑박스 SELECT용 리스트
    @classmethod
    def get_select_device_list(cls, user_id):

        sql = ''' 
            SELECT a.dev_id, a.dev_nm, a.dev_cmt, a.device_group_id
            FROM tbl_device a, tbl_user b
            WHERE a.use_yn = "Y"
                and a.user_id = b.user_id
         '''

        if current_user.user_gr == '0102':
            sql += " and (b.create_user_id = '" + user_id + "' or a.user_id = '" + user_id + "')"
        if current_user.user_gr == '0103':
            sql += "and a.user_id = '" + user_id + "'"

        return db.engine.execute(text(sql),{"user_id": user_id})
        
    # UPDATE device use_yn ############################################  0914 셋탑 삭제입니다 // JUN
    @classmethod
    def update_device_use(cls, dev_id):

        sql = '''
            UPDATE tbl_device
            SET use_yn = "N"
            WHERE dev_id = :dev_id
            '''

        return db.engine.execute(text(sql),{"dev_id" : dev_id})
    


    @classmethod
    def bulk_insert(cls, multi_insert):
        db.session.bulk_save_objects(multi_insert)
        db.session.commit()

    def session_begin(self):
        db.session.begin()

    def session_rollback(self):
        db.session.rollback()

    # save
    def save_to_db(self):
        db.session.add(self)
        db.session.commit()

    # delete
    def delete_to_db(self):
        db.session.delete(self)
        db.session.commit()

# +--------------------+-------------+------+-----+---------+----------------+
# | Field              | Type        | Null | Key | Default | Extra          |
# +--------------------+-------------+------+-----+---------+----------------+
# | device_group_id    | int         | NO   | PRI | NULL    | auto_increment |
# | device_group_nm    | varchar(20) | NO   |     | NULL    |                |
# | device_group_up_cd | int         | NO   |     | 0       |                |
# | device_group_depth | int         | NO   |     | 0       |                |
# | user_id            | varchar(20) | NO   |     | NULL    |                |
# | rgt_dt             | datetime    | NO   |     | NULL    |                |
# | mdfy_dt            | datetime    | NO   |     | NULL    |                |
# +--------------------+-------------+------+-----+---------+----------------+

# tbl_device_group management model. 

class DeviceGroupModel(db.Model):
    __tablename__ = 'tbl_device_group'

    device_group_id = db.Column(db.Integer, primary_key=True, autoincrement=True)       # 장치아이디(램덤키 발급)
    device_group_nm = db.Column(db.String(20), nullable=False)                          # 장치명
    device_group_up_cd = db.Column(db.Integer, nullable=False, default=0)               # 상위 코드
    device_group_depth = db.Column(db.Integer, nullable=False, default=0)               # depth
    user_id = db.Column(db.String(50), nullable=False)                                  # ** 사용자 아이디 (foreign key)
    rgt_dt = db.Column(db.DateTime, default=datetime.now())
    mdfy_dt = db.Column(db.DateTime, default=datetime.now())

    def __init__(self, device_group_nm, device_group_up_cd, device_group_depth, user_id, rgt_dt, mdfy_dt):

        self.device_group_nm = device_group_nm
        self.device_group_up_cd = device_group_up_cd
        self.device_group_depth = device_group_depth
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
    
    @classmethod
    def find_by_id(cls, device_group_id):
        return cls.query.filter_by(device_group_id=device_group_id).first()

    # device_group_list (select box)
    @classmethod
    def get_settop_list_group_id(cls, user_id):
        sql = '''
            SELECT a.dev_id, a.device_group_id ,a.dev_nm, b.device_group_nm
            FROM tbl_device a, tbl_device_group b
            WHERE a.use_yn = "Y"
            and a.device_group_id = b.device_group_id AND b.user_id = :user_id
        '''
        # print("get_group_list_user_id --> "+sql)

        return db.engine.execute(text(sql), {"user_id": user_id})

    @classmethod
    def get_group_list_user_id(cls, user_id):
        sql = '''
            SELECT a.device_group_id, a.device_group_up_cd, a.device_group_nm
            FROM tbl_device_group a, tbl_user b
            WHERE a.user_id = b.user_id
        '''

        if current_user.user_gr == '0102':
            sql += " and (b.create_user_id = '" + user_id + "' or a.user_id = '" + user_id + "')"
        if current_user.user_gr == '0103':
            sql += "and a.user_id = '" + user_id + "'"
        

        return db.engine.execute(text(sql), {"user_id": user_id})

# mysql> desc tbl_device_shot;
# +--------------+-------------+------+-----+-------------------+-------------------+
# | Field        | Type        | Null | Key | Default           | Extra             |
# +--------------+-------------+------+-----+-------------------+-------------------+
# | shot_no      | int         | NO   | PRI | NULL              | auto_increment    |
# | dev_id       | varchar(45) | NO   | PRI | NULL              |                   |
# | shot_nm      | varchar(45) | YES  |     | NULL              |                   |
# | shot_url     | varchar(45) | YES  |     | NULL              |                   |
# | shot_thu_url | varchar(45) | YES  |     | NULL              |                   |
# | is_view      | varchar(1)  | NO   |     | Y                 |                   |
# | upload_yn    | varchar(1)  | NO   |     | N                 |                   |
# | create_dt    | datetime    | YES  |     | CURRENT_TIMESTAMP | DEFAULT_GENERATED |
# | modify_dt    | datetime    | YES  |     | CURRENT_TIMESTAMP | DEFAULT_GENERATED |
# +--------------+-------------+------+-----+-------------------+-------------------+
# Device screen shot management table

class DeviceShotModel(db.Model):
    __tablename__ = 'tbl_device_shot'
    
    shot_no = db.Column(db.Integer, primary_key=True, autoincrement=True)       # 스크린샷 no
    dev_id = db.Column(db.String(45), nullable=False)                           # 장치명
    shot_nm = db.Column(db.String(400), nullable=True)                           # 상위 코드
    shot_url = db.Column(db.String(400), nullable=True)                          # depth
    shot_thu_url = db.Column(db.String(400), nullable=True)                      # ** 사용자 아이디 (foreign key)
    is_view = db.Column(db.String(1), nullable=False,  default='Y')
    upload_yn = db.Column(db.String(1), nullable=False,  default='N')
    create_dt = db.Column(db.DateTime, default=datetime.now())
    modify_dt = db.Column(db.DateTime, default=datetime.now())

    def __init__(self, dev_id, shot_nm, shot_url, shot_thu_url, is_view, create_dt, modify_dt):

        self.dev_id = dev_id
        self.shot_nm = shot_nm
        self.shot_url = shot_url
        self.shot_thu_url = shot_thu_url
        self.is_view = is_view
        self.create_dt = create_dt
        self.modify_dt = modify_dt

     # save
    def save_to_db(self):
        db.session.add(self)
        db.session.commit()

    # delete
    def delete_to_db(self):
        db.session.delete(self)
        db.session.commit()
    
    @classmethod
    def find_by_no(cls, shot_no):
        return cls.query.filter_by(shot_no=shot_no).first()

    # @classmethod
    # def find_by_id(cls, dev_id):
    #     return cls.query.filter_by(dev_id=dev_id , is_view = 'N', upload_yn = 'N').order_by(cls.create_dt.desc).first()

    @classmethod
    def find_by_id(cls, dev_id):
        sql = """
            SELECT shot_no, shot_nm, shot_url, shot_thu_url
            FROM tbl_device_shot
            WHERE dev_id = :dev_id and is_view = 'Y' and upload_yn = 'N'
            ORDER BY create_dt desc limit 1
        """  
        return db.engine.execute(text(sql), {"dev_id": dev_id})


    @classmethod
    def update_by_id(cls, params):
        shot_nm, cont_url, cont_thu_url, shot_no = params
        sql = """
            UPDATE tbl_device_shot
            SET shot_nm = :shot_nm , shot_url = :cont_url , shot_thu_url = :cont_thu_url 
            WHERE shot_no = :shot_no
        """  
        return db.engine.execute(text(sql), {"shot_nm" :shot_nm , "cont_url":cont_url , "cont_thu_url":cont_thu_url, "shot_no":shot_no})

# mysql> desc tbl_device_log;
# +-------------+-------------+------+-----+-------------------+-------------------+
# | Field       | Type        | Null | Key | Default           | Extra             |
# +-------------+-------------+------+-----+-------------------+-------------------+
# | log_no      | int         | NO   | PRI | NULL              | auto_increment    |
# | dev_id      | varchar(45) | NO   | PRI | NULL              |                   |
# | log_nm      | varchar(45) | YES  |     | NULL              |                   |
# | log_url     | varchar(45) | YES  |     | NULL              |                   |
# | log_thu_url | varchar(45) | YES  |     | NULL              |                   |
# | is_view     | varchar(1)  | NO   |     | Y                 |                   |
# | upload_yn   | varchar(1)  | NO   |     | N                 |                   |
# | create_dt   | datetime    | YES  |     | CURRENT_TIMESTAMP | DEFAULT_GENERATED |
# | modify_dt   | datetime    | YES  |     | CURRENT_TIMESTAMP | DEFAULT_GENERATED |
# +-------------+-------------+------+-----+-------------------+-------------------+
class DeviceLogModel(db.Model):
    __tablename__ = 'tbl_device_log'
    
    log_no = db.Column(db.Integer, primary_key=True, autoincrement=True)       # 스크린샷 no
    dev_id = db.Column(db.String(45), nullable=False)                           # 장치명
    log_nm = db.Column(db.String(400), nullable=True)                           # 상위 코드
    log_url = db.Column(db.String(400), nullable=True)                          # depth
    log_thu_url = db.Column(db.String(400), nullable=True)                      # ** 사용자 아이디 (foreign key)
    is_view = db.Column(db.String(1), nullable=False,  default='Y')
    upload_yn = db.Column(db.String(1), nullable=False,  default='N')
    create_dt = db.Column(db.DateTime, default=datetime.now())
    modify_dt = db.Column(db.DateTime, default=datetime.now())

    def __init__(self, dev_id, log_nm, log_url, log_thu_url, is_view, create_dt, modify_dt):

        self.dev_id = dev_id
        self.log_nm = log_nm
        self.log_url = log_url
        self.log_thu_url = log_thu_url
        self.is_view = is_view
        self.create_dt = create_dt
        self.modify_dt = modify_dt

     # save
    def save_to_db(self):
        db.session.add(self)
        db.session.commit()

    # delete
    def delete_to_db(self):
        db.session.delete(self)
        db.session.commit()
    
    @classmethod
    def find_by_no(cls, log_no):
        return cls.query.filter_by(log_no=log_no).first()

    # @classmethod
    # def find_by_id(cls, dev_id):
    #     return cls.query.filter_by(dev_id=dev_id , is_view = 'N', upload_yn = 'N').orderby("create_dt desc").first()

    @classmethod
    def find_by_id(cls, dev_id):
        sql = """
            SELECT log_no, log_nm, log_url, log_thu_url
            FROM tbl_device_log
            WHERE dev_id = :dev_id and is_view = 'Y' and upload_yn = 'N'
            ORDER BY create_dt desc limit 1
        """  
        return db.engine.execute(text(sql), {"dev_id": dev_id})


    @classmethod
    def update_by_id(cls, params):
        log_nm, cont_url, cont_thu_url, log_no = params
        sql = """
            UPDATE tbl_device_log
            SET log_nm = :log_nm , log_url = :cont_url , log_thu_url = :cont_thu_url 
            WHERE log_no = :log_no
        """  
        return db.engine.execute(text(sql), {"log_nm" :log_nm , "cont_url":cont_url , "cont_thu_url":cont_thu_url, "log_no":log_no})



    


    
