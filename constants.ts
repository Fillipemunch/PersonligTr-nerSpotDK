
import { User, UserRole, Language } from './types';

// 1. DEFINITION OF A TEMPLATE PT PROFILE (Kept for reference structure, but not loaded)
export const CREATED_PT_PROFILE: User = {
  id: 'pt_new_filipe',
  name: 'Filipe Munch (PT)',
  email: 'filipe@train.dk',
  role: UserRole.PT,
  photoUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
  location: 'Copenhagen',
  bio: 'Dedicated to pushing your limits. I specialize in high-intensity functional training and endurance sports. Let us crush your goals together.',
  specialties: ['Strength', 'HIIT', 'Endurance'],
  hourlyRate: 750,
  activePtId: null
};

// 2. ROBUST MOCK DATA FOR FRONT PAGE & SEARCH
// CLEANED: All registered profiles removed as requested. System starts empty.
export const MOCK_USERS: User[] = [];

export const TRANSLATIONS = {
  [Language.EN]: {
    heroTitle: "Find Your Perfect Personal Trainer",
    heroSubtitle: "Connect with top trainers in Denmark for custom plans and coaching.",
    findPt: "Find a Trainer",
    login: "Login",
    register: "Register",
    logout: "Logout",
    dashboard: "Dashboard",
    welcome: "Welcome",
    roleClient: "Client",
    rolePt: "Personal Trainer",
    email: "Email",
    password: "Password",
    name: "Name",
    location: "Location",
    specialties: "Specialties",
    rate: "Hourly Rate (DKK)",
    bio: "Biography",
    about: "Motivation",
    aboutText: "Dream Big. Train Hard.", // Updated to short punchy text
    currentPlans: "Current Plans",
    chat: "Chat",
    myTrainer: "My Trainer",
    search: "Search PT",
    sendMessage: "Send Message",
    viewProfile: "View Profile",
    requestCoach: "Request Coach",
    requestSent: "Request Sent",
    status: "Status",
    pending: "Pending",
    active: "Active",
    rejected: "Rejected",
    myClients: "My Clients",
    overview: "Overview",
    content: "Content Management",
    accept: "Accept",
    reject: "Reject",
    createPlan: "Create Plan",
    createWorkout: "Add Workout",
    createDiet: "Add Diet",
    noPlans: "No active plans assigned yet.",
    selectClient: "Select a client to manage",
    uploadPhoto: "Upload Photo",
    typeMessage: "Type a message...",
    noMessages: "No messages yet.",
    aiThinking: "Trainer is typing...",
    
    // Private Notes
    privateNotes: "Private Client Notes",
    notesPlaceholder: "Write internal notes about progress, injuries, or sessions here...",
    saveNotes: "Save Notes",
    notesSaved: "Client notes saved successfully.",

    // Filters
    filterName: "Search by Name",
    filterLocation: "Filter by Location",
    filterSpecialty: "Filter by Specialty",
    allLocations: "All Locations",
    allSpecialties: "All Specialties",
    searchPlaceholder: "Search by name, city or specialty...",

    // Profile / Health Data
    myProfile: "My Data",
    healthData: "My Health Data",
    weight: "Weight (kg)",
    height: "Height (cm)",
    fitnessLevel: "Fitness Level",
    fitnessGoals: "Fitness Goals",
    medicalHistory: "Medical History",
    saveData: "Save Data",
    editData: "Edit Data",
    cancel: "Cancel",
    dataSaved: "Data saved successfully!",
    beginner: "Beginner",
    intermediate: "Intermediate",
    advanced: "Advanced",
    visibleToPt: "Visible to your active Personal Trainer",

    // New Tabs
    workoutTab: "Workout",
    dietTab: "Diet",
    workoutPlaceholder: "Your assigned workout plan will appear here.",
    dietPlaceholder: "Your personalized diet plan will appear here.",

    // PT Profile
    ptProfileTab: "My Profile",
    editProfile: "Edit Profile",
    saveProfile: "Save Profile",
    profileSaved: "Profile updated successfully!",
    specialtiesHint: "Separate with commas (e.g. Yoga, HIIT)",
    bioPlaceholder: "Tell clients about your experience and philosophy...",

    // How It Works
    howItWorksTitle: "How It Works",
    step1Title: "Create Profile",
    step1Desc: "Sign up as a Client or Personal Trainer in seconds.",
    step2Title: "Find Your Match",
    step2Desc: "Search trainers by location, specialty, and price.",
    step3Title: "Connect & Plan",
    step3Desc: "Chat directly, set goals, and receive custom plans.",
    step4Title: "Achieve Goals",
    step4Desc: "Follow your workout and diet plans to transform your life.",

    // Landing List
    meetTrainers: "Meet Our Professionals",
    noTrainersFound: "No trainers found matching your search.",
    noTrainersYet: "No trainers registered yet. Be the first!",
  },
  [Language.DK]: {
    heroTitle: "Find Din Perfekte Personlige Træner",
    heroSubtitle: "Forbind med toptrænere i Danmark for skræddersyede planer og coaching.",
    findPt: "Find en Træner",
    login: "Log ind",
    register: "Registrer",
    logout: "Log ud",
    dashboard: "Kontrolpanel",
    welcome: "Velkommen",
    roleClient: "Klient",
    rolePt: "Personlig Træner",
    email: "Email",
    password: "Adgangskode",
    name: "Navn",
    location: "Lokation",
    specialties: "Specialer",
    rate: "Timepris (DKK)",
    bio: "Biografi",
    about: "Motivation",
    aboutText: "Drøm Stort. Træn Hårdt.", // Updated to short punchy text
    currentPlans: "Nuværende Planer",
    chat: "Chat",
    myTrainer: "Min Træner",
    search: "Søg PT",
    sendMessage: "Send Besked",
    viewProfile: "Se Profil",
    requestCoach: "Anmod Træner",
    requestSent: "Anmodning Sendt",
    status: "Status",
    pending: "Afventer",
    active: "Aktiv",
    rejected: "Afvist",
    myClients: "Mine Klienter",
    overview: "Oversigt",
    content: "Indholdsstyring",
    accept: "Accepter",
    reject: "Afvis",
    createPlan: "Opret Plan",
    createWorkout: "Tilføj Træning",
    createDiet: "Tilføj Kostplan",
    noPlans: "Ingen aktive planer tildelt endnu.",
    selectClient: "Vælg en klient at administrere",
    uploadPhoto: "Upload Foto",
    typeMessage: "Skriv en besked...",
    noMessages: "Ingen beskeder endnu.",
    aiThinking: "Træneren skriver...",

    // Private Notes
    privateNotes: "Private Klientnotater",
    notesPlaceholder: "Skriv interne noter om fremskridt, skader eller sessioner her...",
    saveNotes: "Gem Noter",
    notesSaved: "Klientnotater gemt succesfuldt.",

    // Filters
    filterName: "Søg efter Navn",
    filterLocation: "Filtrer efter Lokation",
    filterSpecialty: "Filtrer efter Speciale",
    allLocations: "Alle Lokationer",
    allSpecialties: "Alle Specialer",
    searchPlaceholder: "Søg efter navn, by eller speciale...",

    // Profile / Health Data
    myProfile: "Mine Data",
    healthData: "Mine Helbredsdata",
    weight: "Vægt (kg)",
    height: "Højde (cm)",
    fitnessLevel: "Fitnessniveau",
    fitnessGoals: "Fitnessmål",
    medicalHistory: "Medicinsk Historik",
    saveData: "Gem Data",
    editData: "Rediger Data",
    cancel: "Annuller",
    dataSaved: "Data gemt succesfuldt!",
    beginner: "Begynder",
    intermediate: "Øvet",
    advanced: "Avanceret",
    visibleToPt: "Synligt for din aktive Personlige Træner",

    // New Tabs
    workoutTab: "Træning",
    dietTab: "Kost",
    workoutPlaceholder: "Din tildelte træningsplan vises her.",
    dietPlaceholder: "Din personlige kostplan vises her.",

    // PT Profile
    ptProfileTab: "Mit Profil",
    editProfile: "Rediger Profil",
    saveProfile: "Gem Profil",
    profileSaved: "Profil opdateret succesfuldt!",
    specialtiesHint: "Adskil med komma (f.eks. Yoga, HIIT)",
    bioPlaceholder: "Fortæl klienter om din erfaring og filosofi...",

    // How It Works
    howItWorksTitle: "Sådan Fungerer Det",
    step1Title: "Opret Profil",
    step1Desc: "Tilmeld dig som Klient eller Personlig Træner på få sekunder.",
    step2Title: "Find Dit Match",
    step2Desc: "Søg efter trænere baseret på lokation, speciale og pris.",
    step3Title: "Forbind & Planlæg",
    step3Desc: "Chat direkte, sæt mål og modtag skræddersyede planer.",
    step4Title: "Nå Dine Mål",
    step4Desc: "Følg dine trænings- og kostplaner for at ændre dit liv.",

    // Landing List
    meetTrainers: "Mød Vores Professionelle",
    noTrainersFound: "Ingen trænere fundet.",
    noTrainersYet: "Ingen trænere registreret endnu. Vær den første!",
  }
};
