class Socket {
	constructor() {
		this.socket = io();
		this.canvas = new Canvas();

		this.add_event();
	}

	add_event() {
		this.socket.on('connect', function() {
			console.log("connected");
		});

		this.socket.on('message', (data)=> {
			console.log(data);
		});

		this.socket.on('log', (data)=> {
			console.log(data);
		});

		this.socket.on('ai', (data)=> {
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

		document.getElementById('send').addEventListener('click', evt=> {
			this.socket.emit('redraw');
		});
	}
}

const socket = new Socket();