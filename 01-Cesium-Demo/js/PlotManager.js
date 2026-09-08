/**
 * 生成符合RFC4122 v4的guid
 * @exports guid
 * @return {String} guid
 */
function guid() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = Math.floor(Math.random() * 16);
    // y值限定在[8,B]
    /* eslint-disable */
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * 如果第一个参数未定义，返回第二个参数，否则返回第一个参数，用于设置默认值。
 *
 * @exports defaultValue
 *
 * @param {*} a
 * @param {*} b
 * @returns {*} 如果第一个参数未定义，返回第二个参数，否则返回第一个参数，用于设置默认值。
 *
 */
function defaultValue$1(a, b) {
  if (a !== undefined && a !== null) {
    return a;
  }
  return b;
}

// import $ from "../../thirdParty/jquery";

class CursorTip {
  /**
   * 创建跟随鼠标的div元素
   * @param {Object} options 具有以下属性
   * @param {String} [options.text] div内容，支持HTML
   * @param {String} [options.id] 元素id,如果未定义将随机分配
   * @param {Viewer} [options.viewer] Viewer对象,如果未定义，div将不能自动跟随鼠标
   * @param {Boolean} [options.show=true] 是否可见
   * @param {Boolean} [options.reduplicate=false] 如果指定元素的id已存在，则移除原来的要素
   */
  constructor(options = {}) {
    const { text, id, viewer } = options;
    if (id && document.getElementById(id) && !options.reduplicate) {
      // $(`#${id}`).remove();
      document.getElementById(id).remove();
    }
    const tooltip = document.createElement("div");
    tooltip.id = defaultValue$1(id, guid());
    tooltip.className = "cursor-tip-class";
    tooltip.innerHTML = text;
    const target = viewer ? viewer.container : document.body;
    target.appendChild(tooltip);
    this.ele = tooltip;
    this._show = defaultValue$1(options.show, true);
    this._isDestryoed = false;
    this._target = target;
    this._id = tooltip.id;
    this._text = text;
    this._position = undefined;
    const self = this;
    this.show = this._show;

    if (viewer instanceof Cesium.Viewer) {
      this._handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas);
      this._handler.setInputAction((e) => {
        self.updatePosition(e.endPosition);
      }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    }
  }

  /**
   * 更新元素位置
   * @param {Cartesian2} pixel 元素位置
   */
  updatePosition(pixel) {
    this.ele.style.left = `${pixel.x + 10}px`;
    this.ele.style.top = `${pixel.y + 10}px`;
  }

  /**
   * 更新元素内容
   * @param {String|HTML} text 元素内容
   */
  updateText(text) {
    this.ele.innerHTML = text;
  }

  /**
   * 销毁组件
   */
  destroy() {
    if (this._isDestryoed) {
      return;
    }
    this._target.removeChild(this.ele);
    if (this._handler.isDestroyed()) {
      this._handler.destroy();
    }
    this._isDestryoed = true;
  }

  /*
   * 元素可见性
   *
   * @type {Boolean}
   */

  get show() {
    return this._show;
  }

  /**
   * 元素可见性
   *
   * @type {Boolean}
   */
  set show(v) {
    this._show = v;
    if (v) {
      this.ele.style.display = "block";
    } else {
      this.ele.style.display = "none";
    }
  }

  /**
   * 可以通过document.getElementById(id)获得它的DOM
   *
   * @readonly
   * @type {String}
   */
  get id() {
    return this._id;
  }

  /**
   * 获得或设置显示的文字
   * @type {String}
   */
  get text() {
    return this._text;
  }

  set text(text) {
    this._text = text;
    this.updateText(text);
  }

  /**
   * 获得或设置元素位置，设置元素的位置和updatePosition具有同样的效果
   * @type {Cesium.Cartesian2}
   */
  get position() {
    return this._position;
  }

  set position(pixel) {
    if (pixel.x && pixel.y) {
      this._position = pixel;
      this.updatePosition(pixel);
    } else {
      console.warn("CursorTip:设置了一个无效的位置，将被忽略.");
    }
  }
}

let CesiumProError$1 = class CesiumProError extends Error {
  /**
   * 定义CesiumPro抛出的错误
   * @extends Error
   * @param {String} message 描述错误消息的内容
   * @example
   *
   */
  constructor(message) {
    super(message);
    this.name = "CesiumProError";
  }
};
CesiumProError$1.throwInstantiationError = function () {
  throw new DeveloperError(
    "This function defines an interface and should not be called directly."
  );
};
CesiumProError$1.throwNoInstance = function () {
  throw new CesiumProError$1("它的定义了一个接口，不能被以直接调用.");
};

/**
 * 检查变是否是一个Cesium.Viewer对象
 * @exports checkViewer
 *
 * @param {any} viewer 将要检查的对象
 */
function checkViewer(viewer) {
  if (!(viewer && viewer instanceof Cesium.Viewer)) {
    const type = typeof viewer;
    throw new CesiumProError$1(
      `Expected viewer to be typeof Viewer, actual typeof was ${type}`
    );
  }
}

/**
 * 判断一个变量是否被定义
 * @param value
 * @exports defined
 * @returns {Boolean} value是否被定义
 */
function defined(value) {
  return value !== undefined && value !== null;
}

/* eslint-disable prefer-rest-params */

function compareNumber(a, b) {
  return b - a;
}
class Event {
  /**
   * 事件管理器
   * @example
   * const addMarkerEvent=new Event();
   * function saveMark(marker){
   *  console.log("添加了一个marker",marker.id)
   * }
   * addMarkerEvent.on(saveMark)
   * const mark=viewer.entities.add({
   *  id:"mark1",
   *  billboard:{
   *    image:"./icon/pin.png"
   *  }
   * })
   * addMarkerEvent.emit(mark)
   */
  constructor() {
    this._listeners = [];
    this._scopes = [];
    this._toRemove = [];
    this._insideRaiseEvent = false;
  }

  /**
   * 当前订阅事件的侦听器个数
   * @type {Number}
   */
  get numberOfListeners() {
    return this._listeners.length - this._toRemove.length;
  }

  /**
   * 注册事件触发时执行的回调函数
   * @param {Function} listener 事件触发时执行的回调函数
   * @param {Object} [scope] 侦听器函数中this的指针
   * @return {Function} 用于取消侦听器监测的函数
   *
   * @see Event#removeEventListener
   * @see Event#raise
   */

  addEventListener(listener, scope) {
    if (typeof listener !== "function") {
      throw new CesiumProError$1("侦听器应该是一个函数");
    }

    this._listeners.push(listener);
    this._scopes.push(scope);

    const event = this;
    return function () {
      event.removeEventListener(listener, scope);
    };
  }

  /**
   * 注销事件触发时的回调函数
   * @param {Function} listener 将要被注销的函数
   * @param {Object} [scope] 侦听器函数中this的指针
   * @return {Boolean} 如果为真，事件被成功注销，否则，事件注销失败
   *
   * @see Event#addEventListener
   * @see Event#raise
   */
  removeEventListener(listener, scope) {
    if (typeof listener !== "function") {
      throw new CesiumProError$1("侦听器应该是一个函数");
    }
    const listeners = this._listeners;
    const scopes = this._scopes;

    let index = -1;
    for (let i = 0; i < listeners.length; i++) {
      if (listeners[i] === listener && scopes[i] === scope) {
        index = i;
        break;
      }
    }

    if (index !== -1) {
      if (this._insideRaiseEvent) {
        // In order to allow removing an event subscription from within
        // a callback, we don't actually remove the items here.  Instead
        // remember the index they are at and undefined their value.
        this._toRemove.push(index);
        listeners[index] = undefined;
        scopes[index] = undefined;
      } else {
        listeners.splice(index, 1);
        scopes.splice(index, 1);
      }
      return true;
    }

    return false;
  }

  /**
   * 触发事件
   * @param {*} arguments 此方法接受任意数据的参数并传递给侦听器函数
   *
   * @see Event#addEventListener
   * @see Event#removeEventListener
   */
  raise() {
    this._insideRaiseEvent = true;

    let i;
    const listeners = this._listeners;
    const scopes = this._scopes;
    let { length } = listeners;

    for (i = 0; i < length; i++) {
      const listener = listeners[i];
      if (Cesium.defined(listener)) {
        listeners[i].apply(scopes[i], arguments);
      }
    }

    // Actually remove items removed in removeEventListener.
    const toRemove = this._toRemove;
    length = toRemove.length;
    // 降序排列，从后往前删
    if (length > 0) {
      toRemove.sort(compareNumber);
      for (i = 0; i < length; i++) {
        const index = toRemove[i];
        listeners.splice(index, 1);
        scopes.splice(index, 1);
      }
      toRemove.length = 0;
    }

    this._insideRaiseEvent = false;
  }
  raiseEvent() {
    this.raise(...arguments);
  }
}

function createProperty(name, configurable = false) {
  const privateName = `_${name}`;
  return {
    configurable,
    get() {
      return this[privateName];
    },
    set(value) {
      const oldValue = this[privateName];
      if (value !== oldValue) {
        this[privateName] = value;
        this._definitionChanged.raise(name, value, oldValue);
      }
    },
  };
}
class Properties {
  /**
   * 一个key-value集合，用于保存对象的属性信息
   * @param {Object} [options={}]
   */
  constructor(options = {}) {
    this._definitionChange = new Event();
    this._propertyNames = [];
    for (const key in options) {
      if (options.hasOwnProperty(key)) {
        this[`_${key}`] = options[key];
        this._propertyNames.push(key);
        Object.defineProperty(this, key, createProperty(key));
      }
    }
  }

  /**
   * 所有属性的key值
   * @return {Array} 所有属性的key值
   */
  get propertyNames() {
    return this._propertyNames;
  }

  /**
   * 添加属性
   * @param {*} key   键
   * @param {*} value 值
   * @fires Properties#definitionChanged
   */
  addProperty(key, value) {
    if (!defined(key)) {
      throw new CesiumProError$1("key is reqiured.");
    }
    if (this.propertyNames.includes(key)) {
      throw new CesiumProError$1(`${key}has be a registered property.`);
    }
    this[`_${key}`] = value;
    this._propertyNames.push(key);
    Object.defineProperty(this, key, createProperty(key));
  }

  /**
   * 删除属性
   * @param  {*} key
   * @fires Properties#definitionChanged
   */
  removeProperty(key) {
    if (!defined(key)) {
      throw new CesiumProError$1("key is reqiured.");
    }
    if (this.propertyNames.includes(key)) {
      delete this[key];
      delete this[`_${key}`];
      const index = this.propertyNames.indexOf(key);
      this.propertyNames.slice(index, 1);
      this.definitionChanged.raise(key);
    }
  }

  /**
   * 将该对象转换为字符串
   * @return {String}
   */
  toString() {
    const json = this.toJson();
    return JSON.stringify(json);
  }

  /**
   * 将该对象转换为json
   * @return {Object}
   */
  toJson() {
    const json = {};
    for (const property of this.propertyNames) {
      json[property] = this[property];
    }
    return json;
  }

  /**
   * 判断该对象是否包含属性key
   * @param  {*}  key
   * @return {Boolean}
   */
  hasProperty(key) {
    if (!defined(key)) {
      throw new CesiumProError$1("key is reqiured.");
    }
    return this.propertyNames.includes(key);
  }

  /**
   * 其定义发生变化时触发的事件,事件订阅者以发生变化的属性、变化后的值、变化前的值作为参数。
   * @type {Event}
   * @return {Event}
   */
  get definitionChanged() {
    return this._definitionChanged;
  }

  destroy() {
    this._definitionChanged = undefined;
    this._propertyNames = undefined;
  }
}

function abstract() {
  throw new CesiumProError$1("抽象方法无法被调用。");
}

function returnTrue() {
  return true;
}

/**
 * 销毁一个对象，对象的所有属性和方法都被替换为一个会抛出{@link CesiumProError}异常的函数
 *
 * @exports destroyObject
 *
 * @param {Object} object The object to destroy.
 * @param {String} [message] The message to include in the exception that is thrown if
 *                           a destroyed object's function is called.
 *
 *
 * @example
 * // How a texture would destroy itself.
 * this.destroy = function () {
 *     _gl.deleteTexture(_texture);
 *     return Cesium.destroyObject(this);
 * };
 *
 * @see CesiumProError
 */
function destroyObject(object, message) {
  message = defaultValue$1(
    message,
    "This object was destroyed, i.e., destroy() was called."
  );

  function throwOnDestroyed() {
    //>>includeStart('debug', pragmas.debug);
    throw new CesiumProError$1(message);
    //>>includeEnd('debug');
  }
  const properties = Object.getOwnPropertyNames(object);
  const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(object));
  const keys = [...properties, ...methods];

  for (var key of keys) {
    if (typeof object[key] === "function") {
      object[key] = throwOnDestroyed;
    }
  }

  object.isDestroyed = returnTrue;

  return undefined;
}

const { CallbackProperty } = Cesium;

function toCallbackProperty(values) {
  return new CallbackProperty(() => values, false);
}
class BasePlot {
  /**
   * 可编辑的几何图形基类，定义了可编辑几何图形的公共属性和操作方法，一般做为某种图形的父类使用，不要直接创建它。
   * @param {Object} options   具有以下属性
   * @param {Object} entityOptions 描述一个实体对象
   */
  constructor(entityOptions, options = {}) {
    this._type = undefined;
    this._properties = undefined;
    this._show = true;
    this._id = defaultValue$1(entityOptions.id, guid());
    this._clampToGround = defaultValue$1(options.clampToGround);
    this._clampToModel = defaultValue$1(options.clampToModel);
  }
  /**
   * 图形高亮显示
   */
  highlightGraphic(highlight = true) {
    const highlightColor = BasePlot.highlightColor;
    if (this.entity && highlight) {
      this.entity.point && (this.entity.point.color = highlightColor);
      this.entity.polyline && (this.entity.polyline.material = highlightColor);
      this.entity.polygon && (this.entity.polygon.material = highlightColor);
      this.entity.polygon &&
        (this.entity.polygon.outlineColor = highlightColor);
    } else {
      this.entity.point &&
        (this.entity.point.color = this._entityOptions.point.color);
      this.entity.polyline &&
        (this.entity.polyline.material = this._entityOptions.polyline.material);
      this.entity.polygon &&
        (this.entity.polygon.material = this._entityOptions.polygon.material);
      this.entity.polygon &&
        (this.entity.polygon.outlineColor =
          this._entityOptions.polygon.outlineColor);
    }
  }
  /**
   * 图形高亮时使用的颜色
   * @memberof BasePlot
   * @type {Cesium.Color}
   */
  static highlightColor = Cesium.Color.AQUA;
  /**
   * 是否依附地形
   * @type {Boolean}
   */
  get clampToGround() {
    return this._clampToGround;
  }
  set clampToGround(val) {
    this._clampToGround = val;
  }
  /**
   * 是否依附模型
   * @type {Boolean}
   */
  get clampToModel() {
    return this._clampToModel;
  }
  set clampToModel(val) {
    this._clampToModel = val;
  }

  /**
   * 图形id
   * @readonly
   * @type {String}
   */
  get id() {
    return this._id;
  }
  /**
   * 图形的顶点位置信息
   * @readonly
   * @return {Cartesian3[]|Cartesian3}
   */
  get positions() {
    return this._positions;
  }

  /**
   * 图形类型
   * @readonly
   * @type {GraphicType}
   */
  get type() {
    return this._type;
  }

  /**
   * 保存了描述该图形的所有属性信息
   * @type {Properties}
   */
  get properties() {
    return this._properties;
  }
  set properties(val) {
    this._properties = new Properties(val);
  }

  /**
   * 包含了该图形几何信息的实体，场景将根据它渲染图形，且场景中任何对该图形的操作都直接作用于其实体。
   * @readonly
   * @type {Cesium.Entity}
   */
  get entity() {
    return this._entity;
  }

  /**
   * 图形是否可见
   * @return {Bool} [description]
   */
  get show() {
    return this._show;
  }

  set show(v) {
    this._show = v;
    if (this.entity) {
      this.entity.show = this._show;
    }
  }

  /**
   * 销毁对象。
   */
  destroy() {
    console.log("destroy");
    this._entity = undefined;
    this._entityOptions = undefined;
    this._positions = undefined;
    this.properties && this.properties.destroy();
    this._properties = undefined;
    destroyObject(this);
  }

  /**
   * 开始编辑几何信息，此时图形的顶点可以被修改、删除、移动。
   * 属性信息的编辑不需要调用该方法。
   * @fires BasePlot#preEdit
   */
  startEdit() {
    if (this.entity) {
      const callbackProperty = toCallbackProperty(this.positions);
      this.entity.position && (this.entity.position = callbackProperty);
      this.entity.polyline &&
        (this.entity.polyline.positions = toCallbackProperty(
          this._nodePositions || this.positions
        ));
      this.entity.polygon &&
        (this.entity.polygon.hierarchy = toCallbackProperty(
          new Cesium.PolygonHierarchy(this.positions)
        ));
    }
  }

  /**
   * 几何要素编辑完成后调用该方法，以降低性能消耗。
   * <p style='font-weight:bold'>建议在图形编辑完成后调用该方法，因为CallbackProperty对资源消耗比较大，虽然对单个图形来说，不调用此方法并不会有任何影响。</p>
   */
  stopEdit() {
    if (this.entity) {
      this.entity.position && (this.entity.position = this.positions);
      this.entity.polyline &&
        (this.entity.polyline.positions =
          this._nodePositions || this.positions);
      this.entity.polygon &&
        (this.entity.polygon.hierarchy = new Cesium.PolygonHierarchy(
          this.positions
        ));
    }
  }

  /**
   * 创建属性信息
   * @private
   */
  createProperties() {
    const options = this._entityOptions;
    const { properties } = options;
    this._properties = new Properties(properties);
    delete options.properties;
  }

  /**
   * 创建实体
   * @private
   * @return {Entity}
   */
  createEntity() {
    this.createProperties();
  }

  /**
   * 将对象转为GeoJson格式
   * @return {Object}
   */
  toGeoJson() {
    abstract();
  }

  /**
   * 返回该图形的几何描述，包括类型，经纬度等，必须在派生类中实现它。
   * @return {Object}
   */
  getGeometry() {
    abstract();
  }
  static getEntityFromGeoJson(json) {
    if (!defined(json)) {
      return;
    }

    if (json.geometry && json.geometry.type.toUpperCase() === "POLYGON") {
      let hierarchy = [];
      const coordinates = json.geometry.coordinates;
      if (!defined(coordinates) || !Array.isArray(coordinates)) {
        return;
      }
      for (let coords of coordinates) {
        if (!Array.isArray(coords)) {
          return;
        }
        for (let coor of coords) {
          const ll = Cesium.Cartesian3.fromDegrees(coor[0], coor[1]);
          if (!defined(ll)) return;
          hierarchy.push(ll);
        }
      }
      return new Cesium.Entity({
        polygon: {
          material: Cesium.Color.fromCssColorString("rgba(247,224,32,0.5)"),
          outlineColor: Cesium.Color.RED,
          perPositionHeight: false,
          hierarchy,
        },
      });
    }

    return hierarchy;
  }
}

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true,
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function");
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      writable: true,
      configurable: true,
    },
  });
  if (superClass) _setPrototypeOf(subClass, superClass);
}

function _getPrototypeOf(o) {
  _getPrototypeOf = Object.setPrototypeOf
    ? Object.getPrototypeOf
    : function _getPrototypeOf(o) {
        return o.__proto__ || Object.getPrototypeOf(o);
      };
  return _getPrototypeOf(o);
}

function _setPrototypeOf(o, p) {
  _setPrototypeOf =
    Object.setPrototypeOf ||
    function _setPrototypeOf(o, p) {
      o.__proto__ = p;
      return o;
    };

  return _setPrototypeOf(o, p);
}

function _isNativeReflectConstruct() {
  if (typeof Reflect === "undefined" || !Reflect.construct) return false;
  if (Reflect.construct.sham) return false;
  if (typeof Proxy === "function") return true;

  try {
    Date.prototype.toString.call(Reflect.construct(Date, [], function () {}));
    return true;
  } catch (e) {
    return false;
  }
}

function _assertThisInitialized(self) {
  if (self === void 0) {
    throw new ReferenceError(
      "this hasn't been initialised - super() hasn't been called"
    );
  }

  return self;
}

function _possibleConstructorReturn(self, call) {
  if (call && (typeof call === "object" || typeof call === "function")) {
    return call;
  }

  return _assertThisInitialized(self);
}

function _createSuper(Derived) {
  var hasNativeReflectConstruct = _isNativeReflectConstruct();

  return function _createSuperInternal() {
    var Super = _getPrototypeOf(Derived),
      result;

    if (hasNativeReflectConstruct) {
      var NewTarget = _getPrototypeOf(this).constructor;

      result = Reflect.construct(Super, arguments, NewTarget);
    } else {
      result = Super.apply(this, arguments);
    }

    return _possibleConstructorReturn(this, result);
  };
}

function _superPropBase(object, property) {
  while (!Object.prototype.hasOwnProperty.call(object, property)) {
    object = _getPrototypeOf(object);
    if (object === null) break;
  }

  return object;
}

function _get(target, property, receiver) {
  if (typeof Reflect !== "undefined" && Reflect.get) {
    _get = Reflect.get;
  } else {
    _get = function _get(target, property, receiver) {
      var base = _superPropBase(target, property);

      if (!base) return;
      var desc = Object.getOwnPropertyDescriptor(base, property);

      if (desc.get) {
        return desc.get.call(receiver);
      }

      return desc.value;
    };
  }

  return _get(target, property, receiver || target);
}

function _toConsumableArray(arr) {
  return (
    _arrayWithoutHoles(arr) ||
    _iterableToArray(arr) ||
    _unsupportedIterableToArray(arr) ||
    _nonIterableSpread()
  );
}

function _arrayWithoutHoles(arr) {
  if (Array.isArray(arr)) return _arrayLikeToArray(arr);
}

function _iterableToArray(iter) {
  if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter))
    return Array.from(iter);
}

function _unsupportedIterableToArray(o, minLen) {
  if (!o) return;
  if (typeof o === "string") return _arrayLikeToArray(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor) n = o.constructor.name;
  if (n === "Map" || n === "Set") return Array.from(o);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n))
    return _arrayLikeToArray(o, minLen);
}

function _arrayLikeToArray(arr, len) {
  if (len == null || len > arr.length) len = arr.length;

  for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

  return arr2;
}

function _nonIterableSpread() {
  throw new TypeError(
    "Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."
  );
}

/**
 * 如果第一个元素为空或未定义，则返回第二个元素，用于设置默认属性
 * @exports defaultValue
 * @param {any} a
 * @param {any} b
 * @returns {any} 如果第一个元素为空或未定义，则返回第二个元素
 *
 * @example
 * param = Cesium.defaultValue(param, 'default');
 */
function defaultValue(a, b) {
  if (a !== undefined && a !== null) {
    return a;
  }

  return b;
}
/**
 *
 * 空对象，该对象不能被编辑
 *
 * @type {Object}
 * @memberof defaultValue
 *
 */

defaultValue.EMPTY_OBJECT = Object.freeze({});

/**
 * 箭头构件类型
 * @exports ComponentType
 * @enum {Number}
 */
var ComponentType = {
  /**
   * 箭头
   * @type {Number}
   * @constant
   */
  ARROW: 0,

  /**
   * 半箭头
   * @type {Number}
   * @constant
   */
  HALF_ARROW: 1,

  /**
   * 贝塞尔曲线
   * @type {Number}
   * @constant
   */
  BEZIER: 2,

  /**
   * 样条曲线
   * @type {Number}
   * @constant
   */
  SPLINE: 3,

  /**
   * 燕尾
   * @type {Number}
   * @constant
   */
  SWALLOW_TRAIL: 4,

  /**
   * 梯形
   * @type {Number}
   * @constant
   */
  TRAPEZOID: 5,

  /**
   * 半梯形
   * @type {Number}
   * @constant
   */
  HALF_TRAPEZOID: 6,
  HALF_SWALLOW_TRAIL: 7,
  HALF_SPLINE: 8,
};

ComponentType.getLabel = function (component) {
  var label;

  switch (component.type) {
    case ComponentType.HALF_ARROW:
      label = "HALF_ARROW";
      break;

    case ComponentType.ARROW:
      lebel = "ARROW";
      break;

    case ComponentType.BEZIER:
      label = "BEZIER";
      break;

    case ComponentType.SPLINE:
      label = "SPLINE";
      break;

    case ComponentType.SWALLOW_TRAIL:
      label = "SWALLOW_TRAIL";
      break;

    case ComponentType.HALF_SWALLOW_TRAIL:
      label = "HALF_SWALLOW_TRAIL";
      break;

    case ComponentType.HALF_SPLINE:
      label = "HALF_SPLINE";
      break;

    default:
      label = undefined;
  }

  return label;
};
/**
 * function
 * @param  {[type]} type [description]
 * @return {[type]}      [description]
 */

ComponentType.getErrorMsg = function (component) {
  component.type;
  var controls = component.controls.length;

  if (!ComponentType.validate(component)) {
    throw new Error(
      ComponentType.getLabel(component) +
        "控制点个数必须不少于" +
        component.controlPointsCount[0] +
        ",实际只有" +
        controls +
        "个"
    );
  }
};

ComponentType.validate = function (component) {
  var controls = component.controls.length;

  if (controls < component.controlPointsCount[0]) {
    return false;
  }

  return true;
};

var Component = /*#__PURE__*/ (function () {
  function Component() {
    var options =
      arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, Component);

    this._controls = options.controls || [];
    this._index = options.index;
    this._inverse = options.inverse || false;

    if (!this._index) {
      var count = this._controls.length;
      this._index = new Array(count);

      for (var i = 0; i < count; i++) {
        this._index[i] = i;
      }
    }
  }
  /**
   * 描述箭头的控制点个数，数组第一个值为最小个数，控制点小于最小值将无法创建箭头，
   * 数组第二个值表示最大控制点个数，大于最大值的控制点将被抛弃
   * @return {Point[]} 控制点个数
   */

  _createClass(Component, [
    {
      key: "createNodes",
      value: function createNodes() {
        ComponentType.getErrorMsg(this);
      },
      /**
       * 返回index指定的控制点
       * @param  {Number} index
       * @return {Number[]}
       */
    },
    {
      key: "get",
      value: function get(index) {
        if (this.index) {
          return this.controls[this.index[index]];
        }

        return this.controls[index];
      },
    },
    {
      key: "controls",
      get: function get() {
        return this._controls;
      },
      /**
       * 生成组件时输入顶点的索引
       * @return {Number[]}
       */
    },
    {
      key: "index",
      get: function get() {
        return this._index;
      },
      /**
       * 组件类型
       * @return {ComponentType}
       */
    },
    {
      key: "type",
      get: function get() {
        return this._type;
      },
    },
    {
      key: "controlPointsCount",
      get: function get() {
        return this._controlPointsCount;
      },
    },
    {
      key: "nodes",
      get: function get() {
        return this._nodes;
      },
      set: function set(v) {
        this._nodes = v;
      },
      /**
       * 确定箭头在控制点连线的的左侧还是右侧，inverse为false是生成的图形在控制点连线的左侧
       * @return {Bool}
       */
    },
    {
      key: "inverse",
      get: function get() {
        return this._inverse;
      },
      set: function set(v) {
        this._inverse = v;
      },
    },
  ]);

  return Component;
})();

var PlotUtil = /*#__PURE__*/ (function () {
  /**
   * 几何图形学基础方法
   */
  function PlotUtil() {
    _classCallCheck(this, PlotUtil);
  }
  /**
   * 平面点的欧氏距离，如果点的数据大于2，将计算相邻两个点的距离之和。
   * @param  {Number[]} args 需要计算距离的平面点集合
   * @return {Float}      欧氏距离
   */

  _createClass(PlotUtil, null, [
    {
      key: "distance",
      value: function distance() {
        var length = arguments.length;

        if (length < 2) {
          return 0;
        }

        var distance = 0;

        for (var i = 0; i < length - 1; i++) {
          var nextIndex = (i + 1) % length;
          var start = i < 0 || arguments.length <= i ? undefined : arguments[i];
          var end =
            nextIndex < 0 || arguments.length <= nextIndex
              ? undefined
              : arguments[nextIndex];
          distance += Math.sqrt(
            Math.pow(start[0] - end[0], 2) + Math.pow(start[1] - end[1], 2)
          );
        }

        return distance;
      },
      /**
       * @param  {Number[]} points            [description]
       * @param  {Number} [percentage=0.99] [description]
       * @return {Number}                  长度
       */
    },
    {
      key: "baseLength",
      value: function baseLength(points) {
        var percentage =
          arguments.length > 1 && arguments[1] !== undefined
            ? arguments[1]
            : 0.99;
        return Math.pow(
          PlotUtil.distance.apply(PlotUtil, _toConsumableArray(points)),
          percentage
        );
      },
      /**
       * 平面两点的中点
       * @param  {Number[]} start 起点
       * @param  {Number[]} end   终点
       * @return {Number[]}       中点坐标
       */
    },
    {
      key: "mid",
      value: function mid(start, end) {
        return [(start[0] + end[0]) / 2, (start[1] + end[1]) / 2];
      },
      /**
       * 方位角
       * @param  {Number[]} start 起点
       * @param  {Number[]} end   终点
       * @return {Number} 向量与Y轴的夹角
       */
    },
    {
      key: "azimuth",
      value: function azimuth(start, end) {
        var result;
        var _ref = [end, start];
        start = _ref[0];
        end = _ref[1];
        //向量与Y轴的夹角;
        var angle = Math.asin(
          Math.abs(start[1] - end[1]) / PlotUtil.distance(start, end)
        );
        result =
          start[1] >= end[1] && start[0] >= end[0]
            ? angle + Math.PI
            : start[1] >= end[1] && start[0] < end[0]
            ? Math.PI * 2 - angle
            : start[1] < end[1] && start[0] >= end[0]
            ? Math.PI - angle
            : angle;
        return result;
      },
      /**
       * 根据两个点计算第三个点,具体为：如果以end为圆心，以radius为半径创建一个圆,以向量<start,end>方位角为起始位置，
       * 旋转angle度后得到的圆弧上的点,inverse为false，向正方向旋转,true,向负方向旋转
       * @param  {Number[]} start   起点，即圆心
       * @param  {Number[]} end     终点
       * @param  {Number} angle   旋转角度，单位弧度
       * @param  {Number} radius    半径
       * @param  {bool} inverse  是否逆向旋转
       * @return {Number[]}      新点位
       */
    },
    {
      key: "thirdPoint",
      value: function thirdPoint(start, end, angle, radius) {
        var inverse =
          arguments.length > 4 && arguments[4] !== undefined
            ? arguments[4]
            : false;
        var azimuth = PlotUtil.azimuth(start, end);
        var adjustAngle = inverse ? azimuth - angle : azimuth + angle;
        var x = radius * Math.cos(adjustAngle);
        var y = radius * Math.sin(adjustAngle);
        return [end[0] + x, end[1] + y];
      },
      /**
       * 判断由t,o,e是否顺时针环绕
       * @param  {Number[]}  t
       * @param  {Number[]}  o
       * @param  {Number[]}  e
       * @return {Boolean}
       */
    },
    {
      key: "isClockWise",
      value: function isClockWise(t, o, e) {
        return (e[1] - t[1]) * (o[0] - t[0]) > (o[1] - t[1]) * (e[0] - t[0]);
      },
      /**
       * 计算两条直线之间的夹角，两条直线必须有公共点
       * @param  {Number[]} origin 两直接的公共点
       * @param  {Number[]} point1 直线1的另一个顶点
       * @param  {Number[]} point2 直线2的另一个顶点
       * @return {number}  两直线之间的夹角，单位弧度
       */
    },
    {
      key: "angleOfThreePoints",
      value: function angleOfThreePoints(origin, point1, point2) {
        var angle =
          PlotUtil.azimuth(origin, point1) - PlotUtil.azimuth(origin, point2);
        return angle > 0 ? angle : Math.PI * 2 + angle;
      },
      /**
       * 四边形B样条曲面因子
       * @param  {Number} t
       * @param  {Number} o
       * @return {Number}
       */
    },
    {
      key: "quadricBSplineFactor",
      value: function quadricBSplineFactor(t, o) {
        if (t === 0) {
          return Math.pow(o - 1, 2) / 2;
        }

        if (t === 1) {
          return (-2.0 * Math.pow(o, 2) + 2 * o + 1) / 2;
        }

        if (t === 2) {
          return Math.pow(o, 2) / 2;
        }

        return 0;
      },
      /**
       * 四边形B样条曲线
       *
       * @param  {Number[]} points 计算四边形B样条曲线的输入点
       * @return {Number[]}        构成四边形B样条曲线的点
       */
    },
    {
      key: "quadricBSpline",
      value: function quadricBSpline(points) {
        if (points <= 2) {
          return points;
        }

        var result = [];
        var fac = 2;
        var length = points.length - fac - 1;
        result.push(points[0]);

        for (var n = 0; n <= length; n++) {
          for (var g = 0; g <= 1; g += 0.05) {
            var x = 0,
              y = 0;

            for (var s = 0; s <= fac; s++) {
              var factor = PlotUtil.quadricBSplineFactor(s, g);
              x += factor * points[n + s][0];
              y += factor * points[n + s][1];
            }

            result.push([x, y]);
          }
        }

        result.push(points[points.length - 1]);
        return result;
      },
      /**
       * 组合C<sub>0</sub><sup style="margin-left:-5px">t</sup>的值
       * @param  {Number} t
       * @param  {Number} o
       * @return {Number}
       */
    },
    {
      key: "binomialFactor",
      value: function binomialFactor(t, o) {
        return (
          PlotUtil.factorial(t) /
          (PlotUtil.factorial(o) * PlotUtil.factorial(t - o))
        );
      },
      /**
       * 求阶乘
       * @param  {Number} n n必须不小于0
       * @return {Number}   n的阶乘(n!)
       */
    },
    {
      key: "factorial",
      value: function factorial(n) {
        if (n < 0) {
          return NaN;
        }

        if (n === 0) {
          return 1;
        }

        return n * PlotUtil.factorial(n - 1);
      },
      /**
       * 贝塞尔曲线
       * @param {Number[]} points [description]
       * @return {Number[]}   构成贝塞尔曲线的点集
       */
    },
    {
      key: "BezierCurve",
      value: function BezierCurve(points) {
        var count = points.length;

        if (count < 2) {
          return points;
        }

        var curves = [];

        for (var i = 0; i <= 1; i += 0.01) {
          var x = 0,
            y = 0;

          for (var j = 0; j < count; j++) {
            var factor = PlotUtil.binomialFactor(count - 1, j);
            var s = Math.pow(i, j);
            var a = Math.pow(1 - i, count - j - 1);
            x += factor * s * a * points[j][0];
            y += factor * s * a * points[j][1];
          }

          curves.push([x, y]);
        }

        curves.push(points[count - 1]);
        return curves;
      },
    },
  ]);

  return PlotUtil;
})();

var HalfArrowComponent = /*#__PURE__*/ (function (_Component) {
  _inherits(HalfArrowComponent, _Component);

  var _super = _createSuper(HalfArrowComponent);

  /**
   * 半箭头头部
   *           *-----------------------------
   *          **             |              |
   *         * *             |              |
   *        *  *           neck height  arrow height
   *       *   *             |              |
   *      *    *             |              |
   *     *     *             |              |
   *    *   ***x（neck control）--------------              |
   *   *  *                                 |
   *  *--------x(tail control)-----------------------------
   *
   *
   *
   * @param {Object} [options={}] 具有以下属性
   * @param {Number} [options.heightFactor=0.18] 箭头状况高度占整个图形高度(控制点连线长度)的百分比
   * @param {Number} [options.neckHeightFactor=0.15] 脖子占整个整个图形高度的百分比
   * @param {Number} [options.widthFactor=0.3] 箭头宽度占高度的百分比
   * @param {Number} [options.neckWidthFactor=options.widthFactor/2] 脖子宽度占箭头高度的百分比
   * @param {Number} [options.inverse=false] inverse为false是生成的图形在控制点连线的右侧
   */
  function HalfArrowComponent() {
    var _this;

    var options =
      arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, HalfArrowComponent);

    _this = _super.call(this, options);
    _this._controlPointsCount = [2, 2];
    _this._type = ComponentType.HALF_ARROW;
    _this._heightFactor = defaultValue(options.heightFactor, 0.18);
    _this._neckHeightFactor = defaultValue(options.neckHeightFactor, 0.15);
    _this._headWidthFactor = defaultValue(options.headWidthFactor, 0.5);
    _this._neckWidthFactor = defaultValue(options.neckWidthFactor, 0.3);
    _this._headMaxHeight = options.headMaxHeight;
    _this._headTailHeightFactor = defaultValue(
      options.headTailHeightFactor,
      0.3
    );
    _this._inverse = defaultValue(options.inverse, false);
    _this._nodes = [];

    _this.createNodes();

    return _this;
  }

  _createClass(HalfArrowComponent, [
    {
      key: "createNodes",

      /**
       * 生成构成图形的顶点
       * @return {Number[]} 生成构成图形的顶点
       */
      value: function createNodes() {
        _get(
          _getPrototypeOf(HalfArrowComponent.prototype),
          "createNodes",
          this
        ).call(this);

        var controls = this.controls;
        var baseLength = PlotUtil.baseLength(controls);
        var height = this.heightFactor * baseLength;
        baseLength = PlotUtil.distance(this.get(0), this.get(1));

        if (this.headMaxHeight && height > this.headMaxHeight) {
          height = this.headMaxHeight;
        }

        var neckWidth = this.neckWidthFactor * height;
        var width = this.headWidthFactor * height;
        height = height > baseLength ? baseLength : height;
        var neckHeight = this.neckHeightFactor * height;
        var tailControl = PlotUtil.thirdPoint(
          this.get(0),
          this.get(1),
          0,
          height
        );
        var neckControl = PlotUtil.thirdPoint(
          this.get(0),
          this.get(1),
          0,
          neckHeight
        );
        var tail = PlotUtil.thirdPoint(
          this.get(1),
          tailControl,
          Math.PI / 2,
          width,
          this.inverse
        );
        var neck = PlotUtil.thirdPoint(
          this.get(1),
          neckControl,
          Math.PI / 2,
          neckWidth,
          this.inverse
        );
        this.neck = neck;
        this.tail = tail;
        this.neckControl = neckControl;
        this.tailControl = tailControl;
        this._nodes = [neckControl, neck, tail, this.get(1)];
        this.completedNodes = new Map();
        this.completedNodes.set(this.inverse, [
          neckControl,
          neck,
          tail,
          this.get(1),
        ]);
        return this._nodes;
      },
    },
    {
      key: "headMaxHeight",
      get: function get() {
        return this._headMaxHeight;
      },
      /**
       * 箭头高度因子
       * @return {Number} 箭头高度占整个图形高度的百分比
       */
    },
    {
      key: "heightFactor",
      get: function get() {
        return this._heightFactor;
      },
      /**
       * 脖子高度因子
       * @return {Number}
       */
    },
    {
      key: "neckHeightFactor",
      get: function get() {
        return this._neckHeightFactor;
      },
      /**
       * 箭头宽度因子
       * @return {Number}
       */
    },
    {
      key: "headWidthFactor",
      get: function get() {
        return this._headWidthFactor;
      },
      /**
       * 脖子宽度因子
       * @return {Number}
       */
    },
    {
      key: "neckWidthFactor",
      get: function get() {
        return this._neckWidthFactor;
      },
      /**
       * 构成图形的顶点
       * @return {[type]}
       */
    },
    {
      key: "nodes",
      get: function get() {
        return this._nodes;
      },
    },
  ]);

  return HalfArrowComponent;
})(Component);

var ArrowComponent = /*#__PURE__*/ (function (_HalfArrowComponent) {
  _inherits(ArrowComponent, _HalfArrowComponent);

  var _super = _createSuper(ArrowComponent);

  /**
   * 箭头头部
   *
   * @param {Object} [options={}] 具有以下属性
   * @param {Number} [options.heightFactor=0.18] 箭头状况高度占整个图形高度(控制点连线长度)的百分比
   * @param {Number} [options.neckHeightFactor=0.85] 脖子占整个箭头的百分比
   * @param {Number} [options.widthFactor=0.3] 箭头宽度占高度的百分比
   * @param {Number} [options.neckWidthFactor=options.widthFactor/2] 脖子宽度占箭头高度的百分比
   */
  function ArrowComponent() {
    var _this;

    var options =
      arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, ArrowComponent);

    _this = _super.call(this, options);
    _this._type = ComponentType.ARROW;

    _this.createNodes();

    return _this;
  }

  _createClass(ArrowComponent, [
    {
      key: "createNodes",
      value: function createNodes() {
        var completedNodes = new Map();
        this._inverse = true;

        var rightHalf = _get(
          _getPrototypeOf(ArrowComponent.prototype),
          "createNodes",
          this
        ).call(this);

        completedNodes.set(this.inverse, _toConsumableArray(rightHalf));
        this._inverse = false;

        var leftHalf = _get(
          _getPrototypeOf(ArrowComponent.prototype),
          "createNodes",
          this
        ).call(this);

        completedNodes.set(this.inverse, _toConsumableArray(leftHalf));
        leftHalf.shift();
        rightHalf.shift();
        leftHalf.pop();
        this.inverse = undefined;
        this.completedNodes = completedNodes;
        this._nodes = [].concat(
          _toConsumableArray(leftHalf),
          _toConsumableArray(rightHalf.reverse())
        );
        return [].concat(
          _toConsumableArray(leftHalf),
          _toConsumableArray(rightHalf.reverse())
        );
      },
    },
  ]);

  return ArrowComponent;
})(HalfArrowComponent);

var HalfTrapezoidComponent = /*#__PURE__*/ (function (_Component) {
  _inherits(HalfTrapezoidComponent, _Component);

  var _super = _createSuper(HalfTrapezoidComponent);

  /**
   * 半梯形
   *    *** head control
   *   *  *
   *  *   *
   * *****x tail control
   * @param {[type]} options [description]
   * @param {Number} [options.heightFactor] 梯形高度高图形高度的百分比
   * @param {Number} [options.tailWidth=0.5] 梯形尾部宽度占高度的百分比
   * @param {Number} [options.headWidthFactor=0.3] 梯形头部宽度占高度的百分比
   */
  function HalfTrapezoidComponent(options) {
    var _this;

    _classCallCheck(this, HalfTrapezoidComponent);

    _this = _super.call(this, options);
    _this._type = ComponentType.HALF_TRAPEZOID;
    _this._controlPointsCount = [2, 2];
    _this._heightFactor = defaultValue(options.heightFactor, 0.82);
    _this._tailWidthFactor = defaultValue(options.tailWidthFactor, 0.5);
    _this._headWidthFactor = defaultValue(options.headWidthFactor, 0.3);

    _this.createNodes();

    return _this;
  }
  /**
   * 梯形高度因子
   * @return {Number} 梯形高度高图形高度的百分比
   */

  _createClass(HalfTrapezoidComponent, [
    {
      key: "createNodes",
      value: function createNodes() {
        _get(
          _getPrototypeOf(HalfTrapezoidComponent.prototype),
          "createNodes",
          this
        ).call(this);

        var tailControl = this.get(0);
        var baseLength = PlotUtil.baseLength(this._controls);
        var height = this.heightFactor * baseLength;
        var headControl = PlotUtil.thirdPoint(
          this.get(1),
          tailControl,
          0,
          height,
          this.inverse
        );
        var tailWidth = this.tailWidthFactor * baseLength;
        var headWidth = this.headWidthFactor * baseLength;
        var leftHead = PlotUtil.thirdPoint(
          tailControl,
          headControl,
          Math.PI / 2,
          headWidth,
          this.inverse
        );
        var leftTail = PlotUtil.thirdPoint(
          headControl,
          tailControl,
          Math.PI / 2,
          tailWidth,
          !this.inverse
        );
        this._nodes = [leftHead, leftTail, tailControl, headControl].flat();
        this.completedNodes = new Map();
        this.completedNodes.set(this.inverse, [leftTail]);
        return [leftTail];
      },
    },
    {
      key: "linkArrow",
      value: function linkArrow(options) {
        var arrowNodes = options.arrowNodes,
          bodyNodes = options.bodyNodes,
          inverse = options.inverse;

        if (inverse) {
          return [].concat(
            _toConsumableArray(bodyNodes),
            _toConsumableArray(arrowNodes)
          );
        }

        return [].concat(
          _toConsumableArray(arrowNodes),
          _toConsumableArray(bodyNodes)
        );
      },
    },
    {
      key: "linkTail",
      value: function linkTail() {
        var options =
          arguments.length > 0 && arguments[0] !== undefined
            ? arguments[0]
            : {};
        var tailNodes = options.tailNodes,
          bodyNodes = options.bodyNodes;
        options.inverse;
        return [].concat(
          _toConsumableArray(tailNodes),
          _toConsumableArray(bodyNodes)
        );
      },
    },
    {
      key: "heightFactor",
      get: function get() {
        return this._heightFactor;
      },
      /**
       * 梯形头部宽度因子
       * @return {Number} 梯形头部宽度占高度的百分比
       */
    },
    {
      key: "headWidthFactor",
      get: function get() {
        return this._headWidthFactor;
      },
      /**
       * 梯形尾部宽度因子
       * @return {Number} 梯形尾部宽度占高度的百分比
       */
    },
    {
      key: "tailWidthFactor",
      get: function get() {
        return this._tailWidthFactor;
      },
    },
  ]);

  return HalfTrapezoidComponent;
})(Component);

var TrapezoidComponent = /*#__PURE__*/ (function (_HalfTrapezoidCompone) {
  _inherits(TrapezoidComponent, _HalfTrapezoidCompone);

  var _super = _createSuper(TrapezoidComponent);

  function TrapezoidComponent() {
    var _this;

    var options =
      arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, TrapezoidComponent);

    _this = _super.call(this, options);
    _this._type = ComponentType.TRAPEZOID;
    return _this;
  }

  _createClass(TrapezoidComponent, [
    {
      key: "createNodes",
      value: function createNodes() {
        var completedNodes = new Map();
        this.inverse = false;

        var right = _get(
          _getPrototypeOf(TrapezoidComponent.prototype),
          "createNodes",
          this
        ).call(this);

        completedNodes.set(this.inverse, _toConsumableArray(right));
        this.inverse = true;

        var left = _get(
          _getPrototypeOf(TrapezoidComponent.prototype),
          "createNodes",
          this
        ).call(this);

        completedNodes.set(this.inverse, _toConsumableArray(left));
        this.completedNodes = completedNodes;
        this.inverse = undefined;
        this._nodes = left.concat(right);
        return this._nodes;
      },
    },
  ]);

  return TrapezoidComponent;
})(HalfTrapezoidComponent);

var Arrow = /*#__PURE__*/ (function () {
  function Arrow(options) {
    _classCallCheck(this, Arrow);

    this._headHeightFactor = defaultValue(options.headHeightFactor, 0.2);
    this._neckHeightFactor = defaultValue(options.neckHeightFactor, 0.8);
    this._headWidthFactor = defaultValue(options.headWidthFactor, 0.5);
    this._neckWidthFactor = defaultValue(options.neckWidthFactor, 0.3);
    this._tailWidthFactor = defaultValue(options.tailWidthFactor, 0.3);
    this._tailHeightFactor = defaultValue(options.tailHeightFactor, 0.2);
    this._controls = defaultValue(options.controls, []);
    this._headComponent = undefined;
    this._bodyComponent = undefined;
    this._tailComponent = undefined;
    this._nodes = undefined;
    this._polygon = [];
    this._polyline = [];
  }

  _createClass(Arrow, [
    {
      key: "postProcessing",

      /**
       * 几何图形做进一步处理
       * @return {Number[]}
       */
      value: function postProcessing(pts) {
        return pts;
      },
      /**
       * 合并箭头的各个组件
       * @return {Number[]}
       */
    },
    {
      key: "merge",
      value: function merge() {
        var _this$polygon, _this$polyline;

        var head = this.headComponent;
        var body = this.bodyComponent;
        var tail = this.tailComponent;
        var bodyNodes;
        body && (bodyNodes = body.completedNodes);
        var nodes = [];
        var tNode;

        if (bodyNodes && bodyNodes.get(true)) {
          tNode = bodyNodes.get(true);
          nodes = body.linkTail({
            tailNodes: nodes,
            bodyNodes: tNode,
          });
        }

        if (head) {
          tNode = head.nodes;

          if (body) {
            nodes = body.linkArrow({
              arrowNodes: tNode,
              bodyNodes: nodes,
              inverse: true,
              target: this,
            });
          } else {
            nodes = tNode;
          }
        }

        if (bodyNodes && bodyNodes.get(false)) {
          tNode = bodyNodes.get(false);
          nodes = body.linkArrow({
            arrowNodes: nodes,
            bodyNodes: tNode,
            inverse: false,
            target: this,
          });
        }

        if (tail) {
          var _nodes;

          (_nodes = nodes).push.apply(_nodes, _toConsumableArray(tail.nodes));
        }

        this.reset();

        (_this$polygon = this.polygon).push.apply(
          _this$polygon,
          _toConsumableArray(nodes.flat())
        ); // nodes.shift();

        (_this$polyline = this.polyline).push.apply(
          _this$polyline,
          _toConsumableArray(nodes.flat())
        );
      },
    },
    {
      key: "update",
      value: function update() {
        this.createNodes();
      },
    },
    {
      key: "reset",
      value: function reset() {
        this.polygon.splice(0);
        this.polyline.splice(0);
      },
    },
    {
      key: "polygon",
      get: function get() {
        return this._polygon;
      },
    },
    {
      key: "polyline",
      get: function get() {
        return this._polyline;
      },
    },
    {
      key: "controls",
      get: function get() {
        return this._controls;
      },
    },
  ]);

  return Arrow;
})();

var HalfSwallowTail = /*#__PURE__*/ (function (_Component) {
  _inherits(HalfSwallowTail, _Component);

  var _super = _createSuper(HalfSwallowTail);

  /**
   * [constructor description]
   * @param {Object} [options={}] [description]
   * @param {Number} [options.heightFactor] 尾部高度占总高度的比例
   */
  function HalfSwallowTail() {
    var _this;

    var options =
      arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, HalfSwallowTail);

    _this = _super.call(this, options);
    _this._type = ComponentType.HALF_SWALLOW_TRAIL;
    _this._controlPointsCount = [3, Infinity];
    _this._heightFactor = defaultValue(options.heightFactor, 0.3);

    _this.createNodes();

    return _this;
  }
  /**
   * 尾部高度因了
   * @return {Number} 尾部高度占总高度的比例
   */

  _createClass(HalfSwallowTail, [
    {
      key: "createNodes",
      value: function createNodes() {
        _get(
          _getPrototypeOf(HalfSwallowTail.prototype),
          "createNodes",
          this
        ).call(this);

        var baseLength = PlotUtil.baseLength(this.controls);
        var height = this._heightFactor * baseLength;
        var mid = PlotUtil.mid(this.get(0), this.get(1));
        var headControl = PlotUtil.thirdPoint(
          this.get(2),
          mid,
          0,
          height,
          this.inverse
        );
        this.nodes = [headControl];
        return this.nodes;
      },
    },
    {
      key: "heightFactor",
      get: function get() {
        return this._heightFactor;
      },
    },
  ]);

  return HalfSwallowTail;
})(Component);

function defineProperties(object) {
  var _loop = function _loop(key) {
    if (object.hasOwnProperty(key) && key.startsWith("_")) {
      var newKey = key.replace("_", "");
      Object.defineProperty(object, newKey, {
        get: function get() {
          return object[key];
        },
        set: function set(v) {
          object[key] = v;
        },
      });
    }
  };

  for (var key in object) {
    _loop(key);
  }
}

var StraightArrow = /*#__PURE__*/ (function (_Arrow) {
  _inherits(StraightArrow, _Arrow);

  var _super = _createSuper(StraightArrow);

  /**
   * 直线箭头
   * @param {Object} [options={}] 具有以下属性
   * @param {Number} [options.headHeightFactor=0.18] 头部高度占箭头高度的比例
   * @param {Number} [options.neckHeightFactor=0.13] 脖子高度占箭头高度的比例
   * @param {Number} [options.headWidthFactor=0.2] 头部宽度占箭头高度的比例
   * @param {Number} [options=neckWidthFactor=options.neckHeightFactor/2] 脖子宽度占箭头高度的比例
   * @param {Number} [options.tailWidthFactor=0.3] 尾部宽度占箭头高度的比例
   * @param {Number} [options.tailHeightFactor=0.2] 尾部高度占箭头高度的比例
   */
  function StraightArrow() {
    var _this;

    var options =
      arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, StraightArrow);

    options = defaultValue(options, defaultValue.EMPTY_OBJECT);
    _this = _super.call(this, options);
    _this._tail = defaultValue(options.tail, false);

    _this.init();

    defineProperties(_assertThisInitialized(_this));

    _this.merge();

    return _this;
  }

  _createClass(StraightArrow, [
    {
      key: "addControl",
      value: function addControl(control) {
        if (this.controls.length >= StraightArrow.MIN_CONTROL_COUNT) {
          this.controls.pop();
        }

        this.controls.push(control);

        if (this.controls.length >= StraightArrow.MIN_CONTROL_COUNT) {
          this.init();
          this.merge();
        }
      },
    },
    {
      key: "popControl",
      value: function popControl() {
        return this.controls.pop();
      },
    },
    {
      key: "updateControl",
      value: function updateControl(index, control) {
        this.controls[index] = control;

        if (this.controls.length >= StraightArrow.MIN_CONTROL_COUNT) {
          this.init();
          this.merge();
        }
      },
    },
    {
      key: "init",
      value: function init() {
        if (this.controls.length < StraightArrow.MIN_CONTROL_COUNT) {
          return;
        }

        this._headComponent = this.createHeadComponent();
        this._bodyComponent = this.createBodyComponent();

        if (this._tail) {
          this._tailComponent = this.createTailComponent();
        }
      },
    },
    {
      key: "update",
      value: function update() {
        this._headComponent = this.createHeadComponent();
        this._bodyComponent = this.createBodyComponent();

        if (this._tail) {
          this._tailComponent = this.createTailComponent();
        }

        this.merge();
      },
    },
    {
      key: "createBodyComponent",
      value: function createBodyComponent() {
        return new TrapezoidComponent({
          controls: this._controls,
          heightFactor: 1 - this._neckHeightFactor,
          headWidthFactor: this._neckWidthFactor,
          tailWidthFactor: this._tailWidthFactor,
        });
      },
    },
    {
      key: "createHeadComponent",
      value: function createHeadComponent() {
        return new ArrowComponent({
          controls: this._controls,
          headWidthFactor: this._headWidthFactor,
          neckHeightFactor: this._neckHeightFactor,
          neckWidthFactor: this._neckWidthFactor,
          headHeightFactor: this._headHeightFactor,
        });
      },
    },
    {
      key: "createTailComponent",
      value: function createTailComponent() {
        if (!this._bodyComponent) {
          return;
        }

        var bodyNodes = this._bodyComponent.nodes;
        return new HalfSwallowTail({
          controls: [].concat(_toConsumableArray(bodyNodes), [
            this._controls[1],
          ]),
          heightFactor: this._tailHeightFactor,
        });
      },
    },
    {
      key: "tail",
      set: function set(v) {
        this._tail = v;
      },
    },
  ]);

  return StraightArrow;
})(Arrow);

_defineProperty(StraightArrow, "MIN_CONTROL_COUNT", 2);

var SplineComponent = /*#__PURE__*/ (function (_Component) {
  _inherits(SplineComponent, _Component);

  var _super = _createSuper(SplineComponent);

  /**
   * 样条曲线
   * @param {Object} options 具有以下属性
   * @param {Number} [options.headWidthFactor=0.1] 头部宽度占图形高度的比例
   * @param {Number} [options.tailWidthFactor=0.3] 尾部宽度占图形高度的比例
   */
  function SplineComponent(options) {
    var _this;

    _classCallCheck(this, SplineComponent);

    _this = _super.call(this, options);
    _this._type = ComponentType.HALF_SPLINE;
    _this._controlPointsCount = [2, Infinity];
    _this._headWidthFactor = defaultValue(options.headWidthFactor, 0.1);
    _this._tailWidthFactor = defaultValue(options.tailWidthFactor, 0.3);

    _this.createNodes();

    return _this;
  }

  _createClass(SplineComponent, [
    {
      key: "createNodes",
      value: function createNodes() {
        _get(
          _getPrototypeOf(SplineComponent.prototype),
          "createNodes",
          this
        ).call(this);

        var controls = this.controls;
        var length = PlotUtil.distance.apply(
          PlotUtil,
          _toConsumableArray(controls)
        );
        var baseLength = PlotUtil.baseLength(controls);
        var tailWidth = this.tailWidthFactor * baseLength;
        var headWidth = this.headWidthFactor * baseLength;
        var offset = Math.abs(tailWidth - headWidth) / 2;
        var distance = 0;
        var cts = controls;
        var u = [];

        for (var i = 1; i < controls.length - 1; i++) {
          var angle =
            PlotUtil.angleOfThreePoints(cts[i], cts[i - 1], cts[i + 1]) / 2;
          distance += PlotUtil.distance(cts[i - 1], cts[i]);

          if (!this.inverse) {
            angle = Math.PI - angle;
          }

          var tmpDis =
            (tailWidth / 2 - (distance / length) * offset) / Math.sin(angle);
          var point = PlotUtil.thirdPoint(
            cts[i - 1],
            cts[i],
            angle,
            tmpDis,
            this.inverse
          );
          u.push(point);
        }

        this.completedNodes = new Map();
        this.completedNodes.set(this.inverse, u);
        this.nodes = u;
        return u;
      },
    },
    {
      key: "linkArrow",
      value: function linkArrow(options) {
        var arrowNodes = options.arrowNodes,
          bodyNodes = options.bodyNodes,
          inverse = options.inverse,
          target = options.target;
        var nodes = [];

        if (target._tail) {
          nodes.push(target.controls[+!inverse]);
        }

        if (inverse) {
          nodes.push.apply(
            nodes,
            _toConsumableArray(bodyNodes).concat([arrowNodes[0]])
          );

          var _spline = PlotUtil.quadricBSpline(nodes);

          return [].concat(
            _toConsumableArray(_spline),
            _toConsumableArray(arrowNodes)
          );
        }

        nodes.push.apply(
          nodes,
          _toConsumableArray(bodyNodes).concat([
            arrowNodes[arrowNodes.length - 1],
          ])
        );
        var spline = PlotUtil.quadricBSpline(nodes);
        return [].concat(
          _toConsumableArray(arrowNodes),
          _toConsumableArray(spline.reverse())
        );
      },
    },
    {
      key: "linkTail",
      value: function linkTail() {
        var options =
          arguments.length > 0 && arguments[0] !== undefined
            ? arguments[0]
            : {};
        var tailNodes = options.tailNodes,
          bodyNodes = options.bodyNodes;
        options.inverse;
        return [].concat(
          _toConsumableArray(tailNodes),
          _toConsumableArray(bodyNodes)
        );
      },
    },
    {
      key: "tailWidthFactor",
      get: function get() {
        return this._tailWidthFactor;
      },
    },
    {
      key: "headWidthFactor",
      get: function get() {
        return this._headWidthFactor;
      },
    },
  ]);

  return SplineComponent;
})(Component);

var SplineComponent$1 = /*#__PURE__*/ (function (_HalfSplineComponent) {
  _inherits(SplineComponent, _HalfSplineComponent);

  var _super = _createSuper(SplineComponent);

  function SplineComponent() {
    var options =
      arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, SplineComponent);

    return _super.call(this, options);
  }

  _createClass(SplineComponent, [
    {
      key: "createNodes",
      value: function createNodes() {
        var completedNodes = new Map();
        this.inverse = false;

        var leftNodes = _get(
          _getPrototypeOf(SplineComponent.prototype),
          "createNodes",
          this
        ).call(this);

        completedNodes.set(this.inverse, _toConsumableArray(leftNodes));
        this.inverse = true;

        var rightNodes = _get(
          _getPrototypeOf(SplineComponent.prototype),
          "createNodes",
          this
        ).call(this);

        completedNodes.set(this.inverse, _toConsumableArray(rightNodes));
        this.inverse = undefined;
        this.nodes = [].concat(
          _toConsumableArray(leftNodes),
          _toConsumableArray(rightNodes.reverse())
        );
        this.completedNodes = completedNodes;
        return [].concat(
          _toConsumableArray(leftNodes),
          _toConsumableArray(rightNodes.reverse())
        );
      },
    },
  ]);

  return SplineComponent;
})(SplineComponent);

var AttackArrow = /*#__PURE__*/ (function (_Arrow) {
  _inherits(AttackArrow, _Arrow);

  var _super = _createSuper(AttackArrow);

  function AttackArrow(options) {
    var _this;

    _classCallCheck(this, AttackArrow);

    options = defaultValue(options, {});
    options.headHeightFactor = defaultValue(options.headHeightFactor, 0.15);
    options.neckHeightFactor = defaultValue(options.headWidthFactor, 0.8);
    options.neckWidthFactor = defaultValue(options.neckWidthFactor, 0.15);
    options.headWidthFactor = defaultValue(options.headWidthFactor, 0.4);
    options.tailWidthFactor = defaultValue(options.tailWidthFactor, 0.25);
    _this = _super.call(this, options);
    _this._headTailHeightFactor = defaultValue(
      options.headTailHeightFactor,
      0.5
    );
    _this._tail = defaultValue(options.tail, true);
    _this._heightFactor = defaultValue(options.heightFactor, 0.8);
    _this._tailHeightFactor = defaultValue(options.tailHeightFactor, 0.05);

    _this.init();

    defineProperties(_assertThisInitialized(_this));

    _this.merge();

    return _this;
  }

  _createClass(AttackArrow, [
    {
      key: "addControl",
      value: function addControl(control) {
        this.controls[this.controls.length - 1]; // if (lastNode && lastNode[0] === control[0] && lastNode[1] === control[1]) {
        //   return;
        // }

        this.controls.push(control);

        if (
          (!this.tail &&
            this.controls.length >= AttackArrow.MIN_CONTROL_COUNT) ||
          this.controls.length >= AttackArrow.MIN_CONTROL_COUNT + 1
        ) {
          this.init();
          this.merge();
        }
      },
    },
    {
      key: "updateControl",
      value: function updateControl(index, control) {
        this.controls[index] = control;

        if (
          (!this.tail &&
            this.controls.length >= AttackArrow.MIN_CONTROL_COUNT) ||
          this.controls.length >= AttackArrow.MIN_CONTROL_COUNT + 1
        ) {
          this.init();
          this.merge();
        }
      },
    },
    {
      key: "popControl",
      value: function popControl() {
        this.controls.pop();
      },
    },
    {
      key: "init",
      value: function init() {
        var _ref;

        if (
          !this.tail &&
          this.controls.length < AttackArrow.MIN_CONTROL_COUNT
        ) {
          return;
        }

        if (
          this.tail &&
          this.controls.length < AttackArrow.MIN_CONTROL_COUNT + 1
        ) {
          return;
        }

        this._head1 = this.controls[0];
        this._head2 = this.controls[1];
        this.tail &&
          PlotUtil.isClockWise(
            this.controls[0],
            this.controls[1],
            this.controls[2]
          ) &&
          ((_ref = [this._head2, this._head1]),
          (this._head1 = _ref[0]),
          (this._head2 = _ref[1]),
          _ref);
        this._headComponent = this.createHeadComponent();
        this._bodyComponent = this.createBodyComponent();

        if (this._tail) {
          this._tailComponent = this.createTailComponent();
        }
      },
    },
    {
      key: "createHeadComponent",
      value: function createHeadComponent() {
        var controls, tailWidth;

        if (this.tail) {
          var mid = PlotUtil.mid(this._head1, this._head2);
          controls = [mid].concat(_toConsumableArray(this.controls.slice(2)));
          tailWidth = PlotUtil.distance(this._head1, this._head2);
        } else {
          controls = this.controls;
        }

        var count = controls.length;
        return new ArrowComponent({
          controls: controls,
          heightFactor: this._headHeightFactor,
          neckHeightFactor: this._neckHeightFactor,
          headWidthFactor: this._headWidthFactor,
          neckWidthFactor: this._neckWidthFactor,
          headMaxHeight: this._headTailHeightFactor * tailWidth,
          index: [count - 2, count - 1],
        });
      },
    },
    {
      key: "createBodyComponent",
      value: function createBodyComponent() {
        var mid,
          controls = this.controls.slice(2);
        var neckWidth = PlotUtil.distance(
          this._headComponent.nodes[0],
          this._headComponent.nodes[4]
        );
        var baseLength = PlotUtil.baseLength(controls);
        var tailWidth;

        if (this._tail) {
          tailWidth = PlotUtil.distance(this.controls[0], this.controls[1]);
          mid = PlotUtil.mid(this._head1, this._head2);
          controls = [mid].concat(_toConsumableArray(controls));

          var _baseLength = PlotUtil.baseLength(controls);

          this._tailWidthFactor = tailWidth / _baseLength;
        } else {
          tailWidth = baseLength * this._tailWidthFactor;
          controls = this.controls;
        }

        var headWidthFactor = neckWidth / baseLength;
        return new SplineComponent$1({
          controls: controls,
          headWidthFactor: headWidthFactor,
          tailWidthFactor: this._tailWidthFactor,
        });
      },
    },
    {
      key: "createTailComponent",
      value: function createTailComponent() {
        if (!this._bodyComponent) {
          return;
        } // const mid = Util.mid(this._head1, this._head2);

        var controls = this.controls;
        return new HalfSwallowTail({
          controls: controls,
          heightFactor: this._tailHeightFactor,
        });
      },
    },
  ]);

  return AttackArrow;
})(Arrow);

_defineProperty(AttackArrow, "MIN_CONTROL_COUNT", 2);

var DoubleArrow = /*#__PURE__*/ (function (_Arrow) {
  _inherits(DoubleArrow, _Arrow);

  var _super = _createSuper(DoubleArrow);

  function DoubleArrow(options) {
    var _this;

    _classCallCheck(this, DoubleArrow);

    options = defaultValue(options, {});
    options.neckHeightFactor = defaultValue(options.neckHeightFactor, 0.8);
    options.neckWidthFactor = defaultValue(options.neckWidthFactor, 0.2);
    options.headWidthFactor = defaultValue(options.headWidthFactor, 0.5);
    _this = _super.call(this, options);
    _this._nodes = [];

    _this.init();

    defineProperties(_assertThisInitialized(_this));

    _this.merge();

    return _this;
  }

  _createClass(DoubleArrow, [
    {
      key: "addControl",
      value: function addControl(control) {
        if (this.controls.length >= DoubleArrow.MAX_CONTROL_COUNT) {
          this.popControl();
        }

        this.controls.push(control);

        if (this.controls.length >= DoubleArrow.MIN_CONTROL_COUNT) {
          this.init();
          this.merge();
        }
      },
    },
    {
      key: "updateControl",
      value: function updateControl(index, control) {
        this.controls[index] = control;

        if (this.controls.length >= DoubleArrow.MIN_CONTROL_COUNT) {
          this.init();
          this.merge();
        }
      },
    },
    {
      key: "popControl",
      value: function popControl() {
        return this.controls.pop();
      },
    },
    {
      key: "init",
      value: function init() {
        if (this.controls.length < DoubleArrow.MIN_CONTROL_COUNT) {
          return;
        }

        this.getPoints();
      },
    },
    {
      key: "tempPoint4",
      value: function tempPoint4(p1, p2, p3) {
        var mid = PlotUtil.mid(p1, p2);
        var distance = PlotUtil.distance(mid, p3);
        var angle = PlotUtil.angleOfThreePoints(p1, mid, p3);
        var x, y;
        var rst;

        if (angle < Math.PI / 2);
        else if (angle < Math.PI && angle >= Math.PI / 2) {
          angle = Math.PI - angle;
        } else if (angle >= Math.PI && angle < Math.PI * 1.5) {
          angle = angle - Math.PI;
        } else if (angle >= Math.PI * 1.5) {
          angle = Math.PI * 2 - angle;
        }

        x = distance * Math.cos(angle);
        y = distance * Math.sin(angle);
        var tmp = PlotUtil.thirdPoint(p1, mid, Math.PI / 2, x, true);
        rst = PlotUtil.thirdPoint(mid, tmp, Math.PI / 2, y, false);
        return rst;
      },
    },
    {
      key: "getPoints",
      value: function getPoints() {
        var controls;
        var controls_ = this.controls;

        if (controls_ < 3) {
          return;
        }

        var tmp, connectPoint;

        if (controls_.length === 3) {
          tmp = this.tempPoint4.apply(this, _toConsumableArray(controls_));
        } else {
          tmp = controls_[3];
        }

        if (controls_.length <= 4) {
          connectPoint = PlotUtil.mid(controls_[0], controls_[1]);
        } else {
          connectPoint = controls_[4];
        }

        var head1, head2, bodyControls, radio;

        if (
          PlotUtil.isClockWise.apply(
            PlotUtil,
            _toConsumableArray(this.controls.slice(0, 3))
          )
        ) {
          var _bodyControls;

          controls = this.getArrowControls(
            controls_[0],
            connectPoint,
            tmp,
            true
          );
          head1 = new ArrowComponent({
            controls: controls,
            index: [2, 3],
            neckHeightFactor: this._neckHeightFactor,
            neckWidthFactor: this._neckWidthFactor,
            headWidthFactor: this._headWidthFactor,
          });
          radio =
            PlotUtil.distance(controls_[0], connectPoint) /
            PlotUtil.baseLength(controls) /
            2;
          bodyControls = this.getBodyControls(
            controls,
            head1.nodes[0],
            head1.nodes[4],
            radio
          );
          controls = this.getArrowControls(
            connectPoint,
            controls_[1],
            controls_[2],
            false
          );
          head2 = new ArrowComponent({
            controls: controls,
            index: [2, 3],
            neckHeightFactor: this._neckHeightFactor,
            neckWidthFactor: this._neckWidthFactor,
            headWidthFactor: this._headWidthFactor,
          });
          radio =
            PlotUtil.distance(connectPoint, controls_[1]) /
            PlotUtil.baseLength(controls) /
            2;

          (_bodyControls = bodyControls).unshift.apply(
            _bodyControls,
            _toConsumableArray(
              this.getBodyControls(
                controls,
                head2.nodes[0],
                head2.nodes[4],
                radio
              )
            )
          );

          var bodyPoints = this.geoBodyPoints(
            [head1, head2],
            bodyControls,
            connectPoint
          );
          this._nodes = [].concat(
            _toConsumableArray(bodyPoints[0]),
            _toConsumableArray(head1.nodes),
            _toConsumableArray(bodyPoints[1]),
            _toConsumableArray(head2.nodes),
            _toConsumableArray(bodyPoints[2])
          );
        } else {
          var _bodyControls2;

          controls = this.getArrowControls(
            controls_[0],
            connectPoint,
            tmp,
            false
          );
          head1 = new ArrowComponent({
            controls: controls,
            index: [2, 3],
            neckHeightFactor: this._neckHeightFactor,
            neckWidthFactor: this._neckWidthFactor,
            headWidthFactor: this._headWidthFactor,
          });
          radio =
            PlotUtil.distance(controls_[0], connectPoint) /
            PlotUtil.baseLength(controls) /
            2;
          bodyControls = this.getBodyControls(
            controls,
            head1.nodes[0],
            head1.nodes[4],
            radio
          );
          controls = this.getArrowControls(
            connectPoint,
            controls_[1],
            controls_[2],
            true
          );
          head2 = new ArrowComponent({
            controls: controls,
            index: [2, 3],
            neckHeightFactor: this._neckHeightFactor,
            neckWidthFactor: this._neckWidthFactor,
            headWidthFactor: this._headWidthFactor,
          });
          radio =
            PlotUtil.distance(connectPoint, controls_[1]) /
            PlotUtil.baseLength(controls) /
            2;

          (_bodyControls2 = bodyControls).unshift.apply(
            _bodyControls2,
            _toConsumableArray(
              this.getBodyControls(
                controls,
                head2.nodes[0],
                head2.nodes[4],
                radio
              )
            )
          );

          var _bodyPoints = this.geoBodyPoints(
            [head1, head2],
            bodyControls,
            connectPoint
          );

          this._nodes = [].concat(
            _toConsumableArray(_bodyPoints[0]),
            _toConsumableArray(head1.nodes),
            _toConsumableArray(_bodyPoints[1]),
            _toConsumableArray(head2.nodes),
            _toConsumableArray(_bodyPoints[2])
          );
        }
      },
    },
    {
      key: "getArrowControls",
      value: function getArrowControls(p1, p2, p3, inverse) {
        //t,o,e,r
        var mid = PlotUtil.mid(p1, p2);
        var distance = PlotUtil.distance(mid, p3);
        var neckControl = PlotUtil.thirdPoint(
          p3,
          mid,
          0,
          0.3 * distance,
          false
        );
        var headControl = PlotUtil.thirdPoint(
          p3,
          mid,
          0,
          0.5 * distance,
          false
        );
        neckControl = PlotUtil.thirdPoint(
          mid,
          neckControl,
          Math.PI / 2,
          distance / 5,
          inverse
        );
        headControl = PlotUtil.thirdPoint(
          mid,
          headControl,
          Math.PI / 2,
          distance / 4,
          inverse
        );
        return [mid, neckControl, headControl, p3];
      },
    },
    {
      key: "geoBodyPoints",
      value: function geoBodyPoints(head, body, connect) {
        var body1 = PlotUtil.BezierCurve([
          this.controls[1],
          body[0],
          body[1],
          head[1].nodes[4],
        ]);
        var body2 = PlotUtil.BezierCurve([
          this.controls[0],
          body[6],
          body[7],
          head[0].nodes[0],
        ]);
        var body3 = PlotUtil.BezierCurve([
          head[0].nodes[4],
          body[5],
          body[4],
          connect,
          body[3],
          body[2],
          head[1].nodes[0],
        ]);
        return [body2, body3, body1.reverse()];
      },
    },
    {
      key: "getBodyControls",
      value: function getBodyControls(
        points,
        neckControl1,
        neckControl2,
        radio
      ) {
        //t,o,e,r
        var length = PlotUtil.distance.apply(
          PlotUtil,
          _toConsumableArray(points)
        );
        var baseLength = PlotUtil.baseLength(points);
        var width = baseLength * radio;
        var neckWidth = PlotUtil.distance(neckControl1, neckControl2);
        var offset = (width - neckWidth) / 2;
        var dis = 0;
        var u = [],
          c = [];

        for (var i = 1; i < points.length - 1; i++) {
          var angle =
            PlotUtil.angleOfThreePoints(
              points[i],
              points[i - 1],
              points[i + 1]
            ) / 2;
          dis += PlotUtil.distance(points[i - 1], points[i]);
          var d = (width / 2 - (dis / length) * offset) / Math.sin(angle);
          u.push(
            PlotUtil.thirdPoint(
              points[i - 1],
              points[i],
              Math.PI - angle,
              d,
              false
            )
          );
          c.push(PlotUtil.thirdPoint(points[i - 1], points[i], angle, d, true));
        }

        return u.concat(c);
      },
    },
    {
      key: "merge",
      value: function merge() {
        var _this$polygon, _this$polyline;

        this.reset();

        (_this$polygon = this.polygon).push.apply(
          _this$polygon,
          _toConsumableArray(_toConsumableArray(this.nodes).flat())
        );

        (_this$polyline = this.polyline).push.apply(
          _this$polyline,
          _toConsumableArray(_toConsumableArray(this.nodes).flat())
        );
      },
    },
  ]);

  return DoubleArrow;
})(Arrow);

_defineProperty(DoubleArrow, "MIN_CONTROL_COUNT", 3);

_defineProperty(DoubleArrow, "MAX_CONTROL_COUNT", 5);

var ArrowType = {
  straightarrow: "straightarrow",
  attackarrow: "attackarrow",
  doublearrow: "doublearrow",
};

ArrowType.validate = function (type) {
  if (
    type === ArrowType.straightarrow ||
    type === ArrowType.attackarrow ||
    type === ArrowType.doublearrow
  ) {
    return true;
  }

  return false;
};

/**
 * 为了方便管理几何要素自定义的几何类型，它不符合OGC标准。
 * @exports PlotType
 * @enum {String}
 */
const PlotType = {
  /**
   * 点
   * @type {String}
   * @constant
   */
  POINT: "point",
  /**
   * 线
   * @type {String}
   * @constant
   */
  POLYLINE: "polyline",
  /**
   * 面
   * @type {String}
   * @constant
   */
  POLYGON: "polygon",
  /**
   * 模型
   * @type {String}
   * @constant
   */
  MODEL: "model",
  /**
   * label
   * @type {String}
   * @constant
   */
  LABEL: "label",
  /**
   * 箭头（特殊标绘）
   * @type {String}
   * @constant
   */
  STRAIGHTARROW: ArrowType.straightarrow,
  ATTACKARROW: ArrowType.attackarrow,
  DOUBLEARROW: ArrowType.doublearrow,
  /**
   * 广告牌(Marker)
   * @type {String}
   * @constant
   */
  BILLBOARD: "billboard",
  /**
   * 多点
   * @type {String}
   * @constant
   */
  MUTIPOINT: "mutipoint",
};
/**
 * 将类型转换为OGC标准类型
 * @param  {PlotType} type 要素类型
 * @return {String}     OGC要素类型
 */
PlotType.getOGCType = function (type) {
  const validate = PlotType.validate(type);
  if (!validate) {
    return "unknown";
  }
  let ogcName = "";
  switch (type) {
    case PlotType.POINT:
    case PlotType.LABEL:
    case PlotType.MODEL:
    case PlotType.BILLBOARD:
      ogcName = "Point";
      break;
    case PlotType.POLYLINE:
      ogcName = "LineString";
      break;
    case PlotType.STRAIGHTARROW:
    case PlotType.ATTACKARROW:
    case PlotType.DOUBLEARROW:
    case PlotType.POLYGON:
      ogcName = "Polygon";
      break;
    case PlotType.MUTIPOINT:
      ogcName = "MutlPoint";
  }
  return ogcName;
};
/**
 * 验证是否是合法类型
 * @param {CartometryType}
 * @returns {Number}
 */
PlotType.validate = function (type) {
  return (
    type === PlotType.POINT ||
    type === PlotType.POLYLINE ||
    type === PlotType.POLYGON ||
    type === PlotType.STRAIGHTARROW ||
    type === PlotType.ATTACKARROW ||
    type === PlotType.DOUBLEARROW ||
    type === PlotType.MODEL ||
    type === PlotType.LABEL ||
    type === PlotType.MUTIPOINT ||
    type === PlotType.BILLBOARD
  );
};
/**
 * 验证类型是否是一个点，这里的点指的是位置由一个点决定的图形
 * @param  {PlotType} type 图形类型
 * @return {Boolean}   true表示type表示一个点
 */
PlotType.isPoint = function (type) {
  return (
    type === PlotType.POINT ||
    type === PlotType.MODEL ||
    type === PlotType.LABEL ||
    type === PlotType.BILLBOARD
  );
};
/**
 * 判断一个类型是否是箭头图形
 * @param  {PlotType} type 图形类型
 * @return {Boolean}  true表示type表示一个箭头图形
 */
PlotType.isArrow = function (type) {
  return (
    type === PlotType.ATTACKARROW ||
    type === PlotType.STRAIGHTARROW ||
    type === PlotType.DOUBLEARROW
  );
};
var PlotType$1 = Object.freeze(PlotType);

/**
 * @exports clone
 * 生成一个对象的副本
 * @param  {Object} object 被克隆的对象
 * @param  {Bool} deep   是否深度遍历
 * @return {Object}   object的副本
 */
function clone(object, deep) {
  if (object === null || typeof object !== "object") {
    return object;
  }

  deep = defaultValue$1(deep, false);

  const result = new object.constructor();
  for (const propertyName in object) {
    if (object.hasOwnProperty(propertyName)) {
      let value = object[propertyName];
      if (deep) {
        value = clone(value, deep);
      }
      result[propertyName] = value;
    }
  }

  return result;
}

const cesiumScriptRegex = /((?:.*\/)|^)Cesium\.js(?:\?|#|$)/;

let a;
function tryMakeAbsolute(url) {
  if (typeof document === "undefined") {
    return url;
  }

  if (!defined(a)) {
    a = document.createElement("a");
  }
  a.href = url;

  a.href = a.href;
  return a.href;
}
let baseResource;
let implementation;

function getBaseUrlFromCesiumScript() {
  const scripts = document.getElementsByTagName("script");
  for (let i = 0, len = scripts.length; i < len; ++i) {
    const src = scripts[i].getAttribute("src");
    const result = cesiumScriptRegex.exec(src);
    if (result !== null) {
      return result[1];
    }
  }
  return undefined;
}

function buildModuleUrlFromRequireToUrl(moduleID) {
  // moduleID will be non-relative, so require it relative to this module, in Core.
  return tryMakeAbsolute(`../${moduleID}`);
}

function getCesiumProBaseUrl() {
  if (defined(baseResource)) {
    return baseResource;
  }

  let baseUrlString;
  if (typeof CESIUMPRO_BASE_URL != "undefined") {
    baseUrlString = CESIUMPRO_BASE_URL;
  } else if (
    typeof window.define === "object" &&
    defined(window.define.amd) &&
    !window.define.amd.toUrlUndefined
  ) {
    baseUrlString = Cesium.getAbsoluteUri("..", "core/Url.js");
  } else {
    baseUrlString = getBaseUrlFromCesiumScript();
  }
  // >>includeStart('debug');
  if (!defined(baseUrlString)) {
    throw new CesiumProError$1(
      "Unable to determine Cesium base URL automatically, try defining a global variable called CESIUMPRO_BASE_URL."
    );
  }
  // >>includeEnd('debug');
  if (!defined(baseUrlString)) {
    baseUrlString = "";
  }
  baseResource = new Cesium.Resource({
    url: tryMakeAbsolute(baseUrlString),
  });
  baseResource.appendForwardSlash();

  return baseResource;
}

function buildModuleUrlFromBaseUrl(moduleID) {
  const resource = getCesiumProBaseUrl().getDerivedResource({
    url: moduleID,
  });
  return resource.url;
}

function buildModuleUrl(relativeUrl) {
  if (!defined(implementation)) {
    // select implementation
    if (
      typeof window.define === "object" &&
      defined(window.define.amd) &&
      !window.define.amd.toUrlUndefined
    ) {
      implementation = buildModuleUrlFromRequireToUrl;
    } else {
      implementation = buildModuleUrlFromBaseUrl;
    }
  }

  const url = implementation(relativeUrl);
  return url;
}
/**
 * URL相关工具
 * @namespace Url
 *
 */
const Url = {};
/**
 * 从多个字符串拼接url,以/为分割符
 * @param  {...String} args
 * @return {String}      url
 *
 * @example
 *
 * URL.join("www.baidu.com/",'/tieba/','cesium')
 * //www.baidu.com/tieba/cesium
 */
Url.join = function (...args) {
  const formatArgs = [];
  for (let arg of args) {
    if (arg.startsWith("/")) {
      arg = arg.substring(1);
    }
    if (arg.endsWith("/")) {
      arg = arg.substring(0, arg.length - 1);
    }
    formatArgs.push(arg);
  }
  const urlstr = formatArgs.join("/");
  // if (!(urlstr.startsWith('http') || urlstr.startsWith('ftp'))) {
  //   urlstr = `http://${urlstr}`;
  // }
  return urlstr;
};

/**
 * 获取CesiumPro静态资源的完整路径
 * @param {String} path 指定文件
 * @returns {String} 完整的Url地址
 * @example
 * Url.buildModuleUrl('assets/tiles/{z}/{x}/{y}.png')
 */
Url.buildModuleUrl = function (path) {
  return buildModuleUrl(path);
};
Url.getCesiumProBaseUrl = getCesiumProBaseUrl;

class LonLat {
  /**
   * 用经纬度（度）和海拔（米）描述一个地理位置。
   * @param {Number} lon 经度，单位：度
   * @param {Number} lat 经度，单位：度
   * @param {Number} alt 海拔，单位：米
   */
  constructor(lon, lat, alt) {
    if (!defined(lon)) {
      throw new CesiumProError$1("longitude is required.");
    }
    if (!defined(lat)) {
      throw new CesiumProError$1("latitude is required.");
    }
    this.lon = lon;
    this.lat = lat;
    this.alt = defaultValue$1(alt, 0);
  }
  get height() {
    return this.alt;
  }
  /**
   * 转为屏幕坐标
   * @param {Cesium.Scene} scene
   * @returns {Cesium.Cartesian2} 屏幕坐标
   */
  toPixel(scene) {
    return LonLat.toPixel(this, scene);
  }
  /**
   * 转为笛卡尔坐标
   * @returns {Cesium.Cartesian3} 笛卡尔坐标
   */
  toCartesian() {
    return LonLat.toCartesian(this);
  }
  /**
   * 转为地理坐标
   * @returns {Cesium.Cartographic} 地理坐标
   */
  toCartographic() {
    return LonLat.toCartographic(this);
  }
  /**
   * 获得该点的弧度形式
   * @returns 弧度表示的点
   */
  getRadias() {
    return {
      lon: Cesium.Math.toRadians(this.lon),
      lat: Cesium.Math.toRadians(this.lat),
      alt,
    };
  }
  /**
   * 判断该点是否在场景内，且在球的正面
   * @returns {Boolean} 可见性
   */
  isVisible(viewer) {
    return LonLat.isVisible(this, viewer);
  }
  /**
   * 转为字符串
   * @returns 表示该点位置的字符串
   */
  toString() {
    return `{lon: ${this.lon}, lat: ${this.lat}, alt: ${this.alt}}`;
  }
  /**
   * 转为JSON对象
   * @returns 表示该点位置的对象
   */
  toJson() {
    return {
      lon: this.lon,
      lat: this.lat,
      alt: this.alt,
    };
  }
  /**
   * 从地理点坐标转换成数组
   * @returns 表示该点位置的数组
   */
  toArray() {
    return [this.lon, this.lat, this.alt];
  }
  /**
   * 判断一个点在当前场景是否可见。这里的可见指的是是否在屏幕范围内且在球的正面。
   * @param {LonLat} point 点
   * @param {Cesium.Viewer} viewer Viewer对象
   * @returns {Boolean} 可见性
   */
  static isVisible(point, viewer) {
    if (viewer instanceof Cesium.Viewer === false) {
      throw new CesiumProError$1("viewer不是一个有效的Cesium.Viewer对象");
    }
    if (!defined(point)) {
      return false;
    }
    const position = LonLat.toCartesian(point);
    if (!position) {
      return false;
    }
    if (viewer.scene.mode === Cesium.SceneMode.SCENE3D) {
      const visibility = new Cesium.EllipsoidalOccluder(
        Cesium.Ellipsoid.WGS84,
        viewer.camera.position
      ).isPointVisible(position);
      if (!visibility) {
        return false;
      }
      const windowPosition = LonLat.toPixel(point, viewer.scene);
      if (!defined(windowPosition)) {
        return false;
      }
      const width = viewer.canvas.width || viewer.canvas.clientWidth;
      const height = viewer.canvas.height || viewer.canvas.clientHeight;
      return (
        windowPosition.x > 0 &&
        windowPosition.x < width &&
        windowPosition.y > 0 &&
        windowPosition.y < height
      );
    } else if (viewer.scene.mode === Cesium.SceneMode.SCENE2D) {
      const frustum = viewer.scene.camera.frustum;
      const { positionWC, directionWC, upWC } = viewer.scene.camera;
      const cullingVolume = frustum.computeCullingVolume(
        positionWC,
        directionWC,
        upWC
      );
      const bounding = Cesium.BoundingSphere.projectTo2D(
        new BoundingSphere(position, 1)
      );
      const visibility = cullingVolume.computeVisibility(bounding);
      return (
        visibility === Cesium.Intersect.INSIDE ||
        visibility === Cesium.Intersect.INERSECTING
      );
    }
  }
  /**
   * 转屏幕坐标
   * @param {LonLat|Cesium.Cartesian3|Cesium.Cartographic} point
   * @param {Cesium.Scene} scene
   * @returns 对应的屏幕坐标
   */
  static toPixel(point, scene) {
    //>>includeStart('debug', pragmas.debug);
    if (!defined(scene)) {
      throw new CesiumProError$1("scene未定义。");
    }
    //>>includeEnd('debug', pragmas.debug);
    if (!defined(point)) {
      return undefined;
    }
    const cartesian = LonLat.toCartesian(point);
    if (!defined(cartesian)) {
      return undefined;
    }
    return Cesium.SceneTransforms.worldToWindowCoordinates(scene, cartesian);
  }
  /**
   * 转弧度坐标
   * @param {LonLat} point
   * @returns 用弧度表示的坐标点
   */
  static toCartographic(point, viewer) {
    //>>includeStart('debug', pragmas.debug);
    if (!defined(point)) {
      throw new CesiumProError$1("point is not defined.");
    }
    //>>includeEnd('debug', pragmas.debug);
    if (point instanceof LonLat) {
      return Cesium.Cartographic.fromDegrees(point.lon, point.lat, point.alt);
    } else if (point instanceof Cesium.Cartesian3) {
      return Cesium.Cartographic.fromCartesian(point);
    } else if (point instanceof Cesium.Cartographic) {
      return point;
    } else if (point instanceof Cesium.Cartesian2) {
      const cartesian = LonLat.toCartesian(point, viewer);
      return LonLat.toCartographic(cartesian);
    }
  }
  /**
   * 转笛卡尔坐标
   * @param {LonLat|Cesium.Cartesian3|Cesium.Cartographic|Cesium.Cartesian2} point
   * @param {Viewer} [viewer] viewer对象， 如果point是Cesium.Cartesian2类型，该参数需要被提供
   * @returns 用笛卡尔坐标表示的点
   */
  static toCartesian(point, viewer) {
    //>>includeStart('debug', pragmas.debug);
    if (!defined(point)) {
      return undefined;
    }
    //>>includeEnd('debug', pragmas.debug);
    if (point instanceof Cesium.Cartesian3) {
      return point;
    }
    if (point instanceof Cesium.Cartographic) {
      return Cesium.Cartographic.toCartesian(point);
    }
    if (point instanceof LonLat) {
      return Cesium.Cartesian3.fromDegrees(point.lon, point.lat, point.alt);
    }
    if (point instanceof Cesium.Cartesian2) {
      if (!viewer) {
        return;
      }
      const ray = viewer.scene.camera.getPickRay(point);
      return viewer.scene.globe.pick(ray, viewer.scene);
    }
  }
  /**
   * 从一个笛卡尔坐标创建点
   * @param {Cesium.Cartesian3} cartesian 笛卡尔坐标点
   * @returns GeoPoint点
   */
  static fromCartesian(cartesian) {
    //>>includeStart('debug', pragmas.debug);
    if (!defined(cartesian)) {
      return undefined;
    }
    //>>includeEnd('debug', pragmas.debug);
    const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
    if (!defined(cartographic)) {
      return undefined;
    }
    return LonLat.fromCartographic(cartographic);
  }
  /**
   * 从一个地理坐标点创建点
   * @param {Cesium.Cartographic} cartographic 地理坐标点
   * @returns GeoPoint点
   */
  static fromCartographic(cartographic) {
    //>>includeStart('debug', pragmas.debug);
    if (!defined(cartographic)) {
      throw new CesiumProError$1("cartographic is not defined.");
    }
    //>>includeEnd('debug', pragmas.debug);
    return new LonLat(
      Cesium.Math.toDegrees(cartographic.longitude),
      Cesium.Math.toDegrees(cartographic.latitude),
      cartographic.height
    );
  }
  /**
   * 从一个窗口坐标创建点
   * @param {Cesium.Cartesian2} pixel 窗口坐标
   * @param {Cesium.Viewer} viewer Viewer对象
   * @returns {LonLat} GeoPoint点
   */
  static fromPixel(pixel, viewer) {
    if (!viewer.scene.globe) {
      return undefined;
    }
    //>>includeStart('debug', pragmas.debug);
    if (!defined(pixel)) {
      throw new CesiumProError$1("pixel is not defined.");
    }
    if (viewer instanceof Cesium.Viewer === false) {
      throw new CesiumProError$1("viewer不是一个有效的Cesium.Viewer对象");
    }
    //>>includeEnd('debug', pragmas.debug);
    const ray = viewer.scene.camera.getPickRay(pixel);
    const cartesian = viewer.scene.globe.pick(ray, viewer.scene);
    if (!defined(cartesian)) {
      return undefined;
    }
    return LonLat.fromCartesian(cartesian);
  }
  /**
   * 从经纬度创建点
   * @param {Number} lon 经度(度)
   * @param {Number} lat 纬度(度)
   * @param {Number} height 海拔(米)
   * @returns {LonLat}
   */
  static fromDegrees(lon, lat, height) {
    return new LonLat(lon, lat, height);
  }
  /**
   * 获得一个经纬度数组
   * @param {*} positions
   * @returns {LonLat[]} 经纬度数组
   * @example
   * LonLat.fromDegreesArray([110, 30, 111, 31])
   */
  static fromDegreesArray(positions) {
    const ps = [];
    for (let i = 0, n = positions.length; i < n; i += 2) {
      ps.push(new LonLat(positions[i], positions[i + 1]));
    }
    return ps;
  }
  /**
   * 获得一个经纬度数组
   * @param {*} positions
   * @returns {LonLat[]} 经纬度数组
   * @example
   * LonLat.fromDegreesArrayHeights([110, 30,1000, 111, 31, 1000])
   */
  static fromDegreesArrayHeights(positions) {
    const ps = [];
    for (let i = 0, n = positions.length; i < n; i += 3) {
      ps.push(new LonLat(positions[i], positions[i + 1], positions[i + 2]));
    }
    return ps;
  }
  /**
   * 从经纬度创建点
   * @param {Number} lon 经度(弧度)
   * @param {Number} lat 纬度(弧度)
   * @param {Number} height 海拔(米)
   * @returns {LonLat}
   */
  static fromRadians(lon, lat, height) {
    return new LonLat(
      Cesium.Math.toDegrees(lon),
      Cesium.Math.toDegrees(lat),
      height
    );
  }
  /**
   * 判断一个点或经纬度是否在中国范围内（粗略）
   * @param  {LonLat|Number[]} args
   * @returns 如果在中国范围内，返回true
   */
  static inChina(...args) {
    if (args.length === 1) {
      const p = args[0];
      if (args[0] instanceof LonLat) {
        return LonLat.inChina(p.lon, p.lat);
      }
    } else {
      const lon = +args[0];
      const lat = +args[1];
      return lon > 73.66 && lon < 135.05 && lat > 3.86 && lat < 53.55;
    }
  }
  /**
   * 从经纬度数组创建点, 经纬度数组，经度在前，纬度在后
   * @param {Array} lonlat
   * @returns {LonLat}
   */
  static fromArray(lonlat) {
    return new LonLat(...lonlat);
  }
  /**
   * 从经纬度数组创建点, 经纬度数组，经度在前，纬度在后
   * @param {Object} lonlat
   * @returns {LonLat}
   */
  static fromJson(lonlat) {
    return new LonLat(lonlat.lon, lonlat.lat, lonlat.alt);
  }
  /**
   * 判断对象是不是一个有效的点
   * @param {any} v
   */
  static isValid(v) {
    if (v instanceof LonLat) {
      if (!defined(v.lon)) {
        return false;
      }
      if (!defined(v.lat)) {
        return false;
      }
      if (!defined(v.alt)) {
        return false;
      }
      return true;
    }
    if (v instanceof Cesium.Cartesian3) {
      if (!defined(v.x)) {
        return false;
      }
      if (!defined(v.y)) {
        return false;
      }
      if (!defined(v.z)) {
        return false;
      }
      return true;
    }
    return false;
  }
  // /**
  //  * 经纬度转CGCS2000平面坐标
  //  * @param {LonLat|Cesium.Cartesian3} position
  //  */
  // static toCGCS2000(position) {
  //     if (position instanceof Cesium.Cartesian3) {
  //         position = LonLat.fromCartesian(position);
  //     }
  //     if (position instanceof LonLat === false) {
  //         throw new CesiumProError(position + 'is invalid position.')
  //     }
  // }
}

class PointPlot extends BasePlot {
  /**
   * 点图形，泛指图形位置由一个点确定的图形，包括普通点、文字、模型、广告牌等
   * @extends BasePlot
   *
   * @param {Object} entityOptions 除以下属性外，同Cesium.PointGraphics
   * @param {Cartesian3} [entityOptions.position] 点的位置信息
   * @param {Object} [options={}]  具有以下属性
   * @param {PlotType} [options.type=PlotType.POINT] 标绘类型
   * @param {Object} [options.label] 描述一个label，为point、model、billboard创建一个label，
   * 如果options.type===PlotType.LABEL，该属性不会生效
   */
  constructor(entityOptions, options = {}) {
    entityOptions = defaultValue$1(entityOptions, {});
    super(entityOptions, options);
    this._entityOptions = entityOptions;
    this._options = options;
    this._positions = defaultValue$1(
      entityOptions.position,
      new Cesium.Cartesian3()
    );
    this._type = defaultValue$1(options.type, PlotType$1.POINT);
    this._entity = this.createEntity();
    this._text = defaultValue$1(entityOptions.text, "");
  }
  /**
   * 该图形的几何描述，包括类型，经纬度等
   * @return {Object}
   */
  getGeometry() {
    const cartographic = PointPlot.toDegrees(this.positions);
    const coordinates = [
      cartographic.lon,
      cartographic.lat,
      cartographic.height,
    ];
    const type = PlotType$1.getOGCType(this.type);
    return {
      type,
      coordinates,
    };
  }

  /**
   * @private
   */
  createEntity() {
    super.createEntity();
    delete this._entityOptions.position;
    const options = {
      id: this.id,
      position: this.positions,
    };
    if (this.type === PlotType$1.POINT) {
      options.point = clone(this._entityOptions);
    }
    if (this.type === PlotType$1.BILLBOARD) {
      options.billboard = clone(this._entityOptions);
      if (!defined(options.billboard.image)) {
        options.billboard.image = Url.buildModuleUrl("./assets/marker.png");
      }
    }
    if (this.type === PlotType$1.LABEL) {
      options.label = clone(this._entityOptions);
    }
    if (this.type === PlotType$1.MODEL) {
      options.orientation = this._entityOptions.orientation;
      delete this._entityOptions.orientation;
      options.model = clone(this._entityOptions);
      if (!defined(options.model.uri)) {
        options.model.uri = Url.buildModuleUrl("./assets/Wood_Tower.gltf");
      }
    }
    if (this._options.label && this._type !== PlotType$1.LABEL) {
      options.label = Cesium.clone(this._options.label);
    }
    this._entityOptions = options;
    return new Cesium.Entity(this._entityOptions);
  }

  /**
   * 比较两个点位置是否相同
   * @param  {PointPlot} point
   * @return {Bool}
   */
  equal(point) {
    return PointPlot.equal(this, point);
  }
  /**
   * 点的文字描述
   * @type {String}
   */
  get text() {
    return this._text;
  }
  set text(val) {
    if (this.entity.label) {
      this.entity.label.text = val;
    } else {
      const options = Cesium.clone(this._entityOptions);
      options.text = val;
      this.addLabel(options);
    }
    this._text = val;
  }

  /**
   * 添加文字
   * @param {Object} options 描述一个Cesium.LabelGraphics.
   */
  addLabel(options) {
    this.entity.label = options;
  }

  /**
   * 更新点样式
   * @param  {Object} style 描述一个Cesium.PointGraphics
   */
  updatePointStyle(style) {
    if (!style || !this.entity.point) {
      return;
    }
    for (const s in style) {
      if (style.hasOwnProperty(s)) {
        this.entity.point[s] = style[s];
      }
    }
  }

  /**
   * 更新文字样式
   * @param  {Object} style 描述一个Cesium.LabelGraphics
   */
  updateLabelStyle(style) {
    if (!style || !this.entity.label) {
      return;
    }
    for (const s in style) {
      if (style.hasOwnProperty(s)) {
        this.entity.label[s] = style[s];
      }
    }
  }

  /**
   * 更新模型样式
   * @param  {Object} style 描述一个Cesium.ModelGraphics
   */
  updateModelStyle(style) {
    if (!style || !this.entity.model) {
      return;
    }
    for (const s in style) {
      if (style.hasOwnProperty(s)) {
        this.entity.model[s] = style[s];
      }
    }
  }

  /**
   * 更新图标样式
   * @param  {Object} style 描述一个Cesium.BillboardGraphics
   */
  updateBillboardStyle(style) {
    if (!style || !this.entity.billboard) {
      return;
    }
    for (const s in style) {
      if (style.hasOwnProperty(s)) {
        this.entity.billboard[s] = style[s];
      }
    }
  }

  /**
   * 更新图形位置,如果在使用该函数前没有调用<code>startEdit()</code>，位置更新将不会立即生效,在下次调用<code>startEdit()</code>后，此操作将更新到图形。
   * @param  {Cesium.Cartesian3} position
   */
  updatePosition(position) {
    if (
      !position ||
      !Number.isFinite(position.x) ||
      !Number.isFinite(position.y) ||
      !Number.isFinite(position.z)
    ) {
      return;
    }
    this.positions.x = position.x;
    this.positions.y = position.y;
    this.positions.z = position.z;
    if (this.type === PlotType$1.MODEL && this.entity.model) {
      this.entity.model.show = true;
    }
  }

  /**
   * 比较两个点位置是否相同
   * @param  {PointPlot|Cesium.Cartesian3} left
   * @param  {PointPlot|Cesium.Cartesian3} right
   * @return {Bool}
   */
  static equal(left, right) {
    if (!defined(left) || !defined(right)) {
      return false;
    }
    if (left instanceof PointPlot) {
      left = left.positions;
    }
    if (right instanceof PointPlot) {
      right = right.positions;
    }
    return Cesium.Cartesian3.equals(left, right);
  }

  /**
   * 默认样式
   * @static
   * @type {Object}
   * @memberof PointPlot
   */
  static defaultStyle = {
    color: Cesium.Color.RED,
    pixelSize: 5,
    outlineColor: Cesium.Color.WHITE,
    outlineWidth: 3,
    heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
  };

  /**
   * 将Cartesian3坐标转换为经纬度
   * @param  {Cartesian3|PointPlot} point
   * @return {Object}  经纬度
   */
  static toDegrees(point) {
    if (point instanceof Cesium.Cartesian3) {
      return LonLat.fromCartesian(point);
    }
    if (point instanceof PointPlot) {
      return LonLat.fromCartesian(point.positions);
    }
  }
  /**
   * 将该要素导出成GeoJson
   * @return {String} GeoJson字符串
   */
  toGeoJson() {
    return PointPlot.toGeoJson(this);
  }

  /**
   * 将图形转为GeoJson
   * @param  {PointPlot} graphic
   * @return {Object}  graphic的geojson格式
   */
  static toGeoJson(graphic) {
    PlotType$1.getOGCType(graphic.type);
    const properties = graphic.properties ? graphic.properties.toJson() : {};
    properties.PlotType = graphic.type;
    const features = {
      type: "Feature",
      properties,
      geometry: graphic.getGeometry(),
    };
    return features;
  }

  /**
   * 利用GeoJson创建图形
   * @param  {String|Object} json   json对象或字符串
   * @param  {Object} style  图形样式
   * @return {PointPlot}
   */
  static fromGeoJson(json, style) {
    if (typeof json === "string") {
      json = JSON.parse(json);
    }
    if (!defined(json.geometry) || !defined(json.properties)) {
      return;
    }
    const type = json.properties.PlotType;
    if (type !== PlotType$1.POINT) {
      throw new CesiumProError("json没有包含一个有效的PointGraphic.");
    }
    const coordinate = json.geometry && json.geometry.coordinates;
    return PointPlot.fromCoordinates(coordinate, json.properties, style);
  }

  /**
   * 从坐标点生成点图形
   * @param  {Number[]} coordinate  包含经纬和纬度的数组
   * @param  {Style} [style=PointPlot.defaultStyle] 点样式
   * @return {PointPlot}
   */
  static fromCoordinates(
    coordinate,
    properties,
    style = PointPlot.defaultStyle
  ) {
    const position = Cesium.Cartesian3.fromDegrees(...coordinate);
    const options = {
      position,
      properties,
      ...style,
    };
    return new PointPlot(options);
  }

  /**
   * 默认点样式
   * @type {Object}
   * @static
   * @memberof PointPlot
   */
  static defaultPointStyle = PointPlot.defaultStyle;

  /**
   * 默认文字样式
   * @type {Object}
   * @static
   * @memberof PointPlot
   */
  static defaultLabelStyle = {
    font: "24px Helvetica",
    fillColor: Cesium.Color.WHITE,
    showBackground: true,
    style: Cesium.LabelStyle.FILL_AND_OUTLINE,
    scale: 1.0,
    heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
    verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
    pixelOffset: new Cesium.Cartesian2(0, 0),
    heightReference: Cesium.HeightReference.NONE,
    // outlineWidth: 1.0,
    // outlineColor: Cesium.Color.BLACK,
    // style: Cesium.LabelStyle.FILL_AND_OUTLINE,
  };

  /**
   * 默认图标样式
   * @type {Object}
   * @memberof PointPlot
   */
  static defaultBillboardStyle = {
    verticalOrigin: Cesium.VerticalOrigin.BASELINE,
    heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
  };

  /**
   * 模型样式
   * @static
   * @type {Object}
   * @memberof PointPlot
   */
  static defaultModelStyle = {
    colorBlendMode: Cesium.ColorBlendMode.HIGHLIGHT,
    color: Cesium.Color.WHITE,
    colorBlendAmount: 0.5,
    minimumPixelSize: 64,
  };
}

class PolylinePlot extends BasePlot {
  /**
   * 可编辑的线图形
   * @extends BasePlot
   * @param {Object} entityOptions 和Cesium.PolylineGraphics具有相同的属性
   * @param {Object} [options={}] 具有以下属性
   */
  constructor(entityOptions, options = {}) {
    super(entityOptions, options);
    this._entityOptions = defaultValue$1(entityOptions, {});
    this._positions = defaultValue$1(this._entityOptions.positions, []);
    this._nodePositions = this._positions;
    this._type = PlotType$1.POLYLINE;
    this._entity = this.createEntity();
  }

  /**
   * 该图形的几何描述，包括类型，经纬度等
   * @return {Object}
   */
  getGeometry() {
    const coordinates = [];
    const type = PlotType$1.getOGCType(this.type);

    for (const position of this.positions) {
      const lonlat = PointPlot.toDegrees(position);
      coordinates.push([lonlat.lon, lonlat.lat, lonlat.height]);
    }
    return {
      type,
      coordinates,
    };
  }

  /**
   * @private
   */
  createEntity() {
    super.createEntity();
    const options = {
      id: this.id,
      polyline: this._entityOptions,
    };
    this._entityOptions = options;
    return new Cesium.Entity(this._entityOptions);
  }

  /**
   * 将该要素导出成GeoJson
   * @return {String} GeoJson字符串
   */
  toGeoJson() {
    return PolylinePlot.toGeoJson(this);
  }

  /**
   * 开始编辑几何信息，此时图形的顶点可以被修改、删除、移动。
   * 属性信息的编辑不需要调用该方法。
   * @fires BasePlot#preEdit
   */
  startEdit() {
    super.startEdit();
  }

  /**
   * 几何要素编辑完成后调用该方法，以降低性能消耗。
   * <p style='font-weight:bold'>建议在图形编辑完成后调用该方法，因为CallbackProperty对资源消耗比较大，虽然对单个图形来说，不调用此方法可能并不会有任何影响。</p>
   * @fires BasePlot#postEdit
   */
  stopEdit() {
    super.stopEdit();
  }

  /**
   * 添加顶点,如果在使用该函数前没有调用<code>startEdit()</code>，位置更新将不会立即生效,在下次调用<code>startEdit()</code>后，此操作将更新到图形。
   * @param {Cartesian} node 新顶点
   * @param {Number} [index] 顶点位置,如果未定义顶点将被添加到最后
   */
  addNode(node, index) {
    const vertexNumber = this.positions.length;
    if (defined(index) && index < vertexNumber) {
      for (let i = vertexNumber; i > index; i--) {
        this.positions[i] = this.positions[i - 1];
      }
      this.positions[index] = node;
    } else {
      this.positions.push(node);
    }
  }

  /**
   * 删除一个顶点,如果在使用该函数前没有调用<code>startEdit()</code>，位置更新将不会立即生效,在下次调用<code>startEdit()</code>后，此操作将更新到图形。
   * @param  {Number} index 顶点编号
   */
  removeNode(index) {
    if (!defined(index)) {
      return;
    }
    if (index < 0 || index >= this.positions.length) {
      return;
    }
    this.positions.splice(index, 1);
  }
  /**
   * 删除最后一个顶点
   */
  popNode() {
    const index = this.positions.length - 1;
    this.removeNode(index);
  }

  /**
   * 更新一个顶点,如果在使用该函数前没有调用<code>startEdit()</code>，位置更新将不会立即生效,在下次调用<code>startEdit()</code>后，此操作将更新到图形。
   * @param  {Number} index 顶点编号
   * @param  {Cartesian} node  将要更新的位置
   */
  updateNode(index, node) {
    if (index >= this.positions.length) {
      return;
    }
    this.positions[index] = node;
  }

  updateStyle(style) {
    if (!style || !this.entity.model) {
      return;
    }
    for (const s in style) {
      if (style.hasOwnProperty(s)) {
        this.entity.polyline[s] = style[s];
      }
    }
  }

  /**
   * 将图形转为GeoJson
   * @param  {PolylinePlot} graphic
   * @return {Object}  graphic的geojson格式
   */
  static toGeoJson(graphic) {
    PlotType$1.getOGCType(graphic.type);
    const properties = graphic.properties ? graphic.properties.toJson() : {};
    properties.PlotType = graphic.type;
    const features = {
      type: "Feature",
      properties,
      geometry: graphic.getGeometry(),
    };
    return features;
  }

  /**
   * 利用GeoJson创建图形
   * @param  {String|Object} json   json对象或字符串
   * @param  {Object} style  图形样式
   * @return {PolylinePlot}
   */
  static fromGeoJson(json, style) {
    if (typeof json === "string") {
      json = JSON.parse(json);
    }
    if (!defined(json.geometry) || !defined(json.properties)) {
      return;
    }
    const type = json.properties.PlotType;
    if (type !== PlotType$1.POLYLINE) {
      throw new CesiumProError("json没有包含一个有效的PolylineGraphic.");
    }
    const coordinate = json.geometry && json.geometry.coordinates;
    return PolylinePlot.fromCoordinates(coordinate, json.properties, style);
  }

  /**
   * 从坐标点生成点图形
   * @param  {Number[]} coordinate  包含经纬和纬度的数组
   * @param  {Style} [style=PointPlot.defaultStyle] 点样式
   * @return {PolylinePlot}
   */
  static fromCoordinates(
    coordinates,
    properties,
    style = PolylinePlot.defaultStyle
  ) {
    const positions = Cesium.Cartesian3.fromDegreesArray(coordinates.flat());

    const options = {
      positions,
      properties,
      ...style,
    };
    return new PolylinePlot(options);
  }

  /**
   * 默认样式
   * @type {Object}
   * @static
   * @memberof PolylinePlot
   */
  static defaultStyle = {
    clampToGround: true,
    material: Cesium.Color.fromCssColorString("rgba(247,224,32,1)"),
    width: 3,
  };

  static highlightStyle = {
    clampToGround: true,
    material: Cesium.Color.AQUA,
    width: 3,
  };
}

class PolygonPlot extends BasePlot {
  /**
   * 可编辑的多边形
   * @extends BasePlot
   * @param {Object} entityOptions 和Cesium.PolygonGraphics具有相同的属性
   * @param {Object} [options={}] 具有以下属性
   */
  constructor(entityOptions, options = {}) {
    super(entityOptions, options);
    this._entityOptions = entityOptions;
    this._positions = defaultValue$1(entityOptions.positions, []);
    this._nodePositions = [...this.positions];
    if (this._nodePositions.length) {
      this._nodePositions[this._nodePositions.length] = this._nodePositions[0];
    }
    this._type = PlotType$1.POLYGON;
    this._entity = this.createEntity();
  }

  /**
   * 该图形的几何描述，包括类型，经纬度等
   * @return {Object}
   */
  getGeometry() {
    return PolygonPlot.getGeometry(this);
  }
  /**
   * 获得图形的几何描述，包括类型，经纬度等
   * @return {Object}
   */
  static getGeometry(graphic) {
    const coordinates = [];
    const type = PlotType$1.getOGCType(graphic.type);

    for (const position of graphic.positions) {
      const lonlat = PointPlot.toDegrees(position);
      coordinates.push([lonlat.lon, lonlat.lat, lonlat.height]);
    }
    coordinates.push(coordinates[0]);
    return {
      type,
      coordinates: [coordinates],
    };
  }

  /**
   * @private
   */
  createEntity() {
    super.createEntity();
    delete this._entityOptions.positions;
    const options = {
      id: this.id,
      polygon: {
        hierarchy: this.positions,
        ...this._entityOptions,
      },
    };
    if (this._entityOptions.outline) {
      options.polyline = {
        positions: this._nodePositions,
        material: this._entityOptions.outlineColor,
        width: this._entityOptions.outlineWidth,
      };
      options.polygon.outline = false;
      options.polyline.clampToGround =
        this._entityOptions.heightReference ===
        Cesium.HeightReference.CLAMP_TO_GROUND;
    }
    this._entityOptions = options;
    return new Cesium.Entity(this._entityOptions);
  }

  /**
   * 将该要素导出成GeoJson
   * @return {String} GeoJson字符串
   */
  toGeoJson() {
    return PolygonPlot.toGeoJson(this);
  }

  /**
   * 开始编辑几何信息，此时图形的顶点可以被修改、删除、移动。
   * 属性信息的编辑不需要调用该方法。
   * @fires BasePlot#preEdit
   */
  startEdit() {
    super.startEdit();
  }

  /**
   * @fires BasePlot#postEdit
   * 几何要素编辑完成后调用该方法，以降低性能消耗。
   * <p style='font-weight:bold'>建议在图形编辑完成后调用该方法，因为CallbackProperty
   * 对资源消耗比较大，虽然对单个图形来说，不调用此方法可能并不会有任何影响。</p>
   */
  stopEdit() {
    super.stopEdit();
  }

  /**
   * 添加顶点,如果在使用该函数前没有调用<code>startEdit()</code>，位置更新将不会立即生效,在下次调用<code>startEdit()</code>后，此操作将更新到图形。
   * @param {Cartesian} node 新顶点
   * @param {Number} [index] 如果index未定义，顶点将被添加到最后
   */
  addNode(node, index) {
    const vertexNumber = this.positions.length;
    if (defined(index) && index < vertexNumber && index >= 0) {
      for (let i = vertexNumber; i > index; i--) {
        this.positions[i] = this.positions[i - 1];
        this._nodePositions[i] = this._nodePositions[i - 1];
      }
      this.positions[index] = node;
      this._nodePositions[index] = node;
    } else {
      index = vertexNumber;
      this.positions.push(node);
      this._nodePositions[index] = node;
    }
    if (this._positions.length) {
      this._nodePositions[vertexNumber + 1] = this._nodePositions[0];
    }
  }
  /**
   * 删除一个顶点,如果在使用该函数前没有调用<code>startEdit()</code>，位置更新将不会立即生效,在下次调用<code>startEdit()</code>后，此操作将更新到图形。
   * @param  {Number} index 顶点编号
   */
  removeNode(index) {
    if (!defined(index)) {
      return;
    }
    if (index < 0 || index >= this.positions.length) {
      return;
    }
    this.positions.splice(index, 1);
    this._nodePositions.splice(index, 1);
    const nodeCount = this.positions.length;
    if (index === 0) {
      this._nodePositions[nodeCount] = this._nodePositions[0];
    }
  }

  /**
   * 删除最后一个顶点
   */
  popNode() {
    const index = this.positions.length - 1;
    this.removeNode(index);
  }

  /**
   * 更新一个顶点,如果在使用该函数前没有调用<code>startEdit()</code>，位置更新将不会立即生效,在下次调用<code>startEdit()</code>后，此操作将更新到图形。
   * @param  {Number} index 顶点编号
   * @param  {Cartesian} node  将要更新的位置
   */
  updateNode(index, node) {
    if (index >= this.positions.length) {
      return;
    }
    this.positions[index] = node;
    const nodeCount = this.positions.length;
    this._nodePositions[index] = node;
    if (index === 0) {
      this._nodePositions[nodeCount] = node;
    }
  }

  /**
   * 更新模型样式
   * @param  {Object} style 描述一个Cesium.ModelGraphics
   */
  updateStyle(style) {
    if (!style || !this.entity.model) {
      return;
    }
    for (const s in style) {
      if (style.hasOwnProperty(s)) {
        if (s === "outline" && !style.outline && this.entity.polyline) {
          this.entity.polyline = undefined;
        }
        if (s === "outlineColor" && this.entity.polyline) {
          this.entity.polyline.material = style[s];
        }
        if (s === "outlineWidth" && this.entity.polyline) {
          this.entity.polyline.width = style[s];
        }
        this.entity.polygon[s] = style[s];
      }
    }
  }

  /**
   * 将图形转为GeoJson
   * @param  {PolygonPlot} graphic
   * @return {Object}  graphic的geojson格式
   */
  static toGeoJson(graphic) {
    PlotType$1.getOGCType(graphic.type);
    const properties = graphic.properties ? graphic.properties.toJson() : {};
    properties.PlotType = graphic.type;
    const features = {
      type: "Feature",
      properties,
      geometry: graphic.getGeometry(),
    };
    return features;
  }

  /**
   * 利用GeoJson创建图形
   * @param  {String|Object} json   json对象或字符串
   * @param  {Object} style  图形样式
   * @return {PolygonPlot}
   */
  static fromGeoJson(json, style) {
    if (typeof json === "string") {
      json = JSON.parse(json);
    }
    if (!defined(json.geometry) || !defined(json.properties)) {
      return;
    }
    const type = json.properties.PlotType;
    if (type !== PlotType$1.POLYGON) {
      throw new CesiumProError$1("json没有包含一个有效的PolygonGraphic.");
    }
    const coordinate = json.geometry && json.geometry.coordinates;
    return PolygonPlot.fromCoordinates(coordinate, json.properties, style);
  }

  /**
   * 从坐标点生成点图形
   * @param  {Number[]} coordinate  包含经纬和纬度的数组
   * @param  {Style} [style=PointPlot.defaultStyle] 点样式
   * @return {PolygonPlot}
   */
  static fromCoordinates(
    coordinates,
    properties,
    style = PolygonPlot.defaultStyle
  ) {
    const positions = Cesium.Cartesian3.fromDegreesArray(coordinates[0].flat());

    const options = {
      positions,
      properties,
      ...style,
    };
    return new PolygonPlot(options);
  }
  /**
   * 默认样式
   * @type {Object}
   * @static
   * @memberof PolygonPlot
   */
  static defaultStyle = {
    material: Cesium.Color.fromCssColorString("rgba(247,224,32,0.5)"),
    outlineColor: Cesium.Color.RED,
    outlineWidth: 2,
    outline: false,
    perPositionHeight: false,
    heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
  };

  static highlightStyle = {
    material: new Cesium.ColorMaterialProperty(
      Cesium.Color.AQUA.withAlpha(0.4)
    ),
    outlineColor: Cesium.Color.AQUA.withAlpha(0.4),
  };

  /**
   * 从一系列点中获取几何中心位置
   * @param  {Cesium.Cartesian3[]} points 点集
   * @return {Cesium.Cartesian3}    以points为顶点的多边形的几何中心
   */
  static centerFromPonits(points) {
    const boundingSphere = Cesium.BoundingSphere.fromPoints(points);
    if (boundingSphere) {
      return boundingSphere.center;
    }
    return undefined;
  }
  /**
   * 从Entity或Primitive获得多边形中心
   * @param  {Entity|Primitive} polygon 多边形
   * @return {Cartesian3}         多边形几何中心
   */
  static center(polygon) {
    let points = [];

    function getHierarchy(hierarchy) {
      if (hierarchy.getValue) {
        const hierarchyValue = hierarchy.getValue();
        if (hierarchyValue instanceof Cesium.PolygonHierarchy) {
          points = hierarchyValue.positions;
        } else {
          points = hierarchyValue;
        }
      } else if (Array.isArray(hierarchy)) {
        points = hierarchy;
      }
    }
    if (polygon instanceof Cesium.Entity) {
      const { hierarchy } = polygon.polygon;
      getHierarchy(hierarchy);
    } else if (polygon.polygonHierarchy) {
      points = polygon.polygonHierarchy.positions;
    } else if (polygon.hierarchy) {
      getHierarchy(polygon.hierarchy);
    }
    return PolygonPlot.centerFromPonits(points);
  }
  /**
   * 判断多边形顶点是否为顺时针，如果多边形是有洞，只需传外边界
   * @param  {Cartesian3[]}  points 多边形顶点坐标
   * @param  {Viewer}  viewer Viewer对象
   * @return {Boolean}        true 表示该顶点顺序为顺时针，否则为逆时针
   * @example
   * const entity = viewer.entities.add({
   *   polygon: {
   *     hierarchy: new Cesium.PolygonHierarchy(
   *       Cesium.Cartesian3.fromDegreesArray([110, 30, 113, 30, 113, 33, 110, 33]),
   *       [new Cesium.PolygonHierarchy(Cesium.Cartesian3.fromDegreesArray([111, 31, 111, 32, 112, 32, 112, 31]))]
   *     ),
   *     material: Cesium.Color.RED
   *   }
   * })
   *
   * PolygonPlot.isClockWise(entity.polygon.hierarchy.getValue().positions)
   */
  static isClockWise(points, viewer) {
    const tangentPlane = Cesium.EllipsoidTangentPlane.fromPoints(
      points,
      viewer.scene.globe.ellipsoid
    );
    const formatPoints = Cesium.arrayRemoveDuplicates(
      points,
      Cesium.Cartesian3.equalsEpsilon,
      true
    );
    const projectPointsTo2D =
      tangentPlane.projectPointsOntoPlane.bind(tangentPlane);
    const positions2D = projectPointsTo2D(formatPoints);
    const originalWindingOrder =
      Cesium.PolygonPipeline.computeWindingOrder2D(positions2D);
    return originalWindingOrder === Cesium.WebGLConstants.CW;
  }
}

class NodePlot {
  /**
   * 用于创建线面图形的顶点图形
   * @param {Object} entityOptions 描述一个点图形,和Cesium.PointGraphic具有相同的参数
   */
  constructor(entityOptions) {
    this._type = PlotType$1.MUTIPOINT;
    this._positions = defaultValue$1(entityOptions.positions, []);
    this._entityOptions = entityOptions;
    this._values = [];
    this.createEntity();

    this._activeNode = undefined;
    /**
     * 当前处于激活状态的顶点的索引
     * @type {Number}
     */
    this.activeIndex = undefined;
  }
  /**
   * 当前处于激活状态的顶点
   * @type {Entity}
   */
  get activeNode() {
    return this._activeNode;
  }
  set activeNode(val) {
    this._activeNode = val;
    this.activeIndex = this.getIndexByPosition(val);
    this.highlightActiveNode();
  }
  /**
   * 高亮显示处于激活状态的顶点
   * @private
   */
  highlightActiveNode() {
    const values = this._values.filter((_) => defined(_.position));
    for (let i = 0, length = values.length; i < length; i++) {
      const v = values[i];
      if (i === this.activeIndex) {
        NodePlot.highlightNode(v);
      } else {
        v.point.color = this._entityOptions.color;
        v.point.outlineColor = this._entityOptions.outlineColor;
      }
    }
  }
  /**
   * 顶点图形的几何信息
   * @return {Object}
   */
  getGeometry() {
    const coordinates = [];
    const type = PlotType$1.getOGCType(this.type);
    for (const position of this.positions) {
      const cartographic = PointPlot.toDegrees(position);
      coordinates.push([
        cartographic.lon,
        cartographic.lat,
        cartographic.height,
      ]);
    }
    return {
      type,
      coordinates,
    };
  }
  /**
   * 高亮显示一个顶点
   * @param  {Entity} node 顶点实体
   */
  static highlightNode(node) {
    if (node && node.point) {
      node.point.color = Cesium.Color.AQUA;
      node.point.outlineColor = Cesium.Color.AQUA;
    }
  }
  /**
   * 返回指定索引的顶点
   * @param  {Number} index 顶点序号
   * @return {Entity} index对应的顶点实体
   */
  get(index) {
    const values = this._values.filter((_) => defined(_.position));
    return values[index];
  }
  /**
   * 返回指定位置的顶点索引
   * @param  {Cesium.Cartesian3} position 顶点位置
   * @return {Number} 返回位置和position相同的顶点的序号,如果存在多个，返回第一个匹配到的顶点
   */
  getIndexByPosition(position) {
    for (let i = 0, length = this._positions.length; i < length; i++) {
      const p = this._positions[i];
      const equal = PointPlot.equal(p, position);
      if (equal) {
        return i;
      }
    }
    return -1;
  }
  /**
   * 是否包含给定的顶点
   * @param  {Entity}  node 顶点实体
   * @return {Boolean} true表示该顶点集合中包含给定顶点
   */
  has(node) {
    return this._values.includes(node);
  }

  /**
   * @private
   */
  createEntity() {
    delete this._entityOptions.positions;
    const options = this._entityOptions;
    const count = this._positions.length;
    for (let i = 0; i < count; i++) {
      const entity = new Cesium.Entity({
        position: new Cesium.CallbackProperty(() => this._positions[i], false),
        point: options,
      });
      this._values.push(entity);
    }
  }

  /**
   * 添加一个顶点
   * @param {Cartesian3} node 顶点坐标
   */
  addNode(node, index) {
    const options = this._entityOptions;
    if (this._values.length < this._positions.length) {
      const entity = new Cesium.Entity({
        position: new Cesium.CallbackProperty(
          () => this._positions[this._positions.length - 1],
          false
        ),
        point: options,
      });
      return entity;
    }
    return undefined;
  }

  /**
   * 删除指定索引的顶点
   * @param  {Number} index 顶点序号
   * @return {Entity}    被删除的顶点
   */
  removeNode(index) {
    if (!defined(index)) {
      return;
    }
    // const node = this._values[index];
    // this._values.splice(index, 1);
    // this._positions.splice(index, 1);
    // return node;
  }
  /**
   * 删除最后一个顶点
   * @return {Entity};
   */
  popNode() {
    const index = this._positions.length - 1;
    const node = this.removeNode(index);
    return node;
  }

  /**
   * 更新顶点位置
   * @param  {Number} index 需要更新的顶点序号
   * @param  {Cartesian3} node  新的顶点位置
   */
  updateNode(index, node) {
    if (index >= this._positions.length) {
      return;
    }
    this._positions[index] = node;
  }

  /**
   * 销毁对象
   */
  destroy() {
    this._values = undefined;
  }

  /**
   * 将当前图形转为GeoJson
   * @return {Object} 该图形的GeoJson格式
   */
  toGeoJson() {
    return NodePlot.toGeoJson(this);
  }
  /**
   * 保存所有顶点实体的数组
   * @type {Entity[]}
   */
  get values() {
    return this._values;
  }

  /**
   * 将图形对象转为GeoJson
   * @param  {NodePlot} NodePlot [description]
   * @return {Object}      nodeGraphic的GeoJson格式
   */
  static toGeoJson(NodePlot) {
    PlotType$1.getOGCType(graphic.type);
    const properties = graphic.properties ? graphic.properties.toJson() : {};
    properties.PlotType = graphic.type;
    const features = {
      type: "Feature",
      properties,
      geometry: graphic.getGeometry(),
    };
    return features;
  }

  /**
   * 默认样式
   * @type {Object}
   */
  static defaultStyle = PointPlot.defaultStyle;
}

class ArrowPlot extends BasePlot {
  constructor(entityOptions, options = {}) {
    super(entityOptions, options);
    this._type = defaultValue$1(options.type, PlotType$1.STRAIGHTARROW);
    this._entityOptions = entityOptions;
    this._positions = defaultValue$1(entityOptions.positions, []);
    this._arrowType = defaultValue$1(options.type, PlotType$1.STRAIGHTARROW);
    if (!ArrowType.validate(this._arrowType)) {
      throw new CesiumProError$1("无效的箭头图形.");
    }
    const positions = [];
    for (let p of this.positions) {
      const ll = PointPlot.toDegrees(p);
      positions.push([ll.lon, ll.lat]);
    }
    if (this._arrowType === ArrowType.straightarrow) {
      this._arrow = new StraightArrow({
        controls: positions,
      });
    }
    if (this._arrowType === ArrowType.attackarrow) {
      this._arrow = new AttackArrow({
        controls: positions,
      });
    }
    if (this._arrowType === ArrowType.doublearrow) {
      this._arrow = new DoubleArrow({
        controls: positions,
      });
    }
    this._entity = this.createEntity();
    this._nodePositions = this._positions;
  }
  /**
   * 箭头图形
   * @return {StraightArrow|AttackArrow|DoubleArrow}
   */
  get arrow() {
    return this._arrow;
  }
  /**
   * 该图形的几何描述，包括类型，经纬度等
   * @return {Object}
   */
  getGeometry() {
    PolygonPlot.getGeometry(this);
  }
  createEntity() {
    super.createEntity();
    delete this._entityOptions.positions;

    const options = {
      id: this.id,
      polygon: {
        hierarchy: this._arrow.polygon.length
          ? Cesium.Cartesian3.fromDegreesArray(this._arrow.polygon)
          : this._arrow.polygon,
        ...this._entityOptions,
      },
    };
    if (this._entityOptions.outline) {
      options.polyline = {
        positions: this._arrow.polyline.length
          ? Cesium.Cartesian3.fromDegreesArray(this._arrow.polyline)
          : this._arrow.polyline,
        material: this._entityOptions.outlineColor,
        width: this._entityOptions.outlineWidth,
      };
      options.polygon.outline = false;
    }
    this._entityOptions = options;
    return new Cesium.Entity(this._entityOptions);
  }

  /**
   * 对图形几何编辑前调用
   */
  startEdit() {
    //pass
    //ArrwoGraphic用updateEntity来更新图形，不需要实现startEdit和stopEdit
  }
  /**
   * 图形几何信息编辑完成后调用
   */
  stopEdit() {
    //pass
  }

  /**
   * 添加顶。
   * @param {Cartesian} node 新顶点
   */
  addNode(node) {
    if (this.arrow) {
      const ll = PointPlot.toDegrees(node);
      this.arrow.addControl([ll.lon, ll.lat]);
      this.updatePositions();
      this.updateEntity();
      this.lastLon = ll.lon;
    }
  }
  /**
   * 删除最后一个顶点
   */
  popNode() {
    if (this.arrow) {
      this.arrow.popControl();
      this.updatePositions();
      this.updateEntity();
    }
  }
  /**
   * 更新一个顶点
   * @param  {Number} index 顶点编号
   * @param  {Cartesian} node  将要更新的位置
   */
  updateNode(index, node) {
    if (this.arrow) {
      const ll = PointPlot.toDegrees(node);
      this.arrow.updateControl(index, [ll.lon, ll.lat]);
      this.updatePositions();
      this.updateEntity();
    }
  }

  /**
   * @private
   */
  updatePositions() {
    if (!defined(this.arrow)) {
      return;
    }
    const controls = this.arrow.controls;
    for (let i = 0; i < controls.length; i++) {
      this.positions[i] = Cesium.Cartesian3.fromDegrees(
        controls[i][0],
        controls[i][1]
      );
    }
    if (this.positions.length > controls.length) {
      this.positions.splice(controls.length);
    }
  }

  /**
   * @private
   */
  updateEntity() {
    if (this.entity && this.entity.polygon) {
      // 未知bug，会出现很多NAN
      const polygonPositions = this.arrow.polygon.filter((_) => !isNaN(_));
      const polylinePositions = this.arrow.polyline.filter((_) => !isNaN(_));
      this.entity.polygon.hierarchy = polygonPositions.length
        ? Cesium.Cartesian3.fromDegreesArray(polygonPositions)
        : polygonPositions;
      if (this.entity.polyline) {
        this.entity.polyline.positions = polylinePositions.length
          ? Cesium.Cartesian3.fromDegreesArray([
              ...polylinePositions,
              polylinePositions[0],
              polylinePositions[1],
            ])
          : polylinePositions;
      }
    }
  }
}

/**
 * 坐标拾取函数,如果pixel所在位置有Primitive或Entity，将获取Primitive或Entity上的位置，否则获取球面坐标。
 * 简言之,如果点击在模型上将获得模型上的坐标，否则获取球面坐标。
 * <p><span style="font-weight:bold">Note:</span>获取模型上的坐标时需要打开地形深度调整，否则获取的点位不准。</p>
 *
 * @exports pickPosition
 * @see depthTest
 * @param  {Cesium.Cartesian3} pixel 屏幕坐标
 * @param {Cesium.Viewer} viewer Viewer对象
 * @param {Boolean} [modelPosition=true] 如果为true，当点击到模型后会返回模型坐标，否则返回地面坐标
 * @return {Cesium.Cartesian3}       笛卡尔坐标
 */
function pickPosition(pixel, viewer, modelPosition = true) {
  let cartesian;
  viewer.scene.globe.ellipsoid;
  // cartesian = viewer.camera.pickEllipsoid(pixel, elliposid);
  const ray = viewer.camera.getPickRay(pixel);
  cartesian = viewer.scene.globe.pick(ray, viewer.scene);
  const feat = viewer.scene.pick(pixel);
  if (feat && viewer.scene.globe.depthTestAgainstTerrain) {
    if (viewer.scene.pickPositionSupported) {
      cartesian = viewer.scene.pickPosition(pixel) || cartesian;
    } else {
      console.warn("This browser does not support pickPosition.");
    }
  }
  return cartesian;
}

/**
 * 启用/禁止地球旋转
 * @exports rotateEnabled
 * @param  {Cesium.Viewer}  viewer  Viewer对象
 * @param  {Boolean} [val=true] true表示允旋转
 */
function rotateEnabled(viewer, val = true) {
  checkViewer(viewer);
  viewer.scene.screenSpaceCameraController.enableRotate = val;
}

class ContextMenu {
  /**
   * 右键菜单
   * @param {Cesium.Viewer} viewer  Viewer对象
   * @param {Object} options 具有以下属性
   * @param {ContextMenuItem[]} [options.items] 菜单项
   * @param {Cesium.Cartesian3} options.position 菜单显示的位置
   */
  constructor(viewer, options) {
    checkViewer(viewer);
    this._viewer = viewer;
    options = defaultValue$1(options, {});
    const items = defaultValue$1(options.items, []);
    this._items = new Cesium.AssociativeArray();
    this._position = options.position;

    this._container = defaultValue$1(options.container, viewer.container);
    this._root = this.createMenu();
    this.createItems(items);
    this._show = true;
    this._activeSubMenu = undefined;
    this.parent = options.parent;
  }

  /**
   * 菜单可见性
   * @type {Boolean}
   */
  get show() {
    return this._show;
  }
  set show(val) {
    this._show = val;
    this._root.style.display = val ? "block" : "none";
    this._menu.style.display = val ? "block" : "none";
  }
  /**
   * 菜单位置
   * @type {Cesium.Cartesian2}
   */
  get position() {
    return this._position;
  }
  set position(val) {
    this._position = val;
    if (this._root) {
      const pixel = LonLat.toPixel(this._position, this._viewer.scene);
      this._root.style.left = pixel.x + "px";
      this._root.style.top = pixel.y + "px";
    }
  }
  /**
   * 返回指定序号的菜单项
   * @param  {Number} index 菜单序号
   * @return {Object} 菜单项
   */
  get(index) {
    return this._items.values[index];
  }
  /**
   * 返回指定id的菜单项
   * @param  {Number} id 菜单项id
   * @return {Object} 菜单项
   */
  getById(id) {
    return this._items.get(id);
  }
  /**
   * 添加一个菜单项
   * @param {Object} item 具有以下属性
   * @param {String} item.text 菜单项要显示的文字
   * @param {any} [item.id] 菜单项id;
   * @param {String} [item.class] 菜单项类名，支持bootstrap css类
   */
  add(item) {
    if (this._items.contains(item.id)) {
      return;
    }
    const contextItem = this.createItem(item);
    this._items.set(contextItem.id, contextItem);
    this._menu.appendChild(contextItem.el);
  }
  /**
   * 删除菜单项
   * @param  {Object} item 需要被删除的菜单项
   * @return {Boolean}   是否删除成功
   *
   * @example
   * const item=contextMenu.get(0);
   * contextMenu.remove(item);
   */
  remove(item) {
    const ele = item.el;
    try {
      this._root.removeChild(ele);
      this._items.remove(item.id);
      return true;
    } catch (e) {
      return false;
    }
  }
  /**
   * 删除所有菜单项
   */
  removeAll() {
    for (let item of this._items.values) {
      this.remove(item);
    }
  }
  createMenu() {
    const root = document.createElement("div");
    root.className = "context-root";
    const ul = document.createElement("ul");
    ul.className = "context-menu context-ul";
    root.appendChild(ul);
    this._container.appendChild(root);
    if (this._position) {
      const pixel = LonLat.toPixel(this._position, this._viewer.scene);
      root.style.left = pixel.x + "px";
      root.style.top = pixel.y + "px";
    }
    this._menu = ul;
    root.oncontextmenu = function () {
      return false;
    };
    return root;
  }
  /**
   * 更新菜单项文字
   * @param  {ContextMenuItem} item 菜单项
   * @param  {HTML|String} text 文字描述，支持html
   */
  updateItemText(item, text) {
    const textEle = document.getElementById(item.id + "-text");
    if (textEle) {
      textEle.innerHTML = text;
    }
  }
  /**
   * 更新菜单项的不可用状态
   * @param  {ContextMenuItem} item   菜单项
   * @param  {Boolean} disabled 是否不可用
   */
  updateItemDistabled(item, disabled) {
    if (item && item.a) {
      item.disabled = disabled;
      item.a.className = disabled ? "context-item-disabled" : "context-item";
    }
  }
  createItems(items) {
    for (let item of items) {
      this.add(item);
    }
  }
  createItem(item = {}) {
    const li = document.createElement("li");
    li.className = "context-menu";
    const a = document.createElement("a");
    a.className = item.disabled ? "context-item-disabled" : "context-item";
    const i = document.createElement("i");
    i.className = item.class;
    a.appendChild(i);
    a.innerHTML += `<span id="${item.id}-text">${item.text}</span>`;
    li.appendChild(a);
    li.id = item.id;
    item.el = li;
    item.a = a;
    if (item.children) {
      const arrow = document.createElement("i");
      arrow.className = "fa fa-caret-right";
      a.appendChild(arrow);
      const sub = new ContextMenu(this._viewer, {
        items: item.children,
        position: this._position,
        parent: this,
      });
      li.appendChild(sub._menu);
      sub._menu.className += " context-submenu";
      item.subMenu = sub;
      sub.container = item;
    }
    item.el.onmouseover = (event) => {
      event.stopPropagation();
      if (item.disabled) {
        return;
      }
      this._activeSubMenu && (this._activeSubMenu.show = false);
      item.subMenu && (item.subMenu.show = true);
      this._activeSubMenu = item.subMenu;
    };
    // item.el.onmouseout = function() {
    //   sub.show = false;
    // }
    item.el.onclick = (event) => {
      event.stopPropagation();
      if (item.disabled) {
        return;
      }
      item.callback && item.callback(item);
      this.show = false;
      this.parent && (this.parent.show = false);
    };
    return item;
  }

  /**
   * @callback ContextMenu~ContextMenuItem
   * 具有以下属性
   * @param       {Object} options 具有以下属性
   * @param {String} [options.class] 菜单项样式
   * @param {String} [options.text] 菜单项将要显示的文字描述
   * @param {String} [options.id] 菜单项id，如果未定义，将创建guid
   * @param {String} [options.disabled=false] 是否不可用
   * @param {ContextMenu} [options.container] 父菜单
   * @param {HTMLElement} [options.container] 插入菜单的容器
   */
  ContextMenuItem(options) {}
  destroy() {}
}

const {
  LEFT_CLICK,
  MOUSE_MOVE,
  RIGHT_CLICK,
  LEFT_DOWN,
  LEFT_UP,
  LEFT_DOUBLE_CLICK,
  RIGHT_DOWN,
  RIGHT_UP,
} = Cesium.ScreenSpaceEventType;
const PlotMode = {
  ready: 1,
  edit: 2,
  create: 3,
};
// todo 1. 攻击箭头报对象已销毁的错误；2.攻击箭头单击添加控制点后形状错误
class PlotManager {
  /**
   * 交互绘图管理器
   * @param {Cesium.Viewer} viewer  viewer对象
   * @param {Object} options 具有以下属性
   * @param {String} [options.id]
   * @param {Object} [options.pointStyle]
   * @param {Object} [options.labelStyle]
   * @param {Object} [options.modelStyle]
   * @param {Object} [options.billboardStyle]
   * @param {Boolean} [options.contextEnabled=true] 是否创建右键菜单
   */
  constructor(viewer, options) {
    checkViewer(viewer);
    this._viewer = viewer;
    options = defaultValue$1(options, {});
    this._id = defaultValue$1(options.id, guid());
    this._dataSource = new Cesium.CustomDataSource(
      "cesiumpro-graphic_" + this._id
    );
    this._nodeDataSource = new Cesium.CustomDataSource(
      "cesiumpro-graphic-node_" + this._id
    );
    this._viewer.dataSources.add(this._dataSource);

    this._viewer.dataSources.add(this._nodeDataSource);
    this._root = this._dataSource.entities;
    this._nodeRoot = this._nodeDataSource.entities;
    this._preEdit = new Event();
    this._postEdit = new Event();
    this._preCreate = new Event();
    this._postCreate = new Event();
    this._preRemove = new Event();
    this._postRemove = new Event();
    this._values = new Cesium.AssociativeArray();
    this._handler = new Cesium.ScreenSpaceEventHandler(this._viewer.canvas);
    this._pointStyle = defaultValue$1(
      options.pointStyle,
      PointPlot.defaultPointStyle
    );
    this._labelStyle = defaultValue$1(
      options.labelStyle,
      PointPlot.defaultLabelStyle
    );
    this._modelStyle = defaultValue$1(
      options.modelStyle,
      PointPlot.defaultModelStyle
    );
    this._billboardStyle = defaultValue$1(
      options.billboardStyle,
      PointPlot.defaultBillboardStyle
    );
    this._polylineStyle = defaultValue$1(
      options.polylineStyle,
      PolylinePlot.defaultStyle
    );
    this._polygonStyle = defaultValue$1(
      options.polygonStyle,
      PolygonPlot.defaultStyle
    );
    this._editEventHandler = new Cesium.ScreenSpaceEventHandler(
      this._viewer.canvas
    );
    this._viewer.screenSpaceEventHandler.removeInputAction(LEFT_DOUBLE_CLICK);
    this.showTip = defaultValue$1(options.showTip, true);

    this._mode = PlotMode.ready;

    /**
     * 右键菜单管理器
     * @type {ContextMenu}
     */
    options.contextEnabled = defaultValue$1(options.contextEnabled, true);
    if (options.contextEnabled) {
      this.contextMenu = this.createContext();
      this.addContextEventListener();
    }
    /**
     * 跟随鼠标移动的文字
     * @type {CursorTip}
     */
    this.cursorTip = new CursorTip({
      text: "",
      id: "plot-manager-tip",
      viewer: this._viewer,
      show: false,
    });
    /**
     * 当前处理激活状态的图形
     * @type {PointPlot|PolylinePlot|PolygonPlot}
     * @readonly
     */
    this.activeGraphic = undefined;
    /**
     * 激活右键菜单的图形
     * @private
     * @type {PointPlot|PolylinePlot|PolygonPlot}
     */
    this.selectedGraphic = undefined;
    // this.addEditEventListener();
  }
  /**
   * viewer
   * @readonly
   * @type {Cesium.Viewer}
   */
  get viewer() {
    return this._viewer;
  }
  /**
   * 图形开始编辑前触发的事件，事件订阅者将以被编辑图形作为参数
   * @readonly
   * @type {Event}
   */
  get preEdit() {
    return this._preEdit;
  }

  /**
   * 图形编辑完成后触发的事件，事件订阅者将以被编辑图形作为参数
   * @readonly
   * @type {Event}
   * @type {Event}
   */
  get postEdit() {
    return this._postEdit;
  }

  /**
   * 实体创建完成，添加到场景之前触发的事件，事件订阅者将以创建的实体作为参数。此时图形还没有添加到场景。
   * @readonly
   * @type {Event}
   * @type {Event}
   */
  get preCreate() {
    return this._preCreate;
  }

  /**
   * 图形创建完成并成功添加到场景后触发的事件，事件订阅者将以被创建的实体作为参数，此时图形已经被添加到场景中。
   * @readonly
   * @type {Event}
   * @type {Event}
   */
  get postCreate() {
    return this._postCreate;
  }

  /**
   * 图形被删除前触发的事件，事件订阅者将以被删除的图形作为参数
   * @readonly
   * @type {Event}
   * @type {Event}
   */
  get preRemove() {
    return this._preRemove;
  }

  /**
   * 图形被删除后触发的事件，事件订阅者将以被删除的图形作为参数
   * @readonly
   * @type {Event}
   * @type {Event}
   */
  get postRemove() {
    return this._postRemove;
  }
  /**
   * 根实体
   * @type {Entity[]}
   * @readonly
   */
  get root() {
    return this._root;
  }
  /**
   * 从地图上选取点创建图形，系统会根据type监听需要的事件
   * @param {PlotType} type 要创建的图形类型
   * @param {object} 图形样式，如果未定义，则使用全局样式
   * @return {PointPlot|PolylinePlot|PolygonPlot}   创建好的几何图形
   */
  pick(type = PlotType$1.POINT, style) {
    let singlePoint = false;
    if (PlotType$1.isPoint(type)) {
      singlePoint = true;
    }
    let graphic;
    this._mode = PlotMode.create;
    if (type === PlotType$1.POINT) {
      graphic = this.createPoint(style || this._pointStyle, this._labelStyle);
    } else if (type === PlotType$1.LABEL) {
      graphic = this.createLabel(style || this._labelStyle);
    } else if (type === PlotType$1.MODEL) {
      graphic = this.createModel(style || this._modelStyle, this._labelStyle);
    } else if (type === PlotType$1.BILLBOARD) {
      graphic = this.createBillboard(
        style || this._billboardStyle,
        this._labelStyle
      );
    } else if (type === PlotType$1.POLYLINE) {
      graphic = this.createPolyline(style || this._polylineStyle);
    } else if (type === PlotType$1.POLYGON) {
      graphic = this.createPolygon(style || this._polygonStyle);
    } else if (PlotType$1.isArrow(type)) {
      graphic = this.createArrow(style || this._polygonStyle, type);
    }
    this.activeGraphic = graphic;
    graphic.startEdit();
    this.addEventListener(singlePoint);
    return graphic;
  }
  /**
   * 创建一个点
   * @param  {Object} options 描述点的参数
   * @param {Object} [labelOptions] 描述一个label图形
   * @return {PointPlot}    点图形
   */
  createPoint(options, labelOptions) {
    const point = new PointPlot(options, {
      label: labelOptions,
    });
    this.add(point);
    return point;
  }
  /**
   * 创建一个label
   * @param  {Object} options 描述label的参数
   * @return {PointPlot}    点图形
   */
  createLabel(options) {
    const label = new PointPlot(options, {
      type: PlotType$1.LABEL,
    });
    this.add(label);
    return label;
  }
  /**
   * 创建一个模型
   * @param  {Object} options 描述模型的参数
   * @param {Object} [labelOptions] 描述一个label图形
   * @return {PointPlot}    点图形
   */
  createModel(options, labelOptions) {
    const model = new PointPlot(options, {
      type: PlotType$1.MODEL,
      label: labelOptions,
    });
    this.add(model);
    return model;
  }
  /**
   * 创建一个点
   * @param  {Object} options 描述点的参数
   * @param {Object} [labelOptions] 描述一个label图形
   * @return {PointPlot}    点图形
   */
  createBillboard(options, labelOptions) {
    const mark = new PointPlot(options, {
      type: PlotType$1.BILLBOARD,
      label: labelOptions,
    });
    this.add(mark);
    return mark;
  }
  /**
   * 创建一条线
   * @param  {Object} options 描述线的参数
   * @return {PolylinePlot}    线图形
   */
  createPolyline(options) {
    const pl = new PolylinePlot(options);
    this.add(pl);
    return pl;
  }
  /**
   * 创建一个点
   * @param  {Object} options 描述多边形的参数
   * @return {PolygonPlot}    多边形
   */
  createPolygon(options) {
    const pg = new PolygonPlot(options);
    this.add(pg);
    return pg;
  }
  /**
   * 创建一个箭头图形
   * @param  {Object} options 描述箭头的参数
   * @return {ArrowPlot}    箭头
   */
  createArrow(options, type) {
    const arrow = new ArrowPlot(options, {
      type,
    });
    this.add(arrow);
    return arrow;
  }
  /**
   * 将实体添加到场景中
   * @param {PolylinePlot|PolygonPlot|PointPlot} graphic 需要添加到场景的图形
   */
  add(graphic) {
    this.preCreate.raise(graphic);
    if (defined(this.viewer && defined(graphic.entity))) {
      this.root.add(graphic.entity);
      this._values.set(graphic.id, graphic);
      this.postCreate.raise(graphic);
    }
  }

  /**
   * 将实体从场景中删除。
   * @param {PolylinePlot|PointPlot|PolygonPlot} graphic 要从场景中删除的图形
   */
  remove(graphic) {
    if (!defined(graphic)) {
      return;
    }
    this.preRemove.raise(graphic);
    if (defined(this.viewer) && defined(graphic.entity)) {
      this.root.remove(graphic.entity);
      this.postRemove.raise(graphic);
    }
    this._values.remove(graphic.id);
    this.activeGraphic && (this.activeGraphic = undefined);
  }
  /**
   * 根据索引获取图形
   * @param  {Number} index 索引
   * @return {PointPlot|PolylinePlot|PolygonPlot}   图形
   */
  get(index) {
    return this._values.values[index];
  }
  /**
   * 根据id获取图形
   * @param  {Number} id id
   * @return {PointPlot|PolylinePlot|PolygonPlot}   图形
   */
  getById(id) {
    return this._values.get(id);
  }
  /**
   * 判断是否包含一个实体
   * @param  {Entity}  entity 图形实体
   * @return {Boolean}  true表示包含
   */
  hasEntity(entity) {
    if (!defined(entity)) {
      return false;
    }
    return this._root.contains(entity);
  }
  /**
   * 从场景中移除所有图形，该方法并不会触发p{@link preRemove}和{@link postRemove}事件
   */
  removeAll() {
    this.root.removeAll();
    this.removeNodeGraphic();
    this._values.removeAll();
  }
  /**
   * 销毁组件
   */
  destroy() {
    this.removeAll();
    this.contextMenu && this.contextMenu.destroy();
    this.removeContextEventListener();
    this._viewer.dataSources.remove(this._dataSource);
    this._viewer.dataSources.remove(this._nodeDataSource);
    this.cursorTip.destroy();
    if (!this._handler.isDestroyed()) {
      this._handler.destroy();
    }
    destroyObject(this);
  }
  /**
   * 定位到图形
   * @param  {PolylinePlot|PolygonPlot|PointPlot|PointPlot[]|PolylinePlot[]|PolygonPlot[]} graphic 定位图形
   */
  zoomTo(graphic) {
    const entities = [];
    if (Array.isArray(graphic)) {
      for (let g of graphic) {
        entities.push(g.entity);
      }
    } else {
      entities.push(graphic.entity);
    }
    if (defined(this._viewer)) {
      this._viewer.zoomTo(entities);
    }
  }
  /**
   * 当前管理器是否包一个图形
   * @param  {String|PointPlot|PolylinePlot|PolygonPlot} graphic 图形或图形id
   * @return {Boolean}  true表示包含
   */
  has(graphic) {
    if (typeof graphic === "string") {
      return this._values.contains(graphic);
    } else {
      return this._values.values.includes(graphic);
    }
  }
  /**
   * 开始编辑
   * @param  {PointPlot|PolylinePlot|PolygonPlot} graphic 被编辑的要素
   */
  startEdit(graphic) {
    if (this.activeGraphic) {
      this.stopEdit(this.activeGraphic);
    }
    if (graphic) {
      graphic.startEdit();
      this.preEdit.raise(graphic);
      this.createNodeGraphic(graphic);
      this.activeGraphic = graphic;
      this.addEditEventListener();
      this.cursorTip.show = true;
      this.cursorTip.text = "单击节点选中";
    }
  }
  /**
   * 停止编辑
   * @param  {PointPlot|PolylinePlot|PolygonPlot} graphic 被编辑的要素
   */
  stopEdit(graphic) {
    if (graphic) {
      graphic.stopEdit();
      graphic.highlightGraphic(false);
      this._nodeRoot.removeAll();
      this.cursorTip.show = false;
      this.activeGraphic = undefined;
      this._mode = PlotMode.ready;
      this.postEdit.raise(graphic);
      this.removeEditListener && this.removeEditListener();
    }
  }
  /**
   * @private
   */
  createNodeGraphic(graphic) {
    if (PlotType$1.isPoint(graphic.type)) {
      return;
    }
    const nodeGraphic = new NodePlot({
      positions: graphic._nodePositions,
      ...PointPlot.defaultStyle,
    });
    const nodes = nodeGraphic._values;
    for (let node of nodes) {
      this._nodeRoot.add(node);
    }
    this._nodeGraphic = nodeGraphic;
  }
  /**
   * @private
   */
  removeNodeGraphic() {
    this._nodeRoot.removeAll();
    this._nodeGraphic = undefined;
  }
  /**
   * @private
   */
  addEventListener(single = true) {
    if (!defined(this.activeGraphic)) {
      return;
    }
    const positions = this.activeGraphic.positions;
    const onClick = (e) => {
      const addNode = PlotType$1.isPoint(this.activeGraphic.type)
        ? this.activeGraphic.updatePosition.bind(this.activeGraphic)
        : this.activeGraphic.addNode.bind(this.activeGraphic);
      const position = this.pickPosition(e.position);
      if (!defined(position)) {
        return;
      }
      // if (this.activeGraphic._arrowType === ArrowType.attackarrow && this.positions.length > 1) {
      //   this.activeGraphic.popNode();
      // }
      if (defined(addNode)) {
        addNode(position);
      }
      if (single) {
        this._handler.removeInputAction(LEFT_CLICK);
        // this.activeGraphic.stopEdit();
        // this._mode = PlotMode.ready;
        this.stopEdit(this.activeGraphic);
      }
    };
    const onMouseMove = (e) => {
      const position = this.pickPosition(e.endPosition);
      if (!defined(position)) {
        return;
      }
      if (this.showTip) {
        this.cursorTip.show = true;
        this.cursorTip.text = "左键单击添加节点，右键结束。";
      }
      if (positions.length < 1) {
        return;
      }
      if (positions.length > 1) {
        this.activeGraphic.popNode();
      }
      this.activeGraphic.addNode(position);
    };
    const onRUp = () => {
      this._handler.removeInputAction(LEFT_CLICK);
      this._handler.removeInputAction(MOUSE_MOVE);
      this._handler.removeInputAction(RIGHT_UP);
      // //由于双击事件会触发两次单击事件，因此最后一个点会重复3次，删除其中两个
      // if (this.activeGraphic.type === PlotType.POLYLINE || this.activeGraphic.type === PlotType.POLYGON) {
      //   this.activeGraphic.popNode();
      //   this.activeGraphic.popNode();
      // }
      // this.activeGraphic.stopEdit();
      // this.activeGraphic = undefined;
      // this._mode = PlotMode.ready;
      this.stopEdit(this.activeGraphic);
      defined(this.contextMenu) && this.addContextEventListener();
    };
    if (!single) {
      this._handler.setInputAction(onMouseMove, MOUSE_MOVE);
      this._handler.setInputAction(onRUp, RIGHT_UP);
    }
    this._handler.setInputAction(onClick, LEFT_CLICK);
  }
  addEditEventListener() {
    const handler = this._editEventHandler;
    let dragging = false;
    const onClick = (e) => {
      defined(this.contextMenu) && (this.contextMenu.show = false);
      if (!defined(this.activeGraphic)) {
        return;
      }
      const feature = this._viewer.scene.pick(e.position);
      if (defined(feature) && feature.id instanceof Cesium.Entity) {
        if (this.hasEntity(feature.id)) {
          this.activeGraphic.highlightGraphic();
          this._nodeGraphic && (this._nodeGraphic.activeNode = undefined);
        } else if (this._nodeGraphic && this._nodeGraphic.has(feature.id)) {
          //设置处于激活状态的顶点
          //处理激活状态的顶点将高亮显示
          this._nodeGraphic.activeNode = feature.id.position.getValue(
            this._viewer.clock.currentTime
          );
          this.activeGraphic.highlightGraphic(false);
        } else {
          this._nodeGraphic.activeNode = undefined;
          this.activeGraphic.highlightGraphic(false);
        }
      } else {
        this._nodeGraphic && (this._nodeGraphic.activeNode = undefined);
        this.activeGraphic && this.activeGraphic.highlightGraphic(false);
      }
    };
    const onMouseDown = () => {
      dragging = true;
      rotateEnabled(this._viewer, !dragging);
      handler.setInputAction(onMouseUp, LEFT_UP);
      handler.setInputAction(onMouseMove, MOUSE_MOVE);
    };
    const onMouseUp = (e) => {
      // const position = this.pickPosition(e.position);
      // this.updatePosition(position);
      dragging = false;
      rotateEnabled(this._viewer, !dragging);
      handler.removeInputAction(MOUSE_MOVE);
      handler.removeInputAction(LEFT_UP);
    };
    const onMouseMove = (e) => {
      const position = this.pickPosition(e.endPosition);
      this.updatePosition(position);
    };
    handler.setInputAction(onClick, LEFT_CLICK);
    handler.setInputAction(onMouseDown, LEFT_DOWN);
    this.removeEditListener = function () {
      handler.removeInputAction(MOUSE_MOVE);
      handler.removeInputAction(LEFT_UP);
      handler.removeInputAction(LEFT_CLICK);
      handler.removeInputAction(LEFT_DOWN);
      this.removeEditListener = undefined;
    };
  }
  addContextEventListener() {
    this._editEventHandler.setInputAction((e) => {
      if (this._mode !== PlotMode.ready) {
        return;
      }
      const feat = this._viewer.scene.pick(e.position);
      const position = pickPosition(e.position, this._viewer, true);
      if (defined(feat) && this.hasEntity(feat.id)) {
        this.contextMenu.position = position;
        this.selectedGraphic = this.getById(feat.id.id);
        defined(this.contextMenu) && (this.contextMenu.show = true);
      }
    }, RIGHT_DOWN);
  }
  removeContextEventListener() {
    this._editEventHandler.removeInputAction(RIGHT_DOWN);
  }
  removeEditEventListener() {
    this._editEventHandler.removeInputAction(LEFT_CLICK);
    this._editEventHandler.removeInputAction(LEFT_DOWN);
  }
  updatePosition(cartesian) {
    const graphic = this.activeGraphic;
    if (!defined(graphic)) {
      return;
    }
    if (PlotType$1.isPoint(graphic.type)) {
      graphic.updatePosition(cartesian);
    } else {
      if (
        !defined(this._nodeGraphic) ||
        !defined(this._nodeGraphic.activeIndex)
      ) {
        return;
      }
      graphic.updateNode(this._nodeGraphic.activeIndex, cartesian);
    }
  }
  pickPosition(pixel) {
    if (!defined(this.activeGraphic)) {
      return;
    }
    this.activeGraphic.clampToModel;
    return pickPosition(pixel, this._viewer);
  }
  /**
   * 为图形添加顶点
   * @param {PointPlot|PolylinePlot|PolygonPlot} graphic 图形
   * @param {Cartesian} node 顶点坐标
   * @param {Number} [index]  顶点索引,如果未定义将添加到最后
   */
  addNode(graphic, node, index) {
    graphic.addNode(node, index);
    if (this._nodeGraphic) {
      const entity = this._nodeGraphic.addNode(node, index);
      this._nodeRoot.add(entity);
    }
  }
  /**
   * 移除图形的顶点
   * @param {PointPlot|PolylinePlot|PolygonPlot} graphic 图形
   * @param {Number} [index]  顶点索引
   */
  removeNode(graphic, index) {
    graphic.removeNode && graphic.removeNode(index);
    if (this._nodeGraphic) {
      const node = this._nodeGraphic.removeNode(index);
      this._nodeRoot.remove(node);
    }
  }
  /**
   * 图形的可见性，该属性将对所有图形生效
   * @type {Boolean}
   */
  get show() {
    return this._root.show;
  }
  set show(val) {
    this._root.show = val;
  }
  /**
   * 点的样式
   * @type {Object}
   */
  get pointStyle() {
    return this._pointStyle;
  }
  set pointStyle(val) {
    this._pointStyle = val;
  }
  /**
   * 文字的样式
   * @type {Object}
   */
  get labelStyle() {
    return this._labelStyle;
  }
  set labelStyle(val) {
    this._labelStyle = val;
  }
  /**
   * 图标的样式
   * @type {Object}
   */
  get billboardStyle() {
    return this._billboardStyle;
  }
  set billboardStyle(val) {
    this._billboardStyle = val;
  }
  /**
   * 模型的样式
   * @type {Object}
   */
  get modelStyle() {
    return this._modelStyle;
  }
  set modelStyle(val) {
    this._modelStyle = val;
  }

  createContext() {
    this.contextMenu = new ContextMenu(this._viewer, {
      items: [
        {
          id: "startEdit",
          text: "开始编辑",
          class: "fa fa-pencil-square-o",
          disabled: this.activeGraphic,
          callback: (item) => {
            if (this.selectedGraphic) {
              this.startEdit(this.selectedGraphic);
              const stopItem = this.contextMenu.getById("stopEdit");
              this.contextMenu.updateItemDistabled(stopItem, false);
              this.contextMenu.updateItemDistabled(item, true);
            }
          },
        },
        {
          id: "stopEdit",
          text: "停止编辑",
          class: "fa fa-floppy-o",
          disabled: !this.activeGraphic,
          callback: (item) => {
            if (this.selectedGraphic) {
              this.stopEdit(this.selectedGraphic);
              const startItem = this.contextMenu.getById("startEdit");
              this.contextMenu.updateItemDistabled(item, true);
              this.contextMenu.updateItemDistabled(startItem, false);
            }
          },
        },
        {
          id: "delete",
          text: "删除图形",
          class: "fa fa-times",
          callback: (item) => {
            this.remove(this.selectedGraphic);
          },
        },
        {
          id: "select",
          text: "选择顶点",
          class: "fa fa-mouse-pointer",
        },
      ],
    });
    return this.contextMenu;
  }
}

export { PlotManager, PointPlot, PlotType };
