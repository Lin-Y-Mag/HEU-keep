// amapHelper.js
window._AMapSecurityConfig = {
    serviceHost:'https://tool.joytion.cn/_AMapService',  
};

function loadAMapWeather() {
    return new Promise((resolve, reject) => {
        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = 'https://webapi.amap.com/maps?v=1.4.15&key=d3a5f2c7492f544d029b17a4c30977a9';
        document.body.appendChild(script);

        script.onload = function() {
            AMap.plugin('AMap.Weather', function() {
                var amp_weather = new AMap.Weather();
                amp_weather.getLive('南岗区', function(err, data) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(data);
                    }
                });
            });
        };
    });
}

// function loadAMapWeather(callback) {
//     var script = document.createElement('script');
//     script.type = 'text/javascript';
//     script.src = 'https://webapi.amap.com/maps?v=1.4.15&key=d3a5f2c7492f544d029b17a4c30977a9';
//     document.body.appendChild(script);

//     script.onload = function() {
//         AMap.plugin('AMap.Weather', function() {
//             var amp_weather = new AMap.Weather();
//             amp_weather.getLive('南岗区', function(err, data) {
//                 callback(err, data);
//             });
//         });
//     }
// }
