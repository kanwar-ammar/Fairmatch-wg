"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { DashboardOverview } from "@/components/dashboard-overview"
import { StudentProfile } from "@/components/student-profile"
import { LifestylePreferences } from "@/components/lifestyle-preferences"
import { BrowseWGs } from "@/components/browse-wgs"
import { ApplicationsTracker } from "@/components/applications-tracker"
import { LandlordLayout } from "@/components/landlord-layout"
import { LandlordOverview } from "@/components/landlord-overview"
import { LandlordListing } from "@/components/landlord-listing"
import { LandlordHousemates } from "@/components/landlord-housemates"
import { LandlordApplications } from "@/components/landlord-applications"
import { LandlordInterviews } from "@/components/landlord-interviews"

export default function Page() {
  const [role, setRole] = useState<"student" | "landlord">("student")
  const [studentTab, setStudentTab] = useState("dashboard")
  const [landlordTab, setLandlordTab] = useState("ll-overview")

  if (role === "landlord") {
    return (
      <LandlordLayout
        activeTab={landlordTab}
        onTabChange={setLandlordTab}
        onSwitchRole={() => setRole("student")}
      >
        {landlordTab === "ll-overview" && <LandlordOverview onNavigate={setLandlordTab} />}
        {landlordTab === "ll-listing" && <LandlordListing />}
        {landlordTab === "ll-housemates" && <LandlordHousemates />}
        {landlordTab === "ll-applications" && (
          <LandlordApplications onNavigateInterviews={() => setLandlordTab("ll-interviews")} />
        )}
        {landlordTab === "ll-interviews" && <LandlordInterviews />}
      </LandlordLayout>
    )
  }

  return (
    <DashboardLayout activeTab={studentTab} onTabChange={setStudentTab} onSwitchRole={() => setRole("landlord")}>
      {studentTab === "dashboard" && <DashboardOverview onNavigate={setStudentTab} />}
      {studentTab === "profile" && <StudentProfile />}
      {studentTab === "preferences" && <LifestylePreferences />}
      {studentTab === "browse" && <BrowseWGs />}
      {studentTab === "applications" && <ApplicationsTracker />}
    </DashboardLayout>
  )
}
