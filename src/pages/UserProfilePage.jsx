import { useState } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuthStore } from '../store/auth/useAuthStore';
import { usePostsQuery } from '../features/timeline/usePostsQuery';
import { PostCard } from '../features/timeline/PostCard';
import { TrendingWidget } from '../components/TrendingWidget';
import { useStore } from '../store/useStore';
import VerificationBadge from '../components/VerificationBadge';

const profilesData = {
  alsweigart: {
    name: 'Al Sweigart',
    handle: '@AlSweigart',
    role: 'Python Developer & Author',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCQNN0P3XlVnTIhrPCgSPxw3xMTUKxoCrIm8gPDQa1k5pfwxy3EIRkuVFuaUyuRB88yZ-5J-yHUv0PO8nGhi_ZpcjQtc6m7CEL-m3TuVim0DX-huo3tI8MYJS67MsASKXBYP5oox0RPJBg3XGnmavtmph1-Ljy1LQmTZlA8sKChCWypzu3L7QW29eETcmbNtLmLYOrdByBamv0CIQEZoVufbLeaBHrXDodOqgrka3m-BXd7lD4rIz5WfbhzJDm08u1QmIpJZeszyoc',
    banner: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCYIcLHxbcrouUkl8jiAso6nVAcQtR8x3Oq9gyuXmoxZbjPuS6iM4Gz7INuNhk8zIk125rQjbBO2U5_KP-sfpRV05uaWtTAKUy0iOdZ9yPetghCRjvFz7luny9PzV_NWzWqRUZGQIN61LrzwL8ufhHdsg-1-cmyKYI21dj9Ad3EcRIo53jlaSq5mVOV1wpwSo-a-9RbjfVX81EkrIVoDemafpo_rYC1swAQHuGCfeO4HzUi6D_X33r_a6LjQZzLIcXhmECGbjCOnHI',
    bio: "Python developer & author. Wrote 'Automate the Boring Stuff with Python', 'Invent Your Own Computer Games with Python', and other free programming books.",
    postsCount: '4.8K',
    followingCount: '230',
    followersCount: '34.1K',
    metadata: [
      { key: 'Website', value: 'inventwithpython.com', verified: true, url: 'https://inventwithpython.com' },
      { key: 'GitHub', value: 'asweigart', verified: true, url: 'https://github.com/asweigart' },
      { key: 'Books', value: '5+ free programming books', verified: false },
      { key: 'Location', value: 'California', verified: false }
    ],
    posts: [
      {
        id: 'al-post-1',
        title: "New edition of 'Automate the Boring Stuff with Python'",
        text: "I'm happy to announce that the new edition of 'Automate the Boring Stuff with Python' is now fully complete and free to read online! It covers new libraries like openpyxl, selenium, and pyppeteer for web scraping and spreadsheet automation. Enjoy! inventwithpython.com #Python #programming #learning",
        author: {
          name: 'Al Sweigart',
          handle: '@AlSweigart',
          role: 'Python Developer & Author',
          verified: true,
          avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCQNN0P3XlVnTIhrPCgSPxw3xMTUKxoCrIm8gPDQa1k5pfwxy3EIRkuVFuaUyuRB88yZ-5J-yHUv0PO8nGhi_ZpcjQtc6m7CEL-m3TuVim0DX-huo3tI8MYJS67MsASKXBYP5oox0RPJBg3XGnmavtmph1-Ljy1LQmTZlA8sKChCWypzu3L7QW29eETcmbNtLmLYOrdByBamv0CIQEZoVufbLeaBHrXDodOqgrka3m-BXd7lD4rIz5WfbhzJDm08u1QmIpJZeszyoc',
        },
        likes: 1240,
        commentsCount: 84,
        shares: 312,
        isVoice: false,
        time: '3h ago',
        category: 'All Activity',
        tags: ['#Python', '#programming', '#learning']
      },
      {
        id: 'al-post-2',
        title: 'CC-Licensed Free Programming Books',
        text: 'inventwithpython.com is my home base where you can read inventor/writing guides, download game source codes, or get print copies of "Invent Your Own Computer Games with Python". All books are CC-licensed! #CreativeCommons #EdTech',
        author: {
          name: 'Al Sweigart',
          handle: '@AlSweigart',
          role: 'Python Developer & Author',
          verified: true,
          avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCQNN0P3XlVnTIhrPCgSPxw3xMTUKxoCrIm8gPDQa1k5pfwxy3EIRkuVFuaUyuRB88yZ-5J-yHUv0PO8nGhi_ZpcjQtc6m7CEL-m3TuVim0DX-huo3tI8MYJS67MsASKXBYP5oox0RPJBg3XGnmavtmph1-Ljy1LQmTZlA8sKChCWypzu3L7QW29eETcmbNtLmLYOrdByBamv0CIQEZoVufbLeaBHrXDodOqgrka3m-BXd7lD4rIz5WfbhzJDm08u1QmIpJZeszyoc',
        },
        likes: 856,
        commentsCount: 38,
        shares: 145,
        isVoice: false,
        time: '1d ago',
        category: 'Popular',
        tags: ['#CreativeCommons', '#EdTech']
      },
      {
        id: 'al-post-3',
        title: 'Python pathlib tip',
        text: 'Did you know? In Python, you can use the `pathlib` module to handle file paths across Windows, Mac, and Linux without worrying about forward/backward slash discrepancies. It makes path manipulations a breeze! #CodingTips #PythonTip',
        author: {
          name: 'Al Sweigart',
          handle: '@AlSweigart',
          role: 'Python Developer & Author',
          verified: true,
          avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCQNN0P3XlVnTIhrPCgSPxw3xMTUKxoCrIm8gPDQa1k5pfwxy3EIRkuVFuaUyuRB88yZ-5J-yHUv0PO8nGhi_ZpcjQtc6m7CEL-m3TuVim0DX-huo3tI8MYJS67MsASKXBYP5oox0RPJBg3XGnmavtmph1-Ljy1LQmTZlA8sKChCWypzu3L7QW29eETcmbNtLmLYOrdByBamv0CIQEZoVufbLeaBHrXDodOqgrka3m-BXd7lD4rIz5WfbhzJDm08u1QmIpJZeszyoc',
        },
        likes: 932,
        commentsCount: 29,
        shares: 110,
        isVoice: false,
        time: '2d ago',
        category: 'All Activity',
        tags: ['#CodingTips', '#PythonTip']
      }
    ]
  },
  marcus_vane: {
    name: 'Marcus Vane',
    handle: '@marcus_vane',
    role: 'Chief Coordinator',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCFiT0Pa3oVQMLzQ2x3P11V0nXfZcRi-gPxGZBYPetn7Bmnob5-yT4w1JeQAzO4KBl9fte33rD3P-j_T2j1p2nG8IPL7WQmdBRJTO8fUAOF6ZUBr2dVhZ0c9Jol-3aUTV0_REQLVEz7yPUD1pT-570RZgQ39N2crZuwJ-3t3_eR4VXltS1Ny_WoWQQXrpX4kuL_bGEkbDtSHxl_Vnt5vMXbQikBXJPa6oTEHcSbFHGLnVOfYJsi5vNUgRAi3WHxnPN3K4GK3tJDzTk',
    banner: '',
    bio: 'Chief Coordinator of the sovereign local circles. Building frontline resilience protocols. Backing alternative media.',
    postsCount: '320',
    followingCount: '150',
    followersCount: '14.2K',
    metadata: [
      { key: 'Website', value: 'marcusvane.org', verified: true, url: 'https://marcusvane.org' },
      { key: 'Joined', value: 'Dec 2022', verified: false },
      { key: 'Node', value: 'District 9 Mutual Aid', verified: false }
    ],
    posts: []
  },
  elena_thorne: {
    name: 'Elena Thorne',
    handle: '@elena_thorne',
    role: 'Cooperative Researcher',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD85qQJcFfl7AKHAQa-8gW_JvuTeCwdJMhDpIVAfkFNS4zGYVyRKZvq3DtFN3KbBMYjRDxigr72I3k6XhmPKJV43OTdiomvzMT4-yPe9c7iNxKH03UG9wUQcJlxbZoxTOl_rwGcKMaBQ9urBL69DE1jFyMvVfE-qwxck8XYn-vlrUpIeBBON1KXUvELImyP48LH6O5oyltrkeJXG7-xIvsBCAwwQjyLgWVB_yIetyaHiZdNi1OQBk9dtLRaHM2U3JjLYQn3_2Waaew',
    banner: '',
    bio: 'Cooperative researcher and digital autonomy advocate. Investigating decentralized alternative wealth models.',
    postsCount: '184',
    followingCount: '89',
    followersCount: '8.6K',
    metadata: [
      { key: 'Website', value: 'elenathorne.net', verified: true, url: 'https://elenathorne.net' },
      { key: 'Joined', value: 'Jan 2023', verified: false }
    ],
    posts: []
  },
  j_thorne: {
    name: 'Julian Thorne',
    handle: '@j_thorne',
    role: 'Architect of the Red Shift',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDDkj_L45i8SmnUNelsTSM7xt_t_GV39eYINp6PEQVVLlXUxSvJaNjQYzESvNDMuqrIwONlm6hWBLqOoS8riEyh-1rKUOHRC9C0nsco1tez2QwPMohMyfQvIRlEG3LSpzE_csuDr2MokaO0fyDbrBtLG8zyRK0UE4YoMGHfKU7mmL9pHuChnByhBWfv5g3nPIU3ijvm7g9FXRvV2fzc5TP7CmY_3iFzk73u23dxjIYRKOVsoB-DnXNeLelemr06EtW5rrGyER3EA6c',
    banner: '',
    bio: 'Architect of the Red Shift. Building frontline local resilience protocols. Backing sovereign digital networks.',
    postsCount: '15',
    followingCount: '45',
    followersCount: '1.2K',
    metadata: [
      { key: 'Website', value: 'kollective.org', verified: true, url: 'https://kollective.org' },
      { key: 'Location', value: 'California', verified: false }
    ],
    posts: []
  },
  nymag: {
    name: 'New York Magazine',
    handle: '@nymag@threads.net',
    role: 'Publisher',
    type: 'organization',
    badge_type: 'organization',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCYIcLHxbcrouUkl8jiAso6nVAcQtR8x3Oq9gyuXmoxZbjPuS6iM4Gz7INuNhk8zIk125rQjbBO2U5_KP-sfpRV05uaWtTAKUy0iOdZ9yPetghCRjvFz7luny9PzV_NWzWqRUZGQIN61LrzwL8ufhHdsg-1-cmyKYI21dj9Ad3EcRIo53jlaSq5mVOV1wpwSo-a-9RbjfVX81EkrIVoDemafpo_rYC1swAQHuGCfeO4HzUi6D_X33r_a6LjQZzLIcXhmECGbjCOnHI',
    banner: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=1200&q=80',
    bio: 'The life of the city. Witty, analytical, and indispensable. Follow our feeds for the latest from New York, Vulture, The Cut, Grub Street, and Curbed.',
    postsCount: '250',
    followingCount: '12',
    followersCount: '840K',
    metadata: [
      { key: 'Website', value: 'nymag.com', verified: true, url: 'https://nymag.com' },
      { key: 'Threads', value: '@nymag', verified: true, url: 'https://threads.net/@nymag' },
      { key: 'Type', value: 'Publisher / Organization', verified: false }
    ],
    members: [
      { name: 'Julian Thorne', handle: '@j_thorne', role: 'Architect & Editor', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDDkj_L45i8SmnUNelsTSM7xt_t_GV39eYINp6PEQVVLlXUxSvJaNjQYzESvNDMuqrIwONlm6hWBLqOoS8riEyh-1rKUOHRC9C0nsco1tez2QwPMohMyfQvIRlEG3LSpzE_csuDr2MokaO0fyDbrBtLG8zyRK0UE4YoMGHfKU7mmL9pHuChnByhBWfv5g3nPIU3ijvm7g9FXRvV2fzc5TP7CmY_3iFzk73u23dxjIYRKOVsoB-DnXNeLelemr06EtW5rrGyER3EA6c' },
      { name: 'Elena Thorne', handle: '@elena_thorne', role: 'Cooperative Researcher', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD85qQJcFfl7AKHAQa-8gW_JvuTeCwdJMhDpIVAfkFNS4zGYVyRKZvq3DtFN3KbBMYjRDxigr72I3k6XhmPKJV43OTdiomvzMT4-yPe9c7iNxKH03UG9wUQcJlxbZoxTOl_rwGcKMaBQ9urBL69DE1jFyMvVfE-qwxck8XYn-vlrUpIeBBON1KXUvELImyP48LH6O5oyltrkeJXG7-xIvsBCAwwQjyLgWVB_yIetyaHiZdNi1OQBk9dtLRaHM2U3JjLYQn3_2Waaew' },
      { name: 'Marcus Vane', handle: '@marcus_vane', role: 'Chief Coordinator', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCFiT0Pa3oVQMLzQ2x3P11V0nXfZcRi-gPxGZBYPetn7Bmnob5-yT4w1JeQAzO4KBl9fte33rD3P-j_T2j1p2nG8IPL7WQmdBRJTO8fUAOF6ZUBr2dVhZ0c9Jol-3aUTV0_REQLVEz7yPUD1pT-570RZgQ39N2crZuwJ-3t3_eR4VXltS1Ny_WoWQQXrpX4kuL_bGEkbDtSHxl_Vnt5vMXbQikBXJPa6oTEHcSbFHGLnVOfYJsi5vNUgRAi3WHxnPN3K4GK3tJDzTk' }
    ],
    correction_log: [
      {
        timestamp: "2026-06-25T14:00:00Z",
        original_claim: "Sector 4 strike count reported at 50,000 workers.",
        correction_fact: "Sector 4 official union records list strike count at 12,500 active workers."
      }
    ],
    strike_reason: "",
    posts: []
  },
  'nymag@threads.net': {
    name: 'New York Magazine',
    handle: '@nymag@threads.net',
    role: 'Publisher',
    type: 'organization',
    badge_type: 'organization',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCYIcLHxbcrouUkl8jiAso6nVAcQtR8x3Oq9gyuXmoxZbjPuS6iM4Gz7INuNhk8zIk125rQjbBO2U5_KP-sfpRV05uaWtTAKUy0iOdZ9yPetghCRjvFz7luny9PzV_NWzWqRUZGQIN61LrzwL8ufhHdsg-1-cmyKYI21dj9Ad3EcRIo53jlaSq5mVOV1wpwSo-a-9RbjfVX81EkrIVoDemafpo_rYC1swAQHuGCfeO4HzUi6D_X33r_a6LjQZzLIcXhmECGbjCOnHI',
    banner: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=1200&q=80',
    bio: 'The life of the city. Witty, analytical, and indispensable. Follow our feeds for the latest from New York, Vulture, The Cut, Grub Street, and Curbed.',
    postsCount: '250',
    followingCount: '12',
    followersCount: '840K',
    metadata: [
      { key: 'Website', value: 'nymag.com', verified: true, url: 'https://nymag.com' },
      { key: 'Threads', value: '@nymag', verified: true, url: 'https://threads.net/@nymag' },
      { key: 'Type', value: 'Publisher / Organization', verified: false }
    ],
    members: [
      { name: 'Julian Thorne', handle: '@j_thorne', role: 'Architect & Editor', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDDkj_L45i8SmnUNelsTSM7xt_t_GV39eYINp6PEQVVLlXUxSvJaNjQYzESvNDMuqrIwONlm6hWBLqOoS8riEyh-1rKUOHRC9C0nsco1tez2QwPMohMyfQvIRlEG3LSpzE_csuDr2MokaO0fyDbrBtLG8zyRK0UE4YoMGHfKU7mmL9pHuChnByhBWfv5g3nPIU3ijvm7g9FXRvV2fzc5TP7CmY_3iFzk73u23dxjIYRKOVsoB-DnXNeLelemr06EtW5rrGyER3EA6c' },
      { name: 'Elena Thorne', handle: '@elena_thorne', role: 'Cooperative Researcher', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD85qQJcFfl7AKHAQa-8gW_JvuTeCwdJMhDpIVAfkFNS4zGYVyRKZvq3DtFN3KbBMYjRDxigr72I3k6XhmPKJV43OTdiomvzMT4-yPe9c7iNxKH03UG9wUQcJlxbZoxTOl_rwGcKMaBQ9urBL69DE1jFyMvVfE-qwxck8XYn-vlrUpIeBBON1KXUvELImyP48LH6O5oyltrkeJXG7-xIvsBCAwwQjyLgWVB_yIetyaHiZdNi1OQBk9dtLRaHM2U3JjLYQn3_2Waaew' },
      { name: 'Marcus Vane', handle: '@marcus_vane', role: 'Chief Coordinator', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCFiT0Pa3oVQMLzQ2x3P11V0nXfZcRi-gPxGZBYPetn7Bmnob5-yT4w1JeQAzO4KBl9fte33rD3P-j_T2j1p2nG8IPL7WQmdBRJTO8fUAOF6ZUBr2dVhZ0c9Jol-3aUTV0_REQLVEz7yPUD1pT-570RZgQ39N2crZuwJ-3t3_eR4VXltS1Ny_WoWQQXrpX4kuL_bGEkbDtSHxl_Vnt5vMXbQikBXJPa6oTEHcSbFHGLnVOfYJsi5vNUgRAi3WHxnPN3K4GK3tJDzTk' }
    ],
    correction_log: [
      {
        timestamp: "2026-06-25T14:00:00Z",
        original_claim: "Sector 4 strike count reported at 50,000 workers.",
        correction_fact: "Sector 4 official union records list strike count at 12,500 active workers."
      }
    ],
    strike_reason: "",
    posts: []
  },
  scholar_proof_1: {
    name: 'Dr. Sarah Jenkins',
    handle: '@scholar_proof_1',
    role: 'Verified Peer Researcher',
    badge_type: 'Scholar',
    avatar: '',
    banner: '',
    bio: 'Professor of Political Economy specializing in labor strike macro-trends and union density datasets.',
    postsCount: '112',
    followingCount: '94',
    followersCount: '4.8K',
    metadata: [
      { key: 'Website', value: 'orcid.org/0000-0002-1825-0001', verified: true, url: 'https://orcid.org/0000-0002-1825-0001' },
      { key: 'ORCID iD', value: '0000-0002-1825-0001', verified: true },
      { key: 'Institution', value: 'Institute of Social Research', verified: false }
    ],
    orcid_id: "0000-0002-1825-0001",
    publication_count: 14,
    under_investigation: false,
    recent_publications: [
      "Union Density and Automation Offsets in Heavy Manufacturing (2025)",
      "Comparative Strike Tariffs: A Multi-district Longitudinal Survey (2024)"
    ],
    posts: []
  },
  journalist_proof_1: {
    name: 'Jane Thorne',
    handle: '@journalist_proof_1',
    role: 'Independent Journalist',
    badge_type: 'Journalist',
    avatar: '',
    banner: '',
    bio: 'Freelance video reporter reporting on frontline strike metrics and mutual aid logistics.',
    postsCount: '84',
    followingCount: '120',
    followersCount: '9.2K',
    metadata: [
      { key: 'Website', value: 'muckrack.com/jane-thorne', verified: true, url: 'https://muckrack.com' },
      { key: 'Portfolio', value: 'Press Pass Active', verified: true }
    ],
    portfolio_url: 'https://muckrack.com',
    primary_outlet: 'Independent Correspondent',
    posts: []
  }
};

export const UserProfilePage = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const { posts: allPosts } = usePostsQuery();
  const [activeTab, setActiveTab] = useState('Posts');
  const [isFollowing, setIsFollowing] = useState(false);
  const [showCorrectionLog, setShowCorrectionLog] = useState(false);
  const showPersonalHandle = useStore((state) => state.showPersonalHandleOnOrg);

  const cleanUsername = (username || '').toLowerCase().replace('@', '');
  let profile = profilesData[cleanUsername];

  if (!profile && cleanUsername.includes('nymag')) {
    profile = profilesData['nymag'];
  }

  if (!profile) {
    // Generate fallback profile dynamically
    const formattedName = cleanUsername
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
    profile = {
      name: formattedName,
      handle: `@${cleanUsername}`,
      role: 'Citizen',
      avatar: '',
      banner: '',
      bio: 'Active contributor to the decentralized community feed. Building sovereign local structures.',
      postsCount: '42',
      followingCount: '98',
      followersCount: '2.5K',
      metadata: [
        { key: 'Website', value: 'kollective.org', verified: false, url: 'https://kollective.org' },
        { key: 'Joined', value: 'Jun 2024', verified: false }
      ],
      posts: []
    };
  }

  let isOwnProfile = user && (profile && (user.handle === profile.handle || user.handle?.replace('@', '') === cleanUsername));

  if (isOwnProfile && profile) {
    profile = {
      ...profile,
      badge_type: user.badge_type || profile.badge_type,
      orcid_id: profile.orcid_id || (user.badge_type?.toLowerCase() === 'scholar' || user.badge_type?.toLowerCase() === 'citizen' ? '0000-0002-1825-0001' : null),
      publication_count: profile.publication_count || 14,
      recent_publications: profile.recent_publications || [
        "Union Density and Automation Offsets in Heavy Manufacturing (2025)",
        "Comparative Strike Tariffs: A Multi-district Longitudinal Survey (2024)"
      ],
      portfolio_url: profile.portfolio_url || (user.badge_type?.toLowerCase() === 'journalist' ? 'https://muckrack.com/j_thorne' : null),
      primary_outlet: profile.primary_outlet || (user.badge_type?.toLowerCase() === 'journalist' ? 'Independent Correspondent' : null),
      correction_log: profile.correction_log || (user.badge_type?.toLowerCase() === 'organization' || user.badge_type?.toLowerCase() === 'warned' ? [
        {
          timestamp: "2026-06-25T14:00:00Z",
          original_claim: "Sector 4 strike count reported at 50,000 workers.",
          correction_fact: "Sector 4 official union records list strike count at 12,500 active workers."
        }
      ] : []),
      strike_reason: profile.strike_reason || (user.badge_type?.toLowerCase() === 'warned' ? "Incorrect strike worker tally reported." : null),
      under_investigation: typeof user.under_investigation !== 'undefined' ? user.under_investigation : profile.under_investigation
    };
  }

  const isScholar = profile && (profile.badge_type?.toLowerCase() === 'scholar' || !!profile.orcid_id);
  const isJournalist = profile && (profile.badge_type?.toLowerCase() === 'journalist' || profile.badge_type?.toLowerCase() === 'professionalteal' || !!profile.portfolio_url);
  const isOrg = profile && (profile.type === 'organization' || profile.badge_type?.toLowerCase() === 'organization' || profile.badge_type?.toLowerCase() === 'warned');

  // Filter posts for this user
  const userFeedPosts = allposts?.filter(
    (p) =>
      p.author.name.toLowerCase() === profile.name.toLowerCase() ||
      p.author.handle?.toLowerCase().replace('@', '') === cleanUsername
  );

  // Combine fixed mock posts with context posts
  const combinedPosts = [...(profile.posts || []), ...userFeedPosts];

  // De-duplicate by ID
  const uniquePostsMap = new Map();
  combinedposts?.forEach(p => uniquePostsMap.set(p.id, p));
  const finalUserPosts = Array.from(uniquePostsMap.values());

  // Dynamic organization badge / link for Julian Thorne if setting allows
  let displayMetadata = [...profile.metadata];
  if (cleanUsername === 'j_thorne' && showPersonalHandle) {
    if (!displayMetadata.some(m => m.key === 'Organization')) {
      displayMetadata.push({
        key: 'Organization',
        value: 'New York Magazine',
        verified: true,
        url: '/profile/nymag'
      });
    }
  }

  return (
    <div className="max-w-7xl mx-auto flex gap-16">
      {/* Feed Column */}
      <div className="flex-1 flex flex-col gap-6 max-w-3xl">

        {/* Back Button Header */}
        <div className="flex items-center gap-4 pb-4 border-b border-white/5 mb-2">
          {location.state?.fromCard && (
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-full border border-white/10 hover:bg-white/5 text-text-secondary hover:text-text-primary transition-all active:scale-95 cursor-pointer flex items-center justify-center bg-transparent"
              title="Go back"
            >
              <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            </button>
          )}
          <div>
            <h2 className="font-bold text-text-primary text-lg leading-tight">{profile.name}</h2>
            <p className="text-[12px] text-text-secondary">{profile.postsCount} posts</p>
          </div>
        </div>

        {/* Banner and Avatar Area */}
        <div className="glass-panel rounded-xl overflow-hidden relative border border-white/5">
          {/* Cover Banner */}
          <div className="h-48 w-full relative bg-gradient-to-r from-primary-container/20 via-surface-ink to-[#1a1822] overflow-hidden">
            {profile.banner ? (
              <img
                alt="Profile Banner"
                className="w-full h-full object-cover opacity-80"
                src={profile.banner}
              />
            ) : (
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,var(--color-primary-container),transparent)] opacity-40"></div>
            )}
          </div>

          {/* Overlapping Info Area */}
          <div className="p-6 relative flex flex-col gap-6">
            <div className="flex justify-between items-start">
              {/* Profile Avatar - Rounded Square with smooth edges */}
              {profile.avatar ? (
                <img
                  alt={profile.name}
                  className="w-24 h-24 md:w-32 md:h-32 object-cover rounded-xl border-4 border-surface shadow-2xl mt-[-64px] md:mt-[-80px] bg-surface relative z-10"
                  src={profile.avatar}
                />
              ) : (
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-xl border-4 border-surface shadow-2xl mt-[-64px] md:mt-[-80px] bg-surface-container flex items-center justify-center font-bold text-3xl text-white uppercase relative z-10">
                  {profile.name[0]}
                </div>
              )}

              {/* Action buttons */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => alert(`Direct message / mention input opened to ${profile.handle}`)}
                  className="p-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-text-secondary hover:text-text-primary transition-all active:scale-95 flex items-center justify-center cursor-pointer bg-transparent"
                  title="Mention User"
                >
                  <span className="material-symbols-outlined text-[20px]">alternate_email</span>
                </button>
                <button
                  onClick={() => setIsFollowing(!isFollowing)}
                  className={`px-6 py-2.5 rounded-xl font-bold text-sm tracking-wide transition-all active:scale-95 cursor-pointer ${isFollowing
                    ? 'bg-surface-container-high border border-white/10 text-text-secondary'
                    : 'bg-primary-container text-white crimson-glow hover:brightness-110 border-none'
                    }`}
                >
                  {isFollowing ? 'Following ✓' : 'Follow'}
                </button>
              </div>
            </div>

            {/* User Title & Handle */}
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl md:text-3xl font-extrabold text-text-primary tracking-tight">{profile.name}</h1>
                {profile.badge_type && (
                  <VerificationBadge type={profile.badge_type.toLowerCase()} />
                )}
                {!profile.badge_type && (cleanUsername === 'alsweigart' || cleanUsername === 'marcus_vane' || profile.type === 'organization') && (
                  <span className="material-symbols-outlined text-green-400 text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    verified
                  </span>
                )}
              </div>
              <p className="text-sm text-text-secondary mt-1">
                {profile.handle}@kollective.social
              </p>
            </div>

            {/* Biography */}
            <p className="font-body-md text-base text-text-primary/95 leading-relaxed max-w-2xl">
              {profile.bio}
            </p>

            {/* 🔬 Merged Scholar ORCID Sync Data Panel */}
            {isScholar && profile.orcid_id && (
              <div className="border border-white/10 bg-surface-container-low p-6 rounded-xl space-y-4 font-mono text-text-primary w-full max-w-2xl">
                <div>
                  <div className="text-xs font-bold text-[#10b981] tracking-wider mb-2 uppercase flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[18px]">verified</span>
                    OPEN RESEARCH AUDIT MANIFEST
                  </div>
                  <div className="flex flex-col gap-1.5 text-xs text-text-secondary">
                    <div className="flex justify-between border-b border-white/5 pb-1">
                      <span>REGISTRY RESOURCE:</span>
                      <span className="text-text-primary font-bold">ORCID PUBLIC REGISTER</span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-1 items-center">
                      <span>IDENTIFICATION INDEX:</span>
                      <a href={`https://orcid.org/${profile.orcid_id}`} target="_blank" rel="noreferrer" className="text-blue-500 font-bold underline flex items-center gap-1 hover:text-blue-400">
                        {profile.orcid_id}<span>↗</span>
                      </a>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-1">
                      <span>SYNC INTEGRITY:</span>
                      <span className="text-emerald-400 font-bold">✓ SHA-256 MATCH</span>
                    </div>
                    <div className="flex justify-between">
                      <span>TOTAL REGISTERED WORKS:</span>
                      <span className="text-text-primary font-bold">{profile.publication_count || 0} PEER-REVIEWED PAPERS</span>
                    </div>
                  </div>
                </div>

                {/* 📚 AUTOMATED RECENT WORKS SECTION */}
                {profile.recent_publications && profile.recent_publications.length > 0 && (
                  <div className="border-t border-white/5 pt-3">
                    <div className="text-[10px] font-bold text-text-secondary tracking-wider mb-2 uppercase">
                      LATEST INDEXED RELEASES (CRON VERIFIED):
                    </div>
                    <ul className="space-y-2 font-sans text-xs">
                      {profile.recent_publications.map((title, idx) => (
                        <li key={idx} className="text-text-primary bg-surface-container-high/30 p-2.5 border-l-2 border-[#10b981] flex gap-2">
                          <span className="text-text-secondary font-bold font-mono">[{idx + 1}]</span>
                          <span className="italic leading-normal">{title}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* 📰 Merged Journalist Media Sync Data Panel */}
            {isJournalist && profile.portfolio_url && (
              <div className="border border-white/10 bg-surface-container-low p-6 rounded-xl space-y-4 font-mono text-text-primary w-full max-w-2xl">
                <div>
                  <div className="text-xs font-bold text-teal-500 tracking-wider mb-2 uppercase flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[18px]">verified</span>
                    VERIFIED MEDIA AUDIT TRAILS
                  </div>
                  <div className="flex flex-col gap-1.5 text-xs text-text-secondary">
                    <div className="flex justify-between border-b border-white/5 pb-1">
                      <span>CREDENTIAL SYSTEM:</span>
                      <span className="text-text-primary font-bold">DIGITAL PORTFOLIO INDEX</span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-1 items-center">
                      <span>VERIFIED BYLINE LINK:</span>
                      <a href={profile.portfolio_url} target="_blank" rel="noreferrer" className="text-blue-500 font-bold underline flex items-center gap-1 hover:text-blue-400">
                        Open Press Portfolio<span>↗</span>
                      </a>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-1">
                      <span>AFFILIATION OUTLET:</span>
                      <span className="text-text-primary font-bold">{profile.primary_outlet || "Independent Correspondent"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>INTEGRITY CLEARANCE:</span>
                      <span className="text-teal-500 dark:text-teal-400 font-bold">✓ SYNCED MEDIA PRESS PROFILE</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 🏢 Merged Organization Accountability Correction Log */}
            {isOrg && (
              <div className={`border font-mono text-text-primary p-6 w-full max-w-2xl rounded-xl space-y-4 ${profile.badge_type?.toLowerCase() === 'warned'
                ? 'border-yellow-500 bg-yellow-500/5 shadow-[0_0_15px_rgba(244,208,0,0.05)]'
                : 'border-white/10 bg-surface-container-low'
                }`}>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xs font-bold text-text-secondary tracking-wider uppercase">
                      PUBLIC TRUST & RETRACTION MANIFEST
                    </h3>
                    <p className="text-xs text-text-secondary mt-1">
                      Institutional Corrections: {profile.correction_log?.length || 0} active logs
                    </p>
                  </div>
                  <button
                    onClick={() => setShowCorrectionLog(!showCorrectionLog)}
                    className="text-xs border border-white/5 hover:border-white/10 px-3 py-1 bg-surface-container-high font-bold transition-all text-text-secondary hover:text-text-primary cursor-pointer border-none"
                  >
                    {showCorrectionLog ? 'HIDE AUDIT' : `CORRECTION LOG (${profile.correction_log?.length || 0})`}
                  </button>
                </div>

                {/* ⚠️ CRITICAL WARNING BANNER IF PENALIZED */}
                {profile.badge_type?.toLowerCase() === 'warned' && (
                  <div className="border border-yellow-500/30 bg-yellow-500/10 p-4 rounded-lg text-xs text-yellow-600 dark:text-yellow-400 leading-relaxed font-sans">
                    <div className="font-bold uppercase mb-1 font-mono">⚠️ SYSTEM TRANSPARENCY WARNING FLAG:</div>
                    This institutional media publisher is serving a 30-day probation penalty for violating platform truth standards.
                    <div className="mt-2 text-text-secondary italic">Reason: "{profile.strike_reason || 'Publication discrepancies.'}"</div>
                  </div>
                )}

                {showCorrectionLog && (
                  <div className="border-t border-dashed border-white/10 pt-4 mt-2 space-y-4">
                    {profile.correction_log && profile.correction_log.length > 0 ? (
                      <div className="space-y-3 pt-2">
                        {profile.correction_log.map((log, idx) => (
                          <div key={idx} className="text-xs border border-white/5 bg-surface-container-high/30 p-3.5 rounded-lg space-y-2">
                            <div className="flex justify-between items-center text-[10px] text-text-secondary font-bold">
                              <span>INDEX LOG: #00{idx + 1}</span>
                              <span>FILED: {new Date(log.timestamp).toLocaleDateString()}</span>
                            </div>
                            <div className="text-text-primary font-bold text-xs">
                              ORIGINAL CLAIM: <span className="text-text-secondary line-through font-normal">{log.original_claim}</span>
                            </div>
                            <div className="text-emerald-500 bg-[#065f46]/10 p-2.5 border-l-2 border-emerald-500 font-sans leading-normal">
                              <span className="font-mono font-bold text-[10px] block text-emerald-500 mb-0.5">VERIFIED CORRECTION:</span>
                              {log.correction_fact}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-text-secondary/50 italic font-sans">No retractions or forced corrections logged inside active database cycle.</p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ⚠️ Suspended / Dispute Appeal Panel Banner */}
            {isOwnProfile && (profile.under_investigation || (profile.badge_type?.toLowerCase() === 'citizen' && profile.orcid_id)) && (
              <div className="border border-yellow-600/30 bg-yellow-500/10 p-5 rounded-xl flex flex-col gap-3 font-mono w-full max-w-2xl">
                <div className="text-sm text-yellow-500 font-bold tracking-wider uppercase flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px]">warning</span>
                  SCHOLAR STATUS SUSPENDED: DELTA ERROR DETECTED
                </div>
                <p className="text-xs text-text-secondary font-sans leading-relaxed">
                  Your researcher sync node reported a work drop discrepancy. Access credentials have been temporarily downgraded.
                  You can submit written statement appeals or ORCID merges on your dispute dashboard page.
                </p>
                <button
                  onClick={() => navigate('/verify/dispute')}
                  className="px-6 py-2.5 bg-yellow-600 hover:bg-yellow-500 text-black text-xs uppercase tracking-wider font-bold transition-all cursor-pointer border-none"
                >
                  Go to Scholar Dispute Portal ➔
                </button>
              </div>
            )}

            {/* Stats Row */}
            <div className="flex gap-8 border-t border-white/5 pt-4">
              <div className="flex gap-1.5 text-sm">
                <span className="font-extrabold text-text-primary">{profile.postsCount}</span>
                <span className="text-text-secondary">posts</span>
              </div>
              <div className="flex gap-1.5 text-sm">
                <span className="font-extrabold text-text-primary">{profile.followingCount}</span>
                <span className="text-text-secondary">following</span>
              </div>
              <div className="flex gap-1.5 text-sm">
                <span className="font-extrabold text-text-primary">{profile.followersCount}</span>
                <span className="text-text-secondary">followers</span>
              </div>
            </div>
          </div>
        </div>

        {/* Metadata grid - Verified Key-Value style */}
        <div className="glass-panel rounded-xl border border-white/5 overflow-hidden flex flex-col">
          {displayMetadata.map((item, idx) => (
            <div
              key={idx}
              className={`flex border-b border-white/5 last:border-none ${item.verified ? 'bg-green-500/5 border-l-4 border-green-500/40' : ''
                }`}
            >
              <div className="w-1/3 px-4 py-3 bg-surface-container-high/20 border-r border-white/5 font-label-md text-sm text-text-secondary uppercase tracking-wider flex items-center">
                {item.key}
              </div>
              <div className="flex-1 px-4 py-3 text-sm truncate flex items-center gap-1.5">
                {item.verified && (
                  <span className="material-symbols-outlined text-[16px] text-green-400" style={{ fontVariationSettings: "'FILL' 1" }}>
                    verified
                  </span>
                )}
                {item.url ? (
                  item.url.startsWith('/') ? (
                    <Link
                      to={item.url}
                      className={`${item.verified ? 'text-green-400 font-bold hover:underline' : 'text-primary-container hover:underline'}`}
                    >
                      {item.value}
                    </Link>
                  ) : (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${item.verified ? 'text-green-400 font-bold hover:underline' : 'text-primary-container hover:underline'}`}
                    >
                      {item.value}
                    </a>
                  )
                ) : (
                  <span className={item.verified ? 'text-green-400 font-bold' : 'text-text-primary'}>
                    {item.value}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Tabs Bar */}
        <div className="flex border-b border-white/5 mt-4">
          {(profile.type === 'organization' ? ['Posts', 'Posts & replies', 'Media', 'Team'] : ['Posts', 'Posts & replies', 'Media']).map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-4 text-center text-sm font-bold border-b-2 transition-all relative cursor-pointer bg-transparent border-none ${isActive
                  ? 'border-primary-container text-text-primary font-extrabold'
                  : 'border-transparent text-text-secondary hover:text-text-primary'
                  }`}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* Timeline Posts or Team Members */}
        <div className="flex flex-col gap-6 mt-2">
          {activeTab === 'Team' && profile.type === 'organization' ? (
            <div className="flex flex-col gap-4">
              {profile.members && profile.members.map((member) => (
                <div
                  key={member.handle}
                  className="glass-panel rounded-xl p-5 border border-white/5 flex items-center justify-between hover:bg-surface-container-high/40 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <img
                      alt={member.name}
                      className="w-12 h-12 rounded-xl object-cover border border-white/10"
                      src={member.avatar}
                    />
                    <div>
                      <h4 className="font-bold text-text-primary text-sm flex items-center gap-1.5 leading-none">
                        {member.name}
                        <span className="material-symbols-outlined text-[16px] text-green-400" style={{ fontVariationSettings: "'FILL' 1" }}>
                          verified
                        </span>
                      </h4>
                      <p className="text-[15px] text-text-secondary mt-1">
                        {member.handle === '@j_thorne' && !showPersonalHandle
                          ? '[Personal Handle Hidden]'
                          : `${member.handle}@kollective.social`}
                      </p>
                      <p className="text-[12px] text-text-secondary/80 mt-1.5 font-medium">{member.role}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      const memberUsername = member.handle.replace('@', '');
                      navigate(`/profile/${memberUsername}`, { state: { fromCard: true } });
                    }}
                    className="px-4 py-2 rounded-xl bg-surface-container-high border border-white/10 hover:bg-white/10 text-text-primary text-sm font-bold transition-all active:scale-95 cursor-pointer"
                  >
                    View Profile
                  </button>
                </div>
              ))}
            </div>
          ) : finalUserposts?.length === 0 ? (
            <div className="glass-panel rounded-xl p-12 text-center border border-white/5">
              <span className="material-symbols-outlined text-4xl text-text-secondary mb-4">
                feed
              </span>
              <h3 className="font-bold text-text-primary mb-2 text-md">No posts yet</h3>
              <p className="text-text-secondary text-sm">
                No activity under the "{activeTab}" tab yet.
              </p>
            </div>
          ) : (
            finalUserposts?.map((post) => (
              <PostCard key={post?.id} post={post} />
            ))
          )}
        </div>

      </div>

      {/* Right widgets sidebar */}
      <TrendingWidget />
    </div>
  );
};
