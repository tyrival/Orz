/* Created by tyrival on 2016/12/7. */
Orz.define("Orz.Grid", {
    extend: "Orz.Container",

    /* ================================== Config ================================== */

    itemsHtml: "",

    innerId: null,

    store: null,

    data: null,

    width: null,

    height: null,

    scrollable: null,

    title: null,

    lockHead: true,

    columns: [],

    columnArray: [],

    /* ================================== Method ================================== */

    generateHtml: function () {

        var me = this;
        var cols = me.columns;
        if (!cols || cols.length <= 0) {
            return;
        }

        if (!me.data) {
            me.data = me.store.data;
        }

        /*
         * 遍历this.columns，通过配置生成Orz.grid.Column实例，生成各列的html数组
         * 遍历数组，拼出table的th和td的html代码
         * */
        var tmpTh = "<tr>";
        var tmpTd = new Array(me.data.length);
        for (var i = 0; i < cols.length; i++) {
            var col = cols[i];
            var item = Orz.create("Orz.grid.Column", col);
            item.generateTd(me.data);
            item.setGrid(me);
            me.columnArray.push(item);

            tmpTh += item.getThHtml();

            var tdHtml = item.getTdHtml();
            for (var j = 0; j < tdHtml.length; j++) {
                var td = tdHtml[j];
                if (!tmpTd[j]) {
                    tmpTd[j] = "<tr>";
                }
                tmpTd[j] += td;
                if (i == cols.length) {
                    tmpTd[j] += "</tr>";
                }
            }
        }
        tmpTh += "</tr>";

        me.html =
            "<table id='" + me.id + "' " + "class='" + me._getCompositeCls() + "' " +
            "style='" + me._getCompositeStyle() + "' " + me._getCompositeProp() + ">" +
            "<thead>" + tmpTh.toString() + "</thead>" +
            "<tbody id='" + me.innerId + "'>" +
            tmpTd.toString() +
            "</tbody>" +
            "</table>";
    },


    /* ================================== Event ================================== */


})