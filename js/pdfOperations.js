/* ========================================
   PDF OPERATIONS - CLIENT-SIDE PROCESSING
   ======================================== */

// PDF-lib from CDN
const { PDFDocument, rgb, StandardFonts, degrees } = PDFLib;

/* ========================================
   SPLIT PDF
   ======================================== */

/**
 * Split PDF into separate files
 */
async function splitPDF() {
    try {
        window.uiHandlers.showLoading();
        window.uiHandlers.hideStatus();
        
        const files = window.uiHandlers.getUploadedFiles();
        if (files.length === 0) {
            throw new Error('No file selected');
        }
        
        const file = files[0];
        const arrayBuffer = await file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        const totalPages = pdfDoc.getPageCount();
        
        const splitOption = document.getElementById('splitOption').value;
        
        if (splitOption === 'all') {
            // Split all pages
            for (let i = 0; i < totalPages; i++) {
                const newPdf = await PDFDocument.create();
                const [copiedPage] = await newPdf.copyPages(pdfDoc, [i]);
                newPdf.addPage(copiedPage);
                
                const pdfBytes = await newPdf.save();
                const filename = `page_${i + 1}.pdf`;
                window.uiHandlers.downloadFile(pdfBytes, filename, 'application/pdf');
                
                // Show progress
                const progress = ((i + 1) / totalPages) * 100;
                window.uiHandlers.showProgress(progress);
            }
            
            window.uiHandlers.showStatus(`✓ Successfully split ${totalPages} pages!`, 'success');
        } else {
            // Split by range - CREATE SEPARATE PDFs for EACH range/page
            const pageRange = document.getElementById('pageRange').value;
            
            if (!pageRange || pageRange.trim() === '') {
                throw new Error('Please enter a page range');
            }
            
            // Parse ranges (e.g., "1-3, 5, 7-9" -> [[0,1,2], [4], [6,7,8]])
            const ranges = parsePageRanges(pageRange, totalPages);
            
            if (ranges.length === 0) {
                throw new Error('Invalid page range');
            }
            
            // Create separate PDF for each range
            for (let i = 0; i < ranges.length; i++) {
                const pageIndices = ranges[i];
                const newPdf = await PDFDocument.create();
                const copiedPages = await newPdf.copyPages(pdfDoc, pageIndices);
                
                copiedPages.forEach(page => newPdf.addPage(page));
                
                const pdfBytes = await newPdf.save();
                
                // Create descriptive filename
                let filename;
                if (pageIndices.length === 1) {
                    filename = `page_${pageIndices[0] + 1}.pdf`;
                } else {
                    filename = `pages_${pageIndices[0] + 1}-${pageIndices[pageIndices.length - 1] + 1}.pdf`;
                }
                
                window.uiHandlers.downloadFile(pdfBytes, filename, 'application/pdf');
                
                // Show progress
                const progress = ((i + 1) / ranges.length) * 100;
                window.uiHandlers.showProgress(progress);
            }
            
            window.uiHandlers.showStatus(`✓ Successfully created ${ranges.length} PDF(s)!`, 'success');
        }
        
    } catch (error) {
        console.error('Split PDF error:', error);
        window.uiHandlers.showStatus(`Error: ${error.message}`, 'error');
    } finally {
        window.uiHandlers.hideLoading();
        window.uiHandlers.hideProgress();
    }
}

/**
 * Parse page ranges into separate groups
 * e.g., "1-3, 5, 7-9" -> [[0,1,2], [4], [6,7,8]]
 */
function parsePageRanges(range, totalPages) {
    const ranges = [];
    const parts = range.split(',').map(part => part.trim());
    
    for (const part of parts) {
        if (part.includes('-')) {
            // Range (e.g., "1-3")
            const [start, end] = part.split('-').map(n => parseInt(n.trim()));
            
            if (isNaN(start) || isNaN(end)) continue;
            
            const startIdx = Math.max(1, start);
            const endIdx = Math.min(totalPages, end);
            
            const pageIndices = [];
            for (let i = startIdx; i <= endIdx; i++) {
                pageIndices.push(i - 1); // Convert to 0-based index
            }
            
            if (pageIndices.length > 0) {
                ranges.push(pageIndices);
            }
        } else {
            // Single page (e.g., "5")
            const pageNum = parseInt(part.trim());
            
            if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
                ranges.push([pageNum - 1]); // Convert to 0-based index
            }
        }
    }
    
    return ranges;
}

/* ========================================
   MERGE PDF
   ======================================== */

/**
 * Merge multiple PDFs into one
 */
async function mergePDF() {
    try {
        window.uiHandlers.showLoading();
        window.uiHandlers.hideStatus();
        
        const files = window.uiHandlers.getUploadedFiles();
        
        if (files.length < 2) {
            throw new Error('Please select at least 2 PDF files to merge');
        }
        
        const mergedPdf = await PDFDocument.create();
        
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await PDFDocument.load(arrayBuffer);
            
            const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
            copiedPages.forEach(page => mergedPdf.addPage(page));
            
            // Show progress
            const progress = ((i + 1) / files.length) * 100;
            window.uiHandlers.showProgress(progress);
        }
        
        const pdfBytes = await mergedPdf.save();
        const filename = 'merged_document.pdf';
        window.uiHandlers.downloadFile(pdfBytes, filename, 'application/pdf');
        
        window.uiHandlers.showStatus(`✓ Successfully merged ${files.length} PDFs!`, 'success');
        
    } catch (error) {
        console.error('Merge PDF error:', error);
        window.uiHandlers.showStatus(`Error: ${error.message}`, 'error');
    } finally {
        window.uiHandlers.hideLoading();
        window.uiHandlers.hideProgress();
    }
}

/* ========================================
   COMPRESS PDF
   ======================================== */
/**
 * Compress PDF file with better compression
 */
async function compressPDF() {
    try {
        window.uiHandlers.showLoading();
        window.uiHandlers.hideStatus();
        
        const files = window.uiHandlers.getUploadedFiles();
        if (files.length === 0) {
            throw new Error('No file selected');
        }
        
        const file = files[0];
        const arrayBuffer = await file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        
        // Get all pages
        const pages = pdfDoc.getPages();
        
        // Remove metadata to reduce size
        pdfDoc.setTitle('');
        pdfDoc.setAuthor('');
        pdfDoc.setSubject('');
        pdfDoc.setKeywords([]);
        pdfDoc.setProducer('');
        pdfDoc.setCreator('');
        
        // Compress by optimizing the PDF structure
        const pdfBytes = await pdfDoc.save({
            useObjectStreams: true,
            addDefaultPage: false,
            objectsPerTick: 50,
            updateFieldAppearances: false
        });
        
        const originalSize = file.size;
        const compressedSize = pdfBytes.length;
        
        // Check if compression actually reduced size
        if (compressedSize >= originalSize) {
            window.uiHandlers.showStatus(
                `⚠️ This PDF is already optimized and cannot be compressed further. Original: ${(originalSize / 1024 / 1024).toFixed(2)}MB`,
                'warning'
            );
            
            // Still download the file
            const filename = `compressed_${file.name}`;
            window.uiHandlers.downloadFile(pdfBytes, filename, 'application/pdf');
        } else {
            const savedBytes = originalSize - compressedSize;
            const savedPercentage = ((savedBytes / originalSize) * 100).toFixed(1);
            
            const filename = `compressed_${file.name}`;
            window.uiHandlers.downloadFile(pdfBytes, filename, 'application/pdf');
            
            const originalMB = (originalSize / 1024 / 1024).toFixed(2);
            const compressedMB = (compressedSize / 1024 / 1024).toFixed(2);
            
            window.uiHandlers.showStatus(
                `✓ Compressed! ${originalMB}MB → ${compressedMB}MB (Saved ${savedPercentage}%)`,
                'success'
            );
        }
        
    } catch (error) {
        console.error('Compress PDF error:', error);
        window.uiHandlers.showStatus(`Error: ${error.message}`, 'error');
    } finally {
        window.uiHandlers.hideLoading();
    }
}


/* ========================================
   ADD PAGE NUMBERS
   ======================================== */

/**
 * Add page numbers to PDF
 */
async function addPageNumbers() {
    try {
        window.uiHandlers.showLoading();
        window.uiHandlers.hideStatus();
        
        const files = window.uiHandlers.getUploadedFiles();
        if (files.length === 0) {
            throw new Error('No file selected');
        }
        
        const file = files[0];
        const arrayBuffer = await file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        
        const pages = pdfDoc.getPages();
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const fontSize = 12;
        
        const position = document.getElementById('position').value;
        
        for (let i = 0; i < pages.length; i++) {
            const page = pages[i];
            const { width, height } = page.getSize();
            const pageNumber = (i + 1).toString();
            const textWidth = font.widthOfTextAtSize(pageNumber, fontSize);
            const textHeight = font.heightAtSize(fontSize);
            
            let x, y;
            
            // Calculate position
            switch (position) {
                case 'bottom-center':
                    x = (width - textWidth) / 2;
                    y = 30;
                    break;
                case 'bottom-right':
                    x = width - textWidth - 50;
                    y = 30;
                    break;
                case 'bottom-left':
                    x = 50;
                    y = 30;
                    break;
                case 'top-center':
                    x = (width - textWidth) / 2;
                    y = height - 50;
                    break;
                case 'top-right':
                    x = width - textWidth - 50;
                    y = height - 50;
                    break;
                case 'top-left':
                    x = 50;
                    y = height - 50;
                    break;
                default:
                    x = (width - textWidth) / 2;
                    y = 30;
            }
            
            // Draw page number
            page.drawText(pageNumber, {
                x: x,
                y: y,
                size: fontSize,
                font: font,
                color: rgb(0, 0, 0),
                opacity: 0.8
            });
            
            // Show progress
            const progress = ((i + 1) / pages.length) * 100;
            window.uiHandlers.showProgress(progress);
        }
        
        const pdfBytes = await pdfDoc.save();
        const filename = `numbered_${file.name}`;
        window.uiHandlers.downloadFile(pdfBytes, filename, 'application/pdf');
        
        window.uiHandlers.showStatus(`✓ Added page numbers to ${pages.length} pages!`, 'success');
        
    } catch (error) {
        console.error('Add page numbers error:', error);
        window.uiHandlers.showStatus(`Error: ${error.message}`, 'error');
    } finally {
        window.uiHandlers.hideLoading();
        window.uiHandlers.hideProgress();
    }
}

/* ========================================
   IMAGE TO PDF CONVERSION
   ======================================== */

/**
 * Convert images (JPG/PNG) to PDF
 */
async function imageToPDF() {
    try {
        window.uiHandlers.showLoading();
        window.uiHandlers.hideStatus();
        
        const files = window.uiHandlers.getUploadedFiles();
        
        if (files.length === 0) {
            throw new Error('No files selected');
        }
        
        const pdfDoc = await PDFDocument.create();
        
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const arrayBuffer = await file.arrayBuffer();
            
            let image;
            
            // Embed image based on type
            if (file.type === 'image/png' || file.name.toLowerCase().endsWith('.png')) {
                image = await pdfDoc.embedPng(arrayBuffer);
            } else if (file.type === 'image/jpeg' || file.name.toLowerCase().endsWith('.jpg') || file.name.toLowerCase().endsWith('.jpeg')) {
                image = await pdfDoc.embedJpg(arrayBuffer);
            } else {
                console.warn(`Skipping unsupported file: ${file.name}`);
                continue;
            }
            
            // Get image dimensions
            const imageDims = image.scale(1);
            
            // Create page with image dimensions
            const page = pdfDoc.addPage([imageDims.width, imageDims.height]);
            
            // Draw image on page
            page.drawImage(image, {
                x: 0,
                y: 0,
                width: imageDims.width,
                height: imageDims.height
            });
            
            // Show progress
            const progress = ((i + 1) / files.length) * 100;
            window.uiHandlers.showProgress(progress);
        }
        
        const pdfBytes = await pdfDoc.save();
        const filename = files.length === 1 
            ? `${files[0].name.split('.')[0]}.pdf`
            : 'converted_images.pdf';
        
        window.uiHandlers.downloadFile(pdfBytes, filename, 'application/pdf');
        
        window.uiHandlers.showStatus(`✓ Converted ${files.length} image(s) to PDF!`, 'success');
        
    } catch (error) {
        console.error('Image to PDF error:', error);
        window.uiHandlers.showStatus(`Error: ${error.message}`, 'error');
    } finally {
        window.uiHandlers.hideLoading();
        window.uiHandlers.hideProgress();
    }
}

/* ========================================
   PROCESS ROUTER
   ======================================== */

/**
 * Route to appropriate PDF operation based on current tool
 */
async function processPDFOperation() {
    const tool = window.uiHandlers.getCurrentTool();
    
    switch (tool) {
        case 'split':
            await splitPDF();
            break;
        case 'merge':
            await mergePDF();
            break;
        case 'compress':
            await compressPDF();
            break;
        case 'pagenumbers':
            await addPageNumbers();
            break;
        case 'jpgtopdf':
        case 'pngtopdf':
            await imageToPDF();
            break;
        default:
            console.error('Unknown tool:', tool);
            window.uiHandlers.showStatus('Invalid operation', 'error');
    }
}

/* ========================================
   UTILITY FUNCTIONS
   ======================================== */

/**
 * Validate PDF file
 * @param {ArrayBuffer} arrayBuffer - PDF file buffer
 * @returns {boolean} Is valid PDF
 */
async function isValidPDF(arrayBuffer) {
    try {
        await PDFDocument.load(arrayBuffer);
        return true;
    } catch (error) {
        return false;
    }
}

/**
 * Get PDF metadata
 * @param {ArrayBuffer} arrayBuffer - PDF file buffer
 * @returns {Object} PDF metadata
 */
async function getPDFMetadata(arrayBuffer) {
    try {
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        
        return {
            pageCount: pdfDoc.getPageCount(),
            title: pdfDoc.getTitle() || 'Untitled',
            author: pdfDoc.getAuthor() || 'Unknown',
            subject: pdfDoc.getSubject() || '',
            creator: pdfDoc.getCreator() || '',
            keywords: pdfDoc.getKeywords() || '',
            creationDate: pdfDoc.getCreationDate() || null,
            modificationDate: pdfDoc.getModificationDate() || null
        };
    } catch (error) {
        console.error('Error getting PDF metadata:', error);
        return null;
    }
}

/**
 * Rotate PDF pages
 * @param {ArrayBuffer} arrayBuffer - PDF file buffer
 * @param {number} angle - Rotation angle (90, 180, 270)
 * @returns {Uint8Array} Modified PDF bytes
 */
async function rotatePDF(arrayBuffer, angle) {
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const pages = pdfDoc.getPages();
    
    pages.forEach(page => {
        page.setRotation(degrees(angle));
    });
    
    return await pdfDoc.save();
}

/* ========================================
   EXPORTS
   ======================================== */

window.pdfOperations = {
    processPDFOperation,
    splitPDF,
    mergePDF,
    compressPDF,
    addPageNumbers,
    imageToPDF,
    isValidPDF,
    getPDFMetadata,
    rotatePDF
};