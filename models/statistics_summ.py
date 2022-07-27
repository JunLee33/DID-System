from core.db import db
from sqlalchemy.sql import text
from datetime import datetime


class StatisticsSummaryModel(db.Model):
    __tablename__ = 'tbl_statistics_summary_gs'
#   `stat_id` bigint NOT NULL AUTO_INCREMENT,
#   `stat_date` datetime NOT NULL,
#   `stat_time` int NOT NULL,
#   `stat_cnt` bigint NOT NULL,
#   `sch_id` bigint NOT NULL,
#   `cont_id` int NOT NULL,
#   `dev_id` varchar(40) COLLATE utf8mb4_general_ci NOT NULL,
    
    stat_id = db.Column(db.BigInteger, primary_key=True, autoincrement=True)                    # 통계 순번(Auto)
    stat_date = db.Column(db.DateTime, nullable=False)                                          # 통계 일자
    stat_time = db.Column(db.Integer, nullable=False)                                           # 총 플레이 시간(초)
    stat_cnt = db.Column(db.BigInteger, nullable=False)                                         # 통계 플레이 카운트
    sch_id = db.Column(db.BigInteger, nullable=False)                                           # 스케줄순번(TBL_SCHEDULE)
    cont_id = db.Column(db.Integer,nullable=False)                                              # 레이아웃(TBL_LAYER)
    dev_id = db.Column(db.String(40),nullable=False)                                            # 장치(TBL_DEVICE)
    create_dt = db.Column(db.DateTime, default=datetime.now())                                  # 생성 일자
    

    def __init__(self, stat_date, stat_time, stat_cnt, sch_id, cont_id, dev_id, create_dt):

        self.stat_date = stat_date
        self.stat_time = stat_time
        self.stat_cnt = stat_cnt
        self.sch_id = sch_id
        self.cont_id = cont_id
        self.dev_id = dev_id
        self.create_dt = create_dt

    # save
    def save_to_db(self):
        db.session.add(self)
        db.session.commit()

    # delete
    def delete_to_db(self):
        db.session.delete(self)
        db.session.commit()

    @classmethod
    def find_by_id(cls, stat_id):
        return cls.query.filter_by(stat_id=stat_id).first()

    @classmethod
    # sch_id, cont_id, dev_id, now_date_hour
    def find_by_key(cls, sch_id, cont_id, dev_id, stat_date):
        return cls.query.filter_by(stat_date=stat_date, cont_id=cont_id, dev_id=dev_id, sch_id=sch_id).first()
