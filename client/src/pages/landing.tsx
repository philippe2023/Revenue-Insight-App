import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Calendar, Users, Zap, TrendingUp, Bell, Shield, Smartphone } from "lucide-react";

export default function Landing() {
  const [, setLocation] = useLocation();

  const features = [
    {
      icon: BarChart3,
      title: "AI-Powered Forecasting",
      description: "Advanced revenue predictions using machine learning algorithms and market data analysis.",
    },
    {
      icon: Calendar,
      title: "Event Impact Analysis",
      description: "Discover local events and predict their impact on your hotel's occupancy and rates.",
    },
    {
      icon: Users,
      title: "Team Collaboration",
      description: "Manage tasks, assign responsibilities, and communicate effectively with your team.",
    },
    {
      icon: TrendingUp,
      title: "Performance Analytics",
      description: "Real-time dashboards showing key metrics, trends, and actionable insights.",
    },
  ];

  const benefits = [
    {
      icon: Zap,
      title: "Increase Revenue",
      description: "Optimize pricing strategies with AI-driven forecasting to maximize revenue per available room.",
    },
    {
      icon: Bell,
      title: "Stay Informed",
      description: "Get instant alerts on market changes, events, and opportunities in your area.",
    },
    {
      icon: Shield,
      title: "Risk Management",
      description: "Identify potential booking risks and market threats before they impact your business.",
    },
    {
      icon: Smartphone,
      title: "Mobile Ready",
      description: "Access your dashboard anywhere, anytime with our responsive design.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="border-b bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">HotelCast</h1>
          </div>
          <Button onClick={() => setLocation("/auth")} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
            Get Started
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-6">
              AI-Powered Hotel
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                Revenue Forecasting
              </span>
            </h1>
            <p className="text-xl lg:text-2xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
              Transform your hotel management with intelligent forecasting, event analysis, and team collaboration tools designed for modern hospitality professionals.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={() => setLocation("/auth")}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8 py-4"
              >
                Start Free Trial
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                className="text-lg px-8 py-4"
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white/50 dark:bg-gray-800/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Powerful Features for Hotel Revenue Management
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Everything you need to optimize your hotel's performance and stay ahead of the competition.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center text-gray-600 dark:text-gray-300">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Why Choose HotelCast?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Join hundreds of hotels already using HotelCast to increase revenue and improve operational efficiency.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex gap-4 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <benefit.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {benefit.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Transform Your Hotel's Revenue Management?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Start your free trial today and discover how HotelCast can help you maximize revenue and streamline operations.
            </p>
            <Button 
              size="lg" 
              onClick={() => setLocation("/auth")}
              className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-4"
            >
              Start Free Trial
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">HotelCast</span>
            </div>
            <p className="text-gray-400">
              © 2025 HotelCast. AI-Powered Hotel Revenue Forecasting Platform.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}