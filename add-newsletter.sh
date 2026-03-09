#!/bin/bash
# Add newsletter signup form to blog posts that are missing it
# Inserts before the closing </article> tag

NEWSLETTER_HTML='
        <div class="newsletter-box">
            <h3>📬 Free Weekly PM Training</h3>
            <p>Get one actionable property management lesson delivered to your inbox every week. No cost, no spam.</p>
            <form id="subscribe-form" onsubmit="return handleSubscribe(event)">
                <input type="email" id="subscribe-email" placeholder="you@example.com" required>
                <button type="submit">Subscribe Free</button>
            </form>
            <p id="subscribe-status" style="margin-top:0.5rem;font-size:0.85rem;"></p>
        </div>'

NEWSLETTER_CSS='        .newsletter-box{background:#f8f6f0;border:2px solid #f0c040;padding:2rem;border-radius:12px;margin:2rem 0;text-align:center}
        .newsletter-box h3{color:#1a1a2e;margin-bottom:.5rem}
        .newsletter-box p{color:#666;margin-bottom:1rem;font-size:.95rem}
        .newsletter-box form{display:flex;gap:.5rem;justify-content:center;flex-wrap:wrap}
        .newsletter-box input[type="email"]{padding:.6rem 1rem;border:1px solid #ddd;border-radius:6px;font-size:.95rem;min-width:250px}
        .newsletter-box button{background:#f0c040;color:#1a1a2e;border:none;padding:.6rem 1.5rem;border-radius:6px;font-weight:700;cursor:pointer;font-size:.95rem}'

SUBSCRIBE_JS='
    <script>
    async function handleSubscribe(e) {
        e.preventDefault();
        const email = document.getElementById('\''subscribe-email'\'').value;
        const status = document.getElementById('\''subscribe-status'\'');
        status.textContent = '\''Subscribing...'\'';
        try {
            const res = await fetch('\''/api/subscribe'\'', {
                method: '\''POST'\'',
                headers: {'\''Content-Type'\'': '\''application/json'\''},
                body: JSON.stringify({email, source: '\''blog-newsletter'\''})
            });
            const data = await res.json();
            if (data.success) {
                status.textContent = '\''✅ You\\'\''re in! Check your inbox.'\'';
                status.style.color = '\''#22c55e'\'';
            } else {
                status.textContent = data.error || '\''Something went wrong. Try again.'\'';
                status.style.color = '\''#ef4444'\'';
            }
        } catch {
            status.textContent = '\''Network error. Please try again.'\'';
            status.style.color = '\''#ef4444'\'';
        }
    }
    </script>'

count=0
for file in /home/openclaw/.openclaw/workspaces/agent2/levelpm/blog/*.html; do
    # Skip index.html
    [[ "$(basename "$file")" == "index.html" ]] && continue
    
    # Skip files that already have newsletter
    if grep -q "newsletter-box" "$file" 2>/dev/null; then
        continue
    fi
    
    # Add newsletter CSS if missing
    if ! grep -q "newsletter-box" "$file"; then
        # Add CSS before closing </style>
        sed -i '/<\/style>/i\'"$(echo "$NEWSLETTER_CSS" | sed 's/$/\\/' | sed '$ s/\\$//')" "$file" 2>/dev/null
    fi
    
    # Add newsletter HTML before </article>
    sed -i '/<\/article>/i\'"$(echo "$NEWSLETTER_HTML" | sed 's/$/\\/' | sed '$ s/\\$//')" "$file" 2>/dev/null
    
    # Add subscribe JS before </body> if not present
    if ! grep -q "handleSubscribe" "$file"; then
        # Use Python for reliable multi-line insertion
        python3 -c "
import sys
with open('$file', 'r') as f:
    content = f.read()
if 'handleSubscribe' not in content:
    js = '''    <script>
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
                status.textContent = '✅ You\\'re in! Check your inbox.';
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
    </script>'''
    content = content.replace('</body>', js + '\n</body>')
with open('$file', 'w') as f:
    f.write(content)
" 2>/dev/null
    fi
    
    count=$((count + 1))
done

echo "Newsletter form added to $count blog posts"
