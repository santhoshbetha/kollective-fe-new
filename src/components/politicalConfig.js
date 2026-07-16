// src/components/politicalConfig.js

export const DISTRICT_TERMINOLOGY = {
    //7,300+ state legislative districts and 435 federal districts
    'US': {
        countryLabel: 'United States',
        // Define generic labels for the hierarchy
        labels: {
            federal: 'Congressional District (US House)',
            stateUpper: 'State Senate District (Upper House)',
            stateLower: 'State Assembly District (Lower House)'
        },
        // Group districts by State code (ISO 3166-2) for easier filtering
        options: {
            'AL': {
                name: 'Alabama',
                federal: Array.from({ length: 7 }, (_, i) => `AL-${i + 1}`), // AL-1 to AL-7
                stateUpper: Array.from({ length: 35 }, (_, i) => `AL-SD-${i + 1}`), // Senate District 1-35
                stateLower: Array.from({ length: 105 }, (_, i) => `AL-HD-${i + 1}`) // House District 1-105
            },
            'AK ': {
                name: 'Alaska',
                federal: Array.from({ length: 1 }, (_, i) => `AK-${i + 1}`), // AK-1 to AK-1
                stateUpper: Array.from({ length: 20 }, (_, i) => `AK-SD-${i + 1}`), // Senate District 1-20
                stateLower: Array.from({ length: 40 }, (_, i) => `AK-HD-${i + 1}`) // House District 1-40
            },
            'AZ': {
                name: 'Arizona',
                federal: Array.from({ length: 9 }, (_, i) => `AZ-${i + 1}`), // AZ-1 to AZ-9
                stateUpper: Array.from({ length: 30 }, (_, i) => `AZ-SD-${i + 1}`), // Senate District 1-30
                stateLower: Array.from({ length: 60 }, (_, i) => `AZ-HD-${i + 1}`) // House District 1-60
            },
            'AR': {
                name: 'Arkansas',
                federal: Array.from({ length: 4 }, (_, i) => `AR-${i + 1}`), // AR-1 to AR-4
                stateUpper: Array.from({ length: 35 }, (_, i) => `AR-SD-${i + 1}`), // Senate District 1-35
                stateLower: Array.from({ length: 100 }, (_, i) => `AR-HD-${i + 1}`) // House District 1-100
            },
            'CA': {
                name: 'California',
                federal: Array.from({ length: 52 }, (_, i) => `CA-${i + 1}`), // CA-1 to CA-52
                stateUpper: Array.from({ length: 40 }, (_, i) => `CA-SD-${i + 1}`), // Senate District 1-40
                stateLower: Array.from({ length: 80 }, (_, i) => `CA-AD-${i + 1}`) // Assembly District 1-80
            },
            'CO': {
                name: 'Colorado',
                federal: Array.from({ length: 8 }, (_, i) => `CO-${i + 1}`), // CO-1 to CO-8
                stateUpper: Array.from({ length: 35 }, (_, i) => `CO-SD-${i + 1}`), // Senate District 1-35
                stateLower: Array.from({ length: 65 }, (_, i) => `CO-HD-${i + 1}`) // House District 1-65
            },
            'CT': {
                name: 'Connecticut',
                federal: Array.from({ length: 5 }, (_, i) => `CT-${i + 1}`), // CT-1 to CT-5
                stateUpper: Array.from({ length: 36 }, (_, i) => `CT-SD-${i + 1}`), // Senate District 1-36
                stateLower: Array.from({ length: 151 }, (_, i) => `CT-HD-${i + 1}`) // House District 1-151
            },
            'DE ': {
                name: 'Delaware',
                federal: Array.from({ length: 1 }, (_, i) => `DE-${i + 1}`), // DE-1 to DE-1
                stateUpper: Array.from({ length: 21 }, (_, i) => `DE-SD-${i + 1}`), // Senate District 1-21
                stateLower: Array.from({ length: 41 }, (_, i) => `DE-HD-${i + 1}`) // House District 1-41
            },
            'FL': {
                name: 'Florida',
                federal: Array.from({ length: 27 }, (_, i) => `FL-${i + 1}`), // FL-1 to FL-27
                stateUpper: Array.from({ length: 40 }, (_, i) => `FL-SD-${i + 1}`), // Senate District 1-40
                stateLower: Array.from({ length: 120 }, (_, i) => `FL-HD-${i + 1}`) // House District 1-120
            },
            'GA': {
                name: 'Georgia',
                federal: Array.from({ length: 14 }, (_, i) => `GA-${i + 1}`), // GA-1 to GA-14
                stateUpper: Array.from({ length: 56 }, (_, i) => `GA-SD-${i + 1}`), // Senate District 1-56
                stateLower: Array.from({ length: 180 }, (_, i) => `GA-HD-${i + 1}`) // House District 1-180
            },
            'HI': {
                name: 'Hawaii',
                federal: Array.from({ length: 2 }, (_, i) => `HI-${i + 1}`), // HI-1 to HI-2
                stateUpper: Array.from({ length: 25 }, (_, i) => `HI-SD-${i + 1}`), // Senate District 1-25
                stateLower: Array.from({ length: 51 }, (_, i) => `HI-HD-${i + 1}`) // House District 1-51
            },
            'ID': {
                name: 'Idaho',
                federal: Array.from({ length: 2 }, (_, i) => `ID-${i + 1}`), // ID-1 to ID-2
                stateUpper: Array.from({ length: 35 }, (_, i) => `ID-SD-${i + 1}`), // Senate District 1-35
                stateLower: Array.from({ length: 70 }, (_, i) => `ID-HD-${i + 1}`) // House District 1-70
            },
            'IL': {
                name: 'Illinois',
                federal: Array.from({ length: 17 }, (_, i) => `IL-${i + 1}`), // IL-1 to IL-17
                stateUpper: Array.from({ length: 59 }, (_, i) => `IL-SD-${i + 1}`), // Senate District 1-59
                stateLower: Array.from({ length: 118 }, (_, i) => `IL-HD-${i + 1}`) // House District 1-118
            },
            'IN': {
                name: 'Indiana',
                federal: Array.from({ length: 9 }, (_, i) => `IN-${i + 1}`), // IN-1 to IN-9
                stateUpper: Array.from({ length: 50 }, (_, i) => `IN-SD-${i + 1}`), // Senate District 1-50
                stateLower: Array.from({ length: 100 }, (_, i) => `IN-HD-${i + 1}`) // House District 1-100
            },
            'KS': {
                name: 'Kansas',
                federal: Array.from({ length: 4 }, (_, i) => `KS-${i + 1}`), // KS-1 to KS-4
                stateUpper: Array.from({ length: 40 }, (_, i) => `KS-SD-${i + 1}`), // Senate District 1-40
                stateLower: Array.from({ length: 125 }, (_, i) => `KS-HD-${i + 1}`) // House District 1-125
            },
            'KY': {
                name: 'Kentucky',
                federal: Array.from({ length: 6 }, (_, i) => `KY-${i + 1}`), // KY-1 to KY-6
                stateUpper: Array.from({ length: 38 }, (_, i) => `KY-SD-${i + 1}`), // Senate District 1-38
                stateLower: Array.from({ length: 100 }, (_, i) => `KY-HD-${i + 1}`) // House District 1-100
            },
            'LA': {
                name: 'Louisiana',
                federal: Array.from({ length: 6 }, (_, i) => `LA-${i + 1}`), // LA-1 to LA-6
                stateUpper: Array.from({ length: 39 }, (_, i) => `LA-SD-${i + 1}`), // Senate District 1-39
                stateLower: Array.from({ length: 105 }, (_, i) => `LA-HD-${i + 1}`) // House District 1-105
            },
            'ME': {
                name: 'Maine',
                federal: Array.from({ length: 2 }, (_, i) => `ME-${i + 1}`), // ME-1 to ME-2
                stateUpper: Array.from({ length: 35 }, (_, i) => `ME-SD-${i + 1}`), // Senate District 1-35
                stateLower: Array.from({ length: 151 }, (_, i) => `ME-HD-${i + 1}`) // House District 1-151
            },
            'MD': {
                name: 'Maryland',
                federal: Array.from({ length: 8 }, (_, i) => `MD-${i + 1}`), // MD-1 to MD-8
                stateUpper: Array.from({ length: 47 }, (_, i) => `MD-SD-${i + 1}`), // Senate District 1-47
                stateLower: Array.from({ length: 141 }, (_, i) => `MD-HD-${i + 1}`) // House District 1-141
            },
            'MA': {
                name: 'Massachusetts',
                federal: Array.from({ length: 9 }, (_, i) => `MA-${i + 1}`), // MA-1 to MA-9
                stateUpper: Array.from({ length: 40 }, (_, i) => `MA-SD-${i + 1}`), // Senate District 1-40
                stateLower: Array.from({ length: 160 }, (_, i) => `MA-HD-${i + 1}`) // House District 1-160
            },
            'MI': {
                name: 'Michigan',
                federal: Array.from({ length: 13 }, (_, i) => `MI-${i + 1}`), // MI-1 to MI-13
                stateUpper: Array.from({ length: 38 }, (_, i) => `MI-SD-${i + 1}`), // Senate District 1-38
                stateLower: Array.from({ length: 110 }, (_, i) => `MI-HD-${i + 1}`) // House District 1-110
            },
            'MN': {
                name: 'Minnesota',
                federal: Array.from({ length: 8 }, (_, i) => `MN-${i + 1}`), // MN-1 to MN-8
                stateUpper: Array.from({ length: 67 }, (_, i) => `MN-SD-${i + 1}`), // Senate District 1-67
                stateLower: Array.from({ length: 134 }, (_, i) => `MN-HD-${i + 1}`) // House District 1-134
            },
            'MS': {
                name: 'Mississippi',
                federal: Array.from({ length: 4 }, (_, i) => `MS-${i + 1}`), // MS-1 to MS-4
                stateUpper: Array.from({ length: 52 }, (_, i) => `MS-SD-${i + 1}`), // Senate District 1-52
                stateLower: Array.from({ length: 122 }, (_, i) => `MS-HD-${i + 1}`) // House District 1-122
            },
            'MO': {
                name: 'Missouri',
                federal: Array.from({ length: 8 }, (_, i) => `MO-${i + 1}`), // MO-1 to MO-8
                stateUpper: Array.from({ length: 34 }, (_, i) => `MO-SD-${i + 1}`), // Senate District 1-34
                stateLower: Array.from({ length: 163 }, (_, i) => `MO-HD-${i + 1}`) // House District 1-163
            },
            'MT': {
                name: 'Montana',
                federal: Array.from({ length: 2 }, (_, i) => `MT-${i + 1}`), // MT-1 to MT-2
                stateUpper: Array.from({ length: 50 }, (_, i) => `MT-SD-${i + 1}`), // Senate District 1-50
                stateLower: Array.from({ length: 100 }, (_, i) => `MT-HD-${i + 1}`) // House District 1-100
            },
            'NE': {
                name: 'Nebraska',
                federal: Array.from({ length: 3 }, (_, i) => `NE-${i + 1}`), // NE-1 to NE-3
                stateUpper: Array.from({ length: 49 }, (_, i) => `NE-SD-${i + 1}`), // Senate District 1-49
                stateLower: Array.from({ length: 100 }, (_, i) => `NE-HD-${i + 1}`) // House District 1-100
            },
            'NV': {
                name: 'Nevada',
                federal: Array.from({ length: 4 }, (_, i) => `NV-${i + 1}`), // NV-1 to NV-4
                stateUpper: Array.from({ length: 21 }, (_, i) => `NV-SD-${i + 1}`), // Senate District 1-21
                stateLower: Array.from({ length: 42 }, (_, i) => `NV-HD-${i + 1}`) // House District 1-42
            },
            'NH': {
                name: 'New Hampshire',
                federal: Array.from({ length: 2 }, (_, i) => `NH-${i + 1}`), // NH-1 to NH-2
                stateUpper: Array.from({ length: 24 }, (_, i) => `NH-SD-${i + 1}`), // Senate District 1-24
                stateLower: Array.from({ length: 400 }, (_, i) => `NH-HD-${i + 1}`) // House District 1-400
            },
            'NJ': {
                name: 'New Jersey',
                federal: Array.from({ length: 12 }, (_, i) => `NJ-${i + 1}`), // NJ-1 to NJ-12
                stateUpper: Array.from({ length: 40 }, (_, i) => `NJ-SD-${i + 1}`), // Senate District 1-40
                stateLower: Array.from({ length: 80 }, (_, i) => `NJ-AD-${i + 1}`) // Assembly District 1-80
            },
            'NM': {
                name: 'New Mexico',
                federal: Array.from({ length: 3 }, (_, i) => `NM-${i + 1}`), // NM-1 to NM-3
                stateUpper: Array.from({ length: 42 }, (_, i) => `NM-SD-${i + 1}`), // Senate District 1-42
                stateLower: Array.from({ length: 70 }, (_, i) => `NM-HD-${i + 1}`) // House District 1-70
            },
            'NY': {
                name: 'New York',
                federal: Array.from({ length: 26 }, (_, i) => `NY-${i + 1}`), // NY-1 to NY-26
                stateUpper: Array.from({ length: 63 }, (_, i) => `NY-SD-${i + 1}`), // Senate District 1-63
                stateLower: Array.from({ length: 150 }, (_, i) => `NY-AD-${i + 1}`) // Assembly District 1-150
            },
            'NC': {
                name: 'North Carolina',
                federal: Array.from({ length: 14 }, (_, i) => `NC-${i + 1}`), // NC-1 to NC-14
                stateUpper: Array.from({ length: 50 }, (_, i) => `NC-SD-${i + 1}`), // Senate District 1-50
                stateLower: Array.from({ length: 120 }, (_, i) => `NC-HD-${i + 1}`) // House District 1-120
            },
            'ND': {
                name: 'North Dakota',
                federal: Array.from({ length: 1 }, (_, i) => `ND-${i + 1}`), // ND-1 to ND-1
                stateUpper: Array.from({ length: 47 }, (_, i) => `ND-SD-${i + 1}`), // Senate District 1-47
                stateLower: Array.from({ length: 94 }, (_, i) => `ND-HD-${i + 1}`) // House District 1-94
            },
            'OH': {
                name: 'Ohio',
                federal: Array.from({ length: 15 }, (_, i) => `OH-${i + 1}`), // OH-1 to OH-15
                stateUpper: Array.from({ length: 33 }, (_, i) => `OH-SD-${i + 1}`), // Senate District 1-33
                stateLower: Array.from({ length: 99 }, (_, i) => `OH-HD-${i + 1}`) // House District 1-99
            },
            'OK': {
                name: 'Oklahoma',
                federal: Array.from({ length: 5 }, (_, i) => `OK-${i + 1}`), // OK-1 to OK-5
                stateUpper: Array.from({ length: 48 }, (_, i) => `OK-SD-${i + 1}`), // Senate District 1-48
                stateLower: Array.from({ length: 101 }, (_, i) => `OK-HD-${i + 1}`) // House District 1-101
            },
            'OR': {
                name: 'Oregon',
                federal: Array.from({ length: 6 }, (_, i) => `OR-${i + 1}`), // OR-1 to OR-6
                stateUpper: Array.from({ length: 30 }, (_, i) => `OR-SD-${i + 1}`), // Senate District 1-30
                stateLower: Array.from({ length: 60 }, (_, i) => `OR-HD-${i + 1}`) // House District 1-60
            },
            'PA': {
                name: 'Pennsylvania',
                federal: Array.from({ length: 17 }, (_, i) => `PA-${i + 1}`), // PA-1 to PA-17
                stateUpper: Array.from({ length: 50 }, (_, i) => `PA-SD-${i + 1}`), // Senate District 1-50
                stateLower: Array.from({ length: 203 }, (_, i) => `PA-HD-${i + 1}`) // House District 1-203
            },
            'RI': {
                name: 'Rhode Island',
                federal: Array.from({ length: 2 }, (_, i) => `RI-${i + 1}`), // RI-1 to RI-2
                stateUpper: Array.from({ length: 38 }, (_, i) => `RI-SD-${i + 1}`), // Senate District 1-38
                stateLower: Array.from({ length: 75 }, (_, i) => `RI-HD-${i + 1}`) // House District 1-75
            },
            'SC': {
                name: 'South Carolina',
                federal: Array.from({ length: 7 }, (_, i) => `SC-${i + 1}`), // SC-1 to SC-7
                stateUpper: Array.from({ length: 46 }, (_, i) => `SC-SD-${i + 1}`), // Senate District 1-46
                stateLower: Array.from({ length: 124 }, (_, i) => `SC-HD-${i + 1}`) // House District 1-124
            },
            'SD': {
                name: 'South Dakota',
                federal: Array.from({ length: 1 }, (_, i) => `SD-${i + 1}`), // SD-1 to SD-1
                stateUpper: Array.from({ length: 35 }, (_, i) => `SD-SD-${i + 1}`), // Senate District 1-35
                stateLower: Array.from({ length: 70 }, (_, i) => `SD-HD-${i + 1}`) // House District 1-70
            },
            'TN': {
                name: 'Tennessee',
                federal: Array.from({ length: 9 }, (_, i) => `TN-${i + 1}`), // TN-1 to TN-9
                stateUpper: Array.from({ length: 33 }, (_, i) => `TN-SD-${i + 1}`), // Senate District 1-33
                stateLower: Array.from({ length: 99 }, (_, i) => `TN-HD-${i + 1}`) // House District 1-99
            },
            'TX': {
                name: 'Texas',
                federal: Array.from({ length: 38 }, (_, i) => `TX-${i + 1}`), // TX-1 to TX-38
                stateUpper: Array.from({ length: 31 }, (_, i) => `TX-SD-${i + 1}`), // Senate District 1-31
                stateLower: Array.from({ length: 150 }, (_, i) => `TX-HD-${i + 1}`) // House District 1-150
            },
            'UT': {
                name: 'Utah',
                federal: Array.from({ length: 4 }, (_, i) => `UT-${i + 1}`), // UT-1 to UT-4
                stateUpper: Array.from({ length: 29 }, (_, i) => `UT-SD-${i + 1}`), // Senate District 1-29
                stateLower: Array.from({ length: 75 }, (_, i) => `UT-HD-${i + 1}`) // House District 1-75
            },
            'VT': {
                name: 'Vermont',
                federal: Array.from({ length: 1 }, (_, i) => `VT-${i + 1}`), // VT-1 to VT-1
                stateUpper: Array.from({ length: 30 }, (_, i) => `VT-SD-${i + 1}`), // Senate District 1-30
                stateLower: Array.from({ length: 150 }, (_, i) => `VT-HD-${i + 1}`) // House District 1-150
            },
            'VA': {
                name: 'Virginia',
                federal: Array.from({ length: 11 }, (_, i) => `VA-${i + 1}`), // VA-1 to VA-11
                stateUpper: Array.from({ length: 40 }, (_, i) => `VA-SD-${i + 1}`), // Senate District 1-40
                stateLower: Array.from({ length: 100 }, (_, i) => `VA-HD-${i + 1}`) // House District 1-100
            },
            'WA': {
                name: 'Washington',
                federal: Array.from({ length: 10 }, (_, i) => `WA-${i + 1}`), // WA-1 to WA-10
                stateUpper: Array.from({ length: 49 }, (_, i) => `WA-LD-${i + 1}`), // Legislative District 1-49 (Senate)
                stateLower: Array.from({ length: 98 }, (_, i) => `WA-LD-${i + 1}`) // Legislative District 1-98 (House)
            },
            'WV': {
                name: 'West Virginia',
                federal: Array.from({ length: 3 }, (_, i) => `WV-${i + 1}`), // WV-1 to WV-3
                stateUpper: Array.from({ length: 34 }, (_, i) => `WV-SD-${i + 1}`), // Senate District 1-34
                stateLower: Array.from({ length: 100 }, (_, i) => `WV-HD-${i + 1}`) // House District 1-100
            },
            'WI': {
                name: 'Wisconsin',
                federal: Array.from({ length: 8 }, (_, i) => `WI-${i + 1}`), // WI-1 to WI-8
                stateUpper: Array.from({ length: 33 }, (_, i) => `WI-SD-${i + 1}`), // Senate District 1-33
                stateLower: Array.from({ length: 99 }, (_, i) => `WI-AD-${i + 1}`) // Assembly District 1-99
            },
            'WY': {
                name: 'Wyoming',
                federal: Array.from({ length: 1 }, (_, i) => `WY-${i + 1}`), // WY-1 to WY-1
                stateUpper: Array.from({ length: 30 }, (_, i) => `WY-SD-${i + 1}`), // Senate District 1-30
                stateLower: Array.from({ length: 60 }, (_, i) => `WY-HD-${i + 1}`) // House District 1-60
            },
            // ... (Repeat pattern for other states)
            /*options: {
                federal: ['TX-10', 'TX-21', 'CA-12', 'NY-14'],
                stateUpper: ['Senate District 14', 'Senate District 25', 'Senate District 30'],
                stateLower: ['District 46', 'District 47', 'District 50']
            }*/
        },
    },
    //4,600+ Named Districts
    'IN': {
        countryLabel: 'India',
        labels: {
            federal: 'Lok Sabha Constituency (MP)',
            stateUpper: 'Rajya Sabha Constituency (MP)',
            stateLower: 'State Legislative Assembly Constituency (MLA)'
        },
        options: {
            'UP': {
                name: 'Uttar Pradesh',
                federal: Array.from({ length: 80 }, (_, i) => `UP-Fed-${i + 1}`),
                stateLower: ['AGRA CANTT. (SC)', 'AGRA NORTH', 'AGRA RURAL (SC)', 'AGRA SOUTH']
            },
            'MH': {
                name: 'Maharashtra',
                federal: Array.from({ length: 48 }, (_, i) => `MH-Fed-${i + 1}`),
                stateLower: Array.from({ length: 288 }, (_, i) => `MH-State-${i + 1}`)
            },
            'WB': {
                name: 'West Bengal',
                federal: Array.from({ length: 42 }, (_, i) => `WB-Fed-${i + 1}`),
                stateLower: Array.from({ length: 294 }, (_, i) => `WB-State-${i + 1}`)
            },
            'BR': {
                name: 'Bihar',
                federal: Array.from({ length: 40 }, (_, i) => `BR-Fed-${i + 1}`),
                stateLower: Array.from({ length: 243 }, (_, i) => `BR-State-${i + 1}`)
            },
            'TN': {
                name: 'Tamil Nadu',
                federal: Array.from({ length: 39 }, (_, i) => `TN-Fed-${i + 1}`),
                stateLower: Array.from({ length: 234 }, (_, i) => `TN-State-${i + 1}`)
            },
            'MP': {
                name: 'Madhya Pradesh',
                federal: Array.from({ length: 29 }, (_, i) => `MP-Fed-${i + 1}`),
                stateLower: Array.from({ length: 230 }, (_, i) => `MP-State-${i + 1}`)
            },
            'KA': {
                name: 'Karnataka',
                federal: Array.from({ length: 28 }, (_, i) => `KA-Fed-${i + 1}`),
                stateLower: Array.from({ length: 224 }, (_, i) => `KA-State-${i + 1}`)
            },
            'GJ': {
                name: 'Gujarat',
                federal: Array.from({ length: 26 }, (_, i) => `GJ-Fed-${i + 1}`),
                stateLower: Array.from({ length: 182 }, (_, i) => `GJ-State-${i + 1}`)
            },
            'RJ': {
                name: 'Rajasthan',
                federal: Array.from({ length: 25 }, (_, i) => `RJ-Fed-${i + 1}`),
                stateLower: Array.from({ length: 200 }, (_, i) => `RJ-State-${i + 1}`)
            },
            'AP': {
                name: 'Andhra Pradesh',
                federal: Array.from({ length: 25 }, (_, i) => `AP-Fed-${i + 1}`),
                stateLower: Array.from({ length: 175 }, (_, i) => `AP-State-${i + 1}`)
            },
            'OD': {
                name: 'Odisha',
                federal: Array.from({ length: 21 }, (_, i) => `OD-Fed-${i + 1}`),
                stateLower: Array.from({ length: 147 }, (_, i) => `OD-State-${i + 1}`)
            },
            'KL': {
                name: 'Kerala',
                federal: Array.from({ length: 20 }, (_, i) => `KL-Fed-${i + 1}`),
                stateLower: Array.from({ length: 140 }, (_, i) => `KL-State-${i + 1}`)
            },
            'TG': {
                name: 'Telangana',
                federal: Array.from({ length: 17 }, (_, i) => `TG-Fed-${i + 1}`),
                stateLower: Array.from({ length: 119 }, (_, i) => `TG-State-${i + 1}`)
            },
            'AS': {
                name: 'Assam',
                federal: Array.from({ length: 14 }, (_, i) => `AS-Fed-${i + 1}`),
                stateLower: Array.from({ length: 126 }, (_, i) => `AS-State-${i + 1}`)
            },
            'JH': {
                name: 'Jharkhand',
                federal: Array.from({ length: 14 }, (_, i) => `JH-Fed-${i + 1}`),
                stateLower: Array.from({ length: 81 }, (_, i) => `JH-State-${i + 1}`)
            },
            'PB': {
                name: 'Punjab',
                federal: Array.from({ length: 13 }, (_, i) => `PB-Fed-${i + 1}`),
                stateLower: Array.from({ length: 117 }, (_, i) => `PB-State-${i + 1}`)
            },
            'CT': {
                name: 'Chattisgarh',
                federal: Array.from({ length: 11 }, (_, i) => `CT-Fed-${i + 1}`),
                stateLower: Array.from({ length: 90 }, (_, i) => `CT-State-${i + 1}`)
            },
            'HR': {
                name: 'Haryana',
                federal: Array.from({ length: 10 }, (_, i) => `HR-Fed-${i + 1}`),
                stateLower: Array.from({ length: 90 }, (_, i) => `HR-State-${i + 1}`)
            },
            'DL': {
                name: 'Delhi',
                federal: Array.from({ length: 7 }, (_, i) => `DL-Fed-${i + 1}`),
                stateLower: Array.from({ length: 70 }, (_, i) => `DL-State-${i + 1}`)
            },
            'JK': {
                name: 'Jammu and Kashmir',
                federal: Array.from({ length: 5 }, (_, i) => `JK-Fed-${i + 1}`),
                stateLower: Array.from({ length: 90 }, (_, i) => `JK-State-${i + 1}`)
            },
            'UK': {
                name: 'Uttarakhand',
                federal: Array.from({ length: 5 }, (_, i) => `UK-Fed-${i + 1}`),
                stateLower: Array.from({ length: 70 }, (_, i) => `UK-State-${i + 1}`)
            },
            'HP': {
                name: 'Himachal Pradesh',
                federal: Array.from({ length: 4 }, (_, i) => `HP-Fed-${i + 1}`),
                stateLower: Array.from({ length: 68 }, (_, i) => `HP-State-${i + 1}`)
            },
            'TR': {
                name: 'Tripura',
                federal: Array.from({ length: 2 }, (_, i) => `TR-Fed-${i + 1}`),
                stateLower: Array.from({ length: 60 }, (_, i) => `TR-State-${i + 1}`)
            },
            'ML': {
                name: 'Meghalaya',
                federal: Array.from({ length: 2 }, (_, i) => `ML-Fed-${i + 1}`),
                stateLower: Array.from({ length: 60 }, (_, i) => `ML-State-${i + 1}`)
            },
            'MN': {
                name: 'Manipur',
                federal: Array.from({ length: 2 }, (_, i) => `MN-Fed-${i + 1}`),
                stateLower: Array.from({ length: 60 }, (_, i) => `MN-State-${i + 1}`)
            },
            'AR': {
                name: 'Arunachal Pradesh',
                federal: Array.from({ length: 2 }, (_, i) => `AR-Fed-${i + 1}`),
                stateLower: Array.from({ length: 60 }, (_, i) => `AR-State-${i + 1}`)
            },
            'GA': {
                name: 'Goa',
                federal: Array.from({ length: 2 }, (_, i) => `GA-Fed-${i + 1}`),
                stateLower: Array.from({ length: 40 }, (_, i) => `GA-State-${i + 1}`)
            },
            'MZ': {
                name: 'Mizoram',
                federal: Array.from({ length: 1 }, (_, i) => `MZ-Fed-${i + 1}`),
                stateLower: Array.from({ length: 40 }, (_, i) => `MZ-State-${i + 1}`)
            },
            'NL': {
                name: 'Nagaland',
                federal: Array.from({ length: 1 }, (_, i) => `NL-Fed-${i + 1}`),
                stateLower: Array.from({ length: 60 }, (_, i) => `NL-State-${i + 1}`)
            },
            'SK': {
                name: 'Sikkim',
                federal: Array.from({ length: 1 }, (_, i) => `SK-Fed-${i + 1}`),
                stateLower: Array.from({ length: 32 }, (_, i) => `SK-State-${i + 1}`)
            },
            'PY': {
                name: 'Puducherry',
                federal: Array.from({ length: 1 }, (_, i) => `PY-Fed-${i + 1}`),
                stateLower: Array.from({ length: 30 }, (_, i) => `PY-State-${i + 1}`)
            },
            'CH': {
                name: 'Chandigarh',
                federal: Array.from({ length: 1 }, (_, i) => `CH-Fed-${i + 1}`),
                stateLower: [] // UT (No Legislature)
            },
            'DN': {
                name: 'Dadra and Nagar Haveli',
                federal: Array.from({ length: 2 }, (_, i) => `DN-Fed-${i + 1}`),
                stateLower: [] // UT (No Legislature)
            },
            'LA': {
                name: 'Lakshadweep',
                federal: Array.from({ length: 1 }, (_, i) => `LA-Fed-${i + 1}`),
                stateLower: [] // UT (No Legislature)
            },
            'LD': {
                name: 'Dadra and Nagar Haveli',
                federal: Array.from({ length: 1 }, (_, i) => `LD-Fed-${i + 1}`),
                stateLower: [] // UT (No Legislature)
            },
            'AN': {
                name: 'Andaman and Nicobar Islands',
                federal: Array.from({ length: 1 }, (_, i) => `AN-Fed-${i + 1}`),
                stateLower: [] // UT (No Legislature)
            }
        }
    },
    'CA': {
        countryLabel: 'Canada',
        labels: {
            federal: 'Federal Riding (Parliamentary MP)',
            stateUpper: '', // 🇨🇦 Canadian Senators are appointed by the Governor General. Omitted for voters.
            stateLower: 'Provincial Riding (MLA / MPP / MNA)'
        },
        options: {
            'ON': {
                name: 'Ontario',
                federal: Array.from({ length: 121 }, (_, i) => `ON-Fed-${i + 1}`), // 121 Federal Ridings
                provincial: Array.from({ length: 124 }, (_, i) => `ON-Prov-${i + 1}`), // 124 Provincial Ridings
                municipal: ['Toronto-Ward 1', 'Ottawa-Ward 3', 'Mississauga-Ward 5'] // Scaled by municipality
            },
            'QC': {
                name: 'Quebec',
                federal: Array.from({ length: 78 }, (_, i) => `QC-Fed-${i + 1}`),
                provincial: Array.from({ length: 125 }, (_, i) => `QC-Prov-${i + 1}`),
                municipal: ['Montreal-District 1', 'QuebecCity-District 4']
            },
            'BC': {
                name: 'British Columbia',
                federal: Array.from({ length: 43 }, (_, i) => `BC-Fed-${i + 1}`),
                provincial: Array.from({ length: 93 }, (_, i) => `BC-Prov-${i + 1}`),
                municipal: ['Vancouver-At-Large', 'Surrey-Ward 2'] // Note: Vancouver uses at-large voting
            },
            'AB ': {
                name: 'Alberta',
                federal: Array.from({ length: 34 }, (_, i) => `AB-Fed-${i + 1}`),
                provincial: Array.from({ length: 87 }, (_, i) => `AB-Prov-${i + 1}`),
                municipal: ['Calgary-Ward 2', 'Edmonton-Ward 5']
            },
            'SK': {
                name: 'Saskatchewan',
                federal: Array.from({ length: 14 }, (_, i) => `SK-Fed-${i + 1}`),
                provincial: Array.from({ length: 61 }, (_, i) => `SK-Prov-${i + 1}`),
                municipal: ['Saskatoon-Ward 3', 'Regina-Ward 1']
            },
            'MB': {
                name: 'Manitoba',
                federal: Array.from({ length: 14 }, (_, i) => `MB-Fed-${i + 1}`),
                provincial: Array.from({ length: 57 }, (_, i) => `MB-Prov-${i + 1}`),
                municipal: ['Winnipeg-Ward 2', 'Brandon-Ward 4']
            },
            'NS': {
                name: 'Nova Scotia',
                federal: Array.from({ length: 11 }, (_, i) => `NS-Fed-${i + 1}`),
                provincial: Array.from({ length: 51 }, (_, i) => `NS-Prov-${i + 1}`),
                municipal: ['Halifax-Dartmouth', 'Sydney-CBD']
            },
            'NB': {
                name: 'New Brunswick',
                federal: Array.from({ length: 10 }, (_, i) => `NB-Fed-${i + 1}`),
                provincial: Array.from({ length: 49 }, (_, i) => `NB-Prov-${i + 1}`),
                municipal: ['Fredericton-Central', 'SaintJohn-East']
            },
            'PE': {
                name: 'Prince Edward Island',
                federal: Array.from({ length: 4 }, (_, i) => `PE-Fed-${i + 1}`),
                provincial: Array.from({ length: 27 }, (_, i) => `PE-Prov-${i + 1}`),
                municipal: ['Charlottetown-Ward 2', 'Summerside-East']
            },
            'NL': {
                name: 'Newfoundland and Labrador',
                federal: Array.from({ length: 7 }, (_, i) => `NL-Fed-${i + 1}`),
                provincial: Array.from({ length: 40 }, (_, i) => `NL-Prov-${i + 1}`),
                municipal: ['St. John\'s-East', 'Corner Brook-Central']
            },
            'NT': {
                name: 'Northwest Territories', // 1 Federal Riding, 1 Territorial Legislature
                federal: ['NWT-Fed-1'],
                territorial: ['Inuvik-Twin Lakes', 'Yellowknife-North']
            },
            'NU': {
                name: 'Nunavut', // 1 Federal Riding, 1 Territorial Legislature
                federal: ['Nunavut-Fed-1'],
                territorial: ['Qikiqtarjuaq', 'Baker Lake']
            },
            'YT': {
                name: 'Yukon', // 1 Federal Riding, 1 Territorial Legislature
                federal: ['Yukon-Fed-1'],
                territorial: ['Whitehorse-Riverdale', 'Kluane']
            }
        }
    },

    'GB': {
        countryLabel: 'United Kingdom',
        labels: {
            federal: 'Westminster Constituency (MP)',
            stateUpper: '', // 🇬🇧 House of Lords members are appointed or hereditary. Omitted for voters.
            stateLower: 'Devolved Region Assembly / Local Council Ward'
        },
        options: {
            nations: {
                'ENG': {
                    federal: '543 MPs', // Westminster Constituencies
                    regional: 'London Assembly (GLA)'
                },
                'SCO': {
                    federal: '57 MPs', // Westminster Constituencies
                    regional: '73 FPTP + 56 List Seats (129 Total)'
                },
                'WAL': {
                    federal: '32 MPs', // Westminster Constituencies
                    regional: '16 Super-constituencies (96 Members)'
                }
            }
        }
    }
};

// HELPER FUNCTION: To flatten this into your original list format if needed
// Example Usage:
// console.log(getAllOptions('US', 'federal')); // Output: ['TX-1', 'TX-2', ... 'CA-52', etc.]
function getAllOptions(countryCode, type) {
    let allOptions = [];
    const stateData = electionData[countryCode].states;

    for (const state in stateData) {
        if (stateData[state][type]) {
            allOptions = allOptions.concat(stateData[state][type]);
        }
    }
    return allOptions;
}

// HELPER FUNCTION: Flattens the nested structures into single arrays
// Example Usage:
// const allFederalRidings = getCanadianOptions('federal');    // Returns all 343 entries
// const allProvincialRidings = getCanadianOptions('provincial'); // Returns all 870 entries
// const allSampleMunicipal = getCanadianOptions('municipal');
function getCanadianOptions(type) {
    let allOptions = [];
    const provinceData = electionDataCA['CA'].provinces;

    for (const prov in provinceData) {
        if (provinceData[prov][type]) {
            allOptions = allOptions.concat(provinceData[prov][type]);
        }
    }
    return allOptions;
}

// HELPER FUNCTION: Generates the flat lists dynamically
// USAGE EXAMPLES:
// const allMPs = getIndianOptions('federal');      // Returns 543 entries (e.g., ['UP-MP-1', ... 'AN-MP-1'])
// const allMLAs = getIndianOptions('stateLower');  // Returns 4,123+ entries (e.g., ['UP-MLA-1', ... 'PY-MLA-30'])
function getIndianOptions(type) { // type = 'federal' or 'stateLower'
    let allOptions = [];
    const stateData = electionDataIN['IN'].states;

    for (const code in stateData) {
        const state = stateData[code];
        const count = state[type]; // e.g., 80 or 403

        if (count > 0) {
            // Generate IDs like "UP-MP-1", "UP-MLA-1", etc.
            // Using "MP" for Federal and "MLA" for State Lower
            const suffix = type === 'federal' ? 'MP' : 'MLA';
            const generated = Array.from({ length: count }, (_, i) => `${code}-${suffix}-${i + 1}`);
            allOptions = allOptions.concat(generated);
        }
    }
    return allOptions;
}

