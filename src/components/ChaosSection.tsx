import { motion } from "framer-motion";
import { 
  FileSpreadsheet, 
  TrendingUp, 
  Users, 
  DollarSign, 
  BarChart3, 
  Calendar,
  ShoppingCart,
  Target,
  Instagram,
  CreditCard,
  AlertTriangle,
  CheckCircle2
} from "lucide-react";

const BeforeAfterComparison = () => {
  const chaosItems = [
    { icon: ShoppingCart, label: "Shopify", color: "text-green-400" },
    { icon: Instagram, label: "Meta Ads", color: "text-pink-400" },
    { icon: FileSpreadsheet, label: "Spreadsheets", color: "text-blue-400" },
    { icon: CreditCard, label: "POS System", color: "text-purple-400" },
    { icon: Calendar, label: "Scheduling", color: "text-yellow-400" },
    { icon: Target, label: "Analytics", color: "text-red-400" },
  ];

  const dashboardMetrics = [
    { label: "Daily Profit", value: "$4,847", trend: "+12%", icon: DollarSign },
    { label: "Efficiency Score", value: "94%", trend: "+8%", icon: BarChart3 },
    { label: "Staffing Forecast", value: "Optimal", trend: "3 days", icon: Users },
  ];

  return (
    <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
      {/* Before - Chaos */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative"
      >
        <div className="glass-card rounded-2xl p-6 md:p-8 border-destructive/30">
          <div className="flex items-center gap-3 mb-6">
            <AlertTriangle className="w-6 h-6 text-destructive" />
            <h3 className="font-serif text-xl font-semibold text-destructive">Before</h3>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            {chaosItems.map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.4 }}
                className="flex flex-col items-center gap-2 p-3 rounded-lg bg-muted/50 border border-border/50"
                style={{ 
                  transform: `rotate(${Math.random() * 6 - 3}deg)`,
                }}
              >
                <item.icon className={`w-8 h-8 ${item.color}`} />
                <span className="text-xs text-muted-foreground text-center">{item.label}</span>
              </motion.div>
            ))}
          </div>
          
          <div className="mt-6 p-4 bg-destructive/10 rounded-lg border border-destructive/20">
            <p className="text-sm text-muted-foreground text-center">
              <span className="text-destructive font-medium">60+ minutes</span> daily scramble
            </p>
          </div>
        </div>
        
        {/* Connecting Arrow for mobile */}
        <div className="flex justify-center my-6 md:hidden">
          <div className="w-px h-12 bg-gradient-to-b from-destructive/50 to-primary/50" />
        </div>
      </motion.div>

      {/* After - Dashboard */}
      <motion.div
        initial={{ opacity: 0, x: 30 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="relative"
      >
        <div className="glass-card-hover rounded-2xl p-6 md:p-8 glow-gold">
          <div className="flex items-center gap-3 mb-6">
            <CheckCircle2 className="w-6 h-6 text-primary" />
            <h3 className="font-serif text-xl font-semibold text-primary">After: CEO Dashboard</h3>
          </div>

          <div className="space-y-4">
            {dashboardMetrics.map((metric, index) => (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 + index * 0.1, duration: 0.4 }}
                className="flex items-center justify-between p-4 bg-navy-light/50 rounded-lg border border-primary/10"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <metric.icon className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-sm text-muted-foreground">{metric.label}</span>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-foreground">{metric.value}</div>
                  <div className="text-xs text-primary">{metric.trend}</div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-primary/10 rounded-lg border border-primary/20">
            <p className="text-sm text-center">
              <span className="text-primary font-medium">Real-time answers</span>
              <span className="text-muted-foreground"> in seconds</span>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const ChaosSection = () => {
  return (
    <section className="section-padding bg-navy-light/30">
      <div className="container-max">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-serif font-bold mb-6">
            <span className="text-foreground">Did you </span>
            <span className="text-primary">make money</span>
            <span className="text-foreground"> yesterday?</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            For most owners, that's a 60-minute scramble across Shopify, Meta, and POS spreadsheets.
            <br />
            <span className="text-foreground font-medium">That isn't a system. That's a liability.</span>
          </p>
        </motion.div>

        <BeforeAfterComparison />
      </div>
    </section>
  );
};

export default ChaosSection;
