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
Orz.JsLoader = {
    sync: function (url) {
        $.ajax({
            url: url,
            async: false,
            dataType: "script",
        });
    }
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
                Orz.JsLoader.sync(Orz.Application.AppContext + "/" + Orz.Application.Package + "/" + requires[i]);
            }
            console.warn("Javascript LoadEngine: " + requires + " loaded.");
        }
    });

    // 初始化窗口属性
    Orz.Window.init();
}();