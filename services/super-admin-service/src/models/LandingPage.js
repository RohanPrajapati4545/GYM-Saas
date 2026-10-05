const mongoose = require("mongoose");

const landingPageSchema = new mongoose.Schema(
  {
    hero: {
      badge: { type: String, default: "ALL-IN-ONE GYM MANAGEMENT SAAS" },
      title: { type: String, default: "One Powerful Dashboard." },
      subtitle: { type: String, default: "Stop juggling spreadsheets, WhatsApp messages, and multiple tools. GymSaaS brings your entire gym operation together in one simple platform." },
      primaryButtonText: { type: String, default: "Book Free Live Demo" },
      primaryButtonLink: { type: String, default: "#contact" },
      secondaryButtonText: { type: String, default: "Explore Platform" },
      secondaryButtonLink: { type: String, default: "#features" },
      heroImage: { type: String, default: "/slide-1.jpg" },
    },
    features: [
      {
        title: { type: String, required: true },
        description: { type: String, required: true },
        icon: { type: String, default: "Building2" },
        isActive: { type: Boolean, default: true },
      },
    ],
    stats: [
      {
        label: { type: String, required: true },
        value: { type: String, required: true },
        isActive: { type: Boolean, default: true },
      },
    ],
    testimonials: [
      {
        name: { type: String, required: true },
        role: { type: String, default: "Gym Owner" },
        company: { type: String, default: "Xtreme Fitness Franchise" },
        message: { type: String, required: true },
        avatar: { type: String, default: "" },
        isActive: { type: Boolean, default: true },
      },
    ],
    pricing: [
      {
        planId: { type: mongoose.Schema.Types.ObjectId, ref: "Plan" },
        isFeatured: { type: Boolean, default: false },
        displayOrder: { type: Number, default: 0 },
      },
    ],
    faq: [
      {
        question: { type: String, required: true },
        answer: { type: String, required: true },
        isActive: { type: Boolean, default: true },
      },
    ],
    cta: {
      title: { type: String, default: "READY TO SCALE YOUR FITNESS EMPIRE?" },
      description: { type: String, default: "Join thousands of Gym Owners and multi-branch franchises managing operations effortlessly." },
      buttonText: { type: String, default: "START FREE TRIAL" },
      buttonLink: { type: String, default: "/register" },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("LandingPage", landingPageSchema);
