/**
 * ============================================
 * RESUME PAGE FUNCTIONALITY
 * CLEAN VERSION - Just the resume, no extra backgrounds
 * Author: Felix Marubi
 *
 * Notes:
 *  - The mobile accordion (plus/minus dropdowns) is owned by
 *    resume-accordion.js. This file only handles PDF/HTML export,
 *    button loading states, and back-to-top.
 *  - PDF export calls window.resumeOpenAllBlocks() before capture
 *    so hidden sections never get chopped out of the PDF.
 * ============================================
 */

document.addEventListener('DOMContentLoaded', function () {
    console.log('🚀 Resume page initialized');

    initDownloadButtons();
    initBackToTop();
});

/**
 * Swap a button into a loading state. Returns a restore function.
 * Uses the button element passed in, not the deprecated global `event`.
 */
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

/**
 * Download PDF — expands every accordion section first so nothing
 * is clipped, captures the resume container, then restores the
 * user's open/closed state.
 */
function downloadPDF(event) {
    const element = document.getElementById('resume-content');
    if (!element) {
        alert('Resume content not found');
        return;
    }

    const btn = event?.currentTarget || event?.target?.closest?.('button') || null;
    const restoreBtn = setButtonLoading(
        btn,
        '<i class="fas fa-spinner fa-spin"></i> Generating PDF...'
    );

    // Open all sections so the PDF shows every block.
    if (typeof window.resumeOpenAllBlocks === 'function') {
        window.resumeOpenAllBlocks();
    }

    const opt = {
        margin: [0.3, 0.3, 0.3, 0.3],
        filename: 'Felix_Marubi_Resume.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
            scale: 1.2,
            backgroundColor: null,
        },
        jsPDF: {
            unit: 'in',
            format: 'a4',
            orientation: 'portrait',
        },
    };

    html2pdf()
        .set(opt)
        .from(element)
        .save()
        .then(function () {
            console.log('PDF generated');
            restoreBtn();
            if (typeof window.resumeRestoreBlocks === 'function') {
                window.resumeRestoreBlocks();
            }
        })
        .catch(function (error) {
            console.error('PDF error:', error);
            alert('Error generating PDF. Please try again.');
            restoreBtn();
            if (typeof window.resumeRestoreBlocks === 'function') {
                window.resumeRestoreBlocks();
            }
        });
}

/**
 * Download HTML — bundles the resume markup into a standalone file.
 * Also opens all sections first so the standalone copy isn't empty.
 */
function downloadHTML(event) {
    const element = document.getElementById('resume-content');
    if (!element) {
        alert('Resume content not found');
        return;
    }

    const btn = event?.currentTarget || event?.target?.closest?.('button') || null;
    const restoreBtn = setButtonLoading(
        btn,
        '<i class="fas fa-spinner fa-spin"></i> Generating HTML...'
    );

    if (typeof window.resumeOpenAllBlocks === 'function') {
        window.resumeOpenAllBlocks();
    }

    const contentHTML = element.outerHTML;

    const fullHTML = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Felix Marubi - Resume</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="stylesheet" href="css/pages/home.css">
    <link rel="stylesheet" href="css/pages/resume.css">
</head>
<body>
    <div class="container">
        ${contentHTML}
    </div>
</body>
</html>`;

    const blob = new Blob([fullHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Felix_Marubi_Resume.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    // Restore after a beat so the user sees the loading state finish
    setTimeout(function () {
        restoreBtn();
        if (typeof window.resumeRestoreBlocks === 'function') {
            window.resumeRestoreBlocks();
        }
    }, 800);
}

/**
 * Wire up the four download buttons (top + bottom pairs).
 */
function initDownloadButtons() {
    const pdfButtons = document.querySelectorAll('#downloadPDFBtn, #downloadPDFBtn2');
    pdfButtons.forEach(function (btn) {
        btn.addEventListener('click', downloadPDF);
    });

    const htmlButtons = document.querySelectorAll('#downloadHTMLBtn, #downloadHTMLBtn2');
    htmlButtons.forEach(function (btn) {
        btn.addEventListener('click', downloadHTML);
    });
}

/**
 * Back to top button.
 */
function initBackToTop() {
    const backToTop = document.getElementById('backToTop');
    if (!backToTop) return;

    window.addEventListener(
        'scroll',
        function () {
            backToTop.classList.toggle('visible', window.scrollY > 400);
        },
        { passive: true }
    );

    backToTop.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}