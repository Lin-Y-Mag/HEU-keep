//render.js
//渲染, 将输入的内容放到图片的对应位置
function render() {
    let miles_int = Math.floor(miles);
    let miles_dec = Math.round((miles - miles_int) * 100);
    let speeds_int = Math.floor(speeds);
    let speeds_dec = Math.round((speeds - speeds_int) * 100);
    let times = (speeds_dec / 60 + speeds_int) * miles;
    let timeInc = Math.trunc(times);
    let cost_hour = Math.floor(timeInc / 60);
    let cost_min = timeInc % 60;
    let cost_sec = Math.round((times - timeInc) * 60);
    let calorie = Math.round(69 * miles * 1.036);
    document.getElementById("mile").innerHTML = String(miles_int) + "." + String(addZero(miles_dec));
    document.getElementById("date").innerHTML = String(date_year) + "/" + addZero(date_month) + "/" + addZero(date_day);
    document.getElementById("time").innerHTML = addZero(time_hour) + ":" + addZero(time_min);
    document.getElementById("temperature").innerHTML = String(temperature) + "℃";
    document.getElementById("humidity").innerHTML = String(humidity) + "%";
    document.getElementById("username").innerHTML = username;
    document.getElementById("keep-title").innerHTML = "Keep&nbsp;•&nbsp;" + keep_title;

    document.getElementById("speed").innerHTML = String(addZero(speeds_int)) + "'" + String(addZero(speeds_dec)) + '"';
    document.getElementById("cost-time").innerHTML = String(addZero(cost_hour)) + ":" + String(addZero(cost_min)) + ":" + String(addZero(cost_sec));
    document.getElementById("calorie").innerHTML = addZero(calorie);
}
