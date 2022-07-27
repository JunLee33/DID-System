// organic.js
// Created by WAVIEW.co.kr 
// Date : 2021.05.13
var schedule_data = "";
var schedule_arr = new Array();

// <!-- 달력 관련 추가 -->      
$(function(){
	$(document).ready(function(){

        // MENU 적용
        $('#mn_schedule').attr({
            'class' : 'active',
        });

        var now = new Date();
        var year = now.getFullYear();
        var month = now.getMonth() + 1;    //1월이 0으로 되기때문에 +1을 함.
        var date = now.getDate();
        month = month >=10 ? month : "0" + month;
        date  = date  >= 10 ? date : "0" + date;
        // ""을 빼면 year + month (숫자+숫자) 됨.. ex) 2018 + 12 = 2030이 리턴됨.
        var calendarDate = year +'.'+ month ;
        $('.calendar_date_wrap strong').text(calendarDate);
        $('.calendar_date_small').text(calendarDate); 
        setCalendar(calendarDate); //이번달을 그림
        todayCssInsert(calendarDate);
        listInsertID();
        scheduleInsert(calendarDate);
        asideCalendarTit(calendarDate);
        click_date();
        click_day(calendarDate, date);
        
        //달력에 날짜에 ID 넣기	
        function listInsertID(){
            $('#calendarUl li').each(function(){
                if($(this).children('span').length = true){				 
                    var daytext = $(this).find('span').text();
                    $(this).attr('id','dayCount'+daytext );	
                    $(this).children('div').attr('id','schCount'+daytext);						
                }			
            });
            $('#calendarUl2 li').each(function(){
                if($(this).children('span').length = true){				 
                    var daytext = $(this).find('span').text();
                    $(this).attr('id','dayCountSmall'+daytext );
                    $(this).children('div').attr('id','schDot'+daytext);
                    $(this).children('div').attr('class','dot_box');
                }			
            });
        }
        
        // 클릭한 날짜 데이터 넘겨주기
        function click_date(){
            $('#calendarUl li').on('click', function () {
                $('.day_schedule_list').empty();                            //  날짜 리스트 날짜 삽입
                $('.day_schedule_date').empty();                            //  날짜 리스트 비우기
                $('#calendarUl li').removeClass('click');                   // 클릭 날짜 색 다 없애기

                var year_month = $('.calendar_date_wrap strong').text();    // 연도, 월 가져오기
                var setD = $(this).find('span').text();
                setD  = setD  >= 10 ? setD : "0" + setD;

                if($(this).attr('class') != 'blank'){
                    $(this).addClass('click');
                    click_day(year_month,setD);
                }
            });
        };
        
        // 클릭한 날짜 데이터에 해당하는 스케줄리스트로 표시
        function click_day(targetValue, target_date = date){
            var click_date = targetValue + "." + target_date;
            $('.day_schedule_list').empty();                            //  날짜 리스트 날짜 삽입
            $('.day_schedule_date').empty();                            //  날짜 리스트 비우기

            var newDate = click_date.replaceAll(".","-")
            $('#btn_date_schdule').attr('href','/schedule?newDate='+newDate)
            
            
            var scheduleList = schedule_data.scheduleList;
            var settop_cnt = "";
            $.ajax({
                type: "GET",
                url: "/deploy/search",
                async : false,
                success : function(json) {
                    settop_cnt = json.data;
                },        

                error: function(json){   
                }
            });
            
            var day_html = ''
            var dot_class = ["allday", "morning", "after"];
            var organ_week = ["organ_week1","organ_week2","organ_week3","organ_week4","organ_week5","organ_week6","organ_week7"];
            var organ_day = ["월","화","수","목","금","토","일"];
                

            var scharr_day = schedule_arr[target_date-1];            
            $('.day_schedule_date').text(click_date);             
            
            
            for(i = 0 ; i < scharr_day.length; i++){
                
                day_html = "<dt><strong class='"+dot_class[0]+"'>"+ scheduleList[scharr_day[i]].organ_nm +"</strong><span>("+scheduleList[scharr_day[i]].start_dt+
                            "~"+scheduleList[scharr_day[i]].end_dt+")</span></dt><dd><div class='day_box'>";
                
                if(scheduleList[scharr_day[i]].organ_week1 == 'Y'){
                    day_html += "<span class='day active'>"+organ_day[0]+"</span>";
                }
                if(scheduleList[scharr_day[i]].organ_week2 == 'Y'){
                    day_html += "<span class='day active'>"+organ_day[1]+"</span>";
                }
                if(scheduleList[scharr_day[i]].organ_week3 == 'Y'){
                    day_html += "<span class='day active'>"+organ_day[2]+"</span>";
                }
                if(scheduleList[scharr_day[i]].organ_week4 == 'Y'){
                    day_html += "<span class='day active'>"+organ_day[3]+"</span>";
                }
                if(scheduleList[scharr_day[i]].organ_week5 == 'Y'){
                    day_html += "<span class='day active'>"+organ_day[4]+"</span>";
                }
                if(scheduleList[scharr_day[i]].organ_week6 == 'Y'){
                    day_html += "<span class='day active'>"+organ_day[5]+"</span>";
                }
                if(scheduleList[scharr_day[i]].organ_week7 == 'Y'){
                    day_html += "<span class='day active'>"+organ_day[6]+"</span>";
                }
                                

                day_html += "<p> 재생시간 : "+ scheduleList[scharr_day[i]].organ_st_dt +"~" + scheduleList[scharr_day[i]].organ_ed_dt + "</p>";
                for(j = 0; j < settop_cnt.length; j++){
                    if(scheduleList[scharr_day[i]].sch_id == settop_cnt[j].sch_id){
                        day_html += "<p> 전송대수 : "+ settop_cnt[j].dev_cnt+"</p>";
                        day_html += "</div></dd>";
                        $('.day_schedule_list').append(day_html);
                    }
                }
            };
            
            
            
        
        };

        //aside에 있는 달력에 년,월 자르기
        function asideCalendarTit(targetValue){		
            var smallY = targetValue.slice(0,4)*1;
            var smallM = targetValue.slice(5,7)*1;
            smallM = smallM >=10 ? smallM : "0" + smallM;
            $('.calendar_date_small').html(smallY+'<strong>'+smallM+'</strong>'); 
        }
        
        
        //달력의 이전달 클릭시
        $(document).on('click', '#btnCalendarPrev', function() {
            var targetValue = $('.calendar_date_wrap strong').text();
            var setY = targetValue.slice(0,4)*1;
            var setM = targetValue.slice(5,7)*1;		
            if((setM-1)==0){
                setM = 12;
                var setYYYY = setY-1;
                var setMM = setM;
            }else{
                var setYYYY = setY;
                var setMM = setM-1;
            }
            setMM = setMM >=10 ? setMM : "0" + setMM;
            var setYYYYMM = String(setYYYY)+'.'+String(setMM);
            $('.calendar_date_wrap strong').text(setYYYYMM);
            $('.calendar_date_wrap strong').text(setYYYYMM);
            setCalendar(setYYYYMM);	
            todayCssInsert(setYYYYMM);
            listInsertID();
            scheduleInsert(setYYYYMM);
            asideCalendarTit(setYYYYMM);
            click_date()
            click_day(setYYYYMM);
        });
        
        //달력의 다음달 클릭시
        $(document).on('click', '#btnCalendarNext', function() {
            var targetValue = $('.calendar_date_wrap strong').text();
            var setY = targetValue.slice(0,4)*1;
            var setM = targetValue.slice(5,7)*1;		
            if((setM+1)==13){
                setM = 1;
                var setYYYY = setY+1;
                var setMM = setM;
                    
            }else{
                var setYYYY = setY;
                var setMM = setM+1;
            }	
            setMM = setMM >=10 ? setMM : "0" + setMM;
            var setYYYYMM = String(setYYYY)+'.'+String(setMM);
            $('.calendar_date_wrap strong').text(setYYYYMM);
            $('.calendar_date_wrap strong').text(setYYYYMM);
            
            setCalendar(setYYYYMM);
            todayCssInsert(setYYYYMM);
            listInsertID();
            scheduleInsert(setYYYYMM);
            asideCalendarTit(setYYYYMM);
            click_date();
            click_day(setYYYYMM);
        });
        
        //오늘 클릭시 이번달 표시해줌
        $(document).on('click', '#btnCalendarToday', function() {		
            $('.calendar_date_wrap strong').text(calendarDate);
            $('.calendar_date_small').text(calendarDate);
            setCalendar(calendarDate);
            todayCssInsert(calendarDate);
            listInsertID();
            scheduleInsert(calendarDate);
            asideCalendarTit(calendarDate);
            click_day(calendarDate);
        });
        
        function todayCssInsert(targetValue){
            // alert("date : "+date);
            
            //alert("calendarDate : "+calendarDate);		
            //alert("targetValue2 : "+targetValue);

            date = now.getDate();
            
            if( targetValue == calendarDate){
                //alert("이번달이야");
                $('#calendarUl li, #calendarUl2 li').each(function(){				
                    if($(this).find('span').text() == date){
                        $(this).addClass('today');
                    }				
                });	
            }else{
                //alert("다른달이야");
            };
        }	
    });	
    
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
        // getDay() 메서드는 (일요일:0 ~ 토요일:6)을 반환하니 0번째 인덱스부터 일요일을 넣는다.
        var day_of_week = ['일', '월', '화', '수', '목', '금', '토']; 
        // getMonth() 메서드는 (1월:0 ~ 12월:11)을 반환하니 0번째 인덱스부터 1월을 넣는다.
        var month_of_year = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];
    
        var year = Calendar.getFullYear();   // yyyy   년도
        var month = Calendar.getMonth();     // 0 ~ 11 (1 ~ 12월 인덱스)
        var today = Calendar.getDate();      // 1 ~ 31 (1 ~ 31일)
        var weekday = Calendar.getDay();     // 0 ~ 6  (일요일 ~ 토요일 인덱스)
        
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
        var LI_html_end = "</div></li>";

        // 1일이 시작하기 전까지의 이전 요일들을 blank 하자!
        for(var i = 0; i < Calendar.getDay(); ++ i) {
            str += LI_blank_start + LI_blank_end;
        } 
        // 1일부터 시작!
        for (var i = 0; i < DAYS_OF_MONTH; ++i) {
            // 날짜가 i보다 클 때만 표현!! 왜냐하면 -> 날짜가 i보다 작다는 건 다음 달로 넘어가서 1일이 되었다는 거다!
            if(Calendar.getDate() > i) {
                var day = Calendar.getDate();   // 날짜
                var week_day = Calendar.getDay(); // 요일 
                //alert('day : '+day);
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
        document.getElementById('calendarUl2').innerHTML = str;
    }

    function scheduleInsert(targetValue){
        $.ajax({
            type: "GET",
            url: "/dashboard/search",
            async: false,
            success : function(json) {
                schedule_data = json;
                var set_y = targetValue.slice(0,4)*1;
                var set_M = targetValue.slice(5,7)*1 -1; 
                var schedule_list = schedule_data.scheduleList;
                var organ_nm = "";                              // 편성 이름
                var st_date = new Date('year-month-dayThh:mm:ss');                        // 편성 시작 날짜
                var end_date = new Date('year-month-dayThh:mm:ss');                     // 편성  끝 날짜
                var now = new Date('year-month-dayThh:mm:ss');     // 날짜 변수
                var DAYS_OF_MONTH = 31;                         // 한달은 최대 31일!
                var schedule_count = 0;                         // 스케줄 개수
                schedule_arr = new Array(DAYS_OF_MONTH);
                var week1 = new Array();
                                
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
                        now.setFullYear(set_y, set_M, j);
                        if(now >= st_date && now <= end_date){
                                                       
                            // html 태그 개수 구하기
                            var tot_schbox = $('#schCount'+j).children().length;

                            // 날짜 요일에 편성을 확인하여 그려주기 (월~일)
                            if(now.getDay() == 1 && schedule_list[i].organ_week1 == "Y"){ 
                                schedule_append();
                                week1.push(i)
                            }                        
                            if(now.getDay() == 2 && schedule_list[i].organ_week2 == "Y"){
                                schedule_append();
                                week1.push(i)
                            };
                            if(now.getDay() == 3 && schedule_list[i].organ_week3 == "Y"){
                                schedule_append();
                                week1.push(i)
                            };
                            if(now.getDay() == 4 && schedule_list[i].organ_week4 == "Y"){
                                schedule_append();
                                week1.push(i)
                            };
                            if(now.getDay() == 5 && schedule_list[i].organ_week5 == "Y"){
                                schedule_append();
                                week1.push(i)
                            };
                            if(now.getDay() == 6 && schedule_list[i].organ_week6 == "Y"){
                                schedule_append();
                                week1.push(i)
                            };
                            if(now.getDay() == 0 && schedule_list[i].organ_week7 == "Y"){
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
                            html += '<a href="#none" class="'+ html_class[tot_schbox] +'">' + organ_nm + '</a>';
                            html2 += '<span class="'+dot_class[tot_schbox]+'">'+organ_nm+'</span>';
                            $('#schCount'+j).append(html);
                            $('#schDot'+j).append(html2);
                        } else if(tot_schbox == 3 ){
                            schedule_count++;
                            html += '<a href="#none" class="'+ html_class[tot_schbox] +'">+'+ schedule_count +'</a>';
                            html2 += '<span class="'+dot_class[tot_schbox]+'">'+organ_nm+'</span>';
                            $('#schCount'+j).append(html);                                
                            $('#schDot'+j).append(html2);
                        } else {
                            schedule_count++;
                            $('#schCount'+j).find('.schedule_more').text('+'+schedule_count);
                        }; 
                    };

                };
            },        

            error: function(json){   
            }
        });
    };
});