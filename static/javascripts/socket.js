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
			fetch('file?path=result.zip')
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

		this.socket.on('panel_cleaner', (data)=> {
			const files = data.files;
			this.canvas.start(files);
		});

		document.getElementById('form').addEventListener('submit', evt=> {
			evt.preventDefault();
			const fileInput = document.querySelector('input[type="file"]');
			const formData = new FormData();
			formData.append('file', fileInput.files[0]);
			fetch('/upload', {
				method: 'POST',
				body: formData
			})
		});

		document.getElementById('redraw_all').addEventListener('click', evt=> {
			if (this.canvas.files == null) return;
			this.socket.emit('redraw_all');
		});
	}
}

const socket = new Socket();