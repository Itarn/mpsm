# 原生小程序状态管理: mpsm


**具备vue+react开发体验**

整合了【vue的属性监听watch、计算属性computed】和【 [dvajs](https://dvajs.com/ "dva") 的全局状态管理模式】，解决跨页通信问题，
提出【组件圈子】概念，摆脱各种父子、兄弟、姐妹、街坊邻居、远房表兄弟等组件间的通信浆糊困扰。

## 数据流
不管是页面间，还是组件间，嵌套组件内部，都可以通过简单的dispach来管理全局状态或圈子状态（局部）。

![全局数据流](https://user-gold-cdn.xitu.io/2019/10/25/16e013c7e1e84069?imageView2/2/w/480/h/480/q/85/interlace/1 "全局数据流")

![圈子数据流](https://user-gold-cdn.xitu.io/2019/10/24/16dfc5f8b87c973c?imageView2/2/w/480/h/480/q/85/interlace/1 "圈子数据流")


## 使用介绍
完全兼容原生代码，已有的业务逻辑代码，即便不适配也可使用此库，不影响已有业务逻辑。

原生： `Page()` 变为 `page()()`

原生： `Component()` 变为 `component()()`


### 初始化

```javascript
//app.js

import {page} from './mpsm/index'
import models from './models/index'

page.init(models, {}, {})

```
第二、三参数分别为页面和组件的公共options，会在每个页面或组件生效，对于同名的对象和函数，会进行合并处理。

### 页面或组件注册
**小**：即只需将Page、Component首字母小写。

**尾巴**：即尾部多调用一次：
```javascript
page({ //component
	// ...
})()

```

```javascript
// 数据更新有两种方式
// 第一种，直接修改this.data, 需要更新时调用this.update()
this.data.a = 1
this.update()

// 第二种 this.$setData
this. $setData({
  list: list
})

//第一种更新方式，根据需要自己确定数据更新的时机，调用this.update()
//第二种更新方式，会进行批处理，待函数执行结束后统一批量更新，异步操作立即更新，类似react中的setState


```

### 方法

| 方法        | 说明   |  备注  |
| --------   | -----:  | :----:  |
| page      | 用于注册页面   |   page()()     |
| component        |   用于注册组件   |   component()()   |
| dispatch  | 状态分发     |  参数object, {type, action, lazy}, 默认lazy: true, 懒更新，表示只更新当前展示页面的状态，其它页面待onShow触发后再更新  |
| getComponentOps  |    获取公共组件配置选项     |  不包含函数，只是简单的JSON格式数据  |
| getOps  |    获取公共页面配置选项     |  不包含函数，只是简单的JSON格式数据  |
| subscribe  |    订阅单一数据源     |  参数: 'userInfo/setup'  |
| unsubscribe  |    取消订阅单一数据源     |  参数: 'userInfo/setup'  |

##### 单一数据源的订阅取消

方法： unsubscribe, subscribe

取消订阅不使用dva的`app.unmodel()`，同时，subscription 必须返回 unlisten 方法，用于取消数据订阅。

```javascript
subscribe('userInfo/setup');
unsubscribe('userInfo/setup');
```

### 页面注册、组件注册示例
```javascript
import {dispatch, page, component} from '../../mpsm/index'

page({ // 或者 component
  watch: { // 属性监听
    isLogin(newState, oldState) {
    }
  },
  computed: { // 计算属性
    countComputed(data) {
      return data.count * 2
    }
  },
  data: {
    count: 2
  },
  onLoad() {},
  login() {
    dispatch({
      type: 'userInfo/save',
      payload: {
        isLogin: true
      }
    })
  },
  changeGroupState() {
    this.dispatch({
      type: 'group/index-a-1',
      payload: {
        nameA: 'name'
      }
    })
  },

})(({userInfo}) => {//订阅全局状态
  return {
    isLogin: userInfo.isLogin
  }
}, (groups) => {//订阅圈子状态,page为全局圈子，component为组件所在圈子
  return {
    nameA: groups.nameA && groups.nameA.name || '--'
  }
})
```

##### tips:
1. dispatch用于分发全局状态，风格与dva保持一致, 不过多了一个lazy字段，
默认true（懒更新，只更新当前页面，其他页面onShow时再更新），false的话，就是全量更新；

2. Page和Component实例内置this.dispatch方法，用于分发局部状态。

3、组件可监听page的生命周期函数，无需做版本兼容，只需将想要监听的函数名与page内一直即可，即

```javascript
// 原生的pageLifetimes可监听的周期太少，且版本要求高，监听了onShow，就不需要监听show了，避免执行两次
component({
  pageLifetimes: {
      onShow: function () { },
      onHide: function () { },
      onPageScroll: function () { },
    },
})()

```
目前可监听的生命周期 `['onShow', 'onHide', 'onResize', 'onPageScroll', 'onTabItemTap', 'onPullDownRefresh', 'onReachBottom']`

有了这个功能，就可以编写很多自控组件了，比如吸顶效果的导航栏等。


### models 全局状态

参考 [dvajs](https://dvajs.com/ "dva")
```javascript
export default {
  namespace: '',
  state: {
    
  },
  subscriptions: {

  },
  effects: {

  },
  reducers: {

  }

}

```



### model 方法
详情参阅 [dva](https://dvajs.com/ "dva")

##### select、put、history

##### tips:
1. put只用于简单的model内部的action分发，未封装put.resolve等方法，可使用async/await实现同等效果；
2. 依据小程序特性，history回调中两个参数分别为当前页面路由信息和上一页路由信息，为一个对象，格式如。

```javascript

export default {
  subscriptions: {
    setup({dispatch, history, select}) {
      const callback = (current, prev) => {
              dispatch({
                type: 'save',
                payload: {
                  prev, // {route: 'pages/index/index',options: {id: 123}}
                  current
                }
              })
            }
      history.listen(callback)
      return () => history.unlisten(callback)
    
    }
  }
}

```


## 组件圈子

### 传统的组件数据流

对于嵌套组件间的数据通信，往往存在所谓的父子组件关系，内层组件想要向外层组件或其它分支上的组件传递数据，往往通过外层的组件通过监听函数来接收并派发，层层传递，这种
这种层层转接的模式，繁琐且需要专门的函数去维护，不利于组件的拓展和移植。

![传统组件数据流](https://user-gold-cdn.xitu.io/2019/10/24/16dfc6347de6cdf2?imageView2/2/w/480/h/480/q/85/interlace/1 "传统组件数据流")


### 小程序的官方组件数据流
而对于小程序的原生组件系统来说，behaviors, relations, definitionFilter, triggerEvent, 
getRelationNodes等编写组件需要使用的属性或方法，
真的是辣眼睛！小程序官方组件系统基本丧失了作为组件的意义，
虽然它还在努力地更新升级，
时不时文档中出现`"不推荐使用这个字段，而是使用另一个字段代替，它更加强大且性能更好"`的字眼, 大家不要信！！！

![没法接](https://user-gold-cdn.xitu.io/2019/10/24/16dfbbe62b55e883?imageView2/2/w/480/h/480/q/85/interlace/1 "没法接")

![小程序组件数据流](https://user-gold-cdn.xitu.io/2019/10/24/16dfc6850412ef2d?imageView2/2/w/480/h/480/q/85/interlace/1 "小程序组件数据流")


什么叫组件?相对独立，具有明确约定的接口，依赖语境，可自由组合，可拓展，可独立部署，亦可复合使用！！！你说你除了相对独立，你说你还有啥，你说你还有个啥！！！

![啥](https://user-gold-cdn.xitu.io/2019/10/24/16dfc9ea1bef6347?imageView2/2/w/480/h/480/q/85/interlace/1 "啥")

### 组件圈子数据流
对于一个组件来说，在最初编写时，不应该去关心自己会被挂载到哪,自己只需要为圈子提供数据，
甚至是数据键名也不用关心，放到圈子里，谁爱用谁用，无需回调函数来协助传递数据，
这才是作为组件可移植可复用的意义，在一个圈子里，不存在父子兄弟的概念，也没有哪个组件生来是给人当儿子的，组件间的往来只有最纯粹的数据通信。
##### 如下图中的组件C与组件F之间的数据通信，一个提供数据，另一个直接去使用就行了，不管层级多少，直接通信，没有多余的步骤。

![圈子数据流](https://user-gold-cdn.xitu.io/2019/10/24/16dfc5f8b87c973c?imageView2/2/w/480/h/480/q/85/interlace/1 "圈子数据流")

```html
    <!--组件a in page-->
    <a group-name="index-a-1" group-keys="{{ {name: 'nameA1'} }" group-data="{{ {a: 1} }}"></a>
```

只需给组件赋值一个`group-name`属性，便给组件分配了一个圈子，
组件内`this.dipatch({})`分发地`payload`便是该组件给圈子贡献的数据，
也是该组件对外约定的数据值。

`group-keys`是用于避免字段名称冲突的，示例中可将a贡献地数据键值更改为`nameA1`,
而值不变，所以圈子中地组件很纯粹，只向所在圈子提供必要的数据值，
至于你将组件放置何处，数据给谁用，名称怎么修改，都与我无关。

`group-data`是组件所依赖的外部值，是一个内置属性，可在组件的`watch`配置中进行监听。

## 页面、组件实例对象

**注意：** 对配置中的函数，以及setData进行了简单封装，在页面注册或组件注册options的函数中，
setData的数据并不会马上更新，而是合并收集，待当前函数执行完毕后，
先模拟计算出computed，与收集的结果合并，再diff，最后setData一次。
与react更新机制类似，对于函数中出现的异步操作，不会进行数据收集，而是直接模拟计算值，diff，接着setData

### 页面
对圈子状态的管理拥有最高权限
#### 属性

| 属性        | 说明   |  备注  |
| --------   | -----:  | :----:  |
| $groups      | 获取当前页面内的所有圈子状态值   |   object,  只读   |

```javascript
    this.$groups['index-a-1'] 
```

#### 方法
#### dispatch
用于强制更新某个圈子中的状态
```javascript
    this.dispatch({
      type: 'data/index-a-1',
      payload: {
        nameA1: 'name'
      }
    })
```

| 参数        | 说明   |  备注  |
| --------   | :----- | :----:  |
| type      | 格式: 更新类型/圈子名称，更新类型：data 或 group，data表示更新圈子数据的同时，也将payload中的数据更新至this.data, 即this.setData(payload)  |   string     |
| payload      |  需要更新的状态值 |   object     |

### 组件
只更新所在圈子状态
#### 属性

| 属性        | 说明   |  备注  |
| --------   | -----:  | :----:  |
| $groups      | 获取所在页面内的所有圈子状态值   |   object, 只读     |
| $group      | 获取所在圈子状态值   |   object, 只读     |

```javascript
    this.$group['nameA1'] 
```

#### 方法
#### dispatch
用于更新所在圈子中的状态
```javascript
    this.dispatch({
      type: 'data', // group
      payload: {
        nameA1: 'name'
      }
    })
```

| 参数        | 说明   |  备注  |
| --------   | :----- | :----:  |
| type      | 格式: 更新类型，更新类型：data 或 group，data表示更新圈子数据的同时，也将payload中的数据更新至this.data, 即this.setData(payload)  |   string     |
| payload      |  需要更新的状态值 |   object     |

#### tips
**更新类型**

之所以会有data更新类型，是因为组件提供的数据名称，有可能会被改写，所以组件不要去监听自己的数据，那是给外人用的。

有时候组件向圈子贡献了数据，但自身并不需要这些数据更新到data，所以会有group更新类型

## 状态更新机制

![状态更新机制](https://user-gold-cdn.xitu.io/2019/10/24/16dfd30648e2419a?imageView2/2/w/480/h/480/q/85/interlace/1  "状态更新机制")

### 定制diff

腾讯官方的westore库，为小程序定制了一个diff，本想用在自己库里，
但使用中发现diff结果不太对，他会将删除的属性值重置为null，我并不需要为null，
当去遍历对象的属性值，就会多出一个为null的属性，莫名其妙，删了就是删了，不必再保留，
并且其内部实现，在进行diff前先进行一次同步下key键，这个完全没必要，浪费性能。
westore的diff应该是用在全局状态新旧状态上，其结果违反setData的数据拼接规则，
也不符合原生数据更新的习惯，
所以我得自己写一个diff，先列出基本情况：

1、不改变原生setData的使用习惯；

2、明确diff使用的场景，针对具体场景定制：属性更新时需要diff，setData时需要diff；

3、diff返回结果的格式，setData会用到，需要满足 `a.b[0].a`这样的格式，另外如果属性变化，还需要根据键值调用watch；

4、参与对比的两个参数都有一个共同特点，就是都是拿局部变化的数据，去对比全量旧数据，属性的话，两者的键值对更是对等的，所以无需同步键值；

定制的diff：

```javascript
   diff({
       a: 1, b: 2, c: "str", d: { e: [2, { a: 4 }, 5] }, f: true, h: [1], g: { a: [1, 2], j: 111 }
   }, {
       a: [], b: "aa", c: 3, d: { e: [3, { a: 3 }] }, f: false, h: [1, 2], g: { a: [1, 1, 1], i: "delete" }, k: 'del'
   })
```

diff结果

```javascript
   const diffResult = {
    result: {
      a: 1,
      b: 2,
      c: "str",
      'd.e[0]': 2,
      'd.e[1].a': 4,
      'd.e[2]': 5,
      f: true,
      g: {
        a: [1,2],
        j: 111
      },
      h: [1]
    },
    rootKeys: {
      a: true,
      b: true,
      c: true,
      d: true,
      g: true,
      h: true,
    }
   }
```
记录rootKeys是因为属性监听不需要 'a.b'这样的格式，在diff中记录下来，便少了一次遍历筛选拆分。


