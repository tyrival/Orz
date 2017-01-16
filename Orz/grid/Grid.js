/* Created by tyrival on 2016/12/7. */
Orz.define("Orz.Grid", {
    extend: "Orz.Container",

    /* ================================== Config ================================== */

    itemsHtml: "",

    innerId: null,

    store: null,

    cls: null,  // class

    data: null,

    width: null,

    height: null,

    scrollable: null,

    title: null,

    lockHead: true,


    /**
     * {
     *     id: "col-1",
     *     index: 0,
     *     text: "姓名",
     *     width: 200px | "20%",
     *     dataIndex: "name",
     *     textAlign: "left" | "right" | "center",
     *     cls: "abc",
     *     style: "font-size: 16px",
     *     disabled: false,
     *     html: "<button onclick='submit()'>submit</button>",
     *     flex: true | false,
     *     format: function(model) { return model.name + "-test"; },
     *     hidden: true | false
     *     cellPadding: 0 | "0 0 0 0",
     *     textMargin: 0 | "0 0 0 0",
     *     TODO 考虑增加一个组件
     * }
     */
    columns: [],


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

    _handlerColumn: function () {

    },

    /* ================================== Event ================================== */


})