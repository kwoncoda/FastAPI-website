from fastapi import FastAPI, HTTPException, Response, Depends, Request, Body
from pydantic import BaseModel
from jwt.exceptions import InvalidTokenError
from datetime import datetime, timedelta, timezone
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from dotenv import load_dotenv
import jwt
import pymysql
import pymysql.cursors
import bcrypt
import os
#import datatype
from typing import Dict, Any

#get으로 토큰 전송시 담는 변수
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# 환경변수 이용을 위한 전역변수
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
# 루트 경로에 .env파일로 값 설정
load_dotenv(os.path.join(BASE_DIR, ".env"))

# jwt에 필요한 전역변수
SECRET_KEY = os.environ["SECRET_KEY"]
# 알고리즘
ALGORITHM = "HS256"
#access_token 만료(분)
ACCESS_TOKEN_EXPIRE_MINUTES = 10
#refresh_token 만료(분)
REFRESH_TOKEN_EXPIRE_MINUTES = 1000

#회원가입 DTO
class Register_User(BaseModel):
    name:str
    user_id:str
    password:str
    nickname:str

#로그인 DTO
class Login_User(BaseModel):
    user_id:str
    password:str

    class Config:
        json_schema_extra = {
            "example": {
                "user_id": "kwon1",
                "password": "qwer1234", 
            }
        }

#재발급 DTO
class RefreshToken(BaseModel):
    refresh_token:str

#auto로그인 DTO
class AutoToken(BaseModel):
    auto_token:str

#토큰 확인 DTO
class Tokens(BaseModel):
    access_token:str
    refresh_token:str

#글작성
class WriteData(BaseModel):
    title:str
    data:str
    access_token:str
    newwrite:bool
    num:str

#글 불러오기
class ReadLoad(BaseModel):
    num:str
    access_token:str
    count:bool

#글 삭제
class Deletepost(BaseModel):
    num:str
    access_token:str

#검색
class Search(BaseModel):
    option:str
    text:str

#댓글
class Comment(BaseModel):
    num:int
    text:str
    access_token:str


class ResponseData(BaseModel):
    status:int
    message:str
    data:Dict

    class Config:
        json_schema_extra = {
            "example": {
                "status": 201,
                "message": "로그인 성공",
                "data": {
                    "access_token": "your_access_token_here",
                    "refresh_token": "your_refresh_token_here",
                    "nick": "user_nick"
                }
            }
        }


class ResponseRegister(BaseModel):
    status:int
    message:str

    class Config:
        json_schema_extra = {
            "example": {
                "status": 201,
                "message": "회원가입 성공",
            }
        }

class Responserefresh(BaseModel):
    status:int
    message:str
    data:Dict

    class Config:
        json_schema_extra = {
            "example": {
                "status": 201,
                "message": "재발급 성공",
                "data": {
                    "access_token": "your_new_access_token_here",
                }
            }
        }


    
SWAGGER_HEADERS = {
    "title": "CODA API 관리 페이지",
    "version": "1.0.50",
    "description": "## 관리페이지에 오신것을 환영합니다 \n - CODA API를 사용해 데이터를 전송할 수 있습니다. \n - 무분별한 사용은 하지 말아주세요 \n - 관리자 번호: 010-1234-5678",

    
}

#api객체 생성
app = FastAPI(**SWAGGER_HEADERS)

#api설정값
app.add_middleware(
    CORSMiddleware,
    #allow_origins=[os.environ['CORS_URL1'],os.environ['CORS_URL2']],
    #허용ip
    #allow_origins=["*"],  
    allow_origins=["http://127.0.0.1:5501","192.168.219.101"],
    allow_credentials=True,
    #허용메소드
    allow_methods=["GET","POST"],  
    allow_headers=["*"],  
)

app.swagger_ui_parameters={
    "deepLinking": True,
    "displayRequestDuration": True,
    #none 설정하면 api모두 닫혀있음
    #"docExpansion": "none",
    #api가 method별로 정렬
    #"operationSorter": "method",
    #"filter": True,
    #태크가 알파벳 순서
    #"tagsSorter": "alpha",
    "syntaxHighlight.theme": "obsidian",
}



#sql 연결세션
def mysql_create_session():
    mysql_ip = os.environ['MYSQL_IP']
    mysql_port = int(os.environ['MYSQL_PORT'])
    mysql_user = os.environ['MYSQL_USER']
    mysql_pw = os.environ['MYSQL_PW']
    mysql_db = os.environ['MYSQL_DB']
    # MYSQL에 생성한 DB와 연결
    conn = pymysql.connect(host=mysql_ip,port=mysql_port, user=mysql_user, password=mysql_pw ,db=mysql_db, charset='utf8', cursorclass=pymysql.cursors.DictCursor)
    # conn = pymysql.connect(host='192.168.5.128',port=3306, user='testuser02', password='1234' ,db='DB02', charset='utf8', cursorclass=pymysql.cursors.DictCursor)
    #cursor: 하나의 DB connection에 대하여 독립적으로 SQL 문을 실행할 수 있는 작업환경을 제공하는 객체
    cur = conn.cursor()

    return conn,cur

#jwt 토큰 발급
# data와 선택적 만료시간 인자
def create_token(data:dict, expires_delta: int | None = None):
    #전달된 data 복사본
    to_encode = data.copy()
    #만료시간 제공되면 현재시간에 더함
    if expires_delta:
        expire = datetime.now(timezone.utc) + timedelta(minutes=expires_delta)
    else:
        #현재시간에 15분 더함
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    # to_encode에 만료시간과 발행시간 추가
    to_encode.update({"exp":expire,"iat": datetime.now(timezone.utc)})
    #jwt 인코딩하여 생성
    encoded_jwt = jwt.encode(to_encode,SECRET_KEY,algorithm=ALGORITHM)
    return encoded_jwt

#에러 표시를 위한 함수
def errorfunction(value):
    return {
        422: {
            "description": "Validation Error",
            "content": {
                "application/json": {
                    "example": 
                        value 
                }
            }
        }
    }


#로그인 API
@app.post("/login",summary="User Login",response_model=ResponseData,responses=errorfunction({"status":401, "message":"로그인 실패"}))
def user_login(user:Login_User):
    """
    로그인시 정보를 확인해 토큰을 반환합니다.

    - **user_id**: 사용자의 아이디
    - **password**: 사용자의 비밀번호



    """
    #print("user: ",user)
    conn,cur = mysql_create_session()
    user_dict = user.model_dump()
    #print("user_dict: ",user_dict)
    user_id, password = user_dict.values()
    #print("id, pw: ",user_id,password)

    try:
        sql = 'SELECT * FROM usertable WHERE id = %s'
        cur.execute(sql,(user_id))
        #쿼리 결과의 첫번째 행
        row = cur.fetchone()
        #print("row: ",row)

        if not row:
            #raise HTTPException(status_code=401, detail="회원이 없습니다.")
            return {"status":401, "message":"로그인 실패"}
    
        #해시된 비밀번호와 정보확인
        if bcrypt.checkpw(password.encode('utf-8'), row['passwd'].encode('utf-8')):
            access_token = create_token(data={"sub":row['id'],"nick":row['nick'],"type":"access_token"},expires_delta=ACCESS_TOKEN_EXPIRE_MINUTES)
            refresh_token = create_token(data={"sub":row["id"],"type":"refresh_token"},expires_delta=REFRESH_TOKEN_EXPIRE_MINUTES)

            # 벡엔드에서 쿠키 생성시 페이지 이동후 사라짐
            #response.set_cookie(key="access_token_api", value=access_token, expires=ACCESS_TOKEN_EXPIRE_MINUTES, samesite='lax' ,secure=True, path='/',httponly=True)
            #response.set_cookie(key="refresh_token_api",value=refresh_token,expires=REFRESH_TOKEN_EXPIRE_MINUTES, samesite='lax', secure=True, path='/',httponly=True)



            return {"status":201, "message":"로그인 성공", "data":{"access_token":access_token,"refresh_token":refresh_token,"nick":row['nick']}}
        else:
            return {"status":401, "message":"로그인 실패"}
    finally:
        conn.close()

#회원가입 API
@app.post("/register",summary="User Register",response_model=ResponseRegister)
async def user_register(user:Register_User = Depends(Register_User)):
    #print("user: ",user)
    conn, cur = mysql_create_session()
    #print("conn: ",conn)
    #print("cur: ",cur)
    user_dict = user.model_dump()
    #print("user_dict: ",user_dict)
    name,user_id,password,nickname = user_dict.values()
    #print(name,user_id,password,nickname)
    #패스워드 해싱
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
    #print(hashed_password)

    try:
        sql = 'INSERT INTO usertable(id,name,passwd,nick) VALUES (%s, %s, %s, %s)'
        cur.execute(sql,(user_id,name,hashed_password,nickname))
        conn.commit()
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        conn.close()
    
    return {"status":201, "message":"회원가입 성공"}


#access_token 재발급
@app.post("/refresh",summary="User refresh",response_model=Responserefresh,responses=errorfunction({"status_code":401, "detail":"토큰 인증 실패"}))
async def refresh_token(response:Response,req_data:RefreshToken):
    #print("req_data: ",req_data)
    conn, cur = mysql_create_session()

    payload = jwt.decode(req_data.refresh_token, SECRET_KEY, algorithms=[ALGORITHM])
    #print("payload: ",payload)
    user_id = payload.get('sub')
    sql = "SELECT * FROM usertable WHERE id = %s"
    #print(sql,(user_id))
    cur.execute(sql,(user_id))
    row = cur.fetchone()
    #print("row: ",row)

    if user_id is None:
        raise HTTPException(status_code=401, detail="토큰 인증 실패")

    new_access_token = create_token(data={"sub":row['id'],"nick":row['nick'],"type":"access_token"},expires_delta=ACCESS_TOKEN_EXPIRE_MINUTES)
    #print(new_access_token)

    conn.close()

    return {"status":201, "message":"재발급 성공","data":{"access_token":new_access_token}}

#토큰 만료값 확인
@app.post("/expirecheck")
async def expirecheck(response:Response,req_data:Tokens):
    try:
        jwt.decode(req_data.access_token, SECRET_KEY, algorithms=[ALGORITHM])
        return {"status":201, "message":"발급확인"}
    except:
        #print("access_token만료")
        try:
            jwt.decode(req_data.refresh_token, SECRET_KEY, algorithms=[ALGORITHM])
            return {"status":100, "message":"access_token만료"}
        except:
            #print("refresh_token만료")
            return {"status":200, "message":"모든 토큰 만료"}




#자동로그인을 하기위한 API
@app.post("/autologin")
async def autologin(response:Response,req_data:AutoToken):
    #print("req_data: ",req_data)
    conn, cur = mysql_create_session()
    payload = jwt.decode(req_data.auto_token, SECRET_KEY, algorithms=[ALGORITHM])
    #print("payload: ",payload)
    user_id = payload.get('sub')
    sql = "SELECT * FROM usertable WHERE id = %s"
    #print(sql,(user_id))
    cur.execute(sql,(user_id))
    row = cur.fetchone()
    #print("row: ",row)

    if user_id is None:
        raise HTTPException(status_code=401, detail="토큰 인증 실패")

    access_token = create_token(data={"sub":user_id,"nick":row['nick'],"type":"access_token"},expires_delta=ACCESS_TOKEN_EXPIRE_MINUTES)
    refresh_token = create_token(data={"sub":row["id"],"type":"refresh_token"},expires_delta=REFRESH_TOKEN_EXPIRE_MINUTES)

    #print(access_token)

    conn.close()

    return {"status":201, "message":"자동로그인 성공", "data":{"access_token":access_token, "refresh_token":refresh_token}}


#auto_token 주는 API
@app.post("/autotoken")
async def autotoken(response:Response, req_data:RefreshToken):
    conn, cur = mysql_create_session()
    payload = jwt.decode(req_data.refresh_token, SECRET_KEY, algorithms=[ALGORITHM])
    #print("payload: ",payload)
    user_id = payload.get('sub')
    sql = "SELECT * FROM usertable WHERE id = %s"
    #print(sql,(user_id))
    cur.execute(sql,(user_id))
    row = cur.fetchone()
    #print("row: ",row)

    if user_id is None:
        raise HTTPException(status_code=401, detail="토큰 인증 실패")
    
    auto_token = create_token(data={"sub":user_id,"nick":row['nick'],"type":"auto_token"})
    conn.close()

    return {"status":201, "message":"auto_token발급","data":{"auto_token":auto_token}}


#글 업로드
@app.post("/uploadwrite")
async def uploadwrite(response:Response, req_data:WriteData):
    conn, cur = mysql_create_session()
    payload = jwt.decode(req_data.access_token, SECRET_KEY, algorithms=[ALGORITHM])
    #print(payload)

    user_nick = payload.get('nick')
    #print(user_nick)
    user_id = payload.get('sub')
    title = req_data.title
    data = req_data.data
    time = datetime.today().strftime('%Y-%m-%d')
    


    if user_id is None:
        raise HTTPException(status_code=401, detail="토큰 인증 실패")


    #새글이 맞을시
    if(req_data.newwrite):
        try:
            sql = "INSERT INTO `USER`.`main_board` (`title`, `writer`, `data`, `write_date`, `hitcount`) VALUES (%s, %s, %s, %s, '0');"
            #print(sql,(title,user_nick,data,time))
            cur.execute(sql,(title,user_nick,data,time))
            conn.commit()
        except Exception as e:
            conn.rollback()
            raise HTTPException(status_code=400, detail=str(e))
        finally:
            conn.close()
    else:
        try:
            num = req_data.num
            sql = 'UPDATE main_board SET data = %s WHERE num = %s;'
            cur.execute(sql,(data,num))
            conn.commit()
        except Exception as e:
            conn.rollback()
            raise HTTPException(status_code=400, detail=str(e))
        finally:
            conn.close()


    return {"status":201, "message":"글 업로드 성공"}

@app.get("/loadboard")
async def loadboard():
    conn, cur = mysql_create_session()

    sql = 'SELECT COUNT(*) FROM main_board;'
    cur.execute(sql)
    rowcount = cur.fetchone()
    rowcount = rowcount["COUNT(*)"]
    data = []

    for i in range(0,rowcount,10):
        sql = 'SELECT num,title,writer,write_date,hitcount FROM main_board ORDER BY num DESC limit %s,10;'
        cur.execute(sql,(i))
        tend = cur.fetchall()
        data.append(tend)
    
    #   print(data)

    conn.close()

    return {"status":201,"count":rowcount,"data":data}

@app.post("/readload")
async def readload(req_data:ReadLoad):

    payload = jwt.decode(req_data.access_token, SECRET_KEY, algorithms=[ALGORITHM])
    #print(payload)

    num = req_data.num

    conn, cur = mysql_create_session()
    sql = 'SELECT writer FROM main_board WHERE num=%s;'

    cur.execute(sql,(num))
    writer = cur.fetchone()

    #print(writer)

    #조회인지 데이터 불러오기인지
    thiscount = req_data.count

    #새글인지 수정인지
    

    sql = 'SELECT title,data,write_date,hitcount FROM main_board WHERE num=%s;'
    cur.execute(sql,(num))
    data = cur.fetchone()
    #print(data)

    if(thiscount):
        try:
            sql = 'UPDATE main_board SET hitcount = hitcount + 1 WHERE num = %s;'
            cur.execute(sql,(num))
            conn.commit()
        except Exception as e:
            conn.rollback()
            raise HTTPException(status_code=400, detail=str(e))
        finally:
            conn.close()


    if(writer["writer"] == payload["nick"]):
        #print("맞음")
        
        return {"status":201, "message":"본인 작성글", "data":data, "writer":writer["writer"]}
    else:
        return {"status":100, "message":"본인글 아님", "data":data, "writer":writer["writer"]}


#게시물 삭제
@app.post("/deletepost")
def deletepost(req_data:Deletepost):
    payload = jwt.decode(req_data.access_token, SECRET_KEY, algorithms=[ALGORITHM])
    print(payload)

    num = req_data.num

    conn, cur = mysql_create_session()
    sql = 'SELECT writer FROM main_board WHERE num=%s;'

    cur.execute(sql,(num))
    writer = cur.fetchone()

    print(writer)

    if(writer["writer"] == payload["nick"]):
        try:
            sql = 'DELETE FROM main_board WHERE num=%s;'
            print(sql,(num))
            cur.execute(sql,(num))
            conn.commit()
        except Exception as e:
            conn.rollback()
            raise HTTPException(status_code=400, detail=str(e))
        finally:
            conn.close()

        return {"status":201,"message":"삭제완료"}
    
    return {"status":401, "message":"삭제불가"}
    

#검색
@app.post("/search")
async def search(req_data:Search):
    option = req_data.option
    text = req_data.text

    conn, cur = mysql_create_session()

    sql = "SELECT COUNT(*) FROM main_board WHERE {} LIKE '%{}%';".format(option,text)
    cur.execute(sql)
    rowcount = cur.fetchone()
    rowcount = rowcount["COUNT(*)"]
    #print(rowcount)
    data = []

    for i in range(0,rowcount,10):
        sql = "SELECT num,title,writer,write_date,hitcount FROM main_board WHERE {} LIKE '%{}%' ORDER BY num DESC limit {},10;".format(option,text,i)
        cur.execute(sql)
        tend = cur.fetchall()
        data.append(tend)

    #print(data)

    conn.close()

    return {"status":201,"message":"검색완료","data":data}

@app.post("/commentupload")
async def commentupload(req_data:Comment):
    text = req_data.text
    #print(text)
    num = req_data.num
    #print(num)
    payload = jwt.decode(req_data.access_token, SECRET_KEY, algorithms=[ALGORITHM])
    nick = payload["nick"]
    #print(nick)

    conn, cur = mysql_create_session()

    # sql = "UPDATE main_board SET comment = {} WHERE num = {};".format(data,num)
    # sql = "UPDATE main_board SET comment = '{\"%s\":\"%s\"}' WHERE num = %s;"
    # print(sql)
    

    try:
        sql = "INSERT INTO comment (postnum, nick, data) VALUES ({}, '{}', '{}');".format(num,nick,text)
        #print(sql)
        cur.execute(sql)
        #print("완료")
        conn.commit()
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        conn.close()

    return {"status":201,"message":"등록완료"}




@app.get("/readcomment/{num}")
async def readcomment(num:int, token: str = Depends(oauth2_scheme)):
    #print(num)
    #print(token)
    conn, cur = mysql_create_session()

    sql = "SELECT nick,data FROM comment WHERE postnum={} ORDER BY num DESC;".format(num)
    cur.execute(sql)
    data = cur.fetchall()
    conn.close()

    #print(data)

    return {"status":201,"message":"댓글 전송","data":data}

    








    



    



        






#로그아웃 API
# @app.get("/logout")
# async def logout(response: Response):

#     #test
#     # session = request.Session()
#     # #print(session.cookies.get_dict())
#     # response = session.get('localhost:8050')
#     # #print(session.cookies.get_dict())


#     #access_token = request.cookies.get("access_token")
#     #access_token = request.getCookies()
#     #print("access_token: ",access_token)
#     #쿠키 삭제
#     #response.delete_cookie(key="access_token")

#     return {}

#oauth2_scheme = OAuth2PasswordBearer(tokenUrl='token')

#access_token체크(모든 요청)
# def check_token(token=Depends(oauth2_scheme)):
#     try:
#         #print("확인")
#         #print(token)
#         payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
#         #print("payload: ",payload)
#         name = payload.get("name")
#         #print("name: ",name)
#         if name is None:
#             raise HTTPException(status_code=401, detail="인증 실패")
#         else:
#             return {"status":200, "message":"검증 성공", "data":name}
#     except :
#         return {"status":401,"message":"엑세스 토큰 만료"}





if __name__=='__main__':
    import uvicorn
    uvicorn.run("main:app", host='0.0.0.0',port = 8050, reload=True) 