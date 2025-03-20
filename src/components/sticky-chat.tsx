import { useState, useRef, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Send, User, Bot, Sparkles, Clock, X, CreditCard, Loader2 } from "lucide-react";
import caImage from "../assets/heroImg.png"
import { useChat } from "../contexts/ChatContext";

// Declare Razorpay type for TypeScript
interface RazorpayOptions {
  key: string;
  order_id: string;
  name: string;
  description: string;
  image?: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  theme?: {
    color: string;
  };
  modal?: {
    ondismiss: () => void;
  };
}

interface RazorpayInstance {
  open: () => void;
  on: (event: string, callback: (response: any) => void) => void;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface StickyChatProps {
  onClose?: () => void;
}

export default function StickyChat({ onClose }: StickyChatProps) {
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const {
    messages,
    sendMessage: sendChatMessage,
    connectionStatus,
    paymentLink,
    showPaymentPopup,
    closePaymentPopup,
    isLoading,
    hasCompletedPayment,
    markPaymentCompleted
  } = useChat();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!message.trim()) return;

    // Send message via chat context
    sendChatMessage(message);
    setMessage("");
  };

  // Handle payment link click with enhanced Razorpay integration
  const handlePaymentClick = () => {
    if (paymentLink) {
      // Load Razorpay script if not already loaded
      if (!window.Razorpay) {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        document.body.appendChild(script);
        
        script.onload = () => {
          openRazorpayCheckout(paymentLink);
        };
      } else {
        openRazorpayCheckout(paymentLink);
      }
      
      // Notify the agent
      sendChatMessage("I'm proceeding to make the payment now.");
      
      // Close our custom payment popup overlay
      closePaymentPopup();
    }
  };
  
  // Function to extract order ID from payment link and open Razorpay checkout
  const openRazorpayCheckout = (paymentLink: string) => {
    try {
      console.log("Opening Razorpay checkout with link:", paymentLink);
      
      // Extract order information from the payment link
      const url = new URL(paymentLink);
      
      // Properly handle various Razorpay URL formats
      let orderId: string | null = null;
      
      // First try standard query param approach
      orderId = url.searchParams.get('order_id');
      
      // If that fails, try extracting from the path (format: https://rzp.io/l/RegisterKaro-pay_12345)
      if (!orderId && url.pathname.includes('/l/RegisterKaro-')) {
        const pathParts = url.pathname.split('/l/RegisterKaro-');
        if (pathParts.length > 1) {
          orderId = pathParts[1];
          console.log(`Extracted order ID from path: ${orderId}`);
        }
      }
      
      // If still no order ID, use the entire path as a fallback
      if (!orderId && url.pathname.includes('/l/')) {
        const pathParts = url.pathname.split('/l/');
        if (pathParts.length > 1) {
          orderId = pathParts[1];
          console.log(`Using path as order ID: ${orderId}`);
        }
      }
      
      if (!orderId) {
        console.error("Failed to extract order_id from payment link:", paymentLink);
        // Fallback to iframe approach if order_id extraction fails
        openPaymentIframe(paymentLink);
        return;
      }
      
      // Load Razorpay script if not already loaded
      if (!window.Razorpay) {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        document.body.appendChild(script);
        
        script.onload = () => {
          console.log("Razorpay script loaded, initializing checkout");
          initializeRazorpay(orderId as string, paymentLink);
        };
        
        script.onerror = () => {
          console.error("Failed to load Razorpay script");
          openPaymentIframe(paymentLink);
        };
      } else {
        console.log("Razorpay already loaded, initializing checkout");
        initializeRazorpay(orderId, paymentLink);
      }
    } catch (error) {
      console.error("Error opening Razorpay:", error);
      // Fallback to iframe approach
      openPaymentIframe(paymentLink);
    }
  };
  
  // Initialize Razorpay with the extracted order ID
  const initializeRazorpay = (orderId: string, fallbackLink: string) => {
    // If payment already completed, don't show new payment form
    if (hasCompletedPayment) {
      console.log('Payment already completed, not showing Razorpay checkout');
      sendChatMessage("Our records show you've already completed payment. If you need assistance with anything else, please let me know.");
      return;
    }
    
    try {
      // Configure Razorpay options
      const options = {
        key: 'rzp_test_zUaH0H0t4sWFJ8', // Replace with actual key from backend
        order_id: orderId,
        name: 'RegisterKaro',
        description: 'Company Registration Payment',
        image: 'https://registerkaroonline.com/wp-content/uploads/2023/06/favicon-32x32-1.png',
        prefill: {
          name: '',
          email: '',
          contact: ''
        },
        theme: {
          color: '#007bff'
        },
        modal: {
          ondismiss: function() {
            console.log('Payment popup closed without completing payment');
            sendChatMessage("I see you've closed the payment window. If you need any more information before proceeding with the payment, please let me know.");
          }
        },
        handler: function() {
          console.log('Payment potentially successful - will verify with backend');
          markPaymentCompleted(); // Mark payment as completed for future reference
          sendChatMessage("Great! I'm verifying your payment. This should just take a moment...");
        }
      };
      
      // Open Razorpay checkout
      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function(response: any) {
        console.log('Payment failed:', response.error);
        sendChatMessage("It looks like there was an issue with the payment. Would you like to try again or use a different payment method?");
      });
      
      rzp.open();
      console.log("Razorpay checkout opened successfully");
      
    } catch (error) {
      console.error("Error initializing Razorpay:", error);
      // Fallback to iframe approach
      openPaymentIframe(fallbackLink);
    }
  };
  
  // Fallback iframe method if direct Razorpay integration fails
  const openPaymentIframe = (paymentLink: string) => {
    console.log("Falling back to iframe payment method");
    
    // Create modal iframe for the Razorpay payment
    const paymentDiv = document.createElement('div');
    paymentDiv.style.position = 'fixed';
    paymentDiv.style.top = '0';
    paymentDiv.style.left = '0';
    paymentDiv.style.width = '100%';
    paymentDiv.style.height = '100%';
    paymentDiv.style.backgroundColor = 'rgba(0,0,0,0.7)';
    paymentDiv.style.zIndex = '10000';
    paymentDiv.style.display = 'flex';
    paymentDiv.style.alignItems = 'center';
    paymentDiv.style.justifyContent = 'center';
    
    // Create close button
    const closeButton = document.createElement('button');
    closeButton.innerText = 'Close';
    closeButton.style.position = 'absolute';
    closeButton.style.top = '20px';
    closeButton.style.right = '20px';
    closeButton.style.padding = '8px 16px';
    closeButton.style.backgroundColor = '#fff';
    closeButton.style.border = 'none';
    closeButton.style.borderRadius = '4px';
    closeButton.style.cursor = 'pointer';
    closeButton.onclick = () => document.body.removeChild(paymentDiv);
    
    // Create iframe for payment
    const iframe = document.createElement('iframe');
    iframe.src = paymentLink;
    iframe.style.width = '90%';
    iframe.style.height = '90%';
    iframe.style.border = 'none';
    iframe.style.borderRadius = '8px';
    iframe.style.backgroundColor = 'white';
    
    // Add elements to DOM
    paymentDiv.appendChild(iframe);
    paymentDiv.appendChild(closeButton);
    document.body.appendChild(paymentDiv);
    
    // Inform user about the payment iframe
    sendChatMessage("I've opened the payment window for you. Once payment is complete, you can return to this chat.");
  };

  return (
    <div className="bg-white rounded-2xl shadow-floating w-full h-[calc(100vh-8rem)] flex flex-col overflow-hidden border border-gray-100">
      {/* Chat header */}
      <div className="bg-blue text-white p-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className=" rounded-full">
            <img src={caImage} alt="CA Amit Aggrawal" className="h-10 w-10 rounded-full" />
          </div>
          <div>
            <h3 className="font-medium">CA Amit Aggrawal</h3>
            <div className="flex items-center text-xs text-white/80">
              <div className={`h-2 w-2 rounded-full mr-2 ${
                connectionStatus === 'connected' ? 'bg-green-400' : 
                connectionStatus === 'connecting' ? 'bg-yellow-400' : 'bg-red-400'
              }`}></div>
              {connectionStatus === 'connected' ? 'Online now' : 
               connectionStatus === 'connecting' ? 'Connecting...' : 'Offline'}
            </div>
          </div>
        </div>
        {onClose && (
          <button 
            onClick={onClose}
            className="p-1 hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
      
      {/* Payment popup - shown when payment link is received */}
      {showPaymentPopup && paymentLink && (
        <div className="absolute inset-0 bg-black/30 z-20 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg p-5 max-w-sm w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Complete Payment</h3>
              <button onClick={closePaymentPopup} className="text-gray-500 hover:text-gray-700">
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="mb-4 text-gray-700">
              Click the button below to securely complete your payment for company registration:
            </p>
            <button 
              onClick={handlePaymentClick}
              className="w-full bg-blue text-white py-3 rounded-lg flex items-center justify-center space-x-2 hover:bg-blue/90 transition"
            >
              <CreditCard className="h-5 w-5" />
              <span>Pay Now</span>
            </button>
          </div>
        </div>
      )}
      
      {/* Chat messages */}
      <div className="flex-1 p-3 overflow-y-auto bg-gray-50 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400">
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div 
              key={index} 
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div className={`flex max-w-[80%] ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                <div 
                  className={`flex items-center justify-center h-8 w-8 rounded-full flex-shrink-0 ${
                    message.role === "user" ? "bg-orange ml-2" : "bg-blue mr-2"
                  }`}
                >
                  {message.role === "user" ? (
                    <User className="h-4 w-4 text-white" />
                  ) : (
                    <Bot className="h-4 w-4 text-white" />
                  )}
                </div>
                <div>
                  <div 
                    className={`p-3 rounded-lg ${
                      message.role === "user" 
                        ? "bg-orange text-white rounded-tr-none"
                        : "bg-white text-darkgray border border-gray-200 rounded-tl-none"
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                  </div>
                  <div className="flex items-center text-xs mt-1 text-gray-500">
                    <Clock className="h-3 w-3 mr-1" />
                    {message.time}
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {/* Loading indicator */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex max-w-[80%] flex-row">
                <div className="flex items-center justify-center h-8 w-8 rounded-full flex-shrink-0 bg-blue mr-2">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div>
                  <div className="p-3 rounded-lg bg-white text-darkgray border border-gray-200 rounded-tl-none">
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <p className="text-sm">Typing...</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      {/* Quick action buttons */}
      <div className="p-1.5 border-t border-gray-100 flex overflow-x-auto gap-2 bg-gray-50">
        <button
          onClick={() => sendChatMessage("Tell me about the registration process")}
          className={`px-3 py-1.5 text-xs rounded-full whitespace-nowrap transition-colors ${
            isLoading || connectionStatus !== 'connected'
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
              : 'bg-blue/10 text-blue hover:bg-blue/20'
          }`}
          disabled={isLoading || connectionStatus !== 'connected'}
        >
          Registration Process
        </button>
        <button
          onClick={() => sendChatMessage("What documents are required?")}
          className={`px-3 py-1.5 text-xs rounded-full whitespace-nowrap transition-colors ${
            isLoading || connectionStatus !== 'connected'
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
              : 'bg-blue/10 text-blue hover:bg-blue/20'
          }`}
          disabled={isLoading || connectionStatus !== 'connected'}
        >
          Documents Required
        </button>
        <button
          onClick={() => sendChatMessage("What are your pricing plans?")}
          className={`px-3 py-1.5 text-xs rounded-full whitespace-nowrap transition-colors ${
            isLoading || connectionStatus !== 'connected'
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
              : 'bg-blue/10 text-blue hover:bg-blue/20'
          }`}
          disabled={isLoading || connectionStatus !== 'connected'}
        >
          Pricing Plans
        </button>
        <button
          onClick={() => sendChatMessage("How long does the process take?")}
          className={`px-3 py-1.5 text-xs rounded-full whitespace-nowrap transition-colors ${
            isLoading || connectionStatus !== 'connected'
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
              : 'bg-blue/10 text-blue hover:bg-blue/20'
          }`}
          disabled={isLoading || connectionStatus !== 'connected'}
        >
          Processing Time
        </button>
      </div>
      
      {/* Chat input */}
      <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-100 bg-white">
        <div className="flex gap-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message here..."
            className="flex-1 focus-visible:ring-blue"
            disabled={connectionStatus !== 'connected' || isLoading}
          />
          <Button 
            type="submit"
            className="bg-blue hover:bg-blue/90 text-white"
            disabled={!message.trim() || connectionStatus !== 'connected' || isLoading}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          {connectionStatus === 'connected' ? 
            'Connected to AI assistant • Responses typically within 5 seconds' : 
            connectionStatus === 'connecting' ? 
            'Connecting to AI assistant...' : 
            'Disconnected - Unable to reach the assistant'}
        </p>
      </form>
    </div>
  );
}