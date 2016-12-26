var Orz = Orz || {};
Orz.String = {
    uuid: function () {
        function generate() {
            return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
        }
        return (generate() + generate() + "-" + generate() + "-" + generate() + "-" + generate() + "-" + generate() + generate() + generate());
    },
};