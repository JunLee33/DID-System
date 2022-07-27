from datetime import datetime
from core.db import db
from sqlalchemy.sql import text
from sqlalchemy import func


class AppModel(db.Model):
    __tablename__ = 'tbl_app'

    app_id = db.Column(db.Integer, primary_key=True, autoincrement=True)   # 콘텐츠 순번(Auto)
    app_size = db.Column(db.Integer)                                        # 콘텐츠 사이즈
    app_version = db.Column(db.String(100), nullable=False)                 # 콘텐츠 버전
    app_nm = db.Column(db.String(40), nullable=False)                       # 콘텐츠명
    app_file_nm = db.Column(db.String(40), nullable=False)                  # 콘텐츠 원본명
    app_url = db.Column(db.String(100), nullable=False)                     # 콘텐츠 URL
    app_date = db.Column(db.DateTime, nullable=False)                       # 배포날짜
    app_dsp = db.Column(db.String(20), nullable=False)                      # 지역코드(TBL_AREA)
    app_stat = db.Column(db.String(4), nullable=False)                      # 배포상태 ('0201':배포준비, '0202':배포중, '0203':배포완료)
    rgt_dt = db.Column(db.DateTime, default=datetime.now())
    mdfy_dt = db.Column(db.DateTime, default=datetime.now())

    def __init__(self, app_nm, app_file_nm, app_url, app_date, app_dsp, app_stat,rgt_dt, mdfy_dt, app_size, app_version ):

        self.app_nm = app_nm
        self.app_file_nm = app_file_nm
        self.app_url = app_url
        self.app_date = app_date
        self.app_dsp = app_dsp
        self.app_stat = app_stat
        self.rgt_dt = rgt_dt
        self.mdfy_dt = mdfy_dt
        self.app_size = app_size
        self.app_version = app_version

    @classmethod
    def find_by_id(cls, cont_id):
        return cls.query.filter_by(app_id=cont_id).first()

    @classmethod
    def get_row_count(cls):
        sql = """
            SELECT count(*) as tot_cnt FROM tbl_app
            """
        return db.engine.execute(text(sql))

    @classmethod
    def get_final_app(cls):
        return cls.query.order_by(cls.app_id.desc()).first()

    @classmethod
    def get_app_list(self,start,length):
        sql = """
            SELECT row_number() OVER(order by app_id desc) row_cnt, app_id, app_nm, app_file_nm,
                app_url, date_format(app_date, '%Y-%m-%d') app_date, app_stat, app_version, app_size
            FROM tbl_app
            ORDER BY app_id DESC
        """
        if start is not None:
            if int(length) > 0:
                sql += " limit " + str(length) + " offset " + str(start)

        return db.engine.execute(text(sql))

    # save
    def save_to_db(self):
        db.session.add(self)
        db.session.commit()

    # delete
    def delete_to_db(self):
        db.session.delete(self)
        db.session.commit()

