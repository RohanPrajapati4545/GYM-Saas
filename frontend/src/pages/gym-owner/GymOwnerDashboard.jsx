import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { clearAuth } from '../../store/slices/authSlice';
import DynamicLogo from '../../components/DynamicLogo';
import gymOwnerApi from '../../services/gymOwnerApi';
import Swal from 'sweetalert2';
import {
  LayoutDashboard,
  GitBranch,
  Users,
  UserCheck,
  CalendarCheck2,
  Settings,
  LogOut,
  Bell,
  Search,
  Plus,
  PlusCircle,
  Edit2,
  Trash2,
  QrCode,
  CheckCircle2,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Activity,
  Award,
  Clock,
  ChevronRight,
  Shield,
  Building2,
  Flame,
  MapPin,
  Phone,
  Mail,
  Lock,
  UserPlus,
  RefreshCw,
  Loader2,
  DollarSign,
  Menu,
  X,
  Radio,
  Check,
  ArrowRight,
  Zap,
  Sparkles,
  CreditCard,
} from 'lucide-react';

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const userRole = user?.role || 'GYM_OWNER';

  const [activeTab, setActiveTab] = useState('Overview');
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Data States
  const [dashboardData, setDashboardData] = useState(null);
  const [branches, setBranches] = useState([]);
  const [managers, setManagers] = useState([]);
  const [members, setMembers] = useState([]);
  const [attendanceLogs, setAttendanceLogs] = useState([]);
  const [gymProfile, setGymProfile] = useState(null);

  // Filters
  const [memberSearch, setMemberSearch] = useState('');
  const [memberBranchFilter, setMemberBranchFilter] = useState('');
  const [attendanceBranchFilter, setAttendanceBranchFilter] = useState('');

  // Modals
  const [showBranchModal, setShowBranchModal] = useState(false);
  const [editingBranch, setEditingBranch] = useState(null);
  const [branchForm, setBranchForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: 'Mumbai',
    state: 'Maharashtra',
    openingTime: '06:00 AM',
    closingTime: '10:00 PM',
    capacity: 300,
    managerId: '',
  });

  const [showManagerModal, setShowManagerModal] = useState(false);
  const [editingManager, setEditingManager] = useState(null);
  const [managerForm, setManagerForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    branchId: '',
  });

  const [showMemberModal, setShowMemberModal] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [memberForm, setMemberForm] = useState({
    name: '',
    email: '',
    phone: '',
    gender: 'MALE',
    branchId: '',
    planType: 'MONTHLY',
    amountPaid: 50,
    rfidTag: '',
    emergencyContact: '',
    durationDays: 30,
  });

  const [gymForm, setGymForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    country: 'India',
  });

  // Membership Plans Data & Modal State
  const defaultGymPlans = [
    {
      id: 'plan_monthly',
      name: 'Monthly Standard Fitness',
      type: 'MONTHLY',
      price: 49,
      durationDays: 30,
      tagline: 'Standard Access',
      description: 'Full equipment floor access, locker access & general cardio training.',
      features: ['Single Branch Access', 'Standard Gym Floor Access', 'Locker Room & Shower', 'Member App Check-In QR'],
      isActive: true,
      isPopular: false,
    },
    {
      id: 'plan_quarterly',
      name: 'Quarterly Strength & HIIT',
      type: 'QUARTERLY',
      price: 129,
      durationDays: 90,
      tagline: 'Most Popular',
      description: 'Strength training + cardio + group workout sessions + 1 trainer assessment.',
      features: ['All Branch Roaming Access', 'Free Fitness & BMI Assessment', 'Locker & Sauna Access', 'Automated WhatsApp Invoicing'],
      isActive: true,
      isPopular: true,
    },
    {
      id: 'plan_annual',
      name: 'Annual VIP All-Access',
      type: 'ANNUAL',
      price: 399,
      durationDays: 365,
      tagline: 'Best Value (Save 35%)',
      description: 'VIP 365-day access with turnstile RFID tag, 4 personal trainer sessions & diet plan.',
      features: ['Unlimited Roaming All Branches', 'RFID Smart Gate Tag Included', '4 Complimentary PT Sessions', 'Custom Diet & Macro Nutrition Plan', 'Priority Guest Passes (2/mo)'],
      isActive: true,
      isPopular: false,
    },
    {
      id: 'plan_pt',
      name: 'Personal Training Elite',
      type: 'VIP_PASS',
      price: 249,
      durationDays: 30,
      tagline: 'Dedicated Coach',
      description: '1-on-1 personal coaching with customized workout programming and daily check-ins.',
      features: ['12 Dedicated 1-on-1 PT Sessions', 'Body Composition Telemetry Tracking', 'Custom Nutrition Chart', 'Gate Turnstile Fast-Pass'],
      isActive: true,
      isPopular: false,
    },
    {
      id: 'plan_trial',
      name: 'Single Day Fitness Pass',
      type: 'TRIAL',
      price: 10,
      durationDays: 1,
      tagline: 'Day Pass',
      description: 'Single day drop-in workout pass with instant RFID turnstile gate access.',
      features: ['1 Day Full Facility Access', 'Instant Gate Turnstile QR', 'Locker Access'],
      isActive: true,
      isPopular: false,
    },
  ];

  const [gymPlans, setGymPlans] = useState(() => {
    try {
      const saved = localStorage.getItem(`gym_membership_plans_${user?.id || 'owner'}`);
      return saved ? JSON.parse(saved) : defaultGymPlans;
    } catch (e) {
      return defaultGymPlans;
    }
  });

  const [showPlanModal, setShowPlanModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [planForm, setPlanForm] = useState({
    name: '',
    type: 'MONTHLY',
    price: 49,
    durationDays: 30,
    tagline: '',
    description: '',
    features: '',
    isPopular: false,
    isActive: true,
  });

  // Save gym plans to localStorage whenever modified
  const saveGymPlans = (updatedPlans) => {
    setGymPlans(updatedPlans);
    try {
      localStorage.setItem(`gym_membership_plans_${user?.id || 'owner'}`, JSON.stringify(updatedPlans));
      localStorage.setItem('gym_membership_plans_global', JSON.stringify(updatedPlans));
      localStorage.setItem('gym_custom_plans', JSON.stringify(updatedPlans));
      window.dispatchEvent(new Event('gymPlansUpdated'));
    } catch (e) {
      console.error('Failed to save plans:', e);
    }
  };

  // Quick Facility Specs Alert State (2-3 extra optional fields)
  const [showQuickSpecsModal, setShowQuickSpecsModal] = useState(false);
  const [dismissGymAlert, setDismissGymAlert] = useState(false);
  const [quickSpecsForm, setQuickSpecsForm] = useState({
    facilityType: 'Commercial Gym & Fitness Club',
    operatingHours: '06:00 AM - 10:00 PM',
    supportContact: '',
  });
  const [savingSpecs, setSavingSpecs] = useState(false);

  const handleLogout = () => {
    Swal.fire({
      title: 'Sign Out?',
      text: 'Are you sure you want to end your gym owner session?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#ff2a2a',
      cancelButtonColor: '#1e2433',
      confirmButtonText: 'Yes, Sign Out',
      cancelButtonText: 'Cancel',
      background: '#10141d',
      color: '#ffffff',
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem('token');
        localStorage.removeItem('isFirstTimeRegistration');
        localStorage.removeItem('gymSelectedPlan');
        dispatch(clearAuth());
        Swal.fire({
          title: 'Signed Out',
          text: 'You have been signed out successfully.',
          icon: 'success',
          timer: 1000,
          showConfirmButton: false,
          background: '#10141d',
          color: '#ffffff',
        });
        navigate('/', { replace: true });
      }
    });
  };

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    const mainEl = document.querySelector('.dashboard-main');
    if (mainEl) mainEl.scrollTop = 0;
  }, [activeTab]);

  // Fetch all Gym Owner Data
  const loadData = async () => {
    try {
      setLoading(true);
      const [dashRes, branchRes, mgrRes, memRes, attRes, gymRes] = await Promise.allSettled([
        gymOwnerApi.get('/api/owner/dashboard/stats'),
        gymOwnerApi.get('/api/owner/branches'),
        gymOwnerApi.get('/api/owner/branch-managers'),
        gymOwnerApi.get('/api/owner/members'),
        gymOwnerApi.get('/api/owner/attendance'),
        gymOwnerApi.get('/api/owner/gym/profile'),
      ]);

      if (dashRes.status === 'fulfilled' && dashRes.value.data?.success) {
        setDashboardData(dashRes.value.data.data);
      }
      if (branchRes.status === 'fulfilled' && branchRes.value.data?.success) {
        setBranches(branchRes.value.data.data);
      }
      if (mgrRes.status === 'fulfilled' && mgrRes.value.data?.success) {
        setManagers(mgrRes.value.data.data);
      }
      if (memRes.status === 'fulfilled' && memRes.value.data?.success) {
        setMembers(memRes.value.data.data);
      }
      if (attRes.status === 'fulfilled' && attRes.value.data?.success) {
        setAttendanceLogs(attRes.value.data.data);
      }
      if (gymRes.status === 'fulfilled' && gymRes.value.data?.success) {
        const gymData = gymRes.value.data.data;
        setGymProfile(gymData);
        setGymForm({
          name: gymData.name || '',
          email: gymData.email || '',
          phone: gymData.phone || '',
          logo: gymData.logo || '',
          address: gymData.address || '',
          city: gymData.city || '',
          state: gymData.state || '',
          pincode: gymData.pincode || '',
          country: gymData.country || 'India',
          ownerName: gymData.ownerName || '',
          ownerPhone: gymData.ownerPhone || '',
          ownerEmail: gymData.ownerEmail || '',
        });

        localStorage.removeItem('isFirstTimeRegistration');
        setQuickSpecsForm({
          facilityType: gymData.facilityType || 'Commercial Gym & Fitness Club',
          operatingHours: gymData.operatingHours || '06:00 AM - 10:00 PM',
          supportContact: gymData.phone || '',
        });
      }
    } catch (error) {
      console.error('Failed to load owner portal data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // --- QUICK SPECS HANDLER (2-3 FIELDS) ---
  const handleSaveQuickSpecs = async (e) => {
    e.preventDefault();
    setSavingSpecs(true);
    try {
      const res = await gymOwnerApi.put('/api/owner/gym/profile', {
        facilityType: quickSpecsForm.facilityType,
        operatingHours: quickSpecsForm.operatingHours,
        phone: quickSpecsForm.supportContact || gymForm.phone,
      });

      if (res.data?.success) {
        setGymProfile(res.data.data);
        setShowQuickSpecsModal(false);
        setDismissGymAlert(true);
        Swal.fire({
          title: 'Facility Specs Saved!',
          text: 'Your gym operational specs have been updated successfully.',
          icon: 'success',
          confirmButtonColor: '#ff2a2a',
          background: '#10141d',
          color: '#fff',
        });
      }
    } catch (err) {
      Swal.fire({
        title: 'Error',
        text: err.response?.data?.message || 'Failed to update specs.',
        icon: 'error',
        background: '#10141d',
        color: '#fff',
      });
    } finally {
      setSavingSpecs(false);
    }
  };

  // --- BRANCH HANDLERS ---
  const handleOpenBranchModal = (branch = null) => {
    if (branch) {
      setEditingBranch(branch);
      setBranchForm({
        name: branch.name || '',
        email: branch.email || '',
        phone: branch.phone || '',
        address: branch.address || '',
        city: branch.city || 'Mumbai',
        state: branch.state || 'Maharashtra',
        openingTime: branch.openingTime || '06:00 AM',
        closingTime: branch.closingTime || '10:00 PM',
        capacity: branch.capacity || 300,
        managerId: branch.managerId || '',
      });
    } else {
      setEditingBranch(null);
      setBranchForm({
        name: '',
        email: '',
        phone: '',
        address: '',
        city: 'Mumbai',
        state: 'Maharashtra',
        openingTime: '06:00 AM',
        closingTime: '10:00 PM',
        capacity: 300,
        managerId: '',
      });
    }
    setShowBranchModal(true);
  };

  const handleSaveBranch = async (e) => {
    e.preventDefault();
    try {
      if (editingBranch) {
        const res = await gymOwnerApi.put(`/api/owner/branches/${editingBranch._id}`, branchForm);
        if (res.data?.success) {
          Swal.fire({ title: 'Success', text: 'Branch updated successfully!', icon: 'success', background: '#10141d', color: '#fff' });
        }
      } else {
        const res = await gymOwnerApi.post('/api/owner/branches', branchForm);
        if (res.data?.success) {
          Swal.fire({ title: 'Success', text: 'New branch created successfully!', icon: 'success', background: '#10141d', color: '#fff' });
        }
      }
      setShowBranchModal(false);
      loadData();
    } catch (err) {
      Swal.fire({
        title: 'Error',
        text: err.response?.data?.message || 'Failed to save branch.',
        icon: 'error',
        background: '#10141d',
        color: '#fff',
      });
    }
  };

  const handleDeleteBranch = async (branchId) => {
    const confirm = await Swal.fire({
      title: 'Delete Branch?',
      text: 'Are you sure you want to remove this branch?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ff2a2a',
      background: '#10141d',
      color: '#fff',
    });
    if (confirm.isConfirmed) {
      try {
        await gymOwnerApi.delete(`/api/owner/branches/${branchId}`);
        Swal.fire({ title: 'Deleted', text: 'Branch deleted.', icon: 'success', background: '#10141d', color: '#fff' });
        loadData();
      } catch (err) {
        Swal.fire({ title: 'Error', text: 'Failed to delete branch.', icon: 'error', background: '#10141d', color: '#fff' });
      }
    }
  };

  // --- BRANCH MANAGER HANDLERS ---
  const handleOpenManagerModal = (mgr = null) => {
    if (mgr) {
      setEditingManager(mgr);
      setManagerForm({
        name: mgr.name || '',
        email: mgr.email || '',
        password: '',
        phone: mgr.phone || '',
        branchId: mgr.branchId || '',
      });
    } else {
      setEditingManager(null);
      setManagerForm({
        name: '',
        email: '',
        password: '',
        phone: '',
        branchId: branches[0]?._id || '',
      });
    }
    setShowManagerModal(true);
  };

  const handleSaveManager = async (e) => {
    e.preventDefault();
    try {
      if (editingManager) {
        const res = await gymOwnerApi.put(`/api/owner/branch-managers/${editingManager._id}`, managerForm);
        if (res.data?.success) {
          Swal.fire({ title: 'Updated', text: 'Branch Manager updated!', icon: 'success', background: '#10141d', color: '#fff' });
        }
      } else {
        const res = await gymOwnerApi.post('/api/owner/branch-managers', managerForm);
        if (res.data?.success) {
          Swal.fire({ title: 'Created', text: 'Branch Manager created successfully!', icon: 'success', background: '#10141d', color: '#fff' });
        }
      }
      setShowManagerModal(false);
      loadData();
    } catch (err) {
      Swal.fire({
        title: 'Error',
        text: err.response?.data?.message || 'Failed to save branch manager.',
        icon: 'error',
        background: '#10141d',
        color: '#fff',
      });
    }
  };

  const handleToggleManagerStatus = async (mgrId) => {
    try {
      const res = await gymOwnerApi.patch(`/api/owner/branch-managers/${mgrId}/status`);
      if (res.data?.success) {
        Swal.fire({ title: 'Status Changed', text: res.data.message, icon: 'info', background: '#10141d', color: '#fff', timer: 1500 });
        loadData();
      }
    } catch (err) {
      Swal.fire({ title: 'Error', text: 'Failed to toggle manager status.', icon: 'error', background: '#10141d', color: '#fff' });
    }
  };

  const handleDeleteManager = async (mgrId) => {
    const confirm = await Swal.fire({
      title: 'Delete Branch Manager?',
      text: 'Remove this branch manager account?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ff2a2a',
      background: '#10141d',
      color: '#fff',
    });
    if (confirm.isConfirmed) {
      try {
        await gymOwnerApi.delete(`/api/owner/branch-managers/${mgrId}`);
        Swal.fire({ title: 'Deleted', text: 'Branch Manager deleted.', icon: 'success', background: '#10141d', color: '#fff' });
        loadData();
      } catch (err) {
        Swal.fire({ title: 'Error', text: 'Failed to delete manager.', icon: 'error', background: '#10141d', color: '#fff' });
      }
    }
  };

  // --- MEMBER HANDLERS ---
  const handleOpenMemberModal = (member = null) => {
    if (member) {
      setEditingMember(member);
      setMemberForm({
        name: member.name || '',
        email: member.email || '',
        phone: member.phone || '',
        gender: member.gender || 'MALE',
        branchId: member.branchId || '',
        planType: member.planType || 'MONTHLY',
        amountPaid: member.amountPaid || 50,
        rfidTag: member.rfidTag || '',
        emergencyContact: member.emergencyContact || '',
        durationDays: 30,
      });
    } else {
      setEditingMember(null);
      setMemberForm({
        name: '',
        email: '',
        phone: '',
        gender: 'MALE',
        branchId: branches[0]?._id || '',
        planType: 'MONTHLY',
        amountPaid: 50,
        rfidTag: `RFID-${Math.floor(100000 + Math.random() * 900000)}`,
        emergencyContact: '',
        durationDays: 30,
      });
    }
    setShowMemberModal(true);
  };

  const handleSaveMember = async (e) => {
    e.preventDefault();
    try {
      if (editingMember) {
        const res = await gymOwnerApi.put(`/api/owner/members/${editingMember._id}`, memberForm);
        if (res.data?.success) {
          Swal.fire({ title: 'Updated', text: 'Member details updated!', icon: 'success', background: '#10141d', color: '#fff' });
        }
      } else {
        const res = await gymOwnerApi.post('/api/owner/members', memberForm);
        if (res.data?.success) {
          Swal.fire({ title: 'Registered', text: 'New member registered!', icon: 'success', background: '#10141d', color: '#fff' });
        }
      }
      setShowMemberModal(false);
      loadData();
    } catch (err) {
      Swal.fire({
        title: 'Error',
        text: err.response?.data?.message || 'Failed to save member.',
        icon: 'error',
        background: '#10141d',
        color: '#fff',
      });
    }
  };

  const handleMemberCheckIn = async (memberId, memberName) => {
    try {
      const res = await gymOwnerApi.post(`/api/owner/members/${memberId}/checkin`);
      if (res.data?.success) {
        Swal.fire({
          title: '⚡ Gate RFID Granted',
          text: `Attendance verified for ${memberName}!`,
          icon: 'success',
          background: '#10141d',
          color: '#fff',
          timer: 2000,
        });
        loadData();
      }
    } catch (err) {
      Swal.fire({ title: 'Check-In Failed', text: 'Gate turnstile connection error.', icon: 'error', background: '#10141d', color: '#fff' });
    }
  };

  const handleDeleteMember = async (memberId) => {
    const confirm = await Swal.fire({
      title: 'Delete Member?',
      text: 'Remove member record?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ff2a2a',
      background: '#10141d',
      color: '#fff',
    });
    if (confirm.isConfirmed) {
      try {
        await gymOwnerApi.delete(`/api/owner/members/${memberId}`);
        Swal.fire({ title: 'Deleted', text: 'Member record removed.', icon: 'success', background: '#10141d', color: '#fff' });
        loadData();
      } catch (err) {
        Swal.fire({ title: 'Error', text: 'Failed to delete member.', icon: 'error', background: '#10141d', color: '#fff' });
      }
    }
  };

  // --- MEMBERSHIP PLAN HANDLERS ---
  const handleOpenPlanModal = (plan = null) => {
    if (plan) {
      setEditingPlan(plan);
      setPlanForm({
        name: plan.name || '',
        type: plan.type || 'MONTHLY',
        price: plan.price || 49,
        durationDays: plan.durationDays || 30,
        tagline: plan.tagline || '',
        description: plan.description || '',
        features: Array.isArray(plan.features) ? plan.features.join(', ') : plan.features || '',
        isPopular: !!plan.isPopular,
        isActive: plan.isActive !== false,
      });
    } else {
      setEditingPlan(null);
      setPlanForm({
        name: '',
        type: 'MONTHLY',
        price: 49,
        durationDays: 30,
        tagline: 'Standard Tier',
        description: '',
        features: 'Gym Floor Access, Locker Room, Free Member App',
        isPopular: false,
        isActive: true,
      });
    }
    setShowPlanModal(true);
  };

  const handleSavePlan = (e) => {
    e.preventDefault();
    if (!planForm.name.trim()) {
      Swal.fire({ title: 'Validation Error', text: 'Plan name is required.', icon: 'warning', background: '#10141d', color: '#fff' });
      return;
    }

    const featureArr = planForm.features
      ? planForm.features.split(',').map((f) => f.trim()).filter(Boolean)
      : [];

    if (editingPlan) {
      const updated = gymPlans.map((p) =>
        p.id === editingPlan.id
          ? {
              ...p,
              name: planForm.name.trim(),
              type: planForm.type,
              price: Number(planForm.price) || 0,
              durationDays: Number(planForm.durationDays) || 30,
              tagline: planForm.tagline.trim(),
              description: planForm.description.trim(),
              features: featureArr,
              isPopular: planForm.isPopular,
              isActive: planForm.isActive,
            }
          : p
      );
      saveGymPlans(updated);
      Swal.fire({ title: 'Plan Updated!', text: 'Membership plan updated successfully.', icon: 'success', background: '#10141d', color: '#fff', timer: 1500, showConfirmButton: false });
    } else {
      const newPlan = {
        id: `plan_${Date.now()}`,
        name: planForm.name.trim(),
        type: planForm.type,
        price: Number(planForm.price) || 0,
        durationDays: Number(planForm.durationDays) || 30,
        tagline: planForm.tagline.trim(),
        description: planForm.description.trim(),
        features: featureArr,
        isPopular: planForm.isPopular,
        isActive: planForm.isActive,
      };
      saveGymPlans([...gymPlans, newPlan]);
      Swal.fire({ title: 'Plan Created!', text: 'New membership plan tier created.', icon: 'success', background: '#10141d', color: '#fff', timer: 1500, showConfirmButton: false });
    }
    setShowPlanModal(false);
  };

  const handleTogglePlanStatus = (planId) => {
    const updated = gymPlans.map((p) => (p.id === planId ? { ...p, isActive: !p.isActive } : p));
    saveGymPlans(updated);
  };

  const handleDeletePlan = async (planId) => {
    const confirm = await Swal.fire({
      title: 'Delete Membership Plan?',
      text: 'Are you sure you want to remove this plan tier?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ff2a2a',
      cancelButtonColor: '#1e2433',
      confirmButtonText: 'Yes, Delete',
      background: '#10141d',
      color: '#fff',
    });

    if (confirm.isConfirmed) {
      const updated = gymPlans.filter((p) => p.id !== planId);
      saveGymPlans(updated);
      Swal.fire({ title: 'Deleted', text: 'Membership plan removed.', icon: 'success', background: '#10141d', color: '#fff', timer: 1200, showConfirmButton: false });
    }
  };

  // --- GYM PROFILE HANDLER ---
  const handleSaveGymProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await gymOwnerApi.put('/api/owner/gym/profile', gymForm);
      if (res.data?.success) {
        Swal.fire({ title: 'Saved!', text: 'Gym profile updated successfully.', icon: 'success', background: '#10141d', color: '#fff' });
        loadData();
      }
    } catch (err) {
      Swal.fire({ title: 'Error', text: 'Failed to update gym profile.', icon: 'error', background: '#10141d', color: '#fff' });
    }
  };

  // Navigation Items
  const menuItems = [
    { id: 'Overview', label: 'Franchise Overview', icon: LayoutDashboard },
    { id: 'Branches', label: 'Branches', icon: GitBranch, count: branches.length },
    { id: 'BranchManagers', label: 'Branch Managers', icon: UserCheck, count: managers.length },
    { id: 'Members', label: 'Members Directory', icon: Users, count: members.length },
    { id: 'Plans', label: 'Membership Plans', icon: Award, count: gymPlans.length },
    { id: 'Attendance', label: 'Live RFID Attendance', icon: CalendarCheck2 },
    { id: 'Settings', label: 'Gym & Settings', icon: Settings },
  ];

  // Filtered Members
  const filteredMembers = members.filter((m) => {
    const matchSearch =
      m.name?.toLowerCase().includes(memberSearch.toLowerCase()) ||
      m.phone?.includes(memberSearch) ||
      m.email?.toLowerCase().includes(memberSearch.toLowerCase()) ||
      m.rfidTag?.toLowerCase().includes(memberSearch.toLowerCase());
    const matchBranch = !memberBranchFilter || m.branchId === memberBranchFilter;
    return matchSearch && matchBranch;
  });

  // Filtered Attendance
  const filteredAttendance = attendanceLogs.filter((a) => {
    return !attendanceBranchFilter || a.branchId === attendanceBranchFilter;
  });

  const savedPlan = (() => {
    try {
      return JSON.parse(localStorage.getItem('gymSelectedPlan')) || null;
    } catch (e) {
      return null;
    }
  })();

  const activePlanName = gymProfile?.planName || savedPlan?.planName || 'Growth Pro';

  const metrics = dashboardData?.metrics || {
    totalBranches: branches.length,
    activeBranches: branches.filter((b) => b.status === 'ACTIVE').length,
    totalManagers: managers.length,
    totalMembers: members.length,
    activeMembers: members.filter((m) => m.status === 'ACTIVE').length,
    todayCheckIns: attendanceLogs.length,
    monthlyRevenue: 12450,
    maxBranches: gymProfile?.maxBranches || savedPlan?.maxBranches || 5,
    maxMembers: gymProfile?.maxMembers || savedPlan?.maxMembers || 1500,
  };

  return (
    <div className="dashboard-layout">
      {/* Sidebar Navigation */}
      <aside className="dashboard-sidebar d-none d-lg-flex">
        <div className="sidebar-brand">
          <DynamicLogo size="medium" subtitle="GYM OWNER PORTAL" />
        </div>

        <div className="sidebar-user-preview">
          <div className="user-avatar-small">
            {user?.name ? user.name.slice(0, 2).toUpperCase() : 'RK'}
          </div>
          <div className="user-meta-small">
            <p className="user-name-small">{user?.name || 'Franchise Owner'}</p>
            <div className="d-flex align-items-center gap-1 mt-1 flex-wrap">
              <span className="user-role-badge">GYM OWNER</span>
              <Link
                to="/select-plan"
                className="badge bg-danger text-white text-decoration-none"
                style={{ fontSize: '0.65rem', padding: '2px 6px', letterSpacing: '0.04em' }}
                title="Change Subscription Plan"
              >
                {activePlanName}
              </Link>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <p className="nav-group-title">FRANCHISE MANAGEMENT</p>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
                onClick={() => setActiveTab(item.id)}
              >
                <Icon size={18} className="nav-icon" />
                <span>{item.label}</span>
                {item.count !== undefined && (
                  <span className="badge badge-secondary ms-auto" style={{ fontSize: '0.7rem' }}>
                    {item.count}
                  </span>
                )}
                {isActive && <ChevronRight size={16} className="ms-2" />}
              </button>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <button onClick={handleLogout} className="sidebar-logout-btn" id="logout-btn">
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Drawer */}
      {mobileDrawerOpen && (
        <div
          className="d-lg-none position-fixed top-0 start-0 w-100 h-100 z-3"
          style={{ backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}
          onClick={() => setMobileDrawerOpen(false)}
        >
          <div
            className="position-absolute top-0 start-0 h-100 d-flex flex-column p-3"
            style={{ width: 'min(300px, 85vw)', backgroundColor: '#0d1117', borderRight: '1px solid rgba(255,255,255,0.1)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="d-flex align-items-center justify-content-between mb-4 pb-3 border-bottom border-dark">
              <DynamicLogo size="small" subtitle="OWNER PORTAL" />
              <button className="btn text-white p-1" onClick={() => setMobileDrawerOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <nav className="d-flex flex-column gap-1 flex-grow-1 overflow-auto">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
                    onClick={() => {
                      setActiveTab(item.id);
                      setMobileDrawerOpen(false);
                    }}
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                    {item.count !== undefined && (
                      <span className="badge badge-secondary ms-auto" style={{ fontSize: '0.7rem' }}>
                        {item.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            <div className="pt-3 border-top border-dark mt-auto">
              <button onClick={handleLogout} className="sidebar-logout-btn">
                <LogOut size={16} />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content View */}
      <main className="dashboard-main">
        <header className="dashboard-topbar">
          <div className="d-flex align-items-center gap-3">
            <button className="btn text-white d-lg-none p-1" onClick={() => setMobileDrawerOpen(true)}>
              <Menu size={22} />
            </button>
            <div>
              <h2 className="page-heading">{menuItems.find((m) => m.id === activeTab)?.label || activeTab}</h2>
              <p className="page-subheading">
                Gym: <strong className="text-white">{gymProfile?.name || 'Ro-Fitness'}</strong> • Plan:{' '}
                <span className="highlight-badge">{gymProfile?.planName || 'Franchise Growth Pro'}</span>
              </p>
            </div>
          </div>

          <div className="d-flex align-items-center gap-3">
            <button
              className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-2 text-white border-dark"
              onClick={loadData}
              title="Refresh Workspace"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              <span className="d-none d-sm-inline">Sync</span>
            </button>

            <div className="user-profile-pill">
              <div className="user-avatar-circle">
                {user?.name ? user.name[0].toUpperCase() : 'O'}
              </div>
              <div className="user-profile-details">
                <span className="user-profile-name">{user?.name || 'Owner'}</span>
                <span className="user-profile-email">{user?.email || 'owner@gym.com'}</span>
              </div>
            </div>
          </div>
        </header>

        <div className="dashboard-body">
          {/* Non-intrusive Quick Gym Details Alert (2-3 extra optional fields) */}
          {!dismissGymAlert && (!gymProfile?.facilityType || !gymProfile?.operatingHours) && (
            <div
              className="d-flex flex-wrap align-items-center justify-content-between p-3 mb-4 rounded-3"
              style={{
                background: 'linear-gradient(90deg, rgba(255, 42, 42, 0.12) 0%, rgba(20, 24, 36, 0.95) 100%)',
                border: '1px solid rgba(255, 42, 42, 0.35)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
              }}
            >
              <div className="d-flex align-items-center gap-3">
                <div
                  className="rounded-2 p-2 d-flex align-items-center justify-content-center flex-shrink-0"
                  style={{ background: 'rgba(255, 42, 42, 0.2)', border: '1px solid rgba(255, 42, 42, 0.4)' }}
                >
                  <Building2 size={20} className="text-red" />
                </div>
                <div>
                  <h6 className="m-0 fw-bold text-white fs-6">Complete Facility Details (2-3 Extra Specs)</h6>
                  <p className="m-0 text-silver small" style={{ fontSize: '0.8rem' }}>
                    Add your Facility Type & Operating Hours to personalize member passes, receipts, and invoices.
                  </p>
                </div>
              </div>
              <div className="d-flex align-items-center gap-2 mt-2 mt-sm-0">
                <button
                  type="button"
                  className="btn btn-sm btn-outline-light px-3 py-1 fw-semibold"
                  style={{ fontSize: '0.8rem', borderRadius: '6px' }}
                  onClick={() => setShowQuickSpecsModal(true)}
                >
                  Update Specs
                </button>
                <button
                  type="button"
                  className="btn text-muted p-1 border-0"
                  onClick={() => setDismissGymAlert(true)}
                  title="Dismiss Alert"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          )}
          {/* =================== TAB 1: OVERVIEW =================== */}
          {activeTab === 'Overview' && (
            <div>
              {/* Metric Stat Cards */}
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-header">
                    <span className="stat-title">Total Branches</span>
                    <div className="stat-icon-wrapper red">
                      <GitBranch size={18} />
                    </div>
                  </div>
                  <div className="stat-value">{metrics.totalBranches} <span className="fs-6 text-muted font-sans fw-normal">/ {metrics.maxBranches}</span></div>
                  <div className="d-flex align-items-center gap-1 text-success" style={{ fontSize: '0.78rem' }}>
                    <TrendingUp size={13} />
                    <span>{metrics.activeBranches} Active Locations</span>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-header">
                    <span className="stat-title">Branch Managers</span>
                    <div className="stat-icon-wrapper amber">
                      <UserCheck size={18} />
                    </div>
                  </div>
                  <div className="stat-value">{metrics.totalManagers}</div>
                  <div className="d-flex align-items-center gap-1 text-info" style={{ fontSize: '0.78rem' }}>
                    <Shield size={13} />
                    <span>Authorized Branch Leads</span>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-header">
                    <span className="stat-title">Registered Members</span>
                    <div className="stat-icon-wrapper emerald">
                      <Users size={18} />
                    </div>
                  </div>
                  <div className="stat-value">{metrics.totalMembers}</div>
                  <div className="d-flex align-items-center gap-1 text-success" style={{ fontSize: '0.78rem' }}>
                    <CheckCircle2 size={13} />
                    <span>{metrics.activeMembers} Active Subscriptions</span>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-header">
                    <span className="stat-title">Today's RFID Check-Ins</span>
                    <div className="stat-icon-wrapper cyan">
                      <CalendarCheck2 size={18} />
                    </div>
                  </div>
                  <div className="stat-value">{metrics.todayCheckIns}</div>
                  <div className="d-flex align-items-center gap-1 text-warning" style={{ fontSize: '0.78rem' }}>
                    <Activity size={13} />
                    <span>Sub-second IoT Attendance</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions & Branch Capacity Overview */}
              <div className="row g-4 mb-4">
                <div className="col-12 col-lg-8">
                  <div className="content-card h-100">
                    <div className="card-header-clean">
                      <div>
                        <h3 className="card-title">Gym Branches Performance</h3>
                        <p className="text-muted" style={{ fontSize: '0.82rem' }}>Capacity & Branch Manager assignment status</p>
                      </div>
                      <button className="btn-primary-sm" onClick={() => handleOpenBranchModal()}>
                        <Plus size={15} />
                        <span>Add Branch</span>
                      </button>
                    </div>

                    {branches.length > 0 ? (
                      <div className="table-responsive">
                        <table className="custom-table">
                          <thead>
                            <tr>
                              <th>Branch Name</th>
                              <th>City / Location</th>
                              <th>Branch Manager</th>
                              <th>Members</th>
                              <th>Status</th>
                              <th className="text-end">Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {branches.map((b) => (
                              <tr key={b._id}>
                                <td>
                                  <strong className="text-white">{b.name}</strong>
                                </td>
                                <td>
                                  <span className="text-muted"><MapPin size={13} className="text-red me-1 inline" />{b.city}, {b.state}</span>
                                </td>
                                <td>
                                  <span className="badge badge-owner">{b.managerName || 'Unassigned'}</span>
                                </td>
                                <td>
                                  <span className="fw-bold">{b.memberCount || 0}</span> / {b.capacity || 300}
                                </td>
                                <td>
                                  <span className={`badge ${b.status === 'ACTIVE' ? 'badge-success' : 'badge-danger'}`}>
                                    {b.status}
                                  </span>
                                </td>
                                <td className="text-end">
                                  <button
                                    className="btn btn-outline-secondary btn-sm p-1 px-2 border-dark text-white me-1"
                                    onClick={() => handleOpenBranchModal(b)}
                                  >
                                    <Edit2 size={13} />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-5 text-muted">
                        <GitBranch size={40} className="mb-2 text-red" />
                        <p className="mb-3">No branches created yet for your gym.</p>
                        <button className="btn-red" onClick={() => handleOpenBranchModal()}>
                          <Plus size={16} /> Create Your First Branch
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="col-12 col-lg-4">
                  <div className="content-card h-100">
                    <div className="card-header-clean">
                      <div>
                        <h3 className="card-title">Quick Actions</h3>
                        <p className="text-muted" style={{ fontSize: '0.82rem' }}>Administrative tools</p>
                      </div>
                    </div>

                    <div className="d-flex flex-column gap-3">
                      <button
                        className="p-3 rounded text-start border d-flex align-items-center gap-3 bg-dark border-dark text-white hover-glow"
                        onClick={() => handleOpenManagerModal()}
                      >
                        <div className="stat-icon-wrapper amber m-0">
                          <UserPlus size={18} />
                        </div>
                        <div>
                          <strong className="d-block text-white" style={{ fontSize: '0.92rem' }}>Create Branch Manager</strong>
                          <span className="text-muted" style={{ fontSize: '0.78rem' }}>Delegate location authority</span>
                        </div>
                      </button>

                      <button
                        className="p-3 rounded text-start border d-flex align-items-center gap-3 bg-dark border-dark text-white hover-glow"
                        onClick={() => handleOpenMemberModal()}
                      >
                        <div className="stat-icon-wrapper emerald m-0">
                          <Users size={18} />
                        </div>
                        <div>
                          <strong className="d-block text-white" style={{ fontSize: '0.92rem' }}>Register New Member</strong>
                          <span className="text-muted" style={{ fontSize: '0.78rem' }}>Assign RFID pass & plan</span>
                        </div>
                      </button>

                      <button
                        className="p-3 rounded text-start border d-flex align-items-center gap-3 bg-dark border-dark text-white hover-glow"
                        onClick={() => setActiveTab('Attendance')}
                      >
                        <div className="stat-icon-wrapper cyan m-0">
                          <Radio size={18} />
                        </div>
                        <div>
                          <strong className="d-block text-white" style={{ fontSize: '0.92rem' }}>RFID Gate Telemetry</strong>
                          <span className="text-muted" style={{ fontSize: '0.78rem' }}>Live check-ins stream</span>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Live Attendance Feed */}
              <div className="content-card">
                <div className="card-header-clean">
                  <div>
                    <h3 className="card-title">Recent Gate Entries & Check-Ins</h3>
                    <p className="text-muted" style={{ fontSize: '0.82rem' }}>Live RFID gate entries across all your branches</p>
                  </div>
                  <span className="badge badge-success">Telemetry Live</span>
                </div>

                {attendanceLogs.length > 0 ? (
                  <div className="activity-list">
                    {attendanceLogs.slice(0, 6).map((log) => (
                      <div key={log._id} className="activity-item">
                        <div className="avatar-circle">
                          {log.memberName ? log.memberName.slice(0, 2).toUpperCase() : 'M'}
                        </div>
                        <div className="activity-info">
                          <p className="activity-title">
                            <strong>{log.memberName}</strong> checked in at <strong>{log.branchName}</strong>
                          </p>
                          <span className="activity-time">
                            {new Date(log.timestamp).toLocaleTimeString()} • {log.type}
                          </span>
                        </div>
                        <span className={`badge ${log.status === 'GRANTED' ? 'badge-success' : 'badge-danger'}`}>
                          {log.status}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-muted">No gate check-in activity recorded today yet.</div>
                )}
              </div>
            </div>
          )}

          {/* =================== TAB 2: BRANCHES =================== */}
          {activeTab === 'Branches' && (
            <div className="content-card">
              <div className="card-header-clean">
                <div>
                  <h3 className="card-title">Manage Branches ({branches.length} / {metrics.maxBranches})</h3>
                  <p className="text-muted" style={{ fontSize: '0.82rem' }}>Add and manage gym facilities under your franchise</p>
                </div>
                <button className="btn-red" onClick={() => handleOpenBranchModal()}>
                  <Plus size={16} />
                  <span>Add Branch</span>
                </button>
              </div>

              {branches.length > 0 ? (
                <div className="row g-4">
                  {branches.map((b) => (
                    <div key={b._id} className="col-12 col-md-6 col-lg-4">
                      <div className="stat-card h-100 position-relative p-4">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <span className={`badge ${b.status === 'ACTIVE' ? 'badge-success' : 'badge-danger'}`}>
                            {b.status}
                          </span>
                          <div className="d-flex gap-1">
                            <button
                              className="btn btn-outline-secondary btn-sm p-1 border-dark text-white"
                              onClick={() => handleOpenBranchModal(b)}
                              title="Edit Branch"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              className="btn btn-outline-danger btn-sm p-1 border-0 text-red"
                              onClick={() => handleDeleteBranch(b._id)}
                              title="Delete Branch"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>

                        <h4 className="font-hero fs-4 text-white mb-1">{b.name}</h4>
                        <p className="text-muted mb-3" style={{ fontSize: '0.85rem' }}>
                          <MapPin size={13} className="text-red me-1 inline" /> {b.address || 'Address not set'}, {b.city}, {b.state}
                        </p>

                        <div className="info-grid-list mb-3">
                          <div className="info-item">
                            <span className="info-label">Branch Manager</span>
                            <span className="info-value text-red">{b.managerName || 'Unassigned'}</span>
                          </div>
                          <div className="info-item">
                            <span className="info-label">Members Enrolled</span>
                            <span className="info-value">{b.memberCount || 0} / {b.capacity || 300}</span>
                          </div>
                          <div className="info-item">
                            <span className="info-label">Hours</span>
                            <span className="info-value">{b.openingTime} - {b.closingTime}</span>
                          </div>
                          {b.phone && (
                            <div className="info-item">
                              <span className="info-label">Phone</span>
                              <span className="info-value">{b.phone}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-5 text-muted">
                  <GitBranch size={48} className="mb-3 text-red" />
                  <h4>No Branches Found</h4>
                  <p>Click "Add Branch" above to create your first gym branch location.</p>
                </div>
              )}
            </div>
          )}

          {/* =================== TAB 3: BRANCH MANAGERS =================== */}
          {activeTab === 'BranchManagers' && (
            <div className="content-card">
              <div className="card-header-clean">
                <div>
                  <h3 className="card-title">Branch Managers Administration</h3>
                  <p className="text-muted" style={{ fontSize: '0.82rem' }}>
                    Create and manage authorized branch leads for your gym facilities
                  </p>
                </div>
                <button className="btn-red" onClick={() => handleOpenManagerModal()}>
                  <UserPlus size={16} />
                  <span>Create Branch Manager</span>
                </button>
              </div>

              {managers.length > 0 ? (
                <div className="table-responsive">
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>Manager Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Assigned Branch</th>
                        <th>Status</th>
                        <th className="text-end">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {managers.map((m) => (
                        <tr key={m._id}>
                          <td>
                            <div className="d-flex align-items-center gap-2">
                              <div className="user-avatar-circle" style={{ width: '32px', height: '32px' }}>
                                {m.name ? m.name[0].toUpperCase() : 'M'}
                              </div>
                              <strong className="text-white">{m.name}</strong>
                            </div>
                          </td>
                          <td className="text-silver">{m.email}</td>
                          <td className="text-muted">{m.phone || 'N/A'}</td>
                          <td>
                            <span className="badge badge-owner">
                              <GitBranch size={12} className="me-1 inline" /> {m.branchName || 'All Branches'}
                            </span>
                          </td>
                          <td>
                            <button
                              className={`badge border-0 cursor-pointer ${m.status === 'ACTIVE' ? 'badge-success' : 'badge-danger'}`}
                              onClick={() => handleToggleManagerStatus(m._id)}
                              title="Click to toggle status"
                            >
                              {m.status}
                            </button>
                          </td>
                          <td className="text-end">
                            <button
                              className="btn btn-outline-secondary btn-sm p-1 px-2 border-dark text-white me-1"
                              onClick={() => handleOpenManagerModal(m)}
                              title="Edit Manager"
                            >
                              <Edit2 size={13} />
                            </button>
                            <button
                              className="btn btn-outline-danger btn-sm p-1 px-2 border-0 text-red"
                              onClick={() => handleDeleteManager(m._id)}
                              title="Delete Manager"
                            >
                              <Trash2 size={13} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-5 text-muted">
                  <UserCheck size={48} className="mb-3 text-red" />
                  <h4>No Branch Managers Created</h4>
                  <p>Create branch manager accounts so they can login and oversee daily branch operations.</p>
                  <button className="btn-red mt-2" onClick={() => handleOpenManagerModal()}>
                    <UserPlus size={16} /> Create First Branch Manager
                  </button>
                </div>
              )}
            </div>
          )}

          {/* =================== TAB 4: MEMBERS DIRECTORY =================== */}
          {activeTab === 'Members' && (
            <div className="content-card">
              <div className="card-header-clean">
                <div>
                  <h3 className="card-title">Members Directory ({filteredMembers.length})</h3>
                  <p className="text-muted" style={{ fontSize: '0.82rem' }}>Athlete profiles, memberships, RFID passes, and check-ins</p>
                </div>
                <button className="btn-red" onClick={() => handleOpenMemberModal()}>
                  <UserPlus size={16} />
                  <span>Register Member</span>
                </button>
              </div>

              {/* Filter controls */}
              <div className="row g-3 mb-4">
                <div className="col-12 col-md-6 col-lg-4">
                  <div className="search-box w-100">
                    <Search size={16} className="search-icon" />
                    <input
                      type="text"
                      className="search-input w-100"
                      placeholder="Search by name, phone, RFID..."
                      value={memberSearch}
                      onChange={(e) => setMemberSearch(e.target.value)}
                    />
                  </div>
                </div>
                <div className="col-12 col-md-6 col-lg-4">
                  <select
                    className="input-athletic"
                    style={{ paddingLeft: '14px' }}
                    value={memberBranchFilter}
                    onChange={(e) => setMemberBranchFilter(e.target.value)}
                  >
                    <option value="">All Branches</option>
                    {branches.map((b) => (
                      <option key={b._id} value={b._id}>
                        {b.name} ({b.city})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {filteredMembers.length > 0 ? (
                <div className="table-responsive">
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>Member</th>
                        <th>Phone</th>
                        <th>Branch</th>
                        <th>Plan Type</th>
                        <th>RFID Pass</th>
                        <th>Status</th>
                        <th className="text-end">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredMembers.map((m) => (
                        <tr key={m._id}>
                          <td>
                            <div className="d-flex align-items-center gap-2">
                              <div className="avatar-circle">
                                {m.name ? m.name.slice(0, 2).toUpperCase() : 'ME'}
                              </div>
                              <div>
                                <strong className="text-white d-block">{m.name}</strong>
                                <span className="text-muted" style={{ fontSize: '0.75rem' }}>{m.email || m.gender}</span>
                              </div>
                            </div>
                          </td>
                          <td className="text-silver">{m.phone}</td>
                          <td>
                            <span className="badge badge-secondary">{m.branchName}</span>
                          </td>
                          <td>
                            <span className="badge badge-owner">${m.amountPaid} • {m.planType}</span>
                          </td>
                          <td>
                            <span className="info-code">{m.rfidTag}</span>
                          </td>
                          <td>
                            <span className={`badge ${m.status === 'ACTIVE' ? 'badge-success' : 'badge-danger'}`}>
                              {m.status}
                            </span>
                          </td>
                          <td className="text-end">
                            <button
                              className="btn btn-outline-success btn-sm p-1 px-2 border-0 text-success me-1"
                              onClick={() => handleMemberCheckIn(m._id, m.name)}
                              title="Instant Gate RFID Check-In"
                            >
                              <Check size={14} /> Check-In
                            </button>
                            <button
                              className="btn btn-outline-secondary btn-sm p-1 px-2 border-dark text-white me-1"
                              onClick={() => handleOpenMemberModal(m)}
                              title="Edit Member"
                            >
                              <Edit2 size={13} />
                            </button>
                            <button
                              className="btn btn-outline-danger btn-sm p-1 px-2 border-0 text-red"
                              onClick={() => handleDeleteMember(m._id)}
                              title="Delete Member"
                            >
                              <Trash2 size={13} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-5 text-muted">
                  <Users size={48} className="mb-3 text-red" />
                  <h4>No Members Found</h4>
                  <p>Register members to assign memberships and issue RFID turnstile keys.</p>
                  <button className="btn-red mt-2" onClick={() => handleOpenMemberModal()}>
                    <UserPlus size={16} /> Register Member
                  </button>
                </div>
              )}
            </div>
          )}

          {/* =================== TAB 5: LIVE RFID ATTENDANCE =================== */}
          {activeTab === 'Attendance' && (
            <div className="content-card">
              <div className="card-header-clean">
                <div>
                  <h3 className="card-title">Live RFID & Biometric Gate Telemetry</h3>
                  <p className="text-muted" style={{ fontSize: '0.82rem' }}>
                    Sub-second turnstile gate access events and headcount telemetry
                  </p>
                </div>

                <div className="d-flex align-items-center gap-2">
                  <select
                    className="input-athletic"
                    style={{ width: '200px', paddingLeft: '14px' }}
                    value={attendanceBranchFilter}
                    onChange={(e) => setAttendanceBranchFilter(e.target.value)}
                  >
                    <option value="">All Branches</option>
                    {branches.map((b) => (
                      <option key={b._id} value={b._id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {filteredAttendance.length > 0 ? (
                <div className="table-responsive">
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>Timestamp</th>
                        <th>Member Name</th>
                        <th>Branch Location</th>
                        <th>Gate Method</th>
                        <th>Access Result</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAttendance.map((log) => (
                        <tr key={log._id}>
                          <td className="text-muted">
                            <Clock size={13} className="text-red me-1 inline" />
                            {new Date(log.timestamp).toLocaleString()}
                          </td>
                          <td>
                            <strong className="text-white">{log.memberName}</strong>
                          </td>
                          <td>
                            <span className="badge badge-owner">{log.branchName}</span>
                          </td>
                          <td>
                            <span className="info-code">{log.type}</span>
                          </td>
                          <td>
                            <span className={`badge ${log.status === 'GRANTED' ? 'badge-success' : 'badge-danger'}`}>
                              {log.status === 'GRANTED' ? 'ACCESS GRANTED' : 'ACCESS DENIED'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-5 text-muted">
                  <CalendarCheck2 size={48} className="mb-3 text-red" />
                  <h4>No Attendance Logs Recorded</h4>
                  <p>Turnstile events will automatically stream here in real-time.</p>
                </div>
              )}
            </div>
          )}

          {/* =================== TAB: PLANS & MEMBERSHIPS =================== */}
          {activeTab === 'Plans' && (
            <div>
              {/* Stat Cards */}
              <div className="stats-grid mb-4">
                <div className="stat-card">
                  <div className="stat-header">
                    <span className="stat-title">Total Membership Tiers</span>
                    <div className="stat-icon-wrapper red">
                      <Award size={18} />
                    </div>
                  </div>
                  <div className="stat-value">{gymPlans.length}</div>
                  <div className="d-flex align-items-center gap-1 text-success" style={{ fontSize: '0.78rem' }}>
                    <CheckCircle2 size={13} />
                    <span>{gymPlans.filter((p) => p.isActive).length} Active Selling Plans</span>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-header">
                    <span className="stat-title">Enrolled Members</span>
                    <div className="stat-icon-wrapper emerald">
                      <Users size={18} />
                    </div>
                  </div>
                  <div className="stat-value">{members.length}</div>
                  <div className="d-flex align-items-center gap-1 text-info" style={{ fontSize: '0.78rem' }}>
                    <TrendingUp size={13} />
                    <span>Across all package tiers</span>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-header">
                    <span className="stat-title">Franchise SaaS Tier</span>
                    <div className="stat-icon-wrapper amber">
                      <Shield size={18} />
                    </div>
                  </div>
                  <div className="stat-value text-red" style={{ fontSize: '1.4rem' }}>{activePlanName}</div>
                  <div className="d-flex align-items-center gap-1 text-warning" style={{ fontSize: '0.78rem' }}>
                    <Zap size={13} />
                    <span>Multi-Branch Roaming Active</span>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-header">
                    <span className="stat-title">Branch Quota Used</span>
                    <div className="stat-icon-wrapper cyan">
                      <GitBranch size={18} />
                    </div>
                  </div>
                  <div className="stat-value">{branches.length} <span className="fs-6 text-muted font-sans fw-normal">/ {metrics.maxBranches}</span></div>
                  <div className="d-flex align-items-center gap-1 text-success" style={{ fontSize: '0.78rem' }}>
                    <CheckCircle2 size={13} />
                    <span>{metrics.maxBranches - branches.length} Slots Available</span>
                  </div>
                </div>
              </div>

              {/* Action Bar */}
              <div className="d-flex flex-wrap align-items-center justify-content-between mb-4 gap-3">
                <div>
                  <h3 className="card-title fs-4 m-0 text-white">Gym Membership Packages & Passes</h3>
                  <p className="text-muted m-0" style={{ fontSize: '0.82rem' }}>
                    Create custom passes, set daily/monthly pricing, and link turnstile RFID entitlements.
                  </p>
                </div>
                <button
                  type="button"
                  className="btn-red d-flex align-items-center gap-2"
                  onClick={() => handleOpenPlanModal()}
                >
                  <Plus size={16} />
                  <span>Create Membership Tier</span>
                </button>
              </div>

              {/* Dynamic Plans Grid */}
              <div className="row g-4 mb-5">
                {gymPlans.map((plan) => {
                  const enrolledCount = members.filter(
                    (m) =>
                      m.planType === plan.type ||
                      m.planType === plan.name ||
                      (m.amountPaid === plan.price && m.planType?.toLowerCase().includes(plan.type?.toLowerCase()))
                  ).length;

                  return (
                    <div key={plan.id} className="col-12 col-md-6 col-xl-4">
                      <div
                        className="content-card h-100 d-flex flex-column justify-content-between position-relative"
                        style={{
                          border: plan.isPopular
                            ? '1px solid rgba(255, 42, 42, 0.5)'
                            : '1px solid rgba(255, 255, 255, 0.08)',
                          boxShadow: plan.isPopular ? '0 0 25px rgba(255,42,42,0.15)' : 'none',
                          background: plan.isActive ? '#141824' : 'rgba(20,24,36,0.6)',
                          opacity: plan.isActive ? 1 : 0.7,
                        }}
                      >
                        {plan.isPopular && (
                          <span
                            className="badge position-absolute top-0 end-0 m-3 px-3 py-1"
                            style={{
                              background: 'linear-gradient(135deg, #ff2a2a 0%, #b80000 100%)',
                              color: '#fff',
                              fontWeight: '800',
                              fontSize: '0.65rem',
                              letterSpacing: '0.06em',
                              borderRadius: '20px',
                            }}
                          >
                            🔥 {plan.tagline || 'MOST POPULAR'}
                          </span>
                        )}

                        <div>
                          <div className="d-flex align-items-center justify-content-between mb-2">
                            <span
                              className="badge"
                              style={{
                                background: 'rgba(255,42,42,0.15)',
                                color: '#ff2a2a',
                                border: '1px solid rgba(255,42,42,0.3)',
                                fontSize: '0.7rem',
                                letterSpacing: '0.04em',
                              }}
                            >
                              {plan.type}
                            </span>
                            {!plan.isPopular && plan.tagline && (
                              <span className="text-muted small" style={{ fontSize: '0.75rem' }}>
                                {plan.tagline}
                              </span>
                            )}
                          </div>

                          <h4 className="text-white fw-bold m-0 fs-5">{plan.name}</h4>
                          <p className="text-muted small mt-1 mb-3" style={{ minHeight: '36px', fontSize: '0.8rem' }}>
                            {plan.description || 'Standard membership pass package for gym athletes.'}
                          </p>

                          <div className="d-flex align-items-baseline gap-2 mb-3 pb-3 border-bottom border-dark">
                            <span className="fs-2 fw-black font-display text-white">${plan.price}</span>
                            <span className="text-silver small">/ {plan.durationDays} Days</span>
                          </div>

                          <ul className="list-unstyled d-flex flex-column gap-2 mb-4">
                            {plan.features?.map((feat, fIdx) => (
                              <li key={fIdx} className="d-flex align-items-center gap-2 text-silver small">
                                <CheckCircle2 size={14} color="#ff2a2a" className="flex-shrink-0" />
                                <span>{feat}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <div className="d-flex align-items-center justify-content-between pt-3 border-top border-dark">
                            <div className="d-flex align-items-center gap-2">
                              <span
                                className={`badge ${plan.isActive ? 'bg-success' : 'bg-secondary'}`}
                                style={{ fontSize: '0.65rem', cursor: 'pointer' }}
                                onClick={() => handleTogglePlanStatus(plan.id)}
                                title="Click to toggle status"
                              >
                                {plan.isActive ? 'ACTIVE' : 'INACTIVE'}
                              </span>
                              <span className="text-muted small" style={{ fontSize: '0.75rem' }}>
                                {enrolledCount} {enrolledCount === 1 ? 'Member' : 'Members'}
                              </span>
                            </div>

                            <div className="d-flex align-items-center gap-1">
                              <button
                                type="button"
                                className="btn btn-dark btn-sm text-silver p-1 px-2 border-dark"
                                onClick={() => handleOpenPlanModal(plan)}
                                title="Edit Membership Plan"
                              >
                                <Edit2 size={14} />
                              </button>
                              <button
                                type="button"
                                className="btn btn-dark btn-sm text-danger p-1 px-2 border-dark"
                                onClick={() => handleDeletePlan(plan.id)}
                                title="Delete Membership Plan"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Franchise SaaS Subscription & Upgrades Box */}
              <div
                className="p-4 rounded-3 mb-4"
                style={{
                  background: 'linear-gradient(135deg, rgba(20,24,36,0.98) 0%, rgba(255,42,42,0.06) 100%)',
                  border: '1px solid rgba(255,42,42,0.25)',
                  boxShadow: '0 8px 30px rgba(0,0,0,0.4)',
                }}
              >
                <div className="row g-4 align-items-center">
                  <div className="col-12 col-lg-8">
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <span className="badge bg-danger text-white">SAAS SUBSCRIPTION</span>
                      <span className="text-silver small">Franchise Cloud License</span>
                    </div>
                    <h3 className="text-white fs-4 fw-bold m-0">Current SaaS Plan: {activePlanName}</h3>
                    <p className="text-muted small mt-1 mb-3">
                      Need more branch locations, unlimited RFID turnstile gate telemetry, or white-label branding?
                    </p>

                    <div className="row g-3">
                      <div className="col-12 col-md-6">
                        <div className="p-3 rounded bg-dark border border-dark">
                          <div className="d-flex justify-content-between text-silver small mb-1">
                            <span>Branch Quota Allocation</span>
                            <span className="fw-bold text-white">{branches.length} / {metrics.maxBranches}</span>
                          </div>
                          <div className="progress" style={{ height: '6px', background: '#21262d' }}>
                            <div
                              className="progress-bar bg-danger"
                              style={{ width: `${Math.min(100, (branches.length / metrics.maxBranches) * 100)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="col-12 col-md-6">
                        <div className="p-3 rounded bg-dark border border-dark">
                          <div className="d-flex justify-content-between text-silver small mb-1">
                            <span>Member Database Capacity</span>
                            <span className="fw-bold text-white">{members.length} / {metrics.maxMembers}</span>
                          </div>
                          <div className="progress" style={{ height: '6px', background: '#21262d' }}>
                            <div
                              className="progress-bar bg-success"
                              style={{ width: `${Math.min(100, (members.length / metrics.maxMembers) * 100)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-12 col-lg-4 d-flex flex-column align-items-lg-end justify-content-center">
                    <Link
                      to="/select-plan"
                      className="btn-red px-4 py-2 d-flex align-items-center gap-2 text-decoration-none"
                    >
                      <Sparkles size={16} />
                      <span>Upgrade / Switch SaaS Tier</span>
                      <ArrowRight size={16} />
                    </Link>
                    <span className="text-muted small mt-2">Prorated billing • Instant upgrade</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =================== TAB 6: SETTINGS =================== */}
          {activeTab === 'Settings' && (
            <div className="row g-4">
              <div className="col-12 col-lg-8">
                <div className="content-card">
                  <div className="card-header-clean">
                    <div>
                      <h3 className="card-title">Gym Profile & Franchise Settings</h3>
                      <p className="text-muted" style={{ fontSize: '0.82rem' }}>Configure primary gym brand, contacts, and headquarters</p>
                    </div>
                  </div>

                  <form onSubmit={handleSaveGymProfile}>
                    <div className="row g-3">
                      <div className="col-12 col-md-6">
                        <label className="label-athletic">Gym / Franchise Name *</label>
                        <input
                          type="text"
                          className="input-athletic"
                          style={{ paddingLeft: '14px' }}
                          value={gymForm.name}
                          onChange={(e) => setGymForm({ ...gymForm, name: e.target.value })}
                          required
                        />
                      </div>
                      <div className="col-12 col-md-6">
                        <label className="label-athletic">Official Email *</label>
                        <input
                          type="email"
                          className="input-athletic"
                          style={{ paddingLeft: '14px' }}
                          value={gymForm.email}
                          onChange={(e) => setGymForm({ ...gymForm, email: e.target.value })}
                          required
                        />
                      </div>
                      <div className="col-12 col-md-6">
                        <label className="label-athletic">Official Gym Phone</label>
                        <input
                          type="text"
                          className="input-athletic"
                          style={{ paddingLeft: '14px' }}
                          value={gymForm.phone}
                          onChange={(e) => setGymForm({ ...gymForm, phone: e.target.value })}
                        />
                      </div>
                      <div className="col-12 col-md-6">
                        <label className="label-athletic">Gym Logo URL / Path</label>
                        <input
                          type="text"
                          className="input-athletic"
                          style={{ paddingLeft: '14px' }}
                          placeholder="e.g. /ro-logo.svg"
                          value={gymForm.logo || ''}
                          onChange={(e) => setGymForm({ ...gymForm, logo: e.target.value })}
                        />
                      </div>
                      <div className="col-12 col-md-4">
                        <label className="label-athletic">City</label>
                        <input
                          type="text"
                          className="input-athletic"
                          style={{ paddingLeft: '14px' }}
                          value={gymForm.city}
                          onChange={(e) => setGymForm({ ...gymForm, city: e.target.value })}
                        />
                      </div>
                      <div className="col-12 col-md-4">
                        <label className="label-athletic">State</label>
                        <input
                          type="text"
                          className="input-athletic"
                          style={{ paddingLeft: '14px' }}
                          value={gymForm.state || ''}
                          onChange={(e) => setGymForm({ ...gymForm, state: e.target.value })}
                        />
                      </div>
                      <div className="col-12 col-md-4">
                        <label className="label-athletic">Pincode</label>
                        <input
                          type="text"
                          className="input-athletic"
                          style={{ paddingLeft: '14px' }}
                          value={gymForm.pincode || ''}
                          onChange={(e) => setGymForm({ ...gymForm, pincode: e.target.value })}
                        />
                      </div>
                      <div className="col-12">
                        <label className="label-athletic">Headquarters Address</label>
                        <input
                          type="text"
                          className="input-athletic"
                          style={{ paddingLeft: '14px' }}
                          value={gymForm.address}
                          onChange={(e) => setGymForm({ ...gymForm, address: e.target.value })}
                        />
                      </div>
                      <div className="col-12 col-md-6">
                        <label className="label-athletic">Owner Full Name</label>
                        <input
                          type="text"
                          className="input-athletic"
                          style={{ paddingLeft: '14px' }}
                          value={gymForm.ownerName || ''}
                          onChange={(e) => setGymForm({ ...gymForm, ownerName: e.target.value })}
                        />
                      </div>
                      <div className="col-12 col-md-6">
                        <label className="label-athletic">Owner Mobile Contact</label>
                        <input
                          type="text"
                          className="input-athletic"
                          style={{ paddingLeft: '14px' }}
                          value={gymForm.ownerPhone || ''}
                          onChange={(e) => setGymForm({ ...gymForm, ownerPhone: e.target.value })}
                        />
                      </div>
                      <div className="col-12 mt-4">
                        <button type="submit" className="btn-red">
                          <span>Save Franchise Settings</span>
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>

              <div className="col-12 col-lg-4">
                <div className="content-card">
                  <div className="card-header-clean">
                    <h3 className="card-title">SaaS Subscription</h3>
                  </div>
                  <div className="info-grid-list">
                    <div className="info-item">
                      <span className="info-label">Current Plan</span>
                      <span className="info-value text-red">{gymProfile?.planName || 'Franchise Growth Pro'}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Branches Allocated</span>
                      <span className="info-value">{branches.length} / {metrics.maxBranches}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Members Capacity</span>
                      <span className="info-value">{members.length} / {metrics.maxMembers}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">RFID Telemetry</span>
                      <span className="badge badge-success">Enabled</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* =================== MODAL: ADD / EDIT BRANCH =================== */}
      {showBranchModal && (
        <div className="custom-modal-backdrop" onClick={() => setShowBranchModal(false)}>
          <div className="custom-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom border-dark">
              <h3 className="font-hero fs-4 text-white m-0">
                {editingBranch ? 'Edit Gym Branch' : 'Add New Gym Branch'}
              </h3>
              <button className="btn text-white p-1" onClick={() => setShowBranchModal(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveBranch}>
              <div className="row g-3">
                <div className="col-12">
                  <label className="label-athletic">Branch Name *</label>
                  <input
                    type="text"
                    className="input-athletic"
                    style={{ paddingLeft: '14px' }}
                    placeholder="e.g. RK Prajapati Downtown Arena"
                    value={branchForm.name}
                    onChange={(e) => setBranchForm({ ...branchForm, name: e.target.value })}
                    required
                  />
                </div>
                <div className="col-12 col-md-6">
                  <label className="label-athletic">City *</label>
                  <input
                    type="text"
                    className="input-athletic"
                    style={{ paddingLeft: '14px' }}
                    value={branchForm.city}
                    onChange={(e) => setBranchForm({ ...branchForm, city: e.target.value })}
                    required
                  />
                </div>
                <div className="col-12 col-md-6">
                  <label className="label-athletic">State</label>
                  <input
                    type="text"
                    className="input-athletic"
                    style={{ paddingLeft: '14px' }}
                    value={branchForm.state}
                    onChange={(e) => setBranchForm({ ...branchForm, state: e.target.value })}
                  />
                </div>
                <div className="col-12">
                  <label className="label-athletic">Address</label>
                  <input
                    type="text"
                    className="input-athletic"
                    style={{ paddingLeft: '14px' }}
                    placeholder="Street, Building, Floor"
                    value={branchForm.address}
                    onChange={(e) => setBranchForm({ ...branchForm, address: e.target.value })}
                  />
                </div>
                <div className="col-12 col-md-6">
                  <label className="label-athletic">Contact Phone</label>
                  <input
                    type="text"
                    className="input-athletic"
                    style={{ paddingLeft: '14px' }}
                    placeholder="+91 98765 43210"
                    value={branchForm.phone}
                    onChange={(e) => setBranchForm({ ...branchForm, phone: e.target.value })}
                  />
                </div>
                <div className="col-12 col-md-6">
                  <label className="label-athletic">Branch Manager</label>
                  <select
                    className="input-athletic"
                    style={{ paddingLeft: '14px' }}
                    value={branchForm.managerId}
                    onChange={(e) => setBranchForm({ ...branchForm, managerId: e.target.value })}
                  >
                    <option value="">Unassigned</option>
                    {managers.map((m) => (
                      <option key={m._id} value={m._id}>
                        {m.name} ({m.email})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-6 col-md-6">
                  <label className="label-athletic">Opening Hours</label>
                  <input
                    type="text"
                    className="input-athletic"
                    style={{ paddingLeft: '14px' }}
                    value={branchForm.openingTime}
                    onChange={(e) => setBranchForm({ ...branchForm, openingTime: e.target.value })}
                  />
                </div>
                <div className="col-6 col-md-6">
                  <label className="label-athletic">Closing Hours</label>
                  <input
                    type="text"
                    className="input-athletic"
                    style={{ paddingLeft: '14px' }}
                    value={branchForm.closingTime}
                    onChange={(e) => setBranchForm({ ...branchForm, closingTime: e.target.value })}
                  />
                </div>

                <div className="col-12 mt-4 d-flex justify-content-end gap-2">
                  <button type="button" className="btn btn-secondary-sm" onClick={() => setShowBranchModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-red">
                    <span>{editingBranch ? 'Update Branch' : 'Create Branch'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =================== MODAL: CREATE / EDIT BRANCH MANAGER =================== */}
      {showManagerModal && (
        <div className="custom-modal-backdrop" onClick={() => setShowManagerModal(false)}>
          <div className="custom-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom border-dark">
              <h3 className="font-hero fs-4 text-white m-0">
                {editingManager ? 'Edit Branch Manager' : 'Create Branch Manager'}
              </h3>
              <button className="btn text-white p-1" onClick={() => setShowManagerModal(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveManager}>
              <div className="row g-3">
                <div className="col-12">
                  <label className="label-athletic">Full Name *</label>
                  <input
                    type="text"
                    className="input-athletic"
                    style={{ paddingLeft: '14px' }}
                    placeholder="e.g. Ramesh Prajapati"
                    value={managerForm.name}
                    onChange={(e) => setManagerForm({ ...managerForm, name: e.target.value })}
                    required
                  />
                </div>
                <div className="col-12 col-md-6">
                  <label className="label-athletic">Manager Email *</label>
                  <input
                    type="email"
                    className="input-athletic"
                    style={{ paddingLeft: '14px' }}
                    placeholder="manager@gym.com"
                    value={managerForm.email}
                    onChange={(e) => setManagerForm({ ...managerForm, email: e.target.value })}
                    required
                  />
                </div>
                <div className="col-12 col-md-6">
                  <label className="label-athletic">Phone Number</label>
                  <input
                    type="text"
                    className="input-athletic"
                    style={{ paddingLeft: '14px' }}
                    placeholder="+91 98765 00000"
                    value={managerForm.phone}
                    onChange={(e) => setManagerForm({ ...managerForm, phone: e.target.value })}
                  />
                </div>
                <div className="col-12">
                  <label className="label-athletic">
                    {editingManager ? 'New Password (leave blank to keep current)' : 'Login Password *'}
                  </label>
                  <input
                    type="password"
                    className="input-athletic"
                    style={{ paddingLeft: '14px' }}
                    placeholder="Minimum 6 characters"
                    value={managerForm.password}
                    onChange={(e) => setManagerForm({ ...managerForm, password: e.target.value })}
                    required={!editingManager}
                  />
                </div>
                <div className="col-12">
                  <label className="label-athletic">Assign Gym Branch</label>
                  <select
                    className="input-athletic"
                    style={{ paddingLeft: '14px' }}
                    value={managerForm.branchId}
                    onChange={(e) => setManagerForm({ ...managerForm, branchId: e.target.value })}
                  >
                    <option value="">All Branches</option>
                    {branches.map((b) => (
                      <option key={b._id} value={b._id}>
                        {b.name} ({b.city})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-12 mt-4 d-flex justify-content-end gap-2">
                  <button type="button" className="btn btn-secondary-sm" onClick={() => setShowManagerModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-red">
                    <span>{editingManager ? 'Update Manager' : 'Create Manager Account'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =================== MODAL: REGISTER / EDIT MEMBER =================== */}
      {showMemberModal && (
        <div className="custom-modal-backdrop" onClick={() => setShowMemberModal(false)}>
          <div className="custom-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom border-dark">
              <h3 className="font-hero fs-4 text-white m-0">
                {editingMember ? 'Edit Member Details' : 'Register New Gym Member'}
              </h3>
              <button className="btn text-white p-1" onClick={() => setShowMemberModal(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveMember}>
              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <label className="label-athletic">Member Full Name *</label>
                  <input
                    type="text"
                    className="input-athletic"
                    style={{ paddingLeft: '14px' }}
                    placeholder="e.g. Rahul Sharma"
                    value={memberForm.name}
                    onChange={(e) => setMemberForm({ ...memberForm, name: e.target.value })}
                    required
                  />
                </div>
                <div className="col-12 col-md-6">
                  <label className="label-athletic">Phone Number *</label>
                  <input
                    type="text"
                    className="input-athletic"
                    style={{ paddingLeft: '14px' }}
                    placeholder="+91 99887 76655"
                    value={memberForm.phone}
                    onChange={(e) => setMemberForm({ ...memberForm, phone: e.target.value })}
                    required
                  />
                </div>
                <div className="col-12 col-md-6">
                  <label className="label-athletic">Email Address</label>
                  <input
                    type="email"
                    className="input-athletic"
                    style={{ paddingLeft: '14px' }}
                    placeholder="athlete@gym.com"
                    value={memberForm.email}
                    onChange={(e) => setMemberForm({ ...memberForm, email: e.target.value })}
                  />
                </div>
                <div className="col-12 col-md-6">
                  <label className="label-athletic">Gender</label>
                  <select
                    className="input-athletic"
                    style={{ paddingLeft: '14px' }}
                    value={memberForm.gender}
                    onChange={(e) => setMemberForm({ ...memberForm, gender: e.target.value })}
                  >
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <div className="col-12 col-md-6">
                  <label className="label-athletic">Select Branch *</label>
                  <select
                    className="input-athletic"
                    style={{ paddingLeft: '14px' }}
                    value={memberForm.branchId}
                    onChange={(e) => setMemberForm({ ...memberForm, branchId: e.target.value })}
                    required
                  >
                    <option value="">Choose Branch</option>
                    {branches.map((b) => (
                      <option key={b._id} value={b._id}>
                        {b.name} ({b.city})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-12 col-md-6">
                  <label className="label-athletic">Membership Plan</label>
                  <select
                    className="input-athletic"
                    style={{ paddingLeft: '14px' }}
                    value={memberForm.planType}
                    onChange={(e) => {
                      const selectedType = e.target.value;
                      const matched = gymPlans.find(
                        (p) => p.type === selectedType || p.id === selectedType || p.name === selectedType
                      );
                      setMemberForm({
                        ...memberForm,
                        planType: selectedType,
                        amountPaid: matched ? matched.price : memberForm.amountPaid,
                        durationDays: matched ? matched.durationDays : memberForm.durationDays,
                      });
                    }}
                  >
                    {gymPlans
                      .filter((p) => p.isActive)
                      .map((p) => (
                        <option key={p.id} value={p.type}>
                          {p.name} (${p.price} / {p.durationDays}d)
                        </option>
                      ))}
                  </select>
                </div>
                <div className="col-12 col-md-6">
                  <label className="label-athletic">Amount Paid ($)</label>
                  <input
                    type="number"
                    className="input-athletic"
                    style={{ paddingLeft: '14px' }}
                    value={memberForm.amountPaid}
                    onChange={(e) => setMemberForm({ ...memberForm, amountPaid: e.target.value })}
                  />
                </div>
                <div className="col-12 col-md-6">
                  <label className="label-athletic">RFID Turnstile Tag Key</label>
                  <input
                    type="text"
                    className="input-athletic"
                    style={{ paddingLeft: '14px' }}
                    value={memberForm.rfidTag}
                    onChange={(e) => setMemberForm({ ...memberForm, rfidTag: e.target.value })}
                  />
                </div>

                <div className="col-12 mt-4 d-flex justify-content-end gap-2">
                  <button type="button" className="btn btn-secondary-sm" onClick={() => setShowMemberModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-red">
                    <span>{editingMember ? 'Update Member' : 'Register Member'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =================== MODAL: CREATE / EDIT MEMBERSHIP PLAN =================== */}
      {showPlanModal && (
        <div className="custom-modal-backdrop" onClick={() => setShowPlanModal(false)}>
          <div className="custom-modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '650px' }}>
            <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom border-dark">
              <div className="d-flex align-items-center gap-2">
                <Award size={22} className="text-red" />
                <h3 className="font-hero fs-4 text-white m-0">
                  {editingPlan ? 'Edit Membership Plan Tier' : 'Create New Membership Plan Tier'}
                </h3>
              </div>
              <button className="btn text-white p-1" onClick={() => setShowPlanModal(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSavePlan}>
              <div className="row g-3">
                <div className="col-12 col-md-8">
                  <label className="label-athletic">Plan Name *</label>
                  <input
                    type="text"
                    className="input-athletic"
                    style={{ paddingLeft: '14px' }}
                    placeholder="e.g. Quarterly Strength & Cardio"
                    value={planForm.name}
                    onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })}
                    required
                  />
                </div>
                <div className="col-12 col-md-4">
                  <label className="label-athletic">Plan Category / Code</label>
                  <select
                    className="input-athletic"
                    style={{ paddingLeft: '14px' }}
                    value={planForm.type}
                    onChange={(e) => setPlanForm({ ...planForm, type: e.target.value })}
                  >
                    <option value="MONTHLY">MONTHLY</option>
                    <option value="QUARTERLY">QUARTERLY</option>
                    <option value="ANNUAL">ANNUAL</option>
                    <option value="VIP_PASS">VIP_PASS</option>
                    <option value="TRIAL">TRIAL</option>
                  </select>
                </div>

                <div className="col-12 col-md-6">
                  <label className="label-athletic">Price ($) *</label>
                  <input
                    type="number"
                    className="input-athletic"
                    style={{ paddingLeft: '14px' }}
                    placeholder="e.g. 99"
                    value={planForm.price}
                    onChange={(e) => setPlanForm({ ...planForm, price: e.target.value })}
                    required
                    min="0"
                  />
                </div>
                <div className="col-12 col-md-6">
                  <label className="label-athletic">Duration (Days Validity) *</label>
                  <input
                    type="number"
                    className="input-athletic"
                    style={{ paddingLeft: '14px' }}
                    placeholder="e.g. 30, 90, 365"
                    value={planForm.durationDays}
                    onChange={(e) => setPlanForm({ ...planForm, durationDays: e.target.value })}
                    required
                    min="1"
                  />
                </div>

                <div className="col-12">
                  <label className="label-athletic">Tagline / Highlight Badge</label>
                  <input
                    type="text"
                    className="input-athletic"
                    style={{ paddingLeft: '14px' }}
                    placeholder="e.g. Most Popular, Save 20%, VIP Pass"
                    value={planForm.tagline}
                    onChange={(e) => setPlanForm({ ...planForm, tagline: e.target.value })}
                  />
                </div>

                <div className="col-12">
                  <label className="label-athletic">Short Description</label>
                  <textarea
                    className="input-athletic"
                    rows="2"
                    style={{ paddingLeft: '14px' }}
                    placeholder="Brief overview of what the member gets..."
                    value={planForm.description}
                    onChange={(e) => setPlanForm({ ...planForm, description: e.target.value })}
                  />
                </div>

                <div className="col-12">
                  <label className="label-athletic">Included Features & Perks (Comma-Separated)</label>
                  <textarea
                    className="input-athletic"
                    rows="3"
                    style={{ paddingLeft: '14px' }}
                    placeholder="e.g. All Branch Access, Locker & Shower, Free PT Session, RFID Turnstile Pass"
                    value={planForm.features}
                    onChange={(e) => setPlanForm({ ...planForm, features: e.target.value })}
                  />
                  <small className="text-muted" style={{ fontSize: '0.75rem' }}>
                    Separate multiple bullet items with commas.
                  </small>
                </div>

                <div className="col-12 d-flex align-items-center gap-4 mt-2">
                  <label className="d-flex align-items-center gap-2 text-white small cursor-pointer">
                    <input
                      type="checkbox"
                      checked={planForm.isPopular}
                      onChange={(e) => setPlanForm({ ...planForm, isPopular: e.target.checked })}
                    />
                    <span>Highlight as Featured / Most Popular</span>
                  </label>

                  <label className="d-flex align-items-center gap-2 text-white small cursor-pointer">
                    <input
                      type="checkbox"
                      checked={planForm.isActive}
                      onChange={(e) => setPlanForm({ ...planForm, isActive: e.target.checked })}
                    />
                    <span>Active for Sale</span>
                  </label>
                </div>

                <div className="col-12 mt-4 d-flex justify-content-end gap-2">
                  <button type="button" className="btn btn-secondary-sm" onClick={() => setShowPlanModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-red">
                    <span>{editingPlan ? 'Update Plan Tier' : 'Save Plan Tier'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =================== ONBOARDING MODAL: GYM BRAND & FACILITY PROFILE =================== */}
      {/* =================== OPTIONAL QUICK SPECS MODAL (2-3 FIELDS ONLY) =================== */}
      {showQuickSpecsModal && (
        <div className="custom-modal-backdrop" onClick={() => setShowQuickSpecsModal(false)} style={{ zIndex: 1100 }}>
          <div
            className="custom-modal-card"
            style={{
              maxWidth: '480px',
              border: '1px solid rgba(255, 42, 42, 0.4)',
              boxShadow: '0 0 30px rgba(0,0,0,0.8), 0 0 20px rgba(255,42,42,0.15)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom border-dark">
              <div className="d-flex align-items-center gap-2">
                <div
                  className="rounded-circle p-2 d-flex align-items-center justify-content-center"
                  style={{ background: 'rgba(255, 42, 42, 0.15)', border: '1px solid #ff2a2a' }}
                >
                  <Building2 size={20} className="text-red" />
                </div>
                <div>
                  <h3 className="font-hero fs-5 text-white m-0">Facility Specifications</h3>
                  <p className="text-muted m-0" style={{ fontSize: '0.78rem' }}>
                    2-3 operational details for passes & invoices
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="btn text-secondary p-1"
                onClick={() => setShowQuickSpecsModal(false)}
                title="Close"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveQuickSpecs}>
              <div className="row g-3">
                {/* 1. Facility Type */}
                <div className="col-12">
                  <label className="label-athletic">1. Facility / Gym Type</label>
                  <select
                    className="input-athletic"
                    style={{ paddingLeft: '14px' }}
                    value={quickSpecsForm.facilityType}
                    onChange={(e) => setQuickSpecsForm({ ...quickSpecsForm, facilityType: e.target.value })}
                  >
                    <option value="Commercial Gym & Fitness Club">Commercial Gym & Fitness Club</option>
                    <option value="CrossFit / Functional Box">CrossFit / Functional Box</option>
                    <option value="Strength & Powerlifting Gym">Strength & Powerlifting Gym</option>
                    <option value="Boutique Fitness Studio">Boutique Fitness Studio</option>
                    <option value="Personal Training Studio">Personal Training Studio</option>
                  </select>
                </div>

                {/* 2. Operating Hours */}
                <div className="col-12">
                  <label className="label-athletic">2. Facility Operating Hours</label>
                  <input
                    type="text"
                    className="input-athletic"
                    style={{ paddingLeft: '14px' }}
                    placeholder="e.g. 06:00 AM - 10:00 PM"
                    value={quickSpecsForm.operatingHours}
                    onChange={(e) => setQuickSpecsForm({ ...quickSpecsForm, operatingHours: e.target.value })}
                  />
                </div>

                {/* 3. Member Support WhatsApp / Contact */}
                <div className="col-12">
                  <label className="label-athletic">3. Member Helpdesk / Support WhatsApp</label>
                  <input
                    type="text"
                    className="input-athletic"
                    style={{ paddingLeft: '14px' }}
                    placeholder="e.g. +91 98765 43210"
                    value={quickSpecsForm.supportContact}
                    onChange={(e) => setQuickSpecsForm({ ...quickSpecsForm, supportContact: e.target.value })}
                  />
                </div>

                <div className="col-12 mt-4 d-flex justify-content-end gap-2">
                  <button
                    type="button"
                    className="btn btn-secondary-sm"
                    onClick={() => setShowQuickSpecsModal(false)}
                  >
                    Skip for Now
                  </button>
                  <button
                    type="submit"
                    className="btn-red px-3"
                    disabled={savingSpecs}
                  >
                    {savingSpecs ? (
                      <>
                        <Loader2 className="animate-spin" size={16} />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <span>Save Specs</span>
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
