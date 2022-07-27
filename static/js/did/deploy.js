// Deploy.js
// Created by WAVIEW.co.kr 
// Date : 2021.05.17
var organ_st_time = "";
var organ_ed_time = "";
var organ_name = [];
var dataList;

$(function(){

    dataList = $('#data_list').DataTable({
        "lengthChange": false,
        "searching": false,
        "ordering": false,
        "info": false,
        "autoWidth": true,
        "processing": true,
        "serverSide": true,
        ajax : {
            "url": "/deploy/search",
            "type":"POST"
        },
        "columns": [
            { data: "row_cnt"},
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
            {
                data:  null,
                render: function(data, type, full, meta){
                        return "<button title='셋탑박스 상세보기' class='btn_point' sch_id='"+data.sch_id+"' onclick='organdevcnt("+data.sch_id+")'>"+data.dev_cnt+"대</button>" +
                        "<span style='display : none;' id='dev_cnt_"+data.sch_id+"' value='"+data.dev_cnt+"'>"+data.dev_id+"</span>";
                }
            },
            { data: "user_id"},
            { data: "rgt_dt"},
            {
                data:  null,
                render: function(data, type, full, meta){
                        return "<button title='배포내역 삭제'class='btn_point"+
                         "' sch_id="+data.sch_id+
                         "  data-toggle='modal' onClick='delSchedule("+data.sch_id+");'>삭제</button>";
                }
            },
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
});


function delSchedule(schedule_id){

    // Schedule ID 
    console.log("Schedule ID : ["+schedule_id+"]");

    $.ajax({
        type: "DELETE",
        url: "/schedule/delete/"+schedule_id,
        processData: false,
        contentType: false,
        success: function(data) {                
            alert(data.resultString);
            dataList.ajax.url("/deploy/search").load();
        },
        error: function(error) {
            console.log("ERROR : ", error.resultString);
            alert(error.responseJSON.resultString);
        }
    });
}

// 셋탑박스 갯수
function organdevcnt(schedule_id){
    $("#modaldevcnt").modal('show');

    $("#settop_cnt").text("셋탑박스 : "+$("#dev_cnt_"+schedule_id).attr('value')+"대");
    $("#settop_cnt_ID").text("셋탑박스 아이디 : "+$("#dev_cnt_"+schedule_id).text());
}

var closePopup = function(){
    $("#modaldevcnt").modal('hide');
};