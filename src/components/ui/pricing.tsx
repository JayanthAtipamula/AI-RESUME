import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Check, Star } from "lucide-react";
import { useMediaQuery } from "../../hooks/use-media-query";
import { Label } from "./label";
import { Switch } from "./switch";
import confetti from "canvas-confetti";
import { Link } from "react-router-dom";
import { cn } from "../../lib/utils";

interface PricingPlan {
  name: string;
  price: string;
  yearlyPrice: string;
  period: string;
  features: string[];
  description: string;
  buttonText: string;
  href: string;
  isPopular: boolean;
}

interface PricingProps {
  plans: PricingPlan[];
  title?: string;
  description?: string;
}

export function Pricing({
  plans,
  title = "Simple, Transparent Pricing",
  description = "Choose the plan that works for you. All plans include access to our platform, lead generation tools, and dedicated support.",
}: PricingProps) {
  const [isMonthly, setIsMonthly] = useState(true);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const switchRef = useRef<HTMLButtonElement>(null);

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
        colors: ['#00ffff', '#ffffff'],
        ticks: 200,
        gravity: 1.2,
        decay: 0.94,
        startVelocity: 30,
        shapes: ["circle"],
      });
    }
  };

  return (
    <div className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
            {title}
          </h2>
          <p className="text-gray-400 text-lg whitespace-pre-line max-w-2xl mx-auto">
            {description}
          </p>
        </div>

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
                `glass p-6 text-center lg:flex lg:flex-col lg:justify-center relative`,
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
                  <span className="text-black ml-1 font-sans font-semibold">
                    Popular
                  </span>
                </div>
              )}
              <div className="flex-1 flex flex-col">
                <p className="text-base font-semibold text-gray-400">
                  {plan.name}
                </p>
                <div className="mt-6 flex items-center justify-center gap-x-2">
                  <span className="text-5xl font-bold tracking-tight text-white">
                    ${isMonthly ? plan.price : plan.yearlyPrice}
                  </span>
                  {plan.period !== "Next 3 months" && (
                    <span className="text-sm font-semibold leading-6 tracking-wide text-gray-400">
                      / {plan.period}
                    </span>
                  )}
                </div>

                <p className="text-xs leading-5 text-gray-400">
                  {isMonthly ? "billed monthly" : "billed annually"}
                </p>

                <ul className="mt-5 gap-2 flex flex-col">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-neon-blue mt-1 flex-shrink-0" />
                      <span className="text-left text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                <hr className="w-full my-4 border-white/10" />

                <Link
                  to={plan.href}
                  className={cn(
                    "glass-button w-full",
                    plan.isPopular
                      ? "bg-neon-blue text-black hover:bg-neon-blue/90"
                      : ""
                  )}
                >
                  {plan.buttonText}
                </Link>
                <p className="mt-6 text-xs leading-5 text-gray-400">
                  {plan.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}