//draw.js
/*----- 以下为[绘制自定义轨迹]用到的方法 -----*/


function auto_draw_checkbox_onchange() {
    auto_change = document.getElementById("auto_draw_checkbox").checked;
}

var drawingActions = [];
var same_suofang;
function inpt_drawbtn_onClick() {
    return new Promise((resolve, reject) => {
        try {
            if (current_img_width / current_img_height > 0.5010) {
                draw_suofang = current_img_height / frameHeight;
                document.getElementById("drawpic_canvas_wrap").innerHTML = '<canvas id="drawpic_canvas" width="' + String(current_img_width) + '" height="' + String(current_img_height) + '" style="width: ' + String(Math.floor(current_img_width * (frameHeight / current_img_height))) + 'px; height: ' + String(frameHeight) + 'px;"></canvas>';
            } else {
                draw_suofang = current_img_width / frameWidth;
                document.getElementById("drawpic_canvas_wrap").innerHTML = '<canvas id="drawpic_canvas" width="' + String(current_img_width) + '" height="' + String(current_img_height) + '" style="width: ' + String(frameWidth) + 'px; height: ' + String(Math.floor(current_img_height * (frameWidth / current_img_width))) + 'px;"></canvas>';
            }
            same_suofang = draw_suofang;
            document.getElementById("drawpic_overlay").style.display = "flex";
            document.getElementById("body").style.overflow = "hidden";
            document.getElementById("body").style.height = "100%";
            document.body.addEventListener('touchmove', self.welcomeShowedListener, false);
            start_draw();

            resolve("Success");  // 如果执行成功，调用 resolve() 方法
        } catch (error) {
            reject(error);  // 如果有错误发生，调用 reject() 方法
        }
    });
}

function inpt_colorchange_checkbox_onchange() {
    bs = document.getElementById("inpt_colorchange_checkbox").checked;

    if (bs) {
        document.getElementById("bs_prop_inpt_wrap").style.display = "list-item";
        document.getElementById("inpt_bs_range_wrap").style.display = "list-item";
    } else {
        document.getElementById("bs_prop_inpt_wrap").style.display = "none";
        document.getElementById("inpt_bs_range_wrap").style.display = "none";
    }
}

function start_draw() {

    drawingActions = [];
    // if (bs) {
    //     handlePointerDown = (e) => {
    //         ctx.beginPath();
    //         ctx.lineJoin = "round";
    //         ctx.lineCap = "round";
    //         ctx.lineWidth = String(Math.floor(5 * draw_suofang));
    //         bs_pres_color = new Array(38, 201, 154);

    //         ctx.moveTo(bs_pres_x, bs_pres_y);
    //         if (drawdown == false) {
    //             draw_start_x = e.offsetX * draw_suofang;
    //             draw_start_y = e.offsetY * draw_suofang;
    //             ctx.moveTo(draw_start_x, draw_start_y);
    //             ctx.strokeStyle = "rgb(38, 201, 154)".toString();
    //         }
    //         drawdown = true;
    //         ctx.lineTo(e.offsetX * draw_suofang, e.offsetY * draw_suofang);
    //         ctx.stroke();
    //         bs_pres_x = e.offsetX * draw_suofang;
    //         bs_pres_y = e.offsetY * draw_suofang;
    //         // 保存操作
    //         drawingActions.push({
    //             action: "down",
    //             x: e.offsetX,
    //             y: e.offsetY,
    //             // ... 你可能还需要存储其他相关的数据，例如颜色，线宽等 ...
    //         });
    //     }
    if (bs) {
        handlePointerDown = (e) => {
            ctx.beginPath();
            ctx.lineJoin = "round";
            ctx.lineCap = "round";
            ctx.lineWidth = String(Math.floor(5 * draw_suofang));
            bs_pres_color = new Array(38, 201, 154);
            if (drawdown == false) {
                draw_start_x = e.offsetX * draw_suofang;
                draw_start_y = e.offsetY * draw_suofang;
                ctx.strokeStyle = "rgb(38, 201, 154)".toString();
            }
            drawdown = true;
            bs_pres_x = e.offsetX * draw_suofang;
            bs_pres_y = e.offsetY * draw_suofang;
            ctx.moveTo(e.offsetX * draw_suofang, e.offsetY * draw_suofang);
            drawingActions.push({
                action: "down",
                x: e.offsetX,
                y: e.offsetY,
            });
        }
        handlePointerMove = (e) => {
            if (drawdown) {
                if (is_bs) {
                    if (bs_now >= bs_range) {
                        is_bs = false;
                        ctx.beginPath();
                        ctx.lineJoin = "round";
                        ctx.lineCap = "round";
                        ctx.lineWidth = String(Math.floor(5 * draw_suofang));
                        ctx.moveTo(bs_pres_x, bs_pres_y);
                        ctx.lineTo(e.offsetX * draw_suofang, e.offsetY * draw_suofang);
                        var gradient = ctx.createLinearGradient(bs_pres_x, bs_pres_y, e.offsetX * draw_suofang, e.offsetY * draw_suofang);
                        gradient.addColorStop(0, "rgb(" + String(bs_pres_color[0]) + "," + String(bs_pres_color[1]) + " ," + String(bs_pres_color[2]) + " )");
                        gradient.addColorStop(1, "rgb(38, 201, 154)");
                        ctx.strokeStyle = gradient;
                        ctx.stroke();
                        bs_pres_color = new Array(38, 201, 154);
                    }
                }
                if (Math.random() < bs_prob && is_bs == false) {
                    is_bs = true;
                    rg = 2 * Math.random() - 1;
                    if (rg > 0) {
                        bs_max = new Array(Math.floor(193 * Math.pow(Math.abs(rg), 0.5)), Math.floor(-110 * Math.pow(Math.abs(rg), 0.5)), Math.floor(-66 * Math.pow(Math.abs(rg), 0.5)));
                    } else {
                        bs_max = new Array(Math.floor(27 * Math.pow(Math.abs(rg), 0.5)), Math.floor(16 * Math.pow(Math.abs(rg), 0.5)), Math.floor(94 * Math.pow(Math.abs(rg), 0.5)));
                    }
                    bs_range = bs_range_min + Math.floor((bs_range_max - bs_range_min) * Math.random());
                    bs_now = 0;
                }
                if (is_bs) {
                    ctx.beginPath();
                    ctx.lineJoin = "round";
                    ctx.lineCap = "round";
                    ctx.lineWidth = String(Math.floor(5 * draw_suofang));
                    ctx.moveTo(bs_pres_x, bs_pres_y);
                    var bs_now_color = new Array(Math.floor(38 + (4 * bs_max[0] * bs_now / bs_range) * (1 - bs_now / bs_range)), Math.floor(201 + (4 * bs_max[1] * bs_now / bs_range) * (1 - bs_now / bs_range)), Math.floor(154 + (4 * bs_max[2] * bs_now / bs_range) * (1 - bs_now / bs_range)))
                    var gradient = ctx.createLinearGradient(bs_pres_x, bs_pres_y, e.offsetX * draw_suofang, e.offsetY * draw_suofang);
                    gradient.addColorStop(0, "rgb(" + String(bs_pres_color[0]) + "," + String(bs_pres_color[1]) + " ," + String(bs_pres_color[2]) + " )");
                    gradient.addColorStop(1, "rgb(" + String(bs_now_color[0]) + "," + String(bs_now_color[1]) + " ," + String(bs_now_color[2]) + " )");
                    ctx.strokeStyle = gradient;
                    ctx.lineTo(e.offsetX * draw_suofang, e.offsetY * draw_suofang);
                    ctx.stroke();
                    bs_pres_color = bs_now_color;
                    bs_now += 1
                } else {
                    ctx.lineTo(e.offsetX * draw_suofang, e.offsetY * draw_suofang);
                    ctx.strokeStyle = "rgb(38, 201, 154)".toString();
                    ctx.stroke();
                }
                bs_pres_x = e.offsetX * draw_suofang;
                bs_pres_y = e.offsetY * draw_suofang;
                drawingActions.push({
                    action: "move",
                    x: e.offsetX,
                    y: e.offsetY,
                });
            }
        }
        handlePointerUp = (e) => {
            draw_end_x = e.offsetX * draw_suofang;
            draw_end_y = e.offsetY * draw_suofang;
            var startIMG = new Image();
            var endIMG = new Image();
            startIMG.src = start_sign_src;
            endIMG.src = end_sign_src;
            startIMG.onload = function () {
                ctx.drawImage(startIMG, Math.floor(draw_start_x - 15 * draw_suofang), Math.floor(draw_start_y - 22 * draw_suofang), Math.floor(30 * draw_suofang), Math.floor(30 * draw_suofang));
            }
            endIMG.onload = function () {
                ctx.drawImage(endIMG, Math.floor(draw_end_x - 15 * draw_suofang), Math.floor(draw_end_y - 22 * draw_suofang), Math.floor(30 * draw_suofang), Math.floor(30 * draw_suofang));
            }
            convasData = ctx.getImageData(0, 0, canvas.offsetWidth, canvas.offsetHeight);
            drawdown = false;
            restorePointer();
            drawingActions.push({
                action: "up",
                x: e.offsetX,
                y: e.offsetY,
            });
        }
    } else {
        handlePointerDown = (e) => {
            drawingActions = [];
            ctx.beginPath();
            if (drawdown == false) {
                draw_start_x = e.offsetX * draw_suofang;
                draw_start_y = e.offsetY * draw_suofang;
            }
            drawdown = true;
            ctx.moveTo(e.offsetX * draw_suofang, e.offsetY * draw_suofang);
            drawingActions.push({
                action: "down",
                x: e.offsetX,
                y: e.offsetY,
                //... 其他需要保存的参数 ...
            });
        }
        handlePointerMove = (e) => {
            if (drawdown) {
                ctx.lineTo(e.offsetX * draw_suofang, e.offsetY * draw_suofang);
                ctx.strokeStyle = "rgb(38, 201, 154)".toString();
                ctx.lineJoin = "round";
                ctx.lineCap = "round";
                ctx.lineWidth = String(parseInt(5 * draw_suofang));
                ctx.stroke();
                drawingActions.push({
                    action: "move",
                    x: e.offsetX,
                    y: e.offsetY,
                    //... 其他需要保存的参数 ...
                });
            }
        }
        handlePointerUp = (e) => {
            draw_end_x = e.offsetX * draw_suofang;
            draw_end_y = e.offsetY * draw_suofang;
            drawingActions.push({
                action: "up",
                x: e.offsetX,
                y: e.offsetY,
                //... 其他需要保存的参数 ...
            });
            var startIMG = new Image();
            var endIMG = new Image();
            startIMG.src = start_sign_src;
            endIMG.src = end_sign_src;
            startIMG.onload = function () {
                ctx.drawImage(startIMG, parseInt(draw_start_x - 15 * draw_suofang), parseInt(draw_start_y - 22 * draw_suofang), parseInt(30 * draw_suofang), parseInt(30 * draw_suofang));
            }
            endIMG.onload = function () {
                ctx.drawImage(endIMG, parseInt(draw_end_x - 15 * draw_suofang), parseInt(draw_end_y - 22 * draw_suofang), parseInt(30 * draw_suofang), parseInt(30 * draw_suofang));
            }
            convasData = ctx.getImageData(0, 0, canvas.offsetWidth, canvas.offsetHeight);
            drawdown = false;
            restorePointer();
        }
    }
    canvas = document.getElementById('drawpic_canvas');
    ctx = canvas.getContext('2d');
    var bgIMG = new Image();
    if (use_default_bg) {
        bgIMG.src = default_bgSRC[1];
    } else {
        bgIMG.src = bgSRC;
    }
    bgIMG.onload = function () {
        ctx.drawImage(bgIMG, 0, 0, current_img_width, current_img_height);
        drawdown = false;
        is_bs = false;
        convasData = null;
        canvas.addEventListener('pointerdown', handlePointerDown);
        canvas.addEventListener('pointermove', handlePointerMove);
        canvas.addEventListener('pointerup', handlePointerUp);
    }
}


// function saveDrawingToFile() {
//     const jsonString = JSON.stringify(drawingActions);
//     const blob = new Blob([jsonString], { type: "application/json" });
//     const a = document.createElement("a");
//     document.body.appendChild(a);
//     a.href = URL.createObjectURL(blob);
//     a.download = "drawingActions.json";
//     a.click();
//     document.body.removeChild(a);
//     URL.revokeObjectURL(a.href);
// }

function getRandomShiftValue(maxShift) {
    // 获取一个 -maxShift 到 +maxShift 的随机值
    return (Math.random() * (maxShift * 2) - maxShift);
}
// function Json2Draw_old(jsonFile = 'https://tool.joytion.cn/generate-track') {
//     var draw_suofang = same_suofang;
//     fetch(jsonFile)
//         .then(response => response.json())
//         .then(data => {
//             canvas = document.getElementById('drawpic_canvas');
//             ctx = canvas.getContext('2d');
//             let bgIMG = new Image();
//             bgIMG.src = use_default_bg ? default_bgSRC[1] : bgSRC;
//             bgIMG.onload = function () {
//                 ctx.drawImage(bgIMG, 0, 0, current_img_width, current_img_height);
//                 let processedCoords = []; // 这个数组用于存储已处理的坐标点
//                 let endCoords = null; // 声明一个变量来存储终点坐标
//                 // Process drawing instructions
//                 data.forEach((item, index) => { // 注意这里我们增加了一个索引
//                     let { action, x, y } = item;
//                     x *= draw_suofang;
//                     y *= draw_suofang;
//                     x -= 32;
//                     y += 38;
//                     x += getRandomShiftValue(3);
//                     y += getRandomShiftValue(1);
//                     switch (action) {
//                         case 'down':
//                             ctx.beginPath();
//                             ctx.strokeStyle = "rgb(38, 201, 154)";
//                             ctx.lineJoin = "round";
//                             ctx.lineCap = "round";
//                             ctx.lineWidth = 5 * draw_suofang;
//                             bs_pres_color = new Array(38, 201, 154);
//                             ctx.moveTo(x, y);
//                             draw_start_x = x;
//                             draw_start_y = y;
//                             // console.log("moveto", x, y);
//                             bs_pres_x = x;
//                             bs_pres_y = y;
//                             break;

//                         case 'move':
//                             if (is_bs && bs_now >= bs_range) {
//                                 is_bs = false;
//                                 ctx.beginPath();
//                                 ctx.lineJoin = "round";
//                                 ctx.lineCap = "round";
//                                 ctx.lineWidth = String(Math.floor(5 * draw_suofang));
//                                 ctx.moveTo(bs_pres_x, bs_pres_y);
//                                 ctx.lineTo(x, y);
//                                 var gradient = ctx.createLinearGradient(bs_pres_x, bs_pres_y, x, y);
//                                 gradient.addColorStop(0, "rgb(" + String(bs_pres_color[0]) + "," + String(bs_pres_color[1]) + " ," + String(bs_pres_color[2]) + " )");
//                                 gradient.addColorStop(1, "rgb(38, 201, 154)");
//                                 ctx.strokeStyle = gradient;
//                                 ctx.stroke();
//                                 bs_pres_color = new Array(38, 201, 154);

//                                 // console.log("line", x, y);
//                             }
//                             if (is_bs == false && Math.random() < bs_prob && index < data.length - 15) {
//                                 is_bs = true;
//                                 rg = 2 * Math.random() - 1;
//                                 if (rg > 0) {
//                                     bs_max = new Array(Math.floor(193 * Math.pow(Math.abs(rg), 0.5)), Math.floor(-110 * Math.pow(Math.abs(rg), 0.5)), Math.floor(-66 * Math.pow(Math.abs(rg), 0.5)));
//                                 } else {
//                                     bs_max = new Array(Math.floor(27 * Math.pow(Math.abs(rg), 0.5)), Math.floor(16 * Math.pow(Math.abs(rg), 0.5)), Math.floor(94 * Math.pow(Math.abs(rg), 0.5)));
//                                 }
//                                 bs_range = bs_range_min + Math.floor((bs_range_max - bs_range_min) * Math.random());
//                                 bs_now = 0;
//                             }
//                             if (is_bs) {
//                                 ctx.beginPath();
//                                 ctx.lineJoin = "round";
//                                 ctx.lineCap = "round";
//                                 ctx.lineWidth = String(Math.floor(5 * draw_suofang));
//                                 ctx.moveTo(bs_pres_x, bs_pres_y);
//                                 var bs_now_color = new Array(Math.floor(38 + (4 * bs_max[0] * bs_now / bs_range) * (1 - bs_now / bs_range)), Math.floor(201 + (4 * bs_max[1] * bs_now / bs_range) * (1 - bs_now / bs_range)), Math.floor(154 + (4 * bs_max[2] * bs_now / bs_range) * (1 - bs_now / bs_range)))
//                                 // console.log(bs_pres_x, bs_pres_y, e.offsetX, e.offsetY, draw_suofang);
//                                 var gradient = ctx.createLinearGradient(bs_pres_x, bs_pres_y, x, y);

//                                 gradient.addColorStop(0, "rgb(" + String(bs_pres_color[0]) + "," + String(bs_pres_color[1]) + " ," + String(bs_pres_color[2]) + " )");
//                                 gradient.addColorStop(1, "rgb(" + String(bs_now_color[0]) + "," + String(bs_now_color[1]) + " ," + String(bs_now_color[2]) + " )");
//                                 ctx.strokeStyle = gradient;
//                                 ctx.lineTo(x, y);
//                                 ctx.stroke();
//                                 bs_pres_color = bs_now_color;
//                                 // 如果是在最后15个坐标内，并且bs_now没有超出bs_range
//                                 if (index >= data.length - 15 && bs_now < bs_range) {
//                                     bs_now += 3;
//                                 } else {
//                                     bs_now += 1;
//                                 }
//                             } else {
//                                 ctx.lineTo(x, y);
//                                 ctx.strokeStyle = "rgb(38, 201, 154)".toString();
//                                 ctx.stroke();
//                             }

//                             bs_pres_x = x;
//                             bs_pres_y = y;
//                             break;

//                         case 'up':
//                             // Store the 'up' action coordinates as the end coordinates
//                             endCoords = { x, y };
//                             break;

//                     }
//                     processedCoords.push({ x, y });
//                 });

//                 var startIMG = new Image();
//                 var endIMG = new Image();

//                 // 只设置一次src，避免重复触发onload事件
//                 startIMG.src = start_sign_src;
//                 endIMG.src = end_sign_src;

//                 startIMG.onload = function () {
//                     // 绘制起点图标
//                     ctx.drawImage(startIMG, Math.round(draw_start_x - 15 * draw_suofang), Math.round(draw_start_y - 22 * draw_suofang), Math.round(30 * draw_suofang), Math.round(30 * draw_suofang));

//                     // // 确保终点图标在起点图标之后绘制
//                     // endIMG.onload = function () {
//                     //     // 选择一个随机坐标作为终点
//                     //     let randomIndex = Math.floor(Math.random() * processedCoords.length);
//                     //     let randomCoord = processedCoords[randomIndex];
//                     //     ctx.drawImage(endIMG, Math.round(randomCoord.x - 15 * draw_suofang), Math.round(randomCoord.y - 22 * draw_suofang), Math.round(30 * draw_suofang), Math.round(30 * draw_suofang));
//                     //     resolve(); // 仅在所有图标都已绘制完成后调用resolve
//                     // };
//                     endIMG.onload = function () {
//                         // If we have end coordinates, use them; otherwise, default to the last coordinate
//                         let finalCoord = endCoords || processedCoords[processedCoords.length - 1];
//                         ctx.drawImage(endIMG, Math.round(finalCoord.x - 15 * draw_suofang), Math.round(finalCoord.y - 22 * draw_suofang), Math.round(30 * draw_suofang), Math.round(30 * draw_suofang));
//                         resolve(); // Resolve after drawing end sign
//                     };
//                     // 如果终点图标已经加载，立即绘制它
//                     if (endIMG.complete) {
//                         endIMG.onload();
//                     }
//                 };

//                 startIMG.onerror = reject;
//                 endIMG.onerror = reject;
//                 canvas.crossOrigin = "anonymous";
//             };

//         });
// }

function Json2Draw(jsonFile = 'https://tool.joytion.cn/generate-track') {
    return new Promise((resolve, reject) => {
        var draw_suofang = same_suofang;
        fetch(jsonFile)
            .then(response => response.json())
            .then(data => {
                canvas = document.getElementById('drawpic_canvas');
                ctx = canvas.getContext('2d');
                let bgIMG = new Image();
                bgIMG.src = use_default_bg ? default_bgSRC[1] : bgSRC;
                bgIMG.onload = function () {
                    ctx.drawImage(bgIMG, 0, 0, current_img_width, current_img_height);
                    let processedCoords = []; // 这个数组用于存储已处理的坐标点
                    let endCoords = null; // 声明一个变量来存储终点坐标
                    // Process drawing instructions
                    data.forEach((item, index) => { // 注意这里我们增加了一个索引
                        let { action, x, y } = item;
                        x *= draw_suofang;
                        y *= draw_suofang;
                        x -= 32;
                        y += 38;
                        x += getRandomShiftValue(3);
                        y += getRandomShiftValue(1);
                        switch (action) {
                            case 'down':
                                ctx.beginPath();
                                ctx.strokeStyle = "rgb(38, 201, 154)";
                                ctx.lineJoin = "round";
                                ctx.lineCap = "round";
                                ctx.lineWidth = 5 * draw_suofang;
                                bs_pres_color = new Array(38, 201, 154);
                                ctx.moveTo(x, y);
                                draw_start_x = x;
                                draw_start_y = y;
                                // console.log("moveto", x, y);
                                bs_pres_x = x;
                                bs_pres_y = y;
                                break;

                            case 'move':
                                if (is_bs && bs_now >= bs_range) {
                                    is_bs = false;
                                    ctx.beginPath();
                                    ctx.lineJoin = "round";
                                    ctx.lineCap = "round";
                                    ctx.lineWidth = String(Math.floor(5 * draw_suofang));
                                    ctx.moveTo(bs_pres_x, bs_pres_y);
                                    ctx.lineTo(x, y);
                                    var gradient = ctx.createLinearGradient(bs_pres_x, bs_pres_y, x, y);
                                    gradient.addColorStop(0, "rgb(" + String(bs_pres_color[0]) + "," + String(bs_pres_color[1]) + " ," + String(bs_pres_color[2]) + " )");
                                    gradient.addColorStop(1, "rgb(38, 201, 154)");
                                    ctx.strokeStyle = gradient;
                                    ctx.stroke();
                                    bs_pres_color = new Array(38, 201, 154);

                                    // console.log("line", x, y);
                                }
                                if (is_bs == false && Math.random() < bs_prob && index < data.length - 15) {
                                    is_bs = true;
                                    rg = 2 * Math.random() - 1;
                                    if (rg > 0) {
                                        bs_max = new Array(Math.floor(193 * Math.pow(Math.abs(rg), 0.5)), Math.floor(-110 * Math.pow(Math.abs(rg), 0.5)), Math.floor(-66 * Math.pow(Math.abs(rg), 0.5)));
                                    } else {
                                        bs_max = new Array(Math.floor(27 * Math.pow(Math.abs(rg), 0.5)), Math.floor(16 * Math.pow(Math.abs(rg), 0.5)), Math.floor(94 * Math.pow(Math.abs(rg), 0.5)));
                                    }
                                    bs_range = bs_range_min + Math.floor((bs_range_max - bs_range_min) * Math.random());
                                    bs_now = 0;
                                }
                                if (is_bs) {
                                    ctx.beginPath();
                                    ctx.lineJoin = "round";
                                    ctx.lineCap = "round";
                                    ctx.lineWidth = String(Math.floor(5 * draw_suofang));
                                    ctx.moveTo(bs_pres_x, bs_pres_y);
                                    var bs_now_color = new Array(Math.floor(38 + (4 * bs_max[0] * bs_now / bs_range) * (1 - bs_now / bs_range)), Math.floor(201 + (4 * bs_max[1] * bs_now / bs_range) * (1 - bs_now / bs_range)), Math.floor(154 + (4 * bs_max[2] * bs_now / bs_range) * (1 - bs_now / bs_range)))
                                    // console.log(bs_pres_x, bs_pres_y, e.offsetX, e.offsetY, draw_suofang);
                                    var gradient = ctx.createLinearGradient(bs_pres_x, bs_pres_y, x, y);

                                    gradient.addColorStop(0, "rgb(" + String(bs_pres_color[0]) + "," + String(bs_pres_color[1]) + " ," + String(bs_pres_color[2]) + " )");
                                    gradient.addColorStop(1, "rgb(" + String(bs_now_color[0]) + "," + String(bs_now_color[1]) + " ," + String(bs_now_color[2]) + " )");
                                    ctx.strokeStyle = gradient;
                                    ctx.lineTo(x, y);
                                    ctx.stroke();
                                    bs_pres_color = bs_now_color;
                                    // 如果是在最后15个坐标内，并且bs_now没有超出bs_range
                                    if (index >= data.length - 15 && bs_now < bs_range) {
                                        bs_now += 3;
                                    } else {
                                        bs_now += 1;
                                    }
                                } else {
                                    ctx.lineTo(x, y);
                                    ctx.strokeStyle = "rgb(38, 201, 154)".toString();
                                    ctx.stroke();
                                }

                                bs_pres_x = x;
                                bs_pres_y = y;
                                break;

                            case 'up':
                                // Store the 'up' action coordinates as the end coordinates
                                endCoords = { x, y };
                                break;

                        }
                        processedCoords.push({ x, y });
                    });

                    var startIMG = new Image();
                    var endIMG = new Image();

                    // 只设置一次src，避免重复触发onload事件
                    startIMG.src = start_sign_src;
                    endIMG.src = end_sign_src;

                    startIMG.onload = function () {
                        // 绘制起点图标
                        ctx.drawImage(startIMG, Math.round(draw_start_x - 15 * draw_suofang), Math.round(draw_start_y - 22 * draw_suofang), Math.round(30 * draw_suofang), Math.round(30 * draw_suofang));

                        // // 确保终点图标在起点图标之后绘制
                        // endIMG.onload = function () {
                        //     // 选择一个随机坐标作为终点
                        //     let randomIndex = Math.floor(Math.random() * processedCoords.length);
                        //     let randomCoord = processedCoords[randomIndex];
                        //     ctx.drawImage(endIMG, Math.round(randomCoord.x - 15 * draw_suofang), Math.round(randomCoord.y - 22 * draw_suofang), Math.round(30 * draw_suofang), Math.round(30 * draw_suofang));
                        //     resolve(); // 仅在所有图标都已绘制完成后调用resolve
                        // };
                        endIMG.onload = function () {
                            // If we have end coordinates, use them; otherwise, default to the last coordinate
                            let finalCoord = endCoords || processedCoords[processedCoords.length - 1];
                            ctx.drawImage(endIMG, Math.round(finalCoord.x - 15 * draw_suofang), Math.round(finalCoord.y - 22 * draw_suofang), Math.round(30 * draw_suofang), Math.round(30 * draw_suofang));
                            resolve(); // Resolve after drawing end sign
                        };
                        // 如果终点图标已经加载，立即绘制它
                        if (endIMG.complete) {
                            endIMG.onload();
                        }
                    };

                    startIMG.onerror = reject;
                    endIMG.onerror = reject;
                    canvas.crossOrigin = "anonymous";
                };
            })
            .catch(error => {
                console.error("Error reading or processing the JSON file:", error);
                reject(error);
            });
    });
}

//这三个方法的具体内容, 取决于是否处在"路径变色"模式
//所以这里先占个位
var handlePointerDown, handlePointerMove, handlePointerUp;

function restorePointer() {
    canvas.removeEventListener('pointerdown', handlePointerDown);
    canvas.removeEventListener('pointermove', handlePointerMove);
    canvas.removeEventListener('pointerup', handlePointerUp);
}
//取消按钮
function drawpic_hidebtn_onClick() {
    restorePointer();
    document.getElementById("body").style.overflow = "";
    document.getElementById("body").style.height = "";
    document.body.removeEventListener('touchmove', this.welcomeShowedListener, false);
    document.getElementById("drawpic_overlay").style.display = "none";
}
//重置按钮
function drawpic_initbtn_onClick() {
    ctx.clearRect(0, 0, current_img_width, current_img_height);
    start_draw();
}

//确定按钮
function drawpic_yesbtn_onClick() {
    return new Promise((resolve, reject) => {
        try {

            document.getElementById("body").style.overflow = "";
            document.getElementById("body").style.height = "";
            document.body.removeEventListener('touchmove', this.welcomeShowedListener, false);
            document.getElementById("bg-img").src = canvas.toDataURL();
            document.getElementById("drawpic_overlay").style.display = "none";

            resolve("Success");  // 如果执行成功，调用 resolve() 方法
        } catch (error) {
            reject(error);  // 如果有错误发生，调用 reject() 方法
        }
    });
}
//获取当前使用的背景图片的尺寸
function getNaturalSize() {
    img = document.getElementById("bg-img")
    current_img_width = img.naturalWidth;
    current_img_height = img.naturalHeight;
}
/*----- 以上为[绘制自定义轨迹]用到的方法 -----*/