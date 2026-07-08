const API_BASE = "http://92.113.151.55:8000";

const STATUS_META = {
    safe: {
        icon: "✓",
        description: "This email address exists, is active and can safely receive emails. Low bounce risk.",
        class: "safe"
    },
    invalid: {
        icon: "✗",
        description: "This email address is invalid or does not exist. Do not send to this address.",
        class: "invalid"
    },
    disposable: {
        icon: "⚠",
        description: "Temporary email address from a disposable email service provider. They may expire soon and the user may never check them again. Not recommended.",
        class: "disposable"
    },
    catch_all: {
        icon: "~",
        description: "This domain accepts all email addresses, so we cannot verify if this specific mailbox exists. It may or may not be deliverable.",
        class: "catch_all"
    },
    role_account: {
        icon: "👤",
        description: "This is a role-based email address (e.g. info@, support@). It is not tied to a specific person and may have low engagement.",
        class: "role_account"
    },
    spamtrap: {
        icon: "🪤",
        description: "This email address is identified as a spam trap or honeypot. Sending to it may harm your sender reputation.",
        class: "spamtrap"
    },
    inbox_full: {
        icon: "📥",
        description: "The mailbox is full and cannot accept new messages. Try again later.",
        class: "inbox_full"
    },
    disabled: {
        icon: "🚫",
        description: "This mailbox is disabled or no longer active. Do not send to this address.",
        class: "disabled"
    },
    temporary_failure: {
        icon: "⏳",
        description: "The mail server is temporarily unavailable or experiencing issues. Try again later.",
        class: "temporary_failure"
    },
    blocked: {
        icon: "🔒",
        description: "Connection to the mail server was blocked or refused. This may be due to network restrictions or server configuration.",
        class: "blocked"
    },
    unknown: {
        icon: "?",
        description: "The verification result is unknown. The server may not have responded or the domain may not exist.",
        class: "unknown"
    }
};

function getScoreClass(score) {
    if (score === null || score === undefined) return "null";
    if (score >= 80) return "high";
    if (score >= 50) return "medium";
    return "low";
}

function renderResult(data) {
    const meta = STATUS_META[data.status] || STATUS_META.unknown;
    const score = data.overall_score;

    document.getElementById("resultStatus").textContent = meta.icon + " " + data.status;
    document.getElementById("resultStatusText").textContent = data.status;
    document.getElementById("resultDescription").textContent = meta.description;

    const scoreEl = document.getElementById("resultScore");
    scoreEl.textContent = score === null ? "N/A" : score + "/100";
    scoreEl.className = "score-badge " + getScoreClass(score);

    const safeEl = document.getElementById("resultSafe");
    safeEl.textContent = data.is_safe_to_send ? "Safe to Send" : "Not Safe";
    safeEl.className = "safe-badge " + (data.is_safe_to_send ? "true" : "false");

    const card = document.getElementById("resultCard");
    card.className = "result-card";
    const iconEl = document.getElementById("resultIcon");
    iconEl.className = "result-icon " + meta.class;
    iconEl.textContent = meta.icon;

    const fields = [
        ["can_connect_smtp", "val_can_connect_smtp"],
        ["mx_accepts_mail", "val_mx_accepts_mail"],
        ["mx_records", "val_mx_records"],
        ["has_inbox_full", "val_has_inbox_full"],
        ["is_disabled", "val_is_disabled"],
        ["is_deliverable", "val_is_deliverable"],
        ["is_role_account", "val_is_role_account"],
        ["is_catch_all", "val_is_catch_all"],
        ["is_disposable", "val_is_disposable"],
        ["is_spamtrap", "val_is_spamtrap"],
        ["is_valid_syntax", "val_is_valid_syntax"],
        ["is_safe_to_send", "val_is_safe_to_send"],
    ];

    fields.forEach(([key, id]) => {
        const el = document.getElementById(id);
        let val = data[key];
        if (val === null || val === undefined) val = "null";
        else if (typeof val === "boolean") val = val.toString();
        el.textContent = val;
        el.className = "value " + (typeof val === "boolean" ? val.toString() : "");
    });

    document.getElementById("resultArea").classList.remove("hidden");
    document.getElementById("errorArea").classList.add("hidden");
}

function showError(message) {
    document.getElementById("errorText").textContent = message;
    document.getElementById("errorArea").classList.remove("hidden");
    document.getElementById("resultArea").classList.add("hidden");
}

function setLoading(loading) {
    const btn = document.getElementById("verifyBtn");
    const btnText = document.getElementById("btnText");
    const btnLoader = document.getElementById("btnLoader");

    btn.disabled = loading;
    btnText.classList.toggle("hidden", loading);
    btnLoader.classList.toggle("hidden", !loading);
}

async function verifyEmail(email) {
    setLoading(true);
    document.getElementById("resultArea").classList.add("hidden");
    document.getElementById("errorArea").classList.add("hidden");

    try {
        const resp = await fetch(`${API_BASE}/api/v1/verify/single?email=${encodeURIComponent(email)}`);
        if (!resp.ok) {
            const text = await resp.text();
            throw new Error(`Server error: ${resp.status} - ${text}`);
        }
        const data = await resp.json();
        renderResult(data);
    } catch (err) {
        showError(err.message || "Verification failed. Please try again.");
    } finally {
        setLoading(false);
    }
}

document.getElementById("verifyForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("emailInput").value.trim();
    if (!email) return;
    verifyEmail(email);
});
