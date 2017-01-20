/* Created by tyrival on 2016/12/11. */
Orz.define("Orz.Container", {
    extend: "Orz.Component",

    /* ================================== Config ================================== */

    items: [],

    itemsHtml: "",

    innerHtml: null,

    innerId: null,

    prefixHtml: '',  // itemsHtml之前的内部HTML
    suffixHtml: '',  // itemsHtml之后的内部HTML

    /* ================================== Method ================================== */

    generateHtml: function () {

        var origCls = "";
        if (this.width === "100%") {
            origCls += "container-fluid";
        }

        var innerHtml = this.prefixHtml + this.innerHtml + this.itemsHtml + this.suffixHtml;

        this.html =
            "<div id='" + this.id + "' " + "class='" + origCls + this._getCompositeCls() + this.getCls() +  "' " +
                            "style='" + this._getCompositeStyle() + "' " + this._getCompositeProp() + ">" +
                "<div id='" + this.innerId + "'>" + innerHtml + "</div>" +
            "</div>";
    },

    /* ================================== Event ================================== */

    listeners: {

    }

});