// types/styles.ts
import { CSSProperties } from 'react';

// Add support for media queries in CSSProperties
interface ExtendedCSSProperties extends CSSProperties {
  '@media (min-width: 768px)'?: CSSProperties;
  '@media (min-width: 1024px)'?: CSSProperties;
}

export interface TeamsSectionStyles {
  folderItem: CSSProperties;
  fileItem: CSSProperties;
  modal: CSSProperties;
  modalContent: CSSProperties;
}

export interface DashboardStyles {
  container: ExtendedCSSProperties;
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
  gradientBackground: CSSProperties;
  mobileHeader: ExtendedCSSProperties;
  menuButton: CSSProperties;
  appTitle: CSSProperties;
  sidebar: ExtendedCSSProperties;
  userInfo: CSSProperties;
  userInfoContainer: CSSProperties;
  avatarContainer: CSSProperties;
  menuItemActive: CSSProperties;
  menuItemContent: CSSProperties;
  subMenuContainer: CSSProperties;
  subMenuItemActive: CSSProperties;
  signOutButton: CSSProperties;
  mainContent: CSSProperties;
  welcomeTitle: CSSProperties;
  statsGrid: ExtendedCSSProperties;
  statsCard: CSSProperties;
  statsCardContent: CSSProperties;
  statsTitle: CSSProperties;
  statsValue: CSSProperties;
  statsTrend: CSSProperties;
  statsGradientOverlay: CSSProperties;
  statsIconContainer: {
    width: string;
    height: string;
    borderRadius: string;
    background: string;
    display: string;
    alignItems: string;
    justifyContent: string;
    marginBottom: string;
  };
  activityFeed: {
    marginTop: string;
    background: string;
    borderRadius: string;
    padding: string;
  };
  activityTitle: {
    fontSize: string;
    fontWeight: string;
    marginBottom: string;
    color: string;
  };
  activityItem: {
    display: string;
    alignItems: string;
    gap: string;
    padding: string;
    borderBottom: string;
  };
  activityContent: {
    flex: number;
  };
  activityText: {
    color: string;
    fontSize: string;
  };
  activityTime: {
    color: string;
    fontSize: string;
  };
}

export interface AppointmentsSectionStyles {
  container: CSSProperties;
  header: CSSProperties;
  scheduleButton: CSSProperties;
  appointmentsList: CSSProperties;
  appointmentCard: CSSProperties;
  appointmentInfo: CSSProperties;
  iconContainer: CSSProperties;
  appointmentTitle: CSSProperties;
  appointmentDetails: CSSProperties;
  appointmentMeta: CSSProperties;
  statusContainer: CSSProperties;
  actionButton: CSSProperties;
  confirmButton: CSSProperties;
  cancelButton: CSSProperties;
  emptyState: CSSProperties;
  modal: CSSProperties;
  modalContent: CSSProperties;
  modalHeader: CSSProperties;
  modalTitle: CSSProperties;
  closeButton: CSSProperties;
  formGroup: CSSProperties;
  label: CSSProperties;
  select: CSSProperties;
  input: CSSProperties;
  textarea: CSSProperties;
  modalActions: CSSProperties;
  modalCancelButton: CSSProperties;
  modalSubmitButton: CSSProperties;
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
