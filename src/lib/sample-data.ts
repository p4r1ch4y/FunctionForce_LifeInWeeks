// Sample data for testing the LifeWeeks application

export const sampleEvents = [
  // Career Events
  {
    title: "Started First Job",
    description: "Began my career as a software developer at a tech startup. Excited to learn and grow in the field.",
    date: "2020-06-15",
    category: "Career",
    sentiment: "positive"
  },
  {
    title: "Got Promoted",
    description: "Received a promotion to Senior Developer after demonstrating strong technical skills and leadership.",
    date: "2021-03-10",
    category: "Career",
    sentiment: "positive"
  },
  {
    title: "Changed Jobs",
    description: "Left my previous company to join a larger organization with better growth opportunities.",
    date: "2022-01-20",
    category: "Career",
    sentiment: "neutral"
  },

  // Education Events
  {
    title: "Graduated College",
    description: "Completed my Bachelor's degree in Computer Science with honors. Proud of this achievement!",
    date: "2020-05-15",
    category: "Education",
    sentiment: "positive"
  },
  {
    title: "Started Online Course",
    description: "Enrolled in a machine learning course to expand my technical skills and stay current with industry trends.",
    date: "2021-09-01",
    category: "Education",
    sentiment: "positive"
  },
  {
    title: "Failed Certification Exam",
    description: "Didn't pass the AWS certification exam on my first attempt. Need to study more and try again.",
    date: "2021-11-15",
    category: "Education",
    sentiment: "negative"
  },
  {
    title: "Passed Certification",
    description: "Successfully obtained AWS Solutions Architect certification after months of preparation!",
    date: "2022-02-28",
    category: "Education",
    sentiment: "positive"
  },

  // Personal Events
  {
    title: "Moved to New City",
    description: "Relocated to San Francisco for better career opportunities. Excited but nervous about the change.",
    date: "2020-08-01",
    category: "Personal",
    sentiment: "neutral"
  },
  {
    title: "Adopted a Pet",
    description: "Brought home a rescue dog named Max. He's brought so much joy and companionship to my life.",
    date: "2021-04-12",
    category: "Personal",
    sentiment: "positive"
  },
  {
    title: "Health Scare",
    description: "Had to go to the emergency room due to chest pain. Turned out to be anxiety, but it was scary.",
    date: "2021-07-22",
    category: "Personal",
    sentiment: "negative"
  },
  {
    title: "Started Therapy",
    description: "Began seeing a therapist to work on anxiety and stress management. Taking care of my mental health.",
    date: "2021-08-05",
    category: "Personal",
    sentiment: "positive"
  },
  {
    title: "Family Reunion",
    description: "Had a wonderful family gathering for the holidays. Great to reconnect with relatives I hadn't seen in years.",
    date: "2021-12-25",
    category: "Personal",
    sentiment: "positive"
  },
  {
    title: "Breakup",
    description: "Ended a long-term relationship. It was mutual but still emotionally difficult.",
    date: "2022-03-14",
    category: "Personal",
    sentiment: "negative"
  },

  // Travel Events
  {
    title: "Trip to Japan",
    description: "Amazing two-week vacation in Japan. Experienced incredible culture, food, and hospitality.",
    date: "2021-10-01",
    category: "Travel",
    sentiment: "positive"
  },
  {
    title: "Weekend Getaway",
    description: "Short trip to Napa Valley for wine tasting and relaxation. Perfect way to unwind from work stress.",
    date: "2022-05-20",
    category: "Travel",
    sentiment: "positive"
  },
  {
    title: "Flight Cancelled",
    description: "My vacation to Europe was ruined when flights got cancelled due to airline strikes. Very frustrating.",
    date: "2022-07-15",
    category: "Travel",
    sentiment: "negative"
  },
  {
    title: "Road Trip",
    description: "Drove along the Pacific Coast Highway with friends. Beautiful scenery and great memories made.",
    date: "2022-09-10",
    category: "Travel",
    sentiment: "positive"
  },

  // Recent Events
  {
    title: "Started Side Project",
    description: "Began working on a personal app project in my spare time. Excited to build something of my own.",
    date: "2023-01-15",
    category: "Career",
    sentiment: "positive"
  },
  {
    title: "Joined Gym",
    description: "Finally committed to getting in better shape. Started a regular workout routine and feeling great.",
    date: "2023-02-01",
    category: "Personal",
    sentiment: "positive"
  },
  {
    title: "Learned New Skill",
    description: "Completed a course in UI/UX design. Always wanted to understand the design side of development better.",
    date: "2023-04-20",
    category: "Education",
    sentiment: "positive"
  },
  {
    title: "Volunteer Work",
    description: "Started volunteering at a local animal shelter. It's rewarding to give back to the community.",
    date: "2023-06-10",
    category: "Personal",
    sentiment: "positive"
  }
];

// Function to create sample events for a user
export async function createSampleEvents(supabase: any, userId: string) {
  try {
    console.log('Creating sample events for user:', userId);
    
    const eventsToInsert = sampleEvents.map(event => ({
      ...event,
      user_id: userId,
      date: new Date(event.date).toISOString(),
    }));

    const { data, error } = await supabase
      .from('personal_events')
      .insert(eventsToInsert)
      .select();

    if (error) {
      console.error('Error creating sample events:', error);
      throw error;
    }

    console.log('Sample events created successfully:', data?.length);
    return data;
  } catch (error) {
    console.error('Failed to create sample events:', error);
    throw error;
  }
}

// Function to check if user has any events
export async function userHasEvents(supabase: any, userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('personal_events')
      .select('id')
      .eq('user_id', userId)
      .limit(1);

    if (error) {
      console.error('Error checking user events:', error);
      return false;
    }

    return data && data.length > 0;
  } catch (error) {
    console.error('Failed to check user events:', error);
    return false;
  }
}
