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

const getReports = () => JSON.parse(localStorage.getItem("mock_reports"));
const saveReports = (reports) => localStorage.setItem("mock_reports", JSON.stringify(reports));

const getAuditLogs = () => JSON.parse(localStorage.getItem("mock_audit_logs"));
const saveAuditLogs = (logs) => localStorage.setItem("mock_audit_logs", JSON.stringify(logs));

const getApplications = () => JSON.parse(localStorage.getItem("mock_applications"));

const getIncidents = () => JSON.parse(localStorage.getItem("mock_incidents"));
const saveIncidents = (incidents) => localStorage.setItem("mock_incidents", JSON.stringify(incidents));

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

  return originalFetch.apply(this, arguments);
};
