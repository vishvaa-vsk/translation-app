import PyPDF2,os
from fpdf import FPDF
from translate import translator,UPLOAD_FOLDER,TRANSLATED_FOLDER

def translate_txt(filename:str,dest_lang:str):
    file_path = os.path.join(UPLOAD_FOLDER, filename)
    with open(file_path,"r",encoding='utf-8') as file_obj:
        content = file_obj.read()
    translated_content = translator.translate(content,dest=dest_lang)

    translated_file_path = os.path.join(TRANSLATED_FOLDER, f"translated_{filename}")
    with open(translated_file_path, "w", encoding='utf-8') as file_obj:
        file_obj.write(translated_content.text)

    return translated_content.text, translated_file_path

def translate_pdf(filename:str , dest_lang:str):
    file_path = os.path.join(UPLOAD_FOLDER, filename)
    with open(file_path, "rb") as file_obj:
        pdf_reader = PyPDF2.PdfFileReader(file_obj)
        content = ""
        for page in pdf_reader.pages:
            content+=page.extract_text()
    translated_content = translator.translate(content,dest=dest_lang)
    translated_file_path = os.path.join(TRANSLATED_FOLDER, f"translated_{filename}")
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Arial", size=12)
    pdf.multi_cell(0, 10, translated_content.text)
    pdf.output(translated_file_path)

    return translated_content.text, translated_file_path