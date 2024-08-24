import * as fileselector from "./fileselector.js";
import * as newfile from "./newfile.js";

var focus = "fileselector";
var order = ["fileselector", "newfile"];
var elements = { fileselector, newfile };

function setFocus(newFocus, ...options){
	focus = newFocus;
	elements[newFocus].setActive(true, ...options);
}

export { setFocus, focus, order, elements };