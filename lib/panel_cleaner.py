import subprocess
import threading
import os
import cv2
import numpy as np
import glob
import re

class PanelCleaner:
	def process_dir(socketio):
		path = 'static/public'

		for folder in os.listdir(path):
			current_path = os.path.abspath(os.path.join(path, folder))
			socketio.emit('message', {'message': f'panelcleaner {current_path}'})
			process = subprocess.Popen(f'pcleaner clean {current_path} -m --output_dir={current_path}'.split(), stdout=subprocess.PIPE)
			while True:
				output = process.stdout.readline().decode()
				if output == '' and process.poll() is not None:
					break
				if output != '':
					socketio.emit('log', {'message': output})

		Image.transform_images_recursively('static/public')                
		socketio.emit('panel_cleaner', {'finished': True, 'files': Image.get_files('folders')})

	def process_files(socketio):
		path = os.path.abspath('static/public')
		socketio.emit('message', {'message': f'panelcleaner {path}'})
		process = subprocess.Popen(f'pcleaner clean {path} -m --output_dir={path}'.split(), stdout=subprocess.PIPE)
		while True:
			output = process.stdout.readline().decode()
			if output == '' and process.poll() is not None:
				break
			if output != '':
				socketio.emit('log', {'message': output})

		Image.transform_images_recursively('static/public')
		socketio.emit('panel_cleaner', {'finished': True, 'files': Image.get_files('files')})

class Image:
	def transform_image(path):
		im = cv2.imread(path, -1)
		im[np.where(im[:, :, 3] == 0)] = (0, 0, 0, 255)
		cv2.imwrite(path, im)

	def transform_images_recursively(path):
		for filename in os.listdir(path):
			full_path = os.path.join(path, filename)

			if os.path.isfile(full_path) and filename.lower().endswith("_mask.png"):
				Image.transform_image(full_path)
			elif os.path.isdir(full_path):
				Image.transform_images_recursively(full_path)

	def get_files(type):
		files = glob.glob('static/public/**/*.png', recursive=True)
		files_tmp = []
		for filename in files:
			basename = os.path.basename(filename)
			if re.match(r'^\d+\.png$', basename):
				files_tmp.append(filename)
		if type == 'folders':
			folders = set();
			for file in files:
				folders.add(file.split('/')[2])

			files_sorted = []
			for folder in folders:
				f = list(filter(lambda file: file.find(f'/{folder}/') != -1, files))
				files_sorted.append(sorted(files_tmp, key=lambda x: (int(os.path.basename(x).split('.')[0]))))
			return files_sorted
		
		return sorted(files_tmp, key=lambda x: (int(os.path.basename(x).split('.')[0])))