/**
 * drawMine.js (最终完美版)
 * 优化点：圈数更多(5-9圈)、尺寸更大、线条更粗、抖动更真实
 */

// ==========================================
// 1. 核心算法：本地生成多圈随机轨迹
// ==========================================
function generateLocalTrackData() {
    // --- 📍 核心参数调整 ---
    const BASE_CX = 178;  // 圆心 X (保持不变)
    const BASE_CY = 208;  // 圆心 Y (保持不变)
    
    // 1. 尺寸加大
    const LENGTH = 115;   // 直道长度 (原106 -> 115)
    const ROTATE = -4;    // 倾斜角度
    const BASE_R = 61;    // 半径 (原56 -> 61)
    const STEP = 15;       // 步长加密一点，让抖动更细腻

    let allPoints = [];
    
    // 2. 圈数增加 (5 到 9 圈)
    const laps = Math.floor(Math.random() * 5) + 5; 

    for (let i = 0; i < laps; i++) {
        // 3. 每一圈的抖动 (道次漂移) 变得更剧烈
        // 半径偏差扩大到 -3 到 +3 (模拟跨越多个跑道)
        const r_noise = (Math.random() * 6 - 3); 
        // 圆心位置偏差扩大
        const cy_noise = (Math.random() * 4 - 2);
        const cx_noise = (Math.random() * 2 - 1);
        
        const currentR = BASE_R + r_noise;
        const currentCY = BASE_CY + cy_noise;
        const currentCX = BASE_CX + cx_noise;
        
        let lapPoints = generateEllipse(currentCX, currentCY, LENGTH, currentR, STEP);
        allPoints = allPoints.concat(lapPoints);
    }

    // 增加结束缓冲段
    const endLapPoints = generateEllipse(BASE_CX, BASE_CY, LENGTH, BASE_R, STEP);
    const cutIndex = Math.floor(endLapPoints.length * 0.3 + Math.random() * (endLapPoints.length * 0.4));
    allPoints = allPoints.concat(endLapPoints.slice(0, cutIndex));

    // 进出场线条
    const extraStart = generateLineData(BASE_CX, BASE_CY, BASE_R, true);
    let finalPoints = [...extraStart, ...allPoints];

    // --- 坐标变换 ---
    const rad = ROTATE * Math.PI / 180; 
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);

    const resultData = finalPoints.map((p, index) => {
        // 1. 归零
        let dx = p.x - BASE_CX;
        let dy = p.y - BASE_CY;
        
        // 2. 旋转
        let rx = dx * cos - dy * sin;
        let ry = dx * sin + dy * cos;
        
        // 3. 复位
        let finalX = rx + BASE_CX;
        let finalY = ry + BASE_CY;
        
        // 4. GPS 噪点 (抖动更剧烈)
        // 之前是 1.6范围，现在增加到 2.8范围，线条会更有“毛刺感”
        const noiseX = Math.random() * 2.8 - 1.4;
        const noiseY = Math.random() * 2.8 - 1.4;

        return {
            action: index === 0 ? 'down' : 'move',
            x: finalX + noiseX,
            y: finalY + noiseY
        };
    });

    // 50% 概率反向跑
    if (Math.random() < 0.5) {
        resultData.forEach(p => {
            p.x = BASE_CX - (p.x - BASE_CX);
            p.y = BASE_CY - (p.y - BASE_CY);
        });
    }

    // 抬笔
    if(resultData.length > 0) {
        const last = resultData[resultData.length-1];
        resultData.push({ action: 'up', x: last.x, y: last.y });
    }

    return resultData;
}

// 辅助：生成单圈椭圆
function generateEllipse(cx, cy, length, r, step) {
    let points = [];
    // 上直道
    for (let x = cx - length/2; x <= cx + length/2; x += step) {
        // 直道也要加一点随机波浪
        points.push({x: x, y: cy - r + (Math.random()*2 - 1)});
    }
    // 右半圆
    for (let angle = -Math.PI/2; angle <= Math.PI/2; angle += step/r) {
        points.push({
            x: cx + length/2 + r * Math.cos(angle),
            y: cy + r * Math.sin(angle)
        });
    }
    // 下直道
    for (let x = cx + length/2; x >= cx - length/2; x -= step) {
        points.push({x: x, y: cy + r + (Math.random()*2 - 1)});
    }
    // 左半圆
    for (let angle = Math.PI/2; angle <= 1.5*Math.PI; angle += step/r) {
        points.push({
            x: cx - length/2 + r * Math.cos(angle),
            y: cy + r * Math.sin(angle)
        });
    }
    return points;
}

// 辅助：生成进出场线条
function generateLineData(cx, cy, r, isStart) {
    let points = [];
    // 起点在左直道上方附近
    const startX = cx - 65; // 稍微再往左一点，配合加大的半径 
    const startY = cy - r - 25; 
    
    for(let i=0; i<12; i++) {
        points.push({
            x: startX + i*4 + Math.random()*2,
            y: startY + i*2 + Math.random()*2
        });
    }
    return points;
}


// ==========================================
// 2. 核心绘制逻辑 (线条加粗)
// ==========================================
function drawDataHighFidelity(ctx, canvasWidth, canvasHeight, data) {
    return new Promise((resolve) => {
        const scale = canvasWidth / 360;

        // 4. 线条加粗配置
        // 之前是 5 * scale，现在改为 8 * scale
        const LINE_WIDTH = 8 * scale; 

        let is_bs = false;
        let bs_prob = 0.15; 
        let bs_pres_color = [38, 201, 154]; 
        let bs_pres_x = 0, bs_pres_y = 0;
        let bs_now = 0, bs_range = 0;
        let bs_max = [];
        const bs_range_min = 10, bs_range_max = 30;

        let processedCoords = []; 
        let draw_start_x = 0, draw_start_y = 0;

        data.forEach((item, index) => {
            let x = item.x * scale;
            let y = item.y * scale;

            switch (item.action) {
                case 'down':
                    ctx.beginPath();
                    ctx.lineJoin = "round"; ctx.lineCap = "round";
                    ctx.lineWidth = LINE_WIDTH; // 应用加粗
                    ctx.strokeStyle = "rgb(38, 201, 154)";
                    ctx.moveTo(x, y);
                    draw_start_x = x; draw_start_y = y;
                    bs_pres_x = x; bs_pres_y = y;
                    bs_pres_color = [38, 201, 154];
                    is_bs = false;
                    break;

                case 'move':
                    if (is_bs && bs_now >= bs_range) {
                        is_bs = false;
                        ctx.beginPath(); ctx.lineJoin = "round"; ctx.lineCap = "round";
                        ctx.lineWidth = LINE_WIDTH.toString(); // 应用加粗
                        ctx.moveTo(bs_pres_x, bs_pres_y);
                        ctx.lineTo(x, y);
                        let gradient = ctx.createLinearGradient(bs_pres_x, bs_pres_y, x, y);
                        gradient.addColorStop(0, `rgb(${bs_pres_color[0]},${bs_pres_color[1]},${bs_pres_color[2]})`);
                        gradient.addColorStop(1, "rgb(38, 201, 154)");
                        ctx.strokeStyle = gradient; ctx.stroke();
                        bs_pres_color = [38, 201, 154];
                    }
                    if (!is_bs && Math.random() < bs_prob && index < data.length - 15) {
                        is_bs = true;
                        let rg = 2 * Math.random() - 1;
                        if (rg > 0) bs_max = [Math.floor(193 * Math.pow(Math.abs(rg), 0.5)), Math.floor(-110 * Math.pow(Math.abs(rg), 0.5)), Math.floor(-66 * Math.pow(Math.abs(rg), 0.5))];
                        else bs_max = [Math.floor(27 * Math.pow(Math.abs(rg), 0.5)), Math.floor(16 * Math.pow(Math.abs(rg), 0.5)), Math.floor(94 * Math.pow(Math.abs(rg), 0.5))];
                        bs_range = bs_range_min + Math.floor((bs_range_max - bs_range_min) * Math.random());
                        bs_now = 0;
                    }
                    if (is_bs) {
                        ctx.beginPath(); ctx.lineJoin = "round"; ctx.lineCap = "round";
                        ctx.lineWidth = LINE_WIDTH.toString(); // 应用加粗
                        ctx.moveTo(bs_pres_x, bs_pres_y);
                        let bs_now_color = [
                            Math.floor(38 + (4 * bs_max[0] * bs_now / bs_range) * (1 - bs_now / bs_range)),
                            Math.floor(201 + (4 * bs_max[1] * bs_now / bs_range) * (1 - bs_now / bs_range)),
                            Math.floor(154 + (4 * bs_max[2] * bs_now / bs_range) * (1 - bs_now / bs_range))
                        ];
                        let gradient = ctx.createLinearGradient(bs_pres_x, bs_pres_y, x, y);
                        gradient.addColorStop(0, `rgb(${bs_pres_color[0]},${bs_pres_color[1]},${bs_pres_color[2]})`);
                        gradient.addColorStop(1, `rgb(${bs_now_color[0]},${bs_now_color[1]},${bs_now_color[2]})`);
                        ctx.strokeStyle = gradient; ctx.lineTo(x, y); ctx.stroke();
                        bs_pres_color = bs_now_color; bs_now += 1;
                    } else {
                        ctx.lineTo(x, y); ctx.strokeStyle = "rgb(38, 201, 154)"; ctx.stroke();
                    }
                    bs_pres_x = x; bs_pres_y = y;
                    break;
            }
            processedCoords.push({ x, y });
        });

        // 绘制起点终点 (图标也稍微加大一点)
        const endCoord = processedCoords[processedCoords.length - 1] || {x:0, y:0};
        drawMarker(ctx, draw_start_x, draw_start_y, '#26c99a', scale);
        drawMarker(ctx, endCoord.x, endCoord.y, '#ff5e5e', scale);
        resolve();
    });
}

function drawMarker(ctx, x, y, color, scale) {
    ctx.save();
    ctx.shadowBlur = 4; ctx.shadowColor = "rgba(0,0,0,0.3)";
    // 稍微加大图标尺寸，配合加粗的线条
    ctx.beginPath(); ctx.arc(x, y, 8 * scale, 0, 2 * Math.PI); ctx.fillStyle = "#ffffff"; ctx.fill();
    ctx.beginPath(); ctx.arc(x, y, 6 * scale, 0, 2 * Math.PI); ctx.fillStyle = color; ctx.fill();
    ctx.restore();
}

// ==========================================
// 3. 主界面入口
// ==========================================
async function drawMine(ignoredUrl) {
    console.log("本地生成：绘制最终版...");
    let bgSrc = "";
    if (typeof tmp_bgimg_osrc !== 'undefined' && tmp_bgimg_osrc) bgSrc = tmp_bgimg_osrc;
    else if (typeof use_default_bg !== 'undefined' && use_default_bg) bgSrc = default_bgSRC[1];
    else {
        const bgEl = document.getElementById('bg-img');
        if(bgEl) bgSrc = bgEl.src;
    }

    const bgImg = new Image();
    bgImg.crossOrigin = "Anonymous";
    bgImg.src = bgSrc;

    bgImg.onload = async function() {
        const canvas = document.createElement('canvas');
        canvas.width = bgImg.naturalWidth || 360;
        canvas.height = bgImg.naturalHeight || 719;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
        const data = generateLocalTrackData();
        await drawDataHighFidelity(ctx, canvas.width, canvas.height, data);
        const resultImg = document.getElementById('bg-img');
        if(resultImg) resultImg.src = canvas.toDataURL();
    };
    bgImg.onerror = function() { alert("背景图加载失败。"); }
}

// ==========================================
// 4. 弹窗入口
// ==========================================
async function Json2Draw(ignoredUrl) {
    const canvas = document.getElementById('drawpic_canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let bgSrc = "";
    if (typeof use_default_bg !== 'undefined' && use_default_bg) bgSrc = default_bgSRC[1];
    else if (typeof bgSRC !== 'undefined') bgSrc = bgSRC;
    else bgSrc = document.getElementById('bg-img').src;

    const bgImg = new Image();
    bgImg.crossOrigin = "Anonymous";
    bgImg.src = bgSrc;
    bgImg.onload = async function() {
        if(typeof current_img_width !== 'undefined') {
             canvas.width = current_img_width; canvas.height = current_img_height;
        } else {
             canvas.width = bgImg.naturalWidth; canvas.height = bgImg.naturalHeight;
        }
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
        const data = generateLocalTrackData();
        await drawDataHighFidelity(ctx, canvas.width, canvas.height, data);
    };
}