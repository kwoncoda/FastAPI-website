from pydantic import BaseModel



#댓글
class Comment(BaseModel):
    num:int
    text:str
    access_token:str