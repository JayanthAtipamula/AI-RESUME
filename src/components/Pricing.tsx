import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Star, Check } from 'lucide-react';
import { useMediaQuery } from '../hooks/use-media-query';
import { cn } from '../lib/utils';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import confetti from 'canvas-confetti';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../lib/store';

const plans = [
  {
    name: "FREE",
    price: "0",
    yearlyPrice: "0",
    period: "forever",
    features: [
      "Up to 3 resumes",
      "Basic ATS optimization",
      "PDF downloads",
      "Email support",
      "Basic templates"
    ],
    description: "Perfect for trying out our AI resume builder",
    buttonText: "Get Started",
    href: "/login",
    isPopular: false
  },
  {
    name: "PRO",
    price: "15",
    yearlyPrice: "12",
    period: "per month",
    features: [
      "Unlimited resumes",
      "Advanced ATS optimization",
      "Cover letter generation",
      "Priority support",
      "Premium templates",
      "Resume sharing",
      "Multiple formats"
    ],
    description: "Best for job seekers and professionals",
    buttonText: "Upgrade Now",
    href: "/login",
    isPopular: true
  },
  {
    name: "TEAM",
    price: "49",
    yearlyPrice: "39",
    period: "per month",
    features: [
      "Everything in Pro",
      "Team collaboration",
      "Custom branding",
      "Analytics dashboard",
      "API access",
      "Dedicated support",
      "Bulk generation",
      "Enterprise security"
    ],
    description: "Perfect for recruiting teams and companies",
    buttonText: "Contact Sales",
    href: "/contact",
    isPopular: false
  }
];

interface PricingProps {
  showTitle?: boolean;
  onSelectPlan?: (plan: string) => void;
}

export default function Pricing({ showTitle = true, onSelectPlan }: PricingProps) {
  const [isMonthly, setIsMonthly] = useState(true);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const switchRef = useRef<HTMLButtonElement>(null);
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const handleToggle = (checked: boolean) => {
    setIsMonthly(!checked);
    if (checked && switchRef.current) {
      const rect = switchRef.current.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;

      confetti({
        particleCount: 50,
        spread: 60,
        origin: {
          x: x / window.innerWidth,
          y: y / window.innerHeight,
        },
        colors: ['#00ffff', '#ff00ff', '#ffffff'],
        ticks: 200,
        gravity: 1.2,
        decay: 0.94,
        startVelocity: 30,
        shapes: ["circle"],
      });
    }
  };

  const handlePlanSelect = (plan: string) => {
    if (onSelectPlan) {
      onSelectPlan(plan);
    } else if (!user) {
      navigate('/login', { state: { from: '/pricing', plan } });
    } else {
      // Handle upgrade logic
      // This could open your upgrade modal or redirect to payment
      window.location.href = `/payment?plan=${plan}`;
    }
  };

  return (
    <div className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        {showTitle && (
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-4xl font-bold tracking-tight">
              Simple, Transparent <span className="text-neon-blue">Pricing</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Choose the plan that works for you. All plans include access to our AI-powered resume builder and ATS optimization.
            </p>
          </div>
        )}

        <div className="flex justify-center mb-10">
          <label className="relative inline-flex items-center cursor-pointer">
            <Label className="text-white">
              <Switch
                ref={switchRef as any}
                checked={!isMonthly}
                onCheckedChange={handleToggle}
                className="relative"
              />
            </Label>
          </label>
          <span className="ml-2 font-semibold text-white">
            Annual billing <span className="text-neon-blue">(Save 20%)</span>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ y: 50, opacity: 1 }}
              whileInView={
                isDesktop
                  ? {
                      y: plan.isPopular ? -20 : 0,
                      opacity: 1,
                      x: index === 2 ? -30 : index === 0 ? 30 : 0,
                      scale: index === 0 || index === 2 ? 0.94 : 1.0,
                    }
                  : {}
              }
              viewport={{ once: true }}
              transition={{
                duration: 1.6,
                type: "spring",
                stiffness: 100,
                damping: 30,
                delay: 0.4,
                opacity: { duration: 0.5 },
              }}
              className={cn(
                "glass p-6 relative",
                plan.isPopular ? "border-neon-blue border-2" : "border border-white/10",
                "flex flex-col",
                !plan.isPopular && "mt-5",
                index === 0 || index === 2
                  ? "z-0 transform translate-x-0 translate-y-0 -translate-z-[50px] rotate-y-[10deg]"
                  : "z-10",
                index === 0 && "origin-right",
                index === 2 && "origin-left"
              )}
            >
              {plan.isPopular && (
                <div className="absolute top-0 right-0 bg-neon-blue py-0.5 px-2 rounded-bl-xl rounded-tr-xl flex items-center">
                  <Star className="text-black h-4 w-4 fill-current" />
                  <span className="text-black ml-1 font-semibold">
                    Popular
                  </span>
                </div>
              )}
              <div className="flex-1 flex flex-col text-center">
                <p className="text-base font-semibold text-gray-400">
                  {plan.name}
                </p>
                <div className="mt-6 flex items-center justify-center gap-x-2">
                  <span className="text-5xl font-bold text-white">
                    ${isMonthly ? plan.price : plan.yearlyPrice}
                  </span>
                  {plan.period !== "forever" && (
                    <span className="text-sm font-semibold text-gray-400">
                      / {plan.period}
                    </span>
                  )}
                </div>

                <p className="text-xs text-gray-400">
                  {isMonthly ? "billed monthly" : "billed annually"}
                </p>

                <ul className="mt-8 space-y-4">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-neon-blue flex-shrink-0" />
                      <span className="text-left text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-8">
                  <a
                    href={plan.href}
                    className={cn(
                      "glass-button w-full",
                      plan.isPopular && "bg-neon-blue text-black hover:bg-neon-blue/90"
                    )}
                    onClick={() => handlePlanSelect(plan.name)}
                  >
                    {plan.buttonText}
                  </a>
                  <p className="mt-4 text-xs text-gray-400">
                    {plan.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}