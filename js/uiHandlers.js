/* ========================================
   UI HANDLERS - FILE UPLOAD & INTERACTIONS
   ======================================== */

// Global state for current tool
let currentTool = '';
let uploadedFiles = [];
let isMultipleFiles = false;

/* ========================================
   MODAL MANAGEMENT
   ======================================== */

/**
 * Open modal with specific tool configuration
 * @param {string} tool - Tool identifier
 */
function openModal(tool) {
    currentTool = tool;
    uploadedFiles = [];
    
    const modal = document.getElementById('toolModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    
    // Configure tool settings
    const toolConfig = getToolConfig(tool);
    
    // Set modal title
    modalTitle.textContent = toolConfig.title;
    
    // Build modal body content
    modalBody.innerHTML = buildModalContent(toolConfig);
    
    // Setup event listeners
    setupUploadHandlers(toolConfig);
    setupToolSpecificHandlers(tool);
    
    // Show modal
    modal.classList.add('active');
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
}

/**
 * Close modal and reset state
 */
function closeModal() {
    const modal = document.getElementById('toolModal');
    modal.classList.remove('active');
    
    // Reset state
    currentTool = '';
    uploadedFiles = [];
    
    // Restore body scroll
    document.body.style.overflow = '';
}

/**
 * Get tool configuration
 * @param {string} tool - Tool identifier
 * @returns {object} Tool configuration
 */
function getToolConfig(tool) {
    const configs = {
        split: {
            title: 'Split PDF',
            accept: '.pdf',
            multiple: false,
            hasOptions: true,
            optionsType: 'split'
        },
        merge: {
            title: 'Merge PDF',
            accept: '.pdf',
            multiple: true,
            hasOptions: false
        },
        compress: {
            title: 'Compress PDF',
            accept: '.pdf',
            multiple: false,
            hasOptions: false
        },
        pagenumbers: {
            title: 'Add Page Numbers',
            accept: '.pdf',
            multiple: false,
            hasOptions: true,
            optionsType: 'pagenumber'
        },
        pdftoword: {
            title: 'PDF to Word',
            accept: '.pdf',
            multiple: false,
            hasOptions: false,
            requiresBackend: true
        },
        wordtopdf: {
            title: 'Word to PDF',
            accept: '.doc,.docx',
            multiple: false,
            hasOptions: false,
            requiresBackend: true
        },
        ppttopdf: {
            title: 'PPT to PDF',
            accept: '.ppt,.pptx',
            multiple: false,
            hasOptions: false,
            requiresBackend: true
        },
        jpgtopdf: {
            title: 'JPG to PDF',
            accept: '.jpg,.jpeg',
            multiple: true,
            hasOptions: false
        },
        pngtopdf: {
            title: 'PNG to PDF',
            accept: '.png',
            multiple: true,
            hasOptions: false
        }
    };
    
    return configs[tool] || {};
}

/**
 * Build modal content HTML
 * @param {object} config - Tool configuration
 * @returns {string} HTML string
 */
function buildModalContent(config) {
    let html = '';
    
    // Upload area
    html += `
        <div class="upload-area" id="uploadArea">
            <div class="upload-icon">📁</div>
            <p class="upload-text">Drag & drop your ${config.multiple ? 'files' : 'file'} here</p>
            <p class="upload-or">or</p>
            <input type="file" id="fileInput" ${config.multiple ? 'multiple' : ''} accept="${config.accept}" style="display: none;">
            <button type="button" class="btn btn-secondary" id="chooseFileBtn">Choose File${config.multiple ? 's' : ''}</button>
        </div>
    `;
    
    // File list container
    html += '<div class="file-list" id="fileList"></div>';
    
    // Backend info message
    if (config.requiresBackend) {
        html += `
            <div class="info-box info">
                <p>ℹ️ This conversion requires server-side processing. Your file will be securely processed and deleted immediately after conversion.</p>
            </div>
        `;
    }
    
    // Tool-specific options
    if (config.hasOptions) {
        html += buildToolOptions(config.optionsType);
    }
    
    // Loading spinner
    html += `
        <div class="loading" id="loading">
            <div class="spinner"></div>
            <p>Processing your file...</p>
        </div>
    `;
    
    // Status message
    html += '<div class="status-message" id="statusMessage"></div>';
    
    // Process button - IMPORTANT: type="button" prevents form submission!
    html += `<button type="button" class="btn btn-primary" id="processBtn" disabled>Process</button>`;
    
    return html;
}

/**
 * Build tool-specific options HTML
 * @param {string} type - Options type
 * @returns {string} HTML string
 */
function buildToolOptions(type) {
    if (type === 'split') {
        return `
            <div class="options-container">
                <label for="splitOption">Split Options:</label>
                <select id="splitOption" class="form-select">
                    <option value="all">Extract all pages as separate PDFs</option>
                    <option value="range">Split by page range</option>
                </select>
                <input type="text" id="pageRange" class="form-input" placeholder="e.g., 1-3, 5, 7-9" style="display: none; margin-top: 10px;">
            </div>
        `;
    } else if (type === 'pagenumber') {
        return `
            <div class="options-container">
                <label for="position">Position:</label>
                <select id="position" class="form-select">
                    <option value="bottom-center">Bottom Center</option>
                    <option value="bottom-right">Bottom Right</option>
                    <option value="bottom-left">Bottom Left</option>
                    <option value="top-center">Top Center</option>
                    <option value="top-right">Top Right</option>
                    <option value="top-left">Top Left</option>
                </select>
            </div>
        `;
    }
    return '';
}

/* ========================================
   FILE UPLOAD HANDLERS
   ======================================== */

/**
 * Setup upload area event listeners
 * @param {object} config - Tool configuration
 */
function setupUploadHandlers(config) {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    const chooseFileBtn = document.getElementById('chooseFileBtn');
    
    isMultipleFiles = config.multiple;
    
    // Choose file button click (with preventDefault)
    chooseFileBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        fileInput.click();
    });
    
    // Upload area click
    uploadArea.addEventListener('click', (e) => {
        // Only trigger if clicking the upload area itself, not the button
        if (e.target === uploadArea || e.target.classList.contains('upload-icon') || 
            e.target.classList.contains('upload-text') || e.target.classList.contains('upload-or')) {
            fileInput.click();
        }
    });
    
    // File input change
    fileInput.addEventListener('change', (e) => {
        handleFileSelect(e.target.files);
    });
    
    // Drag and drop events
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', handleDrop);
    
    // Prevent default drag behaviors on document
    ['dragover', 'drop'].forEach(eventName => {
        document.addEventListener(eventName, (e) => {
            e.preventDefault();
        });
    });
}

/**
 * Handle drag over event
 * @param {Event} e - Drag event
 */
function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.add('drag-over');
}

/**
 * Handle drag leave event
 * @param {Event} e - Drag event
 */
function handleDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('drag-over');
}

/**
 * Handle drop event
 * @param {Event} e - Drop event
 */
function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    
    const uploadArea = e.currentTarget;
    uploadArea.classList.remove('drag-over');
    
    const files = e.dataTransfer.files;
    handleFileSelect(files);
}

/**
 * Handle file selection
 * @param {FileList} files - Selected files
 */
function handleFileSelect(files) {
    if (!files || files.length === 0) return;
    
    const fileArray = Array.from(files);
    
    // Validate files
    const validFiles = fileArray.filter(file => validateFile(file));
    
    if (validFiles.length === 0) {
        showStatus('Please select valid file(s)', 'error');
        return;
    }
    
    // Handle single vs multiple file uploads
    if (isMultipleFiles) {
        uploadedFiles = uploadedFiles.concat(validFiles);
    } else {
        uploadedFiles = [validFiles[0]];
    }
    
    // Update UI
    updateFileList();
    updateProcessButton();
}

/**
 * Validate file type and size
 * @param {File} file - File to validate
 * @returns {boolean} Is valid
 */
function validateFile(file) {
    const maxSize = 100 * 1024 * 1024; // 100MB
    
    // Check file size
    if (file.size > maxSize) {
        showStatus(`File "${file.name}" is too large. Maximum size is 100MB.`, 'error');
        return false;
    }
    
    // Check file type based on current tool
    const config = getToolConfig(currentTool);
    const acceptedTypes = config.accept.split(',').map(type => type.trim());
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    
    if (!acceptedTypes.includes(fileExtension)) {
        showStatus(`File "${file.name}" has an invalid format.`, 'error');
        return false;
    }
    
    return true;
}

/**
 * Update file list display
 */
function updateFileList() {
    const fileList = document.getElementById('fileList');
    
    if (uploadedFiles.length === 0) {
        fileList.innerHTML = '';
        return;
    }
    
    fileList.innerHTML = uploadedFiles.map((file, index) => `
        <div class="file-item-display" data-index="${index}">
            <span>📄 ${file.name} (${formatFileSize(file.size)})</span>
            <button type="button" class="remove-file" onclick="removeFile(${index})">✕</button>
        </div>
    `).join('');
}

/**
 * Remove file from list
 * @param {number} index - File index
 */
function removeFile(index) {
    uploadedFiles.splice(index, 1);
    updateFileList();
    updateProcessButton();
}

/**
 * Format file size for display
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted size
 */
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Update process button state
 */
function updateProcessButton() {
    const processBtn = document.getElementById('processBtn');
    if (processBtn) {
        processBtn.disabled = uploadedFiles.length === 0;
    }
}

/* ========================================
   TOOL-SPECIFIC HANDLERS
   ======================================== */

/**
 * Setup tool-specific event handlers
 * @param {string} tool - Tool identifier
 */
function setupToolSpecificHandlers(tool) {
    if (tool === 'split') {
        setupSplitHandlers();
    }
}

/**
 * Setup split tool handlers
 */
function setupSplitHandlers() {
    const splitOption = document.getElementById('splitOption');
    const pageRange = document.getElementById('pageRange');
    
    if (splitOption && pageRange) {
        splitOption.addEventListener('change', () => {
            if (splitOption.value === 'range') {
                pageRange.style.display = 'block';
            } else {
                pageRange.style.display = 'none';
            }
        });
    }
}

/* ========================================
   UI FEEDBACK
   ======================================== */

/**
 * Show status message
 * @param {string} message - Message text
 * @param {string} type - Message type (success, error, info, warning)
 */
function showStatus(message, type = 'info') {
    const statusMessage = document.getElementById('statusMessage');
    if (!statusMessage) return;
    
    statusMessage.textContent = message;
    statusMessage.className = `status-message ${type} active`;
    
    // Auto-hide after 5 seconds for success messages
    if (type === 'success') {
        setTimeout(() => {
            hideStatus();
        }, 5000);
    }
}

/**
 * Hide status message
 */
function hideStatus() {
    const statusMessage = document.getElementById('statusMessage');
    if (statusMessage) {
        statusMessage.classList.remove('active');
    }
}

/**
 * Show loading state
 */
function showLoading() {
    const loading = document.getElementById('loading');
    const processBtn = document.getElementById('processBtn');
    
    if (loading) loading.classList.add('active');
    if (processBtn) processBtn.disabled = true;
}

/**
 * Hide loading state
 */
function hideLoading() {
    const loading = document.getElementById('loading');
    const processBtn = document.getElementById('processBtn');
    
    if (loading) loading.classList.remove('active');
    if (processBtn) processBtn.disabled = uploadedFiles.length === 0;
}

/**
 * Show progress (optional, for future use)
 * @param {number} percent - Progress percentage (0-100)
 */
function showProgress(percent) {
    let progressContainer = document.getElementById('progressContainer');
    
    if (!progressContainer) {
        const loading = document.getElementById('loading');
        if (loading) {
            progressContainer = document.createElement('div');
            progressContainer.id = 'progressContainer';
            progressContainer.className = 'progress-container';
            progressContainer.innerHTML = '<div class="progress-bar" id="progressBar"></div>';
            loading.insertAdjacentElement('beforebegin', progressContainer);
        }
    }
    
    const progressBar = document.getElementById('progressBar');
    if (progressBar) {
        progressBar.style.width = `${percent}%`;
    }
    
    if (progressContainer) {
        progressContainer.classList.add('active');
    }
}

/**
 * Hide progress
 */
function hideProgress() {
    const progressContainer = document.getElementById('progressContainer');
    if (progressContainer) {
        progressContainer.classList.remove('active');
    }
}

/* ========================================
   UTILITY FUNCTIONS
   ======================================== */

/**
 * Download file to user's device
 * @param {Uint8Array|Blob} data - File data
 * @param {string} filename - Download filename
 * @param {string} mimeType - MIME type
 */
function downloadFile(data, filename, mimeType) {
    try {
        console.log('Downloading file:', filename);
        console.log('Data type:', data.constructor.name);
        console.log('Data size:', data.size || data.length);
        
        const blob = data instanceof Blob ? data : new Blob([data], { type: mimeType });
        
        console.log('Blob size:', blob.size);
        
        if (blob.size === 0) {
            throw new Error('Downloaded file is empty (0 bytes)');
        }
        
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        
        link.href = url;
        link.download = filename;
        link.style.display = 'none';
        
        document.body.appendChild(link);
        
        console.log('Triggering download...');
        link.click();
        
        console.log('Download triggered successfully');
        
        // Cleanup
        setTimeout(() => {
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            console.log('Cleanup complete');
        }, 100);
        
    } catch (error) {
        console.error('Download error:', error);
        throw error;
    }
}

/**
 * Get uploaded files
 * @returns {Array} Uploaded files
 */
function getUploadedFiles() {
    return uploadedFiles;
}

/**
 * Get current tool
 * @returns {string} Current tool identifier
 */
function getCurrentTool() {
    return currentTool;
}

/**
 * Clear all uploaded files
 */
function clearFiles() {
    uploadedFiles = [];
    updateFileList();
    updateProcessButton();
}

/* ========================================
   EXPORTS (for use in other JS files)
   ======================================== */

// These functions will be available globally for other scripts
window.uiHandlers = {
    openModal,
    closeModal,
    showStatus,
    hideStatus,
    showLoading,
    hideLoading,
    showProgress,
    hideProgress,
    downloadFile,
    getUploadedFiles,
    getCurrentTool,
    clearFiles
};