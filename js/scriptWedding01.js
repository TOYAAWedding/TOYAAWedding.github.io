// Common javascript helper functions

function format_timestamp(date, options, locale){
	// Formats a timestamp so that dates are listed in historical order
	// e.g. 2:56 PM, Wednesday, June 15, or February 23, 1995
	var $ = jQuery;
	locale = $.extend(true, {
		  monthNamesShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
		  dayNamesShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
		  dayNames: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
		  'Today': 'Today',
	}, locale);

	options = $.extend({
		showToday: false,		// Show today dates as 'Today, <time>'
		timeOrDate: true,		// Show only either time or date
		showWeekdays: true,		// Show weekday name
	}, options);
	
	// Get reference date (now)
	var now = new Date();
	var _now = now.getTime();
	var _date = date.getTime();
	var _sfm = (now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds()) * 1000;		// Calculate seconds from midnight
	var _sfy = _now - new Date(now.getFullYear() + '-01-01T00:00:00Z').getTime();				// Calculate seconds from year-start

	var fmt;

	// N.B. If date in future, display in full
	if (_date <= _now && _date > _now - _sfm){
		// Date is within the time since midnight
		fmt = 'day';
	} else if (_date <= _now && _date > _now - _sfm - (6 * 24 * 3600 * 1000)){
		// Date is within the last week (6 days to avoid confusion)
		fmt = 'week';
	} else if (_date <= _now && _date > _now - _sfy){
		// Date is within the current year
		fmt = 'cur_year';
	}
	
	function _getTime(date){
		// Returns time
		var hours = date.getHours(), minutes = date.getMinutes();
		var ampm = 'AM';
		if (hours > 11){ampm = 'PM'; if (hours > 12){hours -= 12;}}
		if (minutes < 10){minutes = '0' + minutes;}
		return hours + ':' + minutes + ' ' + ampm;
	}
	switch (fmt){
		case 'day':
			return (options.showToday ? locale['Today'] + ', ' : '') + _getTime(date);
		case 'week':
			return locale['dayNames'][date.getDay()];
		case 'cur_year':
			return (options['showWeekdays'] ? locale['dayNamesShort'][date.getDay()] + ', ' : '') + locale['monthNamesShort'][date.getMonth()] + ' ' + date.getDate() + (options.timeOrDate ? '' : ', ' + _getTime(date));
		default:
			return (options['showWeekdays'] ? locale['dayNamesShort'][date.getDay()] + ', ' : '') + locale['monthNamesShort'][date.getMonth()] + ' ' + date.getDate() + ' ' + date.getFullYear() + (options.timeOrDate ? '' : ', ' + _getTime(date));
	}
}
if (jQuery){
	jQuery.fn.format_timestamp = function(options){
		// Formats a timestamp from an html element
		var $ = jQuery, locale, _options = {};
		if (window.Drupal && Drupal.settings.weddingappdata && Drupal.settings.weddingappdata.lang){
			locale = Drupal.settings.weddingappdata.lang['date'];
		}
		if (window.lang){
			locale = lang['date'];
		}
		if ($(this).attr('format_timestamp')){_options = $.parseJSON($(this).attr('format_timestamp'));}

		var date = new Date($(this).html());
		$(this).html(format_timestamp(date, $.extend({}, _options, options), locale));
	}
}

function object_to_sorted_array(object, positionKey){
	// Takes object (which does not preserve order reliably in all browsers) and returns array ordered by internal object key
	var $ = jQuery;
	var arr = $.map(object, function(v){return v;});
	arr.sort(function (a, b) {return a[positionKey] - b[positionKey];});
	return arr;
}

function ucfirst(str,force){
  str=force ? str.toLowerCase() : str;
  return str.replace(/(\b)([a-zA-Z])/,
           function(firstLetter){
              return   firstLetter.toUpperCase();
           });
}

function showToast(text, options){
	// Shows toast notification message
	var $ = jQuery;
	options = $.extend({
		duration: 1500,
		delay: 1000,
		animlength: 500,
		opacity: 0.95,
		style: "toastmessage",
	}, options);
	// Allow a global override to disable toast messages system-wide
	if (window.url_params && url_params['hidetoasts'] == 'true'){return;}
	$('<div id="'+options.style+'" style="opacity:0;">').appendTo('body').html(text);
	setTimeout(function(){
		$('#' + options.style).css('opacity', options.opacity);
		setTimeout(function(){$('#' + options.style).css('opacity', 0);}, options.duration + options.animlength);
		setTimeout(function(){$('#' + options.style).remove();}, options.duration + options.animlength * 2);
	}, options.delay);
}

var decodeHtmlEntity = function(str) {
	return str.replace(/&#(\d+);/g, function(match, dec) {
		return String.fromCharCode(dec);
	});
};;
var null_ptr = "appy-couple-main_1";
;
jQuery(document.body).ready(function(){
	var $ = jQuery;
	
	// Setup tooltips
	weddingapp_apply_tooltips();
	
	// Set up app previews
	$(".inset").load(function(){
		weddingapp_update_dynamic_app_preview_content_onload_helper(this);
		$(this).next().fadeOut(1250);
		if (Drupal.settings.weddingappdata.dynamic_preview_urls != undefined && Drupal.settings.weddingappdata.dynamic_preview_urls.length > 1 && $('#iphonePreview #iphonePreviewPrevious').length == 0){
			var index = 0;
			var $closebutton = $('<div id="iphonePreviewClose"></div>');
			$('#iphonePreview').append($closebutton);
			var $prevbutton = $('<div id="iphonePreviewPrevious"></div>');
			$('#iphonePreview').append($prevbutton);
			var $nextbutton = $('<div id="iphonePreviewNext"></div>');
			$('#iphonePreview').append($nextbutton);
			var $exampletxt = $('<div id="example">'+ Drupal.t('See Sample Screen') +'</div>');
			$('#iphonePreview').append($exampletxt);
			$prevbutton.click(function(){
				index -= 1;
				if (index < 0){index = Drupal.settings.weddingappdata.dynamic_preview_urls.length - 1;}
				$('#iphonePreview .inset').attr('src', Drupal.settings.weddingappdata.dynamic_preview_urls[index]);
				setTimeout(function(){$('#iphonePreview .inset').next().fadeIn(1250);}, 200);
				if (index == 0){$('#iphonePreview #iphonePreviewClose').hide();}else{$('#iphonePreview #iphonePreviewClose').show();}
			});
			$nextbutton.click(function(){
				index += 1;
				if (index == Drupal.settings.weddingappdata.dynamic_preview_urls.length){index = 0;}
				$('#iphonePreview .inset').attr('src', Drupal.settings.weddingappdata.dynamic_preview_urls[index]);
				setTimeout(function(){$('#iphonePreview .inset').next().fadeIn(1250);}, 200);
				if (index == 0){$('#iphonePreview #iphonePreviewClose').hide();}else{$('#iphonePreview #iphonePreviewClose').show();}
			});
			$closebutton.click(function(){
				index = 0;
				$('#iphonePreview .inset').attr('src', Drupal.settings.weddingappdata.dynamic_preview_urls[index]);
				setTimeout(function(){$('#iphonePreview .inset').next().fadeIn(1250);}, 200);
				$('#iphonePreview #iphonePreviewClose').hide();
			});
			$('#iphonePreviewPrevious, #iphonePreviewNext').hover(function(){
				$exampletxt.fadeIn(650);
			}, function(){
				$exampletxt.fadeOut(250);
			});

		}
	});
	
	function onResize(){
		// Show / hide the sidebar region (dependent on the portal theme being used)
		if (window.innerWidth < 1280){
			$('#sidebar-second').hide();
			$(document.body).removeClass('sidebar-second');
		} else {
			if ($('#sidebar-second').length > 0){
				$(document.body).addClass('sidebar-second');
			}
			$('#sidebar-second').show();
		}
		// Show / hide the phone preview
		if (window.innerWidth < 1024){
			$('.preview-pane').hide();
		} else {
			$('.preview-pane').css('display', 'inline-block');
		}
	}
	$(window).resize(onResize);
	onResize();
	
	// Apply default captions handler
	weddingapp_apply_inner_caption($('input.innerCaption,textarea.innerCaption'));
});
// Globally available javascript functions
function weddingapp_apply_inner_caption(elems){
	var $ = jQuery;
	var $elems = $(elems).hasClass('innerCaption') ? $(elems) : $(".innerCaption", elems);
	var formhandler_innercaption_submit_record = {};	// Allows us to bind to each contained form and do so once only
	if (Drupal.ajax) {
		function bind_ajax_beforeSerialize(){
			$.each(Drupal.ajax, function(k,v){
				// FixMe: This does not allow for function overrides occuring elsewhere
				Drupal.ajax[k].options.beforeSerialize = function(element, options){
					// Remove innercaptions on drupal AJAX functions
					$('input.innerCaption,textarea.innerCaption', element).each(function(){
						if ($(this).attr('type') == 'password'){$(this).next().remove();}
						if (decodeHtmlEntity(unescape($(this).attr('originalText'))) == $(this).val()){
							$(this).val('');
						};
					});
					Drupal.ajax.prototype.beforeSerialize(element, options);
				};
				Drupal.ajax[k].options.beforeSubmit = function(form_values, element_settings, options){
					weddingapp_apply_inner_caption(element_settings);	// Restore innerCaption values for elements not being replaced
					Drupal.ajax.prototype.beforeSubmit.apply(this, form_values, element_settings, options);
				};
			});
		}
	}
	
	// Bind to ajaxComplete trigger
	$(document).unbind('ajaxComplete.innerCaption').bind('ajaxComplete.innerCaption', function(e, request, options){
		weddingapp_apply_inner_caption(e.target);
	});

	if (Drupal.ajax) {
		// Bind to auxiliary ajax triggers
		$.each(Drupal.ajax, function(k, v){
			if (v['event'] == 'change'){	// Expand scope here to more event triggers
				// FixMe: This does not allow for function overrides occuring elsewhere
				Drupal.ajax[k].success = function(response, status){
					Drupal.ajax.prototype.success.apply(this, [response, status]);
					var $selection = $();
					$.each(response, function(kk, vv){
						if ('selector' in vv && vv['selector'] != 'head'){
							$selection = $selection.add($(vv['selector']));
						};
					});
					weddingapp_apply_inner_caption($selection);
				};
			}
		});
	}
	
	// Bind to element focus events
	$elems.focusin(function(){
		// On focus in, we clear any default values
		if (decodeHtmlEntity(unescape($(this).attr('originalText'))) == $(this).val()){
			$(this).attr('originalText', $(this).val());$(this).val('');
		}
		$(this).addClass('onTyping');
	}).focusout(function(){
		// On focus out we return the default value if left blank
		if (!$(this).val()){
			$(this).val(decodeHtmlEntity(unescape($(this).attr('originalText'))));
			$(this).removeClass('onTyping');
			if ($(this).attr('type') == 'password'){$(this).hide().next().show();}
		}
	}).each(function(){
		// On load we apply the default text to each element
		$(this).next('.innerCaption-extension').remove();
		if ($(this).attr('type') == 'password'){$(this).hide().clone().addClass('innerCaption-extension').show().attr('type', 'text').val(decodeHtmlEntity(unescape($(this).attr('originalText')))).insertAfter(this).focusin(function(){$(this).hide().prev().show().focus();});}
		if (!$(this).is(':focus')){
			if ($(this).val() == '' || $(this).val() == decodeHtmlEntity(unescape($(this).attr('originalText')))){
				$(this).removeClass('onTyping').val(decodeHtmlEntity(unescape($(this).attr('originalText'))));
			} else {
				$(this).addClass('onTyping');
				if ($(this).attr('type') == 'password'){$(this).show().next().hide();}
			}
		}
		// Bind submit handler to clear defaults
		var $form = $(this).parents('form');
		if ($form.length > 0){
			if ($form.attr('id') in formhandler_innercaption_submit_record == false){
				formhandler_innercaption_submit_record[$form.attr('id')] = true;
				$form.unbind('submit.innercaption').bind('submit.innercaption', function(){
					$('input.innerCaption,textarea.innerCaption', $(this)).each(function(){
						if ($(this).attr('type') == 'password'){$(this).next().remove();}
						if (decodeHtmlEntity(unescape($(this).attr('originalText'))) == $(this).val()){
							$(this).val('');
						}
					});
				});
			}			
		}
	});
	if (Drupal.ajax) {
		// Bind to Drupal serialization trigger to ensure that innerCaption text is removed
		bind_ajax_beforeSerialize();
	}
	return $elems;
}
function weddingapp_get_innercaption_value($elem){
	// Returns the value of a textarea or input textbox with innercaption support applied
	return $elem.val() == unescape($elem.attr('originalText')) ? '' : $elem.val();
}
function weddingapp_apply_tooltips($elem){
	var $ = jQuery;
	if ($.isFunction($.fn.tipsy)){
		var $elem = $elem || $(document.body);
		$elem.find('.tooltip-tipsy,[tipsy]').each(function(){
			var options = {
				gravity: 'n',
				className: '',
				html:true,
				title: function() { return unescape($(this).attr('original-title')); },
				color: 'black',
			};
			if ($(this).attr('tipsy')){
				var attr_options = $.parseJSON($(this).attr('tipsy'));
				if (attr_options){
					if (attr_options.className){
						options.className = (options.className ? options.className + ' ' : '') + attr_options.className;
						delete attr_options.className;
					}
					$.extend(options, attr_options);
				}
			}
			// Parse color attribute
			options.className = (options.className ? options.className + ' ' : '') + 'tooltip-tipsy-color-' + options.color;
			$(this).tipsy(options);
		});
	}
}
function weddingapp_is_mobile(){
	// Returns server-side mobile detection value
	return Drupal.settings.weddingappdata.is_mobile;
}
function weddingapp_getimage(pid, callback){
	var $ = jQuery;
	$.ajax({
		url: "?q=ajax/getimage/" + pid,
		success: function(data) {
			if ($.isFunction(callback)){callback(data ? $.parseJSON(data) : false);}
		}
	});
}
function weddingapp_generate_accent_stylesheet(cp){
	// Generates accent stylesheet from color profile

	// CP expected dict of color + filter(optional) keys
	
	if (cp['filter']){
		var filter = '';
		filter += '-webkit-filter:' + cp['filter'] + '!important;'
		filter += '-moz-filter:' + cp['filter'] + '!important;'
		filter += '-ms-filter:' + cp['filter'] + '!important;'
		filter += '-o-filter:' + cp['filter'] + '!important;'
		filter += 'filter:' + cp['filter'] + '!important;'
	}

	var style = '';
	style += '.accent-color{color:' + cp['color'] + '!important;}';
	style += '.accent-colorbefore:before{color:' + cp['color'] + '!important;}';
	style += '.accent-colorafter:after{color:' + cp['color'] + '!important;}';
	style += '.accent-colorhover:hover{color:' + cp['color'] + '!important;}';
	style += '.accent-bordercolor{border-color:' + cp['color'] + '!important;}';
	style += '.accent-bordercolorhover:hover{border-color:' + cp['color'] + '!important;}';
	style += '.accent-backgroundcolor{background-color:' + cp['color'] + '!important;}';
	style += '.accent-backgroundcolorbefore:before{background-color:' + cp['color'] + '!important;}';
	style += '.accent-backgroundcolorafter:after{background-color:' + cp['color'] + '!important;}';
	style += '.accent-backgroundcolorhover:hover{background-color:' + cp['color'] + '!important;}';
	if (cp['filter']){
		style += '.accent-filter{' + filter + '}';
		style += '.accent-filterhover:hover{' + filter + '}';
		style += '.accent-filter-before:before{' + filter + '}';
		style += '.accent-filter-after:after{' + filter + '}';
		style += '.accent-filter-beforehover:hover:before{' + filter + '}';
		style += '.accent-filter-afterhover:hover:after{' + filter + '}';
	}
	return style;
}
function weddingapp_vendor_css(property, value){
	// Generates vendor-specific css
	var output = {};
	output[property] = value;
	output['-webkit-' + property] = value;
	output['-moz-' + property] = value;
	output['-ms-' + property] = value;
	output['-o-' + property] = value;
	return output;
}
function weddingapp_generate_dynamic_message_preview(options){
	// Generates screenshot of an email message
	var $ = jQuery;
	options = $.extend({
		'cookies': {},
		'drupal_base_url': Drupal.settings.weddingappdata.drupal_base_url,
		'drupal_template_path': 'ajax/interfaces/processemailtemplate',
		'image_server_url': Drupal.settings.weddingappdata.imageserver + '/screenshot',
		'data': {},
		'mtid': 0,
		'cache': false,
		'rendersize': [800, 321],
		'resize': [600, 240],
	}, options);
	var timestamp = new Date().getTime();
	// Modify the drupal session name since the imaging server has to load this link
	// over http and not https (phantompy doesn't support https)
	// The drupal session name begins with "SESS" for regular insecure cookies,
	// and "SSESS" for secure cookies, so we remove the first S since the imaging server
	// needs to use a session name that's going to match the scheme.
	// This was causing "Invalid session" to show up for message preview screenshots
	// on the email & share page.

	// Modify the URL so the imaging server loads the link over http, and not https
	// since phantompy doesn't support https yet.
	var drupal_url = options.drupal_base_url;
	if (window.location.protocol == 'https:') {
		drupal_url = drupal_url.replace('https:', 'http:');
	}
	
	return formatURL(options.image_server_url + '/' + timestamp, {
		'cookies': JSON.stringify(options.cookies),
		'rendersize': options.rendersize.join('x'),
		'resize': options.resize.join('x'),
		'url': formatURL(drupal_url, {
			'q': options.drupal_template_path,
			'mtid': options.mtid,
			'data': JSON.stringify(options.data),
			'cache': options.cache ? 'true' : 'false',
		}),
	});
}
function weddingapp_getUrlVars(url){
	var $ = jQuery;
    var vars = {};
    var hashes = url.slice(url.indexOf('?') + 1).split('&');
    for(var i = 0; i < hashes.length; i++)
    {
        hash = hashes[i].split('=');
        vars[hash[0]] = decodeURIComponent(hash[1]);
    }
    return vars;
}
function weddingapp_url_patcher(src, options){
	var $ = jQuery;
	var url = src.split('?')[0];
	var params = {};
	var param_string = src.split('?')[1];
	if (param_string){
		$.each(param_string.split('&'), function(i,v){
			params[v.split('=')[0]] = v.split('=')[1];
		});
	}
	$.each(options, function(k,v){
		params[k] = encodeURIComponent(v);
	});
	param_string = '';
	$.each(params, function(k,v){
		if (v != undefined) {param_string += (param_string == '' ? '' : '&') + k + '=' + v;}
	});
	src = url + '?' + param_string;
	return src;
}
function weddingapp_update_dynamic_app_preview_content(delay, options, parameters, $elem){
	var $ = jQuery;
	// Updates dynamic preview, can be called at any time.
	// Cachebusting requires that the second parameter of the url be ignored in htaccess on the server

	options = $.extend({clearcache: 1, enabled: 'inherit'}, options || {});

	// Optional delay to allow ajax to complete
	if (delay > 0){setTimeout(function(){weddingapp_update_dynamic_app_preview_content(0, options, parameters, $elem);}, delay); return;}
	var $elem = $elem || $('#iphonePreview .inset, #iphonePreview-large .inset, #email #preview');
	$elem.parent().children('.insetspinner').fadeIn(300);
	if(options.enabled == 'inherit'){
		options.enabled = ($elem.siblings('.disabled').is(':visible')) ? 0 : 1;
	}
	
	// Spamming the server makes it unhappy
	if ($elem.attr('loading') == 'true'){$.data($elem.get()[0], 'secondaryload', [options, parameters, $elem]); return;}
	
	if ($elem.attr('originalSrc') == undefined){
		$elem.attr('originalSrc', $elem.attr('src'));
	}

	var src = $elem.attr('originalSrc');
	if (parameters){
		var params = weddingapp_getUrlVars(src);
		if (('url' in params) && !('url' in options)){options['url'] = weddingapp_url_patcher(params['url'], parameters);}
	}

	src = weddingapp_url_patcher(src, options);

	var timestamp = new Date().getTime();
	$elem.attr('src', src.replace('preview', 'preview/'+timestamp));
	$elem.attr('loading', 'true');
	if(options.enabled == 1){
		$elem.siblings('.disabled').hide(1000);
	} else {
		$elem.siblings('.disabled').show(1000);
	}
}

function weddingapp_update_dynamic_app_preview_content_onload_helper(elem){
	var $ = jQuery;
	var $elem = $(elem);
	$elem.attr('loading', 'false');
	var data = $.data($elem.get()[0], 'secondaryload');
	if (data != undefined){
		$.removeData($elem.get()[0], 'secondaryload');
		weddingapp_update_dynamic_app_preview_content(0, data[0], data[1], data[2]);
	}
}

function weddingapp_inner_caption_beforesubmit(elems){
	var $ = jQuery;
	$('input.innerCaption,textarea.innerCaption', elems).each(function(){
		if ($(this).attr('type') == 'password'){$(this).next().remove();}
		if (unescape($(this).attr('originalText')) == $(this).val()){
			$(this).val('');
		}
	});
}

function weddingapp_unique_set(set){
	// Returns set of unique values
	var $ = jQuery;
    return $.grep(set,function(el,index){
        return index == $.inArray(el,set);
    });
}

function weddingapp_parse_set(set, numeric){
	// Returns array from comma delimited set
	// Numeric flag optional, ensures type correctness
	var $ = jQuery;
	var output = set ? $.map((set ? set : '').split(','), function(a){return $.trim(a);}) : [];
	if (numeric){
		output = $.map(output, function(a){return parseInt(a);});
	}
	return output;
}

function weddingapp_get_set_overlap(sets, numeric){
	// Returns overlap of an array of sets
	// Case sensitive when handling sets containing strings
	var output;
	var $ = jQuery;
	$.each(sets, function(i, set){
		var tags = $.isArray(set) ? set : weddingapp_parse_set(set, numeric);
		if (output === undefined){
			output = tags; 
		} else {
			var rmtags = [];
			$.each(output, function(i, tag){
				var idx = tags.indexOf(tag);
				if (idx == -1){
					rmtags.push(tag);
				}
			});
			$.each(rmtags, function(i, tag){
				var idx = output.indexOf(tag);
				if (idx > -1){
					output.splice(idx, 1);
				}
			});
		}
	});
	if (output === undefined){output = [];}
	return output;
}

function weddingapp_in_set(set, item, numeric){
	// Returns true if value in set
	// Numeric flag optional
	var $ = jQuery;
	var data = typeof(set) == 'string' ? weddingapp_parse_set(set, numeric) : set;
	var match = numeric ? parseInt(item) : item;
	return $.inArray(match, data) > -1;	
}

function weddingapp_add_to_set(set, item, numeric){
	// Adds item to comma delimited set
	// Numeric flag optional. Avoids duplication.
	if (weddingapp_in_set(set, item, numeric)){
		return set;
	} else {
		return (set ? set : '') + (set ? ',' : '') + item;
	}
}

function weddingapp_remove_from_set(set, item, numeric){
	// Removes item from comma delimited set
	// Numeric flag optional, ensures type correctness
	var data = typeof(set) == 'string' ? weddingapp_parse_set(set, numeric) : set;
	var idx = data.indexOf((numeric ? parseInt(item) : item));
	if (idx > -1){
		data.splice(idx, 1);
	}
	var output = data.join(',');
	return output;
}

function weddingapp_return_word_at_position(text, caretPos) {
	// Returns word nearest to caret position (currently typed word)
    var lowerText = text.substring(0, caretPos);
    while(lowerText.indexOf(" ") != -1){lowerText = lowerText.substring(lowerText.indexOf(" ")+1);}
    var lowerBreak = caretPos - lowerText.length;        
    var upperText = text.substring(caretPos);
   	var upperBreak = caretPos + (upperText.indexOf(" ") > -1 ? upperText.indexOf(" ") : upperText.length);
    return text.substring(lowerBreak, upperBreak);
}

function weddingapp_format_guest_first_name(guest, tag_f, tag_l){
	// Formats guest name depending on completed fields to return first name
	// tag_f tag_l optionally specify the parameter to extract from
	if (tag_f === undefined){tag_f = "firstname";}
	if (tag_l === undefined){tag_l = "lastname";}
	return (guest[tag_f] ? guest[tag_f] : '') || (guest[tag_l] ? guest[tag_l] : '');
}

function weddingapp_format_guest_name(guest, tag_f, tag_l){
	// Formats guest name depending on completed fields
	// tag_f tag_l optionally specify the parameter to extract from
	if (tag_f === undefined){tag_f = "firstname";}
	if (tag_l === undefined){tag_l = "lastname";}
	return (guest[tag_f] ? guest[tag_f] : '') + (guest[tag_f] && guest[tag_l] ? ' ' : '') + (guest[tag_l] ? guest[tag_l] : '');
}

function weddingapp_split_name(name){
	// Returns first and last name when separated by a space
	// Strip trailing/leading whitespace
	name = name.replace(/^\s+|\s+$/g, '');
	// Remove multiple consecutive whitespace between the names
	name = name.replace(/\s+/g, ' ');
	name_split = name.split(' ');
	// If the user inputs more than 2 words, we group the remaining words as the "last name"
	// e.g. John Joe Smith would return ["John", "Joe Smith"]
	if (name_split.length > 1) {
	    return [name_split[0], name_split.slice(1).join(' ')];
	}
	// Return a blank lastname as we expect a return length of 2
	return [name_split[0], ''];
}

function weddingapp_get_image_thumbnail_url(photo, options){
	// Returns image server photo thumbnail url
	var $ = jQuery;
	var options = $.extend({
		width: 256,
		height: 256,
		crop: 2,
	}, options);
	var facedetect;
	try {
		facedetect = $.parseJSON(photo.faces).center.percentage;
	} catch (e) {}
	if (!facedetect) {facedetect = [50, 50];}
	return Drupal.settings.weddingappdata.imageserver + "/image?asset=" + encodeURIComponent(photo.filename) + "&pid=" + photo.pid + "&crop=" + options.crop + "&w="+options.width+"&h="+options.height+"&center=" + facedetect[0] + "," + facedetect[1];
}

function weddingapp_set_photo_background($elem, photo, options){
	// Sets photo as background-image with respect to detected face positions
	var facedetect;
	var $ = jQuery;
	var options = $.extend({
		position: 'contain',
		
	}, options);
	try {
		facedetect = $.parseJSON(photo.faces).center.percentage;
	} catch (e) {
		
	}
	if (!facedetect) {facedetect = "50% 50%";} else {facedetect = facedetect.join('% ') + '%';} 
	$elem.css('background-image', 'url("' + formatURLScheme(photo.filename) + '")');
	$elem.css('background-position', facedetect);
	if (options.position == 'contain'){
		if (photo.width > photo.height){
			$elem.css('background-size', 'auto 100%');
		
		} else if (photo.height > photo.width){
			$elem.css('background-size', '100% auto');
		
		} else {
			$elem.css('background-size', '100% 100%');
		}
	} else if (options.position == 'cover'){
		$elem.css('background-size', 'cover');
	}
}

function weddingapp_generate_guest_profile_photo(photo, options){
	// Generates profile photo used by guests
	var $ = jQuery;
	var facedata = null;
	try{
		facedata = photo.faces ? $.parseJSON(photo.faces) : null;
	} catch (e) {
	}
	options = $.extend({
		width: 48,
		height: 48,
	}, options);
	var faces = [50, 50];
	if (facedata != null) {
		var faces = facedata.center.percentage;
	}
	return Drupal.settings.weddingappdata.imageserver + "/image?asset=" + encodeURIComponent(photo.filename) + "&pid=" + photo.pid + "&crop=2&w="+options.width+"&h="+options.height+"&center=" + faces[0] + "," + faces[1];
}

function weddingapp_format_time(datetime){
	// Returns formatted time hh:mm am/pm
	var $ = jQuery;
	var hours = String(datetime.getHours());
	var minutes = String(datetime.getMinutes());
	var meridiem = hours > 11 ? "pm" : "am";
	hours = hours > 12 ? hours - 12 : hours;
	if (hours == 0) {hours = 12;}
	minutes = minutes.length == 1 ? '0' + minutes : minutes;
	return hours + ":" + minutes + " " + meridiem;
}

function weddingapp_format_datetime(datetime){
	// Returns date with formal formatting
	// Use when hw_addLocalizedDate has been called in PHP to localize strings
	return weddingapp_format_date(datetime) + ', ' + weddingapp_format_time(datetime);
}

function weddingapp_format_date(datetime){
	// Returns date with formal formatting
	// Use when hw_addLocalizedDate has been called in PHP to localize strings
	var $ = jQuery;
	return $.datepicker.formatDate(Drupal.settings.weddingappdata.dateExtendedFormat, datetime, Drupal.settings.weddingappdata.lang.date);
}

function weddingapp_utc_mysql_timestamp_to_date(timestamp) {
	// Parses ISO8601 to Date object
	// Format expects UTC, returns local time
	var regex=/^([0-9]{2,4})-([0-1][0-9])-([0-3][0-9]) (?:([0-2][0-9]):([0-5][0-9]):([0-5][0-9]))?$/;
	var parts=timestamp.replace(regex,"$1 $2 $3 $4 $5 $6").split(' ');
	var date = new Date(parts[0],parts[1]-1,parts[2],parts[3],parts[4],parts[5]);
	return new Date(date.getTime() - date.getTimezoneOffset()*60*1000);
}

function weddingapp_mysql_timestamp_to_date(timestamp) {
	// Parses ISO8601 to Date object
	// Format expects local time, returns local time
	var regex=/^([0-9]{2,4})-([0-1][0-9])-([0-3][0-9]) (?:([0-2][0-9]):([0-5][0-9]):([0-5][0-9]))?$/;
	var parts=timestamp.replace(regex,"$1 $2 $3 $4 $5 $6").split(' ');
	return new Date(parts[0],parts[1]-1,parts[2],parts[3],parts[4],parts[5]);
}

function weddingapp_date_to_mysql_timestamp(date){
	// Returns ISO8601 from Date object
	// Format expects local time, returns local time
	var $ = jQuery;
	if ($.fn.datepicker){
		return $.datepicker.formatDate('yy-mm-dd', date) + ' ' + date.toTimeString().split(' ')[0];	
	} else {
		return null;
	}
}

function weddingapp_date_to_utc_mysql_timestamp(date){
	// Returns ISO8601 from Date object
	// Format expects local time, returns UTC time
	var $ = jQuery;
	var utc_date = new Date(date.getTime() + date.getTimezoneOffset()*60*1000);
	if ($.fn.datepicker){
		return $.datepicker.formatDate('yy-mm-dd', utc_date) + ' ' + utc_date.toTimeString().split(' ')[0];	
	} else {
		return null;
	}
}

function weddingapp_edit_datetime(data, options){
	// Provides dialog to edit a datetime
	// Data is object contianing
	// - date
	// - time
	// - duration (optional)
	var self = this;
	var $ = jQuery;
	self.options = $.extend(true, {
		lang: $.extend($.extend({}, Drupal.settings.weddingappdata.lang.datetimeedit),
						Drupal.settings.weddingappdata.lang.multistepform),
		extras_before: {},															// Extra fields
		extras_after: {},															// Extra fields
		timezones: Drupal.settings.weddingappdata.timezones,						// Localized timezones
		submit: null,																// Submit callback function
		onLoad: null,																// Load callback function
		width: 570,
		height: 357,
		supportsNull: false,														// If enabled, checkbox will show to disable / enable the use of a date
		supportsDuration: false, 													// If enabled, duration will be editable
		supportsTimezone: false,													// If enabled, timezone will be editable
		timezoneCollapsed: true,													// If true, timezone selection dialog will be collapsed
	}, options);
	
	// Temporary storage for split date values
	var _data = {
		date: data.datetime ? data.datetime.split(' ')[0] : null,
		time: data.datetime ? data.datetime.split(' ')[1] : null,
	};
	
	var $page = $('<div class="step0"></div>');
	if (self.options.supportsNull){
		$page.append('<input type="checkbox" class="dateeditdialog-enable-date"></input>');
		$page.append($('<span class="dateeditdialog-label-enable-date">').html(self.options.lang.enable_datetime));
	}
	$page.append('<br>');
	$page.append('<input type="text" class="dateeditdialog-edit-date-formatted ' + (self.options.supportsDuration ? 'dateeditdialog-edit-date-formatted-duration' : '') + '" size="60" maxlength="128"></input>');
	$page.append('<div class="dateeditdialog-edit-starttime"><span class="dateeditdialog-edit-time-label"></span><select class="dateeditdialog-edit-hours"></select><span>:</span><select class="dateeditdialog-edit-minutes"></select><select class="dateeditdialog-edit-ampm"></select></div>');
	$('.dateeditdialog-edit-starttime .dateeditdialog-edit-time-label', $page).html(self.options.lang['starttime']);
	
	if (self.options.supportsDuration){
		$page.append('<div class="dateeditdialog-edit-endtime"><span class="dateeditdialog-edit-time-label"></span><select class="dateeditdialog-edit-hours"></select><span>:</span><select class="dateeditdialog-edit-minutes"></select><select class="dateeditdialog-edit-ampm"></select></div>');
		$('.dateeditdialog-edit-endtime .dateeditdialog-edit-time-label', $page).html(self.options.lang['endtime']);
	}

	$.each(['.dateeditdialog-edit-starttime', '.dateeditdialog-edit-endtime'], function(i, sel){
		$(sel + ' .dateeditdialog-edit-hours', $page).append('<option value="">--</option>');
		$(sel + ' .dateeditdialog-edit-minutes', $page).append('<option value="">--</option>');
		$(sel + ' .dateeditdialog-edit-ampm', $page).append('<option value="">--</option>');
		$.each([1,2,3,4,5,6,7,8,9,10,11,12], function(i, v){$(sel + ' .dateeditdialog-edit-hours', $page).append('<option value="'+v+'">'+v+'</option>');});
		$.each([0, 15, 30, 45], function(i, v){$(sel + ' .dateeditdialog-edit-minutes', $page).append('<option value="'+v+'">'+(v.toString().length == 1 ? '0' : '')+v+'</option>');});
		$.each(['am', 'pm'], function(i, v){$(sel + ' .dateeditdialog-edit-ampm', $page).append('<option value="'+v+'">'+self.options.lang[v]+'</option>');});
	});

	if (self.options.supportsTimezone){
		var $timezone_collapsible = $('<div class="dateeditdialog-edit-timezone-accordion" style="width: 536px;margin: 0 2px 0px 2px; padding-top:8px;"></div>').appendTo($page);
		$('<h3></h3>').appendTo($timezone_collapsible).html(self.options.lang.timezone);
		var $timezone_collapsible_content = $('<div></div>').appendTo($timezone_collapsible);
		var $timezones = $("<select class='dateeditdialog-edit-timezone' style='width:475px;'>").appendTo($timezone_collapsible_content);
		$.each(self.options.timezones, function(zone, zone_name){$timezones.append($('<option>').val(zone).html(zone_name));});
	}
					
	if (!$.isFunction($.fn.multistepform)){console.log("weddingapp_edit_datetime: Multistepform is required. Cannot continue."); return;}
	
	var $multistep = $('<div></div>').append($page).multistepform({
		lang:self.options.lang,
		onClose:null,
		dialogTitle: self.options.lang['edit_time'],
		width: self.options.width,
		height:self.options.height,
		pageLoad:function($dialog, step){
			// Initial load of page, setup widgets and set values
			function disable_time_interface(){
				// Disables the time dialog
				$('.dateeditdialog-edit-timezone-accordion', $dialog).accordion('disable');
				$('.dateeditdialog-edit-date-formatted', $dialog).datepicker('disable').css('opacity', 0.5);
				$('.dateeditdialog-edit-starttime', $dialog).children().attr('disabled', true).css('opacity', 0.5);
				$('.dateeditdialog-edit-endtime', $dialog).children().attr('disabled', true).css('opacity', 0.5);
			}
			function getTime($row){
				// Returns time of row
				var blank = $('.dateeditdialog-edit-hours', $row).val() == '' || $('.dateeditdialog-edit-minutes', $row).val() == '' || $('.dateeditdialog-edit-ampm', $row).val() == '';
				if (blank){return null;}
				var pm = $('.dateeditdialog-edit-ampm', $row).val() == 'pm' ? 1 : 0;
				var hours = (parseInt($('.dateeditdialog-edit-hours', $row).val()) + (pm * 12)).toString();
				if (hours == '12'){hours = '0';}
				if (hours == '24'){hours = '12';}
				if (hours.length == 1){hours = '0' + hours;}
				var minutes = $('.dateeditdialog-edit-minutes', $row).val().toString();
				if (minutes.length == 1){minutes = '0' + minutes;}
				return hours + ':' + minutes + ':00';
			}
			function setTime($row, time){
				// Sets time for row
				var hours = time.getHours();
				var pm = hours > 11 ? 1 : 0;
				if (pm){ hours -= 12; }
				if (hours == 0){ hours = 12;}
				var minutes = time.getMinutes();
				
				$('.dateeditdialog-edit-hours', $row).val(hours).trigger("liszt:updated");
				$('.dateeditdialog-edit-minutes', $row).val(minutes).trigger("liszt:updated");
				$('.dateeditdialog-edit-ampm', $row).val(pm ? 'pm' : 'am').trigger("liszt:updated");
			}
			function validate(){
				if ((_data.date && _data.time) || $('.dateeditdialog-enable-date', $dialog).is(':checked') == false){
					$multistep.multistepform('enableButton', 'finish');
				} else {
					$multistep.multistepform('disableButton', 'finish');
				}
			}
			$.each(self.options.extras_before, function(k,v){
				$dialog.find('.step0').append('<input type="text" class="dateeditdialog-edit-'+k+' innerCaption" size="60" maxlength="' + (v.maxlength ? v.maxlength : 128) + '" style="padding:5px;margin-bottom:5px;" originalText="'+v.innerCaption+'"></input>');
			});
			$('.dateeditdialog-label-enable-date', $dialog).click(function(){
				$('.dateeditdialog-enable-date', $dialog).click();
			});
			$('.dateeditdialog-enable-date', $dialog).change(function(){
				if ($(this).is(':checked')){
					$('.dateeditdialog-edit-timezone-accordion', $dialog).accordion('enable');
					$('.dateeditdialog-edit-date-formatted', $dialog).datepicker('enable').css('opacity', 1);
					$('.dateeditdialog-edit-starttime', $dialog).children().attr('disabled', false).css('opacity', 1);
					$('.dateeditdialog-edit-endtime', $dialog).children().attr('disabled', false).css('opacity', 1);
				} else {
					disable_time_interface();
				}
				validate();
			});
			$('.dateeditdialog-edit-date-formatted', $dialog).datepicker({
				dateFormat:'DD, d MM, yy',
				onSelect:function(dateText, inst){
					_data.date = weddingapp_date_to_mysql_timestamp($(this).datepicker('getDate')).split(' ')[0];
					validate();
				}, 
			});

			$('.dateeditdialog-edit-starttime .dateeditdialog-edit-hours', $dialog).chosen({
				disable_search: true,
				width: '55px',
			}).change(function(e){
				if ($(this).val() && $('.dateeditdialog-edit-starttime .dateeditdialog-edit-minutes', $dialog).val() == ''){$('.dateeditdialog-edit-starttime .dateeditdialog-edit-minutes', $dialog).val('0').trigger("liszt:updated");}
				if ($(this).val() && $('.dateeditdialog-edit-starttime .dateeditdialog-edit-ampm', $dialog).val() == ''){$('.dateeditdialog-edit-starttime .dateeditdialog-edit-ampm', $dialog).val('am').trigger("liszt:updated");}
				_data.time = getTime($dialog.find('.dateeditdialog-edit-starttime'));
				validate();
			});
			$('.dateeditdialog-edit-starttime .dateeditdialog-edit-minutes', $dialog).chosen({
				disable_search: true,
				width: '55px',
			}).change(function(){
				if ($(this).val() && $('.dateeditdialog-edit-starttime .dateeditdialog-edit-hours', $dialog).val() == ''){$('.dateeditdialog-edit-starttime .dateeditdialog-edit-hours', $dialog).val('12').trigger("liszt:updated");}
				if ($(this).val() && $('.dateeditdialog-edit-starttime .dateeditdialog-edit-ampm', $dialog).val() == ''){$('.dateeditdialog-edit-starttime .dateeditdialog-edit-ampm', $dialog).val('am').trigger("liszt:updated");}
				_data.time = getTime($dialog.find('.dateeditdialog-edit-starttime'));
				validate();
			});
			$('.dateeditdialog-edit-starttime .dateeditdialog-edit-ampm', $dialog).chosen({
				disable_search: true,
				width: '57px',
			}).change(function(){
				if ($(this).val() && $('.dateeditdialog-edit-starttime .dateeditdialog-edit-hours', $dialog).val() == ''){$('.dateeditdialog-edit-starttime .dateeditdialog-edit-hours', $dialog).val('12').trigger("liszt:updated");}
				if ($(this).val() && $('.dateeditdialog-edit-starttime .dateeditdialog-edit-minutes', $dialog).val() == ''){$('.dateeditdialog-edit-starttime .dateeditdialog-edit-minutes', $dialog).val('0').trigger("liszt:updated");}
				_data.time = getTime($dialog.find('.dateeditdialog-edit-starttime'));
				validate();
			});
			
			if (self.options.supportsDuration){
				function getDuration(){
					var duration = null;
					var time = getTime($dialog.find('.dateeditdialog-edit-endtime'));
					if (time){
						var duration = (weddingapp_mysql_timestamp_to_date(_data.date + ' ' + time).getTime() - weddingapp_mysql_timestamp_to_date(_data.date + ' ' + _data.time).getTime()) / 1000;
						if (duration < 0){
							duration += 24 * 60 * 60;
						}
					}
					data.duration = duration;
				}
				$('.dateeditdialog-edit-endtime .dateeditdialog-edit-hours', $dialog).chosen({
					disable_search: true,
					width: '55px',
				}).change(function(){
					if ($(this).val() && $('.dateeditdialog-edit-endtime .dateeditdialog-edit-minutes', $dialog).val() == ''){$('.dateeditdialog-edit-endtime .dateeditdialog-edit-minutes', $dialog).val('0').trigger("liszt:updated");}
					if ($(this).val() && $('.dateeditdialog-edit-endtime .dateeditdialog-edit-ampm', $dialog).val() == ''){$('.dateeditdialog-edit-endtime .dateeditdialog-edit-ampm', $dialog).val('am').trigger("liszt:updated");}
					getDuration();
				});
				$('.dateeditdialog-edit-endtime .dateeditdialog-edit-minutes', $dialog).chosen({
					disable_search: true,
					width: '55px',
				}).change(function(){
					if ($(this).val() && $('.dateeditdialog-edit-endtime .dateeditdialog-edit-hours', $dialog).val() == ''){$('.dateeditdialog-edit-endtime .dateeditdialog-edit-hours', $dialog).val('12').trigger("liszt:updated");}
					if ($(this).val() && $('.dateeditdialog-edit-endtime .dateeditdialog-edit-ampm', $dialog).val() == ''){$('.dateeditdialog-edit-endtime .dateeditdialog-edit-ampm', $dialog).val('am').trigger("liszt:updated");}
					getDuration();
				});
				$('.dateeditdialog-edit-endtime .dateeditdialog-edit-ampm', $dialog).chosen({
					disable_search: true,
					width: '57px',
				}).change(function(){
					if ($(this).val() && $('.dateeditdialog-edit-endtime .dateeditdialog-edit-hours', $dialog).val() == ''){$('.dateeditdialog-edit-endtime .dateeditdialog-edit-hours', $dialog).val('12').trigger("liszt:updated");}
					if ($(this).val() && $('.dateeditdialog-edit-endtime .dateeditdialog-edit-minutes', $dialog).val() == ''){$('.dateeditdialog-edit-endtime .dateeditdialog-edit-minutes', $dialog).val('0').trigger("liszt:updated");}
					getDuration();
				});
			}
			if (self.options.supportsTimezone){
				$('.dateeditdialog-edit-timezone', $dialog).val(data.timezone);
				$('.dateeditdialog-edit-timezone-accordion', $dialog).accordion({collapsible: true, active: self.options.timezoneCollapsed ? 0 : false});
			}
			if (_data.date){
				var date = weddingapp_mysql_timestamp_to_date(_data.date + ' ' + _data.time);
				$('.dateeditdialog-edit-date-formatted', $dialog).datepicker('setDate', date);
				setTime($dialog.find('.dateeditdialog-edit-starttime'), date);
				$('.dateeditdialog-enable-date', $dialog).attr('checked', true);
			} else {
				if (self.options.supportsNull == false){
					$multistep.multistepform('disableButton', 'finish');
				}
				disable_time_interface();
			}
			if (_data.date && data.duration){
				setTime($dialog.find('.dateeditdialog-edit-endtime'), new Date(date.getTime() + parseInt(data.duration)*1000));
			}			
			$.each(self.options.extras_after, function(k,v){
				$dialog.find('.step0').append('<input type="text" class="dateeditdialog-edit-'+k+' innerCaption" size="60" maxlength="' + (v.maxlength ? v.maxlength : 128) + '" style="padding:5px;clear:both;" originalText="'+v.innerCaption+'"></input>');
			});
			weddingapp_apply_inner_caption($dialog);
			if ($.isFunction(self.options.onLoad)){self.options.onLoad($dialog);}
		},
		pageSave:function($dialog, step){
			weddingapp_inner_caption_beforesubmit($dialog);
			
			// Get form data
			var enabled = $('.dateeditdialog-enable-date', $dialog).is(':checked');
			data.datetime = (_data.date && _data.time && enabled) ? _data.date + ' ' + _data.time : null;
			if (self.options.supportsTimezone){
				data.timezone = $('.dateeditdialog-edit-timezone', $dialog).val();
			}
			
			// Get extras data
			var extras_data = {};
			$.each($.extend($.extend({}, self.options.extras_before), self.options.extras_after), function(k,v){extras_data[k] = v.value;});
			if ($.isFunction(self.options.submit)){self.options.submit(data, extras_data);}
		},
	});
}

function weddingapp_edit_address(aid, options){
	weddingapp_edit_address_dialog(aid, options);
}

function weddingapp_edit_address_dialog(aid, options){
	// Provides dialog to edit / create an address
	var self = this
	var $ = jQuery;
	self.options = $.extend({
		lang: $.extend(true, {
						addressfields:Drupal.settings.weddingappdata.lang.addressfields,
						"Add Address" : Drupal.settings.weddingappdata.lang["Add Address"],
						"Edit Address" : Drupal.settings.weddingappdata.lang["Edit Address"],
					}, 
						Drupal.settings.weddingappdata.lang.multistepform),
		defaultCountry: Drupal.settings.weddingappdata.wedding.country || 840,		// Default country
		extras_before: {},															// Extra fields
		extras_after: {},															// Extra fields
		addressstore: Drupal.settings.weddingappdata.addresses || {},				// Global storage for address instances
		iso3166: Drupal.settings.weddingappdata.countries,							// Required country list (iso_3166-1 table)
		submit: null,																// Submit callback function
		width: 478,
		height: 400,
		showPhone: true,															// Flag to show or hide phone field
	}, options);
			
	self.defaultAddressFields = {'line1':'', 'line2':'', 'city':'', 'province':'', 'postcode':'', 'phone':'', 'country': self.options.defaultCountry};
	
	var data = self.options.addressstore[aid] || $.extend({}, defaultAddressFields);
	var $page = $('<div class="step0"></div>');
			
	// Sort countries alphabetically
	var sortedCountries = []; $.each(self.options.iso3166, function(k,v){sortedCountries.push({numcode:k, name:v.localized_printable_name});});
	sortedCountries.sort(function(a,b){return ((a.name < b.name) ? -1 : ((a.name > b.name) ? 1 : 0));});
	
	if (!$.isFunction($.fn.multistepform)){console.log("weddingapp_edit_address_dialog: Multistepform is required. Cannot continue."); return;}
	
	$('<div></div>').append($page).multistepform({
		lang:self.options.lang,
		onClose:null,
		dialogTitle: aid > 0 ? self.options.lang['Edit Address'] : self.options.lang['Add Address'],
		width: self.options.width,
		height:self.options.height,
		pageLoad:function($dialog, step){
			// Initial load of page, setup widgets and set values
			var $countrieslist = $('<select class="addresseditdialog-edit-country"></select>').change(function(){
				// Save updated information to memory from fields
				weddingapp_inner_caption_beforesubmit($dialog);
				$.each(data, function(k, v){data[k]=$('.addresseditdialog-edit-'+k, $dialog).val();});
				remap_fields($(this).val(), ['country']);
			}).appendTo($dialog.find('.step0'));
			
			
			$.each(sortedCountries, function(i, v){
				$countrieslist.append($('<option value="'+v.numcode+'"></option>').text(v.name));
			});

			function remap_fields(country, skip){
				weddingapp_edit_address_insert_form(self, $dialog, data, country, skip)
			}
			remap_fields(data.country);
		},
		pageSave:function($dialog, step){
			weddingapp_inner_caption_beforesubmit($dialog);
			$.each(data, function(k, v){
				data[k]=$('.addresseditdialog-edit-'+k, $dialog).val();
			});
			// Ensure that data fields are fully populated
			data = $.extend($.extend({}, self.defaultAddressFields), data);
			var hasaddress = $.trim($.map(data, function(v,k){return k != "country" && k != "province" ? v : '';}).join('')) != '';
			$.each(self.options.extras_before, function(k,v) {
				self.options.extras_before[k].value = $('.addresseditdialog-edit-'+k, $dialog).val();
			});
			$.each(self.options.extras_after, function(k,v) {
				self.options.extras_after[k].value = $('.addresseditdialog-edit-'+k, $dialog).val();
			});
			if (hasaddress) {
				var aid = parseInt($.ajax('?q=ajax/eventmanagement/addaddress', {async:false, type:'post', data:{data:JSON.stringify(data)}}).responseText);
				self.options.addressstore[aid] = $.extend({aid:aid}, data);
			} else {
				var aid = null;
			}
			var extras_data = {};
			$.each($.extend($.extend({}, self.options.extras_before), self.options.extras_after), function(k,v){extras_data[k] = v.value;});
			if ($.isFunction(self.options.submit)){self.options.submit(aid, extras_data);}
		},
	});
}

function weddingapp_edit_address_inline(aid, options){
	// Provides dialog to edit / create an address
	var self = this
	var $ = jQuery;
	self.options = $.extend({
		lang: $.extend(true, {
				addressfields: Drupal.settings.weddingappdata.lang.addressfields,
				"Add Address" : Drupal.settings.weddingappdata.lang["Add Address"],
				"Edit Address" : Drupal.settings.weddingappdata.lang["Edit Address"],
			},
			Drupal.settings.weddingappdata.lang.multistepform),
		defaultCountry: Drupal.settings.weddingappdata.wedding.country || 840,		// Default country
		extras_before: {},															// Extra fields
		extras_after: {},															// Extra fields
		addressstore: Drupal.settings.weddingappdata.addresses || {},				// Global storage for address instances
		iso3166: Drupal.settings.weddingappdata.countries,							// Required country list (iso_3166-1 table)
		submit: null,																// Submit callback function
		width: 478,
		height: 400,
		showPhone: true,															// Flag to show or hide phone field
	}, options);

	self.defaultAddressFields = {'line1':'', 'line2':'', 'city':'', 'province':'', 'postcode':'', 'phone':'', 'country': self.options.defaultCountry};

	var data = self.options.addressstore[aid] || $.extend({}, defaultAddressFields);
	var $page = $('<div class="step0"></div>');

	// Sort countries alphabetically
	var sortedCountries = []; $.each(self.options.iso3166, function(k,v){sortedCountries.push({numcode:k, name:v.localized_printable_name});});
	sortedCountries.sort(function(a,b){return ((a.name < b.name) ? -1 : ((a.name > b.name) ? 1 : 0));});

	$dialog = $('#address-content');
	$dialog.append($page);

	// Initial load of page, setup widgets and set values
	var $countrieslist = $('<select class="addresseditdialog-edit-country"></select>').change(function(){
		// Save updated information to memory from fields
		weddingapp_inner_caption_beforesubmit($dialog);
		$.each(data, function(k, v){data[k]=$('.addresseditdialog-edit-'+k, $dialog).val();});
		remap_fields($(this).val(), ['country']);
	}).appendTo($dialog.find('.step0'));
	$.each(sortedCountries, function(i, v){
		$countrieslist.append($('<option value="'+v.numcode+'"></option>').text(v.name));
	});
	function remap_fields(country, skip){
		weddingapp_edit_address_insert_form(self, $dialog, data, country, skip)
	}
	remap_fields(data.country);

	self.pageSave = function(){
		weddingapp_inner_caption_beforesubmit($dialog);

		$.each(data, function(k, v){
			data[k]=$('.addresseditdialog-edit-'+k, $dialog).val();
		});

		// Ensure that data fields are fully populated
		data = $.extend($.extend({}, self.defaultAddressFields), data);

		var hasaddress = $.trim($.map(data, function(v,k){return k != "country" && k != "province" ? v : '';}).join('')) != '';
		$.each(self.options.extras_before, function(k,v) {
			self.options.extras_before[k].value = $('.addresseditdialog-edit-'+k, $dialog).val();
		});
		$.each(self.options.extras_after, function(k,v) {
			self.options.extras_after[k].value = $('.addresseditdialog-edit-'+k, $dialog).val();
		});
		if (hasaddress) {
			var aid = parseInt($.ajax('?q=ajax/addressmanagement/addaddress', {async:false, type:'post', data:{data:JSON.stringify(data)}}).responseText);
			self.options.addressstore[aid] = $.extend({aid:aid}, data);
		} else {
			var aid = null;
		}
		var extras_data = {};
		$.each($.extend($.extend({}, self.options.extras_before), self.options.extras_after), function(k,v){extras_data[k] = v.value;});
		if ($.isFunction(self.options.submit)){self.options.submit(aid, extras_data);}
	}
	$('#address-page-save-button').text("Save");
	$('#address-page-save-button').click(self.pageSave.bind(self));

}

function weddingapp_edit_address_insert_form(self, $dialog, data, country, skip){
// Redraws address fields based on selected country
	var $ = jQuery;
	// Remove dynamic address fields
	$dialog.find('.step0').children(':not(.addresseditdialog-edit-country)').remove();
	// Get address map
	var lang = (country in self.options.lang.addressfields) ? self.options.lang.addressfields[country] : Drupal.settings.weddingappdata.lang.addressfields[0];
	var selectmode = false;
	$.each(self.options.extras_before, function(k,v){
		$dialog.find('.step0').append('<input type="text" class="addresseditdialog-edit-'+k+' innerCaption" size="60" maxlength="' + (v.maxlength ? v.maxlength : 128) + '" style="padding:5px;margin-bottom:5px;" originalText="'+v.innerCaption+'"></input>');
	});
	$.each(lang, function(key, value){
		if (key == 'country' || key == 'phone'){return;}
		if (key == 'province' && country in Drupal.settings.weddingappdata.lang.provinces && (!data['province'] || (data['province'].toUpperCase() in Drupal.settings.weddingappdata.lang.provinces[country]))){
			// Create new select field for province / state (if full text has not been entered already)
			// This check should eventually be deprecated
			var selectmode = true;
			var $select = $('<select class="addresseditdialog-edit-'+key+'">');
			$.each(Drupal.settings.weddingappdata.lang.provinces[country], function(k,v){
				$select.append($("<option></option>").val(k).html(v));
			});
			$dialog.find('.step0').append($select);
			return;
		}
		$dialog.find('.step0').append('<input type="text" class="addresseditdialog-edit-'+key+' innerCaption" size="60" maxlength="128" style="padding:5px; margin-bottom:5px;" originalText="'+value+'"></input>');
	});
	$dialog.find('.addresseditdialog-edit-country').appendTo($dialog.find('.step0'));
	if (self.options.showPhone){
		$dialog.find('.step0').append('<input type="text" class="addresseditdialog-edit-phone innerCaption" size="60" maxlength="128" style="padding:5px; margin-bottom:5px;" originalText="'+lang.phone+'"></input>');
	}
	$.each(self.options.extras_after, function(k,v){
		$dialog.find('.step0').append('<input type="text" class="addresseditdialog-edit-'+k+' innerCaption" size="60" maxlength="' + (v.maxlength ? v.maxlength : 128) + '" style="padding:5px;" originalText="'+v.innerCaption+'"></input>');
	});
	$.each(data, function(k, v){
		if (skip == undefined || $.inArray(k, skip) == -1){
			if (k == 'province' && selectmode == true){
				// Deprecate eventually
				$('.addresseditdialog-edit-'+k, $dialog).val(v.toUpperCase());
			}
			$('.addresseditdialog-edit-'+k, $dialog).val(v);
		}
	});
	$.each(self.options.extras_before, function(k,v){
		$('.addresseditdialog-edit-'+k, $dialog).val(v.value);
	});
	$.each(self.options.extras_after, function(k,v){
		$('.addresseditdialog-edit-'+k, $dialog).val(v.value);
	});
	weddingapp_apply_inner_caption($dialog);
}

function weddingapp_parse_address(address){
	// Converts address fields to internal storage format from display values
	// e.g. Texas -> TX and United States -> 840
	// Converts fields from cloudsponge address to internal storage format
	// This function expects address processing data to be available. See weddingapp_add_address_features
	var $ = jQuery;
	var output = $.extend({
		line1: null,
		line2: null,
		city: null,
		province: null,
		postcode: null,
		country: 0,
		phone: null,
	}, address);


	var country = 0;
    if(address.country != 0) {
        var countrytext = address.country.toLowerCase().replace(/[^a-z\s:]/g, '');
        $.each(Drupal.settings.weddingappdata.countries, function (i, v) {
            if (v.localized_printable_name.toLowerCase() == countrytext || v.printable_name.toLowerCase() == countrytext || v.name.toLowerCase() == countrytext || v.iso.toLowerCase() == countrytext || v.iso3.toLowerCase() == countrytext) {
                country = v.numcode;
                return false;
            }
        });
    }

	output.country = country;

	if (output.country in Drupal.settings.weddingappdata.lang.provinces){

		var provincematch;
        if (address.province) {
            var provincetext = address.province.toLowerCase().replace(/[^a-z\s:]/g, '');
            $.each(Drupal.settings.weddingappdata.lang.provinces[output.country], function (k, v) {
                if (v.toLowerCase() == provincetext || k.toLowerCase() == provincetext) {
                    provincematch = k;
                    return false;
                }
            });
        }
		if (provincematch){
			output.province = provincematch;
		} else {
			output.province = (address.province || '').replace(/,/g, "").replace(/\r\n|\n/, "") || "";
		}
	} else {
		output.province = (address.province || '').replace(/,/g, "").replace(/\r\n|\n/, "") || "";
	}

	return output;
}

JSON.stringify = JSON.stringify || function (obj) {
	var t = typeof (obj);
	if (t != "object" || obj === null) {
		// simple data type
		if (t == "string") obj = '"'+obj+'"';
		return String(obj);
	}
	else {
		// recurse array or object
		var n, v, json = [], arr = (obj && obj.constructor == Array);
		for (n in obj) {
			v = obj[n]; t = typeof(v);
			if (t == "string") v = '"'+v+'"';
			else if (t == "object" && v !== null) v = JSON.stringify(v);
			json.push((arr ? "" : '"' + n + '":') + String(v));
		}
		return (arr ? "[" : "{") + String(json) + (arr ? "]" : "}");
	}
}

function formatURL(url, params){
	// Returns URL from parameters object and base url
	var $ = jQuery;
	return url + (url.indexOf('?') !== -1 ? '&' : '?') + $.map(params, function(v, k){return k + '=' + encodeURIComponent(v);}).join('&');
}

function formatURLScheme(url){
	// Returns URL with http or https depending on current protocol
	if (url){
		if (window.location.protocol == 'https:') {
			return url.replace('http:', 'https:');
		}
		return url.replace('https:', 'http:');
	}
	return url;
}

function formatLinks(inputText, options) {
	// Takes block of text and converts links into hyperlinks, video thumbnails and map previews
	// Optionally returns thumbnails found
	var $ = jQuery;
	options = $.extend({
		linkClass : 'inlineTextLink',	// Class prefix to give all links
		targetBlank : true,				// Opens links in new tab
		shortenLinks : true,			// Shortens long links to ...
		shortenLinksThreshold : 23,		// Max length of links before shortening
		backgroundTaskCallback: null,	// Callback for background-task links. If set, background tasks will be completed and a callback to this function will be made whereby a substitution for the original link can be made
	}, options);

	//URLs starting with http://, https://, or ftp://
	var replacePattern1 = /(src="|href="|">|\s>)?(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;‚Ä¢]*[-A-Z0-9+&@#\/%=~_|‚Ä¢]/gim;
 	var replacedText = inputText.replace(replacePattern1, function($0, $1) {
    	return $1 ? $0 : formatLink($0, options);
	});
	
	//URLS starting with www and not the above
	var replacePattern2 = /(src="|href="|">|\s>|https?:\/\/|ftp:\/\/)?www\.[-A-Z0-9+&@#\/%?=~_|!:,.;‚Ä¢]*[-A-Z0-9+&@#\/%=~_|‚Ä¢]/gim;
	var replacedText = replacedText.replace(replacePattern2, function($0, $1) {
		return $1 ? $0 : formatLink("http://" + $0, options);
	});

	return replacedText;
}

// Build jQuery function for applying formatLinks to element
jQuery.fn.formatLinks = function(options){
	var $ = jQuery;
	options = options || {};
	var $self = $(this);
	options = $.extend({}, options, {backgroundTaskCallback:function(url, replacementHTML){
		$self.contents().each(function(){
			if (this.nodeType == 3){$(this).replaceWith(this.nodeValue.replace(url, replacementHTML));}
		});
	}})
	$self.contents().each(function(){
		if (this.nodeType == 3){$(this).replaceWith(formatLinks(this.nodeValue, options));}
	});
	return this;
}

function formatLink(url, options){
	// Formats single link
	var $ = jQuery;
	options = $.extend({
		linkClass : 'inlineTextLink',	// Class prefix to give all links
		thumbnail: true,				// Allow thumbnail images, maps and videos
		targetBlank : true,				// Opens links in new tab
		shortenLinks : true,			// Shortens long links to ...
		shortenLinksThreshold : 23,		// Max length of links before shortening
		returnThumb: false,				// Return thumbnail image if found
		mapsize: [320, 240],			// Size of maps displayed
		backgroundTaskCallback: null,	// Callback for background-task links. If set, background tasks will be completed and a callback to this function will be made whereby a substitution for the original link can be made
	}, options);
	
	url = url.replace(/\u200B/g, "");

	function make_basic_url(url){
		// Can be called from inside thumbnailing methods if an error occurs and they fail
		return '<a class="' + options.linkClass + '" href="' + url + '"' + (options.targetBlank ? 'target="_blank"' : '') + '>' + (url.length > options.shortenLinksThreshold && options.shortenLinks ? url.substr(0, options.shortenLinksThreshold) + '...' : url) + '</a>';
	}
	if (options.thumbnail){
		if (url.indexOf("youtube.com") > -1 || url.indexOf("youtu.be") > -1 || url.indexOf("vimeo.com") > -1) {
			if (url.indexOf("youtube.com") > -1 || url.indexOf("youtu.be") > -1){
				//var regex = /http\:\/\/www\.youtube\.com\/watch\?v=(\w{11})/;
				var regex = /.*(?:youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=)([^#\&\?]*).*/;
				var matches = url.match(regex);
				if (!matches || matches.length == 0){return make_basic_url(url);}
				var id = matches[1];
				var thumburl = "http://img.youtube.com/vi/" + id + "/0.jpg";
				var replacedText = "<a class='" + options.linkClass + " " + options.linkClass + "-video' href='" + url + "' style='background-image:url(" + formatURLScheme(thumburl) + ");'" + (options.targetBlank ? 'target="_blank"' : '') + "'/>";
			} else if (url.indexOf("vimeo.com") > -1){
				var video_id = url.split("vimeo.com").pop().replace(/[^0-9]/g, '');
				var thumburl = "http://images.appycouple.com/thumbs/vimeo?vid="+video_id;
				var replacedText = "<a class='" + options.linkClass + " " + options.linkClass + "-video' href='" + url + "' style='background-image:url(" + formatURLScheme(thumburl) + ");'" + (options.targetBlank ? 'target="_blank"' : '') + "/>";
			}
		} else if (url.indexOf("maps.google.") > -1 || url.indexOf("google.com/maps") > -1) {
			var marker = '|';	// Default marker style options go here
			if (url.indexOf("sll=") !== -1) {
				var ll_rgxp = /sll=[^\,]*\,[^\&]*\&/g;
				var ll_match = url.match(ll_rgxp);
				if (!ll_match || ll_match.length == 0){return make_basic_url(url);}
				var ll_string = ll_match[0];
				var ll_string = ll_string.replace("sll=", "").replace("&", "");
				var latlng = ll_string.split(",");
				var lat = latlng[0];
				var lng = latlng[1];
				var parms = "center=" + lat + "," + lng;
				marker += lat + ',' + lng;
			} else if (url.indexOf("ll=") !== -1) {
				var ll_rgxp = /ll=[^\,]*\,[^\&]*\&/g;
				var ll_match = url.match(ll_rgxp);
				if (!ll_match || ll_match.length == 0){return make_basic_url(url);}
				var ll_string = ll_match[0];
				var ll_string = ll_string.replace("ll=", "").replace("&", "");
				var latlng = ll_string.split(",");
				var lat = latlng[0];
				var lng = latlng[1];
				var parms = "center=" + lat + "," + lng;
				marker += lat + ',' + lng;
			} else {
				var match = false;
				// Old ?q= urls
				var ll_rgxp = /q=.*/g;
				var ll_match = url.match(ll_rgxp);
				if (ll_match && ll_match.length){
					match = true;
					var ll_string = ll_match[0];
					ll_string = ll_string.replace(/&.*/, "").replace("q=", "");
					var parms = "center=" + ll_string;
					marker += ll_string;
				}
				// New /place urls
				ll_rgxp = /\/maps\/place\//i;
				ll_match = url.match(ll_rgxp)
				if (ll_match && ll_match.length){
					match = true;
					var ll_parts = url.toLowerCase().split('/maps/place/')[1].split('/');
					var ll_coords = ll_parts[1].replace('@', '').split(',');
					var parms = "center=" + ll_parts[0];
					marker += [ll_coords[0], ll_coords[1]].join(',');
				}
				if (!match){
					return make_basic_url(url);
				}
			}

			parms = parms + "&zoom=12&size="+options.mapsize[0]+"x"+options.mapsize[1]+"&sensor=false" + (marker ? "&markers=" + encodeURIComponent(marker) : '');
			var api_key = "AIzaSyAlit_bju3lGpd4oJ2E9w9PSD2DZ8PNzZE";

			var thumburl = "http://maps.googleapis.com/maps/api/staticmap?" + parms + "&key=" + api_key;
			var replacedText = "<a class='" + options.linkClass + " " + options.linkClass + "-map' href='" + url + "' style='background-image:url(" + formatURLScheme(thumburl) + ");'" + (options.targetBlank ? 'target="_blank"' : '') + "/>";
		} else if (url.indexOf("goo.gl/maps") > -1){
			if ($.isFunction(options.backgroundTaskCallback)){
				var _url = url;
				var mapsURL = $.ajax({url:'?q=ajax/interfaces/expandgoogleshorturl&url=' + encodeURIComponent(url), success:function(unpacked_url){
					var replacement = formatLink($.trim(unpacked_url), $.extend({}, options, {backgroundTaskCallback: null}));
					options.backgroundTaskCallback(_url, replacement);
				}});
				var thumburl = null;
				var replacedText = url;
			} else {
				var thumburl = null;
				var replacedText = make_basic_url(url);
			}
		} else {
			var thumburl = null;
			var replacedText = make_basic_url(url);
		}
	} else {
		var thumburl = null;
		var replacedText = make_basic_url(url);
	}
	if (options.returnThumb){
		return thumburl || false;
	}
	return replacedText;
}

function openPopUp(url, options){
	options = jQuery.extend({
		name:'popup',
		width:800,
		height:600,
		returnReference: false,
		inner_html: '',
	}, options)
	newwindow=window.open(url, options.name, (options.height ? 'height='+options.height + ',': '') + (options.width ? 'width='+options.width + ',': ''));
	
	if(options.returnReference){ newwindow.document.body.innerHTML = options.inner_html;}
	
	if (window.focus) {newwindow.focus()}

	return newwindow;
}

function get_associative_array_length(object){
	var $ = jQuery;
	var length = 0;
	$.each(object, function(k,v){length ++;});
	return length;
}

jQuery.fn.getCursorPosition = function() {
	var $ = jQuery;
    var el = $(this).get(0);
    var pos = 0;
    if('selectionStart' in el) {
        pos = el.selectionStart;
    } else if('selection' in document) {
        el.focus();
        var Sel = document.selection.createRange();
        var SelLength = document.selection.createRange().text.length;
        Sel.moveStart('character', -el.value.length);
        pos = Sel.text.length - SelLength;
    }
    return pos;
}

jQuery.sum = function(arr){
	var $ = jQuery;
    var r = 0;
    $.each(arr,function(i,v){
        r += v;
    });
    return r;
}
function weddingapp_parse_params (query) {
  var query_string = {};
  var vars = query.split("&");
  for (var i=0;i<vars.length;i++) {
    var pair = vars[i].split("=");
	if (pair[0] === undefined || pair[1] === undefined){continue;}
    pair[0] = decodeURIComponent(pair[0]);
    pair[1] = decodeURIComponent(pair[1]);
    	// If first entry with this name
    if (typeof query_string[pair[0]] === "undefined") {
      query_string[pair[0]] = pair[1];
    	// If second entry with this name
    } else if (typeof query_string[pair[0]] === "string") {
      var arr = [ query_string[pair[0]], pair[1] ];
      query_string[pair[0]] = arr;
    	// If third or later entry with this name
    } else {
      query_string[pair[0]].push(pair[1]);
    }
  } 
  return query_string;
};

function weddingapp_alert(text, options){
	// Alert dialog
	var $ = jQuery;
	var options = $.extend({
		onClose: null,
		lang: {
			'title': 'Alert',
			'finish': 'Ok', 
		},
	}, options)
	if (!$.isFunction($.fn.multistepform)){
		console.log('Cannot launch confirmation dialog: Multistep form not available.');
		if ($.isFunction(options.onClose)){options.onClose();}
		return;
	}
	var $page = $('<div class="step step0"></div>').html(text);
	var $multistep = $('<div></div>').append($page).multistepform({
		lang : $.extend($.extend({}, Drupal.settings.weddingappdata.lang.multistepform), options.lang),
		onClose : function(){
			if ($.isFunction(options.onClose)){options.onClose();}
		},
		width : 400,
		height : 200,
		dialogTitle: options.lang.title,
	});

}

function weddingapp_confirm(options){
	// Confirmation dialog
	var $ = jQuery;
	var options = $.extend({
		onYes: null,
		onNo: null,
		lang: {
			'title': 'Confirm',
			'finish': 'Delete',
			'cancel': 'Cancel',
			'question': 'Question', 
		},
	}, options)
	if (!$.isFunction($.fn.multistepform)){
		console.log('Cannot launch confirmation dialog: Multistep form not available.');
		if ($.isFunction(options.onYes)){options.onYes();}
		return;
	}
	var $page = $('<div class="step step0"></div>').html(options.lang.question);
	var $multistep = $('<div></div>').append($page).multistepform({
		lang : $.extend($.extend({}, Drupal.settings.weddingappdata.lang.multistepform), options.lang),
		onClose : null,
		width : 400,
		height : 200,
		dialogTitle: options.lang.title,
		customButtons: [{text: options.lang.cancel, click: function(){
				$multistep.multistepform('destroy');
				$multistep.remove();
				if ($.isFunction(options.onNo)){options.onNo();}
			}
		}],
		pageSave : function($dialog, step){
			if ($.isFunction(options.onYes)){options.onYes();}
		}
	});
}

function getCookie(check_name, default_value) {
	// first we'll split this cookie up into name/value pairs
	// note: document.cookie only returns name=value, not the other components
	var a_all_cookies = document.cookie.split( ';' );
	var a_temp_cookie = '';
	var cookie_name = '';
	var cookie_value = '';
	var b_cookie_found = false; // set boolean t/f default f

	for ( i = 0; i < a_all_cookies.length; i++ ) {
		// now we'll split apart each name=value pair
		a_temp_cookie = a_all_cookies[i].split( '=' );


		// and trim left/right whitespace while we're at it
		cookie_name = a_temp_cookie[0].replace(/^\s+|\s+$/g, '');

		// if the extracted name matches passed check_name
		if ( cookie_name == check_name )
		{
			b_cookie_found = true;
			// we need to handle case where cookie has no value but exists (no = sign, that is):
		if ( a_temp_cookie.length > 1 )
		{
			cookie_value = unescape( a_temp_cookie[1].replace(/^\s+|\s+$/g, '') );
		}
		// note that in cases where cookie is initialized but no value, null is returned
		return cookie_value;
		break;
	}
	a_temp_cookie = null;
	cookie_name = '';
	}
	if ( !b_cookie_found )
	{
		return default_value;
	}
}

function setCookie( name, value, expires, path, domain, secure ) {
	// set time, it's in milliseconds
	var today = new Date();
	today.setTime( today.getTime() );

	/*
	if the expires variable is set, make the correct
	expires time, the current script below will set
	it for x number of days, to make it for hours,
	delete * 24, for minutes, delete * 60 * 24
	*/
	if ( expires )
	{
	expires = expires * 1000 * 60 * 60 * 24;
	}
	var expires_date = new Date( today.getTime() + (expires) );

	document.cookie = name + "=" +escape( value ) +
	( ( expires ) ? ";expires=" + expires_date.toGMTString() : "" ) +
	( ( path ) ? ";path=" + path : "" ) +
	( ( domain ) ? ";domain=" + domain : "" ) +
	( ( secure ) ? ";secure" : "" );
}

function hw_format_address(address, options) {
	var $ = jQuery;
	var options = $.extend({
		showPhone: true,
		lineDelimiter: '<br>',
	}, options);
	// Formats an address object to printable
	var addressoutput = "";
	if (address.line1){addressoutput += address.line1 + options.lineDelimiter;}
	if (address.line2){addressoutput += address.line2 + options.lineDelimiter;}
	var ftl = false;	// Comma flag
	var nlf = false;	// New line flag
	if (address.city){
		addressoutput += address.city;
		ftl = true;
		nlf = true;
	}
	if (address.province){
		var provinces = Drupal.settings.weddingappdata.lang.provinces[address.country];
		if (provinces && (address.province.toUpperCase() in provinces)){
			var provincetext = provinces[address.province.toUpperCase()];
		} else {
			var provincetext = address.province;
		}
		addressoutput += (ftl == true ? ", " : "") + provincetext;
		ftl = false;
		nlf = true;
	}
	if (address.country) {
		var country = Drupal.settings.weddingappdata.countries[address.country];
		if (country){
			addressoutput += (nlf ? options.lineDelimiter : '') + country.printable_name + (address.postcode ? ", " : "");
			nlf = true;
		}
	}
	if (address.postcode){addressoutput += (address.country == 0 && nlf ? options.lineDelimiter : "") + address.postcode; ftl = true;}
	if (options.showPhone && address.phone){addressoutput += (nlf ? options.lineDelimiter : '') + hw_format_phonenumber(address.phone, address.country);}
	return addressoutput;
}

function hw_format_phonenumber(phone, country) {
	// (Converted from Rails function in home_helper.rb)
	// Converts phone numbers such as 1234567890 to (123) 456-7890
	// Requires iso3166 in namespace
	var $ = jQuery;
	if (phone == null) {
		return '';
	}
	
	// Identify country code
	if (phone.charAt(0) == '+'){
		areacode = phone.replace('+', '').split(' ')[0];
        // If area code not separated from rest of number by whitespace, assume area code of two digits (most common but not fully accurate)
		if (areacode.length > 3){areacode = areacode.slice(0,2);}
		iso_3166 = Drupal.settings.weddingappdata.countries || Drupal.settings.weddingappdata.iso3166 || Drupal.settings.weddingappdata.iso_3166;
		if (iso_3166){
			country = $.grep($.map(iso_3166, function(c){return c;}), function(c){return c.areacode == areacode;}).numcode || country;
		}
		phone = phone.replace('+'+areacode, '')
		if (areacode != 1){
			phone = '0' + phone;
		}
	}
	
	country = country ? parseInt(country) : 840;
	
	var numbers = phone.split('x')[0].replace(/[^0-9]/g, '');
	
	// Support line extensions in the format 01234567890x0123
	if (phone.split('x').length > 1) {
		var suffix = ' x ' + $.trim(phone.split('x')[1]);
	} else {
		var suffix = '';
	}

	// Identify north american area codes starting with country code, but no +
	if ((country == 840 || country == 124) && numbers.charAt(0) == "1"){
		return hw_format_phonenumber(numbers.slice(1) + (suffix ? suffix : ''), 840);
	}

	switch (numbers.length){
			case 7:
			// Europe
			switch (country){
				case 352:	// Iceland
					return numbers.substr(0, 3) + '-' + numbers.substr(3, 4) + suffix;
				break;
				default:
					// Failure to parse
					return phone;
				break;
			}
		case 8:
			// Europe
			switch (country){
				case 208:	// Denmark
					return numbers.substr(0, 2) + ' ' + numbers.substr(2, 2) + ' ' + numbers.substr(4, 2) + ' ' + numbers.substr(6, 2) + suffix;
				break;
				case 578:	// Norway
					if ($.inArray(numbers.substr(0, 1), [4, 9]) > -1){
						// Cellphones
						return numbers.substr(0, 3) + ' ' + numbers.substr(3, 2) + ' ' + numbers.substr(5, 3) + suffix;
					} else{
						return numbers.substr(0, 2) + ' ' + numbers.substr(2, 2) + ' ' + numbers.substr(4, 2) + ' ' + numbers.substr(6, 2) + suffix;
					}
				break;
				case 40:	// Austria (informal) alt. A BBB BBBB
					return numbers.substr(0, 1) + ' ' + numbers.substr(2, 3) + ' ' + numbers.substr(4, 2) + ' ' + numbers.substr(6, 2) + suffix;
				break;
				default:
					// Failure to parse
					return phone;
				break;
			}
		break;
		case 9:
			// Europe
			switch (country){
				case 724:	// Spain
					if ($.inArray(numbers.substr(0, 1), [6, 7]) > -1){
						// Cellphones
						return numbers.substr(0, 3) + ' ' + numbers.substr(3, 3) + ' ' + numbers.substr(6, 3) + suffix;
					} else {
						return numbers.substr(0, 3) + ' ' + numbers.substr(3, 2) + ' ' + numbers.substr(5, 2) + ' ' + numbers.substr(7, 2) + suffix;
					}
				break;
				default:
					// Failure to parse
					return phone;
				break;
			}
		break;
		case 10:
			// Europe
			switch (country){
				case 124:	// Canada
				case 840: 	// US
					return '(' + numbers.substr(0, 3) + ') ' + numbers.substr(3, 3) + '-' + numbers.substr(6, 4) + suffix;
				break;
				case 752:	// Sweden
					return numbers.substr(0, 2) + '-' + numbers.substr(2, 3) + ' ' + numbers.substr(5, 3) + ' ' + numbers.substr(8, 2) + suffix;
				break;
				case 756:	// Switzerland
					return numbers.substr(0, 3) + ' ' + numbers.substr(3, 6) + ' ' + numbers.substr(6, 2) + ' ' + numbers.substr(8, 2) + suffix;
				break;
				case 250:	// France
					return numbers.substr(0, 2) + ' ' + numbers.substr(2, 2) + ' ' + numbers.substr(4, 2) + ' ' + numbers.substr(6, 2) + ' ' + numbers.substr(8, 2) + suffix;
				break;
				case 380:	// Italy
					if (numbers.substr(0, 2) == "06"){
						// Italy landline (within Rome - after 1999 or nation wide)
						return numbers.substr(0, 2) + ' ' + numbers.substr(2, 8) + suffix;
					} else {
						// Italy cell 347 xxxxxxx  (within Italy - after 1999)
						return numbers.substr(0, 3) + ' ' + numbers.substr(3, 7) + suffix;
					}
				break;
				case 528:	// Netherlands
					if (numbers.substr(0, 2) == "06"){
						// 06-BBBBBBBB (cellphones)
						return numbers.substr(0, 2) + '-' + numbers.substr(2, 8) + suffix;
					} else {
						// 0AAA-BBBBBB or 0AA-BBBBBBB, both are used interchangeably
						return numbers.substr(0, 3) + '-' + numbers.substr(3, 7) + suffix;
					}
				break;
				default:
					// Failure to parse
					return phone;
				break;
			}
		break;
		case 11:
			switch (country){
				case 276:	// Germany (E.123 local)
					return '(' + numbers.substr(0, 5) + ') ' + numbers.substr(5, 6) + suffix;
				break;
				case 380:	// Italy cell 0347 xxxxxxx  (within Italy - before 1999 or San Marino)
					return numbers.substr(0, 4) + ' ' + numbers.substr(4, 7) + suffix;
				break;
				default:
					// UK
					// ref: http://en.wikipedia.org/wiki/Local_conventions_for_writing_telephone_numbers#United_Kingdom
					// (01xx) AAA BBBB (major non-urban)
					// (02x) AAAA AAAA (urban)
					// (01xxx) AAAAAA (non-urban)
					// 07AAA BBBBBB (mobile)
					if (numbers.substr(0, 2) == "01") {
						return '(' + numbers.substr(0, 4) + ') ' + numbers.substr(4, 3) + ' ' + numbers.substr(7, 4) + suffix;
					} else if (numbers.substr(0, 2) == "02") {
						return '(' + numbers.substr(0, 3) + ') ' + numbers.substr(3, 4) + ' ' + numbers.substr(7, 4) + suffix;
					} else if (numbers.substr(0, 2) == "07") {
						return '(' + numbers.substr(0, 5) + ') ' + numbers.substr(5, 6) + suffix;
					} else {
						// Failure to parse
						return phone;
					}
					break;
			}
		break;
		case 12:
			switch (country){
				case 40:	// Austria (AAAA BB BB BB BB)
					return numbers.substr(0, 4) + ' ' + numbers.substr(4, 2) + ' ' + numbers.substr(6, 2) + ' ' + numbers.substr(8, 2) . numbers.substr(10, 2) + suffix;
				break;
			}
		break;
		default:
			// Failure to parse
			return phone;
		break;
	}
	// Failure to parse (length)
	return phone;
}

function get_associative_array_length(object) {
	var $ = jQuery;
	var length = 0;
	$.each(object, function(k, v) {
		length++;
	});
	return length;
}
function notify(text, options){
	// Function to attach notifications to the page dynamically
	// By default this matches the style of existing system notifications
	var $ = jQuery;
	var options = $.extend({
		divClass: 'messages status',
		transitionInDuration: 500,
		transitionOutDuration: 325,
		duration: 3000,
		attachFn: 'prepend',
		target: '.left-corner, #content',
		slideDown: true,
		fadeIn: true,
		completed: null,	// Optional callback function
	}, options);
	var $notification = $('<div class="ajax-notification ' + options.divClass + '">').html(text);
	var $notification_container = $('<div style="overflow:hidden;' + (options.slideDown ? 'height:0;' : '') + (options.fadeIn ? 'opacity:0;' : '') + '">').append($notification);
	$(options.target)[options.attachFn]($notification_container);
	setTimeout(function(){
		var animProps = {};
		if (options.slideDown){animProps['height'] = $notification.outerHeight(true);}
		if (options.fadeIn){animProps['opacity'] = 1;}
		$notification_container.animate(animProps, options.transitionInDuration, 'swing');
	}, 0);
	if (options.duration) {
	    setTimeout(function() {
			var animProps = {};
			if (options.slideDown){animProps['height'] = 0;}
			if (options.fadeIn){animProps['opacity'] = 0;}
			$notification_container.animate(animProps, options.transitionOutDuration, 'swing', function() {
				setTimeout(function(){
					$notification_container.remove();
					if ($.isFunction(options.completed)){options.completed();}
				}, 100);
			});
	    }, options.duration);
	}
	return $notification_container;
}

function clear_notifications(){
	// Clears existing notifications
	var $ = jQuery;
	$('.ajax-notification').parent().remove();
}

function ajax_spinner(options){
	var $ = jQuery;
	var _opts = $.extend({
		parent: null,
		message: null,
		overlayClass: 'weddingapp-ajax-custom-overlay',
		spinnerClass: 'weddingapp-ajax-custom-spinner',
		messageClass: 'weddingapp-ajax-custom-message',
	}, options);
	var elem = $('<div class="' + _opts.overlayClass + '"><div class="' + _opts.spinnerClass + '"></div></div>');
	if (_opts.message) {
		$('.' + _opts.spinnerClass, elem).after('<div class="' + _opts.messageClass + '">' + _opts.message + '</div>');
	}
	$(elem).hide();
	$(_opts.parent).append(elem);
	$(elem).fadeIn(200);
	return elem;
}

function clear_ajax_spinner(options){
	var $ = jQuery;
	var _opts = $.extend({
		parent: null,
		overlayClass: 'weddingapp-ajax-custom-overlay',
	}, options);
	$('.' + _opts.overlayClass, _opts.parent).fadeOut(200, function(){$(this).remove();});
}

if (Drupal.ajax) {
	// Drupal ajax helpers
	Drupal.ajax.prototype.commands.ajax_signal = function(){
		// Allows triggering of ajaxComplete signal - this allows
		//  loosely associated javascript form helpers to regenerate
		//  when an ajax form or form part is replaced
		jQuery(document).trigger('ajaxComplete');
	}

	Drupal.ajax.prototype.commands.ajax_notify = function(ajax, response, status){
		// Allows triggering of ajaxComplete signal - this allows
		//  loosely associated javascript form helpers to regenerate
		//  when an ajax form or form part is replaced
		notify(response.text, response);
	}

	Drupal.ajax.prototype.commands.ajax_clear_notifications = function(){
		clear_notifications();
	}

	// Drupal extensions
	Drupal.ajax.prototype._beforeSend = Drupal.ajax.prototype.beforeSend;
	Drupal.ajax.prototype.beforeSend = function(xmlhttprequest, options){
		// Extended class for Drupal _beforeSend to allow custom progress spinners
		var $ = jQuery;
		this._beforeSend(xmlhttprequest, options);
		if (this.progress.type != 'throbber' && this.progress.type != 'bar'){
			// Match various class types
			switch(this.progress.type){
				case 'custom':
					var _opts = $.extend({
						parent: this.progress.parent,
						message: this.progress.message,
					}, options);
					
					this.progress.element = ajax_spinner(_opts);
					break;
			}
		}
	}
}
;
// Copyright AppeProPo Inc 2012
// This is a jQuery module to take a div containing form pages and display them as a multipart modal dialog with load/save callbacks.

(function($){
$.widget("ui.multistepform", {

	options:{
		appendTo:'body',		// Element to append dialog box to
		pageLoad:null,			// Called when page content is to be loaded	($dialog, step)
		pageSave:null,			// Called when page content is to be saved, prior to transitioning to next page ($dialog, step)
		onClose:null,			// Called when dialog is closed
		onButtonClick: null,	// Called when a default button is clicked (button, step)
		pageClass:'step',		// Class of page elements within the initializing container, suffixed with an index
		width:700,
		height:300,
		dialogContainer:document.body,
		dialogTitle:'',
		step:0,
		customButtons:{},
		buttonOrder:['previous', 'custom', 'next', 'finish'],
		lang:{
			'no dialog error': 'Error: Cannot initialise ui.multistepform. jQuery UI Dialog missing.',
			'previous': 'Previous',
			'next': 'Next',
			'finish': 'Finish',
		},
	},

	_init:function(){
		// _init is called every time the widget is reinitialized
		var self = this;
		
		// Check for jQuery UI Dialog
		if (!$.isFunction($.fn.dialog)){
			$(self.element).text(self.options.lang['no dialog error']);
			return;
		}
		
		//self.refresh();
	},
	_create:function(){	
		// _create is called once and only once
		
		// Bind 'this' to self local variable
		var self = this;

		// Check for jQuery UI Dialog
		if (!$.isFunction($.fn.dialog)){
			$(self.element).text(self.options.lang['no dialog error']);
			return;
		}

		// Build form buttons
		self.formButtons = {};
		self.formButtons['previous'] = {
			text: self.options.lang['previous'],
			click: function(){self.buttonCallback('previous');}
		};
		self.formButtons['next'] = {
			text: self.options.lang['next'],
			click: function(){self.buttonCallback('next');}
		};
		self.formButtons['finish'] = {
			text: self.options.lang['finish'],
			click: function(){self.buttonCallback('finish');}
		};
		
		// Initialize
		self.currentButtons = [self.formButtons['next']];
		self.$dialog = $("<div></div>");
		$(self.options.dialogContainer).append(self.$dialog);
		self.$dialog.dialog({
			appendTo: self.options.appendTo,
			draggable:false,
			resizable:false, 
			modal:true,
			width:self.options.width, 
			height:self.options.height, 
			title:self.options.dialogTitle,
			buttons:self.currentButtons,
			close:function(e){
				if ($.isFunction(self.options.onClose)){
					var result = self.options.onClose(self.$dialog);
					if (result === false){e.preventDefault(); return false;}
				}
				self.destroy();
			}
		});
		self.previousSteps = [];
		self.refresh();
	},
	destroy: function(){
		var self = this;
		self.$dialog.dialog('destroy');
		self.$dialog.remove();
	    $.Widget.prototype.destroy.call(self);
	},
	refresh: function(){
		var self = this;
		var $content = $('.'+self.options.pageClass+self.options.step, self.element).clone();
		var $dialog = self.$dialog.dialog('widget');
		self.enableButtons();
		$dialog.children('.ui-dialog-content').children().remove();
		$dialog.children('.ui-dialog-content').append($content);
		if ($.isFunction(self.options.pageLoad)){self.options.pageLoad($dialog, self.options.step);}	
	},
	_refreshButtons: function(){
		var self = this;
		var buttons = [];
		$.each(self.options.buttonOrder, function(i, button){
			switch (button){
				case 'previous':
					if ($('.'+self.options.pageClass+(self.options.step-1), self.element).length > 0){buttons.push(self.formButtons['previous']);}
				break;
				case 'custom':
					buttons = $.merge(buttons, self.options.customButtons);
				break;
				case 'next':
				case 'finish':
					if ($('.'+self.options.pageClass+(self.options.step+1), self.element).length == 0){
						if (button == 'finish'){buttons.push(self.formButtons['finish']);}
					} else {
						if (button == 'next'){buttons.push(self.formButtons['next']);}
					}
				break;
			}
		});

		if (buttons != self.currentButtons){
			self.$dialog.dialog('option', 'buttons', buttons);
			self.currentButtons = buttons;	
		}
		// Highlight last button
		self.$dialog.parent().find(".ui-dialog-buttonset").children('.ui-button').last().addClass('ui-state-active').mouseout(function(){$(this).addClass('ui-state-active');});
	},
	buttonCallback: function(item){
		var self = this;
		var currentStep = self.options.step;
		if ($.isFunction(self.options.pageSave)){
			var result = self.options.pageSave(self.$dialog.dialog('widget'), self.options.step);
			if (result === false){return false;}
		}	
		if ($.isFunction(self.options.onButtonClick)){self.options.onButtonClick(item, self.options.step);}
		switch (item){
			case 'previous':
				self.options.step = self.previousSteps.pop();
				self.refresh();
			break;
			case 'next':
				self.previousSteps.push(currentStep);
				self.options.step += 1;
				self.refresh();
			break;
			case 'finish':
				self.destroy();
			break;
		}
	},
	disableButtons: function(){
		var self = this;
		$.each(self.formButtons, function(k, v){
			self.formButtons[k].disabled = true;
		});
		self._refreshButtons();
	},
	disableButton: function(name){
		var self = this;
		self.formButtons[name].disabled = true;
		self._refreshButtons();
	},
	enableButtons: function(){
		var self = this;
		$.each(self.formButtons, function(k, v){
			self.formButtons[k].disabled = false;
		});
		self._refreshButtons();
	},
	enableButton: function(name){
		var self = this;
		self.formButtons[name].disabled = false;
		self._refreshButtons();
	},
	_setOption: function(key, value) {
		// handle new settings and update options
		var self = this;
		self.options[key] = value;
		switch (key) {
			case "buttonOrder":
			case "customButtons":
				self._refreshButtons();
			break;
			case "step":
				self.refresh();
			break;
			case "width":
				self.$dialog.dialog('option', 'width', value);
			break;
			case "height":
				self.$dialog.dialog('option', 'height', value);
			break;
			case "dialogTitle":
				self.$dialog.dialog('option', 'title', value);
			break;
		}
	},

	_get_associative_array_length: function(object){
		var length = 0;
		$.each(object, function(k,v){length ++;});
		return length;
	}

});

})(jQuery);;
// Chosen, a Select Box Enhancer for jQuery and Prototype
// by Patrick Filler for Harvest, http://getharvest.com
//
// Version 0.9.15
// Full source at https://github.com/harvesthq/chosen
// Copyright (c) 2011 Harvest http://getharvest.com

// MIT License, https://github.com/harvesthq/chosen/blob/master/LICENSE.md
// This file is generated by `grunt build`, do not edit it by hand.
!function(){var a;a=function(){function a(){this.options_index=0,this.parsed=[]}return a.prototype.add_node=function(a){return"OPTGROUP"===a.nodeName.toUpperCase()?this.add_group(a):this.add_option(a)},a.prototype.add_group=function(a){var b,c,d,e,f,g;for(b=this.parsed.length,this.parsed.push({array_index:b,group:!0,label:a.label,children:0,disabled:a.disabled}),f=a.childNodes,g=[],d=0,e=f.length;e>d;d++)c=f[d],g.push(this.add_option(c,b,a.disabled));return g},a.prototype.add_option=function(a,b,c){return"OPTION"===a.nodeName.toUpperCase()?(""!==a.text?(null!=b&&(this.parsed[b].children+=1),this.parsed.push({array_index:this.parsed.length,options_index:this.options_index,value:a.value,text:a.text,html:a.innerHTML,selected:a.selected,disabled:c===!0?c:a.disabled,group_array_index:b,classes:a.className,style:a.style.cssText})):this.parsed.push({array_index:this.parsed.length,options_index:this.options_index,empty:!0}),this.options_index+=1):void 0},a}(),a.select_to_array=function(b){var c,d,e,f,g;for(d=new a,g=b.childNodes,e=0,f=g.length;f>e;e++)c=g[e],d.add_node(c);return d.parsed},this.SelectParser=a}.call(this),function(){var a,b;b=this,a=function(){function a(b,c){this.form_field=b,this.options=null!=c?c:{},a.browser_is_supported()&&(this.is_multiple=this.form_field.multiple,this.set_default_text(),this.set_default_values(),this.setup(),this.set_up_html(),this.register_observers(),this.finish_setup())}return a.prototype.set_default_values=function(){var a=this;return this.click_test_action=function(b){return a.test_active_click(b)},this.activate_action=function(b){return a.activate_field(b)},this.active_field=!1,this.mouse_on_container=!1,this.results_showing=!1,this.result_highlighted=null,this.result_single_selected=null,this.allow_single_deselect=null!=this.options.allow_single_deselect&&null!=this.form_field.options[0]&&""===this.form_field.options[0].text?this.options.allow_single_deselect:!1,this.disable_search_threshold=this.options.disable_search_threshold||0,this.disable_search=this.options.disable_search||!1,this.enable_split_word_search=null!=this.options.enable_split_word_search?this.options.enable_split_word_search:!0,this.search_contains=this.options.search_contains||!1,this.single_backstroke_delete=this.options.single_backstroke_delete||!1,this.max_selected_options=this.options.max_selected_options||1/0,this.inherit_select_classes=this.options.inherit_select_classes||!1},a.prototype.set_default_text=function(){return this.default_text=this.form_field.getAttribute("data-placeholder")?this.form_field.getAttribute("data-placeholder"):this.is_multiple?this.options.placeholder_text_multiple||this.options.placeholder_text||a.default_multiple_text:this.options.placeholder_text_single||this.options.placeholder_text||a.default_single_text,this.results_none_found=this.form_field.getAttribute("data-no_results_text")||this.options.no_results_text||a.default_no_result_text},a.prototype.mouse_enter=function(){return this.mouse_on_container=!0},a.prototype.mouse_leave=function(){return this.mouse_on_container=!1},a.prototype.input_focus=function(){var a=this;if(this.is_multiple){if(!this.active_field)return setTimeout(function(){return a.container_mousedown()},50)}else if(!this.active_field)return this.activate_field()},a.prototype.input_blur=function(){var a=this;return this.mouse_on_container?void 0:(this.active_field=!1,setTimeout(function(){return a.blur_test()},100))},a.prototype.result_add_option=function(a){var b,c;return a.disabled?"":(a.dom_id=this.container_id+"_o_"+a.array_index,b=a.selected&&this.is_multiple?[]:["active-result"],a.selected&&b.push("result-selected"),null!=a.group_array_index&&b.push("group-option"),""!==a.classes&&b.push(a.classes),c=""!==a.style.cssText?' style="'+a.style+'"':"",'<li id="'+a.dom_id+'" class="'+b.join(" ")+'"'+c+">"+a.html+"</li>")},a.prototype.results_update_field=function(){return this.set_default_text(),this.is_multiple||this.results_reset_cleanup(),this.result_clear_highlight(),this.result_single_selected=null,this.results_build()},a.prototype.results_toggle=function(){return this.results_showing?this.results_hide():this.results_show()},a.prototype.results_search=function(){return this.results_showing?this.winnow_results():this.results_show()},a.prototype.choices_count=function(){var a,b,c,d;if(null!=this.selected_option_count)return this.selected_option_count;for(this.selected_option_count=0,d=this.form_field.options,b=0,c=d.length;c>b;b++)a=d[b],a.selected&&(this.selected_option_count+=1);return this.selected_option_count},a.prototype.choices_click=function(a){return a.preventDefault(),this.results_showing?void 0:this.results_show()},a.prototype.keyup_checker=function(a){var b,c;switch(b=null!=(c=a.which)?c:a.keyCode,this.search_field_scale(),b){case 8:if(this.is_multiple&&this.backstroke_length<1&&this.choices_count()>0)return this.keydown_backstroke();if(!this.pending_backstroke)return this.result_clear_highlight(),this.results_search();break;case 13:if(a.preventDefault(),this.results_showing)return this.result_select(a);break;case 27:return this.results_showing&&this.results_hide(),!0;case 9:case 38:case 40:case 16:case 91:case 17:break;default:return this.results_search()}},a.prototype.generate_field_id=function(){var a;return a=this.generate_random_id(),this.form_field.id=a,a},a.prototype.generate_random_char=function(){var a,b,c;return a="0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ",c=Math.floor(Math.random()*a.length),b=a.substring(c,c+1)},a.prototype.container_width=function(){return null!=this.options.width?this.options.width:""+this.form_field.offsetWidth+"px"},a.browser_is_supported=function(){var a;return"Microsoft Internet Explorer"===window.navigator.appName?null!==(a=document.documentMode)&&a>=8:!0},a.default_multiple_text="Select Some Options",a.default_single_text="Select an Option",a.default_no_result_text="No results match",a}(),b.AbstractChosen=a}.call(this),function(){var a,b,c,d,e={}.hasOwnProperty,f=function(a,b){function c(){this.constructor=a}for(var d in b)e.call(b,d)&&(a[d]=b[d]);return c.prototype=b.prototype,a.prototype=new c,a.__super__=b.prototype,a};c=this,a=jQuery,a.fn.extend({chosen:function(c){return AbstractChosen.browser_is_supported()?this.each(function(){var d;return d=a(this),d.hasClass("chzn-done")?void 0:d.data("chosen",new b(this,c))}):this}}),b=function(b){function e(){return d=e.__super__.constructor.apply(this,arguments)}return f(e,b),e.prototype.setup=function(){return this.form_field_jq=a(this.form_field),this.current_selectedIndex=this.form_field.selectedIndex,this.is_rtl=this.form_field_jq.hasClass("chzn-rtl")},e.prototype.finish_setup=function(){return this.form_field_jq.addClass("chzn-done")},e.prototype.set_up_html=function(){var b,c;return this.container_id=this.form_field.id.length?this.form_field.id.replace(/[^\w]/g,"_"):this.generate_field_id(),this.container_id+="_chzn",b=["chzn-container"],b.push("chzn-container-"+(this.is_multiple?"multi":"single")),this.inherit_select_classes&&this.form_field.className&&b.push(this.form_field.className),this.is_rtl&&b.push("chzn-rtl"),c={id:this.container_id,"class":b.join(" "),style:"width: "+this.container_width()+";",title:this.form_field.title},this.container=a("<div />",c),this.is_multiple?this.container.html('<ul class="chzn-choices"><li class="search-field"><input type="text" value="'+this.default_text+'" class="default" autocomplete="off" style="width:25px;" /></li></ul><div class="chzn-drop"><ul class="chzn-results"></ul></div>'):this.container.html('<a href="javascript:void(0)" class="chzn-single chzn-default" tabindex="-1"><span>'+this.default_text+'</span><div><b></b></div></a><div class="chzn-drop"><div class="chzn-search"><input type="text" autocomplete="off" /></div><ul class="chzn-results"></ul></div>'),this.form_field_jq.hide().after(this.container),this.dropdown=this.container.find("div.chzn-drop").first(),this.search_field=this.container.find("input").first(),this.search_results=this.container.find("ul.chzn-results").first(),this.search_field_scale(),this.search_no_results=this.container.find("li.no-results").first(),this.is_multiple?(this.search_choices=this.container.find("ul.chzn-choices").first(),this.search_container=this.container.find("li.search-field").first()):(this.search_container=this.container.find("div.chzn-search").first(),this.selected_item=this.container.find(".chzn-single").first()),this.results_build(),this.set_tab_index(),this.set_label_behavior(),this.form_field_jq.trigger("liszt:ready",{chosen:this})},e.prototype.register_observers=function(){var a=this;return this.container.mousedown(function(b){a.container_mousedown(b)}),this.container.mouseup(function(b){a.container_mouseup(b)}),this.container.mouseenter(function(b){a.mouse_enter(b)}),this.container.mouseleave(function(b){a.mouse_leave(b)}),this.search_results.mouseup(function(b){a.search_results_mouseup(b)}),this.search_results.mouseover(function(b){a.search_results_mouseover(b)}),this.search_results.mouseout(function(b){a.search_results_mouseout(b)}),this.search_results.bind("mousewheel DOMMouseScroll",function(b){a.search_results_mousewheel(b)}),this.form_field_jq.bind("liszt:updated",function(b){a.results_update_field(b)}),this.form_field_jq.bind("liszt:activate",function(b){a.activate_field(b)}),this.form_field_jq.bind("liszt:open",function(b){a.container_mousedown(b)}),this.search_field.blur(function(b){a.input_blur(b)}),this.search_field.keyup(function(b){a.keyup_checker(b)}),this.search_field.keydown(function(b){a.keydown_checker(b)}),this.search_field.focus(function(b){a.input_focus(b)}),this.is_multiple?this.search_choices.click(function(b){a.choices_click(b)}):this.container.click(function(a){a.preventDefault()})},e.prototype.search_field_disabled=function(){return this.is_disabled=this.form_field_jq[0].disabled,this.is_disabled?(this.container.addClass("chzn-disabled"),this.search_field[0].disabled=!0,this.is_multiple||this.selected_item.unbind("focus",this.activate_action),this.close_field()):(this.container.removeClass("chzn-disabled"),this.search_field[0].disabled=!1,this.is_multiple?void 0:this.selected_item.bind("focus",this.activate_action))},e.prototype.container_mousedown=function(b){return this.is_disabled||(b&&"mousedown"===b.type&&!this.results_showing&&b.preventDefault(),null!=b&&a(b.target).hasClass("search-choice-close"))?void 0:(this.active_field?this.is_multiple||!b||a(b.target)[0]!==this.selected_item[0]&&!a(b.target).parents("a.chzn-single").length||(b.preventDefault(),this.results_toggle()):(this.is_multiple&&this.search_field.val(""),a(document).click(this.click_test_action),this.results_show()),this.activate_field())},e.prototype.container_mouseup=function(a){return"ABBR"!==a.target.nodeName||this.is_disabled?void 0:this.results_reset(a)},e.prototype.search_results_mousewheel=function(a){var b,c,d;return b=-(null!=(c=a.originalEvent)?c.wheelDelta:void 0)||(null!=(d=a.originialEvent)?d.detail:void 0),null!=b?(a.preventDefault(),"DOMMouseScroll"===a.type&&(b=40*b),this.search_results.scrollTop(b+this.search_results.scrollTop())):void 0},e.prototype.blur_test=function(){return!this.active_field&&this.container.hasClass("chzn-container-active")?this.close_field():void 0},e.prototype.close_field=function(){return a(document).unbind("click",this.click_test_action),this.active_field=!1,this.results_hide(),this.container.removeClass("chzn-container-active"),this.winnow_results_clear(),this.clear_backstroke(),this.show_search_field_default(),this.search_field_scale()},e.prototype.activate_field=function(){return this.container.addClass("chzn-container-active"),this.active_field=!0,this.search_field.val(this.search_field.val()),this.search_field.focus()},e.prototype.test_active_click=function(b){return a(b.target).parents("#"+this.container_id).length?this.active_field=!0:this.close_field()},e.prototype.results_build=function(){var a,b,d,e,f;for(this.parsing=!0,this.selected_option_count=null,this.results_data=c.SelectParser.select_to_array(this.form_field),this.is_multiple&&this.choices_count()>0?this.search_choices.find("li.search-choice").remove():this.is_multiple||(this.selected_item.addClass("chzn-default").find("span").text(this.default_text),this.disable_search||this.form_field.options.length<=this.disable_search_threshold?this.container.addClass("chzn-container-single-nosearch"):this.container.removeClass("chzn-container-single-nosearch")),a="",f=this.results_data,d=0,e=f.length;e>d;d++)b=f[d],b.group?a+=this.result_add_group(b):b.empty||(a+=this.result_add_option(b),b.selected&&this.is_multiple?this.choice_build(b):b.selected&&!this.is_multiple&&(this.selected_item.removeClass("chzn-default").find("span").text(b.text),this.allow_single_deselect&&this.single_deselect_control_build()));return this.search_field_disabled(),this.show_search_field_default(),this.search_field_scale(),this.search_results.html(a),this.parsing=!1},e.prototype.result_add_group=function(b){return b.disabled?"":(b.dom_id=this.container_id+"_g_"+b.array_index,'<li id="'+b.dom_id+'" class="group-result">'+a("<div />").text(b.label).html()+"</li>")},e.prototype.result_do_highlight=function(a){var b,c,d,e,f;if(a.length){if(this.result_clear_highlight(),this.result_highlight=a,this.result_highlight.addClass("highlighted"),d=parseInt(this.search_results.css("maxHeight"),10),f=this.search_results.scrollTop(),e=d+f,c=this.result_highlight.position().top+this.search_results.scrollTop(),b=c+this.result_highlight.outerHeight(),b>=e)return this.search_results.scrollTop(b-d>0?b-d:0);if(f>c)return this.search_results.scrollTop(c)}},e.prototype.result_clear_highlight=function(){return this.result_highlight&&this.result_highlight.removeClass("highlighted"),this.result_highlight=null},e.prototype.results_show=function(){if(null!=this.result_single_selected)this.result_do_highlight(this.result_single_selected);else if(this.is_multiple&&this.max_selected_options<=this.choices_count())return this.form_field_jq.trigger("liszt:maxselected",{chosen:this}),!1;return this.container.addClass("chzn-with-drop"),this.form_field_jq.trigger("liszt:showing_dropdown",{chosen:this}),this.results_showing=!0,this.search_field.focus(),this.search_field.val(this.search_field.val()),this.winnow_results()},e.prototype.results_hide=function(){return this.result_clear_highlight(),this.container.removeClass("chzn-with-drop"),this.form_field_jq.trigger("liszt:hiding_dropdown",{chosen:this}),this.results_showing=!1},e.prototype.set_tab_index=function(){var a;return this.form_field_jq.attr("tabindex")?(a=this.form_field_jq.attr("tabindex"),this.form_field_jq.attr("tabindex",-1),this.search_field.attr("tabindex",a)):void 0},e.prototype.set_label_behavior=function(){var b=this;return this.form_field_label=this.form_field_jq.parents("label"),!this.form_field_label.length&&this.form_field.id.length&&(this.form_field_label=a("label[for='"+this.form_field.id+"']")),this.form_field_label.length>0?this.form_field_label.click(function(a){return b.is_multiple?b.container_mousedown(a):b.activate_field()}):void 0},e.prototype.show_search_field_default=function(){return this.is_multiple&&this.choices_count()<1&&!this.active_field?(this.search_field.val(this.default_text),this.search_field.addClass("default")):(this.search_field.val(""),this.search_field.removeClass("default"))},e.prototype.search_results_mouseup=function(b){var c;return c=a(b.target).hasClass("active-result")?a(b.target):a(b.target).parents(".active-result").first(),c.length?(this.result_highlight=c,this.result_select(b),this.search_field.focus()):void 0},e.prototype.search_results_mouseover=function(b){var c;return c=a(b.target).hasClass("active-result")?a(b.target):a(b.target).parents(".active-result").first(),c?this.result_do_highlight(c):void 0},e.prototype.search_results_mouseout=function(b){return a(b.target).hasClass("active-result")?this.result_clear_highlight():void 0},e.prototype.choice_build=function(b){var c,d,e=this;return c=a("<li />",{"class":"search-choice"}).html("<span>"+b.html+"</span>"),b.disabled?c.addClass("search-choice-disabled"):(d=a("<a />",{href:"#","class":"search-choice-close",rel:b.array_index}),d.click(function(a){return e.choice_destroy_link_click(a)}),c.append(d)),this.search_container.before(c)},e.prototype.choice_destroy_link_click=function(b){return b.preventDefault(),b.stopPropagation(),this.is_disabled?void 0:this.choice_destroy(a(b.target))},e.prototype.choice_destroy=function(a){return this.result_deselect(a.attr("rel"))?(this.show_search_field_default(),this.is_multiple&&this.choices_count()>0&&this.search_field.val().length<1&&this.results_hide(),a.parents("li").first().remove(),this.search_field_scale()):void 0},e.prototype.results_reset=function(){return this.form_field.options[0].selected=!0,this.selected_option_count=null,this.selected_item.find("span").text(this.default_text),this.is_multiple||this.selected_item.addClass("chzn-default"),this.show_search_field_default(),this.results_reset_cleanup(),this.form_field_jq.trigger("change"),this.active_field?this.results_hide():void 0},e.prototype.results_reset_cleanup=function(){return this.current_selectedIndex=this.form_field.selectedIndex,this.selected_item.find("abbr").remove()},e.prototype.result_select=function(a){var b,c,d,e;return this.result_highlight?(b=this.result_highlight,c=b.attr("id"),this.result_clear_highlight(),this.is_multiple&&this.max_selected_options<=this.choices_count()?(this.form_field_jq.trigger("liszt:maxselected",{chosen:this}),!1):(this.is_multiple?this.result_deactivate(b):(this.search_results.find(".result-selected").removeClass("result-selected"),this.result_single_selected=b,this.selected_item.removeClass("chzn-default")),b.addClass("result-selected"),e=c.substr(c.lastIndexOf("_")+1),d=this.results_data[e],d.selected=!0,this.form_field.options[d.options_index].selected=!0,this.selected_option_count=null,this.is_multiple?this.choice_build(d):(this.selected_item.find("span").first().text(d.text),this.allow_single_deselect&&this.single_deselect_control_build()),(a.metaKey||a.ctrlKey)&&this.is_multiple||this.results_hide(),this.search_field.val(""),(this.is_multiple||this.form_field.selectedIndex!==this.current_selectedIndex)&&this.form_field_jq.trigger("change",{selected:this.form_field.options[d.options_index].value}),this.current_selectedIndex=this.form_field.selectedIndex,this.search_field_scale())):void 0},e.prototype.result_activate=function(a){return a.addClass("active-result")},e.prototype.result_deactivate=function(a){return a.removeClass("active-result")},e.prototype.result_deselect=function(b){var c,d;return d=this.results_data[b],this.form_field.options[d.options_index].disabled?!1:(d.selected=!1,this.form_field.options[d.options_index].selected=!1,this.selected_option_count=null,c=a("#"+this.container_id+"_o_"+b),c.removeClass("result-selected").addClass("active-result").show(),this.result_clear_highlight(),this.winnow_results(),this.form_field_jq.trigger("change",{deselected:this.form_field.options[d.options_index].value}),this.search_field_scale(),!0)},e.prototype.single_deselect_control_build=function(){return this.allow_single_deselect?(this.selected_item.find("abbr").length||this.selected_item.find("span").first().after('<abbr class="search-choice-close"></abbr>'),this.selected_item.addClass("chzn-single-with-deselect")):void 0},e.prototype.winnow_results=function(){var b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s;for(this.no_results_clear(),j=0,k=this.search_field.val()===this.default_text?"":a("<div/>").text(a.trim(this.search_field.val())).html(),g=this.search_contains?"":"^",f=new RegExp(g+k.replace(/[-[\]{}()*+?.,\\^$|#\s]/g,"\\$&"),"i"),n=new RegExp(k.replace(/[-[\]{}()*+?.,\\^$|#\s]/g,"\\$&"),"i"),s=this.results_data,o=0,q=s.length;q>o;o++)if(c=s[o],!c.disabled&&!c.empty)if(c.group)a("#"+c.dom_id).css("display","none");else if(!this.is_multiple||!c.selected){if(b=!1,i=c.dom_id,h=a("#"+i),f.test(c.html))b=!0,j+=1;else if(this.enable_split_word_search&&(c.html.indexOf(" ")>=0||0===c.html.indexOf("["))&&(e=c.html.replace(/\[|\]/g,"").split(" "),e.length))for(p=0,r=e.length;r>p;p++)d=e[p],f.test(d)&&(b=!0,j+=1);b?(k.length?(l=c.html.search(n),m=c.html.substr(0,l+k.length)+"</em>"+c.html.substr(l+k.length),m=m.substr(0,l)+"<em>"+m.substr(l)):m=c.html,h.html(m),this.result_activate(h),null!=c.group_array_index&&a("#"+this.results_data[c.group_array_index].dom_id).css("display","list-item")):(this.result_highlight&&i===this.result_highlight.attr("id")&&this.result_clear_highlight(),this.result_deactivate(h))}return 1>j&&k.length?this.no_results(k):this.winnow_results_set_highlight()},e.prototype.winnow_results_clear=function(){var b,c,d,e,f;for(this.search_field.val(""),c=this.search_results.find("li"),f=[],d=0,e=c.length;e>d;d++)b=c[d],b=a(b),b.hasClass("group-result")?f.push(b.css("display","auto")):this.is_multiple&&b.hasClass("result-selected")?f.push(void 0):f.push(this.result_activate(b));return f},e.prototype.winnow_results_set_highlight=function(){var a,b;return this.result_highlight||(b=this.is_multiple?[]:this.search_results.find(".result-selected.active-result"),a=b.length?b.first():this.search_results.find(".active-result").first(),null==a)?void 0:this.result_do_highlight(a)},e.prototype.no_results=function(b){var c;return c=a('<li class="no-results">'+this.results_none_found+' "<span></span>"</li>'),c.find("span").first().html(b),this.search_results.append(c)},e.prototype.no_results_clear=function(){return this.search_results.find(".no-results").remove()},e.prototype.keydown_arrow=function(){var b,c;return this.result_highlight?this.results_showing&&(c=this.result_highlight.nextAll("li.active-result").first(),c&&this.result_do_highlight(c)):(b=this.search_results.find("li.active-result").first(),b&&this.result_do_highlight(a(b))),this.results_showing?void 0:this.results_show()},e.prototype.keyup_arrow=function(){var a;return this.results_showing||this.is_multiple?this.result_highlight?(a=this.result_highlight.prevAll("li.active-result"),a.length?this.result_do_highlight(a.first()):(this.choices_count()>0&&this.results_hide(),this.result_clear_highlight())):void 0:this.results_show()},e.prototype.keydown_backstroke=function(){var a;return this.pending_backstroke?(this.choice_destroy(this.pending_backstroke.find("a").first()),this.clear_backstroke()):(a=this.search_container.siblings("li.search-choice").last(),a.length&&!a.hasClass("search-choice-disabled")?(this.pending_backstroke=a,this.single_backstroke_delete?this.keydown_backstroke():this.pending_backstroke.addClass("search-choice-focus")):void 0)},e.prototype.clear_backstroke=function(){return this.pending_backstroke&&this.pending_backstroke.removeClass("search-choice-focus"),this.pending_backstroke=null},e.prototype.keydown_checker=function(a){var b,c;switch(b=null!=(c=a.which)?c:a.keyCode,this.search_field_scale(),8!==b&&this.pending_backstroke&&this.clear_backstroke(),b){case 8:this.backstroke_length=this.search_field.val().length;break;case 9:this.results_showing&&!this.is_multiple&&this.result_select(a),this.mouse_on_container=!1;break;case 13:a.preventDefault();break;case 38:a.preventDefault(),this.keyup_arrow();break;case 40:this.keydown_arrow()}},e.prototype.search_field_scale=function(){var b,c,d,e,f,g,h,i;if(this.is_multiple){for(c=0,g=0,e="position:absolute; left: -1000px; top: -1000px; display:none;",f=["font-size","font-style","font-weight","font-family","line-height","text-transform","letter-spacing"],h=0,i=f.length;i>h;h++)d=f[h],e+=d+":"+this.search_field.css(d)+";";return b=a("<div />",{style:e}),b.text(this.search_field.val()),a("body").append(b),g=b.width()+25,b.remove(),this.f_width||(this.f_width=this.container.outerWidth()),g>this.f_width-10&&(g=this.f_width-10),this.search_field.css({width:g+"px"})}},e.prototype.generate_random_id=function(){var b;for(b="sel"+this.generate_random_char()+this.generate_random_char()+this.generate_random_char();a("#"+b).length>0;)b+=this.generate_random_char();return b},e}(AbstractChosen),c.Chosen=b}.call(this);;
(function($) {

    $.fn.chosenImage = function(options) {

        return this.each(function() {

            var $select = $(this),
                imgMap  = {};

            // 1. Retrieve img-src from data attribute and build object of image sources for each list item
				function regenerateImageMap(){
				    $select.find('option').filter(function(){
		                return $(this).text();
		            }).each(function(i) {
		                    var imgSrc   = $(this).attr('data-img-src');
		                    imgMap[i]    = imgSrc;
		            });
				}
				regenerateImageMap();


            // 2. Execute chosen plugin
            $select.chosen(options);

            // 2.1 update (or create) div.chzn-container id
            var chzn_id = $select.attr('id').length ? $select.attr('id').replace(/[^\w]/g, '_') : this.generate_field_id();
            chzn_id += "_chzn";

            var  chzn      = '#' + chzn_id,            
                $chzn      = $(chzn).addClass('chznImage-container');


            // 3. Style lis with image sources
				function updateResults(){
		            $chzn.find('.chzn-results li').each(function(i) {
		                $(this).css(cssObj(imgMap[i]));
						$(this)[imgMap[i] ? 'addClass' : 'removeClass']('chzn-icon');
		            });
				}
				updateResults();
				
            // 4. Change image on chosen selected element when form changes
            $select.change(function() {
                var imgSrc = ($select.find('option:selected').attr('data-img-src')) 
                                ? $select.find('option:selected').attr('data-img-src') : '';
				$chzn.find('.chzn-single span').css(cssObj(imgSrc))[imgSrc ? 'addClass' : 'removeClass']('chzn-icon');

            });

            $select.trigger('change');

			// 5. Bind to liszt:update trigger
			$select.off('liszt:updated.chznImage').on('liszt:updated.chznImage', function(){
				regenerateImageMap();
				updateResults();
				$select.trigger('change');
			});

            // Utilties
            function cssObj(imgSrc) {
                if(imgSrc) {
                    return {
                        'background-image': 'url(' + imgSrc + ')',
                        'background-repeat': 'no-repeat',
                    }
                } else {
                    return {
                        'background-image': 'none'
                    }
                }
            }
        });
    }

})(jQuery);
;
(function($) {
  $.widget("ui.toggleswitch", {
    // creates a toggle switch

    // widget options
    options: {
      onOn: null,      // run when switch is turned to 'on' position
      onOff: null,     // run when switch is turned to 'off' position
      onChange:null,	// run when switch is changed
      toggled: false,  // whether switch is toggled or not
      lang: {
        'On': 'ON',
        'Off': 'OFF'
      }
    },

    // called every time the widget is reinitialized
    _init: function() {
      var self, $e;

      self = this;
	
      $e = $(self.element);

      if (self.options.toggled == true) { $e.addClass("on"); }
      
      // Define custom valHook
      // Allows compatibility with jQuery form code
      $e.each(function(){$(this).get()[0].type='toggleswitch';});
      $.valHooks.toggleswitch = {
      	get: function(a){return $(a).toggleswitch('option', 'toggled') == true ? 1 : 0;},
      	set: function(a,b){$(a).toggleswitch('option', 'toggled', (b == true ? true : false));},
      };
    },

    // called when the widget is initialized the first time
    _create: function() {
      var self, $e, toggleSwitch, onLabel, offLabel;

      self = this;
      $e = $(self.element);

      if ($e.css('display') === 'inline') { $e.css('display', 'inline-block'); }

      toggleSwitch = $("<div>").addClass("switch");

      if (self.options.toggled == 1) { $e.addClass("on"); }

      $e.append(toggleSwitch);
      $e.addClass("ui-toggleswitch");

      self.bindEvents();
    },

    // Handles updating and setting of options
    //
    // key = option being updated/set
    // value = value of option being updated/set
    //
    // Returns nothing
    _setOption: function(key, value) {
      var self, elem;

      self = this;
      elem = $(self.element);

      switch (key) {
        case "toggled":
          self.options[key] = value;
          if (value == true) {
            elem.addClass('on');
          } else {
            elem.removeClass('on');
          }
          break;
      }
    },

    // Binds click event to element
    bindEvents: function() {
      var self, $e;

      self = this;
      $e = $(self.element);

      $e.off('click.ui-toggleswitch').on('click.ui-toggleswitch', function() {
        var elem = $e;

        if (elem.hasClass('on')) {
          elem.removeClass('on');
          self.options.toggled = false;
          if ($.isFunction(self.options.onOff)) { self.options.onOff(); }
          if ($.isFunction(self.options.onChange)){ self.options.onChange(0); }
        } else {
          elem.addClass('on');
          self.options.toggled = true;
          if ($.isFunction(self.options.onOn)) { self.options.onOn(); }
          if ($.isFunction(self.options.onChange)){ self.options.onChange(1); }
        }
      });
    },
	_destroy: function(){
		var self = this, $e;
        $e = $(self.element);
		$e.off('click.ui-toggleswitch');
		$e.removeClass("ui-toggleswitch on");
		$e.children().remove();
	}
  });
})(jQuery);
;
(function($) {
	$.widget("ui.spinbutton", {
		// creates a spinbutton increment

		// widget options
		options : {
			onChange : null, 		// run when switch is turned to 'on' position
			min : null, 			// min spinner value
			max : null,				// max spinner value
			value: 0,				// spinner value (can be set to string)
			valuePrefix: '',		// text to prepend to label
			valueSuffix: '',		// text to append to label
		},

		// called every time the widget is reinitialized
		_init : function() {
			var self = this;
			var $e = $(self.element);
		},

		// called when the widget is initialized the first time
		_create : function() {
			var self = this;
			var $e = $(self.element);

			if ($e.css('display') === 'inline') {
				$e.css('display', 'inline-block');
			}

			$("<span>").addClass("ui-spinbutton-down").button({icons: {primary: "ui-icon-minus"}, text: false}).click(function(){
				var value = isNaN(parseInt(self.options.value)) ? 0 : parseInt(self.options.value);
				if (value == self.options.min){return;}
				self._setOption('value', value - 1);
				if ($.isFunction(self.options.onChange)){self.options.onChange(self.options.value);}
			}).appendTo($e);
			$("<span>").addClass("ui-spinbutton-label").appendTo($e);
			$("<span>").addClass("ui-spinbutton-up").button({icons: {primary: "ui-icon-plus"}, text: false}).click(function(){
				var value = isNaN(parseInt(self.options.value)) ? 0 : parseInt(self.options.value);
				if (value == self.options.max){return;}
				self._setOption('value', value + 1);
				if ($.isFunction(self.options.onChange)){self.options.onChange(self.options.value);}
			}).appendTo($e);

			self._setOption('value', self.options.value);
			
			$e.addClass("ui-spinbutton");

		},

		// Handles updating and setting of options
		//
		// key = option being updated/set
		// value = value of option being updated/set
		//
		// Returns nothing
		_setOption : function(key, value) {
			var self = this;
			var $elem = $(self.element);
			self.options[key] = value;
			switch(key){
				case 'valuePrefix', 'valueSuffix':
					self._setOption('value', self.options.value);
				break;
				case 'value':
					$elem.find('.ui-spinbutton-label').text(self.options.valuePrefix + self.options.value + self.options.valueSuffix);
					if (value == self.options.min){$elem.find('.ui-spinbutton-down').button('option', 'disabled', true);}else{$elem.find('.ui-spinbutton-down').button('option', 'disabled', false);}
					if (value == self.options.max){$elem.find('.ui-spinbutton-up').button('option', 'disabled', true);}else{$elem.find('.ui-spinbutton-up').button('option', 'disabled', false);}
				break;
				case 'max':
					if (self.options.value > self.options.max){self._setOption('value', value);}
				break;
				case 'min':
					if (self.options.value < self.options.min){self._setOption('value', value);}
				break;
			}

		},
	});
})(jQuery);
;
/**
 * Copyright (c) 2007-2013 Ariel Flesler - aflesler<a>gmail<d>com | http://flesler.blogspot.com
 * Dual licensed under MIT and GPL.
 * @author Ariel Flesler
 * @version 1.4.6
 */
;(function($){var h=$.scrollTo=function(a,b,c){$(window).scrollTo(a,b,c)};h.defaults={axis:'xy',duration:parseFloat($.fn.jquery)>=1.3?0:1,limit:true};h.window=function(a){return $(window)._scrollable()};$.fn._scrollable=function(){return this.map(function(){var a=this,isWin=!a.nodeName||$.inArray(a.nodeName.toLowerCase(),['iframe','#document','html','body'])!=-1;if(!isWin)return a;var b=(a.contentWindow||a).document||a.ownerDocument||a;return/webkit/i.test(navigator.userAgent)||b.compatMode=='BackCompat'?b.body:b.documentElement})};$.fn.scrollTo=function(e,f,g){if(typeof f=='object'){g=f;f=0}if(typeof g=='function')g={onAfter:g};if(e=='max')e=9e9;g=$.extend({},h.defaults,g);f=f||g.duration;g.queue=g.queue&&g.axis.length>1;if(g.queue)f/=2;g.offset=both(g.offset);g.over=both(g.over);return this._scrollable().each(function(){if(e==null)return;var d=this,$elem=$(d),targ=e,toff,attr={},win=$elem.is('html,body');switch(typeof targ){case'number':case'string':if(/^([+-]=?)?\d+(\.\d+)?(px|%)?$/.test(targ)){targ=both(targ);break}targ=$(targ,this);if(!targ.length)return;case'object':if(targ.is||targ.style)toff=(targ=$(targ)).offset()}$.each(g.axis.split(''),function(i,a){var b=a=='x'?'Left':'Top',pos=b.toLowerCase(),key='scroll'+b,old=d[key],max=h.max(d,a);if(toff){attr[key]=toff[pos]+(win?0:old-$elem.offset()[pos]);if(g.margin){attr[key]-=parseInt(targ.css('margin'+b))||0;attr[key]-=parseInt(targ.css('border'+b+'Width'))||0}attr[key]+=g.offset[pos]||0;if(g.over[pos])attr[key]+=targ[a=='x'?'width':'height']()*g.over[pos]}else{var c=targ[pos];attr[key]=c.slice&&c.slice(-1)=='%'?parseFloat(c)/100*max:c}if(g.limit&&/^\d+$/.test(attr[key]))attr[key]=attr[key]<=0?0:Math.min(attr[key],max);if(!i&&g.queue){if(old!=attr[key])animate(g.onAfterFirst);delete attr[key]}});animate(g.onAfter);function animate(a){$elem.animate(attr,f,g.easing,a&&function(){a.call(this,targ,g)})}}).end()};h.max=function(a,b){var c=b=='x'?'Width':'Height',scroll='scroll'+c;if(!$(a).is('html,body'))return a[scroll]-$(a)[c.toLowerCase()]();var d='client'+c,html=a.ownerDocument.documentElement,body=a.ownerDocument.body;return Math.max(html[scroll],body[scroll])-Math.min(html[d],body[d])};function both(a){return typeof a=='object'?a:{top:a,left:a}}})(jQuery);
;
// tipsy, facebook style tooltips for jquery
// version 1.0.0a
// (c) 2008-2010 jason frame [jason@onehackoranother.com]
// released under the MIT license

(function($) {
    
    function maybeCall(thing, ctx) {
        return (typeof thing == 'function') ? (thing.call(ctx)) : thing;
    };
    
    function Tipsy(element, options) {
        this.$element = $(element);
        this.options = options;
        this.enabled = true;
        this.fixTitle();
    };
    
    Tipsy.prototype = {
        show: function() {
            var title = this.getTitle();
            if (title && this.enabled) {
                var $tip = this.tip();
                
                $tip.find('.tipsy-inner')[this.options.html ? 'html' : 'text'](title);
                $tip[0].className = 'tipsy'; // reset classname in case of dynamic gravity
                $tip.remove().css({top: 0, left: 0, visibility: 'hidden', display: 'block'}).prependTo(document.body);
                
                var pos = $.extend({}, this.$element.offset(), {
                    width: this.$element[0].offsetWidth,
                    height: this.$element[0].offsetHeight
                });
                
                var actualWidth = $tip[0].offsetWidth,
                    actualHeight = $tip[0].offsetHeight,
                    gravity = maybeCall(this.options.gravity, this.$element[0]);
                
                var tp;
                switch (gravity.charAt(0)) {
                    case 'n':
                        tp = {top: pos.top + pos.height + this.options.offset, left: pos.left + pos.width / 2 - actualWidth / 2};
                        break;
                    case 's':
                        tp = {top: pos.top - actualHeight - this.options.offset, left: pos.left + pos.width / 2 - actualWidth / 2};
                        break;
                    case 'e':
                        tp = {top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left - actualWidth - this.options.offset};
                        break;
                    case 'w':
                        tp = {top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left + pos.width + this.options.offset};
                        break;
                }
                
                if (gravity.length == 2) {
                    if (gravity.charAt(1) == 'w') {
                        tp.left = pos.left + pos.width / 2 - 15;
                    } else {
                        tp.left = pos.left + pos.width / 2 - actualWidth + 15;
                    }
                }
                
                $tip.css(tp).addClass('tipsy-' + gravity);
                $tip.find('.tipsy-arrow')[0].className = 'tipsy-arrow tipsy-arrow-' + gravity.charAt(0);
                if (this.options.className) {
                    $tip.addClass(maybeCall(this.options.className, this.$element[0]));
                }
                
                if (this.options.fade) {
                    $tip.stop().css({opacity: 0, display: 'block', visibility: 'visible'}).animate({opacity: this.options.opacity});
                } else {
                    $tip.css({visibility: 'visible', opacity: this.options.opacity});
                }
            }
        },
        
        hide: function() {
            if (this.options.fade) {
                this.tip().stop().fadeOut(function() { $(this).remove(); });
            } else {
                this.tip().remove();
            }
        },
        
        fixTitle: function() {
            var $e = this.$element;
            if ($e.attr('title') || typeof($e.attr('original-title')) != 'string') {
                $e.attr('original-title', $e.attr('title') || '').removeAttr('title');
            }
        },
        
        getTitle: function() {
            var title, $e = this.$element, o = this.options;
            this.fixTitle();
            var title, o = this.options;
            if (typeof o.title == 'string') {
                title = $e.attr(o.title == 'title' ? 'original-title' : o.title);
            } else if (typeof o.title == 'function') {
                title = o.title.call($e[0]);
            }
            title = ('' + title).replace(/(^\s*|\s*$)/, "");
            return title || o.fallback;
        },
        
        tip: function() {
            if (!this.$tip) {
                this.$tip = $('<div class="tipsy"></div>').html('<div class="tipsy-arrow"></div><div class="tipsy-inner"></div>');
            }
            return this.$tip;
        },
        
        validate: function() {
            if (!this.$element[0].parentNode) {
                this.hide();
                this.$element = null;
                this.options = null;
            }
        },
        
        enable: function() { this.enabled = true; },
        disable: function() { this.enabled = false; },
        toggleEnabled: function() { this.enabled = !this.enabled; }
    };
    
    $.fn.tipsy = function(options) {
        
        if (options === true) {
            return this.data('tipsy');
        } else if (typeof options == 'string') {
            var tipsy = this.data('tipsy');
            if (tipsy) tipsy[options]();
            return this;
        }
        
        options = $.extend({}, $.fn.tipsy.defaults, options);
        
        function get(ele) {
            var tipsy = $.data(ele, 'tipsy');
            if (!tipsy) {
                tipsy = new Tipsy(ele, $.fn.tipsy.elementOptions(ele, options));
                $.data(ele, 'tipsy', tipsy);
            }
            return tipsy;
        }
        
        function enter() {
            var tipsy = get(this);
            tipsy.hoverState = 'in';
            if (options.delayIn == 0) {
                tipsy.show();
            } else {
                tipsy.fixTitle();
                setTimeout(function() { if (tipsy.hoverState == 'in') tipsy.show(); }, options.delayIn);
            }
        };
        
        function leave() {
            var tipsy = get(this);
            tipsy.hoverState = 'out';
            if (options.delayOut == 0) {
                tipsy.hide();
            } else {
                setTimeout(function() { if (tipsy.hoverState == 'out') tipsy.hide(); }, options.delayOut);
            }
        };
        
        if (!options.live) this.each(function() { get(this); });
        
        if (options.trigger != 'manual') {
            var binder   = options.live ? 'live' : 'bind',
                eventIn  = options.trigger == 'hover' ? 'mouseenter' : 'focus',
                eventOut = options.trigger == 'hover' ? 'mouseleave' : 'blur';
            this[binder](eventIn, enter)[binder](eventOut, leave);
        }
        
        return this;
        
    };
    
    $.fn.tipsy.defaults = {
        className: null,
        delayIn: 0,
        delayOut: 0,
        fade: false,
        fallback: '',
        gravity: 'n',
        html: false,
        live: false,
        offset: 0,
        opacity: 0.8,
        title: 'title',
        trigger: 'hover'
    };
    
    // Overwrite this method to provide options on a per-element basis.
    // For example, you could store the gravity in a 'tipsy-gravity' attribute:
    // return $.extend({}, options, {gravity: $(ele).attr('tipsy-gravity') || 'n' });
    // (remember - do not modify 'options' in place!)
    $.fn.tipsy.elementOptions = function(ele, options) {
        return $.metadata ? $.extend({}, options, $(ele).metadata()) : options;
    };
    
    $.fn.tipsy.autoNS = function() {
        return $(this).offset().top > ($(document).scrollTop() + $(window).height() / 2) ? 's' : 'n';
    };
    
    $.fn.tipsy.autoWE = function() {
        return $(this).offset().left > ($(document).scrollLeft() + $(window).width() / 2) ? 'e' : 'w';
    };
    
    /**
     * yields a closure of the supplied parameters, producing a function that takes
     * no arguments and is suitable for use as an autogravity function like so:
     *
     * @param margin (int) - distance from the viewable region edge that an
     *        element should be before setting its tooltip's gravity to be away
     *        from that edge.
     * @param prefer (string, e.g. 'n', 'sw', 'w') - the direction to prefer
     *        if there are no viewable region edges effecting the tooltip's
     *        gravity. It will try to vary from this minimally, for example,
     *        if 'sw' is preferred and an element is near the right viewable 
     *        region edge, but not the top edge, it will set the gravity for
     *        that element's tooltip to be 'se', preserving the southern
     *        component.
     */
     $.fn.tipsy.autoBounds = function(margin, prefer) {
		return function() {
			var dir = {ns: prefer[0], ew: (prefer.length > 1 ? prefer[1] : false)},
			    boundTop = $(document).scrollTop() + margin,
			    boundLeft = $(document).scrollLeft() + margin,
			    $this = $(this);

			if ($this.offset().top < boundTop) dir.ns = 'n';
			if ($this.offset().left < boundLeft) dir.ew = 'w';
			if ($(window).width() + $(document).scrollLeft() - $this.offset().left < margin) dir.ew = 'e';
			if ($(window).height() + $(document).scrollTop() - $this.offset().top < margin) dir.ns = 's';

			return dir.ns + (dir.ew ? dir.ew : '');
		}
	};
    
})(jQuery);
;
Drupal.behaviors.wedsite_wedsite={attach:function(document,settings){
	var $ = jQuery;
	$(document.body).ready(function(){
		
		// Set custom style sheet for accent color
		$('head').append($('<style>').html(weddingapp_generate_accent_stylesheet({color:settings.weddingappdata.theme_color_1})));
		
		// Apply mobile class to HTML tag for device compatibility fixes
		if ($('body').hasClass('mobile')){$('html').addClass('mobile');}
		
		// Bind to scroll event as workaround to mobile safari fixed positioning bug in iOS 8/9 (http://stackoverflow.com/questions/26391059/new-fixed-position-bug-on-ios8)
	    if (false && /(iphone|ipod|ipad).* os (8|9)_/.test(navigator.userAgent.toLowerCase())){
			(function($) {
				var $fixedTopItems = $('#header .wedsite-menubar, #wedsite-menubar-mobile-popout-menu, #wedsite-menubar-mobile-popout-menu-page-overlay');
				var dsid = parseInt(screen.width) + parseFloat((screen.width / screen.height).toFixed(2));
				devices = {
					// Parameters are defined by index as follows:
					// 0: Scroll position scale factor
					// 1: Value of 'sr' when address bar visible (x1)
					// 2: Value of 'sr' when address bar hidden (x2)
					// 3: Desired pixel offset when address bar visible (y1)
					// 4: Desired pixel offset when address bar hidden (y2)
					'320.67': [1.05, 36, 127, 6, 30],		// iPhone 2, 3g, 3gs, 4, 4s
					'320.56': [1.43, 65, 157, -4, 26],		// iPhone 5, 5s
					'375.56': [0.69, 98, 190, -3, 4],		// iPhone 6, 6s, 6 plus, 6s plus
					'768.75': false,						// iPad, iPad 2, iPad mini, iPad Air, 
				}
				var device = dsid;
				// Check for device registered but no workaround needed
				if ((device in devices) && devices[device] === false){return;}
				// Check for device parameters unregistered and flag warning
				if (!(device in devices)){console.log('Error: iOS 8 / 9 fixed positioning bug workaround requires known resolution. DSID ' + dsid + ' was not found in configured devices.'); return;}
				var z = devices[device][0];
				var x1 = devices[device][1];
				var x2 = devices[device][2];
				var y1 = devices[device][3];
				var y2 = devices[device][4];
				var m = (y2 - y1) / (x2 - x1);
				var c = y1 - m * x1;
				var active, initial, factor_a, sr, index, result;
				function handle_orientation(){
					var orientation = window.orientation == 90 || window.orientation == -90 ? 'landscape' : 'portrait';
					if (orientation == 'landscape'){
						active = false;
						$fixedTopItems.css('top', 0);
					} else {
						active = true;
						set_menubar_top();
					}
				}
				function set_initial(){
					initial = [];
					$fixedTopItems.each(function(){
						initial.push(parseInt($(this).css('top')) || 0);
					});
				}
				function set_menubar_top(){
					if (initial === undefined){set_initial();}
					sr = window.innerHeight - screen.availHeight;
					factor_a = sr * m + c;
					index = 0;
					result = (document.body.scrollTop / 100) * z - 1 + factor_a;
					$fixedTopItems.each(function(){
						this.style.top = (result + initial[index]) + 'px';
						index++;
					});
				}
				$(window).on('orientationchange', function(e){
					setTimeout(function(){
						handle_orientation();
					}, 200);
				});
				handle_orientation();
				$(window).on('scroll', function(){
					if (!active){return;}
					set_menubar_top();
				});
			})(jQuery);
	    }
		
		// Set fragment if required
		if (settings.weddingappdata.pageonloadfragment){
			window.location.hash = '#' + settings.weddingappdata.pageonloadfragment;
		}
		
		// Handle viewport height helper
		window.setViewportHeight = function($elems){
			// Handles viewport height changes
			if (!$elems){$elems = $('.viewport_height,.viewport_height_min,.viewport_height_max');}
			if (!$elems.length){return;}
			var height = window.innerHeight - $('#header').height() - ($('#footer .wedsite-footer:visible').height() || 0) - ($('body').hasClass('admin') ? 30 : 0) - ($('body').hasClass('toolbar-drawer') ? 34 : 0) - $('#messages_container').height();
			$elems.each(function(){
				if ($(this).hasClass('viewport_height_max')){
					$(this).css('max-height', height);
				} else if ($(this).hasClass('viewport_height_min')){
					$(this).css('min-height', height);
				} else {
					$(this).css('height', height);
				}
			});
			return Math.max(0, height);
		}
		// Height is zero during rotation and on intialization before flex layouts are computed
		var height_set_interval = setInterval(function(){
			if (setViewportHeight()){clearInterval(height_set_interval);}
		}, 250);
		
		$('#block-system-main').delegate('DOMNodeInserted', '.viewport_height,.viewport_height_min,.viewport_height_max', function(){
			setViewportHeight($(this));
		});
		$('#toolbar-menu .toggle').click(function(){
			setViewportHeight();
		})
		$(window).on('resize', function(){
			setViewportHeight();
			setTimeout(function(){setViewportHeight()}, 250);
			setTimeout(function(){setViewportHeight()}, 500);
		});
		$(window).on('scroll', function(){
			setTimeout(function(){setViewportHeight()}, 50);
		});
		
		// Circle button rollover
		if (window.Modernizr){
			if (Modernizr.borderradius) {
				$('.message-button').hover(
					function() {
						$(this).closest('.circle-button').css({"background-color":"rgba(50, 50,50, 0.1)"});
						$(this).find("a").css({"color":"#93a3ad"});
					},
					function() {
						$(this).closest('.circle-button').css({"background-color":"rgba(255, 255, 255, 0.5)"});
						$(this).find("a").css({"color":"#3D4448"});
					}
				);
			}
		}

		//wedding code notice dismissal
		$('.dismiss').on("click", function(){
			$(this).parents('.wedding-code-notice').fadeOut(200, function(){
				$(this).remove();
			})
		});

		if($('#wedsite-menubar-theme-toggle .ui-toggleswitch')){
			var template = $('#wedsite-menubar-theme-toggle .ui-toggleswitch').attr('template');

			if(template == 'single'){
				$('#wedsite-menubar-theme-toggle .ui-toggleswitch').addClass('on');
			}

			$('#wedsite-menubar-theme-toggle .ui-toggleswitch').on('click', function(){
				var templateId = $(this).attr('template');
				if(template == 'multiple'){
					window.location = $('#wedsite-menubar-theme-toggle .template2-link').attr('href');
				} else if (template == 'single'){
					window.location = $('#wedsite-menubar-theme-toggle .template1-link').attr('href');
				}
			});
		}
		
		window.handle_chat_launcher = function($chatlauncherbutton, classname, onOpen){
			// Handles chat launcher button
			var chat_launcher_alert_interval = null;
			if (window.chat_handler && $chatlauncherbutton.length) {
				var $chatwindow = $('<div class="wedsite_menu_chatwindow ' + classname + '">').hide().appendTo(document.body);
				chat_handler_instance = new chat_handler({
					elem : $chatwindow,
					onLauncherTitleChange : function(title, count) {
						$chatlauncherbutton.find('a').html(title);
						if (count){
							if (chat_launcher_alert_interval){return;}
							chat_launcher_alert_interval = setInterval(function(){
								$chatlauncherbutton.toggleClass('notify');
							}, 2000);
						} else {
							if (chat_launcher_alert_interval){clearInterval(chat_launcher_alert_interval); chat_launcher_alert_interval = null;}
						}
					}
				});
				$chatlauncherbutton.click(function() {
					$(this).toggleClass('depressed');
					if ($(this).hasClass('depressed')) {
						if ($.isFunction(onOpen)){onOpen();}
						chat_handler_instance.open();
					} else {
						chat_handler_instance.close();
					}
					return false;
				});
				// Parse page fragments
				var fragments = (window.location.hash || '').replace('#', '');//window.location.hash ? weddingapp_parse_params(window.location.hash.split('#')[1]) : {};
				if (fragments == 'messaging'){//if ('messaging' in fragments){
					$chatlauncherbutton.click();
				}
			}
		}
	});
}}
;
(function ($) {
    Drupal.behaviors.wedsite_wedsite_menubar={attach:function(document,settings){
        var wedsite_template = Drupal.settings.weddingappdata.wedsite_template;

		// Toggle page editing mode
		/*$('.edit-site').click(function(){
			$(this).toggleClass('edit-site-editing');
			$('.page').toggleClass('page-editable');
			return false;
		});*/

       var navLinks = $("#block-wedsite-wedsite-header-nav a:not(.expand, .social-icon)").filter(
            function() { return $(this).parents('.edit-site').length < 1; }
        );
        //var preBlock = Drupal.settings.weddingappdata.preloaded_block;
        //var loadedBlocks = [preBlock];

        //var url = window.location.href;
        //var block = url.split('/').pop();
        //var blockArr = url.split('/');
		var loaded, reposition_interval, reposition_section_id;

		// Handle menu-link scrollTo
		function go_to_section(section_id, anim){
			var $a;
			if (reposition_interval){
				reposition_section_id = section_id;	// In case we are still repositioning content
				anim = false;
			}
			$a = $('a[href="#' + section_id.replace('#', '') + '"]');
			if ($a.length){
				var offset_top = 0;
				window.location.hash = section_id;
				if ($a.next().hasClass('wedsite-section-title-container')){offset_top = -80;}
				$('body').scrollTo($a, {duration:(anim ? 300 : 0), offset: {top:offset_top, left:0}});
				return false;
			} else {
				// Handle special cases
				switch (section_id){
				case 'messaging':
					$chatlauncherbutton.click();
					break;
				}
			}
			
		}
		$('#block-wedsite-wedsite-header .menu_item, #wedsite-menubar-mobile-popout-menu .menu_item').click(function(){
			var section_id = $(this).find('a').attr('section_id');
			if (!section_id){return;}
			var $a = $('a[href="#' + section_id.replace('#', '') + '"]');
			if (!$a.length){
				if (Drupal.settings.weddingappdata.subpage_override == 'multiple'){
					// Handle subpage override
					window.location = Drupal.settings.weddingappdata.wedsite_home_url + '#' + section_id;
					return false;
				}
				return;
			}
			if (loaded){
				// Page loaded, go direct to section
				go_to_section(section_id, true);
			} else {
				// Start pre-load reposition interval
				reposition_section_id = section_id;
				start_reposition();
			}
			return false;
		});
		
		// The following code reads URL hash items, and unless the page is scrolled by the user,
		// will position the page over the correct anchor element for x number of intervals as images load
		// or until the window load event fires. This allows anchor references to be correctly aligned.
		var reposition_timeout_counter = 100;	// Number of times to 
		var reposition_interval_delay = 300;
		var reposition_after_load_timer;
		function start_reposition(){
			if (reposition_interval){return;}
			go_to_section(reposition_section_id);
			reposition_interval = setInterval(function(){
				reposition_timeout_counter--;
				// Assume timeout equates to window loaded
				if (!reposition_timeout_counter){
					loaded = true;
					end_reposition();
					return;
				}
				if (loaded){return;}
				go_to_section(reposition_section_id);
			}, reposition_interval_delay);
			$(document).on('touchmove.repositioncounter, wheel.repositioncounter', function(e){
				if (reposition_after_load_timer){clearTimeout(reposition_after_load_timer);}
				end_reposition();
			});
		}
		function end_reposition(){
			if (reposition_interval){clearInterval(reposition_interval);}
			reposition_interval = null;
			$(document).off('touchmove.repositioncounter, wheel.repositioncounter');
		}
		$('body').ready(function(){
			// DOM ready, check
			if (window.location.hash){
				reposition_section_id = window.location.hash;
				start_reposition();
			}
		});
		$(window).on('load', function(){
			loaded = true;
			if (reposition_interval){
				reposition_after_load_timer = setTimeout(function(){reposition_after_load_timer = null; end_reposition();}, reposition_interval_delay+50);
			}
		});
		
		// Handle chat launcher
		$('body').ready(function(){
			var $chatlauncherbutton = $('.wedsite-menubar .chat-container');
			if ($chatlauncherbutton.length){
				handle_chat_launcher($chatlauncherbutton, 'wedsite_menubar_menu_chatwindow', function(){
					$('#weddingapp_chat').css('top', $('#header').height() + ($('#toolbar').height() || 0));
				});
			}
		});
		
		// Handle mobile menu overlay
		$('#wedsite-menubar-mobile-popout-menu, #wedsite-menubar-mobile-popout-menu-page-overlay').appendTo('body');
		if (weddingapp_is_mobile()){
			var menu_iscroll_scroller;
			setTimeout(function(){
				// Delay iScroll initialization to not overload dom
				menu_iscroll_scroller = new IScroll($('#wedsite-menubar-mobile-popout-menu').get()[0], {bindToWrapper: true, click: true});
			}, 1000);
			$('.wedsite-menubar-mobile-popout-menu-launch-button').click(function(){
				$('#wedsite-menubar-mobile-popout-menu, #wedsite-menubar-mobile-popout-menu-page-overlay').toggleClass('wedsite-menubar-mobile-popout-menu-open');
				setTimeout(function(){
					// Refresh iScroll scroller
					menu_iscroll_scroller.refresh();
				}, 300);
			});
			$('#wedsite-menubar-mobile-popout-menu-page-overlay, #wedsite-menubar-mobile-popout-menu .menu_item').click(function(){
				$('#wedsite-menubar-mobile-popout-menu, #wedsite-menubar-mobile-popout-menu-page-overlay').removeClass('wedsite-menubar-mobile-popout-menu-open');
			});
			/*$(window).on('orientationchange', function(e){
				setTimeout(function(){
					var orientation = window.orientation == 90 || window.orientation == -90 ? 'landscape' : 'portrait';
					if (orientation == 'landscape'){
						$('#wedsite-menubar-mobile-popout-menu, #wedsite-menubar-mobile-popout-menu-page-overlay').removeClass('wedsite-menubar-mobile-popout-menu-open');
						$('.wedsite-menubar-mobile-popout-menu-launch-button').hide();
					} else {
						$('.wedsite-menubar-mobile-popout-menu-launch-button').show();
					}
				
				}, 500);
			});*/
		}
		
		// Template toggle close button
		$('#wedsite-menubar-theme-toggle .template-toggle-close').click(function(){
			$('#wedsite-menubar-theme-toggle').remove();
			$('.wedsite-menubar').removeClass('wedsite-menubar-template-toggle');
			$('#block-wedsite-wedsite-header').removeClass('block-wedsite-menubar-template-toggle ');
			$(window).trigger('resize');
			setCookie('weddingapp_wedsite_themetoggle', 'false', 31, '/');
			
		});

		return;
		// Below is legacy code for reference only 
		
        // Special case for loading gallery page
        if($('#gallery_block_template_2').length != 0){
            preBlock = "gallery";
            $('body').addClass("wedsite-template2");
        }
        if(blockArr[5] === undefined && $('#stories_block_template_2').length != 0){
            preBlock = block =  Drupal.settings.weddingappdata.loaded_block = 'stories';           
            loadedBlocks.push(block);
        }

        // If the welcome and stories sections are disabled
        if(blockArr[5] === undefined && $('#events_block_template_2').length != 0){
            preBlock = block =  Drupal.settings.weddingappdata.loaded_block = 'events';           
            loadedBlocks.push(block);        
        }

        // On page load append block-specific id to body and set menu item as active
        if($('body').attr('id') === undefined && preBlock != undefined){
            $('body').attr('id', preBlock + "_block");
            $('.menu_item.'+preBlock+' a').addClass('current').parents().siblings().find('a').removeClass('current');
        }

        // Does this browser support changing the URL via HTML5 history?
        var hasPushstate = !!(window.history && history.pushState);

        if (wedsite_template == 'template1') {
            // navigation
            navLinks.once('navLinks').click(function(e) {
                var jumpName, jumpItem;
                jumpName = $(this).attr("href").split('/').pop();
				jumpName = jumpName.replace('?q=', '');
                jumpItem = $("a[name='" + jumpName + "']");
                if (jumpItem.length == 0){return true;}
				e.preventDefault();
                $(document.body).scrollTo(jumpItem, 1000, {offset: {top: -78, left: 0}});
            });
        } else if (wedsite_template == 'template2') {
            // AJAX Page navigation
            if (hasPushstate) {
                window.onpopstate = function(event) {
                    if (event.state) {
                        // Load block based on URL
                        if(block != Drupal.settings.weddingappdata.loaded_block){
                            loadBlock();
                        }
                    }
                }
            }

            var loadBlock = function(e) {
                var url;
                if (e) {
                    url = $(this).attr("href");
                    e.preventDefault();
                } else {
                    url = window.location.search;
                }
				if (settings.weddingappdata.custom_domain){
					// Custom domain url format is /page
				} else {
					// This checks for correct wedding website url request format on non custom domains
	                if (url.split('/').length < 3) {
	                    return true;
	                }
				}

                var block = url.split('/').pop();
                var blockQueryStr =  block.indexOf('=');
                if(blockQueryStr != -1 || block == 'gallery' || block == 'rsvp' || preBlock == 'gallery' || preBlock == 'rsvp'){
                    window.location = url;
                    return false;
                }

                // Toggle stories pagination visibility
                if(block != 'stories'){
                    $('#sticky-footer .jcarousel-pagination').hide();
                } else {
                    $('#sticky-footer .jcarousel-pagination').show();
                }

                if (hasPushstate && e && blockQueryStr == -1) {
                    data = {block: block}
                    window.history.pushState(data, document.title, url);
                    $('body').attr('id', block + "_block");
                    $('.menu_item.'+block+' a').addClass('current').parents().siblings().find('a').removeClass('current');
                }
                if (loadedBlocks.indexOf(block) !== -1) {
                    var currentBlock = $('div.wedsite_block_main_content:visible');
                    // Fade in requested block if it's not already visible
                    currentBlock.promise().done(function() {
                            currentBlock.fadeOut(500, function() {
                                var hiddenBlocks = $('div.wedsite_block_main_content').filter(':hidden');
                                requestedBlock = hiddenBlocks.filter('[id*=' + block + ']');

                                // Reset faded in content as "newest" block to maintain order
                                loadedBlocks.splice(loadedBlocks.indexOf(block), 1);
                                loadedBlocks.push(block);
                                requestedBlock.fadeIn(500);
                            });
                    });
                    return false;
                }
                Drupal.settings.weddingappdata.loaded_block = block;
                // Load block via AJAX and fade in
                var separator = url.indexOf('?') !== -1 ? "&" : "?";
                // Append an arbitrary GET parameter to prevent browsers
                // from confusing the data loaded via AJAX with the actual
                // browser state (full page). This essentially is like
                // keeping 2 separate "caches" (one for the ajax content,
                // the other for the entire page). Otherwise browsers
                // will display only the ajax data as the web page.
                url = url + separator + '_ajax=1';
                $.ajax({
                    dataType: 'json',
                    type: 'GET',
                    url: url,
                    async: false,
                    success: function(data, textStatus, jqXHR) {
                        // Load block JS settings
                        $(data.js_settings).each(function() {
                            if (this.hasOwnProperty('weddingappdata')) {
                                $.extend(true, Drupal.settings.weddingappdata, this.weddingappdata);
                            }
                        });

                        // Load CSS
                        css = $.parseHTML(data.css);
                        css.id = block;
                        $('head').append(css);

                        // Add HTML to container
                        // Workaround to line breaks in the AJAX causing a jQuery error
                        // http://stackoverflow.com/q/15258924/1303955
                        html = $($.parseHTML(data.html)).filter("*");
                        $('div.wedsite_block_main_content:visible').fadeOut(
                            500,
                            function() {
                                // Fade in new content
                                $(html).hide().appendTo($(this).parent()).fadeIn(500);
                                // We want drupal behaviors to attach right away instead of using
                                // a callback, so when animation finishes the block looks "complete"
                                // since a lot of blocks use JS settings to populate content
                                Drupal.attachBehaviors('div.wedsite_block_main_content');
                            }
                        );

                        // Load block javascript
                        $(data.js).filter('script').each(function() {
                            if (this.text == '' && this.textContent == '' && this.innerHTML == '') {
                                // Check to see if this script is already loaded
                                var existing_script = $("script[src*='" + $(this).attr('src') + "']");
                                if (existing_script.length) {
                                    return true;
                                }
                                $.getScript($(this).attr('src'), function(){});
                                $('head').append(this);
                            }
                        });
                        loadedBlocks.push(block);
                    }
                });
            };
            navLinks.once('navLinks').click(loadBlock);
        }

        // drop-downs
       /* $(".expand").once('expandLink').click(function() {
            // Find element that this button links to
			var href = $(this).attr("href"), id;
			if (href.indexOf('?') !== false){
				var params = weddingapp_parse_params(href.split('?')[1] || '');
				if (params['q']){href = params['q'];}
			}
			href = href.split('?')[0];
			if (href.indexOf('/') !== false){href = href.split('/').pop();}
            var targetID = '#' + href.split('#').pop();
            $target = $(targetID);

            // Toggle open state on slider
            $target.toggleClass('open');

            // Close any other open sliders
            $('.collapsibleDiv.open').not($target).removeClass('open');

            // Close chat window
            if (window.chat_handler_instance){chat_handler_instance.close();}

            // Bind close button
            $target.find('.close').unbind('click').click(function() {
                $(this).parents('.collapsibleDiv').removeClass('open');
                return false;
            });

            $('.insetspinner').fadeOut(2500);

            return false;
        });
        var disableauth = (function(){
            var title = $('form').find('div');
            if (title.hasClass('private-title') == true) {
                $('.auth').hide();
                $('ul li').not('.social').children('a').addClass('disabled');
            }
        })();
        // authentication
/*        $("#sticky-header").once('toggleauth', function() {
            $("#sticky-header").on("click", "li.auth", toggleauth);
        });*/

        $('li.rsvp.menubar, li.chat-container, li.auth').hover(function(){
            $(this).toggleClass('pull');
        })

/*        function toggleauth(){
            var element = $(this);
            var weddingTitle = Drupal.settings.weddingappdata.wedsitename;
            var isLoggedIn = (Drupal.settings.weddingappdata.authstatus ? true : false);
            var openDiv = $(".collapsibleDiv");
            var ddHandleFunct = null;

            $(element).toggleClass('auth-open');

            if ($(element).hasClass('auth-open')){
                // creates a basic login form
                function createLoginForm() {

                    var html = $("<div></div>").addClass("auth auth-login auth-login-page theme_backcolor");
                    var header = $("<div></div>").addClass("auth-login-header");
                    var body = $("<div></div>").addClass("auth-login-form");
                    var request_url = 
                    header.append( $("<div class='auth-login-header-title login-form-title wedsite_form_title'></div>").html(Drupal.settings.weddingappdata.lang['guestbookTip']) );
                    header.append( $('<p class="wedsite_form_body"></p>').html(Drupal.settings.weddingappdata.lang['loginRequiredTip']) );

                    body.append(
                        $("<form class='wedsite_form' action='?q=" + (settings.weddingappdata.custom_domain ? 'login' : 'wedding/' + settings.weddingappdata.wedsitename + '/login') + "' method='post'></form>").append(
                            $("<input type='hidden' name='action' value='login' />"),
                            $("<label for='auth-login-email' class='wedsite_form_label'></label>").html(Drupal.settings.weddingappdata.lang['emailTip']),
							$("<input class='wedsite_form_input innerCaption' id='auth-login-email' type='email' name='email' autocomplete='off' />"),
                            $("<label for='auth-login-wid' class='wedsite_form_label'></label>").html(Drupal.settings.weddingappdata.lang['weddingCodeTip']),
							$("<input class='wedsite_form_input' id='auth-login-wid' type='text' name='wcode' autocomplete='off' />"),
                            $("<a class='auth-login-request-access'></a>").html(Drupal.settings.weddingappdata.lang['noCodeTip']).attr('href', Drupal.settings.weddingappdata.urls.request),
                            $("<input type='submit' class='wedsite_form_button' />").attr('value', Drupal.settings.weddingappdata.lang['nextTip'])
                        )
                    );

                    html.append(header, body);
                    return html;
                }

                if(!isLoggedIn){
                    // Append login functions to different elements based on template
                    if(wedsite_template == 'template1' || $('body').hasClass('wedsite-template1')) {
                        $("#sticky-header").append(createLoginForm());
                    } else {
                        $("body").append(createLoginForm());
                    }
                } else {
                    // Log user out
                    window.location.href = "?q=" + (settings.weddingappdata.custom_domain ? 'logout' : 'wedding/' + settings.weddingappdata.wedsitename + '/logout');
                }

                // Bind body click to trigger signin/out form to close
                ddHandleFunct = function(e){
                    if ($(e.target).parents('.auth-login').length > 0 || $(e.target).hasClass('auth-login')){
                        return;
                    }

                    $(document.body).unbind('click', e.data.handler);

                    $(e.data.element).removeClass('auth-open');
                    $('.auth-login, .auth-signout').remove();
                };

                $(document.body).bind('click', {handler: ddHandleFunct, element: element}, ddHandleFunct);

            } else {
                $(document.body).unbind('click', ddHandleFunct);

                $(element).removeClass('auth-open');
                $('.auth-login, .auth-signout').remove();
            }

            if (openDiv.hasClass("open")) {
                openDiv.animate({
                    marginTop: "-" + (openDiv.height() * 1.5) + "px"
                }, 500, function() {
                    $(openDiv).css({
                        opacity: "0.0",
                        display: "none"
                    });
                });
            }

            return false;
        }*/
    }}
})(jQuery);;
(function ($) {
	Drupal.behaviors.wedsite_wedsite_footer = {attach : function(document, settings) {
		$('body').ready(function() {
			var $chatlauncherbutton = $('.wedsite_footer .chat-container');
			if ($chatlauncherbutton.length){
				handle_chat_launcher($chatlauncherbutton, 'wedsite_footer_menu_chatwindow');
			}
			$('.wedsite_footer .icon-circle-info').on(weddingapp_is_mobile() ? 'click' : 'hover', function(){
				var $self = $(this);
				$self.toggleClass('hover');
			});
		});
	}}
})(jQuery);
;
(function ($) {

Drupal.googleanalytics = {};

$(document).ready(function() {

  // Attach mousedown, keyup, touchstart events to document only and catch
  // clicks on all elements.
  $(document.body).bind("mousedown keyup touchstart", function(event) {

    // Catch the closest surrounding link of a clicked element.
    $(event.target).closest("a,area").each(function() {

      // Is the clicked URL internal?
      if (Drupal.googleanalytics.isInternal(this.href)) {
        // Skip 'click' tracking, if custom tracking events are bound.
        if ($(this).is('.colorbox') && (Drupal.settings.googleanalytics.trackColorbox)) {
          // Do nothing here. The custom event will handle all tracking.
          //console.info("Click on .colorbox item has been detected.");
        }
        // Is download tracking activated and the file extension configured for download tracking?
        else if (Drupal.settings.googleanalytics.trackDownload && Drupal.googleanalytics.isDownload(this.href)) {
          // Download link clicked.
          ga("send", {
            "hitType": "event",
            "eventCategory": "Downloads",
            "eventAction": Drupal.googleanalytics.getDownloadExtension(this.href).toUpperCase(),
            "eventLabel": Drupal.googleanalytics.getPageUrl(this.href),
            "transport": "beacon"
          });
        }
        else if (Drupal.googleanalytics.isInternalSpecial(this.href)) {
          // Keep the internal URL for Google Analytics website overlay intact.
          ga("send", {
            "hitType": "pageview",
            "page": Drupal.googleanalytics.getPageUrl(this.href),
            "transport": "beacon"
          });
        }
      }
      else {
        if (Drupal.settings.googleanalytics.trackMailto && $(this).is("a[href^='mailto:'],area[href^='mailto:']")) {
          // Mailto link clicked.
          ga("send", {
            "hitType": "event",
            "eventCategory": "Mails",
            "eventAction": "Click",
            "eventLabel": this.href.substring(7),
            "transport": "beacon"
          });
        }
        else if (Drupal.settings.googleanalytics.trackOutbound && this.href.match(/^\w+:\/\//i)) {
          if (Drupal.settings.googleanalytics.trackDomainMode !== 2 || (Drupal.settings.googleanalytics.trackDomainMode === 2 && !Drupal.googleanalytics.isCrossDomain(this.hostname, Drupal.settings.googleanalytics.trackCrossDomains))) {
            // External link clicked / No top-level cross domain clicked.
            ga("send", {
              "hitType": "event",
              "eventCategory": "Outbound links",
              "eventAction": "Click",
              "eventLabel": this.href,
              "transport": "beacon"
            });
          }
        }
      }
    });
  });

  // Track hash changes as unique pageviews, if this option has been enabled.
  if (Drupal.settings.googleanalytics.trackUrlFragments) {
    window.onhashchange = function() {
      ga("send", {
        "hitType": "pageview",
        "page": location.pathname + location.search + location.hash
      });
    };
  }

  // Colorbox: This event triggers when the transition has completed and the
  // newly loaded content has been revealed.
  if (Drupal.settings.googleanalytics.trackColorbox) {
    $(document).bind("cbox_complete", function () {
      var href = $.colorbox.element().attr("href");
      if (href) {
        ga("send", {
          "hitType": "pageview",
          "page": Drupal.googleanalytics.getPageUrl(href)
        });
      }
    });
  }

});

/**
 * Check whether the hostname is part of the cross domains or not.
 *
 * @param string hostname
 *   The hostname of the clicked URL.
 * @param array crossDomains
 *   All cross domain hostnames as JS array.
 *
 * @return boolean
 */
Drupal.googleanalytics.isCrossDomain = function (hostname, crossDomains) {
  /**
   * jQuery < 1.6.3 bug: $.inArray crushes IE6 and Chrome if second argument is
   * `null` or `undefined`, http://bugs.jquery.com/ticket/10076,
   * https://github.com/jquery/jquery/commit/a839af034db2bd934e4d4fa6758a3fed8de74174
   *
   * @todo: Remove/Refactor in D8
   */
  if (!crossDomains) {
    return false;
  }
  else {
    return $.inArray(hostname, crossDomains) > -1 ? true : false;
  }
};

/**
 * Check whether this is a download URL or not.
 *
 * @param string url
 *   The web url to check.
 *
 * @return boolean
 */
Drupal.googleanalytics.isDownload = function (url) {
  var isDownload = new RegExp("\\.(" + Drupal.settings.googleanalytics.trackDownloadExtensions + ")([\?#].*)?$", "i");
  return isDownload.test(url);
};

/**
 * Check whether this is an absolute internal URL or not.
 *
 * @param string url
 *   The web url to check.
 *
 * @return boolean
 */
Drupal.googleanalytics.isInternal = function (url) {
  var isInternal = new RegExp("^(https?):\/\/" + window.location.host, "i");
  return isInternal.test(url);
};

/**
 * Check whether this is a special URL or not.
 *
 * URL types:
 *  - gotwo.module /go/* links.
 *
 * @param string url
 *   The web url to check.
 *
 * @return boolean
 */
Drupal.googleanalytics.isInternalSpecial = function (url) {
  var isInternalSpecial = new RegExp("(\/go\/.*)$", "i");
  return isInternalSpecial.test(url);
};

/**
 * Extract the relative internal URL from an absolute internal URL.
 *
 * Examples:
 * - http://mydomain.com/node/1 -> /node/1
 * - http://example.com/foo/bar -> http://example.com/foo/bar
 *
 * @param string url
 *   The web url to check.
 *
 * @return string
 *   Internal website URL
 */
Drupal.googleanalytics.getPageUrl = function (url) {
  var extractInternalUrl = new RegExp("^(https?):\/\/" + window.location.host, "i");
  return url.replace(extractInternalUrl, '');
};

/**
 * Extract the download file extension from the URL.
 *
 * @param string url
 *   The web url to check.
 *
 * @return string
 *   The file extension of the passed url. e.g. "zip", "txt"
 */
Drupal.googleanalytics.getDownloadExtension = function (url) {
  var extractDownloadextension = new RegExp("\\.(" + Drupal.settings.googleanalytics.trackDownloadExtensions + ")([\?#].*)?$", "i");
  var extension = extractDownloadextension.exec(url);
  return (extension === null) ? '' : extension[1];
};

})(jQuery);
;
