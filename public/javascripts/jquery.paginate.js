/**
 * jQuery UI paginatio plugin
 * Copyright (c) 2009 Christopher Beer
 * Date: 04/15/09
 *
 * @projectDescription Simple jQuery pagination plugin
 *
 * @author Chris Beer - chris@ratherinsane.com
 * @version 0.1
 *
 * @example $('ui.dropdown').paginate( );
 *
 * Depends:
 *	ui.core.js
 */

(function($) {
	$.widget("ui.paginate", {
		_init: function() {
			var self = this, o = this.options;
			this.$container = $(this.element);
			this.nav();
			this.page(0);
		},
		page: function(i) {
			o = this.options;
			max = Math.ceil(this.length() / o.itemsPerPage) - 1;
			min = 0;
			this.pg = Math.max(Math.min(i, max), min);
			if (this.pg == max) {
				o.pager.find("." + o.next).addClass('disabled');
			} else {
				o.pager.find("." + o.next).removeClass('disabled');
			}
			if (this.pg == min) {
				o.pager.find("." + o.prev).addClass('disabled');
			} else {
				o.pager.find("." + o.prev).removeClass('disabled');
			}
			this.$container.children().hide().slice(this.pg * o.itemsPerPage,
					(this.pg + 1) * o.itemsPerPage).show();
			o.callback(this);
			return this.pg;
		},
		next: function() {
			return this.page(this.pg + 1);
		},
		prev: function() {
			return this.page(this.pg - 1);
		},
		nav: function() {
			var self = this, o = this.options;
			if (o.pager === null) {
				o.pager = $('<div class="pager"></div>');
				o.pager.insertBefore(this.element);

			var pagerNav = $('<a class="' + o.prev
					+ '" href="#">&laquo; Prev</a><a class="' + o.next
					+ '" href="#">Next &raquo;</a>');

			$(o.pager).append(pagerNav);
			}

			nextbut = o.pager.find("." + o.next);

			prevbut = o.pager.find("." + o.prev);

			nextbut.click( function() {
				self.next();
				return false;
			});

			prevbut.click( function() {
				self.prev();
				return false;
			});
		},
		length: function() {
			return this.$container.children().length;
		},
		itemsPerPage: function(i) {
			if (i != undefined) {
				this.options.itemsPerPage = i;
			}
			return this.options.itemsPerPage;
		}
	});

	$.extend($.ui.paginate, {
		getters : 'nav length',
		defaults : {
			itemsPerPage : 5,
			pager : null,
			prev : 'prev',
			next : 'next',
			callback: function(ctx) { }
		}
	});

})(jQuery);

