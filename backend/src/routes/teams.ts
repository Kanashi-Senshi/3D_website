// routes/teams.ts
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

router.use(auth);

router.use(doctorOnly);

router.post('/', createTeam);

router.get('/', getTeams);

router.get('/:id', getTeamById);

router.post('/join', joinTeam);

router.post('/:id/leave', leaveTeam);

router.post('/:id/share', shareFile);

export default router;
