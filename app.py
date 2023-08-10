from flask import Flask, render_template, request, url_for
from flask_socketio import SocketIO, emit
from flask_ngrok import run_with_ngrok
from lib.waifu2x import Waifu2x
from lib.panel_cleaner import PanelCleaner
from lib.inpainting import Inpainting
import os
import re
import shutil
import zipfile
import threading

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload():
    delete_folder_contents('static/public')
    file = request.files['file']
    filename = file.filename
    path_file = os.path.join('static', 'public', filename)
    file.save(path_file)
    socketio.emit('message', {'message': 'uploaded'})

    with zipfile.ZipFile(path_file, 'r') as zip_ref:
        zip_ref.extractall(os.path.join('static', 'public'))
        os.remove(path_file)
        socketio.emit('message', {'message': 'unzipped'})

    if request.form.get('waifu2x', False) == 'true':
        if only_dir():
            t = threading.Thread(target=Waifu2x.process_dir, args=(socketio,))
        else:
            t = threading.Thread(target=Waifu2x.process_files, args=(socketio,))
    else:
        if only_dir():
            t = threading.Thread(target=PanelCleaner.process_dir, args=(socketio,))
        else:
            t = threading.Thread(target=PanelCleaner.process_files, args=(socketio,))

    t.start()

    return 'File saved!', 200

@app.route('/upload_file', methods=['POST'])
def upload_file():
    file = request.files['file']
    filename = file.filename
    file.save(filename)
    socketio.emit('message', {'message': 'saved'})

    return 'File saved!', 200

def only_dir():
    path = 'static/public'
    files = os.listdir(path)
    if len(files) == 0:
        return False
    return os.path.isdir(os.path.join(path, files[0]))

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
