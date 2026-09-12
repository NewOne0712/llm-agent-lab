'use client';

import { useState } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function Home() {
  const [message, setMessage] = useState('');
  const [history, setHistory] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [tokens, setTokens] = useState({ input: 0, output: 0 });

  const send = async () => {
    if (!message.trim() || loading) return;

    const userMsg = message.trim();
    setMessage('');
    setLoading(true);
    setError('');

    const newHistory: Message[] = [
      ...history,
      { role: 'user', content: userMsg },
    ];
    setHistory(newHistory);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg,
          history: history,
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setError(data.error || '请求失败');
        setHistory(history);
        setMessage(userMsg);
      } else {
        setHistory([
          ...newHistory,
          { role: 'assistant', content: data.reply },
        ]);
        setTokens(prev => ({
          input: prev.input + (data.usage?.input_tokens || 0),
          output: prev.output + (data.usage?.output_tokens || 0),
        }));
      }
    } catch (e: any) {
      setError(e.message || '网络错误');
      setHistory(history);
      setMessage(userMsg);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setHistory([]);
    setTokens({ input: 0, output: 0 });
    setError('');
  };

  return (
    <main className="min-h-screen p-4 md:p-8 max-w-3xl mx-auto">
      <header className="mb-6">
        <h1 className="text-3xl font-bold mb-1">LLM Agent Lab</h1>
        <p className="text-gray-500 text-sm">
          第一段对话 demo · 角色：艾琳 · 累计 {tokens.input + tokens.output} tokens
        </p>
      </header>

      <div className="border rounded-xl p-4 min-h-[500px] mb-4 bg-gradient-to-b from-gray-50 to-white">
        {history.length === 0 && (
          <div className="text-center text-gray-400 mt-20">
            <p className="text-lg mb-2">开始与艾琳对话...</p>
            <p className="text-sm">试试说：你好 / 你是谁 / 你喜欢什么</p>
          </div>
        )}

        <div className="space-y-3">
          {history.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-2xl ${
                  msg.role === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white border shadow-sm'
                }`}
              >
                <p className="whitespace-pre-wrap text-sm leading-relaxed">
                  {msg.content}
                </p>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-white border shadow-sm p-3 rounded-2xl">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          错误：{error}
        </div>
      )}

      <div className="flex gap-2 mb-3">
        <input
          className="flex-1 border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={message}
          onChange={e => setMessage(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          placeholder="输入消息，回车发送..."
          disabled={loading}
        />
        <button
          className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={send}
          disabled={loading || !message.trim()}
        >
          {loading ? '发送中...' : '发送'}
        </button>
      </div>

      {history.length > 0 && (
        <button
          onClick={clearChat}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          清空对话
        </button>
      )}

      <footer className="mt-12 pt-6 border-t text-center text-xs text-gray-400">
        <p>LLM Agent Lab · MVP v0.1 · DeepSeek 驱动</p>
        <p className="mt-1">
          <a href="https://github.com/NewOne0712/llm-agent-lab" className="hover:underline">
            GitHub
          </a>
        </p>
      </footer>
    </main>
  );
}
