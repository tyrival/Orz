/* Created by tyrival on 2016/12/7. */
var Orz = Orz || {};

/*
* ComponentLoader: 组件加载类
* */
Orz.ComponentLoader = {

    /*
    * 组件的加载堆栈
    * */
    componentsStack: null,

    /*
    * 初始化：
    * 根据配置文件的路径查询到配置信息，存储入componentStack，
    * 然后根据配置信息中，各组件的lazy属性依次加载（lazy==false）/不加载（lazy==true）组件
    * */
    init: function () {
        var url = Orz.Application.AppContext + "/" + Orz.Application.ComponentConfig;
        $.ajax({
            url: url,
            async: false,
            dataType: "json",
            success: function (json) {
                if (!Orz.ComponentLoader.componentsStack) {
                    Orz.ComponentLoader.componentsStack = json;
                } else {

                    var klasses = Object.getOwnPropertyNames(json);
                    for (var i = 0; i < klasses.length; i++) {

                        var klass = klasses[i];
                        Orz.ComponentLoader.componentsStack[klass] = Orz.ComponentLoader.componentsStack[klass] || {};

                        var config = json[klass];
                        var properties = Object.getOwnPropertyNames(config);
                        for (var j = 0; j < properties.length; j++) {
                            var prop = properties[j];
                            Orz.ComponentLoader.componentsStack[klass][prop] = config[prop];
                        }
                    }
                }
                var className = Object.getOwnPropertyNames(Orz.ComponentLoader.componentsStack);
                var loadedList = "";
                for (var i = 0; i < className.length; i++) {
                    var config = Orz.ComponentLoader.componentsStack[className[i]];
                    if (config["lazy"] !== true && (!config["loaded"] || true !== config["loaded"])) {
                        Orz.ScriptManager.require(Orz.Application.Package + "/" + config["url"]);
                        loadedList = loadedList + className[i] + ",";
                        config["loaded"] = true;
                    }
                }
                loadedList = loadedList.substring(0, loadedList.length - 1);
                console.warn("Javascript LoadEngine: " + loadedList + " loaded");
            }
        });
    },

    /**
     * 根据组件名获取组件的资源url
     * => 找到组件
     *    => 组件未加载过，则返回组件url
     *    => 已加载过，则return
     * => 未找到，则重新加载一次配置文件，再查找框架自带组件
     * => 未找到，尝试按照Namespace和AppRoot生成url，并返回
     * @param className 类名
     * @returns {string} 组件url
     */
    getComponent: function (className) {
        var cmp = Orz.ComponentLoader.componentsStack[className];
        var url;
        if (!cmp) {
            var prefix = Orz.Application.Package + ".";
            if (className.startsWith(prefix)) {
                Orz.ComponentLoader.init();
                cmp = Orz.ComponentLoader.componentsStack[className];
                if (!cmp) {
                    console.error("未找到类\"" + className + "\"");
                    return;
                }
                if (cmp["loaded"] === true) {
                    return;
                }
            } else {
                prefix = Orz.Application.AppName + ".";
                if (!className.startsWith(prefix)) {
                    return;
                }
                url = className.replace(prefix, '').replace(/\./g, '/');
            }
        } else {
            url = cmp["url"];
        }
        return Orz.Application.Package + "/" + url;
    },

    /**
     * 登记组件
     * @param className
     * @param res
     */
    regComponent: function (className, res) {
        if (!className || !res) {
            return;
        }
        res.loaded = true;
        $.extend(Orz.ComponentLoader.componentsStack[className], res);
    }
}
