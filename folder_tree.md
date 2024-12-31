3D Website/
│
├── src/
│   ├── components/
│   │   ├── LoadingSpinner.tsx
│   │   ├── ErrorDisplay.tsx
│   │   ├── layout.tsx
│   │   └── ui/
│   │       ├── alert.tsx
│   │       └── card.tsx
│   │
│   ├── contexts/
│   │   ├── AuthContext.tsx
│   │   └── AuthModal.tsx
│   │
│   ├── hooks/
│   │   └── useDashboardData.ts
│   │
│   ├── services/
│   │   └── api.ts
│   │
│   ├── types/
│   │   ├── dashboard.ts
│   │   ├── express.d.ts
│   │   ├── index.ts
│   │   └── styles.ts
│   │
│   ├── AboutSection.tsx
│   ├── App.tsx
│   ├── AppointmentsSection.tsx
│   ├── Dashboard.tsx
│   ├── DicomUploadsSection.tsx
│   ├── LandingPage.tsx
│   ├── SettingsSection.tsx
│   ├── SocialSection.tsx
│   ├── STLFilesSection.tsx
│   └── TeamsSection.tsx
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.ts
│   │   │   └── supabase.ts
│   │   │
│   │   ├── controllers/
│   │   │   ├── appointment.controller.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── file.controller.ts
│   │   │   ├── social.controller.ts
│   │   │   ├── team.controller.ts
│   │   │   └── user.controller.ts
│   │   │
│   │   ├── middleware/
│   │   │   ├── auth.ts
│   │   │   └── upload.ts
│   │   │
│   │   ├── models/
│   │   │   ├── Appointment.ts
│   │   │   ├── Community.ts
│   │   │   ├── MedicalFile.ts
│   │   │   ├── Post.ts
│   │   │   ├── Team.ts
│   │   │   └── User.ts
│   │   │
│   │   ├── routes/
│   │   │   ├── appointments.ts
│   │   │   ├── auth.ts
│   │   │   ├── files.ts
│   │   │   ├── social.ts
│   │   │   ├── teams.ts
│   │   │   └── users.ts
│   │   │
│   │   └── server.ts
│   │
│   ├── package.json
│   └── tsconfig.json
│
├── public/
│   └── index.html
│
├── .eslintrc.json
├── package.json
├── postcss.config.js
├── render.yaml
├── tailwind.config.js
├── tsconfig.json
└── vercel.json