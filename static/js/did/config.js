$(function(){

    // On load 시점에 해당 정보 Query & setting
    $.ajax({
        type: "GET",
        url: "/user/Local/search",
        processData: false,
        contentType: false,
        success: function(json) {

            var data = JSON.parse(json.data);

            if(data[0].user_M == "Y") $("#contsSet01").attr("checked", true);
            if(data[0].user_I == "Y") $("#contsSet02").attr("checked", true);
            if(data[0].user_T == "Y") $("#contsSet03").attr("checked", true);
            if(data[0].user_W == "Y") $("#contsSet04").attr("checked", true);
            if(data[0].user_L == "Y") $("#contsSet05").attr("checked", true);
            if(data[0].user_G == "Y") $("#contsSet06").attr("checked", true);

        },
        error: function(error) {
            console.log("ERROR : ", error.resultString);
            alert(error.responseJSON.resultString);
        }
    });

    $("#btn_config").on("click",function(){

        // check & get Request
        if($('input:checkbox[id="contsSet01"]').is(":checked") == true) var userM = "Y"; else var userM = "N";
        if($('input:checkbox[id="contsSet02"]').is(":checked") == true) var userI = "Y"; else var userI = "N";
        if($('input:checkbox[id="contsSet03"]').is(":checked") == true) var userT = "Y"; else var userT = "N";
        if($('input:checkbox[id="contsSet04"]').is(":checked") == true) var userW = "Y"; else var userW = "N";
        if($('input:checkbox[id="contsSet05"]').is(":checked") == true) var userL = "Y"; else var userL = "N";
        if($('input:checkbox[id="contsSet06"]').is(":checked") == true) var userG = "Y"; else var userG = "N";

        var url = "/user/insert?userM="+userM+"&userI="+userI+"&userT="+userT+"&userW="+userW+"&userL="+userL+"&userG="+userG;

        $.ajax({
            type: "GET",
            url: url,
            processData: false,
            contentType: false,
            success: function(data) {                
                alert(data.resultString);
            },
            error: function(error) {
                console.log("ERROR : ", error.resultString);
                alert(error.responseJSON.resultString);
            }
        });
    });

    //슈퍼어드민을 제외한 S/W관리 권한 제한

    $.ajax({
        type: "GET",
        url: "/user/search?user_gr=0000",
        
        success : function(json) {
            user_id_now = json.resultUserid;
            if(user_id_now != "admin"){
                $('#btnSW').hide();
            }else{
                $('#btnSW').show();
            }
        },
        error: function(json){
            alert("에러가 발생 하였습니다.");
        }
    });
});