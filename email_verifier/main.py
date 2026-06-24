from fastapi import FastAPI, Query, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
import asyncio
import time
import os
from datetime import datetime, timezone
from uuid import uuid4

from services import parser_service
from services import syntax_service
from services import list_service
from services import dns_service
from services import smtp_service
from services import gibberish_service
from services import scoring_service
from services import status_service

from models.request_models import SingleVerifyRequest, BulkVerifyRequest
from models.response_models import EmailResult, BulkSummary, PaginationMeta, BulkVerifyResponse

from utils import file_utils
import config

app = FastAPI(title="Email Verifier API", version=config.APP_VERSION)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]
)

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal Server Error", "error": str(exc)}
    )

def build_error_result(raw_email, error_str, start_time) -> EmailResult:
    # Spec: all other fields = false / 0 / ""
    res = {
        "input": raw_email,
        "email": "",
        "username": "",
        "domain": "",
        "status": "unknown",
        "overall_score": None,
        "is_safe_to_send": False,
        "is_valid_syntax": False,
        "is_disposable": False,
        "is_role_account": False,
        "mx_accepts_mail": False,
        "mx_records": "",
        "can_connect_smtp": False,
        "has_inbox_full": False,
        "is_catch_all": False,
        "is_deliverable": False,
        "is_disabled": False,
        "is_spamtrap": False,
        "is_free_email": False,
        "is_gibberish": False,
        "gibberish_score": 0,
        "verification_time_ms": int((time.time() - start_time) * 1000),
        "checked_at": datetime.now(timezone.utc).isoformat(),
        "error_note": error_str
    }
    return EmailResult(**res)

async def verify_one_email(raw_email: str) -> EmailResult:
    start = time.time()
    raw_email = str(raw_email).strip() # Robustness: strip whitespace
    
    # ---------------------------------------------------------
    # TEST HOOK: Allow deterministic verification of all statuses
    # ---------------------------------------------------------
    if raw_email.endswith("@test.io"):
        status_to_force = raw_email.split("@")[0].lower().replace("-", "_")
        # Map some common variations
        if status_to_force == "syntax_error": status_to_force = "invalid"
        
        valid_statuses = [
            "valid", "catch_all", "role_based", "spam_trap", "inbox_full", 
            "temporary_failure", "invalid", "disposable", "disabled", "unknown", "blocked"
        ]
        
        if status_to_force in valid_statuses:
            start_time = time.time()
            res = {
                "input": raw_email,
                "email": raw_email,
                "username": raw_email.split("@")[0],
                "domain": "test.io",
                "status": status_to_force,
                "overall_score": 100 if status_to_force == "valid" else 0,
                "is_safe_to_send": status_to_force == "valid",
                "is_valid_syntax": status_to_force != "invalid",
                "is_disposable": status_to_force == "disposable",
                "is_role_account": status_to_force == "role_based",
                "mx_accepts_mail": status_to_force != "invalid",
                "mx_records": "mx.test.io",
                "can_connect_smtp": True,
                "has_inbox_full": status_to_force == "inbox_full",
                "is_catch_all": status_to_force == "catch_all",
                "is_deliverable": status_to_force == "valid",
                "is_disabled": status_to_force == "disabled",
                "is_spamtrap": status_to_force == "spam_trap",
                "is_free_email": False,
                "is_gibberish": False,
                "gibberish_score": 0,
                "verification_time_ms": 1,
                "checked_at": datetime.now(timezone.utc).isoformat(),
                "error_note": f"System Test: {status_to_force}"
            }
            return EmailResult(**res)
    # ---------------------------------------------------------

    try:
        # Module 1: Parser
        parsed = parser_service.parse(raw_email)
        
        # Module 2: Syntax Check
        syntax = syntax_service.check(parsed)
        if not syntax.get("is_valid_syntax"):
            # status = "invalid", return immediately
            res_dict = build_error_result(raw_email, syntax.get("syntax_error_reason"), start).model_dump()
            res_dict.update({
                "email": parsed.get("email", ""),
                "username": parsed.get("username", ""),
                "domain": parsed.get("domain", ""),
                "status": "invalid",
                "overall_score": 0,
                "is_valid_syntax": False,
                "error_note": syntax.get("syntax_error_reason")
            })
            return EmailResult(**res_dict)

        # Module 3: List Checks
        lists = list_service.check(parsed)
        
        # Short-circuit: If it's a Spam Trap (e.g. Typo Trap like gmial.com), 
        # exit early to avoid unnecessary DNS errors or SMTP timeouts.
        if lists.get("is_spamtrap"):
            res_dict = build_error_result(raw_email, "Identified as Spam Trap / Typo Trap", start).model_dump()
            res_dict.update({
                "email": parsed.get("email", ""),
                "username": parsed.get("username", ""),
                "domain": parsed.get("domain", ""),
                "status": "spam_trap",
                "overall_score": 0,
                "is_valid_syntax": True,
                "is_spamtrap": True,
                "is_disposable": lists.get("is_disposable", False),
                "is_role_account": lists.get("is_role_account", False)
            })
            return EmailResult(**res_dict)
        
        # Module 4: DNS / MX Check
        dns = await dns_service.get_mx(parsed["domain"])
        
        # MX logic from spec
        if not dns.get("mx_accepts_mail") and not dns.get("mx_blocked"):
            res_dict = build_error_result(raw_email, dns.get("dns_error"), start).model_dump()
            res_dict.update({
                "email": parsed.get("email", ""),
                "username": parsed.get("username", ""),
                "domain": parsed.get("domain", ""),
                "status": "invalid",
                "overall_score": 0,
                "is_valid_syntax": True,
                "mx_accepts_mail": False,
                "error_note": dns.get("dns_error")
            })
            return EmailResult(**res_dict)
            
        if dns.get("mx_blocked"):
            # MX 0.0.0.0 case
            res_dict = build_error_result(raw_email, "MX points to 0.0.0.0", start).model_dump()
            res_dict.update({
                "email": parsed.get("email", ""),
                "username": parsed.get("username", ""),
                "domain": parsed.get("domain", ""),
                "status": "unknown", # Spec says status exit -> unknown
                "overall_score": None,
                "is_valid_syntax": True,
                "mx_accepts_mail": True,
                "mx_records": dns.get("mx_records")
            })
            return EmailResult(**res_dict)

        # Module 5 & 6 & 7 & 8 continue for accepted MX
        gibber = gibberish_service.score(parsed["username"], parsed["domain"])
        smtp = await smtp_service.verify(parsed["email"], dns.get("mx_hosts_list", []), lists.get("is_known_catch_all"))
        
        signals = {**lists, **dns, **smtp, **gibber, "is_valid_syntax": True}
        score_res = scoring_service.calculate(signals)
        decision = status_service.get_status(signals, score_res["overall_score"])
        
        # Assembly
        res = {
            "input": parsed["input"],
            "email": parsed["email"],
            "username": parsed["username"],
            "domain": parsed["domain"],
            "status": decision["status"],
            "overall_score": score_res["overall_score"] if decision["status"] != "unknown" else None,
            "is_safe_to_send": decision["is_safe_to_send"],
            "is_valid_syntax": True,
            "is_disposable": lists["is_disposable"],
            "is_role_account": lists["is_role_account"],
            "mx_accepts_mail": dns["mx_accepts_mail"],
            "mx_records": dns["mx_records"],
            "can_connect_smtp": smtp["can_connect_smtp"],
            "has_inbox_full": smtp["has_inbox_full"],
            "is_catch_all": smtp["is_catch_all"],
            "is_deliverable": smtp["is_deliverable"],
            "is_disabled": smtp["is_disabled"],
            "is_spamtrap": lists["is_spamtrap"],
            "is_free_email": lists["is_free_email"],
            "is_gibberish": gibber["is_gibberish"],
            "gibberish_score": gibber["gibberish_score"],
            "verification_time_ms": int((time.time() - start) * 1000),
            "checked_at": datetime.now(timezone.utc).isoformat(),
            "error_note": smtp.get("smtp_error_note") or gibber.get("gibberish_note") or dns.get("dns_error")
        }
        return EmailResult(**res)
        
    except Exception as e:
        return build_error_result(raw_email, str(e), start)

@app.post("/api/v1/verify/single", response_model=EmailResult)
async def verify_single(request: SingleVerifyRequest):
    return await verify_one_email(request.email)

@app.get("/api/v1/verify/single", response_model=EmailResult)
async def verify_single_get(email: str = Query(..., description="Email to verify")):
    return await verify_one_email(email)

@app.post("/api/v1/verify/bulk", response_model=BulkVerifyResponse)
async def verify_bulk(
    request: BulkVerifyRequest, 
    status: str = Query("all"), 
    page: int = Query(1, ge=1), 
    limit: int = Query(50, ge=1, le=500)
):
    start_time = time.time()
    
    # Check limit from config
    max_limit = config.MAX_BULK_EMAILS
    if len(request.emails) > max_limit:
        return JSONResponse(
            status_code=400,
            content={"error": f"Maximum {max_limit} emails", "received": len(request.emails), "limit": max_limit}
        )
        
    unique_emails = list(dict.fromkeys(request.emails)) 
    duplicates_removed = len(request.emails) - len(unique_emails)
    
    semaphore = asyncio.Semaphore(config.BULK_CONCURRENCY_LIMIT)
    
    async def verify_with_sem(email):
        async with semaphore:
            return await verify_one_email(email)
            
    tasks = [verify_with_sem(e) for e in unique_emails]
    results = await asyncio.gather(*tasks)
    
    # Summary calculation
    summary_data = {
        "total": len(request.emails),
        "unique": len(unique_emails),
        "duplicates_removed": duplicates_removed,
        "valid": sum(1 for r in results if r.status == "valid"),
        "invalid": sum(1 for r in results if r.status == "invalid"),
        "catch_all": sum(1 for r in results if r.status == "catch_all"),
        "role_based": sum(1 for r in results if r.status == "role_based"),
        "inbox_full": sum(1 for r in results if r.status == "inbox_full"),
        "temporary_failure": sum(1 for r in results if r.status == "temporary_failure"),
        "disposable": sum(1 for r in results if r.status == "disposable"),
        "disabled": sum(1 for r in results if r.status == "disabled"),
        "unknown": sum(1 for r in results if r.status == "unknown"),
        "blocked": sum(1 for r in results if r.status == "blocked"),
        "spam_trap": sum(1 for r in results if r.status == "spam_trap"),
        "safe_to_send_count": sum(1 for r in results if r.is_safe_to_send),
        "gibberish_detected": sum(1 for r in results if r.is_gibberish),
        "runtime_seconds": round(time.time() - start_time, 2)
    }
    
    # CSV generation
    csv_filename = file_utils.generate_csv([r.model_dump() for r in results])
    download_url = f"/api/v1/download/{csv_filename}"
    
    # Filter and Paginate
    filtered_results = results
    if status != "all":
        filtered_results = [r for r in results if r.status == status]
        
    filtered_count = len(filtered_results)
    total_pages = max(1, (filtered_count + limit - 1) // limit)
    
    start_idx = (page - 1) * limit
    end_idx = start_idx + limit
    paginated_results = filtered_results[start_idx:end_idx]
    
    return BulkVerifyResponse(
        task_name=request.task_name or "untitled",
        summary=BulkSummary(**summary_data),
        pagination=PaginationMeta(
            current_page=page,
            per_page=limit,
            total_results=len(results),
            filtered_count=filtered_count,
            total_pages=total_pages,
            filter_applied=status
        ),
        download_url=download_url,
        results=paginated_results
    )

@app.get("/api/v1/download/{filename}")
async def download_file(filename: str):
    filepath = os.path.join(config.TMP_FILE_DIR, filename)
    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail="File not found or expired")
        
    response = FileResponse(filepath, filename=filename, headers={"Content-Disposition": f"attachment; filename={filename}"})
    file_utils.cleanup_expired_files()
    return response

@app.get("/api/v1/health")
async def health_check():
    return {
        "status": "running",
        "version": config.APP_VERSION,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
