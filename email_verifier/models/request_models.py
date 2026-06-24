from pydantic import BaseModel, field_validator
from typing import List, Optional

class SingleVerifyRequest(BaseModel):
    email: str

class BulkVerifyRequest(BaseModel):
    task_name: Optional[str] = "untitled"
    emails: List[str]

    @field_validator('emails')
    @classmethod
    def check_limit(cls, v: List[str]) -> List[str]:
        if len(v) > 10000:
            # We will handle the specific 400 response in main.py
            raise ValueError('Maximum 10000 emails per request')
        return v
