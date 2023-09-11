import subprocess
import os
import cv2
import numpy as np
import glob
import re

class PanelCleaner:
	def process_files(socketio):
		input_path = os.path.abspath('unzip')

		output_path = os.path.abspath('panelcleaner')
		socketio.emit('message', {'message': f'panelcleaner {input_path}'})
		process = subprocess.Popen(f'pcleaner clean {input_path} -m --output_dir={output_path}'.split(), stdout=subprocess.PIPE)
		while True:
			output = process.stdout.readline().decode()
			if output == '' and process.poll() is not None:
				break
			if output != '':
				socketio.emit('log', {'message': output})

		Image.transform_images_recursively('panelcleaner')
		socketio.emit('panel_cleaner', {'finished': True, 'files': Image.get_files()})

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

	def get_files():
		files = glob.glob('unzip/*.png')
		files_tmp = []

		for filename in files:
			files_tmp.append(os.path.basename(filename))

		def custom_sort_key(x):
			parts = x.split('.')
			numeric_part = parts[0]
			try:
				numeric_value = float(numeric_part)
			except ValueError:
				numeric_value = numeric_part
			return (numeric_value, x)

		files_tmp = sorted(files_tmp, key=custom_sort_key)

		return files_tmp