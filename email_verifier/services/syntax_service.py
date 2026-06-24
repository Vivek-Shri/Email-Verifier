import re

# Regex from spec
syntax_regex = re.compile(r"^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$")

def check(parsed: dict) -> dict:
    # Module 2: Syntax Check
    if parsed.get("parse_error"):
        return {
            "is_valid_syntax": False,
            "syntax_error_reason": "Multiple or missing @ symbols"
        }
        
    email = parsed["email"]
    
    if not syntax_regex.match(email):
        return {
            "is_valid_syntax": False,
            "syntax_error_reason": "Regex validation failed"
        }
    
    # Additional RFC checks from previous version can be kept or simplified. 
    # The spec focus is primarily on the Regex.
    
    return {
        "is_valid_syntax": True,
        "syntax_error_reason": ""
    }
