/* Created by tyrival on 2016/12/7. */
/**
 * 采用订阅模式，将store：componentId注册到此处，如果store发生变更，则查找实例管理器中的config文件，然后重新生成html代码，装载到componentId处
 * 所以要考虑在每个组件的实例上加一个id，用于html页面查找
 * 需要一个实例管理器，用来登记id：config, id如果不存在，需要自动生成一个，又要增加一个id流水号管理器
  */

var Orz = Orz || {};

Orz.DataBindManager = {

    stack: {},

    register: function (cmpId, storeId) {
        Orz.DataBindManager.stack[cmpId] = storeId;
    },

    unregister: function (cmpId) {
        var storeId = Orz.DataBindManager.stack[cmpId]
        delete Orz.DataBindManager.stack[cmpId];
        return storeId;
    },

    unregisterByStoreId: function (storeId) {
        var cmpIdList = Object.getOwnPropertyNames(Orz.DataBindManager.stack);
        for(var i = 0; i < cmpIdList.length; i++) {
            var cmpId = cmpIdList[i];
            var sid = Orz.DataBindManager.stack[cmpId];
            if (storeId == sid) {
                delete Orz.DataBindManager.stack[cmpId];
                return cmpId;
            }
        }
    },

    getStoreIdByCmpeId: function (cmpId) {
        return Orz.DataBindManager.stack[cmpId];
    },

    getCmpIdListByStoreId: function (storeId) {
        var list = [];
        var cmpIdList = Object.getOwnPropertyNames(Orz.DataBindManager.stack);
        for(var i = 0; i < cmpIdList.length; i++) {
            var cmpId = cmpIdList[i];
            var sid = Orz.DataBindManager.stack[cmpId];
            if (storeId == sid) {
                list.push(cmpId);
            }
        }
        return list;
    }
};
