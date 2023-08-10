class Socket {
	constructor() {
		this.socket = io();
		this.canvas = new Canvas();

		this.add_event();
	}

	add_event() {
		this.socket.on('connect', function() {
			Alert.alert('Connected');
		});

		this.socket.on('message', (data)=> {
			Alert.alert(data.message);
		});

		this.socket.on('log', (data)=> {
			window.log.add(data.message);
		});

		this.socket.on('inpainting', (data)=> {
			fetch('static/public/result.zip')
			  .then(response => response.blob())
			  .then(blob => {
			    const url = URL.createObjectURL(blob);
			    const link = document.createElement('a');
			    link.href = url;
			    link.download = 'result.zip';
			    document.body.appendChild(link);
			    link.click();
			    document.body.removeChild(link);
			  });
		});

		this.socket.on('inpainting_one_file', (data)=> {
			fetch(data.file)
			  .then(response => response.blob())
			  .then(blob => {
			    const url = URL.createObjectURL(blob);
			    const link = document.createElement('a');
			    link.href = url;
			    link.download = data.file.replace(/^.*\//, '');
			    document.body.appendChild(link);
			    link.click();
			    document.body.removeChild(link);
			  });
		});

		this.socket.on('panel_cleaner', (data)=> {
			const files = data.files;
			this.canvas.start(files);
		});

		document.getElementById('form').addEventListener('submit', evt=> {
			evt.preventDefault();
			const fileInput = document.querySelector('input[type="file"]');
			const formData = new FormData();
			formData.append('file', fileInput.files[0]);
			formData.append('waifu2x', document.getElementById('waifu2x').checked);
			fetch('/upload', {
				method: 'POST',
				body: formData
			})
		});

		document.getElementById('redraw_all').addEventListener('click', evt=> {
			if (this.canvas.files == null) return;
			this.socket.emit('redraw_all');
		});

		document.getElementById('redraw_one').addEventListener('click', evt=> {
			if (this.canvas.mask_url == null) return;
			const image = this.canvas.mask_url.replace('_mask', '');
			const mask_url_splited = this.canvas.mask_url.split('/');
			this.socket.emit('redraw_one', image);
		});

		hotkeys('ctrl+alt+s', (event, handler) => {
			if (this.canvas.files == null) return;
			Alert.alert('redraw all');
			this.socket.emit('redraw_all');
			event.preventDefault();
		});

		hotkeys('ctrl+s', (event, handler) => {
			if (this.canvas.mask_url == null) return;
			Alert.alert('redraw one');
			const image = this.canvas.mask_url.replace('_mask', '');
			const mask_url_splited = this.canvas.mask_url.split('/');
			const output = this.canvas.mask_url.replace(mask_url_splited[mask_url_splited.length - 1], '');
			this.socket.emit('redraw_one', image, output);
			event.preventDefault();
		});
	}
}

const socket = new Socket();