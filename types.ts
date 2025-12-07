export enum CaseType {
  BEHAVIOR = 'مخالفة قواعد تنظيم السلوك والمواظبة',
  LOW_PERFORMANCE = 'انخفاض المستوى التدريبي',
  LEARNING_DIFFICULTIES = 'صعوبات تعلم',
  ABSENCE_HIGH = 'ارتفاع نسبة الغياب في المقرر',
  BAN = 'حرمان في المقرر',
  EXAM_ABSENCE = 'غياب في الاختبار الفصلي',
  OTHER = 'غير ذلك'
}

export enum Repetition {
  FIRST = 'المرة الأولى',
  SECOND = 'المرة الثانية',
  FREQUENT = 'دائم التكرار'
}

export enum UserRole {
  TRAINER = 'المدرب',
  HOD = 'رئيس القسم',
  COUNSELOR = 'المرشد التدريبي'
}

export enum ReferralStatus {
  PENDING_HOD = 'بانتظار رئيس القسم',
  PENDING_COUNSELOR = 'بانتظار المرشد',
  RETURNED_TO_HOD = 'عاد لرئيس القسم',
  RESOLVED = 'تم الحل',
  TO_STUDENT_AFFAIRS = 'محال لشؤون المتدربين'
}

export interface TimelineEvent {
  id: string;
  date: string;
  role: UserRole;
  actorName: string;
  action: string;
  comment?: string;
}

export interface Trainee {
  id: string;
  name: string;
  trainingNumber: string;
  department: string;
  specialization: string;
}

export interface Staff {
  id: string;
  name: string;
  username: string; // Used for login (Phone number usually)
  password?: string;
  role: UserRole;
  specialization?: string; // Important for HoD routing
  isCounselor?: boolean; // A flag to designate a trainer as a counselor
}

export interface Referral {
  id: string;
  traineeId: string;
  traineeName: string; 
  trainingNumber: string;
  department: string;
  specialization: string; // Added to route to correct HoD
  date: string;
  
  // Trainer Section
  trainerId: string; // To track who created it
  trainerName: string;
  caseDetails: string;
  caseTypes: CaseType[];
  repetition: Repetition;
  previousActions: string;
  
  // Workflow Tracking
  status: ReferralStatus;
  timeline: TimelineEvent[];
  
  // Digital Signatures (Flags)
  trainerSignature: boolean;
  hodSignature: boolean;
  counselorSignature: boolean;

  // Analysis
  aiSuggestion?: string;
}

export interface ChartData {
  name: string;
  value: number;
}