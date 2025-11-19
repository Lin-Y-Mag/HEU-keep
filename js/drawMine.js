/**
 * drawMine.js (多圈跑道 + 精准定位 + 纯代码绘制图标)
 */

// ==========================================
// 1. 核心算法：本地生成多圈随机轨迹
// ==========================================
function generateLocalTrackData() {
    // --- 📍 针对哈工程南体育场地图的校准坐标 ---
    // 之前的 CY=280 太靠下，改为 210；半径 R 改大适应操场
    const CX = 180; // X轴居中
    const CY = 210; // Y轴向上提，对准绿地中心
    const R = 82;   // 半径 (弯道大小)
    const LEN = 110; // 直道长度
    const STEP = 5; // 密度
    
    let allPoints = [];
    
    // 🏃 随机生成 3 到 6 圈
    const laps = Math.floor(Math.random() * 4) + 3; 

    for (let lap = 0; lap < laps; lap++) {
        let lapPoints = [];
        
        // 每一圈都有微小的“道次”漂移 (模拟有时候跑内道，有时候跑外道)
        const laneDrift = (Math.random() * 6) - 3; 
        const currentR = R + laneDrift;
        
        // 1. 上直道 (从左到右)
        for (let x = CX - LEN / 2; x <= CX + LEN / 2; x += STEP) {
            lapPoints.push({ x: x, y: CY - currentR });
        }
        // 2. 右半圆
        for (let angle = -Math.PI / 2; angle <= Math.PI / 2; angle += 0.15) {
            lapPoints.push({
                x: CX + LEN / 2 + currentR * Math.cos(angle),
                y: CY + currentR * Math.sin(angle)
            });
        }
        // 3. 下直道 (从右到左)
        for (let x = CX + LEN / 2; x >= CX - LEN / 2; x -= STEP) {
            lapPoints.push({ x: x, y: CY + currentR });
        }
        // 4. 左半圆
        for (let angle = Math.PI / 2; angle <= 3 * Math.PI / 2; angle += 0.15) {
            lapPoints.push({
                x: CX - LEN / 2 + currentR * Math.cos(angle),
                y: CY + currentR * Math.sin(angle)
            });
        }

        // 将这一圈的点加入总集合
        allPoints = allPoints.concat(lapPoints);
    }

    // 闭合回路 (回到起点)
    allPoints.push(allPoints[0]); 

    // --- 🌀 整体旋转 + 📶 GPS噪点处理 ---
    const rotationAngle = (Math.random() * 5 - 2.5) * (Math.PI / 180); // 轻微旋转
    const cos = Math.cos(rotationAngle);
    const sin = Math.sin(rotationAngle);

    // 进出场多余线条 (让起点和终点不重合)
    const extraStart = [];
    const extraEnd = [];
    const startOffset = Math.random() * 20 - 10;
    
    // 模拟从场外跑进来的线
    for(let i=0; i<5; i++) {
        extraStart.push({x: allPoints[0].x - 15 + i*3, y: allPoints[0].y + 5 - i});
    }
    // 模拟跑完走出场外的线
    const lastP = allPoints[allPoints.length-1];
    for(let i=0; i<6; i++) {
        extraEnd.push({x: lastP.x + i*3, y: lastP.y + i*2});
    }
    
    let finalPoints = [...extraStart, ...allPoints, ...extraEnd];

    // 生成最终带 Action 的数据
    const resultData = finalPoints.map((p, index) => {
        // 旋转变换
        let rx = (p.x - CX) * cos - (p.y - CY) * sin + CX;
        let ry = (p.x - CX) * sin + (p.y - CY) * cos + CY;
        
        // 添加 GPS 噪点 (每圈的噪点不同，让线条看起来毛糙真实)
        const noise = Math.random() * 1.8 - 0.9; 
        rx += noise;
        ry += noise;

        return {
            action: index === 0 ? 'down' : 'move', // 只有第一个点是落笔
            x: rx,
            y: ry
        };
    });
    
    // 添加抬笔
    if(resultData.length > 0) {
        const last = resultData[resultData.length-1];
        resultData.push({ action: 'up', x: last.x, y: last.y });
    }

    return resultData;
}

// ==========================================
// 2. 核心绘制逻辑
// ==========================================
function drawDataHighFidelity(ctx, canvasWidth, canvasHeight, data) {
    return new Promise((resolve) => {
        const scale = canvasWidth / 360;

        // --- 渐变色变量 ---
        let is_bs = false;
        let bs_prob = 0.15; // 增加变色概率
        let bs_pres_color = [38, 201, 154]; // Keep 绿
        let bs_pres_x = 0, bs_pres_y = 0;
        let bs_now = 0, bs_range = 0;
        let bs_max = [];
        const bs_range_min = 10, bs_range_max = 30;

        let processedCoords = []; 
        let draw_start_x = 0, draw_start_y = 0;

        // --- 开始绘制轨迹 ---
        data.forEach((item, index) => {
            let x = item.x * scale;
            let y = item.y * scale;

            switch (item.action) {
                case 'down':
                    ctx.beginPath();
                    ctx.lineJoin = "round"; ctx.lineCap = "round";
                    ctx.lineWidth = 5 * scale;
                    ctx.strokeStyle = "rgb(38, 201, 154)";
                    ctx.moveTo(x, y);
                    
                    draw_start_x = x;
                    draw_start_y = y;
                    bs_pres_x = x;
                    bs_pres_y = y;
                    bs_pres_color = [38, 201, 154];
                    is_bs = false;
                    break;

                case 'move':
                    // 渐变色逻辑
                    if (is_bs && bs_now >= bs_range) {
                        is_bs = false;
                        ctx.beginPath();
                        ctx.lineJoin = "round"; ctx.lineCap = "round";
                        ctx.lineWidth = (5 * scale).toString();
                        ctx.moveTo(bs_pres_x, bs_pres_y);
                        ctx.lineTo(x, y);
                        let gradient = ctx.createLinearGradient(bs_pres_x, bs_pres_y, x, y);
                        gradient.addColorStop(0, `rgb(${bs_pres_color[0]},${bs_pres_color[1]},${bs_pres_color[2]})`);
                        gradient.addColorStop(1, "rgb(38, 201, 154)");
                        ctx.strokeStyle = gradient;
                        ctx.stroke();
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
                        ctx.beginPath();
                        ctx.lineJoin = "round"; ctx.lineCap = "round";
                        ctx.lineWidth = (5 * scale).toString();
                        ctx.moveTo(bs_pres_x, bs_pres_y);
                        let bs_now_color = [
                            Math.floor(38 + (4 * bs_max[0] * bs_now / bs_range) * (1 - bs_now / bs_range)),
                            Math.floor(201 + (4 * bs_max[1] * bs_now / bs_range) * (1 - bs_now / bs_range)),
                            Math.floor(154 + (4 * bs_max[2] * bs_now / bs_range) * (1 - bs_now / bs_range))
                        ];
                        let gradient = ctx.createLinearGradient(bs_pres_x, bs_pres_y, x, y);
                        gradient.addColorStop(0, `rgb(${bs_pres_color[0]},${bs_pres_color[1]},${bs_pres_color[2]})`);
                        gradient.addColorStop(1, `rgb(${bs_now_color[0]},${bs_now_color[1]},${bs_now_color[2]})`);
                        ctx.strokeStyle = gradient;
                        ctx.lineTo(x, y);
                        ctx.stroke();
                        bs_pres_color = bs_now_color;
                        bs_now += 1;
                    } else {
                        ctx.lineTo(x, y);
                        ctx.strokeStyle = "rgb(38, 201, 154)";
                        ctx.stroke();
                    }
                    bs_pres_x = x;
                    bs_pres_y = y;
                    break;
            }
            processedCoords.push({ x, y });
        });

        // --- 3. 绘制起点和终点 (纯代码绘制，不依赖图片) ---
        // 终点坐标
        const endCoord = processedCoords[processedCoords.length - 1] || {x:0, y:0};

        // 画起点 (绿点)
        drawMarker(ctx, draw_start_x, draw_start_y, '#26c99a', scale);
        // 画终点 (红点)
        drawMarker(ctx, endCoord.x, endCoord.y, '#ff5e5e', scale);

        resolve();
    });
}

// 辅助函数：绘制纯代码图标 (圆点)
function drawMarker(ctx, x, y, color, scale) {
    ctx.save();
    // 外白圈
    ctx.beginPath();
    ctx.arc(x, y, 6 * scale, 0, 2 * Math.PI);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    // 内色圈
    ctx.beginPath();
    ctx.arc(x, y, 4 * scale, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.fill();
    // 阴影
    ctx.shadowBlur = 2;
    ctx.shadowColor = "rgba(0,0,0,0.3)";
    ctx.stroke();
    ctx.restore();
}

// ==========================================
// 3. 主界面入口
// ==========================================
async function drawMine(ignoredUrl) {
    console.log("本地生成：绘制多圈主界面...");
    
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

        // 画背景
        ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);

        // 画多圈轨迹
        const data = generateLocalTrackData();
        await drawDataHighFidelity(ctx, canvas.width, canvas.height, data);

        const resultImg = document.getElementById('bg-img');
        if(resultImg) resultImg.src = canvas.toDataURL();
    };
}

// ==========================================
// 4. 弹窗入口
// ==========================================
async function Json2Draw(ignoredUrl) {
    console.log("本地生成：绘制多圈弹窗...");
    
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
             canvas.width = current_img_width;
             canvas.height = current_img_height;
        } else {
             canvas.width = bgImg.naturalWidth;
             canvas.height = bgImg.naturalHeight;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);

        const data = generateLocalTrackData();
        await drawDataHighFidelity(ctx, canvas.width, canvas.height, data);
    };
}