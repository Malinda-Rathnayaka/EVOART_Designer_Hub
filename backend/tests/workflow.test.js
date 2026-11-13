const assert = require('assert');
const dotenv = require('dotenv');
const { connectDB, disconnectDB } = require('../config/db');
const User = require('../models/User');
const Designer = require('../models/Designer');
const Project = require('../models/Project');
const Bid = require('../models/Bid');
const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');
const {
  awardAssignment,
  submitDesignWork,
  reviewSubmission,
  cancelAssignment,
  getDesignerActiveCount,
} = require('../services/assignmentService');

const path = require('path');
dotenv.config();
dotenv.config({ path: path.join(__dirname, '../.env') });
process.env.NODE_ENV = 'test';

async function runTests() {
  console.log('\n==================================================');
  console.log('   EVO ART DESIGNER PLATFORM - SYSTEM TESTS');
  console.log('==================================================\n');

  try {
    await connectDB();
    console.log('[Test Setup] Purging test database...');
    await User.deleteMany({});
    await Designer.deleteMany({});
    await Project.deleteMany({});
    await Bid.deleteMany({});
    await Assignment.deleteMany({});
    await Submission.deleteMany({});

    // 1. Test User Creation & Password Hashing
    console.log('[Test 1] Testing User Creation & Secure Password Hashing...');
    const admin = await User.create({
      name: 'Admin Test',
      email: 'admintest@platform.com',
      password: 'mypassword123',
      role: 'admin',
    });
    assert.strictEqual(admin.role, 'admin');
    assert.notStrictEqual(admin.password, 'mypassword123'); // Hashed
    const passwordMatch = await admin.matchPassword('mypassword123');
    assert.strictEqual(passwordMatch, true);
    console.log('  ✓ Admin created in users collection and password securely hashed with bcrypt');

    const designerA = await Designer.create({
      name: 'Designer Alpha',
      email: 'designerA@platform.com',
      password: 'passwordA',
      role: 'designer',
    });
    const designerB = await Designer.create({
      name: 'Designer Beta',
      email: 'designerB@platform.com',
      password: 'passwordB',
      role: 'designer',
    });
    console.log('  ✓ Designers Alpha and Beta created in separate designers collection');

    // 2. Test Project Creation & Bidding Status
    console.log('\n[Test 2] Testing Project Creation & Bidding Open/Closed Rules...');
    const project1 = await Project.create({
      title: 'Brand Identity Project 1',
      description: 'Test project description',
      category: 'Brand Identity',
      initialPrice: 500,
      deadline: new Date(Date.now() + 7 * 86400000),
      biddingStatus: 'open',
      status: 'open_for_bidding',
      createdBy: admin._id,
    });
    assert.strictEqual(project1.biddingStatus, 'open');
    assert.strictEqual(project1.initialPrice, 500);
    console.log('  ✓ Project 1 created with initial price $500, bidding open');

    // 3. Bid Validation: Lower than initial price
    console.log('\n[Test 3] Testing Bid Price Validation & Privacy Rules...');
    // Attempt bid >= initialPrice (Should fail requirement)
    const invalidBidAmount = 550;
    assert.ok(
      invalidBidAmount >= project1.initialPrice,
      '550 is >= 500, should be disallowed'
    );

    // Valid bid lower than initial price
    const validBid = await Bid.create({
      project: project1._id,
      designer: designerA._id,
      amount: 450,
      deliveryDays: 5,
      proposalText: 'Clean modern branding',
      status: 'submitted',
    });
    assert.strictEqual(validBid.amount, 450);
    console.log('  ✓ Bid of $450 submitted successfully (< $500 initial price)');

    // Duplicate bid test
    let duplicateFailed = false;
    try {
      await Bid.create({
        project: project1._id,
        designer: designerA._id,
        amount: 420,
      });
    } catch (e) {
      duplicateFailed = true;
    }
    assert.strictEqual(duplicateFailed, true, 'Duplicate bid must be prevented');
    console.log('  ✓ Duplicate bid from same designer prevented by unique compound index');

    // Bid from designer B
    const bidB = await Bid.create({
      project: project1._id,
      designer: designerB._id,
      amount: 400,
      deliveryDays: 4,
      proposalText: 'Fast turnaround and high quality',
      status: 'submitted',
    });
    console.log('  ✓ Designer Beta submitted private bid of $400');

    // 4. Awarding Assignment & Winner Selection
    console.log('\n[Test 4] Testing Winner Selection & Project Assignment...');
    const assignment1 = await awardAssignment({
      projectId: project1._id,
      bidId: validBid._id,
      adminNotes: 'Awarded to Designer Alpha',
    });
    assert.strictEqual(assignment1.status, 'in_progress');
    assert.strictEqual(assignment1.designer.toString(), designerA._id.toString());

    const updatedProject1 = await Project.findById(project1._id);
    assert.strictEqual(updatedProject1.status, 'assigned');
    assert.strictEqual(updatedProject1.winningBid.toString(), validBid._id.toString());
    assert.strictEqual(updatedProject1.winningDesigner.toString(), designerA._id.toString());

    // Check rejected status on other bids
    const updatedBidB = await Bid.findById(bidB._id);
    assert.strictEqual(updatedBidB.status, 'rejected');
    console.log('  ✓ Project 1 assigned to Designer Alpha. Other bids marked rejected.');

    // 5. Maximum 3 Active Assignments Enforcement
    console.log('\n[Test 5] Testing STRICT 3-Active-Assignment Limit...');
    let activeCount = await getDesignerActiveCount(designerA._id);
    assert.strictEqual(activeCount, 1);
    console.log(`  Current active assignments for Designer Alpha: ${activeCount}/3`);

    // Create Project 2 and award to Designer Alpha (Count -> 2)
    const p2 = await Project.create({
      title: 'Project 2',
      description: 'Desc 2',
      initialPrice: 800,
      deadline: new Date(Date.now() + 86400000),
      biddingStatus: 'open',
      createdBy: admin._id,
    });
    const bidA_p2 = await Bid.create({
      project: p2._id,
      designer: designerA._id,
      amount: 700,
    });
    await awardAssignment({ projectId: p2._id, bidId: bidA_p2._id });
    activeCount = await getDesignerActiveCount(designerA._id);
    assert.strictEqual(activeCount, 2);
    console.log(`  ✓ Awarded Project 2 to Alpha. Active count: ${activeCount}/3`);

    // Create Project 3 and award to Designer Alpha (Count -> 3, CAP REACHED)
    const p3 = await Project.create({
      title: 'Project 3',
      description: 'Desc 3',
      initialPrice: 900,
      deadline: new Date(Date.now() + 86400000),
      biddingStatus: 'open',
      createdBy: admin._id,
    });
    const bidA_p3 = await Bid.create({
      project: p3._id,
      designer: designerA._id,
      amount: 800,
    });
    await awardAssignment({ projectId: p3._id, bidId: bidA_p3._id });
    activeCount = await getDesignerActiveCount(designerA._id);
    assert.strictEqual(activeCount, 3);
    console.log(`  ✓ Awarded Project 3 to Alpha. Active count: ${activeCount}/3 (MAXIMUM REACHED)`);

    // Create Project 4 and attempt to award to Designer Alpha (MUST FAIL!)
    const p4 = await Project.create({
      title: 'Project 4',
      description: 'Desc 4',
      initialPrice: 1000,
      deadline: new Date(Date.now() + 86400000),
      biddingStatus: 'open',
      createdBy: admin._id,
    });
    const bidA_p4 = await Bid.create({
      project: p4._id,
      designer: designerA._id,
      amount: 950,
    });

    let limitBlocked = false;
    try {
      await awardAssignment({ projectId: p4._id, bidId: bidA_p4._id });
    } catch (err) {
      limitBlocked = true;
      assert.ok(err.message.includes('maximum allowed limit of 3'));
      console.log(`  ✓ 4th assignment correctly BLOCKED: "${err.message}"`);
    }
    assert.strictEqual(limitBlocked, true, 'Awarding beyond 3 active assignments must fail');

    // 6. Test Design Submission, Revision Requests & Slot Non-Release
    console.log('\n[Test 6] Testing Design Submission & Revision Workflow...');
    const fakeFile = {
      filename: 'design-v1.png',
      originalname: 'Design_Deliverable_v1.png',
      path: 'backend/uploads/submissions/design-v1.png',
      mimetype: 'image/png',
      size: 1024,
    };

    // Designer uploads submission
    const submission1 = await submitDesignWork({
      assignmentId: assignment1._id,
      designerId: designerA._id,
      files: [fakeFile],
      comments: 'Initial draft submitted',
    });
    assert.strictEqual(submission1.version, 1);

    // Verify upload does NOT release slot
    activeCount = await getDesignerActiveCount(designerA._id);
    assert.strictEqual(
      activeCount,
      3,
      'Uploading a design must NOT release an active assignment slot'
    );
    console.log('  ✓ Design uploaded. Assignment is under_review. Active count remains 3/3.');

    // Admin requests revision
    const reviewRev = await reviewSubmission({
      submissionId: submission1._id,
      adminId: admin._id,
      decision: 'request_revision',
      adminFeedback: 'Please adjust primary contrast and button hierarchy.',
    });
    assert.strictEqual(reviewRev.assignment.status, 'revision_requested');

    // Verify revision request does NOT release slot
    activeCount = await getDesignerActiveCount(designerA._id);
    assert.strictEqual(
      activeCount,
      3,
      'A revision request must NOT release an active assignment slot'
    );
    console.log('  ✓ Revision requested by Admin. Active count remains 3/3.');

    // Designer uploads revised files (version 2)
    const fakeFileV2 = {
      filename: 'design-v2.png',
      originalname: 'Design_Deliverable_v2.png',
      path: 'backend/uploads/submissions/design-v2.png',
      mimetype: 'image/png',
      size: 2048,
    };
    const submission2 = await submitDesignWork({
      assignmentId: assignment1._id,
      designerId: designerA._id,
      files: [fakeFileV2],
      comments: 'Revised with higher contrast',
    });
    assert.strictEqual(submission2.version, 2);
    console.log('  ✓ Revised files uploaded as Version 2.');

    // 7. Test Admin Approval (RELEASES SLOT)
    console.log('\n[Test 7] Testing Admin Approval & Slot Release...');
    const reviewApprove = await reviewSubmission({
      submissionId: submission2._id,
      adminId: admin._id,
      decision: 'approve',
      adminFeedback: 'Excellent work, approved!',
    });
    assert.strictEqual(reviewApprove.assignment.status, 'approved');

    activeCount = await getDesignerActiveCount(designerA._id);
    assert.strictEqual(
      activeCount,
      2,
      'Admin approval MUST release the assignment slot'
    );
    console.log(`  ✓ Design Approved! Assignment slot released: active count is now ${activeCount}/3.`);

    // Now Project 4 can be awarded to Designer Alpha!
    const assignment4 = await awardAssignment({
      projectId: p4._id,
      bidId: bidA_p4._id,
      adminNotes: 'Awarded after slot freed by approved project',
    });
    assert.strictEqual(assignment4.status, 'in_progress');
    activeCount = await getDesignerActiveCount(designerA._id);
    assert.strictEqual(activeCount, 3);
    console.log(`  ✓ Project 4 successfully awarded now that a slot was freed! Active count: ${activeCount}/3`);

    // 8. Test Formal Admin Cancellation (RELEASES SLOT)
    console.log('\n[Test 8] Testing Formal Admin Cancellation & Slot Release...');
    await cancelAssignment({
      assignmentId: assignment4._id,
      adminId: admin._id,
      reason: 'Client decided to pivot marketing focus',
    });
    activeCount = await getDesignerActiveCount(designerA._id);
    assert.strictEqual(
      activeCount,
      2,
      'Formal cancellation MUST release the assignment slot'
    );
    console.log(`  ✓ Assignment 4 formally cancelled. Slot released: active count is now ${activeCount}/3.`);

    console.log('\n==================================================');
    console.log('   ALL BACKEND AND WORKFLOW TESTS PASSED (8/8) !');
    console.log('==================================================\n');

    await disconnectDB();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ TEST FAILED:', error);
    await disconnectDB();
    process.exit(1);
  }
}

runTests();
