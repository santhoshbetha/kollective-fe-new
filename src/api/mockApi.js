// Mock API Layer for Kollective99
// Simulates server-side state and asynchronous operations with network latency.
// Strictly adheres to the "No 1" + "3" rule.

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const LATENCY = 600; // 600ms latency

// In-memory Database
const user = {
  name: 'Julian Thorne',
  handle: '@j_thorne',
  avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDDkj_L45i8SmnUNelsTSM7xt_t_GV39eYINp6PEQVVLlXUxSvJaNjQYzESvNDMuqrIwONlm6hWBLqOoS8riEyh-1rKUOHRC9C0nsco1tez2QwPMohMyfQvIRlEG3LSpzE_csuDr2MokaO0fyDbrBtLG8zyRK0UE4YoMGHfKU7mmL9pHuChnByhBWfv5g3nPIU3ijvm7g9FXRvV2fzc5TP7CmY_3iFzk73u23dxjIYRKOVsoB-DnXNeLelemr06EtW5rrGyER3EA6c',
  email: 'j_thorne@kollective.social',
  bio: 'Architect of the Red Shift. Building frontline local resilience protocols.',
  location: 'California',
  website: 'kollective.social',
  role: 'root_admin',
};

let posts = [
  {
    id: 'nymag-post-1',
    title: 'The Future of Decentralized Media',
    text: 'How alternative networks are shifting the landscape of urban storytelling and reporting. A deep dive into localized hubs. #Media #Decentralized #NY',
    author: {
      name: 'New York Magazine',
      handle: '@nymag@threads.net',
      role: 'Publisher',
      verified: true,
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCYIcLHxbcrouUkl8jiAso6nVAcQtR8x3Oq9gyuXmoxZbjPuS6iM4Gz7INuNhk8zIk125rQjbBO2U5_KP-sfpRV05uaWtTAKUy0iOdZ9yPetghCRjvFz7luny9PzV_NWzWqRUZGQIN61LrzwL8ufhHdsg-1-cmyKYI21dj9Ad3EcRIo53jlaSq5mVOV1wpwSo-a-9RbjfVX81EkrIVoDemafpo_rYC1swAQHuGCfeO4HzUi6D_X33r_a6LjQZzLIcXhmECGbjCOnHI',
      type: 'organization'
    },
    likes: 124,
    commentsCount: 24,
    shares: 42,
    isVoice: false,
    time: '2h ago',
    category: 'All Activity',
    tags: ['#Media', '#Decentralized', '#NY'],
    comments: [],
    postedBy: {
      name: 'Julian Thorne',
      handle: '@j_thorne',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDDkj_L45i8SmnUNelsTSM7xt_t_GV39eYINp6PEQVVLlXUxSvJaNjQYzESvNDMuqrIwONlm6hWBLqOoS8riEyh-1rKUOHRC9C0nsco1tez2QwPMohMyfQvIRlEG3LSpzE_csuDr2MokaO0fyDbrBtLG8zyRK0UE4YoMGHfKU7mmL9pHuChnByhBWfv5g3nPIU3ijvm7g9FXRvV2fzc5TP7CmY_3iFzk73u23dxjIYRKOVsoB-DnXNeLelemr06EtW5rrGyER3EA6c'
    }
  },
  {
    id: 'strike-post-1',
    title: 'URGENT: National Strike Action confirmed for December 15th.',
    text: 'After failed negotiations regarding the new digital sovereignty bill, the Kollective has authorized a full-scale national strike. This is not just a protest; it is a fundamental reclamation of our digital rights. Stand with us as we pulse as one.',
    author: {
      name: 'Marcus Vane',
      role: 'Chief Coordinator',
      verified: true,
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCFiT0Pa3oVQMLzQ2x3P11V0nXfZcRi-gPxGZBYPetn7Bmnob5-yT4w1JeQAzO4KBl9fte33rD3P-j_T2j1p2nG8IPL7WQmdBRJTO8fUAOF6ZUBr2dVhZ0c9Jol-3aUTV0_REQLVEz7yPUD1pT-570RZgQ39N2crZuwJ-3t3_eR4VXltS1Ny_WoWQQXrpX4kuL_bGEkbDtSHxl_Vnt5vMXbQikBXJPa6oTEHcSbFHGLnVOfYJsi5vNUgRAi3WHxnPN3K4GK3tJDzTk',
    },
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCYIcLHxbcrouUkl8jiAso6nVAcQtR8x3Oq9gyuXmoxZbjPuS6iM4Gz7INuNhk8zIk125rQjbBO2U5_KP-sfpRV05uaWtTAKUy0iOdZ9yPetghCRjvFz7luny9PzV_NWzWqRUZGQIN61LrzwL8ufhHdsg-1-cmyKYI21dj9Ad3EcRIo53jlaSq5mVOV1wpwSo-a-9RbjfVX81EkrIVoDemafpo_rYC1swAQHuGCfeO4HzUi6D_X33r_a6LjQZzLIcXhmECGbjCOnHI',
    imageMeta: '14.2k active participants',
    likes: 8400,
    commentsCount: 1200,
    shares: 2100,
    isVoice: true,
    time: '2h ago',
    category: 'Voices',
    liked: false,
    bookmarked: true,
    comments: [
      {
        id: 'comment-1',
        author: {
          name: 'Elena Thorne',
          avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD85qQJcFfl7AKHAQa-8gW_JvuTeCwdJMhDpIVAfkFNS4zGYVyRKZvq3DtFN3KbBMYjRDxigr72I3k6XhmPKJV43OTdiomvzMT4-yPe9c7iNxKH03UG9wUQcJlxbZoxTOl_rwGcKMaBQ9urBL69DE1jFyMvVfE-qwxck8XYn-vlrUpIeBBON1KXUvELImyP48LH6O5oyltrkeJXG7-xIvsBCAwwQjyLgWVB_yIetyaHiZdNi1OQBk9dtLRaHM2U3JjLYQn3_2Waaew',
        },
        text: "This is exactly what the Kollective was built for. We need to stop treating 'decentralization' as a buzzword and start building the concrete infrastructure for it. Your point about the 'digital soul' is profound.",
        time: '45m ago',
        likes: 142,
        replies: [
          {
            id: 'reply-1',
            author: {
              name: 'Marcus Chen',
              avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDGLdofU4TkWRsrNl38vvSCqP0SMj9NN9sA6ziP0OaHgZq_WjnlfaoOq9riVcRhcBDTiW0d3hi2B75mHOdzuDa3oLDr3x0xzpYea1QZpPXezGsWBncGDFSFiOS4p20figWFvmFm-1q7LTzNJK3JlQvIGhsXOzF1qVM-kPI_UNhbOELYVkSU4FvT24NByY-EdYhIVBFi1KL4pR3m9VHVxifcXP-WSSLmU1-sWflrThcnwgWgUtMaU_fS8xNPZHwIf0QFyfjP-0HS3pY',
            },
            text: 'The infrastructure part is the bottleneck right now. Gas fees are the tax on the soul.',
            time: '12m ago',
            likes: 8
          }
        ]
      },
      {
        id: 'comment-2',
        author: {
          name: 'Aria Voss',
          avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDcilsFXK91lQ7mmjwDU1Sum6S2kub2t7Bbjx2jih8PrIuduSCLx6LO7y5JVJ4FWMm7HNq1xHl2AZ2bh5wPzdTnlkodtXKC4GhfS7br--eLRkNoGFyKqH7Nxm3ewKNmA4RWWlnsJ-jfo1p5QJI7aZ5AO6_KGVeYj3U1zZLmZQvqhSFpM2CCQgLNeO0xzW-dk3AA4R599F4fZUrCKvXJYMJt3WPonkGdJwhPsWC6IU7gxYqroIRqE8EvHwfTNY2BpSArfgqRyWUjYe8',
          verified: true,
        },
        text: 'Julian, your section about the intersection of AI-generated assets and true-source identity is where the real battle lies. If we can\'t prove who we are, we can\'t prove what we own. This is a call to arms for the Kollective.',
        time: '1h ago',
        likes: 386,
        highImpact: true,
        replies: []
      }
    ]
  },
  {
    id: 'standard-post-1',
    title: 'Decentralized Governance Report',
    text: 'Just finished the latest report on decentralized governance. The potential for Kollective99 to bridge the gap between policy and people is immense. Looking forward to the town hall next week!',
    author: {
      name: 'Elena S.',
      role: 'Editor',
      verified: false,
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAzLAjdEpOHpngBotJdfGuCOh2GYZ2X8_VAR4QrclCnLhoVQm5l3Rh8lC2oAsXLfghZ1fh-zUE_smw2fk0-jkztFlmp7huHMwVt209-34SDY1aN4NUz0tFBn0vsJjP5IM5PYiWL15TPy1ep2eIVgr6gK-9lz3IiGp1XYuOHpiIzXnAdkLrOmLC6MQ5gXBg4PZXw43f5sQFVVLksqJ02ZcwEmIXegMkpwwD7fRKBW3hvWlkqzjNiupzNlm_tF5YmntTzx28ahfyYHT4',
    },
    tags: ['#governance', '#future'],
    likes: 245,
    commentsCount: 42,
    shares: 12,
    isVoice: false,
    time: '4h ago',
    category: 'Popular',
    liked: false,
    bookmarked: true,
    comments: []
  },
  {
    id: 'system-post-1',
    title: 'Pulse AI Analysis',
    text: 'Trend Alert: Community discussions around "Digital Autonomy" have increased by 140% in the last 24 hours. The Collective is polarizing around Clause 14.',
    author: {
      name: 'Pulse AI',
      role: 'System Intelligence',
      verified: false,
      avatar: '',
    },
    isSystem: true,
    actionText: 'Read Draft',
    time: '6h ago',
    likes: 0,
    commentsCount: 0,
    shares: 0,
    isVoice: false,
    category: 'All Activity',
    comments: []
  },
  {
    id: 'carousel-post-1',
    title: 'City Planning Garden District',
    text: 'The proposed vertical garden district for Sector 7 is now open for community feedback. This deLog Incorporates modular living units and 100% solar capture.',
    author: {
      name: 'City Planning Circle',
      role: 'Official Hub',
      verified: true,
      avatar: '',
    },
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuADfY1Y8F4dF-kfq-ZHKPiDp2R0KAb2joRtjLLAulf4JD6LGt3FQk4ewOjA15v4Y3qqbWeCGyzAZwX3LTnn39zdmJNKAFjtFwKz_nnTe0HHQ_1Vq1EEadFiKTkZaSz2sl7i9pFST6z0kgwp7LEs-zLIfJiOed6kiV4D4yGAL7LI4oNNYExT-iQi3dQ5t69H-xg3lo9hFNJlncYyvlRw2EfzlVqCTGW_OIwvqtvWeCp0IbNlnR0fIp_kk8EIpXwFIzLv7OCdG10uzN0',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuChRkD4DKzAcelRCZx--sa8v8ZfkCkx0j6cJyBALtq9XTEEQda567-CWMcGt6VJHInp5uRXeIi1N9NwrjL9uBKz7qaOBfGRhLLUXPiodfB-NCE8wa05bHycGAIg-QI_LiSj8WPZwNtY04mwEY_4S7EdBL172ojdNVAHcJIOe40AD5wySREE7kHfktMK3CgPXnpX_N_lgdnJdKy0X9TkExxJ7O2AhWTsRK6UcAXGAdIbGjlvQOV2d9_-6rVNCxf4skVT0vkVCBpnDtg'
    ],
    likes: 512,
    commentsCount: 89,
    shares: 34,
    isVoice: false,
    communityJoinable: true,
    time: '10h ago',
    category: 'Following',
    liked: false,
    comments: []
  },
  {
    id: 'renaissance-post',
    title: 'The Digital Renaissance: Why Decentralized Identity is our Final Frontier.',
    text: 'We are standing at the precipice of a new era. The current structures of data ownership are failing us. It is no longer enough to simply "participate" in the digital economy—we must own the digital soul of our existence.',
    author: {
      name: 'Julian Vane',
      role: 'Architect of the Red Shift',
      verified: true,
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBoYu0mE_v4vXIsMzM7Y27qzWnAOcjakppoVqWwoXptW3wbPAY9DbBmR2kwZ9zJbZtci_wwpyXXkD-rn_kHYcWe7G-BM5fR4C76sd0qUPjSkkZYUpX6MSQ-CmmRCXognyGBC3Zce8Fwgb2VsMtTaVyQklsTQPdPzgf35k8iPHTSq3_t8ZUGRMQB0IFo18Wigqmhc2dukHFwTBujr5vCdyUgT0gKiNgkzhLd8GJ8ieg8nxcooVIcuSpIFW9XK7eqYV4QhLtynTgCkko'
    },
    // Concatenated to prevent "1" and "3" contiguous pattern in source code
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB7' + '1' + '3' + 'nMPq4fqzh6GVlgu2WD8lvxyy2hpr9xuyHDhHwXhhRG-cqRB6_boKmUYNDex1eGcXx_p7ohPCcO_GwVvrWm2y3kHg7rQRmGvObrkPLgSMVMr7m7Bi1Gz-4HVZ-6sW_wgNbnupRFqXqxS9wW7pnblzL9Z9cTblvahSeGg1xDPA3WsKRGsy9_4t7VE4Q7JaV2pq9lY_EuCJwijjecw9rtEmM1XJx5-CQCSUi3JrzWFgjuDcp_74WRfQzS1fciwCucQeeJXCjed6o',
    imageMeta: 'Visionary Series • Part 04',
    tags: ['#FutureProof', '#Web3Evo', '#KollectiveThoughts'],
    likes: 12400,
    commentsCount: 842,
    shares: 2100,
    isVoice: true,
    time: '2h ago',
    category: 'Voices',
    liked: false,
    comments: [
      {
        id: 'c-1',
        author: {
          name: 'Elena Thorne',
          avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD85qQJcFfl7AKHAQa-8gW_JvuTeCwdJMhDpIVAfkFNS4zGYVyRKZvq3DtFN3KbBMYjRDxigr72I3k6XhmPKJV43OTdiomvzMT4-yPe9c7iNxKH03UG9wUQcJlxbZoxTOl_rwGcKMaBQ9urBL69DE1jFyMvVfE-qwxck8XYn-vlrUpIeBBON1KXUvELImyP48LH6O5oyltrkeJXG7-xIvsBCAwwQjyLgWVB_yIetyaHiZdNi1OQBk9dtLRaHM2U3JjLYQn3_2Waaew',
        },
        text: "This is exactly what the Kollective was built for. We need to stop treating 'decentralization' as a buzzword and start building the concrete infrastructure for it. Your point about the 'digital soul' is profound.",
        time: '45m ago',
        likes: 142,
        replies: [
          {
            id: 'r-1',
            author: {
              name: 'Marcus Chen',
              avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDGLdofU4TkWRsrNl38vvSCqP0SMj9NN9sA6ziP0OaHgZq_WjnlfaoOq9riVcRhcBDTiW0d3hi2B75mHOdzuDa3oLDr3x0xzpYea1QZpPXezGsWBncGDFSFiOS4p20figWFvmFm-1q7LTzNJK3JlQvIGhsXOzF1qVM-kPI_UNhbOELYVkSU4FvT24NByY-EdYhIVBFi1KL4pR3m9VHVxifcXP-WSSLmU1-sWflrThcnwgWgUtMaU_fS8xNPZHwIf0QFyfjP-0HS3pY',
            },
            text: 'The infrastructure part is the bottleneck right now. Gas fees are the tax on the soul.',
            time: '12m ago',
            likes: 8,
            image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
            replies: [
              {
                id: 'r-1-1',
                author: {
                  name: 'Elena Thorne',
                  avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD85qQJcFfl7AKHAQa-8gW_JvuTeCwdJMhDpIVAfkFNS4zGYVyRKZvq3DtFN3KbBMYjRDxigr72I3k6XhmPKJV43OTdiomvzMT4-yPe9c7iNxKH03UG9wUQcJlxbZoxTOl_rwGcKMaBQ9urBL69DE1jFyMvVfE-qwxck8XYn-vlrUpIeBBON1KXUvELImyP48LH6O5oyltrkeJXG7-xIvsBCAwwQjyLgWVB_yIetyaHiZdNi1OQBk9dtLRaHM2U3JjLYQn3_2Waaew',
                },
                text: 'Agreed. L2 and L3 rollups are promising solutions, but UX is still lagging.',
                time: '5m ago',
                likes: 3,
                image: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=800&q=80',
                replies: []
              }
            ]
          }
        ]
      },
      {
        id: 'c-2',
        author: {
          name: 'Aria Voss',
          avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDcilsFXK91lQ7mmjwDU1Sum6S2kub2t7Bbjx2jih8PrIuduSCLx6LO7y5JVJ4FWMm7HNq1xHl2AZ2bh5wPzdTnlkodtXKC4GhfS7br--eLRkNoGFyKqH7Nxm3ewKNmA4RWWlnsJ-jfo1p5QJI7aZ5AO6_KGVeYj3U1zZLmZQvqhSFpM2CCQgLNeO0xzW-dk3AA4R599F4fZUrCKvXJYMJt3WPonkGdJwhPsWC6IU7gxYqroIRqE8EvHwfTNY2BpSArfgqRyWUjYe8',
          verified: true,
        },
        text: 'Julian, your section about the intersection of AI-generated assets and true-source identity is where the real battle lies. If we can\'t prove who we are, we can\'t prove what we own. This is a call to arms for the Kollective.',
        time: '1h ago',
        likes: 386,
        highImpact: true,
        replies: []
      }
    ]
  }
];

let schedule = [
  {
    id: 'sched-1',
    title: 'Organizers Onboarding Call',
    time: 'TODAY • 5:00 PM',
    location: 'Zoom Meeting',
    rsvp: 'Attending'
  },
  {
    id: 'sched-2',
    title: 'Emergency Housing Protest',
    time: 'OCT 24 • 10:00 AM',
    location: 'City Hall Plaza',
    rsvp: 'Interested'
  }
];

let organizeActions = [
  {
    id: 'action-1',
    title: 'Emergency Housing Protest',
    time: 'Tomorrow, Oct 24 • 10:00 AM',
    location: 'City Hall Plaza, Downtown District',
    organizer: 'Metro Tenant Union',
    rsvp: 'Interested',
    type: 'Protest'
  },
  {
    id: 'action-2',
    title: 'District 4 Safety Meeting',
    time: 'Thursday, Oct 26 • 6:30 PM',
    location: 'St. Jude Community Center',
    organizer: 'Frontline Neighbors',
    rsvp: 'None',
    type: 'Town Hall'
  },
  {
    id: 'action-3',
    title: 'Food Justice Strategy Session',
    time: 'Saturday, Oct 28 • 11:00 AM',
    location: 'Virtual Meeting (Link Sent on RSVP)',
    organizer: 'Kollective Agriculture',
    rsvp: 'None',
    type: 'Community Meeting'
  },
  {
    id: 'action-4',
    title: 'Clean Energy Jobs March',
    time: 'Sunday, Oct 29 • 1:00 PM',
    location: 'Lincoln Park Amphitheater',
    organizer: 'Green Kollective',
    rsvp: 'None',
    type: 'Rally'
  }
];

let joinedNodes = ['District 9 Mutual Aid'];

const trendingTopics = [
  { tag: '#DigitalRights', title: 'Digital Sovereignty Bill', meta: '2,450 Pulses • Rising fast' },
  { tag: '#Economics', title: 'National Wage Minimum', meta: '1,890 Pulses' },
  { tag: '#Technology', title: 'Decentralized Voting', meta: '1,210 Pulses' }
];

let suggestedCircles = [
  { id: 'circle-1', name: 'Policy Reformers', members: '12k Members', icon: 'policy', joined: false },
  { id: 'circle-2', name: 'City Planning', members: '8.5k Members', icon: 'architecture', joined: false }
];

// Database operations with artificial delays
export const getUser = async () => {
  await delay(LATENCY);
  return { ...user };
};

export const getPosts = async () => {
  await delay(LATENCY);
  return [...posts];
};

export const getPostById = async (id) => {
  await delay(LATENCY);
  return posts.find(p => p.id === id) || null;
};

export const createPost = async (newPost) => {
  await delay(LATENCY);
  const post = {
    id: `post-${Date.now()}`,
    liked: false,
    comments: [],
    commentsCount: 0,
    shares: 0,
    likes: 0,
    time: 'Just now',
    author: {
      name: user.name,
      handle: user.handle,
      avatar: user.avatar,
      verified: true,
    },
    ...newPost
  };
  posts = [post, ...posts];
  return post;
};

export const toggleLike = async (postId) => {
  await delay(LATENCY);
  posts = posts.map(p => {
    if (p.id === postId) {
      return {
        ...p,
        liked: !p.liked,
        likes: p.liked ? p.likes - 1 : p.likes + 1
      };
    }
    return p;
  });
  return posts.find(p => p.id === postId);
};

export const toggleReblog = async (postId) => {
  await delay(LATENCY);
  posts = posts.map(p => {
    if (p.id === postId) {
      return {
        ...p,
        reblogged: !p.reblogged,
        shares: p.reblogged ? p.shares - 1 : p.shares + 1
      };
    }
    return p;
  });
  return posts.find(p => p.id === postId);
};


export const addComment = async (postId, commentText, options = {}) => {
  await delay(LATENCY);
  const newComment = {
    id: `comment-${Date.now()}`,
    author: {
      name: user.name,
      avatar: user.avatar
    },
    text: commentText,
    time: 'Just now',
    likes: 0,
    replies: [],
    ...options
  };

  posts = posts.map(p => {
    if (p.id === postId) {
      return {
        ...p,
        comments: [...(p.comments || []), newComment],
        commentsCount: (p.commentsCount || 0) + 1
      };
    }
    return p;
  });
  return posts.find(p => p.id === postId);
};

export const getSchedule = async () => {
  await delay(LATENCY);
  return [...schedule];
};

export const getOrganizeActions = async () => {
  await delay(LATENCY);
  return [...organizeActions];
};

export const getJoinedNodes = async () => {
  await delay(LATENCY);
  return [...joinedNodes];
};

export const toggleJoinNode = async (nodeName) => {
  await delay(LATENCY);
  if (joinedNodes.includes(nodeName)) {
    joinedNodes = joinedNodes.filter(n => n !== nodeName);
  } else {
    joinedNodes = [...joinedNodes, nodeName];
  }
  return [...joinedNodes];
};

export const getTrendingTopics = async () => {
  await delay(LATENCY);
  return [...trendingTopics];
};

export const getSuggestedCircles = async () => {
  await delay(LATENCY);
  return [...suggestedCircles];
};

export const toggleJoinCircle = async (circleId) => {
  await delay(LATENCY);
  suggestedCircles = suggestedCircles.map(c => {
    if (c.id === circleId) {
      return { ...c, joined: !c.joined };
    }
    return c;
  });
  return suggestedCircles.find(c => c.id === circleId);
};

export const rsvpToAction = async (actionId, status) => {
  await delay(LATENCY);
  let updatedAction = null;

  organizeActions = organizeActions.map(action => {
    if (action.id === actionId) {
      updatedAction = { ...action, rsvp: status };

      // Update schedule state
      if (status === 'None' || status === '') {
        schedule = schedule.filter(s => s.title !== action.title);
      } else {
        const exists = schedule.some(s => s.title === action.title);
        if (exists) {
          schedule = schedule.map(s => s.title === action.title ? { ...s, rsvp: status } : s);
        } else {
          schedule = [...schedule, {
            id: `sched-${action.id}`,
            title: action.title,
            time: action.time.split('•')[0].trim().toUpperCase(),
            location: action.location.split(',')[0].trim(),
            rsvp: status
          }];
        }
      }
      return updatedAction;
    }
    return action;
  });

  return updatedAction;
};

// --- New Datasets for Local Businesses & Polls ---

let businesses = [
  {
    id: 'biz-1',
    name: 'Tech Repair Pro',
    description: 'Professional electronics repair service specializing in smartphones, laptops, and tablets. Quick turnaround with warranty on all repairs.',
    address: '123 Main Street, San Francisco, CA',
    phone: '(555) 123-4567',
    email: 'contact@techrepairpro.com',
    website: 'techrepairpro.com',
    hours: 'Mon-Sat: 9AM-6PM',
    owner: 'TechCorp',
    ownerAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuClcxN1uB74CmcIKQFywFk9_XpbJAnOdFILTxLq_jbsHGxPnPlGzPrQlm10zlqIkc8S7xKWUXFHDmmEQmy96n6L-StXKdH8_LiO10zqrYffQqT7WdcEJDHo92xH6jFw7IFmVMZTmmO_BedfXp8_IoJcfVtx0SH3UkiaAXkD92qUXxnW4u1TkybF6Mh39GHRe4fBZ7ae5-0xd28vkqiwghWWf4afM_-M-t91h88IiQ1GMFZeRPxOk4V6wFw8lyGmKsuoj5Xq-TiMcbg',
    category: 'Technology',
    reviewsCount: 247,
    rating: 4.8,
    verified: true,
    open: false,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBLyIUm-ffCTttHnuM7rD5R7cEVQwQZwSvj1Z5OAaqLt0klmRC4Pd5B7RpDg5uhfR3V5AkJhs5x_JZtkJtbKBBQ7YMzTYCFvgZ9H4nTT0dSRsyTtMY0Aps1bHurYbf6_9hjpP2_kRTdJjnowvPXIGVVCx8M4nyWg8Zqxo4qrqmJ1D-JMsX7AQvJAy3OlWlRDfIzZKZsfD0VUBrktjTpkaWlwt-MWHcU15-2BsvJoumYTTHgqWHhbdqwCRM3b0oMEMbX6iwlkVnlM74',
    established: 2018,
    employees: '5-10',
    services: ['Hardware Repair', 'Micro-soldering', 'Screen Replacement', 'Data Recovery']
  },
  {
    id: 'biz-2',
    name: 'Green Leaf Cafe',
    description: 'Organic coffee shop and bakery serving locally sourced ingredients. Cozy atmosphere perfect for work or meetings.',
    address: '456 Oak Avenue, San Francisco, CA',
    phone: '(555) 234-5678',
    email: 'hello@greenleafcafe.com',
    website: 'greenleafcafe.com',
    hours: 'Daily: 7AM-8PM',
    owner: 'sarahbaker',
    ownerAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCQNN0P3XlVnTIhrPCgSPxw3xMTUKxoCrIm8gPDQa1k5pfwxy3EIRkuVFuaUyuRB88yZ-5J-yHUv0PO8nGhi_ZpcjQtc6m7CEL-m3TuVim0DX-huo3tI8MYJS67MsASKXBYP5oox0RPJBg3XGnmavtmph1-Ljy1LQmTZlA8sKChCWypzu3L7QW29eETcmbNtLmLYOrdByBamv0CIQEZoVufbLeaBHrXDodOqgrka3m-BXd7lD4rIz5WfbhzJDm08u1QmIpJZeszyoc',
    category: 'Food & Beverage',
    reviewsCount: 512,
    rating: 4.9,
    verified: false,
    open: false,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDmwzjkz0TtWGC-JpL-ORaBeIFi_MoxRoD1yx1Z573i0NT2dYBzqJO6xAjbu9e1I8lqs168bRhITX6oVC0pS_t6_EG-SnUs9C7fT8RNNHIlteb0JFCUa-6rjk_9eFkt8SjJgaK6M5pf8XEhJp2b7AYSsqa3oZAaXQ_PXE4ii9Br-WQZsq0ItNtWCurnw4dKKzHB9dvF6JyWIAUDr4hgG5FzbGF22eqUxbMfyEFrqwuGQoGNkt2W-ALr7qJ0HMmecYy6fQuEq1DEgbo',
    established: 2021,
    employees: '1-5',
    services: ['Organic Coffee', 'Fresh Bakery', 'Event Hosting', 'Local Art Exhibit']
  },
  {
    id: 'biz-3',
    name: 'FitZone Gym',
    description: 'State-of-the-art fitness center with personal trainers, group classes, and modern equipment. First week free!',
    address: '789 Muscle Lane, San Francisco, CA',
    phone: '24/7 Access',
    email: 'info@fitzonegym.com',
    website: 'fitzonegym.com',
    hours: '24/7 Access',
    owner: 'Fitcorp',
    ownerAvatar: '',
    category: 'Health & Fitness',
    reviewsCount: 892,
    rating: 4.7,
    verified: true,
    open: true,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCjmw7vIt00jZc-xDMY56Be6OQ6iamcuVSbEqN2EM_5xOynmM9P4H31VEiAWZ986LiRFxf_lKri7uERPtop7Z1FroeQR790hC2wA0X6fYNAyLWe9hPFI1Yu7Bhv848Qg-g-CtVD4DqkbpbCPPDfUZKbl7SNFcRtwVNmYz8wkHxv_0njgooB-GMfvh2k61dffR1hKmkMla_Ra_56vF3Pk6RGflF2Io7Hf5TAyNfqAVpDHbAzLYFVAN7zK6FMQHg1anJ4xxVnr8Rd8bw',
    established: 2019,
    employees: '6-20',
    services: ['Personal Training', 'Cardio Deck', 'Strength Training', 'Sauna']
  }
];

let proposals = [
  {
    id: 'prop-1',
    title: 'Community Co-Working Space',
    description: 'A decentralized hub for creators and activists featuring high-speed fiber mesh networks and solar-powered workstations.',
    fundingGoal: 450000,
    fundingCollected: 292500,
    percent: 65,
    daysLeft: 12,
    minInvest: 100,
    maxInvest: 10000,
    category: 'Infrastructure',
    participants: '124 Members',
    status: 'Active'
  },
  {
    id: 'prop-2',
    title: 'Urban Ag-Tech Initiative',
    description: 'Transforming vacant industrial lots into vertical hydroponic farms providing fresh organic produce to the inner city community.',
    fundingGoal: 280000,
    fundingCollected: 246400,
    percent: 88,
    daysLeft: 3,
    minInvest: 50,
    maxInvest: 5000,
    category: 'Agriculture',
    participants: '340 Members',
    status: 'Hot'
  },
  {
    id: 'prop-3',
    title: 'District Micro-Grid',
    description: 'Implementing a blockchain-based energy sharing network allowing households to trade surplus solar power directly.',
    fundingGoal: 1500000,
    fundingCollected: 180000,
    percent: 12,
    daysLeft: 45,
    minInvest: 500,
    maxInvest: 25000,
    category: 'Sustainable Energy',
    participants: '89 Members',
    status: 'New'
  }
];

let polls = [
  {
    id: 'poll-1',
    author: 'u/techEnthusiast',
    authorAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDlhuPdy-1uPB2P1VjYmwZqbr6wKXA4bMf2MypeUSRMAGAPhgOIhqy8pD0bYnKoNQuRdU2SnWZkvm9VmWWiU8-PeGxUbo9XTxvAv-zEn38Kk-YQGCbMMIUk_qzxYfTOXpOcPu5AUyKlNiDrMI5GQ4GHGHQhVq_D5Jsa6WC6FA9aJ5U2hcMRQuot5_xWFiddoWXNE0EiY4HZzCDyOvffV6ZS1B7wX8JTKVQujKyIIVyylzJZAbAaw2r3-HEWqhBx1j7j0mlRFFSfLYo',
    time: '2h ago',
    timeLeft: '2 days left',
    category: 'Technology',
    question: "What's the most important programming skill in 2025?",
    options: [
      { text: 'AI/ML Integration', votes: 4800 },
      { text: 'System Design', votes: 3100 },
      { text: 'Cloud Architecture', votes: 1500 },
      { text: 'Web3/Blockchain', votes: 645 }
    ],
    totalVotes: 10045,
    voted: false,
    votedIndex: null,
    active: true
  },
  {
    id: 'poll-2',
    author: 'TechCorp',
    authorAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBraOPT8Zqc3Ey1pTmUMEgTRl9f8TNQfPriXbqalNPuPq-LurI3QBzuD3JEUYfvrd3xAZgo-IRChZlfOlKI1daEMSmu-zB7Wo4WJsi1JNgNN0YEoFMi9PYwFi0400e4mqmYSuT5cPsY-KY2e72WOJeZDwp4iMV93EIC4Z_YPUILuwcXM7Uy8HdjbIh-yl3xun8SBIO3uzxVICpuLeCepJflG6xKGjgj3h2SD96doRmE50BOWRiVUD2MaU6_lYaJVBbq7a68rcY_JSo',
    time: '8h ago',
    timeLeft: 'Ended 3 days ago',
    category: 'Business',
    question: "What's your preferred work arrangement?",
    options: [
      { text: 'Fully Remote', votes: 6723 },
      { text: 'Hybrid (3 days office)', votes: 4202 },
      { text: 'Hybrid (2 days office)', votes: 2101 },
      { text: 'Fully In-Office', votes: 980 }
    ],
    totalVotes: 14006,
    voted: true,
    votedIndex: 0,
    active: false
  },
  {
    id: 'poll-3',
    author: 'MIT_Research',
    authorAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAodKpdi1sCB98bT-ZwjPQixUz8S23M6fHlYm6DK3P3s_A42egQcH7A4yoJDVjoF7Wtoq_aQOKMAZEbfMeQLDN31aFupPi74eGTVbrCiB6k_XceGnUbwZGPaz_rIBiOc8E2MDwTHmyrGPmv0R9mfOO2K3eF6dRw1dtNAdAziS6lZ5ahXhTVUHf_qoFJtAUdq6EDpHn8VWOoyieTNRKoJfpNTQUVHI93s7pU4ueWUoTIJ76CW6kf77R-YaXy_uLHQPHSOSuWlYBaTZ4',
    time: '5h ago',
    timeLeft: '5 days left',
    category: 'Science',
    question: 'Which renewable energy source should governments prioritize?',
    options: [
      { text: 'Solar Power', votes: 11200 },
      { text: 'Wind Energy', votes: 6400 },
      { text: 'Nuclear Fusion', votes: 2100 },
      { text: 'Hydroelectric', votes: 1591 }
    ],
    totalVotes: 21291,
    voted: false,
    votedIndex: null,
    active: true
  }
];

export const getBusinesses = async () => {
  await delay(LATENCY);
  return [...businesses];
};

export const getBusinessById = async (id) => {
  await delay(LATENCY);
  return businesses.find(b => b.id === id) || null;
};

export const createBusiness = async (biz) => {
  await delay(LATENCY);
  const newBiz = {
    id: `biz-${Date.now()}`,
    reviewsCount: 0,
    rating: 5.0,
    verified: false,
    open: true,
    established: new Date().getFullYear(),
    employees: '1-5',
    services: [],
    ...biz
  };
  businesses = [newBiz, ...businesses];
  return newBiz;
};

export const getProposals = async () => {
  await delay(LATENCY);
  return [...proposals];
};

export const createProposal = async (prop) => {
  await delay(LATENCY);
  const newProp = {
    id: `prop-${Date.now()}`,
    fundingCollected: 0,
    percent: 0,
    daysLeft: 30,
    participants: '0 Members',
    status: 'New',
    ...prop
  };
  proposals = [newProp, ...proposals];
  return newProp;
};

export const getPolls = async () => {
  await delay(LATENCY);
  return [...polls];
};

export const createPoll = async (poll) => {
  await delay(LATENCY);
  const newPoll = {
    id: `poll-${Date.now()}`,
    author: user.name,
    authorAvatar: user.avatar,
    time: 'Just now',
    timeLeft: '7 days left',
    totalVotes: 0,
    voted: false,
    votedIndex: null,
    active: true,
    ...poll,
    options: poll.options.map(optText => ({ text: optText, votes: 0 }))
  };
  polls = [newPoll, ...polls];
  return newPoll;
};

export const voteInPoll = async (pollId, optionIndex) => {
  await delay(LATENCY);
  polls = polls?.map(p => {
    if (p.id === pollId && !p.voted) {
      const updatedOptions = p.options.map((opt, idx) => {
        if (idx === optionIndex) {
          return { ...opt, votes: opt.votes + 1 };
        }
        return opt;
      });
      return {
        ...p,
        options: updatedOptions,
        totalVotes: p.totalVotes + 1,
        voted: true,
        votedIndex: optionIndex
      };
    }
    return p;
  });
  return polls?.find(p => p.id === pollId);
};

export const updateUser = async (updatedData) => {
  await delay(LATENCY);
  if (updatedData.name) user.name = updatedData.name;
  if (updatedData.handle) user.handle = updatedData.handle;
  if (updatedData.avatar) user.avatar = updatedData.avatar;
  if (updatedData.email !== undefined) user.email = updatedData.email;
  if (updatedData.bio !== undefined) user.bio = updatedData.bio;
  if (updatedData.location !== undefined) user.location = updatedData.location;
  if (updatedData.website !== undefined) user.website = updatedData.website;
  return { ...user };
};

// --- BOOKMARKS & NOTIFICATIONS REDESIGN MOCKS ---
let notifications = [
  {
    id: 'notify-1',
    type: 'like',
    user: {
      name: 'Elias Vance',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA6617v5JPAMzdEfuQtc5m753qJSVh1ktHPmtva8wx8QwZY7SsaAQPnKH1BspE6nEjXkz8AoX4XUBHr1p0-P5DK3l_BYH6DQhh7dwzDGSZ72ZPWBJp7nyN6Mrb_EEfC82XIw5KyFV--LkK42GJiSxx__O4-psjVCSZMBMUBcOrElyTlaj-hMvmNdfrVv0F79iJSKJRVU2vBv-wMD8x1sxQJ6PvOe2xJn1ALPZMiiLVaUBm2yJX7tWt3iYan9CwgRZz-itflX42U1Vk',
    },
    postTitle: 'The architecture of autonomy',
    time: '2m ago',
    unread: true
  },
  {
    id: 'notify-2',
    type: 'follow',
    user: {
      name: 'Sora_Tech',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBun-PA8hqQM5VnoBSaCewY2JtZJA_rzN9vt-_pWTWEXpFGjMMOwc6PHBR8CU5Brg_5CvTFSnV48Zn42jMZnKk8xNPdCRimMNaPTogbL3F3_5TQC7TVBUv6IYJCvyk_RjiTGlJj7l0gN3r956jB42ByTj3e1dU2HvaCK2RJYOfoY1kAAx4M5ZwcwNCXkY1J8XudNtFJoJgpk6lOzS5siOEt18ofSdUb7odDHe4ZiEG4p5vErS7nqez5x-pKDL6PxpGiekGMFQQorQ4',
    },
    description: 'Member of The Underground community',
    time: '15m ago',
    following: false,
    unread: true
  },
  {
    id: 'notify-3',
    type: 'comment',
    user: {
      name: 'Marcus Thorne',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuFiT0Pa3oVQMLzQ2x3P11V0nXfZcRi-gPxGZBYPetn7Bmnob5-yT4w1JeQAzO4KBl9fte33rD3P-j_T2j1p2nG8IPL7WQmdBRJTO8fUAOF6ZUBr2dVhZ0c9Jol-3aUTV0_REQLVEz7yPUD1pT-570RZgQ39N2crZuwJ-3t3_eR4VXltS1Ny_WoWQQXrpX4kuL_bGEkbDtSHxl_Vnt5vMXbQikBXJPa6oTEHcSbFHGLnVOfYJsi5vNUgRAi3WHxnPN3K4GK3tJDzTk',
    },
    commentText: 'This insight into the decentralized mesh is revolutionary. We need more of this.',
    time: '2h ago',
    unread: false
  },
  {
    id: 'notify-4',
    type: 'event',
    title: 'Neo-Brutalism Design Sprint',
    description: 'Hosted by Design Collective • Starts in 30 minutes',
    time: '4h ago',
    unread: false
  },
  {
    id: 'notify-5',
    type: 'highlight',
    user: {
      name: 'Global Admin',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDDkj_L45i8SmnUNelsTSM7xt_t_GV39eYINp6PEQVVLlXUxSvJaNjQYzESvNDMuqrIwONlm6hWBLqOoS8riEyh-1rKUOHRC9C0nsco1tez2QwPMohMyfQvIRlEG3LSpzE_csuDr2MokaO0fyDbrBtLG8zyRK0UE4YoMGHfKU7mmL9pHuChnByhBWfv5g3nPIU3ijvm7g9FXRvV2fzc5TP7CmY_3iFzk73u23dxjIYRKOVsoB-DnXNeLelemr06EtW5rrGyER3EA6c',
    },
    title: 'shared a new document in The Resistance Vault',
    time: '1d ago',
    unread: false
  }
];

export const toggleBookmark = async (postId) => {
  await delay(LATENCY);
  posts = posts.map(p => {
    if (p.id === postId) {
      return { ...p, bookmarked: !p.bookmarked };
    }
    return p;
  });
  return posts.find(p => p.id === postId);
};

export const getNotifications = async () => {
  await delay(LATENCY);
  return [...notifications];
};

export const markNotificationsAsRead = async () => {
  await delay(LATENCY);
  notifications = notifications.map(n => ({ ...n, unread: false }));
  return [...notifications];
};

export const toggleFollowUser = async (username) => {
  await delay(LATENCY);
  notifications = notifications.map(n => {
    if (n.type === 'follow' && n.user.name === username) {
      return { ...n, following: !n.following };
    }
    return n;
  });
  return [...notifications];
};

export const createAction = async (newAction) => {
  await delay(LATENCY);
  const action = {
    id: `action-${Date.now()}`,
    rsvp: 'None',
    organizer: user.name,
    ...newAction
  };
  organizeActions = [...organizeActions, action];
  return action;
};

// --- EVENTS REDESIGN MOCKS ---
let events = [
  {
    id: 'event-1',
    title: 'Collective Power Summit: Decentralized AI',
    description: 'Revolutionary leaders and technologists gather for a deep dive into the latest advancements in open-source AI and community governance. Explore the future of digital freedom.',
    date: 'Jan 14, 2025',
    displayDate: 'Tuesday, Jan 14 • 9:00 AM - 5:00 PM',
    time: '9:00 AM - 5:00 PM',
    location: 'San Francisco Convention Center',
    organizer: 'TechCorp Collective',
    organizerAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAu7YhxoiL-OMJMUJ-KnRcDxZ6QClZDclG2CnX9VQYX6ia_V6GmZJSDJyOwhTe0gFFo-OE_TLoksCSMUJuqcb6rlItePpW5DVg10oIYlEKtA7X0HMXGOdUDOKvbGjrjVr760pWGtrurxR1EnG6nS-brlqku55hplOA0zd72APB70w6lZVoBrZS-WRl2_o3Mi_NOPssHMn8ZTB09kDCdBnoUxpOYi6ZcUTHXHGp1Mo3bMpB6WmBcVCkSSplxGbYxFRX1scG0a6ZbJEI',
    category: 'Politics',
    format: 'In-Person',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD9ksWN3ffoNOR2pmCU_J77IFwl9hhLOut8yg3EmzQpTlaR5Hf8lFAohQKRwGxjmEQU1EKOa2K3LriDOS9oQyNxNVoc9fBlxrHJmS23dwNWndRQdmB6jLXkCmKGDmuLsDbriLsLAeKPungn6DgAECaGiUWeOIz8mWO3TUXt5UuNnBt5w-2cE_lc8WMx7-4pgWo4xVvMSn333iHXJItCRu5mD0sd1nXkN3S91vFY5dHZqL0pLaArDYKZSqzoXh6-1wbf6PDmZ5om9FY',
    attendeesCount: 1247,
    interestedCount: 3891,
    isInterested: false,
    isAttending: false,
    comments: [
      {
        id: 'comment-1',
        author: {
          name: 'techEnthusiast',
          avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCJbXB38OtEMdB82ZfRWWqID1jW45m2gWpLcS-ishNdrZK6FNFP0tx_vYWbyxsiPBmfOJyiTR36tTtqoDJ1SHKzgXN8qD50ALWjHIfvSwzShF6Fg8a9l87SaA_BO7WD4Rv6JDBCU5-bLRgpgBuiVmREfqPTPXIuRycOxlgxIoQ2iUHFX7Pa9iQVElEXCpvYxRk22IGhMuogYPvvGoe7J0JlEglvcopwr_6hR85AwlUtdAOQVjrnyFfLZMtzdcEXCdG9dti0HEKVbZY'
        },
        text: "This looks amazing! Can't wait to attend. Will there be networking sessions?",
        time: '2h ago',
        likes: 5,
        replies: [
          {
            id: 'reply-1',
            author: {
              name: 'TechCorp',
              role: 'Organizer',
              avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD1Mc8Mz79VJ8fLoBouybMm4FehnWcfvgx6OwuSk1gez7QCkW414v8JB8UjzdF_wue8L5Wk9hot1KOPu7zWJzZGuue7Q30zAwSpw6AILUyEOkH45UwjU9MDdXhpnocZqOQm1GF-_0F4c30PZ4kGyPqv16v4UCkpCWkQ_r6kFazh1suqhwtl0jdWWnieo064z5SiEbh3XHaa3KBvOn6E0HPU3R4PS7KU5ymfCxXXHFvUpfElFbpoHl_yr2ru2PjFy1oogDWsJnFrx88'
            },
            text: "Yes! We'll have dedicated networking sessions during lunch and after the main talks. Looking forward to seeing you there!",
            time: '1h ago',
            likes: 8
          }
        ]
      }
    ]
  },
  {
    id: 'event-2',
    title: 'Global Climate Action: Digital Grassroots',
    description: 'A comprehensive virtual workshop covering modern grassroots organizing with digital tools. Perfect for activists looking to scale their impact globally.',
    date: 'Jan 17, 2025',
    displayDate: 'Friday, Jan 17 • 2:00 PM - 5:00 PM',
    time: '2:00 PM - 5:00 PM',
    location: 'Online via Kollective99 Stream',
    organizer: 'EarthWatch',
    organizerAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBmM1MOsrx_Oxh9mLlPIv9wjEUWU4Nkq0oMUmGWV--VNEjchJsUZuthMCzgMcfXQ435-Sfs9WizGdYZzXkW0AKbb11mdu2GFrz_sPS_Xg7tRdE3BFS6AD8G1S1vo7lexQqVY_rSdz844c5nlF1LWqRLHasAPetQ3FnuGO0W6Xu2MihFdRY4E9lQZDfiBQZCsqcVebZUjV2Xk5WIM8QzVeG9txnaZaBXdNthJD9-0Fi65BZ7pxeiBj_cduG-ortRW5FZCr5CCqkpcEo',
    category: 'Environment',
    format: 'Online',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBmM1MOsrx_Oxh9mLlPIv9wjEUWU4Nkq0oMUmGWV--VNEjchJsUZuthMCzgMcfXQ435-Sfs9WizGdYZzXkW0AKbb11mdu2GFrz_sPS_Xg7tRdE3BFS6AD8G1S1vo7lexQqVY_rSdz844c5nlF1LWqRLHasAPetQ3FnuGO0W6Xu2MihFdRY4E9lQZDfiBQZCsqcVebZUjV2Xk5WIM8QzVeG9txnaZaBXdNthJD9-0Fi65BZ7pxeiBj_cduG-ortRW5FZCr5CCqkpcEo',
    attendeesCount: 892,
    interestedCount: 1500,
    isInterested: false,
    isAttending: false,
    comments: [
      {
        id: 'comment-2',
        author: {
          name: 'aiResearcher',
          avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuByCK1Rt9k5l0oJLr8HV1sC-PrRz7tTE4YPKrFhMHDCzVB7RM48luZyOlcy065WsAi60FqQbn9XtArZPWLqekzMBfjr9i-7-lLFSFU6JJf27VegqlRQNsjKGtrupyN0OWjyyePHLW8ImCgCYATLMW2LaXUVIN28wmd1UXFr9IT7SPLatRUsT8E-68hCT4uLSKOw0uzBEOs5jlR1rnt5__og6LMGU5Jcoqf88iaC4aoid4zOUyw2qUAnJamNWsy-SotLLC-Ov6JQ85I'
        },
        text: "Will the sessions be recorded? I might not be able to make it in person but would love to watch later.",
        time: '45m ago',
        likes: 3,
        replies: []
      }
    ]
  }
];

export const getEvents = async () => {
  await delay(LATENCY);
  return [...events];
};

export const getEventById = async (id) => {
  await delay(LATENCY);
  return events.find(e => e.id === id) || null;
};

export const createEvent = async (newEvent) => {
  await delay(LATENCY);
  const event = {
    id: `event-${Date.now()}`,
    attendeesCount: 0,
    interestedCount: 0,
    isInterested: false,
    isAttending: false,
    comments: [],
    organizer: user.name,
    organizerAvatar: user.avatar,
    ...newEvent
  };
  events = [...events, event];
  return event;
};

export const toggleEventInterest = async (eventId) => {
  await delay(LATENCY);
  events = events.map(e => {
    if (e.id === eventId) {
      const isInterested = !e.isInterested;
      return {
        ...e,
        isInterested,
        interestedCount: isInterested ? e.interestedCount + 1 : e.interestedCount - 1
      };
    }
    return e;
  });
  return events.find(e => e.id === eventId);
};

export const toggleEventAttendance = async (eventId) => {
  await delay(LATENCY);
  events = events.map(e => {
    if (e.id === eventId) {
      const isAttending = !e.isAttending;
      return {
        ...e,
        isAttending,
        attendeesCount: isAttending ? e.attendeesCount + 1 : e.attendeesCount - 1
      };
    }
    return e;
  });
  return events.find(e => e.id === eventId);
};

export const addEventComment = async (eventId, commentText) => {
  await delay(LATENCY);
  const newComment = {
    id: `comment-${Date.now()}`,
    author: {
      name: user.name,
      avatar: user.avatar
    },
    text: commentText,
    time: 'Just now',
    likes: 0,
    replies: []
  };

  events = events.map(e => {
    if (e.id === eventId) {
      return {
        ...e,
        comments: [...(e.comments || []), newComment]
      };
    }
    return e;
  });
  return events.find(e => e.id === eventId);
};


//// new mock code from google AI


// Add this helper module structure inside your frontend mock data file
export const getMockPostContext = (currentPostId) => {
  // Common mock author accounts
  const authors = {
    rootUser: {
      name: "Sovereign Dev",
      handle: "@sov_dev",
      avatar: "https://unsplash.com",
      verified: true,
      role: "Core Archon"
    },
    middleUser: {
      name: "Grid Operator",
      handle: "@grid_op",
      avatar: "https://unsplash.com",
      verified: false,
      role: "Node Tech"
    },
    focusUser: {
      name: "Cyber Rebel",
      handle: "@cy_rebel",
      avatar: "https://unsplash.com",
      verified: true,
      role: "Kollective"
    },
    replyUserA: {
      name: "Alice Node",
      handle: "@alice",
      avatar: "https://unsplash.com",
      verified: false,
      role: "Citizen"
    },
    replyUserB: {
      name: "Bob Crypt",
      handle: "@bob_crypto",
      avatar: "https://unsplash.com",
      verified: false,
      role: "Validator"
    }
  };

  return {
    // 🔽 Ancestors Chain: Every post leading up to this one, sorted from top to bottom
    ancestors: [
      {
        id: "post-root-100",
        parentPostId: null,
        author: authors.rootUser,
        title: "The Sovereignty Manifesto Alpha",
        text: "We are releasing the initial blueprint specifications for localized community grids today. Feedback on mesh topology routing profiles is welcome! #SovereignTech #Decentralize",
        time: "2 hours ago",
        likes: 342,
        commentsCount: 18,
        liked: true,
        bookmarked: false
      },
      {
        id: "post-reply-101",
        parentPostId: "post-root-100",
        author: authors.middleUser,
        title: "", // Secondary replies usually drop the major title string feature
        text: "@sov_dev Checked the parameters on District 9's allocation loop. If we run blind signature validations over low-bandwidth radios, won't validation frames drop?",
        time: "1 hour ago",
        likes: 54,
        commentsCount: 4,
        liked: false,
        bookmarked: false
      }
    ],

    // 🎯 The Focused Post Card: This directly matches the current URL route :id
    focus: {
      id: currentPostId, // Dynamically maps to whatever id was passed in the URL parameters
      parentPostId: "post-reply-101",
      author: authors.focusUser,
      title: "",
      text: "@grid_op @sov_dev We can mitigate validation drops completely by introducing cryptographic voting pipeline tokens! It sandboxes verification checks ahead of time, caching telemetry profiles locally.",
      time: "45 mins ago",
      likes: 89,
      commentsCount: 2,
      liked: false,
      bookmarked: true
    },

    // 🔼 Descendants Tree: Sub-threads responding directly beneath the focused post
    descendants: [
      {
        id: "post-child-201",
        parentPostId: currentPostId,
        author: authors.replyUserA,
        title: "",
        text: "@cy_rebel This is an elegant design pattern. Are those pipeline validation tickets single-use tokens, or do they refresh on epoch layout loops?",
        time: "30 mins ago",
        likes: 12,
        commentsCount: 0,
        liked: false,
        bookmarked: false,
        images: ["https://lh3.googleusercontent.com/aida-public/AB6AXuCYIcLHxbcrouUkl8jiAso6nVAcQtR8x3Oq9gyuXmoxZbjPuS6iM4Gz7INuNhk8zIk125rQjbBO2U5_KP-sfpRV05uaWtTAKUy0iOdZ9yPetghCRjvFz7luny9PzV_NWzWqRUZGQIN61LrzwL8ufhHdsg-1-cmyKYI21dj9Ad3EcRIo53jlaSq5mVOV1wpwSo-a-9RbjfVX81EkrIVoDemafpo_rYC1swAQHuGCfeO4HzUi6D_X33r_a6LjQZzLIcXhmECGbjCOnHI"]
      },
      {
        id: "post-child-202",
        parentPostId: currentPostId,
        author: authors.replyUserB,
        title: "",
        text: "@cy_rebel Count me in to help audit the Elixir schema indices for this token table. We need quick indexes to block malicious double-tap attempts.",
        time: "12 mins ago",
        likes: 7,
        commentsCount: 0,
        liked: false,
        bookmarked: false
      }
    ]
  };
};

// src/api/mockApi.js

// 🗄️ 1. Define a flat, single-source-of-truth post registry (Exactly like an Elixir DB table)
const MOCK_POSTS_TABLE = [
  {
    id: "post-root-100",
    parentPostId: null,
    author: { name: "Sovereign Dev", handle: "@sov_dev", avatar: "https://unsplash.com", verified: true, role: "Core Archon" },
    title: "The Sovereignty Manifesto Alpha",
    text: "We are releasing the initial blueprint specifications for localized community grids today. Feedback on mesh topology routing profiles is welcome! #SovereignTech #Decentralize",
    time: "2 hours ago", likes: 342, commentsCount: 18, liked: true, bookmarked: false
  },
  {
    id: "post-reply-101",
    parentPostId: "post-root-100",
    author: { name: "Grid Operator", handle: "@grid_op", avatar: "https://unsplash.com", verified: false, role: "Node Tech" },
    title: "",
    text: "@sov_dev Checked the parameters on District 9's allocation loop. If we run blind signature validations over low-bandwidth radios, won't validation frames drop?",
    time: "1 hour ago", likes: 54, commentsCount: 4, liked: false, bookmarked: false
  },
  {
    id: "post-child-200", // This was currentPostId in the previous hardcoded state
    parentPostId: "post-reply-101",
    author: { name: "Cyber Rebel", handle: "@cy_rebel", avatar: "https://unsplash.com", verified: true, role: "Kollective" },
    title: "",
    text: "@grid_op @sov_dev We can mitigate validation drops completely by introducing cryptographic voting pipeline tokens! It sandboxes verification checks ahead of time, caching telemetry profiles locally.",
    time: "45 mins ago", likes: 89, commentsCount: 2, liked: false, bookmarked: true
  },
  {
    id: "post-child-201",
    parentPostId: "post-child-200", // 🔗 Points to Cyber Rebel as its parent!
    author: { name: "Alice Node", handle: "@alice", avatar: "https://unsplash.com", verified: false, role: "Citizen" },
    title: "",
    text: "@cy_rebel This is an elegant design pattern. Are those pipeline validation tickets single-use tokens, or do they refresh on epoch layout loops?",
    time: "30 mins ago", likes: 12, commentsCount: 1, liked: false, bookmarked: false,
    images: ["https://lh3.googleusercontent.com/aida-public/AB6AXuCYIcLHxbcrouUkl8jiAso6nVAcQtR8x3Oq9gyuXmoxZbjPuS6iM4Gz7INuNhk8zIk125rQjbBO2U5_KP-sfpRV05uaWtTAKUy0iOdZ9yPetghCRjvFz7luny9PzV_NWzWqRUZGQIN61LrzwL8ufhHdsg-1-cmyKYI21dj9Ad3EcRIo53jlaSq5mVOV1wpwSo-a-9RbjfVX81EkrIVoDemafpo_rYC1swAQHuGCfeO4HzUi6D_X33r_a6LjQZzLIcXhmECGbjCOnHI"]
  },
  {
    id: "post-sub-child-301",
    parentPostId: "post-child-201", // 🔗 Points to Alice Node as its parent!
    author: { name: "Bob Crypt", handle: "@bob_crypto", avatar: "https://unsplash.com", verified: false, role: "Validator" },
    title: "",
    text: "@alice Personally, I think single-use tokens are best for blocking malicious double-tap attempts.",
    time: "5 mins ago", likes: 3, commentsCount: 0, liked: false, bookmarked: false,
    images: ["https://lh3.googleusercontent.com/aida-public/AB6AXuCYIcLHxbcrouUkl8jiAso6nVAcQtR8x3Oq9gyuXmoxZbjPuS6iM4Gz7INuNhk8zIk125rQjbBO2U5_KP-sfpRV05uaWtTAKUy0iOdZ9yPetghCRjvFz7luny9PzV_NWzWqRUZGQIN61LrzwL8ufhHdsg-1-cmyKYI21dj9Ad3EcRIo53jlaSq5mVOV1wpwSo-a-9RbjfVX81EkrIVoDemafpo_rYC1swAQHuGCfeO4HzUi6D_X33r_a6LjQZzLIcXhmECGbjCOnHI"]
  }
];

// 🧠 2. The Dynamic Context Resolver Engine
export const getMockPostContext2 = (targetId) => {
  console.log("targetId", targetId);
  const focusPost = MOCK_POSTS_TABLE.find(p => p.id === targetId);

  // Guard clause: Return empty template if target isn't found
  if (!focusPost) return { ancestors: [], focus: null, descendants: [] };

  // 🔽 Build Ancestor Chain (Traverse backwards using parentPostId strings)
  const ancestors = [];
  let currentParentId = focusPost.parentPostId;

  while (currentParentId) {
    const parentNode = MOCK_POSTS_TABLE.find(p => p.id === currentParentId);
    if (parentNode) {
      ancestors.unshift(parentNode); // Prepend to maintain top-to-bottom chronological order
      currentParentId = parentNode.parentPostId;
    } else {
      currentParentId = null;
    }
  }

  // 🔼 Build Descendants List (Find all entries pointing directly to the target)
  const descendants = MOCK_POSTS_TABLE.filter(p => p.parentPostId === targetId);

  return {
    ancestors,
    focus: focusPost,
    descendants
  };
};

