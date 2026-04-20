"""
OpenRouter runner for qwen/qwen3-coder:free
with fallback to other free models if rate limited.
Run: python run_qwen_openrouter.py
"""

import json
import sys
import time
import urllib.request
import urllib.error

# Force UTF-8 output on Windows
if sys.stdout.encoding != "utf-8":
    sys.stdout.reconfigure(encoding="utf-8")

API_KEY = "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"
URL     = "https://openrouter.ai/api/v1/chat/completions"

HEADERS = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type":  "application/json",
    "HTTP-Referer":  "http://localhost",
    "X-Title":       "Mercur Project",
}

# Primary model + fallbacks (all free)
MODELS = [
    "qwen/qwen3-coder:free",
    "google/gemma-3-27b-it:free",
    "meta-llama/llama-3.1-8b-instruct:free",
]


def ask(prompt: str, retries: int = 3) -> tuple[str, str]:
    """Returns (model_used, response_text)"""
    data = {
        "messages": [{"role": "user", "content": prompt}],
        "max_tokens": 2000,
    }

    for model in MODELS:
        data["model"] = model
        payload = json.dumps(data).encode("utf-8")

        for attempt in range(1, retries + 1):
            req = urllib.request.Request(URL, data=payload, headers=HEADERS, method="POST")
            try:
                with urllib.request.urlopen(req) as resp:
                    body = json.loads(resp.read().decode("utf-8"))
                    return model, body["choices"][0]["message"]["content"]
            except urllib.error.HTTPError as e:
                err = json.loads(e.read().decode("utf-8"))
                msg = err.get("error", {}).get("message", str(e))
                if e.code == 429:
                    wait = 8 * attempt
                    print(f"  [Rate limited on {model}] retry {attempt}/{retries} in {wait}s...")
                    time.sleep(wait)
                elif e.code == 404:
                    print(f"  [Not found] {model} — trying next...")
                    break
                else:
                    raise RuntimeError(f"HTTP {e.code}: {msg}") from e

    raise RuntimeError("All models rate limited or unavailable. Try again later.")


if __name__ == "__main__":
    print("=" * 55)
    print(f"  OpenRouter — Qwen3 Coder (+ fallback models)")
    print(f"  Primary model: {MODELS[0]}")
    print("  Type 'exit' to quit")
    print("=" * 55)

    while True:
        try:
            user_input = input("\nأنت: ").strip()
        except (EOFError, KeyboardInterrupt):
            print("\nBye!")
            break

        if user_input.lower() in ("exit", "quit", "q", ""):
            if not user_input:
                continue
            print("Bye!")
            break

        try:
            model_used, response = ask(user_input)
            print(f"\nQwen [{model_used.split('/')[1]}]:\n{response}")
        except RuntimeError as e:
            print(f"\n[Error] {e}")
