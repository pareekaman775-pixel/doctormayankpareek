import {
  useState,
  type ElementType,
  type FormEvent,
  type ChangeEvent,
} from "react";

import {
  Activity,
  ArrowRight,
  Award,
  Baby,
  CalendarDays,
  Check,
  ChevronDown,
  Circle,
  Clock3,
  Crown,
  HeartHandshake,
  HeartPulse,
  Home,
  Mail,
  MapPin,
  Menu,
  MessagesSquare,
  Phone,
  Scissors,
  ShieldCheck,
  Smile,
  Sparkles,
  Star,
  Stethoscope,
  Sun,
  UserRoundCheck,
  Users,
  X,
} from "lucide-react";

import { siteData } from "./data/siteData";
import { API_URL, assertApiUrlConfigured } from "./api";
import AdminLogin from "./components/AdminLogin";
import AdminDashboard from "./components/AdminDashboard";

const iconMap: Record<string, ElementType> = {
  stethoscope: Stethoscope,
  sparkles: Sparkles,
  circle: Circle,
  activity: Activity,
  scissors: Scissors,
  crown: Crown,
  "heart-pulse": HeartPulse,
  smile: Smile,
  sun: Sun,
  "shield-check": ShieldCheck,
  baby: Baby,
  "heart-handshake": HeartHandshake,
  award: Award,
  "user-round-check": UserRoundCheck,
  "messages-square": MessagesSquare,
  home: Home,
  "map-pin": MapPin,
};

const fallbackImage =
  "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1200&q=85";

const customerReviews = [
  { name: "Kailash Jat", rating: 5, text: "The consultation was clear and comfortable. Dr. Mayank explained the treatment properly and answered all my questions patiently." },
  { name: "Rekha Dabi", rating: 5, text: "Very good experience at Shree Shyam Dental Care. The clinic was clean, staff was helpful, and the treatment was handled with care." },
  { name: "Mukesh Gurjar", rating: 5, text: "I was comfortable throughout the treatment. The doctor explained each step in simple language and gave useful after-care guidance." },
  { name: "Vishal Tambi", rating: 5, text: "A professional and patient-friendly dental clinic. Appointment handling was smooth and the overall experience was good." },
  { name: "Aarav Saxena", rating: 5, text: "The doctor listened carefully to my concern and explained the available treatment options clearly. I had a positive experience." },
  { name: "Bhavna Tripathi", rating: 4, text: "Good dental care and a comfortable environment. The consultation was detailed and the staff was polite and supportive." },
  { name: "Keshav Sharma", rating: 4, text: "The treatment process was explained well and the clinic experience was comfortable. I appreciated the clear communication." },
  { name: "Mukul Goyal", rating: 4, text: "Nice experience overall. The doctor was attentive, the clinic was well maintained, and my questions were answered properly." },
  { name: "Ramesh Mishra", rating: 4, text: "A good place for dental consultation. The doctor was professional and explained the next steps clearly." },
  { name: "Pratap Singh", rating: 4, text: "Good service and a calm clinic environment. The consultation was helpful and the treatment instructions were easy to understand." },
];

const averageReviewRating =
  customerReviews.reduce((total, review) => total + review.rating, 0) /
  customerReviews.length;

const clinicGallery = [
  "/clinic-gallery/clinic-01.png",
  "/clinic-gallery/clinic-02.png",
  "/clinic-gallery/clinic-03.png",
  "/clinic-gallery/clinic-04.png",
  "/clinic-gallery/clinic-05.png",
  "/clinic-gallery/clinic-06.png",
  "/clinic-gallery/clinic-07.png",
  "/clinic-gallery/clinic-08.png",
  "/clinic-gallery/clinic-09.png",
  "/clinic-gallery/clinic-10.png",
];

const convertTimeTo24Hour = (time: string) => {
  const [rawTime, period] = time.split(" ");
  if (!rawTime || !period) return time;

  let [hours, minutes] = rawTime.split(":").map(Number);

  if (period === "PM" && hours !== 12) {
    hours += 12;
  }

  if (period === "AM" && hours === 12) {
    hours = 0;
  }

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
    2,
    "0"
  )}:00`;
};

function App() {
  const [adminToken, setAdminToken] = useState<string | null>(() =>
    localStorage.getItem("shree_shyam_admin_token")
  );

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [selectedGalleryImage, setSelectedGalleryImage] = useState<string | null>(null);

  const [appointmentData, setAppointmentData] = useState({
    fullName: "",
    phone: "",
    email: "",
    date: "",
    time: "",
    concern: "",
    message: "",
  });

  const [appointmentStatus, setAppointmentStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [appointmentMessage, setAppointmentMessage] = useState("");
  const [appointmentId, setAppointmentId] = useState<number | null>(null);

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const handleAppointmentChange = (
    event: ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = event.target;

    setAppointmentData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleAppointment = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setAppointmentStatus("loading");
    setAppointmentMessage("");
    setAppointmentId(null);

    try {
      assertApiUrlConfigured();
      const response = await fetch(
        `${API_URL}/api/appointments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fullName: appointmentData.fullName.trim(),
            phone: appointmentData.phone.trim(),
            email: appointmentData.email.trim(),
            appointmentDate: appointmentData.date,
            appointmentTime: convertTimeTo24Hour(appointmentData.time),
            dentalConcern: appointmentData.concern,
            message: appointmentData.message.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to submit appointment request."
        );
      }

      setAppointmentStatus("success");
      setAppointmentMessage(
        data.message ||
          "Appointment request submitted successfully. Waiting for clinic confirmation."
      );
      setAppointmentId(data.appointment?.id ?? null);

      setAppointmentData({
        fullName: "",
        phone: "",
        email: "",
        date: "",
        time: "",
        concern: "",
        message: "",
      });
    } catch (error) {
      const originalMessage = error instanceof Error
        ? error.message
        : "Unknown connection error.";
      const isFetchError = error instanceof TypeError;
      const message = isFetchError
        ? `Unable to connect to the appointment server. Please check the backend URL, CORS configuration, and backend deployment. Original error: ${originalMessage}`
        : originalMessage;

      console.error("Appointment submission error:", message, error);

      setAppointmentStatus("error");
      setAppointmentMessage(message);
    }
  };

  if (window.location.pathname === "/admin") {
    if (!adminToken) {
      return (
        <AdminLogin
          onLoginSuccess={(token) => {
            setAdminToken(token);
          }}
        />
      );
    }

    return (
      <AdminDashboard
        token={adminToken}
        onLogout={() => {
          localStorage.removeItem("shree_shyam_admin_token");
          setAdminToken(null);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-white text-[#173235]">

      {/* ========================= NAVBAR ========================= */}

      <header className="fixed left-0 right-0 top-0 z-50">
        <div className="mx-auto max-w-7xl px-4 pt-3 sm:px-6 lg:px-8">

          <div className="rounded-2xl border border-white/70 bg-white/90 shadow-[0_10px_35px_rgba(20,70,70,0.08)] backdrop-blur-xl">

            <div className="flex h-[72px] items-center justify-between px-4 sm:px-5 lg:px-6">

              <a
                href="#home"
                onClick={closeMobileMenu}
                className="flex items-center gap-3"
              >
                <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-[#0f6668] text-white shadow-[0_8px_20px_rgba(15,102,104,0.22)]">

                  <Stethoscope size={21} strokeWidth={1.8} />

                  <span className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full border-2 border-white bg-[#c39a43]" />

                </div>

                <div className="leading-none">

                  <p className="text-sm font-bold text-[#173235] sm:text-[15px]">
                    {siteData.clinic.name}
                  </p>

                  <p className="mt-1.5 text-[9px] font-bold uppercase tracking-[0.2em] text-[#0f6668]">
                    Dental Care
                  </p>

                </div>
              </a>

              <nav className="hidden items-center gap-7 lg:flex">

                {[
                  ["Home", "#home"],
                  ["About", "#about"],
                  ["Services", "#services"],
                  ["Why Us", "#why-us"],
                  ["Gallery", "#gallery"],
                  ["Reviews", "#reviews"],
                  ["FAQ", "#faq"],
                  ["Contact", "#contact"],
                ].map(([label, href]) => (

                  <a
                    key={label}
                    href={href}
                    className={`relative py-2 text-[13px] font-semibold transition ${
                      label === "Home"
                        ? "text-[#0f6668]"
                        : "text-[#5b7273] hover:text-[#0f6668]"
                    }`}
                  >
                    {label}

                    {label === "Home" && (
                      <span className="absolute bottom-0 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-[#0f6668]" />
                    )}

                  </a>

                ))}

              </nav>

              <div className="hidden items-center gap-2.5 lg:flex">

                <a
                  href={`tel:${siteData.clinic.phone}`}
                  className="flex items-center gap-2 rounded-xl border border-[#d7e5e4] bg-white px-4 py-2.5 text-[13px] font-bold text-[#315657] transition hover:border-[#0f6668] hover:text-[#0f6668]"
                >
                  <Phone size={15} />
                  Call
                </a>

                <a
                  href="#appointment"
                  className="group flex items-center gap-2 rounded-xl bg-[#0f6668] px-5 py-2.5 text-[13px] font-bold text-white shadow-[0_8px_20px_rgba(15,102,104,0.18)] transition hover:-translate-y-0.5 hover:bg-[#0b5557]"
                >
                  Book Appointment
                  <ArrowRight
                    size={15}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </a>

              </div>

              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#d7e5e4] bg-white text-[#173235] lg:hidden"
                aria-label="Toggle navigation"
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>

            </div>

            {mobileMenuOpen && (

              <div className="border-t border-[#e4edec] px-4 py-4 lg:hidden">

                <nav className="flex flex-col gap-1">

                  {[
                    ["Home", "#home"],
                    ["About", "#about"],
                    ["Services", "#services"],
                    ["Why Us", "#why-us"],
                    ["Gallery", "#gallery"],
                    ["Reviews", "#reviews"],
                    ["FAQ", "#faq"],
                    ["Contact", "#contact"],
                  ].map(([label, href]) => (

                    <a
                      key={label}
                      href={href}
                      onClick={closeMobileMenu}
                      className="rounded-xl px-4 py-3 text-sm font-semibold text-[#4e6869] transition hover:bg-[#f1f8f7] hover:text-[#0f6668]"
                    >
                      {label}
                    </a>

                  ))}

                  <a
                    href="#appointment"
                    onClick={closeMobileMenu}
                    className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-[#0f6668] px-5 py-3.5 text-sm font-bold text-white"
                  >
                    Book an Appointment
                    <ArrowRight size={16} />
                  </a>

                </nav>

              </div>

            )}

          </div>

        </div>
      </header>

      <main>

        {/* ========================= HERO ========================= */}

        <section
          id="home"
          className="relative overflow-hidden bg-[#f4faf9] pt-24"
        >

          <div className="pointer-events-none absolute -left-40 top-20 h-[30rem] w-[30rem] rounded-full bg-[#d7eeeb] opacity-70 blur-3xl" />

          <div className="pointer-events-none absolute -right-40 bottom-0 h-[32rem] w-[32rem] rounded-full bg-[#efe6d2] opacity-60 blur-3xl" />

          <div className="pointer-events-none absolute left-[48%] top-[22%] h-2 w-2 rounded-full bg-[#c6a15a]" />

          <div className="relative mx-auto grid min-h-[calc(100vh-6rem)] max-w-7xl items-center gap-12 px-4 py-14 sm:px-6 lg:grid-cols-[1fr_0.92fr] lg:gap-16 lg:px-8 lg:py-16">

            <div className="max-w-2xl">

              <div className="inline-flex items-center gap-2 rounded-full border border-[#cce3e0] bg-white px-4 py-2 text-[10px] font-bold uppercase tracking-[0.17em] text-[#0f6668] shadow-sm">

                <span className="h-2 w-2 rounded-full bg-[#0f6668]" />

                {siteData.hero.badge}

              </div>

              <h1 className="mt-7 text-[3.5rem] font-extrabold leading-[0.98] tracking-[-0.055em] text-[#173235] sm:text-6xl lg:text-[4.55rem]">

                {siteData.hero.title}

                <br />

                <span className="text-[#0f6668]">
                  {siteData.hero.highlightedTitle}
                </span>

              </h1>

              <p className="mt-7 max-w-xl text-[15px] leading-7 text-[#698081] sm:text-[17px] sm:leading-8">
                {siteData.hero.description}
              </p>

              <div className="mt-8 flex flex-wrap gap-3">

                <div className="flex items-center gap-3 rounded-2xl border border-[#d8e8e6] bg-white px-4 py-3 shadow-[0_8px_25px_rgba(20,70,70,0.05)]">

                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#e8f4f2] text-[#0f6668]">
                    <Award size={18} />
                  </div>

                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-[#8a9b9c]">
                      Qualification
                    </p>

                    <p className="mt-0.5 text-sm font-bold text-[#294d4e]">
                      {siteData.doctor.qualification}
                    </p>
                  </div>

                </div>

                <div className="flex items-center gap-3 rounded-2xl border border-[#d8e8e6] bg-white px-4 py-3 shadow-[0_8px_25px_rgba(20,70,70,0.05)]">

                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f4eddf] text-[#9b7932]">
                    <Clock3 size={18} />
                  </div>

                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-[#8a9b9c]">
                      Experience
                    </p>

                    <p className="mt-0.5 text-sm font-bold text-[#294d4e]">
                      {siteData.doctor.experience}
                    </p>
                  </div>

                </div>

              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">

                <a
                  href="#appointment"
                  className="group inline-flex items-center justify-center gap-2 rounded-xl bg-[#0f6668] px-6 py-3.5 text-sm font-bold text-white shadow-[0_14px_30px_rgba(15,102,104,0.22)] transition duration-300 hover:-translate-y-1 hover:bg-[#0b5557]"
                >
                  {siteData.hero.primaryButton}

                  <ArrowRight
                    size={17}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </a>

                <a
                  href={`tel:${siteData.clinic.phone}`}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#cddfdd] bg-white px-6 py-3.5 text-sm font-bold text-[#315657] shadow-sm transition duration-300 hover:-translate-y-1 hover:border-[#0f6668] hover:text-[#0f6668]"
                >
                  <Phone size={17} />
                  {siteData.hero.secondaryButton}
                </a>

              </div>

              <div className="mt-5 flex items-center gap-2 text-xs font-medium text-[#839697]">

                <Check size={14} className="text-[#0f6668]" />

                {siteData.hero.smallText}

              </div>

              <div className="mt-7 flex items-center gap-2 text-xs font-semibold text-[#718687]">

                <MapPin size={15} className="text-[#0f6668]" />

                {siteData.clinic.address}

              </div>

            </div>

            <div className="relative mx-auto w-full max-w-[560px] lg:ml-auto">

              <div className="absolute -inset-6 rounded-[3rem] bg-[#d9ece9] opacity-70 blur-2xl" />

              <div className="relative rounded-[2.5rem] border border-white bg-white p-3 shadow-[0_35px_90px_rgba(20,70,70,0.15)]">

                <div className="relative h-[480px] overflow-hidden rounded-[2rem] sm:h-[560px]">

                  <img
                    src="/Dr. Mayank Pareek.png"
                    alt="Dr. Mayank Pareek - BDS Dental Surgeon"
                    className="h-full w-full object-cover object-center transition duration-700 hover:scale-[1.02]"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-[#173235]/20 via-transparent to-transparent" />

                </div>

              </div>

              <div className="absolute -bottom-5 -right-4 hidden h-20 w-20 rounded-2xl border border-white bg-white/90 p-2 shadow-xl backdrop-blur sm:block">

                <div className="flex h-full items-center justify-center rounded-xl bg-[#f1f8f7] text-[#0f6668]">
                  <Smile size={30} strokeWidth={1.6} />
                </div>

              </div>

            </div>

          </div>

        </section>

        {/* ========================= ABOUT ========================= */}

        <section id="about" className="bg-white py-24 sm:py-28">

          <div className="mx-auto grid max-w-7xl gap-14 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:px-8">

            <div className="relative mx-auto w-full max-w-lg">

              <div className="absolute -bottom-8 -right-8 h-52 w-52 rounded-full bg-[#e8f3f1] blur-3xl" />

              <div className="relative overflow-hidden rounded-[2.25rem] border border-[#e0ecea] bg-[#f3f9f8] p-3 shadow-[0_25px_70px_rgba(20,70,70,0.1)]">

                <div className="h-[460px] overflow-hidden rounded-[1.75rem]">

                  <img
                    src="/Dr. Mayank Pareek.png"
                    alt="Dr. Mayank Pareek - BDS Dental Surgeon"
                    className="h-full w-full object-cover object-center"
                  />

                </div>

              </div>

            </div>

            <div>

              <div className="inline-flex items-center gap-2 rounded-full border border-[#d4e7e4] bg-[#f3f9f8] px-4 py-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[#0f6668]">

                <span className="h-2 w-2 rounded-full bg-[#0f6668]" />

                {siteData.about.eyebrow}

              </div>

              <h2 className="mt-5 max-w-2xl text-4xl font-bold tracking-[-0.035em] text-[#173235] sm:text-5xl">
                {siteData.about.title}
              </h2>

              <p className="mt-6 max-w-2xl text-base leading-8 text-[#718687] sm:text-lg">
                {siteData.doctor.about}
              </p>

              <p className="mt-4 max-w-2xl text-base leading-8 text-[#718687]">
                {siteData.about.description}
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">

                {siteData.about.points.map((point) => (

                  <div
                    key={point}
                    className="flex items-start gap-3 rounded-2xl border border-[#e0ecea] bg-[#fbfdfd] p-4"
                  >

                    <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#e7f3f1] text-[#0f6668]">
                      <Check size={15} strokeWidth={2.5} />
                    </div>

                    <p className="text-sm font-semibold leading-6 text-[#405e5f]">
                      {point}
                    </p>

                  </div>

                ))}

              </div>

              <a
                href="#appointment"
                className="group mt-8 inline-flex items-center gap-2 rounded-xl bg-[#173235] px-6 py-3.5 text-sm font-bold text-white shadow-lg transition hover:-translate-y-1 hover:bg-[#0f6668]"
              >
                {siteData.about.buttonText}

                <ArrowRight
                  size={16}
                  className="transition-transform group-hover:translate-x-1"
                />
              </a>

            </div>

          </div>

        </section>

        {/* ========================= SERVICES ========================= */}

        <section
          id="services"
          className="relative overflow-hidden bg-[#f3f9f8] py-24 sm:py-28"
        >

          <div className="pointer-events-none absolute -left-32 top-20 h-72 w-72 rounded-full bg-[#d8efec] opacity-50 blur-3xl" />

          <div className="pointer-events-none absolute -right-32 bottom-10 h-80 w-80 rounded-full bg-[#eee6d3] opacity-40 blur-3xl" />

          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

            <div className="mx-auto max-w-2xl text-center">

              <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-[#cce3e0] bg-white px-4 py-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[#0f6668] shadow-sm">

                <span className="h-2 w-2 rounded-full bg-[#0f6668]" />

                Our Dental Services

              </div>

              <h2 className="mt-5 text-4xl font-bold tracking-[-0.03em] text-[#173235] sm:text-5xl">

                Complete care for{" "}

                <span className="text-[#0f6668]">
                  your smile.
                </span>

              </h2>

              <p className="mt-5 text-base leading-7 text-[#6b8182] sm:text-lg">
                Professional dental care designed to support your oral health,
                comfort, and long-term smile.
              </p>

            </div>

            <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

              {siteData.services.map((service, index) => {

                const Icon =
                  iconMap[service.icon] || Stethoscope;

                return (

                  <div
                    key={service.title}
                    className="group relative overflow-hidden rounded-[1.75rem] border border-[#dfeceb] bg-white shadow-[0_10px_35px_rgba(20,70,70,0.06)] transition-all duration-500 hover:-translate-y-2 hover:border-[#b9d9d6] hover:shadow-[0_25px_60px_rgba(20,70,70,0.14)]"
                  >

                    <div className="relative h-52 overflow-hidden">

                      <img
                        src={service.image || fallbackImage}
                        alt={service.title}
                        className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
                        onError={(event) => {
                          event.currentTarget.src = fallbackImage;
                        }}
                      />

                      <div className="absolute inset-0 bg-gradient-to-t from-[#123f41]/70 via-transparent to-transparent" />

                      <div className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-white/30 bg-white/20 text-xs font-bold text-white backdrop-blur-md">
                        {String(index + 1).padStart(2, "0")}
                      </div>

                      <div className="absolute bottom-4 left-5 flex h-11 w-11 items-center justify-center rounded-xl border border-white/30 bg-white/90 text-[#0f6668] shadow-lg">
                        <Icon size={20} strokeWidth={1.8} />
                      </div>

                    </div>

                    <div className="p-6">

                      <h3 className="text-lg font-bold leading-6 text-[#294d4e]">
                        {service.title}
                      </h3>

                      <p className="mt-3 min-h-[72px] text-sm leading-6 text-[#718687]">
                        {service.description}
                      </p>

                      <a
                        href="#appointment"
                        className="group/link mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#0f6668]"
                      >
                        Book Consultation

                        <ArrowRight
                          size={15}
                          className="transition-transform group-hover/link:translate-x-1"
                        />
                      </a>

                    </div>

                    <div className="absolute bottom-0 left-0 h-1 w-0 bg-[#0f6668] transition-all duration-500 group-hover:w-full" />

                  </div>

                );
              })}

            </div>

          </div>

        </section>

        {/* ========================= CONDITIONS ========================= */}

        <section className="bg-white py-24 sm:py-28">

          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

            <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">

              <div>

                <div className="inline-flex items-center gap-2 rounded-full border border-[#d4e7e4] bg-[#f3f9f8] px-4 py-2 text-[10px] font-bold uppercase tracking-[0.15em] text-[#0f6668]">

                  <HeartPulse size={14} />

                  Dental Concerns

                </div>

                <h2 className="mt-5 text-4xl font-bold tracking-[-0.035em] text-[#173235] sm:text-5xl">

                  Care for common{" "}

                  <span className="text-[#0f6668]">
                    dental concerns.
                  </span>

                </h2>

                <p className="mt-6 max-w-xl text-base leading-8 text-[#718687]">
                  Dental concerns can have different causes. A professional
                  examination helps identify the issue and determine the
                  appropriate treatment approach.
                </p>

                <a
                  href="#appointment"
                  className="mt-7 inline-flex items-center gap-2 rounded-xl border border-[#cfe1df] bg-white px-6 py-3.5 text-sm font-bold text-[#315657] shadow-sm transition hover:-translate-y-1 hover:border-[#0f6668] hover:text-[#0f6668]"
                >
                  Talk to the Dentist
                  <ArrowRight size={16} />
                </a>

              </div>

              <div className="grid gap-4 sm:grid-cols-2">

                {siteData.conditions.map((condition, index) => (

                  <div
                    key={condition.title}
                    className="group rounded-2xl border border-[#e0ecea] bg-[#fbfdfd] p-5 transition duration-300 hover:-translate-y-1 hover:border-[#bfdedb] hover:bg-[#f4faf9] hover:shadow-lg"
                  >

                    <div className="flex items-start gap-4">

                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#e7f3f1] text-sm font-bold text-[#0f6668]">
                        {String(index + 1).padStart(2, "0")}
                      </div>

                      <div>

                        <h3 className="font-bold text-[#294d4e]">
                          {condition.title}
                        </h3>

                        <p className="mt-2 text-sm leading-6 text-[#758889]">
                          {condition.description}
                        </p>

                      </div>

                    </div>

                  </div>

                ))}

              </div>

            </div>

          </div>

        </section>

        {/* ========================= CTA ========================= */}

        <section className="relative overflow-hidden bg-[#173235] py-20 sm:py-24">

          <div className="pointer-events-none absolute -left-20 top-0 h-80 w-80 rounded-full bg-[#0f6668] opacity-30 blur-3xl" />

          <div className="pointer-events-none absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-[#9b7932] opacity-20 blur-3xl" />

          <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_0.7fr] lg:px-8">

            <div>

              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.15em] text-[#bde1dd]">

                <Sparkles size={14} />

                {siteData.highlight.eyebrow}

              </div>

              <h2 className="mt-6 max-w-3xl text-4xl font-bold leading-tight tracking-[-0.035em] text-white sm:text-5xl">
                {siteData.highlight.title}
              </h2>

              <p className="mt-5 max-w-2xl text-base leading-8 text-[#bfd0d0] sm:text-lg">
                {siteData.highlight.description}
              </p>

              <a
                href="#appointment"
                className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-bold text-[#173235] shadow-xl transition hover:-translate-y-1"
              >
                {siteData.highlight.buttonText}
                <ArrowRight size={16} />
              </a>

            </div>

            <div className="hidden lg:block">

              <div className="rounded-[2rem] border border-white/10 bg-white/5 p-7">

                <div className="grid grid-cols-2 gap-4">

                  <div className="rounded-2xl border border-white/10 bg-white/5 p-5">

                    <Award className="text-[#c5a55e]" size={24} />

                    <p className="mt-4 text-2xl font-bold text-white">
                      {siteData.doctor.experience}
                    </p>

                    <p className="mt-1 text-xs text-[#afc2c2]">
                      Professional Experience
                    </p>

                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/5 p-5">

                    <Users className="text-[#bde1dd]" size={24} />

                    <p className="mt-4 text-2xl font-bold text-white">
                      BDS
                    </p>

                    <p className="mt-1 text-xs text-[#afc2c2]">
                      Dental Surgeon
                    </p>

                  </div>

                  <div className="col-span-2 rounded-2xl border border-white/10 bg-white/5 p-5">

                    <div className="flex items-center gap-3">

                      <MapPin
                        className="text-[#c5a55e]"
                        size={23}
                      />

                      <div>

                        <p className="text-sm font-bold text-white">
                          {siteData.clinic.name}
                        </p>

                        <p className="mt-1 text-xs text-[#afc2c2]">
                          {siteData.clinic.address}
                        </p>

                      </div>

                    </div>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </section>

        {/* ========================= WHY US ========================= */}

        <section id="why-us" className="bg-[#f8fbfa] py-24 sm:py-28">

          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

            <div className="mx-auto max-w-2xl text-center">

              <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-[#d4e7e4] bg-white px-4 py-2 text-[10px] font-bold uppercase tracking-[0.15em] text-[#0f6668] shadow-sm">

                <ShieldCheck size={14} />

                Why Choose Us

              </div>

              <h2 className="mt-5 text-4xl font-bold tracking-[-0.035em] text-[#173235] sm:text-5xl">

                Dental care with a{" "}

                <span className="text-[#0f6668]">
                  personal touch.
                </span>

              </h2>

              <p className="mt-5 text-base leading-7 text-[#718687] sm:text-lg">
                A comfortable and patient-focused approach to everyday dental care.
              </p>

            </div>

            <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

              {siteData.whyUs.map((item, index) => {

                const Icon =
                  iconMap[item.icon] || HeartHandshake;

                return (

                  <div
                    key={item.title}
                    className="group rounded-[1.5rem] border border-[#e0ecea] bg-white p-7 shadow-[0_10px_30px_rgba(20,70,70,0.04)] transition duration-500 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(20,70,70,0.1)]"
                  >

                    <div className="flex items-start justify-between">

                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e7f3f1] text-[#0f6668] transition group-hover:bg-[#0f6668] group-hover:text-white">

                        <Icon size={22} strokeWidth={1.8} />

                      </div>

                      <span className="text-xs font-bold text-[#bdcaca]">
                        {String(index + 1).padStart(2, "0")}
                      </span>

                    </div>

                    <h3 className="mt-6 text-lg font-bold text-[#294d4e]">
                      {item.title}
                    </h3>

                    <p className="mt-3 text-sm leading-6 text-[#718687]">
                      {item.description}
                    </p>

                  </div>

                );
              })}

            </div>

          </div>

        </section>

        {/* ========================= CLINIC GALLERY ========================= */}

        <section id="gallery" className="bg-white py-20 sm:py-24">

          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

            <div className="mx-auto max-w-2xl text-center">

              <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-[#d4e7e4] bg-[#f3f9f8] px-4 py-2 text-[10px] font-bold uppercase tracking-[0.15em] text-[#0f6668]">
                <Stethoscope size={14} />
                Clinic Gallery
              </div>

              <h2 className="mt-5 text-4xl font-bold tracking-[-0.035em] text-[#173235] sm:text-5xl">
                A look inside our clinic.
              </h2>

              <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-[#718687] sm:text-base">
                Explore the clinic, treatment rooms, dental equipment and our care environment.
              </p>

            </div>

            <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">

              {clinicGallery.map((image, index) => (
                <button
                  key={image}
                  type="button"
                  onClick={() => setSelectedGalleryImage(image)}
                  className="group relative aspect-[4/3] overflow-hidden rounded-2xl border border-[#e0ecea] bg-[#f5f9f8] shadow-[0_8px_24px_rgba(20,70,70,0.05)] focus:outline-none focus:ring-2 focus:ring-[#0f6668] focus:ring-offset-2"
                  aria-label={`Open clinic gallery image ${index + 1}`}
                >
                  <img
                    src={image}
                    alt={`Shree Shyam Dental Care clinic image ${index + 1}`}
                    className="h-full w-full object-contain transition duration-500 group-hover:scale-[1.04]"
                    loading="lazy"
                  />
                  <span className="absolute inset-0 bg-[#0f6668]/0 transition duration-300 group-hover:bg-[#0f6668]/10" />
                </button>
              ))}

            </div>

          </div>

        </section>

        {selectedGalleryImage && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
            onClick={() => setSelectedGalleryImage(null)}
            role="dialog"
            aria-modal="true"
            aria-label="Clinic gallery preview"
          >
            <button
              type="button"
              onClick={() => setSelectedGalleryImage(null)}
              className="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/95 text-[#173235] shadow-lg transition hover:bg-white"
              aria-label="Close image preview"
            >
              <X size={22} />
            </button>

            <img
              src={selectedGalleryImage}
              alt="Shree Shyam Dental Care clinic preview"
              onClick={(event) => event.stopPropagation()}
              className="max-h-[90vh] max-w-[94vw] rounded-xl object-contain shadow-2xl"
            />
          </div>
        )}

        {/* ========================= REVIEWS ========================= */}

        <section id="reviews" className="relative overflow-hidden bg-white py-24 sm:py-28">

          <div className="pointer-events-none absolute -left-32 top-20 h-72 w-72 rounded-full bg-[#dff1ee] opacity-60 blur-3xl" />
          <div className="pointer-events-none absolute -right-32 bottom-10 h-80 w-80 rounded-full bg-[#f1e8d5] opacity-50 blur-3xl" />

          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

            <div className="mx-auto max-w-3xl text-center">

              <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-[#d4e7e4] bg-[#f3f9f8] px-4 py-2 text-[10px] font-bold uppercase tracking-[0.15em] text-[#0f6668]">
                <Star size={14} fill="currentColor" />
                Patient Reviews
              </div>

              <h2 className="mt-5 text-4xl font-bold tracking-[-0.035em] text-[#173235] sm:text-5xl">
                What our patients say.
              </h2>

              <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-[#718687] sm:text-lg">
                Patient experiences and feedback about consultations, treatment and care at Shree Shyam Dental Care.
              </p>

              <div className="mx-auto mt-8 flex w-fit flex-col items-center gap-2 rounded-2xl border border-[#dce9e7] bg-[#fbfdfd] px-7 py-5 shadow-[0_10px_30px_rgba(20,70,70,0.05)] sm:flex-row sm:gap-5">
                <div className="text-center sm:text-left">
                  <div className="flex items-center justify-center gap-1 text-[#b48a32] sm:justify-start">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Star key={index} size={19} fill="currentColor" strokeWidth={1.7} />
                    ))}
                  </div>
                  <p className="mt-2 text-xs font-semibold text-[#718687]">Based on {customerReviews.length} patient reviews</p>
                </div>
                <div className="hidden h-10 w-px bg-[#dce9e7] sm:block" />
                <div className="text-center">
                  <p className="text-3xl font-extrabold text-[#173235]">{averageReviewRating.toFixed(1)}</p>
                  <p className="text-xs font-bold uppercase tracking-wider text-[#0f6668]">Overall Rating</p>
                </div>
              </div>

              <p className="mt-4 text-[11px] text-[#93a2a2]">
                ★ 4.5 average rating
              </p>

            </div>

            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">

              {customerReviews.map((review, index) => (
                <article
                  key={`${review.name}-${index}`}
                  className="group flex h-full min-h-[210px] flex-col rounded-2xl border border-[#e0ecea] bg-[#fbfdfd] p-4 shadow-[0_8px_24px_rgba(20,70,70,0.04)] transition duration-300 hover:-translate-y-1 hover:border-[#bfdedb] hover:shadow-[0_14px_35px_rgba(20,70,70,0.08)]"
                >

                  <div className="flex items-center justify-between gap-3">
                    <div className="flex gap-1 text-[#b48a32]" aria-label={`${review.rating} out of 5 stars`}>
                      {Array.from({ length: 5 }).map((_, starIndex) => (
                        <Star
                          key={starIndex}
                          size={16}
                          fill={starIndex < review.rating ? "currentColor" : "none"}
                          className={starIndex < review.rating ? "" : "text-[#cbd8d7]"}
                        />
                      ))}
                    </div>
                    <span className="rounded-full bg-[#eaf4f2] px-2.5 py-1 text-[10px] font-bold text-[#0f6668]">
                      {review.rating}.0
                    </span>
                  </div>

                  <p className="mt-3 line-clamp-2 flex-1 text-xs leading-5 text-[#667e7f]">
                    “{review.text}”
                  </p>

                  <div className="mt-4 flex items-center gap-2 border-t border-[#e5efed] pt-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#0f6668] text-xs font-bold text-white">
                      {review.name.charAt(0)}
                    </div>
                    <div>
                      <p className="truncate text-xs font-bold text-[#294d4e]">{review.name}</p>
                      <p className="mt-0.5 text-[9px] text-[#899999]">Patient Review</p>
                    </div>
                    <Check size={14} className="ml-auto shrink-0 text-[#0f6668]" />
                  </div>

                </article>
              ))}

            </div>

          </div>

        </section>

        {/* ========================= FAQ ========================= */}

        <section id="faq" className="bg-[#f3f9f8] py-24 sm:py-28">

          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">

            <div className="mx-auto max-w-2xl text-center">

              <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-[#cce3e0] bg-white px-4 py-2 text-[10px] font-bold uppercase tracking-[0.15em] text-[#0f6668] shadow-sm">

                <MessagesSquare size={14} />

                Frequently Asked Questions

              </div>

              <h2 className="mt-5 text-4xl font-bold tracking-[-0.035em] text-[#173235] sm:text-5xl">
                Questions, answered.
              </h2>

              <p className="mt-5 text-base leading-7 text-[#718687]">
                Find quick answers about appointments, location, timings and dental care.
              </p>

            </div>

            <div className="mt-12 space-y-3">

              {siteData.faq.map((item, index) => {

                const isOpen = openFaq === index;

                return (

                  <div
                    key={item.question}
                    className={`overflow-hidden rounded-2xl border transition ${
                      isOpen
                        ? "border-[#bcdcd8] bg-white shadow-sm"
                        : "border-[#dce9e7] bg-white/70"
                    }`}
                  >

                    <button
                      type="button"
                      onClick={() =>
                        setOpenFaq(isOpen ? null : index)
                      }
                      className="flex w-full items-center justify-between gap-5 px-5 py-5 text-left sm:px-6"
                    >

                      <span className="text-sm font-bold text-[#294d4e] sm:text-base">
                        {item.question}
                      </span>

                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#eaf4f2] text-[#0f6668]">

                        <ChevronDown
                          size={17}
                          className={`transition-transform ${
                            isOpen ? "rotate-180" : ""
                          }`}
                        />

                      </span>

                    </button>

                    {isOpen && (

                      <div className="border-t border-[#e4efed] px-5 pb-5 pt-4 sm:px-6">

                        <p className="text-sm leading-7 text-[#718687]">
                          {item.answer}
                        </p>

                      </div>

                    )}

                  </div>

                );
              })}

            </div>

          </div>

        </section>

        {/* ======================================================== */}
        {/* ================= APPOINTMENT SECTION ================== */}
        {/* ======================================================== */}

        <section id="appointment" className="bg-white py-24 sm:py-28">

          <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">

            {/* ================= LEFT SIDE ================= */}

            <div>

              <div className="inline-flex items-center gap-2 rounded-full border border-[#d4e7e4] bg-[#f3f9f8] px-4 py-2 text-[10px] font-bold uppercase tracking-[0.15em] text-[#0f6668]">

                <CalendarDays size={14} />

                Appointment

              </div>

              <h2 className="mt-5 text-4xl font-bold tracking-[-0.035em] text-[#173235] sm:text-5xl">
                Book Your Dental Appointment
              </h2>

              <p className="mt-6 text-base leading-8 text-[#718687] sm:text-lg">
                Fill in your details and submit your appointment request.
                The clinic will review it and confirm your appointment.
              </p>

              {/* CALL CLINIC */}

              <a
                href={`tel:${siteData.clinic.phone}`}
                className="mt-8 flex items-center gap-4 rounded-2xl border border-[#e0ecea] bg-[#f8fbfa] p-5 transition hover:-translate-y-1 hover:shadow-lg"
              >

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#e7f3f1] text-[#0f6668]">
                  <Phone size={19} />
                </div>

                <div>

                  <p className="text-xs font-semibold uppercase tracking-wider text-[#849596]">
                    Call Clinic
                  </p>

                  <p className="mt-1 font-bold text-[#294d4e]">
                    {siteData.clinic.phone}
                  </p>

                  <p className="mt-1 text-xs text-[#718687]">
                    Tap to call directly
                  </p>

                </div>

              </a>

              {/* WHATSAPP */}

              <a
                href={`https://wa.me/91${siteData.clinic.whatsapp}`}
                target="_blank"
                rel="noreferrer"
                className="mt-4 flex items-center gap-4 rounded-2xl border border-[#dcebdc] bg-[#f5fbf6] p-5 transition hover:-translate-y-1 hover:shadow-lg"
              >

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#e2f5e7] text-[#21884c]">
                  <MessagesSquare size={19} />
                </div>

                <div>

                  <p className="text-xs font-semibold uppercase tracking-wider text-[#718f78]">
                    WhatsApp
                  </p>

                  <p className="mt-1 font-bold text-[#294d4e]">
                    Chat with Clinic
                  </p>

                  <p className="mt-1 text-xs text-[#718687]">
                    Send your dental enquiry directly
                  </p>

                </div>

              </a>

              {/* CLINIC HOURS */}

              <div className="mt-4 flex items-start gap-4 rounded-2xl border border-[#e0ecea] bg-[#f8fbfa] p-5">

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#f3eddf] text-[#9b7932]">
                  <Clock3 size={19} />
                </div>

                <div>

                  <p className="text-xs font-semibold uppercase tracking-wider text-[#849596]">
                    Clinic Hours
                  </p>

                  <p className="mt-1 font-bold text-[#294d4e]">
                    {siteData.clinic.timings.days}
                  </p>

                  <p className="text-sm text-[#718687]">
                    {siteData.clinic.timings.hours}
                  </p>

                </div>

              </div>

              {/* ADDRESS */}

              <div className="mt-4 flex items-start gap-4 rounded-2xl border border-[#e0ecea] bg-[#f8fbfa] p-5">

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#e7f3f1] text-[#0f6668]">
                  <MapPin size={19} />
                </div>

                <div>

                  <p className="text-xs font-semibold uppercase tracking-wider text-[#849596]">
                    Clinic Address
                  </p>

                  <p className="mt-1 font-bold text-[#294d4e]">
                    {siteData.clinic.address}
                  </p>

                </div>

              </div>

            </div>

            {/* ================= RIGHT FORM ================= */}

            <div className="rounded-[2rem] border border-[#dfeceb] bg-[#f8fbfa] p-5 shadow-[0_25px_70px_rgba(20,70,70,0.08)] sm:p-8">

              <div className="mb-7">

                <h3 className="text-2xl font-bold text-[#173235]">
                  Appointment Request
                </h3>

                <p className="mt-2 text-sm leading-6 text-[#718687]">
                  Enter your details below. Your request will be saved
                  securely and sent to the clinic for confirmation.
                </p>

              </div>

              <form onSubmit={handleAppointment}>

                <div className="grid gap-5 sm:grid-cols-2">

                  {/* FULL NAME */}

                  <div>

                    <label className="mb-2 block text-sm font-semibold text-[#405e5f]">
                      Full Name *
                    </label>

                    <input
                      required
                      name="fullName"
                      value={appointmentData.fullName}
                      onChange={handleAppointmentChange}
                      type="text"
                      placeholder="Enter your name"
                      className="w-full rounded-xl border border-[#d6e5e3] bg-white px-4 py-3.5 text-sm outline-none transition placeholder:text-[#a1b0b0] focus:border-[#0f6668] focus:ring-4 focus:ring-[#0f6668]/10"
                    />

                  </div>

                  {/* PHONE */}

                  <div>

                    <label className="mb-2 block text-sm font-semibold text-[#405e5f]">
                      Phone Number *
                    </label>

                    <input
                      required
                      name="phone"
                      value={appointmentData.phone}
                      onChange={handleAppointmentChange}
                      type="tel"
                      inputMode="numeric"
                      pattern="[0-9]{10}"
                      maxLength={10}
                      placeholder="10-digit mobile number"
                      className="w-full rounded-xl border border-[#d6e5e3] bg-white px-4 py-3.5 text-sm outline-none transition placeholder:text-[#a1b0b0] focus:border-[#0f6668] focus:ring-4 focus:ring-[#0f6668]/10"
                    />

                    <p className="mt-1.5 text-[11px] text-[#899999]">
                      Enter 10 digit mobile number
                    </p>

                  </div>

                  {/* EMAIL */}

                  <div>

                    <label className="mb-2 block text-sm font-semibold text-[#405e5f]">
                      Email *
                    </label>

                    <input
                      required
                      name="email"
                      value={appointmentData.email}
                      onChange={handleAppointmentChange}
                      type="email"
                      placeholder="Enter email"
                      className="w-full rounded-xl border border-[#d6e5e3] bg-white px-4 py-3.5 text-sm outline-none transition placeholder:text-[#a1b0b0] focus:border-[#0f6668] focus:ring-4 focus:ring-[#0f6668]/10"
                    />

                  </div>

                  {/* DATE */}

                  <div>

                    <label className="mb-2 block text-sm font-semibold text-[#405e5f]">
                      Preferred Date *
                    </label>

                    <input
                      required
                      name="date"
                      value={appointmentData.date}
                      onChange={handleAppointmentChange}
                      type="date"
                      min={new Date().toISOString().split("T")[0]}
                      className="w-full rounded-xl border border-[#d6e5e3] bg-white px-4 py-3.5 text-sm outline-none transition focus:border-[#0f6668] focus:ring-4 focus:ring-[#0f6668]/10"
                    />

                  </div>

                  {/* TIME */}

                  <div>

                    <label className="mb-2 block text-sm font-semibold text-[#405e5f]">
                      Preferred Time *
                    </label>

                    <select
                      required
                      name="time"
                      value={appointmentData.time}
                      onChange={handleAppointmentChange}
                      className="w-full rounded-xl border border-[#d6e5e3] bg-white px-4 py-3.5 text-sm outline-none transition focus:border-[#0f6668] focus:ring-4 focus:ring-[#0f6668]/10"
                    >

                      <option value="" disabled>
                        Select time
                      </option>

                      <option value="10:00 AM">
                        10:00 AM
                      </option>

                      <option value="11:00 AM">
                        11:00 AM
                      </option>

                      <option value="12:00 PM">
                        12:00 PM
                      </option>

                      <option value="1:00 PM">
                        1:00 PM
                      </option>

                      <option value="2:00 PM">
                        2:00 PM
                      </option>

                      <option value="3:00 PM">
                        3:00 PM
                      </option>

                      <option value="4:00 PM">
                        4:00 PM
                      </option>

                      <option value="5:00 PM">
                        5:00 PM
                      </option>

                    </select>

                  </div>

                  {/* CONCERN */}

                  <div>

                    <label className="mb-2 block text-sm font-semibold text-[#405e5f]">
                      Dental Concern *
                    </label>

                    <select
                      required
                      name="concern"
                      value={appointmentData.concern}
                      onChange={handleAppointmentChange}
                      className="w-full rounded-xl border border-[#d6e5e3] bg-white px-4 py-3.5 text-sm outline-none transition focus:border-[#0f6668] focus:ring-4 focus:ring-[#0f6668]/10"
                    >

                      <option value="" disabled>
                        Select concern
                      </option>

                      {siteData.conditions.map((condition) => (

                        <option
                          key={condition.title}
                          value={condition.title}
                        >
                          {condition.title}
                        </option>

                      ))}

                      <option value="General Dental Checkup">
                        General Dental Checkup
                      </option>

                      <option value="Other">
                        Other
                      </option>

                    </select>

                  </div>

                  {/* MESSAGE */}

                  <div className="sm:col-span-2">

                    <label className="mb-2 block text-sm font-semibold text-[#405e5f]">
                      Message
                    </label>

                    <textarea
                      name="message"
                      value={appointmentData.message}
                      onChange={handleAppointmentChange}
                      rows={5}
                      placeholder="Tell us briefly about your dental concern..."
                      className="w-full resize-none rounded-xl border border-[#d6e5e3] bg-white px-4 py-3.5 text-sm outline-none transition placeholder:text-[#a1b0b0] focus:border-[#0f6668] focus:ring-4 focus:ring-[#0f6668]/10"
                    />

                  </div>

                </div>

                {/* WHATSAPP BUTTON */}

                <button
                  type="submit"
                  disabled={appointmentStatus === "loading"}
                  className="group mt-6 flex w-full items-center justify-center gap-3 rounded-xl bg-[#0f6668] px-6 py-4 text-sm font-bold text-white shadow-lg transition hover:-translate-y-1 hover:bg-[#0b5557] disabled:cursor-not-allowed disabled:opacity-70"
                >

                  <CalendarDays size={19} />

                  {appointmentStatus === "loading"
                    ? "Submitting Appointment..."
                    : "Request Appointment"}

                  {appointmentStatus !== "loading" && (
                    <ArrowRight
                      size={17}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  )}

                </button>

                {/* CALL BUTTON */}

                <a
                  href={`tel:${siteData.clinic.phone}`}
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-[#cfe1df] bg-white px-6 py-4 text-sm font-bold text-[#315657] transition hover:-translate-y-1 hover:border-[#0f6668] hover:text-[#0f6668]"
                >

                  <Phone size={18} />

                  Call Clinic: {siteData.clinic.phone}

                </a>

                {/* APPOINTMENT STATUS */}

                {appointmentStatus === "success" && (
                  <div className="mt-5 rounded-xl border border-[#bfe0d0] bg-[#effaf4] p-4">

                    <div className="flex items-start gap-3">

                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#21884c] text-white">
                        <Check size={16} />
                      </div>

                      <div>
                        <p className="text-sm font-bold text-[#21643e]">
                          Appointment Request Submitted
                        </p>

                        <p className="mt-1 text-xs leading-5 text-[#4d7160]">
                          {appointmentMessage}
                        </p>

                        {appointmentId && (
                          <p className="mt-2 text-xs font-bold text-[#21643e]">
                            Appointment ID: #{appointmentId}
                          </p>
                        )}

                      </div>

                    </div>

                  </div>
                )}

                {appointmentStatus === "error" && (
                  <div className="mt-5 rounded-xl border border-[#efcaca] bg-[#fff5f5] p-4">

                    <div className="flex items-start gap-3">

                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#c94b4b] text-white">
                        <X size={16} />
                      </div>

                      <div>
                        <p className="text-sm font-bold text-[#8c3030]">
                          Appointment Request Failed
                        </p>

                        <p className="mt-1 text-xs leading-5 text-[#8b5a5a]">
                          {appointmentMessage}
                        </p>
                      </div>

                    </div>

                  </div>
                )}

                {appointmentStatus === "idle" && (
                  <div className="mt-5 rounded-xl border border-[#dce9e7] bg-white p-4">

                    <div className="flex items-start gap-3">

                      <Check
                        size={18}
                        className="mt-0.5 shrink-0 text-[#0f6668]"
                      />

                      <p className="text-xs leading-5 text-[#718687]">
                        Your appointment request will be saved in the clinic
                        system as pending. The clinic will review availability
                        and confirm or reject the request.
                      </p>

                    </div>

                  </div>
                )}

              </form>

            </div>

          </div>

        </section>

        {/* ========================= CONTACT ========================= */}

        <section
          id="contact"
          className="relative overflow-hidden bg-[#f3f9f8] py-24 sm:py-28"
        >

          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

            <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">

              <div>

                <div className="inline-flex items-center gap-2 rounded-full border border-[#cce3e0] bg-white px-4 py-2 text-[10px] font-bold uppercase tracking-[0.15em] text-[#0f6668] shadow-sm">

                  <MapPin size={14} />

                  Contact Us

                </div>

                <h2 className="mt-5 text-4xl font-bold tracking-[-0.035em] text-[#173235] sm:text-5xl">
                  {siteData.contact.title}
                </h2>

                <p className="mt-6 text-base leading-8 text-[#718687]">
                  {siteData.contact.description}
                </p>

                <div className="mt-8 space-y-4">

                  <a
                    href={`tel:${siteData.clinic.phone}`}
                    className="group flex items-center gap-4 rounded-2xl border border-[#dce9e7] bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                  >

                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#e7f3f1] text-[#0f6668]">
                      <Phone size={20} />
                    </div>

                    <div>

                      <p className="text-xs font-semibold uppercase tracking-wider text-[#879798]">
                        {siteData.contact.phoneLabel}
                      </p>

                      <p className="mt-1 font-bold text-[#294d4e]">
                        {siteData.clinic.phone}
                      </p>

                    </div>

                  </a>

                  <a
                    href={`https://wa.me/91${siteData.clinic.whatsapp}`}
                    target="_blank"
                    rel="noreferrer"
                    className="group flex items-center gap-4 rounded-2xl border border-[#dce9e7] bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                  >

                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#e8f5eb] text-[#1b8c4b]">
                      <MessagesSquare size={20} />
                    </div>

                    <div>

                      <p className="text-xs font-semibold uppercase tracking-wider text-[#879798]">
                        {siteData.contact.whatsappLabel}
                      </p>

                      <p className="mt-1 font-bold text-[#294d4e]">
                        Chat on WhatsApp
                      </p>

                    </div>

                  </a>

                  <div className="flex items-center gap-4 rounded-2xl border border-[#dce9e7] bg-white p-5 shadow-sm">

                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#f3eddf] text-[#9b7932]">
                      <MapPin size={20} />
                    </div>

                    <div>

                      <p className="text-xs font-semibold uppercase tracking-wider text-[#879798]">
                        {siteData.contact.addressLabel}
                      </p>

                      <p className="mt-1 font-bold text-[#294d4e]">
                        {siteData.contact.address}
                      </p>

                    </div>

                  </div>

                  <div className="flex items-center gap-4 rounded-2xl border border-[#dce9e7] bg-white p-5 shadow-sm">

                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#e7f3f1] text-[#0f6668]">
                      <Clock3 size={20} />
                    </div>

                    <div>

                      <p className="text-xs font-semibold uppercase tracking-wider text-[#879798]">
                        {siteData.contact.timingLabel}
                      </p>

                      <p className="mt-1 font-bold text-[#294d4e]">
                        {siteData.contact.timing}
                      </p>

                    </div>

                  </div>

                </div>

              </div>

              <div className="overflow-hidden rounded-[2rem] border border-[#d8e8e6] bg-white shadow-[0_25px_70px_rgba(20,70,70,0.1)]">

                <div className="relative h-[500px] w-full sm:h-[560px]">

                  <iframe
                    title="Shree Shyam Dental Care location"
                    src="https://www.google.com/maps?q=25.3558725,74.6538029&z=18&output=embed"
                    className="absolute inset-0 h-full w-full border-0"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />

                  <div className="pointer-events-none absolute left-4 right-4 top-4 sm:left-5 sm:right-5 sm:top-5">
                    <div className="mx-auto flex max-w-lg items-center gap-3 rounded-2xl border border-white/70 bg-white/95 px-4 py-3 shadow-lg backdrop-blur-md">

                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0f6668] text-white">
                        <MapPin size={19} />
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-[#173235]">
                          {siteData.clinic.name}
                        </p>
                        <p className="mt-0.5 line-clamp-2 text-xs leading-5 text-[#718687]">
                          {siteData.contact.address}
                        </p>
                      </div>

                    </div>
                  </div>

                </div>

                <div className="flex flex-col gap-4 border-t border-[#e1ecea] bg-white p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#0f6668]">
                      Find Us
                    </p>
                    <p className="mt-1 text-sm font-semibold text-[#294d4e]">
                      Opposite Shreemati Complex, Near Moti Bavji Chauraha, Bhilwara
                    </p>
                  </div>

                  <a
                    href="https://www.google.com/maps/dir/?api=1&destination=25.3558725,74.6538029"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#173235] px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#0f6668]"
                  >
                    Get Directions
                    <ArrowRight size={16} />
                  </a>

                </div>

              </div>

            </div>

          </div>

        </section>

      </main>

      {/* ========================= FOOTER ========================= */}

      <footer className="bg-[#10292b] text-white">

        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">

          <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr_0.8fr]">

            <div>

              <div className="flex items-center gap-3">

                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0f6668]">
                  <Stethoscope size={21} />
                </div>

                <div>

                  <p className="font-bold">
                    {siteData.clinic.name}
                  </p>

                  <p className="mt-0.5 text-[11px] uppercase tracking-[0.14em] text-[#8eaaaa]">
                    Dental Care
                  </p>

                </div>

              </div>

              <p className="mt-5 max-w-md text-sm leading-7 text-[#9eb2b3]">
                {siteData.footer.description}
              </p>

              <div className="mt-6 flex items-center gap-3">

                <a
                  href={`tel:${siteData.clinic.phone}`}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-[#b8d1cf] transition hover:bg-[#0f6668] hover:text-white"
                >
                  <Phone size={17} />
                </a>

                <a
                  href={`https://wa.me/91${siteData.clinic.whatsapp}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-[#b8d1cf] transition hover:bg-[#0f6668] hover:text-white"
                >
                  <MessagesSquare size={17} />
                </a>

                {siteData.clinic.email && (

                  <a
                    href={`mailto:${siteData.clinic.email}`}
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-[#b8d1cf] transition hover:bg-[#0f6668] hover:text-white"
                  >
                    <Mail size={17} />
                  </a>

                )}

              </div>

            </div>

            <div>

              <h3 className="text-sm font-bold uppercase tracking-[0.14em]">
                Quick Links
              </h3>

              <div className="mt-5 grid grid-cols-2 gap-3">

                {siteData.footer.quickLinks.map((link) => {

                  const hrefMap: Record<string, string> = {
                    Home: "#home",
                    About: "#about",
                    Services: "#services",
                    "Why Us": "#why-us",
                    Reviews: "#reviews",
                    FAQ: "#faq",
                    Contact: "#contact",
                  };

                  return (

                    <a
                      key={link}
                      href={hrefMap[link] || "#home"}
                      className="text-sm text-[#9eb2b3] transition hover:text-white"
                    >
                      {link}
                    </a>

                  );

                })}

              </div>

            </div>

            <div>

              <h3 className="text-sm font-bold uppercase tracking-[0.14em]">
                Clinic
              </h3>

              <div className="mt-5 space-y-4">

                <div className="flex items-start gap-3">

                  <MapPin
                    size={17}
                    className="mt-0.5 shrink-0 text-[#78bdb8]"
                  />

                  <p className="text-sm leading-6 text-[#9eb2b3]">
                    {siteData.clinic.address}
                  </p>

                </div>

                <div className="flex items-center gap-3">

                  <Phone
                    size={17}
                    className="text-[#78bdb8]"
                  />

                  <a
                    href={`tel:${siteData.clinic.phone}`}
                    className="text-sm text-[#9eb2b3] transition hover:text-white"
                  >
                    {siteData.clinic.phone}
                  </a>

                </div>

                <div className="flex items-start gap-3">

                  <Clock3
                    size={17}
                    className="mt-0.5 shrink-0 text-[#78bdb8]"
                  />

                  <p className="text-sm leading-6 text-[#9eb2b3]">
                    {siteData.clinic.timings.days}
                    <br />
                    {siteData.clinic.timings.hours}
                  </p>

                </div>

              </div>

            </div>

          </div>

          <div className="mt-12 border-t border-white/10 pt-7">

            <div className="flex flex-col gap-3 text-xs text-[#81999a] sm:flex-row sm:items-center sm:justify-between">

              <p>
                {siteData.footer.copyright}
              </p>

              <p>
                {siteData.doctor.name} •{" "}
                {siteData.doctor.qualification} •{" "}
                {siteData.doctor.designation}
              </p>

            </div>

          </div>

        </div>

      </footer>

      {/* ========================= MOBILE ACTION BAR ========================= */}

      <div className="fixed bottom-4 left-4 right-4 z-40 flex gap-2 rounded-2xl border border-white/70 bg-white/95 p-2 shadow-[0_15px_45px_rgba(20,70,70,0.18)] backdrop-blur-xl lg:hidden">

        <a
          href={`tel:${siteData.clinic.phone}`}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#f1f8f7] px-3 py-3 text-xs font-bold text-[#0f6668]"
        >
          <Phone size={16} />
          Call
        </a>

        <a
          href={`https://wa.me/91${siteData.clinic.whatsapp}`}
          target="_blank"
          rel="noreferrer"
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#edf8ef] px-3 py-3 text-xs font-bold text-[#21884c]"
        >
          <MessagesSquare size={16} />
          WhatsApp
        </a>

        <a
          href="#appointment"
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#0f6668] px-3 py-3 text-xs font-bold text-white"
        >
          <CalendarDays size={16} />
          Book
        </a>

      </div>

    </div>
  );
}

export default App;