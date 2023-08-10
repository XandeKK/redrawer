import subprocess
import threading
import os
import shutil

class Inpainting:
	def __init__(self, socketio):
		self.socketio = socketio
		self.socketio.on_event('redraw_all', lambda: self.redraw_all())
		self.socketio.on_event('redraw_one', lambda file: self.redraw_one(file))

	def redraw_all(self):
		if only_dir():
			self.socketio.emit('log', {'message': 'redraw_all dir'})
			t = threading.Thread(target=self.redraw_all_dir)
		else:
			self.socketio.emit('log', {'message': 'redraw_all files'})
			t = threading.Thread(target=self.redraw_all_files)

		t.start()


	def redraw_one(self, file, output):
		self.socketio.emit('log', {'message': 'redraw_one'})
		t = threading.Thread(target=self.redraw_one_file, args=(file,))

		t.start()

	def redraw_one_file(self, file):
		directory = os.path.abspath('static/one_file')
		path = os.path.abspath(file)

		self.socketio.emit('message', {'message': f'redraw {file}'})

		process = subprocess.Popen(f'python /content/lama-cleaner/inpaint_cli.py --image_path {path} --output_path {directory}'.split(), stdout=subprocess.PIPE)
		while True:
			output = process.stdout.readline().decode()
			if output == '' and process.poll() is not None:
				break
			self.socketio.emit('log', {'message': output})

		abspath = os.path.abspath('')
		file = os.path.join('static/one_file', os.path.basename(file))
		self.socketio.emit('inpainting_one_file', {'message': 'finished', 'file': file})

	def redraw_all_dir(self):
		directory = os.path.abspath('static/public/result') 
		if os.path.exists(directory):
			delete_folder_contents('static/public/result')
			os.rmdir('static/public/result')
		os.makedirs(directory)

		path = os.path.abspath('static/public') 

		for folder in os.listdir(path):
			current_path = os.path.join(path, folder)
			output_path = os.path.join(directory, folder)
			self.socketio.emit('message', {'message': f'redraw {current_path}'})
			process = subprocess.Popen(f'python /content/lama-cleaner/inpaint_cli.py --image_directory {current_path} --output_path {output_path}'.split(), stdout=subprocess.PIPE)
			while True:
				output = process.stdout.readline().decode()
				if output == '' and process.poll() is not None:
					break
				self.socketio.emit('log', {'message': output})
		shutil.make_archive("static/public/result", "zip", "static/public/result")
		self.socketio.emit('inpainting', {'message': 'finished'})

	def redraw_all_files(self):
		directory = os.path.abspath('static/public/result') 
		if os.path.exists(directory):
			delete_folder_contents('static/public/result')
			os.rmdir('static/public/result')
		os.makedirs(directory)

		path = os.path.abspath('static/public') 
		self.socketio.emit('message', {'message': f'redraw {path}'})
		process = subprocess.Popen(f'python /content/lama-cleaner/inpaint_cli.py --image_directory {path} --output_path {directory}'.split(), stdout=subprocess.PIPE)
		while True:
			output = process.stdout.readline().decode()
			if output == '' and process.poll() is not None:
				break
			self.socketio.emit('log', {'message': output})
		shutil.make_archive("static/public/result", "zip", "static/public/result")
		self.socketio.emit('inpainting', {'message': 'finished'})

def only_dir():
	path = 'static/public'
	files = os.listdir(path)
	if len(files) == 0:
		return False
	return os.path.isdir(os.path.join(path, files[0]))