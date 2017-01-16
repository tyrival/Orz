/* Created by tyrival on 2016/12/11. */
Orz.define("Orz.Container", {
    extend: "Orz.Component",

    /* ================================== Config ================================== */

    items: [],

    itemsHtml: "",

    innerId: null,

    title: '',  // TODO title样式附加

    prefixHtml: '',  // itemsHtml之前的内部HTML
    suffixHtml: '',  // itemsHtml之后的内部HTML

    /* ================================== Method ================================== */

    addItem: function (item) {
        // TODO
    },

    deleteItem: function (item) {
        // TODO 删除此处的item，重新生成html，（以及ComponentManager中的实例 <== 估计不需要，此处为引用对象，修改过了），如有DataBind绑定，也需要解除
    },

    getTitle: function () {
        return this.title;
    },

    setTitle: function (title) {
        this.title = title;
        // TODO 根据id修改title
        //this.generateHtml();
        //this.render();
    },

    generateHtml: function () {

        var innerHtml = this.prefixHtml + this.itemsHtml + this.suffixHtml;
        this.html =
            "<div id='" + this.id + "' " + "class='" + this._getCompositeCls() + this.getCls() +  "' " +
                            "style='" + this._getCompositeStyle() + "' " + this._getCompositeProp() + ">" +
                "<div id='" + this.innerId + "'>" + innerHtml + "</div>" +
            "</div>";
    },

    /* ================================== Event ================================== */


});