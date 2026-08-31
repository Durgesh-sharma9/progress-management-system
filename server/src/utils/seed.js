const User = require('../models/User');
const Project = require('../models/Project');
const Phase = require('../models/Phase');

const seedDatabase = async () => {
  try {
    // Clear existing collections
    await User.deleteMany({});
    await Project.deleteMany({});
    await Phase.deleteMany({});

    console.log('🌱 Cleared existing database records.');

    // 1. Create Users
    const admin = await User.create({
      name: 'Alex Vance (Lead Admin)',
      email: 'admin@devtrack.io',
      password: 'Admin@123',
      role: 'admin',
    });

    const rahul = await User.create({
      name: 'Rahul Sharma',
      email: 'rahul@devtrack.io',
      password: 'Dev@123',
      role: 'developer',
    });

    const sarah = await User.create({
      name: 'Sarah Jenkins',
      email: 'sarah@devtrack.io',
      password: 'Dev@123',
      role: 'developer',
    });

    const marcus = await User.create({
      name: 'Marcus Chen',
      email: 'marcus@devtrack.io',
      password: 'Dev@123',
      role: 'developer',
    });

    console.log('👤 Created Demo Users');

    // 2. Create Projects
    const project1 = await Project.create({
      name: 'School ERP & Student Management Portal',
      description: 'Comprehensive cloud-based enterprise resource planning application for automated attendance, fee processing, and grading.',
      status: 'In Progress',
      createdBy: admin._id,
      developers: [rahul._id, sarah._id, marcus._id],
    });

    const project2 = await Project.create({
      name: 'FinTech Mobile Banking API',
      description: 'High-security microservices for money transfers, KYC verification, and instant transaction ledger.',
      status: 'In Progress',
      createdBy: admin._id,
      developers: [rahul._id, sarah._id],
    });

    const project3 = await Project.create({
      name: 'Healthcare Telemedicine App',
      description: 'Video consultation platform connecting board-certified physicians with patients, electronic prescriptions, and appointment scheduling.',
      status: 'Planning',
      createdBy: admin._id,
      developers: [marcus._id],
    });

    console.log('📁 Created Demo Projects');

    // 3. Create Phases (Checklist Tasks) for Project 1
    // Rahul's Phases
    await Phase.create([
      {
        title: 'Phase 1: Setup JWT Authentication & Password Encryption',
        description: 'Implement token generation and bcrypt password hashing with robust payload validation.',
        projectId: project1._id,
        developerId: rahul._id,
        completed: true,
        completedAt: new Date(),
      },
      {
        title: 'Phase 2: Build Role-Based Authorization Guard (Admin vs Developer)',
        description: 'Create middleware to restrict routes based on verified roles.',
        projectId: project1._id,
        developerId: rahul._id,
        completed: true,
        completedAt: new Date(),
      },
      {
        title: 'Phase 3: Design Multi-Step Student Admission Wizard',
        description: 'Interactive wizard UI for collecting personal, guardian, and academic history.',
        projectId: project1._id,
        developerId: rahul._id,
        completed: false,
      },
      {
        title: 'Phase 4: Document Upload & Cloud Storage Integration',
        description: 'Secure file upload for birth certificates and prior academic records.',
        projectId: project1._id,
        developerId: rahul._id,
        completed: false,
      },
    ]);

    // Sarah's Phases
    await Phase.create([
      {
        title: 'Phase 1: Setup Stripe & Razorpay Webhook Ingestion',
        description: 'Process incoming payment confirmations asynchronously.',
        projectId: project1._id,
        developerId: sarah._id,
        completed: true,
        completedAt: new Date(),
      },
      {
        title: 'Phase 2: Generate PDF Fee Receipts Dynamically',
        description: 'Create printable invoices with school seal and tax itemization.',
        projectId: project1._id,
        developerId: sarah._id,
        completed: true,
        completedAt: new Date(),
      },
      {
        title: 'Phase 3: Automate Late Fee Penalty Calculator Job',
        description: 'Cron trigger to apply configurable penalty percentage on overdue balances.',
        projectId: project1._id,
        developerId: sarah._id,
        completed: false,
      },
    ]);

    // Marcus's Phases
    await Phase.create([
      {
        title: 'Phase 1: RFID & QR Scanner Ingestion Webhook',
        description: 'Handle rapid check-in events from hardware terminals at school gates.',
        projectId: project1._id,
        developerId: marcus._id,
        completed: true,
        completedAt: new Date(),
      },
      {
        title: 'Phase 2: Real-Time WhatsApp & SMS Parent Alerts',
        description: 'Notify parents at 09:30 AM if student is marked absent.',
        projectId: project1._id,
        developerId: marcus._id,
        completed: false,
      },
    ]);

    // 4. Create Phases for Project 2 (FinTech API)
    await Phase.create([
      {
        title: 'Phase 1: KYC Government ID Verification API',
        description: 'Verify identity documents with real-time biometric face match.',
        projectId: project2._id,
        developerId: rahul._id,
        completed: true,
        completedAt: new Date(),
      },
      {
        title: 'Phase 2: Automated AML & Sanctions List Screening',
        description: 'Cross-check prospective accounts against global financial watchlists.',
        projectId: project2._id,
        developerId: rahul._id,
        completed: true,
        completedAt: new Date(),
      },
      {
        title: 'Phase 3: Ledger Double-Entry Transaction Engine',
        description: 'Immutable ACID transaction ledger for account balances.',
        projectId: project2._id,
        developerId: rahul._id,
        completed: false,
      },
      {
        title: 'Phase 1: Payment Gateway Webhook & Reversal Processor',
        description: 'Instant settlement and reconciliation engine for bank transfers.',
        projectId: project2._id,
        developerId: sarah._id,
        completed: true,
        completedAt: new Date(),
      },
      {
        title: 'Phase 2: Fraud Detection Rule Engine & Rate Limiter',
        description: 'High-frequency transaction anomalies and device fingerprinting.',
        projectId: project2._id,
        developerId: sarah._id,
        completed: false,
      },
    ]);

    // 5. Create Phases for Project 3
    await Phase.create([
      {
        title: 'Phase 1: WebRTC Encrypted Video Calling Architecture',
        description: 'HIPAA-compliant peer-to-peer telehealth sessions.',
        projectId: project3._id,
        developerId: marcus._id,
        completed: false,
      },
      {
        title: 'Phase 2: Electronic Prescription & Pharmacy Routing',
        description: 'Digital doctor sign-off and dispatch to nearby pharmacies.',
        projectId: project3._id,
        developerId: marcus._id,
        completed: false,
      },
    ]);

    console.log('✨ Seeded Project Phases with initial progress metrics!');
    console.log('----------------------------------------------------');
    console.log('🔑 DEMO CREDENTIALS:');
    console.log('   Admin:     admin@devtrack.io  /  Admin@123');
    console.log('   Developer: rahul@devtrack.io  /  Dev@123');
    console.log('   Developer: sarah@devtrack.io  /  Dev@123');
    console.log('   Developer: marcus@devtrack.io /  Dev@123');
    console.log('----------------------------------------------------');
  } catch (error) {
    console.error('❌ Error while seeding database:', error);
  }
};

module.exports = seedDatabase;
