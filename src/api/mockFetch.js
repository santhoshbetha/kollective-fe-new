// src/api/mockFetch.js
// Intercepts window.fetch calls to mock all verification flow backend endpoints.

const defaultReports = [
  {
    id: "RPT-302",
    category: "hate_speech",
    preview_text: "Targeted hate speech against our local community organizers in Sector 4.",
    reporter: "alice_w",
    target_account: "troll_master",
    status: "open"
  },
  {
    id: "RPT-303",
    category: "spam",
    preview_text: "Buy cheap crypto now! Click this suspicious link: bit.ly/scam-crypto",
    reporter: "marcus_vane",
    target_account: "spambot99",
    status: "open"
  },
  {
    id: "RPT-304",
    category: "misinformation",
    preview_text: "Sector 7 solar panels are emitting dangerous radiation! Spread the word!",
    reporter: "elena_thorne",
    target_account: "conspiracy_guy",
    status: "open"
  },
  {
    id: "RPT-305",
    category: "harassment",
    preview_text: "You are a fraud and we will shut down your local mesh network node!",
    reporter: "j_thorne",
    target_account: "hater_x",
    status: "open"
  },
  {
    id: "RPT-301",
    category: "spam",
    preview_text: "Get rich quick schemes advertised in the main lobby forum.",
    reporter: "julian_v",
    target_account: "spammer_alpha",
    status: "resolved"
  }
];

const defaultAuditLogs = [
  {
    id: 1,
    operator_id: 99,
    action: "PROMOTE_ADMIN",
    target_id: 34,
    inserted_at: "2026-07-04 14:32:10"
  },
  {
    id: 2,
    operator_id: 99,
    action: "SHADOW_BAN",
    target_id: 88,
    inserted_at: "2026-07-04 16:11:05"
  },
  {
    id: 3,
    operator_id: 99,
    action: "HARD_BAN",
    target_id: 104,
    inserted_at: "2026-07-05 09:20:15"
  }
];

const defaultJuryApplications = [
  {
    id: "201",
    evidence_text: "Coordinated the sector-wide strike logistics for local delivery workers. Ensured picket line safety and mutual aid distributions.",
    evidence_media_urls: ["https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d"]
  },
  {
    id: "202",
    evidence_text: "Released encrypted communications proving that the municipal utility board intentionalized blackouts in working-class Sector 12.",
    evidence_media_urls: []
  }
];

const defaultIncidents = [
  {
    incident_id: "INC-704",
    target_user: { username: "scholar_proof_1" },
    security_flag: {
      type: "ORCID_SYNC_CONFLICT",
      description: "Synced publications count fell below threshold validation metrics. Flagged for review."
    },
    audit_payload: {
      orcid_id: "0000-0002-1825-0001",
      historical_publication_count: 14,
      scraped_publication_count: 5,
      last_successful_sync: "2026-07-01T12:00:00Z"
    },
    resolution_options: {
      approve_restoration_endpoint: "/api/v1/admin/incidents/INC-704/restore",
      permanent_ban_endpoint: "/api/v1/admin/incidents/INC-704/ban"
    },
    status: "open"
  }
];

// Initialize localStorage mock DB
if (!localStorage.getItem("mock_reports")) {
  localStorage.setItem("mock_reports", JSON.stringify(defaultReports));
}
if (!localStorage.getItem("mock_audit_logs")) {
  localStorage.setItem("mock_audit_logs", JSON.stringify(defaultAuditLogs));
}
if (!localStorage.getItem("mock_vouch_count")) {
  localStorage.setItem("mock_vouch_count", "1");
}
if (!localStorage.getItem("mock_applications")) {
  localStorage.setItem("mock_applications", JSON.stringify(defaultJuryApplications));
}
if (!localStorage.getItem("mock_incidents")) {
  localStorage.setItem("mock_incidents", JSON.stringify(defaultIncidents));
}

const defaultInvitations = [
  {
    id: "inv-101",
    role: "contributor",
    status: "pending",
    inserted_at: "2026-09-10T10:15:00Z",
    organization: {
      id: "org-clean-water",
      name: "Clean Water Action Network",
      username: "clean_water_action",
      handle: "@clean_water_action",
      avatar: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=120&q=80",
      badge_type: "organization"
    }
  },
  {
    id: "inv-102",
    role: "editor",
    status: "pending",
    inserted_at: "2026-09-12T14:30:00Z",
    organization: {
      id: "org-transit-coalition",
      name: "Community Transit Coalition",
      username: "transit_coalition",
      handle: "@transit_coalition",
      avatar: "https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=120&q=80",
      badge_type: "organization"
    }
  }
];

const defaultOrgMembers = [
  {
    id: "mem-1",
    role: "owner",
    joined_at: "2026-01-15T08:00:00Z",
    user: {
      id: "usr-1",
      name: "Julian Thorne",
      username: "j_thorne",
      email: "julian@kollective.org",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDDkj_L45i8SmnUNelsTSM7xt_t_GV39eYINp6PEQVVLlXUxSvJaNjQYzESvNDMuqrIwONlm6hWBLqOoS8riEyh-1rKUOHRC9C0nsco1tez2QwPMohMyfQvIRlEG3LSpzE_csuDr2MokaO0fyDbrBtLG8zyRK0UE4YoMGHfKU7mmL9pHuChnByhBWfv5g3nPIU3ijvm7g9FXRvV2fzc5TP7CmY_3iFzk73u23dxjIYRKOVsoB-DnXNeLelemr06EtW5rrGyER3EA6c"
    }
  },
  {
    id: "mem-2",
    role: "admin",
    joined_at: "2026-03-20T11:45:00Z",
    user: {
      id: "usr-2",
      name: "Elena Thorne",
      username: "elena_thorne",
      email: "elena@metrotenants.org",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"
    }
  },
  {
    id: "mem-3",
    role: "contributor",
    joined_at: "2026-05-10T16:20:00Z",
    user: {
      id: "usr-3",
      name: "Marcus Vane",
      username: "marcus_vane",
      email: "marcus@communitynet.io",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80"
    }
  }
];

const defaultPendingOrgInvites = [
  {
    id: "inv-901",
    email: "sarah.connor@ecoresist.net",
    role: "contributor",
    status: "pending",
    inserted_at: "2026-09-11T09:00:00Z"
  }
];

const defaultOrgAuditLogs = [
  {
    id: "log-1",
    action: "INVITE_SENT",
    performed_by: "Julian Thorne",
    target_user: "sarah.connor@ecoresist.net",
    details: "Sent invitation for role: contributor",
    inserted_at: "2026-09-11 09:00:15",
    metadata: { post_id: null }
  },
  {
    id: "log-2",
    action: "POST_DELETE_FORCE",
    performed_by: "Elena Thorne",
    target_user: "troll_account_99",
    details: "Administrative deletion of spam campaign post",
    inserted_at: "2026-09-12 14:15:22",
    metadata: { post_id: "post-104", can_restore: true }
  },
  {
    id: "log-3",
    action: "ROLE_UPDATE",
    performed_by: "Julian Thorne",
    target_user: "Marcus Vane",
    details: "Promoted to contributor",
    inserted_at: "2026-09-08 11:30:00",
    metadata: { post_id: null }
  }
];

if (!localStorage.getItem("mock_invitations")) {
  localStorage.setItem("mock_invitations", JSON.stringify(defaultInvitations));
}
if (!localStorage.getItem("mock_org_members")) {
  localStorage.setItem("mock_org_members", JSON.stringify(defaultOrgMembers));
}
if (!localStorage.getItem("mock_pending_org_invites")) {
  localStorage.setItem("mock_pending_org_invites", JSON.stringify(defaultPendingOrgInvites));
}
if (!localStorage.getItem("mock_org_audit_logs")) {
  localStorage.setItem("mock_org_audit_logs", JSON.stringify(defaultOrgAuditLogs));
}

const getReports = () => JSON.parse(localStorage.getItem("mock_reports"));
const saveReports = (reports) => localStorage.setItem("mock_reports", JSON.stringify(reports));

const getAuditLogs = () => JSON.parse(localStorage.getItem("mock_audit_logs"));
const saveAuditLogs = (logs) => localStorage.setItem("mock_audit_logs", JSON.stringify(logs));

const getApplications = () => JSON.parse(localStorage.getItem("mock_applications"));

const getIncidents = () => JSON.parse(localStorage.getItem("mock_incidents"));
const saveIncidents = (incidents) => localStorage.setItem("mock_incidents", JSON.stringify(incidents));

const getInvitations = () => JSON.parse(localStorage.getItem("mock_invitations") || "[]");
const saveInvitations = (invs) => localStorage.setItem("mock_invitations", JSON.stringify(invs));

const getOrgMembers = () => JSON.parse(localStorage.getItem("mock_org_members") || "[]");
const saveOrgMembers = (mems) => localStorage.setItem("mock_org_members", JSON.stringify(mems));

const getPendingOrgInvites = () => JSON.parse(localStorage.getItem("mock_pending_org_invites") || "[]");
const savePendingOrgInvites = (invs) => localStorage.setItem("mock_pending_org_invites", JSON.stringify(invs));

const getOrgAuditLogs = () => JSON.parse(localStorage.getItem("mock_org_audit_logs") || "[]");
const saveOrgAuditLogs = (logs) => localStorage.setItem("mock_org_audit_logs", JSON.stringify(logs));

const originalFetch = window.fetch;

window.fetch = async function (input, init) {
  let url = typeof input === "string" ? input : input.url;
  const method = (init && init.method) ? init.method.toUpperCase() : "GET";

  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  // 1. GET /api/v1/admin/reports?status=...
  if (url.includes("/api/v1/admin/reports") && !url.includes("/resolve") && method === "GET") {
    await delay(300);
    const parsedUrl = new URL(url, window.location.origin);
    const statusFilter = parsedUrl.searchParams.get("status") || "open";
    const reports = getReports().filter(r => r.status === statusFilter);
    return new Response(JSON.stringify({ data: reports }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  }

  // 2. POST /api/v1/admin/reports/:id/resolve
  if (url.includes("/api/v1/admin/reports/") && url.includes("/resolve") && method === "POST") {
    await delay(400);
    const match = url.match(/\/api\/v1\/admin\/reports\/([^\/]+)\/resolve/);
    if (match) {
      const reportId = match[1];
      const body = JSON.parse(init.body || "{}");
      const action = body.action || "dismiss";
      
      let reports = getReports();
      const report = reports.find(r => r.id === reportId);
      if (report) {
        report.status = "resolved";
        saveReports(reports);

        // Add to audit trail
        let logs = getAuditLogs();
        const newLog = {
          id: Date.now(),
          operator_id: 99,
          action: action.toUpperCase(),
          target_id: reportId,
          inserted_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
        };
        logs.unshift(newLog);
        saveAuditLogs(logs);
      }

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }
  }

  // 3. GET /api/v1/admin/root/audit_logs
  if (url.includes("/api/v1/admin/root/audit_logs") && method === "GET") {
    await delay(300);
    const logs = getAuditLogs();
    return new Response(JSON.stringify({ data: logs }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  }

  // 4. POST /api/v1/admin/root/users/promote_admin or promote_moderator
  if (url.includes("/api/v1/admin/root/users/promote_") && method === "POST") {
    await delay(500);
    const isRoot = url.includes("promote_admin");
    const roleType = isRoot ? "admin" : "moderator";
    const body = JSON.parse(init.body || "{}");
    const username = body.username || "unknown";

    let logs = getAuditLogs();
    const newLog = {
      id: Date.now(),
      operator_id: 99,
      action: `PROMOTE_${roleType.toUpperCase()}`,
      target_id: username,
      inserted_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };
    logs.unshift(newLog);
    saveAuditLogs(logs);

    return new Response(JSON.stringify({ message: `Successfully promoted @${username} to ${roleType}.` }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  }

  // 5. GET /api/v1/auth/check-username?username=...
  if (url.includes("/api/v1/auth/check-username") && method === "GET") {
    await delay(200);
    const parsedUrl = new URL(url, window.location.origin);
    const username = parsedUrl.searchParams.get("username") || "";
    const takenUsernames = ["j_thorne", "alsweigart", "marcus_vane", "elena_thorne", "nymag", "admin", "root"];
    const isTaken = takenUsernames.includes(username.toLowerCase().trim());
    return new Response(JSON.stringify({
      status: "success",
      available: !isTaken,
      username: username
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  }

  // 6. Scholar Verification Endpoint
  if (url.includes("/voting/scholar-verify") && method === "POST") {
    await delay(600);
    const body = JSON.parse(init.body || "{}");
    const orcidId = body.orcid_id || "0000-0002-1825-0001";
    return new Response(JSON.stringify({
      message: `Scholar identity authenticated with ORCID iD ${orcidId}`,
      badge_type: "scholar"
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  }

  // 7. Journalist Verification Endpoint
  if (url.includes("/voting/journalist-verify") && method === "POST") {
    await delay(600);
    const body = JSON.parse(init.body || "{}");
    const portfolioUrl = body.portfolio_url || "";
    return new Response(JSON.stringify({
      message: `Press portfolio verified at ${portfolioUrl}`,
      badge_type: "ProfessionalTeal"
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  }

  // 8. Generate Peer Vouch QR Token
  if (url.includes("/api/vouch/generate-token") && method === "POST") {
    await delay(300);
    const secureToken = "vouch_tok_" + Math.random().toString(36).substr(2, 9);
    return new Response(JSON.stringify({ secure_token: secureToken }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  }

  // 9. Scan and Verify Peer
  if (url.includes("/api/vouch/verify-peer") && method === "POST") {
    await delay(400);
    let count = parseInt(localStorage.getItem("mock_vouch_count") || "1");
    count += 1;
    localStorage.setItem("mock_vouch_count", count.toString());
    return new Response(JSON.stringify({ current_vouches: count }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  }

  // 10. Get Activist Application Case Details
  if (url.includes("/voting/applications/") && !url.includes("/votes") && method === "GET") {
    await delay(300);
    const match = url.match(/\/voting\/applications\/([^\/]+)/);
    const appFileId = match ? match[1] : "201";
    const app = getApplications().find(a => a.id === appFileId) || defaultJuryApplications[0];
    return new Response(JSON.stringify({ data: app }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  }

  // 11. Cast Activist Ballot Vote
  if (url.includes("/voting/applications/") && url.includes("/votes") && method === "POST") {
    await delay(500);
    return new Response(JSON.stringify({
      data: { voted_at: new Date().toISOString() }
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  }

  // 12. Seed Video Call Override Bootstrap
  if (url.includes("/admin/civic/bootstrap-seed") && method === "POST") {
    await delay(600);
    return new Response(JSON.stringify({
      message: "Seed Node fully bootstrapped. Transaction processed successfully."
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  }

  // 13. Appeal Dispute Incident Context
  if (url.includes("/compliance/my-incident") && method === "GET") {
    await delay(300);
    return new Response(JSON.stringify({
      data: {
        id: "INC-901",
        flag_reason: "Manual verification sync check triggered delta error (ORCID works dropped)."
      }
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  }

  // 14. Submit appeal statement
  if (url.includes("/compliance/incidents/") && url.includes("/dispute") && method === "POST") {
    await delay(500);
    return new Response(JSON.stringify({
      message: "Reinstatement petition successfully logged."
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  }

  // 15. GET /api/v1/admin/incidents
  if (url.includes("/api/v1/admin/incidents") && !url.includes("/restore") && !url.includes("/ban") && method === "GET") {
    await delay(300);
    const match = url.match(/\/api\/v1\/admin\/incidents\/([^\/]+)/);
    if (match) {
      const incidentId = match[1];
      const incident = getIncidents().find(i => i.incident_id === incidentId);
      return new Response(JSON.stringify({ data: incident }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    } else {
      const openIncidents = getIncidents().filter(i => i.status === "open");
      return new Response(JSON.stringify({ data: openIncidents }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }
  }

  // 16. POST /api/v1/admin/incidents/:id/restore or /ban
  if (url.includes("/api/v1/admin/incidents/") && (url.includes("/restore") || url.includes("/ban")) && method === "POST") {
    await delay(400);
    const match = url.match(/\/api\/v1\/admin\/incidents\/([^\/]+)\/(restore|ban)/);
    if (match) {
      const incidentId = match[1];
      const action = match[2]; // 'restore' or 'ban'
      let incidentsList = getIncidents();
      const incident = incidentsList.find(i => i.incident_id === incidentId);
      if (incident) {
        incident.status = action === "restore" ? "restored" : "banned";
        saveIncidents(incidentsList);

        // Add to audit trail
        let logs = getAuditLogs();
        const newLog = {
          id: Date.now(),
          operator_id: 99,
          action: action === "restore" ? "RESOLVE_INCIDENT" : "BAN_INCIDENT",
          target_id: incident.target_user.username,
          inserted_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
        };
        logs.unshift(newLog);
        saveAuditLogs(logs);
      }
      return new Response(JSON.stringify({ success: true, message: `Incident successfully processed with ${action}.` }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }
  }

  // 17. POST /api/v1/sessions/switch_context
  if (url.includes("/api/v1/sessions/switch_context") && method === "POST") {
    await delay(300);
    let body = {};
    try {
      body = JSON.parse(init.body || "{}");
    } catch (e) {
      body = {};
    }
    const accountId = body.account_id;

    // Read current user from localStorage or fallback
    let currentUser = null;
    try {
      const stored = localStorage.getItem('kollective-auth-secure-matrix') || localStorage.getItem('auth_user');
      if (stored) {
        const parsed = JSON.parse(stored);
        currentUser = parsed.state?.user || parsed;
      }
    } catch (e) {
      // ignore
    }

    if (!currentUser) {
      currentUser = {
        id: 'usr-1',
        name: 'Julian Thorne',
        username: 'j_thorne',
        handle: '@j_thorne',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDDkj_L45i8SmnUNelsTSM7xt_t_GV39eYINp6PEQVVLlXUxSvJaNjQYzESvNDMuqrIwONlm6hWBLqOoS8riEyh-1rKUOHRC9C0nsco1tez2QwPMohMyfQvIRlEG3LSpzE_csuDr2MokaO0fyDbrBtLG8zyRK0UE4YoMGHfKU7mmL9pHuChnByhBWfv5g3nPIU3ijvm7g9FXRvV2fzc5TP7CmY_3iFzk73u23dxjIYRKOVsoB-DnXNeLelemr06EtW5rrGyER3EA6c',
        role: 'root_admin',
        badge_type: 'citizen',
        memberships: [
          {
            organization: {
              id: 'org-metro-union',
              name: 'Metro Tenant Union',
              username: 'metro_tenants',
              handle: '@metro_tenants',
              avatar: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?auto=format&fit=crop&w=120&q=80',
              badge_type: 'organization'
            },
            role: 'Lead Organizer',
            status: 'active'
          },
          {
            organization: {
              id: 'org-kollective-press',
              name: 'Kollective Press Guild',
              username: 'kollective_press',
              handle: '@kollective_press',
              avatar: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=120&q=80',
              badge_type: 'organization'
            },
            role: 'Editor',
            status: 'active'
          }
        ]
      };
    }

    const isPersonal = !accountId || accountId === 'personal' || accountId === currentUser.id;

    if (isPersonal) {
      return new Response(JSON.stringify({
        status: "success",
        token: `mock-jwt-personal-${Date.now()}`,
        active_account: {
          id: currentUser.id ? String(currentUser.id) : 'personal',
          type: 'personal',
          name: currentUser.name,
          username: currentUser.username || (currentUser.handle ? currentUser.handle.replace('@', '') : 'user'),
          handle: currentUser.handle || `@${currentUser.username}`,
          avatar: currentUser.avatar || '/default-avatar.jpg',
          role: currentUser.role || 'citizen',
          badge_type: currentUser.badge_type || 'citizen'
        },
        permissions: ['read', 'post:create', 'vote', 'comment'],
        profile: {
          name: currentUser.name,
          bio: currentUser.bio || '',
          avatar: currentUser.avatar
        }
      }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Switch to organization account
    const membership = currentUser.memberships?.find(m => m.organization?.id === accountId);
    const org = membership?.organization || {
      id: accountId,
      name: 'Partner Organization',
      username: 'partner_org',
      handle: '@partner_org',
      avatar: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?auto=format&fit=crop&w=120&q=80',
      badge_type: 'organization'
    };

    return new Response(JSON.stringify({
      status: "success",
      token: `mock-jwt-org-${accountId}-${Date.now()}`,
      active_account: {
        id: org.id,
        type: 'organization',
        name: org.name,
        username: org.username || org.handle?.replace('@', '') || 'org',
        handle: org.handle || `@${org.username || 'org'}`,
        avatar: org.avatar || '/default-org.jpg',
        role: membership?.role || 'Member',
        badge_type: org.badge_type || 'organization'
      },
      permissions: ['read', 'post:create', 'org:manage', 'org:admin', 'vote'],
      profile: {
        name: org.name,
        bio: org.bio || 'Verified Organization Node on the Kollective mesh.',
        avatar: org.avatar
      }
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  }

  // 18. GET /invitations
  if (url.includes("/invitations") && !url.includes("/accept") && !url.includes("/decline") && method === "GET") {
    await delay(200);
    return new Response(JSON.stringify({
      data: getInvitations()
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  }

  // 19. POST /invitations/:id/accept
  if (url.includes("/invitations/") && url.includes("/accept") && method === "POST") {
    await delay(300);
    const inviteId = url.split("/invitations/")[1]?.split("/")[0]?.split("?")[0];
    const invites = getInvitations();
    const targetInvite = invites.find(i => String(i.id) === String(inviteId));
    saveInvitations(invites.filter(i => String(i.id) !== String(inviteId)));

    const newMembership = targetInvite ? {
      organization: targetInvite.organization,
      role: targetInvite.role,
      status: "active"
    } : null;

    return new Response(JSON.stringify({
      data: {
        message: "Invitation accepted successfully",
        membership: newMembership
      }
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  }

  // 20. POST /invitations/:id/decline
  if (url.includes("/invitations/") && url.includes("/decline") && method === "POST") {
    await delay(250);
    const inviteId = url.split("/invitations/")[1]?.split("/")[0]?.split("?")[0];
    const invites = getInvitations();
    saveInvitations(invites.filter(i => String(i.id) !== String(inviteId)));

    return new Response(JSON.stringify({
      data: {
        message: "Invitation declined successfully"
      }
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  }

  // 21. GET /org-settings/members
  if (url.includes("/org-settings/members") && method === "GET") {
    await delay(200);
    return new Response(JSON.stringify({
      data: getOrgMembers()
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  }

  // 22. DELETE /org-settings/members/:id
  if (url.includes("/org-settings/members/") && method === "DELETE") {
    await delay(300);
    const memberId = url.split("/org-settings/members/")[1]?.split("/")[0]?.split("?")[0];
    const members = getOrgMembers();
    const removedMember = members.find(m => String(m.user?.id || m.id) === String(memberId));
    saveOrgMembers(members.filter(m => String(m.user?.id || m.id) !== String(memberId)));

    // Record in org audit trail
    const auditLogs = getOrgAuditLogs();
    auditLogs.unshift({
      id: `log-${Date.now()}`,
      action: "MEMBER_REMOVED",
      performed_by: "Active Admin",
      target_user: removedMember?.user?.name || `User #${memberId}`,
      details: "Organizational access revoked. Posts archived.",
      inserted_at: new Date().toLocaleString(),
      metadata: { user_id: memberId }
    });
    saveOrgAuditLogs(auditLogs);

    return new Response(JSON.stringify({
      status: "success",
      message: "Access revoked. Historical posts have been locked to archive status."
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  }

  // 23. GET /org-settings/pending-invites
  if (url.includes("/org-settings/pending-invites") && method === "GET") {
    await delay(200);
    return new Response(JSON.stringify({
      data: getPendingOrgInvites()
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  }

  // 24. POST /org-admin/invite
  if (url.includes("/org-admin/invite") && method === "POST") {
    await delay(350);
    let body = {};
    try {
      body = JSON.parse(init.body || "{}");
    } catch (e) {
      body = {};
    }
    const { email, role = "contributor" } = body;
    const newInvite = {
      id: `inv-${Date.now()}`,
      email: email || "new_user@kollective.org",
      role: role || "contributor",
      status: "pending",
      inserted_at: new Date().toISOString()
    };
    const currentPending = getPendingOrgInvites();
    currentPending.unshift(newInvite);
    savePendingOrgInvites(currentPending);

    // Record in org audit trail
    const auditLogs = getOrgAuditLogs();
    auditLogs.unshift({
      id: `log-${Date.now()}`,
      action: "INVITE_SENT",
      performed_by: "Active Admin",
      target_user: email,
      details: `Dispatched invitation with assigned role: ${role}`,
      inserted_at: new Date().toLocaleString(),
      metadata: { invite_id: newInvite.id, role }
    });
    saveOrgAuditLogs(auditLogs);

    return new Response(JSON.stringify({
      data: newInvite,
      message: `Invitation successfully sent to ${email}`
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  }

  // 25. GET /org-settings/audit-logs
  if (url.includes("/org-settings/audit-logs") && method === "GET") {
    await delay(200);
    return new Response(JSON.stringify({
      data: getOrgAuditLogs()
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  }

  // 26. POST /posts/:id/restore
  if (url.includes("/posts/") && url.includes("/restore") && method === "POST") {
    await delay(300);
    const postId = url.split("/posts/")[1]?.split("/")[0]?.split("?")[0];
    const auditLogs = getOrgAuditLogs();
    const updatedLogs = auditLogs.map(log => {
      if (log.metadata?.post_id === postId) {
        return {
          ...log,
          metadata: { ...log.metadata, can_restore: false, restored: true }
        };
      }
      return log;
    });
    saveOrgAuditLogs(updatedLogs);

    return new Response(JSON.stringify({
      status: "success",
      message: `Post ${postId} has been restored to the community feed.`
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  }

  // 27. PUT /org-settings/profile
  if (url.includes("/org-settings/profile") && method === "PUT") {
    await delay(300);
    let body = {};
    try {
      body = JSON.parse(init.body || "{}");
    } catch (e) {
      body = {};
    }
    return new Response(JSON.stringify({
      data: body,
      message: "Organization profile updated successfully."
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  }

  return originalFetch.apply(this, arguments);
};
