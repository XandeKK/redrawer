class Canvas {
	constructor() {
		this.canvas = new fabric.Canvas('canvas');
		this.files = null;
		this.mask_url = null;
		this.index = 0;
		this.canvas.isDrawingMode = true;
		this.canvas.freeDrawingBrush.width = 10;
		this.opacity = 0.5;

		this.add_event();
	}

	add_event() {
		document.getElementById('opacity').addEventListener('input', evt=> {
			this.set_opacity_mask(evt.target.value);
		});

		document.getElementById('undo').addEventListener('click', evt=> {
			this.undo();
		});

		document.getElementById('save').addEventListener('click', evt=> {
			this.save();
		});

		document.getElementById('pincel').addEventListener('input', evt=> {
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
	}

	start(files) {
		document.getElementById('form').remove();
		this.files = files.flat();
		this.set_image();
	}

	set_image() {
		this.canvas.clear();
		const file = this.files[this.index];
		const file_mask = file.split('.').slice(0, -1).join('.') + '_mask.' + file.split('.').pop();
		this.mask_url = file_mask;

		fabric.Image.fromURL(file, (img)=> {
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
		this.canvas.freeDrawingBrush.width = parseInt(value);
	}

	set_color(value) {
	    this.canvas.freeDrawingBrush.color = value;
	}

	undo() {
		if (this.canvas._objects.length > 1) {
			this.canvas._objects.pop();
			this.canvas.renderAll();
		}
	}

	save() {
		if (this.mask_url === null) return;
		this.set_opacity_mask(1);
		this.canvas.getElement().toBlob(blob=> {
			var formData = new FormData();
			formData.append('file', blob, this.mask_url);

			fetch('/upload_file', {
				method: 'POST',
				body: formData
			});
			this.set_opacity_mask(0.5);
		});
	}

	next() {
		if (this.files == null || this.index == this.files.length - 1) {
			return null;
		} else {
			this.index++;
			this.set_image();
		}
	}

	back() {
		if (this.files == null || this.index == 0) {
			return null;
		} else {
			this.index--;
			this.set_image(this.files[this.index]);
		}
	}
}