require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const SuperAdmin = require("../models/SuperAdmin");
const Plan = require("../models/Plan");
const SiteSettings = require("../models/SiteSettings");
const LandingPage = require("../models/LandingPage");

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || "mongodb://admin:admin@localhost:27018/gym_super_admin_db?authSource=admin";
    await mongoose.connect(mongoUri);
    console.log("Connected to Super Admin MongoDB for seeding...");

    const adminEmail = (process.env.SUPER_ADMIN_EMAIL || "admin@gymsaas.com").trim().toLowerCase();
    const adminPassword = process.env.SUPER_ADMIN_PASSWORD || "SuperAdmin@123";
    const adminName = process.env.SUPER_ADMIN_NAME || "Master Super Admin";

    const existingAdmin = await SuperAdmin.findOne({ email: adminEmail });
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      const newAdmin = new SuperAdmin({
        name: adminName,
        email: adminEmail,
        password: hashedPassword,
        isActive: true,
      });
      await newAdmin.save();
      console.log(`Super Admin created successfully: ${adminEmail}`);
    } else {
      console.log(`Super Admin already exists: ${adminEmail}`);
    }

    const plansCount = await Plan.countDocuments();
    let seededPlans = [];
    if (plansCount === 0) {
      seededPlans = await Plan.insertMany([
        {
          name: "Single Gym Starter",
          description: "Essential tools for single location fitness studios and independent gym owners.",
          price: 49,
          billingCycle: "MONTHLY",
          duration: 1,
          features: [
            "1 Gym Branch",
            "Up to 300 Members",
            "RFID Access Control",
            "Automated Invoicing",
            "Basic Reporting",
          ],
          maxBranches: 1,
          maxMembers: 300,
          isActive: true,
        },
        {
          name: "Franchise Growth Pro",
          description: "Full multi-branch control with trainer management, mobile check-ins, and lead CRM.",
          price: 129,
          billingCycle: "MONTHLY",
          duration: 1,
          features: [
            "Up to 5 Gym Branches",
            "Unlimited Members",
            "Multi-Branch Roaming",
            "Trainer Roster & Commissions",
            "Lead Pipeline & CRM",
            "Turnstile IoT Telemetry",
            "Priority Support",
          ],
          maxBranches: 5,
          maxMembers: 5000,
          isActive: true,
        },
        {
          name: "Enterprise Multi-Chain",
          description: "Unlimited scale for nationwide gym franchises with custom branding and dedicated SLA.",
          price: 299,
          billingCycle: "MONTHLY",
          duration: 1,
          features: [
            "Unlimited Branches",
            "Unlimited Members",
            "Custom Domain & White Label",
            "Dedicated Account Manager",
            "Custom Gate Firmware API",
            "99.99% Uptime SLA",
            "24/7 Phone & Slack Support",
          ],
          maxBranches: 100,
          maxMembers: 50000,
          isActive: true,
        },
      ]);
      console.log("Default subscription plans seeded.");
    }

    const settingsCount = await SiteSettings.countDocuments();
    if (settingsCount === 0) {
      await SiteSettings.create({
        siteName: "RK PRAJAPATI",
        logo: "/rk-prajapati-logo.jpg",
        favicon: "/rk-prajapati-logo.jpg",
        primaryColor: "#ff2a2a",
        secondaryColor: "#10141d",
        accentColor: "#ff5e14",
        supportEmail: "support@rkprajapati.com",
        supportPhone: "+91 98765 43210",
        address: "Silicon Valley Tech Park, Bangalore, India",
        facebook: "https://facebook.com",
        instagram: "https://instagram.com",
        linkedin: "https://linkedin.com",
        youtube: "https://youtube.com",
        twitter: "https://twitter.com",
        footerText: "© 2026 RK PRAJAPATI Fitness SaaS Platform. All Rights Reserved.",
      });
      console.log("Default site settings seeded.");
    }

    const cmsCount = await LandingPage.countDocuments();
    if (cmsCount === 0) {
      const activePlans = seededPlans.length ? seededPlans : await Plan.find({ isActive: true }).limit(3);
      await LandingPage.create({
        hero: {
          badge: "RK PRAJAPATI FITNESS PLATFORM",
          title: "BE STRONG",
          subtitle: "Best GYM & Fitness Center Build Your Health. Next-gen multi-branch management platform.",
          primaryButtonText: "JOIN US NOW",
          primaryButtonLink: "/register",
          secondaryButtonText: "WATCH VIDEO",
          secondaryButtonLink: "#video",
          heroImage: "/hero-athlete.jpg",
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
      console.log("Default Landing CMS seeded.");
    }

    console.log("Seeding process finished successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Seeding error:", error);
    process.exit(1);
  }
};

seedDatabase();
