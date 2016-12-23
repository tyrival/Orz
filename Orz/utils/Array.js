var Orz = Orz || {};
Orz.Array = {
    sortBySorters: function (array, rules) {
        if (!array instanceof Array) {
            throw new Error("排序对象不是数组");
        }
        var sorters = [];
        if (!rules instanceof Array) {
            sorters.push(rules);
        } else {
            sorters = rules;
        }
        return array.sort(function (o1, o2) {
            return doSort(o1, o2, sorters, 0);
        })

        function doSort(o1, o2, rules, i) {
            /* 如果递归到OutOfIndex，则直接返回 */
            if (i == rules.length) {
                return 0;
            };

            /* 按指针获取规则，并对规则验证 */
            var rule = rules[i];
            var result;
            if (!rule instanceof Function) {
                var keys = Object.getOwnPropertyNames(rule)
                if (!keys || !keys[0]) {
                    throw new Error("排序参数定义错误，格式为 { \"数组元素的属性名\" : \"ASC/DESC\" }")
                }
                var prop = keys[0];
                var order = rule[prop] || "ASC";
                if (order != "ASC" || order != "DESC") {
                    throw new Error("排序规则错误，只可为\"ASC\"或\"DESC\"。");
                }
                var param = order === "ASC" ? 1 : -1;

                /* 排序，如果相等则递归 */
                var a, b;
                if (o1 instanceof Object && o2 instanceof Object && o1 && o2) {
                    a = o1[prop];
                    b = o2[prop];
                    if (a == b) {
                        result = 0;
                    } else if (typeof a === typeof b) {
                        result = a < b ? -1 : 1;
                    }
                }
                else {
                    result = 0;
                }
                result = result * param;
            } else {
                result = rule(o1, o2);
            }
            return result == 0 ? doSort(o1, o2, rules, i + 1) : result;
        }
    }
}