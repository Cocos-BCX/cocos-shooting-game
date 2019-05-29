# i18n for Cocos Creator

> 本仓库已暂停维护，仅供存档，建议开发者们在项目层面自行实现多语言切换。

Cocos Creator 编辑器扩展：实现 Label 和 Sprite 组件的多语言国际化（i18n）。

注意，多语言国际化和本地化的区别是，国际化需要软件里包括多种语言的文本和图片数据，并根据用户所用设备的默认语言或菜单选择来进行实时切换。而本地化是在发布软件时针对某一特定语言的版本定制文本和图片内容。

本插件是多语言支持插件，因此不包括构建项目时去除一部分多语言数据的功能。

## 插件安装方法

请参考 [扩展编辑器:安装与分享](http://www.cocos.com/docs/creator/extension/install-and-share.html) 文档。

## 语言配置

首先从主菜单打开 i18n 面板： `插件->i18n`。


然后需要创建包含多语言翻译数据的 JSON 文件（为了方便使用采用 .js 格式存储）：

- 在 `Manage Languages` 部分的 `New Language ID` 输入框里输入新增语言的 ID，如 `zh`（代表中文），`en`（代表英文）等。
- 输入 ID 后点击 `Create` 按钮，会在相关的语言选择菜单里增加一种语言，并且会在项目的 `resources/i18n` 目录下创建对应语言的翻译数据模板，如 `resources/i18n/zh.js`

接下来在 i18n 面板的 `Preview Language` 部分的下拉菜单里就可以选择编辑器里预览时的语言了。

## 本地化 Label 文本

### 添加 Localize 组件

i18n 插件提供了两种组件分别用于配合 [Label](http://www.cocos.com/docs/creator/components/label.html) 和 [Sprite](http://www.cocos.com/docs/creator/components/sprite.html) 来显示多语言内容。

我们从 Label 开始，我们可以在场景或 prefab 中任何 Label 组件所在的节点上添加 `i18n/LocalizedLabel` 组件。这个组件只需要输入翻译数据索引的 dataID 就可以根据当前语言来更新 Label 的字符串显示。

下面我们来介绍如何配置 dataID。

### 翻译数据

插件创建的翻译数据模板是这样的：

```js
// zh.js

if (!window.i18n) window.i18n = {};
window.i18n.zh={
// write your key value pairs here
    "label_text": {
        "hello": "你好！",
        "bye": "再见！"
    }
};
```

其中 `window.i18n.zh` 全局变量的写法让我们可以在脚本中随时访问到这些数据，而不需要进行异步的加载。

在大括号里面的内容是用户需要添加的翻译键值对，我们使用了 AirBnb 公司开发的 [Polyglot](http://airbnb.io/polyglot.js/) 库来进行国际化的字符串查找，翻译键值对支持对象嵌套、参数传递和动态修改数据等功能，非常强大。更多用法请阅读上面链接里的文档。

如果像上面例子里一样设置我们的翻译数据，那么就会生成如下的键值对：

- "label_text.hello" : "你好！"
- "label_text.bye" : "再见！"


### 查看效果

接下来我们只要在 LocalizedLabel 组件的 `dataID` 属性里写入 `label_text.hello`，其所在节点上的 Label 组件就会显示 `你好！` 文字。

运行时如果需要修改 Label 渲染的文字，也请对 `LocalizedLabel.dataID` 进行赋值，而不要直接更新 `Label.string`。

当需要预览其他语言的显示效果时，打开 i18n 面板，并切换 `Preview Language` 里的语言，场景中的 Label 显示就会自动更新。

### 运行时设置语言

游戏运行时可以根据用户操作系统语言或菜单选择来设置语言，在获取到需要使用的语言 ID 后，需要用以下的代码来进行初始化：

```js
const i18n = require('LanguageData');
i18n.init('zh'); // languageID should be equal to the one we input in New Language ID input field
```

需要在之后动态切换语言时也可以调用 `i18n.init()`。

如果切换后需要马上更新当前场景，可以调用 `i18n.updateSceneRenderer()`。

注意运行时必须保证 `i18n.init(language)` 在包含有 LocalizedLabel 组件的场景加载前执行，否则将会因为组件上无法加载到数据而报错。

### 脚本中使用翻译键值对获取字符串

除了和 LocalizedLabel 配合使用解决场景中静态 Label 的多语言问题，`LanguageData` 模块还可以单独在脚本中使用，提供运行时的翻译：

```js
const i18n = require('LanguageData');
i18n.init('en');
let myGreeting = i18n.t('label_text.hello');
cc.log(myGreeting); // Hello!
```


## 本地化 Sprite 图片

### 添加 LocalizedSprite 组件

首先在场景或 prefab 中任何 Sprite 组件所在的节点上添加 `i18n/LocalizedSprite` 组件。该组件需要我们手动添加一组语言 id 和 SpriteFrame 的映射，就可以在编辑器预览和运行时显示正确语言的图片了。

### 添加语言图片映射

负责承载语言到贴图映射的属性 `spriteFrameSet` 是一个数组，我们可以像操作其他数组属性一样来添加新的映射

- 首先设置数组的大小，要和语言种类相等
- 为每一项里的 `language` 属性填入对应语言的 id，如 `en` 或 `zh`
- 将语言对应的贴图（或 SpriteFrame）拖拽到 `spriteFrame` 属性里。

完成设置后，点击下面的 `Refresh` 按钮，就可以在场景中看到效果了。

和 `LocalizedLabel` 一样，当我们在 i18n 面板设更改了预览语言时，当前场景里所有的 `LocalizedSprite` 也会自动刷新，显示当前语言对应的图片。
