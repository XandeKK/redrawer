import cv2
import os
import numpy as np
from lib.panel_cleaner import Image

class Test:
	def process_dir(socketio):
		path = 'static/public'

		for folder in os.listdir(path):
			current_path = os.path.abspath(os.path.join(path, folder))
			for filename in os.listdir(current_path):
				file = os.path.abspath(os.path.join(current_path, filename))
				image = cv2.imread(file)
				height, width = image.shape[:2]
				black_image = np.zeros((height, width), dtype=np.uint8)
				cv2.imwrite(file.replace('.png', '_mask.png'), black_image)

		socketio.emit('panel_cleaner', {'finished': True, 'files': Image.get_files('folders')})

	def process_files(socketio):
		path = os.path.abspath('static/public')

		for filename in os.listdir(path):
			file = os.path.abspath(os.path.join(path, filename))
			print(file)
			image = cv2.imread(file)
			height, width = image.shape[:2]
			black_image = np.zeros((height, width), dtype=np.uint8)
			cv2.imwrite(file.replace('.png', '_mask.png'), black_image)

		socketio.emit('panel_cleaner', {'finished': True, 'files': Image.get_files('files')})