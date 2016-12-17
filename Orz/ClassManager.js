/* Created by tyrival on 2016/12/7. */
var Orz = Orz || {};

/**
 * 类管理器，用于注册所有加载的类 ClassManager.getClass(类名)
 * return 配置属性
 */
Orz.ClassManager = {

    stack: { },

    getClass: function (klass) {
        return Orz.ClassManager.stack[klass];
    },

    setClass: function (klass, declarations) {
        Orz.ClassManager.stack[klass] = declarations;
        return Orz.ClassManager.stack[klass];
    }
};
