Orz.define("Orz.grid.Column", {
    extend: "Orz.Component",

    /* ================================== Config ================================== */

    dataIndex: null,  // 绑定的对象属性

    width: null,  // 宽度

    headerText: null,  // 列名

    headerHidden: false,  //  隐藏列头

    headerCls: null,

    headerStyle: null,

    textAlign: null,  // 文本align

    cls: null,

    style: null,

    cellHtml: null,  // 内容html，优先级第一

    cellFormat: null,  // 内容，优先级第2

    cellPadding: null,  // 单元格内边距

    flex: false,  // 弹性

    formatter: null,

    grid: null,  // 所属表格

    thHtml: null,  // 头html

    tdHtml: [],  // 单元格html

    /* ================================== Method ================================== */

    generateHtml: function () {
        this.generateTh();
    },

    generateTh: function () {
        var cls = " class='" + this.headerCls + "'" || "";
        var style = " style='" + this.headerStyle + "'" || "";
        this.thHtml = "<th" + cls + style + ">" + this.headerText + "</th>";
    },

    generateTd: function (list) {
        if (!list || list.length <= 0) {
            return;
        }
        var cls = " class='" + this.cls + "'" || "";
        var style = " style='" + this.style + "'" || "";
        for (var i = 0; i < list.length; i++) {
            var model = list[i];
            var data = model[this.dataIndex];
            data = typeof(this.formatter) == "function" ? this.formatter(data) : data;
            this.tdHtml.push("<td" + cls + style + ">" + data + "</td>");
        }
    },

    getThHtml: function () {
        return this.thHtml;
    },

    getTdHtml: function () {
        return this.tdHtml;
    },

    getGrid: function () {
        return this.grid;
    },

    setGrid: function (grid) {
        this.grid = grid;
    },

    getCellByIndex: function (index) {

    }

    /* ================================== Event ================================== */


});