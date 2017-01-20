Orz.define("Orz.Component", {
    extend: "Orz.Base",

    /* ===================================== Config ========================================= */

    renderTo: null,  // 渲染位置为 ComponentId 或 DomId，选择逻辑依次为 ComponentId-in > ComponentId > DomId

    html: null,  // 生成的html

    cls: null,  // dom的class属性

    style: null,  // dom的style属性

    display: true,  // 是否显示（不占位）

    visibility: true,  // 是否显示（占位）

    disabled: false,  // 是否禁用

    readonly: false,  // 是否只读

    height: null,  // 高度

    width: null,  // 宽度

    innerHtml: null,  // 内部html

    itemsHtml: null,  // 子组件html

    margin: 0,

    padding: 0,

    scrollable: null,  // 滚动样式 "x" | "y" | true | false | null(default)

    data: null,

    store: null,

    /* ===================================== Method ========================================= */

    /*  getter / setter  */
    getStore: function () {
        return this.store;
    },

    setStore: function (store) {
        var isChange = store != this.store;
        if (isChange) {
            if (typeof(this.listeners.beforeChange) == 'function') {
                this.listeners.beforeChange(this);
            }
            this.store = store;
            if (typeof(this.listeners.afterChange) == 'function') {
                this.listeners.afterChange(this);
            }
            if (!this.store || this.store.getAutoLoad()) {
                if (this.store) {
                    this.store.load();
                }
                this.init();
                this.render();
            }
        }
    },

    getData: function () {
        return this.data;
    },

    setData: function (data) {
        var isChange = data != this.data;
        if (isChange) {
            if (typeof(this.listeners.beforeChange) == 'function') {
                this.listeners.beforeChange(this);
            }
            this.data = data;
            if (typeof(this.listeners.afterChange) == 'function') {
                this.listeners.afterChange(this);
            }
            this.init();
            this.render();
        }
    },

    getScrollable: function () {
        return this.scrollable;
    },

    setScrollable: function (scrollable) {
        this.scrollable = scrollable;
        var e = $("#" + this.id);
        if (e) {
            e.removeClass("scrollable");
            e.removeClass("scrollable-x");
            e.removeClass("scrollable-y");
            e.addClass(this._getScrollableCls());
        }
    },

    getPadding: function () {
        return this.padding;
    },

    setPadding: function (padding) {
        this.padding = padding;
        var e = $("#" + this.id);
        if (e) {
            e.css("padding", padding);
        }
    },

    getMargin: function () {
        return this.margin;
    },

    setMargin: function (margin) {
        this.margin = margin;
        var e = $("#" + this.id);
        if (e) {
            e.css("margin", margin);
        }
    },

    getWidth: function () {
        if (!this.width) {
            throw new Error("未设置 \"" + this.klass + "\" 的宽度。");
        }
        return this.width;
    },

    setWidth: function (width) {
        this.width = width;
        var h = width.endsWith("%") ? width : width + "px";
        var e = $("#" + this.id);
        if (e) {
            e.width(h);
        }
    },

    getHeight: function () {
        if (!this.height) {
            throw new Error("未设置 \"" + this.klass + "\" 的高度。");
        }
        return this.height;
    },

    setHeight: function (height) {
        this.height = height;
        var h = height.endsWith("%") ? height : height + "px";
        var e = $("#" + this.id);
        if (e) {
            e.height(h);
        }
    },

    getVisibility: function () {
        return !!this.visibility;
    },

    setVisibility: function (visibility) {
        this.visibility = !!visibility;
        var e = $("#" + this.id);
        if (e) {
            e.removeClass("visible");
            e.removeClass("no-visible");
            e.addClass(this._getVisibilityCls());
        }
    },

    getDisabled: function () {
        return !!this.disabled;
    },

    setDisabled: function (disabled) {
        this.disabled = !!disabled;
        var e = document.getElementById(this.id);
        if (e) {
            e.disabled = !!disabled;
        }
    },

    getReadonly: function () {
        return !!this.readonly;
    },

    setReadonly: function (readonly) {
        this.readonly = !!readonly;
        var e = document.getElementById(this.id);
        if (e) {
            e.readonly = !!readonly;
        }
    },

    getDisplay: function () {
        return !!this.display;
    },

    hide: function () {
        this.display = false;
        var e = $("#" + this.id);
        if (e) {
            e.removeClass("show");
            e.removeClass("hide");
            e.addClass("hide");
        }
    },

    show: function () {
        this.display = true;
        var e = $("#" + this.id);
        if (e) {
            e.removeClass("hide");
            e.removeClass("show");
            e.addClass("show");
        }
    },

    getCls: function () {
        return this.cls;
    },

    setCls: function (cls) {
        var origCls = this.cls;
        var e = $("#" + this.id);
        if (e) {
            e.removeClass(origCls);
            e.setCls(cls);
        }
        this.cls = cls;
    },

    getStyle: function () {
        return this.style
    },

    setStyle: function (style, value) {
        this.style = style;
        var e = $("#" + this.id);
        if (e) {
            e.css(style, value);
        }
    },

    /**
     * 增加子组件
     * @param item
     */
    addItem: function (item) {
        this.items.add(item);
        this.itemsHtml += item.html;
        Orz.ComponentManager.registerSub(item.id, this.id);
        $('#' + this.id).replaceWith(this.generateHtml());
    },

    /**
     * 删除子组件
     * @param item
     */
    removeItem: function (item) {
        Orz.Array.removeItem(this.items, item);
        this.itemsHtml = this.itemsHtml.replace(item.html, "");
        $('#' + this.id).replaceWith(this.generateHtml());
        item.destroy();
    },

    /**
     * 渲染
     * @Param OrzId / DomId
     * @Param [position]
     */
    render: function () {

        if (!this.html) {
            throw new Error("组件" + this.id + "未能正确生成。");
            return;
        }

        if (typeof(this.listeners.beforeRender) == 'function') {
            this.listeners.beforeRender(this);
        }

        /* 获取渲染位置 */
        var renderTo = this.renderTo;
        var id = arguments[0];
        if (id) {
            renderTo = id;
        }
        if (!renderTo) {
            console.error("组件的renderTo属性或render(target)的target参数同时未定义。")
            return;
        }

        /* 优先选择组件为目标 */
        var parentCmp = Orz.getCmp(renderTo);
        var renderInner = renderTo;
        var renderEle = null;
        if (parentCmp) {
            if (parentCmp instanceof Orz.ClassManager.getClass("Orz.Component")) {
                renderInner = parentCmp.id;
                /* 如果目标组件内部可以被装载，则装载到内部，如果不行，则装载到后部 */
                if (parentCmp["innerId"]) {
                    renderInner = parentCmp["innerId"];
                    renderEle = document.getElementById(renderInner);
                    renderEle.appendChild(this.html);
                } else {
                    $("#" + renderInner).after(this.html);
                }

                if (typeof(this.listeners.afterRender) == 'function') {
                    this.listeners.afterRender(this);
                }
                return;
            }
        }

        /* 如不存在相应组件，则查找html元素 */
        renderEle = document.getElementById(renderTo);

        /* 渲染 */
        if (!renderEle) {
            renderEle = document.body;
            if (!renderEle) {
                throw new Error("未找到页面的body元素。")
            } else {
                console.warn("未找到ID为" + renderTo + "的组件或DOM元素，" + this.klass + " { id : " + this.id + " }" + "被附加到body末尾");
            }
        }else {
            $(renderEle).append(this.html);
        }

        if (typeof(this.listeners.afterRender) == 'function') {
            this.listeners.afterRender(this);
        }
        return;
    },

    /**
     * 生成html属性，用于子类Override
     */
    generateHtml: function () {
        throw new Error("组件的generateHtml()方法未作实现，无法生成组件。");
    },

    /**
     * 生成html代码，用于系统调用
     */
    init: function () {
        if (typeof(this.listeners.beforeInit) == 'function') {
            this.listeners.beforeInit(this);
        }

        this.generateHtml();

        if (typeof(this.listeners.afterInit) == 'function') {
            this.listeners.afterInit(this);
        }
    },

    /**
     * 注册事件
     */
    registerEvents: function () {
        var events = this.listeners;
        if (!events && events.length <= 0) {
            return;
        }
        for (var i = 0; i < events.length; i++) {
            var ev = events[i];
            $.each(ev, function (name, value) {
                $('#' + this.id).on(name, this, value);
            })
        }
    },

    /**
     * 销毁
     */
    destroy: function () {
        if (typeof(this.listeners.beforeDestroy) == 'function') {
            this.listeners.beforeDestroy(this);
        }

        var eleId = this.getId();
        var ele = document.getElementById(eleId);
        ele.parentNode.removeChild(ele);

        // 注销数据绑定和store
        var storeId = Orz.DataBindManager.unregister(eleId);
        if (storeId) {
            var store = Orz.ComponentManager.getCmp(storeId);
            Orz.ComponentManager.unregister(store.id)
        }

        // 注销子元素和父子关系
        var descendants = Orz.ComponentManager.getDescendants(eleId);
        for (var i = 0; i < descendants.length; i++) {
            var item = descendants[i];
            Orz.ComponentManager.unregister(item.id);
            Orz.ComponentManager.unregisterSub(item.id)
        }

        // 注销组件本身
        Orz.ComponentManager.unregister(eleId);

        if (typeof(this.listeners.afterDestroy) == 'function') {
            this.listeners.afterDestroy(this);
        }
    },

    /*  private method  */
    /**
     * 获取总的属性
     * @returns {string}
     * @private
     */
    _getCompositeProp: function () {
        var prop = "";
        if (!!this.readonly) {
            prop += " readonly";
        }
        if (!!this.disabled) {
            prop += " disabled";
        }
        return prop;
    },

    /**
     * 获取总的class
     * @returns {string}
     * @private
     */
    _getCompositeCls: function () {
        return this._getScrollableCls() + " " + this._getVisibilityCls() + " " + this._getDisplayCls() + " ";
    },

    /**
     * 获取总的style
     * @returns {string}
     * @private
     */
    _getCompositeStyle: function () {
        var width = this.width ? "width: " + this.width : "";
        width = typeof(this.width) == "string" ? width + ";" : width + "px;";
        var height = this.height ? "height: " + this.height : "";
        height = typeof(this.height) == "string" ? height + ";" : height + "px;";
        return  width + height + " margin: " + this.margin + "; padding: " + this.padding + ';' + this.getStyle() + ";";
    },

    /**
     * 获取scrollable class
     * @returns {*}
     * @private
     */
    _getScrollableCls: function () {
        switch (this.scrollable) {
            case "x":
                return "scrollable-x";
            case "y":
                return "scrollable-y";
            case true:
                return "scrollable";
            default:
                return '';
        }
    },

    /**
     * 获取display class
     * @returns {string}
     * @private
     */
    _getDisplayCls: function () {
        return !!this.display ? "show" : "hide";
    },

    /**
     * 获取visibility class
     * @returns {string}
     * @private
     */
    _getVisibilityCls: function () {
        return !!this.visibility ? "visible" : "no-visible";
    },

    /* ===================================== Event ========================================= */

    listeners: {
        beforeInit: Orz.emptyFn,
        afterInit: Orz.emptyFn,
        beforeRender: Orz.emptyFn,
        afterRender: Orz.emptyFn,
        beforeChange: Orz.emptyFn,
        afterChange: Orz.emptyFn,
        beforeDestroy: Orz.emptyFn,
        afterDestroy: Orz.emptyFn,
    },

});
