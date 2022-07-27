// Dashboard.js
// Created by WAVIEW.co.kr 
// Date : 2021.05.11

var Dataset = "";
$(function(){
    $('.wrap-loading').removeClass('display-none');

    // 콘텐츠 갯수 가져오기
    $.ajax({
        contentType: false,
        processData: false,
        type: "GET",
        async : false,
        url: "/dashboard/search", 
        success : function(json) { 
            Dataset = json;  
            
            var contents_list = json.contents
            var videoW = 0;
            var imgW = 0;
            var textW = 0;
            var webW = 0;
            var liveW = 0;
            var total_contents = 0;
          
            for(i=0 ; i < contents_list.length ; i++) {
                if (contents_list[i].cont_tp == "M") {
                    $("#video_count").text(contents_list[i].count);
                    videoW = contents_list[i].count;
                }
                else if (contents_list[i].cont_tp == "I") {
                    $("#img_count").text(contents_list[i].count);
                    imgW = contents_list[i].count;
                }
                else if (contents_list[i].cont_tp == "T") {
                    $("#text_count").text(contents_list[i].count);
                    textW = contents_list[i].count;
                }
                else if (contents_list[i].cont_tp == "W") {
                    $("#web_count").text(contents_list[i].count);
                    webW = contents_list[i].count;
                }
                else if (contents_list[i].cont_tp == "L") {
                    $("#live_count").text(contents_list[i].count);
                    liveW = contents_list[i].count;
                };
            };

            total_contents = videoW + imgW + textW + webW + liveW;

            $('.contents_chart .chart_box .video').css('width', parseInt(videoW / total_contents * 100) + "%");
            $('.contents_chart .chart_box .img').css('width', parseInt(imgW / total_contents * 100) + "%");
            $('.contents_chart .chart_box .text').css('width', parseInt(textW / total_contents * 100) + "%");
            $('.contents_chart .chart_box .web').css('width', parseInt(webW / total_contents * 100) + "%");
            $('.contents_chart .chart_box .live').css('width', parseInt(liveW / total_contents * 100) + "%");
        },            

        error: function(json){         
        }
    });
  

    // 2. 데이타 처리 (UI)
    $(document).ready(function(){

        // MENU 적용
        $('#mn_dashboard').attr({
            'class' : 'active',
        });
        
        // 달력 그리기 
        var now = new Date();
        var year = now.getFullYear();
        var month = now.getMonth() + 1;    //1월이 0으로 되기때문에 +1을 함.
        var date = now.getDate();
        month = month >=10 ? month : "0" + month;
        date  = date  >= 10 ? date : "0" + date;
        // ""을 빼면 year + month (숫자+숫자) 됨.. ex) 2018 + 12 = 2030이 리턴됨.
        var calendarDate = year +'.'+ month ;
        $('.calendar_date_wrap strong').text(calendarDate);
    
        setCalendar(calendarDate);
        todayCssInsert(calendarDate);
        
        function todayCssInsert(targetValue){
            var date = now.getDate();

            if( targetValue == calendarDate){
                $('#calendarUl li').each(function(){				
                    if($(this).find('span').text() == date){
                        $(this).addClass('today');
                    }				
                });	
            }
        }

        //달력날짜에 ID 넣기
        listInsertID();	
        function listInsertID(){		
            $('.calendar_body li').each(function(){
                if($(this).children('span').length = true){				 
                    var daytext = $(this).find('span').text();
                    $(this).attr('id','dayCount'+daytext );
                    $(this).children('div').attr('id','schCount'+daytext);			
                }			
            });	
        }

        //셋탑박스 차트그리기
        now_settop();
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
        

                    var onlinePer = current_cnt / current_total * 100 + "%";
                    var offlinePer = offline / current_total * 100 + "%";
                    var errorPer = current_fault_cnt / current_total * 100 + "%";
        
                    $('.settopbox_chart .chart_box .online').css('width',onlinePer);
                    $('.settopbox_chart .chart_box .offline').css('width',offlinePer);
                    $('.settopbox_chart .chart_box .error').css('width',errorPer);
        
                },
                error: function(){
                   alert("상세 조회시 에러가 발생했습니다.");
                }
            });
            
        }

        // 스토리지 차트 넓이값 넣어 주기
        var userdetail = Dataset.userDetail.split(",")          // [user_disk , user_settop, user_reg_user_cnt, create_user_id]
        var nowuserdetail = Dataset.nowuserDetail.split(",")    // [now_disk,    now_settop,  now_user]
        
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


        // 편성된 스케줄 채우기  
        var schedule_list = Dataset.scheduleList;   // ajax Data

        var set_y = calendarDate.slice(0,4)*1;
        var set_M = calendarDate.slice(5,7)*1 -1; 
        var organ_nm = "";                              // 편성 이름
        var st_date = new Date('year-month-dayThh:mm:ss');                        // 편성 시작 날짜
        var end_date = new Date('year-month-dayThh:mm:ss');                     // 편성  끝 날짜
        var date_tp = new Date('year-month-dayThh:mm:ss');     // 날짜 변수
        var DAYS_OF_MONTH = 31;                         // 한달은 최대 31일!
        var schedule_count = 0;                         // 스케줄 개수
        schedule_arr = new Array(DAYS_OF_MONTH);
        var week1 = new Array();

        // Processing Start
        $('.wrap-loading').removeClass('display-none');
                        
        // 1일 ~ 31일까지 기간에 편성된 스케줄 찾기
        for(j=1 ; j <= DAYS_OF_MONTH; j++){     
            
            // 스케줄 리스트 불러오기
            for(i=0 ; i < schedule_list.length ; i++){
                
                // 값 가져오기(organ_nm, start_date, end_date)
                organ_nm = schedule_list[i].organ_nm
                var split_st_date = schedule_list[i].start_dt.split('-');
                st_date.setFullYear(split_st_date[0], (split_st_date[1]-1), split_st_date[2]);
                var split_end_date = schedule_list[i].end_dt.split('-');
                end_date.setFullYear(split_end_date[0], (split_end_date[1]-1), split_end_date[2]);
                // 달력에 그리기
                date_tp.setFullYear(set_y, set_M, j);
                
                if(date_tp >= st_date && date_tp <= end_date){
                                                
                    // html 태그 개수 구하기
                    var tot_schbox = $('#schCount'+j).children().length;

                    // 날짜 요일에 편성을 확인하여 그려주기 (월~일)
                    if(date_tp.getDay() == 1 && schedule_list[i].organ_week1 == "Y"){ 
                        schedule_append();
                        week1.push(i)
                    }                        
                    if(date_tp.getDay() == 2 && schedule_list[i].organ_week2 == "Y"){
                        schedule_append();
                        week1.push(i)
                    };
                    if(date_tp.getDay() == 3 && schedule_list[i].organ_week3 == "Y"){
                        schedule_append();
                        week1.push(i)
                    };
                    if(date_tp.getDay() == 4 && schedule_list[i].organ_week4 == "Y"){
                        schedule_append();
                        week1.push(i)
                    };
                    if(date_tp.getDay() == 5 && schedule_list[i].organ_week5 == "Y"){
                        schedule_append();
                        week1.push(i)
                    };
                    if(date_tp.getDay() == 6 && schedule_list[i].organ_week6 == "Y"){
                        schedule_append();
                        week1.push(i)
                    };
                    if(date_tp.getDay() == 0 && schedule_list[i].organ_week7 == "Y"){
                        schedule_append();
                        week1.push(i)
                    };
                };
                html = '';
                html2 = '';
            };
            schedule_arr.splice(j-1, 0, week1);
            week1 = new Array();

            schedule_count = 0;
            
            
            function schedule_append(){	
                var html = ''; 
                var html2 = '';
                var html_class = ["schedule_allday", "schedule_morning", "schedule_after", "schedule_more"];    // 스케줄박스 디자인
                var dot_class = ["allday", "morning", "after"];

                if(tot_schbox < 3){
                    html += '<a class="'+ html_class[tot_schbox] +'">' + organ_nm + '</a>';
                    html2 += '<span class="'+dot_class[tot_schbox]+'">'+organ_nm+'</span>';
                    $('#schCount'+j).append(html);
                    $('#schDot'+j).append(html2);
                } else if(tot_schbox == 3 ){
                    schedule_count++;
                    html += '<a class="'+ html_class[tot_schbox] +'">+'+ schedule_count +'</a>';
                    html2 += '<span class="'+dot_class[tot_schbox]+'">'+organ_nm+'</span>';
                    $('#schCount'+j).append(html);                                
                    $('#schDot'+j).append(html2);
                } else {
                    schedule_count++;
                    $('#schCount'+j).find('.schedule_more').text('+'+schedule_count);
                }; 
            };
        };
        // Processing close
        $('.wrap-loading').addClass('display-none');
    });		 
});

// 
function setCalendar(targetValue){	
    //alert("targetValue : "+targetValue);
    var setY = targetValue.slice(0,4);
    var setM = targetValue.slice(5,7)*1;
    var setD = targetValue.slice(8,10);

    if(setM<10){
        setM = '0'+ setM;
    }	
        
    // Calendar date 객체 생성하기!
    var Calendar = new Date(); 	
    
    var today = Calendar.getDate();      // 1 ~ 31 (1 ~ 31일)
        
    Calendar.setFullYear(setY);
    Calendar.setMonth(setM-1);
    Calendar.setDate(1);            // 달력은 1일부터 표시해야하니 setDate() 메서드를 이용해서 1일로 마추자! 
    var DAYS_OF_WEEK = 7;          // 일주일은 7일!
    var DAYS_OF_MONTH = 31;        // 한달은 최대 31일!
    var str='';                       // html 코드를 넣을 str 변수

    //요일마다 색을 다르게줍니다.
    var LI_blank_start = "<li class='blank'>&nbsp;";          // blank (1일 이전의 날짜)
    var LI_blank_end = "</li>";          	// blank (1일 이전의 날짜)
    var LI_today_start = "<li><span>";          // 오늘 날짜
    var LI_day_start = "<li><span>";              // 평일
    var LI_saturday_start = "<li class='sat'><span>";     // 토요일
    var LI_sunday_start = "<li class='sun'><span>";          // 일요일
    var LI_select_start = "<li class='sel'><span>";              // 선택날짜
    var LI_end = "</span>";    // 테이블 만들기
    var LI_html = '<div class="schedule_box">';
    var LI_html_end = "</div></li>"
    
    

    // 1일이 시작하기 전까지의 이전 요일들을 blank 하자!
    for(var i = 0; i < Calendar.getDay(); ++ i) {
        str += LI_blank_start  + LI_blank_end;
    } 
    // 1일부터 시작!
    for (var i = 0; i < DAYS_OF_MONTH; ++i) {
        // 날짜가 i보다 클 때만 표현!! 왜냐하면 -> 날짜가 i보다 작다는 건 다음 달로 넘어가서 1일이 되었다는 거다!
        if(Calendar.getDate() > i) {
            var day = Calendar.getDate();   // 날짜
            var week_day = Calendar.getDay(); // 요일 
            // 오늘 날짜라면
            if(day == today) {
                str += LI_today_start + day + LI_end + LI_html+ LI_html_end;				
            }else if(day == setD) {
                str += LI_select_start + day + LI_end + LI_html+ LI_html_end;
            }else {
                switch(week_day) {
                    case 0 : // 일요일
                        str += LI_sunday_start + day + LI_end + LI_html+ LI_html_end;
                        break;
                    case 6 : // 토요일
                        str += LI_saturday_start + day + LI_end + LI_html+ LI_html_end;
                        break;
                    default : // 평일
                        str += LI_day_start + day + LI_end+ LI_html+ LI_html_end;
                        break;
                }				
            }
            
        }
        // 다음 날짜로 넘어간다.
        Calendar.setDate(Calendar.getDate() + 1);
    }
    document.getElementById('calendarUl').innerHTML = str;	
    
}