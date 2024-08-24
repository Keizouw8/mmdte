import chalk from "chalk";
import path from "path";
import fs from "fs";
import stringWidth from "string-width";
import { directory, setFile, clipboard, setClipboard } from "../state.js";
import { setFocus } from "./elements.js";
import draw from "../draw.js";

var width = 30;
var files = {
	name: path.basename(directory),
	path: path.dirname(directory),
	isDir: true,
	focused: false,
	parent: false
};
files.children = populateFolder(files);

var focusedFile = false;

export var active = false;
export var setActive = function(status, focus){
	active = status;
}

fs.watch(directory, { recursive: true }, function(event, file){
	files.children = populateFolder(files);
	draw();
});

export function handleInput(char, key){
	if(key.name == "down"){
		if(focusedFile){
			focusedFile.focused = false;

			if(focusedFile.children?.length){
				focusedFile = focusedFile.children[0];
			}else{
				focusedFile = nextChild(focusedFile);
			}
		}else{
			focusedFile = files;
		}

		focusedFile.focused = true;
	}

	if(key.name == "up"){
		if(focusedFile){
			focusedFile.focused = false;

			if(focusedFile.parent){
				for(var i = 0; i < focusedFile.parent.children.length; i++){
					if(focusedFile.parent.children[i] == focusedFile){
						if(i == 0){
							focusedFile = focusedFile.parent;
							break;
						}else{
							focusedFile = lastChild(focusedFile.parent.children[i - 1]);
							break;
						}
					}
				}
			}
		}else{
			focusedFile = lastChild(files);
		}

		focusedFile.focused = true;
	}

	if(key.name == "escape" && focusedFile){
		focusedFile.focused = false;
		focusedFile = false;
	}

	if(key.name == "space" && focusedFile){
		if(focusedFile.isDir){
			focusedFile.children = focusedFile.children ? false : populateFolder(focusedFile)
		}else{
			setFile(path.join(focusedFile.path, focusedFile.name));
		}
	}

	if(key.ctrl && key.name == "n"){
		setFocus("newfile");
	}

	draw();
}

export function render(screen){
	screen.cursorTo(0, 0);
	screen.write(" Files    ", chalk.bgRgb(48, 52, 61).bold);
	screen.log(" Chapters           ", chalk.bgRgb(36, 39, 44).bold);

	screen.log(toWidth(` ${ files.children ? "📂" : "📁" } ${files.name}`), chalk.bgRgb(...(files.focused ? [60, 65, 76] : [48, 52, 61])));
	if(files.children) renderFolder(screen, files, 0);
	while(screen.cursor[1] < screen.height) screen.log(" ".repeat(width), chalk.bgRgb(48, 52, 61));
}

function renderFolder(screen, folder, tab){
	var pretab = "   ";
	for(var i = 0; i < tab; i++) pretab += "  ";
	for(var child of folder.children){
		if(child.isDir){
			screen.log(toWidth(`${pretab}${ child.children ? "📂" : "📁" } ${child.name}`), chalk.bgRgb(...(child.focused ? [60, 65, 76] : [48, 52, 61])));
			if(child.children) renderFolder(screen, child, tab + 1);
			continue;
		}
		screen.log(toWidth(`${pretab}📝 ${child.name}`), chalk.bgRgb(...(child.focused ? [60, 65, 76] : [48, 52, 61])));
	}
}

function toWidth(string){
	var line = string;
	var sw = stringWidth(line);

	while(sw > width - 1){
		line = line.substring(0, line.length - 1);
		sw = stringWidth(line);
		if(sw == width - 1){
			line += "…";
			break;
		}
	}

	if(sw < width) line += " ".repeat(width - sw);

	return line;
}

function populateFolder(dir){
	var focusedInside = dir.children ? Boolean(dir.children.filter((file) => focusedFile?.name == file.name && focusedFile?.path == file.path).length) : false
	var putFocused = false;

	var folder = fs.readdirSync(path.join(dir.path, dir.name), {withFileTypes: true})
		.filter((file) => file.isDirectory() || path.extname(file.name) == ".md")
		.map(function(file){
			var item = {
				name: file.name,
				path: file.path,
				isDir: file.isDirectory(),
				focused: focusedFile?.name == file.name && focusedFile?.path == file.path,
				parent: dir,
			};

			if(focusedFile?.name == file.name && focusedFile?.path == file.path) putFocused = true;

			if(item.isDir){
				item.children = false;
				if(dir.children){
					var samename = dir.children.filter((e) => e.children && e.name == item.name)[0];
					if(samename){
						item.children = samename.children;
						item.children = populateFolder(item);
					}
				}
			}

			if(focusedFile?.name == file.name && focusedFile?.path == file.path) focusedFile = item;

			return item;
		});

	if(focusedInside && !putFocused) focusedFile = false;

	return folder;
}

function nextChild(item){
	if(!item.parent) return focusedFile;
	for(var i = 0; i < item.parent.children.length; i++){
		if(item.parent.children[i] == item){
			if(i < item.parent.children.length - 1) return item.parent.children[i + 1];
			return nextChild(item.parent);
		}
	}
}

function lastChild(item){
	if(!item.children?.length) return item;
	return lastChild(item.children[item.children.length - 1]);
}