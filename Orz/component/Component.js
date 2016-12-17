Orz.define("Orz.Component", {
    extend: "Orz.Base",

    renderTo: null,  // 渲染位置为 ComponentId 或 DomId，选择逻辑依次为 ComponentId-in > ComponentId > DomId

    html: "",  // 生成的html

    cls: null,  // dom的class属性

    style: null,  // dom的style属性

    display: false,  // 是否显示（不占位）

    visibility: true,  // 是否显示（占位）

    disabled: false,  // 是否禁用
/*

    height: null,  // 高度

    width: null,  // 宽度

    margin: 0,

    padding: 0,

 * - `true` to enable auto scrolling.
 * - `false` (or `null`) to disable scrolling - this is the default.
 * - `x` or `horizontal` to enable horizontal scrolling only
 * - `y` or `vertical` to enable vertical scrolling only
 *
    scrollable: null,  // 是否滚动
*/

    getHeight: function () {
        if (!this.height) {
            throw new Error("未设置高度");
        }
        return this.height;
    },

    setHeight: function (height) {
        this.height = height;
        var h = height.endsWith("%") ? height : height + "px";
        $(this.id).height(h);
    },

    getVisibility: function () {
        return !!this.visibility;
    },

    setVisibility: function (visibility) {
        this.visibility = !!visibility;
        document.getElementById(this.id).style.visibility = !!visibility ? visible : hidden;
    },

    getDisabled: function () {
        return !!this.disabled;
    },

    setDisabled: function (disabled) {
        this.disabled = !!disabled;
        document.getElementById(this.id).disabled = !!disabled;
    },

    getDisplay: function () {
        return !!this.disabled;
    },

    hide: function () {
        this.display = false;
        document.getElementById(this.id).style.display = "none";
    },

    show: function () {
        this.display = true;
        document.getElementById(this.id).style.display = "";
    },

    getCls: function () {
        return this.cls;
    },

    setCls: function (cls) {
        this.cls = cls;
        this._doGenerateHtml();
        this.render();
    },

    getStyle: function () {
        return this.style
    },

    setStyle: function (style) {
        this.style = style;
        this._doGenerateHtml();
        this.render();
    },

    listeners: {
        beforeInit: function (component) {
        },
        afterInit: function (component) {
        },
        beforeRender: function (component) {
        },
        afterRender: function (component) {
        },
        beforeDestroy: function (component) {
        },
        afterDestroy: function (component) {
        },
    },

    /**
     * 渲染
     * @Param OrzId / DomId
     * @Param [position]
     */
    render: function () {
        this.listeners.beforeRender(this);

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
                this.listeners.afterRender(this);
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
                $(renderEle).append(this.html);
                console.warn("未找到ID为" + renderTo + "的组件或DOM元素，" + this.klass + " { id : " + this.id + " }" + "被附加到body末尾");
            }
        }
        this.listeners.afterRender(this);
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
    _doGenerateHtml: function () {
        this.listeners.beforeInit(this);
        this.generateHtml();
        this.listeners.afterInit(this);
    },

    /**
     * 销毁
     */
    destroy: function () {
        this.beforeDestroy(this);

        var eleId = this.getId();
        var ele = document.getElementById(eleId);
        ele.parentNode.removeChild(ele);

        // 注销store和数据绑定
        var storeId = Orz.DataBindManager.unregisterByCmpId(eleId);
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

        this.afterDestroy(this);
    },
});
