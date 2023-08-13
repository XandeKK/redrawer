import subprocess
import threading
import os
from lib.panel_cleaner import PanelCleaner
import glob

class Waifu2x:
	def process_dir(socketio):
		path = os.path.abspath('static/public') 

		for folder in os.listdir(path):
			current_path = os.path.join(path, folder)
			socketio.emit('message', {'message': f'waifux2 {current_path}'})
			process = subprocess.Popen(f'python -m waifu2x.cli -i {current_path} --output_path {os.path.join(current_path, "cleaned")}'.split(), stdout=subprocess.PIPE, cwd="/content/nunif")
			while True:
				output = process.stdout.readline().decode()
				if output == '' and process.poll() is not None:
					break
				socketio.emit('log', {'message': output})

			for file in glob.glob(os.path.join(current_path, 'cleaned', '*.png')):
				os.replace(file, os.path.join(current_path, file.split('/')[-1]))

		t = threading.Thread(target=PanelCleaner.process_dir, args=(socketio,))
		t.start()

	def process_files(socketio):
		path = os.path.abspath('static/public')
		socketio.emit('message', {'message': f'waifux2 {path}'}) 

		process = subprocess.Popen(f'python -m waifu2x.cli -i {path} --output_path {os.path.join(path, "cleaned")}'.split(), stdout=subprocess.PIPE, cwd="/content/nunif")
		while True:
			output = process.stdout.readline().decode()
			if output == '' and process.poll() is not None:
				break
			socketio.emit('log', {'message': output})

		for file in glob.glob(os.path.join(path, 'cleaned', '*.png')):
			os.replace(file, os.path.join(path, file.split('/')[-1]))

		t = threading.Thread(target=PanelCleaner.process_files, args=(socketio,))

		t.start()