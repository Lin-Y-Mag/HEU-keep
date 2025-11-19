//onload.js
//初始化变量

window.onload = async function () {
    // 优化1：优先获取页面上已经被新API填入的数值，如果为空再使用默认值
    // 这样可以防止旧代码把新API获取到的真实天气覆盖掉
    let currentTemp = document.getElementById("inpt_temperature") ? document.getElementById("inpt_temperature").value : "";
    let currentHum = document.getElementById("inpt_humidity") ? document.getElementById("inpt_humidity").value : "";

    let datetime_now = new Date();
    date_year = datetime_now.getFullYear();
    date_month = datetime_now.getMonth() + 1;
    date_day = datetime_now.getDate();
    time_hour = datetime_now.getHours();
    time_min = datetime_now.getMinutes();
    username = "用户名";
    keep_title = "哈尔滨工程大学南田径场";
    
    // 优化1续：如果currentTemp有值（例如23），就用它；否则用默认值(如45%)
    humidity = currentHum ? parseInt(currentHum) : 45; 
    temperature = currentTemp ? parseInt(currentTemp) : 20;
    
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

    // 优化2：注释掉旧的天气获取逻辑，彻底解决弹窗问题
    // 并且避免旧接口失败后覆盖新接口获取到的数据
    /*
    try {
        const weatherData = await loadAMapWeather();
        temperature = parseInt(weatherData.temperature);
        humidity = parseInt(weatherData.humidity);

        document.getElementById("inpt_temperature").value = temperature;
        document.getElementById("inpt_humidity").value = humidity;

        document.getElementById("temperature").innerHTML = String(temperature) + "℃";
        document.getElementById("humidity").innerHTML = String(humidity) + "%";

    } catch (err) {
        temperature = 10; // 默认值
        humidity = 42;    // 默认值
        console.error("Error occurred when fetching weather:", err);
        alert('温度、湿度获取失败，请手动输入'); // <--- 这里就是弹窗的来源
    }
    */

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
}