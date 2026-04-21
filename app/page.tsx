"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard-layout";
import { DashboardOverview } from "@/components/dashboard-overview";
import { StudentProfile } from "@/components/student-profile";
import { LifestylePreferences } from "@/components/lifestyle-preferences";
import { BrowseWGs } from "@/components/browse-wgs";
import { ApplicationsTracker } from "@/components/applications-tracker";
import { StudentMessages } from "@/components/student-messages";
import { LandlordLayout } from "@/components/landlord-layout";
import { LandlordOverview } from "@/components/landlord-overview";
import { LandlordListing } from "@/components/landlord-listing";
import { LandlordHousemates } from "@/components/landlord-housemates";
import { LandlordApplications } from "@/components/landlord-applications";
import { LandlordMessages } from "@/components/landlord-messages";
import {
  clearStoredAuthUser,
  getStoredAuthUser,
  getUiRoleFromAuthUser,
  setStoredAuthUser,
} from "@/lib/session";
import { useAppDispatch } from "@/store/hooks";
import {
  clearCurrentUser,
  setCurrentUserFromSession,
} from "@/store/auth-slice";

export default function Page() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [mounted, setMounted] = useState(false);
  const [role, setRole] = useState<"student" | "landlord">("student");
  const [studentTab, setStudentTab] = useState("dashboard");
  const [landlordTab, setLandlordTab] = useState("ll-overview");
  const [switchingRole, setSwitchingRole] = useState(false);

  useEffect(() => {
    setMounted(true);

    const storedUser = getStoredAuthUser();
    const nextRole = getUiRoleFromAuthUser(storedUser);

    if (!storedUser || !nextRole) {
      router.replace("/auth");
      return;
    }

    setRole(nextRole);
  }, [router]);

  const handleSignOut = () => {
    clearStoredAuthUser();
    dispatch(clearCurrentUser());
    router.replace("/auth");
  };

  const updateActiveRole = async (targetRole: "STUDENT" | "RESIDENT") => {
    const storedUser = getStoredAuthUser();
    if (!storedUser) {
      router.replace("/auth");
      return;
    }

    setSwitchingRole(true);

    try {
      const response = await fetch("/api/auth/active-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: storedUser.id, activeRole: targetRole }),
      });

      const result = await response.json();

      if (!response.ok) {
        window.alert(result.error || "Unable to switch role right now.");
        return;
      }

      setStoredAuthUser({
        ...storedUser,
        activeRole: result.activeRole,
        capabilities: result.capabilities,
      });

      dispatch(
        setCurrentUserFromSession({
          ...storedUser,
          activeRole: result.activeRole,
          capabilities: result.capabilities,
        }),
      );

      setRole(result.activeRole === "RESIDENT" ? "landlord" : "student");
    } catch {
      window.alert("Unable to switch role right now.");
    } finally {
      setSwitchingRole(false);
    }
  };

  if (!mounted) {
    return null;
  }

  if (role === "landlord") {
    return (
      <LandlordLayout
        activeTab={landlordTab}
        onTabChange={setLandlordTab}
        onSwitchRole={() => {
          if (!switchingRole) {
            void updateActiveRole("STUDENT");
          }
        }}
        onSignOut={handleSignOut}
      >
        {landlordTab === "ll-overview" && (
          <LandlordOverview onNavigate={setLandlordTab} />
        )}
        {landlordTab === "ll-listing" && <LandlordListing />}
        {landlordTab === "ll-housemates" && <LandlordHousemates />}
        {landlordTab === "ll-applications" && (
          <LandlordApplications
            onNavigateMessages={() => setLandlordTab("ll-messages")}
          />
        )}
        {landlordTab === "ll-messages" && <LandlordMessages />}
      </LandlordLayout>
    );
  }

  return (
    <DashboardLayout
      activeTab={studentTab}
      onTabChange={setStudentTab}
      onSwitchRole={() => {
        if (!switchingRole) {
          void updateActiveRole("RESIDENT");
        }
      }}
      onRegisterWg={() => {
        if (!switchingRole) {
          setLandlordTab("ll-housemates");
          void updateActiveRole("RESIDENT");
        }
      }}
      onSignOut={handleSignOut}
    >
      {studentTab === "dashboard" && (
        <DashboardOverview onNavigate={setStudentTab} />
      )}
      {studentTab === "profile" && <StudentProfile />}
      {studentTab === "preferences" && <LifestylePreferences />}
      {studentTab === "browse" && <BrowseWGs />}
      {studentTab === "applications" && (
        <ApplicationsTracker
          onNavigateMessages={() => setStudentTab("messages")}
        />
      )}
      {studentTab === "messages" && <StudentMessages />}
    </DashboardLayout>
  );
}
