/**
 * KSS Person Service (KSS.Service.Person)
 *
 * Server-side only functions for Person service operations.
 * Base URL from PERSON_API_BASE_URL env only (set in .env / ConfigMap / k8s).
 */

function getBaseUrl(): string {
  const baseUrl = process.env.PERSON_API_BASE_URL;
  if (!baseUrl) {
    console.error('[Person API] PERSON_API_BASE_URL is not set in environment variables');
    throw new Error(
      'PERSON_API_BASE_URL environment variable is required but not set.',
    );
  }
  return baseUrl;
}

// Adds the selected-company header (X-Company-Id) from the request cookie so the
// Person service can scope data to the caller's current company. Falls back to
// no scoping when the cookie is absent or we're outside a request scope.
async function getHeaders(token: string): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    Authorization: `Bearer ${token}`,
  };
  try {
    const { cookies } = await import('next/headers');
    const companyId = (await cookies()).get('x-company-id')?.value;
    if (companyId) headers['X-Company-Id'] = companyId;
  } catch {
    // cookies() not available (e.g. outside a request) — skip company scoping.
  }
  return headers;
}

async function throwApiError(response: Response, defaultMessage: string) {
  const errorText = await response.text().catch(() => response.statusText);
  if (response.status === 401) {
    throw new Error('Authentication token expired. Please log in again.');
  }
  let message = defaultMessage;
  try {
    const errorJson = JSON.parse(errorText);
    message = errorJson.message || message;
  } catch {
    message = errorText || message;
  }
  throw new Error(message);
}

// ─── Person Types ───

export type PersonResponse = Array<{
  id: string;
  sexId: number;
  preferredLanguageId: number;
  nationalId: string;
  dateOfBirth: string;
  birthCountryId: number;
  birthRegionId: number;
  birthCityId: number;
  birthCertificateNumber?: string | null;
  birthCertificateSeriesNumber?: string | null;
  birthCertificateSeriesLetterId?: number | null;
  birthCertificateSerial?: string | null;
  birthCertificateIssueCountryId: number;
  birthCertificateIssueRegionId: number;
  birthCertificateIssueCityId: number;
  maritalStatusId: number;
  religionId: number;
  passportNumber?: string | null;
  militaryServiceStatusId: number;
  insuranceTypeId: number;
  insuranceNumber?: string | null;
  createdAt: string;
  updatedAt: string;
  translations: Array<{
    personId: string;
    languageId: number;
    firstName: string;
    lastName: string;
    fatherName?: string | null;
    displayName?: string | null;
  }>;
  emails: Array<{
    id: string;
    personId: string;
    labelId: number;
    emailAddress: string;
    isPrimary: boolean;
    isVerified: boolean;
    verifiedAt?: string | null;
    createdAt: string;
    updatedAt: string;
  }>;
  phones: Array<{
    id: string;
    personId: string;
    labelId: number;
    countryId: number;
    phoneNumber: string;
    isPrimary: boolean;
    isVerified: boolean;
    verifiedAt?: string | null;
    createdAt: string;
    updatedAt: string;
  }>;
  addresses: Array<{
    id: string;
    personId: string;
    labelId: number;
    countryId: number;
    regionId: number;
    cityId: number;
    postalCode: string;
    latitude?: number | null;
    longitude?: number | null;
    isPrimary: boolean;
    isVerified: boolean;
    verifiedAt?: string | null;
    createdAt: string;
    updatedAt: string;
    translations: Array<{
      addressId: string;
      languageId: number;
      street1: string;
      street2?: string | null;
    }>;
  }>;
  employments: Array<{
    id: string;
    personId: string;
    companyId: string;
    fromDate: string;
    toDate?: string | null;
    isPrimary: boolean;
    sortOrder: number;
    createdAt: string;
    updatedAt: string;
  }>;
  nationalities: Array<{
    id: string;
    personId: string;
    countryId: number;
  }>;
}>;

// ─── Person CRUD ───

/**
 * GET /Api/Person/Count — returns the scalar total. The dashboard tile
 * fetches just the count; no entity rows are exposed.
 */
export async function getPersonCount(token: string): Promise<number> {
  const url = `${getBaseUrl()}/Api/Person/Count`;
  const response = await fetch(url, {
    method: 'GET',
    headers: await getHeaders(token),
    cache: 'no-store',
  });
  if (!response.ok) await throwApiError(response, 'Failed to fetch person count');
  const dto: { count: number } = await response.json();
  return dto.count;
}

/**
 * GET /Api/Person/CreatorUserIds — distinct UserIds (Person.CreatedBy values)
 * across the Person table. Dashboard joins this with access grants to count
 * "companies whose access-granted users have created persons".
 */
export async function getPersonCreatorUserIds(token: string): Promise<string[]> {
  const url = `${getBaseUrl()}/Api/Person/CreatorUserIds`;
  const response = await fetch(url, {
    method: 'GET',
    headers: await getHeaders(token),
    cache: 'no-store',
  });
  if (!response.ok) await throwApiError(response, 'Failed to fetch creator user ids');
  const dto: { userIds: string[] } = await response.json();
  return dto.userIds ?? [];
}

export async function getPersonsList(token: string): Promise<{
  value: PersonResponse;
  Count: number;
}> {
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}/Api/Person/ToListAll`;

  const response = await fetch(url, {
    method: 'GET',
    headers: await getHeaders(token),
    cache: 'no-store',
  });

  if (!response.ok) {
    await throwApiError(response, 'Failed to fetch persons.');
  }

  const data = await response.json();
  const personsArray = Array.isArray(data) ? data : [];

  return {
    value: personsArray,
    Count: personsArray.length,
  };
}

// ─── Person Directory (minimal info, bypasses access filter) ───

export interface PersonDirectoryRecord {
  id: string;
  nationalId: string;
  translations: Array<{
    languageId: number;
    firstName: string;
    lastName: string;
  }>;
}

/**
 * Fetches the directory of ALL persons with minimal info only (id, nationalId,
 * translation names). The backend Directory endpoint bypasses the access
 * filter on purpose — used for the access-grant dropdown which must let the
 * user pick any person, not just persons they already have access to.
 * Profile details remain access-protected via the regular endpoints.
 */
export async function listPersonDirectory(
  token: string,
): Promise<PersonDirectoryRecord[]> {
  const baseUrl = getBaseUrl();
  const response = await fetch(`${baseUrl}/Api/Person/Directory`, {
    method: 'GET',
    headers: await getHeaders(token),
    cache: 'no-store',
  });
  if (!response.ok) await throwApiError(response, 'Failed to fetch person directory.');
  return response.json();
}

/**
 * Company-scoped directory — persons assigned to the caller's ACTIVE company
 * (the X-Company-Id cookie is forwarded by getHeaders). The Person service
 * enforces the scoping (empty when no company is selected / caller unassigned).
 * Used by the Cash Advance person pickers.
 */
export async function listPersonDirectoryByCompany(
  token: string,
): Promise<PersonDirectoryRecord[]> {
  const baseUrl = getBaseUrl();
  const response = await fetch(`${baseUrl}/Api/Person/DirectoryByCompany`, {
    method: 'GET',
    headers: await getHeaders(token),
    cache: 'no-store',
  });
  if (!response.ok) await throwApiError(response, 'Failed to fetch person directory.');
  return response.json();
}

/**
 * Fetches the caller's own minimal person info (id, nationalId, translations)
 * via /Api/Person/Me. Skips the Person.Information.Read section gate, so a
 * user with no roles can still load their own name + national code for the
 * topbar. Backend reads the personId claim from the JWT.
 */
export async function getCurrentPerson(token: string): Promise<PersonDirectoryRecord> {
  const baseUrl = getBaseUrl();
  const response = await fetch(`${baseUrl}/Api/Person/Me`, {
    method: 'GET',
    headers: await getHeaders(token),
    cache: 'no-store',
  });
  if (!response.ok) await throwApiError(response, 'Failed to fetch current person.');
  return response.json();
}

// Single-row fetch via /Api/Person/Find. Backend enforces row-level access in
// PersonService.FindAsync — callers without visibility get a 400
// BusinessRuleException. Returns Person + Translations only; section data
// (emails, phones, addresses, educations, …) is fetched separately via the
// per-section endpoints.
export async function getPersonById(token: string, personId: string): Promise<PersonResponse[0]> {
  const baseUrl = getBaseUrl();
  const response = await fetch(`${baseUrl}/Api/Person/Find`, {
    method: 'POST',
    headers: await getHeaders(token),
    body: JSON.stringify({ value: personId, dataType: 9 }),
    cache: 'no-store',
  });
  if (!response.ok) {
    await throwApiError(response, 'Person not found.');
  }
  return response.json();
}

export interface PersonNameRecord {
  id: string;
  firstName: string;
  lastName: string;
  nationalId: string;
}

// Resolve display names for a SPECIFIC set of person ids (batched) via
// /Api/Person/Names — used to label rows by uploader without loading the whole
// directory. Returns only the requested ids that exist.
export async function getPersonNamesByIds(
  token: string,
  ids: string[],
  languageId = 12,
): Promise<PersonNameRecord[]> {
  if (!ids || ids.length === 0) return [];
  const baseUrl = getBaseUrl();
  const response = await fetch(`${baseUrl}/Api/Person/Names`, {
    method: 'POST',
    headers: await getHeaders(token),
    body: JSON.stringify({ ids, languageId }),
    cache: 'no-store',
  });
  if (!response.ok) await throwApiError(response, 'Failed to resolve person names.');
  return response.json();
}

export async function createPersonWithTranslation(token: string, data: Record<string, unknown>) {
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}/Api/Person/AddWithTranslation`;

  const response = await fetch(url, {
    method: 'POST',
    headers: await getHeaders(token),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    await throwApiError(response, 'Failed to create person.');
  }

  return response.json();
}

export async function updatePerson(token: string, data: Record<string, unknown>) {
  const baseUrl = getBaseUrl();
  // Use UpdateDto (not Update) — UpdateDto is overridden in PersonService to:
  //   - fetch the row, check caller's Information level >= 2 (row-level access)
  //   - selectively patch only editable fields
  //   - preserve NationalId / CreatedAt / CreatedBy
  // The base Update endpoint marks every property as Modified, which corrupts
  // audit columns and can violate UNIQUE constraints (→ 500).
  const url = `${baseUrl}/Api/Person/UpdateDto`;

  const response = await fetch(url, {
    method: 'PUT',
    headers: await getHeaders(token),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    await throwApiError(response, 'Failed to update person.');
  }
}

export async function deletePerson(token: string, data: Record<string, unknown>) {
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}/Api/Person/Remove`;

  const response = await fetch(url, {
    method: 'DELETE',
    headers: await getHeaders(token),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    await throwApiError(response, 'Failed to delete person.');
  }
}

// ─── PersonTranslation ───

export async function addPersonTranslation(token: string, data: Record<string, unknown>) {
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}/Api/Translation/Add`;

  const response = await fetch(url, {
    method: 'POST',
    headers: await getHeaders(token),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    await throwApiError(response, 'Failed to add person translation.');
  }

  return response.json();
}

export async function updatePersonTranslation(token: string, data: Record<string, unknown>) {
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}/Api/Translation/Update`;

  const response = await fetch(url, {
    method: 'PUT',
    headers: await getHeaders(token),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    await throwApiError(response, 'Failed to update person translation.');
  }
}

export async function upsertPersonTranslations(
  token: string,
  data: { personId: string; translations: Array<{ languageId: number; firstName: string; lastName: string; fatherName?: string }> },
) {
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}/Api/Person/UpsertTranslations`;

  const response = await fetch(url, {
    method: 'PUT',
    headers: await getHeaders(token),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    await throwApiError(response, 'Failed to upsert person translations.');
  }
}

// ─── Generic Sub-Entity CRUD ───

// Per-section list. Calls backend's ToListByFilter with a personId Guid
// filter. Backend service-layer guard (PersonAccessChecker.EnsureCanSeeAsync)
// throws 400 BusinessRuleException if the caller can't see this person.
export async function listSubByPerson(token: string, entityName: string, personId: string) {
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}/Api/${entityName}/ToListByFilter`;
  const response = await fetch(url, {
    method: 'POST',
    headers: await getHeaders(token),
    body: JSON.stringify({ value: personId, dataType: 9 }),
    cache: 'no-store',
  });
  if (!response.ok) {
    await throwApiError(response, `Failed to list ${entityName}.`);
  }
  return response.json();
}

async function addSubEntity(token: string, entityName: string, data: Record<string, unknown>) {
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}/Api/${entityName}/Add`;

  const response = await fetch(url, {
    method: 'POST',
    headers: await getHeaders(token),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    await throwApiError(response, `Failed to add ${entityName}.`);
  }

  return response.json();
}

async function updateSubEntity(token: string, entityName: string, data: Record<string, unknown>) {
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}/Api/${entityName}/Update`;

  const response = await fetch(url, {
    method: 'PUT',
    headers: await getHeaders(token),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    await throwApiError(response, `Failed to update ${entityName}.`);
  }
}

async function removeSubEntity(token: string, entityName: string, data: Record<string, unknown>) {
  const baseUrl = getBaseUrl();

  // If only id is provided, fetch the full entity first via FindAsync
  let entityData = data;
  if (data.id && Object.keys(data).length <= 2) {
    const findUrl = `${baseUrl}/Api/${entityName}/Find`;
    const findResponse = await fetch(findUrl, {
      method: 'POST',
      headers: await getHeaders(token),
      body: JSON.stringify({ value: data.id, dataType: 9 }),
    });
    if (findResponse.ok) {
      entityData = await findResponse.json();
    }
  }

  const url = `${baseUrl}/Api/${entityName}/Remove`;
  const response = await fetch(url, {
    method: 'DELETE',
    headers: await getHeaders(token),
    body: JSON.stringify(entityData),
  });

  if (!response.ok) {
    await throwApiError(response, `Failed to remove ${entityName}.`);
  }
}

async function listSubEntity(token: string, entityName: string) {
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}/Api/${entityName}/ToListAll`;

  const response = await fetch(url, {
    method: 'GET',
    headers: await getHeaders(token),
    cache: 'no-store',
  });

  if (!response.ok) {
    await throwApiError(response, `Failed to list ${entityName}.`);
  }

  return response.json();
}

// ─── Email ───
export const addEmail = (token: string, data: Record<string, unknown>) => addSubEntity(token, 'Email', data);
export const updateEmail = (token: string, data: Record<string, unknown>) => updateSubEntity(token, 'Email', data);
export const removeEmail = (token: string, data: Record<string, unknown>) => removeSubEntity(token, 'Email', data);

// ─── Phone ───
export const addPhone = (token: string, data: Record<string, unknown>) => addSubEntity(token, 'Phone', data);
export const updatePhone = (token: string, data: Record<string, unknown>) => updateSubEntity(token, 'Phone', data);
export const removePhone = (token: string, data: Record<string, unknown>) => removeSubEntity(token, 'Phone', data);

// ─── Address ───
export const addAddress = (token: string, data: Record<string, unknown>) => addSubEntity(token, 'Address', data);
export const updateAddress = (token: string, data: Record<string, unknown>) => updateSubEntity(token, 'Address', data);
export const removeAddress = (token: string, data: Record<string, unknown>) => removeSubEntity(token, 'Address', data);

// ─── AddressTranslation ───
export const addAddressTranslation = (token: string, data: Record<string, unknown>) => addSubEntity(token, 'AddressTranslation', data);
export const updateAddressTranslation = (token: string, data: Record<string, unknown>) => updateSubEntity(token, 'AddressTranslation', data);

// ─── Employment ───
export const addEmployment = (token: string, data: Record<string, unknown>) => addSubEntity(token, 'Employment', data);
export const updateEmployment = (token: string, data: Record<string, unknown>) => updateSubEntity(token, 'Employment', data);
export const removeEmployment = (token: string, data: Record<string, unknown>) => removeSubEntity(token, 'Employment', data);

// ─── Relationship ───
export const addRelationship = (token: string, data: Record<string, unknown>) => addSubEntity(token, 'Relationship', data);
export const updateRelationship = (token: string, data: Record<string, unknown>) => updateSubEntity(token, 'Relationship', data);
export const removeRelationship = (token: string, data: Record<string, unknown>) => removeSubEntity(token, 'Relationship', data);

// ─── PersonStatus (backend route is /Api/Status/* — see Person service) ───
export const addPersonStatus = (token: string, data: Record<string, unknown>) => addSubEntity(token, 'Status', data);
export const updatePersonStatus = (token: string, data: Record<string, unknown>) => updateSubEntity(token, 'Status', data);
export const removePersonStatus = (token: string, data: Record<string, unknown>) => removeSubEntity(token, 'Status', data);

// ─── Reference Data ───
export const listEmailLabels = (token: string) => listSubEntity(token, 'EmailLabel');
export const listPhoneLabels = (token: string) => listSubEntity(token, 'PhoneLabel');
export const listAddressLabels = (token: string) => listSubEntity(token, 'AddressLabel');
export const listSex = (token: string) => listSubEntity(token, 'Sex');
export const listMilitaryServiceStatuses = (token: string) => listSubEntity(token, 'MilitaryServiceStatus');
export const listInsuranceTypes = (token: string) => listSubEntity(token, 'InsuranceType');
export const listRelationshipTypes = (token: string) => listSubEntity(token, 'RelationshipType');
export const listMaritalStatuses = (token: string) => listSubEntity(token, 'MaritalStatus');

// ─── Reference Data Translations ───
export const listEmailLabelTranslations = (token: string) => listSubEntity(token, 'EmailLabelTranslation');
export const listPhoneLabelTranslations = (token: string) => listSubEntity(token, 'PhoneLabelTranslation');
export const listAddressLabelTranslations = (token: string) => listSubEntity(token, 'AddressLabelTranslation');
export const listSexTranslations = (token: string) => listSubEntity(token, 'SexTranslation');
export const listMilitaryServiceStatusTranslations = (token: string) => listSubEntity(token, 'MilitaryServiceStatusTranslation');
export const listMilitaryServiceLocationTranslations = (token: string) => listSubEntity(token, 'MilitaryServiceLocationTranslation');
export const listInsuranceTypeTranslations = (token: string) => listSubEntity(token, 'InsuranceTypeTranslation');
export const listMaritalStatusTranslations = (token: string) => listSubEntity(token, 'MaritalStatusTranslation');
export const listRelationshipTypeTranslations = (token: string) => listSubEntity(token, 'RelationshipTypeTranslation');
export const listBirthCertificateSeriesLetterTranslations = (token: string) => listSubEntity(token, 'BirthCertificateSeriesLetterTranslation');
export const listContractTypeTranslations = (token: string) => listSubEntity(token, 'ContractTypeTranslation');
export const listReligionTranslations = (token: string) => listSubEntity(token, 'ReligionTranslation');
export const listEmploymentActivityFieldTranslations = (token: string) => listSubEntity(token, 'EmploymentActivityFieldTranslation');
export const listEmploymentActivityUnitTranslations = (token: string) => listSubEntity(token, 'EmploymentActivityUnitTranslation');
export const listEmploymentPositionTranslations = (token: string) => listSubEntity(token, 'EmploymentPositionTranslation');
// Base lookup rows (carry parent ids) for the Field->Unit->Position cascade.
export const listEmploymentActivityUnits = (token: string) => listSubEntity(token, 'EmploymentActivityUnit');
export const listEmploymentPositions = (token: string) => listSubEntity(token, 'EmploymentPosition');
export const listDocumentTypeTranslations = (token: string) => listSubEntity(token, 'DocumentTypeTranslation');
export const listEducationLevelTranslations = (token: string) => listSubEntity(token, 'EducationLevelTranslation');
export const listFieldOfStudyTranslations = (token: string) => listSubEntity(token, 'FieldOfStudyTranslation');
export const listInstitutionTranslations = (token: string) => listSubEntity(token, 'InstitutionTranslation');

// ─── Institution (with location data) ───
export async function getInstitutions(token: string) {
  const baseUrl = getBaseUrl();
  const response = await fetch(`${baseUrl}/Api/Institution/ToListAll`, {
    method: 'GET',
    headers: await getHeaders(token),
    cache: 'no-store',
  });
  if (!response.ok) await throwApiError(response, 'Failed to fetch institutions');
  return response.json();
}

export async function getInstitutionTranslations(token: string) {
  const baseUrl = getBaseUrl();
  const response = await fetch(`${baseUrl}/Api/InstitutionTranslation/ToListAll`, {
    method: 'GET',
    headers: await getHeaders(token),
    cache: 'no-store',
  });
  if (!response.ok) await throwApiError(response, 'Failed to fetch institution translations');
  return response.json();
}

// ─── Education ───
export const addEducation = (token: string, data: Record<string, unknown>) => addSubEntity(token, 'Education', data);
export const updateEducation = (token: string, data: Record<string, unknown>) => updateSubEntity(token, 'Education', data);
export const removeEducation = (token: string, data: Record<string, unknown>) => removeSubEntity(token, 'Education', data);

// ─── EducationDocument ───
export const addEducationDocument = (token: string, data: Record<string, unknown>) => addSubEntity(token, 'EducationDocument', data);
export const removeEducationDocument = (token: string, data: Record<string, unknown>) => removeSubEntity(token, 'EducationDocument', data);

// ─── ProfessionalTraining ───
export const addProfessionalTraining = (token: string, data: Record<string, unknown>) => addSubEntity(token, 'ProfessionalTraining', data);
export const updateProfessionalTraining = (token: string, data: Record<string, unknown>) => updateSubEntity(token, 'ProfessionalTraining', data);
export const removeProfessionalTraining = (token: string, data: Record<string, unknown>) => removeSubEntity(token, 'ProfessionalTraining', data);
export const addProfessionalTrainingDocument = (token: string, data: Record<string, unknown>) => addSubEntity(token, 'ProfessionalTrainingDocument', data);
export const removeProfessionalTrainingDocument = (token: string, data: Record<string, unknown>) => removeSubEntity(token, 'ProfessionalTrainingDocument', data);
export const listProfessionalTrainingTypeTranslations = (token: string) => listSubEntity(token, 'ProfessionalTrainingTypeTranslation');
export const listProfessionalTrainingCertificateIssuerTranslations = (token: string) => listSubEntity(token, 'ProfessionalTrainingCertificateIssuerTranslation');

// ─── EmploymentDocument ───
export const addEmploymentDocument = (token: string, data: Record<string, unknown>) => addSubEntity(token, 'EmploymentDocument', data);
export const removeEmploymentDocument = (token: string, data: Record<string, unknown>) => removeSubEntity(token, 'EmploymentDocument', data);

// ─── Document ───
export const addDocument = (token: string, data: Record<string, unknown>) => addSubEntity(token, 'Document', data);
export async function updateDocument(token: string, data: Record<string, unknown>) {
  const baseUrl = getBaseUrl();
  const response = await fetch(`${baseUrl}/Api/Document/UpdateDto`, {
    method: 'PUT',
    headers: await getHeaders(token),
    body: JSON.stringify(data),
  });
  if (!response.ok) await throwApiError(response, 'Failed to update Document.');
}
export const removeDocument = (token: string, data: Record<string, unknown>) => removeSubEntity(token, 'Document', data);
export async function listDocumentsByPerson(token: string, personId: string) {
  const baseUrl = getBaseUrl();
  const response = await fetch(`${baseUrl}/Api/Document/ToListAll`, {
    method: 'GET',
    headers: await getHeaders(token),
    cache: 'no-store',
  });
  if (!response.ok) await throwApiError(response, 'Failed to list documents');
  const allDocs = await response.json();
  // Filter by personId client-side
  if (Array.isArray(allDocs)) {
    return allDocs.filter((d: { personId: string }) =>
      d.personId?.toLowerCase() === personId.toLowerCase()
    );
  }
  return [];
}

// ─── PersonNationality (backend route is /Api/Nationality/* — see Person service) ───
export const addPersonNationality = (token: string, data: Record<string, unknown>) => addSubEntity(token, 'Nationality', data);
export const removePersonNationality = (token: string, data: Record<string, unknown>) => removeSubEntity(token, 'Nationality', data);

// ─── PersonAccess (per-section) ───

/**
 * One entry per (owner, grantee) pair, with all three section levels rolled up.
 * Each level: 0=None, 1=View, 2=Edit.
 */
export interface PersonAccessGrantSummary {
  personId: string;
  grantedToPersonId: string;
  informationLevel: number;
  assetsLevel: number;
  accessLevel: number;
}

/**
 * Caller's per-section levels for a given person:
 *   information / assets / access / security — each 0=None, 1=View, 2=Edit.
 */
export interface PersonAccessLevels {
  information: number;
  assets: number;
  access: number;
  security: number;
}

export interface UpsertAccessGrantBody {
  personId: string;
  grantedToPersonId: string;
  informationLevel: number;
  assetsLevel: number;
  accessLevel: number;
  securityLevel: number;
}

export async function listAccessGrantsByOwner(
  token: string,
  personId: string,
): Promise<PersonAccessGrantSummary[]> {
  const baseUrl = getBaseUrl();
  const response = await fetch(`${baseUrl}/Api/Access/ByOwner/${personId}`, {
    method: 'GET',
    headers: await getHeaders(token),
    cache: 'no-store',
  });
  if (!response.ok) await throwApiError(response, 'Failed to list person access grants.');
  return response.json();
}

export async function upsertAccessGrant(
  token: string,
  body: UpsertAccessGrantBody,
): Promise<void> {
  const baseUrl = getBaseUrl();
  const response = await fetch(`${baseUrl}/Api/Access/Grant`, {
    method: 'POST',
    headers: await getHeaders(token),
    body: JSON.stringify(body),
  });
  if (!response.ok) await throwApiError(response, 'Failed to grant access.');
}

export async function revokeAccessByPair(
  token: string,
  personId: string,
  grantedToPersonId: string,
): Promise<void> {
  const baseUrl = getBaseUrl();
  const response = await fetch(
    `${baseUrl}/Api/Access/RevokeByPair/${personId}/${grantedToPersonId}`,
    {
      method: 'POST',
      headers: await getHeaders(token),
    },
  );
  if (!response.ok) await throwApiError(response, 'Failed to revoke access.');
}

// ─── Role Access (per-person + global role grants) ───

/**
 * One entry per (personId|null, grantedToRoleId) pair. PersonId is null
 * for global grants that apply to ALL persons (e.g. SuperAdmin/PersonAdmin).
 */
export interface RoleAccessGrantSummary {
  personId: string | null;
  grantedToRoleId: string;
  informationLevel: number;
  assetsLevel: number;
  accessLevel: number;
  securityLevel: number;
  createdAt: string;
  updatedAt: string | null;
}

export interface UpsertRoleAccessGrantBody {
  personId: string | null;
  grantedToRoleId: string;
  informationLevel: number;
  assetsLevel: number;
  accessLevel: number;
  securityLevel: number;
}

export async function listRoleAccessGrantsByPerson(
  token: string,
  personId: string,
): Promise<RoleAccessGrantSummary[]> {
  const baseUrl = getBaseUrl();
  const response = await fetch(`${baseUrl}/Api/RoleAccess/ByPerson/${personId}`, {
    method: 'GET',
    headers: await getHeaders(token),
    cache: 'no-store',
  });
  if (!response.ok) await throwApiError(response, 'Failed to list role access grants.');
  return response.json();
}

export async function listAllRoleAccessGrants(
  token: string,
): Promise<RoleAccessGrantSummary[]> {
  const baseUrl = getBaseUrl();
  const response = await fetch(`${baseUrl}/Api/RoleAccess/All`, {
    method: 'GET',
    headers: await getHeaders(token),
    cache: 'no-store',
  });
  if (!response.ok) await throwApiError(response, 'Failed to list role access grants.');
  return response.json();
}

export async function upsertRoleAccessGrant(
  token: string,
  body: UpsertRoleAccessGrantBody,
): Promise<void> {
  const baseUrl = getBaseUrl();
  const response = await fetch(`${baseUrl}/Api/RoleAccess/Grant`, {
    method: 'POST',
    headers: await getHeaders(token),
    body: JSON.stringify(body),
  });
  if (!response.ok) await throwApiError(response, 'Failed to grant role access.');
}

export async function revokeRoleAccessByPair(
  token: string,
  grantedToRoleId: string,
  personId: string | null,
): Promise<void> {
  const baseUrl = getBaseUrl();
  const params = new URLSearchParams({ grantedToRoleId });
  if (personId) params.set('personId', personId);
  const response = await fetch(
    `${baseUrl}/Api/RoleAccess/RevokeByPair?${params.toString()}`,
    {
      method: 'POST',
      headers: await getHeaders(token),
    },
  );
  if (!response.ok) await throwApiError(response, 'Failed to revoke role access.');
}

/**
 * Returns caller's per-section access levels on the given person.
 */
export async function getMyAccessLevels(
  token: string,
  personId: string,
): Promise<PersonAccessLevels> {
  const baseUrl = getBaseUrl();
  const response = await fetch(`${baseUrl}/Api/Access/MyLevels/${personId}`, {
    method: 'GET',
    headers: await getHeaders(token),
    cache: 'no-store',
  });
  if (!response.ok) await throwApiError(response, 'Failed to fetch access levels.');
  const v = await response.json();
  return {
    information: typeof v?.information === 'number' ? v.information : 0,
    assets:      typeof v?.assets      === 'number' ? v.assets      : 0,
    access:      typeof v?.access      === 'number' ? v.access      : 0,
    security:    typeof v?.security    === 'number' ? v.security    : 0,
  };
}
