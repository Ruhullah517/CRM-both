// Mock data for all modules

export const mockCandidates = [
  {
    id: 1,
    name: "Alice Johnson",
    status: "new",
    stage: "Initial Enquiry",
    mentor: "John Smith",
    notes: [
      { id: 1, text: "Initial call complete.", date: "2024-06-01" }
    ],
    documents: [
      { id: 1, name: "ID Proof.pdf", url: "#" }
    ],
    deadline: "2024-06-15"
  },
  // ...more candidates
];

export const mockSupportCases = [
  {
    id: 1,
    type: "Advocacy",
    person: "Bob Lee",
    status: "active",
    assignedCaseworker: "Jane Doe",
    startDate: "2024-05-20",
    activity: [
      { id: 1, action: "Case opened", date: "2024-05-20" }
    ],
    uploads: [
      { id: 1, name: "SupportPlan.pdf", url: "#" }
    ],
    reminders: [
      { id: 1, text: "Follow up in 1 week", date: "2024-06-07" }
    ]
  },
  // ...more cases
];

export const mockContacts = [
  {
    id: 1,
    name: "Acme Corp",
    type: "Partner",
    tags: ["training"],
    email: "contact@acme.com",
    dateAdded: "2024-05-01",
    notes: "Interested in mentoring.",
    emailHistory: [
      { id: 1, subject: "Welcome", date: "2024-05-02" }
    ]
  },
  // ...more contacts
];

export const mockEmails = [
  {
    id: 1,
    to: "contact@acme.com",
    subject: "Welcome",
    body: "Thank you for joining.",
    date: "2024-05-02"
  },
  // ...more emails
];

export const mockFreelancers = [
  {
    id: 1,
    name: "Sarah Green",
    role: "Social Worker",
    availability: "Available",
    contractDate: "2024-04-01",
    assignments: ["Case #1"],
    uploads: [
      { id: 1, name: "DBS.pdf", url: "#" }
    ]
  },
  // ...more freelancers
];

export const mockContracts = [
  {
    id: 1,
    name: "Mentor Agreement",
    role: "Mentor",
    createdBy: "Admin",
    status: "Signed",
    signedUrl: "#"
  },
  // ...more contracts
];

export const mockContractTemplates = [
  {
    id: 1,
    name: "Standard Mentor Template",
    placeholders: ["{{name}}", "{{role}}", "{{rate}}"],
    createdBy: "Admin"
  },
  // ...more templates
];

export const mockDashboard = {
  upcomingTrainings: [
    { id: 1, title: "Safeguarding 101", date: "2024-06-10" }
  ],
  activeCases: 5,
  salesPipeline: [
    { stage: "Lead", count: 10 },
    { stage: "Contacted", count: 7 },
    { stage: "Closed", count: 3 }
  ],
  contractProgress: [
    { name: "Mentor Agreement", status: "Signed" },
    { name: "Foster Contract", status: "Pending" }
  ]
}; 