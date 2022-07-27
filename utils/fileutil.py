import os
import logging


class FileUtils:

    @staticmethod
    # file_info : aaa.txt
    # action: 파일 확장자 추출
    # return '.txt'
    def get_file_ext(file_info):

        file_name, file_ext = os.path.splitext(file_info)

        return file_ext

    @staticmethod
    # file_info : aaa.txt
    # action: 파일명 추출
    # return 'aaa'
    def get_file_name(file_info):

        file_name, file_ext = os.path.splitext(file_info)

        return file_name

    @staticmethod
    # file_info : aaa.txt
    # action: 파일 확장자 추출
    # return {'aaa', 'txt)
    def get_file_info(file_info):

        file_info = os.path.splitext(file_info)

        return file_info

    @staticmethod
    # param file : file
    # param path : path
    # action : 해당 패스에 파일 저장
    # return : true / false
    def save_file(file, path, filename):

        is_save = True

        try:

            if FileUtils.is_directory(path):
                file.save(os.path.join(path, filename))
            else:
                raise NotADirectoryError(" not create directory : %s" % path)

        except OSError as ie:

            is_save = False
            logging.fatal(ie, exc_info=True)

        except NotADirectoryError as e:

            is_save = False
            logging.fatal(e, exc_info=True)

        return is_save

    @staticmethod
    # param path : path
    # action : 해당 패스에 파일 삭제
    # return : true / false
    def delete_file(path, filename):

        is_delete = True

        file_path = path + filename
        try:

            if os.path.exists(file_path):
                os.remove(file_path)

        except OSError as ie:

            is_delete = False
            logging.fatal(ie, exc_info=True)

        except NotADirectoryError as e:

            is_delete = False
            logging.fatal(e, exc_info=True)

        return is_delete

    @staticmethod
    # param path : path
    # action : 해당 패스에 파일 삭제
    # return : true / false
    def delete_all_file(path):

        import shutil

        is_delete = True
        try:

            if os.path.exists(path):

                shutil.rmtree(path)

        except OSError as ie:

            is_delete = False
            logging.fatal(ie, exc_info=True)

        except NotADirectoryError as e:

            is_delete = False
            logging.fatal(e, exc_info=True)

        return is_delete

    @staticmethod
    # param file : aaa.txt
    # param path : path
    # action : 패스에서 화일 존재 유무 체크
    # return : true / false
    def is_directory(path):

        is_check = True

        try:
            # 사용자 이미지 디렉토리 확인 후 생성
            if not os.path.exists(path):
                os.makedirs(path)

        except OSError as e:

            logging.fatal(e, exc_info=True)
            return False
        return is_check

    @staticmethod
    # param path : path
    # action : return file list for path
    # return : list
    def get_file_list(path):

        file_list = []
        try:
            file_list = os.listdir(path)
        except OSError as e:

            logging.fatal(e, exc_info=True)
            return file_list
        return file_list
