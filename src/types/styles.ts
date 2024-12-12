// types/styles.ts
import { CSSProperties } from 'react';

export interface TeamsSectionStyles {
  folderItem: CSSProperties;
  fileItem: CSSProperties;
  modal: CSSProperties;
  modalContent: CSSProperties;
}

export interface DashboardStyles {
  container: CSSProperties;
  zIndexContainer: CSSProperties;
  trendText: CSSProperties;
  menuContainer: CSSProperties;
  userIcon: CSSProperties;
  userName: CSSProperties;
  userRole: CSSProperties;
  navigation: CSSProperties;
  menuItem: CSSProperties;
  menuItemLabel: CSSProperties;
  subMenu: CSSProperties;
  subMenuItem: CSSProperties;
  subMenuText: CSSProperties;
  signOutLabel: CSSProperties;
}

export interface AppointmentsSectionStyles {
  appointmentContainer: CSSProperties;
  appointmentIcon: CSSProperties;
  appointmentNotes: CSSProperties;
  actionsContainer: CSSProperties;
  actionButtons: CSSProperties;
  emptyStateIcon: CSSProperties;
  scheduleTitle: CSSProperties;
}

export interface AboutSectionStyles {
  container: CSSProperties;
  backgroundGradient: CSSProperties;
  contentWrapper: CSSProperties;
  header: CSSProperties;
  title: CSSProperties;
  subtitle: CSSProperties;
  benefitsGrid: CSSProperties;
  processContainer: CSSProperties;
  processTitle: CSSProperties;
  processSteps: CSSProperties;
  cta: CSSProperties;
  ctaTitle: CSSProperties;
  ctaText: CSSProperties;
  ctaButton: CSSProperties;
}

export interface BenefitCardStyles {
  card: CSSProperties;
  iconContainer: CSSProperties;
  title: CSSProperties;
  description: CSSProperties;
}

export interface ProcessStepStyles {
  container: CSSProperties;
  iconContainer: CSSProperties;
  iconCircle: CSSProperties;
  line: CSSProperties;
  content: CSSProperties;
  title: CSSProperties;
  description: CSSProperties;
}

export interface TechSpecsStyles {
  container: CSSProperties;
  title: CSSProperties;
  grid: CSSProperties;
}

export interface BlockStyles {
  container: CSSProperties;
  iconWrapper: CSSProperties;
  blockTitle: CSSProperties;
  list: CSSProperties;
  listItem: CSSProperties;
  bullet: CSSProperties;
}

export interface InteractiveModelStyles {
  wrapper: CSSProperties;
  modelContainer: CSSProperties;
  iframe: CSSProperties;
  controlsContainer: CSSProperties;
  controlItem: CSSProperties;
  controlIcon: CSSProperties;
  controlLabel: CSSProperties;
  controlText: CSSProperties;
  controlSubText: CSSProperties;
}

export interface STLFilesSectionStyles {
  button: CSSProperties;
  fileCard: CSSProperties;
  actionButton: CSSProperties;
  header: CSSProperties;
  headerTitle: CSSProperties;
  uploadButton: CSSProperties;
  fileInput: CSSProperties;
  fileGrid: CSSProperties;
  fileInfo: CSSProperties;
  fileTitle: CSSProperties;
  fileMetadata: CSSProperties;
  fileNotes: CSSProperties;
  shareInfo: CSSProperties;
  deleteButton: CSSProperties;
  emptyState: CSSProperties;
  emptyStateIcon: CSSProperties;
  emptyStateButton: CSSProperties;
}

export interface DicomUploadsSectionStyles {
  container: CSSProperties;
  tabs: CSSProperties;
  tabButton: CSSProperties;
  activeTabButton: CSSProperties;
  controls: CSSProperties;
  entriesControl: CSSProperties;
  entriesText: CSSProperties;
  entriesSelect: CSSProperties;
  searchContainer: CSSProperties;
  searchInput: CSSProperties;
  searchIcon: CSSProperties;
  table: CSSProperties;
  tableContainer: CSSProperties;
  tableHeader: CSSProperties;
  tableHeaderCell: CSSProperties;
  tableRow: CSSProperties;
  tableCell: CSSProperties;
  statusContainer: CSSProperties;
  statusText: CSSProperties;
  progressBar: CSSProperties;
  progressBarFill: CSSProperties;
  pagination: CSSProperties;
  paginationInfo: CSSProperties;
  paginationControls: CSSProperties;
  paginationButton: CSSProperties;
  paginationButtonDisabled: CSSProperties;
  paginationNumbers: CSSProperties;
  paginationActive: CSSProperties;
}
