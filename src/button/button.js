/**
 * @author nttdocomo
 */
define(function(require) {
	var Base = require('../view/base'),
	Menu = require('../menu/menu'),
	MenuManager = require('../menu/manager'),
	ButtonManager = require('./manager');
	return Base.extend({
		/*
	     * @property {Boolean}
	     * `true` in this class to identify an object as an instantiated Button, or subclass thereof.
	     */
	    isButton: true,
	    /**
	     * @cfg {String} clickEvent
	     * The DOM event that will fire the handler of the button. This can be any valid event name (dblclick, contextmenu).
	     */
	    clickEvent: 'click',
		/**
		 * @property {Boolean} disabled
		 * True if this button is disabled.
		 * @readonly
		 */
		disabled : false,
		/**
		 * @cfg {Boolean} [enableToggle=false]
		 * True to enable pressed/not pressed toggling.
		 */
		enableToggle : false,
		/**
		 * @property {Boolean} pressed
		 * True if this button is pressed (only if enableToggle = true).
		 * @readonly
		 */
		pressed : false,

		tpl : '<%=text%><%if(menu){%> <span class="caret"></span><%}%>',
		pressedCls : 'active',
		tagName : 'button',
		className : 'btn btn-default',
		menuAlign: {
			"my" : "left top",
			"at" : "left bottom",
			"collision" : "none none"
		},
		events : {
			'mousedown' : 'onMouseDown'
		},

	    doPreventDefault: function(e) {
	        if (e && (this.preventDefault || (this.disabled && this.getHref()))) {
	            e.preventDefault();
	        }
	    },

	    /**
	     * @private
	     * If there is a configured href for this Button, returns the href with parameters appended.
	     * @return {String/Boolean} The href string with parameters appended.
	     */
	    getHref: function() {
	        var me = this,
	            href = me.href;

	        //return href ? Ext.urlAppend(href, Ext.Object.toQueryString(Ext.apply({}, me.params, me.baseParams))) : false;
	        return href;
	    },
		getTplData:function(){
			return $.extend({
				text:this.text || '',
				menu:!_.isUndefined(this.menu)
			},Base.prototype.getTplData.apply(this,arguments))
		},
		doToggle : function(e) {
			var me = this;
			if (me.enableToggle && (me.allowDepress !== false || !me.pressed)) {
				me.toggle($(e.target));
			}
		},

		fireHandler : function(e) {
			var me = this, handler = me.handler;

			if (me.trigger('click', me, e) !== false) {
				if (handler) {
					handler.call(me, e);
				}
				//me.blur();
			}
		},

	    /**
	     * Returns true if the button has a menu and it is visible
	     * @return {Boolean}
	     */
	    hasVisibleMenu: function() {
	        var menu = this.menu;
	        return menu && menu.rendered && menu.isVisible();
	    },

		maybeShowMenu : function() {
			var me = this;
			if (me.menu && !me.hasVisibleMenu() && !me.ignoreNextClick) {
				me.showMenu();
			}
		},

	    // @private
	    onClick: function(e) {
	        var me = this;
	        me.doPreventDefault(e);

	        // Can be triggered by ENTER or SPACE keydown events which set the button property.
	        // Only veto event handling if it's a mouse event with an alternative button.
	        // Checking e.button for a truthy value (instead of != 0) also allows touch events
	        // (tap) to continue, as they do not have a button property defined.
	        if (e.type !== 'keydown' && e.button) {
	            return;
	        }
	        if (!me.disabled) {
	            me.doToggle(e);
	            me.maybeShowMenu();
	            me.fireHandler(e);
	        }
	    },
		/*onClick : function(e) {
			var me = this;
			if (!me.disabled) {
				me.doToggle(e);
				me.maybeShowMenu();
				me.fireHandler(e);
			}
		},*/

		// private
		onMouseDown : function(e) {
			var me = this, target = $(e.target);
			if (!me.disabled) {
				target.addClass(me.pressedCls);
				var onMouseUp = _.bind(function(e) {
					var me = this;
					if (!this.pressed) {
						target.removeClass(me.pressedCls);
					}
					this.doc.off('mouseup', onMouseUp);
				}, me)
				me.doc.on('mouseup', onMouseUp);
			}
		},

	    beforeRender: function() {
			if (this.disabled) {
	            this.$el.attr('disabled',true);
	        }

			if (this.pressed) {
	            this.$el.addClass(this.pressedCls);
	        }
	    },
		render:function(){
			this.beforeRender()
			Base.prototype.render.apply(this,arguments);
			ButtonManager.register(this);
		},

	    /**
	     * Shows this button's menu (if it has one)
	     */
	    showMenu: function(/* private */ fromEvent) {
	        var me = this,
	            menu = me.menu;
	        if (menu) {
	            delete me.menu;
	            me.setMenu(menu);
	            menu = me.menu;
	        }

	        if (me.rendered) {
	            /*if (me.tooltip && Ext.quickTipsActive && me.getTipAttr() != 'title') {
	                Ext.tip.QuickTipManager.getQuickTip().cancelShow(me.el);
	            }*/
	            if (menu.isVisible()) {
	                menu.hide();
	            }

	            if (!fromEvent || me.showEmptyMenu || menu.items.getCount() > 0) {
	                menu.showBy(me, me.menuAlign);
	            }
	        }
	        return me;
	    },
		/**
	     * Set a child menu for this item. See the {@link #cfg-menu} configuration.
	     * @param {Ext.menu.Menu/Object} menu A menu, or menu configuration. null may be
	     * passed to remove the menu.
	     * @param {Boolean} [destroyMenu] True to destroy any existing menu. False to
	     * prevent destruction. If not specified, the {@link #destroyMenu} configuration
	     * will be used.
	     */
	    setMenu: function(menu, destroyMenu) {
	        var me = this,
	            oldMenu = me.menu;
	            
	        if (oldMenu) {
	            delete oldMenu.parentMenu;
	            delete oldMenu.ownerItem;
	            
	            if (destroyMenu === true || (destroyMenu !== false && me.destroyMenu)) {
	                //Ext.destroy(oldMenu);
	            }
	        }
	        if (menu) {
	            me.menu = Manager.get(menu);
	            me.menu.ownerItem = me;
	        } else {
	            me.menu = null;
	        }
	    },

		/**
		 * If a state it passed, it becomes the pressed state otherwise the current state is toggled.
		 * @param {Boolean} [state] Force a particular state
		 * @param {Boolean} [suppressEvent=false] True to stop events being fired when calling this method.
		 * @return {Ext.button.Button} this
		 */
		toggle : function(state, suppressEvent) {
			var me = this;
			state = state === undefined ? !me.pressed : !!state;
			if (state !== me.pressed) {
				me.$el[state ? 'addClass': 'removeClass'](me.pressedCls);
				me.pressed = state;
				if (!suppressEvent) {
					me.trigger('toggle', me, state);
					me.toggleHandler && me.toggleHandler.apply(me, [state]);
				}
			}
			return me;
		},
		delegateEvents:function(events){
			events = events || {};
			events[this.clickEvent] = 'onClick';
			Base.prototype.delegateEvents.call(this,events)
		}
	})
})
