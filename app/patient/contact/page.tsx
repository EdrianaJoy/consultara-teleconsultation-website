/**
 * Contact Us Page
 * 
 * Contact information and support form for patients.
 * 
 * @module app/patient/contact/page
 */

"use client";

import { useState } from "react";
import { 
  Mail, 
  Phone, 
  MapPin, 
  Send,
  Clock,
  MessageCircle,
  CheckCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/**
 * Contact Page Component
 */
export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  /**
   * Handle input change
   */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  if (isSubmitted) {
    return (
      <div className="max-w-md mx-auto text-center py-12">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-4">Message Sent!</h1>
        <p className="text-muted-foreground mb-6">
          Thank you for contacting us. We&apos;ll get back to you within 24-48 hours.
        </p>
        <Button onClick={() => setIsSubmitted(false)}>Send Another Message</Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Contact Us</h1>
        <p className="text-muted-foreground">
          Have questions or need support? We&apos;re here to help.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Contact Info */}
        <div className="space-y-6">
          <div className="bg-card rounded-xl p-6 border border-border">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Phone className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium text-foreground">Phone</h3>
                <p className="text-sm text-muted-foreground">+1 (555) 123-4567</p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl p-6 border border-border">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Mail className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium text-foreground">Email</h3>
                <p className="text-sm text-muted-foreground">support@consultara.com</p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl p-6 border border-border">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium text-foreground">Support Hours</h3>
                <p className="text-sm text-muted-foreground">24/7 Available</p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl p-6 border border-border">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium text-foreground">Address</h3>
                <p className="text-sm text-muted-foreground">
                  123 Healthcare Ave<br />
                  Medical District<br />
                  New York, NY 10001
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-card rounded-xl p-6 border border-border space-y-4">
            <h2 className="text-lg font-semibold text-foreground mb-4">Send us a Message</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1">
                  Full Name
                </label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">
                  Email Address
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="john@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-foreground mb-1">
                Subject
              </label>
              <select
                id="subject"
                name="subject"
                required
                value={formData.subject}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground"
              >
                <option value="">Select a subject</option>
                <option value="general">General Inquiry</option>
                <option value="technical">Technical Support</option>
                <option value="billing">Billing Question</option>
                <option value="appointment">Appointment Issue</option>
                <option value="feedback">Feedback</option>
              </select>
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-foreground mb-1">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                required
                rows={5}
                value={formData.message}
                onChange={handleChange}
                placeholder="How can we help you?"
                className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground resize-none"
              />
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
              {isSubmitting ? (
                "Sending..."
              ) : (
                <>
                  <Send size={18} className="mr-2" />
                  Send Message
                </>
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
