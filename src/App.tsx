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
import { useEffect, useState, useRef } from 'react';
import { MessageSquare, X } from 'lucide-react';

const App = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);

  // Add smooth scrolling effect for better user experience
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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (chatRef.current && !chatRef.current.contains(event.target as Node)) {
        setMobileOpen(false);
      }
    };

    if (mobileOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [mobileOpen]);

  return (
    <BrowserRouter>
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
            <div ref={chatRef} className="bg-white w-full h-[90vh] rounded-t-xl overflow-hidden animate-slide-up-mobile">
              <div className="h-full">
                <StickyChat onClose={() => setMobileOpen(false)} />
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col md:flex-row relative">
          <main className="w-full md:w-[70%]">
            <div id="hero" className="fade-in">
              <Hero />
            </div>
            <div className="bg-gradient-to-br from-white via-blue-50/20 via-orange-50/20 to-purple-50/20">
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
            </div>
          </main>
          <aside className="hidden md:block md:w-[30%] fixed right-0 top-14 h-[calc(100vh-5rem)] p-4">
            <StickyChat />
          </aside>
        </div>
        <Footer />
      </div>
    </BrowserRouter>
  )
}

export default App;