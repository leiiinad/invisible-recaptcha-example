"use strict";
window.actionList = new Array();

var dcommon = {
	options: {
		pluginName: 'Common Script',
		actionList: [],
		ajaxFormList: [],
		ajaxModalList: [],
		ajaxButtonList: [],
		longPolling: [],
	},

	init: function(options) {
		var self 		= this;
		options 		= $.extend({actionList:window.actionList}, options);
		var opts 		= $.extend(self.options, options);
		self.options 	= opts;

		this.initAjaxForms();
		this.initAjaxModals();
		this.initAjaxButtons();
		this.initAjaxRefresh();
		this.initLongPolling();
	},

	/**
	 * init ajaxForms elements (data-ajax-form="true")
	 */

	initAjaxForms: function() {
		var self = this;

		$('form[data-ajax-form=true]').each(function() {
			var item = $(this);

			self.ajaxFormPost(item);
		});
	},

	/**
	 * init ajaxModals elements (data-ajax-modal="true")
	 */

	initAjaxModals: function() {
		var self = this;

		$('[data-ajax-modal=true]').each(function() {
			var item = $(this);

			self.ajaxModalForm(item);
		});
	},

	/**
	 * init ajaxButtons elements (data-ajax-button="true")
	 */

	initAjaxButtons: function() {
		var self = this;

		$('[data-ajax-button=true]').each(function() {
			var item = $(this);

			self.ajaxButtonForm(item);
		});
	},

	/**
	 * init ajaxRefresh elements (data-ajax-refresh="true")
	 */

	initAjaxRefresh : function() {
		var self = this;

		$('[data-ajax-refresh=true]').each(function() {
			var item = $( this );
			self.ajaxRefresh(item);
		});
	},

	/**
	 * init longPolling elements (data-long-polling="true")
	 */

	initLongPolling : function() {
		var self = this;

		$('[data-long-polling=true]').each(function() {
			var item = $( this );
			self.longPolling(item, 0);
		});
	},

	ajaxFormPost: function(item) {
		var self 	= this;
		var options	= $.extend({}, item.data('options'));

		item.submit(function(e) {
			e.preventDefault();

			var the_form = $(this);
			var url = the_form.attr('action');
			var data = the_form.serializeArray();
			var form_id = the_form.attr('id');

			// check is form in in progress
			if (item.hasClass('processing')) return;

			// add processing class
			item.addClass('processing');

			if (options.ckeditor == true) {
				$.each(data, function (i, value) {
					if (value.name == options.ckeditor_target) {
						value.value = CKEDITOR.instances[value.name].getData();
					}
				});
			}

			$.ajax({
				type: "POST",
				url: url,
				data: data,
				dataType: 'json',
				beforeSend: function () {
					// start loader
					if (options.loader == true) {
						loader.start();
					}

					// start content loader
					if (options.contentloader == true) {
						contentloader.start(item);
					}

					// start spinner
					if (options.spinner == true) {
						spinner.start(form_id);
					}

					// hide alert
					if (options.alert == true) {
						notification.hide(options.alert_target);
					}

					// hide notify
					if (options.notify == true) {
						_notify.clear();
					}

					// validation
					validation(null, the_form.attr('name'), true);
				},
				success: function (r) {
					var statusTitle = r.statusTitle != null ? r.statusTitle : null;

					if (!r.statusUrl) {
						if (r.status && r.statusMsg) {
							// show alert
							if (options.alert == true) {
								notification.show(options.alert_target, r.status, statusTitle, r.statusMsg);
							}

							// show notify
							if (options.notify == true) {
								_notify.show(statusTitle, r.statusMsg, r.status);
							}
						}

						// call custom function
						if (options.function_target) {
							window[options.function_target](r);
						}

						// form reset
						if (options.form_reset == true) {
							the_form[0].reset();
						}
					}

					// redirect if statusUrl is defined
					if (r.statusUrl) {
						window.location = r.statusUrl;
					}
					else {
						// stop loader
						if (options.loader == true) {
							loader.stop();
						}

						// stop content loader
						if (options.contentloader == true) {
							contentloader.stop(item);
						}

						// stop spinner
						if (options.spinner == true) {
							spinner.stop(form_id);
						}

						// regenerate recaptcha
						if (options.recaptcha == true) {
							$.get(options.recaptcha_url, function (data) {
								$('#' + options.recaptcha_target).html(data);
							});
						}
					}

					// remove processing class
					item.removeClass('processing');
				},
				error: function (jqXHR, textStatus, errorThrown) {
					var statusType = jqXHR.responseJSON.status ? jqXHR.responseJSON.status : 'error';

					// response message
					if (jqXHR.responseJSON.statusMsg) {
						// show alert
						if (options.alert == true) {
							notification.show(options.alert_target, statusType, null, jqXHR.responseJSON.statusMsg);
						}

						// show notify
						if (options.notify == true) {
							_notify.show(null, jqXHR.responseJSON.statusMsg, statusType);
						}
					}
					else if (jqXHR.status == 422) {
						validation(jqXHR.responseJSON, the_form.attr('name'), false);
					}

					// stop loader
					if (options.loader == true) {
						loader.stop();
					}

					// stop content loader
					if (options.contentloader == true) {
						contentloader.stop(item);
					}

					// stop spinner
					if (options.spinner == true) {
						spinner.stop(form_id);
					}

					// regenerate recaptcha
					if (options.recaptcha == true) {
						$.get(options.recaptcha_url, function (data) {
							$('#' + options.recaptcha_target).html(data);
						});
					}

					// remove processing class
					item.removeClass('processing');
				}
			});
		});
	},

	ajaxModalForm: function(item) {
		var self = this;

		item.on('click', function() {
			item.removeClass('active-animation');
			$(this).addClass('active-animation item-checked');

			var action 		= item.data('action');
			var url 		= self.options.actionList[action];
			var options		= $.extend({}, item.data('options'));
			var data 		= $.extend({}, $(this).data('data'));
			data['view'] 	= options['view'];
			data['url'] 	= options['url'];
			data['row'] 	= $(this).closest( "tr" ).attr('id');

			loader.start();

			if(item.hasClass('processing')) return;

			item.addClass('processing');

			// ajax call
			$.ajax({
				type: "POST",
				url: url,
				data: data,
				dataType: 'html',
				beforeSend: function() {},
				success: function(data) {
					if (!$('#'+self.options.modalContainer).length) {
						$(document.body).append('<div id="'+self.options.modalContainer+'"></div>');
					}

					$('#'+self.options.modalContainer).html(data);

					var modalForm = $('.modalAdminForm').first();

					$.magnificPopup.open({
						removalDelay: 0, //delay removal by X to allow out-animation,
						items: {
							src: modalForm
						},
						callbacks: {
							beforeOpen: function(e) {
								var Animation = item.attr('data-effect');
								this.st.mainClass = Animation;
							}
						},
						closeOnBgClick: false,
						closeMarkup: '',
						alignTop: true,
						midClick: true // allow opening popup on middle mouse click. Always set it to true if you don't provide alternative source.
					});

					loader.stop();
					item.removeClass('processing');
				}
			}, "json");
		});
	},

	ajaxButtonForm: function(item) {
		var self = this;

		item.on('click', function() {
			var action 		= item.data('action');
			var url 		= self.options.actionList[action];
			var options		= $.extend({}, item.data('options'));
			var data 		= $.extend({}, $(this).data('data'));
			data['view'] 	= options['view'];
			data['url'] 	= options['url'];

			if(item.hasClass('processing')) return;
			item.addClass('processing');

			// ajax call
			$.ajax({
				type: "POST",
				url: url,
				data: data,
				dataType: 'json',
				beforeSend: function() {
					// start loader
					if (options.loader == true) {
						loader.start();
					}

					// start content loader
					if (options.contentloader == true) {
						contentloader.start(item);
					}

					// hide alert
					if (options.alert == true) {
						notification.hide(options.alert_target);
					}

					// hide notify
					if (options.notify == true) {
						_notify.clear();
					}
				},
				success: function(r) {
					var statusTitle = r.statusTitle != null ? r.statusTitle : null;

					if (!r.statusUrl) {
						if (r.status && r.statusMsg) {
							// show alert
							if (options.alert == true) {
								notification.show(options.alert_target, r.status, statusTitle, r.statusMsg);
							}

							// show notify
							if (options.notify == true) {
								_notify.show(statusTitle, r.statusMsg, r.status);
							}
						}

						// call custom function
						if (options.function_target) {
							window[options.function_target](r);
						}
					}

					// redirect if statusUrl is defined
					if (r.statusUrl) {
						window.location = r.statusUrl;
					}
					else {
						// stop loader
						if (options.loader == true) {
							loader.stop();
						}

						// stop content loader
						if (options.contentloader == true) {
							contentloader.stop(item);
						}
					}

					// remove processing class
					item.removeClass('processing');
				},
				error: function(jqXHR, textStatus, errorThrown) {
					var statusType = jqXHR.responseJSON.status ? jqXHR.responseJSON.status : 'error';

					// response message
					if (jqXHR.responseJSON.statusMsg) {
						// show alert
						if (options.alert == true) {
							notification.show(options.alert_target, statusType, null, jqXHR.responseJSON.statusMsg);
						}

						// show notify
						if (options.notify == true) {
							_notify.show(null, jqXHR.responseJSON.statusMsg, statusType);
						}
					}

					// stop loader
					if (options.loader == true) {
						loader.stop();
					}

					// stop content loader
					if (options.contentloader == true) {
						contentloader.stop(item);
					}

					// remove processing class
					item.removeClass('processing');
				}
			}, "json");
		});
	},

	ajaxRefresh: function(item) {
		var self 	= this;
		var action 	= item.data('action');

		item.on('ajax:refresh', function() {
			if (item.hasClass('processing')) return;

			var url 	= self.options.actionList[action];
			var data 	= $.extend({}, $(this).data('data'));
			var options	= $.extend({}, $(this).data('options'));

			item.addClass('processing');

			if (typeof url == 'undefined') return;

			// ajax call
			$.ajax({
				type: "GET",
				url: url,
				data: data,
				dataType: 'html',
				beforeSend: function() {
					/*
					 if (options.preloader == true)
					 preloader.start();
					 if (options.toploader == true)
					 toploader.start();
					 if (options.contentloader == true)
					 contentloader.start(item);
					 */

					if (options.contentloader == true)
						contentloader.start(item);
				},
				success: function(data) {
					item.html(data);

					/*
					 if (options.preloader == true)
					 preloader.stop();
					 if (options.toploader == true)
					 toploader.stop();
					 if (options.contentloader == true)
					 contentloader.stop(item);
					 */

					if (options.contentloader == true)
						contentloader.stop(item);

					item.removeClass('processing');
				}
			},"json");
		});
	},

	refreshAll: function(selector) {
		if (typeof selector != 'undefined') {
			if (selector == false) return;

			if (selector == true)
				selector = '[data-ajax-refresh=true]';
			else
				selector = selector+'[data-ajax-refresh=true]';
		}
		selector = '[data-ajax-refresh=true]';

		$(selector).each(function() {
			$(this).trigger('ajax:refresh');
		});
	},

	/**
	 * <div data-long-polling="true" data-options='{"timestamp":"{{ time() }}","ajaxUrl":"{{ LaravelLocalization::getLocalizedURL(LaravelLocalization::getCurrentLocale(), url('longpolling', ['new-payments'])) }}", "call_function":true, "function_target":"managerNewPayments"}'></div>
	 */

	longPolling: function(item, timestamp = 0) {
		var self 		= this;
		var opts 		= $.extend({}, item.data('options'));
		var timestamp 	= timestamp == 0 ? opts.timestamp : timestamp;

		if (timestamp == 0) return;

		// if is in progress
		if (item.hasClass('processing')) return;

		// add processing class
		item.addClass('processing');

		$.ajax({
			type: 'GET',
			url: opts.ajaxUrl,
			data: { 'timestamp': timestamp },
			async: true, // If set to non-async, browser shows page as "Loading.."
			cache: false,
			dataType: 'json',
			timeout: 50000, // set the same as on server side
			success: function(data) {
				if (data) {
					// call custom function
					if (opts.call_function == true) {
						window[opts.function_target](data);
					}
				}

				// remove processing class
				item.removeClass('processing');

				// create another polling
				setTimeout(function() {
					self.longPolling(item, data.timestamp);
				}, 1000); // ...after 1 seconds
			},
			error: function(XMLHttpRequest, textStatus, errorThrown){
				// console.log("error", textStatus + " (" + errorThrown + ")");

				// set new server timestamp
				var timestamp = new Date().getTime();

				// remove processing class
				item.removeClass('processing');

				setTimeout(function() {
					self.longPolling(item, timestamp);
				}, 5000); // milliseconds (5seconds)
			}
		});
	}
};

// show/hide loader
var loader = {
	start: function() {
		$('.loader').show();
	},
	stop: function() {
		$('.loader').hide();
	}
};

// show/hide spinner
var spinner = {
	start: function(target) {
		var l = Ladda.create(document.querySelector('#' + target + ' .btn-ladda-spinner'));
		l.start();
	},
	stop: function(target) {
		var l = Ladda.create(document.querySelector('#' + target + ' .btn-ladda-spinner'));
		l.stop();
	}
};

// show/hide alert
var notification = {
	show: function(target, status, title, msg) {
		var target 	= $('#' + target);
		var title 	= title != null ? '<strong>' + title + '</strong> ' : '';
		var status 	= status == 'error' ? 'danger' : status;
		// var close 	= '';
		var close = '<a href="javascript:void(0);" class="close alert-close">&times;</a>';

		target.addClass('alert-' + status);
		target.html(close + title + msg).show();
	},
	hide: function(target) {
		var target = $('#' + target);

		target.hide();
		target.removeClass('alert-success');
		target.removeClass('alert-danger');
		target.removeClass('alert-warning');
		target.html('');
	}
};

// display notification
var _notify = {
	show: function(title, text, status) {
		var opts = {
			text: text,
			type: status,
			delay: 3000,
			animation: 'none'
		}

		var status 		= status == 'error' ? 'danger' : status;
		opts.addclass 	= 'alert alert-'+status+' alert-styled-left alert-arrow-left';

		if (title != null) { opts.title = title }

		new PNotify(opts);
	},
	clear: function() {
		PNotify.removeAll();
	}
}

// show/hide content loader
var contentloader = {
	start: function(item) {
		if (!item.find('.contentloader').length) {
			item.css('position', 'relative');
			item.prepend('<div class="contentloader"><div class="cloader"><i class="icon-spinner2 spinner icon-2x"></i></div></div>');
		}
	},
	stop: function(item) {
		item.find('.contentloader').remove();
	}
}