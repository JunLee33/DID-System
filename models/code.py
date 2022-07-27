from datetime import datetime
from core.db import db


class CodeModel(db.Model):
    __tablename__ = 'tbl_common'

    comm_cd = db.Column(db.String(4), primary_key=True)                     # 공통코드
    comm_nm = db.Column(db.String(20), nullable=False)                      # 공통코드명
    comm_cmt = db.Column(db.String(30), nullable=True)                      # 공통코드 코멘트(색상인 경우 코드표 들어감)
    comm_level = db.Column(db.String(1), nullable=False)                    # 공통코드레벨
    comm_up_cd = db.Column(db.String(4), nullable=False)                    # 공통상위코드(레벨1은 0000, 그외 공통코드)
    rgt_dt = db.Column(db.DateTime, default=datetime.now())
    mdfy_dt = db.Column(db.DateTime, default=datetime.now())

    def __init__(self, comm_cd, comm_nm, comm_comt, comm_level, comm_up_cd):

        self.comm_cd = comm_cd
        self.comm_nm = comm_nm
        self.comm_comt = comm_comt
        self.comm_level = comm_level
        self.comm_up_cd = comm_up_cd

    @classmethod
    def find_by_cd(cls, comm_cd):
        return cls.query.filter_by(comm_cd=comm_cd).first()

    @classmethod
    def get_comm_list(cls):
        return cls.query.all()

    @classmethod
    def get_comm_level1(cls, comm_level):
        return cls.query.filter_by(comm_level=comm_level).all()

    @classmethod
    def get_comm_level2(cls, comm_up_cd):
        return cls.query.filter_by(comm_up_cd=comm_up_cd).all()

    # save
    def save_to_db(self):
        db.session.add(self)
        db.session.commit()

    # delete
    def delete_to_db(self):
        db.session.delete(self)
        db.session.commit()

    @classmethod
    def get_apply_code(cls, comm_up_cd):
        return cls.query.filter_by(comm_up_cd=comm_up_cd).all()
