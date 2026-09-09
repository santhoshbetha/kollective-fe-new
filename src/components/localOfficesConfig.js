// src/components/localOfficesConfig.js

// 1. STATE SPECIFIC OVERRIDES (As provided)

// src/components/localOfficesConfig.js

export const STATE_SUBDIVISIONS = {
    LA: { type: 'Parish' },
    TX: { type: 'County', hasPrecinctSubdivisions: true },
    NJ: { type: 'County' },
    VA: { type: 'County or Independent City' },
    NE: { type: 'County' },
    NY: { type: 'County', townNote: 'Town-level only' }
};

export const STATE_ELECTED_OVERRIDES = {
    LA: {
        positions: [
            { id: 'parish_president', label: 'Parish President', level: 'county_equivalent', category: 'Parish Executive', desc: 'Chief executive officer managing parish-wide administrative operations.', scope: 'county_equivalent' },
            { id: 'police_juror', label: 'Police Juror / Parish Council Member', level: 'county_equivalent', category: 'Parish Legislative', desc: 'Passes parish ordinances, codes, and tracks localized asset deployment grids.', scope: 'county_equivalent' }
        ]
    },
    TX: {
        positions: [
            { id: 'tx_county_judge', label: 'County Judge', level: 'county_equivalent', category: 'County Executive', desc: 'Heads the county commissioners court; manages disaster response and county budgets.', scope: 'county_equivalent' },
            { id: 'tx_constable', label: 'Constable', level: 'precinct', category: 'Precinct Law Enforcement', desc: 'Elected law enforcement officer serving warrants, civil tracking papers, and patrolling local precincts.', scope: 'precinct' },
            { id: 'tx_jp', label: 'Justice of the Peace', level: 'precinct', category: 'Precinct Judiciary', desc: 'Presides over small claims courts, misdemeanor disputes, and magistration details.', scope: 'precinct' },
            { id: 'tx_ag_comm', label: 'Agriculture Commissioner', level: 'statewide', category: 'State Executive', desc: 'Executes agricultural consumer protections and weights/measures verification.', scope: 'statewide' },
            { id: 'tx_rr_comm', label: 'Railroad Commissioner', level: 'statewide', category: 'State Regulatory', desc: 'Regulates state oil, natural gas, utilities, safety pipelines, and energy infrastructure grids.', scope: 'statewide' }
        ]
    },
    VA: {
        positions: [
            { id: 'va_comm_attorney', label: 'Commonwealth’s Attorney', level: 'county_equivalent', category: 'County Prosecution', desc: 'Elected constitutional prosecutor tracking and enforcing state criminal laws inside county lines.', scope: 'county_equivalent' },
            { id: 'va_comm_revenue', label: 'Commissioner of the Revenue', level: 'county_equivalent', category: 'County Finance', desc: 'Chief local tax-assessing official regulating business licenses and local revenue codes.', scope: 'county_equivalent' }
        ]
    },
    NJ: {
        positions: [
            { id: 'nj_surrogate', label: 'Surrogate Judge', level: 'county_equivalent', category: 'County Judiciary / Probate', desc: 'Presides over the county probate court, validating wills, estates, and structural guardianships.', scope: 'county_equivalent' }
        ]
    },
    NY: {
        positions: [
            { id: 'ny_town_supervisor', label: 'Town Supervisor', level: 'town_only', category: 'Town Executive', desc: 'Chief administrator of town operations, leading the town board and managing municipal funds.', scope: 'town_only' },
            { id: 'ny_town_board', label: 'Town Board Member', level: 'town_only', category: 'Town Legislative', desc: 'Drafts town ordinances, votes on municipal zoning structures, and reviews highway allocations.', scope: 'town_only' }
        ]
    },
    NE: {
        positions: [
            { id: 'ne_unicameral_senator', label: 'State Senator (Unicameral)', level: 'statewide', category: 'State Legislative', desc: 'Nebraska is the only nonpartisan, single-house state legislature. Drafts and codifies all state laws.', scope: 'statewide' }
        ]
    }
};

export const useLocalOffices = (country, city, state, user) => {
    const normalizedState = state?.toUpperCase();

    // 1. Core Base Baseline List 
    const standardOffices = [
        // State executive items
        { id: 'governor', label: 'Governor', level: 'statewide', category: 'Statewide Executive', desc: 'Chief executive officer of the state.', targetDistrictCode: normalizedState, scope: 'statewide' },
        { id: 'lt_governor', label: 'Lieutenant Governor', level: 'statewide', category: 'Statewide Executive', desc: 'First in line of succession; presides over State Senate.', targetDistrictCode: normalizedState, scope: 'statewide' },
        { id: 'atty_general', label: 'Attorney General', level: 'statewide', category: 'Statewide Executive', desc: 'Chief legal advisor representing state interests.', targetDistrictCode: normalizedState, scope: 'statewide' },
        { id: 'sec_state', label: 'Secretary of State', level: 'statewide', category: 'Secretary of State', desc: 'Oversees elections and official state archives.', targetDistrictCode: normalizedState, scope: 'statewide' },
        { id: 'state_treasurer', label: 'State Treasurer', level: 'statewide', category: 'Statewide Executive', desc: 'Chief financial officer for the state.', targetDistrictCode: normalizedState, scope: 'statewide' },
        { id: 'state_auditor', label: 'State Auditor', level: 'statewide', category: 'Statewide Executive', desc: 'Audits state agencies and programs.', targetDistrictCode: normalizedState, scope: 'statewide' },
        { id: 'state_land_commissioner', label: 'State Land Commissioner', level: 'statewide', category: 'Statewide Executive', desc: 'Manages state lands and resources.', targetDistrictCode: normalizedState, scope: 'statewide' },
        { id: 'state_controller', label: 'State Controller', level: 'statewide', category: 'Statewide Executive', desc: 'Chief financial officer for the state.', targetDistrictCode: normalizedState, scope: 'statewide' },

        // County positions
        { id: 'county_commissioner', label: normalizedState === 'LA' ? 'Parish Council' : 'County Commissioner', level: 'county', category: 'County Legislative', desc: 'Manages regional county budgets and road codes.', targetDistrictCode: user?.county || 'County', scope: 'county_equivalent' },
        { id: 'sheriff', label: 'County Sheriff', level: 'county', category: 'County Law Enforcement', desc: 'Chief law enforcement officer maintaining county jurisdictions.', targetDistrictCode: user?.county || 'County', scope: 'county_equivalent' },
        { id: 'dist_attorney', label: 'County District Attorney', level: 'county', category: 'County Prosecutor', desc: 'Chief prosecutor for the county.', targetDistrictCode: user?.county || 'County', scope: 'county_equivalent' },
        { id: 'county_clerk', label: 'County Clerk', level: 'county', category: 'County Clerk', desc: 'Chief clerk for the county.', targetDistrictCode: user?.county || 'County', scope: 'county_equivalent' },
        { id: 'county_assessor', label: 'County Assessor', level: 'county', category: 'County Assessor', desc: 'Chief assessor for the county.', targetDistrictCode: user?.county || 'County', scope: 'county_equivalent' },
        { id: 'county_treasurer', label: 'County Treasurer', level: 'county', category: 'County Treasurer', desc: 'Chief treasurer for the county.', targetDistrictCode: user?.county || 'County', scope: 'county_equivalent' },
        { id: 'county_auditor', label: 'County Auditor', level: 'county', category: 'County Auditor', desc: 'Chief auditor for the county.', targetDistrictCode: user?.county || 'County', scope: 'county_equivalent' },

        // Municipal / City positions
        { id: 'mayor', label: 'Mayor', level: 'municipal', category: 'Municipal Executive', desc: 'Chief administrative executive running city operations.', targetDistrictCode: city, scope: 'city_only' },
        { id: 'city_council', label: 'City Council Member', level: 'municipal', category: 'Municipal Legislative', desc: 'Passes local city ordinances.', targetDistrictCode: user?.city_council_district_code || 'Ward', scope: 'city_only' },

        // School positions
        { id: 'school_board', label: 'School Board Member', level: 'school', category: 'School District', desc: 'Sets educational policies and school budgets.', targetDistrictCode: user?.school_district_code || 'ISD', scope: 'school_only' },
        { id: 'soil_water_conv', label: 'Soil & Water Conservation Supervisor', category: 'Special District', desc: 'Directs conservation programs and preserves regional watersheds.', targetDistrictCode: user?.county ? `${user.county} SWCD` : 'Conservation Grid' },
        { id: 'public_utility', label: 'Public Utility / Water Commissioner', category: 'Special District', desc: 'Manages municipal power grids and public water access systems.', targetDistrictCode: user?.city_council_district_code ? `MUD Sector ${user.city_council_district_code}` : 'Utility Board' }
    ];

    // 2. State-Specific Custom Merges
    const stateOverrides = STATE_ELECTED_OVERRIDES[normalizedState]?.positions.map(pos => {
        let code = normalizedState;
        if (pos.scope === 'county_equivalent') code = user?.county || 'County';
        if (pos.scope === 'precinct') code = user?.precinct_number ? `Pct ${user.precinct_number}` : 'Precinct';
        if (pos.scope === 'town_only') code = user?.town_name || 'Town';

        return { id: pos.id, label: pos.label, category: pos.category, desc: pos.desc, targetDistrictCode: code, scope: pos.scope };
    }) || [];

    const combinedMaster = [...standardOffices, ...stateOverrides];

    // 3. ENFORCE INTERSECTING GEOGRAPHIC FILTERS FROM BACKEND
    if (user?.applicable_office_ids && user.applicable_office_ids.length > 0) {
        return combinedMaster.filter(office => user.applicable_office_ids.includes(office.id));
    }

    return combinedMaster;
};
