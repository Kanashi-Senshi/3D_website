// src/TeamsSection.tsx
import React, { useState } from "react";
import {
  FolderPlus,
  Download,
  FileText,
  Upload,
  Folder,
  ChevronRight,
  ChevronDown,
  X,
} from "lucide-react";
import { TeamsSectionStyles } from "./types/styles";

interface TeamFile {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadedBy: string;
  timestamp: string;
  path: string;
}

interface TeamFolder {
  id: string;
  name: string;
  files: TeamFile[];
  subfolders: TeamFolder[];
  path: string;
}

interface Team {
  id: string;
  name: string;
  members: string[];
  joinCode: string;
  rootFolder: TeamFolder;
}

const styles: TeamsSectionStyles = {
  folderItem: {
    paddingLeft: "20px",
  },
  fileItem: {
    paddingLeft: "40px",
  },
  modal: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "1rem",
  },
  modalContent: {
    backgroundColor: "#1F2937",
    borderRadius: "0.5rem",
    padding: "1.5rem",
    width: "100%",
    maxWidth: "28rem",
  },
};

const TeamsSection: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [expandedFolders, setExpandedFolders] = useState<string[]>([]);
  const [showCreateTeamModal, setShowCreateTeamModal] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");

  const handleCreateTeam = () => {
    if (!newTeamName) return;

    const newTeam: Team = {
      id: Date.now().toString(),
      name: newTeamName,
      members: ["Current User"],
      joinCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
      rootFolder: {
        id: "root",
        name: "Root",
        files: [],
        subfolders: [],
        path: "/",
      },
    };

    setTeams([...teams, newTeam]);
    setNewTeamName("");
    setShowCreateTeamModal(false);
  };

  const handleJoinTeam = () => {
    const team = teams.find((t) => t.joinCode === joinCode);
    if (team) {
      setTeams(
        teams.map((t) =>
          t.id === team.id
            ? { ...t, members: [...t.members, "Current User"] }
            : t
        )
      );
      setJoinCode("");
      setShowJoinModal(false);
    }
  };

  const handleCreateFolder = (teamId: string, parentPath: string) => {
    const folderName = prompt("Enter folder name:");
    if (!folderName) return;

    setTeams(
      teams.map((team) => {
        if (team.id !== teamId) return team;

        const newFolder: TeamFolder = {
          id: Date.now().toString(),
          name: folderName,
          files: [],
          subfolders: [],
          path: `${parentPath}/${folderName}`,
        };

        const addFolderToPath = (
          folder: TeamFolder,
          targetPath: string
        ): TeamFolder => {
          if (folder.path === parentPath) {
            return {
              ...folder,
              subfolders: [...folder.subfolders, newFolder],
            };
          }

          return {
            ...folder,
            subfolders: folder.subfolders.map((sf) =>
              addFolderToPath(sf, targetPath)
            ),
          };
        };

        return {
          ...team,
          rootFolder: addFolderToPath(team.rootFolder, parentPath),
        };
      })
    );
  };

  const handleUploadFile = (teamId: string, folderPath: string) => {
    const input = document.createElement("input");
    input.type = "file";
    input.multiple = true;

    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (!files) return;

      const newFiles: TeamFile[] = Array.from(files).map((file) => ({
        id: Date.now().toString(),
        name: file.name,
        type: file.type || "unknown",
        size: `${(file.size / 1024).toFixed(1)} KB`,
        uploadedBy: "Current User",
        timestamp: new Date().toISOString(),
        path: `${folderPath}/${file.name}`,
      }));

      setTeams(
        teams.map((team) => {
          if (team.id !== teamId) return team;

          const addFilesToPath = (
            folder: TeamFolder,
            targetPath: string
          ): TeamFolder => {
            if (folder.path === folderPath) {
              return {
                ...folder,
                files: [...folder.files, ...newFiles],
              };
            }

            return {
              ...folder,
              subfolders: folder.subfolders.map((sf) =>
                addFilesToPath(sf, targetPath)
              ),
            };
          };

          return {
            ...team,
            rootFolder: addFilesToPath(team.rootFolder, folderPath),
          };
        })
      );
    };

    input.click();
  };

  const handleDownloadFolder = (folder: TeamFolder) => {
    console.log(`Downloading folder: ${folder.path}`);
  };

  const renderFolder = (folder: TeamFolder, teamId: string, level = 0) => {
    const isExpanded = expandedFolders.includes(folder.path);

    return (
      <div key={folder.id} className="space-y-2">
        <div
          className="flex items-center gap-2 hover:bg-gray-700 p-2 rounded cursor-pointer"
          style={{ paddingLeft: `${level * 20}px` }}
        >
          <button
            onClick={() =>
              setExpandedFolders((prev) =>
                isExpanded
                  ? prev.filter((p) => p !== folder.path)
                  : [...prev, folder.path]
              )
            }
          >
            {isExpanded ? (
              <ChevronDown size={16} />
            ) : (
              <ChevronRight size={16} />
            )}
          </button>
          <Folder size={16} className="text-blue-400" />
          <span>{folder.name}</span>
          <div className="ml-auto flex gap-2">
            <button
              onClick={() => handleCreateFolder(teamId, folder.path)}
              className="p-1 hover:bg-gray-600 rounded"
            >
              <FolderPlus size={16} />
            </button>
            <button
              onClick={() => handleUploadFile(teamId, folder.path)}
              className="p-1 hover:bg-gray-600 rounded"
            >
              <Upload size={16} />
            </button>
            <button
              onClick={() => handleDownloadFolder(folder)}
              className="p-1 hover:bg-gray-600 rounded"
            >
              <Download size={16} />
            </button>
          </div>
        </div>

        {isExpanded && (
          <div className="space-y-2">
            {folder.files
              .sort((a, b) => {
                if (a.type !== b.type) return a.type.localeCompare(b.type);
                return (
                  new Date(b.timestamp).getTime() -
                  new Date(a.timestamp).getTime()
                );
              })
              .map((file) => (
                <div
                  key={file.id}
                  className="flex items-center gap-2 hover:bg-gray-700 p-2 rounded"
                  style={{ paddingLeft: `${(level + 1) * 20}px` }}
                >
                  <FileText size={16} className="text-gray-400" />
                  <span>{file.name}</span>
                  <span className="text-sm text-gray-400 ml-2">
                    {new Date(file.timestamp).toLocaleString()}
                  </span>
                  <span className="text-sm text-gray-400 ml-2">
                    {file.size}
                  </span>
                </div>
              ))}
            {folder.subfolders.map((subfolder) =>
              renderFolder(subfolder, teamId, level + 1)
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Teams</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setShowJoinModal(true)}
            className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            Join Team
          </button>
          <button
            onClick={() => setShowCreateTeamModal(true)}
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg"
          >
            Create Team
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {teams.map((team) => (
          <div key={team.id} className="bg-gray-800 rounded-lg p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">{team.name}</h3>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-400">
                  Join Code: {team.joinCode}
                </span>
                <span className="text-sm text-gray-400">
                  {team.members.length} members
                </span>
              </div>
            </div>
            {renderFolder(team.rootFolder, team.id)}
          </div>
        ))}
      </div>

      {showJoinModal && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Join Team</h3>
              <button
                onClick={() => setShowJoinModal(false)}
                className="p-1 hover:bg-gray-700 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>
            <input
              type="text"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
              placeholder="Enter team code"
              className="w-full bg-gray-700 rounded-lg p-2 mb-4"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setShowJoinModal(false)}
                className="flex-1 px-4 py-2 bg-gray-700 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleJoinTeam}
                className="flex-1 px-4 py-2 bg-blue-600 rounded-lg"
              >
                Join
              </button>
            </div>
          </div>
        </div>
      )}

      {showCreateTeamModal && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Create Team</h3>
              <button
                onClick={() => setShowCreateTeamModal(false)}
                className="p-1 hover:bg-gray-700 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>
            <input
              type="text"
              value={newTeamName}
              onChange={(e) => setNewTeamName(e.target.value)}
              placeholder="Team name"
              className="w-full bg-gray-700 rounded-lg p-2 mb-4"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setShowCreateTeamModal(false)}
                className="flex-1 px-4 py-2 bg-gray-700 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTeam}
                className="flex-1 px-4 py-2 bg-blue-600 rounded-lg"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamsSection;
