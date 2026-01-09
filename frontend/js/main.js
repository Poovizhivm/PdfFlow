/* ========================================
   MAIN.JS - APPLICATION CONTROLLER
   ======================================== */

// Prevent ALL form submissions
document.addEventListener('submit', (e) => {
    e.preventDefault();
    return false;
});

/* ========================================
   INITIALIZATION
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 PDFFlow initialized');
    setupToolClickHandlers();
    setupModalHandlers();
    setupKeyboardShortcuts();
    logAppInfo();
});

/* ========================================
   TOOL CLICK HANDLERS
   ======================================== */

function setupToolClickHandlers() {
    const toolItems = document.querySelectorAll('.tool-item');
    
    toolItems.forEach(toolItem => {
        toolItem.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const tool = toolItem.getAttribute('data-tool');
            if (tool) {
                window.uiHandlers.openModal(tool);
            }
        });
        
        toolItem.setAttribute('tabindex', '0');
        toolItem.setAttribute('role', 'button');
        
        toolItem.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                const tool = toolItem.getAttribute('data-tool');
                if (tool) {
                    window.uiHandlers.openModal(tool);
                }
            }
        });
    });
}

/* ========================================
   MODAL HANDLERS
   ======================================== */

function setupModalHandlers() {
    const modal = document.getElementById('toolModal');
    const closeBtn = document.getElementById('closeModal');
    
    if (closeBtn) {
        closeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.uiHandlers.closeModal();
        });
    }
    
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                e.preventDefault();
                window.uiHandlers.closeModal();
            }
        });
    }
    
    document.addEventListener('click', (e) => {
        if (e.target && e.target.id === 'processBtn') {
            e.preventDefault();
            e.stopPropagation();
            handleProcessButtonClick();
            return false;
        }
    }, true);
}

async function handleProcessButtonClick() {
    const tool = window.uiHandlers.getCurrentTool();
    
    if (!tool) {
        console.error('No tool selected');
        return;
    }
    
    console.log('🔧 Processing tool:', tool);
    
    try {
        // All tools are client-side now
        await window.pdfOperations.processPDFOperation();
    } catch (error) {
        console.error('Process error:', error);
        window.uiHandlers.showStatus(`Error: ${error.message}`, 'error');
    }
}

/* ========================================
   KEYBOARD SHORTCUTS
   ======================================== */

function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const modal = document.getElementById('toolModal');
            if (modal && modal.classList.contains('active')) {
                window.uiHandlers.closeModal();
            }
        }
        
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            const modal = document.getElementById('toolModal');
            if (modal && modal.classList.contains('active')) {
                const processBtn = document.getElementById('processBtn');
                if (processBtn && !processBtn.disabled) {
                    handleProcessButtonClick();
                }
            }
        }
    });
}

/* ========================================
   UTILITY FUNCTIONS
   ======================================== */

function logAppInfo() {
    console.log('%c PDFFlow v1.0.0 ', 'background: #339af0; color: white; font-weight: bold; padding: 5px;');
    console.log('📄 All PDF processing happens locally in your browser');
    console.log('🔒 Your files never leave your device');
    console.log('⚡ Powered by PDF-lib');
}

window.addEventListener('load', () => {
    console.log('✨ PDFFlow is ready!');
});