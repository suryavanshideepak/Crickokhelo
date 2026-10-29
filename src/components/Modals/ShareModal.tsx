"use client";

import React, { useState } from "react";
import { Match } from "@/types/cricket";
import { exportMatchAsJSON, generateMatchShareText } from "@/utils/storage";
import { X, Copy, Check, Download, Upload, Printer, Share2 } from "lucide-react";
import { sounds } from "@/utils/audio";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  match: Match;
  onImportMatch: (importedMatch: Match) => void;
}

export default function ShareModal({
  isOpen,
  onClose,
  match,
  onImportMatch,
}: ShareModalProps) {
  if (!isOpen) return null;

  const [copied, setCopied] = useState(false);
  const shareText = generateMatchShareText(match);

  const handleCopy = () => {
    sounds.vibrate(30);
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportJSON = () => {
    sounds.vibrate(30);
    exportMatchAsJSON(match);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed && parsed.id && parsed.innings) {
          sounds.vibrate(50);
          onImportMatch(parsed);
          onClose();
        } else {
          alert("Invalid Cricket Match JSON format.");
        }
      } catch (err) {
        alert("Error parsing JSON file: " + (err as Error).message);
      }
    };
    reader.readAsText(file);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-[#0d1624] border border-emerald-500/30 rounded-2xl p-5 text-white shadow-2xl flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-600/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Share & Export Match</h2>
              <p className="text-xs text-slate-400">Export as text, JSON, or print scorecard</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Text Share Card */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Shareable Summary (WhatsApp / SMS):
            </label>
            <button
              onClick={handleCopy}
              className="text-xs flex items-center gap-1 bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 px-2.5 py-1 rounded-lg border border-emerald-500/30 transition tap-btn font-medium"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Copied!" : "Copy Text"}</span>
            </button>
          </div>

          <pre className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 font-mono whitespace-pre-wrap leading-relaxed select-all">
            {shareText}
          </pre>
        </div>

        {/* Export & Import JSON */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800">
          {/* Download JSON */}
          <button
            onClick={handleExportJSON}
            className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-left flex items-center gap-3 transition tap-btn"
          >
            <div className="w-9 h-9 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center shrink-0">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-white block">Export JSON File</span>
              <span className="text-[11px] text-slate-400">Download complete data</span>
            </div>
          </button>

          {/* Import JSON */}
          <label className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-left flex items-center gap-3 transition tap-btn cursor-pointer">
            <div className="w-9 h-9 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-white block">Import Match JSON</span>
              <span className="text-[11px] text-slate-400">Restore or load match</span>
            </div>
            <input
              type="file"
              accept=".json"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        </div>

        {/* Print Scorecard Action */}
        <div className="pt-2">
          <button
            onClick={handlePrint}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold flex items-center justify-center gap-2 tap-btn"
          >
            <Printer className="w-4 h-4" />
            <span>Print Official Scorecard / Save as PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
}
