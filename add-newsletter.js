// Add newsletter signup + subscribe script to all blog posts
const fs = require('fs');
const path = require('path');

const blogDir = path.join(__dirname, 'blog');

const newsletterHTML = `
    <!-- Newsletter Signup -->
    <div style="background:linear-gradient(135deg,rgba(34,197,94,.06),rgba(34,197,94,.12));border:2px solid rgba(34,197,94,.2);border-radius:16px;padding:2.5rem;margin:3rem 0 2rem;text-align:center">
        <h3 style="font-size:1.4rem;font-weight:800;margin-bottom:.5rem">📬 Get Weekly PM Scaling Tips</h3>
        <p style="color:#64748b;margin-bottom:1.25rem;font-size:.95rem">One actionable tip every week — SOPs, growth strategies, and automation ideas. Join 50+ PM owners. Free forever.</p>
        <form id="blog-nl-form" style="display:flex;gap:.75rem;justify-content:center;flex-wrap:wrap;max-width:500px;margin:0 auto">
            <input type="email" id="blog-nl-email" placeholder="your@email.com" required style="flex:1;min-width:200px;padding:.7rem 1rem;border:2px solid #e2e8f0;border-radius:10px;font-size:.9rem;outline:none" onfocus="this.style.borderColor='#22c55e'" onblur="this.style.borderColor='#e2e8f0'">
            <button type="submit" style="background:#22c55e;color:white;border:none;padding:.7rem 1.5rem;border-radius:10px;font-weight:700;font-size:.9rem;cursor:pointer;white-space:nowrap">Subscribe →</button>
        </form>
        <p id="blog-nl-msg" style="display:none;margin-top:.75rem;font-size:.85rem;font-weight:600"></p>
        <p style="margin-top:.5rem;font-size:.7rem;color:#94a3b8">No spam. Unsubscribe anytime.</p>
    </div>`;

const subscribeScript = `
<script>
document.getElementById('blog-nl-form')?.addEventListener('submit',async function(e){
    e.preventDefault();const email=document.getElementById('blog-nl-email').value;const msg=document.getElementById('blog-nl-msg');const btn=this.querySelector('button');btn.textContent='...';btn.disabled=true;
    try{const r=await fetch('/api/subscribe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,source:'blog'})});
    if(r.ok){msg.style.display='block';msg.style.color='#22c55e';msg.textContent='✓ You\\'re in! Weekly tips incoming.';this.style.display='none';}else{throw new Error();}
    }catch(err){msg.style.display='block';msg.style.color='#ef4444';msg.textContent='Error — try again?';btn.textContent='Subscribe →';btn.disabled=false;}
});
</script>`;

let modified = 0;
let skipped = 0;

const files = fs.readdirSync(blogDir).filter(f => f.endsWith('.html'));

for (const file of files) {
    const filePath = path.join(blogDir, file);
    let html = fs.readFileSync(filePath, 'utf8');
    
    // Skip if already has newsletter form
    if (html.includes('blog-nl-form')) {
        skipped++;
        continue;
    }
    
    // Insert newsletter before footer (handle both <div> and <footer> variants)
    let footerIndex = html.indexOf('<div class="footer">');
    if (footerIndex === -1) footerIndex = html.indexOf('<footer class="footer">');
    if (footerIndex === -1) footerIndex = html.indexOf('<footer');
    if (footerIndex === -1) {
        // Last resort: insert before </body>
        footerIndex = html.indexOf('</body>');
    }
    if (footerIndex === -1) {
        console.log(`SKIP (no insertion point): ${file}`);
        skipped++;
        continue;
    }
    
    // Insert newsletter HTML before footer, and script before </body>
    html = html.slice(0, footerIndex) + newsletterHTML + '\n    ' + html.slice(footerIndex);
    html = html.replace('</body>', subscribeScript + '\n</body>');
    
    fs.writeFileSync(filePath, html);
    modified++;
}

console.log(`Done! Modified: ${modified}, Skipped: ${skipped}, Total: ${files.length}`);
