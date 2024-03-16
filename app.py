from flask import Flask, render_template, request, url_for, send_from_directory, send_file
from flask_socketio import SocketIO, emit
from lib.panel_cleaner import PanelCleaner
from lib.inpainting import Inpainting
import os
import re
import cv2
import glob
import shutil
import zipfile
import threading

app = Flask(__name__)
socketio = SocketIO(app)

@app.route('/')
def index():
	return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload():
	file = request.files['file']
	filename = file.filename
	path_file = os.path.join('upload', filename)
	if not os.path.exists('upload'):
		os.makedirs('upload')
	else:
		delete_folder_contents('upload')

	file.save(path_file)
	socketio.emit('message', {'message': 'uploaded'})

	with zipfile.ZipFile(path_file, 'r') as zip_ref:
		if not os.path.exists('unzip'):
			os.makedirs('unzip')
		else:
			delete_folder_contents('unzip')

		zip_ref.extractall('unzip')
		socketio.emit('message', {'message': 'unzipped'})

	t = threading.Thread(target=PanelCleaner.process_files, args=(socketio,))

	t.start()

	return 'File saved!', 200

@app.route('/file')
def get_file():
	file_path = request.args.get('path')

	if file_path is not None:
		if os.path.exists(file_path):
			return send_file(file_path)
		else:
			return "File not found", 404
	else:
		return "Path is None", 400

@app.route('/upload_mask', methods=['POST'])
def upload_mask():
	file = request.files['file']
	filename = os.path.join('panelcleaner', file.filename)
	file.save(filename)

	return "okay", 200

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

inpaiting = Inpainting(socketio)

if __name__ == '__main__':
	socketio.run(app)


