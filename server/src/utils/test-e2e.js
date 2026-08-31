const assert = require('assert');

const API_URL = 'http://localhost:5000/api';

const request = async (url, options = {}) => {
  const config = {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  };

  if (options.body) {
    config.body = JSON.stringify(options.body);
  }

  const res = await fetch(url, config);
  const data = await res.json();
  return { status: res.status, data };
};

const runE2ETests = async () => {
  console.log('🚀 Running DevTrack Direct Phase E2E Test Suite...\n');

  try {
    // 1. Health check
    const health = await request(`${API_URL}/health`);
    assert.strictEqual(health.status, 200);
    console.log('✅ [1/9] API Health Check Passed: OK');

    // 2. Admin Login
    const adminLogin = await request(`${API_URL}/auth/login`, {
      method: 'POST',
      body: { email: 'admin@devtrack.io', password: 'Admin@123' },
    });
    assert.strictEqual(adminLogin.status, 200);
    const adminToken = adminLogin.data.token;
    console.log(`✅ [2/9] Admin Login Successful. Token received for: ${adminLogin.data.user.name}`);

    // 3. Admin Dashboard Stats
    const adminStats = await request(`${API_URL}/projects/admin/dashboard-stats`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(adminStats.status, 200);
    console.log(`✅ [3/9] Admin Dashboard Stats Received: { totalProjects: ${adminStats.data.data.totalProjects}, totalDevelopers: ${adminStats.data.data.totalDevelopers} }`);

    // 4. Get Developers List
    const devList = await request(`${API_URL}/users/developers`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(devList.status, 200);
    const rahul = devList.data.data.find((d) => d.email === 'rahul@devtrack.io');
    const sarah = devList.data.data.find((d) => d.email === 'sarah@devtrack.io');
    const marcus = devList.data.data.find((d) => d.email === 'marcus@devtrack.io');
    console.log(`✅ [4/9] Found Developers: Rahul (${rahul._id}), Sarah (${sarah._id}), Marcus (${marcus._id})`);

    // 5. Admin Creates Project (Assigned ONLY to Rahul and Sarah, NOT Marcus)
    const newProject = await request(`${API_URL}/projects`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: {
        name: 'AI Customer Support Bot',
        description: 'Next-generation LLM conversational assistant with multi-turn memory.',
        status: 'In Progress',
        developers: [rahul._id, sarah._id],
      },
    });
    assert.strictEqual(newProject.status, 201);
    const projectId = newProject.data.data._id;
    console.log(`✅ [5/9] Admin Created Project: ${newProject.data.data.name} (ID: ${projectId})`);

    // 6. Developer (Rahul) Login
    const rahulLogin = await request(`${API_URL}/auth/login`, {
      method: 'POST',
      body: { email: 'rahul@devtrack.io', password: 'Dev@123' },
    });
    assert.strictEqual(rahulLogin.status, 200);
    const rahulToken = rahulLogin.data.token;
    console.log('✅ [6/9] Developer (Rahul) Login Successful.');

    // 7. Developer (Rahul) Creates Direct Phases (Milestones)
    const phase1 = await request(`${API_URL}/phases`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${rahulToken}` },
      body: {
        title: 'Phase 1: Setup LLM Prompt Templates & Embeddings Pipeline',
        description: 'Configure OpenAI API with Vector DB ingestion.',
        projectId,
      },
    });
    assert.strictEqual(phase1.status, 201);

    const phase2 = await request(`${API_URL}/phases`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${rahulToken}` },
      body: {
        title: 'Phase 2: Build Real-time Chat Streaming UI',
        description: 'EventSource / SSE integration for token streaming.',
        projectId,
      },
    });
    assert.strictEqual(phase2.status, 201);
    console.log('✅ [7/9] Developer Rahul Created 2 Direct Phases in Project.');

    // 8. Test Checkbox Toggles & Live Sync by Teammate (Sarah)
    console.log('\n--- Automatic Progress Recalculation & Teammate Sync Verification ---');

    // Rahul toggles Phase 1
    const toggle1 = await request(`${API_URL}/phases/${phase1.data.data._id}/toggle`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${rahulToken}` },
    });
    assert.strictEqual(toggle1.status, 200);
    assert.strictEqual(toggle1.data.data.completed, true);
    console.log(`👉 Rahul Toggled Phase 1 Completed: Project Progress: ${toggle1.data.metrics.project.progress}%`);

    // Teammate Sarah (assigned to project) toggles Phase 2
    const sarahLogin = await request(`${API_URL}/auth/login`, {
      method: 'POST',
      body: { email: 'sarah@devtrack.io', password: 'Dev@123' },
    });
    assert.strictEqual(sarahLogin.status, 200);
    const sarahToken = sarahLogin.data.token;

    const sarahToggle = await request(`${API_URL}/phases/${phase2.data.data._id}/toggle`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${sarahToken}` },
    });
    assert.strictEqual(sarahToggle.status, 200);
    assert.strictEqual(sarahToggle.data.data.completed, true);
    assert.strictEqual(sarahToggle.data.metrics.project.progress, 100);
    console.log(`👉 Teammate Sarah Toggled Phase 2 Completed: Project Progress: 100% (2/2)`);
    console.log('✅ [8/9] Multi-Developer Cooperative Checkbox Toggles & Live Sync 100% Validated!');

    // 9. Security: Unassigned Developer (Marcus) is blocked (403 Forbidden)
    const marcusLogin = await request(`${API_URL}/auth/login`, {
      method: 'POST',
      body: { email: 'marcus@devtrack.io', password: 'Dev@123' },
    });
    const marcusToken = marcusLogin.data.token;

    const forbiddenToggle = await request(`${API_URL}/phases/${phase1.data.data._id}/toggle`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${marcusToken}` },
    });
    assert.strictEqual(forbiddenToggle.status, 403);
    console.log('✅ [9/9] Security Verified: Unassigned Developer Marcus was blocked (403) from modifying project phases.');

    console.log('\n======================================================');
    console.log('🎉 ALL 9 DIRECT PHASE VERIFICATION SUITES PASSED!');
    console.log('======================================================\n');
  } catch (err) {
    console.error('❌ E2E Test Failure:', err);
    process.exit(1);
  }
};

runE2ETests();
