//init.js
var auto_draw ;
var miles, speeds, username, keep_title, date_year, date_month, date_day, time_hour, time_min, temperature, humidity, savePic_width;

var km_min, km_max, speed_min, speed_max;

var now_location = '南岗区'
var bgSRC = "", ptSRC = "";
var display_guijiSelect_id;
var default_bgSRC = [];
var use_default_bg = true;

var canvas, ctx, drawdown, convasData, current_img_width, current_img_height, draw_suofang, buffer_canvas;
var bs_range_min, bs_range_max;
var bs, bs_prob, is_bs, bs_max, bs_range, bs_now, bs_end_x, bs_end_y, bs_pres_x, bs_pres_y, bs_currentX, bs_currentY, bs_pres_color;
var draw_start_x, draw_start_y, draw_end_x, draw_end_y;

var empty_bg_src = "images/empty_bg.png" + "?_=" + new Date().getTime();
var gui_img_src = "images/1.png" + "?_=" + new Date().getTime();
var default_portrait_scr = "images/default_portrait.png" + "?_=" + new Date().getTime();
var start_sign_src = "images/start.png" + "?_=" + new Date().getTime();
var end_sign_src = "images/end.png" + "?_=" + new Date().getTime();

var frameWidth = 300;
var frameHeight = 600;

var bgWidth = 360;
var bgHeight = 719;

let ptWidth = 40;
let ptHeight = 40;

function fract(num) {
    return num - Math.trunc(num);
}
function addZero(i) {
    if (i < 10) {
        i = "0" + String(i);
        return i;
    }
    return String(i);
}
//将输入框的输入内容存储到对应的变量中
function setData() {
    username = document.getElementById("inpt_username").value;
    keep_title = document.getElementById("inpt_keep_title").value;
    miles = parseFloat(document.getElementById("inpt_miles").value);

    km_min = document.getElementById('min_miles').value;
    km_max = document.getElementById('max_miles').value;
    speed_min = document.getElementById('min_speeds').value;
    speed_max = document.getElementById('max_speeds').value;
    speeds = parseFloat(document.getElementById("inpt_speeds").value);

    date_year = parseInt(document.getElementById("inpt_year").value);
    date_month = parseInt(document.getElementById("inpt_month").value);
    date_day = parseInt(document.getElementById("inpt_day").value);
    time_hour = parseInt(document.getElementById("inpt_hour").value);
    time_min = parseInt(document.getElementById("inpt_min").value);
    temperature = parseInt(document.getElementById("inpt_temperature").value);
    humidity = parseInt(document.getElementById("inpt_humidity").value);
    bs_prob = parseFloat(document.getElementById("inpt_bs_prob").value);
    bs_range_min = parseInt(document.getElementById("inpt_bs_range_min").value);
    bs_range_max = parseInt(document.getElementById("inpt_bs_range_max").value);
    savePic_width = parseInt(document.getElementById("inpt_savePic_width").value);
    auto_draw = document.getElementById("auto_draw_checkbox").checked;
    render();
}

function set_km_and_speed() {
    km_min = document.getElementById('min_miles').value;
    km_max = document.getElementById('max_miles').value;
    speed_min = document.getElementById('min_speeds').value;
    speed_max = document.getElementById('max_speeds').value;
    speed_min = parseFloat(speed_min);
    speed_max = parseFloat(speed_max);
    km_max = parseFloat(km_max);
    km_min = parseFloat(km_min);
    miles = Math.floor((km_min + Math.random() * (km_max - km_min)) * 100) / 100;
    speeds = Math.floor((speed_min + Math.random() * (speed_max - speed_min)) * 100) / 100;

    document.getElementById("inpt_miles").value = miles;
    document.getElementById("inpt_speeds").value = speeds;
    setData();
}

//初始化输入框, 将变量的内容放到输入框中
function initInputData() {
    document.getElementById("inpt_username").value = username;
    document.getElementById("inpt_keep_title").value = keep_title;
    document.getElementById("inpt_miles").value = miles;

    document.getElementById('min_miles').value = km_min;
    document.getElementById('max_miles').value = km_max;
    document.getElementById('min_speeds').value = speed_min;
    document.getElementById('max_speeds').value = speed_max;
    document.getElementById("inpt_speeds").value = speeds;

    document.getElementById("inpt_year").value = date_year;
    document.getElementById("inpt_month").value = date_month;
    document.getElementById("inpt_day").value = date_day;
    document.getElementById("inpt_hour").value = time_hour;
    document.getElementById("inpt_min").value = time_min;
    document.getElementById("inpt_temperature").value = temperature;
    document.getElementById("inpt_humidity").value = humidity;
    document.getElementById("inpt_bs_prob").value = bs_prob;
    document.getElementById("inpt_bs_range_min").value = bs_range_min;
    document.getElementById("inpt_bs_range_max").value = bs_range_max;
    document.getElementById("inpt_savePic_width").value = savePic_width;
    document.getElementById("gui-img").src = gui_img_src;
    document.getElementById("auto_draw_checkbox").checked=auto_change;

    let bgimg_select = document.getElementById("default_bgImgSelect");
    for (let i = 0; i < bgimg_select.options.length; i++) {
        let guijiSelect = document.getElementById(bgimg_select.options[i].value);
        for (let j = 0; j < guijiSelect.options.length; j++) {
            guijiSelect.options[j].value = '[\"' + String(eval(guijiSelect.options[j].value)[0] + "?_=" + new Date().getTime()) + '\", \"' + String(eval(guijiSelect.options[j].value)[1] + "?_=" + new Date().getTime()) + '\"]';
        }
    }
    let weather_select = document.getElementById("weather_Select");
    for (let i = 0; i < weather_select.options.length; i++) {
        weather_select.options[i].value = weather_select.options[i].value + "?_=" + new Date().getTime();
    }
}

