/* Created by tyrival on 2016/12/15. */
!function () {
    /**
     * 扩展Object.create方法
     */
    if (!Object.create) {
        Object.create = function (o) {
            function F() {
            };
            F.prototype = o;
            return new F();
        };
    }

    /**
     * 扩展startsWith和endsWith方法
     */
    String.prototype.startsWith = String.prototype.startsWith || function (prefix) {
        return this.slice(0, prefix.length) === prefix;
    };
    String.prototype.endsWith = String.prototype.endsWith || function (suffix) {
        return this.indexOf(suffix, this.length - suffix.length) !== -1;
    };

}();


/**
 * IE8支持Object.keys
 * 遗憾的是，不能支持getOwnPropertyNames，因为IE8使用的ECMAScript3不支持遍历non-enumerable的属性
 */
var DONT_ENUM = "propertyIsEnumerable,isPrototypeOf,hasOwnProperty,toLocaleString,toString,valueOf,constructor".split(","),
    hasOwn = ({}).hasOwnProperty;
for (var i in {
    toString: 1
}) {
    DONT_ENUM = false;
}
Object.keys = Object.keys || function (obj) {
        var result = [];
        for (var key in obj) if (hasOwn.call(obj, key)) {
            result.push(key);
        }
        if (DONT_ENUM && obj) {
            for (var i = 0; key = DONT_ENUM[i++];) {
                if (hasOwn.call(obj, key)) {
                    result.push(key);
                }
            }
        }
        return result;
    };