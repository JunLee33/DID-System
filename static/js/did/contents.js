/*
 * Contents.js
 * contents management script file. created by WAVIEW(2021)
*/

var cont_type = '';
var m_link = '';
var dataList = "";
var nowContentsType = "all";
var nowContTp   = "";
var subTitle_seq = "";
var frame_status = "F";
var totalData;
var dataPerPage = 21;               // (바둑판) 한 페이지에 나타낼 데이터 수
var pageCount = 3;                  // (바둑판) 한 화면에 나타낼 페이지 수
var now_disk;
var user_disk;
var tag = {};
var counter = 0; //인덱스
var count = 0; // 태그 개수(validation check용)
var now_user_gr;

$(function(){
    var totalAddCount = 0;
    $.ajax({
        type: "GET",
        url: "/user/search?user_gr=0000",
        
        success : function(json) {
            user_disk = json.user_disk;
            now_disk = json.now_disk;
            now_user_gr = json.resultUserGroup;
            if(now_user_gr == "0101"){
                alert("슈퍼관리자는 접근할 수 없는 주소입니다.")
                $("#mn_dashboard").hide();
                $("#mn_settop").hide();
                $("#mn_contents").hide();
                $("#mn_design").hide();
                $("#mn_schedule").hide();

                location.href = "/user";
            }
        },
        error: function(json){
            // alert(json.responseJSON.resultString)
        }
    });
    

    // subTitle disable. 
    $("#subTileDiv-2").hide();
    $("#subTileDiv-3").hide();
    $("#subTileDiv-4").hide();
    $("#subTileDiv-5").hide();

    $("#btnUpdateText").hide();
    $("#btnDeleteText").hide();
    
    $('#cont_start , #cont_end ,#sub_start , #sub_end, #sub_url_start, #sub_url_end').datepicker({
        autoclose: true
        ,format: 'yyyy-mm-dd'
        ,language: "kr"
        ,calendarWeeks: false
        ,todayHighlight: true
        ,showInputs: false
    });

    reloadPage(1,"");

    $("#btn_view_frame, #btn_view_list").click(function(){
        //1. 바둑판 형 클릭        
        if ($(this).attr("id") == "btn_view_frame"){        
            frame_status = "F";
            reloadPage(1,"");    

        //2. 리스트 형 클릭     
        }else{
            $('#btn_view_frame').removeClass('active');
            $('#btn_view_list').addClass('active');
            $('#view_list').show();
            $('#view_frame').hide();

            frame_status = "L";

            dataList =$('#data_list').DataTable({
                "lengthChange": false,
                "destroy": true,
                "paging": false,
                "searching": false,
                "ordering": false,
                "info": false,
                "autoWidth": true,
                "processing": true,
                "serverSide": true,

                ajax : {
                    "url": "/contents/search?cont_apply=&cont_tp="+nowContTp,
                    "type":"POST"
                },

                "columns": [
                        { data: "row_cnt"},
                        { data: "cont_nm"},
                        { data: "cont_org_nm"},
                        { data: null,
                                render: function(data, type, full, meta){
                                if(data.cont_tp == "I")  return "<label>이미지</label>";
                                else if(data.cont_tp == "M")  return "<label>동영상</label>";
                                else if(data.cont_tp == "W")  return "<label>Web</label>";
                                else if(data.cont_tp == "L")  return "<label>라이브</label>";
                                else  return "<label>자막</label>";
                                }
                        },
                        { data: null,
                                render: function(data, type, full, meta){
                                    if(data.cont_tp == "I"){
                                    return "<label>"+(Number(data.cont_size) / 1000).toFixed(1) + " KB</label>"
                                }else{
                                    return "<label>"+(Number(data.cont_size) / 1000000).toFixed(3) + " MB</label>"
                                }
                            }
                        },
                        {
                                // 미리보기 이벤트
                                data: null,
                                render: function(data, type, full, meta){
                                    if(data.cont_yn == "N"){
                                        return " <img src='/static/contents/common/thumbnail/trash_con.png' width=50px; height=50px;/>";
                                    }else if(data.cont_tp == "T"){
                                        return " <img src='/static/contents/common/thumbnail/txt_con.png' width=50px; height=50px;/>";
                                    }else if(data.cont_tp == "W"){
                                        return " <img src='/static/contents/common/thumbnail/web_con.png' width=50px; height=50px;/>";
                                    }else if(data.cont_tp == "L"){
                                        return " <img src='/static/contents/common/thumbnail/live_con.png' width=50px; height=50px;/>";
                                    }else{
                                        return " <img src='"+ data.cont_thu_url+"' onerror = 'this.src=`/static/contents/common/thumbnail/image_con.png`;'  width=50px; height=50px;/>";
                                    }
                                }
                            },
                        { data: "cont_med_tm"}, //재생시간
                        { data: "period"},  //사용기간
                        {
                                // 콘텐츠 삭제 유무 디스플레이
                                data: null,
                                render: function(data, type, full, meta){
                                    if(data.cont_yn == "Y"){
                                    return "<label>사용 중</label>"
                                }else{
                                    return "<label style='color:#990000'>삭제 됨</label>"
                                }
                                }
                        },
                        {
                            data:           null,
                            render: function(data, type, full, meta){
                                // 해당 row 삭제 유무에 따라서 상세보기 활성화 비활성화
                                disabled = "";
                                btn_style = "";
                                if(data.cont_yn == "N"){
                                    disabled = " disabled = true ";
                                    btn_style = " buttons-collection btn-link";
                                }else{
                                    btn_style = " btn_point buttons-collection buttons-colvis";
                                }
                                if(data.cont_thu_url == "") var url="&nbsp";
                                else  var url = data.cont_thu_url;

                                // console.log("URL : ["+url+"]");

                                var cont_string = "";

                                // cont.url subTitle 처리용
                                if(data.cont_tp == "T"){
                                    if(data.cont_url) contURL  = data.cont_url;
                                    else contURL  = "&nbsp";
                                    //  b.font_name, b.font_size, b.font_color, b.font_bg_color, b.cont_effect, b.cont_duration,
                                    cont_string = " font_name="+data.font_name +" font_size="+data.font_size+" font_color="+data.font_color+" font_bg_color="+data.font_bg_color+" cont_effect="+data.cont_effect+" cont_duration="+data.cont_duration;
                                } else {
                                    contURL  = data.cont_url;
                                }

                                return "<button  title='상세보기' class=' btn_point "+
                                        "buttons-collection buttons-colvis' value="+data.cont_id+
                                        " cont_nm="+data.cont_nm.replace(/ /gi,"_") +" cont_tp="+data.cont_tp+cont_string+
                                        " cont_size="+data.cont_size + " cont_med_tm="+data.cont_med_tm+
                                        " cont_url="+contURL.replace(/ /gi,"_") + " cont_thu_url="+url+" cont_st_dt="+data.cont_st_dt +" cont_ed_dt="+data.cont_ed_dt +
                                        " cont_yn = "+data.cont_yn+" data-toggle='modal' "+disabled+" cont_tag = "+data.cont_tag+">상세보기</button>";
                            }
                        }
                ],
                "columnDefs": [
                    {"className": "table-middle", "targets": "_all" }
                ],

                "rowCallback": function( row, data, iDisplayIndex ) {

                },
                "paging": true,
                "pageLength": 8,
                "language": {
                    "zeroRecords": "데이터가 존재하지 않습니다."
                },
        
                dom: "<'row'<'col-sm-6'l><'col-sm-6'f>>" +
                     "<'row'<'col-sm-12'tr>>" +
                     "<'row'<'col-sm-12'p>>"
            });
        }
    });

    // 검색어 검색하기 ////////////////////////////////////////////////////////////////////////////////////////////////
    $("#btnSearch").off();
    $("#btnSearch").on("click",function(){
        

        var params = ""
        var schType = $("#schType").val();
        var schTxt  = $("#schTxt").val();

        if(schTxt.length > 0){
            if(schType =="cont_nm"){
                params = "&cont_nm="+schTxt;
            }else if(schType =="cont_file_nm"){
                params = "&cont_file_nm="+schTxt;
            }
        }

        if(frame_status == "L"){
            dataList.ajax.url("/contents/search?cont_apply=C&cont_tp="+params).load();
        }else{
            reloadPage(1, params);
        }
    });
    


    // 콘텐츠 추가 팝업 열기 ////////////////////////////////////////////////////////////////////////////////////////////////
    $("#btn_cont_add").click(function(){
        if(now_disk >= user_disk){
            alert("추가가능한 콘텐츠 용량("+(user_disk/1000000)+"MB)를 모두 사용하셨습니다.")
            return;
        }
        if(now_user_gr == '0101'){
            alert("슈퍼관리자는 콘텐츠를 등록할 수 없습니다.")
            return;
        }
        $("#file_preview-1").attr('onerror',"")
        $("label[for='contents_act']").text('콘텐츠 추가');
        $('#sub_modalTitle').text('콘텐츠 추가'); 1111111010
        $('#modalTitle').text('콘텐츠 추가'); 
        $('#labelFunction').text('콘텐츠 추가'); 
        //해쉬태그 청소
        tag = {};
        counter = 0;
        count = 0;
        $("#tag-list").html("");
        $("#rdTag").attr("value", "");
        $("#tag").val("");
        $("#sub_tag-list").html("");
        $("#sub_rdTag").attr("value", "");
        $("#sub_tag").val("");
        result = "";
        //해쉬태그 처리 끝

        // $('#gcInsert').modal('show');

        if(nowContTp == 'T') {
            // 그외의 Contents 일 경우 별도 UI 보여주기
            // ETC_INPUT -- enable , MI_INPUT -- disable
            $("#cont_effect").val("all").prop("selected", true);
            $("#font_color").val('FF000000'); //값 초기화
            $("#font_bg_color").val('FFFFFFFF');
            // 현재 ADD 버튼일 경우 수정/삭제 숨김
            $("#btn_add1").show();
            $('#btnUpdateText').hide();
            $('#btnDeleteText').hide();
            $('#btnInsertText').show();
            
            $('#modalSubTitle').modal('show');
            

        } else {
            // M, I 일 경우 기존입력 폼 보여주기
            // MI_INPUT - enable , ETC_INPUT -- disable

            $('#gcInsert').modal('show');

            if(nowContTp == 'M' || nowContTp == 'I' ) {
                if(nowContTp=='M') $('#mi_type').text('재생시간');
                if(nowContTp=='I') $('#mi_type').text('유형');
                $("#file_preview-1").attr("src","");
                $("#file_preview-1").show();
                $('#MI_INPUT1').show();
                $('#MI_INPUT2').show();
                $('#MI_INPUT3').show();
                $('#URL_INPUT').hide();
            } else {
                $("#file_preview-1").hide();
                $('#MI_INPUT1').hide();
                $('#MI_INPUT2').hide();
                $('#MI_INPUT3').hide();
                $('#MI_INPUT4').show();
                $('#URL_INPUT').show();
            }
            
        }
        
        $('#btnInsert').show();
        $('#btnUpdate').hide();
        $('#btnDelete').hide();

    });
    
    // 콘텐츠 상세보기 ////////////////////////////////////////////////////////////////////////////////////////////////
    // 상세보기
    $('#data_list tbody').on('click', 'button', function () { 
        $("#file_preview-1").show();
        if($(this).attr("cont_yn")=="N"){
            alert("해당 콘텐츠는 이미 삭제되어 상세보기를 할 수 없습니다.")
            return;
        }
        var cont_seq = $(this).val();
        var cont_nm = $(this).attr("cont_nm");
        cont_nm = cont_nm.replace(/_/gi," ");
        var cont_tp = $(this).attr("cont_tp");
        var cont_size = $(this).attr("cont_size");
        var cont_med_tm = $(this).attr("cont_med_tm");
        var cont_url = $(this).attr("cont_url");
        m_link = cont_url;
        var cont_thu_url = $(this).attr("cont_thu_url");
        var cont_st_dt = $(this).attr("cont_st_dt");
        var cont_ed_dt = $(this).attr("cont_ed_dt");
        var cont_tag = $(this).attr("cont_tag"); 
        
        console.log(cont_url);
        if(cont_tag){
            var tag_array = cont_tag.split(',');
            if(tag_array[0] != "null"){ // 값이 없는 경우
                if(cont_tp != 'T'){
                    for(var i = 0; i < tag_array.length; i++){
                        $("#tag-list").append("<li class='tag-item' style='margin:0 0 0 0; padding: 0 0 0 0; border:0; float:left'>#"+tag_array[i]+"<span class='del-btn' idx='"+counter+"' style='color:red'> X</span>&nbsp;&nbsp;&nbsp;</li>");
                        addTag(tag_array[i]);
                    }
                }else{
                    for(var i = 0; i < tag_array.length; i++){
                        $("#sub_tag-list").append("<li class='tag-item' style='margin:0 0 0 0; padding: 0 0 0 0; border:0; float:left'>#"+tag_array[i]+"<span class='del-btn' idx='"+counter+"' style='color:red'> X</span>&nbsp;&nbsp;&nbsp;</li>");
                        // $("#sub_tag-list").append("<li class='sub_tag-item' style='margin:0 0 0 0; padding: 0 0 0 0; border:0; float:left'><span class='del-btn' idx='"+counter+"'>#</span>"+tag_array[i]+"&nbsp;&nbsp;</li>");
                        addTag(tag_array[i]);
                    }
                }
            }
        }

        $('#modalTitle').text('콘텐츠 조회');
        $('#sub_modalTitle').text('콘텐츠 조회'); 
        $('#modalTitle').text('콘텐츠 조회'); 
        $('#labelFunction').text('콘텐츠 조회'); 

        // 수정/삭제 및 상세보기 내역 Toggle. 
        // ETC_INPUT -- enable , MI_INPUT -- disable
        if(nowContentsType == 'M' || nowContentsType == 'I') {
             // 수정 & 신규 관련 내용 정리 다시 해야 함. 
            $('#gcInsert').modal('show');
            $("#file_preview-1").show();

            // M, I 일 경우 기존입력 폼 보여주기
            // MI_INPUT - enable , ETC_INPUT -- disable
            $('#MI_INPUT1').show();
            $('#MI_INPUT2').show();
            $('#MI_INPUT3').show();
            $('#URL_INPUT').hide();

        } else if(nowContentsType == 'W' || nowContentsType == 'L'){

            $('#gcInsert').modal('show');
            $("#file_preview-1").hide();
            $('#MI_INPUT1').hide();
            $('#MI_INPUT2').hide();
            $('#MI_INPUT3').hide();
            $('#URL_INPUT').show();
        } else if(nowContentsType == 'T'){
            $('#labelSubFunction').text('콘텐츠 조회'); 

            $('#modalSubTitle').modal('show');
            // 등록가리기, 수정-삭제 보이기
        
            $('#btnUpdateText').show();
            $('#btnDeleteText').show();
            $('#btnInsertText').hide();

        } else {
            // 그외의 Contents 일 경우 별도 UI 보여주기
            // ETC_INPUT -- enable , MI_INPUT -- disable

            // ALL 일 경우 예외 처리
            if(cont_tp == 'M' || cont_tp == 'I') {
                $('#gcInsert').modal('show');
                $("#file_preview-1").show();
                $('#MI_INPUT1').show();
                $('#MI_INPUT2').show();
                $('#MI_INPUT3').show();
                $('#URL_INPUT').hide();
            } else if(cont_tp == 'W' || cont_tp == 'L'){
                $('#gcInsert').modal('show');
                $("#file_preview-1").hide();
                $('#MI_INPUT1').hide();
                $('#MI_INPUT2').hide();
                $('#MI_INPUT3').hide();
                $('#URL_INPUT').show();

            } else if(cont_tp == 'T'){
                $('#labelSubFunction').text('콘텐츠 조회'); 
                $('#modalSubTitle').modal('show');
                $('#btnUpdateText').show();
                $('#btnDeleteText').show();
                $('#btnInsertText').hide();
            }
        }

        // File 수정 부분 가리기
        // $('#fileDesc').css("display", "none");
        $('#fileDesc').hide();
        $('#btnInsert').hide();
        $('#div_cont_detail').css("display", "block");

        // 상세보기 에선 content add 버튼 가리기
        $('#btn_add').css("display", "none");
        $('#btn_save').css("display", "none");
        $('#btn_change').css("display", "none");    // arnold, disable
        $('#btn_delete').css("display", "none");    // arnold, disable

        $('#btn_download').css("display", "inline");

        $('#btn_download').attr('action',cont_url);

        // ID setting

        $('#cont_seq').val(cont_seq);
        $('#cont_seq_2').val(cont_seq);
        
        
        // 이미지 이름 설정

        var nmTextField = '#cont_nm-1';
        $(nmTextField).val(cont_nm);

        // 타입 가져오기 (타입은 하단 IF 문에서 set value)
        var typeTextField = '#cont_tp-1';

        // Global 변수 세팅(arnold)
        cont_type = typeTextField;

        var sizeTextField = '#cont_size-1';

        
        // $('#file_size_text-1').val((cont_size /1000).toFixed(1)  + " KB");
        // $('#cont_size-1').val((cont_size /1000).toFixed(1)  + " KB");

        // 사이즈 가져오기
        if(cont_tp == "I"){
             $('#file_size_text-1').val((cont_size /1000).toFixed(1)  + " KB");
             $('#mi_type').text('유형');
        }else if(cont_tp == "M") {
             $('#file_size_text-1').val((cont_size / 1000000).toFixed(3) + " MB");
             $('#mi_type').text('재생시간');
        }


        if(cont_tp == "I"){

            $('#file_type_text-1').val("이미지");
            //이미지 출현시 비디오 숨기기
            $("#file_preview-1").css("display","block");
            
            // 비디오 현재 동결
            //$("#div_cont_detail #cont_video").css("display","none");
            $("#file_preview-1").attr("src",cont_url);
            $("#file_preview-1").removeClass("btn");
            $("#file_preview-1").removeAttr( 'onclick' );
            $("#file_preview-1").removeAttr( 'title' );
            $("#file_preview-1").attr("onerror","this.src='/static/contents/common/thumbnail/image_con.png';");
            $('#cont_med_tm_area-1').css("display","none");
            if(cont_st_dt == "null"){
                cont_st_dt = "";
            }
            if(cont_ed_dt == "null"){
                cont_ed_dt = "";
            }
            $("#cont_start").val(cont_st_dt);
            $("#cont_end").val(cont_ed_dt);

        }else if(cont_tp == "M"){
            //비디오 출현시 이미지 숨기기
            $('#file_type_text-1').val(parseInt(cont_med_tm/60) + "m " + parseInt(cont_med_tm%60) + "s");
            $("#file_preview-1").addClass("btn");
            $("#file_preview-1").attr("src",cont_thu_url);
            $("#file_preview-1").attr("title","재생");
            $("#file_preview-1").attr("onclick","window.open('"+cont_url+"')");
            $("#file_preview-1").attr("onerror","this.src='/static/contents/common/thumbnail/video_con.png';");
            

            // 사이즈 가져오기
            $('#cont_med_tm_area-1').css("display","block");
            $('#cont_med_tm-1').attr('readonly',true);
            $('#cont_med_tm-1').val(cont_med_tm + " 초");
            if(cont_st_dt == "null"){
                cont_st_dt = "";
            }
            if(cont_ed_dt == "null"){
                cont_ed_dt = "";
            }

            $("#cont_start").val(cont_st_dt);
            $("#cont_end").val(cont_ed_dt);
        }else if(cont_tp == "T"){
            // contents ID 로 기본 정보 검색
            // var cont_ed_dt = $(this).attr("cont_ed_dt");
            //  b.font_name, b.font_size, b.font_color, b.font_bg_color, b.cont_effect, b.cont_duration,
            subTitle_seq= cont_seq;
            $("#subTitle_1").val("");
            $("#subTitle_2").val("");
            $("#subTitle_3").val("");
            $("#subTitle_4").val("");
            $("#subTitle_5").val("");
            if($(this).attr("font_name") == 'undefined'){
                // ajax 이용해서 subtitle 정보 가져옴.
                $.ajax({
                    type: "GET",
                    url: "/contents/subtitle?cont_seq="+cont_seq,
                    success : function(json) {
                        var obj =json;
                        sleep(500);
                        $("#cont_nm-2").val(cont_nm);
                        $("#font").val(obj.data[0].font_name);
                        $("#font_size").val(obj.data[0].font_size);
                        //자막 포커싱
                        $("#font_size").val(obj.data[0].font_size).prop("selected", true);
                        
                        
                        $("#font_color").val(obj.data[0].font_color);
                        $("#font_bg_color").val(obj.data[0].font_bg_color);
                        $("#cont_effect").val(obj.data[0].cont_effect).prop("selected", true);

                        $("#subTitle_1").val(obj.data[0].subt_text1);
                        console.log(obj.data[0]);
                        if(obj.data[0].subt_text2 != "") {
                            $("#subTitle_2").val(obj.data[0].subt_text2);
                            $("#subTileDiv-2").show();
                            $("#btn_add1").hide();
                        } else $("#subTileDiv-2").hide();

                        if(obj.data[0].subt_text3 != "") {
                            $("#subTitle_3").val(obj.data[0].subt_text3);
                            $("#subTileDiv-3").show();
                            $("#btn_add2").hide();
                            $("#btn_remove2").hide();
                        } else $("#subTileDiv-3").hide();

                        if(obj.data[0].subt_text4 != "") {
                            $("#subTitle_4").val(obj.data[0].subt_text4);
                            $("#subTileDiv-4").show();
                            $("#btn_add3").hide();
                            $("#btn_remove3").hide();
                        } else $("#subTileDiv-4").hide();

                        if(obj.data[0].subt_text5 != "") {
                            $("#subTitle_5").val(obj.data[0].subt_text5);
                            $("#subTileDiv-5").show();
                            $("#btn_add4").hide();
                            $("#btn_remove4").hide();
                        } else $("#subTileDiv-5").hide();

                        $("#sub_start").val(obj.data[0].subt_st_dt);
                        $("#sub_end").val(obj.data[0].subt_ed_dt);

                        if($("#sub_start").val() == "null"){
                            $("#sub_start").val("");
                        }
                        if($("#sub_end").val() == "null"){
                            $("#sub_end").val("");
                        }
                    },
                    error: function(){
                      alert("자막 상세 조회시 에러가 발생하였습니다. 다시 시도해 주세요");
                    }
               });

            }else{
                // 기본 정보를 보여 줌 (button 정보 이용)
                $("#cont_nm-2").val(cont_nm);
                $("#font").val($(this).attr("font_name"));
                $.ajax({
                    type: "GET",
                    url: "/contents/subtitle?cont_seq="+cont_seq,
                    success : function(json) {
                        console.log(obj);
                        var obj =json;
                        sleep(500);
                        $("#font_size").val(obj.data[0].font_size);
                        $("#font_size").val(obj.data[0].font_size).prop("selected", true);
                    },
                    error: function(){
                        alert("자막 상세 조회시 에러가 발생하였습니다. 다시 시도해 주세요");
                    }
                });


                $("#font_color").val($(this).attr("font_color"));
                $("#font_bg_color").val($(this).attr("font_bg_color"));
                $("#cont_effect").val($(this).attr("cont_effect")).prop("selected", true);

                // String parsing
                var sutString = $(this).attr("cont_url");
                var subStringObj = sutString.split("^");
                var subStringReal = subStringObj[0];
                subStringReal = subStringReal.replace(/_/gi," ");
                $("#subTitle_1").val(subStringReal);
                
                
                subStringReal = subStringObj[1];
                // console.log("String Lenngth : ["+subStringReal.length+"]");
                if(subStringReal.length >= 3) {
                    $("#subTileDiv-2").show();
                    subStringReal = subStringReal.replace(/_/gi," ");
                    $("#subTitle_2").val(subStringReal);
                }
                else $("#subTileDiv-2").hide();
                
                

                subStringReal = subStringObj[2];
                // console.log("String Lenngth : ["+subStringReal.length+"]");
                if(subStringReal.length >= 1) {
                    $("#subTileDiv-3").show();
                    subStringReal = subStringReal.replace(/_/gi," ");
                    $("#subTitle_3").val(subStringReal);
                }
                else $("#subTileDiv-3").hide();
                
                

                subStringReal = subStringObj[3];
                // console.log("String Lenngth : ["+subStringReal.length+"]");
                if(subStringReal.length >= 1) {
                    $("#subTileDiv-4").show();
                    subStringReal = subStringReal.replace(/_/gi," ");
                    $("#subTitle_4").val(subStringReal)
                }
                else $("#subTileDiv-4").hide();
                

                subStringReal = subStringObj[4];
                // console.log("String Lenngth : ["+subStringReal.length+"]");
                if(subStringReal.length >= 1) {
                    $("#subTileDiv-5").show();
                    subStringReal = subStringReal.replace(/_/gi," ");
                    $("#subTitle_5").val(subStringReal);
                }else $("#subTileDiv-5").hide();
                
                if(cont_st_dt == "null") cont_st_dt = "";
                if(cont_ed_dt == "null") cont_ed_dt = "";
                $("#sub_start").val(cont_st_dt);
                $("#sub_end").val(cont_ed_dt);
            }
        }else if(cont_tp == "W" || cont_tp == "L"){
            // 기본 정보를 보여 줌
            $("#file_preview-1").hide();
            $("#cont_nm_url").val(cont_nm);
            $("#cont_url").val(cont_url);
            if(cont_st_dt == "null") cont_st_dt = "";
            if(cont_ed_dt == "null") cont_ed_dt = "";
            $("#sub_url_start").val(cont_st_dt);
            $("#sub_url_end").val(cont_ed_dt);
        }
        $("#btnUpdate").attr('cont_tp', cont_tp);
        $("#btnDelete").attr('cont_tp', cont_tp);
        $("#btnUpdateText").attr('cont_tp', cont_tp);
        $("#btnDeleteText").attr('cont_tp', cont_tp);
        
    });


    // Modal 관련 파일 불러오기 Settings. ///////////////////////////////////////////////////////////////////////
    var i = totalAddCount;
    
    $(document).off('change',"#file_nm-1");

    $(document).on('change',"#file_nm-1" , function(event) {

        var file = event.target.files[0];

        if (file.name.length >= 50) {
            alert("파일의 글자수가 너무 많습니다");
            $('#file_preview-1').attr('src',"");
            $('#file_nm_text-1').val('');
            return;
        }
        var fileReader = new FileReader();


        if (file.type.match('image')) {
            fileReader.onload = function() {
                    var img = '#file_preview-1';
                    $(img).attr("src",fileReader.result);
                    $(img).css("display","block");

                // 이미지 이름 설정
                var nmTextField = '#file_nm_text-1';
                $(nmTextField).val(file.name);

                // 타입 가져오기
                var typeTextField = '#file_type_text-1';
                var typeField = '#file_type-1';
                $(typeTextField).val(file.type);
                $(typeField).val("I");

                // 사이즈 가져오
                var sizeTextField = '#file_size_text-1';
                var sizeField = '#file_size-1';

                $(sizeTextField).val((file.size /1000).toFixed(1)  + " KB");
                $(sizeField).val(file.size);
                //document.getElementById(urlField).value=file.getAsDataURL();
            };
            fileReader.readAsDataURL(file);
            //$(loadingTarget).css("display","none");

        } else {
            //LoadingWithMask();
            fileReader.onload = function() {
                var blob = new Blob([fileReader.result], {
                    type: file.type
                });
                var url = URL.createObjectURL(blob);
                var video = document.createElement('video');
                var timeupdate = function() {
                    if (snapImage()) {
                        video.removeEventListener('timeupdate', timeupdate);
                        video.pause();
                    }
                };
                video.addEventListener('loadeddata', function() {
                    if (snapImage()) {
                        video.removeEventListener('timeupdate', timeupdate);
                    }
                });
                var snapImage = function() {
                    // 비디오 재생시간
                    console.log(video.duration);
                    var canvas = document.createElement('canvas');
                    canvas.width = video.videoWidth;
                    canvas.height = video.videoHeight;
                    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
                    var image = canvas.toDataURL();
                    var success = image.length > 100000;
                    if (success) {
                        var img = '#file_preview-1';
                        $(img).attr("src",image);
                        $(img).css("display","block");

                        // 이미지 이름 설정
                        var nmTextField = '#file_nm_text-1';
                        $(nmTextField).val(file.name);


                        // 타입 가져오기
                        var typeTextField = '#file_type_text-1';
                        var typeField = '#file_type-1';
                        // $(typeTextField).val(file.type); (김동수: 비디오는 유형대신 재생시간이 나오도록 함)
                        $(typeTextField).val(parseInt(video.duration/60) + "m " + parseInt(video.duration%60) + "s");
                        
                        $(typeField).val("M");

                        // 사이즈 가져오기
                        var sizeTextField = '#file_size_text-1';
                        var sizeField = '#file_size-1';
                        $(sizeTextField).val((file.size / 1000000).toFixed(3) + " MB");
                        $(sizeField).val(file.size);

                        var medTmField = '#file_med_tm-1';
                        $(medTmField).val(Math.round(video.duration));
                        $(medTmField).attr("readonly",true);

                    }
                    return success;
                };
                video.addEventListener('timeupdate', timeupdate);
                video.preload = 'metadata';
                video.src = url;
                // Load video in Safari / IE11
                video.muted = true;
                video.playsInline = true;
                video.play();
            };

            fileReader.readAsArrayBuffer(file);
            //$(loadingTarget).css("display","none");
        }
    });



    // 콘텐츠 추가하기 ////////////////////////////////////////////////////////////////////////////////////////////////
    // 팝업 내부에서 버튼 클릭시 추가등록한  콘텐츠 모두 저장
    // 필요사항
    // 등록하지 않은 탭 있는지 확인한다.
    // 제목은 파일명으로 등록
    // 패스는 로컬
    // 사이즈 현재 KB
    // 타입 이미지/동영상
    // 기타 데이터는 최상단에서 가져오기
    $("#btnInsert").click(function() {
        if(now_user_gr == '0101'){
            alert("슈퍼관리자는 콘텐츠를 수정할 수 없습니다.")
            return;
        }
        var url = "";
        var method = "";
        url = "/contents/insert";
        method = "POST";
        console.log("NOW CONTENTS TYPE = ["+nowContentsType+"]");

        //해시태그 처리
        var value = marginTag(); // return array
        $("#rdTag").val(value);
        var cont_tag = $("#rdTag").val();

        if(nowContentsType == 'W' || nowContentsType == 'L') {
            $("#file_type-1").val(nowContentsType);

            var cont_nm_url = $("#cont_nm_url").val();
            var cont_url = $("#cont_url").val();

            if(cont_nm_url == ""){
                alert("콘텐츠명을 입력 해 주세요");
                return;
            }else if(cont_nm_url.length > 30){
                alert("제목은 20자 이하여야 합니다.");
                return;
            }

            if(cont_url == ""){
                alert("URL을 입력해 주세요");
                return;
            }

            // if($("input[name=cont_url_end]").val() == "") {
            //     alert("종료날짜를 입력 해 주세요.")
            //     return;
            // }
            
            
            if($("input[name=cont_url_start]").val() != "" && $("input[name=cont_url_end]").val() != ""){
                if($("input[name=cont_url_start]").val() > $("input[name=cont_url_end]").val()){
                    $("input[name=cont_url_start]").val("");
                    $("input[name=cont_url_end]").val("");
                    alert("끝나는 날짜가 시작 날짜보다 빠릅니다. ");
                    return;
                }
            }

        } else {
            // common Contents에서는 기본적으로 Common만 사용한다.
            // 그러므로 default C
            var data_apply = "C";

            var input_query = $("#file_nm-1").val();

            if (input_query.length == 0) {
                alert("콘텐츠가 존재하지 않습니다");
                return;
            }
            
            if($("#cont_nm-1").val() == "") {
                alert("콘텐츠 명을 입력 해 주세요.")
                return;
            }else if($("#cont_nm-1").val().length > 30){
                alert("제목은 30자 이하여야 합니다.");
                return;
            }
            file_ext = $('#file_nm_text-1').val().slice(-4);
            
            file_ext = file_ext.toLowerCase();

            if(nowContentsType == 'I'){
                if(file_ext != ".jpg" && file_ext != ".png" && file_ext != "jpeg" && file_ext != ".bmp"){
                    alert("이미지 파일은 .jpg, .png, .jpeg, .bmp 파일만 지원합니다.");
                    return;
                }
            }else if(nowContentsType == 'M'){
                if(file_ext != ".mp4" && file_ext != ".avi" && file_ext != "mpeg" && file_ext != ".wmv" && file_ext != ".mpg"){
                    alert("동영상 파일은 .mp4, .avi, .mpeg, .wmv, .mpg 파일만 지원합니다.");
                    return;
                }
            }

            // if($("#cont_start").val() == "") {
            //         alert("시작날짜를 입력 해 주세요.")
            //         return;
            //     }
            // if($("#cont_end").val() == "") {
            //     alert("종료날짜를 입력 해 주세요.")
            //     return;
            // }
            if($("#cont_start").val() != "" && $("#cont_end").val() != ""){
                if($("#cont_start").val() > $("#cont_end").val()){
                    $("#cont_start").val("");
                    $("#cont_end").val("");
                    alert("종료날짜는 시작날짜 이후여야 합니다. ");
                    return;
                }
            }
            if(parseInt($("#file_size_text-1").val()) > (user_disk-now_disk)){
                alert("현재 잔여용량("+((user_disk-now_disk)/1000000)+"MB)보다 파일의 크기가 큽니다");
                return;
            }
            var addCount = 0;
            for (var i = 0; i < 1; i++) {

                index = i+addCount

                var typeField = 'file_type-' + (index);

                try{
                    var file_name = $("#cont_nm-"+index).val();
                    if (document.getElementById(typeField).value == false) {
                        alert("콘텐츠-" + (index + 1) + "에 파일을 등록하지 않았습니다.");
                        return;
                    }
                    if(file_name.length <=0){

                        alert("콘텐츠-" + (index + 1) + "에 파일명을 입력하지 않았습니다.");
                        return;
                    }
                }catch(error)
                {
                    i-=1;
                    addCount +=1;
                    continue
                }
                var file_apply = "#file_apply-" + (index);
                var file_type = "#file_type-" + (index);
                var file_size = "#file_size-" + (index);

                $(file_apply).val(data_apply.toString());
            }
        }

        var cont_start = new Date($("#cont_start").val());
        var cont_end = new Date($("#cont_end").val())

        if(cont_start > cont_end){
            alert("종료날짜는 시작날짜 이후여야 합니다.");
            return;
        }

        $("#formContent").attr("method","POST");
        var form_data = new FormData($('#formContent')[0]);
        //해시태그 처리
        form_data.set('cont_tag', cont_tag);


         /* progressbar 정보 */
        //  var bar = $('.bar');
         var bar = $('.progress-bar');
         var percent = $('.percent');
         var status = $('#status');
        
        $.ajax({
            type: method,
            enctype: 'multipart/form-data',
            url: url,
            data: form_data,
            processData: false,
            contentType: false,
            cache: false,
            timeout: 600000,
            xhr: function() {
                var xhr = new window.XMLHttpRequest();
                xhr.upload.addEventListener("progress", function(evt) {
                    if (evt.lengthComputable) {
                        var percentComplete = Math.floor((evt.loaded / evt.total) * 100);

                        /* Do something with upload progress here */
                        var percentVal = percentComplete + '%';
                        bar.width(percentVal);
                        percent.html(percentVal);

                    }
                }, false);
                return xhr;
            },
            success: function(data) {
                if($("#sel_cont_add option:selected").val() == "M" || nowContentsType == "M") $('#class_video').click();
                if($("#sel_cont_add option:selected").val() == "I" || nowContentsType == "I") $('#class_img').click();
                if($("#sel_cont_add option:selected").val() == "L" || nowContentsType == "L") $('#class_live').click();
                if($("#sel_cont_add option:selected").val() == "W" || nowContentsType == "W") $('#class_web').click();
                
                // alert(data.resultString);
                $("#gcInsert").modal('hide');
                //해쉬태그 청소
                tag = {};
                counter = 0;
                count = 0;
                $("#tag-list").html("");
                $("#rdTag").attr("value", "");
                $("#tag").val("");
                $("#sub_tag-list").html("");
                $("#sub_rdTag").attr("value", "");
                $("#sub_tag").val("");
                result = "";
                //해쉬태그 처리 끝
                $("#div_cont_add").html("");

                // 카운트 초기화
                totalAddCount =0;
                
                // 우측 대시보드 원형 로드 **
                reloadDashboard();
            },
            beforeSend:function(){
                // progress Modal 열기
                $("#pleaseWaitDialog").modal('show');
 
                status.empty();
                var percentVal = '0%';
                bar.width(percentVal);
                percent.html(percentVal);
            },
            complete:function(){
                // progress Modal 닫기
                $("#pleaseWaitDialog").modal('hide');

            },
            error: function(error) {
                console.log("ERROR : ", error);
                $("#gcInsert").modal('hide');
                $("#div_cont_add").html("");

                alert(error.responseJSON.resultString);
            }
        });
        closePopup();
    });

    // subTitle 관련 별도 정리
    $("#btnInsertText").click(function() {
        if(now_user_gr == '0101'){
            alert("슈퍼관리자는 콘텐츠를 등록할 수 없습니다.")
            return;
        }
        //해시태그 처리
        var value = marginTag(); // return array
        $("#sub_rdTag").val(value);
        var cont_tag = $("#sub_rdTag").val();
        // Validataion check. 

        if($("#cont_nm-2").val() == "") {
            alert("자막 명을 입력 해 주세요.")
            return;
        }

        if($("#font").val() == "all") {
            alert("폰트를 선택 해 주세요.")
            return;
        }

        if($("#font_size").val() == "all") {
            alert("폰트 크기를 선택 해 주세요.")
            return;
        }

        if($("#cont_effect").val() == "all") {
            alert("효과를 선택 해 주세요")
            return;
        }

        if($("#subTitle_1").val() == "") {
            alert("자막1을 입력 해 주세요.")
            return;
        }
        if($("#font_color").val().charAt(0) == '#'){
            var tmp_string = $("#font_color").val();
            var target_value = "";
            target_value = tmp_string.substring(7,9);
            target_value += tmp_string.substring(1,7);
            $("#font_color").val(target_value);
        }
        
        if($("#font_bg_color").val().charAt(0) == '#'){
            var tmp_string = $("#font_bg_color").val();
            var target_value = "";
            target_value = tmp_string.substring(7,9);
            target_value += tmp_string.substring(1,7);
            $("#font_bg_color").val(target_value);
        }
        
        var sub_start = new Date($("#sub_start").val());
        var sub_end = new Date($("#sub_end").val())

        if(sub_start > sub_end){
            $("#sub_start").val("");
            $("#sub_end").val("");
            alert("종료날짜는 시작날짜 이후여야 합니다.");
            return;
        }

        

        // if($("#sub_start").val() == "") {
        //     alert("시작날짜를 입력 해 주세요.")
        //     return;
        // }
        
        // if($("#sub_end").val() == "") {
        //     alert("종료날짜를 입력 해 주세요.")
        //     return;
        // }
        if($("#cont_nm-2").val().length > 100){
            alert("제목은 100자 이하여야 합니다.");
            return;
        }
        if($("#subTitle_1").val().length > 100){
            alert("자막1은 100자 이하여야 합니다.");
            return;
        }
        if($("#subTitle_2").val().length > 100){
            alert("자막2은 100자 이하여야 합니다.");
            return;
        }
        if($("#subTitle_3").val().length > 100){
            alert("자막3은 100자 이하여야 합니다.");
            return;
        }
        if($("#subTitle_4").val().length > 100){
            alert("자막4은 100자 이하여야 합니다.");
            return;
        }
        if($("#subTitle_5").val().length > 100){
            alert("자막5은 100자 이하여야 합니다.");
            return;
        }


        var form_data = new FormData();
        form_data.append('cont_nm', $("#cont_nm-2").val());
        form_data.append('cont_tp','T');
        form_data.append('cont_start',$("#sub_start").val());
        form_data.append('cont_end',$("#sub_end").val());
        form_data.append('font',$("#font").val());
        form_data.append('font_size',$("#font_size").val());
        form_data.append('font_color',$("#font_color").val());
        form_data.append('font_bg_color',$("#font_bg_color").val());
        form_data.append('cont_effect',$("#cont_effect").val());
        form_data.append('subTitle_1',$("#subTitle_1").val());
        form_data.append('subTitle_2',$("#subTitle_2").val());
        form_data.append('subTitle_3',$("#subTitle_3").val());
        form_data.append('subTitle_4',$("#subTitle_4").val());
        form_data.append('subTitle_5',$("#subTitle_5").val());
        form_data.set('cont_tag', cont_tag);
        // form_data.append('cont_seq_text');

        // var form_data = new FormData($('#formETC')[0]);
        // var form_data = new FormData();
        // form_data.append("cont_nm", $("#cont_nm-2").val());
        // // form_data.append("cont_url", cont_url);
        // form_data.append("cont_start", cont_start);
        // form_data.append("cont_end", cont_end);

        for (var pair of form_data.entries()) {
            // 예외처리 진행
            console.log(pair[0]+ ', ' + pair[1]);
        }

        console.log("NOW CONTENTS TYPE = ["+nowContentsType+"]");
        
        $.ajax({
            type: "POST",
            enctype: 'multipart/form-data',
            url: "/contents/insert",
            data: form_data,
            processData: false,
            contentType: false,
            cache: false,
            timeout: 600000,
            success: function(data) {
                // alert(data.resultString); //업로드창 안나오게 요청
                $("#modalSubTitle").modal('hide');
                $("#div_cont_add").html("");

                // 카운트 초기화
                totalAddCount =0;
                $("#class_text").click()
                closeSubTitlePopup();

            },
            beforeSend:function(){
                // (이미지 보여주기 처리)
                $('.wrap-loading').removeClass('display-none');
            },
            complete:function(){
                // (이미지 감추기 처리)
                $('.wrap-loading').addClass('display-none');
            },
            error: function(error) {
                console.log("ERROR : ", error.resultString);
                $("#modalSubTitle").modal('hide');
                $("#div_cont_add").html("");

                alert(error.responseJSON.resultString);
            }
        });
        closeSubTitlePopup();

    });


    // 콘텐츠 수정 ////////////////////////////////////////////////////////////////////////////////////////////////
    $("#btnUpdate").click(function() {
        if(now_user_gr == '0101'){
            alert("슈퍼관리자는 콘텐츠를 수정할 수 없습니다.")
            return;
        }

        var cont_seq = $("#cont_seq").val();
        var cont_tp = $(this).attr('cont_tp');
        var cont_url = $("#cont_url").val();
        var data_apply = "C";
        var cont_nm = $("#cont_nm-1").val();
        var url = "/contents/update/"+cont_seq;
        var method = "PUT";
        var cont_start = "";
        var cont_end = "";

        //해시태그 처리
        var value = marginTag(); // return array
        $("#rdTag").val(value);
        var cont_tag = $("#rdTag").val();

        if(cont_nm == ""){
            alert("파일명을 입력해주세요.")
            return;
        }else if(cont_nm.length > 30){
            alert("제목은 30자 이하여야 합니다.")
            return;
        }
        
        
        if(cont_tp == 'W' || cont_tp == 'L'){
            cont_nm = $("#cont_nm_url").val();
            if($("#cont_nm_url").val() == ""){
                alert("제목을 입력 해 주세요");
                return;
            }else if($("#cont_nm_url").val().length > 30){
                alert("제목은 30자 이하여야 합니다.");
                return;
            }

            // if($("input[name=cont_url_start]").val() == "") {
            //     alert("시작날짜를 입력 해 주세요.")
            //     return;
            // }
            // if($("input[name=cont_url_end]").val() == "") {
            //     alert("종료날짜를 입력 해 주세요.")
            //     return;
            // }
            if($("input[name=cont_url_start]").val() != "" && $("input[name=cont_url_end]").val() != ""){
                if($("input[name=cont_url_start]").val() > $("input[name=cont_url_end]").val()){
                    $("input[name=cont_url_start]").val("");
                    $("input[name=cont_url_end]").val("");
                    alert("끝나는 날짜가 시작 날짜보다 빠릅니다. ");
                    return;
                }
            }
        }else{
            // if($("#cont_start").val() == "") {
            //     alert("시작날짜를 입력 해 주세요.")
            //     return;
            // }
            // if($("#cont_end").val() == "") {
            //     alert("종료날짜를 입력 해 주세요.")
            //     return;
            // }
            if($("#cont_start").val() != "" && $("#cont_end").val() != ""){
                if($("#cont_start").val() > $("#cont_end").val()){
                    $("#cont_start").val("");
                    $("#cont_end").val("");
                    alert("끝나는 날짜가 시작 날짜보다 빠릅니다. ");
                    return;
                }
            }
        }
        if($("#sub_start").val() != "" && $("#sub_end").val() != ""){
            if($("#sub_start").val() > $("#sub_end").val()){
                $("#sub_start").val("");
                $("#sub_end").val("");
                alert("끝나는 날짜가 시작 날짜보다 빠릅니다. ");
                return;
            }
        }
    
        //기간 처리
        if(cont_tp == "M" || cont_tp == "I"){
            cont_start = $("#cont_start").val();
            if(cont_start == "") cont_start = "null"
            cont_end = $("#cont_end").val();
            if(cont_end == "") cont_end = "null"
        }else if(cont_tp == "W" || cont_tp == "L"){
            cont_start = $("input[name=cont_url_start]").val();
            if(cont_start == "") cont_start = "null"
            cont_end = $("input[name=cont_url_end]").val();
            if(cont_end == "") cont_end = "null"
        }
        var form_data = new FormData();
        form_data.append("cont_nm", cont_nm);
        form_data.append("comType", "change");
        form_data.append("cont_tp", cont_tp);
        form_data.append("cont_url", cont_url);
        form_data.append("cont_start", cont_start);
        form_data.append("cont_end", cont_end);
        form_data.set('cont_tag', cont_tag);

        $.ajax({
            type: method,
            enctype: 'multipart/form-data',
            url: url,
            data: form_data,
            processData: false,
            contentType: false,
            cache: false,
            timeout: 600000,
            beforeSend: function() {
                $("input[name=cont_tp],input[name=cont_size]").attr("disabled", false);
            },
            success: function(data) {
                alert(data.resultString);
                $('#gcInsert').modal('hide');
                //해쉬태그 청소
                tag = {};
                counter = 0;
                count = 0;
                $("#tag-list").html("");
                $("#rdTag").attr("value", "");
                $("#tag").val("");
                $("#sub_tag-list").html("");
                $("#sub_rdTag").attr("value", "");
                $("#sub_tag").val("");
                result = "";
                //해쉬태그 처리 끝
                
                if(cont_tp == "M") $('#class_video').click();
                if(cont_tp == "I") $('#class_img').click();
                if(cont_tp == "L") $('#class_live').click();
                if(cont_tp == "W") $('#class_web').click();

                // 우측 대시보드 원형 로드 **
                reloadDashboard();
            },
            error: function(error) {
                console.log("ERROR : ", error);
                $('#gcInsert').modal('hide');
                alert(error.resultString);
            }
        });
        closePopup();
    });


    //  콘텐츠 삭제 ////////////////////////////////////////////////////////////////////////////////////////////////
    $("#btnDelete, #btnDeleteText").click(function() {
        if(now_user_gr == '0101'){
            alert("슈퍼관리자는 콘텐츠를 삭제할 수 없습니다.")
            return;
        }
        var url = "";
        var method = "";

        var cont_seq = $("#cont_seq").val();
        var data_apply = "C";
        var cont_nm = $("#cont_nm").val();
        var cont_tp = $(this).attr('cont_tp');
        var url = "/contents/update/"+cont_seq;
        var method = "PUT";
        // alert(cont_tp);
        var form_data = new FormData();
        form_data.append("cont_yn", "N")
        if(cont_tp == "I" || cont_tp == "M"){
            form_data.append("comType", "delete")
            form_data.append("cont_tp", cont_tp)
        }else{
            form_data.append("comType", "deleteOthers")
            form_data.append("cont_tp", cont_tp)
        }
        

        // alert("DELTET ENTED !!");

        if(!confirm("해당 콘텐츠를 삭제하시겠습니까?")){return}

        $.ajax({
            type: method,
            enctype: 'multipart/form-data',
            url: url,
            data: form_data,
            processData: false,
            contentType: false,
            cache: false,
            timeout: 600000,
            beforeSend: function() {
                $("input[name=cont_tp],input[name=cont_size]").attr("disabled", false);
                $('.wrap-loading').removeClass('display-none');
            },
            complete:function(){
                // (이미지 감추기 처리)
                $('.wrap-loading').addClass('display-none');
            },
            success: function(data) {
                alert(data.resultString);
                $('#gcInsert').modal('hide');
                if(cont_tp == "M") $('#class_video').click();
                if(cont_tp == "I") $('#class_img').click();
                if(cont_tp == "L") $('#class_live').click();
                if(cont_tp == "W") $('#class_web').click();
                if(cont_tp == "T") {
                    $('#class_text').click();
                }
                reloadDashboard();
            },
            error: function(error) {
                console.log("ERROR : ", error);
                $('#gcInsert').modal('hide');
                alert(error.resultString);
            }
        });
        if($(this).attr("id")=="btnDelete"){
            closePopup();
        }else{
            closeSubTitlePopup();
        }

            

    });

    $("#sel_cont_add").on( "change", function() {

        var selectedItem = $("#sel_cont_add option:selected").val();

        console.log("Change Occurred !! Selected VALUE : ["+selectedItem+"]");

        nowContentsType = selectedItem;

        if(nowContentsType != "all") {
            nowContTp = selectedItem;
            $("#btn_cont_add").trigger("click");
        }


    });


});

// 바둑판 형 데이터 상세보기(김동수)
function frame_spec(cont_seq){
    //여기서 cont_id 가 cont_seq다!!
    if($('#frame_spec'+cont_seq).attr("cont_yn")=="N"){
    alert("해당 콘텐츠는 이미 삭제되어 상세보기를 할 수 없습니다.")
    return;
    }
    
    var cont_nm = $('#frame_spec'+cont_seq).attr("cont_nm");

    cont_nm = cont_nm.replace(/_/gi," ");
    var cont_tp = $('#frame_spec'+cont_seq).attr("cont_tp");
    var cont_size = $('#frame_spec'+cont_seq).attr("cont_size");
    var cont_med_tm = $('#frame_spec'+cont_seq).attr("cont_med_tm");
    var cont_url = $('#frame_spec'+cont_seq).attr("cont_url");
    m_link = cont_url;
    var cont_thu_url = $('#frame_spec'+cont_seq).attr("cont_thu_url");
    var cont_st_dt = $('#frame_spec'+cont_seq).attr("cont_st_dt");
    var cont_ed_dt = $('#frame_spec'+cont_seq).attr("cont_ed_dt");
    var cont_tag = $('#frame_spec'+cont_seq).attr("cont_tag");
    
    if(cont_tag){
        var tag_array = cont_tag.split(',');
        if(tag_array[0] != "null"){ // 값이 없는 경우
            if(cont_tp != 'T'){
                for(var i = 0; i < tag_array.length; i++){
                    $("#tag-list").append("<li class='tag-item' style='margin:0 0 0 0; padding: 0 0 0 0; border:0; float:left'>#"+tag_array[i]+"<span class='del-btn' idx='"+counter+"' style='color:red'> X</span>&nbsp;&nbsp;&nbsp;</li>");
                    addTag(tag_array[i]);
                }
            }else{
                for(var i = 0; i < tag_array.length; i++){
                    $("#sub_tag-list").append("<li class='tag-item' style='margin:0 0 0 0; padding: 0 0 0 0; border:0; float:left'>#"+tag_array[i]+"<span class='del-btn' idx='"+counter+"' style='color:red'> X</span>&nbsp;&nbsp;&nbsp;</li>");
                    addTag(tag_array[i]);
                }
            }
        }
    }
    
    $('#modalTitle').text('콘텐츠 조회');
    $('#sub_modalTitle').text('콘텐츠 조회'); 
    $('#labelFunction').text('콘텐츠 조회'); 
           
    // 수정/삭제 및 상세보기 내역 Toggle. 
    // ETC_INPUT -- enable , MI_INPUT -- disable
    if(nowContentsType == 'M' || nowContentsType == 'I') {
        // 수정 & 신규 관련 내용 정리 다시 해야 함. 
        $('#gcInsert').modal('show');
        $("#file_preview-1").show();
        // M, I 일 경우 기존입력 폼 보여주기
        // MI_INPUT - enable , ETC_INPUT -- disable
        $('#MI_INPUT1').show();
        $('#MI_INPUT2').show();
        $('#MI_INPUT3').show();
        $('#URL_INPUT').hide();
    } else if(nowContentsType == 'W' || nowContentsType == 'L'){
        $('#gcInsert').modal('show');
        $("#file_preview-1").hide();
        $('#MI_INPUT1').hide();
        $('#MI_INPUT2').hide();
        $('#MI_INPUT3').hide();
        $('#URL_INPUT').show();
    } else if(nowContentsType == 'T'){
        $('#labelSubFunction').text('콘텐츠 조회'); 
        $('#modalSubTitle').modal('show');
        // 등록가리기, 수정-삭제 보이기
        $('#btnUpdateText').show();
        $('#btnDeleteText').show();
        $('#btnInsertText').hide();

    } else {
        // 그외의 Contents 일 경우 별도 UI 보여주기
        // ETC_INPUT -- enable , MI_INPUT -- disable

        // ALL 일 경우 예외 처리
        if(cont_tp == 'M' || cont_tp == 'I') {
            $('#gcInsert').modal('show');
            $("#file_preview-1").show();
            $('#MI_INPUT1').show();
            $('#MI_INPUT2').show();
            $('#MI_INPUT3').show();
            $('#URL_INPUT').hide();
        } else if(cont_tp == 'W' || cont_tp == 'L'){

            $('#gcInsert').modal('show');
            $("#file_preview-1").hide();
            $('#MI_INPUT1').hide();
            $('#MI_INPUT2').hide();
            $('#MI_INPUT3').hide();
            $('#URL_INPUT').show();

        } else if(cont_tp == 'T'){
            $('#labelSubFunction').text('콘텐츠 조회'); 
            $('#modalSubTitle').modal('show');
            $('#btnUpdateText').show();
            $('#btnDeleteText').show();
            $('#btnInsertText').hide();
        }
    }


    // File 수정 부분 가리기
    // $('#fileDesc').css("display", "none");
    $('#fileDesc').hide();
    $('#btnInsert').hide();
    $('#div_cont_detail').css("display", "block");

    // 상세보기 에선 content add 버튼 가리기
    $('#btn_add').css("display", "none");
    $('#btn_save').css("display", "none");
    $('#btn_change').css("display", "none");    // arnold, disable
    $('#btn_delete').css("display", "none");    // arnold, disable

    $('#btn_download').css("display", "inline");

    $('#btn_download').attr('action',cont_url);

    // ID setting

    $('#cont_seq').val(cont_seq);
    $('#cont_seq_2').val(cont_seq);
    
    // 이미지 이름 설정

    var nmTextField = '#cont_nm-1';
    $(nmTextField).val(cont_nm);

    // 타입 가져오기 (타입은 하단 IF 문에서 set value)
    var typeTextField = '#cont_tp-1';

    // Global 변수 세팅(arnold)
    cont_type = typeTextField;

    var sizeTextField = '#cont_size-1';

    
    // $('#file_size_text-1').val((cont_size /1000).toFixed(1)  + " KB");
    // $('#cont_size-1').val((cont_size /1000).toFixed(1)  + " KB");

    // 사이즈 가져오기
    if(cont_tp == "I"){
        $('#file_size_text-1').val((cont_size /1000).toFixed(1)  + " KB");
        $('#mi_type').text('유형');
    }else if(cont_tp == "M") {
        $('#file_size_text-1').val((cont_size / 1000000).toFixed(3) + " MB");
        $('#mi_type').text('재생시간');
    }


    if(cont_tp == "I"){

        $('#file_type_text-1').val("이미지");
        //이미지 출현시 비디오 숨기기
        $("#file_preview-1").css("display","block");
        // 비디오 현재 동결
        //$("#div_cont_detail #cont_video").css("display","none");
        $("#file_preview-1").attr("src",cont_url);
        $("#file_preview-1").removeClass("btn");
        $("#file_preview-1").removeAttr( 'onclick' );
        $("#file_preview-1").removeAttr( 'title' );
        $("#file_preview-1").attr("onerror","this.src='/static/contents/common/thumbnail/image_con.png';");
        $('#cont_med_tm_area-1').css("display","none");
        if(cont_st_dt == "null"){
            cont_st_dt = "";
        }
        if(cont_ed_dt == "null"){
            cont_ed_dt = "";
        }
        $("#cont_start").val(cont_st_dt);
        $("#cont_end").val(cont_ed_dt);

    }else if(cont_tp == "M"){
        //비디오 출현시 이미지 숨기기
        
        $('#file_type_text-1').val(parseInt(cont_med_tm/60) + "m " + parseInt(cont_med_tm%60) + "s");
        $("#file_preview-1").attr("src",cont_thu_url);
        $("#file_preview-1").addClass("btn");
        $("#file_preview-1").attr("title","재생");
        $("#file_preview-1").attr("onclick","window.open('"+cont_url+"')");
        $("#file_preview-1").attr("onerror","this.src='/static/contents/common/thumbnail/video_con.png';");

        // 사이즈 가져오기
        $('#cont_med_tm_area-1').css("display","block");
        $('#cont_med_tm-1').attr('readonly',true);
        $('#cont_med_tm-1').val(cont_med_tm + " 초");

        if(cont_st_dt == "null") cont_st_dt = "";
        if(cont_ed_dt == "null") cont_ed_dt = "";
        $("#cont_start").val(cont_st_dt);
        $("#cont_end").val(cont_ed_dt);

    }else if(cont_tp == "T"){

        subTitle_seq= cont_seq;
        $("#subTitle_1").val("");
        $("#subTitle_2").val("");
        $("#subTitle_3").val("");
        $("#subTitle_4").val("");
        $("#subTitle_5").val("");
        // ajax 이용해서 subtitle 정보 가져옴.
        $.ajax({
            type: "GET",
            url: "/contents/subtitle?cont_seq="+cont_seq,
            success : function(json) {
                console.log(obj);
                var obj =json;
                sleep(500);
                $("#cont_nm-2").val(cont_nm);
                $("#font").val(obj.data[0].font_name);
                //폰트 사이즈에 값을 입력
                $("#font_size").val(obj.data[0].font_size);
                $("#font_size").val(obj.data[0].font_size).prop("selected", true);
                

                $("#font_color").val(obj.data[0].font_color);
                $("#font_bg_color").val(obj.data[0].font_bg_color);
                $("#cont_effect").val(obj.data[0].cont_effect).prop("selected", true);
                $("#subTitle_1").val(obj.data[0].subt_text1);
                console.log(obj.data[0]);

                if(obj.data[0].subt_text2 != "") {
                    $("#subTitle_2").val(obj.data[0].subt_text2);
                    $("#subTileDiv-2").show();
                    $("#btn_add1").hide();
                } else $("#subTileDiv-2").hide();

                if(obj.data[0].subt_text3 != "") {
                    $("#subTitle_3").val(obj.data[0].subt_text3);
                    $("#subTileDiv-3").show();
                    $("#btn_add2").hide();
                    $("#btn_remove2").hide();
                } else $("#subTileDiv-3").hide();

                if(obj.data[0].subt_text4 != "") {
                    $("#subTitle_4").val(obj.data[0].subt_text4);
                    $("#subTileDiv-4").show();
                    $("#btn_add3").hide();
                    $("#btn_remove3").hide();
                } else $("#subTileDiv-4").hide();

                if(obj.data[0].subt_text5 != "") {
                    $("#subTitle_5").val(obj.data[0].subt_text5);
                    $("#subTileDiv-5").show();
                    $("#btn_add4").hide();
                    $("#btn_remove4").hide();
                } else $("#subTileDiv-5").hide();


                if(obj.data[0].subt_text5 != "") {
                    $("#btn_remove5").show();
                }else if(obj.data[0].subt_text4 != ""){
                    $("#btn_remove4").show();
                    $("#btn_add4").show();
                    $("#btn_remove5").hide();

                }else if(obj.data[0].subt_text3 != ""){
                    $("#btn_remove3").show();
                    $("#btn_add3").show();
                    $("#btn_remove4").hide();
                    $("#btn_add4").hide();

                }else if(obj.data[0].subt_text2 != ""){
                    $("#btn_remove2").show();
                    $("#btn_add2").show();
                    $("#btn_remove3").hide();
                    $("#btn_add3").hide();
                }else{
                    $("#btn_add1").show();
                    $("#btn_remove2").hide();
                    $("#btn_add2").hide();
                }

                $("#btn_add1").click(function(){
                    $("#btn_remove2").show();
                    $("#btn_add2").show();
                    }
                );
                $("#btn_add2").click(function(){
                    $("#btn_remove3").show();
                    $("#btn_add3").show();
                    }
                );
                $("#btn_add3").click(function(){
                    $("#btn_remove4").show();
                    $("#btn_add4").show();
                    }
                );
                $("#btn_add4").click(function(){
                    $("#btn_remove5").show();
                    }
                );

                $("#sub_start").val(obj.data[0].subt_st_dt);
                $("#sub_end").val(obj.data[0].subt_ed_dt);
                
                if($("#sub_start").val() == "null"){
                    $("#sub_start").val("");
                }
                if($("#sub_end").val() == "null"){
                    $("#sub_end").val("");
                }
            },
            error: function(){
                alert("자막 상세 조회시 에러가 발생하였습니다. 다시 시도해 주세요");
            }
        });

            
    }else if(cont_tp == "W" || cont_tp == "L"){
        // 기본 정보를 보여 줌
        $("#file_preview-1").hide();
        $("#cont_nm_url").val(cont_nm);
        $("#cont_url").val(cont_url);

        if(cont_st_dt == "null") cont_st_dt = "";
        if(cont_ed_dt == "null") cont_ed_dt = "";
        $("#sub_url_start").val(cont_st_dt);
        $("#sub_url_end").val(cont_ed_dt);
    }
    $("#btnUpdate").attr('cont_tp', cont_tp);
    $("#btnDelete").attr('cont_tp', cont_tp);
    $("#btnUpdateText").attr('cont_tp', cont_tp);
    $("#btnDeleteText").attr('cont_tp', cont_tp);
    
}

// 바둑판 페이징 처리
function paging(totalData, dataPerPage, pageCount, currentPage){
    
    var totalPage = Math.ceil(totalData/dataPerPage);    // 총 페이지 수
    var pageGroup = Math.ceil(currentPage/pageCount);    // 현재 페이지 그룹
    // console.log("pageGroup : " + pageGroup);
    console.log('totalPage: ' + totalPage);
    var last = pageGroup * pageCount;    // 화면에 보여질 마지막 페이지 번호
    var pro_last = last;
    if(last > totalPage)
        last = totalPage;
    var first = last + 1- pageCount;    // 화면에 보여질 첫번째 페이지 번호
    if(pro_last > totalPage)
        first = first + 1;
    if(first == 0) first = 1;

    if(last == 0){
        last = 1;
        first = 1;
    }

    // var next = last+1;
    // var prev = first-1;    
    var next = currentPage+1;
    var prev = currentPage-1;

    console.log("last : " + last);
    console.log("first : " + first);
    console.log("next : " + next);
    console.log("prev : " + prev);
    
    var html = "";
    //commit 실험
    if(prev > 0)
        html += `<div class="paging_lbtn">
						<button type="button" id="prev" class="paging_prev" title="이전 페이지">이전 페이지</button>
					</div>`;
        //<button type="button" id="prev"> << </button>;
        // html += "<a href=# id='prev'><<</a> ";
    
    for(var i=first; i <= last; i++){
        html += '<button type="button" id=' + i + '>' + i + '</button> ';
        // html += "<a href='#' id=" + i + ">" + i + "</a> ";
    }
    
    if(last < totalPage)
        html += `<div class="paging_rbtn">
						<button type="button" id="next" class="paging_next" title="다음 페이지">다음 페이지</button>
					</div>`
        // html += "<a href=# id='next'>></a>";
    
    $("#paging").html(html);    // 페이지 목록 생성
    $("#paging button").css("color", "black");
    $("#paging button#" + currentPage).css({"text-decoration":"none", 
                                    "color":"red", 
                                    "font-weight":"bold"});    // 현재 페이지 표시
                                    
    $("#paging button").click(function(){
        
        var $item = $(this);
        var $id = $item.attr("id");
        var selectedPage = $item.text();
        selectedPage = parseInt(selectedPage);
        if($id == "next")    selectedPage = next;
        if($id == "prev")    selectedPage = prev;
        console.log("토탈: " + totalData);
        console.log("dPP: " + dataPerPage);
        console.log("페이지수: " + pageCount);
        console.log("selectedPage: " + selectedPage);
        paging(totalData, dataPerPage, pageCount, selectedPage);
        reloadPage(selectedPage,"");
    });
                                    
}


// 콘텐츠 Modal 닫기 ////////////////////////////////////////////////////////////////////////////////////////////////
function closeSubTitlePopup() {

    // values Init
    $('#modalSubTitle').modal('hide');

    $('#cont_nm-1').val('');
    $('#cont_nm-2').val("");
    $("#font").val("all").prop("selected", true);
    $("#font_size").val("all").prop("selected", true);
    $("#cont_effect").val("all").prop("selected", true);

    $('#subTitle_1').val("");
    $('#subTitle_2').val("");
    $('#subTitle_3').val("");
    $('#subTitle_4').val("");
    $('#subTitle_5').val("");

    $('#sub_start').val('');
    $('#sub_end').val('');
    $("#font_color").val('');
    $("#font_bg_color").val('');
    
    $('#cont_start').val('');
    $('#cont_end').val('');

    $('#subTileDiv-2').hide();
    $('#subTileDiv-3').hide();
    $('#subTileDiv-4').hide();
    $('#subTileDiv-5').hide();

    $('#subLabelFuncton').text('콘텐츠 조회'); 

    $('#btnInsert').show();
    $('#btnUpdate').show();
    $('#btnDelete').show();
    //해쉬태그 청소
    tag = {};
    counter = 0;
    count = 0;
    $("#tag-list").html("");
    $("#rdTag").attr("value", "");
    $("#tag").val("");
    $("#sub_tag-list").html("");
    $("#sub_rdTag").attr("value", "");
    $("#sub_tag").val("");
    result = "";
    //해쉬태그 처리 끝


    // nowContentsType = 'all';

}

// 콘텐츠 Modal 닫기 ////////////////////////////////////////////////////////////////////////////////////////////////
function closePopup() {
    //해쉬태그 청소
    tag = {};
    counter = 0;
    count = 0;
    $("#tag-list").html("");
    $("#rdTag").attr("value", "");
    $("#tag").val("");
    $("#sub_tag-list").html("");
    $("#sub_rdTag").attr("value", "");
    $("#sub_tag").val("");
    result = "";
    //해쉬태그 처리 끝

    $('#gcInsert').modal('hide');
    $('#file_nm_text-1').val('');
    $('#file_nm-1').val('');
    $('#cont_nm-1').val('');
    $('#file_type_text-1').val('');
    $('#file_size_text-1').val('');
    $('#file_gr_seq-1').val('0');
    // $('#file_parking_seq-1').val('0');
    $('#file_type-1').val('');
    $('#file_med_tm-1').val('0');
    $('#file_size-1').val('');
    $('#file_apply-1').val('P');
    $('#file_yn-1').val('Y');
    $('#cont_start').val('');
    $('#cont_end').val('');

    
    $("#file_preview-1").attr("src","");
//  $('#file_preview-1').attr('src','/static/contents/common/thumbnail/1619700484_0_.png')
    
    // Live and WEB init.
    $('#cont_nm_url').val('');
    $('#cont_url').val('');
    $('#sub_url_start').val('');
    $('#sub_url_end').val('');

    totalAddCount = 0;
    // nowContentsType = 'all';
    jQuery('#fileDesc').show(); 
    $('#btnInsert').show();
    $('#btnUpdate').show();
    $('#btnDelete').show();
}

// 콘텐츠 새창에서 미리보기
function swipe() {
    if(cont_type == 'I'){
        var largeImage = document.getElementById('cont_image');
        largeImage.style.display = 'block';
        largeImage.style.width=200+"px";
        largeImage.style.height=200+"px";
        var url=largeImage.getAttribute('src');
        window.open(url,'Image','width=largeImage.stylewidth,height=largeImage.style.height,resizable=1');
    } else {
        window.open(m_link, '_blank', 'location=yes,scrollbars=no,status=yes');
    }
}

// 기존 디자인 적용 PARTS  ////////////////////////////////////////////////////////////////////////////////////////////////
$(document).ready(function(){	
    // MENU 적용
        $('#mn_contents').attr({
            'class' : 'active',
        });

        // datapicker
        $( "#termStart, #termEnd" ).datepicker({
            dateFormat: 'yy.mm.dd',
            prevText: '이전 달',
            nextText: '다음 달',
            monthNames: ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'],
            monthNamesShort: ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'],
            dayNames: ['일','월','화','수','목','금','토'],
            dayNamesShort: ['일','월','화','수','목','금','토'],
            dayNamesMin: ['일','월','화','수','목','금','토'],
            showMonthAfterYear: true,
            yearSuffix: '년'
        });
        
        //태그 많으면 아이콘 보여주기
        tagAction();	
        function tagAction(){		
            var tagNum = $('.tag_wrap span').length;
            var tagPadding = tagNum*30;
            var totalWidth = 0;
            $('.tag_wrap span').each(function(){
                totalWidth = totalWidth + $(this).width();			
            });		
            if(totalWidth+tagPadding>500){			
                $('.btn_conts_circle2').show();				
            }		
        }
        //태그 더보기 아이콘
        $(document).on('click', '.btn_conts_circle2', function() {		
            if($(this).hasClass('open') == true){
                $(this).removeClass('open');
                $('.tag_wrap').removeClass('open');
                $('.tag_wrap').css('height', '46');
            }else{
                $(this).addClass('open');
                $('.tag_wrap').addClass('open');
                var tagHeightSet = $('.tag_wrap p').height()+10;
                $('.tag_wrap').css('height', tagHeightSet);
            }
        });
        
        // 스토리지 차트 넓이값 넣어 주기
        $.ajax({
            contentType: false,
            processData: false,
            async : false,
            type: "GET",
            url: "/dashboard/search",
            success : function(json) { 
                var Dataset = json;
                var userdetail = Dataset.userDetail.split(",")      // [user_disk , user_settop, user_reg_user_cnt, create_user_id]
                var nowuserdetail = Dataset.nowuserDetail.split(",")   // [now_disk,    now_settop,  now_user]
                
                var storageUsed = parseFloat(nowuserdetail[0] / 1000000000).toFixed(2);
                var storageNonUsed = parseFloat(userdetail[0] / 1000000000).toFixed(2);
                var circlePer = storageUsed / storageNonUsed

                $('#storage_used').text(storageUsed+"GB");
                $('#storage_total').text(storageNonUsed+"GB");
                $('.circle_chart').circleProgress({
                    value: circlePer,
                }).on('circle-animation-progress', function(event, progress) {
                    $(this).find('strong').html(parseInt(circlePer * 100 * progress) + '<em>%</em>');
                    
                });   
            },            
    
            error: function(json){         
    
            }
        });
});	

// 콘텐츠 TYPE에 따른 콘텐츠 리스트 보여줌 ////////////////////////////////////////////////////////////////////////////////////////////////
function searchType(contentsType) {

    if(contentsType == "") nowContentsType = "all";
    else nowContentsType = contentsType;

    if(nowContentsType != "all") {
        $("#btn_cont_add").show();
        $("#sel_cont_add").hide();
    } else {
        $("#sel_cont_add").show();
        $("#btn_cont_add").hide();
    }
    if(frame_status == "F"){
        nowContTp = contentsType;
        reloadPage(1,"");
        
    }else{
        dataList.ajax.url("/contents/search?cont_apply=C&cont_tp="+contentsType).load();
        nowContTp = contentsType;
    }
    
}

// 자막 추가 필드 Show Function 
function showDIV(divName) {
    // divTag = "$('#"+divName+"')";
    var seq = divName.slice(-1);
    $('#btn_add'+(seq-1)).hide();
    if(seq > 2){
        $('#btn_remove'+(seq-1)).hide();
    }
    $("#" + divName).show();

    // divTag.show();
}

function hideDIV(divName){
    var seq = divName.slice(-1);
    var subTitle_no = 'subTitle_' + seq;
    $('#btn_add'+(seq-1)).show();
    $('#btn_remove'+(seq-1)).show();
    $("#" + divName).hide();
    $("#" + subTitle_no).val('');
}

// 자막 UPDATE FUNCTION
$("#btnUpdateText").on("click",function(){
    if(now_user_gr == '0101'){
        alert("슈퍼관리자는 콘텐츠를 수정할 수 없습니다.")
        return;
    }

    // alert("UPDATE FUNCTION START !!!");
    // Data validation check.

    //해시태그 처리
    var value = marginTag(); // return array
    $("#sub_rdTag").val(value);
    var cont_tag = $("#sub_rdTag").val();

    if($("#cont_nm-2").val() == ""){
        alert("자막 명을 입력 해 주세요. ");
        return;
    }

    if($("#font").val() == "all"){
        alert("자막 폰트를 선택 해 주세요. ");
        return;
    }
    
    if($("#font_size").val() == "all" || $("#font_size").val() == null){
        alert("폰트 크기를 선택 해 주세요. ");
        return;
    }

    if($("#cont_effect").val() == "all"){
        alert("효과를 선택 해 주세요. ");
        return;
    }
    if($("#sub_start").val() != "" && $("#sub_end").val() != ""){
        if($("#sub_start").val() > $("#sub_end").val()){
            $("#sub_start").val("");
            $("#sub_end").val("");
            alert("끝나는 날짜가 시작 날짜보다 빠릅니다. ");
            return;
        }
    }

    if($("#cont_start").val() != "" && $("#cont_end").val() != ""){
        if($("#cont_start").val() > $("#cont_end").val()){
            $("#cont_start").val("");
            $("#cont_end").val("");
            alert("끝나는 날짜가 시작 날짜보다 빠릅니다. ");
            return;
        }
    }
    if($("#cont_nm-2").val().length > 100){
        alert("제목은 100자 이하여야 합니다.");
        return;
    }
    if($("#subTitle_1").val().length > 100){
        alert("자막1은 100자 이하여야 합니다.");
        return;
    }
    if($("#subTitle_2").val().length > 100){
        alert("자막2은 100자 이하여야 합니다.");
        return;
    }
    if($("#subTitle_3").val().length > 100){
        alert("자막3은 100자 이하여야 합니다.");
        return;
    }
    if($("#subTitle_4").val().length > 100){
        alert("자막4은 100자 이하여야 합니다.");
        return;
    }
    if($("#subTitle_5").val().length > 100){
        alert("자막5은 100자 이하여야 합니다.");
        return;
    }

    if($("#font_color").val().charAt(0) == '#'){
        // ALPHA value change
        var tmp_string = $("#font_color").val();
        var target_value = "";
        target_value = tmp_string.substring(7,9);
        target_value += tmp_string.substring(1,7);
        $("#font_color").val(target_value);
    }
    
    if($("#font_bg_color").val().charAt(0) == '#'){
        var tmp_string = $("#font_bg_color").val();
        var target_value = "";
        target_value = tmp_string.substring(7,9);
        target_value += tmp_string.substring(1,7);
        $("#font_bg_color").val(target_value);
    }

    // Subtitle UPDATE
    // var form_data = new FormData($('#formETC')[0]);
        var form_data = new FormData();
        form_data.append('cont_nm', $("#cont_nm-2").val());
        form_data.append('cont_tp','T');
        form_data.append('cont_start',$("#sub_start").val());
        form_data.append('cont_end',$("#sub_end").val());
        form_data.append('font',$("#font").val());
        form_data.append('font_size',$("#font_size").val());
        form_data.append('font_color',$("#font_color").val());
        form_data.append('font_bg_color',$("#font_bg_color").val());
        form_data.append('cont_effect',$("#cont_effect").val());
        form_data.append('subTitle_1',$("#subTitle_1").val());
        form_data.append('subTitle_2',$("#subTitle_2").val());
        form_data.append('subTitle_3',$("#subTitle_3").val());
        form_data.append('subTitle_4',$("#subTitle_4").val());
        form_data.append('subTitle_5',$("#subTitle_5").val());
        form_data.set('cont_tag', cont_tag);
        
    $.ajax({
        contentType: false,
        processData: false,
        data:form_data,
        type: "PUT",
        url: "/contents/subtitle/update/"+subTitle_seq,
        success : function(json) { 
            alert(json.resultString);
            if(frame_status == "L"){
                dataList.ajax.url("/contents/search?cont_apply=C&cont_tp=T").load();
            }else{
                reloadPage(1, '');
            }
            $('#class_text').click();
            $("#btnSubTitleClose").click();
        },            
        error: function(json){         
        }
    });

    
});


//바둑판 전체 리스트 로드 함수
function reloadPage(selectedPage, params){
    $("#data_frame").html("");
    $('#btn_view_frame').addClass('active');
    $('#btn_view_list').removeClass('active');
    $('#view_list').hide();
    $('#view_frame').show();
    var url=""
    if(nowContentsType != "all") {
        $("#btn_cont_add").show();
        $("#sel_cont_add").hide();
        url = "/contents/search?cont_apply=C&cont_tp=" + nowContentsType + params;
        
    } else {
        $("#sel_cont_add").show();
        $("#btn_cont_add").hide();
        url = "/contents/search?cont_apply=C&cont_tp=" + params;
    }
 
    var type = "POST";
    var font_color = "";
    var cont_name = "";
    frame_status = "F";
    $.ajax({
        contentType: false,
        processData: false,
        async: false,
        type: type,
        url: url,
        success : function(json) { 
            var dataListFrame = json.data;
            console.log(dataList);
            totalData = json.recordsTotal;  // 총 데이터 수
            var startPoint = (selectedPage-1)*dataPerPage;
            var endPoint = selectedPage*dataPerPage;
            if(totalData - startPoint < dataPerPage){
                endPoint = totalData;
            }
            for(var i = startPoint; i < endPoint; i++){
                if(dataListFrame[i].cont_thu_url == "") var url="&nbsp";
                else  var url = dataListFrame[i].cont_thu_url;

                if(dataListFrame[i].cont_yn == "N"){
                    font_color = 'style = "color:red"';
                    cont_name = "(삭제됨) " + dataListFrame[i].cont_nm;
                }else{
                    font_color = "";
                    cont_name = dataListFrame[i].cont_nm;
                }

                if(dataListFrame[i].cont_tp == "M"){
                    $("#data_frame").append(`
                        <li>
                            <div class="type video">
                                <img title='상세보기' src="`+ dataListFrame[i].cont_thu_url +`" id="frame_spec` + dataListFrame[i].cont_id +`" alt="` + dataListFrame[i].cont_id +`" class="" onclick="frame_spec(` + dataListFrame[i].cont_id +`);" cont_nm=`+dataListFrame[i].cont_nm.replace(/ /gi,"_") +
                                ` cont_tp="`+dataListFrame[i].cont_tp+`" cont_size="`+dataListFrame[i].cont_size + 
                                `" cont_med_tm="`+dataListFrame[i].cont_med_tm+`" cont_url="`+dataListFrame[i].cont_url.replace(/ /gi,"|") + 
                                `" cont_thu_url="`+url+`" cont_st_dt="`+dataListFrame[i].cont_st_dt +
                                `" cont_ed_dt="`+dataListFrame[i].cont_ed_dt +`" cont_tag="`+dataListFrame[i].cont_tag +`" cont_yn = "`+dataListFrame[i].cont_yn+`" onerror = "onerror_con('frame_spec` + dataListFrame[i].cont_id +`','`+dataListFrame[i].cont_tp+`');">
                            </div>
                            <p>
                                <a href="#none" class="name"` + font_color +`onclick="frame_spec(` + dataListFrame[i].cont_id +`);">`+ cont_name +`</a>
                                <span class="date">`+ dataListFrame[i].period.replace("<br>","") +`</span>
                                <span class="byte">`+ Math.round(dataListFrame[i].cont_size/1000000) +`MB</span>
                            </p>
                        </li>
                    `);
                    
                }else if(dataListFrame[i].cont_tp == "I"){
                    $("#data_frame").append(`
                        <li>
                            <div class="type img">
                                <img title='상세보기' src="`+ dataListFrame[i].cont_thu_url +`" id="frame_spec` + dataListFrame[i].cont_id +`" alt="` + dataListFrame[i].cont_id +`" class="" onclick="frame_spec(` + dataListFrame[i].cont_id +`);" cont_nm=`+dataListFrame[i].cont_nm.replace(/ /gi,"_") +
                                ` cont_tp="`+dataListFrame[i].cont_tp+`" cont_size="`+dataListFrame[i].cont_size + 
                                `" cont_med_tm="`+dataListFrame[i].cont_med_tm+`" cont_url="`+dataListFrame[i].cont_url.replace(/ /gi,"|") + 
                                `" cont_thu_url="`+url+`" cont_st_dt="`+dataListFrame[i].cont_st_dt +
                                `" cont_ed_dt="`+dataListFrame[i].cont_ed_dt +`" cont_tag="`+dataListFrame[i].cont_tag +`" cont_yn = "`+dataListFrame[i].cont_yn+`" onerror = "onerror_con('frame_spec` + dataListFrame[i].cont_id +`','`+dataListFrame[i].cont_tp+`');">
                            </div>
                            <p>
                                <a href="#" ` + font_color +`class="name" onclick="frame_spec(` + dataListFrame[i].cont_id +`);">` +cont_name +`</a>
                                <span class="date">`+ dataListFrame[i].period.replace("<br>","") +`</span>
                                <span class="byte">`+ Math.round(dataListFrame[i].cont_size/1000) +`KB</span>
                            </p>
                        </li>
                    `);                            
                    


                }else if(dataListFrame[i].cont_tp == "T"){
                    var concat_subtitle = "";
                    $.ajax({
                        type: "GET",
                        url: "/contents/concatSubtitle?cont_seq="+dataListFrame[i].cont_id,
                        async: false,
                        success : function(json) {
                            var subttl = json.data[0];
                            concat_subtitle = subttl['result'];
                        },
                        error: function(){
                            concat_subtitle = "자막 상세 조회시 에러가 발생하였습니다.";
                        }
                    });
                    
                    $("#data_frame").append(`
                        <li>
                            <div class="type text">` +concat_subtitle +`</div>
                            <p>
                                <a title='상세보기' href="#" id="frame_spec` + dataListFrame[i].cont_id +`" cont_nm="`+cont_name +
                                `" cont_tp="`+dataListFrame[i].cont_tp+`" cont_size="`+dataListFrame[i].cont_size + 
                                `" cont_med_tm="`+dataListFrame[i].cont_med_tm+`" cont_ed_dt="`+dataListFrame[i].cont_ed_dt +
                                `" cont_yn = "`+dataListFrame[i].cont_yn+`"` + font_color +`class="name" onclick="frame_spec(` + dataListFrame[i].cont_id +`);" font_name="`+dataListFrame[i].font_name +`" cont_tag="`+dataListFrame[i].cont_tag +
                                `" font_size="`+dataListFrame[i].font_size+`" font_color="`+dataListFrame[i].font_color+`" font_bg_color="`+dataListFrame[i].font_bg_color+`" cont_effect="`+dataListFrame[i].cont_effect+`" >`
                                + cont_name +
                                `</a>
                                <span class="date">`+ dataListFrame[i].period.replace("<br>","") +`</span>
                            </p>
                        </li>
                    `);
                    
                }else if(dataListFrame[i].cont_tp == "W"){
                    $("#data_frame").append(`
                        <li>
                            <div class="type web">
                                <img title='상세보기' src="/static/contents/common/thumbnail/web_con.png" id="frame_spec` + dataListFrame[i].cont_id +`" alt="` + dataListFrame[i].cont_id +`" class="" onclick="frame_spec(` + dataListFrame[i].cont_id +`);" cont_nm=`+dataListFrame[i].cont_nm.replace(/ /gi,"_") +
                                ` cont_tp="`+dataListFrame[i].cont_tp+`" cont_size="`+dataListFrame[i].cont_size + 
                                `" cont_med_tm="`+dataListFrame[i].cont_med_tm+`" cont_url="`+dataListFrame[i].cont_url.replace(/ /gi,"|") + 
                                `" cont_thu_url="`+url+`" cont_st_dt="`+dataListFrame[i].cont_st_dt +`" cont_tag="`+dataListFrame[i].cont_tag +
                                `" cont_ed_dt="`+dataListFrame[i].cont_ed_dt +`" cont_yn = "`+dataListFrame[i].cont_yn+`" style = "position: relative; width : 75px; height : 75px;  top:16%;">
                            </div>
                            <p>
                                <a href="#" ` + font_color +`class="name" onclick="frame_spec(` + dataListFrame[i].cont_id +`);">`+ cont_name +`</a>
                                <span class="date">`+ dataListFrame[i].period.replace("<br>","") +`</span>
                            </p>
                        </li>
                    `);                        
                }else if(dataListFrame[i].cont_tp == "L"){
                    $("#data_frame").append(`
                        <li>
                            <div class="type live">
                                <img title='상세보기' src="/static/contents/common/thumbnail/live_con.png" id="frame_spec` + dataListFrame[i].cont_id +`" alt="` + dataListFrame[i].cont_id +`" class="" onclick="frame_spec(` + dataListFrame[i].cont_id +`);" cont_nm=`+dataListFrame[i].cont_nm.replace(/ /gi,"_") +
                                ` cont_tp="`+dataListFrame[i].cont_tp+`" cont_size="`+dataListFrame[i].cont_size + 
                                `" cont_med_tm="`+dataListFrame[i].cont_med_tm+`" cont_url="`+dataListFrame[i].cont_url.replace(/ /gi,"|") + 
                                `" cont_thu_url="`+url+`" cont_st_dt="`+dataListFrame[i].cont_st_dt +`" cont_tag="`+dataListFrame[i].cont_tag +
                                `" cont_ed_dt="`+dataListFrame[i].cont_ed_dt +`" cont_yn = "`+dataListFrame[i].cont_yn+`" style = "position: relative; width : 75px; height : 75px;  top:16%;">
                            </div>
                            <p>
                                <a href="#" ` + font_color +`class="name" onclick="frame_spec(` + dataListFrame[i].cont_id +`);">`+ cont_name +`</a>
                                <span class="date">`+ dataListFrame[i].period.replace("<br>","") +`</span>
                            </p>
                        </li>
                    `);                        
                }
            }
            paging(totalData, dataPerPage, pageCount, selectedPage);
        },            

        error: function(json){         
            alert("데이터를 불러올 수 없습니다.");
        }
    });

}

//우측 대시보드 로드 함수
function reloadDashboard(){
    // 우측 대시보드 원형 로드 **
    $.ajax({
            contentType: false,
            processData: false,
            async : false,
            type: "GET",
            url: "/dashboard/search",
            success : function(json) { 
                var Dataset = json;
                var userdetail = Dataset.userDetail.split(",")      // [user_disk , user_settop, user_reg_user_cnt, create_user_id]
                var nowuserdetail = Dataset.nowuserDetail.split(",")   // [now_disk,    now_settop,  now_user]
                
                var storageUsed = parseFloat(nowuserdetail[0] / 1000000000).toFixed(2);
                var storageNonUsed = parseFloat(userdetail[0] / 1000000000).toFixed(2);
                var circlePer = storageUsed / storageNonUsed

                $('#storage_used').text(storageUsed+"GB");
                $('#storage_total').text(storageNonUsed+"GB");
                $('.circle_chart').circleProgress({
                    value: circlePer,
                }).on('circle-animation-progress', function(event, progress) {
                    $(this).find('strong').html(parseInt(circlePer * 100 * progress) + '<em>%</em>');
                    
                });   
            },            
    
            error: function(json){         
    
            }
    });
}

function fileCheck( file )
{
    // 사이즈체크
    var maxSize  = 5 * 1024 * 1024    //30MB
    var fileSize = 0;

	// 브라우저 확인
	var browser=navigator.appName;
	// 익스플로러일 경우
	if (browser=="Microsoft Internet Explorer")
	{
		var oas = new ActiveXObject("Scripting.FileSystemObject");
		fileSize = oas.getFile( file.value ).size;
	}
	// 익스플로러가 아닐경우
	else
	{
		fileSize = file.files[0].size;
	}
	alert("파일사이즈 : "+ fileSize +", 최대파일사이즈 : 5MB");

        if(fileSize > maxSize)
        {
            alert("첨부파일 사이즈는 5MB 이내로 등록 가능합니다.    ");
            return;
        }

        document.fileForm.submit();
}
 // 입력한 값을 태그로 생성한다.
function addTag (value) {
    tag[counter] = value;
    counter++; // del-btn 의 고유 id 가 된다.
    count++;
}
// tag 안에 있는 값을 array type 으로 만들어서 넘긴다.
function marginTag () {
    return Object.values(tag).filter(function (word) {
        return word !== "";
    });
}

$("#tag, #sub_tag").on("keypress", function (e) {
    var self = $(this);
    if (e.key === "Enter" || e.keyCode == 32) {

        if(count > 4){
            alert("태그는 5개까지 등록가능합니다");
            return;
        }
        var tagValue = self.val(); // 값 가져오기
        if (tagValue !== "") {
            // 같은 태그가 있는지 검사. 있다면 해당값이 array 로 return
            var result = Object.values(tag).filter(function (word) {
                return word === tagValue;
            })
            // 해시태그가 중복되었는지 확인
            if (result.length == 0) { 
                if(self.attr('id') == "tag"){
                    $("#tag-list").append("<li class='tag-item' style='margin:0 0 0 0; padding: 0 0 0 0; border:0; float:left'>#"+tagValue+"<span class='del-btn' idx='"+counter+"' style='color:red'> X</span>&nbsp;&nbsp;&nbsp;</li>");
                    addTag(tagValue);
                    self.val("");
                }else{
                    $("#sub_tag-list").append("<li class='tag-item' style='margin:0 0 0 0; padding: 0 0 0 0; border:0; float:left'>#"+tagValue+"<span class='del-btn' idx='"+counter+"' style='color:red'> X</span>&nbsp;&nbsp;&nbsp;</li>");
                    addTag(tagValue);
                    self.val("");
                }
            } else {
                alert("태그값이 중복됩니다.");
            }
        }
        e.preventDefault(); // SpaceBar 시 빈공간이 생기지 않도록 방지
    }
});
// 인덱스 검사 후 삭제
$(document).on("click", ".del-btn", function (e) {
    var index = $(this).attr("idx");
    tag[index] = "";
    $(this).parent().remove();
    count--;
});

$(document).on("click", "#addHashtag", function (e) {
    $("#inputHashtag").modal('show');
});

$("#inputHashtag").on('keypress', function(e){
    if (e.key === "Enter"){
        if($('#hashName').val().length > 5){
            alert("5글자 이내로 입력해주세요");
            return;
        }
        $("#addHashtag").after('<span class="tag">&#35;'+$('#hashName').val()+'</span>');
        $('#hashName').val("");
        $("#inputHashtag").modal('hide');
    }
});

$('.tag').click(function(){
    var params = ""
    var tag_value = $(this).text();
    params = "&cont_tag=" + tag_value.substring(1,tag_value.length);
    if(frame_status == "L"){
        dataList.ajax.url("/contents/search?cont_apply=C&cont_tp="+params).load();
    }else{
        reloadPage(1, params);
    }
});

function checkNumber(event) {
  if(event.key >= 0 && event.key <= 9) {
    return true;
  }
  
  return false;
}

function onerror_con(img_id, tp){
    if(tp == "M"){
        $("#"+img_id).attr("src","/static/contents/common/thumbnail/video_con.png");
        $("#"+img_id).attr("style","position: relative; width : 75px; height : 75px; top:16%");
    } else if(tp == "I"){
        $("#"+img_id).attr("src","/static/contents/common/thumbnail/image_con.png");
        $("#"+img_id).attr("style","position: relative; width : 75px; height : 75px; top:16%");
    } else if(tp == "W"){
        $("#"+img_id).attr("src","/static/contents/common/thumbnail/web_con.png");
        $("#"+img_id).attr("style","position: relative; width : 75px; height : 75px; top:16%");
    }
}

function sleep(ms) {
    const wakeUpTime = Date.now() + ms;
    while (Date.now() < wakeUpTime) {}
}
