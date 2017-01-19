/* Created by tyrival on 2016/12/7. */
var Orz = Orz || {};

Orz.ComponentLoader = {

    config: 'components.json',
    componentsStack: null,

    init: function () {
        var url = Orz.Application.Package + "/" + this.config;
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
    
    getComponent: function (className) {
        var cmp = Orz.ComponentLoader.componentsStack[className];
        if (!cmp) {
            Orz.ComponentLoader.init();
            cmp = Orz.ComponentLoader.componentsStack[className];
        }
        if (!cmp || !cmp["url"]) {
            console.error("未找到类\"" + className + "\"");
            return;
        }
        if (cmp["loaded"] === true) {
            return;
        }
        return Orz.Application.Package + "/" + cmp["url"];
    },
}

// 初始化ComponentLoader
Orz.ComponentLoader.init();
