import React, { useRef, useState } from 'react';
import { Trainee, Staff } from '../types';
import { Upload, FileSpreadsheet, Users, Trash2 } from 'lucide-react';

// Declaration for the globally loaded SheetJS library
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
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

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
        
        // Assume first sheet contains trainees
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = window.XLSX.utils.sheet_to_json(ws);

        // Map data to Trainee interface (Simple heuristic mapping)
        const newTrainees: Trainee[] = data.map((row: any, index: number) => ({
          id: row['ID'] || row['الرقم'] || Date.now().toString() + index,
          name: row['Name'] || row['الاسم'] || 'Unknown',
          trainingNumber: row['Training Number'] || row['الرقم التدريبي'] || '000',
          department: row['Department'] || row['القسم'] || 'عام',
          specialization: row['Specialization'] || row['التخصص'] || '',
        }));

        if (newTrainees.length > 0) {
          setTrainees([...trainees, ...newTrainees]);
          setImportStatus('success');
          setMessage(`تم استيراد ${newTrainees.length} متدرب بنجاح.`);
        } else {
          setImportStatus('error');
          setMessage('لم يتم العثور على بيانات صالحة في الملف.');
        }
      } catch (err) {
        console.error(err);
        setImportStatus('error');
        setMessage('حدث خطأ أثناء قراءة الملف. تأكد من صيغة ملف Excel.');
      }
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">إدارة البيانات</h2>
      
      {/* Import Section */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-blue-600 mb-4 flex items-center gap-2">
          <FileSpreadsheet /> استيراد بيانات المتدربين (Excel)
        </h3>
        
        <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center bg-gray-50 hover:bg-blue-50 transition cursor-pointer" onClick={() => fileInputRef.current?.click()}>
          <Upload className="mx-auto text-gray-400 mb-2" size={48} />
          <p className="text-gray-600 font-medium">اضغط هنا لرفع ملف Excel</p>
          <p className="text-xs text-gray-400 mt-1">يجب أن يحتوي الملف على أعمدة: الاسم، الرقم التدريبي، القسم</p>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            className="hidden" 
            accept=".xlsx, .xls, .csv" 
          />
        </div>

        {importStatus === 'success' && (
          <div className="mt-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm text-center">
            {message}
          </div>
        )}
        {importStatus === 'error' && (
          <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm text-center">
            {message}
          </div>
        )}
      </div>

      {/* Trainees List Preview */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
         <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <Users /> قائمة المتدربين المسجلين ({trainees.length})
            </h3>
            {trainees.length > 0 && (
              <button 
                onClick={() => setTrainees([])}
                className="text-red-500 hover:bg-red-50 px-3 py-1 rounded text-sm flex items-center gap-1 transition"
              >
                <Trash2 size={16} /> مسح الكل
              </button>
            )}
         </div>
         
         <div className="max-h-64 overflow-y-auto border rounded-lg">
            <table className="w-full text-sm text-right">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="p-3 border-b">الاسم</th>
                  <th className="p-3 border-b">الرقم التدريبي</th>
                  <th className="p-3 border-b">القسم</th>
                </tr>
              </thead>
              <tbody>
                {trainees.map((t, idx) => (
                  <tr key={idx} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="p-3">{t.name}</td>
                    <td className="p-3 font-mono">{t.trainingNumber}</td>
                    <td className="p-3">{t.department}</td>
                  </tr>
                ))}
                {trainees.length === 0 && (
                  <tr>
                    <td colSpan={3} className="p-8 text-center text-gray-400">لا توجد بيانات</td>
                  </tr>
                )}
              </tbody>
            </table>
         </div>
      </div>
    </div>
  );
};

export default DataImport;