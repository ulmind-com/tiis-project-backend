const express = require('express');
const router = express.Router();
const Application = require('../models/Application');
const Job = require('../models/Job'); // Require Job model to prevent MissingSchemaError on populate
const { protect, admin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

// ─────────────────────────────────────────────────────────────────
// Email templates for each stage of the application lifecycle
// ─────────────────────────────────────────────────────────────────

const emailTemplates = {

  // 1. Sent right after the candidate applies
  submission: (name, jobTitle) => ({
    subject: `Application Received — ${jobTitle} | TIIS`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #01324e; padding: 2rem; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 1.5rem;">TIIS — Thoughtful Institute of Innovative Solutions</h1>
        </div>
        <div style="padding: 2rem;">
          <h2 style="color: #01324e;">Dear ${name},</h2>
          <p style="color: #555; line-height: 1.7;">Thank you for applying for the <strong>${jobTitle}</strong> position at TIIS.</p>
          <p style="color: #555; line-height: 1.7;">We have successfully received your application and CV. Our Talent Acquisition team will carefully review your profile.</p>
          <div style="background-color: #f0f9ff; border-left: 4px solid #b12023; padding: 1rem 1.5rem; margin: 1.5rem 0; border-radius: 4px;">
            <p style="color: #01324e; font-weight: bold; margin: 0 0 0.5rem;">What happens next?</p>
            <p style="color: #555; margin: 0; line-height: 1.6;">We aim to respond to every applicant within <strong>2 business days</strong>. If your profile matches our current requirements, our team will reach out with further steps.</p>
          </div>
          <p style="color: #555; line-height: 1.7;">In the meantime, feel free to explore more about us at <a href="https://tiis.co.in" style="color: #b12023;">tiis.co.in</a>.</p>
          <p style="color: #555; margin-top: 2rem;">Warm regards,<br/><strong style="color: #01324e;">TIIS Talent Acquisition Team</strong></p>
        </div>
        <div style="background-color: #f8fafc; padding: 1rem 2rem; text-align: center; font-size: 0.8rem; color: #999;">
          © ${new Date().getFullYear()} TIIS — Thoughtful Institute of Innovative Solutions. Bangalore, India.
        </div>
      </div>
    `
  }),

  // 2. Application is under review
  reviewed: (name, jobTitle) => ({
    subject: `Your Application is Under Review — ${jobTitle} | TIIS`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #01324e; padding: 2rem; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 1.5rem;">TIIS — Thoughtful Institute of Innovative Solutions</h1>
        </div>
        <div style="padding: 2rem;">
          <h2 style="color: #01324e;">Dear ${name},</h2>
          <p style="color: #555; line-height: 1.7;">We wanted to give you a quick update on your application for the <strong>${jobTitle}</strong> position.</p>
          <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 1rem 1.5rem; margin: 1.5rem 0; border-radius: 4px;">
            <p style="color: #1e40af; font-weight: bold; margin: 0 0 0.5rem;">📋 Status Update: Under Review</p>
            <p style="color: #555; margin: 0; line-height: 1.6;">Your application and CV are currently being reviewed by our Talent Acquisition team. We will be in touch with you once the review process is complete.</p>
          </div>
          <p style="color: #555; line-height: 1.7;">Thank you for your patience. If you need to update any information, please do not hesitate to contact us at <a href="mailto:careers@tiis.co.in" style="color: #b12023;">careers@tiis.co.in</a>.</p>
          <p style="color: #555; margin-top: 2rem;">Warm regards,<br/><strong style="color: #01324e;">TIIS Talent Acquisition Team</strong></p>
        </div>
        <div style="background-color: #f8fafc; padding: 1rem 2rem; text-align: center; font-size: 0.8rem; color: #999;">
          © ${new Date().getFullYear()} TIIS — Thoughtful Institute of Innovative Solutions. Bangalore, India.
        </div>
      </div>
    `
  }),

  // 3. Application rejected
  rejected: (name, jobTitle) => ({
    subject: `Update on Your Application — ${jobTitle} | TIIS`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #01324e; padding: 2rem; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 1.5rem;">TIIS — Thoughtful Institute of Innovative Solutions</h1>
        </div>
        <div style="padding: 2rem;">
          <h2 style="color: #01324e;">Dear ${name},</h2>
          <p style="color: #555; line-height: 1.7;">Thank you for your interest in the <strong>${jobTitle}</strong> role at TIIS and for taking the time to apply.</p>
          <p style="color: #555; line-height: 1.7;">After carefully reviewing your profile, we regret to inform you that we will not be moving forward with your application for this particular role at this time.</p>
          <div style="background-color: #fef9c3; border-left: 4px solid #eab308; padding: 1rem 1.5rem; margin: 1.5rem 0; border-radius: 4px;">
            <p style="color: #854d0e; font-weight: bold; margin: 0 0 0.5rem;">Don't be discouraged!</p>
            <p style="color: #555; margin: 0; line-height: 1.6;">This decision does not reflect on your overall abilities or potential. We encourage you to keep an eye on our <a href="https://tiis.co.in/careers" style="color: #b12023;">careers page</a> for future opportunities that may be a better match for your profile.</p>
          </div>
          <p style="color: #555; line-height: 1.7;">We appreciate your effort and wish you all the best in your career journey.</p>
          <p style="color: #555; margin-top: 2rem;">Warm regards,<br/><strong style="color: #01324e;">TIIS Talent Acquisition Team</strong></p>
        </div>
        <div style="background-color: #f8fafc; padding: 1rem 2rem; text-align: center; font-size: 0.8rem; color: #999;">
          © ${new Date().getFullYear()} TIIS — Thoughtful Institute of Innovative Solutions. Bangalore, India.
        </div>
      </div>
    `
  }),

  // 4. Candidate shortlisted / hired
  hired: (name, jobTitle) => ({
    subject: `🎉 Congratulations! You've Been Shortlisted — ${jobTitle} | TIIS`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #01324e; padding: 2rem; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 1.5rem;">TIIS — Thoughtful Institute of Innovative Solutions</h1>
        </div>
        <div style="padding: 2rem;">
          <h2 style="color: #01324e;">Congratulations, ${name}! 🎉</h2>
          <p style="color: #555; line-height: 1.7;">We are thrilled to inform you that you have been <strong>shortlisted</strong> for the <strong>${jobTitle}</strong> position at TIIS!</p>
          <div style="background-color: #dcfce7; border-left: 4px solid #22c55e; padding: 1rem 1.5rem; margin: 1.5rem 0; border-radius: 4px;">
            <p style="color: #166534; font-weight: bold; margin: 0 0 0.5rem;">✅ Next Steps</p>
            <p style="color: #555; margin: 0; line-height: 1.6;">Our Talent Acquisition team will be reaching out to you very soon with details about the next steps in the selection process, which may include an interview or further evaluation.</p>
          </div>
          <p style="color: #555; line-height: 1.7;">Please ensure your contact details are up to date. If you have any questions in the meantime, feel free to reach us at <a href="mailto:careers@tiis.co.in" style="color: #b12023;">careers@tiis.co.in</a>.</p>
          <p style="color: #555; line-height: 1.7;">We look forward to speaking with you soon!</p>
          <p style="color: #555; margin-top: 2rem;">With warm regards,<br/><strong style="color: #01324e;">TIIS Talent Acquisition Team</strong></p>
        </div>
        <div style="background-color: #f8fafc; padding: 1rem 2rem; text-align: center; font-size: 0.8rem; color: #999;">
          © ${new Date().getFullYear()} TIIS — Thoughtful Institute of Innovative Solutions. Bangalore, India.
        </div>
      </div>
    `
  }),
};

// Helper to fire off a Resend email safely (never crashes the main response)
const sendStatusEmail = async (to, template) => {
  if (!process.env.RESEND_API_KEY) return;
  try {
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'TIIS Careers <careers@sagnikmondal.in>',
      to,
      subject: template.subject,
      html: template.html,
    });
    console.log(`[Resend] Email sent → "${template.subject}" → ${to}`);
  } catch (err) {
    console.error('[Resend] Failed to send email:', err.message);
  }
};

// ─────────────────────────────────────────────────────────────────
// Routes
// ─────────────────────────────────────────────────────────────────

// @desc    Submit a job application (with CV upload)
// @route   POST /api/applications
// @access  Public
router.post('/', upload.single('cv'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'CV file is required' });
    }

    const applicationData = {
      ...req.body,
      cvUrl: req.file.path,
    };

    const application = new Application(applicationData);
    const createdApplication = await application.save();

    // Populate job title for the email
    await createdApplication.populate('job', 'title');
    const jobTitle = createdApplication.job?.title || 'the applied position';

    // Fire submission acknowledgement email (non-blocking)
    sendStatusEmail(
      createdApplication.email,
      emailTemplates.submission(createdApplication.name, jobTitle)
    );

    res.status(201).json(createdApplication);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @desc    Get all applications (with job info)
// @route   GET /api/applications
// @access  Private/Admin
router.get('/', protect, admin, async (req, res) => {
  try {
    const applications = await Application.find({}).populate('job', 'title').sort({ createdAt: -1 });
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Update application status and fire the correct lifecycle email
// @route   PUT /api/applications/:id/status
// @access  Private/Admin
router.put('/:id/status', protect, admin, async (req, res) => {
  try {
    const application = await Application.findById(req.params.id).populate('job', 'title');
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    const newStatus = req.body.status;
    if (!newStatus) {
      return res.status(400).json({ message: 'Status is required' });
    }

    application.status = newStatus;
    const updated = await application.save();

    const jobTitle = application.job?.title || 'your applied position';

    // Fire the correct email for the new status (non-blocking via async IIFE)
    const templateMap = {
      reviewed: emailTemplates.reviewed,
      rejected: emailTemplates.rejected,
      hired:    emailTemplates.hired,
    };

    if (templateMap[newStatus]) {
      sendStatusEmail(
        application.email,
        templateMap[newStatus](application.name, jobTitle)
      );
    }

    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
