/**
 * The Javascript in this file is based on Cory LaViska's PHP File Tree code,
 * available at http://www.abeautifulsite.net/php-file-tree/
 */

/**
 * Declare a function 'selectCategory(id)' prior to including this library if behavior
 * other than the default is required upon clicking a category
 */
function init_tree() {
	if (!document.getElementsByTagName) { return; }
	var aMenus = document.getElementsByTagName("LI");
	for (var i = 0; i < aMenus.length; i++) {
		var mclass = aMenus[i].className;
		if (mclass.indexOf("leaf") > -1) {
			var submenu = aMenus[i].childNodes;
			for (var j = 0; j < submenu.length; j++) {
				if (submenu[j].tagName == "A") {
					submenu[j].onclick = function() {
						selectCategory(this.id);
						return false;
					}
				}
			}
		} else if (mclass.indexOf("category") > -1) {
			var submenu = aMenus[i].childNodes;
			for (var j = 0; j < submenu.length; j++) {
				if (submenu[j].tagName == "A") {
					submenu[j].onclick = function() {
						var node = this.nextSibling;
						while (1) {
							if (node != null) {
								if (node.tagName == "UL") {
									if (node.style.display == "none") {
										node.style.display = "block";
										this.className = "open";
										selectCategory(this.id);
									} else {
										node.style.display = "none";
										this.className = "closed";
									}
									return false;
								}
								node = node.nextSibling;
							} else {
								return false;
							}
						}
						return false;
					}
					submenu[j].className = (mclass.indexOf("open") > -1) ? "open" : "closed";
				}
				if (submenu[j].tagName == "UL") {
					submenu[j].style.display = (mclass.indexOf("open") > -1) ? "block" : "none";
				}
			}
		}
	}
	return false;
}

/**
 * Default 'selectCategory(id)' function displays data as a shopping cart-type form
 */
if (typeof selectCategory !== 'function') {
	window.selectCategory = function(id) {
		if (id > 0) {
			var xmlhttp = new XMLHttpRequest();
			xmlhttp.onreadystatechange = function() {
				if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
					clearNotifications();
					document.getElementById("category-content").innerHTML = xmlhttp.responseText;
				}
			}
			xmlhttp.open("GET", "xml_request_router.php?route_id=display_category&cat=" + encodeURIComponent(id), true);
			xmlhttp.send();
		}
	}
}

/**
 * Updates the currently product display based on currently selected options.
 * Requires any product attributes to be listed as separate <select> elements.
 * Sets values for id='product-price' and <img id='product-image'> HTML elements
 * @param category_id	Id of currently selected category, e.g. 8
 */
 if (typeof updateProduct !== 'function') {
	window.updateProduct = function(category_id) {
		if (category_id === undefined || category_id < 1) {
			return false;
		}
		if (!document.getElementsByTagName) { return; }
		var xmlhttp = new XMLHttpRequest();
		xmlhttp.onreadystatechange = function() {
			if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
				clearNotifications();
				var values = xmlhttp.responseText.split('&');
				for (var i = 0; i < values.length; i++) {
					values[i] = values[i].split('=');
					if (values[i].length !== 2) {
						continue;
					}
					var key = values[i][0];
					var value = decodeURIComponent(values[i][1]);
					switch(key) {
					case 'id':
						var product_id = document.getElementById('product-id');
						if (product_id != null) {
							product_id.value = value;
						}
						break;
					case 'image':
						var image = document.getElementById('product-image');
						if (image != null && image.tagName === 'IMG') {
							var src = image.src.slice(0, image.src.lastIndexOf('/') + 1);
							image.src = src + value;
						}
						break;
					case 'price':
					case 'price_per_day':
					case 'price_per_month':
						var price = document.getElementById('product-' + key);
						if (price != null) {
							price.value = value;
						}
						break;
					default:
						// unknown
					}
				}
			}
		}
		xmlhttp.open("POST", "xml_request_router.php", true);
		xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
		var data = [];
		data.push("route_id=rental_update_product");
		data.push("category_id=" + encodeURIComponent(category_id));
		var aSelect = document.getElementsByTagName("SELECT");
		for (var i = 0; i < aSelect.length; i++) {
			var sid = aSelect[i].id;
			if (sid !== undefined && sid.indexOf("att_select_") > -1) {
				data.push(sid + '=' + encodeURIComponent(aSelect[i].value));
			}
		}
		data = data.join('&');
		xmlhttp.send(data);
	}
}

window.addEventListener("load", init_tree);
