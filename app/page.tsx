/**
 * ConsulTara TeleConsultation Platform - Landing Page
 * 
 * This is the public landing page that visitors see when they first
 * access the website. It provides information about the service and
 * directs users to sign in or sign up.
 */

import Link from 'next/link';
import Image from 'next/image';
import { 
  Heart, 
  Shield, 
  Clock, 
  Video, 
  Calendar, 
  MessageSquare,
  ArrowRight,
  Star,
  CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#F3EFE3]">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 bg-[#F3EFE3]/95 backdrop-blur-sm border-b border-[#C0C3B9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ConsulTara%20Logo-oqtBESzen2QQnxkVKzgc7RxAQEbHnb.png"
                alt="ConsulTara Logo"
                width={40}
                height={40}
                className="w-10 h-10"
              />
              <span className="text-xl md:text-2xl font-semibold text-[#769382]">ConsulTara</span>
            </Link>

            {/* Navigation Links */}
            <nav className="hidden md:flex items-center gap-8">
              <Link href="#services" className="text-[#2D3B35]/70 hover:text-[#769382] transition-colors">
                Services
              </Link>
              <Link href="#how-it-works" className="text-[#2D3B35]/70 hover:text-[#769382] transition-colors">
                How It Works
              </Link>
              <Link href="#departments" className="text-[#2D3B35]/70 hover:text-[#769382] transition-colors">
                Departments
              </Link>
              <Link href="#contact" className="text-[#2D3B35]/70 hover:text-[#769382] transition-colors">
                Contact
              </Link>
            </nav>

            {/* Auth Buttons */}
            <div className="flex items-center gap-3">
              <Link href="/auth/signin">
                <Button variant="ghost" className="text-[#769382] hover:bg-[#769382]/10">
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/signin">
                <Button className="bg-[#769382] hover:bg-[#769382]/90 text-white">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 bg-[#FFEBBC]/50 px-4 py-2 rounded-full">
                <span className="w-2 h-2 bg-[#769382] rounded-full animate-pulse" />
                <span className="text-sm text-[#2D3B35]/70">Healthcare made simple</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#2D3B35] leading-tight text-balance">
                Your Health, <br />
                <span className="text-[#769382]">Our Priority</span>
              </h1>
              
              <p className="text-lg text-[#2D3B35]/70 max-w-lg leading-relaxed">
                Connect with certified healthcare professionals from the comfort of your home. 
                Book appointments, consult online, and manage your health records securely with ConsulTara.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/auth/signin">
                  <Button size="lg" className="bg-[#769382] hover:bg-[#769382]/90 text-white w-full sm:w-auto">
                    Book Consultation
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link href="#how-it-works">
                  <Button size="lg" variant="outline" className="border-[#769382] text-[#769382] hover:bg-[#769382]/10 w-full sm:w-auto">
                    Learn More
                  </Button>
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="flex items-center gap-6 pt-4">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div 
                        key={i} 
                        className="w-8 h-8 rounded-full bg-[#769382]/20 border-2 border-white flex items-center justify-center text-xs text-[#769382] font-medium"
                      >
                        {i}K+
                      </div>
                    ))}
                  </div>
                  <span className="text-sm text-[#2D3B35]/70">Happy Patients</span>
                </div>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="w-4 h-4 fill-[#FFEBBC] text-[#FFEBBC]" />
                  ))}
                  <span className="text-sm text-[#2D3B35]/70 ml-1">4.9/5</span>
                </div>
              </div>
            </div>

            {/* Hero Image */}
            <div className="relative hidden lg:block">
              <div className="relative w-full aspect-square max-w-lg mx-auto">
                <div className="absolute inset-0 bg-[#769382]/10 rounded-3xl transform rotate-6" />
                <div className="absolute inset-0 bg-[#FFEBBC]/30 rounded-3xl transform -rotate-3" />
                <Image
                  src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&h=600&fit=crop"
                  alt="Doctor consultation"
                  width={600}
                  height={600}
                  className="relative rounded-3xl object-cover w-full h-full"
                  priority
                />
                
                {/* Floating Cards */}
                <div className="absolute -left-8 top-1/4 bg-white rounded-xl shadow-lg p-4 flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#769382]/10 rounded-full flex items-center justify-center">
                    <Video className="w-5 h-5 text-[#769382]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#2D3B35]">Video Consultation</p>
                    <p className="text-xs text-[#2D3B35]/60">Face-to-face online</p>
                  </div>
                </div>
                
                <div className="absolute -right-4 bottom-1/4 bg-white rounded-xl shadow-lg p-4 flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#FFEBBC] rounded-full flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-[#2D3B35]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#2D3B35]">Easy Scheduling</p>
                    <p className="text-xs text-[#2D3B35]/60">Book in seconds</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="bg-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#2D3B35] mb-4">
              Why Choose ConsulTara?
            </h2>
            <p className="text-[#2D3B35]/70 max-w-2xl mx-auto">
              Experience healthcare that fits your lifestyle with our comprehensive teleconsultation services.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Video,
                title: 'Video Consultations',
                description: 'Connect with doctors through secure, high-quality video calls from anywhere.'
              },
              {
                icon: Clock,
                title: '24/7 Availability',
                description: 'Access healthcare services anytime with flexible scheduling options.'
              },
              {
                icon: Shield,
                title: 'Secure & Private',
                description: 'Your health data is protected with enterprise-grade security measures.'
              },
              {
                icon: Heart,
                title: 'Expert Specialists',
                description: 'Consult with certified specialists across 10+ medical departments.'
              },
              {
                icon: MessageSquare,
                title: 'AI-Powered Assistant',
                description: 'Get instant guidance from Consulty, our AI symptom analyzer.'
              },
              {
                icon: Calendar,
                title: 'Digital Records',
                description: 'Access your complete medical history and prescriptions anytime.'
              }
            ].map((service, index) => (
              <div 
                key={index}
                className="group p-6 rounded-2xl border border-[#C0C3B9] hover:border-[#769382] hover:shadow-lg transition-all duration-300"
              >
                <div className="w-12 h-12 bg-[#769382]/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#769382] transition-colors">
                  <service.icon className="w-6 h-6 text-[#769382] group-hover:text-white" />
                </div>
                <h3 className="text-lg font-semibold text-[#2D3B35] mb-2">{service.title}</h3>
                <p className="text-[#2D3B35]/70">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 md:py-24 bg-[#F3EFE3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#2D3B35] mb-4">
              How It Works
            </h2>
            <p className="text-[#2D3B35]/70 max-w-2xl mx-auto">
              Getting started with ConsulTara is simple. Follow these steps to connect with a healthcare professional.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: '01', title: 'Create Account', description: 'Sign up and complete your profile with basic health information.' },
              { step: '02', title: 'Find a Doctor', description: 'Browse our specialists or let Consulty recommend one based on your symptoms.' },
              { step: '03', title: 'Book Appointment', description: 'Choose a convenient time slot and consultation type.' },
              { step: '04', title: 'Start Consultation', description: 'Connect with your doctor via video, audio, or chat.' }
            ].map((item, index) => (
              <div key={index} className="relative">
                <div className="text-6xl font-bold text-[#769382]/10 mb-4">{item.step}</div>
                <h3 className="text-lg font-semibold text-[#2D3B35] mb-2">{item.title}</h3>
                <p className="text-[#2D3B35]/70 text-sm">{item.description}</p>
                {index < 3 && (
                  <ArrowRight className="hidden md:block absolute top-8 -right-4 w-6 h-6 text-[#769382]/30" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Departments Section */}
      <section id="departments" className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#2D3B35] mb-4">
              Our Departments
            </h2>
            <p className="text-[#2D3B35]/70 max-w-2xl mx-auto">
              Access specialists from various medical fields, all in one platform.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              'Cardiology',
              'Dermatology',
              'Pediatrics',
              'Neurology',
              'Orthopedics',
              'Gynecology',
              'Ophthalmology',
              'Psychiatry',
              'General Medicine',
              'ENT'
            ].map((dept, index) => (
              <div
                key={index}
                className="p-4 rounded-xl bg-[#FFEBBC]/30 hover:bg-[#769382] hover:text-white text-center transition-colors cursor-pointer group"
              >
                <span className="text-sm font-medium text-[#2D3B35] group-hover:text-white">{dept}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-[#769382]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Take Control of Your Health?
          </h2>
          <p className="text-white/80 mb-8 max-w-2xl mx-auto">
            Join thousands of patients who have discovered the convenience of teleconsultation with ConsulTara.
          </p>
          <Link href="/auth/signin">
            <Button size="lg" className="bg-white text-[#769382] hover:bg-white/90">
              Get Started Today
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>

          <div className="mt-12 grid grid-cols-3 gap-8">
            {[
              { value: '25+', label: 'Specialist Doctors' },
              { value: '10+', label: 'Departments' },
              { value: '4.9', label: 'Average Rating' }
            ].map((stat, index) => (
              <div key={index}>
                <div className="text-3xl md:text-4xl font-bold text-white">{stat.value}</div>
                <div className="text-white/70 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 md:py-24 bg-[#F3EFE3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-[#2D3B35] mb-4">
                Get in Touch
              </h2>
              <p className="text-[#2D3B35]/70 mb-8">
                Have questions? Our support team is here to help you 24/7.
              </p>
              
              <div className="space-y-4">
                {[
                  { label: 'Email', value: 'support@consultara.com' },
                  { label: 'Phone', value: '+1 (555) 123-4567' },
                  { label: 'Address', value: '123 Healthcare Ave, Medical City, MC 12345' }
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <CheckCircle className="w-5 h-5 text-[#769382]" />
                    <div>
                      <span className="text-[#2D3B35]/60 text-sm">{item.label}:</span>
                      <p className="text-[#2D3B35] font-medium">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h3 className="text-xl font-semibold text-[#2D3B35] mb-6">Send us a message</h3>
              <form className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="First Name"
                    className="px-4 py-3 rounded-lg border border-[#C0C3B9] focus:border-[#769382] focus:ring-1 focus:ring-[#769382] outline-none transition-colors"
                  />
                  <input
                    type="text"
                    placeholder="Last Name"
                    className="px-4 py-3 rounded-lg border border-[#C0C3B9] focus:border-[#769382] focus:ring-1 focus:ring-[#769382] outline-none transition-colors"
                  />
                </div>
                <input
                  type="email"
                  placeholder="Email Address"
                  className="w-full px-4 py-3 rounded-lg border border-[#C0C3B9] focus:border-[#769382] focus:ring-1 focus:ring-[#769382] outline-none transition-colors"
                />
                <textarea
                  placeholder="Your Message"
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg border border-[#C0C3B9] focus:border-[#769382] focus:ring-1 focus:ring-[#769382] outline-none transition-colors resize-none"
                />
                <Button className="w-full bg-[#769382] hover:bg-[#769382]/90 text-white">
                  Send Message
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#2D3B35] text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Image
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ConsulTara%20Logo-oqtBESzen2QQnxkVKzgc7RxAQEbHnb.png"
                  alt="ConsulTara Logo"
                  width={32}
                  height={32}
                  className="w-8 h-8 brightness-200"
                />
                <span className="text-xl font-semibold">ConsulTara</span>
              </div>
              <p className="text-white/60 text-sm">
                Making healthcare accessible to everyone, everywhere.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-white/60 text-sm">
                <li><Link href="#services" className="hover:text-white transition-colors">Services</Link></li>
                <li><Link href="#departments" className="hover:text-white transition-colors">Departments</Link></li>
                <li><Link href="#how-it-works" className="hover:text-white transition-colors">How It Works</Link></li>
                <li><Link href="#contact" className="hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-white/60 text-sm">
                <li><Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Terms of Service</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Cookie Policy</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Connect</h4>
              <ul className="space-y-2 text-white/60 text-sm">
                <li><Link href="#" className="hover:text-white transition-colors">Facebook</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Twitter</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">LinkedIn</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Instagram</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 mt-8 pt-8 text-center text-white/60 text-sm">
            <p>&copy; {new Date().getFullYear()} ConsulTara. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
