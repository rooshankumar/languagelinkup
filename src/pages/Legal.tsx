
import React from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ChevronLeft } from "lucide-react";

const Legal = () => {
  const { page } = useParams<{ page?: string }>();

  return page === "terms" ? <TermsOfService /> : <PrivacyPolicy />;
};

const TermsOfService = () => (
  <div className="max-w-3xl mx-auto px-4 py-8">
    <Helmet>
      <title>Terms of Service | LinguaLink</title>
      <meta name="description" content="Understand the terms and conditions for using LinguaLink." />
    </Helmet>

    <Link to="/" className="flex items-center text-muted-foreground hover:text-primary mb-6">
      <ChevronLeft className="h-4 w-4 mr-1" />
      Back to home
    </Link>

    <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
    <p className="text-sm text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>

    <div className="prose prose-slate max-w-none mt-4">
      <h2>1. Agreement to Terms</h2>
      <p>By using LinguaLink, you agree to these terms. If you do not agree, please do not use our service.</p>

      <h2>2. User Accounts</h2>
      <p>You are responsible for maintaining the security of your account and must provide accurate information.</p>

      <h2>3. Acceptable Use</h2>
      <ul>
        <li>Do not engage in harassment or impersonation.</li>
        <li>Do not attempt unauthorized access.</li>
        <li>Do not misuse our services.</li>
      </ul>

      <h2>4. Intellectual Property</h2>
      <p>All content on LinguaLink is owned by us and cannot be copied without permission.</p>

      <h2>5. Termination</h2>
      <p>We reserve the right to suspend or terminate accounts violating these terms.</p>
    </div>
  </div>
);

const PrivacyPolicy = () => (
  <div className="max-w-3xl mx-auto px-4 py-8">
    <Helmet>
      <title>Privacy Policy | LinguaLink</title>
      <meta name="description" content="Learn how LinguaLink protects your data and privacy." />
    </Helmet>

    <Link to="/" className="flex items-center text-muted-foreground hover:text-primary mb-6">
      <ChevronLeft className="h-4 w-4 mr-1" />
      Back to home
    </Link>

    <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
    <p className="text-sm text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>

    <div className="prose prose-slate max-w-none mt-4">
      <h2>1. Introduction</h2>
      <p>
        Welcome to <strong>LinguaLink</strong>. Your privacy is important to us. This policy explains how we collect, use, and protect your personal information.
      </p>

      <h2>2. Information We Collect</h2>
      <ul>
        <li><strong>Identity Data:</strong> Name, username, and profile picture.</li>
        <li><strong>Contact Data:</strong> Email and phone number.</li>
        <li><strong>Usage Data:</strong> Website interactions and learning progress.</li>
      </ul>

      <h2>3. How We Use Your Data</h2>
      <ul>
        <li>To create and manage your account.</li>
        <li>To provide personalized learning experiences.</li>
        <li>For analytics and service improvements.</li>
      </ul>

      <h2>4. Data Security</h2>
      <p>We take security seriously and implement strong measures to protect your personal data.</p>

      <h2>5. Your Rights</h2>
      <p>You can request to view, modify, or delete your data at any time.</p>

      <h2>6. Contact Us</h2>
      <p>For privacy-related concerns, email us at <a href="mailto:privacy@lingualink.app" className="text-primary">privacy@lingualink.app</a>.</p>
    </div>
  </div>
);

export default Legal;
