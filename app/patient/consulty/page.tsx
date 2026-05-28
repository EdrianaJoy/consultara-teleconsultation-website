/**
 * Consulty AI Assistant Page
 * 
 * AI-powered symptom checker that helps patients find the right doctor
 * and department based on their symptoms.
 * 
 * @module app/patient/consulty/page
 */

"use client";

import { useState, useRef, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Send, 
  Bot, 
  User,
  Sparkles,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  Star,
  Calendar,
  Stethoscope
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { doctors, departments } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Message interface for chat
 */
interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  analysis?: SymptomAnalysis;
  timestamp: Date;
}

/**
 * Symptom analysis result
 */
interface SymptomAnalysis {
  symptoms: string[];
  recommendedDepartment: string;
  urgencyLevel: "low" | "medium" | "high" | "emergency";
  recommendedDoctors: typeof doctors;
  disclaimer: string;
}

/**
 * Analyze symptoms and recommend department/doctors
 * This simulates AI analysis - in production, this would call an AI API
 */
function analyzeSymptoms(symptoms: string): SymptomAnalysis {
  const lowerSymptoms = symptoms.toLowerCase();
  
  // Symptom to department mapping
  const symptomMappings: { keywords: string[]; department: string; urgency: "low" | "medium" | "high" | "emergency" }[] = [
    { 
      keywords: ["chest pain", "heart", "palpitations", "shortness of breath", "high blood pressure", "irregular heartbeat"],
      department: "Cardiology",
      urgency: "high"
    },
    { 
      keywords: ["skin", "rash", "acne", "eczema", "psoriasis", "itching", "hair loss", "mole"],
      department: "Dermatology",
      urgency: "low"
    },
    { 
      keywords: ["child", "baby", "infant", "pediatric", "vaccination", "growth"],
      department: "Pediatrics",
      urgency: "medium"
    },
    { 
      keywords: ["headache", "migraine", "seizure", "numbness", "memory", "dizziness", "tremor", "brain"],
      department: "Neurology",
      urgency: "medium"
    },
    { 
      keywords: ["joint", "bone", "back pain", "fracture", "arthritis", "sports injury", "knee", "spine"],
      department: "Orthopedics",
      urgency: "medium"
    },
    { 
      keywords: ["pregnancy", "menstrual", "period", "pelvic", "fertility", "contraception", "gynec"],
      department: "Gynecology",
      urgency: "medium"
    },
    { 
      keywords: ["eye", "vision", "blind", "glasses", "cataract", "glaucoma"],
      department: "Ophthalmology",
      urgency: "medium"
    },
    { 
      keywords: ["anxiety", "depression", "stress", "sleep", "insomnia", "panic", "mood", "mental"],
      department: "Psychiatry",
      urgency: "medium"
    },
    { 
      keywords: ["ear", "hearing", "throat", "sore throat", "sinus", "nose", "tonsil", "voice"],
      department: "ENT",
      urgency: "low"
    },
    { 
      keywords: ["fever", "cold", "flu", "cough", "fatigue", "allergy", "general", "checkup"],
      department: "General Medicine",
      urgency: "low"
    },
  ];

  // Emergency keywords
  const emergencyKeywords = ["emergency", "severe", "unbearable", "can't breathe", "unconscious", "bleeding heavily", "chest pain severe"];
  const isEmergency = emergencyKeywords.some(keyword => lowerSymptoms.includes(keyword));

  // Find matching department
  let matchedDepartment = "General Medicine";
  let urgency: "low" | "medium" | "high" | "emergency" = "low";

  for (const mapping of symptomMappings) {
    if (mapping.keywords.some(keyword => lowerSymptoms.includes(keyword))) {
      matchedDepartment = mapping.department;
      urgency = mapping.urgency;
      break;
    }
  }

  if (isEmergency) {
    urgency = "emergency";
  }

  // Get department ID from name
  const deptInfo = departments.find(d => d.name === matchedDepartment);
  const deptId = deptInfo?.id || "general-medicine";

  // Find doctors in the recommended department
  const recommendedDoctors = doctors
    .filter(doc => doc.department === deptId && doc.isAvailable)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 3);

  // Extract symptoms as array
  const extractedSymptoms = symptoms
    .split(/[,.]/)
    .map(s => s.trim())
    .filter(s => s.length > 2);

  return {
    symptoms: extractedSymptoms.slice(0, 5),
    recommendedDepartment: matchedDepartment,
    urgencyLevel: urgency,
    recommendedDoctors,
    disclaimer: "This is an AI-powered recommendation and should not replace professional medical advice. Please consult with a healthcare provider for proper diagnosis and treatment.",
  };
}

/**
 * Generate AI response based on symptoms
 */
function generateResponse(symptoms: string, analysis: SymptomAnalysis): string {
  const urgencyMessages = {
    emergency: "Your symptoms suggest this may require immediate medical attention. Please consider visiting an emergency room or calling emergency services.",
    high: "Based on your symptoms, I recommend seeking medical attention soon. Please consider scheduling an appointment as early as possible.",
    medium: "Your symptoms suggest a visit to a specialist would be beneficial. I recommend scheduling an appointment at your convenience.",
    low: "Your symptoms appear to be manageable. However, if they persist or worsen, please consult with a healthcare provider.",
  };

  return `I understand you're experiencing: ${analysis.symptoms.join(", ")}.\n\n${urgencyMessages[analysis.urgencyLevel]}\n\nBased on your symptoms, I recommend visiting the **${analysis.recommendedDepartment}** department. I've found ${analysis.recommendedDoctors.length} highly-rated doctors who specialize in this area and are available for consultations.`;
}

/**
 * Consulty AI Page Component
 */
export default function ConsultyPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, patientProfile } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState<SymptomAnalysis | null>(null);

  // Load chat history from localStorage
  useEffect(() => {
    const savedMessages = localStorage.getItem('consultara_consulty_history');
    if (savedMessages) {
      try {
        const parsed = JSON.parse(savedMessages);
        // Convert timestamp strings back to Date objects
        const restored = parsed.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
        setMessages(restored);
        return;
      } catch (e) {
        console.error('Error loading chat history:', e);
      }
    }

    // Initial welcome message if no history
    const patientName = patientProfile?.firstName || "";
    const welcomeMessage: Message = {
      id: "welcome",
      role: "assistant",
      content: `Hello${patientName ? `, ${patientName}` : ""}! I'm Consulty, your AI health assistant. I can help you find the right doctor based on your symptoms.\n\nPlease describe what you're experiencing, and I'll recommend the appropriate department and doctors for you.`,
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
  }, [patientProfile]);

  // Save chat history to localStorage whenever messages change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('consultara_consulty_history', JSON.stringify(messages));
    }
  }, [messages]);

  // Process initial symptoms from URL
  useEffect(() => {
    const initialSymptoms = searchParams.get("symptoms");
    if (initialSymptoms && messages.length <= 1) {
      setTimeout(() => {
        handleSendMessage(initialSymptoms);
      }, 500);
    }
  }, [searchParams]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /**
   * Handle sending a message
   */
  const handleSendMessage = async (content?: string) => {
    const messageContent = content || inputValue.trim();
    if (!messageContent) return;

    // Add user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: messageContent,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Analyze symptoms
    const analysis = analyzeSymptoms(messageContent);
    const responseContent = generateResponse(messageContent, analysis);

    // Add assistant message
    const assistantMessage: Message = {
      id: `assistant-${Date.now()}`,
      role: "assistant",
      content: responseContent,
      analysis,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, assistantMessage]);
    setCurrentAnalysis(analysis);
    setIsTyping(false);
  };

  /**
   * Handle key press
   */
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  /**
   * Start new conversation
   */
  const handleNewConversation = () => {
    setMessages([{
      id: "welcome-new",
      role: "assistant",
      content: "Let's start fresh! Please describe your symptoms and I'll help you find the right doctor.",
      timestamp: new Date(),
    }]);
    setCurrentAnalysis(null);
    setInputValue("");
  };

  /**
   * Get urgency color
   */
  const getUrgencyColor = (level: string) => {
    switch (level) {
      case "emergency": return "bg-red-500 text-white";
      case "high": return "bg-orange-500 text-white";
      case "medium": return "bg-yellow-500 text-black";
      case "low": return "bg-green-500 text-white";
      default: return "bg-gray-500 text-white";
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-card rounded-t-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full overflow-hidden bg-white flex items-center justify-center">
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Consulty%20AI%20Robot.png-vukUbYjKh8Lwss0u9o9p2SyD52gnuZ.jpeg"
              alt="Consulty AI"
              className="w-full h-full object-contain"
              style={{ background: 'transparent' }}
            />
          </div>
          <div>
            <h1 className="font-semibold text-foreground flex items-center gap-2">
              Consulty AI
              <Sparkles size={16} className="text-primary" />
            </h1>
            <p className="text-sm text-muted-foreground">Your AI Health Assistant</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={handleNewConversation}>
          <RefreshCw size={16} className="mr-2" />
          New Chat
        </Button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/30">
        {messages.map((message) => (
          <div key={message.id}>
            <div
              className={cn(
                "flex gap-3",
                message.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              {message.role === "assistant" && (
                <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                  <img
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Consulty%20AI%20Robot.png-vukUbYjKh8Lwss0u9o9p2SyD52gnuZ.jpeg"
                    alt="Consulty"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div
                className={cn(
                  "max-w-[80%] rounded-2xl px-4 py-3",
                  message.role === "user"
                    ? "bg-primary text-primary-foreground rounded-br-md"
                    : "bg-card text-foreground border border-border rounded-bl-md"
                )}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
                <p className={cn(
                  "text-xs mt-2",
                  message.role === "user" ? "text-primary-foreground/70" : "text-muted-foreground"
                )}>
                  {message.timestamp.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                </p>
              </div>
              {message.role === "user" && (
                <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
                  <User size={16} className="text-muted-foreground" />
                </div>
              )}
            </div>

            {/* Analysis Results */}
            {message.analysis && (
              <div className="mt-4 ml-11 space-y-4">
                {/* Urgency Badge */}
                {message.analysis.urgencyLevel === "emergency" && (
                  <div className="flex items-center gap-2 p-3 bg-red-100 border border-red-300 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    <p className="text-sm text-red-700 font-medium">
                      This may be a medical emergency. Please seek immediate medical attention.
                    </p>
                  </div>
                )}

                {/* Recommended Department */}
                <div className="bg-card border border-border rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-foreground flex items-center gap-2">
                      <Stethoscope size={18} className="text-primary" />
                      Recommended Department
                    </h3>
                    <span className={cn(
                      "px-3 py-1 rounded-full text-xs font-medium capitalize",
                      getUrgencyColor(message.analysis.urgencyLevel)
                    )}>
                      {message.analysis.urgencyLevel} Priority
                    </span>
                  </div>
                  <p className="text-lg font-medium text-primary">{message.analysis.recommendedDepartment}</p>
                </div>

                {/* Recommended Doctors */}
                <div className="bg-card border border-border rounded-xl p-4">
                  <h3 className="font-semibold text-foreground mb-4">Recommended Doctors</h3>
                  <div className="space-y-3">
                    {message.analysis.recommendedDoctors.map((doctor) => (
                      <div
                        key={doctor.id}
                        className="flex items-center gap-4 p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
                      >
                        <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                          <img
                            src={doctor.avatar}
                            alt={`Dr. ${doctor.firstName} ${doctor.lastName}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground">
                            Dr. {doctor.firstName} {doctor.lastName}
                          </p>
                          <p className="text-sm text-muted-foreground">{doctor.specialization}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex items-center gap-1">
                              <Star size={12} className="text-yellow-500 fill-yellow-500" />
                              <span className="text-xs text-muted-foreground">{doctor.rating}</span>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {doctor.yearsOfExperience} years exp.
                            </span>
                          </div>
                        </div>
                        <Link href={`/patient/doctors/${doctor.id}`}>
                          <Button size="sm">
                            <Calendar size={14} className="mr-1" />
                            Book
                          </Button>
                        </Link>
                      </div>
                    ))}
                  </div>
                  <Link 
                    href={`/patient/search?specialty=${encodeURIComponent(message.analysis.recommendedDepartment)}`}
                    className="flex items-center justify-center gap-2 mt-4 text-sm text-primary hover:underline"
                  >
                    View all {message.analysis.recommendedDepartment} doctors
                    <ArrowRight size={14} />
                  </Link>
                </div>

                {/* Disclaimer */}
                <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <AlertTriangle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-yellow-700">{message.analysis.disclaimer}</p>
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Consulty%20AI%20Robot.png-vukUbYjKh8Lwss0u9o9p2SyD52gnuZ.jpeg"
                alt="Consulty"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="bg-card border border-border rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-border bg-white rounded-b-xl">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Tell Consulty what hurts..."
              rows={1}
              className="w-full px-4 py-3 rounded-xl border border-border bg-[#f8f9fa] text-foreground placeholder:text-muted-foreground resize-none focus:ring-2 focus:ring-primary focus:border-transparent"
              disabled={isTyping}
            />
          </div>
          <Button 
            onClick={() => handleSendMessage()}
            disabled={!inputValue.trim() || isTyping}
            className="px-4"
          >
            <Send size={18} />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Consulty provides recommendations only. Always consult a healthcare professional for medical advice.
        </p>
      </div>
    </div>
  );
}
