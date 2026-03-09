#!/usr/bin/env python3
"""Add newsletter signup form to blog posts missing it."""
import glob
import os

NEWSLETTER_CSS = """        .newsletter-box{background:#f8f6f0;border:2px solid #f0c040;padding:2rem;border-radius:12px;margin:2rem 0;text-align:center}
        .newsletter-box h3{color:#1a1a2e;margin-bottom:.5rem}
        .newsletter-box p{color:#666;margin-bottom:1rem;font-size:.95rem}
        .newsletter-box form{display:flex;gap:.5rem;justify-content:center;flex-wrap:wrap}
        .newsletter-box input[type="email"]{padding:.6rem 1rem;border:1px solid #ddd;border-radius:6px;font-size:.95rem;min-width:250px}
        .newsletter-box button{background:#f0c040;color:#1a1a2e;border:none;padding:.6rem 1.5rem;border-radius:6px;font-weight:700;cursor:pointer;font-size:.95rem}"""

NEWSLETTER_HTML = """
        <div class="newsletter-box">
            <h3>\U0001f4ec Free Weekly PM Training</h3>
            <p>Get one actionable property management lesson delivered to your inbox every week. No cost, no spam.</p>
            <form id="subscribe-form" onsubmit="return handleSubscribe(event)">
                <input type="email" id="subscribe-email" placeholder="you@example.com" required>
                <button type="submit">Subscribe Free</button>
            </form>
            <p id="subscribe-status" style="margin-top:0.5rem;font-size:0.85rem;"></p>
        </div>
"""

SUBSCRIBE_JS = """    <script>
    async function handleSubscribe(e) {
        e.preventDefault();
        const email = document.getElementById('subscribe-email').value;
        const status = document.getElementById('subscribe-status');
        status.textContent = 'Subscribing...';
        try {
            const res = await fetch('/api/subscribe', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({email, source: 'blog-newsletter'})
            });
            const data = await res.json();
            if (data.success) {
                status.textContent = '\\u2705 You\\'re in! Check your inbox.';
                status.style.color = '#22c55e';
            } else {
                status.textContent = data.error || 'Something went wrong. Try again.';
                status.style.color = '#ef4444';
            }
        } catch {
            status.textContent = 'Network error. Please try again.';
            status.style.color = '#ef4444';
        }
    }
    </script>
"""

blog_dir = "/home/openclaw/.openclaw/workspaces/agent2/levelpm/blog"
count = 0
errors = []

for filepath in sorted(glob.glob(os.path.join(blog_dir, "*.html"))):
    basename = os.path.basename(filepath)
    if basename == "index.html":
        continue

    with open(filepath, "r") as f:
        content = f.read()

    if "newsletter-box" in content:
        continue

    modified = False

    # 1. Add CSS before </style>
    if "</style>" in content:
        content = content.replace("</style>", NEWSLETTER_CSS + "\n    </style>", 1)
        modified = True

    # 2. Add newsletter HTML before </article>
    if "</article>" in content:
        content = content.replace("</article>", NEWSLETTER_HTML + "    </article>", 1)
        modified = True

    # 3. Add JS before </body>
    if "handleSubscribe" not in content and "</body>" in content:
        content = content.replace("</body>", SUBSCRIBE_JS + "</body>", 1)
        modified = True

    if modified:
        with open(filepath, "w") as f:
            f.write(content)
        count += 1
    else:
        errors.append(basename)

print(f"Newsletter form added to {count} blog posts")
if errors:
    print(f"Skipped (structure issues): {', '.join(errors)}")
