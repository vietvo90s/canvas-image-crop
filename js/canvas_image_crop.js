var JCanvasImageCrop = (function (window, $) {
    var ins = {};
    
    // CANVAS: sử dụng 2 canvas là hiển thị ảnh và crop
    ins.canvasId = null;
    ins.$canvas = null;
    ins.canvas = null;
    ins.$cropCanvas = null;
    ins.cropCanvas = null;
    ins.ctx = null;
    ins.cropCtx = null;

    // IMAGE: ảnh raw cần gán nhãn đầu vào
    ins.imgUrl = null;
    ins.imageObj = null;

    // POSITION ORGINAL: vị trí box khuông trên ảnh thật không zoom
    ins.x1 = 0;
    ins.x2 = 0;
    ins.y1 = 0;
    ins.y2 = 0;
    // POSTION OFFSET: vị trí thật của khuông, tính bằng pixel con trỏ so với toạ độ top-left của canvas
    // POSITION OFFSET = POSITION ORGINAL * ZOOM
    ins.xStart = 0;
    ins.yStart = 0; // top-left của khuông
    ins.xEnd = 0;
    ins.yEnd = 0; // bottom-right của 
    // chú ý có thể việc khuông và kéo chuột không theo chiều thuận nên toạ độ end có thể nằm trên start về phía trên bên trái
    // đánh dấu
    ins.drag = false; // bắt đầu di chuột để crop
    ins.cropped = false; // đã crop một ảnh
    ins.zoomCanvas; // = 2 là phóng to 2 lần, = 1/2 là thu nhỏ 2 lần
    // các dom element        
    ins.$boxText = $('#box_text');
    // id gắn cho box trên danh sách
    ins.boxId = 0;
    // bật tắt kéo di chuyển canvas | vẽ
    ins.move_or_draw = false;

    // vẽ khung ảnh để khuông nhãn
    ins.init = function (canvasId, canvasCropId, imgUrl) {
    	ins.canvasId = canvasId;
    	ins.$canvas = $('#' + canvasId);
	    ins.canvas = ins.$canvas[0];
	    ins.$cropCanvas = $('#' + canvasCropId);
	    ins.cropCanvas = ins.$cropCanvas[0];
	    ins.ctx = ins.canvas.getContext('2d');
	    ins.cropCtx = ins.cropCanvas.getContext('2d');

        ins.setImage(imgUrl);
        ins.registerMouseEvent();
    }

    // gán ảnh raw đầu vào cần gán nhãn
    ins.setImage = function (imgUrl) {
        ins.imageObj = new Image();
        ins.imageObj.src = imgUrl;
        ins.imageObj.onload = function () { 
            $('#canvas-dimension').remove();
            $(`<p id="canvas-dimension">dimension: ${ins.imageObj.width}w x ${ins.imageObj.height}h<p>`).insertAfter(ins.$canvas);
            // 1. tỷ lệ zoom ban đầu đc gán sao cho fit với khung chứa của canvas
            ins.zoomCanvas =  $('#canvas').parent().width() / ins.imageObj.width;
            // 2. vẽ ảnh
            ins.drawImageOnCanvas();
        };
    }

    // vẽ ảnh đầu vào lên canvas, có thể dùng để vẽ lại hoặc xoá box đã khuông
    ins.drawImageOnCanvas = function () {
        ins.ctx.canvas.width = ins.imageObj.width * ins.zoomCanvas;
        ins.ctx.canvas.height = ins.imageObj.height * ins.zoomCanvas;
        ins.ctx.scale(ins.zoomCanvas, ins.zoomCanvas);
        ins.ctx.drawImage(ins.imageObj, 0, 0); 
        ins.$canvas.removeClass('hide');
    }

    // đăng ký sự kiện khi khuông trên canvas
    ins.registerMouseEvent = function () {
        ins.canvas.addEventListener('mousedown', ins.mouseDown, false);
        ins.canvas.addEventListener('mouseup', ins.mouseUp, false);
        ins.canvas.addEventListener('mousemove', ins.mouseMove, false);        
    }
    
    ins.mouseDown = function (e) {
        if (ins.move_or_draw) return;
        // e.offsetX, e.offsetY: vị trí của con trỏ so với cha relative
        ins.xStart = e.offsetX;
        ins.yStart = e.offsetY;
        ins.setPositionOrginal();
        ins.drag = true;
    }

    ins.mouseUp = function () {
        if (ins.move_or_draw) return;
        ins.drag = false;
        ins.cropRect();
    }

    ins.mouseMove = function (e) {
        $('#mouse-position').html(`x:${e.offsetY} x y:${e.offsetY}`);
        if (ins.move_or_draw) return;
        if (ins.drag) {
            ins.ctx.clearRect(0, 0, ins.canvas.width, ins.canvas.height);
            ins.ctx.drawImage(ins.imageObj, 0, 0);
            ins.xEnd = e.offsetX;
            ins.yEnd = e.offsetY;
            ins.ctx.strokeStyle = 'yellow';
            ins.setPositionOrginal();
            ins.drawBox();
        }
    }
        
    // lấy vị trí thật của canvas
    ins.setPositionOrginal = function () {
        ins.x1 = Math.min(ins.xStart, ins.xEnd) / ins.zoomCanvas;
        ins.x2 = Math.max(ins.xStart, ins.xEnd) / ins.zoomCanvas;
        ins.y1 = Math.min(ins.yStart, ins.yEnd) / ins.zoomCanvas;
        ins.y2 = Math.max(ins.yStart, ins.yEnd) / ins.zoomCanvas;

        // $('#canvas-position-orginal').html(`[x: ${ins.x1}-${ins.x2}] - [y: ${ins.y1}-${ins.y2}]`);
        // $('#canvas-position-offset').html(`[x: ${ins.xStart}-${ins.xEnd}] - [y: ${ins.yStart}-${ins.yEnd}]`);
    }

    // vẽ khuông theo vị trí orginal
    ins.drawBox = function () {
        // đầu vào của strokeRect là toạ độ orginal
        ins.ctx.strokeRect(
            // top-left
            ins.x1,
            ins.y1,
            // width-height
            ins.x2 - ins.x1,
            ins.y2 - ins.y1
        );
    }
    
    // crop ảnh đã khuông để vẽ canvas khuông
    ins.cropRect = function () {
        ins.cropCanvas.width = (ins.x2 - ins.x1) * ins.zoomCanvas;
        ins.cropCanvas.height = (ins.y2 - ins.y1) * ins.zoomCanvas;
        // drawImage từ một khung canvas này sang canvas khác nhận vào toạ độ offset hay toạ độ pixel trên màn hình khi zoom
        ins.cropCtx.drawImage(
            ins.canvas, ins.x1 * ins.zoomCanvas, ins.y1 * ins.zoomCanvas,
            ins.cropCanvas.width, ins.cropCanvas.height,
            0, 0, ins.cropCanvas.width, ins.cropCanvas.height);
        ins.$cropCanvas.removeClass('hide');
        $('#cropped_image_position').remove();
        $(`<p id="cropped_image_position">x1: ${ins.x1} >> x2: ${ins.x2} / y1: ${ins.y1} >> y2: ${ins.y2}</p>`).insertAfter(ins.$cropCanvas);
        ins.cropped = true;
    }

    // xoá khung đã khuông
    ins.clearBoxRect = function () {
        ins.drawImageOnCanvas();
        ins.cropCanvas.getContext('2d').clearRect(0, 0, ins.canvas.width, ins.canvas.height);
        ins.$cropCanvas.addClass('hide');
        ins.cropped = false;
    }

    ins.scalePercent = 20; // tăng hoặc giảm 20%
    ins.zoomIn = function () {
    	ins.zoomCanvas = ins.zoomCanvas  * (1 + ins.scalePercent / 100);
        ins.scaleCanvas();
    }

    ins.zoomOut = function () {
    	ins.zoomCanvas = ins.zoomCanvas * (1 - ins.scalePercent / 100); // tăng 20%
        ins.scaleCanvas();
    }

    ins.zoomOff = function () {
        ins.zoomCanvas = 1; // bỏ zoom
        ins.scaleCanvas();
    }

    ins.scaleCanvas = function () {
        ins.ctx.clearRect(0, 0, ins.canvas.width, ins.canvas.height);
        ins.ctx.canvas.width = ins.imageObj.width * ins.zoomCanvas;
        ins.ctx.canvas.height = ins.imageObj.height * ins.zoomCanvas;
        ins.ctx.scale(ins.zoomCanvas, ins.zoomCanvas);
        ins.ctx.drawImage(ins.imageObj, 0, 0);
    }

    return ins;
  })(window, jQuery);



