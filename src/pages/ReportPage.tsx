import React, { useState, useRef, useEffect } from 'react';
import { IncidentCategory, IncidentSeverity, LocationPrecision, CATEGORY_LABELS } from '../types/incident';
import { incidentService } from '../services/incidentStorage';
import { analyzeIncidentWithAI } from '../services/aiAnalysis';
import { useAuth } from '../context/AuthContext';
import { playTacticalBlip, playTacticalAlert, playSuccessChime } from '../utils/audio';
import {
  AlertOctagon,
  Camera,
  MapPin,
  CheckCircle,
  Mic,
  MicOff,
  Trash2,
  RefreshCw,
  Navigation,
  ArrowRight,
  ArrowLeft,
  Upload,
  Info,
  Shield,
  Loader2,
} from 'lucide-react';

interface ReportPageProps {
  onNavigate: (path: string, state?: Record<string, unknown>) => void;
}

export const ReportPage: React.FC<ReportPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();

  // Wizard Step (1 to 4)
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<IncidentCategory>('plastic_waste');
  const [description, setDescription] = useState('');
  const [observedAt, setObservedAt] = useState(() => {
    const now = new Date();
    return now.toISOString().slice(0, 16); // format for datetime-local
  });
  const [perceivedSeverity, setPerceivedSeverity] = useState<IncidentSeverity>('Medium');
  const [wildlifeObservations, setWildlifeObservations] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [reporterName, setReporterName] = useState(user ? user.name : 'Kai Vance');
  const [reporterEmail, setReporterEmail] = useState(user ? user.email : 'kai.vance@oceanwatch.org');

  // Evidence state
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageMimeType, setImageMimeType] = useState<string>('image/jpeg');
  const [imageError, setImageError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Voice speech-to-text state
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const recognitionRef = useRef<unknown>(null);

  // Location state
  const [locationName, setLocationName] = useState('');
  const [latitude, setLatitude] = useState<string>('');
  const [longitude, setLongitude] = useState<string>('');
  const [locationPrecision, setLocationPrecision] = useState<LocationPrecision>('manual_approximate');
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionProgress, setSubmissionProgress] = useState<string>('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Initialize Speech Recognition if supported
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognitionClass = (window as unknown as { SpeechRecognition: unknown }).SpeechRecognition ||
        (window as unknown as { webkitSpeechRecognition: unknown }).webkitSpeechRecognition;

      if (SpeechRecognitionClass) {
        setSpeechSupported(true);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const recognition = new (SpeechRecognitionClass as any)();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        recognition.onresult = (event: any) => {
          let current = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            current += event.results[i][0].transcript;
          }
          if (current) {
            setDescription((prev) => (prev ? `${prev} ${current}` : current));
          }
        };

        recognition.onerror = () => {
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, []);

  const toggleSpeech = () => {
    if (!speechSupported || !recognitionRef.current) return;
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const recog = recognitionRef.current as any;
      if (isListening) {
        recog.stop();
        setIsListening(false);
      } else {
        recog.start();
        setIsListening(true);
        playTacticalBlip(900, 0.05);
      }
    } catch (e) {
      console.warn('Speech toggle error:', e);
      setIsListening(false);
    }
  };

  // Image Upload Handler
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setImageError('Unsupported file type. Please upload a JPEG, PNG, or WebP image.');
      playTacticalAlert();
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setImageError('File size exceeds 10MB limit. Please attach a compressed image.');
      playTacticalAlert();
      return;
    }

    setImageFile(file);
    setImageMimeType(file.type);

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      setImagePreview(uploadEvent.target?.result as string);
      playTacticalBlip(880, 0.05);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    setImageFile(null);
    setImageError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    playTacticalBlip(500, 0.04);
  };

  // Geolocation trigger with user permission
  const handleGetLocation = () => {
    setGeoError(null);
    if (!navigator.geolocation) {
      setGeoError('Geolocation telemetry is unsupported by your browser. Please enter coordinates manually.');
      playTacticalAlert();
      return;
    }

    setGeoLoading(true);
    playTacticalBlip(750, 0.04);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setGeoLoading(false);
        setLatitude(position.coords.latitude.toFixed(6));
        setLongitude(position.coords.longitude.toFixed(6));
        setLocationPrecision('exact_gps');
        if (!locationName) {
          setLocationName(`Coastal Sector [${position.coords.latitude.toFixed(3)}, ${position.coords.longitude.toFixed(3)}]`);
        }
        playSuccessChime();
      },
      (err) => {
        setGeoLoading(false);
        setGeoError(`Location access denied or unavailable (${err.message}). You can still enter coastal landmarks manually.`);
        playTacticalAlert();
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Form Validation per step
  const validateStep = (step: number): boolean => {
    const errors: Record<string, string> = {};

    if (step === 1) {
      if (!title.trim()) {
        errors.title = 'Incident title is required to identify the report.';
      } else if (title.trim().length < 5) {
        errors.title = 'Title should be at least 5 characters.';
      }
      if (!description.trim()) {
        errors.description = 'Detailed description is required for environmental triage.';
      } else if (description.trim().length < 15) {
        errors.description = 'Please provide at least 15 characters describing the threat.';
      }
    }

    if (step === 3) {
      if (!locationName.trim()) {
        errors.locationName = 'Location or coastal sector name is required.';
      }
      if (latitude && (isNaN(Number(latitude)) || Number(latitude) < -90 || Number(latitude) > 90)) {
        errors.latitude = 'Latitude must be between -90 and 90 degrees.';
      }
      if (longitude && (isNaN(Number(longitude)) || Number(longitude) < -180 || Number(longitude) > 180)) {
        errors.longitude = 'Longitude must be between -180 and 180 degrees.';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      playTacticalBlip(800, 0.04);
      setCurrentStep((prev) => Math.min(prev + 1, 4));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      playTacticalAlert();
    }
  };

  const handlePrevStep = () => {
    playTacticalBlip(600, 0.04);
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Final Submission
  const handleSubmit = async () => {
    if (!validateStep(1) || !validateStep(3)) {
      playTacticalAlert();
      return;
    }

    setIsSubmitting(true);
    setSubmissionProgress('INITIATING CITIZEN TELEMETRY UPLOAD...');
    playTacticalBlip(900, 0.06);

    try {
      // Step A: Neural AI Assessment
      setSubmissionProgress('RUNNING MULTIMODAL AI THREAT ASSESSMENT (GEMINI 3.8 / HEURISTIC MATRIX)...');
      
      const assessment = await analyzeIncidentWithAI({
        title,
        category,
        description,
        locationName,
        perceivedSeverity,
        wildlifeObservations,
        imageBase64: imagePreview || undefined,
        mimeType: imageMimeType,
      });

      // Step B: Persist to storage
      setSubmissionProgress('WRITING AUDITED RECORD TO PERSISTENT SENSORY ARCHIVE...');

      const latNum = latitude ? parseFloat(latitude) : undefined;
      const lonNum = longitude ? parseFloat(longitude) : undefined;

      const newIncident = incidentService.create({
        title,
        category,
        description,
        severity: assessment.severity || perceivedSeverity,
        confidence: assessment.confidence || 85,
        locationName,
        latitude: latNum,
        longitude: lonNum,
        locationPrecision,
        observedAt: new Date(observedAt).toISOString(),
        imageUrl: imagePreview || undefined,
        submittedBy: {
          id: isAnonymous ? 'ANON' : user?.id || 'USR-CITIZEN',
          name: isAnonymous ? 'Anonymous Citizen' : reporterName || 'Citizen Sentry',
          isAnonymous,
          email: isAnonymous ? undefined : reporterEmail,
        },
        workflowStatus: 'Submitted',
        aiAssessment: assessment,
      });

      playSuccessChime();
      setSubmissionProgress('TELEMETRY CONFIRMED. REDIRECTING TO INCIDENT RESULT HUD...');

      // Redirect to Result Page
      setTimeout(() => {
        onNavigate('/report/result', { incident: newIncident });
      }, 700);
    } catch (err) {
      console.error('Submission error:', err);
      setIsSubmitting(false);
      setSubmissionProgress('');
      playTacticalAlert();
      setFormErrors({ submit: 'Failed to record telemetry. All form fields preserved. Please retry.' });
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-8">
      {/* Page Header */}
      <div className="border-b border-cyan-500/40 pb-4">
        <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400">
          <AlertOctagon className="w-4 h-4 text-cyan-400" />
          <span>CITIZEN SENSORY INTAKE // PROTOCOL V2.6</span>
        </div>
        <h1 className="font-display font-black text-3xl sm:text-4xl text-white uppercase tracking-tight mt-1">
          SUBMIT COASTAL POLLUTION REPORT
        </h1>
        <p className="font-mono text-xs text-slate-400 mt-1">
          Provide observations, evidence photos, and location coordinates for immediate AI hazard assessment and response routing.
        </p>
      </div>

      {/* 4-Step Progress Indicator */}
      <div className="grid grid-cols-4 gap-2 font-mono text-xs">
        {[
          { step: 1, label: '01 INCIDENT DETAILS' },
          { step: 2, label: '02 EVIDENCE' },
          { step: 3, label: '03 LOCATION' },
          { step: 4, label: '04 REVIEW & TRANSMIT' },
        ].map((item) => {
          const isActive = currentStep === item.step;
          const isDone = currentStep > item.step;
          return (
            <div
              key={item.step}
              className={`p-2.5 rounded border text-center transition-all ${
                isActive
                  ? 'border-cyan-400 bg-cyan-950/80 text-cyan-300 font-bold shadow-[0_0_12px_rgba(0,240,255,0.3)]'
                  : isDone
                  ? 'border-emerald-500/60 bg-emerald-950/40 text-emerald-400 font-semibold'
                  : 'border-slate-800 bg-black/40 text-slate-500'
              }`}
            >
              <div className="hidden sm:block">{item.label}</div>
              <div className="sm:hidden font-bold">S{item.step}</div>
            </div>
          );
        })}
      </div>

      {/* Global Form Errors */}
      {formErrors.submit && (
        <div className="p-3 bg-rose-950/70 border border-rose-500 text-rose-300 font-mono text-xs rounded">
          {formErrors.submit}
        </div>
      )}

      {/* STEP 1: Incident Details */}
      {currentStep === 1 && (
        <div className="cyber-panel p-6 rounded space-y-5">
          <h2 className="font-display font-bold text-lg text-cyan-300 uppercase flex items-center space-x-2">
            <span>STEP 1 // INCIDENT CLASSIFICATION & DESCRIPTION</span>
          </h2>

          {/* Title */}
          <div className="space-y-1">
            <label htmlFor="inc-title" className="block font-mono text-xs text-cyan-200">
              INCIDENT TITLE <span className="text-pink-500">*</span>
            </label>
            <input
              id="inc-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Surface oil sheen spreading near marina jetty"
              className={`w-full px-3 py-2.5 bg-black/70 border rounded font-mono text-xs text-white focus:outline-none ${
                formErrors.title ? 'border-rose-500 ring-1 ring-rose-500' : 'border-cyan-900 focus:border-cyan-400'
              }`}
            />
            {formErrors.title && <p className="font-mono text-xs text-rose-400">{formErrors.title}</p>}
          </div>

          {/* Pollution Category */}
          <div className="space-y-1">
            <label htmlFor="inc-category" className="block font-mono text-xs text-cyan-200">
              POLLUTION TYPE / CATEGORY <span className="text-pink-500">*</span>
            </label>
            <select
              id="inc-category"
              value={category}
              onChange={(e) => setCategory(e.target.value as IncidentCategory)}
              className="w-full px-3 py-2.5 bg-black/70 border border-cyan-900 rounded font-mono text-xs text-white focus:outline-none focus:border-cyan-400"
            >
              {Object.entries(CATEGORY_LABELS).map(([k, label]) => (
                <option key={k} value={k}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* Description & Speech-to-text */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label htmlFor="inc-desc" className="block font-mono text-xs text-cyan-200">
                DETAILED OBSERVATIONS <span className="text-pink-500">*</span>
              </label>
              {speechSupported && (
                <button
                  type="button"
                  onClick={toggleSpeech}
                  className={`flex items-center space-x-1 px-2 py-0.5 rounded border text-[11px] font-mono ${
                    isListening
                      ? 'border-pink-500 bg-pink-950 text-pink-300 animate-pulse'
                      : 'border-cyan-700 text-cyan-400 hover:bg-cyan-950'
                  }`}
                  title={isListening ? 'Stop voice recording' : 'Dictate observations with microphone'}
                >
                  {isListening ? <MicOff className="w-3 h-3" /> : <Mic className="w-3 h-3" />}
                  <span>{isListening ? 'LISTENING (CLICK TO STOP)' : 'VOICE DICTATE'}</span>
                </button>
              )}
            </div>
            <textarea
              id="inc-desc"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe color, size, odor, current water movement, estimated volume, and proximity to sensitive marine life..."
              className={`w-full px-3 py-2.5 bg-black/70 border rounded font-mono text-xs text-white focus:outline-none ${
                formErrors.description ? 'border-rose-500 ring-1 ring-rose-500' : 'border-cyan-900 focus:border-cyan-400'
              }`}
            />
            {formErrors.description && <p className="font-mono text-xs text-rose-400">{formErrors.description}</p>}
          </div>

          {/* Two-column: Date Observed & Perceived Severity */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label htmlFor="inc-observed" className="block font-mono text-xs text-cyan-200">
                DATE & APPROXIMATE TIME OBSERVED
              </label>
              <input
                id="inc-observed"
                type="datetime-local"
                value={observedAt}
                onChange={(e) => setObservedAt(e.target.value)}
                className="w-full px-3 py-2.5 bg-black/70 border border-cyan-900 rounded font-mono text-xs text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="inc-severity" className="block font-mono text-xs text-cyan-200">
                PERCEIVED SEVERITY (OPTIONAL ESTIMATE)
              </label>
              <select
                id="inc-severity"
                value={perceivedSeverity}
                onChange={(e) => setPerceivedSeverity(e.target.value as IncidentSeverity)}
                className="w-full px-3 py-2.5 bg-black/70 border border-cyan-900 rounded font-mono text-xs text-white focus:outline-none focus:border-cyan-400"
              >
                <option value="Low">Low - Localized trash, non-hazardous</option>
                <option value="Medium">Medium - Significant accumulation</option>
                <option value="High">High - Toxic sheen, large net, oil</option>
                <option value="Critical">Critical - Acute biohazard, raw sewage spill</option>
              </select>
            </div>
          </div>

          {/* Wildlife Observations */}
          <div className="space-y-1">
            <label htmlFor="inc-wildlife" className="block font-mono text-xs text-cyan-200">
              AFFECTED WILDLIFE OR ENVIRONMENTAL OBSERVATIONS (OPTIONAL)
            </label>
            <input
              id="inc-wildlife"
              type="text"
              value={wildlifeObservations}
              onChange={(e) => setWildlifeObservations(e.target.value)}
              placeholder="e.g. Shorebirds foraging near sheen; dead rock crabs; pungent hydrogen sulfide odor"
              className="w-full px-3 py-2.5 bg-black/70 border border-cyan-900 rounded font-mono text-xs text-white focus:outline-none focus:border-cyan-400"
            />
          </div>

          {/* Safety Warning */}
          <div className="p-3 bg-amber-950/30 border border-amber-500/50 rounded flex items-start space-x-2 text-xs font-mono text-amber-200">
            <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>
              <strong>SAFETY PROTOCOL:</strong> For unknown chemicals, strong fumes, or heavy oil slicks, maintain a distance of at least 50 meters. Never touch or sample hazardous discharge.
            </span>
          </div>
        </div>
      )}

      {/* STEP 2: Evidence */}
      {currentStep === 2 && (
        <div className="cyber-panel p-6 rounded space-y-6">
          <h2 className="font-display font-bold text-lg text-cyan-300 uppercase flex items-center space-x-2">
            <span>STEP 2 // VISUAL & MULTIMODAL EVIDENCE</span>
          </h2>

          <p className="font-mono text-xs text-slate-300">
            Photographic evidence is analyzed directly by Gemini 3.8 Multimodal AI to detect surface sheen, polymer breakdown, and ecological perimeter risk. Text-only reports are also accepted.
          </p>

          {/* Upload Area */}
          <div className="space-y-4">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/*"
              className="hidden"
              id="evidence-file"
            />

            {!imagePreview ? (
              <label
                htmlFor="evidence-file"
                className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-cyan-500/40 hover:border-cyan-400 rounded bg-black/40 hover:bg-cyan-950/20 cursor-pointer transition-all group"
              >
                <div className="w-14 h-14 rounded-full bg-cyan-950/80 border border-cyan-400 flex items-center justify-center text-cyan-300 mb-3 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(0,240,255,0.3)]">
                  <Upload className="w-6 h-6" />
                </div>
                <span className="font-display font-bold text-sm text-white uppercase tracking-wider">
                  CLICK TO ATTACH EVIDENCE PHOTOGRAPH
                </span>
                <span className="font-mono text-xs text-slate-400 mt-1">
                  Supports PNG, JPEG, WebP up to 10MB
                </span>
                <span className="font-mono text-[11px] text-cyan-400/80 mt-2">
                  (Or proceed to Step 3 for a valid text-only report)
                </span>
              </label>
            ) : (
              <div className="space-y-3">
                <div className="relative rounded overflow-hidden border-2 border-cyan-400 max-h-96 bg-black flex items-center justify-center">
                  <img src={imagePreview} alt="Evidence preview" className="max-h-96 object-contain" />
                  <div className="absolute top-2 right-2 flex space-x-2">
                    <label
                      htmlFor="evidence-file"
                      className="p-1.5 bg-black/80 border border-cyan-400 text-cyan-300 rounded cursor-pointer hover:bg-cyan-950 text-xs font-mono flex items-center space-x-1"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>REPLACE</span>
                    </label>
                    <button
                      type="button"
                      onClick={removeImage}
                      className="p-1.5 bg-black/80 border border-pink-500 text-pink-300 rounded cursor-pointer hover:bg-pink-950 text-xs font-mono flex items-center space-x-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>REMOVE</span>
                    </button>
                  </div>
                </div>

                <div className="p-2.5 bg-cyan-950/40 border border-cyan-500/40 rounded font-mono text-xs text-cyan-300 flex items-center justify-between">
                  <span>ATTACHED: {imageFile?.name || 'Evidence Image'}</span>
                  <span className="text-slate-400">
                    {imageFile ? `${(imageFile.size / (1024 * 1024)).toFixed(2)} MB` : ''}
                  </span>
                </div>
              </div>
            )}

            {imageError && (
              <p className="font-mono text-xs text-rose-400 bg-rose-950/40 p-2 rounded border border-rose-500">
                {imageError}
              </p>
            )}
          </div>
        </div>
      )}

      {/* STEP 3: Location Telemetry */}
      {currentStep === 3 && (
        <div className="cyber-panel p-6 rounded space-y-5">
          <h2 className="font-display font-bold text-lg text-cyan-300 uppercase flex items-center space-x-2">
            <span>STEP 3 // GEOGRAPHICAL TELEMETRY</span>
          </h2>

          <p className="font-mono text-xs text-slate-300">
            Coordinates allow environmental authorities and cleanup squads to deploy directly to the driftline or outfall. You can use your browser GPS beacon or type the coastal sector manually.
          </p>

          {/* Browser Geolocation Button */}
          <div className="p-4 bg-black/60 border border-cyan-500/40 rounded space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="font-display font-bold text-sm text-white">AUTOMATED GPS TELEMETRY</div>
                <div className="font-mono text-xs text-slate-400">
                  Requests browser geolocation only upon your explicit command.
                </div>
              </div>

              <button
                type="button"
                onClick={handleGetLocation}
                disabled={geoLoading}
                className="px-4 py-2 rounded bg-cyan-950 border border-cyan-400 text-cyan-300 hover:bg-cyan-900 font-mono text-xs font-bold flex items-center space-x-2 shrink-0 cursor-pointer"
              >
                {geoLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                    <span>ACQUIRING BEACON...</span>
                  </>
                ) : (
                  <>
                    <Navigation className="w-4 h-4 text-cyan-400" />
                    <span>ACQUIRE GPS COORDINATES</span>
                  </>
                )}
              </button>
            </div>

            {geoError && (
              <div className="p-2 bg-amber-950/40 border border-amber-500/50 rounded font-mono text-xs text-amber-300">
                {geoError}
              </div>
            )}
          </div>

          {/* Location Name */}
          <div className="space-y-1">
            <label htmlFor="inc-locname" className="block font-mono text-xs text-cyan-200">
              COASTAL AREA OR LANDMARK NAME <span className="text-pink-500">*</span>
            </label>
            <input
              id="inc-locname"
              type="text"
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              placeholder="e.g. Pacific Shoreline Dune Sector 4, near Mile Marker 12"
              className={`w-full px-3 py-2.5 bg-black/70 border rounded font-mono text-xs text-white focus:outline-none ${
                formErrors.locationName ? 'border-rose-500 ring-1 ring-rose-500' : 'border-cyan-900 focus:border-cyan-400'
              }`}
            />
            {formErrors.locationName && (
              <p className="font-mono text-xs text-rose-400">{formErrors.locationName}</p>
            )}
          </div>

          {/* Manual Latitude & Longitude */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label htmlFor="inc-lat" className="block font-mono text-xs text-cyan-200">
                LATITUDE (DECIMAL DEGREES)
              </label>
              <input
                id="inc-lat"
                type="text"
                value={latitude}
                onChange={(e) => {
                  setLatitude(e.target.value);
                  setLocationPrecision('manual_approximate');
                }}
                placeholder="e.g. 37.769000"
                className={`w-full px-3 py-2.5 bg-black/70 border rounded font-mono text-xs text-white focus:outline-none ${
                  formErrors.latitude ? 'border-rose-500 ring-1 ring-rose-500' : 'border-cyan-900 focus:border-cyan-400'
                }`}
              />
              {formErrors.latitude && (
                <p className="font-mono text-xs text-rose-400">{formErrors.latitude}</p>
              )}
            </div>

            <div className="space-y-1">
              <label htmlFor="inc-lon" className="block font-mono text-xs text-cyan-200">
                LONGITUDE (DECIMAL DEGREES)
              </label>
              <input
                id="inc-lon"
                type="text"
                value={longitude}
                onChange={(e) => {
                  setLongitude(e.target.value);
                  setLocationPrecision('manual_approximate');
                }}
                placeholder="e.g. -122.511000"
                className={`w-full px-3 py-2.5 bg-black/70 border rounded font-mono text-xs text-white focus:outline-none ${
                  formErrors.longitude ? 'border-rose-500 ring-1 ring-rose-500' : 'border-cyan-900 focus:border-cyan-400'
                }`}
              />
              {formErrors.longitude && (
                <p className="font-mono text-xs text-rose-400">{formErrors.longitude}</p>
              )}
            </div>
          </div>

          {/* Precision Note */}
          <div className="p-3 bg-black/40 border border-slate-800 rounded font-mono text-xs text-slate-400">
            TELEMETRY PRECISION MODE: <strong className="text-cyan-300 uppercase">{locationPrecision}</strong>
            <p className="mt-1 text-[11px] text-slate-500">
              Exact GPS coordinates are preferred for mapping precision; if unavailable, broad coastal sector descriptions are valid.
            </p>
          </div>
        </div>
      )}

      {/* STEP 4: Review & Submit */}
      {currentStep === 4 && (
        <div className="cyber-panel p-6 rounded space-y-6">
          <h2 className="font-display font-bold text-lg text-cyan-300 uppercase flex items-center space-x-2">
            <span>STEP 4 // AUDIT TELEMETRY SUMMARY & TRANSMIT</span>
          </h2>

          {/* Reporter Identification */}
          <div className="p-4 bg-black/60 border border-cyan-900/80 rounded space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-cyan-400 font-bold">REPORTER IDENTITY & REWARDS</span>
              <label className="flex items-center space-x-2 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="rounded border-cyan-500 text-cyan-500"
                />
                <span>Submit Anonymously</span>
              </label>
            </div>

            {!isAnonymous ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="text-slate-400 block mb-0.5">Cadet Callsign / Name:</label>
                  <input
                    type="text"
                    value={reporterName}
                    onChange={(e) => setReporterName(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-black border border-cyan-900 rounded text-cyan-200"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-0.5">Contact Comms / Email:</label>
                  <input
                    type="email"
                    value={reporterEmail}
                    onChange={(e) => setReporterEmail(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-black border border-cyan-900 rounded text-cyan-200"
                  />
                </div>
              </div>
            ) : (
              <div className="text-amber-300 text-[11px]">
                Report will be logged under public anonymous identifier. Personal contact data will not be transmitted.
              </div>
            )}
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
            <div className="p-4 bg-black/40 border border-slate-800 rounded space-y-2">
              <div className="text-cyan-400 font-bold border-b border-slate-800 pb-1 flex justify-between">
                <span>INCIDENT SPECIFICATIONS</span>
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="text-slate-400 hover:text-cyan-300 underline"
                >
                  Edit
                </button>
              </div>
              <div><strong className="text-slate-400">Title:</strong> {title}</div>
              <div><strong className="text-slate-400">Category:</strong> {CATEGORY_LABELS[category]}</div>
              <div><strong className="text-slate-400">Perceived Severity:</strong> {perceivedSeverity}</div>
              <div><strong className="text-slate-400">Observed:</strong> {new Date(observedAt).toLocaleString()}</div>
              <div>
                <strong className="text-slate-400">Description:</strong>
                <p className="mt-1 text-slate-300 line-clamp-3">{description}</p>
              </div>
            </div>

            <div className="p-4 bg-black/40 border border-slate-800 rounded space-y-2">
              <div className="text-cyan-400 font-bold border-b border-slate-800 pb-1 flex justify-between">
                <span>LOCATION & EVIDENCE</span>
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="text-slate-400 hover:text-cyan-300 underline"
                >
                  Edit
                </button>
              </div>
              <div><strong className="text-slate-400">Landmark:</strong> {locationName}</div>
              <div>
                <strong className="text-slate-400">Coordinates:</strong>{' '}
                {latitude && longitude ? `[${latitude}, ${longitude}]` : 'Approximate Zone (No GPS)'}
              </div>
              <div><strong className="text-slate-400">Precision:</strong> {locationPrecision}</div>
              <div>
                <strong className="text-slate-400">Evidence Image:</strong>{' '}
                {imagePreview ? '1 Photo Attached (Multimodal AI Enabled)' : 'None (Text Only)'}
              </div>
              {imagePreview && (
                <div className="h-16 w-24 rounded border border-cyan-500 overflow-hidden mt-1">
                  <img src={imagePreview} alt="Thumbnail" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          </div>

          {/* Submission progress overlay */}
          {isSubmitting && (
            <div className="p-4 bg-cyan-950/80 border border-cyan-400 rounded space-y-2 text-center font-mono text-xs">
              <div className="flex items-center justify-center space-x-2 text-cyan-300 font-bold">
                <Loader2 className="w-5 h-5 animate-spin text-cyan-400" />
                <span>{submissionProgress}</span>
              </div>
              <div className="w-full bg-black/60 h-2 rounded overflow-hidden">
                <div className="h-full bg-gradient-to-r from-cyan-400 to-pink-500 animate-pulse w-full"></div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Navigation & Submit Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-cyan-900/60 font-mono text-xs">
        {currentStep > 1 ? (
          <button
            type="button"
            onClick={handlePrevStep}
            disabled={isSubmitting}
            className="px-4 py-2.5 rounded bg-black/60 border border-slate-700 text-slate-300 hover:text-white hover:border-cyan-500 flex items-center space-x-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>PREVIOUS STEP</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onNavigate('/')}
            className="px-4 py-2.5 rounded bg-black/60 border border-slate-700 text-slate-400 hover:text-white"
          >
            CANCEL
          </button>
        )}

        {currentStep < 4 ? (
          <button
            type="button"
            onClick={handleNextStep}
            className="px-6 py-2.5 rounded bg-cyan-400 hover:bg-cyan-300 text-black font-display font-bold uppercase tracking-wider flex items-center space-x-2 cursor-pointer shadow-[0_0_15px_rgba(0,240,255,0.4)]"
          >
            <span>PROCEED TO STEP 0{currentStep + 1}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-8 py-3 rounded bg-gradient-to-r from-cyan-400 to-teal-400 hover:from-cyan-300 hover:to-teal-300 text-black font-display font-black text-sm uppercase tracking-wider flex items-center space-x-2.5 cursor-pointer shadow-[0_0_25px_rgba(0,240,255,0.6)] disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>TRANSMITTING TELEMETRY...</span>
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                <span>TRANSMIT INCIDENT REPORT</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};
