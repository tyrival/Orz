/* Created by tyrival on 2016/12/23. */
Orz.define("UserStore", {
    extend: "Orz.Store",
    autoLoad: true,
    fields: [
        { name: "id", mapper: "id", type: "number" },
        { name: "name", mapper: "name", type: "string" },
        {
            name: "age",
            mapper: function (item) {
                return item["age"] + 10;
            },
            type: "number" },
        { name: "sex", mapper: "sex", type: "string", defaultValue: "gay" },
    ],
    proxy: {
        url: "/Orz/test/store.json",
    }
})

Orz.create("UserStore");