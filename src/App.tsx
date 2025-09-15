import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Send, Menu, User } from 'lucide-react';

export default function MyAutoChatbot() {
  const [carBrand, setCarBrand] = useState('');
  const [carModel, setCarModel] = useState('');
  const [code, setCode] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Helper to unescape markdown
  function unescapeMarkdown(text: string) {
    // Replace escaped asterisks, hashes, and newlines
    return text
      .replace(/\\n/g, '\n')
      .replace(/\\\*/g, '*')
      .replace(/\\#/g, '#');
  }

  const handleSubmit = async () => {
    if (!carBrand || !carModel || !code) {
      alert('Please fill all fields');
      return;
    }

    setResponse('');
    setIsLoading(true);

    const combinedPrompt = `Car Brand: ${carBrand}, Car Model: ${carModel}, Code: ${code}`;

    try {
      const res = await fetch("http://localhost:8000/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: combinedPrompt }),
      });

      if (!res.body) {
        throw new Error("No response body");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder("utf-8");

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n\n").filter(line => line.startsWith("data: "));

        for (let line of lines) {
          const data = JSON.parse(line.replace("data: ", ""));
          if (data.error) {
            setResponse(`Error: ${data.error}`);
            setIsLoading(false);
            return;
          }
          if (data.complete) {
            setIsLoading(false);
            return;
          }
          setResponse(prev => prev + unescapeMarkdown(data.text));
        }
      }
    } catch (err) {
      console.error(err);
      setResponse("Error: Unable to get response from AI");
      setIsLoading(false);
    }
  };

  const clearAll = () => {
    setCarBrand('');
    setCarModel('');
    setCode('');
    setResponse('');
  };

  return (
    <div className="max-w-md mx-auto bg-black rounded-3xl overflow-hidden shadow-2xl">
      {/* Status Bar */}
      <div className="bg-black px-4 py-2 flex justify-between items-center">
        <div className="w-6 h-6 bg-teal-500 rounded-full"></div>
        <div className="flex-1 mx-4 h-1 bg-teal-500 rounded-full"></div>
        <div className="flex space-x-1">
          <div className="w-1 h-4 bg-white"></div>
          <div className="w-1 h-4 bg-white"></div>
          <div className="w-1 h-4 bg-white"></div>
        </div>
      </div>

      {/* Header */}
      <div className="bg-white px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
            <User className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold text-black">MYAUTO</h1>
        </div>
        <Menu className="w-6 h-6 text-black" />
      </div>

      {/* Main Content */}
      <div className="bg-teal-600 px-6 py-8 min-h-96">
        {/* Response Area */}
        <div className="bg-gray-600 rounded-xl p-6 mb-8 min-h-48 max-h-64 overflow-y-auto flex items-start justify-start" style={{height: '16rem'}}>
          {response ? (
            <div className="text-white text-sm leading-relaxed w-full">
              <ReactMarkdown>{response}</ReactMarkdown>
              {isLoading && (
                <span className="inline-block w-2 h-4 bg-white ml-1 animate-pulse"></span>
              )}
            </div>
          ) : (
            <p className="text-gray-300 text-lg font-medium text-center w-full">
              {isLoading ? 'Processing...' : 'RESPONSE CONTENT'}
            </p>
          )}
        </div>

        {/* Input Fields */}
        <div className="mt-4 space-y-2">
          <input
            type="text"
            value={carBrand}
            onChange={(e) => setCarBrand(e.target.value)}
            placeholder="Car Brand"
            className="w-full p-3 rounded-lg bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black"
          />
          <input
            type="text"
            value={carModel}
            onChange={(e) => setCarModel(e.target.value)}
            placeholder="Car Model"
            className="w-full p-3 rounded-lg bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black"
          />
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Code"
            className="w-full p-3 rounded-lg bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-4 mt-8">
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="flex-1 bg-black text-white py-4 rounded-full text-lg font-medium flex items-center justify-center space-x-2 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
            <span>{isLoading ? 'Loading...' : 'Submit'}</span>
          </button>
          <button
            onClick={clearAll}
            className="px-6 bg-gray-700 text-white py-4 rounded-full text-lg font-medium hover:bg-gray-600"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="bg-black px-4 py-3 flex justify-center">
        <div className="w-12 h-12 bg-teal-600 rounded-full flex items-center justify-center">
          <div className="w-6 h-6 bg-teal-300 rounded-full"></div>
        </div>
      </div>
    </div>
  );
}
