import { useState } from 'react'
import './App.css'

interface ChatMessage {
  id: number;
  text: string;
  isUser: boolean;
  detectedCodes?: string[];
}

// Function to parse markdown-like text to JSX
const parseMarkdownToJSX = (text: string) => {
  // Split by lines to handle different elements
  const lines = text.split('\n');
  const elements: React.ReactElement[] = [];
  let currentIndex = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Skip empty lines
    if (line.trim() === '') {
      elements.push(<br key={`br-${currentIndex++}`} />);
      continue;
    }
    
    // Handle headers (### text)
    if (line.startsWith('### ')) {
      elements.push(
        <h3 key={`h3-${currentIndex++}`} className="text-base sm:text-lg font-bold text-gray-800 mt-3 sm:mt-4 mb-1 sm:mb-2">
          {line.replace('### ', '')}
        </h3>
      );
    }
    // Handle subheaders (## text)
    else if (line.startsWith('## ')) {
      elements.push(
        <h2 key={`h2-${currentIndex++}`} className="text-lg sm:text-xl font-bold text-gray-900 mt-3 sm:mt-4 mb-1 sm:mb-2">
          {line.replace('## ', '')}
        </h2>
      );
    }
    // Handle bullet points
    else if (line.trim().match(/^[\d]+\.\s/)) {
      // Numbered list
      const content = line.replace(/^[\d]+\.\s/, '');
      elements.push(
        <div key={`ol-${currentIndex++}`} className="ml-3 sm:ml-4 mb-1 text-sm sm:text-base">
          <span className="font-semibold text-blue-600">•</span>
          <span className="ml-2">{parseBoldText(content)}</span>
        </div>
      );
    }
    else if (line.trim().startsWith('- ')) {
      // Bullet list
      const content = line.replace(/^-\s/, '');
      elements.push(
        <div key={`ul-${currentIndex++}`} className="ml-3 sm:ml-4 mb-1 text-sm sm:text-base">
          <span className="font-semibold text-green-600">•</span>
          <span className="ml-2">{parseBoldText(content)}</span>
        </div>
      );
    }
    // Handle regular paragraphs
    else {
      elements.push(
        <p key={`p-${currentIndex++}`} className="mb-1 sm:mb-2 leading-relaxed text-sm sm:text-base">
          {parseBoldText(line)}
        </p>
      );
    }
  }
  
  return <div className="space-y-1">{elements}</div>;
};

// Function to parse bold text (**text**)
const parseBoldText = (text: string): React.ReactElement => {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  
  return (
    <>
      {parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          const boldText = part.slice(2, -2);
          return (
            <strong key={index} className="font-semibold text-gray-900">
              {boldText}
            </strong>
          );
        }
        return <span key={index}>{part}</span>;
      })}
    </>
  );
};

function App() {
  // Existing code search state
  const [carModel, setCarModel] = useState('');
  const [carName, setCarName] = useState('');
  const [code, setCode] = useState('');
  const [result, setResult] = useState<string | null>(null);

  // New chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      text: "Hi! I'm your automotive diagnostic assistant. Ask me about error codes or describe your car problems!",
      isUser: false
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Tab state for mobile
  const [activeTab, setActiveTab] = useState<'chat' | 'search'>('chat');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const response = await fetch('https://ef2b-105-178-104-218.ngrok-free.app/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        car_model: carModel,
        car_name: carName,
        code: code
      })
    });
    const data = await response.json();
    setResult(`${data.code}: ${data.meaning}`);
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now(),
      text: chatInput,
      isUser: true
    };
    
    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setIsLoading(true);

    try {
      const response = await fetch('https://ef2b-105-178-104-218.ngrok-free.app/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: chatInput,
          car_model: carModel || undefined,
          car_name: carName || undefined
        })
      });
      
      const data = await response.json();
      
      // Add AI response
      const aiMessage: ChatMessage = {
        id: Date.now() + 1,
        text: data.response,
        isUser: false,
        detectedCodes: data.detected_codes
      };
      
      setChatMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: Date.now() + 1,
        text: "Sorry, I encountered an error. Please try again.",
        isUser: false
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-200">
      {/* Desktop Layout - Hidden on mobile */}
      <div className="hidden lg:block p-4">
        <div className="max-w-7xl mx-auto grid grid-cols-2 gap-6" style={{ height: 'calc(100vh - 2rem)' }}>
          
          {/* AI Chat Section - Left Side */}
          <div className="bg-white shadow-lg rounded-xl p-6 flex flex-col overflow-hidden">
            <h2 className="text-2xl font-bold mb-4 text-center text-green-700 flex-shrink-0">🤖 AI Diagnostic Assistant</h2>
            <h3 className="text-base font-medium mb-4 text-center text-green-600 flex-shrink-0">
              Ask AI here to get not only code explanation but also guidance
            </h3>
            
            {/* Car Details Input for Chat Context */}
            <div className="grid grid-cols-2 gap-2 mb-4 flex-shrink-0">
              <input
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 text-sm"
                placeholder="Car Model (optional)"
                value={carModel}
                onChange={e => setCarModel(e.target.value)}
              />
              <input
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 text-sm"
                placeholder="Car Name (optional)"
                value={carName}
                onChange={e => setCarName(e.target.value)}
              />
            </div>

            {/* Chat Messages - Scrollable Area */}
            <div className="flex-1 overflow-y-auto border border-gray-200 rounded-lg p-4 mb-4 bg-gray-50 min-h-0">
              <div className="space-y-4">
                {chatMessages.map((message) => (
                  <div key={message.id} className={`${message.isUser ? 'text-right' : 'text-left'}`}>
                    <div className={`inline-block max-w-[85%] p-4 rounded-lg ${
                      message.isUser 
                        ? 'bg-green-600 text-white' 
                        : 'bg-white border border-gray-300 shadow-sm'
                    }`}>
                      {message.isUser ? (
                        <div className="whitespace-pre-wrap">{message.text}</div>
                      ) : (
                        <div className="text-left">
                          {parseMarkdownToJSX(message.text)}
                        </div>
                      )}
                      {message.detectedCodes && message.detectedCodes.length > 0 && (
                        <div className="mt-3 pt-2 border-t border-gray-200 text-xs opacity-75">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            🔍 Detected: {message.detectedCodes.join(', ')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="text-left">
                    <div className="inline-block bg-white border border-gray-300 p-4 rounded-lg shadow-sm">
                      <div className="flex items-center space-x-3">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-600"></div>
                        <span className="text-gray-600">AI is analyzing your message...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Chat Input - Fixed at Bottom */}
            <form onSubmit={handleChatSubmit} className="flex space-x-2 flex-shrink-0">
              <input
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                placeholder="Ask about error codes..."
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold px-6 py-2 rounded-lg transition-colors duration-200 shadow"
              >
                Send
              </button>
            </form>
          </div>

          {/* Direct Code Search Section - Right Side */}
          <div className="bg-white shadow-lg rounded-xl p-8 flex flex-col overflow-hidden">
            <h1 className="text-2xl font-bold mb-6 text-center text-blue-700 flex-shrink-0">
              🔍 Enter Code Directly into Machine Learning
            </h1>
            <h2 className="text-base font-medium mb-6 text-center text-blue-600 flex-shrink-0">
              Always Quick | Get Quick error code explanation here
            </h2>
            
            {/* Form Section - Fixed */}
            <div className="flex-shrink-0">
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="Car Model"
                  value={carModel}
                  onChange={e => setCarModel(e.target.value)}
                  required
                />
                <input
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="Car Name"
                  value={carName}
                  onChange={e => setCarName(e.target.value)}
                  required
                />
                <input
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="Error Code (e.g., P0047)"
                  value={code}
                  onChange={e => setCode(e.target.value)}
                  required
                />
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition-colors duration-200 shadow"
                >
                  Search Code
                </button>
              </form>
            </div>
            
            {/* Results Section - Scrollable if content is long */}
            <div className="flex-1 mt-6 overflow-y-auto min-h-0">
              {result && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-800">
                  <div className="font-semibold mb-2">Search Result:</div>
                  <div className="whitespace-pre-wrap leading-relaxed">{result}</div>
                </div>
              )}
              {!result && (
                <div className="flex items-center justify-center h-full text-gray-400">
                  <div className="text-center">
                    <div className="text-4xl mb-2">🔍</div>
                    <p>Enter an error code above to see results here</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Layout - Tabbed Interface */}
      <div className="lg:hidden h-screen flex flex-col">
        {/* Tab Navigation */}
        <div className="bg-white shadow-sm border-b">
          <div className="flex">
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex-1 px-4 py-3 text-center font-semibold transition-colors ${
                activeTab === 'chat'
                  ? 'text-green-700 border-b-2 border-green-700 bg-green-50'
                  : 'text-gray-600 hover:text-green-600'
              }`}
            >
              🤖 AI Assistant
            </button>
            <button
              onClick={() => setActiveTab('search')}
              className={`flex-1 px-4 py-3 text-center font-semibold transition-colors ${
                activeTab === 'search'
                  ? 'text-blue-700 border-b-2 border-blue-700 bg-blue-50'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              🔍 Quick Search
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-hidden">
          {/* AI Chat Tab */}
          {activeTab === 'chat' && (
            <div className="h-full bg-white flex flex-col p-4">
              <div className="text-center mb-4">
                <h2 className="text-xl font-bold text-green-700">AI Diagnostic Assistant</h2>
                <p className="text-sm text-green-600 mt-1">Get detailed explanations and guidance</p>
              </div>
              
              {/* Car Details Input */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                <input
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 text-sm"
                  placeholder="Car Model"
                  value={carModel}
                  onChange={e => setCarModel(e.target.value)}
                />
                <input
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 text-sm"
                  placeholder="Car Name"
                  value={carName}
                  onChange={e => setCarName(e.target.value)}
                />
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto border border-gray-200 rounded-lg p-3 mb-4 bg-gray-50">
                <div className="space-y-3">
                  {chatMessages.map((message) => (
                    <div key={message.id} className={`${message.isUser ? 'text-right' : 'text-left'}`}>
                      <div className={`inline-block max-w-[85%] p-3 rounded-lg ${
                        message.isUser 
                          ? 'bg-green-600 text-white' 
                          : 'bg-white border border-gray-300 shadow-sm'
                      }`}>
                        {message.isUser ? (
                          <div className="whitespace-pre-wrap text-sm">{message.text}</div>
                        ) : (
                          <div className="text-left text-sm">
                            {parseMarkdownToJSX(message.text)}
                          </div>
                        )}
                        {message.detectedCodes && message.detectedCodes.length > 0 && (
                          <div className="mt-2 pt-2 border-t border-gray-200 text-xs opacity-75">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              🔍 {message.detectedCodes.join(', ')}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="text-left">
                      <div className="inline-block bg-white border border-gray-300 p-3 rounded-lg shadow-sm">
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                          <span className="text-gray-600 text-sm">AI is thinking...</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Chat Input */}
              <form onSubmit={handleChatSubmit} className="space-y-2">
                <input
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                  placeholder="Ask about error codes or car problems..."
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg transition-colors duration-200 shadow"
                >
                  {isLoading ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>
          )}

          {/* Direct Search Tab */}
          {activeTab === 'search' && (
            <div className="h-full bg-white flex flex-col p-4">
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-blue-700">Quick Code Search</h2>
                <p className="text-sm text-blue-600 mt-1">Direct error code lookup</p>
              </div>
              
              {/* Search Form */}
              <form onSubmit={handleSubmit} className="space-y-4 mb-6">
                <input
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="Car Model"
                  value={carModel}
                  onChange={e => setCarModel(e.target.value)}
                  required
                />
                <input
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="Car Name"
                  value={carName}
                  onChange={e => setCarName(e.target.value)}
                  required
                />
                <input
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="Error Code (e.g., P0047)"
                  value={code}
                  onChange={e => setCode(e.target.value)}
                  required
                />
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors duration-200 shadow"
                >
                  Search Code
                </button>
              </form>
              
              {/* Results */}
              <div className="flex-1 overflow-y-auto">
                {result && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-800">
                    <div className="font-semibold mb-2">Search Result:</div>
                    <div className="whitespace-pre-wrap leading-relaxed text-sm">{result}</div>
                  </div>
                )}
                {!result && (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    <div className="text-center">
                      <div className="text-6xl mb-4">🔍</div>
                      <p className="text-lg font-medium">Ready to search</p>
                      <p className="text-sm mt-1">Enter your car details and error code above</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App
