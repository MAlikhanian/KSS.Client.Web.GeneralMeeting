/**
 * KSS General Meeting API (backed by KSS.Service.SEBA_ERP_Members).
 *
 * Server-side only. The General Meeting endpoints (Meeting, MeetingAttendance,
 * MeetingCandidate, MeetingVote, MeetingElectionResult, MeetingElection workflow)
 * live on the SAME backend service as the rest of erp-members-api.ts, so this
 * file reuses the exact same base-URL env var (ERP_MEMBERS_API_BASE_URL) and
 * JWT Bearer forwarding — no new env var is introduced.
 *
 * Error surfacing mirrors the cash-advance BFF pattern: on a non-2xx response,
 * the backend's JSON body (`{"statusCode":...,"message":"..."}` from a
 * BusinessRuleException, or a plain `{"message":"..."}`) is parsed and the
 * `message` is thrown as the Error's message, so app/api/general-meeting/**
 * route handlers can surface the clean 400 reason back to the toast instead
 * of a generic "Request failed" string.
 */

function getBaseUrl(): string {
  const baseUrl = process.env.ERP_MEMBERS_API_BASE_URL;
  if (!baseUrl) {
    console.error(
      '[General Meeting API] ERP_MEMBERS_API_BASE_URL is not set in environment variables',
    );
    throw new Error(
      'ERP_MEMBERS_API_BASE_URL environment variable is required but not set.',
    );
  }
  return baseUrl;
}

function jsonHeaders(token: string): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

/**
 * Shared fetch helper. Throws an Error whose `message` is the backend's JSON
 * `message` field when present (BusinessRuleException -> HTTP 400), so the
 * BFF route's catch block can surface it verbatim instead of swallowing it.
 */
async function req<T>(
  token: string,
  method: string,
  path: string,
  body?: unknown,
): Promise<T> {
  const response = await fetch(`${getBaseUrl()}${path}`, {
    method,
    headers: jsonHeaders(token),
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: 'no-store',
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => response.statusText);
    let message = errorText;
    try {
      const parsed = JSON.parse(errorText);
      if (parsed?.message) message = String(parsed.message);
      // Surface the backend's exception detail (e.g. from a 500) so it isn't swallowed.
      if (parsed?.details) message = `${message} — ${String(parsed.details)}`;
    } catch {
      /* keep raw text */
    }
    throw new Error(message || `Request failed: ${response.status}`);
  }

  if (response.status === 204) return undefined as T;
  const text = await response.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

// ─────────────────────────────────────────────────────────────────────────────
// Types (mirror the C# DTOs in KSS.Service.SEBA_ERP_Members/KSS.Dto)
// ─────────────────────────────────────────────────────────────────────────────

/** MeetingViewDto */
export interface MeetingViewDto {
  id: string;
  title: string;
  meetingDate: string;
  status: string;
  boardSeatCount: number;
  alternateSeatCount: number;
  maxSelectionsPerBallot: number;
  totalMembers: number;
  isCurrent: boolean;
  createdAt: string;
  updatedAt: string;
}

/** StartMeetingDto — workflow payload for MeetingElection/StartNew */
export interface StartMeetingDto {
  title: string;
  meetingDate: string;
}

/** MeetingUpdateDto — edit meeting settings (id + editable fields only; Status/IsCurrent are workflow-owned) */
export interface MeetingUpdateDto {
  id: string;
  title: string;
  meetingDate: string;
  boardSeatCount: number;
  alternateSeatCount: number;
  maxSelectionsPerBallot: number;
  totalMembers: number;
}

/** MeetingInsertDto — create a meeting (no id; backend seeds Open + non-current) */
export interface MeetingInsertDto {
  title: string;
  meetingDate: string;
}

/** MeetingAttendanceViewDto */
export interface MeetingAttendanceViewDto {
  id: string;
  meetingId: string;
  companyId: string;
  memberType: number; // 1=Brokerage, 2=Fund
  isPresent: boolean;
  representativePersonId: string | null;
  createdAt: string;
  updatedAt: string;
}

/** MeetingAttendanceInsertDto — no Id, backend generates the v7 GUID */
export interface MeetingAttendanceInsertDto {
  meetingId: string;
  companyId: string;
  memberType: number; // 1=Brokerage, 2=Fund
  isPresent: boolean;
  representativePersonId: string | null;
}

/** MeetingAttendanceUpdateDto — id + only the editable fields */
export interface MeetingAttendanceUpdateDto {
  id: string;
  isPresent: boolean;
  representativePersonId: string | null;
}

/** MeetingCandidateViewDto */
export interface MeetingCandidateViewDto {
  id: string;
  meetingId: string;
  personId: string;
  companyId: string | null; // member company the candidate represents
  candidateNumber: number | null;
  createdAt: string;
  updatedAt: string;
}

/** MeetingCandidateInsertDto — no Id, backend generates the v7 GUID */
export interface MeetingCandidateInsertDto {
  meetingId: string;
  personId: string;
  companyId: string | null; // member company the candidate represents
  candidateNumber: number | null;
}

/** MeetingVoteViewDto — read only, produced by CastBallot */
export interface MeetingVoteViewDto {
  id: string;
  meetingId: string;
  voterCompanyId: string;
  memberType: number; // 1=Brokerage, 2=Fund
  candidateId: string;
  createdAt: string;
  updatedAt: string;
}

/** MeetingElectionResultViewDto — read only, produced by CloseAndTally */
export interface MeetingElectionResultViewDto {
  id: string;
  meetingId: string;
  candidateId: string;
  voteCount: number;
  rank: number;
  outcome: number; // 1=Elected, 2=Alternate, 3=NotElected
}

/** CastBallotDto — workflow payload for MeetingElection/CastBallot */
export interface CastBallotDto {
  voterCompanyId: string;
  memberType: number; // 1=Brokerage, 2=Fund
  candidateIds: string[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Meeting — GET /Api/Meeting/Current
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /Api/Meeting/Current — the single meeting flagged IsCurrent, or null
 * if no meeting is currently in progress.
 */
export async function getCurrentMeeting(token: string): Promise<MeetingViewDto | null> {
  return req<MeetingViewDto | null>(token, 'GET', '/Api/Meeting/Current');
}

/** All meetings (newest-first ordering is done client-side). */
export async function listMeetings(token: string): Promise<MeetingViewDto[]> {
  return req<MeetingViewDto[]>(token, 'GET', '/Api/Meeting/ToListAll');
}

/** Create a meeting (seed: title + date). Backend stamps the v7 id + Open/non-current. */
export async function addMeeting(token: string, dto: MeetingInsertDto): Promise<MeetingViewDto> {
  return req<MeetingViewDto>(token, 'POST', '/Api/Meeting/AddDto', dto);
}

/** Edit a meeting's settings (title/date/seat counts). Status + IsCurrent are workflow-owned. */
export async function updateMeeting(token: string, dto: MeetingUpdateDto): Promise<void> {
  return req<void>(token, 'PUT', '/Api/Meeting/UpdateDto', dto);
}

export async function removeMeeting(token: string, id: string): Promise<void> {
  return req<void>(token, 'DELETE', '/Api/Meeting/Remove', { id });
}

// ─────────────────────────────────────────────────────────────────────────────
// MeetingAttendance — /Api/MeetingAttendance/*
// ─────────────────────────────────────────────────────────────────────────────

export async function listAttendance(token: string): Promise<MeetingAttendanceViewDto[]> {
  return req<MeetingAttendanceViewDto[]>(token, 'GET', '/Api/MeetingAttendance/ToListAll');
}

export async function addAttendance(
  token: string,
  dto: MeetingAttendanceInsertDto,
): Promise<MeetingAttendanceViewDto> {
  return req<MeetingAttendanceViewDto>(token, 'POST', '/Api/MeetingAttendance/AddDto', dto);
}

export async function updateAttendance(
  token: string,
  dto: MeetingAttendanceUpdateDto,
): Promise<void> {
  return req<void>(token, 'PUT', '/Api/MeetingAttendance/UpdateDto', dto);
}

export async function removeAttendance(token: string, id: string): Promise<void> {
  return req<void>(token, 'DELETE', '/Api/MeetingAttendance/Remove', { id });
}

// ─────────────────────────────────────────────────────────────────────────────
// MeetingCandidate — /Api/MeetingCandidate/*
// ─────────────────────────────────────────────────────────────────────────────

export async function listCandidates(token: string): Promise<MeetingCandidateViewDto[]> {
  return req<MeetingCandidateViewDto[]>(token, 'GET', '/Api/MeetingCandidate/ToListAll');
}

export async function addCandidate(
  token: string,
  dto: MeetingCandidateInsertDto,
): Promise<MeetingCandidateViewDto> {
  return req<MeetingCandidateViewDto>(token, 'POST', '/Api/MeetingCandidate/AddDto', dto);
}

export async function removeCandidate(token: string, id: string): Promise<void> {
  return req<void>(token, 'DELETE', '/Api/MeetingCandidate/Remove', { id });
}

// ─────────────────────────────────────────────────────────────────────────────
// MeetingVote — read only — GET /Api/MeetingVote/ToListAll
// ─────────────────────────────────────────────────────────────────────────────

export async function listVotes(token: string): Promise<MeetingVoteViewDto[]> {
  return req<MeetingVoteViewDto[]>(token, 'GET', '/Api/MeetingVote/ToListAll');
}

// ─────────────────────────────────────────────────────────────────────────────
// MeetingElectionResult — read only — GET /Api/MeetingElectionResult/ToListAll
// ─────────────────────────────────────────────────────────────────────────────

export async function listResults(token: string): Promise<MeetingElectionResultViewDto[]> {
  return req<MeetingElectionResultViewDto[]>(token, 'GET', '/Api/MeetingElectionResult/ToListAll');
}

// ─────────────────────────────────────────────────────────────────────────────
// MeetingElection workflow — /Api/MeetingElection/*
// The 5 actions below take `meetingId` as a QUERY-STRING param on the backend
// (the C# actions bind `Guid meetingId` from the query, DTO from the body).
// `startNewMeeting` has no meetingId (it creates the Meeting row).
// ─────────────────────────────────────────────────────────────────────────────

export async function startNewMeeting(token: string, dto: StartMeetingDto): Promise<MeetingViewDto> {
  return req<MeetingViewDto>(token, 'POST', '/Api/MeetingElection/StartNew', dto);
}

/** Make an existing meeting the current/active one (clears IsCurrent on the others). */
export async function setCurrentMeeting(token: string, meetingId: string): Promise<void> {
  return req<void>(
    token,
    'POST',
    `/Api/MeetingElection/SetCurrent?meetingId=${encodeURIComponent(meetingId)}`,
  );
}

export async function openAttendance(token: string, meetingId: string): Promise<void> {
  return req<void>(
    token,
    'POST',
    `/Api/MeetingElection/OpenAttendance?meetingId=${encodeURIComponent(meetingId)}`,
  );
}

export async function openVoting(token: string, meetingId: string): Promise<void> {
  return req<void>(
    token,
    'POST',
    `/Api/MeetingElection/OpenVoting?meetingId=${encodeURIComponent(meetingId)}`,
  );
}

export async function castBallot(
  token: string,
  meetingId: string,
  dto: CastBallotDto,
): Promise<void> {
  return req<void>(
    token,
    'POST',
    `/Api/MeetingElection/CastBallot?meetingId=${encodeURIComponent(meetingId)}`,
    dto,
  );
}

/**
 * Secret-ballot counter for the hidden election. `delta` is +1 (count a paper
 * ballot for the candidate) or -1 (undo). Anonymous votes are stored with a
 * synthetic voter id + MemberType 0 on the backend.
 */
export async function anonymousVote(
  token: string,
  meetingId: string,
  candidateId: string,
  delta: number,
): Promise<void> {
  return req<void>(
    token,
    'POST',
    `/Api/MeetingElection/AnonymousVote?meetingId=${encodeURIComponent(meetingId)}` +
      `&candidateId=${encodeURIComponent(candidateId)}&delta=${delta}`,
  );
}

export async function closeAndTally(token: string, meetingId: string): Promise<void> {
  return req<void>(
    token,
    'POST',
    `/Api/MeetingElection/CloseAndTally?meetingId=${encodeURIComponent(meetingId)}`,
  );
}
