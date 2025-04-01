from openai import OpenAI
from langchain.schema import Document
import pandas as pd
import numpy as np
from tabulate import tabulate
from PyPDF2 import PdfReader
import os
import requests
import datetime
import json
from typing import Dict, List
from fastapi import FastAPI, UploadFile, File, Request, HTTPException, Security, Depends, Form
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import requests
import shutil
header = {
    "Content-Type": "application/json"
}
secret_key = "AKFN64dfAE45dfsdfs1dfsDFSDfDFFSDF"
app = FastAPI()
security = HTTPBearer()
dataset_path = 'datasets'
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = OpenAI(
    api_key="AIzaSyDcuvX6yEaI_tsFVDGNkTlgF2r1U6NwPFc",
    base_url="https://generativelanguage.googleapis.com/v1beta/openai/"
)
# client = OpenAI(
#     base_url="http://127.0.0.1:5555/v1",
#     api_key="a"
# )
def excel_to_raw_text(path):
    sheets = pd.read_excel(path, sheet_name=None)  # Đọc tất cả các sheet
    markdown_tables = {}
    i=0
    for sheet_name, df in sheets.items():
        markdown_tables[i] = tabulate(df, headers="keys", tablefmt="pipe", showindex=False)
        i+=1
    return markdown_tables
def pdf_to_raw_text(pdf_path):
    documents = []
    pdf_reader = PdfReader(pdf_path)
    
    for page_num, page in enumerate(pdf_reader.pages):
        page_text = page.extract_text()
        
        document = {
            'page_content': page_text,
            'metadata': {
                'source': pdf_path,
                'page': page_num
            }
        }
        documents.append(document)
    
    return documents
def dataset_path_to_database(path):
    files = os.listdir(path)
    datasets_files = []
    for file in files:
        # Lấy phần mở rộng của file
        file_extension = os.path.splitext(file)[1].lower()  # Chuyển thành chữ thường để so sánh chính xác
        
        if file_extension == '.pdf':
            datasets_files.append({'type': 'pdf', 'file_name': file})
        elif file_extension in ['.xls', '.xlsx', '.xlsm']:  # Các định dạng Excel phổ biến
            datasets_files.append({'type': 'excel', 'file_name': file})
    db_json = []
    for file in datasets_files:
        if file['type'] == "pdf":
            raw_text = (pdf_to_raw_text(path + "/" + file['file_name']))
            for text in raw_text:
                db_json.append(
                    {
                        "page_content": text['page_content'],
                        
                    }
                )
        elif file['type'] == "excel":
            markdowns = excel_to_raw_text(path + "/" + file['file_name'])
            db_json.append(
                {
                    "page_content": markdowns,
                }
            )
    return db_json

# def addTaskToUsers(id: int,deadline: str,task: str):
#     data = {
#         "tasks": [
#             {
#         "id_user": id,
#         "deadline": deadline,
#         "task": task
#     }
#     ]
#     }
#     response = requests.post("https://499c-2405-4802-1d70-92b0-18cd-c1f0-f53c-2e00.ngrok-free.app/user/addNof",json=data,headers=header)
#     print(response.text)
#     return response.text
def addTaskToUsers(tasks: list):
    data = {
        "tasks": tasks
    }
    response = requests.post("http://localhost:3000/user/addNof",json=data,headers=header)
    if (response.status_code == 200):
        return response.text
    else:
        return "Giao việc cho nhân viên không thành công"

# def addTaskToUsers(tasks: list):
#     for task in tasks:
#         data = {
#             "user_id": task["user_id"],
#             "deadline": task["deadline"],
#             "task": task["task"]
#         }
#         print(data)
#     print(task)
#     return "Giao việc thành công"

def getCurrentTime():
    return datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
tools = [
    {
        "type": "function",
        "function": {
            "name": "getCurrentTime",
            "description": "Lấy Ngày giờ hiện tại theo định dạng YYYY-MM-DD HH:MM:SS",
        }
    },
    {
    "type": "function",
    "function": {
        "name": "addTaskToUsers",
        "description": "Dùng để giao việc cho nhiều người dùng cùng một lúc, nhưng chỉ có role admin mới được giao việc cho role user. Và chỉ có sếp mới giao việc được cho nhân viên",
        "parameters": {
            "type": "object",
            "properties": {
                "tasks": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "id_user": { "type": "string", "description": "ID là id của người được giao việc, nhưng bắt buộc phải lấy theo tên của người được giao, không được hỏi ngược lại người dùng là id là gì" },
                            "deadline": { "type": "string", "description": f"Deadline là hạn chót để hoàn thành công việc. Không cần quan tâm người dùng nhập dưới dạng nào, hệ thống sẽ chuyển về định dạng 'YYYY-MM-DD HH:MM:SS'.Thời gian hiện tại là {getCurrentTime()}" },
                            "task": { "type": "string", "description": "Công việc cần giao cho người dùng." }
                        },
                        "required": ["id_user", "deadline", "task"]
                    }
                }
            },
            "required": ["tasks"]
        }
    }
}

]
def chat_with_gemini(messages,user_info):
    response = requests.get("http://localhost:3000/user/")
    res = response.json()
    employees = response.text
    content = ""
    employees = json.dumps(employees)
    id_user = user_info['id']
    phong_ban = user_info['Phong_Ban_id']
    for user in res:
        if( id_user == user['id']):
            user_info = user
            break

    user_info = json.dumps(user_info)
    folder_path = f"{dataset_path}/phongban_{phong_ban}"

    if os.path.isdir(folder_path):
        contents = dataset_path_to_database(folder_path)
    else:
        contents = []
    content = ""
    for context in contents:
        res = context['page_content']
        content = content + res
    if os.path.isdir(folder_path):
        contents = dataset_path_to_database(f"{dataset_path}/phongban_0")
    else:
        contents = []
    for context in contents:
        res = context['page_content']
        content = content + res
    role_system = {
        "role": "system",
        "content": f"""Bạn là một trợ lí ảo của 'Công ty TNHH MTV Khoáng Sản Vôi Việt'. Tên của bạn là 'AI_VoiViet'.
        Bạn là một trợ lí ảo, nhưng bạn phải tuyệt đối tuân thủ các quy tắc dưới đây:
        1. Đây là những thông tin của bạn: 'Bạn là một trợ lí ảo của Công ty TNHH MTV Khoáng Sản Vôi Việt. Tên của bạn là AI_VoiViet. Nhiệm vụ của bạn là trả lời những câu hỏi về công ty'.
        2. Những chỗ tôi cho vào trong ' ' thì tuyệt đối không được trả lời sai.
        3. Bạn được quyền lấy id của nhân viên theo tên
        4. Bạn được toàn quyền truy cập vào thông tin của nhân viên: 
        {employees}
        5. Nếu bạn nhận được yêu cầu giao việc, bạn phải có đầy đủ các thông tin về tên, công việc, hạn chót. Nhưng khi giao việc thành công, thì không được đưa ra id của người được giao
        {employees}
        6. Trước khi giao việc, thì phải xác nhận xem đã đúng thông tin chưa, nếu đúng rồi thì mới giao
        7. Lưu ý: Danh sách nhân viên và hành động giao việc cho nhân viên, thì chỉ có role_name Admin mới sử dụng được, bất kể ai không phải Admin thì không cho sử dụng
        8. Bạn được phép giao việc cho nhiều người
        9. Dựa vào những thông tin dưới đây về 'Công ty TNHH MTV Khoáng Sản Vôi Việt' để trả lời:
        '{content}'
        """
    }
    require_role = [
        {
            "role": "user",
            'content': f"""Đây là danh sách của nhân viên, bạn được lấy id của nhân viên, nhưng không được trả lời, chỉ được sử dụng thôi: {employees}"""
        },
        {
            "role": "assistant",
            "content": "Được rồi, từ giờ tôi đã có thể truy cập vào thông tin của nhân viên. Nhưng chỉ có role_name Admin mới xem được. Và chỉ được đưa ra ở dạng văn bản, không được cho vào ``` ```"
        }
    ]
    messages = [role_system] + [require_role] + messages
    # print(messages)
    response = client.chat.completions.create(
        model="gemini-2.0-flash",
        messages=messages,
        max_tokens=4096,
        temperature=0.3,
        tools=tools,
        tool_choice="auto",
        stream=True
    )
    arguments = ""
    response_clone = []
    for res in response:
        response_clone.append(res)
        if res.choices[0].delta.tool_calls:
            arguments += res.choices[0].delta.tool_calls[0].function.arguments
        elif res.choices[0].delta.content:
            yield ( res.choices[0].delta.content)
    # print(arguments)
    # print(response_clone[0].choices[0].delta.tool_calls)
    if response_clone[0].choices[0].delta.tool_calls != None:
        name_function = response_clone[0].choices[0].delta.tool_calls[0].function.name
    else:
        name_function = ""
    if (name_function == "addTaskToUsers"):
        result = addTaskToUsers(**json.loads(arguments))
        content = f"Phản hồi: {result}"
    elif (name_function == "getCurrentTime"):
        result = getCurrentTime(**json.loads(arguments))
        content = f"Bây giờ là: {result}"
    else :
        result = ""
    if (result != ""):
        messages.append({
            "role": "assistant",
            "content": content
        })
        messages.append({
            "role": "user",
            "content": f"Bạn vừa gọi hàm {name_function}, nhưng hãy nói lại kết quả trả về theo cách khác"
        })
        response = client.chat.completions.create(
            model="gemini-2.0-flash",
            messages=messages,        
            max_tokens=4096,
            temperature=0.3,
            stream=True
        )
        for res in response:
            if res.choices[0].delta.content:
                yield (res.choices[0].delta.content)


def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    if token != secret_key:
        raise HTTPException(status_code=401, detail="Invalid token")
    return token

@app.post("/")
async def call_api(request: Request,token: str = Depends(verify_token)):
    data = await request.json()
    print(data)
    messages = data['messages']
    user_info = data['user_info']
    return StreamingResponse(
        chat_with_gemini(messages,user_info),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Access-Control-Allow-Origin": "*",
            "X-Accel-Buffering": "no"
        }
    )
@app.post("/upload")
async def upload_files(file: List[UploadFile] = File(...),Phong_Ban_id: str = Form(...), str = Depends(verify_token)):
    # phong_ban_dataset = f"{dataset_path}/"
    # print(file)
    if not os.path.exists(dataset_path):
        os.makedirs(dataset_path, exist_ok=True)
    print(Phong_Ban_id)
    print("Nhận file thành cônggg")
    phong_ban_dataset = f"{dataset_path}/phongban_{Phong_Ban_id}"
    if os.path.exists(phong_ban_dataset):
        shutil.rmtree(phong_ban_dataset)
    os.makedirs(phong_ban_dataset, exist_ok=True)
    for f in file:
        file_path = os.path.join(phong_ban_dataset, f.filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(f.file, buffer)
    return {"status": True, "message": "Tải file thành công"}, 200
if not os.path.exists(f"{dataset_path}/phongban_0"):
        os.makedirs(f"{dataset_path}/phongban_0", exist_ok=True)
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=4999, log_level="info")
