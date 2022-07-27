
// 오늘일자
var getToday = function(){

    date = new Date()
    year = date.getFullYear();
    month = date.getMonth()+1;
    dt = date.getDate();

    if (dt < 10) {
        dt = '0' + dt;
    }
    if (month < 10) {
      month = '0' + month;
    }

    var toDay = year+'-' + month + '-'+dt
    return toDay;
}

// 날짜 더하기
var addDays = function (date, days) {
  var result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

// 월 더하기
var addMonth = function (date, month) {
  var result = new Date(date);
  result.setMonth(result.getMonth() + month);
  return result.toISOString().slice(0,10);
}

// 년 더하기
var addYears = function (date, year) {
  var result = new Date(date);
  result.setYear(result.getFullYear() + year);
  return result
}

// 현재 시간
var formatAMPM = function(){
  var date = new Date();
  var minutes = date.getMinutes();
  if(minutes >= 50){
    date.setHours(date.getHours() + 1);
  }
  var hours = date.getHours();
  var ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;

  minutes = minutes >= 50 ? '00' : minutes == '0' ? '10' : Number(Math.ceil(minutes/10))+'0';
  var strTime = hours + ':' + minutes + ' ' + ampm;
  return strTime;

}

/*시간 비교

   // 두 일자(startTime, endTime) 사이의 차이를 구한다.
   var dateGap = endDate.getTime() - startDate.getTime();
   var timeGap = new Date(0, 0, 0, 0, 0, 0, endDate - startDate);

   // 두 일자(startTime, endTime) 사이의 간격을 "일-시간-분"으로 표시한다.
   var diffDay  = Math.floor(dateGap / (1000 * 60 * 60 * 24)); // 일수
   var diffHour = timeGap.getHours();       // 시간
   var diffMin  = timeGap.getMinutes();      // 분
   var diffSec  = timeGap.getSeconds();      // 초

*/
var timeCompare = function(start, end, target, flag){

    var delTime = 1000*60*5; //5분
    var dayTime = 1000*60*60*24*2 // 2일

    var startTime = new Date(start).getTime();
    var endTime = new Date(end).getTime();
    var nowTime = new Date().getTime();

    if(endTime <= startTime){
        //"종료일자가 시작일자보다 이전일로 설정되었습니다."
        return "start_end_err"
    }
    if(target == "btnDeploy" || (target == "btnScheduleCheck" && flag == "")){

        if((nowTime + delTime) > startTime){
            //"현재시간 5분 이후로 시작일자를 지정해 주세요."
            return "start_minutes_err";
        }

        if((startTime + dayTime) > endTime){
            return "end_day_error";
        }

    }else{

        if((nowTime + dayTime) > endTime){
            return "end_day_update_error";
        }

    }

    return "success"
}


var timeDiff = function(start, end){

    var startTime = new Date(start).getTime();
    var endTime = new Date(end).getTime();
    var nowTime = new Date().getTime();

    if(endTime <= startTime){
        //"종료일자가 시작일자보다 이전일로 설정되었습니다."
        return "start_end_error"
    }

    // 스케줄 체크 및 배포인 경우

    if(nowTime  >= startTime){
        //스케줄 시작시간을 현재시간 이후로 설정해 주세요
        return "start_error";
    }

    if(nowTime >= endTime){
        return "end_error";
    }

    return "success"
}