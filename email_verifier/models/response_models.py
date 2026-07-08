from pydantic import BaseModel
from typing import List, Optional

class EmailResult(BaseModel):
    input: str
    email: str
    username: str
    domain: str
    status: str  # safe, invalid, catch_all, role_account, inbox_full, temporary_failure, disposable, disabled, unknown, blocked, spamtrap
    overall_score: Optional[int]
    is_safe_to_send: bool
    is_valid_syntax: bool
    is_disposable: bool
    is_role_account: bool
    mx_accepts_mail: bool
    mx_records: str
    can_connect_smtp: bool
    has_inbox_full: bool
    is_catch_all: bool
    is_deliverable: bool
    is_disabled: bool
    is_spamtrap: bool
    is_free_email: bool
    is_gibberish: bool
    gibberish_score: int
    verification_time_ms: int
    checked_at: str
    error_note: Optional[str] = None
    is_mailbox_verified: Optional[bool] = None

class BulkSummary(BaseModel):
    total: int
    unique: int
    duplicates_removed: int
    safe: int
    invalid: int
    catch_all: int
    role_account: int
    inbox_full: int
    temporary_failure: int
    disposable: int
    disabled: int
    unknown: int
    blocked: int
    spamtrap: int
    safe_to_send_count: int
    gibberish_detected: int
    runtime_seconds: float

class PaginationMeta(BaseModel):
    current_page: int
    per_page: int
    total_results: int
    filtered_count: int
    total_pages: int
    filter_applied: str

class BulkVerifyResponse(BaseModel):
    task_name: str
    summary: BulkSummary
    pagination: PaginationMeta
    download_url: str
    results: List[EmailResult]
