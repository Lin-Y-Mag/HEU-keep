/* js/img_both_inpt_set.js */

// =============================================
// 辅助函数：时间格式转换
// =============================================

/**
 * 将 "5'30"" 或 "5'30" 格式的字符串转换为总秒数
 * 例如: "4'30" -> 270
 */
function paceToSeconds(paceStr) {
    if (!paceStr) return 0;
    // 容错处理：把中文冒号、英文句号都替换成标准的分隔符
    paceStr = paceStr.toString().replace(/["']/g, "'").replace('：', "'").replace('.', "'");
    
    let parts = paceStr.split("'");
    if (parts.length < 2) {
        // 如果没有分隔符，尝试直接作为分钟处理，或返回0
        return parseInt(parts[0]) || 0;
    }
    
    let minutes = parseInt(parts[0]);
    let seconds = parseInt(parts[1]);
    return minutes * 60 + seconds;
}

/**
 * 将总秒数转换为 "5'30"" 格式
 * 自动补零，确保秒数始终是两位
 */
function secondsToPace(totalSeconds) {
    let m = Math.floor(totalSeconds / 60);
    let s = Math.floor(totalSeconds % 60);
    // 补零：5秒 -> 05
    let sStr = s < 10 ? "0" + s : s;
    return m + "'" + sStr + '"';
}

// =============================================
// 核心逻辑函数
// =============================================

/**
 * 主函数：将输入框的值实时更新到预览图中
 * 绑定在大多数输入框的 onchange 事件上
 */
function setData() {
    // 1. 基础文本信息
    let username = document.getElementById('inpt_username').value;
    let keepTitle = document.getElementById('inpt_keep_title').value;
    
    if (username) document.getElementById('username').innerText = username;
    if (keepTitle) document.getElementById('keep-title').innerText = keepTitle;

    // 2. 运动数据 (里程、配速、热量等)
    let mile = document.getElementById('inpt_miles').value;
    let speed = document.getElementById('inpt_speeds').value;
    let calorie = document.getElementById('calorie').innerText; // 通常热量不手动改，或者你可以加个input

    // 如果里程输入框有值，优先显示输入框的值（除非触发了随机逻辑）
    if (mile) document.getElementById('mile').innerText = mile;
    if (speed) document.getElementById('speed').innerText = speed;

    // 3. 时间日期
    let Y = document.getElementById('inpt_year').value;
    let M = document.getElementById('inpt_month').value;
    let D = document.getElementById('inpt_day').value;
    let h = document.getElementById('inpt_hour').value;
    let m = document.getElementById('inpt_min').value;

    // 简单的补零函数
    const pad = (n) => n < 10 ? '0' + n : n;
    
    // 只有当所有日期字段都有值时才更新
    if (Y && M && D) {
        document.getElementById('date').innerText = `${Y}/${pad(M)}/${pad(D)}`;
    }
    if (h && m) {
        document.getElementById('time').innerText = `${pad(h)}:${pad(m)}`;
    }

    // 4. 环境数据 (温湿度)
    let temp = document.getElementById('inpt_temperature').value;
    let humid = document.getElementById('inpt_humidity').value;
    
    if (temp) document.getElementById('temperature').innerText = temp;
    if (humid) document.getElementById('humidity').innerText = humid;
    
    // 5. 变色概率/配置 (如果有相关逻辑)
    // 这些通常由 render.js 使用，这里只需要确保存储在 DOM 或变量中即可
}

/**
 * 随机逻辑函数：处理里程和配速的随机范围
 * 绑定在 min/max 输入框的 onchange 事件上
 */
function set_km_and_speed() {
    // --- A. 里程 (KM) 随机逻辑 ---
    let minMiles = parseFloat(document.getElementById('min_miles').value);
    let maxMiles = parseFloat(document.getElementById('max_miles').value);
    let currentMiles = document.getElementById('inpt_miles').value;
    
    let finalMiles = currentMiles;

    // 只有当最大和最小值都输入了有效的数字
    if (!isNaN(minMiles) && !isNaN(maxMiles)) {
        // 确保 min < max
        if (minMiles > maxMiles) [minMiles, maxMiles] = [maxMiles, minMiles];
        
        // 随机生成并保留2位小数
        let randomMile = (Math.random() * (maxMiles - minMiles) + minMiles).toFixed(2);
        finalMiles = randomMile;
        
        // 同步回主输入框(可选，为了让用户看到生成结果)
        // document.getElementById('inpt_miles').value = finalMiles; 
    }
    
    // 更新预览
    if (finalMiles) {
        document.getElementById('mile').innerText = finalMiles;
    }


    // --- B. 配速 (Speed) 随机逻辑 (修复版) ---
    let minSpeedStr = document.getElementById('min_speeds').value;
    let maxSpeedStr = document.getElementById('max_speeds').value;
    let currentSpeed = document.getElementById('inpt_speeds').value;
    
    let finalPace = currentSpeed;

    if (minSpeedStr && maxSpeedStr) {
        // 1. 转为秒
        let minSec = paceToSeconds(minSpeedStr);
        let maxSec = paceToSeconds(maxSpeedStr);

        // 2. 校验转换是否成功（避免用户输错导致NaN）
        if (minSec > 0 && maxSec > 0) {
            // 确保 min < max
            if (minSec > maxSec) [minSec, maxSec] = [maxSec, minSec];

            // 3. 随机整数秒
            let randomSec = Math.floor(Math.random() * (maxSec - minSec + 1)) + minSec;

            // 4. 转回格式
            finalPace = secondsToPace(randomSec);
            
            // 同步回主输入框(可选)
            // document.getElementById('inpt_speeds').value = finalPace;
        }
    }

    // 更新预览
    if (finalPace) {
        document.getElementById('speed').innerText = finalPace;
    }
}

// 简单的天气选择逻辑 (通常这在 select_manner.js 但为了防止丢失引用，这里保留一个基础版本)
function weather_Select_onChange() {
    let select = document.getElementById('weather_Select');
    let imgPath = select.value;
    document.getElementById('weather').src = imgPath;
}