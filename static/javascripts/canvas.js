class Canvas {
	constructor() {
		this.canvas = new fabric.Canvas('canvas');
		this.files = null;
		this.index = 0;
		this.canvas.isDrawingMode = true;
		this.canvas.freeDrawingCursor = 'none'
		this.canvas.freeDrawingBrush.width = 10;
		this.opacity = 0.5;
		this.cache_image = Math.random();
		this.can_move = true;

		this.add_event();
		this.create_cursor();
	}

	add_event() {
		document.getElementById('opacity').addEventListener('input', evt=> {
			this.set_opacity_mask(evt.target.value);
		});

		document.getElementById('undo').addEventListener('click', evt=> {
			this.undo();
		});

		document.getElementById('save_mask').addEventListener('click', evt=> {
			this.save_mask();
		});

		document.getElementById('pincel').addEventListener('change', evt=> {
			this.set_brush_width(evt.target.value);
		});

		document.getElementById('back').addEventListener('click', evt=> {
			this.back();
		});

		document.getElementById('next').addEventListener('click', evt=> {
			this.next();
		});

		document.getElementById('black').addEventListener('input', evt=> {
			this.set_color('#000000');
		});

		document.getElementById('white').addEventListener('input', evt=> {
			this.set_color('#ffffff');
		});

		hotkeys('ctrl+z', (event, handler) => {
			this.undo();
			event.preventDefault();
		});
	}

	create_cursor() {
		this.cursor = new fabric.StaticCanvas("cursor");
		this.cursorOpacity = .5;
		this.mousecursor = new fabric.Circle({ 
			left: -100, 
			top: -100, 
			radius: this.canvas.freeDrawingBrush.width / 2, 
			fill: "rgba(255,0,0," + this.cursorOpacity + ")",
			stroke: "black",
			originX: 'center', 
			originY: 'center'
		});
		this.cursor.add(this.mousecursor);

		this.canvas.on('mouse:move', (evt) => {
			const mouse = this.canvas.getPointer(evt.e);
			this.mousecursor
			.set({
				top: mouse.y,
				left: mouse.x
			})
			.setCoords()
			.canvas.renderAll();
		});

		this.canvas.on('mouse:out', () => {
			this.mousecursor
			.set({
				top: this.mousecursor.top,
				left: this.mousecursor.left
			})
			.setCoords()
			.canvas.renderAll();
		});
	}

	start(files) {
		document.getElementById('form').remove();
		this.files = files.flat();
		document.getElementById('max_index').textContent = this.files.length - 1;
		this.set_image();
	}

	set_image() {
		this.can_move = false;
		this.canvas.clear();
		const file = this.files[this.index];
		const file_mask = file.replace('.png', '_mask.png');
		this.file_mask = file_mask;

		fabric.Image.fromURL('file' + '?path=' + 'unzip/' + file + '&cache=' + this.cache_image, (img)=> {
			this.cursor.setDimensions({
				width: img.width,
				height: img.height
			});
			this.canvas.setDimensions({
				width: img.width,
				height: img.height
			});
			this.canvas.setBackgroundImage(img);
			this.canvas.renderAll();
		});

		fabric.Image.fromURL('file' + '?path=' + 'panelcleaner/' + file_mask + '&cache=' + Math.random(), (img)=> {
			img.set({
				left: 0,
				top: 0,
				selectable: false,
				opacity: this.opacity,
			});
			this.mask = img;
			this.canvas.add(img);
			this.can_move = true;
		});
	}

	set_opacity_mask(value) {
		this.opacity = value;
		this.canvas.getObjects().forEach(object=> {
			object.set({
				opacity: value,
			});
		});
		this.canvas.renderAll();
	}

	set_brush_width(value) {
		const size = parseInt(value, 10);
		this.canvas.freeDrawingBrush.width = size;
		this.mousecursor
		.set({
			left: this.mousecursor.left,
			top: this.mousecursor.top,
			radius: size/2
		})
		.setCoords()
		.canvas.renderAll();
	}

	set_color(value) {
		this.canvas.freeDrawingBrush.color = value;
	}

	undo() {
		if (this.canvas.getObjects().length === 0) return;
		const objects = this.canvas.getObjects();
		if (objects[objects.length - 1].type === 'path') {
			this.canvas.remove(objects[objects.length - 1]);
			this.canvas.renderAll();
		}
	}

	save_mask() {
		if (this.mask.src === null) return;
		this.set_opacity_mask(1);
		this.canvas.getElement().toBlob(blob=> {
			var formData = new FormData();
			formData.append('file', blob, this.file_mask);

			this.can_move = false;
			fetch('/upload_mask', {
				method: 'POST',
				body: formData
			})
			.then(() => {this.set_mask();})
			this.set_opacity_mask(0.5);
		});
	}

	set_mask() {
		fabric.Image.fromURL('file' + '?path=' + 'panelcleaner/' + this.file_mask + '&cache=' + Math.random(), (img)=> {
			this.canvas.getObjects().forEach((obj)=> {
				this.canvas.remove(obj);
			});
			img.set({
				left: 0,
				top: 0,
				selectable: false,
				opacity: this.opacity,
			});
			this.mask = img;
			this.canvas.add(img);
			this.can_move = true;
			Alert.alert('Mask saved');
		});
	}

	set_view_index() {
		document.getElementById('current_index').textContent = this.index;
	}

	scroll_to_top() {
		setTimeout(()=> {
			window.scrollTo({
		        top: 0,
		        left: 0,
		        behavior: 'smooth',
		    })
		}, 500)
	}

	next() {
		if (!this.can_move) return;
		if (this.files == null || this.index == this.files.length - 1) {
			return null;
		} else {
			this.index++;
			this.set_image();
		}
		this.set_view_index();
		this.scroll_to_top();
	}

	back() {
		if (!this.can_move) return;
		if (this.files == null || this.index == 0) {
			return null;
		} else {
			this.index--;
			this.set_image(this.files[this.index]);
		}
		this.set_view_index();
		this.scroll_to_top();
	}
}