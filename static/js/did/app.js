$(function() { // 왼쪽 메뉴 사이트 관리 활성화
    $('#menu_app').addClass("active");
    // 검색조건 닫기
    $("div button i").click();


    appSearch();

    $(document).on('change',"#file_upload" , function(event) {

        var file = event.target.files[0];

        if (file.name.length >= 50) {
            alert("파일의 글자수가 너무 많습니다");
            $('#file_preview-1').attr('src',"");
            $('#file_nm_text-1').val('');
            return;
        }
       
        // 사이즈 가져오기
        var sizeTextField = '#app_size_text';
        var sizeField = '#app_size';

        $(sizeTextField).val((file.size /1000000).toFixed(1)  + " MB");
        $(sizeField).val(file.size);
        
    });

});



//-----------------------앱 등록 캘린더 설정---------------------------//


$('#st_date_time_picker').datetimepicker({
        format:'YYYY-MM-DD HH:mm',
        minDate : new Date(),
        date : new Date()
})


//-----------------------앱 등록 캘린더 설정 끝-------------------------//


//-----------------------앱 파일 업로드 동작 RUN-------------------------//
// app Save Button Onclick function
function saveApp() {

    var url = "/app/insert";
    var method = "POST";
    // 현재 지역정보 , apply 정보
    var app_nm =    $("#app_nm").val();
    var app_file =  $("#app_file_nm_text").val();
    var app_tm =    $("#app_tm").val();
    var app_stat =  $("#app_stat").val();

    if (app_nm == "") {
        alert("제목이 입력되지 않았습니다.");
        return;
    } else if (app_file == "파일선택") {
        alert("파일이 설정되지 않았습니다.");
        return;
    } else if (app_tm == "") {
        alert("시간이 설정되지 않았습니다.");
        return;
    } else if (app_stat == "ALL") {
        alert("상태 정보가 설정되지 않았습니다.");
        return;
    }
    $("#app_stat").attr("disabled", false);
    var form_data = new FormData($('#formAppAdd')[0]);

    /* progressbar 정보 */
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
        success: function(data) {
            alert("앱 업로드가 성공하였습니다");
            $("#app_stat").attr("disabled", true);
            // $("#formAppAdd").html("");
            $("#app_nm").val("");
            $("#app_file_nm_text").val("");
            appSearch();
        },
        error: function(error) {
            console.log("ERROR : ", error);
            $("#app_stat").attr("disabled", true);
             alert(error.responseJSON.resultString);
        }
    });
}

//-----------------------앱 파일 업로드 동작 RUN 끝-------------------------//



//-----------------------파일 입력 동작 이벤트 함수------------------------//

$("input[type=file]").on('change', function(event) {
    var file = event.target.files[0];
    if (file.name.length >= 50) {
        alert("파일의 글자수가 너무 많습니다");
        return;
    }
    // 이미지 이름 설정
    var nameTextFeild = '#app_file_nm_text';
    $(nameTextFeild).val(file.name);
    var fileReader = new FileReader();
    fileReader.readAsArrayBuffer(file);
});

//-----------------------파일 입력 동작 이벤트 함수 끝------------------------//


//-----------------------앱 테이블 조회 함수 동작------------------------//
function appSearch() {
    var dataList = $('#data_list').DataTable({
        "lengthChange": false,
        "destroy" : true,
        "searching": false,
        "ordering": false,
        "info": false,
        "autoWidth": true,
        "paging": true,
        "Paginate": true,
        "processing": true,
        "serverSide": true,
        
        ajax : {
            "url": "/app/search",
            "type": "POST",
            "async" : "false"
        },
        "columns": [
                { data: "row_cnt"},
                { data: "app_nm"},
                { data: "app_file_nm"},
                { data: "app_url"},
                { data: "app_date"},
                { data: "app_stat"},
                { data: "app_version"},
                {
                    data:  null,
                    render: function(data, type, full, meta){
                            return (data.app_size / 1000000).toFixed(1) + "MB"
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
}


//-----------------------파일 입력 동작 이벤트 함수------------------------//