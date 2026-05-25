export interface UserSocials {
  website?: string;
  twitter?: string;
  linkedin?: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoUrl: string | null;
  bio: string | null;
  occupation: string | null;
  country: string | null;
  interests: string[];
  socials: UserSocials;
  bookmarks: string[];
  favourites: string[];
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileInput {
  displayName?: string;
  bio?: string | null;
  occupation?: string | null;
  country?: string | null;
  interests?: string[];
  socials?: UserSocials;
}
