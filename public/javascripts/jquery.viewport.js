(function($) {
	$.fn.viewport = function(options) {
		return this.each(function() {
			$this = $(this);
			$this.bind('mousedown', function(e) { 
				$(this).css('cursor', 'move');
				s_x = e.pageX;
				s_y = e.pageY;
			})
				 .bind('mouseup', function() { $(this).css('cursor', 'default');})
				 .bind('mouseout', function() { $(this).css('cursor', 'default'); })
				 .bind('mousemove', function(e) { 
					 $this = $(this); 
					 if($this.css('cursor') == 'move') {
						 new_m_x = e.pageX; new_m_y = e.pageY;
					      change_m_x = s_x - new_m_x;
					      change_m_y = s_y - new_m_y;
					      s_x = new_m_x; s_y = new_m_y;
						 $.fn.viewport.shift($this, change_m_x, change_m_y);
					 }
				 });
		});		
	}
	$.fn.viewport.defaults = {
			
	};
	$.fn.viewport.shift = function(obj, x, y) {
		$(obj).find('.inner').each(function() { 	
			$this = $(this);
		   /* var left = Array.max([Array.min([parseInt($this.css('left')) + x, 2000]), 0]);
		    var top  = Array.max([Array.min([parseInt($this.css('top')) + y, 2000 ]), 0]);*/
			var left = parseInt($this.css('left')) - x;
			var top = parseInt($this.css('top')) - y;
		    $this.css({left: left+'px', top: top+'px'});
		});
	}
	$.fn.viewport.move = function(obj, x, y) {
	    $(obj).find('.inner').css({left:'-'+x+'px', top:'-'+y+'px'});		
	}
})(jQuery);

var s_x = 0; var s_y = 0;
Array.max = function( array ){
    return Math.max.apply( Math, array );
};
Array.min = function( array ){
    return Math.min.apply( Math, array );
};