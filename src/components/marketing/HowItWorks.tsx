
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { UserPlus, CreditCard, Gamepad2, Award } from 'lucide-react';

const HowItWorks = () => {
  const steps = [
    {
      icon: <UserPlus className="h-10 w-10" />,
      title: "Create an Account",
      description: "Sign up in less than a minute and verify your account to access all features."
    },
    {
      icon: <CreditCard className="h-10 w-10" />,
      title: "Make a Deposit",
      description: "Add funds using one of our many secure payment methods."
    },
    {
      icon: <Gamepad2 className="h-10 w-10" />,
      title: "Play and Win",
      description: "Choose from hundreds of exciting games and start winning."
    },
    {
      icon: <Award className="h-10 w-10" />,
      title: "Withdraw Winnings",
      description: "Cash out your winnings quickly and safely with our fast withdrawal process."
    }
  ];

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">How It Works</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Getting started is quick and easy. Follow these simple steps to begin your gaming journey.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div 
              key={index} 
              className="flex flex-col items-center text-center p-6 rounded-lg bg-card border border-border"
            >
              <div className="mb-4 text-primary">
                {step.icon}
              </div>
              <div className="rounded-full bg-primary/10 text-primary w-8 h-8 flex items-center justify-center mb-4">
                {index + 1}
              </div>
              <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
              <p className="text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button size="lg" asChild>
            <Link to="/register">Get Started Now</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
