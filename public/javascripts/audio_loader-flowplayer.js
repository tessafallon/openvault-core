(function($) {
	$.fn.media = function(options) {
		options = $.extend({}, $.fn.media.options, options);
try{ 
pageTracker._trackPageview(location.href + "/" + options.src.split('/').pop());
} catch(err) {} 
		$('.placeholder',  this).replaceWith('<div id="player" style="width: 320px; height: 240px;"><div id="video" style="width: 320px; height: 240px;"></div><div class="playbar"><div class="playbutton">Play <span class="play-symbol">&#x25b6;</span></div><div class="pausebutton">Pause</div><div class="scrubbar"></div></div></div>');
		flowplayer("video", { src: "/swf/flowplayer-3.1.5.swf", version: [9, 115], onFail: $.fn.media.flash_fail,  wmode: 'transparent', bgcolor: '#000000' }, 
			{key: '#$1d73c2f04c85077c98a',
			clip: 
				{
				url: options.src,
				 autoPlay: options.autostart, 
				 autoBuffering: options.autostart,
				// start: options.start,
				provider: 'lighttpd'
		//		provider: 'audio'
				},
			plugins: {
				lighttpd: { url: '/swf/flowplayer.pseudostreaming-3.1.3.swf'/*, queryString: escape('?target=${start}')*/},
				audio: { url: '/swf/flowplayer.audio-3.1.2.swf'  },
				//content: { url: '/swf/flowplayer.content-3.1.0.swf', top: 0, left: 0, width: 320, height: 240, borderRadius: 0, backgroundImage: null, html: '<img src="http://openvault.wgbh.org/fedora/get/asset:7454d2619f200f030a013f3d254fca5273ebee36/sdef:THUMBNAIL/get" />'},
				controls: null 
			},
			canvas: { backgroundImage: options.backgroundImage },
	//		onLoad: $.fn.media.handler_begin,
			onMetaData: $.fn.media.handler_init,
			onStart: $.fn.media.handler_play,
			onResume: $.fn.media.handler_play,
			onPause: $.fn.media.handler_pause,
			onStop: $.fn.media.handler_ended,
			onFinish: $.fn.media.handler_ended

			
		});
		$('#player')[0].options = options;
		/*var str = QT_GenerateOBJECTText_XHTML(options.src, options.width, options.height, '',
			'autostart', options.autostart,
						'postdomevents', 'true',
						'EnableJavaScript', 'true',
						'bgcolor', options.bgcolor,
						'controller', options.controller,
						'SCALE', 'aspect',
						'obj#ID', 'videoplayer',
						'emb#ID', 'video_embed',
						'obj#NAME', 'video',
						'emb#NAME', 'videoplayer',
						'showlogo',  'true',
						'LOOP', 'false'
					);
		$('.placeholder',  this).replaceWith(str);	*/
/*
		var _m = $(this);
 
		_m.bind('qt_begin', {that: _m, options: options}, $.fn.media.handler);
		_m.bind('qt_canplay', {that: _m, options: options}, $.fn.media.handler);
		_m.bind('qt_canplaythrough', {that: _m, options: options}, $.fn.media.handler);
		_m.bind('qt_durationchange', {that: _m, options: options}, $.fn.media.handler);
		_m.bind('qt_error', {that: _m, options: options}, $.fn.media.handler);
		_m.bind('qt_ended', {that: _m, options: options}, $.fn.media.handler);
		_m.bind('qt_play', {that: _m, options: options}, $.fn.media.handler);
		_m.bind('qt_pause', {that: _m, options: options}, $.fn.media.handler);
		_m.bind('qt_timechanged', {that: _m, options: options}, $.fn.media.handler);
		_m.bind('qt_load', {that: _m, options: options}, $.fn.media.handler);
		_m.bind('qt_progress', {that: _m, options: options}, $.fn.media.handler);
		_m.bind('qt_waiting', {that: _m, options: options}, $.fn.media.handler);
		_m.bind('qt_stalled', {that: _m, options: options}, $.fn.media.handler);*/
	},
	$.fn.media.flash_fail = function() {
		$('#video').empty().append('<h3>Error</h3><p class="error">Flash version 9.115 or greater is required to view videos on Open Vault; your version is ' + this.getVersion() + '. Download the latest  version from <a href="http://www.adobe.com/go/getflashplayer">here</a>.</p>');
	},
	$.fn.media.handler_init = function(e, o) {
	//	$f('video').getControls().hide();
		media_init($('#player'), 'init');
		$('#player').parent().removeClass($.fn.media.class_list).addClass('qt-begin');
				if($('#player')[0].options.start != "undefined" && $('#player')[0].options.start != 0) {
					$f('video').seek($('#player')[0].options.start);
				}
		return true;
	},
	$.fn.media.handler_play = function(e, o) {
		$('#player').parent().removeClass($.fn.media.class_list).addClass('qt-play');
		return true;
	},
	$.fn.media.handler_pause = function(e, o) {
		$('#player').parent().removeClass($.fn.media.class_list).addClass('qt-pause');
		return true;
	},
	$.fn.media.handler_ended = function(e, o) {
		$('#player').parent().removeClass($.fn.media.class_list).addClass('qt-ended');
		return true;
	},
	$.fn.media.handler = function(e) {
		if (typeof e.data.options[e.type] != "undefined") {
			e.data.options[e.type](e.data.that, e);
		}
		class_list = "qt-play qt-pause qt-ended qt-begin qt-error";
		switch(e.type) {
			case 'qt_begin':
				$(e.data.that).removeClass(class_list).addClass('qt-begin');
				if(e.data.options.start != "undefined") {
					el = $('embed', e.data.that)[0];
					el.SetStartTime(e.data.options.start * el.GetTimeScale());
					el.Stop(); el.Play();
					//el.SetTime(e.data.options.start * el.GetTimeScale());
				}
				break;
			case 'qt_ended':
				$(e.data.that).removeClass(class_list).addClass('qt-ended');
				break;
			case 'qt_error':
				$(e.data.that).removeClass(class_list).addClass('qt-error');
				break;
			case 'qt_play':
				if(e.data.options.start != "undefined") { el = $('embed', e.data.that)[0]; el.SetStartTime(0); }
				$(e.data.that).removeClass(class_list).addClass('qt-play');
				break;
			case 'qt_pause':
				$(e.data.that).removeClass(class_list).addClass('qt-pause');
				break;
		
		}
	},
	$.fn.media.options = {'autostart': true, 'bgcolor': 'black', 'controller': false, 'start': 0};
	$.fn.media.class_list = "qt-play qt-pause qt-ended qt-begin qt-error";
})(jQuery);
