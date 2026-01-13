import { motion } from "framer-motion";
import { Search, Wrench, RefreshCw, Compass } from "lucide-react";

const features = [
  {
    icon: Search,
    title: "Diagnose",
    description: "Finding friction in your dashboards and business logic. I map the invisible bottlenecks stealing your time.",
  },
  {
    icon: Wrench,
    title: "Build",
    description: "Wielding Claude Code & n8n to recruit your 'Digital Employee.' Custom automation that speaks your language.",
  },
  {
    icon: RefreshCw,
    title: "Tune",
    description: "Continuous intelligence updates so you stay at the bleeding edge. AI evolves—your systems evolve with it.",
  },
];

const AITranslatorSection = () => {
  return (
    <section className="section-padding relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div 
          className="w-full h-full"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, hsl(var(--gold)) 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }}
        />
      </div>

      <div className="container-max relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left - Story */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 mb-6">
              <Compass className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium text-primary uppercase tracking-wider">Your Local Partner</span>
            </div>
            
            <h2 className="text-3xl md:text-5xl font-serif font-bold mb-6">
              Your Local
              <br />
              <span className="text-primary">AI Translator.</span>
            </h2>
            
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                I don't just sell software. I bridge the gap between 
                <span className="text-foreground font-medium"> human intuition </span> 
                and 
                <span className="text-primary font-medium"> Frontier AI</span>.
              </p>
              <p>
                With an engineering background and a history on Newport's paint crews and restaurant lines, I translate your qualitative headaches into quantitative automation.
              </p>
              <p className="text-foreground italic border-l-2 border-primary pl-4">
                "The best tools mean nothing if they don't speak your language."
              </p>
            </div>

            {/* Newport anchor decoration */}
            <div className="nautical-divider mt-10" />
          </motion.div>

          {/* Right - Feature Grid */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6"
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
                className="glass-card-hover rounded-xl p-6 group"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors duration-300">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-serif text-xl font-semibold mb-2 text-foreground group-hover:text-primary transition-colors duration-300">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AITranslatorSection;
