import {
  AlertCircle,
  Award,
  Badge,
  Bell,
  Bitcoin,
  Bolt,
  Book,
  Briefcase,
  Building,
  CalendarCheck,
  Captions,
  CheckCircle,
  Code,
  Codepen,
  Coffee,
  File as DocumentIcon,
  Euro,
  Eye,
  File,
  FileQuestion,
  FileText,
  Flag,
  Gavel,
  Ghost,
  Gift,
  Grid,
  Heart,
  HelpCircle,
  Kanban,
  Key,
  Layout,
  LayoutDashboard,
  LayoutGrid,
  LifeBuoy,
  MessageSquare,
  Monitor,
  Network,
  Users as PeopleIcon,
  Plug,
  ScrollText,
  Settings,
  Share2,
  Shield,
  ShieldUser,
  ShoppingCart,
  SquareMousePointer,
  Star,
  Theater,
  TrendingUp,
  Upload,
  UserCheck,
  UserCircle,
  Users,
  Wallet,
  Briefcase as WorkIcon,
  Zap,
} from 'lucide-react';
import { type MenuConfig } from './types';
import { translateMenuItems } from '@/lib/menu-translation-utils';

export const MENU_SIDEBAR: MenuConfig = [
  {
    title: 'Dashboards',
    icon: LayoutGrid,
    children: [
      { title: 'Main', path: '/' },
    ],
  },
  { heading: 'Systems' },
  {
    title: 'Members Information',
    icon: UserCircle,
    children: [
      {
        // TEMP: restrict whole Reports section to SuperAdmin while UI is in
        // development. Replace with per-item `permissions:` arrays once the
        // Members-Reports backend (KSS.Service.Report.SEBA_ERP_Members) is wired.
        //
        // Internal title is "Members Reports" so it gets a unique entry in
        // MENU_TRANSLATION_KEYS (Credit Rating already owns the bare "Reports"
        // key). The visible label resolves to "Reports" / "گزارش‌ها" via
        // menu.membersReports.
        //
        // Migration 023 added the global `Developer` role; including it here
        // lets devs preview the Members-Reports UI without being elevated to
        // SuperAdmin. SuperAdmin keeps full access as before.
        title: 'Members Reports',
        roles: ['SuperAdmin', 'Developer', 'MemberReport'],
        children: [
          // v1 surface — tight 3-page set per the xlsx-spec extraction round.
          // v2 candidates (Funds Report / License Compliance / Fund Governance /
          // Brokerage Stations / Brokerage Offices / Market-Making Symbols & NAV)
          // are deferred — they ship as separate steps once v1 patterns settle.
          { title: 'Reports Overview', path: '/members/members-reports/overview' },
          { title: 'Brokerages Report', path: '/members/members-reports/dataentry' },
          { title: 'Members Directory', path: '/members/members-reports/member' },
          { title: 'Brokerage Profile', path: '/members/members-reports/brokerage-profile' },
          { title: 'Comparison by Class', path: '/members/members-reports/by-class' },
          { title: 'Personnel by Position', path: '/members/members-reports/by-position' },
          { title: 'Market-Making Funds', path: '/members/members-reports/funds' },
        ],
      },
      {
        title: 'Brokerages',
        children: [
          {
            title: 'General Information',
            path: '/members/brokerages/general-information',
            permissions: ['Members.Brokerage.Read', 'Members.Brokerage.Modify'],
          },
          {
            title: 'Financial Information',
            path: '/members/brokerages/financial-information',
            permissions: ['Members.Brokerage.Read', 'Members.Brokerage.Modify'],
          },
          {
            title: 'Members Info',
            path: '/members/brokerages/members-info',
            permissions: ['Members.Brokerage.Read', 'Members.Brokerage.Modify'],
          },
          {
            title: 'Trading Offices',
            path: '/members/brokerages/trading-offices',
            permissions: ['Members.Brokerage.Read', 'Members.Brokerage.Modify'],
          },
          {
            title: 'Trading Stations',
            path: '/members/brokerages/trading-stations',
            permissions: ['Members.Brokerage.Read', 'Members.Brokerage.Modify'],
          },
          {
            title: 'Company Software',
            path: '/members/brokerages/company-software',
            permissions: ['Members.Brokerage.Read', 'Members.Brokerage.Modify'],
          },
          {
            title: 'Approvals',
            path: '/members/brokerages/approvals',
            permissions: ['Members.Brokerage.Read', 'Members.Brokerage.Modify'],
          },
          {
            title: 'Licenses',
            path: '/members/brokerages/licenses',
            permissions: ['Members.Brokerage.Read', 'Members.Brokerage.Modify'],
          },
          {
            title: 'Legal Cases',
            path: '/members/brokerages/legal-cases',
            permissions: ['Members.Brokerage.Read', 'Members.Brokerage.Modify'],
          },
          {
            title: 'Board Committees',
            path: '/members/brokerages/board-committees',
            permissions: ['Members.Brokerage.Read', 'Members.Brokerage.Modify'],
          },
          {
            title: 'Association Cooperation',
            path: '/members/brokerages/association-cooperation',
            permissions: ['Members.Brokerage.Read', 'Members.Brokerage.Modify'],
          },
        ],
      },
      {
        title: 'Investment Funds',
        children: [
          {
            title: 'General Information',
            path: '/members/investment-funds/general-information',
            permissions: ['Members.InvestmentFunds.Read', 'Members.InvestmentFunds.Modify'],
          },
          {
            title: 'Fund Manager',
            path: '/members/investment-funds/fund-manager',
            permissions: ['Members.InvestmentFunds.Read', 'Members.InvestmentFunds.Modify'],
          },
          {
            title: 'Trustee',
            path: '/members/investment-funds/trustee',
            permissions: ['Members.InvestmentFunds.Read', 'Members.InvestmentFunds.Modify'],
          },
          {
            title: 'Preferred Shareholders',
            path: '/members/investment-funds/preferred-shareholders',
            permissions: ['Members.InvestmentFunds.Read', 'Members.InvestmentFunds.Modify'],
          },
          {
            title: 'Market-Making Symbols',
            path: '/members/investment-funds/market-making-symbols',
            permissions: ['Members.InvestmentFunds.Read', 'Members.InvestmentFunds.Modify'],
          },
          {
            title: 'Managers & Staff',
            path: '/members/investment-funds/managers-staff',
            permissions: ['Members.InvestmentFunds.Read', 'Members.InvestmentFunds.Modify'],
          },
          {
            title: 'Trading Stations',
            path: '/members/investment-funds/trading-stations',
            permissions: ['Members.InvestmentFunds.Read', 'Members.InvestmentFunds.Modify'],
          },
        ],
      },
    ],
  },
  {
    // SPM (Sepinud Portfolio Management) — online investment platform,
    // back-office console. Its OWN domain: it is not part of the Members
    // Information system and must not be nested under it.
    //
    // TODO(backend): re-add the permission gates below once KSS.Service.SPM
    // exists and the SPM.* permissions are seeded in Auth and granted to a
    // role. They are intentionally omitted for now: filterMenuByRole hides any
    // item whose permissions the user lacks, and hides a parent group once all
    // its children are hidden — so gating these today would make the whole
    // section invisible while it is being reviewed on mock data.
    //   Requests           SPM.Request.Read / .Modify
    //   Orders             SPM.Order.Read / .Modify
    //   Settlements        SPM.Settlement.Read / .Modify
    //   Ledger             SPM.Ledger.Read
    //   Reconciliation     SPM.Reconciliation.Read / .Modify
    //   Adjustments        SPM.Adjustment.Read / .Approve
    //   Manual Resolution  SPM.Resolution.Read / .Modify
    //   Investor Accounts  SPM.Account.Read / .Modify
    //   Instruments        SPM.Instrument.Read / .Modify
    //   Audit Trail        SPM.Audit.Read
    //   Service Health     SPM.Health.Read
    title: 'SPM Investment',
    icon: TrendingUp,
    children: [
      { title: 'Requests', path: '/spm/requests' },
      { title: 'Orders', path: '/spm/orders' },
      { title: 'Settlements', path: '/spm/settlements' },
      { title: 'Ledger', path: '/spm/ledger' },
      { title: 'Reconciliation', path: '/spm/reconciliation' },
      { title: 'Adjustments', path: '/spm/adjustments' },
      { title: 'Manual Resolution', path: '/spm/resolution' },
      { title: 'Investor Accounts', path: '/spm/accounts' },
      { title: 'Instruments', path: '/spm/instruments' },
      { title: 'Audit Trail', path: '/spm/audit' },
      { title: 'Service Health', path: '/spm/health' },
    ],
  },
  {
    title: 'Credit Rating',
    icon: Award,
    children: [
      {
        title: 'Inquiry',
        path: '/credit-rating/report/general',
        permissions: ['CreditRating.Assessment.Read', 'CreditRating.Assessment.Modify'],
      },
      {
        title: 'Data Entry',
        path: '/credit-rating/new',
        permissions: ['CreditRating.Assessment.Read', 'CreditRating.Assessment.Modify'],
      },
      {
        title: 'Cases',
        path: '/credit-rating/list',
        permissions: ['CreditRating.Assessment.Read', 'CreditRating.Assessment.Modify'],
      },
      {
        title: 'Assets',
        path: '/credit-rating/assets',
        permissions: ['Portfolio.PersonAsset.Read', 'Portfolio.PersonAsset.Modify'],
      },
      {
        title: 'Access Management',
        path: '/credit-rating/access',
        permissions: ['CreditRating.Assessment.Read', 'CreditRating.Assessment.Modify'],
      },
    ],
  },
  {
    title: 'Cash Advance',
    icon: Wallet,
    // Permission-gated per the CashAdvance RBAC (migration 025). SuperAdmin holds
    // all CashAdvance.* permissions, so it still sees the whole section.
    permissions: [
      'CashAdvance.Request.Read',
      'CashAdvance.Invoice.Read',
      'CashAdvance.Ledger.Read',
      'CashAdvance.Admin.Read',
    ],
    children: [
      { title: 'My Cash Advance Requests', path: '/cash-advance/requests', permissions: ['CashAdvance.Request.Read'] },
      { title: 'Cash Advance Approvals', path: '/cash-advance/approvals', permissions: ['CashAdvance.Approval.Ceo', 'CashAdvance.Approval.FinancialManager'] },
      { title: 'Cash Advance Submit Invoice', path: '/cash-advance/invoice/submit', permissions: ['CashAdvance.Invoice.Submit'] },
      { title: 'Cash Advance Invoices', path: '/cash-advance/invoice/view', permissions: ['CashAdvance.Invoice.Read'] },
      { title: 'Cash Advance Ledger', path: '/cash-advance/ledger', permissions: ['CashAdvance.Ledger.Read'] },
      { title: 'Cash Advance Products', path: '/cash-advance/products', permissions: ['CashAdvance.Admin.Read'] },
      {
        title: 'Cash Advance Funds',
        permissions: ['CashAdvance.Admin.Read'],
        children: [
          { title: 'View Cash Advance', path: '/cash-advance/funds/view', permissions: ['CashAdvance.Admin.Read'] },
          { title: 'Update Cash Advance', path: '/cash-advance/funds/update', permissions: ['CashAdvance.Admin.Modify'] },
          { title: 'Add Cash Advance', path: '/cash-advance/funds/create', permissions: ['CashAdvance.Admin.Modify'] },
        ],
      },
      { title: 'Cash Advance Person Limits', path: '/cash-advance/person-limits', permissions: ['CashAdvance.Admin.Read'] },
    ],
  },
  {
    title: 'General Meeting',
    icon: Gavel,
    // Permission-gated via KSS.Service.SEBA_ERP_Members Meeting/Election RBAC.
    // SuperAdmin holds all Members.* permissions, so it still sees the whole section.
    permissions: ['Members.Meeting.Read'],
    children: [
      {
        title: 'Meeting Reports',
        permissions: ['Members.Meeting.Read'],
        children: [
          { title: 'Attendance Report', path: '/general-meeting/attendance-report', permissions: ['Members.Meeting.Read'] },
          { title: 'Election Results', path: '/general-meeting/election-report', permissions: ['Members.Meeting.Read'] },
        ],
      },
      {
        title: 'Meeting Elections',
        permissions: ['Members.Election.Manage'],
        children: [
          { title: 'Board Election', path: '/general-meeting/election', permissions: ['Members.Election.Manage'] },
          { title: 'Secret Ballot', path: '/general-meeting/hidden-election', permissions: ['Members.Election.Manage'] },
        ],
      },
      { title: 'Meeting Attendance', path: '/general-meeting/attendance', permissions: ['Members.Meeting.Read'] },
      { title: 'Meeting Candidates', path: '/general-meeting/candidates', permissions: ['Members.Election.Manage'] },
      { title: 'Meeting Management', path: '/general-meeting/meetings', permissions: ['Members.Meeting.Read'] },
    ],
  },
  {
    title: 'Project Management',
    icon: Kanban,
    // Permission-gated per the Project RBAC (migration 026). SuperAdmin holds
    // all Project.* permissions, so it still sees the whole section.
    permissions: ['Project.Project.Read', 'Project.Worksite.Read'],
    children: [
      { title: 'Project Projects', path: '/project/projects', permissions: ['Project.Project.Read'] },
      { title: 'Project Worksites', path: '/project/worksites', permissions: ['Project.Worksite.Read'] },
    ],
  },
  {
    title: 'Customer Risk',
    icon: Shield,
    // TEMP: restrict to SuperAdmin + Developer while UI is in development.
    // Migration 023's global `Developer` role lets devs preview the CRS UI
    // without SuperAdmin escalation. Replace with per-item `permissions:`
    // arrays once the CRS backend lands.
    roles: ['SuperAdmin', 'Developer'],
    children: [
      { title: 'CRS Overview', path: '/customer-risk/overview' },
      { title: 'My Risk Cases', path: '/customer-risk/cases' },
      { title: 'Risk Archive', path: '/customer-risk/archive' },
      { title: 'New Risk Case', path: '/customer-risk/new-case' },
      { title: 'Risk Search', path: '/customer-risk/search' },
      { title: 'Risk Audit Log', path: '/customer-risk/audit-log' },
      { title: 'CRS Users', path: '/customer-risk/admin/users' },
      { title: 'CRS IP Whitelist', path: '/customer-risk/admin/ip-whitelist' },
    ],
  },
  {
    // Milan Pars (MabnaERP) — a SEPARATE domain (pharma distributor ERP), not part
    // of SEBA members. Placed right after Customer Risk. The "Report" section holds
    // all MabnaERP reports, served live via KSS.Service.Report.MPF_ERP_Mabna.
    title: 'Milan Pars',
    icon: LayoutGrid,
    children: [
      {
        title: 'Milan Pars Report',
        children: [
          // Gated by the Milan.Report.Read permission (Auth migration 029).
          // The parent groups auto-hide when this leaf is filtered out.
          { title: 'Customer Statement', path: '/mpf/report', permissions: ['Milan.Report.Read'] },
        ],
      },
    ],
  },
  { heading: 'Base Information' },
  {
    title: 'Persons',
    icon: Users,
    children: [
      {
        title: 'Person View',
        path: '/person/view',
        permissions: ['Person.Information.Read', 'Person.Information.Modify'],
      },
      {
        title: 'Edit Person',
        path: '/person/edit',
        permissions: ['Person.Information.Read', 'Person.Information.Modify'],
      },
      {
        title: 'Person New',
        path: '/person/create',
        permissions: ['Person.Information.Read', 'Person.Information.Modify'],
      },
      {
        title: 'Access Management',
        path: '/person/access',
        permissions: ['Person.Access.Read', 'Person.Access.Modify'],
      },
      {
        title: 'Person Security',
        path: '/person/security',
        permissions: ['Person.Security.Read', 'Person.Security.Modify'],
      },
    ],
  },
  {
    title: 'Companies',
    icon: Building,
    children: [
      {
        title: 'Company View',
        path: '/company/view',
        permissions: ['Company.Information.Read', 'Company.Information.Modify'],
      },
      {
        title: 'Company Update',
        path: '/company/information',
        permissions: ['Company.Information.Read', 'Company.Information.Modify'],
      },
      {
        title: 'Company New',
        path: '/company/create',
        permissions: ['Company.Information.Read', 'Company.Information.Modify'],
      },
      {
        title: 'Company Access',
        path: '/company/access',
        permissions: ['Company.Access.Read', 'Company.Access.Modify'],
      },
    ],
  },
  {
    title: 'Market',
    icon: TrendingUp,
    children: [
      {
        title: 'Market Assets',
        path: '/market/assets',
        permissions: ['Market.Reference.Read', 'Market.Reference.Modify'],
      },
      {
        title: 'Market Sectors',
        path: '/market/sectors',
        permissions: ['Market.Reference.Read', 'Market.Reference.Modify'],
      },
      {
        title: 'Market Asset Types',
        path: '/market/asset-types',
        permissions: ['Market.Reference.Read', 'Market.Reference.Modify'],
      },
      {
        title: 'Market Types',
        path: '/market/market-types',
        permissions: ['Market.Reference.Read', 'Market.Reference.Modify'],
      },
    ],
  },
  { heading: 'Settings', roles: ['SuperAdmin'] },
  {
    title: 'System',
    icon: Settings,
    children: [
      { title: 'Data Upload', icon: Upload, path: '/system/import' },
      { title: 'Item Requests', icon: ScrollText, path: '/system/item-requests' },
      {
        title: 'Security',
        children: [
          {
            title: 'Roles',
            path: '/system/security/roles',
            permissions: ['System.Security.Role.Read'],
          },
          {
            title: 'Permissions',
            path: '/system/security/permissions',
            permissions: ['System.Security.Permission.Read'],
          },
          {
            title: 'Role Permissions',
            path: '/system/security/role-permissions',
            permissions: ['System.Security.RolePermission.Read'],
          },
        ],
      },
    ],
  },
  { heading: 'Template', roles: ['SuperAdmin'] },
  {
    title: 'Sample Dashboard',
    icon: LayoutDashboard,
    roles: ['SuperAdmin'],
    children: [
      { title: 'Demo 1 - Light Sidebar', path: '/dashboard-samples/demo1' },
      { title: 'Demo 1 - Dark Sidebar', path: '/dashboard-samples/dark-sidebar' },
      { title: 'Demo 2', path: '/dashboard-samples/demo2' },
      { title: 'Demo 3', path: '/dashboard-samples/demo3' },
      { title: 'Demo 4', path: '/dashboard-samples/demo4' },
      { title: 'Demo 5', path: '/dashboard-samples/demo5' },
    ],
  },
  {
    title: 'My Account',
    icon: Settings,
    roles: ['SuperAdmin'],
    children: [
      {
        title: 'Account',
        children: [
          { title: 'Get Started', path: '/account/home/get-started' },
          { title: 'User Profile', path: '/account/home/user-profile' },
          { title: 'Company Profile', path: '/account/home/company-profile' },
          {
            title: 'Settings - With Sidebar',
            path: '/account/home/settings-sidebar',
          },
          {
            title: 'Settings - Enterprise',
            path: '/account/home/settings-enterprise',
          },
          { title: 'Settings - Plain', path: '/account/home/settings-plain' },
          { title: 'Settings - Modal', path: '/account/home/settings-modal' },
          { title: 'User Profile - New', path: '/members/add/' },
        ],
      },
      {
        title: 'Billing',
        children: [
          { title: 'Billing - Basic', path: '/account/billing/basic' },
          {
            title: 'Billing - Enterprise',
            path: '/account/billing/enterprise',
          },
          { title: 'Plans', path: '/account/billing/plans' },
          { title: 'Billing History', path: '/account/billing/history' },
        ],
      },
      {
        title: 'Security',
        children: [
          { title: 'Get Started', path: '/account/security/get-started' },
          { title: 'Security Overview', path: '/account/security/overview' },
          {
            title: 'Allowed IP Addresses',
            path: '/account/security/allowed-ip-addresses',
          },
          {
            title: 'Privacy Settings',
            path: '/account/security/privacy-settings',
          },
          {
            title: 'Device Management',
            path: '/account/security/device-management',
          },
          {
            title: 'Backup & Recovery',
            path: '/account/security/backup-and-recovery',
          },
          {
            title: 'Current Sessions',
            path: '/account/security/current-sessions',
          },
          { title: 'Security Log', path: '/account/security/security-log' },
        ],
      },
      {
        title: 'Members & Roles',
        children: [
          { title: 'Teams Starter', path: '/account/members/team-starter' },
          { title: 'Teams', path: '/account/members/teams' },
          { title: 'Team Info', path: '/account/members/team-info' },
          {
            title: 'Members Starter',
            path: '/account/members/members-starter',
          },
          { title: 'Team Members', path: '/account/members/team-members' },
          { title: 'Import Members', path: '/account/members/import-members' },
          { title: 'Roles', path: '/account/members/roles' },
          {
            title: 'Permissions - Toggler',
            path: '/account/members/permissions-toggle',
          },
          {
            title: 'Permissions - Check',
            path: '/account/members/permissions-check',
          },
        ],
      },
      { title: 'Integrations', path: '/account/integrations' },
      { title: 'Notifications', path: '/account/notifications' },
      { title: 'API Keys', path: '/account/api-keys' },
      {
        title: 'More',
        collapse: true,
        collapseTitle: 'Show less',
        expandTitle: 'Show 3 more',
        children: [
          { title: 'Appearance', path: '/account/appearance' },
          { title: 'Invite a Friend', path: '/account/invite-a-friend' },
          { title: 'Activity', path: '/account/activity' },
        ],
      },
    ],
  },
  {
    title: 'User Management',
    icon: ShieldUser,
    roles: ['SuperAdmin'],
    children: [
      {
        title: 'Users',
        path: '/user-management/users',
      },
      {
        title: 'Roles',
        path: '/user-management/roles',
      },
      {
        title: 'Permissions',
        path: '/user-management/permissions',
      },
      {
        title: 'Account',
        path: '/user-management/account',
      },
      {
        title: 'Logs',
        path: '/user-management/logs',
      },
      {
        title: 'Settings',
        path: '/user-management/settings',
      },
    ],
  },
];

export const MENU_SIDEBAR_CUSTOM: MenuConfig = [
  {
    title: 'Store - Client',
    icon: Users,
    children: [
      { title: 'Home', path: '/store-client/home' },
      {
        title: 'Search Results',
        children: [
          {
            title: 'Search Results - Grid',
            path: '/store-client/search-results-grid',
          },
          {
            title: 'Search Results - List',
            path: '/store-client/search-results-list',
          },
        ],
      },
      {
        title: 'Overlays',
        children: [
          { title: 'Product Details', path: '/store-client/product-details' },
          { title: 'Wishlist', path: '/store-client/wishlist' },
        ],
      },
      {
        title: 'Checkout',
        children: [
          {
            title: 'Order Summary',
            path: '/store-client/checkout/order-summary',
          },
          {
            title: 'Shipping Info',
            path: '/store-client/checkout/shipping-info',
          },
          {
            title: 'Payment Method',
            path: '/store-client/checkout/payment-method',
          },
          {
            title: 'Order Placed',
            path: '/store-client/checkout/order-placed',
          },
        ],
      },
      { title: 'My Orders', path: '/store-client/my-orders' },
      { title: 'Order Receipt', path: '/store-client/order-receipt' },
    ],
  },
];

export const MENU_SIDEBAR_COMPACT: MenuConfig = [
  {
    title: 'Dashboards',
    icon: LayoutGrid,
    path: '/',
  },
  {
    title: 'Public Profile',
    icon: UserCircle,
    children: [
      {
        title: 'Profiles',
        children: [
          { title: 'Default', path: '/public-profile/profiles/default' },
          { title: 'Creator', path: '/public-profile/profiles/creator' },
          { title: 'Company', path: '/public-profile/profiles/company' },
          { title: 'NFT', path: '/public-profile/profiles/nft' },
          { title: 'Blogger', path: '/public-profile/profiles/blogger' },
          { title: 'CRM', path: '/public-profile/profiles/crm' },
          {
            title: 'More',
            collapse: true,
            collapseTitle: 'Show less',
            expandTitle: 'Show 4 more',
            children: [
              { title: 'Gamer', path: '/public-profile/profiles/gamer' },
              { title: 'Feeds', path: '/public-profile/profiles/feeds' },
              { title: 'Plain', path: '/public-profile/profiles/plain' },
              { title: 'Modal', path: '/public-profile/profiles/modal' },
            ],
          },
        ],
      },
      {
        title: 'Projects',
        children: [
          { title: '3 Columns', path: '/public-profile/projects/3-columns' },
          { title: '2 Columns', path: '/public-profile/projects/2-columns' },
        ],
      },
      { title: 'Works', path: '/public-profile/works' },
      { title: 'Teams', path: '/public-profile/teams' },
      { title: 'Network', path: '/public-profile/network' },
      { title: 'Activity', path: '/public-profile/activity' },
      {
        title: 'More',
        collapse: true,
        collapseTitle: 'Show less',
        expandTitle: 'Show 3 more',
        children: [
          { title: 'Campaigns - Card', path: '/public-profile/campaigns/card' },
          { title: 'Campaigns - List', path: '/public-profile/campaigns/list' },
          { title: 'Empty', path: '/public-profile/empty' },
        ],
      },
    ],
  },
  {
    title: 'My Account',
    icon: Settings,
    children: [
      {
        title: 'Account',
        children: [
          { title: 'Get Started', path: '/account/home/get-started' },
          { title: 'User Profile', path: '/account/home/user-profile' },
          { title: 'Company Profile', path: '/account/home/company-profile' },
          {
            title: 'Settings - With Sidebar',
            path: '/account/home/settings-sidebar',
          },
          {
            title: 'Settings - Enterprise',
            path: '/account/home/settings-enterprise',
          },
          { title: 'Settings - Plain', path: '/account/home/settings-plain' },
          { title: 'Settings - Modal', path: '/account/home/settings-modal' },
        ],
      },
      {
        title: 'Billing',
        children: [
          { title: 'Billing - Basic', path: '/account/billing/basic' },
          {
            title: 'Billing - Enterprise',
            path: '/account/billing/enterprise',
          },
          { title: 'Plans', path: '/account/billing/plans' },
          { title: 'Billing History', path: '/account/billing/history' },
        ],
      },
      {
        title: 'Security',
        children: [
          { title: 'Get Started', path: '/account/security/get-started' },
          { title: 'Security Overview', path: '/account/security/overview' },
          {
            title: 'Allowed IP Addresses',
            path: '/account/security/allowed-ip-addresses',
          },
          {
            title: 'Privacy Settings',
            path: '/account/security/privacy-settings',
          },
          {
            title: 'Device Management',
            path: '/account/security/device-management',
          },
          {
            title: 'Backup & Recovery',
            path: '/account/security/backup-and-recovery',
          },
          {
            title: 'Current Sessions',
            path: '/account/security/current-sessions',
          },
          { title: 'Security Log', path: '/account/security/security-log' },
        ],
      },
      {
        title: 'Members & Roles',
        children: [
          { title: 'Teams Starter', path: '/account/members/team-starter' },
          { title: 'Teams', path: '/account/members/teams' },
          { title: 'Team Info', path: '/account/members/team-info' },
          {
            title: 'Members Starter',
            path: '/account/members/members-starter',
          },
          { title: 'Team Members', path: '/account/members/team-members' },
          { title: 'Import Members', path: '/account/members/import-members' },
          { title: 'Roles', path: '/account/members/roles' },
          {
            title: 'Permissions - Toggler',
            path: '/account/members/permissions-toggle',
          },
          {
            title: 'Permissions - Check',
            path: '/account/members/permissions-check',
          },
        ],
      },
      { title: 'Integrations', path: '/account/integrations' },
      { title: 'Notifications', path: '/account/notifications' },
      { title: 'API Keys', path: '/account/api-keys' },
      {
        title: 'More',
        collapse: true,
        collapseTitle: 'Show less',
        expandTitle: 'Show 3 more',
        children: [
          { title: 'Appearance', path: '/account/appearance' },
          { title: 'Invite a Friend', path: '/account/invite-a-friend' },
          { title: 'Activity', path: '/account/activity' },
        ],
      },
    ],
  },
  {
    title: 'Network',
    icon: Users,
    children: [
      { title: 'Get Started', path: '/network/get-started' },
      {
        title: 'User Cards',
        children: [
          { title: 'Mini Cards', path: '/network/user-cards/mini-cards' },
          { title: 'Team Crew', path: '/network/user-cards/team-crew' },
          { title: 'Author', path: '/network/user-cards/author' },
          { title: 'NFT', path: '/network/user-cards/nft' },
          { title: 'Social', path: '/network/user-cards/social' },
        ],
      },
      {
        title: 'User Table',
        children: [
          { title: 'Team Crew', path: '/network/user-table/team-crew' },
          { title: 'App Roster', path: '/network/user-table/app-roster' },
          {
            title: 'Market Authors',
            path: '/network/user-table/market-authors',
          },
          { title: 'SaaS Users', path: '/network/user-table/saas-users' },
          { title: 'Store Clients', path: '/network/user-table/store-clients' },
          { title: 'Visitors', path: '/network/user-table/visitors' },
        ],
      },
      { title: 'Cooperations', path: '/network/cooperations', disabled: true },
      { title: 'Leads', path: '/network/leads', disabled: true },
      { title: 'Donators', path: '/network/donators', disabled: true },
    ],
  },
  {
    title: 'Store - Client',
    icon: ShoppingCart,
    children: [
      { title: 'Home', path: '/store-client/home' },
      {
        title: 'Search Results - Grid',
        path: '/store-client/search-results-grid',
      },
      {
        title: 'Search Results - List',
        path: '/store-client/search-results-list',
      },
      { title: 'Product Details', path: '/store-client/product-details' },
      { title: 'Wishlist', path: '/store-client/wishlist' },
      {
        title: 'Checkout',
        children: [
          {
            title: 'Order Summary',
            path: '/store-client/checkout/order-summary',
          },
          {
            title: 'Shipping Info',
            path: '/store-client/checkout/shipping-info',
          },
          {
            title: 'Payment Method',
            path: '/store-client/checkout/payment-method',
          },
          {
            title: 'Order Placed',
            path: '/store-client/checkout/order-placed',
          },
        ],
      },
      { title: 'My Orders', path: '/store-client/my-orders' },
      { title: 'Order Receipt', path: '/store-client/order-receipt' },
    ],
  },
  {
    title: 'User Management',
    icon: ShieldUser,
    children: [
      {
        title: 'Users',
        path: '/user-management/users',
      },
      {
        title: 'Roles',
        path: '/user-management/roles',
      },
      {
        title: 'Permissions',
        path: '/user-management/permissions',
      },
      {
        title: 'Account',
        path: '/user-management/account',
      },
      {
        title: 'Logs',
        path: '/user-management/logs',
      },
      {
        title: 'Settings',
        path: '/user-management/settings',
      },
    ],
  },
  {
    title: 'Authentication',
    icon: Shield,
    children: [
      {
        title: 'Sign In',
        path: '/signin',
      },
      {
        title: 'Check Email',
        path: '/signup',
      },
      {
        title: 'Reset Password',
        path: '/reset-password',
      },
      {
        title: '2FA',
        path: '/2fa',
      },
      { title: 'Welcome Message', path: '/auth/welcome-message' },
      { title: 'Account Deactivated', path: '/auth/account-deactivated' },
      { title: 'Error 404', path: '/error/404' },
      { title: 'Error 500', path: '/error/500' },
    ],
  },
];

export const MENU_MEGA: MenuConfig = [
  { title: 'Home', path: '/' },
  { title: 'Site', path: 'https://seba.ir' },
  { title: 'Sazesh', path: 'https://sazesh.seba.ir' },
  { title: 'LMS', path: 'https://lms.seba.ir' },
];

export const MENU_MEGA_MOBILE: MenuConfig = [
  { title: 'Home', path: '/' },
  {
    title: 'Profiles',
    children: [
      {
        title: 'Profiles',
        children: [
          {
            title: 'Default',
            icon: Badge,
            path: '/public-profile/profiles/default',
          },
          {
            title: 'Creator',
            icon: Coffee,
            path: '/public-profile/profiles/creator',
          },
          {
            title: 'Company',
            icon: Building,
            path: '/public-profile/profiles/company',
          },
          { title: 'NFT', icon: Bitcoin, path: '/public-profile/profiles/nft' },
          {
            title: 'Blogger',
            icon: MessageSquare,
            path: '/public-profile/profiles/blogger',
          },
          { title: 'CRM', icon: Monitor, path: '/public-profile/profiles/crm' },
          {
            title: 'Gamer',
            icon: Ghost,
            path: '/public-profile/profiles/gamer',
          },
          {
            title: 'Feeds',
            icon: Book,
            path: '/public-profile/profiles/feeds',
          },
          {
            title: 'Plain',
            icon: File,
            path: '/public-profile/profiles/plain',
          },
          {
            title: 'Modal',
            icon: SquareMousePointer,
            path: '/public-profile/profiles/modal',
          },
          { title: 'Freelancer', icon: Briefcase, path: '#', disabled: true },
          { title: 'Developer', icon: Code, path: '#', disabled: true },
          { title: 'Team', icon: Users, path: '#', disabled: true },
          { title: 'Events', icon: CalendarCheck, path: '#', disabled: true },
        ],
      },
      {
        title: 'Other Pages',
        children: [
          {
            title: 'Projects - 3 Cols',
            icon: Layout,
            path: '/public-profile/projects/3-columns',
          },
          {
            title: 'Projects - 2 Cols',
            icon: Grid,
            path: '/public-profile/projects/2-columns',
          },
          { title: 'Works', icon: WorkIcon, path: '/public-profile/works' },
          { title: 'Teams', icon: PeopleIcon, path: '/public-profile/teams' },
          { title: 'Network', icon: Network, path: '/public-profile/network' },
          {
            title: 'Activity',
            icon: TrendingUp,
            path: '/public-profile/activity',
          },
          {
            title: 'Campaigns - Card',
            icon: LayoutGrid,
            path: '/public-profile/campaigns/card',
          },
          {
            title: 'Campaigns - List',
            icon: Kanban,
            path: '/public-profile/campaigns/list',
          },
          { title: 'Empty', icon: FileText, path: '/public-profile/empty' },
          { title: 'Documents', icon: DocumentIcon, path: '#', disabled: true },
          { title: 'Badges', icon: Award, path: '#', disabled: true },
          { title: 'Awards', icon: Gift, path: '#', disabled: true },
        ],
      },
    ],
  },
  {
    title: 'My Account',
    children: [
      {
        title: 'General Pages',
        children: [
          { title: 'Integrations', icon: Plug, path: '/account/integrations' },
          {
            title: 'Notifications',
            icon: Bell,
            path: '/account/notifications',
          },
          { title: 'API Keys', icon: Key, path: '/account/api-keys' },
          { title: 'Appearance', icon: Eye, path: '/account/appearance' },
          {
            title: 'Invite a Friend',
            icon: UserCheck,
            path: '/account/invite-a-friend',
          },
          { title: 'Activity', icon: LifeBuoy, path: '/account/activity' },
          { title: 'Brand', icon: CheckCircle, disabled: true },
          { title: 'Get Paid', icon: Euro, disabled: true },
        ],
      },
      {
        title: 'Other pages',
        children: [
          {
            title: 'Account Home',
            children: [
              { title: 'Get Started', path: '/account/home/get-started' },
              { title: 'User Profile', path: '/account/home/user-profile' },
              {
                title: 'Company Profile',
                path: '/account/home/company-profile',
              },
              { title: 'With Sidebar', path: '/account/home/settings-sidebar' },
              {
                title: 'Enterprise',
                path: '/account/home/settings-enterprise',
              },
              { title: 'Plain', path: '/account/home/settings-plain' },
              { title: 'Modal', path: '/account/home/settings-modal' },
            ],
          },
          {
            title: 'Billing',
            children: [
              { title: 'Basic Billing', path: '/account/billing/basic' },
              { title: 'Enterprise', path: '/account/billing/enterprise' },
              { title: 'Plans', path: '/account/billing/plans' },
              { title: 'Billing History', path: '/account/billing/history' },
              { title: 'Tax Info', disabled: true },
              { title: 'Invoices', disabled: true },
              { title: 'Gateaways', disabled: true },
            ],
          },
          {
            title: 'Security',
            children: [
              { title: 'Get Started', path: '/account/security/get-started' },
              {
                title: 'Security Overview',
                path: '/account/security/overview',
              },
              {
                title: 'IP Addresses',
                path: '/account/security/allowed-ip-addresses',
              },
              {
                title: 'Privacy Settings',
                path: '/account/security/privacy-settings',
              },
              {
                title: 'Device Management',
                path: '/account/security/device-management',
              },
              {
                title: 'Backup & Recovery',
                path: '/account/security/backup-and-recovery',
              },
              {
                title: 'Current Sessions',
                path: '/account/security/current-sessions',
              },
              { title: 'Security Log', path: '/account/security/security-log' },
            ],
          },
          {
            title: 'Members & Roles',
            children: [
              { title: 'Teams Starter', path: '/account/members/team-starter' },
              { title: 'Teams', path: '/account/members/teams' },
              { title: 'Team Info', path: '/account/members/team-info' },
              {
                title: 'Members Starter',
                path: '/account/members/members-starter',
              },
              { title: 'Team Members', path: '/account/members/team-members' },
              {
                title: 'Import Members',
                path: '/account/members/import-members',
              },
              { title: 'Roles', path: '/account/members/roles' },
              {
                title: 'Permissions - Toggler',
                path: '/account/members/permissions-toggle',
              },
              {
                title: 'Permissions - Check',
                path: '/account/members/permissions-check',
              },
            ],
          },
          {
            title: 'Other Pages',
            children: [
              { title: 'Integrations', path: '/account/integrations' },
              { title: 'Notifications', path: '/account/notifications' },
              { title: 'API Keys', path: '/account/api-keys' },
              { title: 'Appearance', path: '/account/appearance' },
              { title: 'Invite a Friend', path: '/account/invite-a-friend' },
              { title: 'Activity', path: '/account/activity' },
            ],
          },
        ],
      },
    ],
  },
  {
    title: 'Network',
    children: [
      {
        title: 'General Pages',
        children: [
          { title: 'Get Started', icon: Flag, path: '/network/get-started' },
          { title: 'Colleagues', icon: Users, path: '#', disabled: true },
          { title: 'Donators', icon: Heart, path: '#', disabled: true },
          { title: 'Leads', icon: Zap, path: '#', disabled: true },
        ],
      },
      {
        title: 'Other pages',
        children: [
          {
            title: 'User Cards',
            children: [
              { title: 'Mini Cards', path: '/network/user-cards/mini-cards' },
              { title: 'Team Members', path: '/network/user-cards/team-crew' },
              { title: 'Authors', path: '/network/user-cards/author' },
              { title: 'NFT Users', path: '/network/user-cards/nft' },
              { title: 'Social Users', path: '/network/user-cards/social' },
              { title: 'Gamers', path: '#', disabled: true },
            ],
          },
          {
            title: 'User Base',
            badge: 'Datatables',
            children: [
              { title: 'Team Crew', path: '/network/user-table/team-crew' },
              { title: 'App Roster', path: '/network/user-table/app-roster' },
              {
                title: 'Market Authors',
                path: '/network/user-table/market-authors',
              },
              { title: 'SaaS Users', path: '/network/user-table/saas-users' },
              {
                title: 'Store Clients',
                path: '/network/user-table/store-clients',
              },
              { title: 'Visitors', path: '/network/user-table/visitors' },
            ],
          },
        ],
      },
    ],
  },
  {
    title: 'User Management',
    icon: Users,
    children: [
      {
        title: 'Users',
        path: '/user-management/users',
      },
      {
        title: 'Roles',
        path: '/user-management/roles',
      },
      {
        title: 'Permissions',
        path: '/user-management/permissions',
      },
      {
        title: 'Account',
        path: '/user-management/account',
      },
      {
        title: 'Logs',
        path: '/user-management/logs',
      },
      {
        title: 'Settings',
        path: '/user-management/settings',
      },
    ],
  },
  {
    title: 'Store - Client',
    children: [
      { title: 'Home', path: '/store-client/home' },
      {
        title: 'Search Results - Grid',
        path: '/store-client/search-results-grid',
      },
      {
        title: 'Search Results - List',
        path: '/store-client/search-results-list',
      },
      { title: 'Product Details', path: '/store-client/product-details' },
      { title: 'Wishlist', path: '/store-client/wishlist' },
      {
        title: 'Checkout',
        children: [
          {
            title: 'Order Summary',
            path: '/store-client/checkout/order-summary',
          },
          {
            title: 'Shipping Info',
            path: '/store-client/checkout/shipping-info',
          },
          {
            title: 'Payment Method',
            path: '/store-client/checkout/payment-method',
          },
          {
            title: 'Order Placed',
            path: '/store-client/checkout/order-placed',
          },
        ],
      },
      { title: 'My Orders', path: '/store-client/my-orders' },
      { title: 'Order Receipt', path: '/store-client/order-receipt' },
    ],
  },
];

export const MENU_HELP: MenuConfig = [
  {
    title: 'Getting Started',
    icon: Coffee,
    path: 'https://keenthemes.com/metronic/tailwind/docs/getting-started/installation',
  },
  {
    title: 'Support Forum',
    icon: AlertCircle,
    children: [
      {
        title: 'All Questions',
        icon: FileQuestion,
        path: 'https://devs.keenthemes.com',
      },
      {
        title: 'Popular Questions',
        icon: Star,
        path: 'https://devs.keenthemes.com/popular',
      },
      {
        title: 'Ask Question',
        icon: HelpCircle,
        path: 'https://devs.keenthemes.com/question/create',
      },
    ],
  },
  {
    title: 'Licenses & FAQ',
    icon: Captions,
    path: 'https://keenthemes.com/metronic/tailwind/docs/getting-started/license',
  },
  {
    title: 'Documentation',
    icon: FileQuestion,
    path: 'https://keenthemes.com/metronic/tailwind/docs',
  },
  { separator: true },
  { title: 'Contact Us', icon: Share2, path: 'https://keenthemes.com/contact' },
];

export const MENU_ROOT: MenuConfig = [
  {
    title: 'Public Profile',
    icon: UserCircle,
    rootPath: '/public-profile/',
    path: '/public-profile/profiles/default',
    childrenIndex: 2,
  },
  {
    title: 'Account',
    icon: Settings,
    rootPath: '/account/',
    path: '/',
    childrenIndex: 3,
  },
  {
    title: 'Network',
    icon: Users,
    rootPath: '/network/',
    path: '/network/get-started',
    childrenIndex: 4,
  },
  {
    title: 'Authentication',
    icon: Shield,
    rootPath: '/authentication/',
    path: '/authentication/get-started',
    childrenIndex: 5,
  },
  {
    title: 'Store - Client',
    icon: ShoppingCart,
    rootPath: '/store-client/',
    path: '/store-client/home',
    childrenIndex: 6,
  },
  {
    title: 'User Management',
    icon: ShieldUser,
    rootPath: '/user-management/',
    path: '/user-management/users',
    childrenIndex: 7,
    roles: ['SuperAdmin'],
  },
];

// Functions to generate translated menu configurations
export function getTranslatedMenuSidebar(t: (key: string) => string): MenuConfig {
  return translateMenuItems(MENU_SIDEBAR, t);
}

export function getTranslatedMenuSidebarCustom(t: (key: string) => string): MenuConfig {
  return translateMenuItems(MENU_SIDEBAR_CUSTOM, t);
}

export function getTranslatedMenuSidebarCompact(t: (key: string) => string): MenuConfig {
  return translateMenuItems(MENU_SIDEBAR_COMPACT, t);
}

export function getTranslatedMenuMega(t: (key: string) => string): MenuConfig {
  return translateMenuItems(MENU_MEGA, t);
}

export function getTranslatedMenuMegaMobile(t: (key: string) => string): MenuConfig {
  return translateMenuItems(MENU_MEGA_MOBILE, t);
}

export function getTranslatedMenuHelp(t: (key: string) => string): MenuConfig {
  return translateMenuItems(MENU_HELP, t);
}

export function getTranslatedMenuRoot(t: (key: string) => string): MenuConfig {
  return translateMenuItems(MENU_ROOT, t);
}
