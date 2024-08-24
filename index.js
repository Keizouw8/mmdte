import rdl from "readline";
import { setFocus, focus, elements } from "./elements/elements.js"
import { setDirectory } from "./state.js";
import draw from "./draw.js";

function editor(dir){
	process.stdout.write('\u001b[3J\u001b[1J');
	console.clear();

	if(dir) setDirectory(dir);
	if(!process.stdin.isTTY) return process.exit();

	process.stdin.setRawMode(true);
	rdl.emitKeypressEvents(process.stdin);
	process.stdin.on("keypress", function(char, key){
		if(key.ctrl && key.name == "q"){
			process.stdout.write('\u001b[3J\u001b[1J');
			console.clear();
			process.stdout.write("\u001B[?25h");
			return process.exit();
		}

		elements[focus].handleInput(char, key);
	});

	process.stdout.on("resize", draw);
	draw();
}

setFocus("fileselector");
editor();