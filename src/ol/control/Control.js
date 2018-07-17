/**
 * @module ol/control/Control
 */
import {UNDEFINED} from '../functions.js';
import MapEventType from '../MapEventType.js';
import BaseObject from '../Object.js';
import {removeNode} from '../dom.js';
import {listen, unlistenByKey} from '../events.js';


/**
 * @typedef {Object} Options
 * @property {Element} [element] The element is the control's
 * container element. This only needs to be specified if you're developing
 * a custom control.
 * @property {function(module:ol/MapEvent)} [render] Function called when
 * the control should be re-rendered. This is called in a `requestAnimationFrame`
 * callback.
 * @property {Element|string} [target] Specify a target if you want
 * the control to be rendered outside of the map's viewport.
 */


/**
 * @classdesc
 * A control is a visible widget with a DOM element in a fixed position on the
 * screen. They can involve user input (buttons), or be informational only;
 * the position is determined using CSS. By default these are placed in the
 * container with CSS class name `ol-overlaycontainer-stopevent`, but can use
 * any outside DOM element.
 *
 * This is the base class for controls. You can use it for simple custom
 * controls by creating the element with listeners, creating an instance:
 * ```js
 * var myControl = new Control({element: myElement});
 * ```
 * and then adding this to the map.
 *
 * The main advantage of having this as a control rather than a simple separate
 * DOM element is that preventing propagation is handled for you. Controls
 * will also be objects in a {@link module:ol/Collection~Collection}, so you can use their methods.
 *
 * You can also extend this base for your own control class. See
 * examples/custom-controls for an example of how to do this.
 *
 * @constructor
 * @param {module:ol/control/Control~Options} options Control options.
 * @api
 */
class Control extends BaseObject {
  constructor(options) {

    super();

    /**
     * @protected
     * @type {Element}
     */
    this.element = options.element ? options.element : null;

    /**
     * @private
     * @type {Element}
     */
    this.target_ = null;

    /**
     * @private
     * @type {module:ol/PluggableMap}
     */
    this.map_ = null;

    /**
     * @protected
     * @type {!Array.<module:ol/events~EventsKey>}
     */
    this.listenerKeys = [];

    /**
     * @type {function(module:ol/MapEvent)}
     */
    this.render = options.render ? options.render : UNDEFINED;

    if (options.target) {
      this.setTarget(options.target);
    }

  }

  /**
   * @inheritDoc
   */
  disposeInternal() {
    removeNode(this.element);
    super.disposeInternal();
  }

  /**
   * Get the map associated with this control.
   * @return {module:ol/PluggableMap} Map.
   * @api
   */
  getMap() {
    return this.map_;
  }

  /**
   * Remove the control from its current map and attach it to the new map.
   * Subclasses may set up event handlers to get notified about changes to
   * the map here.
   * @param {module:ol/PluggableMap} map Map.
   * @api
   */
  setMap(map) {
    if (this.map_) {
      removeNode(this.element);
    }
    for (let i = 0, ii = this.listenerKeys.length; i < ii; ++i) {
      unlistenByKey(this.listenerKeys[i]);
    }
    this.listenerKeys.length = 0;
    this.map_ = map;
    if (this.map_) {
      const target = this.target_ ?
        this.target_ : map.getOverlayContainerStopEvent();
      target.appendChild(this.element);
      if (this.render !== UNDEFINED) {
        this.listenerKeys.push(listen(map,
          MapEventType.POSTRENDER, this.render, this));
      }
      map.render();
    }
  }

  /**
   * This function is used to set a target element for the control. It has no
   * effect if it is called after the control has been added to the map (i.e.
   * after `setMap` is called on the control). If no `target` is set in the
   * options passed to the control constructor and if `setTarget` is not called
   * then the control is added to the map's overlay container.
   * @param {Element|string} target Target.
   * @api
   */
  setTarget(target) {
    this.target_ = typeof target === 'string' ?
      document.getElementById(target) :
      target;
  }
}


export default Control;
