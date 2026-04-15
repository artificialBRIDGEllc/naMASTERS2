import { useState, useEffect } from "react";
import { Layout } from "@/components/layout";
import { motion, AnimatePresence } from "framer-motion";
import { Settings, Plus, Trash2, Save, TestTube, CheckCircle2, AlertCircle, Loader2, ChevronDown, ChevronUp, Phone, Search, RefreshCw, Eye, EyeOff, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getTwilioConfig, saveTwilioCredentials, searchAvailableNumbers, provisionPhoneNumber, resetOnboarding, getGetMeQueryKey } from "@workspace/api-client-react";

const BASE = import.meta.env.BASE_URL || "/";

interface CrmConfig {
  id: string;
  name: string;
  crmType: string;
  mode: string;
  isActive: boolean;
  apiBaseUrl: string | null;
  apiKey: string | null;
  apiSecret: string | null;
  locationId: string | null;
  accessToken: string | null;
  refreshToken: string | null;
  instanceUrl: string | null;
  customHeaders: Record<string, string> | null;
  authType: string | null;
}

interface FieldMapping {
  internalField: string;
  crmField: string;
  crmFieldLabel: string;
  cssSelector: string;
  fieldType: string;
  isRequired: boolean;
}

const CRM_TYPES = [
  { value: "GOHIGHLEVEL", label: "GoHighLevel" },
  { value: "SALESFORCE", label: "Salesforce" },
  { value: "HUBSPOT", label: "HubSpot" },
  { value: "CUSTOM_REST", label: "Custom REST API" },
];

const INTERNAL_FIELDS = [
  "currentCarrier", "currentPlan", "planInterest", "medicareId",
  "dateOfBirth", "objections", "callbackPreference", "budgetRange",
  "medications", "providers", "healthConditions", "county",
  "state", "zipCode", "spouseInfo", "enrollmentPeriod", "additionalNotes",
];

const DEFAULT_GHL_MAPPINGS: FieldMapping[] = [
  { internalField: "currentCarrier", crmField: "current_carrier", crmFieldLabel: "Current Carrier", cssSelector: "", fieldType: "text", isRequired: false },
  { internalField: "planInterest", crmField: "plan_interest", crmFieldLabel: "Plan Interest", cssSelector: "", fieldType: "text", isRequired: false },
  { internalField: "medicareId", crmField: "medicare_id", crmFieldLabel: "Medicare ID", cssSelector: "", fieldType: "text", isRequired: false },
  { internalField: "callbackPreference", crmField: "callback_preference", crmFieldLabel: "Callback Preference", cssSelector: "", fieldType: "text", isRequired: false },
];

export default function SettingsPage() {
  const [configs, setConfigs] = useState<CrmConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<CrmConfig>>({});
  const [mappings, setMappings] = useState<FieldMapping[]>([]);
  const [showMappings, setShowMappings] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; error?: string } | null>(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => { loadConfigs(); }, []);

  async function loadConfigs() {
    setLoading(true);
    try {
      const res = await fetch(`${BASE}api/crm/configs`, { credentials: "include" });
      if (res.ok) setConfigs(await res.json());
    } catch {}
    setLoading(false);
  }

  function startCreate() {
    setCreating(true);
    setEditingId(null);
    setFormData({ name: "", crmType: "GOHIGHLEVEL", mode: "API" });
    setMappings([...DEFAULT_GHL_MAPPINGS]);
    setShowMappings(false);
    setTestResult(null);
  }

  async function startEdit(config: CrmConfig) {
    setCreating(false);
    setEditingId(config.id);
    setFormData(config);
    setTestResult(null);
    setShowMappings(false);

    try {
      const res = await fetch(`${BASE}api/crm/configs/${config.id}/mappings`, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setMappings(data.length > 0 ? data : [...DEFAULT_GHL_MAPPINGS]);
      }
    } catch {
      setMappings([...DEFAULT_GHL_MAPPINGS]);
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      const url = creating
        ? `${BASE}api/crm/configs`
        : `${BASE}api/crm/configs/${editingId}`;

      const res = await fetch(url, {
        method: creating ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        const saved = await res.json();
        const configId = creating ? saved.id : editingId;

        await fetch(`${BASE}api/crm/configs/${configId}/mappings`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ mappings }),
        });

        setCreating(false);
        setEditingId(null);
        setFormData({});
        loadConfigs();
      }
    } catch {}
    setSaving(false);
  }

  async function handleDelete(id: string) {
    try {
      await fetch(`${BASE}api/crm/configs/${id}`, { method: "DELETE", credentials: "include" });
      loadConfigs();
      if (editingId === id) { setEditingId(null); setFormData({}); }
    } catch {}
  }

  async function handleTest() {
    const configId = editingId;
    if (!configId) return;
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch(`${BASE}api/crm/configs/${configId}/test`, {
        method: "POST",
        credentials: "include",
      });
      if (res.ok) setTestResult(await res.json());
      else setTestResult({ ok: false, error: "Request failed" });
    } catch {
      setTestResult({ ok: false, error: "Network error" });
    }
    setTesting(false);
  }

  function addMapping() {
    setMappings([...mappings, {
      internalField: INTERNAL_FIELDS[0],
      crmField: "",
      crmFieldLabel: "",
      cssSelector: "",
      fieldType: "text",
      isRequired: false,
    }]);
  }

  function removeMapping(i: number) {
    setMappings(mappings.filter((_, idx) => idx !== i));
  }

  function updateMapping(i: number, field: keyof FieldMapping, value: string | boolean) {
    setMappings(prev => prev.map((m, idx) => idx === i ? { ...m, [field]: value } : m));
  }

  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isAdmin = user?.role === "ADMIN";

  const { data: twilioConfig, refetch: refetchTwilio } = useQuery({
    queryKey: ["/api/twilio/config"],
    queryFn: () => getTwilioConfig(),
  });

  const [twilioSid, setTwilioSid] = useState("");
  const [twilioToken, setTwilioToken] = useState("");
  const [showToken, setShowToken] = useState(false);
  const [savingTwilio, setSavingTwilio] = useState(false);
  const [twilioError, setTwilioError] = useState("");
  const [twilioSuccess, setTwilioSuccess] = useState("");
  const [areaCode, setAreaCode] = useState("");
  const [searchingNumbers, setSearchingNumbers] = useState(false);
  const [availableNumbers, setAvailableNumbers] = useState<Array<{ phoneNumber: string; friendlyName: string; locality?: string; region?: string }>>([]);
  const [provisioningNumber, setProvisioningNumber] = useState("");
  const [resettingTour, setResettingTour] = useState(false);

  useEffect(() => {
    if (twilioConfig?.accountSid) {
      setTwilioSid(twilioConfig.accountSid);
    }
  }, [twilioConfig?.accountSid]);

  async function handleSaveTwilio() {
    if (!twilioSid || !twilioToken) return;
    setSavingTwilio(true);
    setTwilioError("");
    setTwilioSuccess("");
    try {
      await saveTwilioCredentials({ accountSid: twilioSid, authToken: twilioToken });
      setTwilioSuccess("Twilio credentials saved and verified successfully.");
      setTwilioToken("");
      refetchTwilio();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save credentials";
      setTwilioError(msg);
    }
    setSavingTwilio(false);
  }

  async function handleSearchNumbers() {
    setSearchingNumbers(true);
    setAvailableNumbers([]);
    try {
      const nums = await searchAvailableNumbers({ areaCode: areaCode || undefined, country: "US" });
      setAvailableNumbers(nums as Array<{ phoneNumber: string; friendlyName: string; locality?: string; region?: string }>);
    } catch {
      setTwilioError("Failed to search numbers. Check your Twilio credentials.");
    }
    setSearchingNumbers(false);
  }

  async function handleProvisionNumber(phoneNumber: string) {
    setProvisioningNumber(phoneNumber);
    try {
      await provisionPhoneNumber({ phoneNumber });
      setAvailableNumbers([]);
      refetchTwilio();
      setTwilioSuccess(`Successfully provisioned ${phoneNumber}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to provision number";
      setTwilioError(msg);
    }
    setProvisioningNumber("");
  }

  async function handleResetTour() {
    setResettingTour(true);
    try {
      await resetOnboarding();
      queryClient.setQueryData(getGetMeQueryKey(), (old: Record<string, unknown> | undefined) => {
        if (!old) return old;
        return { ...old, onboardingCompleted: false };
      });
    } catch {}
    setResettingTour(false);
  }

  const isEditing = creating || editingId;
  const crmTypeFields: Record<string, string[]> = {
    GOHIGHLEVEL: ["apiKey", "locationId"],
    SALESFORCE: ["instanceUrl", "accessToken"],
    HUBSPOT: ["accessToken"],
    CUSTOM_REST: ["apiBaseUrl", "apiKey", "authType"],
  };

  const fieldLabels: Record<string, string> = {
    apiKey: "API Key",
    apiBaseUrl: "Base URL",
    locationId: "Location ID",
    instanceUrl: "Instance URL",
    accessToken: "Access Token",
    authType: "Auth Type",
  };

  return (
    <Layout>
      <div className="space-y-8 max-w-4xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold font-display text-white flex items-center gap-2">
            <Settings size={24} className="text-blue-400" style={{ filter: 'drop-shadow(0 0 4px rgba(59,130,246,0.4))' }} />
            Settings
          </h1>
          <p className="text-zinc-500 text-sm mt-1">Configure Twilio, CRM integrations, and preferences</p>
        </div>

        <div className="neu-raised rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-white/[0.04] flex items-center gap-3">
            <Phone size={18} className="text-blue-400" />
            <h2 className="text-lg font-semibold text-white">Twilio Phone Setup</h2>
          </div>
          <div className="p-6 space-y-6">
            {twilioConfig?.phoneNumber && (
              <div className="flex items-center gap-3 p-4 rounded-xl" style={{ background: 'linear-gradient(145deg, rgba(16,185,129,0.08), rgba(16,185,129,0.02))', border: '1px solid rgba(16,185,129,0.15)' }}>
                <CheckCircle2 size={18} className="text-emerald-400" />
                <div>
                  <p className="text-sm font-medium text-emerald-400">Active Phone Number</p>
                  <p className="text-lg font-mono text-white tracking-wider">{twilioConfig.phoneNumber}</p>
                </div>
              </div>
            )}

            {!twilioConfig?.phoneNumber && !twilioConfig?.hasCredentials && !isAdmin && (
              <div className="p-4 rounded-xl text-sm text-zinc-400" style={{ background: 'linear-gradient(145deg, rgba(255,255,255,0.02), rgba(0,0,0,0.05))', border: '1px solid rgba(255,255,255,0.04)' }}>
                Twilio is not configured. Contact an admin to set up phone credentials.
              </div>
            )}

            {isAdmin && (
              <>
                <div>
                  <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3">API Credentials</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Account SID</label>
                      <input
                        type="text"
                        value={twilioSid}
                        onChange={(e) => setTwilioSid(e.target.value)}
                        placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                        className="w-full px-3 py-2 rounded-xl text-sm text-white placeholder:text-zinc-600 neu-input focus:outline-none font-mono"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Auth Token</label>
                      <div className="relative">
                        <input
                          type={showToken ? "text" : "password"}
                          value={twilioToken}
                          onChange={(e) => setTwilioToken(e.target.value)}
                          placeholder="Enter auth token"
                          className="w-full px-3 py-2 pr-10 rounded-xl text-sm text-white placeholder:text-zinc-600 neu-input focus:outline-none font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => setShowToken(!showToken)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-300 transition-colors"
                        >
                          {showToken ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end mt-3">
                    <motion.button
                      onClick={handleSaveTwilio}
                      disabled={savingTwilio || !twilioSid || !twilioToken}
                      className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white neu-btn-primary flex items-center gap-2 disabled:opacity-50"
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {savingTwilio ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                      Save & Verify
                    </motion.button>
                  </div>
                </div>

                {twilioConfig?.hasCredentials && (
                  <div>
                    <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3">Provision Phone Number</h4>
                    <div className="flex gap-3">
                      <div className="flex-1 relative">
                        <input
                          type="text"
                          value={areaCode}
                          onChange={(e) => setAreaCode(e.target.value.replace(/\D/g, "").slice(0, 3))}
                          placeholder="Area code (e.g. 212)"
                          className="w-full px-3 py-2 rounded-xl text-sm text-white placeholder:text-zinc-600 neu-input focus:outline-none"
                        />
                      </div>
                      <motion.button
                        onClick={handleSearchNumbers}
                        disabled={searchingNumbers}
                        className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white neu-btn flex items-center gap-2 disabled:opacity-50"
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {searchingNumbers ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
                        Search Numbers
                      </motion.button>
                    </div>

                    {availableNumbers.length > 0 && (
                      <div className="mt-4 space-y-2">
                        {availableNumbers.map((num) => (
                          <div key={num.phoneNumber} className="flex items-center justify-between p-3 rounded-xl neu-inset">
                            <div className="flex items-center gap-3">
                              <Phone size={14} className="text-blue-400" />
                              <div>
                                <p className="text-sm font-mono text-white">{num.friendlyName}</p>
                                {(num.locality || num.region) && (
                                  <p className="text-xs text-zinc-500 flex items-center gap-1">
                                    <MapPin size={10} /> {[num.locality, num.region].filter(Boolean).join(", ")}
                                  </p>
                                )}
                              </div>
                            </div>
                            <motion.button
                              onClick={() => handleProvisionNumber(num.phoneNumber)}
                              disabled={!!provisioningNumber}
                              className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white neu-btn-primary disabled:opacity-50"
                              whileTap={{ scale: 0.95 }}
                            >
                              {provisioningNumber === num.phoneNumber ? (
                                <Loader2 size={12} className="animate-spin" />
                              ) : (
                                "Provision"
                              )}
                            </motion.button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            {twilioError && (
              <div className="p-3 rounded-xl text-sm flex items-center gap-2 text-red-400" style={{ background: 'linear-gradient(145deg, rgba(239,68,68,0.08), rgba(239,68,68,0.02))', border: '1px solid rgba(239,68,68,0.15)' }}>
                <AlertCircle size={16} /> {twilioError}
              </div>
            )}
            {twilioSuccess && (
              <div className="p-3 rounded-xl text-sm flex items-center gap-2 text-emerald-400" style={{ background: 'linear-gradient(145deg, rgba(16,185,129,0.08), rgba(16,185,129,0.02))', border: '1px solid rgba(16,185,129,0.15)' }}>
                <CheckCircle2 size={16} /> {twilioSuccess}
              </div>
            )}
          </div>
        </div>

        <div className="neu-raised rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-white/[0.04] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <RefreshCw size={18} className="text-purple-400" />
              <h2 className="text-lg font-semibold text-white">Onboarding Tour</h2>
            </div>
            <motion.button
              onClick={handleResetTour}
              disabled={resettingTour}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-white neu-btn flex items-center gap-2 disabled:opacity-50"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
            >
              {resettingTour ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
              Restart Tour
            </motion.button>
          </div>
          <div className="px-6 py-4">
            <p className="text-sm text-zinc-400">
              {user?.onboardingCompleted
                ? "You have completed the onboarding tour. Click 'Restart Tour' to see it again on the Dialer page."
                : "The onboarding tour will appear when you visit the Dialer page."}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Settings size={18} className="text-blue-400" />
              CRM Settings
            </h2>
            <p className="text-zinc-500 text-sm mt-1">Configure CRM integrations and field mappings</p>
          </div>
          <motion.button
            onClick={startCreate}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white neu-btn-primary flex items-center gap-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Plus size={16} /> Add CRM
          </motion.button>
        </div>

        {loading ? (
          <div className="neu-raised rounded-2xl p-12 flex items-center justify-center">
            <Loader2 size={24} className="text-blue-400 animate-spin" />
          </div>
        ) : (
          <div className="space-y-4">
            {configs.map((config) => (
              <motion.div
                key={config.id}
                className={cn(
                  "neu-raised rounded-2xl overflow-hidden transition-all",
                  editingId === config.id && "ring-1 ring-blue-500/30"
                )}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="px-6 py-4 flex items-center justify-between cursor-pointer" onClick={() => editingId === config.id ? setEditingId(null) : startEdit(config)}>
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-3 h-3 rounded-full",
                      config.isActive ? "bg-emerald-400" : "bg-zinc-600"
                    )} style={config.isActive ? { boxShadow: '0 0 8px rgba(16,185,129,0.5)' } : undefined} />
                    <div>
                      <p className="text-sm font-semibold text-white">{config.name}</p>
                      <p className="text-xs text-zinc-500">{CRM_TYPES.find((t) => t.value === config.crmType)?.label} — {config.mode === "API" ? "API Mode" : "Browser Automation"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <motion.button
                      onClick={(e) => { e.stopPropagation(); handleDelete(config.id); }}
                      className="p-2 text-zinc-600 hover:text-red-400 rounded-lg transition-colors"
                      whileTap={{ scale: 0.9 }}
                    >
                      <Trash2 size={16} />
                    </motion.button>
                    {editingId === config.id ? <ChevronUp size={16} className="text-zinc-500" /> : <ChevronDown size={16} className="text-zinc-500" />}
                  </div>
                </div>

                <AnimatePresence>
                  {editingId === config.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      {renderForm()}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}

            <AnimatePresence>
              {creating && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="neu-raised rounded-2xl overflow-hidden ring-1 ring-blue-500/30"
                >
                  <div className="px-6 py-4 border-b border-white/[0.04]">
                    <p className="text-sm font-semibold text-white">New CRM Connection</p>
                  </div>
                  {renderForm()}
                </motion.div>
              )}
            </AnimatePresence>

            {configs.length === 0 && !creating && (
              <div className="neu-raised rounded-2xl p-12 text-center">
                <Settings size={32} className="text-zinc-600 mx-auto mb-3" />
                <p className="text-sm text-zinc-400 mb-1">No CRM integrations configured</p>
                <p className="text-xs text-zinc-600">Click "Add CRM" to set up your first integration</p>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );

  function renderForm() {
    const typeFields = crmTypeFields[formData.crmType || "GOHIGHLEVEL"] || [];

    return (
      <div className="p-6 space-y-6 border-t border-white/[0.04]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Name</label>
            <input
              type="text"
              value={formData.name || ""}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="My CRM Connection"
              className="w-full px-3 py-2 rounded-xl text-sm text-white placeholder:text-zinc-600 neu-input focus:outline-none"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">CRM Type</label>
            <select
              value={formData.crmType || "GOHIGHLEVEL"}
              onChange={(e) => setFormData({ ...formData, crmType: e.target.value })}
              className="w-full px-3 py-2 rounded-xl text-sm text-white neu-input focus:outline-none bg-transparent"
            >
              {CRM_TYPES.map((t) => (
                <option key={t.value} value={t.value} className="bg-zinc-900">{t.label}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Mode</label>
            <select
              value={formData.mode || "API"}
              onChange={(e) => setFormData({ ...formData, mode: e.target.value })}
              className="w-full px-3 py-2 rounded-xl text-sm text-white neu-input focus:outline-none bg-transparent"
            >
              <option value="API" className="bg-zinc-900">API Mode</option>
              <option value="BROWSER_AUTOMATION" className="bg-zinc-900">Browser Automation</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Status</label>
            <select
              value={formData.isActive === false ? "false" : "true"}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.value === "true" })}
              className="w-full px-3 py-2 rounded-xl text-sm text-white neu-input focus:outline-none bg-transparent"
            >
              <option value="true" className="bg-zinc-900">Active</option>
              <option value="false" className="bg-zinc-900">Inactive</option>
            </select>
          </div>
        </div>

        {formData.mode === "API" && (
          <div>
            <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3">API Credentials</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {typeFields.map((field) => (
                <div key={field} className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">{fieldLabels[field] || field}</label>
                  {field === "authType" ? (
                    <select
                      value={(formData as Record<string, unknown>)[field] as string || "bearer"}
                      onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl text-sm text-white neu-input focus:outline-none bg-transparent"
                    >
                      <option value="bearer" className="bg-zinc-900">Bearer Token</option>
                      <option value="basic" className="bg-zinc-900">Basic Auth</option>
                      <option value="api-key" className="bg-zinc-900">API Key Header</option>
                    </select>
                  ) : (
                    <input
                      type={field.includes("key") || field.includes("token") || field.includes("secret") ? "password" : "text"}
                      value={(formData as Record<string, unknown>)[field] as string || ""}
                      onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                      placeholder={`Enter ${fieldLabels[field] || field}`}
                      className="w-full px-3 py-2 rounded-xl text-sm text-white placeholder:text-zinc-600 neu-input focus:outline-none"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <button
            onClick={() => setShowMappings(!showMappings)}
            className="flex items-center gap-2 text-xs font-bold text-zinc-500 uppercase tracking-wider hover:text-zinc-300 transition-colors"
          >
            {showMappings ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            Field Mappings ({mappings.length})
          </button>

          {showMappings && (
            <div className="mt-3 space-y-3">
              {mappings.map((m, i) => (
                <div key={i} className="neu-inset rounded-xl p-3 grid grid-cols-1 md:grid-cols-5 gap-2 items-end">
                  <div className="space-y-1">
                    <label className="text-[10px] text-zinc-600 uppercase">Internal Field</label>
                    <select
                      value={m.internalField}
                      onChange={(e) => updateMapping(i, "internalField", e.target.value)}
                      className="w-full px-2 py-1.5 rounded-lg text-xs text-white neu-input focus:outline-none bg-transparent"
                    >
                      {INTERNAL_FIELDS.map((f) => (
                        <option key={f} value={f} className="bg-zinc-900">{f}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-zinc-600 uppercase">CRM Field</label>
                    <input
                      type="text"
                      value={m.crmField}
                      onChange={(e) => updateMapping(i, "crmField", e.target.value)}
                      placeholder="crm_field_name"
                      className="w-full px-2 py-1.5 rounded-lg text-xs text-white placeholder:text-zinc-700 neu-input focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-zinc-600 uppercase">Label</label>
                    <input
                      type="text"
                      value={m.crmFieldLabel}
                      onChange={(e) => updateMapping(i, "crmFieldLabel", e.target.value)}
                      placeholder="Display Label"
                      className="w-full px-2 py-1.5 rounded-lg text-xs text-white placeholder:text-zinc-700 neu-input focus:outline-none"
                    />
                  </div>
                  {formData.mode === "BROWSER_AUTOMATION" && (
                    <div className="space-y-1">
                      <label className="text-[10px] text-zinc-600 uppercase">CSS Selector</label>
                      <input
                        type="text"
                        value={m.cssSelector}
                        onChange={(e) => updateMapping(i, "cssSelector", e.target.value)}
                        placeholder="#field-id"
                        className="w-full px-2 py-1.5 rounded-lg text-xs text-white placeholder:text-zinc-700 neu-input focus:outline-none"
                      />
                    </div>
                  )}
                  <div className="flex items-end">
                    <motion.button
                      onClick={() => removeMapping(i)}
                      className="p-1.5 text-zinc-600 hover:text-red-400 rounded-lg transition-colors"
                      whileTap={{ scale: 0.9 }}
                    >
                      <Trash2 size={14} />
                    </motion.button>
                  </div>
                </div>
              ))}
              <motion.button
                onClick={addMapping}
                className="px-3 py-2 rounded-xl text-xs font-medium text-zinc-400 neu-btn flex items-center gap-1.5 w-full justify-center"
                whileTap={{ scale: 0.98 }}
              >
                <Plus size={14} /> Add Field Mapping
              </motion.button>
            </div>
          )}
        </div>

        {testResult && (
          <div className={cn(
            "p-3 rounded-xl text-sm flex items-center gap-2",
            testResult.ok ? "text-emerald-400" : "text-red-400"
          )}
          style={{
            background: testResult.ok
              ? 'linear-gradient(145deg, rgba(16,185,129,0.08), rgba(16,185,129,0.02))'
              : 'linear-gradient(145deg, rgba(239,68,68,0.08), rgba(239,68,68,0.02))',
            border: testResult.ok
              ? '1px solid rgba(16,185,129,0.15)'
              : '1px solid rgba(239,68,68,0.15)',
          }}>
            {testResult.ok ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            {testResult.ok ? "Connection successful" : testResult.error || "Connection failed"}
          </div>
        )}

        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-white/[0.04]">
          <motion.button
            onClick={() => { setCreating(false); setEditingId(null); setFormData({}); }}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-zinc-400 neu-btn"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
          >
            Cancel
          </motion.button>
          {!creating && editingId && (
            <motion.button
              onClick={handleTest}
              disabled={testing}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white neu-btn flex items-center gap-2 disabled:opacity-50"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
            >
              {testing ? <Loader2 size={14} className="animate-spin" /> : <TestTube size={14} />}
              Test Connection
            </motion.button>
          )}
          <motion.button
            onClick={handleSave}
            disabled={saving || !formData.name}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white neu-btn-primary flex items-center gap-2 disabled:opacity-50"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            {creating ? "Create" : "Save Changes"}
          </motion.button>
        </div>
      </div>
    );
  }
}
