import cv2
from dateutil.relativedelta import relativedelta
from flask_jwt_extended import jwt_required
from flask_restful import Resource, reqparse, request
# from werkzeug.datastructures import FileStorage
import werkzeug

from models.contents import ContentsModel, SubtitleModel, ContSubtitleModel
from models.user import UserModel
# from models.contents_group import ContentsGroupModel
# from models.group_parking import GroupParkingModel
# from models.layer_dtl import LayerDtlModel
from utils.jsonutil import AlchemyEncoder as jsonEncoder
from config.properties import *
from utils.fileutil import FileUtils
from datetime import date, datetime
from flask_login import current_user
import json
import logging
import time


# 콘텐츠(상세조회/등록/수정/삭제)
class Contents(Resource):
    parse = reqparse.RequestParser()
    parse.add_argument('cont_tag',      type=str)
    parse.add_argument('cont_nm',       type=str)
    parse.add_argument('cont_apply',    type=str)
    parse.add_argument('cont_tp',       type=str)
    parse.add_argument('cont_size',     type=str)
    parse.add_argument('cont_med_tm',   type=int)
    parse.add_argument('cont_yn',       type=str)
    # parse.add_argument('group_seq',     type=str)
    # parse.add_argument('parking_seq',   type=str)
    parse.add_argument('comType',       type=str)
    parse.add_argument('cont_start',    type=str)
    parse.add_argument('cont_end',      type=str)
    parse.add_argument('cont_url_start',      type=str)
    parse.add_argument('cont_url_end',      type=str)
    
    

    # parse.add_argument('file',          type=werkzeug.datastructures.FileStorage, location='files')

    # Subtitle params
    parse.add_argument('font',              type=str)
    parse.add_argument('font_size',         type=str)
    parse.add_argument('font_color',        type=str)
    parse.add_argument('font_bg_color',     type=str)
    parse.add_argument('subTitle_1',        type=str)
    parse.add_argument('subTitle_2',        type=str)
    parse.add_argument('subTitle_3',        type=str)
    parse.add_argument('subTitle_4',        type=str)
    parse.add_argument('subTitle_5',        type=str)
    # parse.add_argument('cont_seq_text',     type=str)
    parse.add_argument('cont_effect',     type=str)
    

    # WEB / LIVE 처리
    parse.add_argument('cont_nm_url',     type=str)
    parse.add_argument('cont_url',     type=str)


    def get(self, cont_id):

        params = Contents.parse.parse_args()
        # area_seq = params['group']

        # contents_list = ContentsModel.get_contents_list()

        return {'resultCode': '0', "resultString": "SUCCESS"}, 200

    def post(self):
        print("ENTERED ================ POST")
        
        # Image, Media 일 경우는 File 존재 함으로 해당 파일 처리 해야 하나, Html 일 경우는 Param 만으로 처리 (구분자 정리 해서 적용) arnold.2021.01.31

        params = Contents.parse.parse_args()

        print(params)
        cont_tag =      params['cont_tag']
        cont_nm =       params['cont_nm']
        cont_apply =    params['cont_apply']
        cont_tp =       params['cont_tp']
        cont_size =     params['cont_size']
        cont_med_tm =   params['cont_med_tm']
        cont_st_dt =    params['cont_start']
        cont_ed_dt =    params['cont_end']
        cont_files =    []
        cont_url = ''
        cont_path = ''
        cont_thum_path = ''
        cont_thum_url = ''
        user_id = current_user.user_id
        if cont_st_dt == "":
            cont_st_dt = None
        if cont_ed_dt == "":
            cont_ed_dt = None
        print(cont_tag)

        if(cont_tp == 'M' or cont_tp == 'I'):
            try:
                # 파일명 추출
                for file in request.files.getlist("files"):
                    cont_files.append(file)

            except Exception as e:
                logging.fatal(e, exc_info=True)
                return {'resultCode': '100', "resultString": "파일 업로드에 실패하였습니다."}, 500

            # 업로드된 파일이 존재 하는 경우 conts 데이터 셋 만들기

            for idx in range(len(cont_apply)):

                print("LOOP ["+str(idx)+"]")

                # C == COMMON 공통 콘텐츠 , group_seq is NULL
                # G == GROUP 그룹 콘텐츠 , group_seq is not NULL
                if cont_apply[idx] == "C":
                    cont_path =         common_file
                    cont_thum_path =    common_file_thumb
                    cont_url =          common_url
                    cont_thum_url =     common_url_thumb
                else:
                    # L
                    cont_path =         group_file
                    cont_thum_path =    group_file_thumb
                    cont_url =          group_url
                    cont_thum_url =     group_url_thumb

                # 파일명 추출 (파일명에 띄어쓰기 있는경우 파일명이 중간에 잘림)
                cont_org_nm = str(cont_files[idx].filename.replace(" ", "_"))           # 필드 생성 후 저장 해야함
                fname, ext = os.path.splitext(cont_org_nm)
                cont_file_nmae = str(int(time.time())) + "_" + str(idx) + "_" +ext

                print("FILE NAME = ["+cont_file_nmae+"]")

                # URL 설정(코드 + 파일명)
                cont_url += cont_file_nmae

                if cont_tp == 'M':
                    cont_thum_url += cont_file_nmae.replace(".mp4", "")+".png"
                    cont_thum_path += cont_file_nmae.replace(".mp4", "")+".png"
                else:
                    cont_thum_url += cont_file_nmae

                print("FILE THUMB NAME = ["+cont_thum_url+"]")

                rgt_dt  = datetime.now()
                mdfy_dt = datetime.now()

                content_obj = ContentsModel('Y', cont_tp, cont_nm, cont_org_nm, cont_size, cont_url, cont_thum_url, 
                                            cont_med_tm, cont_st_dt, cont_ed_dt, user_id, rgt_dt, mdfy_dt, cont_tag)
                
                try:
                    if not FileUtils.save_file(cont_files[idx], cont_path, cont_file_nmae):
                        raise Exception('not save image %s' % cont_path + cont_file_nmae)

                    if cont_tp[idx] == 'M':
                        video_cap = cv2.VideoCapture(cont_path + cont_file_nmae)
                        print(cont_path + cont_file_nmae)

                        while video_cap.isOpened():
                            ret, img = video_cap.read()
                            image = cv2.resize(img, None, fx=0.3, fy=0.3, interpolation=cv2.INTER_AREA)
                            cv2.imwrite(cont_thum_path, image)
                            break
                        video_cap.release()
                    elif cont_tp[idx] == "I":
                        # 디렉토리 생성
                        if not FileUtils.is_directory(cont_thum_path):
                            raise Exception('make dir fail %s' % cont_thum_path)

                        img = cv2.imread(cont_path + cont_file_nmae, cv2.IMREAD_COLOR)
                        image = cv2.resize(img, None, fx=0.3, fy=0.3, interpolation=cv2.INTER_AREA)
                        cv2.imwrite(cont_thum_path+cont_file_nmae, image)

                    # DB 저장
                    content_obj.save_to_db()

                    # 1. user_gr확인
                    user_gr = current_user.user_gr

                    # 2. user_gr과 user_id 넣고 업데이트 하기
                    resultString = UserModel.update_now_disk(user_id, user_gr)
                    
                    # 3. 관리자가 아닌 경우, 하위 유저가 업로드할 경우, 상위 유저 now_disk도 업데이트
                    if user_gr != '0102':
                        create_user_obj = UserModel.get_create_user_id(user_id)
                        create_user_id_dict = [dict(r) for r in create_user_obj]
                        user_id = create_user_id_dict[0]['create_user_id']
                        resultString = UserModel.update_now_disk(user_id, '0102')

                    print("user테이블 용량 업데이트 결과값: " + resultString)


                except Exception as e:
                    
                    logging.fatal(e, exc_info=True)
                    return {'resultCode': '100', "resultString": "콘텐츠 업로드에 실패하였습니다."}, 500
                return {'resultCode': '0', "resultString": "콘텐츠가 업로드 되었습니다."}, 200

            # subTitle processing
        elif(cont_tp == 'T'):
            # Table & params check
            print("subTitle insert mode ....................... ")
            #For the first time insert into tbl_contents without any other paramas

            # Additional Field should make it !

            rgt_dt  = datetime.now()
            mdfy_dt = datetime.now()

            try:
                content_obj = ContentsModel('Y', cont_tp, cont_nm, "", 0, "", "", 
                                            0, cont_st_dt, cont_ed_dt, user_id, rgt_dt, mdfy_dt, cont_tag)
                content_obj.save_to_db()

            except Exception as e:

                    logging.fatal(e, exc_info=True)
                    return {'resultCode': '100', "resultString": " 자막 콘텐츠 등록에 실패하였습니다."}, 500
            
            cont_id = content_obj.cont_id

            # with contents id insert tbl_subtitle with whole params
            # font_name, font_size, font_color, font_bg_color, cont_effect, subt_text1, subt_text2, subt_text3, subt_text4, subt_text5, cont_id, rgt_dt, mdfy_dt

            font =              params['font']
            font_size =         params['font_size']
            font_color =        params['font_color']
            font_bg_color =     params['font_bg_color']
            cont_effect =       params['cont_effect'] #'0705'
            subTitle_1 =        params['subTitle_1']
            subTitle_2 =        params['subTitle_2']
            subTitle_3 =        params['subTitle_3']
            subTitle_4 =        params['subTitle_4']
            subTitle_5 =        params['subTitle_5']
            # cont_seq_text =     params['cont_seq_text']
            
            subt_st_dt =        cont_st_dt
            subt_ed_dt =        cont_ed_dt

            try:
                subTitleObj = SubtitleModel(font, int(font_size), font_color, font_bg_color, cont_effect, subt_st_dt, subt_ed_dt, subTitle_1, subTitle_2, subTitle_3, subTitle_4, subTitle_5, cont_id, rgt_dt, mdfy_dt)
                subTitleObj.save_to_db()

                return {'resultCode': '0', "resultString": cont_nm + "자막콘텐츠가 업로드 되었습니다."}, 200

            except Exception as e:
                    logging.fatal(e, exc_info=True)
                    return {'resultCode': '100', "resultString": " 자막 업로드에 실패하였습니다."}, 500

        # WEB, LIVE URL 만 넣으면 됨.
        else:
            # WEB , LIVE 처리 로직
            print("Etc")

            cont_nm_url =   params['cont_nm_url']
            cont_url =      params['cont_url']
            cont_st_dt =      params['cont_url_start']
            cont_ed_dt =      params['cont_url_end']

            rgt_dt  = datetime.now()
            mdfy_dt = datetime.now()

            if cont_st_dt == "":
                cont_st_dt = None
            if cont_ed_dt == "":
                cont_ed_dt = None
            
            try:
                content_obj = ContentsModel('Y', cont_tp, cont_nm_url, "", 0, cont_url, "", 
                                            0, cont_st_dt, cont_ed_dt, user_id, rgt_dt, mdfy_dt, cont_tag)
                content_obj.save_to_db()

                return {'resultCode': '0', "resultString": cont_nm_url + "콘텐츠가 등록 되었습니다."}, 200

            except Exception as e:

                    logging.fatal(e, exc_info=True)
                    return {'resultCode': '100', "resultString": " 콘텐츠 등록에 실패하였습니다."}, 500


    def replaceMultiple(mainString, toBeReplaces, newString):
        # Iterate over the strings to be replaced
        for elem in toBeReplaces:
            # Check if string is in the main string
            if elem in mainString:
                # Replace the string
                mainString = mainString.replace(elem, newString)

        return mainString


    def put(self,cont_seq):

        params = Contents.parse.parse_args()

        cont_tag = params['cont_tag']
        cont_nm = params["cont_nm"]
        cont_yn = params["cont_yn"]
        cont_tp = params['cont_tp']
        cont_url = params['cont_url']
        comType = params["comType"]
        cont_st_dt = params['cont_start']
        cont_ed_dt = params['cont_end']
        if cont_st_dt == "null":
            cont_st_dt = None
        if cont_ed_dt == "null":
            cont_ed_dt = None

        try:
            site_obj = ContentsModel.find_by_id(cont_seq)
            
            if comType == "change":
                site_obj.mdfy_dt = datetime.now()
                site_obj.cont_nm = cont_nm
                site_obj.cont_tag = cont_tag
                site_obj.cont_st_dt = cont_st_dt
                site_obj.cont_ed_dt = cont_ed_dt
                if(cont_tp == "L" or cont_tp == "W"):
                    site_obj.cont_url = cont_url
                    site_obj.save_to_db()
                else:
                    site_obj.save_to_db()
                # StringType = "수정"
                # site_obj.mdfy_dt = datetime.now()
                # site_obj.cont_nm = cont_nm
                # site_obj.save_to_db()
                
            elif comType == "delete":
                site_obj.mdfy_dt = datetime.now()
                site_obj.cont_yn = cont_yn
                # site_obj.save_to_db()
                ## 여기까지가 기존 삭제

                # 물리파일 삭제 로직 추가 (2021.07.11) by arnold
                # FileUtils.save_file(cont_file, cont_path, shot_nm)
                # http://waview.co.kr:7070/static/contents/group/1615897035_0_.jpg
                contents_name = str(site_obj.cont_url)
                cont_name_array = contents_name.split("/")
                
                file_name = cont_name_array[6]
                
                # file delete
                FileUtils.delete_file(common_file, file_name)
                if cont_tp == 'M':
                    file_name = file_name[:-3] + 'png'
                FileUtils.delete_file(common_file_thumb, file_name)
                
                site_obj.save_to_db()

            elif comType == "deleteOthers":
                site_obj.mdfy_dt = datetime.now()
                site_obj.cont_yn = cont_yn
                site_obj.save_to_db()

            user_id = current_user.user_id
            user_gr = current_user.user_gr
            # 2. user_gr과 user_id 넣고 업데이트 하기
            resultString = UserModel.update_now_disk(user_id, user_gr)
            
            # 3. 관리자가 아닌 경우, 하위 유저가 업로드할 경우, 상위 유저 now_disk도 업데이트
            if user_gr != '0102':
                create_user_obj = UserModel.get_create_user_id(user_id)
                create_user_id_dict = [dict(r) for r in create_user_obj]
                user_id = create_user_id_dict[0]['create_user_id']
                resultString = UserModel.update_now_disk(user_id, '0102')

            print("user테이블 용량 업데이트 결과값: " + resultString)

        except Exception as e:
            logging.fatal(e, exc_info=True)
            return {'resultCode': '100', "resultString": "콘텐츠 수정(또는 삭제)에 실패하였습니다."}, 500

        return {'resultCode': '0', "resultString": "콘텐츠 수정(또는 삭제)에 성공하였습니다."}, 200




    def delete(self):
        return {'resultCode': '0', "resultString": "SUCCESS" }, 200


# 콘텐츠 메인 리스트 조회
class ContentsSearch(Resource):
    parse = reqparse.RequestParser()
    parse.add_argument('cont_tag', type=str)
    parse.add_argument('cont_tp', type=str)
    parse.add_argument('cont_id', type=str)
    parse.add_argument('cont_apply', type=str)
    parse.add_argument('group_seq',type=str)
    parse.add_argument('parking_seq', type=str)
    parse.add_argument('cont_nm', type=str)
    parse.add_argument('cont_file_nm', type=str)
    parse.add_argument('cont_yn', type=str)

    parse.add_argument('start', type=int)
    parse.add_argument('length', type=int)

    # def get(self):
    #     params = ContentsSearch.parse.parse_args()

    #     cont_apply = params['cont_apply']
    #     group_seq = params['group_seq']
    #     parking_seq = params['parking_seq']

    #     params = (group_seq, cont_apply, parking_seq)
    #     # print(str(params))

    #     contents_list = [dict(r) for r in ContentsModel.get_find_contents(params)]

    #     return {
    #                'resultCode': '0',
    #                "resultString": "SUCCESS",
    #                "data": contents_list
    #            }, 200

    def post(self):

        res_data = {}
        # 모든 콘텐츠 데이터 가져오기
        # 콘텐츠 전체 조회에 사용
        params = ContentsSearch.parse.parse_args()
        cont_tag = params['cont_tag']
        cont_tp = params['cont_tp']
        cont_id = params['cont_id']
        cont_apply = params['cont_apply']
        # group_seq = params['group_seq']
        # parking_seq = params['parking_seq']
        cont_nm = params['cont_nm']
        cont_file_nm = params['cont_file_nm']
        cont_yn = params['cont_yn']
        user_id = current_user.user_id
        print(cont_tag)
        start = params['start']
        length = params['length']

        if(length == None): 
            length = 0
        
        if(cont_tp == 'all'):
            cont_tp = ''


        if(current_user.user_gr == '0103' or current_user.user_gr == '0101'): #담당자인 경우
            # Total Count
            param = (cont_tp, cont_id, cont_apply,  cont_nm, cont_file_nm, cont_yn, user_id, cont_tag)
            tot_list = [dict(r) for r in ContentsModel.get_contents_tp_cnt(param)]
            res_data['recordsTotal'] = tot_list[0]['tot_cnt']
            res_data['recordsFiltered'] = tot_list[0]['tot_cnt']
            ###################################################################
            param = (cont_tp, cont_id, cont_apply, cont_nm, cont_file_nm, cont_yn, start, length, user_id, cont_tag)
            res_data['data'] = [dict(r) for r in ContentsModel.get_contents_tp_list(param)]

        else:
            # Total Count
            param = (cont_tp, cont_id, cont_apply,   cont_nm, cont_file_nm, cont_yn, user_id, cont_tag)
            tot_list = [dict(r) for r in ContentsModel.get_contents_tp_cnt_admin(param)]
            res_data['recordsTotal'] = tot_list[0]['tot_cnt']
            res_data['recordsFiltered'] = tot_list[0]['tot_cnt']
            ###################################################################
            param = (cont_tp, cont_id, cont_apply,   cont_nm, cont_file_nm, cont_yn, start, length, user_id, cont_tag)
            res_data['data'] = [dict(r) for r in ContentsModel.get_contents_tp_list_admin(param)]

        # 응답 결과
        res_data['resultCode'] = "0"
        res_data['resultString'] = "SUCCESS"
        # print(res_data['recordsTotal'])
        # print(res_data['recordsFiltered'])
        
        return res_data, 200

class ConcatSubtitle(Resource):
    parse = reqparse.RequestParser()
    parse.add_argument('cont_seq',          type=str)

    def get(self):
        print('concat start!')
        params = Subtitle.parse.parse_args()

        cont_seq = params['cont_seq']
        contents_list = [dict(r) for r in SubtitleModel.concat_by_id(cont_seq)]
        # contents_list = SubtitleModel.find_by_id(cont_seq)

        return {
                   'resultCode': '0',
                   "resultString": "SUCCESS",
                   "data": contents_list
               }, 200

# subTitle 처리를 위한 별도의 URL 

class Subtitle(Resource):
    parse = reqparse.RequestParser()
    parse.add_argument('cont_tag',          type=str)
    parse.add_argument('cont_nm',           type=str)
    parse.add_argument('cont_tp',           type=str)
    parse.add_argument('cont_start',        type=str)
    parse.add_argument('cont_end',          type=str)

    parse.add_argument('font',              type=str)
    parse.add_argument('font_size',         type=str)
    parse.add_argument('font_color',        type=str)
    parse.add_argument('font_bg_color',     type=str)
    parse.add_argument('subTitle_1',        type=str)
    parse.add_argument('subTitle_2',        type=str)
    parse.add_argument('subTitle_3',        type=str)
    parse.add_argument('subTitle_4',        type=str)
    parse.add_argument('subTitle_5',        type=str)
    parse.add_argument('cont_effect',       type=str)

    parse.add_argument('cont_seq',          type=str)


    def get(self):

        print("ENTERED Subtitle get")

        params = Subtitle.parse.parse_args()

        cont_seq = params['cont_seq']

        # SubtitleModel.find_by_id(cont_seq)

        contents_list = [dict(r) for r in SubtitleModel.find_by_id(cont_seq)]
        # contents_list = SubtitleModel.find_by_id(cont_seq)

        return {
                   'resultCode': '0',
                   "resultString": "SUCCESS",
                   "data": contents_list
               }, 200



    def put(self,cont_seq):
        # /contents/subtitle/update<int:cont_seq>

        params = Subtitle.parse.parse_args()

        print(params)
        print("CONT_SEQ : ["+str(cont_seq)+"]")

        # contents table area
        cont_tag =      params['cont_tag']
        cont_nm =       params["cont_nm"]
        cont_tp =       params["cont_tp"]

        # subtitle table area
        subt_st_dt =    params["cont_start"]
        subt_ed_dt =    params["cont_end"]
        font_name =     params["font"]
        font_size =     params["font_size"]
        font_color =    params["font_color"]
        font_bg_color = params["font_bg_color"]
        subt_text1 =    params["subTitle_1"]
        subt_text2 =    params["subTitle_2"]
        subt_text3 =    params["subTitle_3"]
        subt_text4 =    params["subTitle_4"]
        subt_text5 =    params["subTitle_5"]
        cont_effect =   params["cont_effect"]

        if subt_st_dt == "":
            subt_st_dt = None
        if subt_ed_dt == "":
            subt_ed_dt = None

        try:
            contentObj = ContentsModel.find_by_id(cont_seq)
            contentObj.cont_nm =        cont_nm
            contentObj.cont_tag =       cont_tag
            contentObj.cont_st_dt =     subt_st_dt
            contentObj.cont_ed_dt =     subt_ed_dt
            contentObj.mdfy_dt =        datetime.now()

            contentObj.save_to_db()

            subTitleObj = SubtitleModel.find_by_cont_id(cont_seq)

            subTitleObj.subt_st_dt =    subt_st_dt
            subTitleObj.subt_ed_dt =    subt_ed_dt
            subTitleObj.font_name =     font_name
            subTitleObj.font_size =     font_size
            subTitleObj.font_color =    font_color
            subTitleObj.font_bg_color = font_bg_color
            subTitleObj.subt_text1 =    subt_text1
            subTitleObj.subt_text2 =    subt_text2
            subTitleObj.subt_text3 =    subt_text3
            subTitleObj.subt_text4 =    subt_text4
            subTitleObj.subt_text5 =    subt_text5
            subTitleObj.cont_effect =   cont_effect
            subTitleObj.mdfy_dt =       datetime.now()

            subTitleObj.save_to_db()

            # 이후 적용된 자막들 모두 UPDATE !!!
            # 배포 자막 모두 처리 !!!!!!!!!!!!!

            contSubTimeObj = [dict(r) for r in ContSubtitleModel.find_by_id_all(cont_seq)]

            for idx in contSubTimeObj:
                contSubID = idx['contcon_id']

                print("배포된 자막 처리 아이디 : ["+str(contSubID)+"]")

                contSubTitleObj = ContSubtitleModel.find_by_id(contSubID)

                
                contSubTitleObj.subt_nm =           cont_nm
                contSubTitleObj.subt_st_dt =        subt_st_dt
                contSubTitleObj.subt_ed_dt =        subt_ed_dt
                contSubTitleObj.subt_font =         font_name
                contSubTitleObj.subt_font_size =    font_size
                contSubTitleObj.subt_font_color =   font_color
                contSubTitleObj.subt_font_bcolor =  font_bg_color
                contSubTitleObj.subt_text1 =        subt_text1
                contSubTitleObj.subt_text2 =        subt_text2
                contSubTitleObj.subt_text3 =        subt_text3
                contSubTitleObj.subt_text4 =        subt_text4
                contSubTitleObj.subt_text5 =        subt_text5
                contSubTitleObj.cont_effect =       cont_effect
                contSubTitleObj.mdfy_dt =           datetime.now()

                contSubTitleObj.save_to_db()

        except Exception as e:
            logging.fatal(e, exc_info=True)
            return {'resultCode': '100', "resultString": "자막 "+ cont_nm +" 수정에 실패하였습니다."}, 500

        return {'resultCode': '0', "resultString": "자막 "+ cont_nm +" 수정에 성공하였습니다."}, 200

    def delete(self):
        return {'resultCode': '0', "resultString": "SUCCESS" }, 200
