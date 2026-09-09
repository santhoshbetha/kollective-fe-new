// src/components/ui/localOfficesConfig.js

export const LOCAL_OFFICES_REGISTRY = {
    'US': [
        {
            id: 'school_board',
            category: 'Education',
            label: 'School Board Member',
            scope: 'county',
            desc: 'Oversees school district policies, budgets, and curriculum frameworks.'
        },
        {
            id: 'sheriff',
            category: 'Criminal Justice',
            label: 'County Sheriff',
            scope: 'county',
            desc: 'Manages local jails, sets arrest priorities, and guides county law enforcement.'
        },
        {
            id: 'prosecutor',
            category: 'Criminal Justice',
            label: 'District Attorney / Prosecutor',
            scope: 'county',
            desc: 'Wields broad discretion over charges, bail terms, and sentencing recommendations.'
        },
        {
            id: 'coroner',
            category: 'Criminal Justice',
            label: 'County Coroner',
            scope: 'county',
            desc: 'Oversees localized forensic death investigations and autopsy audits.'
        },
        {
            id: 'trial_judge',
            category: 'Judiciary',
            label: 'Local Trial Court Judge',
            scope: 'county',
            desc: 'Presides over civil, criminal, family, or landlord-tenant case dockets.'
        },
        {
            id: 'city_council',
            category: 'Governance',
            label: 'City Council Member',
            scope: 'city',
            desc: 'Approves municipal budgets, passes local ordinances, and regulates zoning laws.'
        },
        {
            id: 'mayor',
            category: 'Governance',
            label: 'Mayor (Executive)',
            scope: 'city',
            desc: 'Appoints department heads (police, sanitation) and manages daily city operations.'
        },
        {
            id: 'county_supervisor',
            category: 'Governance',
            label: 'County Board Supervisor / Commissioner',
            scope: 'county',
            desc: 'Levies county taxes, issues service contracts, and administers elections.'
        },
        {
            id: 'public_works',
            category: 'Infrastructure',
            label: 'Public Works / Water Commissioner',
            scope: 'city',
            desc: 'Manages utility rates, water supply, sewage, and public environmental infrastructure.'
        },
        {
            id: 'comptroller',
            category: 'Finance',
            label: 'City Comptroller',
            scope: 'city',
            desc: 'Chief financial officer auditing local agencies, contracts, and municipal pensions.'
        }
    ],
    'IN': [
        // --- Rural (Panchayati Raj) ---
        {
            id: 'gram_panchayat_member',
            category: 'Rural Governance',
            label: 'Gram Panchayat Member (Panch)',
            scope: 'village',
            desc: 'Directly elected representative of a village ward. Votes on local development plans and beneficiary selection for welfare schemes.'
        },
        {
            id: 'sarpanch',
            category: 'Rural Governance',
            label: 'Sarpanch / Pradhan / Mukhiya',
            scope: 'village',
            desc: 'Directly elected village head in most states (e.g., UP, Bihar, AP, Rajasthan, MP, Haryana). Note: Elected indirectly by members in Karnataka, Kerala, and West Bengal.'
        },
        {
            id: 'panchayat_samiti_member',
            category: 'Rural Governance',
            label: 'Panchayat Samiti Member (Block Councillor)',
            scope: 'block',
            desc: 'Directly elected representative for the intermediate block-level council (Mandal Parishad/Janpad Panchayat). Coordinates funding across multiple villages.'
        },
        {
            id: 'zila_parishad_member',
            category: 'Rural Governance',
            label: 'Zila Parishad Member (District Councillor)',
            scope: 'district',
            desc: 'Directly elected representative for the district-level council. Oversees large-scale infrastructure and manages devolved state funds.'
        },

        // --- Urban (Municipalities) ---
        {
            id: 'municipal_councillor',
            category: 'Urban Governance',
            label: 'Ward Councillor / Corporator',
            scope: 'city/town',
            desc: 'Directly elected representative of an urban ward in Municipal Corporations or Councils. Responsible for civic utilities, sanitation, and local zoning.'
        },
        {
            id: 'mayor_direct',
            category: 'Urban Governance',
            label: 'Mayor / Chairperson (Directly Elected)',
            scope: 'city',
            desc: 'Executive head elected directly by citizens in Uttar Pradesh, Haryana, Madhya Pradesh, Bihar, Jharkhand, Odisha, and Uttarakhand. (In states like Maharashtra, Karnataka, and West Bengal, this role is indirectly elected).'
        },

        // --- Specialized / Tribal ---
        {
            id: 'adc_member',
            category: 'Tribal Governance',
            label: 'Autonomous District Council Member',
            scope: 'district',
            desc: 'Directly elected in Sixth Schedule tribal areas (Assam, Meghalaya, Mizoram, Tripura) to legislate on land, customs, and forests.'
        }
    ],

    // 🇨🇦 CANADA EXTENSION: Automatic data-driven layout swap
    'CA': [
        { id: 'city_council', category: 'Governance', label: 'City Councillor', scope: 'city', desc: 'Sits as the legislative representative for your municipal ward.' },
        { id: 'mayor', category: 'Governance', label: 'Mayor', scope: 'city', desc: 'Head of council, serving as the chief executive officer of the municipality.' },
        { id: 'school_trustee', category: 'Education', label: 'School Board Trustee', scope: 'city', desc: 'Governs local school divisions, setting operating budgets and policy.' }
    ],

    // 🇬🇧 UNITED KINGDOM EXTENSION: Automatic data-driven layout swap
    'GB': [
        { id: 'local_councillor', category: 'Governance', label: 'Local Ward Councillor', scope: 'city', desc: 'Represents the local neighborhood ward on the District or Borough Council.' },
        { id: 'parish_council', category: 'Governance', label: 'Parish / Town Councillor', scope: 'city', desc: 'The closest tier of local government, managing community asset parameters.' }
    ],
    'INX': [
        {
            id: 'sarpanch',
            category: 'Governance',
            label: 'Sarpanch (Gram Panchayat Head)',
            scope: 'village',
            desc: 'Leads the village council, implements rural development schemes, and manages local resources.'
        },
        {
            id: 'gram_panchayat_member',
            category: 'Governance',
            label: 'Gram Panchayat Ward Member (Panch)',
            scope: 'village',
            desc: 'Directly elected representative of a village ward. Votes on local development plans and beneficiary selection for welfare schemes.'
        },
        {
            id: 'panchayat_samiti_member',
            category: 'Governance',
            label: 'Panchayat Samiti Member',
            scope: 'block',
            desc: 'Represents a block-level constituency and coordinates developmental plans across multiple villages.'
        },
        {
            id: 'block_pramukh',
            category: 'Governance',
            label: 'Block Pramukh (Panchayat Samiti President)',
            scope: 'block',
            desc: 'Executive head of the intermediate block council who approves and allocates rural funding.'
        },
        {
            id: 'zila_parishad_member',
            category: 'Governance',
            label: 'Zila Parishad Member (District Councillor)',
            scope: 'district',
            desc: 'Represents district-level territorial constituencies and shapes macro rural development policies.'
        },
        {
            id: 'zila_parishad_chairperson',
            category: 'Governance',
            label: 'Zila Parishad Chairperson / President',
            scope: 'district',
            desc: 'Chief executive of district rural governance, overseeing substantial state and federal development funds.'
        },
        {
            id: 'municipal_corporator',
            category: 'Governance',
            label: 'Municipal Corporator / Councillor',
            scope: 'city',
            desc: 'Directly elected ward representative who votes on city budgets, zoning, and urban public health.'
        },
        {
            id: 'mayor',
            category: 'Governance',
            label: 'Mayor',
            scope: 'city',
            desc: 'Ceremonial or executive head of a large city corporation presiding over municipal general body meetings.'
        },
        {
            id: 'nagar_panchayat_chairperson',
            category: 'Governance',
            label: 'Nagar Panchayat Chairperson',
            scope: 'town',
            desc: 'Heads governance for semi-urban transitional areas, directing local sanitation and street infrastructure.'
        },
        {
            id: 'adc_member',
            category: 'Governance',
            label: 'Autonomous District Council Member',
            scope: 'district',
            desc: 'Elected in specialized tribal zones under the 6th Schedule to legislate on land, custom, and local culture.'
        }
    ],
};

export function useLocalOffices(countryCode, userCity, userState) {
    // 🎯 THE AUTOMATIC FALLBACK SWITCH: Instantly maps the correct international list
    const offices = LOCAL_OFFICES_REGISTRY[countryCode] || LOCAL_OFFICES_REGISTRY['US'];

    return offices.map(office => ({
        ...office,
        // Automatically creates clean, standardized database lookup keys globally
        // e.g., "toronto_on", "manchester_england"
        targetDistrictCode: office.scope === 'city'
            ? `${userCity}_${userState}`.toLowerCase().replace(/\s+/g, '_')
            : `${userState}_county_node`.toLowerCase()
    }));
}
