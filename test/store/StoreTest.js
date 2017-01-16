/* Created by tyrival on 2016/12/23. */
Orz.define("UserStore", {
    extend: "Orz.Store",
    autoLoad: true,

    model: {
        fields: [
            {name: "id", mapper: "id", type: "number"},
            {name: "name", mapper: "name", type: "string"},
            {
                name: "age",
                mapper: function (item) {
                    return item["age"] + 10;  // 年龄瞬间大10岁
                },
                type: "number"
            },
            {name: "sex", mapper: "sex", type: "string", defaultValue: "les"},
        ],
        idProperty: "id"
    },

    proxy: {
        url: "/Orz/test/store/data.json",
    },

    filters: [
        function (model) {
            if (model.id == 1) {
                return false;
            }
            return true;
        },
        function (model) {
            if (model.name == "gerald") {
                return false;
            }
            return true;
        }
    ],

    localSorters: [
        function (o1, o2) {
            var s1 = o1.sex == "male" ? 1 : 0;
            var s2 = o2.sex == "male" ? 1 : 0;
            return s1 - s2;
        },
        {"name": "DESC"}
    ],

    listeners: {
        afterSync: function (store) {
            store.data[0].id = "new Id";
        },
    }
})

var testStore = Orz.create("UserStore");