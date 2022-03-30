(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined'
    ? factory(exports, require('vue'))
    : typeof define === 'function' && define.amd
    ? define(['exports', 'vue'], factory)
    : ((global = typeof globalThis !== 'undefined' ? globalThis : global || self),
      factory((global.VueSlicksort = {}), global.vue));
})(this, function (exports, vue) {
  'use strict';

  // Export Sortable Element Component Mixin
  const ElementMixin = vue.defineComponent({
    inject: ['manager'],
    props: {
      index: {
        type: Number,
        required: true,
      },
      disabled: {
        type: Boolean,
        default: false,
      },
    },
    data() {
      return {};
    },
    watch: {
      index(newIndex) {
        if (this.$el && this.$el.sortableInfo) {
          this.$el.sortableInfo.index = newIndex;
        }
      },
      disabled(isDisabled) {
        if (isDisabled) {
          this.removeDraggable();
        } else {
          this.setDraggable(this.index);
        }
      },
    },
    mounted() {
      const { disabled, index } = this.$props;
      if (!disabled) {
        this.setDraggable(index);
      }
    },
    beforeUnmount() {
      if (!this.disabled) this.removeDraggable();
    },
    methods: {
      setDraggable(index) {
        const node = this.$el;
        node.sortableInfo = {
          index,
          manager: this.manager,
        };
        this.ref = { node };
        this.manager.add(this.ref);
      },
      removeDraggable() {
        this.manager.remove(this.ref);
      },
    },
  });

  class Manager {
    constructor() {
      this.refs = [];
      this.active = null;
    }
    add(ref) {
      if (!this.refs) {
        this.refs = [];
      }
      this.refs.push(ref);
    }
    remove(ref) {
      const index = this.getIndex(ref);
      if (index !== -1) {
        this.refs.splice(index, 1);
      }
    }
    isActive() {
      return !!this.active;
    }
    getActive() {
      return (
        this.refs.find(({ node }) => {
          var _a, _b;
          return (
            ((_a = node === null || node === void 0 ? void 0 : node.sortableInfo) === null || _a === void 0
              ? void 0
              : _a.index) ==
            ((_b = this === null || this === void 0 ? void 0 : this.active) === null || _b === void 0
              ? void 0
              : _b.index)
          );
        }) || null
      );
    }
    getIndex(ref) {
      return this.refs.indexOf(ref);
    }
    getRefs() {
      return this.refs;
    }
    getOrderedRefs() {
      return this.refs.sort((a, b) => {
        return a.node.sortableInfo.index - b.node.sortableInfo.index;
      });
    }
  }

  const isTouch = (e) => {
    return e.touches != null;
  };
  // eslint-disable-next-line @typescript-eslint/ban-types
  function hasOwnProperty(obj, prop) {
    return !!obj && Object.prototype.hasOwnProperty.call(obj, prop);
  }
  function arrayMove(arr, previousIndex, newIndex) {
    const array = arr.slice(0);
    if (newIndex >= array.length) {
      let k = newIndex - array.length;
      while (k-- + 1) {
        array.push(undefined);
      }
    }
    array.splice(newIndex, 0, array.splice(previousIndex, 1)[0]);
    return array;
  }
  function arrayRemove(arr, previousIndex) {
    const array = arr.slice(0);
    if (previousIndex >= array.length) return array;
    array.splice(previousIndex, 1);
    return array;
  }
  function arrayInsert(arr, newIndex, value) {
    const array = arr.slice(0);
    if (newIndex === array.length) {
      array.push(value);
    } else {
      array.splice(newIndex, 0, value);
    }
    return array;
  }
  const events = {
    start: ['touchstart', 'mousedown'],
    move: ['touchmove', 'mousemove'],
    end: ['touchend', 'mouseup'],
    cancel: ['touchcancel', 'keyup'],
  };
  function closest(el, fn) {
    while (el) {
      if (fn(el)) return el;
      el = el.parentNode;
    }
  }
  function limit(min, max, value) {
    if (value < min) {
      return min;
    }
    if (value > max) {
      return max;
    }
    return value;
  }
  function getCSSPixelValue(stringValue) {
    if (stringValue.substr(-2) === 'px') {
      return parseFloat(stringValue);
    }
    return 0;
  }
  function getElementMargin(element) {
    const style = window.getComputedStyle(element);
    return {
      top: getCSSPixelValue(style.marginTop),
      right: getCSSPixelValue(style.marginRight),
      bottom: getCSSPixelValue(style.marginBottom),
      left: getCSSPixelValue(style.marginLeft),
    };
  }
  function getPointerOffset(e, reference = 'page') {
    const x = `${reference}X`;
    const y = `${reference}Y`;
    return {
      x: isTouch(e) ? e.touches[0][x] : e[x],
      y: isTouch(e) ? e.touches[0][y] : e[y],
    };
  }
  function getEdgeOffset(node, container, offset = { top: 0, left: 0 }) {
    // Get the actual offsetTop / offsetLeft value, no matter how deep the node is nested
    if (node) {
      const nodeOffset = {
        top: offset.top + node.offsetTop,
        left: offset.left + node.offsetLeft,
      };
      if (node.offsetParent !== container.offsetParent) {
        return getEdgeOffset(node.offsetParent, container, nodeOffset);
      } else {
        return nodeOffset;
      }
    }
    return { top: 0, left: 0 };
  }
  function cloneNode(node) {
    const fields = node.querySelectorAll('input, textarea, select');
    const clonedNode = node.cloneNode(true);
    const clonedFields = [...clonedNode.querySelectorAll('input, textarea, select')]; // Convert NodeList to Array
    clonedFields.forEach((field, index) => {
      if (field.type !== 'file' && fields[index]) {
        field.value = fields[index].value;
      }
    });
    return clonedNode;
  }
  function getLockPixelOffsets(lockOffset, width, height) {
    if (typeof lockOffset == 'string') {
      lockOffset = +lockOffset;
    }
    if (!Array.isArray(lockOffset)) {
      lockOffset = [lockOffset, lockOffset];
    }
    if (lockOffset.length !== 2) {
      throw new Error(
        `lockOffset prop of SortableContainer should be a single value or an array of exactly two values. Given ${lockOffset}`
      );
    }
    const [minLockOffset, maxLockOffset] = lockOffset;
    return [getLockPixelOffset(minLockOffset, width, height), getLockPixelOffset(maxLockOffset, width, height)];
  }
  function getLockPixelOffset(lockOffset, width, height) {
    let offsetX = lockOffset;
    let offsetY = lockOffset;
    let unit = 'px';
    if (typeof lockOffset === 'string') {
      const match = /^[+-]?\d*(?:\.\d*)?(px|%)$/.exec(lockOffset);
      if (match === null) {
        throw new Error(
          `lockOffset value should be a number or a string of a number followed by "px" or "%". Given ${lockOffset}`
        );
      }
      offsetX = offsetY = parseFloat(lockOffset);
      unit = match[1];
    }
    if (!isFinite(offsetX) || !isFinite(offsetY)) {
      throw new Error(`lockOffset value should be a finite. Given ${lockOffset}`);
    }
    if (unit === '%') {
      offsetX = (offsetX * width) / 100;
      offsetY = (offsetY * height) / 100;
    }
    return {
      x: offsetX,
      y: offsetY,
    };
  }
  function getDistance(x1, y1, x2, y2) {
    const x = x1 - x2;
    const y = y1 - y2;
    return Math.sqrt(x * x + y * y);
  }
  function getRectCenter(clientRect) {
    return {
      x: clientRect.left + clientRect.width / 2,
      y: clientRect.top + clientRect.height / 2,
    };
  }
  function resetTransform(nodes = []) {
    for (let i = 0, len = nodes.length; i < len; i++) {
      const node = nodes[i];
      const el = node.node;
      if (!el) return;
      // Clear the cached offsetTop / offsetLeft value
      node.edgeOffset = null;
      // Remove the transforms / transitions
      setTransform(el);
    }
  }
  function setTransform(el, transform = '', duration = '') {
    if (!el) return;
    el.style['transform'] = transform;
    el.style['transitionDuration'] = duration;
  }
  function withinBounds(pos, top, bottom) {
    const upper = Math.max(top, bottom);
    const lower = Math.min(top, bottom);
    return lower <= pos && pos <= upper;
  }
  function isPointWithinRect({ x, y }, { top, left, width, height }) {
    const withinX = withinBounds(x, left, left + width);
    const withinY = withinBounds(y, top, top + height);
    return withinX && withinY;
  }

  /* eslint-disable @typescript-eslint/ban-ts-comment */
  // eslint-disable-next-line @typescript-eslint/ban-types
  const timeout = setTimeout;
  // Export Sortable Container Component Mixin
  const ContainerMixin = vue.defineComponent({
    inject: {
      SlicksortHub: {
        from: 'SlicksortHub',
        default: null,
      },
    },
    provide() {
      return {
        manager: this.manager,
      };
    },
    props: {
      list: { type: Array, required: true },
      axis: { type: String, default: 'y' },
      distance: { type: Number, default: 0 },
      pressDelay: { type: Number, default: 0 },
      pressThreshold: { type: Number, default: 5 },
      useDragHandle: { type: Boolean, default: false },
      useWindowAsScrollContainer: { type: Boolean, default: false },
      hideSortableGhost: { type: Boolean, default: true },
      lockToContainerEdges: { type: Boolean, default: false },
      lockOffset: { type: [String, Number, Array], default: '50%' },
      transitionDuration: { type: Number, default: 300 },
      appendTo: { type: String, default: 'body' },
      draggedSettlingDuration: { type: Number, default: null },
      group: { type: String, default: '' },
      accept: { type: [Boolean, Array, Function], default: null },
      cancelKey: { type: String, default: 'Escape' },
      block: { type: Array, default: () => [] },
      lockAxis: { type: String, default: '' },
      helperClass: { type: String, default: '' },
      contentWindow: { type: Object, default: null },
      shouldCancelStart: {
        type: Function,
        default: (e) => {
          // Cancel sorting if the event target is an `input`, `textarea`, `select` or `option`
          const disabledElements = ['input', 'textarea', 'select', 'option', 'button'];
          return disabledElements.indexOf(e.target.tagName.toLowerCase()) !== -1;
        },
      },
      getHelperDimensions: {
        type: Function,
        default: ({ node }) => ({
          width: node.offsetWidth,
          height: node.offsetHeight,
        }),
      },
    },
    emits: ['sort-start', 'sort-move', 'sort-end', 'sort-cancel', 'sort-insert', 'sort-remove', 'update:list'],
    data() {
      let useHub = false;
      if (this.group) {
        // If the group option is set, it is assumed the user intends
        // to drag between containers and the required plugin has been installed
        if (this.SlicksortHub) {
          useHub = true;
        } else if (process.env.NODE_ENV !== 'production') {
          throw new Error('Slicksort plugin required to use "group" prop');
        }
      }
      return {
        sorting: false,
        hub: useHub ? this.SlicksortHub : null,
        manager: new Manager(),
      };
    },
    mounted() {
      if (this.hub) {
        this.id = this.hub.getId();
      }
      this.container = this.$el;
      this.document = this.container.ownerDocument || document;
      this._window = this.contentWindow || window;
      this.scrollContainer = this.useWindowAsScrollContainer ? { scrollLeft: 0, scrollTop: 0 } : this.container;
      this.events = {
        start: this.handleStart,
        move: this.handleMove,
        end: this.handleEnd,
      };
      for (const key in this.events) {
        if (hasOwnProperty(this.events, key)) {
          // @ts-ignore
          events[key].forEach((eventName) => this.container.addEventListener(eventName, this.events[key]));
        }
      }
      if (this.hub) {
        this.hub.addContainer(this);
      }
    },
    beforeUnmount() {
      for (const key in this.events) {
        if (hasOwnProperty(this.events, key)) {
          // @ts-ignore
          events[key].forEach((eventName) => this.container.removeEventListener(eventName, this.events[key]));
        }
      }
      if (this.hub) {
        this.hub.removeContainer(this);
      }
      if (this.dragendTimer) clearTimeout(this.dragendTimer);
      if (this.cancelTimer) clearTimeout(this.cancelTimer);
      if (this.pressTimer) clearTimeout(this.pressTimer);
      if (this.autoscrollInterval) clearInterval(this.autoscrollInterval);
    },
    methods: {
      handleStart(e) {
        const { distance, shouldCancelStart } = this.$props;
        if ((!isTouch(e) && e.button === 2) || shouldCancelStart(e)) {
          return false;
        }
        this._touched = true;
        this._pos = getPointerOffset(e);
        const target = e.target;
        const node = closest(target, (el) => el.sortableInfo != null);
        if (node && node.sortableInfo && this.nodeIsChild(node) && !this.sorting) {
          const { useDragHandle } = this.$props;
          const { index } = node.sortableInfo;
          if (useDragHandle && !closest(target, (el) => el.sortableHandle != null)) return;
          this.manager.active = { index };
          /*
           * Fixes a bug in Firefox where the :active state of anchor tags
           * prevent subsequent 'mousemove' events from being fired
           * (see https://github.com/clauderic/react-sortable-hoc/issues/118)
           */
          if (target.tagName.toLowerCase() === 'a') {
            e.preventDefault();
          }
          if (!distance) {
            if (this.pressDelay === 0) {
              this.handlePress(e);
            } else {
              this.pressTimer = timeout(() => this.handlePress(e), this.pressDelay);
            }
          }
        }
      },
      nodeIsChild(node) {
        return node.sortableInfo.manager === this.manager;
      },
      handleMove(e) {
        const { distance, pressThreshold } = this.$props;
        if (!this.sorting && this._touched) {
          const offset = getPointerOffset(e);
          this._delta = {
            x: this._pos.x - offset.x,
            y: this._pos.y - offset.y,
          };
          const delta = Math.abs(this._delta.x) + Math.abs(this._delta.y);
          if (!distance && (!pressThreshold || (pressThreshold && delta >= pressThreshold))) {
            if (this.cancelTimer) clearTimeout(this.cancelTimer);
            this.cancelTimer = timeout(this.cancel, 0);
          } else if (distance && delta >= distance && this.manager.isActive()) {
            this.handlePress(e);
          }
        }
      },
      handleEnd() {
        if (!this._touched) return;
        const { distance } = this.$props;
        this._touched = false;
        if (!distance) {
          this.cancel();
        }
      },
      cancel() {
        if (!this.sorting) {
          if (this.pressTimer) clearTimeout(this.pressTimer);
          this.manager.active = null;
          if (this.hub) this.hub.cancel();
        }
      },
      handleSortCancel(e) {
        if (isTouch(e) || e.key === this.cancelKey) {
          this.newIndex = this.index;
          this.canceling = true;
          this.translate = { x: 0, y: 0 };
          this.animateNodes();
          this.handleSortEnd(e);
        }
      },
      handlePress(e) {
        e.stopPropagation();
        const active = this.manager.getActive();
        if (active) {
          const { getHelperDimensions, helperClass, hideSortableGhost, appendTo } = this.$props;
          const { node } = active;
          const { index } = node.sortableInfo;
          const margin = getElementMargin(node);
          const containerBoundingRect = this.container.getBoundingClientRect();
          const dimensions = getHelperDimensions({ index, node });
          this.node = node;
          this.margin = margin;
          this.width = dimensions.width;
          this.height = dimensions.height;
          this.marginOffset = {
            x: this.margin.left + this.margin.right,
            y: Math.max(this.margin.top, this.margin.bottom),
          };
          this.boundingClientRect = node.getBoundingClientRect();
          this.containerBoundingRect = containerBoundingRect;
          this.index = index;
          this.newIndex = index;
          const clonedNode = cloneNode(node);
          this.helper = this.document.querySelector(appendTo).appendChild(clonedNode);
          this.helper.style.position = 'fixed';
          this.helper.style.top = `${this.boundingClientRect.top - margin.top}px`;
          this.helper.style.left = `${this.boundingClientRect.left - margin.left}px`;
          this.helper.style.width = `${this.width}px`;
          this.helper.style.height = `${this.height}px`;
          this.helper.style.boxSizing = 'border-box';
          this.helper.style.pointerEvents = 'none';
          if (hideSortableGhost) {
            this.sortableGhost = node;
            node.style.visibility = 'hidden';
            node.style.opacity = '0';
          }
          if (this.hub) {
            this.hub.sortStart(this);
            this.hub.helper = this.helper;
            this.hub.ghost = this.sortableGhost;
          }
          this.intializeOffsets(e, this.boundingClientRect);
          this.offsetEdge = getEdgeOffset(node, this.container);
          if (helperClass) {
            this.helper.classList.add(...helperClass.split(' '));
          }
          this.listenerNode = isTouch(e) ? node : this._window;
          // @ts-ignore
          events.move.forEach((eventName) => this.listenerNode.addEventListener(eventName, this.handleSortMove));
          // @ts-ignore
          events.end.forEach((eventName) => this.listenerNode.addEventListener(eventName, this.handleSortEnd));
          // @ts-ignore
          events.cancel.forEach((eventName) => this.listenerNode.addEventListener(eventName, this.handleSortCancel));
          this.sorting = true;
          this.$emit('sort-start', { event: e, node, index });
        }
      },
      handleSortMove(e) {
        e.preventDefault(); // Prevent scrolling on mobile
        this.updatePosition(e);
        if (this.hub) {
          const payload = this.list[this.index];
          this.hub.handleSortMove(e, payload);
        }
        if (!this.hub || this.hub.isDest(this)) {
          this.animateNodes();
          this.autoscroll();
        }
        this.$emit('sort-move', { event: e });
      },
      handleDropOut() {
        const removed = this.list[this.index];
        const newValue = arrayRemove(this.list, this.index);
        this.$emit('sort-remove', {
          oldIndex: this.index,
        });
        this.$emit('update:list', newValue);
        return removed;
      },
      handleDropIn(payload) {
        const newValue = arrayInsert(this.list, this.newIndex, payload);
        this.$emit('sort-insert', {
          newIndex: this.newIndex,
          value: payload,
        });
        this.$emit('update:list', newValue);
        this.handleDragEnd();
      },
      handleDragOut() {
        if (this.autoscrollInterval) {
          clearInterval(this.autoscrollInterval);
          this.autoscrollInterval = null;
        }
        if (this.hub.isSource(this)) {
          // Trick to animate all nodes up
          this.translate = {
            x: 10000,
            y: 10000,
          };
          this.animateNodes();
        } else {
          this.manager.getRefs().forEach((ref) => {
            ref.node.style['transform'] = '';
          });
          this.dragendTimer = timeout(this.handleDragEnd, this.transitionDuration || 0);
        }
      },
      handleDragEnd() {
        if (this.autoscrollInterval) {
          clearInterval(this.autoscrollInterval);
          this.autoscrollInterval = null;
        }
        resetTransform(this.manager.getRefs());
        if (this.sortableGhost) {
          this.sortableGhost.remove();
          this.sortableGhost = null;
        }
        if (this.dragendTimer) {
          clearTimeout(this.dragendTimer);
          this.dragendTimer = null;
        }
        this.manager.active = null;
        this._touched = false;
        this.sorting = false;
      },
      intializeOffsets(e, clientRect) {
        const { useWindowAsScrollContainer, containerBoundingRect, _window } = this;
        this.marginOffset = {
          x: this.margin.left + this.margin.right,
          y: Math.max(this.margin.top, this.margin.bottom),
        };
        this._axis = {
          x: this.axis.indexOf('x') >= 0,
          y: this.axis.indexOf('y') >= 0,
        };
        this.initialOffset = getPointerOffset(e);
        // initialScroll;
        this.initialScroll = {
          top: this.scrollContainer.scrollTop,
          left: this.scrollContainer.scrollLeft,
        };
        // initialWindowScroll;
        this.initialWindowScroll = {
          top: window.pageYOffset,
          left: window.pageXOffset,
        };
        this.translate = { x: 0, y: 0 };
        this.minTranslate = {};
        this.maxTranslate = {};
        if (this._axis.x) {
          this.minTranslate.x =
            (useWindowAsScrollContainer ? 0 : containerBoundingRect.left) - clientRect.left - this.width / 2;
          this.maxTranslate.x =
            (useWindowAsScrollContainer
              ? _window.innerWidth
              : containerBoundingRect.left + containerBoundingRect.width) -
            clientRect.left -
            this.width / 2;
        }
        if (this._axis.y) {
          this.minTranslate.y =
            (useWindowAsScrollContainer ? 0 : containerBoundingRect.top) - clientRect.top - this.height / 2;
          this.maxTranslate.y =
            (useWindowAsScrollContainer
              ? _window.innerHeight
              : containerBoundingRect.top + containerBoundingRect.height) -
            clientRect.top -
            this.height / 2;
        }
      },
      handleDragIn(e, sortableGhost, helper) {
        if (this.hub.isSource(this)) {
          return;
        }
        if (this.dragendTimer) {
          this.handleDragEnd();
          clearTimeout(this.dragendTimer);
          this.dragendTimer = null;
        }
        const nodes = this.manager.getRefs();
        this.index = nodes.length;
        this.manager.active = { index: this.index };
        const containerBoundingRect = this.container.getBoundingClientRect();
        const helperBoundingRect = helper.getBoundingClientRect();
        this.containerBoundingRect = containerBoundingRect;
        this.sortableGhost = cloneNode(sortableGhost);
        this.container.appendChild(this.sortableGhost);
        const ghostRect = this.sortableGhost.getBoundingClientRect();
        this.boundingClientRect = ghostRect;
        this.margin = getElementMargin(this.sortableGhost);
        this.width = ghostRect.width;
        this.height = ghostRect.height;
        // XY coords of the inserted node, relative to the top-left corner of the container
        this.offsetEdge = getEdgeOffset(this.sortableGhost, this.container);
        this.intializeOffsets(e, ghostRect);
        // Move the initialOffset back to the insertion point of the
        // sortableGhost (end of the list), as if we had started the drag there.
        this.initialOffset.x += ghostRect.x - helperBoundingRect.x;
        this.initialOffset.y += ghostRect.y - helperBoundingRect.y;
        // Turn on dragging
        this.sorting = true;
      },
      handleSortEnd(e) {
        // Remove the event listeners if the node is still in the DOM
        if (this.listenerNode) {
          events.move.forEach((eventName) =>
            // @ts-ignore
            this.listenerNode.removeEventListener(eventName, this.handleSortMove)
          );
          events.end.forEach((eventName) =>
            // @ts-ignore
            this.listenerNode.removeEventListener(eventName, this.handleSortEnd)
          );
          events.cancel.forEach((eventName) =>
            // @ts-ignore
            this.listenerNode.removeEventListener(eventName, this.handleSortCancel)
          );
        }
        const nodes = this.manager.getRefs();
        // Remove the helper class(es) early to give it a chance to transition back
        if (this.helper && this.helperClass) {
          this.helper.classList.remove(...this.helperClass.split(' '));
        }
        // Stop autoscroll
        if (this.autoscrollInterval) clearInterval(this.autoscrollInterval);
        this.autoscrollInterval = null;
        const onEnd = () => {
          // Remove the helper from the DOM
          if (this.helper) {
            this.helper.remove();
            this.helper = null;
          }
          if (this.hideSortableGhost && this.sortableGhost) {
            this.sortableGhost.style.visibility = '';
            this.sortableGhost.style.opacity = '';

            // TODO: @reason #1 for override
            this.sortableGhost = null;
          }
          resetTransform(nodes);
          // Update state
          if (this.hub && !this.hub.isDest(this)) {
            this.canceling ? this.hub.cancel() : this.hub.handleSortEnd();
          } else if (this.canceling) {
            this.$emit('sort-cancel', { event: e });
          } else {
            this.$emit('sort-end', {
              event: e,
              oldIndex: this.index,
              newIndex: this.newIndex,
            });
            this.$emit('update:list', arrayMove(this.list, this.index, this.newIndex));
          }
          this.manager.active = null;
          this._touched = false;
          this.canceling = false;
          this.sorting = false;
        };
        if (this.transitionDuration || this.draggedSettlingDuration) {
          this.transitionHelperIntoPlace(nodes, onEnd);
        } else {
          onEnd();
        }
      },
      transitionHelperIntoPlace(nodes, cb) {
        if (this.draggedSettlingDuration === 0 || nodes.length === 0 || !this.helper) {
          return Promise.resolve();
        }
        const indexNode = nodes[this.index].node;
        let targetX = 0;
        let targetY = 0;
        const scrollDifference = {
          top: window.pageYOffset - this.initialWindowScroll.top,
          left: window.pageXOffset - this.initialWindowScroll.left,
        };
        if (this.hub && !this.hub.isDest(this) && !this.canceling) {
          const dest = this.hub.getDest();
          if (!dest) return;
          targetX = dest.sortableGhost.left;
          targetY = dest.sortableGhost.top;
        } else {
          const newIndexNode = nodes[this.newIndex].node;
          const deltaScroll = {
            left: this.scrollContainer.scrollLeft - this.initialScroll.left + scrollDifference.left,
            top: this.scrollContainer.scrollTop - this.initialScroll.top + scrollDifference.top,
          };
          targetX = -deltaScroll.left;
          if (this.translate && this.translate.x > 0) {
            // Diff against right edge when moving to the right
            targetX +=
              newIndexNode.offsetLeft + newIndexNode.offsetWidth - (indexNode.offsetLeft + indexNode.offsetWidth);
          } else {
            targetX += newIndexNode.offsetLeft - indexNode.offsetLeft;
          }
          targetY = -deltaScroll.top;
          if (this.translate && this.translate.y > 0) {
            // Diff against the bottom edge when moving down
            targetY +=
              newIndexNode.offsetTop + newIndexNode.offsetHeight - (indexNode.offsetTop + indexNode.offsetHeight);
          } else {
            targetY += newIndexNode.offsetTop - indexNode.offsetTop;
          }
        }
        const duration = this.draggedSettlingDuration !== null ? this.draggedSettlingDuration : this.transitionDuration;
        setTransform(this.helper, `translate3d(${targetX}px,${targetY}px, 0)`, `${duration}ms`);
        // Register an event handler to clean up styles when the transition
        // finishes.
        const cleanup = (event) => {
          if (!event || event.propertyName === 'transform') {
            clearTimeout(cleanupTimer);
            setTransform(this.helper);
            cb();
          }
        };
        // Force cleanup in case 'transitionend' never fires
        const cleanupTimer = setTimeout(cleanup, duration + 10);
        this.helper.addEventListener('transitionend', cleanup);
      },
      updatePosition(e) {
        const { lockAxis, lockToContainerEdges } = this.$props;
        const offset = getPointerOffset(e);
        const translate = {
          x: offset.x - this.initialOffset.x,
          y: offset.y - this.initialOffset.y,
        };
        // Adjust for window scroll
        translate.y -= window.pageYOffset - this.initialWindowScroll.top;
        translate.x -= window.pageXOffset - this.initialWindowScroll.left;
        this.translate = translate;
        if (lockToContainerEdges) {
          const [minLockOffset, maxLockOffset] = getLockPixelOffsets(this.lockOffset, this.height, this.width);
          const minOffset = {
            x: this.width / 2 - minLockOffset.x,
            y: this.height / 2 - minLockOffset.y,
          };
          const maxOffset = {
            x: this.width / 2 - maxLockOffset.x,
            y: this.height / 2 - maxLockOffset.y,
          };
          if (this.minTranslate.x && this.maxTranslate.x)
            translate.x = limit(this.minTranslate.x + minOffset.x, this.maxTranslate.x - maxOffset.x, translate.x);
          if (this.minTranslate.y && this.maxTranslate.y)
            translate.y = limit(this.minTranslate.y + minOffset.y, this.maxTranslate.y - maxOffset.y, translate.y);
        }
        if (lockAxis === 'x') {
          translate.y = 0;
        } else if (lockAxis === 'y') {
          translate.x = 0;
        }
        if (this.helper) {
          this.helper.style['transform'] = `translate3d(${translate.x}px,${translate.y}px, 0)`;
        }
      },
      animateNodes() {
        const { transitionDuration, hideSortableGhost } = this.$props;
        const nodes = this.manager.getOrderedRefs();
        const deltaScroll = {
          left: this.scrollContainer.scrollLeft - this.initialScroll.left,
          top: this.scrollContainer.scrollTop - this.initialScroll.top,
        };
        const sortingOffset = {
          left: this.offsetEdge.left + this.translate.x + deltaScroll.left,
          top: this.offsetEdge.top + this.translate.y + deltaScroll.top,
        };
        const scrollDifference = {
          top: window.pageYOffset - this.initialWindowScroll.top,
          left: window.pageXOffset - this.initialWindowScroll.left,
        };
        this.newIndex = null;
        for (let i = 0, len = nodes.length; i < len; i++) {
          const { node } = nodes[i];
          const index = node.sortableInfo.index;
          const width = node.offsetWidth;
          const height = node.offsetHeight;
          const offset = {
            width: this.width > width ? width / 2 : this.width / 2,
            height: this.height > height ? height / 2 : this.height / 2,
          };
          const translate = {
            x: 0,
            y: 0,
          };
          let { edgeOffset } = nodes[i];
          // If we haven't cached the node's offsetTop / offsetLeft value
          if (!edgeOffset) {
            nodes[i].edgeOffset = edgeOffset = getEdgeOffset(node, this.container);
          }
          // Get a reference to the next and previous node
          const nextNode = i < nodes.length - 1 && nodes[i + 1];
          const prevNode = i > 0 && nodes[i - 1];
          // Also cache the next node's edge offset if needed.
          // We need this for calculating the animation in a grid setup
          if (nextNode && !nextNode.edgeOffset) {
            nextNode.edgeOffset = getEdgeOffset(nextNode.node, this.container);
          }
          // If the node is the one we're currently animating, skip it
          if (index === this.index) {
            /*
             * With windowing libraries such as `react-virtualized`, the sortableGhost
             * node may change while scrolling down and then back up (or vice-versa),
             * so we need to update the reference to the new node just to be safe.
             */
            if (hideSortableGhost) {
              this.sortableGhost = node;
              node.style.visibility = 'hidden';
              node.style.opacity = '0';
            }
            continue;
          }
          if (transitionDuration) {
            node.style['transitionDuration'] = `${transitionDuration}ms`;
          }
          if (this._axis.x) {
            if (this._axis.y) {
              // Calculations for a grid setup
              if (
                index < this.index &&
                ((sortingOffset.left + scrollDifference.left - offset.width <= edgeOffset.left &&
                  sortingOffset.top + scrollDifference.top <= edgeOffset.top + offset.height) ||
                  sortingOffset.top + scrollDifference.top + offset.height <= edgeOffset.top)
              ) {
                // If the current node is to the left on the same row, or above the node that's being dragged
                // then move it to the right
                translate.x = this.width + this.marginOffset.x;
                if (edgeOffset.left + translate.x > this.containerBoundingRect.width - offset.width && nextNode) {
                  // If it moves passed the right bounds, then animate it to the first position of the next row.
                  // We just use the offset of the next node to calculate where to move, because that node's original position
                  // is exactly where we want to go
                  translate.x = nextNode.edgeOffset.left - edgeOffset.left;
                  translate.y = nextNode.edgeOffset.top - edgeOffset.top;
                }
                if (this.newIndex === null) {
                  this.newIndex = index;
                }
              } else if (
                index > this.index &&
                ((sortingOffset.left + scrollDifference.left + offset.width >= edgeOffset.left &&
                  sortingOffset.top + scrollDifference.top + offset.height >= edgeOffset.top) ||
                  sortingOffset.top + scrollDifference.top + offset.height >= edgeOffset.top + height)
              ) {
                // If the current node is to the right on the same row, or below the node that's being dragged
                // then move it to the left
                translate.x = -(this.width + this.marginOffset.x);
                if (edgeOffset.left + translate.x < this.containerBoundingRect.left + offset.width && prevNode) {
                  // If it moves passed the left bounds, then animate it to the last position of the previous row.
                  // We just use the offset of the previous node to calculate where to move, because that node's original position
                  // is exactly where we want to go
                  translate.x = prevNode.edgeOffset.left - edgeOffset.left;
                  translate.y = prevNode.edgeOffset.top - edgeOffset.top;
                }
                this.newIndex = index;
              }
            } else {
              if (index > this.index && sortingOffset.left + scrollDifference.left + offset.width >= edgeOffset.left) {
                translate.x = -(this.width + this.marginOffset.x);
                this.newIndex = index;
              } else if (
                index < this.index &&
                sortingOffset.left + scrollDifference.left <= edgeOffset.left + offset.width
              ) {
                translate.x = this.width + this.marginOffset.x;
                if (this.newIndex == null) {
                  this.newIndex = index;
                }
              }
            }
          } else if (this._axis.y) {
            if (index > this.index && sortingOffset.top + scrollDifference.top + offset.height >= edgeOffset.top) {
              translate.y = -(this.height + this.marginOffset.y);
              this.newIndex = index;
            } else if (
              index < this.index &&
              sortingOffset.top + scrollDifference.top <= edgeOffset.top + offset.height
            ) {
              translate.y = this.height + this.marginOffset.y;
              if (this.newIndex == null) {
                this.newIndex = index;
              }
            }
          }
          node.style['transform'] = `translate3d(${translate.x}px,${translate.y}px,0)`;
        }
        if (this.newIndex == null) {
          this.newIndex = this.index;
        }
      },
      autoscroll() {
        const translate = this.translate;
        const direction = {
          x: 0,
          y: 0,
        };
        const speed = {
          x: 1,
          y: 1,
        };
        const acceleration = {
          x: 10,
          y: 10,
        };
        if (translate.y >= this.maxTranslate.y - this.height / 2) {
          direction.y = 1; // Scroll Down
          speed.y = acceleration.y * Math.abs((this.maxTranslate.y - this.height / 2 - translate.y) / this.height);
        } else if (translate.x >= this.maxTranslate.x - this.width / 2) {
          direction.x = 1; // Scroll Right
          speed.x = acceleration.x * Math.abs((this.maxTranslate.x - this.width / 2 - translate.x) / this.width);
        } else if (translate.y <= this.minTranslate.y + this.height / 2) {
          direction.y = -1; // Scroll Up
          speed.y = acceleration.y * Math.abs((translate.y - this.height / 2 - this.minTranslate.y) / this.height);
        } else if (translate.x <= this.minTranslate.x + this.width / 2) {
          direction.x = -1; // Scroll Left
          speed.x = acceleration.x * Math.abs((translate.x - this.width / 2 - this.minTranslate.x) / this.width);
        }
        if (this.autoscrollInterval) {
          clearInterval(this.autoscrollInterval);
          this.autoscrollInterval = null;
        }
        if (direction.x !== 0 || direction.y !== 0) {
          this.autoscrollInterval = window.setInterval(() => {
            const offset = {
              left: 1 * speed.x * direction.x,
              top: 1 * speed.y * direction.y,
            };
            if (this.useWindowAsScrollContainer) {
              this._window.scrollBy(offset.left, offset.top);
            } else {
              this.scrollContainer.scrollTop += offset.top;
              this.scrollContainer.scrollLeft += offset.left;
            }
            this.translate.x += offset.left;
            this.translate.y += offset.top;
            this.animateNodes();
          }, 5);
        }
      },
    },
  });

  // Export Sortable Element Handle Directive
  const HandleDirective = {
    beforeMount(el) {
      el.sortableHandle = true;
    },
  };

  const SlickItem = vue.defineComponent({
    name: 'SlickItem',
    mixins: [ElementMixin],
    props: {
      tag: {
        type: String,
        default: 'div',
      },
    },
    render() {
      var _a, _b;
      return vue.h(this.tag, (_b = (_a = this.$slots).default) === null || _b === void 0 ? void 0 : _b.call(_a));
    },
  });

  const SlickList = vue.defineComponent({
    name: 'SlickList',
    mixins: [ContainerMixin],
    props: {
      tag: {
        type: String,
        default: 'div',
      },
      itemKey: {
        type: [String, Function],
        default: 'id',
      },
    },
    render() {
      var _a, _b;
      if (this.$slots.item) {
        return vue.h(
          this.tag,
          this.list.map((item, index) => {
            let key;
            if (item == null) {
              return;
            } else if (typeof this.itemKey === 'function') {
              key = this.itemKey(item);
            } else if (
              typeof item === 'object' &&
              hasOwnProperty(item, this.itemKey) &&
              typeof item[this.itemKey] == 'string'
            ) {
              key = item[this.itemKey];
            } else if (typeof item === 'string') {
              key = item;
            } else {
              throw new Error('Cannot find key for item, use the item-key prop and pass a function or string');
            }
            return vue.h(
              SlickItem,
              {
                key,
                index,
              },
              {
                default: () => {
                  var _a, _b;
                  return (_b = (_a = this.$slots).item) === null || _b === void 0
                    ? void 0
                    : _b.call(_a, { item, index });
                },
              }
            );
          })
        );
      }
      return vue.h(this.tag, (_b = (_a = this.$slots).default) === null || _b === void 0 ? void 0 : _b.call(_a));
    },
  });

  const DragHandle = vue.defineComponent({
    props: {
      tag: {
        type: String,
        default: 'span',
      },
    },
    mounted() {
      this.$el.sortableHandle = true;
    },
    render() {
      var _a, _b;
      return vue.h(this.tag, (_b = (_a = this.$slots).default) === null || _b === void 0 ? void 0 : _b.call(_a));
    },
  });

  let containerIDCounter = 1;
  /**
   * Always allow when dest === source
   * Defer to 'dest.accept()' if it is a function
   * Allow any group in the accept lists
   * Deny any group in the block list
   * Allow the same group by default, this can be overridden with the block prop
   */
  function canAcceptElement(dest, source, payload) {
    if (source.id === dest.id) return true;
    if (dest.block && dest.block.includes(source.group)) return false;
    if (typeof dest.accept === 'function') {
      return dest.accept({ dest, source, payload });
    }
    if (typeof dest.accept === 'boolean') {
      return dest.accept;
    }
    if (dest.accept && dest.accept.includes(source.group)) return true;
    if (dest.group === source.group) return true;
    return false;
  }
  function findClosestDest({ x, y }, refs, currentDest) {
    // Quickly check if we are within the bounds of the current destination
    if (isPointWithinRect({ x, y }, currentDest.container.getBoundingClientRect())) {
      return currentDest;
    }
    let closest = null;
    let minDistance = Infinity;
    for (let i = 0; i < refs.length; i++) {
      const ref = refs[i];
      const rect = ref.container.getBoundingClientRect();
      const isWithin = isPointWithinRect({ x, y }, rect);
      if (isWithin) {
        // If we are within another destination, stop here
        return ref;
      }
      const center = getRectCenter(rect);
      const distance = getDistance(x, y, center.x, center.y);
      if (distance < minDistance) {
        closest = ref;
        minDistance = distance;
      }
    }
    // Try to guess the closest destination
    return closest;
  }
  class SlicksortHub {
    constructor() {
      this.helper = null;
      this.ghost = null;
      this.refs = [];
      this.source = null;
      this.dest = null;
    }
    getId() {
      return '' + containerIDCounter++;
    }
    isSource({ id }) {
      var _a;
      return ((_a = this.source) === null || _a === void 0 ? void 0 : _a.id) === id;
    }
    getSource() {
      return this.source;
    }
    isDest({ id }) {
      var _a;
      return ((_a = this.dest) === null || _a === void 0 ? void 0 : _a.id) === id;
    }
    getDest() {
      return this.dest;
    }
    addContainer(ref) {
      this.refs.push(ref);
    }
    removeContainer(ref) {
      this.refs = this.refs.filter((c) => c.id !== ref.id);
    }
    sortStart(ref) {
      this.source = ref;
      this.dest = ref;
    }
    handleSortMove(e, payload) {
      var _a, _b, _c, _d;
      const dest = this.dest;
      const source = this.source;
      if (!dest || !source) return;
      const refs = this.refs;
      const pointer = getPointerOffset(e, 'client');
      const newDest = findClosestDest(pointer, refs, dest) || dest;
      if (dest.id !== newDest.id && canAcceptElement(newDest, source, payload)) {
        this.dest = newDest;
        dest.handleDragOut();
        newDest.handleDragIn(e, this.ghost, this.helper);
      }
      if (dest.id !== ((_a = this.source) === null || _a === void 0 ? void 0 : _a.id)) {
        (_b = this.dest) === null || _b === void 0 ? void 0 : _b.updatePosition(e);
        (_c = this.dest) === null || _c === void 0 ? void 0 : _c.animateNodes();
        (_d = this.dest) === null || _d === void 0 ? void 0 : _d.autoscroll();
      }
    }
    handleSortEnd() {
      var _a, _b, _c, _d;
      if (
        ((_a = this.source) === null || _a === void 0 ? void 0 : _a.id) ===
        ((_b = this.dest) === null || _b === void 0 ? void 0 : _b.id)
      )
        return;
      const payload = (_c = this.source) === null || _c === void 0 ? void 0 : _c.handleDropOut();
      (_d = this.dest) === null || _d === void 0 ? void 0 : _d.handleDropIn(payload);
      this.reset();
    }
    reset() {
      this.source = null;
      this.dest = null;
      this.helper = null;
      this.ghost = null;
    }
    cancel() {
      var _a;
      (_a = this.dest) === null || _a === void 0 ? void 0 : _a.handleDragEnd();
      this.reset();
    }
  }

  const plugin = {
    install(app) {
      app.directive('drag-handle', HandleDirective);
      app.provide('SlicksortHub', new SlicksortHub());
    },
  };

  exports.ContainerMixin = ContainerMixin;
  exports.DragHandle = DragHandle;
  exports.ElementMixin = ElementMixin;
  exports.HandleDirective = HandleDirective;
  exports.SlickItem = SlickItem;
  exports.SlickList = SlickList;
  exports.arrayMove = arrayMove;
  exports.plugin = plugin;

  Object.defineProperty(exports, '__esModule', { value: true });
});
