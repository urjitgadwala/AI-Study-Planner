"use client";

import React, { useState } from 'react';
import { extractTextFromPdf } from '@/lib/pdfParser';
import { parseSyllabusFromText } from '@/lib/gemini';
import { Topic } from '@/lib/types';

interface PdfImportModalProps {
    onTopicsAdded: (topics: Topic[]) => void;
    onCancel: () => void;
}

export default function PdfImportModal({ onTopicsAdded, onCancel }: PdfImportModalProps) {
    const [file, setFile] = useState<File | null>(null);
    const [status, setStatus] = useState<'idle' | 'extracting' | 'analyzing' | 'done' | 'error'>('idle');
    const [foundTopics, setFoundTopics] = useState<Topic[]>([]);
    const [errorMessage, setErrorMessage] = useState('');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setStatus('idle');
        }
    };

    const handleImport = async () => {
        if (!file) return;

        setStatus('extracting');
        try {
            const text = await extractTextFromPdf(file);

            setStatus('analyzing');
            const topics = await parseSyllabusFromText(text);

            if (topics.length > 0) {
                setFoundTopics(topics);
                setStatus('done');
            } else {
                setErrorMessage("No topics could be extracted from this PDF. Please try a different file.");
                setStatus('error');
            }
        } catch (err) {
            console.error(err);
            setErrorMessage("An error occurred while processing the PDF.");
            setStatus('error');
        }
    };

    return (
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="p-8">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-2xl font-black text-slate-800">Import Syllabus PDF</h2>
                        <p className="text-sm text-slate-500">AI will extract and categorize topics for you.</p>
                    </div>
                    <button onClick={onCancel} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {status === 'idle' && (
                    <div className="space-y-6">
                        <div className="border-2 border-dashed border-slate-200 rounded-2xl p-10 text-center hover:border-indigo-400 transition-all cursor-pointer relative group">
                            <input
                                type="file"
                                accept=".pdf"
                                onChange={handleFileChange}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                            <div className="flex flex-col items-center">
                                <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                    </svg>
                                </div>
                                <div className="font-bold text-slate-700">{file ? file.name : 'Select or Drag PDF'}</div>
                                <div className="text-xs text-slate-400 mt-1">Syllabus documents, chapter lists, etc.</div>
                            </div>
                        </div>

                        <button
                            disabled={!file}
                            onClick={handleImport}
                            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold shadow-lg shadow-indigo-100 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                            Start AI Extraction
                        </button>
                    </div>
                )}

                {(status === 'extracting' || status === 'analyzing') && (
                    <div className="py-20 text-center">
                        <div className="inline-block w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-6"></div>
                        <h3 className="text-xl font-bold text-slate-800 animate-pulse">
                            {status === 'extracting' ? 'Extracting Text...' : 'AI Engine is Analyzing Syllabus...'}
                        </h3>
                        <p className="text-sm text-slate-400 mt-2">This may take a few seconds depending on PDF size.</p>
                    </div>
                )}

                {status === 'error' && (
                    <div className="py-10 text-center">
                        <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-slate-800">Extraction Failed</h3>
                        <p className="text-sm text-slate-500 mt-2 mb-8">{errorMessage}</p>
                        <button
                            onClick={() => setStatus('idle')}
                            className="px-8 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-all"
                        >
                            Try Again
                        </button>
                    </div>
                )}

                {status === 'done' && (
                    <div className="space-y-6">
                        <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl flex items-center gap-4">
                            <div className="text-emerald-500 text-2xl">⚡</div>
                            <div>
                                <div className="font-bold text-emerald-900">Analysis Successful!</div>
                                <div className="text-xs text-emerald-700">Found {foundTopics.length} topics across 3 subjects.</div>
                            </div>
                        </div>

                        <div className="max-h-60 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                            {foundTopics.map((t, idx) => (
                                <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-center text-sm">
                                    <span className="font-bold text-slate-700 truncate mr-2">{t.name}</span>
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${t.subject === 'Physics' ? 'bg-blue-100 text-blue-600' :
                                        t.subject === 'Chemistry' ? 'bg-orange-100 text-orange-600' :
                                            'bg-purple-100 text-purple-600'
                                        }`}>
                                        {t.subject}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={() => setStatus('idle')}
                                className="flex-1 py-4 px-6 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-bold transition-all"
                            >
                                Back
                            </button>
                            <button
                                onClick={() => onTopicsAdded(foundTopics)}
                                className="flex-2 py-4 px-10 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold shadow-lg shadow-indigo-200 transition-all"
                            >
                                Add All {foundTopics.length} Topics
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
