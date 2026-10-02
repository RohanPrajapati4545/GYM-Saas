const LandingPage = require("../models/LandingPage");
const Plan = require("../models/Plan");

const getLandingCMS = async (req, res) => {
  try {
    let cms = await LandingPage.findOne().populate("pricing.planId");

    if (!cms) {
      const activePlans = await Plan.find({ isActive: true }).limit(3);
      cms = new LandingPage({
        hero: {
          badge: "NEXT-GEN GYM SAAS ARCHITECTURE",
          title: "BE STRONG",
          subtitle: "Best GYM & Fitness Center Build Your Health. Next-gen multi-branch management platform.",
          primaryButtonText: "JOIN US NOW",
          primaryButtonLink: "/register",
          secondaryButtonText: "WATCH VIDEO",
          secondaryButtonLink: "#video",
          heroImage: "/hero-athlete.png",
        },
        features: [
          {
            title: "Multi-Branch Facilities",
            description: "Manage unlimited gym branches under one master franchise roof. Track capacity, room equipment, and manager rosters.",
            icon: "Building2",
            isActive: true,
          },
          {
            title: "Athletic Memberships",
            description: "Offer customized pass tiers, automated recurring subscription billings, day passes, and personal trainer add-ons.",
            icon: "Flame",
            isActive: true,
          },
          {
            title: "RFID & Biometric Gates",
            description: "Sub-second gate turnstile verification, IoT attendance telemetry, and live facility headcounts in real-time.",
            icon: "Activity",
            isActive: true,
          },
          {
            title: "Role-Based Security",
            description: "Dedicated GYM_OWNER administration with microservices JWT isolation ensuring ironclad tenant data security.",
            icon: "Shield",
            isActive: true,
          },
        ],
        stats: [
          { label: "Active Gyms", value: "250+", isActive: true },
          { label: "Registered Members", value: "48,000+", isActive: true },
          { label: "Daily Check-ins", value: "12,500+", isActive: true },
          { label: "Uptime SLA", value: "99.98%", isActive: true },
        ],
        testimonials: [
          {
            name: "Vikram Malhotra",
            role: "Franchise Owner",
            company: "Titan Fitness Group",
            message: "Gym SaaS streamlined our 4 branches completely. Real-time telemetry and revenue reporting are game-changers!",
            avatar: "",
            isActive: true,
          },
          {
            name: "Sarah Jenkins",
            role: "Operations Director",
            company: "Apex Athletics",
            message: "The easiest platform to manage coaches, member RFID turnstiles, and automated Stripe renewals.",
            avatar: "",
            isActive: true,
          },
        ],
        pricing: activePlans.map((p, idx) => ({
          planId: p._id,
          isFeatured: idx === 1,
          displayOrder: idx,
        })),
        faq: [
          {
            question: "How does multi-tenant branch management work?",
            answer: "Each gym owner receives a secure tenant partition. You can add branches, appoint branch managers, and oversee global finances.",
            isActive: true,
          },
          {
            question: "Can I connect my biometric gate scanners?",
            answer: "Yes, our IoT attendance engine integrates with standard RFID and biometric turnstile devices via Webhooks and REST APIs.",
            isActive: true,
          },
          {
            question: "Can I upgrade or downgrade plans anytime?",
            answer: "Yes, subscription plans scale dynamically with prorated invoicing.",
            isActive: true,
          },
        ],
        cta: {
          title: "READY TO SCALE YOUR FITNESS EMPIRE?",
          description: "Join thousands of Gym Owners and multi-branch franchises managing operations effortlessly.",
          buttonText: "START FREE TRIAL",
          buttonLink: "/register",
        },
      });
      await cms.save();
      cms = await LandingPage.findById(cms._id).populate("pricing.planId");
    }

    return res.status(200).json({ success: true, data: cms });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch landing CMS content" });
  }
};

const updateLandingCMS = async (req, res) => {
  try {
    let cms = await LandingPage.findOne();

    if (!cms) {
      cms = new LandingPage(req.body);
    } else {
      Object.assign(cms, req.body);
    }

    await cms.save();
    const populated = await LandingPage.findById(cms._id).populate("pricing.planId");

    return res.status(200).json({
      success: true,
      message: "Landing page CMS updated successfully",
      data: populated,
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update landing page CMS" });
  }
};

module.exports = {
  getLandingCMS,
  updateLandingCMS,
};
