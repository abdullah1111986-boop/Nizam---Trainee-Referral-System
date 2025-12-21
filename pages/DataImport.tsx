import React, { useRef, useState } from 'react';
import { Trainee, Staff } from '../types';
import { Upload, FileSpreadsheet, Users, Trash2, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

declare global {
  interface Window {
    XLSX: any;
  }
}

interface DataImportProps {
  trainees: Trainee[];
  setTrainees: (data: Trainee[]) => void;
  staff: Staff[];
  setStaff: (data: Staff[]) => void;
}

const DataImport: React.FC<DataImportProps> = ({ trainees, setTrainees, staff, setStaff }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportStatus('loading');

    if (!window.XLSX) {
      setImportStatus('error');
      setMessage('مكتبة معالجة الملفات غير متوفرة. تأكد من الاتصال بالإنترنت.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = window.XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = window.XLSX.utils.sheet_to_json(ws);

        const newTrainees: Trainee[] = data.map((row: any, index: number) => ({
          id: row['ID'] || row['الرقم'] || Date.now().toString() + index,
          name: row['Name'] || row['الاسم'] || row['اسم المتدرب'] || 'غير معروف',
          trainingNumber: String(row['Training Number'] || row['الرقم التدريبي'] || '000'),
          department: row['Department'] || row['القسم'] || 'التقنية الميكانيكية',
          specialization: row['Specialization'] || row['التخصص'] || '',
        }));

        if (newTrainees.length > 0) {
          setTrainees([...trainees, ...newTrainees]);
          setImportStatus('success');
          setMessage(`تم استيراد ${newTrainees.length} متدرب بنجاح إلى القائمة المحلية.`);
        } else {
          setImportStatus('error');
          setMessage('لم يتم العثور على بيانات صالحة في الملف. تأكد من وجود أعمدة (الاسم، الرقم التدريبي).');
        }
      } catch (err) {
        console.error(err);
        setImportStatus('error');
        setMessage('حدث خطأ أثناء قراءة الملف. تأكد من صيغة ملف Excel (.xlsx أو .xls).');
      }
    };
    reader.onerror = () => {
      setImportStatus('error');
      setMessage('فشل قراءة الملف.');
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-10">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">إدارة واستيراد البيانات</h2>
        <div className="bg-blue-100 text-blue-700 px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest">Excel Integration</div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
            <h3 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
              <Upload className="text-blue-600" size={20} /> رفع الملف
            </h3>
            
            <div 
              className={`border-2 border-dashed rounded-[1.5rem] p-8 text-center transition-all cursor-pointer group ${
                importStatus === 'loading' ? 'border-blue-400 bg-blue-50 cursor-wait' : 'border-slate-200 hover:border-blue-500 hover:bg-blue-50/30'
              }`}
              onClick={() => importStatus !== 'loading' && fileInputRef.current?.click()}
            >
              {importStatus === 'loading' ? (
                <Loader2 className="mx-auto text-blue-500 mb-4 animate-spin" size={40} />
              ) : (
                <FileSpreadsheet className="mx-auto text-slate-300 group-hover:text-blue-500 mb-4 transition-colors" size={40} />
              )}
              <p className="text-slate-600 font-bold text-sm">اسحب الملف أو اضغط للرفع</p>
              <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase">XLSX, XLS, CSV</p>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                className="hidden" 
                accept=".xlsx, .xls, .csv" 
              />
            </div>

            {importStatus === 'success' && (
              <div className="mt-6 p-4 bg-green-50 border border-green-100 text-green-700 rounded-2xl text-xs font-bold flex items-center gap-2 animate-bounce">
                <CheckCircle size={16} /> {message}
              </div>
            )}
            {importStatus === 'error' && (
              <div className="mt-6 p-4 bg-red-50 border border-red-100 text-red-700 rounded-2xl text-xs font-bold flex items-center gap-2">
                <AlertCircle size={16} /> {message}
              </div>
            )}
          </div>

          <div className="bg-slate-900 text-white p-8 rounded-[2rem] shadow-xl">
             <h4 className="font-black text-sm mb-4 flex items-center gap-2 text-blue-400">
               <AlertCircle size={16}/> ملاحظات هامة
             </h4>
             <ul className="text-[11px] space-y-3 font-bold text-slate-400 leading-relaxed">
               <li>• يجب أن يحتوي الملف على رؤوس أعمدة واضحة.</li>
               <li>• الأعمدة المدعومة: (الاسم، الرقم التدريبي، التخصص).</li>
               <li>• سيتم إضافة البيانات الجديدة إلى القائمة الحالية دون مسحها.</li>
               <li>• هذه البيانات تُحفظ مؤقتاً في جلسة العمل الحالية.</li>
             </ul>
          </div>
        </div>

        <div className="md:col-span-2">
          <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
                  <Users size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">المتدربون المسجلون</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Total: {trainees.length} Trainees</p>
                </div>
              </div>
              {trainees.length > 0 && (
                <button 
                  onClick={() => { if(confirm('هل تريد مسح جميع بيانات المتدربين المستوردة؟')) setTrainees([]); }}
                  className="bg-red-50 text-red-600 hover:bg-red-100 px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all active:scale-95"
                >
                  <Trash2 size={14} /> مسح الكل
                </button>
              )}
            </div>
            
            <div className="max-h-[500px] overflow-y-auto">
              <table className="w-full text-right">
                <thead className="bg-white sticky top-0 z-10">
                  <tr className="border-b border-slate-100">
                    <th className="p-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">اسم المتدرب</th>
                    <th className="p-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">الرقم التدريبي</th>
                    <th className="p-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">التخصص</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {trainees.map((t, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="p-5">
                        <p className="font-bold text-slate-800 text-sm group-hover:text-blue-600 transition-colors">{t.name}</p>
                        <p className="text-[10px] text-slate-400 font-medium">ID: {t.id.substring(0,8)}</p>
                      </td>
                      <td className="p-5">
                        <span className="bg-slate-100 px-3 py-1 rounded-lg font-mono text-xs text-slate-600 font-bold tracking-wider">{t.trainingNumber}</span>
                      </td>
                      <td className="p-5 text-xs text-slate-500 font-bold">{t.specialization || 'غير محدد'}</td>
                    </tr>
                  ))}
                  {trainees.length === 0 && (
                    <tr>
                      <td colSpan={3} className="p-20 text-center">
                        <div className="flex flex-col items-center gap-4 opacity-20">
                          <Users size={64} />
                          <p className="font-black text-lg">لا توجد بيانات مستوردة</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataImport;
