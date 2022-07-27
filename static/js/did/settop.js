// Settop.js
// Managing user functions for settop.html
var user_id_now = '';
var group_seq_now = '';
var dataList = '';
var click_flag = 1;
var group_add_tId = '';
var sObj = "";
var dev_group_data;
var RefreshInterval;

$(function() {
    //************************************ID,PW 한글 입력 막기***************************
    $("#dev_id, #emergencyDuration_val, #knob_spinner, #emergencyDuration_val").on("blur keyup", function() {
        $(this).val( $(this).val().replace( /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/g, '' ) );
    });
    $("#emergencyDuration_val, #knob_spinner, #emergencyDuration_val").keyup(function(e) {
      var regex = /^[a-zA-Z0-9@]+$/;
      if (regex.test(this.value) !== true)
        this.value = this.value.replace(/[^a-zA-Z0-9@]+/, '');
    });

    // 그룹셋탑 카운트 가져오기
    $.ajax({
        type: "GET",
        url: "/settop/search",
        async: false,
        success : function(json) {
            console.log(json);
            dev_group_data = json.resultValue
        },
        error: function(json){
            alert("조회에 실패하였습니다")
        }
    });

    sendingPUSH("status", "", "", 0, 0);
    now_settop();

    var user_settop;
    var now_settop_used;
    $.ajax({
        type: "GET",
        url: "/user/search?user_gr=0000",
        success : function(json) {
            user_settop = json.user_settop;
            now_settop_used = json.now_settop;
            group_seq_now = json.resultUserGroup;
            if(group_seq_now == "0101"){
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
            alert("상세 조회시 에러가 발생했습니다.");
        }
    });

    $('#group_control').on('click', function(){
        if(group_seq_now == '0101'){
            alert("슈퍼관리자는 그룹제어를 할 수 없습니다.")
            return false;
        }
		if($(this).hasClass('open') == true){
			$("#grp_point").text(">>");
            $('#slideBtn').animate({left:-400}, 700);			
			$(this).removeClass('open');
		}else if($(this).hasClass('open') == false){	
            $("#grp_point").text("<<");		
			$('#slideBtn').animate({left:90}, 700);
			$(this).addClass('open');
		}		
    });

  
    // MENU 적용
    $('#mn_settop').attr({
        'class' : 'active',
    });

    // interval 이용한 주기적 Reload
    $("#btnRefresh").click(function(){
        if(click_flag == 1){
            $("#btnRefresh").removeClass('stop');
            //실행할 스크립트 
            now_settop();
            var Now = new Date();
            console.log("REFRESH EVENT 발생 !!"+Now)
            var params = ""
            var schType = $("#schType").val();
            var schTxt  = $("#schTxt").val();
    
            //상세구분 체크
            if(schType == "dev_id"){
                if(schTxt != ""){
                    params += "?dev_id="+schTxt;
                }
            }else if(schType == "dev_nm"){
                if(schTxt != ""){
                    params += "?dev_nm="+schTxt;
                }
            }
            // console.log("Device search = ["+params+"]")
            dataList.ajax.url("/settop/search"+params).load();
            $(sObj).click();
            // $("#device_group_id_1").hide(); 
            // $("#device_group_id_2").hide();
            
            RefreshInterval = setInterval(function() {
                //실행할 스크립트 
                now_settop();
                var Now = new Date();
                console.log("REFRESH EVENT 발생 !!"+Now)
                var params = ""
                var schType = $("#schType").val();
                var schTxt  = $("#schTxt").val();
        
                //상세구분 체크
                if(schType == "dev_id"){
                    if(schTxt != ""){
                        params += "?dev_id="+schTxt;
                    }
                }else if(schType == "dev_nm"){
                    if(schTxt != ""){
                        params += "?dev_nm="+schTxt;
                    }
                }
                sendingPUSH("status", "", "", 0, 0);

                dataList.ajax.url("/settop/search"+params).load();
                $(sObj).click();
            }, 20000);
            RefreshInterval;
            click_flag = 0;
        } else {
            $("#btnRefresh").addClass('stop');
            clearInterval(RefreshInterval);
            click_flag++;
        }
    });

    $("#user_id").val($("#current_user_id").val())

    // top graph drawing !! 
    draw_graph();
    draw_tree();
    cnt_group_dev();


    commonSearch('0600','device_type', '');
    
    
    // Settop 관련 functions

    //************************************************리스트 조회 및 옵션 처리************************************************
    

    var conn_stat = "";

    dataList = $('#data_list').DataTable({
        "lengthChange": false,
        "destroy": true,
        "searching": false,
        "ordering": true,
        "info": false,
        // "autoWidth": true,
        // "processing": true,
        // "serverSide": true,
        "responsive": true,
        ajax : {
            "url": "/settop/search",
            "type":"POST",
            "async" :"false"
        },
        "columns": [
                { data: "row_cnt"},
                { data: "row_cnt"},
                { data: "dev_nm"},
                { data: "dev_id"},
                {
                    data: null,

                    render: function(data, type, full, meta){
                        return data.device_location.replace("|"," ");
                    }
                },                
                {
                    data: null,

                    render: function(data, type, full, meta){
                        if(data.device_type == "0601")
                        {
                            return "윈도우";
                        }
                        else if(data.device_type == "0602")
                        {
                            return "안드로이드";
                        }
                        else if(data.device_type == "0603"){
                            return "리눅스";
                        }
                        else {
                            return "";
                        }
                    }
                },
                { data: "device_disk"},
                { data: "device_cpu"},
                { data: "device_mem_used"},
                { data: "device_sw_ver"},
                { data: "device_play_status"},
                {
                    data: null,

                    render: function(data, type, full, meta){
                        // 1 전체 , 2 정상(녹) , 3 장애(빨), 4 접속(회), 5 입고(검은색)
                        if(data.device_conn == "2")
                        {
                            return "<img src='/static/dist/img/settop_on.png' width='20px' height='20px'><a style='display:none;'>2</a></img>";
                        }
                        else if(data.device_conn == "3")
                        {
                            return "<img src='/static/dist/img/settop_error.png' width='20px' height='20px'><a style='display:none;'>4</a></img>";
                        }
                        else if(data.device_conn == "4"){
                            return "<img src='/static/dist/img/settop_black.png' width='20px' height='20px'><a style='display:none;'>3</a></img>";
                        }
                        else {
                            return "<img src='/static/dist/img/settop_off.png' width='20px' height='20px'><a style='display:none;'>5</a></img>";
                        }
                    }
                },
                {
                    data: null,

                    render: function(data, type, full, meta){
                        
                        return "<button class=' btn_point "+
                                "buttons-collection buttons-colvis' " +
                                " id='organ_detail_"+data.dev_id+"' onclick='organ_detail(\""+data.dev_id+"\")' title='편성정보확인'>"+
                                " 편성정보</button>";
                    }
                },                
                // { data: "device_control"},
                {
                    data: null,

                    render: function(data, type, full, meta){
                        
                        
                        return  "<select name='settop_control' id='settop_control_"+data.dev_id+"' onchange='selDevice_each(\""+data.dev_id+"\")'>"+
                                "   <option value='all'>개별제어</option>"        +
                                "   <option value='reboot'>재시작</option>"+
                                "   <option value='screen_shot'>스크린샷</option>"+
                                "   <option value='volume'>볼륨설정</option>"+
                                "   <option value='emergency'>긴급문자</option>"+
                                "   <option value='log'>로그전송</option>"+
                                "</select>";

                    }
                },     
                {
                    data: null,
                    render: function(data, type, full, meta){

                        return "<button class=' btn_point "+
                                "buttons-collection buttons-colvis' value='"+data.dev_id+
                                "' user_id='"+data.user_id+
                                "' dev_conn='"+data.dev_conn+ "' data-toggle='modal' id='settop_detail_"+data.dev_id+"' onclick='dev_detail(\""+data.dev_id+"\")' title='상세보기'>상세보기</button>";
                    }
                }
        ],
        'columnDefs': [
            {
               'targets': 0,
               'checkboxes': {
                  'selectRow': true
               }
            },
            {
                    "className": "text-center", "targets": "_all"
            },
            {"targets":3, "type":"natural"},
            { orderable: false, targets: 0 },
            { orderable: false, targets: 4 },
            { orderable: false, targets: 5 },
            { orderable: false, targets: 6 },
            // { orderable: false, targets: 7 },
            { orderable: false, targets: 8 },
            // { orderable: false, targets: 9 },
            { orderable: false, targets: 10 },
            // { orderable: false, targets: 11 },
            { orderable: false, targets: 12 },
            { orderable: false, targets: 13 },
            { orderable: false, targets: 14 }
        ],
        "rowCallback": function( row, data, iDisplayIndex ) {
        },
        "paging": true,
        "pageLength": 7,
        "language": {
          "zeroRecords": "데이터가 존재하지 않습니다."
        },
        
        dom: "<'row'<'col-sm-6'l><'col-sm-6'f>>" +
             "<'row'<'col-sm-12'tr>>" +
             "<'row'<'col-sm-12'p>>",
    });

    $('form').on('submit', function(event){
        event.preventDefault();
    });

    // Excel Download (by. JUN) 0822
    $("#btnExportPopup").click(function(e) {
        console.log("ENTER!!!! DOWNLOAD!!!");
        url = "/settop/download";
        e.preventDefault();  //stop the browser from following
        window.location.href = "/settop/download";

    });
    // Excel Download END *****

    //************************************ 조건 검색 클릭 ***************************
    $("#btnSearch").click(function(){
        var params = ""
        var schType = $("#schType").val();
        var schTxt  = $("#schTxt").val();
        if(schTxt.length > 30){
            alert("검색어는 30자 이내로 입력해주세요");
            return;
        }

        //상세구분 체크
        if(schType == "dev_id"){
            if(schTxt != ""){
                params += "?dev_id="+schTxt;
            }
        }else if(schType == "dev_nm"){
            if(schTxt != ""){
                params += "?dev_nm="+schTxt;
            }
        }
        // console.log("Device search = ["+params+"]")
        dataList.ajax.url("/settop/search"+params).load();
        // $("#device_group_id_1").hide(); 
        // $("#device_group_id_2").hide(); 
    });    

    //***************************************************셋탑박스 등록 팝업**************************************************
    $("#btnInsertPopup").click(function() {
        if(group_seq_now == '0101'){
            alert("슈퍼관리자는 셋탑박스를 추가할 수 없습니다.")
            return;
        }
        if(now_settop_used >= user_settop){
            alert("추가가능한 셋탑박스의 개수("+user_settop+")를 모두 사용하셨습니다.")
            return;
        }

        $('#dev_id').attr("readonly", false);
        $("#postcodify").html("");
        address_api();
        device_select_list('0', 'device_group_id', '0');
        $("#modalInsert h4").text("셋탑박스 등록");
        // $(this).attr("data-target","#modalInsert")
        $("#modalInsert").show();
        $("#btnInsert").show();
        $("#btnDelete").hide();
        $("#btnUpdate").hide();
        $("#btnReboot").hide();
        $("#btnInit").hide();
        $("#btnAdd").hide();
        $("#duplicate_check").show();
        $("#duplicate_check").attr('checking', 'N')

        // //셋탑박스 1건 추가
        // $("#btnAdd").click();
    });

    
    //***************************************************셋탑박스 멀티 등록 팝업**************************************************
    $("#btnMultiInsertPopup").click(function() {
        if(group_seq_now == '0101'){
            alert("슈퍼관리자는 셋탑박스를 추가할 수 없습니다.")
            return;
        }
        if(now_settop_used >= user_settop){
            alert("추가가능한 셋탑박스의 개수("+user_settop+")를 모두 사용하셨습니다.")
            return;
        }

        $("#modalUpload").show();

    });


    $("#device_group_id_0").on( "change", function() {

        var select_0 = $("#device_group_id_0 option:selected").val();
        if(select_0 != "all"){
            device_select_list(select_0, 'device_group_id', '1');
            $("#device_group_id_1").show();                
        } else{
            $("#device_group_id_1").val("all").prop("selected", true);
            $("#device_group_id_2").val("all").prop("selected", true);
        }
    });

    $("#device_group_id_1").on( "change", function() {

        var select_1 = $("#device_group_id_1 option:selected").val();
        if(select_1 != "all"){
            $("#device_group_id_2").show();
            device_select_list(select_1, 'device_group_id', '2');
        } else{
            $("#device_group_id_2").val("all").prop("selected", true);
        }
    });



   

    //*********************************************** 셋탑 액션 적용 ***************************************************

    // Reboot 클릭
    $("#btnReboot").click(function() {

        var dev_id = $("#dev_id").val();
        method="POST";
        url = "/app/booting/insert";


        var form_data = new FormData($('#formSetTop')[0]);
        $.ajax({
            url : url,
            data:form_data,
            type: method,
            contentType: false,
            processData: false,
            beforeSend: function() {

             },
            error:function(){
               alert("서버 응답이 없습니다. 서버 확인후 다시 시도해 주세요.");

            },
            success:function(data) {

               alert(data.resultString);
               $("#btnSearch").click();
               $("#btnClose").click();

           }
        });
    });

    $("#btnDelete").click(function(){
        if(!confirm("해당 셋탑박스를 삭제하시겠습니까?")){return}

        var delete_devId = $("#dev_id").val()
        console.log("DEV ID : "+delete_devId);
        delDevice(delete_devId);
        draw_graph();
        draw_tree();
        cnt_group_dev();

        
    })


    //    초기화 처리
    $("#btnInit").click(function() {

        var dev_id = $("#dev_id").val();
        method="PUT";
        url = "/settop/init/update/"+dev_id;

        $.ajax({
            url : url,
            type: method,
            contentType: false,
            processData: false,
             beforeSend: function() {

             },
            error:function(){
               alert("서버 응답이 없습니다. 서버 확인후 다시 시도해 주세요.");

            },
            success:function(data) {
               alert(data.resultString);
               $("#btnSearch").click();
               $("#btnClose").click();

           }
         });
    });

    //  신규등록 or 업데이트
    $("#btnInsert,#btnUpdate").click(function() {
        if(group_seq_now == '0101'){
            alert("슈퍼관리자는 수정하거나 추가할 수 없습니다.")
            return;
        }

        var url = "";
        var method = "";
        var dev_id = $("#dev_id").val();

        // 저장버튼 클릭시 유효성체크
        if($(this).attr('id') == "btnInsert")
        {
            method="POST";
            url = "/settop/insert";
            if($("#duplicate_check").attr('checking') == "N"){
                alert("아이디 중복체크를 해주세요")
                return;
            }
        }else{

            dev_id = $("#dev_id").val();
            method="PUT";
            url = "/settop/update/"+dev_id;
        }

        var pattern = /\s/g; // 빈칸(스페이스키) 찾기

        if(dev_id == "")
        {
            alert("아이디를 입력해주세요.");
            return;
        } else if(dev_id.match(pattern))
        {
            alert("아이디 공백이 존재합니다.");
            return;
        }

        var parking_seq = $("#parking_seq").val();

        if(parking_seq == "all")
        {
            alert("가맹점을 선택해주세요.");
            return;
        }


        if($(this).attr('id') == "btnInsert"){
            // 등록시 멀티 체크
            // 타이틀 갯수로 등록될 셋탑수를 찾아낸다.
            // var titleLength = $("#laySetTop .control-label").length;

            // for(var i=0; i<Number(titleLength); i++){
                // dev_nm =                params['dev_nm']
                // dev_cmt =               params['dev_cmt']
                // device_type =           params['device_type']
                // device_location =       params['device_location']
                // device_longitude =      params['device_longitude']
                // device_latitude =       params['device_latitude']
                // device_ncps =           params['device_ncps']
                // user_id =               params['user_id']
                // device_group_id =       params['device_group_id']

            var dev_nm   =                  $("#dev_nm").val()
            var dev_id   =                  $("#dev_id").val()
            var dev_cmt =                   $("#dev_cmt").val()
            var device_type =               $("#device_type").val()
            var device_location =           $("#device_location").val()
            var device_location_detail =    $("#device_location_detail").val()
            var device_longitude =          $("#device_longitude").val()
            var device_latitude =           $("#device_latitude").val()
            var device_ncps =               $("#device_ncps").val()
            var device_group_id_0 =         $("#device_group_id_0").val()
            var device_group_id_1 =         $("#device_group_id_1").val()
            var device_group_id_2 =         $("#device_group_id_2").val()


            console.log("dev_nm = ["+dev_nm+"]");
            console.log("dev_nm = ["+dev_id+"]");
            console.log("dev_cmt = ["+dev_cmt+"]");
            console.log("device_type = ["+device_type+"]");
            console.log("device_location = ["+device_location+"]");
            console.log("device_longitude = ["+device_longitude+"]");
            console.log("device_latitude = ["+device_latitude+"]");
            console.log("device_ncps = ["+device_ncps+"]");
            console.log("device_group_id_0 = ["+device_group_id_0+"]");
            console.log("device_group_id_1 = ["+device_group_id_1+"]");
            console.log("device_group_id_2 = ["+device_group_id_2+"]");

            // 유효성 체크!
            if(dev_nm == ""){
                alert("셋탑명을 입력하세요");
                return;
            }
            if(dev_nm.length > 30){
                alert("셋탑명은 30자 이내여야 합니다");
                return;
            }
            if(dev_id == ""){
                alert("셋탑 아이디를 입력하세요");
                return;
            }
            if(dev_id.length > 30){
                alert("셋탑 아이디는 30자 이내여야 합니다");
                return;
            }
            
            if(dev_cmt.length > 30){
                alert("셋탑 코멘트는 30자 이내여야 합니다.");
                return;
            }

            if(device_location == ""){
                alert("셋탑 주소를 입력하세요");
                return;
            }

            if(device_location_detail.length > 30){
                alert("상세 주소는 30자 이내여야 합니다");
                return;
            }

            if(device_type =="all"){
                alert("장비 타입을 선택하세요");
                return;
            }

            // if(device_group_id_0 == "all"){
            //     $("#device_group_id_0").val("default");
            // }
            // }
        }else{
            //특정 셋탑만 체크

            var dev_nm   = $("input[name=dev_nm").val();
            var dev_cmt = $("input[name=dev_cmt").val();
            var dev_serial = $("input[name=dev_serial").val();
            var dev_wifi_mac  = $("input[name=dev_wifi_mac").val();
            var dev_ethe_mac  = $("input[name=dev_ethe_mac").val();

            var dev_ip   = $("input[name=dev_ip").val();
            var user_id     = $("select[name=user_id").val();

            if(dev_nm == ""){
                alert("셋탑명을 입력하세요");
                 $("input[name=dev_nm").focus();
                return;
            }
            if(dev_nm.length > 30){
                alert("셋탑명은 30자 이내여야 합니다");
                return;
            }
            // if(dev_cmt == ""){
            //     alert("셋탑 코멘트를 입력하세요");
            //      $("input[name=dev_cmt]").focus();
            //     return;
            // }
            if(dev_cmt.length > 100){
                alert("셋탑 코멘트는 100자 이내여야 합니다.");
                return;
            }
            if((dev_serial == "") &&(dev_wifi_mac == "")&&(dev_ethe_mac == "") ){
                alert("시리얼,Wifi MAC, Ethenet MAC 중 하나라도 등록이 되어 있어야 합니다.");
                $("input[name=dev_serial").eq(i).focus();
                return;
            }
        }


        var device_location =       $("#device_location").val() + "|" + $("#device_location_detail").val();
        var device_longitude =      $("#device_longitude").val();
        var device_latitude =       $("#device_latitude").val();


        var form_data = new FormData($('#formSetTop')[0]);
        form_data.append("device_location", device_location);
        form_data.append("device_longitude", device_longitude);
        form_data.append("device_latitude", device_latitude);
        for (var pair of form_data.entries()) {
            // 예외처리 진행
            console.log(pair[0]+ ', ' + pair[1]);
        }

        
        $.ajax({
            url : url,
            data: form_data,
            type: method,
            contentType: false,
            processData: false,
            beforeSend: function() {

            },
            error:function(error){
                alert(error.resultString);
                $("#parking_seq").attr("readonly", true);
                $(sObj).click();

            },
            success:function(data) {
                alert(data.resultString);
                
                if(sObj == ""){
                    $("#btnSearch").click();
                } else{
                    $(sObj).click();
                }
                $("#btnClose").click();
                cnt_group_dev();
                
           }
        });

        closePopup();
    });

    
    // 긴급문자 / 볼륨 확인시 처리
    $("#deviceSending").click(function() {

        // $("#device_list_popup").val(device_list);
        // $("#fncode_popup").val(fnCode);

        var fnCode =    $("#fncode_popup").val();
        var device_id = $("#device_list_popup").val();
        var volume = 0;
        var comment = '';
        var duration = 0;
        if(fnCode == 'volume') {
            volume = parseInt($("#deviceValue_val").val());
        } else if(fnCode == 'emergency') {
            if($("#deviceValue_val").val() == ""){
                alert("내용을 입력하세요");
                return;
            } else if($("#deviceValue_val").val().length > 100){
                alert("글자 수는 100자 이내로 입력해주세요");
                $("#deviceValue").val("");
                return;
            } else if($("#emergencyDuration_val").val() == ""){
                alert("시간을 입력해 주세요");
                return;
            } else {
                comment =  $("#deviceValue_val").val();
                duration = $("#emergencyDuration_val").val();
            }
        }
        // value 세팅해서 바로 전송 하고 완료 함.
        // sendingPUSH(fnCode,device_list)
        sendingPUSH(fnCode, device_id, comment, volume, duration);

        $("#deviceValue_val").val("");
        $("#emergencyDuration_val").val("");

        closeLayerPopup('deviceValueInput');
    });

     // 볼륨 팝업 스피너 이벤트
    $(".knob").knob({
        release : function (value) {
            //console.log(this.$.attr('value'));
            console.log("release : " + value);
            $("#deviceValue_val").val(value);
        },
        'change': function() {          
        }
    });

    $("#group_add_btn").on('click', function(){
        $("#group_tID").val(0)
        $("#group_depth").val(0);
        group_add_tId = "ROOT"
        $("#groupAddPopup").show();

    });
    
});

var selDevice_each = function(dev_id){
    var device_list = dev_id;
    
    console.log("DEVICE LIST ["+device_list+"]");
    

    if(device_list.length !=0 ){

        var fnCode = $("#settop_control_"+dev_id+" option:selected").val();
        console.log(fnCode);
        // Device ID 골라졌으면 간다 !!! 아니면 에외처리 !!
        // fnCoce, device_list I have. 

        if(fnCode == 'volume' || fnCode =='emergency') {

            // <input type="hidden" name="" id="device_list_popup">
            // <input type="hidden" name="" id="fncode_popup"></input>
            
            // Init
            $("#deviceValue").val('');

            $("#device_list_popup").val(device_list);
            $("#fncode_popup").val(fnCode);

            if(fnCode == 'volume') {
                // comment 처리   
                // $("#knob_spinner").val(0);
                $('#knob .knob').val(20).trigger('change');
                $("#device_title").text("볼륨 설정");
                $("#emergencyDuration").hide();
                $("#knob").show();
                $("#deviceValue").hide();
                $("#deviceValue_val").val('20');
            } else if (fnCode =='emergency'){
                // comment 처리
                $("#deviceValue_val").val('');
                $("#emergencyDuration_val").val('');
                $("#deviceValue").show();
                $("#device_title").text("긴급문자입력");
                $("#emergencyDuration").show();
                $("#knob").hide();
                
            }

            // Popup 처리 루틴 적용
            openLayerPopup('deviceValueInput');
            
            
        } else sendingPUSH(fnCode,device_list,'',0,0);

    }else{
        alert("대상 단말을 1대 이상 선택 해 주세요");
    }


}
var selDevices = function(fnCode){
    var device_list = "";
    $('#data_list tr').each(function(i) {

        var $chkbox = $(this).find('input[type="checkbox"]');

        // Only check rows that contain a checkbox
        if($chkbox.length) {

            var status = $chkbox.prop('checked');

            if(status) {
                if(i != 0){
                    var device_id = $("#data_list tr:eq("+i+") td:eq(3)").text();

                    if(device_list == "") device_list = device_id;
                    else device_list += "."+device_id;
                }             
            }
        }
        console.log("DEVICE LIST ["+device_list+"] function Code == ["+fnCode+"]");
    });

    if(device_list.length !=0 ){
        // Device ID 골라졌으면 간다 !!! 아니면 에외처리 !!
        // fnCoce, device_list I have. 

        if(fnCode == 'volume' || fnCode =='emergency') {

            // <input type="hidden" name="" id="device_list_popup">
            // <input type="hidden" name="" id="fncode_popup"></input>
            
            // Init
            $("#deviceValue").val('');

            $("#device_list_popup").val(device_list);
            $("#fncode_popup").val(fnCode);

            if(fnCode == 'volume') {
                // comment 처리   
                // $("#knob_spinner").val(0);
                $('#knob .knob').val(20).trigger('change');
                $("#device_title").text("볼륨 설정");
                $("#emergencyDuration").hide();
                $("#knob").show();
                $("#deviceValue").hide();
                $("#deviceValue_val").val('20');                
            } else if (fnCode =='emergency'){
                // comment 처리
                $("#deviceValue").show();
                $("#device_title").text("긴급문자입력");
                $("#emergencyDuration").show();
                $("#knob").hide();
                
            }

            // Popup 처리 루틴 적용
            openLayerPopup('deviceValueInput');
            
            
        } else sendingPUSH(fnCode,device_list,'',0,0);

    }else{
        alert("대상 단말을 1대 이상 선택 해 주세요");
    }

}

// 단말 PUSH 전송 ///////////////////////////////////////
function sendingPUSH(fnCode, device_id, comment, volume, duration) {
    console.log(volume)
    var url = "/settop/push?dev_id="+device_id+"&command="+fnCode+"&comment="+comment+"&volume="+volume+"&duration="+duration;
    console.log(url)
    $.ajax({
        url : url,
        type: "GET",
        async: false,
        contentType: false,
        processData: false,
        error:function(){
            alert("서버 응답이 없습니다. 서버 확인후 다시 시도해 주세요.");
            
        },
        success:function(data) {
            result = data;
            console.log(result);
            var ScreenRefreshInterval;

            if(fnCode == 'screen_shot'){

                shot_no = result.shot_no;
                shot_retry_count = 0; 

                if(result.resultCode == '0' && shot_no != '0'){

                    ScreenRefreshInterval = setInterval(function() {

                        // screen shot view. /settop/screenshot
                        $.ajax({
                            type: "GET",
                            url: '/settop/screenshot?shot_no='+shot_no,
                            async : false,
                            success : function(json) {
                                // URL VIEW !!!!
                                // NEW WINDOWS VIEW SCREEN SHOT !!
                                if(json.shot_url != "") {
                                     
                                    clearInterval(ScreenRefreshInterval);
                                    $("#btnSearch").click();
                                    // Go Go to new windows open. 
                                    var screenshot_img = "<img src='"+json.shot_url+"' style='height: 100%; display: block;'></img>"
                                    $("#screenshot_container").append(screenshot_img);
                                    $("#modal_screenshot").show();
                                    return false;
                                } else {
                                    shot_retry_count++;

                                    if(shot_retry_count > 3) {
                                        alert("Screenshot 가져오기에 실패 했습니다.");
                                        clearInterval(ScreenRefreshInterval);
                                        $("#btnSearch").click();
                                        return false;
                                    }
                                }
                            },
                            error: function(json){
                            }
                        });
                    }, 1000);
                } else alert("Screen Shot 실시간 보기 오류 입니다.");

            } else if(fnCode == 'log') {
                var LogRefreshInterval; 

                log_no = result.log_no;

                if(result.resultCode == '0' && log_no != '0'){

                    LogRefreshInterval = setInterval(function() {

                        // screen shot view. /settop/screenshot
                        $.ajax({
                            type: "GET",
                            url: '/settop/devicelog?log_no='+log_no,
                            async : false,
                            success : function(json) {
                                    // URL VIEW !!!!
                                    // NEW WINDOWS VIEW SCREEN SHOT !!
                                    console.log(json)
                                    if(json.log_url != "") {
                                        
                                        clearInterval(LogRefreshInterval);
                                        $("#btnSearch").click();
                                        // Go Go to new windows open. 
                                        window.open(json.log_url);
                                        return false;
                                    } else {
                                        shot_retry_count++;

                                        if(shot_retry_count > 3) {
                                            alert("Log 파일 가져오기에 실패 했습니다.");
                                            clearInterval(LogRefreshInterval);
                                            $("#btnSearch").click();
                                            return false;
                                        }
                                    }
                                },
                                error: function(json){
                                }
                        });
                    },1000);

                } else alert("Log 파일 실시간 보기 오류 입니다.");
            } else {
                if(fnCode != 'status') alert(data.resultString);
                $("#btnSearch").click();
            }

            if(result.resultCode == '100') alert("미들웨어 연동에러 입니다.");

        }
    });
}


//********************************************* 팝업종료 시 데이터 초기화 설정 *************************************************

var closePopup = function(){

    $("#modal_screenshot").hide();
    $("#screenshot_container").html('');
    
    // 팝업닫기
    //팝업 데이터 초기화
    var options = "<option selected value='all'>선택하세요</option>";
    $("#site_area1, #site_area2, #parking_seq").html(options);

    // 팝업닫기
    $("#site_area1").attr("readonly",false);
    $("#modalInsert").hide();
    // $("#laySetTop").html("");

    $("#dev_nm").val("");
    $("#dev_id").val("");
    $("#dev_cmt").val("");
    $("#device_type").val("");
    $("#search_result").html("");
    $("#device_location_detail").val("");
    $("#device_location").val("");
    $("#device_longitude").val("");
    $("#device_latitude").val("");
    $('#latitude').hide();
    $('#longitude').hide();
    $("#device_ncps").val("");
    $("#device_mem_total").val("");
    $("#device_disk_total").val("");
    $("#device_group_id_0").val("all").prop("selected", true);
    $("#device_group_id_1").val("all").prop("selected", true);
    $("#device_group_id_2").val("all").prop("selected", true);
    
   
};

//********************************************* 팝업종료 시 데이터 초기화 설정 *************************************************

var closePopupGroup = function(){

    // 팝업닫기
    $("#groupAddPopup").hide();
    // $("#laySetTop").html("");

    $("#group_name").val("");
    $("#group_tID").val("");
    $("#group_depth").val("");
};


var closeUpPopup = function() {
    // 팝업닫기
    $("#modalUpload").hide();

    $("#file_nm_text").val("");
    $("#file_nm").val("");
    $("#file_size").val("");
    $("#file_type").val("");
}

// End settop functions
var draw_tree = function(){
    var setting = {
        edit: {
            enable: true,
            showRemoveBtn: selectBtn,
            showRenameBtn: selectBtn,
            drag: {
                isMove: true,
            }
        },
        data: {
            simpleData: {
                enable: true
            }
        },
        view: {
            addDiyDom: addDiyDom
        },
        check: {
            chkboxType: { "Y" : "s", "N" : "s" },
            enable: true
        },
        callback : {
            beforeClick: getnodeid,
            beforeRemove: beforeRemove,
            onRemove: onRemove,
            onRename : onRename,            
            beforeDrop: beforeDrop,
            onDrop: onDrop,
            beforeCheck: beforeCheck,  
            onCheck : OnCheck,
            onExpand: OnExpand         
        }
    };


    
    
    var zNodes =[
        { id:"default", pId:0, name:"전체", t:"default", drag:false, drop:false},
    ];
    var tree_data = "";

    $.ajax({
        type: "GET",
        url: '/settop/common/search',
        async : false,
        success : function(json) {
            tree_data = json.data
        },
        error: function(json){
        }
    });

    for(i=0; i < tree_data.data.length; i++){
        zNodes.push(tree_data.data[i])
    }
            
    console.log(zNodes);


    function getnodeid(treeId, treeNode, clickFlag) {
        var params = "";

        console.log(treeId);
        console.log(treeNode);
        $("a [name=addbtn]").remove();
        if(treeNode.id != "default"){
            sObj = $("#" + treeNode.tId + "_span");
            if (treeNode.editNameFlag || $("#addBtn_"+treeNode.tId).length>0) return;
            var addStr = "<span class='button add' id='addBtn_" + treeNode.tId
                + "' title='하위그룹추가' name='addbtn' ></span>";
            $("#diyBtn_"+treeNode.id).after(addStr);
            var btn = $("#addBtn_"+treeNode.tId);
            if (btn) btn.on("click", function(){
                if(treeNode.level >= 2){
                    alert("하위 그룹을 추가 할 수 없습니다")
                    return false;
                } else {
                    group_add_tId = treeNode.tId
                    $("#group_tID").val(treeNode.id);
                    $("#group_depth").val((treeNode.level +1));
                    openLayerPopup('groupAddPopup');
                    
                }
            });
            console.log("TREE NODES ID : [" + treeNode.id+"]");            
            params += "?device_group_id="+treeNode.id;
        } else {
            params = "";
        }
              
        
        // var treeObj = $.fn.zTree.getZTreeObj(treeId);
        // treeObj.checkNode(treeNode, true, true);
                
        dataList.ajax.url("/settop/search"+params).load();
        return true;
    }

    function selectBtn(treeId, treeNode) {
        if(treeNode.id == "default"){
            return;
        }
        var node_selected = "#"+treeNode.tId+"_a"
        $(node_selected).attr('class').includes('curSelectedNode')
        // if($("'#"+node_selected+"'").className)
        return $(node_selected).attr('class').includes('curSelectedNode');
    }
    
    function beforeRemove(treeId, treeNode) {
        if(treeNode.id == "default"){
            return false;
        }
        var data_list_empty = $("#data_list tbody tr").children().length;
        if (treeNode.isParent) {
            alert("하위 그룹이 존재합니다");
            return false;
        } else if(data_list_empty == 1){
            return confirm("'"+ treeNode.name + "'를 삭제하시겠습니까?");
        } else {
            alert("그룹에 셋탑박스가 존재합니다");
             return false
        }
    }
    function onRemove(e, treeId, treeNode) {
        changeTree(treeNode.id, treeNode.name, '','',"DEL");
    }
    //이름 바꾸기
    function onRename(e, treeId, treeNode) {
        var new_pId = treeNode.pId
        var new_depth = treeNode.level
        if(treeNode.name.length > 10){
            alert("그룹명은 10자 이내로 입력하세요");
            return false
        }
        
        if(new_pId == null) new_pId = 0
        changeTree(treeNode.id,treeNode.name, new_pId, new_depth,"RENAME");
        console.log("tree ID : [" + treeNode.id +"] tree New name : ["+ treeNode.name +"]");
    }

    function beforeDrop(treeId, treeNodes, targetNode, moveType, isCopy) {
        if(treeNodes[0].id == "default" || targetNode.id == "default"){
            return false;
        }
        console.log(treeNodes[0].isParent)
        console.log(targetNode)
        var targetlevel = 0;
        if(targetNode == null){
            targetlevel = 0
        } else {
            targetlevel = targetNode.level;
        }
        if(targetlevel >= 2 || treeNodes[0].isParent){
            console.log("FALSE")
            return false;
        } else { return true;}
    }

    function onDrop(event, treeId, treeNodes, targetNode, moveType, isCopy) {
        if(treeNodes[0].id == "default"){
            return;
        }

        var new_pId = treeNodes[0].pId
        var new_depth = treeNodes[0].level
        if(new_pId == null) new_pId = 0

        changeTree(treeNodes[0].id,treeNodes[0].name, new_pId,new_depth,"DROP");
        console.log("tree ID : [" +treeNodes[0].id+"] tree Move pId : ["+new_pId +"]");
    }

    function beforeCheck(treeId, treeNode){        
        return true;
    }

    function OnCheck(event, treeId, treeNode) {      
        if(treeNode.id == "default"){
            console.log(treeNode.id)
            check_all_group();
        } else{  
            var param = "?device_group_id=";

            var check_node = $.fn.zTree.getZTreeObj(treeId);
            var checkCount = check_node.getCheckedNodes(true);
            for(i=0;i<checkCount.length;i++){
                param += checkCount[i].id + "|";
            }
            dataList.ajax.url("/settop/search"+param).load();
            if(check_node.getCheckedNodes(false).length == 1 && check_node.getCheckedNodes(false)[0].id == "default"){
                check_node.checkNode(check_node.getCheckedNodes(false)[0], true, true);
                check_all_group();
                // $('#check_all').prop('checked', true); // Unchecks it
            }else {
                check_node.checkNode(check_node.getNodeByTId("treeDemo_1"), false, false);
                // $('#check_all').prop('checked', false); // Unchecks it
            }
            
        }
    };
    
    function addDiyDom(treeId, treeNode) {
        if (treeNode.parentNode && treeNode.parentNode.id!=2) return;
        console.log(dev_group_data);
        console.log(treeNode.id);
        console.log(treeNode.tId);
        
        var aObj = $("#" + treeNode.tId + "_span");
       

        var editStr = "<span id='diyBtn_" +treeNode.id+ "'></span>";
        aObj.after(editStr);

        
        var dev_group_data_total = 0;
        // var zTree = $.fn.zTree.getZTreeObj("treeDemo");
        // var nodes = zTree.getNodes();
    
        for(i=0 ; i < dev_group_data.length ; i++){
            if(treeNode.id == dev_group_data[i].device_group_id){
                $("#diyBtn_"+ treeNode.id).text("("+dev_group_data[i].cnt+")");
            }
        }
        
        if($("#diyBtn_"+ treeNode.id).text() == ""){
            $("#diyBtn_"+ treeNode.id).text("(0)");
        }
        
        $("#diyBtn_default").text("("+dev_group_data_total+")")
    }

    function OnExpand(event, treeId, treeNode) {
        console.log("onexpand")
        cnt_group_dev();        
    };

    $.fn.zTree.init($("#treeDemo"), setting, zNodes);

    $("#treeDemo_1").attr("style","padding-left : 5px;");
    $("#treeDemo_1_switch").hide();
    // $("#treeDemo_1_check").hide();
    $("#treeDemo_1_edit").hide();
    $("#treeDemo_1_remove").hide();
};

// 그룹 추가
$("#ctlConfirm2").click(function() {
    
    var form_data = new FormData($('#formGroup')[0]);

    for (var pair of form_data.entries()) {
        // 예외처리 진행
        console.log(pair[0]+ ', ' + pair[1]);
    }
    var group_name = $('#group_name').val();
    if(group_name == ""){
        alert("그룹명을 입력하세요");
        return;
    }
    if(group_name.length > 10){
        alert("그룹명은 10자 이내로 입력하세요");
        return;
    }
   
    $.ajax({
        url : "/device/group/insert",
        data:form_data,
        type: 'POST',
        contentType: false,
        processData: false,
        beforeSend: function() {

        },
        error:function(error){
           alert(error.resultValue);

        },
        success:function(data) {

            alert(data.resultString);
            console.log(data.device_group_id);
            var zTree = $.fn.zTree.getZTreeObj("treeDemo");
            if(group_add_tId != "ROOT"){
                var P_node = zTree.getNodeByTId( group_add_tId);
                console.log(P_node);
                console.log($("#group_tID").val());
                zTree.addNodes(P_node, {id:(data.device_group_id), pId:P_node.id, name: data.group_name});
                zTree.expandNode(P_node, true, true, true);
            } else {
                draw_tree();
            }
            closeLayerPopup('groupAddPopup');
            $("#group_name").val("");

       }
    });

    
});



var draw_graph = function() {

    console.log("draw_graph Entered !!!! ");
    var settop_count;
    $.ajax({
        type: 'GET',
        url: "/settop/common/graph",
        async: false,
        success : function(json) {
            console.log("draw_graph success !!!! ");
            console.log(json.data.data);
            settop_count = json.data.data;
           
        },
        error: function(){
           alert("상세 조회시 에러가 발생했습니다.");
        }
    });

    var nowtime = new Date();
    var online_settop = Array.from({length:nowtime.getHours()+1 }, () => 0);
    var offline_settop = [];
    var error_settop = [];
    var labels = ['00:00','01:00','02:00','03:00','04:00','05:00','06:00','07:00','08:00','09:00','10:00','11:00',
                  '12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00','21:00','22:00','23:00']
    for(i=0; i<settop_count.length; i++){
        var index = labels.indexOf(settop_count[i].date.slice(-5))
        online_settop[index] = settop_count[i].conut
    }

    console.log(online_settop)

    var data = {
    labels: labels,
    datasets: [
        {
        label: '온라인',
        data: online_settop,
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor : 'rgb(75, 192, 192)',
        tension: 0.3
        },
        {
        label: '오프라인',
        data: offline_settop,
        borderColor: 'black',
        backgroundColor : 'black',
        tension: 0.3
        },
        {
        label: '장애',
        data: error_settop,
        borderColor: 'RED',
        backgroundColor : 'RED',
        tension: 0.3
        }
    ]};

    var chart_format = {
        type: 'line',
        data: data,
        options: {
            maintainAspectRatio: false,                      // 크기 div에 맞춤
            animations: {
                radius: {         
                    duration: 400,                            // 시간 (생성 -> 사라짐)
                    easing: 'linear',                         
                    loop: (context) => context.active         // 반복
                }
            },
            hoverRadius: 7,                                   // 반지름
            hoverBackgroundColor: 'yellow',                    
            interaction: {
                mode: 'nearest',                               
                intersect: false,
                axis: 'x'                                      
            },
            plugins: {
                legend: {                                     
                    position: 'bottom',
                        labels: {
                            boxWidth: 10,
                            boxHeight: 5,
                        }
                },
                tooltip: {
                    enabled: true,
                }
            },
        
            scales: {
                y: {
                    min: '0'
                }
            }
        }
    };

      var settop_chart = new Chart(
        $('#settopChart'), chart_format
      );
}

/* COMMON CODE SELECTBOX 적용 */
var commonSearch = function(comm_up_cd, target, set_data){

    var $target = $('#'+target);
    var params = "?comm_up_cd="+comm_up_cd;
    $.ajax({
             type: "GET",
             url: "/code/applySearch"+params,
             success : function(json) {

                var applyList = JSON.parse(json.data);

                console.log(applyList);

                var options = "<option value='all' selected>선택하세요</option>";


                for(var i = 0;i<applyList.length;i++){
                    if(applyList[i].comm_cd == set_data){
                        options += "<option value='"+applyList[i].comm_cd+"' selected>"+applyList[i].comm_nm+"</option>";
                    }else{
                        options += "<option value='"+applyList[i].comm_cd+"'>"+applyList[i].comm_nm+"</option>";
                    }
                }

                $target.html(options);
             },
             error: function(){
                 alert("상세 조회시 에러가 발생했습니다.");
             }
    });
}


/* COMMON CODE SELECTBOX 적용 */
var device_select_list = function(comm_up_cd, target, set_data){

    var $target = $('#'+target+"_"+set_data);

    $.ajax({
             type: "GET",
             url: "/settop/common/search",
             async : false,
             data: { parking_seq: "", group_seq: "" },
             success : function(json) {

                var applyList = json.data
                console.log(applyList.data);
                
                if(set_data == 0){
                    var all_text = "전체";
                } else if(set_data == 1){
                    var all_text = "중분류";
                } else if(set_data == 2){
                    var all_text = "소분류";
                }
                var options = "<option value='all' selected>"+all_text+"</option>";
                for(var i = 0;i<applyList.data.length;i++){
                    if(comm_up_cd == applyList.data[i].pId){
                        options += "<option value='"+applyList.data[i].id+"'>"+applyList.data[i].name+"</option>";
                    }
                    // else if(comm_up_cd == applyList.data[i].pId){
                    //     options += "<option value='"+applyList.data[i].id+"'>"+applyList.data[i].name+"</option>";                       
                    // }
                }

                $target.html(options);
             },
             error: function(){
                alert("상세 조회시 에러가 발생했습니다.");
             }
    });
}

function chk_ok_show(){
    $('#checked_result2').empty()
    var tmp1 = ''
    $('#example tbody tr').each(function(k,v){
        var tcalss = $(this).attr('class')
        var tval = $(this).find("td").eq(1).html();
        var this_row = example_tbl.rows(this).data();

        tmp1 += (k+1)+'열 '
        tmp1 += 'class:'+tcalss+', second val:'+tval+', third val:'+this_row[0][2]
        tmp1 += '<br>'
    });

    $('#checked_result2').html(tmp1)
}


/* GROUP TREE 전용 수정 */
var changeTree = function(tID, tNAME, tPID, depth, isDel) {
    var method = 'GET';

    if(isDel == "DEL") {
        console.log("ENTERED DEL");
        method = "DELETE";
        var url = "/device/group/delete/"+tID;
    } else {
        var url = "/device/group?tID="+tID+"&tNAME="+tNAME+"&tPID="+tPID+"&depth="+depth
    }

    $.ajax({
        type: method,
        url: url,
        success : function(json) {

           alert(json.resultString);

            
        },
        error: function(){
           alert("상세 조회시 에러가 발생했습니다.");
        }
    });

}


function sleep(ms) {
    const wakeUpTime = Date.now() + ms;
    while (Date.now() < wakeUpTime) {}
}


// 전체 메뉴를 오른쪽으로 슬라이드하여서 보여준다.
function ShowMenu(giMenuDuration){
    $("#grp_point").text("<<");
    $("#btn_animate").show();
    $('#btn_animate' ).css( { 'left' : '-20%' } );
    $('#btn_animate' ).animate( { left: '0%' }, { duration: giMenuDuration } );
}

// 전체 메뉴를 왼쪽으로 슬라이드하여서 닫는다.
function HideMenu(giMenuDuration){
    $("#grp_point").text(">>");
    $('#btn_animate' ).animate( { left: '-100%' }, { duration: giMenuDuration } );
}

// 확장 메뉴를 보여주거나 닫는다.
function ShowSubMenu( strId ){
    var lySubMenu = $( strId );

    if( lySubMenu.first().is( ":hidden" ) ){
        $( strId ).slideDown( 300 );
    }
    else{
        $( strId ).slideUp( 300 );
    }
}


function now_settop(){
    $.ajax({
        type: "GET",
        url: "/settop/current",
        success : function(json) {

            console.log(json);
            current_cnt = json.current_cnt;
            current_total = json.current_total;
            current_fault_cnt = json.current_fault_cnt;

            offline = String (parseInt(current_total) - parseInt(current_cnt) - parseInt(current_fault_cnt));

            $("#settopbox_online").text(current_cnt);
            $("#settopbox_offline").text(offline);
            $("#settopbox_error").text(current_fault_cnt);

        },
        error: function(){
           alert("상세 조회시 에러가 발생했습니다.");
        }
    });
    
}

function address_api(){
    $("#postcodify").addClass("scrollbar-dynamic")
    // $("#postcodify").addClass("col-md-6")
    
    $("#postcodify").postcodify({
        // insertAddress : 설정값1, // 주소를 어디에 받을지
        hideOldAddresses: true,
        hideSummary : true,
        insertAddress : "#device_location",
        requireExactQuery : true,
        results : '#search_result',
        afterSelect : function(){
            $('#longitude').show();
            $('#latitude').show();
            var form_data = new FormData();
            var address = $("#device_location").val();
            var api_url = "https://maps.googleapis.com/maps/api/geocode/json?address=";
            var api_key = "&key=AIzaSyAL_MvO_s4g22FhPkypc9kQj6_IUe2B3KY";
            console.log(address);
            $.ajax({
                url : api_url + address + api_key,
                data: form_data,
                type: "GET",
                contentType: false,
                processData: false,
                async : false,
                success:function(data) {
    
                    console.log(data);
                    console.log(data.results[0].geometry.location);
                    var lat = data.results[0].geometry.location.lat
                    var lng = data.results[0].geometry.location.lng
                    $('#device_latitude').val(lat);
                    $('#device_longitude').val(lng);

                    // $("#postcodify").html("");
                    // address_api();
                },
                error:function(){
                   alert("서버 응답이 없습니다. 서버 확인후 다시 시도해 주세요.");
    
                }
            });
        }
    });
    $(".search_button").attr('title','주소 검색');
}

function organ_detail(dev_id){
    $("#modaldevcnt").modal('show');
    $("#modal_dev_id").text(" : "+dev_id);
    
    
    var organdataList;
    organdataList = $('#organ_data_list').DataTable({
        "lengthChange": false,
        "searching": false,
        "ordering": false,
        "info": false,
        "autoWidth": true,
        "processing": true,
        "serverSide": true,
        "destroy" : true,
        ajax : {
            "url": "/settop/organ/"+dev_id,
            "type":"POST",
            "async": false
        },
        "columns": [
            { data: "row_cnt"},
            { data: "sch_id"},
            { data: "organ_nm"},        
            {
                data:  null,
                render: function(data, type, full, meta){
                        return "<span>"+ data.sch_st_date + " ~ " + data.sch_ed_date + "</span>";
                }
            },
            {
                data:  null,
                render: function(data, type, full, meta){
                        organ_st_dt = data.organ_st_dt.split(',');
                        organ_ed_dt = data.organ_ed_dt.split(',');
                        
                        var organ_html = "";
                        for(i=0; i < organ_st_dt.length; i++){
                                organ_st_time = (organ_st_dt[i])
                                organ_ed_time = (organ_ed_dt[i])
                                
                                organ_html += "<p>"+ organ_st_time +" ~ "+organ_ed_time+"</p>"
                        }; 

                        return organ_html;
                }
            },
            // {
            //     data:  null,
            //     render: function(data, type, full, meta){
            //             return "<button class='btn_point' sch_id='"+data.sch_id+"' onclick='organdevcnt("+data.sch_id+")'>"+data.dev_cnt+"대</button>" +
            //             "<span style='display : none;' id='dev_cnt_"+data.sch_id+"' value='"+data.dev_cnt+"'>"+data.dev_id+"</span>";
            //     }
            // },
            { data: "user_id"},
            { data: "rgt_dt"},
        ],
        "columnDefs": [
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
}

function checkNumber(event) {
  if(event.key >= 0 && event.key <= 9) {
    return true;
  }
  return false;
}

//************************************************ 세탑 상세보기 클릭 ************************************************
// $('#data_list tbody').off('click')

function dev_detail(dev_id){
    $("#duplicate_check").hide();
    var detail_id = "settop_detail_"+dev_id;
    $("#btnInsert").hide();  // 저장버튼 숨김
    $("#btnDelete").show();  // 삭제버튼 생성

    device_select_list('0', 'device_group_id', '0');
    $("#postcodify").html("");
    address_api();
    
    var dev_id = $("#"+detail_id).val();
    var parking_seq = $("#"+detail_id).attr('parking_seq');
    var user_id = $("#"+detail_id).attr('user_id');
    var dev_conn = $("#"+detail_id).attr("dev_conn");
    var dev_horizon = $("#"+detail_id).attr("dev_horizon");
    var target = $("#"+detail_id);

    // 팝업열기
    // $(this).attr("data-target","#modalInsert")
    $("#modalInsert").show();                       // modal 팝업 오픈
    $('#latitude').show();
    $('#longitude').show();
    $('#dev_id').attr("readonly", true);

    // 상세 조회 처리

    $.ajax({
        type: "GET",
        url: "/settop/detail/search/"+dev_id,
        success : function(json) {

            var setTopObj = JSON.parse(json.resultValue);
            $("#modalInsert h4").text("셋탑박스 수정");
            console.log(setTopObj)
            var settop_grounp_node = setTopObj.device_group_id.split(",");

            //DataBinding 처리
            $("#dev_id").val(dev_id);
            $("input[name=dev_nm]").val(setTopObj.dev_nm);
            $("input[name=dev_cmt]").val(setTopObj.dev_cmt);
            $(device_type).val(setTopObj.device_type).prop("selected", true);

            var address_str = setTopObj.device_location.split("|");
            $("input[name=device_location]").val(address_str[0]);
            $("input[name=device_location_detail]").val(address_str[1]);

            $("input[name=device_longitude]").val(setTopObj.device_longitude);
            $("input[name=device_latitude]").val(setTopObj.device_latitude);
            $("input[name=device_ncps]").val(setTopObj.device_ncps);
            $("input[name=device_mem_total]").val(setTopObj.device_mem_total);
            $("input[name=device_disk_total]").val(setTopObj.device_disk_total);
            
            var group_depth = 0;
            for(i = settop_grounp_node.length-1; i >=0 ; i-- ){
                console.log("SETTOP!!!");
                var selected_item = "";
                
                if(settop_grounp_node[i] == 0){
                    selected_item = "all";
                } else {
                    selected_item = settop_grounp_node[i]
                }

                $("#device_group_id_"+group_depth).val(selected_item).prop("selected", true);
                group_depth++;
                device_select_list(settop_grounp_node[i], 'device_group_id', group_depth);
                $("#device_group_id_"+group_depth).show(); 
            }
            
            
            // $(device_group_id).val(setTopObj.device_group_id).prop("selected", true);

            // 셋톱 타이틀 변경
            $("#laySetTop .box-title").text("셋톱");

            // 토글 및 삭제버튼 제거
            // $("#laySetTop .btn-box-tool").remove();

            // 셋톱 레이어 펼치기
            // $("#laySetTop .collapsed-box").removeClass("collapsed-box")

            
            // $("#btnAdd").hide();     // 셋톱추가 버튼 숨김
            
            
            $("#btnUpdate").show();  // 수정버튼 활성화

            
        },
        error: function(error){
            alert(error.resultString);
        }
    });
};


$("#deviceValue_val").keyup(function(e) {
    var content = $(this).val();
    $("#textLengthCheck").text("(" + content.length + "/100)"); //실시간 글자수 카운팅
    if (content.length > 100) {
        alert("최대 100자까지 입력 가능합니다.");
        $(this).val(content.substring(0, 100));
        $('#textLengthCheck').text("(100/100)");
    }
});

// 사용자 중복체크
$("#duplicate_check").click(function() {
    dev_id = $("#dev_id").val();
    var pattern = /\s/g; // 빈칸(스페이스키) 찾기
    if(dev_id.match(pattern) ) {
        alert("공백이 존재합니다.");
        return;
    }

    if(dev_id){
        $.ajax({
            type: "GET",
            url: "/settop/duplicate_check/"+dev_id,
            success : function(json) {
                if(json.result){
                    alert("이미 등록된 아이디입니다.")
                    $("#dev_id").val("");
                    $("#dev_id").focus();
                }else{
                    var result = confirm("사용가능한 아이디입니다. 사용하시겠습니까?")
                    if(result){
                        $("#dev_id").attr("readonly",true);
                        $("#duplicate_check").attr('checking', 'Y');
                    }else{
                        $("#dev_id").val("");
                        $("#dev_id").attr("readonly",false);
                        $("#dev_id").focus();
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
        $("#dev_id").focus();
        return;
    }
});

function cnt_group_dev(){
    $.ajax({
        type: "GET",
        url: "/settop/search",
        async: false,
        success : function(json) {
            console.log(json);
            dev_group_data = json.resultValue
        },
        error: function(json){
            alert("조회에 실패하였습니다")
        }
    });
    var dev_group_data_total = 0;
    var zTree = $.fn.zTree.getZTreeObj("treeDemo");
    var nodes = zTree.getNodes();

    for(i=0 ; i < dev_group_data.length ; i++){
        dev_group_data_total += dev_group_data[i].cnt
        for(j=0; j < nodes.length;j++){
            if(nodes[j].id == dev_group_data[i].device_group_id){
                $("#diyBtn_"+nodes[j].id).text("("+dev_group_data[i].cnt+")");
        
            }
        }
    }
    for(w=0; w < nodes.length; w++){
        if($("#diyBtn_"+nodes[w].id).text() == ""){
            console.log(nodes[w].id)
            $("#diyBtn_"+nodes[w].id).text("(0)");
        }
    }
    $("#diyBtn_default").text("("+dev_group_data_total+")")
}

function check_all_group(){
    var zTree = $.fn.zTree.getZTreeObj("treeDemo");
    console.log($("#treeDemo_1_check").attr("class"));
    if($("#treeDemo_1_check").attr("class") == "button chk checkbox_true_full_focus" || $("#treeDemo_1_check").attr("class") == "button chk checkbox_true_full"){
        console.log("전체체크!")
        zTree.checkAllNodes(true);
        var param = "?device_group_id=";
        dataList.ajax.url("/settop/search").load();
        $("#treeDemo_1_switch").hide();
        $("#treeDemo_1_edit").hide();
        $("#treeDemo_1_remove").hide();
    }else{
        console.log("전체해제!")
        zTree.checkAllNodes(false);
        var param = "?device_group_id=980989595";
        dataList.ajax.url("/settop/search"+param).load();
        $("#treeDemo_1_switch").hide();
        $("#treeDemo_1_edit").hide();
        $("#treeDemo_1_remove").hide();
    }
}

//***************************************************셋탑박스 멀티 업로드 파일 선택***********************************************
$(document).on('change',"#file_nm", function(event) {

    // alert("Event ON");
    var file = event.target.files[0];

    var fileReader = new FileReader();
        fileReader.onload = function() {
            // 이미지 HTML 생성

            // 이미지 이름 설정
            var nmTextField = '#file_nm_text';
            $(nmTextField).val(file.name);

            // 타입 가져오기
            var typeTextField = '#file_type';
            $(typeTextField).val(file.type);

            // 사이즈 가져오
            var sizeTextField = '#file_size';
            $(sizeTextField).val((file.size / 1000) + " KB");

        };
        fileReader.readAsDataURL(file);
    });

//***************************************************셋탑박스 멀티 업로드 시작***********************************************

$("#btnUpload").click(function(e) {

    if($('#file_type').val() == ""){
        alert("파일이 선택되지 않았습니다.");
        return
    }


    // EXCEL 파일 업로드 URL
    var url = "/settop/multi/insert";
    var method = "POST";

    var form_data = new FormData($('#formUpload')[0]);
    console.log(form_data);

    $.ajax({
        type: "POST",
        enctype: 'multipart/form-data',
        url: url,
        data: form_data,
        processData: false,
        contentType: false,
        cache: false,
        timeout: 600000,
        beforeSend: function() {
        },
        success: function(data) {
            alert(data.resultString);
            // alert("셋탑 멀티 업로드가 성공하였습니다");
            closeUpPopup();
            dataList.ajax.url("/settop/search").load();

        },
        error: function(error) {
            console.log("ERROR : ", error);
            alert(error.resultString);

        }
    });

});


function delDevice(DevID){

    // Device ID 
    console.log("Device ID : ["+DevID+"]");

    $.ajax({
        type: "DELETE",
        url: "/settop/delete/"+DevID,
        processData: false,
        contentType: false,
        success: function(data) {                
            alert(data.resultString);
            dataList.ajax.url("/settop/search").load();
            cnt_group_dev()
            closePopup();
        },
        error: function(error) {
            console.log("ERROR : ", error.resultString);
            alert(error.responseJSON.resultString);
        }
    });
}