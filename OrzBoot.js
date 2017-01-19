/* Created by tyrival on 2016/12/7. */
var Orz = Orz || {};

Orz = {
    // 全局变量
    Application: {
        Config: "OrzBoot.json",
        AppContext: null,
        Package: null,
        UrlRoot: null
    },

    Window: {
        width: 0,
        height: 0,
        init: function () {

        }
    }
};

/**
 * Javascript动态加载
 */
Orz.ScriptManager = {

    IS_SYNC: false,
    IS_ASYNC: true,

    /**
     * 动态加载js脚本
     * @param url 脚本地址
     * @param async 是否异步加载，默认：false
     * @param callback 回调函数
     */
    require: function () {
        var args = arguments;
        if (!args || !args[0]) {
            return;
        }
        var async = args[1] === true ? this.IS_ASYNC : this.IS_SYNC;
        var callback = args[2] || null;
        $.ajax({
            url: args[0],
            async: async,
            dataType: "script",
            complete: function (xhr, ts) {
                if (callback) {
                    callback(xhr, ts);
                }
            },
        });
    },
};

/**
 * 启动项目，加载配置文件
 */
!function () {
    var href = window.location.href;
    Orz.Application.UrlRoot = href.substring(0, href.lastIndexOf("/") + 1);
    var url = Orz.Application.UrlRoot + Orz.Application.Config;
    $.ajax({
        url: url,
        async: false,
        dataType: "json",
        success: function (json) {
            Orz.Application.AppContext = json["AppContext"] === "/" ? "" : json["AppContext"];
            Orz.Application.Package = json["Package"];

            /* 加载js文件 */
            var requires = json["Require"];
            for (var i = 0; i < requires.length; i++) {
                Orz.ScriptManager.require(Orz.Application.AppContext + "/" + Orz.Application.Package + "/" + requires[i]);
            }
            console.warn("Javascript LoadEngine: " + requires + " loaded.");
        }
    });

    // 初始化窗口属性
    Orz.Window.init();
}();