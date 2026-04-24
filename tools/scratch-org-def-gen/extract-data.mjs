// One-time data extractor. Run:  node extract-data.mjs
// Produces data/features.js, data/settings.js, data/categories.js.
//
// Each feature entry contains an embedded `settings` array listing the setting
// types and fields that belong to it. Mapping sources, in priority order:
//   1. Salesforce docs "### (Sample) Scratch Org Definition File" JSON examples
//      embedded in Scratch Org Features.txt (authoritative).
//   2. "you must also include <settingsType> > <fieldName>" sentences parsed
//      from feature descriptions (authoritative for `required: true`).
//   3. MANUAL_FEATURE_SETTINGS below — your 38-feature curated map (the ones
//      from the old admin.html DEFAULT_FEATURES_DATA).
//   4. Name-based heuristic (e.g. Entitlements -> EntitlementSettings) as a
//      soft fallback so the feature card at least points at a plausible
//      setting group.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FEATURES_TXT = path.join(__dirname, 'Scratch org features and Settings', 'Scratch Org Features.txt');
const SETTINGS_JSON = path.join(__dirname, 'Scratch org features and Settings', 'metadata_settings.json');
const OUT_DIR = path.join(__dirname, 'data');

// ================================================================
// Categories
// ================================================================
const CATEGORIES = [
    { id: 'core-platform',     label: 'Core Platform',         description: 'Baseline org, licenses, Person Accounts, picklists, multi-currency, record types.' },
    { id: 'apex-dev',          label: 'Apex & Development',    description: 'Apex, Deployment, DevHub, AuthorApex, debug log, transaction finalizers.' },
    { id: 'security-identity', label: 'Security & Identity',   description: 'Security, sessions, passwords, MFA, SSO, SAML, encryption, privacy.' },
    { id: 'user-management',   label: 'Users & Permissions',   description: 'Profiles, permission sets, user management, user license quotas.' },
    { id: 'data-storage',      label: 'Data & Storage',        description: 'Big Objects, data import, Data.com, field history, storage.' },
    { id: 'sales',             label: 'Sales Cloud',           description: 'Opportunities, Forecasts, Quotes, Contracts, Leads, Territory.' },
    { id: 'service',           label: 'Service Cloud',         description: 'Cases, Entitlements, Knowledge, Omni-Channel, Live Agent, Macros.' },
    { id: 'experience',        label: 'Experience Cloud',      description: 'Communities, Experience Bundles, Sites, guest users, CMS.' },
    { id: 'marketing',         label: 'Marketing & Pardot',    description: 'Pardot (MCAE), Pardot Einstein, AI Attribution.' },
    { id: 'commerce',          label: 'Commerce',              description: 'B2B/B2C Commerce, storefronts, Order Management, Payments.' },
    { id: 'revenue-billing',   label: 'Revenue & Billing',     description: 'CPQ, Billing Advanced, Subscription Management, Sales Agreements.' },
    { id: 'analytics-data',    label: 'Analytics & Data',      description: 'CRM Analytics, Wave, Data Cloud / CDP, Einstein Activity Capture.' },
    { id: 'einstein-ai',       label: 'Einstein & Agentforce', description: 'Agentforce, Copilot, Einstein GPT, Bots, Prediction Builder.' },
    { id: 'field-service',     label: 'Field Service',         description: 'Field Service, Work Orders, Dispatch, Warranty.' },
    { id: 'industries',        label: 'Industries',            description: 'Financial Services, Health, Manufacturing, Public Sector, Education, Auto, Nonprofit, Net Zero.' },
    { id: 'integration-api',   label: 'Integration & APIs',    description: 'Connected Apps, External Services, Platform Events, Streaming, Bulk, CDC.' },
    { id: 'mobile-collab',     label: 'Mobile & Collab',       description: 'Mobile, Chatter, Content, Files, Email Admin.' },
    { id: 'limits-quotas',     label: 'Limits & Quotas',       description: 'Numeric quota features (AddCustomApps, CalloutSizeMB, StreamingEventsPerDay, ...).' },
];

// ================================================================
// Categorization rules
// ================================================================
const RULES = [
    [/(Agentforce|Einstein|EinsteinGpt|Copilot|Gpt|^Bot|PromptTemplate|Prediction|AiReply|AIReply|AIAttribution)/i, 'einstein-ai'],
    [/(Pardot|MarketingSetup|MarketingUser|MCAE|MarketingCloud|SalesforceHostedMCP)/i, 'marketing'],
    [/(^B2B|^B2C|B2BCommerce|B2CCommerce|Commerce|Storefront|Payments?|OrderManagement)/i, 'commerce'],
    [/(Revenue|Billing|CPQ|Subscription|SalesAgreement|UsageManagement|Advanced ?Currency|BillingAdvanced)/i, 'revenue-billing'],
    [/(FieldService|WorkOrder|Dispatch|Warranty|MfgService)/i, 'field-service'],
    [/(Financial|FSC|Health|HLS|^HC|Manufacturing|Mfg|PublicSector|Education|Admissions|Advisor|StudentSuccess|Automotive|Nonprofit|NPSP|NetZero|Sustainability|Loyalty|Volunteer|Insurance|BusinessRulesEngine|Assessments?|ConsumerGoods|RetailExecution|MediaCloud|UtilitiesCloud|BenefitManagement|TalentRecruitment|Grantmaking|AccountingSubledger|PartyDataModel|PersonLifeEvent|PartyRelationship|Industries|Fundraising|ProgramManagement|OutcomeManagement|RateManagement|ProviderManagement|PSSAssetManagement|DisclosureFramework|BranchManagement|BudgetManagement|AssociationEngine|DocGen|IntelligentDocumentReader|DocumentReaderPageLimit|DocumentChecklist|ExpressionSetMax|DecisionTable|MedVis|BatchManagement|ProductCatalogManagement|SalesforcePricing|Interaction|ActionPlan|CompliantDataSharing|ObjectLinking|LightningScheduler)/i, 'industries'],
    [/(Communit|Experience|^Site|CMS|ExperienceBundle|ArcGraph)/i, 'experience'],
    [/(Analytics|Wave|Tableau|DataCloud|CDP|EAC|EinsteinActivityCapture|SentimentInsights|Insights|CustomerDataPlatform|^EA[A-Z]|CompareReports|PipelineInspection|ConsentEventStream|EventLogFile)/i, 'analytics-data'],
    [/(Omni|Case|Entitlement|Knowledge|LiveAgent|LiveMessage|Macro|QuickText|Service(Cloud|Setup|User|Catalog)?|IncidentMgmt|SocialCustomerService|ChannelMenu|Voice)/i, 'service'],
    [/(Opportunity|Forecast|Quote|Contract|Lead|Territory|SalesUser|SalesConsole|Campaign|HighVelocitySales|Meetings|ConversationalIntelligence|AutomatedContacts|Path|AccountPlan|Account(Settings|Insights|Intelligence))/i, 'sales'],
    [/(Apex|DevHub|DevOps|Deployment|AuthorApex|TransactionFinalizer|CodeBuilder|ApexGuru|Debugger|SessionIdInLog|Schema|Flow|InvocableAction|ExternalClientApp|ProcessBuilder|Workflow|DataProcessingEngine|Enablement|CustomNotificationType|CustomFieldDataTranslation|EntityTranslation|CloneApplication|Explainability)/i, 'apex-dev'],
    [/(Security|Session|Password|Mfa|Saml|Oauth|Oidc|Encryption|Privacy|Identity|CacheOnlyKey|PlatformEncryption|RealTimeEvent|EventMonitoring|SecurityEvent|AllUserIdServiceAccess|MyDomain|FileUpload|DataMask|FieldAuditTrail|DeviceTracking|SCIMProtocol|MutualAuthentication|DeferSharingCalc|DisableManageIdConf|EnableManageIdConf|MinKeyRotationInterval|DSARPortability|DisclosureFrame|IgnoreQueryParamWhitelist|EmbeddedLogin|ConAppPluginExecuteAsUser|ConsentEventStream|FinanceLogging)/i, 'security-identity'],
    [/(User(Management|Engagement)|Profile(Setting|s)|PermissionSet|EmployeeUser|TrialOrg|Sandbox|OrgPreference|Company|TrailheadSettings|UserInterface|RecordPage|Actions|DynamicForms|AppExperience|LightningExperience|AppAnalytics)/i, 'user-management'],
    [/(BigObject|DataImport|DataDotCom|FieldHistory|AdditionalFieldHistory|AdditionalData|StorageGB|PerUserStorage|PlatformCacheMB|WaveMaxCurrency)/i, 'data-storage'],
    [/(Mobile|Chatter|Content|Files|Email(Admin|Authoriz|Integration|Template|ToCase)?|WebToCase|WorkDotCom|WorkforceEngagement|Ideas|EnhancedNotes|ChatterAnswers|Trailhead|Survey|Macros|MailMerge|InterestTagging|Briefcase)/i, 'mobile-collab'],
    [/(ConnectedApp|ExternalClient|ExternalServices|PlatformEvent|Streaming|CDC|^Api|BulkApi|BigObjectsBulk|NamedCredential|BYOCCaaS|BYOOTT|IframeWhiteList|ChangeDataCapture|IoT|PlatformConnect|ForceComPlatform|EmpPublishRateLimit|EAOutputConnectors|EASyncOut|DynamicClientCreationLimit)/i, 'integration-api'],
    [/^(Add[A-Z]|MaxCustom|Max[A-Z]|StreamingEventsPerDay|SubPerStream|CalloutSizeMB|MaxNumberSiteReq|Timeline(Conditions|Event|RecordType)Limit|AssetScheduling|AdditionalFieldHistory|HoursBetweenCoverageJob|ConsolePersistenceInterval|S1ClientComponentCacheSize|DocumentReaderPageLimit|DynamicClientCreationLimit|EmpPublishRateLimit|LongLayoutSectionTitles|MinKeyRotationInterval|ExpressionSetMax)/i, 'limits-quotas'],
];

const OVERRIDES = {
    // Features
    API: 'integration-api', AuthorApex: 'apex-dev', StreamingAPI: 'integration-api',
    CacheOnlyKeys: 'security-identity', CascadeDelete: 'core-platform', PersonAccounts: 'core-platform',
    MultiCurrency: 'core-platform', StateAndCountryPicklist: 'core-platform', Workflow: 'apex-dev',
    SharedActivities: 'sales', Sites: 'experience', ServiceCloud: 'service', ServiceUser: 'service',
    SalesUser: 'sales', MarketingUser: 'marketing', WorkDotCom: 'mobile-collab',
    WavePlatform: 'analytics-data', AnalyticsAdminPerms: 'analytics-data', AnalyticsAppEmbedded: 'analytics-data',
    ApexGuruCodeAnalyzer: 'apex-dev', SustainabilityCloud: 'industries', SustainabilityApp: 'industries',
    AccountInspection: 'sales', EinsteinActivityCapture: 'sales', EinsteinSearch: 'einstein-ai',
    SentimentInsightsFeature: 'analytics-data', ArcGraphCommunity: 'experience', Assessments: 'industries',
    AssetScheduling: 'field-service', Chatbot: 'einstein-ai', ScvMultipartyAndConsult: 'service',
    ConAppPluginExecuteAsUser: 'integration-api', JigsawUser: 'data-storage', PipelineInspection: 'sales',
    PlatformCache: 'apex-dev', ProviderFreePlatformCache: 'apex-dev', RecordTypes: 'core-platform',
    Division: 'core-platform', MultiLevelMasterDetail: 'core-platform', ObjectLinking: 'core-platform',
    EnablePRM: 'experience', ProductsAndSchedules: 'sales', OrderSaveLogicEnabled: 'commerce',
    OrderSaveBehaviorBoth: 'commerce', DataComDnbAccounts: 'data-storage', DataComFullClean: 'data-storage',
    SalesforceFeedbackManagementStarter: 'mobile-collab', TimeSheetTemplateSettings: 'field-service',
    WorkThanksPref: 'mobile-collab', WorkplaceCommandCenterUser: 'mobile-collab',
    GuidanceHubAllowed: 'user-management', DocumentGenerationSetting: 'apex-dev',
    Fundraising: 'industries', EAndUDigitalSales: 'industries', CGAnalytics: 'industries',
    CaseClassification: 'einstein-ai', CaseWrapUp: 'service', CampaignInfluence2: 'sales',
    BudgetManagement: 'industries', Interaction: 'industries', BigObjectsBulkAPI: 'data-storage',
    CustomerDataPlatform: 'analytics-data', CustomerDataPlatformLite: 'analytics-data',
    EnableSetPasswordInApi: 'core-platform',
    Einstein1AIPlatform: 'einstein-ai',

    // Settings
    AccountSettings: 'sales', AccountPlanSettings: 'sales', AccountInsightsSettings: 'sales',
    AccountIntelligenceSettings: 'sales', AccountingSettings: 'industries', ActivitiesSettings: 'sales',
    ActionsSettings: 'user-management', AddressSettings: 'core-platform',
    AgentPlatformSettings: 'einstein-ai', AgentforceForDevelopersSettings: 'einstein-ai',
    AIReplyRecommendationsSettings: 'einstein-ai', AnalyticsSettings: 'analytics-data',
    ApexSettings: 'apex-dev', AppAnalyticsSettings: 'user-management', AppExperienceSettings: 'user-management',
    AssociationEngineSettings: 'industries', AutomatedContactsSettings: 'sales', BotSettings: 'einstein-ai',
    BranchManagementSettings: 'industries', BusinessHoursSettings: 'core-platform', CampaignSettings: 'sales',
    CaseSettings: 'service', EmailToCaseSettings: 'service', WebToCaseSettings: 'service',
    ChatterAnswersSettings: 'mobile-collab', ChatterEmailsMDSettings: 'mobile-collab',
    ChatterSettings: 'mobile-collab', CodeBuilderSettings: 'apex-dev',
    CollectionsDashboardSettings: 'industries', CommunitiesSettings: 'experience',
    CompanySettings: 'core-platform', ConnectedAppSettings: 'integration-api',
    ContentSettings: 'mobile-collab', ContractSettings: 'sales',
    ConversationalIntelligenceSettings: 'sales', CurrencySettings: 'core-platform',
    CustomAddressFieldSettings: 'core-platform', DataDotComSettings: 'data-storage',
    DataImportManagementSettings: 'data-storage', DeploymentSettings: 'apex-dev',
    DevHubSettings: 'apex-dev', DynamicFormsSettings: 'user-management', EACSettings: 'sales',
    EinsteinAISettings: 'einstein-ai', EinsteinAgentSettings: 'einstein-ai',
    EinsteinGptSettings: 'einstein-ai', EmailAdministrationSettings: 'mobile-collab',
    EmailAuthorizationSettings: 'mobile-collab', EmailIntegrationSettings: 'mobile-collab',
    EmailTemplateSettings: 'mobile-collab', EmployeeUserSettings: 'user-management',
    EnhancedNotesSettings: 'mobile-collab', EncryptionKeySettings: 'security-identity',
    EntitlementSettings: 'service', EventSettings: 'sales', ExperienceBundleSettings: 'experience',
    ExternalClientAppSettings: 'integration-api', ExternalServicesSettings: 'integration-api',
    FieldServiceSettings: 'field-service', FilesConnectSettings: 'mobile-collab',
    FileUploadAndDownloadSecuritySettings: 'security-identity', FlowSettings: 'apex-dev',
    ForecastingObjectListSettings: 'sales', ForecastingSettings: 'sales', HighVelocitySalesSettings: 'sales',
    IdeasSettings: 'mobile-collab', IdentityProviderSettings: 'security-identity',
    IframeWhiteListUrlSettings: 'security-identity', IncidentMgmtSettings: 'service',
    IndustriesEinsteinFeatureSettings: 'industries', IndustriesLoyaltySettings: 'industries',
    IndustriesSettings: 'industries', InterestTaggingSettings: 'mobile-collab',
    InventorySettings: 'industries', InvLatePymntRiskCalcSettings: 'industries',
    InvocableActionSettings: 'apex-dev', KnowledgeSettings: 'service', LanguageSettings: 'core-platform',
    LeadConfigSettings: 'sales', LeadConvertSettings: 'sales', LiveAgentSettings: 'service',
    LightningExperienceSettings: 'user-management', LiveMessageSettings: 'service', MacroSettings: 'service',
    MailMergeSettings: 'mobile-collab', MapAndLocationSettings: 'core-platform', MeetingsSettings: 'sales',
    MobileSettings: 'mobile-collab', MyDomainSettings: 'security-identity',
    MfgServiceConsoleSettings: 'field-service', NameSettings: 'core-platform',
    NotificationsSettings: 'core-platform', OauthOidcSettings: 'security-identity',
    OmniChannelSettings: 'service', OpportunityInsightsSettings: 'sales', OpportunitySettings: 'sales',
    OpportunityScoreSettings: 'sales', OrderManagementSettings: 'commerce', OrderSettings: 'commerce',
    OrgPreferenceSettings: 'core-platform', OrgSettings: 'core-platform',
    PartyDataModelSettings: 'industries', PardotSettings: 'marketing',
    PardotEinsteinSettings: 'marketing', PathAssistantSettings: 'sales', PaymentsSettings: 'commerce',
    PicklistSettings: 'core-platform', PlatformEncryptionSettings: 'security-identity',
    PlatformEventSettings: 'integration-api', PredictionBuilderSettings: 'einstein-ai',
    PrivacySettings: 'security-identity', ProductSettings: 'sales', QuoteSettings: 'sales',
    RealTimeEventSettings: 'security-identity', RecordPageSettings: 'user-management',
    RetailExecutionSettings: 'industries', SalesAgreementSettings: 'revenue-billing',
    SandboxSettings: 'core-platform', SchemaSettings: 'apex-dev', SearchSettings: 'user-management',
    SecuritySettings: 'security-identity', ServiceCloudVoiceSettings: 'service',
    ServiceSetupAssistantSettings: 'service', SharingSettings: 'security-identity',
    SiteSettings: 'experience', SocialCustomerServiceSettings: 'service', SocialProfileSettings: 'service',
    SubscriptionManagementSettings: 'revenue-billing', SurveySettings: 'mobile-collab',
    TrailheadSettings: 'user-management', TrialOrgSettings: 'core-platform',
    UserEngagementSettings: 'user-management', UserInterfaceSettings: 'user-management',
    UserManagementSettings: 'user-management', VoiceSettings: 'service',
    WarrantyLifeCycleMgmtSettings: 'field-service', WorkDotComSettings: 'mobile-collab',
    WorkforceEngagementSettings: 'mobile-collab',
};

// ================================================================
// MANUAL feature -> settings curation (preserved from your original 38)
// Each entry: { FeatureName: { SettingTypeName: [fieldName, ...] } }
// The listed fields are pre-enabled (smartDefault=true) when the feature is selected.
// ================================================================
const MANUAL_FEATURE_SETTINGS = {
    // --- AGENTFORCE ---
    // Use objects {name, default} when you want a non-`true` default.
    Einstein1AIPlatform: {
        AgentPlatformSettings: ['enableAgentPlatform'],
        AgentforceForDevelopersSettings: [{ name: 'agentforceForDevelopersOptOut', default: false }],
        EinsteinGptSettings: [
            'enableEinsteinGptPlatform',
            { name: 'enableAIModelBeta', default: false },
            'enableEinsteinGptGlobalLangSupport',
            { name: 'enableEinsteinGptAllowUnsafePTInputChanges', default: false },
        ],
    },

    // --- EINSTEIN ---
    Chatbot: { BotSettings: ['enableBots'] },
    CaseClassification: { EinsteinAgentSettings: ['einsteinAgentRecommendations', 'reRunAttributeBasedRules', 'runAssignmentRules'] },
    EinsteinSearch: { SearchSettings: ['enableEinsteinSearchAssistantDialog', 'enableEinsteinSearchNaturalLanguage', 'enableEinsteinSearchPersonalization'] },
    SalesCloudEinstein: {
        OpportunityScoreSettings: ['enableOpportunityScoring'],
        AutomatedContactsSettings: ['enableAutoContactsActivities'],
        ForecastingObjectListSettings: ['enableForecastingObjectList'],
    },

    // --- SALESFORCE PLATFORM ---
    EnableSetPasswordInApi: {
        LightningExperienceSettings: ['enableS1DesktopEnabled'],
        MobileSettings: ['enableS1EncryptedStoragePref2'],
    },
    AuthorApex: { ApexSettings: ['enableApexAccessRightsPref', 'enableApexCtrlImplicitWithSharingPref', 'enableAuraApexCtrlAuthUserAccessCheckPref'] },
    DevHub: { DevHubSettings: ['enableLightningScratchOrgSetup', 'enableSourceTrackingSandboxes'] },

    // --- SALES CLOUD ---
    SalesUser: {
        OpportunitySettings: ['enableOpportunityTeam'],
        QuoteSettings: ['enableQuote'],
    },
    HighVelocitySales: { HighVelocitySalesSettings: ['enableEngagementWaveAnalyticsPref'] },
    TerritoryManagement2: { TerritoryManagement2Settings: ['enableTerritoryManagement2'] },

    // --- SERVICE CLOUD ---
    ServiceCloud: { CaseSettings: ['defaultCaseUser', 'systemUserName'] },
    ServiceUser: {},
    Entitlements: { EntitlementSettings: ['enableEntitlements'] },
    Knowledge: { KnowledgeSettings: ['enableKnowledge'] },
    OmniChannel: { OmniChannelSettings: ['enableOmniChannel', 'enableOmniSecondaryRoutingPriority', 'enableOmniSkillsRouting'] },
    LiveAgent: { LiveAgentSettings: ['enableLiveAgent'] },

    // --- EXPERIENCE CLOUD ---
    Communities: {
        CommunitiesSettings: ['enableNetworksEnabled'],
        ExperienceBundleSettings: ['enableExperienceBundleMetadata'],
    },
    Sites: { SiteSettings: ['enableTopicsInSites'] },

    // --- MARKETING ---
    Pardot: { PardotSettings: ['enablePardotAppV1Enabled', 'enablePardotEnabled'] },

    // --- COMMERCE ---
    OrderManagement: { OrderManagementSettings: ['enableOrderManagement'] },

    // --- REVENUE ---
    RevSubscriptionManagement: { SubscriptionManagementSettings: ['enableSubscriptionManagement'] },
    CoreCpq: { RevenueManagementSettings: ['enableCoreCPQ'] },

    // --- FIELD SERVICE ---
    FieldService: { FieldServiceSettings: ['fieldServiceEnabled', 'enableWorkOrders'] },

    // --- ANALYTICS & DATA ---
    DevelopmentWave: {},
    CustomerDataPlatform: { CustomerDataPlatformSettings: ['enableCustomerDataPlatform'] },

    // --- INDUSTRIES ---
    FinancialServicesUser: { IndustriesSettings: ['enableFinancialServicesCloud'] },
    HealthCloudUser: { IndustriesSettings: ['enableHealthCloud'] },
    ManufacturingProgramBased: { IndustriesSettings: ['enableSalesAgreements'] },
    B2CLoyaltyManagement: { IndustriesLoyaltySettings: ['enableLoyaltyManagement'] },
    SustainabilityApp: { IndustriesSettings: ['enableSustainabilityCloud', 'enableSCCarbonAccounting'] },
    EducationCloud: { IndustriesSettings: ['enableEducationCloud'] },
    PublicSectorAccess: { IndustriesSettings: ['enableBenefitManagementPreference'] },
    AutomotiveCloud: { IndustriesSettings: ['enableCriteriaBasedSearchAndFilter'] },
    Assessments: { IndustriesSettings: ['enableIndustriesAssessment', 'enableDiscoveryFrameworkMetadata'] },
    VolunteerManagement: { IndustriesSettings: ['enableVolunteerManagement'] },
    PersonAccounts: {},
    TalentRecruitmentManagement: {
        IndustriesSettings: ['enablePositionRecruitmentPref', 'enableIndustriesAssessment', 'enableDiscoveryFrameworkMetadata', 'enableCriteriaBasedSearchAndFilter'],
    },
};

// ================================================================
// Required feature dependencies (featureName -> [required feature names])
// Expressed in the docs "This feature requires that you also include the X feature"
// ================================================================
const FEATURE_REQUIRES = {
    CustomerDataPlatformLite: ['CustomerDataPlatform'],
};

// ================================================================
// The scratch-org baseline, always pre-checked on first load.
// ================================================================
const BASELINE = {
    featureIds: ['EnableSetPasswordInApi'],
    settings: {
        LightningExperienceSettings: { enableS1DesktopEnabled: true },
        MobileSettings: { enableS1EncryptedStoragePref2: false },
    },
};

// ================================================================
// Helpers
// ================================================================
function categorize(name) {
    if (OVERRIDES[name]) return OVERRIDES[name];
    for (const [re, id] of RULES) if (re.test(name)) return id;
    return 'core-platform';
}
function humanize(name) {
    return name
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
        .replace(/\s+/g, ' ')
        .trim();
}
function slugify(name) {
    return name
        .replace(/([a-z])([A-Z])/g, '$1-$2')
        .replace(/[^a-zA-Z0-9]+/g, '-')
        .toLowerCase()
        .replace(/^-+|-+$/g, '');
}
function normalizeType(raw) {
    if (!raw) return 'string';
    const original = String(raw);
    const t = original.toLowerCase();
    if (t === 'boolean' || t === 'bool') return 'boolean';
    if (['number', 'integer', 'int', 'double', 'float', 'long'].includes(t)) return 'number';
    if (t === 'string') return 'string';
    // "(enumeration type string)" / "ApptAssistantRadiusUnit (enumeration type string)" -> string
    if (/\benumeration type string\b/i.test(original)) return 'string';
    // Array notation or PascalCase nested-type reference -> complex (not a scalar)
    //   e.g. "ForecastingTypeSettings[]", "FiscalYearSetting", "WorkOrderSettings"
    if (/\[\]\s*$/.test(original)) return 'complex';
    if (/^[A-Z][A-Za-z0-9]+$/.test(original)) return 'complex';
    // unknown / other -> string (editable as free text)
    return 'string';
}
// settingTypeName (PascalCase) <-> metadata key (lowerCamelCase)
function toMetadataKey(typeName) {
    if (!typeName) return typeName;
    const m = typeName.match(/^([A-Z]+)([A-Z][a-z].*)$/);
    if (m) return m[1].toLowerCase() + m[2];
    return typeName.charAt(0).toLowerCase() + typeName.slice(1);
}
function toTypeName(metadataKey) {
    if (!metadataKey) return metadataKey;
    return metadataKey.charAt(0).toUpperCase() + metadataKey.slice(1);
}

// ================================================================
// Feature doc parsing
// ================================================================
function parseFeatures(raw) {
    const lines = raw.split(/\r?\n/);
    const blocks = [];
    let current = null;
    const headingRe = /^##\s+([A-Za-z0-9_]+)(:<value>)?\\?\s*$/;
    const skip = new Set(['Supported', 'Supported Features']);
    for (const line of lines) {
        const m = line.match(headingRe);
        if (m) {
            const name = m[1];
            if (skip.has(name)) { current = null; continue; }
            if (current) blocks.push(current);
            current = { name, hasValueSuffix: !!m[2], body: '' };
        } else if (current) {
            current.body += line + '\n';
        }
    }
    if (current) blocks.push(current);
    return blocks.map(b => ({
        name: b.name,
        hasValueSuffix: b.hasValueSuffix,
        body: b.body,
        description: extractDesc(b.body),
        valueRange: b.hasValueSuffix ? (extractRange(b.body) ?? { min: 1, max: 30, default: 1 }) : null,
        docUrl: extractDocUrl(b.body),
        deprecated: /deprecat/i.test(b.body),
        jsonExample: extractJsonBlock(b.body),
        mustAlsoInclude: extractMustAlsoInclude(b.body),
        featureRequires: extractFeatureRequires(b.body),
    }));
}

function extractDesc(body) {
    const cleaned = body.replace(/```[\s\S]*?```/g, '').split(/\r?\n/);
    const p = [];
    for (const line of cleaned) {
        const t = line.trim();
        if (!t) { if (p.length) break; continue; }
        if (t.startsWith('###')) break;
        if (t.startsWith('Note')) continue;
        p.push(t);
    }
    return p.join(' ')
        .replace(/\\$/gm, '')
        .replace(/\\\s+/g, ' ')
        .replace(/\s+/g, ' ')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .replace(/"HTML \(New Window\)"/g, '')
        .trim();
}

function extractRange(body) {
    const q = body.match(/### Supported Quantities[\s\S]*?([\d,]+)\s*[–-]\s*([\d,]+)(?:,\s*Multiplier:\s*(\d+))?/i);
    if (q) {
        const min = parseInt(q[1].replace(/,/g, ''), 10);
        const max = parseInt(q[2].replace(/,/g, ''), 10);
        const out = { min, max, default: min };
        if (q[3]) out.multiplier = parseInt(q[3], 10);
        return out;
    }
    const inline = body.match(/Indicate a value (?:from|between)\s+([\d,]+)\s*[–-]\s*([\d,]+)/i);
    if (inline) {
        const min = parseInt(inline[1].replace(/,/g, ''), 10);
        const max = parseInt(inline[2].replace(/,/g, ''), 10);
        return { min, max, default: min };
    }
    return null;
}

function extractDocUrl(body) {
    const m = body.match(/\((https:\/\/(?:developer|help)\.salesforce\.com[^\s)"\\]+)/);
    return m ? m[1] : null;
}

// Extract the first fenced JSON example from a feature body, tolerating the
// quirky line-number prefixes and trailing backslashes the docs use.
function extractJsonBlock(body) {
    const fence = body.match(/```([\s\S]*?)```/);
    if (!fence) return null;
    let txt = fence[1];
    // strip leading "1", "2", "15", etc. at the start of each line (from docs formatting)
    txt = txt
        .split(/\r?\n/)
        .map(l => l.replace(/\\$/, '').replace(/^\s*\d+/, ''))  // remove leading line number
        .join('\n')
        .replace(/[""]/g, '"')   // curly quotes
        .replace(/['']/g, "'")
        .trim();
    // Must actually look like a JSON object describing a scratch org
    if (!/"features"\s*:\s*\[/.test(txt) && !/"settings"\s*:\s*\{/.test(txt)) return null;
    // Try JSON.parse, fall back to a tolerant hand-parse
    try {
        return JSON.parse(txt);
    } catch (e) {
        return tolerantParse(txt);
    }
}

// When strict JSON.parse fails, extract just the pieces we need (features array
// and settings object) by regex, so we don't lose data due to trivial syntax
// errors in the docs (trailing commas, typos, missing commas, etc.).
function tolerantParse(txt) {
    const result = { features: [], settings: {} };
    // features array
    const fm = txt.match(/"features"\s*:\s*\[([\s\S]*?)\]/);
    if (fm) {
        const inside = fm[1];
        const names = [];
        const re = /"([A-Za-z0-9_:<>-]+)"/g;
        let m;
        while ((m = re.exec(inside)) !== null) names.push(m[1]);
        result.features = names;
    }
    // settings object (naive — grab top-level setting type groups and their fields)
    const sm = txt.match(/"settings"\s*:\s*\{([\s\S]*)\}/);
    if (sm) {
        const inside = sm[1];
        // match each:   "someSettings": { ... }
        const groupRe = /"([a-z][A-Za-z0-9]+Settings)"\s*:\s*\{([\s\S]*?)\}/g;
        let m;
        while ((m = groupRe.exec(inside)) !== null) {
            const key = m[1];
            const body = m[2];
            const fields = {};
            const fieldRe = /"([a-zA-Z0-9_]+)"\s*:\s*(true|false|null|-?\d+(?:\.\d+)?|"[^"]*")/g;
            let fm2;
            while ((fm2 = fieldRe.exec(body)) !== null) {
                let v = fm2[2];
                if (v === 'true') v = true;
                else if (v === 'false') v = false;
                else if (v === 'null') v = null;
                else if (v.startsWith('"')) v = v.slice(1, -1);
                else v = Number(v);
                fields[fm2[1]] = v;
            }
            result.settings[key] = fields;
        }
    }
    return result;
}

function extractMustAlsoInclude(body) {
    // "you must also include someSettings > fieldName"
    // "also include the XxxxxSettings > yyy"
    const out = [];
    const re = /(?:must|should)[\s\S]{0,20}?also include[\s\S]{0,10}?([a-z][A-Za-z0-9]+Settings)\s*(?:>|&gt;)\s*([A-Za-z0-9_]+)/gi;
    let m;
    while ((m = re.exec(body)) !== null) {
        out.push({ typeKey: m[1], fieldName: m[2] });
    }
    return out;
}

function extractFeatureRequires(body) {
    // "This feature requires that you also include the FOO and BAR scratch org feature"
    // Match feature names that look PascalCase (start with uppercase, no spaces).
    const out = [];
    const re = /requires that you also include[\s\S]{0,40}?\b([A-Z][A-Za-z0-9]+)\b/g;
    let m;
    while ((m = re.exec(body)) !== null) {
        const n = m[1];
        // skip common filler words that happen to start with capital
        if (['Service', 'Data', 'Scratch', 'Org', 'CRM', 'CRM', 'API', 'Customer'].includes(n)) continue;
        if (!out.includes(n)) out.push(n);
    }
    return out;
}

// ================================================================
// Build the merged feature↔settings mapping
// ================================================================
function mergeMappings({ features, settingFieldIndex }) {
    // Start from MANUAL_FEATURE_SETTINGS and layer in the docs-extracted data.
    // settingFieldIndex: { SettingTypeName -> { fieldName -> SettingFieldDef } }

    for (const f of features) {
        // A feature may have:
        //   sources[typeName] = { fields: Set<fieldName>, required: boolean, requiredFields: Set, values: {name: value} }
        const attached = {};

        const ensure = (typeName) => {
            attached[typeName] = attached[typeName] || { fields: new Set(), required: false, requiredFields: new Set(), values: {} };
            return attached[typeName];
        };

        // 1. Manual override (curated, highest ownership).
        const manual = MANUAL_FEATURE_SETTINGS[f.name];
        if (manual) {
            for (const [type, fields] of Object.entries(manual)) {
                const g = ensure(type);
                for (const spec of fields) {
                    if (typeof spec === 'string') {
                        g.fields.add(spec);
                    } else if (spec && spec.name) {
                        g.fields.add(spec.name);
                        if (spec.default !== undefined) g.values[spec.name] = spec.default;
                    }
                }
            }
        }

        // 2. JSON example from the docs — absolute ground truth.
        if (f.jsonExample && f.jsonExample.settings) {
            for (const [metaKey, fields] of Object.entries(f.jsonExample.settings)) {
                const typeName = toTypeName(metaKey);
                const g = ensure(typeName);
                for (const [fn, v] of Object.entries(fields)) {
                    g.fields.add(fn);
                    g.values[fn] = v;
                }
            }
        }

        // 3. "you must also include X > Y" — authoritative and required.
        for (const { typeKey, fieldName } of f.mustAlsoInclude) {
            const typeName = toTypeName(typeKey);
            const g = ensure(typeName);
            g.fields.add(fieldName);
            g.required = true;
            g.requiredFields.add(fieldName);
        }

        // Materialize settings[] array.
        f.settings = [];
        for (const [typeName, g] of Object.entries(attached)) {
            const known = settingFieldIndex[typeName] || {};
            const fields = [];
            for (const fieldName of g.fields) {
                const known_fd = known[fieldName];
                const type = known_fd ? known_fd.type : 'boolean';
                // Priority for SMART-DEFAULT value (what we emit when the user selects this feature):
                //   1. Value from a Salesforce docs JSON example (most authoritative)
                //   2. For booleans: `true` (selecting the feature implies turning the flag ON)
                //   3. For numbers: 0; for strings: ''
                const defaultFromExample = g.values[fieldName];
                let defaultValue;
                if (defaultFromExample !== undefined) defaultValue = defaultFromExample;
                else if (type === 'boolean') defaultValue = true;
                else if (type === 'number') defaultValue = 0;
                else if (type === 'complex') defaultValue = null;
                else defaultValue = '';
                const fd = {
                    name: fieldName,
                    type,
                    smartDefault: true,
                    defaultValue,
                };
                if (known_fd?.description) fd.description = known_fd.description;
                if (known_fd?.rawType) fd.rawType = known_fd.rawType;
                if (g.requiredFields.has(fieldName)) fd.required = true;
                fields.push(fd);
            }
            f.settings.push({
                typeName,
                required: g.required,
                fields,
            });
        }
        // Deterministic ordering for stable diffs.
        f.settings.sort((a, b) => a.typeName.localeCompare(b.typeName));
    }
}

function buildFeatureRequires(features) {
    for (const f of features) {
        const deps = new Set(FEATURE_REQUIRES[f.name] || []);
        for (const n of f.featureRequires) deps.add(n);
        // filter to only real features
        const known = new Set(features.map(x => x.name));
        f.requires = [...deps].filter(n => known.has(n));
    }
}

// ================================================================
// Parse settings JSON
// ================================================================
function parseDocsDefault(description, type) {
    if (!description) return undefined;
    if (type === 'boolean') {
        // "The default value is false." / "default: true"
        const m = description.match(/default\s+(?:value\s+)?(?:is\s+)?(true|false)/i);
        if (m) return m[1].toLowerCase() === 'true';
    } else if (type === 'number') {
        const m = description.match(/default\s+(?:value\s+)?(?:is\s+)?(-?\d+(?:\.\d+)?)/i);
        if (m) return Number(m[1]);
    }
    return undefined;
}

function parseSettings(raw) {
    const json = JSON.parse(raw);
    return json.settings.map(s => {
        const usable = (s.fields ?? []).filter(f => f && f.name && !/^\(.*\)$/.test(f.name.trim()));
        const fields = usable.map(f => {
            const type = normalizeType(f.type);
            const fd = { name: f.name, type };
            if (f.description) fd.description = f.description;
            // Preserve the raw Salesforce type for complex/object fields so the UI
            // can hint at what's expected (e.g. "FiscalYearSetting").
            if (type === 'complex' && f.type) fd.rawType = f.type;
            const docsDefault = parseDocsDefault(f.description, type);
            if (docsDefault !== undefined) {
                fd.defaultValue = docsDefault;
            } else if (type === 'boolean') {
                fd.defaultValue = true;
            } else if (type === 'number') {
                fd.defaultValue = 0;
            } else if (type === 'complex') {
                fd.defaultValue = null;  // requires manual JSON editing
            } else {
                fd.defaultValue = '';
            }
            return fd;
        });
        return {
            id: s.name,
            settingTypeName: s.name,
            label: humanize(s.name),
            description: s.description || '',
            category: categorize(s.name),
            fields,
        };
    });
}

function buildSettingFieldIndex(settings) {
    const idx = {};
    for (const s of settings) {
        idx[s.settingTypeName] = {};
        for (const f of s.fields) idx[s.settingTypeName][f.name] = f;
    }
    return idx;
}

// ================================================================
// Emit
// ================================================================
function emitJsFile(varName, data, header) {
    return `// AUTO-GENERATED by extract-data.mjs. Use admin.html for edits.\n// ${header}\nwindow.${varName} = ${JSON.stringify(data, null, 2)};\n`;
}

function buildFeatureOut(f) {
    const out = {
        id: slugify(f.name),
        featureName: f.name,
        label: humanize(f.name),
        description: f.description || '',
        category: categorize(f.name),
    };
    if (f.valueRange && f.hasValueSuffix) out.valueRange = f.valueRange;
    if (f.docUrl) out.docUrl = f.docUrl;
    if (f.deprecated) out.deprecated = true;
    if (f.requires && f.requires.length) out.requires = f.requires;
    if (f.settings && f.settings.length) out.settings = f.settings;
    return out;
}

// ================================================================
// Main
// ================================================================
function main() {
    console.log('Reading sources...');
    const featuresRaw = fs.readFileSync(FEATURES_TXT, 'utf8');
    const settingsRaw = fs.readFileSync(SETTINGS_JSON, 'utf8');

    const settings = parseSettings(settingsRaw).sort((a, b) => a.settingTypeName.localeCompare(b.settingTypeName));
    const settingFieldIndex = buildSettingFieldIndex(settings);
    console.log(`Parsed ${settings.length} setting types (${settings.reduce((a, s) => a + s.fields.length, 0)} fields)`);

    const features = parseFeatures(featuresRaw);
    console.log(`Parsed ${features.length} features`);

    // Stats on discovered mappings
    const withJson = features.filter(f => f.jsonExample).length;
    const withMustInclude = features.filter(f => f.mustAlsoInclude.length).length;
    const withManual = features.filter(f => MANUAL_FEATURE_SETTINGS[f.name]).length;
    console.log(`  with docs JSON example: ${withJson}`);
    console.log(`  with "must also include": ${withMustInclude}`);
    console.log(`  with manual curation:     ${withManual}`);

    mergeMappings({ features, settingFieldIndex });
    buildFeatureRequires(features);

    const withSettings = features.filter(f => f.settings && f.settings.length).length;
    console.log(`  features with at least 1 attached setting: ${withSettings} / ${features.length}`);

    const featuresOut = features
        .sort((a, b) => a.name.localeCompare(b.name))
        .map(buildFeatureOut);

    if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
    fs.writeFileSync(path.join(OUT_DIR, 'categories.js'), emitJsFile('CATEGORIES', CATEGORIES, 'Category taxonomy (18).'), 'utf8');
    fs.writeFileSync(path.join(OUT_DIR, 'features.js'), emitJsFile('FEATURES', featuresOut, `${featuresOut.length} scratch-org features with embedded settings.`), 'utf8');
    fs.writeFileSync(path.join(OUT_DIR, 'settings.js'), emitJsFile('SETTINGS', settings, `${settings.length} Metadata API setting types (full catalog for Settings tab).`), 'utf8');
    fs.writeFileSync(path.join(OUT_DIR, 'baseline.js'), emitJsFile('BASELINE', BASELINE, 'Default scratch-org baseline, preselected on first load.'), 'utf8');

    console.log(`Wrote data/{categories,features,settings,baseline}.js`);
}

main();
