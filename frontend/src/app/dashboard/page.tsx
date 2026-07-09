"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  CheckCircle,
  FileJson,
  Loader2,
  Mail,
  Trash2,
  UploadCloud,
  XCircle,
  Zap,
} from "lucide-react";
import { API_BASE } from "@/lib/api";

type RemoteHealth = {
  status: string;
  version: string;
  timestamp: string;
};

type VerificationResult = {
  input: string;
  email: string;
  username: string;
  domain: string;
  status: string;
  overall_score: number | null;
  is_safe_to_send: boolean;
  is_valid_syntax: boolean;
  is_disposable: boolean;
  is_role_account: boolean;
  mx_accepts_mail: boolean;
  mx_records: string;
  can_connect_smtp: boolean;
  has_inbox_full: boolean;
  is_catch_all: boolean;
  is_deliverable: boolean;
  is_disabled: boolean;
  is_spamtrap: boolean;
  is_free_email: boolean;
  is_gibberish: boolean;
  gibberish_score: number;
  verification_time_ms: number;
  checked_at: string;
  error_note?: string | null;
};

export default function Dashboard() {
  const router = useRouter();
  const [health, setHealth] = useState<RemoteHealth | null>(null);
  const [loadingHealth, setLoadingHealth] = useState(true);
  const [singleEmail, setSingleEmail] = useState("");
  const [singleResult, setSingleResult] = useState<VerificationResult | null>(null);
  const [singleLoading, setSingleLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState<VerificationResult[]>([]);
  const [errorMSG, setErrorMSG] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const demoUser = sessionStorage.getItem("verifier_demo_user");
    if (!demoUser) {
      router.replace("/login");
      return;
    }

    loadHealth();
  }, [router]);

  const loadHealth = async () => {
    try {
      setLoadingHealth(true);
      const res = await fetch(`${API_BASE}/health`);
      if (res.ok) {
        setHealth(await res.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingHealth(false);
    }
  };

  const verifySingle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!singleEmail.trim()) return;

    setSingleLoading(true);
    setErrorMSG("");

    try {
      const res = await fetch(`${API_BASE}/verify/single`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: singleEmail.trim() }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.detail || "Verification failed");
      }

      setSingleResult(await res.json());
    } catch (err: any) {
      setErrorMSG(err.message || "An error occurred during verification.");
    } finally {
      setSingleLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type === "application/json" || selectedFile.name.endsWith(".json")) {
        setFile(selectedFile);
        setErrorMSG("");
      } else {
        setFile(null);
        setErrorMSG("Please select a JSON file only.");
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const selectedFile = e.dataTransfer.files[0];
      if (selectedFile.type === "application/json" || selectedFile.name.endsWith(".json")) {
        setFile(selectedFile);
        setErrorMSG("");
      } else {
        setFile(null);
        setErrorMSG("Please select a JSON file only.");
      }
    }
  };

  const handleProcess = async () => {
    if (!file) return;

    setUploading(true);
    setResults([]);
    setErrorMSG("");

    try {
      const raw = await file.text();
      const parsed = JSON.parse(raw);
      const emails = Array.isArray(parsed) ? parsed : Array.isArray(parsed?.emails) ? parsed.emails : null;

      if (!emails || emails.length === 0) {
        throw new Error('Invalid JSON format. Expected an array of emails or { "emails": [...] }.');
      }

      const res = await fetch(`${API_BASE}/verify/bulk`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task_name: file.name, emails }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.error || errorData?.detail || "Upload failed");
      }

      const data = await res.json();
      setResults(data.results || []);
    } catch (err: any) {
      setErrorMSG(err.message || "An error occurred during verification.");
    } finally {
      setUploading(false);
    }
  };

  const downloadVerificationResults = () => {
    const payload = {
      exported_at: new Date().toISOString(),
      single_result: singleResult,
      bulk_results: results,
      total_results: results.length + (singleResult ? 1 : 0),
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `verification-results-${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const clearFile = () => {
    setFile(null);
    setResults([]);
    setErrorMSG("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const getStatusBadge = (status: string, score?: number | null) => {
    if (status === "safe") {
      const scoreValue = typeof score === "number" ? score : null;

      if (scoreValue !== null && scoreValue < 50) {
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800">
            <AlertTriangle className="w-3.5 h-3.5" /> Risk
          </span>
        );
      }

      if (scoreValue !== null && scoreValue < 75) {
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800">
            <AlertTriangle className="w-3.5 h-3.5" /> Warning
          </span>
        );
      }

      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800">
          <CheckCircle className="w-3.5 h-3.5" /> Safe
        </span>
      );
    }

    switch (status) {
      case "valid":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800">
            <CheckCircle className="w-3.5 h-3.5" /> Valid
          </span>
        );
      case "catch_all":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
            <AlertTriangle className="w-3.5 h-3.5" /> Catch-All
          </span>
        );
      case "role_based":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 border border-purple-200 dark:border-purple-800">
            <Mail className="w-3.5 h-3.5" /> Role-Based
          </span>
        );
      case "inbox_full":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 border border-orange-200 dark:border-orange-800">
            <AlertTriangle className="w-3.5 h-3.5" /> Inbox Full
          </span>
        );
      case "temporary_failure":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Retry
          </span>
        );
      case "blocked":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-900 text-white dark:bg-slate-800 dark:text-slate-300 border border-slate-700">
            <AlertTriangle className="w-3.5 h-3.5" /> Blocked
          </span>
        );
      case "invalid":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800">
            <XCircle className="w-3.5 h-3.5" /> Invalid
          </span>
        );
      case "disposable":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 border border-orange-200 dark:border-orange-800">
            <Trash2 className="w-3.5 h-3.5" /> Disposable
          </span>
        );
      case "disabled":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800">
            <XCircle className="w-3.5 h-3.5" /> Disabled
          </span>
        );
      case "unknown":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400 border border-gray-200 dark:border-gray-700">
            <Loader2 className="w-3.5 h-3.5" /> Unknown
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800">
            <AlertTriangle className="w-3.5 h-3.5" /> {status}
          </span>
        );
    }
  };

  const formatBoolean = (value: boolean) => (
    <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-widest ${value ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}>
      {value ? "yes" : "no"}
    </span>
  );

  const analysisItems = singleResult
    ? [
        { label: "Overall score", value: singleResult.overall_score ?? "n/a" },
        { label: "Status", value: singleResult.status },
        { label: "Safe to send", value: singleResult.is_safe_to_send ? "Yes" : "No" },
        { label: "Valid syntax", value: singleResult.is_valid_syntax ? "Yes" : "No" },
        { label: "Disposable", value: singleResult.is_disposable ? "Yes" : "No" },
        { label: "Role account", value: singleResult.is_role_account ? "Yes" : "No" },
        { label: "Catch-all", value: singleResult.is_catch_all ? "Yes" : "No" },
        { label: "Free email", value: singleResult.is_free_email ? "Yes" : "No" },
        { label: "SMTP connect", value: singleResult.can_connect_smtp ? "Yes" : "No" },
        { label: "MX found", value: singleResult.mx_accepts_mail ? "Yes" : "No" },
        { label: "Inbox full", value: singleResult.has_inbox_full ? "Yes" : "No" },
        { label: "Disabled", value: singleResult.is_disabled ? "Yes" : "No" },
        { label: "Spamtrap", value: singleResult.is_spamtrap ? "Yes" : "No" },
        { label: "Gibberish", value: singleResult.is_gibberish ? "Yes" : "No" },
        { label: "Latency", value: `${singleResult.verification_time_ms} ms` },
      ]
    : [];

  const statusTone = singleResult
    ? singleResult.status === "valid"
      ? "text-green-600"
      : singleResult.status === "catch_all" || singleResult.status === "role_based"
        ? "text-amber-600"
        : "text-red-600"
    : "text-slate-500";

  const getVerdictCopy = (result: VerificationResult) => {
    if (result.status === "valid") {
      return {
        tone: "border-green-200 bg-green-50 text-green-700 dark:border-green-900/30 dark:bg-green-900/10 dark:text-green-200",
        label: "Deliverability looks strong",
      };
    }

    if (result.status === "catch_all") {
      return {
        tone: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/30 dark:bg-amber-900/10 dark:text-amber-200",
        label: "Deliverability is uncertain",
      };
    }

    if (result.status === "role_based") {
      return {
        tone: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/30 dark:bg-amber-900/10 dark:text-amber-200",
        label: "Role inbox detected",
      };
    }

    if (result.is_disposable) {
      return {
        tone: "border-red-200 bg-red-50 text-red-700 dark:border-red-900/30 dark:bg-red-900/10 dark:text-red-200",
        label: "Disposable mailbox",
      };
    }

    if (result.is_disabled) {
      return {
        tone: "border-red-200 bg-red-50 text-red-700 dark:border-red-900/30 dark:bg-red-900/10 dark:text-red-200",
        label: "Mailbox unavailable",
      };
    }

    if (result.has_inbox_full) {
      return {
        tone: "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-900/30 dark:bg-orange-900/10 dark:text-orange-200",
        label: "Inbox pressure detected",
      };
    }

    return {
      tone: "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-900/20 dark:text-slate-200",
      label: "Verification finished",
    };
  };

  const getBulkSummary = (result: VerificationResult) => {
    if (result.status === "catch_all") {
      return "The domain accepts mail broadly, so certainty is lower.";
    }

    return "";
  };

  if (loadingHealth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <header className="bg-white/80 dark:bg-card-bg/80 backdrop-blur-md border-b border-border-color sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary/20 text-primary p-2 rounded-xl">
              <Zap className="w-5 h-5 fill-primary" />
            </div>
            <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500">
              Verifier Console
            </span>
          </div>

          <div className="hidden sm:block text-sm text-right">
            <p className="font-bold text-foreground capitalize">{health?.status || "offline"}</p>
            <p className="text-slate-500 text-xs font-medium">v{health?.version || "unknown"}</p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <section className="surface rounded-[2rem] px-6 py-6 md:px-8 md:py-8 mb-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.28em] text-slate-400">Remote verifier workspace</p>
              <h1 className="display-font mt-3 text-3xl md:text-4xl font-black tracking-tight">Single checks, bulk jobs, and live result review in one console.</h1>
              <p className="mt-3 max-w-2xl text-sm md:text-base text-slate-500 dark:text-slate-300">
                This interface is wired to the deployed verifier API and is structured for fast demo flows, clear response states, and presentation-quality visuals.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 lg:w-[42rem]">
              {[
                ["Health", health?.status || "offline"],
                ["Version", health?.version || "n/a"],
                ["Latency", singleResult?.verification_time_ms ? `${singleResult.verification_time_ms} ms` : "live"],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl border border-border-color bg-white/70 dark:bg-slate-950/25 px-4 py-3">
                  <p className="text-[10px] font-black uppercase tracking-[0.28em] text-slate-400">{label}</p>
                  <p className="mt-2 text-sm font-bold capitalize">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white dark:bg-card-bg rounded-2xl border border-border-color p-8 shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -mr-10 -mt-10 blur-3xl group-hover:bg-primary/10 transition-colors"></div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 relative z-10">API Status</h3>
              <div className="relative z-10">
                <div className="flex items-end gap-2 mb-2">
                  <span className="text-4xl font-black tracking-tighter capitalize">{health?.status || "unknown"}</span>
                </div>
                <p className="text-sm text-slate-500 font-medium">Version {health?.version || "n/a"}</p>
                <p className="text-xs text-slate-400 mt-3 break-all">{health?.timestamp || "Waiting for server response"}</p>
              </div>
            </div>

            <div className="bg-white dark:bg-card-bg rounded-2xl border border-border-color p-8 shadow-xl transition-all duration-300 hover:shadow-2xl">
              <h2 className="text-2xl font-black mb-2 tracking-tight">Single Verify</h2>
              <p className="text-sm text-slate-500 mb-8 font-medium">Send one email to the remote verifier API.</p>

              <form onSubmit={verifySingle} className="space-y-4">
                <input
                  type="email"
                  value={singleEmail}
                  onChange={(e) => setSingleEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-border-color rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-shadow outline-none text-sm"
                  required
                />
                <button
                  type="submit"
                  disabled={singleLoading || !singleEmail.trim()}
                  className="w-full flex items-center justify-center gap-3 bg-foreground text-background py-4 px-6 rounded-2xl font-black text-lg transition-all hover:bg-primary hover:text-white disabled:opacity-50 disabled:bg-slate-200 dark:disabled:bg-slate-800 shadow-xl hover:shadow-primary/30 active:scale-95 duration-200"
                >
                  {singleLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <>VERIFY EMAIL</>}
                </button>
              </form>
            </div>

            <div className="bg-white dark:bg-card-bg rounded-2xl border border-border-color p-8 shadow-xl transition-all duration-300 hover:shadow-2xl">
              <h2 className="text-2xl font-black mb-2 tracking-tight">Bulk Verify</h2>
              <p className="text-sm text-slate-500 mb-8 font-medium">Upload a JSON array or an object with an <span className="font-bold">emails</span> field.</p>

              {!file ? (
                <div
                  className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-10 text-center hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-all cursor-pointer group hover:border-primary/50"
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 border border-border-color">
                    <UploadCloud className="w-8 h-8 text-slate-400 group-hover:text-primary transition-colors" />
                  </div>
                  <p className="text-sm font-bold mb-1 text-foreground">Drop JSON here</p>
                  <p className="text-xs text-slate-400 font-medium">Supports arrays or {`{ emails: [...] }`} payloads</p>
                  <input
                    type="file"
                    accept=".json,application/json"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                  />
                </div>
              ) : (
                <div className="border border-primary/20 bg-primary/5 rounded-2xl p-5 flex items-center justify-between animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="flex items-center gap-4 overflow-hidden">
                    <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <FileJson className="w-6 h-6 text-primary" />
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-sm font-bold truncate text-foreground">{file.name}</p>
                      <p className="text-xs text-slate-500 font-bold">{(file.size / 1024).toFixed(1)} KB</p>
                    </div>
                  </div>
                  <button
                    onClick={clearFile}
                    className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-white dark:hover:bg-red-900/20 rounded-xl transition-all duration-200"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              )}

              {errorMSG && (
                <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-200 dark:border-red-900/30">
                  <p className="text-sm text-red-600 dark:text-red-400 font-bold flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 flex-shrink-0" /> {errorMSG}
                  </p>
                </div>
              )}

              <button
                onClick={handleProcess}
                disabled={!file || uploading}
                className="w-full mt-8 flex items-center justify-center gap-3 bg-foreground text-background py-4 px-6 rounded-2xl font-black text-lg transition-all hover:bg-primary hover:text-white disabled:opacity-50 disabled:bg-slate-200 dark:disabled:bg-slate-800 shadow-xl hover:shadow-primary/30 active:scale-95 duration-200"
              >
                {uploading ? (
                  <><Loader2 className="w-6 h-6 animate-spin" /> ANALYZING...</>
                ) : (
                  <>START VERIFICATION</>
                )}
              </button>
            </div>
          </div>

          <div className="lg:col-span-8">
            <div className="bg-white dark:bg-card-bg rounded-2xl border border-border-color shadow-xl overflow-hidden flex flex-col h-full min-h-[600px]">
              <div className="p-8 border-b border-border-color bg-slate-50/50 dark:bg-slate-900/20 flex justify-between items-center backdrop-blur-sm sticky top-0 z-20">
                <div>
                  <h2 className="text-2xl font-black flex items-center gap-3 tracking-tight">
                    <Mail className="w-7 h-7 text-primary" /> Verification Results
                  </h2>
                  <p className="text-sm text-slate-400 font-bold mt-1 uppercase tracking-widest">Remote API responses</p>
                </div>
                <div className="flex items-center gap-2">
                  {(results.length > 0 || singleResult) && (
                    <button
                      type="button"
                      onClick={downloadVerificationResults}
                      className="inline-flex items-center gap-2 rounded-full border border-border-color bg-white/80 dark:bg-white/5 px-4 py-2 text-xs font-black uppercase tracking-[0.24em] text-slate-600 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                    >
                      <FileJson className="w-4 h-4" /> Download JSON
                    </button>
                  )}
                  {results.length > 0 && (
                    <span className="text-xs font-black bg-slate-900 text-white dark:bg-white dark:text-black px-4 py-2 rounded-full uppercase tracking-tighter shadow-lg">
                      {results.length} RESULTS
                    </span>
                  )}
                </div>
              </div>

              <div className="flex-1 overflow-auto">
                {singleResult && (
                  <div className="p-4 sm:p-6 border-b border-border-color bg-gradient-to-b from-slate-50/70 to-transparent dark:from-slate-900/20">
                    <div className="rounded-[1.75rem] border border-border-color bg-white/90 dark:bg-slate-950/30 p-5 sm:p-6 shadow-sm">
                      {(() => {
                        const verdict = getVerdictCopy(singleResult);

                        return (
                      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                        <div className="min-w-0">
                          <p className="text-xs uppercase tracking-widest text-slate-400 font-black">Latest single result</p>
                          <p className="mt-1 text-xl sm:text-2xl font-black break-all leading-tight">{singleResult.email}</p>
                          <div className={`mt-4 rounded-2xl border px-4 py-4 text-sm font-semibold leading-relaxed ${verdict.tone}`}>
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                              <p className="text-base font-black tracking-tight">{verdict.label}</p>
                              <span className="text-[10px] font-black uppercase tracking-[0.28em] opacity-75">Deliverability verdict</span>
                            </div>
                          </div>
                        </div>
                        {getStatusBadge(singleResult.status, singleResult.overall_score)}
                      </div>
                        );
                      })()}

                      <div className="mt-5">
                        <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400 mb-3">Verification snapshot</p>
                        <div className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-4">
                          <div className="rounded-2xl bg-slate-50 px-3 py-3 dark:bg-slate-950/20">
                            <p className="text-slate-400 font-bold uppercase tracking-widest">Score</p>
                            <p className="mt-2 text-lg font-black text-foreground">{singleResult.overall_score ?? "n/a"}</p>
                          </div>
                          <div className="rounded-2xl bg-slate-50 px-3 py-3 dark:bg-slate-950/20">
                            <p className="text-slate-400 font-bold uppercase tracking-widest">Latency</p>
                            <p className="mt-2 text-lg font-black text-foreground">{singleResult.verification_time_ms}ms</p>
                          </div>
                          <div className="rounded-2xl bg-slate-50 px-3 py-3 dark:bg-slate-950/20">
                            <p className="text-slate-400 font-bold uppercase tracking-widest">Domain</p>
                            <p className="mt-2 text-sm font-black text-foreground break-all">{singleResult.domain}</p>
                          </div>
                          <div className="rounded-2xl bg-slate-50 px-3 py-3 dark:bg-slate-950/20">
                            <p className="text-slate-400 font-bold uppercase tracking-widest">User</p>
                            <p className="mt-2 text-sm font-black text-foreground break-all">{singleResult.username || "n/a"}</p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-5 grid gap-3 sm:grid-cols-2">
                        {analysisItems.map((item) => (
                          <div key={item.label} className="rounded-2xl border border-border-color bg-white/80 px-4 py-3 dark:bg-white/5">
                            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">{item.label}</p>
                            <p className="mt-2 text-sm font-semibold text-foreground break-words">{String(item.value)}</p>
                          </div>
                        ))}
                      </div>

                      <div className="mt-5 grid gap-3 sm:grid-cols-2">
                        <div className="rounded-2xl border border-border-color bg-white/80 px-4 py-3 dark:bg-white/5">
                          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">MX records</p>
                          <p className="mt-2 text-sm font-semibold text-foreground break-all">{singleResult.mx_records || "n/a"}</p>
                        </div>
                        <div className="rounded-2xl border border-border-color bg-white/80 px-4 py-3 dark:bg-white/5">
                          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">Checked at</p>
                          <p className="mt-2 text-sm font-semibold text-foreground break-all">{singleResult.checked_at}</p>
                        </div>
                      </div>

                      {singleResult.error_note && (
                        <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900/30 dark:bg-amber-900/10 dark:text-amber-200">
                          <p className="text-[10px] font-black uppercase tracking-[0.24em] mb-1">Analysis note</p>
                          {singleResult.error_note}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {results.length === 0 && !singleResult ? (
                  <div className="h-full flex flex-col items-center justify-center p-20 text-center group">
                    <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 border border-border-color shadow-inner">
                      <Zap className="w-12 h-12 text-slate-200 dark:text-slate-700" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-400">Awaiting Input</h3>
                    <p className="text-sm text-slate-500 max-w-xs mt-2 font-medium">Verify one email or upload a JSON list to start the remote engine.</p>
                  </div>
                ) : (
                  <div className="p-4 sm:p-6 space-y-4">
                    {results.map((result, index) => (
                      <div key={`${result.email}-${index}`} className="rounded-[1.75rem] border border-border-color bg-slate-50/70 dark:bg-slate-900/30 p-5 shadow-sm">
                        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-3">
                              <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-black text-slate-400 uppercase shrink-0">
                                {result.email.slice(0, 2)}
                              </div>
                              <div className="min-w-0">
                                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">Verification list item</p>
                                <h3 className="mt-1 font-black text-lg text-foreground break-all" title={result.email}>
                                  {result.input || result.email}
                                </h3>
                              </div>
                            </div>
                            {getBulkSummary(result) && (
                              <p className={`mt-3 text-sm font-semibold ${result.status === "catch_all" ? "text-amber-600" : "text-slate-500"}`}>
                                {getBulkSummary(result)}
                              </p>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            {getStatusBadge(result.status, result.overall_score)}
                            <span className="rounded-full border border-border-color bg-white/80 dark:bg-white/5 px-3 py-1 text-[10px] font-black uppercase tracking-[0.24em] text-slate-500">
                              {result.verification_time_ms} ms
                            </span>
                          </div>
                        </div>

                        <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4 xl:grid-cols-6 text-xs">
                          <div className="rounded-2xl bg-white/80 px-3 py-3 dark:bg-white/5">
                            <p className="text-slate-400 font-bold uppercase tracking-widest">Score</p>
                            <p className="mt-2 text-sm font-black text-foreground">{result.overall_score ?? "n/a"}</p>
                          </div>
                          <div className="rounded-2xl bg-white/80 px-3 py-3 dark:bg-white/5">
                            <p className="text-slate-400 font-bold uppercase tracking-widest">Safe</p>
                            <p className="mt-2 text-sm font-black text-foreground">{result.is_safe_to_send ? "yes" : "no"}</p>
                          </div>
                          <div className="rounded-2xl bg-white/80 px-3 py-3 dark:bg-white/5">
                            <p className="text-slate-400 font-bold uppercase tracking-widest">Syntax</p>
                            <p className="mt-2 text-sm font-black text-foreground">{result.is_valid_syntax ? "valid" : "invalid"}</p>
                          </div>
                          <div className="rounded-2xl bg-white/80 px-3 py-3 dark:bg-white/5">
                            <p className="text-slate-400 font-bold uppercase tracking-widest">Domain</p>
                            <p className="mt-2 text-sm font-black text-foreground break-all">{result.domain || "n/a"}</p>
                          </div>
                          <div className="rounded-2xl bg-white/80 px-3 py-3 dark:bg-white/5">
                            <p className="text-slate-400 font-bold uppercase tracking-widest">User</p>
                            <p className="mt-2 text-sm font-black text-foreground break-all">{result.username || "n/a"}</p>
                          </div>
                          <div className="rounded-2xl bg-white/80 px-3 py-3 dark:bg-white/5">
                            <p className="text-slate-400 font-bold uppercase tracking-widest">Checked</p>
                            <p className="mt-2 text-sm font-black text-foreground break-all">{result.checked_at || "n/a"}</p>
                          </div>
                        </div>

                        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                          {[
                            ["Disposable", result.is_disposable],
                            ["Role account", result.is_role_account],
                            ["Catch-all", result.is_catch_all],
                            ["Free email", result.is_free_email],
                            ["SMTP connect", result.can_connect_smtp],
                            ["MX accepts", result.mx_accepts_mail],
                            ["Inbox full", result.has_inbox_full],
                            ["Disabled", result.is_disabled],
                            ["Spamtrap", result.is_spamtrap],
                            ["Gibberish", result.is_gibberish],
                          ].map(([label, value]) => (
                            <div key={String(label)} className="rounded-2xl border border-border-color bg-white/70 px-4 py-3 dark:bg-white/5">
                              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">{label}</p>
                              <p className="mt-2 text-sm font-semibold text-foreground">{value ? "yes" : "no"}</p>
                            </div>
                          ))}
                        </div>

                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                          <div className="rounded-2xl border border-border-color bg-white/70 px-4 py-3 dark:bg-white/5">
                            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">MX records</p>
                            <p className="mt-2 text-sm font-semibold text-foreground break-all">{result.mx_records || "n/a"}</p>
                          </div>
                          {result.error_note && (
                            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900/30 dark:bg-amber-900/10 dark:text-amber-200">
                              <p className="text-[10px] font-black uppercase tracking-[0.24em] mb-1">Analysis note</p>
                              {result.error_note}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {results.length > 0 && (
                <div className="p-4 border-t border-border-color bg-slate-50/30 dark:bg-slate-900/30 flex items-center justify-between">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Remote verifier API</p>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">Connected</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}