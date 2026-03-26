import React, { useState, useRef } from 'react';
import { 
  ExternalLink, Upload, FileText, File, Trash2, BookOpen, 
  BrainCircuit, Link as LinkIcon, Download, LayoutDashboard, 
  Folder, CheckCircle2, XCircle, Clock, AlertTriangle, ChevronDown, ChevronUp, Settings, Save
} from 'lucide-react';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, ComposedChart 
} from 'recharts';

import { dailyProgress, weeklyProgress, monthlyProgress, weakAreas } from './data/progress';
import { resources } from './data/resources';
import { aiQuestions } from './data/aiQuestions';

// モックの初期データ（AI作成問題のサンプル）
const INITIAL_FILES = [
  { id: '1', name: '【AI予想】2026年_難関大英語_長文読解.pdf', size: 1024 * 1024 * 2.5, date: new Date().toISOString(), type: 'application/pdf' },
  { id: '2', name: '【AI作成】数学III_微積分_標準問題集.docx', size: 1024 * 512, date: new Date(Date.now() - 86400000).toISOString(), type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' },
];

const ALL_SUBJECTS = ['数学', '英語', '国語', '理科', '社会'];

type TabType = 'dashboard' | 'resources' | 'ai-questions' | 'files' | 'settings';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [files, setFiles] = useState(INITIAL_FILES);
  const [isDragging, setIsDragging] = useState(false);
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);
  const [activeSubject, setActiveSubject] = useState<string>('数学');
  
  // Settings State
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(ALL_SUBJECTS);
  const [isDataCleared, setIsDataCleared] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- File Management Handlers ---
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = (newFiles: globalThis.File[]) => {
    const newFileObjects = newFiles.map(file => ({
      id: Math.random().toString(36).substring(7),
      name: file.name,
      size: file.size,
      date: new Date().toISOString(),
      type: file.type,
    }));
    setFiles(prev => [...newFileObjects, ...prev]);
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  const getFileIcon = (type: string, name: string) => {
    if (type.includes('pdf') || name.endsWith('.pdf')) return <FileText className="w-6 h-6 text-red-500" />;
    if (type.includes('word') || name.endsWith('.doc') || name.endsWith('.docx')) return <FileText className="w-6 h-6 text-blue-600" />;
    return <File className="w-6 h-6 text-gray-500" />;
  };

  const downloadQuestionsAsText = () => {
    const content = aiQuestions[activeSubject as keyof typeof aiQuestions].map((q, i) => 
      `問題${i+1} [${q.difficulty}]\n${q.question}\n\n解答:\n${q.answer}\n\n解説:\n${q.explanation}\n\n-----------------------------------\n`
    ).join('\n');
    
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AI予想問題_${activeSubject}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const toggleSubject = (subject: string) => {
    setSelectedSubjects(prev => 
      prev.includes(subject) 
        ? prev.filter(s => s !== subject)
        : [...prev, subject]
    );
  };

  const clearData = () => {
    if (window.confirm('学習データを初期状態（空）に戻しますか？')) {
      setIsDataCleared(true);
      setFiles([]);
    }
  };

  // --- Render Functions ---
  const renderDashboard = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 text-slate-500 mb-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            <h3 className="font-medium">本日の正答数</h3>
          </div>
          <p className="text-3xl font-bold text-slate-900">{isDataCleared ? '0' : '40'} <span className="text-sm font-normal text-slate-500">問</span></p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 text-slate-500 mb-2">
            <XCircle className="w-5 h-5 text-red-500" />
            <h3 className="font-medium">本日の誤答数</h3>
          </div>
          <p className="text-3xl font-bold text-slate-900">{isDataCleared ? '0' : '8'} <span className="text-sm font-normal text-slate-500">問</span></p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 text-slate-500 mb-2">
            <Clock className="w-5 h-5 text-indigo-500" />
            <h3 className="font-medium">本日の学習時間</h3>
          </div>
          <p className="text-3xl font-bold text-slate-900">{isDataCleared ? '0' : '240'} <span className="text-sm font-normal text-slate-500">分</span></p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-800 mb-6">学習時間と正答率の推移（直近7日間）</h3>
        <div className="h-80 w-full">
          {isDataCleared ? (
            <div className="h-full w-full flex flex-col items-center justify-center text-slate-400">
              <LineChart className="w-12 h-12 mb-4 opacity-50" />
              <p>データがありません。学習を記録するとグラフが表示されます。</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={dailyProgress} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis yAxisId="left" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} label={{ value: '学習時間 (分)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#64748b', fontSize: 12 } }} />
                <YAxis yAxisId="right" orientation="right" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} label={{ value: '正答率 (%)', angle: 90, position: 'insideRight', style: { textAnchor: 'middle', fill: '#64748b', fontSize: 12 } }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                <Bar yAxisId="left" dataKey="studyTime" name="学習時間" fill="#818cf8" radius={[4, 4, 0, 0]} barSize={30} />
                <Line yAxisId="right" type="monotone" dataKey="accuracy" name="正答率" stroke="#f43f5e" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-5 h-5 text-amber-500" />
          <h3 className="text-lg font-semibold text-slate-800">重点的に復習すべき分野（AI分析）</h3>
        </div>
        <div className="space-y-4">
          {isDataCleared ? (
            <p className="text-slate-500 text-sm text-center py-4">学習データが蓄積されると、AIが弱点を分析して表示します。</p>
          ) : (
            weakAreas.filter(area => selectedSubjects.includes(area.subject)).map((area, idx) => (
              <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-amber-50/50 border border-amber-100 rounded-lg gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-xs font-bold rounded">{area.subject}</span>
                    <span className="font-semibold text-slate-800">{area.topic}</span>
                  </div>
                  <p className="text-sm text-slate-600">{area.suggestion}</p>
                </div>
                <div className="flex flex-col items-end shrink-0">
                  <span className="text-xs text-slate-500 mb-1">誤答率</span>
                  <span className="text-lg font-bold text-red-500">{area.errorRate}%</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );

  const renderResources = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <p className="text-slate-600 text-sm">大学受験に役立つ参考書やウェブサイトのリンク集です。定期的にリンク切れの確認を行っています。</p>
        <button className="text-xs flex items-center justify-center gap-1 text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-full transition-colors shrink-0">
          <CheckCircle2 className="w-3.5 h-3.5" />
          リンク状態確認済
        </button>
      </div>

      {Object.entries(resources)
        .filter(([subject]) => selectedSubjects.includes(subject))
        .map(([subject, items]) => (
        <div key={subject} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="bg-slate-50 px-6 py-3 border-b border-slate-200">
            <h3 className="font-bold text-slate-800 text-lg">{subject}</h3>
          </div>
          <div className="divide-y divide-slate-100">
            {items.map((item, idx) => (
              <a 
                key={idx} 
                href={item.link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-start p-4 sm:p-6 hover:bg-slate-50 transition-colors group"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded whitespace-nowrap ${
                      item.type === '参考書' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {item.type}
                    </span>
                    <h4 className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">{item.title}</h4>
                  </div>
                  <p className="text-sm text-slate-600 mt-2">{item.desc}</p>
                </div>
                <ExternalLink className="w-5 h-5 text-slate-400 group-hover:text-indigo-500 ml-4 shrink-0 mt-1" />
              </a>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  const renderAiQuestions = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex flex-wrap gap-2">
          {Object.keys(aiQuestions)
            .filter(subject => selectedSubjects.includes(subject))
            .map(subject => (
            <button
              key={subject}
              onClick={() => setActiveSubject(subject)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeSubject === subject 
                  ? 'bg-indigo-600 text-white shadow-sm' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {subject}
            </button>
          ))}
        </div>
        <button 
          onClick={downloadQuestionsAsText}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors shrink-0"
        >
          <Download className="w-4 h-4" />
          テキストで保存
        </button>
      </div>

      <div className="space-y-4">
        {aiQuestions[activeSubject as keyof typeof aiQuestions]?.map((q, idx) => (
          <div key={q.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div 
              className="p-4 sm:p-5 cursor-pointer hover:bg-slate-50 transition-colors flex items-start justify-between gap-4"
              onClick={() => setExpandedQuestion(expandedQuestion === q.id ? null : q.id)}
            >
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-bold text-slate-400">問題 {idx + 1}</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                    q.difficulty === '難' ? 'bg-red-100 text-red-700' : 
                    q.difficulty === 'やや難' ? 'bg-amber-100 text-amber-700' : 
                    'bg-emerald-100 text-emerald-700'
                  }`}>
                    {q.difficulty}
                  </span>
                </div>
                <p className="text-slate-800 font-medium whitespace-pre-wrap text-sm sm:text-base">{q.question}</p>
              </div>
              {expandedQuestion === q.id ? (
                <ChevronUp className="w-5 h-5 text-slate-400 shrink-0 mt-1" />
              ) : (
                <ChevronDown className="w-5 h-5 text-slate-400 shrink-0 mt-1" />
              )}
            </div>
            
            {expandedQuestion === q.id && (
              <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">解答</h4>
                  <p className="text-slate-900 font-medium whitespace-pre-wrap text-sm sm:text-base">{q.answer}</p>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">解説</h4>
                  <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">{q.explanation}</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      <p className="text-xs text-slate-500 text-center mt-4 px-4">
        ※この問題集はAIによって過去の入試傾向を分析し生成された予想問題です。PDFやWord形式で保存するには「テキストで保存」からダウンロードし、各ソフトに貼り付けてご利用ください。
      </p>
    </div>
  );

  const renderFiles = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Upload Area */}
        <div 
          className={`p-6 sm:p-10 border-b border-slate-200 border-dashed transition-colors ${
            isDragging ? 'bg-indigo-50 border-indigo-400' : 'bg-slate-50/50 hover:bg-slate-50'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            multiple 
            accept=".pdf,.doc,.docx,.txt"
            onChange={handleFileInput}
          />
          <div className="flex flex-col items-center justify-center text-center cursor-pointer">
            <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center mb-4 ${
              isDragging ? 'bg-indigo-100 text-indigo-600' : 'bg-white shadow-sm text-slate-400'
            }`}>
              <Upload className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <h3 className="text-sm sm:text-base font-semibold text-slate-700 mb-1">
              クリックまたはドラッグ＆ドロップでアップロード
            </h3>
            <p className="text-xs sm:text-sm text-slate-500">
              PDF, Wordファイルに対応 (予想問題やAI作成問題を保存・管理できます)
            </p>
          </div>
        </div>

        {/* File List */}
        <div className="divide-y divide-slate-100">
          {files.length === 0 ? (
            <div className="p-8 sm:p-12 text-center text-slate-500 text-sm">
              アップロードされた問題はまだありません。
            </div>
          ) : (
            files.map((file) => (
              <div key={file.id} className="flex items-center p-4 sm:p-5 hover:bg-slate-50 transition-colors group">
                <div className="flex-shrink-0 mr-3 sm:mr-4">
                  {getFileIcon(file.type, file.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">
                    {file.name}
                  </p>
                  <div className="flex items-center mt-1 text-xs text-slate-500 gap-2 sm:gap-3">
                    <span>{formatSize(file.size)}</span>
                    <span className="hidden sm:inline">•</span>
                    <span className="hidden sm:inline">{formatDate(file.date)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 sm:gap-2 ml-2 sm:ml-4 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                  <button 
                    className="p-1.5 sm:p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                    title="ダウンロード (デモ)"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(file.id);
                    }}
                    className="p-1.5 sm:p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    title="削除"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-2xl mx-auto">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-800">科目設定</h2>
          <p className="text-sm text-slate-500 mt-1">受験に必要な科目を選択してください。選択した科目のみがダッシュボードや問題集に表示されます。</p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {ALL_SUBJECTS.map(subject => (
              <label 
                key={subject} 
                className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedSubjects.includes(subject) 
                    ? 'border-indigo-600 bg-indigo-50/50' 
                    : 'border-slate-200 hover:border-indigo-300'
                }`}
              >
                <input 
                  type="checkbox" 
                  className="w-5 h-5 text-indigo-600 rounded border-slate-300 focus:ring-indigo-600"
                  checked={selectedSubjects.includes(subject)}
                  onChange={() => toggleSubject(subject)}
                />
                <span className={`font-medium ${selectedSubjects.includes(subject) ? 'text-indigo-900' : 'text-slate-700'}`}>
                  {subject}
                </span>
              </label>
            ))}
          </div>
          <div className="mt-6 flex justify-end">
            <button className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors">
              <Save className="w-4 h-4" />
              設定を保存
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-red-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-red-100 bg-red-50/30">
          <h2 className="text-lg font-bold text-red-800">データ管理（デモ用）</h2>
          <p className="text-sm text-red-600 mt-1">アプリの初期状態（空のデータ）を確認するための機能です。</p>
        </div>
        <div className="p-6">
          <p className="text-sm text-slate-600 mb-4">
            実際のアプリでは、ユーザーが登録した直後はグラフやファイルが空の状態からスタートします。以下のボタンを押すことで、現在のモックデータをクリアし、初期状態をシミュレーションできます。
          </p>
          <button 
            onClick={clearData}
            disabled={isDataCleared}
            className={`flex items-center gap-2 px-6 py-2.5 font-medium rounded-lg transition-colors ${
              isDataCleared 
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                : 'bg-white border border-red-200 text-red-600 hover:bg-red-50'
            }`}
          >
            <Trash2 className="w-4 h-4" />
            {isDataCleared ? 'データクリア済み' : 'デモデータをクリアする'}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-indigo-600" />
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900">大学受験対策ポータル</h1>
          </div>
          
          {/* External Quick Links (from original request) */}
          <div className="hidden md:flex items-center gap-4 text-sm font-medium">
            <a href="https://www.toshin-kakomon.com/" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-indigo-600 transition-colors flex items-center gap-1">
              東進過去問 <ExternalLink className="w-3 h-3" />
            </a>
            <a href="https://passnavi.obunsha.co.jp/kakomon/" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-indigo-600 transition-colors flex items-center gap-1">
              パスナビ <ExternalLink className="w-3 h-3" />
            </a>
            <a href="https://www.flips.jp/" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-indigo-600 transition-colors flex items-center gap-1">
              Flips <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Navigation Tabs - Scrollable on mobile */}
        <div className="flex overflow-x-auto hide-scrollbar mb-6 sm:mb-8 border-b border-slate-200 -mx-4 px-4 sm:mx-0 sm:px-0">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'dashboard' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            進捗トラッカー
          </button>
          <button
            onClick={() => setActiveTab('resources')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'resources' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <LinkIcon className="w-4 h-4" />
            参考書・リンク
          </button>
          <button
            onClick={() => setActiveTab('ai-questions')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'ai-questions' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <BrainCircuit className="w-4 h-4" />
            AI問題集
          </button>
          <button
            onClick={() => setActiveTab('files')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'files' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <Folder className="w-4 h-4" />
            ファイル管理
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'settings' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <Settings className="w-4 h-4" />
            設定
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'resources' && renderResources()}
        {activeTab === 'ai-questions' && renderAiQuestions()}
        {activeTab === 'files' && renderFiles()}
        {activeTab === 'settings' && renderSettings()}

      </main>
    </div>
  );
}
