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
		self.socketio.emit('log', {'message': 'redraw_all files'})
		t = threading.Thread(target=self.redraw_all_files)

		t.start()


	def redraw_one(self, file):
		self.socketio.emit('log', {'message': 'redraw_one'})
		t = threading.Thread(target=self.redraw_one_file, args=(file,))

		t.start()

	def redraw_one_file(self, file):
		directory = os.path.abspath('result')
		path = os.path.abspath(os.path.join('unzip', file))

		self.socketio.emit('message', {'message': f'redraw {file}'})

		process = subprocess.Popen(f'python /content/lama-cleaner/inpaint_cli.py --image_path {path} --output_path {directory}'.split(), stdout=subprocess.PIPE)
		while True:
			output = process.stdout.readline().decode()
			if output == '' and process.poll() is not None:
				break
			self.socketio.emit('log', {'message': output})

		file = os.path.join('result', file)
		self.socketio.emit('inpainting_one_file', {'message': 'finished', 'file': file})

	def redraw_all_files(self):
		directory = os.path.abspath('result') 
		if os.path.exists(directory):
			delete_folder_contents(directory)
			os.rmdir(directory)
		os.makedirs(directory)

		path = os.path.abspath('unzip')
		self.socketio.emit('message', {'message': f'redraw {path}'})
		process = subprocess.Popen(f'python /content/lama-cleaner/inpaint_cli.py --image_directory {path} --output_path {directory}'.split(), stdout=subprocess.PIPE)
		while True:
			output = process.stdout.readline().decode()
			if output == '' and process.poll() is not None:
				break
			self.socketio.emit('log', {'message': output})
		shutil.make_archive("result", "zip", "result")
		self.socketio.emit('inpainting', {'message': 'finished'})

def delete_folder_contents(folder_path):
	for filename in os.listdir(folder_path):
		file_path = os.path.join(folder_path, filename)
		try:
			if os.path.isfile(file_path) or os.path.islink(file_path):
				os.unlink(file_path)
			elif os.path.isdir(file_path):
				shutil.rmtree(file_path)
		except Exception as e:
			print(f"Failed to delete {file_path}. Reason: {e}")