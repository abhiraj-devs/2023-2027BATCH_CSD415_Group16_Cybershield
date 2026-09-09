import React from "react";
import { Joyride, Step } from "react-joyride";

const steps: any[] = [
  {
    target: "#app-header",
    content: "Welcome to CyberShield! This is your control center header.",
    disableBeacon: true,
  },
  {
    target: "#sidebar-toggle",
    content: "Use this to toggle the sidebar navigation.",
  },
  {
    target: "#dashboard-stats",
    content: "Get a quick overview of your security status and threat metrics here.",
  },
];

export default function GuidedTour({ run }: { run: boolean }) {
  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
    />
  );
}
