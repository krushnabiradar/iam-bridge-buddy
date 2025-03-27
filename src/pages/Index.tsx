
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import NavBar from '@/components/NavBar';
import { useAuth } from '@/context/AuthContext';
import { Shield, Globe, Key, ArrowRight } from 'lucide-react';

const Index = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <NavBar />

      {/* Hero Section */}
      <section className="pt-24 md:pt-32 pb-16 md:pb-24 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center justify-center px-4 py-1.5 mb-6 text-xs font-medium rounded-full bg-primary/10 text-primary animate-fade-in">
            <Shield className="h-3.5 w-3.5 mr-1.5" />
            Modern Identity & Access Management
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight animate-slide-up">
            Secure Authentication for Modern Applications
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-8 md:mb-10 animate-slide-up" style={{ animationDelay: '100ms' }}>
            A comprehensive identity platform with social logins, SSO, and advanced access controls—all with a beautiful, minimalist interface.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: '200ms' }}>
            <Button asChild size="lg" className="px-8">
              <Link to={isAuthenticated ? "/dashboard" : "/auth"}>
                {isAuthenticated ? "Go to Dashboard" : "Get Started"}
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <a href="#features">
                Learn More <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-16 md:py-24 px-4 bg-background/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Premium Identity Features</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Comprehensive authentication and authorization capabilities with a focus on security, 
              usability, and elegance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-background rounded-xl p-6 border border-border shadow-sm animate-fade-in hover-lift">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-medium mb-2">Social Logins</h3>
              <p className="text-muted-foreground">
                Seamlessly integrate with Google, Facebook, Twitter, and GitHub for quick authentication.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-background rounded-xl p-6 border border-border shadow-sm animate-fade-in hover-lift" style={{ animationDelay: '100ms' }}>
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Globe className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-medium mb-2">Enterprise SSO</h3>
              <p className="text-muted-foreground">
                Support for SAML, OpenID Connect, and custom SSO protocols for enterprise integration.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-background rounded-xl p-6 border border-border shadow-sm animate-fade-in hover-lift" style={{ animationDelay: '200ms' }}>
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Key className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-medium mb-2">Advanced Security</h3>
              <p className="text-muted-foreground">
                Role-based access control, multi-factor authentication, and detailed security logs.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-background rounded-xl p-6 border border-border shadow-sm animate-fade-in hover-lift" style={{ animationDelay: '300ms' }}>
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-medium mb-2">Custom Branding</h3>
              <p className="text-muted-foreground">
                Fully customizable login screens, emails, and authentication flows to match your brand.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-background rounded-xl p-6 border border-border shadow-sm animate-fade-in hover-lift" style={{ animationDelay: '400ms' }}>
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-xl font-medium mb-2">User Management</h3>
              <p className="text-muted-foreground">
                Comprehensive tools for managing user accounts, permissions, and profile data.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-background rounded-xl p-6 border border-border shadow-sm animate-fade-in hover-lift" style={{ animationDelay: '500ms' }}>
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              </div>
              <h3 className="text-xl font-medium mb-2">Developer APIs</h3>
              <p className="text-muted-foreground">
                Robust APIs and SDKs for seamless integration with your applications and services.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 px-4">
        <div className="max-w-5xl mx-auto bg-primary/5 rounded-2xl p-8 md:p-12 text-center relative overflow-hidden glass-card animate-scale-in">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10 opacity-50"></div>
          <div className="relative z-10">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to get started?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
              Experience the most elegant, secure, and user-friendly identity platform for your applications.
            </p>
            <Button asChild size="lg" className="px-8">
              <Link to={isAuthenticated ? "/dashboard" : "/auth"}>
                {isAuthenticated ? "Go to Dashboard" : "Get Started Now"}
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-secondary/30 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <h3 className="text-lg font-semibold">IDENTITY</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Modern identity for modern applications
              </p>
            </div>
            <div className="flex space-x-8 text-sm">
              <Link to="/" className="text-muted-foreground hover:text-primary transition-colors">
                Home
              </Link>
              <a href="#features" className="text-muted-foreground hover:text-primary transition-colors">
                Features
              </a>
              <Link to="/auth" className="text-muted-foreground hover:text-primary transition-colors">
                Sign In
              </Link>
            </div>
          </div>
          <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} Identity System. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
