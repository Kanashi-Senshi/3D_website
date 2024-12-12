// routes/teams.ts
// backend/src/routes/teams.ts
// backend/src/routes/teams.ts
// backend/src/routes/teams.ts
import express from 'express';
import { auth, doctorOnly } from '@middleware/auth';
import {
  createTeam,
  getTeams,
  getTeamById,
  joinTeam,
  leaveTeam,
  shareFile
} from '@controllers/team.controller';

const router = express.Router();

// All routes require authentication
router.use(auth);

// All routes require doctor role
router.use(doctorOnly);

// Create new team
router.post('/', createTeam);

// Get all teams user is part of
router.get('/', getTeams);

// Get specific team
router.get('/:id', getTeamById);

// Join team with code
router.post('/join', joinTeam);

// Leave team
router.post('/:id/leave', leaveTeam);

// Share file with team
router.post('/:id/share', shareFile);

export default router;
