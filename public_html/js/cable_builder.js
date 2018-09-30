
function cloneTemplate(element) {
    var clone = element.cloneNode(true);
    var index = cookieArrayGet("cable");
    clone.setAttribute("id", element.id.replace("template-","").concat("-" + index).trim());
    return clone;
}

function initSetup() {
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
}
