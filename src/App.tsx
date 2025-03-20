import { BrowserRouter } from 'react-router-dom';
import Benefits from "./components/benefits";
import DocumentsRequired from "./components/documents-required";
import ExpertAssistance from "./components/expert-assistance";
import Footer from "./components/footer";
import Header from "./components/header";
import Hero from "./components/hero";
import Pricing from "./components/pricing";
import RegistrationProcess from "./components/registration-process";
import StickyChat from "./components/sticky-chat";
import Testimonials from "./components/testimonials";
import WhyChooseUs from "./components/why-choose-us";
import { useEffect, useState } from 'react';
import { MessageSquare, X, Beaker } from 'lucide-react';
import { ChatProvider } from './contexts/ChatContext';
import ConnectionTest from './test-connection';

const App = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  // Add smooth scrolling effect for better user experience
  // Show the test component for WebSocket connection verification
  const [showConnectionTest, setShowConnectionTest] = useState(false);

  useEffect(() => {
    // Add intersection observer for fade-in animations
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    // Observe all sections with the fade-in class
    document.querySelectorAll('.fade-in').forEach((el) => {
      observer.observe(el);
    });

    return () => {
      document.querySelectorAll('.fade-in').forEach((el) => {
        observer.unobserve(el);
      });
    };
  }, []);

  return (
    <BrowserRouter>
      <ChatProvider>
        <div className="flex flex-col min-h-screen bg-white scroll-smooth">
        <Header />
        
        {/* Progress indicator - fixed position */}
        <div className="hidden lg:block fixed right-8 top-1/2 transform -translate-y-1/2 z-40">
          {/* <div className="flex flex-col items-center gap-4">
            <div className="w-0.5 h-6 bg-gray-300"></div>
            <div className="w-0.5 h-6 bg-gray-300"></div>
            <div className="w-0.5 h-6 bg-gray-300"></div>
            <div className="w-0.5 h-6 bg-gray-300"></div>
            <div className="w-0.5 h-6 bg-gray-300"></div>
            <div className="w-0.5 h-6 bg-gray-300"></div>
          </div> */}
        </div>

        {/* Social proof banner - appears after some scrolling */}
        <div className="hidden md:block fixed bottom-0 left-0 right-0 bg-blue text-white py-2 text-center z-30 animate-slide-up">
          <div className="container mx-auto flex items-center justify-center gap-2 text-sm">
            <span className="font-medium">Trusted by 50,000+ businesses in Delhi NCR</span>
            <span className="mx-2">•</span>
            <span>4.9/5 rating from 10,000+ reviews</span>
            <span className="mx-2">•</span>
            <span>24/7 Expert Support</span>
          </div>
        </div>

        {/* Mobile chat button */}
        <div className="md:hidden fixed bottom-6 right-6 z-50">
          <button
            onClick={() => setMobileOpen(true)}
            className="bg-blue text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg"
          >
            <MessageSquare className="h-6 w-6" />
            <span className="absolute -top-2 -right-2 bg-orange text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center animate-pulse-slow">
              1
            </span>
          </button>
        </div>

        {/* Mobile chat overlay */}
        {mobileOpen && (
          <div className="md:hidden fixed inset-0 bg-black/50 z-50 flex items-end">
            <div className="bg-white w-full h-[80vh] rounded-t-xl overflow-hidden animate-slide-up-mobile">
              <div className="flex justify-between items-center p-4 border-b">
                <h3 className="font-medium text-blue">AI Assistant</h3>
                <button 
                  onClick={() => setMobileOpen(false)}
                  className="text-darkgray p-1"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="h-full pb-16">
                <StickyChat />
              </div>
            </div>
          </div>
        )}

       {/* Connection test toggle (development only) */}
       {process.env.NODE_ENV === 'development' && (
         <div className="fixed top-20 right-4 z-40">
           <button
             onClick={() => setShowConnectionTest(!showConnectionTest)}
             className={`bg-purple-600 text-white p-2 rounded-full shadow-lg hover:bg-purple-700 flex items-center gap-2`}
             title="Toggle WebSocket Test"
           >
             <Beaker size={18} />
             <span className="text-xs">Test WS</span>
           </button>
         </div>
       )}
       
       {/* WebSocket connection test (only visible when toggled) */}
       {showConnectionTest && (
         <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
           <div className="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-auto">
             <div className="flex justify-between items-center mb-4">
               <h2 className="text-xl font-bold">WebSocket Connection Test</h2>
               <button
                 onClick={() => setShowConnectionTest(false)}
                 className="text-gray-500 hover:text-gray-700"
               >
                 <X />
               </button>
             </div>
             <ConnectionTest />
           </div>
         </div>
       )}

        <div className="flex flex-col md:flex-row relative">
          <main className="w-full md:w-[70%]">
            <div id="hero" className="fade-in">
              <Hero />
            </div>
            <div id="testimonials" className="fade-in">
              <Testimonials />
            </div>
            <div id="documents" className="fade-in">
              <DocumentsRequired />
            </div>
            <div id="process" className="fade-in">
              <RegistrationProcess />
            </div>
            <div id="benefits" className="fade-in">
              <Benefits />
            </div>
            <div id="pricing" className="fade-in">
              <Pricing />
            </div>
            <div id="why-choose-us" className="fade-in">
              <WhyChooseUs />
            </div>
            <div id="expert-assistance" className="fade-in">
              <ExpertAssistance />
            </div>
          </main>
          <aside className="hidden md:block md:w-[30%] fixed right-0 top-14 h-[calc(100vh-5rem)] p-4">
            <StickyChat />
          </aside>
        </div>
        <Footer />
      </div>
      </ChatProvider>
    </BrowserRouter>
  )
}

export default App;