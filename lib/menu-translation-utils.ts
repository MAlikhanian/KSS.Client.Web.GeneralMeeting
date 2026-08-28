import { useTranslation } from 'react-i18next';
import { MenuConfig } from '@/config/types';

// Translation key mapping for menu items
const MENU_TRANSLATION_KEYS: Record<string, string> = {
  'Dashboards': 'menu.dashboards',
  'Main': 'menu.main',
  'Systems': 'menu.systems',
  'Base Information': 'menu.baseInformation',
  'Settings': 'menu.settings',
  'Template': 'menu.template',
  'Sample Dashboard': 'menu.sampleDashboard',
  'Demo 1 - Light Sidebar': 'menu.demo1Light',
  'Demo 1 - Dark Sidebar': 'menu.demo1Dark',
  'Demo 2': 'menu.demo2',
  'Demo 3': 'menu.demo3',
  'Demo 4': 'menu.demo4',
  'Demo 5': 'menu.demo5',
  'Members Information': 'menu.membersInformation',
  'Data Upload': 'menu.dataUpload',
  'Item Requests': 'menu.itemRequests',
  'Credit Rating': 'menu.creditRating',
  'Credit Rating List': 'menu.creditRatingList',
  'New Assessment': 'menu.newAssessment',
  'Reports': 'menu.creditRatingReports',
  'General Inquiry': 'menu.creditRatingGeneralInquiry',
  'Brokerage Inquiry': 'menu.creditRatingBrokerageInquiry',
  'Inquiry': 'menu.creditRatingInquiry',
  'Cases': 'menu.creditRatingCases',
  'Assessments': 'menu.creditRatingAssessments',
  'Data Entry': 'menu.creditRatingDataEntry',
  'Cash Advance': 'menu.cashAdvance',
  'My Cash Advance Requests': 'menu.cashAdvanceMyRequests',
  'Cash Advance Approvals': 'menu.cashAdvanceApprovals',
  'Cash Advance Submit Invoice': 'menu.cashAdvanceSubmitInvoice',
  'Cash Advance Invoices': 'menu.cashAdvanceInvoices',
  'Cash Advance Ledger': 'menu.cashAdvanceLedger',
  'Cash Advance Products': 'menu.cashAdvanceProducts',
  'Cash Advance Funds': 'menu.cashAdvanceFunds',
  'Add Cash Advance': 'menu.cashAdvanceAdd',
  'Update Cash Advance': 'menu.cashAdvanceUpdate',
  'View Cash Advance': 'menu.cashAdvanceView',
  'Cash Advance Person Limits': 'menu.cashAdvancePersonLimits',
  'General Meeting': 'menu.generalMeeting',
  'Meeting Reports': 'menu.meetingReports',
  'Meeting Elections': 'menu.meetingElections',
  'Meeting Management': 'menu.meetingManagement',
  'Meeting Candidates': 'menu.meetingCandidates',
  'Meeting Attendance': 'menu.meetingAttendance',
  'Attendance Report': 'menu.attendanceReport',
  'Board Election': 'menu.boardElection',
  'Secret Ballot': 'menu.secretBallot',
  'Election Results': 'menu.electionResults',
  'Project Management': 'menu.project',
  'Project Projects': 'menu.projectProjects',
  'Project Worksites': 'menu.projectWorksites',
  'Customer Risk': 'menu.customerRisk',
  'CRS Overview': 'menu.customerRiskOverview',
  'My Risk Cases': 'menu.customerRiskCases',
  'Risk Archive': 'menu.customerRiskArchive',
  'New Risk Case': 'menu.customerRiskNewCase',
  'Risk Search': 'menu.customerRiskSearch',
  'Risk Audit Log': 'menu.customerRiskAuditLog',
  'CRS Users': 'menu.customerRiskUsers',
  'CRS IP Whitelist': 'menu.customerRiskIps',
  'Members Reports': 'menu.membersReports',
  'Milan Pars': 'menu.milanPars',
  'Milan Pars Report': 'menu.milanParsReport',
  'Customer Statement': 'menu.mpfCustomerStatement',
  'Reports Overview': 'menu.membersReportsOverview',
  'Brokerages Report': 'menu.membersReportsBrokerages',
  'Funds Report': 'menu.membersReportsFunds',
  'Members Directory': 'menu.membersReportsMembers',
  'Brokerage Profile': 'menu.membersReportsBrokerageProfile',
  'Comparison by Class': 'menu.membersReportsByClass',
  'Personnel by Position': 'menu.membersReportsByPosition',
  'Market-Making Funds': 'menu.membersReportsMarketMakingFunds',
  'License Compliance': 'menu.membersReportsLicenses',
  'Fund Governance': 'menu.membersReportsFundGovernance',
  'Market': 'menu.market',
  'Market Assets': 'menu.marketAssets',
  'Market Sectors': 'menu.marketSectors',
  'Market Asset Types': 'menu.marketAssetTypes',
  'Market Types': 'menu.marketTypes',
  'Brokerages': 'menu.brokerages',
  'Investment Funds': 'menu.investmentFunds',
  // SPM (Sepinud Portfolio Management) back-office console
  'SPM Investment': 'menu.spmInvestment',
  'Requests': 'menu.spmRequests',
  'Orders': 'menu.spmOrders',
  'Settlements': 'menu.spmSettlements',
  'Ledger': 'menu.spmLedger',
  'Reconciliation': 'menu.spmReconciliation',
  'Adjustments': 'menu.spmAdjustments',
  'Manual Resolution': 'menu.spmResolution',
  'Investor Accounts': 'menu.spmAccounts',
  'Instruments': 'menu.spmInstruments',
  'Audit Trail': 'menu.spmAudit',
  'Service Health': 'menu.spmHealth',
  'General Information': 'menu.generalInformation',
  'Fund Manager': 'menu.fundManager',
  'Trustee': 'menu.trustee',
  'Preferred Shareholders': 'menu.preferredShareholders',
  'Market-Making Symbols': 'menu.marketMakingSymbols',
  'Managers & Staff': 'menu.managersAndStaff',
  'Persons': 'menu.persons',
  'Person View': 'menu.personView',
  'Edit Person': 'menu.personInformation',
  'Person New': 'menu.personNew',
  'Assets': 'menu.assets',
  'Access Management': 'menu.personAccess',
  'Person Security': 'menu.personSecurity',
  'Admin': 'menu.personAdmin',
  'System': 'menu.system',
  'Role Permissions': 'menu.systemSecurityRolePermissions',
  'Companies': 'menu.companies',
  'Company View': 'menu.companyView',
  'Company Update': 'menu.companyUpdate',
  'Company New': 'menu.companyNew',
  'Company Access': 'menu.companyAccess',
  'Financial Information': 'menu.financialInformation',
  'Members Info': 'menu.membersInfo',
  'Trading Offices': 'menu.tradingOffices',
  'Trading Stations': 'menu.tradingStations',
  'Company Software': 'menu.companySoftware',
  'Approvals': 'menu.approvals',
  'Licenses': 'menu.licenses',
  'Documents': 'menu.documents',
  'Association Cooperation': 'menu.associationCooperation',
  'Legal Cases': 'menu.legalCases',
  'Board Committees': 'menu.boardCommittees',
  'User': 'menu.user',
  'Public Profile': 'menu.publicProfile',
  'Profiles': 'menu.profiles',
  'Default': 'menu.default',
  'Creator': 'menu.creator',
  'Company': 'menu.company',
  'NFT': 'menu.nft',
  'Blogger': 'menu.blogger',
  'CRM': 'menu.crm',
  'More': 'menu.more',
  'Show less': 'menu.showLess',
  'Show 3 more': 'menu.showMore3',
  'Show 4 more': 'menu.showMore',
  'Gamer': 'menu.gamer',
  'Feeds': 'menu.feeds',
  'Plain': 'menu.plain',
  'Modal': 'menu.modal',
  'Projects': 'menu.projects',
  '3 Columns': 'menu.threeColumns',
  '2 Columns': 'menu.twoColumns',
  'Works': 'menu.works',
  'Teams': 'menu.teams',
  'Network': 'menu.network',
  'Activity': 'menu.activity',
  'Campaigns - Card': 'menu.campaignsCard',
  'Campaigns - List': 'menu.campaignsList',
  'Empty': 'menu.empty',
  'My Account': 'menu.myAccount',
  'Account': 'menu.account',
  'Get Started': 'menu.getStarted',
  'User Profile': 'menu.userProfile',
  'User Profile - New': 'menu.userProfileNew',
  'Company Profile': 'menu.companyProfile',
  'Settings - With Sidebar': 'menu.settingsWithSidebar',
  'Settings - Enterprise': 'menu.settingsEnterprise',
  'Settings - Plain': 'menu.settingsPlain',
  'Settings - Modal': 'menu.settingsModal',
  'Billing': 'menu.billing',
  'Billing - Basic': 'menu.billingBasic',
  'Billing - Enterprise': 'menu.billingEnterprise',
  'Plans': 'menu.plans',
  'Billing History': 'menu.billingHistory',
  'Security': 'menu.security',
  'Security Overview': 'menu.securityOverview',
  'Allowed IP Addresses': 'menu.allowedIpAddresses',
  'Privacy Settings': 'menu.privacySettings',
  'Device Management': 'menu.deviceManagement',
  'Backup & Recovery': 'menu.backupRecovery',
  'Current Sessions': 'menu.currentSessions',
  'Security Log': 'menu.securityLog',
  'Members & Roles': 'menu.membersRoles',
  'Teams Starter': 'menu.teamsStarter',
  'Team Info': 'menu.teamInfo',
  'Members Starter': 'menu.membersStarter',
  'Team Members': 'menu.teamMembers',
  'Import Members': 'menu.importMembers',
  'Roles': 'menu.roles',
  'Permissions - Toggler': 'menu.permissionsToggler',
  'Permissions - Check': 'menu.permissionsCheck',
  'Integrations': 'menu.integrations',
  'Notifications': 'menu.notifications',
  'API Keys': 'menu.apiKeys',
  'Appearance': 'menu.appearance',
  'Invite a Friend': 'menu.inviteFriend',
  'Authentication': 'menu.authentication',
  'Sign In': 'menu.signIn',
  'Check Email': 'menu.checkEmail',
  'Reset Password': 'menu.resetPassword',
  '2FA': 'menu.twoFA',
  'Welcome Message': 'menu.welcomeMessage',
  'Account Deactivated': 'menu.accountDeactivated',
  'Error 404': 'menu.error404',
  'Error 500': 'menu.error500',
  'Apps': 'menu.apps',
  'User Management': 'menu.userManagement',
  'Users': 'menu.users',
  'Permissions': 'menu.permissions',
  'Logs': 'menu.logs',
  'Store - Client': 'menu.storeClient',
  'Search Results - Grid': 'menu.searchResultsGrid',
  'Search Results - List': 'menu.searchResultsList',
  'Product Details': 'menu.productDetails',
  'Wishlist': 'menu.wishlist',
  'Checkout': 'menu.checkout',
  'Order Summary': 'menu.orderSummary',
  'Shipping Info': 'menu.shippingInfo',
  'Payment Method': 'menu.paymentMethod',
  'Order Placed': 'menu.orderPlaced',
  'My Orders': 'menu.myOrders',
  'Order Receipt': 'menu.orderReceipt',
  'Store - Admin': 'menu.storeAdmin',
  'Dashboard': 'menu.dashboard',
  'Inventory': 'menu.inventory',
  'All Products': 'menu.allProducts',
  'Current Stock': 'menu.currentStock',
  'Inbound Stock': 'menu.inboundStock',
  'Outbound Stock': 'menu.outboundStock',
  'Stock Planner': 'menu.stockPlanner',
  'Track Shipping': 'menu.trackShipping',
  'Create Shipping Label': 'menu.createShippingLabel',
  'Store - Services': 'menu.storeServices',
  'AI Promt': 'menu.aiPrompt',
  'Invoice Generator': 'menu.invoiceGenerator',
  'Search Results': 'menu.searchResults',
  'Overlays': 'menu.overlays',
  'User Cards': 'menu.userCards',
  'Mini Cards': 'menu.miniCards',
  'Team Crew': 'menu.teamCrew',
  'Author': 'menu.author',
  'Social': 'menu.social',
  'User Table': 'menu.userTable',
  'App Roster': 'menu.appRoster',
  'Market Authors': 'menu.marketAuthors',
  'SaaS Users': 'menu.saasUsers',
  'Store Clients': 'menu.storeClients',
  'Visitors': 'menu.visitors',
  'Cooperations': 'menu.cooperations',
  'Leads': 'menu.leads',
  'Donators': 'menu.donators',
  'Getting Started': 'menu.gettingStarted',
  'Support Forum': 'menu.supportForum',
  'All Questions': 'menu.allQuestions',
  'Popular Questions': 'menu.popularQuestions',
  'Ask Question': 'menu.askQuestion',
  'Licenses & FAQ': 'menu.licensesFaq',
  'Documentation': 'menu.documentation',
  'Contact Us': 'menu.contactUs',
  'General Pages': 'menu.generalPages',
  'Other pages': 'menu.otherPages',
  'Account Home': 'menu.accountHome',
  'Basic Billing': 'menu.basicBilling',
  'IP Addresses': 'menu.ipAddresses',
  'User Base': 'menu.userBase',
  'Datatables': 'menu.datatables',
  'Checkout - Order Summary': 'menu.checkoutOrderSummary',
  'Checkout - Shipping Info': 'menu.checkoutShippingInfo',
  'Checkout - Payment Method': 'menu.checkoutPaymentMethod',
  'Checkout - Order Placed': 'menu.checkoutOrderPlaced',
  'Colleagues': 'menu.colleagues',
  'NFT Users': 'menu.nftUsers',
  'Social Users': 'menu.socialUsers',
  'Gamers': 'menu.gamers',
  'Freelancer': 'menu.freelancer',
  'Developer': 'menu.developer',
  'Team': 'menu.team',
  'Events': 'menu.events',
  'Badges': 'menu.badges',
  'Awards': 'menu.awards',
  'Brand': 'menu.brand',
  'Get Paid': 'menu.getPaid',
  'Tax Info': 'menu.taxInfo',
  'Invoices': 'menu.invoices',
  'Gateaways': 'menu.gateaways',
  'Home': 'menu.home',
  'Projects - 3 Cols': 'menu.threeColumns',
  'Projects - 2 Cols': 'menu.twoColumns',
  'With Sidebar': 'menu.settingsWithSidebar',
  'Enterprise': 'menu.settingsEnterprise',
  'Read to Get Started ?': 'menu.readToGetStarted',
  'Take your docs to the next level of SEBA': 'menu.takeDocsToNextLevel',
  'Read Documentation': 'menu.readDocumentation',
  'Site': 'menu.site',
  'Sazesh': 'menu.sazesh',
  'LMS': 'menu.lms',
};

/**
 * Filter menu items by user roles and/or permissions.
 *
 * Rules:
 * - If a menu item has `roles`, the user must have at least one of those roles.
 * - If a menu item has `permissions`, the user must have at least one of those permissions.
 * - Both conditions must pass when both are specified.
 * - Items with neither `roles` nor `permissions` are visible to all authenticated users.
 * - Parent items with children are hidden only when ALL their children are hidden.
 */
export function filterMenuByRole(
  menu: MenuConfig,
  userRoles: string[] = [],
  userPermissions: string[] = [],
): MenuConfig {
  return menu
    .map((item) => ({
      ...item,
      children: item.children
        ? filterMenuByRole(item.children, userRoles, userPermissions)
        : undefined,
    }))
    .filter((item) => {
      // Role check: item.roles must overlap with user's roles from Auth service
      if (item.roles?.length) {
        const hasRole = userRoles.some((r) => item.roles!.includes(r));
        if (!hasRole) return false;
      }

      // Permission check: user must have at least one of item.permissions
      if (item.permissions?.length) {
        const hasPerm = item.permissions.some((p) => userPermissions.includes(p));
        if (!hasPerm) return false;
      }

      // If item only has children (no path/heading/separator), hide it when all children were filtered out
      if (item.children !== undefined && item.children.length === 0 && !item.path && !item.heading && !item.separator) {
        return false;
      }

      return true;
    });
}

// Function to translate menu items recursively
export function translateMenuItems(items: MenuConfig, t: (key: string) => string): MenuConfig {
  return items.map(item => {
    const translatedItem = { ...item };
    
    // Translate title if it exists
    if (item.title && MENU_TRANSLATION_KEYS[item.title]) {
      translatedItem.title = t(MENU_TRANSLATION_KEYS[item.title]);
    }
    
    // Translate collapse titles if they exist
    if (item.collapseTitle && MENU_TRANSLATION_KEYS[item.collapseTitle]) {
      translatedItem.collapseTitle = t(MENU_TRANSLATION_KEYS[item.collapseTitle]);
    }
    
    if (item.expandTitle && MENU_TRANSLATION_KEYS[item.expandTitle]) {
      translatedItem.expandTitle = t(MENU_TRANSLATION_KEYS[item.expandTitle]);
    }
    
    // Translate heading if it exists
    if (item.heading && MENU_TRANSLATION_KEYS[item.heading]) {
      translatedItem.heading = t(MENU_TRANSLATION_KEYS[item.heading]);
    }
    
    // Recursively translate children
    if (item.children) {
      translatedItem.children = translateMenuItems(item.children, t);
    }
    
    return translatedItem;
  });
}

// Hook to get translated menu configuration
export function useTranslatedMenu() {
  const { t } = useTranslation();
  
  return {
    translateMenuItems: (items: MenuConfig) => translateMenuItems(items, t),
  };
}