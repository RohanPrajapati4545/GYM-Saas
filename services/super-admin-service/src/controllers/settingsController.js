const SiteSettings = require("../models/SiteSettings");

const getSettings = async (req, res) => {
  try {
    let settings = await SiteSettings.findOne();

    if (!settings) {
      settings = new SiteSettings({
        siteName: "Ro-Fitness",
        logo: "/ro-logo.svg",
        favicon: "/ro-logo.svg",
        primaryColor: "#ff2a2a",
        secondaryColor: "#10141d",
        accentColor: "#ff5e14",
        supportEmail: "support@xtremefitness.com",
        supportPhone: "+91 98765 43210",
        address: "Silicon Valley Tech Park, Bangalore, India",
        facebook: "https://facebook.com",
        instagram: "https://instagram.com",
        linkedin: "https://linkedin.com",
        youtube: "https://youtube.com",
        twitter: "https://twitter.com",
        footerText: "© 2026 XTREME FITNESS SaaS Platform. All Rights Reserved.",
      });
      await settings.save();
    }

    return res.status(200).json({ success: true, data: settings });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch site settings" });
  }
};

const updateSettings = async (req, res) => {
  try {
    let settings = await SiteSettings.findOne();

    if (!settings) {
      settings = new SiteSettings(req.body);
    } else {
      Object.assign(settings, req.body);
    }

    await settings.save();

    return res.status(200).json({
      success: true,
      message: "Site settings saved successfully",
      data: settings,
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update site settings" });
  }
};

module.exports = {
  getSettings,
  updateSettings,
};
