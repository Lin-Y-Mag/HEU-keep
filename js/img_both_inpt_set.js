//img_both_inpt_set.js
//按下更改背景图片的按钮时调用的方法
function inpt_bgimg_onClick() {
    document.getElementById("inpt_bgimg").click();
}
//按下更改头像的按钮时调用的方法
function inpt_portrait_onClick() {
    document.getElementById("inpt_portrait").click();
}
//选择并设置背景图片
let tmp_bgimg_osrc;
function bgimg_inpt() {
    var bgimg_oFReader = new FileReader();
    bgimg_oFReader.onload = function (event) {
        var bgimg_osrc = event.target.result;
        tmp_bgimg_osrc = bgimg_osrc;
        if (bgSRC) {
            URL.revokeObjectURL(bgSRC);
        }
        bgSRC = URL.createObjectURL(dataURLtoBlob(bgimg_osrc));
        let IMG = new Image();
        IMG.src = bgSRC;
        setbgImg(bgSRC);
        use_default_bg = false;
    }
    var bgimg_ofile = document.getElementById("inpt_bgimg").files[0];
    bgimg_oFReader.readAsDataURL(bgimg_ofile);
}

function setbgImg(src) {
    return new Promise((resolve, reject) => {
        let bgImg = document.getElementById("bg-img");
        bgImg.src = src;
        bgImg.onload = function () {
            getNaturalSize();
            let IMG = new Image();
            IMG.src = src;
            IMG.onload = function () {
                getNaturalSize();
                if (parseInt(IMG.width) / parseInt(IMG.height) > 0.5010) {
                    document.getElementById("bg-img").style.height = String(bgHeight) + "px";
                    document.getElementById("bg-img").style.width = String(parseInt(IMG.width) * bgHeight / parseInt(IMG.height)) + "px";
                } else {
                    document.getElementById("bg-img").style.height = String(parseInt(IMG.height) * bgWidth / parseInt(IMG.width)) + "px";
                    document.getElementById("bg-img").style.width = String(bgWidth) + "px";
                }
                resolve(); // 图像加载完成，解决Promise
            }
        }
        bgImg.onerror = reject; // 如果加载出错，拒绝Promise
    });
}

let tmp_portrait_src;
//选择并设置头像
function portrait_inpt() {
    var portrait_oFReader = new FileReader();
    portrait_oFReader.onload = function (event) {
        var portrait_osrc = event.target.result;
        tmp_portrait_src = portrait_osrc;
        // 保存到IndexedDB
        // storeData({
        //     id: "user_portrait",
        //     portrait_data: portrait_osrc
        // });

        if (ptSRC) {
            URL.revokeObjectURL(ptSRC)
        }
        ptSRC = URL.createObjectURL(dataURLtoBlob(portrait_osrc));
        document.getElementById("portrait").src = ptSRC;
        let IMG = new Image();
        IMG.src = ptSRC;
        IMG.onload = function () {
            if (parseInt(IMG.width) / parseInt(IMG.height) > 1) {
                document.getElementById("portrait").style.height = String(ptHeight) + "px";
                document.getElementById("portrait").style.width = String(parseInt(IMG.width) * ptHeight / parseInt(IMG.height)) + "px";
            } else {
                document.getElementById("portrait").style.height = String(parseInt(IMG.height) * ptWidth / parseInt(IMG.width)) + "px";
                document.getElementById("portrait").style.width = String(ptWidth) + "px";
            }
        }
    }
    var portrait_ofile = document.getElementById("inpt_portrait").files[0];
    portrait_oFReader.readAsDataURL(portrait_ofile);
}

//恢复默认背景图片
function init_bgimg() {
    setbgImg(default_bgSRC[0]);
    use_default_bg = true;
}
//恢复默认头像
function init_portrait() {
    document.getElementById("portrait").style.height = ptHeight;
    document.getElementById("portrait").style.width = ptHeight;
    document.getElementById("portrait").src = default_portrait_scr;
}
