import chalk from "chalk";
import { order, elements } from "./elements/elements.js"

class Screen{
	constructor(modifier){
		if(!modifier) modifier = (s) => s;

		var size = process.stdout.getWindowSize();
		this.width = size[0];
		this.height = size[1];
		this.data = new Array(size[1]).fill(" ".repeat(size[0]));
		this.cursor = [0, 0];
		this.modifiers = new Array(size[1]).fill(0).map(() => [[0, size[0], modifier]]);
	}
	write(str, modifier){
		var pieces = str.split("\n");
		if(pieces.length > 1){
			for(var i = 0, piece = pieces[i]; i < pieces.length; i++, piece = pieces[i]){
				this.write(piece, modifier);
				if(i != pieces.length - 1){
					this.cursorTo(0, this.cursor[1] + 1);
				}
			}
			return;
		}

		if(this.data[this.cursor[1]]){
			var range = [this.cursor[0], this.cursor[0] + str.length];
			if(modifier){
				var lower = 0;
				for(; lower < this.modifiers[this.cursor[1]].length && this.modifiers[this.cursor[1]][lower][1] < range[0]; lower++);
				var higher = this.modifiers[this.cursor[1]].length - 1;
				for(; higher > 0 && this.modifiers[this.cursor[1]][higher][0] > range[1]; higher--);

				if(lower == higher){
					this.modifiers[this.cursor[1]].splice(lower + 1, 0, Array.from(this.modifiers[this.cursor[1]][lower]));
					higher++;
				}

				if(higher - lower > 1){
					this.modifiers[this.cursor[1]].splice(lower + 1, higher - 1)
					higher = lower + 1;
				}

				this.modifiers[this.cursor[1]][lower][1] = range[0];
				this.modifiers[this.cursor[1]][higher][0] = range[1];
				this.modifiers[this.cursor[1]].splice(lower + 1, 0, [...range, modifier]);
			}
			this.data[this.cursor[1]] = this.data[this.cursor[1]].substring(0, range[0]) + str + this.data[this.cursor[1]].substring(range[1]);
		}

		this.moveCursor(str.length);
	}
	log(str, modifier){
		this.write(str + "\n", modifier);
	}
	cursorTo(x, y){
		if(x == undefined) x = this.cursor[0];
		if(y == undefined) y = this.cursor[1];
		this.cursor = [x, y];
	}
	moveCursor(dx, dy){
		if(!dx) dx = 0;
		if(!dy) dy = 0;

		this.cursor[0] += dx;
		this.cursor[1] += dy;
	}
	toString(){
		var width = process.stdout.getWindowSize()[0];
		var that = this;
		return this.data.map(function(s, i){
			s = s.substring(0, width);
			return that.modifiers[i].map(([start, end, modifier]) => modifier(s.substring(start, end))).join("");
		}).join("\n");
	}
}

export default function draw(){
	process.stdout.write("\u001B[?25l");

	var screen = new Screen(chalk.bgRgb(36, 39, 44));
	for(var element of order) if(elements[element].active) elements[element].render(screen);

	process.stdout.cursorTo(0, 0);
	process.stdout.write(screen.toString());
}