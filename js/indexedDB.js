//indexedDB.js
let db;
const dbName = "MyDatabase";
const storeName = "UserInfoStore";

// 打开IndexedDB数据库
const request = indexedDB.open(dbName, 1);

// 请求永久存储
if (navigator.storage && navigator.storage.persist) {
    navigator.storage.persist().then(granted => {
        if (granted) {
            console.log("Storage will not be cleared except by explicit user action");
        } else {
            console.log("Storage may be cleared by the browser under storage pressure.");
        }
    });
}
request.onupgradeneeded = function (event) {
    db = event.target.result;
    const objectStore = db.createObjectStore(storeName, { keyPath: "id" });
    objectStore.createIndex("username", "username", { unique: false });
    // 可以为其他属性创建更多的索引
};

request.onsuccess = function (event) {
    db = event.target.result;
    dbReady();
};

request.onerror = function (event) {
    console.log("Error opening DB", event);
};

function storeToIndexedDB(portrait_osrc, bgimg_osrc) {
    const data = {
        id: "user_info",
        username: username,
        keep_title: keep_title,
        km_min: km_min,
        km_max: km_max,
        speed_min: speed_min,
        speed_max: speed_max,
        default_bgSRC: default_bgSRC,
        display_guijiSelect_id: display_guijiSelect_id,
        bs: bs,
        bs_prob: bs_prob,
        bs_range_min: bs_range_min,
        bs_range_max: bs_range_max,
        savePic_width: savePic_width,
        auto_change: auto_change,
        // ...其他要保存的属性...
    };
    storeData(data);
    if (portrait_osrc) {
        storeData({
            id: "user_portrait",
            portrait_data: portrait_osrc
        });
    }
    if (bgimg_osrc) {
        storeData({
            id: "user_bgimg",
            bgimg_data: bgimg_osrc
        });
    }
    showMessage("用户数据已永久保存。\n（你不换浏览器的话）");
    // alert('用户名、头像、标题已永久保存（你不换浏览器的话）。');
}
function showMessage(msg) {
    const messageBox = document.getElementById('messageBox');
    if (msg) {
        messageBox.textContent = msg;
        messageBox.innerHTML = msg.replace(/\n/g, '<br>');
    }
    messageBox.style.display = 'block'; // 显示消息框
    setTimeout(function () {
        messageBox.style.display = 'none'; // 3秒后隐藏消息框
    }, 3000);
}

function storeData(data) {
    const transaction = db.transaction([storeName], "readwrite");
    const objectStore = transaction.objectStore(storeName);
    const request = objectStore.put(data);
    request.onsuccess = function (event) {
        console.log("Data stored successfully");
    };
    request.onerror = function (event) {
        console.log("Error storing data", event);
    };
}

function retrieveData(key, callback) {
    const transaction = db.transaction([storeName]);
    const objectStore = transaction.objectStore(storeName);
    const request = objectStore.get(key);
    request.onsuccess = function (event) {
        callback(null, request.result);
    };
    request.onerror = function (event) {
        callback(event);
    };
}

function dbReady() {
    let event = new Event('dbReady');
    document.dispatchEvent(event);
}

function clearIndexedDB() {
    const transaction = db.transaction([storeName], "readwrite");
    const objectStore = transaction.objectStore(storeName);
    const request = objectStore.clear();

    request.onsuccess = function (event) {
        console.log("所有数据已成功清除");
        showMessage("所有数据已成功清除");
    };

    request.onerror = function (event) {
        console.log("清除数据时出错", event);
        showMessage("清除数据时出错");
    };
}
