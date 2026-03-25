import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DeleteAccountModal } from "../components/dashboard/DeleteAccountModal";
import { HubStatsSection } from "../components/dashboard/HubStatsSection";
import { PrivacyAccountSection } from "../components/dashboard/PrivacyAccountSection";
import { RaceHistorySection } from "../components/dashboard/RaceHistorySection";
import {
  deleteMyAccount,
  getMyAccount,
  getMyHubStats,
  getMyRaces,
  type HubStat,
  type MyAccountResponse,
  type MyRaceItem,
} from "../lib/api";
import { useAuthStore } from "../store/authStore";
import { useToastStore } from "../store/toastStore";

type Tab = "races" | "hubs" | "account";

const TABS: { id: Tab; label: string }[] = [
  { id: "races", label: "Race History" },
  { id: "hubs", label: "Hub Stats" },
  { id: "account", label: "Privacy & Account" },
];

export function DashboardPage() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isAuthLoading = useAuthStore((s) => s.isLoading);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const profile = useAuthStore((s) => s.profile);
  const addToast = useToastStore((s) => s.addToast);
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<Tab>("races");

  // Data states
  const [races, setRaces] = useState<MyRaceItem[]>([]);
  const [racesTotal, setRacesTotal] = useState(0);
  const [racesLoading, setRacesLoading] = useState(true);

  const [hubStats, setHubStats] = useState<HubStat[]>([]);
  const [hubsLoading, setHubsLoading] = useState(true);

  const [account, setAccount] = useState<MyAccountResponse | null>(null);
  const [accountLoading, setAccountLoading] = useState(true);

  // Delete modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch all data on mount once authenticated
  useEffect(() => {
    if (!isAuthenticated) return;

    const controller = new AbortController();

    setRacesLoading(true);
    getMyRaces({ limit: 200 })
      .then((res) => {
        if (controller.signal.aborted) return;
        setRaces(res.items);
        setRacesTotal(res.total);
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          addToast("Failed to load race history", "error");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setRacesLoading(false);
      });

    setHubsLoading(true);
    getMyHubStats()
      .then((res) => {
        if (controller.signal.aborted) return;
        setHubStats(res.items);
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          addToast("Failed to load hub stats", "error");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setHubsLoading(false);
      });

    setAccountLoading(true);
    getMyAccount()
      .then((res) => {
        if (controller.signal.aborted) return;
        setAccount(res);
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          addToast("Failed to load account info", "error");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setAccountLoading(false);
      });

    return () => {
      controller.abort();
    };
  }, [isAuthenticated, addToast]);

  const handleDeleteAccount = useCallback(async () => {
    setIsDeleting(true);
    try {
      await deleteMyAccount();
      addToast("Account deleted successfully.", "success");
      clearAuth();
      navigate("/");
    } catch {
      addToast("Failed to delete account. Please try again.", "error");
    } finally {
      setIsDeleting(false);
      setDeleteModalOpen(false);
    }
  }, [addToast, clearAuth, navigate]);

  // Auth gate
  if (isAuthLoading) {
    return (
      <main className="layout mx-auto max-w-7xl px-6">
        <div className="dashboard-shell">
          <div className="dashboard-loading">Loading...</div>
        </div>
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className="layout mx-auto max-w-7xl px-6">
        <div className="dashboard-shell">
          <div className="dashboard-gate">
            <h1>Dashboard</h1>
            <p>Sign in to view your dashboard, race history, and stats.</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="layout mx-auto max-w-7xl px-6">
      <div className="dashboard-shell">
        <header className="dashboard-header">
          <h1>Dashboard</h1>
          {profile ? (
            <p className="dashboard-welcome">
              Welcome,{" "}
              <strong>{profile.displayName || profile.username}</strong>
            </p>
          ) : null}
        </header>

        <nav
          className="dashboard-tabs"
          role="tablist"
          aria-label="Dashboard sections"
        >
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              className={
                activeTab === tab.id
                  ? "dashboard-tab is-active"
                  : "dashboard-tab"
              }
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="dashboard-content" role="tabpanel">
          {activeTab === "races" ? (
            <RaceHistorySection
              races={races}
              total={racesTotal}
              loading={racesLoading}
            />
          ) : null}

          {activeTab === "hubs" ? (
            <HubStatsSection stats={hubStats} loading={hubsLoading} />
          ) : null}

          {activeTab === "account" ? (
            <PrivacyAccountSection
              account={account}
              loading={accountLoading}
              onDeleteClick={() => setDeleteModalOpen(true)}
            />
          ) : null}
        </div>
      </div>

      <DeleteAccountModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteAccount}
        isDeleting={isDeleting}
      />
    </main>
  );
}
