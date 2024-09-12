import os
from flask import Flask,jsonify,request,send_from_directory
from flask_cors import CORS
from googletrans import Translator
from werkzeug.utils import secure_filename
from helper import *

UPLOAD_FOLDER = 'files'
TRANSLATED_FOLDER = 'translated_files'
ALLOWED_EXTENSIONS = {'txt', 'pdf'}

app = Flask(__name__)
cors = CORS(app,origins="*")
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['TRANSLATED_FOLDER'] = TRANSLATED_FOLDER

client_folder = os.path.join(os.getcwd(),"..","client")
dist_folder = os.path.join(client_folder,"dist")

@app.route("/",defaults={"filename":""})
@app.route("/<path:filename>")
def index(filename):
    if not filename:
        filename = "index.html"
    return send_from_directory(dist_folder,filename)


translator = Translator()

@app.route('/api/translate-text',methods=["POST"])
def translate_text():
    target_text = request.json.get("target-text")
    dest_lang = request.json.get("dest-lang")
    if not target_text or not dest_lang:
        return jsonify({"message": "Target text or destination language not defined"}), 400
    translated_text = translator.translate(target_text, dest=dest_lang)
    try:
        return jsonify({
            "translated_text": translated_text.text,
            "source_lang": translated_text.src
        })
    except Exception as e:
        return jsonify({"message": str(e)}), 400

@app.route('/api/translate-file', methods=["POST"])
def translate_file():
    try:
        file = request.files['file']
        dest_lang = request.form.get('dest-lang')

        if not file or not dest_lang:
            return jsonify({"message": "File or destination language missing"}), 400

        # Ensure the directories exist
        os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
        os.makedirs(app.config['TRANSLATED_FOLDER'], exist_ok=True)

        filename = secure_filename(file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        
        print(f"Saving file to: {file_path}")
        file.save(file_path)

        if filename.endswith('.txt'):
            translated_content, translated_file_path = translate_txt(filename, dest_lang)
        elif filename.endswith('.pdf'):
            translated_content, translated_file_path = translate_pdf(filename, dest_lang)
        else:
            return jsonify({"message": "Invalid file type"}), 400

        return jsonify({
            "translated_text": translated_content,
            "translated_file": os.path.basename(translated_file_path)
        })

    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({"message": str(e)}), 500
    
@app.route("/api/download/<filename>",methods=["GET"])
def download(filename):
    return send_from_directory(app.config['TRANSLATED_FOLDER'],filename,as_attachment=True)


if __name__ == '__main__':
    app.run(port=8080,debug=True)