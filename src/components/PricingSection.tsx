import { motion } from "framer-motion";
import { Check, Sparkles, Crown, Handshake } from "lucide-react";

const pricingTiers = [
  {
    icon: Sparkles,
    name: "The White-Glove Audit",
    price: "$1,997",
    highlight: "100% Credited Toward Setup",
    features: [
      "On-site discovery interview",
      "Custom Roadmap of Possibilities",
      "Frontier AI capability analysis",
      "Priority implementation scheduling",
    ],
    cta: "Book Your Audit",
    popular: false,
  },
  {
    icon: Crown,
    name: "The Implementation",
    price: "Starting at $4,997",
    highlight: "Most Popular",
    features: [
      "Full CEO Dashboard build",
      "n8n & GHL Engineering",
      "Digital Employee recruitment",
      "Staff onboarding & training",
      "30-day optimization period",
    ],
    cta: "Start Implementation",
    popular: true,
  },
  {
    icon: Handshake,
    name: "The Digital Partner",
    price: "$997/mo",
    highlight: "Ongoing Excellence",
    features: [
      "Weekly model tuning",
      "Local in-person support",
      "Surprise check-ins",
      "Hosting included",
      "Unlimited app access",
    ],
    cta: "Become a Partner",
    popular: false,
  },
];

const PricingSection = () => {
  return (
    <section id="pricing" className="section-padding bg-navy-light/30">
      <div className="container-max">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-sm font-medium text-primary uppercase tracking-wider mb-4 block">
            Investment Tiers
          </span>
          <h2 className="text-3xl md:text-5xl font-serif font-bold mb-6">
            The <span className="text-primary">Pricing Menu</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Premium service with Newport standards. Every engagement is tailored to your business.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {pricingTiers.map((tier, index) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`relative ${tier.popular ? 'md:-mt-4 md:mb-4' : ''}`}
            >
              {tier.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                  <span className="bg-primary text-primary-foreground text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider">
                    {tier.highlight}
                  </span>
                </div>
              )}
              
              <div 
                className={`h-full rounded-2xl p-6 lg:p-8 transition-all duration-500 ${
                  tier.popular 
                    ? 'glass-card glow-gold-intense border-primary/40' 
                    : 'glass-card-hover'
                }`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-2 rounded-lg ${tier.popular ? 'bg-primary/20' : 'bg-primary/10'}`}>
                    <tier.icon className={`w-5 h-5 ${tier.popular ? 'text-primary' : 'text-primary/80'}`} />
                  </div>
                  <h3 className="font-serif text-lg font-semibold">{tier.name}</h3>
                </div>

                <div className="mb-6">
                  <div className="text-3xl lg:text-4xl font-bold text-foreground mb-1">
                    {tier.price}
                  </div>
                  {!tier.popular && tier.highlight && (
                    <span className="text-sm text-primary font-medium">{tier.highlight}</span>
                  )}
                </div>

                <ul className="space-y-3 mb-8">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                <a
                  href="#intake"
                  className={`block text-center py-3 px-6 rounded-lg font-medium transition-all duration-300 ${
                    tier.popular
                      ? 'btn-gold w-full'
                      : 'btn-outline-gold w-full'
                  }`}
                >
                  {tier.cta}
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
