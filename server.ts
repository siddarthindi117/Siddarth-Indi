import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import fs from "fs";

// Initialize express app
const app = express();
const PORT = 3000;

// Increase limit to allow base64 uploads (screenshots and digital signatures)
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Data file path for persistence
const DATA_FILE = path.join(process.cwd(), "data_store.json");

// System state representation
interface AppState {
  profiles: {
    farmer: any;
    owner: any;
    admin: any;
  };
  machines: any[];
  bookings: any[];
  logs: any[];
}

// Default Seed Data
const DEFAULT_STATE: AppState = {
  profiles: {
    farmer: {
      fullName: "Davanagere Basanna",
      mobileNumber: "9845012345",
      village: "Anaji",
      taluk: "Davanagere",
      district: "Davanagere",
      state: "Karnataka",
      completeAddress: "Anaji Village, Near Hanuman Temple, Davanagere District, Karnataka - 577002",
      profilePhoto: "",
      rewardPoints: 120,
      referralCode: "BASA9845",
      savedSign: ""
    },
    owner: {
      fullName: "Haveri Manjappa",
      mobileNumber: "9900123456",
      village: "Karajgi",
      taluk: "Haveri",
      district: "Haveri",
      state: "Karnataka",
      completeAddress: "Karajgi, Near Railway Station Road, Haveri District, Karnataka - 581110",
      aadhaarNumber: "1234 5678 9012",
      rewardPoints: 250,
      referralCode: "MANJ9900",
      savedSign: ""
    },
    admin: {
      fullName: "Danya System Admin",
      mobileNumber: "9000000000",
      village: "Bengaluru",
      taluk: "Bengaluru South",
      district: "Bengaluru",
      state: "Karnataka",
      completeAddress: "Danya Agrotech Hub, Palace Road, Vasanth Nagar, Bengaluru, Karnataka - 560001",
      rewardPoints: 0
    }
  },
  machines: [
    {
      id: "machine-1",
      name: "Swarnamukhi Rashi Master V1",
      type: "Multi-Crop Rashi Machine & High Capacity Separator",
      vehicleNumber: "KA-27-M-4321",
      ownerName: "Haveri Manjappa",
      ownerMobile: "9900123456",
      ownerId: "owner-principal",
      aadhaarVerified: true,
      photos: [],
      availabilityStatus: "online",
      basePricing: [
        { cropName: "Togari", pricePerAcre: 1200 },
        { cropName: "Jola", pricePerAcre: 1000 },
        { cropName: "Godhi", pricePerAcre: 900 },
        { cropName: "Kadale", pricePerAcre: 1300 },
        { cropName: "Hesaru", pricePerAcre: 1100 },
        { cropName: "Paddy", pricePerAcre: 1100 },
        { cropName: "Groundnut", pricePerAcre: 1400 },
        { cropName: "Maize", pricePerAcre: 1000 }
      ],
      minCharge: 2000,
      travelCharges: 350,
      rating: 4.8,
      location: { lat: 14.4644, lng: 75.9218 }, // Close to Davanagere (around 14.46, 75.92)
      reviews: [
        {
          id: "rev-1",
          farmerName: "Basavaraj Gowda",
          rating: 5,
          comment: "Excellent work done for our Togari crop. Very neat separation without any grain loss. Recommended!",
          date: "2026-05-18"
        },
        {
          id: "rev-2",
          farmerName: "Ningappa S",
          rating: 4,
          comment: "Fast service, machine reached on time. Minimum charge is a bit high but quality of cleaning is super.",
          date: "2026-05-15"
        }
      ]
    },
    {
      id: "machine-2",
      name: "Bhoomi Harvester Super",
      type: "Precision Grain Harvester",
      vehicleNumber: "KA-17-A-8902",
      ownerName: "Dharwad Mallanna",
      ownerMobile: "9480112233",
      ownerId: "owner-dharwad",
      aadhaarVerified: true,
      photos: [],
      availabilityStatus: "online",
      basePricing: [
        { cropName: "Paddy", pricePerAcre: 1200 },
        { cropName: "Jola", pricePerAcre: 1100 },
        { cropName: "Maize", pricePerAcre: 1050 },
        { cropName: "Sajje", pricePerAcre: 1150 }
      ],
      minCharge: 2500,
      travelCharges: 500,
      rating: 4.5,
      location: { lat: 14.4944, lng: 75.8818 },
      reviews: [
        {
          id: "rev-3",
          farmerName: "Mallikarjun Patil",
          rating: 5,
          comment: "Threshed 10 acres of Maize in single day. The owner Patil was very humble and reasonable.",
          date: "2026-05-12"
        }
      ]
    },
    {
      id: "machine-3",
      name: "Kaveri Crop Decorticator",
      type: "Groundnut Thresher & Decorticator",
      vehicleNumber: "KA-16-E-5611",
      ownerName: "Chitradurga Swamy",
      ownerMobile: "9886221144",
      ownerId: "owner-chitradurga",
      aadhaarVerified: false,
      photos: [],
      availabilityStatus: "online",
      basePricing: [
        { cropName: "Groundnut", pricePerAcre: 1500 },
        { cropName: "Kadale", pricePerAcre: 1400 }
      ],
      minCharge: 3000,
      travelCharges: 400,
      rating: 4.2,
      location: { lat: 14.4100, lng: 75.9500 },
      reviews: []
    }
  ],
  bookings: [
    {
      id: "BK-1002",
      invoiceNumber: "DB-INV-2026-1002",
      farmerId: "farmer-principal",
      farmerName: "Davanagere Basanna",
      farmerMobile: "9845012345",
      village: "Anaji",
      taluk: "Davanagere",
      district: "Davanagere",
      state: "Karnataka",
      address: "Anaji Village, Davanagere, Karnataka",
      landmark: "Near Hanuman Temple",
      cropType: "Togari",
      acres: 4,
      preferredDate: "2026-05-16",
      preferredTime: "10:00 AM",
      machineId: "machine-1",
      machineName: "Swarnamukhi Rashi Master V1",
      vehicleNumber: "KA-27-M-4321",
      ownerName: "Haveri Manjappa",
      ownerMobile: "9900123456",
      ownerId: "owner-principal",
      ratePerAcre: 1200,
      travelCharges: 350,
      minCharge: 2000,
      totalAmount: 5150, // 4 * 1200 + 350
      status: "paid",
      farmerLocation: { lat: 14.4566, lng: 75.9324 },
      machineLocation: { lat: 14.4566, lng: 75.9324 },
      distanceKm: 0,
      etaMinutes: 0,
      paymentMethod: "PhonePe",
      transactionId: "TXN56291901234",
      screenshotUrl: "MOCK_PAYMENT_SCREENSHOT",
      paymentAmount: 5150,
      paymentDateTime: "2026-05-16 02:30 PM",
      signatures: {
        farmerSignature: "SIGNED_BASANNA",
        ownerSignature: "SIGNED_MANJAPPA"
      },
      workPhotos: {
        before: "MOCK_WORK_BEFORE",
        during: "MOCK_WORK_DURING",
        after: "MOCK_WORK_AFTER"
      },
      createdAt: "2026-05-15T08:00:00.000Z",
      updatedAt: "2026-05-16T15:00:00.000Z"
    },
    {
      id: "BK-1003",
      farmerId: "farmer-principal",
      farmerName: "Davanagere Basanna",
      farmerMobile: "9845012345",
      village: "Anaji",
      taluk: "Davanagere",
      district: "Davanagere",
      state: "Karnataka",
      address: "Anaji, Near Lake View",
      landmark: "Primary School",
      cropType: "Jola",
      acres: 3,
      preferredDate: "2026-05-24",
      preferredTime: "02:00 PM",
      machineId: "machine-1",
      machineName: "Swarnamukhi Rashi Master V1",
      vehicleNumber: "KA-27-M-4321",
      ownerName: "Haveri Manjappa",
      ownerMobile: "9900123456",
      ownerId: "owner-principal",
      ratePerAcre: 1000,
      travelCharges: 350,
      minCharge: 2000,
      totalAmount: 3350, // 3 * 1000 + 350
      status: "pending",
      farmerLocation: { lat: 14.4566, lng: 75.9324 },
      machineLocation: { lat: 14.4644, lng: 75.9218 },
      distanceKm: 1.5,
      etaMinutes: 12,
      createdAt: "2026-05-21T10:00:00.000Z",
      updatedAt: "2026-05-21T10:00:00.000Z"
    }
  ],
  logs: [
    {
      id: "log-1",
      userId: "farmer-principal",
      role: "farmer",
      action: "Created Booking BK-1002 for Togari crop on Swarnamukhi Rashi Master",
      timestamp: "2026-05-15T08:00:00.000Z"
    },
    {
      id: "log-2",
      userId: "owner-principal",
      role: "owner",
      action: "Accepted Booking BK-1002 and updated availability to heading",
      timestamp: "2026-05-15T09:15:00.000Z"
    },
    {
      id: "log-3",
      userId: "owner-principal",
      role: "owner",
      action: "Work completed & uploaded Before/During/After crop photos for BK-1002",
      timestamp: "2026-05-16T13:45:00.000Z"
    },
    {
      id: "log-4",
      userId: "farmer-principal",
      role: "farmer",
      action: "Uploaded payment screenshot for amount ₹5150",
      timestamp: "2026-05-16T14:30:00.000Z"
    },
    {
      id: "log-5",
      userId: "owner-principal",
      role: "owner",
      action: "Verified payment and generated digital invoice DB-INV-2026-1002",
      timestamp: "2026-05-16T15:00:00.000Z"
    }
  ]
};

// Current local state
let state: AppState = JSON.parse(JSON.stringify(DEFAULT_STATE));

// Save state helper
const saveStateToFile = () => {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(state, null, 2), "utf8");
  } catch (err) {
    console.error("Error saving state to file:", err);
  }
};

// Load state helper
const loadStateFromFile = () => {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const saved = fs.readFileSync(DATA_FILE, "utf8");
      if (saved.trim()) {
        state = JSON.parse(saved);
        console.log("State loaded successfully from file persistence.");
      }
    } else {
      saveStateToFile();
    }
  } catch (err) {
    console.error("Error loading state from file, resetting to default seed data:", err);
    state = JSON.parse(JSON.stringify(DEFAULT_STATE));
  }
};

loadStateFromFile();

// Log helpers
const addSystemLog = (userId: string, role: string, action: string) => {
  state.logs.unshift({
    id: `log-${Date.now()}`,
    userId,
    role,
    action,
    timestamp: new Date().toISOString()
  });
  saveStateToFile();
};

// Active state GPS simulator function
// Runs periodically or triggers whenever farmer checks simulation
const simulateGPSMovement = (bookingId: string) => {
  const booking = state.bookings.find(b => b.id === bookingId);
  if (!booking) return;

  if (booking.status === "started") {
    // Bring machine location 25% closer to farmer location
    const mLoc = booking.machineLocation;
    const fLoc = booking.farmerLocation;
    
    const latDiff = fLoc.lat - mLoc.lat;
    const lngDiff = fLoc.lng - mLoc.lng;
    
    if (Math.abs(latDiff) > 0.0001 || Math.abs(lngDiff) > 0.0001) {
      booking.machineLocation = {
        lat: mLoc.lat + latDiff * 0.25,
        lng: mLoc.lng + lngDiff * 0.25
      };
      // Reduce distance and ETA
      booking.distanceKm = Math.max(0.1, Number((booking.distanceKm * 0.75).toFixed(2)));
      booking.etaMinutes = Math.max(1, Math.round(booking.etaMinutes * 0.75));
    } else {
      // Reached
      booking.machineLocation = { ...fLoc };
      booking.distanceKm = 0;
      booking.etaMinutes = 0;
      addSystemLog(booking.ownerId, "owner", `Machine reached farmer location for booking ${bookingId}`);
    }
    booking.updatedAt = new Date().toISOString();
    saveStateToFile();
  }
};

// Initialize Gemini Client
let ai: GoogleGenAI | null = null;
const API_KEY = process.env.GEMINI_API_KEY;

if (API_KEY && API_KEY !== "MY_GEMINI_API_KEY" && API_KEY.trim() !== "") {
  try {
    ai = new GoogleGenAI({
      apiKey: API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
    console.log("Gemini client successfully initialized on the server.");
  } catch (err) {
    console.error("Failed to initialize GoogleGenAI client:", err);
  }
} else {
  console.log("Gemini API key is not configured or set to placeholder. Danya AI will operate in beautiful rule-based local simulation mode.");
}

// ------------------- API CUSTOM ENDPOINTS -------------------

// Get entire live state
app.get("/api/state", (req, res) => {
  res.json(state);
});

// Reset state to default seeds
app.post("/api/state/reset", (req, res) => {
  state = JSON.parse(JSON.stringify(DEFAULT_STATE));
  saveStateToFile();
  res.json({ success: true, state });
});

// Update Profile
app.post("/api/profile/update", (req, res) => {
  const { role, profileData } = req.body;
  if (!role || !profileData || !state.profiles[role as keyof typeof state.profiles]) {
    return res.status(400).json({ error: "Invalid role or profile data" });
  }

  const current = state.profiles[role as keyof typeof state.profiles];
  state.profiles[role as keyof typeof state.profiles] = {
    ...current,
    ...profileData
  };
  
  addSystemLog(`${role}-principal`, role, `Updated profile details: ${profileData.fullName}`);
  res.json({ success: true, profiles: state.profiles });
});

// Create new machine (Machine Owner Panel)
app.post("/api/machine/create", (req, res) => {
  const { name, type, vehicleNumber, basePricing, minCharge, travelCharges, photos } = req.body;
  if (!name || !vehicleNumber || !basePricing) {
    return res.status(400).json({ error: "Missing required machine details" });
  }

  const newMachine = {
    id: `machine-${Date.now()}`,
    name,
    type: type || "General Rashi Thresher",
    vehicleNumber,
    ownerName: state.profiles.owner.fullName,
    ownerMobile: state.profiles.owner.mobileNumber,
    ownerId: "owner-principal",
    aadhaarVerified: !!state.profiles.owner.aadhaarNumber,
    photos: photos || [],
    availabilityStatus: "online",
    basePricing: basePricing,
    minCharge: Number(minCharge) || 1500,
    travelCharges: Number(travelCharges) || 300,
    rating: 5.0,
    location: { lat: 14.4644 + (Math.random() - 0.5) * 0.05, lng: 75.9218 + (Math.random() - 0.5) * 0.05 },
    reviews: []
  };

  state.machines.push(newMachine);
  addSystemLog("owner-principal", "owner", `Registered a new machine: ${name} (${vehicleNumber})`);
  res.json({ success: true, machine: newMachine });
});

// Toggle Machine Online state (Machine Management)
app.post("/api/machine/toggle-status", (req, res) => {
  const { machineId, status } = req.body;
  const machine = state.machines.find(m => m.id === machineId);
  if (!machine) {
    return res.status(404).json({ error: "Machine not found" });
  }

  machine.availabilityStatus = status; // online / offline
  addSystemLog("owner-principal", "owner", `Updated machine status of ${machine.name} to ${status}`);
  res.json({ success: true, machine });
});

// Enter a Booking Request (Farmer Panel)
app.post("/api/booking/create", (req, res) => {
  const {
    cropType,
    acres,
    preferredDate,
    preferredTime,
    machineId,
    landmark
  } = req.body;

  if (!cropType || !acres || !machineId) {
    return res.status(400).json({ error: "Missing required booking details (crop type, acres, machine ID)" });
  }

  const selectedMachine = state.machines.find(m => m.id === machineId);
  if (!selectedMachine) {
    return res.status(444).json({ error: "Selected machine is no longer available" });
  }

  const farmer = state.profiles.farmer;
  const cropPricing = selectedMachine.basePricing.find((bp: any) => bp.cropName === cropType);
  const ratePerAcre = cropPricing ? cropPricing.pricePerAcre : 1000;
  const travelCharges = selectedMachine.travelCharges || 350;
  const minCharge = selectedMachine.minCharge || 2000;
  
  // Total calculated dynamically: acres * pricing + travel
  const workAmount = acres * ratePerAcre;
  const totalAmount = Math.max(minCharge, workAmount) + travelCharges;

  // Simulate randomized distance close to Davanagere
  const randDistance = Number((0.5 + Math.random() * 4).toFixed(1));
  const randETA = Math.round(randDistance * 7);

  // Calculate dynamic non-colliding ID based on max ID
  const maxIdNum = state.bookings.reduce((max: number, b: any) => {
    const num = parseInt(b.id.replace("BK-", ""), 10);
    return isNaN(num) ? max : Math.max(max, num);
  }, 1000);

  const newBooking = {
    id: `BK-${maxIdNum + 1}`,
    farmerId: "farmer-principal",
    farmerName: farmer.fullName,
    farmerMobile: farmer.mobileNumber,
    village: farmer.village,
    taluk: farmer.taluk,
    district: farmer.district,
    state: farmer.state,
    address: farmer.completeAddress,
    landmark: landmark || "Behind local school",
    cropType,
    acres: Number(acres),
    preferredDate,
    preferredTime,
    machineId,
    machineName: selectedMachine.name,
    vehicleNumber: selectedMachine.vehicleNumber,
    ownerName: selectedMachine.ownerName,
    ownerMobile: selectedMachine.ownerMobile,
    ownerId: selectedMachine.ownerId,
    ratePerAcre,
    travelCharges,
    minCharge,
    totalAmount,
    status: "pending",
    farmerLocation: { lat: 14.4566, lng: 75.9324 },
    machineLocation: { ...selectedMachine.location },
    distanceKm: randDistance,
    etaMinutes: randETA,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  state.bookings.unshift(newBooking);
  addSystemLog("farmer-principal", "farmer", `Created booking ${newBooking.id} for ${cropType} (${acres} acres)`);
  res.json({ success: true, booking: newBooking });
});

// General Booking Operations (accept, reject, started, photos, verification, etc.)
app.post("/api/booking/action", (req, res) => {
  const { bookingId, action, extraParams } = req.body;
  const booking = state.bookings.find(b => b.id === bookingId);
  if (!booking) {
    return res.status(404).json({ error: "Booking not found" });
  }

  const originalStatus = booking.status;

  if (action === "accept") {
    booking.status = "accepted";
    addSystemLog(booking.ownerId, "owner", `Accepted reservation request ${bookingId} for ${booking.farmerName}`);
  } else if (action === "reject") {
    booking.status = "rejected";
    booking.rejectionReason = extraParams?.reason || "Owner not available on that date.";
    addSystemLog(booking.ownerId, "owner", `Rejected reservation request ${bookingId}. Reason: ${booking.rejectionReason}`);
  } else if (action === "start_travel") {
    booking.status = "started";
    addSystemLog(booking.ownerId, "owner", `Machine started heading to farmer village for ${bookingId}`);
  } else if (action === "upload_photos") {
    // Photos parameters
    booking.workPhotos = {
      before: extraParams?.before || "",
      during: extraParams?.during || "",
      after: extraParams?.after || ""
    };
    booking.status = "photo_uploaded";
    addSystemLog(booking.ownerId, "owner", `Uploaded before, during, and after work photos for booking ${bookingId}`);
  } else if (action === "request_payment") {
    booking.status = "payment_pending";
    addSystemLog(booking.ownerId, "owner", `Requested farmer payment of ₹${booking.totalAmount} for ${bookingId}`);
  } else if (action === "verify_payment") {
    // Owner validates screenshot proof
    booking.status = "paid";
    booking.invoiceNumber = `DB-INV-${new Date().getFullYear()}-${booking.id.replace("BK-", "")}`;
    addSystemLog(booking.ownerId, "owner", `Payment verified. Auto-compiled Digital Invoice: ${booking.invoiceNumber}`);
    
    // Reward points addition to farmer and owner
    state.profiles.farmer.rewardPoints += 50; 
    state.profiles.owner.rewardPoints += 50;
  } else if (action === "reject_payment") {
    // Owner rejects screenshot proof
    booking.status = "payment_pending"; // return to screen
    booking.rejectionReason = extraParams?.reason || "Incorrect transaction ID or blurry screenshot.";
    addSystemLog(booking.ownerId, "owner", `Rejected payment receipt screenshot for ${bookingId}. Reason: ${booking.rejectionReason}`);
  } else if (action === "sign_and_complete") {
    // Compile Signatures
    booking.signatures = {
      farmerSignature: extraParams?.farmerSignature || booking.signatures?.farmerSignature || "",
      ownerSignature: extraParams?.ownerSignature || booking.signatures?.ownerSignature || ""
    };
    booking.status = "completed";
    addSystemLog("farmer-principal", "farmer", `Farmer and owner countersigned Work Completion report for ${bookingId}`);
  } else if (action === "simulation_step") {
    // Manually force machine movement on map closer to user
    if (booking.status === "started") {
      simulateGPSMovement(bookingId);
    }
  }

  booking.updatedAt = new Date().toISOString();
  saveStateToFile();
  res.json({ success: true, booking, stateLogs: state.logs });
});

// Update dynamic live GPS physical coordinates based on actual user location
app.post("/api/booking/update-location", (req, res) => {
  const { bookingId, lat, lng } = req.body;
  const booking = state.bookings.find(b => b.id === bookingId);
  if (!booking) {
    return res.status(404).json({ error: "Booking session not found" });
  }
  
  const latitude = Number(lat);
  const longitude = Number(lng);
  
  if (isNaN(latitude) || isNaN(longitude)) {
    return res.status(400).json({ error: "Coordinates must be numbers" });
  }

  // Recalculate distance and ETA dynamically using spherical haversine on actual live coordinates
  const R = 6371; // km
  const dLat = (latitude - booking.machineLocation.lat) * Math.PI / 180;
  const dLng = (longitude - booking.machineLocation.lng) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(booking.machineLocation.lat * Math.PI / 180) * Math.cos(latitude * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const newDistance = Number((R * c).toFixed(2));

  booking.farmerLocation = { lat: latitude, lng: longitude };
  booking.distanceKm = newDistance;
  booking.etaMinutes = Math.round(newDistance * 7);
  booking.updatedAt = new Date().toISOString();

  addSystemLog("farmer-principal", "farmer", `Updated GPS tracker of Booking ${bookingId} using real browser live coordinates: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}. Handover distance: ${newDistance} km`);
  saveStateToFile();
  res.json({ success: true, booking });
});

// Upload Payment Proof (Farmer Panel)
app.post("/api/booking/payment-submit", (req, res) => {
  const { bookingId, transactionId, screenshot, paymentMethod } = req.body;
  const booking = state.bookings.find(b => b.id === bookingId);
  if (!booking) {
    return res.status(404).json({ error: "Booking session not found" });
  }

  if (!transactionId || !screenshot) {
    return res.status(400).json({ error: "Transaction ID and screenshot photo are required" });
  }

  booking.status = "verify_pending";
  booking.transactionId = transactionId;
  booking.screenshotUrl = screenshot;
  booking.paymentMethod = paymentMethod || "UPI";
  booking.paymentAmount = booking.totalAmount;
  booking.paymentDateTime = new Date().toLocaleString();
  booking.rejectionReason = ""; // Clear any previous rejection error message
  
  booking.updatedAt = new Date().toISOString();
  addSystemLog("farmer-principal", "farmer", `Submitted payment proof of ₹${booking.totalAmount} for BK-Session: ${bookingId}`);
  saveStateToFile();
  res.json({ success: true, booking });
});

// Farmer adds review and ratings
app.post("/api/booking/submit-rating", (req, res) => {
  const { bookingId, rating, reviewText, photo } = req.body;
  const booking = state.bookings.find(b => b.id === bookingId);
  if (!booking) {
    return res.status(444).json({ error: "Booking details not found" });
  }

  const machine = state.machines.find(m => m.id === booking.machineId);
  if (machine) {
    const newReview = {
      id: `rev-${Date.now()}`,
      farmerName: booking.farmerName,
      rating: Number(rating) || 5,
      comment: reviewText || "Good machines and great sorting performance.",
      date: new Date().toISOString().split("T")[0],
      photo: photo || ""
    };
    machine.reviews.unshift(newReview);
    
    // Recalculate average rating of machine
    const totalReviewRatings = machine.reviews.reduce((acc: number, r: any) => acc + r.rating, 0);
    machine.rating = Number((totalReviewRatings / machine.reviews.length).toFixed(1));
    
    addSystemLog("farmer-principal", "farmer", `Submitted matching ${rating}-Star review for machine: ${machine.name}`);
    saveStateToFile();
    res.json({ success: true, machine, bookings: state.bookings });
  } else {
    res.status(404).json({ error: "Machine not found to save review" });
  }
});

// Weather API Recommendation Selector
app.get("/api/weather-info", (req, res) => {
  const farmer = state.profiles.farmer;
  const district = farmer.district || "Davanagere";
  
  // Real agricultural forecast matching Karnataka seasonal rains
  const weatherMap: Record<string, any> = {
    "Davanagere": {
      temperature: 32,
      condition: "Partly Cloudy with Golden Sun",
      rainForecast: "10% chance of showers in evening",
      windSpeed: 14,
      humidity: 55,
      harvestRecommendation: "Excellent dry conditions for Togari (Pigeon pea) and Jola (Sorghum) thresher operations today. High machine efficiency expected."
    },
    "Haveri": {
      temperature: 31,
      condition: "Clear Blue Skies",
      rainForecast: "0% Rainfall expected",
      windSpeed: 11,
      humidity: 48,
      harvestRecommendation: "Optimal low humidity afternoon. Highly safe for storing processed cereals. Recommended to schedules machines."
    },
    "Dharwad": {
      temperature: 30,
      condition: "Lightly Windy",
      rainForecast: "5% scattered overcast",
      windSpeed: 18,
      humidity: 60,
      harvestRecommendation: "Wind speed is safe for Rashi machine dust-blowing. Ideal for groundnut decorticators."
    }
  };

  const currentInfo = weatherMap[district] || weatherMap["Davanagere"];
  res.json({ district, ...currentInfo });
});

// Multilingual Danya AI Chatbot handler using server-side Gemini API
app.post("/api/chatbot/dialog", async (req, res) => {
  const { message, language } = req.body;
  const activeLang = language || "English"; // "English" | "Kannada" | "Hindi"

  if (!message || message.trim() === "") {
    return res.status(400).json({ error: "Message prompt is required" });
  }

  // Pre-compiled contextual system settings for Danya AI
  const systemInstruction = `
    You are "Danya AI" - the smart agricultural chatbot assistant for "DanyaBooking" booking app.
    Your main audience are Farmers and Machine Owners in Karnataka, India.
    Keep your responses warm, helpful, professional, and practical for farming communities.
    Always provide replies in the requested language: ${activeLang}.

    CONTEXT DATABASE OF THE SYSTEM:
    - Supported Crops: Togari, Jola, Godhi, Kadale, Hesaru, Alasande, Paddy, Sajje, Navane, Groundnut, Maize, other crops.
    - Owner Pricing Base Rates per Acre (Set by Swarnamukhi Rashi Master owner, Haveri Manjappa):
      * Togari = ₹1200 per Acre
      * Jola = ₹1000 per Acre
      * Godhi = ₹900 per Acre
      * Kadale = ₹1300 per Acre
      * Groundnut = ₹1400 per Acre
      * Paddy = ₹1100 per Acre
      * Maize = ₹1000 per Acre
    - Available Machines:
      1. Swarnamukhi Rashi Master V1 (KA-27-M-4321), Owner: Haveri Manjappa, rating 4.8. Has base pricing for Togari, Jola, Godhi, Kadale. Travel Charges: ₹350. Minimum Charge: ₹2000.
      2. Bhoomi Harvester Super (KA-17-A-8902), Owner: Dharwad Mallanna, rating 4.5. Supports Paddy, Jola, Maize, Sajje.
    - Weather Forecast recommendation: High-efficiency weather.
    - Features of DanyaBooking: Mobile Login, Live Tracking (simulated GPS and distance computation), Payment screenshot upload with manual verification by Owner to avoid fraud, downloadable invoice receipt with digital signatures of farmer & machine owner.
    - Referral: Referral code can be shared from profile. Gives 50 points to both friend and user.

    CURRENT BOOKINGS / USER DATA:
    - User/Farmer: Davanagere Basanna (Mobile: 9845012345, Village: Anaji, Taluk: Davanagere).
    - Booking BK-1002 status is PAID (Completed and Verified). Invoice DB-INV-2026-1002 is compiled. Worked 4 acres of Togari crop on machine-1. Amount paid: ₹5150.
    - Booking BK-1003 is currently PENDING (Waiting for Owner to accept).

    Answer the user query accurately based on this context. Keep answers concise, and structure them clearly with clean markdown bullet points. Do not mention system variable names or backend path details.
  `;

  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: message,
        config: {
          systemInstruction,
          temperature: 0.7
        }
      });
      
      const botText = response.text || "I'm having a slight trouble formulating the reply. Please retry in a moment.";
      return res.json({ text: botText });
    } catch (err: any) {
      console.error("Gemini API Error in /api/chatbot/dialog:", err);
      // Fallback response if API key fails or throttled
      return res.json({ text: getLocalRuleResponse(message, activeLang) });
    }
  } else {
    // Return precise responsive simulated responses matching the requested queries
    const fallbackText = getLocalRuleResponse(message, activeLang);
    return res.json({ text: fallbackText });
  }
});

// Robust local rule-based answers if Gemini API matches/errors
function getLocalRuleResponse(msg: string, lang: string): string {
  const query = msg.toLowerCase();
  
  if (lang === "Kannada") {
    if (query.includes("rate") || query.includes("ಬೆಲೆ") || query.includes("ದರ")) {
      return `** ಧಾನ್ಯ ಬುಕ್ಕಿಂಗ್ ದರ ಪಟ್ಟಿ (ಪ್ರತಿ ಎಕರೆಗೆ):**\n- **ತೊಗರಿ (Togari):** ₹1200\n- **ಜೋಳ (Jola):** ₹1000\n- **ಗೋಧಿ (Godhi):** ₹900\n- **ಕಡಲೆ (Kadale):** ₹1300\n- **ಭತ್ತ (Paddy):** ₹1100\n- **ಮೆಕ್ಕೆಜೋಳ (Maize):** ₹1000\n\n*ಪ್ರವಾಸ ಶುಲ್ಕ ಮತ್ತು ಕನಿಷ್ಠ ಶುಲ್ಕ ಅನ್ವಯಿಸಬಹುದು.*`;
    }
    if (query.includes("machine") || query.includes("ಯಂತ್ರ") || query.includes("ಸ್ಥಳ")) {
      return `**ಲಭ್ಯವಿರುವ ಹತ್ತಿರದ ರಾಶಿ ಯಂತ್ರಗಳು:**\n1. **ಸ್ವರ್ಣಮುಖಿ ರಾಶಿ ಮಾಸ್ಟರ್ V1** (ಮಾಲೀಕರು: ಹಾವೇರಿ ಮಂಜಪ್ಪ, ಅನಾಜಿ ಗ್ರಾಮದ ಹತ್ತಿರ ಲಭ್ಯವಿದೆ). ರೇಟಿಂಗ್: 4.8.\n2. **ಭೂಮಿ ಹಾರ್ವೆಸ್ಟರ್ ಸೂಪರ್** (ಮಾಲೀಕರು: ಧಧಾರವಾಡ ಮಲ್ಲಣ್ಣ). ರೇಟಿಂಗ್: 4.5.`;
    }
    if (query.includes("book") || query.includes("ಬುಕ್")) {
      return `**ರಾಶಿ ಯಂತ್ರ ಬುಕ್ ಮಾಡುವುದು ಹೇಗೆ?**\n1. ಫಾರ್ಮರ್ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್‌ನಲ್ಲಿ 'ಬುಕ್ ಯಂತ್ರ' ಬಟನ್ ಒತ್ತಿ.\n2. ಬೆಳೆ ಪ್ರಕಾರ (ಉದಾಹರಣೆಗೆ: ತೊಗರಿ, ಜೋಳ) ಮತ್ತು ಎಕರೆಗಳ ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸಿ.\n3. ದಿನಾಂಕ ಮತ್ತು ಸಮಯವನ್ನು ಆಯ್ಕೆ ಮಾಡಿ.\n4. ಯಂತ್ರವನ್ನು ಆರಿಸಿ ಮತ್ತು 'ಬುಕ್ಕಿಂಗ್ ವಿನಂತಿ ಸಲ್ಲಿಸಿ' ಕ್ಲಿಕ್ ಮಾಡಿ. ಮಾಲೀಕರು ಒಪ್ಪಿಗೆ ನೀಡಿದ ನಂತರ ಲೈವ್ ಟ್ರ್ಯಾಕಿಂಗ್ ಆರಂಭವಾಗುತ್ತದೆ.`;
    }
    if (query.includes("payment") || query.includes("ಹಣ") || query.includes("ಪಾವತಿ")) {
      return `** ಪಾವತಿ ವಿಧಾನ ಮತ್ತು ಪರಿಶೀಲನೆ:**\n- ನೀವು UPI, Google Pay, PhonePe ಅಥವಾ ಕಾರ್ಡ್ ಮೂಲಕ ಹಣ ಪಾವತಿಸಬಹುದು.\n- ಪಾವತಿ ಮಾಡಿದ ನಂತರ, ಅದರ ಸ್ಕ್ರೀನ್‌ಶಾಟ್ ಇತಿಹಾಸ ವಿಭಾಗದಲ್ಲಿ ಅಪ್‌ಲೋಡ್ ಮಾಡುವುದು ಕಡ್ಡಾಯವಾಗಿದೆ.\n- ಮಷಿನ್ ಮಾಲೀಕರು ಸ್ಕ್ರೀನ್‌ಶಾಟ್ ಪರಿಶೀಲಿಸಿ ನಿಮಗೆ ಅಂಗೀಕರಿಸಿದ ನಂತರ ಡಿಜಿಟಲ್ ಇನ್‌ವಾಯ್ಸ್ ಬಿಲ್ ಕಾಣಿಸುತ್ತದೆ.`;
    }
    if (query.includes("invoice") || query.includes("ಬಿಲ್") || query.includes("ರಶೀದಿ")) {
      return `**ನಿಮ್ಮ ಡಿಜಿಟಲ್ ಇನ್‌ವಾಯ್ಸ್:**\n- ನಿಮ್ಮ ಮೊದಲಿನ ಬುಕ್ಕಿಂಗ್ **BK-1002** ಪಾವತಿ ಯಶಸ್ವಿಯಾಗಿದೆ ಮತ್ತು ಪರಿಶೀಲಿಸಲಾಗಿದೆ.\n- ಬಿಲ್ ಸಂಖ್ಯೆ: **DB-INV-2026-1002**\n- ಮೊತ್ತ: **₹5150** (ತೊಗರಿ ಬೆಳೆ, 4 ಎಕರೆ).\n- ನೀವು ಈ ಇನ್‌ವಾಯ್ಸ್ ಅನ್ನು ಇತಿಹಾಸದಿಂದ ಪಿಡಿಎಫ್ ರೂಪದಲ್ಲಿ ಡೌನ್‌ಲೋಡ್ ಅಥವಾ ಶೇರ್ ಮಾಡಬಹುದು.`;
    }
    return `ನಮಸ್ಕಾರ, ನಾನು **ಧಾನ್ಯ AI**. ಧಾನ್ಯ ಬುಕ್ಕಿಂಗ್ ಬಗ್ಗೆ ನಿಮಗೆ ಯಾವುದೇ ಪ್ರಶ್ನೆ ಇದ್ದರೂ ಕೇಳಿ (ದರ ಮಾಹಿತಿ, ಬುಕ್ಕಿಂಗ್ ಸಹಾಯ, ಲೈವ್ ಟ್ರ್ಯಾಕಿಂಗ್, ವೆದರ್ ಅಪ್ಡೇಟ್). ನಾನು ನಿಮಗೆ ಸಹಾಯ ಮಾಡಲು ಸಿದ್ಧನಿದ್ದೇನೆ.`;
  } else if (lang === "Hindi") {
    if (query.includes("rate") || query.includes("मूल्य") || query.includes("कीमत") || query.includes("किराया")) {
      return `**धान्य बुकिंग दर सूची (प्रति एकड़):**\n- **तोगरी (अरहर):** ₹1200\n- **ज्वार (Jola):** ₹1000\n- **गेहूं (Godhi):** ₹900\n- **चना (Kadale):** ₹1300\n- **धान (Paddy):** ₹1100\n- **मक्का (Maize):** ₹1000\n\n*न्यूनतम शुल्क और यात्रा शुल्क मशीन मालिक द्वारा तय किए जाते हैं।*`;
    }
    if (query.includes("machine") || query.includes("मशीन") || query.includes("सर्विस")) {
      return `**आपके क्षेत्र के पास उपलब्ध मशीनें:**\n1. **स्वर्णमुखी राशि मास्टर V1** - मालिक: हावेरी मंजप्पा (आपके वर्तमान स्थान से 1.5 किमी दूर, रेटिंग: 4.8)\n2. **भूमि हार्वेस्टर सुपर** - मालिक: धारवाड़ मल्लन्ना (रेटिंग: 4.5)`;
    }
    if (query.includes("book") || query.includes("बुकिंग")) {
      return `**मशीन बुक करने की प्रक्रिया:**\n1. किसान पैनल में जाएं और 'Book Machine' पर क्लिक करें।\n2. अपनी फसल, एकड़ की संख्या दर्ज करें और पसंदीदा तिथि और समय चुनें।\n3. मशीन का चयन करें और अनुरोध भेजें। मालिक द्वारा स्वीकार किए जाने पर आपको सूचना मिलेगी।`;
    }
    if (query.includes("invoice") || query.includes("बिल") || query.includes("रसीद")) {
      return `**बिल एवं इनवॉइस असिस्टेंस:**\n- बुकिंग **BK-1002** का भुगतान सफलतापूर्वक सत्यापित हो चुका है।\n- इनवॉइस नंबर: **DB-INV-2026-1002**\n- कुल राशि: **₹5150**। आप इसे PDF में डाउनलोड कर सकते हैं।`;
    }
    return `नमस्ते! मैं हूँ **धान्य AI**। मैं धान्यबुकिंग प्लेटफॉर्म के उपयोग, फसलों की कटाई के रेट, नजदीकी राशि मशीन की उपलब्धता और इनवॉइस डाउनलोड करने में आपकी सहायता कर सकता हूँ। बताएं मैं क्या मदद करूं?`;
  } else {
    // English default
    if (query.includes("rate") || query.includes("price") || query.includes("pricing") || query.includes("charge")) {
      return `**DanyaBooking - Standard Rate Cards (per Acre):**\n- **Togari (Pigeon Pea):** ₹1200 / Acre\n- **Jola (Sorghum):** ₹1000 / Acre\n- **Godhi (Wheat):** ₹900 / Acre\n- **Kadale (Chickpea):** ₹1300 / Acre\n- **Groundnut:** ₹1400 / Acre\n- **Paddy:** ₹1100 / Acre\n- **Maize:** ₹1000 / Acre\n\n*Note: Machine owners set travel charges (e.g. ₹350) and specify minimum charges (e.g. ₹2000) for far-away locations.*`;
    }
    if (query.includes("nearest") || query.includes("machine") || query.includes("available")) {
      return `**Available Rashi Machines Nearby Davanagere:**\n1. **Swarnamukhi Rashi Master V1** (Vehicle: KA-27-M-4321, Owner: Haveri Manjappa). Rating: 4.8. Rating: 4.5. Status: Online & Active.\n2. **Bhoomi Harvester Super** (Vehicle: KA-17-A-8902, Owner: Dharwad Mallanna). Status: Online.`;
    }
    if (query.includes("book") || query.includes("request")) {
      return `**How to Book a Harvesting Machine:**\n1. Click on **'Book a Machine'** on your dashboard.\n2. Choose which crop you're harvesting, specify the land size in Acres, and select preferred Date & Time.\n3. Search and select from online machines based on price and rating, then submit the request.\n4. You can cancel or reschedule easily until the owner accepts the work.`;
    }
    if (query.includes("payment") || query.includes("verified") || query.includes("verify") || query.includes("screenshot")) {
      return `**Secure Payment & Screenshot Verification:**\n- We support Google Pay, PhonePe, Paytm, and Net Banking.\n- After paying the machine owner, write down the Transaction ID and upload a photo/screenshot of the receipt.\n- The owner receives the screenshot immediately on their panel. Once they click 'Verify', your invoice is automatically generated with signatures!`;
    }
    if (query.includes("invoice") || query.includes("bill") || query.includes("receipt")) {
      return `**Invoice Assistant:**\n- Your completed booking **BK-1002** was verified. Invoice **DB-INV-2026-1002** generated on 2026-05-16.\n- Total paid: **₹5150**.\n- You can download the PDF or instantly share it to WhatsApp/Email right from the History tab of the Farmer Panel.`;
    }
    if (query.includes("crop") || query.includes("supported")) {
      return `**Supported Crops in DanyaBooking:**\nTogari (Pigeon pea), Jola (Sorghum), Godhi (Wheat), Kadale (Chickpea), Hesaru, Alasande, Paddy, Sajje, Navane, Groundnut, Maize, and others. Real-time customized prices vary per crop.`;
    }
    return `Hello! I am **Danya AI**, your supportive agricultural companion for DanyaBooking.\nI can assist you with:\n- **Harvest Pricing & Crop rates**\n- **Locating nearest active Rashi machines**\n- **How to book, pay, and verify screenshots**\n- **Digital Invoices & In-app ratings**\n- **Local Weather suggestions**\n\nHow can I support your harvest today? (You can choose English, ಕನ್ನಡ, or हिंदी)`;
  }
}

// ----------------- VITE ENGINE CONFIGURATION -----------------

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // Development Mode
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite dev middleware mounted successfully onto Express.");
  } else {
    // Production Mode
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Production static server configured at dist folder.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`DanyaBooking multi-role server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
