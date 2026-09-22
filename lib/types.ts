export type RiskLevel = "Low" | "Medium" | "High" | "Critical";
export type RiskStatus = "Open" | "In Progress" | "Under Review" | "Closed";
export type Treatment = "Accept" | "Mitigate" | "Transfer" | "Avoid";

export interface TreatmentAction {
  id: string;
  title: string;
  owner: string;
  dueDate: string;
  status: "Not Started" | "In Progress" | "Completed";
}

export interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  detail?: string;
  actor?: string;
}

export interface Risk {
  id: string;
  title: string;
  description: string;
  category: string;
  department: string;
  owner: string;
  likelihood: number;
  impact: number;
  residualLikelihood: number;
  residualImpact: number;
  level: RiskLevel;
  treatment: Treatment;
  treatmentOwner: string;
  status: RiskStatus;
  dateIdentified: string;
  lastReviewed: string;
  reviewDate: string;
  appetite: string;
  treatmentPlan: TreatmentAction[];
  timeline: TimelineEvent[];
  linkedControls: string[];
  linkedVendors: string[];
  linkedIncidents: string[];
}

export type ControlStatus =
  | "Compliant"
  | "Partial"
  | "Non-Compliant"
  | "Not Assessed";

export interface EvidenceFile {
  name: string;
  uploadedBy: string;
  date: string;
}

export interface Control {
  id: string;
  frameworkId: string;
  area: string;
  title: string;
  description: string;
  owner: string;
  status: ControlStatus;
  evidence: EvidenceFile[];
  notes: string[];
  lastReviewed: string;
  nextReview: string;
}

export interface Framework {
  id: string;
  name: string;
  shortName: string;
  description: string;
  areas: string[];
}

export type VendorRiskLevel = "Low" | "Medium" | "High";

export interface VendorCategoryScore {
  category: string;
  score: number;
}

export interface Vendor {
  id: string;
  name: string;
  service: string;
  businessOwner: string;
  score: number;
  level: VendorRiskLevel;
  assessmentStatus:
    | "Completed"
    | "In Progress"
    | "Pending Review"
    | "Not Started"
    | "Expiring Soon";
  nextReview: string;
  lastAssessment: string;
  contractRenewal: string;
  criticality: "Low" | "Medium" | "High" | "Critical";
  dataAccess: string;
  certifications: string[];
  categoryScores: VendorCategoryScore[];
  documents: EvidenceFile[];
  activity: TimelineEvent[];
  linkedRisks: string[];
}

export type IncidentSeverity = "Low" | "Medium" | "High" | "Critical";
export type IncidentStatus =
  | "Reported"
  | "Triaged"
  | "Investigating"
  | "Containment"
  | "Remediation"
  | "Resolved"
  | "Post-Incident Review";

export interface Incident {
  id: string;
  title: string;
  description: string;
  category: string;
  severity: IncidentSeverity;
  reportedBy: string;
  assignedTo: string;
  status: IncidentStatus;
  reportedDate: string;
  businessImpact: string;
  systemsAffected: string[];
  rootCause: string;
  timeline: TimelineEvent[];
  correctiveActions: TreatmentAction[];
  linkedRisks: string[];
  attachments: EvidenceFile[];
}

export interface Notification {
  id: string;
  message: string;
  date: string;
  href: string;
  read: boolean;
}

export interface ActivityItem {
  id: string;
  message: string;
  date: string;
  href: string;
}

export interface AssessmentQuestion {
  id: string;
  section: string;
  text: string;
  mappedControl?: string;
}
