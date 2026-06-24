def parse(raw_email: str) -> dict:
    # Module 1: Parser
    original = raw_email
    cleaned = raw_email.strip().lower()
    
    # If multiple @ symbols or zero → parse error
    if cleaned.count('@') != 1:
        return {
            "input": original,
            "email": cleaned,
            "username": "",
            "domain": "",
            "parse_error": True
        }
        
    username, domain = cleaned.split('@')
    
    return {
        "input": original,
        "email": cleaned,
        "username": username,
        "domain": domain,
        "parse_error": False
    }
