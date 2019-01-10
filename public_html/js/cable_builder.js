
function cloneTemplate(element) {
    if (element) {
        var clone = element.cloneNode(true);
        replaceTemplateIDs(clone);
        return clone;
    }
    return false;
}

function replaceTemplateIDs(e) {
    if (e.id) {
        e.id = e.id.replace("template-", "");
    }
    var length = e.children.length;
    if (length > 0) {
        for (var i = 0; i < length; i++) {
            replaceTemplateIDs(e.children[i]);
        }
    }
}

// TODO consolidate adding and setting up 
function startCable() {
    var template = document.getElementById("template-cable_setup");
    var form = document.getElementById("form-cable_builder");
    var isAdded = addCable();
    var container = document.getElementById("new_cable");
    if (isAdded && container && template && form) {
        var clone = cloneTemplate(template);
        container.appendChild(clone);
        form.classList.remove("hide");
    }
}

function addCable() {
    var div = document.getElementById("new_cable");
    if (div) {
        alert("You must complete the current cable first");
        return false;
    }
    var body = document.getElementById("table-body-quote_items");
    var panel = document.getElementById("form_panel");
    var bRow = document.getElementById("table-cable_adder");
    if (body && panel && bRow) {
        var index = body.rows.length;
        var display = document.createElement("div");
        display.id = "new_cable";
        panel.appendChild(display);
        var cell = document.createElement("td");
        cell.innerHTML = "<h4>Cable " + index + "</h4>";
        var row = document.createElement("tr");
        row.id = "quote-item-" + index;
        row.appendChild(cell);
        bRow.insertAdjacentElement("beforebegin",row);
        return true;
    }
}

function setupCable() {
    var container = document.getElementById("cable_setup");
    var type = document.getElementById("select-cable_type");
    if (container && type && type.tagName === "SELECT") {
        type = +type.value;
        createCableTree(type);
        var parent = container.parentElement;
        if (parent.children.length > 1) {
            parent.innerHTML = '';
            parent.appendChild(container);
        }
        var panes = setupCableForm(type);
        if (panes) {
            panes.forEach(function(child) {
                parent.appendChild(child);
            });
            next(container);
        }
    }
}

/** Initiates a tree for displaying the cable in the review table */
function createCableTree(type) {
    var tableBody = document.getElementById("table-body-quote_items");
    if (tableBody && tableBody.getElementsByTagName("tr")) {
        var index = tableBody.getElementsByTagName("tr").length - 1;
        var itemRow = tableBody.children[index - 1];
        if (itemRow) {
            var isCluster = type > 1;
            var itt = (isCluster ? 4 : 1);
            var cell = itemRow.firstElementChild;
            if (cell.querySelector("ul")) {
                cell.removeChild(cell.lastChild);
            }
            var tree = document.createElement("ul");
            var id = 'a';
            var num = 1;
            for (var x = 0; x < itt; x++) {
                var cable = document.createElement("li");
                cable.id = "cable-" + id;
                cable.classList.add("hide");
                var ferrList = document.createElement("ul");
                for (var y = 0; y < 2; y++) {
                    var ferr = document.createElement("li");
                    ferr.id = "ferrule-" + num;
                    ferr.classList.add("hide");
                    var cabList = document.createElement("ul");
                    var shrink = document.createElement("li");
                    shrink.innerText = "Shrink";
                    cabList.appendChild(shrink);
                    if (isCluster && y != 1) {
                        var clamp = document.createElement("li");
                        clamp.id = "clamp-" + num;
                        clamp.classList.add("hide");
                        cabList.appendChild(clamp);
                    }
                    ferr.appendChild(cabList);
                    ferrList.appendChild(ferr);
                    num++;
                }
                cable.appendChild(ferrList);
                id = String.fromCharCode(id.charCodeAt() + 1);
                tree.appendChild(cable);
            }
            cell.appendChild(tree);
        }
    }
}

// TODO go back through and validate truthiness of these elements
function setupCableForm(type) {
    var panesContainer = document.getElementById("new_cable");
    var cableTemp = document.getElementById("template-cable_search");
    var ferrTemp = document.getElementById("template-ferrule_search");
    var clampTemp = document.getElementById("template-clamp_search");
    if (panesContainer && cableTemp && ferrTemp && clampTemp) {
        var isCluster = type > 2;
        var isJumper = type % 2;
        var arr = new Array(isCluster ? 10 : 5);

        var cable = cloneTemplate(cableTemp);
        var clusterLengthsTemplate = document.getElementById("template-cluster_lengths");
        if (isCluster && clusterLengthsTemplate && clusterLengthsTemplate.children) {
            // Cable, modified for cluster style
            var singleLengthDiv = cable.children.namedItem("cable_length");
            var clusterLengthsDiv = cloneTemplate(clusterLengthsTemplate);
            clusterLengthsDiv.appendAfter(singleLengthDiv);
            singleLengthDiv.remove();
            
            arr.push(cable);
            // Block Ferrule
            var blockFerr = cloneTemplate(ferrTemp);
            blockFerr.firstElementChild.remove();
            var title = document.createElement("h2");
            title.classList.add("centered");
            title.innerText = "Block Ferrules";
            blockFerr.insertAdjacentElement("afterbegin",title);
            blockFerr.id = blockFerr.id.concat("-block");
            arr.push(blockFerr);
            // Ferrules 1-4, Clamps 1-4 in between
            for (var i = 1; i <= 4; i++) {
                var ferr = cloneTemplate(ferrTemp);
                ferr.id = ferr.id.concat("-" + i);
                arr.push(ferr);
                var clamp = cloneTemplate(clampTemp);
                clamp.id = clamp.id.concat("-" + i);
                arr.push(clamp);
            }
        } else {
            arr.push(cable);
            for (var i = 1; i <= 2; i++) {
                var ferr = cloneTemplate(ferrTemp);
                ferr.id = ferr.id.concat('-' + i);
                arr.push(ferr);
                var clamp = cloneTemplate(clampTemp);
                clamp.id = clamp.id.concat('-' + i);
                arr.push(clamp);
            }
        }
        return arr;
    }
    return false;
}

function next(e) {
    if (e && e.nextElementSibling) {
        var ul = document.getElementById("inventory_catalog");
        if (ul) {
            empty(ul);
            ul.parentElement.classList.add('hide');
        }
        e.nextElementSibling.classList.remove("hide");
        e.classList.add("hide");
    }
}

function back(e) {
    if (e && e.previousElementSibling) {
        var ul = document.getElementById("inventory_catalog");
        if (ul) {
            empty(ul);
            ul.parentElement.classList.add('hide');
        }
        e.previousElementSibling.classList.remove("hide");
        e.classList.add("hide");
    }
}

function empty(element) {
    if (element && element.innerHTML) {
        element.innerHTML = '';
    }
}