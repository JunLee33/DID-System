// Schedule.js
// Schedule management functions Created by WAVIEW(waview.co.kr)
// Cteated 2021.04.30



// Init process
var calendar;
var newOrganCNT = 100;          // 신규 편성 Count, 기존 편성에 대한 수정은 없음. 신규로 작성 & 배포시에도 신규만 배포 함.
var organ_list = [];            // User_ID 자신의 편성 정보 검색 결과 (페이지 로딩시)
var device_group_id = '';
var check_id = [];
var target_id = '';
var device_list = "";
var update_div_next = "";
var group_seq_now = '';
var color_count = 0;
var cal_color = ["#C9CEF1","#C9E4F1","#E1D485","#FABFC7","#58DD7F"];
var dev_group_data;
var drop_target = "";

//김동수
//1. 수정 삭제 버그 보완
var tempOrganCnt;
//2. 페이징 처리
var dataPerPage = 10;               // 한 페이지에 나타낼 데이터 수
var selectedPage = 1;
var currentPage;
var totalData;
var next = 0;
var prev = 0;
var control_list;

$(function() { 
    $("#before_default").hide();

    
    // drag & drop FUNCTION by. Jun
    $("#ogran_list").on({
        'dragenter' : function(e) {
            if(e.target.id.split('_')[0] == "div" || e.target.id.split('_')[0] == "before" || e.target.id.split('_')[0] == "ogran"){
                e.target.style.background = "#c9cef1";
            }    
        },
        'dragleave' : function(e) {
            if(e.target.id.split('_')[0] == "div" || e.target.id.split('_')[0] == "before" || e.target.id.split('_')[0] == "ogran"){
                e.target.style.background = "";
            }   
        },
        'dragover' : function(e) {
            e.preventDefault();
        },
        'drop' : function(e){
            e.preventDefault();
            console.log("DROP!!!");
            e.target.style.background = "";
            drop_target = e.target.id;
            console.log($('#ogran_list').children(".schedule_make").length);
            var organ_list_cnt = $('#ogran_list').children(".schedule_make").length;
            if(organ_list_cnt == 5){
                alert("최대 개수입니다");
                return;
            } else if(drop_target.split('_')[0] == "div" || drop_target.split('_')[0] == "before"){
                console.log("before!!!!!");
                $("#"+target_id).trigger("click");
                $("#organAdd").trigger("click");
            } else if(drop_target.split('_')[0] == "ogran"){
                console.log("ORGAN!!!!!");
                $("#"+target_id).trigger("click");
                $("#organAdd").trigger("click");
            }
            
            console.log(calendar.getEventSources());
        }
    });
    // drag & drop FUNCTION END!

    // ADMIN 일 때 접근 제어
    $.ajax({
        type: "GET",
        url: "/user/search?user_gr=0000",
        success : function(json) {
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
    // ADMIN 일 때 접근 제어 END!

    // ADMIN 기능 제한 ( 삭제가능 )
    $.ajax({
        type: "GET",
        url: "/user/search?user_gr=0000",
        success : function(json) {
            group_seq_now = json.resultUserGroup;
        },
        error: function(json){
            alert("상세 조회시 에러가 발생했습니다.");
        }
    });
    // ADMIN 기능 제한 END!

    // WEEKLY CALENDAR FUNCTION ///////////////////////////////////////
    var today = getToday();
    var calendarEl = document.getElementById('calendar');
    calendar = new FullCalendar.Calendar(calendarEl, {
        height: '438px',
        schedulerLicenseKey: '0617516225-fcs-1626313866',
        // plugins: [resourceTimelinePlugin],
        now: today,
        editable: false,
        aspectRatio: 3.5,
        scrollTime: '00:00',
        headerToolbar: {
            left: false,
            center: 'title',
            right: false
        },
        initialView: 'resourceTimelineDay',
        views: {
            resourceTimelineThreeDays: {
                type: 'resourceTimeline',
                duration: { days: 1 },
                buttonText: '1 days'
            }
        },
        resourceAreaHeaderContent: '주간요일',
        resourceAreaWidth : "6%",

        resources: [
            { id: 'a', title: '월요일', titleColor: "#ECECEE", eventColor: 'green' },
            { id: 'b', title: '화요일', titleColor: "#ECECEE", eventColor: 'green' },
            { id: 'c', title: '수요일', titleColor: "#ECECEE", eventColor: 'green'  },
            { id: 'd', title: '목요일', titleColor: "#ECECEE", eventColor: 'green'  },
            { id: 'e', title: '금요일', titleColor: "#ECECEE", eventColor: 'green'  },
            { id: 'f', title: '토요일', titleColor: "#7985DA", eventColor: 'red'  },
            { id: 'g', title: '일요일', titleColor: "#F5393A", eventColor: 'red'  }
        ],
        events: [

        ]
    });

    calendar.render();
    

    // SETTOP TREE FUNCTIONS ///////////////////////////////////////
    var setting = {
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
            
    function getnodeid(treeId, treeNode, clickFlag) {
        $("#device_list").children().remove();
        $("#selected_settop").text(0);
        $('.tbl_list thead input[type=checkbox]').prop('checked', false);
        console.log("TREE NODES ID : [" + treeNode.id+"]");
        if(treeNode.id != "default"){
            var params = treeNode.id;
        }else {
            params = "all";
        }
        
        simplelist(params);

        var zTree = $.fn.zTree.getZTreeObj(treeId);
        zTree.checkAllNodes(false);
        $('#check_all').prop('checked', false);
    }      

    function beforeCheck(treeId, treeNode){   
        return true;
    }

    function OnCheck(event, treeId, treeNode) {
        if(treeNode.id == "default"){
            check_all_group();
        } else{
            $("#selected_settop").text(0);
            $('.tbl_list thead input[type=checkbox]').prop('checked', false);
            $("#device_list").children().remove();
            $("#treeDemo").find("*").removeClass('curSelectedNode');
            var check_node = $.fn.zTree.getZTreeObj(treeId);
            var checkCount = check_node.getCheckedNodes(true);
            for(i=0; i < checkCount.length; i++){
                var params = checkCount[i].id;
                simplelist(params);
            }
            console.log(check_node.getCheckedNodes(false));
            if(check_node.getCheckedNodes(false).length == 1 && check_node.getCheckedNodes(false)[0].id == "default"){
                check_node.checkNode(check_node.getCheckedNodes(false)[0], true, true);
                check_all_group();
            }else {
                check_node.checkNode(check_node.getNodeByTId("treeDemo_1"), false, false);
            }
        }
    };

    function addDiyDom(treeId, treeNode) {
        if (treeNode.parentNode && treeNode.parentNode.id!=2) return;
        
        var aObj = $("#" + treeNode.tId + "_span");
       

        var editStr = "<span id='diyBtn_" +treeNode.id+ "'></span>";
        aObj.after(editStr);

        $.ajax({
            type: "GET",
            url: "/settop/search",
            async: false,
            success : function(json) {
                dev_group_data = json.resultValue
            },
            error: function(json){
                alert("조회에 실패하였습니다")
            }
        });
        var dev_group_data_total = 0;
    
        for(i=0 ; i < dev_group_data.length ; i++){
            if(treeNode.id == dev_group_data[i].device_group_id){
                $("#diyBtn_"+ treeNode.id).text("("+dev_group_data[i].cnt+")");
            }
        }
        
        if($("#diyBtn_"+ treeNode.id).text() == ""){
            $("#diyBtn_"+ treeNode.id).text("(0)");
        }
        
        $("#diyBtn_default").text("("+dev_group_data_total+")")
        cnt_group_dev();
    }

    function OnExpand(event, treeId, treeNode) {
        cnt_group_dev();        
    };

    
        
    $.fn.zTree.init($("#treeDemo"), setting, zNodes);

    // TREE '전체' 폴더 처리
    $("#treeDemo_1_switch").hide();
    $("#treeDemo_1_check").change(function(){
        $("#device_list").children().remove();
        var zTree = $.fn.zTree.getZTreeObj("treeDemo");
        if($("#treeDemo_1_check").is(":checked")){
            zTree.checkAllNodes(true);
            var param = "all";
            simplelist(param);
            $("#treeDemo_1_switch").hide();
            // $("#treeDemo_1_check").hide();
            $("#treeDemo_1_edit").hide();
            $("#treeDemo_1_remove").hide();
        }else{
            zTree.checkAllNodes(false);
            var param = "no";
            simplelist(param);
            $("#treeDemo_1_switch").hide();
            // $("#treeDemo_1_check").hide();
            $("#treeDemo_1_edit").hide();
            $("#treeDemo_1_remove").hide();
        }
    });
    // TREE '전체' 폴더 처리 END!
    // TREE END//////////////////

    // SETTOP 목록 가져오기
    $.ajax({
        type: "GET",
        url: "/settop/simple/search",
        success : function(json) {      
            device_list = json.data;

        },
        error: function(){
            alert("상세 조회시 에러가 발생했습니다.");
        }
    });
    // SETTOP 목록 가져오기 END!




    // ORGANIC DIV FIELD 추가 기능 ///////////////////////////////////////
    $("#organAdd").click(function(){
        if(group_seq_now == '0101'){
            alert("슈퍼관리자는 화면디자인을 편성할 수 없습니다.")
            return false;
        }

        // List MAX 5
        var img_link =      $("#imgLink").attr("src");      // image src 내용 가저오기
        var organ_text =    $("#subject").text();           // strong value 가져오기
        var screenid =      $("#imgLink").attr("wscreen");      // image src 내용 가저오기

        // Validation check. !!
        if(img_link == '' || organ_text == '') {
            alert("화면 디자인을 선택 해 주세요");
            return;
        }

        // 편성요일 유효성 체크
        var selweek = false;
        if($('#btnA').hasClass('active') === true) selweek = true;
        if($('#btnB').hasClass('active') === true) selweek = true;
        if($('#btnC').hasClass('active') === true) selweek = true;
        if($('#btnD').hasClass('active') === true) selweek = true;
        if($('#btnE').hasClass('active') === true) selweek = true;
        if($('#btnF').hasClass('active') === true) selweek = true;
        if($('#btnG').hasClass('active') === true) selweek = true;

        if(selweek == false) {
            alert("편성 요일을 선택 해 주세요")
            return;
        }
        // 편성 요일 유효성 체크 끝

        // 편성 시간 유효성 체크
        var stHour =    $('#timeStartHour').val();
        var stMin  =    $('#timeStartMinute').val();
        var endHour =   $('#timeEndHour').val();
        var endMin =    $('#timeEndMinute').val();

        if(stHour == ''){
            alert("재생시작 시간 을 입력 해 주세요")
            return;
        } else if(stHour.length == 1) {
            stHour = '0'+ stHour;
        } else if(parseInt(stHour) > 24){
            stHour = '23';
        } else if(parseInt(stHour) < 0){
            stHour = '00';
        }

        if(stMin == ''){
            alert("재생시작 분 을 입력 해 주세요")
            return;
        } else if(stMin.length == 1) {
            stMin = '0'+ stMin;
        } else if(parseInt(stMin) > 59){
            stMin = '59';
        } else if(parseInt(stMin) < 0){
            stMin = '00';
        }

        if(endHour == ''){
            alert("재생종료 시간 을 입력 해 주세요")
            return;
        } else if(endHour.length == 1) {
            endHour = '0'+ endHour;
        } else if(parseInt(endHour) > 24){
            endHour = '23';
        } else if(parseInt(endHour) < 0){
            endHour = '00';
        }

        if(endMin == ''){
            alert("재생종료 분 을 입력 해 주세요")
            return;
        } else if(endMin.length == 1) {
            endMin = '0'+ endMin;
        } else if(parseInt(endMin) > 59){
            endMin = '59';
        } else if(parseInt(endMin) < 0){
            endMin = '00';
        }

        if(stHour > endHour){
            alert("재생종료 시간이 재생시작 시간보다 빠릅니다");
            return;
        } else if(stHour == endHour && stMin > endMin){
            alert("재생종료 분이 재생시작 분보다 빠릅니다");
            return;
        } else if(stHour == endHour && stMin == endMin){
            alert("재생종료 시간과 재생시작 시간이 동일합니다");
            return;
        }
        // 편성 시간 날짜 유효성 체크 끝

        
        var stTime = stHour +":"+ stMin;
        var enTime = endHour +":"+ endMin;

        console.log("START DATE : ["+ stTime +"]");
        console.log("END   DATE : ["+ enTime +"]");

        if(color_count >= 5){
            color_count = 0;
        }

        var div_tag = "<div id='before_"+newOrganCNT+"' style='height : 10px;'></div>"
        div_tag += "<div class='schedule_make complete' id='OrganicDiv_"+newOrganCNT+"'>";   // 삭제를 위한 DIV ID 부여  
        div_tag += "    <div class='make_tit' style='background-color:"+cal_color[color_count]+";' id='make_tit_"+newOrganCNT+"'>";
        div_tag += "        <span><img src="+img_link+"  class='make_img'></span>";
        div_tag += "        <strong  class='make_name'>"+organ_text+"</strong>"
        div_tag += "        <button type='button' class='btn_conts_circle' ></button>";
        div_tag += "    </div> ";
        div_tag += "    <div class='make_conts' id='div_OrganicDiv_"+newOrganCNT+"'>";
        div_tag += "        <div class='day_box'>";
        div_tag += "            <span class='"+$('#btnA').attr('class')+"'>월</span>";
        if($('#btnA').hasClass('active') === true){
            setSchedule(newOrganCNT,'a', stTime, enTime, organ_text, color_count);
            var valWeek1 = 'Y';
        } else  valWeek1 = 'N';
        
        div_tag += "            <span class='"+$('#btnB').attr('class')+"'>화</span>";
        if($('#btnB').hasClass('active') === true){
            setSchedule(newOrganCNT,'b', stTime, enTime, organ_text, color_count );
            var valWeek2 = 'Y'
        } else  valWeek2 = 'N';

        div_tag += "            <span class='"+$('#btnC').attr('class')+"'>수</span>";
        if($('#btnC').hasClass('active') === true){
            setSchedule(newOrganCNT,'c', stTime, enTime, organ_text, color_count);
            var valWeek3 = 'Y'
        } else  valWeek3 = 'N';

        div_tag += "            <span class='"+$('#btnD').attr('class')+"'>목</span>";
        if($('#btnD').hasClass('active') === true){
            setSchedule(newOrganCNT,'d', stTime, enTime, organ_text, color_count);
            var valWeek4 = 'Y'
        } else  valWeek4 = 'N';

        div_tag += "            <span class='"+$('#btnE').attr('class')+"'>금</span>";
        if($('#btnE').hasClass('active') === true){
            setSchedule(newOrganCNT,'e', stTime, enTime, organ_text, color_count);
            var valWeek5 = 'Y'
        } else  valWeek5 = 'N';

        div_tag += "            <span class='"+$('#btnF').attr('class')+"'>토</span>";
        if($('#btnF').hasClass('active') === true){
            setSchedule(newOrganCNT,'f', stTime, enTime, organ_text, color_count);
            var valWeek6 = 'Y'
        } else  valWeek6 = 'N';

        div_tag += "            <span class='"+$('#btnG').attr('class')+"'>일</span>";
        if($('#btnG').hasClass('active') === true){
            setSchedule(newOrganCNT,'g', stTime, enTime, organ_text, color_count);
            var valWeek7 = 'Y'
        } else  valWeek7 = 'N';

        div_tag += "        </div>";
        div_tag += "        <span class='make_time'>"+stTime+"~"+enTime+"</span>";
        div_tag += "        <button type='button' title='스케줄 수정' class='btn_point' id='organUpdate' onclick='updateDiv("+newOrganCNT+")' style='position:relative; right:55px; top:50%; margin-top:0px; float: right;'>수정</button>";
        div_tag += "        <button type='button' class='btn_delete_row' onclick='delDiv("+newOrganCNT+")' title='스케줄 삭제' id=''>삭제하기</button>";
        div_tag += "    </div>";
        div_tag += "    <input type='hidden' name='organ_id'       value='NEW' >";
        div_tag += "    <input type='hidden' name='action_code'    id='action_code_"+newOrganCNT+"' value='CREATE' >";
        div_tag += "    <input type='hidden' name='screen_id'      value='"+screenid+"' >";
        div_tag += "    <input type='hidden' name='organ_nm'       value='"+organ_text+"'>";
        div_tag += "    <input type='hidden' name='organ_st_dt'    value='"+stTime+"' >";
        div_tag += "    <input type='hidden' name='organ_ed_dt'    value='"+enTime+"' >";
        div_tag += "    <input type='hidden' name='organ_week1'    value= '"+valWeek1+"'>";
        div_tag += "    <input type='hidden' name='organ_week2'    value= '"+valWeek2+"'>";
        div_tag += "    <input type='hidden' name='organ_week3'    value= '"+valWeek3+"'>";
        div_tag += "    <input type='hidden' name='organ_week4'    value= '"+valWeek4+"'>";
        div_tag += "    <input type='hidden' name='organ_week5'    value= '"+valWeek5+"'>";
        div_tag += "    <input type='hidden' name='organ_week6'    value= '"+valWeek6+"'>";
        div_tag += "    <input type='hidden' name='organ_week7'    value= '"+valWeek7+"'>";
        div_tag += "    <input type='hidden' name='control_id'     value= '"+$("#controlID").val()+"'>";
        div_tag += "    <input type='hidden' name='organ_img'      value= '"+img_link+"'>";
        div_tag += " </div>";
      
        // 수정 -> 추가시점에 원래 자리로 들어가야함. 
        console.log(drop_target.split('_')[0]);
        console.log(drop_target);
        console.log("DIV NEXT : "+update_div_next);
        if(update_div_next == "LAST"){
            console.log("IF -- LAST!!!!!!")
            $(div_tag).insertBefore("#before_default");
        }else if(update_div_next == ""){
            console.log("ELSE IF -- 빈칸!!!!!!")
            // $("#ogran_list").append(div_tag);
            if(drop_target.split('_')[0] == "before"){
                $(div_tag).insertBefore("#"+drop_target);
            } else if(drop_target.split('_')[0] == "ogran"){
                $(div_tag).insertBefore("#before_default");
            } else if(drop_target.split('_')[0] == ""){
                $(div_tag).insertBefore("#before_default");
            } else{
                console.log($("#"+drop_target).parent().attr('id'));
                $(div_tag).insertAfter("#"+$("#"+drop_target).parent().attr('id'));
            }
        } else{
            console.log("ELSE!!!!!")
            $(div_tag).insertBefore("#before_"+update_div_next.split('_')[1]);
        }

        update_div_next = "";
        drop_target = "";

        // Calendar 다시 그리기
        calendar.render();

        // 모두 같은 newOrganCNT 를 가짐, delete 할때 하나의 CNT 로 처리.
        newOrganCNT++;
        color_count++;

        //김동수
        tempOrganCnt = "";
        //김동수 끝

        $("#organAdd_div").hide();
        check_count_sch();
    }); 

    

    // SETTOP 전송 버튼 ///////////////////////////////////////
    $("#scheduleSettop").click(function(){
        if(group_seq_now == '0101'){
            alert("슈퍼관리자는 스케쥴을 전송할 수 없습니다.")
            return false;
        }
        var schdule_data = $("#ogran_list div").length;
        if(schdule_data == 0) {
            alert("화면 디자인을 편성 해 주세요");
            return;
        }
        
        // check 기간설정
        var start_dt = $('#termStart').val();
        var end_dt = $('#termEnd').val();

        if(start_dt == '') {
            alert("스케쥴 시작날짜를 선택 해 주세요");
            return;
        } else if(end_dt == '') {
            alert("스케쥴 종료날짜를 선택 해 주세요");
            return;
        } else if(start_dt > end_dt) {
            alert("종료날짜가 시작날짜보다 작습니다");
            return;
        }
        
        end_dt = end_dt + " 23:59:59";
        start_dt = start_dt + " 00:00:00";

        console.log("Start =["+start_dt+"] End = ["+end_dt+"]");

        // 기존 Time List 삭제
        $("div").remove('#timeList');

        // HTML TAG MAKING
        var time_div = "<div id='timeList'>";
        time_div += "    <input type='hidden' name='start_dt' value='"+start_dt+"' >";
        time_div += "    <input type='hidden' name='end_dt'   value='"+end_dt+"' >";
        time_div += " </div>";
        
        $("#schedule_list").append(time_div);

        openLayerPopup('popClickScheduleSend');

        // simplelist(device_group_id);
        // Data load
        
    });


     // 스케쥴 저장 기능 ///////////////////////////////////////
    $("#scheduleSending").click(function(){

        // check 기간설정
        var start_dt = $('#termStart').val();
        var end_dt = $('#termEnd').val();

        if(start_dt == '') {
            alert("스케쥴 시작날짜를 선택 해 주세요");
            return;
        } else if(end_dt == '') {
            alert("스케쥴 종료날짜를 선택 해 주세요");
            return;
        }

        // 기존 Time List 삭제
        $("div").remove('#timeList');

        // HTML TAG MAKING
        var time_div = "<div id='timeList'>";
        time_div += "    <input type='hidden' name='start_dt' value='"+start_dt+"' >";
        time_div += "    <input type='hidden' name='end_dt'   value='"+end_dt+"' >";
        time_div += " </div>";
        
        $("#schedule_list").append(time_div);

        // 서버 전송
        registerSchedule();
    });

    // control_list 가져오기
    loadDesignList("");

    $(document).ready(function(){	
        // MENU 적용
        $('#mn_schedule').attr({
            'class' : 'active',
        });

        $('#termStart, #termEnd').datepicker({
            autoclose: true
            ,format: 'yyyy-mm-dd'
            ,language: "kr"
            ,calendarWeeks: false
            ,todayHighlight: true
            ,showInputs: false
        });
    

        
        //전체 체크박스 클릭 
        $(document).on('click', '.tbl_list thead input[type=checkbox]', function() {
            if(this.checked==true){
                $('.tbl_list tbody input[type=checkbox]').prop("checked",this.checked);
                var chek_nim = $('.tbl_list tbody input[type=checkbox]').length;
                $("#selected_settop").text(chek_nim);
            }else{
                $('.tbl_list tbody input[type=checkbox]').prop("checked",'');
                $("#selected_settop").text(0);
                
            }	
        });
    
        //한줄 체크박스 클릭
        $(document).on('click', '.tbl_list tbody input[type=checkbox]', function() {	
            if(this.checked==true){	
                $(this).prop("checked",this.checked);
            }else{
                $(this).prop("checked",'');
            }		
            var chek_nim = $('.tbl_list tbody input[type=checkbox]').length;
            var chk_count = $('.tbl_list tbody input[type=checkbox]:checked').length;		
            if(chek_nim==chk_count){
                $('.tbl_list thead input[type=checkbox]').prop("checked",this.checked);
                $("#selected_settop").text(chk_count);
            }else{
                $('.tbl_list thead input[type=checkbox]').prop("checked",'');
                $("#selected_settop").text(chk_count);
            }		
        });
    });	


    // 달력 선택 날짜에 넣기
    var scheduleDate = getParameters();
    $('#termStart').val(scheduleDate);

    // control 리스트 검색
    $("#btnSearch").click(function(){
        var control_nm = $("#searchText").val();
        loadDesignList(control_nm);
    });

    $("#design_paging button").click(function(){
        var $item = $(this);
        var $id = $item.attr("id");
        if($id == "paging_next"){
            if(next > Math.ceil(totalData/dataPerPage)){
                return;
            }
            selectedPage = next;
        } 
        if($id == "paging_pre"){
            if(prev <= 0){
                return;
            }
            selectedPage = prev;
        } 
        console.log("토탈: " + totalData);
        console.log("한페이지당데이터: " + dataPerPage);
        console.log("selectedPage: " + selectedPage);
        paging(totalData, dataPerPage, selectedPage);
    });
});

// 화면디자인 drag start 시점 id 가져오기
function drag_getnodeid(nodeid) {
    target_id = nodeid;
    console.log($("#"+target_id).attr('wscreen'));
}

// 화면 디자인 검색 & 리스트 만들기 ///////////////////////////////////////
function loadDesignList(cont_nm) {
    $("#controlList").html('');

    // QUERY DATA SET
    $.ajax({
        type: "GET",
        url: "/control/search?cont_nm="+cont_nm,
        contentType: false,
        processData: false,
        success : function(json) {
            control_list = json.data;
            totalData = control_list.length;
            // var li_string = "";

            // for(var i= 0; i < control_list.length; i++) {
            //     li_string += "<li draggable='true' id='waview_"+i+"' wurl='"+control_list[i].control_img+"' wname='"+control_list[i].control_nm+"' wid='"+control_list[i].control_id+"' ondragstart=\"getnodeid('waview_"+i+"')\" onClick=\"screenCheck("+i+")\" ;>";
            //     li_string += "<img src='"+control_list[i].control_img+"'> <strong>"+control_list[i].control_nm+"</strong></li>"
            // }
            // li_string += "</ul>"
            // $("#controlList").append(li_string);
            paging(totalData, dataPerPage, 1)   
        },
        error: function(){
            alert("상세 조회시 에러가 발생했습니다.");
        }
    });

    designListWSet();
}

// Get today YYYY-MM-DD type ///////////////////////////////////////
// calender가 today 기준이니깐!
function getToday (){
    var date = new Date();
    var year = date.getFullYear();
    var month = ("0" + (1 + date.getMonth())).slice(-2);
    var day = ("0" + date.getDate()).slice(-2);

    return year + "-" + month + "-" + day;
}

// Add new schedule on weekly plan ///////////////////////////////////////
function setSchedule (id,resourceId, start, end, title, color_cnt ) {

    var today = getToday();

    var startString = today+"T"+start+":00";
    var endString = today+"T"+end+":00";
    
    // Event API call
    calendar.addEvent( {'id':id, 'resourceId':resourceId, 'start':startString, 'end':endString,'title':title, 'color': cal_color[color_count]});
}

// Toggle week day (요일 선택) ///////////////////////////////////////
function weekClick(btnID) {

    btnID = '#'+btnID;

    // Toggle selection
    if($(btnID).hasClass('active') === true){
        $(btnID).removeClass("active");
    }
    else {
        $(btnID).addClass("active");
    }
}

// 화면디자인 선택 select function ///////////////////////////////////////
function screenCheck(listCount) {
    // $("#organAdd_target").attr("style","background-color : "+cal_color[color_count]+";")
    var organ_list_cnt = $('#ogran_list').children(".schedule_make").length;
    console.log(organ_list_cnt);
    if(organ_list_cnt == 5){
        alert("최대 개수입니다");
        return;
    }
    if(organ_list_cnt == 0){
        drop_target = "before_default";
    }
    $("#organAdd_div").show();

    var wID = '#waview_'+listCount;
    $("#btnA").addClass("active");
    $("#btnB").addClass("active");
    $("#btnC").addClass("active");
    $("#btnD").addClass("active");
    $("#btnE").addClass("active");
    $("#btnF").addClass("active");
    $("#btnG").addClass("active");
    $("#timeStartHour").val(00);
    $("#timeStartMinute").val(00);
    $("#timeEndHour").val(23);
    $("#timeEndMinute").val(59);


    var img =       $(wID).attr("wurl");
    var ment =      $(wID).attr("wname");
    var controlID = $(wID).attr("wid");
    var screen_ID = $(wID).attr("wscreen");

    var add_html = "";

    add_html += "   <span><img src='"+img+"' id='imgLink' wscreen='"+screen_ID+"'></span>";
    add_html += "   <strong id='subject' style='display:inline-block; width:80px; color:#000; font-weight: normal; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; vertical-align: middle; margin-left:3px;'>"+ment+"</strong>";
    add_html += "   <button type='button' class='btn_conts_circle'></button>";
   
    $("#controlID").val(controlID);

    $("#organAdd_target").empty().append(add_html).trigger('create');
}

// Delete DIV & WEEKLY DATA ///////////////////////////////////////
function delDiv(delCNT) {

    var divID = "#OrganicDiv_"+delCNT;
    var actionDivID = "#action_code_"+delCNT;
    var before_div = "#before_"+delCNT;

    var organ_list_cnt = $('#ogran_list').children(".schedule_make").length;
    console.log("ORGAN_CNT = "+divID)
    console.log("ORGAN_CNT = "+actionDivID)
    
    

    // DELETE DIV FIELD
    $(actionDivID).val("DEL");
    $("div").remove(divID);
    $("div").remove(before_div);

    // WEEKLY SCHEDULE 제거
    var event = calendar.getEventById(delCNT);
    var i=0;
    for (i=0; i < 7; i++) {
        if(event == null) break;
        else {
            // Delete event
            event.remove();
        }
        event = calendar.getEventById(delCNT);
    }
    
    check_count_sch();
}

// close Popup !!
function closePopup() {
    check_id = [];

    // Table Data Init
    $("#selected_settop").text(0);
    $("#treeDemo li a").removeClass("curSelectedNode");
    $('.tbl_list thead input[type=checkbox]').prop('checked', false);
    $("#device_list").html("");
    
    // Popup close
    closeLayerPopup('popClickScheduleSend');
}


// 선택된 SETTOP 처리 & 서버 전송 (2건 한번에 처리) ///////////////////////////////////////
// 1. 스케쥴 정보 저장
// 2. 편성정보 저장 (with schedule ID)
var selDevices = function(){

    // 편성선택은 없음. 셋탑 박스 선택 후에 바로 서버 저장으로 로직 변경 
    // 고객요청 !!
    var device_list = "";
    var device_div = "<div id='formDeviceList'>";
    var is_empty = true;
    var device_CNT = 0;
    var device_id_list ="";

    // 중복방지 !! 기존 데이타 삭제
    $("div").remove('#formDeviceList');

    // 셋탑 선택 유효성 검사
    $('#device_table tr').each(function(i) {

        var $chkbox = $(this).find('input[type="checkbox"]');

        // Only check rows that contain a checkbox
        if($chkbox.length) {
            var status = $chkbox.prop('checked');

            if(status) {
                if(i != 0){
                    var dev_id = $("#device_table tr:eq("+i+") td:eq(3)").text();

                    device_div += "    <input type='hidden' name='dev_id' value='"+dev_id+"'>";
                    is_empty = false;
                    if(device_list == "") device_list = "DEVICE = ["+ dev_id;
                    else device_list += "]["+dev_id;

                    if(device_id_list == "") device_id_list = dev_id;
                    else device_id_list += "."+dev_id;

                    device_CNT++;
                }             
            }
        } else {
            alert("셋탑박스를 선택해주세요.")
        }
    });
    device_div += "</div>"
    
    if(!is_empty) {
        $("#schedule_list").append(device_div);

        // 1. Schedule 정보 저장 (return schedulue_id)
        var schedule_id = registerSchedule();
        
        // 2. 편성정보 저장 (with schedule ID)
        registerOrgan(schedule_id)

        // 3. 단말에 Schedule ID 전달
        sendingPUSH(device_id_list, schedule_id)

        closePopup();        
    } else {
        alert("셋탑박스를 선택해주세요.")
    }
}

// 스케쥴 등록 ///////////////////////////////////////
function registerSchedule() {

    var schedule_id = "";
    var form_data = new FormData($('#formSchedule')[0]);
          
    $.ajax({
        url : "/schedule/insert",
        type: "POST",
        data:form_data,
        async: false,
        contentType: false,
        processData: false,
        error:function(){
            alert("서버 응답이 없습니다. 서버 확인후 다시 시도해 주세요.");
            
        },
        success:function(data) {

            // 메시지 병합 !!

            // alert(data.resultString);
            schedule_id = data.schedule_id;
            // 
        }
    });
    return schedule_id;   
}


// 단말 PUSH 전송 ///////////////////////////////////////
function sendingPUSH(device_id, schedule_id) {

    var url = "/settop/push?dev_id="+device_id+"&command=schedule&schedule_id="+schedule_id;

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

        }
    });
}


// ORGANIC 서버저장 기능 ///////////////////////////////////////
function registerOrgan(schedule_id) {
    var url = "";
    var method = "";

    url = "/schedule/organ/insert";
    method = "POST";

    var form_data = new FormData($('#formOrganic')[0]);

    form_data.append("schedule_id", schedule_id);


    $.ajax({
        url : url,
        data:form_data,
        type: method,
        async: false,
        contentType: false,
        processData: false,
        error:function(){
           alert("서버 응답이 없습니다. 서버 확인후 다시 시도해 주세요.");
        },
        success:function(data) {

            alert(data.resultString);
        }
    });

};

// 디자인리스트 스크롤 나오게 하는 함수  ///////////////////////////////////////
function designListWSet(){      
   var targetNum = $('.design_list li').length;
   var targetWidth = $('.design_list li img').width();
   var totalWidth = targetNum*(targetWidth+10)+20;
   $('.design_list').css('width', totalWidth);
}


// URL GET PARAM OBTAIN (organ에서 선택날짜에서 가져온 값으로 시작날짜 설정)
var getParameters = function (paramName) { 
    // 리턴값을 위한 변수 선언 
    var returnValue; 
    // 현재 URL 가져오기 
    var url = location.href; 
    // get 파라미터 값을 가져올 수 있는 ? 를 기점으로 slice 한 후 split 으로 나눔 
    var parameters = (url.slice(url.indexOf('?') + 1, url.length)).split('&'); 
    // 나누어진 값의 비교를 통해 paramName 으로 요청된 데이터의 값만 return 
   
    var varName = parameters[0].split('=')[0];
    returnValue = parameters[0].split('=')[1]; 
    
    return returnValue;
};

// 셋탑 전송 리스트 그리기
function simplelist(device_group_id){
    var tr_string = "";
    var cnt_list = $("#device_list").children().last();
    cnt_list = Number(cnt_list.children().eq(1).text()) + 1;
    var cnt_check = device_list.data
    // device_list
    for(var i= 0; i < device_list.data.length; i++) {
        if(device_group_id == device_list.data[i].dev_group_id){
            tr_string = "<tr value = '"+device_list.data[i].dev_group_id+"'>";
            tr_string += "  <td scope='row'><input type='checkbox' id='checkRow"+cnt_list+"'></td>";
            tr_string += "  <td>"+cnt_list+"</td>";
            tr_string += "  <td>"+device_list.data[i].dev_nm+"</td>";
            tr_string += "  <td>"+device_list.data[i].dev_id+"</td>";
            tr_string += "  <td>"+device_list.data[i].dev_cmt+"</td>";
            tr_string += "  <td style='display:none;' class='dev_group_id'>"+device_list.data[i].dev_group_id+"</td>";
            tr_string += "</tr>";
            cnt_list++;
            $("#device_list").append(tr_string);
        } else if(device_group_id == "all"){
            tr_string = "<tr value = '"+device_list.data[i].dev_group_id+"'>";
            tr_string += "  <td scope='row'><input type='checkbox' id='checkRow"+cnt_list+"'></td>";
            tr_string += "  <td>"+cnt_list+"</td>";
            tr_string += "  <td>"+device_list.data[i].dev_nm+"</td>";
            tr_string += "  <td>"+device_list.data[i].dev_id+"</td>";
            tr_string += "  <td>"+device_list.data[i].dev_cmt+"</td>";
            tr_string += "  <td style='display:none;' class='dev_group_id'>"+device_list.data[i].dev_group_id+"</td>";
            tr_string += "</tr>";
            cnt_list++;
            $("#device_list").append(tr_string);
        }
    }   
}

//(김동수 210728) 수정 클릭시 기존의 것이 삭제되는 오류 처리를 위해 매개변수를 newOrganCnt에서 OrganCNT로 변경 후 TempOrganCnt를 추가, 현재 수정중인 Cnt를 받을 수 있게 함. 추가 후 TempOrgaCnt초기화 되도록 처리
// 내재됨. 
function updateDiv(OrganCNT){
    console.log($("#make_tit_"+OrganCNT).css( "background-color"));
    if(tempOrganCnt == "" || tempOrganCnt == undefined){
        tempOrganCnt = OrganCNT;
    }else{
        alert("현재 선택된 편성의 수정을 완료해주세요");
        return;
    }

    var update_div = $("#OrganicDiv_"+OrganCNT).index();
    $("#organAdd_div").show();
    var update_organ = $("#OrganicDiv_"+OrganCNT).children(".make_conts");
    var update_week = update_organ.children(".day_box").children();
    var update_time = update_organ.children(".make_time").text().split("~");
    
    $("#btnA").attr("class",update_week.eq(0).attr('class'));
    $("#btnB").attr("class",update_week.eq(1).attr('class'));
    $("#btnC").attr("class",update_week.eq(2).attr('class'));
    $("#btnD").attr("class",update_week.eq(3).attr('class'));
    $("#btnE").attr("class",update_week.eq(4).attr('class'));
    $("#btnF").attr("class",update_week.eq(5).attr('class'));
    $("#btnG").attr("class",update_week.eq(6).attr('class'));

    
    $("#timeStartHour").val(update_time[0].split(":")[0]);
    $("#timeStartMinute").val(update_time[0].split(":")[1]);
    $("#timeEndHour").val(update_time[1].split(":")[0]);
    $("#timeEndMinute").val(update_time[1].split(":")[1]);

    var update_imgtxt = $("#OrganicDiv_"+OrganCNT).children(".make_tit");
    $("#imgLink").attr("src", update_imgtxt.children().children(".make_img").attr("src"));      // image src 내용 가저오기
    $("#subject").text(update_imgtxt.children(".make_name").text());           // strong value 가져오기
    delDiv(OrganCNT);

    console.log("update_div : "+update_div)
    update_div_next = $("#ogran_list").children().eq(update_div).attr('id')
    if(update_div_next == undefined){
        update_div_next = "LAST";
    }
    console.log("UPDATE CHECK : "+$('#ogran_list').children(".schedule_make").length)
    if($('#ogran_list').children(".schedule_make").length == 0){
        console.log("length == 1 !!!!!!!!!!!!!!")
        update_div_next = "before_default"
    }

    
}

function cnt_group_dev(){
    $.ajax({
        type: "GET",
        url: "/settop/search",
        async: false,
        success : function(json) {
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
            $("#diyBtn_"+nodes[w].id).text("(0)");
        }
    }
    $("#diyBtn_default").text("("+dev_group_data_total+")")
}


function check_all_group(){
    $("#device_list").children().remove();
    var zTree = $.fn.zTree.getZTreeObj("treeDemo");
    console.log($("#treeDemo_1_check").attr("class"));
    if($("#treeDemo_1_check").attr("class") == "button chk checkbox_true_full_focus" || $("#treeDemo_1_check").attr("class") == "button chk checkbox_true_full"){
        zTree.checkAllNodes(true);
        var param = "all";
        simplelist(param);
        $("#treeDemo_1_switch").hide();
        $("#treeDemo_1_edit").hide();
        $("#treeDemo_1_remove").hide();
    }else{
        zTree.checkAllNodes(false);
        var param = "no";
        simplelist(param);
        $("#treeDemo_1_switch").hide();
        $("#treeDemo_1_edit").hide();
        $("#treeDemo_1_remove").hide();
    }
}


// 페이징 처리
function paging(totalData, dataPerPage, currentPage){
    $("#controlList").html('');
    selectedPage = currentPage;
    var totalPage = Math.ceil(totalData/dataPerPage);    // 총 페이지 수

    console.log('totalPage: ' + totalPage);

    var startPoint = (currentPage-1)*dataPerPage;
    var endPoint = currentPage * dataPerPage;

    $("#paging_now").text(currentPage);
    $("#paging_total").text("/ "+totalPage);

    next = (currentPage+1);
    prev = (currentPage-1);

    console.log("next : " + next);
    console.log("prev : " + prev);

    var li_string = "";

    for(var i= startPoint; i < endPoint; i++) {
        if(control_list[i] != undefined){
        li_string += "<li title='스케줄 추가' draggable='true' id='waview_"+i+"' wurl='"+control_list[i].control_img+"' wname='"+control_list[i].control_nm+"' wid='"+control_list[i].control_id+"'  wscreen='"+control_list[i].screen_id+"' ondragstart=\"drag_getnodeid('waview_"+i+"')\" onClick=\"screenCheck("+i+")\" ;>";
        li_string += "<img style='cursor: pointer;'  src='"+control_list[i].control_img+"'> <strong>"+control_list[i].control_nm+"</strong></li>"
        }
    }
    li_string += "</ul>"
    $("#controlList").append(li_string);
   
}

function check_count_sch(){
    var organ_list_cnt = $('#ogran_list').children(".schedule_make").length;
    if(organ_list_cnt == 0){
        $("#ogran_list").addClass("zero");
        $("#btn_add_circle").show();
        $("#before_default").hide();
    } else {
        $("#ogran_list").removeClass("zero");
        $("#btn_add_circle").hide();
        $("#before_default").show();
    }
}