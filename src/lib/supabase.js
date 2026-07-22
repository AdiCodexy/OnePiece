import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// If credentials exist, initialize supabase, else null
export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Fallback mock data in case Supabase credentials aren't provided yet
export const mockMembers = [
  {
    id: 1,
    name: 'LUFFY',
    bio: 'Future King of the Pirates and captain of the Straw Hat crew. Driven by an insatiable appetite for adventure (and meat).',
    hobbies: 'Eating, Adventuring, Sleeping',
    subjects: 'Leadership, Brawling',
    image_filename: 'Luffy.jpg',
    banner_filename: null
  },
  {
    id: 2,
    name: 'ZORO',
    bio: 'Master of the Three-Sword Style. His ultimate goal is to become the greatest swordsman in the world, though his sense of direction needs work.',
    hobbies: 'Training, Drinking, Getting lost',
    subjects: 'Swordsmanship, Navigation (Failed)',
    image_filename: 'Zoro.jpg',
    banner_filename: null
  },
  {
    id: 3,
    name: 'YAMATO',
    bio: 'Self-proclaimed Oden, fighting for the liberation of Wano Country. Extremely powerful and carries a legendary kanabo.',
    hobbies: 'Journaling, Combat Training',
    subjects: 'Wano History, Mythology',
    image_filename: 'Yamato.jpg',
    banner_filename: null
  },
  {
    id: 4,
    name: 'CARROT',
    bio: 'A member of the Mink Tribe. Highly agile and possesses Electro, she is always ready to bounce into action and aid her friends.',
    hobbies: 'Jumping, Chewing carrots',
    subjects: 'Reconnaissance, Electro combat',
    image_filename: 'Carrot.jpg',
    banner_filename: null
  },
  {
    id: 5,
    name: 'GUNKO',
    bio: 'A highly skilled operative working in the shadows. Known for their precise aim and tactical brilliance in the field.',
    hobbies: 'Marksmanship, Strategy games',
    subjects: 'Ballistics, Tactics',
    image_filename: 'Gunko.jpg',
    fleet_id: null,
    banner_filename: null
  },
  {
    id: 6,
    name: 'ARLONG',
    bio: 'Captain of the Arlong Pirates. Believes fish-men are the supreme race. Has a terrifying bite and uses a massive saw sword.',
    hobbies: 'Extortion, Swimming, Plotting',
    subjects: 'Fish-man Karate, Naval Strategy',
    image_filename: 'Arlong.jpg',
    banner_filename: null
  },
  {
    id: 7,
    name: 'BECKMAN',
    bio: 'First Mate of the Red Hair Pirates. Extremely intelligent and level-headed. His mere presence is enough to intimidate an Admiral.',
    hobbies: 'Smoking, Strategy, Drinking',
    subjects: 'Marksmanship, Observation Haki',
    image_filename: 'Beckman.jpg',
    banner_filename: null
  },
  {
    id: 8,
    name: 'DRAGON',
    bio: "Supreme Commander of the Revolutionary Army and the world's worst criminal. Shrouded in mystery and always accompanied by fierce winds.",
    hobbies: 'Looking East, Revolution',
    subjects: 'Geopolitics, Advanced Haki',
    image_filename: 'Dragon.jpg',
    banner_filename: null
  },
  {
    id: 9,
    name: 'SHANKS',
    bio: "One of the Four Emperors of the Sea. Known for his overwhelming Conqueror's Haki and his role in inspiring the next generation.",
    hobbies: 'Partying, Sleeping, Peacekeeping',
    subjects: "Conqueror's Haki, Swordsmanship",
    image_filename: 'Shanks.jpg',
    banner_filename: null
  },
  {
    id: 10,
    name: 'DOFLAMINGO',
    bio: "Former Warlord of the Sea and underworld broker 'Joker'. Manipulates people like puppets using his String-String Fruit.",
    hobbies: 'Puppeteering, Laughing, Business',
    subjects: 'Underworld Economics, Awakening',
    image_filename: 'Doflamingo.jpg',
    banner_filename: null
  },
  {
    id: 11,
    name: 'GAIMON',
    bio: 'A former pirate who has lived trapped inside a treasure chest on the Island of Rare Animals for decades.',
    hobbies: 'Protecting Animals, Waiting',
    subjects: 'Island Ecology, Marksmanship',
    image_filename: 'GAIMON.jpg',
    banner_filename: null
  },
  {
    id: 12,
    name: 'KOBY',
    bio: 'Marine Captain and member of SWORD. Started as a chore boy but trained intensely under Garp to become a hero.',
    hobbies: 'Training, Justice, Swimming',
    subjects: 'Rokushiki, Observation Haki',
    image_filename: 'Koby.jpg',
    banner_filename: null
  }
];

export const mockFleets = [
  {
    id: 1,
    name: 'Straw Hat Fleet',
    description: 'The legendary crew led by Monkey D. Luffy. Known for their unpredictable actions and fierce loyalty.',
    image_filename: 'Pirates1.jpg'
  },
  {
    id: 2,
    name: 'Heart Pirates',
    description: 'A notorious crew originating from the North Blue, captained by the "Surgeon of Death", Trafalgar Law.',
    image_filename: 'Pirates2.jpg'
  },
  {
    id: 3,
    name: 'Kid Pirates',
    description: 'A heavy metal-themed pirate crew led by Eustass "Captain" Kid. They are known for causing massive collateral damage.',
    image_filename: 'pirates3.jpg'
  },
  {
    id: 4,
    name: 'Red Hair Pirates',
    description: 'An infamous and powerful pirate crew ruling in the New World, led by Red-Haired Shanks.',
    image_filename: 'Pirates4.jpg'
  }
];

export async function fetchFleets() {
  if (supabase) {
    const { data, error } = await supabase.from('fleets').select('*');
    if (error) {
      console.error('Error fetching fleets:', error);
      return [];
    }
    return data;
  }
  return mockFleets;
}

export async function joinFleet(memberId, fleetId) {
  if (supabase) {
    const { error } = await supabase
      .from('members')
      .update({ fleet_id: fleetId })
      .eq('id', memberId);
    if (error) throw error;
  } else {
    const member = mockMembers.find(m => m.id === memberId);
    if (member) member.fleet_id = fleetId;
  }
}

export async function updateMemberProfile(memberId, bio, bannerFilename) {
  if (supabase) {
    const { error } = await supabase
      .from('members')
      .update({ bio, banner_filename: bannerFilename })
      .eq('id', memberId);
    if (error) throw error;
  } else {
    const member = mockMembers.find(m => m.id === memberId);
    if (member) {
      member.bio = bio;
      member.banner_filename = bannerFilename;
    }
  }
}

export async function fetchMembers() {
  if (supabase) {
    const { data, error } = await supabase.from('members').select('*');
    if (error) {
      console.error('Error fetching members from Supabase:', error);
      return [];
    }
    return data;
  } else {
    return mockMembers;
  }
}

// Memory stores for local mock testing
let mockGoals = {
  1: 5, // Luffy wants 5 hours
  2: 6, // Zoro wants 6 hours
  3: 4,
  4: 3,
  5: 5
};

// Simple date string formatter (YYYY-MM-DD)
export const getTodayDateStr = () => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().split('T')[0];
};

const getDaysAgoStr = (days) => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().split('T')[0];
};

let mockDailyLogs = [
  // pre-populate some data for Luffy (id: 1) and Zoro (id: 2)
  { member_id: 1, date: getDaysAgoStr(1), hours: 6, goal_met: true, notes: '- Navigation basics\n- Leadership skills\n- Advanced meat eating' },
  { member_id: 1, date: getDaysAgoStr(2), hours: 5, goal_met: true, notes: '- Meat eating competition strategies' },
  { member_id: 1, date: getTodayDateStr(), hours: 8, goal_met: true, notes: '- Haki training\n- Gear 5 visualization\n- Pirate King philosophy' },
  { member_id: 2, date: getDaysAgoStr(1), hours: 7, goal_met: true, notes: '- Sword training' },
  { member_id: 3, date: getDaysAgoStr(1), hours: 2, goal_met: false, notes: '- Wano history' },
  // Gunko (id: 5) logged today
  { member_id: 5, date: getTodayDateStr(), hours: 5, goal_met: true, notes: '- Marksmanship drills' },
];

export async function fetchMemberGoals() {
  return { ...mockGoals };
}

export async function updateMemberGoal(memberId, newGoal) {
  mockGoals[memberId] = newGoal;
  return mockGoals[memberId];
}

export async function fetchDailyLogs() {
  return [...mockDailyLogs];
}

export async function logDailyHours(memberId, dateStr, hours, goal, notes = '') {
  const goalMet = hours >= goal;
  const existingLogIndex = mockDailyLogs.findIndex(log => log.member_id === memberId && log.date === dateStr);

  const updatedLog = { member_id: memberId, date: dateStr, hours, goal_met: goalMet, notes };

  if (existingLogIndex >= 0) {
    mockDailyLogs[existingLogIndex] = updatedLog;
  } else {
    mockDailyLogs.push(updatedLog);
  }

  return updatedLog;
}

// ----------------------------------------
// QUIZ FEATURE MOCKS
// ----------------------------------------

let mockQuizAttempts = [
  // pre-populate for Luffy
  { id: 1, member_id: 1, date: getDaysAgoStr(1), score: 6, time_taken_seconds: 45 },
  { id: 2, member_id: 1, date: getDaysAgoStr(0), score: 8, time_taken_seconds: 52 },
];

export async function getBestQuizAttempt(memberId) {
  const memberAttempts = mockQuizAttempts.filter(a => a.member_id === memberId);
  if (memberAttempts.length === 0) return null;
  // Sort by highest score, then by fastest time
  memberAttempts.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.time_taken_seconds - b.time_taken_seconds;
  });
  return memberAttempts[0];
}

export async function fetchAllQuizAttempts() {
  return [...mockQuizAttempts];
}

export async function saveQuizAttempt(memberId, score, timeTakenSeconds) {
  const newAttempt = {
    id: Date.now(),
    member_id: memberId,
    date: getTodayDateStr(),
    score,
    time_taken_seconds: timeTakenSeconds
  };
  mockQuizAttempts.push(newAttempt);
  return newAttempt;
}

export async function generateQuiz(subjects, hobbies, studyNotes) {
  if (supabase) {
    try {
      const { data, error } = await supabase.functions.invoke('generate-quiz', {
        body: { subjects, hobbies, studyNotes }
      });
      if (!error && data && Array.isArray(data)) {
        return data;
      }
    } catch (e) {
      console.warn("Failed to call Edge Function, falling back to mock data.", e);
    }
  }

  // MOCK FALLBACK (simulate API delay)
  await new Promise(resolve => setTimeout(resolve, 1500));

  return [
    {
      question: `Regarding what you recently studied: ${studyNotes.split(',')[0] || subjects.split(',')[0]} - which is most accurate?`,
      options: ["Reading a book", "Fighting enemies", "Mastering the fundamental concepts", "Sleeping all day"],
      correctIndex: 2
    },
    {
      question: `In the context of ${studyNotes.split(',').length > 1 ? studyNotes.split(',')[1] : hobbies.split(',')[0]}, what is crucial?`,
      options: ["Giving up", "Applying it to real world projects", "Running away", "Ignoring best practices"],
      correctIndex: 1
    },
    {
      question: "Which Grand Line island is known for its extreme climate?",
      options: ["Drum Island", "Water 7", "Skypiea", "Enies Lobby"],
      correctIndex: 0
    },
    {
      question: "What is the primary currency used in the One Piece world?",
      options: ["Zenny", "Beri", "Pokedollar", "Gil"],
      correctIndex: 1
    },
    {
      question: "Which Haki allows the user to sense spiritual energy?",
      options: ["Conqueror's", "Armament", "Observation", "Ryuou"],
      correctIndex: 2
    },
    {
      question: "Who holds the title of the 'World's Strongest Swordsman'?",
      options: ["Zoro", "Shanks", "Mihawk", "Vista"],
      correctIndex: 2
    },
    {
      question: "What type of Devil Fruit did Luffy eat?",
      options: ["Logia", "Paramecia", "Zoan", "Mythical Zoan"],
      correctIndex: 3
    },
    {
      question: "Which of these is NOT a member of the Worst Generation?",
      options: ["Trafalgar Law", "Eustass Kid", "Portgas D. Ace", "Jewelry Bonney"],
      correctIndex: 2
    },
    {
      question: "What is the name of Gold Roger's ship?",
      options: ["Oro Jackson", "Moby Dick", "Going Merry", "Thousand Sunny"],
      correctIndex: 0
    },
    {
      question: `Considering your recent focus on: ${studyNotes.substring(0, 30)}... what is the ultimate goal?`,
      options: ["Survival", "Absolute mastery and understanding", "Making friends", "Finding the One Piece"],
      correctIndex: 1
    }
  ];
}
