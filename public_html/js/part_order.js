/**
 * Clones the 'parts_template' element and replaces all instances of 'id' in the id and
 * name fields with the index provided by the 'next_id' element, appending the container
 * to the parts list element with the specified list_id.
 *
 * @param allowNull true to include listeners for the 'No part #' and 'No manufacturer' check boxes
 * @param list_id id of element to which new element will be appended
 * @return false or a valid Node
 */
function addAdditionalItem(allowNull = true, list_id = 'order_items_list') {
	var next_id = document.getElementById('next_id');
	var template = document.getElementById('parts_template');
	var parts_list = document.getElementById(list_id);
	if (!next_id || !template || !parts_list) { return false; }
	var index = +next_id.value;
	next_id.value = index + 1; // update next id value for next line
	var container = template.cloneNode(true);
	container.setAttribute('id', 'parts_row-' + index);
	container.classList.remove('hide', 'no_print');
	nodeListToArray(container.children).forEach(function(e) {
		replaceChildIds(e, index);
	});
	parts_list.appendChild(container);
	addInputKeyListener(document.getElementById('part_number-' + index));
	if (allowNull) {
		addNullCheckboxOnClick(document.getElementById('part_null_number-' + index));
		addNullCheckboxOnClick(document.getElementById('part_null_manufacturer-' + index));
	}
	var next_id = document.getElementById('next_id');
	if (next_id) {
		next_id.value = index + 1; // update next id value for next line
	}
	return container;
}
/**
 * Recursively replaces '[n]' in name and '-n' in id, label, etc. of each element e with the provided index
 */
function replaceChildIds(e, index) {
	if (e.name) {
		e.name = e.name.replace('[n]', '[' + index + ']');
	}
	// Replace -n followed by an apostrophe or end of line
	var regexp = /-n(?='|$)+/gi;
	var attributes = ['id', 'for', 'list', 'onchange'];
	for (var i = 0; i < attributes.length; ++i) {
		if (e.hasAttribute(attributes[i])) {
			e.setAttribute(attributes[i], e.getAttribute(attributes[i]).replace(regexp, '-' + index));
		}
	}
	if (e.hasAttribute('onclick') && e.getAttribute('onclick').indexOf('removeLine(n') > -1) {
		e.setAttribute('onclick', e.getAttribute('onclick').replace('(n', '(' + index));
	}
	if (e.children.length > 0) {
		nodeListToArray(e.children).forEach(function(child) {
			replaceChildIds(child, index);
		});
	}
}
function removeLine(id, list_id = 'order_items_list') {
	var div = document.getElementById('parts_row-' + id);
	var container = document.getElementById(list_id);
	if (div && container) {
		container.removeChild(div);
	}
}
function addInputKeyListener(input) {
	if (!input || input.tagName != "INPUT" || input.id.indexOf("part_number-") < 0) {
		return;
	}
	input.addEventListener('input', function() {
		typeAhead(input, 'parts_list', 'inventory_catalog', 'part_number');
	});
	var id = input.id.slice(12, input.id.length);
	if (id) {
		input.addEventListener('change', function() {
			autoCompleteByPart(id);
		});
		var man = document.getElementById('part_manufacturer-' + id);
		if (man) {
			man.addEventListener('change', function() {
				autoCompleteByPart(id);
			});
		}
	}
}
/**
 * Adds click handler for checkbox that 'nullifies' another input field.
 * Checkbox id should be the id of the other field plus '_null' anywhere in the id.
 */
function addNullCheckboxOnClick(checkbox) {
	if (!checkbox || checkbox == document.body || checkbox.tagName != "INPUT" || checkbox.id.indexOf("_null") < 0) {
		return;
	}
	checkbox.addEventListener('click', function() {
		var id = checkbox.id.replace("_null", "");
		var text = document.getElementById(id);
		if (text && text.tagName === "INPUT") {
			text.disabled = checkbox.checked;
		}
	});
}
/**
 * Show form inputs for editing an existing part
 * @param i index of the part to display
 */
function editPart(i) {
	var part_display = document.getElementById('part_row_display-' + i);
	var part_form = document.getElementById('part_row_form-' + i);
	if (part_display && part_form) {
		part_display.style.display = 'none';
		part_display.classList.add('hide');
		part_form.style.display = 'table-row';
		part_form.classList.remove('hide');
		var skip = document.getElementById('skip_part-' + i);
		if (skip) { // remove 'skip processing' flag
			skip.disabled = true;
		}
	}
	return false;
}
function autoCompleteByPart(id) {
	var part = document.getElementById('part_number-' + id);
	if (!part) {
		return false;
	} else if (!part.value || part.value.length < 1) {
		var part_id = document.getElementById('part_id-' + id);
		if (part_id) {
			part_id.value = '';
			if (part_id.onchange) {
				part_id.onchange();
			}
		}
		var warning = document.getElementById('part_warning-' + id);
		if (warning) { // clear warning
			warning.innerHTML = '';
		}
		// Don't need to make XMLHttp request when no part number input
		return false;
	}
	var xmlhttp = new XMLHttpRequest();
	xmlhttp.onreadystatechange = function() {
		if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
			var response = JSON.parse(xmlhttp.responseText);
			var part_id = document.getElementById('part_id-' + id);
			if (part_id) {
				part_id.value = (response.id ? response.id : '');
				if (part_id.onchange) {
					part_id.onchange();
				}
			}
			var man = document.getElementById('part_manufacturer-' + id);
			var null_man = document.getElementById('part_null_manufacturer-' + id);
			if (!man) {
				// do nothing - no page element found
			} else if (response.manufacturer) {
				if (man.value.length < 1) {
					man.value = response.manufacturer;
					if (null_man) {
						man.disabled = false;
						null_man.checked = false;
					}
				}
			} else if (response.id) {
				if (man.value.length < 1) {
					man.value = '';
					if (null_man) {
						man.disabled = true;
						null_man.checked = true;
					}
				}
			}
			var desc = document.getElementById('part_description-' + id);
			if (desc && response.description) {
				desc.value = response.description;
			}
			var cost = document.getElementById('part_cost-' + id);
			if (cost && response.cost) {
				cost.value = '$' + (response.cost / 100).toFixed(2);
			}
			var price = document.getElementById('part_price-' + id);
			if (price && response.price) {
				price.value = '$' + (response.price / 100).toFixed(2);
			}
			if (response.error) {
				part.classList.add('error');
				var error = document.getElementById('part_error-' + id);
				if (!error) {
					error = document.createElement('span');
					error.setAttribute('class', 'error');
					error.setAttribute('id', 'part_error-' + id);
					part.parentNode.appendChild(error);
				}
				error.innerHTML = response.error;
			} else {
				part.classList.remove('error');
				var error = document.getElementById('part_error-' + id);
				if (error) { // clear error
					error.innerHTML = '';
				}
			}
			var warning = document.getElementById('part_warning-' + id);
			if (response.warning) {
				if (!warning) {
					warning = document.createElement('div');
					warning.setAttribute('id', 'part_warning-' + id);
					warning.setAttribute('class', 'warning');
					var container = part.parentNode.parentNode;
					container.insertBefore(warning, container.firstChild);
				}
				warning.innerHTML = response.warning;
			} else if (warning) {
				warning.innerHTML = '';
			}
			// Update manufacturer list
			var list = document.getElementById('part_manufacturers');
			if (!list) {
				// nothing to do
			} else if (response.manufacturer_list) {
				list.innerHTML = response.manufacturer_list;
			} else {
				var copy = document.getElementById('part_manufacturers_copy');
				if (copy) {
					list.innerHTML = copy.innerHTML;
				}
			}
		}
	}
	xmlhttp.open("POST", "xml_request_router.php", true);
	xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
	var data = "route_id=parts_catalog_details&part_number=" + encodeURIComponent(part.value);
	var manufacturer = document.getElementById('part_manufacturer-' + id);
	if (manufacturer && manufacturer.value) {
		data += "&part_manufacturer=" + encodeURIComponent(manufacturer.value);
	}
	xmlhttp.send(data);
}
/**
 * Displays a pre-existing list of bins for the selected warehouse.
 * Expects label for the bin <select> element to use to be stored in the warehouse <select> element's 'data-list_label' attribute.
 * Stores previously used bin list in the default (empty) bin <select> element's 'data-prev_select' attribute.
 *
 * Can work with <datalist> by passing the <input> id instead of a <select> id. If the <input> has a
 * 'data-list_label' attribute, that will be used; otherwise, the bin list id will be assumed to be
 * the input value, lowercase, whitespace to single underscore, with '-i' if warehouse select has it.
 *
 * @param warehouse_select_id Id of <select> element for selecting the warehouse
 * @param default_select_id   Id of default (typically empty) <select> element for the warehouse bins
 */
function setBinsList(warehouse_select_id, default_select_id) {
	var select = document.getElementById(warehouse_select_id);
	var default_bin = document.getElementById(default_select_id);
	if (!select || !default_bin) {
		return false;
	}
	var label = '';
	if (select.tagName === 'SELECT') {
		label = (select.selectedIndex > -1 ? select.options[select.selectedIndex].getAttribute('data-list_label') : false);
	} else if (select.tagName === 'INPUT') {
		label = select.getAttribute('data-list_label');
		if (!label && select.value.length > 0) {
			label = select.value.toLowerCase().replace(/\s+/g, '_');
			// Append numerical suffix, if any
			var matches = warehouse_select_id.match(/-[0-9]+$/);
			if (matches && matches.length > 0) {
				label = label + matches[0];
			}
		}
	}
	var bin_list = document.getElementById(label);
	var prev = (default_bin.hasAttribute('data-prev_select') ? document.getElementById(default_bin.getAttribute('data-prev_select')) : false);
	if (label && bin_list) {
		if (prev) {
			prev.classList.add('hide');
			prev.disabled = true;
		}
		default_bin.setAttribute('data-prev_select', label);
		default_bin.classList.add('hide');
		default_bin.disabled = true;
		bin_list.classList.remove('hide');
		bin_list.disabled = false;
	} else {
		if (prev) {
			prev.classList.add('hide');
			prev.disabled = true;
		}
		default_bin.removeAttribute('data-prev_select');
		default_bin.classList.remove('hide');
		default_bin.disabled = false;
	}
}
/**
 * Updates the warehouse bin datalist when the warehouse form input changes.
 * @param input_id id of form input containing the warehouse name
 * @param list_id  id of datalist container for warehouse bin entries
 */
function updateBinsDatalist(input_id, list_id) {
	var input = document.getElementById(input_id);
	if (!input || input == document.body || input.tagName != "INPUT") {
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
	var data = "route_id=warehouse_bins&warehouse=" + encodeURIComponent(input.value);
	xmlhttp.send(data);
}
window.onload = function() {
	var inputs = document.getElementsByTagName("INPUT");
	for (var i = 0; i < inputs.length; i++) {
		switch (inputs[i].getAttribute("type")) {
		case 'text':
			addInputKeyListener(inputs[i]);
			break;
		case 'checkbox':
			addNullCheckboxOnClick(inputs[i]);
			break;
		default: break;
		}
	}
	// Make a copy of certain data lists
	createCopy(document.getElementById('part_manufacturers'));
}
