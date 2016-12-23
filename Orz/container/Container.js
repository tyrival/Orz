/* Created by tyrival on 2016/12/11. */
Orz.define("Orz.Container", {
    extend: "Orz.Component",

    /* ================================== Config ================================== */
    items: [],

    itemsHtml: "",

    innerId: null,

    /* ================================== Method ================================== */

    generateHtml: function () {
        this.html =
            "<div id='" + this.id + "' " + "class='" + this._getCompositeCls() +  "' " +
                            "style='" + this._getCompositeStyle() + "' " + this._getCompositeProp() + ">" +
                "<div id='" + this.innerId + "'>" +
                    this.getData() +
                "</div>" +
            "</div>";
    },

    /* ================================== Event ================================== */


});