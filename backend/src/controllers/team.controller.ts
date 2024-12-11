// backend/src/controllers/team.controller.ts
import { Request, Response } from 'express';
import { Team } from '@models/Team';
import { User } from '@models/User';
import { MedicalFile } from '@models/MedicalFile';

export const createTeam = async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body;
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Verify user is a doctor
    const user = await User.findById(userId);
    if (!user || user.role !== 'doctor') {
      return res.status(403).json({ error: 'Only doctors can create teams' });
    }

    const team = new Team({
      name,
      description,
      owner: userId,
      members: []
    });

    await team.save();

    // Add team reference to user
    await User.findByIdAndUpdate(userId, {
      $push: { teams: team._id }
    });

    res.status(201).json(team);
  } catch (error) {
    console.error('Create team error:', error);
    res.status(500).json({ error: 'Error creating team' });
  }
};

export const getTeams = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Get teams where user is owner or member
    const teams = await Team.find({
      $or: [
        { owner: userId },
        { members: userId }
      ]
    })
    .populate('owner', 'name email')
    .populate('members', 'name email')
    .sort({ createdAt: -1 });

    res.json(teams);
  } catch (error) {
    console.error('Get teams error:', error);
    res.status(500).json({ error: 'Error fetching teams' });
  }
};

export const getTeamById = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const team = await Team.findById(req.params.id)
      .populate('owner', 'name email')
      .populate('members', 'name email')
      .populate({
        path: 'sharedFiles.file',
        select: 'fileName fileType size status'
      })
      .populate('sharedFiles.sharedBy', 'name email');

    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    if (!team.isMember(userId)) {
      return res.status(403).json({ error: 'Not authorized to view this team' });
    }

    res.json(team);
  } catch (error) {
    console.error('Get team error:', error);
    res.status(500).json({ error: 'Error fetching team' });
  }
};

export const joinTeam = async (req: Request, res: Response) => {
  try {
    const { joinCode } = req.body;
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Verify user is a doctor
    const user = await User.findById(userId);
    if (!user || user.role !== 'doctor') {
      return res.status(403).json({ error: 'Only doctors can join teams' });
    }

    const team = await Team.findOne({ joinCode });
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    if (team.isMember(userId)) {
      return res.status(400).json({ error: 'Already a member of this team' });
    }

    await team.addMember(userId);

    // Add team reference to user
    await User.findByIdAndUpdate(userId, {
      $push: { teams: team._id }
    });

    res.json(team);
  } catch (error) {
    console.error('Join team error:', error);
    res.status(500).json({ error: 'Error joining team' });
  }
};

export const leaveTeam = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const team = await Team.findById(req.params.id);
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    if (team.isOwner(userId)) {
      return res.status(400).json({ error: 'Team owner cannot leave the team' });
    }

    if (!team.isMember(userId)) {
      return res.status(400).json({ error: 'Not a member of this team' });
    }

    await team.removeMember(userId);

    // Remove team reference from user
    await User.findByIdAndUpdate(userId, {
      $pull: { teams: team._id }
    });

    res.json({ message: 'Successfully left the team' });
  } catch (error) {
    console.error('Leave team error:', error);
    res.status(500).json({ error: 'Error leaving team' });
  }
};

export const shareFile = async (req: Request, res: Response) => {
  try {
    const { fileId, notes } = req.body;
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const team = await Team.findById(req.params.id);
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    if (!team.isMember(userId)) {
      return res.status(403).json({ error: 'Not authorized to share files in this team' });
    }

    // Verify file exists and user has access
    const file = await MedicalFile.findById(fileId);
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    if (!file.hasAccess(userId)) {
      return res.status(403).json({ error: 'Not authorized to share this file' });
    }

    await team.shareFile(fileId, userId, notes);

    // Share file with all team members
    const memberIds = team.members.map(member => member.toString());
    memberIds.push(team.owner.toString());
    await file.shareWith(memberIds);

    res.json(team);
  } catch (error) {
    console.error('Share file error:', error);
    res.status(500).json({ error: 'Error sharing file' });
  }
};
