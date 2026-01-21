
import React from 'react';
import { Student } from '../types';
import { ROWS, TABLES_PER_ROW, SEATS_PER_TABLE, ICONS } from '../constants';

interface ClassroomSetupProps {
  students: Student[];
  onUpdateStudent: (id: string, name: string) => void;
  onFinalize: () => void;
}

const ClassroomSetup: React.FC<ClassroomSetupProps> = ({ students, onUpdateStudent, onFinalize }) => {
  const getStudent = (r: number, t: number, s: number) => 
    students.find(st => st.row === r && st.table === t && st.seat === s);

  return (
    <div className="max-w-7xl mx-auto p-6 animate-fadeIn">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 flex items-center gap-3">
            {ICONS.Classroom} Thiết lập Sơ đồ lớp
          </h1>
          <p className="text-slate-500 mt-1">Nhập tên học sinh vào các vị trí ngồi (3 dãy, mỗi dãy 5 bàn, mỗi bàn 2 HS)</p>
        </div>
        <button 
          onClick={onFinalize}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg hover:shadow-blue-200 active:scale-95"
        >
          Duyệt chỗ ngồi & Tiếp tục
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[0, 1, 2].map(rowIndex => (
          <div key={rowIndex} className="space-y-6">
            <h2 className="text-center font-bold text-slate-400 uppercase tracking-widest bg-white py-2 rounded-lg shadow-sm">
              Dãy {rowIndex + 1}
            </h2>
            <div className="space-y-4">
              {[0, 1, 2, 3, 4].map(tableIndex => (
                <div key={tableIndex} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 transition-hover hover:border-blue-200">
                  <div className="text-xs font-bold text-slate-300 mb-2">BÀN {tableIndex + 1}</div>
                  <div className="flex gap-3">
                    {[0, 1].map(seatIndex => {
                      const student = getStudent(rowIndex, tableIndex, seatIndex);
                      return (
                        <div key={seatIndex} className="flex-1">
                          <input
                            type="text"
                            placeholder={`HS ${seatIndex + 1}`}
                            value={student?.name || ''}
                            onChange={(e) => onUpdateStudent(student!.id, e.target.value)}
                            className={`w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all ${
                              student?.name ? 'border-blue-200 bg-blue-50' : 'border-slate-200 bg-slate-50'
                            }`}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ClassroomSetup;
