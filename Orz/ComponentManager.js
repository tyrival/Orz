/* Created by tyrival on 2016/12/9. */
var Orz = Orz || {};

Orz.ComponentManager = {

    /**
     * 堆栈: {
     *   id_1: component_a,
     *   id_2: component_b
     * }
     */
    stack: {},

    /**
     * 父子关系堆栈: {
     *   childId_1: parentId_1,
     *   childId_2: parentId_1
     * }
     */
    subjection: {},

    /**
     * 流水号: {
     *   class_1: 3,
     *   class_2: 10
     * }
     */
    serial: {},

    /**
     * 根据id查找component
     * @param id
     * @returns Component
     */
    getCmp: function (id) {
        return Orz.ComponentManager.stack[id];
    },

    /**
     * 注册组件
     * @param cmp
     */
    register: function (cmp) {
        var cmpId = cmp.id;
        Orz.ComponentManager.stack[cmpId] = cmp;
    },

    /**
     * 注销组件
     * @param cmp
     */
    unregister: function (cmpId) {
        delete Orz.ComponentManager.stack[cmpId];
    },

    /**
     * 注册父子关系
     * @param childId
     * @param parentId
     */
    registerSub: function (childId, parentId) {
        Orz.ComponentManager.subjection[childId] = parentId;
    },

    /**
     * 注销父子关系
     * @param childId
     * @param parentId
     */
    unregisterSub: function (childId) {
        delete Orz.ComponentManager.subjection[childId];
    },

    /**
     * 获取父组件
     * @param childId
     * @returns {*|Component}
     */
    getParent: function (childId) {
        var parentId = Orz.ComponentManager.subjection[childId];
        return Orz.ComponentManager.getCmp(parentId);
    },

    /**
     * 获取子组件
     * @param parentId
     * @returns {Array}
     */
    getChildren: function (parentId) {
        var children = [];
        var subList = Orz.ComponentManager.subjection;
        if (subList && subList.length > 0) {
            var childIdList = Object.getOwnPropertyNames(subList);
            for (var i = 0; i < childIdList.length; i++) {
                var childId = childIdList[i];
                var pid = subList[childId];
                if (pid = parentId) {
                    children.push(Orz.ComponentManager.getCmp(childId));
                }
            }
        }
        return children;
    },

    /**
     * 递归获取子组件
     * @param cmpId
     */
    getDescendants: function (cmp) {
        var cmpId = cmp.id;
        var decendants = [];
        if (!cmpId) {
            return decendants;
        }
        var items = cmp.items;
        if (items && items.length > 0) {
            for (var i = 0; i < items.length; i++) {
                var item = items[i];
                decendants.push(item);
                decendants = decendants.concat(Orz.ComponentManager.getDescendants(item));
            }
        }
        return decendants;
    },

    popNextSerial: function (klass) {
        var serial = Orz.ComponentManager.serial[klass];
        if (!serial) {
            serial = 1;
        } else {
            serial++;
        }
        Orz.ComponentManager.serial[klass] = serial;
        return serial;
    },

    /**
     * 定义组件
     * @param klass 类名
     * @param config 配置
     */
    define: function (klass, config) {
        config["klass"] = klass;
        var extend = config["extend"];
        if (Orz.ClassManager.stack[klass]) {
            throw new Error(klass + "类已存在，不可重复定义。");
        }
        Orz.ClassManager.stack[klass] = function () {
        };
        if (extend) {
            var parent = Orz.ClassManager.getClass(extend);
            Orz.ClassManager.stack[klass].prototype = Object.create(parent.prototype);
        }
        $.extend(true, Orz.ClassManager.stack[klass].prototype, config);
    },

    /**
     * 创建组件实例
     * @param klass 类名
     * @param config 配置
     */
    create: function () {
        var klass = arguments[0];
        var config = arguments[1] ? arguments[1] : {};
        config["klass"] = klass;
        var decendants = Orz.ComponentManager._getDescendantsLoadList(config);
        Orz.ComponentManager._loadDescendants(decendants, klass, config);
        return Orz.ComponentManager._doCreate(klass, config);
    },

    /**
     * 重写类，修改已经存在的类的属性
     * @param klass
     * @param config
     */
    override: function (klass, config) {
        // TODO
    },

    _doCreate: function (klass, config) {

        /* 创建类的实例，并用config覆盖属性 */
        var component = Object.create(Orz.ClassManager.getClass(klass).prototype);
        $.extend(component, config);

        /* 创建实例时赋予id */
        var cmpId = component.id;
        if (!cmpId) {
            cmpId = klass.replace(/\./g, "-") + "-" + Orz.ComponentManager.popNextSerial(klass);
            component.id = cmpId;
        }

        if (component.items) {
            component.innerId = cmpId + "-" + "in";
        }

        /* 递归处理子元素 */
        Orz.ComponentManager.handlerItems(component);
        /* ComponentManager注册 */
        Orz.ComponentManager.register(component);

        /* DataBindManager注册 */
        if (component.hasOwnProperty("store")) {
            var store = component.store;
            var storeId = null
            if (store instanceof Orz.ClassManager.getClass("Orz.Store")) {
                storeId = store.id;
            } else {
                storeId = store;
            }
            Orz.DataBindManager.register(cmpId, storeId);
        }

        /* 根据配置生成html代码 */
        component.init();

        /* 根据配置情况装载代码 */
        if (!component["isSubItem"]) {
            if (component["renderTo"]) {
                component.render();
            }
        }

        return component;
    },

    /**
     * 递归处理子元素，生成html
     * @param cmp
     * @returns {*}
     */
    handlerItems: function (cmp) {
        var itemsHtml = "";
        var itemList = cmp.items
        if (itemList && itemList.length > 0) {
            for (var i = 0; i < itemList.length; i++) {
                var item = itemList[i];
                item["isSubItem"] = true;
                var klass = item.klass;
                var childCmp = Orz.ComponentManager._doCreate(klass, item);
                itemsHtml += childCmp.html;
                Orz.ComponentManager.registerSub(childCmp.id, cmp.id);  // 注册父子关系
            }
            cmp.itemsHtml = itemsHtml;
        }
        return cmp;
    },

    /**
     * 递归加载所有组件
     * @param loadList
     * @private
     */
    _loadDescendants: function (loadList, klass, config) {
        if (!loadList || loadList.length <= 0) {
            return;
        } else {
            var path = loadList.shift();
            Orz.ScriptManager.require(path);
            Orz.ComponentManager._loadDescendants(loadList, klass, config, callback);
        }
    },

    /**
     * 获取cmp中未被加载的所有类
     * @param cmp
     * @returns {Array}
     * @private
     */
    _getDescendantsLoadList: function (cmp) {
        var descendants = [];
        if (!Orz.ClassManager.getClass(cmp.klass)) {
            descendants.push(Orz.ComponentLoader.getComponent(cmp.klass));
        }
        var items = cmp.items;
        if (!items) {
            return descendants;
        }
        if (items.length > 0) {
            for (var i = 0; i < items.length; i++) {
                var item = items[i];
                descendants = descendants.concat(Orz.ComponentManager._getDescendantsLoadList(item));
            }
        }
        return descendants;
    }
};

Orz.getCmp = function (id) {
    return Orz.ComponentManager.getCmp(id);
}

Orz.define = function (klass, config) {
    return Orz.ComponentManager.define(klass, config);
}

Orz.create = function (klass, config) {
    return Orz.ComponentManager.create(klass, config);
}

Orz.getParent = function (childId) {
    return Orz.ComponentManager.getParent(childId);
}