import { motion } from "framer-motion";
import { 
  Phone, 
  Mail, 
  Star, 
  Users, 
  Clock, 
  Calendar,
  MessageSquare,
  Zap
} from "lucide-react";

const capabilities = [
  {
    icon: Phone,
    title: "24/7 Phone Handling",
    description: "Never miss a call. Your Digital Employee answers with your brand voice.",
  },
  {
    icon: Mail,
    title: "Email Triage",
    description: "Auto-categorize and respond to routine inquiries instantly.",
  },
  {
    icon: Star,
    title: "Review Management",
    description: "Monitor, respond, and escalate reviews across all platforms.",
  },
  {
    icon: Users,
    title: "100% Lead Capture",
    description: "Every festival, every event—no opportunity falls through the cracks.",
  },
  {
    icon: Clock,
    title: "Never Takes Sick Days",
    description: "Consistent performance, every single day of the year.",
  },
  {
    icon: Calendar,
    title: "Smart Scheduling",
    description: "Book appointments and manage your calendar automatically.",
  },
];

const DigitalEmployeeSection = () => {
  return (
    <section className="section-padding relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
      
      <div className="container-max relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 mb-6">
            <Zap className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium text-primary uppercase tracking-wider">Always On</span>
          </div>
          
          <h2 className="text-3xl md:text-5xl font-serif font-bold mb-6">
            Meet Your
            <br />
            <span className="text-primary">Digital Employee</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            An AI-powered team member that works around the clock, 
            handling the tasks that keep you from strategic thinking.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {capabilities.map((capability, index) => (
            <motion.div
              key={capability.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="glass-card-hover rounded-xl p-6 text-center group"
            >
              <div className="inline-flex p-4 bg-primary/10 rounded-2xl mb-4 group-hover:bg-primary/20 transition-colors duration-300">
                <capability.icon className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-serif text-lg font-semibold mb-2 group-hover:text-primary transition-colors duration-300">
                {capability.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {capability.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 text-center"
        >
          <div className="glass-card inline-flex items-center gap-4 px-8 py-4 rounded-full">
            <MessageSquare className="w-5 h-5 text-primary" />
            <span className="text-muted-foreground">
              Ready to recruit your Digital Employee?
            </span>
            <a href="#intake" className="text-primary font-medium hover:underline">
              Get Started →
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default DigitalEmployeeSection;
