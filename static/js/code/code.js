$(function() {

    //왼쪽 메뉴 사이트 관리 활성화
    $('#menu_code').addClass("active");

    //검색조건 닫기
    $("div button i").click();


    //************************************설치자관리 등록 팝업 open 시작***************************
    $("#btnInsertOpen").click(function(e) {

        $(this).attr("data-target","#modal-default")

     });


    $("#btnInsertOpen2").click(function(e) {

        $(this).attr("data-target","#modal-fullsize")

     });




});

var closePopup = function(){

    $("#modal-default").modal('hide');
};



