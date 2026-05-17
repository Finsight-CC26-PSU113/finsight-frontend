import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { UploadCloud, FileText, CheckCircle, Sparkles } from 'lucide-react';

export const UploadPage = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const simulateProcessing = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setResult({
        merchant: "Starbucks",
        amount: 54000,
        date: new Date().toLocaleDateString('id-ID'),
        category: "Makanan",
      });
    }, 2000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Pindai Struk</h1>
        <p className="text-slate-500">Unggah struk dan biarkan AI mengekstrak detailnya secara otomatis.</p>
      </div>

      <Card className="p-8">
        {!file && !isProcessing && !result && (
          <div 
            className={`border-2 border-dashed rounded-2xl p-12 text-center transition-colors ${
              isDragging ? 'border-primary-500 bg-primary-50' : 'border-slate-300 hover:border-primary-400'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4 text-primary-600">
              <UploadCloud className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Tarik & lepas struk Anda di sini</h3>
            <p className="text-slate-500 mb-6">Mendukung JPG, PNG, PDF (Maks 5MB)</p>
            
            <input 
              type="file" 
              id="file-upload" 
              className="hidden" 
              accept="image/*,.pdf"
              onChange={handleFileChange}
            />
            <label htmlFor="file-upload">
              <Button as="span" variant="outline" className="cursor-pointer">
                Pilih Berkas
              </Button>
            </label>
          </div>
        )}

        {file && !isProcessing && !result && (
          <div className="text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-600">
              <FileText className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">{file.name}</h3>
            <p className="text-slate-500 mb-6">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            
            <div className="flex justify-center gap-4">
              <Button variant="ghost" onClick={() => setFile(null)}>Batal</Button>
              <Button onClick={simulateProcessing} className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Analisis dengan AI
              </Button>
            </div>
          </div>
        )}

        {isProcessing && (
          <div className="text-center py-12">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
              className="w-16 h-16 border-4 border-slate-200 border-t-primary-600 rounded-full mx-auto mb-6"
            />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">AI sedang menganalisis...</h3>
            <p className="text-slate-500">Mengekstrak nama toko, jumlah, dan tanggal.</p>
          </div>
        )}

        {result && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-6">Struk Diproses!</h3>
            
            <div className="bg-slate-50 rounded-xl p-6 text-left max-w-md mx-auto mb-6 space-y-4">
              <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                <span className="text-slate-500">Toko</span>
                <span className="font-semibold text-slate-900">{result.merchant}</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                <span className="text-slate-500">Jumlah</span>
                <span className="font-semibold text-slate-900">
                  {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(result.amount)}
                </span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                <span className="text-slate-500">Tanggal</span>
                <span className="font-semibold text-slate-900">{result.date}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Kategori</span>
                <span className="px-2 py-1 bg-ai-light text-ai-dark rounded-md text-xs font-semibold">
                  {result.category}
                </span>
              </div>
            </div>

            <div className="flex justify-center gap-4">
              <Button variant="outline" onClick={() => { setFile(null); setResult(null); }}>
                Pindai Lainnya
              </Button>
              <Button>
                Simpan Transaksi
              </Button>
            </div>
          </motion.div>
        )}
      </Card>
    </div>
  );
};
