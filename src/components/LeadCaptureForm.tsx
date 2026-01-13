import { useState } from "react";
import { motion } from "framer-motion";
import { Send, Building2, Briefcase, MessageSquareText } from "lucide-react";

const industries = [
  { value: "", label: "Select your industry" },
  { value: "marine", label: "Marine & Boating" },
  { value: "hospitality", label: "Hospitality & Restaurants" },
  { value: "real-estate", label: "Real Estate" },
  { value: "trades", label: "Trades & Services" },
  { value: "retail", label: "Retail" },
  { value: "other", label: "Other" },
];

const LeadCaptureForm = () => {
  const [formData, setFormData] = useState({
    businessName: "",
    industry: "",
    headache: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    setIsSubmitting(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <section id="intake" className="section-padding bg-navy-light/30">
        <div className="container-max max-w-2xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card rounded-2xl p-8 md:p-12 text-center glow-gold"
          >
            <div className="inline-flex p-4 bg-primary/20 rounded-full mb-6">
              <Send className="w-8 h-8 text-primary" />
            </div>
            <h3 className="font-serif text-2xl font-bold mb-4">
              Your inquiry has been received.
            </h3>
            <p className="text-muted-foreground mb-6">
              I'll personally review your submission and reach out within 4 hours.
              <br />
              Welcome to the Newport way of doing business.
            </p>
            <div className="text-sm text-primary font-medium">
              — Josh, AquidneckAI
            </div>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section id="intake" className="section-padding bg-navy-light/30">
      <div className="container-max max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="text-sm font-medium text-primary uppercase tracking-wider mb-4 block">
            Start the Conversation
          </span>
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">
            White-Glove <span className="text-primary">Intake</span>
          </h2>
          <p className="text-muted-foreground">
            Tell me about your business. Every inquiry receives personal attention.
          </p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          onSubmit={handleSubmit}
          className="glass-card rounded-2xl p-6 md:p-10"
        >
          <div className="space-y-6">
            {/* Business Name */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium mb-2">
                <Building2 className="w-4 h-4 text-primary" />
                Business Name
              </label>
              <input
                type="text"
                required
                value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                className="w-full px-4 py-3 bg-muted/50 border border-border rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-foreground placeholder:text-muted-foreground"
                placeholder="Your business name"
              />
            </div>

            {/* Industry */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium mb-2">
                <Briefcase className="w-4 h-4 text-primary" />
                Industry
              </label>
              <select
                required
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                className="w-full px-4 py-3 bg-muted/50 border border-border rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-foreground appearance-none cursor-pointer"
              >
                {industries.map((industry) => (
                  <option key={industry.value} value={industry.value} className="bg-card">
                    {industry.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Headache Description */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium mb-2">
                <MessageSquareText className="w-4 h-4 text-primary" />
                Describe your biggest operational headache
              </label>
              <textarea
                required
                rows={5}
                value={formData.headache}
                onChange={(e) => setFormData({ ...formData, headache: e.target.value })}
                className="w-full px-4 py-3 bg-muted/50 border border-border rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-foreground placeholder:text-muted-foreground resize-none"
                placeholder="What keeps you up at night? What takes too long? What's the one thing you wish you could automate?"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full btn-gold flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Submit White-Glove Inquiry
                </>
              )}
            </button>
          </div>
        </motion.form>
      </div>
    </section>
  );
};

export default LeadCaptureForm;
