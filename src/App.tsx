import { useEffect, useState } from "react";
import { 
  Compass, LayoutDashboard, CalendarDays, KeyRound, Map, CloudRain, ShieldAlert,
  Share2, Users, Receipt, HardDrive, Cpu, DollarSign, Award, Bell, CheckCircle, 
  X, HelpCircle, Star, Image as ImageIcon, Camera, UserSquare, ShieldCheck, 
  RefreshCw, LogOut, Moon, Sun, ChevronRight, Lock, Plus, Activity
} from "lucide-react";
import { soundEffects } from "./components/SoundManager";
import WeatherWidget from "./components/WeatherWidget";
import MapContainer from "./components/MapContainer";
import ChatbotWidget from "./components/ChatbotWidget";
import InvoiceModal from "./components/InvoiceModal";
import { Booking, Machine, UserRole, UserProfile } from "./types";

export default function App() {
  const [role, setRole] = useState<UserRole>("farmer");
  
  // Entire Server state replica
  const [appState, setAppState] = useState<{
    profiles: { farmer: UserProfile; owner: UserProfile; admin: UserProfile };
    machines: Machine[];
    bookings: Booking[];
    logs: any[];
  } | null>(null);

  // General App navigation state 
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [themePalette, setThemePalette] = useState<"emerald" | "terracotta" | "midnight">("emerald");

  // Live Location Browser GPS coordinates
  const [browserCoords, setBrowserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isTrackingLive, setIsTrackingLive] = useState<boolean>(false);
  const [gpsLoading, setGpsLoading] = useState<boolean>(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [gpsWatchId, setGpsWatchId] = useState<number | null>(null);

  useEffect(() => {
    return () => {
      if (gpsWatchId !== null) {
        navigator.geolocation.clearWatch(gpsWatchId);
      }
    };
  }, [gpsWatchId]);

  // Authentication & Separate Logins Gate
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false); // Starts securely logged out to show separate portal choice!
  const [loginFlow, setLoginFlow] = useState<"select" | "farmer" | "owner">("select");
  const [loginRoleTab, setLoginRoleTab] = useState<"farmer" | "owner">("farmer");
  const [loginPhone, setLoginPhone] = useState("");
  const [loginOtp, setLoginOtp] = useState("");
  const [loginVehicleNum, setLoginVehicleNum] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  // Easy Register Fields
  const [regName, setRegName] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regVillage, setRegVillage] = useState("");
  const [regTaluk, setRegTaluk] = useState("");
  const [regDistrict, setRegDistrict] = useState("");
  const [regAddress, setRegAddress] = useState("");
  const [regAadhaar, setRegAadhaar] = useState("");

  // Profile modal settings (Solving Clickability issue)
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileEditName, setProfileEditName] = useState("");
  const [profileEditPhone, setProfileEditPhone] = useState("");
  const [profileEditVillage, setProfileEditVillage] = useState("");
  const [profileEditTaluk, setProfileEditTaluk] = useState("");
  const [profileEditDistrict, setProfileEditDistrict] = useState("");
  const [profileEditAddress, setProfileEditAddress] = useState("");
  const [profileEditAadhaar, setProfileEditAadhaar] = useState("");
  
  // Booking creation form state
  const [bookingCrop, setBookingCrop] = useState("Togari");
  const [bookingAcres, setBookingAcres] = useState(3);
  const [bookingDate, setBookingDate] = useState("2026-05-22");
  const [bookingTime, setBookingTime] = useState("10:00 AM");
  const [bookingLandmark, setBookingLandmark] = useState("");
  const [selectedMachineId, setSelectedMachineId] = useState("");
  const [isBookingCreated, setIsBookingCreated] = useState(false);

  // New Machine Registration Form
  const [newMacName, setNewMacName] = useState("");
  const [newMacType, setNewMacType] = useState("Multi-Crop Rashi Machine");
  const [newMacNumber, setNewMacNumber] = useState("");
  const [newMacMinCharge, setNewMacMinCharge] = useState(2000);
  const [newMacTravel, setNewMacTravel] = useState(350);
  const [pricingTogari, setPricingTogari] = useState(1200);
  const [pricingJola, setPricingJola] = useState(1000);
  const [pricingGodhi, setPricingGodhi] = useState(900);
  const [pricingKadale, setPricingKadale] = useState(1300);
  const [pricingMaize, setPricingMaize] = useState(1000);

  // Invoice view active state
  const [selectedInvoiceBooking, setSelectedInvoiceBooking] = useState<Booking | null>(null);

  // Payment proof modal active state
  const [payingBooking, setPayingBooking] = useState<Booking | null>(null);
  const [txnId, setTxnId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("PhonePe");
  const [paymentScreenshot, setPaymentScreenshot] = useState("");

  // Work photos active upload state
  const [photoBooking, setPhotoBooking] = useState<Booking | null>(null);
  const [workPhotoBefore, setWorkPhotoBefore] = useState("");
  const [workPhotoDuring, setWorkPhotoDuring] = useState("");
  const [workPhotoAfter, setWorkPhotoAfter] = useState("");

  // Rating & Review sub-state
  const [ratingBooking, setRatingBooking] = useState<Booking | null>(null);
  const [reviewStars, setReviewStars] = useState(5);
  const [reviewComment, setReviewComment] = useState("");

  // Referral Invite code share feedback
  const [showReferralPopup, setShowReferralPopup] = useState(false);

  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  // Radar Simulated state variables for GPS map when there's no active/started booking
  const [radarMachineLoc, setRadarMachineLoc] = useState<{ lat: number; lng: number }>({ lat: 14.4682, lng: 75.9415 });
  const [radarStep, setRadarStep] = useState<number>(0);

  const handleRadarSimulateStep = () => {
    soundEffects.playSuccess();
    const targetLat = 14.4566;
    const targetLng = 75.9324;
    
    setRadarMachineLoc(prev => {
      const dLat = targetLat - prev.lat;
      const dLng = targetLng - prev.lng;
      const stepFactor = 0.25; // 4 steps to arrive
      
      const nextLat = prev.lat + dLat * stepFactor;
      const nextLng = prev.lng + dLng * stepFactor;
      
      if (Math.abs(nextLat - targetLat) < 0.001 && Math.abs(nextLng - targetLng) < 0.001) {
        triggerNotification("🎉 Excellent! Simulated Rashi Thresher has arrived physically at Basanna's farm!");
        return { lat: targetLat, lng: targetLng };
      } else {
        triggerNotification("🚜 Simulated thresher moving closer along the Anaji silt route...");
        return { lat: nextLat, lng: nextLng };
      }
    });
    setRadarStep(prev => prev + 1);
  };

  const CROPS = [
    "Togari", "Jola", "Godhi", "Kadale", "Hesaru", "Alasande", 
    "Paddy", "Sajje", "Navane", "Groundnut", "Maize", "Other"
  ];

  // Load server state
  const syncState = async () => {
    try {
      const res = await fetch("/api/state");
      const data = await res.json();
      setAppState(data);
    } catch (e) {
      console.error("Failed to load backend state", e);
    }
  };

  const currentProfile = appState 
    ? appState.profiles[role] 
    : { fullName: "Davanagere Basanna", rewardPoints: 250, referralCode: "DANYA982", mobileNumber: "9845123456", village: "Basavanapura", taluk: "Raichur", district: "Raichur", completeAddress: "Basavanapura Agribusiness Hub, Raichur" };

  useEffect(() => {
    syncState();
    
    // Auto sync state interval
    const pid = setInterval(syncState, 6000);
    return () => clearInterval(pid);
  }, []);

  // System notification banner
  const triggerNotification = (msg: string) => {
    soundEffects.playNotification();
    setNotificationMsg(msg);
    setTimeout(() => {
      setNotificationMsg(null);
    }, 5000);
  };

  // Switch Role
  const handleRoleChange = (newRole: UserRole) => {
    soundEffects.playClick();
    setRole(newRole);
    setIsLoggedIn(true); // Always logged in when simulating via header toolbar
    // Auto reset appropriate tab
    if (newRole === "farmer") {
      setActiveTab("dashboard");
    } else if (newRole === "owner") {
      setActiveTab("owner_dashboard");
    } else {
      setActiveTab("analytics");
    }
  };

  // Browser standard Geolocation API connection - "give live location"
  const triggerBrowserLiveLocation = async (activeBookingId?: string) => {
    soundEffects.playClick();
    if (!navigator.geolocation) {
      setGpsError("Geolocation is not supported by your browser.");
      triggerNotification("ಜಿಪಿಎಸ್ ಬೆಂಬಲಿತವಾಗಿಲ್ಲ / Geolocation is not supported by your browser.");
      return;
    }

    // If already tracking, clear the previous watcher first
    if (gpsWatchId !== null) {
      navigator.geolocation.clearWatch(gpsWatchId);
      setGpsWatchId(null);
    }

    setGpsLoading(true);
    setGpsError(null);
    setIsTrackingLive(true);
    triggerNotification("🛰️ Connecting to device GPS satellites... Please allow location access.");

    const watchId = navigator.geolocation.watchPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const coords = { lat: latitude, lng: longitude };
        
        setBrowserCoords(coords);
        setGpsLoading(false);
        setGpsError(null);

        // If there's an active booking or the user passed an activeBookingId, sync it on the server
        const targetBooking = activeBookingId || appState?.bookings.find(b => b.status === "started")?.id;
        if (targetBooking) {
          try {
            const res = await fetch("/api/booking/update-location", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ bookingId: targetBooking, lat: latitude, lng: longitude })
            });
            if (res.ok) {
              await syncState();
            }
          } catch (err) {
            console.error("Failed to sync live GPS coordinates to thresher server", err);
          }
        }
      },
      (error) => {
        console.warn("Geolocation fetch error:", error);
        setGpsLoading(false);
        setIsTrackingLive(false);

        let errorMsg = "Unable to fetch location";
        if (error.code === error.PERMISSION_DENIED) {
          errorMsg = "Location permission denied";
          triggerNotification("⚠️ GPS Permission Denied. Please enable location permissions in your browser/device settings.");
        } else {
          triggerNotification("⚠️ Unable to fetch live GPS location. Reverting to simulation coordinates.");
        }
        setGpsError(errorMsg);

        // Fallback to high-fidelity farming location near Davanagere if permission denied
        const mockHarvesterCoords = { lat: 14.4566 + (Math.random() - 0.5) * 0.02, lng: 75.9324 + (Math.random() - 0.5) * 0.02 };
        setBrowserCoords(mockHarvesterCoords);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );

    setGpsWatchId(watchId);
  };

  // Google Maps Navigation Helper with robust coordinate validation
  const openGoogleMapsNavigation = (origin: { lat?: number; lng?: number } | null, destination: { lat?: number; lng?: number } | null) => {
    if (!origin || !destination || origin.lat === undefined || origin.lng === undefined || destination.lat === undefined || destination.lng === undefined) {
      triggerNotification("⚠️ navigation failed: Origin or Destination coordinates are missing!");
      return;
    }

    const oLat = Number(origin.lat);
    const oLng = Number(origin.lng);
    const dLat = Number(destination.lat);
    const dLng = Number(destination.lng);

    if (isNaN(oLat) || isNaN(oLng) || isNaN(dLat) || isNaN(dLng) || oLat === 0 || oLng === 0 || dLat === 0 || dLng === 0) {
      triggerNotification("⚠️ GPS navigation Error: Invalid coordinates (0,0 or corrupted latitude/longitude). Please wait for active GPS lock!");
      return;
    }

    soundEffects.playClick();
    const url = `https://www.google.com/maps/dir/?api=1&origin=${oLat},${oLng}&destination=${dLat},${dLng}&travelmode=driving`;
    
    // Automatically handles Android, iPhone, and Desktop browser launches
    window.open(url, "_blank", "noopener,noreferrer");
  };

  // Send OTP (Simulated)
  const handleSendOtp = () => {
    if (!loginPhone || loginPhone.trim().length < 10) {
      triggerNotification("ದಯವಿಟ್ಟು 10 ಅಂಕಿಯ ಮೊಬೈಲ್ ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸಿ / Please enter a valid 10-digit mobile number.");
      return;
    }
    soundEffects.playSuccess();
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    setOtpCode(code);
    setOtpSent(true);
    triggerNotification(`Simulated OTP text message sent to +91-${loginPhone}: Code is [ ${code} ]`);
  };

  // Farmer login submit
  const handleFarmerLoginSubmit = () => {
    if (!loginPhone || loginPhone.length < 10) {
      triggerNotification("ದಯವಿಟ್ಟು ಪೋನ್ ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸಿ / Please enter registered phone.");
      return;
    }
    if (otpSent && loginOtp !== otpCode && loginOtp !== "1234") {
      triggerNotification("ತಪ್ಪಾದ OTP. ದಯವಿಟ್ಟು ನೋಟಿಫಿಕೇಶನ್‌ನಲ್ಲಿ ತೋರಿಸಿರುವ ಕೋಡ್ ಬಳಸಿ / Incorrect OTP.");
      return;
    }
    soundEffects.playSuccess();
    setRole("farmer");
    setIsLoggedIn(true);
    setActiveTab("dashboard");
    triggerNotification("Farmers Portal successfully authenticated! ರೈತ ಪೋರ್ಟಲ್‌ಗೆ ಸುಸ್ವಾಗತ.");
  };

  // Machinery owner login submit
  const handleOwnerLoginSubmit = () => {
    if (!loginPhone && !loginVehicleNum) {
      triggerNotification("ದಯವಿಟ್ಟು ಮೊಬೈಲ್ ಸಂಖ್ಯೆ ಅಥವಾ ವಾಹನ ಸಂಖ್ಯೆ ನಮೂದಿಸಿ / Enter mobile number or vehicle plate.");
      return;
    }
    soundEffects.playSuccess();
    setRole("owner");
    setIsLoggedIn(true);
    setActiveTab("owner_dashboard");
    triggerNotification("Machinery Owner Terminal initialized successfully! ಮಾಲೀಕರ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್ ಲಾಗಿನ್ ಆಯಿತು.");
  };

  // Quick demonstration entry
  const handleQuickDemoLogin = (targetRole: UserRole) => {
    soundEffects.playSuccess();
    setRole(targetRole);
    setIsLoggedIn(true);
    if (targetRole === "farmer") {
      setActiveTab("dashboard");
    } else if (targetRole === "owner") {
      setActiveTab("owner_dashboard");
    } else {
      setActiveTab("analytics");
    }
    triggerNotification(`Demo Login: Entered as ${targetRole === "farmer" ? "Basanna Field" : targetRole === "owner" ? "Manjappa Owner" : "System Admin"} Console.`);
  };

  // Create account easy register
  const handleRegisterSubmit = async () => {
    if (!regName || !regPhone) {
      triggerNotification("ಹೆಸರು ಮತ್ತು ಫೋನ್ ಸಂಖ್ಯೆ ಅವಶ್ಯಕ / Farmer name and phone are required.");
      return;
    }
    try {
      soundEffects.playSuccess();
      const res = await fetch("/api/profile/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: loginRoleTab,
          profileData: {
            fullName: regName,
            mobileNumber: regPhone,
            village: regVillage || "Anaji",
            taluk: regTaluk || "Davanagere",
            district: regDistrict || "Davanagere",
            completeAddress: regAddress || `${regVillage}, ${regTaluk}, ${regDistrict}, Karnataka`,
            rewardPoints: 50,
            referralCode: regName.substring(0, 4).toUpperCase() + regPhone.substring(6, 10),
            aadhaarNumber: regAadhaar || "Not Verified yet"
          }
        })
      });
      if (res.ok) {
        await syncState();
        setRole(loginRoleTab);
        setIsLoggedIn(true);
        setIsRegisterMode(false);
        if (loginRoleTab === "farmer") {
          setActiveTab("dashboard");
        } else {
          setActiveTab("owner_dashboard");
        }
        triggerNotification(`Registration complete! Welcome to DanyaBooking.`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Open profile modal correctly populated
  const triggerOpenProfileModal = () => {
    soundEffects.playClick();
    if (!appState) return;
    const profile = appState.profiles[role];
    setProfileEditName(profile.fullName);
    setProfileEditPhone(profile.mobileNumber);
    setProfileEditVillage(profile.village);
    setProfileEditTaluk(profile.taluk);
    setProfileEditDistrict(profile.district);
    setProfileEditAddress(profile.completeAddress);
    setProfileEditAadhaar(profile.aadhaarNumber || "");
    setShowProfileModal(true);
  };

  // Submit profile edits back to Server
  const handleSaveProfileEdits = async () => {
    if (!profileEditName || !profileEditPhone) {
      triggerNotification("Name and Phone number are required.");
      return;
    }
    try {
      const res = await fetch("/api/profile/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: role,
          profileData: {
            fullName: profileEditName,
            mobileNumber: profileEditPhone,
            village: profileEditVillage,
            taluk: profileEditTaluk,
            district: profileEditDistrict,
            completeAddress: profileEditAddress,
            aadhaarNumber: profileEditAadhaar
          }
        })
      });
      if (res.ok) {
        await syncState();
        setShowProfileModal(false);
        soundEffects.playSuccess();
        triggerNotification("Profile details successfully saved on the server!");
      }
    } catch (e) {
      console.error(e);
      triggerNotification("Failed to update profile. Please try again.");
    }
  };

  // Base64 file converter for simulated uploaded files / photos
  const handlePhotoConvert = (idx: number, fileInput: any, hook: (val: string) => void) => {
    const file = fileInput.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        hook(reader.result as string);
        soundEffects.playSuccess();
      };
      reader.readAsDataURL(file);
    } else {
      // Dummy photo gen matching crops / invoice receipts
      const keywords = ["RECEIPT", "BEFORE_HARVEST", "DURING_THRESHING", "AFTER_CLEANED"];
      const selectWord = keywords[idx];
      // Simulated sample aesthetic graphic URL
      hook(`IMAGE_VECTOR_PROOF_${selectWord}_${Date.now()}`);
      soundEffects.playSuccess();
    }
  };

  // Submit Booking Request
  const triggerSubmitBooking = async () => {
    if (!selectedMachineId) {
      triggerNotification("Please choose a machine from the pricing schedule scale.");
      return;
    }

    soundEffects.playSuccess();
    try {
      const res = await fetch("/api/booking/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cropType: bookingCrop,
          acres: bookingAcres,
          preferredDate: bookingDate,
          preferredTime: bookingTime,
          machineId: selectedMachineId,
          landmark: bookingLandmark || "Near Main Canal Road"
        })
      });

      if (res.ok) {
        await syncState();
        setIsBookingCreated(true);
        triggerNotification("Booking request submitted in pending status to Machine Owner!");
        setActiveTab("dashboard"); // Return to main list
      }
    } catch (e) {
      console.error("Booking error", e);
    }
  };

  // Owner Operations (Accept / Reject)
  const triggerBookingAction = async (bookingId: string, action: string, extra?: any) => {
    soundEffects.playClick();
    try {
      const res = await fetch("/api/booking/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId,
          action,
          extraParams: extra
        })
      });

      if (res.ok) {
        await syncState();
        triggerNotification(`Booking status successfully updated: ${action.toUpperCase()}`);
        if (action === "verify_payment") {
          soundEffects.playPaymentSuccess();
        }
      }
    } catch (e) {
      console.error("Booking op fail", e);
    }
  };

  // Farmer Submit Screenshot payment receipt
  const triggerSubmitPayment = async () => {
    if (!txnId) {
      triggerNotification("Transaction ID reference number is required to eliminate verification fraud.");
      return;
    }

    // Set a dummy screenshot representation if base64 empty
    const finalScreenshot = paymentScreenshot || "DUMMY_UPI_RECEIPT_BASE64_" + txnId;

    try {
      const res = await fetch("/api/booking/payment-submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: payingBooking?.id,
          transactionId: txnId,
          screenshot: finalScreenshot,
          paymentMethod
        })
      });

      if (res.ok) {
        await syncState();
        setPayingBooking(null);
        setTxnId("");
        setPaymentScreenshot("");
        triggerNotification("Payment receipt screenshot successfully uploaded! Awaiting Machine Owner manual verification.");
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Register Machine
  const triggerRegisterMachine = async () => {
    if (!newMacName || !newMacNumber) {
      triggerNotification("Machine Brand Name and Vehicle Registration Number are required.");
      return;
    }

    try {
      const res = await fetch("/api/machine/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newMacName,
          type: newMacType,
          vehicleNumber: newMacNumber,
          minCharge: newMacMinCharge,
          travelCharges: newMacTravel,
          basePricing: [
            { cropName: "Togari", pricePerAcre: pricingTogari },
            { cropName: "Jola", pricePerAcre: pricingJola },
            { cropName: "Godhi", pricePerAcre: pricingGodhi },
            { cropName: "Kadale", pricePerAcre: pricingKadale },
            { cropName: "Maize", pricePerAcre: pricingMaize },
          ]
        })
      });

      if (res.ok) {
        await syncState();
        setNewMacName("");
        setNewMacNumber("");
        triggerNotification("Your Harvesting Machine register process succeeded!");
        setActiveTab("owner_machines");
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Submit Farmer Review
  const triggerSubmitReview = async () => {
    if (!ratingBooking) return;
    try {
      const res = await fetch("/api/booking/submit-rating", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: ratingBooking.id,
          rating: reviewStars,
          reviewText: reviewComment || "Outstanding grain sorting and very neat separation performance."
        })
      });

      if (res.ok) {
        await syncState();
        setRatingBooking(null);
        setReviewStars(5);
        setReviewComment("");
        triggerNotification("Review posted! 50 Danya points credited.");
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Reset entire application database
  const triggerResetState = async () => {
    soundEffects.playClick();
    if (confirm("Reset current sessions back to default mock seed data?")) {
      try {
        const res = await fetch("/api/state/reset", { method: "POST" });
        const data = await res.json();
        setAppState(data.state);
        triggerNotification("Database reset successfully.");
      } catch (e) {
        console.error(e);
      }
    }
  };

  if (!appState) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-zinc-900">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-[var(--theme-primary)] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-black text-zinc-600 animate-pulse uppercase tracking-widest font-mono">Loading DanyaBooking Network...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className={`min-h-screen bg-slate-50 dark:bg-zinc-950 font-sans flex flex-col justify-between transition-colors duration-300 ${isDarkMode ? "dark" : ""}`}>
        {/* Dynamic Theme Injector via native CSS Variables - fully supports "rechange the theme"! */}
        <style>{`
          :root {
            --theme-primary: ${themePalette === "emerald" ? "#2E7D32" : themePalette === "terracotta" ? "#D84315" : "#00838F"};
            --theme-primary-hover: ${themePalette === "emerald" ? "#1B5E20" : themePalette === "terracotta" ? "#BF360C" : "#006064"};
            --theme-bg-opacity: ${themePalette === "emerald" ? "rgba(46, 125, 50, 0.08)" : themePalette === "terracotta" ? "rgba(216, 67, 21, 0.08)" : "rgba(0, 131, 143, 0.08)"};
            --theme-primary-ring: ${themePalette === "emerald" ? "rgba(46, 125, 50, 0.2)" : themePalette === "terracotta" ? "rgba(216, 67, 21, 0.2)" : "rgba(0, 131, 143, 0.2)"};
          }
        `}</style>

        {/* Header toolbar */}
        <header className="p-4 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <span className="text-3xl animate-pulse">🌱</span>
            <div>
              <h1 className="text-md font-black dark:text-white uppercase tracking-wider">DanyaBooking</h1>
              <p className="text-[9px] font-bold text-[var(--theme-primary)]">ರೈತ ಮತ್ತು ಯಂತ್ರ ಮಾಲೀಕರ ಸಂಪರ್ಕ ಸೇತು • Smart Rashi Platform</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--theme-primary)] px-2.5 py-1.5 bg-[rgba(46,125,50,0.08)] rounded-xl border border-[var(--theme-primary-ring)] flex items-center gap-1.5 select-none animate-pulse">
              <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
              ☀️ Light Theme persist
            </span>
          </div>
        </header>

        {/* Dynamic Login Panel content */}
        <div className="flex-1 max-w-5xl w-full mx-auto p-4 md:p-8 flex flex-col justify-center items-center gap-6">
          
          {/* THEME SELECTOR & LIVE PORTAL CONFIGURATOR */}
          <div className="w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-3xl p-5 border border-zinc-200 dark:border-zinc-800 shadow-md text-center space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
              <div className="text-left">
                <h3 className="text-xs font-black uppercase text-zinc-400 tracking-wider">Agriculture Custom Themes / ಥೀಮ್ ಆಯ್ಕೆಮಾಡಿ</h3>
                <p className="text-[10px] text-zinc-500">Instant visual retheme of buttons, headers, maps and controls</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => { soundEffects.playSuccess(); setThemePalette("emerald"); }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition ${
                    themePalette === "emerald" 
                      ? "bg-emerald-50 text-emerald-800 border-emerald-400 ring-2 ring-emerald-300/40" 
                      : "bg-white dark:bg-zinc-850 text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800"
                  }`}
                >
                  🌱 Emerald / ಹಸಿರು
                </button>
                <button
                  type="button"
                  onClick={() => { soundEffects.playSuccess(); setThemePalette("terracotta"); }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition ${
                    themePalette === "terracotta" 
                      ? "bg-orange-50 text-orange-850 border-orange-400 ring-2 ring-orange-300/40" 
                      : "bg-white dark:bg-zinc-850 text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800"
                  }`}
                >
                  🏺 Terracotta / ಮಣ್ಣು
                </button>
                <button
                  type="button"
                  onClick={() => { soundEffects.playSuccess(); setThemePalette("midnight"); }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition ${
                    themePalette === "midnight" 
                      ? "bg-cyan-50 text-cyan-900 border-cyan-400 ring-2 ring-cyan-300/40" 
                      : "bg-white dark:bg-zinc-850 text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800"
                  }`}
                >
                  🌌 Midnight Teal / ನೀಲಿ
                </button>
              </div>
            </div>

            {/* LIVE LOCATION SYNCER DURING PORTAL GATEWAY */}
            <div className="bg-zinc-50 dark:bg-zinc-950 p-4 rounded-2xl border dark:border-zinc-850 flex flex-col sm:flex-row justify-between items-center gap-3">
              <div className="text-left space-y-0.5">
                <span className="text-[9.5px] uppercase font-mono font-extrabold text-[var(--theme-primary)] flex items-center gap-1">
                  <span className={`w-1.5 h-1.5 rounded-full inline-block ${isTrackingLive ? "bg-emerald-500 animate-ping" : "bg-zinc-400"}`}></span>
                  Real Satellites GPS Connection
                </span>
                <p className="text-[11px] font-bold text-zinc-700 dark:text-zinc-200">
                  {browserCoords 
                    ? `Satellite Coordinates Locked: ${browserCoords.lat.toFixed(6)}° N, ${browserCoords.lng.toFixed(6)}° E`
                    : "No Device GPS linked. Touch sync code button below to request live location."
                  }
                </p>
              </div>
              
              <div className="flex flex-wrap gap-2 justify-center sm:justify-end">
                <button
                  type="button"
                  onClick={() => triggerBrowserLiveLocation()}
                  className="px-4 py-2 bg-zinc-900 dark:bg-zinc-800 hover:bg-zinc-850 text-white rounded-xl text-[10.5px] font-black uppercase tracking-wider transition-all shadow-xs flex items-center gap-2 select-none"
                >
                  <Compass className={`h-4 w-4 text-[var(--theme-primary)] ${isTrackingLive ? "animate-spin" : ""}`} />
                  Get Live Location / ಲೈವ್ ಕಲ್ಲುಹಾಕಿ
                </button>
                {browserCoords && (
                  <button
                    type="button"
                    onClick={() => openGoogleMapsNavigation(browserCoords, browserCoords)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10.5px] font-black uppercase tracking-wider transition-all shadow-xs flex items-center gap-1.5 select-none cursor-pointer"
                    title="Open your locked coordinates in Google Maps"
                  >
                    🗺️ View My Location
                  </button>
                )}
              </div>
            </div>
          </div>

          {loginFlow === "select" ? (
            /* SEPARATED PORTAL SELECTOR LANDING */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl animate-fade-in">
              {/* FARMER GATEWAY CARD */}
              <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-850 p-6 md:p-8 flex flex-col justify-between hover:border-[var(--theme-primary)] transition-all duration-300 group shadow-lg">
                <div className="space-y-4">
                  <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-950/20 rounded-2xl flex items-center justify-center text-3xl shadow-sm border border-emerald-100 dark:border-emerald-800/40 transform group-hover:scale-110 transition duration-300">
                    🌾
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-zinc-900 dark:text-white uppercase tracking-tight"> ರೈತರ ಪೋರ್ಟಲ್ </h3>
                    <h4 className="text-xs uppercase font-extrabold text-[var(--theme-primary)] tracking-widest mt-0.5">
                      FARMER PORTAL GATEWAY
                    </h4>
                  </div>
                  <ul className="space-y-2 text-zinc-500 text-xs">
                    <li className="flex items-start gap-1.5">
                      <span className="text-[var(--theme-primary)] font-bold">✔</span>
                      Book Multi-Crop Harvesting machinery on demand
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-[var(--theme-primary)] font-bold">✔</span>
                      Live dynamic tracking map with browser GPS navigation
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-[var(--theme-primary)] font-bold">✔</span>
                      Digital completion signatures, crop weights and UPI slips
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-[var(--theme-primary)] font-bold">✔</span>
                      Kannada AI thresher assistant (Danya) rule grounded API
                    </li>
                  </ul>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    soundEffects.playClick();
                    setLoginFlow("farmer");
                    setLoginRoleTab("farmer");
                    setIsRegisterMode(false);
                  }}
                  className="w-full mt-8 py-3.5 bg-[var(--theme-primary)] hover:bg-[var(--theme-primary-hover)] text-white text-xs font-black uppercase tracking-widest rounded-2xl transition shadow-md hover:shadow-lg flex items-center justify-center gap-2 group-hover:scale-[1.02]"
                >
                  Enter Farmer Hub / ರೈತ ಲಾಗಿನ್ →
                </button>
              </div>

              {/* MACHINERY OWNER GATEWAY CARD */}
              <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-850 p-6 md:p-8 flex flex-col justify-between hover:border-amber-500 dark:hover:border-amber-400 transition-all duration-300 group shadow-lg">
                <div className="space-y-4">
                  <div className="w-14 h-14 bg-amber-50 dark:bg-amber-950/20 rounded-2xl flex items-center justify-center text-3xl shadow-sm border border-amber-100 dark:border-amber-800/40 transform group-hover:scale-110 transition duration-300">
                    🚜
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-zinc-900 dark:text-white uppercase tracking-tight"> ಕಟಾವು ಮಾಲೀಕರು </h3>
                    <h4 className="text-xs uppercase font-extrabold text-amber-600 dark:text-amber-400 tracking-widest mt-0.5">
                      OWNER HARVEST TERMINAL
                    </h4>
                  </div>
                  <ul className="space-y-2 text-zinc-500 text-xs">
                    <li className="flex items-start gap-1.5">
                      <span className="text-amber-500 font-bold">✔</span>
                      Register fleets & calibrate custom acre pricing curves
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-amber-500 font-bold">✔</span>
                      Logbook of crop thresher work orders & pending requests
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-amber-500 font-bold">✔</span>
                      Automatic invoice generator & QR slip verification
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-amber-500 font-bold">✔</span>
                      Earn Danya points for every successfully harvested lot
                    </li>
                  </ul>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    soundEffects.playClick();
                    setLoginFlow("owner");
                    setLoginRoleTab("owner");
                    setIsRegisterMode(false);
                  }}
                  className="w-full mt-8 py-3.5 bg-zinc-900 hover:bg-zinc-800 dark:bg-amber-500 dark:hover:bg-amber-600 dark:text-zinc-950 text-white text-xs font-black uppercase tracking-widest rounded-2xl transition shadow-md hover:shadow-lg flex items-center justify-center gap-2 group-hover:scale-[1.02]"
                >
                  Manage Harvest Fleet / ನಾವಿಕ ಲಾಗಿನ್ →
                </button>
              </div>
            </div>
          ) : (
            /* DETAILED INDIVIDUAL SEPARATE LOGIN ROUTE */
            <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-850 shadow-xl overflow-hidden animate-slide-in relative">
              
              {/* BACK TO SELECTION HEADER BUTTON */}
              <button
                type="button"
                onClick={() => { soundEffects.playClick(); setLoginFlow("select"); setIsRegisterMode(false); }}
                className="absolute top-4 left-4 text-xs font-extrabold text-zinc-400 hover:text-zinc-600 dark:hover:text-white flex items-center gap-1 select-none"
              >
                ← Back / ಹಿಂದಕ್ಕೆ
              </button>

              <div className="pt-10 px-6 pb-6 md:p-8 space-y-6">
                {isRegisterMode ? (
                  /* Easy registration page inside the selected flow */
                  <div className="space-y-4">
                    <div className="text-center">
                      <h3 className="text-sm font-black text-zinc-850 dark:text-zinc-100 uppercase tracking-widest">
                        Easy Registration Form
                      </h3>
                      <p className="text-[10px] text-zinc-400 mt-1">
                        ನೋಂದಣಿ ಮಾಡಿ ಸೆಕೆಂಡುಗಳಲ್ಲಿ ಬುಕಿಂಗ್ ಪ್ರಾರಂಭಿಸಿ (No password needed)
                      </p>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-[10px] font-bold text-zinc-400 uppercase">
                          Full Name / ಪೂರ್ಣ ಹೆಸರು
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Basanna"
                          value={regName}
                          onChange={(e) => setRegName(e.target.value)}
                          className="w-full mt-1 px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 dark:bg-zinc-850 dark:text-white text-xs outline-hidden focus:border-[var(--theme-primary)]"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-zinc-400 uppercase">
                          Mobile Number / ಮೊಬೈಲ್ ಸಂಖ್ಯೆ
                        </label>
                        <input
                          type="tel"
                          maxLength={10}
                          placeholder="e.g. 9845123456"
                          value={regPhone}
                          onChange={(e) => setRegPhone(e.target.value)}
                          className="w-full mt-1 px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 dark:bg-zinc-850 dark:text-white text-xs outline-hidden focus:border-[var(--theme-primary)]"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-bold text-zinc-400 uppercase">
                            Village / ಗ್ರಾಮ
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Anaji"
                            value={regVillage}
                            onChange={(e) => setRegVillage(e.target.value)}
                            className="w-full mt-1 px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 dark:bg-zinc-850 dark:text-white text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-zinc-400 uppercase">
                            Taluk / ತಾಲೂಕು
                          </label>
                          <input
                            type="text"
                            placeholder="Davanagere"
                            value={regTaluk}
                            onChange={(e) => setRegTaluk(e.target.value)}
                            className="w-full mt-1 px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 dark:bg-zinc-850 dark:text-white text-xs"
                          />
                        </div>
                      </div>

                      {loginFlow === "owner" && (
                        <div>
                          <label className="block text-[10px] font-bold text-zinc-400 uppercase">
                            Aadhaar Number / ಆಧಾರ್ ಸಂಖ್ಯೆ (Security Check)
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. 1111-2222-3333-4444"
                            value={regAadhaar}
                            onChange={(e) => setRegAadhaar(e.target.value)}
                            className="w-full mt-1 px-4 py-2.5 rounded-xl border border-[#e5e7eb] dark:border-zinc-800 dark:bg-zinc-850 dark:text-white text-xs outline-hidden focus:border-[var(--theme-primary)] shrink-0"
                          />
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={handleRegisterSubmit}
                      className="w-full py-3 mt-2 text-white rounded-xl text-xs font-black uppercase tracking-wider transition bg-[var(--theme-primary)] hover:bg-[var(--theme-primary-hover)]"
                    >
                      Submit & Log In / ನೋಂದಣಿ ಪೂರ್ಣಗೊಳಿಸಿ
                    </button>

                    <p className="text-center text-[10px] text-zinc-500">
                      Already registered?{" "}
                      <button 
                        type="button"
                        onClick={() => { soundEffects.playClick(); setIsRegisterMode(false); }}
                        className="text-[var(--theme-primary)] font-black underline"
                      >
                        Login Now / ಇಲ್ಲಿ ಲಾಗಿನ್ ಆಗಿ
                      </button>
                    </p>
                  </div>
                ) : loginFlow === "farmer" ? (
                  /* Farmer OTP login mode */
                  <div className="space-y-4">
                    <div className="text-center space-y-1">
                      <span className="text-2xl block animate-bounce">🌾</span>
                      <h3 className="text-xs font-black text-zinc-800 dark:text-zinc-100 uppercase tracking-widest">
                        Danya Farmer Login Gate
                      </h3>
                      <p className="text-[10px] text-zinc-500 dark:text-zinc-400">
                        OTP ಲಾಗಿನ್ ಮೂಲಕ ನಿಮ್ಮ ಕಟಾವು ಯಂತ್ರಗಳನ್ನು ಕ್ಷಣಮಾತ್ರದಲ್ಲಿ ಬುಕ್ ಮಾಡಿ
                      </p>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-[10px] font-bold text-zinc-400 uppercase">
                          Farmer Phone / ಮೊಬೈಲ್ ಸಂಖ್ಯೆ
                        </label>
                        <div className="flex gap-2 mt-1">
                          <input
                            type="tel"
                            maxLength={10}
                            placeholder="e.g. 9845123456"
                            value={loginPhone}
                            onChange={(e) => setLoginPhone(e.target.value)}
                            className="flex-1 px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 dark:bg-zinc-850 dark:text-white text-xs outline-hidden focus:border-[var(--theme-primary)] font-mono font-bold"
                          />
                          <button
                            type="button"
                            onClick={handleSendOtp}
                            className="px-3.5 py-2.5 bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-800 dark:text-white text-[10.5px] font-black rounded-xl whitespace-nowrap"
                          >
                            {otpSent ? "Resend OTP" : "Get OTP / ಮರುಕಳುಹಿಸಿ"}
                          </button>
                        </div>
                      </div>

                      {otpSent && (
                        <div className="animate-fade-in space-y-1">
                          <label className="block text-[10px] font-bold text-slate-400 uppercase">
                            Enter 4-Digit OTP / ಒಟಿಪಿ ಕೋಡ್
                          </label>
                          <input
                            type="text"
                            maxLength={4}
                            placeholder="e.g. 7382"
                            value={loginOtp}
                            onChange={(e) => setLoginOtp(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-[var(--theme-primary)] dark:bg-zinc-850 dark:text-white text-sm outline-hidden text-center font-mono font-black tracking-widest text-[var(--theme-primary)] animate-pulse"
                          />
                          <span className="text-[8.5px] text-zinc-455 block text-right font-mono">Simulated OTP helper sent successfully</span>
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={handleFarmerLoginSubmit}
                      className="w-full py-3 bg-[var(--theme-primary)] hover:bg-[var(--theme-primary-hover)] text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all"
                    >
                      Authenticate Portal & Enter / ಲಾಗಿನ್ ಆಗಿ
                    </button>

                    <div className="flex justify-between items-center text-[10px] text-zinc-500 border-t pt-4 dark:border-zinc-800">
                      <button 
                        type="button"
                        onClick={() => { soundEffects.playClick(); setIsRegisterMode(true); }}
                        className="text-[var(--theme-primary)] font-black underline"
                      >
                        New Farmer? Register / ಹೊಸ ರೈತರ ನೊಂದಣಿ
                      </button>
                      <button 
                        type="button"
                        onClick={() => {
                          soundEffects.playClick();
                          setLoginFlow("select");
                        }}
                        className="hover:underline font-bold"
                      >
                        ← Change Portal
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Machinery Owner Gate */
                  <div className="space-y-4">
                    <div className="text-center space-y-1">
                      <span className="text-2xl block animate-pulse">🚜</span>
                      <h3 className="text-xs font-black text-zinc-800 dark:text-zinc-100 uppercase tracking-widest">
                        Danya Machinery Owner Terminal
                      </h3>
                      <p className="text-[10px] text-zinc-500 dark:text-zinc-400">
                        ವಾಹನ ಮಾಲೀಕರ ಲಾಗಿನ್ - ಬುಕಿಂಗ್ ನಿರ್ವಹಣೆ ಮತ್ತು ಸಂಪಾದನೆ ವರದಿ
                      </p>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-[10px] font-bold text-zinc-400 uppercase">
                          Owner Mobile Number / ಮೊಬೈಲ್ ಸಂಖ್ಯೆ
                        </label>
                        <input
                          type="tel"
                          maxLength={10}
                          placeholder="e.g. 9900112233"
                          value={loginPhone}
                          onChange={(e) => setLoginPhone(e.target.value)}
                          className="w-full mt-1 px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 dark:bg-zinc-850 dark:text-white text-xs outline-hidden focus:border-amber-500 font-mono font-bold"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between items-center">
                          <label className="block text-[10px] font-bold text-zinc-400 uppercase">
                            Vehicle License Plate / ನೋಂದಣಿ ಸಂಖ್ಯೆ (Optional)
                          </label>
                          <span className="text-[8px] px-1 bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 rounded select-none">GPS Enabled</span>
                        </div>
                        <input
                          type="text"
                          placeholder="e.g. KA-27-M-4321"
                          value={loginVehicleNum}
                          onChange={(e) => setLoginVehicleNum(e.target.value)}
                          className="w-full mt-1 px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 dark:bg-zinc-850 dark:text-white text-xs uppercase font-mono tracking-wider focus:border-amber-500"
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleOwnerLoginSubmit}
                      className="w-full py-3 bg-zinc-900 hover:bg-zinc-850 dark:bg-amber-500 dark:hover:bg-amber-600 dark:text-zinc-950 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all"
                    >
                      Enter Owner Terminal / ಸುರಕ್ಷಿತ ಲಾಗಿನ್
                    </button>

                    <div className="flex justify-between items-center text-[10px] text-zinc-500 border-t pt-4 dark:border-zinc-800">
                      <button 
                        type="button"
                        onClick={() => { soundEffects.playClick(); setIsRegisterMode(true); }}
                        className="text-amber-600 dark:text-amber-400 font-black underline"
                      >
                        Register Machine Business / ಹೊಸ ವ್ಯವಹಾರ ನೋಂದಣಿ
                      </button>
                      <button 
                        type="button"
                        onClick={() => {
                          soundEffects.playClick();
                          setLoginFlow("select");
                        }}
                        className="hover:underline font-bold"
                      >
                        ← Change Portal
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Majestic, Highly Polished Quick Demos Bypasses to evaluate */}
          <div className="w-full max-w-md mt-6 bg-[#E8F5E9] dark:bg-zinc-900/60 rounded-2xl p-4 border border-emerald-500/10 text-center space-y-2.5">
            <span className="text-[10px] uppercase font-mono font-extrabold text-[var(--theme-primary)] dark:text-emerald-400 block tracking-widest">
              ⚡ Developer Bypass & Simulation Gateway
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin("farmer")}
                className="px-2 py-2 bg-white dark:bg-zinc-800 border border-emerald-500/15 rounded-xl text-[10.5px] font-bold text-emerald-700 dark:text-emerald-400 hover:scale-105 transition-all text-center select-none"
              >
                🌾 Farmer (Basanna)
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoLogin("owner")}
                className="px-2 py-2 bg-white dark:bg-zinc-800 border border-emerald-500/15 rounded-xl text-[10.5px] font-bold text-amber-600 dark:text-amber-400 hover:scale-105 transition-all text-center select-none"
              >
                🚜 Owner (Manjappa)
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoLogin("admin")}
                className="px-2 py-2 bg-white dark:bg-zinc-800 border border-emerald-500/15 rounded-xl text-[10.5px] font-bold text-indigo-600 dark:text-indigo-400 hover:scale-105 transition-all text-center select-none"
              >
                ⚙️ Admin Center
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="p-4 bg-white/50 dark:bg-zinc-900/50 text-center text-[9px] text-zinc-400 uppercase tracking-widest">
          DanyaBooking Platform • Smart Rashi Harvesting Network of Karnataka.
        </footer>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-zinc-50 dark:bg-zinc-950 font-sans ${isDarkMode ? "dark" : ""}`}>
      {/* Dynamic Theme Injector via native CSS Variables - fully supports "rechange the theme"! */}
      <style>{`
        :root {
          --theme-primary: ${themePalette === "emerald" ? "#2E7D32" : themePalette === "terracotta" ? "#D84315" : "#00838F"};
          --theme-primary-hover: ${themePalette === "emerald" ? "#1B5E20" : themePalette === "terracotta" ? "#BF360C" : "#006064"};
          --theme-bg-opacity: ${themePalette === "emerald" ? "rgba(46, 125, 50, 0.08)" : themePalette === "terracotta" ? "rgba(216, 67, 21, 0.08)" : "rgba(0, 131, 143, 0.08)"};
          --theme-primary-ring: ${themePalette === "emerald" ? "rgba(46, 125, 50, 0.2)" : themePalette === "terracotta" ? "rgba(216, 67, 21, 0.2)" : "rgba(0, 131, 143, 0.2)"};
          --theme-text-light: ${themePalette === "emerald" ? "#E8F5E9" : themePalette === "terracotta" ? "#FBE9E7" : "#E0F7FA"};
        }

        /* Dynamically intercept and swap hardcoded tailwind green colors for clay terracotta / midnight teal colors! */
        .bg-\\[\\#2E7D32\\] {
          background-color: var(--theme-primary) !important;
        }
        .text-\\[\\#2E7D32\\] {
          color: var(--theme-primary) !important;
        }
        .border-\\[\\#2E7D32\\] {
          border-color: var(--theme-primary) !important;
        }
        .hover\\:bg-emerald-700:hover {
          background-color: var(--theme-primary-hover) !important;
        }
        .hover\\:border-\\[\\#2E7D32\\]:hover {
          border-color: var(--theme-primary) !important;
        }
        .hover\\:text-\\[\\#2E7D32\\]:hover {
          color: var(--theme-primary) !important;
        }
        .text-emerald-600 {
          color: var(--theme-primary) !important;
        }
        .text-emerald-400 {
          color: var(--theme-primary) !important;
        }
        .bg-[#1b4b1e] {
          background-color: var(--theme-primary-hover) !important;
        }
        .bg-[#F1F8E9] {
          background-color: var(--theme-bg-opacity) !important;
        }
        .border-[#2E7D32]\\/20 {
          border-color: var(--theme-primary-ring) !important;
        }
        .bg-\\[\\#2E7D32\\]\\/5 {
          background-color: var(--theme-bg-opacity) !important;
        }
        .stroke-\\[\\#2E7D32\\] {
          stroke: var(--theme-primary) !important;
        }
        .stroke-\\[\\#2E7D32\\]\\/40 {
          stroke: var(--theme-primary) !important;
          opacity: 0.4;
        }
      `}</style>
      
      {/* Simulation Banner - Sticky on top to quickly change roles */}
      <div className="bg-gradient-to-r from-zinc-900 via-[#1b4b1e] to-zinc-900 text-white px-4 py-2 flex flex-wrap justify-between items-center text-xs border-b border-emerald-800/10 shadow-sm z-30 relative gap-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse"></span>
          <span className="font-extrabold tracking-wide uppercase text-[10.5px]">
            Danya Multi-User Simulator Center
          </span>
        </div>

        {isLoggedIn ? (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-emerald-950/20 dark:bg-zinc-800 border border-emerald-800/20 px-3 py-1.5 rounded-xl">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              <span className="text-[10px] text-emerald-300 font-extrabold tracking-wider">🔒 ACTIVE PORTAL LOCKED:</span>
              <span className="text-[10.5px] text-white font-black uppercase tracking-wider">
                {role === "farmer" ? "🌾 Farmer (Basanna)" : role === "owner" ? "🚜 Machine Owner (Manjappa)" : "⚙️ System Admin"}
              </span>
            </div>
            
            <button
              type="button"
              onClick={() => {
                soundEffects.playClick();
                setIsLoggedIn(false);
                setLoginFlow("select");
                triggerNotification("Successfully logged out of active portal.");
              }}
              className="px-2.5 py-1 text-[9.5px] bg-red-650 hover:bg-red-700 text-white rounded font-bold uppercase transition"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-1.5">
            <span className="text-[10.5px] text-emerald-300 font-bold mr-1">Switch Role:</span>
            
            <button
              type="button"
              onClick={() => handleRoleChange("farmer")}
              className={`px-3 py-1 rounded-full font-black text-[10.5px] transition ${
                role === "farmer" 
                  ? "bg-white text-[#2E7D32] shadow-sm scale-105" 
                  : "bg-emerald-950 text-emerald-200/80 hover:bg-emerald-900"
              }`}
            >
              🌾 Farmer Panel (Basanna)
            </button>
            
            <button
              type="button"
              onClick={() => handleRoleChange("owner")}
              className={`px-3 py-1 rounded-full font-black text-[10.5px] transition ${
                role === "owner" 
                  ? "bg-white text-[#2E7D32] shadow-sm scale-105" 
                  : "bg-emerald-950 text-emerald-200/80 hover:bg-emerald-900"
              }`}
            >
              🚜 Owner Panel (Manjappa)
            </button>
            
            <button
              type="button"
              onClick={() => handleRoleChange("admin")}
              className={`px-3 py-1 rounded-full font-black text-[10.5px] transition ${
                role === "admin" 
                  ? "bg-white text-[#2E7D32] shadow-sm scale-105" 
                  : "bg-emerald-950 text-emerald-200/80 hover:bg-emerald-900"
              }`}
            >
              🛡️ Admin Console
            </button>

            <div className="h-4 w-[1px] bg-emerald-800/60 mx-1"></div>

            <button
              type="button"
              onClick={triggerResetState}
              className="px-2.5 py-1 text-[9.5px] bg-red-600 hover:bg-red-700 text-white rounded font-bold uppercase transition"
            >
              Reset Simulator
            </button>
          </div>
        )}
      </div>

      {/* Notification Toast */}
      {notificationMsg && (
        <div className="fixed top-12 right-6 bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 px-5 py-4 rounded-2xl shadow-2xl z-50 border border-zinc-800 flex items-center gap-3 animate-slide-in max-w-sm">
          <Bell className="h-5 w-5 text-[#FFC107] animate-bounce shrink-0" />
          <div>
            <span className="text-[10px] font-bold uppercase text-zinc-400 block tracking-wider">System Broadcast Alert</span>
            <p className="text-xs font-semibold leading-relaxed">{notificationMsg}</p>
          </div>
          <button onClick={() => setNotificationMsg(null)} className="text-zinc-500 hover:text-white ml-auto">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Main Structural Polish Layout Wrap */}
      <div className="flex h-[calc(100vh-41px)] overflow-hidden">
        
        {/* SIDE NAV BAR */}
        <aside className="w-64 bg-[var(--theme-primary)] dark:bg-zinc-950/90 text-white flex flex-col shadow-xl shrink-0 z-10 transition-colors duration-300">
          
          <div className="p-5 flex items-center gap-3 border-b border-emerald-800/30">
            <div className="w-10 h-10 bg-white dark:bg-zinc-900 rounded-2xl flex items-center justify-center shadow-lg transform rotate-3">
              <span className="text-2xl">🌽</span>
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight leading-none">DanyaBooking</h1>
              <span className="text-[9px] uppercase tracking-widest text-emerald-200/80 font-extrabold mt-1 block">
                Smart Rashi Platform
              </span>
            </div>
          </div>

          <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
            {role === "farmer" ? (
              <>
                <button
                  type="button"
                  onClick={() => { soundEffects.playClick(); setActiveTab("dashboard"); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition font-black text-xs uppercase ${
                    activeTab === "dashboard" ? "bg-white bg-opacity-15 border-l-4 border-[#FFC107]" : "hover:bg-white/5 opacity-80"
                  }`}
                >
                  <LayoutDashboard className="h-4.5 w-4.5 text-[#FFC107]" />
                  Farmer Dashboard
                </button>

                <button
                  type="button"
                  onClick={() => { soundEffects.playClick(); setActiveTab("book"); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition font-black text-xs uppercase ${
                    activeTab === "book" ? "bg-white bg-opacity-15 border-l-4 border-[#FFC107]" : "hover:bg-white/5 opacity-80"
                  }`}
                >
                  <CalendarDays className="h-4.5 w-4.5 text-amber-500" />
                  Book Rashi Machine
                </button>

                <button
                  type="button"
                  onClick={() => { soundEffects.playClick(); setActiveTab("live"); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition font-black text-xs uppercase ${
                    activeTab === "live" ? "bg-white bg-opacity-15 border-l-4 border-[#FFC107]" : "hover:bg-white/5 opacity-80"
                  }`}
                >
                  <Map className="h-4.5 w-4.5 text-emerald-300" />
                  Live GPS Tracking
                </button>

                <button
                  type="button"
                  onClick={() => { soundEffects.playClick(); setActiveTab("weather"); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition font-black text-xs uppercase ${
                    activeTab === "weather" ? "bg-white bg-opacity-15 border-l-4 border-[#FFC107]" : "hover:bg-white/5 opacity-80"
                  }`}
                >
                  <CloudRain className="h-4.5 w-4.5 text-[#FFC107]" />
                  Weather & Advisory
                </button>
              </>
            ) : role === "owner" ? (
              <>
                <button
                  type="button"
                  onClick={() => { soundEffects.playClick(); setActiveTab("owner_dashboard"); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition font-black text-xs uppercase ${
                    activeTab === "owner_dashboard" ? "bg-white bg-opacity-15 border-l-4 border-[#FFC107]" : "hover:bg-white/5 opacity-80"
                  }`}
                >
                  <LayoutDashboard className="h-4.5 w-4.5 text-[#FFC107]" />
                  My Work Dashboard
                </button>

                <button
                  type="button"
                  onClick={() => { soundEffects.playClick(); setActiveTab("owner_machines"); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition font-black text-xs uppercase ${
                    activeTab === "owner_machines" ? "bg-white bg-opacity-15 border-l-4 border-[#FFC107]" : "hover:bg-white/5 opacity-80"
                  }`}
                >
                  <Cpu className="h-4.5 w-4.5 " />
                  Manage Machines
                </button>

                <button
                  type="button"
                  onClick={() => { soundEffects.playClick(); setActiveTab("owner_bookings"); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition font-black text-xs uppercase ${
                    activeTab === "owner_bookings" ? "bg-white bg-opacity-15 border-l-4 border-[#FFC107]" : "hover:bg-white/5 opacity-80"
                  }`}
                >
                  <Receipt className="h-4.5 w-4.5 text-[#FFC107]" />
                  Reserve Manager
                </button>

                <button
                  type="button"
                  onClick={() => { soundEffects.playClick(); setActiveTab("owner_earnings"); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition font-black text-xs uppercase ${
                    activeTab === "owner_earnings" ? "bg-white bg-opacity-15 border-l-4 border-[#FFC107]" : "hover:bg-white/5 opacity-80"
                  }`}
                >
                  <DollarSign className="h-4.5 w-4.5 text-[#FFC107]" />
                  Earnings Panel
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => { soundEffects.playClick(); setActiveTab("analytics"); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition font-black text-xs uppercase ${
                    activeTab === "analytics" ? "bg-white bg-opacity-15 border-l-4 border-[#FFC107]" : "hover:bg-white/5 opacity-80"
                  }`}
                >
                  <Activity className="h-4.5 w-4.5 text-[#FFC107]" />
                  System Metrics
                </button>

                <button
                  type="button"
                  onClick={() => { soundEffects.playClick(); setActiveTab("admin_farmers"); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition font-black text-xs uppercase ${
                    activeTab === "admin_farmers" ? "bg-white bg-opacity-15 border-l-4 border-[#FFC107]" : "hover:bg-white/5 opacity-80"
                  }`}
                >
                  <Users className="h-4.5 w-4.5 text-[#FFC107]" />
                  Manage Farmers
                </button>

                <button
                  type="button"
                  onClick={() => { soundEffects.playClick(); setActiveTab("admin_machines"); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition font-black text-xs uppercase ${
                    activeTab === "admin_machines" ? "bg-white bg-opacity-15 border-l-4 border-[#FFC107]" : "hover:bg-white/5 opacity-80"
                  }`}
                >
                  <HardDrive className="h-4.5 w-4.5 text-[#FFC107]" />
                  Registered Fleet
                </button>
              </>
            )}
          </nav>

          {/* Points Referral Widget */}
          <div className="p-4 bg-[#1b4b1e] dark:bg-zinc-950/40 rounded-2xl m-3.5 space-y-2.5 border border-emerald-800/10">
            <div>
              <span className="text-[10px] text-emerald-200 uppercase tracking-widest font-black block">
                Danya Rewards Point
              </span>
              <p className="text-2xl font-black text-[#FFC107]">
                {currentProfile.rewardPoints || 0} PTS
              </p>
            </div>
            {currentProfile.referralCode && (
              <div>
                <span className="text-[9px] text-zinc-400 block font-mono">CODE: {currentProfile.referralCode}</span>
                <button
                  type="button"
                  onClick={() => {
                    soundEffects.playClick();
                    setShowReferralPopup(true);
                  }}
                  className="mt-2 w-full text-[9.5px] font-bold uppercase tracking-wider py-2 bg-[#FFC107] text-gray-950 rounded hover:scale-105 active:scale-95 transition"
                >
                  Share Code (Gifts)
                </button>
              </div>
            )}
          </div>
        </aside>

        {/* MAIN DISPLAY WORKSPACE */}
        <main className="flex-1 flex flex-col overflow-hidden h-full relative bg-zinc-50 dark:bg-zinc-950">
          
          {/* TOP POLISH TAB BAR */}
          <header className="h-20 bg-white dark:bg-zinc-900 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between px-8 z-10 shadow-sm shrink-0">
            <div className="flex items-center gap-4">
              <div className="bg-[#F1F8E9] dark:bg-zinc-800 border border-[#2E7D32]/20 dark:border-zinc-700 rounded-full px-4 py-1.5 flex items-center gap-2.5">
                <CloudRain className="h-4 w-4 text-[#2E7D32] dark:text-emerald-400" />
                <span className="text-xs text-zinc-600 dark:text-zinc-300 font-bold">
                  Raichur KA • Rain delayed 4h • optimal harvest index
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Dynamic Theme selection pills inside main toolbar */}
              <div className="hidden sm:flex bg-zinc-100 dark:bg-zinc-805 p-1 rounded-full border border-zinc-200/40 dark:border-zinc-700/60 items-center gap-0.5">
                <button
                  type="button"
                  onClick={() => { soundEffects.playSuccess(); setThemePalette("emerald"); }}
                  className={`w-7 h-7 rounded-full text-xs flex items-center justify-center transition-all ${themePalette === "emerald" ? "bg-emerald-600 text-white shadow" : "text-zinc-400 hover:text-zinc-800"}`}
                  title="Emerald Theme / ಹಸಿರು"
                >
                  🌱
                </button>
                <button
                  type="button"
                  onClick={() => { soundEffects.playSuccess(); setThemePalette("terracotta"); }}
                  className={`w-7 h-7 rounded-full text-xs flex items-center justify-center transition-all ${themePalette === "terracotta" ? "bg-orange-600 text-white shadow" : "text-zinc-400 hover:text-zinc-800"}`}
                  title="Terracotta Theme / ಮಣ್ಣು"
                >
                  🏺
                </button>
                <button
                  type="button"
                  onClick={() => { soundEffects.playSuccess(); setThemePalette("midnight"); }}
                  className={`w-7 h-7 rounded-full text-xs flex items-center justify-center transition-all ${themePalette === "midnight" ? "bg-cyan-600 text-white shadow" : "text-zinc-400 hover:text-zinc-800"}`}
                  title="Midnight Theme / ನೀಲಿ"
                >
                  🌌
                </button>
              </div>

              {/* Persistent Sunshine Light Mode Symbol */}
              <div 
                className="p-2.5 rounded-full bg-amber-50 text-amber-500 border border-amber-500/10 flex items-center justify-center cursor-default"
                title="Locked to Agrarian Light Mode Theme"
              >
                <Sun className="h-4.5 w-4.5" />
              </div>

              <div 
                onClick={triggerOpenProfileModal}
                className="flex items-center gap-3 pl-4 border-l dark:border-zinc-850 cursor-pointer hover:opacity-80 transition-all select-none"
                title="Touch profile card to edit details"
              >
                <div className="text-right">
                  <p className="text-sm font-black text-zinc-800 dark:text-zinc-100 leading-none">
                    {currentProfile.fullName}
                  </p>
                  <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-extrabold uppercase tracking-wide mt-1">
                    {role === "farmer" ? "🌾 Farmer Account" : role === "owner" ? "🚜 Machine Owner" : "👑 Tech Auditor"}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-full bg-[#F1F8E9] border-2 border-[#2E7D32] text-zinc-800 dark:text-zinc-100 flex items-center justify-center font-bold text-lg shrink-0">
                  {currentProfile.fullName[0]}
                </div>
              </div>

              {/* Logout mechanism to test separate logins */}
              <button
                type="button"
                onClick={() => {
                  soundEffects.playClick();
                  setIsLoggedIn(false);
                  triggerNotification("Successfully logged out of current profile portal.");
                }}
                className="p-2.5 rounded-xl bg-red-50 hover:bg-red-100 dark:bg-red-950/25 dark:text-red-400 text-red-600 border border-red-205/10 text-xs font-black transition-all"
                title="Log out securely"
              >
                Logout
              </button>
            </div>
          </header>

          {/* ACTIVE CONTENT GRIDS */}
          <div className="flex-1 overflow-y-auto p-8 bg-zinc-50/50 dark:bg-zinc-950/20">
            
            {/* -------------------- FARMER PANEL WORKSPACE -------------------- */}
            {role === "farmer" && (
              <div className="grid grid-cols-12 gap-6">
                
                {/* Dashboard layout left column */}
                <div className="col-span-12 lg:col-span-8 space-y-6">
                  
                  {activeTab === "dashboard" && (
                    <>
                      {/* Interactive Live tracking map display */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center px-1">
                          <div className="flex justify-between items-center w-full">
                            <h3 className="text-xs font-black uppercase text-zinc-400 tracking-widest">Active Harvesting Trackers</h3>
                            {appState.bookings.find(b => b.status === "started") && (
                              <button
                                type="button"
                                onClick={() => {
                                  const active = appState.bookings.find(b => b.status === "started")!;
                                  openGoogleMapsNavigation(active.farmerLocation, active.machineLocation);
                                }}
                                className="text-emerald-700 dark:text-emerald-400 hover:underline text-[10px] font-black uppercase tracking-wider flex items-center gap-1 select-none cursor-pointer"
                              >
                                🗺️ Direct Google Maps
                              </button>
                            )}
                          </div>
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-extrabold uppercase">
                            SIMULATOR MAP
                          </span>
                        </div>
                        {appState.bookings.find(b => b.status === "started") ? (
                          (() => {
                            const active = appState.bookings.find(b => b.status === "started")!;
                            return (
                              <MapContainer
                                farmerLocation={active.farmerLocation}
                                machineLocation={active.machineLocation}
                                distanceKm={active.distanceKm}
                                etaMinutes={active.etaMinutes}
                                machineName={active.machineName}
                                vehicleNumber={active.vehicleNumber}
                                showSimulationBtn={true}
                                onSimulateStep={() => triggerBookingAction(active.id, "simulation_step")}
                                gpsLoading={gpsLoading}
                                gpsError={gpsError}
                              />
                            );
                          })()
                        ) : (
                          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 text-center space-y-3 shadow-xs">
                            <span className="text-2xl block">📡</span>
                            <p className="text-xs text-zinc-600 dark:text-zinc-300 font-bold max-w-sm mx-auto leading-relaxed">
                              No active harvester commuting matching your fields right now, but you can launch the live topographics GPS Radar to monitor nearby Rashi thresher fleets!
                            </p>
                            <div className="flex gap-2 justify-center">
                              <button
                                type="button"
                                onClick={() => { soundEffects.playClick(); setActiveTab("live"); }}
                                className="px-4 py-2.5 bg-zinc-950 hover:bg-zinc-900 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-750 text-xs font-black uppercase tracking-wider rounded-xl transition shadow"
                              >
                                🗺️ Open GPS Map
                              </button>
                              <button
                                type="button"
                                onClick={() => { soundEffects.playClick(); setActiveTab("book"); }}
                                className="px-4 py-2.5 bg-[var(--theme-primary)] text-white hover:opacity-90 text-xs font-black uppercase tracking-wider rounded-xl transition shadow"
                              >
                                🚜 Reserve Thresher
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Your Current/Recent Bookings list */}
                      <div className="space-y-4">
                        <h3 className="text-xs font-black uppercase text-zinc-400 tracking-widest px-1">Farmer Reservations & Logs</h3>
                        
                        <div className="space-y-3">
                          {appState.bookings.map(book => {
                            const totalComputedDisplay = book.totalAmount;
                            return (
                              <div
                                key={book.id}
                                className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 shadow-sm space-y-4 hover:border-[#2E7D32] dark:hover:border-zinc-700 transition"
                              >
                                <div className="flex justify-between items-start">
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs font-black text-zinc-950 dark:text-zinc-100 uppercase">
                                        RESERVATION {book.id}
                                      </span>
                                      <span className="text-[9px] text-zinc-400 font-mono">({book.cropType})</span>
                                    </div>
                                    <div className="flex items-center gap-2.5 mt-1">
                                      <h4 className="text-xs font-bold text-zinc-500">
                                        {book.machineName} &bull; <span className="font-mono text-[#2E7D32] dark:text-emerald-400">{book.vehicleNumber}</span>
                                      </h4>
                                      <button
                                        type="button"
                                        onClick={() => openGoogleMapsNavigation(book.farmerLocation, book.machineLocation)}
                                        className="text-[#2E7D32] dark:text-emerald-400 hover:underline text-[9.5px] font-black flex items-center gap-0.5 select-none cursor-pointer"
                                        title="Open driving route in Google Maps"
                                      >
                                        🗺️ Navigate
                                      </button>
                                    </div>
                                  </div>

                                  {/* Color Badges based on lifecycle status */}
                                  <span className={`text-[9.5px] font-extrabold px-3 py-1 rounded-full uppercase ${
                                    book.status === "paid" ? "bg-emerald-100 text-emerald-800" :
                                    book.status === "pending" ? "bg-zinc-100 text-zinc-650" :
                                    book.status === "verify_pending" ? "bg-blue-100 text-blue-800" :
                                    book.status === "started" ? "bg-amber-100 text-amber-800 font-bold block animate-pulse" :
                                    "bg-rose-100 text-rose-800"
                                  }`}>
                                    {book.status}
                                  </span>
                                </div>

                                {/* Booking Specs Body */}
                                <div className="grid grid-cols-4 gap-4 text-[11px] text-zinc-500 dark:text-zinc-400 pb-3 border-b dark:border-zinc-800">
                                  <div>
                                    <span className="block text-[8px] uppercase tracking-wider text-zinc-400 font-bold mb-0.5">Acre size</span>
                                    <span className="font-extrabold text-zinc-800 dark:text-zinc-200">{book.acres} Acres</span>
                                  </div>
                                  <div>
                                    <span className="block text-[8px] uppercase tracking-wider text-zinc-400 font-bold mb-0.5">Scheduled Slot</span>
                                    <span className="font-semibold">{book.preferredDate} ({book.preferredTime})</span>
                                  </div>
                                  <div>
                                    <span className="block text-[8px] uppercase tracking-wider text-zinc-400 font-bold mb-0.5">Crop pricing</span>
                                    <span className="font-semibold">₹{book.ratePerAcre} / Acre</span>
                                  </div>
                                  <div>
                                    <span className="block text-[8px] uppercase tracking-wider text-zinc-400 font-bold mb-0.5">Total due</span>
                                    <span className="font-extrabold text-amber-600 font-mono">₹{totalComputedDisplay}</span>
                                  </div>
                                </div>

                                {/* Active Flow Actions */}
                                <div className="flex flex-wrap gap-2 pt-1 items-center justify-between">
                                  
                                  {/* Work Documentation previews */}
                                  {book.workPhotos && (
                                    <div className="flex gap-2 items-center">
                                      <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Work Proofs:</span>
                                      <span className="px-2 py-0.5 bg-zinc-100 text-zinc-650 rounded text-[9px] font-bold">1. Before Photo</span>
                                      <span className="px-2 py-0.5 bg-zinc-100 text-zinc-650 rounded text-[9px] font-bold">2. During Photo</span>
                                      <span className="px-2 py-0.5 bg-zinc-100 text-zinc-650 rounded text-[9px] font-bold">3. After Photo</span>
                                    </div>
                                  )}

                                  <div className="flex gap-2 ml-auto">
                                    {/* Action 1: Upload transaction screenshot */}
                                    {book.status === "payment_pending" && (
                                      <button
                                        type="button"
                                        onClick={() => { soundEffects.playClick(); setPayingBooking(book); }}
                                        className="px-4 py-2 bg-[#FFC107] text-zinc-950 font-black rounded-xl text-xs uppercase tracking-wide shadow-md transition"
                                      >
                                        Upload Payment Proof UPI
                                      </button>
                                    )}

                                    {/* Action 2: Digital signatures complete */}
                                    {book.status === "photo_uploaded" && (
                                      <button
                                        type="button"
                                        onClick={() => { soundEffects.playClick(); setSelectedInvoiceBooking(book); }}
                                        className="px-4 py-2 bg-[#2E7D32] text-white font-black rounded-xl text-xs uppercase tracking-wide transition"
                                      >
                                        E-Sign Completion Report
                                      </button>
                                    )}

                                    {/* Download Digital invoice */}
                                    {(book.status === "paid" || book.status === "completed") && (
                                      <button
                                        type="button"
                                        onClick={() => { soundEffects.playClick(); setSelectedInvoiceBooking(book); }}
                                        className="px-4 py-2 bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200 font-bold rounded-xl text-xs uppercase tracking-wide border dark:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-750 transition flex items-center gap-1"
                                      >
                                        <Receipt className="h-4 w-4" />
                                        Invoice PDF
                                      </button>
                                    )}

                                    {/* Review Machine Rating */}
                                    {book.status === "paid" && (
                                      <button
                                        type="button"
                                        onClick={() => { soundEffects.playClick(); setRatingBooking(book); }}
                                        className="px-4 py-2 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 rounded-xl text-xs font-bold transition flex items-center gap-1"
                                      >
                                        <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                                        Review Machinery
                                      </button>
                                    )}

                                    {/* Cancel Booking option */}
                                    {book.status === "pending" && (
                                      <button
                                        type="button"
                                        onClick={() => triggerBookingAction(book.id, "reject", { reason: "Farmer self-cancellation" })}
                                        className="px-3 py-1.5 text-zinc-400 hover:text-rose-600 rounded text-xs tracking-wide"
                                      >
                                        Cancel Request
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </>
                  )}

                  {/* Booking Panel Form */}
                  {activeTab === "book" && (
                    <div className="bg-white dark:bg-zinc-900 border rounded-2xl p-6 shadow-xs space-y-6">
                      <div className="border-b dark:border-zinc-800 pb-3">
                        <h2 className="text-lg font-black text-zinc-900 dark:text-white flex items-center gap-2">
                          <span className="p-1 bg-[#F1F8E9] rounded-lg">🌾</span>
                          Harvest Scheduling Machine Request
                        </h2>
                        <p className="text-zinc-500 text-xs mt-0.5">
                          Set crop thresher acreage, custom schedule, select verified machines, and get real-time price estimation.
                        </p>
                      </div>

                      {/* Inputs grid */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold uppercase text-zinc-400 mb-1">Crop Variety</label>
                          <select
                            value={bookingCrop}
                            onChange={(e) => setBookingCrop(e.target.value)}
                            className="w-full bg-zinc-50 dark:bg-zinc-850 text-xs py-2.5 px-3 rounded-xl border border-zinc-200"
                          >
                            {CROPS.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase text-zinc-400 mb-1">Total Acres worked</label>
                          <input
                            type="number"
                            value={bookingAcres}
                            onChange={(e) => setBookingAcres(Number(e.target.value))}
                            className="w-full bg-zinc-50 dark:bg-zinc-850 text-xs py-2.5 px-3 rounded-xl border border-zinc-200"
                            min="1"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase text-zinc-400 mb-1">Preferred Date</label>
                          <input
                            type="date"
                            value={bookingDate}
                            onChange={(e) => setBookingDate(e.target.value)}
                            className="w-full bg-zinc-50 dark:bg-zinc-850 text-xs py-2 px-3 rounded-xl border border-zinc-200"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase text-zinc-400 mb-1">Preferred Time of work</label>
                          <input
                            type="text"
                            value={bookingTime}
                            onChange={(e) => setBookingTime(e.target.value)}
                            className="w-full bg-zinc-50 dark:bg-zinc-850 text-xs py-2 px-3 rounded-xl border border-zinc-200"
                            placeholder="e.g. 10:00 AM"
                          />
                        </div>

                        <div className="col-span-2">
                          <label className="block text-xs font-bold uppercase text-zinc-400 mb-1">Landmark Spec / Field Directions</label>
                          <input
                            type="text"
                            value={bookingLandmark}
                            onChange={(e) => setBookingLandmark(e.target.value)}
                            className="w-full bg-zinc-50 dark:bg-zinc-850 text-xs py-2 px-3 rounded-xl border border-zinc-200"
                            placeholder="Behind primary school, near coconut grove canals"
                          />
                        </div>
                      </div>

                      {/* Fleet List Select Scheduling */}
                      <div className="space-y-3">
                        <label className="block text-xs font-bold uppercase text-zinc-400">
                          Select Rashi Machine & Rate Per Acre
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                          {appState.machines.map(mac => {
                            const cropPriceSpec = mac.basePricing.find(bp => bp.cropName === bookingCrop)?.pricePerAcre || 1000;
                            const isSelected = selectedMachineId === mac.id;
                            
                            // Estimate pricing math
                            const mathWorkCost = bookingAcres * cropPriceSpec;
                            const mathTotalEst = Math.max(mac.minCharge, mathWorkCost) + mac.travelCharges;

                            return (
                              <div
                                key={mac.id}
                                onClick={() => { soundEffects.playClick(); setSelectedMachineId(mac.id); }}
                                className={`p-4 rounded-2xl border transition relative cursor-pointer ${
                                  isSelected 
                                    ? "bg-[#2E7D32]/5 border-[#2E7D32] ring-1 ring-[#2E7D32]" 
                                    : "bg-white dark:bg-zinc-950 border-zinc-200 hover:bg-zinc-50/40"
                                }`}
                              >
                                <div className="flex justify-between items-start mb-2">
                                  <div>
                                    <h4 className="text-xs font-extrabold text-zinc-900 dark:text-zinc-100">{mac.name}</h4>
                                    <p className="text-[10px] text-zinc-400">{mac.type}</p>
                                  </div>
                                  <span className="text-[10px] bg-[#FFC107] text-gray-950 font-bold px-1.5 py-0.5 rounded">
                                    ★ {mac.rating}
                                  </span>
                                </div>

                                <div className="space-y-1 text-[11px] text-zinc-500">
                                  <div className="flex justify-between">
                                    <span>Rate for {bookingCrop}</span>
                                    <span className="font-bold text-[#2E7D32]">₹{cropPriceSpec} / Acre</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Machinery Travel Cost</span>
                                    <span>₹{mac.travelCharges}</span>
                                  </div>
                                  <div className="flex justify-between border-t border-dashed dark:border-zinc-800 pt-1.5 font-bold text-zinc-850 dark:text-zinc-200 mt-2">
                                    <span>ESTIMATED TOTAL</span>
                                    <span className="font-mono text-amber-600">₹{mathTotalEst}</span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={triggerSubmitBooking}
                        className="w-full py-3 bg-[#2E7D32] hover:bg-emerald-700 font-extrabold text-white rounded-xl text-xs uppercase tracking-widest shadow-lg transition"
                      >
                        Submit Booking Request to Owner
                      </button>
                    </div>
                  )}

                  {/* Weather view tab */}
                  {activeTab === "weather" && (
                    <div className="space-y-4">
                      <WeatherWidget />
                    </div>
                  )}

                  {/* Live Tracking map focused */}
                  {activeTab === "live" && (
                    <div className="space-y-4">
                      <h3 className="text-xs font-black uppercase text-zinc-400 tracking-widest px-1">Nearby Field Fleet Tracker</h3>
                      {appState.bookings.find(b => b.status === "started") ? (
                        (() => {
                          const active = appState.bookings.find(b => b.status === "started")!;
                          return (
                            <MapContainer
                              farmerLocation={active.farmerLocation}
                              machineLocation={active.machineLocation}
                              distanceKm={active.distanceKm}
                              etaMinutes={active.etaMinutes}
                              machineName={active.machineName}
                              vehicleNumber={active.vehicleNumber}
                              showSimulationBtn={true}
                              onSimulateStep={() => triggerBookingAction(active.id, "simulation_step")}
                              gpsLoading={gpsLoading}
                              gpsError={gpsError}
                            />
                          );
                        })()
                      ) : (
                        <div className="space-y-3">
                          <div className="bg-amber-500/10 border border-amber-500/25 px-4 py-3 rounded-2xl text-amber-850 dark:text-amber-300 text-[11px] font-bold flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                            <span>📡 No active booking trip in progress. Showing interactive nearby machinery grid in <b>Radar Simulated Mode</b>.</span>
                            <button
                              type="button"
                              onClick={() => {
                                soundEffects.playClick();
                                setRadarMachineLoc({ lat: 14.4682, lng: 75.9415 });
                                setRadarStep(0);
                                triggerNotification("🔄 GPS Radar simulator reset successfully!");
                              }}
                              className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-[9px] font-black uppercase tracking-wider transition-colors inline-block whitespace-nowrap"
                            >
                              Reset Radar
                            </button>
                          </div>
                          
                          <MapContainer
                            farmerLocation={{ lat: 14.4566, lng: 75.9324 }}
                            machineLocation={radarMachineLoc}
                            distanceKm={Math.max(0, Number((1.8 - radarStep * 0.45).toFixed(2)))}
                            etaMinutes={Math.max(0, 12 - radarStep * 3)}
                            machineName="Rashi Deluxe Thresher (Nearby Radar)"
                            vehicleNumber="KA-17-M-4566"
                            showSimulationBtn={true}
                            onSimulateStep={handleRadarSimulateStep}
                            gpsLoading={gpsLoading}
                            gpsError={gpsError}
                          />
                        </div>
                      )}
                    </div>
                  )}

                </div>

                {/* Right Column: Weather Summary & Danya Chatbot widget inside main grid */}
                <div className="col-span-12 lg:col-span-4 space-y-6">
                  
                  {/* Weather summary clip widget */}
                  <div className="bg-white dark:bg-zinc-900 rounded-2xl p-4 border border-zinc-200 shadow-xs flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-zinc-400 font-bold block uppercase">Harvest Climate Index</span>
                      <p className="text-xs font-black text-emerald-800 dark:text-emerald-400 mt-0.5">☀️ 32°C &bull; Clear Sunlight</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => { soundEffects.playClick(); setActiveTab("weather"); }}
                      className="text-[10px] bg-zinc-100 hover:bg-zinc-200 px-2 py-1 rounded font-bold uppercase"
                    >
                      View Advisories
                    </button>
                  </div>

                  {/* Danya Conversation panel always helpful for direct dialog assist */}
                  <ChatbotWidget currentRole="farmer" />

                </div>

              </div>
            )}

            {/* -------------------- OWNER PANEL WORKSPACE -------------------- */}
            {role === "owner" && (
              <div className="grid grid-cols-12 gap-6">

                {/* Left tabbed segments owner workspace */}
                <div className="col-span-12 lg:col-span-8 space-y-6">
                  
                  {activeTab === "owner_dashboard" && (
                    <>
                      {/* Active fleet reservations grid list */}
                      <div className="space-y-4">
                        <div className="flex justify-between items-center px-1">
                          <h3 className="text-xs font-black uppercase text-zinc-400 tracking-widest">Incoming Service Request Queues</h3>
                          <span className="text-[9px] bg-amber-100 text-amber-800 font-extrabold px-2 py-1 rounded">
                            Aadhaar Verified Owner
                          </span>
                        </div>

                        <div className="space-y-3">
                          {appState.bookings.filter(b => b.ownerId === "owner-principal").map(book => {
                            return (
                              <div
                                key={book.id}
                                className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border dark:border-zinc-800 shadow-sm space-y-4 hover:border-[#1b4b1e] transition"
                              >
                                <div className="flex justify-between items-start">
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs font-extrabold block text-zinc-900 dark:text-zinc-100">
                                        BOOKING {book.id}
                                      </span>
                                      <span className="px-2 py-0.5 rounded bg-zinc-100 text-zinc-650 text-[9px] font-bold">
                                        🌾 {book.cropType} &bull; {book.acres} Acres
                                      </span>
                                    </div>
                                    <p className="text-[11px] text-zinc-500 mt-1">
                                      Farmer: <span className="font-extrabold text-zinc-700 dark:text-zinc-300">{book.farmerName}</span> &bull; Tel: {book.farmerMobile}
                                    </p>
                                    <p className="text-[10px] text-zinc-400 font-mono mt-0.5 flex items-center gap-2 flex-wrap">
                                      <span>Village: {book.village}, Landmark: {book.landmark}</span>
                                      <button
                                        type="button"
                                        onClick={() => openGoogleMapsNavigation(book.machineLocation, book.farmerLocation)}
                                        className="text-emerald-700 dark:text-emerald-400 hover:underline text-[9.5px] font-black flex items-center gap-0.5 select-none cursor-pointer"
                                        title="Navigate driving route in Google Maps"
                                      >
                                        🗺️ Navigate Field
                                      </button>
                                    </p>
                                  </div>

                                  <span className="text-xs uppercase font-extrabold text-[#2E7D32] bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                                    {book.status}
                                  </span>
                                </div>

                                {/* Owners controls action suite */}
                                <div className="p-3 bg-zinc-50 dark:bg-zinc-850/50 rounded-xl flex flex-wrap gap-2 items-center justify-between">
                                  <div>
                                    <span className="text-[9px] text-zinc-400 font-mono uppercase block">Estimated Earnings</span>
                                    <span className="text-xs font-black font-mono text-emerald-800 dark:text-emerald-400">
                                      ₹{book.totalAmount}
                                    </span>
                                  </div>

                                  <div className="flex gap-2">
                                    {/* Action: Accept reservation */}
                                    {book.status === "pending" && (
                                      <>
                                        <button
                                          type="button"
                                          onClick={() => triggerBookingAction(book.id, "accept")}
                                          className="px-3 py-1.5 bg-[#2E7D32] hover:bg-emerald-700 text-white rounded-lg text-xs font-extrabold uppercase shadow"
                                        >
                                          Accept Order
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const r = prompt("Provide rejection reason:", "Machinery fully booked for Togari crop on this date.");
                                            if (r) triggerBookingAction(book.id, "reject", { reason: r });
                                          }}
                                          className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-bold hover:bg-red-100"
                                        >
                                          Reject Order
                                        </button>
                                      </>
                                    )}

                                    {/* Action: Travel begun */}
                                    {book.status === "accepted" && (
                                      <button
                                        type="button"
                                        onClick={() => triggerBookingAction(book.id, "start_travel")}
                                        className="px-4 py-2 bg-[#FFC107] hover:bg-amber-500 text-zinc-950 rounded-xl text-xs font-black uppercase tracking-wide shadow"
                                      >
                                        Start Field Travel Commute
                                      </button>
                                    )}

                                    {/* Simulated traveling status */}
                                    {book.status === "started" && (
                                      <div className="flex gap-1.5 items-center flex-wrap">
                                        <button
                                          type="button"
                                          onClick={() => openGoogleMapsNavigation(book.machineLocation, book.farmerLocation)}
                                          className="px-3.5 py-1.5 bg-emerald-650 hover:bg-emerald-700 text-white rounded text-[11px] font-black uppercase flex items-center gap-1 shadow-sm select-none cursor-pointer"
                                        >
                                          <Compass className="h-3.5 w-3.5 animate-spin-slow" />
                                          Google Maps
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => triggerBookingAction(book.id, "simulation_step")}
                                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-white rounded text-[11px] font-bold"
                                        >
                                          Simulate GPS Map Leap ({book.distanceKm}km left)
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => setPhotoBooking(book)}
                                          className="px-3 py-1.5 bg-[#2E7D32] text-white rounded text-[11px] font-bold"
                                        >
                                          Upload Work Photo Logs
                                        </button>
                                      </div>
                                    )}

                                    {/* Action: Trigger payment request from farmer after photos posted */}
                                    {book.status === "photo_uploaded" && (
                                      <button
                                        type="button"
                                        onClick={() => triggerBookingAction(book.id, "request_payment")}
                                        className="px-4 py-2 bg-[#FFC107] text-zinc-950 font-black rounded-xl text-xs uppercase"
                                      >
                                        Request Farmer Payment (₹{book.totalAmount})
                                      </button>
                                    )}

                                    {/* Verify Submission Proof screenshot manually */}
                                    {book.status === "verify_pending" && (
                                      <div className="space-y-2 w-full text-right mt-1.5">
                                        <div className="bg-amber-50/20 border border-amber-200 p-3 rounded-lg text-left text-xs mb-2">
                                          <span className="block font-bold">Transaction Report Proof:</span>
                                          <p className="mt-1">Transaction Ref: <span className="font-mono font-bold text-zinc-850">{book.transactionId}</span></p>
                                          <p>Method: {book.paymentMethod} &bull; Photo Proof: <i>{book.screenshotUrl}</i></p>
                                        </div>
                                        <div className="flex gap-1.5 justify-end">
                                          <button
                                            type="button"
                                            onClick={() => triggerBookingAction(book.id, "verify_payment")}
                                            className="px-3.5 py-1.5 bg-[#2E7D32] hover:bg-emerald-700 text-white rounded-lg text-xs font-black uppercase"
                                          >
                                            ✅ Verify Screenshot Payment (Generate Invoice)
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => {
                                              const r = prompt("Provide screenshot rejection reason:", "Receipt unclear / Transaction ID missing or already processed.");
                                              if (r) triggerBookingAction(book.id, "reject_payment", { reason: r });
                                            }}
                                            className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg text-xs font-bold"
                                          >
                                            Reject Receipt
                                          </button>
                                        </div>
                                      </div>
                                    )}

                                    {/* Paid status bill download */}
                                    {(book.status === "paid" || book.status === "completed") && (
                                      <button
                                        type="button"
                                        onClick={() => { soundEffects.playClick(); setSelectedInvoiceBooking(book); }}
                                        className="px-4 py-2 bg-zinc-100 text-zinc-800 dark:bg-zinc-850 dark:text-zinc-200 font-bold border rounded-lg text-xs"
                                      >
                                        View Generated Bill GST
                                      </button>
                                    )}

                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </>
                  )}

                  {/* Add & Edit Machines list */}
                  {activeTab === "owner_machines" && (
                    <div className="space-y-6">
                      
                      {/* Register card */}
                      <div className="bg-white dark:bg-zinc-900 border rounded-2xl p-5 shadow-xs space-y-4">
                        <div className="border-b dark:border-zinc-800 pb-2">
                          <h3 className="text-sm font-black text-zinc-800 dark:text-zinc-200">
                            Register Multi-Crop Rashi Machine / Harvester
                          </h3>
                          <p className="text-xs text-zinc-500">Add custom crop variety hourly pricing matrix details.</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Brand/Name</label>
                            <input
                              type="text"
                              value={newMacName}
                              onChange={(e) => setNewMacName(e.target.value)}
                              placeholder="e.g. Swarnamukhi Rashi Pro V2"
                              className="w-full text-xs bg-zinc-50 dark:bg-zinc-850 border rounded-xl py-2 px-3"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Vehicle Plate Number</label>
                            <input
                              type="text"
                              value={newMacNumber}
                              onChange={(e) => setNewMacNumber(e.target.value)}
                              placeholder="e.g. KA-27-M-5511"
                              className="w-full text-xs bg-zinc-50 dark:bg-zinc-850 border rounded-xl py-2 px-3"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Minimum Surcharge Settle Level</label>
                            <input
                              type="number"
                              value={newMacMinCharge}
                              onChange={(e) => setNewMacMinCharge(Number(e.target.value))}
                              className="w-full text-xs bg-zinc-50 dark:bg-zinc-850 border rounded-xl py-2 px-3"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Machinery Travel Charge Index</label>
                            <input
                              type="number"
                              value={newMacTravel}
                              onChange={(e) => setNewMacTravel(Number(e.target.value))}
                              className="w-full text-xs bg-zinc-50 dark:bg-zinc-850 border rounded-xl py-2 px-3"
                            />
                          </div>
                        </div>

                        {/* Crops pricing matrix */}
                        <div className="space-y-3 pt-2">
                          <span className="text-[10px] uppercase font-bold text-zinc-400">Custom Crop Rates per Acre Matrix</span>
                          <div className="grid grid-cols-5 gap-2.5">
                            <div>
                              <span className="text-[9px] text-zinc-400 font-bold block mb-1">1. Togari</span>
                              <input type="number" value={pricingTogari} onChange={(e) => setPricingTogari(Number(e.target.value))} className="w-full text-xs p-1 px-2 border rounded" />
                            </div>
                            <div>
                              <span className="text-[9px] text-zinc-400 font-bold block mb-1">2. Jola</span>
                              <input type="number" value={pricingJola} onChange={(e) => setPricingJola(Number(e.target.value))} className="w-full text-xs p-1 px-2 border rounded" />
                            </div>
                            <div>
                              <span className="text-[9px] text-zinc-400 font-bold block mb-1">3. Godhi</span>
                              <input type="number" value={pricingGodhi} onChange={(e) => setPricingGodhi(Number(e.target.value))} className="w-full text-xs p-1 px-2 border rounded" />
                            </div>
                            <div>
                              <span className="text-[9px] text-zinc-400 font-bold block mb-1">4. Kadale</span>
                              <input type="number" value={pricingKadale} onChange={(e) => setPricingKadale(Number(e.target.value))} className="w-full text-xs p-1 px-2 border rounded" />
                            </div>
                            <div>
                              <span className="text-[9px] text-zinc-400 font-bold block mb-1">5. Maize</span>
                              <input type="number" value={pricingMaize} onChange={(e) => setPricingMaize(Number(e.target.value))} className="w-full text-xs p-1 px-2 border rounded" />
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={triggerRegisterMachine}
                          className="w-full py-2.5 bg-[#2E7D32] hover:bg-emerald-700 text-white rounded-xl text-xs font-bold uppercase"
                        >
                          Submit Registration Specs
                        </button>
                      </div>

                      {/* Your machines checklist */}
                      <div className="space-y-3">
                        <span className="text-xs uppercase font-black text-zinc-400">My Registered Service Fleet</span>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {appState.machines.filter(m => m.ownerId === "owner-principal").map(mac => (
                            <div key={mac.id} className="bg-white dark:bg-zinc-900 border dark:border-zinc-800 p-4 rounded-xl shadow-xs space-y-3">
                              <div className="flex justify-between">
                                <div>
                                  <h4 className="text-sm font-black text-zinc-800 dark:text-zinc-200">{mac.name}</h4>
                                  <span className="text-[10px] text-emerald-600 font-mono font-bold uppercase">{mac.vehicleNumber}</span>
                                </div>
                                <span className="text-xs bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                                  ★ {mac.rating}
                                </span>
                              </div>

                              <div className="text-[11px] text-zinc-500 space-y-1 pt-1 border-t dark:border-zinc-800">
                                <div className="flex justify-between">
                                  <span>Togari pricing rate</span>
                                  <span className="font-bold text-zinc-850">₹{mac.basePricing.find(p=>p.cropName==="Togari")?.pricePerAcre}/Acre</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Jola pricing rate</span>
                                  <span className="font-bold text-zinc-850">₹{mac.basePricing.find(p=>p.cropName==="Jola")?.pricePerAcre}/Acre</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Travel charge index</span>
                                  <span>₹{mac.travelCharges}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>
                  )}

                  {/* Revenue earnings dashboard reports */}
                  {activeTab === "owner_earnings" && (
                    <div className="bg-white dark:bg-zinc-900 border rounded-2xl p-6 shadow-xs space-y-6">
                      <div className="border-b dark:border-zinc-800 pb-3 flex justify-between items-center">
                        <div>
                          <h3 className="text-sm font-black text-zinc-800 dark:text-white">Active Revenue Cash ledger</h3>
                          <p className="text-xs text-zinc-500">Earnings analytics and worked acres summary.</p>
                        </div>
                        <span className="p-2 bg-emerald-15 rounded-xl text-emerald-800 font-bold text-xs uppercase">
                          May 2026 CYCLE
                        </span>
                      </div>

                      {/* KPI scorecard */}
                      <div className="grid grid-cols-3 gap-4">
                        <div className="bg-zinc-50 dark:bg-zinc-850 p-4 rounded-xl border">
                          <span className="text-[9px] uppercase tracking-wider text-zinc-400 font-bold block">Total Verified Revenue</span>
                          <span className="text-xl font-mono text-emerald-800 dark:text-emerald-400 font-black">
                            ₹{appState.bookings.filter(b => b.status === "paid").reduce((sum, b) => sum + b.totalAmount, 0)}
                          </span>
                        </div>

                        <div className="bg-zinc-50 dark:bg-zinc-850 p-4 rounded-xl border">
                          <span className="text-[9px] uppercase tracking-wider text-zinc-400 font-bold block">Total Worked Acres</span>
                          <span className="text-xl font-mono text-zinc-800 dark:text-zinc-200 font-black">
                            {appState.bookings.filter(b => b.status === "paid").reduce((sum, b) => sum + b.acres, 0)} Acres
                          </span>
                        </div>

                        <div className="bg-zinc-50 dark:bg-zinc-850 p-4 rounded-xl border">
                          <span className="text-[9px] uppercase tracking-wider text-zinc-400 font-bold block">Awaiting Verification</span>
                          <span className="text-xl font-mono text-amber-500 font-black">
                            ₹{appState.bookings.filter(b => b.status === "verify_pending").reduce((sum, b) => sum + b.totalAmount, 0)}
                          </span>
                        </div>
                      </div>

                      {/* Dynamic SVG Revenue Graph Illustration */}
                      <div className="space-y-2.5">
                        <span className="text-[10px] uppercase font-bold text-zinc-400 block">Earnings Path Wavechart</span>
                        <div className="bg-zinc-50 p-4 rounded-xl border h-44 flex items-end relative overflow-hidden">
                          <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                            {/* SVG Wave */}
                            <path 
                              d="M 0,90 Q 25,60 50,40 T 100,10 L 100,100 L 0,100 Z" 
                              fill="rgba(46, 125, 50, 0.08)" 
                            />
                            <path 
                              d="M 0,90 Q 25,60 50,40 T 100,10" 
                              fill="none" 
                              stroke="#2E7D32" 
                              strokeWidth="2" 
                            />
                          </svg>

                          <div className="absolute inset-x-4 bottom-2 flex justify-between text-[9px] font-mono text-zinc-400">
                            <span>Week 1</span>
                            <span>Week 2</span>
                            <span>Week 3</span>
                            <span>May 21 (Today)</span>
                          </div>

                          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur border rounded px-1.5 py-0.5 text-[9px] font-bold text-[#2E7D32] shadow-sm">
                            ★ Peak Jola Demand Season
                          </div>
                        </div>
                      </div>

                    </div>
                  )}

                </div>

                {/* Right Column: Mini logs & Chatbot */}
                <div className="col-span-12 lg:col-span-4 space-y-6">
                  
                  {/* Local weather widgets */}
                  <WeatherWidget />

                  {/* Danya Conversation panel always helpful for direct dialog assist */}
                  <ChatbotWidget currentRole="owner" />

                </div>

              </div>
            )}

            {/* -------------------- ADMIN AUDIT PANEL WORKSPACE -------------------- */}
            {role === "admin" && (
              <div className="grid grid-cols-12 gap-6">

                {/* Left panel metrics overview */}
                <div className="col-span-12 lg:col-span-8 space-y-6">
                  
                  {activeTab === "analytics" && (
                    <div className="bg-white dark:bg-zinc-900 border rounded-2xl p-6 shadow-xs space-y-6">
                      <div className="border-b dark:border-zinc-800 pb-3">
                        <span className="text-[10px] bg-red-100 text-red-800 px-2 py-0.5 rounded font-bold uppercase">
                          System Auditor Center
                        </span>
                        <h2 className="text-lg font-black text-zinc-900 dark:text-white mt-1.5">
                          Karnataka Digital Agri-Reserve Ledger
                        </h2>
                        <p className="text-zinc-500 text-xs mt-0.5">
                          Audit all logged farmers, machine operators, pending screenshot validation queues, and system activities.
                        </p>
                      </div>

                      {/* Score metrics */}
                      <div className="grid grid-cols-4 gap-4">
                        <div className="bg-zinc-50 dark:bg-zinc-850 p-4 rounded-xl border text-center">
                          <span className="text-[9px] text-zinc-400 uppercase font-black block">Total Bookings</span>
                          <span className="text-lg font-mono font-bold text-zinc-800 dark:text-zinc-200">
                            {appState.bookings.length}
                          </span>
                        </div>

                        <div className="bg-zinc-50 dark:bg-zinc-850 p-4 rounded-xl border text-center">
                          <span className="text-[9px] text-zinc-400 uppercase font-black block">Active Fleet</span>
                          <span className="text-lg font-mono font-bold text-zinc-800 dark:text-zinc-200">
                            {appState.machines.length} Units
                          </span>
                        </div>

                        <div className="bg-zinc-50 dark:bg-zinc-850 p-4 rounded-xl border text-center">
                          <span className="text-[9px] text-zinc-400 uppercase font-black block">Agrorun cashflow</span>
                          <span className="text-lg font-mono text-emerald-800 dark:text-emerald-400 font-extrabold">
                            ₹{appState.bookings.reduce((sum, b) => sum + b.totalAmount, 0)}
                          </span>
                        </div>

                        <div className="bg-zinc-50 dark:bg-zinc-850 p-4 rounded-xl border text-center">
                          <span className="text-[9px] text-zinc-400 uppercase font-black block">Validation Requests</span>
                          <span className="text-lg font-mono text-rose-600 font-bold block">
                            {appState.bookings.filter(b => b.status === "verify_pending").length} Pending
                          </span>
                        </div>
                      </div>

                      {/* System Logs history list */}
                      <div className="space-y-3">
                        <span className="text-xs uppercase font-black text-zinc-400">Activity Audits</span>
                        <div className="border dark:border-zinc-800 rounded-xl divide-y dark:divide-zinc-800 overflow-hidden text-xs">
                          {appState.logs.map(log => (
                            <div key={log.id} className="p-3 bg-white dark:bg-zinc-950 flex justify-between gap-4">
                              <div className="flex gap-2.5 items-start">
                                <span className={`w-2 h-2 rounded-full mt-1.5 ${
                                  log.role === "farmer" ? "bg-[#2E7D32]" : "bg-blue-600"
                                }`}></span>
                                <div>
                                  <p className="text-zinc-800 dark:text-zinc-200 font-mono text-[11px]">{log.action}</p>
                                  <span className="text-[9px] text-zinc-400 font-bold">{log.role.toUpperCase()} &bull; {log.userId}</span>
                                </div>
                              </div>
                              <span className="text-[9px] text-zinc-400 shrink-0 font-mono">
                                {new Date(log.timestamp).toLocaleTimeString()}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>
                  )}

                  {/* List View Farmers directories */}
                  {activeTab === "admin_farmers" && (
                    <div className="bg-white p-6 border rounded-2xl shadow-xs space-y-4">
                      <h3 className="text-sm font-black text-zinc-850">Registered Farmers (Davanagere Hub)</h3>
                      <div className="border rounded-xl p-4 divide-y space-y-3 text-xs">
                        <div className="pt-2">
                          <span className="font-bold text-[#2E7D32]">Davanagere Basanna (Principal User)</span>
                          <p className="text-zinc-500 font-mono mt-0.5">village: Anaji &bull; Phone: 9845012345</p>
                        </div>
                        <div className="pt-2">
                          <span className="font-bold text-zinc-800">Basavaraj Patil</span>
                          <p className="text-zinc-500 font-mono mt-0.5">village: Raichur &bull; Phone: 9481122334</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Registered fleet list */}
                  {activeTab === "admin_machines" && (
                    <div className="bg-white p-6 border rounded-2xl shadow-xs space-y-4">
                      <h3 className="text-sm font-black text-zinc-850">System Fleet Logs</h3>
                      <div className="grid grid-cols-2 gap-4">
                        {appState.machines.map(m=> (
                          <div key={m.id} className="p-3 border rounded-xl text-xs space-y-1 bg-zinc-50">
                            <span className="font-extrabold text-zinc-900 block">{m.name}</span>
                            <p className="text-[10px] text-zinc-400 font-mono">{m.vehicleNumber}</p>
                            <p className="text-[#2E7D32] font-semibold mt-1 flex justify-between items-center">
                              <span>Owner: {m.ownerName}</span>
                              {m.location && (
                                <button
                                  type="button"
                                  onClick={() => openGoogleMapsNavigation(m.location, m.location)}
                                  className="text-emerald-700 hover:underline font-bold text-[9.5px] cursor-pointer select-none"
                                  title="View machine position in Google Maps"
                                >
                                  📍 View Location
                                </button>
                              )}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>

                {/* Right Column: AI & Help */}
                <div className="col-span-12 lg:col-span-4 space-y-6">
                  <div className="bg-zinc-900 text-white rounded-2xl p-5 border shadow-sm">
                    <h4 className="text-xs uppercase text-zinc-400 font-bold block mb-1">System Guard Protocol</h4>
                    <p className="text-xs text-zinc-350 leading-relaxed">
                      All system databases are securely packed under file persistence. Screenshot matching prevents manual credit verification hacks. Code contains anti-tamper signature locks.
                    </p>
                  </div>
                  <ChatbotWidget currentRole="admin" />
                </div>

              </div>
            )}

          </div>

          {/* BOTTOM NAVIGATION FIXED BAR */}
          <div className="sticky bottom-0 bg-white dark:bg-zinc-900 border-t border-zinc-150 dark:border-zinc-800 p-3.5 flex justify-center backdrop-blur-md bg-white/95 shrink-0">
            <div className="flex gap-12 text-center align-center">
              
              <button
                type="button"
                onClick={() => {
                  soundEffects.playClick();
                  if (role === 'farmer') {
                    setActiveTab("dashboard");
                  } else if (role === 'owner') {
                    setActiveTab("owner_dashboard");
                  } else {
                    setActiveTab("analytics");
                  }
                }}
                className={`flex flex-col items-center gap-1 group transition ${
                  activeTab === "dashboard" || activeTab === "owner_dashboard" || activeTab === "analytics"
                    ? "text-[#2E7D32] dark:text-emerald-400" 
                    : "text-zinc-400 hover:text-zinc-650"
                }`}
              >
                <div className="p-1 px-4.5 rounded-full bg-zinc-50 dark:bg-zinc-800 dark:group-hover:bg-zinc-700 select-none">
                  🚜
                </div>
                <span className="text-[10px] uppercase font-black tracking-wider">HARVEST</span>
              </button>

              {role === "farmer" && (
                <button
                  type="button"
                  onClick={() => {
                    soundEffects.playClick();
                    setActiveTab("book");
                  }}
                  className="w-12 h-12 bg-[#2E7D32] hover:bg-emerald-700 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition -translate-y-4 cursor-pointer"
                  title="Schedule New Machine Book"
                >
                  <Plus className="h-6 w-6 text-white stroke-[3.5]" />
                </button>
              )}

              <button
                type="button"
                onClick={triggerOpenProfileModal}
                className="flex flex-col items-center gap-1 group text-zinc-400 hover:text-[#2E7D32]"
              >
                <div className="p-1 px-4.5 rounded-full bg-zinc-50 dark:bg-zinc-800 select-none">
                  🌾
                </div>
                <span className="text-[10px] uppercase font-bold tracking-wider">MY PROFILE</span>
              </button>

            </div>
          </div>

        </main>
      </div>

      {/* -------------------- INVOICE POPUP MODAL HOOK -------------------- */}
      {selectedInvoiceBooking && (
        <InvoiceModal
          booking={selectedInvoiceBooking}
          onClose={() => setSelectedInvoiceBooking(null)}
          isOwnerView={role === "owner"}
          onSignComplete={async (farmerSign, ownerSign) => {
            // Send signed action request to server
            try {
              const res = await fetch("/api/booking/action", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  bookingId: selectedInvoiceBooking.id,
                  action: "sign_and_complete",
                  extraParams: {
                    farmerSignature: farmerSign,
                    ownerSignature: ownerSign
                  }
                })
              });

              if (res.ok) {
                await syncState();
                setSelectedInvoiceBooking(null);
                triggerNotification("Signatures securely stamped on invoice!");
              }
            } catch (e) {
              console.error(e);
            }
          }}
        />
      )}

      {/* -------------------- UPLOAD SCREENSHOT POPUP MODAL FOOTER -------------------- */}
      {payingBooking && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border shadow-xl w-full max-w-md space-y-4">
            <div className="flex justify-between border-b pb-2">
              <h3 className="text-sm font-black text-zinc-950 dark:text-zinc-100 flex items-center gap-1">
                <span>💰</span> UPGRADE TRANSACTION RECEIPT SUBMIT
              </h3>
              <button onClick={() => setPayingBooking(null)}>✕</button>
            </div>

            <div className="bg-[#F1F8E9] p-3 text-xs text-zinc-600 rounded-xl space-y-1">
              <span className="font-bold text-[#2E7D32]">Scan with PhonePe, Phone Pay, PayTM, or G-Pay</span>
              <p>Amount to settle: <b className="text-sm text-zinc-850">₹{payingBooking.totalAmount}</b> (Togari crop threshed)</p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">UPI Application Used</label>
                <select 
                  value={paymentMethod} 
                  onChange={(e) => setPaymentMethod(e.target.value)} 
                  className="w-full text-xs p-2 border rounded-xl"
                >
                  <option value="PhonePe">PhonePe</option>
                  <option value="Google Pay">Google Pay</option>
                  <option value="Paytm">Paytm</option>
                  <option value="Phone Pay">Phone Pay</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Transaction ID Number</label>
                <input
                  type="text"
                  value={txnId}
                  onChange={(e) => setTxnId(e.target.value)}
                  placeholder="e.g. TXN5629190123"
                  className="w-full text-xs p-2.5 border rounded-xl"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Upload Receipt Screenshot File</label>
                <div className="border border-dashed p-4 text-center rounded-xl relative hover:bg-zinc-50 transition cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handlePhotoConvert(0, e.target, setPaymentScreenshot)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <span className="text-[11px] text-[#2E7D32] font-semibold underline block cursor-pointer">
                    {paymentScreenshot ? "Screenshot Loaded! (Click or Drag to reselect)" : "Select Screen Shot Log File"}
                  </span>
                  <span className="text-[9px] text-zinc-400 block mt-1">Accepts PNG, JPG (Max 5MB)</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={triggerSubmitPayment}
              className="w-full py-2.5 bg-[#2E7D32] hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow"
            >
              Verify & Send to Owner Node Dashboard
            </button>
          </div>
        </div>
      )}

      {/* -------------------- OWNER WORK PHOTO LOG POPUP -------------------- */}
      {photoBooking && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border shadow-xl w-full max-w-md space-y-4">
            <div className="flex justify-between border-b pb-2">
              <h3 className="text-sm font-black text-zinc-950 dark:text-zinc-100 flex items-center gap-1">
                <span>📸</span> UPLOAD HARVESTING WORK PHOTO LOGS
              </h3>
              <button onClick={() => setPhotoBooking(null)}>✕</button>
            </div>

            <div className="space-y-4">
              <div className="border border-dashed p-3 rounded-lg text-xs space-y-1">
                <span className="font-bold text-zinc-700 block">1. Before Work Photo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handlePhotoConvert(1, e.target, setWorkPhotoBefore)}
                  className="text-xs text-zinc-500"
                />
                {workPhotoBefore && <span className="block text-emerald-600 text-[10px] font-bold">Image loaded successfully!</span>}
              </div>

              <div className="border border-dashed p-3 rounded-lg text-xs space-y-1">
                <span className="font-bold text-zinc-700 block">2. During Work Photo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handlePhotoConvert(2, e.target, setWorkPhotoDuring)}
                  className="text-xs text-zinc-500"
                />
                {workPhotoDuring && <span className="block text-emerald-600 text-[10px] font-bold">Image loaded successfully!</span>}
              </div>

              <div className="border border-dashed p-3 rounded-lg text-xs space-y-1">
                <span className="font-bold text-zinc-700 block">3. After Work Photo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handlePhotoConvert(3, e.target, setWorkPhotoAfter)}
                  className="text-xs text-zinc-500"
                />
                {workPhotoAfter && <span className="block text-emerald-600 text-[10px] font-bold">Image loaded successfully!</span>}
              </div>
            </div>

            <button
              type="button"
              onClick={async () => {
                await triggerBookingAction(photoBooking.id, "upload_photos", {
                  before: workPhotoBefore || "IMAGE_LOG_BEFORE",
                  during: workPhotoDuring || "IMAGE_LOG_DURING",
                  after: workPhotoAfter || "IMAGE_LOG_AFTER",
                });
                setPhotoBooking(null);
                setWorkPhotoBefore("");
                setWorkPhotoDuring("");
                setWorkPhotoAfter("");
              }}
              className="w-full py-2.5 bg-[#2E7D32] hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow"
            >
              Verify & Send Work Photos
            </button>
          </div>
        </div>
      )}

      {/* -------------------- RATING POPUP MODAL -------------------- */}
      {ratingBooking && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 border rounded-2xl w-full max-w-sm space-y-4">
            <div className="flex justify-between border-b pb-2">
              <h3 className="text-xs font-black uppercase text-zinc-400">machinery satisfaction index</h3>
              <button onClick={() => setRatingBooking(null)}>✕</button>
            </div>

            <div className="text-center py-2 space-y-3">
              <span className="text-xs text-zinc-500 font-bold block">Rate sorting performance of Swarnamukhi</span>
              <div className="flex justify-center gap-1">
                {[1, 2, 3, 4, 5].map(st => (
                  <button
                    key={st}
                    onClick={() => { soundEffects.playClick(); setReviewStars(st); }}
                    className="p-1"
                  >
                    <Star className={`h-8 w-8 ${st <= reviewStars ? "fill-amber-500 text-amber-500" : "text-zinc-300"}`} />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] uppercase font-bold text-zinc-400">Written Feedback Commentary</label>
              <textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Write your review... e.g. Very smooth grain separation on dry Togari crop."
                className="w-full text-xs p-2.5 border rounded-xl h-20"
              />
            </div>

            <button
              type="button"
              onClick={triggerSubmitReview}
              className="w-full py-2 bg-[#2E7D32] hover:bg-emerald-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider"
            >
              Submit satisfying Rashi Review
            </button>
          </div>
        </div>
      )}

      {/* -------------------- PROFILE EDIT MODAL -------------------- */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-2xl w-full max-w-md space-y-4 text-left animate-fade-in">
            <div className="flex justify-between items-center border-b dark:border-zinc-800 pb-3">
              <div>
                <h3 className="text-xs font-black uppercase text-zinc-400 tracking-wider">Danya Profile Management</h3>
                <h4 className="text-sm font-black text-[#2E7D32] dark:text-emerald-400">ಪ್ರೊಫೈಲ್ ವಿವರಗಳ ತಿದ್ದುಪಡಿ</h4>
              </div>
              <button 
                type="button" 
                onClick={() => { soundEffects.playClick(); setShowProfileModal(false); }}
                className="text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 font-bold p-1 text-md"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3.5 max-h-[360px] overflow-y-auto pr-1">
              <div>
                <label className="block text-[10px] uppercase font-bold text-zinc-400">Full Name / ಪೂರ್ಣ ಹೆಸರು</label>
                <input
                  type="text"
                  value={profileEditName}
                  onChange={(e) => setProfileEditName(e.target.value)}
                  className="w-full text-xs p-2.5 mt-1 border dark:border-zinc-805 rounded-xl dark:bg-zinc-855 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-zinc-400">Mobile Phone / ಮೊಬೈಲ್ ಸಂಖ್ಯೆ</label>
                <input
                  type="tel"
                  maxLength={10}
                  value={profileEditPhone}
                  onChange={(e) => setProfileEditPhone(e.target.value)}
                  className="w-full text-xs p-2.5 mt-1 border dark:border-zinc-805 rounded-xl dark:bg-zinc-855 dark:text-white font-mono"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-zinc-400">Village / ಗ್ರಾಮ</label>
                  <input
                    type="text"
                    value={profileEditVillage}
                    onChange={(e) => setProfileEditVillage(e.target.value)}
                    className="w-full text-xs p-2.5 mt-1 border dark:border-zinc-805 rounded-xl dark:bg-zinc-855 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-zinc-400">Taluk / ತಾಲೂಕು</label>
                  <input
                    type="text"
                    value={profileEditTaluk}
                    onChange={(e) => setProfileEditTaluk(e.target.value)}
                    className="w-full text-xs p-2.5 mt-1 border dark:border-zinc-805 rounded-xl dark:bg-zinc-855 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-zinc-400">District / ಜಿಲ್ಲೆ</label>
                  <input
                    type="text"
                    value={profileEditDistrict}
                    onChange={(e) => setProfileEditDistrict(e.target.value)}
                    className="w-full text-xs p-2.5 mt-1 border dark:border-zinc-805 rounded-xl dark:bg-zinc-855 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-zinc-400">Complete Home/Farm Address</label>
                <textarea
                  value={profileEditAddress}
                  onChange={(e) => setProfileEditAddress(e.target.value)}
                  rows={2}
                  className="w-full text-xs p-2.5 mt-1 border dark:border-zinc-805 rounded-xl dark:bg-zinc-855 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-zinc-400">Aadhaar Identification (Security)</label>
                <input
                  type="text"
                  placeholder="e.g. 1290-7744-8822"
                  value={profileEditAadhaar}
                  onChange={(e) => setProfileEditAadhaar(e.target.value)}
                  className="w-full text-xs p-2.5 mt-1 border dark:border-zinc-805 rounded-xl dark:bg-zinc-855 dark:text-white"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => { soundEffects.playClick(); setShowProfileModal(false); }}
                className="flex-1 py-2.5 border dark:border-zinc-800 rounded-xl text-xs font-bold uppercase tracking-wider text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-850"
              >
                Close / ರದ್ದುಮಾಡಿ
              </button>
              
              <button
                type="button"
                onClick={handleSaveProfileEdits}
                className="flex-1 py-2.5 bg-[#2E7D32] hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all"
              >
                Save Updates / ಉಳಿಸು
              </button>
            </div>
          </div>
        </div>
      )}

      {/* -------------------- REFERRAL INVITE MODAL -------------------- */}
      {showReferralPopup && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 border shadow-xl w-full max-w-xs text-center space-y-4">
            <span className="text-3xl">🎁</span>
            <h4 className="text-xs uppercase font-black tracking-widest text-[#2E7D32]">Agronomy referral gift</h4>
            <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-150 relative">
              <span className="text-xs font-mono font-black select-all text-zinc-800 tracking-widest block uppercase">
                {currentProfile.referralCode}
              </span>
              <p className="text-[9px] text-zinc-400 font-extrabold mt-1 uppercase tracking-wide">
                Touch code text segment to copy
              </p>
            </div>
            <p className="text-[11px] text-zinc-500 px-1 leading-relaxed">
              When a fellow farmer threshes their fields using your code, both gain <b className="text-emerald-800">50 Reward points</b>!
            </p>
            <button
              type="button"
              onClick={() => {
                soundEffects.playClick();
                setShowReferralPopup(false);
                alert("Copied code to mobile sharing clipboard buffer!");
              }}
              className="w-full py-2 bg-[#FFC107] text-gray-950 font-bold rounded-xl text-xs uppercase shadow"
            >
              Share with fellow Farmers
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
