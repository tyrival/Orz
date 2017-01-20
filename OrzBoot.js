/* Created by tyrival on 2016/12/7. */
var Orz = Orz || {};

Orz = {

    /* 全局变量 */
    Application: {
        AppRoot: null,           // 二次开发: 根文件夹
        AppName: null,           // 二次开发: 命名空间，即类名中第一个"."之前的部分

        AppContext: null,        // 框架上下文 TODO 加入工程时，需修改OrzBoot.json使其为"/"
        Package: null,           // 框架源码所在文件夹名
        ComponentConfig: null,   // 框架自带组件的加载配置文件在AppContext中的路径
        Require: null,           // 初始加载的js路径清单
        UrlRoot: null            // 工程发布的地址
    },

    /* 窗口属性 */
    Window: {
        width: 0,
        height: 0,
        window: null,
        get: function () {
            return this.window;
        },
        getHeight: function () {
            return this.height;
        },
        getWidth: function () {
            return this.width;
        },
        init: function () {
            Orz.Window.window = window;
            var $win = $(window);
            Orz.Window.width = $win.width();
            Orz.Window.height = $win.height();
        }
    },

    /**
     * 启动项目，加载配置文件
     */
    config: "OrzBoot.json",
    boot: function (appConfig) {
        var href = window.location.href;
        Orz.Application.UrlRoot = href.substring(0, href.lastIndexOf("/") + 1);
        var url = Orz.Application.UrlRoot + Orz.config;
        $.ajax({
            url: url,
            async: false,
            dataType: "json",
            success: function (json) {

                $.extend(Orz.Application, json);
                if (appConfig) {
                    $.extend(Orz.Application, appConfig);
                }

                if (Orz.Application.AppContext === "/") {
                    Orz.Application.AppContext = "";
                }
                /* 加载js文件 */
                var requires = Orz.Application.Require;
                for (var i = 0; i < requires.length; i++) {
                    Orz.ScriptManager.require(Orz.Application.AppContext + "/" + requires[i]);
                }
                console.warn("Javascript LoadEngine: " + requires + " loaded.");
            }
        });

        // 初始化窗口属性
        Orz.Window.init();

        // 初始化ComponentLoader
        Orz.ComponentLoader.init();
    },

    emptyFn: function () { }
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
        var param = args[2] || null;
        var callback = args[3] || null;
        $.ajax({
            url: args[0],
            async: async,
            dataType: "script",
            success: function (xhr, ts) {
                if (callback) {
                    callback(param, xhr, ts);
                }
            },
        });
    },
};