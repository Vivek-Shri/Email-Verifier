# Email Verifier

FastAPI email verification service. Connects directly to recipient MX servers
(port 25) to check mailbox deliverability — no relay, no third-party API.

## Requirements
- A server with **outbound port 25 open** (e.g. Webdock, Hetzner with port 25 unblocked)
- Python 3.10+

## Deploy

```bash
sudo apt update && sudo apt install -y python3 python3-venv python3-pip git
git clone https://github.com/Vivek-Shri/Email-Verifier.git
cd Email-Verifier/email_verifier
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000
```

## Config
SMTP settings are environment-driven (`config.py`). Defaults: direct-MX mode
(`SMTP_RELAY_USE=false`). Override via env vars if needed:
- `SMTP_HELO_DOMAIN`, `SMTP_FROM_EMAIL`
- `SMTP_RELAY_USE`, `SMTP_RELAY_HOST`, `SMTP_RELAY_USER`, `SMTP_RELAY_KEY`

## Test
```
GET http://SERVER_IP:8000/api/v1/verify/single?email=someone@example.com
```
Returns JSON with `status` (valid / invalid / catch_all / ...), `is_deliverable`,
`overall_score`, and supporting signals.
