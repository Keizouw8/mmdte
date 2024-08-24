import fs from "fs";

export var directory = import.meta.dirname;
export var setDirectory = (newdir) => directory = newdir;

export var clipboard = "";
export var setClipboard = (newtext) => clipboard = newtext;

export var file = false;
export var buffer = false;

export function setFile(path){
	return new Promise(function(resolve, reject){
		fs.readFile(path, { encoding: "utf8" }, function(err, data){
			if(err) return reject();
			buffer = data;
			file = path;
			resolve();
		});
	});
}

export function modifyBuffer(range, substitute){
	buffer = buffer.substring(0, range[0]) + substitute + buffer.substring(range[1]);
}