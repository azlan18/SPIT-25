import express from "express";
import fs from "fs";
import mongoose from "mongoose";
import { google } from "googleapis";
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import dotenv from "dotenv";
import { Email } from "./models/Email.js";
import { Meeting } from "./models/Meeting.js";
import { ProcessingStatus } from "./models/ProcessingStatus.js";
import cors from "cors";
import router from './routes/index.js';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());
const PORT = 5000;

// Move router before other routes
app.use('/api', router);

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.API_KEY);

// Define schema for email analysis
const analysisSchema = {
  type: SchemaType.ARRAY,
  items: {
    type: SchemaType.OBJECT,
    properties: {
      emailNumber: { type: SchemaType.NUMBER, description: "Sequential number of the email" },
      sender: { type: SchemaType.STRING, description: "Email sender's name and address" },
      subject: { type: SchemaType.STRING, description: "Email subject line" },
      meetingRequest: { type: SchemaType.BOOLEAN, description: "Whether the email contains a meeting request" },
      dateTime: { type: SchemaType.STRING, description: "Proposed meeting date and time in ISO format, if any", nullable: true },
      urgencyLevel: { type: SchemaType.STRING, description: "High, Medium, or Low urgency level", enum: ["High", "Medium", "Low"] },
      requiredFollowUpActions: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING, description: "Action items that need to be completed" } },
    },
    required: ["emailNumber", "sender", "subject", "meetingRequest", "urgencyLevel", "requiredFollowUpActions"],
  },
};

// Initialize Gemini model with schema
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-pro",
  generationConfig: {
    responseMimeType: "application/json",
    responseSchema: analysisSchema,
  },
});

// Gmail and Calendar API Setup
const SCOPES = ["https://www.googleapis.com/auth/gmail.readonly", "https://www.googleapis.com/auth/calendar.events"];
const TOKEN_PATH = "token.json";
const credentials = JSON.parse(fs.readFileSync("credentials.json", "utf-8")).web;
const { client_secret, client_id, redirect_uris } = credentials;

const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

// Function to generate a new token if missing
async function getNewToken() {
  const authUrl = oAuth2Client.generateAuthUrl({ access_type: "offline", scope: SCOPES });
  console.log("\nAuthorize this app by visiting this URL:", authUrl);
}

// Check for existing token
if (fs.existsSync(TOKEN_PATH)) {
  const token = JSON.parse(fs.readFileSync(TOKEN_PATH, "utf-8"));
  oAuth2Client.setCredentials(token);
} else {
  getNewToken();
}

// OAuth2 Callback Route
app.get("/oauth2callback", async (req, res) => {
  const code = req.query.code;
  if (!code) {
    return res.status(400).send("Authorization code not provided.");
  }

  try {
    const { tokens } = await oAuth2Client.getToken(code);
    fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens));
    oAuth2Client.setCredentials(tokens);
    res.send("Authentication successful! You can close this window and restart the server.");
  } catch (error) {
    console.error("Error retrieving access token", error);
    res.status(500).send("Error retrieving access token.");
  }
});

// Analyze Email Content with Gemini AI
async function analyzeEmailWithGemini(emailData) {
  try {
    console.log('Analyzing email:', {
      subject: emailData.subject,
      sender: emailData.sender
    });

    const prompt = `Analyze this email and extract key information:
    From: ${emailData.sender}
    Subject: ${emailData.subject}
    Content: ${emailData.body}
    
    Provide a structured analysis including meeting requests, urgency level, and required follow-up actions.`;

    const result = await model.generateContent(prompt);
    const analysis = JSON.parse(result.response.text());
    
    console.log('Gemini analysis result:', analysis);
    return analysis;
  } catch (error) {
    console.error("Error analyzing email with Gemini:", error);
    throw error;
  }
}

// Create Google Calendar Event
async function createCalendarEvent(eventDetails) {
  try {
    const calendar = google.calendar({ version: "v3", auth: oAuth2Client });

    const event = {
      summary: eventDetails.subject,
      start: {
        dateTime: eventDetails.dateTime,
        timeZone: "Asia/Kolkata",
      },
      end: {
        dateTime: new Date(new Date(eventDetails.dateTime).getTime() + 60 * 60 * 1000).toISOString(),
        timeZone: "Asia/Kolkata",
      },
      conferenceData: {
        createRequest: {
          requestId: `meet-${Date.now()}`,
          conferenceSolutionKey: { type: "hangoutsMeet" },
        },
      },
    };

    const response = await calendar.events.insert({
      calendarId: "primary",
      conferenceDataVersion: 1,
      resource: event,
    });

    return response.data;
  } catch (error) {
    console.error("Error creating calendar event:", error);
    throw error;
  }
}

// Add this middleware to log all incoming requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// API Endpoints

app.post("/api/analyze-new-emails", async (req, res) => {
  try {
    console.log('Starting email analysis...');
    const gmail = google.gmail({ version: "v1", auth: oAuth2Client });
    
    // First, let's check if our Gmail token is still valid
    try {
      await gmail.users.getProfile({ userId: 'me' });
      console.log('Gmail authentication is valid');
    } catch (authError) {
      console.error('Gmail authentication error:', authError);
      throw new Error('Gmail authentication failed. Please reauthorize.');
    }

    // Get or create processing status
    const status = await ProcessingStatus.findOne() || new ProcessingStatus();
    console.log('Current processing status:', status);

    // Build Gmail query WITHOUT date filter initially to debug
    const allowedSenders = ["azlankhawar18@gmail.com", "azlankhawas@gmail.com", "varadsankhe8080@gmail.com"];
    const query = `from:(${allowedSenders.join(" OR ")})`;
    
    console.log('Gmail query:', query);

    // Get emails with more detailed logging
    console.log('Fetching messages from Gmail API...');
    const response = await gmail.users.messages.list({
      userId: "me",
      q: query,
      maxResults: 100
    });

    if (!response.data.messages) {
      console.log('No messages found matching the query');
      return res.json({ 
        success: true, 
        summary: { totalFound: 0, processed: 0, skipped: 0, errors: 0 } 
      });
    }

    console.log(`Found ${response.data.messages.length} messages`);

    for (const message of response.data.messages) {
      try {
        // Check if already processed
        const existingEmail = await Email.findOne({ messageId: message.id });
        if (existingEmail) {
          console.log(`Email ${message.id} already exists in database`);
          continue;
        }

        // Get full message details
        const fullMessage = await gmail.users.messages.get({
          userId: "me",
          id: message.id,
          format: "full"
        });

        console.log('Retrieved full message:', message.id);

        // Extract email data
        const headers = fullMessage.data.payload.headers;
        const sender = headers.find(h => h.name.toLowerCase() === "from")?.value;
        const subject = headers.find(h => h.name.toLowerCase() === "subject")?.value || "No Subject";
        const receivedAt = new Date(parseInt(fullMessage.data.internalDate));
        const body = fullMessage.data.snippet || "";

        console.log('Extracted email data:', { sender, subject, receivedAt });

        // Create email document first
        const emailDoc = new Email({
          messageId: message.id,
          sender,
          subject,
          receivedAt,
          body,
          processed: false
        });

        // Save email first to ensure we have it in the database
        const savedEmail = await emailDoc.save();
        console.log('Saved basic email to database:', savedEmail._id);

        // Now analyze with Gemini
        const analysis = await analyzeEmailWithGemini({
          sender,
          subject,
          body
        });

        // Update email with analysis
        if (analysis && analysis[0]) {
          savedEmail.analysis = {
            ...analysis[0],
            analyzedAt: new Date()
          };
          savedEmail.processed = true;
          await savedEmail.save();
          console.log('Updated email with analysis');

          // If it's a meeting request, create the meeting
          if (analysis[0].meetingRequest && analysis[0].dateTime) {
            try {
              const calendarEvent = await createCalendarEvent({
                subject,
                dateTime: analysis[0].dateTime
              });

              const meeting = await Meeting.create({
                sourceEmailId: savedEmail._id,
                subject,
                dateTime: new Date(analysis[0].dateTime),
                calendarEventId: calendarEvent.id,
                meetLink: calendarEvent.hangoutLink,
                status: 'scheduled'
              });

              console.log('Created meeting:', meeting._id);
            } catch (meetingError) {
              console.error('Failed to create meeting:', meetingError);
            }
          }
        }

      } catch (error) {
        console.error('Error processing message:', message.id, error);
      }
    }

    // Update last processed time
    status.lastProcessedAt = new Date();
    await status.save();

    res.json({ 
      success: true,
      summary: {
        totalFound: response.data.messages.length,
        processed: response.data.messages.length,
        skipped: 0,
        errors: 0
      }
    });

  } catch (error) {
    console.error("Error in analyze-new-emails:", error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

app.post("/api/reset-processing-status", async (req, res) => {
  try {
    const before = await ProcessingStatus.findOne();
    await ProcessingStatus.deleteMany({});
    res.json({ 
      message: "Processing status reset successfully",
      previousStatus: before,
      currentStatus: null
    });
  } catch (error) {
    res.status(500).json({ 
      error: "Failed to reset processing status", 
      details: error.message 
    });
  }
});

// Meetings endpoints
app.get("/api/meetings", async (req, res) => {
  try {
    console.log('Query params:', req.query); // Debug log
    const { status } = req.query;
    let query = {};
    
    if (status) {
      query.status = status;
    }

    const meetings = await Meeting.find(query)
      .populate('sourceEmailId')
      .sort({ dateTime: 1 });

    console.log('Found meetings:', meetings); // Debug log
    res.json(meetings);
  } catch (error) {
    console.error('Error fetching meetings:', error);
    res.status(500).json({ 
      error: "Failed to fetch meetings", 
      details: error.message 
    });
  }
});

// Emails endpoint
app.get("/api/emails", async (req, res) => {
  try {
    console.log('Query params:', req.query);
    const { urgency } = req.query;
    let query = {
      // Update sender filter to use regex to match email addresses within the sender field
      $or: [
        { sender: /azlankhawar18@gmail\.com/ },
        { sender: /azlankhawas@gmail\.com/ },
        { sender: /varadsankhe8080@gmail\.com/ }
      ]
    };
    
    // Add urgency filter if specified
    if (urgency) {
      query['analysis.urgencyLevel'] = urgency;
      console.log('Filtering for urgency level:', urgency);
    }

    console.log('Email query:', query);

    const emails = await Email.find(query)
      .sort({ receivedAt: -1 });

    console.log(`Found ${emails.length} emails matching criteria`);
    console.log('Matching emails:', emails.map(e => ({
      sender: e.sender,
      subject: e.subject,
      urgencyLevel: e.analysis?.urgencyLevel
    })));

    res.json(emails);
  } catch (error) {
    console.error('Error fetching emails:', error);
    res.status(500).json({ 
      error: "Failed to fetch emails", 
      details: error.message 
    });
  }
});

// New endpoints for individual resources
app.get("/api/meetings/:id", async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.id).populate('sourceEmailId');
    if (!meeting) {
      return res.status(404).json({ error: "Meeting not found" });
    }
    res.json(meeting);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch meeting" });
  }
});

app.get("/api/emails/:id", async (req, res) => {
  try {
    const email = await Email.findById(req.params.id);
    if (!email) {
      return res.status(404).json({ error: "Email not found" });
    }
    res.json(email);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch email" });
  }
});

// Update meeting status
app.patch("/api/meetings/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    if (!['pending', 'scheduled', 'cancelled', 'completed'].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }
    
    const meeting = await Meeting.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    
    if (!meeting) {
      return res.status(404).json({ error: "Meeting not found" });
    }
    
    res.json(meeting);
  } catch (error) {
    res.status(500).json({ error: "Failed to update meeting status" });
  }
});

// Add this debug endpoint
app.get("/api/debug/status", async (req, res) => {
  try {
    const status = await ProcessingStatus.findOne();
    res.json({ status });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});