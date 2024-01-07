//select_manner.js
//选择预设图片
function default_bgImgSelect_onChange() {
    if (display_guijiSelect_id) {
        document.getElementById(display_guijiSelect_id).style.display = "none";
    }
    display_guijiSelect_id = document.getElementById("default_bgImgSelect").value;
    document.getElementById(display_guijiSelect_id).style.display = "inline"
    default_bgSRC = eval(document.getElementById(display_guijiSelect_id).value);
    setbgImg(default_bgSRC[0]);
}
function guijiSelect_onChange() {
    default_bgSRC = eval(document.getElementById(display_guijiSelect_id).value);
    setbgImg(default_bgSRC[0]);
}
//选择天气
function weather_Select_onChange() {
    document.getElementById("weather").src = document.getElementById("weather_Select").value;
}

