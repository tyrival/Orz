本项目构建了一个配置型前端框架，基本功能规划如下：

1. 与后端完全解耦，使用html+js，用ajax+json进行数据交互；

2. mv架构，view负责展示，model负责与后端数据交互，二者数据绑定，model中的数据变更后，view同步变化；

3. 封装常用组件的属性/方法/事件，通过对组件对象的操作来配置、创建、部署、修改、销毁组件实例，无需直接对DOM进行操作；

4. 可自定义组件，对框架自带组件进行extend和override，便于进行扩展开发；
 
5. 支持模板的创建；

6. 提供详细的配置api；

7. 大致案例如下：
```
// 定义一个myStore类，用于管理与后台的交互和数据存储
Orz.define("myStore", {      // myStore类负责与后台进行数据交互
    extend: "Orz.Store",     // 继承框架内置的Orz.Store类
    url: "user_list.html",   // 数据交互url
    fields: [{               // 定义解析JSON的对象属性
        name: "id", type: "string"
    }, {
        name: "user", type: "string"
    }]
});

// 基于Orz.Grid组件，对部分属性/事件进行override，并创建一个实例
var myGrid = Orz.create("Orz.Grid", {
    /* 属性 */
    width: 400,
    height: 400,
    store: Orz.create("myStore"),  // 数据绑定
    renderTo: "myDiv",             // 装载到id为myDiv的元素中，或id为myDiv的Orz组件中

    /* 事件 */
    listeners: {                   // 监听事件
        beforeRender: function (grid) { 
            // 装载前事件
        },
        afterLoad: function (grid, store) {
            // 重新加载数据后事件
        }
    }
})

// 如果没配置renderTo，则使用此方法进行装载到myDiv2中；如果配置了renderTo，则render()方法失效
myGrid.render("myDiv2");

// 修改Store的交互地址
myGrid.getStore().setUrl("user_list2.html");

// 重载Store，myGrid的展示数据随之变化
myGrid.getStore().load();
```

PS: 属性、方法、事件等命名借用ExtJS，懒得想了，相当于对ExtJS的接口做了简易实现。