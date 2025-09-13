'''Python code to write automatic readme.md'''
import os, re, json, random, time, hashlib, requests, subprocess, smtplib
from email.mime.text import MIMEText
from datetime import datetime
from pathlib import Path

try:
    from zoneinfo import ZoneInfo
except Exception:
    ZoneInfo = None

# --- Ayarlar ---
README = Path("README.md")
STATE  = Path(".github/scripts/_auto_state.json")
PAUSE_FLAG = Path(".github/scripts/_paused")  # varsa script durur

CATEGORIES = ["Feature", "Tip", "Status", "Next"]
PER_CAT_KEEP = 16            # her kategori altında tutulacak max madde
MAX_TOTAL_LINES = 120        # tüm kategoriler toplamı bu sayıyı aşarsa durdur
COMMITS_PER_RUN = (1, 3)     # 1–3 arası
CONTEXT_DIRS = ["src", "client", "server", "backend", "frontend", "docs"]

LLM_API_URL = os.environ.get("LLM_API_URL", "").rstrip("/")
LLM_API_KEY = os.environ.get("LLM_API_KEY", "")
LLM_MODEL   = os.environ.get("LLM_MODEL", "gpt-4o-mini")

SMTP_HOST = os.environ.get("SMTP_HOST", "")
SMTP_PORT = int(os.environ.get("SMTP_PORT", "0") or 0)
SMTP_USERNAME = os.environ.get("SMTP_USERNAME", "")
SMTP_PASSWORD = os.environ.get("SMTP_PASSWORD", "")
MAIL_TO = os.environ.get("MAIL_TO", "")
MAIL_FROM = os.environ.get("MAIL_FROM", "")

# --- Regexler / Şablon ---
AUTO_WRAPPER_RE = re.compile(r"(<!-- AUTO-UPDATED:START -->)(.*?)(<!-- AUTO-UPDATED:END -->)", re.S)

SECTION_PATTERNS = {
    "Feature": re.compile(r"(### Feature\s*\n)(.*?)(?=\n### Tip|\n### Status|\n### Next|<!-- AUTO-UPDATED:END -->)", re.S),
    "Tip":     re.compile(r"(### Tip\s*\n)(.*?)(?=\n### Feature|\n### Status|\n### Next|<!-- AUTO-UPDATED:END -->)", re.S),
    "Status":  re.compile(r"(### Status\s*\n)(.*?)(?=\n### Feature|\n### Tip|\n### Next|<!-- AUTO-UPDATED:END -->)", re.S),
    "Next":    re.compile(r"(### Next\s*\n)(.*?)(?=\n### Feature|\n### Tip|\n### Status|<!-- AUTO-UPDATED:END -->)", re.S),
}

SKELETON = (
    "<!-- AUTO-UPDATED:START -->\n"
    "### Feature\n\n"
    "### Tip\n\n"
    "### Status\n\n"
    "### Next\n"
    "<!-- AUTO-UPDATED:END -->"
)

SYSTEM = (
    "You are an assistant that writes short, meaningful, English bullets for a video calling repo. "
    "Project uses Stream, WebRTC, JWT auth, React/Express/MongoDB/Tailwind/TanStack Query, Zustand. "
    "Categories must rotate in order: Feature -> Tip -> Status -> Next, then repeat. "
    "Each bullet <= 140 chars, clear and specific, no code fences, no emojis."
)

USER_TMPL = """Context (trimmed):
{ctx}

Continue category cycle from: {next_cat}

Output EXACTLY {n} lines with this shape (no extra text):
- [#{seq}] {Category}: {text}
"""

# --- Yardımcılar ---
def now_tr():
    if ZoneInfo: return datetime.now(ZoneInfo("Europe/Istanbul"))
    return datetime.now()

def read_state():
    if STATE.exists():
        try:
            return json.loads(STATE.read_text(encoding="utf-8"))
        except Exception:
            pass
    return {"seq": 0, "last_cat": None, "recent_hashes": []}

def write_state(st):
    STATE.parent.mkdir(parents=True, exist_ok=True)
    STATE.write_text(json.dumps(st, ensure_ascii=False, indent=2), encoding="utf-8")

def collect_context():
    ctx = []
    # README'den ilk ~128KB
    if README.exists():
        data = README.read_bytes()[:128*1024].decode("utf-8", errors="ignore")
        ctx.append(("README.md", data))
    # kaynaktan kısa parçalar
    for folder in CONTEXT_DIRS:
        d = Path(folder)
        if not d.exists() or not d.is_dir(): continue
        for f in sorted(d.rglob("*")):
            if f.is_file() and f.suffix.lower() in [".md", ".js", ".ts", ".tsx", ".py", ".json"]:
                data = f.read_bytes()[:24*1024].decode("utf-8", errors="ignore")
                if data.strip():
                    ctx.append((str(f), data))
            if len(ctx) > 12: break
    parts = [f"## {name}\n{content}\n" for name, content in ctx if content.strip()]
    return "\n".join(parts)[:4000]

def ensure_block(body: str) -> str:
    if "<!-- AUTO-UPDATED:START -->" in body and "<!-- AUTO-UPDATED:END -->" in body:
        return body
    base = body if body else "# Auto Updates\n\n"
    if not base.endswith("\n"): base += "\n"
    return base + "\n" + SKELETON + "\n"

def read_readme() -> str:
    return README.read_text(encoding="utf-8") if README.exists() else ""

def write_readme(txt: str):
    README.write_text(txt, encoding="utf-8")

def get_section_lines(section_text: str):
    return [l.rstrip() for l in section_text.strip().splitlines() if l.strip()]

def set_section(body_inside: str, category: str, new_lines: list) -> str:
    pat = SECTION_PATTERNS[category]
    m = pat.search(body_inside)
    if not m:
        body_inside = body_inside.rstrip() + f"\n\n### {category}\n" + "\n".join(new_lines) + "\n"
        return body_inside
    start_hdr, _cur = m.group(1), m.group(2)
    updated = start_hdr + ("\n".join(new_lines) + ("\n" if new_lines else ""))
    return body_inside[:m.start()] + updated + body_inside[m.end():]

def update_category(category: str, bullet: str):
    body = read_readme()
    body = ensure_block(body)
    m = AUTO_WRAPPER_RE.search(body)
    before, middle, after = body[:m.start(2)], m.group(2), body[m.end(2):]

    # mevcut kategori satırları
    sec = SECTION_PATTERNS[category].search(middle)
    cur_lines = get_section_lines(sec.group(2)) if sec else []

    # toplam sınırı kontrol (tüm kategoriler)
    total = sum(len(get_section_lines(SECTION_PATTERNS[c].search(middle).group(2)) if SECTION_PATTERNS[c].search(middle) else []) for c in CATEGORIES)
    if total >= MAX_TOTAL_LINES:
        raise RuntimeError(f"Reached max total lines ({MAX_TOTAL_LINES}).")

    # tekrar kontrolü (hash)
    st = read_state()
    h = hashlib.sha1(bullet.encode("utf-8")).hexdigest()
    if h in st["recent_hashes"]:
        return False  # aynı satırı yazmayalım
    st["recent_hashes"].append(h)
    if len(st["recent_hashes"]) > 120:
        st["recent_hashes"] = st["recent_hashes"][-120:]
    write_state(st)

    # ekle ve kısalt
    cur_lines.append(bullet)
    cur_lines = cur_lines[-PER_CAT_KEEP:]
    middle = set_section(middle, category, cur_lines)

    write_readme(before + middle + after)
    return True

def cycle_next(last):
    if last in CATEGORIES:
        return CATEGORIES[(CATEGORIES.index(last)+1) % len(CATEGORIES)]
    return CATEGORIES[0]

def llm_lines(n: int, next_cat: str, seq_start: int, recent_hashes: list):
    ctx = collect_context()
    payload = {
        "model": LLM_MODEL,
        "temperature": 0.7,
        "messages": [
            {"role":"system","content": SYSTEM},
            {"role":"user","content": USER_TMPL.format(ctx=ctx, n=n, next_cat=next_cat, seq=seq_start)}
        ]
    }
    headers = {"Authorization": f"Bearer {LLM_API_KEY}", "Content-Type": "application/json"}
    resp = requests.post(f"{LLM_API_URL}/chat/completions", headers=headers, json=payload, timeout=70)
    resp.raise_for_status()
    text = resp.json()["choices"][0]["message"]["content"].strip()
    # sadece "- [#...]" başlayan satırları al
    lines = [ln.strip() for ln in text.splitlines() if ln.strip().startswith("- [#")]
    # tekrarı filtrele (format hash değil, tam satır hash’i)
    out = []
    for ln in lines:
        h = hashlib.sha1(ln.encode("utf-8")).hexdigest()
        if h not in recent_hashes:
            out.append(ln)
            recent_hashes.append(h)
    if len(recent_hashes) > 120:
        del recent_hashes[:-120]
    return out, recent_hashes

def send_email(subject: str, body: str):
    if not (SMTP_HOST and SMTP_PORT and SMTP_USERNAME and SMTP_PASSWORD and MAIL_TO and MAIL_FROM):
        return  # mail opsiyonel
    msg = MIMEText(body, "plain", "utf-8")
    msg["Subject"] = subject
    msg["From"] = MAIL_FROM
    msg["To"] = MAIL_TO
    with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=20) as s:
        s.starttls()
        s.login(SMTP_USERNAME, SMTP_PASSWORD)
        s.send_message(msg)

def git(args): subprocess.run(args, check=True)

# --- Ana akış ---
def main():
    # pause flag varsa çalışmayı bırak
    if PAUSE_FLAG.exists():
        print("Paused by flag; exiting.")
        return

    st = read_state()
    next_cat = cycle_next(st.get("last_cat"))
    want = random.randint(*COMMITS_PER_RUN)

    # LLM'den iste
    produced, st["recent_hashes"] = llm_lines(want, next_cat, st.get("seq",0)+1, st["recent_hashes"])
    if not produced:
        produced = [f"- [#{st.get('seq',0)+1:04d}] Status: Automated note (no AI content)."]

    wrote_any = False
    for raw in produced:
        # "- [#0001] Category: text"
        # seq & kategori güncelle
        st["seq"] = st.get("seq",0) + 1
        # Kategori çıkar
        m = re.match(r"-\s*\[#\d+\]\s*(\w+)\s*:\s*(.+)$", raw)
        if not m:
            cat = next_cat
            text = raw
        else:
            cat = m.group(1).strip().capitalize()
            text = m.group(2).strip()
            if cat not in CATEGORIES:
                cat = next_cat

        bullet = f"- [#{st['seq']:04d}] {text}"

        try:
            ok = update_category(cat, bullet)
        except RuntimeError as e:
            # limite ulaştık → mail + pause
            send_email(
                subject="[Auto README] Line limit reached",
                body=f"Limit ({MAX_TOTAL_LINES}) reached in repo. Auto updates paused. Remove {PAUSE_FLAG} to resume."
            )
            PAUSE_FLAG.parent.mkdir(parents=True, exist_ok=True)
            PAUSE_FLAG.write_text("paused\n", encoding="utf-8")
            print(str(e))
            break

        if ok:
            wrote_any = True
            st["last_cat"] = cycle_next(st.get("last_cat"))
        else:
            # tekrar çıktı; sırayı yine ilerlet
            st["last_cat"] = cycle_next(st.get("last_cat"))

        time.sleep(1)

    write_state(st)

    if wrote_any:
        git(["git", "add", str(README), str(STATE)])
        git(["git", "commit", "-m", f"chore(readme): AI update up to #{st['seq']:04d} [auto-readme] [skip ci]"])
        git(["git", "push"])

if __name__ == "__main__":
    main()
