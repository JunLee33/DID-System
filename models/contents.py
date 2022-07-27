from datetime import datetime

from sqlalchemy.sql.expression import true
from core.db import db
from sqlalchemy.sql import text
from flask_login import current_user

# tbl_contents
# +--------------+---------------+------+-----+---------+----------------+
# | Field        | Type          | Null | Key | Default | Extra          |
# +--------------+---------------+------+-----+---------+----------------+
# | cont_id      | int           | NO   | PRI | NULL    | auto_increment |
# | cont_apply   | varchar(1)    | NO   |     | NULL    |                |
# | cont_tp      | varchar(1)    | NO   |     | NULL    |                |
# | cont_nm      | varchar(50)   | NO   |     | NULL    |                |
# | cont_org_nm  | varchar(50)   | NO   |     | NULL    |                |
# | cont_size    | int           | NO   |     | NULL    |                |
# | cont_url     | varchar(100)  | NO   |     | NULL    |                |
# | cont_thu_url | varchar(100)  | NO   |     | NULL    |                |
# | cont_med_tm  | int           | YES  |     | NULL    |                |
# | cont_yn      | varchar(1)    | YES  |     | NULL    |                |
# | cont_html    | varchar(2000) | YES  |     | NULL    |                |
# | cont_tag     | varchar(100)  | YES  |     | NULL    |                |
# | cont_st_dt   | datetime      | YES  |     | NULL    |                |
# | cont_ed_dt   | datetime      | YES  |     | NULL    |                |
# | rgt_dt       | datetime      | YES  |     | NULL    |                |
# | mdfy_dt      | datetime      | YES  |     | NULL    |                |
# +--------------+---------------+------+-----+---------+----------------+
class ContentsModel(db.Model):
    __tablename__ = 'tbl_contents'

    cont_id = db.Column(db.BigInteger, primary_key=True, autoincrement=True)    # 콘텐츠 순번(Auto)
    cont_apply = db.Column(db.String(1), nullable=False)                        # 콘텐츠 적용범위(공통: C , 그룹 : G, 가맹점 : P)
    cont_tp = db.Column(db.String(1), nullable=False)                           # 콘텐츠타입( M: 동영상, I: 이미지, T:자막, W: WEB, L:Live, G:Group)
    cont_nm = db.Column(db.String(50), nullable=False)                          # 콘텐츠명
    cont_org_nm = db.Column(db.String(50), nullable=False)                      # 콘텐츠 원본명
    cont_size = db.Column(db.Integer, nullable=False)                           # 콘텐츠 크기
    cont_url = db.Column(db.String(100), nullable=False)                        # 콘텐츠 URL
    cont_thu_url = db.Column(db.String(100), nullable=False)                    # 콘텐츠 썸네일 URL
    cont_med_tm = db.Column(db.Integer, nullable=True)                          # 콘텐츠 동영상 플레이 시간
    cont_yn = db.Column(db.String(1), default='Y')                              # 콘텐츠 활성/비활성(Default:Y)
    cont_html = db.Column(db.String(2000), nullable=True)                       # HTML 처리를 위한 필드 -----> 향후 TEXT 형태로 지원해야 함 (arnold)
    cont_tag = db.Column(db.String(200), nullable=True)                         # TAG 
    cont_st_dt = db.Column(db.DateTime, nullable=True)                          # Contents start date
    cont_ed_dt = db.Column(db.DateTime, nullable=True)                          # Contetns Expired date
    user_id = db.Column(db.String(20), nullable=True)                           # user_id 
    rgt_dt = db.Column(db.DateTime, default=datetime.now())                     # Registered date
    mdfy_dt = db.Column(db.DateTime, default=datetime.now())                    # Modified date 

    def __init__(self, cont_apply, cont_tp, cont_nm, cont_org_nm, cont_size, cont_url, cont_thu_url, cont_med_tm, cont_st_dt, cont_ed_dt, user_id, rgt_dt, mdfy_dt, cont_tag):

        self.cont_apply = cont_apply
        self.cont_tp = cont_tp
        self.cont_nm = cont_nm
        self.cont_org_nm = cont_org_nm
        self.cont_size = cont_size
        self.cont_url = cont_url
        self.cont_thu_url = cont_thu_url
        self.cont_med_tm = cont_med_tm
        self.cont_st_dt = cont_st_dt
        self.cont_ed_dt = cont_ed_dt
        self.user_id = user_id
        self.rgt_dt = rgt_dt
        self.mdfy_dt = mdfy_dt
        self.cont_tag = cont_tag

    @classmethod
    def find_by_id(cls, cont_id):
        return cls.query.filter_by(cont_id=cont_id).first()

    @classmethod
    def get_contents_list(cls):

        query = db.session.query(cls)

        return query.all()

    # save
    def save_to_db(self):
        db.session.add(self)
        db.session.commit()

    # delete
    def delete_to_db(self):
        db.session.delete(self)
        db.session.commit()

    @classmethod
    def get_count_list_by_user_id(cls, user_id):

        sql = '''
            SELECT group_concat(distinct cont_tp) cont_tp, count(cont_tp) as count 
            FROM tbl_contents a, tbl_user b
            WHERE a.user_id = b.user_id and a.cont_yn = "Y"
            '''
        if current_user.user_gr == "0102":
            sql += ' and (a.user_id = :user_id or b.create_user_id = :user_id) \n'
        if current_user.user_gr == "0103":
            sql += ' and a.user_id = :user_id \n'


        sql += 'group by cont_tp'
            
        # print(sql)
        return db.engine.execute(text(sql),{'user_id':user_id})


    @classmethod
    def get_contents_tp_cnt(cls, params):
        cont_tp, cont_id, cont_apply,  cont_nm, cont_file_nm, cont_yn, user_id, cont_tag = params

        sql = """
              select count(*) tot_cnt from tbl_contents
                    where 1=1
              """
        if cont_yn:
            sql += " and cont_yn = '" + cont_yn +"' "
        if cont_tp:
            sql += " and cont_tp = '" + cont_tp + "'\n"
        if cont_id:
            sql += " and cont_id = '" + cont_id + "'\n"
        if cont_nm:
            sql += " and cont_nm like concat('%','" + cont_nm + "','%') \n"
        if cont_file_nm:
            sql += " and cont_org_nm like concat('%','" + cont_file_nm + "','%') \n"
        if cont_tag:
            sql += " and cont_tag like concat('%','" + cont_tag + "','%') \n"
        if user_id and current_user.user_gr != '0101':
            print('수퍼 어드민 아님')
            sql += " and user_id = '" + user_id + "'\n"
        

        # print(sql)

        return db.engine.execute(text(sql))

    @classmethod
    def get_contents_tp_cnt_admin(cls, params):
        cont_tp, cont_id, cont_apply, cont_nm, cont_file_nm, cont_yn, user_id, cont_tag = params

        sql = """
                select count(*) tot_cnt from tbl_contents c, tbl_user u where c.user_id = u.user_id
              """
        if cont_yn:
            sql += " and c.cont_yn = '" + cont_yn +"' "
        if cont_tp:
            sql += " and c.cont_tp = '" + cont_tp + "'\n"
        if cont_id:
            sql += " and c.cont_id = '" + cont_id + "'\n"
        if cont_nm:
            sql += " and c.cont_nm like concat('%','" + cont_nm + "','%') \n"
        if cont_file_nm:
            sql += " and c.cont_org_nm like concat('%','" + cont_file_nm + "','%') \n"
        if cont_tag:
            sql += " and c.cont_tag like concat('%','" + cont_tag + "','%') \n"
        if user_id:
            sql += " and (u.create_user_id = '" + user_id + "' or c.user_id = '" + user_id + "')\n"
        # print(sql)
        return db.engine.execute(text(sql))


    # Common contents 테이블 구성을 위해 구성
    @classmethod
    def get_contents_tp_list(cls, params):
        cont_tp, cont_id, cont_apply, cont_nm, cont_file_nm, cont_yn, start, length, user_id, cont_tag = params

        if(cont_tp != 'T'):
            sql = """   
                select  row_number() OVER(order by cont_apply , cont_id desc) row_cnt , cont_id, cont_apply ,cont_nm,cont_org_nm, cont_tp, 
                        cont_size ,cont_med_tm, cont_thu_url,cont_url, cont_yn, 
                        CONCAT_WS('~ <br>',date_format(cont_st_dt, '%Y-%m-%d'),date_format(cont_ed_dt, '%Y-%m-%d')) as period,
                        date_format(cont_st_dt, '%Y-%m-%d') cont_st_dt,
                        date_format(cont_ed_dt, '%Y-%m-%d') cont_ed_dt, cont_tag
                from tbl_contents 
                where 1=1
                """
        else:
            sql = """
                    select  row_number() OVER(order by c.cont_apply , c.cont_id desc) row_cnt ,c.cont_id, c.cont_apply ,c.cont_nm,c.cont_org_nm, c.cont_tp, 
                        c.cont_size ,c.cont_med_tm, c.cont_thu_url, c.cont_yn, b.font_name, b.font_size, b.font_color, b.font_bg_color, b.cont_effect, b.cont_duration,
                        CONCAT_WS('^', b.subt_text1,b.subt_text2,b.subt_text3,b.subt_text4,b.subt_text5) cont_url,
                        CONCAT_WS('~ <br>',date_format(c.cont_st_dt, '%Y-%m-%d'),date_format(c.cont_ed_dt, '%Y-%m-%d')) as period,
                        date_format(c.cont_st_dt, '%Y-%m-%d') cont_st_dt,
                        date_format(c.cont_ed_dt, '%Y-%m-%d') cont_ed_dt, c.cont_tag
                    from tbl_contents c, tbl_subtitle b
                    where c.cont_id = b.cont_id
                """
        if cont_yn:
            sql += " and cont_yn = '" + cont_yn +"' \n"
        if cont_tp:
            sql += " and cont_tp = '" + cont_tp + "' \n"
        if cont_id:
            sql += " and b.cont_id = '" + cont_id + "' \n"
        if cont_nm:
            sql += " and cont_nm like concat('%','" + cont_nm + "','%') \n"
        if cont_file_nm:
            sql += " and cont_org_nm like concat('%','" + cont_file_nm + "','%') \n"
        if cont_tag:
            if(cont_tp != 'T'):
                sql += " and cont_tag like concat('%','" + cont_tag + "','%') \n"
            else:
                sql += " and c.cont_tag like concat('%','" + cont_tag + "','%') \n"
        if user_id and current_user.user_gr != '0101':
            # print('수퍼 어드민 아님')
            sql += " and user_id = '" + user_id + "'\n"
        if int(length) > 0:
            sql += " order by row_cnt limit " + str(length) + " offset " + str(start)

        return db.engine.execute(text(sql))

    # Common contents 테이블 구성을 위해 구성
    @classmethod
    def get_contents_tp_list_admin(cls, params):
        cont_tp, cont_id, cont_apply,  cont_nm, cont_file_nm, cont_yn, start, length, user_id, cont_tag = params
        if(cont_tp != 'T'):
            sql = """   
                select  row_number() OVER(order by c.cont_apply , c.cont_id desc) row_cnt , c.cont_id, c.cont_apply , c.cont_nm, c.cont_org_nm, c.cont_tp, 
                        c.cont_size, c.cont_med_tm, c.cont_thu_url, c.cont_url, c.cont_yn, 
                        CONCAT_WS('~ <br>',date_format(cont_st_dt, '%Y-%m-%d'),date_format(cont_ed_dt, '%Y-%m-%d')) as period,
                        date_format(c.cont_st_dt, '%Y-%m-%d') cont_st_dt,
                        date_format(c.cont_ed_dt, '%Y-%m-%d') cont_ed_dt, c.cont_tag
                from tbl_contents c, tbl_user u 
                where c.user_id = u.user_id
                """
        else:
            sql = """
                    select  row_number() OVER(order by c.cont_apply , c.cont_id desc) row_cnt ,c.cont_id, c.cont_apply ,c.cont_nm,c.cont_org_nm, c.cont_tp, 
                        c.cont_size ,c.cont_med_tm, c.cont_thu_url, c.cont_yn, b.font_name, b.font_size, b.font_color, b.font_bg_color, b.cont_effect, b.cont_duration,
                        CONCAT_WS('^', b.subt_text1,b.subt_text2,b.subt_text3,b.subt_text4,b.subt_text5) cont_url,
                        CONCAT_WS('~ <br>',date_format(c.cont_st_dt, '%Y-%m-%d'),date_format(c.cont_ed_dt, '%Y-%m-%d')) as period,
                        date_format(c.cont_st_dt, '%Y-%m-%d') cont_st_dt,
                        date_format(c.cont_ed_dt, '%Y-%m-%d') cont_ed_dt, c.cont_tag
                    from tbl_contents c, tbl_subtitle b, tbl_user u
                    where c.cont_id = b.cont_id and c.user_id = u.user_id
                """
        if cont_yn:
            sql += " and cont_yn = '" + cont_yn +"' \n"
        if cont_tp:
            sql += " and cont_tp = '" + cont_tp + "' \n"
        if cont_id:
            sql += " and b.cont_id = '" + cont_id + "' \n"
        if cont_nm:
            sql += " and cont_nm like concat('%','" + cont_nm + "','%') \n"
        if cont_file_nm:
            sql += " and cont_org_nm like concat('%','" + cont_file_nm + "','%') \n"
        if cont_tag:
            sql += " and c.cont_tag like concat('%','" + cont_tag + "','%') \n"
        if user_id:
            sql += " and (u.create_user_id = '" + user_id + "' or c.user_id = '" + user_id + "')\n"
        if int(length) > 0:
            sql += " order by row_cnt limit " + str(length) + " offset " + str(start)

        # print("get_cotnetns_tp_list sql >> " + sql)
        # print(sql)
        return db.engine.execute(text(sql))

        # Common contents 테이블 구성을 위해 구성

    
# mysql> desc tbl_subtitle;
# +---------------+--------------+------+-----+---------+----------------+
# | Field         | Type         | Null | Key | Default | Extra          |
# +---------------+--------------+------+-----+---------+----------------+
# | subt_id       | int          | NO   | PRI | NULL    | auto_increment |
# | font_name     | varchar(30)  | YES  |     | NULL    |                |
# | font_size     | int          | YES  |     | NULL    |                |
# | font_color    | varchar(30)  | YES  |     | NULL    |                |
# | font_bg_color | varchar(30)  | YES  |     | NULL    |                |
# | cont_effect   | varchar(4)   | YES  |     | NULL    |                |
# | cont_duration | varchar(20)  | YES  |     | NULL    |                |
# | subt_text1    | varchar(100) | YES  |     | NULL    |                |
# | subt_text2    | varchar(100) | YES  |     | NULL    |                |
# | subt_text3    | varchar(100) | YES  |     | NULL    |                |
# | subt_text4    | varchar(100) | YES  |     | NULL    |                |
# | subt_text5    | varchar(100) | YES  |     | NULL    |                |
# | cont_id       | int          | NO   | MUL | NULL    |                |
# | rgt_dt        | datetime     | YES  |     | NULL    |                |
# | mdfy_dt       | datetime     | YES  |     | NULL    |                |
# +---------------+--------------+------+-----+---------+----------------+

class SubtitleModel (db.Model):
    __tablename__ = 'tbl_subtitle'

    subt_id =       db.Column(db.Integer, primary_key=True, autoincrement=True)     # 콘텐츠 순번(Auto)
    font_name =     db.Column(db.String(30), nullable=False)                        # subtitle name
    font_size =     db.Column(db.Integer, nullable=False)
    font_color =    db.Column(db.String(30), nullable=False)
    font_bg_color = db.Column(db.String(30), nullable=False)
    cont_effect =   db.Column(db.String(4), nullable=False)
    cont_duration = db.Column(db.String(20), nullable=False)
    subt_st_dt =    db.Column(db.DateTime, )
    subt_ed_dt =    db.Column(db.DateTime, )
    subt_text1 =    db.Column(db.String(100), nullable=False)                       # subtitle text
    subt_text2 =    db.Column(db.String(100), nullable=False)                       # subtitle text
    subt_text3 =    db.Column(db.String(100), nullable=False)                       # subtitle text
    subt_text4 =    db.Column(db.String(100), nullable=False)                       # subtitle text
    subt_text5 =    db.Column(db.String(100), nullable=False)                       # subtitle text
    cont_id =       db.Column(db.Integer, nullable=False)                           # 콘텐츠 ID
    rgt_dt =        db.Column(db.DateTime, default=datetime.now())                  # Registered date
    mdfy_dt =       db.Column(db.DateTime, default=datetime.now())                  # Modified date 

    def __init__(self, font_name, font_size, font_color, font_bg_color, cont_effect, subt_st_dt, subt_ed_dt, subt_text1, subt_text2, subt_text3, subt_text4, subt_text5, cont_id, rgt_dt, mdfy_dt):

        self.font_name = font_name
        self.font_size = font_size
        self.font_color = font_color
        self.font_bg_color = font_bg_color
        self.cont_effect = cont_effect
        self.subt_st_dt = subt_st_dt
        self.subt_ed_dt = subt_ed_dt
        self.subt_text1 = subt_text1
        self.subt_text2 = subt_text2
        self.subt_text3 = subt_text3
        self.subt_text4 = subt_text4
        self.subt_text5 = subt_text5
        self.cont_id = cont_id
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
    def find_by_cont_id(cls, cont_id):
        return cls.query.filter_by(cont_id=cont_id).first()

    @classmethod
    def find_by_id(cls, cont_id):

        sql = """   
            SELECT subt_id, font_name, font_size, font_color, font_bg_color, cont_effect, 
                date_format(subt_st_dt, '%Y-%m-%d') subt_st_dt, 
                date_format(subt_ed_dt, '%Y-%m-%d') subt_ed_dt, 
                subt_text1, subt_text2, subt_text3, subt_text4, subt_text5, cont_id
            from tbl_subtitle
            WHERE cont_id = :cont_id
        """
        return db.engine.execute(text(sql),{'cont_id':cont_id})

    @classmethod
    def concat_by_id(cls, cont_id):

        sql = """   
            SELECT concat(subt_text1, subt_text2, subt_text3, subt_text4, subt_text5) as result
            from tbl_subtitle
            WHERE cont_id = :cont_id
        """
        return db.engine.execute(text(sql),{'cont_id':cont_id})

    @classmethod
    def find_by_id_all(cls, cont_id):
        return cls.query.filter_by(cont_id=cont_id).first()
        
    # 상황보고 추가함(김동수 6/23)        
    # @classmethod
    # def get_concat_subtitle_by_id(cls, cont_id):
    #     sql = """
    #         select
    #             CONCAT_WS('^', b.subt_text1,b.subt_text2,b.subt_text3,b.subt_text4,b.subt_text5) as cont_url
    #         from tbl_contents a, tbl_subtitle b
    #         where a.cont_id = b.cont_id and a.cont_id = :cont_id
    #     """
    #     return db.engine.execute(text(sql),{'cont_id':cont_id})
    


# mysql> desc tbl_cont_subtitle;
# +-------------------+--------------+------+-----+---------+----------------+
# | Field             | Type         | Null | Key | Default | Extra          |
# +-------------------+--------------+------+-----+---------+----------------+
# | contcon_id        | int          | NO   | PRI | NULL    | auto_increment |
# | cont_type         | varchar(1)   | YES  |     | T       |                |
# | subt_nm           | varchar(50)  | YES  |     | NULL    |                |
# | subt_effect       | varchar(20)  | YES  |     | NULL    |                |
# | contcon_tm        | int          | YES  |     | NULL    |                |
# | subt_st_dt        | datetime     | YES  |     | NULL    |                |
# | subt_ed_dt        | datetime     | YES  |     | NULL    |                |
# | subt_font         | varchar(20)  | YES  |     | NULL    |                |
# | subt_font_size    | int          | YES  |     | NULL    |                |
# | subt_font_color   | varchar(30)  | YES  |     | NULL    |                |
# | subt_font_bcolor  | varchar(30)  | YES  |     | NULL    |                |
# | subt_text1        | varchar(500) | YES  |     | NULL    |                |
# | subt_text2        | varchar(500) | YES  |     | NULL    |                |
# | subt_text3        | varchar(500) | YES  |     | NULL    |                |
# | subt_text4        | varchar(500) | YES  |     | NULL    |                |
# | subt_text5        | varchar(500) | YES  |     | NULL    |                |
# | control_detail_id | int          | YES  | MUL | NULL    |                |
# | subt_id           | int          | YES  | MUL | NULL    |                |
# | rgt_dt            | datetime     | YES  |     | NULL    |                |
# | mdfy_dt           | datetime     | YES  |     | NULL    |                |
# +-------------------+--------------+------+-----+---------+----------------+


class ContSubtitleModel (db.Model):
    __tablename__ = 'tbl_cont_subtitle'

    contcon_id =        db.Column(db.Integer, primary_key=True, autoincrement=True)     # 콘텐츠 순번(Auto)
    cont_type =         db.Column(db.String(1), nullable=False)                        # subtitle name
    subt_nm =           db.Column(db.String(50), nullable=False)
    subt_effect =       db.Column(db.String(20), nullable=False)
    contcon_tm =        db.Column(db.Integer, nullable=False)
    subt_st_dt =        db.Column(db.DateTime, default=datetime.now())
    subt_ed_dt =        db.Column(db.DateTime, default=datetime.now())
    subt_font =         db.Column(db.String(20), nullable=true)
    subt_font_size =    db.Column(db.Integer, nullable=true)
    subt_font_color =   db.Column(db.String(30), nullable=true)
    subt_font_bcolor =  db.Column(db.String(30), nullable=true)
    subt_text1 =        db.Column(db.String(500), nullable=true)                         # subtitle text
    subt_text2 =        db.Column(db.String(500), nullable=true)                         # subtitle text
    subt_text3 =        db.Column(db.String(500), nullable=true)                        # subtitle text
    subt_text4 =        db.Column(db.String(500), nullable=true)                        # subtitle text
    subt_text5 =        db.Column(db.String(500), nullable=true)                        # subtitle text
    control_detail_id = db.Column(db.Integer, nullable=False)                           # control_detail_id foreign key
    subt_id =           db.Column(db.Integer, nullable=False)                           # subtitle ID       foreign key
    cont_id =           db.Column(db.Integer, nullable=False)                           # 콘텐츠 ID           foreign key
    rgt_dt =            db.Column(db.DateTime, default=datetime.now())                  # Registered date
    mdfy_dt =           db.Column(db.DateTime, default=datetime.now())                  # Modified date 

    def __init__(self, cont_type, subt_nm, subt_effect, contcon_tm, subt_st_dt, subt_ed_dt, subt_font, subt_font_size, subt_font_color, subt_font_bcolor, 
                        subt_text1, subt_text2, subt_text3, subt_text4, subt_text5, control_detail_id, subt_id, cont_id, rgt_dt, mdfy_dt):

        self.cont_type = cont_type
        self.subt_nm = subt_nm
        self.subt_effect = subt_effect
        self.contcon_tm = contcon_tm
        self.subt_st_dt = subt_st_dt
        self.subt_ed_dt = subt_ed_dt
        self.subt_font = subt_font
        self.subt_font_size = subt_font_size
        self.subt_font_color =  subt_font_color
        self.subt_font_bcolor = subt_font_bcolor
        self.subt_text1 = subt_text1
        self.subt_text2 = subt_text2
        self.subt_text3 = subt_text3
        self.subt_text4 = subt_text4
        self.subt_text5 = subt_text5
        self.control_detail_id = control_detail_id
        self.subt_id = subt_id
        self.cont_id = cont_id
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
    def find_by_id(cls, contcon_id):
        return cls.query.filter_by(contcon_id=contcon_id).first()

    @classmethod
    def find_by_id_all(cls, cont_id):
        sql = """
            SELECT contcon_id 
            FROM tbl_cont_subtitle
            WHERE cont_id = :cont_id
        """
        return db.engine.execute(text(sql),{'cont_id':cont_id})