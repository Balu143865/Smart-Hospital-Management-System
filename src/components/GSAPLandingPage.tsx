import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'motion/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  Hospital, ShieldCheck, HeartPulse, Brain, Bone, Baby, Siren,
  Activity, ArrowRight, CheckCircle2, Star, UserCheck, Calendar,
  Sparkles, Bot, PhoneCall, Award, Clock, Stethoscope, Sun, Moon, LayoutDashboard,
  Menu, X, RefreshCw, FlaskConical, Pill, Video, ShieldAlert, FileText, Syringe,
  Quote, ThumbsUp, HelpCircle, ChevronDown, Search, BookOpen, ArrowUpRight, Tag,
  Mail, Send, MapPin, MessageSquare, Globe, Briefcase, Twitter, Linkedin, Facebook,
  Instagram, Youtube, Heart, ExternalLink, Github, Copy, Check
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useHospital } from '../context/HospitalContext';
import { useTheme } from '../context/ThemeContext';
import heroDoctorImg from '../assets/images/Doctor.png';

gsap.registerPlugin(ScrollTrigger);

const GoogleAssistantIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="6.5" cy="13.5" r="4" fill="#4285F4" />
    <circle cx="14" cy="7.5" r="2.8" fill="#EA4335" />
    <circle cx="17.5" cy="15.5" r="3.2" fill="#FBBC05" />
    <circle cx="21" cy="10" r="1.8" fill="#34A853" />
  </svg>
);

interface GSAPLandingPageProps {
  onGoToTab: (tab: any) => void;
  onOpenAuth: () => void;
}

const HOSPITAL_SERVICES = [
  {
    id: 'emergency',
    icon: Siren,
    title: '24/7 Emergency & Trauma Care',
    category: 'Critical Response',
    description: 'Level-1 accredited emergency trauma center with rapid ambulance dispatch, Code Red protocol, and immediate ICU triage.',
    badge: '24/7 Active',
    badgeColor: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800',
    iconBg: 'bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400',
    tab: 'telemetry'
  },
  {
    id: 'radiology',
    icon: Activity,
    title: 'AI Diagnostics & Radiology',
    category: 'Imaging & Scans',
    description: 'High-definition DICOM X-Rays, 3D CT reconstructions, Brain MRI scans, and instant downloadable PDF clinical reports.',
    badge: 'Digital DICOM',
    badgeColor: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-200 dark:border-cyan-800',
    iconBg: 'bg-cyan-100 dark:bg-cyan-950/80 text-cyan-600 dark:text-cyan-400',
    tab: 'laboratory'
  },
  {
    id: 'telehealth',
    icon: Video,
    title: 'Tele-Consultation & Virtual Care',
    category: 'Outpatient Care',
    description: 'HD virtual consultations with board-certified specialists, digital prescription delivery, and automated follow-ups.',
    badge: 'Virtual Visit',
    badgeColor: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800',
    iconBg: 'bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400',
    tab: 'appointments'
  },
  {
    id: 'pathology',
    icon: FlaskConical,
    title: 'Pathology & Specimen Testing',
    category: 'Laboratory Unit',
    description: 'Automated blood panels, lipid screens, liver profiles, and specimen tracking with instant patient portal delivery.',
    badge: 'NABL Accredited',
    badgeColor: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800',
    iconBg: 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400',
    tab: 'laboratory'
  },
  {
    id: 'pharmacy',
    icon: Pill,
    title: '24/7 Smart Hospital Pharmacy',
    category: 'Medication Care',
    description: 'Fully automated hospital pharmacy handling e-prescriptions, dosage verification, and home medication delivery.',
    badge: 'In-House Pharmacy',
    badgeColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800',
    iconBg: 'bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400',
    tab: 'pharmacy'
  },
  {
    id: 'telemetry',
    icon: HeartPulse,
    title: 'ICU Telemetry & Vital Monitoring',
    category: 'Inpatient Care',
    description: 'Continuous SpO2, ECG, BP, and cardiac telemetry streaming live to centralized nursing control stations.',
    badge: 'Real-Time Stream',
    badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
    iconBg: 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400',
    tab: 'telemetry'
  },
  {
    id: 'ai-triage',
    icon: Bot,
    title: 'AI Symptom Triage Assistant',
    category: 'Smart Care',
    description: 'Interactive AI clinical assistant evaluating symptoms, estimating triage priority, and matching appropriate specialists.',
    badge: 'AI Powered',
    badgeColor: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800',
    iconBg: 'bg-purple-100 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400',
    tab: 'ai-assistant'
  },
  {
    id: 'checkup',
    icon: ShieldCheck,
    title: 'Preventive Health Checkup Packages',
    category: 'Wellness & Prevention',
    description: 'Executive health screens, cardiac risk profiling, diabetic evaluations, and full-body wellness packages.',
    badge: 'Custom Packages',
    badgeColor: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-200 dark:border-teal-800',
    iconBg: 'bg-teal-100 dark:bg-teal-950/80 text-teal-600 dark:text-teal-400',
    tab: 'appointments'
  }
];

const PATIENT_TESTIMONIALS = [
  {
    id: 1,
    name: 'Sarah Jenkins',
    role: 'Cardiac Surgery Patient',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200',
    rating: 5,
    department: 'Cardiology',
    date: 'July 2026',
    comment: 'The 24/7 telemetry monitoring and immediate response team saved my life during my cardiac procedure. The digital DICOM portal meant my family stayed updated in real time.',
    verified: true
  },
  {
    id: 2,
    name: 'David Miller',
    role: 'Orthopedic Rehabilitation',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
    rating: 5,
    department: 'Orthopedics',
    date: 'June 2026',
    comment: 'Dr. Elena Rostova and the rehab team had me walking smoothly in 3 weeks post knee replacement. Booking appointments through the patient portal was effortless.',
    verified: true
  },
  {
    id: 3,
    name: 'Priya Patel',
    role: 'Maternity & Pediatric Care',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200',
    rating: 5,
    department: 'Pediatric Unit',
    date: 'August 2026',
    comment: 'Exceptional care during my delivery! The automated prescription delivery and tele-consultation follow-ups made postpartum care completely stress-free.',
    verified: true
  },
  {
    id: 4,
    name: 'Marcus Vance',
    role: 'Neurology Consultation',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200',
    rating: 5,
    department: 'Neurology',
    date: 'May 2026',
    comment: 'The AI Symptom Assistant instantly flagged my condition and scheduled an urgent MRI scan. I downloaded my PDF report within 10 minutes of completing the scan!',
    verified: true
  }
];

const FAQ_CATEGORIES = [
  { id: 'all', label: 'All Questions' },
  { id: 'appointments', label: 'Appointments & Care' },
  { id: 'emergency', label: 'Emergency & ICU' },
  { id: 'digital', label: 'AI & Telehealth' },
  { id: 'billing', label: 'Billing & Insurance' },
];

const HOSPITAL_FAQS = [
  {
    id: 1,
    category: 'appointments',
    categoryLabel: 'Appointments & Care',
    question: 'How do I book an in-person or virtual doctor appointment?',
    answer: 'You can instantly schedule an appointment using our digital booking portal. Select your desired department or specialist, choose a convenient date/time slot, and confirm. You will receive an instant SMS and email confirmation with your digital appointment token.'
  },
  {
    id: 2,
    category: 'emergency',
    categoryLabel: 'Emergency & ICU',
    question: 'What happens during a Level-1 Emergency Code Red dispatch?',
    answer: 'Our Level-1 accredited trauma center operates 24/7/365. When an emergency alert or Code Red is triggered, our rapid response team dispatches a fully equipped critical care ambulance with live GPS tracking and telemetry streaming directly to our ICU control station.'
  },
  {
    id: 3,
    category: 'digital',
    categoryLabel: 'AI & Telehealth',
    question: 'How does the AI Symptom Triage Assistant help me?',
    answer: 'Our AI Symptom Assistant evaluates your reported symptoms using clinically validated medical protocols. It provides instant preliminary triage recommendations, guides you on urgency (emergency vs. outpatient), and directly connects you with the appropriate specialist.'
  },
  {
    id: 4,
    category: 'digital',
    categoryLabel: 'AI & Telehealth',
    question: 'Can I view and download my Radiology & Pathology test reports online?',
    answer: 'Yes! All DICOM X-rays, 3D CT scans, Brain MRIs, and pathology lab reports are uploaded directly to your secure patient portal. You can view high-definition scans in your browser or download signed official PDF reports anytime.'
  },
  {
    id: 5,
    category: 'billing',
    categoryLabel: 'Billing & Insurance',
    question: 'Which health insurance providers and payment methods are accepted?',
    answer: 'We partner with over 45 major health insurance networks for cashless claims. For self-pay treatments, we support instant online payments via credit/debit cards, net banking, UPI, and integrated Razorpay payment gateways with instant downloadable tax receipts.'
  },
  {
    id: 6,
    category: 'appointments',
    categoryLabel: 'Appointments & Care',
    question: 'What are the visiting hours for inpatient wards and ICU care units?',
    answer: 'General inpatient ward visiting hours are from 10:00 AM – 12:00 PM and 4:00 PM – 7:00 PM daily. ICU visiting hours are strictly restricted to 11:00 AM – 12:00 PM and 5:00 PM – 6:00 PM with one visitor allowed at a time for patient safety.'
  },
  {
    id: 7,
    category: 'digital',
    categoryLabel: 'AI & Telehealth',
    question: 'How does automated e-prescription home delivery work?',
    answer: 'Following your virtual consultation or hospital discharge, your doctor issues a digitally signed e-prescription. Our 24/7 in-house smart pharmacy verifies dosage and delivers medications directly to your doorstep within 2 to 4 hours.'
  },
  {
    id: 8,
    category: 'billing',
    categoryLabel: 'Billing & Insurance',
    question: 'How do I request an itemized hospital bill estimate prior to surgery?',
    answer: 'You can request a pre-procedure cost estimate through the patient portal or by contacting our patient assistance desk. Our billing team generates a transparent breakdown including surgeon fees, OT charges, room stay, and estimated medicine costs.'
  }
];

const MEDICAL_ARTICLES = [
  {
    id: 1,
    title: 'Innovations in Robotic Cardiac Surgery & Recovery Timelines',
    excerpt: 'How minimally invasive robotic assistance reduces hospital stays by 60% and accelerates patient recovery without large thoracic incisions.',
    content: `Minimally invasive robotic cardiac surgery represents a monumental leap forward in cardiovascular medicine. By utilizing high-definition 3D visualization and wristed instrumentation through small 1-cm ports, cardiac surgeons can perform intricate valve repairs and coronary revascularizations with extreme precision.\n\nKey Patient Benefits:\n• Reduced ICU Stay: Patients transition out of intensive care in under 24 hours.\n• Minimal Blood Loss: Significantly decreases blood transfusion requirements.\n• Faster Return to Normal Life: Most patients resume light activities within 10–14 days instead of 8–12 weeks associated with traditional open-heart surgery.\n\nAt Smart Hospital, our hybrid surgical suites combine live 3D echocardiography with real-time robotic feedback to ensure optimal patient outcomes.`,
    category: 'Cardiology',
    author: 'Dr. Alexander Vance',
    authorRole: 'Chief of Robotic Cardiac Surgery',
    authorAvatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200',
    date: 'August 2, 2026',
    readTime: '5 min read',
    image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800',
    tags: ['Cardiology', 'Robotic Surgery', 'Recovery']
  },
  {
    id: 2,
    title: 'Understanding AI Triage: Spotting Micro-Ischemic Stroke Signs Early',
    excerpt: 'Discover how continuous telemetry data and AI neural models detect cerebral blood flow abnormalities long before acute clinical symptoms emerge.',
    content: `Acute ischemic strokes require hyper-rapid medical intervention. Every minute counts when brain tissue experiences oxygen deprivation. Smart Hospital's integrated AI stroke prevention network continuously analyzes emergency patient telemetry and neuro-imaging scans.\n\nHow AI AI Triage Works:\n1. Automatic Scan Evaluation: AI algorithms scan brain CT & MRI DICOM files within 30 seconds of acquisition.\n2. Vessel Occlusion Detection: Identifies large vessel occlusions (LVO) with 99.2% accuracy.\n3. Instant Code Stroke Dispatch: Automatically alerts on-duty neuro-interventionalists before the patient is even moved from radiology.\n\nEarly intervention through mechanical thrombectomy within the golden hour preserves speech, mobility, and cognitive function.`,
    category: 'Neurology',
    author: 'Dr. Elena Rostova',
    authorRole: 'Head of Neuro-Telemetry & ICU',
    authorAvatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200',
    date: 'July 28, 2026',
    readTime: '4 min read',
    image: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=800',
    tags: ['Neurology', 'AI Health', 'Stroke Care']
  },
  {
    id: 3,
    title: 'Pediatric Wellness: Essential Vaccines & Immunity Booster Roadmap',
    excerpt: 'A comprehensive pediatric health guide covering essential immunizations, seasonal protection, and developmental milestones for children.',
    content: `Childhood immunization is the cornerstone of lifelong preventive health. Protecting children from preventable infectious diseases requires a well-structured vaccine schedule and proactive wellness check-ups.\n\nKey Pediatric Guidelines:\n• Newborn & Infant Shields: Core vaccines against Hepatitis B, Rotavirus, and DTaP during the first 6 months.\n• Seasonal Flu & Respiratory Protection: Recommended annually prior to winter flu peaks.\n• Nutrition & Immunity: Balancing probiotic-rich diets with adequate Vitamin D and sleep hygiene.\n\nOur pediatric unit offers child-friendly vaccination suites and automated digital reminder alerts for busy parents.`,
    category: 'Pediatrics',
    author: 'Dr. Sarah Lin',
    authorRole: 'Lead Consultant Pediatrician',
    authorAvatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200',
    date: 'July 20, 2026',
    readTime: '6 min read',
    image: 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=800',
    tags: ['Pediatrics', 'Vaccinations', 'Child Health']
  },
  {
    id: 4,
    title: 'Preventive Cardiology: 5 Daily Habits to Protect Your Vascular System',
    excerpt: 'Evidence-based dietary tweaks, stress reduction routines, and aerobic guidelines recommended by senior cardiologists to maintain healthy blood pressure.',
    content: `Cardiovascular disease remains the leading global cause of health complications, yet up to 80% of premature heart attacks and strokes are preventable through targeted lifestyle choices.\n\nFive Pillars of Heart Health:\n1. Mediterranean-Style Diet: Prioritizing olive oil, leafy greens, walnuts, and fatty fish high in Omega-3.\n2. Consistent 150-Min Weekly Cardio: Moderate brisk walking, swimming, or cycling lowers arterial stiffness.\n3. Restful Sleep Hygiene: Achieving 7-8 hours of uninterrupted sleep lowers nocturnal cortisol levels.\n4. Sodium & Sugar Management: Keeping daily sodium below 2,000 mg prevents hypertension.\n5. Regular Health Screening: Annual lipid panels and continuous blood pressure tracking.`,
    category: 'Wellness',
    author: 'Dr. Marcus Thorne',
    authorRole: 'Senior Preventive Cardiologist',
    authorAvatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=200',
    date: 'July 12, 2026',
    readTime: '3 min read',
    image: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800',
    tags: ['Heart Health', 'Nutrition', 'Preventive Care']
  }
];

export const GSAPLandingPage: React.FC<GSAPLandingPageProps> = ({ onGoToTab, onOpenAuth }) => {
  const { switchRole } = useAuth();
  const { doctors, departments, triggerEmergencyAlert } = useHospital();
  const { isDark, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaqId, setOpenFaqId] = useState<number | null>(1);
  const [activeFaqCategory, setActiveFaqCategory] = useState<string>('all');
  const [faqSearchQuery, setFaqSearchQuery] = useState<string>('');
  const [activeArticleCategory, setActiveArticleCategory] = useState<string>('All');
  const [selectedArticle, setSelectedArticle] = useState<typeof MEDICAL_ARTICLES[0] | null>(null);

  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    department: 'General Administration',
    subject: '',
    message: ''
  });
  const [isSubmittingContact, setIsSubmittingContact] = useState(false);
  const [contactSuccess, setContactSuccess] = useState(false);

  // Emergency Call Modal State
  const [callModalOpen, setCallModalOpen] = useState(false);
  const [activeCallNumber, setActiveCallNumber] = useState('+91 63040 45279');
  const [activeCallLabel, setActiveCallLabel] = useState('Emergency Hotline');
  const [copiedNumber, setCopiedNumber] = useState(false);
  const [ambulanceDispatched, setAmbulanceDispatched] = useState(false);

  const handleEmergencyCall = (label: string = 'Emergency Hotline', phoneNum: string = '+91 63040 45279') => {
    setActiveCallLabel(label);
    setActiveCallNumber(phoneNum);
    setCopiedNumber(false);
    setAmbulanceDispatched(false);
    setCallModalOpen(true);
    triggerEmergencyAlert(`Emergency Call Triggered (${label})`, `Direct hotline call initiated to ${phoneNum}. Location: Macherla, Palnadu.`);
  };

  const copyPhoneNumber = () => {
    navigator.clipboard.writeText(activeCallNumber);
    setCopiedNumber(true);
    setTimeout(() => setCopiedNumber(false), 2000);
  };

  const handleDispatchAmbulance = () => {
    triggerEmergencyAlert('Ambulance Unit Dispatch', `Emergency ambulance unit dispatched to Macherla, Palnadu. Contact: ${activeCallNumber}`);
    setAmbulanceDispatched(true);
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email || !contactForm.message) return;
    setIsSubmittingContact(true);

    try {
      await triggerEmergencyAlert(
        `Inquiry: ${contactForm.subject || contactForm.department}`,
        `Administrative Inquiry from ${contactForm.name} (${contactForm.email}, Phone: ${contactForm.phone || 'N/A'}). Dept: ${contactForm.department}. Details: ${contactForm.message}`
      );
    } catch (err) {
      console.error('Error triggering inquiry alert:', err);
    }

    setTimeout(() => {
      setIsSubmittingContact(false);
      setContactSuccess(true);
      setContactForm({
        name: '',
        email: '',
        phone: '',
        department: 'General Administration',
        subject: '',
        message: ''
      });
    }, 750);
  };

  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    setNewsletterSubscribed(true);
    setTimeout(() => {
      setNewsletterEmail('');
    }, 3000);
  };

  // Floating Live Chat Widget State
  const [liveChatOpen, setLiveChatOpen] = useState(false);
  const [unreadChatBadge, setUnreadChatBadge] = useState(true);
  const [liveChatInput, setLiveChatInput] = useState('');
  const [liveChatSending, setLiveChatSending] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ id: string; sender: 'bot' | 'user'; text: string; time: string }>>([
    {
      id: 'msg-1',
      sender: 'bot',
      text: '👋 Hello! Welcome to SmartCare Hospital, Macherla. How can we assist you today?',
      time: 'Just now'
    },
    {
      id: 'msg-2',
      sender: 'bot',
      text: 'You can ask about appointments, emergency trauma response, lab reports, or submit an instant administrative inquiry.',
      time: 'Just now'
    }
  ]);

  const handleOpenLiveChat = () => {
    setLiveChatOpen(true);
    setUnreadChatBadge(false);
  };

  const handleSendChatMessage = async (customText?: string) => {
    const messageToSend = customText || liveChatInput;
    if (!messageToSend.trim()) return;

    const userMsgId = `user-${Date.now()}`;
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newMsg = {
      id: userMsgId,
      sender: 'user' as const,
      text: messageToSend,
      time: nowTime
    };

    setChatMessages((prev) => [...prev, newMsg]);
    if (!customText) setLiveChatInput('');
    setLiveChatSending(true);

    try {
      await triggerEmergencyAlert(
        'Live Chat Inquiry',
        `Live Chat Inquiry: "${messageToSend}". Location: Macherla, Palnadu.`
      );
    } catch (e) {
      console.error('Error sending chat alert:', e);
    }

    setTimeout(() => {
      setLiveChatSending(false);
      let replyText = 'Thank you for contacting SmartCare Front Desk! Your inquiry has been logged with administration in Macherla, Palnadu. A coordinator will follow up shortly.';

      const lower = messageToSend.toLowerCase();
      if (lower.includes('appointment') || lower.includes('book') || lower.includes('doctor')) {
        replyText = '📅 You can schedule a specialist doctor appointment directly from our Patient Portal. Click "Appointments" in the navigation menu.';
      } else if (lower.includes('emergency') || lower.includes('ambulance') || lower.includes('call') || lower.includes('trauma')) {
        replyText = '🚨 For immediate medical emergencies, please call our 24/7 Helpline at +91 63040 45279 or click the Emergency Call button in the chat header.';
      } else if (lower.includes('report') || lower.includes('lab') || lower.includes('test') || lower.includes('pathology')) {
        replyText = '🧪 Pathology and Radiology lab reports are available for instant viewing & download under the Lab Results tab.';
      } else if (lower.includes('address') || lower.includes('location') || lower.includes('macherla')) {
        replyText = '📍 Hospital Location: Macherla, Palnadu, Andhra Pradesh - 522426. Helpline: +91 63040 45279.';
      }

      setChatMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text: replyText,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }, 750);
  };

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const heroRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const deptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Subtle scroll-triggered fade-in for hero badge
      gsap.from('.gsap-hero-badge', {
        scrollTrigger: {
          trigger: heroRef.current,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
        opacity: 0,
        y: 15,
        duration: 0.6,
        ease: 'power3.out'
      });

      // Subtle scroll-triggered fade-in for hero title
      gsap.from('.gsap-hero-title', {
        scrollTrigger: {
          trigger: '.gsap-hero-title',
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
        opacity: 0,
        y: 20,
        duration: 0.7,
        delay: 0.1,
        ease: 'power3.out'
      });

      // Subtle scroll-triggered fade-in for hero subtitle
      gsap.from('.gsap-hero-sub', {
        scrollTrigger: {
          trigger: '.gsap-hero-sub',
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
        opacity: 0,
        y: 15,
        duration: 0.6,
        delay: 0.2,
        ease: 'power3.out'
      });

      // Subtle scroll-triggered fade-in for hero CTA
      gsap.from('.gsap-hero-cta', {
        scrollTrigger: {
          trigger: '.gsap-hero-cta',
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
        opacity: 0,
        scale: 0.98,
        y: 12,
        duration: 0.6,
        delay: 0.25,
        ease: 'power3.out'
      });

      // Feature tags fade-in
      gsap.from('.gsap-hero-tags', {
        scrollTrigger: {
          trigger: '.gsap-hero-tags',
          start: 'top 90%',
          toggleActions: 'play none none none',
        },
        opacity: 0,
        y: 10,
        duration: 0.5,
        delay: 0.3,
        ease: 'power2.out'
      });

      // Doctor Image container fade-in
      gsap.from('.gsap-hero-image', {
        scrollTrigger: {
          trigger: '.gsap-hero-image',
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
        opacity: 0,
        scale: 0.96,
        duration: 0.8,
        delay: 0.15,
        ease: 'power3.out'
      });

      // Quick Role Cards fade-in
      gsap.from('.gsap-stat-card', {
        scrollTrigger: {
          trigger: '.gsap-stat-card',
          start: 'top 90%',
          toggleActions: 'play none none none',
        },
        opacity: 0,
        y: 15,
        stagger: 0.08,
        duration: 0.5,
        delay: 0.3,
        ease: 'power2.out',
        clearProps: 'all'
      });
    }, heroRef);

    return () => ctx.revert();
  }, []);

  const handleQuickRoleLogin = (role: any) => {
    switchRole(role);
    onGoToTab('dashboard');
  };

  return (
    <div ref={heroRef} className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors max-w-full overflow-x-hidden">
      
      {/* Public Top Navbar */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors max-w-full overflow-hidden">
        <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-1.5 sm:gap-4 overflow-hidden">
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/20">
              <Hospital className="w-5 h-5" />
            </div>
            <div>
              <span className="text-sm sm:text-base font-black tracking-tight text-slate-900 dark:text-white block leading-none">
                Smart Hospital <span className="text-cyan-600 dark:text-cyan-400">OS</span>
              </span>
              <span className="text-[9px] sm:text-[10px] text-slate-400 font-semibold tracking-wider uppercase">Public Health Portal</span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600 dark:text-slate-300">
            <a href="#services" className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">Services</a>
            <a href="#specialties" className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">Specialties</a>
            <a href="#doctors" className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">Doctors Directory</a>
            <a href="#testimonials" className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">Testimonials</a>
            <a href="#insights" className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">Medical Insights</a>
            <a href="#faq" className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">FAQ</a>
            <a href="#contact" className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">Contact</a>
            <button onClick={() => onGoToTab('ai-assistant')} className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors flex items-center gap-1 cursor-pointer">
              <Bot className="w-3.5 h-3.5 text-cyan-500" />
              <span>AI Triage</span>
            </button>
            <button onClick={() => onGoToTab('appointments')} className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors cursor-pointer">
              Book Slot
            </button>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-3">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors cursor-pointer"
              title="Toggle Dark/Light Theme"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>

            <button
              onClick={() => triggerEmergencyAlert('Emergency Code Red', 'Code Red alert triggered from public landing page portal.')}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-300 dark:border-rose-800 text-xs font-bold hover:bg-rose-500 hover:text-white transition-all cursor-pointer"
            >
              <Siren className="w-3.5 h-3.5 animate-pulse" />
              <span>Emergency Code</span>
            </button>

            <button
              onClick={() => onGoToTab('dashboard')}
              className="px-3 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-bold text-xs shadow-md shadow-cyan-500/20 flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span className="hidden xs:inline sm:inline">Launch Dashboard</span>
              <span className="xs:hidden sm:hidden">Dashboard</span>
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Toggle Navigation Menu"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-cyan-600 dark:text-cyan-400" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Overlay via Portal */}
      {mobileMenuOpen && createPortal(
        <div className="fixed inset-0 z-[9999] md:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer Container */}
          <div className="relative w-80 max-w-[85vw] bg-white dark:bg-slate-900 h-full p-5 flex flex-col justify-between shadow-2xl z-10 overflow-y-auto animate-in slide-in-from-right duration-200 ml-auto border-l border-slate-200 dark:border-slate-800">
            <div>
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white shadow-md">
                    <Hospital className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-sm font-black text-slate-900 dark:text-white block leading-none">
                      Smart Hospital <span className="text-cyan-600 dark:text-cyan-400">OS</span>
                    </span>
                    <span className="text-[9px] text-slate-400 font-medium uppercase tracking-wider">Public Portal</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="space-y-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200">
                <a
                  href="#services"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Activity className="w-4 h-4 text-cyan-500" />
                    <span>Clinical Services</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </a>

                <a
                  href="#specialties"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Stethoscope className="w-4 h-4 text-cyan-500" />
                    <span>Specialties</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </a>

                <a
                  href="#doctors"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <UserCheck className="w-4 h-4 text-blue-500" />
                    <span>Doctors Directory</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </a>

                <a
                  href="#insights"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <BookOpen className="w-4 h-4 text-emerald-500" />
                    <span>Medical Insights Blog</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </a>

                <a
                  href="#faq"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <HelpCircle className="w-4 h-4 text-purple-500" />
                    <span>Frequently Asked Questions</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </a>

                <a
                  href="#contact"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-cyan-500" />
                    <span>Contact Administration</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </a>

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onGoToTab('ai-assistant');
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <Bot className="w-4 h-4 text-emerald-500" />
                    <span>AI Symptom Triage</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </button>

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onGoToTab('appointments');
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-purple-500" />
                    <span>Book Appointment Slot</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </button>
              </nav>

              <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    triggerEmergencyAlert('Emergency Code Red', 'Code Red alert triggered from mobile portal navigation menu.');
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50 text-xs font-bold hover:bg-rose-500 hover:text-white transition-all cursor-pointer"
                >
                  <Siren className="w-4 h-4 animate-pulse" />
                  <span>Trigger Emergency Code Red</span>
                </button>

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onGoToTab('dashboard');
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold text-xs shadow-md shadow-cyan-500/20 cursor-pointer mt-2"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Launch Enterprise Console</span>
                </button>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider block mb-2">Quick Role Access</span>
              <div className="grid grid-cols-2 gap-1.5 text-[11px] font-semibold">
                <button
                  onClick={() => { setMobileMenuOpen(false); handleQuickRoleLogin('admin'); }}
                  className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-cyan-50 dark:hover:bg-cyan-950/50 hover:text-cyan-600 text-slate-700 dark:text-slate-300 transition-colors"
                >
                  Admin
                </button>
                <button
                  onClick={() => { setMobileMenuOpen(false); handleQuickRoleLogin('doctor'); }}
                  className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-cyan-50 dark:hover:bg-cyan-950/50 hover:text-cyan-600 text-slate-700 dark:text-slate-300 transition-colors"
                >
                  Doctor
                </button>
                <button
                  onClick={() => { setMobileMenuOpen(false); handleQuickRoleLogin('receptionist'); }}
                  className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-cyan-50 dark:hover:bg-cyan-950/50 hover:text-cyan-600 text-slate-700 dark:text-slate-300 transition-colors"
                >
                  Receptionist
                </button>
                <button
                  onClick={() => { setMobileMenuOpen(false); handleQuickRoleLogin('patient'); }}
                  className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-cyan-50 dark:hover:bg-cyan-950/50 hover:text-cyan-600 text-slate-700 dark:text-slate-300 transition-colors"
                >
                  Patient
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-5 pb-4 sm:pt-8 sm:pb-6 lg:pt-10 lg:pb-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        
        {/* Decorative Ambient Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-96 bg-gradient-to-tr from-cyan-500/10 via-blue-500/10 to-emerald-500/10 blur-3xl rounded-full -z-10" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-center">
          
          {/* Left Side: Hero Content */}
          <div className="lg:col-span-7 text-left space-y-3 sm:space-y-4">
            <div className="gsap-hero-badge inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-100 dark:bg-cyan-950/80 border border-cyan-300 dark:border-cyan-800 text-cyan-800 dark:text-cyan-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-cyan-500 animate-pulse" />
              <span>Enterprise MERN Smart Hospital Operating System</span>
            </div>

            <h1 className="gsap-hero-title text-3xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl font-extrabold tracking-tight leading-[1.15] text-slate-900 dark:text-white">
              Next-Gen Connected Healthcare & <span className="bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">Smart Clinical Workflow</span>
            </h1>

            <p className="gsap-hero-sub text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-normal max-w-2xl">
              Unified digital ecosystem powering Role-Based Access Control for Super Admins, Hospital Admins, Doctors, Receptionists, and Patients with real-time telemetry, AI triage, and Razorpay payment integration.
            </p>

            <div className="gsap-hero-cta pt-0.5 flex flex-wrap items-center gap-3">
              <button
                onClick={() => onGoToTab('dashboard')}
                className="px-5 sm:px-6 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-cyan-500/25 flex items-center gap-2 transition-all cursor-pointer hover:scale-[1.02]"
              >
                <span>Launch Enterprise Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onGoToTab('ai-assistant')}
                className="px-5 sm:px-6 py-2.5 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-xs sm:text-sm rounded-xl shadow-sm flex items-center gap-2 transition-all cursor-pointer hover:scale-[1.02]"
              >
                <Bot className="w-4 h-4 text-cyan-500" />
                <span>AI Symptom Triage</span>
              </button>
            </div>

            {/* Quick feature pill tags */}
            <div className="gsap-hero-tags pt-2 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>NABH Accredited</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-cyan-500 shrink-0" />
                <span>24/7 AI Telemetry</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" />
                <span>ISO 27001 EHR</span>
              </div>
            </div>
          </div>

          {/* Right Side: Large Round Shape Professional Doctor Image */}
          <div className="gsap-hero-image lg:col-span-5 relative flex justify-center items-center mt-3 mb-2 sm:mt-5 sm:mb-3 lg:my-0 max-w-full">
            
            {/* Outer Ambient Glow */}
            <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/25 via-blue-500/20 to-emerald-500/20 blur-3xl rounded-full -z-10" />

            {/* Outer Decorative Dashed Ring (Spins independently around the photo) */}
            <div className="absolute -inset-2.5 sm:-inset-4 rounded-full border-2 border-dashed border-cyan-500/40 dark:border-cyan-400/30 animate-[spin_50s_linear_infinite] pointer-events-none" />

            {/* Inner Glowing Gradient Border Ring (Static) */}
            <div className="relative p-1 sm:p-1.5 rounded-full bg-gradient-to-tr from-cyan-500 via-blue-600 to-emerald-400 shadow-2xl shadow-cyan-500/30">
              
              {/* Round Shape Doctor Image Container (Static & Large) */}
              <div className="w-[260px] h-[260px] xs:w-[280px] xs:h-[280px] sm:w-80 sm:h-80 md:w-88 md:h-88 lg:w-[380px] lg:h-[380px] xl:w-[420px] xl:h-[420px] rounded-full overflow-hidden relative border-4 border-white dark:border-slate-900 bg-slate-100 dark:bg-slate-800 shadow-2xl group">
                <img
                  src={heroDoctorImg}
                  alt="Dr. Balu Naik, MD - Chief Medical Officer & Senior Surgeon"
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700 ease-out"
                  referrerPolicy="no-referrer"
                />
                
                {/* Glassmorphism Gradient Overlay at bottom of circle */}
                <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent flex items-end justify-center pb-3.5 sm:pb-5 text-center px-3 sm:px-4 backdrop-blur-[1px]">
                  <div>
                    <p className="text-white font-black text-sm sm:text-base tracking-tight drop-shadow-md">Dr. Balu Naik, MD</p>
                    <p className="text-cyan-300 font-bold text-[10px] sm:text-xs tracking-wide">Chief Surgeon & Medical Director</p>
                  </div>
                </div>
              </div>

            </div>

            {/* Floating Top Left Rating Badge */}
            <div className="absolute top-0 left-1 sm:top-2 sm:-left-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 shadow-xl rounded-xl p-1.5 sm:p-2.5 flex items-center gap-1.5 sm:gap-2 z-10">
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-amber-500" />
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1">
                  <span className="font-extrabold text-[11px] sm:text-xs text-slate-900 dark:text-white">4.9 / 5.0</span>
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                <p className="text-[8px] sm:text-[9px] text-slate-500 dark:text-slate-400 font-medium whitespace-nowrap">1,200+ Reviews</p>
              </div>
            </div>

            {/* Floating Bottom Right Telemetry Badge */}
            <div className="absolute bottom-0 right-1 sm:bottom-2 sm:-right-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 shadow-xl rounded-xl p-1.5 sm:p-2.5 flex items-center gap-1.5 sm:gap-2 z-10">
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                <HeartPulse className="w-3 h-3 sm:w-4 sm:h-4 animate-pulse" />
              </div>
              <div className="text-left">
                <span className="font-extrabold text-[11px] sm:text-xs text-slate-900 dark:text-white block leading-none">24/7 Verified</span>
                <span className="text-[8px] sm:text-[9px] text-emerald-600 dark:text-emerald-400 font-semibold tracking-tight whitespace-nowrap">Active On-Call</span>
              </div>
            </div>

            {/* Floating Right Surgery Badge */}
            <div className="absolute top-1/2 -right-2 sm:-right-5 -translate-y-1/2 hidden md:flex bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 shadow-xl rounded-xl px-3 py-2 items-center gap-2 z-10">
              <Award className="w-4 h-4 text-cyan-500 shrink-0" />
              <div className="text-left">
                <p className="text-xs font-bold text-slate-900 dark:text-white leading-none">15,000+</p>
                <p className="text-[9px] text-slate-400 font-medium">Surgeries</p>
              </div>
            </div>

          </div>

        </div>

        {/* Interactive Quick Portal Role Switcher Cards */}
        <div className="mt-3 sm:mt-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-4">
          {[
            { role: 'Super Admin', desc: 'Global Audit & System Config', color: 'from-rose-500 to-pink-600' },
            { role: 'Hospital Admin', desc: 'Departments, Staff & Finance', color: 'from-indigo-500 to-purple-600' },
            { role: 'Doctor', desc: 'EHR, Queue & Prescriptions', color: 'from-emerald-500 to-teal-600' },
            { role: 'Receptionist', desc: 'Check-in & Booking Desk', color: 'from-amber-500 to-orange-600' },
            { role: 'Patient', desc: 'Appointments & Razorpay Bill', color: 'from-cyan-500 to-blue-600' },
          ].map((r, idx) => (
            <motion.div
              key={r.role}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              whileHover={{ y: -6, scale: 1.02 }}
              onClick={() => handleQuickRoleLogin(r.role)}
              className="gsap-stat-card relative p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800/80 shadow-sm hover:shadow-xl hover:shadow-cyan-500/10 hover:border-cyan-500/60 dark:hover:border-cyan-400/60 transition-all duration-300 cursor-pointer group text-left overflow-hidden"
            >
              {/* Top Accent Gradient Line */}
              <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${r.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-t-2xl`} />

              {/* Ambient Glow */}
              <div className="absolute -right-6 -bottom-6 w-20 h-20 bg-cyan-500/10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500 pointer-events-none" />

              <div className="relative z-10">
                <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-r ${r.color} flex items-center justify-center text-white mb-2.5 sm:mb-3 shadow-sm group-hover:scale-110 group-hover:-rotate-6 transition-all duration-300`}>
                  <ShieldCheck className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                </div>
                <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors flex items-center justify-between">
                  <span>{r.role}</span>
                  <ArrowRight className="w-3 h-3 text-cyan-500 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                </h3>
                <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                  {r.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

      </section>

      {/* Hospital Metrics Counters */}
      <section ref={statsRef} className="bg-white dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800 py-8 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { val: '99.8%', label: 'Surgical Success Rate', color: 'text-cyan-600 dark:text-cyan-400', bg: 'hover:border-cyan-500/40' },
            { val: '150+', label: 'ICU Bed Telemetry Units', color: 'text-emerald-600 dark:text-emerald-400', bg: 'hover:border-emerald-500/40' },
            { val: '24/7', label: 'Level-1 Trauma Rapid Response', color: 'text-blue-600 dark:text-blue-400', bg: 'hover:border-blue-500/40' },
            { val: '15,000+', label: 'Digitized Patient EHR Records', color: 'text-indigo-600 dark:text-indigo-400', bg: 'hover:border-indigo-500/40' },
          ].map((m, idx) => (
            <motion.div
              key={m.label}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: idx * 0.08 }}
              whileHover={{ y: -4, scale: 1.03 }}
              className={`p-4 rounded-2xl bg-slate-50/50 dark:bg-slate-800/30 border border-slate-200/60 dark:border-slate-800 shadow-sm ${m.bg} transition-all duration-300 text-center group cursor-default`}
            >
              <p className={`text-3xl sm:text-4xl font-black ${m.color} group-hover:scale-105 transition-transform duration-300`}>{m.val}</p>
              <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400 mt-1">{m.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Comprehensive Healthcare Services Section */}
      <section id="services" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-b border-slate-200/80 dark:border-slate-800/80">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-100 dark:bg-cyan-950 border border-cyan-300 dark:border-cyan-800 text-cyan-700 dark:text-cyan-300 text-xs font-semibold mb-3">
              <Activity className="w-3.5 h-3.5 text-cyan-500 animate-pulse" />
              <span>Comprehensive Clinical Capabilities</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Hospital Care & Digital Services
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
              End-to-end medical care powered by real-time telemetry, advanced AI diagnostics, and seamless digital patient workflows.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onGoToTab('appointments')}
              className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-cyan-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Calendar className="w-4 h-4" />
              <span>Book Appointment</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {HOSPITAL_SERVICES.map((srv, idx) => {
            const IconComp = srv.icon;
            return (
              <motion.div
                key={srv.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                whileHover={{ y: -8, scale: 1.02 }}
                onClick={() => onGoToTab(srv.tab)}
                className="group relative p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 shadow-sm hover:shadow-2xl hover:shadow-cyan-500/10 hover:border-cyan-500/60 dark:hover:border-cyan-400/60 transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer"
              >
                {/* Top Animated Gradient Highlight Bar */}
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-t-2xl" />

                {/* Ambient Blur Backglow Effect */}
                <div className="absolute -right-10 -bottom-10 w-28 h-28 bg-cyan-500/10 dark:bg-cyan-500/15 rounded-full blur-2xl group-hover:scale-150 group-hover:bg-cyan-500/25 transition-all duration-500 pointer-events-none" />

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl ${srv.iconBg} flex items-center justify-center font-bold shadow-sm group-hover:scale-110 group-hover:-rotate-6 group-hover:shadow-md transition-all duration-300`}>
                      <IconComp className="w-6 h-6" />
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${srv.badgeColor} group-hover:scale-105 transition-transform`}>
                      {srv.badge}
                    </span>
                  </div>

                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">
                    {srv.category}
                  </span>

                  <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                    {srv.title}
                  </h3>

                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                    {srv.description}
                  </p>
                </div>

                <div className="relative z-10 mt-6 pt-3.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onGoToTab(srv.tab);
                    }}
                    className="text-xs font-bold text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 flex items-center gap-1.5 cursor-pointer group/btn"
                  >
                    <span>Access Service</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1.5 transition-transform duration-300" />
                  </button>

                  <span className="flex items-center gap-1.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Service Operational" />
                    <span className="hidden group-hover:inline transition-all font-semibold">Active</span>
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Departments Showcase */}
      <section id="specialties" ref={deptRef} className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              Specialized Medical Centers
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Multi-disciplinary departments equipped with robotic surgical suites and telemetry.
            </p>
          </div>
          <button
            onClick={() => onGoToTab('departments')}
            className="text-xs font-bold text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>View All Departments</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {departments.slice(0, 3).map((dept, idx) => (
            <motion.div
              key={dept.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.08 }}
              whileHover={{ y: -8, scale: 1.02 }}
              onClick={() => onGoToTab('departments')}
              className="group relative p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-2xl hover:shadow-cyan-500/10 hover:border-cyan-500/60 dark:hover:border-cyan-400/60 transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer"
            >
              {/* Top Accent Gradient Bar */}
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-t-2xl" />

              {/* Ambient Glow */}
              <div className="absolute -right-8 -bottom-8 w-24 h-24 bg-cyan-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500 pointer-events-none" />

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-cyan-100 dark:bg-cyan-950/80 text-cyan-600 dark:text-cyan-400 flex items-center justify-center font-black text-sm shadow-sm group-hover:scale-110 group-hover:-rotate-6 transition-all duration-300">
                    {dept.code}
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800 group-hover:scale-105 transition-transform">
                    Specialized Center
                  </span>
                </div>

                <h3 className="font-bold text-lg text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors flex items-center justify-between">
                  <span>{dept.name}</span>
                  <ArrowRight className="w-4 h-4 text-cyan-500 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                </h3>

                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                  {dept.description}
                </p>
              </div>

              <div className="relative z-10 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
                <span>Head: <strong className="text-slate-900 dark:text-white font-semibold">{dept.headDoctorName}</strong></span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 font-semibold text-[11px] group-hover:bg-cyan-500/10 group-hover:text-cyan-600 dark:group-hover:text-cyan-300 transition-colors">
                  {dept.occupiedBeds}/{dept.totalBeds} Beds
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured Doctors Directory */}
      <section id="doctors" className="py-16 bg-slate-100/60 dark:bg-slate-900/40 border-t border-slate-200 dark:border-slate-800 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              Consult Top Specialists
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
              Board-certified medical consultants available for in-hospital visits and digital appointments.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-5">
            {doctors.map((doc, idx) => (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: idx * 0.05 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="group relative p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:shadow-cyan-500/10 hover:border-cyan-500/60 dark:hover:border-cyan-400/60 transition-all duration-300 text-center flex flex-col justify-between overflow-hidden"
              >
                {/* Top Accent Gradient Bar */}
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-t-2xl" />

                {/* Ambient Glow */}
                <div className="absolute -right-6 -bottom-6 w-20 h-20 bg-emerald-500/10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500 pointer-events-none" />

                <div className="relative z-10">
                  <div className="relative w-20 h-20 mx-auto mb-3">
                    <img
                      src={doc.avatar}
                      alt={doc.name}
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200';
                      }}
                      className="w-20 h-20 rounded-full object-cover ring-4 ring-cyan-500/20 group-hover:ring-cyan-500 group-hover:scale-105 shadow-sm transition-all duration-300"
                    />
                    <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900 animate-pulse" title="Active" />
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors line-clamp-1">{doc.name}</h4>
                  <p className="text-xs text-cyan-600 dark:text-cyan-400 font-medium mt-0.5 line-clamp-1">{doc.specialization}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">{doc.qualification}</p>

                  <div className="mt-3 flex items-center justify-center gap-1 text-amber-500 dark:text-amber-400 text-xs font-bold bg-amber-500/10 dark:bg-amber-500/10 py-1 px-2.5 rounded-full w-fit mx-auto group-hover:scale-105 transition-transform">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span>{doc.rating}</span>
                    <span className="text-slate-500 dark:text-slate-400 font-normal">({doc.experienceYears} yrs exp)</span>
                  </div>
                </div>

                <div className="relative z-10 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                  <div className="text-left">
                    <span className="block text-[10px] text-slate-400 uppercase tracking-wider font-medium">Fee</span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">${doc.consultationFee}</span>
                  </div>
                  <button
                    onClick={() => onGoToTab('appointments')}
                    className="px-3 py-1.5 text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl transition-all duration-300 cursor-pointer shadow-md shadow-cyan-500/20 hover:scale-105 active:scale-95 flex items-center gap-1"
                  >
                    <span>Book Slot</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Patient Testimonials Section */}
      <section id="testimonials" className="py-16 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-4 sm:px-6 lg:px-8 transition-colors">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-100 dark:bg-cyan-950/80 border border-cyan-300 dark:border-cyan-800 text-cyan-700 dark:text-cyan-300 text-xs font-bold mb-3">
              <Quote className="w-3.5 h-3.5 text-cyan-500 fill-cyan-500/30" />
              <span>Patient Stories & Trust</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Trusted by Over 25,000+ Patients
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
              Real experiences from patients and families who received world-class care at Smart Hospital.
            </p>
          </div>

          {/* Testimonials Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {PATIENT_TESTIMONIALS.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="group relative p-6 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/90 dark:border-slate-800 shadow-sm hover:shadow-2xl hover:shadow-cyan-500/10 hover:border-cyan-500/60 dark:hover:border-cyan-400/60 transition-all duration-300 flex flex-col justify-between overflow-hidden"
              >
                {/* Top Accent Line */}
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-t-2xl" />

                {/* Background Quote Watermark */}
                <Quote className="absolute right-3 bottom-3 w-20 h-20 text-slate-200/50 dark:text-slate-800/40 pointer-events-none group-hover:scale-110 group-hover:text-cyan-500/10 transition-all duration-500" />

                <div className="relative z-10">
                  {/* Star Rating & Department Badge */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-1 text-amber-400">
                      {[...Array(item.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800">
                      {item.department}
                    </span>
                  </div>

                  {/* Comment */}
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed italic mb-6">
                    "{item.comment}"
                  </p>
                </div>

                {/* Patient Profile */}
                <div className="relative z-10 pt-4 border-t border-slate-200/60 dark:border-slate-800 flex items-center gap-3">
                  <img
                    src={item.avatar}
                    alt={item.name}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-cyan-500/30 group-hover:ring-cyan-500 transition-all"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-bold text-xs text-slate-900 dark:text-white truncate">{item.name}</h4>
                      {item.verified && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-cyan-500 shrink-0" title="Verified Patient" />
                      )}
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{item.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Trust Banner Bar */}
          <div className="mt-12 p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0">
                <ThumbsUp className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">98.9% Overall Patient Satisfaction Rating</h3>
                <p className="text-xs text-slate-300 mt-0.5">Based on 15,400+ verified post-treatment hospital feedback reviews.</p>
              </div>
            </div>

            <button
              onClick={() => onGoToTab('appointments')}
              className="px-5 py-2.5 text-xs font-bold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl shadow-lg shadow-cyan-500/25 transition-all duration-300 cursor-pointer flex items-center gap-2 shrink-0 hover:scale-105 active:scale-95"
            >
              <Calendar className="w-4 h-4" />
              <span>Book Appointment Today</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* Medical Insights & Blog Section */}
      <section id="insights" className="py-16 bg-slate-50/70 dark:bg-slate-950/60 border-t border-slate-200 dark:border-slate-800/80 px-4 sm:px-6 lg:px-8 transition-colors">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-100 dark:bg-cyan-950/80 border border-cyan-300 dark:border-cyan-800 text-cyan-700 dark:text-cyan-300 text-xs font-bold mb-3">
              <BookOpen className="w-3.5 h-3.5 text-cyan-500" />
              <span>Health Knowledge Hub</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Medical Insights & Health Updates
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
              Expert articles authored by senior hospital specialists on surgical innovations, preventive care, and modern health AI.
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center justify-center flex-wrap gap-2 mb-10">
            {['All', 'Cardiology', 'Neurology', 'Pediatrics', 'Wellness'].map((cat) => {
              const isActive = activeArticleCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveArticleCategory(cat)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-cyan-600 text-white shadow-md shadow-cyan-500/25 scale-105'
                      : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Articles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {MEDICAL_ARTICLES
              .filter(art => activeArticleCategory === 'All' || art.category === activeArticleCategory)
              .map((article, idx) => (
                <motion.div
                  key={article.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.08 }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  onClick={() => setSelectedArticle(article)}
                  className="group relative rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-2xl hover:shadow-cyan-500/10 hover:border-cyan-500/60 dark:hover:border-cyan-400/60 transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer"
                >
                  {/* Top Gradient Highlight */}
                  <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-t-2xl z-20" />

                  {/* Article Card Image */}
                  <div className="relative h-44 overflow-hidden">
                    <img
                      src={article.image}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-80" />

                    {/* Category Badge */}
                    <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500 text-white shadow-md">
                      {article.category}
                    </span>

                    {/* Read Time */}
                    <span className="absolute bottom-3 right-3 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-900/80 text-white backdrop-blur-sm flex items-center gap-1">
                      <Clock className="w-3 h-3 text-cyan-400" />
                      <span>{article.readTime}</span>
                    </span>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors line-clamp-2 leading-snug">
                        {article.title}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-3 leading-relaxed">
                        {article.excerpt}
                      </p>
                    </div>

                    {/* Author & Footer */}
                    <div className="mt-5 pt-3 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <img
                          src={article.authorAvatar}
                          alt={article.author}
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            e.currentTarget.src = 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200';
                          }}
                          className="w-7 h-7 rounded-full object-cover ring-2 ring-cyan-500/30"
                        />
                        <div className="min-w-0">
                          <p className="text-[11px] font-bold text-slate-800 dark:text-slate-200 truncate">{article.author}</p>
                          <p className="text-[10px] text-slate-400">{article.date}</p>
                        </div>
                      </div>

                      <div className="w-7 h-7 rounded-lg bg-cyan-50 dark:bg-cyan-950/80 text-cyan-600 dark:text-cyan-400 flex items-center justify-center group-hover:bg-cyan-500 group-hover:text-white transition-all shadow-sm">
                        <ArrowUpRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions (FAQ) Section */}
      <section id="faq" className="py-10 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-4 sm:px-6 lg:px-8 transition-colors">
        <div className="max-w-5xl mx-auto">
          {/* Section Header */}
          <div className="text-center max-w-2xl mx-auto mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-cyan-100 dark:bg-cyan-950/80 border border-cyan-300 dark:border-cyan-800 text-cyan-700 dark:text-cyan-300 text-[11px] font-bold mb-2">
              <HelpCircle className="w-3.5 h-3.5 text-cyan-500" />
              <span>Patient Help & FAQs</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Find instant answers regarding appointments, emergency protocols, lab reports, and insurance coverage.
            </p>
          </div>

          {/* Search Bar & Category Filter Controls */}
          <div className="mb-5 space-y-3">
            {/* Instant Search Bar */}
            <div className="relative max-w-lg mx-auto">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                value={faqSearchQuery}
                onChange={(e) => setFaqSearchQuery(e.target.value)}
                placeholder="Search FAQs (e.g., appointment, insurance, MRI)..."
                className="w-full pl-10 pr-9 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500 transition-all"
              />
              {faqSearchQuery && (
                <button
                  onClick={() => setFaqSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-full transition-colors cursor-pointer"
                  title="Clear search"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Category Pills */}
            <div className="flex items-center justify-center flex-wrap gap-1.5 pt-1">
              {FAQ_CATEGORIES.map((cat) => {
                const isActive = activeFaqCategory === cat.id;
                const count = cat.id === 'all'
                  ? HOSPITAL_FAQS.length
                  : HOSPITAL_FAQS.filter(f => f.category === cat.id).length;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveFaqCategory(cat.id)}
                    className={`px-3 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-sm shadow-cyan-500/20'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-cyan-400 dark:hover:border-cyan-600'
                    }`}
                  >
                    <span>{cat.label}</span>
                    <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-200/60 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Accordion FAQ List - 2 Column Grid to Decrease Vertical Height */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-start">
            {HOSPITAL_FAQS
              .filter((item) => {
                const matchesCategory = activeFaqCategory === 'all' || item.category === activeFaqCategory;
                const matchesSearch = !faqSearchQuery ||
                  item.question.toLowerCase().includes(faqSearchQuery.toLowerCase()) ||
                  item.answer.toLowerCase().includes(faqSearchQuery.toLowerCase());
                return matchesCategory && matchesSearch;
              })
              .map((item, idx) => {
                const isOpen = openFaqId === item.id;
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.25, delay: idx * 0.03 }}
                    className={`rounded-xl border transition-all duration-300 overflow-hidden ${
                      isOpen
                        ? 'bg-slate-50 dark:bg-slate-800/80 border-cyan-500/60 dark:border-cyan-400/60 shadow-md'
                        : 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm'
                    }`}
                  >
                    {/* Accordion Header / Question */}
                    <button
                      onClick={() => setOpenFaqId(isOpen ? null : item.id)}
                      className="w-full text-left p-3 sm:p-3.5 flex items-start justify-between gap-3 cursor-pointer focus:outline-none"
                    >
                      <div className="flex items-start gap-2.5 min-w-0">
                        <div className={`w-6 h-6 rounded-md shrink-0 mt-0.5 flex items-center justify-center font-bold text-[10px] transition-colors ${
                          isOpen
                            ? 'bg-cyan-500 text-white shadow-sm'
                            : 'bg-slate-200/70 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                        }`}>
                          Q{item.id}
                        </div>

                        <div>
                          <span className="inline-block px-1.5 py-0.2 rounded text-[9px] font-bold bg-slate-200/70 dark:bg-slate-700 text-slate-500 dark:text-slate-400 mb-0.5">
                            {item.categoryLabel}
                          </span>
                          <h3 className={`font-bold text-xs sm:text-sm leading-snug transition-colors ${
                            isOpen ? 'text-cyan-600 dark:text-cyan-400' : 'text-slate-900 dark:text-white'
                          }`}>
                            {item.question}
                          </h3>
                        </div>
                      </div>

                      <div className={`p-1 rounded-lg shrink-0 transition-transform duration-300 ${
                        isOpen
                          ? 'bg-cyan-100 dark:bg-cyan-950 text-cyan-600 dark:text-cyan-400 rotate-180'
                          : 'bg-slate-200/70 dark:bg-slate-700 text-slate-400'
                      }`}>
                        <ChevronDown className="w-3.5 h-3.5" />
                      </div>
                    </button>

                    {/* Accordion Answer Content */}
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="px-3.5 pb-3.5 pt-1 text-xs text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-200/60 dark:border-slate-800/80"
                      >
                        <div className="pl-8">
                          {item.answer}
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}

            {/* Empty Search State */}
            {HOSPITAL_FAQS.filter((item) => {
              const matchesCategory = activeFaqCategory === 'all' || item.category === activeFaqCategory;
              const matchesSearch = !faqSearchQuery ||
                item.question.toLowerCase().includes(faqSearchQuery.toLowerCase()) ||
                item.answer.toLowerCase().includes(faqSearchQuery.toLowerCase());
              return matchesCategory && matchesSearch;
            }).length === 0 && (
              <div className="col-span-full p-6 text-center rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                <HelpCircle className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-1.5" />
                <h4 className="font-bold text-xs text-slate-900 dark:text-white">No matching questions found</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                  Try adjusting your search terms or select a different category filter.
                </p>
                <button
                  onClick={() => {
                    setFaqSearchQuery('');
                    setActiveFaqCategory('all');
                  }}
                  className="mt-3 px-3 py-1 rounded-lg bg-cyan-600 text-white font-bold text-xs hover:bg-cyan-700 transition-colors cursor-pointer"
                >
                  Reset Filters
                </button>
              </div>
            )}
          </div>

          {/* Need Further Assistance Box */}
          <div className="mt-6 p-3.5 sm:p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-slate-900 dark:text-white">Have a specific medical query?</h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">Ask our AI Symptom Triage Assistant or speak with patient care desk.</p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => onGoToTab('ai-assistant')}
                className="px-3 py-1.5 text-xs font-bold bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Bot className="w-3.5 h-3.5" />
                <span>Ask AI Assistant</span>
              </button>
              <button
                onClick={() => triggerEmergencyAlert('Inquiry Helpdesk', 'Patient requested help desk call from FAQ page.')}
                className="px-3 py-1.5 text-xs font-bold bg-slate-200/80 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>24/7 Helpline</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Hospital Administration Contact Section */}
      <section id="contact" className="py-16 bg-slate-50/70 dark:bg-slate-950/60 border-t border-slate-200 dark:border-slate-800/80 px-4 sm:px-6 lg:px-8 transition-colors">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-100 dark:bg-cyan-950/80 border border-cyan-300 dark:border-cyan-800 text-cyan-700 dark:text-cyan-300 text-xs font-bold mb-3">
              <Mail className="w-3.5 h-3.5 text-cyan-500" />
              <span>Direct Communication</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Contact Hospital Administration
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
              Have questions regarding hospital policies, billing, patient records, or general services? Reach out directly to our administration team.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Info Column (Contact Cards & Helpline) */}
            <div className="lg:col-span-5 space-y-6">
              <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white shadow-xl border border-slate-800 relative overflow-hidden">
                {/* Background Decor */}
                <div className="absolute top-0 right-0 -mr-12 -mt-12 w-40 h-40 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

                <h3 className="text-lg font-extrabold text-white mb-6 flex items-center gap-2">
                  <Hospital className="w-5 h-5 text-cyan-400" />
                  <span>Hospital Headquarters</span>
                </h3>

                <div className="space-y-5 text-xs text-slate-300">
                  <div className="flex items-start gap-3.5">
                    <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-xs mb-0.5">Location Address</h4>
                      <p className="leading-relaxed">Macherla, Palnadu,<br />Andhra Pradesh - 522426</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleEmergencyCall('Helpline Desk', '+91 63040 45279')}
                    className="flex items-start gap-3.5 text-left group cursor-pointer w-full"
                  >
                    <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                      <PhoneCall className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-xs mb-0.5 group-hover:text-cyan-300 transition-colors">Helpline & Emergency Desk</h4>
                      <p className="leading-relaxed font-semibold text-cyan-300">+91 63040 45279</p>
                      <p className="text-[10px] text-cyan-400 font-semibold mt-0.5 flex items-center gap-1">
                        <span>Click to dial hotline modal</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </p>
                    </div>
                  </button>

                  <div className="flex items-start gap-3.5">
                    <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-xs mb-0.5">Email Support</h4>
                      <p className="leading-relaxed">admin@smarthospital.org</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Average response time: &lt; 2 business hours</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-xs mb-0.5">Administrative Hours</h4>
                      <p className="leading-relaxed">Monday – Saturday: 8:00 AM – 8:00 PM</p>
                      <p className="text-[10px] text-emerald-400 font-semibold mt-0.5">Emergency & Trauma ICU: 24/7/365 Open</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Action Box */}
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between gap-4">
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">Need Urgent Medical Attention?</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Trigger continuous emergency alert or speak to AI Triage.</p>
                </div>
                <button
                  onClick={() => handleEmergencyCall('Urgent Medical Call', '+91 63040 45279')}
                  className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md shadow-red-500/20 transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Call Now</span>
                </button>
              </div>
            </div>

            {/* Right Interactive Form Column */}
            <div className="lg:col-span-7">
              <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg relative">
                {contactSuccess ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-10 px-4 space-y-4"
                  >
                    <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                        Inquiry Submitted Successfully!
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-md mx-auto leading-relaxed">
                        Thank you for reaching out. Your message has been routed to our Hospital Administration Desk under ticket <span className="font-mono font-bold text-cyan-600 dark:text-cyan-400">#ADM-84920</span>.
                      </p>
                    </div>

                    <div className="pt-4 flex items-center justify-center gap-3">
                      <button
                        onClick={() => setContactSuccess(false)}
                        className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
                      >
                        Send Another Inquiry
                      </button>
                      <button
                        onClick={() => onGoToTab('appointments')}
                        className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Book Appointment</span>
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <form onSubmit={handleContactSubmit} className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                      <MessageSquare className="w-4 h-4 text-cyan-500" />
                      <h3 className="font-bold text-base text-slate-900 dark:text-white">Send an Inquiry</h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Name */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Full Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={contactForm.name}
                          onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                          placeholder="e.g., Sarah Jenkins"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500 transition-all"
                        />
                      </div>

                      {/* Email */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Email Address <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          required
                          value={contactForm.email}
                          onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                          placeholder="e.g., sarah@example.com"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500 transition-all"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Phone */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Contact Phone Number
                        </label>
                        <input
                          type="tel"
                          value={contactForm.phone}
                          onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                          placeholder="e.g., +1 (555) 234-5678"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500 transition-all"
                        />
                      </div>

                      {/* Department Select */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Inquiry Department
                        </label>
                        <select
                          value={contactForm.department}
                          onChange={(e) => setContactForm({ ...contactForm, department: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500 transition-all"
                        >
                          <option value="General Administration">General Administration</option>
                          <option value="Patient Services & Complaints">Patient Services & Helpdesk</option>
                          <option value="Billing & Health Insurance">Billing & Cashless Insurance</option>
                          <option value="Medical Records & Reports">Medical Records & Lab Reports</option>
                          <option value="International Patient Desk">International Patient Services</option>
                        </select>
                      </div>
                    </div>

                    {/* Subject */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Subject / Brief Title
                      </label>
                      <input
                        type="text"
                        value={contactForm.subject}
                        onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                        placeholder="e.g., Inquiry regarding health insurance pre-authorization"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500 transition-all"
                      />
                    </div>

                    {/* Detailed Message */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Message Details <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        required
                        rows={4}
                        value={contactForm.message}
                        onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                        placeholder="Please write your query or request in detail..."
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500 transition-all resize-none"
                      />
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isSubmittingContact}
                      className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all cursor-pointer flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-70"
                    >
                      {isSubmittingContact ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin text-white" />
                          <span>Routing Message...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Submit Inquiry to Administration</span>
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Comprehensive Hospital Footer */}
      <footer className="bg-slate-900 dark:bg-slate-950 text-slate-300 border-t border-slate-800 pt-12 pb-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden transition-colors">
        {/* Decorative Background Glows */}
        <div className="absolute top-0 left-1/4 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 translate-y-1/2 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto space-y-12 relative z-10">
          {/* Top Row: Newsletter Subscription Banner */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-800/90 via-slate-800 to-slate-900 border border-slate-700/80 shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[11px] font-bold">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>Health Digest & Medical Bulletin</span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-white">
                Stay Informed on Medical Progress & Health Advice
              </h3>
              <p className="text-xs text-slate-400 max-w-xl">
                Subscribe to our weekly health newsletter for verified clinical insights, wellness tips from hospital specialists, and preventive care reminders.
              </p>
            </div>

            <div className="w-full lg:w-auto shrink-0">
              {newsletterSubscribed ? (
                <div className="px-5 py-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-fadeIn">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Subscribed! Check your inbox for confirmation.</span>
                </div>
              ) : (
                <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row items-center gap-2.5 w-full max-w-md">
                  <div className="relative w-full">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={newsletterEmail}
                      onChange={(e) => setNewsletterEmail(e.target.value)}
                      placeholder="Enter your email address..."
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-md shadow-cyan-600/30 transition-all cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
                  >
                    <span>Subscribe</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Main Footer Links 4-Column Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10">
            {/* Column 1: Hospital Brand & Emergency Hotline (4 Cols) */}
            <div className="lg:col-span-4 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
                  <Hospital className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-extrabold text-base text-white tracking-tight block">SmartCare Hospital</span>
                  <span className="text-[10px] text-cyan-400 font-semibold uppercase tracking-wider block">Advanced Tertiary Health System</span>
                </div>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                JCI-Accredited multi-specialty medical center providing AI-assisted diagnostic triage, 24/7 level-1 emergency trauma care, robotic surgery, and personalized patient management.
              </p>

              {/* Instant Emergency Call Box */}
              <div className="p-3.5 rounded-2xl bg-red-950/40 border border-red-800/60 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-red-600 text-white flex items-center justify-center shrink-0 shadow-md">
                    <Siren className="w-4 h-4 animate-pulse" />
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-white">Emergency Hotline</h5>
                    <p className="text-[10px] text-red-300 font-mono">+91 63040 45279 (24/7)</p>
                  </div>
                </div>
                <button
                  onClick={() => handleEmergencyCall('Footer Emergency Hotline', '+91 63040 45279')}
                  className="px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-sm transition-colors cursor-pointer shrink-0 flex items-center gap-1 hover:scale-105 active:scale-95"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Call Now</span>
                </button>
              </div>

              {/* Accreditation Badges */}
              <div className="pt-2 flex items-center gap-3 text-[10px] font-bold text-slate-400">
                <span className="px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-cyan-400" /> JCI Accredited
                </span>
                <span className="px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700 flex items-center gap-1">
                  <Award className="w-3 h-3 text-amber-400" /> NABH Certified
                </span>
                <span className="px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700">
                  ISO 9001:2015
                </span>
              </div>
            </div>

            {/* Column 2: Emergency Contacts & Quick Patient Portal (3 Cols) */}
            <div className="lg:col-span-3 space-y-3">
              <h4 className="font-bold text-xs uppercase tracking-wider text-white border-b border-slate-800 pb-2">
                Emergency & Patient Services
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <button
                    onClick={() => handleEmergencyCall('24/7 Ambulance Dispatch', '+91 63040 45279')}
                    className="hover:text-cyan-400 transition-colors flex items-center gap-2 cursor-pointer text-left text-red-400 font-medium"
                  >
                    <Siren className="w-3.5 h-3.5 text-red-500 shrink-0 animate-pulse" />
                    <span>24/7 Ambulance Dispatch (+91 63040 45279)</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => onGoToTab('appointments')}
                    className="hover:text-cyan-400 transition-colors flex items-center gap-2 cursor-pointer text-left"
                  >
                    <Calendar className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span>Book Specialist Appointment</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => onGoToTab('ai-assistant')}
                    className="hover:text-cyan-400 transition-colors flex items-center gap-2 cursor-pointer text-left"
                  >
                    <Bot className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    <span>AI Symptom Triage Assistant</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => onGoToTab('lab-results')}
                    className="hover:text-cyan-400 transition-colors flex items-center gap-2 cursor-pointer text-left"
                  >
                    <FlaskConical className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span>Digital Pathology & Lab Reports</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => onGoToTab('pharmacy')}
                    className="hover:text-cyan-400 transition-colors flex items-center gap-2 cursor-pointer text-left"
                  >
                    <Pill className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>E-Pharmacy & Home Delivery</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => onGoToTab('telehealth')}
                    className="hover:text-cyan-400 transition-colors flex items-center gap-2 cursor-pointer text-left"
                  >
                    <Video className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>Virtual Telehealth Consultations</span>
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 3: Insurance Partners & Specialties (3 Cols) */}
            <div className="lg:col-span-3 space-y-3">
              <h4 className="font-bold text-xs uppercase tracking-wider text-white border-b border-slate-800 pb-2">
                Insurance Partners & Departments
              </h4>
              <ul className="space-y-2 text-xs">
                <li className="text-slate-400 text-[11px] font-semibold flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Cashless Insurance Partners:</span>
                </li>
                <li className="pl-5 text-slate-300 leading-tight">
                  BlueCross, Aetna, Cigna, UnitedHealth, Medicare, MetLife & TPA Desk
                </li>
                <li className="pt-2">
                  <a href="#specialties" className="hover:text-cyan-400 transition-colors flex items-center gap-2">
                    <HeartPulse className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    <span>Cardiology & Cardiac Surgery</span>
                  </a>
                </li>
                <li>
                  <a href="#specialties" className="hover:text-cyan-400 transition-colors flex items-center gap-2">
                    <Brain className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    <span>Neurology & Neurosurgery</span>
                  </a>
                </li>
                <li>
                  <a href="#specialties" className="hover:text-cyan-400 transition-colors flex items-center gap-2">
                    <Bone className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span>Orthopedics & Joint Replacement</span>
                  </a>
                </li>
                <li>
                  <a href="#contact" className="hover:text-cyan-400 transition-colors flex items-center gap-2">
                    <Globe className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span>International Patient Desk</span>
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 4: Careers, Location & Social Media (2 Cols) */}
            <div className="lg:col-span-2 space-y-3">
              <h4 className="font-bold text-xs uppercase tracking-wider text-white border-b border-slate-800 pb-2">
                Careers & Social
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <a href="#contact" className="hover:text-cyan-400 transition-colors flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Medical Careers</span>
                  </a>
                </li>
                <li>
                  <a href="#contact" className="hover:text-cyan-400 transition-colors flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-amber-400" />
                    <span>Residency Program</span>
                  </a>
                </li>
                <li>
                  <a href="#contact" className="hover:text-cyan-400 transition-colors flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-slate-400" />
                    <span>Clinical Research</span>
                  </a>
                </li>
              </ul>

              <div className="pt-2">
                <h5 className="text-[11px] font-bold text-slate-300 mb-2">Connect With Us</h5>
                <div className="flex items-center gap-2">
                  <a
                    href="https://github.com/Balu143865"
                    target="_blank"
                    rel="noreferrer"
                    className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
                    title="Follow on GitHub"
                  >
                    <Github className="w-4 h-4" />
                  </a>
                  <a
                    href="https://www.linkedin.com/in/banavath-balu-naik-a9ab03298"
                    target="_blank"
                    rel="noreferrer"
                    className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
                    title="Connect on LinkedIn"
                  >
                    <Linkedin className="w-4 h-4" />
                  </a>
                  <a
                    href="https://www.instagram.com/balu_naik_rocky"
                    target="_blank"
                    rel="noreferrer"
                    className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-pink-600 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
                    title="Follow on Instagram"
                  >
                    <Instagram className="w-4 h-4" />
                  </a>
                  <a
                    href="https://twitter.com"
                    target="_blank"
                    rel="noreferrer"
                    className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-cyan-600 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
                    title="Follow on Twitter / X"
                  >
                    <Twitter className="w-4 h-4" />
                  </a>
                  <a
                    href="https://facebook.com"
                    target="_blank"
                    rel="noreferrer"
                    className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-blue-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
                    title="Follow on Facebook"
                  >
                    <Facebook className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar: Copyright, System Operational Pulse & Legal Links */}
          <div className="pt-8 border-t border-slate-800/80 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping shrink-0" />
              <span className="text-[11px] font-medium text-slate-300">
                All ICU Telemetry & Core Hospital Servers Operational (99.99% Uptime)
              </span>
            </div>

            <div className="text-[11px] text-center md:text-right">
              <p>© 2026 SmartCare Hospital Management System. All Rights Reserved.</p>
            </div>

            <div className="flex items-center gap-4 text-[11px]">
              <a href="#faq" className="hover:text-cyan-400 transition-colors">Privacy Policy</a>
              <span>•</span>
              <a href="#faq" className="hover:text-cyan-400 transition-colors">HIPAA Compliance</a>
              <span>•</span>
              <a href="#faq" className="hover:text-cyan-400 transition-colors">Patient Rights</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Article Detail Modal */}
      {selectedArticle && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fadeIn">
          <div
            className="fixed inset-0"
            onClick={() => setSelectedArticle(null)}
          />
          <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden z-10 max-h-[90vh] flex flex-col">
            {/* Header Image */}
            <div className="relative h-56 sm:h-64 shrink-0 overflow-hidden">
              <img
                src={selectedArticle.image}
                alt={selectedArticle.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

              <button
                onClick={() => setSelectedArticle(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-slate-900/80 text-white hover:bg-slate-800 transition-colors cursor-pointer z-20"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="absolute bottom-4 left-6 right-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500 text-white">
                    {selectedArticle.category}
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-900/80 text-slate-200 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-cyan-400" />
                    <span>{selectedArticle.readTime}</span>
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-black text-white leading-tight">
                  {selectedArticle.title}
                </h2>
              </div>
            </div>

            {/* Content Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              {/* Author Strip */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <img
                    src={selectedArticle.authorAvatar}
                    alt={selectedArticle.author}
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200';
                    }}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-cyan-500"
                  />
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">{selectedArticle.author}</h4>
                    <p className="text-[11px] text-cyan-600 dark:text-cyan-400">{selectedArticle.authorRole}</p>
                  </div>
                </div>
                <span className="text-xs text-slate-400 font-medium">{selectedArticle.date}</span>
              </div>

              {/* Text Paragraphs */}
              <div className="space-y-3 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                {selectedArticle.content}
              </div>

              {/* Tags */}
              <div className="pt-4 flex items-center flex-wrap gap-2">
                <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5 text-cyan-500" />
                  <span>Topics:</span>
                </span>
                {selectedArticle.tags.map((t) => (
                  <span key={t} className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[11px] font-medium">
                    #{t}
                  </span>
                ))}
              </div>
            </div>

            {/* Modal Footer Call to Action */}
            <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shrink-0">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Need personalized medical advice?</span>
              <button
                onClick={() => {
                  setSelectedArticle(null);
                  onGoToTab('appointments');
                }}
                className="px-4 py-2 text-xs font-bold bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Consult Specialist</span>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Emergency Call Hotline Modal Portal */}
      {callModalOpen && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="fixed inset-0" onClick={() => setCallModalOpen(false)} />
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8 text-white z-10 space-y-6 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/10 rounded-full blur-2xl pointer-events-none" />

            <button
              onClick={() => setCallModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Close Modal"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center space-y-3">
              <div className="relative w-16 h-16 mx-auto rounded-full bg-red-600/20 border border-red-500/40 text-red-500 flex items-center justify-center">
                <Siren className="w-8 h-8 animate-pulse" />
                <span className="absolute inset-0 rounded-full border border-red-500/30 animate-ping" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-red-400 bg-red-950/60 border border-red-800/60 px-2.5 py-0.5 rounded-full inline-block">
                  {activeCallLabel}
                </span>
                <h3 className="text-xl font-black text-white mt-1.5">SmartCare Emergency Line</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Macherla, Palnadu, Andhra Pradesh - 522426
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Emergency Desk Hotline</span>
              <div className="text-2xl font-black font-mono text-cyan-400 tracking-wide">
                {activeCallNumber}
              </div>
              <p className="text-[11px] text-emerald-400 font-medium">
                24/7 Level-1 Trauma ICU Desk Active
              </p>
            </div>

            {ambulanceDispatched && (
              <div className="p-3.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2.5 animate-fadeIn">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <p className="text-white">Emergency Dispatch Requested</p>
                  <p className="text-[10px] text-emerald-300 font-normal">GPS tracker assigned to Macherla area. Trauma ICU team notified.</p>
                </div>
              </div>
            )}

            <div className="space-y-2.5">
              <a
                href={`tel:${activeCallNumber.replace(/\s+/g, '')}`}
                className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg shadow-red-600/30 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Click to Dial Phone ({activeCallNumber})</span>
              </a>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={copyPhoneNumber}
                  className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {copiedNumber ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Number</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleDispatchAmbulance}
                  className="py-2.5 rounded-xl bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 font-bold text-xs border border-amber-500/30 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Siren className="w-3.5 h-3.5 text-amber-400" />
                  <span>Dispatch Unit</span>
                </button>
              </div>

              <button
                onClick={() => {
                  setCallModalOpen(false);
                  onGoToTab('ai-assistant');
                }}
                className="w-full py-2.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 font-bold text-xs border border-purple-500/30 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Bot className="w-3.5 h-3.5 text-purple-400" />
                <span>Launch AI Symptom Triage</span>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Persistent Floating Live Chat Widget */}
      {!liveChatOpen ? (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 flex items-center gap-3">
          {/* Label Tooltip */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-slate-900/90 backdrop-blur-md border border-cyan-500/40 text-white text-xs font-extrabold shadow-xl">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Live Desk</span>
          </div>

          <button
            onClick={handleOpenLiveChat}
            className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 text-white shadow-2xl shadow-cyan-600/50 hover:scale-110 active:scale-95 transition-all cursor-pointer flex items-center justify-center border-2 border-cyan-400/40 group shrink-0"
            title="Open Live Chat Helpdesk (Live Desk)"
          >
            <div className="relative flex items-center justify-center">
              <GoogleAssistantIcon className="w-7 h-7 sm:w-8 sm:h-8 group-hover:scale-110 transition-transform" />
              {unreadChatBadge && (
                <span className="absolute -top-2 -right-2 w-4.5 h-4.5 p-1 bg-red-500 border-2 border-slate-900 text-[10px] font-black text-white rounded-full flex items-center justify-center animate-pulse shadow-md">
                  1
                </span>
              )}
            </div>
          </button>
        </div>
      ) : createPortal(
        <div className="fixed bottom-3 inset-x-3 sm:inset-x-auto sm:right-6 sm:bottom-6 z-50 sm:w-96 h-[80vh] max-h-[520px] bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-fadeIn transition-all">
          {/* Header */}
          <div className="p-3.5 sm:p-4 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-800 flex items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-white shadow-md shrink-0">
                <GoogleAssistantIcon className="w-5 h-5" />
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-slate-900 rounded-full" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h4 className="font-black text-xs text-white truncate">SmartCare Front Desk</h4>
                  <span className="px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 text-[9px] font-bold shrink-0">24/7</span>
                </div>
                <p className="text-[10px] text-slate-400 truncate">Macherla, Palnadu • Online</p>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => handleEmergencyCall('Chat Header Call', '+91 63040 45279')}
                className="p-1.5 rounded-lg bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white transition-colors cursor-pointer"
                title="Emergency Hotline"
              >
                <PhoneCall className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setLiveChatOpen(false)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="Minimize Chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Suggestion Chips */}
          <div className="px-3 py-2 bg-slate-950/60 border-b border-slate-800/80 flex items-center gap-1.5 overflow-x-auto scrollbar-none shrink-0">
            <button
              onClick={() => handleSendChatMessage('How do I book an appointment?')}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-cyan-600/30 text-slate-300 hover:text-cyan-300 border border-slate-700 text-[10px] font-medium whitespace-nowrap transition-colors cursor-pointer"
            >
              📅 Appointment
            </button>
            <button
              onClick={() => handleSendChatMessage('What is the emergency helpline number?')}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-red-600/30 text-slate-300 hover:text-red-300 border border-slate-700 text-[10px] font-medium whitespace-nowrap transition-colors cursor-pointer"
            >
              🚨 Emergency Call
            </button>
            <button
              onClick={() => handleSendChatMessage('How can I view my lab reports?')}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-blue-600/30 text-slate-300 hover:text-blue-300 border border-slate-700 text-[10px] font-medium whitespace-nowrap transition-colors cursor-pointer"
            >
              🧪 Lab Reports
            </button>
            <button
              onClick={() => handleSendChatMessage('What is the hospital address in Macherla?')}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-emerald-600/30 text-slate-300 hover:text-emerald-300 border border-slate-700 text-[10px] font-medium whitespace-nowrap transition-colors cursor-pointer"
            >
              📍 Location
            </button>
          </div>

          {/* Scrollable Messages Body */}
          <div className="flex-1 p-3.5 space-y-3 overflow-y-auto bg-slate-900/90 text-xs">
            {chatMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-2xl ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-br-none shadow-md'
                      : 'bg-slate-800/90 border border-slate-700 text-slate-200 rounded-bl-none shadow-sm'
                  }`}
                >
                  <p className="leading-relaxed text-[11px] whitespace-pre-wrap">{msg.text}</p>
                </div>
                <span className="text-[9px] text-slate-500 mt-1 px-1">{msg.time}</span>
              </div>
            ))}

            {liveChatSending && (
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 text-slate-400 text-[10px] w-fit animate-pulse">
                <Bot className="w-3.5 h-3.5 text-cyan-400" />
                <span>Front Desk is typing...</span>
              </div>
            )}
          </div>

          {/* Footer Input Box & Submit Inquiry */}
          <div className="p-3 bg-slate-950 border-t border-slate-800 shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendChatMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={liveChatInput}
                onChange={(e) => setLiveChatInput(e.target.value)}
                placeholder="Ask Front Desk or submit inquiry..."
                className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
              />
              <button
                type="submit"
                disabled={!liveChatInput.trim()}
                className="p-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-bold transition-all cursor-pointer shrink-0"
                title="Send Message"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
            <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500">
              <span>SmartCare Macherla • Admin Sync</span>
              <button
                onClick={() => {
                  setLiveChatOpen(false);
                  onGoToTab('ai-assistant');
                }}
                className="text-cyan-400 hover:underline cursor-pointer font-medium"
              >
                Open Full AI Triage →
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
};
