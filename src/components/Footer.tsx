import { motion } from "framer-motion";
import { MapPin, Anchor, Mail } from "lucide-react";

const Footer = () => {
  return (
    <footer className="section-padding bg-background border-t border-border/50">
      <div className="container-max">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="nautical-divider mb-12" />
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8 italic font-serif leading-relaxed">
            "No matter the color of your collar, I offer unparalleled in-person support.
            <br />
            <span className="text-primary font-medium not-italic">I win only if you win.</span>"
          </p>
        </motion.div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Logo / Brand */}
          <div className="flex items-center gap-3">
            <Anchor className="w-8 h-8 text-primary" />
            <div>
              <div className="font-serif text-xl font-bold">AquidneckAI</div>
              <div className="text-xs text-muted-foreground">AI Operations & Automation</div>
            </div>
          </div>

          {/* Location */}
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="w-4 h-4 text-primary" />
            <span>Newport, Rhode Island</span>
          </div>

          {/* Contact */}
          <a 
            href="mailto:hello@aquidneckai.com"
            className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
          >
            <Mail className="w-4 h-4" />
            <span>hello@aquidneckai.com</span>
          </a>
        </div>

        <div className="mt-12 pt-8 border-t border-border/30 text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} AquidneckAI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
