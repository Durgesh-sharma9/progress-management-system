const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const Project = require('../models/Project');

const targetTechStack = [
  'React',
  'MongoDB',
  'TailwindCSS',
  'TypeScript',
  'Express.js',
  'Node.js',
];

const updateProjects = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error('MONGODB_URI is not set in .env');
      process.exit(1);
    }

    await mongoose.connect(mongoUri, {
      dbName: 'progress',
    });
    console.log('Connected to MongoDB.');

    // 1. Fix Transport App to Android App
    const transportApps = await Project.find({ name: { $regex: /transport/i } });
    for (const t of transportApps) {
      t.category = 'Android App';
      t.techStack = ['Kotlin', 'Firebase', 'Jetpack Compose', 'Retrofit'];
      await t.save();
      console.log(`📱 Restored Transport App to Android App: "${t.name}"`);
    }

    // 2. Ensure Inventory App is Android App
    const inventoryApps = await Project.find({ name: { $regex: /inventory/i } });
    for (const inv of inventoryApps) {
      inv.category = 'Android App';
      inv.techStack = ['Kotlin', 'Firebase', 'Jetpack Compose', 'SQLite'];
      await inv.save();
      console.log(`📱 Ensured Inventory App is Android App: "${inv.name}"`);
    }

    // 3. Update all others (excluding event sync, transport, inventory)
    const allProjects = await Project.find();
    let updatedCount = 0;

    for (const proj of allProjects) {
      const cleanName = (proj.name || '').toLowerCase().replace(/\s+/g, ' ').trim();
      const isExcluded = ['event sync', 'transport app', 'inventory app'].some((ex) =>
        cleanName.includes(ex)
      );

      if (isExcluded) {
        console.log(`⏩ Preserved excluded project: "${proj.name}" (Category: ${proj.category})`);
        continue;
      }

      proj.category = 'Web App';
      proj.techStack = targetTechStack;
      await proj.save();
      updatedCount++;
      console.log(`✅ Set Campus CRM stack for: "${proj.name}"`);
    }

    console.log(`\n🎉 Done! Updated ${updatedCount} projects with Campus CRM tech stack!`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Error updating projects:', err);
    process.exit(1);
  }
};

updateProjects();
