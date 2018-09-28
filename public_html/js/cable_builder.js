function addCable() {
    var body = document.getElementById("cable-builder").getElementsByTagName("tbody")[0];
    var index = body.rows.length;
    var cable = cookieArrayGet('cable');
    if (cable === [] || cable[0] !== index) {
        alert("You must complete the current cable first");
        return;
    }
    var cell = document.createElement("td");
    cell.innerHTML = "Cable " + index;
    var row = document.createElement("tr");
    row.id = "quote-item-" + index;
    row.appendChild(cell);
    var bRow = document.getElementById("cable-adder");
    bRow.insertAdjacentElement("beforebegin",row);
    document.getElementsByTagName("form")[0].classList.remove("hide");
}
