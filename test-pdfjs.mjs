import * as pdfjs from 'pdfjs-dist';
console.log('Keys:', Object.keys(pdfjs));
console.log('Default:', !!pdfjs.default);
if (pdfjs.default) {
    console.log('Default Keys:', Object.keys(pdfjs.default));
}
console.log('GlobalWorkerOptions:', !!pdfjs.GlobalWorkerOptions);
console.log('getDocument:', !!pdfjs.getDocument);
