import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Send, User, Car, Zap } from 'lucide-react';

export default function MyAutoChatbot() {
  const [carBrand, setCarBrand] = useState('');
  const [carModel, setCarModel] = useState('');
  const [code, setCode] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);


  // Helper to unescape markdown
  function unescapeMarkdown(text: string) {
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
      const res = await fetch("https://863ee25a2cc2.ngrok-free.app/ai", {
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
  <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50 flex items-center justify-center">
      <div className="w-full max-w-6xl px-2 lg:px-0" style={{height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <div className="bg-white rounded-2xl lg:rounded-3xl shadow-xl border border-gray-200 overflow-hidden flex flex-col" style={{height: '90vh', minHeight: 600, maxHeight: '900px'}}>
          
          {/* Navbar */}
          <nav className="px-4 sm:px-6 lg:px-8 py-4 lg:py-5 bg-white border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-teal-600 to-blue-600 rounded-xl flex items-center justify-center">
                <Car className="w-5 h-5 lg:w-7 lg:h-7 text-white" />
              </div>
              <div>
                <h1 className="text-xl lg:text-2xl font-bold tracking-wide text-gray-900">MYAUTO</h1>
                <p className="text-xs lg:text-sm text-gray-500 hidden sm:block">
                  AI-Powered Diagnostic Assistant
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <div className="hidden md:flex items-center space-x-2 text-sm text-teal-700 font-semibold">
                <Zap className="w-4 h-4" />
                <span>AI Powered</span>
              </div>
            </div>
          </nav>

          <div className="flex flex-col lg:flex-row flex-1 min-h-0">
            {/* Main Content */}
            <div className="flex-1 flex flex-col min-h-0">
              
              {/* Response Area */}
              <div className="flex-1 px-2 sm:px-6 lg:px-8 py-3 sm:py-6 bg-gray-50 min-h-[200px] max-h-full overflow-y-auto"
                style={{minHeight: '40vh'}}>
                {response ? (
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                        <User className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1 bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                        <div className="prose prose-sm lg:prose-base max-w-none text-gray-800">
                          <ReactMarkdown>{response}</ReactMarkdown>
                          {isLoading && (
                            <span className="inline-flex items-center ml-2">
                              <div className="flex space-x-1">
                                <div className="w-2 h-2 bg-teal-600 rounded-full animate-pulse"></div>
                                <div className="w-2 h-2 bg-teal-600 rounded-full animate-pulse" style={{animationDelay: '0.1s'}}></div>
                                <div className="w-2 h-2 bg-teal-600 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                              </div>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                    <div className="w-16 h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-teal-100 to-blue-100 rounded-2xl flex items-center justify-center">
                      <Car className="w-8 h-8 lg:w-10 lg:h-10 text-teal-600" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-lg lg:text-xl font-semibold text-gray-800">
                        {isLoading ? 'Analyzing Your Vehicle...' : 'Ready to Help'}
                      </h3>
                      <p className="text-sm lg:text-base text-gray-500 max-w-md">
                        {isLoading 
                          ? 'Our AI is processing your diagnostic request. Please wait...' 
                          : 'Enter your car details and diagnostic code to get AI-powered assistance.'
                        }
                      </p>
                    </div>
                    {isLoading && (
                      <div className="flex space-x-1 mt-4">
                        <div className="w-3 h-3 bg-teal-500 rounded-full animate-bounce"></div>
                        <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-3 h-3 bg-teal-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Input Section */}
              <div className="px-2 sm:px-6 lg:px-8 py-2 sm:py-4 lg:py-6 bg-white border-t border-gray-100">
                <div className="space-y-2 sm:space-y-4">
                  {/* Input Fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 lg:gap-4">
                    <div className="relative">
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Car Brand
                      </label>
                      <input
                        type="text"
                        value={carBrand}
                        onChange={e => setCarBrand(e.target.value)}
                        placeholder="e.g., Toyota, BMW, Ford"
                        className="w-full p-3 lg:p-4 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                        onKeyPress={e => e.key === 'Enter' && handleSubmit()}
                      />
                    </div>
                    <div className="relative">
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Car Model
                      </label>
                      <input
                        type="text"
                        value={carModel}
                        onChange={e => setCarModel(e.target.value)}
                        placeholder="e.g., Camry, X5, F-150"
                        className="w-full p-3 lg:p-4 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                        onKeyPress={e => e.key === 'Enter' && handleSubmit()}
                      />
                    </div>
                    <div className="relative sm:col-span-2 lg:col-span-1">
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Diagnostic Code
                      </label>
                      <input
                        type="text"
                        value={code}
                        onChange={e => setCode(e.target.value)}
                        placeholder="e.g., P0171, B1234"
                        className="w-full p-3 lg:p-4 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                        onKeyPress={e => e.key === 'Enter' && handleSubmit()}
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-1 sm:pt-2">
                    <button
                      onClick={handleSubmit}
                      disabled={isLoading}
                      className="flex-1 sm:flex-none sm:px-8 bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white py-3 lg:py-4 rounded-xl text-base font-semibold flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:transform-none"
                    >
                      <Send className="w-5 h-5" />
                      <span>{isLoading ? 'Analyzing...' : 'Get AI Diagnosis'}</span>
                    </button>
                    <button
                      onClick={clearAll}
                      className="flex-none px-6 lg:px-8 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 lg:py-4 rounded-xl text-base font-medium transition-all duration-200 hover:shadow-md"
                    >
                      Clear All
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar - Desktop Only */}
            <div className="hidden xl:block w-80 bg-gray-50 border-l border-gray-200 min-h-0">
              <div className="p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Tips</h3>
                  <div className="space-y-3">
                    <div className="bg-white p-3 rounded-lg border border-gray-100">
                      <h4 className="font-medium text-gray-800 text-sm">Diagnostic Codes</h4>
                      <p className="text-xs text-gray-600 mt-1">
                        Enter OBD-II codes like P0171 or manufacturer-specific codes
                      </p>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-gray-100">
                      <h4 className="font-medium text-gray-800 text-sm">Be Specific</h4>
                      <p className="text-xs text-gray-600 mt-1">
                        Include year and engine size for better diagnosis
                      </p>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-gray-100">
                      <h4 className="font-medium text-gray-800 text-sm">Multiple Codes</h4>
                      <p className="text-xs text-gray-600 mt-1">
                        Separate multiple codes with commas
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}