'use strict';

//////////////////////////////////////////////////////////////////////
// Text/board conversion. (not really UI-related, though)

// Receives an array of strings, where each string is one line.
// Returns a board.
function parse_text_input(lines) {
	var board = new Board();
	var terminator_count = {};
	for (var i = 0; i < lines.length; i++) {
		board.nodes[i] = [];
		for (var j = 0; j < lines[i].length; j++) {
			var c = lines[i][j];
			if (c == ' ' || c == '0') {
				board.nodes[i][j] = null;
			} else if (c >= '1' && c <= '4') {
				var num = parseInt(c, 10);
				board.nodes[i][j] = new Node(null, 2 * num);
			} else if ('szlw6'.indexOf(c) > -1) {
				board.nodes[i][j] = new Node(c, 2);
			} else if ('SZLW^'.indexOf(c) > -1) {
				board.nodes[i][j] = new Node(c.toLowerCase(), 1);
				board.terminators.push({'x': j, 'y': i});
				terminator_count[c] = (terminator_count[c] || 0) + 1;
			} else {
				board.errors.push('Invalid character: ' + c);
			}
		}
		if (j > board.width){
			board.width = j;
		}
	}
	board.height = i;

	if (board.width < 1 || board.height < 1) {
		board.errors.push('Empty board.');
	}

	if (terminator_count.length === 0) {
		board.errors.push('No terminator node was found.');
	}
	for (var i in terminator_count) {
		if (terminator_count[i] != 2) {
			board.errors.push('There are ' + terminator_count[i] + ' terminators of type ' + i + ', but only 2 are expected.');
		}
	}

	return board;
}

// Receives an already solved board.
// Returns a multi-line string with the solution in ASCII drawing.
function solution_to_text(board) {
	var sol = [];

	// Nodes.
	for (var i = 0; i < board.height; i++) {
		var line1 = [];
		var line2 = [];
		for (var j = 0; j < board.width; j++) {
			var name = ' ';
			var node = board.nodes[i][j];
			if (node) {
				if (node.max_edges === 1) {
					name = node.color.toUpperCase();
				} else {
					name = node.color || '*';
				}
			}
			line1.push(name, ' ');
			line2.push(' ', ' ');
		}
		sol.push(line1, line2);
	}

	// Edges.
	for (var i = 0; i < board.height; i++) {
		for (var j = 0; j < board.width; j++) {
			var node = board.nodes[i][j];
			if (node) {
				for (var k = 0; k < node.edges.length; k++) {
					var edge = node.edges[k];

					var x = j * 2 + edge.direction.dx;
					var y = i * 2 + edge.direction.dy;
					var c = edge.direction.char;
					sol[y][x] = c;
					// Edge color is ignored here.
				}
			}
		}
	}


	var ret = '';
	for (var i = 0; i < sol.length; i++) {
		ret += sol[i].join('') + '\n';
	}
	return ret;
}

//////////////////////////////////////////////////////////////////////
// DOM-related and UI-related manipulation.

function parse_board_from_input() {
	var puzzleinput = document.getElementById('puzzleinput');
	var lines = puzzleinput.value.split(/[\r\n]+/);
	var board = parse_text_input(lines);

	var messages = document.getElementById('messages');
	messages.textContent = board.errors.join('\n');
	messages.classList.remove('busy');

	return board;
}

function build_svg_from_board(board) {
	if (board.width < 1 || board.height < 1) {
		return;
	}

	var svgsolutioncontainer = document.getElementById('svgsolutioncontainer');

	var svg_code = '';

	var width = (board.width * 1.5 - 0.5);
	var height = (board.height * 1.5 - 0.5);
	svg_code += '<svg preserveAspectRatio="xMidYMin" viewBox="0 0 ' + width + ' ' + height + '">';

	var edge_colors = {
		's': '#fc1f20',
		'z': '#0086ff',
		'l': '#ffa515',
		'w': '#009e00',
		'6': '#ca197d'
	};

	var revealrange = document.getElementById('revealrange');
	if (board.edge_count === 0) {
		revealrange.disabled = true;
	} else {
		revealrange.disabled = false;

		// Updating the slider to the new edge count.
		var is_reveal_slider_at_max = (revealrange.value === revealrange.max);
		revealrange.max = board.edge_count;
		if (is_reveal_slider_at_max) {
			// If value was already at maximum before, the user likely wants
			// the value at maximum again.
			revealrange.value = revealrange.max;
		}

		// Edge indexes being shuffled in a random order.
		var random_numbers = [];
		for (var i = 0; i < board.edge_count; i++) {
			random_numbers[i] = i;
		}
		shuffle(random_numbers);

		// Building the edges.
		for (var i = 0; i < board.height; i++) {
			for (var j = 0; j < board.width; j++) {
				var node = board.nodes[i][j];
				if (node) {
					for (var k = 0; k < node.edges.length; k++) {
						var edge = node.edges[k];
						svg_code += '<polyline ' +
							'class="edge" '+
							'id="edge' + random_numbers.pop() + '" ' +
							'stroke="' + edge_colors[edge.color] + '" ' +
							'marker-mid="url(#mid_arrow)"' +
							'points="' +
							'' + ((j                        ) * 1.5 + 0.5) + ',' + ((i                        ) * 1.5 + 0.5) + ' ' +
							'' + ((j + edge.direction.dx / 2) * 1.5 + 0.5) + ',' + ((i + edge.direction.dy / 2) * 1.5 + 0.5) + ' ' +
							'' + ((j + edge.direction.dx    ) * 1.5 + 0.5) + ',' + ((i + edge.direction.dy    ) * 1.5 + 0.5) + '" />';
					}
				}
			}
		}
	}

	// Building the nodes.
	for (var i = 0; i < board.height; i++) {
		for (var j = 0; j < board.width; j++) {
			var node = board.nodes[i][j];
			if (node) {
				var name = '';
				if (node.max_edges === 1) {
					name = node.color.toUpperCase();
				} else if (node.color) {
					name = node.color;
				} else {
					name = Math.floor(node.max_edges / 2) + '';
				}

				svg_code += '<use xlink:href="#node_' + name + '" x="' + (j * 1.5) + '" y="' + (i * 1.5) + '" width="1" height="1" />';
			}
		}
	}

	svg_code += '</svg>';
	svgsolutioncontainer.innerHTML = svg_code;

	reveal_edges(revealrange.value);
}

function reveal_edges(how_many) {
	var all_edges = document.querySelectorAll('#svgsolutioncontainer > svg .edge');
	for (var i = 0; i < all_edges.length; i++) {
		all_edges[i].style.display = 'none';
	}
	for (var i = 0; i < how_many; i++) {
		var edge = document.getElementById('edge' + i);
		if (edge) {
			edge.style.display = 'block';
		}
	}
}

//////////////////////////////////////////////////////////////////////
// Web Worker handling.

function interrupt_worker() {
	if (g_worker) {
		g_worker.terminate();
		g_worker = null;

		var solvebutton = document.getElementById('solvebutton');
		solvebutton.value = 'Solve it!';

		var messages = document.getElementById('messages');
		messages.classList.remove('busy');
	}
}

function solution_found_handler(e) {
	var solve_finish_date = new Date();
	var solve_time = solve_finish_date.getTime() - g_solve_start_date.getTime();
	solve_time = solve_time / 1000;  // Converting to seconds.

	interrupt_worker();

	var messages = document.getElementById('messages');
	var board = e.data;

	if (board.solution_found === true) {
		messages.textContent = 'Solution found after ' + solve_time.toFixed(1) + 's!';
	} else if (board.solution_found === false) {
		messages.textContent = 'No solution found after ' + solve_time.toFixed(1)+ 's. :(';
	} else {
		console.error('board.solution_found: ' + board.solution_found);
		messages.textContent = 'This should not have happened.';
	}
	messages.classList.remove('busy');

	//console.log(solution_to_text(board));
	build_svg_from_board(board);
}

function start_background_solver(board) {
	g_solve_start_date = new Date();

	// Run the solving algorithm in a background thread.
	g_worker = new Worker('algorithm.js');
	g_worker.addEventListener('message', solution_found_handler);
	g_worker.postMessage(board);

	var solvebutton = document.getElementById('solvebutton');
	solvebutton.value = 'Abort!';
	messages.textContent = 'Searching for a solution…';
	messages.classList.add('busy');
}

//////////////////////////////////////////////////////////////////////
// UI event handling.

function puzzleinput_input_handler() {
	interrupt_worker();
	var board = parse_board_from_input();
	build_svg_from_board(board);

	if (board.errors.length === 0) {
		var autosolvecheckbox = document.getElementById('autosolvecheckbox');
		if (autosolvecheckbox.checked) {
			start_background_solver(board);
		}
	}
}

function solvebutton_click_handler() {
	var messages = document.getElementById('messages');

	if (g_worker) {
		interrupt_worker();
		messages.textContent = 'Interrupted by user.';
	} else {
		var board = parse_board_from_input();
		if (board.errors.length === 0) {
			start_background_solver(board);
		}
	}
}

function revealrange_input_handler() {
	var revealrange = document.getElementById('revealrange');
	reveal_edges(revealrange.value);
}

function showarrowscheckbox_click_handler() {
	var showarrowscheckbox = document.getElementById('showarrowscheckbox');
	var svgsolutioncontainer = document.getElementById('svgsolutioncontainer');

	// Damn IE… Does not support .toggle() second argument.
	//svgsolutioncontainer.classList.toggle('hidearrows', !showarrowscheckbox.checked);
	if (showarrowscheckbox.checked) {
		svgsolutioncontainer.classList.remove('hidearrows');
	} else {
		svgsolutioncontainer.classList.add('hidearrows');
	}
}

function autosolvecheckbox_click_handler(e) {
	var autosolvecheckbox = document.getElementById('autosolvecheckbox');
	if (autosolvecheckbox.checked) {
		if (!g_worker) {
			solvebutton_click_handler();
		}
	}
}

function init() {
	var puzzleinput = document.getElementById('puzzleinput');
	puzzleinput.addEventListener('input', puzzleinput_input_handler);

	var solvebutton = document.getElementById('solvebutton');
	solvebutton.addEventListener('click', solvebutton_click_handler);

	var revealrange = document.getElementById('revealrange');
	revealrange.addEventListener('input', revealrange_input_handler);

	// Workaround for IE 11.
	// https://msdn.microsoft.com/en-us/library/gg592978(v=vs.85).aspx
	// https://connect.microsoft.com/IE/Feedback/Details/856998
	// I'm not even writing workarounds for earlier IE versions, as they will
	// probably be utterly broken beyond all hope.
	if (navigator.userAgent.search(/Trident\/7/) > -1) {
		// The "onchange" event should only happen after the input element
		// loses focus. However, in IE it happens immediately, behaving like
		// "oninput".
		revealrange.addEventListener('change', revealrange_input_handler);
	}

	var showarrowscheckbox = document.getElementById('showarrowscheckbox');
	showarrowscheckbox.addEventListener('click', showarrowscheckbox_click_handler);

	// IE11 can't render the arrows.
	if (navigator.userAgent.search(/Trident\/7/) > -1) {
		showarrowscheckbox.checked = false;
		showarrowscheckbox.disabled = true;
		showarrowscheckbox.parentNode.title = 'Not working in Microsoft Internet Explorer. Please consider using a modern browser.';
		showarrowscheckbox.parentNode.style.textDecoration = 'line-through';
	}

	var autosolvecheckbox = document.getElementById('autosolvecheckbox');
	autosolvecheckbox.addEventListener('click', autosolvecheckbox_click_handler);

	puzzleinput_input_handler();
	showarrowscheckbox_click_handler();

	// Preload this file.
	var tmp_worker = new Worker('algorithm.js');
	tmp_worker.terminate();
}

// Global var pointing to the background thread.
var g_worker = null;
// Date object to measure the algorithm time.
var g_solve_start_date = null;

// This script should be included with "defer" attribute.
init();
