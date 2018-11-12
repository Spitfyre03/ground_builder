
function cloneTemplate(element) {
    var clone = null;
    if (element) {
        clone = element.cloneNode(true);
        clone.setAttribute("id", clone.id.replace("template-","").trim());
        var tbody = document.getElementById("quote-items-body");
        if (tbody) {
            var index = tbody.children.length - 1;
            clone.setAttribute("id", clone.id.concat("-" + index).trim());
        }
    }
    return clone;
}

function startCable() {
    var template = document.getElementById("template-cable-setup");
    var form = document.getElementById("cables-form");
    var container;
    if (addCable() && (container = document.getElementById("new-cable")) && template && form) {// assignment intended
        var clone = cloneTemplate(template);
        container.appendChild(clone);
        form.classList.remove("hide");
    }
}

function addCable() {
    var div = document.getElementById("new-cable");
    if (div) {
        alert("You must complete the current cable first");
        return false;
    }
    var body = document.getElementById("quote-items-body");
    var panel = document.getElementById("form-panel");
    var bRow = document.getElementById("table-cable-adder");
    if (body && panel && bRow) {
        var index = body.rows.length;
        var display = document.createElement("div");
        display.id = "new-cable";
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

function setupCable(container) {
    if (container && container.querySelector("select")) {
        var type = +container.querySelector("select").value;
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
    var tableBody = document.getElementById("quote-items-body");
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
    var cableTemp = document.getElementById("template-cable-search");
    var ferrTemp = document.getElementById("template-ferrule-search");
    var clampTemp = document.getElementById("template-clamp-search");
    var cableType = document.getElementById("cable_type");
    if (cableTemp && ferrTemp && clampTemp && cableType) {
        var isCluster = type > 2;
        var arr = isCluster ? new Array(10) : new Array(5);
        cableType.setAttribute("value", type);

        var singleLengthTemplate = document.getElementById("template-cable-length");
        var clusterLengthsTemplate = null;
        if (isCluster && (clusterLengthsTemplate = document.getElementById("template-cluster-lengths")) && clusterLengthsTemplate.children) {// assignment intended
            // Cable, modified for cluster style
            console.log("Creating cluster panes");
            if (!singleLengthTemplate) {
                return false;
            }
            var cable = cloneTemplate(cableTemp);
            var singleLengthDiv = cable.children.namedItem(singleLengthTemplate.id);
            var clusterLengthsDiv = clusterLengthsTemplate.cloneNode(true);
            clusterLengthsDiv.setAttribute("id", clusterLengthsDiv.id.replace("template-", "").trim());
            singleLengthDiv.insertAdjacentElement("afterend", clusterLengthsDiv);
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
            var cable = cloneTemplate(cableTemp);
            if (!singleLengthTemplate) {
                return false;
            }
            var singleLengthDiv = cable.children.namedItem(singleLengthTemplate.id);
            singleLengthDiv.setAttribute("id", singleLengthDiv.id.replace("template-", "").trim());
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
        var ul = document.getElementById("inventory-catalog");
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
        var ul = document.getElementById("inventory-catalog");
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