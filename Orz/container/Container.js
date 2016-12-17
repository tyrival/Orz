/* Created by tyrival on 2016/12/11. */
Orz.define("Orz.Container", {
    extend: "Orz.Component",

    items: [],

    itemsHtml: "",

    generateHtml: function () {
        this.html = this.innerId + " start " + this.itemsHtml + " end " + this.innerId;
    },
});