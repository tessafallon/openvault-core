$(function() {
	$('#facets h3 + ul').each(function() {
		if($(this).children().length > 5) {
			$(this).moreless();
		}
	});

});
$(document).ready(function() {
	attr = {left: '10', top: '3'};
	if( !($.browser.msie && $.browser.version == "7.0" ) ) {
		attr['expose'] = {color:'#000', opacity: 0.85};
	}
	$('.ovLightboxLink[rel]').overlay(attr).attr('href', '#');
/*	$('#search-simple h3').click(function() {
		$(this).toggleClass('closed').nextAll().slideToggle('normal', function() { });
	});
	$('#search-simple h3').addClass('closed').nextAll().hide();
*/
 $('#facets ul').each(function(){
   var ul = $(this);
   // find all ul's that don't have any span descendants with a class of "selected"
        // attach the toggle behavior to the h3 tag
   if(ul.children(':visible').not('.facet-selected').length == 0) {
	ul.parent().hide();
   }
});
   $('h3', '#facets').addClass('toggler');
   $('h3.toggler').live('click', function(){
        // toggle the next ul sibling
	that = $(this);
        $(this).nextAll().slideToggle('normal', function() { if(that != null) {  that.toggleClass('closed'); }  $(that).next('ul').less(); that = null; });
   });

$('#facets > div').each(function() { 
   $('.ui-more', this).html($('.ui-more', this).html() + ' (' + $('li:hidden', this).length + ')');
});

$('#search-simple h3').click();


	$('.citations h4').bind('click', function() {
		$(this).siblings('p').hide();
		$(this).next().show();
		$(this).siblings('.active').removeClass('active');
		$(this).addClass('active');
	});
	$('.citations h4:first').click();
});


$(function() {
	$('#selected-facets').after('<div id="facet-bar"></div>');
	c = $('#selected-facets').children();
	l = 0;
	c.each(function() {
		if(l == 0) { l = $('.hits', this).text(); }
		$('#facet-bar').append('<div class="'  + $(this).attr('class') + '" style="width: ' + (100*$('.hits', this).text() / l) + '%">' + $('.facet-name', this).text() + '</div>');
	});
	
	$('#facet-bar > div').bind('mouseenter', function() { $('.' + $(this).attr('class'), '#selected-facets').addClass('hover'); }).bind('mouseleave', function() { $('.hover').removeClass('hover'); });
	$('#selected-facets > li').bind('mouseenter', function() { $('.' + $(this).attr('class'), '#facet-bar').addClass('hover'); }).bind('mouseleave', function() { $('.hover').removeClass('hover'); });
	$('.facet li .facet-title:empty').parent().hide();

	if($('.facet ul.year').length > 0) {

	$('ul.year').children().tsort({order:"asc",attr:"class"}).each(function() { if($(this).attr('class').length > 4) { $(this).remove(); }});
	if($('ul.year').children().last().attr('class') == '2968') { $('ul.year').children().last().remove(); }
	$('ul.year').next().hide();
	
	first = parseInt($('ul.year').children('li').first().attr('class'));
	last = parseInt($('ul.year').children('li').last().attr('class'));
	if(!(isNaN(first) || isNaN(last))) { 
	if(first == last) { $('ul.year').parent().hide(); }
	$('ul.year').replaceWith('<div id="date_slider"></div>');
	date_slider_change = function(event, ui) { 
		if(ui.values[0] > ui.values[1]) { return false; } 
		$(this).trigger('slider:range', {begin: ui.values[0], end: ui.values[1]});
		$('.date-begin span').html(ui.values[0]); $('.date-end span').html(ui.values[1]); 
		base = location.href;
		if(base.indexOf('?') === -1) { base = base + "?"; } else { base = base + "&"; }
		$('.date-search').html('Narrow to ' + ui.values[0] + ' - ' + ui.values[1]).attr('href', base + "f[year][]=[" + ui.values[0] + " TO " + ui.values[1] + "]");  };
	date_slider_stop = function(event, ui) { }
	$('#date_slider').slider({values: [first, last], min: first, max: last, slide: date_slider_change, stop: date_slider_stop  });
	$('#date_slider').children().first().addClass('date-begin').append('<span />');
	$('#date_slider').children().last().addClass('date-end').append('<span />');
	$('#date_slider').slider_highlight({event: 'slider:range', selector: 'range', autohide: false});
	$('#date_slider').after('<a class="date-search">Narrow to</a>');
	$('#date_slider').before('<p class="hint">Adjust the start and end years by dragging the handles and then click on "narrow" below.</p>');
	date_slider_change(null, {values: [first, last]});
	}
}
});

(function($) {
	$.fn.more = function() {
		$(this).each(function() {
			$(this).children(':not(.facet-selected)').show();
			$(this).siblings('.ui-moreless').children('.ui-more').hide();
			$(this).siblings('.ui-moreless').children('.ui-less').show();
		});
	}
	$.fn.less = function() {
		$(this).each(function() {
			$(this).children(':not(.facet-selected)').slice(10).hide();
			$(this).siblings('.ui-moreless').children('.ui-more').show();
			$(this).siblings('.ui-moreless').children('.ui-less').hide();
		});
	}
	$.fn.moreless = function() {
		$(this).each(function() {
			if($(this).children(':not(.facet-selected)').length > 10) {
			$(this).after('<div class="ui-moreless"><a class="ui-more" href="" onclick="$(this).parent().siblings(\'ul\').more(); return false;">more</a> ' +
					'<a class="ui-less" href="" onclick="$(this).parent().siblings(\'ul\').less(); return false;">less</a></div>');
			$(this).less();
			}
		});
	}
})(jQuery);


$(function() {


	$('#browse select').change(function() {
/*		if($(this).parent().hasClass('hierarchy')) {
		var match = /hierarchy-(\d)/.exec($(this).parent().attr('class'));
		if(match.length > 1) {
			for(i=match[1]; i<=7; i++) {
				$('.hierarchy-' + i).hide();
			}
		}
		$(this).parent().show();
} else {
	$('.hierarchy').hide();
}
		console.log('.' + $(this).val().replace(/ -- /g, '_').replace(/ /, '-').toLowerCase());
		$('.' + $(this).val().replace(/ -- /g, '_').replace(/ /, '-').toLowerCase()).show();
	});*/
	if($(this).val() != '') {
		location.href = '/catalog/?f[dc.subject][]=' + $(this).val();
	}
});
});

$(function() {
	$('#documents h3.index_title').each(function() {
		i = $(this).closest('tr').find('.id');
		if(i.length == 0) { i = $(this).closest('.document').find('.id'); }
		if(i.length ==  0) { return; }
		$(this).prepend('<input type="checkbox" name="id[]" value="' + i.val() + '" />');
	});
//	$('.index-tools .clear').before('<a style="float: left;"  href="" onclick="bookmark_checked(); return false;">Save selected records</a>');
	$('#select_all').bind('click', function() { b = this.checked; $(':checkbox').each(function() { this.checked = b})});
});

function bookmark_checked() {
	var token =  $('input[name=authenticity_token]').val();
	if($('#documents input:checked').length == 0) {
		show_overlay('#save_no_records');
	} else {
		show_overlay('#save');
	}
	$('#documents input:checked').each(function() {
		$.post('/bookmarks', {'bookmark[document_id]': $(this).val(), 'bookmark[title]': $(this).closest('.document').find('h3 > a').text() , 'authenticity_token': token, 'comment': 'Bookmark this item'}, function(data) { $(this).closest('.document').find('#new_bookmark').hide(); });
		this.checked = false;
	}); 
	$('#select_all')[0].checked = false;
	
}

$(function() {
$('#documents.gallery .document').mouseenter(function() {
    if((200 + $(this).position().left + $(this).width()) > $(window).width()) {
       $(this).addClass('right');
    } else {
	$(this).removeClass('right');
    }
    offset = $('.thumbnail', this).height() - $('.thumbnail img', this).height();
    if(offset < $('.thumbnail', this).height()) {
    $('.detail-overlay', this).css('marginTop', offset -2  + "px");
    }
    $(this).addClass('hover');
}).bind('mouseleave', function() { $(this).removeClass('hover'); });
$('#infovis .document').live('mouseenter', function() {
    if((200 + $(this).position().left + $(this).width()) > $('#infovis').width()) {
       $(this).addClass('right');
    } else {
	$(this).removeClass('right');
    }
    offset = $('.thumbnail', this).height() - $('.thumbnail img', this).height();
    if(offset < $('.thumbnail', this).height()) {
    $('.detail-overlay', this).css('marginTop', offset -1  + "px");
    }
   $('.detail-overlay', this).addClass('visible');
}).live('mouseleave', function() { $('.detail-overlay', this).removeClass('visible'); });
});

$(function() {
	$('#tools-annotate-header').bind('click', function() {
		if($(this).hasClass('disabled')) { return; }
		$('.document-tools .active').removeClass('active');
		if($('.document .user-generated-content:visible').first().find('.new_comment:visible').length > 0) {
			$('.document').removeClass('ui-state-clip');
			$('.document').removeClass('ui-state-clip-annotate');
			$('.document .user-generated-content:visible').first().find('form').hide();
  			if($('#player_tools').length > 0) {
				$('input.clip_in').val('00:00:00').change(); $('input.clip_out').val($('input.duration').val()).change(); 
			}
		$('.document').trigger('openvault:state-change');
			return;
		}
		$('.document').addClass('ui-state-clip');
		$('.document').removeClass('ui-state-clip-tag').addClass('ui-state-clip-annotate');
		$(this).addClass('active');
  			if($('#player_tools').length > 0) {
		$('input.clip_in').val('00:00:00').change(); $('input.clip_out').val($('input.duration').val()).change(); 
}
		$('.document .user-generated-content:visible').first().find('form').hide();
		$('.document .user-generated-content:visible').first().find('.new_comment').show();
		$('.document').trigger('openvault:state-change');
	});
	$('#tools-tag-header').bind('click', function() {
		if($(this).hasClass('disabled')) { return; }
		$('.document-tools .active').removeClass('active');
		if($('.document .user-generated-content:visible').first().find('.new_tag:visible').length >  0) {
			$('.document').removeClass('ui-state-clip');
			$('.document').removeClass('ui-state-clip-tag');
			$('.document .user-generated-content:visible').first().find('form').hide();
  			if($('#player_tools').length > 0) {
				$('input.clip_in').val('00:00:00').change(); $('input.clip_out').val($('input.duration').val()).change(); 
			}
		$('.document').trigger('openvault:state-change');
			return;
		}
		$('.document').addClass('ui-state-clip');
		$('.document').addClass('ui-state-clip-tag').removeClass('ui-state-clip-annotate');
  			if($('#player_tools').length > 0) {
		$('input.clip_in').val('00:00:00').change(); $('input.clip_out').val($('input.duration').val()).change(); 
}
		$(this).addClass('active');
		$('.document .user-generated-content:visible').first().find('form').hide();
		$('.document .user-generated-content:visible').first().find('.new_tag').show();
		$('.document').trigger('openvault:state-change');
	});
		
	$('.user-generated-content form .close').bind('click', hide_ugc_forms);
});

function hide_ugc_forms() {
		$('.document-tools .active').removeClass('active');
			$('.document').removeClass('ui-state-clip');
		$('.document').removeClass('ui-state-clip-tag').removeClass('ui-state-clip-annotate');
			$('.document .user-generated-content:visible').first().find('form').hide();
  			if($('#player_tools').length > 0) {
				$('input.clip_in').val('00:00:00').change(); $('input.clip_out').val($('input.duration').val()).change(); 
			}
		$('.document').trigger('openvault:state-change');
}


$(function() {
	$('input[title]').each(function() {
		if($(this).val() === '' || $(this).val() === $(this).attr('title')) {
			$(this).val($(this).attr('title')).addClass('default');
		}

		$(this).focus(function() {
			if($(this).val() === $(this).attr('title')) {
				$(this).val('').removeClass('default');
			}
		});

		$(this).blur(function() {
			if($(this).val() === '' || $(this).val() === $(this).attr('title')) {
				$(this).val($(this).attr('title')).addClass('default');
			}
		});
		var that = this;
		$(this).closest('form').bind('submit', function() { if($(that).val() === $(that).attr('title')) { $(that).focus(); return false; } });
	});
	$('#user_session_login').bind('focus', function() {
		if($('#user_session_login').val() == '' || $('#user_session_login').val() == $('#user_session_login').attr('title')) {
			$('#user_session_password').val('');
		}
	}).bind('blur', function() { if($('#user_session_login').val() == '' || $('#user_session_login').val() == $('#user_session_login').attr('title')) { $('#user_session_password').blur(); }});
});

$(function() {
	$('.document-tools a[title]').tooltip('#tooltip').dynamic();
	$('.show-tools a[title]').tooltip({ tip: '#tooltip', position: 'center right'}).dynamic();
});


$(function() {
	$('.comment').live('mouseover mouseout', function(event) {
		if(event.type == 'mouseover') {
			if(!($(this).attr('smil:begin') && $(this).attr('smil:end'))) {
				return;
			}
			d = {begin: $.media.convertTimestamp($(this).attr('smil:begin')), end: $.media.convertTimestamp($(this).attr('smil:end'))}
			$('.scrubbar').trigger('slider:highlight', d);
			$('.playbar').addClass('hover');
		} else {
			$('.scrubbar').trigger('slider:highlight');
			$('.playbar').removeClass('hover');
		}
});
	$('.comment .comment-title').live('click', function() { $(this).parent().toggleClass('comment-open'); return false;});
	
});

	function get_clip_metadata(frm) {
	/*	if($('#comment_metadata', frm).length == 0) { 
			return;
		}

		el = $(frm).closest('fedora-object');
		if($('.clip_metadata', el).length == 0) {
			return;
		}	*/
		json = {};

		$('.clip_metadata input').each(function() {
			json[$(this).attr('name')] = $(this).val();
		});
		return json;
	};


$(function() { 
	$(window).bind('resize', function() { resize_document_children(); });
	resize_document_children();
});

function resize_document_children() {
	width = $('#document').width() - $('.info-fedora_wgbh-video').width() - 17
	$('.info-fedora_wgbh-log').width(Math.min(width, 500));	
}

$(function() {
	if($('#tag_name').length > 0) {
    $('#tag_name').autocomplete('/proxy/lcsh', {parse: opensearch});
	}
});
    function opensearch(data) {
        data = eval(data);
        var parsed = [];

        for (var i=0; i < data[1].length; i++) {
            var row = jQuery.trim(data[1][i]);
            if (row) {
                parsed[parsed.length] = {
                    data: [row],
                    value: row,
                    result: row
                };
            }
        }
        return parsed;
    }

function show_overlay(selector) {
	attr = {left: '10', top: '3', api: true};
	if( !($.browser.msie && $.browser.version == "7.0" ) ) {
		attr['expose'] = {color:'#000', opacity: 0.85};
	}
	$(selector).overlay(attr).load();
}

function search_transcript(f, text, val) {
	if(val == 'Search transcript:') { return; }
	highlight(f, text,val);
	count = $('.highlight', text).length;
	
	feedback = count;
	feedback += " result";
	if(count != 1) { 
		feedback += "s";
	}
	feedback += " found";
	$(f).siblings('.transcript-search-feedback').html(feedback);
}

$(function() {
$('#facets input[type="radio"]').bind('click', function() {  location.href = $(this).next().attr('href'); });

});

$(function() {
  $('#comment_list .view-all').live('click', function() { $(this).closest('.pagination').siblings('.comments').find('.comment').show(); return false;});
  $('#comment_list .sort_by').live('change', function() { 
	opts = {}
	if($(this).val() == '.comment-created-iso8601') { opts['order'] = 'desc'; }
	$(this).closest('.pagination').siblings('.comments').find('.comment').tsort($(this).val(), opts).hide().slice(0,5).show();
  });
});

$(function() {
	$('.pagination .current').bind('click', function() { if($(this).next('input').length > 0) { $(this).hide(); $(this).next('input').show().focus().select(); return; }; that = this; $(this).hide(); $('<input name="page" class="current" type="text" />').insertAfter(this).val($(this).html()).focus().select().bind('blur', function() { $(this).hide(); $(that).show(); }); });
	$('.page_links .next_page').each(function() {
		$('<span> of ' + $(this).prev().text() + '</span>').insertBefore(this); 
	});

	if($('.viz a').length > 0) {
	$('.viz a').popupWindow({height: 588, width: 662, centerScreen: 1});
	}

	$('.viz-show h3 a').live('click', function() { window.opener.location.href = $(this).attr('href'); window.close(); return false;  });
});
