//download_img.js
//下载截图
function Download(func = Download1) {
    let ele = document.getElementById("new-Img");
    buffer_canvas = document.getElementById("buffer_canvas");
    buffer_canvas.width = savePic_width;
    buffer_canvas.height = Math.floor(savePic_width * 2157 / 1080);
    let scale = savePic_width / document.getElementById("new-Img").getBoundingClientRect().width;
    html2canvas(ele, {
        canvas: buffer_canvas,
        useCORS: true,
        logging: false,
        height: buffer_canvas.height,
        width: buffer_canvas.width,
        scale: scale,
    }).then(func);
}
// 使用a元素
function Download1(buffer_canvas) {
    let dataurl = buffer_canvas.toDataURL('image/png');
    let donwLink = document.createElement('a');
    donwLink.Download = "keep" + (date_month) + "月" + (date_day) + "日" + "跑步打卡.png";
    donwLink.download = "keep" + (date_month) + "月" + (date_day) + "日" + "跑步打卡.png";
    donwLink.href = dataurl;
    donwLink.style = 'display: none';
    donwLink.dataset.downloadurl = ["image/png", donwLink.download, donwLink.href].join(':');
    document.body.appendChild(donwLink);
    donwLink.click();
    document.body.removeChild(donwLink);
}


function Download2(buffer_canvas) {

	    let dataurl = buffer_canvas.toDataURL('image/png');

	    window.open('about:blank', 'image').document.write("<img src='" + dataurl + "' alt='from canvas'/>");

}



// ObjectURL
function Download3(buffer_canvas) {
    let dataurl = buffer_canvas.toDataURL('image/png');
    let picURL = URL.createObjectURL(dataURLtoBlob(dataurl));
    let donwLink = document.createElement('a');
    donwLink.Download = "keep" + (date_month) + "月" + (date_day) + "日" + "跑步打卡.png";
    donwLink.download = "keep" + (date_month) + "月" + (date_day) + "日" + "跑步打卡.png";
    donwLink.href = picURL;
    donwLink.style = 'display: none';
    donwLink.dataset.downloadurl = ["image/png", donwLink.download, donwLink.href].join(':');
    document.body.appendChild(donwLink);
    donwLink.click();
    document.body.removeChild(donwLink);
    URL.revokeObjectURL(picURL);
}
// window.location.href
function Download4(buffer_canvas) {
    window.location.href = buffer_canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
}
