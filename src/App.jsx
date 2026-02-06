import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  Bell,
  BrainCircuit,
  Briefcase,
  Calendar as CalendarIcon,
  CheckCircle,
  ChevronRight,
  FileText,
  Heart,
  LogOut,
  Mail,
  Menu,
  MessageSquare,
  Plus,
  Send,
  Settings,
  Shield,
  User,
  Users,
  Video
} from 'lucide-react';

const STORAGE_KEYS = {
  user: 'hroom_user',
  jobs: 'hroom_jobs',
  applications: 'hroom_applications',
  posts: 'hroom_posts',
  events: 'hroom_events',
  cvs: 'hroom_cvs',
  settings: 'hroom_settings',
  savedJobs: 'hroom_saved_jobs'
};

const DEFAULT_SETTINGS = {
  privateProfile: false,
  allowMessages: 'connections',
  commentControl: 'everyone',
  keywordFilter: '',
  burnoutInsights: true,
  notifications: {
    jobUpdates: true,
    communityMentions: true,
    reminders: true
  },
  screenTimeLimit: 180,
  restrictedMode: false
};

const JOB_TYPES = ['Full-time', 'Part-time', 'Contract', 'Internship'];
const EVENT_TYPES = ['Interview', 'Meeting', 'Deadline', 'Focus Block'];
const APPLICATION_STATUSES = ['sent', 'viewed', 'shortlisted'];

const formatDate = (isoString) => {
  if (!isoString) return '';
  return new Date(isoString).toLocaleDateString();
};

const getInitials = (name) => {
  if (!name) return '';
  const parts = name.trim().split(' ');
  return parts.slice(0, 2).map((part) => part[0]).join('').toUpperCase();
};

const useLocalStorage = (key, initialValue) => {
  const [value, setValue] = useState(() => {
    try {
      const stored = window.localStorage.getItem(key);
      return stored ? JSON.parse(stored) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });

  useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
};

const Button = ({ children, onClick, variant = 'primary', className = '', ...props }) => {
  const baseStyle =
    'px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2';
  const variants = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-200',
    secondary: 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50',
    ghost: 'text-slate-600 hover:bg-slate-100',
    danger: 'bg-red-50 text-red-600 hover:bg-red-100',
    success: 'bg-emerald-600 text-white hover:bg-emerald-700'
  };
  return (
    <button className={`${baseStyle} ${variants[variant]} ${className}`} onClick={onClick} {...props}>
      {children}
    </button>
  );
};

const Card = ({ children, className = '' }) => (
  <div className={`bg-white rounded-xl border border-slate-100 shadow-sm ${className}`}>{children}</div>
);

const Badge = ({ children, color = 'indigo' }) => {
  const colors = {
    indigo: 'bg-indigo-50 text-indigo-700',
    green: 'bg-emerald-50 text-emerald-700',
    blue: 'bg-blue-50 text-blue-700',
    orange: 'bg-orange-50 text-orange-700',
    slate: 'bg-slate-100 text-slate-700'
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${colors[color] || colors.slate}`}>
      {children}
    </span>
  );
};

const Toggle = ({ checked, onChange }) => (
  <button
    type="button"
    onClick={() => onChange(!checked)}
    className={`w-10 h-6 rounded-full relative transition-colors ${checked ? 'bg-indigo-600' : 'bg-slate-200'}`}
  >
    <div
      className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${checked ? 'right-1' : 'left-1'}`}
    ></div>
  </button>
);

export default function App() {
  const [user, setUser] = useLocalStorage(STORAGE_KEYS.user, null);
  const [jobs, setJobs] = useLocalStorage(STORAGE_KEYS.jobs, []);
  const [applications, setApplications] = useLocalStorage(STORAGE_KEYS.applications, []);
  const [posts, setPosts] = useLocalStorage(STORAGE_KEYS.posts, []);
  const [events, setEvents] = useLocalStorage(STORAGE_KEYS.events, []);
  const [cvs, setCvs] = useLocalStorage(STORAGE_KEYS.cvs, []);
  const [settings, setSettings] = useLocalStorage(STORAGE_KEYS.settings, DEFAULT_SETTINGS);
  const [savedJobs, setSavedJobs] = useLocalStorage(STORAGE_KEYS.savedJobs, []);

  const [authStep, setAuthStep] = useState('auth');
  const [activeView, setActiveView] = useState('dashboard');
  const [authEmail, setAuthEmail] = useState('');

  useEffect(() => {
    if (!user) {
      setAuthStep('auth');
      return;
    }
    if (!user.role) {
      setAuthStep('role');
      return;
    }
    setAuthStep('app');
  }, [user]);

  const handleLogout = () => {
    setUser(null);
    setAuthEmail('');
    setActiveView('dashboard');
  };

  if (authStep !== 'app') {
    return (
      <AuthFlow
        authStep={authStep}
        setAuthStep={setAuthStep}
        authEmail={authEmail}
        setAuthEmail={setAuthEmail}
        setUser={setUser}
      />
    );
  }

  const filteredEvents = events.filter((eventItem) => eventItem.ownerEmail === user.email);

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-800">
      <aside className="w-64 bg-white border-r border-slate-200 flex-col hidden md:flex">
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <Users className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl text-slate-900">HRoom</span>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          <SidebarItem icon={Users} label="Dashboard" id="dashboard" activeView={activeView} setActiveView={setActiveView} />
          <SidebarItem
            icon={Briefcase}
            label={user.role === 'HR' ? 'Recruitment' : 'Jobs'}
            id="jobs"
            activeView={activeView}
            setActiveView={setActiveView}
          />
          <SidebarItem
            icon={MessageSquare}
            label={user.role === 'HR' ? 'HR Community' : 'Talent Community'}
            id="community"
            activeView={activeView}
            setActiveView={setActiveView}
          />
          <SidebarItem
            icon={CalendarIcon}
            label="Calendar"
            id="calendar"
            activeView={activeView}
            setActiveView={setActiveView}
          />
          {user.role === 'HR' && (
            <SidebarItem icon={BrainCircuit} label="AI Assistant" id="ai" activeView={activeView} setActiveView={setActiveView} />
          )}
          <SidebarItem icon={Settings} label="Settings" id="settings" activeView={activeView} setActiveView={setActiveView} />
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center gap-3 px-2 py-3">
            {user.photoUrl ? (
              <img src={user.photoUrl} alt={user.name} className="w-10 h-10 rounded-full object-cover" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold">
                {getInitials(user.name)}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">{user.name}</p>
              <p className="text-xs text-slate-500 truncate">{user.role === 'HR' ? 'HR Professional' : 'Employee'}</p>
            </div>
            <button onClick={handleLogout} className="text-slate-400 hover:text-red-500 transition-colors">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </aside>

      <div className="md:hidden fixed top-0 left-0 right-0 bg-white border-b border-slate-200 p-4 z-50 flex justify-between items-center">
        <span className="font-bold text-lg text-indigo-600">HRoom</span>
        <button className="text-slate-600">
          <Menu className="w-6 h-6" />
        </button>
      </div>

      <main className="flex-1 overflow-auto p-4 md:p-8 pt-20 md:pt-8">
        {activeView === 'dashboard' && (
          <Dashboard
            user={user}
            jobs={jobs}
            applications={applications}
            events={filteredEvents}
            posts={posts}
            settings={settings}
            setActiveView={setActiveView}
          />
        )}
        {activeView === 'jobs' && (
          <JobBoard
            user={user}
            jobs={jobs}
            setJobs={setJobs}
            applications={applications}
            setApplications={setApplications}
            cvs={cvs}
            setCvs={setCvs}
            savedJobs={savedJobs}
            setSavedJobs={setSavedJobs}
          />
        )}
        {activeView === 'community' && <Community user={user} posts={posts} setPosts={setPosts} />}
        {activeView === 'ai' && (
          <AIAssistant
            user={user}
            jobs={jobs}
            applications={applications}
            events={filteredEvents}
            settings={settings}
          />
        )}
        {activeView === 'calendar' && (
          <CalendarView user={user} events={filteredEvents} setEvents={setEvents} />
        )}
        {activeView === 'settings' && (
          <SettingsPage
            user={user}
            setUser={setUser}
            settings={settings}
            setSettings={setSettings}
            cvs={cvs}
            setCvs={setCvs}
          />
        )}
      </main>
    </div>
  );
}

function AuthFlow({ authStep, setAuthStep, authEmail, setAuthEmail, setUser }) {
  const [profileForm, setProfileForm] = useState({
    name: '',
    bio: '',
    gender: '',
    age: '',
    company: '',
    photoUrl: ''
  });

  const handleGoogle = () => {
    if (!authEmail.trim()) return;
    setAuthStep('profile');
  };

  const handleProfileSubmit = (event) => {
    event.preventDefault();
    setUser({
      name: profileForm.name,
      email: authEmail,
      bio: profileForm.bio,
      gender: profileForm.gender,
      age: profileForm.age,
      company: profileForm.company,
      photoUrl: profileForm.photoUrl,
      role: null
    });
    setAuthStep('role');
  };

  const handleRoleSelect = (role) => {
    setUser((previous) => ({ ...previous, role }));
    setAuthStep('app');
  };

  if (authStep === 'auth') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 text-center space-y-6">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
              <Users className="w-8 h-8 text-white" />
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">HRoom</h1>
            <p className="text-slate-500 mt-2">The all-in-one workspace for HR professionals and talent.</p>
          </div>

          <div className="space-y-4 pt-4">
            <input
              type="email"
              value={authEmail}
              onChange={(event) => setAuthEmail(event.target.value)}
              placeholder="Enter your Google email"
              className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
              required
            />
            <button
              onClick={handleGoogle}
              className="w-full flex items-center justify-center gap-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium py-3 px-4 rounded-xl transition-all shadow-sm group"
            >
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
              Continue with Google
            </button>
            <p className="text-xs text-slate-400">
              By clicking continue, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (authStep === 'profile') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Complete your profile</h2>
          <p className="text-slate-500 mb-6">Tell us a bit about you to personalize HRoom.</p>
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                <input
                  required
                  value={profileForm.name}
                  onChange={(event) => setProfileForm((previous) => ({ ...previous, name: event.target.value }))}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Gender</label>
                <select
                  required
                  value={profileForm.gender}
                  onChange={(event) => setProfileForm((previous) => ({ ...previous, gender: event.target.value }))}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="">Select</option>
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                  <option value="nonbinary">Non-binary</option>
                  <option value="prefer-not">Prefer not to say</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Short bio</label>
              <textarea
                required
                value={profileForm.bio}
                onChange={(event) => setProfileForm((previous) => ({ ...previous, bio: event.target.value }))}
                rows="3"
                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              ></textarea>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Age (optional)</label>
                <input
                  type="number"
                  value={profileForm.age}
                  onChange={(event) => setProfileForm((previous) => ({ ...previous, age: event.target.value }))}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Company (optional)</label>
                <input
                  value={profileForm.company}
                  onChange={(event) => setProfileForm((previous) => ({ ...previous, company: event.target.value }))}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Photo URL (optional)</label>
                <input
                  value={profileForm.photoUrl}
                  onChange={(event) => setProfileForm((previous) => ({ ...previous, photoUrl: event.target.value }))}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button type="button" variant="secondary" onClick={() => setAuthStep('auth')}>
                Back
              </Button>
              <Button type="submit">Continue</Button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  if (authStep === 'role') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Choose your role</h2>
          <p className="text-slate-500 mb-8">Your role determines which tools and community spaces you see.</p>
          <div className="grid md:grid-cols-2 gap-6">
            <button
              onClick={() => handleRoleSelect('HR')}
              className="group relative p-6 rounded-xl border-2 border-slate-100 hover:border-indigo-600 hover:bg-indigo-50 transition-all text-left"
            >
              <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <Briefcase className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-900">I am an HR Professional</h3>
              <p className="text-sm text-slate-500 mt-2 group-hover:text-indigo-700">
                Access recruitment tools, AI assistance, private HR community, and scheduling.
              </p>
            </button>

            <button
              onClick={() => handleRoleSelect('EMPLOYEE')}
              className="group relative p-6 rounded-xl border-2 border-slate-100 hover:border-emerald-600 hover:bg-emerald-50 transition-all text-left"
            >
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center mb-4 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <User className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-900">I am a Job Seeker / Employee</h3>
              <p className="text-sm text-slate-500 mt-2 group-hover:text-emerald-700">
                Discover jobs, send CVs, track applications, and join the talent community.
              </p>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

function SidebarItem({ icon: Icon, label, id, activeView, setActiveView }) {
  return (
    <button
      onClick={() => setActiveView(id)}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
        activeView === id
          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
          : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
      }`}
    >
      <Icon className="w-5 h-5" />
      <span>{label}</span>
    </button>
  );
}

function Dashboard({ user, jobs, applications, events, posts, settings, setActiveView }) {
  const activeJobsCount = jobs.length;
  const myApplications = applications.filter((application) => application.applicantEmail === user.email);
  const interviewsTodayCount = events.filter((eventItem) => eventItem.type === 'Interview').length;
  const pendingApplications = applications.filter((application) => application.status === 'sent').length;
  const communityHighlights = posts.slice(0, 3);

  if (user.role === 'HR') {
    return (
      <div className="space-y-6">
        <header className="flex flex-wrap justify-between items-end gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Good Morning, {user.name.split(' ')[0]}</h1>
            <p className="text-slate-500 mt-1">Here is your daily briefing prepared by HRoom AI.</p>
          </div>
          <Button onClick={() => setActiveView('jobs')}>
            <Plus className="w-4 h-4" /> Post Job
          </Button>
        </header>

        <Card className="p-6 bg-gradient-to-r from-indigo-50 to-white border-indigo-100">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-indigo-100 text-indigo-600 rounded-lg">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-indigo-900 mb-2">AI Daily Priorities</h3>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-sm text-slate-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                  Review {pendingApplications || 'new'} applicant submissions from your inbox.
                </li>
                {interviewsTodayCount > 0 && (
                  <li className="flex items-center gap-2 text-sm text-slate-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                    You have {interviewsTodayCount} interview{interviewsTodayCount > 1 ? 's' : ''} scheduled today.
                  </li>
                )}
                <li className="flex items-center gap-2 text-sm text-slate-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                  Check new discussions in the HR Community for compliance updates.
                </li>
              </ul>
            </div>
          </div>
        </Card>

        <div className="grid md:grid-cols-3 gap-6">
          <Card className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm font-medium text-slate-500">Total Active Jobs</p>
                <h4 className="text-2xl font-bold text-slate-900">{activeJobsCount}</h4>
              </div>
              <Briefcase className="w-5 h-5 text-indigo-500" />
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5">
              <div
                className="bg-indigo-500 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${Math.min((activeJobsCount / 10) * 100, 100)}%` }}
              ></div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm font-medium text-slate-500">Pending CVs</p>
                <h4 className="text-2xl font-bold text-slate-900">{pendingApplications}</h4>
              </div>
              <Users className="w-5 h-5 text-emerald-500" />
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5">
              <div
                className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${Math.min((pendingApplications / 20) * 100, 100)}%` }}
              ></div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm font-medium text-slate-500">Interviews Today</p>
                <h4 className="text-2xl font-bold text-slate-900">{interviewsTodayCount}</h4>
              </div>
              <Video className="w-5 h-5 text-orange-500" />
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5">
              <div
                className="bg-orange-500 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${Math.min((interviewsTodayCount / 8) * 100, 100)}%` }}
              ></div>
            </div>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900">Community Highlights</h3>
              <Button variant="ghost" className="text-xs" onClick={() => setActiveView('community')}>
                Open Feed
              </Button>
            </div>
            {communityHighlights.length === 0 ? (
              <p className="text-sm text-slate-500">No community posts yet. Start the conversation.</p>
            ) : (
              <div className="space-y-3">
                {communityHighlights.map((post) => (
                  <div key={post.id} className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-xs text-slate-500">{post.author}</p>
                    <p className="text-sm text-slate-800">{post.content}</p>
                  </div>
                ))}
              </div>
            )}
          </Card>
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900">Upcoming Interviews</h3>
              <Button variant="ghost" className="text-xs" onClick={() => setActiveView('calendar')}>
                View Calendar
              </Button>
            </div>
            {events.length === 0 ? (
              <p className="text-sm text-slate-500">No interviews scheduled. Add new interviews to your calendar.</p>
            ) : (
              <div className="space-y-3">
                {events.map((eventItem) => (
                  <div key={eventItem.id} className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-xs text-indigo-600 font-semibold">{eventItem.time}</p>
                    <p className="text-sm text-slate-900">{eventItem.title}</p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {settings.burnoutInsights && (
          <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Heart className="w-5 h-5 text-emerald-600" />
              <div>
                <p className="text-sm font-bold text-emerald-900">Wellness Check</p>
                <p className="text-xs text-emerald-700">
                  {interviewsTodayCount > 3
                    ? 'You have multiple interviews today. Consider blocking focus time.'
                    : 'Your schedule looks balanced today. No burnout risks detected.'}
                </p>
              </div>
            </div>
            <Button variant="ghost" className="text-emerald-700 hover:bg-emerald-100 text-xs py-1">
              View Insights
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">Welcome back, {user.name.split(' ')[0]}</h1>
        <p className="text-slate-500 mt-1">You have {myApplications.length} active applications.</p>
      </header>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-500" /> Application Status
          </h3>
          <div className="space-y-4">
            {myApplications.length > 0 ? (
              myApplications.map((application) => (
                <div key={application.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <p className="font-medium text-slate-900">{application.jobTitle}</p>
                    <p className="text-xs text-slate-500">
                      Applied {formatDate(application.date)} • {application.company}
                    </p>
                  </div>
                  <Badge color={application.status === 'shortlisted' ? 'green' : 'blue'}>
                    {application.status}
                  </Badge>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500 italic">No applications sent yet.</p>
            )}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-500" /> Profile Completeness
          </h3>
          <div className="flex items-center gap-4 mb-4">
            <div className="relative w-16 h-16">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#e2e8f0"
                  strokeWidth="3"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="3"
                  strokeDasharray="80, 100"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-sm font-bold text-emerald-600">
                80%
              </div>
            </div>
            <div>
              <p className="text-sm text-slate-600">Your profile is looking good!</p>
              <button className="text-xs text-indigo-600 font-medium mt-1 hover:underline">
                Add missing skills
              </button>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="font-bold text-slate-900 mb-4">Upcoming Interviews</h3>
        {events.length === 0 ? (
          <p className="text-sm text-slate-500">No interviews scheduled yet.</p>
        ) : (
          <div className="space-y-3">
            {events.map((eventItem) => (
              <div key={eventItem.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-slate-900">{eventItem.title}</p>
                  <p className="text-xs text-slate-500">{eventItem.date} at {eventItem.time}</p>
                </div>
                <Badge color="indigo">{eventItem.type}</Badge>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

function JobBoard({
  user,
  jobs,
  setJobs,
  applications,
  setApplications,
  cvs,
  setCvs,
  savedJobs,
  setSavedJobs
}) {
  const [isPosting, setIsPosting] = useState(false);
  const [applyJob, setApplyJob] = useState(null);
  const [jobForm, setJobForm] = useState({
    title: '',
    company: user.company || '',
    location: '',
    type: JOB_TYPES[0],
    salary: '',
    description: '',
    requirements: '',
    responsibilities: ''
  });
  const [cvForm, setCvForm] = useState({ name: '', tag: '', link: '' });

  const jobApplications = useMemo(() => {
    return applications.reduce((acc, application) => {
      acc[application.jobId] = acc[application.jobId] ? acc[application.jobId] + 1 : 1;
      return acc;
    }, {});
  }, [applications]);

  const handlePostJob = (event) => {
    event.preventDefault();
    const newJob = {
      id: Date.now(),
      title: jobForm.title,
      company: jobForm.company || user.company || 'My Company',
      location: jobForm.location,
      type: jobForm.type,
      salary: jobForm.salary || 'Competitive',
      description: jobForm.description,
      requirements: jobForm.requirements,
      responsibilities: jobForm.responsibilities,
      createdAt: new Date().toISOString(),
      hrEmail: user.email,
      hrName: user.name
    };
    setJobs([newJob, ...jobs]);
    setJobForm({
      title: '',
      company: user.company || '',
      location: '',
      type: JOB_TYPES[0],
      salary: '',
      description: '',
      requirements: '',
      responsibilities: ''
    });
    setIsPosting(false);
  };

  const handleApply = (jobId, cvId) => {
    if (applications.find((application) => application.jobId === jobId && application.applicantEmail === user.email)) {
      return;
    }

    const job = jobs.find((jobItem) => jobItem.id === jobId);

    setApplications([
      {
        id: Date.now(),
        jobId,
        jobTitle: job?.title || 'Job',
        company: job?.company || 'Company',
        applicantName: user.name,
        applicantEmail: user.email,
        cvId,
        status: 'sent',
        date: new Date().toISOString()
      },
      ...applications
    ]);
    setApplyJob(null);
  };

  const handleCreateCv = (event) => {
    event.preventDefault();
    const newCv = {
      id: Date.now(),
      name: cvForm.name,
      tag: cvForm.tag || 'General',
      link: cvForm.link,
      updatedAt: new Date().toISOString()
    };
    setCvs([newCv, ...cvs]);
    setCvForm({ name: '', tag: '', link: '' });
  };

  const toggleSavedJob = (jobId) => {
    if (savedJobs.includes(jobId)) {
      setSavedJobs(savedJobs.filter((id) => id !== jobId));
    } else {
      setSavedJobs([...savedJobs, jobId]);
    }
  };

  const generateAiDescription = () => {
    if (!jobForm.title.trim()) return;
    const description = `We are seeking a ${jobForm.title} to join ${jobForm.company || 'our team'} and support key HR goals.`;
    const responsibilities = `Drive impact by owning ${jobForm.title} initiatives, collaborating with stakeholders, and delivering measurable outcomes.`;
    const requirements = `Strong communication skills, experience relevant to ${jobForm.title}, and a proactive mindset.`;
    setJobForm((previous) => ({
      ...previous,
      description,
      responsibilities,
      requirements
    }));
  };

  const hrApplications = applications.filter((application) => {
    const job = jobs.find((jobItem) => jobItem.id === application.jobId);
    return job?.hrEmail === user.email;
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-3">
        <h2 className="text-2xl font-bold text-slate-900">
          {user.role === 'HR' ? 'Recruitment Board' : 'Find Your Next Role'}
        </h2>
        {user.role === 'HR' && (
          <Button onClick={() => setIsPosting(true)}>
            <Plus className="w-4 h-4" /> Create Job Post
          </Button>
        )}
      </div>

      {user.role === 'HR' && (
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900">CV Inbox</h3>
              <p className="text-xs text-slate-500">Manage incoming CVs and update statuses.</p>
            </div>
            <Badge color="indigo">{hrApplications.length} submissions</Badge>
          </div>
          {hrApplications.length === 0 ? (
            <p className="text-sm text-slate-500">No CVs received yet.</p>
          ) : (
            <div className="space-y-3">
              {hrApplications.map((application) => (
                <div key={application.id} className="p-3 bg-slate-50 rounded-lg flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-slate-900">{application.applicantName}</p>
                    <p className="text-xs text-slate-500">{application.jobTitle} • {application.company}</p>
                    <p className="text-xs text-slate-400">CV ID: {application.cvId}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={application.status}
                      onChange={(event) =>
                        setApplications((previous) =>
                          previous.map((item) =>
                            item.id === application.id ? { ...item, status: event.target.value } : item
                          )
                        )
                      }
                      className="border border-slate-200 rounded-lg p-2 text-sm"
                    >
                      {APPLICATION_STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                    <a
                      href={`mailto:${user.email}?subject=CV%20Submission%20from%20${application.applicantName}`}
                      className="text-xs text-indigo-600 hover:underline"
                    >
                      Forward to email
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {isPosting && (
        <Card className="p-6 mb-6 border-indigo-200 shadow-md">
          <div className="flex justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-800">New Job Post</h3>
            <button onClick={() => setIsPosting(false)}>
              <AlertCircle className="w-5 h-5 text-slate-400" />
            </button>
          </div>
          <form onSubmit={handlePostJob} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Job Title</label>
                <input
                  name="title"
                  required
                  value={jobForm.title}
                  onChange={(event) => setJobForm((previous) => ({ ...previous, title: event.target.value }))}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="e.g. UX Designer"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
                <input
                  name="location"
                  required
                  value={jobForm.location}
                  onChange={(event) => setJobForm((previous) => ({ ...previous, location: event.target.value }))}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="e.g. Remote"
                />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Company Name</label>
                <input
                  name="company"
                  value={jobForm.company}
                  onChange={(event) => setJobForm((previous) => ({ ...previous, company: event.target.value }))}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="e.g. Acme Corp"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Job Type</label>
                <select
                  value={jobForm.type}
                  onChange={(event) => setJobForm((previous) => ({ ...previous, type: event.target.value }))}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  {JOB_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Salary Range</label>
              <input
                value={jobForm.salary}
                onChange={(event) => setJobForm((previous) => ({ ...previous, salary: event.target.value }))}
                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="e.g. $80k - $100k"
              />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Description <span className="text-indigo-500 text-xs ml-2">(AI Assist)</span>
                </label>
                <Button type="button" variant="ghost" className="text-xs" onClick={generateAiDescription}>
                  Generate with AI
                </Button>
              </div>
              <textarea
                name="description"
                required
                rows="3"
                value={jobForm.description}
                onChange={(event) => setJobForm((previous) => ({ ...previous, description: event.target.value }))}
                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="Enter key responsibilities..."
              ></textarea>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Responsibilities</label>
                <textarea
                  rows="3"
                  value={jobForm.responsibilities}
                  onChange={(event) => setJobForm((previous) => ({ ...previous, responsibilities: event.target.value }))}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Requirements</label>
                <textarea
                  rows="3"
                  value={jobForm.requirements}
                  onChange={(event) => setJobForm((previous) => ({ ...previous, requirements: event.target.value }))}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                ></textarea>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button type="button" variant="secondary" onClick={() => setIsPosting(false)}>
                Cancel
              </Button>
              <Button type="submit">Publish Post</Button>
            </div>
          </form>
        </Card>
      )}

      {user.role === 'EMPLOYEE' && (
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900">My CV Library</h3>
              <p className="text-xs text-slate-500">Upload and tag multiple CV versions.</p>
            </div>
            <Badge color="indigo">{cvs.length} versions</Badge>
          </div>
          <form onSubmit={handleCreateCv} className="grid md:grid-cols-4 gap-3">
            <input
              value={cvForm.name}
              onChange={(event) => setCvForm((previous) => ({ ...previous, name: event.target.value }))}
              placeholder="CV name"
              required
              className="p-2 border border-slate-200 rounded-lg text-sm"
            />
            <input
              value={cvForm.tag}
              onChange={(event) => setCvForm((previous) => ({ ...previous, tag: event.target.value }))}
              placeholder="Tag (e.g. Tech)"
              className="p-2 border border-slate-200 rounded-lg text-sm"
            />
            <input
              value={cvForm.link}
              onChange={(event) => setCvForm((previous) => ({ ...previous, link: event.target.value }))}
              placeholder="Link (optional)"
              className="p-2 border border-slate-200 rounded-lg text-sm"
            />
            <Button type="submit" className="text-sm">
              Add CV
            </Button>
          </form>
          {cvs.length > 0 && (
            <div className="mt-4 space-y-2">
              {cvs.map((cv) => (
                <div key={cv.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{cv.name}</p>
                    <p className="text-xs text-slate-500">
                      {cv.tag} • Updated {formatDate(cv.updatedAt)}
                    </p>
                  </div>
                  {cv.link ? (
                    <a href={cv.link} className="text-xs text-indigo-600 hover:underline" target="_blank" rel="noreferrer">
                      View
                    </a>
                  ) : (
                    <span className="text-xs text-slate-400">No link</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {applyJob && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-lg font-bold mb-4">Apply to {applyJob.title}</h3>
            <p className="text-sm text-slate-500 mb-4">Select which CV version you would like to send.</p>

            {cvs.length === 0 ? (
              <p className="text-sm text-slate-500">Please add a CV version before applying.</p>
            ) : (
              <div className="space-y-3 mb-6">
                {cvs.map((cv) => (
                  <label key={cv.id} className="flex items-center p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">
                    <FileText className="w-5 h-5 text-slate-400 mr-3" />
                    <div className="flex-1">
                      <p className="font-medium text-sm text-slate-800">{cv.name}</p>
                      <p className="text-xs text-slate-400">{cv.tag}</p>
                    </div>
                    <input type="radio" name="cv_select" value={cv.id} defaultChecked={cv.id === cvs[0]?.id} />
                  </label>
                ))}
              </div>
            )}

            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setApplyJob(null)}>
                Cancel
              </Button>
              <Button
                onClick={() => handleApply(applyJob.id, cvs[0]?.id)}
                disabled={cvs.length === 0}
              >
                Send Application
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-4">
        {jobs.length === 0 ? (
          <Card className="p-6">
            <p className="text-sm text-slate-500">
              {user.role === 'HR'
                ? 'Create your first job posting to start receiving CVs.'
                : 'No job posts yet. Check back soon.'}
            </p>
          </Card>
        ) : (
          jobs.map((job) => (
            <Card key={job.id} className="p-5 hover:shadow-md transition-shadow">
              <div className="flex flex-wrap justify-between items-start gap-4">
                <div>
                  <h3 className="font-bold text-lg text-slate-900">{job.title}</h3>
                  <p className="text-slate-500 text-sm">{job.company} • {job.location}</p>
                  <div className="flex gap-2 mt-3">
                    <Badge color="slate">{job.type}</Badge>
                    <Badge color="green">{job.salary}</Badge>
                  </div>
                  <p className="text-sm text-slate-600 mt-3">{job.description}</p>
                  <div className="mt-3 text-xs text-slate-500">
                    Posted by {job.hrName} • {formatDate(job.createdAt)}
                  </div>
                </div>
                {user.role === 'HR' ? (
                  <div className="text-right">
                    <span className="text-2xl font-bold text-indigo-600">{jobApplications[job.id] || 0}</span>
                    <p className="text-xs text-slate-500">Applicants</p>
                  </div>
                ) : (
                  <div className="text-right space-y-2">
                    {applications.find(
                      (application) => application.jobId === job.id && application.applicantEmail === user.email
                    ) ? (
                      <Badge color="indigo">Applied</Badge>
                    ) : (
                      <Button onClick={() => setApplyJob(job)} className="text-sm">
                        Apply Now
                      </Button>
                    )}
                    <button
                      onClick={() => toggleSavedJob(job.id)}
                      className="text-xs text-slate-500 hover:text-indigo-600"
                    >
                      {savedJobs.includes(job.id) ? 'Saved' : 'Save Job'}
                    </button>
                  </div>
                )}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

function Community({ user, posts, setPosts }) {
  const [newPostContent, setNewPostContent] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);

  const handlePost = (event) => {
    event.preventDefault();
    if (!newPostContent.trim()) return;
    const post = {
      id: Date.now(),
      author: isAnonymous ? 'Anonymous HR' : user.name,
      role: user.role,
      content: newPostContent,
      likes: 0,
      comments: 0,
      tags: ['General'],
      audience: user.role === 'HR' ? 'hr' : 'employee',
      createdAt: new Date().toISOString()
    };
    setPosts([post, ...posts]);
    setNewPostContent('');
    setIsAnonymous(false);
  };

  const filteredPosts = posts.filter((post) => post.audience === (user.role === 'HR' ? 'hr' : 'employee'));

  return (
    <div className="max-w-2xl mx-auto">
      <header className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          {user.role === 'HR' ? 'HR Community Hub' : 'Talent Community'}
          {user.role === 'HR' && <Shield className="w-5 h-5 text-indigo-600" />}
        </h2>
        <p className="text-slate-500">
          {user.role === 'HR'
            ? 'A private space for HR professionals to share knowledge and discuss policy.'
            : 'Connect with other professionals, share advice, and grow your career.'}
        </p>
      </header>

      <Card className="p-4 mb-6">
        <form onSubmit={handlePost}>
          <textarea
            value={newPostContent}
            onChange={(event) => setNewPostContent(event.target.value)}
            className="w-full p-3 bg-slate-50 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none text-sm"
            rows="3"
            placeholder={user.role === 'HR' ? 'Share compliance updates or ask peers...' : 'Ask for interview tips or share experience...'}
          ></textarea>
          <div className="flex justify-between items-center mt-3">
            <div className="flex gap-2 items-center">
              {user.role === 'HR' && (
                <label className="text-xs flex items-center gap-1 text-indigo-600 bg-indigo-50 px-2 py-1 rounded cursor-pointer">
                  <input type="checkbox" checked={isAnonymous} onChange={(event) => setIsAnonymous(event.target.checked)} />
                  Anonymous post
                </label>
              )}
            </div>
            <Button type="submit" className="py-1 px-4 text-sm">
              Post
            </Button>
          </div>
        </form>
      </Card>

      <div className="space-y-4">
        {filteredPosts.length === 0 ? (
          <Card className="p-5">
            <p className="text-sm text-slate-500">No posts yet. Start a discussion.</p>
          </Card>
        ) : (
          filteredPosts.map((post) => (
            <Card key={post.id} className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                      post.role === 'HR' ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'
                    }`}
                  >
                    {post.author.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 flex items-center gap-1">
                      {post.author}
                      {post.role === 'HR' && <Shield className="w-3 h-3 text-indigo-500" />}
                    </p>
                    <p className="text-xs text-slate-500">{formatDate(post.createdAt)}</p>
                  </div>
                </div>
                <Badge color="indigo">Private</Badge>
              </div>

              <p className="text-slate-800 text-sm mb-4 leading-relaxed">{post.content}</p>

              <div className="flex items-center gap-4 border-t border-slate-100 pt-3">
                <button className="flex items-center gap-1 text-slate-500 hover:text-red-500 text-xs transition-colors">
                  <Heart className="w-4 h-4" /> {post.likes}
                </button>
                <button className="flex items-center gap-1 text-slate-500 hover:text-indigo-500 text-xs transition-colors">
                  <MessageSquare className="w-4 h-4" /> {post.comments}
                </button>
                <button className="flex items-center gap-1 text-slate-500 hover:text-slate-800 text-xs transition-colors ml-auto">
                  <Send className="w-4 h-4" /> Share
                </button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

function AIAssistant({ user, jobs, applications, events, settings }) {
  const [messages, setMessages] = useState([
    { role: 'system', content: 'Hello! I am your HR AI Assistant. How can I help you organize your day?' }
  ]);
  const [input, setInput] = useState('');
  const endRef = useRef(null);

  const scrollToBottom = () => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const generateResponse = (text) => {
    const lower = text.toLowerCase();
    if (lower.includes('interview')) {
      if (events.length === 0) {
        return 'You have no interviews scheduled. Would you like me to draft an interview slot?';
      }
      return `You have ${events.length} interview(s). The next one is ${events[0].title} at ${events[0].time}.`;
    }
    if (lower.includes('candidate') || lower.includes('cv')) {
      if (applications.length === 0) {
        return 'No CVs in your inbox yet. Share your job postings to attract more candidates.';
      }
      const topCandidate = applications[0];
      return `Top recent candidate: ${topCandidate.applicantName} for ${topCandidate.jobTitle}. Status: ${topCandidate.status}.`;
    }
    if (lower.includes('job')) {
      return `You have ${jobs.length} active job post(s). Would you like to review applicants or draft a new post?`;
    }
    if (settings.burnoutInsights && (lower.includes('burnout') || lower.includes('tired'))) {
      return events.length > 3
        ? 'You have a packed schedule. Consider blocking 30 minutes between interviews.'
        : 'Your schedule looks manageable. Keep a short focus block for deep work.';
    }
    return 'I can help summarize candidates, review upcoming interviews, and track your recruitment pipeline.';
  };

  const handleSend = (event) => {
    event.preventDefault();
    if (!input.trim()) return;

    const userMsg = { role: 'user', content: input };
    const responseText = generateResponse(input);

    setMessages((previous) => [...previous, userMsg, { role: 'system', content: responseText }]);
    setInput('');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-4 border-b border-slate-100 bg-indigo-50 flex items-center gap-3">
        <div className="bg-indigo-600 p-2 rounded-lg text-white">
          <BrainCircuit className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-bold text-slate-900">HRoom Assistant</h3>
          <p className="text-xs text-indigo-700">Context-aware HR support</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[80%] rounded-2xl p-4 text-sm ${
                msg.role === 'user'
                  ? 'bg-indigo-600 text-white rounded-br-none'
                  : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none shadow-sm'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      <form onSubmit={handleSend} className="p-4 bg-white border-t border-slate-100 flex gap-2">
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Ask about candidates, schedule, or policies..."
          className="flex-1 p-3 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
        />
        <Button type="submit" className="rounded-xl px-4">
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
}

function CalendarView({ user, events, setEvents }) {
  const [eventForm, setEventForm] = useState({ title: '', date: '', time: '', type: EVENT_TYPES[0] });

  const handleAddEvent = (event) => {
    event.preventDefault();
    const newEvent = {
      id: Date.now(),
      ...eventForm,
      ownerEmail: user.email
    };
    setEvents([newEvent, ...events]);
    setEventForm({ title: '', date: '', time: '', type: EVENT_TYPES[0] });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex flex-wrap justify-between items-center mb-6 gap-3">
        <h2 className="text-2xl font-bold text-slate-900">Smart Calendar</h2>
        <Button variant="secondary" className="text-sm">
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-4 h-4 mr-2" alt="Google" />
          Sync Google Calendar
        </Button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <Card className="p-6">
            <h3 className="font-bold text-slate-900 mb-4">Add New Event</h3>
            <form onSubmit={handleAddEvent} className="grid md:grid-cols-2 gap-4">
              <input
                required
                value={eventForm.title}
                onChange={(event) => setEventForm((previous) => ({ ...previous, title: event.target.value }))}
                placeholder="Event title"
                className="p-2 border border-slate-200 rounded-lg"
              />
              <select
                value={eventForm.type}
                onChange={(event) => setEventForm((previous) => ({ ...previous, type: event.target.value }))}
                className="p-2 border border-slate-200 rounded-lg"
              >
                {EVENT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              <input
                required
                type="date"
                value={eventForm.date}
                onChange={(event) => setEventForm((previous) => ({ ...previous, date: event.target.value }))}
                className="p-2 border border-slate-200 rounded-lg"
              />
              <input
                required
                type="time"
                value={eventForm.time}
                onChange={(event) => setEventForm((previous) => ({ ...previous, time: event.target.value }))}
                className="p-2 border border-slate-200 rounded-lg"
              />
              <Button type="submit" className="md:col-span-2">
                Add Event
              </Button>
            </form>
          </Card>

          <Card className="p-6">
            <div className="grid grid-cols-7 gap-2 text-center text-sm mb-4 text-slate-500 font-medium">
              <div>Sun</div>
              <div>Mon</div>
              <div>Tue</div>
              <div>Wed</div>
              <div>Thu</div>
              <div>Fri</div>
              <div>Sat</div>
            </div>
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: 30 }).map((_, index) => (
                <div
                  key={index}
                  className={`aspect-square rounded-lg flex items-center justify-center text-sm ${
                    index === 12
                      ? 'bg-indigo-600 text-white font-bold shadow-md'
                      : 'hover:bg-slate-50 cursor-pointer text-slate-700'
                  }`}
                >
                  {index + 1}
                </div>
              ))}
            </div>
          </Card>

          <div className="flex gap-4">
            <Card className="flex-1 p-4 flex items-center justify-between hover:bg-slate-50 cursor-pointer border-indigo-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center">
                  <Video className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-slate-900 text-sm">Instant Meeting</p>
                  <p className="text-xs text-slate-500">Create Google Meet</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </Card>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-bold text-slate-900">Today's Agenda</h3>
          {events.length === 0 ? (
            <Card className="p-4">
              <p className="text-sm text-slate-500">No events scheduled today.</p>
            </Card>
          ) : (
            events.map((eventItem) => (
              <Card key={eventItem.id} className="p-4 border-l-4 border-l-indigo-500">
                <div className="flex justify-between mb-1">
                  <span className="text-xs font-bold text-indigo-600">{eventItem.time}</span>
                  <Badge color="slate">{eventItem.type}</Badge>
                </div>
                <p className="font-medium text-slate-900">{eventItem.title}</p>
              </Card>
            ))
          )}

          <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 mt-4">
            <p className="text-sm font-bold text-orange-800 mb-1">AI Suggestion</p>
            <p className="text-xs text-orange-700 leading-relaxed">
              You have time blocks available this week. Consider scheduling candidate follow-ups in open slots.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function SettingsPage({ user, setUser, settings, setSettings, cvs, setCvs }) {
  const [profileForm, setProfileForm] = useState({
    name: user.name,
    bio: user.bio,
    company: user.company,
    photoUrl: user.photoUrl
  });

  const handleProfileSave = (event) => {
    event.preventDefault();
    setUser((previous) => ({ ...previous, ...profileForm }));
  };

  const handleCvDelete = (cvId) => {
    setCvs(cvs.filter((cv) => cv.id !== cvId));
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold text-slate-900">Settings & Preferences</h2>

      <Card className="p-0 overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center gap-4">
          {user.photoUrl ? (
            <img src={user.photoUrl} alt={user.name} className="w-16 h-16 rounded-full object-cover" />
          ) : (
            <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center text-2xl font-bold text-slate-500">
              {getInitials(user.name)}
            </div>
          )}
          <div>
            <h3 className="font-bold text-slate-900">{user.name}</h3>
            <p className="text-sm text-slate-500">{user.email}</p>
            <Badge color="indigo">{user.role}</Badge>
          </div>
        </div>
        <div className="p-6 space-y-6">
          <form onSubmit={handleProfileSave} className="space-y-4">
            <h4 className="font-bold text-slate-900">Edit Profile</h4>
            <div className="grid md:grid-cols-2 gap-4">
              <input
                value={profileForm.name}
                onChange={(event) => setProfileForm((previous) => ({ ...previous, name: event.target.value }))}
                className="p-2 border border-slate-200 rounded-lg"
                placeholder="Name"
              />
              <input
                value={profileForm.company}
                onChange={(event) => setProfileForm((previous) => ({ ...previous, company: event.target.value }))}
                className="p-2 border border-slate-200 rounded-lg"
                placeholder="Company"
              />
              <input
                value={profileForm.photoUrl}
                onChange={(event) => setProfileForm((previous) => ({ ...previous, photoUrl: event.target.value }))}
                className="p-2 border border-slate-200 rounded-lg md:col-span-2"
                placeholder="Photo URL"
              />
              <textarea
                value={profileForm.bio}
                onChange={(event) => setProfileForm((previous) => ({ ...previous, bio: event.target.value }))}
                className="p-2 border border-slate-200 rounded-lg md:col-span-2"
                rows="3"
                placeholder="Bio"
              ></textarea>
            </div>
            <Button type="submit" className="text-sm">
              Save Profile
            </Button>
          </form>

          <section>
            <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4" /> Privacy & Safety
            </h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-700">Private Profile</span>
                <Toggle
                  checked={settings.privateProfile}
                  onChange={(value) => setSettings((previous) => ({ ...previous, privateProfile: value }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-700">Allow Direct Messages</span>
                <select
                  value={settings.allowMessages}
                  onChange={(event) =>
                    setSettings((previous) => ({ ...previous, allowMessages: event.target.value }))
                  }
                  className="border border-slate-200 rounded-lg p-2 text-sm"
                >
                  <option value="everyone">Everyone</option>
                  <option value="connections">Connections only</option>
                  <option value="none">No one</option>
                </select>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-700">Comment Controls</span>
                <select
                  value={settings.commentControl}
                  onChange={(event) =>
                    setSettings((previous) => ({ ...previous, commentControl: event.target.value }))
                  }
                  className="border border-slate-200 rounded-lg p-2 text-sm"
                >
                  <option value="everyone">Everyone</option>
                  <option value="connections">Connections only</option>
                  <option value="none">Disable comments</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Keyword filtering</label>
                <input
                  value={settings.keywordFilter}
                  onChange={(event) => setSettings((previous) => ({ ...previous, keywordFilter: event.target.value }))}
                  className="w-full p-2 border border-slate-200 rounded-lg text-sm"
                  placeholder="Add keywords to mute"
                />
              </div>
            </div>
          </section>

          <section className="pt-4 border-t border-slate-100">
            <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Bell className="w-4 h-4" /> Notifications
            </h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-700">Job Application Updates</span>
                <Toggle
                  checked={settings.notifications.jobUpdates}
                  onChange={(value) =>
                    setSettings((previous) => ({
                      ...previous,
                      notifications: { ...previous.notifications, jobUpdates: value }
                    }))
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-700">Community Mentions</span>
                <Toggle
                  checked={settings.notifications.communityMentions}
                  onChange={(value) =>
                    setSettings((previous) => ({
                      ...previous,
                      notifications: { ...previous.notifications, communityMentions: value }
                    }))
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-700">Reminders & follow-ups</span>
                <Toggle
                  checked={settings.notifications.reminders}
                  onChange={(value) =>
                    setSettings((previous) => ({
                      ...previous,
                      notifications: { ...previous.notifications, reminders: value }
                    }))
                  }
                />
              </div>
            </div>
          </section>

          <section className="pt-4 border-t border-slate-100">
            <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" /> Screen Time & Wellbeing
            </h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-700">Burnout insights</span>
                <Toggle
                  checked={settings.burnoutInsights}
                  onChange={(value) => setSettings((previous) => ({ ...previous, burnoutInsights: value }))}
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Daily usage limit (minutes)</label>
                <input
                  type="number"
                  value={settings.screenTimeLimit}
                  onChange={(event) =>
                    setSettings((previous) => ({ ...previous, screenTimeLimit: Number(event.target.value) }))
                  }
                  className="w-full p-2 border border-slate-200 rounded-lg text-sm"
                />
              </div>
            </div>
          </section>

          {user.role === 'HR' && (
            <section className="pt-4 border-t border-slate-100">
              <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Users className="w-4 h-4" /> Team Collaboration
              </h4>
              <p className="text-sm text-slate-500 mb-3">Invite teammates to join your company workspace.</p>
              <div className="flex flex-wrap gap-3">
                <a
                  href={`mailto:?subject=Join%20our%20HRoom%20workspace&body=Hi%20there,%20join%20our%20company%20workspace%20on%20HRoom.`}
                  className="px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 hover:bg-slate-50"
                >
                  Invite via Gmail
                </a>
                <a
                  href={`mailto:?subject=Join%20our%20HRoom%20workspace&body=Hi%20there,%20join%20our%20company%20workspace%20on%20HRoom.`}
                  className="px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 hover:bg-slate-50"
                >
                  Invite via Outlook
                </a>
              </div>
            </section>
          )}

          {user.role === 'EMPLOYEE' && (
            <section className="pt-4 border-t border-slate-100">
              <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <FileText className="w-4 h-4" /> CV Versions
              </h4>
              {cvs.length === 0 ? (
                <p className="text-sm text-slate-500">No CV versions yet. Add one from the jobs page.</p>
              ) : (
                <div className="space-y-3">
                  {cvs.map((cv) => (
                    <div key={cv.id} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-slate-900">{cv.name}</p>
                        <p className="text-xs text-slate-500">{cv.tag}</p>
                      </div>
                      <button onClick={() => handleCvDelete(cv.id)} className="text-xs text-red-500">
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          <section className="pt-4 border-t border-slate-100">
            <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" /> Support
            </h4>
            <div className="flex flex-wrap gap-3">
              <a
                href="mailto:asserfarra11@gmail.com"
                className="flex items-center gap-2 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <Mail className="w-4 h-4 text-slate-400" /> Report a problem via email
              </a>
              <a
                href="https://mail.google.com/mail/?view=cm&fs=1&to=asserfarra11@gmail.com"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Open in Gmail
              </a>
              <a
                href="https://outlook.live.com/mail/0/deeplink/compose?to=asserfarra11@gmail.com"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Open in Outlook
              </a>
            </div>
          </section>

          <div className="pt-4">
            <Button variant="danger" className="w-full">
              Delete Account
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
