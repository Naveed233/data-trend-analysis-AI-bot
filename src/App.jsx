
import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, Sector } from 'recharts';
import { HelpCircle, GitBranch, KeyRound, Code, Network, AlertTriangle, GraduationCap, Users, Laptop, MousePointerClick, TrendingUp, Eye, Sparkles, Bot, X, UploadCloud, Eraser, FileText } from 'lucide-react';


// --- Placeholder Data for Text Areas ---
const keywordPlaceholder = `Category\tKeyword
GIT/VC\tpush
GIT/VC\tgit push
Authentication & Access\tAccess Token
Authentication & Access\ttoken
Programming & Development\tpip
Programming & Development\tpython
...`;

const trendingPlaceholder = `Term\tSearches\tCTR
push\t79\t59.50%
pip\t50\t58%
Function Overview\t49\t36.80%
...`;

const topicsPlaceholder = `Topic\tViews
I can't push\t266
Projects: Collaboration with Version Control\t251
403 error occurs when pushing\t190
...`;


// --- Reusable Components ---
const renderActiveShape = (props) => {
  const RADIAN = Math.PI / 180;
  const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 10) * cos;
  const sy = cy + (outerRadius + 10) * sin;
  const mx = cx + (outerRadius + 30) * cos;
  const my = cy + (outerRadius + 30) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 22;
  const ey = my;
  const textAnchor = cos >= 0 ? 'start' : 'end';

  return (
    <g>
      <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill} className="font-bold">
        {payload.name}
      </text>
      <Sector cx={cx} cy={cy} innerRadius={innerRadius} outerRadius={outerRadius} startAngle={startAngle} endAngle={endAngle} fill={fill} />
      <Sector cx={cx} cy={cy} startAngle={startAngle} endAngle={endAngle} innerRadius={outerRadius + 6} outerRadius={outerRadius + 10} fill={fill} />
      <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
      <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#333">{`${value} keywords`}</text>
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="#999">{`(${(percent * 100).toFixed(2)}%)`}</text>
    </g>
  );
};

const LoadingSpinner = () => (
    <div className="flex justify-center items-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
    </div>
);

const GeminiModal = ({ topic, onClose, explanation }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl transform transition-all max-h-[80vh] flex flex-col">
                <header className="p-4 border-b border-slate-200 flex justify-between items-center">
                    <h3 className="font-bold text-lg text-slate-800 flex items-center"><Sparkles className="h-5 w-5 mr-2 text-indigo-500"/>AI Topic Explanation</h3>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-100"><X className="h-5 w-5 text-slate-500"/></button>
                </header>
                <main className="p-6 overflow-y-auto">
                    <h4 className="font-bold text-slate-900 mb-2">Topic: "{topic}"</h4>
                    {explanation ? (
                        <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: explanation.replace(/\n/g, '<br />') }}></div>
                    ) : (
                        <LoadingSpinner />
                    )}
                </main>
            </div>
        </div>
    );
};

// --- Main App Component ---
export default function App() {
  // State for raw text inputs
  const [keywordInput, setKeywordInput] = useState('');
  const [trendingInput, setTrendingInput] = useState('');
  const [topicsInput, setTopicsInput] = useState('');

  // State for parsed chart data
  const [keywordData, setKeywordData] = useState([]);
  const [trendingSearchData, setTrendingSearchData] = useState([]);
  const [topTopicsData, setTopTopicsData] = useState([]);

  // App flow state
  const [isAnalyzed, setIsAnalyzed] = useState(false);
  const [error, setError] = useState('');

  // AI features state
  const [activeIndex, setActiveIndex] = useState(0);
  const [summary, setSummary] = useState('');
  const [recommendations, setRecommendations] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [modalTopic, setModalTopic] = useState(null);
  const [explanation, setExplanation] = useState('');

  // --- Data Parsing Logic ---
  const handleAnalyzeClick = () => {
    setError('');
    try {
        // Parse Keywords: Category -> Count
        const keywords = keywordInput.split('\n').slice(1).reduce((acc, line) => {
            const [category] = line.split('\t');
            if(category) {
                acc[category] = (acc[category] || 0) + 1;
            }
            return acc;
        }, {});
        const pieChartData = Object.entries(keywords).map(([name, value]) => ({ name, value }));
        setKeywordData(pieChartData);

        // Parse Trending Searches: Term, Searches, CTR
        const trending = trendingInput.split('\n').slice(1).map(line => {
            const [term, searches, ctr] = line.split('\t');
            return { term, searches: parseInt(searches) || 0, ctr: parseFloat(ctr) || 0 };
        });
        setTrendingSearchData(trending);

        // Parse Top Topics: Topic, Views
        const topics = topicsInput.split('\n').slice(1).map(line => {
            const [topic, views] = line.split('\t');
            return { topic, views: parseInt(views) || 0 };
        });
        setTopTopicsData(topics);
        
        if (pieChartData.length === 0 && trending.length === 0 && topics.length === 0) {
            setError("No data provided or data is in an incorrect format. Please paste tab-separated data and try again.");
            return;
        }

        setIsAnalyzed(true);
    } catch (e) {
        setError("Failed to parse data. Please ensure it is tab-separated and matches the placeholder format.");
        console.error(e);
    }
  };

  const handleReset = () => {
      setIsAnalyzed(false);
      setError('');
      setKeywordInput('');
      setTrendingInput('');
      setTopicsInput('');
      setKeywordData([]);
      setTrendingSearchData([]);
      setTopTopicsData([]);
      setSummary('');
      setRecommendations('');
  };

  // --- Gemini API Logic ---
  const onPieEnter = (_, index) => {
    setActiveIndex(index);
  };
  
  const callGeminiAPI = async (prompt) => {
      // (Implementation is the same as previous version)
      const chatHistory = [{ role: "user", parts: [{ text: prompt }] }];
      const payload = { contents: chatHistory };
      const apiKey = "";
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
      try {
        const response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        if (!response.ok) throw new Error(`API request failed with status ${response.status}`);
        const result = await response.json();
        if (result.candidates && result.candidates[0] && result.candidates[0].content) {
            return result.candidates[0].content.parts[0].text;
        } else {
            return "Error: Unexpected response format from the API.";
        }
      } catch (error) {
          return `Error: ${error.message}`;
      }
  };

  const handleGenerateAnalysis = async () => {
      setIsGenerating(true);
      setSummary('');
      setRecommendations('');
      const topTopicsText = topTopicsData.slice(0, 5).map(t => `'${t.topic}' (${t.views} views)`).join(', ');
      const topSearchText = trendingSearchData.slice(0, 5).map(s => `'${s.term}' (${s.searches} searches)`).join(', ');
      const summaryPrompt = `You are a data analyst for a developer support team. Based on the following data, write a concise summary of the main user problems. Top viewed topics: ${topTopicsText}. Top search terms: ${topSearchText}.`;
      const generatedSummary = await callGeminiAPI(summaryPrompt);
      setSummary(generatedSummary);
      const recommendationsPrompt = `Based on this analysis of user problems: "${generatedSummary}", suggest 3-5 concrete, actionable recommendations for the support team to improve documentation and reduce user friction.`;
      const generatedRecs = await callGeminiAPI(recommendationsPrompt);
      setRecommendations(generatedRecs);
      setIsGenerating(false);
  };
  
  const handleExplainTopic = async (topic) => {
      setModalTopic(topic);
      setExplanation('');
      const prompt = `You are a helpful assistant for developers. Explain the following topic to a beginner developer in a clear and simple way. If it is an error message, explain the common causes and how to fix it. If it is a concept, provide a simple code example if relevant. The topic is: "${topic}"`;
      const result = await callGeminiAPI(prompt);
      setExplanation(result);
  };

  // --- Render Logic ---
  if (!isAnalyzed) {
    return (
        <div className="bg-slate-50 min-h-screen font-sans text-slate-800 p-4 sm:p-6 lg:p-8">
            <header className="text-center max-w-4xl mx-auto mb-8">
                <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Dynamic Data Analysis Dashboard</h1>
                <p className="text-slate-500 mt-2 text-lg">Paste your tab-separated data from a spreadsheet to generate an interactive report with AI-powered insights.</p>
            </header>
            <div className="max-w-6xl mx-auto space-y-6">
                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="bg-white p-4 rounded-xl border">
                        <h3 className="font-bold flex items-center mb-2"><FileText className="h-5 w-5 mr-2 text-indigo-500"/>1. Keyword Categories</h3>
                        <textarea value={keywordInput} onChange={(e) => setKeywordInput(e.target.value)} placeholder={keywordPlaceholder} className="w-full h-48 text-xs p-2 border rounded-md font-mono bg-slate-50 focus:ring-2 focus:ring-indigo-500 focus:outline-none"></textarea>
                    </div>
                    <div className="bg-white p-4 rounded-xl border">
                        <h3 className="font-bold flex items-center mb-2"><TrendingUp className="h-5 w-5 mr-2 text-amber-500"/>2. Trending Searches</h3>
                        <textarea value={trendingInput} onChange={(e) => setTrendingInput(e.target.value)} placeholder={trendingPlaceholder} className="w-full h-48 text-xs p-2 border rounded-md font-mono bg-slate-50 focus:ring-2 focus:ring-indigo-500 focus:outline-none"></textarea>
                    </div>
                    <div className="bg-white p-4 rounded-xl border">
                        <h3 className="font-bold flex items-center mb-2"><Eye className="h-5 w-5 mr-2 text-green-500"/>3. Top Topics</h3>
                        <textarea value={topicsInput} onChange={(e) => setTopicsInput(e.target.value)} placeholder={topicsPlaceholder} className="w-full h-48 text-xs p-2 border rounded-md font-mono bg-slate-50 focus:ring-2 focus:ring-indigo-500 focus:outline-none"></textarea>
                    </div>
                </div>
                {error && <p className="text-red-600 text-center bg-red-100 p-3 rounded-md">{error}</p>}
                <div className="flex justify-center">
                    <button onClick={handleAnalyzeClick} className="bg-indigo-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-indigo-700 transition-transform hover:scale-105 flex items-center text-lg"><UploadCloud className="h-6 w-6 mr-2"/>Analyze Data</button>
                </div>
            </div>
        </div>
    );
  }

  // --- Render Dashboard View ---
  const totalTopicViews = topTopicsData.reduce((sum, item) => sum + item.views, 0);
  const totalSearches = trendingSearchData.reduce((sum, item) => sum + item.searches, 0);
  const topCategory = keywordData.length > 0 ? keywordData.reduce((max, current) => current.value > max.value ? current : max).name : 'N/A';

  return (
    <div className="bg-slate-50 min-h-screen font-sans text-slate-800 p-4 sm:p-6 lg:p-8">
      {modalTopic && <GeminiModal topic={modalTopic} onClose={() => setModalTopic(null)} explanation={explanation} />}
      <header className="mb-8 flex justify-between items-start">
        <div>
            <h1 className="text-4xl font-bold text-slate-900 tracking-tight">User Support & Activity Dashboard</h1>
            <p className="text-slate-500 mt-2 text-lg">An overview of user-reported issues, search trends, and topic engagement.</p>
        </div>
        <button onClick={handleReset} className="bg-slate-200 text-slate-700 font-bold py-2 px-4 rounded-lg hover:bg-slate-300 transition-colors flex items-center"><Eraser className="h-5 w-5 mr-2"/>Start Over</button>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center space-x-4"><div className="bg-indigo-100 p-3 rounded-full"><GitBranch className="h-8 w-8 text-indigo-600"/></div><div><p className="text-slate-500 text-sm">#1 Problem Category</p><p className="text-2xl font-bold">{topCategory}</p></div></div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center space-x-4"><div className="bg-green-100 p-3 rounded-full"><Eye className="h-8 w-8 text-green-600"/></div><div><p className="text-slate-500 text-sm">Total Topic Views</p><p className="text-2xl font-bold">{totalTopicViews.toLocaleString()}</p></div></div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center space-x-4"><div className="bg-amber-100 p-3 rounded-full"><TrendingUp className="h-8 w-8 text-amber-600"/></div><div><p className="text-slate-500 text-sm">Total Searches</p><p className="text-2xl font-bold">{totalSearches.toLocaleString()}</p></div></div>
      </div>
      
      <main className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h2 className="text-xl font-bold mb-1 flex items-center"><HelpCircle className="mr-2 text-indigo-500"/>Problem Category Breakdown</h2>
          <p className="text-slate-500 mb-4 text-sm">Distribution of keywords by category.</p>
          <ResponsiveContainer width="100%" height={300}><PieChart><Pie activeIndex={activeIndex} activeShape={renderActiveShape} data={keywordData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} fill="#8884d8" dataKey="value" onMouseEnter={onPieEnter}>{keywordData.map((entry, index) => <Cell key={`cell-${index}`} fill={['#6366F1', '#818CF8', '#A5B4FC', '#C7D2FE', '#F87171', '#34D399', '#A78BFA', '#FBBF24'][index % 8]} />)}</Pie></PieChart></ResponsiveContainer>
        </div>

        <div className="lg:col-span-3 grid grid-cols-1 gap-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h2 className="text-xl font-bold mb-1 flex items-center"><Bot className="mr-2 text-indigo-500"/>✨ AI-Powered Analysis</h2>
                <p className="text-slate-500 mb-4 text-sm">Click the button below to generate an AI summary and recommendations based on your data.</p>
                <button onClick={handleGenerateAnalysis} disabled={isGenerating} className="bg-indigo-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-600 disabled:bg-indigo-300 transition-colors flex items-center">{isGenerating ? 'Generating...' : 'Generate Analysis & Recommendations'}</button>
                {isGenerating && <LoadingSpinner />}
                {summary && (
                    <div className="mt-4 space-y-4">
                        <div className="bg-slate-100 p-4 rounded-lg"><h3 className="font-bold text-slate-800 mb-2">Analysis Summary</h3><p className="text-sm text-slate-700 whitespace-pre-wrap">{summary}</p></div>
                        {recommendations && (
                             <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-lg"><h3 className="font-bold text-green-800 mb-2">Recommendations</h3><p className="text-sm text-green-700 whitespace-pre-wrap">{recommendations}</p></div>
                        )}
                    </div>
                )}
            </div>
            
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h2 className="text-xl font-bold mb-1 flex items-center"><Eye className="mr-2 text-green-500"/>Top Viewed Topics</h2>
                <p className="text-slate-500 mb-4 text-sm">Most viewed support topics. Click ✨ for an AI explanation.</p>
                <div className="space-y-3 h-60 overflow-y-auto pr-2">
                    {topTopicsData.map((item, index) => (
                        <div key={index} className="flex items-center justify-between text-sm group">
                            <p className="truncate pr-4 text-slate-700">{index + 1}. {item.topic}</p>
                            <div className="flex items-center">
                                <p className="font-bold bg-slate-100 text-slate-800 px-2 py-1 rounded-md mr-2">{item.views}</p>
                                <button onClick={() => handleExplainTopic(item.topic)} className="p-1 rounded-full hover:bg-indigo-100 group-hover:opacity-100 opacity-50 transition-opacity" title="Explain with AI"><Sparkles className="h-5 w-5 text-indigo-500"/></button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      </main>
    </div>
  );
}
