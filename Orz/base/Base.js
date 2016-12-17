Orz.define("Orz.Base", {
    extend: "Orz.Abstract",

    id: null,

    klass: null,

    listeners: {},

    getKlass: function () {
        return this.klass;
    },

    getId: function () {
        return this.id;
    },

    newInstance: function () {
        return Object.create(this);
    },

});
