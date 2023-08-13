class Canvas {
	constructor() {
		this.canvas = new fabric.Canvas('canvas');
		this.files = null;
		this.mask_url = null;
		this.index = 0;
		this.canvas.isDrawingMode = true;
		this.canvas.freeDrawingCursor = 'none'
		this.canvas.freeDrawingBrush.width = 10;
		this.opacity = 0.5;

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

		document.getElementById('color').addEventListener('input', evt=> {
			this.set_color(evt.target.value);
		});

		hotkeys('ctrl+z', (event, handler) => {
			this.undo();
			event.preventDefault();
		});

		hotkeys('ctrl+m', (event, handler) => {
			Alert.alert('save mask');
			this.save_mask();
			event.preventDefault();
		});

		hotkeys('ctrl+left', (event, handler) => {
			this.back();
			event.preventDefault();
		});

		hotkeys('ctrl+right', (event, handler) => {
			this.next();
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
		document.getElementById('max_index').textContent = this.files.length;
		this.set_image();
	}

	set_image() {
		this.canvas.clear();
		const file = this.files[this.index];
		const file_mask = file.split('.').slice(0, -1).join('.') + '_mask.' + file.split('.').pop();
		this.mask_url = file_mask;

		fabric.Image.fromURL(file, (img)=> {
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

		fabric.Image.fromURL(file_mask + '?cache=' + Math.random(), (img)=> {
			img.set({
				left: 0,
				top: 0,
				selectable: false,
				opacity: this.opacity,
			});
			this.mask = img;
			this.canvas.add(img);
		});
	}

	set_opacity_mask(value) {
		this.opacity = value;
		this.canvas._objects.forEach(object=> {
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
		if (this.canvas._objects.length === 0) return;
		if (this.canvas._objects[this.canvas._objects.length - 1].type === 'path') {
			this.canvas._objects.pop();
			this.canvas.renderAll();
		}
	}

	save_mask() {
		if (this.mask_url === null) return;
		this.set_opacity_mask(1);
		this.canvas.getElement().toBlob(blob=> {
			var formData = new FormData();
			formData.append('file', blob, this.mask_url);

			fetch('/upload_file', {
				method: 'POST',
				body: formData
			})
			.then(() => {this.set_mask();})
			this.set_opacity_mask(0.5);
		});
	}

	set_mask() {
		this.canvas._objects = [this.canvas._objects[0]];

		fabric.Image.fromURL(this.mask_url + '?cache=' + Math.random(), (img)=> {
			img.set({
				left: 0,
				top: 0,
				selectable: false,
				opacity: this.opacity,
			});
			this.mask = img;
			this.canvas.add(img);
		});
	}

	set_view_index() {
		document.getElementById('current_index').textContent = this.index;
	}

	next() {
		if (this.files == null || this.index == this.files.length - 1) {
			return null;
		} else {
			this.index++;
			this.set_image();
		}
		this.set_view_index();
	}

	back() {
		if (this.files == null || this.index == 0) {
			return null;
		} else {
			this.index--;
			this.set_image(this.files[this.index]);
		}
		this.set_view_index();
	}
}