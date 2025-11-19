/**
 * drawMine.js (自然进场优化版)
 * 修复：进场线改为右上角自然的“小尾巴”，顺势切入跑道
 */

// ==========================================
// 1. 核心算法：本地生成多圈随机轨迹
// ==========================================
function generateLocalTrackData() {
    // --- 📍 核心参数 ---
    const BASE_CX = 178;  
    const BASE_CY = 208;  
    const LENGTH = 115;   
    const ROTATE = -4;    
    const BASE_R = 61;    
    const STEP = 15; // 保持大步长，保留真实感      

    let allPoints = [];
    
    // 模拟跑 5 到 8 圈
    const laps = Math.floor(Math.random() * 4) + 5; 

    for (let i = 0; i < laps; i++) {
        // 随机扰动
        const r_noise = (Math.random() * 6 - 3); 
        const cy_noise = (Math.random() * 4 - 2);
        const cx_noise = (Math.random() * 2 - 1);
        
        const currentR = BASE_R + r_noise;
        const currentCY = BASE_CY + cy_noise;
        const currentCX = BASE_CX + cx_noise;
        
        let lapPoints = generateEllipse(currentCX, currentCY, LENGTH, currentR, STEP);
        allPoints = allPoints.concat(lapPoints);
    }

    // 结束缓冲段
    const endLapPoints = generateEllipse(BASE_CX, BASE_CY, LENGTH, BASE_R, STEP);
    const cutIndex = Math.floor(endLapPoints.length * 0.3 + Math.random() * (endLapPoints.length * 0.3));
    allPoints = allPoints.concat(endLapPoints.slice(0, cutIndex));

    // ✅ 关键修改1：精准定位跑道起点到“右上角”
    // 跑道生成顺序是：上直道(左->右) -> 右弯道 -> ...
    // 上直道结束的点，就是右上角
    const pointsPerStraight = Math.floor(LENGTH / STEP);
    // 我们让起点稍微往弯道里走一点点，这样衔接更自然
    const shiftIndex = pointsPerStraight + 2; 
    
    // 数组轮转
    if (allPoints.length > shiftIndex) {
        const part1 = allPoints.slice(0, shiftIndex);
        const part2 = allPoints.slice(shiftIndex);
        allPoints = part2.concat(part1);
    }

    // ✅ 关键修改2：生成自然的“小尾巴”进场线
    // 目标点是跑道的现在的起点（右上角）
    const startTarget = allPoints[0];
    // 参考点是跑道的第二个点，用于计算切入角度
    const nextPoint = allPoints[1];
    
    const extraStart = generateNaturalEntry(startTarget, nextPoint);
    
    let finalPoints = [...extraStart, ...allPoints];

    // --- 坐标变换 ---
    const rad = ROTATE * Math.PI / 180; 
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);

    const resultData = finalPoints.map((p, index) => {
        let dx = p.x - BASE_CX;
        let dy = p.y - BASE_CY;
        let rx = dx * cos - dy * sin;
        let ry = dx * sin + dy * cos;
        let finalX = rx + BASE_CX;
        let finalY = ry + BASE_CY;
        
        // GPS 噪点
        const noiseX = Math.random() * 2.2 - 1.1;
        const noiseY = Math.random() * 2.2 - 1.1;

        return {
            action: index === 0 ? 'down' : 'move',
            x: finalX + noiseX,
            y: finalY + noiseY
        };
    });

    // 50% 概率反向跑 (中心对称)
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

// ✅ 新增：自然的进场“小尾巴”生成器
function generateNaturalEntry(target, nextPoint) {
    let points = [];
    const numPoints = 6; // 短一点，不要太长
    
    // 1. 确定场外起点 (Start Origin)
    // 我们希望它在右上角的外侧 (郑和路方向)
    // X轴：比目标点偏右 15px ~ 35px
    // Y轴：比目标点偏上 20px ~ 40px
    const offsetX = 15 + Math.random() * 20; 
    const offsetY = -20 - Math.random() * 20;
    
    const startOrigin = {
        x: target.x + offsetX,
        y: target.y + offsetY
    };

    // 2. 生成贝塞尔曲线或平滑插值
    // 从 startOrigin 慢慢弯向 target
    // 模拟人跑进来的惯性
    for(let i = 0; i < numPoints; i++) {
        const t = i / numPoints; // 0 到 1
        
        // 简单的线性插值 + 垂直扰动模拟转弯弧度
        // 这里的逻辑是：让线条不是直直的连过去，而是带一点弧度
        let currentX = startOrigin.x + (target.x - startOrigin.x) * t;
        let currentY = startOrigin.y + (target.y - startOrigin.y) * t;
        
        // 加一点点弧度修正 (向外鼓一点)
        const arcCurve = Math.sin(t * Math.PI) * 5;
        
        points.push({
            x: currentX + arcCurve, 
            y: currentY + (Math.random()*2 - 1) // 加上GPS抖动
        });
    }
    
    return points;
}


// ==========================================
// 2. 核心绘制逻辑 (线宽8px)
// ==========================================
function drawDataHighFidelity(ctx, canvasWidth, canvasHeight, data) {
    return new Promise((resolve) => {
        const scale = canvasWidth / 360;
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
                    ctx.lineWidth = LINE_WIDTH; 
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
                        ctx.lineWidth = LINE_WIDTH.toString(); 
                        ctx.moveTo(bs_pres_x, bs_pres_y);
                        ctx.lineTo(x, y);
                        let gradient = ctx.createLinearGradient(bs_pres_x, bs_pres_y, x, y);
                        gradient.addColorStop(0, `rgb(${bs_pres_color[0]},${bs_pres_color[1]},${bs_pres_color[2]})`);
                        gradient.addColorStop(1, "rgb(38, 201, 154)");
                        ctx.strokeStyle = gradient; ctx.stroke();
                        bs_pres_color = [38, 201, 154];
                    }
                    if (!is_bs && Math.random() < bs_prob && index < data.length - 5) { 
                        is_bs = true;
                        let rg = 2 * Math.random() - 1;
                        if (rg > 0) bs_max = [Math.floor(193 * Math.pow(Math.abs(rg), 0.5)), Math.floor(-110 * Math.pow(Math.abs(rg), 0.5)), Math.floor(-66 * Math.pow(Math.abs(rg), 0.5))];
                        else bs_max = [Math.floor(27 * Math.pow(Math.abs(rg), 0.5)), Math.floor(16 * Math.pow(Math.abs(rg), 0.5)), Math.floor(94 * Math.pow(Math.abs(rg), 0.5))];
                        bs_range = bs_range_min + Math.floor((bs_range_max - bs_range_min) * Math.random());
                        bs_now = 0;
                    }
                    if (is_bs) {
                        ctx.beginPath(); ctx.lineJoin = "round"; ctx.lineCap = "round";
                        ctx.lineWidth = LINE_WIDTH.toString(); 
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

        const endCoord = processedCoords[processedCoords.length - 1] || {x:0, y:0};
        drawMarker(ctx, draw_start_x, draw_start_y, '#26c99a', scale);
        drawMarker(ctx, endCoord.x, endCoord.y, '#ff5e5e', scale);
        resolve();
    });
}

function drawMarker(ctx, x, y, color, scale) {
    ctx.save();
    ctx.shadowBlur = 4; ctx.shadowColor = "rgba(0,0,0,0.3)";
    ctx.beginPath(); ctx.arc(x, y, 8 * scale, 0, 2 * Math.PI); ctx.fillStyle = "#ffffff"; ctx.fill();
    ctx.beginPath(); ctx.arc(x, y, 6 * scale, 0, 2 * Math.PI); ctx.fillStyle = color; ctx.fill();
    ctx.restore();
}

// ==========================================
// 3. 主界面入口
// ==========================================
async function drawMine(ignoredUrl) {
    console.log("本地生成：自然进场优化版...");
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