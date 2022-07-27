from datetime import datetime
from core.db import db
from sqlalchemy.sql import text
from sqlalchemy import func


class LogModel(db.Model):
    __tablename__ = 'tbl_logs'
    __table_args__ = (
        db.Index('tbl_logs_rgt_dt_idx', 'rgt_dt', 'logs_menu'),
    )

    logs_seq = db.Column(db.BigInteger, primary_key=True, autoincrement=True)   # 로그 순번(Auto)
    logs_msg = db.Column(db.String(300), nullable=False)                        # 로그 메시지
    logs_menu = db.Column(db.String(4), nullable=False)                         # 로그 메뉴
    user_id = db.Column(db.String(20), db.ForeignKey('tbl_user.user_id'), nullable=False)  # 사용자 ID(TBL_USER)
    rgt_dt = db.Column(db.DateTime, default=datetime.now())

    def __init__(self, user_id, logs_msg, logs_menu):

        self.user_id = user_id
        self.logs_msg = logs_msg
        self.logs_menu = logs_menu
        self.rgt_dt = datetime.now()

    #로그 리스트 카운트
    @classmethod
    def get_logs_list_cnt(cls, params):
        log_msg, user_nm, start_log_date, end_log_date = params
        sql = """
                select count(*) tot_cnt 
                 from tbl_logs a, tbl_common b, tbl_user c
                where a.logs_menu = '0501'
                  and a.user_id = c.user_id
                  and b.comm_up_cd = '0500'
                  and a.logs_menu = b.comm_cd
              """
        if log_msg:
            sql += "and a.logs_msg like '%"+log_msg+"%' \n "
        if user_nm:
            sql += "and c.user_nm ='"+user_nm+"'\n"
        if start_log_date:
            sql += " and a.rgt_dt between '"+start_log_date +"' and '"+end_log_date +"' \n"

        return db.engine.execute(text(sql))

    # 로그 리스트
    @classmethod
    def get_logs_list(cls, params):
        log_msg, user_nm, start_log_date, end_log_date, start, length = params

        sql = """
                select row_number() over(order by a.rgt_dt) row_num,b.comm_nm menu_nm, a.logs_msg, 
                DATE_FORMAT(a.rgt_dt, '%Y-%m-%d %H:%i:%s') log_date, c.user_nm
                 from tbl_logs a, tbl_common b, tbl_user c
                where a.logs_menu = '0501'
                  and a.user_id = c.user_id
                  and b.comm_up_cd = '0500'
                  and a.logs_menu = b.comm_cd
              """

        if log_msg:
            sql += "and a.logs_msg like '%"+log_msg+"%' \n "
        if user_nm:
            sql += "and c.user_nm ='"+user_nm+"'\n"
        if start_log_date:
            sql += " and a.rgt_dt between '"+start_log_date +"' and '"+end_log_date +"' \n"

        if int(length) > 0:
            sql += " order by row_num desc limit " + str(length) + " offset " + str(start)

        # print("get_logs_list  sql >>" + sql)

        return db.engine.execute(text(sql))

    # save
    def save_to_db(self):
        db.session.add(self)
        db.session.commit()

    # delete
    def delete_to_db(self):
        db.session.delete(self)
        db.session.commit()
