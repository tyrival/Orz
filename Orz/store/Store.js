Orz.define("Orz.Store", {
    extend: "Orz.Base",

    /* ===================================== Config ========================================= */

    autoLoad: false,  // 创建实例是自动加载数据，默认：false

    data: null,  // 数据对象
    storageMap: null,  // Map存储对象 $id : object

    /**
     * pageSize <= 0 : 不分页
     * remotePage == true && pageSize > 0 ：服务端分页
     * remotePage == false && pageSize > 0 ：客户端分页
     */
    remotePage: true,
    pageSize: 0,
    pageIndex: 1,
    pageTotal: 1,
    total: 0,

    /**
     * field: 数据对象属性映射方式
     * 格式：[ { name: "id", mapper: "id" / function(item) { return data; }, type: string, defaultValue: value }, ...]
     *
     * idProperty：内置id所对应的属性，该属性不能强转为boolean时，才可做为内置id，否则内置id自动生成
     */
    model: {
        fields: [],
        idProperty: null
    },


    filters: [],  // 过滤器

    remoteSort: false, // 是否服务端排序
    remoteSorters: [], // 服务端排序
    localSorters: [],  // 客户端排序

    proxy: {
        url: null,
        async: true,
        params: null,
        dataType: "json",
        response: {
            dataRoot: "list",
            totalProp: "total",
            pageTotalProp: "pageTotal",
        }
    },

    /* ===================================== Method ========================================= */

    init: function () {
        if (this.autoLoad) {
            this.load();
        }
    },

    load: function () {

        var arg = arguments[0];
        if (arg) {
            $.extend(true, this, arg);
        }

        /* 构造参数 */
        var params = this.params || {};
        if (this.remotePage && this.pageSize > 0) {
            params["pageIndex"] = this.pageIndex;
            params["pageSize"] = this.pageSize;
        }
        if (this.remoteSort) {
            for (var i = 0; i < this.remoteSorters.length; i++) {
                var sorter = this.remoteSorters[i];
                var property = sorter["property"];
                var direction = sorter["direction"];
                if (!property) {
                    throw new Error("Store的第" + (i + 1) + "个排序规则未定义property。");
                }
                if (!direction) {
                    direction = "ASC";
                }
                direction = direction.toUpperCase();
                if (direction != "ASC" && direction != "DESC") {
                    throw new Error("Store的第" + (i + 1) + "个排序规则未定义ASC/DESC。");
                }
                params["property[" + i + "]"] = property;
                params["direction[" + i + "]"] = direction;
            }
        }

        /* 数据交互 */
        var me = this;  // TODO 测试 function() { return this }  /  function() { return function() { return this.id } }
        $.ajax({
            url: this.proxy.url,
            dataType: this.proxy.dataType,
            async: this.proxy.async,
            data: params,
            beforeSend: function (xmlHttpRequest) {
                me.listeners.beforeSync(xmlHttpRequest, me);
            },
            success: function (data, status, xmlHttpRequest) {

                /* 解析返回值 */
                me._parseData(data, me);

                /* 格式化数据 */
                me._formatData(me);

                /* 过滤 */
                me._doFilter(me);

                /* 排序 */
                me._doSort(me);

                /* 更新map */
                me._setStorageMap(me);

                /* 刷新视图 */
                me._updateView(me);

                /* event */
                me.listeners.afterSync(me)

            },
            error: function (data, status, xmlHttpRequest) {
                me.listeners.afterSync(data, status, xmlHttpRequest, me)
            },
            complete: function (xmlHttpRequest) {
                me.listeners.afterLoad(me)
            }
        })

    },

    /**
     * 将数据解析为组件可接受的数据对象
     * @param data
     * @param store
     * @private
     */
    _parseData: function (data, store) {
        var response = store.proxy.response;
        var totalProp = response.totalProp;
        var pageTotalProp = response.pageTotalProp;
        var dataRoot = response.dataRoot;

        var items = store._getValueByPropChain(data, dataRoot);
        var total = parseInt(store._getValueByPropChain(data, totalProp)) || 0;
        var pageTotal = parseInt(store._getValueByPropChain(data, pageTotalProp)) || 1;
        pageTotal = pageTotal == 0 ? 1 : pageTotal;

        store.total = total;
        store.pageTotal = pageTotal;
        store.data = items;
    },

    /**
     * 根据配置的field，将数据解析为对象
     * @param items
     * @param store
     * @private
     */
    _formatData: function (store) {

        var items = store.data;
        store.model.idProperty = store.model.idProperty || "$id";
        var idProperty = store.model.idProperty;

        var arr = new Array();
        var fields = store.model.fields;
        for (var j = 0; j < items.length; j++) {
            var item = items[j];
            var obj = {};
            for (var i = 0; i < fields.length; i++) {
                var field = fields[i];
                var name = field["name"];
                var mapper = field["mapper"];
                var type = field["type"];
                var defaultValue = field["defaultValue"];
                var value;
                if (typeof mapper == "string") {
                    value = item[mapper];
                } else if (typeof mapper == "function") {
                    value = mapper(item);
                } else {
                    throw new Error(store.klass + "的第" + i + "项属性设置错误。");
                }
                value = value || defaultValue;
                obj[name] = store._convertDataType(value, type);
            }
            if (obj[idProperty] || obj[idProperty] === true || obj[idProperty] === false) {
                obj["$id"] = Orz.String.uuid();
            } else if (!isNaN(Number(obj[idProperty]))) {
                obj["$id"] = "$id_" + obj[idProperty];
            } else {
                obj["$id"] = obj[idProperty];
            }
            arr.push(obj);
        }
        store.data = arr;
    },

    /**
     * 根据数据类型，对数据进行类型转换
     * @param data
     * @param type
     * @returns {*}
     * @private
     */
    _convertDataType: function (data, type) {
        switch (type) {
            case "string":
                return String(data);
            case "number":
                return Number(data);
            case "date":
                return Orz.Date.parse(data);
            case "boolean":
                return Boolean(data);
            case "integer":
                return parseInt(data);
            case "float":
                return parseFloat(data);
            default:
                throw new Error("Field Type定义错误：" + type);
        }
    },

    /**
     * 根据传入的prop参数，从JSON对象中解析出相应的值
     * @param data
     * @param prop
     * @returns {*}
     * @private
     */
    _getValueByPropChain: function (data, prop) {
        if (!prop || prop == "") {
            return data;
        }
        var propArray = prop.split(".");
        var tmp = data;
        for (var i = 0; i < propArray.length; i++) {
            var key = propArray[i];
            tmp = tmp[key];
        }
        return tmp;
    },

    /**
     * 过滤
     * @param store
     * @returns {*}
     * @private
     */
    _doFilter: function (store) {

        /* 服务端分页时，由于传到前台的对象数量是固定为pageSize的，如果进行过滤，会导致每页数量不一致 */
        if (store.remotePage && store.pageSize > 0) {
            return;
        }

        /* 过滤数据 */
        var data = store.data;
        var filterChain = store.filters;
        var arr = [];
        for (var j = 0; j < data.length; j++) {
            var item = data[j];
            var pass = true;
            for (var i = 0; i < filterChain.length; i++) {
                var filter = filterChain[i];
                if (!filter(item)) {
                    pass = false;
                    break;
                }
            }
            if (!pass) {
                continue;
            }
            arr.push(item);
        }
        store.total = arr.length;  // 总记录数修改为过滤后的数量
        store.data = arr;
    },

    /**
     * 本地排序
     * @param store
     * @returns {*}
     * @private
     */
    _doSort: function (store) {

        var items = store.data;
        if (!items instanceof Array) {
            return;
        }
        store.data = Orz.Array.sortBySorters(items, store.localSorters)
    },

    /**
     * 更新storageMap
     * @private
     */
    _setStorageMap: function () {
        var store = arguments[0] || this;
        store.storageMap = store.storageMap || {};
        var data = store.data;
        for (var i = 0; i < data.length; i++) {
            var obj = data[i];
            store.storageMap[obj["$id"]] = obj;
        }
    },

    /**
     * 更新视图
     * @private
     */
    _updateView: function () {
        var arg0 = arguments[0] || this;
        var cmpIdList = Orz.DataBindManager.getCmpIdListByStoreId(arg0.id);
        for (var i = 0; i < cmpIdList.length; i++) {
            var cmpId = cmpIdList[i];
            var cmp = Orz.ComponentManager.getCmp(cmpId);
            cmp.init();
            cmp.render();
        }
    },

    getData: function () {
        return this.data;
    },

    setData: function () {
        var args = arguments;
        var data = args[0];
        var store = args[1] || this;
        if (data && store && store.data != data) {
            store.data = data;
        }
        store._setStorageMap(store);  // 更新map
        store._updateView(store);  // 更新视图
    },

    addSorter: function (sorter) {
        this.beforeAddSorter(this, sorter);
        if (this.remoteSort) {
            this.addRemoteSorter(sorter);
        } else {
            this.addLocalSorter(sorter);
        }
        this.afterAddSorter(this, sorter);
    },

    removeSorter: function (index) {
        this.beforeRemoveSorter(this, index);
        if (this.remoteSort) {
            this.removeRemoteSorter(index);
        } else {
            this.removeLocalSorter(index);
        }
        this.afterRemoveSorter(this, index);
    },

    addRemoteSorter: function (sorter) {
        if (!this.remoteSort) {
            throw new Error("此Store的remoteSort属性为false，禁止服务端排序。");
            return;
        }
        this.beforeAddRemoteSorter(this, sorter);
        this.remoteSorters.push(sorter);
        this.afterAddRemoteSorter(this, sorter);
    },

    removeRemoteSorter: function (index) {
        if (!this.remoteSort) {
            throw new Error("此Store的remoteSort属性为false，禁止服务端排序。");
            return;
        }
        this.beforeRemoveRemoteSorter(this, index);
        this.remoteSorters.splice(index);
        this.afterRemoveRemoteSorter(this, index);
    },

    addLocalSorter: function (sorter) {
        this.beforeAddLocalSorter(this, sorter);
        this.localSorters.push(sorter);
        this.afterAddLocalSorter(this, sorter);
    },

    removeLocalSorter: function (index) {
        this.beforeRemoveLocalSorter(this, index);
        this.localSorters.splice(index);
        this.afterRemoveLocalSorter(this, index);
    },

    addFilter: function (filter) {
        this.beforeAddFilter(this, filter);
        this.filters.push(filter);
        this.afterAddFilter(this, filter);
    },

    removeFilter: function (index) {
        this.beforeRemoveFilter(this, index);
        this.filters.splice(index);
        this.afterRemoveFilter(this, index);
    },

    getParams: function () {
        return this.proxy.params;
    },

    setParams: function (params) {
        this.proxy.params = params;
    },

    getProxy: function () {
        return this.proxy;
    },

    setProxy: function (proxy) {
        this.proxy = proxy
    },

    getAutoLoad: function () {
        return this.autoLoad;
    },

    setAutoLoad: function (autoLoad) {
        this.autoLoad = autoLoad;
        console.log("将store设置为autoLoad=true，但它不会自动触发重新加载。");
    },

    /**
     * 销毁
     */
    destroy: function () {
        var cmpId = Orz.DataBindManager.unregisterByStoreId(this.id);
        Orz.ComponentManager.getCmp(cmpId).setStore(null);
    },

    /* ===================================== Event ========================================= */

    listeners: {
        afterLoad: function (xmlHttpRequest, store) {
        },
        beforeSync: function (xmlHttpRequest, store) {
        },
        afterSync: function (store) {
        },
        beforeAddSorter: function (store, sorter) {
        },
        afterAddSorter: function (store, sorter) {
        },
        beforeAddRemoteSorter: function (store, sorter) {
        },
        afterAddRemoteSorter: function (store, sorter) {
        },
        beforeAddLocalSorter: function (store, sorter) {
        },
        afterAddLocalSorter: function (store, sorter) {
        },
        beforeRemoveSorter: function (store, index) {
        },
        afterRemoveSorter: function (store, index) {
        },
        beforeRemoveRemoteSorter: function (store, index) {
        },
        afterRemoveRemoteSorter: function (store, index) {
        },
        beforeRemoveLocalSorter: function (store, index) {
        },
        afterRemoveLocalSorter: function (store, index) {
        },
        beforeAddFilter: function (store, filter) {
        },
        afterAddFilter: function (store, filter) {
        },
        beforeRemoveFilter: function (store, index) {
        },
        afterRemoveFilter: function (store, index) {
        },
    }

});
