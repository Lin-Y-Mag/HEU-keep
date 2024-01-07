async function delay(time) {
    return new Promise(function (resolve) {
        setTimeout(resolve, time);
    });
}


async function drawMine(jsonpath) {
    await inpt_drawbtn_onClick();
    await delay(300); // 添加延迟
    try {
        await Json2Draw(jsonpath);
    } catch (error) {
        console.error("An error occurred while drawing:", error);
        alert('无法连接到服务器，请稍后再试。');
        return; // Exit if Json2Draw fails
    }
    await delay(300); // 添加延迟
    await drawpic_yesbtn_onClick();
}
