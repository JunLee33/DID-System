// Design.js
// Design management functions Created by WAVIEW(waview.co.kr)
// Cteated 2021.04.30

// NEW or UPDATE flag.
var drawCount = 0;

// Init process
var nowSelectedRecID = "";
var nodeName = "";

var grid = 20;

var width   = 1920;
var height  = 1080;
var node_x = 0;
var node_y = 0;
var node_w = 0;
var node_h = 0;

// Ratio for screen 
var screenRatioX = 0.5;
var screenRatioY = 0.5;

var control_list;

var finalHTML  = "";

var stage = new Konva.Stage({
    container: 'canvas_container',
    width: width,
    height: height,
    id:'canvasStage',
});


var layer = new Konva.Layer({
});

var tr = new Konva.Transformer({
    keepRatio : false,
    rotateEnabled : false
});

var group_seq_now = '';

// 컨트롤 리스트 카운트
var cnt_m_control = 0;
var cnt_i_control = 0;
var cnt_t_control = 0;
var cnt_w_control = 0;
var cnt_l_control = 0;
var cnt_g_control = 0;

// 디자인리스트 페이징
var dataPerPage = 9;               // (바둑판) 한 페이지에 나타낼 데이터 수
var selectedPage = 1;
var currentPage;
var totalData;
var next = 0;
var prev = 0;

var grid_check = "Y";

$(function() {
    
    // z-Index Drag & Drop
    $("#controlListRight").sortable({
        cancel: '.btn_delete',
        stop: function( event, ui ) {
            z_index_set(ui.item)
        }
    });
    $("#controlListRight").disableSelection();
    // z-Index Drag & Drop
    
    
    //************************************ID,PW 한글 입력 막기***************************
    $("#sizeWidth,#sizeHeight").on("blur keyup", function() {
        $(this).val( $(this).val().replace( /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/g, '' ) );
    });

    $("#sizeWidth,#sizeHeight").keyup(function(e) {
      var regex = /^[a-zA-Z0-9@]+$/;
      if (regex.test(this.value) !== true)
        this.value = this.value.replace(/[^a-zA-Z0-9@]+/, '');
    });
    // MENU 적용
    $('#mn_design').attr({
        'class' : 'active',
    });


    // default 그리기
    reSizeStage(width, height, screenRatioX, screenRatioY);


    // 유효성 체크
    // 화면디자인 이름 
    $('#control_name').blur(function(){
        if($('#control_name').val().length > 25){
            alert("화면디자인 이름이 최대 길이를 초과했습니다")
            var sub_name = $('#control_name').val().substr(0, 25);
            $('#control_name').val(sub_name);
            return $("#control_name").focus();
        }
    });

    // 화면디자인 설명 
    $('#control_desc').blur(function(){
        if($('#control_desc').val().length > 50){
            alert("화면디자인 설명이 최대 길이를 초과했습니다")
            var sub_name = $('#control_desc').val().substr(0, 50);
            $('#control_desc').val(sub_name);
            return $("#control_desc").focus();
        }
    });

    $('#positionX').blur(function(){
        if(parseInt($('#positionX').val()) == ''){
            $('#positionX').val(0);
            return ;
        }else if(parseInt($('#positionX').val()) > width){
            $('#positionX').val(0);
            return ;
        }
        drawControl("WEB",nowSelectedRecID);
        updateText(nowSelectedRecID);
    });
    
    $('#positionY').blur(function(){
        if(parseInt($('#positionY').val()) == ''){
            $('#positionY').val(0);
            return ;
        } else if(parseInt($('#positionY').val()) > height){
            $('#positionY').val(0);
            return ;
        }
        drawControl("WEB",nowSelectedRecID);
        updateText(nowSelectedRecID);
    });

    $('#positionW').blur(function(){
        if(parseInt($('#positionW').val()) == ''){
            $('#positionW').val(200);
            return ;
        }else if(parseInt($('#positionW').val()) < 30){
            $('#positionW').val(40);
            return ;
        }else if(parseInt($('#positionW').val()) > width){
            $('#positionW').val(width);
            return ;
        }
        drawControl("WEB",nowSelectedRecID);
        updateText(nowSelectedRecID);
        
    });

    $('#positionH').blur(function(){
        if(parseInt($('#positionH').val()) == ''){
            $('#positionH').val(200);
            return ;
        }else if(parseInt($('#positionH').val()) < 30){
            $('#positionH').val(40);
            return ;
        }else if(parseInt($('#positionH').val()) > height){
            $('#positionH').val(height);
            return ;
        }
        drawControl("WEB",nowSelectedRecID);
        updateText(nowSelectedRecID);
    });
   
    // ADMIN 접근 제한
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
            // alert(json.responseJSON.resultString)
        }
    });
    // ADMIN 접근 제한 END!

    
    // drag & drop control add
    var target_type = "";
    $("#drag_button").on('dragstart', function (e) {
        target_type = e.target.value;
        });

    var con = stage.container();
    con.addEventListener('dragover', function (e) {
        e.preventDefault(); // !important
    });

    con.addEventListener('drop', function (e) {
        e.preventDefault();
        
        stage.setPointersPositions(e);
        var x_point = stage.getPointersPositions()[0].x / screenRatioX
        var y_point = stage.getPointersPositions()[0].y / screenRatioY
        
        createControl(target_type,x_point,y_point);
    });
    // drag & drop control add END!!
    
    // clicks should select/deselect controls
    stage.on('click tap', function (e) {
        tr.moveToTop();
        $("#drag_button ul li").removeClass("active");
        $("#controlListRight li button").removeClass("active");

        // if click on empty area - remove all selections
        if (e.target === stage) {
            tr.nodes([]);
            layer.draw();
            nowSelectedRecID = '';
            $('#positionX').attr('disabled','true');
            $('#positionY').attr('disabled','true');
            $('#positionW').attr('disabled','true');
            $('#positionH').attr('disabled','true');
            $('#positionX').val("");
            $('#positionY').val("");
            $('#positionW').val("");
            $('#positionH').val("");
            return;
        }

        // do nothing if clicked NOT on our rectangles
        if (!e.target.hasName('rect')) {
            return;
        } else {
            nowSelectedRecID =  e.target.attrs.id;
            nodeName = nowSelectedRecID.replace(/[0-9]/g, "");
            console.log("FIRST OF ALL nodeNAME = ["+nowSelectedRecID+"]");

            // 아이콘 선택
            // createControl(nodeName[1]);
            console.log("NODE NAME :"+nodeName);
            
            $("#drag_button ul li").removeClass("active");
            $("#controlListRight li button").removeClass("active");
            
            
            iconSelector(nodeName, "selected", nowSelectedRecID);
            updateText(nowSelectedRecID);
        }

        // transform(크기조절+드래그) 이벤트 발생시 x,y,w,h value change(updateText)
        var shape = stage.find('#'+nowSelectedRecID);
        shape.on('transformstart', function () {
        });
    
        shape.on('dragmove', function () {
            if(grid_check == "Y"){
                shape[0].x(Math.round(shape[0].x() / grid) * grid);
                shape[0].y(Math.round(shape[0].y() / grid) * grid);
            }
            
            updateText(nowSelectedRecID);
        });
    
        shape.on('transform', function () {
            shape[0].stroke("");
            updateText(nowSelectedRecID);
        });
    
        shape.on('transformend', function () {
            shape[0].stroke("black");
            drawControl("web",nowSelectedRecID);
        });

        layer.draw();
    });
    
    // 콘텐츠 저장 button click ///////////////////////////////////////
    $("#btnSave").click(function(){

        // check된 콘텐츠 화면 표출 Function call.
        checkBox();

        var control_cont = $("#control_position_list").children()
               
        for(i = 0; i < $(control_cont).length; i++){
            var contol_contlist = $(control_cont).eq(i).attr('id')
            $("#"+contol_contlist+"_contCNT").text($("#"+contol_contlist+"_ul").children().length);
        }
        
        closePopup();
    });


    // 컨트롤 저장 화면 PopUP ///////////////////////////////////////
    $("#controlSave").click(function(){
        console.log($("#screen_id").val());
        tr.nodes([]);
        if(group_seq_now == '0101'){
            alert("슈퍼관리자는 화면디자인을 추가할 수 없습니다.")
            return false;
        }
        
        if(layer.find('.rect').length == 0){
            return alert("컨트롤을 그려주세요")
        } else {
            openLayerPopup('popControlSave');
        }

        var control_cont = $("#control_position_list").children()

        for(i = 0; i < $(control_cont).length; i++){
            var contol_contlist = $(control_cont).eq(i).attr('id')
            if($("#"+contol_contlist+"_contCNT").text() == 0){
                alert("콘텐츠를 선택 하세요")
                closeLayerPopup('popControlSave');
                return ;
            }
        }

        z_index_set();
    });

    
    // 미리보기 버튼 Click ///////////////////////////////////////
    $("#btnPreview").click(function(){
        if(layer.find('.rect').length == 0){
            return alert("컨트롤을 그려주세요")
        }
        console.log("ENTERED btnPreview");
        tr.nodes([]);
        var success_code = genPOPUP();
        if(success_code == 100){
            $("#preview_container_div").append(finalHTML);
            $("#modal_preview").show();
        } 

    });

    // 컨트롤 저장 버튼 Click ///////////////////////////////////////
    $("#btnControlSave").click(function(){
        var control_cont = $("#control_position_list").children();

        for(i = 0; i < $(control_cont).length; i++){
            var contol_contlist = $(control_cont).eq(i).attr('id')
            if($("#"+contol_contlist+"_contCNT").text() == 0){
                alert("콘텐츠를 선택 하세요")
                closeLayerPopup('popControlSave');
                return ;
            }
        }

        var id_list = "";

        // 입력필드 Validation
        if($("#control_name").val() == "") {
            alert("화면디자인 이름을 입력 하세요.");
            return;
        }

        var t = $("#canvas_container")[0];
		html2canvas(t).then(function(canvas) {
			var myImg = canvas.toDataURL("image/png");
			myImg = myImg.replace("data:image/png;base64,", "");

			$.ajax({
                async: false,
				type : "POST",
				data : {
					"capture" : myImg
				},
				dataType : "text",
				url : "/api/gscapture",
				success : function(data) {
                    var screen_obj = JSON.parse(data);
                    $("#control_url").val(screen_obj.cont_url);

                    var form_data = new FormData($('#formControl')[0]);
                    var form_data_contents = new FormData($('#formControlContents')[0]);
            
                    // FormData의 값 확인 (POST DATA 이용한 에외처리 )
                    var control_name = "";
                    var playTime = 0;
                    var cont_name = "";

                    // Validataion / 실행 시간에 대한 예외처리 !!
                    for (var pair of form_data_contents.entries()) {
                        // 예외처리 진행

                        if(pair[0] == 'controlName')   control_name = pair[1];
                        if(pair[0] == 'cont_nm')       cont_name = pair[1];
                        if(pair[0] == 'playTime') {
                            playTime = pair[1];

                            if(control_name[0] == 'm' && playTime == 0){
                                alert("동영상 '"+cont_name+"' 의 실행 시간을 설정 해 주세요.");
                                closeLayerPopup('popControlSave');
                                return;
                            }

                            if(control_name[0] == 'i' && playTime == 0){
                                alert("이미지 '"+cont_name+"' 의 실행 시간을 설정 해 주세요.");
                                closeLayerPopup('popControlSave');
                                return;
                            }
                            if(control_name[0] == 't' && playTime == 0){
                                alert("자막 '"+cont_name+"' 의 실행 시간을 설정 해 주세요.");
                                closeLayerPopup('popControlSave');
                                return;
                            }
                            if(control_name[0] == 'w' && playTime == 0){
                                alert("웹 '"+cont_name+"' 의 실행 시간을 설정 해 주세요.");
                                closeLayerPopup('popControlSave');
                                return;
                            }
                            if(control_name[0] == 'l' && playTime == 0){
                                alert("라이브 '"+cont_name+"' 의 실행 시간을 설정 해 주세요.");
                                closeLayerPopup('popControlSave');
                                return;
                            }
                            if(control_name[0] == 'g' && playTime == 0){
                                alert("그룹 '"+cont_name+"' 의 실행 시간을 설정 해 주세요.");
                                closeLayerPopup('popControlSave');
                                return;
                            }

                        }
                    }

                    //  Control 데이타 저장
                    $.ajax({
                        contentType: false,
                        processData: false,
                        type: "POST",
                        url: "/control/insert",
                        data:form_data,
                        success : function(json) {
                            var result = json;
                            console.log("완료")
                            console.log("Control ID ["+result.cotrol_id+"]")
                            console.log("detail_id_list ID ["+result.detail_id_list+"]")

                            id_list = result.detail_id_list;
                            var arrString = id_list.join(",");

                            registerContents(arrString);
                            reSizeStage(width, height, screenRatioX, screenRatioY);
                            save_list_renewal();
                        },
                        error: function(){
                            alert("상세 조회시 에러가 발생했습니다.");
                        }
                    });

				},
				error : function(data) {
                    var screen_obj = JSON.parse(data.responseText);
                    alert(screen_obj.resultString); 
                }
			});
		});

        // close POPUP
        closeLayerPopup('popControlSave');
    });

    // 현재 control ID 확인 해서 해당 control 삭제 함
    $("#delControl").click(function(){
        if(group_seq_now == '0101'){
            alert("슈퍼관리자는 화면디자인을 삭제할 수 없습니다.")
            return false;
        }

        var nodeIdArray  = layer.find('#'+nowSelectedRecID);
        var nodedetailArray  = layer.find('#'+nowSelectedRecID+"_detail");
        // nodeId = nodeIdArray[1];
        // var find_node = layer.find('#'+find_nodeID)[0];
        $("#"+nowSelectedRecID).remove();
        $("#"+nowSelectedRecID+"_list").remove();
        nodeIdArray.remove();
        nodedetailArray.remove();
        nodeName = nowSelectedRecID.replace(/[0-9]/g, "");

        iconSelector(nodeName, false, nowSelectedRecID);
        $('#positionX').attr('disabled','true');
        $('#positionY').attr('disabled','true');
        $('#positionW').attr('disabled','true');
        $('#positionH').attr('disabled','true');
        $('#positionX').val("");
        $('#positionY').val("");
        $('#positionW').val("");
        $('#positionH').val("");
        $("#drag_button ul li").removeClass("active");
        tr.nodes([]);
        layer.draw();
    });
    
    // 해상도 직접입력 변경
    $('#sizeWidth').blur(function(){
        if($('#sizeWidth').val() < 100){
            alert("화면 사이즈가 너무 작습니다")
            $("#sizeWidth").val(100);
            $("#sizeWidth").focus();
        } else if($('#sizeWidth').val() > 3900){
            alert("화면 사이즈가 너무 큽니다")
            $("#sizeWidth").val(3900);
            $("#sizeWidth").focus();
        }
    })

    $('#sizeHeight').blur(function(){
        if($('#sizeHeight').val() < 100){
            alert("화면 사이즈가 너무 작습니다")
            $("#sizeHeight").val(100);
            $("#sizeHeight").focus();
        } else if($('#sizeHeight').val() > 3900){
            alert("화면 사이즈가 너무 큽니다")
            $("#sizeHeight").val(3900);
            $("#sizeHeight").focus();
        }        
    })

    // 저장된 Control 리스트 QUERY
    controlLoad('');

    // control 리스트 검색
    $("#btnSearch").click(function(){
        var control_nm = $("#searchText").val();

        controlLoad(control_nm);
    });


    $(document).ready(function(){	
        // GRID 체크박스 ON / OFF
        $("#chkGrid").change(function(){
            if($("#chkGrid").is(":checked")){
                console.log("GRID ON !!");
                add_grid(width, height);
                grid_check = "Y";
                var MAX_WIDTH = (width * screenRatioX);
                var MAX_HEIGHT = (height * screenRatioY);
                var resize_grid = (grid * screenRatioX);
                tr.boundBoxFunc(function (oldBoundBox, newBoundBox) {
                    if (oldBoundBox != newBoundBox && 
                        Math.abs(newBoundBox.width) < (MAX_WIDTH*1.005) && Math.abs(newBoundBox.height) < (MAX_HEIGHT*1.005)
                        && Math.abs(newBoundBox.width) > (50 * screenRatioX) && Math.abs(newBoundBox.height) > (50 * screenRatioY)) {
                        newBoundBox.x = Math.round(newBoundBox.x / resize_grid) * resize_grid;
                        newBoundBox.y = Math.round(newBoundBox.y / resize_grid) * resize_grid;    
                        newBoundBox.width = Math.round(newBoundBox.width / resize_grid) * resize_grid;
                        newBoundBox.height = Math.round(newBoundBox.height / resize_grid) * resize_grid;
                        return newBoundBox;
                    }
                        return oldBoundBox;
                    },
                );
                tr.nodes([]);
                layer.add(tr);
                layer.draw();
            } else {
                console.log("GRID OFF !!");
                var grid_node = stage.find('#grid_group');
                grid_node.remove();
                grid_check = "N";
                var MAX_WIDTH = (width * screenRatioX);
                var MAX_HEIGHT = (height * screenRatioY);
                tr.boundBoxFunc(function (oldBoundBox, newBoundBox) {
                    if (oldBoundBox != newBoundBox && 
                        Math.abs(newBoundBox.width) < (MAX_WIDTH*1.005) && Math.abs(newBoundBox.height) < (MAX_HEIGHT*1.005)
                        && Math.abs(newBoundBox.width) > (30 * screenRatioX) && Math.abs(newBoundBox.height) > (30 * screenRatioY)) {
                        
                        return newBoundBox;
                    }
                        return oldBoundBox;
                    },
                );
                tr.nodes([]);
                layer.add(tr);
                layer.draw();
            };
        });

        //화면 정렬 버튼 클릭
        $(document).on('click', '.btn_gride', function() {
            if(grid_check == "Y"){
                $("#chkGrid").trigger("click");
            }
            fit_size();
            layer.draw();
        });	
        
        //해상도 버튼 클릭
        $(document).on('click', '#btn_resolution', function() {		
            if(group_seq_now == '0101'){
                alert("슈퍼관리자는 해상도를 편집할 수 없습니다.")
                return false;
            }
            if($(this).hasClass('open') == true){
                $(this).removeClass('open');
                $('.resolution_pop').hide();
            }else{
                $(this).addClass('open');
                $('.resolution_pop').show();
                $('.btn_gride').removeClass('open');
                $('.gride_pop').hide();
            }		
        });

        //화면 해상도 안의 값들 클릭
        $(document).on('click', '.resolution_pop .btn_size', function() {		
            $('.resolution_pop .btn_size').removeClass('active');
            $(this).addClass('active');	
        });	
        
        //직접 입력의 취소 버튼 클릭
        $(document).on('click', '#clickCancel', function() {		
            $("#sizeWidth").val('');
            $("#sizeHeight").val('');
            $('#btn_resolution').click();
            // $('#btn_resolution').removeClass('open');
        });	
        
        //직접 입력의 적용 버튼 클릭
        $(document).on('click', '#clickApply', function() {	
            $('.resolution_pop .btn_size').removeClass('active');
            $("#resize_stage_select").val("all").prop("selected", true);
            $('.resolution_pop').hide();
            // $('#btn_resolution').removeClass('open');
        });	
        
        //콘텐츠 상세 열기 버튼 클릭
        $(document).on('click', '.contents_design_list .btn_conts', function() {		
            if($(this).hasClass('open') == true){
                $(this).removeClass('open');
                $(this).parent().parent().removeClass('active');	
                $(this).parent().parent().find('.contents_sub').hide();

            }else{
                $(this).addClass('open');
                $(this).parent().parent().addClass('active');	
                $(this).parent().parent().find('.contents_sub').show();

            }		
        });	
        
    });	


    // 사용자의 설정에 의한 아이콘 표출 처리
    // On load 시점에 해당 정보 Query & setting
    $.ajax({
        type: "GET",
        url: "/user/Local/search",
        processData: false,
        contentType: false,
        success: function(json) {

            var data = JSON.parse(json.data);

            if(data[0].user_M == "Y") $("#liMovie").show();
            else $("#liMovie").hide();

            if(data[0].user_I == "Y") $("#liImage").show();
            else $("#liImage").hide();

            if(data[0].user_T == "Y") $("#liTitle").show();
            else $("#liTitle").hide();

            if(data[0].user_W == "Y") $("#liWeb").show();
            else $("#liWeb").hide();

            if(data[0].user_L == "Y") $("#liLive").show();
            else $("#liLive").hide();

            if(data[0].user_G == "Y") $("#liGroup").show();
            else $("#liGroup").hide();


        },
        error: function(error) {
            console.log("ERROR : ", error.resultString);
            alert(error.responseJSON.resultString);
        }
    });



    // 불러온 디자인 수정 후 수정 버튼 눌렀을때
    $("#btnUpdateDesign").click(function(){
        tr.nodes([]);
        if(group_seq_now == '0101'){
            alert("슈퍼관리자는 화면디자인을 수정할 수 없습니다.")
            return false;
        }
        var control_cont = $("#control_position_list").children()
        control_id = $("#btnUpdateDesign").val()
        for(i = 0; i < $(control_cont).length; i++){
            var contol_contlist = $(control_cont).eq(i).attr('id')
            if($("#"+contol_contlist+"_contCNT").text() == 0){
                alert("콘텐츠를 선택 하세요")
                closeLayerPopup('popControlSave');
                return ;
            }
        }

        z_index_set();
        var id_list = "";

        var t = $("#canvas_container")[0];
		html2canvas(t).then(function(canvas) {
			var myImg = canvas.toDataURL("image/png");
			myImg = myImg.replace("data:image/png;base64,", "");

			$.ajax({
                async: false,
				type : "POST",
				data : {
					"capture" : myImg
				},
				dataType : "text",
				url : "/api/gscapture",
				success : function(data) {
                    var screen_obj = JSON.parse(data);
                    $("#control_url").val(screen_obj.cont_url);

                    var form_data = new FormData($('#formControl')[0]);
                    var form_data_contents = new FormData($('#formControlContents')[0]);
            
                    // FormData의 값 확인 (POST DATA 이용한 에외처리 )
                    var control_name = "";
                    var playTime = 0;
                    var cont_id = "";
                    var cont_name = "";

                    // Validataion / 실행 시간에 대한 예외처리 !!
                    for (var pair of form_data_contents.entries()) {
                        // 예외처리 진행
                        if(pair[0] == 'controlName')   control_name = pair[1];
                        if(pair[0] == 'cont_nm')       cont_name = pair[1];
                        if(pair[0] == 'playTime') {
                            playTime = pair[1];

                            if(control_name[0] == 'm' && playTime == 0){
                                alert("동영상 '"+cont_name+"' 의 실행 시간을 설정 해 주세요.");
                                closeLayerPopup('popControlSave');
                                return;
                            }

                            if(control_name[0] == 'i' && playTime == 0){
                                alert("이미지 '"+cont_name+"' 의 실행 시간을 설정 해 주세요.");
                                closeLayerPopup('popControlSave');
                                return;
                            }
                            if(control_name[0] == 't' && playTime == 0){
                                alert("자막 '"+cont_name+"' 의 실행 시간을 설정 해 주세요.");
                                closeLayerPopup('popControlSave');
                                return;
                            }
                            if(control_name[0] == 'w' && playTime == 0){
                                alert("웹 '"+cont_name+"' 의 실행 시간을 설정 해 주세요.");
                                closeLayerPopup('popControlSave');
                                return;
                            }
                            if(control_name[0] == 'l' && playTime == 0){
                                alert("라이브 '"+cont_name+"' 의 실행 시간을 설정 해 주세요.");
                                closeLayerPopup('popControlSave');
                                return;
                            }
                            if(control_name[0] == 'g' && playTime == 0){
                                alert("그룹 '"+cont_name+"' 의 실행 시간을 설정 해 주세요.");
                                closeLayerPopup('popControlSave');
                                return;
                            }


                        }
                    }

                    // Control 데이타 저장
                    $.ajax({
                        contentType: false,
                        processData: false,
                        type: "PUT",
                        url: "/control/update/"+control_id,
                        data: form_data,
                        success : function(json) {
                            var result = json;
                            
                            console.log("Control ID ["+result.cotrol_id+"]")
                            console.log("detail_id_list ID ["+typeof(result.detail_id_list)+"]")
                            console.log("detail_id_list ID ["+result.detail_id_list+"]")

                            id_list = result.detail_id_list;
                            var arrString = id_list.join(",");

                            registerContents(arrString);

                        },
                        error: function(){
                            alert("상세 조회시 에러가 발생했습니다.");
                        }
                    });
                },
                error : function(data) {
                    var screen_obj = JSON.parse(data.responseText);
                    console.log(screen_obj)
                    alert(screen_obj.resultString); 
                }
            });
        });
        // close POPUP
        closeLayerPopup('popControlSave');
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

        paging(totalData, dataPerPage, selectedPage);
    });
});

// 최초 Control 생성 로직 & 상태 Update ///////////////////////////////////////
function createControl(ctlNumber, node_Xposition, node_Yposition, node_width=200, node_height=200, node_index) {
    if(group_seq_now == '0101'){
        alert("슈퍼관리자는 컨트롤을 생성할 수 없습니다.")
        return false;
    }
    if(layer.find('.rect').length >= 10){
        return alert("전체 컨트롤 최대 개수입니다")
    }

    var rect_control = '';
    // id="liMovie", id="liImage", id="liTitle", id="liWeb", id="liLive", id="liGroup"

    if(ctlNumber == 2) {
        if($('#control_position_list [value=rect2]').length >=6){
            return alert("동영상 컨트롤이 최대 개수입니다")
        }

        iconSelector("movie", true, "movie"+drawCount);
        
        layer.add(new Konva.Image({
            x: node_Xposition,
            y: node_Yposition,
            width: node_width,
            height: node_height,
            fill: '#9594CD',
            name: 'rect',
            stroke : 'black',
            strokeWidth : 2,
            draggable: true,
            id:'movie'+drawCount,
            zIndex : node_index
        }));
        
        rect_control = 'movie'+drawCount;

        layer.add(new Konva.Image({
            x : node_x + (node_w/2) - 100, 
            y : node_y + (node_h/2) - 100,
            width: 200,
            height: 200,
            listening : false,
            name: 'detail',
            id: rect_control+"_detail",
            zIndex : (node_index +1)
        }));
        

        var find_node = layer.find('#'+rect_control+"_detail");
        var imgObj = new Image();
        imgObj.setAttribute('src','/static/contents/common/thumbnail/video.png');

        imgObj.onload = function(){        
            find_node.image(imgObj);       
            layer.draw();    
        };   
            
        
        var control_position_html =     "<div class='control_position' id='movie"+drawCount+"' value='rect2'>";
        control_position_html +=  "<p>";
        control_position_html +=  "	<label for='positionX'>동영상 #"+cnt_m_control+":</label>";
        control_position_html +=  "	<input type='hidden' name='control' value='movie"+drawCount+"'>";
        control_position_html +=  "	<label for='positionX'>X</label><input type='text' readOnly = true; name='rect_X' id='movie"+drawCount+"_X' placeholder='좌표'>";
        control_position_html +=  "	<label for='positionY'>Y</label><input type='text' readOnly = true; name='rect_Y' id='movie"+drawCount+"_Y' placeholder='좌표'>";
        control_position_html +=  "	<label for='positionW'>W</label><input type='text' readOnly = true; name='rect_W' id='movie"+drawCount+"_W' placeholder='넓이'>";
        control_position_html +=  "	<label for='positionH'>H</label><input type='text' readOnly = true; name='rect_H' id='movie"+drawCount+"_H' placeholder='높이'>";
        control_position_html +=  "	<label id='movie"+drawCount+"_contCNT_TXT' >콘텐츠:</label><label id='movie"+drawCount+"_contCNT' ></label>";
        control_position_html +=  "	<input type='hidden' readOnly = true; name='rect_idx' id='movie"+drawCount+"_idx'>";
        control_position_html +=  "</p>				";
        control_position_html +=  "</div>";

        $("#control_position_list").append(control_position_html);
                       
    } else if(ctlNumber == 3){
        if($('#control_position_list [value=rect3]').length >=6){
            return alert("이미지 컨트롤이 최대 개수입니다")
        }

        iconSelector("image", true, "image"+drawCount);

        layer.add(new Konva.Image({
            x: node_Xposition,
            y: node_Yposition,
            width: node_width,
            height: node_height,
            fill: '#5CC28A',
            name: 'rect',
            stroke : 'black',
            strokeWidth : 2,
            draggable: true,
            id:'image'+drawCount,
            zIndex : node_index
        }));
        rect_control = 'image'+drawCount;

        layer.add(new Konva.Image({
            x : node_x + (node_w/2) - 100, 
            y : node_y + (node_h/2) - 100,
            width: 200,
            height: 200,
            listening : false,
            name: 'detail',
            id: rect_control+"_detail",
            zIndex : (node_index +1)
        }));
        

        var find_node = layer.find('#'+rect_control+"_detail");
        var imgObj = new Image();
        imgObj.setAttribute('src','/static/contents/common/thumbnail/image.png');
        imgObj.onload = function(){        
            find_node.image(imgObj);       
            layer.draw();    
        };           

        var control_position_html =     "<div class='control_position' id='image"+drawCount+"' value='rect3'>";
        control_position_html +=  "<p>";
        control_position_html +=  "	<label for='positionX'>이미지 #"+cnt_i_control+":</label>";
        control_position_html +=  "	<input type='hidden' name='control' value='image"+drawCount+"'>";
        control_position_html +=  "	<label for='positionX'>X</label><input type='text' readOnly = true; name='rect_X' id='image"+drawCount+"_X' placeholder='좌표'>";
        control_position_html +=  "	<label for='positionY'>Y</label><input type='text' readOnly = true; name='rect_Y' id='image"+drawCount+"_Y' placeholder='좌표'>";
        control_position_html +=  "	<label for='positionW'>W</label><input type='text' readOnly = true; name='rect_W' id='image"+drawCount+"_W' placeholder='넓이'>";
        control_position_html +=  "	<label for='positionH'>H</label><input type='text' readOnly = true; name='rect_H' id='image"+drawCount+"_H' placeholder='높이'>";
        control_position_html +=  "	<label id='image"+drawCount+"_contCNT_TXT' >컨텐츠:</label><label id='image"+drawCount+"_contCNT' ></label>";
        control_position_html +=  "	<input type='hidden' readOnly = true; name='rect_idx' id='image"+drawCount+"_idx'>";
        control_position_html +=  "</p>				";
        control_position_html +=  "</div>";

        $("#control_position_list").append(control_position_html);
          
        
    }  else if(ctlNumber == 4){
        if($('#control_position_list [value=rect4]').length >=6){
            return alert("자막 컨트롤이 최대 개수입니다")
        }

        iconSelector("text", true, "text"+drawCount);

        layer.add(new Konva.Image({
            x: node_Xposition,
            y: node_Yposition,
            width: node_width,
            height: node_height,
            fill: '#E7E600',
            name: 'rect',
            stroke : 'black',
            strokeWidth : 2,
            draggable: true,
            id:'text'+drawCount,
            zIndex : node_index
        }));
        rect_control = 'text'+drawCount;

        layer.add(new Konva.Image({
            x : node_x + (node_w/2) - 100, 
            y : node_y + (node_h/2) - 100,
            width: 200,
            height: 200,
            listening : false,
            name: 'detail',
            id: rect_control+"_detail",
            zIndex : (node_index+1)
        }));
        

        var find_node = layer.find('#'+rect_control+"_detail");
        var imgObj = new Image();
        imgObj.setAttribute('src','/static/contents/common/thumbnail/txt.png');

        imgObj.onload = function(){        
            find_node.image(imgObj);       
            layer.draw();    
        };   



        var control_position_html =     "<div class='control_position' id='text"+drawCount+"' value='rect4'>";
        control_position_html +=  "<p>";
        control_position_html +=  "	<label for='positionX'>자막 #"+cnt_t_control+":</label>";
        control_position_html +=  "	<input type='hidden' name='control' value='text"+drawCount+"'>";
        control_position_html +=  "	<label for='positionX'>X</label><input type='text' readOnly = true; name='rect_X' id='text"+drawCount+"_X' placeholder='좌표'>";
        control_position_html +=  "	<label for='positionY'>Y</label><input type='text' readOnly = true; name='rect_Y' id='text"+drawCount+"_Y' placeholder='좌표'>";
        control_position_html +=  "	<label for='positionW'>W</label><input type='text' readOnly = true; name='rect_W' id='text"+drawCount+"_W' placeholder='넓이'>";
        control_position_html +=  "	<label for='positionH'>H</label><input type='text' readOnly = true; name='rect_H' id='text"+drawCount+"_H' placeholder='높이'>";
        control_position_html +=  "	<label id='text"+drawCount+"_contCNT_TXT' >컨텐츠:</label><label id='text"+drawCount+"_contCNT' ></label>";
        control_position_html +=  "	<input type='hidden' readOnly = true; name='rect_idx' id='text"+drawCount+"_idx'>";
        control_position_html +=  "</p>				";
        control_position_html +=  "</div>";

        $("#control_position_list").append(control_position_html);
       
        
    }  else if(ctlNumber == 5){
        if($('#control_position_list [value=rect5]').length >=6){
            return alert("웹 컨트롤이 최대 개수입니다")
        }

        iconSelector("web", true, "web"+drawCount);

        layer.add(new Konva.Image({
            x: node_Xposition,
            y: node_Yposition,
            width: node_width,
            height: node_height,
            fill: 'skyblue',
            name: 'rect',
            stroke : 'black',
            strokeWidth : 2,
            draggable: true,
            id:'web'+drawCount,
            zIndex : node_index
        }));

        rect_control = 'web'+drawCount;

        layer.add(new Konva.Image({
            x : node_x + (node_w/2) - 100, 
            y : node_y + (node_h/2) - 100,
            width: 200,
            height: 200,
            listening : false,
            name: 'detail',
            id: rect_control+"_detail",
            zIndex : (node_index+1)
        }));
        

        var find_node = layer.find('#'+rect_control+"_detail");
        var imgObj = new Image();
        imgObj.setAttribute('src','/static/contents/common/thumbnail/web.png');

        imgObj.onload = function(){        
            find_node.image(imgObj);       
            layer.draw();    
        };   


        var control_position_html =     "<div class='control_position' id='web"+drawCount+"' value='rect5'>";
        control_position_html +=  "<p>";
        control_position_html +=  "	<label for='positionX'>웹 #"+cnt_w_control+":</label>";
        control_position_html +=  "	<input type='hidden' name='control' value='web"+drawCount+"'>";
        control_position_html +=  "	<label for='positionX'>X</label><input type='text' readOnly = true;  name='rect_X' id='web"+drawCount+"_X' placeholder='좌표'>";
        control_position_html +=  "	<label for='positionY'>Y</label><input type='text' readOnly = true;  name='rect_Y' id='web"+drawCount+"_Y' placeholder='좌표'>";
        control_position_html +=  "	<label for='positionW'>W</label><input type='text' readOnly = true;  name='rect_W' id='web"+drawCount+"_W' placeholder='넓이'>";
        control_position_html +=  "	<label for='positionH'>H</label><input type='text' readOnly = true;  name='rect_H' id='web"+drawCount+"_H' placeholder='높이'>";
        control_position_html +=  "	<label id='web"+drawCount+"_contCNT_TXT' >컨텐츠:</label><label id='web"+drawCount+"_contCNT' ></label>";
        control_position_html +=  "	<input type='hidden' readOnly = true; name='rect_idx' id='web"+drawCount+"_idx'>";
        control_position_html +=  "</p>";
        control_position_html +=  "</div>";

        $("#control_position_list").append(control_position_html);
         
        
    }  else if(ctlNumber == 6){
        if($('#control_position_list [value=rect6]').length >=6){
            return alert("라이브 컨트롤이 최대 개수입니다")
        }

        iconSelector("live", true, "live"+drawCount);

        layer.add(new Konva.Image({
            x: node_Xposition,
            y: node_Yposition,
            width: node_width,
            height: node_height,
            fill: 'pink',
            name: 'rect',
            stroke : 'black',
            strokeWidth : 2,
            draggable: true,
            id:'live'+drawCount,
            zIndex : node_index
        }));

        rect_control = 'live'+drawCount;

        layer.add(new Konva.Image({
            x : node_x + (node_w/2) - 100, 
            y : node_y + (node_h/2) - 100,
            width: 200,
            height: 200,
            listening : false,
            name: 'detail',
            id: rect_control+"_detail",
            zIndex : (node_index+1)
        }));
        

        var find_node = layer.find('#'+rect_control+"_detail");
        var imgObj = new Image();
        imgObj.setAttribute('src','/static/contents/common/thumbnail/live.png');

        imgObj.onload = function(){        
            find_node.image(imgObj);       
            layer.draw();    
        };   


        var control_position_html =     "<div class='control_position' id='live"+drawCount+"' value='rect6'>";
        control_position_html +=  "<p>";
        control_position_html +=  "	<label for='positionX'>라이브 #"+cnt_l_control+":</label>";
        control_position_html +=  "	<input type='hidden' name='control' value='live"+drawCount+"'>";
        control_position_html +=  "	<label for='positionX'>X</label><input type='text' readOnly = true; name='rect_X' id='live"+drawCount+"_X' placeholder='좌표'>";
        control_position_html +=  "	<label for='positionY'>Y</label><input type='text' readOnly = true; name='rect_Y' id='live"+drawCount+"_Y' placeholder='좌표'>";
        control_position_html +=  "	<label for='positionW'>W</label><input type='text' readOnly = true; name='rect_W' id='live"+drawCount+"_W' placeholder='넓이'>";
        control_position_html +=  "	<label for='positionH'>H</label><input type='text' readOnly = true; name='rect_H' id='live"+drawCount+"_H' placeholder='높이'>";
        control_position_html +=  "	<label id='live"+drawCount+"_contCNT_TXT' >컨텐츠:</label><label id='live"+drawCount+"_contCNT' ></label>";
        control_position_html +=  "	<input type='hidden' readOnly = true; name='rect_idx' id='live"+drawCount+"_idx'>";
        control_position_html +=  "</p>";
        control_position_html +=  "</div>";

        $("#control_position_list").append(control_position_html);
           
        
    }  else if(ctlNumber == 7){
        if($('#control_position_list [value=rect7]').length >=6){
            return alert("그룹 컨트롤이 최대 개수입니다")
        }

        iconSelector("group", true, "group"+drawCount);

        layer.add(new Konva.Image({
            x: node_Xposition,
            y: node_Yposition,
            width: node_width,
            height: node_height,
            fill: '#FF8B7E',
            name: 'rect',
            stroke : 'black',
            strokeWidth : 2,
            draggable: true,
            id:'group'+drawCount,
            zIndex : node_index
        }));

        rect_control = 'group'+drawCount;

        layer.add(new Konva.Image({
            x : node_x + (node_w/2) - 100, 
            y : node_y + (node_h/2) - 100,
            width: 200,
            height: 200,
            listening : false,
            name: 'detail',
            id: rect_control+"_detail",
            zIndex : (node_index+1)
        }));
        

        var find_node = layer.find('#'+rect_control+"_detail");
        var imgObj = new Image();
        imgObj.setAttribute('src','/static/contents/common/thumbnail/group.png');
        
        imgObj.onload = function(){        
            find_node.image(imgObj);       
            layer.draw();    
        };  

        var control_position_html =  "<div class='control_position' id='group"+drawCount+"' value='rect7'>";
        control_position_html +=  "<p>";
        control_position_html +=  "	<label for='positionX'>그룹 #"+cnt_g_control+":</label>";
        control_position_html +=  "	<input type='hidden' name='control' value='group"+drawCount+"'>";
        control_position_html +=  "	<label for='positionX'>X</label><input type='text' readOnly = true; name='rect_X' id='group"+drawCount+"_X' placeholder='좌표'>";
        control_position_html +=  "	<label for='positionY'>Y</label><input type='text' readOnly = true; name='rect_Y' id='group"+drawCount+"_Y' placeholder='좌표'>";
        control_position_html +=  "	<label for='positionW'>W</label><input type='text' readOnly = true; name='rect_W' id='group"+drawCount+"_W' placeholder='넓이'>";
        control_position_html +=  "	<label for='positionH'>H</label><input type='text' readOnly = true; name='rect_H' id='group"+drawCount+"_H' placeholder='높이'>";
        control_position_html +=  "	<label id='group"+drawCount+"_contCNT_TXT' >컨텐츠:</label><label id='group"+drawCount+"_contCNT' ></label>";
        control_position_html +=  "	<input type='hidden' readOnly = true; name='rect_idx' id='group"+drawCount+"_idx'>";
        control_position_html +=  "</p>";
        control_position_html +=  "</div>";

        $("#control_position_list").append(control_position_html);
        
    } 
   
    nodeName = rect_control.replace(/[0-9]/g, "");
    iconSelector(nodeName, "selected", rect_control);
    var shape = stage.find('#'+rect_control);
    shape.on('transformstart', function () {
    });

    shape.on('dragmove', function () {
        if(grid_check == "Y"){
            shape[0].x(Math.round(shape[0].x() / grid) * grid);
            shape[0].y(Math.round(shape[0].y() / grid) * grid);
        }
        
        updateText(rect_control);
    });

    shape.on('transform', function () {
        shape[0].stroke("");
        updateText(rect_control);
    });

    shape.on('transformend', function () {
        shape[0].stroke("black");
        drawControl("web",rect_control);
    });

    updateText(rect_control);
    drawCount++;
    layer.draw();
};


// 화면 디자인 검색 & 리스트 만들기 ///////////////////////////////////////
function controlLoad(cont_nm) {

    $(".design_list").remove();

    // QUERY DATA SET
    $.ajax({
        type: "GET",
        url: "/control/search?cont_nm="+cont_nm,
        success : function(json) {
          
            control_list = json.data;
            totalData = control_list.length;
            $("#designCountText").text("게시물 총 "+control_list.length+" 건");

            paging(totalData, dataPerPage, 1)
        },
        error: function(){
            alert("상세 조회시 에러가 발생했습니다.");
        }
    });
}


// 컨트롤 생성시 부가적으로 생성되는 부분들 생성처리
// 컨트롤 삭제시 부가적으로 생성된 부분들 삭제처리
// 컨트롤 선택시 부가적인 활성 부분들 활성처리
function iconSelector(SelectedItem, ctrlStatus, enterSource) {

    var li_string = "";

    // Control 생성시 작업내용
    if(ctrlStatus == true) {
        // 우측상단 컨트롤 리스트에 해당 이름의 컨트롤러 세팅 하기
        ctrlStatusString = "CREATED";

        // SelectedItem : movie, type, text, web, live, group
        // <li><button type="button" class="control_btn" onClick="">이미지#1<button type="button" class="btn_delete" onClick="">삭제</button></button></li>
        // controlListRight
        if(SelectedItem == "movie"){     
            cnt_m_control += 1;

            li_string += "<li val='"+enterSource+"' id='list_"+enterSource+"'><button type='button' id='li_"+enterSource+"' class='control_btn' onClick=\"iconSelector('movie','selected', '"+enterSource+"')\">동영상 #"+cnt_m_control+"<button type='button' id='delli_"+enterSource+"' class='btn_delete' onClick=\"iconSelector('movie',false, '"+enterSource+"')\" title='컨트롤 삭제'>삭제</button></button></li>";
            $("#controlListRight").append(li_string);
            createContDiv(enterSource);
            
        } else if(SelectedItem == "image"){
            cnt_i_control += 1;

            li_string += "<li val='"+enterSource+"' id='list_"+enterSource+"'><button type='button' id='li_"+enterSource+"' class='control_btn' onClick=\"iconSelector('image','selected', '"+enterSource+"')\">이미지 #"+cnt_i_control+"<button type='button' id='delli_"+enterSource+"' class='btn_delete' onClick=\"iconSelector('image',false, '"+enterSource+"')\" title='컨트롤 삭제'>삭제</button></button></li>";
            $("#controlListRight").append(li_string);
            createContDiv(enterSource);
            
        } else if(SelectedItem == "text"){
            cnt_t_control += 1;

            li_string += "<li val='"+enterSource+"' id='list_"+enterSource+"'><button type='button' id='li_"+enterSource+"' class='control_btn' onClick=\"iconSelector('text','selected', '"+enterSource+"')\">자막 #"+cnt_t_control+"<button type='button' id='delli_"+enterSource+"' class='btn_delete' onClick=\"iconSelector('text',false, '"+enterSource+"')\" title='컨트롤 삭제'>삭제</button></button></li>";
            $("#controlListRight").append(li_string);
            createContDiv(enterSource);
            

        } else if(SelectedItem == "web"){
            cnt_w_control += 1;

            li_string += "<li val='"+enterSource+"' id='list_"+enterSource+"'><button type='button' id='li_"+enterSource+"' class='control_btn' onClick=\"iconSelector('web','selected', '"+enterSource+"')\">웹 #"+cnt_w_control+"<button type='button' id='delli_"+enterSource+"' class='btn_delete' onClick=\"iconSelector('web',false, '"+enterSource+"')\" title='컨트롤 삭제'>삭제</button></button></li>";
            $("#controlListRight").append(li_string);
            createContDiv(enterSource);
           

        } else if(SelectedItem == "live"){
            cnt_l_control += 1;

            li_string += "<li val='"+enterSource+"' id='list_"+enterSource+"'><button type='button' id='li_"+enterSource+"' class='control_btn' onClick=\"iconSelector('live','selected', '"+enterSource+"')\">라이브 #"+cnt_l_control+"<button type='button' id='delli_"+enterSource+"' class='btn_delete' onClick=\"iconSelector('live', false, '"+enterSource+"')\" title='컨트롤 삭제'>삭제</button></button></li>";
            $("#controlListRight").append(li_string);
            createContDiv(enterSource);
           

        } else if(SelectedItem == "group"){
            cnt_g_control += 1;

            li_string += "<li val='"+enterSource+"' id='list_"+enterSource+"'><button type='button' id='li_"+enterSource+"' class='control_btn' onClick=\"iconSelector('group','selected', '"+enterSource+"')\">그룹 #"+cnt_g_control+"<button type='button' id='delli_"+enterSource+"' class='btn_delete' onClick=\"iconSelector('group',false, '"+enterSource+"')\" title='컨트롤 삭제'>삭제</button></button></li>";
            $("#controlListRight").append(li_string);
            createContDiv(enterSource);
            
        }
    }

    // 컨트롤 삭제시 작동
    else if(ctrlStatus == false) {

        // 전체 삭제일 경우 처리
        if(SelectedItem == 'all'){
            $("#controlListRight").empty();
            var rect_cnt = layer.find(".rect");
            rect_cnt.remove();
            var detail_cnt = layer.find(".detail");
            detail_cnt.remove();
        }

        // 우측상단 컨트롤 리스트에 해당 이름의 컨트롤러 삭제 하기
        ctrlStatusString = "REMOVED";
        $("#"+enterSource).remove();
        $("#"+enterSource+"_list").remove();
        var nodeIdArray  = layer.find('#'+enterSource);
        var nodedetailArray  = layer.find('#'+enterSource+"_detail");
        nodeIdArray.remove();
        nodedetailArray.remove();
        $("#list_"+enterSource).remove();
        $("#drag_button ul li").removeClass("active");
        tr.nodes([]);
        layer.draw();
    }
    
    // 선택시 아이콘 작동
    else if(ctrlStatus == "selected") {
        $('#positionX').removeAttr('disabled');
        $('#positionY').removeAttr('disabled');
        $('#positionW').removeAttr('disabled');
        $('#positionH').removeAttr('disabled');
        ctrlStatusString = "SELECTED";
        
        // 우선은 모두 DISABLE 하고 아래에서 선택 함. 
        $(".contents_list_ ").hide();
        $("#drag_button ul li").removeClass("active");
        $("#controlListRight li button").removeClass("active");


        // 선택사항 1. 아이콘, 2. 우측 컨트롤 리스트 , 3.contents DIV tag 
        if(SelectedItem == "movie"){
            var new_node = layer.find('#'+enterSource)[0];
            nowSelectedRecID = enterSource;
            nodeName = nowSelectedRecID.replace(/[0-9]/g, "");
            // $("#liMovie").attr("class","active");
            $("#li_"+enterSource).attr("class","control_btn active");
            $('#'+enterSource+'_list').show();
            tr.nodes([new_node])
            tr.moveToTop();
            layer.draw();

        } else if(SelectedItem == "image"){
            var new_node = layer.find('#'+enterSource)[0];
            nowSelectedRecID = enterSource;
            nodeName = nowSelectedRecID.replace(/[0-9]/g, "");
            $("#li_"+enterSource).attr("class","control_btn active");
            $('#'+enterSource+'_list').show();
            tr.nodes([new_node]);
            tr.moveToTop();
            layer.draw();

        } else if(SelectedItem == "text"){
            var new_node = layer.find('#'+enterSource)[0];
            nowSelectedRecID = enterSource;
            nodeName = nowSelectedRecID.replace(/[0-9]/g, "");
            $("#li_"+enterSource).attr("class","control_btn active");
            $('#'+enterSource+'_list').show();
            tr.nodes([new_node])
            tr.moveToTop();
            layer.draw();

        } else if(SelectedItem == "web"){
            var new_node = layer.find('#'+enterSource)[0];
            nowSelectedRecID = enterSource;
            nodeName = nowSelectedRecID.replace(/[0-9]/g, "");
            $("#li_"+enterSource).attr("class","control_btn active");
            $('#'+enterSource+'_list').show();
            tr.nodes([new_node])
            tr.moveToTop();
            layer.draw();

        } else if(SelectedItem == "live"){
            var new_node = layer.find('#'+enterSource)[0];
            nowSelectedRecID = enterSource;
            nodeName = nowSelectedRecID.replace(/[0-9]/g, "");
            $("#li_"+enterSource).attr("class","control_btn active");
            $('#'+enterSource+'_list').show();
            tr.nodes([new_node])
            tr.moveToTop();
            layer.draw();

        } else if(SelectedItem == "group"){
            var new_node = layer.find('#'+enterSource)[0];
            nowSelectedRecID = enterSource;
            nodeName = nowSelectedRecID.replace(/[0-9]/g, "");
            $("#li_"+enterSource).attr("class","control_btn active");
            $('#'+enterSource+'_list').show();
            tr.nodes([new_node])
            tr.moveToTop();
            layer.draw();
        }
    }
}

// close Popup !! ///////////////////////////////////////
function closePopup() {
    $("#popControlSave").hide();
    $("#modal_preview").hide();

    $("#preview_container_div").html('');

    console.log("CLOSE POPUP !!!!!!!!!")

    var trCnt = $('#contents_List tr').length;

    if(trCnt > 1 ){
        var i=trCnt;

        while(i > 1){
            $("#contents_List tr:last").remove();
            i--;
        }            
    }
    // Popup close
    closeLayerPopup('popClickScheduleSend');
}

function save_list_renewal(){
    $("#control_name").val("");
    $("#control_desc").val("");
    $("#control_position_list").html("");
}

// contents ADD  button click ///////////////////////////////////////
// $("#btnContentsAdd").click(function(){
function contentsADD() {

    // alert("CONTENTS LOAD SELECT FUNCTION")
    // Modal OPEN and Query contents which selected control types matched. 
    // 현재 선택된 컨트롤의 type 알아내기

    console.log("SELECTED CONTROL NAME ["+nowSelectedRecID+"] ");

    if(nowSelectedRecID == '') {
        alert("선택된 콘트롤이 없습니다. ");
        return;
    }

    openLayerPopup('popClickScheduleSend');
   
    if(nodeName == 'movie'){
        // 동영상 (M)
        cont_tp = "M";
    }
    else if(nodeName == 'image') {
        // 이미지 (I)
        cont_tp = "I";
    }
    else if(nodeName == 'text') {
        // 자막 (T)
        cont_tp = "T";
    }
    else if(nodeName == 'web') {
        // WEB(W)
        cont_tp = "W";
    }
    else if(nodeName == 'live') {
        // LIVE(L)
        cont_tp = "L";
    }
    else if(nodeName == 'group') {
        // GROUP(G) --> All contents reading / 자막 제외한
        cont_tp = "all";
    }

    $('#contents_List').DataTable({
        "lengthChange": false,
        "destroy": true,
        "searching": false,
        "ordering": false,
        "info": false,
        "autoWidth": true,
        "processing": true,
        "serverSide": true,

        ajax : {
            "url": "/contents/search?cont_apply=&cont_yn=Y&cont_tp="+cont_tp,
            "type":"POST"
        },

        "columns": [
                { data:"row_cnt"},
                { data:"row_cnt"},
                { data: "cont_nm"},
                { data: "cont_id"},
                { data: "cont_med_tm"},
                { data: "cont_tp"},
                { data: "cont_url"},
                // { data: "cont_med_tm"},
                { data: null,
                        render: function(data, type, full, meta){
                        if(data.cont_tp == "I" || data.cont_tp == "T")  return 10
                        else  return data.cont_med_tm;
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
                            return " <img src='/static/contents/common/thumbnail/trash.png' width=50px; height=50px;/><arnold src='"+data.cont_url+"' value= "+data.cont_tp+" style='display:none;'>";
                        }else if(data.cont_tp == "T"){
                            return " <img src='/static/contents/common/thumbnail/txt.png' width=50px; height=50px;/><arnold src='"+data.cont_url+"' value= "+data.cont_tp+"  style='display:none;'>";
                        }else if(data.cont_tp == "W"){
                            return " <img src='/static/contents/common/thumbnail/web.png' width=50px; height=50px;/><arnold src='"+data.cont_url+"' value= "+data.cont_tp+"  style='display:none;'>";
                        }else if(data.cont_tp == "L"){
                            return " <img src='/static/contents/common/thumbnail/live.png' width=50px; height=50px;/><arnold src='"+data.cont_url+"' value= "+data.cont_tp+"  style='display:none;'>";
                        }else{
                            return " <img src='"+ data.cont_thu_url+"' onerror = 'this.src=`/static/contents/common/thumbnail/image.png`;' width=50px; height=50px;/><arnold src='"+data.cont_url+"' value= "+data.cont_tp+"  style='display:none;'>";
                        }
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
                'targets': 4,
                'visible':false
            }, 
            {
                'targets': 5,
                'visible':false
            }, 
            {
                'targets': 6,
                'visible':false
            }, 
            {
                "className": "text-center", "targets": "_all"
            }
        ],
        "paging": true,
        "pageLength": 5,
        "language": {
            "zeroRecords": "데이터가 존재하지 않습니다."
        },
        
        dom: "<'row'<'col-sm-6'l><'col-sm-6'f>>" +
             "<'row'<'col-sm-12'tr>>" +
             "<'row'<'col-sm-12'p>>"
    });
};

// Contetns <DIV> tag creation Function ///////////////////////////////////////
function createContDiv(didID){
    
    // <div> creation 내부 contents 는 없음. id 만 할당함.

    var innerHTML = "";

    innerHTML += "<div id='"+didID+"_list' class='contents_list_' style='display:none;'>"
    innerHTML += "    <!-- <ul class='contents_design_list' id='rect2'> --> "
    innerHTML += "    <ul class='contents_design_list' id='"+didID+"_ul' > "
    innerHTML += "  "
    innerHTML += "    </ul>"
    innerHTML += "</div>"

    $("#contentsDivArea").append(innerHTML);

    $("#"+didID+"_ul").sortable({
        cancel: 'input, button, select',
    });
    $("#"+didID+"_ul").disableSelection();

    console.log("createContDiv = ["+didID+"]")

}

// Contents <DIV> tag Delete function ///////////////////////////////////////
function destroyContDiv(didID){
    var removeID = '#'+didID;

    $(removeID).remove();
    var count_cnt_del = didID.split("_");
    console.log("destroyContDiv = ["+removeID+"]")
    console.log(count_cnt_del[0])
    $("#"+count_cnt_del[0]+"_contCNT").text(($("#"+count_cnt_del[0]+"_contCNT").text()-1))
}

// Contetns <Li> tag creation function ///////////////////////////////////////
// createContentslist(nodeName,cont_id, cont_med_tm, cont_nm );
function createContentslist(divID, cont_id, cont_med_tm, cont_nm, cont_url, cont_tp, cont_thu_url) {

    // Detail contetns items.
    var ulString = '#'+divID+"_ul";
    
    // ID 중간값의 삭제시 에러 방지용. 최대값을 가져와서 해당 li 생성시에 적용 함. 
    var idVal = 0;
    var idMax = 0;
    var idString = "";
    var idStringArray = "";
    var movie_default = ""; 
    var group_default = "";
    var image_default = ""; 
    var text_default =  "";

    $(ulString).children().each(function(){
        idString = $(this).attr('id');
        idStringArray = idString.split('_');
        idVal = parseInt(idStringArray[1]);

        if(idMax == 0) idMax = idVal;
        else if(idMax < idVal) idMax = idVal;
    });

    idMax++;

    // default 값 넣어주기 
    // Movie : 효과선택 XXX
    // Image : Fade(0701) // 10초
    // Text  : Left(0704) // 10초
    if(divID[0] == "m"){
        movie_default = "style='display: none;'";
    } 

    if(divID[0] == "i" && cont_med_tm < 1){
        image_default = "selected";
        cont_med_tm = 10;
    } else if(divID[0] == "i"){
        image_default = "selected";
    }

    if(divID[0] == "t" && cont_med_tm < 1){
        text_default = "selected";
        cont_med_tm = 10;
    } else if(divID[0] == "t"){
        text_default = "selected";
    }



    if(divID[0] == "g"){
        if(cont_tp == "M"){
            movie_default = "style='display: none;'";
            group_default = "[동영상]"
        } else if(cont_tp == "I"){
            group_default = "[이미지]"
            image_default = "selected";
        } else if(cont_tp == "T"){
            cont_thu_url = "/static/contents/common/thumbnail/txt.png"
            group_default = "[자막]"
            text_default = "selected";
        } else if(cont_tp == "W"){
            cont_thu_url = "/static/contents/common/thumbnail/web.png"
            group_default = "[웹]"
        } else if(cont_tp == "L"){
            cont_thu_url = "/static/contents/common/thumbnail/live.png"
            group_default = "[라이브]"
        } 
    } 

    if(cont_tp == "T"){
        cont_thu_url = "/static/contents/common/thumbnail/txt.png"
    } else if(cont_tp == "W"){
        cont_thu_url = "/static/contents/common/thumbnail/web.png"
    } else if(cont_tp == "L"){
        cont_thu_url = "/static/contents/common/thumbnail/live.png"
    } 
    
    var hours = Math.floor(cont_med_tm / 3600);
    var minutes = Math.floor((cont_med_tm - hours * 3600) / 60);
    var seconds = (cont_med_tm - minutes * 60) % 60;
    
    if(hours < 10){
        hours = "0" + hours;
    }
    if(minutes < 10){
        minutes = "0" + minutes;
    }
    if(seconds < 10){
        seconds = "0" + seconds;
    }


    var innerHTML = "";
    innerHTML += " <li class='' name='"+divID+"' id='"+divID+"_"+idMax+"'> ";
    innerHTML += "     <input type='hidden' name='controlName'  value='"+divID+"' >"; 
    innerHTML += "     <input type='hidden' name='cont_nm'      value='"+cont_nm+"' >";
    innerHTML += "     <div class='contents_main'> ";
    innerHTML += "         <img src='"+cont_thu_url+"' alt=''> ";
    innerHTML += "         <span class='tit movie'> ";
    innerHTML += "             <strong>"+group_default+cont_nm+"</strong> ";
    innerHTML += "             <em>"+hours+":"+minutes+":"+seconds+"</em> ";
    innerHTML += "         </span> ";	
    innerHTML += "         <button type='button' class='btn_conts' onclick='' title='상세옵션'>상세옵션 열기닫기</button> ";
    innerHTML += "         <button type='button' class='btn_delete' onclick='destroyContDiv(\""+divID+"_"+idMax+"\")' title='콘텐츠 삭제'>삭제</button> ";
    innerHTML += "     </div> ";
    innerHTML += "     <div class='contents_sub' style='display: none;'> ";
    innerHTML += "         <dl class='sub_type video'> ";
    innerHTML += "             <dt>재생시간</dt> ";
    innerHTML += "             <dd><input type='text' name='playTime_hour' id='"+divID+"_"+idMax+"_playtime_hour' value='"+hours+"'    oninput=\"check_playtime('hour', '"+divID+"_"+idMax+"_playtime')\"> :";
    innerHTML += "             <input type='text' name='playTime_min' id='"+divID+"_"+idMax+"_playtime_min'       value='"+minutes+"'  oninput=\"check_playtime('min', '"+divID+"_"+idMax+"_playtime')\"> :";
    innerHTML += "             <input type='text' name='playTime_sec' id='"+divID+"_"+idMax+"_playtime_sec'       value='"+seconds+"'  oninput=\"check_playtime('sec', '"+divID+"_"+idMax+"_playtime')\">";

    innerHTML += "              <input type='hidden' name='playTime' id='"+divID+"_"+idMax+"_playtime' value='"+cont_med_tm+"'></dd>";
    innerHTML += "             <dt "+movie_default+" >효과</dt> ";
    innerHTML += "             <dd "+movie_default+" > ";
    innerHTML += "                 <select name='playEffect' id='"+divID+"_"+idMax+"_effect' class='small'> ";
    innerHTML += "                     <option value='all' >효과선택</option> ";
    innerHTML += "                     <option value='0701'"+image_default+">fade</option> ";
    innerHTML += "                     <option value='0702' >rotate</option> ";
    innerHTML += "                     <option value='0703' >disappear</option> ";
    innerHTML += "                     <option value='0704' "+text_default+">left</option> ";
    innerHTML += "                     <option value='0705' >right</option> ";
    innerHTML += "                 </select> ";
    innerHTML += "             </dd> ";
    innerHTML += "         </dl> ";
    innerHTML += "     </div> ";
    innerHTML += "     <input type='hidden' name='cont_id'      id='"+divID+"_"+idMax+"_cont_id' value='"+cont_id+"'> ";
    innerHTML += "     <input type='hidden' name='cont_med_tm'  id='"+divID+"_"+idMax+"_cont_ded_tm' value='"+cont_med_tm+"'> ";
    innerHTML += "     <input type='hidden' name='cont_url'     id='"+divID+"_"+idMax+"_cont_url' value='"+cont_url+"'> ";
    innerHTML += "     <input type='hidden' name='cont_tp'     id='"+divID+"_"+idMax+"_cont_tp' value='"+cont_tp+"'> ";
    innerHTML += " </li> ";

    
    console.log("UlSTRING : {"+ulString+"}");
    $(ulString).append(innerHTML);
}

// checkbox 확인하고 콘텐츠 세팅 함수 ///////////////////////////////////////
var checkBox = function(){

    var cont_id = "";           // contents ID  use ok
    var cont_med_tm = "";       // contents play time use ok
    var cont_nm = "";           // contents 명
    var contents_tp = "";
    var cont_url = "";
    var cont_thu_url = "";
    
    $('#contents_List tr').each(function(i) {
        
        var $chkbox = $(this).find('input[type="checkbox"]');

        // Only check rows that contain a checkbox
        if($chkbox.length) {

            var status = $chkbox.prop('checked');

            if(status) {
                if(i != 0){
                    cont_id =       $("#contents_List tr:eq("+i+") td:eq(3)").text();
                    cont_med_tm =   $("#contents_List tr:eq("+i+") td:eq(4)").text();
                    cont_nm =       $("#contents_List tr:eq("+i+") td:eq(2)").text();
                    contents_tp =   $("#contents_List tr:eq("+i+") td:eq(6) arnold").attr("value");
                    // image URL 가져오기
                    cont_url =      $("#contents_List tr:eq("+i+") td:eq(6) arnold").attr("src");
                    cont_thu_url =  $("#contents_List tr:eq("+i+") td:eq(6) img").attr("src");
                    // Contents List dynamic 생성
                    if(parseInt(cont_id) > 0) {
                        
                        createContentslist(nowSelectedRecID, cont_id, cont_med_tm, cont_nm, cont_url, contents_tp, cont_thu_url);      // div 넣기
                        console.log("CHECK BOX :"+nowSelectedRecID);
                    }

                }             
            }
        }
    });
}

// 콘텐츠 수 Count ///////////////////////////////////////
function countContents(divID) {
    var ulString = '#'+divID+"_ul";
    var liCount = $(ulString).children().length;
    return liCount;
}
    
// 콘텐츠 정보 서버 저장 ///////////////////////////////////////
function registerContents(idString) {
    // 수신 데이타 이용한 Contents 정보 전송  & 저장. 
    var form_data = new FormData($('#formControlContents')[0]);

    // form data 추가
    form_data.append("contID", idString);

    // Control Contents 데이타 저장
    $.ajax({
        contentType: false,
        processData: false,
        async : false,
        type: "POST",
        url: "/control/contents/insert",
        data:form_data,
        success : function(json) {
            var result = json;
            
            alert(result.resultString);
            // 저장된 Control 리스트 QUERY
            controlLoad('');
            // default 그리기
            reSizeStage(width, height, screenRatioX, screenRatioY);

        },
        error: function(){
            alert("상세 조회시 에러가 발생했습니다.");
        }
    });
}

// 화면크기 재생성 하기 ///////////////////////////////////////
function reSizeStage(resizeWidth, resizeHeight, ratioX, ratioY) {
    $('.direct_input').show();
    $("#btn_resolution").removeClass('open');
    cnt_m_control = 0;
    cnt_i_control = 0;
    cnt_t_control = 0;
    cnt_w_control = 0;
    cnt_l_control = 0;
    cnt_g_control = 0;

    $('.resolution_pop').hide();
    $("#controlList li").removeClass("on");

    $("#controlSave").text("저장");
    $("#controlSave").removeAttr( 'style' );
    $("#btnUpdateDesign").hide();

    $(".contents_list_ ").remove();
    $(".control_position input").val('');

    console.log("width :    ["+ resizeWidth +"]");
    console.log("height :   ["+ resizeHeight +"]");
    
    // Exist Control delete (all)
    iconSelector('all', false, 5);
    

    var bg_node = stage.find('#stagebg');
    bg_node.remove();
    var grid_node = stage.find('#grid_group');
    grid_node.remove();
    $("#contentsDivArea *").remove();
    $("#control_position_list *").remove();

    

    // 사용자 정의 적용인지 Fixed 인지 Check
    if(resizeWidth == 0){
        width =  $("#sizeWidth").val();
        height = $("#sizeHeight").val();
        ratioX = 0.5;
        ratioY = 0.5;
        if(width == "" || height == ""){
            alert("사이즈 값을 입력해주세요")
            return;
        }
        $("#sizeWidth").val('');
        $("#sizeHeight").val('');
    }else {
        width =     resizeWidth;
        height =    resizeHeight;
    }

    // 가로, 세로, 크기 별 ratio 조절
    if(width < height && height > 1100){
        ratioX = 0.27;
        ratioY = 0.27;
    } else if(width > 3000 || height > 3000){
        ratioX = 0.4;
        ratioY = 0.4;
    } else {
        ratioX = 0.5;
        ratioY = 0.5;
    }
      
    screenRatioX = ratioX;
    screenRatioY = ratioY;

    $("#screenW").val(width);
    $("#screenH").val(height);
    
    // ratio settings.
    stage.width(width * ratioX);
    stage.height(height * ratioY);
    stage.scale({ x: ratioX, y: ratioY });
    stage.draw();

    
    stage.add(layer);

    // background
    var stagebg = new Konva.Rect({
        x : 0,
        y : 0,
        width : width,
        height : height,
        listening : false,
        fill : 'grey',
        id : 'stagebg'
    })
    
    var MAX_WIDTH = (width * screenRatioX);
    var MAX_HEIGHT = (height * screenRatioX);
    // create new transformer
   
    var resize_grid = grid * screenRatioX;
    tr.boundBoxFunc(function (oldBoundBox, newBoundBox) {
        if (oldBoundBox != newBoundBox && 
            Math.abs(newBoundBox.width) < (MAX_WIDTH*1.005) && Math.abs(newBoundBox.height) < (MAX_HEIGHT*1.005)
            && Math.abs(newBoundBox.width) > (50 * screenRatioX) && Math.abs(newBoundBox.height) > (50 * screenRatioY)) {
            newBoundBox.x = Math.round(newBoundBox.x / resize_grid) * resize_grid;
            newBoundBox.y = Math.round(newBoundBox.y / resize_grid) * resize_grid;    
            newBoundBox.width = Math.round(newBoundBox.width / resize_grid) * resize_grid;
            newBoundBox.height = Math.round(newBoundBox.height / resize_grid) * resize_grid;
            return newBoundBox;
        }
            return oldBoundBox;
        },
    );
    grid_check = "Y";

    layer.add(tr);
    layer.draw();
    
    layer.add(stagebg);
    stagebg.zIndex(0);
    tr.nodes([]);
    layer.add(tr);
    layer.draw();

    $('#chkGrid').prop('checked', true);   

    add_grid(width,height);
    $("#screen_id").val(width+"X"+height);
}

// 그리드 그리기 기능 ///////////////////////////////////////
function add_grid(stagewidth, stageheight){

    console.log("grid width :    ["+ stagewidth +"]");
    console.log("grid height :   ["+ stageheight +"]");
        
    var grid_size = 0;
    
    var grid_group = new Konva.Group({
        id : "grid_group"
    });

    stagewidth = parseInt(stagewidth);
    stageheight = parseInt(stageheight);
    if(stagewidth > stageheight){
        grid_size = stagewidth / grid;
    } else {
        grid_size = stageheight / grid;
    };

    for (var i = 0; i < grid_size; i++) {   

        var height_grid = new Konva.Line({
            points :  [i * grid, 0, i * grid, stageheight],     // 세로줄   x1, y1, x2, y2
            stroke : '#ddd',
            listening: false
        });
    
        var width_grid = new Konva.Line({
            points :  [ 0, i * grid, stagewidth, i * grid],     //  가로줄   x1, y1, x2, y2
            stroke : '#ddd',
            listening: false
            });
        
        grid_group.add(height_grid);
        grid_group.add(width_grid);
    };
    layer.add(grid_group);
    
    grid_group.zIndex(1);
    layer.draw();
};

// Control List 에서 control click 시 상세내역 조회 ///////////////////////////////////////
function loadControlContents(control_id){
    if(group_seq_now == '0101'){
        alert("슈퍼관리자는 화면디자인을 수정 할 수 없습니다.")
        return false;
    }
    
    $("#controlList li").removeClass("on");
    $("#li_"+control_id).addClass("on");
    // control_ID 이용한 전체 데이타 로드
    // 콘텐츠타입( M: 동영상, I: 이미지, T:자막, W: WEB, L:Live, G:Group)
    console.log("ENTERED loadControlContents control_id = ["+ control_id +"]");
    
    $.ajax({
        contentType: false,
        processData: false,
        async : false,
        type: "GET",
        url: "control/insert?cont_id="+control_id,
        success : function(json) {

            result = JSON.parse(json.data);

            // 기존의 콘텐츠 영역을 다 지워줌. 새롭게 시작 함. 해당 DIV 밑에 요소를 모두 삭제 함. 이후에 Append 로 데이타 처리함 !!!!
            drawCount = 0;
            $("#contentsDivArea *").remove();
            $("#control_position_list *").remove();


            var ex_node_X = "-330";
            var ex_node_Y = "-330";
            var ex_node_ID = "";
            var control_count = 0;
            var sub_count = 0;
            
            var nowMode = "";
            width = result[0].screen_id.split("X")[0];
            height = result[0].screen_id.split("X")[1];
   
            reSizeStage(width, height, screenRatioX, screenRatioY);
            $("#li_"+control_id).addClass("on");

            $("#btnUpdateDesign").show();
            $("#controlSave").text("다른 이름으로 저장");
            $("#controlSave").attr("style","font-size : 10px;");

            $("#btnUpdateDesign").val(control_id);
            var grid_node = stage.find('#grid_group');
            grid_node.remove();

            add_grid(width, height);

            for (var i=0; i< result.length; i++){
                
                if(i == 0) nowMode  = result[i].control_type;
                if(nowMode != result[i].control_type) nowMode = result[i].control_type;
                
                if(nowMode == 'M') {
                    // rect2 그리기, 상태 update 해서 더이상 그리지 않게 하기. 
                    // ctr_2 = true //처음 들어온 것임.
                    if((ex_node_X != result[i].control_x && ex_node_Y != result[i].control_y) || (ex_node_X != result[i].control_x || ex_node_Y != result[i].control_y)){
                        // 새로운 노드 그리기
                        // contents 그리기
                        ex_node_X = result[i].control_x;
                        ex_node_Y = result[i].control_y;
                        ex_node_ID = 'movie'+control_count;


                        node_x = result[i].control_x;
                        node_y = result[i].control_y;
                        node_w = result[i].control_w;
                        node_h = result[i].control_h;
                        node_idx = result[i].control_idx;

                        createControl(2, node_x, node_y, node_w, node_h, node_idx);
                        

                        createContentslist('movie'+control_count, result[i].cont_id, result[i].contcon_tm, result[i].cont_nm, result[i].cont_url, result[i].cont_tp, result[i].cont_thu_url);

                        $("#movie"+control_count+"_X").val(node_x);
                        $("#movie"+control_count+"_Y").val(node_y);
                        $("#movie"+control_count+"_W").val(node_w);
                        $("#movie"+control_count+"_H").val(node_h);
                        $("#movie"+control_count+"_idx").val(node_idx);
                        $("#movie"+control_count+"_contCNT").text($("#movie"+control_count+"_ul").children().length);

                        control_count++;
                    } else {
                        // 노드에 컨트롤만 추가그리기
                        createContentslist(ex_node_ID, result[i].cont_id, result[i].contcon_tm, result[i].cont_nm, result[i].cont_url, result[i].cont_tp, result[i].cont_thu_url);
                        $("#"+ex_node_ID+"_contCNT").text($("#"+ex_node_ID+"_ul").children().length);
                    }
                   

                } else if(nowMode == 'I'){
                    // rect3 그리기, 상태 update 해서 더이상 그리지 않게 하기. 
                    // ctr_3 = true //처음 들어온 것임.
                    if((ex_node_X != result[i].control_x && ex_node_Y != result[i].control_y) || (ex_node_X != result[i].control_x || ex_node_Y != result[i].control_y)){
                        // 새로운 노드 그리기
                        // contents 그리기
                        ex_node_X = result[i].control_x;
                        ex_node_Y = result[i].control_y;
                        ex_node_ID = 'image'+control_count;


                        node_x = result[i].control_x;
                        node_y = result[i].control_y;
                        node_w = result[i].control_w;
                        node_h = result[i].control_h;
                        node_idx = result[i].control_idx;

                        createControl(3, node_x, node_y, node_w, node_h, node_idx);

                        createContentslist('image'+control_count, result[i].cont_id, result[i].contcon_tm, result[i].cont_nm, result[i].cont_url, result[i].cont_tp, result[i].cont_thu_url);   

                        $("#image"+control_count+"_X").val(node_x);
                        $("#image"+control_count+"_Y").val(node_y);
                        $("#image"+control_count+"_W").val(node_w);
                        $("#image"+control_count+"_H").val(node_h);
                        $("#image"+control_count+"_idx").val(node_idx);
                        $("#image"+control_count+"_contCNT").text($("#image"+control_count+"_ul").children().length);

                        control_count++;
                    } else {
                        // 노드에 컨트롤만 추가그리기
                        createContentslist(ex_node_ID, result[i].cont_id, result[i].contcon_tm, result[i].cont_nm, result[i].cont_url, result[i].cont_tp, result[i].cont_thu_url);
                        $("#"+ex_node_ID+"_contCNT").text($("#"+ex_node_ID+"_ul").children().length);
                    }

                } else if(nowMode == 'T'){
                    var sub_result = "";
                    $.ajax({
                        contentType: false,
                        processData: false,
                        async : false,
                        type: "POST",
                        url: "/contents/search?cont_tp="+nowMode+"&cont_id="+result[i].cont_id,
                        success : function(json) {
                
                            sub_result = json.data;
                        },
                        error: function(){
                                alert("상세 조회시 에러가 발생했습니다.");
                        }
                    });
                    // rect4 그리기, 상태 update 해서 더이상 그리지 않게 하기. 
                    // ctr_4 = true //처음 들어온 것임.
                    if((ex_node_X != result[i].control_x && ex_node_Y != result[i].control_y) || (ex_node_X != result[i].control_x || ex_node_Y != result[i].control_y)){
                        // 새로운 노드 그리기
                        // contents 그리기
                        ex_node_X = result[i].control_x;
                        ex_node_Y = result[i].control_y;
                        ex_node_ID = 'text'+control_count;


                        node_x = result[i].control_x;
                        node_y = result[i].control_y;
                        node_w = result[i].control_w;
                        node_h = result[i].control_h;
                        node_idx = result[i].control_idx;

                        createControl(4, node_x, node_y, node_w, node_h, node_idx);

                        createContentslist('text'+control_count, result[i].cont_id, result[i].contcon_tm, sub_result[0].cont_nm, sub_result[0].cont_url, result[i].cont_tp, result[i].cont_thu_url);

                        $("#text"+control_count+"_X").val(node_x);
                        $("#text"+control_count+"_Y").val(node_y);
                        $("#text"+control_count+"_W").val(node_w);
                        $("#text"+control_count+"_H").val(node_h);
                        $("#text"+control_count+"_contCNT").text($("#text"+control_count+"_ul").children().length);


                        control_count++;
                    } else {
                        // 노드에 컨트롤만 추가그리기
                        createContentslist(ex_node_ID, result[i].cont_id, result[i].contcon_tm, sub_result[0].cont_nm, sub_result[0].cont_url, result[i].cont_tp, result[i].cont_thu_url);
                        $("#"+ex_node_ID+"_contCNT").text($("#"+ex_node_ID+"_ul").children().length);
                    }
                
                } else if(nowMode == 'W'){
                    // rect5 그리기, 상태 update 해서 더이상 그리지 않게 하기. 
                    // ctr_5 = true //처음 들어온 것임.
                    if((ex_node_X != result[i].control_x && ex_node_Y != result[i].control_y) || (ex_node_X != result[i].control_x || ex_node_Y != result[i].control_y)){
                        // 새로운 노드 그리기
                        // contents 그리기
                        ex_node_X = result[i].control_x;
                        ex_node_Y = result[i].control_y;
                        ex_node_ID = 'web'+control_count;


                        node_x = result[i].control_x;
                        node_y = result[i].control_y;
                        node_w = result[i].control_w;
                        node_h = result[i].control_h;
                        node_idx = result[i].control_idx;

                        createControl(5, node_x, node_y, node_w, node_h, node_idx);

                        createContentslist('web'+control_count, result[i].cont_id, result[i].contcon_tm, result[i].cont_nm, result[i].cont_url, result[i].cont_tp, result[i].cont_thu_url);

                        $("#web"+control_count+"_X").val(node_x);
                        $("#web"+control_count+"_Y").val(node_y);
                        $("#web"+control_count+"_W").val(node_w);
                        $("#web"+control_count+"_H").val(node_h);
                        $("#web"+control_count+"_idx").val(node_idx);
                        $("#web"+control_count+"_contCNT").text($("#web"+control_count+"_ul").children().length);

                        control_count++;
                    } else {
                        // 노드에 컨트롤만 추가그리기
                        createContentslist(ex_node_ID, result[i].cont_id, result[i].contcon_tm, result[i].cont_nm, result[i].cont_url, result[i].cont_tp, result[i].cont_thu_url);
                        $("#"+ex_node_ID+"_contCNT").text($("#"+ex_node_ID+"_ul").children().length);
                    }

                } else if(nowMode == 'L') {
                    // rect6 그리기, 상태 update 해서 더이상 그리지 않게 하기. 
                    // ctr_6 = true //처음 들어온 것임.
                    if((ex_node_X != result[i].control_x && ex_node_Y != result[i].control_y) || (ex_node_X != result[i].control_x || ex_node_Y != result[i].control_y)){
                        // 새로운 노드 그리기
                        // contents 그리기
                        ex_node_X = result[i].control_x;
                        ex_node_Y = result[i].control_y;
                        ex_node_ID = 'live'+control_count;


                        node_x = result[i].control_x;
                        node_y = result[i].control_y;
                        node_w = result[i].control_w;
                        node_h = result[i].control_h;
                        node_idx = result[i].control_idx;

                        createControl(6, node_x, node_y, node_w, node_h, node_idx);

                        createContentslist('live'+control_count, result[i].cont_id, result[i].contcon_tm, result[i].cont_nm, result[i].cont_url, result[i].cont_tp, result[i].cont_thu_url);

                        $("#live"+control_count+"_X").val(node_x);
                        $("#live"+control_count+"_Y").val(node_y);
                        $("#live"+control_count+"_W").val(node_w);
                        $("#live"+control_count+"_H").val(node_h);
                        $("#live"+control_count+"_idx").val(node_idx);
                        $("#live"+control_count+"_contCNT").text($("#live"+control_count+"_ul").children().length);

                        control_count++;
                    } else {
                        // 노드에 컨트롤만 추가그리기
                        createContentslist(ex_node_ID, result[i].cont_id, result[i].contcon_tm, result[i].cont_nm, result[i].cont_url, result[i].cont_tp, result[i].cont_thu_url);
                        $("#"+ex_node_ID+"_contCNT").text($("#"+ex_node_ID+"_ul").children().length);
                    }

                } else if(nowMode == 'G') {
                    // rect7 그리기, 상태 update 해서 더이상 그리지 않게 하기. 
                    // ctr_7 = true //처음 들어온 것임.
                    if((ex_node_X != result[i].control_x && ex_node_Y != result[i].control_y) || (ex_node_X != result[i].control_x || ex_node_Y != result[i].control_y)){
                        // 새로운 노드 그리기
                        // contents 그리기
                        ex_node_X = result[i].control_x;
                        ex_node_Y = result[i].control_y;
                        ex_node_ID = 'group'+control_count;


                        node_x = result[i].control_x;
                        node_y = result[i].control_y;
                        node_w = result[i].control_w;
                        node_h = result[i].control_h;
                        node_idx = result[i].control_idx;

                        createControl(7, node_x, node_y, node_w, node_h, node_idx);
                        createContentslist('group'+control_count, result[i].cont_id, result[i].contcon_tm, result[i].cont_nm, result[i].cont_url, result[i].cont_tp, result[i].cont_thu_url);

                        $("#group"+control_count+"_X").val(node_x);
                        $("#group"+control_count+"_Y").val(node_y);
                        $("#group"+control_count+"_W").val(node_w);
                        $("#group"+control_count+"_H").val(node_h);
                        $("#group"+control_count+"_idx").val(node_idx);
                        $("#group"+control_count+"_contCNT").text($("#group"+control_count+"_ul").children().length);

                        control_count++;
                    } else {
                        // 노드에 컨트롤만 추가그리기
                        createContentslist(ex_node_ID, result[i].cont_id, result[i].contcon_tm, result[i].cont_nm, result[i].cont_url, result[i].cont_tp, result[i].cont_thu_url);
                        $("#"+ex_node_ID+"_contCNT").text($("#"+ex_node_ID+"_ul").children().length);
                    }
                }
            }


        },
        error: function(){
            alert("상세 조회시 에러가 발생했습니다.");
        }
    });

}

function deleteControlContents(control_id){
    // control_ID 이용한 전체 데이타 로드
    // 콘텐츠타입( M: 동영상, I: 이미지, T:자막, W: WEB, L:Live, G:Group)
    if(group_seq_now == '0101'){
        alert("슈퍼관리자는 컨트롤을 삭제할 수 없습니다.")
        return;
    }
    console.log("ENTERED delete ControlContents control_id = ["+ control_id +"]");

    if(!confirm("해당 화면디자인을 삭제하시겠습니까?")){return};
    
    $.ajax({
        contentType: false,
        processData: false,
        type: "DELETE",
        url: "control/delete/"+control_id,
        success : function(json) {

            result = json.resultString;


            if(result == "SUCCESS"){
                alert("화면디자인이 삭제되었습니다")
                controlLoad('');
                reSizeStage(width, height, screenRatioX, screenRatioY);
            } else if(result == 100){
                alert("배포된 내역이 있습니다")
            }
        },
        error: function(){
            alert("상세 조회시 에러가 발생했습니다.");
        }
    });

}

// resizeControl button click ///////////////////////////////////////
// 저장 데이타용 FIELD UPDATE LOGIC (2021.05.16)
function drawControl(gubun, nowSelectedRecID){

    var nodeIdArray  = layer.find('#'+nowSelectedRecID);


    if(gubun =='WEB'){
        var positionX =   parseInt($("#positionX").val());
        var positionY =   parseInt($("#positionY").val());
        var width =       parseInt($("#positionW").val());
        var height =      parseInt($("#positionH").val());
    } else {
        var positionX =   node_x;
        var positionY =   node_y;
        var width =       node_w;
        var height =      node_h;
    }

    nodeIdArray.x(positionX);
    nodeIdArray.y(positionY);
    nodeIdArray.width(width);
    nodeIdArray.height(height);

    nodeIdArray.scaleX(1);
    nodeIdArray.scaleY(1);

    layer.draw();
};

// get x,y,w,h value function
function updateText(find_nodeID) {
    if(grid_check == "Y"){
        var find_node = layer.find('#'+find_nodeID)[0];
        node_x = Math.round(find_node.x()/grid)  * grid;
        node_y = Math.round(find_node.y()/grid)  * grid;
        node_w = Math.round(find_node.width()/ grid * find_node.scaleX()) * grid;
        node_h = Math.round(find_node.height()/ grid * find_node.scaleY()) * grid;
    } else {
        var find_node = layer.find('#'+find_nodeID)[0];
        node_x = Math.round(find_node.x());
        node_y = Math.round(find_node.y());
        node_w = Math.round(find_node.width()* find_node.scaleX())
        node_h = Math.round(find_node.height()* find_node.scaleY())
    }
        
    var find_detail = layer.find('#'+find_nodeID+"_detail");
    if(node_w < 150 || node_h < 150){
        find_detail.setAttrs({
            x : node_x + (node_w/2) - 35, 
            y : node_y + (node_h/2) - 35,
            width : 70,
            height : 70
        });
    } else{
        find_detail.setAttrs({
            x : node_x + (node_w/2) - 100, 
            y : node_y + (node_h/2) - 100,
            width : 200,
            height : 200
        });
    }
   
    layer.draw();

    $("#"+find_nodeID+"_X").val(node_x);
    $("#"+find_nodeID+"_Y").val(node_y);
    $("#"+find_nodeID+"_W").val(node_w);
    $("#"+find_nodeID+"_H").val(node_h);
   
    $('#positionX').val(node_x);
    $('#positionY').val(node_y);
    $('#positionW').val(node_w);
    $('#positionH').val(node_h);

}

function fit_size(){
    var rect_cnt = layer.find(".rect");
    var find_text = [];
    for(i=0; i < rect_cnt.length ;i++){
        find_text.push(rect_cnt[i].id()[0]);
    }
    if(find_text.includes("t")){
        find_text.indexOf("t");
        rect_cnt[find_text.indexOf("t")].setAttrs({ x : 0, y : height-200, width : width, height : 200});
        updateText(rect_cnt[find_text.indexOf("t")].id());
        rect_cnt.splice(find_text.indexOf("t"), 1);
        if(rect_cnt.length == 4){
            rect_cnt[0].setAttrs({ x : 0 * width / 2,  y : 0 * (height-200) / 2,  width : width / 2, height : (height-200) / 2 });
            rect_cnt[1].setAttrs({ x : 1 * width / 2,  y : 0 * (height-200) / 2,  width : width / 2, height : (height-200) / 2 });
            rect_cnt[2].setAttrs({ x : 0 * width / 2,  y : 1 * (height-200) / 2,  width : width / 2, height : (height-200) / 2 });
            rect_cnt[3].setAttrs({ x : 1 * width / 2,  y : 1 * (height-200) / 2,  width : width / 2, height : (height-200) / 2 });
            updateText(rect_cnt[0].id());
            updateText(rect_cnt[1].id());
            updateText(rect_cnt[2].id());
            updateText(rect_cnt[3].id());
        } else if(rect_cnt.length != 1){
            for(i=0; i < rect_cnt.length ;i++){
                rect_cnt[i].setAttrs({
                    x : i * width / (rect_cnt.length),
                    y : 0,
                    width : width / (rect_cnt.length),
                    height : (height-200)
                });
                updateText(rect_cnt[i].id());
            };
        } else if(rect_cnt.length == 1){
            rect_cnt.setAttrs({
                x : 0,
                y : 0,
                width : width,
                height : (height-200)
            });
            updateText(rect_cnt[0].id());
        }
    } else{
        if(rect_cnt.length == 4){
            rect_cnt[0].setAttrs({ x : 0 * width / 2,  y : 0 * height / 2,  width : width / 2, height : height / 2 });
            rect_cnt[1].setAttrs({ x : 1 * width / 2,  y : 0 * height / 2,  width : width / 2, height : height / 2 });
            rect_cnt[2].setAttrs({ x : 0 * width / 2,  y : 1 * height / 2,  width : width / 2, height : height / 2 });
            rect_cnt[3].setAttrs({ x : 1 * width / 2,  y : 1 * height / 2,  width : width / 2, height : height / 2 });
            updateText(rect_cnt[0].id());
            updateText(rect_cnt[1].id());
            updateText(rect_cnt[2].id());
            updateText(rect_cnt[3].id());
        } else if(rect_cnt.length != 1){
            for(i=0; i < rect_cnt.length ;i++){
                rect_cnt[i].setAttrs({
                    x : i * width / (rect_cnt.length),
                    y : 0,
                    width : width / (rect_cnt.length),
                    height : height
                });
                updateText(rect_cnt[i].id());
            };
        } else if(rect_cnt.length == 1){
            rect_cnt.setAttrs({
                x : 0,
                y : 0,
                width : width,
                height : height
            });
            updateText(rect_cnt[0].id());
        }
    }
};

function genPOPUP(){

    var form_data = new FormData($('#formControl')[0]);                         // type, x, y, w, h
    var form_data_contents = new FormData($('#formControlContents')[0]);        // tm, url

    // FormData의 값 확인 (POST DATA 이용한 에외처리 )
    var control_name = "";
    var playTime = 0;
    var cont_url = "";
    var cont_tp = "";
    var cont_med_tm = 0;
    var cont_detail = [];
    var nodes = [];

    var control_cont = $("#control_position_list").children()

        for(i = 0; i < $(control_cont).length; i++){
            var contol_contlist = $(control_cont).eq(i).attr('id')
            if($("#"+contol_contlist+"_contCNT").text() == 0){
                alert("콘텐츠를 선택 하세요")
                closeLayerPopup('popControlSave');
                return ;
            }
        }

  
    // Validataion / 실행 시간에 대한 예외처리 !!
    for (var pair of form_data_contents.entries()) {
        // 예외처리 진행
        if(pair[0] == 'controlName')   control_name = pair[1];
        if(pair[0] == 'cont_nm')     cont_name = pair[1];
        if(pair[0] == 'cont_id')         cont_id = pair[1];
        if(pair[0] == 'playTime') {
            playTime = pair[1];

            if(control_name[0] == 'm' && playTime == 0){
                alert("동영상 '"+cont_name+"' 의 실행 시간을 설정 해 주세요.");
                closeLayerPopup('popControlSave');
                return;
            }
            if(control_name[0] == 'i' && playTime == 0){
                alert("이미지 '"+cont_name+"' 의 실행 시간을 설정 해 주세요.");
                closeLayerPopup('popControlSave');
                return;
            }
            if(control_name[0] == 't' && playTime == 0){
                alert("자막 '"+cont_name+"' 의 실행 시간을 설정 해 주세요.");
                closeLayerPopup('popControlSave');
                return;
            }
            if(control_name[0] == 'w' && playTime == 0){
                alert("웹 '"+cont_name+"' 의 실행 시간을 설정 해 주세요.");
                closeLayerPopup('popControlSave');
                return;
            }
            if(control_name[0] == 'l' && playTime == 0){
                alert("라이브 '"+cont_name+"' 의 실행 시간을 설정 해 주세요.");
                closeLayerPopup('popControlSave');
                return;
            }
            if(control_name[0] == 'g' && playTime == 0){
                alert("그룹 '"+cont_name+"' 의 실행 시간을 설정 해 주세요.");
                closeLayerPopup('popControlSave');
                return;
            }
        }
        if(pair[0] == "cont_med_tm")  cont_med_tm = pair[1];
        if(pair[0] == "cont_url")  cont_url = pair[1];
        if(pair[0] == "cont_tp")  cont_tp = pair[1];
        if(cont_med_tm != ""){
            if(cont_url != ""){
                if(cont_tp != ""){
                    nodes.push([control_name,playTime,cont_url, cont_tp]);
                    cont_med_tm = 0;
                    playTime = 0;
                    cont_url = "";
                    cont_tp = "";
                    control_name = "";
                }
            }
        }
    }
   
    var rect_x = "0";
    var rect_y = "0";
    var rect_w = "0";
    var rect_h = "0";
    
    

    for (var pair of form_data.entries()) {

        if(pair[0] == 'control')   control_name = pair[1];
        if(pair[0] == 'rect_X')   rect_x = pair[1];
        if(pair[0] == 'rect_Y')   rect_y = pair[1];
        if(pair[0] == 'rect_W')   {
            if(pair[1] != "") rect_w = pair[1];
        }
        if(pair[0] == 'rect_H')   {
            if(pair[1] != "") rect_h = pair[1];
        }

        if(rect_h != "0") {
            if(rect_w != ""){
                cont_detail.push([control_name,rect_x,rect_y,rect_w,rect_h])

                rect_x = "0";
                rect_y = "0";
                rect_w = "0";
                rect_h = "0";
            }
        }
    }
    
    for(i = 0; i < cont_detail.length;i++){
        if(cont_detail[i][0][0] =='g'){

            for(j = 0; j<nodes.length;j++){
                if(nodes[j][0][0] == 'g'){
                    if(cont_detail[i][0] == nodes[j][0]){
                        ex_group = nodes[j][0];
                        
                        if( nodes[j][3] == "I"){
                            cont_detail[i][0] = cont_detail[i][0].replace("g","i");
                            nodes[j][0] = nodes[j][0].replace("g","i");
                        } else if( nodes[j][3] == "M"){
                            cont_detail[i][0] = cont_detail[i][0].replace("g","m");
                            nodes[j][0] = nodes[j][0].replace("g","m");
                        } else if( nodes[j][3] == "W"){
                            cont_detail[i][0] = cont_detail[i][0].replace("g","w");
                            nodes[j][0] = nodes[j][0].replace("g","w");
                        } else if( nodes[j][3] == "L"){
                            cont_detail[i][0] = cont_detail[i][0].replace("g","l");
                            nodes[j][0] = nodes[j][0].replace("g","l");
                        } 
                    } 
                }
            }
        }
    }
    
    console.log(cont_detail);
    console.log(nodes);


    finalHTML = "    <div id='preview_top_div' style='height: "+(height * 0.5)+"px; width:  "+(width * 0.5)+"px; position: relative; '>";
    finalHTML += "      <div id='preview_container'  style='display:inline-block; z-index: 10; position: absolute;'></div>";
    finalHTML += "      <div id='preview_youtube' style='display :inline-block; z-index: 1; position: absolute;'>";
    for(i = 0; i<cont_detail.length;i++){
        if(cont_detail[i][0][0] =='l'){
            finalHTML += "   <iframe id='preview_"+cont_detail[i][0]+"_iframe' width='560px' height='315px' src='' allowfullscreen></iframe>\n";
        }
    }
    finalHTML += "      </div>";
    finalHTML += "      <div id='preview_webcon' style='display :inline-block; z-index: 0; position: absolute;'>";
    for(i = 0; i<cont_detail.length;i++){
        if(cont_detail[i][0][0] == 'w'){
            finalHTML += "   <iframe id='preview_"+cont_detail[i][0]+"_iframe' width='560' height='315' src=''   allowfullscreen></iframe>\n";
        }
    }
    
    finalHTML += "      </div>";
    finalHTML += "    </div>";
    
    finalHTML += "    <script>";
    finalHTML += "        var preview_width = "+(width * 0.5)+"; ";
    finalHTML += "        var preview_height = "+(height * 0.5)+";";
    finalHTML += "        var screenid = 1;";


    finalHTML += "        var konva_stage = document.getElementById('preview_container');";
    finalHTML += "        var youtube_div = document.getElementById('preview_youtube');";
    finalHTML += "        var web_div = document.getElementById('preview_webcon');";

    finalHTML += "        var preview_stage = new Konva.Stage({container: 'preview_container', width: preview_width, height: preview_height });";
    finalHTML += "        preview_stage.scale({ x: 0.5, y: 0.5 });";

    finalHTML += "        var preview_layer = new Konva.Layer(); preview_stage.add(preview_layer);";

    for(i = 0; i<cont_detail.length;i++){
        if(cont_detail[i][0][0] =='w'){
            finalHTML +=    "var "+cont_detail[i][0]+"path = [];";
            finalHTML +=    "var "+cont_detail[i][0]+"_tm = [];";
            finalHTML +=    "var "+cont_detail[i][0]+"_iframe = document.getElementById('preview_"+cont_detail[i][0]+"_iframe');";
            finalHTML +=    cont_detail[i][0]+"_iframe.setAttribute('style', 'display : inline-block; z-index: 0; position: absolute; left:"+(cont_detail[i][1]*0.5)+"px; top :"+(cont_detail[i][2]*0.5)+"px;');";
            finalHTML +=    cont_detail[i][0]+"_iframe.setAttribute('width', '"+(cont_detail[i][3]*0.5)+";');";
            finalHTML +=    cont_detail[i][0]+"_iframe.setAttribute('height', '"+(cont_detail[i][4]*0.5)+";');";
        } else if(cont_detail[i][0][0] =='l'){
            finalHTML +=    "var "+cont_detail[i][0]+"path = [];";
            finalHTML +=    "var "+cont_detail[i][0]+"_tm = [];";
            finalHTML +=    "var "+cont_detail[i][0]+"_iframe = document.getElementById('preview_"+cont_detail[i][0]+"_iframe');";
            finalHTML +=    cont_detail[i][0]+"_iframe.setAttribute('style', 'display : inline-block; z-index: 0; position: absolute; left:"+(cont_detail[i][1]*0.5)+"px; top :"+(cont_detail[i][2]*0.5)+"px;');";
            finalHTML +=    cont_detail[i][0]+"_iframe.setAttribute('width', '"+(cont_detail[i][3]*0.5)+";');";
            finalHTML +=    cont_detail[i][0]+"_iframe.setAttribute('height', '"+(cont_detail[i][4]*0.5)+";');";
        } else {
        finalHTML +=    "preview_layer.add(new Konva.Image({x: "+cont_detail[i][1]+", y: "+cont_detail[i][2]+", width: "+cont_detail[i][3]+", height: "+cont_detail[i][4]+", fill: 'black', id:'"+cont_detail[i][0]+"'}));";
        finalHTML +=    "var "+cont_detail[i][0]+"path = [];";
        finalHTML +=    "var "+cont_detail[i][0]+"_tm = [];";
        }
    }
    finalHTML += "        preview_layer.draw();";

    for(i = 0; i<nodes.length;i++){
        if(nodes[i][0][0] == 't'){
            var new_nodes = nodes[i][2].split('^').filter(function(e){return e});
            for(j=0;j<new_nodes.length;j++){
                finalHTML +=    nodes[i][0]+"path.push('"+new_nodes[j]+"');";
                finalHTML +=    nodes[i][0]+"_tm.push('"+(nodes[i][1]*1000)+"');";               
            }
        } else if(nodes[i][0][0] == 'g'){
        } else{
            finalHTML +=    nodes[i][0]+"path.push('"+nodes[i][2]+"');";
            finalHTML +=    nodes[i][0]+"_tm.push('"+(nodes[i][1]*1000)+"');";
        }
    }
      
    for(i = 0; i<cont_detail.length;i++){
        if(cont_detail[i][0][0] == 'm'){
            finalHTML += "       if("+cont_detail[i][0]+"path != ''){";
            finalHTML += "         var "+cont_detail[i][0]+"Obj = document.createElement('video');";
            finalHTML += "         "+cont_detail[i][0]+"Obj.muted = true;";
            finalHTML += "         var current"+cont_detail[i][0]+" = 0;";
            finalHTML += "         var "+cont_detail[i][0]+"_duration = 0;";
            finalHTML += "         var "+cont_detail[i][0]+"anim = new Konva.Animation(function () {  }, preview_layer);";
            finalHTML += "         switch"+cont_detail[i][0]+"();  ";
            finalHTML += "         var "+cont_detail[i][0]+"_loop = setTimeout(switch"+cont_detail[i][0]+", "+cont_detail[i][0]+"_duration);";
            finalHTML += "       };";

            finalHTML += "       function switch"+cont_detail[i][0]+"() {    ";
            finalHTML += "           var find_node = preview_layer.find('#'+'"+cont_detail[i][0]+"')[0];";
            finalHTML += "           "+cont_detail[i][0]+"Obj.setAttribute('src',"+cont_detail[i][0]+"path[current"+cont_detail[i][0]+"++]);";
            finalHTML += "           "+cont_detail[i][0]+"_duration = "+cont_detail[i][0]+"_tm[current"+cont_detail[i][0]+"-1];    ";
            finalHTML += "           if(current"+cont_detail[i][0]+" >= "+cont_detail[i][0]+"path.length){       ";
            finalHTML += "           current"+cont_detail[i][0]+" = 0;       ";
            finalHTML += "           };    ";
            finalHTML += "           find_node.setAttrs({ image : "+cont_detail[i][0]+"Obj });";
            finalHTML += "           preview_layer.draw();";
            finalHTML += "           "+cont_detail[i][0]+"Obj.play();";
            finalHTML += "           "+cont_detail[i][0]+"anim.start();    ";
            finalHTML += "           clearTimeout("+cont_detail[i][0]+"_loop);    ";
            finalHTML += "           "+cont_detail[i][0]+"_loop = setTimeout(switch"+cont_detail[i][0]+", "+cont_detail[i][0]+"_duration);";
            finalHTML += "       };";
        } else if(cont_detail[i][0][0] == 'i'){
            finalHTML += "     if("+cont_detail[i][0]+"path != ''){";
            finalHTML += "       var "+cont_detail[i][0]+"img = document.createElement('img');";
            finalHTML += "       var current"+cont_detail[i][0]+" = 0;";
            finalHTML += "       var "+cont_detail[i][0]+"_duration = 0;";
            finalHTML += "       switch"+cont_detail[i][0]+"();";
            finalHTML += "       var "+cont_detail[i][0]+"_loop = setTimeout(switch"+cont_detail[i][0]+", "+cont_detail[i][0]+"_duration);";
            finalHTML += "     };";
 
            finalHTML += "       function switch"+cont_detail[i][0]+"() {    ";
            finalHTML += "          var find_node = preview_layer.find('#'+'"+cont_detail[i][0]+"')[0];";
            finalHTML += "          "+cont_detail[i][0]+"img.setAttribute('src',"+cont_detail[i][0]+"path[current"+cont_detail[i][0]+"++]);    ";            
            finalHTML += "          "+cont_detail[i][0]+"_duration = "+cont_detail[i][0]+"_tm[current"+cont_detail[i][0]+"-1];    ";
            finalHTML += "          "+cont_detail[i][0]+"img.onload = function(){        ";
            finalHTML += "          if(current"+cont_detail[i][0]+" >= "+cont_detail[i][0]+"path.length)            ";
            finalHTML += "             current"+cont_detail[i][0]+" = 0;        ";
            finalHTML += "             find_node.image("+cont_detail[i][0]+"img);        ";
            finalHTML += "             preview_layer.draw();    ";
            finalHTML += "          };    ";
            finalHTML += "          clearTimeout("+cont_detail[i][0]+"_loop);    ";
            finalHTML += "          "+cont_detail[i][0]+"_loop = setTimeout(switch"+cont_detail[i][0]+", "+cont_detail[i][0]+"_duration);";
            finalHTML += "      };";

        } else if(cont_detail[i][0][0] == 't'){            
            finalHTML += "        if("+cont_detail[i][0]+"path != ''){\n";
            finalHTML += "            var find_node = preview_layer.find('#'+'"+cont_detail[i][0]+"')[0];";
            finalHTML += "            find_node.setAttr('fill','');";

            finalHTML += "            "+cont_detail[i][0]+"rect = new Konva.Label({\n";
            finalHTML += "                x: (preview_width * 2),\n";
            finalHTML += "                y: find_node.y(),\n";
            finalHTML += "                height: find_node.height()*0.9,\n";
            finalHTML += "            });\n";
                        
            finalHTML += "            "+cont_detail[i][0]+"rect.add(\n";
            finalHTML += "                new Konva.Tag({\n";
            finalHTML += "                fill: 'white',\n";
            // finalHTML += "                height: find_node.height()*0.9,\n";
            finalHTML += "                })\n";
            finalHTML += "            );\n";
                
            finalHTML += "            var "+cont_detail[i][0]+"Text = new Konva.Text({\n";
            finalHTML += "                fontSize: find_node.height() * 0.7,\n";
            finalHTML += "                verticalAlign : 'middle',\n";
            finalHTML += "                height : find_node.height(),";
            finalHTML += "                fill: 'black',\n";
            finalHTML += "                align : 'left',\n";
            finalHTML += "                padding: 10,\n";
            finalHTML += "            });\n";
            
            finalHTML += "            "+cont_detail[i][0]+"rect.add("+cont_detail[i][0]+"Text);\n";

            finalHTML += "            preview_layer.add("+cont_detail[i][0]+"rect);\n";
            

            finalHTML += "            var "+cont_detail[i][0]+"_duration = 0;\n";
            finalHTML += "            var current_"+cont_detail[i][0]+" = 0;\n";
                
            finalHTML += "            "+cont_detail[i][0]+"_slide();\n";
            finalHTML += "            var "+cont_detail[i][0]+"_loop = setTimeout("+cont_detail[i][0]+"_slide, "+cont_detail[i][0]+"_duration);\n";
            finalHTML += "        };\n";       
            
            finalHTML += "                function "+cont_detail[i][0]+"_slide(){\n";
            finalHTML += "                    var tween_"+cont_detail[i][0]+" = "+cont_detail[i][0]+"path[current_"+cont_detail[i][0]+"];\n";
            finalHTML += "                    "+cont_detail[i][0]+"_duration = "+cont_detail[i][0]+"_tm[current_"+cont_detail[i][0]+"++]\n";
            finalHTML += "                    if(current_"+cont_detail[i][0]+" >= "+cont_detail[i][0]+"path.length){\n";
            finalHTML += "                    current_"+cont_detail[i][0]+" = 0;\n";
            finalHTML += "                    }\n";
            finalHTML += "                    "+cont_detail[i][0]+"rect.x((preview_width * 2));\n";
            finalHTML += "                    "+cont_detail[i][0]+"Text.setAttrs({\n";
            finalHTML += "                        text : tween_"+cont_detail[i][0]+",\n";
            finalHTML += "                    });\n";
                        
            finalHTML += "                    var "+cont_detail[i][0]+"_animation = new Konva.Tween({\n";
            finalHTML += "                        node: "+cont_detail[i][0]+"rect,\n";
            finalHTML += "                        duration: "+cont_detail[i][0]+"_duration / 1000,\n";
            finalHTML += "                        x: 0 - width - "+cont_detail[i][0]+"rect.width(),\n";
            finalHTML += "                    });\n";

            finalHTML += "                    "+cont_detail[i][0]+"_animation.reset();\n";
            finalHTML += "                    "+cont_detail[i][0]+"_animation.play();\n";
                                    
            finalHTML += "                    clearTimeout("+cont_detail[i][0]+"_loop);    \n";
            finalHTML += "                    "+cont_detail[i][0]+"_loop = setTimeout("+cont_detail[i][0]+"_slide, "+cont_detail[i][0]+"_duration);\n";
            finalHTML += "                };\n";
            
        } else if(cont_detail[i][0][0] == 'w'){
            finalHTML += "       if("+cont_detail[i][0]+"path != ''){";

            finalHTML += "         var current"+cont_detail[i][0]+" = 0;";
            finalHTML += "         var "+cont_detail[i][0]+"_duration = 0;";
            
            finalHTML += "         switch"+cont_detail[i][0]+"();  ";
            finalHTML += "         var "+cont_detail[i][0]+"_loop = setTimeout(switch"+cont_detail[i][0]+", "+cont_detail[i][0]+"_duration);";
            finalHTML += "       };";

            finalHTML += "       function switch"+cont_detail[i][0]+"() {    ";
            finalHTML += "           "+cont_detail[i][0]+"_iframe.setAttribute('src',"+cont_detail[i][0]+"path[current"+cont_detail[i][0]+"++]);"            
            finalHTML += "           "+cont_detail[i][0]+"_duration = "+cont_detail[i][0]+"_tm[current"+cont_detail[i][0]+"-1];    ";
            finalHTML += "           if(current"+cont_detail[i][0]+" >= "+cont_detail[i][0]+"path.length){       ";
            finalHTML += "              current"+cont_detail[i][0]+" = 0;       ";
            finalHTML += "           };    ";
            finalHTML += "           clearTimeout("+cont_detail[i][0]+"_loop);    ";
            finalHTML += "           "+cont_detail[i][0]+"_loop = setTimeout(switch"+cont_detail[i][0]+", "+cont_detail[i][0]+"_duration);";
            finalHTML += "       };";
            
        }else if(cont_detail[i][0][0] == 'l'){
            finalHTML += "       if("+cont_detail[i][0]+"path != ''){";

            finalHTML += "         var current"+cont_detail[i][0]+" = 0;";
            finalHTML += "         var "+cont_detail[i][0]+"_duration = 0;";
            
            finalHTML += "         switch"+cont_detail[i][0]+"();  ";
            finalHTML += "         var "+cont_detail[i][0]+"_loop = setTimeout(switch"+cont_detail[i][0]+", "+cont_detail[i][0]+"_duration);";
            finalHTML += "       };";


            finalHTML += "       function switch"+cont_detail[i][0]+"() {    ";

            finalHTML += "            var "+cont_detail[i][0]+"_id = "+cont_detail[i][0]+"path[current"+cont_detail[i][0]+"++];";
            finalHTML += "            "+cont_detail[i][0]+"_id = "+cont_detail[i][0]+"_id.split('/');";
            finalHTML += "            "+cont_detail[i][0]+"_id = "+cont_detail[i][0]+"_id["+cont_detail[i][0]+"_id.length-1];\n";

            finalHTML += "            var "+cont_detail[i][0]+"_path = 'https://www.youtube.com/embed/playlist?loop=1&autoplay=1&mute=1&controls=0&modestbranding=1&fs=0&rel=0&iv_load_policy=3&playlist='\n";
            finalHTML += "            var "+cont_detail[i][0]+"_url = "+cont_detail[i][0]+"_path + "+cont_detail[i][0]+"_id;\n";
            finalHTML += "            "+cont_detail[i][0]+"_iframe.setAttribute('src',"+cont_detail[i][0]+"_url);"  
           
            finalHTML += "           "+cont_detail[i][0]+"_duration = "+cont_detail[i][0]+"_tm[current"+cont_detail[i][0]+"-1];    ";
            finalHTML += "           if(current"+cont_detail[i][0]+" >= "+cont_detail[i][0]+"path.length){       ";
            finalHTML += "              current"+cont_detail[i][0]+" = 0;       ";
            finalHTML += "           };    ";
            finalHTML += "           clearTimeout("+cont_detail[i][0]+"_loop);    ";
            finalHTML += "           "+cont_detail[i][0]+"_loop = setTimeout(switch"+cont_detail[i][0]+", "+cont_detail[i][0]+"_duration);";
            finalHTML += "       };";
        }else if(cont_detail[i][0][0] == 'g'){
        }
    };

    return 100;
}


function checkNumber(event) {
  if(event.key >= 0 && event.key <= 9) {
    return true;
  }
  
  return false;
}


// 화면디자인 페이징 처리
function paging(totalData, dataPerPage, currentPage){
    $("#designList").html("");
    selectedPage = currentPage;
    var totalPage = Math.ceil(totalData/dataPerPage);    // 총 페이지 수
    var startPoint = (currentPage-1)*dataPerPage;
    var endPoint = currentPage * dataPerPage;
    
    $("#paging_now").text(currentPage);
    $("#paging_total").text("/ "+totalPage);
    
    next = (currentPage+1);
    prev = (currentPage-1);

    
    li_string = "<ul class='design_list' id='controlList'>";

    for(var i = startPoint; i < endPoint; i++) {
        if(control_list[i] != undefined){
            li_string += "<li id='li_"+control_list[i].control_id+"'><button onclick='loadControlContents("+control_list[i].control_id+");' title='디자인 불러오기'><img src='"+control_list[i].control_img+"' alt=''></button>";
            li_string += "<strong>"+control_list[i].control_nm+" <button type='button' class='close' data-dismiss='modal' aria-label='Close' id='designdelete"+control_list[i].control_id+"' ";
            li_string += "onclick= 'deleteControlContents("+control_list[i].control_id+")' title='디자인 삭제'>"; 
            li_string += "<span aria-hidden='true'>&times;</span></button></strong></li>";
        }
    }
    li_string += "</ul>"

    $("#designList").append(li_string);
   
}


function check_playtime(time, id){
    var input_id = $("#"+id+"_"+time);
    var total_sec = 0;
    
    $(input_id).val($(input_id).val().replace( /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/g, '' ) );

    if(input_id.val().length > 2){
        if(input_id.val()[0] == 0){
            input_id.val(input_id.val().substr(1,2));
        } else {
            input_id.val(input_id.val().substr(0,2));    
        }
    } else if(input_id.val().length < 2 && input_id.val() != 0){
        input_id.val("0"+input_id.val())
    }

    if(time == "hour"){
        if(input_id.val() > 24){
            input_id.val(24);
        } else if(input_id.val() == "" || input_id.val() == 0){
            input_id.val("00");
        }
    } else if(time == "min"){
        if(input_id.val() > 59){
            input_id.val(59);
        } else if(input_id.val() == "" || input_id.val() == 0){
            input_id.val("00");
        }
    } else if(time == "sec"){
        if(input_id.val() > 59){
            input_id.val(59);
        } else if(input_id.val() == "" || input_id.val() == 0){
            alert("시간을 입력하세요!")
        }
    } 

    total_sec += parseInt($("#"+id+"_hour").val()) * 3600;
    total_sec += parseInt($("#"+id+"_min").val()) * 60;
    total_sec += parseInt($("#"+id+"_sec").val());
    $("#"+id).val(total_sec);

    return 
}

function z_index_set(){
    var z_index_default = 2;
    var control_all_list = $("#controlListRight").children()
    
    for(i=0; i< control_all_list.length;i++){
        console.log(control_all_list.eq(i).attr('val'))
        var find_node = layer.find("#"+control_all_list.eq(i).attr('val'))[0];
        var nodedetailArray  = layer.find('#'+control_all_list.eq(i).attr('val')+"_detail");

        find_node.zIndex(z_index_default);
        nodedetailArray.zIndex(z_index_default+1);
        $("#"+control_all_list.eq(i).attr('val')+"_idx").val(z_index_default);
        z_index_default += 2;
    }

    layer.draw();
}