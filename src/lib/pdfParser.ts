export async function extractTextFromPdf(file: File): Promise<string> {
    // Dynamically import pdfjs-dist - try multiple paths for better compatibility
    let pdfjsModule;
    try {
        // Try the standard export first
        pdfjsModule = await import('pdfjs-dist');
        if (!pdfjsModule.getDocument && !pdfjsModule.default?.getDocument) {
            console.warn("pdfjs-dist import returned empty. Trying specific path...");
            // @ts-ignore
            pdfjsModule = await import('pdfjs-dist/build/pdf.mjs');
        }
    } catch (importErr) {
        console.error("Failed to import pdfjs-dist module:", importErr);
        // Last resort local attempt: try the minified version
        try {
            // @ts-ignore
            pdfjsModule = await import('pdfjs-dist/build/pdf.min.mjs');
        } catch (minErr) {
            console.warn("Local PDF.js imports failed. Will try CDN fallback if needed.");
        }
    }

    // Identify the actual library object
    let mod = pdfjsModule as any;
    let pdfjs = mod?.getDocument ? mod : (mod?.default?.getDocument ? mod.default : null);

    // Ultimate fallback: Use unpkg CDN if local bundling is failing completely
    if (!pdfjs) {
        console.warn("All local PDF.js imports failed or returned empty modules. Attempting CDN fallback...");
        try {
            // We use a dynamic script injection for the ultimate fallback if needed, 
            // but for now let's just try to point to the unpkg build if we can
            // In a browser context, we can try to fetch the module from unpkg
            const version = '5.4.624';
            const cdnUrl = `https://unpkg.com/pdfjs-dist@${version}/build/pdf.min.mjs`;
            // @ts-ignore
            pdfjsModule = await import(/* webpackIgnore: true */ cdnUrl);
            mod = pdfjsModule;
            pdfjs = mod?.getDocument ? mod : (mod?.default?.getDocument ? mod.default : null);
        } catch (cdnErr) {
            console.error("CDN fallback also failed:", cdnErr);
        }
    }

    if (!pdfjs) {
        if (mod) {
            console.error("PDF.js module loaded but getDocument not found. Module keys:", Object.keys(mod));
            if (mod.default) {
                console.error("Default export keys:", Object.keys(mod.default));
            }
        }
        throw new Error("Failed to initialize PDF.js library components. Please ensure you have a stable internet connection for the CDN fallback.");
    }

    // Set worker path - using unpkg with .mjs for version 4+ compatibility
    if (!pdfjs.GlobalWorkerOptions.workerSrc) {
        const version = pdfjs.version || '5.4.624';
        pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${version}/build/pdf.worker.min.mjs`;
    }

    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjs.getDocument({
        data: arrayBuffer,
        useWorkerFetch: true,
        isEvalSupported: false
    });
    const pdf = await loadingTask.promise;

    let fullText = "";

    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
            .filter((item: any) => 'str' in item) // Only process TextItems, skip TextMarkedContent
            .map((item: any) => item.str)
            .join(" ");
        fullText += pageText + "\n";
    }

    return fullText;
}
