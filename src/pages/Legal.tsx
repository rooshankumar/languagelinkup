
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

const PrivacyPolicy = () => {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link to="/" className="flex items-center text-muted-foreground hover:text-primary mb-6">
        <ChevronLeft className="h-4 w-4 mr-1" />
        Back to home
      </Link>
      
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      
      <div className="prose prose-slate max-w-none">
        <p>Last updated: {new Date().toLocaleDateString()}</p>
        
        <h2>1. Introduction</h2>
        <p>
          Welcome to LinguaLink ("we," "our," or "us"). We respect your privacy and are committed to 
          protecting your personal data. This privacy policy will inform you about how we look after 
          your personal data when you visit our website and tell you about your privacy rights and 
          how the law protects you.
        </p>
        
        <h2>2. Data We Collect</h2>
        <p>
          We may collect, use, store and transfer different kinds of personal data about you which we 
          have grouped together as follows:
        </p>
        <ul>
          <li><strong>Identity Data</strong> includes first name, last name, username or similar identifier.</li>
          <li><strong>Contact Data</strong> includes email address and telephone numbers.</li>
          <li><strong>Technical Data</strong> includes internet protocol (IP) address, browser type and version, 
          time zone setting and location, browser plug-in types and versions, operating system and platform.</li>
          <li><strong>Profile Data</strong> includes your username and password, language preferences, learning progress.</li>
          <li><strong>Usage Data</strong> includes information about how you use our website and services.</li>
        </ul>
        
        <h2>3. How We Use Your Data</h2>
        <p>We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:</p>
        <ul>
          <li>To register you as a new user</li>
          <li>To provide and improve our services</li>
          <li>To manage our relationship with you</li>
          <li>To personalize your experience</li>
          <li>For analytics to improve our website and services</li>
        </ul>
        
        <h2>4. Cookies</h2>
        <p>
          We use cookies and similar tracking technologies to track activity on our website and store 
          certain information. You can instruct your browser to refuse all cookies or to indicate when 
          a cookie is being sent.
        </p>
        
        <h2>5. Third-Party Services</h2>
        <p>
          We use third-party services such as Google Analytics and Google AdSense that collect, monitor, 
          and analyze data to improve our service's performance and to display ads.
        </p>
        
        <h2>6. Data Security</h2>
        <p>
          We have implemented appropriate security measures to prevent your personal data from being 
          accidentally lost, used, or accessed in an unauthorized way.
        </p>
        
        <h2>7. Your Legal Rights</h2>
        <p>
          Under certain circumstances, you have rights under data protection laws in relation to your personal data, 
          including the right to access, correct, erase, restrict, transfer, or object to processing of your personal data.
        </p>
        
        <h2>8. Contact Us</h2>
        <p>
          If you have any questions about this privacy policy or our privacy practices, please contact us at: 
          <a href="mailto:privacy@lingualink.app" className="text-primary ml-1">privacy@lingualink.app</a>
        </p>
      </div>
    </div>
  );
};

const TermsOfService = () => {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link to="/" className="flex items-center text-muted-foreground hover:text-primary mb-6">
        <ChevronLeft className="h-4 w-4 mr-1" />
        Back to home
      </Link>
      
      <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
      
      <div className="prose prose-slate max-w-none">
        <p>Last updated: {new Date().toLocaleDateString()}</p>
        
        <h2>1. Agreement to Terms</h2>
        <p>
          By accessing or using the LinguaLink website, you agree to be bound by these Terms of Service. 
          If you do not agree to these Terms, you should not use our services.
        </p>
        
        <h2>2. User Accounts</h2>
        <p>
          When you create an account with us, you must provide accurate, complete, and current information. 
          You are responsible for safeguarding your password and for all activities that occur under your account.
        </p>
        
        <h2>3. User Content</h2>
        <p>
          You retain ownership of any content you submit, post, or display on or through the service. By submitting, 
          posting, or displaying content, you grant us a non-exclusive, royalty-free license to use, modify, publicly 
          perform, publicly display, reproduce, and distribute such content on and through the service.
        </p>
        
        <h2>4. Prohibited Uses</h2>
        <p>You agree not to use the service:</p>
        <ul>
          <li>In any way that violates any applicable law or regulation</li>
          <li>To impersonate or attempt to impersonate another person or entity</li>
          <li>To engage in any harassing, abusive, or harmful behavior toward other users</li>
          <li>To attempt to access any portion of the service that you are not authorized to access</li>
          <li>To interfere with or disrupt the service or servers or networks connected to the service</li>
        </ul>
        
        <h2>5. Intellectual Property Rights</h2>
        <p>
          The service and its original content, features, and functionality are and will remain the exclusive 
          property of LinguaLink and its licensors. The service is protected by copyright, trademark, and other 
          laws of both the United States and foreign countries.
        </p>
        
        <h2>6. Termination</h2>
        <p>
          We may terminate or suspend your account immediately, without prior notice or liability, for any reason 
          whatsoever, including without limitation if you breach the Terms.
        </p>
        
        <h2>7. Limitation of Liability</h2>
        <p>
          In no event shall LinguaLink, nor its directors, employees, partners, agents, suppliers, or affiliates, 
          be liable for any indirect, incidental, special, consequential or punitive damages, including without 
          limitation, loss of profits, data, use, goodwill, or other intangible losses.
        </p>
        
        <h2>8. Changes to Terms</h2>
        <p>
          We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision 
          is material, we will try to provide at least 30 days' notice prior to any new terms taking effect.
        </p>
        
        <h2>9. Contact Us</h2>
        <p>
          If you have any questions about these Terms, please contact us at: 
          <a href="mailto:terms@lingualink.app" className="text-primary ml-1">terms@lingualink.app</a>
        </p>
      </div>
    </div>
  );
};

// Main Legal component that handles routing between privacy and terms
const Legal = () => {
  const { page } = useParams<{ page?: string }>();
  
  return page === 'terms' ? <TermsOfService /> : <PrivacyPolicy />;
};

export default Legal;
