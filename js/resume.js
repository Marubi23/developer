/**
 * ============================================
 * RESUME PAGE FUNCTIONALITY
 * Author: Felix Marubi
 *
 * - Accordion toggling is owned entirely by resume-accordion.js.
 *   This file must NOT touch .block-title or .block-content.
 * - PDF / HTML export clone the resume, strip the dark theme, and
 *   produce a clean black-on-white document that prints correctly.
 * ============================================
 */

document.addEventListener('DOMContentLoaded', function () {
    console.log('🚀 Resume page initialized');
    initDownloadButtons();
    initBackToTop();
});

/* ---------------------------------------------------------------
 * Build a clean, print-ready clone of the resume.
 * - Expands every accordion section
 * - Leaves DOM structure intact so our print CSS can target it
 * ------------------------------------------------------------- */
function buildPrintClone() {
    const original = document.getElementById('resume-content');
    if (!original) return null;

    const clone = original.cloneNode(true);

    clone.querySelectorAll('.block-content').forEach(function (el) {
        el.classList.add('show');
        el.style.maxHeight = 'none';
        el.style.overflow = 'visible';
        el.style.padding = '';
    });

    return clone;
}

/* ---------------------------------------------------------------
 * Print stylesheet — inlined into PDF and standalone HTML exports
 * so both outputs are identical: white page, black text.
 * ------------------------------------------------------------- */
const PRINT_CSS = `
    @page { size: A4; margin: 12mm; }
    * { box-sizing: border-box; }
    body {
        margin: 0;
        padding: 0;
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
        color: #111;
        background: #fff;
        font-size: 11px;
        line-height: 1.5;
    }
    h1, h2, h3, h4, h5 { color: #111; margin: 0; font-weight: 700; }
    a { color: #111; text-decoration: none; }
    i { color: #111 !important; }

    .resume-container {
        display: block !important;
        background: #fff !important;
        border: 0 !important;
        box-shadow: none !important;
        backdrop-filter: none !important;
        padding: 0 !important;
        border-radius: 0 !important;
        max-width: 100% !important;
    }
    .resume-container::before { display: none !important; }

    .resume-left, .resume-right {
        display: block !important;
        width: 100% !important;
        padding: 0 !important;
        border: 0 !important;
        page-break-inside: auto;
    }
    .resume-left { margin-bottom: 14px; }

    /* Profile */
    .profile-card {
        text-align: left !important;
        margin: 0 0 14px !important;
        padding: 0 0 10px !important;
        border-bottom: 2px solid #111;
        display: flex;
        align-items: center;
        gap: 16px;
    }
    .profile-image {
        width: 64px !important;
        height: 64px !important;
        margin: 0 !important;
        border: 1px solid #111 !important;
        box-shadow: none !important;
        flex: none;
    }
    .profile-image img { display: block; width: 100%; height: 100%; object-fit: cover; }
    .profile-name { margin: 0 !important; }
    .profile-name .first {
        display: inline !important;
        font-size: 11px !important;
        letter-spacing: 3px !important;
        color: #555 !important;
        margin-right: 6px !important;
        font-family: inherit !important;
    }
    .profile-name .last {
        display: inline !important;
        font-size: 22px !important;
        color: #111 !important;
        letter-spacing: 0 !important;
    }
    .profile-title {
        font-family: inherit !important;
        font-size: 10px !important;
        color: #444 !important;
        background: none !important;
        border: 0 !important;
        padding: 0 !important;
        margin: 2px 0 0 !important;
        letter-spacing: 1px !important;
        display: block !important;
    }
    .profile-badge {
        font-size: 9px !important;
        color: #111 !important;
        background: none !important;
        border: 1px solid #111 !important;
        padding: 2px 8px !important;
        box-shadow: none !important;
        animation: none !important;
        margin-top: 4px !important;
        display: inline-block !important;
        border-radius: 2px !important;
    }

    /* Section headings */
    .resume-block {
        margin: 0 0 12px !important;
        padding: 0 !important;
        border: 0 !important;
        background: none !important;
        border-radius: 0 !important;
    }
    .block-title {
        font-size: 11px !important;
        text-transform: uppercase;
        letter-spacing: 1.5px;
        color: #111 !important;
        padding: 0 0 3px !important;
        margin: 0 0 8px !important;
        border-bottom: 1px solid #111 !important;
        background: none !important;
        display: flex !important;
        align-items: center;
        gap: 6px;
        page-break-after: avoid;
    }
    .block-title i { color: #111 !important; font-size: 10px !important; }
    .block-title::before, .block-title::after { display: none !important; content: none !important; }

    .block-content {
        display: block !important;
        max-height: none !important;
        overflow: visible !important;
        padding: 0 !important;
        background: none !important;
        page-break-inside: auto;
    }

    /* Contact */
    .contact-list { display: block !important; }
    .contact-item {
        display: block !important;
        font-size: 10px !important;
        margin: 0 0 3px !important;
        color: #111 !important;
    }
    .contact-item i { display: inline-block; width: 14px; margin-right: 4px; }

    /* Education */
    .edu-item { margin: 0 0 8px !important; }
    .edu-item h3 { font-size: 11px !important; }
    .edu-meta, .edu-date { font-size: 10px !important; color: #444 !important; margin: 0 !important; }

    /* Certifications */
    .cert-list { display: block !important; }
    .cert-item {
        display: block !important;
        font-size: 10px !important;
        margin: 0 0 2px !important;
        color: #111 !important;
    }
    .cert-item i { display: inline-block; width: 14px; margin-right: 4px; }

    /* Skills mini */
    .skills-mini { display: block !important; line-height: 1.6; }
    .skill-mini {
        display: inline !important;
        background: none !important;
        border: 0 !important;
        padding: 0 !important;
        font-size: 10px !important;
        color: #111 !important;
    }
    .skill-mini::after { content: ' · '; color: #999; }
    .skill-mini:last-child::after { content: ''; }

    /* Summary */
    .summary-text {
        font-size: 10px !important;
        line-height: 1.6 !important;
        padding: 0 0 0 8px !important;
        border-left: 2px solid #111 !important;
        color: #111 !important;
        background: none !important;
    }
    .summary-text i { display: none; }

    /* Experience */
    .exp-item {
        margin: 0 0 10px !important;
        padding: 0 0 0 10px !important;
        border-left: 1px solid #999 !important;
        page-break-inside: avoid;
    }
    .exp-item::before { display: none !important; }
    .exp-header { display: block !important; margin: 0 0 3px !important; }
    .exp-header h3 { font-size: 11px !important; margin: 0 !important; color: #111 !important; }
    .exp-date {
        font-size: 9px !important;
        color: #555 !important;
        background: none !important;
        border: 0 !important;
        padding: 0 !important;
        display: block !important;
        margin-top: 1px !important;
        font-family: inherit !important;
    }
    .exp-list {
        margin: 3px 0 4px 14px !important;
        padding: 0 !important;
        font-size: 10px !important;
        color: #222 !important;
    }
    .exp-list li { margin: 0 0 2px !important; line-height: 1.5; }
    .exp-tech { display: block !important; font-size: 9px !important; color: #555 !important; }
    .exp-tech span {
        display: inline !important;
        background: none !important;
        border: 0 !important;
        padding: 0 !important;
        color: #555 !important;
        font-size: 9px !important;
    }
    .exp-tech span::after { content: ', '; }
    .exp-tech span:last-child::after { content: ''; }

    /* Projects */
    .project-row { display: block !important; }
    .project-mini-card {
        background: none !important;
        border: 0 !important;
        border-left: 1px solid #999 !important;
        border-radius: 0 !important;
        padding: 0 0 0 10px !important;
        margin: 0 0 6px !important;
        box-shadow: none !important;
        page-break-inside: avoid;
    }
    .project-mini-card h4 { font-size: 10px !important; margin: 0 !important; color: #111 !important; }
    .project-mini-card p { font-size: 9px !important; margin: 0 !important; color: #444 !important; }
    .project-status {
        display: inline !important;
        font-size: 8px !important;
        background: none !important;
        color: #111 !important;
        padding: 0 !important;
        border: 0 !important;
        text-transform: uppercase;
        letter-spacing: 1px;
    }
    .project-status::before { display: none !important; }

    /* Achievements */
    .achievement-list { display: block !important; }
    .achievement-item {
        display: block !important;
        padding: 0 0 0 10px !important;
        margin: 0 0 4px !important;
        background: none !important;
        border: 0 !important;
        border-left: 1px solid #999 !important;
        border-radius: 0 !important;
    }
    .achievement-item i { display: none !important; }
    .achievement-item h4 { font-size: 10px !important; margin: 0 !important; }
    .achievement-item p { font-size: 9px !important; margin: 0 !important; color: #444 !important; }

    /* Skills grid */
    .skills-grid { display: block !important; }
    .skill-category { margin: 0 0 6px !important; }
    .skill-category h4 {
        font-size: 9px !important;
        text-transform: uppercase;
        letter-spacing: 1px;
        color: #111 !important;
        margin: 0 0 2px !important;
        font-family: inherit !important;
    }
    .skill-tags { display: block !important; }
    .skill-tag {
        display: inline !important;
        font-size: 9px !important;
        background: none !important;
        border: 0 !important;
        padding: 0 !important;
        color: #222 !important;
    }
    .skill-tag::after { content: ' · '; color: #999; }
    .skill-tag:last-child::after { content: ''; }

    /* Languages */
    .language-bars { display: block !important; }
    .lang-bar {
        display: block !important;
        margin: 0 0 3px !important;
        font-size: 10px !important;
    }
    .lang-bar span { display: inline-block; width: 60px; }
    .lang-bar .bar {
        display: inline-block;
        width: 120px;
        height: 4px;
        background: #ddd !important;
        border-radius: 2px;
        vertical-align: middle;
        overflow: hidden;
    }
    .lang-bar .fill { background: #111 !important; height: 100%; display: block; }

    /* Footer actions hidden in print */
    .resume-footer-actions { display: none !important; }
`;

/* ---------------------------------------------------------------
 * PDF export — clone + print CSS + html2pdf
 * ------------------------------------------------------------- */
function downloadPDF(event) {
    const clone = buildPrintClone();
    if (!clone) { alert('Resume content not found'); return; }

    const btn = event?.currentTarget || event?.target?.closest?.('button') || null;
    const restoreBtn = setButtonLoading(btn, '<i class="fas fa-spinner fa-spin"></i> Generating PDF...');

    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'position:fixed;left:-99999px;top:0;width:800px;background:#fff;color:#111;padding:24px;font-family:Inter,sans-serif;';
    wrapper.innerHTML = '<style>' + PRINT_CSS + '</style>';
    wrapper.appendChild(clone);
    document.body.appendChild(wrapper);

    const opt = {
        margin: [0.4, 0.4, 0.4, 0.4],
        filename: 'Felix_Marubi_Resume.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
            scale: 2,
            useCORS: true,
            backgroundColor: '#ffffff',
            logging: false,
            windowWidth: 800,
        },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },
        pagebreak: {
            mode: ['css', 'legacy'],
            avoid: ['.exp-item', '.achievement-item', '.project-mini-card', '.block-title'],
        },
    };

    html2pdf()
        .set(opt)
        .from(wrapper)
        .save()
        .then(function () {
            console.log('PDF generated');
            restoreBtn();
            wrapper.remove();
        })
        .catch(function (error) {
            console.error('PDF error:', error);
            alert('Error generating PDF. Please try again.');
            restoreBtn();
            wrapper.remove();
        });
}

/* ---------------------------------------------------------------
 * HTML export — standalone, light theme, print-friendly
 * ------------------------------------------------------------- */
function downloadHTML(event) {
    const clone = buildPrintClone();
    if (!clone) { alert('Resume content not found'); return; }

    const btn = event?.currentTarget || event?.target?.closest?.('button') || null;
    const restoreBtn = setButtonLoading(btn, '<i class="fas fa-spinner fa-spin"></i> Generating HTML...');

    const fullHTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Felix Marubi — Resume</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
<style>
${PRINT_CSS}
html, body { background: #f4f4f4 !important; padding: 24px 0; }
.page {
    max-width: 800px;
    margin: 0 auto;
    background: #fff;
    padding: 40px 48px;
    box-shadow: 0 2px 24px rgba(0,0,0,0.08);
}
@media print {
    html, body { background: #fff !important; padding: 0 !important; }
    .page { box-shadow: none; padding: 0; max-width: 100%; }
}
</style>
</head>
<body>
<div class="page">
${clone.outerHTML}
</div>
</body>
</html>`;

    const blob = new Blob([fullHTML], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Felix_Marubi_Resume.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setTimeout(function () { restoreBtn(); }, 600);
}

/* --------------------------------------------------------------- */
function setButtonLoading(btn, html) {
    if (!btn) return function () {};
    const original = btn.innerHTML;
    btn.innerHTML = html;
    btn.disabled = true;
    return function () {
        btn.innerHTML = original;
        btn.disabled = false;
    };
}

function initDownloadButtons() {
    document.querySelectorAll('#downloadPDFBtn, #downloadPDFBtn2').forEach(function (b) {
        b.addEventListener('click', downloadPDF);
    });
    document.querySelectorAll('#downloadHTMLBtn, #downloadHTMLBtn2').forEach(function (b) {
        b.addEventListener('click', downloadHTML);
    });
}

function initBackToTop() {
    const backToTop = document.getElementById('backToTop');
    if (!backToTop) return;
    window.addEventListener('scroll', function () {
        backToTop.classList.toggle('visible', window.scrollY > 400);
    }, { passive: true });
    backToTop.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}