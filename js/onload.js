//onload.js
//初始化变量


window.onload = async function () {
    let datetime_now = new Date();
    date_year = datetime_now.getFullYear();
    date_month = datetime_now.getMonth() + 1;
    date_day = datetime_now.getDate();
    time_hour = datetime_now.getHours();
    time_min = datetime_now.getMinutes();
    username = "用户名";
    keep_title = "哈尔滨工程大学南田径场";
    humidity = 23;
    temperature = 12;
    bs = true;
    bs_prob = 0.08;
    bs_range_min = 30;
    bs_range_max = 40;
    savePic_width = 1080;
    km_min = 2.2;
    km_max = 3.9;
    speed_min = 4.3;
    speed_max = 5.2;
    auto_change = true;

    document.getElementById('min_miles').value = km_min;
    document.getElementById('max_miles').value = km_max;

    document.getElementById('min_speeds').value = speed_min;
    document.getElementById('max_speeds').value = speed_max;
    speed_min = parseFloat(speed_min);
    speed_max = parseFloat(speed_max);
    km_max = parseFloat(km_max);
    km_min = parseFloat(km_min);
    miles = Math.floor((km_min + Math.random() * (km_max - km_min)) * 100) / 100;
    speeds = Math.floor((speed_min + Math.random() * (speed_max - speed_min)) * 100) / 100;

    document.getElementById("inpt_miles").value = miles;
    document.getElementById("inpt_speeds").value = speeds;
    document.getElementById("auto_draw_checkbox").checked = auto_change;
    // function updateSelectedOption() {//预设图片
    //     // 获取<select>元素
    //     const selectElement = document.getElementById('guiji_Select_1');
    //     // 转换default_bgSRC为字符串，以便与<option>的值进行比较
    //     let valueToMatch = JSON.stringify(default_bgSRC[0]);
    //     valueToMatch = valueToMatch.replace(/\?.*/, '"')
    //     valueToMatch = valueToMatch.substring(1, valueToMatch.length - 1);
    //     // 遍历所有<option>元素
    //     for (let i = 0; i < selectElement.options.length; i++) {

    //         let matches = selectElement.options[i].value.replace(/(")([^"]+)\?.*?(")/g, '$1$2$3').match(/"(images\/[^"]+\.png)"/);
    //         if (matches && matches[1]) {
    //             htmlString = matches[1];
    //         }
    //         // 如果<option>的值与default_bgSRC匹配
    //         if (htmlString === valueToMatch) {
    //             // 设置该<option>为选中状态
    //             selectElement.options[i].selected = true;
    //             break;  // 匹配到了就退出循环
    //         }
    //     }
    // }

    // render()
    document.addEventListener('dbReady', async function () {
        // 尝试从IndexedDB检索数据
        retrieveData("user_info", function (err, data) {
            // console.log("1", data.username, data.km_max);
            if (data) {
                username = data.username || username;
                keep_title = data.keep_title || keep_title;
                km_min = data.km_min || 2.2;
                km_max = data.km_max || 3.9;
                speed_min = data.speed_min || 4.3;
                speed_max = data.speed_max || 5.2;
                default_bgSRC = data.default_bgSRC || default_bgSRC;
                display_guijiSelect_id = data.display_guijiSelect_id || display_guijiSelect_id;
                bs = data.bs;
                bs_prob = data.bs_prob || bs_prob;
                bs_range_min = data.bs_range_min || bs_range_min;
                bs_range_max = data.bs_range_max || bs_range_max;
                savePic_width = data.savePic_width || savePic_width;
                auto_change = data.auto_change;
                // updateSelectedOption(); //预设图片


                // ...为其他属性设置值...
                document.getElementById("inpt_username").value = username;
                document.getElementById("inpt_keep_title").value = keep_title;

                document.getElementById('min_miles').value = km_min;
                document.getElementById('max_miles').value = km_max;
                document.getElementById('min_speeds').value = speed_min;
                document.getElementById('max_speeds').value = speed_max;

                speed_min = parseFloat(speed_min);
                speed_max = parseFloat(speed_max);
                km_max = parseFloat(km_max);
                km_min = parseFloat(km_min);
                miles = Math.floor((km_min + Math.random() * (km_max - km_min)) * 100) / 100;
                speeds = Math.floor((speed_min + Math.random() * (speed_max - speed_min)) * 100) / 100;

                document.getElementById("inpt_miles").value = miles;
                document.getElementById("inpt_speeds").value = speeds;
                document.getElementById("default_bgImgSelect").value = display_guijiSelect_id;
                document.getElementById(display_guijiSelect_id).style.display = "inline";
                default_bgSRC = eval(document.getElementById(display_guijiSelect_id).value);
                setbgImg(default_bgSRC[0]);

                if (bs) {
                    document.getElementById("bs_prop_inpt_wrap").style.display = "list-item";
                    document.getElementById("inpt_bs_range_wrap").style.display = "list-item";
                } else {
                    document.getElementById("bs_prop_inpt_wrap").style.display = "none";
                    document.getElementById("inpt_bs_range_wrap").style.display = "none";
                }

                document.getElementById("inpt_colorchange_checkbox").checked = bs;
                document.getElementById("auto_draw_checkbox").checked = auto_change;

                document.getElementById("inpt_bs_prob").value = bs_prob;
                document.getElementById("inpt_bs_range_min").value = bs_range_min;
                document.getElementById("inpt_bs_range_max").value = bs_range_max;
                document.getElementById("inpt_savePic_width").value = savePic_width;

                render()
            }
        });

        retrieveData("user_portrait", function (err, data) {
            // console.log("2");
            if (data && data.portrait_data) {
                let IMG = new Image();
                IMG.src = data.portrait_data;
                document.getElementById("portrait").src = IMG.src;

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

            var portrait_ofile = document.getElementById("inpt_portrait").files;
            if (portrait_ofile && portrait_ofile.length > 0) {
                var portrait_oFReader = new FileReader();
                portrait_oFReader.readAsDataURL(portrait_ofile[0]);
            }
        });

        retrieveData("user_bgimg", function (err, data) {
            if (data && data.bgimg_data) {
                setbgImg(data.bgimg_data).then(() => {
                    console.log("背景图像设置并适配完成！");
                }).catch(error => {
                    console.error("设置背景图像时出错：", error);
                });
            }

            var bgimg_ofile = document.getElementById("inpt_bgimg").files;
            if (bgimg_ofile && bgimg_ofile.length > 0) {
                var bgimg_oFReader = new FileReader();
                bgimg_oFReader.readAsDataURL(bgimg_ofile[0]);

                bgimg_oFReader.onload = function (e) {
                    setbgImg(e.target.result).then(() => {
                        console.log("新选择的背景图像设置并适配完成！");
                    }).catch(error => {
                        console.error("设置新背景图像时出错：", error);
                    });
                }
            }
        });


    });
    // 初始化您的输入框和其他数据
    initInputData();
    init_portrait()
    default_bgImgSelect_onChange();
    weather_Select_onChange();
    inpt_colorchange_checkbox_onchange();
    render();
    dbReady()

    // 尝试获取天气数据
    try {
        const weatherData = await loadAMapWeather();
        temperature = parseInt(weatherData.temperature);
        humidity = parseInt(weatherData.humidity);
        // console.log("Weather data:", weatherData.temperature);

        document.getElementById("inpt_temperature").value = temperature;
        document.getElementById("inpt_humidity").value = humidity;

        document.getElementById("temperature").innerHTML = String(temperature) + "℃";
        document.getElementById("humidity").innerHTML = String(humidity) + "%";

    } catch (err) {
        temperature = 10; // 默认值
        humidity = 42;    // 默认值
        console.error("Error occurred when fetching weather:", err);
        alert('温度、湿度获取失败，请手动输入');
    }
    // Call the drawMine function
    let url = 'https://tool.joytion.cn/generate-track';

    
    if (auto_change) {
        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Cannot Fetch');
                }
                return response.json();
            })
            .then(data => {
                console.log('成功获取JSON数据:');
                drawMine(url).then(() => {
                    console.log('Completed drawing');
                });
            })
            .catch(error => {
                console.log('Json_Get_Error:', error);
            });
    }

//	    setTimeout(function() {window.scrollTo(0, 1)}, 0)
}
