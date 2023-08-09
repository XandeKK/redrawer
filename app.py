from flask import Flask, render_template, request, url_for
from flask_socketio import SocketIO, emit
import os
import re
import shutil
import base64
import zipfile
import subprocess
import threading
import glob

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app)

@app.get('/')
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

    if only_dir():
        t = threading.Thread(target=panel_cleaner_dir)
    else:
        t = threading.Thread(target=panel_cleaner_files)
    
    t.start()

    return 'File saved!', 200

@app.route('/upload_file', methods=['POST'])
def upload_file():
    file = request.files['file']
    filename = file.filename
    file.save(filename)
    socketio.emit('message', {'message': 'saved'})

    return 'File saved!', 200

@socketio.on('redraw')
def redraw():
    t = threading.Thread(target=activate_redraw)
    t.start()

def activate_redraw():
    os.makedirs('static/public/result')
    process = subprocess.Popen(f'python /content/lama-cleaner/inpaint_cli.py --image_directory static/public --output_path static/public/result'.split(), stdout=subprocess.PIPE)
    while True:
        output = process.stdout.readline().decode()
        if output == '' and process.poll() is not None:
            break
        socketio.emit('log', {'message': output})
    shutil.make_archive("static/public/result", "zip", "static/public/result")
    socketio.emit('ai', {'message': 'finished'})

def only_dir():
    path = 'static/public'
    files = os.listdir(path)
    if len(files) == 0:
        return False
    return os.path.isdir(os.path.join(path, files[0]))

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

def panel_cleaner_dir():
    path = 'static/public'

    for item in os.listdir(path):
        current_path = os.path.join(path, item)
        process = subprocess.Popen(f'pcleaner clean {current_path} -m --output_dir={current_path}'.split(), stdout=subprocess.PIPE)
        while True:
            output = process.stdout.readline().decode()
            if output == '' and process.poll() is not None:
                break
            if output != '':
                socketio.emit('log', {'message': output})

    socketio.emit('panel_cleaner', {'finished': True, 'files': get_files('folders')})

def panel_cleaner_files():
    process = subprocess.Popen('pcleaner clean static/public -m --output_dir=static/public'.split(), stdout=subprocess.PIPE)
    while True:
        output = process.stdout.readline().decode()
        if output == '' and process.poll() is not None:
            break
        if output != '':
            socketio.emit('log', {'message': output})

    socketio.emit('panel_cleaner', {'finished': True, 'files': get_files('files')})

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

if __name__ == '__main__':
    socketio.run(app)
