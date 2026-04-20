import json
import urllib.request
import urllib.error

API_KEY = "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"
URL = "https://openrouter.ai/api/v1/chat/completions"
HEADERS = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json",
    "HTTP-Referer": "http://localhost",
}

models = [
    "qwen/qwen3-coder:free",
    "deepseek/deepseek-chat-v3-0324:free",
    "mistralai/mistral-7b-instruct:free",
    "google/gemma-3-27b-it:free",
    "meta-llama/llama-3.1-8b-instruct:free",
]

data = {"messages": [{"role": "user", "content": "say hi"}], "max_tokens": 10}

for model in models:
    data["model"] = model
    req = urllib.request.Request(URL, data=json.dumps(data).encode(), headers=HEADERS, method="POST")
    try:
        with urllib.request.urlopen(req) as r:
            body = json.loads(r.read().decode())
            reply = body["choices"][0]["message"]["content"]
            print(f"OK [{model}]: {reply}")
            break
    except urllib.error.HTTPError as e:
        err = json.loads(e.read().decode())
        msg = err.get("error", {}).get("message", "unknown")
        print(f"FAIL [{model}] {e.code}: {msg}")
