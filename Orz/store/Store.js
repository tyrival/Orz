Orz.define("Orz.Store", {
    extend: "Orz.Base",

    data: null,

    model: {
        idProperty: null,
        fields: []
    },

    proxy: {
        url: null,
        params: null,
        pageIndex: 1,
        pageSize: 10,
        dataType: "json",
        response: {
            pageTotal: 0,
            dataRoot: "list",
        }
    },

    destroy: function () {
        Orz.DataBindManager.unregister(this.getId());
    },

});
