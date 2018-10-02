
function cloneTemplate(element) {
    var clone = element.cloneNode(true);
    var index = cookieArrayGet("cable");
    clone.setAttribute("id", element.id.replace("template-","").concat("-" + index).trim());
    return clone;
}

function startCable() {
    if (addCable()) {
        var clone = cloneTemplate(document.getElementById("template-cable-setup"));
        document.getElementById("new-cable").appendChild(clone);
        document.getElementById("cables-form").classList.remove("hide");
    }
}

function addCable() {
    var body = document.getElementById("quote-items-body");
    var index = body.rows.length;
    var div = document.getElementById("new-cable");
    if (div != null) {
        alert("You must complete the current cable first");
        return false;
    }
    var display = document.createElement("div");
    display.id = "new-cable";
    document.getElementById("form-panel").appendChild(display);
    var cell = document.createElement("td");
    cell.innerText = "Cable " + index;
    var row = document.createElement("tr");
    row.id = "quote-item-" + index;
    row.appendChild(cell);
    var bRow = document.getElementById("table-cable-adder");
    bRow.insertAdjacentElement("beforebegin",row);
    return true;
}

function setupCable(container) {
    var type = container.querySelector("select").value;
    createCableTree(type);
    var parent = container.parentElement;
    if (parent.children.length > 1) {
        parent.innerHTML = '';
        parent.appendChild(container);
    }
    setupCableForm(type).forEach(function(child) {
        parent.appendChild(child);
    });
    next(container);
}

/** Initiates a tree for displaying the cable in the review table */
function createCableTree(type) {
    var isCluster = type > 1;
    var itt = (isCluster ? 4 : 1);
    var index = document.getElementById("quote-items-body").getElementsByTagName("tr").length - 1;
    var cell = document.getElementById("quote-item-" + index).children[index - 1];
    if (cell.querySelector("ul") !== null) {
        cell.removeChild(cell.lastChild);
    }
    var tree = document.createElement("ul");
    var id = 'a';
    var num = 1;
    for (var x = 0; x < itt; x++) {
        var cable = document.createElement("li");
        cable.id = "cable-" + id;
        cable.classList.add("hide");
        for (var y = 0; y < 2; y++) {  
            var ferrList = document.createElement("ul");
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
            cable.appendChild(ferrList);
            num++;
        }
        id = String.fromCharCode(id.charCodeAt() + 1);
        tree.appendChild(cable);
    }
    cell.appendChild(tree);
}

function setupCableForm(type) {
    var isCluster = type > 1;
    var arr = isCluster ? new Array(10) : new Array(5);
    if (isCluster) {
        // Cable, modified for cluster style
        var cable = cloneTemplate(document.getElementById("template-cable-search"));
        var quant = cable.children.namedItem("cable-length-div");
        var button = quant.nextElementSibling;
        Array.from(document.getElementById("cluster-lengths").children).forEach(function(e){
            button.insertAdjacentElement("beforebegin",e);
        });
        quant.remove();
        arr.push(cable);
        // Block Ferrule
        var blockFerr = cloneTemplate(document.getElementById("template-ferrule-search"));
        blockFerr.firstElementChild.remove();
        var title = document.createElement("h2");
        title.classList.add("centered");
        title.innerText = "Block Ferrules";
        blockFerr.insertAdjacentElement("afterbegin",title);
        blockFerr.id = blockFerr.id.concat("-block");
        arr.push(blockFerr);
        // Ferrules 1-4, Clamps 1-4 in between
        for (var i = 1; i <= 4; i++) {
            var ferr = cloneTemplate(document.getElementById("template-ferrule-search"));
            ferr.id = ferr.id.concat("-" + i);
            arr.push(ferr);
            var clamp = cloneTemplate(document.getElementById("template-clamp-search"));
            clamp.id = clamp.id.concat("-" + i);
            arr.push(clamp);
        }
    } else {
        var cable = cloneTemplate(document.getElementById("template-cable-search"));
        arr.push(cable);
        for (var i = 1; i <= 2; i++) {
            var ferr = cloneTemplate(document.getElementById("template-ferrule-search"));
            ferr.id = ferr.id.concat('-' + i);
            arr.push(ferr);
            var clamp = cloneTemplate(document.getElementById("template-clamp-search"));
            clamp.id = clamp.id.concat('-' + i);
            arr.push(clamp);
        }
    }
    return arr;
}

function next(e) {
    e.nextElementSibling.classList.remove("hide");
    e.classList.add("hide");
}

function back(e) {
    e.previousElementSibling.classList.remove("hide");
    e.classList.add("hide");
}
