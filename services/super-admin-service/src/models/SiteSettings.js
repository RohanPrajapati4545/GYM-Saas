const mongoose = require("mongoose");

const siteSettingsSchema = new mongoose.Schema(
  {
    siteName: {
      type: String,
      default: "Ro-Fitness",
    },
    logo: {
      type: String,
      default: "/ro-logo.svg",
    },
    favicon: {
      type: String,
      default: "/ro-logo.svg",
    },
    primaryColor: {
      type: String,
      default: "#ff2a2a",
    },
    secondaryColor: {
      type: String,
      default: "#10141d",
    },
    accentColor: {
      type: String,
      default: "#ff5e14",
    },
    supportEmail: {
      type: String,
      default: "support@xtremefitness.com",
    },
    supportPhone: {
      type: String,
      default: "+91 98765 43210",
    },
    address: {
      type: String,
      default: "Silicon Valley Tech Park, Bangalore, India",
    },
    facebook: {
      type: String,
      default: "https://facebook.com",
    },
    instagram: {
      type: String,
      default: "https://instagram.com",
    },
    linkedin: {
      type: String,
      default: "https://linkedin.com",
    },
    youtube: {
      type: String,
      default: "https://youtube.com",
    },
    twitter: {
      type: String,
      default: "https://twitter.com",
    },
    footerText: {
      type: String,
      default: "© 2026 XTREME FITNESS SaaS Platform. All Rights Reserved.",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("SiteSettings", siteSettingsSchema);
