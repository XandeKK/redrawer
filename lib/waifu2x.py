from lib.panel_cleaner import PanelCleaner
import subprocess
import threading
import os
import glob
import shutil

class Waifu2x:
	def process_files(socketio):
		unzip = os.path.abspath('unzip')
		upscaled = os.path.abspath('upscaled')
		socketio.emit('log', {'message': f'waifux2 {path}'}) 
		process = subprocess.Popen(f'python -m waifu2x.cli -i {unzip} --output {upscaled}'.split(), stdout=subprocess.PIPE, cwd="/content/nunif")
		while True:
			output = process.stdout.readline().decode()
			if output == '' and process.poll() is not None:
				break
			socketio.emit('log', {'message': output})

		for filename in os.listdir(unzip):
			file_path = os.path.join(unzip, filename)
			try:
				if os.path.isfile(file_path) or os.path.islink(file_path):
					os.unlink(file_path)
				elif os.path.isdir(file_path):
					shutil.rmtree(file_path)
			except Exception as e:
				print(f"Failed to delete {file_path}. Reason: {e}")

		for filename in os.listdir(upscaled):
			shutil.move(os.path.join(upscaled, filename), unzip)

		t = threading.Thread(target=PanelCleaner.process_files, args=(socketio,))

		t.start()
