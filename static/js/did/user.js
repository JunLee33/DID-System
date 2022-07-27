// user.js
// Managing user functions for user.html

var user_id_now = '';
var group_seq_now = '';
var user_reg_user_cnt = '';
var user_disk_temp;
var user_settop_temp;
var sum_user_disk;
var remain_user_disk;
var user_gr_temp;


$(function() {

    $.ajax({
        type: "GET",
        url: "/user/search?user_gr=0000",
        
        success : function(json) {

            user_id_now = json.resultUserid;
            group_seq_now = json.resultUserGroup;
            user_reg_user_cnt = json.resultUser_reg_user_cnt;
            now_user = json.now_user;
            user_disk = json.user_disk;
            now_disk = json.now_disk;
            user_settop = json.user_settop;
            now_settop = json.now_settop;
            sum_user_disk = json.sum_user_disk;
            sum_user_settop = json.sum_user_settop;
            remain_disk = user_disk - now_disk;
            remain_settop = user_settop - now_settop;
            remain_user_disk = user_disk - sum_user_disk;
            remain_user_settop = user_settop - sum_user_settop;

            if(group_seq_now == "0103"){
                $('#btnInsertOpen').hide();
            }
        },
        error: function(json){
            // alert(json.responseJSON.resultString)
        }
    });
    

    // MENU 적용
    $('#mn_user').attr({
        'class' : 'active'
    });

    $("#user_detail").hide();
    $("#user_gr").on( "change", function() {
        if($("#user_gr option:selected").val() == '0102'){
            // 관리자 선택
            $("#user_detail").show();
            $("#user_count").show();
            $("#user_settop").show();
        }else{
            $("#user_detail").show();
            $("#user_count").hide();
            $("#user_settop").show();
        }
    });

    //**************************************사용자 메인 조회**********************************************

    //메인 화면 전체 조회 구문
    
    var dataList = $('#data_list').DataTable({
                    "lengthChange": false,
                    "searching": false,
                    "ordering": true,
                    "colReorder": true,
                    "info": false,
                    "autoWidth": true,
                    "processing": true,
                    // "serverSide": true,
                    "responsive": true,
                    ajax : {
                        "url": "/user/search",
                        "type":"POST",
                        "async" :"false"
                    },
                    "columns": [
                            { data: "row_cnt"},
                            { data: "user_nm"},
                            { data: "user_id"},
                            // { data: "user_gr"},
                            {
                                data:  null,
                                render: function(data, type, full, meta){
                                        if(data.user_gr == '0102' && data.user_id != 'admin') return "<strong>관리자</strong>";
                                        else if(data.user_gr == '0103') return "<strong>일반사용자</strong>";
                                        else if(data.user_gr == '0101') return "<strong>슈퍼관리자</strong>";
                                }
                            },
                            { data: "user_dept_nm"},
                            { data: "rgt_dt"},
                            { data: "user_yn"},
                            { data: "now_user"}, 
                            { data: "create_user_id"},
                            {
                                data:  null,
                                render: function(data, type, full, meta){
                                        return "<span class='spaceTxt col-xs-4'><strong>"+ parseFloat(data.now_disk / 1000000000).toFixed(2) + "</strong> / " + parseFloat(data.user_disk /1000000000).toFixed(2)+
                                        " GB </span><div class='tbl_chart' style='width:200px'><span class='space' id='chartSpace' style='width:" + parseFloat(data.now_disk / data.user_disk * 100) + 
                                        "%; max-width:100%'></span></div>";
                                        // <span>"+parseInt(data.now_disk / data.user_disk * 100)+"%</span>";
                                }
                            },
                            // { data: "now_settop"},
                            { 
                                data:  null,
                                render: function(data, type, full, meta){
                                        return "<span class='spaceTxt'><strong>"+ data.now_settop + "</strong> / " + data.user_settop+
                                        "</span>";
                                }
                            },
                            {
                                data:  null,
                                render: function(data, type, full, meta){
                                        return "<button title='유저정보 상세보기' class=' btn_point "+
                                         "' value="+data.user_id+
                                         " user_nm="+data.user_nm +" user_gr="+data.user_gr+" user_yn="+data.user_yn+ " parking_seq="+data.parking_id+" parking_nm="+data.parking_nm+
                                         " user_dept_nm="+data.user_dept_nm +" user_ip="+data.user_ip+" user_mac="+data.user_mac+" user_count="+data.user_reg_user_cnt+" user_disk="+data.user_disk+" user_settop="+data.user_settop+
                                         " type = 'detail'"+
                                         "  data-toggle='modal'>상세보기</button>";
                                }
                            },
                            {
                                data:  null,
                                render: function(data, type, full, meta){

                                        if(data.user_dor_acc == "N"){
                                            return "&nbsp"
                                        }else{
                                             return "<button title='휴면해제' class=' btn_point "+
                                             "buttons-collection buttons-colvis' value="+data.user_id+ " user_id="+data.user_id+
                                             " user_nm="+data.user_nm +" user_gr="+data.user_gr+ " user_yn="+data.user_yn+" parking_seq="+data.parking_id+" parking_nm="+data.parking_nm+
                                             " user_dept_nm="+data.user_dept_nm +" user_ip="+data.user_ip+ " user_mac="+data.user_mac+
                                             " type = 'dormant'"+
                                             " data-toggle='modal'>휴면해제</button>";
                                        }
                                }
                            }

                    ],
                    "columnDefs": [
                        { orderable: false, targets: 0 },
                        { orderable: false, targets: 6 },
                        { orderable: false, targets: 8 },
                        { orderable: false, targets: 9 },
                        { orderable: false, targets: 10 },
                        { orderable: false, targets: 11 },
                        { orderable: false, targets: 12 },
                        {"className": "text-center", "targets": "_all"}
                    ],
                    "rowCallback": function( row, data, iDisplayIndex ) {


                    },
                    
                    "paging": true,
                    "pageLength": 10,
                    "language": {
                      "zeroRecords": "데이터가 존재하지 않습니다."
                    },
                    dom: "<'row'<'col-sm-6'l><'col-sm-6'f>>" +
                         "<'row'<'col-sm-12'tr>>" +
                         "<'row'<'col-sm-12'p>>"
    });

    //************************************ID,PW 한글 입력 막기***************************

    $("#user_pwd,#user_conf_pwd,#user_disk,#user_settop").on("blur keyup", function() {
        $(this).val( $(this).val().replace( /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/g, '' ) );
    });

    $("#user_id,#user_disk,#user_settop").keyup(function(e) {
      var regex = /^[a-zA-Z0-9@]+$/;
      if (regex.test(this.value) !== true)
        this.value = this.value.replace(/[^a-zA-Z0-9@]+/, '');
    });

    //**************************************사용자 등급에 따른 사용메뉴 ************************************************
    $("#user_gr").change(function(){
        if($("#user_gr").val()=="0102"){
            $("#user_menu").text("모든 메뉴")
        }else if($("#user_gr").val()=="0103"){
            $("#user_menu").text("그룹 관리")
        }else if($("#user_gr").val()=="0104"){
            $("#user_menu").text("공지 관리")
        }else if($("#user_gr").val()=="0105"){
            $("#user_menu").text("스크린 관리")
        }else if($("#user_gr").val()=="0107"){
            $("#user_menu").text("사이트 관리(가맹점,셋탑박스)")
        }
    });

    //************************************ 조건 검색 클릭 ***************************
    $("#btnSearch").click(function(){

        var params = ""

        var schType = $("#schType").val();
        var schTxt  = $("#schTxt").val();

        //상세구분 체크
        if(schType == "user_id"){
            if(schTxt != ""){
                params += "?user_id="+schTxt;
            }
        }else if(schType == "user_nm"){
            if(schTxt != ""){
                params += "?user_nm="+schTxt;
            }
        }else if(schType == "user_gr"){
            if(schTxt != ""){
                if(schTxt == "일반사용자"){
                    schTxt = "0103";
                }
                if(schTxt == "관리자"){
                    schTxt = "0102";
                }
                params += "?user_gr="+schTxt;
            }
        }



        console.log("User search = ["+params+"]")

        dataList.ajax.url("/user/search"+params).load();
    });

    //************************************사용자 등록 팝업 open 시작***************************
    $("#btnInsertOpen").click(function() {
        $("#user_nm").val("");
        $("#user_pwd").val("");
        $("#user_detail").show();
        $("#user_gr_div").show();
        $("#duplicate_check").show();
        $("#duplicate_check").attr('checking', 'N')
        if(now_user >= user_reg_user_cnt){
            alert('제한인원 수(' + user_reg_user_cnt+ ')를 초과하여 더 추가할 수 없습니다.');
            return;
        } 
        $(this).attr("data-target","#modalInsert")
        $("#btnDelete").hide();
        $("#btnRegister").show();
        $("#btnUpdate").hide();
        $("#modalTitle").text("사용자 등록");
        // 0103 일 경우 점포 담당자만 등록 할 수 있음.
        // alert($("#current_user_gr").val());
        // if($("#current_user_gr").val() == '0103'){

        //     userGradeSearch("0100", "user_gr", '0107')
        //     $("#user_gr").attr("disabled",true);

        //     storeCodeList("iParking_seq",'');

        // } else userGradeSearch("0100", "user_gr", '')

        // 0103 일 경우 점포 담당자만 등록 할 수 있음.
        if(group_seq_now == '0102' && user_id_now != 'admin'){
            $("#user_count_label").hide();
            $("#user_count").hide();


        } else userGradeSearch("0100", "user_gr", '')

        if(user_id_now == 'admin'){
            $("#user_count_label").show();
            $("#user_count").show();
        }

        
        $("#user_menu").text("")
        $("#user_conf_pwd").parent().css("display",'')
    });

    //****************************************************사용자 상세조회******************************************

    $('#data_list tbody').on('click', 'button', function () {
        $("#user_gr_div").hide();
        $("#duplicate_check").hide();
        if($(this).attr("type") == "detail"){
            var user_yn = $(this).attr("user_yn")
            var user_id = $(this).val();
            var user_nm = $(this).attr('user_nm');
            var user_gr = $(this).attr('user_gr');
            user_gr_temp = user_gr;
            var user_dept_nm = $(this).attr('user_dept_nm');
            var parking_seq = $(this).attr('parking_seq');
            var parking_nm = $(this).attr('parking_nm');
            var user_count = $(this).attr('user_count');
            user_disk_temp = $(this).attr('user_disk');
            var user_disk = $(this).attr('user_disk')/1000000;
            user_settop_temp = $(this).attr('user_settop');
            var user_settop = $(this).attr('user_settop');

            // 팝업열기
            $(this).attr("data-target","#modalInsert")
            $("#btnDelete").show();
            // 0102일 경우 세부내역 오픈
            if(user_gr == '0102'){
                // 관리자 선택
                $("#user_detail").show();
                $("#user_count").show();
                $("#user_count_label").show();
                $("#user_disk").show();
                $("#user_settop").show();
                $("#btnDelete").hide();
            }else{
                $("#user_detail").show();
                $("#user_count").hide();
                $("#user_count_label").hide();
                $("#user_disk").show();
                $("#user_settop").show();
                $("#btnDelete").show();
            }

            $("#modalTitle").text("사용자 정보 수정");
            $("#user_conf_pwd").parent().css("display",'none')
            $("#btnRegister").hide();
            $("#btnUpdate").show();
            $("#user_id").attr("readonly",true);
            $("#user_id").val(user_id);
            $("#user_id_set").val(user_id);
            $("#user_nm").val(user_nm);
            $("#user_count").val(user_count);
            $("#user_disk").val(user_disk);
            $("#user_settop").val(user_settop);

            $("#user_dept_nm").attr("disabled",false);
            $("#user_dept_nm").val(user_dept_nm);


            if($("#user_id").val() == user_id_now && user_id_now != 'admin'){
                $("#user_detail").hide();
            }else{
                $("#user_detail").show();
            }


            if(user_yn == "사용"){

                $("#btnDelete").text("미사용")
            }else{
                $("#btnDelete").text("사용")
            }

            // 0103 일 경우 Disable
            // alert($("#current_user_gr").val());
            if($("#current_user_gr").val() == '0103'){
                $("#user_gr").attr("disabled",true);
            } else {
                $("#user_gr").attr("disabled",false);
            }

        }else if($(this).attr("type") == "dormant"){

            var user_id = $(this).val();

            $.ajax({
                type: "PUT",
                url: "/user/dormancy/"+user_id,
                success : function(json) {
                    $(this).prop('disabled', true);
                    alert(json.resultString)
                    $("#btnSearch").click();
                    $("#btnClose").click();
                },
                error: function(json){
                    $(this).prop('disabled', false);
                    alert(json.responseJSON.resultString)

                }
            });
        }
        $.ajax({
            type: "GET",
            url: "/user/search?user_gr=0000",
            
            success : function(json) {
                sum_user_disk = json.sum_user_disk
                user_disk = json.user_disk
                remain_user_disk = user_disk - sum_user_disk
                user_settop = json.user_settop 
                sum_user_settop = json.sum_user_settop
                remain_user_settop = user_settop - sum_user_settop
            },
            error: function(json){
                // alert(json.responseJSON.resultString)
            }
        });
       

    });

    //************************************ 사용자 등록 및 수정 버튼 클릭 *******************************************
    $("#btnRegister, #btnUpdate").click(function(){
        var url = "";
        var method = "";
        if(remain_disk < 0){
            alert('할당된 용량(' + user_disk/1000000000+ 'GB)를 초과하여 더 추가할 수 없습니다.');
            return;
        }
        if(remain_settop < 0){
            alert('할당된 셋탑박스 수(' + user_settop + ')를 초과하여 더 추가할 수 없습니다.');
            return;
        }

        if($(this).attr('id') == "btnRegister")
        {
            url = "/user/insert";
            method = "POST";
            var userGr = $("#user_gr").val(); 
            if($("#duplicate_check").attr('checking') == "N"){
                alert("아이디 중복체크를 해주세요")
                return;
            }
            
        }else{
            var user_id_set = $("#user_id_set").val();
            method="PUT";
            url = "/user/update/"+user_id_set;
            var userGr = user_gr_temp;
        }

        var userNm = $("#user_nm").val();
        var userId = $("#user_id").val();
        var userPwd = $("#user_pwd").val();
        var userConfPwd = $("#user_conf_pwd").val();
        var userDeptNm = $("#user_dept_nm").val();
        var inputted_user_disk = $("#user_disk").val()*1000000;
        var inputted_user_settop = $("#user_settop").val();
        // $("#user_disk").val(inputted_user_disk);

        var num_pwd = userPwd.search(/[0-9]/g);
        var eng_pwd = userPwd.search(/[a-z]/ig);
        var spe_pwd = userPwd.search(/[`~!@@#$%^&*|₩₩₩'₩";:₩/?]/gi);


        
        if($(this).attr('id') == "btnRegister"){
            if(inputted_user_disk > remain_user_disk && inputted_user_disk != 0){
                alert('할당된 용량(' + user_disk/1000000+ 'MB) 중 잔여분(' + remain_user_disk/1000000+ 'MB)을 초과하여 더 추가할 수 없습니다.');
                return;
            }
            if(inputted_user_settop > remain_user_settop && inputted_user_settop != 0){
                alert('할당된 셋탑박스(' + user_settop+ ' 중 사용가능한 양(' + remain_user_settop+ ')을 초과하여 더 추가할 수 없습니다.');
                return;
            }
        }else{ //업데이트 하는 경우
            // console.log(inputted_user_disk);
            // console.log(remain_user_disk);
            // console.log(user_disk_temp);
            console.log(parseInt(remain_user_disk) + parseInt(user_disk_temp));
            if((parseInt(inputted_user_disk) > parseInt(remain_user_disk) + parseInt(user_disk_temp)) && inputted_user_disk != 0){
                alert('할당된 용량(' + user_disk/1000000+ 'MB) 중 잔여분(' + (parseInt(remain_user_disk)+parseInt(user_disk_temp))/1000000 +'MB)보다 작게 입력해주세요.');
                return;
            }
            if((parseInt(inputted_user_settop) > parseInt(remain_user_settop) + parseInt(user_settop_temp)) && inputted_user_settop != 0){
                alert('할당된 셋탑박스(' + user_settop + ') 중 잔여분(' + (parseInt(remain_user_settop)+parseInt(user_settop_temp)) +')보다 작게 입력해주세요.');
                return;
            }
        }
        if(userNm.length > 10){
            alert("사용자 이름은 10자 이내로 제한됩니다.");
            $("input[name=user_nm").focus();
            return;
        }
        if(userId.length > 10){
            alert("사용자 ID는 10자 이내로 제한됩니다.");
            $("input[name=user_id").focus();
            return;
        }
        if(userDeptNm.length > 10){
            alert("부서명은 10자 이내로 제한됩니다.");
            $("input[name=user_dept_nm").focus();
            return;
        }
        if(userNm == ""){
            alert("사용자 이름을 입력하세요.");
            $("input[name=user_nm").focus();
            return;
        }else if(userId == ""){
            alert("사용자 ID를 입력하세요");
            $("input[name=user_id").focus();
            return;
        }else if(userPwd == ""){
            alert("비밀번호를 입력 하세요");
            $("input[name=user_pwd").focus();
            return;
        }else if(num_pwd < 0 || eng_pwd < 0 || spe_pwd < 0 ){
            alert("영문,숫자, 특수문자를 혼합하여 입력해주세요.");
            $("input[name=user_pwd").focus();
            return;
        }else if(userPwd != userConfPwd){
            if(method == "POST"){
                alert("비밀번호 설정 오류 입니다.");
                $("#user_conf_pwd").val("")
                $("#user_conf_pwd").focus();
                return;
             }
        }else if(userGr == "all"){
            alert("사용자 등급을 선택하세요");
            return;
        }else if(userDeptNm == ""){
            alert("사용자 부서를 입력하세요");
            return;
        }
        if($("#user_disk").val() == "" || $("#user_disk").val() < 0){
            alert("저장공간을 정확히 입력하세요");
            return;
        }
        if($("#user_settop").val() == "" || $("#user_settop").val() < 0){
            alert("셋탑박스 대수를 정확히 입력하세요");
            return;
        }
        if($("#user_count").val() < 0){
            alert("사용자 수를 정확히 입력하세요");
            return;
        }
 
        // 가맹점주가 사용자 등록 또는 수정한 경우는 담당 가맹점을 반드시 골라 줘야 함.(arnold)
        if($("#current_user_gr").val() == '0103'){
            if($("#iParking_seq").val() == 'all'){
                alert("가맹점을 선택해 주세요");
                return;
            }
        }

        // 입력은 막았으나, Form 실행시에서는 Value 넘어가게 풀어 줘야 함. 
        $("#user_gr").attr("disabled",false);
        $("#iParking_seq").attr("disabled",false);


        // 입력 사항 적용
        var pattern_num = /[0-9]/;	// 숫자
    	var pattern_eng = /[a-zA-Z]/;	// 문자
    	var pattern_spc = /[~!@#$%^&*()_+|<>?:{}]/; // 특수문자
    	var pattern_kor = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/; // 한글체크

        // ARNOLD : 사용자 등록 및 수정시에 패스워드 필드 체크 하는 내용.
        // USER_ID : 사용자가 admin 이면 이 부분체크 SKIP. Admin은 사용자 생성시에 아이디와 동일한 패스워드를 입력해서 사용자 만듬. 사용자 접속시에 룰로 만들면 됨.

        if(user_id_now != 'admin') {
            if( (pattern_num.test(userPwd)) && (pattern_eng.test(userPwd)) && (pattern_spc.test(userPwd)) && !(pattern_kor.test(userPwd)) && userPwd.length> 8 ){

    	    }else{
    		    alert("(숫자,영문,특문)포함 8자 이상 비밀번호를 입력해 주세요")
    		    return;
    	    }
        }

        if((pattern_num.test($("#user_disk").val())) && !(pattern_kor.test($("#user_disk").val()))){
        }else{
            alert("저장공간은 숫자만 입력하세요");
            $("#user_disk").val("");
            return;
        }

        if((pattern_num.test($("#user_settop").val())) && !(pattern_kor.test($("#user_settop").val()))){
        }else{
            alert("셋탑박스 수는 숫자만 입력하세요");
            $("#user_settop").val("");
            return;
        }

        var form_data = new FormData($('#formUser')[0]);

        form_data.set('user_disk', inputted_user_disk)
        form_data.set('user_gr', userGr)

        $.ajax({
            url : url,
            data:form_data,
            type: method,
            contentType: false,
            processData: false,
            error:function(){
               alert("서버 응답이 없습니다. 서버 확인후 다시 시도해 주세요.");
            },
            success:function(data) {

                alert(data.resultString);

                if(data.resultCode == "100"){
                    // 아이디 중복 체크
                    $("#user_id").val("");
                    $("#user_id").focus();
                    return

                }else if(data.resultString == "200"){
                    // 수정시 패스워드 오류
                    $("#user_pwd").val("");
                    $("#user_pwd").focus();
                    return
                }

                $("#btnSearch").click();
                $("#btnClose").click();

           }
        });

    });

    $(document).ready(function(){


        
        $('.tbl_list .row_detail').hide();	
        $(document).on('click', '.tbl_list button[id^=trShowBtn]', function() {			
            var trNum = $(this).attr('id').slice(9);	
            if($(this).hasClass('open') == true){
                $(this).removeClass('open');
                $('#trDetail'+trNum+'').hide();
            }else{
                $(this).addClass('open');
                $('#trDetail'+trNum+'').show();
            }		
        });	
        
        //테이블 안의 라인 차트 넓이값 넣어 주기
        tblChartSet();
        function tblChartSet(){
            //값을 계산해서 넣어 주세요.
            var lineChartW = '50px'
            $('#chartSpace01').css('width',lineChartW)
            $('#chartSpace02').css('width',lineChartW);
            $('#chartSpace03').css('width',lineChartW);
        }

    });

    // 사용자 중복체크
    $("#duplicate_check").click(function() {
        check_id = $("#user_id").val();
        if(check_id){
            $.ajax({
                type: "GET",
                url: "/user/duplicate_check/"+check_id, 
                success : function(json) {
                    if(json.result){
                        alert("이미 등록된 아이디입니다.")
                        $("#user_id").val("");
                        $("#user_id").focus();
                    }else{
                        var result = confirm("사용가능한 아이디입니다. 사용하시겠습니까?")
                        if(result){
                            $("#user_id").attr("readonly",true);
                            $("#duplicate_check").attr('checking', 'Y');
                        }else{
                            $("#user_id").val("");
                            $("#user_id").attr("readonly",false);
                            $("#user_id").focus();
                            $("#duplicate_check").attr('checking', 'N');
                        }
                    }
                },
                error: function(json){
                    alert("중복체크 오류")
                }
            });
        }else{
            alert("아이디를 입력해주세요.");
            $("#user_id").focus();
            return;
        }
    });
});

var closePopup = function(){
    $("#user_nm").attr("disabled",false);
    $("#user_nm").val("");
    $("#user_id").attr("readonly",false);
    $("#user_id").val("");
    $("#user_pwd").attr("disabled",false);
    $("#user_pwd").val("");
    $("#user_conf_pwd").attr("disabled",false);
    $("#user_conf_pwd").val("");
    $("#user_gr").attr("disabled",false);
    $("#iParking_seq").attr("disabled",false);
    $("#user_gr").val("all");
    $("#user_dept_nm").attr("disabled",false);
    $("#user_count").val(0);
    $("#user_disk").val(0);
    $("#user_settop").val(0);
    
    $("#modalInsert").modal('hide');
};



var user_yn_fuc = function () {

    user_nm = $("#user_nm").val()
    btn_nm = $("#btnDelete").text()

    if(!confirm(user_nm + " 사용자를 " +btn_nm + "으로 변경 하시겠습니까?")){return;}
    user_id = $("#user_id_set").val();

    $.ajax({
         type: "DELETE",
         url: "/user/delete/"+user_id,
         success : function(json) {

             alert(json.resultString)
             $("#btnClose").click();
             $("#btnSearch").click();
         },
         error: function(json){
             alert(json.responseJSON.resultString)
         }
    });
};

var user_id_find = function () {

    $.ajax({
        type: "GET",
        url: "/user/search?user_gr=0000",
        success : function(json) {

            user_id_now = json.resultUserid
            alert(user_id_now)
        },
        error: function(json){
            alert(json.responseJSON.resultString)
        }
    });
};

function checkNumber(event) {
  if(event.key >= 0 && event.key <= 9) {
    return true;
  }
  return false;
}
