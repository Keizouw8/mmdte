import chalk from "chalk";
import path from "path";
import fs from "fs";
import stringWidth from "string-width";
import { directory } from "../state.js";
import { setFocus } from "./elements.js";
import draw from "../draw.js";

var width = 30;
var cursor = 0;
var selection = 0;
var text = "";
var offset = 0;

export var active = false;
export var setActive = (status) => active = status;

export function handleInput(char, key){
	if(key.name == "escape" || key.ctrl && key.name == "n"){
		active = false;
		setFocus("fileselector");
	}else if(key.shift && key.name == "down"){
		selection = text.length - cursor;
		if(cursor + selection - offset > width - 2) offset = cursor + selection - width + 2;
	}else if(key.name == "down"){
		selection = 0;
		cursor = text.length;
		if(cursor - offset > width - 2) offset = cursor - width + 3;
	}else if(key.shift && key.name == "up"){
		selection = -cursor;
		offset = 0;
	}else if(key.name == "up"){
		selection = 0;
		offset = 0;
		cursor = 0;
	}else if(key.shift && key.name == "right"){
		if(cursor + selection < text.length - 1) selection++;
		if(cursor + selection - offset > width - 4) offset++;
	}else if(key.name == "right"){
		if(selection > 0) cursor = cursor + selection - 1;
		if(selection < 0) cursor--;
		selection = 0;

		cursor = Math.min(text.length, cursor + 1);
		if(cursor - offset > width - 2) offset++;
	}else if(key.shift && key.name == "left"){
		if(cursor + selection > 0) selection--;
		if(cursor + selection - offset < 0) offset = Math.max(0, offset - 1);
	}else if(key.name == "left"){
		if(selection > 0) cursor++;
		if(selection < 0) cursor = cursor + selection + 1;
		selection = 0;

		if(cursor - offset > width - 2 || cursor - offset < 0){
			if(stringWidth(text) <= width - 2) offset = 0;
			if(stringWidth(text) > width - 2) offset = cursor - width + 2;
		}

		cursor = Math.max(0, cursor - 1);
		if(cursor - offset < 0) offset = Math.max(0, offset - 1);
	}else if(key.name == "backspace"){
		text = text.substring(0, Math.min(cursor, cursor + selection) - !Boolean(selection)) + text.substring(Math.max(cursor, cursor + selection) + Boolean(selection));
		if(selection > 0) cursor++;
		if(selection < 0) cursor += selection + 1;
		selection = 0;

		if(cursor - offset > width - 2 || cursor - offset < 0){
			if(stringWidth(text) <= width - 2) offset = 0;
			if(stringWidth(text) > width - 2) offset = cursor - width + 1;
		}

		cursor = Math.max(0, cursor - 1);
		if(cursor - offset < 0) offset = Math.max(0, offset - 1);
	}else if(key.name == "return"){

	}else{
		text = text.substring(0, Math.min(cursor, cursor + selection)) + char + text.substring(Math.max(cursor, cursor+selection) + Boolean(selection));
		cursor = Math.min(cursor, cursor + selection) + 1;
		selection = 0;
		if(cursor - offset > width - 2) offset++;
		if(stringWidth(text) <= width - 2) offset = 0;
		if(stringWidth(text) > width - 2) offset = cursor - width + 2;
	}

	draw();
}

export function render(screen){
	screen.cursorTo(0, screen.height - 2);
	screen.log(" New File" + " ".repeat(width - 9), chalk.bgRgb(40, 45, 55).bold);
	screen.write(" ".repeat(width), chalk.bgRgb(40, 45, 55));
	screen.cursorTo(1 + Math.min(cursor, cursor + selection) - offset);
	screen.write(" ".repeat(Math.min(width - 1, Math.max(1, stringWidth(getSelection())))), chalk.bgWhite.black);
	screen.cursorTo(0);
	screen.write(" ", chalk.bgRgb(40, 45, 55));
	screen.cursorTo(0);
	screen.write(toWidth(" " + text.substring(offset), width - 1));
}

function toWidth(string, w){
	var width = w || width;
	var line = string;
	var sw = stringWidth(line);

	while(sw > width){
		line = line.substring(0, line.length - 1);
		sw = stringWidth(line);
	}

	if(sw < width) line += " ".repeat(width - sw);

	return line;
}

function getSelection(){
	if(selection >= 0) return text.substring(cursor, cursor + selection + 1);
	return text.substring(cursor + selection, cursor + 1);
}