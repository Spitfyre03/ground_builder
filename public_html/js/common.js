//=========================================================//
//	JavaScript functions common to many pages
//=========================================================//
/** JS Cookie management library from https://github.com/ScottHamper/Cookies */
(function(d,f){"use strict";var h=function(d){if("object"!==typeof d.document)throw Error("Cookies.js requires a `window` with a `document` object");var b=function(a,e,c){return 1===arguments.length?b.get(a):b.set(a,e,c)};b._document=d.document;b._cacheKeyPrefix="cookey.";b._maxExpireDate=new Date("Fri, 31 Dec 9999 23:59:59 UTC");b.defaults={path:"/",secure:!1};b.get=function(a){b._cachedDocumentCookie!==b._document.cookie&&b._renewCache();a=b._cache[b._cacheKeyPrefix+a];return a===f?f:decodeURIComponent(a)}; b.set=function(a,e,c){c=b._getExtendedOptions(c);c.expires=b._getExpiresDate(e===f?-1:c.expires);b._document.cookie=b._generateCookieString(a,e,c);return b};b.expire=function(a,e){return b.set(a,f,e)};b._getExtendedOptions=function(a){return{path:a&&a.path||b.defaults.path,domain:a&&a.domain||b.defaults.domain,expires:a&&a.expires||b.defaults.expires,secure:a&&a.secure!==f?a.secure:b.defaults.secure}};b._isValidDate=function(a){return"[object Date]"===Object.prototype.toString.call(a)&&!isNaN(a.getTime())};b._getExpiresDate=function(a,e){e=e||new Date;"number"===typeof a?a=Infinity===a?b._maxExpireDate:new Date(e.getTime()+1E3*a):"string"===typeof a&&(a=new Date(a));if(a&&!b._isValidDate(a))throw Error("`expires` parameter cannot be converted to a valid Date instance");return a};b._generateCookieString=function(a,b,c){a=a.replace(/[^#$&+\^`|]/g,encodeURIComponent);a=a.replace(/\(/g,"%28").replace(/\)/g,"%29");b=(b+"").replace(/[^!#$&-+\--:<-\[\]-~]/g,encodeURIComponent);c=c||{};a=a+"="+b+(c.path?";path="+c.path:"");a+=c.domain?";domain="+c.domain:"";a+=c.expires?";expires="+c.expires.toUTCString():"";return a+=c.secure?";secure":""};b._getCacheFromString=function(a){var e={};a=a?a.split("; "):[];for(var c=0;c<a.length;c++){var d=b._getKeyValuePairFromCookieString(a[c]);e[b._cacheKeyPrefix+d.key]===f&&(e[b._cacheKeyPrefix+d.key]=d.value)}return e};b._getKeyValuePairFromCookieString=function(a){var b=a.indexOf("="),b=0>b?a.length:b,c=a.substr(0,b),d;try{d=decodeURIComponent(c)}catch(k){console&&"function"===typeof console.error&&console.error('Could not decode cookie with key "'+c+'"',k)}return{key:d,value:a.substr(b+1)}};b._renewCache=function(){b._cache=b._getCacheFromString(b._document.cookie);b._cachedDocumentCookie=b._document.cookie};b._areEnabled=function(){var a="1"===b.set("cookies.js",1).get("cookies.js");b.expire("cookies.js");return a};b.enabled=b._areEnabled();return b},g=d&&"object"===typeof d.document?h(d):h;"function"===typeof define&&define.amd?define(function(){return g}):"object"===typeof exports?("object"===typeof module&&"object"===typeof module.exports&&(exports=module.exports=g),exports.Cookies=g):d.Cookies=g})("undefined"===typeof window?this:window);

/**
 * Returns an array of values stored in the cookie as key
 */
function cookieArrayGet(key) {
	return JSON.parse(Cookies.get(key) || '[]');
}

/**
 * Adds the value to an array of unique values stored in the cookie as key
 */
function cookieArrayAdd(key, value) {
	var values = cookieArrayGet(key);
	if (values.length < 1 || values.indexOf(value) === -1) { values.push(value); }
	Cookies.set(key, JSON.stringify(values));
}

/**
 * Removes the value from an array of unique values stored in the cookie as key
 */
function cookieArrayRemove(key, value) {
	var values = JSON.parse(Cookies.get(key) || '{}');
	var i = values.indexOf(value);
	while (i > -1) {
		values.splice(i, 1);
		i = values.indexOf(value);
	}
	Cookies.set(key, JSON.stringify(values));
}

/**
 * Creates a clone of the provided element, appends '_copy'
 * to its id attribute, and appends it to the parent container
 */
function createCopy(e) {
	if (!e) { return false; }
	var clone = e.cloneNode(true);
	clone.setAttribute('id', e.id + '_copy');
	e.parentNode.appendChild(clone);
}

/**
 * Adapted from http://snippetrepo.com/snippets/change-url-parameter-without-reloading-page
 */
function getURLParameter(name, url) {
	return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(url.search)||[,""])[1].replace(/\+/g, '%20'))||null;
}

/**
 * Adapted from http://snippetrepo.com/snippets/change-url-parameter-without-reloading-page
 */
function changeUrlParam (param, value) {
	return changeArbitraryUrlParam(window.location.href, param, value);
}

/**
 * Changes the given parameter in the URL to the provided value
 * @param url   Any URL
 * @param param The parameter key to change
 * @param value The new value for the parameter
 */
function changeArbitraryUrlParam(url, param, value) {
	var fields = url.split('#', 2);
	var url = fields[0] + '&';
	var hash = (fields.length > 1 ? '#' + fields[1] : '');
	var change = new RegExp('('+param+')=([^&]*)&', 'g');
	var newURL = url.replace(change, (value === null ? '' : '$1='+value+'&')).replace(/\+/g, '%20');
	if (value === null || url.indexOf(param+'=') !== -1) {
		return newURL.slice(0, - 1) + hash;
	} else if (url.indexOf("?") !== -1) {
		return url.slice(0, - 1) + (value == null ? '' : '&' + param + '=' + value) + hash;
	} else {
		return url.slice(0, - 1) + (value == null ? '' : '?' + param + '=' + value) + hash;
	}
}

/**
 * Toggles the visibility of the element with the given ID when the link with
 * 'element_id-toggle' is clicked. Also toggles link's title between 'Show'
 * and 'Hide', ignoring any other text (e.g. 'Show Details' becomes 'Hide Details')
 */
if (typeof toggleVisible !== 'function') {
	window.toggleVisible = function(id) {
		var div = document.getElementById(id);
		if (div != null) {
			if (!div.style.display) {
				div.style.display = getComputedStyle(div, null).display;
			}
			if (div.style.display == "none") {
				showHtmlElement(div);
			} else {
				hideHtmlElement(div);
			}
			var link = document.getElementById(id + "-toggle");
			if (link != null) {
				if (div.style.display == "none") {
					link.innerHTML = link.innerHTML.replace("Hide", "Show");
					link.innerHTML = link.innerHTML.replace("\u2212", "+");
				} else {
					link.innerHTML = link.innerHTML.replace("Show", "Hide");
					link.innerHTML = link.innerHTML.replace("+", "\u2212");
				}
			}
		}
		return false;
	}
}

/**
 * Updates datalists containing client locations when the client input is changed
 * @param input DOM input element that changed
 * @param match String initial portion of id of datalist(s) to match, e.g. 'filter_loc_'
 */
if (typeof toggleClient !== 'function') {
	window.toggleClient = function(input, match) {
		//if (input.value === undefined || input.value < 1) { return false; }
		var lists = document.getElementsByTagName('datalist');
		if (lists.length < 1) { return false; }
		var xmlhttp = new XMLHttpRequest();
		xmlhttp.onreadystatechange = function() {
			if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
				var response = decodeURIComponent(xmlhttp.responseText);
				if (response.length < 1) { return false; }
				for (i = 0; i < lists.length; i++) {
					var id = lists[i].id;
					if (id && id.indexOf(match) == 0) {
						if (lists[i].options.length > 0 && lists[i].options.item(0).value == 'Clear Filter') {
							lists[i].innerHTML = '<option value="Clear Filter">Clear Filter</option>' + response;
						} else {
							lists[i].innerHTML = response;
						}
					}
				}
			}
		}
		xmlhttp.open("POST", "xml_request_router.php", true);
		xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
		var data = [];
		data.push('route_id=toggle_client');
		data.push("client=" + encodeURIComponent((input.value === undefined || input.value.length < 1) ? 0 : input.value));
		xmlhttp.send(data.join('&'));
	}
}

/**
 * Type ahead functionality for a form input that uses a dynamic datalist
 * @param list_id Id of list element whose innerHTML will be filled via the type ahead function
 * @param table Table name to search against; must be whitelisted in type_ahead.inc.php
 * @param column Column name to search against; must be whitelisted in type_ahead.inc.php
 */
function typeAhead(input, list_id, table, column) {
	if (!input || input == document.body || input.tagName != "INPUT") {
		return;
	} else if (input.value.length < 3) {
		return;
	}
	var xmlhttp = new XMLHttpRequest();
	xmlhttp.onreadystatechange = function() {
		if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
			var list = document.getElementById(list_id);
			if (list) {
				list.innerHTML = decodeURIComponent(xmlhttp.responseText);
			}
		}
	}
	xmlhttp.open("POST", "xml_request_router.php", true);
	xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
	var data = "route_id=type_ahead&input=" + encodeURIComponent(input.value) + "&table_name=" + encodeURIComponent(table) + "&column_name=" + encodeURIComponent(column);
	xmlhttp.send(data);
}

function onPageLoad() {
	var status = document.getElementById('status');
	// Only setup login prompt if user was logged in at the time the page was loaded
	if (status && status.getAttribute('data-user')) {
		var forms = document.getElementsByTagName('form');
		// Convert NodeList to an Array so Array.forEach can be used, providing a closure around each element
		nodeListToArray(forms).forEach(function(form) {
			if (form.method !== 'post') {
				// do nothing
			} else if (form.id === 'login_prompt_form') {
				form.addEventListener('submit', function(e) {
					return handleLoginPrompt(e, this);
				});
			} else {
				form.addEventListener('submit', function(e) {
					return formSubmissionCheck(e, this);
				});
			}
		});
		var buttons = document.getElementsByTagName('button');
		nodeListToArray(buttons).forEach(function(button) {
			if (button.type === 'submit') {
				button.addEventListener('click', function(e) {
					// force element to have an id so it can be easily retrieved later
					if (!this.id) { this.id = this.name; }
					this.form.setAttribute('data-button_id', this.id);
				});
			}
		});
	}
	var inputs = document.getElementsByTagName('input');
	nodeListToArray(inputs).forEach(function(input) {
		var id = input.id;
		if (input.id !== undefined && input.hasAttribute('list') && (input.id == 'client' || input.id == 'filter_client')) {
			var match = (input.id == 'client' ? 'location' : 'filter_loc');
			input.addEventListener('change', function(e) { toggleClient(this, match) });
		}
	});
	var filter = new RegExp("^button_filter_([a-z]*)");
	var links = document.getElementsByTagName('a');
	nodeListToArray(links).forEach(function(a) {
		if (a.id !== undefined && filter.test(a.id)) {
			a.addEventListener('click', function(e) { updateFilterLink(e, this) });
		}
	});
	if (typeof init_order_elements != 'undefined' && init_order_elements) {
		initOrderElements();
	}
	if (typeof init_toggle_selected != 'undefined' && init_toggle_selected) {
		initToggleSelected();
	}
}

function formSubmissionCheck(e, form) {
	if (form.getAttribute('data-allow-submit') === 'true') { // form submission allowed and confirmed
		// Only allow submitting once - fix for Chrome
		form.setAttribute('data-allow-submit', 'complete');
		return true;
	} else if (form.getAttribute('data-allow-submit') === 'complete') {
		e.preventDefault();
		return false;
	}
	var xmlhttp = new XMLHttpRequest();
	xmlhttp.onreadystatechange = function() {
		if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
			if (xmlhttp.responseText === 'true') {
				var button_id = form.getAttribute('data-button_id');
				var button = null;
				if (button_id) {
					for (var i = 0; i < form.elements.length; i++) {
						if (form.elements[i].type === 'submit' && form.elements[i].id === button_id) {
							button = form.elements[i];
							break;
						}
					}
				}
				if (!checkFormConfirmation(form)) {
					return false;
				} else if (button) {
					if (!checkFormConfirmation(button)) {
						return false;
					}
					form.setAttribute('data-allow-submit', 'true');
					button.click();
				} else {
					form.setAttribute('data-allow-submit', 'true');
					form.submit();
				}
			} else {
				// form.id may return an HTMLInputElement object if there is an input element with name="id"...
				showLoginPrompt(form.getAttribute('id'));
				form.setAttribute('data-allow-submit', 'false');
			}
		}
	}
	xmlhttp.open("POST", "xml_request_router.php", true);
	xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
	xmlhttp.send('route_id=session_check');
	if (form.getAttribute('data-allow-submit') !== 'true') {
		e.preventDefault();
		return false;
	}
}

/**
 * Returns true if form confirmation is not required or was confirmed by user
 * @var e Either the form element or a specific button
 */
function checkFormConfirmation(e) {
	if (e.hasAttribute('data-confirm_submit')) {
		var msg = e.getAttribute('data-confirm_submit');
		if (msg.length < 1) {
			msg = 'Are you sure you want to perform this action?';
		}
		return confirm(msg);
	}
	return true;
}

function handleLoginPrompt(e, form) {
	e.preventDefault(); // don't allow form to submit normally
	var username = document.getElementById('username').value;
	var password = document.getElementById('password').value;
	setError('username', (username ? '' : '* Required field'));
	setError('password', (password ? '' : '* Required field'));
	if (username && password) {
		var xmlhttp = new XMLHttpRequest();
		xmlhttp.onreadystatechange = function() {
			if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
				try {
					var response = JSON.parse(xmlhttp.responseText);
					if (response.success) {
						// Submit the form that initiated the login prompt
						var sub_form = document.getElementById(form.getAttribute('data-form_id'));
						if (sub_form) {
							sub_form.setAttribute('data-allow-submit', 'true');
							sub_form.submit();
						}
						// Close the prompt if no form was specified
						hideHtmlElementById('login_prompt');
					} else {
						if (response.errors.username) {
							setError('username', response.errors.username);
						}
						if (response.errors.password) {
							setError('password', response.errors.password);
						}
						form.setAttribute('data-allow-submit', 'false');
					}
				} catch (err) {
					form.setAttribute('data-allow-submit', 'false');
					setError('username', 'Sorry, there was a system error - please contact the site administrator for assistance.');
				}
			}
		}
		xmlhttp.open("POST", "xml_request_router.php", true);
		xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
		xmlhttp.send('route_id=ajax_login&username=' + encodeURIComponent(username) + '&password=' + encodeURIComponent(password));
	}
}

function showLoginPrompt(form_id) {
	hideHtmlElementById('login_prompt');
	// clear form of any previous attempts
	document.getElementById('username').value = '';
	setError('username', '');
	document.getElementById('password').value = '';
	setError('password', '');
	if (form_id.length > 0) { // needed so the correct form can be submitted once user successfully authenticates
		document.getElementById('login_prompt_form').setAttribute('data-form_id', form_id);
	}
}

function setError(id, error) {
	var par_div = document.getElementById(id);
	var err_div = document.getElementById(id + '-error');
	if (error) {
		par_div.classList.add('error');
		err_div.innerHTML = error;
		err_div.style.display = 'block';
	} else {
		par_div.classList.remove('error');
		err_div.style.display = 'none';
	}
}

/**
 * Initializes links for re-ordering table rows.
 *
 * NOTE: Must set @var 'init_order_elements' prior to including common.js;
 * alternatively, call this function manually after this file has been included.
 *
 * @link Must contain data attribute 'data-move_row' with either 'up' or 'down' value
 */
function initOrderElements() {
	var links = document.getElementsByTagName('a');
	nodeListToArray(links).forEach(function(a) {
		if (a.hasAttribute('data-move_row')) {
			a.onclick = function() {
				var move_up = (this.getAttribute('data-move_row').toLowerCase() == 'up');
				var row = this.parentElement;
				var tries = 0;
				while (row && row.nodeName !== 'TR' && tries < 5) {
					tries++;
					row = row.parentElement;
				}
				if (!row || row.nodeName !== 'TR') {
					return false;
				}
				if (move_up) {
					if (row != row.parentNode.firstElementChild) {
						row.appendBefore(row.previousElementSibling);
					}
				} else if (row != row.parentNode.lastElementChild) {
					row.appendAfter(row.nextElementSibling);
				}
				return false;
			}
		}
	});
}

/**
 * Checkbox event listener to toggle all affected checkboxes
 * @param id Id of 'select_all' checkbox that was toggled
 */
function toggleSelectedResults(id) {
	var toggle = document.getElementById(id);
	var flag = (id === 'select_all'); // true if toggled element is the main 'select_all' checkbox
	var suffix = (id.length > 10 ? id.substr(10) : '(_[a-z0-9_]+)?'); // 'select_all'.length()
	var regexp = new RegExp('^select'+suffix+'-[0-9]+$', 'i');
	var inputs = document.getElementsByTagName('INPUT');
	nodeListToArray(inputs).forEach(function(input) {
		if (!input.disabled && input.type === 'checkbox' && (flag || regexp.test(input.id))) {
			input.checked = toggle.checked;
		}
	});
}

/**
 * Initializes 'select_all' checkbox and adds listeners to 'select-[0-9]+' checkboxes.
 * Subselections may be made by appending '_[a-z0-9]' to the 'select_all' and 'select' inputs,
 * e.g. 'select_all_items' and 'select_items-123'
 * NOTE: Must set @var 'init_toggle_selected' prior to including common.js;
 * alternatively, call this function manually after this file has been included.
 */
function initToggleSelected() {
	var regexp = new RegExp('^select(?:-[0-9]+|(_[a-z0-9_]+)?(-[0-9]+)?)$', 'i');
	var inputs = document.getElementsByTagName('INPUT');
	nodeListToArray(inputs).forEach(function(input) {
		if (input.type !== 'checkbox') {
			return false; // nothing to do
		}
		// Toggle checkbox ids should all start with 'select_all'
		if (input.id.substr(0, 10) === 'select_all') {
			input.addEventListener('change', function(e) { toggleSelectedResults(input.id); });
		}
		// Add listeners to un-check the parent 'select_all' box(es) when any child box is un-checked
		if (regexp.test(input.id)) {
			input.addEventListener('change',
				function(e) {
					if (!this.checked && !this.disabled) {
						var toggle = document.getElementById('select_all');
						if (toggle) {
							toggle.checked = false;
						}
						// Check for suffix match, e.g. select_items-{n} -> select_all_items
						var matches = regexp.exec(input.id);
						var suffix = (matches.length > 1 && matches[1] !== undefined ? matches[1] : '');
						if (suffix && suffix.length > 0) {
							toggle = document.getElementById('select_all'+suffix);
							if (toggle) {
								toggle.checked = false;
							}
						}
					}
				}
			);
		}
	});
}

/**
 * Update the filter link href when clicked so the correct page loads
 * @param e Click event
 * @param a <a> element
 */
function updateFilterLink(e, a) {
	var input = document.getElementById(a.id.substring("button_".length));
	if (input) {
		if (input.value === undefined || (input.value.length === 0 && getURLParameter(input.id, window.location) === null)) {
			e.preventDefault();
		} else {
			var value = (input.value.length === 0 || input.value == 'Clear Filter' ? null : encodeURIComponent(input.value));
			a.href = changeArbitraryUrlParam(a.href, input.id, value);
		}
	}
}

/**
 * @var el The HTML element to make visible
 */
function showHtmlElement(el) {
	el.style.display = 'block';
	el.style.visibility = 'visible';
}

function showHtmlElementById(id) {
	var el = document.getElementById(id);
	if (el) { showHtmlElement(el); }
}

/**
 * @var el The HTML element to hide
 */
function hideHtmlElement(el) {
	el.style.display = 'none';
	el.style.visibility = 'hidden';
}

function hideHtmlElementById(id) {
	var el = document.getElementById(id);
	if (el) { hideHtmlElement(el); }
}

/**
 * Convert a NodeList into an Array
 */
function nodeListToArray(nl) {
	var i = nl.length, arr = new Array(i);
	for(; i--; arr[i] = nl[i]);
	return arr;
}

//============ PROTOTYPES =============//

/** Credit to http://stackoverflow.com/a/32135318 */
Element.prototype.appendBefore = function (element) {
	element.parentNode.insertBefore(this, element);
},false;

/** Credit to http://stackoverflow.com/a/32135318 */
Element.prototype.appendAfter = function (element) {
	element.parentNode.insertBefore(this, element.nextSibling);
},false;

//============ WINDOW EVENTS =============//

window.addEventListener("load", onPageLoad);

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = "none";
    }
}
