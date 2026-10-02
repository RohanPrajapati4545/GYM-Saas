require('dotenv').config();
const mongoose = require('mongoose');

const updateBrand = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://admin:admin@localhost:27018/gym_super_admin_db?authSource=admin';
    await mongoose.connect(mongoUri);
    console.log('Connected to Super Admin DB...');

    const SiteSettings = mongoose.model('SiteSettings', new mongoose.Schema({}, { strict: false }));
    const LandingPage = mongoose.model('LandingPage', new mongoose.Schema({}, { strict: false }));

    await SiteSettings.updateMany({}, {
      $set: {
        siteName: 'Ro-Fitness',
        logo: '/ro-logo.svg',
        favicon: '/ro-logo.svg',
        footerText: '© 2026 Ro-Fitness SaaS Platform. All Rights Reserved.'
      }
    });

    await LandingPage.updateMany({}, {
      $set: {
        'hero.badge': 'RO-FITNESS PLATFORM',
        'hero.heroImage': '/hero-athlete.jpg'
      }
    });

    console.log('Branding updated to Ro-Fitness in DB successfully!');
    process.exit(0);
  } catch (e) {
    console.error('Migration note:', e.message);
    process.exit(0);
  }
};

updateBrand();
