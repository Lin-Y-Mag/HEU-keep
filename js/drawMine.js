/**
 * drawMine.js (已修改版)
 * 拦截了原本的网络请求，改为调用本地 localTrackGen.js 生成数据
 */

// 1. 主界面"随机路径"按钮调用的函数
function drawMine(ignoredUrl) {
    // 不再请求 url，直接生成数据
    console.log("正在本地生成随机轨迹...");
    
    // 调用 localTrackGen.js 中的函数
    const data = generateLocalTrackData();

    // 获取 canvas 对象 (假设 render.js 或其他地方定义了全局 ctx 或 canvas)
    // 注意：这里我们需要复用项目原本的绘制逻辑。
    // 由于项目结构复杂，最简单的方法是模拟 Json2Draw 的行为，
    // 即：绘制到 buffer canvas，然后生成图片显示。
    
    // 我们直接复用下面的 renderToResultImage 逻辑
    renderToResultImage(data);
}

// 2. 弹窗中"随机生成"按钮调用的函数
function Json2Draw(ignoredUrl) {
    console.log("弹窗模式：正在本地生成随机轨迹...");
    const data = generateLocalTrackData();
    
    // 获取弹窗里的 canvas
    const canvas = document.getElementById("drawpic_canvas");
    if (canvas) {
        const ctx = canvas.getContext("2d");
        // 清空画布
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // 调用绘制函数 (根据 drawingActions.json 的结构绘制)
        drawDataToCanvas(ctx, data);
    }
}

// --- 辅助绘制函数 ---

/**
 * 将数据绘制到指定的 Canvas Context 上
 */
function drawDataToCanvas(ctx, data) {
    // 设置样式，模拟 Keep 的轨迹风格
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = 5; 
    // 渐变色或纯色
    ctx.strokeStyle = "rgba(250, 80, 80, 0.9)"; // 默认偏红色

    ctx.beginPath();
    data.forEach(point => {
        if (point.action === 'down') {
            ctx.moveTo(point.x, point.y);
        } else if (point.action === 'move') {
            ctx.lineTo(point.x, point.y);
        }
    });
    ctx.stroke();
}

/**
 * 直接渲染并更新主预览图 (对应 drawMine 功能)
 * 这一步稍微复杂，因为它需要更新 GUI 里的图片层
 */
function renderToResultImage(data) {
    // 1. 创建一个临时的 canvas 来绘制轨迹
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = 360;  // 预览图宽度
    tempCanvas.height = 719; // 预览图高度
    const ctx = tempCanvas.getContext('2d');

    // 2. 绘制轨迹
    // 开启发光效果，模拟 Keep 荧光感
    ctx.shadowBlur = 10;
    ctx.shadowColor = "#fc5353";
    
    // 绘制渐变色轨迹
    const gradient = ctx.createLinearGradient(0, 0, 360, 719);
    gradient.addColorStop(0, "#ff9a9e");
    gradient.addColorStop(1, "#fecfef");
    ctx.strokeStyle = gradient;
    
    drawDataToCanvas(ctx, data);

    // 3. 将 canvas 转为图片 URL 并设置给 GUI
    const dataURL = tempCanvas.toDataURL('image/png');
    
    // 找到显示轨迹的那一层 img (在 HTML 中通常是 gui-img 或者专门的轨迹层)
    // 根据原项目逻辑，可能是覆盖在 bg-img 上面的
    // 如果原项目没有专门的轨迹 img 标签，通常是画在 canvas 上覆盖。
    // 这里我们假设要把生成的图层叠加上去。
    
    // 注意：根据原 HTML 结构，有一个 <img id="gui-img"> 是 UI 遮罩。
    // 轨迹通常是画在背景图或者单独的 canvas 上的。
    // 这里尝试查找 render.js 里使用的目标。
    
    // 如果存在名为 'drawpic_canvas' 的元素，我们也可以直接画上去并确认为最终图
    const mainCanvas = document.getElementById("drawpic_canvas");
    if(mainCanvas) {
        const mainCtx = mainCanvas.getContext("2d");
        mainCtx.clearRect(0, 0, mainCanvas.width, mainCanvas.height);
        drawDataToCanvas(mainCtx, data);
        
        // 触发“确认使用”按钮的逻辑 (如果有的话)，或者手动更新图片
        // 这里尝试直接更新预览图逻辑 (如果有 drawpic_yesbtn_onClick 全局函数)
        if(typeof drawpic_yesbtn_onClick === 'function') {
            drawpic_yesbtn_onClick();
        } else {
            // 如果找不到确认函数，我们尝试直接把临时 canvas 覆盖到背景上
            // 注意：这是一个 fallback，具体取决于原项目 styles.css 的层级
             document.getElementById('gui-img').src = dataURL; // 可能会覆盖 UI
             // 更好的做法可能是提示用户在弹窗里点确认
        }
    }
}