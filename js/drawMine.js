/**
 * drawMine.js (最终重构版)
 * 1. 彻底修复起点瞬移左下角的BUG (重写了生成顺序)
 * 2. 引入"随机游走"算法，模拟人跑偏、斜着跑的真实感
 * 3. 起点范围扩大，进场更随机
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
    const STEP = 15; // 大步长

    let allPoints = [];
    
    // 1. 确定全局起点 (Start Target)
    // 现在这是一个大约 40x20 的随机区域，而不再是一个点
    // 位于右上角直道末端附近
    const startTargetX = BASE_CX + LENGTH/2 + (Math.random() * 30 - 15); 
    const startTargetY = BASE_CY - BASE_R + (Math.random() * 20 - 10);
    
    // 2. 生成进场线 (小尾巴)，连到这个随机起点
    const entryPoints = generateNaturalEntry({x: startTargetX, y: startTargetY});
    allPoints = [...entryPoints];

    // 3. 模拟跑 5 到 8 圈
    const laps = Math.floor(Math.random() * 4) + 5; 

    // 用于"斜着跑"的惯性变量 (低频漂移)
    let wanderX = 0;
    let wanderY = 0;

    for (let i = 0; i < laps; i++) {
        // 每一圈的基础参数 (道次)
        const r_lap = BASE_R + (Math.random() * 6 - 3); // 半径随机
        const cx_lap = BASE_CX + (Math.random() * 2 - 1);
        const cy_lap = BASE_CY + (Math.random() * 4 - 2);
        
        // ⚠️ 核心修复：直接从[右上角]开始生成这一圈的数据
        // 顺序：右弯道 -> 下直道 -> 左弯道 -> 上直道
        // 这样物理上保证了终点必定回到右上角，绝不会跳到左下角
        const lapPoints = generateOneLapOrdered(cx_lap, cy_lap, LENGTH, r_lap, STEP);

        // 对这一圈的点应用"斜着跑"算法
        const driftedLap = lapPoints.map(p => {
            // 1. 随机游走 (Random Walk) - 模拟斜着跑
            // 每次只改变一点点，累加起来就是一条斜线
            wanderX += (Math.random() - 0.5) * 1.5; 
            wanderY += (Math.random() - 0.5) * 1.5;
            
            // 限制漂移最大幅度，防止跑出操场
            wanderX *= 0.95; // 衰减因子，让它有回归中心的趋势
            wanderY *= 0.95;

            // 2. 高频抖动 (Jitter) - 模拟GPS误差
            const jitterX = Math.random() * 2 - 1;
            const jitterY = Math.random() * 2 - 1;

            return {
                x: p.x + wanderX + jitterX,
                y: p.y + wanderY + jitterY
            };
        });

        allPoints = allPoints.concat(driftedLap);
    }

    // 4. 结束缓冲 (多跑一点点)
    const endLap = generateOneLapOrdered(BASE_CX, BASE_CY, LENGTH, BASE_R, STEP);
    // 随机跑 10% 到 40% 圈
    const cutIndex = Math.floor(endLap.length * (0.1 + Math.random() * 0.3));
    
    // 同样应用惯性漂移
    for(let i=0; i<cutIndex; i++) {
        wanderX += (Math.random() - 0.5) * 1.5;
        wanderY += (Math.random() - 0.5) * 1.5;
        wanderX *= 0.95; wanderY *= 0.95;
        
        allPoints.push({
            x: endLap[i].x + wanderX + (Math.random()*2-1),
            y: endLap[i].y + wanderY + (Math.random()*2-1)
        });
    }

    // --- 坐标变换 (整体旋转 -4度) ---
    const rad = ROTATE * Math.PI / 180; 
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);

    const resultData = allPoints.map((p, index) => {
        let dx = p.x - BASE_CX;
        let dy = p.y - BASE_CY;
        let rx = dx * cos - dy * sin;
        let ry = dx * sin + dy * cos;
        let finalX = rx + BASE_CX;
        let finalY = ry + BASE_CY;
        
        return {
            action: index === 0 ? 'down' : 'move',
            x: finalX,
            y: finalY
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

// ✅ 核心函数：按真实跑步顺序生成一圈 (从右上角开始)
// 顺序：右弯道 -> 下直道 -> 左弯道 -> 上直道
function generateOneLapOrdered(cx, cy, length, r, step) {
    let points = [];

    // 1. 右半圆 (从顶部 -PI/2 开始，顺时针画到底部 PI/2)
    // 注意：Canvas Y轴向下，所以 -PI/2 是正上方
    for (let angle = -Math.PI/2; angle <= Math.PI/2; angle += step/r) {
        points.push({
            x: cx + length/2 + r * Math.cos(angle),
            y: cy + r * Math.sin(angle)
        });
    }

    // 2. 下直道 (从右向左)
    for (let x = cx + length/2; x >= cx - length/2; x -= step) {
        points.push({x: x, y: cy + r});
    }

    // 3. 左半圆 (从底部 PI/2 开始，顺时针画到顶部 1.5 PI)
    for (let angle = Math.PI/2; angle <= 1.5*Math.PI; angle += step/r) {
        points.push({
            x: cx - length/2 + r * Math.cos(angle),
            y: cy + r * Math.sin(angle)
        });
    }

    // 4. 上直道 (从左向右)
    for (let x = cx - length/2; x <= cx + length/2; x += step) {
        points.push({x: x, y: cy - r});
    }

    return points;
}

// 进场线生成器 (连接到随机生成的起点)
function generateNaturalEntry(target) {
    let points = [];
    const numPoints = 7; 
    
    // 场外起点：随机性更大
    // 在目标点的右侧 20~50px，上方 20~60px 区域
    const offsetX = 20 + Math.random() * 30; 
    const offsetY = -20 - Math.random() * 40;
    
    const startOrigin = {
        x: target.x + offsetX,
        y: target.y + offsetY
    };

    for(let i = 0; i < numPoints; i++) {
        const t = i / numPoints;
        // 贝塞尔曲线插值
        let currentX = startOrigin.x + (target.x - startOrigin.x) * t;
        let currentY = startOrigin.y + (target.y - startOrigin.y) * t;
        
        // 弧度，模拟转弯惯性
        const arcCurve = Math.sin(t * Math.PI / 2) * 10;
        
        points.push({
            x: currentX - arcCurve + (Math.random()*2-1), 
            y: currentY + (Math.random()*2-1)
        });
    }
    return points;
}


// ==========================================
// 2. 核心绘制逻辑 (保持8px粗细，逻辑不变)
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
    console.log("本地生成：最终重构版...");
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